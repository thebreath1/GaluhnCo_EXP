<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
    {
        $orders = Order::query()
            ->with(['user', 'items'])
            ->latest()
            ->get()
            ->map(function (Order $order): array {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->user->name ?? 'Pelanggan',
                    'customer_email' => $order->user->email ?? null,
                    'customer_phone' => $order->user?->phone,
                    'customer_role' => $order->user->role ?? 'customer',
                    'company_name' => $order->user?->company_name,
                    'promo_code' => $order->promo_code,
                    'promo_name' => $order->promo_name,
                    'subtotal_amount' => $order->subtotal_amount !== null ? (float) $order->subtotal_amount : (float) $order->total_amount,
                    'discount_amount' => (float) $order->discount_amount,
                    'total_amount' => (float) $order->total_amount,
                    'status' => $order->status,
                    'tracking_number' => $order->tracking_number,
                    'greeting_note' => $order->greeting_note,
                    'address_snapshot' => $order->address_snapshot,
                    'payment_proof_url' => $order->payment_proof_path !== null
                        ? asset('storage/'.ltrim($order->payment_proof_path, '/'))
                        : null,
                    'b2b_video_url' => $order->b2b_video_path !== null
                        ? asset('storage/'.ltrim($order->b2b_video_path, '/'))
                        : null,
                    'b2b_video_token' => $order->b2b_video_token,
                    'greeting_url' => $order->b2b_video_token !== null
                        ? route('greeting.show', $order->b2b_video_token)
                        : null,
                    'verified_at' => $order->verified_at?->toIso8601String(),
                    'packed_at' => $order->packed_at?->toIso8601String(),
                    'shipped_at' => $order->shipped_at?->toIso8601String(),
                    'delivered_at' => $order->delivered_at?->toIso8601String(),
                    'items_count' => $order->items->count(),
                    'items' => $order->items->map(fn (OrderItem $item): array => [
                        'id' => $item->id,
                        'product_name' => $item->product_name,
                        'is_custom_b2b' => (bool) $item->is_custom_b2b,
                        'custom_config' => $item->custom_config,
                        'quantity' => $item->quantity,
                        'unit_price' => (float) $item->unit_price,
                        'subtotal' => (float) $item->subtotal,
                    ])->values()->all(),
                    'created_at' => $order->created_at?->toIso8601String(),
                ];
            })
            ->values()
            ->all();

        return Inertia::render('admin/orders', [
            'orders' => $orders,
        ]);
    }

    public function updateStatus(Request $request, Order $order): RedirectResponse
    {
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in([
                    Order::STATUS_VERIFICATION,
                    Order::STATUS_PACKING,
                    Order::STATUS_SHIPPING,
                    Order::STATUS_DELIVERED,
                ]),
            ],
            'tracking_number' => ['nullable', 'string', 'max:100'],
        ]);

        $status = (string) $validated['status'];

        $updates = [
            'status' => $status,
        ];

        if (array_key_exists('tracking_number', $validated)) {
            $updates['tracking_number'] = $validated['tracking_number'];
        }

        $timestampField = match ($status) {
            Order::STATUS_VERIFICATION => 'verified_at',
            Order::STATUS_PACKING => 'packed_at',
            Order::STATUS_SHIPPING => 'shipped_at',
            Order::STATUS_DELIVERED => 'delivered_at',
            default => null,
        };

        if ($timestampField !== null && $order->getAttribute($timestampField) === null) {
            $updates[$timestampField] = now();
        }

        $order->update($updates);

        return back()->with('success', 'Status pesanan berhasil diperbarui.');
    }
}
