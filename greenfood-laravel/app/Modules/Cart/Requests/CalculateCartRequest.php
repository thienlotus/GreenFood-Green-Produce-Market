<?php

namespace App\Modules\Cart\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class CalculateCartRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            'items' => 'required|array|min:1',
            'items.*.variant_id' => 'nullable|string',
            'items.*.product_id' => 'nullable|string',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price' => 'nullable|numeric|min:0',
            'shipping_zone_id' => 'nullable|string|exists:shipping_zones,id',
            'voucher_code' => 'nullable|string',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'items.required' => 'Giỏ hàng không được để trống!',
            'items.array' => 'Dữ liệu giỏ hàng phải là một danh sách hợp lệ!',
            'items.min' => 'Giỏ hàng phải có ít nhất 1 sản phẩm!',
            'items.*.quantity.required' => 'Số lượng sản phẩm không được để trống!',
            'items.*.quantity.integer' => 'Số lượng sản phẩm phải là số nguyên!',
            'items.*.quantity.min' => 'Số lượng sản phẩm tối thiểu là 1!',
            'shipping_zone_id.exists' => 'Khu vực giao hàng không tồn tại trong hệ thống!',
        ];
    }

    /**
     * Configure the validator instance.
     */
    public function withValidator(Validator $validator)
    {
        $validator->after(function ($validator) {
            $items = $this->input('items', []);
            if (is_array($items)) {
                foreach ($items as $index => $item) {
                    if (empty($item['variant_id']) && empty($item['product_id'])) {
                        $validator->errors()->add(
                            "items.{$index}",
                            "Sản phẩm tại dòng " . ($index + 1) . " phải chứa variant_id hoặc product_id hợp lệ!"
                        );
                    }
                }
            }
        });
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
            'errors' => $validator->errors()
        ], 422));
    }
}
