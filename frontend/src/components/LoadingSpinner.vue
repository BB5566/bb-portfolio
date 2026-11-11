<template>
  <Transition name="fade">
    <div v-if="isLoading" class="loading-overlay" role="status" aria-live="polite">
      <!-- 紙色打樣：裁切線框住四色色票，依序套印 -->
      <div class="sheet">
        <i class="crop tl"></i>
        <i class="crop tr"></i>
        <i class="crop bl"></i>
        <i class="crop br"></i>
        <div class="swatches" aria-hidden="true">
          <span class="c"></span>
          <span class="m"></span>
          <span class="y"></span>
          <span class="k"></span>
        </div>
      </div>
      <p class="loading-text">打樣中</p>
      <p class="loading-url">BB-MADE.COM</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)

// 導頁超過 SHOW_AFTER 才顯示開機畫面，快的導頁不閃；結束後 HIDE_AFTER 收掉。
// 原本固定多等 500ms，首屏 LCP 白白晚半秒。
const SHOW_AFTER = 120
const HIDE_AFTER = 150
let showTimer: ReturnType<typeof setTimeout> | null = null

router.beforeEach((to, from, next) => {
  if (showTimer) clearTimeout(showTimer)
  showTimer = setTimeout(() => {
    isLoading.value = true
  }, SHOW_AFTER)
  next()
})

router.afterEach(() => {
  if (showTimer) clearTimeout(showTimer)
  showTimer = null
  setTimeout(() => {
    isLoading.value = false
  }, HIDE_AFTER)
})
</script>

<style scoped>
/* 顏色寫死：載入畫面在 .proof-page 外面，拿不到打樣頁的色票變數 */
.loading-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  background: #f5f1e9;
  color: #15161a;
}

.sheet {
  position: relative;
  padding: 26px 30px;
}

.crop {
  position: absolute;
  width: 14px;
  height: 14px;
  border: 0 solid #15161a;
}

.crop.tl {
  top: 0;
  left: 0;
  border-width: 1.5px 0 0 1.5px;
}

.crop.tr {
  top: 0;
  right: 0;
  border-width: 1.5px 1.5px 0 0;
}

.crop.bl {
  bottom: 0;
  left: 0;
  border-width: 0 0 1.5px 1.5px;
}

.crop.br {
  right: 0;
  bottom: 0;
  border-width: 0 1.5px 1.5px 0;
}

.swatches {
  display: flex;
  gap: 6px;
}

.swatches span {
  width: 22px;
  height: 22px;
  animation: ink 1.2s ease-in-out infinite;
}

.swatches .c {
  background: #00aeef;
}

.swatches .m {
  background: #ec008c;
  animation-delay: 0.15s;
}

.swatches .y {
  background: #fff100;
  animation-delay: 0.3s;
}

.swatches .k {
  background: #231f20;
  animation-delay: 0.45s;
}

/* 一格一格上墨 */
@keyframes ink {
  0%,
  100% {
    opacity: 0.25;
    transform: translateY(0);
  }
  40% {
    opacity: 1;
    transform: translateY(-4px);
  }
}

.loading-text {
  margin: 0;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.3em;
}

.loading-text::after {
  content: '…';
}

.loading-url {
  margin: 0;
  font-family: 'JetBrains Mono', Menlo, monospace;
  font-size: 11px;
  letter-spacing: 0.3em;
  color: #8a8578;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .swatches span {
    animation: none;
    opacity: 1;
  }
}
</style>
