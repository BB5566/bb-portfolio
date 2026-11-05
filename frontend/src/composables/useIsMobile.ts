import { onMounted, onUnmounted, ref } from 'vue'

const MOBILE_QUERY = '(max-width: 768px)'

/**
 * 是否為行動裝置尺寸（桌面 OS 在此降級為 Dock + 全螢幕視窗）
 */
export function useIsMobile() {
  const initialValue =
    typeof window !== 'undefined' ? window.matchMedia(MOBILE_QUERY).matches : false
  const isMobile = ref(initialValue)
  let mql: MediaQueryList | null = null
  const update = (e: MediaQueryListEvent) => {
    isMobile.value = e.matches
  }

  onMounted(() => {
    mql = window.matchMedia(MOBILE_QUERY)
    // Synchronize again in case it changed between initial evaluation and mount
    isMobile.value = mql.matches
    mql.addEventListener('change', update)
  })

  onUnmounted(() => {
    mql?.removeEventListener('change', update)
  })

  return isMobile
}
