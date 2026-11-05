<template>
  <div class="experiences-view">
    <div class="page-header">
      <h1 class="page-title">經歷管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleCreate">新增經歷</el-button>
    </div>

    <!-- 經歷表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="experiences" style="width: 100%">
        <el-table-column prop="company" label="公司名稱" min-width="150" />
        <el-table-column prop="position" label="職位" min-width="150" />
        <el-table-column label="任職期間" min-width="200">
          <template #default="{ row }">
            {{ formatDatePeriod(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地點" width="120" />
        <el-table-column prop="is_current" label="目前任職" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.is_current ? 'success' : 'info'" size="small">
              {{ row.is_current ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="is_visible" label="顯示狀態" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.is_visible"
              :active-value="true"
              :inactive-value="false"
              @change="handleToggleVisible(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button text type="primary" size="small" @click="handleEdit(row)">編輯</el-button>
            <el-button text type="danger" size="small" @click="handleDelete(row.id)">
              刪除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/編輯對話框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '編輯經歷' : '新增經歷'"
      width="600px"
      class="responsive-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="公司名稱" prop="company" required>
          <el-input
            v-model="formData.company"
            placeholder="請輸入公司名稱"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="職位" prop="position" required>
          <el-input
            v-model="formData.position"
            placeholder="請輸入職位名稱"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="開始日期" prop="start_date" required>
          <el-date-picker
            v-model="formData.start_date"
            type="date"
            placeholder="選擇開始日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>

        <el-form-item label="結束日期" prop="end_date">
          <el-date-picker
            v-model="formData.end_date"
            type="date"
            placeholder="選擇結束日期（目前任職可不填）"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled="formData.is_current"
          />
        </el-form-item>

        <el-form-item label="目前任職" prop="is_current">
          <el-switch v-model="formData.is_current" @change="handleCurrentChange" />
        </el-form-item>

        <el-form-item label="地點" prop="location">
          <el-input v-model="formData.location" placeholder="例如: 台北, 台灣" maxlength="50" />
        </el-form-item>

        <el-form-item label="工作描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="請輸入工作內容描述"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="成就項目" prop="achievements">
          <el-select
            v-model="formData.achievements"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="輸入成就並按 Enter 新增"
            style="width: 100%"
          />
          <span class="form-tip">輸入內容後按 Enter 即可新增為標籤項目</span>
        </el-form-item>

        <el-form-item label="使用技術" prop="technologies">
          <el-select
            v-model="formData.technologies"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="例如: Vue 3, Laravel (按 Enter 新增)"
            style="width: 100%"
          />
          <span class="form-tip">輸入技術名稱後按 Enter 即可新增為標籤項目</span>
        </el-form-item>

        <el-form-item label="顯示在前台" prop="is_visible">
          <el-switch v-model="formData.is_visible" />
        </el-form-item>

        <el-form-item label="排序" prop="sort_order">
          <el-input-number v-model="formData.sort_order" :min="0" :max="999" />
          <span class="form-tip">數字越小排序越前面</span>
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitting">
          {{ isEdit ? '更新' : '創建' }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import client from '@/api/client'
import type { Experience } from '@/types/models'
import { getDatePeriod } from '@/utils/date'

// 狀態
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const experiences = ref<Experience[]>([])
const formRef = ref<FormInstance>()

// 表單數據
const formData = reactive({
  id: null as number | null,
  company: '',
  position: '',
  location: '',
  start_date: '',
  end_date: null as string | null,
  is_current: false,
  description: '',
  achievements: [] as string[],
  technologies: [] as string[],
  is_visible: true,
  sort_order: 0
})

// 驗證規則
const rules = reactive<FormRules>({
  company: [
    { required: true, message: '請輸入公司名稱', trigger: 'blur' },
    { min: 2, max: 100, message: '長度在 2 到 100 個字符', trigger: 'blur' }
  ],
  position: [
    { required: true, message: '請輸入職位名稱', trigger: 'blur' },
    { min: 2, max: 100, message: '長度在 2 到 100 個字符', trigger: 'blur' }
  ],
  start_date: [{ required: true, message: '請選擇開始日期', trigger: 'change' }]
})

// 格式化日期顯示（後台採「年.月」格式）
const formatDatePeriod = (row: Experience) =>
  getDatePeriod(row.start_date, row.end_date, row.is_current, 'dot')

// 載入數據
onMounted(async () => {
  await loadExperiences()
})

const loadExperiences = async () => {
  try {
    loading.value = true
    const response = await client.get('/admin/experiences')
    experiences.value = response.data
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('載入經歷失敗:', err)
    }
  } finally {
    loading.value = false
  }
}

// 處理函數
const handleCreate = () => {
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

const handleEdit = (experience: Experience) => {
  isEdit.value = true
  formData.id = experience.id
  formData.company = experience.company
  formData.position = experience.position
  formData.location = experience.location || ''
  formData.start_date = experience.start_date
  formData.end_date = experience.end_date
  formData.is_current = experience.is_current
  formData.description = experience.description || ''
  formData.is_visible = experience.is_visible
  formData.sort_order = experience.sort_order || 0
  formData.achievements = experience.achievements ? [...experience.achievements] : []
  formData.technologies = experience.technologies ? [...experience.technologies] : []

  dialogVisible.value = true
}

const handleCurrentChange = () => {
  if (formData.is_current) {
    formData.end_date = null
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    if (isEdit.value && formData.id) {
      await client.put(`/admin/experiences/${formData.id}`, formData)
      ElMessage.success('經歷已更新')
    } else {
      await client.post('/admin/experiences', formData)
      ElMessage.success('經歷已創建')
    }

    dialogVisible.value = false
    await loadExperiences()
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      if (import.meta.env.DEV) {
        console.log('表單驗證失敗:', error)
      }
    } else {
      if (import.meta.env.DEV) {
        log.error('提交失敗:', error)
      }
      ElMessage.error('操作失敗，請稍後再試')
    }
  } finally {
    submitting.value = false
  }
}

const handleToggleVisible = async (experience: Experience) => {
  try {
    await client.patch(`/admin/experiences/${experience.id}`, { is_visible: experience.is_visible })
    ElMessage.success('顯示狀態已更新')
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('更新失敗:', err)
    }
    // 恢復原狀態
    experience.is_visible = !experience.is_visible
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('確定要刪除這個經歷嗎？此操作無法復原。', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await client.delete(`/admin/experiences/${id}`)
    ElMessage.success('經歷已刪除')
    await loadExperiences()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

const resetForm = () => {
  formData.id = null
  formData.company = ''
  formData.position = ''
  formData.location = ''
  formData.start_date = ''
  formData.end_date = null
  formData.is_current = false
  formData.description = ''
  formData.achievements = []
  formData.technologies = []
  formData.is_visible = true
  formData.sort_order = 0
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.experiences-view {
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

.form-tip {
  font-size: var(--font-size-sm);
  color: var(--el-text-color-secondary);
  margin-left: 8px;
}

@media (max-width: 768px) {
  .responsive-dialog :deep(.el-dialog) {
    width: 95% !important;
  }
}
</style>
