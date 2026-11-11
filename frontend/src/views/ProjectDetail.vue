<template>
  <!-- 作品頁：跟首頁同一套印刷打樣風格，一件作品是一張打樣 -->
  <div class="proof-page">
    <ProofTopbar :resume-url="RESUME_URL">
      <!-- 手機寬度放不下，收進選單（頁尾還有一顆） -->
      <RouterLink class="hide-sm" :to="{ name: 'home', hash: '#works' }">← 全部作品</RouterLink>
    </ProofTopbar>

    <main v-if="project" id="main-content" class="detail">
      <ProofFrame class="wrap sheet" :folio="folio" label="作品 · WORK">
        <header class="head">
          <span v-if="project.category" class="cat">{{ project.category.name }}</span>
          <h1>{{ project.title }}</h1>
          <!-- 有「問題／做法／結果」的作品，開頭只留第一句，不跟下面重複 -->
          <p class="lede">{{ lede }}</p>
          <div class="links">
            <a
              v-if="project.project_link"
              :href="project.project_link"
              target="_blank"
              rel="noopener noreferrer"
              class="btn primary"
              @click="trackProjectLinkClick(project.id, 'demo')"
            >
              看線上版 ↗
            </a>
            <a
              v-if="project.github_link"
              :href="project.github_link"
              target="_blank"
              rel="noopener noreferrer"
              class="btn"
              @click="trackProjectLinkClick(project.id, 'github')"
            >
              原始碼 ↗
            </a>
            <button type="button" class="btn ghost" @click="copyLink">
              {{ linkCopied ? '已複製 ✓' : '複製連結' }}
            </button>
          </div>
        </header>

        <!-- 精選作品才有：問題 → 做法 → 結果，放在封面上面，第一眼就看到結果 -->
        <dl v-if="project.case_study" class="case">
          <div>
            <dt>問題</dt>
            <dd>{{ project.case_study.problem }}</dd>
          </div>
          <div>
            <dt>我怎麼做</dt>
            <dd>{{ project.case_study.approach }}</dd>
          </div>
          <div>
            <dt>結果</dt>
            <dd class="result">{{ project.case_study.result }}</dd>
          </div>
        </dl>

        <figure v-if="getHeroImage(project)" class="cover">
          <img
            :src="getHeroImage(project) ?? undefined"
            :alt="`${project.title} 成果圖`"
            width="1200"
            height="675"
            fetchpriority="high"
          />
        </figure>

        <div class="grid">
          <section v-if="project.features?.length" class="block">
            <h2>做了什麼</h2>
            <ul class="features">
              <li v-for="(feature, index) in project.features" :key="index">{{ feature }}</li>
            </ul>
          </section>

          <section v-if="project.technologies?.length" class="block">
            <h2>技術</h2>
            <p class="chips">
              <span v-for="tech in project.technologies" :key="tech">{{ tech }}</span>
            </p>
            <template v-if="project.tags?.length">
              <h2 class="sub">標籤</h2>
              <p class="chips tags">
                <span v-for="tag in project.tags" :key="tag.id">#{{ tag.name }}</span>
              </p>
            </template>
          </section>
        </div>

        <!-- Before / After：圖庫裡有「改版前」「改版後」開頭的說明才出現 -->
        <section v-if="comparePair" class="block compare">
          <h2>改版前後</h2>
          <BeforeAfter
            :before="getFullImageUrl(comparePair.before.image_url)"
            :after="getFullImageUrl(comparePair.after.image_url)"
            :before-label="comparePair.before.caption ?? '改版前'"
            :after-label="comparePair.after.caption ?? '改版後'"
          />
        </section>

        <section v-if="shots.length" class="block">
          <h2>截圖</h2>
          <div class="shots">
            <button
              v-for="(image, index) in shots"
              :key="image.id"
              type="button"
              class="shot"
              :aria-label="`放大 ${project.title} 截圖 ${index + 1}`"
              @click="openLightbox(index)"
            >
              <img
                :src="getFullImageUrl(image.image_url)"
                :alt="image.caption || `${project.title} 截圖 ${index + 1}`"
                loading="lazy"
              />
            </button>
          </div>
        </section>
      </ProofFrame>

      <!-- 上一件／下一件：照首頁的作品順序 -->
      <nav v-if="prevProject || nextProject" class="wrap pager" aria-label="上一件與下一件作品">
        <RouterLink v-if="prevProject" class="pager-link prev" :to="projectRoute(prevProject)">
          <span class="dir">← 上一件</span>
          <strong>{{ prevProject.title }}</strong>
        </RouterLink>
        <RouterLink v-if="nextProject" class="pager-link next" :to="projectRoute(nextProject)">
          <span class="dir">下一件 →</span>
          <strong>{{ nextProject.title }}</strong>
        </RouterLink>
      </nav>

      <!-- 其他作品：同分類優先 -->
      <section v-if="relatedProjects.length" class="wrap related" aria-labelledby="related-title">
        <h2 id="related-title">其他作品</h2>
        <div class="related-grid">
          <RouterLink
            v-for="p in relatedProjects"
            :key="p.id"
            class="related-card"
            :to="projectRoute(p)"
          >
            <span class="thumb">
              <img
                v-if="getProjectCoverImage(p)"
                :src="getProjectCoverImage(p) ?? undefined"
                :alt="`${p.title} 預覽圖`"
                loading="lazy"
              />
            </span>
            <span class="r-body">
              <span v-if="p.category" class="cat">{{ p.category.name }}</span>
              <strong>{{ p.title }}</strong>
              <span class="r-desc">{{ summarize(p.description) }}</span>
            </span>
          </RouterLink>
        </div>
      </section>

      <!-- 燈箱 -->
      <Teleport to="body">
        <Transition name="fade">
          <div
            v-if="showLightbox"
            class="lightbox"
            role="dialog"
            aria-modal="true"
            aria-label="專案圖片燈箱"
            @click="closeLightbox"
          >
            <button
              ref="lightboxClose"
              type="button"
              class="lb-btn lb-close"
              aria-label="關閉燈箱"
              @click.stop="closeLightbox"
            >
              ✕
            </button>
            <button
              v-if="lightboxIndex > 0"
              type="button"
              class="lb-btn lb-prev"
              aria-label="上一張圖片"
              @click.stop="prevImage"
            >
              ‹
            </button>
            <button
              v-if="lightboxIndex < shots.length - 1"
              type="button"
              class="lb-btn lb-next"
              aria-label="下一張圖片"
              @click.stop="nextImage"
            >
              ›
            </button>
            <img
              v-if="shots[lightboxIndex]"
              :src="getFullImageUrl(shots[lightboxIndex]?.image_url)"
              :alt="shots[lightboxIndex]?.caption || `${project.title} 放大圖 ${lightboxIndex + 1}`"
              class="lb-image"
              @click.stop
            />
            <div class="lb-counter" aria-live="polite">
              {{ lightboxIndex + 1 }} / {{ shots.length }}
            </div>
          </div>
        </Transition>
      </Teleport>
    </main>

    <!-- 載入中：先佔住版面 -->
    <main v-else-if="loading" id="main-content" class="detail" aria-busy="true">
      <div class="wrap skeleton">
        <span class="sk sk-cat"></span>
        <span class="sk sk-title"></span>
        <span class="sk sk-line"></span>
        <span class="sk sk-line short"></span>
        <span class="sk sk-cover"></span>
      </div>
    </main>

    <!-- 找不到這件作品 -->
    <main v-else id="main-content" class="detail">
      <div class="wrap missing">
        <p class="stamp" aria-hidden="true">缺頁</p>
        <h1>找不到這件作品</h1>
        <p>可能已經下架，或網址打錯了。</p>
        <button type="button" class="btn primary" @click="goBack">← 回到全部作品</button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, computed, nextTick, onMounted, onUnmounted, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projects'
import { getFullImageUrl, getProjectCoverImage } from '@/utils/image'
import { projectShareImage } from '@/utils/shareImage'
import { firstSentence, summarize } from '@/utils/summary'
import { projectKey, projectRoute } from '@/utils/projectLink'
import { useSEO } from '@/composables/useSEO'
import { useGtag } from '@/plugins/gtag'
import type { Project } from '@/types/models'
import BeforeAfter from '@/components/BeforeAfter.vue'
import ProofFrame from '@/components/proof/ProofFrame.vue'
import ProofTopbar from '@/components/proof/ProofTopbar.vue'
import { RESUME_URL } from '@/components/proof/resume'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const { setPageMeta, generateProjectSchema, insertSchema } = useSEO()
const { trackProjectView, trackProjectLinkClick } = useGtag()

const loading = ref(true)
const showLightbox = ref(false)
const lightboxIndex = ref(0)
const linkCopied = ref(false)

const SITE_URL = import.meta.env.VITE_APP_URL || 'https://bb-made.com'
// 網址上的代稱：英文 slug（正式網址）或數字 id（舊連結）
const projectParam = computed(() => String(route.params.id))

const project = computed(() => {
  const key = projectParam.value
  return projectStore.publishedProjects.find((p) => p.slug === key || String(p.id) === key)
})

const lede = computed(() => {
  const p = project.value
  if (!p) return ''
  return p.case_study ? firstSentence(p.description) : p.description
})

// 上一件／下一件
const projectIndex = computed(() =>
  project.value ? projectStore.publishedProjects.indexOf(project.value) : -1
)
const prevProject = computed(() => projectStore.publishedProjects[projectIndex.value - 1])
const nextProject = computed(() =>
  projectIndex.value === -1 ? undefined : projectStore.publishedProjects[projectIndex.value + 1]
)

// 專案截圖：照 sort_order 排，封面已在上方顯示就不重複
const shots = computed(() => {
  const galleries = [...(project.value?.galleries ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order
  )
  const cover = project.value?.cover_image_url
  return cover ? galleries.filter((g) => g.image_url !== cover) : galleries.slice(1)
})

// 相關專案（同分類）
const comparePair = computed(() => {
  const galleries = project.value?.galleries ?? []
  const before = galleries.find((g) => g.caption?.startsWith('改版前'))
  const after = galleries.find((g) => g.caption?.startsWith('改版後'))
  return before && after ? { before, after } : null
})

const relatedProjects = computed(() => {
  if (!project.value) return []

  const others = projectStore.publishedProjects.filter((p) => p.id !== project.value!.id)
  const sameCategory = others.filter((p) => p.category?.id === project.value!.category?.id)
  const rest = others.filter((p) => p.category?.id !== project.value!.category?.id)
  return [...sameCategory, ...rest].slice(0, 3)
})

// 右上角頁碼：第幾件 / 共幾件
const folio = computed(() => {
  const list = projectStore.publishedProjects
  const n = projectIndex.value + 1
  return n ? `${String(n).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}` : ''
})

// 獲取主圖（優先 cover_image_url，其次 galleries 第一張）
const getHeroImage = (proj: Project): string | null => {
  return getProjectCoverImage(proj)
}

const goBack = () => {
  router.push({ name: 'home', hash: '#works' })
}

const copyLink = async () => {
  try {
    await navigator.clipboard.writeText(window.location.href)
    linkCopied.value = true
    setTimeout(() => {
      linkCopied.value = false
    }, 2000)
  } catch (error) {
    if (import.meta.env.DEV) {
      log.error('Failed to copy link:', error)
    }
  }
}

// 燈箱開啟時焦點移到關閉鈕，關掉後還給原本按的那張縮圖
const lightboxClose = ref<HTMLButtonElement>()
let lightboxOpener: HTMLElement | null = null

const openLightbox = async (index: number) => {
  lightboxOpener = document.activeElement instanceof HTMLElement ? document.activeElement : null
  lightboxIndex.value = index
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
  await nextTick()
  lightboxClose.value?.focus()
}

const closeLightbox = () => {
  showLightbox.value = false
  document.body.style.overflow = ''
  lightboxOpener?.focus()
  lightboxOpener = null
}

const prevImage = () => {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--
  }
}

const nextImage = () => {
  if (lightboxIndex.value < shots.value.length - 1) {
    lightboxIndex.value++
  }
}

// 鍵盤導航
const handleKeydown = (e: KeyboardEvent) => {
  if (!showLightbox.value) return

  if (e.key === 'Escape') {
    closeLightbox()
  } else if (e.key === 'ArrowLeft') {
    prevImage()
  } else if (e.key === 'ArrowRight') {
    nextImage()
  }
}

// 已埋點的專案 id，避免 store 資料二次更新時 GA4 重複觸發
const trackedId = ref<number | null>(null)

// 設定 SEO 與 追蹤 (響應式監聽)
watchEffect(() => {
  if (!project.value && !loading.value) {
    // 找不到：伺服器已回 404，這裡把標題與 robots 也換掉
    setPageMeta({ title: '找不到這件作品 | Bob Tsou 作品集', noindex: true })
  }

  if (project.value && !loading.value) {
    // 跟伺服器端（ProjectShareController）給的一樣：分享圖是 JPG，不是 WebP 封面
    setPageMeta({
      title: `${project.value.title} | Bob Tsou 作品集`,
      description: project.value.description,
      image: project.value.slug ? projectShareImage(project.value.slug, SITE_URL) : undefined,
      url: `${SITE_URL}/projects/${projectKey(project.value)}`,
      type: 'article'
    })

    // 插入 Schema.org
    insertSchema(generateProjectSchema(project.value))

    // 追蹤專案瀏覽 (GA4)：同一專案只送一次
    if (trackedId.value !== project.value.id) {
      trackedId.value = project.value.id
      trackProjectView(project.value.id, project.value.title)
    }
  }
})

// 路由重入（同元件不同 params.id）時 onMounted 不會再觸發，
// 需手動重置殘留的燈箱/捲動/複製狀態，避免顯示上一個專案的狀態
watch(projectParam, () => {
  lightboxOpener = null
  showLightbox.value = false
  lightboxIndex.value = 0
  linkCopied.value = false
  document.body.style.overflow = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
})

onMounted(async () => {
  // 載入專案資料；以 try/finally 確保失敗時也會解除 loading，不會卡在骨架屏
  try {
    if (projectStore.publishedProjects.length === 0) {
      await projectStore.fetchProjects()
    }
  } finally {
    loading.value = false
  }

  // 鍵盤事件監聽
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style src="@/components/proof/proof-page.css"></style>

<style scoped>
.detail {
  position: relative;
  z-index: 2;
  padding-top: 40px;
}

.sheet {
  --volt: var(--accent); /* 改版前後滑桿是深色系統的元件，金色換成橘色 */
  padding: 0 0 8px;
}

/* ── 標題區 ── */
.head {
  max-width: 820px;
}

.cat {
  font-family: var(--mono);
  font-size: var(--fs-small);
  letter-spacing: 0.14em;
  color: var(--accent-ink);
}

h1 {
  margin: 8px 0 0;
  font-size: clamp(30px, 4.4vw, 54px);
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: 0.01em;
  text-wrap: balance;
}

.lede {
  margin: 16px 0 0;
  font-size: var(--fs-lead);
  line-height: 1.8;
  color: var(--ink-2);
  text-wrap: pretty;
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 22px;
}

.btn {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 18px;
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  background: none;
  color: var(--ink);
  font: inherit;
  font-size: var(--fs-ui);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.btn.primary {
  background: var(--ink);
  color: var(--paper);
}

.btn.ghost {
  border-color: var(--rule);
  color: var(--ink-2);
}

/* ── 封面：像貼在打樣紙上的一張圖 ── */
.cover {
  margin: 32px 0 0;
  overflow: hidden;
  border: 1px solid var(--rule);
  border-radius: 14px;
  background: #e9e2d4;
  box-shadow: 0 18px 40px rgba(21, 22, 26, 0.12);
}

.cover img {
  display: block;
  width: 100%;
  height: auto;
}

/* ── 問題 → 做法 → 結果 ── */
.case {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0;
  margin: 32px 0 0;
  border-top: 1.5px solid var(--ink);
  border-bottom: 1px solid var(--rule);
}

.case > div {
  padding: 18px 22px 20px 0;
}

.case > div + div {
  padding-left: 22px;
  border-left: 1px solid var(--rule);
}

.case dt {
  font-family: var(--mono);
  font-size: var(--fs-small);
  letter-spacing: 0.12em;
  color: var(--accent-ink);
}

.case dd {
  margin: 8px 0 0;
  font-size: var(--fs-body);
  line-height: 1.75;
  color: var(--ink-2);
  text-wrap: pretty;
}

.case dd.result {
  color: var(--ink);
  font-weight: 600;
}

/* ── 內文 ── */
.grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 48px;
  margin-top: 44px;
}

/* 小標跟內文在手機上一樣大，靠上面一條墨線分層級 */
.block h2 {
  margin: 0 0 14px;
  padding-top: 12px;
  border-top: 1.5px solid var(--ink);
  font-size: var(--fs-lead);
  font-weight: 900;
}

.block h2.sub {
  margin-top: 28px;
  padding-top: 0;
  border-top: 0;
}

.features {
  display: grid;
  gap: 8px;
  margin: 0;
  padding-left: 1.2em;
  font-size: var(--fs-body);
  line-height: 1.75;
}

.features li::marker {
  color: var(--accent-ink);
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
}

.chips span {
  padding: 5px 11px;
  border: 1px solid var(--rule);
  border-radius: 999px;
  background: #fff;
  font-size: var(--fs-small);
}

.chips.tags span {
  background: none;
  color: var(--ink-2);
}

.compare,
.grid + .block,
.compare + .block {
  margin-top: 48px;
}

.shots {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
}

.shot {
  display: block;
  padding: 0;
  overflow: hidden;
  aspect-ratio: 16 / 10;
  border: 1px solid var(--rule);
  border-radius: 12px;
  background: #e9e2d4;
  cursor: zoom-in;
}

.shot img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s var(--ease);
}

.shot:hover img {
  transform: scale(1.03);
}

/* ── 上一件／下一件 ── */
.pager {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
  margin-top: 56px;
}

.pager-link {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 16px 18px;
  border: 1px solid var(--rule);
  border-radius: 14px;
  background: #fff;
  color: var(--ink);
  text-decoration: none;
}

.pager-link:hover strong {
  text-decoration: underline;
}

.pager-link.next {
  grid-column: 2;
  align-items: flex-end;
  text-align: right;
}

.pager .dir {
  font-family: var(--latin);
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0.08em;
  color: var(--accent-ink);
}

.pager strong {
  font-size: var(--fs-body);
  line-height: 1.4;
}

/* ── 其他作品 ── */
.related {
  margin-top: 56px;
}

.related h2 {
  margin: 0 0 16px;
  padding-top: 18px;
  border-top: 1px solid var(--rule);
  font-size: var(--fs-lead);
  font-weight: 900;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.related-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid var(--rule);
  border-radius: 14px;
  background: #fff;
  color: inherit;
  text-decoration: none;
  transition:
    transform 0.25s var(--ease),
    box-shadow 0.25s var(--ease);
}

.related-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(21, 22, 26, 0.12);
}

.thumb {
  display: block;
  aspect-ratio: 16 / 9;
  background: #e9e2d4;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.r-body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px 18px;
}

.r-body strong {
  font-size: var(--fs-body);
  font-weight: 900;
}

.r-desc {
  font-size: var(--fs-small);
  line-height: 1.6;
  color: var(--ink-2);
}

/* ── 載入中 ── */
.skeleton {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.sk {
  display: block;
  border-radius: 8px;
  background: #e9e2d4;
}

.sk-cat {
  width: 90px;
  height: 12px;
}

.sk-title {
  width: min(560px, 80%);
  height: 44px;
}

.sk-line {
  width: min(760px, 100%);
  height: 14px;
}

.sk-line.short {
  width: min(480px, 70%);
}

.sk-cover {
  aspect-ratio: 16 / 9;
  margin-top: 22px;
  border-radius: 14px;
}

/* ── 找不到 ── */
.missing {
  padding: 12vh 0 0;
  text-align: center;
}

.stamp {
  display: inline-block;
  margin: 0 0 18px;
  padding: 6px 14px;
  border: 2px solid #d7262d;
  border-radius: 6px;
  color: #d7262d;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 0.3em;
  rotate: -6deg;
}

.missing h1 {
  font-size: clamp(26px, 3.4vw, 40px);
}

.missing p:not(.stamp) {
  margin: 10px 0 24px;
  color: var(--ink-2);
}

@media (max-width: 900px) {
  .case {
    grid-template-columns: 1fr;
  }

  .case > div,
  .case > div + div {
    padding: 16px 0;
    border-left: 0;
  }

  .case > div + div {
    border-top: 1px solid var(--rule);
  }

  .grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .related-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .detail {
    padding-top: 16px;
  }

  .sheet {
    padding-top: 22px; /* 手機的頁碼移到左上，留位置給它 */
  }
}

/* ── 燈箱：Teleport 到 body，不在 .proof-page 裡，所以顏色直接寫 ── */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 16px;
  background: rgba(21, 22, 26, 0.92);
}

.lightbox .lb-image {
  max-width: 100%;
  max-height: 100%;
  border-radius: 8px;
  object-fit: contain;
}

.lightbox .lb-btn {
  position: absolute;
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: #fff;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.lightbox .lb-close {
  top: 16px;
  right: 16px;
  font-size: 18px;
}

.lightbox .lb-prev {
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox .lb-next {
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
}

.lightbox .lb-counter {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'JetBrains Mono', Menlo, monospace;
  font-size: 13px; /* 燈箱吃不到 .proof-page 的變數，對齊 --fs-small */
  color: rgba(255, 255, 255, 0.7);
}
</style>
