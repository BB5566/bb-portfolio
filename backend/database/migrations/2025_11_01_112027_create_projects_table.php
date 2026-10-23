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
        Schema::create('projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained('categories')->comment('關聯到 categories 表的 ID');
            $table->string('title')->comment('專案標題');
            $table->string('cover_image_url')->nullable()->comment('封面圖片路徑');
            $table->string('preview_media_url')->nullable()->comment('預覽媒體 (GIF/MP4) 路徑');
            $table->text('description')->comment('專案簡介');
            $table->json('technologies')->nullable()->comment('技術棧陣列');
            $table->json('features')->nullable()->comment('功能特色陣列');
            $table->string('project_link')->nullable()->comment('專案連結 (網站或遊戲)');
            $table->string('github_link')->nullable()->comment('GitHub 連結');
            $table->integer('sort_order')->default(0)->comment('排序權重');
            $table->boolean('is_published')->default(true)->comment('是否發布');
            $table->timestamps();

            $table->index('is_published');
            $table->index('sort_order');
            $table->index('created_at');
            $table->index(['is_published', 'sort_order']);
            $table->index(['category_id', 'is_published']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('projects');
    }
};
