<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Project;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $webCategory = Category::firstOrCreate(
            ['slug' => 'web-application'],
            ['name' => 'Web Application', 'description' => '網頁應用程式']
        );

        $projects = [
            [
                'category_id' => $webCategory->id,
                'title' => 'MoodCanvas - AI 情緒日記',
                'description' => '結合 AI 圖片生成與文字分析的智慧情緒日記。記錄心情、自動生成 AI 插畫和智慧語錄，提供情緒趨勢分析。',
                'technologies' => ['PHP', 'MySQL', 'Google Vertex AI', 'Chart.js', 'D3.js'],
                'features' => ['AI 圖片生成', '情緒分析', '心情熱力圖', '詞雲視覺化', '響應式設計'],
                'github_link' => 'https://github.com/BB5566/MoodCanvas',
                'project_link' => null,
                'sort_order' => 1,
                'is_published' => true,
                'cover_image_url' => '/uploads/projects/moodcanvas.png',
            ],
            [
                'category_id' => $webCategory->id,
                'title' => 'Flight Search - 機票搜尋引擎',
                'description' => '整合 Amadeus GDS API 的即時機票比價系統，支援多幣別、艙等篩選。',
                'technologies' => ['PHP', 'JavaScript', 'Amadeus API', 'Bootstrap 5'],
                'features' => ['即時航班', '多幣別', '艙等篩選', '直飛篩選'],
                'github_link' => 'https://github.com/BB5566/flight-search',
                'project_link' => null,
                'sort_order' => 2,
                'is_published' => true,
                'cover_image_url' => '/uploads/projects/flight-search.png',
            ],
            [
                'category_id' => $webCategory->id,
                'title' => 'Taiwan Weather - 天氣儀表板',
                'description' => '台灣 36 小時天氣預報儀表板，整合中央氣象署開放資料 API。',
                'technologies' => ['JavaScript', 'jQuery', 'Chart.js', 'Bootstrap 5'],
                'features' => ['36 小時預報', '溫度趨勢圖', 'KPI 統計', '地區篩選'],
                'github_link' => 'https://github.com/BB5566/weather',
                'project_link' => null,
                'sort_order' => 3,
                'is_published' => true,
                'cover_image_url' => '/uploads/projects/weather.png',
            ],
            [
                'category_id' => $webCategory->id,
                'title' => 'Food Forum - 美食論壇',
                'description' => '社群型美食分享平台，文章發布、圖片上傳、留言互動、會員管理。',
                'technologies' => ['PHP', 'MySQL', 'PDO', 'Bootstrap', 'bcrypt'],
                'features' => ['文章 CRUD', '圖片上傳', '會員系統', '管理員權限'],
                'github_link' => 'https://github.com/BB5566/food-forum',
                'project_link' => null,
                'sort_order' => 4,
                'is_published' => true,
                'cover_image_url' => '/uploads/projects/food-forum.png',
            ],
            [
                'category_id' => $webCategory->id,
                'title' => 'Restaurant Admin - 餐廳後台',
                'description' => '早餐店後台管理系統，品項 CRUD、銷售追蹤、圖片管理。',
                'technologies' => ['PHP', 'MySQL', 'PDO', 'CSS3'],
                'features' => ['品項管理', '銷售數據', '圖片上傳', 'SQL 注入防護'],
                'github_link' => 'https://github.com/BB5566/restaurant-admin',
                'project_link' => null,
                'sort_order' => 5,
                'is_published' => true,
                'cover_image_url' => '/uploads/projects/restaurant-admin.png',
            ],
        ];

        foreach ($projects as $data) {
            Project::updateOrCreate(
                ['title' => $data['title']],
                $data
            );
        }

        $this->command->info('5 個個人專案已更新');
    }
}
