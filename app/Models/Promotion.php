<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string|null $description
 * @property string|null $badge_text
 * @property string $apply_mode
 * @property string|null $code
 * @property string $discount_type
 * @property int $discount_value
 * @property int|null $max_discount_amount
 * @property int|null $min_order_amount
 * @property string $scope
 * @property string|null $target_category
 * @property Carbon|null $starts_at
 * @property Carbon|null $ends_at
 * @property int|null $usage_limit
 * @property int $used_count
 * @property bool $is_active
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Promotion extends Model
{
    public const MODE_AUTO = 'auto';

    public const MODE_CODE = 'code';

    public const TYPE_PERCENTAGE = 'percentage';

    public const TYPE_FIXED = 'fixed';

    public const SCOPE_ALL = 'all';

    public const SCOPE_CATEGORY = 'category';

    public const SCOPE_PRODUCTS = 'products';

    protected $fillable = [
        'name',
        'description',
        'badge_text',
        'apply_mode',
        'code',
        'discount_type',
        'discount_value',
        'max_discount_amount',
        'min_order_amount',
        'scope',
        'target_category',
        'starts_at',
        'ends_at',
        'usage_limit',
        'used_count',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'discount_value' => 'integer',
            'max_discount_amount' => 'integer',
            'min_order_amount' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'usage_limit' => 'integer',
            'used_count' => 'integer',
            'is_active' => 'boolean',
        ];
    }

    /**
     * @return BelongsToMany<Product, $this>
     */
    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class, 'promotion_product');
    }

    /**
     * @return HasMany<Order, $this>
     */
    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    /**
     * Filter promo yang sedang aktif, berada dalam rentang waktu, dan masih memiliki kuota.
     *
     * @param  Builder<Promotion>  $query
     * @return Builder<Promotion>
     */
    public function scopeCurrentlyValid(Builder $query, ?CarbonInterface $at = null): Builder
    {
        $now = $at ?? now();

        return $query
            ->where('is_active', true)
            ->where(fn (Builder $q) => $q->whereNull('starts_at')->orWhere('starts_at', '<=', $now))
            ->where(fn (Builder $q) => $q->whereNull('ends_at')->orWhere('ends_at', '>=', $now))
            ->where(fn (Builder $q) => $q->whereNull('usage_limit')->orWhereColumn('used_count', '<', 'usage_limit'));
    }

    /**
     * Status komputasi promo saat ini: active | scheduled | expired | inactive.
     */
    public function resolveStatus(?CarbonInterface $at = null): string
    {
        if (! $this->is_active) {
            return 'inactive';
        }

        $now = $at ?? now();

        if ($this->starts_at !== null && $this->starts_at->gt($now)) {
            return 'scheduled';
        }

        if ($this->ends_at !== null && $this->ends_at->lt($now)) {
            return 'expired';
        }

        if ($this->usage_limit !== null && $this->used_count >= $this->usage_limit) {
            return 'expired';
        }

        return 'active';
    }

    public function isCurrentlyValid(?CarbonInterface $at = null): bool
    {
        return $this->resolveStatus($at) === 'active';
    }

    public function appliesToProduct(Product $product): bool
    {
        if ($this->scope === self::SCOPE_ALL) {
            return true;
        }

        if ($this->scope === self::SCOPE_CATEGORY) {
            $target = mb_strtolower(trim((string) $this->target_category));
            if ($target === '') {
                return false;
            }

            return mb_strtolower(trim($product->category)) === $target
                || mb_strtolower(trim($product->event_category)) === $target
                || mb_strtolower(trim((string) $product->season_tag)) === $target;
        }

        if ($this->scope === self::SCOPE_PRODUCTS) {
            return $this->products->contains('id', $product->id);
        }

        return false;
    }

    public function calculateDiscountForAmount(float $amount): float
    {
        if ($amount <= 0) {
            return 0.0;
        }

        if ($this->discount_type === self::TYPE_PERCENTAGE) {
            $discount = round($amount * ($this->discount_value / 100));
            if ($this->max_discount_amount !== null && $this->max_discount_amount > 0) {
                $discount = min($discount, (float) $this->max_discount_amount);
            }

            return min($amount, max(0.0, $discount));
        }

        return min($amount, max(0.0, (float) $this->discount_value));
    }

    public function formatDiscountLabel(): string
    {
        if ($this->discount_type === self::TYPE_PERCENTAGE) {
            return "-{$this->discount_value}%";
        }

        return '-Rp '.number_format($this->discount_value, 0, ',', '.');
    }
}
