<?php

use App\Models\Cart;
use App\Models\Order;
use App\Models\Product;
use App\Models\Promotion;
use App\Models\User;

function createPromoTestProduct(array $overrides = []): Product
{
    return Product::create(array_merge([
        'name' => 'Hampers Mahkota',
        'slug' => 'hampers-mahkota-'.uniqid(),
        'category' => 'Corporate Executive',
        'event_category' => 'Lebaran',
        'season_tag' => 'Ramadan 2026',
        'is_best_seller' => true,
        'short_description' => 'Hampers mewah pilihan.',
        'contents' => ['Kue Kering', 'Teh Artisan'],
        'price_from' => 500000,
        'sort_order' => 1,
        'is_active' => true,
    ], $overrides));
}

test('non admin user cannot access or mutate promotions', function () {
    $customer = User::factory()->create(['is_admin' => false, 'role' => 'customer']);
    $promotion = Promotion::create([
        'name' => 'Promo Internal',
        'apply_mode' => Promotion::MODE_AUTO,
        'discount_type' => Promotion::TYPE_PERCENTAGE,
        'discount_value' => 10,
        'scope' => Promotion::SCOPE_ALL,
        'is_active' => true,
    ]);

    $this->actingAs($customer)
        ->get(route('admin.promotions.index'))
        ->assertForbidden();

    $this->actingAs($customer)
        ->post(route('admin.promotions.store'), [
            'name' => 'Hacked Promo',
            'apply_mode' => 'auto',
            'discount_type' => 'percentage',
            'discount_value' => 50,
            'scope' => 'all',
        ])
        ->assertForbidden();

    $this->actingAs($customer)
        ->patch(route('admin.promotions.toggle', $promotion))
        ->assertForbidden();

    $this->actingAs($customer)
        ->delete(route('admin.promotions.destroy', $promotion))
        ->assertForbidden();
});

test('admin can create update toggle and delete scheduled promotions', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    $productA = createPromoTestProduct(['name' => 'Paket A']);
    $productB = createPromoTestProduct(['name' => 'Paket B']);

    $startsAt = now()->subHour()->format('Y-m-d\TH:i');
    $endsAt = now()->addDays(5)->format('Y-m-d\TH:i');

    $this->actingAs($admin)
        ->post(route('admin.promotions.store'), [
            'name' => 'Promo Ramadan 20%',
            'description' => 'Diskon khusus pilihan Ramadan',
            'badge_text' => 'RAMADAN DEAL',
            'apply_mode' => 'auto',
            'discount_type' => 'percentage',
            'discount_value' => 20,
            'max_discount_amount' => 150000,
            'scope' => 'products',
            'product_ids' => [$productA->id],
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'usage_limit' => 100,
            'is_active' => true,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $promo = Promotion::where('name', 'Promo Ramadan 20%')->firstOrFail();
    expect($promo->discount_value)->toBe(20);
    expect($promo->products()->pluck('products.id')->all())->toBe([$productA->id]);
    expect($promo->resolveStatus())->toBe('active');

    $this->actingAs($admin)
        ->put(route('admin.promotions.update', $promo), [
            'name' => 'Voucher Lebaran 25%',
            'apply_mode' => 'code',
            'code' => 'lebaran25',
            'discount_type' => 'percentage',
            'discount_value' => 25,
            'scope' => 'all',
            'starts_at' => $startsAt,
            'ends_at' => $endsAt,
            'is_active' => true,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $promo->refresh();
    expect($promo->apply_mode)->toBe('code');
    expect($promo->code)->toBe('LEBARAN25');
    expect($promo->discount_value)->toBe(25);
    expect($promo->products()->count())->toBe(0);

    $this->actingAs($admin)
        ->patch(route('admin.promotions.toggle', $promo))
        ->assertRedirect();
    expect($promo->refresh()->is_active)->toBeFalse();

    $this->actingAs($admin)
        ->get(route('admin.promotions.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/promotions/index')
            ->has('promotions', 1)
            ->has('products', 2)
        );

    $this->actingAs($admin)
        ->delete(route('admin.promotions.destroy', $promo))
        ->assertRedirect();
    expect(Promotion::count())->toBe(0);
    expect($productB->exists)->toBeTrue();
});

test('promotion converts timezone-aware ISO dates from browser to app timezone', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);
    createPromoTestProduct(['price_from' => 500000]);

    $startsIso = now('Asia/Jakarta')->subMinutes(10)->toIso8601String();
    $endsIso = now('Asia/Jakarta')->addHour()->toIso8601String();

    $this->actingAs($admin)
        ->post(route('admin.promotions.store'), [
            'name' => 'Promo WIB',
            'apply_mode' => 'auto',
            'discount_type' => 'percentage',
            'discount_value' => 25,
            'scope' => 'all',
            'starts_at' => $startsIso,
            'ends_at' => $endsIso,
            'is_active' => true,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $promo = Promotion::where('name', 'Promo WIB')->firstOrFail();
    expect($promo->resolveStatus())->toBe('active');

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('products.0.price_from', 500000)
            ->where('products.0.discounted_price', 375000)
            ->where('products.0.active_promo.discount_label', '-25%')
        );
});

test('promotion validates date range and percentage bounds', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $this->actingAs($admin)
        ->post(route('admin.promotions.store'), [
            'name' => 'Invalid Dates',
            'apply_mode' => 'auto',
            'discount_type' => 'percentage',
            'discount_value' => 100,
            'scope' => 'all',
            'starts_at' => now()->addDays(5)->format('Y-m-d\TH:i'),
            'ends_at' => now()->addDays(2)->format('Y-m-d\TH:i'),
            'is_active' => true,
        ])
        ->assertSessionHasErrors(['discount_value', 'ends_at']);
});

test('active automatic promotion applies to storefront cart and checkout while expired or scheduled promos do not', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $address = $customer->addresses()->create([
        'label' => 'Rumah',
        'recipient_name' => 'Budi',
        'recipient_phone' => '08123456789',
        'address_line' => 'Jl. Sudirman No. 1',
        'city' => 'Jakarta',
        'postal_code' => '10220',
        'is_default' => true,
    ]);

    $product = createPromoTestProduct(['price_from' => 500000]);

    // Scheduled (future) and expired promos should not apply
    Promotion::create([
        'name' => 'Belum Mulai',
        'apply_mode' => Promotion::MODE_AUTO,
        'discount_type' => Promotion::TYPE_PERCENTAGE,
        'discount_value' => 50,
        'scope' => Promotion::SCOPE_ALL,
        'starts_at' => now()->addDay(),
        'ends_at' => now()->addDays(3),
        'is_active' => true,
    ]);

    Promotion::create([
        'name' => 'Sudah Berakhir',
        'apply_mode' => Promotion::MODE_AUTO,
        'discount_type' => Promotion::TYPE_PERCENTAGE,
        'discount_value' => 40,
        'scope' => Promotion::SCOPE_ALL,
        'starts_at' => now()->subDays(5),
        'ends_at' => now()->subHour(),
        'is_active' => true,
    ]);

    // Active 20% auto promo
    Promotion::create([
        'name' => 'Diskon Aktif 20%',
        'badge_text' => 'HEMAT 20%',
        'apply_mode' => Promotion::MODE_AUTO,
        'discount_type' => Promotion::TYPE_PERCENTAGE,
        'discount_value' => 20,
        'scope' => Promotion::SCOPE_ALL,
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addHour(),
        'is_active' => true,
    ]);

    $this->get(route('catalog'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('katalog')
            ->where('products.0.price_from', 500000)
            ->where('products.0.discounted_price', 400000)
            ->where('products.0.discount_percentage', 20)
            ->where('products.0.active_promo.discount_label', '-20%')
            ->has('activePromotions', 1)
        );

    $this->actingAs($customer)
        ->post(route('cart.store'), [
            'product_id' => $product->id,
            'quantity' => 2,
        ])
        ->assertRedirect();

    $this->actingAs($customer)
        ->get(route('cart.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('summary.items_original_subtotal', 1000000)
            ->where('summary.items_discount_total', 200000)
            ->where('summary.total', 800000)
        );

    $this->actingAs($customer)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('account.index'));

    $order = Order::where('user_id', $customer->id)->with('items')->firstOrFail();
    expect((float) $order->subtotal_amount)->toBe(1000000.0);
    expect((float) $order->discount_amount)->toBe(200000.0);
    expect((float) $order->total_amount)->toBe(800000.0);
    expect((float) $order->items->firstOrFail()->unit_price)->toBe(400000.0);
});

test('voucher code promo validates min order cap and usage limit at cart and checkout', function () {
    $customer = User::factory()->create(['role' => 'customer']);
    $address = $customer->addresses()->create([
        'label' => 'Kantor',
        'recipient_name' => 'Sari',
        'recipient_phone' => '0811111111',
        'address_line' => 'Jl. Thamrin No. 5',
        'city' => 'Jakarta',
        'postal_code' => '10350',
        'is_default' => true,
    ]);

    $product = createPromoTestProduct(['price_from' => 300000]);

    $voucher = Promotion::create([
        'name' => 'Voucher VIP',
        'apply_mode' => Promotion::MODE_CODE,
        'code' => 'VIP20',
        'discount_type' => Promotion::TYPE_PERCENTAGE,
        'discount_value' => 20,
        'max_discount_amount' => 100000,
        'min_order_amount' => 500000,
        'scope' => Promotion::SCOPE_ALL,
        'starts_at' => now()->subHour(),
        'ends_at' => now()->addDay(),
        'usage_limit' => 1,
        'used_count' => 0,
        'is_active' => true,
    ]);

    $cart = Cart::create(['user_id' => $customer->id]);
    $cartItem = $cart->items()->create([
        'product_id' => $product->id,
        'is_custom_b2b' => false,
        'quantity' => 1, // 300.000 < 500.000 min_order_amount
        'unit_price' => 300000,
    ]);

    // Rejected when below min order
    $this->actingAs($customer)
        ->post(route('cart.promo.apply'), ['code' => 'vip20'])
        ->assertSessionHasErrors('promo_code');

    // Increase qty to 2 -> 600.000 >= 500.000; 20% = 120.000 capped at 100.000
    $cartItem->update(['quantity' => 2]);

    $this->actingAs($customer)
        ->post(route('cart.promo.apply'), ['code' => 'vip20'])
        ->assertSessionHasNoErrors()
        ->assertSessionHas('applied_promo_code', 'VIP20');

    $this->actingAs($customer)
        ->get(route('checkout.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('subtotal', 600000)
            ->where('promo_discount', 100000)
            ->where('total', 500000)
            ->where('applied_promotion.code', 'VIP20')
        );

    $this->actingAs($customer)
        ->post(route('checkout.store'), [
            'address_id' => $address->id,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('account.index'));

    $order = Order::where('user_id', $customer->id)->firstOrFail();
    expect($order->promo_code)->toBe('VIP20');
    expect((float) $order->discount_amount)->toBe(100000.0);
    expect((float) $order->total_amount)->toBe(500000.0);
    expect($voucher->refresh()->used_count)->toBe(1);

    // Next attempt fails because usage_limit=1 is reached
    $cart->items()->create([
        'product_id' => $product->id,
        'is_custom_b2b' => false,
        'quantity' => 2,
        'unit_price' => 300000,
    ]);

    $this->actingAs($customer)
        ->post(route('cart.promo.apply'), ['code' => 'VIP20'])
        ->assertSessionHasErrors('promo_code');
});
