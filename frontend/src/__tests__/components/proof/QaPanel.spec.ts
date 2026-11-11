import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import QaPanel from '@/components/proof/QaPanel.vue'
import { QA, findAnswer } from '@/components/proof/proofQa'

const mountQa = () => mount(QaPanel, { props: { open: true, email: 'hello@bb-made.com' } })

describe('QaPanel', () => {
  it('點預設問題，回答旁邊附出處', async () => {
    const wrapper = mountQa()
    await wrapper.find('.chips button').trigger('click')
    const last = wrapper.findAll('.a').at(-1)
    expect(last?.text()).toContain('Vue 3')
    expect(last?.find('.src').text()).toContain('出處')
  })

  it('作品集沒寫的老實說沒提到，請對方寄信', async () => {
    const wrapper = mountQa()
    await wrapper.find('input').setValue('薪水多少？')
    await wrapper.find('form').trigger('submit')
    const last = wrapper.findAll('.a').at(-1)
    expect(last?.classes()).toContain('fallback')
    expect(last?.find('a').attributes('href')).toBe('mailto:hello@bb-made.com')
  })

  it('關著的時候不畫出來', () => {
    const wrapper = mount(QaPanel, { props: { open: false, email: null } })
    expect(wrapper.find('.qa').exists()).toBe(false)
  })
})

describe('findAnswer', () => {
  it('自己打字也找得到：有關鍵字就算', () => {
    expect(findAnswer('你們用 Nuxt 嗎')?.q).toBe('他會 Vue 嗎？')
  })

  it('「學生端」不會被當成在問進修', () => {
    expect(findAnswer('學生端效能怎麼做')).toBeUndefined()
  })

  it('能遠端嗎：有實際答案，不是「沒提到」', () => {
    expect(findAnswer('能遠端嗎？')?.a).toContain('遠距與混合型')
  })

  it('預設題每一題都答得出來', () => {
    expect(QA.every((x) => x.a && x.source)).toBe(true)
  })
})
