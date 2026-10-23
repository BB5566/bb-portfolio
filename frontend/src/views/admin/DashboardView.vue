<template>
  <div class="dashboard">
    <div class="page-header">
      <h1 class="page-title">儀表板</h1>
      <p class="page-subtitle">歡迎回來，{{ authStore.user?.name || '管理員' }}</p>
    </div>

    <!-- 統計卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="12" :lg="6">
        <div class="stat-card" :class="{ loaded: !loading }">
          <div class="stat-icon stat-icon--projects">
            <el-icon><FolderOpened /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ displayedStats.totalProjects }}</div>
            <div class="stat-label">總專案數</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6">
        <div class="stat-card" :class="{ loaded: !loading }">
          <div class="stat-icon stat-icon--published">
            <el-icon><SuccessFilled /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ displayedStats.publishedProjects }}</div>
            <div class="stat-label">已發布</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6">
        <div class="stat-card" :class="{ loaded: !loading }">
          <div class="stat-icon stat-icon--draft">
            <el-icon><Edit /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ displayedStats.draftProjects }}</div>
            <div class="stat-label">草稿</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6">
        <div class="stat-card" :class="{ loaded: !loading }">
          <div class="stat-icon stat-icon--categories">
            <el-icon><CollectionTag /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ displayedStats.totalCategories }}</div>
            <div class="stat-label">分類數</div>
          </div>
        </div>
      </el-col>

      <el-col :xs="12" :sm="12" :lg="6">
        <div class="stat-card" :class="{ loaded: !loading }">
          <div class="stat-icon stat-icon--messages">
            <el-icon><ChatDotRound /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ displayedStats.unreadMessages }}</div>
            <div class="stat-label">未讀訊息</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 快速操作 -->
    <div class="quick-actions-section">
      <h2 class="section-title">快速操作</h2>
      <div class="quick-actions-grid">
        <button
          class="action-tile action-tile--primary"
          @click="$router.push('/admin/projects/create')"
        >
          <el-icon class="tile-icon"><Plus /></el-icon>
          <span class="tile-label">新增專案</span>
        </button>
        <button class="action-tile" @click="$router.push('/admin/projects')">
          <el-icon class="tile-icon"><FolderOpened /></el-icon>
          <span class="tile-label">管理專案</span>
        </button>
        <button class="action-tile" @click="$router.push('/admin/profile')">
          <el-icon class="tile-icon"><User /></el-icon>
          <span class="tile-label">個人資料</span>
        </button>
        <button class="action-tile" @click="$router.push('/admin/messages')">
          <el-icon class="tile-icon"><ChatDotRound /></el-icon>
          <span class="tile-label">訊息管理</span>
        </button>
      </div>
    </div>

    <!-- 最近專案 -->
    <div class="recent-section">
      <div class="section-header">
        <h2 class="section-title">最近專案</h2>
        <el-button text type="primary" @click="$router.push('/admin/projects')">
          查看全部 →
        </el-button>
      </div>
      <el-card shadow="never" v-loading="loading" class="recent-card">
        <el-table :data="recentProjects" style="width: 100%" :show-header="true">
          <el-table-column prop="title" label="標題" min-width="180" />
          <el-table-column prop="category" label="分類" width="110" />
          <el-table-column label="狀態" width="90">
            <template #default="{ row }">
              <el-tag :type="row.is_published ? 'success' : 'info'" size="small">
                {{ row.is_published ? '已發布' : '草稿' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="created_at" label="創建時間" width="150">
            <template #default="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="80">
            <template #default="{ row }">
              <el-button
                text
                type="primary"
                size="small"
                @click="$router.push(`/admin/projects/${row.id}/edit`)"
              >
                編輯
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="!loading && recentProjects.length === 0" class="empty-state">
          <el-icon class="empty-icon"><FolderOpened /></el-icon>
          <p>還沒有專案，立即新增第一個！</p>
          <el-button type="primary" @click="$router.push('/admin/projects/create')">
            新增專案
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, reactive, onMounted } from 'vue'
import {
  FolderOpened,
  SuccessFilled,
  Edit,
  CollectionTag,
  Plus,
  User,
  ChatDotRound
} from '@element-plus/icons-vue'
import client from '@/api/client'
import { useAuthStore } from '@/stores/admin/auth'

interface RecentProject {
  id: number
  title: string
  category: string | null
  is_published: boolean
  created_at: string
}

const authStore = useAuthStore()

const loading = ref(false)
const stats = reactive({
  totalProjects: 0,
  publishedProjects: 0,
  draftProjects: 0,
  totalCategories: 0,
  unreadMessages: 0
})

// count-up 動畫顯示值
const displayedStats = reactive({
  totalProjects: 0,
  publishedProjects: 0,
  draftProjects: 0,
  totalCategories: 0,
  unreadMessages: 0
})

const recentProjects = ref<RecentProject[]>([])

// count-up 動畫
const animateCount = (key: keyof typeof displayedStats, target: number, duration = 800) => {
  const start = displayedStats[key]
  const startTime = performance.now()

  const step = (currentTime: number) => {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)
    // easeOutQuart
    const eased = 1 - Math.pow(1 - progress, 4)
    displayedStats[key] = Math.round(start + (target - start) * eased)

    if (progress < 1) {
      requestAnimationFrame(step)
    } else {
      displayedStats[key] = target
    }
  }

  requestAnimationFrame(step)
}

onMounted(async () => {
  await loadDashboardData()
})

const loadDashboardData = async () => {
  try {
    loading.value = true
    const { data } = await client.get('/admin/dashboard/stats')

    recentProjects.value = data.recentProjects || []

    stats.totalProjects = data.totalProjects || 0
    stats.publishedProjects = data.publishedProjects || 0
    stats.draftProjects = data.unpublishedProjects || 0
    stats.totalCategories = data.totalCategories || 0
    stats.unreadMessages = data.unreadMessages || 0

    // 觸發 count-up 動畫
    animateCount('totalProjects', stats.totalProjects)
    animateCount('publishedProjects', stats.publishedProjects, 900)
    animateCount('draftProjects', stats.draftProjects, 700)
    animateCount('totalCategories', stats.totalCategories, 600)
    animateCount('unreadMessages', stats.unreadMessages, 750)
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('Failed to load dashboard data:', err)
    }
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.dashboard {
  padding: var(--space-lg);
  max-width: 1200px;
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: clamp(1.5rem, 3vw, 2rem);
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: var(--font-size-sm);
}

/* 統計卡片 */
.stats-row {
  margin-bottom: var(--space-xl);
}

.stat-card {
  background: var(--surface, #1a1614);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    opacity 0.4s ease;
  opacity: 0;
  transform: translateY(8px);
  min-height: 88px; /* 防 CLS */
}

.stat-card.loaded {
  opacity: 1;
  transform: translateY(0);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  border-color: var(--volt);
}

.stat-icon {
  width: 52px;
  height: 52px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--ink);
  flex-shrink: 0;
}

.stat-icon--projects {
  background: var(--volt);
}
.stat-icon--published {
  background: #a8c686;
}
.stat-icon--draft {
  background: var(--plasma);
}
.stat-icon--categories {
  background: #b87d56;
}
.stat-icon--messages {
  background: #c97070;
}

.stat-info {
  flex: 1;
  min-width: 0;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1;
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums; /* 數字等寬，防抖動 */
  min-width: 2ch;
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  white-space: nowrap;
}

/* 快速操作 */
.quick-actions-section {
  margin-bottom: var(--space-xl);
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-light);
  margin: 0 0 var(--space-md) 0;
  font-family: var(--font-mono);
  letter-spacing: 1px;
  text-transform: uppercase;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-md);
}

.quick-actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-tile {
  background: var(--surface, #1a1614);
  border: 1px solid var(--border-light);
  border-radius: 8px;
  padding: 20px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.5px;
  min-height: 88px;
}

.action-tile:hover {
  background: var(--primary-light);
  border-color: var(--volt);
  color: var(--volt);
  transform: translateY(-2px);
}

.action-tile--primary {
  border-color: var(--volt);
  color: var(--volt);
}

.action-tile--primary:hover {
  background: var(--primary-light);
  border-color: var(--volt);
}

.tile-icon {
  font-size: 22px;
}

.tile-label {
  font-weight: 500;
}

/* 最近專案 */
.recent-section {
}

.recent-card {
  min-height: 200px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  gap: 12px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 40px;
  opacity: 0.3;
}

/* RWD */
@media (max-width: 768px) {
  .quick-actions-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
