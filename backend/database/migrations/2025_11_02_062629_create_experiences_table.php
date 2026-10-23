<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('experiences', function (Blueprint $table) {
            $table->id();
            $table->string('company');
            $table->string('position');
            $table->string('location')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();
            $table->json('achievements')->nullable(); // 成就列表
            $table->json('technologies')->nullable(); // 使用技術
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            // 索引
            $table->index('sort_order');
            $table->index('is_visible');
        });

        // 插入範例資料
        DB::table('experiences')->insert([
            [
                'company' => 'Tech Company',
                'position' => 'Senior Full Stack Developer',
                'location' => 'Taipei, Taiwan',
                'start_date' => '2022-01-01',
                'end_date' => null,
                'is_current' => true,
                'description' => 'Leading development of web applications using modern technologies.',
                'achievements' => json_encode([
                    '領導開發團隊完成 5 個大型專案',
                    '優化系統效能提升 40%',
                    '建立 CI/CD 流程自動化部署',
                ]),
                'technologies' => json_encode(['Vue 3', 'Laravel', 'Docker', 'AWS']),
                'sort_order' => 1,
                'is_visible' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'company' => 'Startup Inc.',
                'position' => 'Full Stack Developer',
                'location' => 'Taipei, Taiwan',
                'start_date' => '2020-06-01',
                'end_date' => '2021-12-31',
                'is_current' => false,
                'description' => 'Developed and maintained multiple web applications.',
                'achievements' => json_encode([
                    '開發電商平台處理每日萬筆交易',
                    '實作即時聊天系統',
                    '導入單元測試覆蓋率達 80%',
                ]),
                'technologies' => json_encode(['React', 'Node.js', 'MongoDB', 'Redis']),
                'sort_order' => 2,
                'is_visible' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('experiences');
    }
};
