<?php

namespace App\Http\Requests\Admin\Concerns;

use App\Models\Promotion;
use Carbon\Carbon;
use Illuminate\Validation\Rule;
use Throwable;

trait FormatsPromotionInput
{
    protected function preparePromotionInputs(): void
    {
        $code = $this->input('code');
        $applyMode = $this->input('apply_mode', Promotion::MODE_AUTO);

        $this->merge([
            'code' => $applyMode === Promotion::MODE_CODE && is_string($code) && trim($code) !== ''
                ? strtoupper(trim($code))
                : null,
            'badge_text' => is_string($this->input('badge_text')) && trim($this->input('badge_text')) !== ''
                ? trim($this->input('badge_text'))
                : null,
            'target_category' => $this->input('scope') === Promotion::SCOPE_CATEGORY && is_string($this->input('target_category')) && trim($this->input('target_category')) !== ''
                ? trim($this->input('target_category'))
                : null,
            'max_discount_amount' => $this->filled('max_discount_amount') ? $this->input('max_discount_amount') : null,
            'min_order_amount' => $this->filled('min_order_amount') ? $this->input('min_order_amount') : null,
            'usage_limit' => $this->filled('usage_limit') ? $this->input('usage_limit') : null,
            'starts_at' => $this->normalizeDateInput($this->input('starts_at')),
            'ends_at' => $this->normalizeDateInput($this->input('ends_at')),
        ]);
    }

    private function normalizeDateInput(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        try {
            return Carbon::parse($value)
                ->setTimezone((string) config('app.timezone'))
                ->format('Y-m-d H:i:s');
        } catch (Throwable) {
            return $value;
        }
    }

    /**
     * @return array<string, mixed>
     */
    protected function basePromotionRules(?int $ignorePromotionId = null): array
    {
        $isPercentage = $this->input('discount_type') === Promotion::TYPE_PERCENTAGE;

        $uniqueCodeRule = Rule::unique('promotions', 'code');
        if ($ignorePromotionId !== null) {
            $uniqueCodeRule = $uniqueCodeRule->ignore($ignorePromotionId);
        }

        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'badge_text' => ['nullable', 'string', 'max:50'],
            'apply_mode' => ['required', 'string', Rule::in([Promotion::MODE_AUTO, Promotion::MODE_CODE])],
            'code' => [
                'nullable',
                'required_if:apply_mode,'.Promotion::MODE_CODE,
                'string',
                'max:50',
                'alpha_dash',
                $uniqueCodeRule,
            ],
            'discount_type' => ['required', 'string', Rule::in([Promotion::TYPE_PERCENTAGE, Promotion::TYPE_FIXED])],
            'discount_value' => [
                'required',
                'integer',
                'min:1',
                Rule::when($isPercentage, ['max:99']),
            ],
            'max_discount_amount' => ['nullable', 'integer', 'min:1000'],
            'min_order_amount' => ['nullable', 'integer', 'min:0'],
            'scope' => ['required', 'string', Rule::in([Promotion::SCOPE_ALL, Promotion::SCOPE_CATEGORY, Promotion::SCOPE_PRODUCTS])],
            'target_category' => ['nullable', 'required_if:scope,'.Promotion::SCOPE_CATEGORY, 'string', 'max:100'],
            'product_ids' => ['nullable', 'required_if:scope,'.Promotion::SCOPE_PRODUCTS, 'array'],
            'product_ids.*' => ['integer', 'exists:products,id'],
            'starts_at' => ['nullable', 'date'],
            'ends_at' => [
                'nullable',
                'date',
                Rule::when($this->filled('starts_at'), ['after:starts_at']),
            ],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['boolean'],
        ];
    }

    /**
     * @return array<string, string>
     */
    protected function basePromotionMessages(): array
    {
        return [
            'code.required_if' => 'Kode promo wajib diisi jika mode menggunakan kode voucher.',
            'code.unique' => 'Kode promo ini sudah digunakan oleh promo lain.',
            'code.alpha_dash' => 'Kode promo hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah.',
            'discount_value.max' => 'Persentase diskon maksimal 99%.',
            'ends_at.after' => 'Waktu berakhir promo harus setelah waktu mulai.',
            'target_category.required_if' => 'Pilih atau isi kategori target promo.',
            'product_ids.required_if' => 'Pilih minimal satu produk untuk cakupan produk pilihan.',
        ];
    }
}
