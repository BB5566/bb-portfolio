<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 首屏用的短自介（兩行內）；完整自介仍放 bio，內容由 ProfileSeeder 管理。
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->text('hero_intro')->nullable()->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('hero_intro');
        });
    }
};
