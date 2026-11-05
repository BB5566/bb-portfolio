<template>
  <div class="login-container">
    <!-- Background Animation -->
    <div class="login-bg">
      <div class="bg-grid"></div>
      <div class="bg-particles"></div>
      <div class="bg-gradient"></div>
    </div>

    <!-- Login Card -->
    <div class="login-card">
      <!-- Logo Section -->
      <div class="login-header">
        <div class="logo-wrapper">
          <div class="logo-icon">
            <svg width="60" height="60" viewBox="0 0 60 60" fill="none">
              <path
                d="M30 5 L50 15 L50 35 L30 45 L10 35 L10 15 Z"
                stroke="currentColor"
                stroke-width="2"
                fill="none"
              />
              <circle cx="30" cy="25" r="8" fill="currentColor" />
            </svg>
          </div>
          <h1 class="logo-text">ADMIN PORTAL</h1>
        </div>
        <p class="login-subtitle">歡迎回來，請登入管理您的作品集</p>
      </div>

      <!-- Login Form -->
      <el-form
        ref="formRef"
        :model="loginForm"
        :rules="rules"
        class="login-form"
        @submit.prevent="handleSubmit"
      >
        <!-- Email Field -->
        <el-form-item prop="email" class="form-item">
          <div class="input-wrapper">
            <div class="input-icon">
              <LucideIcon name="Mail" :size="18" />
            </div>
            <el-input
              v-model="loginForm.email"
              placeholder="電子郵件"
              size="large"
              class="custom-input"
              @keyup.enter="handleSubmit"
            />
          </div>
        </el-form-item>

        <!-- Password Field -->
        <el-form-item prop="password" class="form-item">
          <div class="input-wrapper">
            <div class="input-icon">
              <LucideIcon name="Lock" :size="18" />
            </div>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="密碼"
              size="large"
              show-password
              class="custom-input"
              @keyup.enter="handleSubmit"
            />
          </div>
        </el-form-item>

        <!-- Remember Me -->
        <div class="form-options">
          <el-checkbox v-model="loginForm.remember" class="remember-checkbox">記住我</el-checkbox>
        </div>

        <!-- Submit Button -->
        <el-form-item class="form-submit">
          <button
            type="submit"
            class="submit-btn"
            :class="{ loading: isLoading }"
            :disabled="isLoading"
          >
            <span v-if="!isLoading" class="btn-text">
              <LucideIcon name="LogIn" :size="16" />
              登入系統
            </span>
            <span v-else class="btn-loading">
              <LucideIcon name="Loader2" :size="16" class="spin-icon" />
              驗證中...
            </span>
          </button>
        </el-form-item>

        <!-- Error Message -->
        <transition name="fade">
          <div v-if="errorMessage" class="error-message">
            <LucideIcon name="AlertCircle" :size="16" />
            {{ errorMessage }}
          </div>
        </transition>
      </el-form>

      <!-- Demo Credentials - 僅開發環境顯示 -->
      <div v-if="isDev" class="demo-info">
        <div class="demo-title">
          <LucideIcon name="Info" :size="16" />
          開發環境
        </div>
        <div class="demo-credentials">
          <div class="credential-item">
            <span class="label">Email:</span>
            <span class="value" @click="copyToClipboard('admin@bb-made.com')">
              admin@bb-made.com
              <LucideIcon name="Copy" :size="14" />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <p>&copy; {{ currentYear }} Bob Tsou Portfolio. All rights reserved.</p>
      <div class="footer-links">
        <a href="/" target="_blank" rel="noopener noreferrer">
          <LucideIcon name="House" :size="14" />
          返回首頁
        </a>
        <a href="https://github.com/BB5566" target="_blank" rel="noopener noreferrer">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
            <path
              d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
            />
          </svg>
          GitHub
        </a>
      </div>
    </div>

    <!-- Success Animation -->
    <transition name="success">
      <div v-if="showSuccess" class="success-overlay">
        <div class="success-content">
          <div class="success-icon">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="var(--volt, #e1c16e)"
                stroke-width="3"
                fill="none"
                class="circle-animation"
              />
              <path
                d="M30 50 L45 65 L70 35"
                stroke="var(--volt, #e1c16e)"
                stroke-width="4"
                fill="none"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="check-animation"
              />
            </svg>
          </div>
          <h2 class="success-title">登入成功！</h2>
          <p class="success-message">正在跳轉到管理後台...</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/admin/auth'
import {
  ElForm,
  ElFormItem,
  ElInput,
  ElCheckbox,
  ElMessage,
  type FormInstance,
  type FormRules
} from 'element-plus'
import gsap from 'gsap'
import LucideIcon from '@/components/LucideIcon'

const router = useRouter()
const authStore = useAuthStore()

// Refs
const formRef = ref<FormInstance>()

// Form Data
const loginForm = reactive({
  email: '',
  password: '',
  remember: false
})

// State
const isLoading = ref(false)
const errorMessage = ref('')
const showSuccess = ref(false)
// 成功後跳轉用的計時器，卸載時需清理
let redirectTimer: number | null = null
const isDev = import.meta.env.DEV
const currentYear = new Date().getFullYear()

// Validation Rules
const rules = reactive<FormRules>({
  email: [
    { required: true, message: '請輸入電子郵件', trigger: 'blur' },
    { type: 'email', message: '請輸入有效的電子郵件', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '請輸入密碼', trigger: 'blur' },
    { min: 6, message: '密碼至少需要6個字符', trigger: 'blur' }
  ]
})

// Methods
const handleSubmit = async () => {
  if (!formRef.value) return

  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  isLoading.value = true
  errorMessage.value = ''

  try {
    const success = await authStore.login(loginForm.email, loginForm.password)

    if (!success) {
      throw new Error('登入失敗，請檢查您的帳號密碼')
    }

    // Show success animation
    showSuccess.value = true

    // Play success sound
    playSuccessSound()

    // Redirect after animation；成功路徑保持 isLoading=true（按鈕維持 disabled），
    // 避免 1.5 秒跳轉空窗內按 Enter 再次送出第二次登入請求
    redirectTimer = window.setTimeout(() => {
      router.push('/admin')
    }, 1500)
  } catch (error: unknown) {
    const err = error as { message?: string }
    errorMessage.value = err.message || '登入失敗，請檢查您的帳號密碼'
    shakeForm()
    // 僅在失敗時恢復可再次提交
    isLoading.value = false
  }
}

onUnmounted(() => {
  if (redirectTimer) clearTimeout(redirectTimer)
})

// 移除快速登入功能以保護安全

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text)
  ElMessage.success('已複製到剪貼板')
}

const shakeForm = () => {
  gsap.to('.login-card', {
    keyframes: [{ x: 0 }, { x: -10 }, { x: 10 }, { x: -10 }, { x: 10 }, { x: 0 }],
    duration: 0.5,
    ease: 'power2.inOut'
  })
}

const playSuccessSound = () => {
  // Add sound effect if needed
  const audio = new Audio(
    'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLWiTYIG2m98OScTgwOUarm7blmFgU7k9n1unEiBC13yO/eizEIHWq+8+OWT'
  )
  audio.volume = 0.3
  audio.play().catch(() => {})
}

// Animations on mount
onMounted(() => {
  // Animate login card entrance
  gsap.from('.login-card', {
    opacity: 0,
    y: 50,
    duration: 0.8,
    ease: 'power3.out'
  })

  // Animate background elements
  gsap.to('.bg-gradient', {
    backgroundPosition: '100% 100%',
    duration: 20,
    repeat: -1,
    yoyo: true,
    ease: 'none'
  })

  // Particle animation
  createParticles()
})

const createParticles = () => {
  const container = document.querySelector('.bg-particles')
  if (!container) return

  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div')
    particle.className = 'particle'
    particle.style.left = `${Math.random() * 100}%`
    particle.style.animationDelay = `${Math.random() * 10}s`
    particle.style.animationDuration = `${10 + Math.random() * 20}s`
    container.appendChild(particle)
  }
}
</script>

<style scoped>
.login-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background: var(--bg, #100c0a);
  overflow: hidden;
}

/* Background Effects */
.login-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.bg-grid {
  position: absolute;
  width: 100%;
  height: 100%;
  background-image:
    linear-gradient(rgba(225, 193, 110, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(225, 193, 110, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: grid-move 10s linear infinite;
}

@keyframes grid-move {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(50px, 50px);
  }
}

.bg-particles {
  position: absolute;
  width: 100%;
  height: 100%;
}

:deep(.particle) {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #e1c16e;
  border-radius: 50%;
  opacity: 0;
  animation: float-up linear infinite;
}

@keyframes float-up {
  0% {
    opacity: 0;
    transform: translateY(100vh) scale(0);
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-100vh) scale(1);
  }
}

.bg-gradient {
  position: absolute;
  width: 200%;
  height: 200%;
  background:
    radial-gradient(circle at 20% 80%, rgba(225, 193, 110, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(201, 166, 108, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(184, 125, 86, 0.06) 0%, transparent 50%);
  background-size: 100% 100%;
}

/* Login Card */
.login-card {
  position: relative;
  width: 100%;
  max-width: 480px;
  background: rgba(26, 26, 26, 0.95);
  backdrop-filter: blur(20px);
  border: 2px solid #2b2b2b;
  padding: 3rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  z-index: 1;
}

/* Logo Section */
.login-header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.logo-icon {
  color: var(--volt, #e1c16e);
  animation: rotate 20s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.logo-text {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  color: #ffffff;
  letter-spacing: 3px;
  margin: 0;
}

.login-subtitle {
  color: #999;
  font-size: 0.9rem;
  margin: 0;
}

/* Form Styles */
.login-form {
  margin-bottom: 2rem;
}

.form-item {
  margin-bottom: 1.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  z-index: 1;
  display: flex;
  align-items: center;
}

:deep(.el-input) {
  .el-input__wrapper {
    background: rgba(255, 255, 255, 0.05);
    border: 2px solid #2b2b2b;
    box-shadow: none;
    padding-left: 3rem;
    transition: all 0.3s ease;

    &:hover {
      border-color: #404040;
    }

    &.is-focus {
      border-color: var(--volt, #e1c16e);
      background: rgba(201, 255, 0, 0.05);
    }
  }

  .el-input__inner {
    color: #ffffff;
    font-size: 1rem;
    height: 50px;

    &::placeholder {
      color: #666;
    }
  }

  .el-input__suffix {
    color: #666;
  }
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-checkbox {
  :deep(.el-checkbox__label) {
    color: #999;
  }

  :deep(.el-checkbox__input.is-checked) {
    .el-checkbox__inner {
      background-color: var(--volt, #e1c16e);
      border-color: var(--volt, #e1c16e);
    }
  }
}

/* Submit Button */
.form-submit {
  margin-bottom: 0;
}

.submit-btn {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, var(--volt, #e1c16e) 0%, #c9a86c 100%);
  border: none;
  color: var(--ink, #100c0a);
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
  gap: 0.5rem;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(201, 255, 0, 0.3);

    &::before {
      left: 100%;
    }
  }

  &:active:not(:disabled) {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.btn-text,
.btn-loading {
  display: flex;
  align-items: center;
  gap: 0.5rem;
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

/* Error Message */
.error-message {
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  color: #ff6b6b;
  padding: 1rem;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-top: 1rem;
}

/* Demo Info */
.demo-info {
  background: rgba(201, 255, 0, 0.05);
  border: 2px solid rgba(201, 255, 0, 0.2);
  padding: 1.5rem;
  border-radius: 4px;
}

.demo-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--volt, #e1c16e);
  font-weight: 600;
  margin-bottom: 1rem;
}

.demo-credentials {
  margin-bottom: 1rem;
}

.credential-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.9rem;
}

.credential-item .label {
  color: #999;
  min-width: 80px;
}

.credential-item .value {
  color: #ffffff;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: color 0.3s ease;

  &:hover {
    color: var(--volt, #e1c16e);
  }

  i {
    font-size: 0.8rem;
    opacity: 0.5;
  }
}

.quick-login-btn {
  width: 100%;
  padding: 0.75rem;
  background: transparent;
  border: 2px solid var(--volt, #e1c16e);
  color: var(--volt, #e1c16e);
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background: var(--volt, #e1c16e);
    color: var(--ink, #100c0a);
  }
}

/* Footer */
.login-footer {
  position: fixed;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  color: #666;
  font-size: 0.85rem;
  z-index: 1;
}

.footer-links {
  display: flex;
  gap: 2rem;
  justify-content: center;
  margin-top: 0.5rem;

  a {
    color: #999;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    transition: color 0.3s ease;

    &:hover {
      color: var(--volt, #e1c16e);
    }
  }
}

/* Success Overlay */
.success-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(10, 10, 10, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}

.success-content {
  text-align: center;
}

.success-icon {
  margin-bottom: 1.5rem;
}

.circle-animation {
  stroke-dasharray: 283;
  stroke-dashoffset: 283;
  animation: circle-draw 0.6s ease-out forwards;
}

.check-animation {
  stroke-dasharray: 100;
  stroke-dashoffset: 100;
  animation: check-draw 0.4s ease-out 0.4s forwards;
}

@keyframes circle-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes check-draw {
  to {
    stroke-dashoffset: 0;
  }
}

.success-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2.5rem;
  color: var(--volt, #e1c16e);
  margin-bottom: 0.5rem;
}

.success-message {
  color: #999;
  font-size: 1rem;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.success-enter-active,
.success-leave-active {
  transition: all 0.3s ease;
}

.success-enter-from,
.success-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 480px) {
  .login-card {
    padding: 2rem;
  }

  .logo-text {
    font-size: 1.5rem;
  }

  .credential-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }
}
</style>
