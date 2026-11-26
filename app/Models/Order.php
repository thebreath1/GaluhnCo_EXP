<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $order_number
 * @property int $user_id
 * @property int|null $promotion_id
 * @property string|null $promo_code
 * @property string|null $promo_name
 * @property array<string, mixed> $address_snapshot
 * @property string|null $subtotal_amount
 * @property string $discount_amount
 * @property string $total_amount
 * @property string $status
 * @property string|null $tracking_number
 * @property string|null $greeting_note
 * @property string|null $payment_proof_path
 * @property string|null $b2b_video_path
 * @property string|null $b2b_video_token
 * @property Carbon|null $verified_at
 * @property Carbon|null $packed_at
 * @property Carbon|null $shipped_at
 * @property Carbon|null $delivered_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class Order extends Model
{
    public const STATUS_VERIFICATION = 'verification';

    public const STATUS_PACKING = 'packing';

    public const STATUS_SHIPPING = 'shipping';

    public const STATUS_DELIVERED = 'delivered';

    protected $fillable = [
        'order_number',
        'user_id',
        'promotion_id',
        'promo_code',
        'promo_name',
        'address_snapshot',
        'subtotal_amount',
        'discount_amount',
        'total_amount',
        'status',
        'tracking_number',
        'greeting_note',
        'payment_proof_path',
        'b2b_video_path',
        'b2b_video_token',
        'verified_at',
        'packed_at',
        'shipped_at',
        'delivered_at',
    ];

    protected function casts(): array
    {
        return [
            'address_snapshot' => 'array',
            'subtotal_amount' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'verified_at' => 'datetime',
            'packed_at' => 'datetime',
            'shipped_at' => 'datetime',
            'delivered_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<Promotion, $this>
     */
    public function promotion(): BelongsTo
    {
        return $this->belongsTo(Promotion::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }
}
