#!/bin/sh
set -e

# 修正 NAS 映射目錄的讀寫權限（使用 775 而非 777，確保安全性）
chmod -f -R 775 /var/www/html/backend/storage /var/www/html/uploads || true
chown -f -R www-data:www-data /var/www/html/backend/storage /var/www/html/uploads || true

# 建立 storage public symlink（若已存在則跳過）— 防止容器重建後 /storage/* 圖片 404
# 根因：2026-08-07 watchtower 重建容器後 symlink 遺失，所有封面圖破圖；改在此每次啟動自動確保
if [ -d /var/www/html/backend/storage/app/public ]; then
  if [ ! -L /var/www/html/backend/public/storage ]; then
    php /var/www/html/backend/artisan storage:link
  fi
fi

exec "$@"
