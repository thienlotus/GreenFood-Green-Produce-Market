<?php

namespace App\Modules\Product\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreProductRequest extends FormRequest
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
            'name' => 'required|string|max:255',
            'category_id' => 'required|integer|exists:categories,id',
            'farmer_id' => 'nullable|string|exists:farmers,id',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'stock' => 'nullable|integer|min:0',
            'unit' => 'nullable|string|max:50',
            'image_url' => 'nullable|string',
            'badge' => 'nullable|string|max:50',
            'is_seasonal' => 'nullable|boolean',
        ];
    }

    /**
     * Get custom error messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Tên sản phẩm không được để trống!',
            'price.required' => 'Giá sản phẩm không được để trống!',
            'price.numeric' => 'Giá sản phẩm phải là định dạng số!',
            'price.min' => 'Giá sản phẩm không được âm!',
            'category_id.required' => 'Danh mục không được để trống!',
            'category_id.exists' => 'Danh mục không tồn tại!',
            'farmer_id.exists' => 'Nông hộ được chọn không tồn tại!',
            'stock.min' => 'Số lượng tồn kho không được âm!',
        ];
    }

    /**
     * Handle a failed validation attempt.
     */
    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'status' => 400,
            'message' => $validator->errors()->first(),
            'errors' => $validator->errors()
        ], 400));
    }
}
