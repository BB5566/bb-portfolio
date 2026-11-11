/**
 * 印刷打樣首頁（/v5）的首屏效果：
 * - 大標拆字：數字＋單位、AI 這類大寫縮寫變強調色，結尾的「（…）」變小字
 * - 頭像四色網點：K／C／M／Y 各畫一張畫布，之後可以各自錯位
 * - 套色走位：快速滑鼠或捲動時各色版微微錯開，停下來就對準
 */

// ── 大標拆字 ─────────────────────────────────────────────

export interface ClaimPart {
  text: string
  kind: 'text' | 'em' | 'small'
}

/** 「壓成 79 KB。（本機量測）」→ 壓成／79 KB（強調）／。／（本機量測）（小字） */
export function splitClaimLine(line: string): ClaimPart[] {
  const parts: ClaimPart[] = []
  let last = 0
  for (const m of line.matchAll(/(\d[\d,.]*(?:\s?[A-Za-z]+)?|\b[A-Z]{2,}\b)|(（[^）]*）)/g)) {
    const index = m.index ?? 0
    if (index > last) parts.push({ text: line.slice(last, index), kind: 'text' })
    parts.push({ text: m[0], kind: m[1] ? 'em' : 'small' })
    last = index + m[0].length
  }
  if (last < line.length) parts.push({ text: line.slice(last), kind: 'text' })
  return parts
}

// ── 開場：這一版剛下機 ───────────────────────────────────

/** 走位只在桌機、有滑鼠、沒開「減少動態效果」時才跑 */
export function canAnimateHero(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  return window.matchMedia(
    '(prefers-reduced-motion: no-preference) and (min-width: 768px) and (hover: hover) and (pointer: fine)'
  ).matches
}

const INTRO_KEY = 'proof-intro-seen'

/** 第一次進來、沒開「減少動態效果」才播；同一個分頁再進來就不播 */
export function shouldPlayIntro(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    if (sessionStorage.getItem(INTRO_KEY) === '1') return false
    sessionStorage.setItem(INTRO_KEY, '1')
  } catch {
    // 無痕視窗或封鎖網站資料時讀不到，照樣播
  }
  return true
}

// ── 頭像四色網點 ─────────────────────────────────────────

export type PlateName = 'k' | 'c' | 'm' | 'y'

// 各色版的油墨顏色與網點角度（印刷常用的錯開角度，避免疊出波紋）
const INKS: Record<PlateName, { color: string; angle: number }> = {
  k: { color: '#231F20', angle: 45 },
  c: { color: '#00AEEF', angle: 15 },
  m: { color: '#EC008C', angle: 75 },
  y: { color: '#FFF100', angle: 0 }
}

const SIZE = 480 // 畫布邊長
const CELL = 4.5 // 網點間距

/** 把圖片拆成四色網點畫到四張畫布上。圖片讀不到像素（跨網域）時回傳 false，畫面維持原圖 */
export function drawHalftone(
  img: HTMLImageElement,
  canvases: Record<PlateName, HTMLCanvasElement>
): boolean {
  const source = document.createElement('canvas')
  source.width = source.height = SIZE
  const sctx = source.getContext('2d', { willReadFrequently: true })
  if (!sctx) return false
  sctx.drawImage(img, 0, 0, SIZE, SIZE)
  let data: Uint8ClampedArray
  try {
    data = sctx.getImageData(0, 0, SIZE, SIZE).data
  } catch {
    return false
  }

  // RGB 轉 CMYK，再乘上透明度（去背的地方不畫網點）
  const inkAt = (x: number, y: number, plate: PlateName) => {
    const i = (y * SIZE + x) * 4
    const r = (data[i] ?? 0) / 255
    const g = (data[i + 1] ?? 0) / 255
    const b = (data[i + 2] ?? 0) / 255
    const a = (data[i + 3] ?? 0) / 255
    const k = 1 - Math.max(r, g, b)
    if (plate === 'k') return k * a
    const rest = 1 - k || 1
    const channel = plate === 'c' ? r : plate === 'm' ? g : b
    return ((1 - channel - k) / rest) * a
  }

  for (const plate of Object.keys(INKS) as PlateName[]) {
    const canvas = canvases[plate]
    const ctx = canvas.getContext('2d')
    if (!ctx) return false
    canvas.width = canvas.height = SIZE
    const { color, angle } = INKS[plate]
    const rad = (angle * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    ctx.fillStyle = color
    ctx.translate(SIZE / 2, SIZE / 2)
    ctx.rotate(rad)

    // 在旋轉後的格線上逐點取樣，網點大小跟油墨量成正比
    const n = Math.ceil((SIZE * 0.75) / CELL)
    for (let i = -n; i <= n; i++) {
      for (let j = -n; j <= n; j++) {
        const px = i * CELL
        const py = j * CELL
        const sx = Math.round(px * cos - py * sin + SIZE / 2)
        const sy = Math.round(px * sin + py * cos + SIZE / 2)
        if (sx < 0 || sy < 0 || sx >= SIZE || sy >= SIZE) continue
        const ink = inkAt(sx, sy, plate)
        if (ink <= 0.03) continue
        ctx.beginPath()
        ctx.arc(px, py, CELL * 0.58 * Math.sqrt(ink), 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  return true
}

// ── 套色走位 ─────────────────────────────────────────────

/**
 * 以滑鼠速度與捲動速度推動 el 的 --mis（0＝對準，最大 0.3），靜止後回到 0。
 * 回傳清除函式。
 */
export function startDrift(el: HTMLElement): () => void {
  const MAX = 0.3
  let speed = 0
  let mis = 0
  let raf = 0
  let lastX: number | null = null
  let lastY = 0
  let lastT = 0
  let lastScroll = window.scrollY
  let lastScrollT = performance.now()

  const tick = () => {
    mis += (speed - mis) * 0.25
    speed *= 0.82
    if (mis > 0.004 || speed > 0.004) {
      el.style.setProperty('--mis', mis.toFixed(3))
      raf = requestAnimationFrame(tick)
    } else {
      el.style.setProperty('--mis', '0')
      raf = 0
    }
  }
  const bump = (v: number) => {
    if (v <= 0) return
    speed = Math.max(speed, Math.min(MAX, v))
    if (!raf) raf = requestAnimationFrame(tick)
  }

  const onPointer = (e: PointerEvent) => {
    const t = performance.now()
    if (lastX !== null && t > lastT) {
      const v = Math.hypot(e.clientX - lastX, e.clientY - lastY) / (t - lastT)
      bump((v - 1.2) / 6) // 慢慢移不會動，甩一下才錯位
    }
    lastX = e.clientX
    lastY = e.clientY
    lastT = t
  }
  const onScroll = () => {
    const t = performance.now()
    const v = Math.abs(window.scrollY - lastScroll) / Math.max(1, t - lastScrollT)
    lastScroll = window.scrollY
    lastScrollT = t
    bump((v - 0.8) / 8)
  }

  window.addEventListener('pointermove', onPointer, { passive: true })
  window.addEventListener('scroll', onScroll, { passive: true })
  return () => {
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('scroll', onScroll)
    if (raf) cancelAnimationFrame(raf)
    el.style.removeProperty('--mis')
  }
}
