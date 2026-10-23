<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Models\Project;
use App\Services\CacheService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class ProjectController extends Controller
{
    /**
     * 取得所有已發布的專案列表（前台公開使用）
     * 快取 1 小時,提升前台載入速度
     */
    public function index(): JsonResponse
    {
        $projects = Cache::remember('projects.published', 3600, function () {
            return Project::with(['category', 'tags', 'galleries'])
                ->published()
                ->orderBy('sort_order')
                ->orderBy('created_at', 'desc')
                ->get();
        });

        return response()->json($projects);
    }

    /**
     * 取得所有專案列表（後台管理使用，包括未發布的）
     */
    public function adminIndex(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 15), 100);

        $query = Project::with(['category', 'tags', 'galleries'])
            ->orderBy('sort_order')
            ->orderBy('created_at', 'desc');

        if ($perPage === 'all' || $perPage == 100) {
            $projects = $query->get();

            return response()->json($projects);
        }

        $projects = $query->paginate($perPage);

        return response()->json($projects);
    }

    /**
     * 取得單一專案詳情
     */
    public function show(Project $project): JsonResponse
    {
        $project->load(['category', 'tags', 'galleries']);

        return response()->json($project);
    }

    /**
     * 新增專案（管理員功能）
     */
    public function store(StoreProjectRequest $request): JsonResponse
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($request, $validated) {
            $project = Project::create($validated);

            // 如果有圖庫資料，進行同步
            if ($request->has('galleries')) {
                $this->syncGalleries($project, $request->galleries);
            }

            // 如果有 tags 或 tag_ids，同步標籤
            if ($request->has('tag_ids')) {
                $project->tags()->sync($request->tag_ids);
            } elseif ($request->has('tags')) {
                $project->tags()->sync($request->tags);
            }

            // 清除快取
            CacheService::clearFor('projects');

            return response()->json($project->load(['category', 'tags', 'galleries']), 201);
        });
    }

    /**
     * 更新專案（管理員功能）
     */
    public function update(UpdateProjectRequest $request, Project $project): JsonResponse
    {
        $validated = $request->validated();

        return DB::transaction(function () use ($request, $project, $validated) {
            // 處理封面圖更新：如果新舊不同，刪除舊檔
            if ($request->has('cover_image_url')) {
                $oldCover = $project->cover_image_url;
                $newCover = $request->input('cover_image_url');

                if ($oldCover && $newCover && $oldCover !== $newCover) {
                    Storage::disk('public')->delete($oldCover);
                }
            }

            $project->update($validated);

            // 如果有圖庫資料，進行同步
            if ($request->has('galleries')) {
                $this->syncGalleries($project, $request->galleries);
            }

            // 如果有 tags 或 tag_ids，同步標籤
            if ($request->has('tag_ids')) {
                $project->tags()->sync($request->tag_ids);
            } elseif ($request->has('tags')) {
                $project->tags()->sync($request->tags);
            }

            // 清除快取
            CacheService::clearFor('projects');

            return response()->json($project->load(['category', 'tags', 'galleries']));
        });
    }

    /**
     * 刪除專案（管理員功能）
     */
    public function destroy(Project $project): JsonResponse
    {
        // 1. 刪除封面圖
        if ($project->cover_image_url) {
            Storage::disk('public')->delete($project->cover_image_url);
        }

        // 2. 刪除圖庫所有實體檔案
        foreach ($project->galleries as $gallery) {
            Storage::disk('public')->delete($gallery->image_url);
        }

        // 3. 刪除資料庫紀錄
        $project->delete();

        // 清除快取
        CacheService::clearFor('projects');

        return response()->json(['message' => '專案已成功刪除'], 200);
    }

    /**
     * 批次刪除專案（管理員功能）
     */
    public function batchDelete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:projects,id',
        ]);

        DB::beginTransaction();
        try {
            $projects = Project::with('galleries')->whereIn('id', $validated['ids'])->get();

            foreach ($projects as $project) {
                // 刪除封面圖
                if ($project->cover_image_url) {
                    Storage::disk('public')->delete($project->cover_image_url);
                }

                // 刪除圖庫所有實體檔案
                foreach ($project->galleries as $gallery) {
                    Storage::disk('public')->delete($gallery->image_url);
                }
            }

            $deletedCount = $projects->count();
            Project::whereIn('id', $validated['ids'])->delete();

            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            throw $e;
        }

        // 清除相關快取
        CacheService::clearFor('projects');

        return response()->json([
            'message' => "成功刪除 {$deletedCount} 個專案",
            'deleted_count' => $deletedCount,
        ], 200);
    }

    /**
     * 批次更新發布狀態（管理員功能）
     */
    public function batchUpdateStatus(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|integer|exists:projects,id',
            'is_published' => 'required|boolean',
        ]);

        $updatedCount = Project::whereIn('id', $validated['ids'])
            ->update(['is_published' => $validated['is_published']]);

        // 清除相關快取
        CacheService::clearFor('projects');

        $status = $validated['is_published'] ? '發布' : '取消發布';

        return response()->json([
            'message' => "成功{$status} {$updatedCount} 個專案",
            'updated_count' => $updatedCount,
        ], 200);
    }

    /**
     * 更新專案排序（管理員功能）
     */
    public function updateSortOrder(Request $request, Project $project): JsonResponse
    {
        $validated = $request->validate([
            'sort_order' => 'required|integer|min:0',
        ]);

        $project->update(['sort_order' => $validated['sort_order']]);

        return response()->json($project->load(['category', 'tags', 'galleries']), 200);
    }

    /**
     * 批次更新排序（拖拉排序用）
     */
    public function batchUpdateSort(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:projects,id',
            'items.*.sort_order' => 'required|integer|min:0',
        ]);

        // 批次更新排序：使用 upsert 一次完成，避免 N+1 DB 查詢
        Project::upsert(
            array_map(fn ($item) => [
                'id' => $item['id'],
                'sort_order' => $item['sort_order'],
            ], $validated['items']),
            ['id'],
            ['sort_order']
        );

        // 清除快取
        CacheService::clearFor('projects');

        return response()->json(['message' => '排序已更新']);
    }

    /**
     * 同步專案圖庫
     */
    private function syncGalleries(Project $project, array $galleries): void
    {
        // 取得現有的 ID 以供比對刪除
        $currentIds = collect($galleries)->pluck('id')->filter()->toArray();

        // 刪除前先抓出要刪除的檔案路徑，進行物理刪除
        $toDelete = $project->galleries()->whereNotIn('id', $currentIds)->get();
        foreach ($toDelete as $item) {
            Storage::disk('public')->delete($item->image_url);
        }

        // 執行資料庫刪除
        $project->galleries()->whereNotIn('id', $currentIds)->delete();

        foreach ($galleries as $index => $item) {
            $project->galleries()->updateOrCreate(
                ['id' => $item['id'] ?? null],
                [
                    'image_url' => $item['image_url'],
                    'caption' => $item['caption'] ?? null,
                    'sort_order' => $item['sort_order'] ?? $index,
                ]
            );
        }
    }
}
