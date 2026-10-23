<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $projects = [
            [
                'id' => 6,
                'title' => 'MOSME 教育平台',
                'description' => '勁園國際旗下的數位教育平台，採用 Vue 3 + Nuxt 4 架構，服務全台數十萬師生。負責前端組件開發、API 串接、效能優化與跨團隊協作。',
                'technologies' => ['Vue 3', 'Nuxt 4', 'TypeScript', 'Element Plus', 'Pinia', 'GitLab CI'],
                'features' => ['SSR 伺服器渲染', '響應式設計', '多角色權限管理', '即時測驗模組', '學習歷程追蹤', 'API Gateway 整合'],
                'github_link' => null,
                'project_link' => null,
                'sort_order' => 1,
            ],
            [
                'id' => 7,
                'title' => 'SSO 會員認證系統',
                'description' => '整合多平台的單一登入認證系統，採用 ASP.NET MVC 架構，支援 OAuth 2.0 / OpenID Connect 協定，服務勁園旗下所有產品。',
                'technologies' => ['ASP.NET MVC', 'C#', 'OAuth 2.0', 'OpenID Connect', 'SQL Server', 'Redis'],
                'features' => ['單一登入 (SSO)', '多平台整合', 'Token 管理', '角色權限控制', '登入稽核日誌', 'Session 同步'],
                'github_link' => null,
                'project_link' => null,
                'sort_order' => 2,
            ],
            [
                'id' => 8,
                'title' => 'PSC 技能測驗',
                'description' => '專業技能認證測驗平台，支援多題型線上測驗、自動評分與成績報表。使用 jQuery + Bootstrap 開發，服務每年數萬名考生。',
                'technologies' => ['jQuery', 'Bootstrap', 'ASP.NET', 'SQL Server', 'Chart.js'],
                'features' => ['多題型測驗', '自動評分', '成績報表', '即時倒數計時', '防作弊機制', '成績匯出'],
                'github_link' => null,
                'project_link' => null,
                'sort_order' => 3,
            ],
            [
                'id' => 9,
                'title' => 'iPOECourse 線上課程',
                'description' => '線上課程管理與銷售平台，採用 ASP.NET Core 6 + Razor Pages 架構。整合金流、課程進度追蹤與證書發放。',
                'technologies' => ['ASP.NET Core 6', 'Razor Pages', 'C#', 'Entity Framework', 'SQL Server', 'ECPay 金流'],
                'features' => ['課程管理', '金流整合', '進度追蹤', '證書發放', '學員管理', '多媒體播放'],
                'github_link' => null,
                'project_link' => null,
                'sort_order' => 4,
            ],
            [
                'id' => 10,
                'title' => 'bb-made.com',
                'description' => '個人作品集網站，前後端分離架構。Vue 3 + GSAP 動畫打造沈浸式視覺體驗，Laravel RESTful API 後端，Docker 容器化部署於 NAS 並透過 Cloudflare Tunnel 上線。',
                'technologies' => ['Vue 3', 'TypeScript', 'Laravel 11', 'MySQL 8', 'Docker', 'GSAP', 'Nginx', 'Cloudflare Tunnel'],
                'features' => ['GSAP 粒子動畫', '前後端分離', 'Docker 部署', 'Sanctum 認證', '自動化 CI/CD', 'RESTful API'],
                'github_link' => 'https://github.com/BB5566/portfolio',
                'project_link' => 'https://bb-made.com',
                'sort_order' => 5,
            ],
        ];

        foreach ($projects as $data) {
            DB::table('projects')->where('id', $data['id'])->update([
                'description' => $data['description'],
                'technologies' => json_encode($data['technologies']),
                'features' => json_encode($data['features']),
                'github_link' => $data['github_link'],
                'project_link' => $data['project_link'],
                'sort_order' => $data['sort_order'],
                'created_at' => now()->subMonths(12 - $data['sort_order']),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        // 不還原（保留資料）
    }
};
