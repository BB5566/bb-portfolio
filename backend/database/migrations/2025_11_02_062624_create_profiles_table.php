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
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('title')->nullable();
            $table->string('subtitle')->nullable();
            $table->text('bio')->nullable();
            $table->string('email')->nullable();
            $table->string('phone')->nullable();
            $table->string('location')->nullable();
            $table->string('avatar')->nullable();
            $table->string('resume_url')->nullable();

            // 社交媒體連結
            $table->string('github')->nullable();
            $table->string('linkedin')->nullable();
            $table->string('twitter')->nullable();
            $table->string('facebook')->nullable();
            $table->string('instagram')->nullable();
            $table->string('website')->nullable();

            // 技能分類（JSON 格式儲存）
            $table->json('skills')->nullable();

            // SEO 相關
            $table->string('meta_title')->nullable();
            $table->text('meta_description')->nullable();
            $table->string('meta_keywords')->nullable();

            $table->timestamps();
        });

        // 插入預設資料
        DB::table('profiles')->insert([
            'name' => 'Your Name',
            'title' => 'Full Stack Developer',
            'subtitle' => 'Creating Digital Solutions',
            'bio' => 'Passionate developer with expertise in modern web technologies.',
            'email' => 'contact@example.com',
            'location' => 'Taipei, Taiwan',
            'skills' => json_encode([
                'Frontend' => ['Vue 3', 'React', 'TypeScript', 'Tailwind CSS'],
                'Backend' => ['Laravel', 'Node.js', 'Python', 'PostgreSQL'],
                'Tools' => ['Git', 'Docker', 'CI/CD', 'AWS'],
            ]),
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
