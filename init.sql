-- MySQL dump 10.13  Distrib 8.0.44, for Linux (aarch64)
-- Host: localhost    Database: portfolio_db
-- ------------------------------------------------------
-- Server version	8.0.44

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Table structure for table `cache`

DROP TABLE IF EXISTS `cache`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Table structure for table `cache_locks`

DROP TABLE IF EXISTS `cache_locks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cache_locks` (
  `key` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` int NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Table structure for table `categories`

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '分類名稱',
  `slug` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用於URL的英文簡稱',
  `description` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '分類描述',
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `categories`

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (1,'網頁設計','web',NULL),(2,'UI/UX','UI/UX',NULL),(3,'平面設計','graphic',NULL);
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

-- Table structure for table `contact_messages`

DROP TABLE IF EXISTS `contact_messages`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `contact_messages` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `ip_address` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `read_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `contact_messages_is_read_index` (`is_read`),
  KEY `contact_messages_created_at_index` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Table structure for table `education`

DROP TABLE IF EXISTS `education`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `education` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `school` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `degree` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `field_of_study` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `activities` json DEFAULT NULL,
  `gpa` decimal(3,2) DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `education_sort_order_index` (`sort_order`),
  KEY `education_is_visible_index` (`is_visible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `education`

LOCK TABLES `education` WRITE;
/*!40000 ALTER TABLE `education` DISABLE KEYS */;
INSERT INTO `education` VALUES (1,'National Taiwan University','Bachelor of Science','Computer Science','Taipei, Taiwan','2016-09-01','2020-06-30',0,'Focused on software engineering, algorithms, and web development.','[\"資訊社團副社長\", \"ACM 程式競賽參賽\", \"開源專案貢獻者\"]',3.80,1,1,'2025-11-30 16:16:18','2025-11-30 16:16:18');
/*!40000 ALTER TABLE `education` ENABLE KEYS */;
UNLOCK TABLES;

-- Table structure for table `experiences`

DROP TABLE IF EXISTS `experiences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `experiences` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `company` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `is_current` tinyint(1) NOT NULL DEFAULT '0',
  `description` text COLLATE utf8mb4_unicode_ci,
  `achievements` json DEFAULT NULL,
  `technologies` json DEFAULT NULL,
  `sort_order` int NOT NULL DEFAULT '0',
  `is_visible` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `experiences_sort_order_index` (`sort_order`),
  KEY `experiences_is_visible_index` (`is_visible`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `experiences`

LOCK TABLES `experiences` WRITE;
/*!40000 ALTER TABLE `experiences` DISABLE KEYS */;
INSERT INTO `experiences` VALUES (1,'Tech Company','Senior Full Stack Developer','Taipei, Taiwan','2022-01-01',NULL,1,'Leading development of web applications using modern technologies.','[\"領導開發團隊完成 5 個大型專案\", \"優化系統效能提升 40%\", \"建立 CI/CD 流程自動化部署\"]','[\"Vue 3\", \"Laravel\", \"Docker\", \"AWS\"]',1,1,'2025-11-30 16:16:18','2025-11-30 16:16:18'),(2,'Startup Inc.','Full Stack Developer','Taipei, Taiwan','2020-06-01','2021-12-31',0,'Developed and maintained multiple web applications.','[\"開發電商平台處理每日萬筆交易\", \"實作即時聊天系統\", \"導入單元測試覆蓋率達 80%\"]','[\"React\", \"Node.js\", \"MongoDB\", \"Redis\"]',2,1,'2025-11-30 16:16:18','2025-11-30 16:16:18');
/*!40000 ALTER TABLE `experiences` ENABLE KEYS */;
UNLOCK TABLES;

-- Table structure for table `failed_jobs`

DROP TABLE IF EXISTS `failed_jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `failed_jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Table structure for table `job_batches`

DROP TABLE IF EXISTS `job_batches`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `job_batches` (
  `id` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Table structure for table `jobs`

DROP TABLE IF EXISTS `jobs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `jobs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` tinyint unsigned NOT NULL,
  `reserved_at` int unsigned DEFAULT NULL,
  `available_at` int unsigned NOT NULL,
  `created_at` int unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Table structure for table `migrations`

DROP TABLE IF EXISTS `migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `migrations` (
  `id` int unsigned NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `migrations`

LOCK TABLES `migrations` WRITE;
/*!40000 ALTER TABLE `migrations` DISABLE KEYS */;
INSERT INTO `migrations` VALUES (20,'0001_01_01_000000_create_users_table',1),(21,'0001_01_01_000001_create_cache_table',1),(22,'0001_01_01_000002_create_jobs_table',1),(23,'2025_11_01_112025_create_categories_table',1),(24,'2025_11_01_112026_create_tags_table',1),(25,'2025_11_01_112027_create_projects_table',1),(26,'2025_11_01_112028_create_project_galleries_table',1),(27,'2025_11_01_112029_create_project_tag_map_table',1),(28,'2025_11_02_062624_create_profiles_table',2),(29,'2025_11_02_062629_create_experiences_table',2),(30,'2025_11_02_062633_create_education_table',2),(31,'2025_11_02_160239_create_personal_access_tokens_table',2),(32,'2025_11_02_172620_create_contact_messages_table',2);
/*!40000 ALTER TABLE `migrations` ENABLE KEYS */;
UNLOCK TABLES;

-- Table structure for table `personal_access_tokens`

DROP TABLE IF EXISTS `personal_access_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personal_access_tokens` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint unsigned NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Table structure for table `profiles`

DROP TABLE IF EXISTS `profiles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `profiles` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `subtitle` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bio` text COLLATE utf8mb4_unicode_ci,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `location` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `avatar` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `resume_url` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `github` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `linkedin` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `twitter` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `facebook` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `instagram` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `website` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `skills` json DEFAULT NULL,
  `meta_title` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `meta_description` text COLLATE utf8mb4_unicode_ci,
  `meta_keywords` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `profiles`

LOCK TABLES `profiles` WRITE;
/*!40000 ALTER TABLE `profiles` DISABLE KEYS */;
INSERT INTO `profiles` VALUES (1,'Bob Tsou','Web & UI/UX Designer','網頁與介面設計師','擁有超過 7 年平面設計與電商行銷經驗，擅長商品視覺規劃、促銷活動設計與廣告素材製作，具備跨平台整合行銷實績（蝦皮、Momo、Shopline）。為進一步結合設計與開發能力，我投入 920 小時密集網頁開發訓練，已熟悉 HTML、CSS、JavaScript、Bootstrap、PHP、Laravel、MySQL、Git 等前後端技能。熱衷於打造具商業價值與良好使用者體驗的數位產品，期望發揮設計與技術的雙重優勢。','hello@bb-made.com',NULL,'台灣',NULL,NULL,'https://github.com/BB5566',NULL,NULL,NULL,NULL,'https://bb-made.com','{\"Tools\": [\"Git\", \"Docker\", \"CI/CD\", \"AWS\"], \"Backend\": [\"Laravel\", \"Node.js\", \"Python\", \"PostgreSQL\"], \"Frontend\": [\"Vue 3\", \"React\", \"TypeScript\", \"Tailwind CSS\"]}',NULL,NULL,NULL,'2025-11-30 16:16:18','2025-11-30 16:16:18');
/*!40000 ALTER TABLE `profiles` ENABLE KEYS */;
UNLOCK TABLES;

-- Table structure for table `project_galleries`

DROP TABLE IF EXISTS `project_galleries`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_galleries` (
  `id` int NOT NULL AUTO_INCREMENT,
  `project_id` int NOT NULL,
  `image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `caption` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '圖片說明',
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `project_id` (`project_id`),
  CONSTRAINT `project_galleries_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `project_galleries`

LOCK TABLES `project_galleries` WRITE;
/*!40000 ALTER TABLE `project_galleries` DISABLE KEYS */;
INSERT INTO `project_galleries` VALUES (3,8,'uploads/萬年曆_20250815_1b7231be_gallery.gif','',0);
/*!40000 ALTER TABLE `project_galleries` ENABLE KEYS */;
UNLOCK TABLES;

-- Table structure for table `project_tag_map`

DROP TABLE IF EXISTS `project_tag_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `project_tag_map` (
  `project_id` int NOT NULL,
  `tag_id` int NOT NULL,
  PRIMARY KEY (`project_id`,`tag_id`),
  KEY `tag_id` (`tag_id`),
  CONSTRAINT `project_tag_map_ibfk_1` FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) ON DELETE CASCADE,
  CONSTRAINT `project_tag_map_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `project_tag_map`

LOCK TABLES `project_tag_map` WRITE;
/*!40000 ALTER TABLE `project_tag_map` DISABLE KEYS */;
INSERT INTO `project_tag_map` VALUES (8,1),(10,1),(11,1),(12,1),(13,1),(14,1),(15,1),(16,1),(17,1),(18,1),(8,2),(10,2),(11,2),(12,2),(13,2),(14,2),(15,2),(16,2),(17,2),(18,2),(12,3),(13,3),(14,3),(15,3),(16,3),(17,3),(18,3),(12,4),(15,4),(17,4),(12,5),(15,5),(17,5),(18,5),(8,6),(10,6),(11,6),(13,6),(14,6),(10,8),(11,8),(13,8),(12,13);
/*!40000 ALTER TABLE `project_tag_map` ENABLE KEYS */;
UNLOCK TABLES;

-- Table structure for table `projects`

DROP TABLE IF EXISTS `projects`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `projects` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_id` int NOT NULL COMMENT '關聯到 categories 表的 ID',
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '專案標題',
  `cover_image_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '封面圖片路徑',
  `preview_media_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '預覽媒體 (GIF/MP4) 路徑',
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '專案簡介',
  `project_link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT '專案連結 (網站或遊戲)',
  `github_link` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL COMMENT 'GitHub 連結',
  `sort_order` int DEFAULT '0' COMMENT '排序權重',
  `is_published` tinyint(1) NOT NULL DEFAULT '1' COMMENT '是否發布',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `projects_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `projects`

LOCK TABLES `projects` WRITE;
/*!40000 ALTER TABLE `projects` DISABLE KEYS */;
INSERT INTO `projects` VALUES (8,1,'萬年曆','uploads/萬年曆_20250815_1b7231be_gallery.gif','','本專案是一個以 PHP 製作的「天線寶寶萬年曆」網頁系統，提供使用者瀏覽任意月份日曆。介面美觀，支援節日標示、今日高亮、週末特別樣式，並可快速切換上下月份或跳回本月。頁面包含天線寶寶動畫，並具備響應式設計，適合桌機與手機瀏覽。\r\n\r\n主要功能：\r\n\r\n年月選擇與跳轉\r\n上下月快速切換\r\n今日、週末、節日高亮顯示\r\n本月資訊與節日清單\r\n動態顯示現在時間\r\n響應式設計，適合各種裝置','https://bb-made.com/projects/calendar/','https://github.com/BB5566/calendar',0,1,'2025-08-13 08:03:04'),(10,1,'美食論壇','uploads/美食論壇_20250917_9742a4c4.png','','🍜 美食論壇\r\n一個採用無印良品風格的美食分享平台，展示完整 Web 開發能力。\r\n\r\n✨ 專案亮點\r\n·優雅設計：MUJI 風格的簡潔介面，完美響應式佈局\r\n·完整功能：會員系統、文章發布、圖片上傳、分類管理\r\n·安全實作：防 SQL 注入、防 XSS 攻擊\r\n·現代技術：PHP 8.2 + MySQL + 原生 CSS\r\n🛠️ 技術展示\r\n·MVC 架構設計\r\n·Prepared Statements 資料庫操作\r\n·HTML 清理與輸入驗證\r\n·圖片處理與縮圖生成\r\n·分頁系統與用戶體驗優化\r\n\r\n這是一個涵蓋前端設計、後端開發、安全實作的作品集項目。','https://bb-made.com/projects/food-forum/','https://github.com/BB5566/food-forum',0,1,'2025-09-15 04:21:51'),(11,1,'泰褲辣早餐店後台管理系統','uploads/泰褲辣早餐店後台管理系統_20250915_c18eb669.png','','一套以 PHP 8 + MySQL 開發的餐飲業後台管理專案，支援品項管理、分類、圖片上傳、銷售統計，並以 .env 管理敏感資訊，適合中小型餐飲業者或作為全端求職作品展示。\r\n\r\n專案特色\r\n品項 CRUD：可新增、編輯、刪除餐點，支援分類與圖片上傳。\r\n銷售統計：自動統計每個品項的銷售數量。\r\n分類管理：支援多種餐點分類，介面分組顯示。\r\n圖片管理：每個品項可上傳圖片，並自動儲存於 uploads/ 目錄。\r\n環境變數管理：所有敏感資訊（DB、帳號）皆由 .env 控管，安全易維護。\r\n簡潔 UI：純 PHP + Bootstrap，無框架依賴，易於理解與二次開發。\r\nRESTful API：後端 API 與前端分離，AJAX 操作資料。\r\n求職亮點\r\n展現 PHP/MySQL/前後端整合能力\r\n具備環境變數、API 分離、AJAX、圖片上傳等實務技能\r\n程式碼結構清晰，易於維護與擴充','https://bb-made.com/projects/restaurant-admin/','https://github.com/BB5566/restaurant-admin',0,1,'2025-09-15 08:33:22'),(12,1,'BOB Origin - 精品咖啡網站','uploads/BOB-Origin---精品咖啡網站_20250916_483a43bd.png','','沉浸式視覺體驗：透過精美的輪播圖和動畫效果，帶您進入咖啡的世界。\r\n精選咖啡豆：展示來自世界各地的精品咖啡豆，並提供詳細的風味描述。\r\n品牌故事：深入了解 BOB Origin 對單一產地、公平貿易和手工烘焙的堅持。\r\n互動式聯絡表單：方便使用者與我們聯繫，提出疑問或建議。\r\n響應式設計：網站完美適應各種裝置，提供流暢的瀏覽體驗。','https://bb-made.com/projects/coffee_page/','https://github.com/BB5566/coffee_page',0,1,'2025-09-16 11:21:00'),(13,1,'心情日曆-AI情緒日記','uploads/心情日曆-AI情緒日記_20250919_b1247726.gif','','在資訊爆炸的時代，我們需要更有溫度的方式來記錄與回顧自己的內心世界。MoodCanvas 的核心理念便是為使用者提供一個超越文字的日記體驗。透過分析日記的內容與情緒，應用程式會智慧地建構提示詞，並呼叫多個外部 AI 模型（包含 Perplexity、Gemini、Stability AI），將使用者的思緒與感受，轉化為獨一無二的數位藝術作品，讓每一篇日記都成為值得珍藏的視覺化回憶。\r\n\r\n主要功能亮點\r\nAI 智慧圖文生成：深度整合多個生成式 AI 服務，使用者只需輸入日記內容，系統即可自動生成符合情境的 AI 插畫與心情短語。\r\n\r\n多種藝術風格：內建多種藝術風格（如吉卜力、梵谷、寫實攝影等），使用者可自由選擇，為自己的回憶增添個人色彩。\r\n\r\n心情日曆與數據洞察：直觀的日曆介面，讓心情一目了然。更提供視覺化儀表板，透過熱力圖、趨勢圖與文字雲，幫助使用者洞察自己的情緒模式。\r\n\r\n安全的使用者系統：實現了完整的會員註冊、登入與 Session 管理機制，並透過密碼雜湊與輸入清理，確保使用者資料的安全性。\r\n\r\n現代化響應式介面：採用 Glassmorphism（玻璃擬態）風格設計，搭配 RWD 響應式佈局，確保在桌面、平板與手機上都有一致且流暢的視覺體驗。\r\n\r\n技術棧與架構\r\n後端：PHP 7.4+ (自建輕量級 MVC 架構)、PDO 資料庫操作。\r\n\r\n前端：原生 JavaScript (ES6)、Chart.js、D3.js、CSS3 動畫與響應式設計。\r\n\r\n資料庫：MySQL / MariaDB。\r\n\r\nAI 整合：\r\n\r\n透過 RESTful API 串接 Perplexity、Gemini 與 Stability AI 服務。\r\n\r\n採用 Adapter 設計模式 封裝不同 AI 服務的連線邏輯，未來可輕鬆抽換或新增其他 AI供應商，具備高度擴充性。\r\n\r\n環境與部署：Apache / Nginx 搭配 .htaccess 進行 URL Rewrite，並使用 .env 檔案管理敏感金鑰與環境變數。\r\n\r\n專案挑戰與學習\r\n開發過程中最大的挑戰在於整合與調度多個行為各異的 AI API。例如，處理 Gemini API 400 Bad Request 的 payload 格式錯誤、解決 Perplexity 模型名稱驗證問題，並為 API 呼叫失敗設計穩健的備援（Fallback）機制。這個過程讓我深入理解了 API 文件的解讀、非同步操作的錯誤處理，以及如何透過「提示詞工程」（Prompt Engineering）將使用者輸入轉化為高品質的 AI 指令。','https://bb-made.com/projects/MoodCanvas/','https://github.com/BB5566/MoodCanvas',0,1,'2025-09-18 21:44:45'),(14,1,'機票搜尋查價','uploads/機票搜尋查價_20250921_1258823f.webp','','一個使用 PHP 和原生 JavaScript 打造，簡潔而強大的機票搜尋引擎。此應用程式串接 Amadeus API 來獲取即時航班資料，並擁有一個乾淨、現代化且響應式的操作介面。\r\n\r\n單程與來回搜尋： 可輕鬆切換單程或來回模式。\r\n乘客選擇： 可選擇成人、兒童和嬰兒的數量。\r\n艙等選擇： 可選擇經濟艙、豪華經濟艙、商務艙或頭等艙。\r\n幣別選擇： 可用多種貨幣查看票價 (TWD, USD, JPY 等)。\r\n直飛篩選： 可篩選只顯示直飛航班。\r\n現代化介面： 乾淨、專業且響應式的設計，在各種裝置上都能良好運作。\r\n前端結果篩選與排序： 在結果頁上，可即時按價格、飛行時間和航空公司進行篩選與排序。','https://bb-made.com/projects/flight-search/','https://github.com/BB5566/flight-search',0,1,'2025-09-21 10:02:26'),(15,1,'投籃機','uploads/投籃機_20251009_6ab24a80.gif','','網頁投籃機小遊戲','https://bb-made.com/projects/basketball-game/','https://github.com/BB5566/basketball-game',0,1,'2025-10-09 08:59:44'),(16,1,'線上商店購物車','uploads/placeholder.jpg','','使用原生 JavaScript、HTML 和 CSS 打造的純前端線上商店購物車介面。專案模擬了基本的電商功能，包括瀏覽商品、將商品加入購物車、修改數量以及計算總金額。所有狀態都儲存在瀏覽器的 Local Storage 中，無需後端伺服器即可運行。\n\n主要功能：\n• 商品瀏覽：從 products.json 動態載入並展示商品列表\n• 互動式購物車：支援新增、修改商品數量，並即時更新購物車內容\n• 價格即時計算：自動計算商品總價，並包含滿額折扣邏輯\n• 本地儲存：使用 Local Storage 儲存購物車狀態，刷新頁面後內容不遺失','https://bb-made.com/projects/onlineShop/','https://github.com/BB5566/onlineShop',0,1,'2025-11-30 06:34:50'),(17,1,'台灣天氣預報','uploads/placeholder.jpg','','串接中央氣象署天氣 API 的示範前端小專案，使用 jQuery 及 Bootstrap 呈現。\n\n主要功能：\n• 顯示台灣各縣市天氣資訊\n• 日夜間天氣圖示切換\n• 響應式設計，支援手機瀏覽','https://bb-made.com/projects/weather/','https://github.com/BB5566/weather',0,1,'2025-11-30 06:34:50'),(18,1,'單字卡學習工具','uploads/placeholder.jpg','','使用 Bootstrap 5 和原生 JavaScript 製作的互動式單字卡學習工具。\n\n主要功能：\n• 3D 翻牌動畫效果\n• 點擊卡片翻轉顯示答案\n• 響應式設計，適合各種裝置','https://bb-made.com/projects/word_cards/','https://github.com/BB5566/word_cards',0,1,'2025-11-30 06:34:50');
/*!40000 ALTER TABLE `projects` ENABLE KEYS */;
UNLOCK TABLES;

-- Table structure for table `tags`

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `category` enum('Frontend','Backend','Database','Design','Tool') CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT 'Tool',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

-- Dumping data for table `tags`

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'HTML','Frontend'),(2,'CSS','Frontend'),(3,'JavaScript','Frontend'),(4,'jQuery','Frontend'),(5,'Bootstrap','Frontend'),(6,'PHP','Backend'),(7,'Laravel','Backend'),(8,'MySQL','Database'),(9,'Git','Tool'),(10,'Photoshop','Design'),(11,'Illustrator','Design'),(12,'Figma','Design'),(13,'GSAP','Frontend');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

-- Table structure for table `users`

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;


-- Dumping routines for database 'portfolio_db'
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-11-30 16:21:31
