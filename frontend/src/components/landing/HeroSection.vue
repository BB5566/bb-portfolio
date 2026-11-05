<template>
  <section id="top" ref="heroEl" class="hero">
    <div class="container hero-grid">
      <h1 class="name">
        <span class="en">
          {{ profile.display_name || 'BOB' }} {{ profile.display_name_sub || 'TSOU' }}
        </span>
        <span v-if="showZhName" class="zh">{{ profile.name }}</span>
      </h1>

      <!-- 像素自畫像：能跑動畫時是按鈕，點一下重新組合；否則就是一張圖 -->
      <figure class="portrait">
        <component
          :is="playable ? 'button' : 'div'"
          ref="avatarEl"
          class="frame"
          :type="playable ? 'button' : undefined"
          :aria-label="playable ? '重新組合像素頭像' : undefined"
          @click="playable && replay()"
        >
          <img
            ref="imgEl"
            src="/avatar.webp"
            alt="Bob Tsou 像素自畫像"
            width="440"
            height="440"
            fetchpriority="high"
          />
          <canvas v-if="assembling" ref="canvasEl" class="pixels" aria-hidden="true"></canvas>
        </component>
        <figcaption v-if="playable">像素自畫像，點一下重新組合</figcaption>
      </figure>

      <div class="copy">
        <p class="title">{{ profile.title }}</p>
        <p class="bio">{{ profile.hero_intro || profile.bio }}</p>

        <div class="cta">
          <a href="#works" class="btn primary">
            看作品
            <ArrowDown :size="18" />
          </a>
          <a :href="resumeUrl" target="_blank" rel="noopener" class="btn">
            <FileText :size="18" />
            下載履歷
          </a>
          <a :href="githubUrl" target="_blank" rel="noopener" class="text-link">
            <Github :size="18" />
            GitHub
          </a>
        </div>
      </div>
    </div>

    <div class="container">
      <ul ref="highlightsEl" class="highlights" aria-label="亮點數字">
        <li v-for="(item, i) in highlightItems" :key="item.label">
          <strong>
            <span class="visually-hidden">{{ item.value }}</span>
            <span
              v-for="(token, t) in item.tokens"
              :key="t"
              :class="token.kind"
              aria-hidden="true"
              v-text="tokenText(i, t, token.text)"
            ></span>
          </strong>
          <span class="label">{{ item.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowDown, FileText, Github } from 'lucide-vue-next'
import type { Profile, ProfileHighlight } from '@/types/models'
import {
  assembleAvatar,
  canAnimateHero,
  enableTilt,
  planCount,
  runCount,
  tokenizeHighlight
} from './heroMotion'

const props = defineProps<{
  profile: Profile
  resumeUrl: string
  githubUrl: string
}>()

// 第二行只在 name 不是英文名重複時才顯示（例如中文姓名）
const showZhName = computed(() => {
  const en = `${props.profile.display_name ?? ''} ${props.profile.display_name_sub ?? ''}`.trim()
  return props.profile.name.toLowerCase() !== en.toLowerCase()
})

// 首屏三個數字：優先用後台設定的 highlights，沒有就退回年資／作品數／受訓時數
const highlights = computed<ProfileHighlight[]>(() => {
  if (props.profile.highlights?.length) return props.profile.highlights

  const p = props.profile
  return [
    { value: `${p.years_experience ?? 0}+`, label: '年工作經驗' },
    { value: `${p.projects_delivered ?? 0}`, label: '件交付作品' },
    { value: `${p.hours_training ?? 0}h`, label: '受訓時數' }
  ].filter((h) => !h.value.startsWith('0'))
})

const highlightItems = computed(() =>
  highlights.value.map((h) => {
    const tokens = tokenizeHighlight(h.value)
    return { ...h, tokens, plan: planCount(tokens) }
  })
)

// 跑分時顯示目前的數字，其他時候顯示原字
function tokenText(item: number, token: number, text: string) {
  const running = counting.value[item]
  return running !== undefined && token === highlightItems.value[item]?.plan?.index ? running : text
}

// ── 動效（只在 canAnimateHero() 為真時跑，否則畫面就是最終狀態） ──

const heroEl = ref<HTMLElement>()
const avatarEl = ref<HTMLElement>()
const imgEl = ref<HTMLImageElement>()
const canvasEl = ref<HTMLCanvasElement>()
const highlightsEl = ref<HTMLElement>()

const assembling = ref(false)
// 不想看動畫的人（減少動態效果）就只給靜態圖；一開始就判斷好，首幀不會先出 div 再換成 button
const playable = ref(window.matchMedia?.('(prefers-reduced-motion: no-preference)').matches ?? false)
const counting = ref<Record<number, string>>({}) // 跑分中的數字

let observer: IntersectionObserver | undefined
let stopTilt: (() => void) | undefined
let unmounted = false

function startCountUp() {
  const items = highlightItems.value
  // 先把數字歸到起點，進入畫面才開始跑
  items.forEach((item, i) => {
    if (item.plan) counting.value[i] = item.plan.format(item.plan.from)
  })

  observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((e) => e.isIntersecting)) return
      observer?.disconnect()
      items.forEach((item, i) => {
        const plan = item.plan
        if (!plan) return
        setTimeout(() => {
          runCount(plan, (text) => (counting.value[i] = text))
        }, i * 150)
      })
    },
    { threshold: 0.5 }
  )
  if (highlightsEl.value) observer.observe(highlightsEl.value)
}

// 把像素方塊飛回原位組成頭像；組合中再點不會重來
async function assemble() {
  const img = imgEl.value
  if (assembling.value || !img) return
  assembling.value = true
  await nextTick()
  if (canvasEl.value) await assembleAvatar(img, canvasEl.value)
  assembling.value = false
}

function replay() {
  if (imgEl.value?.naturalWidth) assemble()
}

async function startAvatar() {
  const img = imgEl.value
  if (!img) return
  // 等原圖載好、解碼完才開始，原圖本身照常顯示
  if (!img.complete) {
    await new Promise((resolve) => {
      img.addEventListener('load', resolve, { once: true })
      img.addEventListener('error', resolve, { once: true })
    })
  }
  await img.decode().catch(() => {})
  if (unmounted || !img.naturalWidth) return

  await assemble()
  if (unmounted || !heroEl.value || !avatarEl.value) return

  stopTilt = enableTilt(heroEl.value, avatarEl.value)
}

onMounted(() => {
  if (!canAnimateHero()) return
  startCountUp()
  startAvatar()
})

onBeforeUnmount(() => {
  unmounted = true
  observer?.disconnect()
  stopTilt?.()
})
</script>

<style scoped>
/* 首屏：大名字＋像素自畫像，一句介紹、一個主要動作 */
.hero {
  padding: var(--space-xl) 0 var(--space-lg);
  scroll-margin-top: 64px;
  overflow-x: clip; /* 飛進來的像素方塊不撐出橫向捲軸 */
}

.hero-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(280px, 440px);
  grid-template-areas:
    'name portrait'
    'copy portrait';
  grid-template-rows: auto 1fr;
  column-gap: clamp(2rem, 5vw, 5rem);
  align-items: end;
}

.name {
  grid-area: name;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0 0 var(--space-md);
  line-height: 0.88;
}

.name .en {
  font-family: var(--font-display);
  font-size: clamp(4.5rem, 11vw, 9.5rem);
  letter-spacing: 0.02em;
  color: var(--pearl);
}

.name .zh {
  font-size: var(--text-subheading);
  color: var(--chrome);
  font-weight: 500;
  line-height: 1.4;
}

.copy {
  grid-area: copy;
  align-self: start;
}

.title {
  font-size: var(--text-heading);
  font-weight: 600;
  color: var(--volt);
  margin: 0 0 var(--space-sm);
  line-height: 1.25;
}

.bio {
  font-size: 1.125rem;
  color: var(--text-secondary);
  line-height: 1.8;
  max-width: 34em;
  margin: 0 0 var(--space-lg);
  white-space: pre-line;
}

.cta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-sm) var(--space-md);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 24px;
  border-radius: var(--radius-md);
  background: var(--noir-80);
  color: var(--pearl);
  text-decoration: none;
  font-weight: 600;
  transition:
    background 0.2s,
    color 0.2s,
    transform 0.2s;
}

.btn:hover {
  background: var(--noir-70);
  transform: translateY(-2px);
}

.btn.primary {
  background: var(--volt);
  color: var(--ink);
}

.btn.primary:hover {
  background: var(--primary-dark);
}

.text-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-secondary);
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-color: var(--noir-60);
  transition:
    color 0.2s,
    text-decoration-color 0.2s;
}

.text-link:hover {
  color: var(--volt);
  text-decoration-color: currentColor;
}

/* 像素自畫像：方形大圖，不加框、不加光暈，作品本身就是重點 */
.portrait {
  grid-area: portrait;
  align-self: center;
  margin: 0;
}

.frame {
  position: relative;
  display: block;
  width: 100%;
  padding: 0;
  border: 0;
  background: none;
  border-radius: var(--radius-md);
}

button.frame {
  cursor: pointer;
}

button.frame:focus-visible {
  outline: 3px solid var(--volt);
  outline-offset: 6px;
}

.frame img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  border-radius: var(--radius-md);
  background: var(--ink);
}

.frame .pixels {
  position: absolute;
  inset: -160px;
  width: calc(100% + 320px);
  height: calc(100% + 320px);
  pointer-events: none;
}

.portrait figcaption {
  margin-top: var(--space-sm);
  color: var(--text-muted);
  font-size: 0.95rem;
}

/* 亮點數字：不裝盒子，大金字直接排開 */
.highlights {
  list-style: none;
  padding: 0;
  margin: clamp(3rem, 7vw, 5.5rem) 0 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: var(--space-lg);
}

.highlights li {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.highlights strong {
  font-family: var(--font-display);
  font-size: clamp(2.75rem, 5.5vw, 4.75rem);
  font-weight: 400;
  line-height: 0.95;
  color: var(--volt);
  font-variant-numeric: tabular-nums;
}

/* Bebas Neue 沒有小寫，單位（s、MB）改用內文字體才不會變成「36S」 */
.highlights .unit {
  font-family: var(--font-body);
  font-size: 0.5em;
  font-weight: 600;
  margin-left: 0.08em;
}

.highlights .label {
  color: var(--text-secondary);
  font-size: 1rem;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

@media (max-width: 900px) {
  .hero-grid {
    grid-template-columns: minmax(0, 1fr) minmax(200px, 300px);
  }
}

/* 手機：名字和頭像並排當標題列，文字和按鈕排在下面 */
@media (max-width: 640px) {
  .hero {
    padding-top: var(--space-lg);
  }

  .hero-grid {
    grid-template-columns: minmax(0, 1fr) 104px;
    grid-template-areas:
      'name portrait'
      'copy copy';
    grid-template-rows: auto auto;
    column-gap: var(--space-sm);
  }

  .name {
    margin: 0;
    align-self: center;
  }

  .name .en {
    font-size: clamp(3.5rem, 19vw, 5rem);
  }

  .portrait figcaption {
    display: none;
  }

  .copy {
    margin-top: var(--space-md);
  }

  .bio {
    font-size: 1rem;
    margin-bottom: var(--space-md);
  }

  .cta {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .cta .btn {
    justify-content: center;
  }

  .cta .text-link {
    grid-column: 1 / -1;
    justify-self: center;
    padding: 6px 0;
  }

  .highlights {
    grid-template-columns: 1fr;
    gap: var(--space-md);
    margin-top: var(--space-xl);
  }

  .highlights li {
    flex-direction: row;
    align-items: baseline;
    gap: var(--space-sm);
  }

  .highlights strong {
    font-size: 2.75rem;
    min-width: 4.2em;
  }
}
</style>
