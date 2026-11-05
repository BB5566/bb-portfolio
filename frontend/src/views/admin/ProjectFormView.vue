<template>
  <div class="admin-page-view">
    <div class="admin-page-header">
      <h1 class="admin-page-title">{{ isEdit ? '編輯專案' : '新增專案' }}</h1>
      <el-button @click="handleBack">返回列表</el-button>
    </div>

    <el-card v-loading="loading">
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="120px"
        label-position="left"
      >
        <!-- 基本資訊 -->
        <el-divider content-position="left">基本資訊</el-divider>

        <el-form-item label="專案標題" prop="title" required>
          <el-input
            v-model="formData.title"
            placeholder="請輸入專案標題"
            maxlength="255"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分類" prop="category_id" required>
          <el-select v-model="formData.category_id" placeholder="請選擇分類">
            <el-option v-for="cat in categories" :key="cat.id" :label="cat.name" :value="cat.id" />
          </el-select>
        </el-form-item>

        <el-form-item label="技術標籤" prop="tag_ids">
          <el-select
            v-model="formData.tag_ids"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="選擇或輸入技術標籤"
            style="width: 100%"
          >
            <el-option-group
              v-for="group in tagGroups"
              :key="group.category"
              :label="group.category"
            >
              <el-option
                v-for="tag in group.tags"
                :key="tag.id"
                :label="tag.name"
                :value="tag.id"
              />
            </el-option-group>
          </el-select>
          <span class="form-item-tip">選擇此專案使用的技術標籤</span>
        </el-form-item>

        <el-form-item label="專案描述" prop="description" required>
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="6"
            placeholder="請輸入專案描述"
            maxlength="2000"
            show-word-limit
          />
        </el-form-item>

        <!-- 連結 -->
        <el-divider content-position="left">連結</el-divider>

        <el-form-item label="專案連結" prop="project_link">
          <el-input v-model="formData.project_link" placeholder="https://example.com (選填)">
            <template #prepend>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item label="GitHub 連結" prop="github_link">
          <el-input
            v-model="formData.github_link"
            placeholder="https://github.com/username/repo (選填)"
          >
            <template #prepend>
              <el-icon><Link /></el-icon>
            </template>
          </el-input>
        </el-form-item>

        <!-- 技術與功能 -->
        <el-divider content-position="left">技術與功能</el-divider>

        <el-form-item label="技術架構" prop="technologies">
          <el-select
            v-model="formData.technologies"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="輸入技術名稱並按 Enter（例如: Vue 3, TypeScript）"
            style="width: 100%"
          />
          <span class="form-item-tip">此專案使用的技術棧，會顯示在專案詳情頁面</span>
        </el-form-item>

        <el-form-item label="功能特色" prop="features">
          <el-select
            v-model="formData.features"
            multiple
            filterable
            allow-create
            default-first-option
            placeholder="輸入功能特色並按 Enter（例如: 響應式設計、即時搜尋）"
            style="width: 100%"
          />
          <span class="form-item-tip">此專案的主要功能亮點，會以列表顯示在專案詳情頁面</span>
        </el-form-item>

        <!-- 設定 -->
        <el-divider content-position="left">設定</el-divider>

        <el-form-item label="排序順序" prop="sort_order">
          <el-input-number
            v-model="formData.sort_order"
            :min="0"
            :max="9999"
            placeholder="數字越小越前面"
          />
          <span class="form-item-tip">數字越小排序越前面</span>
        </el-form-item>

        <el-form-item label="發布狀態" prop="is_published">
          <el-switch v-model="formData.is_published" active-text="已發布" inactive-text="草稿" />
        </el-form-item>

        <!-- 專案圖片 -->
        <el-divider content-position="left">專案圖片</el-divider>

        <el-alert type="info" :closable="false" show-icon style="margin-bottom: var(--space-md)">
          <template #title>
            第一張圖片將自動作為專案封面（列表頁顯示）和預覽圖（詳情頁主圖）
          </template>
        </el-alert>

        <el-form-item label="">
          <GalleryManager v-model="formData.galleries" :project-id="projectId" />
        </el-form-item>

        <!-- 操作按鈕 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            {{ isEdit ? '更新專案' : '創建專案' }}
          </el-button>
          <el-button @click="handleBack">取消</el-button>
          <el-button v-if="isEdit" type="danger" @click="handleDelete">刪除專案</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Link } from '@element-plus/icons-vue'
import { useProjectsStore } from '@/stores/admin/projects'
import { categoriesAPI, type Category } from '@/api/categories'
import { tagsAPI, type Tag } from '@/api/tags'
import GalleryManager from '@/components/GalleryManager.vue'
import type { ProjectGallery } from '@/types/models'

const router = useRouter()
const route = useRoute()
const projectsStore = useProjectsStore()

// 狀態
const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()
const categories = ref<Category[]>([])
const tags = ref<Tag[]>([])

// 標籤分組
const tagGroups = computed(() => {
  const groups: { category: string; tags: Tag[] }[] = []
  const categoryMap = new Map<string, Tag[]>()

  tags.value.forEach((tag) => {
    // 已經在 models.ts 中定義了 category 屬性，這裡可以直接安全讀取
    const cat = tag.category || 'Other'
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, [])
    }
    categoryMap.get(cat)!.push(tag)
  })

  categoryMap.forEach((tagList, category) => {
    groups.push({ category, tags: tagList })
  })

  return groups
})

// 判斷是否為編輯模式
const isEdit = computed(() => !!route.params.id)
const projectId = computed(() => Number(route.params.id))

// 表單數據
const formData = reactive({
  title: '',
  category_id: null as number | null,
  tag_ids: [] as number[],
  description: '',
  project_link: '',
  github_link: '',
  sort_order: 0,
  is_published: false,
  galleries: [] as ProjectGallery[],
  technologies: [] as string[],
  features: [] as string[]
})

// 驗證規則
const rules = reactive<FormRules>({
  title: [
    { required: true, message: '請輸入專案標題', trigger: 'blur' },
    { min: 2, max: 255, message: '長度在 2 到 255 個字符', trigger: 'blur' }
  ],
  category_id: [{ required: true, message: '請選擇分類', trigger: 'change' }],
  description: [
    { required: true, message: '請輸入專案描述', trigger: 'blur' },
    { min: 10, message: '描述至少需要 10 個字符', trigger: 'blur' }
  ]
})

// 載入數據
onMounted(async () => {
  // 先載入分類和標籤
  await Promise.all([loadCategories(), loadTags()])

  // 如果是編輯模式,載入專案數據
  if (isEdit.value) {
    await loadProject()
  }
})

const loadCategories = async () => {
  try {
    const response = await categoriesAPI.list()
    categories.value = response.data
  } catch {
    ElMessage.error('載入分類失敗')
  }
}

const loadTags = async () => {
  try {
    const response = await tagsAPI.list()
    tags.value = response.data
  } catch {
    ElMessage.error('載入標籤失敗')
  }
}

const loadProject = async () => {
  try {
    loading.value = true
    const project = await projectsStore.fetchProject(projectId.value)

    if (project) {
      // 填充表單
      Object.assign(formData, {
        title: project.title,
        category_id: project.category_id,
        tag_ids: project.tags?.map((t: { id: number }) => t.id) || [],
        description: project.description,
        project_link: project.project_link || '',
        github_link: project.github_link || '',
        sort_order: project.sort_order || 0,
        is_published: project.is_published,
        galleries: project.galleries || [],
        technologies: project.technologies || [],
        features: project.features || []
      })
    }
  } catch {
    ElMessage.error('載入專案資料失敗')
    handleBack()
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    // 驗證表單
    await formRef.value.validate()

    submitting.value = true

    // 準備 FormData
    const submitData = new FormData()
    submitData.append('title', formData.title)
    submitData.append('category_id', formData.category_id?.toString() || '')
    submitData.append('description', formData.description)
    submitData.append('project_link', formData.project_link || '')
    submitData.append('github_link', formData.github_link || '')
    submitData.append('sort_order', formData.sort_order.toString())
    submitData.append('is_published', formData.is_published ? '1' : '0')

    // 標籤 ID 陣列
    formData.tag_ids.forEach((tagId) => {
      submitData.append('tag_ids[]', tagId.toString())
    })

    // 技術架構陣列
    formData.technologies.forEach((tech) => {
      submitData.append('technologies[]', tech)
    })

    // 功能特色陣列
    formData.features.forEach((feature) => {
      submitData.append('features[]', feature)
    })

    if (isEdit.value) {
      // 調用更新 API
      await projectsStore.updateProject(projectId.value, submitData)
      ElMessage.success('專案已更新')
    } else {
      // 調用創建 API
      await projectsStore.createProject(submitData)
      ElMessage.success('專案已創建')
    }

    // 成功後返回列表
    handleBack()
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'errors' in error) {
      // 表單驗證錯誤 - 不顯示錯誤,由 Element Plus 處理
    } else {
      ElMessage.error('提交失敗，請稍後再試')
    }
  } finally {
    submitting.value = false
  }
}

const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('確定要刪除這個專案嗎？此操作無法復原。', '確認刪除', {
      confirmButtonText: '確定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 調用刪除 API
    await projectsStore.deleteProject(projectId.value)
    ElMessage.success('專案已刪除')
    handleBack()
  } catch (err) {
    if (err !== 'cancel') {
      ElMessage.error('刪除專案失敗')
    }
  }
}

const handleBack = () => {
  router.push('/admin/projects')
}
</script>

<style scoped>
.image-upload-section {
  width: 100%;
}

.form-item-tip {
  margin-left: var(--space-sm);
  font-size: var(--font-size-sm);
  color: var(--el-text-color-secondary);
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

:deep(.el-divider__text) {
  font-weight: 600;
  font-size: var(--font-size-lg);
  color: var(--text);
}
</style>
