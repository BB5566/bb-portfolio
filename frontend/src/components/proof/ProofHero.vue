<template>
  <!--
    --mis 控制各色版錯位：1＝完全錯開、0＝對準。
    開場（data-intro="run"）先錯開，450ms 後滑到對準；之後桌機快速移動滑鼠或捲動會微微走位。
  -->
  <section
    id="brief"
    ref="heroEl"
    class="proof-hero"
    :data-intro="intro"
    aria-labelledby="proof-claim"
  >
    <button v-if="intro === 'run'" type="button" class="skip" @click="endIntro(true)">
      跳過開場 ⏭
    </button>

    <ProofFrame class="wrap grid">
      <span class="slug pr" style="--i: 0" aria-hidden="true">
        <span class="swatch">
          <i></i>
          <i></i>
          <i></i>
          <i></i>
        </span>
        BB MADE · 打樣 · 2026 · CMYK
      </span>
      <span class="reg reg-tl" aria-hidden="true"></span>
      <span class="reg reg-br" aria-hidden="true"></span>
      <span class="bar" aria-hidden="true">
        <i v-for="n in 8" :key="n"></i>
        <b>C M Y K</b>
      </span>

      <div class="copy">
        <h1 id="proof-claim" class="claim">
          <span
            v-for="plate in PLATES"
            :key="plate"
            :class="['plate', plate]"
            :aria-hidden="plate !== 'k'"
          >
            <span v-for="(line, i) in claimLines" :key="i" class="line">
              <template v-for="(part, j) in line" :key="j">
                <em v-if="part.kind === 'em'">{{ part.text }}</em>
                <small v-else-if="part.kind === 'small'">{{ part.text }}</small>
                <template v-else>{{ part.text }}</template>
              </template>
            </span>
          </span>
        </h1>
        <p class="who pr" style="--i: 3">{{ name }} — {{ copy.who }}</p>
        <p v-if="copy.pitch" class="pitch pr" style="--i: 4">{{ copy.pitch }}</p>
        <p class="how pr" style="--i: 5">{{ copy.how }}</p>
        <div class="ctas pr" style="--i: 6">
          <a class="btn primary" href="#works">看作品 ↓</a>
          <button type="button" class="btn quick" @click="emit('quick')">60 秒看重點</button>
        </div>
      </div>

      <div class="portrait pr" style="--i: 3">
        <div class="frame" :class="{ ready: halftoneReady }">
          <img
            ref="avatarEl"
            src="/avatar.webp?v=4"
            :alt="`${name} 像素自畫像`"
            width="480"
            height="480"
            @load="renderHalftone"
          />
          <span class="halftone" aria-hidden="true">
            <canvas
              v-for="plate in PLATES"
              :key="plate"
              :ref="(el) => setCanvas(plate, el)"
              :class="['plate', plate]"
            ></canvas>
          </span>
        </div>
        <span class="reg" aria-hidden="true"></span>
      </div>

      <ul v-if="stats.length" class="stats pr" style="--i: 7" aria-label="亮點數字">
        <li v-for="s in stats" :key="s.value">
          <b>{{ s.value }}</b>
          <span>{{ s.label }}</span>
        </li>
      </ul>
    </ProofFrame>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { ProfileHeroProof, ProfileHighlight } from '@/types/models'
import ProofFrame from './ProofFrame.vue'
import {
  canAnimateHero,
  drawHalftone,
  shouldPlayIntro,
  splitClaimLine,
  startDrift,
  type PlateName
} from './proofMotion'

const props = defineProps<{
  name: string
  copy: ProfileHeroProof
  stats: ProfileHighlight[]
}>()

const emit = defineEmits<{ quick: [] }>()

// K 版是真正的文字（給讀者與報讀軟體），C／M／Y 是疊在後面的色版
const PLATES: PlateName[] = ['k', 'c', 'm', 'y']

const claimLines = computed(() => props.copy.claim_lines.map(splitClaimLine))

// ── 四色網點頭像 ──
const avatarEl = ref<HTMLImageElement>()
const canvases: Partial<Record<PlateName, HTMLCanvasElement>> = {}
const halftoneReady = ref(false)

function setCanvas(plate: PlateName, el: unknown) {
  if (el instanceof HTMLCanvasElement) canvases[plate] = el
}

function renderHalftone() {
  const img = avatarEl.value
  if (halftoneReady.value || !img?.naturalWidth) return
  if (!canvases.k || !canvases.c || !canvases.m || !canvases.y) return
  halftoneReady.value = drawHalftone(img, canvases as Record<PlateName, HTMLCanvasElement>)
}

// ── 開場與走位 ──
// 在 setup 就決定，第一次畫面出來就是錯位狀態，不會先閃一下對準的樣子
const intro = ref<'run' | 'done' | 'skip' | undefined>(shouldPlayIntro() ? 'run' : undefined)
const heroEl = ref<HTMLElement>()
const timers: number[] = []
let stopDrift: (() => void) | null = null

function beginDrift() {
  // 手機與減少動態效果：只有開場，沒有走位
  if (!heroEl.value || !canAnimateHero()) return
  stopDrift = startDrift(heroEl.value)
}

function endIntro(skip: boolean) {
  if (intro.value !== 'run') return
  timers.forEach(clearTimeout)
  intro.value = skip ? 'skip' : 'done'
  // 對準動畫 0.9 秒，跑完才開始走位
  timers.push(
    window.setTimeout(
      () => {
        intro.value = undefined
        beginDrift()
      },
      skip ? 50 : 950
    )
  )
}

const onKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') endIntro(true)
}

onMounted(() => {
  if (avatarEl.value?.complete) renderHalftone()
  if (intro.value === 'run') {
    // 0～0.45 秒：裁切線畫出、C／M／Y 版陸續落下；之後 0.9 秒滑到對準，總長約 1.35 秒
    timers.push(window.setTimeout(() => endIntro(false), 450))
    window.addEventListener('keydown', onKey)
  } else {
    beginDrift()
  }
})

onBeforeUnmount(() => {
  timers.forEach(clearTimeout)
  window.removeEventListener('keydown', onKey)
  stopDrift?.()
})
</script>

<style scoped>
.proof-hero {
  --mis: 0;
  position: relative;
  padding: 52px 0 56px;
}

/* 開場先錯開；對準時 --mis 由 1 滑到 0 */
.proof-hero[data-intro='run'] {
  --mis: 1;
}

@media (prefers-reduced-motion: no-preference) {
  .proof-hero[data-intro='done'] {
    transition: --mis 0.9s var(--ease);
  }

  [data-intro='run'] .pr {
    animation: proof-print 0.6s var(--ease) both;
    animation-delay: calc(0.1s + var(--i, 0) * 60ms);
  }

  [data-intro='run'] .plate.c {
    animation: proof-plate 0.35s ease both 0.1s;
  }
  [data-intro='run'] .plate.m {
    animation: proof-plate 0.35s ease both 0.22s;
  }
  [data-intro='run'] .plate.y {
    animation: proof-plate 0.35s ease both 0.34s;
  }
}

@keyframes proof-print {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes proof-plate {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.skip {
  position: fixed;
  top: 72px;
  right: 14px;
  z-index: 80;
  font-family: var(--mono);
  font-size: var(--fs-ui);
  letter-spacing: 0.1em;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(21, 22, 26, 0.85);
  color: #fff;
}

/* ── 色版 ── */
.plate {
  transform: translate(calc(var(--mis) * var(--dx, 0px)), calc(var(--mis) * var(--dy, 0px)));
}
.plate.c {
  --dx: -14px;
  --dy: 5px;
}
.plate.m {
  --dx: 12px;
  --dy: -4px;
}
.plate.y {
  --dx: 3px;
  --dy: 9px;
}

@media (prefers-reduced-motion: reduce) {
  .plate {
    transform: none;
  }
}

/* ── 版面 ── */
.grid {
  display: grid;
  grid-template-columns: 7fr 5fr;
  gap: 40px 64px;
  align-items: start;
}

.slug {
  position: absolute;
  left: 0;
  top: -22px;
  transform: translateY(-100%);
  font-family: var(--mono);
  font-size: var(--fs-mark);
  letter-spacing: 0.12em;
  color: var(--ink-2);
  white-space: nowrap;
  display: flex;
  gap: 14px;
  align-items: center;
}

.swatch {
  display: inline-flex;
  gap: 2px;
}
.swatch i {
  width: 9px;
  height: 9px;
  display: block;
}

/* 色票：C M Y K 實色，後面四格是 50% 網 */
.swatch i:nth-child(1),
.bar i:nth-child(1) {
  background: var(--cy);
}
.swatch i:nth-child(2),
.bar i:nth-child(2) {
  background: var(--mg);
}
.swatch i:nth-child(3),
.bar i:nth-child(3) {
  background: var(--ye);
}
.swatch i:nth-child(4),
.bar i:nth-child(4) {
  background: var(--bk);
}
.bar i:nth-child(5) {
  background: #80d6f7;
}
.bar i:nth-child(6) {
  background: #f580c5;
}
.bar i:nth-child(7) {
  background: #fff880;
}
.bar i:nth-child(8) {
  background: #8f8d8e;
}

.bar {
  position: absolute;
  left: 0;
  bottom: -40px;
  display: flex;
  align-items: center;
  gap: 2px;
  pointer-events: none;
}
.bar i {
  width: 14px;
  height: 10px;
  display: block;
}
.bar b {
  font-family: var(--mono);
  font-size: var(--fs-mark);
  letter-spacing: 0.2em;
  margin-left: 8px;
  color: var(--ink-2);
  font-weight: 400;
}

/* 十字套準記號 */
.reg {
  position: absolute;
  width: 18px;
  height: 18px;
  border: 1px solid var(--ink);
  border-radius: 50%;
  pointer-events: none;
  z-index: 2;
}
.reg::before,
.reg::after {
  content: '';
  position: absolute;
  background: var(--ink);
}
.reg::before {
  left: -5px;
  right: -5px;
  top: 50%;
  height: 1px;
}
.reg::after {
  top: -5px;
  bottom: -5px;
  left: 50%;
  width: 1px;
}
.reg-tl {
  left: -40px;
  top: -40px;
}
.reg-br {
  right: -40px;
  bottom: -40px;
}

/* ── 大標：K 版在最上面，C／M／Y 疊在後面用色彩相乘 ── */
.claim {
  margin-top: 0;
  font-family: var(--serif);
  font-size: clamp(36px, 4.6vw, 66px);
  font-weight: 900;
  line-height: 1.1;
  letter-spacing: 0.01em;
  font-feature-settings: 'palt' 1;
  position: relative;
  isolation: isolate;
}
.claim .plate {
  display: block;
}
.claim .plate.c,
.claim .plate.m,
.claim .plate.y {
  position: absolute;
  inset: 0;
  mix-blend-mode: multiply;
  pointer-events: none;
  z-index: -1;
}
.claim .plate.c {
  color: var(--cy);
}
.claim .plate.m {
  color: var(--mg);
}
.claim .plate.y {
  color: var(--ye);
}
.claim .line {
  display: block;
  white-space: nowrap;
}
.claim em {
  font-style: normal;
  font-family: var(--latin);
  font-weight: 700;
  letter-spacing: -0.02em;
}
.claim .plate.k em {
  color: var(--accent-ink);
}
.claim small {
  font-family: var(--sans);
  font-weight: 500;
  font-size: 0.26em;
  color: var(--ink-2);
  letter-spacing: 0.04em;
  vertical-align: middle;
}
.claim .plate.c small,
.claim .plate.m small,
.claim .plate.y small {
  visibility: hidden;
}

.who {
  margin-top: 18px;
  font-size: var(--fs-lead);
  font-weight: 700;
  text-wrap: pretty;
}
.pitch {
  margin-top: 10px;
  font-size: var(--fs-lead);
  line-height: 1.8;
  max-width: 32em;
  color: var(--ink);
  text-wrap: pretty;
}
.how {
  margin-top: 14px;
  font-size: var(--fs-body);
  line-height: 1.7;
  max-width: 34em;
  padding-left: 14px;
  border-left: 2px solid var(--accent);
  text-wrap: pretty;
}

.ctas {
  margin-top: 28px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.btn {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 12px;
  font: inherit;
  font-weight: 700;
  font-size: var(--fs-body);
  color: var(--ink);
  text-decoration: none;
  border: 1.5px solid var(--ink);
  background: transparent;
  cursor: pointer;
}
.btn.primary {
  background: var(--ink);
  color: var(--paper);
}
.btn.ghost {
  border-color: var(--rule);
}
.btn.quick {
  border-color: var(--accent);
  color: var(--accent-ink);
}

/* ── 頭像：網點畫好後蓋掉原圖 ── */
.portrait {
  position: relative;
}
.portrait .reg {
  right: -32px;
  top: -32px;
}
.frame {
  aspect-ratio: 1 / 1;
  border-radius: 28px;
  overflow: hidden;
  position: relative;
  background: #f7f3ec;
}
.frame img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.6s;
}
.frame.ready img {
  opacity: 0;
}
.halftone canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  mix-blend-mode: multiply;
}

.stats {
  grid-column: 1 / -1;
  list-style: none;
  margin: 0;
  padding: 24px 0 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
  border-top: 1px solid var(--rule);
}
.stats b {
  display: block;
  font-family: var(--latin);
  font-weight: 700;
  font-size: var(--fs-big);
  line-height: 1.05;
  letter-spacing: -0.02em;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.stats span {
  display: block;
  font-size: var(--fs-ui);
  color: var(--ink-2);
  margin-top: 6px;
}

@media (max-width: 900px) {
  .proof-hero {
    padding: 16px 0 48px;
  }
  .grid {
    grid-template-columns: 1fr;
    gap: 28px;
  }
  .portrait {
    max-width: 300px;
  }
  .portrait .reg,
  .reg-tl,
  .reg-br {
    display: none;
  }
  .stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .claim {
    font-size: clamp(26px, 8.4vw, 44px);
  }
  .slug {
    position: static;
    transform: none;
    margin-bottom: 16px;
  }
  .bar {
    bottom: -30px;
  }
}

/* 平板：頭像左、三個數字右，不讓頭像一個人佔一行、右半邊空著 */
@media (min-width: 641px) and (max-width: 900px) {
  .grid {
    grid-template-columns: minmax(0, 300px) 1fr;
    column-gap: 40px;
  }
  .slug,
  .copy {
    grid-column: 1 / -1;
  }
  .stats {
    grid-column: 2;
    align-self: center;
    padding-top: 0;
    border-top: 0;
  }
}

/* 手機：主要行動改成滿版單欄，拇指好按、版面也整齊 */
@media (max-width: 640px) {
  .ctas {
    flex-direction: column;
    align-items: stretch;
  }
  .ctas .btn {
    justify-content: center;
    width: 100%;
  }
}
</style>
