<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use App\Models\Promotion;
use App\Models\User;
use App\Services\PromotionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class CheckoutController extends Controller
{
    public function __construct(private readonly PromotionService $promotionService) {}

    public function index(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        abort_if(! $user instanceof User, 403);

        $cart = Cart::firstOrCreate(['user_id' => $user->id]);
        $cartItems = $cart->items()->with('product')->get();

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'Keranjang belanja masih kosong.');
        }

        $rawPromoCode = $request->session()->get('applied_promo_code');
        $promoCode = is_string($rawPromoCode) ? $rawPromoCode : null;

        $evaluation = $this->promotionService->evaluateCart($cartItems, $promoCode);

        if ($promoCode !== null && $evaluation['promo_error'] !== null) {
            $request->session()->forget('applied_promo_code');
        }

        $items = collect($evaluation['items'])->map(function (array $entry): array {
            $item = $entry['cart_item'];

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'is_custom_b2b' => $item->is_custom_b2b,
                'custom_config' => $item->custom_config,
                'quantity' => $item->quantity,
                'original_unit_price' => $entry['original_unit_price'],
                'unit_price' => $entry['unit_price'],
                'item_discount_total' => $entry['item_discount_total'],
                'subtotal' => $entry['subtotal'],
                'active_promo' => $entry['active_promo'],
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'category' => $item->product->category,
                ] : null,
            ];
        })->values()->all();

        return Inertia::render('checkout/index', [
            'items' => $items,
            'items_original_subtotal' => $evaluation['items_original_subtotal'],
            'items_discount_total' => $evaluation['items_discount_total'],
            'subtotal' => $evaluation['subtotal'],
            'applied_promotion' => $evaluation['applied_promotion'],
            'promo_discount' => $evaluation['promo_discount'],
            'total_discount' => $evaluation['total_discount'],
            'total' => $evaluation['total'],
            'addresses' => $user->addresses()->orderByDesc('is_default')->get(),
            'isB2B' => $user->isB2B(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_if(! $user instanceof User, 403);

        $cart = $user->cart()->with('items.product')->firstOrFail();

        if ($cart->items->isEmpty()) {
            return redirect()->route('cart.index');
        }

        $validated = $request->validate([
            'address_id' => ['required', 'exists:user_addresses,id'],
            'greeting_note' => ['nullable', 'string', 'max:1000'],
            'promo_code' => ['nullable', 'string', 'max:50'],
            'payment_proof' => ['nullable', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:4096'],
            'b2b_video' => ['nullable', 'file', 'mimetypes:video/mp4,video/webm', 'max:51200'],
        ]);

        $address = $user->addresses()->findOrFail($validated['address_id']);
        $hasCustomB2B = $cart->items->contains('is_custom_b2b', true);

        $rawSessionCode = $request->session()->get('applied_promo_code');
        $promoCode = filled($validated['promo_code'] ?? null)
            ? (string) $validated['promo_code']
            : (is_string($rawSessionCode) ? $rawSessionCode : null);

        $paymentPath = $request->hasFile('payment_proof')
            ? $request->file('payment_proof')->store('payment-proofs', 'public')
            : null;

        $videoPath = null;
        $videoToken = null;

        if ($user->isB2B() && $request->hasFile('b2b_video')) {
            $videoPath = $request->file('b2b_video')->store('b2b-videos', 'public');
            $videoToken = Str::random(24);
        }

        $evaluation = $this->promotionService->evaluateCart($cart->items, $promoCode);

        if ($promoCode !== null && trim($promoCode) !== '' && $evaluation['promo_error'] !== null) {
            throw ValidationException::withMessages([
                'promo_code' => $evaluation['promo_error'],
            ]);
        }

        DB::transaction(function () use ($user, $cart, $address, $validated, $paymentPath, $videoPath, $videoToken, $hasCustomB2B, $evaluation): void {
            /** @var Promotion|null $promoModel */
            $promoModel = $evaluation['promo_model'];

            if ($promoModel instanceof Promotion && $promoModel->usage_limit !== null) {
                $updated = Promotion::query()
                    ->where('id', $promoModel->id)
                    ->whereColumn('used_count', '<', 'usage_limit')
                    ->increment('used_count');

                if ($updated === 0) {
                    throw ValidationException::withMessages([
                        'promo_code' => 'Kuota penggunaan promo ini baru saja habis.',
                    ]);
                }
            } elseif ($promoModel instanceof Promotion) {
                $promoModel->increment('used_count');
            }

            // Jika promo otomatis per item dipakai (tanpa order-level promoModel), catat nama promo item pertama jika ada
            $itemPromosCount = collect($evaluation['items'])->filter(fn (array $entry) => $entry['active_promo'] !== null)->count();
            $fallbackPromoName = $promoModel === null && $itemPromosCount > 0
                ? ($evaluation['items'][0]['active_promo']['name'] ?? 'Diskon Katalog')
                : null;

            $order = Order::create([
                'order_number' => 'INV-GC-'.now()->format('Ymd').'-'.strtoupper(Str::random(4)),
                'user_id' => $user->id,
                'promotion_id' => $promoModel?->id,
                'promo_code' => $promoModel?->code,
                'promo_name' => $promoModel->name ?? $fallbackPromoName,
                'address_snapshot' => $address->toArray(),
                'subtotal_amount' => $evaluation['items_original_subtotal'],
                'discount_amount' => $evaluation['total_discount'],
                'total_amount' => $evaluation['total'],
                'status' => Order::STATUS_VERIFICATION,
                'greeting_note' => $validated['greeting_note'] ?? null,
                'payment_proof_path' => $paymentPath,
                'b2b_video_path' => $videoPath,
                'b2b_video_token' => $user->isB2B() && ($hasCustomB2B || $videoPath !== null)
                    ? ($videoToken ?? Str::random(24))
                    : null,
            ]);

            foreach ($evaluation['items'] as $entry) {
                $item = $entry['cart_item'];
                $customTitle = is_array($item->custom_config) && isset($item->custom_config['title']) && is_string($item->custom_config['title'])
                    ? $item->custom_config['title']
                    : 'Custom B2B Luxury Hampers';

                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_name' => $item->is_custom_b2b
                        ? $customTitle
                        : ($item->product->name ?? 'Galuh & Co. Hampers'),
                    'is_custom_b2b' => $item->is_custom_b2b,
                    'custom_config' => $item->custom_config,
                    'quantity' => $item->quantity,
                    'original_unit_price' => $entry['original_unit_price'],
                    'unit_price' => $entry['unit_price'],
                    'discount_amount' => $entry['item_discount_total'],
                    'subtotal' => $entry['subtotal'],
                ]);
            }

            $cart->items()->delete();
        });

        $request->session()->forget('applied_promo_code');

        return redirect()->route('account.index')->with('success', 'Pesanan berhasil dibuat dan sedang dalam tahap Verifikasi.');
    }
}
