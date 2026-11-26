<?php

namespace App\Http\Controllers;

use App\Concerns\PasswordValidationRules;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\User;
use App\Models\UserAddress;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class AccountController extends Controller
{
    use PasswordValidationRules;

    public function index(Request $request): Response
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        $addresses = $user->addresses()
            ->orderByDesc('is_default')
            ->latest()
            ->get()
            ->map(fn (UserAddress $address): array => [
                'id' => $address->id,
                'label' => $address->label,
                'recipient_name' => $address->recipient_name,
                'recipient_phone' => $address->recipient_phone,
                'address_line' => $address->address_line,
                'city' => $address->city,
                'postal_code' => $address->postal_code,
                'is_default' => (bool) $address->is_default,
            ])
            ->values()
            ->all();

        $orders = $user->orders()
            ->with('items')
            ->latest()
            ->get()
            ->map(fn (Order $order): array => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'promo_code' => $order->promo_code,
                'promo_name' => $order->promo_name,
                'subtotal_amount' => $order->subtotal_amount !== null ? (float) $order->subtotal_amount : (float) $order->total_amount,
                'discount_amount' => (float) $order->discount_amount,
                'total_amount' => (float) $order->total_amount,
                'status' => $order->status,
                'tracking_number' => $order->tracking_number,
                'greeting_note' => $order->greeting_note,
                'address_snapshot' => $order->address_snapshot,
                'b2b_video_path' => $order->b2b_video_path,
                'b2b_video_token' => $order->b2b_video_token,
                'greeting_url' => $order->b2b_video_token !== null
                    ? route('greeting.show', $order->b2b_video_token)
                    : null,
                'verified_at' => $order->verified_at?->toIso8601String(),
                'packed_at' => $order->packed_at?->toIso8601String(),
                'shipped_at' => $order->shipped_at?->toIso8601String(),
                'delivered_at' => $order->delivered_at?->toIso8601String(),
                'created_at' => $order->created_at?->toIso8601String(),
                'items' => $order->items->map(fn (OrderItem $item): array => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'is_custom_b2b' => (bool) $item->is_custom_b2b,
                    'custom_config' => $item->custom_config,
                    'quantity' => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'subtotal' => (float) $item->subtotal,
                ])->values()->all(),
            ])
            ->values()
            ->all();

        return Inertia::render('account/index', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'phone' => $user->phone,
                'company_name' => $user->company_name,
                'is_admin' => (bool) $user->is_admin,
            ],
            'addresses' => $addresses,
            'orders' => $orders,
        ]);
    }

    public function updateProfile(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        /** @var array{name: string, email: string, phone: string|null, company_name: string|null} $validated */
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique(User::class)->ignore($user->id)],
            'phone' => ['nullable', 'string', 'max:30'],
            'company_name' => $user->isB2B()
                ? ['required', 'string', 'max:255']
                : ['nullable', 'string', 'max:255'],
        ]);

        $user->fill([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'company_name' => $validated['company_name'] ?? null,
        ]);

        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }

        $user->save();

        return back()->with('success', 'Profil berhasil diperbarui.');
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        /** @var array{password: string} $validated */
        $validated = $request->validate([
            'current_password' => $this->currentPasswordRules(),
            'password' => $this->passwordRules(),
        ]);

        $user->update([
            'password' => $validated['password'],
        ]);

        return back()->with('success', 'Password berhasil diperbarui.');
    }

    public function storeAddress(Request $request): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);

        /** @var array{label: string, recipient_name: string, recipient_phone: string, address_line: string, city: string, postal_code: string, is_default?: bool} $validated */
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:100'],
            'recipient_name' => ['required', 'string', 'max:255'],
            'recipient_phone' => ['required', 'string', 'max:30'],
            'address_line' => ['required', 'string', 'max:1000'],
            'city' => ['required', 'string', 'max:150'],
            'postal_code' => ['required', 'string', 'max:20'],
            'is_default' => ['boolean'],
        ]);

        $shouldBeDefault = $request->boolean('is_default');

        DB::transaction(function () use ($user, $validated, $shouldBeDefault): void {
            $hasAddresses = $user->addresses()->exists();
            $makeDefault = $shouldBeDefault || ! $hasAddresses;

            if ($makeDefault) {
                $user->addresses()->update(['is_default' => false]);
            }

            $user->addresses()->create([
                'label' => $validated['label'],
                'recipient_name' => $validated['recipient_name'],
                'recipient_phone' => $validated['recipient_phone'],
                'address_line' => $validated['address_line'],
                'city' => $validated['city'],
                'postal_code' => $validated['postal_code'],
                'is_default' => $makeDefault,
            ]);
        });

        return back()->with('success', 'Alamat baru berhasil ditambahkan.');
    }

    public function updateAddress(Request $request, UserAddress $address): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        abort_unless($address->user_id === $user->id, 403);

        /** @var array<string, mixed> $validated */
        $validated = $request->validate([
            'label' => ['sometimes', 'required', 'string', 'max:100'],
            'recipient_name' => ['sometimes', 'required', 'string', 'max:255'],
            'recipient_phone' => ['sometimes', 'required', 'string', 'max:30'],
            'address_line' => ['sometimes', 'required', 'string', 'max:1000'],
            'city' => ['sometimes', 'required', 'string', 'max:150'],
            'postal_code' => ['sometimes', 'required', 'string', 'max:20'],
            'is_default' => ['sometimes', 'boolean'],
        ]);

        $makeDefault = $request->has('is_default') && $request->boolean('is_default');

        DB::transaction(function () use ($user, $address, $validated, $makeDefault): void {
            if ($makeDefault) {
                $user->addresses()
                    ->where('id', '!=', $address->id)
                    ->update(['is_default' => false]);
            }

            $address->update($validated);
        });

        return back()->with('success', 'Alamat berhasil diperbarui.');
    }

    public function destroyAddress(Request $request, UserAddress $address): RedirectResponse
    {
        $user = $request->user();
        abort_unless($user instanceof User, 401);
        abort_unless($address->user_id === $user->id, 403);

        DB::transaction(function () use ($user, $address): void {
            $wasDefault = (bool) $address->is_default;
            $address->delete();

            if ($wasDefault) {
                $nextAddress = $user->addresses()->latest()->first();
                if ($nextAddress instanceof UserAddress) {
                    $nextAddress->update(['is_default' => true]);
                }
            }
        });

        return back()->with('success', 'Alamat berhasil dihapus.');
    }
}
