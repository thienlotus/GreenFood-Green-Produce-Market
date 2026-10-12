<?php

declare(strict_types=1);

namespace App\Modules\B2B\Requests;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreB2bInquiryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('phone')) {
            $cleanPhone = preg_replace('/\D/', '', (string)$this->phone);
            $this->merge(['phone' => $cleanPhone]);
        }
        if ($this->has('company_name')) {
            $this->merge(['company_name' => trim((string)$this->company_name)]);
        }
        if ($this->has('contact_name')) {
            $this->merge(['contact_name' => trim((string)$this->contact_name)]);
        }
        if ($this->has('email') && !empty($this->email)) {
            $this->merge(['email' => strtolower(trim((string)$this->email))]);
        }
    }

    public function rules(): array
    {
        return [
            'company_name' => ['required', 'string', 'max:255'],
            'contact_name' => ['required', 'string', 'max:150'],
            'phone' => ['required', 'string', 'regex:/^(0|\+?84)[35789][0-9]{8}$/'],
            'email' => ['nullable', 'email', 'max:150'],
            'tax_id' => ['nullable', 'string', 'max:30'],
            'business_type' => ['required', 'string', 'max:150'],
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string'],
            'estimated_volume' => ['nullable', 'string', 'max:100'],
            'delivery_time' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'company_name.required' => 'Vui lòng cung cấp tên doanh nghiệp hoặc nhà hàng.',
            'contact_name.required' => 'Vui lòng nhập tên người đại diện liên hệ.',
            'phone.required' => 'Vui lòng nhập số điện thoại liên hệ.',
            'phone.regex' => 'Số điện thoại không đúng định dạng di động Việt Nam (10 số).',
            'email.email' => 'Địa chỉ email không đúng định dạng.',
            'business_type.required' => 'Vui lòng chọn loại hình kinh doanh của quý khách.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => $validator->errors()->first(),
            'errors' => $validator->errors(),
        ], 422));
    }
}
