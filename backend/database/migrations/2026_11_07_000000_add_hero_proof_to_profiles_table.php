<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 印刷打樣首頁（/v5）首屏的文案：大標、身分、自介、做法；內容由 ProfileSeeder 管理。
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->json('hero_proof')->nullable()->after('hero_intro');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('hero_proof');
        });
    }
};
