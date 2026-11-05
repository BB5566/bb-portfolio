import gsap from 'gsap'

/**
 * 首屏動效（像素頭像組裝、滑鼠傾斜、數字跑分）。
 * 只在桌機、有滑鼠、沒開「減少動態效果」時才跑；其他情況畫面直接是最終狀態。
 */

export function canAnimateHero(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(
    '(prefers-reduced-motion: no-preference) and (min-width: 768px) and (hover: hover) and (pointer: fine)'
  ).matches
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)

// ── 數字跑分 ─────────────────────────────────────────────

export interface HighlightToken {
  text: string
  kind: 'num' | 'unit' | 'sym'
}

/** 「36s → 9s」拆成數字／英文單位／符號；單位要用內文字體，不然 Bebas Neue 會把 s 變大寫 */
export function tokenizeHighlight(value: string): HighlightToken[] {
  const tokens: HighlightToken[] = []
  for (const m of value.matchAll(/(\d[\d,]*(?:\.\d+)?)|([A-Za-z]+)|([^\dA-Za-z]+)/g)) {
    const kind = m[1] ? 'num' : m[2] ? 'unit' : 'sym'
    tokens.push({ text: m[0], kind })
  }
  return tokens
}

export interface CountPlan {
  index: number // 要跑的是第幾個 token
  from: number
  to: number
  format: (n: number) => string
}

/** 跑最後一個數字：前面有別的數字就從它跑過來（36 → 9），沒有就從 0 開始 */
export function planCount(tokens: HighlightToken[]): CountPlan | null {
  const nums = tokens.flatMap((t, i) => (t.kind === 'num' ? [{ index: i, text: t.text }] : []))
  const last = nums[nums.length - 1]
  if (!last) return null

  const previous = nums[nums.length - 2]
  const text = last.text
  const toNumber = (s: string) => Number(s.replace(/,/g, ''))
  const decimals = text.split('.')[1]?.length ?? 0
  const useComma = text.includes(',')

  return {
    index: last.index,
    from: previous ? toNumber(previous.text) : 0,
    to: toNumber(text),
    format: (n) =>
      useComma
        ? n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
        : n.toFixed(decimals)
  }
}

/** 每一幀呼叫 onFrame(目前值)，跑完停在目標值 */
export function runCount(plan: CountPlan, onFrame: (text: string) => void, duration = 1400) {
  const start = performance.now()
  let done = false
  const finish = () => {
    if (done) return
    done = true
    onFrame(plan.format(plan.to))
  }
  const step = () => {
    if (done) return
    const t = (performance.now() - start) / duration
    if (t >= 1) return finish()
    onFrame(plan.format(plan.from + (plan.to - plan.from) * easeOutCubic(t)))
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
  // 分頁在背景時瀏覽器會暫停 requestAnimationFrame，時間到就直接給最終值
  setTimeout(finish, duration + 100)
}

// ── 像素頭像組裝 ─────────────────────────────────────────

const GRID = 28 // 頭像切成 28×28 格
const SPREAD = 160 // 畫布比頭像每邊多出的空間，讓方塊能從外面飛進來

/**
 * 把頭像取樣成方塊，從散落位置聚合成形，最後淡出畫布露出原圖。
 * 原圖一直都在下面正常顯示，畫布只是蓋在上面。
 */
export function assembleAvatar(img: HTMLImageElement, canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.resolve()

  const size = img.clientWidth
  const border = parseFloat(getComputedStyle(img).borderTopWidth) || 0
  const inner = size - border * 2
  const cssSize = size + SPREAD * 2
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = cssSize * dpr
  canvas.height = cssSize * dpr
  ctx.scale(dpr, dpr)

  // 取樣：把原圖縮成 28×28，每個像素就是一個方塊的顏色
  const sample = document.createElement('canvas')
  sample.width = GRID
  sample.height = GRID
  const sctx = sample.getContext('2d')
  if (!sctx) return Promise.resolve()
  sctx.drawImage(img, 0, 0, GRID, GRID)
  let pixels: Uint8ClampedArray
  try {
    pixels = sctx.getImageData(0, 0, GRID, GRID).data
  } catch {
    return Promise.resolve()
  }

  const cell = inner / GRID
  const origin = SPREAD + border // 頭像內圈左上角在畫布上的位置
  const blocks: { color: string; x: number; y: number; fromX: number; fromY: number; delay: number }[] = []
  for (let gy = 0; gy < GRID; gy++) {
    for (let gx = 0; gx < GRID; gx++) {
      const p = (gy * GRID + gx) * 4
      const angle = Math.random() * Math.PI * 2
      const distance = 80 + Math.random() * 140
      const x = origin + gx * cell
      const y = origin + gy * cell
      blocks.push({
        color: `rgb(${pixels[p]}, ${pixels[p + 1]}, ${pixels[p + 2]})`,
        x,
        y,
        fromX: x + Math.cos(angle) * distance,
        fromY: y + Math.sin(angle) * distance,
        delay: Math.random() * 450
      })
    }
  }

  const backdrop = getComputedStyle(img).backgroundColor
  const FLY = 900
  const start = performance.now()

  const draw = (now: number) => {
    ctx.clearRect(0, 0, cssSize, cssSize)
    // 先用底色蓋住原圖，方塊才看得出是「組起來」的
    ctx.fillStyle = backdrop
    ctx.fillRect(origin, origin, inner, inner)

    for (const b of blocks) {
      const t = Math.min(1, Math.max(0, (now - start - b.delay) / FLY))
      const e = easeOutCubic(t)
      ctx.globalAlpha = Math.min(1, t * 3)
      ctx.fillStyle = b.color
      ctx.fillRect(b.fromX + (b.x - b.fromX) * e, b.fromY + (b.y - b.fromY) * e, cell - 1, cell - 1)
    }
    ctx.globalAlpha = 1
  }

  const total = 450 + FLY + 150 // 最長延遲＋飛行時間＋停一下
  return new Promise((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      draw(start + total)
      // 組好了：畫布淡出，露出原圖
      canvas.style.transition = 'opacity 0.45s ease'
      canvas.style.opacity = '0'
      setTimeout(resolve, 450)
    }
    const tick = () => {
      if (done) return
      const now = performance.now()
      if (now - start >= total) return finish()
      draw(now)
      requestAnimationFrame(tick)
    }
    draw(start) // 第一幀同步畫，避免原圖先閃一下
    requestAnimationFrame(tick)
    setTimeout(finish, total + 100) // 背景分頁暫停 requestAnimationFrame 時的保底
  })
}

// ── 滑鼠傾斜 ───────────────────────────────────

/** 滑鼠在 area 裡移動時，target 輕微 3D 傾斜；只動 transform。回傳清除函式 */
export function enableTilt(area: HTMLElement, target: HTMLElement): () => void {
  gsap.set(target, { transformPerspective: 900 })
  const rotateX = gsap.quickTo(target, 'rotationX', { duration: 0.6, ease: 'power3.out' })
  const rotateY = gsap.quickTo(target, 'rotationY', { duration: 0.6, ease: 'power3.out' })

  let rect = target.getBoundingClientRect()
  const updateRect = () => (rect = target.getBoundingClientRect())

  const onMove = (e: PointerEvent) => {
    const dx = (e.clientX - (rect.left + rect.width / 2)) / area.clientWidth
    const dy = (e.clientY - (rect.top + rect.height / 2)) / area.clientHeight
    rotateY(gsap.utils.clamp(-10, 10, dx * 20))
    rotateX(gsap.utils.clamp(-10, 10, -dy * 20))
  }
  const onLeave = () => {
    rotateX(0)
    rotateY(0)
  }

  area.addEventListener('pointerenter', updateRect)
  area.addEventListener('pointermove', onMove)
  area.addEventListener('pointerleave', onLeave)
  window.addEventListener('scroll', updateRect, { passive: true })
  window.addEventListener('resize', updateRect)

  return () => {
    area.removeEventListener('pointerenter', updateRect)
    area.removeEventListener('pointermove', onMove)
    area.removeEventListener('pointerleave', onLeave)
    window.removeEventListener('scroll', updateRect)
    window.removeEventListener('resize', updateRect)
    gsap.killTweensOf(target)
  }
}
