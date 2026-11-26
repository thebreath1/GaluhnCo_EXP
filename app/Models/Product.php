<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string $category
 * @property string $short_description
 * @property array<int, string> $contents
 * @property int $price_from
 * @property string|null $image
 * @property int $sort_order
 * @property bool $is_active
 * @property string $event_category
 * @property string|null $season_tag
 * @property bool $is_best_seller
 * @property CarbonImmutable|null $created_at
 * @property CarbonImmutable|null $updated_at
 */
class Product extends Model
{
    protected $fillable = [
        'name',
        'slug',
        'category',
        'short_description',
        'contents',
        'price_from',
        'image',
        'sort_order',
        'is_active',
        'event_category',
        'season_tag',
        'is_best_seller',
    ];

    protected function casts(): array
    {
        return [
            'contents' => 'array',
            'price_from' => 'integer',
            'sort_order' => 'integer',
            'is_active' => 'boolean',
            'is_best_seller' => 'boolean',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name);
            }
        });
    }

    /**
     * @return BelongsToMany<Promotion, $this>
     */
    public function promotions(): BelongsToMany
    {
        return $this->belongsToMany(Promotion::class, 'promotion_product');
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true)->orderBy('sort_order');
    }
}
