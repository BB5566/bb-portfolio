<template>
  <div class="projects-view">
    <div class="page-header">
      <h1 class="page-title">專案管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleCreate">新增專案</el-button>
    </div>

    <!-- 搜尋與篩選 -->
    <el-card class="filter-card" shadow="never">
      <el-form :inline="true" :model="filterForm">
        <el-form-item label="搜尋">
          <el-input
            v-model="filterForm.keyword"
            placeholder="專案標題或描述"
            clearable
            @clear="handleFilter"
            @keyup.enter="handleFilter"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="分類">
          <el-select
            v-model="filterForm.category"
            placeholder="選擇分類"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="cat in categories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.name"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="狀態">
          <el-select
            v-model="filterForm.status"
            placeholder="選擇狀態"
            clearable
            @change="handleFilter"
          >
            <el-option label="全部" value="" />
            <el-option label="已發布" value="published" />
            <el-option label="草稿" value="draft" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleFilter">搜尋</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 專案表格 -->
    <el-card shadow="never">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="filteredProjects"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="封面" width="120">
          <template #default="{ row }">
            <el-image
              v-if="getCoverImage(row)"
              :src="getCoverImage(row) || ''"
              :preview-src-list="getCoverImage(row) ? [getCoverImage(row) as string] : []"
              fit="cover"
              style="width: 80px; height: 60px; border-radius: 4px"
            />
            <span v-else class="no-image">無圖片</span>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="標題" min-width="200" />
        <el-table-column prop="category.name" label="分類" width="120" />
        <el-table-column label="狀態" width="100">
          <template #default="{ row }">
            <el-tag :type="row.is_published ? 'success' : 'info'" size="small">
              {{ row.is_published ? '已發布' : '草稿' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" width="100" align="center">
          <template #default="{ $index }">
            <el-button-group size="small">
              <el-button
                text
                :disabled="$index === 0 || isFiltered"
                aria-label="上移"
                @click="handleMoveUp($index)"
              >
                ↑
              </el-button>
              <el-button
                text
                :disabled="$index === filteredProjects.length - 1 || isFiltered"
                aria-label="下移"
                @click="handleMoveDown($index)"
              >
                ↓
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="創建時間" width="180">
          <template #default="{ row }">
            {{ formatDate(row.created_at) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="info" size="small" @click="handlePreview(row.id)">預覽</el-button>
            <el-button text type="primary" size="small" @click="handleEdit(row.id)">編輯</el-button>
            <el-button
              text
              :type="row.is_published ? 'warning' : 'success'"
              size="small"
              @click="handleToggleStatus(row)"
            >
              {{ row.is_published ? '取消發布' : '發布' }}
            </el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row.id)">
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 批次操作 -->
      <div v-if="selectedProjects.length > 0" class="batch-actions">
        <span>已選擇 {{ selectedProjects.length }} 項</span>
        <el-button size="small" @click="handleBatchPublish">批次發布</el-button>
        <el-button size="small" @click="handleBatchUnpublish">批次取消發布</el-button>
        <el-button type="danger" size="small" @click="handleBatchDelete">批次刪除</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import client from '@/api/client'
import { useProjectsStore } from '@/stores/admin/projects'
import { categoriesAPI, type Category } from '@/api/categories'
import { getProjectCoverImage } from '@/utils/image'
import type { Project } from '@/api/projects'

const router = useRouter()
const projectsStore = useProjectsStore()

// 狀態
const loading = ref(false)
const categories = ref<Category[]>([])
const selectedProjects = ref<Project[]>([])
const tableRef = ref()

// 篩選表單
const filterForm = ref({
  keyword: '',
  category: '',
  status: ''
})

// 使用 store 中的專案數據
const projects = computed(() => projectsStore.projects)

// 載入數據
onMounted(async () => {
  await loadProjects()
  await loadCategories()
})

const loadProjects = async () => {
  try {
    loading.value = true
    await projectsStore.fetchProjects({ per_page: 100 })
  } catch {
    ElMessage.error('載入專案列表失敗')
  } finally {
    loading.value = false
  }
}

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.list()
    categories.value = response.data
  } catch {
    ElMessage.error('載入分類失敗')
  }
}

// 篩選後的專案
const filteredProjects = computed(() => {
  let result = projects.value

  // 關鍵字搜尋
  if (filterForm.value.keyword) {
    const keyword = filterForm.value.keyword.toLowerCase()
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword)
    )
  }

  // 分類篩選
  if (filterForm.value.category) {
    result = result.filter((p) => p.category?.name === filterForm.value.category)
  }

  // 狀態篩選
  if (filterForm.value.status === 'published') {
    result = result.filter((p) => p.is_published)
  } else if (filterForm.value.status === 'draft') {
    result = result.filter((p) => !p.is_published)
  }

  return result
})

// 是否套用了任何篩選條件（篩選狀態下不允許用相鄰交換排序，避免破壞未顯示專案的順序）
const isFiltered = computed(
  () => !!(filterForm.value.keyword || filterForm.value.category || filterForm.value.status)
)

// 處理函數
const handleCreate = () => {
  router.push('/admin/projects/create')
}

const handlePreview = (id: number) => {
  window.open(`/projects/${id}`, '_blank')
}

const handleEdit = (id: number) => {
  router.push(`/admin/projects/${id}/edit`)
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('確定要刪除這個專案嗎？此操作無法復原。', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await projectsStore.deleteProject(id)
    ElMessage.success('專案已刪除')
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('刪除專案失敗')
    }
  }
}

const handleToggleStatus = async (project: Project) => {
  try {
    const formData = new FormData()
    // 正確轉換布林值為 '1' 或 '0'
    formData.append('is_published', project.is_published ? '0' : '1')

    await projectsStore.updateProject(project.id, formData)
    ElMessage.success(`已${project.is_published ? '取消發布' : '發布'}專案`)
  } catch {
    ElMessage.error('更新狀態失敗')
  }
}

const handleFilter = () => {
  // 篩選邏輯已在 computed 中處理
}

const handleMoveUp = async (index: number) => {
  if (isFiltered.value) {
    ElMessage.warning('請先清除篩選條件再調整排序')
    return
  }
  const reordered = [...projects.value]
  if (index <= 0) return
  ;[reordered[index - 1], reordered[index]] = [reordered[index]!, reordered[index - 1]!]
  await saveSortOrder(reordered)
}

const handleMoveDown = async (index: number) => {
  if (isFiltered.value) {
    ElMessage.warning('請先清除篩選條件再調整排序')
    return
  }
  const reordered = [...projects.value]
  if (index >= reordered.length - 1) return
  ;[reordered[index], reordered[index + 1]] = [reordered[index + 1]!, reordered[index]!]
  await saveSortOrder(reordered)
}

const saveSortOrder = async (projectList: Project[]) => {
  try {
    const ids = projectList.map((p) => p.id)
    await client.post('/admin/projects/batch-sort', { ids })
    await loadProjects()
    ElMessage.success('排序已更新')
  } catch {
    ElMessage.error('排序更新失敗')
  }
}

const handleReset = () => {
  filterForm.value = {
    keyword: '',
    category: '',
    status: ''
  }
}

const handleSelectionChange = (selection: Project[]) => {
  selectedProjects.value = selection
}

// 批次操作完成後清空選取，避免「已選擇 N 項」殘留舊資料、對已刪除項目再次送出
const clearSelection = () => {
  selectedProjects.value = []
  tableRef.value?.clearSelection()
}

const handleBatchPublish = async () => {
  try {
    const ids = selectedProjects.value.map((p) => p.id)
    await projectsStore.batchUpdateStatus(ids, true)
    ElMessage.success(`已發布 ${selectedProjects.value.length} 個專案`)
    clearSelection()
  } catch {
    ElMessage.error('批次發布失敗')
  }
}

const handleBatchUnpublish = async () => {
  try {
    const ids = selectedProjects.value.map((p) => p.id)
    await projectsStore.batchUpdateStatus(ids, false)
    ElMessage.success(`已取消發布 ${selectedProjects.value.length} 個專案`)
    clearSelection()
  } catch {
    ElMessage.error('批次取消發布失敗')
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(
      `確定要刪除選中的 ${selectedProjects.value.length} 個專案嗎？此操作無法復原。`,
      '確認批次刪除',
      {
        confirmButtonText: '確定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const ids = selectedProjects.value.map((p) => p.id)
    await projectsStore.batchDelete(ids)
    ElMessage.success(`已刪除 ${selectedProjects.value.length} 個專案`)
    clearSelection()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('批次刪除失敗')
    }
  }
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 獲取封面圖片（圖庫第一張）
const getCoverImage = (project: Project): string | undefined => {
  const imageUrl = getProjectCoverImage(project)
  return imageUrl || undefined
}
</script>

<style scoped>
.projects-view {
  padding: var(--space-lg);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.filter-card {
  margin-bottom: var(--space-lg);
}

.no-image {
  display: block;
  width: 80px;
  height: 60px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.batch-actions {
  margin-top: var(--space-md);
  padding: var(--space-md);
  background: var(--el-fill-color-light);
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.batch-actions span {
  font-weight: 500;
}

@media (max-width: 768px) {
  .filter-card :deep(.el-form--inline .el-form-item) {
    display: flex;
    margin-right: 0;
    margin-bottom: 12px;
  }
  .filter-card :deep(.el-form--inline .el-form-item .el-form-item__content) {
    flex: 1;
  }
}
</style>
