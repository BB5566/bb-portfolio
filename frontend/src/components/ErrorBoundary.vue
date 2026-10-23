<template>
  <div v-if="hasError" class="error-boundary">
    <div class="error-container">
      <div class="error-icon">
        <LucideIcon name="AlertTriangle" :size="64" />
      </div>
      <h2 class="error-title">哎呀！出了點問題</h2>
      <p class="error-message">{{ errorMessage }}</p>
      <div class="error-actions">
        <button @click="handleReset" class="btn btn-primary">
          <LucideIcon name="RotateCcw" :size="16" />
          重試
        </button>
        <button @click="goHome" class="btn btn-secondary">
          <LucideIcon name="House" :size="16" />
          回首頁
        </button>
      </div>
      <details v-if="isDev" class="error-details">
        <summary>錯誤詳情（開發模式）</summary>
        <pre>{{ errorStack }}</pre>
      </details>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, onErrorCaptured } from 'vue'
import { useRouter } from 'vue-router'
import LucideIcon from '@/components/LucideIcon'

const router = useRouter()
const hasError = ref(false)
const errorMessage = ref('')
const errorStack = ref('')
const isDev = import.meta.env.DEV

// 捕獲子組件錯誤
onErrorCaptured((err: Error, instance, info) => {
  hasError.value = true
  errorMessage.value = err.message || '發生未知錯誤'
  errorStack.value = err.stack || ''

  // 在開發模式下輸出錯誤
  if (isDev) {
    log.error('ErrorBoundary caught:', err)
    log.error('Component:', instance)
    log.error('Error info:', info)
  }

  // 防止錯誤繼續向上傳播
  return false
})

const handleReset = () => {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
  // 可選：重新載入當前路由
  router.go(0)
}

const goHome = () => {
  hasError.value = false
  errorMessage.value = ''
  errorStack.value = ''
  router.push('/')
}
</script>

<style scoped>
.error-boundary {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  padding: var(--space-lg);
}

.error-container {
  background: var(--surface);
  border: 1px solid rgba(225, 193, 110, 0.2);
  padding: var(--space-2xl);
  max-width: 500px;
  width: 100%;
  text-align: center;
}

.error-icon {
  color: var(--volt);
  margin-bottom: var(--space-lg);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.error-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  color: var(--pearl);
  margin-bottom: var(--space-md);
  letter-spacing: 2px;
}

.error-message {
  font-family: 'DM Sans', sans-serif;
  color: var(--text-muted);
  margin-bottom: var(--space-xl);
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
  flex-wrap: wrap;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-xs);
  padding: 0.875rem 1.5rem;
  border-radius: 50px;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: var(--volt);
  color: var(--ink);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(225, 193, 110, 0.3);
}

.btn-secondary {
  background: transparent;
  color: var(--pearl);
  border: 1px solid rgba(225, 193, 110, 0.3);
}

.btn-secondary:hover {
  background: rgba(225, 193, 110, 0.1);
  border-color: var(--volt);
}

.error-details {
  margin-top: var(--space-xl);
  text-align: left;
  background: rgba(16, 12, 10, 0.6);
  padding: var(--space-md);
  border: 1px solid rgba(225, 193, 110, 0.1);
}

.error-details summary {
  cursor: pointer;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  color: var(--volt);
  margin-bottom: var(--space-sm);
  font-size: 0.875rem;
}

.error-details pre {
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: #ef4444;
  white-space: pre-wrap;
  word-break: break-word;
}

@media (max-width: 480px) {
  .error-container {
    padding: var(--space-lg);
  }
  .error-icon svg {
    width: 48px;
    height: 48px;
  }
  .error-actions {
    flex-direction: column;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
