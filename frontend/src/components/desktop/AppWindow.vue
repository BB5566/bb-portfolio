<template>
  <section
    ref="rootRef"
    class="win"
    :class="{
      'win--active': isActive,
      'win--minimized': win.minimized,
      'win--maximized': win.maximized || isMobile,
      'win--dragging': dragging
    }"
    :style="style"
    role="dialog"
    :aria-label="app.title"
    :aria-hidden="win.minimized ? 'true' : undefined"
    @pointerdown="desktop.focus(win.id)"
  >
    <header class="win__bar" @pointerdown="startDrag" @dblclick="desktop.toggleMaximize(win.id)">
      <div class="win__lights">
        <button
          type="button"
          class="win__light win__light--close"
          aria-label="關閉視窗"
          @click="desktop.close(win.id)"
        />
        <button
          type="button"
          class="win__light win__light--min"
          aria-label="縮到最小"
          @click="desktop.minimize(win.id)"
        />
        <button
          type="button"
          class="win__light win__light--max"
          aria-label="切換全螢幕"
          @click="desktop.toggleMaximize(win.id)"
        />
      </div>

      <h2 class="win__title">
        <component :is="app.icon" :size="13" aria-hidden="true" />
        {{ app.title }}
      </h2>

      <div class="win__bar-spacer" />
    </header>

    <div class="win__body">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch, onUnmounted } from 'vue'
import gsap from 'gsap'
import { useDesktopStore, type WindowState } from '@/stores/desktop'
import type { DesktopApp } from './apps'

const props = defineProps<{
  win: WindowState
  app: DesktopApp
  isMobile: boolean
}>()

const desktop = useDesktopStore()
const rootRef = ref<HTMLElement | null>(null)
const dragging = ref(false)

const isActive = computed(() => desktop.activeId === props.win.id)

const style = computed(() => {
  if (props.win.maximized || props.isMobile) return { zIndex: props.win.z }
  return {
    left: `${props.win.x}px`,
    top: `${props.win.y}px`,
    width: `${props.win.width}px`,
    height: `${props.win.height}px`,
    zIndex: props.win.z
  }
})

// ==========================================
// 拖曳（限制在桌面可視範圍內）
// ponytail: 只做移動不做 resize，視窗尺寸由 apps.ts 定義
// ==========================================
let offsetX = 0
let offsetY = 0
let activePointerId: number | null = null

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

const onPointerMove = (e: PointerEvent) => {
  const el = rootRef.value
  if (!el) return
  const maxX = window.innerWidth - el.offsetWidth
  const maxY = window.innerHeight - 96 // 保留 Dock 高度，避免標題列被拖到看不見
  desktop.move(
    props.win.id,
    clamp(e.clientX - offsetX, 0, Math.max(0, maxX)),
    clamp(e.clientY - offsetY, 32, Math.max(32, maxY))
  )
}

const stopDrag = () => {
  if (activePointerId === null) return
  dragging.value = false
  activePointerId = null
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointerup', stopDrag)
  window.removeEventListener('pointercancel', stopDrag)
}

const startDrag = (e: PointerEvent) => {
  // 紅綠燈按鈕不觸發拖曳；最大化 / 手機版視窗不可拖
  if ((e.target as HTMLElement).closest('.win__light')) return
  if (props.win.maximized || props.isMobile || e.button !== 0) return

  const el = rootRef.value
  if (!el) return

  offsetX = e.clientX - el.getBoundingClientRect().left
  offsetY = e.clientY - el.getBoundingClientRect().top
  dragging.value = true
  activePointerId = e.pointerId
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', stopDrag)
  window.addEventListener('pointercancel', stopDrag)
}

// ==========================================
// 最小化動畫（GSAP）
// ==========================================
watch(
  () => props.win.minimized,
  (minimized) => {
    const el = rootRef.value
    if (!el) return
    gsap.to(el, {
      scale: minimized ? 0.7 : 1,
      opacity: minimized ? 0 : 1,
      y: minimized ? 120 : 0,
      duration: 0.28,
      ease: minimized ? 'power2.in' : 'back.out(1.4)'
    })
  }
)

onUnmounted(stopDrag)
</script>

<style scoped>
.win {
  position: absolute;
  display: flex;
  flex-direction: column;
  min-width: 0;
  background: var(--os-window-bg);
  backdrop-filter: var(--os-blur);
  -webkit-backdrop-filter: var(--os-blur);
  border: 1px solid var(--os-chrome-border);
  border-radius: var(--os-radius);
  box-shadow: var(--os-shadow);
  overflow: hidden;
  will-change: transform;
}

.win--active {
  border-color: rgba(225, 193, 110, 0.3);
}

.win--minimized {
  pointer-events: none;
}

.win--maximized {
  left: 0;
  top: var(--os-menubar-h);
  width: 100%;
  height: calc(100% - var(--os-menubar-h) - var(--os-dock-h));
  border-radius: 0;
  border-left: none;
  border-right: none;
}

.win--dragging {
  user-select: none;
}

/* === 標題列 === */
.win__bar {
  position: relative;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  height: 38px;
  padding: 0 0.75rem;
  background: linear-gradient(180deg, rgba(52, 45, 38, 0.9), rgba(34, 29, 24, 0.9));
  border-bottom: 1px solid var(--os-chrome-border);
  cursor: grab;
  user-select: none;
}

.win--dragging .win__bar {
  cursor: grabbing;
}

.win__lights {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.win__light {
  position: relative;
  width: 12px;
  height: 12px;
  min-width: 12px;
  min-height: 12px;
  padding: 0;
  border: none;
  border-radius: 50%;
  opacity: 0.55;
  transition:
    opacity 0.2s ease,
    transform 0.15s ease;
}

.win__light:focus-visible {
  opacity: 1;
  outline: 2px solid var(--volt);
  outline-offset: 2px;
}

.win__light:active {
  transform: scale(0.85);
}

.win--active .win__light {
  opacity: 1;
}

.win__lights:hover .win__light {
  opacity: 1;
}

.win__light--close {
  background: #ff5f57;
}

.win__light--min {
  background: #febc2e;
}

.win__light--max {
  background: #28c840;
}

/* hover 才顯示 macOS 風格符號 */
.win__light::before,
.win__light::after {
  content: '';
  position: absolute;
  inset: 0;
  margin: auto;
  background: rgba(0, 0, 0, 0.55);
  opacity: 0;
  transition: opacity 0.15s ease;
}

.win__lights:hover .win__light::before,
.win__lights:hover .win__light::after {
  opacity: 1;
}

.win__light--close::before,
.win__light--close::after {
  width: 7px;
  height: 1.5px;
  border-radius: 1px;
}

.win__light--close::before {
  transform: rotate(45deg);
}

.win__light--close::after {
  transform: rotate(-45deg);
}

.win__light--min::before {
  width: 7px;
  height: 1.5px;
  border-radius: 1px;
}

.win__light--max::before,
.win__light--max::after {
  width: 7px;
  height: 1.5px;
  border-radius: 1px;
}

.win__light--max::after {
  transform: rotate(90deg);
}

.win__title {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0;
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.win--active .win__title {
  color: var(--text);
}

.win__title svg {
  color: var(--volt);
  flex-shrink: 0;
}

.win__bar-spacer {
  flex: 1;
}

/* === 內容區 === */
.win__body {
  flex: 1;
  min-height: 0;
  overflow: auto;
  overscroll-behavior: contain;
}

.win__body::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.win__body::-webkit-scrollbar-track {
  background: transparent;
}

.win__body::-webkit-scrollbar-thumb {
  background: rgba(225, 193, 110, 0.25);
  border-radius: 4px;
}

.win__body::-webkit-scrollbar-thumb:hover {
  background: rgba(225, 193, 110, 0.45);
}

@media (max-width: 768px) {
  .win__bar {
    height: 44px;
    min-height: 44px;
    cursor: default;
  }

  .win__lights {
    gap: 0.85rem;
  }

  .win__light {
    width: 14px;
    height: 14px;
    min-width: 14px;
    min-height: 14px;
    box-sizing: content-box;
    padding: 10px;
    margin: -10px;
    background-clip: content-box;
  }
}
</style>
