<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
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
            'category_id' => 'sometimes|exists:categories,id',
            'title' => 'sometimes|string|max:255',
            'cover_image_url' => 'nullable|string',
            'preview_media_url' => 'nullable|string',
            'description' => 'sometimes|string',
            'technologies' => 'nullable|array',
            'technologies.*' => 'string',
            'features' => 'nullable|array',
            'features.*' => 'string',
            'project_link' => 'nullable|url',
            'github_link' => 'nullable|url',
            'sort_order' => 'nullable|integer',
            'is_published' => 'nullable|boolean',
            'galleries' => 'nullable|array',
            'galleries.*.image_url' => 'required|string',
            'galleries.*.caption' => 'nullable|string',
            'galleries.*.sort_order' => 'nullable|integer',
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
            'category_id.exists' => '所選分類不存在',
            'title.max' => '專案名稱不得超過 255 個字元',
            'project_link.url' => '專案連結必須為有效的網址格式',
            'github_link.url' => 'GitHub 連結必須為有效的網址格式',
            'galleries.*.image_url.required' => '圖庫圖片網址為必填',
        ];
    }
}
