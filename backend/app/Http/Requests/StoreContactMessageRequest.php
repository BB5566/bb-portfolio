<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreContactMessageRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // 公開 API,任何人都可以提交
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255'],
            'subject' => ['nullable', 'string', 'max:255'],
            'message' => ['required', 'string', 'min:10', 'max:5000'],
        ];
    }

    /**
     * Get custom messages for validator errors.
     *
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.required' => '請輸入您的姓名',
            'name.max' => '姓名不得超過 255 個字元',
            'email.required' => '請輸入您的電子郵件',
            'email.email' => '請輸入有效的電子郵件格式',
            'email.max' => '電子郵件不得超過 255 個字元',
            'subject.max' => '主旨不得超過 255 個字元',
            'message.required' => '請輸入訊息內容',
            'message.min' => '訊息內容至少需要 10 個字元',
            'message.max' => '訊息內容不得超過 5000 個字元',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        // 自動添加 IP 和 User Agent
        $this->merge([
            'ip_address' => $this->ip(),
            'user_agent' => $this->userAgent(),
        ]);
    }
}
