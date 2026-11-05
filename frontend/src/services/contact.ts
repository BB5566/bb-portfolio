import client from '@/api/client'

export interface ContactFormData {
  name: string
  email: string
  subject?: string
  message: string
}

export interface ContactResponse {
  message: string
  data: {
    id: number
    created_at: string
  }
}

/**
 * 提交聯絡表單
 */
export const submitContactForm = async (data: ContactFormData): Promise<ContactResponse> => {
  const response = await client.post('/contact', data)
  return response.data
}

/**
 * 取得所有聯絡訊息 (後台管理用)
 */
export const getContactMessages = async (params?: {
  page?: number
  per_page?: number
  unread?: boolean
  read?: boolean
  search?: string
}) => {
  const response = await client.get('/admin/contact-messages', { params })
  return response.data
}

/**
 * 取得聯絡訊息統計 (後台管理用)
 */
export const getContactStats = async () => {
  const response = await client.get('/admin/contact-messages/stats')
  return response.data
}

/**
 * 標記訊息為已讀 (後台管理用)
 */
export const markMessageAsRead = async (id: number) => {
  const response = await client.patch(`/admin/contact-messages/${id}/read`)
  return response.data
}

/**
 * 標記訊息為未讀 (後台管理用)
 */
export const markMessageAsUnread = async (id: number) => {
  const response = await client.patch(`/admin/contact-messages/${id}/unread`)
  return response.data
}

/**
 * 刪除訊息 (後台管理用)
 */
export const deleteMessage = async (id: number) => {
  const response = await client.delete(`/admin/contact-messages/${id}`)
  return response.data
}
