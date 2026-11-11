/**
 * 統一的資料模型類型定義
 * 所有 API 回應的資料結構都在這裡定義
 */

// ==================== Profile 相關 ====================
export interface ProfileHighlight {
  value: string
  label: string
}

/** 印刷打樣首頁（/v5）首屏文案 */
export interface ProfileHeroProof {
  claim_lines: string[] // 大標，一個元素一行
  who: string
  role: string
  pitch: string
  how: string
}

export interface Profile {
  id: number
  name: string
  display_name: string | null // 首頁大標題第一行（英文名）
  display_name_sub: string | null // 首頁大標題第二行（姓）
  title: string | null
  subtitle: string | null
  role_texts: string[] | null // 打字機效果輪播文字
  bio: string | null
  hero_intro?: string | null // 首屏兩行短自介（沒有就退回 bio）
  hero_proof?: ProfileHeroProof | null
  email: string | null
  phone: string | null
  location: string | null
  avatar: string | null
  resume_url: string | null
  github: string | null
  linkedin: string | null
  twitter?: string | null
  facebook?: string | null
  instagram?: string | null
  website?: string | null
  skills: Record<string, string[]> | null
  years_experience: number | null
  projects_delivered: number | null
  hours_training: number | null
  highlights?: ProfileHighlight[] | null // 首屏三個亮點數字
  meta_title: string | null
  meta_description: string | null
  meta_keywords: string | null
  created_at: string
  updated_at: string
}

export interface Experience {
  id: number
  company: string
  position: string
  location: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  description: string | null
  achievements: string[] | null
  technologies: string[] | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface Education {
  id: number
  school: string
  degree: string
  field_of_study: string
  location: string | null
  start_date: string
  end_date: string | null
  is_current: boolean
  description: string | null
  activities: string[] | null
  gpa: number | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

// ==================== Project 相關 ====================
export interface Category {
  id: number
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export interface Tag {
  id: number
  name: string
  slug: string
  category?: string
  created_at: string
  updated_at: string
}

export interface ProjectGallery {
  id: number
  image_url: string
  caption: string | null
  sort_order: number
}

/** 首頁精選作品卡：問題 → 做法 → 結果 */
export interface ProjectCaseStudy {
  problem: string
  approach: string
  result: string
  demo?: 'pipeline' // 卡片上放「親手跑一次」
  compare?: { label: string; before: number; after: number; unit: string } // 卡片上放拖曳比較
}

export interface Project {
  id: number
  title: string
  slug?: string
  description: string
  content?: string | null
  thumbnail?: string | null
  cover_image_url?: string | null
  preview_media_url?: string | null
  demo_url?: string | null
  github_url?: string | null
  project_link?: string | null
  github_link?: string | null
  category_id: number | null
  category?: Category | null
  tags?: Tag[] | null
  tech_stack?: string[] | null
  technologies?: string[] | null
  features?: string[] | null
  case_study?: ProjectCaseStudy | null
  is_featured?: boolean
  is_published: boolean
  sort_order: number
  status?: 'draft' | 'published' | 'archived'
  completed_at?: string | null
  gallery?: ProjectGallery[] | null
  galleries?: ProjectGallery[] | null
  created_at: string
  updated_at?: string
}

// ==================== Contact 相關 ====================
export interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string | null
  message: string
  is_read: boolean
  is_replied: boolean
  replied_at: string | null
  ip_address: string | null
  user_agent: string | null
  created_at: string
  updated_at: string
}

// ==================== Dashboard 相關 ====================
export interface DashboardStats {
  totalProjects: number
  publishedProjects: number
  totalCategories: number
  totalTags: number
  totalMessages: number
  unreadMessages: number
  recentProjects: Project[]
  recentMessages: ContactMessage[]
}

// ==================== User 相關 ====================
export interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

// ==================== API 回應格式 ====================
export interface ApiResponse<T> {
  data: T
  message?: string
  meta?: {
    current_page?: number
    from?: number
    last_page?: number
    per_page?: number
    to?: number
    total?: number
  }
}
