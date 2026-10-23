import client from './client'

export interface Tag {
  id: number
  name: string
  category: 'Frontend' | 'Backend' | 'Database' | 'Design' | 'Tool'
  projects_count?: number
  created_at?: string
  updated_at?: string
}

export interface TagFormData {
  name: string
  category: 'Frontend' | 'Backend' | 'Database' | 'Design' | 'Tool'
}

export const tagsAPI = {
  // 獲取所有標籤
  list(params?: { category?: string }) {
    return client.get<Tag[]>('/tags', { params })
  },

  // 獲取單個標籤
  get(id: number) {
    return client.get<Tag>(`/tags/${id}`)
  },

  // 創建標籤
  create(data: TagFormData) {
    return client.post<Tag>('/tags', data)
  },

  // 更新標籤
  update(id: number, data: TagFormData) {
    return client.put<Tag>(`/tags/${id}`, data)
  },

  // 刪除標籤
  delete(id: number) {
    return client.delete(`/tags/${id}`)
  }
}
