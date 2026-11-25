<?php

use App\Models\LandingContent;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\LandingContentSeeder;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('non admin user cannot access landing content cms', function () {
    $user = User::factory()->create(['is_admin' => false, 'role' => 'customer']);

    $this->actingAs($user)
        ->get(route('admin.landing-content.index'))
        ->assertForbidden();
});

test('admin can update landing content and welcome page receives updated contents', function () {
    $this->seed(LandingContentSeeder::class);

    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $this->actingAs($admin)
        ->get(route('admin.landing-content.index'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('admin/landing-content')
            ->has('contents.hero')
        );

    $this->actingAs($admin)
        ->post(route('admin.landing-content.update'), [
            'contents' => [
                [
                    'section' => 'hero',
                    'key' => 'headline_line_1',
                    'value' => 'Bingkisan Eksklusif Kustom',
                    'type' => 'text',
                ],
            ],
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->where('contents.hero.headline_line_1', 'Bingkisan Eksklusif Kustom')
        );
});

test('admin can create product with event category season tag and best seller flag', function () {
    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $this->actingAs($admin)
        ->post(route('admin.products.store'), [
            'name' => 'Royal Raya Box',
            'category' => 'Seasonal & Festive',
            'event_category' => 'Lebaran',
            'season_tag' => 'Ramadan 2026',
            'is_best_seller' => true,
            'short_description' => 'Hampers lebaran eksklusif dengan kue kering premium.',
            'contents' => ['Nastar Wisman', 'Kastengel Edam'],
            'price_from' => 550000,
            'sort_order' => 1,
            'is_active' => true,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $product = Product::where('name', 'Royal Raya Box')->firstOrFail();
    expect($product->event_category)->toBe('Lebaran');
    expect($product->season_tag)->toBe('Ramadan 2026');
    expect($product->is_best_seller)->toBeTrue();

    $this->get(route('catalog'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('katalog')
            ->where('products.0.event_category', 'Lebaran')
            ->where('products.0.season_tag', 'Ramadan 2026')
            ->where('products.0.is_best_seller', true)
        );
});

test('admin can update seasonal ribbon and upload or remove hero image', function () {
    Storage::fake('public');
    $this->seed(LandingContentSeeder::class);

    $admin = User::factory()->create(['is_admin' => true, 'role' => 'admin']);

    $heroFile = UploadedFile::fake()->image('ramadan-cutout.png', 1000, 1000);

    $this->actingAs($admin)
        ->post(route('admin.landing-content.update'), [
            'contents' => [
                [
                    'section' => 'seasonal',
                    'key' => 'seasonal_ribbon_active',
                    'value' => '1',
                    'type' => 'boolean',
                ],
                [
                    'section' => 'seasonal',
                    'key' => 'seasonal_ribbon_text',
                    'value' => 'Koleksi Natal 2026 — Pesan Sekarang',
                    'type' => 'text',
                ],
                [
                    'section' => 'seasonal',
                    'key' => 'seasonal_ribbon_link',
                    'value' => '/b2b/customizer',
                    'type' => 'text',
                ],
                [
                    'section' => 'hero',
                    'key' => 'hero_season_theme',
                    'value' => 'christmas',
                    'type' => 'text',
                ],
                [
                    'section' => 'hero',
                    'key' => 'hero_season_eyebrow',
                    'value' => 'CHRISTMAS EDITION 2026',
                    'type' => 'text',
                ],
                [
                    'section' => 'hero',
                    'key' => 'hero_title',
                    'value' => 'Bingkisan Natal Penuh Keanggunan',
                    'type' => 'text',
                ],
                [
                    'section' => 'hero',
                    'key' => 'hero_cta_text',
                    'value' => 'Rangkai Bingkisan',
                    'type' => 'text',
                ],
                [
                    'section' => 'hero',
                    'key' => 'hero_cta_link',
                    'value' => '/b2b/customizer',
                    'type' => 'text',
                ],
                [
                    'section' => 'hero',
                    'key' => 'promo_marquee_items',
                    'value' => 'Promo Natal 2026 | Gratis Kartu Ucapan',
                    'type' => 'textarea',
                ],
            ],
            'hero_image_file' => $heroFile,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    $storedHero = LandingContent::query()
        ->where('section', 'hero')
        ->where('key', 'hero_image')
        ->firstOrFail();

    expect($storedHero->value)->not->toBeNull();
    Storage::disk('public')->assertExists((string) $storedHero->value);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->where('seasonalRibbon.active', true)
            ->where('seasonalRibbon.text', 'Koleksi Natal 2026 — Pesan Sekarang')
            ->where('seasonalRibbon.link', '/b2b/customizer')
            ->where('contents.hero.hero_season_theme', 'christmas')
            ->where('contents.hero.hero_season_eyebrow', 'CHRISTMAS EDITION 2026')
            ->where('contents.hero.hero_title', 'Bingkisan Natal Penuh Keanggunan')
            ->where('contents.hero.hero_cta_link', '/b2b/customizer')
            ->where('contents.hero.promo_marquee_items', 'Promo Natal 2026 | Gratis Kartu Ucapan')
            ->where('contents.hero.hero_image', asset('storage/'.ltrim((string) $storedHero->value, '/')))
        );

    $oldPath = (string) $storedHero->value;

    $this->actingAs($admin)
        ->post(route('admin.landing-content.update'), [
            'contents' => [
                [
                    'section' => 'seasonal',
                    'key' => 'seasonal_ribbon_active',
                    'value' => '0',
                    'type' => 'boolean',
                ],
            ],
            'remove_hero_image' => true,
        ])
        ->assertSessionHasNoErrors()
        ->assertRedirect();

    Storage::disk('public')->assertMissing($oldPath);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('welcome')
            ->where('seasonalRibbon.active', false)
            ->where('contents.hero.hero_image', null)
        );
});
