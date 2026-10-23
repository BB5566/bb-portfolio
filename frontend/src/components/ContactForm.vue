<template>
  <form @submit.prevent="handleSubmit" class="contact-form">
    <!-- 姓名 -->
    <div class="form-group">
      <label for="name" class="form-label">
        <LucideIcon name="User" :size="16" />
        姓名
        <span class="required">*</span>
      </label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        autocomplete="name"
        class="form-input"
        :class="{ error: errors.name }"
        placeholder="請輸入您的姓名"
        :disabled="loading"
        @blur="markTouched('name')"
        @input="onFieldInput('name')"
      />
      <span v-if="touched.name && errors.name" class="error-message" role="alert">
        {{ errors.name }}
      </span>
    </div>

    <!-- Email -->
    <div class="form-group">
      <label for="email" class="form-label">
        <LucideIcon name="Mail" :size="16" />
        電子郵件
        <span class="required">*</span>
      </label>
      <input
        id="email"
        v-model="formData.email"
        type="email"
        autocomplete="email"
        inputmode="email"
        class="form-input"
        :class="{ error: errors.email }"
        placeholder="your@email.com"
        :disabled="loading"
        @blur="markTouched('email')"
        @input="onFieldInput('email')"
      />
      <span v-if="touched.email && errors.email" class="error-message" role="alert">
        {{ errors.email }}
      </span>
    </div>

    <!-- 主旨 -->
    <div class="form-group">
      <label for="subject" class="form-label">
        <LucideIcon name="Heading" :size="16" />
        主旨
        <span class="optional">(選填)</span>
      </label>
      <input
        id="subject"
        v-model="formData.subject"
        type="text"
        class="form-input"
        :class="{ error: errors.subject }"
        placeholder="請輸入主旨"
        :disabled="loading"
        @blur="markTouched('subject')"
        @input="onFieldInput('subject')"
      />
      <span v-if="touched.subject && errors.subject" class="error-message" role="alert">
        {{ errors.subject }}
      </span>
    </div>

    <!-- 訊息 -->
    <div class="form-group">
      <label for="message" class="form-label">
        <LucideIcon name="MessageCircle" :size="16" />
        訊息內容
        <span class="required">*</span>
      </label>
      <textarea
        id="message"
        v-model="formData.message"
        class="form-textarea"
        :class="{ error: errors.message }"
        placeholder="請輸入您想說的話..."
        rows="6"
        maxlength="5000"
        :disabled="loading"
        @blur="markTouched('message')"
        @input="onFieldInput('message')"
      ></textarea>
      <span v-if="touched.message && errors.message" class="error-message" role="alert">
        {{ errors.message }}
      </span>
      <span class="char-count" :class="{ warning: formData.message.length > 4500 }">
        {{ formData.message.length }} / 5000
      </span>
    </div>

    <!-- 成功訊息 -->
    <div v-if="successMessage" class="alert alert-success" role="status" aria-live="polite">
      <LucideIcon name="CheckCircle" :size="16" />
      {{ successMessage }}
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="alert alert-error" role="alert" aria-live="assertive">
      <LucideIcon name="AlertCircle" :size="16" />
      {{ errorMessage }}
    </div>

    <!-- 提交按鈕 -->
    <button type="submit" class="submit-btn" :disabled="loading" :class="{ loading: loading }">
      <span v-if="!loading">
        <LucideIcon name="Send" :size="16" />
        送出訊息
      </span>
      <span v-else>
        <LucideIcon name="Loader2" :size="16" class="spin-icon" />
        送出中...
      </span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, reactive, onUnmounted } from 'vue'
import { submitContactForm, type ContactFormData } from '@/services/contact'
import { useGtag } from '@/plugins/gtag'
import LucideIcon from '@/components/LucideIcon'

const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')
const { trackContactFormSubmit } = useGtag()

// 成功訊息自動清除計時器，元件卸載時需清理避免對已卸載元件寫入
let successTimer: number | null = null

const formData = reactive<ContactFormData>({
  name: '',
  email: '',
  subject: '',
  message: ''
})

const errors = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

// touched 機制：欄位失焦後才顯示錯誤，避免輸入過程中即時跳錯干擾
const touched = reactive({
  name: false,
  email: false,
  subject: false,
  message: false
})

// 清除錯誤訊息
const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.subject = ''
  errors.message = ''
  errorMessage.value = ''
}

// 欄位失焦：標記 touched 並驗證（是否顯示由 template 的 touched 條件控制）
const markTouched = (field: keyof typeof errors) => {
  touched[field] = true
  validateField(field)
}

// 單一欄位驗證（供 blur 即時驗證與整表送出共用）
const validateField = (field: keyof typeof errors) => {
  switch (field) {
    case 'name':
      if (!formData.name.trim()) errors.name = '請輸入您的姓名'
      else if (formData.name.length > 255) errors.name = '姓名不得超過 255 個字元'
      else errors.name = ''
      break
    case 'email':
      if (!formData.email.trim()) errors.email = '請輸入您的電子郵件'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
        errors.email = '請輸入有效的電子郵件格式'
      else if (formData.email.length > 255) errors.email = '電子郵件不得超過 255 個字元'
      else errors.email = ''
      break
    case 'subject':
      if (formData.subject && formData.subject.length > 255)
        errors.subject = '主旨不得超過 255 個字元'
      else errors.subject = ''
      break
    case 'message':
      if (!formData.message.trim()) errors.message = '請輸入訊息內容'
      else if (formData.message.length < 10) errors.message = '訊息內容至少需要 10 個字元'
      else if (formData.message.length > 5000) errors.message = '訊息內容不得超過 5000 個字元'
      else errors.message = ''
      break
  }
}

// 已 touched 的欄位，使用者重新輸入時即時重新驗證，讓修正立即生效
const onFieldInput = (field: keyof typeof errors) => {
  if (touched[field]) validateField(field)
}

// 驗證整張表單
const validateForm = (): boolean => {
  errorMessage.value = ''
  ;(['name', 'email', 'subject', 'message'] as const).forEach((field) => {
    touched[field] = true
    validateField(field)
  })
  return !errors.name && !errors.email && !errors.subject && !errors.message
}

// 重置表單
const resetForm = () => {
  formData.name = ''
  formData.email = ''
  formData.subject = ''
  formData.message = ''
  clearErrors()
  touched.name = false
  touched.email = false
  touched.subject = false
  touched.message = false
}

// 提交表單
const handleSubmit = async () => {
  successMessage.value = ''

  if (!validateForm()) {
    return
  }

  loading.value = true

  try {
    const response = await submitContactForm(formData)
    successMessage.value = response.message
    resetForm()

    // 追蹤表單提交成功 (GA4)
    trackContactFormSubmit(true)

    // 5 秒後清除成功訊息（存下 timer id 以便卸載時清理）
    if (successTimer) clearTimeout(successTimer)
    successTimer = window.setTimeout(() => {
      successMessage.value = ''
    }, 5000)
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      log.error('Contact form submission error:', error)
    }

    // 追蹤表單提交失敗 (GA4)
    trackContactFormSubmit(false)

    // 類型檢查：確認 error 是 axios error 結構
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as {
        response?: { data?: { errors?: Record<string, string[]>; message?: string } }
      }

      if (axiosError.response?.data?.errors) {
        // Laravel 驗證錯誤
        const backendErrors = axiosError.response.data.errors
        let matched = false
        Object.keys(backendErrors).forEach((key) => {
          if (key in errors) {
            errors[key as keyof typeof errors] = backendErrors[key]?.[0] || ''
            matched = true
          }
        })
        // 若回傳的驗證錯誤沒有任何欄位對應到前端表單，仍顯示總體錯誤訊息避免靜默無回饋
        if (!matched) {
          errorMessage.value = axiosError.response?.data?.message || '訊息送出失敗,請稍後再試'
        }
      } else {
        errorMessage.value = axiosError.response?.data?.message || '訊息送出失敗,請稍後再試'
      }
    } else {
      errorMessage.value = '訊息送出失敗,請稍後再試'
    }
  } finally {
    loading.value = false
  }
}

onUnmounted(() => {
  if (successTimer) clearTimeout(successTimer)
})
</script>

<style scoped>
.contact-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
  position: relative;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: var(--pearl);
  margin-bottom: 0.75rem;
  font-size: 0.875rem;
  letter-spacing: 1px;
}

.form-label svg {
  color: var(--volt);
  flex-shrink: 0;
}

.required {
  color: #e74c3c;
}

.optional {
  font-size: 0.75rem;
  color: var(--text-muted);
  font-weight: 400;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 1rem 1.25rem;
  border: 1px solid rgba(225, 193, 110, 0.25);
  border-radius: 4px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.3s ease;
  background: rgba(16, 12, 10, 0.8);
  color: var(--pearl);
}

.form-input::placeholder,
.form-textarea::placeholder {
  color: var(--text-muted);
  opacity: 0.7;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: var(--volt);
  box-shadow:
    0 0 0 3px rgba(225, 193, 110, 0.15),
    0 0 20px rgba(225, 193, 110, 0.1);
  background: rgba(16, 12, 10, 0.9);
}

.form-input.error,
.form-textarea.error {
  border-color: #e74c3c;
}

.form-input:disabled,
.form-textarea:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.error-message {
  display: block;
  color: #e74c3c;
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
}

.char-count.warning {
  color: #e67e22;
  font-weight: 600;
}

.alert {
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
  font-size: 0.875rem;
}

.alert-success {
  background: rgba(39, 174, 96, 0.15);
  color: #27ae60;
  border: 1px solid rgba(39, 174, 96, 0.3);
}

.alert-error {
  background: rgba(231, 76, 60, 0.15);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.submit-btn {
  width: 100%;
  padding: 1rem 2rem;
  background: var(--volt);
  color: var(--ink);
  border: none;
  border-radius: 50px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(225, 193, 110, 0.3);
}

.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-btn.loading {
  background: var(--text-muted);
}

.spin-icon {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .contact-form {
    max-width: 100%;
  }

  .form-input,
  .form-textarea {
    font-size: 0.875rem;
    padding: 0.875rem 1rem;
  }

  .submit-btn {
    padding: 0.875rem 1.5rem;
    font-size: 0.875rem;
  }
}
</style>
