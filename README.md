# BB MADE｜個人作品集網站

> 公開展示版：只有目前的程式碼快照，不含開發歷史。開發主 repo 為私人，部署腳本與內部文件不在這裡。
> 線上網站：https://bb-made.com/

前端工程師 Bob 的作品集。首頁是單頁 landing，另有一個仿桌面系統的 [Portfolio OS](https://bb-made.com/os)，內容由後端 API 提供。

## 看點

- **兩種瀏覽方式**：單頁 landing（`HomeLanding.vue`），和可以開視窗、用終端機的 Portfolio OS（`components/desktop/`）
- **動態封面按需載入**：作品卡片捲到畫面內才載入影片、離開就暫停；系統開「減少動態效果」只顯示靜態圖（`CoverMedia.vue`）
- **內容即程式碼**：作品、經歷、自介寫在 seeder（`backend/database/seeders/`），改內容走 PR、部署時自動寫進資料庫
- **每個 PR 都要過檢查**：GitHub Actions 跑 ESLint、型別檢查、Vitest、Laravel 測試與 Lighthouse

## 技術

| 前端 | 後端 | 部署 |
|---|---|---|
| Vue 3、TypeScript、Vite、Pinia、Vue Router | Laravel 12（PHP 8.2）、Sanctum、MySQL | Docker、GitHub Actions |
| GSAP、Three.js、Element Plus（後台） | RESTful API（`/api/v1`） | 自架主機＋Cloudflare |
| Vitest、Vue Test Utils | PHPUnit | |

## 結構

```
frontend/
  src/views/HomeLanding.vue      首頁
  src/components/landing/        首頁各區塊（作品、經歷、技能、聯絡）
  src/components/desktop/        Portfolio OS（Finder、終端機、信件…）
  src/views/admin/               後台
backend/
  app/Http/Controllers/Api/      API
  database/seeders/              網站內容
docker-compose.yml               本機開發環境
```

## 本機跑起來

```bash
cp .env.docker.example .env      # 填入資料庫密碼等設定
docker compose up -d             # 後端啟動時會自動跑 migration
docker compose exec backend php /var/www/html/backend/artisan db:seed
```

- 前端：http://localhost:3000
- 後端 API：http://localhost:8000/api/v1/profile

或用 `./start.sh dev` 一鍵啟動。

## 聯絡

- 作品集：https://bb-made.com/
- Email：hello@bb-made.com
