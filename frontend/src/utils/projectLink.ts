import type { Project } from '@/types/models'

/** 作品網址用的代稱：有英文 slug 用 slug（正式網址），沒有才退回數字 id */
export const projectKey = (p: Pick<Project, 'id' | 'slug'>): string => p.slug || String(p.id)

/** 給 RouterLink 的 to */
export const projectRoute = (p: Pick<Project, 'id' | 'slug'>) => ({
  name: 'ProjectDetail',
  params: { id: projectKey(p) }
})
