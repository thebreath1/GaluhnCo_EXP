<?php

namespace App\Services;

use App\Models\CartItem;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Support\Collection;

class PromotionService
{
    /**
     * Ambil seluruh promo otomatis aktif yang tidak memiliki minimal belanja (langsung tampil di katalog).
     *
     * @return Collection<int, Promotion>
     */
    public function getActiveCatalogAutoPromotions(): Collection
    {
        return Promotion::query()
            ->with('products:id')
            ->currentlyValid()
            ->where('apply_mode', Promotion::MODE_AUTO)
            ->where(fn ($q) => $q->whereNull('min_order_amount')->orWhere('min_order_amount', '<=', 0))
            ->get();
    }

    /**
     * Ambil promo aktif publik untuk ditampilkan di banner katalog (otomatis & kode voucher).
     *
     * @return array<int, array{
     *     id: int,
     *     name: string,
     *     description: string|null,
     *     badge_text: string|null,
     *     apply_mode: string,
     *     code: string|null,
     *     discount_type: string,
     *     discount_value: int,
     *     discount_label: string,
     *     max_discount_amount: int|null,
     *     min_order_amount: int|null,
     *     scope: string,
     *     target_category: string|null,
     *     ends_at: string|null
     * }>
     */
    public function getPublicActivePromotions(): array
    {
        return Promotion::query()
            ->currentlyValid()
            ->orderByDesc('discount_value')
            ->get()
            ->map(fn (Promotion $promo): array => [
                'id' => $promo->id,
                'name' => $promo->name,
                'description' => $promo->description,
                'badge_text' => $promo->badge_text,
                'apply_mode' => $promo->apply_mode,
                'code' => $promo->code,
                'discount_type' => $promo->discount_type,
                'discount_value' => $promo->discount_value,
                'discount_label' => $promo->formatDiscountLabel(),
                'max_discount_amount' => $promo->max_discount_amount,
                'min_order_amount' => $promo->min_order_amount,
                'scope' => $promo->scope,
                'target_category' => $promo->target_category,
                'ends_at' => $promo->ends_at?->toIso8601String(),
            ])
            ->values()
            ->all();
    }

    /**
     * Hitung diskon terbaik untuk satu produk dari daftar promo katalog aktif.
     *
     * @param  Collection<int, Promotion>  $autoPromotions
     * @return array{
     *     original_price: int,
     *     discounted_price: int,
     *     discount_amount: int,
     *     discount_percentage: int|null,
     *     active_promo: array{
     *         id: int,
     *         name: string,
     *         badge_text: string|null,
     *         discount_type: string,
     *         discount_value: int,
     *         discount_label: string,
     *         ends_at: string|null
     *     }|null
     * }
     */
    public function resolveProductDiscount(Product $product, Collection $autoPromotions): array
    {
        $originalPrice = (int) $product->price_from;
        $bestPromotion = null;
        $bestDiscount = 0;

        foreach ($autoPromotions as $promotion) {
            if (! $promotion->appliesToProduct($product)) {
                continue;
            }

            $discount = (int) $promotion->calculateDiscountForAmount((float) $originalPrice);
            if ($discount > $bestDiscount) {
                $bestDiscount = $discount;
                $bestPromotion = $promotion;
            }
        }

        if (! $bestPromotion instanceof Promotion || $bestDiscount <= 0) {
            return [
                'original_price' => $originalPrice,
                'discounted_price' => $originalPrice,
                'discount_amount' => 0,
                'discount_percentage' => null,
                'active_promo' => null,
            ];
        }

        $discountedPrice = max(0, $originalPrice - $bestDiscount);
        $effectivePercentage = $bestPromotion->discount_type === Promotion::TYPE_PERCENTAGE && $bestPromotion->max_discount_amount === null
            ? $bestPromotion->discount_value
            : ($originalPrice > 0 ? (int) round(($bestDiscount / $originalPrice) * 100) : null);

        return [
            'original_price' => $originalPrice,
            'discounted_price' => $discountedPrice,
            'discount_amount' => $bestDiscount,
            'discount_percentage' => $effectivePercentage,
            'active_promo' => [
                'id' => $bestPromotion->id,
                'name' => $bestPromotion->name,
                'badge_text' => $bestPromotion->badge_text,
                'discount_type' => $bestPromotion->discount_type,
                'discount_value' => $bestPromotion->discount_value,
                'discount_label' => $bestPromotion->formatDiscountLabel(),
                'ends_at' => $bestPromotion->ends_at?->toIso8601String(),
            ],
        ];
    }

    /**
     * Evaluasi seluruh item keranjang dengan diskon produk otomatis dan promo/kode voucher tingkat pesanan.
     *
     * @param  Collection<int, CartItem>  $cartItems
     * @return array{
     *     items: array<int, array{
     *         cart_item: CartItem,
     *         original_unit_price: float,
     *         item_discount_per_unit: float,
     *         unit_price: float,
     *         original_subtotal: float,
     *         item_discount_total: float,
     *         subtotal: float,
     *         active_promo: array{
     *             id: int,
     *             name: string,
     *             badge_text: string|null,
     *             discount_type: string,
     *             discount_value: int,
     *             discount_label: string,
     *             ends_at: string|null
     *         }|null
     *     }>,
     *     items_original_subtotal: float,
     *     items_discount_total: float,
     *     subtotal: float,
     *     applied_promotion: array{
     *         id: int,
     *         name: string,
     *         code: string|null,
     *         apply_mode: string,
     *         discount_type: string,
     *         discount_value: int,
     *         discount_label: string,
     *         discount_amount: float
     *     }|null,
     *     promo_model: Promotion|null,
     *     promo_discount: float,
     *     total_discount: float,
     *     total: float,
     *     promo_error: string|null
     * }
     */
    public function evaluateCart(Collection $cartItems, ?string $promoCode = null): array
    {
        $autoCatalogPromos = $this->getActiveCatalogAutoPromotions();

        $evaluatedItems = [];
        $itemsOriginalSubtotal = 0.0;
        $itemsDiscountTotal = 0.0;
        $subtotal = 0.0;

        foreach ($cartItems as $item) {
            if (! $item->is_custom_b2b && $item->product instanceof Product) {
                $resolved = $this->resolveProductDiscount($item->product, $autoCatalogPromos);
                $originalUnitPrice = (float) $resolved['original_price'];
                $itemDiscountPerUnit = (float) $resolved['discount_amount'];
                $effectiveUnitPrice = (float) $resolved['discounted_price'];
                $activePromo = $resolved['active_promo'];
            } else {
                $originalUnitPrice = is_numeric($item->unit_price) ? (float) $item->unit_price : 0.0;
                $itemDiscountPerUnit = 0.0;
                $effectiveUnitPrice = $originalUnitPrice;
                $activePromo = null;
            }

            $originalLineTotal = $originalUnitPrice * $item->quantity;
            $lineDiscount = $itemDiscountPerUnit * $item->quantity;
            $lineSubtotal = $effectiveUnitPrice * $item->quantity;

            $itemsOriginalSubtotal += $originalLineTotal;
            $itemsDiscountTotal += $lineDiscount;
            $subtotal += $lineSubtotal;

            $evaluatedItems[] = [
                'cart_item' => $item,
                'original_unit_price' => $originalUnitPrice,
                'item_discount_per_unit' => $itemDiscountPerUnit,
                'unit_price' => $effectiveUnitPrice,
                'original_subtotal' => $originalLineTotal,
                'item_discount_total' => $lineDiscount,
                'subtotal' => $lineSubtotal,
                'active_promo' => $activePromo,
            ];
        }

        $appliedPromoModel = null;
        $promoDiscount = 0.0;
        $promoError = null;

        $normalizedCode = $promoCode !== null ? strtoupper(trim($promoCode)) : '';

        if ($normalizedCode !== '') {
            $candidate = Promotion::query()
                ->with('products:id')
                ->whereRaw('UPPER(code) = ?', [$normalizedCode])
                ->first();

            if (! $candidate instanceof Promotion) {
                $promoError = 'Kode promo tidak ditemukan.';
            } elseif (! $candidate->is_active) {
                $promoError = 'Kode promo sedang dinonaktifkan.';
            } elseif ($candidate->starts_at !== null && $candidate->starts_at->gt(now())) {
                $promoError = 'Kode promo belum dimulai (berlaku mulai '.$candidate->starts_at->format('d M Y H:i').').';
            } elseif ($candidate->ends_at !== null && $candidate->ends_at->lt(now())) {
                $promoError = 'Kode promo sudah berakhir.';
            } elseif ($candidate->usage_limit !== null && $candidate->used_count >= $candidate->usage_limit) {
                $promoError = 'Kuota penggunaan kode promo sudah habis.';
            } else {
                $eligibleSubtotal = $this->calculateEligibleSubtotal($candidate, $evaluatedItems);
                if ($eligibleSubtotal <= 0) {
                    $promoError = 'Kode promo tidak berlaku untuk produk di keranjang Anda.';
                } elseif ($candidate->min_order_amount !== null && $eligibleSubtotal < $candidate->min_order_amount) {
                    $promoError = 'Minimal belanja untuk promo ini adalah Rp '.number_format($candidate->min_order_amount, 0, ',', '.').'.';
                } else {
                    $appliedPromoModel = $candidate;
                    $promoDiscount = $candidate->calculateDiscountForAmount($eligibleSubtotal);
                }
            }
        } else {
            // Cek promo otomatis berbasis minimal pembelian (threshold cart-level)
            $thresholdPromos = Promotion::query()
                ->with('products:id')
                ->currentlyValid()
                ->where('apply_mode', Promotion::MODE_AUTO)
                ->where('min_order_amount', '>', 0)
                ->get();

            foreach ($thresholdPromos as $candidate) {
                $eligibleSubtotal = $this->calculateEligibleSubtotal($candidate, $evaluatedItems);
                if ($candidate->min_order_amount !== null && $eligibleSubtotal < $candidate->min_order_amount) {
                    continue;
                }

                $candidateDiscount = $candidate->calculateDiscountForAmount($eligibleSubtotal);
                if ($candidateDiscount > $promoDiscount) {
                    $promoDiscount = $candidateDiscount;
                    $appliedPromoModel = $candidate;
                }
            }
        }

        $appliedPromotion = $appliedPromoModel instanceof Promotion
            ? [
                'id' => $appliedPromoModel->id,
                'name' => $appliedPromoModel->name,
                'code' => $appliedPromoModel->code,
                'apply_mode' => $appliedPromoModel->apply_mode,
                'discount_type' => $appliedPromoModel->discount_type,
                'discount_value' => $appliedPromoModel->discount_value,
                'discount_label' => $appliedPromoModel->formatDiscountLabel(),
                'discount_amount' => $promoDiscount,
            ]
            : null;

        return [
            'items' => $evaluatedItems,
            'items_original_subtotal' => $itemsOriginalSubtotal,
            'items_discount_total' => $itemsDiscountTotal,
            'subtotal' => $subtotal,
            'applied_promotion' => $appliedPromotion,
            'promo_model' => $appliedPromoModel,
            'promo_discount' => $promoDiscount,
            'total_discount' => $itemsDiscountTotal + $promoDiscount,
            'total' => max(0.0, $subtotal - $promoDiscount),
            'promo_error' => $promoError,
        ];
    }

    /**
     * @param  array<int, array{
     *     cart_item: CartItem,
     *     original_unit_price: float,
     *     item_discount_per_unit: float,
     *     unit_price: float,
     *     original_subtotal: float,
     *     item_discount_total: float,
     *     subtotal: float,
     *     active_promo: array<string, mixed>|null
     * }>  $evaluatedItems
     */
    private function calculateEligibleSubtotal(Promotion $promotion, array $evaluatedItems): float
    {
        $eligible = 0.0;

        foreach ($evaluatedItems as $entry) {
            $cartItem = $entry['cart_item'];

            if ($promotion->scope === Promotion::SCOPE_ALL) {
                $eligible += $entry['subtotal'];

                continue;
            }

            if (! $cartItem->is_custom_b2b && $cartItem->product instanceof Product && $promotion->appliesToProduct($cartItem->product)) {
                $eligible += $entry['subtotal'];
            }
        }

        return $eligible;
    }
}
