<template>
  <Transition name="fade">
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-container">
        <!-- Dune-style geometric loader -->
        <div class="loader-frame">
          <div class="frame-corner tl"></div>
          <div class="frame-corner tr"></div>
          <div class="frame-corner bl"></div>
          <div class="frame-corner br"></div>

          <!-- Inner rotating element -->
          <div class="loader-inner">
            <div class="loader-diamond"></div>
          </div>

          <!-- Orbiting dots -->
          <div class="loader-orbit">
            <span class="orbit-dot"></span>
            <span class="orbit-dot"></span>
            <span class="orbit-dot"></span>
          </div>
        </div>

        <!-- Brand name -->
        <div class="loader-brand">
          <span
            class="brand-letter"
            v-for="(letter, i) in 'BOBTSOU'"
            :key="i"
            :style="{ animationDelay: `${i * 0.1}s` }"
          >
            {{ letter }}
          </span>
        </div>

        <!-- Status text -->
        <p class="loading-text">
          <span class="status-dot"></span>
          INITIALIZING SYSTEM
        </p>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const isLoading = ref(false)

// 監聽路由變化顯示載入動畫
router.beforeEach((to, from, next) => {
  isLoading.value = true
  next()
})

router.afterEach(() => {
  setTimeout(() => {
    isLoading.value = false
  }, 500)
})
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  inset: 0;
  background: var(--ink);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

/* Loader Frame */
.loader-frame {
  width: 100px;
  height: 100px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.frame-corner {
  position: absolute;
  width: 20px;
  height: 20px;
  border-color: var(--volt);
  border-style: solid;
  opacity: 0.6;
}

.frame-corner.tl {
  top: 0;
  left: 0;
  border-width: 2px 0 0 2px;
}
.frame-corner.tr {
  top: 0;
  right: 0;
  border-width: 2px 2px 0 0;
}
.frame-corner.bl {
  bottom: 0;
  left: 0;
  border-width: 0 0 2px 2px;
}
.frame-corner.br {
  bottom: 0;
  right: 0;
  border-width: 0 2px 2px 0;
}

/* Inner diamond */
.loader-inner {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: rotate-slow 4s linear infinite;
}

.loader-diamond {
  width: 30px;
  height: 30px;
  background: transparent;
  border: 2px solid var(--ibad-blue);
  transform: rotate(45deg);
  box-shadow:
    0 0 20px rgba(0, 164, 204, 0.5),
    inset 0 0 15px rgba(0, 164, 204, 0.2);
  animation: pulse-diamond 2s ease-in-out infinite;
}

@keyframes rotate-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes pulse-diamond {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(0, 164, 204, 0.5),
      inset 0 0 15px rgba(0, 164, 204, 0.2);
  }
  50% {
    box-shadow:
      0 0 40px rgba(0, 164, 204, 0.8),
      inset 0 0 25px rgba(0, 164, 204, 0.4);
  }
}

/* Orbiting dots */
.loader-orbit {
  position: absolute;
  width: 80px;
  height: 80px;
  animation: rotate-orbit 3s linear infinite;
}

.orbit-dot {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--volt);
  box-shadow: 0 0 10px var(--volt);
}

.orbit-dot:nth-child(1) {
  top: 0;
  left: 50%;
  transform: translateX(-50%);
}
.orbit-dot:nth-child(2) {
  bottom: 10px;
  left: 10px;
}
.orbit-dot:nth-child(3) {
  bottom: 10px;
  right: 10px;
}

@keyframes rotate-orbit {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(-360deg);
  }
}

/* Brand name */
.loader-brand {
  display: flex;
  gap: 0.15em;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  letter-spacing: 0.2em;
}

.brand-letter {
  color: var(--volt);
  opacity: 0;
  animation: letter-fade 1.4s ease-in-out infinite;
}

@keyframes letter-fade {
  0%,
  100% {
    opacity: 0.3;
    transform: translateY(0);
  }
  50% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

/* Loading text */
.loading-text {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  color: var(--text-muted);
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: var(--ibad-blue);
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.3;
  }
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
