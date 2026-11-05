<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * 首屏三個亮點數字（value / label），內容由 ProfileSeeder 管理。
     */
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->json('highlights')->nullable()->after('hours_training');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropColumn('highlights');
        });
    }
};
