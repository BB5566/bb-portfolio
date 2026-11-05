import { afterEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, withDirectives } from 'vue'

// 每個測試重新載入，觀察者才不會沿用上一個測試的
async function mountWithReveal(modifiers: Record<string, boolean> = {}, value?: number) {
  const { vReveal } = await import('@/directives/reveal')
  const Comp = defineComponent({
    render: () => withDirectives(h('div', '內容'), [[vReveal, value, '', modifiers]])
  })
  return mount(Comp)
}

describe('v-reveal 進場', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('不能跑動畫時什麼都不加，內容直接看得到', async () => {
    const wrapper = await mountWithReveal()
    expect(wrapper.classes()).not.toContain('reveal')
  })

  it('捲進畫面才加 revealed，延遲和方式照參數', async () => {
    let callback: IntersectionObserverCallback = () => {}
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(cb: IntersectionObserverCallback) {
          callback = cb
        }
        observe() {}
        unobserve() {}
        disconnect() {}
      }
    )
    vi.stubGlobal('matchMedia', () => ({ matches: true }))

    const wrapper = await mountWithReveal({ left: true }, 140)
    const el = wrapper.element as HTMLElement
    expect(wrapper.classes()).toEqual(expect.arrayContaining(['reveal', 'reveal-left']))
    expect(wrapper.classes()).not.toContain('revealed')
    expect(el.style.getPropertyValue('--reveal-delay')).toBe('140ms')

    callback([{ isIntersecting: true, target: el } as unknown as IntersectionObserverEntry], {} as IntersectionObserver)
    expect(wrapper.classes()).toContain('revealed')
  })
})
