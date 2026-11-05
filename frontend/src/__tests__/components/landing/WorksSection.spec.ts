import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import WorksSection from '@/components/landing/WorksSection.vue'
import type { Project, Category } from '@/types/models'

const categories: Category[] = [
  { id: 1, name: '前端', slug: 'frontend', description: null, created_at: '', updated_at: '' },
  { id: 2, name: '設計', slug: 'design', description: null, created_at: '', updated_at: '' },
  { id: 3, name: '空的', slug: 'empty', description: null, created_at: '', updated_at: '' }
]

const project = (id: number, category_id: number, sort_order: number): Project => ({
  id,
  title: `作品 ${id}`,
  description: '描述',
  category_id,
  is_published: true,
  sort_order,
  technologies: ['Vue', 'TS', 'Pinia', 'Vite', 'GSAP'],
  created_at: ''
})

const projects = [project(1, 1, 2), project(2, 2, 1), project(3, 1, 3)]

const mountSection = () =>
  mount(WorksSection, {
    props: { projects, categories },
    global: { stubs: { RouterLink: { template: '<a class="card"><slot /></a>' } } }
  })

describe('WorksSection.vue', () => {
  it('只列出有作品的分類，並附件數', () => {
    const chips = mountSection()
      .findAll('.chip')
      .map((c) => c.text())
    expect(chips).toEqual(['全部 3', '前端 2', '設計 1'])
  })

  it('依 sort_order 排序，技術標籤最多四個', () => {
    const wrapper = mountSection()
    expect(wrapper.findAll('h3').map((h) => h.text())).toEqual(['作品 2', '作品 1', '作品 3'])
    expect(wrapper.find('.tech').findAll('li')).toHaveLength(4)
  })

  it('點分類只顯示該分類作品', async () => {
    const wrapper = mountSection()
    await wrapper.findAll('.chip')[2]!.trigger('click')
    expect(wrapper.findAll('h3').map((h) => h.text())).toEqual(['作品 2'])
  })
})
