<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TagController extends Controller
{
    /**
     * 取得所有標籤及其專案數量
     */
    public function index(): JsonResponse
    {
        $tags = CacheService::remember('tags.all', 3600, function () {
            return Tag::withCount('projects')->get();
        });

        return response()->json($tags);
    }

    /**
     * 新增標籤（管理員功能）
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:50|unique:tags',
            'category' => 'required|in:Frontend,Backend,Database,Design,Tool',
        ]);

        $tag = Tag::create($validated);

        // 清除快取
        CacheService::clearFor('tags');

        return response()->json($tag, 201);
    }

    /**
     * 取得特定標籤的所有專案
     */
    public function show(Tag $tag): JsonResponse
    {
        $tag->load(['projects' => function ($query) {
            $query->published()
                ->with(['category', 'galleries'])
                ->orderBy('sort_order')
                ->orderBy('created_at', 'desc');
        }]);

        return response()->json($tag);
    }

    /**
     * 更新標籤（管理員功能）
     */
    public function update(Request $request, Tag $tag): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|string|max:50|unique:tags,name,'.$tag->id,
            'category' => 'sometimes|in:Frontend,Backend,Database,Design,Tool',
        ]);

        $tag->update($validated);

        // 清除快取
        CacheService::clearFor('tags');

        return response()->json($tag);
    }

    /**
     * 刪除標籤（管理員功能）
     */
    public function destroy(Tag $tag): JsonResponse
    {
        $tag->delete();

        // 清除快取
        CacheService::clearFor('tags');

        return response()->json(['message' => '標籤已成功刪除'], 200);
    }
}
