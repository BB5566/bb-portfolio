import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import BeforeAfter from '@/components/BeforeAfter.vue'

const props = {
  before: '/old.webp',
  after: '/new.webp',
  beforeLabel: '改版前：舊版',
  afterLabel: '改版後：新版'
}

describe('BeforeAfter 改版前後', () => {
  it('預設分界線在正中間，兩張圖都有替代文字', () => {
    const wrapper = mount(BeforeAfter, { props })
    expect(wrapper.find('.stage').attributes('style')).toContain('--split: 50')
    expect(wrapper.findAll('img').map((img) => img.attributes('alt'))).toEqual([
      '改版前：舊版',
      '改版後：新版'
    ])
  })

  it('拖曳拉桿會移動分界線', async () => {
    const wrapper = mount(BeforeAfter, { props })
    await wrapper.find('input[type="range"]').setValue(20)
    expect(wrapper.find('.stage').attributes('style')).toContain('--split: 20')
  })
})
