import { describe, it, expect } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import ProofWorks from '@/components/proof/ProofWorks.vue'
import SizeCompare from '@/components/proof/SizeCompare.vue'
import type { Project } from '@/types/models'

const caseStudy = { problem: '問題', approach: '做法', result: '結果' }
const project = (id: number, extra: Partial<Project> = {}) =>
  ({ id, title: `作品 ${id}`, is_published: true, sort_order: id, ...extra }) as Project

const projects = [
  project(1, { case_study: { ...caseStudy, demo: 'pipeline' } }),
  project(2, {
    case_study: { ...caseStudy, compare: { label: 'JS', before: 670, after: 173, unit: 'KB' } }
  }),
  project(3, { case_study: caseStudy, project_link: 'https://fju.bb-made.com' }),
  project(4),
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

  it('每張卡依資料放不同的試玩：產線示範／拖曳比較／正式站連結', () => {
    const cards = mountWorks().findAll('.card')
    expect(cards[0]?.find('button.act-btn').text()).toContain('親手跑一次')
    expect(cards[1]?.findComponent(SizeCompare).exists()).toBe(true)
    expect(cards[2]?.find('a.act-btn').attributes('href')).toBe('https://fju.bb-made.com')
  })

  it('其他作品先收起，按「看全部」才列出來，色票編號照全部作品的順序', async () => {
    const wrapper = mountWorks()
    expect(wrapper.find('.all').exists()).toBe(false)
    await wrapper.find('.more').trigger('click')
    expect(wrapper.findAll('.all .title').map((t) => t.text())).toEqual(['作品 4', '作品 5'])
    expect(wrapper.findAll('.all .code').map((c) => c.text())).toEqual(['BB 04', 'BB 05'])
  })
})

describe('SizeCompare', () => {
  it('省下的比例照實際數字算：670→173 是 −74%', () => {
    const wrapper = mount(SizeCompare, {
      props: { label: 'JS', before: 670, after: 173, unit: 'KB' }
    })
    expect(wrapper.find('.after span').text()).toBe('173 KB（−74%）')
  })
})
