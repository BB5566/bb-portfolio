<template>
  <div class="desktop" :class="{ 'desktop--mobile': isMobile }">
    <DesktopWallpaper v-if="!prefersReducedMotion && !isMobile" />
    <div v-else class="desktop__static-wallpaper" aria-hidden="true" />

    <MenuBar />

    <!-- 桌面檔案（手機版隱藏，只留 Dock + 全螢幕視窗） -->
    <ul class="desktop__files" aria-label="桌面檔案">
      <li v-for="file in desktopFiles" :key="file.id">
        <component
          :is="file.href ? 'a' : 'button'"
          class="desktop__file"
          :type="file.href ? undefined : 'button'"
          :href="file.href"
          :target="file.href ? '_blank' : undefined"
          :rel="file.href ? 'noopener noreferrer' : undefined"
          @click="file.action?.()"
        >
          <span class="desktop__file-icon">
            <component :is="file.icon" :size="26" :stroke-width="1.5" aria-hidden="true" />
          </span>
          <span class="desktop__file-name">{{ file.label }}</span>
        </component>
      </li>
    </ul>

    <!-- 視窗層 -->
    <TransitionGroup
      tag="div"
      class="desktop__windows"
      :css="false"
      @enter="onWindowEnter"
      @leave="onWindowLeave"
    >
      <AppWindow
        v-for="win in desktop.windows"
        :key="win.id"
        :win="win"
        :app="appOf(win.id)"
        :is-mobile="isMobile"
      >
        <Suspense>
          <component :is="appOf(win.id).component" />
          <template #fallback>
            <div class="desktop__loading">載入中…</div>
          </template>
        </Suspense>
      </AppWindow>
    </TransitionGroup>

    <!-- 3D avatar：只在 Chat 開啟時掛載，three.js 才會被 lazy load -->
    <DesktopAvatar v-if="showAvatar" @activate="desktop.focus('chat')" />

    <!-- 沒有開啟視窗時的引導提示 -->
    <Transition name="hint">
      <p v-if="desktop.windows.length === 0" class="desktop__hint">
        點擊下方 Dock 開始瀏覽
        <span class="desktop__hint-arrow">↓</span>
      </p>
    </Transition>

    <DockBar />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref } from 'vue'
import gsap from 'gsap'
import { FileText, Folder, FileDown } from 'lucide-vue-next'
import MenuBar from './MenuBar.vue'
import DockBar from './DockBar.vue'
import AppWindow from './AppWindow.vue'
import { APPS, getApp, type DesktopApp } from './apps'
import { useDesktopStore } from '@/stores/desktop'
import { useProfileStore } from '@/stores/profile'
import { useIsMobile } from '@/composables/useIsMobile'

// tsparticles 為非同步註冊的全域元件，延後掛載避免首次解析不到
const DesktopWallpaper = defineAsyncComponent({
  loader: () => import('./DesktopWallpaper.vue'),
  delay: 200
})

// three.js 只在使用者開啟 Chat 後才進 bundle，首屏 Lighthouse 不受影響
const DesktopAvatar = defineAsyncComponent(() => import('./DesktopAvatar.vue'))

const desktop = useDesktopStore()
const profileStore = useProfileStore()
const isMobile = useIsMobile()
const prefersReducedMotion = ref(
  typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false
)

const fallbackApp = APPS[0] as DesktopApp
const appOf = (id: string): DesktopApp => getApp(id) ?? fallbackApp

// Chat 開著 + 非手機 + 未要求減少動態效果，才顯示 3D avatar
const showAvatar = computed(
  () => desktop.isOpen('chat') && !isMobile.value && !prefersReducedMotion.value
)

const openApp = (id: string) => {
  const app = getApp(id)
  desktop.open(id, { width: app?.width, height: app?.height })
}

const desktopFiles = computed(() => {
  const files: Array<{
    id: string
    label: string
    icon: typeof FileText
    action?: () => void
    href?: string
  }> = [
    { id: 'readme', label: 'README.md', icon: FileText, action: () => openApp('readme') },
    { id: 'projects', label: 'Projects', icon: Folder, action: () => openApp('finder') }
  ]

  const resume = profileStore.profile?.resume_url
  if (resume) files.push({ id: 'resume', label: 'resume.pdf', icon: FileDown, href: resume })

  return files
})

// ==========================================
// 視窗開關動畫（GSAP scale + fade）
// ==========================================
const onWindowEnter = (el: Element, done: () => void) => {
  if (prefersReducedMotion.value) return done()
  gsap.fromTo(
    el,
    { scale: 0.9, opacity: 0, y: 18 },
    { scale: 1, opacity: 1, y: 0, duration: 0.32, ease: 'back.out(1.5)', onComplete: done }
  )
}

const onWindowLeave = (el: Element, done: () => void) => {
  if (prefersReducedMotion.value) return done()
  gsap.to(el, {
    scale: 0.92,
    opacity: 0,
    y: 10,
    duration: 0.2,
    ease: 'power2.in',
    onComplete: done
  })
}

// Esc 關閉最上層視窗
const onKeydown = (e: KeyboardEvent) => {
  if (e.key !== 'Escape' || !desktop.activeId) return
  const target = e.target as HTMLElement | null
  if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return
  desktop.close(desktop.activeId)
}

onMounted(() => {
  prefersReducedMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.body.classList.add('desktop-os-active')
  window.addEventListener('keydown', onKeydown)

  // 延遲開啟 README (降低首次進入網站探索門檻)
  setTimeout(() => {
    if (desktop.windows.length === 0) {
      openApp('readme')
    }
  }, 400)
})

onUnmounted(() => {
  document.body.classList.remove('desktop-os-active')
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.desktop {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: var(--ink);
}

.desktop__static-wallpaper {
  position: absolute;
  inset: 0;
  /* Linear-grade cool dark wallpaper — near-black with subtle cool glow */
  background:
    radial-gradient(900px 500px at 78% 20%, rgba(94, 106, 210, 0.06), transparent 65%),
    radial-gradient(700px 400px at 15% 85%, rgba(16, 185, 129, 0.03), transparent 60%),
    linear-gradient(170deg, #08090a 0%, #0b0c0d 45%, #0f1011 100%);
}

.desktop__windows {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.desktop__windows > * {
  pointer-events: auto;
}

.desktop__loading {
  padding: 2rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.875rem;
}

/* === 桌面檔案 === */
.desktop__files {
  position: absolute;
  top: calc(var(--os-menubar-h) + 1rem);
  left: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
  /* 必須低於視窗（視窗 z-index 由 store 從 11 起算），否則會蓋在最大化視窗上 */
  z-index: 1;
}

.desktop__file {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  width: 88px;
  padding: 0.5rem 0.25rem;
  background: none;
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.15s ease;
}

.desktop__file:hover,
.desktop__file:focus-visible {
  background: rgba(225, 193, 110, 0.12);
  border-color: rgba(225, 193, 110, 0.28);
}

.desktop__file:active {
  transform: scale(0.96);
  background: rgba(225, 193, 110, 0.2);
}

.desktop__file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 10px;
  background: linear-gradient(160deg, rgba(240, 230, 210, 0.92), rgba(179, 170, 150, 0.85));
  color: rgba(16, 12, 10, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.35);
}

.desktop__file-name {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  text-align: center;
  word-break: break-all;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.8);
}

/* === 引導提示 === */
.desktop__hint {
  position: absolute;
  left: 50%;
  bottom: calc(var(--os-dock-h) + 1.5rem);
  transform: translateX(-50%);
  margin: 0;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 1rem;
  letter-spacing: 0.08em;
  pointer-events: none;
  text-align: center;
  white-space: nowrap;
}

.desktop__hint-arrow {
  display: block;
  margin-top: 0.35rem;
  color: var(--volt);
  font-size: 1.2rem;
  animation: hint-bob 1.8s ease-in-out infinite;
}

@keyframes hint-bob {
  0%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }
  50% {
    transform: translateY(6px);
    opacity: 1;
  }
}

.hint-enter-active,
.hint-leave-active {
  transition: opacity 0.3s ease;
}

.hint-enter-from,
.hint-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .desktop__hint-arrow {
    animation: none;
  }
}

@media (max-width: 768px) {
  .desktop__files {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
    justify-items: center;
    top: calc(var(--os-menubar-h) + 1.5rem);
    left: 0.5rem;
    right: 0.5rem;
    gap: 0.75rem;
  }

  .desktop__hint {
    font-size: 0.875rem;
  }
}

</style>
