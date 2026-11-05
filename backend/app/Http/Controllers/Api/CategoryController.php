<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    /**
     * 取得所有分類及其專案數量
     */
    public function index(): JsonResponse
    {
        $categories = CacheService::remember('categories.all', 3600, function () {
            return Category::withCount('projects')->get();
        });

        return response()->json($categories);
    }

    /**
     * 新增分類（管理員功能）
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:100',
            'slug' => 'required|string|max:100|unique:categories',
            'description' => 'nullable|string|max:255',
        ]);

        $category = Category::create($validated);

        // 清除快取
        CacheService::clearFor('categories');

        return response()->json($category, 201);
    }

    /**
     * 取得特定分類的所有專案
     */
    public function show(Category $category): JsonResponse
    {
        $category->load(['projects' => function ($query) {
            $query->published()
                ->with(['tags', 'galleries'])
                ->orderBy('sort_order')
                ->orderBy('created_at', 'desc');
        }]);

        return response()->json($category);
    }

    /**
     * 更新分類（管理員功能）
     */
    public function update(Request $request, Category $category): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:100',
            'slug' => 'sometimes|string|max:100|unique:categories,slug,'.$category->id,
            'description' => 'nullable|string|max:255',
        ]);

        $category->update($validated);

        // 清除快取
        CacheService::clearFor('categories');

        return response()->json($category);
    }

    /**
     * 刪除分類（管理員功能）
     */
    public function destroy(Category $category): JsonResponse
    {
        $category->delete();

        // 清除快取
        CacheService::clearFor('categories');
        CacheService::clearFor('projects'); // 刪除分類會影響專案

        return response()->json(['message' => '分類已成功刪除'], 200);
    }
}
