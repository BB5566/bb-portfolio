import type { App } from 'vue'

/**
 * Element Plus 後台動態載入器
 *
 * Element Plus 僅後台 admin 使用，但過去在 main.ts 全域引入 CSS 與圖標，
 * 導致前台首頁被迫載入整包（~156KB gzip JS + 完整 CSS），拖累 LCP。
 * 改為只在進入 /admin 路由時動態載入，前台零負擔。
 */
let loaded: Promise<void> | null = null

/** admin 模板使用到的 Element Plus 圖標 */
const USED_ICONS = [
  'ArrowDown',
  'ArrowUp',
  'ChatDotRound',
  'CollectionTag',
  'DataBoard',
  'Delete',
  'Edit',
  'Expand',
  'Fold',
  'FolderOpened',
  'Link',
  'Lock',
  'Message',
  'Plus',
  'Postcard',
  'PriceTag',
  'School',
  'Search',
  'Star',
  'SwitchButton',
  'SuccessFilled',
  'Suitcase',
  'Upload',
  'User',
  'View'
] as const

/**
 * 確保 Element Plus 的完整 CSS 與圖標已載入並註冊（冪等，只執行一次）。
 * @param app 由 app-instance holder 取得的 Vue App 實例，用於全域註冊圖標
 */
export function loadAdminUI(app: App): Promise<void> {
  if (loaded) return loaded

  loaded = (async () => {
    const icons = await import('@element-plus/icons-vue')

    const iconMap = icons as unknown as Record<string, App['component']>
    for (const name of USED_ICONS) {
      const comp = iconMap[name]
      if (comp) app.component(name, comp)
    }
  })()

  return loaded
}
