import { log } from '@/utils/logger'
import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError
} from 'axios'
import router from '@/router'
import { toast } from '@/utils/toast'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://bb-made.com/api/v1'

// 簡單的記憶化快取系統
interface CacheEntry<T = unknown> {
  data: T
  timestamp: number
}

class ApiCache {
  private cache = new Map<string, CacheEntry<unknown>>()
  private readonly TTL = 5 * 60 * 1000 // 5 分鐘

  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    // 檢查是否過期
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  clear(): void {
    this.cache.clear()
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  has(key: string): boolean {
    const entry = this.cache.get(key)
    if (!entry) return false

    // 檢查是否過期
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return false
    }

    return true
  }
}

export const apiCache = new ApiCache()

// 錯誤重試配置
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 秒

// 創建 axios 實例
const client: AxiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

// 請求攔截器
client.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 從 sessionStorage 取得 token (單一權威來源)
    const token = sessionStorage.getItem('auth_token')

    if (token && config.headers) {
      // 使用 Axios v1.x 標準的 .set() 方法確保標頭注入成功
      if (import.meta.env.DEV) {
        log.info('[Auth] Attaching token to request:', config.url)
      }
      config.headers.set('Authorization', `Bearer ${token}`)
    } else if (!token && import.meta.env.DEV) {
      log.info('[Auth] No token found in session storage')
    }

    // 開發環境顯示請求日誌
    if (import.meta.env.DEV) {
      log.info(`[API] ${config.method?.toUpperCase()} ${config.url}`)
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 重試請求函數
async function retryRequest(error: AxiosError): Promise<AxiosResponse> {
  const config = error.config as InternalAxiosRequestConfig & { retryCount?: number }

  if (!config) {
    return Promise.reject(error)
  }

  config.retryCount = config.retryCount || 0

  // 只對網絡錯誤或 5xx 錯誤重試
  const shouldRetry =
    !error.response || (error.response.status >= 500 && error.response.status < 600)

  if (config.retryCount >= MAX_RETRIES || !shouldRetry) {
    return Promise.reject(error)
  }

  config.retryCount += 1

  // 指數退避
  const delay = RETRY_DELAY * Math.pow(2, config.retryCount - 1)

  if (import.meta.env.DEV) {
    log.info(`Retrying request... Attempt ${config.retryCount}/${MAX_RETRIES}`)
  }

  await new Promise((resolve) => setTimeout(resolve, delay))
  return client(config)
}

// 響應攔截器
client.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const status = error.response?.status
    const errorData = error.response?.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined
    const message = errorData?.message || error.message

    // 先嘗試重試（針對 5xx 錯誤和網絡錯誤）
    if (!error.response || (status && status >= 500)) {
      try {
        return await retryRequest(error)
      } catch (retryError) {
        // 如果重試失敗，繼續原本的錯誤處理
        error = retryError as AxiosError
      }
    }

    if (error.response) {
      switch (status) {
        case 401:
          // Token 無效或過期
          toast('error', '登入已過期,請重新登入')
          sessionStorage.removeItem('auth_token')
          sessionStorage.removeItem('auth_user')

          // 只在後台頁面時才跳轉到登入頁
          // 修正跳轉路徑以符合專案路由結構
          if (router.currentRoute.value.path.includes('/admin')) {
            router.push('/admin/login')
          }
          break

        case 403:
          toast('error', '權限不足,無法執行此操作')
          break

        case 404:
          toast('error', '請求的資源不存在')
          break

        case 422: {
          // 驗證錯誤
          const errors = errorData?.errors
          if (errors) {
            const firstError = Object.values(errors)[0] as string[]
            toast('error', firstError[0] || '資料驗證失敗')
          } else {
            toast('error', message || '資料驗證失敗')
          }
          break
        }

        case 429:
          toast('error', '請求過於頻繁,請稍後再試')
          break

        case 500:
        case 502:
        case 503:
          toast('error', '伺服器錯誤,請稍後再試')
          break

        default:
          // 生產環境不顯示詳細錯誤訊息,避免洩漏敏感資訊
          if (import.meta.env.DEV && message) {
            toast('error', message)
          } else {
            toast('error', '操作失敗,請稍後再試')
          }
          break
      }
    } else if (error.request) {
      toast('error', '無法連接到伺服器,請檢查網路連線')
    } else {
      toast('error', '請求失敗')
    }

    return Promise.reject(error)
  }
)

export default client
