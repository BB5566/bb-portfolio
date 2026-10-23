import { log } from '@/utils/logger'
/**
 * Profile API Service
 * 處理個人資料、工作經歷、教育背景的 API 請求
 */

import client from '@/api/client'
import type { Profile, Experience, Education } from '@/types/models'

// 重新導出類型供其他模組使用
export type { Profile, Experience, Education }

// Profile API
export const profileApi = {
  /**
   * 獲取個人資料
   */
  async getProfile(): Promise<Profile> {
    const response = await client.get<Profile>('/profile')
    return response.data
  },

  /**
   * 獲取工作經歷列表（只顯示可見的）
   */
  async getExperiences(): Promise<Experience[]> {
    const response = await client.get<Experience[]>('/experiences')
    return response.data
  },

  /**
   * 獲取教育背景列表（只顯示可見的）
   */
  async getEducation(): Promise<Education[]> {
    const response = await client.get<Education[]>('/education')
    return response.data
  },

  /**
   * 獲取所有個人相關資料
   */
  async getAllProfileData(): Promise<{
    profile: Profile
    experiences: Experience[]
    education: Education[]
  }> {
    try {
      const [profile, experiences, education] = await Promise.all([
        this.getProfile(),
        this.getExperiences(),
        this.getEducation()
      ])

      return {
        profile,
        experiences,
        education
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        log.error('Failed to fetch profile data:', error)
      }
      throw error
    }
  }
}

export default profileApi
