import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useDesktopStore } from '@/stores/desktop'

describe('desktop store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('開啟視窗後會出現在清單並成為作用中視窗', () => {
    const desktop = useDesktopStore()
    desktop.open('finder')

    expect(desktop.isOpen('finder')).toBe(true)
    expect(desktop.activeId).toBe('finder')
  })

  it('重複開啟同一個 app 不會產生第二個視窗，只會提到最上層', () => {
    const desktop = useDesktopStore()
    desktop.open('finder')
    desktop.open('terminal')
    desktop.open('finder')

    expect(desktop.windows).toHaveLength(2)
    expect(desktop.activeId).toBe('finder')
  })

  it('後開的視窗 z-index 較高，focus 可把舊視窗提到最上層', () => {
    const desktop = useDesktopStore()
    desktop.open('finder')
    desktop.open('mail')
    expect(desktop.activeId).toBe('mail')

    desktop.focus('finder')
    expect(desktop.activeId).toBe('finder')
    expect(desktop.find('finder')!.z).toBeGreaterThan(desktop.find('mail')!.z)
  })

  it('最小化的視窗仍然開著，但不會是作用中視窗', () => {
    const desktop = useDesktopStore()
    desktop.open('terminal')
    desktop.minimize('terminal')

    expect(desktop.isOpen('terminal')).toBe(true)
    expect(desktop.find('terminal')!.minimized).toBe(true)
    expect(desktop.activeId).toBeNull()
  })

  it('toggle：未開→開啟，在最上層→最小化，已最小化→還原', () => {
    const desktop = useDesktopStore()

    desktop.toggle('calendar')
    expect(desktop.isOpen('calendar')).toBe(true)

    desktop.toggle('calendar')
    expect(desktop.find('calendar')!.minimized).toBe(true)

    desktop.toggle('calendar')
    expect(desktop.find('calendar')!.minimized).toBe(false)
    expect(desktop.activeId).toBe('calendar')
  })

  it('關閉視窗後可從 Dock 重新開啟', () => {
    const desktop = useDesktopStore()
    desktop.open('profiler')
    desktop.close('profiler')
    expect(desktop.isOpen('profiler')).toBe(false)

    desktop.open('profiler')
    expect(desktop.isOpen('profiler')).toBe(true)
  })

  it('closeAll 會清空所有視窗', () => {
    const desktop = useDesktopStore()
    desktop.open('finder')
    desktop.open('mail')
    desktop.closeAll()

    expect(desktop.windows).toHaveLength(0)
    expect(desktop.activeId).toBeNull()
  })

  it('move 會更新視窗座標', () => {
    const desktop = useDesktopStore()
    desktop.open('finder')
    desktop.move('finder', 120, 64)

    expect(desktop.find('finder')).toMatchObject({ x: 120, y: 64 })
  })
})
