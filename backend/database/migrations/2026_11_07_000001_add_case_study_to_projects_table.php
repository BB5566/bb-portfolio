<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 首頁精選作品卡的「問題 → 做法 → 結果」；有填的作品才當精選，內容由 ProjectSeeder 管理。
     */
    public function up(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->json('case_study')->nullable()->after('features');
        });
    }

    public function down(): void
    {
        Schema::table('projects', function (Blueprint $table) {
            $table->dropColumn('case_study');
        });
    }
};
