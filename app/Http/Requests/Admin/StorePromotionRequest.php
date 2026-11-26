<?php

namespace App\Http\Requests\Admin;

use App\Http\Requests\Admin\Concerns\FormatsPromotionInput;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StorePromotionRequest extends FormRequest
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
        return $this->basePromotionRules();
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return $this->basePromotionMessages();
    }
}
