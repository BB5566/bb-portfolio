<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('projects', 'slug')) {
            // First add the column as nullable so it doesn't crash on existing records
            Schema::table('projects', function (Blueprint $table) {
                $table->string('slug', 100)->nullable()->after('category_id')->comment('專案代稱');
            });
        }

        // Migrate existing records by fetching the exact slugs they're mapped to
        // If we can't map, we fallback to Str::slug(title)
        $projects = \Illuminate\Support\Facades\DB::table('projects')->get();
        foreach ($projects as $project) {
            $slugMapping = [
                '地端 AI 內容產線' => 'ai-content-pipeline',
                '杰哥：本地 AI 助理' => 'jay-go-ai-assistant',
                '學生端頁面載入優化' => 'student-page-load-optimization',
                '跨站資安弱掃修補與測試基建' => 'cross-site-security-patching',
                'Portfolio OS（本站）' => 'portfolio-os',
                '食在輔大' => 'eat-at-fju',
                'stock-sync 多平台庫存同步' => 'stock-sync',
                'MoodCanvas' => 'moodcanvas',
                '鯛輪軒 品牌識別與點餐 App UI' => 'taiyaki-brand-and-app-ui',
                '運動用品電商活動視覺' => 'sports-ecommerce-visuals',
                '社群促銷貼文與產品資訊圖' => 'social-promotions-and-infographics',
                '餐飲品牌 LOGO 與周邊應用' => 'food-brand-logos',
            ];

            $slug = $slugMapping[$project->title] ?? \Illuminate\Support\Str::slug($project->title).'-'.$project->id;

            \Illuminate\Support\Facades\DB::table('projects')
                ->where('id', $project->id)
                ->update(['slug' => $slug]);
        }

        // Make it unique and non-nullable
        Schema::table('projects', function (Blueprint $table) {
            // Laravel 11 with native schema index methods
            $hasUniqueIndex = collect(Schema::getIndexes('projects'))
                ->contains(fn ($index) => in_array('slug', $index['columns']) && $index['unique']);

            if (! $hasUniqueIndex) {
                $table->unique('slug');
            }
            $table->string('slug', 100)->nullable(false)->change();
        });
    }

    public function down(): void
    {
        if (Schema::hasColumn('projects', 'slug')) {
            Schema::table('projects', function (Blueprint $table) {
                $table->dropUnique(['slug']);
                $table->dropColumn('slug');
            });
        }
    }
};
