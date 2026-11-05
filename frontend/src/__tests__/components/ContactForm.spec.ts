import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import ContactForm from '@/components/ContactForm.vue'

// Mock contact service
vi.mock('@/services/contact', () => ({
  submitContactForm: vi.fn()
}))

// Mock gtag
vi.mock('@/plugins/gtag', () => ({
  useGtag: () => ({
    trackContactFormSubmit: vi.fn()
  })
}))

import { submitContactForm } from '@/services/contact'

describe('ContactForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mountComponent = () => {
    return mount(ContactForm, {
      global: {
        stubs: {
          i: true
        }
      }
    })
  }

  describe('渲染', () => {
    it('應該正確渲染表單欄位', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('#name').exists()).toBe(true)
      expect(wrapper.find('#email').exists()).toBe(true)
      expect(wrapper.find('#subject').exists()).toBe(true)
      expect(wrapper.find('#message').exists()).toBe(true)
      expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    })

    it('應該顯示必填標記', () => {
      const wrapper = mountComponent()
      const requiredMarkers = wrapper.findAll('.required')

      expect(requiredMarkers.length).toBe(3) // name, email, message
    })

    it('主旨欄位應該顯示選填', () => {
      const wrapper = mountComponent()

      expect(wrapper.find('.optional').text()).toContain('選填')
    })
  })

  describe('表單驗證', () => {
    it('空白表單提交應該顯示錯誤', async () => {
      const wrapper = mountComponent()

      await wrapper.find('form').trigger('submit')

      expect(wrapper.findAll('.error-message').length).toBeGreaterThan(0)
      expect(submitContactForm).not.toHaveBeenCalled()
    })

    it('姓名為空應該顯示錯誤', async () => {
      const wrapper = mountComponent()

      await wrapper.find('#email').setValue('test@example.com')
      await wrapper.find('#message').setValue('這是一段測試訊息內容')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.text()).toContain('請輸入您的姓名')
    })

    it('無效的 email 格式應該顯示錯誤', async () => {
      const wrapper = mountComponent()

      await wrapper.find('#name').setValue('測試者')
      await wrapper.find('#email').setValue('invalid-email')
      await wrapper.find('#message').setValue('這是一段測試訊息內容')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.text()).toContain('請輸入有效的電子郵件格式')
    })

    it('訊息太短應該顯示錯誤', async () => {
      const wrapper = mountComponent()

      await wrapper.find('#name').setValue('測試者')
      await wrapper.find('#email').setValue('test@example.com')
      await wrapper.find('#message').setValue('太短')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.text()).toContain('訊息內容至少需要 10 個字元')
    })

    it('訊息超過 5000 字應該顯示錯誤', async () => {
      const wrapper = mountComponent()

      await wrapper.find('#name').setValue('測試者')
      await wrapper.find('#email').setValue('test@example.com')
      await wrapper.find('#message').setValue('a'.repeat(5001))
      await wrapper.find('form').trigger('submit')

      expect(wrapper.text()).toContain('訊息內容不得超過 5000 個字元')
    })
  })

  describe('表單提交', () => {
    it('有效表單應該呼叫 API', async () => {
      vi.mocked(submitContactForm).mockResolvedValue({
        message: '感謝您的訊息！',
        success: true
      })

      const wrapper = mountComponent()

      // 使用 input event 確保 v-model 更新
      const nameInput = wrapper.find('#name')
      const emailInput = wrapper.find('#email')
      const messageInput = wrapper.find('#message')

      await nameInput.setValue('測試者')
      await nameInput.trigger('input')

      await emailInput.setValue('test@example.com')
      await emailInput.trigger('input')

      await messageInput.setValue('這是一段測試訊息內容，超過十個字')
      await messageInput.trigger('input')

      // 等待所有更新完成
      await flushPromises()

      await wrapper.find('form').trigger('submit')
      await flushPromises()

      // 驗證 API 被呼叫
      expect(submitContactForm).toHaveBeenCalled()
    })

    it('提交成功應該顯示成功訊息', async () => {
      vi.mocked(submitContactForm).mockResolvedValue({
        message: '感謝您的訊息！',
        success: true
      })

      const wrapper = mountComponent()

      await wrapper.find('#name').setValue('測試者')
      await wrapper.find('#email').setValue('test@example.com')
      await wrapper.find('#message').setValue('這是一段測試訊息內容，超過十個字')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.find('.alert-success').exists()).toBe(true)
      expect(wrapper.text()).toContain('感謝您的訊息')
    })

    it('提交成功後應該重置表單', async () => {
      vi.mocked(submitContactForm).mockResolvedValue({
        message: '感謝您的訊息！',
        success: true
      })

      const wrapper = mountComponent()
      const nameInput = wrapper.find('#name')
      const emailInput = wrapper.find('#email')
      const messageInput = wrapper.find('#message')

      await nameInput.setValue('測試者')
      await emailInput.setValue('test@example.com')
      await messageInput.setValue('這是一段測試訊息內容，超過十個字')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect((nameInput.element as HTMLInputElement).value).toBe('')
      expect((emailInput.element as HTMLInputElement).value).toBe('')
      expect((messageInput.element as HTMLTextAreaElement).value).toBe('')
    })

    it('提交失敗應該顯示錯誤訊息', async () => {
      vi.mocked(submitContactForm).mockRejectedValue({
        response: {
          data: {
            message: '伺服器錯誤'
          }
        }
      })

      const wrapper = mountComponent()

      await wrapper.find('#name').setValue('測試者')
      await wrapper.find('#email').setValue('test@example.com')
      await wrapper.find('#message').setValue('這是一段測試訊息內容，超過十個字')
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      expect(wrapper.find('.alert-error').exists()).toBe(true)
    })
  })

  describe('Loading 狀態', () => {
    it('提交時應該顯示 loading 狀態', async () => {
      let resolvePromise: (value: { message: string; success: boolean }) => void
      vi.mocked(submitContactForm).mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePromise = resolve
        })
      })

      const wrapper = mountComponent()

      await wrapper.find('#name').setValue('測試者')
      await wrapper.find('#email').setValue('test@example.com')
      await wrapper.find('#message').setValue('這是一段測試訊息內容，超過十個字')
      await wrapper.find('form').trigger('submit')

      // 檢查 loading 狀態
      expect(wrapper.find('.submit-btn').classes()).toContain('loading')
      expect(wrapper.find('.submit-btn').attributes('disabled')).toBeDefined()

      // 完成請求
      resolvePromise!({ message: '成功', success: true })
      await flushPromises()

      expect(wrapper.find('.submit-btn').classes()).not.toContain('loading')
    })

    it('loading 時輸入欄位應該被禁用', async () => {
      let resolvePromise: (value: { message: string; success: boolean }) => void
      vi.mocked(submitContactForm).mockImplementation(() => {
        return new Promise((resolve) => {
          resolvePromise = resolve
        })
      })

      const wrapper = mountComponent()

      await wrapper.find('#name').setValue('測試者')
      await wrapper.find('#email').setValue('test@example.com')
      await wrapper.find('#message').setValue('這是一段測試訊息內容，超過十個字')
      await wrapper.find('form').trigger('submit')

      expect(wrapper.find('#name').attributes('disabled')).toBeDefined()
      expect(wrapper.find('#email').attributes('disabled')).toBeDefined()
      expect(wrapper.find('#message').attributes('disabled')).toBeDefined()

      resolvePromise!({ message: '成功', success: true })
      await flushPromises()
    })
  })

  describe('字數計算', () => {
    it('應該顯示訊息字數', async () => {
      const wrapper = mountComponent()

      await wrapper.find('#message').setValue('測試訊息')

      expect(wrapper.find('.char-count').text()).toContain('4')
    })

    it('超過 4500 字應該顯示警告樣式', async () => {
      const wrapper = mountComponent()

      await wrapper.find('#message').setValue('a'.repeat(4501))

      expect(wrapper.find('.char-count').classes()).toContain('warning')
    })
  })
})
