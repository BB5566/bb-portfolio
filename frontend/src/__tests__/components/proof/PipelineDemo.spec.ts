import { afterEach, beforeEach, describe, it, expect, vi } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import PipelineDemo from '@/components/proof/PipelineDemo.vue'

let wrapper: VueWrapper

beforeEach(() => {
  vi.useFakeTimers()
  wrapper = mount(PipelineDemo)
})

afterEach(() => {
  wrapper.unmount()
  vi.useRealTimers()
})

const stateOf = () => wrapper.find('.stage').attributes('data-state')
const activeOuts = () => wrapper.findAll('.out.active').map((o) => o.attributes('data-out'))

describe('PipelineDemo', () => {
  it('一開始是待命，看得到三個輸入和「跑一次」', () => {
    expect(stateOf()).toBe('idle')
    expect(wrapper.findAll('.in')).toHaveLength(3)
    expect(wrapper.find('.runall').text()).toContain('跑一次')
    expect(wrapper.find('.log').text()).toContain('ready')
  })

  it('點一個輸入，跑完停在完成，只有那件產出亮起', async () => {
    await wrapper.findAll('.in')[1]!.trigger('click')
    expect(stateOf()).toBe('running')

    vi.advanceTimersByTime(3000)
    await nextTick()
    expect(stateOf()).toBe('done')
    expect(activeOuts()).toEqual(['poster'])
    expect(wrapper.findAll('.in')[1]!.classes()).toContain('active')
    expect(wrapper.find('.log').text()).toContain('done · 1 件產出完成')
  })

  it('跑一次全部：記錄最多 7 行', async () => {
    await wrapper.find('.runall').trigger('click')
    vi.advanceTimersByTime(9000)
    await nextTick()
    expect(stateOf()).toBe('done')
    expect(activeOuts()).toEqual(['exam', 'poster', 'post'])
    expect(wrapper.findAll('.log > div').length).toBeLessThanOrEqual(7)
  })

  it('按「跳過」馬上停在完成結果', async () => {
    await wrapper.find('.runall').trigger('click')
    await wrapper.find('.ctrl button').trigger('click')
    expect(stateOf()).toBe('done')
    expect(activeOuts()).toEqual(['exam', 'poster', 'post'])
    expect(wrapper.find('.log').text()).toContain('已跳過 · 結果如右')
  })
})
