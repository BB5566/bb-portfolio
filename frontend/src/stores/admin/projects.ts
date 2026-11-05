import { defineStore } from 'pinia'
import { ref } from 'vue'
import { projectsAPI, type Project, type ProjectListParams } from '@/api/projects'

export const useProjectsStore = defineStore('admin-projects', () => {
  // State
  const projects = ref<Project[]>([])
  const currentProject = ref<Project | null>(null)
  const loading = ref(false)
  const pagination = ref({
    current_page: 1,
    last_page: 1,
    per_page: 15,
    total: 0
  })

  // Actions
  async function fetchProjects(params?: ProjectListParams) {
    try {
      loading.value = true
      const response = await projectsAPI.list(params)

      // 處理兩種回應格式：
      // 1. 分頁格式: { data: [...], meta: {...} }
      // 2. 陣列格式: [...] (when per_page=100 or 'all')
      if (Array.isArray(response.data)) {
        // 直接陣列格式
        projects.value = response.data
        pagination.value = {
          current_page: 1,
          last_page: 1,
          per_page: response.data.length,
          total: response.data.length
        }
      } else {
        // 分頁格式
        projects.value = response.data.data
        pagination.value = response.data.meta
      }

      return response.data
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to fetch projects:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function fetchProject(id: number) {
    try {
      loading.value = true
      const response = await projectsAPI.get(id)
      currentProject.value = response.data
      return response.data
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Failed to fetch project ${id}:`, error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function createProject(data: FormData) {
    try {
      loading.value = true
      const response = await projectsAPI.create(data)
      projects.value.unshift(response.data)
      return response.data
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to create project:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function updateProject(id: number, data: FormData) {
    try {
      loading.value = true
      const response = await projectsAPI.update(id, data)

      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value[index] = response.data
      }

      if (currentProject.value?.id === id) {
        currentProject.value = response.data
      }

      return response.data
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Failed to update project ${id}:`, error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function deleteProject(id: number) {
    try {
      loading.value = true
      await projectsAPI.delete(id)

      const index = projects.value.findIndex((p) => p.id === id)
      if (index !== -1) {
        projects.value.splice(index, 1)
      }

      if (currentProject.value?.id === id) {
        currentProject.value = null
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error(`Failed to delete project ${id}:`, error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function batchDelete(ids: number[]) {
    try {
      loading.value = true
      await projectsAPI.batchDelete(ids)

      projects.value = projects.value.filter((p) => !ids.includes(p.id))
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to batch delete projects:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  async function batchUpdateStatus(ids: number[], isPublished: boolean) {
    try {
      loading.value = true
      await projectsAPI.batchUpdateStatus(ids, isPublished)

      projects.value.forEach((project) => {
        if (ids.includes(project.id)) {
          project.is_published = isPublished
        }
      })
    } catch (error) {
      if (import.meta.env.DEV) console.error('Failed to batch update status:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  function clearCurrentProject() {
    currentProject.value = null
  }

  return {
    // State
    projects,
    currentProject,
    loading,
    pagination,
    // Actions
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
    batchDelete,
    batchUpdateStatus,
    clearCurrentProject
  }
})
