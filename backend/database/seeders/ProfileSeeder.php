<?php

namespace Database\Seeders;

use App\Models\Education;
use App\Models\Experience;
use App\Models\Profile;
use App\Services\CacheService;
use Illuminate\Database\Seeder;

/**
 * 公開頁內容的正本（個人資料、工作經歷、學習歷程）。
 * 正式環境每次啟動都會跑這支，所以改內容就是改這裡、開 PR。
 * 規則：公開頁不寫公司名、不放內部位址與同事姓名。
 */
class ProfileSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedProfile();
        $this->seedExperiences();
        $this->seedEducation();

        CacheService::clearAll();
        $this->command?->info('Profile、經歷、學歷已更新');
    }

    private function seedProfile(): void
    {
        Profile::updateOrCreate(
            ['id' => 1],
            [
                'name' => 'Bob Tsou',
                'display_name' => 'BOB',
                'display_name_sub' => 'TSOU',
                'title' => '前端工程師（Vue 3 · TypeScript · LLM · RAG）',
                'subtitle' => '約 6 年電商設計與行銷背景的前端工程師，2026/07 起一人重建公司的地端 AI 內容產線，把內容產製流程自動化。',
                'role_texts' => [
                    'Vue 3 × TypeScript 前端',
                    '一人重建地端 AI 產線',
                    '流程自動化與 AI 導入',
                ],
                'bio' => '我從設計與電商行銷出發，懂使用者也懂商業目標；2025 年 10 月轉入前端，現為團隊唯一前端。'
                    ."\n\n"
                    .'2026 年 7 月起一人重建並維運公司的地端 AI 內容產線，改圖時間在測試中從 66 秒降到約 9 秒。'
                    .'工作之外，我用 Hermes Agent 開發了接地端模型的個人 AI 助理，細節見作品。'
                    .'目前輔大軟工進修部在學，半工半讀。',
                // 首屏只放兩行；完整自介（杰哥、在學）留在 bio，Portfolio OS 的終端機會顯示
                'hero_intro' => '電商出身，從 0 做到月營業額 80～100 萬。現職主責 2,100+ 所學校的學習平台前端，並一人重建公司的地端 AI 內容產線；開發以 AI coding 工具為主力，前端與 AI 產線的規格、架構與測試由我主導。',
                // 印刷打樣首頁（/v5）的首屏；數字的強調與「（本機量測）」小字由前端自動判斷，這裡只放純文字
                'hero_proof' => [
                    'claim_lines' => ['設計出身的前端，', '把網頁變輕，', '把 AI 搬進公司。'],
                    'who' => '前端工程師・Vue 3 × 地端 AI',
                    'role' => '前端工程師・Vue 3 × 地端 AI',
                    'pitch' => '約 6 年電商設計與行銷，懂使用者也懂商業目標；2025 年 10 月轉入前端，現為團隊唯一前端。2026 年 7 月起一人重建並維運公司的地端 AI 內容產線。',
                    'how' => '開發以 AI coding 工具（Claude Code）為主力：前端與 AI 產線的規格、架構、測試與程式審查由我主導。',
                ],
                'email' => 'hello@bb-made.com',
                'location' => '新北市',
                'github' => 'https://github.com/BB5566',
                'resume_url' => '/resume.pdf?v=20261111g',
                'skills' => [
                    '前端' => ['Vue 3', 'TypeScript', 'HTML', 'CSS', 'Bootstrap', 'Nuxt 4', 'Vite', 'Vitest', 'GSAP', 'RWD'],
                    '後端（AI 協作）' => ['.NET 8', 'REST API', 'SQL', 'PHP／Laravel'],
                    'AI 應用' => ['流程自動化', 'LLM 應用', 'Prompt Engineering', 'RAG／Embedding', '圖像生成（ComfyUI、FLUX）', '模型評測／A-B 測試'],
                    '部署與協作' => ['GitLab CI/CD', 'GitHub Actions', 'Docker', 'Cloudflare', 'NAS 自架部署', 'Git'],
                    '設計與行銷' => ['Figma', 'Photoshop', 'Illustrator', 'Google Analytics', '廣告投放'],
                ],
                'years_experience' => 7,
                'projects_delivered' => 14,
                'hours_training' => 1320, // 泰山職訓 920＋聯成 400
                // 首屏三個數字（也用在「60 秒看重點」）；教材抓題數字留在作品卡，不放首頁
                'highlights' => [
                    // 首屏與「60 秒看重點」共用：前端一格、AI 一格、規模一格（電商營業額留在 hero_intro 與經歷）
                    ['value' => '2 MB→79 KB', 'label' => '官網首頁讀取的資料量（本機量測）'],
                    ['value' => '66 秒→約 9 秒', 'label' => '地端 AI 產線改圖時間（測試量測）'],
                    ['value' => '2,100+', 'label' => '平台服務學校數'],
                ],
                'meta_title' => 'Bob Tsou | 前端工程師・Vue 3 × 地端 AI 作品集',
                'meta_description' => '前端工程師（Vue 3 × TypeScript），並一人重建公司的地端 AI 內容產線：官網首頁讀取的資料 2 MB→79 KB、國考題庫自動抓題、內容產製流程自動化。用實際數據做事。',
            ]
        );
    }

    private function seedExperiences(): void
    {
        $experiences = [
            [
                'start_date' => '2025-10-01',
                'company' => '教育科技公司（教材出版集團・數位學習平台）',
                'position' => '前端與 AI 應用開發｜系統開發部',
                'location' => '新北市',
                'end_date' => null,
                'is_current' => true,
                'description' => '主責學習平台前端主線（Vue 3 monorepo）並參與 .NET 8 後端整合，維護台灣與中國兩套正式環境；2026/07 起一人重建並維運公司的地端 AI 內容產線。',
                'achievements' => [
                    // 前 4 條首頁直接顯示，其餘收進「其他 N 項成果」：前端主線、效能數字、AI 產線、帶團隊導入 AI
                    '8 人團隊（1 前端／4 後端／3 PM）中唯一前端，前端開發規範約七成由我起草',
                    '載入優化：前端建置產物導入 Brotli／Gzip 壓縮，主要資源 3.04 MB→788 KB（-74%）；打字測驗頁單頁少傳 2.4 MB、核心 bundle 縮小 34～42%；試卷管理／組卷器頁的數學公式庫改成有公式才載入，開頁少載約 1.3 MB；官網首頁的公告改為選到分類才載入，本機量測首頁讀取的資料約 2 MB→79 KB、主圖顯示 2.1→0.9 秒',
                    '地端 AI 內容產線：2026/07 起一人重建；改圖時間 66 秒→約 9 秒、改圖指令照做率 70%→86%（皆為測試量測）；法條問答送出前核對條號，30 題抽考編造條號降到 0；國考題庫 829 本教材產品中 786 本可自動抓題，10/21 起已送編輯 89 份',
                    '推動團隊導入 AI 輔助開發：團隊第一個用 Claude 寫程式（先自費），以實際交付示範成效後主管向公司申請團隊授權；協助同事安裝設定，與後端主要開發者共建 Claude Code 工程規範（4 位開發者在用、累積 250+ 筆工單）',
                    '入職至今經手約 170 張工單（另有數百項未開單的工作），平台服務超過 2,100 所學校',
                    '經手平台：學習平台（台灣／大陸）、官網、考試落地頁、會員中心（SSO）、認證考試平台',
                    '首頁風雲榜（教師／校園／學生排行）：前端由我打造（目前程式碼約九成），API 與排程快照與後端同事合作，並以獨立 SQL 對帳驗證',
                    '考試與 AI 功能前端：考試防作弊（Android 全螢幕鎖定、iPad／iOS 偵測）；AIGC 建置精靈 7 步精簡為 4 步，AI 輔助評分設定與非選題 AI 評分畫面',
                    '資安弱掃修補（與同事分工）：負責前端函式庫升級與遷移（31 頁），並主動補修報告沒掃到的 6 處網址參數反射。另主動修補 4 處 IDOR／SQL Injection 與 21 個 npm 安全漏洞，並為 XSS 淨化模組建立 11 個防護測試',
                    '建立前端 Monorepo、設計令牌與 Vitest／Playwright 測試環境；為 6 萬多行、原本零測試的答題／組卷套件建立測試基建，自己寫了 150+ 個測試',
                    'SSO 新版會員中心（Vue 3＋Vite）一週內做到上測試站：請求改序列化避開 session 鎖，測試站頁面載入約 5 秒→0.3 秒（尚未上正式）',
                    '2026/03 起負責大陸站前端簡體化：建置新版前端繁簡 i18n 與大陸站獨立建置環境，完成約 55 頁簡繁轉換，並訂定簡體用詞與建置規範；無障礙主色對比提升到 AA、鍵盤停留點 224→1，學生考試器複選／排序／配對題可全鍵盤與報讀軟體作答（WCAG 2.1.1）；透過 GitLab CI/CD 負責測試站與台灣／大陸正式站發布',
                ],
                'technologies' => ['Vue 3', 'TypeScript', '.NET 8', 'GitLab CI/CD', 'Vitest', 'LLM', 'ComfyUI'],
                'sort_order' => 1,
            ],
            [
                'start_date' => '2023-11-01',
                'company' => '鞋類電商',
                'position' => '電商行銷專員',
                'location' => '新北市',
                'end_date' => '2024-10-31',
                'is_current' => false,
                'description' => '入職時公司沒有電商通路，從 0 開通 Momo／蝦皮／PChome 三個賣場（申請、審核、上架一手包辦），賣場裝潢與商品圖全部自己設計；三個平台的廣告投放、促銷檔期與平台 PM 聯繫都由我負責，另製作 Meta／Google 廣告素材、建立 Excel 庫存管理系統。',
                'achievements' => [
                    '從 0 開通到月營業額 80～100 萬元',
                ],
                'technologies' => ['Momo', '蝦皮', 'PChome', 'Meta Ads', 'Google Ads', 'Excel'],
                'sort_order' => 2,
            ],
            [
                'start_date' => '2019-03-01',
                'company' => '家庭因素',
                'position' => '職涯空檔',
                'location' => null,
                'end_date' => '2023-07-31',
                'is_current' => false,
                'description' => '家庭因素（照顧家人、協助家中事業收尾），2023 年已處理完畢並回到職場。',
                'achievements' => [],
                'technologies' => [],
                'sort_order' => 3,
            ],
            [
                'start_date' => '2014-07-01',
                'company' => '宗教文物品牌',
                'position' => '品牌行銷',
                'location' => '新北市',
                'end_date' => '2019-02-28',
                'is_current' => false,
                'description' => '主導電商賣場建置與品牌視覺設計、建立 CIS 數位視覺系統；負責競品 UI/UX 分析、中國展會佈展與活動企劃。',
                'achievements' => [],
                'technologies' => ['Illustrator', 'Photoshop', '電商平台'],
                'sort_order' => 4,
            ],
        ];

        foreach ($experiences as $data) {
            Experience::updateOrCreate(
                ['start_date' => $data['start_date']],
                $data + ['is_visible' => true]
            );
        }
    }

    private function seedEducation(): void
    {
        $education = [
            [
                'school' => '輔仁大學',
                'field_of_study' => '軟體工程與數位創意學士學位學程（進修部）',
                'degree' => '學士（在學）',
                'location' => '新北市',
                'start_date' => '2026-09-01',
                'end_date' => '2030-06-30',
                'is_current' => true,
                'description' => '進修部（夜間）半工半讀，目標是把前端技術深度與 AI 應用補齊。',
                'activities' => null,
                'sort_order' => 1,
            ],
            [
                'school' => '勞動部勞動力發展署 泰山職業訓練場',
                'field_of_study' => 'PHP 資料庫網頁設計（920 小時）',
                'degree' => 'PHP 資料庫網頁設計班結訓（勞動部職能導向認證課程，職能級別 3 級）',
                'location' => '新北市',
                'start_date' => '2025-04-01',
                'end_date' => '2025-09-30',
                'is_current' => false,
                'description' => '系統性學習前端（HTML／CSS／JS／jQuery）、後端（PHP／MySQL／Laravel）、資料庫設計、RESTful API、MVC 架構與 Git 版本控制。',
                'activities' => ['結訓專案：美食論壇、餐廳後台', '轉職前端的起點'],
                'sort_order' => 2,
            ],
            [
                'school' => '聯成電腦',
                'field_of_study' => '數位媒體行銷設計班（400 小時）',
                'degree' => '結訓',
                'location' => '新北市',
                'start_date' => '2023-08-01',
                'end_date' => '2023-11-30',
                'is_current' => false,
                'description' => '數位行銷企劃、社群內容與廣告素材設計、影音剪輯與電商視覺；結訓後回到電商行銷。',
                'activities' => null,
                'sort_order' => 3,
            ],
            [
                'school' => '輔仁大學',
                'field_of_study' => '應用美術學系',
                'degree' => '肄業',
                'location' => '新北市',
                'start_date' => '2012-09-01',
                'end_date' => '2014-06-30',
                'is_current' => false,
                'description' => '視覺設計基礎，後來的電商與品牌行銷工作都從這裡出發。',
                'activities' => null,
                'sort_order' => 4,
            ],
        ];

        // 2026-11 系名更正（應用藝術→應用美術）：鍵是學校＋科系，舊列要刪掉才不會重複
        Education::where('school', '輔仁大學')->where('field_of_study', '應用藝術學系')->delete();

        foreach ($education as $data) {
            Education::updateOrCreate(
                ['school' => $data['school'], 'field_of_study' => $data['field_of_study']],
                $data + ['is_visible' => true]
            );
        }
    }
}
