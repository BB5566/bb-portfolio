import { log } from '@/utils/logger'
import type { App } from 'vue'
import type { Router } from 'vue-router'

/**
 * Sentry 錯誤追蹤初始化
 *
 * 注意：Sentry 依賴需在 package.json 中手動安裝：
 *   npm install @sentry/vue @sentry/tracing
 *
 * 捕捉：
 * - 未捕捉的異常
 * - Promise 拒絕
 * - 網路錯誤 (axios interceptor)
 * - Vue 組件錯誤
 * - 性能監控 (Tracing)
 */
export async function initSentry(app: App, router: Router) {
  // 只在生產環境初始化
  if (import.meta.env.PROD) {
    const dsn = import.meta.env.VITE_SENTRY_DSN || ''

    if (!dsn) {
      log.warn('⚠️ Sentry DSN 未配置，錯誤追蹤已禁用')
      return
    }

    try {
      // 動態導入 Sentry（避免 production bundle 膨脹）
      // @vite-ignore
      const Sentry = await import('@sentry/vue')

      Sentry.init({
        app,
        dsn,
        environment: import.meta.env.MODE,
        integrations: [
          // 路由錯誤追蹤
          Sentry.replayIntegration({
            maskAllText: true,
            blockAllMedia: true
          })
        ],
        // 性能監控採樣率 (10%)
        tracesSampleRate: 0.1,
        // Replay 採樣率 (10% 正常流量，100% 錯誤)
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        // 在錯誤前執行，用於額外上下文
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        beforeSend(event: any, hint: any): any {
          // 排除特定錯誤
          if (event.exception) {
            const error = hint.originalException
            // 忽略某些預期的錯誤
            if (error instanceof Error) {
              if (error.message.includes('CANCELLED')) {
                return null // 不送出
              }
            }
          }
          return event
        }
      })

      // 路由變更時設置 breadcrumb
      router.afterEach((to, from) => {
        Sentry.captureMessage(`Navigation from ${from.path} to ${to.path}`, 'info')
      })

      // 設置用戶上下文 (可在登入時更新)
      // Sentry.setUser({ id: userId, email, username })
    } catch {
      log.warn('⚠️ 無法加載 Sentry，請確保已執行 npm install @sentry/vue @sentry/tracing')
    }
  }
}

/**
 * 在 axios interceptor 中捕捉 API 錯誤
 *
 * 範例：
 * axiosInstance.interceptors.response.use(
 *   response => response,
 *   error => {
 *     captureAPIError(error)
 *     return Promise.reject(error)
 *   }
 * )
 */
export async function captureAPIError(error: unknown) {
  if (import.meta.env.PROD) {
    try {
      // @vite-ignore
      const Sentry = await import('@sentry/vue')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const axiosError = error as any
      Sentry.captureException(error, {
        tags: {
          source: 'axios-api'
        },
        contexts: {
          api: {
            method: axiosError?.config?.method?.toUpperCase(),
            url: axiosError?.config?.url,
            status: axiosError?.response?.status
          }
        }
      })
    } catch {
      // Sentry 未安裝，跳過上報
    }
  }
}

/**
 * 手動上報錯誤（用於 try-catch）
 *
 * 範例：
 * try {
 *   await fetchData()
 * } catch (error) {
 *   captureError(error, { tags: { component: 'DataFetch' } })
 * }
 */
export async function captureError(error: unknown, context?: Record<string, unknown>) {
  if (import.meta.env.PROD) {
    try {
      // @vite-ignore
      const Sentry = await import('@sentry/vue')
      Sentry.captureException(error, {
        contexts: {
          custom: context
        }
      })
    } catch {
      // Sentry 未安裝，跳過上報
    }
  }
}

/**
 * 設置用戶上下文（登入後調用）
 */
export async function setSentryUser(userId: string, email?: string, username?: string) {
  if (import.meta.env.PROD) {
    try {
      // @vite-ignore
      const Sentry = await import('@sentry/vue')
      Sentry.setUser({
        id: userId,
        email,
        username
      })
    } catch {
      // Sentry 未安裝，跳過上報
    }
  }
}

/**
 * 清除用戶上下文（登出時調用）
 */
export async function clearSentryUser() {
  if (import.meta.env.PROD) {
    try {
      // @vite-ignore
      const Sentry = await import('@sentry/vue')
      Sentry.setUser(null)
    } catch {
      // Sentry 未安裝，跳過上報
    }
  }
}
