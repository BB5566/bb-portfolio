<template>
  <header class="menubar" role="banner">
    <!-- 左側：系統選單 -->
    <div class="menubar__left">
      <div class="menubar__menu" ref="menuRef">
        <button
          class="menubar__logo"
          type="button"
          aria-haspopup="true"
          :aria-expanded="menuOpen"
          aria-label="系統選單"
          @click="menuOpen = !menuOpen"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
            <path
              d="M12 2 L21 12 L12 22 L3 12 Z"
              fill="currentColor"
              opacity="0.85"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linejoin="round"
            />
          </svg>
        </button>

        <Transition name="menu-drop">
          <ul v-if="menuOpen" class="menubar__dropdown" role="menu">
            <li role="none">
              <button role="menuitem" type="button" @click="pick('readme')">關於這台電腦</button>
            </li>
            <li class="menubar__sep" role="separator"></li>
            <li role="none">
              <button role="menuitem" type="button" @click="pick('profiler')">系統資訊…</button>
            </li>
            <li role="none">
              <button role="menuitem" type="button" @click="pick('mail')">傳送訊息…</button>
            </li>
            <li class="menubar__sep" role="separator"></li>
            <li role="none">
              <button role="menuitem" type="button" @click="closeAllWindows">關閉所有視窗</button>
            </li>
            <li role="none">
              <button role="menuitem" type="button" @click="restart">重新啟動…</button>
            </li>
          </ul>
        </Transition>
      </div>

      <span class="menubar__app">{{ activeAppName }}</span>
      <span class="menubar__item menubar__item--ghost">檔案</span>
      <span class="menubar__item menubar__item--ghost">編輯</span>
      <span class="menubar__item menubar__item--ghost">顯示方式</span>
    </div>

    <!-- 右側：純裝飾狀態列 -->
    <div class="menubar__right" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="15" height="15" class="menubar__glyph">
        <path
          d="M5 12.5a10 10 0 0 1 14 0M8 15.5a6 6 0 0 1 8 0M12 19h.01"
          fill="none"
          stroke="currentColor"
          stroke-width="1.8"
          stroke-linecap="round"
        />
      </svg>
      <svg viewBox="0 0 26 24" width="20" height="15" class="menubar__glyph">
        <rect
          x="2"
          y="8"
          width="18"
          height="9"
          rx="2.5"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        />
        <rect x="4" y="10" width="11.5" height="5" rx="1" fill="currentColor" />
        <path d="M22 11v3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <span class="menubar__clock">{{ clock }}</span>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useDesktopStore } from '@/stores/desktop'
import { getApp } from './apps'

const desktop = useDesktopStore()

const menuOpen = ref(false)
const menuRef = ref<HTMLElement | null>(null)

const activeAppName = computed(() => {
  const id = desktop.activeId
  return (id && getApp(id)?.menuName) || 'Finder'
})

// 時鐘：格式對齊 macOS 選單列（週 M月D日 HH:MM）
const clock = ref('')
const formatter = new Intl.DateTimeFormat('zh-TW', {
  weekday: 'short',
  month: 'numeric',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
})
let clockTimer: ReturnType<typeof setInterval> | null = null

const updateClock = () => {
  clock.value = formatter.format(new Date())
}

const pick = (appId: string) => {
  menuOpen.value = false
  const app = getApp(appId)
  desktop.open(appId, { width: app?.width, height: app?.height })
}

const closeAllWindows = () => {
  menuOpen.value = false
  desktop.closeAll()
}

const restart = () => {
  menuOpen.value = false
  window.location.reload()
}

const onDocumentClick = (e: MouseEvent) => {
  if (menuOpen.value && !menuRef.value?.contains(e.target as Node)) menuOpen.value = false
}

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') menuOpen.value = false
}

onMounted(() => {
  updateClock()
  clockTimer = setInterval(updateClock, 15000)
  document.addEventListener('click', onDocumentClick)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer)
  document.removeEventListener('click', onDocumentClick)
  document.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.menubar {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--os-menubar-h);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem;
  background: var(--os-chrome);
  backdrop-filter: var(--os-blur);
  -webkit-backdrop-filter: var(--os-blur);
  border-bottom: 1px solid var(--os-chrome-border);
  color: var(--text-secondary);
  font-family: var(--font-body);
  font-size: 0.8125rem;
  z-index: 9000;
  user-select: none;
}

.menubar__left,
.menubar__right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.menubar__right {
  gap: 0.85rem;
}

.menubar__menu {
  position: relative;
}

.menubar__logo {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  min-width: 26px;
  padding: 0.15rem 0.4rem;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--volt);
  transition:
    background 0.2s ease,
    transform 0.15s ease;
}

.menubar__logo:hover,
.menubar__logo:focus-visible,
.menubar__logo[aria-expanded='true'] {
  background: rgba(225, 193, 110, 0.18);
  outline: 2px solid var(--volt);
  outline-offset: 1px;
}

.menubar__logo:active {
  transform: scale(0.94);
  background: rgba(225, 193, 110, 0.26);
}

.menubar__app {
  font-weight: 700;
  color: var(--text);
  letter-spacing: 0.02em;
}

.menubar__item--ghost {
  color: var(--text-muted);
}

.menubar__dropdown {
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  min-width: 200px;
  margin: 0;
  padding: 0.35rem;
  list-style: none;
  background: var(--os-chrome-solid);
  border: 1px solid var(--os-chrome-border);
  border-radius: var(--os-radius);
  box-shadow: var(--os-shadow);
}

.menubar__dropdown button {
  width: 100%;
  padding: 0.45rem 0.7rem;
  text-align: left;
  background: none;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.8125rem;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.menubar__dropdown button:hover,
.menubar__dropdown button:focus-visible {
  background: var(--volt);
  color: var(--ink);
  outline: none;
}

.menubar__dropdown button:active {
  background: var(--primary-dark);
}

.menubar__sep {
  height: 1px;
  margin: 0.35rem 0.5rem;
  background: var(--os-chrome-border);
}

.menubar__glyph {
  color: var(--text-secondary);
}

.menubar__clock {
  font-variant-numeric: tabular-nums;
  color: var(--text);
}

.menu-drop-enter-active,
.menu-drop-leave-active {
  transition:
    opacity 0.16s ease,
    transform 0.16s ease;
  transform-origin: top left;
}

.menu-drop-enter-from,
.menu-drop-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}

@media (max-width: 768px) {
  .menubar {
    padding: 0 0.5rem;
  }

  .menubar__right {
    display: none;
  }

  .menubar__left {
    width: 100%;
    justify-content: space-between;
  }

  .menubar__menu {
    order: 2;
  }

  .menubar__app {
    display: block;
    order: 1;
  }

  .menubar__item--ghost {
    display: none;
  }

  .menubar__logo {
    min-height: 28px;
    min-width: 28px;
    padding: 0.25rem 0.5rem;
  }

  .menubar__dropdown {
    left: auto;
    right: 0;
  }
}
</style>
