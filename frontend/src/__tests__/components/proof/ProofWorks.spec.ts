import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import ProofWorks from '@/components/proof/ProofWorks.vue'
import RatioBars from '@/components/proof/RatioBars.vue'
import SizeCompare from '@/components/proof/SizeCompare.vue'
import type { Project } from '@/types/models'

const caseStudy = { problem: '問題', approach: '做法', result: '結果' }
const compare = { label: '主要資源', before: 3040, after: 788, unit: 'KB' }
const project = (id: number, extra: Partial<Project> = {}) =>
  ({ id, title: `作品 ${id}`, is_published: true, sort_order: id, ...extra }) as Project

// 4 是精選、3 不是：編號要照「精選先、其他後」連續排
const projects = [
  project(1, { slug: 'first-work', case_study: { ...caseStudy, compare } }),
  project(2, { case_study: { ...caseStudy, demo: 'pipeline' } }),
  project(3),
  project(4, { case_study: { ...caseStudy, compare }, project_link: 'https://fju.bb-made.com' }),
  project(5)
]

const mountWorks = () =>
  mount(ProofWorks, { props: { projects }, global: { stubs: { RouterLink: RouterLinkStub } } })

describe('ProofWorks', () => {
  it('有 case_study 的才是精選卡，標題寫精選幾件／全部幾件', () => {
    const wrapper = mountWorks()
    expect(wrapper.findAll('.card')).toHaveLength(3)
    expect(wrapper.find('h2 small').text()).toBe('精選 3 / 5')
  })

  it('第一張是橫幅，放真實比例的對照條；其他卡的比較用拖曳', () => {
    const cards = mountWorks().findAll('.card')
    expect(cards[0]?.classes()).toContain('banner')
    expect(cards[0]?.findComponent(RatioBars).exists()).toBe(true)
    expect(cards[1]?.classes()).not.toContain('banner')
    expect(cards[2]?.findComponent(SizeCompare).exists()).toBe(true)
  })

  it('每張卡都有「看完整做法」，能親手試的再多一顆', () => {
    const cards = mountWorks().findAll('.card')
    for (const card of cards) {
      expect(card.find('.act-btn.ghost').text()).toContain('看完整做法')
    }
    expect(cards[1]?.find('button.act-btn').text()).toContain('親手跑一次')
    expect(cards[2]?.find('a.act-btn[href]').attributes('href')).toBe('https://fju.bb-made.com')
  })

  it('作品連結用英文 slug，沒有 slug 才用數字 id', () => {
    const links = mountWorks().findAllComponents(RouterLinkStub)
    expect(links[0]?.props('to')).toEqual({ name: 'ProjectDetail', params: { id: 'first-work' } })
    expect(links.at(-1)?.props('to')).toEqual({ name: 'ProjectDetail', params: { id: '4' } })
  })

  it('按「看全部」才列出其他作品；標題改成全部幾件，編號接在精選後面不跳號', async () => {
    const wrapper = mountWorks()
    expect(wrapper.find('.all').exists()).toBe(false)
    expect(wrapper.findAll('.card .cat').map((c) => c.text())).toEqual(['BB 01', 'BB 02', 'BB 03'])
    await wrapper.find('.more').trigger('click')
    expect(wrapper.find('h2 small').text()).toBe('全部 5 件')
    expect(wrapper.findAll('.all .title').map((t) => t.text())).toEqual(['作品 3', '作品 5'])
    expect(wrapper.findAll('.all .code').map((c) => c.text())).toEqual(['BB 04', 'BB 05'])
  })
})

describe('RatioBars', () => {
  it('條的長度照實際比例，數字加千分位，不另外算百分比', () => {
    const wrapper = mount(RatioBars, {
      props: { label: '讀取的資料', before: 4000, after: 1000, unit: 'KB' }
    })
    expect(wrapper.find('.bar.after').attributes('style')).toContain('width: 25%')
    expect(wrapper.findAll('.row b').map((b) => b.text())).toEqual(['4,000 KB', '1,000 KB'])
    expect(wrapper.text()).not.toContain('%')
  })
})

describe('SizeCompare', () => {
  it('省下的比例照實際數字算：3040→788 是 −74%', () => {
    const wrapper = mount(SizeCompare, { props: compare })
    expect(wrapper.find('.after span').text()).toBe('788 KB（−74%）')
  })
})
