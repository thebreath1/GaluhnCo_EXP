<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property int|null $product_id
 * @property string $product_name
 * @property bool $is_custom_b2b
 * @property array<string, mixed>|null $custom_config
 * @property int $quantity
 * @property string|null $original_unit_price
 * @property string $unit_price
 * @property string $discount_amount
 * @property string $subtotal
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
class OrderItem extends Model
{
    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'is_custom_b2b',
        'custom_config',
        'quantity',
        'original_unit_price',
        'unit_price',
        'discount_amount',
        'subtotal',
    ];

    protected function casts(): array
    {
        return [
            'is_custom_b2b' => 'boolean',
            'custom_config' => 'array',
            'quantity' => 'integer',
            'original_unit_price' => 'decimal:2',
            'unit_price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'subtotal' => 'decimal:2',
        ];
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
