import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { apiCache } from '@/api/client'

// Mock Element Plus
vi.mock('element-plus', () => ({
  ElMessage: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn()
  }
}))

// Mock router
vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
    currentRoute: {
      value: {
        path: '/admin/dashboard'
      }
    }
  }
}))

describe('ApiCache', () => {
  beforeEach(() => {
    apiCache.clear()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('set 和 get', () => {
    it('應該能夠存取資料', () => {
      const testData = { id: 1, name: '測試' }
      apiCache.set('test-key', testData)

      const result = apiCache.get<typeof testData>('test-key')
      expect(result).toEqual(testData)
    })

    it('不存在的 key 應該回傳 null', () => {
      const result = apiCache.get('non-existent')
      expect(result).toBeNull()
    })

    it('應該支援不同類型的資料', () => {
      apiCache.set('string', 'hello')
      apiCache.set('number', 42)
      apiCache.set('array', [1, 2, 3])
      apiCache.set('object', { a: 1 })

      expect(apiCache.get('string')).toBe('hello')
      expect(apiCache.get('number')).toBe(42)
      expect(apiCache.get('array')).toEqual([1, 2, 3])
      expect(apiCache.get('object')).toEqual({ a: 1 })
    })
  })

  describe('TTL 過期機制', () => {
    it('快取應該在 5 分鐘後過期', () => {
      apiCache.set('expiring', 'data')

      // 4 分鐘後還存在
      vi.advanceTimersByTime(4 * 60 * 1000)
      expect(apiCache.get('expiring')).toBe('data')

      // 再過 2 分鐘就過期了
      vi.advanceTimersByTime(2 * 60 * 1000)
      expect(apiCache.get('expiring')).toBeNull()
    })

    it('has() 應該在過期後回傳 false', () => {
      apiCache.set('check', 'data')

      expect(apiCache.has('check')).toBe(true)

      vi.advanceTimersByTime(6 * 60 * 1000)
      expect(apiCache.has('check')).toBe(false)
    })
  })

  describe('clear', () => {
    it('應該清除所有快取', () => {
      apiCache.set('key1', 'value1')
      apiCache.set('key2', 'value2')
      apiCache.set('key3', 'value3')

      apiCache.clear()

      expect(apiCache.get('key1')).toBeNull()
      expect(apiCache.get('key2')).toBeNull()
      expect(apiCache.get('key3')).toBeNull()
    })
  })

  describe('has', () => {
    it('存在的 key 應該回傳 true', () => {
      apiCache.set('exists', 'data')
      expect(apiCache.has('exists')).toBe(true)
    })

    it('不存在的 key 應該回傳 false', () => {
      expect(apiCache.has('not-exists')).toBe(false)
    })
  })

  describe('覆蓋行為', () => {
    it('相同 key 應該覆蓋舊資料', () => {
      apiCache.set('key', 'old value')
      apiCache.set('key', 'new value')

      expect(apiCache.get('key')).toBe('new value')
    })

    it('覆蓋後 TTL 應該重置', () => {
      apiCache.set('key', 'old value')

      vi.advanceTimersByTime(4 * 60 * 1000)

      // 覆蓋資料，重置 TTL
      apiCache.set('key', 'new value')

      // 再過 4 分鐘（總共 8 分鐘）
      vi.advanceTimersByTime(4 * 60 * 1000)

      // 因為重置了 TTL，所以還存在
      expect(apiCache.get('key')).toBe('new value')

      // 再過 2 分鐘就過期了
      vi.advanceTimersByTime(2 * 60 * 1000)
      expect(apiCache.get('key')).toBeNull()
    })
  })
})

describe('API Client 配置', () => {
  it('應該匯出 apiCache', () => {
    expect(apiCache).toBeDefined()
    expect(typeof apiCache.set).toBe('function')
    expect(typeof apiCache.get).toBe('function')
    expect(typeof apiCache.clear).toBe('function')
    expect(typeof apiCache.has).toBe('function')
  })
})
