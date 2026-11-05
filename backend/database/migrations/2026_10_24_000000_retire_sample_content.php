<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * 清掉建表時塞的範例學歷與經歷（NTU、Tech Corp 等假資料）。真正的內容由 ProfileSeeder／ProjectSeeder 維護。
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::table('education')
            ->whereNotIn('school', ['輔仁大學', '勞動部勞動力發展署 泰山職業訓練場'])
            ->delete();

        // 不是正本裡那四段經歷的，一律隱藏（建表時的範例資料）
        DB::table('experiences')
            ->whereNotIn('start_date', ['2025-10-01', '2024-11-01', '2023-11-01', '2014-07-01'])
            ->update(['is_visible' => false]);
    }

    public function down(): void
    {
        // 範例資料不還原
    }
};
