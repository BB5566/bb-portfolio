import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

// Hoisted mocks — vi.mock is hoisted, so vars must be hoisted too
const { mockAxiosPost, mockAxiosGet, mockAxiosDefaults } = vi.hoisted(() => ({
  mockAxiosPost: vi.fn(),
  mockAxiosGet: vi.fn(),
  mockAxiosDefaults: {
    headers: { common: {} as Record<string, string> }
  }
}))

vi.mock('axios', () => {
  const mockClient = {
    post: mockAxiosPost,
    get: mockAxiosGet,
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() }
    },
    defaults: mockAxiosDefaults
  }
  return {
    default: {
      create: vi.fn(() => mockClient),
      post: mockAxiosPost,
      get: mockAxiosGet,
      defaults: mockAxiosDefaults
    }
  }
})

import { useAuthStore } from '@/stores/admin/auth'

describe('Auth Store', () => {
  beforeEach(() => {
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
    vi.mocked(localStorage.removeItem).mockClear()
    mockAxiosPost.mockClear()
    mockAxiosGet.mockClear()
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('初始狀態', () => {
    it('應該有正確的初始值', () => {
      vi.mocked(localStorage.getItem).mockReturnValue(null)
      setActivePinia(createPinia())
      const store = useAuthStore()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('login', () => {
    it('登入成功', async () => {
      const mockResponse = {
        data: { token: 'test-token-123', user: { id: 1, email: 'a@b.com', name: 'Test' } }
      }
      mockAxiosPost.mockResolvedValue(mockResponse)
      const store = useAuthStore()
      const result = await store.login('a@b.com', 'pw')
      expect(result).toBe(true)
      expect(store.token).toBe('test-token-123')
      expect(store.user).toEqual(mockResponse.data.user)
      expect(store.isAuthenticated).toBe(true)
    })

    it('登入失敗', async () => {
      setActivePinia(createPinia())
      mockAxiosPost.mockRejectedValue({ response: { data: { message: '錯' } } })
      const store = useAuthStore()
      const result = await store.login('x@x.com', 'x')
      expect(result).toBe(false)
    })

    it('loading 狀態', async () => {
      let resolve!: (value: { data: { token: string; user: Record<string, never> } }) => void
      mockAxiosPost.mockReturnValue(
        new Promise((r) => {
          resolve = r
        })
      )
      const store = useAuthStore()
      const p = store.login('a@b.com', 'pw')
      expect(store.loading).toBe(true)
      resolve({ data: { token: 't', user: {} } })
      await p
      expect(store.loading).toBe(false)
    })
  })

  describe('logout', () => {
    it('清除認證', async () => {
      mockAxiosPost.mockResolvedValue({})
      const store = useAuthStore()
      store.token = 't'
      store.user = {
        id: 1,
        name: 'Test',
        email: 'a@b.com',
        email_verified_at: null,
        created_at: '',
        updated_at: ''
      }
      await store.logout()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })

    it('API 失敗也清除', async () => {
      mockAxiosPost.mockRejectedValue(new Error('net'))
      const store = useAuthStore()
      store.token = 't'
      await store.logout()
      expect(store.token).toBeNull()
    })
  })

  describe('fetchUser', () => {
    it('成功取得', async () => {
      const u = { id: 1, email: 'a@b.com', name: 'T' }
      mockAxiosGet.mockResolvedValue({ data: u })
      const store = useAuthStore()
      store.token = 't'
      expect(await store.fetchUser()).toBe(true)
      expect(store.user).toEqual(u)
    })

    it('無 token', async () => {
      const store = useAuthStore()
      store.token = null
      expect(await store.fetchUser()).toBe(false)
      expect(mockAxiosGet).not.toHaveBeenCalled()
    })

    it('API 失敗', async () => {
      mockAxiosGet.mockRejectedValue(new Error('401'))
      const store = useAuthStore()
      store.token = 't'
      expect(await store.fetchUser()).toBe(false)
      expect(store.token).toBeNull()
    })
  })

  describe('clearAuth', () => {
    it('清除狀態', () => {
      const store = useAuthStore()
      store.token = 't'
      store.user = {
        id: 1,
        name: 'Test',
        email: 'a@b.com',
        email_verified_at: null,
        created_at: '',
        updated_at: ''
      }
      store.clearAuth()
      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
    })
  })

  describe('isAuthenticated', () => {
    it('有 token → true', () => {
      const store = useAuthStore()
      store.token = 't'
      expect(store.isAuthenticated).toBe(true)
    })
    it('無 token → false', () => {
      const store = useAuthStore()
      store.token = null
      expect(store.isAuthenticated).toBe(false)
    })
    it('空字串 → false', () => {
      const store = useAuthStore()
      store.token = ''
      expect(store.isAuthenticated).toBe(false)
    })
  })
})
