import type { Directive } from 'vue'

/**
 * 進場動效：元素捲進畫面（上緣過了 90% 高度）時出場一次。
 * v-reveal          往上浮
 * v-reveal.left     從左滑入（列表一列一列）
 * v-reveal.settle   從略小放到原尺寸（圖片、區塊）
 * 值是延遲毫秒，用來錯開同一排的元素：v-reveal="80"
 *
 * 只動 opacity 和 translate／scale；不想看動畫、或瀏覽器沒有 IntersectionObserver 時什麼都不做，
 * 內容一開始就看得到（藏起來的 class 是 JS 加的，不會因為腳本沒跑而整區空白）。
 */

let observer: IntersectionObserver | undefined

function getObserver() {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        entry.target.classList.add('revealed')
        observer?.unobserve(entry.target)
      }
    },
    { rootMargin: '0px 0px -10% 0px' }
  )
  return observer
}

function canReveal() {
  return (
    typeof IntersectionObserver !== 'undefined' &&
    !!window.matchMedia?.('(prefers-reduced-motion: no-preference)').matches
  )
}

export const vReveal: Directive<HTMLElement, number | undefined> = {
  mounted(el, binding) {
    if (!canReveal()) return
    const manner = binding.modifiers.left ? 'left' : binding.modifiers.settle ? 'settle' : 'rise'
    el.style.setProperty('--reveal-delay', `${binding.value ?? 0}ms`)
    el.classList.add('reveal', `reveal-${manner}`)
    getObserver().observe(el)
  },
  unmounted(el) {
    observer?.unobserve(el)
  }
}
