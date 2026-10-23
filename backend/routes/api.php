<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AIController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ContactController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\EducationController;
use App\Http\Controllers\Api\ExperienceController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\TagController;
use App\Http\Controllers\Api\UploadController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

// ==========================================
// 認證路由 (不需要認證)
// ==========================================
Route::prefix('v1')->group(function () {
    Route::post('/auth/login', [AuthController::class, 'login'])
        ->middleware('throttle:10,1');

    // 僅開發環境允許註冊
    if (app()->environment('local')) {
        Route::post('/auth/register', [AuthController::class, 'register']);
    }
});

// ==========================================
// 健康檢查 (Docker healthcheck 用)
// ==========================================
Route::get('/v1/health', function () {
    try {
        DB::select('SELECT 1');

        return response()->json([
            'status' => 'healthy',
            'database' => 'connected',
            'timestamp' => now()->toIso8601String(),
        ]);
    } catch (Throwable) {
        return response()->json([
            'status' => 'unhealthy',
            'database' => 'disconnected',
            'timestamp' => now()->toIso8601String(),
        ], 503);
    }
});

// ==========================================
// 需要認證的路由
// ==========================================
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/user', [AuthController::class, 'user']);
});

// ==========================================
// 動態 Sitemap
// ==========================================
Route::get('/v1/sitemap', function () {
    $projects = \App\Models\Project::where('is_published', true)
        ->orderBy('sort_order')
        ->get(['id', 'updated_at']);

    $xml = '<?xml version="1.0" encoding="UTF-8"?>'."\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

    // Homepage
    $xml .= '  <url><loc>https://bb-made.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>'."\n";

    // Projects
    foreach ($projects as $project) {
        $lastmod = $project->updated_at->format('Y-m-d');
        $xml .= "  <url><loc>https://bb-made.com/projects/{$project->id}</loc><lastmod>{$lastmod}</lastmod><changefreq>monthly</changefreq><priority>0.7</priority></url>\n";
    }

    $xml .= '</urlset>';

    return response($xml, 200, ['Content-Type' => 'application/xml']);
});

// ==========================================
// Public API routes (前台公開)
// ==========================================
Route::prefix('v1')->group(function () {
    // Projects
    Route::get('/projects', [ProjectController::class, 'index']);
    Route::get('/projects/{project}', [ProjectController::class, 'show']);

    // Categories
    Route::get('/categories', [CategoryController::class, 'index']);
    Route::get('/categories/{category}', [CategoryController::class, 'show']);

    // Tags
    Route::get('/tags', [TagController::class, 'index']);
    Route::get('/tags/{tag}', [TagController::class, 'show']);

    // Profile (Public - 前台顯示用)
    Route::get('/profile', [ProfileController::class, 'index']);

    // Experiences (Public - 前台顯示用，只顯示 visible=true 的資料)
    Route::get('/experiences', [ExperienceController::class, 'publicIndex']);

    // Education (Public - 前台顯示用，只顯示 visible=true 的資料)
    Route::get('/education', [EducationController::class, 'publicIndex']);

    // Contact (Public - 前台聯絡表單提交)
    // Rate limit: 5 次請求 / 每分鐘，防止濫用
    Route::post('/contact', [ContactController::class, 'store'])
        ->middleware('throttle:5,1');
});

// ==========================================
// AI 生成 API (MoodCanvas 等專案用)
// ==========================================
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:30,1'])->group(function () {
    // 圖片提示詞優化 (將日記內容轉換為圖像生成提示詞)
    Route::post('/ai/generate-prompt', [AIController::class, 'generatePrompt']);

    // 勵志語錄生成 (從日記內容生成靈感名言)
    Route::post('/ai/generate-quote', [AIController::class, 'generateQuote']);

    // 儀表板洞察 (多篇日記的整體分析與心理建議)
    Route::post('/ai/dashboard-insight', [AIController::class, 'dashboardInsight']);
});

// ==========================================
// Protected API routes (管理後台，需要認證)
// ==========================================
Route::prefix('v1')->middleware(['auth:sanctum', 'throttle:60,1'])->group(function () {
    // Dashboard 統計
    Route::get('/admin/dashboard/stats', [DashboardController::class, 'stats']);
    Route::post('/admin/dashboard/clear-cache', [DashboardController::class, 'clearCache']);

    // 統一影像上傳 (WebP 自動化)
    Route::post('/admin/upload-image', [UploadController::class, 'uploadImage']);

    // Projects 管理
    Route::get('/admin/projects', [ProjectController::class, 'adminIndex']); // 後台專用，顯示所有專案包括隱藏的
    Route::get('/admin/projects/{project}', [ProjectController::class, 'show']); // 取得單一專案
    Route::post('/admin/projects', [ProjectController::class, 'store']);
    Route::put('/admin/projects/{project}', [ProjectController::class, 'update']);
    Route::patch('/admin/projects/{project}', [ProjectController::class, 'update']);
    Route::delete('/admin/projects/{project}', [ProjectController::class, 'destroy']);

    // 批次操作
    Route::post('/admin/projects/batch-delete', [ProjectController::class, 'batchDelete']);
    Route::post('/admin/projects/batch-update-status', [ProjectController::class, 'batchUpdateStatus']);
    Route::post('/admin/projects/batch-sort', [ProjectController::class, 'batchUpdateSort']);

    // 更新排序 (單一專案)
    Route::patch('/admin/projects/{project}/sort', [ProjectController::class, 'updateSortOrder']);

    // Categories 管理
    Route::post('/categories', [CategoryController::class, 'store']);
    Route::put('/categories/{category}', [CategoryController::class, 'update']);
    Route::delete('/categories/{category}', [CategoryController::class, 'destroy']);

    // Tags 管理
    Route::post('/tags', [TagController::class, 'store']);
    Route::put('/tags/{tag}', [TagController::class, 'update']);
    Route::delete('/tags/{tag}', [TagController::class, 'destroy']);

    // Profile 管理 (只有一筆資料，使用固定 ID=1)
    Route::get('/admin/profile', [ProfileController::class, 'index']);
    Route::put('/admin/profile', [ProfileController::class, 'update']);
    Route::post('/admin/profile', [ProfileController::class, 'store']);

    // Experiences 管理 (後台可以看到所有，包括隱藏的)
    Route::apiResource('admin/experiences', ExperienceController::class);
    Route::post('/admin/experiences/order', [ExperienceController::class, 'updateOrder']);

    // Education 管理 (後台可以看到所有，包括隱藏的)
    Route::apiResource('admin/education', EducationController::class);
    Route::post('/admin/education/order', [EducationController::class, 'updateOrder']);

    // Contact Messages 管理
    Route::get('/admin/contact-messages', [ContactController::class, 'index']);
    Route::get('/admin/contact-messages/stats', [ContactController::class, 'stats']);
    Route::get('/admin/contact-messages/{contactMessage}', [ContactController::class, 'show']);
    Route::patch('/admin/contact-messages/{contactMessage}/read', [ContactController::class, 'markAsRead']);
    Route::patch('/admin/contact-messages/{contactMessage}/unread', [ContactController::class, 'markAsUnread']);
    Route::delete('/admin/contact-messages/{contactMessage}', [ContactController::class, 'destroy']);
});
