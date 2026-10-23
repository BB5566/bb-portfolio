<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            // HERO 區塊專用欄位
            $table->json('role_texts')->nullable()->after('subtitle'); // 打字效果文字陣列
            $table->string('display_name')->nullable()->after('name'); // 顯示名稱（可以與 name 不同）
            $table->string('display_name_sub')->nullable()->after('display_name'); // 姓氏顯示
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn(['role_texts', 'display_name', 'display_name_sub']);
        });
    }
};
