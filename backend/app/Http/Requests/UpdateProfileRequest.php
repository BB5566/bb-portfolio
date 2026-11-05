<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProfileRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // 認證由 middleware 處理
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'sometimes|string|max:255',
            'display_name' => 'nullable|string|max:255',
            'display_name_sub' => 'nullable|string|max:255',
            'title' => 'nullable|string|max:255',
            'subtitle' => 'nullable|string|max:255',
            'role_texts' => 'nullable|array',
            'role_texts.*' => 'string|max:255',
            'bio' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:50',
            'location' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|max:2048',
            'resume' => 'nullable|file|mimes:pdf|max:5120',
            'resume_url' => 'nullable|string|max:255',
            'github' => 'nullable|string|max:255',
            'linkedin' => 'nullable|string|max:255',
            'twitter' => 'nullable|url|max:255',
            'facebook' => 'nullable|url|max:255',
            'instagram' => 'nullable|url|max:255',
            'website' => 'nullable|url|max:255',
            'skills' => 'nullable|array',
            'years_experience' => 'nullable|integer|min:0|max:100',
            'projects_delivered' => 'nullable|integer|min:0|max:9999',
            'hours_training' => 'nullable|integer|min:0|max:99999',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string',
            'meta_keywords' => 'nullable|string|max:255',
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
            'name.max' => '姓名不得超過 255 個字元',
            'email.email' => '請輸入有效的電子郵件格式',
            'email.max' => '電子郵件不得超過 255 個字元',
            'avatar.image' => '大頭照必須為圖片格式',
            'avatar.max' => '大頭照檔案不得超過 2MB',
            'resume.mimes' => '履歷必須為 PDF 格式',
            'resume.max' => '履歷檔案不得超過 5MB',
            'twitter.url' => 'Twitter 連結必須為有效的網址格式',
            'facebook.url' => 'Facebook 連結必須為有效的網址格式',
            'instagram.url' => 'Instagram 連結必須為有效的網址格式',
            'website.url' => '網站連結必須為有效的網址格式',
            'years_experience.min' => '工作年資不得小於 0',
            'years_experience.max' => '工作年資不得超過 100',
        ];
    }
}
