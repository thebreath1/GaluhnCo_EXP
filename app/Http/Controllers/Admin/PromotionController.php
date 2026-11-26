<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePromotionRequest;
use App\Http\Requests\Admin\UpdatePromotionRequest;
use App\Models\Product;
use App\Models\Promotion;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PromotionController extends Controller
{
    public function index(): Response
    {
        $promotions = Promotion::query()
            ->with('products:id,name')
            ->latest()
            ->get()
            ->map(fn (Promotion $promotion): array => [
                'id' => $promotion->id,
                'name' => $promotion->name,
                'description' => $promotion->description,
                'badge_text' => $promotion->badge_text,
                'apply_mode' => $promotion->apply_mode,
                'code' => $promotion->code,
                'discount_type' => $promotion->discount_type,
                'discount_value' => $promotion->discount_value,
                'discount_label' => $promotion->formatDiscountLabel(),
                'max_discount_amount' => $promotion->max_discount_amount,
                'min_order_amount' => $promotion->min_order_amount,
                'scope' => $promotion->scope,
                'target_category' => $promotion->target_category,
                'product_ids' => $promotion->products->pluck('id')->values()->all(),
                'product_names' => $promotion->products->pluck('name')->values()->all(),
                'starts_at' => $promotion->starts_at?->toIso8601String(),
                'ends_at' => $promotion->ends_at?->toIso8601String(),
                'starts_at_label' => $promotion->starts_at?->format('d M Y, H:i'),
                'ends_at_label' => $promotion->ends_at?->format('d M Y, H:i'),
                'usage_limit' => $promotion->usage_limit,
                'used_count' => $promotion->used_count,
                'is_active' => (bool) $promotion->is_active,
                'computed_status' => $promotion->resolveStatus(),
            ])
            ->values()
            ->all();

        $products = Product::query()
            ->orderBy('sort_order')
            ->orderBy('name')
            ->get(['id', 'name', 'category', 'price_from', 'is_active'])
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'category' => $product->category,
                'price_from' => (int) $product->price_from,
                'is_active' => (bool) $product->is_active,
            ])
            ->values()
            ->all();

        $categories = Product::query()
            ->select('category', 'event_category')
            ->get()
            ->flatMap(fn (Product $p) => [$p->category, $p->event_category])
            ->filter(fn (string $v): bool => trim($v) !== '')
            ->unique()
            ->values()
            ->all();

        return Inertia::render('admin/promotions/index', [
            'promotions' => $promotions,
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    public function store(StorePromotionRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        /** @var array<int, int|string> $productIds */
        $productIds = $validated['product_ids'] ?? [];
        unset($validated['product_ids']);

        $validated['is_active'] = $request->boolean('is_active', true);

        if ($validated['discount_type'] !== Promotion::TYPE_PERCENTAGE) {
            $validated['max_discount_amount'] = null;
        }

        DB::transaction(function () use ($validated, $productIds): void {
            $promotion = Promotion::create($validated);

            if ($promotion->scope === Promotion::SCOPE_PRODUCTS) {
                $promotion->products()->sync($productIds);
            }
        });

        return back()->with('success', 'Promo / diskon berhasil dibuat.');
    }

    public function update(UpdatePromotionRequest $request, Promotion $promotion): RedirectResponse
    {
        $validated = $request->validated();
        /** @var array<int, int|string> $productIds */
        $productIds = $validated['product_ids'] ?? [];
        unset($validated['product_ids']);

        $validated['is_active'] = $request->boolean('is_active', true);

        if ($validated['discount_type'] !== Promotion::TYPE_PERCENTAGE) {
            $validated['max_discount_amount'] = null;
        }

        DB::transaction(function () use ($promotion, $validated, $productIds): void {
            $promotion->update($validated);

            if ($promotion->scope === Promotion::SCOPE_PRODUCTS) {
                $promotion->products()->sync($productIds);
            } else {
                $promotion->products()->detach();
            }
        });

        return back()->with('success', 'Promo / diskon berhasil diperbarui.');
    }

    public function toggle(Promotion $promotion): RedirectResponse
    {
        $promotion->update([
            'is_active' => ! $promotion->is_active,
        ]);

        return back()->with(
            'success',
            $promotion->is_active ? 'Promo diaktifkan.' : 'Promo dinonaktifkan.',
        );
    }

    public function destroy(Promotion $promotion): RedirectResponse
    {
        $promotion->delete();

        return back()->with('success', 'Promo / diskon berhasil dihapus.');
    }
}
