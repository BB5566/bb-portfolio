<template>
  <div class="education-view">
    <div class="page-header">
      <h1 class="page-title">學歷管理</h1>
      <el-button type="primary" :icon="Plus" @click="handleCreate">新增學歷</el-button>
    </div>

    <!-- 學歷表格 -->
    <el-card shadow="never">
      <el-table v-loading="loading" :data="educations" style="width: 100%">
        <el-table-column prop="school" label="學校名稱" min-width="150" />
        <el-table-column prop="degree" label="學位" min-width="120" />
        <el-table-column prop="field_of_study" label="主修科系" min-width="150" />
        <el-table-column label="就讀期間" min-width="200">
          <template #default="{ row }">
            {{ formatDatePeriod(row) }}
          </template>
        </el-table-column>
        <el-table-column prop="location" label="地點" width="120" />
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
      :title="isEdit ? '編輯學歷' : '新增學歷'"
      width="600px"
      class="responsive-dialog"
    >
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="120px">
        <el-form-item label="學校名稱" prop="school" required>
          <el-input
            v-model="formData.school"
            placeholder="請輸入學校名稱"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="學位" prop="degree" required>
          <el-input v-model="formData.degree" placeholder="例如: 學士、碩士、博士" maxlength="50" />
        </el-form-item>

        <el-form-item label="主修科系" prop="field_of_study" required>
          <el-input
            v-model="formData.field_of_study"
            placeholder="例如: 資訊工程系"
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
            placeholder="選擇結束日期（就讀中可不填）"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled="formData.is_current"
          />
        </el-form-item>

        <el-form-item label="就讀中" prop="is_current">
          <el-switch v-model="formData.is_current" @change="handleCurrentChange" />
        </el-form-item>

        <el-form-item label="地點" prop="location">
          <el-input v-model="formData.location" placeholder="例如: 台北, 台灣" maxlength="50" />
        </el-form-item>

        <el-form-item label="GPA" prop="gpa">
          <el-input-number
            v-model="formData.gpa"
            :min="0"
            :max="4"
            :precision="2"
            :step="0.01"
            placeholder="例如: 3.80"
          />
          <span class="form-tip">滿分 4.0</span>
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="可輸入相關課程、活動、獎項等"
            maxlength="1000"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="活動 (JSON)" prop="activities">
          <el-input
            v-model="activitiesJson"
            type="textarea"
            :rows="4"
            placeholder='例如: ["社團活動1", "競賽2", "專案3"]'
          />
          <span class="form-tip">JSON 陣列格式</span>
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
import type { Education } from '@/types/models'
import { getDatePeriod } from '@/utils/date'

// 狀態
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const educations = ref<Education[]>([])
const formRef = ref<FormInstance>()
const activitiesJson = ref('[]')

// 表單數據
const formData = reactive({
  id: null as number | null,
  school: '',
  degree: '',
  field_of_study: '',
  location: '',
  start_date: '',
  end_date: null as string | null,
  is_current: false,
  gpa: null as number | null,
  description: '',
  activities: [] as string[],
  is_visible: true,
  sort_order: 0
})

// 驗證規則
const rules = reactive<FormRules>({
  school: [
    { required: true, message: '請輸入學校名稱', trigger: 'blur' },
    { min: 2, max: 100, message: '長度在 2 到 100 個字符', trigger: 'blur' }
  ],
  degree: [{ required: true, message: '請輸入學位', trigger: 'blur' }],
  field_of_study: [{ required: true, message: '請輸入主修科系', trigger: 'blur' }],
  start_date: [{ required: true, message: '請選擇開始日期', trigger: 'change' }]
})

// 格式化日期顯示（後台採「年.月」格式）
const formatDatePeriod = (row: Education) =>
  getDatePeriod(row.start_date, row.end_date, row.is_current, 'dot')

// 載入數據
onMounted(async () => {
  await loadEducations()
})

const loadEducations = async () => {
  try {
    loading.value = true
    const response = await client.get('/admin/education')
    educations.value = response.data
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('載入學歷失敗:', err)
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

const handleEdit = (education: Education) => {
  isEdit.value = true
  formData.id = education.id
  formData.school = education.school
  formData.degree = education.degree
  formData.field_of_study = education.field_of_study
  formData.location = education.location || ''
  formData.start_date = education.start_date
  formData.end_date = education.end_date
  formData.is_current = education.is_current
  formData.gpa = education.gpa
  formData.description = education.description || ''
  formData.is_visible = education.is_visible
  formData.sort_order = education.sort_order || 0

  // 解析 JSON
  activitiesJson.value = JSON.stringify(education.activities || [], null, 2)

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

    // 解析 JSON
    try {
      formData.activities = JSON.parse(activitiesJson.value)
    } catch {
      ElMessage.error('活動 JSON 格式錯誤')
      submitting.value = false
      return
    }

    if (isEdit.value && formData.id) {
      await client.put(`/admin/education/${formData.id}`, formData)
      ElMessage.success('學歷已更新')
    } else {
      await client.post('/admin/education', formData)
      ElMessage.success('學歷已創建')
    }

    dialogVisible.value = false
    await loadEducations()
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

const handleToggleVisible = async (education: Education) => {
  try {
    await client.patch(`/admin/education/${education.id}`, { is_visible: education.is_visible })
    ElMessage.success('顯示狀態已更新')
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('更新失敗:', err)
    }
    // 恢復原狀態
    education.is_visible = !education.is_visible
  }
}

const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('確定要刪除這個學歷嗎？此操作無法復原。', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await client.delete(`/admin/education/${id}`)
    ElMessage.success('學歷已刪除')
    await loadEducations()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('刪除失敗')
    }
  }
}

const resetForm = () => {
  formData.id = null
  formData.school = ''
  formData.degree = ''
  formData.field_of_study = ''
  formData.location = ''
  formData.start_date = ''
  formData.end_date = null
  formData.is_current = false
  formData.gpa = null
  formData.description = ''
  formData.activities = []
  formData.is_visible = true
  formData.sort_order = 0
  activitiesJson.value = '[]'
  formRef.value?.clearValidate()
}
</script>

<style scoped>
.education-view {
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
