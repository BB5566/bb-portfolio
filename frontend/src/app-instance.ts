import type { App } from 'vue'

/**
 * App 實例 holder
 * 讓 router 守衛能取得 app 實例以動態註冊後台元件，
 * 同時避免 main.ts ↔ router 的循環依賴。
 */
let appInstance: App | null = null

export const setAppInstance = (app: App): void => {
  appInstance = app
}

export const getAppInstance = (): App | null => appInstance
