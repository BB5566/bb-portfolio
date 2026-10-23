<template>
  <div class="contact-settings-view">
    <div class="page-header">
      <h1 class="page-title">聯絡設定</h1>
      <p class="page-subtitle">管理前台 Contact 區塊的顯示資訊</p>
    </div>

    <el-card shadow="never" v-loading="loading">
      <el-form ref="formRef" :model="formData" :rules="rules" label-width="140px">
        <!-- 基本聯絡資訊 -->
        <div class="form-section">
          <h3 class="section-title">聯絡資訊</h3>

          <el-form-item label="聯絡 Email" prop="email">
            <el-input v-model="formData.email" type="email" placeholder="contact@example.com">
              <template #prepend>
                <LucideIcon name="Mail" :size="16" />
              </template>
            </el-input>
            <span class="form-tip">訪客填寫聯絡表單後，通知會發送到此 Email</span>
          </el-form-item>

          <el-form-item label="電話" prop="phone">
            <el-input v-model="formData.phone" placeholder="+886 912-345-678">
              <template #prepend>
                <LucideIcon name="Phone" :size="16" />
              </template>
            </el-input>
          </el-form-item>

          <el-form-item label="所在地" prop="location">
            <el-input v-model="formData.location" placeholder="Taipei, Taiwan">
              <template #prepend>
                <LucideIcon name="MapPin" :size="16" />
              </template>
            </el-input>
          </el-form-item>
        </div>

        <!-- 社群媒體 -->
        <div class="form-section">
          <h3 class="section-title">社群媒體</h3>
          <el-alert type="info" :closable="false" show-icon>
            <template #title>
              社群媒體連結統一在
              <router-link to="/admin/profile" style="color: var(--el-color-primary)">
                個人資料
              </router-link>
              頁面管理
            </template>
          </el-alert>
        </div>

        <!-- 儲存按鈕 -->
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">儲存變更</el-button>
          <el-button @click="loadProfile">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 預覽 -->
    <el-card shadow="never" class="preview-card">
      <template #header>
        <span>前台預覽</span>
      </template>
      <div class="contact-preview">
        <div class="preview-info" v-if="formData.email">
          <LucideIcon name="Mail" :size="16" />
          <span>{{ formData.email }}</span>
        </div>
        <div class="preview-info" v-if="formData.phone">
          <LucideIcon name="Phone" :size="16" />
          <span>{{ formData.phone }}</span>
        </div>
        <div class="preview-info" v-if="formData.location">
          <LucideIcon name="MapPin" :size="16" />
          <span>{{ formData.location }}</span>
        </div>
        <div class="preview-social">
          <span class="social-hint">社群連結請至個人資料頁面管理</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import client from '@/api/client'
import LucideIcon from '@/components/LucideIcon'

const loading = ref(false)
const submitting = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  email: '',
  phone: '',
  location: ''
})

const rules = reactive<FormRules>({
  email: [
    { required: true, message: '請輸入聯絡 Email', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的 Email', trigger: 'blur' }
  ]
})

onMounted(async () => {
  await loadProfile()
})

const loadProfile = async () => {
  try {
    loading.value = true
    const response = await client.get('/admin/profile')
    const data = response.data

    formData.email = data.email || ''
    formData.phone = data.phone || ''
    formData.location = data.location || ''
  } catch (err) {
    if (import.meta.env.DEV) {
      log.error('載入資料失敗:', err)
    }
    ElMessage.error('載入設定失敗')
  } finally {
    loading.value = false
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    submitting.value = true

    await client.put('/admin/profile', formData)
    ElMessage.success('聯絡設定已更新')
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
.contact-settings-view {
  padding: var(--space-lg);
}

.page-header {
  margin-bottom: var(--space-xl);
}

.page-title {
  font-size: var(--font-size-3xl);
  font-weight: 700;
  color: var(--text);
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  color: var(--text-muted);
  margin: 0;
}

.form-section {
  margin-bottom: var(--space-xl);
  padding-bottom: var(--space-lg);
  border-bottom: 1px solid var(--border-light);
}

.form-section:last-of-type {
  border-bottom: none;
}

.section-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--volt);
  margin: 0 0 var(--space-md) 0;
  padding-bottom: var(--space-sm);
  border-bottom: 1px solid rgba(225, 193, 110, 0.2);
}

.form-tip {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin-top: 4px;
  display: block;
}

/* 預覽卡片 */
.preview-card {
  margin-top: var(--space-lg);
}

.contact-preview {
  background: linear-gradient(135deg, #100c0a 0%, #1a1512 100%);
  border-radius: 8px;
  padding: var(--space-xl);
}

.preview-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  color: var(--text-light);
  margin-bottom: var(--space-md);
}

.preview-info svg {
  color: var(--volt);
  flex-shrink: 0;
}

.preview-social {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-lg);
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-light);
}

.social-hint {
  color: var(--text-muted);
  font-size: 0.85rem;
}
</style>
