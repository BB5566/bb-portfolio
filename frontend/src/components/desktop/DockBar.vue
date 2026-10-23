<template>
  <nav class="dock" aria-label="應用程式 Dock">
    <ul class="dock__list">
      <li v-for="app in DOCK_APPS" :key="app.id" class="dock__item">
        <button
          type="button"
          class="dock__btn"
          :class="{ 'dock__btn--bounce': bouncingId === app.id }"
          :aria-label="app.title"
          :aria-pressed="desktop.isOpen(app.id)"
          @click="onClick(app)"
        >
          <span class="dock__icon" :style="{ background: app.tint, color: app.iconColor }">
            <component :is="app.icon" :size="26" :stroke-width="1.6" aria-hidden="true" />
          </span>
          <span class="dock__tooltip">{{ isMobile && app.mobileTitle ? app.mobileTitle : app.title }}</span>
        </button>
        <span class="dock__dot" :class="{ 'dock__dot--on': desktop.isOpen(app.id) }" />
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useDesktopStore } from '@/stores/desktop'
import { useIsMobile } from '@/composables/useIsMobile'
import { DOCK_APPS, type DesktopApp } from './apps'

const desktop = useDesktopStore()
const isMobile = useIsMobile()

// 開啟 / 還原時讓圖示彈跳一下
const bouncingId = ref<string | null>(null)
let bounceTimer: ReturnType<typeof setTimeout> | null = null

const onClick = (app: DesktopApp) => {
  const wasHidden = !desktop.isOpen(app.id) || desktop.find(app.id)?.minimized
  desktop.toggle(app.id, { width: app.width, height: app.height })

  if (wasHidden) {
    bouncingId.value = app.id
    if (bounceTimer) clearTimeout(bounceTimer)
    bounceTimer = setTimeout(() => (bouncingId.value = null), 600)
  }
}

onUnmounted(() => {
  if (bounceTimer) clearTimeout(bounceTimer)
})
</script>

<style scoped>
.dock {
  position: absolute;
  bottom: 0.75rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 8000;
  padding: 0.5rem 0.6rem 0.3rem;
  background: var(--os-chrome);
  backdrop-filter: var(--os-blur);
  -webkit-backdrop-filter: var(--os-blur);
  border: 1px solid var(--os-chrome-border);
  border-radius: 18px;
  box-shadow: var(--os-shadow);
}

.dock__list {
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.dock__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
}

.dock__btn {
  position: relative;
  display: block;
  padding: 0;
  background: none;
  border: none;
  border-radius: var(--radius-lg);
  transform-origin: bottom center;
  transition: transform 0.22s var(--ease-spring);
}

.dock__btn:focus-visible {
  outline: 2px solid var(--volt);
  outline-offset: 4px;
}

.dock__btn:active {
  transform: scale(0.92);
}

/* macOS 風格：hover 放大自身，鄰居次級放大 */
.dock__btn:hover {
  transform: scale(1.35) translateY(-6px);
}

.dock__item:has(.dock__btn:hover) + .dock__item .dock__btn,
.dock__item:has(+ .dock__item .dock__btn:hover) .dock__btn {
  transform: scale(1.15) translateY(-2px);
}

.dock__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  color: rgba(16, 12, 10, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    0 4px 10px rgba(0, 0, 0, 0.4);
}

.dock__tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) scale(0.9);
  padding: 0.35rem 0.75rem;
  white-space: nowrap;
  background: rgba(15, 15, 15, 0.95);
  border: 1px solid var(--os-chrome-border);
  border-radius: 6px;
  color: var(--pearl, #fff);
  font-weight: 500;
  font-size: 0.75rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.dock__btn:hover .dock__tooltip,
.dock__btn:focus-visible .dock__tooltip {
  opacity: 1;
  transform: translateX(-50%) scale(1);
}

.dock__dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: transparent;
  transition: background 0.2s ease;
}

.dock__dot--on {
  background: var(--volt);
}

.dock__btn--bounce {
  animation: dock-bounce 0.6s var(--ease-spring);
}

@keyframes dock-bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  35% {
    transform: translateY(-18px);
  }
  60% {
    transform: translateY(-4px);
  }
}

@media (max-width: 768px) {
  .dock {
    bottom: 0.5rem;
    border-radius: 16px;
    padding: 0.5rem 0.5rem 0.2rem;
    width: 95%;
    overflow-x: auto;
    /* hide scrollbar */
    -ms-overflow-style: none;
    scrollbar-width: none;
  }

  .dock::-webkit-scrollbar {
    display: none;
  }

  .dock__list {
    gap: 0.5rem;
    padding-bottom: 0.1rem;
  }

  .dock__item {
    flex-shrink: 0;
  }

  .dock__btn {
    min-width: 48px;
    min-height: 48px;
  }

  .dock__icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
  }

  .dock__btn:hover {
    transform: none;
  }

  .dock__tooltip {
    display: block;
    position: static;
    transform: none;
    opacity: 1;
    padding: 0;
    background: transparent;
    border: none;
    color: var(--text);
    font-weight: normal;
    box-shadow: none;
    font-size: 0.65rem;
    margin-top: 0.2rem;
    white-space: nowrap;
    overflow: visible;
    text-align: center;
    line-height: 1.2;
    width: 48px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .dock__btn,
  .dock__btn:hover {
    transform: none;
    animation: none;
  }
}
</style>
