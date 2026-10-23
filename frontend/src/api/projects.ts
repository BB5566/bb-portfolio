import { log } from '@/utils/logger'
/**
 * Projects API Service
 * 整合前台和後台的專案 API
 */

import client, { apiCache } from './client'
import type { Project, Category, ApiResponse } from '@/types/models'

// 重新導出型別供其他模組使用
export type { Project, Category } from '@/types/models'

export interface ProjectListParams {
  page?: number
  per_page?: number
  category_id?: number | string
  is_published?: boolean | string
  search?: string
  sort_by?: string
  sort_order?: 'asc' | 'desc'
}

export interface ProjectFormData {
  category_id: number
  title: string
  description: string
  project_link?: string
  github_link?: string
  sort_order?: number
  is_published: boolean
  tags?: number[]
  cover_image?: File
  preview_media?: File
  gallery_images?: File[]
}

// 快取鍵
const CACHE_KEYS = {
  ALL_PROJECTS: 'projects:all',
  ALL_CATEGORIES: 'categories:all',
  PROJECT_BY_ID: (id: number) => `project:${id}`,
  PROJECTS_BY_CATEGORY: (categoryId: number) => `projects:category:${categoryId}`
}

// ==================== 前台 API ====================
export const projectApi = {
  /**
   * 獲取所有已發布的專案（使用快取）
   */
  async getAll(): Promise<ApiResponse<Project[]>> {
    const cacheKey = CACHE_KEYS.ALL_PROJECTS
    const cached = apiCache.get<ApiResponse<Project[]>>(cacheKey)
    if (cached) {
      if (import.meta.env.DEV) {
        log.info('[Cache] Hit: projects')
      }
      return cached
    }

    const response = await client.get<Project[]>('/projects')
    const result: ApiResponse<Project[]> = {
      data: response.data
    }

    apiCache.set(cacheKey, result)
    return result
  },

  /**
   * 根據 ID 獲取專案（使用快取）
   */
  async getById(id: number): Promise<ApiResponse<Project>> {
    const cacheKey = CACHE_KEYS.PROJECT_BY_ID(id)
    const cached = apiCache.get<ApiResponse<Project>>(cacheKey)
    if (cached) {
      if (import.meta.env.DEV) {
        log.info(`[Cache] Hit: project #${id}`)
      }
      return cached
    }

    const response = await client.get<Project>(`/projects/${id}`)
    const result: ApiResponse<Project> = {
      data: response.data
    }

    apiCache.set(cacheKey, result)
    return result
  },

  /**
   * 清除專案快取
   */
  clearCache(): void {
    apiCache.clear()
  }
}

// Category API
export const categoryApi = {
  /**
   * 獲取所有分類（使用快取）
   */
  async getAll(): Promise<ApiResponse<Category[]>> {
    const cacheKey = CACHE_KEYS.ALL_CATEGORIES
    const cached = apiCache.get<ApiResponse<Category[]>>(cacheKey)
    if (cached) {
      if (import.meta.env.DEV) {
        log.info('[Cache] Hit: categories')
      }
      return cached
    }

    const response = await client.get<Category[]>('/categories')
    const result: ApiResponse<Category[]> = {
      data: response.data
    }

    apiCache.set(cacheKey, result)
    return result
  }
}

// ==================== 後台管理 API ====================
export const projectsAPI = {
  // 獲取專案列表
  // 注意: 當 per_page=100 時，後端直接回傳陣列；否則回傳分頁物件
  list(params?: ProjectListParams) {
    return client.get<
      | Project[]
      | {
          data: Project[]
          meta: {
            current_page: number
            last_page: number
            per_page: number
            total: number
          }
        }
    >('/admin/projects', { params })
  },

  // 獲取單個專案
  get(id: number) {
    return client.get<Project>(`/admin/projects/${id}`)
  },

  // 創建專案
  create(data: FormData) {
    return client.post<Project>('/admin/projects', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 更新專案
  update(id: number, data: FormData) {
    return client.post<Project>(`/admin/projects/${id}?_method=PUT`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
  },

  // 刪除專案
  delete(id: number) {
    return client.delete(`/admin/projects/${id}`)
  },

  // 批次刪除
  batchDelete(ids: number[]) {
    return client.post('/admin/projects/batch-delete', { ids })
  },

  // 批次更新發布狀態
  batchUpdateStatus(ids: number[], is_published: boolean) {
    return client.post('/admin/projects/batch-update-status', { ids, is_published })
  },

  // 更新排序
  updateSortOrder(id: number, sort_order: number) {
    return client.patch(`/admin/projects/${id}/sort`, { sort_order })
  }
}
