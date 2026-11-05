<template>
  <main class="not-found-container" id="main-content">
    <div class="not-found-content">
      <!-- 404 數字 -->
      <div class="error-code" aria-hidden="true">
        <span class="digit">4</span>
        <span class="digit">0</span>
        <span class="digit">4</span>
      </div>

      <!-- 錯誤訊息 -->
      <h1 class="error-title">找不到頁面</h1>
      <p class="error-description">抱歉，您訪問的頁面不存在或已被移除</p>

      <!-- 按鈕 -->
      <div class="action-buttons">
        <router-link to="/" class="btn btn-primary">
          <LucideIcon name="House" :size="16" aria-hidden="true" />
          回到首頁
        </router-link>
        <button type="button" @click="goBack" class="btn btn-secondary">
          <LucideIcon name="ArrowLeft" :size="16" aria-hidden="true" />
          返回上頁
        </button>
      </div>

      <!-- 裝飾圓圈 -->
      <div class="decoration-circle circle-1" aria-hidden="true"></div>
      <div class="decoration-circle circle-2" aria-hidden="true"></div>
      <div class="decoration-circle circle-3" aria-hidden="true"></div>
    </div>
  </main>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import LucideIcon from '@/components/LucideIcon'

const router = useRouter()

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style scoped>
.not-found-container {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg);
  position: relative;
  overflow: hidden;
  padding: 2rem;
}

.not-found-content {
  text-align: center;
  position: relative;
  z-index: 2;
  max-width: 600px;
}

/* 404 數字 */
.error-code {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 2rem;
}

.digit {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(6rem, 15vw, 10rem);
  font-weight: 900;
  color: var(--volt);
  text-shadow: 0 4px 20px rgba(225, 193, 110, 0.3);
  animation: bounce 2s ease-in-out infinite;
}

.digit:nth-child(1) {
  animation-delay: 0s;
}
.digit:nth-child(2) {
  animation-delay: 0.2s;
}
.digit:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

/* 錯誤訊息 */
.error-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2rem, 5vw, 3rem);
  color: var(--pearl);
  margin-bottom: 1rem;
  letter-spacing: 4px;
  animation: fadeIn 0.8s ease-out 0.3s both;
}

.error-description {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(1rem, 3vw, 1.2rem);
  color: var(--text-muted);
  margin-bottom: 3rem;
  line-height: 1.6;
  animation: fadeIn 0.8s ease-out 0.5s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按鈕 */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeIn 0.8s ease-out 0.7s both;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  min-height: 48px;
}

.btn:focus-visible {
  outline: 2px solid var(--volt);
  outline-offset: 4px;
}

.btn:active {
  transform: translateY(-1px) scale(0.98);
}

.btn-primary {
  background: var(--volt);
  color: var(--ink);
  box-shadow: 0 0 20px rgba(225, 193, 110, 0.3);
}

.btn-primary:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(225, 193, 110, 0.4);
}

.btn-secondary {
  background: transparent;
  color: var(--pearl);
  border: 1px solid rgba(225, 193, 110, 0.3);
}

.btn-secondary:hover {
  background: rgba(225, 193, 110, 0.1);
  border-color: var(--volt);
  transform: translateY(-4px);
}

/* 裝飾 */
.decoration-circle {
  position: absolute;
  border-radius: 50%;
  background: var(--volt);
  opacity: 0.05;
  animation: float 6s ease-in-out infinite;
}

.circle-1 {
  width: 300px;
  height: 300px;
  top: 10%;
  left: 10%;
}
.circle-2 {
  width: 200px;
  height: 200px;
  bottom: 15%;
  right: 15%;
  animation-delay: 2s;
}
.circle-3 {
  width: 150px;
  height: 150px;
  top: 60%;
  left: 20%;
  animation-delay: 4s;
}

@keyframes float {
  0%,
  100% {
    transform: translate(0, 0) scale(1);
  }
  33% {
    transform: translate(30px, -30px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@media (max-width: 768px) {
  .not-found-container {
    padding: 1rem;
  }
  .action-buttons {
    flex-direction: column;
    width: 100%;
  }
  .btn {
    width: 100%;
    justify-content: center;
  }
  .decoration-circle {
    display: none;
  }
}
</style>
