import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from '@/api/client'
import type { AxiosError } from 'axios'
import type { User } from '@/types/models'

/**
 * 後台認證 Store - 使用 Laravel Sanctum Token 認證
 */
export const useAuthStore = defineStore('admin-auth', () => {
  // State
  const token = ref<string | null>(sessionStorage.getItem('auth_token'))
  const user = ref<User | null>(null)
  const loading = ref(false)

  // Getters
  const isAuthenticated = computed(() => !!token.value)

  // Actions
  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    try {
      const response = await axios.post('/auth/login', {
        email,
        password
      })

      token.value = response.data.token
      user.value = response.data.user

      // 儲存到 sessionStorage (提升安全性防禦 XSS)
      sessionStorage.setItem('auth_token', response.data.token)
      sessionStorage.setItem('auth_user', JSON.stringify(response.data.user))

      return true
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>
      if (import.meta.env.DEV) {
        console.error(
          '[Auth] Login failed:',
          axiosError.response?.data?.message || axiosError.message
        )
      }
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true
    try {
      // 呼叫後端登出 API 撤銷 token
      if (token.value) {
        await axios.post('/auth/logout')
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Auth] Logout error:', error)
      }
    } finally {
      clearAuth()
      loading.value = false
    }
  }

  async function fetchUser(): Promise<boolean> {
    if (!token.value) return false

    try {
      const response = await axios.get('/auth/user')
      user.value = response.data
      sessionStorage.setItem('auth_user', JSON.stringify(response.data))
      return true
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[Auth] Fetch user failed:', error)
      }
      clearAuth()
      return false
    }
  }

  function clearAuth(): void {
    token.value = null
    user.value = null
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('auth_user')
    delete axios.defaults.headers.common['Authorization']
  }

  function setAuthHeader(_authToken: string): void {
    // 統一由 client.ts 的攔截器處理，不需要手動設定 defaults
  }

  // 延長 session (保持登入狀態)
  function extendSession(): void {
    // Sanctum token 不需要手動延長,只要 token 有效即可
    if (token.value) {
      setAuthHeader(token.value)
    }
  }

  // 初始化：如果有 token 就設定 header 和載入使用者資料
  function initialize(): void {
    if (token.value) {
      setAuthHeader(token.value)

      // 嘗試從 sessionStorage 載入使用者資料
      const savedUser = sessionStorage.getItem('auth_user')
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser)
        } catch (e) {
          if (import.meta.env.DEV) {
            console.error('[Auth] Failed to parse saved user:', e)
          }
        }
      }
    }
  }

  // 初始化
  initialize()

  return {
    // State
    token,
    user,
    loading,

    // Getters
    isAuthenticated,

    // Actions
    login,
    logout,
    fetchUser,
    extendSession,
    clearAuth
  }
})
