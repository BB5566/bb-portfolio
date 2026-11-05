<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * 2024.11–2025.02 那段經歷已從 ProfileSeeder 拿掉（跟 104 履歷一致）；
 * seeder 只會新增／更新，不會刪掉舊的那一列，所以這裡把它隱藏。
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('experiences')
            ->where('start_date', '2024-11-01')
            ->update(['is_visible' => false]);
    }

    public function down(): void
    {
        DB::table('experiences')
            ->where('start_date', '2024-11-01')
            ->update(['is_visible' => true]);
    }
};
