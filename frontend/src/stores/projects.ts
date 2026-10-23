import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { projectApi, categoryApi } from '@/api/projects'
import type { Project, Category } from '@/types/models'
import { log } from '@/utils/logger'

// 重新導出型別供其他模組使用
export type { Project, Category } from '@/types/models'

export const useProjectStore = defineStore('projects', () => {
  // State
  const projects = ref<Project[]>([])
  const categories = ref<Category[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed - 已發布的專案
  const publishedProjects = computed(() => projects.value.filter((p) => p.is_published))

  // Computed - 依分類分組的專案
  const projectsByCategory = computed(() => {
    const grouped: Record<string, Project[]> = {}
    publishedProjects.value.forEach((project) => {
      const categoryName = project.category?.name || '未分類'
      if (!grouped[categoryName]) {
        grouped[categoryName] = []
      }
      grouped[categoryName].push(project)
    })
    return grouped
  })

  // Computed - 依標籤分組的專案
  const projectsByTag = computed(() => {
    const grouped: Record<string, Project[]> = {}
    publishedProjects.value.forEach((project) => {
      if (project.tags && Array.isArray(project.tags)) {
        project.tags.forEach((tag) => {
          const tagName = tag?.name || 'Unknown'
          if (!grouped[tagName]) {
            grouped[tagName] = []
          }
          grouped[tagName].push(project)
        })
      }
    })
    return grouped
  })

  // Actions - 取得所有專案
  // 並發去重：首頁 HomeNew 與 PortfolioRevamped 同時呼叫時只發一次請求
  let projectsInFlight: Promise<void> | null = null
  async function fetchProjects() {
    if (projectsInFlight) return projectsInFlight

    loading.value = true
    error.value = null

    projectsInFlight = (async () => {
      try {
        log.debug('正在載入專案資料...', 'ProjectStore')
        const response = await projectApi.getAll()
        log.debug('API 回應:', 'ProjectStore', response.data)
        projects.value = response.data
      } catch (e) {
        const err = e as Error & { response?: { data?: { message?: string }; status?: number } }
        const errorMsg = err.response?.data?.message || err.message || '載入專案失敗'
        error.value = `錯誤: ${errorMsg}`
        log.error('載入專案失敗', err, 'ProjectStore')
      } finally {
        loading.value = false
        projectsInFlight = null
      }
    })()

    return projectsInFlight
  }

  // Actions - 取得單一專案
  async function fetchProjectById(id: number) {
    loading.value = true
    error.value = null
    try {
      const response = await projectApi.getById(id)
      currentProject.value = response.data
      return response.data
    } catch (e) {
      const err = e as Error
      error.value = err.message || '載入專案詳情失敗'
      log.error(`載入專案 #${id} 失敗`, err, 'ProjectStore')
      return null
    } finally {
      loading.value = false
    }
  }

  // Actions - 取得所有分類
  async function fetchCategories() {
    loading.value = true
    error.value = null
    try {
      const response = await categoryApi.getAll()
      categories.value = response.data
    } catch (e) {
      const err = e as Error
      error.value = err.message || '載入分類失敗'
      log.error('載入分類失敗', err, 'ProjectStore')
    } finally {
      loading.value = false
    }
  }

  // Actions - 依分類篩選專案
  function filterByCategory(categoryId: number) {
    return publishedProjects.value.filter((p) => p.category_id === categoryId)
  }

  // Actions - 依標籤篩選專案
  function filterByTag(tagName: string) {
    return publishedProjects.value.filter((p) => p.tags?.some((tag) => tag.name === tagName))
  }

  // Actions - 搜尋專案
  function searchProjects(query: string) {
    const lowerQuery = query.toLowerCase()
    return publishedProjects.value.filter(
      (p) =>
        p.title.toLowerCase().includes(lowerQuery) ||
        p.description.toLowerCase().includes(lowerQuery)
    )
  }

  return {
    // State
    projects,
    categories,
    currentProject,
    loading,
    error,

    // Computed
    publishedProjects,
    projectsByCategory,
    projectsByTag,

    // Actions
    fetchProjects,
    fetchProjectById,
    fetchCategories,
    filterByCategory,
    filterByTag,
    searchProjects
  }
})
