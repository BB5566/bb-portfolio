import client from './client'

export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  projects_count?: number
  created_at?: string
  updated_at?: string
}

export interface CategoryFormData {
  name: string
  slug: string
  description?: string
}

export const categoriesAPI = {
  // 獲取所有分類
  list() {
    return client.get<Category[]>('/categories')
  },

  // 獲取單個分類
  get(id: number) {
    return client.get<Category>(`/categories/${id}`)
  },

  // 創建分類
  create(data: CategoryFormData) {
    return client.post<Category>('/categories', data)
  },

  // 更新分類
  update(id: number, data: CategoryFormData) {
    return client.put<Category>(`/categories/${id}`, data)
  },

  // 刪除分類
  delete(id: number) {
    return client.delete(`/categories/${id}`)
  }
}
