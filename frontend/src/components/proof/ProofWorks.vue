<template>
  <section id="works" class="proof-works" aria-labelledby="proof-works-title">
    <ProofFrame class="wrap">
      <div class="shead">
        <h2 id="proof-works-title">
          打樣
          <small>精選 {{ featured.length }} / {{ projects.length }}</small>
        </h2>
        <button
          v-if="others.length"
          type="button"
          class="more"
          :aria-expanded="showAll"
          aria-controls="proof-works-all"
          @click="showAll = !showAll"
        >
          {{ showAll ? '收起' : `看全部 ${projects.length} 件` }} {{ showAll ? '↑' : '→' }}
        </button>
      </div>

      <!-- 精選三件：問題 → 做法 → 結果，每件帶一個能親手試的東西 -->
      <div class="cards">
        <article v-for="p in featured" :key="p.id" class="card">
          <div class="cover">
            <img
              v-if="p.cover_image_url"
              :src="p.cover_image_url"
              :alt="p.title"
              width="1200"
              height="675"
              loading="lazy"
            />
          </div>
          <div class="body">
            <span v-if="p.category" class="cat">{{ p.category.name }}</span>
            <h3>
              <RouterLink :to="{ name: 'ProjectDetail', params: { id: p.id } }">
                {{ p.title }}
              </RouterLink>
            </h3>
            <dl v-if="p.case_study" class="case">
              <dt>問題</dt>
              <dd>{{ p.case_study.problem }}</dd>
              <dt>我怎麼做</dt>
              <dd>{{ p.case_study.approach }}</dd>
              <dt>結果</dt>
              <dd class="result">{{ p.case_study.result }}</dd>
            </dl>
            <div v-if="p.technologies?.length" class="tags">
              <span v-for="t in p.technologies.slice(0, 3)" :key="t">{{ t }}</span>
            </div>

            <SizeCompare v-if="p.case_study?.compare" v-bind="p.case_study.compare" />
            <div v-else-if="p.case_study?.demo === 'pipeline'" class="act">
              <button
                ref="playButton"
                type="button"
                class="act-btn"
                :aria-expanded="playing"
                aria-controls="proof-play"
                @click="togglePlay"
              >
                ▶ 親手跑一次
              </button>
            </div>
            <div v-else-if="p.project_link" class="act">
              <a class="act-btn ghost" :href="p.project_link" target="_blank" rel="noopener">
                試玩正式站 ↗
              </a>
            </div>
            <!-- 沒東西可試的（例如「我怎麼審 AI」）也給一顆，三張卡底部才對齊 -->
            <div v-else class="act">
              <RouterLink
                class="act-btn ghost"
                :to="{ name: 'ProjectDetail', params: { id: p.id } }"
              >
                看完整做法 →
              </RouterLink>
            </div>
          </div>
        </article>
      </div>

      <!-- 親手跑一次：桌機在卡片下面展開；手機蓋滿整個畫面 -->
      <div
        v-if="playing"
        id="proof-play"
        class="play"
        role="region"
        aria-label="親手跑一次地端 AI 內容產線"
        @keydown.esc="togglePlay"
      >
        <div class="play-head">
          <span>CASE STUDY · 地端 AI 內容產線 · 2026/07 起一人重建</span>
          <button ref="closeButton" type="button" @click="togglePlay">收合 ✕</button>
        </div>
        <div class="play-body">
          <h3>親手跑一次這條產線。</h3>
          <p>點一個輸入，看它在本機怎麼變成文件。考題與逐字核對流程是真的；海報與貼文為示意稿。</p>
          <PipelineDemo />
        </div>
      </div>

      <!-- 其他作品做成色票卡：上面封面、下面白條寫色號式編號與名稱 -->
      <ul v-if="showAll" id="proof-works-all" class="all">
        <li v-for="p in others" :key="p.id">
          <RouterLink :to="{ name: 'ProjectDetail', params: { id: p.id } }">
            <span class="chip-img">
              <img
                v-if="p.cover_image_url"
                :src="p.cover_image_url"
                alt=""
                width="1200"
                height="675"
                loading="lazy"
                decoding="async"
              />
            </span>
            <span class="label">
              <span class="code">
                BB {{ code(p) }}
                <template v-if="p.category">· {{ p.category.name }}</template>
              </span>
              <span class="title">{{ p.title }}</span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </ProofFrame>
  </section>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, nextTick, onBeforeUnmount, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Project } from '@/types/models'
import { useGtag } from '@/plugins/gtag'
import ProofFrame from './ProofFrame.vue'
import SizeCompare from './SizeCompare.vue'

const { trackEvent } = useGtag()

// 產線示範按了才載入，首頁不用先付這段程式
const PipelineDemo = defineAsyncComponent(() => import('./PipelineDemo.vue'))

const props = defineProps<{ projects: Project[] }>()

// 有填 case_study 的才是精選（內容在 ProjectSeeder）
const featured = computed(() => props.projects.filter((p) => p.case_study))
const others = computed(() => props.projects.filter((p) => !p.case_study))

// 色票編號照全部作品的順序，兩位數
const code = (p: Project) => String(props.projects.indexOf(p) + 1).padStart(2, '0')

const showAll = ref(false)
const playing = ref(false)
const playButton = ref<HTMLButtonElement[]>()
const closeButton = ref<HTMLButtonElement>()

const isPhone = () => window.matchMedia?.('(max-width: 900px)').matches ?? false

async function togglePlay() {
  playing.value = !playing.value
  if (playing.value) trackEvent('open_pipeline_demo')
  // 手機是全螢幕，背後的頁面先不要捲
  document.body.style.overflow = playing.value && isPhone() ? 'hidden' : ''
  await nextTick()
  if (playing.value) {
    closeButton.value?.focus({ preventScroll: true })
    if (!isPhone()) document.getElementById('proof-play')?.scrollIntoView({ behavior: 'smooth' })
  } else {
    playButton.value?.[0]?.focus()
  }
}

onBeforeUnmount(() => {
  document.body.style.overflow = ''
})
</script>

<style scoped>
.proof-works {
  padding: 60px 0 48px;
}

.shead {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 22px;
}

.shead h2 {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: 900;
  letter-spacing: 0.02em;
}

.shead h2 small {
  font-family: var(--latin);
  font-size: var(--fs-ui);
  letter-spacing: 0.04em;
  color: var(--ink-2);
}

.more {
  padding: 0;
  border: 0;
  border-bottom: 1.5px solid currentColor;
  background: none;
  color: var(--ink);
  font: inherit;
  font-size: var(--fs-ui);
  font-weight: 700;
  cursor: pointer;
}

/* ── 作品卡 ── */
.cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--rule);
  border-radius: 16px;
  background: #fff;
}

.cover {
  position: relative;
  aspect-ratio: 16 / 9;
  background: #e9e2d4;
}

.cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.body {
  display: flex;
  flex-direction: column;
  flex: 1;
  padding: 20px;
}

.cat {
  font-family: var(--latin);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.14em;
  color: var(--accent-ink);
}

.card h3 {
  margin: 6px 0 0;
  font-size: var(--fs-lead);
  font-weight: 900;
}

.card h3 a {
  color: inherit;
  text-decoration: none;
}

.card h3 a:hover {
  text-decoration: underline;
}

.case {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 10px;
  margin: 10px 0 0;
  font-size: var(--fs-body);
  line-height: 1.6;
}

.case dt {
  padding-top: 3px;
  font-family: var(--latin);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--accent-ink);
  white-space: nowrap;
}

.case dd {
  margin: 0;
  color: var(--ink);
  text-wrap: pretty;
}

.case dd.result {
  color: var(--ink);
  font-weight: 500;
}

.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 12px;
}

.tags span {
  padding: 4px 9px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  font-size: var(--fs-small);
  color: var(--ink-2);
}

.act {
  margin-top: auto;
  padding-top: 16px;
}

.act-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 16px;
  border: 0;
  border-radius: 10px;
  background: var(--accent-ink);
  color: #fff;
  font: inherit;
  font-size: var(--fs-ui);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  transition: transform 0.15s;
}

.act-btn:active {
  transform: scale(0.97);
}

.act-btn.ghost {
  border: 1.5px solid var(--ink);
  background: transparent;
  color: var(--ink);
  box-shadow: none;
}

/* ── 展開的產線示範 ── */
.play {
  margin-top: 20px;
  overflow: hidden;
  border: 1px solid var(--rule);
  border-radius: 16px;
  background: var(--paper);
  scroll-margin-top: 16px;
}

.play-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  min-height: 44px;
  padding: 0 14px;
  background: var(--ink);
  color: #d9d4c8;
  font-family: var(--mono);
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
}

.play-head button {
  flex: none;
  min-height: 32px;
  padding: 0 10px;
  border: 1px solid rgba(243, 239, 230, 0.35);
  border-radius: 8px;
  background: none;
  color: #f3efe6;
  font: inherit;
  font-weight: 700;
  font-size: var(--fs-small);
  cursor: pointer;
}

.play-body {
  padding: 28px 28px 40px;
}

.play-body h3 {
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: 900;
}

.play-body p {
  max-width: 40em;
  margin: 8px 0 28px;
  font-size: var(--fs-body);
  line-height: 1.7;
  color: var(--ink);
}

/* ── 其他作品：色票卡 ── */
.all {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin: 28px 0 0;
  padding: 0;
  list-style: none;
}

.all a {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--rule);
  background: #fff;
  color: var(--ink);
  text-decoration: none;
  box-shadow: 0 1px 2px rgb(21 22 26 / 6%);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.all a:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 18px rgb(21 22 26 / 12%);
}

.chip-img {
  display: block;
  aspect-ratio: 16 / 9;
  background: var(--rule);
  overflow: hidden;
}

.chip-img img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px 16px;
}

.code {
  font-family: var(--mono);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.12em;
  color: var(--ink-2);
}

.all .title {
  font-size: var(--fs-body);
  font-weight: 700;
  line-height: 1.4;
}

.all a:hover .title {
  text-decoration: underline;
}

@media (max-width: 1100px) {
  .all {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 900px) {
  .cards {
    grid-template-columns: 1fr;
  }

  .all {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  /* 手機：示範蓋滿整個畫面，自己捲 */
  .play {
    position: fixed;
    inset: 0;
    z-index: 90;
    margin: 0;
    border: 0;
    border-radius: 0;
    overflow: auto;
  }

  .play-head {
    position: sticky;
    top: 0;
    z-index: 5;
  }

  .play-body {
    padding: 20px 16px 40px;
  }
}
</style>
