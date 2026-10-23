<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import LoadingSpinner from '@/components/LoadingSpinner.vue'
import ErrorBoundary from '@/components/ErrorBoundary.vue'
import CustomCursor from '@/components/CustomCursor.vue'
import GlobalBackground from '@/components/GlobalBackground.vue'

// 自訂游標只在前台顯示；後台 admin 用原生游標，避免雙游標
const route = useRoute()
const showCustomCursor = computed(() => !route.path.startsWith('/admin'))

// 頁面滾動進度條
const scrollProgress = ref(0)

const updateScrollProgress = () => {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  scrollProgress.value = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
}

onMounted(() => {
  // GSAP 與 ScrollTrigger 由各動畫元件在自己的 onMounted 內 registerPlugin，
  // 此處不再重複動態載入（gsap 已隨首屏元件靜態打包，原 dynamic import 無實際效果）
  document.documentElement.setAttribute('data-theme', 'dark')
  window.addEventListener('scroll', updateScrollProgress, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', updateScrollProgress)
})
</script>

<template>
  <div class="app">
    <a href="#main-content" class="skip-to-content">跳至主要內容</a>

    <!-- 頁面滾動進度條 -->
    <div
      class="scroll-progress-bar"
      :style="{ width: scrollProgress + '%' }"
      role="progressbar"
      :aria-valuenow="Math.round(scrollProgress)"
      aria-valuemin="0"
      aria-valuemax="100"
    />

    <GlobalBackground />
    <CustomCursor v-if="showCustomCursor" />
    <LoadingSpinner />
    <ErrorBoundary>
      <RouterView v-slot="{ Component, route: matchedRoute }">
        <Transition :name="(matchedRoute.meta.transition as string) || 'fade'" mode="out-in">
          <component :is="Component" :key="matchedRoute.path" />
        </Transition>
      </RouterView>
    </ErrorBoundary>
  </div>
</template>

<style>
/* ============================================
   APP-LEVEL STYLES
   Note: Core design system is in design-system.css
   ============================================ */

/* Skip to content - Accessibility */
.skip-to-content {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
  z-index: 99999;
  padding: 1rem 2rem;
  background: var(--volt);
  color: var(--ink);
  font-family: var(--font-mono);
  font-weight: 700;
  text-decoration: none;
  border-radius: 0 0 8px 0;
}

.skip-to-content:focus {
  position: fixed;
  left: 0;
  top: 0;
  width: auto;
  height: auto;
  outline: 2px solid var(--ink);
  outline-offset: -2px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

/* App Container */
.app {
  min-height: 100vh;
  min-height: 100dvh;
  position: relative;
}

/* 頁面滾動進度條 */
.scroll-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--volt), #c19a6b);
  z-index: 9999;
  transition: width 0.1s linear;
  box-shadow: 0 0 8px rgba(225, 193, 110, 0.5);
  pointer-events: none;
}

/* NProgress Styling */
#nprogress .bar {
  background: var(--volt) !important;
  height: 2px !important;
}

#nprogress .peg {
  box-shadow:
    0 0 10px var(--volt),
    0 0 5px var(--volt) !important;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from {
  opacity: 0;
  transform: scale(0.95);
}

.scale-leave-to {
  opacity: 0;
  transform: scale(1.05);
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }

  html {
    scroll-behavior: auto;
  }
}

/* Touch Device Cursor */
@media (hover: none) {
  body {
    cursor: auto;
  }
}
</style>
