import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HeroSection from '@/components/landing/HeroSection.vue'
import { planCount, tokenizeHighlight } from '@/components/landing/heroMotion'
import type { Profile } from '@/types/models'

const profile = {
  name: 'Bob Tsou',
  display_name: 'BOB',
  display_name_sub: 'TSOU',
  title: '實戰型 AI 應用工程師',
  subtitle: '設計・電商 → 前端 → 地端 AI 產線',
  bio: '完整自介，含杰哥與半工半讀',
  hero_intro: '首屏兩行短自介',
  role_texts: ['Vue 3'],
  highlights: [
    { value: '−5 MB', label: '學生端單頁傳輸量' },
    { value: '36s → 9s', label: 'AI 改圖等待時間' },
    { value: '2,100+', label: '平台服務學校數' }
  ]
} as Profile

const mountHero = (p: Profile = profile) =>
  mount(HeroSection, { props: { profile: p, resumeUrl: '/resume.pdf', githubUrl: 'https://github.com/BB5566' } })

describe('HeroSection', () => {
  it('首屏用短自介，沒有才退回完整 bio', () => {
    expect(mountHero().find('.bio').text()).toBe('首屏兩行短自介')
    expect(mountHero({ ...profile, hero_intro: null }).find('.bio').text()).toBe(profile.bio)
  })

  it('頭像在不能跑動畫時只是圖，不是空按鈕', () => {
    const wrapper = mountHero()
    expect(wrapper.find('.portrait img').exists()).toBe(true)
    expect(wrapper.find('button.frame').exists()).toBe(false)
  })

  it('不能跑動畫時（jsdom 沒有 matchMedia）直接顯示最終數字，不放畫布', () => {
    const wrapper = mountHero()
    const shown = wrapper
      .findAll('.highlights strong')
      .map((s) => s.findAll('[aria-hidden]').map((t) => t.element.textContent).join(''))
    expect(shown).toEqual(['−5 MB', '36s → 9s', '2,100+'])
    expect(wrapper.find('canvas').exists()).toBe(false)
  })
})

describe('heroMotion 數字拆解', () => {
  it('單位獨立成 unit，小寫 s 不會被 Bebas 吃成大寫', () => {
    expect(tokenizeHighlight('36s → 9s')).toEqual([
      { text: '36', kind: 'num' },
      { text: 's', kind: 'unit' },
      { text: ' → ', kind: 'sym' },
      { text: '9', kind: 'num' },
      { text: 's', kind: 'unit' }
    ])
  })

  it('36s → 9s 從 36 跑到 9；2,100+ 從 0 跑並保留千分位', () => {
    const wait = planCount(tokenizeHighlight('36s → 9s'))
    expect(wait).toMatchObject({ index: 3, from: 36, to: 9 })

    const schools = planCount(tokenizeHighlight('2,100+'))
    expect(schools).toMatchObject({ index: 0, from: 0, to: 2100 })
    expect(schools?.format(1234.4)).toBe('1,234')
  })
})
