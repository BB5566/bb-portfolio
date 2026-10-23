<template>
  <div class="profile-view">
    <div class="page-header">
      <h1 class="page-title">個人資料管理</h1>
      <p class="page-subtitle">管理 About 區塊的所有資料</p>
    </div>

    <el-card shadow="never" v-loading="loading">
      <el-tabs v-model="activeTab" class="profile-tabs">
        <!-- ===== Tab 1: 基本資料 ===== -->
        <el-tab-pane label="📋 基本資料" name="basic">
          <el-form
            ref="basicFormRef"
            :model="formData"
            :rules="rules"
            label-width="120px"
            class="tab-form"
          >
            <el-form-item label="姓名" prop="name" required>
              <el-input v-model="formData.name" placeholder="請輸入姓名" />
            </el-form-item>

            <el-form-item label="職稱" prop="title">
              <el-input v-model="formData.title" placeholder="例如: Frontend Developer" />
            </el-form-item>

            <el-form-item label="副標題" prop="subtitle">
              <el-input v-model="formData.subtitle" placeholder="例如: The code must flow." />
              <span class="form-tip">顯示在 About 區塊的引言</span>
            </el-form-item>

            <el-form-item label="簡介" prop="bio">
              <el-input
                v-model="formData.bio"
                type="textarea"
                :rows="4"
                placeholder="請輸入個人簡介"
              />
            </el-form-item>

            <el-form-item label="Email" prop="email">
              <el-input v-model="formData.email" type="email" placeholder="contact@example.com" />
            </el-form-item>

            <el-form-item label="地點" prop="location">
              <el-input v-model="formData.location" placeholder="Taipei, Taiwan" />
            </el-form-item>

            <el-form-item label="頭像圖片" prop="avatar">
              <el-upload
                class="avatar-uploader"
                :auto-upload="false"
                :show-file-list="false"
                :on-change="handleAvatarChange"
              >
                <img v-if="avatarPreview" :src="avatarPreview" class="avatar-preview" />
                <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
              </el-upload>
              <div class="form-tip" style="margin-top: 8px">
                點擊或拖曳上傳圖片（推薦比例 1:1，最大 2MB）
              </div>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                儲存變更
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- ===== Tab 2: 統計數字 ===== -->
        <el-tab-pane label="📊 統計數字" name="stats">
          <div class="stats-preview-banner">
            <span class="preview-label">前台顯示效果</span>
            <div class="stats-preview">
              <div class="stat-preview-item">
                <span class="stat-num">{{ formData.years_experience }}</span>
                <span class="stat-desc">
                  Years
                  <br />
                  Experience
                </span>
              </div>
              <div class="stat-divider-preview"></div>
              <div class="stat-preview-item">
                <span class="stat-num">{{ formData.projects_delivered }}</span>
                <span class="stat-desc">
                  Projects
                  <br />
                  Delivered
                </span>
              </div>
              <div class="stat-divider-preview"></div>
              <div class="stat-preview-item">
                <span class="stat-num">{{ formData.hours_training }}</span>
                <span class="stat-desc">
                  Hours
                  <br />
                  Training
                </span>
              </div>
            </div>
          </div>

          <el-form :model="formData" :rules="rules" label-width="120px" class="tab-form">
            <el-row :gutter="24">
              <el-col :span="8">
                <el-form-item label="年資 (年)" prop="years_experience">
                  <el-input-number
                    v-model="formData.years_experience"
                    :min="0"
                    :max="100"
                    controls-position="right"
                    class="stat-input"
                  />
                  <span class="form-tip">Years Experience</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="案子數量" prop="projects_delivered">
                  <el-input-number
                    v-model="formData.projects_delivered"
                    :min="0"
                    :max="9999"
                    controls-position="right"
                    class="stat-input"
                  />
                  <span class="form-tip">Projects Delivered</span>
                </el-form-item>
              </el-col>
              <el-col :span="8">
                <el-form-item label="訓練時數" prop="hours_training">
                  <el-input-number
                    v-model="formData.hours_training"
                    :min="0"
                    :max="99999"
                    controls-position="right"
                    class="stat-input"
                  />
                  <span class="form-tip">Hours Training</span>
                </el-form-item>
              </el-col>
            </el-row>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                儲存變更
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- ===== Tab 3: 社群連結 ===== -->
        <el-tab-pane label="🔗 社群連結" name="social">
          <el-form :model="formData" :rules="rules" label-width="120px" class="tab-form">
            <el-form-item label="GitHub" prop="github">
              <el-input v-model="formData.github" placeholder="https://github.com/username">
                <template #prepend>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path
                      d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                    />
                  </svg>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item label="LinkedIn" prop="linkedin">
              <el-input v-model="formData.linkedin" placeholder="https://linkedin.com/in/username">
                <template #prepend>
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path
                      d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                    />
                  </svg>
                </template>
              </el-input>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                儲存變更
              </el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- ===== Tab 4: 技能專長 ===== -->
        <el-tab-pane label="⚡ 技能專長" name="skills">
          <el-form label-width="0" class="tab-form">
            <div class="skills-manager">
              <!-- 技能類別列表 -->
              <div
                v-for="(skillList, category, index) in skillsData"
                :key="category"
                class="skill-category-item"
              >
                <div class="category-header">
                  <el-input
                    v-model="categoryNames[index]"
                    placeholder="分類名稱（例如: Frontend）"
                    class="category-name-input"
                  />
                  <el-button
                    type="danger"
                    size="small"
                    @click="removeCategory(category, index)"
                    :icon="Delete"
                  >
                    刪除分類
                  </el-button>
                </div>

                <!-- 技能標籤列表 -->
                <div class="skills-tags">
                  <el-tag
                    v-for="(skill, skillIndex) in skillList"
                    :key="skillIndex"
                    closable
                    @close="removeSkill(category, skillIndex)"
                    class="skill-tag"
                  >
                    {{ skill }}
                  </el-tag>

                  <!-- 新增技能：用 v-show 取代 v-if 避免跳動 -->
                  <el-input
                    v-show="inputVisible[category]"
                    ref="inputRefs"
                    v-model="inputValue[category]"
                    class="input-new-tag"
                    size="small"
                    @keyup.enter="handleInputConfirm(category)"
                    @blur="handleInputConfirm(category)"
                  />
                  <el-button
                    v-show="!inputVisible[category]"
                    class="button-new-tag"
                    size="small"
                    @click="showInput(category)"
                    :icon="Plus"
                  >
                    新增技能
                  </el-button>
                </div>
              </div>

              <!-- 新增分類 -->
              <el-button type="primary" @click="addCategory" :icon="Plus" class="add-category-btn">
                新增技能分類
              </el-button>
            </div>

            <div class="skills-actions">
              <el-button type="primary" @click="handleSubmit" :loading="submitting">
                儲存變更
              </el-button>
              <span class="form-tip">管理你的技能專長，按分類組織</span>
            </div>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, reactive, onMounted, nextTick } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus, Delete } from '@element-plus/icons-vue'
import client from '@/api/client'

const loading = ref(false)
const submitting = ref(false)
// 只有「基本資料」表單帶驗證規則（name/email），其餘 tab 無需驗證
const basicFormRef = ref<FormInstance>()
const activeTab = ref('basic')

// Avatar Upload
const avatarFile = ref<File | null>(null)
const avatarPreview = ref<string>('')

const handleAvatarChange = (uploadFile: import('element-plus').UploadFile) => {
  if (uploadFile.raw) {
    if (!uploadFile.raw.type.startsWith('image/')) {
      ElMessage.error('請選擇圖片檔案！')
      return
    }
    if (uploadFile.raw.size / 1024 / 1024 > 2) {
      ElMessage.error('圖片大小不能超過 2MB！')
      return
    }
    avatarFile.value = uploadFile.raw
    avatarPreview.value = URL.createObjectURL(uploadFile.raw)
  }
}

// 技能管理相關
const skillsData = reactive<Record<string, string[]>>({})
const categoryNames = ref<string[]>([])
const inputVisible = reactive<Record<string, boolean>>({})
const inputValue = reactive<Record<string, string>>({})
const inputRefs = ref()

const formData = reactive({
  name: '',
  title: '',
  subtitle: '',
  bio: '',
  email: '',
  location: '',
  github: '',
  linkedin: '',
  avatar: '',
  years_experience: 0,
  projects_delivered: 0,
  hours_training: 0,
  skills: {} as Record<string, string[]>
})

const rules = reactive<FormRules>({
  name: [{ required: true, message: '請輸入姓名', trigger: 'blur' }],
  email: [{ type: 'email', message: '請輸入有效的 Email', trigger: 'blur' }]
})

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  try {
    loading.value = true
    const response = await client.get('/admin/profile')
    const data = response.data

    Object.assign(formData, data)

    // 設定圖片預覽
    if (data.avatar) {
      avatarPreview.value = data.avatar.startsWith('http')
        ? data.avatar
        : `${import.meta.env.VITE_BACKEND_URL || 'https://bb-made.com'}/storage/${data.avatar}`
    }

    // 處理數字欄位（API 可能回傳 null）
    formData.years_experience = data.years_experience ?? 0
    formData.projects_delivered = data.projects_delivered ?? 0
    formData.hours_training = data.hours_training ?? 0

    // 載入技能資料
    if (data.skills && typeof data.skills === 'object') {
      // 清空舊的
      Object.keys(skillsData).forEach((k) => delete skillsData[k])
      Object.assign(skillsData, data.skills)
      categoryNames.value = Object.keys(data.skills)
      // 初始化 inputVisible
      Object.keys(data.skills).forEach((k) => {
        inputVisible[k] = false
        inputValue[k] = ''
      })
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('載入資料失敗:', err)
    }
    ElMessage.error('載入個人資料失敗')
  } finally {
    loading.value = false
  }
}

// 技能管理函數
const addCategory = () => {
  const newCategory = `新分類${Object.keys(skillsData).length + 1}`
  skillsData[newCategory] = []
  categoryNames.value.push(newCategory)
  inputVisible[newCategory] = false
  inputValue[newCategory] = ''
}

const removeCategory = (category: string, index: number) => {
  // 用 v-for 提供的 index 直接刪除，避免使用者改過分類顯示名後 indexOf 找不到而錯位
  delete skillsData[category]
  categoryNames.value.splice(index, 1)
}

const removeSkill = (category: string, skillIndex: number) => {
  const skills = skillsData[category]
  if (skills) {
    skills.splice(skillIndex, 1)
  }
}

const showInput = (category: string) => {
  inputVisible[category] = true
  nextTick(() => {
    if (inputRefs.value && inputRefs.value[0]) {
      inputRefs.value[0].focus()
    }
  })
}

const handleInputConfirm = (category: string) => {
  const value = inputValue[category]?.trim()
  const skills = skillsData[category]
  if (value && skills && !skills.includes(value)) {
    skills.push(value)
  }
  inputVisible[category] = false
  inputValue[category] = ''
}

const handleSubmit = async () => {
  // 驗證基本資料表單（name 必填、email 格式）；驗證失敗切回基本資料 tab 並中止，
  // 不進入 catch 誤報「更新失敗」
  if (basicFormRef.value) {
    const valid = await basicFormRef.value.validate().catch(() => false)
    if (!valid) {
      activeTab.value = 'basic'
      return
    }
  }

  try {
    submitting.value = true

    // 更新分類名稱（處理重命名）
    const updatedSkills: Record<string, string[]> = {}
    const oldCategories = Object.keys(skillsData)

    oldCategories.forEach((oldCategory, index) => {
      const newCategory = categoryNames.value[index] || oldCategory
      const skills = skillsData[oldCategory]
      if (skills) {
        updatedSkills[newCategory] = skills
      }
    })

    const submitData = new FormData()
    submitData.append('_method', 'PUT')

    // 基本資料
    submitData.append('name', formData.name || '')
    submitData.append('title', formData.title || '')
    submitData.append('subtitle', formData.subtitle || '')
    submitData.append('bio', formData.bio || '')
    submitData.append('email', formData.email || '')
    submitData.append('location', formData.location || '')
    submitData.append('github', formData.github || '')
    submitData.append('linkedin', formData.linkedin || '')
    submitData.append('years_experience', String(formData.years_experience || 0))
    submitData.append('projects_delivered', String(formData.projects_delivered || 0))
    submitData.append('hours_training', String(formData.hours_training || 0))

    // 技能資料轉換為 array format
    for (const [key, value] of Object.entries(updatedSkills)) {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((item) => {
          submitData.append(`skills[${key}][]`, item)
        })
      } else {
        // 如果沒有技能，傳送空陣列以確保後端知曉
        submitData.append(`skills[${key}][]`, '')
      }
    }

    // 如果有選新圖片才上傳
    if (avatarFile.value) {
      submitData.append('avatar', avatarFile.value)
    }

    // 使用 POST + _method=PUT 傳送 FormData
    await client.post('/admin/profile', submitData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    ElMessage.success('個人資料已更新')
    await loadProfile()
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('更新失敗:', err)
    }
    ElMessage.error('更新個人資料失敗')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.profile-view {
  padding: var(--space-lg);
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: var(--font-size-3xl, 1.875rem);
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.25rem 0;
}

.page-subtitle {
  color: var(--text-muted);
  margin: 0;
  font-size: var(--font-size-sm);
}

/* Tab 樣式 */
.profile-tabs :deep(.el-tabs__header) {
  margin-bottom: 28px;
}

.profile-tabs :deep(.el-tabs__item) {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  letter-spacing: 0.5px;
}

.profile-tabs :deep(.el-tabs__active-bar) {
  background: var(--volt);
}

.profile-tabs :deep(.el-tabs__item.is-active) {
  color: var(--volt);
}

.tab-form {
  max-width: 720px;
  padding-top: 8px;
}

/* 頭像上傳樣式 */
.avatar-uploader :deep(.el-upload) {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
  background-color: var(--el-fill-color-blank);
  width: 178px;
  height: 178px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-uploader :deep(.el-upload:hover) {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar-preview {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
}

.form-tip {
  font-size: var(--font-size-sm);
  color: var(--el-text-color-secondary);
  margin-top: 4px;
  display: block;
  line-height: 1.4;
}

/* 統計預覽橫幅 */
.stats-preview-banner {
  background: linear-gradient(135deg, rgba(16, 12, 10, 0.8), rgba(26, 21, 18, 0.6));
  border: 1px solid rgba(225, 193, 110, 0.15);
  border-radius: 8px;
  padding: 20px 32px;
  margin-bottom: 28px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.preview-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--volt);
  letter-spacing: 3px;
  text-transform: uppercase;
  opacity: 0.7;
}

.stats-preview {
  display: flex;
  align-items: center;
  gap: 24px;
}

.stat-preview-item {
  text-align: center;
  min-width: 80px;
}

.stat-num {
  display: block;
  font-family: 'Bebas Neue', var(--font-display), sans-serif;
  font-size: 2.5rem;
  color: var(--volt);
  line-height: 1;
  margin-bottom: 6px;
}

.stat-desc {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  line-height: 1.4;
}

.stat-divider-preview {
  width: 1px;
  height: 48px;
  background: linear-gradient(180deg, transparent, rgba(225, 193, 110, 0.3), transparent);
}

/* 統計輸入框 */
.stat-input {
  width: 100% !important;
}

/* 技能管理 */
.skills-manager {
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  padding: 16px;
  background: var(--el-fill-color-blank);
  margin-bottom: 20px;
}

.skill-category-item {
  margin-bottom: 20px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: var(--el-border-radius-base);
  border: 1px solid var(--el-border-color-lighter);
}

.category-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.category-name-input {
  width: 200px;
  flex-shrink: 0;
}

.skills-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  min-height: 32px; /* 防 CLS */
}

.skill-tag {
  margin: 0;
}

.input-new-tag {
  width: 120px;
}

.button-new-tag {
  height: 24px;
  padding: 0 8px;
  line-height: 22px;
}

.add-category-btn {
  margin-top: 8px;
}

.skills-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
