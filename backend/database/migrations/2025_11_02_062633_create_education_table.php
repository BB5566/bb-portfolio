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
        Schema::create('education', function (Blueprint $table) {
            $table->id();
            $table->string('school');
            $table->string('degree');
            $table->string('field_of_study');
            $table->string('location')->nullable();
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->boolean('is_current')->default(false);
            $table->text('description')->nullable();
            $table->json('activities')->nullable(); // 活動與社團
            $table->decimal('gpa', 3, 2)->nullable(); // GPA
            $table->integer('sort_order')->default(0);
            $table->boolean('is_visible')->default(true);
            $table->timestamps();

            // 索引
            $table->index('sort_order');
            $table->index('is_visible');
        });

        // 插入範例資料
        DB::table('education')->insert([
            [
                'school' => 'National Taiwan University',
                'degree' => 'Bachelor of Science',
                'field_of_study' => 'Computer Science',
                'location' => 'Taipei, Taiwan',
                'start_date' => '2016-09-01',
                'end_date' => '2020-06-30',
                'is_current' => false,
                'description' => 'Focused on software engineering, algorithms, and web development.',
                'activities' => json_encode([
                    '資訊社團副社長',
                    'ACM 程式競賽參賽',
                    '開源專案貢獻者',
                ]),
                'gpa' => 3.8,
                'sort_order' => 1,
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
        Schema::dropIfExists('education');
    }
};
