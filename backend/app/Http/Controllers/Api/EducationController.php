<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EducationResource;
use App\Models\Education;
use App\Services\CacheService;
use Illuminate\Http\Request;

class EducationController extends Controller
{
    /**
     * 前台公開列表（只顯示 visible=true 的資料）
     */
    public function publicIndex()
    {
        return EducationResource::collection(
            Education::visible()->ordered()->get()
        );
    }

    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Education::query();

        // 只顯示可見的教育背景（前台用）
        if ($request->get('visible_only', false)) {
            $query->visible();
        }

        $educations = $query->ordered()->get();

        return response()->json($educations);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'school' => 'required|string|max:255',
            'degree' => 'required|string|max:255',
            'field_of_study' => 'required|string|max:255',
            'location' => 'nullable|string|max:255',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'activities' => 'nullable|array',
            'activities.*' => 'string',
            'gpa' => 'nullable|numeric|min:0|max:4.0',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        // 如果是當前就讀，清除結束日期
        if ($request->get('is_current', false)) {
            $validated['end_date'] = null;
        }

        $education = Education::create($validated);

        // 清除快取
        CacheService::clearFor('education');

        return response()->json([
            'message' => '教育背景已新增',
            'data' => $education,
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $education = Education::findOrFail($id);

        return response()->json($education);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $education = Education::findOrFail($id);

        $validated = $request->validate([
            'school' => 'sometimes|string|max:255',
            'degree' => 'sometimes|string|max:255',
            'field_of_study' => 'sometimes|string|max:255',
            'location' => 'nullable|string|max:255',
            'start_date' => 'sometimes|date',
            'end_date' => 'nullable|date|after:start_date',
            'is_current' => 'boolean',
            'description' => 'nullable|string',
            'activities' => 'nullable|array',
            'activities.*' => 'string',
            'gpa' => 'nullable|numeric|min:0|max:4.0',
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ]);

        // 如果是當前就讀，清除結束日期
        if ($request->get('is_current', false)) {
            $validated['end_date'] = null;
        }

        $education->update($validated);

        // 清除快取
        CacheService::clearFor('education');

        return response()->json([
            'message' => '教育背景已更新',
            'data' => $education,
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $education = Education::findOrFail($id);
        $education->delete();

        // 清除快取
        CacheService::clearFor('education');

        return response()->json([
            'message' => '教育背景已刪除',
        ]);
    }

    /**
     * Update the order of education entries
     */
    public function updateOrder(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:education,id',
            'items.*.sort_order' => 'required|integer',
        ]);

        // 批次更新排序：使用 upsert 一次完成，避免 N+1 DB 查詢
        Education::upsert(
            array_map(fn ($item) => [
                'id' => $item['id'],
                'sort_order' => $item['sort_order'],
            ], $validated['items']),
            ['id'],
            ['sort_order']
        );

        // 清除快取
        CacheService::clearFor('education');

        return response()->json([
            'message' => '排序已更新',
        ]);
    }
}
