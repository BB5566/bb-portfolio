/**
 * 圖片 URL 處理工具函數
 */

/**
 * 獲取完整的圖片 URL
 * @param url 相對或絕對 URL
 * @returns 完整的圖片 URL
 */
export function getFullImageUrl(url: string | null | undefined): string {
  if (!url) return ''

  // 如果已經是完整 URL，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }

  // 使用環境變數中的後端 URL
  const baseUrl = import.meta.env.VITE_BACKEND_URL || 'https://bb-made.com'

  // 確保 URL 格式正確並包含 /storage/ 前導 (針對 Laravel public disk)
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  const finalPath = cleanPath.startsWith('/storage/') ? cleanPath : `/storage${cleanPath}`

  return `${baseUrl}${finalPath}`
}

/**
 * 專案物件介面
 */
interface ProjectWithImages {
  cover_image_url?: string | null
  galleries?: Array<{ image_url: string }> | null
}

/**
 * 獲取專案封面圖片
 * @param project 專案物件
 * @returns 封面圖片 URL 或 null
 */
export function getProjectCoverImage(project: ProjectWithImages): string | null {
  // 優先使用 cover_image_url
  if (project.cover_image_url) {
    return getFullImageUrl(project.cover_image_url)
  }
  // 其次使用 galleries 第一張圖
  if (project.galleries && project.galleries.length > 0 && project.galleries[0]) {
    return getFullImageUrl(project.galleries[0].image_url)
  }
  return null
}
