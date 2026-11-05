/**
 * Profile Store
 * 管理個人資料、工作經歷、教育背景的狀態
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { profileApi, type Profile, type Experience, type Education } from '@/services/profileApi'
import { log } from '@/utils/logger'
import { getDatePeriod as formatDatePeriod } from '@/utils/date'

export const useProfileStore = defineStore('profile', () => {
  // State
  const profile = ref<Profile | null>(null)
  const experiences = ref<Experience[]>([])
  const education = ref<Education[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed - 格式化的技能列表
  const skillsByCategory = computed(() => {
    return profile.value?.skills || {}
  })

  // Computed - 當前工作
  const currentExperience = computed(() => {
    return experiences.value.find((exp) => exp.is_current)
  })

  // Computed - 過往工作
  const pastExperiences = computed(() => {
    return experiences.value.filter((exp) => !exp.is_current)
  })

  // Computed - 社交媒體連結 (只保留 GitHub + LinkedIn)
  const socialLinks = computed(() => {
    const links = []
    // GitHub: 優先從 API 讀取，若無則用預設連結
    links.push({
      name: 'GitHub',
      url: profile.value?.github || 'https://github.com/BB5566',
      icon: 'github'
    })
    if (profile.value?.linkedin)
      links.push({ name: 'LinkedIn', url: profile.value.linkedin, icon: 'linkedin' })

    return links
  })

  // Actions - 獲取所有個人資料
  // 並發去重：首頁多個元件（HomeNew / AboutRevamped 等）同時呼叫時只發一次請求
  let profileDataInFlight: Promise<void> | null = null
  async function fetchAllProfileData() {
    if (profileDataInFlight) return profileDataInFlight

    loading.value = true
    error.value = null

    profileDataInFlight = (async () => {
      try {
        log.debug('正在載入個人資料...', 'ProfileStore')

        const data = await profileApi.getAllProfileData()

        profile.value = data.profile
        experiences.value = Array.isArray(data.experiences) ? data.experiences : []
        education.value = Array.isArray(data.education) ? data.education : []

        log.info('個人資料載入成功', 'ProfileStore', {
          profile: data.profile?.name,
          experiences: experiences.value.length,
          education: education.value.length
        })
      } catch (e) {
        const err = e as Error
        error.value = err.message || '載入個人資料失敗'
        log.error('載入個人資料失敗', err, 'ProfileStore')

        // 發生錯誤時確保數組狀態不變或重設為空，避免組件 .map() 報錯
        if (!Array.isArray(experiences.value)) experiences.value = []
        if (!Array.isArray(education.value)) education.value = []
      } finally {
        loading.value = false
        profileDataInFlight = null
      }
    })()

    return profileDataInFlight
  }

  // Actions - 單獨獲取個人資料
  async function fetchProfile() {
    loading.value = true
    error.value = null

    try {
      profile.value = await profileApi.getProfile()
      log.debug('個人資料載入成功', 'ProfileStore')
    } catch (e) {
      const err = e as Error
      error.value = err.message || '載入個人資料失敗'
      log.error('載入個人資料失敗', err, 'ProfileStore')
    } finally {
      loading.value = false
    }
  }

  // Actions - 單獨獲取工作經歷
  async function fetchExperiences() {
    loading.value = true
    error.value = null

    try {
      const data = await profileApi.getExperiences()
      experiences.value = Array.isArray(data) ? data : []
      log.debug('工作經歷載入成功', 'ProfileStore')
    } catch (e) {
      const err = e as Error
      error.value = err.message || '載入工作經歷失敗'
      log.error('載入工作經歷失敗', err, 'ProfileStore')
      experiences.value = []
    } finally {
      loading.value = false
    }
  }

  // Actions - 單獨獲取教育背景
  async function fetchEducation() {
    loading.value = true
    error.value = null

    try {
      const data = await profileApi.getEducation()
      education.value = Array.isArray(data) ? data : []
      log.debug('教育背景載入成功', 'ProfileStore')
    } catch (e) {
      const err = e as Error
      error.value = err.message || '載入教育背景失敗'
      log.error('載入教育背景失敗', err, 'ProfileStore')
      education.value = []
    } finally {
      loading.value = false
    }
  }

  // Helper - 格式化日期範圍（委派至共用 util，前台採「年月」格式）
  function getDatePeriod(startDate: string, endDate: string | null, isCurrent: boolean): string {
    return formatDatePeriod(startDate, endDate, isCurrent, 'ch')
  }

  return {
    // State
    profile,
    experiences,
    education,
    loading,
    error,

    // Computed
    skillsByCategory,
    currentExperience,
    pastExperiences,
    socialLinks,

    // Actions
    fetchAllProfileData,
    fetchProfile,
    fetchExperiences,
    fetchEducation,

    // Helpers
    getDatePeriod
  }
})
