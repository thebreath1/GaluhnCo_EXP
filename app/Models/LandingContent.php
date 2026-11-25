<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LandingContent extends Model
{
    protected $fillable = [
        'section',
        'key',
        'value',
        'type',
    ];

    /**
     * Mengambil seluruh konten landing page terkelompok berdasarkan section.
     *
     * @return array<string, array<string, string|null>>
     */
    public static function getGroupedContents(): array
    {
        /** @var array<string, array<string, string|null>> $grouped */
        $grouped = [];

        foreach (self::query()->get() as $item) {
            $value = $item->value;

            if (
                $item->type === 'image'
                && is_string($value)
                && $value !== ''
                && ! str_starts_with($value, 'http://')
                && ! str_starts_with($value, 'https://')
                && ! str_starts_with($value, '/')
            ) {
                $value = asset('storage/'.ltrim($value, '/'));
            }

            $grouped[$item->section][$item->key] = $value;
        }

        return $grouped;
    }

    /**
     * Mengambil konfigurasi pita pengumuman musiman (Seasonal Ribbon).
     *
     * @return array{active: bool, text: string, link: string}
     */
    public static function getSeasonalRibbon(): array
    {
        /** @var array<string, string|null> $items */
        $items = self::query()
            ->where('section', 'seasonal')
            ->pluck('value', 'key')
            ->all();

        $activeRaw = $items['seasonal_ribbon_active'] ?? '0';
        $text = trim((string) ($items['seasonal_ribbon_text'] ?? ''));
        $link = trim((string) ($items['seasonal_ribbon_link'] ?? '/katalog'));

        return [
            'active' => $activeRaw === '1' && $text !== '',
            'text' => $text,
            'link' => $link !== '' ? $link : '/katalog',
        ];
    }
}
