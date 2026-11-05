<template>
  <div class="messages-view">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">訊息管理</h1>
        <div class="stats-badges" v-if="stats">
          <el-badge :value="stats.unread" :hidden="stats.unread === 0" type="danger">
            <el-tag type="info">未讀</el-tag>
          </el-badge>
          <el-tag>今日: {{ stats.today }}</el-tag>
          <el-tag>本週: {{ stats.this_week }}</el-tag>
        </div>
      </div>
    </div>

    <!-- 篩選工具列 -->
    <el-card shadow="never" class="filter-card">
      <div class="filter-bar">
        <el-input
          v-model="searchQuery"
          placeholder="搜尋名稱、Email、主旨..."
          clearable
          style="width: 300px"
          @input="debouncedSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-radio-group v-model="filterStatus" @change="loadMessages">
          <el-radio-button value="all">全部</el-radio-button>
          <el-radio-button value="unread">未讀</el-radio-button>
          <el-radio-button value="read">已讀</el-radio-button>
        </el-radio-group>
      </div>
    </el-card>

    <!-- 訊息列表 -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="messages"
        v-loading="loading"
        style="width: 100%"
        @row-click="showMessage"
        row-class-name="clickable-row"
      >
        <el-table-column width="60">
          <template #default="{ row }">
            <el-badge is-dot :hidden="row.is_read" type="danger">
              <el-icon :class="{ 'text-muted': row.is_read }">
                <Message />
              </el-icon>
            </el-badge>
          </template>
        </el-table-column>

        <el-table-column prop="name" label="姓名" width="150" />

        <el-table-column prop="email" label="Email" width="220">
          <template #default="{ row }">
            <a :href="`mailto:${row.email}`" @click.stop class="email-link">
              {{ row.email }}
            </a>
          </template>
        </el-table-column>

        <el-table-column prop="subject" label="主旨" min-width="200">
          <template #default="{ row }">
            <span :class="{ 'font-bold': !row.is_read }">
              {{ row.subject || '(無主旨)' }}
            </span>
          </template>
        </el-table-column>

        <el-table-column prop="message" label="內容預覽" min-width="250">
          <template #default="{ row }">
            <span class="message-preview">{{ truncateText(row.message, 50) }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="created_at" label="時間" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <div class="action-cell">
              <el-button
                v-show="!row.is_read"
                type="primary"
                size="small"
                text
                @click.stop="markRead(row)"
              >
                標為已讀
              </el-button>
              <el-button
                v-show="row.is_read"
                type="info"
                size="small"
                text
                @click.stop="markUnread(row)"
              >
                標為未讀
              </el-button>
              <el-button type="danger" size="small" text @click.stop="deleteMessage(row)">
                刪除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分頁 -->
      <div class="pagination-wrapper" v-if="pagination.total > 0">
        <el-pagination
          v-model:current-page="pagination.current_page"
          v-model:page-size="pagination.per_page"
          :total="pagination.total"
          :page-sizes="[10, 15, 30, 50]"
          layout="total, sizes, prev, pager, next"
          @size-change="handleSizeChange"
          @current-change="loadMessages"
        />
      </div>
    </el-card>

    <!-- 訊息詳情對話框 -->
    <el-dialog v-model="dialogVisible" :title="currentMessage?.subject || '訊息詳情'" width="600px">
      <div v-if="currentMessage" class="message-detail">
        <div class="detail-row">
          <span class="label">寄件人：</span>
          <span class="value">{{ currentMessage.name }}</span>
        </div>
        <div class="detail-row">
          <span class="label">Email：</span>
          <a :href="`mailto:${currentMessage.email}`" class="email-link">
            {{ currentMessage.email }}
          </a>
        </div>
        <div class="detail-row">
          <span class="label">時間：</span>
          <span class="value">{{ formatDate(currentMessage.created_at) }}</span>
        </div>
        <div class="detail-row" v-if="currentMessage.subject">
          <span class="label">主旨：</span>
          <span class="value">{{ currentMessage.subject }}</span>
        </div>
        <div class="detail-content">
          <span class="label">內容：</span>
          <div class="message-body">{{ currentMessage.message }}</div>
        </div>
      </div>
      <template #footer>
        <el-button @click="dialogVisible = false">關閉</el-button>
        <el-button type="primary" @click="replyEmail">
          <el-icon><Position /></el-icon>
          回覆 Email
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Message, Position } from '@element-plus/icons-vue'
import client from '@/api/client'

interface MessageItem {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  created_at: string
}

interface Stats {
  total: number
  unread: number
  read: number
  today: number
  this_week: number
  this_month: number
}

const loading = ref(false)
const messages = ref<MessageItem[]>([])
const stats = ref<Stats | null>(null)
const searchQuery = ref('')
const filterStatus = ref('all')
const dialogVisible = ref(false)
const currentMessage = ref<MessageItem | null>(null)

const pagination = reactive({
  current_page: 1,
  per_page: 15,
  total: 0
})

// 防抖搜尋
let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    pagination.current_page = 1
    loadMessages()
  }, 300)
}

onMounted(async () => {
  await Promise.all([loadMessages(), loadStats()])
})

const loadMessages = async () => {
  try {
    loading.value = true
    const params: Record<string, unknown> = {
      page: pagination.current_page,
      per_page: pagination.per_page
    }

    if (searchQuery.value) {
      params.search = searchQuery.value
    }

    if (filterStatus.value === 'unread') {
      params.unread = true
    } else if (filterStatus.value === 'read') {
      params.read = true
    }

    const response = await client.get('/admin/contact-messages', { params })
    messages.value = response.data.data
    pagination.total = response.data.total
    pagination.current_page = response.data.current_page
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('載入訊息失敗:', err)
    }
    ElMessage.error('載入訊息失敗')
  } finally {
    loading.value = false
  }
}

// 切換每頁筆數時把頁碼重設回第 1 頁，避免停在超出總頁數的頁碼導致列表空白
const handleSizeChange = () => {
  pagination.current_page = 1
  loadMessages()
}

const loadStats = async () => {
  try {
    const response = await client.get('/admin/contact-messages/stats')
    stats.value = response.data
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('載入統計失敗:', err)
    }
  }
}

const showMessage = async (row: MessageItem) => {
  currentMessage.value = row
  dialogVisible.value = true

  // 自動標為已讀
  if (!row.is_read) {
    await markRead(row, false)
  }
}

const markRead = async (row: MessageItem, showToast = true) => {
  try {
    await client.patch(`/admin/contact-messages/${row.id}/read`)
    row.is_read = true
    if (stats.value) {
      stats.value.unread = Math.max(0, stats.value.unread - 1)
      stats.value.read++
    }
    if (showToast) {
      ElMessage.success('已標為已讀')
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('標記失敗:', err)
    }
    ElMessage.error('操作失敗')
  }
}

const markUnread = async (row: MessageItem) => {
  try {
    await client.patch(`/admin/contact-messages/${row.id}/unread`)
    row.is_read = false
    if (stats.value) {
      stats.value.unread++
      stats.value.read = Math.max(0, stats.value.read - 1)
    }
    ElMessage.success('已標為未讀')
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('標記失敗:', err)
    }
    ElMessage.error('操作失敗')
  }
}

const deleteMessage = async (row: MessageItem) => {
  try {
    await ElMessageBox.confirm('確定要刪除這則訊息嗎？', '確認刪除', {
      type: 'warning'
    })

    await client.delete(`/admin/contact-messages/${row.id}`)
    ElMessage.success('訊息已刪除')
    await Promise.all([loadMessages(), loadStats()])
  } catch (err) {
    if (err !== 'cancel') {
      if (import.meta.env.DEV) {
        log.error('刪除失敗:', err)
      }
      ElMessage.error('刪除失敗')
    }
  }
}

const replyEmail = () => {
  if (currentMessage.value) {
    const subject = currentMessage.value.subject ? `Re: ${currentMessage.value.subject}` : ''
    window.open(`mailto:${currentMessage.value.email}?subject=${encodeURIComponent(subject)}`)
  }
}

const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.messages-view {
  padding: var(--space-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.header-left {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.stats-badges {
  display: flex;
  gap: var(--space-sm);
}

.filter-card {
  margin-bottom: var(--space-md);
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-card {
  margin-bottom: var(--space-lg);
}

.clickable-row {
  cursor: pointer;
}

/* 操作欄固定高度，v-show 切換不跳動 */
.action-cell {
  display: flex;
  align-items: center;
  min-height: 32px;
  gap: 0;
}

.clickable-row:hover {
  background-color: rgba(225, 193, 110, 0.05);
}

.text-muted {
  color: var(--text-muted);
}

.font-bold {
  font-weight: 600;
}

.email-link {
  color: var(--volt);
  text-decoration: none;
}

.email-link:hover {
  text-decoration: underline;
}

.message-preview {
  color: var(--text-muted);
  font-size: 0.9em;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--space-md);
}

/* 訊息詳情 */
.message-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.detail-row {
  display: flex;
  gap: var(--space-sm);
}

.detail-row .label {
  color: var(--text-muted);
  min-width: 80px;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.detail-content .label {
  color: var(--text-muted);
}

.message-body {
  background: rgba(0, 0, 0, 0.2);
  padding: var(--space-md);
  border-radius: 4px;
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
