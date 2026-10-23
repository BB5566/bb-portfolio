# 🎨 BOB TSOU | 個人作品集網站

> 這是公開展示版（只含目前程式碼，不含開發歷史）。線上網站：https://bb-made.com/ 。開發主 repo 為私人，部署腳本與內部文件不在此版。


現代化、響應式的個人作品集網站，採用前後端分離架構。

[![線上展示](https://img.shields.io/badge/🌐_線上展示-查看作品集-4CAF50?style=for-the-badge)](https://bb-made.com/)
[![技術棧](https://img.shields.io/badge/⚡_技術棧-Vue3_Laravel11-1976D2?style=for-the-badge)](#-技術架構)

## ✨ 專案特色

### 💡 **現代化架構**
- **前後端分離**：Vue 3 + Laravel 11 前後端分離架構
- **完整後台管理**：支援個人資料、經歷、學歷、專案的 CRUD 操作
- **類型安全**：TypeScript 提供完整的類型檢查
- **響應式設計**：完美適配桌面、平板、手機等各種設備

### 🎯 **互動體驗**
- **智能眼睛追蹤**：獨創的眼球跟隨滑鼠效果
- **流暢動畫**：基於 GSAP 的專業級動畫系統
- **秒開體驗**：優化的載入策略和圖片懶加載
- **SEO 優化**：完整的 sitemap.xml 和 robots.txt 配置

## 🛠️ 技術架構

### 前端
![Vue.js](https://img.shields.io/badge/Vue.js_3-35495E?style=flat-square&logo=vue.js&logoColor=4FC08D)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?style=flat-square&logo=pinata&logoColor=black)
![Element Plus](https://img.shields.io/badge/Element_Plus-409EFF?style=flat-square&logo=element&logoColor=white)
![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat-square&logo=greensock&logoColor=white)

### 後端
![Laravel](https://img.shields.io/badge/Laravel_11-FF2D20?style=flat-square&logo=laravel&logoColor=white)
![PHP](https://img.shields.io/badge/PHP_8.2-777BB4?style=flat-square&logo=php&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL_8.0-4479A1?style=flat-square&logo=mysql&logoColor=white)

### 開發工具
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)

## 📁 專案結構

```
portfolio/
├── backend/                    # Laravel 11 API 後端
│   ├── app/
│   │   ├── Http/Controllers/
│   │   │   └── Api/           # RESTful API Controllers
│   │   └── Models/            # Eloquent Models
│   ├── database/
│   │   └── migrations/        # 資料庫遷移檔案
│   ├── routes/
│   │   └── api.php            # API 路由定義
│   └── public/uploads/        # 上傳檔案儲存
│
├── frontend/                   # Vue 3 前端
│   ├── src/
│   │   ├── components/        # Vue 元件
│   │   ├── views/             # 頁面視圖
│   │   │   ├── HomeNew.vue    # 前台首頁
│   │   │   └── admin/         # 後台管理頁面
│   │   ├── stores/            # Pinia 狀態管理
│   │   ├── services/          # API 服務層
│   │   └── utils/             # 工具函數
│   └── public/                # 靜態資源
│
├── docker-compose.yml          # 本機開發用 Docker 環境
├── docker-compose.prod.yml     # 生產環境 Docker 部署設定
├── start.sh                    # 快速啟動腳本
├── DEPLOYMENT.md               # 部署指南
└── SYSTEM_STRUCTURE.md         # 系統架構文件
```

## 🚀 快速開始

### 方式 1: 使用快速啟動腳本（推薦）

```bash
# 賦予腳本執行權限
chmod +x start.sh

# 啟動開發環境
./start.sh dev

# 停止所有服務
./start.sh stop
```

### 方式 2: 使用 Docker Compose

```bash
# 啟動所有服務
docker-compose up -d

# 執行資料庫遷移
docker-compose exec backend php artisan migrate

# 查看服務狀態
docker-compose ps
```

### 訪問應用程式

- **前端**: http://localhost:5173
- **後端 API**: http://localhost:8000
- **後台管理**: http://localhost:5173/admin
- **phpMyAdmin**: http://localhost:8081

## 🎯 核心功能

### 📊 **前台展示**
- 個人簡介與技能展示
- 工作經歷時間軸
- 學歷背景展示
- 專案作品集網格
- 響應式聯絡表單

### ⚙️ **後台管理**
- 個人資料管理（含技能編輯）
- 工作經歷 CRUD（含成就與技術標籤）
- 學歷背景 CRUD
- 專案管理（含圖片上傳）
- 分類與標籤管理

### 🔐 **安全性**
- Laravel Sanctum API 認證
- CORS 跨域保護
- 環境變數配置
- 輸入驗證與清理

## 📚 API 端點

### 公開 API（前台使用）
```
GET  /api/v1/profile              # 個人資料
GET  /api/v1/experiences          # 工作經歷（僅顯示可見的）
GET  /api/v1/education            # 學歷背景（僅顯示可見的）
GET  /api/v1/projects             # 專案列表（僅顯示已發布的）
GET  /api/v1/categories           # 專案分類
GET  /api/v1/tags                 # 專案標籤
```

### 管理 API（後台使用）
```
PUT    /api/v1/profile                      # 更新個人資料
CRUD   /api/v1/admin/experiences            # 經歷管理
CRUD   /api/v1/admin/education              # 學歷管理
CRUD   /api/v1/admin/projects               # 專案管理
CRUD   /api/v1/categories                   # 分類管理
CRUD   /api/v1/tags                         # 標籤管理
```

## 🔧 環境配置

### 後端環境變數 (backend/.env)
```env
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=portfolio_db
DB_USERNAME=root
DB_PASSWORD=your_password

SANCTUM_STATEFUL_DOMAINS=localhost:5173

# 管理員預設密碼 (Database Seeder 使用)
ADMIN_PASSWORD=please_change_this
```

### 前端環境變數 (frontend/.env)
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
VITE_BACKEND_URL=http://localhost:8000
```

完整的環境變數配置請參考 `.env.example` 檔案。

## 📈 效能優化

- ⚡ **圖片懶加載**：Intersection Observer API 實現智能加載
- 🚀 **API 快取**：Laravel 查詢優化與結果快取
- 📦 **程式碼分割**：Vue Router 路由懶加載
- 🎨 **CSS 優化**：關鍵 CSS 內聯與非關鍵資源延遲加載

## 🏗️ 開發指南

詳細的開發與部署說明請參考：
- **部署指南**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **系統架構**: [SYSTEM_STRUCTURE.md](SYSTEM_STRUCTURE.md)
- **歷史文件**: [docs/archive/](docs/archive/) (遷移過程文件)

## 👨‍💻 關於作者

**Bob Tsou** - 網頁開發與 UI/UX 設計師

🔸 **設計背景**：7+ 年平面設計與電商行銷經驗
🔸 **技術轉型**：920 小時密集網頁開發訓練
🔸 **專業技能**：Vue.js、Laravel、TypeScript、Docker
🔸 **設計工具**：Photoshop、Illustrator、Figma

### 📞 聯絡方式
- 🌐 **作品集展示**：[線上查看](https://bb-made.com/)
- 📧 **Email**：contact@bb-made.com
- 🐙 **GitHub**：[@BB5566](https://github.com/BB5566)

---

<div align="center">

**🚀 [立即查看線上作品集](https://bb-made.com/) 🚀**

*展示現代前後端分離架構與設計美學的完美結合*

⭐ 如果您喜歡這個作品，歡迎給個星星支持！

**Generated with [Claude Code](https://claude.ai/code) via [Happy](https://happy.engineering)**

</div>
