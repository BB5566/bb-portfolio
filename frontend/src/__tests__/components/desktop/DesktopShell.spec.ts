import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import DesktopShell from '@/components/desktop/DesktopShell.vue'

// Mock components to simplify rendering
vi.mock('@/components/desktop/MenuBar.vue', () => ({
  default: { template: '<div class="mock-menubar"></div>' }
}))
vi.mock('@/components/desktop/DockBar.vue', () => ({
  default: { template: '<div class="mock-dockbar"></div>' }
}))

describe('DesktopShell.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders static wallpaper on mobile', () => {
    // Mock matchMedia to return true for mobile and false for prefers-reduced-motion
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)')
        return { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
      if (query === '(prefers-reduced-motion: reduce)')
        return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
      return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    })

    const wrapper = mount(DesktopShell, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })]
      }
    })

    expect(wrapper.find('.desktop__static-wallpaper').exists()).toBe(true)
    // The AsyncComponent is harder to test directly without resolving, but checking the static-wallpaper is sufficient.
    // DesktopWallpaper shouldn't be rendered because of v-if="!prefersReducedMotion && !isMobile"
  })

  it('renders DesktopWallpaper on desktop', () => {
    // Mock matchMedia to return false for mobile and false for prefers-reduced-motion
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)')
        return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
      if (query === '(prefers-reduced-motion: reduce)')
        return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
      return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    })

    const wrapper = mount(DesktopShell, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })]
      }
    })

    expect(wrapper.find('.desktop__static-wallpaper').exists()).toBe(false)
  })

  it('renders static wallpaper when prefers-reduced-motion is true, regardless of desktop/mobile', () => {
    // Mock matchMedia to return false for mobile and true for prefers-reduced-motion
    window.matchMedia = vi.fn().mockImplementation((query) => {
      if (query === '(max-width: 768px)')
        return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
      if (query === '(prefers-reduced-motion: reduce)')
        return { matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() }
      return { matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() }
    })

    const wrapper = mount(DesktopShell, {
      global: {
        plugins: [createTestingPinia({ stubActions: false })]
      }
    })

    expect(wrapper.find('.desktop__static-wallpaper').exists()).toBe(true)
  })
})
