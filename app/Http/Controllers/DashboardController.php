<?php

namespace App\Http\Controllers;

use App\Models\Inquiry;
use App\Models\Product;
use App\Models\Promotion;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $activePromotions = Promotion::query()->currentlyValid()->count();
        $scheduledPromotions = Promotion::query()
            ->where('is_active', true)
            ->whereNotNull('starts_at')
            ->where('starts_at', '>', now())
            ->count();

        $recentPromotions = Promotion::query()
            ->latest()
            ->take(4)
            ->get()
            ->map(fn (Promotion $promo): array => [
                'id' => $promo->id,
                'name' => $promo->name,
                'apply_mode' => $promo->apply_mode,
                'code' => $promo->code,
                'discount_label' => $promo->formatDiscountLabel(),
                'starts_at' => $promo->starts_at?->toIso8601String(),
                'ends_at' => $promo->ends_at?->toIso8601String(),
                'starts_at_label' => $promo->starts_at?->format('d M Y, H:i'),
                'ends_at_label' => $promo->ends_at?->format('d M Y, H:i'),
                'computed_status' => $promo->resolveStatus(),
            ])
            ->values()
            ->all();

        return Inertia::render('dashboard', [
            'stats' => [
                'total_products' => Product::count(),
                'active_products' => Product::where('is_active', true)->count(),
                'total_inquiries' => Inquiry::count(),
                'new_inquiries' => Inquiry::where('status', 'new')->count(),
                'active_promotions' => $activePromotions,
                'scheduled_promotions' => $scheduledPromotions,
            ],
            'recent_inquiries' => Inquiry::latest()
                ->take(5)
                ->get()
                ->map(fn (Inquiry $i) => [
                    'id' => $i->id,
                    'name' => $i->name,
                    'company' => $i->company,
                    'estimated_quantity' => $i->estimated_quantity,
                    'needed_date' => $i->needed_date->format('d M Y'),
                    'status' => $i->status,
                ]),
            'recent_promotions' => $recentPromotions,
        ]);
    }
}
