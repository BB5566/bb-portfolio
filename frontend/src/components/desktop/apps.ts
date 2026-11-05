/**
 * 桌面應用程式註冊表
 * Dock、桌面圖示、視窗管理員都從這裡取得同一份定義
 */

import { defineAsyncComponent, markRaw, type Component } from 'vue'
import { Folder, Terminal, Calendar, Mail, Cpu, FileText, MessageCircle } from 'lucide-vue-next'

export interface DesktopApp {
  id: string
  /** 視窗標題列與 Dock tooltip */
  title: string
  /** 手機版 Dock tooltip 簡短名稱 */
  mobileTitle?: string
  /** 選單列左側顯示的應用程式名稱 */
  menuName: string
  icon: Component
  component: Component
  width: number
  height: number
  /** Dock 上的圖示底色 */
  tint: string
  /** Dock 上的圖示顏色 (可選) */
  iconColor?: string
  /** 是否顯示在 Dock（README 只從桌面圖示開啟） */
  inDock: boolean
}

const lazy = (loader: () => Promise<Component>) => markRaw(defineAsyncComponent(loader))

export const APPS: DesktopApp[] = [
  {
    id: 'finder',
    title: 'Finder — 作品集',
    mobileTitle: '作品集',
    menuName: 'Finder',
    icon: markRaw(Folder),
    component: lazy(() => import('./apps/FinderApp.vue')),
    width: 940,
    height: 600,
    tint: 'linear-gradient(160deg, #6fc3e8, #2a7fb8)',
    inDock: true
  },
  {
    id: 'terminal',
    title: 'Terminal — 關於我',
    mobileTitle: '關於我',
    menuName: 'Terminal',
    icon: markRaw(Terminal),
    component: lazy(() => import('./apps/TerminalApp.vue')),
    width: 720,
    height: 480,
    tint: 'linear-gradient(160deg, #4a4640, #26221f)',
    iconColor: '#4ade80',
    inDock: true
  },
  {
    id: 'calendar',
    title: 'Calendar — 經歷',
    mobileTitle: '經歷',
    menuName: 'Calendar',
    icon: markRaw(Calendar),
    component: lazy(() => import('./apps/CalendarApp.vue')),
    width: 780,
    height: 580,
    tint: 'linear-gradient(160deg, #f3e7cd, #c9a45a)',
    inDock: true
  },
  {
    id: 'profiler',
    title: 'System Profiler — 技能',
    mobileTitle: '技能',
    menuName: 'System Profiler',
    icon: markRaw(Cpu),
    component: lazy(() => import('./apps/ProfilerApp.vue')),
    width: 840,
    height: 560,
    tint: 'linear-gradient(160deg, #8f8778, #48423a)',
    inDock: true
  },
  {
    id: 'chat',
    title: 'Chat — 跟我聊聊',
    mobileTitle: '聊聊',
    menuName: 'Chat',
    icon: markRaw(MessageCircle),
    component: lazy(() => import('./apps/ChatApp.vue')),
    width: 560,
    height: 560,
    tint: 'linear-gradient(160deg, #7ee8c8, #1f9e86)',
    inDock: true
  },
  {
    id: 'mail',
    title: 'Mail — 聯絡我',
    mobileTitle: '聯絡',
    menuName: 'Mail',
    icon: markRaw(Mail),
    component: lazy(() => import('./apps/MailApp.vue')),
    width: 860,
    height: 600,
    tint: 'linear-gradient(160deg, #7fd0ea, #1f8ec4)',
    inDock: true
  },
  {
    id: 'readme',
    title: 'README.md',
    menuName: 'TextEdit',
    icon: markRaw(FileText),
    component: lazy(() => import('./apps/ReadmeApp.vue')),
    width: 620,
    height: 640,
    tint: 'linear-gradient(160deg, #e8e2d4, #b3aa96)',
    inDock: false
  }
]

export const DOCK_APPS = APPS.filter((app) => app.inDock)

export function getApp(id: string): DesktopApp | undefined {
  return APPS.find((app) => app.id === id)
}
