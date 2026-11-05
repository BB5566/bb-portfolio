<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ExperienceResource;
use App\Models\Experience;
use App\Services\CacheService;
use Illuminate\Http\Request;

class ExperienceController extends Controller
{
    /**
     * 前台公開列表（只顯示 visible=true 的資料）
     */
    public function publicIndex()
    {
        return ExperienceResource::collection(
            Experience::visible()->ordered()->get()
        );
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Experience::query();

        // 只顯示可見的經歷（前台用）
        if ($request->get('visible_only', false)) {
            $query->visible();
        }

        $experiences = $query->ordered()->get();

        return response()->json($experiences);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'company' => 'required|string|max:255',
            'position' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'achievements' => 'nullable|array',
            'achievements.*' => 'string',
            'technologies' => 'nullable|array',
            'technologies.*' => 'string',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        // 如果是當前工作，清除結束日期
        if ($request->get('is_current', false)) {
            $validated['end_date'] = null;
        }

        $experience = Experience::create($validated);

        // 清除快取
        CacheService::clearFor('experiences');

        return response()->json([
            'message' => '工作經歷已新增',
            'data' => $experience,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $experience = Experience::findOrFail($id);

        return response()->json($experience);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $experience = Experience::findOrFail($id);

        $validated = $request->validate([
            'company' => 'sometimes|string|max:255',
            'position' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'achievements' => 'nullable|array',
            'achievements.*' => 'string',
            'technologies' => 'nullable|array',
            'technologies.*' => 'string',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        // 如果是當前工作，清除結束日期
        if ($request->get('is_current', false)) {
            $validated['end_date'] = null;
        }

        $experience->update($validated);

        // 清除快取
        CacheService::clearFor('experiences');

        return response()->json([
            'message' => '工作經歷已更新',
            'data' => $experience,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $experience = Experience::findOrFail($id);
        $experience->delete();

        // 清除快取
        CacheService::clearFor('experiences');

        return response()->json([
            'message' => '工作經歷已刪除',
        ]);
    }

    /**
     * Update the order of experiences
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:experiences,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        // 批次更新排序：使用 upsert 一次完成，避免 N+1 DB 查詢
        Experience::upsert(
            array_map(fn ($item) => [
                'id' => $item['id'],
                'sort_order' => $item['sort_order'],
            ], $validated['items']),
            ['id'],
            ['sort_order']
        );

        // 清除快取
        CacheService::clearFor('experiences');

        return response()->json([
            'message' => '排序已更新',
        ]);
    }
}
