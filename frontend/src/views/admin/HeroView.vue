<template>
  <div class="admin-page-view">
    <div class="admin-page-header admin-page-header--col">
      <h1 class="admin-page-title">HERO 首頁設定</h1>
      <p class="admin-page-subtitle">管理首頁 Hero 區塊的顯示內容</p>
    </div>

    <el-card shadow="never" v-loading="loading">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px">
        <!-- 名稱顯示區塊 -->
        <div class="form-section">
          <h3 class="section-title">名稱顯示</h3>
          <el-form-item label="顯示名稱（上）" prop="display_name">
            <el-input v-model="formData.display_name" placeholder="例如: BOB" />
            <span class="form-tip">首頁大標題第一行（英文建議大寫）</span>
          </el-form-item>

          <el-form-item label="顯示名稱（下）" prop="display_name_sub">
            <el-input v-model="formData.display_name_sub" placeholder="例如: TSOU" />
            <span class="form-tip">首頁大標題第二行（姓氏）</span>
          </el-form-item>
        </div>

        <!-- 打字效果文字 -->
        <div class="form-section">
          <h3 class="section-title">角色文字（打字效果）</h3>
          <el-form-item label="角色文字" prop="role_texts">
            <div class="role-texts-manager">
              <div v-for="(text, index) in roleTexts" :key="index" class="role-text-item">
                <el-input v-model="roleTexts[index]" placeholder="例如: FRONTEND ENGINEER" />
                <el-button
                  type="danger"
                  :icon="Delete"
                  circle
                  @click="removeRoleText(index)"
                  :disabled="roleTexts.length <= 1"
                />
              </div>
              <el-button type="primary" :icon="Plus" @click="addRoleText">新增角色文字</el-button>
            </div>
            <span class="form-tip">這些文字會以打字效果輪播顯示在名稱下方</span>
          </el-form-item>
        </div>

        <!-- 社群連結 -->
        <div class="form-section">
          <h3 class="section-title">社群連結</h3>
          <el-alert type="info" :closable="false" show-icon style="margin-bottom: var(--space-md)">
            <template #title>
              社群連結（GitHub、Email、LinkedIn）統一在
              <router-link to="/admin/profile" style="color: var(--el-color-primary)">
                個人資料
              </router-link>
              頁面管理
            </template>
          </el-alert>

          <el-form-item label="履歷檔案" prop="resume_url">
            <el-upload
              class="resume-uploader"
              :auto-upload="false"
              :show-file-list="true"
              :limit="1"
              accept=".pdf"
              :on-change="handleResumeChange"
              :on-remove="handleResumeRemove"
            >
              <template #trigger>
                <el-button type="primary">選擇 PDF 檔案</el-button>
              </template>
              <template #tip>
                <div class="el-upload__tip">
                  只能上傳 PDF 檔案，大小不超過 5MB
                  <div v-if="formData.resume_url" class="current-resume-link">
                    目前履歷：
                    <a :href="resumeFullUrl" target="_blank" rel="noopener noreferrer">
                      {{ formData.resume_url.split('/').pop() || '查看履歷' }}
                    </a>
                  </div>
                </div>
              </template>
            </el-upload>
          </el-form-item>
        </div>

        <!-- 儲存按鈕 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">儲存變更</el-button>
          <el-button @click="loadProfile">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 預覽區塊 -->
    <el-card shadow="never" class="preview-card">
      <template #header>
        <span>預覽</span>
      </template>
      <div class="hero-preview">
        <div class="preview-name">
          <span class="name-first">{{ formData.display_name || 'YOUR' }}</span>
          <span class="name-last">{{ formData.display_name_sub || 'NAME' }}</span>
        </div>
        <div class="preview-role">&lt;{{ currentRolePreview }}/&gt;</div>
        <div class="preview-links">
          <span v-if="formData.github" class="preview-link">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
            GitHub
          </span>
          <span v-if="formData.resume_url" class="preview-link">
            <LucideIcon name="FileText" :size="14" />
            Resume
          </span>
          <span v-if="formData.email" class="preview-link">
            <LucideIcon name="Mail" :size="14" />
            Email
          </span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, reactive, onMounted, computed, onUnmounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import client from '@/api/client'
import LucideIcon from '@/components/LucideIcon'

const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  display_name: '',
  display_name_sub: '',
  github: '',
  email: '',
  resume_url: '',
  linkedin: ''
})

// Resume Upload
const resumeFile = ref<File | null>(null)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'https://bb-made.com'

const resumeFullUrl = computed(() => {
  if (!formData.resume_url) return ''
  return formData.resume_url.startsWith('http')
    ? formData.resume_url
    : `${BACKEND_URL}/storage/${formData.resume_url}`
})

const handleResumeChange = (uploadFile: import('element-plus').UploadFile) => {
  if (uploadFile.raw) {
    if (uploadFile.raw.type !== 'application/pdf') {
      ElMessage.error('請選擇 PDF 檔案！')
      return
    }
    if (uploadFile.raw.size / 1024 / 1024 > 5) {
      ElMessage.error('檔案大小不能超過 5MB！')
      return
    }
    resumeFile.value = uploadFile.raw
  }
}

const handleResumeRemove = () => {
  resumeFile.value = null
}

const roleTexts = ref<string[]>(['FRONTEND ENGINEER'])

const rules = reactive<FormRules>({
  display_name: [{ required: true, message: '請輸入顯示名稱', trigger: 'blur' }],
  email: [{ type: 'email', message: '請輸入有效的 Email', trigger: 'blur' }]
})

// 角色文字管理
const addRoleText = () => {
  roleTexts.value.push('')
}

const removeRoleText = (index: number) => {
  if (roleTexts.value.length > 1) {
    roleTexts.value.splice(index, 1)
  }
}

// 預覽用的角色文字輪播
const currentRoleIndex = ref(0)
const currentRolePreview = computed(() => {
  const texts = roleTexts.value.filter((t) => t.trim())
  return texts[currentRoleIndex.value] || 'YOUR ROLE'
})

let roleInterval: ReturnType<typeof setInterval> | null = null

onMounted(async () => {
  await loadProfile()
  // 啟動預覽輪播
  roleInterval = setInterval(() => {
    const texts = roleTexts.value.filter((t) => t.trim())
    if (texts.length > 1) {
      currentRoleIndex.value = (currentRoleIndex.value + 1) % texts.length
    }
  }, 2000)
})

onUnmounted(() => {
  if (roleInterval) {
    clearInterval(roleInterval)
  }
})

const loadProfile = async () => {
  try {
    loading.value = true
    const response = await client.get('/admin/profile')
    const data = response.data

    formData.display_name = data.display_name || ''
    formData.display_name_sub = data.display_name_sub || ''
    formData.github = data.github || ''
    formData.email = data.email || ''
    formData.resume_url = data.resume_url || ''
    formData.linkedin = data.linkedin || ''

    if (data.role_texts && Array.isArray(data.role_texts) && data.role_texts.length > 0) {
      roleTexts.value = data.role_texts
    } else {
      roleTexts.value = ['FRONTEND ENGINEER']
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('載入資料失敗:', err)
    }
    ElMessage.error('載入設定失敗')
  } finally {
    loading.value = false
  }
}

// Submit handler with FormData for file upload
const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    const submitData = new FormData()
    submitData.append('_method', 'PUT')

    // 基本欄位
    submitData.append('display_name', formData.display_name || '')
    submitData.append('display_name_sub', formData.display_name_sub || '')
    submitData.append('github', formData.github || '')
    submitData.append('email', formData.email || '')
    submitData.append('linkedin', formData.linkedin || '')

    // 角色陣列
    const filteredRoleTexts = roleTexts.value.filter((t) => t.trim())
    if (filteredRoleTexts.length > 0) {
      filteredRoleTexts.forEach((text) => {
        submitData.append('role_texts[]', text)
      })
    } else {
      submitData.append('role_texts[]', '')
    }

    // 履歷檔案
    if (resumeFile.value) {
      submitData.append('resume', resumeFile.value)
    }

    await client.post('/admin/profile', submitData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    ElMessage.success('HERO 設定已更新')
    await loadProfile()
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('更新失敗:', err)
    }
    ElMessage.error('更新設定失敗')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.admin-page-view {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.current-resume-link {
  margin-top: 8px;
  color: var(--text-muted);
}
.current-resume-link a {
  color: var(--volt);
  text-decoration: none;
}
.current-resume-link a:hover {
  text-decoration: underline;
}

.form-section {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-light);
}

.form-section:last-of-type {
  border-bottom: none;
}

/* 角色文字管理 */
.role-texts-manager {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.role-text-item {
  display: flex;
  gap: var(--space-sm);
  align-items: center;
}

.role-text-item .el-input {
  flex: 1;
}

/* 預覽卡片 */
.preview-card {
  margin-top: var(--space-lg);
}

.hero-preview {
  background: linear-gradient(135deg, #100c0a 0%, #1a1512 100%);
  border-radius: 8px;
  padding: var(--space-xl);
  text-align: center;
}

.preview-name {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: var(--space-md);
}

.name-first {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  background: linear-gradient(180deg, #ffffff 0%, #f5e6c8 50%, #e1c16e 100%);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.name-last {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 3rem;
  font-weight: 900;
  letter-spacing: 0.15em;
  color: transparent;
  -webkit-text-stroke: 2px var(--volt);
}

.preview-role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  color: #ffffff;
  margin-bottom: var(--space-md);
}

.preview-links {
  display: flex;
  justify-content: center;
  gap: var(--space-md);
}

.preview-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(225, 193, 110, 0.1);
  border: 1px solid rgba(225, 193, 110, 0.3);
  color: var(--volt);
  font-size: 0.85rem;
}
</style>
