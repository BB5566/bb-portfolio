<template>
  <div class="admin-layout">
    <!-- 手機版遮罩 -->
    <transition name="backdrop-fade">
      <div v-if="isMobile && !isCollapse" class="sidebar-backdrop" @click="isCollapse = true" />
    </transition>

    <!-- 側邊欄 -->
    <aside
      class="admin-aside"
      :class="{
        'is-collapsed': isCollapse,
        'is-mobile-open': isMobile && !isCollapse,
        'is-mobile': isMobile
      }"
    >
      <div class="logo">
        <span class="logo-text" v-if="!isCollapse || isMobile">Admin Panel</span>
        <span class="logo-text logo-short" v-else>A</span>
      </div>

      <nav class="sidebar-nav">
        <!-- 儀表板 -->
        <div class="nav-section">
          <router-link
            to="/admin"
            class="nav-item"
            :class="{ active: $route.path === '/admin' }"
            @click="handleNavClick"
          >
            <el-icon class="nav-icon"><DataBoard /></el-icon>
            <span class="nav-label">儀表板</span>
          </router-link>
        </div>

        <!-- ORIGINS -->
        <div class="nav-section">
          <div class="nav-section-title">個人資料</div>
          <router-link
            to="/admin/hero"
            class="nav-item"
            :class="{ active: $route.path === '/admin/hero' }"
            @click="handleNavClick"
          >
            <el-icon class="nav-icon"><Star /></el-icon>
            <span class="nav-label">首頁設定</span>
          </router-link>
          <router-link
            to="/admin/profile"
            class="nav-item"
            :class="{ active: $route.path === '/admin/profile' }"
            @click="handleNavClick"
          >
            <el-icon class="nav-icon"><Postcard /></el-icon>
            <span class="nav-label">個人資料</span>
          </router-link>
          <router-link
            to="/admin/experiences"
            class="nav-item"
            :class="{ active: $route.path === '/admin/experiences' }"
            @click="handleNavClick"
          >
            <el-icon class="nav-icon"><Suitcase /></el-icon>
            <span class="nav-label">經歷管理</span>
          </router-link>
          <router-link
            to="/admin/education"
            class="nav-item"
            :class="{ active: $route.path === '/admin/education' }"
            @click="handleNavClick"
          >
            <el-icon class="nav-icon"><School /></el-icon>
            <span class="nav-label">學歷管理</span>
          </router-link>
        </div>

        <!-- VISIONS -->
        <div class="nav-section">
          <div class="nav-section-title">專案管理</div>
          <router-link
            to="/admin/projects"
            class="nav-item"
            :class="{ active: $route.path.startsWith('/admin/projects') }"
            @click="handleNavClick"
          >
            <el-icon class="nav-icon"><FolderOpened /></el-icon>
            <span class="nav-label">專案管理</span>
          </router-link>
        </div>

        <!-- CONTACT -->
        <div class="nav-section">
          <div class="nav-section-title">聯絡管理</div>
          <router-link
            to="/admin/contact"
            class="nav-item"
            :class="{ active: $route.path === '/admin/contact' }"
            @click="handleNavClick"
          >
            <el-icon class="nav-icon"><Setting /></el-icon>
            <span class="nav-label">聯絡設定</span>
          </router-link>
          <router-link
            to="/admin/messages"
            class="nav-item"
            :class="{ active: $route.path === '/admin/messages' }"
            @click="handleNavClick"
          >
            <el-icon class="nav-icon"><ChatDotRound /></el-icon>
            <el-badge :value="unreadCount" :hidden="unreadCount === 0" :max="99" class="nav-badge">
              <span class="nav-label">訊息管理</span>
            </el-badge>
          </router-link>
        </div>
      </nav>
    </aside>

    <!-- 主內容區 -->
    <div class="admin-main-wrapper">
      <!-- 頂欄 -->
      <header class="admin-header">
        <div class="header-left">
          <button
            class="collapse-btn"
            @click="toggleCollapse"
            :aria-label="isCollapse ? '展開選單' : '收合選單'"
          >
            <el-icon>
              <Fold v-if="!isCollapse && !isMobile" />
              <Expand v-else />
            </el-icon>
          </button>

          <nav class="breadcrumb" aria-label="麵包屑導覽">
            <router-link to="/admin" class="breadcrumb-item">首頁</router-link>
            <span v-if="breadcrumb" class="breadcrumb-sep">/</span>
            <span v-if="breadcrumb" class="breadcrumb-item breadcrumb-current">
              {{ breadcrumb }}
            </span>
          </nav>
        </div>

        <div class="header-right">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            class="preview-btn"
            title="預覽前台"
          >
            <el-icon><View /></el-icon>
            <span class="preview-label">預覽</span>
          </a>
          <el-dropdown @command="handleCommand">
            <button class="user-btn">
              <el-icon><User /></el-icon>
              <span>管理員</span>
              <el-icon class="arrow-icon"><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">
                  <el-icon><Postcard /></el-icon>
                  個人資料
                </el-dropdown-item>
                <el-dropdown-item command="logout">
                  <el-icon><SwitchButton /></el-icon>
                  登出
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <!-- 內容頁 -->
      <main class="admin-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import {
  DataBoard,
  FolderOpened,
  Fold,
  Expand,
  User,
  ArrowDown,
  SwitchButton,
  Suitcase,
  School,
  Star,
  Postcard,
  Setting,
  ChatDotRound,
  View
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/admin/auth'
import client from '@/api/client'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const unreadCount = ref(0)

const isCollapse = ref(false)
const isMobile = ref(false)

const MOBILE_BREAKPOINT = 768

const checkMobile = () => {
  const mobile = window.innerWidth < MOBILE_BREAKPOINT
  if (mobile !== isMobile.value) {
    isMobile.value = mobile
    // 手機版預設收合，桌面版預設展開
    isCollapse.value = mobile
  }
}

onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  try {
    const res = await client.get('/admin/contact-messages/stats')
    unreadCount.value = res.data.unread ?? 0
  } catch {
    // 忽略取得未讀數量失敗
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
})

const breadcrumb = computed(() => (route.meta.title as string) || '')

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

// 手機版：點導覽後自動關閉側欄
const handleNavClick = () => {
  if (isMobile.value) {
    isCollapse.value = true
  }
}

const handleCommand = (command: string) => {
  if (command === 'profile') {
    router.push('/admin/profile')
  } else if (command === 'logout') {
    ElMessageBox.confirm('確定要登出嗎？', '提示', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })
      .then(async () => {
        await authStore.logout()
        // 登出後主動導向登入頁，不必等下一次 401 才被攔截器導向
        router.push('/admin/login')
      })
      .catch(() => {
        // 使用者取消登出，忽略
      })
  }
}
</script>

<style scoped>
/* ============================================
   ADMIN LAYOUT
   ============================================ */

.admin-layout {
  display: flex;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg);
  position: relative;
}

/* 手機遮罩 */
.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 199;
  backdrop-filter: blur(2px);
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.25s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

/* ======= 側邊欄 ======= */
.admin-aside {
  width: 240px;
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--gunmetal);
  border-right: 1px solid var(--titanium);
  display: flex;
  flex-direction: column;
  transition:
    width 0.25s ease,
    transform 0.25s ease;
  flex-shrink: 0;
  z-index: 200;
  overflow: hidden;
}

.admin-aside.is-collapsed:not(.is-mobile) {
  width: 64px;
}

/* 手機模式：固定定位 overlay */
.admin-aside.is-mobile {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  height: 100dvh;
  width: 240px;
  transform: translateX(-100%);
}

.admin-aside.is-mobile.is-mobile-open {
  transform: translateX(0);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.5);
}

/* Logo */
.logo {
  height: 60px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  background: rgba(225, 193, 110, 0.05);
  border-bottom: 1px solid var(--titanium);
  overflow: hidden;
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1rem;
  color: var(--volt);
  letter-spacing: 2px;
  white-space: nowrap;
  text-transform: uppercase;
}

/* 導覽 */
.sidebar-nav {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px 0;
}

.nav-section {
  margin-bottom: 8px;
}

.nav-section-title {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 3px;
  text-transform: uppercase;
  padding: 12px 20px 4px;
  white-space: nowrap;
  overflow: hidden;
}

.is-collapsed:not(.is-mobile) .nav-section-title {
  opacity: 0;
  pointer-events: none;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 20px;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
  white-space: nowrap;
  overflow: hidden;
}

.nav-item:hover {
  background: var(--primary-light);
  color: var(--text);
}

.nav-item.active {
  background: var(--primary-light);
  color: var(--volt);
  border-left-color: var(--volt);
}

.nav-icon {
  font-size: 18px;
  flex-shrink: 0;
  width: 20px;
}

.nav-label {
  overflow: hidden;
  text-overflow: ellipsis;
}

.is-collapsed:not(.is-mobile) .nav-label,
.is-collapsed:not(.is-mobile) .nav-section-title {
  display: none;
}

/* ======= 主內容區域 ======= */
.admin-main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* 防止 flex 子元素溢出 */
}

/* ======= 頂部 Header ======= */
.admin-header {
  height: 60px;
  min-height: 60px;
  background: var(--bg);
  border-bottom: 1px solid var(--titanium);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
  box-sizing: border-box;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
}

.collapse-btn {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: 1px solid var(--titanium);
  border-radius: 6px;
  color: var(--volt);
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.collapse-btn:hover {
  background: var(--primary-light);
  border-color: var(--volt);
}

/* 麵包屑 */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  overflow: hidden;
}

.breadcrumb-item {
  color: var(--text-muted);
  text-decoration: none;
  white-space: nowrap;
  transition: color 0.2s;
}

.breadcrumb-item:hover {
  color: var(--text);
}

.breadcrumb-current {
  color: var(--volt);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.breadcrumb-sep {
  color: var(--text-muted);
  opacity: 0.4;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* 預覽按鈕 */
.preview-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  color: var(--text-muted);
  border: 1px solid var(--titanium);
  border-radius: 6px;
  font-size: 0.8rem;
  text-decoration: none;
  transition: all 0.2s ease;
  font-family: var(--font-mono);
}

.preview-btn:hover {
  color: var(--cta);
  border-color: var(--cta);
  background: var(--cta-light);
}

/* 使用者按鈕 */
.user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: none;
  border: 1px solid var(--titanium);
  border-radius: 6px;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.user-btn:hover {
  background: var(--primary-light);
  border-color: var(--volt);
  color: var(--volt);
}

.arrow-icon {
  font-size: 12px;
  opacity: 0.6;
}

/* 預覽標籤在小螢幕隱藏 */
@media (max-width: 480px) {
  .preview-label {
    display: none;
  }
}

/* ======= 主內容 ======= */
.admin-main {
  flex: 1;
  background: var(--surface);
  min-height: 0;
  overflow-y: auto;
}

/* Dark theme scrollbar */
.admin-main::-webkit-scrollbar {
  width: 10px;
}

.admin-main::-webkit-scrollbar-track {
  background: var(--bg);
}

.admin-main::-webkit-scrollbar-thumb {
  background: var(--titanium);
  border-radius: 0;
}

.admin-main::-webkit-scrollbar-thumb:hover {
  background: var(--volt);
}

.sidebar-nav::-webkit-scrollbar {
  width: 6px;
}

.sidebar-nav::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-nav::-webkit-scrollbar-thumb {
  background: var(--titanium);
  border-radius: 0;
}

/* 頁面過渡 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 未讀徽章 */
.nav-badge {
  display: inline-flex;
  align-items: center;
}

.nav-badge :deep(.el-badge__content) {
  top: -4px;
  right: -20px;
  border: none;
}
</style>
