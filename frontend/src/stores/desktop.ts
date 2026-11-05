/**
 * Desktop Store
 * 模擬桌面作業系統的視窗狀態：開啟 / 關閉 / 最小化 / 最大化 / 拖曳 / z-index
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export interface WindowState {
  /** 對應 desktop/apps.ts 的 app id */
  id: string
  x: number
  y: number
  width: number
  height: number
  z: number
  minimized: boolean
  maximized: boolean
}

export interface OpenOptions {
  width?: number
  height?: number
}

/** 視窗初始位置採階梯式排列，避免完全重疊 */
const CASCADE_STEP = 32
const MENUBAR_HEIGHT = 32
/** Dock 高度 + 上下留白，開窗時保留這塊不被蓋住 */
const DOCK_RESERVE = 100

export const useDesktopStore = defineStore('desktop', () => {
  const windows = ref<WindowState[]>([])
  const topZ = ref(10)
  const cascadeIndex = ref(0)

  const openIds = computed(() => windows.value.map((w) => w.id))
  const activeId = computed(() => {
    const visible = windows.value.filter((w) => !w.minimized)
    if (visible.length === 0) return null
    return visible.reduce((top, w) => (w.z > top.z ? w : top)).id
  })

  function find(id: string) {
    return windows.value.find((w) => w.id === id)
  }

  function isOpen(id: string) {
    return windows.value.some((w) => w.id === id)
  }

  function focus(id: string) {
    const win = find(id)
    if (!win) return
    topZ.value += 1
    win.z = topZ.value
    win.minimized = false
  }

  /** 依可用桌面尺寸算出初始位置（置中偏移 + 階梯錯位），並避開 Dock */
  function initialPosition(width: number, height: number) {
    const vw = typeof window === 'undefined' ? 1440 : window.innerWidth
    const vh = typeof window === 'undefined' ? 900 : window.innerHeight
    const offset = (cascadeIndex.value % 5) * CASCADE_STEP
    cascadeIndex.value += 1

    const minY = MENUBAR_HEIGHT + 16
    const maxY = Math.max(minY, vh - height - DOCK_RESERVE)
    const y = Math.round((vh - height) / 2) + offset - CASCADE_STEP * 2

    return {
      x: Math.max(16, Math.round((vw - width) / 2) + offset - CASCADE_STEP * 2),
      y: Math.min(maxY, Math.max(minY, y))
    }
  }

  function open(id: string, options: OpenOptions = {}) {
    const existing = find(id)
    if (existing) {
      focus(id)
      return existing
    }

    const vw = typeof window === 'undefined' ? 1440 : window.innerWidth
    const vh = typeof window === 'undefined' ? 900 : window.innerHeight
    const width = Math.min(options.width ?? 880, vw - 32)
    const height = Math.min(options.height ?? 560, vh - MENUBAR_HEIGHT - DOCK_RESERVE - 32)

    topZ.value += 1
    const win: WindowState = {
      id,
      ...initialPosition(width, height),
      width,
      height,
      z: topZ.value,
      minimized: false,
      maximized: false
    }
    windows.value.push(win)
    return win
  }

  function close(id: string) {
    windows.value = windows.value.filter((w) => w.id !== id)
  }

  function minimize(id: string) {
    const win = find(id)
    if (win) win.minimized = true
  }

  /** Dock 點擊：未開→開啟，已開且在最上層→最小化，其餘→提到最上層 */
  function toggle(id: string, options?: OpenOptions) {
    const win = find(id)
    if (!win) {
      open(id, options)
    } else if (!win.minimized && activeId.value === id) {
      minimize(id)
    } else {
      focus(id)
    }
  }

  function toggleMaximize(id: string) {
    const win = find(id)
    if (!win) return
    win.maximized = !win.maximized
    focus(id)
  }

  function move(id: string, x: number, y: number) {
    const win = find(id)
    if (!win) return
    win.x = x
    win.y = y
  }

  function closeAll() {
    windows.value = []
  }

  return {
    windows,
    openIds,
    activeId,
    isOpen,
    find,
    open,
    close,
    minimize,
    toggle,
    toggleMaximize,
    focus,
    move,
    closeAll
  }
})
