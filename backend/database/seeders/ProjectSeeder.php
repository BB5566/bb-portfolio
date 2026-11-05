<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Project;
use App\Services\CacheService;
use Illuminate\Database\Seeder;

/**
 * 公開頁作品的正本。正式環境每次啟動都會跑，改內容就是改這裡、開 PR。
 * 封面圖放在 frontend/public/covers/，前端以 /covers/ 開頭的路徑直接讀。
 */
class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        $frontend = Category::updateOrCreate(['slug' => 'frontend'], ['name' => '前端']);
        $fullstack = Category::updateOrCreate(['slug' => 'fullstack'], ['name' => '全端']);
        $ai = Category::updateOrCreate(['slug' => 'ai-application'], ['name' => 'AI 應用']);
        $design = Category::updateOrCreate(['slug' => 'design'], ['name' => '設計']);

        $projects = [
            [
                'slug' => 'ai-content-pipeline',
                'title' => '地端 AI 內容產線',
                'category_id' => $ai->id,
                'cover_image_url' => '/covers/ai-pipeline-v2.webp',
                'description' => '2026/07 起由我一人從頭重建公司的 AI 內容產線並負責維運：改成程式化產線，7 月在 Mac mini 改用 9B 本機模型，2026/09 搬上公司內部 128GB 主機，主腦不再用雲端模型，資料不出公司。涵蓋社群貼文、海報、短影音、AI 助理、法條問答、國考題庫轉換、編輯部助理與網頁版排稿台。開發都靠 AI coding agent 產出程式，我負責定規格、架構、審查、測試與上線決策。',
                'technologies' => ['Hermes Agent', 'Ollama', 'ComfyUI／FLUX', 'Telegram Bot', 'Docker'],
                'features' => [
                    '主腦從雲端模型訂閱改為公司自有主機，資料不出公司',
                    '國考試題免手打：829 本教材產品中 786 本可自動抓題，題數與原卷逐字核對才送出（實測：工程數學卷 36 個公式全轉成可編輯方程式、技檢卷 120 題逐題比對全對）；涵蓋 13 個考試機關；3 位編輯在用，已送到編輯手上 28 份',
                    '社群貼文：2026/09 起已實際發到粉專 42 篇（近 30 天 17 篇）',
                    '上線後照使用者回饋持續優化：改圖出圖 36～66 秒→約 10 秒（測試）',
                    '改圖指令照做率 70%→86%、整張重繪 74%→87%（24 句重播測試、逐項人工判）',
                    '法條問答送出前核對引用，30 題測試集編造條號降到 0',
                    '三機分工＋統一模型閘道，互動請求優先、背景工作讓路；AI 模型全部本機推論',
                    '品質靠測試守：約 400 個測試檔、整套 3,522 支；新規則一律故意弄壞確認測試會紅',
                    '模型選型用 108 句真實 PM 指令對打：現役模型 99/108，候選 31/108，決定不換',
                    '以採用率為第一指標：沒人用的產線用開關關掉',
                    '哨兵／每小時健檢／白話早報／每晚備份到第二台機器',
                ],
                'project_link' => null,
                'github_link' => null,
                'galleries' => [
                    ['image_url' => '/covers/ai-pipeline-v2.webp', 'caption' => '封面'],
                    ['image_url' => '/covers/ai-pipeline-architecture.webp', 'caption' => '架構圖：統一模型閘道、三機分工、送出前核對關卡'],
                ],
                'sort_order' => 1,
            ],
            [
                'slug' => 'jay-go-ai-assistant',
                'title' => '本地 AI 助理（個人專案）',
                'category_id' => $ai->id,
                'cover_image_url' => '/covers/local-ai-assistant-v2.webp',
                'description' => '工作之外用 Hermes Agent 框架開發的個人 AI 助理，接地端模型、對話不送雲端。重點不是功能多，而是讓 AI 不亂講話：說做了什麼要有紀錄對得上、回答要能對到來源、每週自動考試抓退步，改動都用數據決定留不留。',
                'technologies' => ['本地 LLM（Qwen 27B）', '工具呼叫', '自動評測', 'Docker', 'Telegram Bot'],
                'features' => [
                    '工具收據：每次回覆附上系統實際執行的工具紀錄，AI 聲稱的動作對不上就標出來',
                    '逐句查證：回答裡的事實逐句對來源；修正誤判規則後，同一批重播的誤報從 29 條降到 5 條',
                    '固定考題：68 題自動考試，每次改設定都重考，退步就自動改回',
                    '用數據做決定：首句改用小模型能快 10 秒，但誠實度從 29/30 掉到 22/30，所以不採用',
                    '速度：背景先把模型快取暖好，冷啟動的第一個字從 91 秒降到 0.9 秒',
                ],
                'project_link' => null,
                'github_link' => null,
                'galleries' => [
                    ['image_url' => '/covers/local-ai-assistant-v2.webp', 'caption' => '封面'],
                    ['image_url' => '/covers/local-ai-assistant-architecture.webp', 'caption' => '架構圖：工具收據與逐句查證、轉接層、每週固定考試'],
                ],
                'sort_order' => 2,
            ],
            [
                'slug' => 'student-page-load-optimization',
                'title' => '學生端頁面載入優化',
                'category_id' => $frontend->id,
                'cover_image_url' => '/covers/student-page-perf-v2.webp',
                'description' => '教育平台學生端最重的一頁：改用壓縮版圖表庫、圖片依顯示尺寸輸出、數學公式庫改共用載入。打字測驗頁單頁少傳 2.4 MB、聊天頭像圖片省 5.15 MB、核心 bundle 縮小 34～42%，平台服務超過 2,100 所學校。',
                'technologies' => ['Vue 3', 'Vite', 'Rollup 分析', '圖片最佳化'],
                'features' => [
                    '打字測驗頁單頁少傳 2.4 MB；聊天頭像圖片省 5.15 MB',
                    '前端建置產物導入 Brotli 壓縮：正式站功能頁 JS 670→173 KB（-74%）、CSS -85%',
                    'MathJax 改成內容有公式才載入，一般開頁少載約 1.3 MB',
                    '核心 bundle 縮小 34～42%',
                    '數學公式庫改共用載入',
                    '圖片依顯示尺寸輸出',
                ],
                'project_link' => null,
                'github_link' => null,
                'sort_order' => 3,
                'galleries' => [
                    ['image_url' => '/covers/student-page-perf-v2.webp', 'caption' => '封面'],
                    ['image_url' => '/covers/company/student-practice.webp', 'caption' => '學生端練習作答畫面（已去識別化）'],
                ],
            ],
            [
                'slug' => 'homepage-nuxt-rebuild',
                'title' => '官網首頁改版（Vue 3＋Nuxt）',
                'category_id' => $frontend->id,
                'cover_image_url' => '/covers/company/homepage-cover.webp',
                'description' => '把教育平台官網首頁從 .NET Razor 遷移到 Vue 3＋Nuxt 4 靜態生成：書籍與會員資料串接、書籍列表與詳情頁、預渲染、GSAP 動畫，首頁專用 API 的後端也由我撰寫；SEO 全面優化（meta、JSON-LD、sitemap）。2025/11 開工，2026/01 正式上線。',
                'technologies' => ['Vue 3', 'Nuxt 4', 'SSG', 'GSAP', 'SEO', 'JSON-LD', 'ASP.NET'],
                'features' => [
                    '.NET Razor 遷移到 Nuxt 靜態生成與預渲染',
                    '首頁專用 API（前後端都自己寫）',
                    '書籍列表、詳情頁與會員串接',
                    'meta、JSON-LD、sitemap 等 SEO 全面優化',
                ],
                'project_link' => null,
                'github_link' => null,
                'sort_order' => 4,
                'galleries' => [
                    ['image_url' => '/covers/company/homepage-cover.webp', 'caption' => '封面'],
                    ['image_url' => '/covers/company/homepage-desktop.webp', 'caption' => '改版後：Nuxt 桌機版首頁（商標已遮）'],
                    ['image_url' => '/covers/company/homepage-before-desktop.webp', 'caption' => '改版前：Razor 舊版首頁，2025/10（商標已遮）'],
                    ['image_url' => '/covers/company/homepage-mobile.webp', 'caption' => '手機版首頁（商標已遮）'],
                ],
            ],
            [
                'slug' => 'exam-landing-pages',
                'title' => '國考網／檢定網落地頁改版',
                'category_id' => $frontend->id,
                'cover_image_url' => '/covers/company/landing-cover.webp',
                'description' => '主導兩個考試刷題網站的落地頁改版：國考網依 PM 新原型整頁重做（2026/09/03 上線）、檢定網 v2（2026/09/11 上線），桌機與手機版同步；示意動畫從 1.7 MB 的 GIF 改成約 3 KB 的 DOM 元素動畫，畫面更清楚、載入更輕。',
                'technologies' => ['Vue 3', 'CSS 動畫', 'RWD', '效能優化'],
                'features' => [
                    '1.7 MB GIF → 約 3 KB DOM 動畫',
                    '兩站共用版型、各自主色',
                    '桌機與手機版同步改版',
                    '考試搜尋與快速入口',
                ],
                'project_link' => null,
                'github_link' => null,
                'sort_order' => 5,
                'galleries' => [
                    ['image_url' => '/covers/company/landing-cover.webp', 'caption' => '封面'],
                    ['image_url' => '/covers/company/landing-exam-desktop.webp', 'caption' => '國考網落地頁（桌機，商標已遮）'],
                    ['image_url' => '/covers/company/landing-cert-desktop.webp', 'caption' => '檢定網落地頁（桌機，商標已遮）'],
                    ['image_url' => '/covers/company/landing-exam-mobile.webp', 'caption' => '國考網落地頁（手機）'],
                    ['image_url' => '/covers/company/landing-cert-mobile.webp', 'caption' => '檢定網落地頁（手機）'],
                ],
            ],
            [
                'slug' => 'cross-site-security-patching',
                'title' => '資安弱掃修補與測試基建',
                'category_id' => $frontend->id,
                'cover_image_url' => '/covers/security-tests-v2.webp',
                'description' => '主導前端弱掃修補規劃，獨力完成主站前端函式庫升級（jQuery 1.11／2.1→3.5.1、Bootstrap 3→4 相容層，涵蓋 31 頁與站台級共用 bundle）並修補 12 項反射型 XSS；複測時把 54 筆高風險歸因到 3 處根因、與後端分工修補，並修補 21 個 npm 安全漏洞；另撰寫資安稽核報告，找出 6 處 IDOR／SQL Injection 交後端修補。為前端 XSS 淨化模組建立 11 個防護測試，並以人為破壞防護確認測試抓得到失效；為近 6 萬行、原本零測試的答題／組卷套件建立測試基建與 86 個測試。',
                'technologies' => ['Vitest', '資安修補', 'GitLab CI', 'jQuery 3.5', 'Bootstrap 4'],
                'features' => [
                    '主站 31 頁＋共用 bundle 升級到 jQuery 3.5.1／Bootstrap 4',
                    '54 筆高風險歸因到 3 處根因，與後端分工修補',
                    '11 個 XSS 防護測試，以人為破壞防護確認抓得到失效',
                    '近 6 萬行零測試套件建立 86 個測試',
                ],
                'project_link' => null,
                'github_link' => null,
                'sort_order' => 6,
            ],
            [
                'slug' => 'portfolio-os',
                'title' => 'Portfolio OS（本站）',
                'category_id' => $fullstack->id,
                'cover_image_url' => '/covers/portfolio-os.webp',
                'description' => '作品集網站 bb-made.com：首頁是單頁式作品介紹（作品分類篩選、經歷、技能、聯絡表單），另保留以「桌面作業系統」為隱喻的互動版 /os（視窗可拖曳／縮放／切換）；Vue 3＋TypeScript 前端、Laravel 11 API、MySQL。部署於自架 NAS（Docker）＋Cloudflare Tunnel，GitHub Actions 建置映像後 Watchtower 自動更新；CI 含 Lint、型別檢查、單元測試與 Lighthouse。',
                'technologies' => ['Vue 3', 'TypeScript', 'Pinia', 'GSAP', 'Laravel 11', 'MySQL', 'Docker', 'GitHub Actions', 'Cloudflare Tunnel'],
                'features' => [
                    '桌面 OS 隱喻：Finder／Terminal／Calendar／Profiler／Chat／Mail',
                    '內容全部來自後端 API，正本以程式碼管理',
                    'NAS 自架＋Watchtower 零觸碰部署',
                    'CI：Lint、型別檢查、Vitest、Lighthouse',
                ],
                'project_link' => 'https://bb-made.com',
                'github_link' => 'https://github.com/BB5566/bb-portfolio',
                'sort_order' => 7,
            ],
            [
                'slug' => 'eat-at-fju',
                'title' => '食在輔大',
                'category_id' => $frontend->id,
                'cover_image_url' => '/covers/eat-at-fju.webp',
                'description' => '輔大周邊美食查詢（大學入門課專案）：React＋TypeScript＋Vite，部署在 Cloudflare Workers＋D1，手機版 Lighthouse 96／100／100／100。',
                'technologies' => ['React', 'TypeScript', 'Vite', 'Cloudflare Workers', 'D1'],
                'features' => [
                    '店家與菜單查詢',
                    '手機 Lighthouse 96／100／100／100',
                    'Cloudflare 邊緣部署',
                ],
                'project_link' => 'https://fju.bb-made.com',
                'github_link' => 'https://github.com/BB5566/eat-at-fju',
                'sort_order' => 8,
            ],
            [
                'slug' => 'stock-sync',
                'title' => 'stock-sync 多平台庫存同步',
                'category_id' => $fullstack->id,
                'cover_image_url' => '/covers/stock-sync.webp',
                'description' => '做電商行銷時被多平台庫存同步卡住，現在用程式把它解了：庫存帳本＋平台轉接器，可售量＝在庫−保留；下單以主鍵冪等、樂觀鎖＋交易防超賣，對平台限流／故障用指數退避重試。Node 24 內建 SQLite＋TypeScript 型別剝除，零執行期依賴，併發／冪等／重試情境都有測試（node:test），GitHub Actions CI。',
                'technologies' => ['Node.js 24', 'TypeScript', 'node:sqlite', 'node:test', 'GitHub Actions'],
                'features' => [
                    '兩平台同時搶最後一件：一個成功、一個拒單，不超賣',
                    '同一訂單重送回「duplicate」，不重複扣庫存',
                    '限流 429／平台故障自動退避重試，用完次數才放棄',
                    '模擬平台固定隨機種子，測試可重現',
                ],
                'project_link' => null,
                'github_link' => 'https://github.com/BB5566/stock-sync',
                'sort_order' => 9,
            ],
            [
                'slug' => 'moodcanvas',
                'title' => 'MoodCanvas',
                'category_id' => $fullstack->id,
                'cover_image_url' => '/covers/moodcanvas.webp',
                'description' => 'AI 心情日記：寫下心情，由 AI 生成一幅專屬畫作與一句短語。PHP MVC＋SQLite，3D 翻轉卡片互動；Docker 部署於 NAS，Cloudflare＋nginx 反向代理。',
                'technologies' => ['PHP', 'SQLite', 'Docker', 'FLUX', 'CSS 3D', 'Cloudflare'],
                'features' => ['AI 生圖＋短語雙生成', '3D CSS 翻轉卡片', '月曆網格＋心情統計', '自動圖片快取管理'],
                'project_link' => 'https://bb-made.com/mood/',
                'github_link' => 'https://github.com/BB5566/MoodCanvas',
                'sort_order' => 10,
            ],
            [
                'slug' => 'taiyaki-brand-and-app-ui',
                'title' => '鯛輪軒 品牌識別與點餐 App UI',
                'category_id' => $design->id,
                'cover_image_url' => '/covers/design/taiyaki.webp',
                'description' => '日式鯛魚燒店的完整品牌識別：從 LOGO、名片、外帶紙盒、立架、禮盒、海報到店面招牌，再延伸成點餐 App 的啟動、登入與首頁畫面。同一套海浪紋與朱紅主色貫穿實體物件與介面，證明設計能一路落到產品。',
                'technologies' => ['Illustrator', 'Photoshop', 'Figma', '品牌識別', 'UI 設計'],
                'features' => [
                    '一套視覺語言同時用在印刷品、店面與 App 介面',
                    '名片、紙盒、立架、禮盒、海報的完整應用系統',
                    'App 啟動／登入／首頁三個畫面延續品牌紋樣',
                ],
                'project_link' => null,
                'github_link' => null,
                'sort_order' => 11,
                'galleries' => [
                    ['image_url' => '/covers/design/taiyaki.webp', 'caption' => '封面'],
                    ['image_url' => '/covers/design/taiyaki-1.webp', 'caption' => 'LOGO 與名片'],
                    ['image_url' => '/covers/design/taiyaki-2.webp', 'caption' => '外帶紙盒'],
                    ['image_url' => '/covers/design/taiyaki-3.webp', 'caption' => '立架'],
                    ['image_url' => '/covers/design/taiyaki-4.webp', 'caption' => '禮盒'],
                    ['image_url' => '/covers/design/taiyaki-5.webp', 'caption' => '海報'],
                    ['image_url' => '/covers/design/taiyaki-6.webp', 'caption' => '點餐 App 畫面'],
                ],
            ],
            [
                'slug' => 'sports-ecommerce-visuals',
                'title' => '運動用品電商活動視覺',
                'category_id' => $design->id,
                'cover_image_url' => '/covers/design/ecommerce-banners.webp',
                'description' => '運動用品通路的電商活動視覺：跑鞋新品主視覺、盲盒促銷、零碼特惠專區橫幅。每張都要在一秒內講清楚賣點與價格，並同時出 Momo／蝦皮／PChome 不同尺寸版本。',
                'technologies' => ['Photoshop', 'Illustrator', '電商視覺', '活動企劃'],
                'features' => [
                    '跑鞋系列主視覺：商品去背、賣點條列、價格層級分明',
                    '盲盒與零碼特惠的促銷橫幅，多平台尺寸延展',
                    '從企劃、文案到完稿一人完成',
                ],
                'project_link' => null,
                'github_link' => null,
                'sort_order' => 12,
                'galleries' => [
                    ['image_url' => '/covers/design/ecommerce-banners.webp', 'caption' => '封面'],
                    ['image_url' => '/covers/design/ecommerce-banners-1.webp', 'caption' => '跑鞋主視覺 1'],
                    ['image_url' => '/covers/design/ecommerce-banners-2.webp', 'caption' => '跑鞋主視覺 2'],
                    ['image_url' => '/covers/design/ecommerce-banners-3.webp', 'caption' => '跑鞋主視覺 3'],
                    ['image_url' => '/covers/design/ecommerce-banners-4.webp', 'caption' => '運動鞋盲盒促銷'],
                    ['image_url' => '/covers/design/ecommerce-banners-5.webp', 'caption' => '零碼特惠專區'],
                    ['image_url' => '/covers/design/ecommerce-banners-6.webp', 'caption' => '新品橫幅'],
                ],
            ],
            [
                'slug' => 'social-promotions-and-infographics',
                'title' => '社群促銷貼文與產品資訊圖',
                'category_id' => $design->id,
                'cover_image_url' => '/covers/design/social-posts.webp',
                'description' => '社群素材：運動相機三機規格比較圖、電商平台優惠倒數貼文、攝影工作坊活動海報。重點是把規格表做成一眼能比的資訊圖，而不是把數字堆上去。',
                'technologies' => ['Illustrator', 'Photoshop', '資訊圖表', '社群行銷'],
                'features' => [
                    '三機規格比較表：用色塊與圖示標出勝出項目',
                    '優惠倒數貼文的系列延展',
                    '活動海報整合品牌、課程資訊與報名方式',
                ],
                'project_link' => null,
                'github_link' => null,
                'sort_order' => 13,
                'galleries' => [
                    ['image_url' => '/covers/design/social-posts.webp', 'caption' => '封面'],
                    ['image_url' => '/covers/design/social-posts-1.webp', 'caption' => '運動相機規格比較圖'],
                    ['image_url' => '/covers/design/social-posts-2.webp', 'caption' => '優惠倒數貼文'],
                    ['image_url' => '/covers/design/social-posts-3.webp', 'caption' => '攝影工作坊海報'],
                ],
            ],
            [
                'slug' => 'food-brand-logos',
                'title' => '餐飲品牌 LOGO 與周邊應用',
                'category_id' => $design->id,
                'cover_image_url' => '/covers/design/food-brand-logos.webp',
                'description' => '三個餐飲小品牌的 LOGO 與周邊：炸雞店的文具與包裝、泰式餐車的圍裙與外帶包裝、豆腐店與選擇障礙主題的字體 LOGO。練的是把一個符號延伸到所有接觸點。',
                'technologies' => ['Illustrator', 'Photoshop', 'LOGO 設計', 'Mockup'],
                'features' => [
                    '炸雞品牌：LOGO 延伸到文具、紙袋與包裝',
                    '泰式餐車：鳳梨符號套用到圍裙、飲料杯、外帶盒',
                    '字體 LOGO 練習：東豆腐、今天吃什麼',
                ],
                'project_link' => null,
                'github_link' => null,
                'sort_order' => 14,
                'galleries' => [
                    ['image_url' => '/covers/design/food-brand-logos.webp', 'caption' => '封面'],
                    ['image_url' => '/covers/design/food-brand-logos-1.webp', 'caption' => '炸雞品牌周邊'],
                    ['image_url' => '/covers/design/food-brand-logos-2.webp', 'caption' => '泰式餐車圍裙'],
                    ['image_url' => '/covers/design/food-brand-logos-3.webp', 'caption' => '泰式餐車外帶包裝'],
                    ['image_url' => '/covers/design/food-brand-logos-4.webp', 'caption' => '字體 LOGO'],
                ],
            ],
        ];

        foreach ($projects as $data) {
            $hasGalleries = array_key_exists('galleries', $data);
            $galleries = $data['galleries'] ?? [];
            unset($data['galleries']);

            $project = Project::firstOrNew(['slug' => $data['slug']]);

            if (! $project->exists) {
                $project->is_published = true;
            }

            $project->fill($data);
            $project->save();

            if ($hasGalleries) {
                if (! empty($galleries)) {
                    $galleryImageUrls = array_column($galleries, 'image_url');
                    $project->galleries()->whereNotIn('image_url', $galleryImageUrls)->delete();

                    foreach ($galleries as $i => $g) {
                        $project->galleries()->updateOrCreate(
                            ['image_url' => $g['image_url']],
                            $g + ['sort_order' => $i]
                        );
                    }
                } else {
                    $project->galleries()->delete();
                }
            }
        }

        // 不在正本裡的作品一律下架（含寫到公司名的舊資料）
        Project::whereNotIn('slug', array_column($projects, 'slug'))->update(['is_published' => false]);

        CacheService::clearAll();
        $this->command?->info(count($projects).' 個作品已更新');
    }
}
