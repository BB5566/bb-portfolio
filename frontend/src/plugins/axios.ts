import axios, { type AxiosError } from 'axios'

/**
 * Axios 實例配置
 * - 自動帶 Bearer token (Sanctum)
 * - 自動捕捉 API 錯誤到 Sentry (可選)
 */

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 10000,
  headers: {
    Accept: 'application/json'
  }
})

// 請求攔截：自動帶 Bearer token
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 響應攔截：處理錯誤並上報到 Sentry (可選)
instance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError | unknown) => {
    // 嘗試捕捉到 Sentry (如果已安裝)
    if (import.meta.env.PROD) {
      try {
        // @vite-ignore
        const { captureAPIError } = await import('./sentry')
        await captureAPIError(error)
      } catch {
        // Sentry 未安裝或未配置，跳過上報
      }
    }

    // 處理特定錯誤碼
    if ((error as AxiosError).response?.status === 401) {
      // 未授權 → 清除 token，導向登入
      localStorage.removeItem('auth_token')
      window.location.href = '/admin/login'
    }

    return Promise.reject(error)
  }
)

export default instance
