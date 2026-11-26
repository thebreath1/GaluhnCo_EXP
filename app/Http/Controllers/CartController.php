<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use App\Models\User;
use App\Services\PromotionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __construct(private readonly PromotionService $promotionService) {}

    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $cart = Cart::query()
            ->with('items.product')
            ->where('user_id', $user->id)
            ->first();

        $rawPromoCode = $request->session()->get('applied_promo_code');
        $promoCode = is_string($rawPromoCode) ? $rawPromoCode : null;

        $cartItems = $cart !== null ? $cart->items : collect();
        $evaluation = $this->promotionService->evaluateCart($cartItems, $promoCode);

        if ($promoCode !== null && $evaluation['promo_error'] !== null) {
            $request->session()->forget('applied_promo_code');
        }

        $items = collect($evaluation['items'])->map(function (array $entry): array {
            /** @var CartItem $item */
            $item = $entry['cart_item'];
            $imageUrl = null;
            if ($item->is_custom_b2b) {
                $logoPath = is_array($item->custom_config) && isset($item->custom_config['logo_path']) && is_string($item->custom_config['logo_path'])
                    ? $item->custom_config['logo_path']
                    : null;
                if ($logoPath !== null && $logoPath !== '') {
                    $imageUrl = asset('storage/'.ltrim($logoPath, '/'));
                }
            } elseif ($item->product instanceof Product && ! empty($item->product->image)) {
                $image = $item->product->image;
                $imageUrl = (str_starts_with($image, 'http://') || str_starts_with($image, 'https://'))
                    ? $image
                    : asset('storage/'.ltrim($image, '/'));
            }

            $customTitle = is_array($item->custom_config) && isset($item->custom_config['title']) && is_string($item->custom_config['title'])
                ? $item->custom_config['title']
                : 'Custom B2B Luxury Hampers';

            return [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product_name' => $item->is_custom_b2b
                    ? $customTitle
                    : ($item->product->name ?? 'Galuh & Co. Hampers'),
                'category' => $item->product?->category,
                'image_url' => $imageUrl,
                'is_custom_b2b' => $item->is_custom_b2b,
                'custom_config' => $item->custom_config,
                'quantity' => $item->quantity,
                'original_unit_price' => $entry['original_unit_price'],
                'unit_price' => $entry['unit_price'],
                'item_discount_total' => $entry['item_discount_total'],
                'subtotal' => $entry['subtotal'],
                'active_promo' => $entry['active_promo'],
            ];
        })->values()->all();

        return Inertia::render('cart/index', [
            'items' => $items,
            'summary' => [
                'items_original_subtotal' => $evaluation['items_original_subtotal'],
                'items_discount_total' => $evaluation['items_discount_total'],
                'subtotal' => $evaluation['subtotal'],
                'applied_promotion' => $evaluation['applied_promotion'],
                'promo_discount' => $evaluation['promo_discount'],
                'total_discount' => $evaluation['total_discount'],
                'total' => $evaluation['total'],
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $validated = $request->validate([
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::query()->findOrFail((int) $validated['product_id']);
        $cart = Cart::firstOrCreate(['user_id' => $user->id]);

        $existingItem = $cart->items()
            ->where('product_id', $product->id)
            ->where('is_custom_b2b', false)
            ->first();

        if ($existingItem instanceof CartItem) {
            $existingItem->update([
                'quantity' => $existingItem->quantity + (int) $validated['quantity'],
            ]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'is_custom_b2b' => false,
                'quantity' => (int) $validated['quantity'],
                'unit_price' => $product->price_from,
            ]);
        }

        return back()->with('success', 'Produk berhasil ditambahkan ke keranjang.');
    }

    public function update(Request $request, CartItem $cartItem): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);
        abort_unless($cartItem->cart?->user_id === $user->id, 403);

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cartItem->update([
            'quantity' => (int) $validated['quantity'],
        ]);

        return back()->with('success', 'Jumlah item keranjang diperbarui.');
    }

    public function destroy(Request $request, CartItem $cartItem): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);
        abort_unless($cartItem->cart?->user_id === $user->id, 403);

        $cartItem->delete();

        return back()->with('success', 'Item berhasil dihapus dari keranjang.');
    }

    public function applyPromo(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 403);

        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
        ]);

        $code = strtoupper(trim((string) $validated['code']));
        $cart = Cart::query()
            ->with('items.product')
            ->where('user_id', $user->id)
            ->first();

        $evaluation = $this->promotionService->evaluateCart($cart !== null ? $cart->items : collect(), $code);

        if ($evaluation['promo_error'] !== null) {
            return back()->withErrors(['promo_code' => $evaluation['promo_error']]);
        }

        $request->session()->put('applied_promo_code', $code);

        return back()->with('success', "Kode promo {$code} berhasil diterapkan.");
    }

    public function removePromo(Request $request): RedirectResponse
    {
        $request->session()->forget('applied_promo_code');

        return back()->with('success', 'Kode promo dihapus.');
    }
}
