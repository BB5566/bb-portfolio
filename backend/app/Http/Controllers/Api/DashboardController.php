<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\ContactMessage;
use App\Models\Education;
use App\Models\Experience;
use App\Models\Project;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    /**
     * 獲取儀表板統計資料
     */
    public function stats(): JsonResponse
    {
        // 使用快取來提升效能（快取 5 分鐘）
        $stats = Cache::remember('dashboard.stats', 300, function () {
            $totalProjects = Project::count();
            $publishedProjects = Project::where('is_published', true)->count();
            $unpublishedProjects = $totalProjects - $publishedProjects;

            $totalMessages = ContactMessage::count();
            $unreadMessages = ContactMessage::where('is_read', false)->count();
            $readMessages = $totalMessages - $unreadMessages;

            return [
                // 專案統計
                'totalProjects' => $totalProjects,
                'publishedProjects' => $publishedProjects,
                'unpublishedProjects' => $unpublishedProjects,

                // 分類和標籤統計
                'totalCategories' => Category::count(),
                'totalTags' => Tag::count(),

                // 聯絡訊息統計
                'totalMessages' => $totalMessages,
                'unreadMessages' => $unreadMessages,
                'readMessages' => $readMessages,

                // 個人資料統計
                'totalExperiences' => Experience::count(),
                'visibleExperiences' => Experience::where('is_visible', true)->count(),
                'totalEducation' => Education::count(),
                'visibleEducation' => Education::where('is_visible', true)->count(),

                // 最近的專案（最新的 5 個）
                'recentProjects' => Project::with(['category', 'tags'])
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($project) {
                        return [
                            'id' => $project->id,
                            'title' => $project->title,
                            'category' => $project->category ? $project->category->name : null,
                            'is_published' => $project->is_published,
                            'created_at' => $project->created_at->toDateTimeString(),
                        ];
                    }),

                // 最近的訊息（最新的 5 個未讀訊息）
                'recentMessages' => ContactMessage::where('is_read', false)
                    ->latest()
                    ->take(5)
                    ->get()
                    ->map(function ($message) {
                        return [
                            'id' => $message->id,
                            'name' => $message->name,
                            'email' => $message->email,
                            'subject' => $message->subject,
                            'created_at' => $message->created_at->toDateTimeString(),
                        ];
                    }),

                // 專案發布狀態分佈
                'projectPublishDistribution' => [
                    'published' => $publishedProjects,
                    'unpublished' => $unpublishedProjects,
                ],

                // 專案分類分佈
                'projectCategoryDistribution' => Category::withCount('projects')
                    ->get()
                    ->map(function ($category) {
                        return [
                            'name' => $category->name,
                            'count' => $category->projects_count,
                        ];
                    }),
            ];
        });

        return response()->json($stats);
    }

    /**
     * 清除儀表板統計快取
     */
    public function clearCache(): JsonResponse
    {
        Cache::forget('dashboard.stats');

        return response()->json([
            'message' => '儀表板快取已清除',
        ]);
    }
}
