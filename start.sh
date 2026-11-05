#!/bin/bash

# Portfolio 專案快速啟動腳本
# 使用方法: ./start.sh [dev|prod|stop]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 顏色定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 輔助函數
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 檢查依賴
check_dependencies() {
    log_info "檢查依賴..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker 未安裝，請先安裝 Docker"
        exit 1
    fi
    
    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安裝，請先安裝 Node.js"
        exit 1
    fi
    
    log_info "✓ 所有依賴已滿足"
}

# 啟動開發環境
start_dev() {
    log_info "啟動開發環境..."
    
    # 啟動 Docker 服務
    log_info "啟動 Docker 服務..."
    docker-compose up -d
    
    # 等待資料庫啟動
    log_info "等待資料庫啟動..."
    sleep 5
    
    # 檢查並執行遷移
    log_info "檢查資料庫遷移..."
    docker-compose exec -T backend php artisan migrate --force 2>/dev/null || log_warn "資料庫已是最新狀態"
    
    # 啟動前端開發服務器
    log_info "啟動前端開發服務器..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    
    log_info "✓ 開發環境已啟動！"
    log_info "前端: http://localhost:5173"
    log_info "後端 API: http://localhost:8000"
    log_info "後台管理: http://localhost:5173/admin"
    log_info "phpMyAdmin: http://localhost:8081"
    log_info ""
    log_info "按 Ctrl+C 停止服務"
    
    # 等待 Ctrl+C
    trap "log_info '正在停止服務...'; kill $FRONTEND_PID; docker-compose stop; exit" INT
    wait
}

# 啟動生產環境
start_prod() {
    log_info "啟動生產環境..."
    
    # 啟動 Docker 生產服務並建置映像檔
    log_info "建置並啟動 Docker 生產服務..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    log_info "✓ 生產環境已啟動！"
}

# 停止所有服務
stop_all() {
    log_info "停止所有服務..."
    docker-compose stop
    docker-compose -f docker-compose.prod.yml stop 2>/dev/null || true
    log_info "✓ 所有服務已停止"
}

# 主程序
case "${1:-dev}" in
    dev)
        check_dependencies
        start_dev
        ;;
    prod)
        check_dependencies
        start_prod
        ;;
    stop)
        stop_all
        ;;
    *)
        log_error "未知的命令: $1"
        echo "使用方法: $0 [dev|prod|stop]"
        exit 1
        ;;
esac
