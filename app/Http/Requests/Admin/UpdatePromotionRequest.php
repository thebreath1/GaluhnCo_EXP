<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\FormatsPromotionInput;
use App\Models\Promotion;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdatePromotionRequest extends FormRequest
{
    use FormatsPromotionInput;

    public function authorize(): bool
    {
        return $this->user()?->isAdmin() === true;
    }

    protected function prepareForValidation(): void
    {
        $this->preparePromotionInputs();
    }

    /**
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        /** @var Promotion|int|string|null $routePromotion */
        $routePromotion = $this->route('promotion');
        $promotionId = $routePromotion instanceof Promotion
            ? $routePromotion->id
            : (is_numeric($routePromotion) ? (int) $routePromotion : null);

        return $this->basePromotionRules($promotionId);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->basePromotionMessages();
    }
}
