import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import HomeLanding from '@/views/HomeLanding.vue'
import { useProfileStore } from '@/stores/profile'
import { useProjectStore } from '@/stores/projects'

// 只測首頁區塊的順序，資料載入一律不打 API
vi.mock('@unhead/vue', () => ({ useHead: vi.fn(), injectHead: vi.fn() }))
vi.mock('@/composables/useSEO', () => ({
  useSEO: () => ({ setPageMeta: vi.fn(), generateWebsiteSchema: vi.fn(), generatePersonSchema: vi.fn() })
}))

const stubs = {
  LandingNav: true,
  HeroSection: { template: '<section class="hero" />' },
  WorksSection: { template: '<section class="works" />' },
  ExperienceSection: true,
  SkillsSection: true,
  ContactSection: true,
  LandingFooter: true
}

function mountLanding() {
  const pinia = createPinia()
  setActivePinia(pinia)
  const profile = useProfileStore()
  profile.fetchAllProfileData = vi.fn().mockResolvedValue(undefined)
  const projects = useProjectStore()
  projects.fetchProjects = vi.fn().mockResolvedValue(undefined)
  projects.fetchCategories = vi.fn().mockResolvedValue(undefined)
  return { profile, wrapper: mount(HomeLanding, { global: { plugins: [pinia], stubs } }) }
}

describe('HomeLanding', () => {
  it('個人資料還沒回來時，第一屏是 Hero 佔位，不是作品區', () => {
    const { wrapper } = mountLanding()
    const first = wrapper.find('main').element.firstElementChild
    expect(first?.classList.contains('hero-placeholder')).toBe(true)
  })

  it('個人資料載入失敗就不佔位，直接顯示作品區', async () => {
    const { profile, wrapper } = mountLanding()
    profile.error = '載入個人資料失敗'
    await wrapper.vm.$nextTick()
    expect(wrapper.find('.hero-placeholder').exists()).toBe(false)
    expect(wrapper.find('main').element.firstElementChild?.classList.contains('works')).toBe(true)
  })
})
