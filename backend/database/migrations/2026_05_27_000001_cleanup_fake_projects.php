<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 刪掉假的專案 (id 6-10)
        DB::table('projects')->whereIn('id', [6, 7, 8, 9, 10])->delete();
        // 清除關聯的照片
        DB::table('project_galleries')->whereIn('project_id', [6, 7, 8, 9, 10])->delete();
        // 清除關聯的 tag
        DB::table('project_tag_map')->whereIn('project_id', [6, 7, 8, 9, 10])->delete();
    }

    public function down(): void
    {
        // 刪了就刪了
    }
};
