<?php

namespace App\Http\Controllers;

use App\Models\LandingContent;
use App\Models\Partner;
use App\Models\Product;
use App\Services\PromotionService;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class CatalogController extends Controller
{
    public function __construct(private readonly PromotionService $promotionService) {}

    /**
     * Mengambil daftar produk aktif beserta kategori unik dan promo aktif.
     *
     * @return array{
     *     products: Collection<int, array{
     *         id: int,
     *         name: string,
     *         slug: string,
     *         category: string,
     *         event_category: string,
     *         season_tag: string|null,
     *         is_best_seller: bool,
     *         short_description: string,
     *         contents: array<int, string>,
     *         price_from: int,
     *         discounted_price: int,
     *         discount_percentage: int|null,
     *         active_promo: array{
     *             id: int,
     *             name: string,
     *             badge_text: string|null,
     *             discount_type: string,
     *             discount_value: int,
     *             discount_label: string,
     *             ends_at: string|null
     *         }|null,
     *         image: string|null,
     *         image_url: string|null,
     *         sort_order: int,
     *         is_active: bool
     *     }>,
     *     categories: Collection<int, string>,
     *     activePromotions: array<int, array{
     *         id: int,
     *         name: string,
     *         description: string|null,
     *         badge_text: string|null,
     *         apply_mode: string,
     *         code: string|null,
     *         discount_type: string,
     *         discount_value: int,
     *         discount_label: string,
     *         max_discount_amount: int|null,
     *         min_order_amount: int|null,
     *         scope: string,
     *         target_category: string|null,
     *         ends_at: string|null
     *     }>
     * }
     */
    protected function getCatalogData(): array
    {
        $autoPromotions = $this->promotionService->getActiveCatalogAutoPromotions();

        $products = Product::query()
            ->active()
            ->get()
            ->map(function (Product $product) use ($autoPromotions) {
                // Resolusi URL foto produk (URL eksternal atau storage symlink lokal)
                $imageUrl = null;
                if (! empty($product->image)) {
                    if (str_starts_with($product->image, 'http://') || str_starts_with($product->image, 'https://')) {
                        $imageUrl = $product->image;
                    } else {
                        $imageUrl = asset('storage/'.ltrim($product->image, '/'));
                    }
                }

                $discountData = $this->promotionService->resolveProductDiscount($product, $autoPromotions);

                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'category' => $product->category,
                    'event_category' => $product->event_category,
                    'season_tag' => $product->season_tag,
                    'is_best_seller' => (bool) $product->is_best_seller,
                    'short_description' => $product->short_description,
                    'contents' => $product->contents,
                    'price_from' => (int) $product->price_from,
                    'discounted_price' => $discountData['discounted_price'],
                    'discount_percentage' => $discountData['discount_percentage'],
                    'active_promo' => $discountData['active_promo'],
                    'image' => $product->image,
                    'image_url' => $imageUrl,
                    'sort_order' => (int) $product->sort_order,
                    'is_active' => (bool) $product->is_active,
                ];
            });

        /** @var Collection<int, string> $categories */
        $categories = $products->pluck('category')->unique()->values();

        return [
            'products' => $products,
            'categories' => $categories,
            'activePromotions' => $this->promotionService->getPublicActivePromotions(),
        ];
    }

    public function index(): Response
    {
        $data = $this->getCatalogData();

        /** @var array<int, array{id: int, name: string, sector: string|null, logo_url: string|null}> $partners */
        $partners = Partner::query()
            ->active()
            ->get()
            ->map(fn (Partner $partner) => [
                'id' => $partner->id,
                'name' => $partner->name,
                'sector' => $partner->sector,
                'logo_url' => $partner->logo
                    ? asset('storage/'.ltrim($partner->logo, '/'))
                    : null,
            ])
            ->values()
            ->all();

        return Inertia::render('welcome', array_merge($data, [
            'partners' => $partners,
            'contents' => LandingContent::getGroupedContents(),
        ]));
    }

    public function catalog(): Response
    {
        return Inertia::render('katalog', $this->getCatalogData());
    }
}
