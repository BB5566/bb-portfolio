import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useProjectStore } from '@/stores/projects'
import type { Project } from '@/types/models'

// Mock API
vi.mock('@/api/projects', () => ({
  projectApi: {
    getAll: vi.fn(),
    getById: vi.fn()
  },
  categoryApi: {
    getAll: vi.fn()
  }
}))

// Mock logger
vi.mock('@/utils/logger', () => ({
  log: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn()
  }
}))

import { projectApi } from '@/api/projects'

describe('Project Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  describe('初始狀態', () => {
    it('應該有正確的初始值', () => {
      const store = useProjectStore()

      expect(store.projects).toEqual([])
      expect(store.categories).toEqual([])
      expect(store.currentProject).toBeNull()
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })
  })

  describe('fetchProjects', () => {
    it('應該成功載入專案列表', async () => {
      const mockProjects = [
        { id: 1, title: '專案1', is_published: true, description: '描述1' },
        { id: 2, title: '專案2', is_published: false, description: '描述2' }
      ]

      vi.mocked(projectApi.getAll).mockResolvedValue({ data: mockProjects })

      const store = useProjectStore()
      await store.fetchProjects()

      expect(store.projects).toEqual(mockProjects)
      expect(store.loading).toBe(false)
      expect(store.error).toBeNull()
    })

    it('應該處理 API 錯誤', async () => {
      vi.mocked(projectApi.getAll).mockRejectedValue(new Error('網路錯誤'))

      const store = useProjectStore()
      await store.fetchProjects()

      expect(store.projects).toEqual([])
      expect(store.error).toContain('錯誤')
      expect(store.loading).toBe(false)
    })
  })

  describe('publishedProjects computed', () => {
    it('應該只回傳已發布的專案', () => {
      const store = useProjectStore()
      store.projects = [
        { id: 1, title: '已發布', is_published: true } as Project,
        { id: 2, title: '草稿', is_published: false } as Project,
        { id: 3, title: '已發布2', is_published: true } as Project
      ]

      expect(store.publishedProjects).toHaveLength(2)
      expect(store.publishedProjects.every((p) => p.is_published)).toBe(true)
    })
  })

  describe('projectsByCategory computed', () => {
    it('應該依分類分組專案', () => {
      const store = useProjectStore()
      store.projects = [
        { id: 1, title: '專案1', is_published: true, category: { name: 'Web' } } as Project,
        { id: 2, title: '專案2', is_published: true, category: { name: 'Mobile' } } as Project,
        { id: 3, title: '專案3', is_published: true, category: { name: 'Web' } } as Project
      ]

      const grouped = store.projectsByCategory
      expect(grouped['Web']).toHaveLength(2)
      expect(grouped['Mobile']).toHaveLength(1)
    })

    it('沒有分類的專案應該歸入未分類', () => {
      const store = useProjectStore()
      store.projects = [
        { id: 1, title: '無分類專案', is_published: true, category: null } as Project
      ]

      const grouped = store.projectsByCategory
      expect(grouped['未分類']).toHaveLength(1)
    })
  })

  describe('searchProjects', () => {
    it('應該依關鍵字搜尋專案', () => {
      const store = useProjectStore()
      store.projects = [
        { id: 1, title: 'Vue 專案', description: '使用 Vue 3', is_published: true } as Project,
        { id: 2, title: 'React App', description: '使用 React', is_published: true } as Project,
        { id: 3, title: 'Node 後端', description: 'Vue API', is_published: true } as Project
      ]

      const results = store.searchProjects('vue')
      expect(results).toHaveLength(2)
    })

    it('搜尋應該不區分大小寫', () => {
      const store = useProjectStore()
      store.projects = [
        { id: 1, title: 'TYPESCRIPT', description: '專案', is_published: true } as Project
      ]

      const results = store.searchProjects('typescript')
      expect(results).toHaveLength(1)
    })
  })

  describe('filterByCategory', () => {
    it('應該依分類 ID 篩選專案', () => {
      const store = useProjectStore()
      store.projects = [
        { id: 1, title: '專案1', is_published: true, category_id: 1 } as Project,
        { id: 2, title: '專案2', is_published: true, category_id: 2 } as Project,
        { id: 3, title: '專案3', is_published: true, category_id: 1 } as Project
      ]

      const results = store.filterByCategory(1)
      expect(results).toHaveLength(2)
      expect(results.every((p) => p.category_id === 1)).toBe(true)
    })
  })

  describe('filterByTag', () => {
    it('應該依標籤篩選專案', () => {
      const store = useProjectStore()
      store.projects = [
        {
          id: 1,
          title: '專案1',
          is_published: true,
          tags: [{ name: 'Vue' }, { name: 'TypeScript' }]
        } as Project,
        { id: 2, title: '專案2', is_published: true, tags: [{ name: 'React' }] } as Project,
        { id: 3, title: '專案3', is_published: true, tags: [{ name: 'Vue' }] } as Project
      ]

      const results = store.filterByTag('Vue')
      expect(results).toHaveLength(2)
    })
  })

  describe('fetchProjectById', () => {
    it('應該載入單一專案', async () => {
      const mockProject = { id: 1, title: '測試專案', description: '描述' }
      vi.mocked(projectApi.getById).mockResolvedValue({ data: mockProject })

      const store = useProjectStore()
      const result = await store.fetchProjectById(1)

      expect(result).toEqual(mockProject)
      expect(store.currentProject).toEqual(mockProject)
    })

    it('載入失敗應該回傳 null', async () => {
      vi.mocked(projectApi.getById).mockRejectedValue(new Error('Not Found'))

      const store = useProjectStore()
      const result = await store.fetchProjectById(999)

      expect(result).toBeNull()
      expect(store.error).toBeTruthy()
    })
  })
})
