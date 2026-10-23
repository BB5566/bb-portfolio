<template>
  <main id="main-content" class="project-detail" v-if="project">
    <!-- Background Atmosphere -->
    <div class="detail-atmosphere" aria-hidden="true">
      <div class="atmosphere-grain"></div>
      <div class="atmosphere-glow"></div>
    </div>

    <!-- Hero Section -->
    <section class="project-hero">
      <div class="hero-background">
        <img
          v-if="getHeroImage(project)"
          :src="getHeroImage(project) ?? undefined"
          :alt="`${project.title} 專案主視覺`"
          class="hero-image"
          loading="eager"
          fetchpriority="high"
        />
        <div class="hero-overlay"></div>
      </div>

      <div class="hero-content">
        <!-- Back Button -->
        <button @click="goBack" class="back-btn" type="button">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span>返回作品集</span>
        </button>

        <div class="hero-info">
          <span class="category-badge" v-if="project.category">{{ project.category.name }}</span>
          <h1 class="project-title">{{ project.title }}</h1>
          <p class="project-date">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            {{ formatDate(project.created_at) }}
          </p>
        </div>
      </div>
    </section>

    <!-- Main Content -->
    <section class="project-content">
      <div class="content-container">
        <div class="content-grid">
          <!-- Left: Description -->
          <div class="description-column">
            <div class="section-block">
              <h2 class="section-title">
                <span class="title-index">01</span>
                專案描述
              </h2>
              <p class="description-text">{{ project.description }}</p>
            </div>

            <!-- Tech Stack -->
            <div
              class="section-block"
              v-if="project.technologies && project.technologies.length > 0"
            >
              <h2 class="section-title">
                <span class="title-index">02</span>
                技術架構
              </h2>
              <div class="tech-grid">
                <span v-for="tech in project.technologies" :key="tech" class="tech-item">
                  {{ tech }}
                </span>
              </div>
            </div>

            <!-- Features -->
            <div class="section-block" v-if="project.features && project.features.length > 0">
              <h2 class="section-title">
                <span class="title-index">03</span>
                功能特色
              </h2>
              <ul class="features-list">
                <li v-for="(feature, index) in project.features" :key="index">
                  <span class="feature-marker">◇</span>
                  {{ feature }}
                </li>
              </ul>
            </div>

            <!-- Tags -->
            <div class="section-block" v-if="project.tags && project.tags.length > 0">
              <h2 class="section-title">
                <span class="title-index">04</span>
                標籤
              </h2>
              <div class="tags-list">
                <span v-for="tag in project.tags" :key="tag.id" class="tag-item">
                  #{{ tag.name }}
                </span>
              </div>
            </div>
          </div>

          <!-- Right: Actions -->
          <div class="actions-column">
            <div class="actions-card">
              <h3 class="actions-title">專案連結</h3>

              <a
                v-if="project.project_link"
                :href="project.project_link"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn primary"
                @click="trackProjectLinkClick(project.id, 'demo')"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
                <span>查看線上展示</span>
              </a>

              <a
                v-if="project.github_link"
                :href="project.github_link"
                target="_blank"
                rel="noopener noreferrer"
                class="action-btn secondary"
                @click="trackProjectLinkClick(project.id, 'github')"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
                  />
                </svg>
                <span>查看原始碼</span>
              </a>

              <div class="divider"></div>

              <button @click="copyLink" class="action-btn ghost" :class="{ copied: linkCopied }">
                <svg
                  v-if="!linkCopied"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>{{ linkCopied ? '已複製連結' : '複製連結' }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Gallery -->
    <section v-if="project.galleries && project.galleries.length > 1" class="project-gallery">
      <div class="content-container">
        <h2 class="gallery-title">
          <span class="title-ornament">◇</span>
          專案截圖
          <span class="title-ornament">◇</span>
        </h2>
        <div class="gallery-grid">
          <div
            v-for="(image, index) in project.galleries.slice(1)"
            :key="image.id"
            class="gallery-item"
            role="button"
            tabindex="0"
            :aria-label="`查看 ${project.title} 截圖 ${index + 1}`"
            @click="openLightbox(index)"
            @keydown.enter="openLightbox(index)"
            @keydown.space.prevent="openLightbox(index)"
          >
            <img
              :src="getFullImageUrl(image.image_url)"
              :alt="`${project.title} 截圖 ${index + 1}`"
              loading="lazy"
            />
            <div class="gallery-overlay">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Related Projects -->
    <section v-if="relatedProjects.length > 0" class="related-projects">
      <div class="content-container">
        <h2 class="gallery-title">
          <span class="title-ornament">◇</span>
          相關專案
          <span class="title-ornament">◇</span>
        </h2>
        <div class="related-grid">
          <div
            v-for="relatedProject in relatedProjects"
            :key="relatedProject.id"
            class="related-card"
            role="button"
            tabindex="0"
            :aria-label="`查看專案 ${relatedProject.title}`"
            @click="navigateToProject(relatedProject.id)"
            @keydown.enter="navigateToProject(relatedProject.id)"
            @keydown.space.prevent="navigateToProject(relatedProject.id)"
          >
            <div class="related-image-wrapper">
              <img
                :src="
                  getFullImageUrl(
                    (relatedProject.galleries && relatedProject.galleries[0]?.image_url) || ''
                  )
                "
                :alt="`${relatedProject.title} 專案預覽圖`"
                class="related-image"
              />
              <div class="related-overlay"></div>
            </div>
            <div class="related-content">
              <h3>{{ relatedProject.title }}</h3>
              <p>{{ truncate(relatedProject.description, 80) }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Lightbox -->
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
            type="button"
            class="lightbox-close"
            aria-label="關閉燈箱"
            @click.stop="closeLightbox"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <button
            type="button"
            class="lightbox-nav prev"
            aria-label="上一張圖片"
            @click.stop="prevImage"
            v-if="lightboxIndex > 0"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            type="button"
            class="lightbox-nav next"
            aria-label="下一張圖片"
            @click.stop="nextImage"
            v-if="project.galleries && lightboxIndex < project.galleries.length - 2"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              aria-hidden="true"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
          <img
            v-if="project.galleries && project.galleries[lightboxIndex + 1]"
            :src="getFullImageUrl(project.galleries?.[lightboxIndex + 1]?.image_url)"
            :alt="`${project.title} 放大圖 ${lightboxIndex + 1}`"
            class="lightbox-image"
            @click.stop
          />
          <div class="lightbox-counter" aria-live="polite">
            {{ lightboxIndex + 1 }} / {{ (project.galleries?.length || 1) - 1 }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </main>

  <!-- Loading Skeleton -->
  <main v-else-if="loading" id="main-content" class="project-detail-skeleton" aria-busy="true">
    <div class="skeleton-hero"></div>
    <div class="skeleton-container">
      <div class="skeleton-header">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line meta"></div>
      </div>
      <div class="skeleton-content">
        <div class="skeleton-line"></div>
        <div class="skeleton-line" style="width: 90%"></div>
        <div class="skeleton-line" style="width: 95%"></div>
        <div class="skeleton-line" style="width: 80%"></div>
      </div>
    </div>
  </main>

  <!-- Not Found -->
  <main v-else id="main-content" class="not-found-state">
    <div class="not-found-icon">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    </div>
    <h2>找不到專案</h2>
    <p>此專案可能已被移除或不存在</p>
    <button @click="goBack" type="button" class="back-btn center">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        aria-hidden="true"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      <span>返回作品集</span>
    </button>
  </main>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { ref, computed, onMounted, onUnmounted, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProjectStore } from '@/stores/projects'
import { getFullImageUrl, getProjectCoverImage } from '@/utils/image'
import { useSEO } from '@/composables/useSEO'
import { useGtag } from '@/plugins/gtag'
import type { Project } from '@/types/models'

const route = useRoute()
const router = useRouter()
const projectStore = useProjectStore()
const { setPageMeta, generateProjectSchema, insertSchema } = useSEO()
const { trackProjectView, trackProjectLinkClick } = useGtag()

const loading = ref(true)
const showLightbox = ref(false)
const lightboxIndex = ref(0)
const linkCopied = ref(false)

const projectId = computed(() => Number(route.params.id))

const project = computed(() => {
  return projectStore.publishedProjects.find((p) => p.id === projectId.value)
})

// 相關專案（同分類）
const relatedProjects = computed(() => {
  if (!project.value) return []

  return projectStore.publishedProjects
    .filter((p) => p.id !== project.value!.id && p.category?.id === project.value!.category?.id)
    .slice(0, 3)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const truncate = (text: string, length: number) => {
  return text.length > length ? text.substring(0, length) + '...' : text
}

// 獲取主圖（優先 cover_image_url，其次 galleries 第一張）
const getHeroImage = (proj: Project): string | null => {
  return getProjectCoverImage(proj)
}

const goBack = () => {
  router.push({ name: 'home', hash: '#portfolio' })
}

const navigateToProject = (id: number) => {
  router.push({ name: 'ProjectDetail', params: { id } })
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

const openLightbox = (index: number) => {
  lightboxIndex.value = index
  showLightbox.value = true
  document.body.style.overflow = 'hidden'
}

const closeLightbox = () => {
  showLightbox.value = false
  document.body.style.overflow = ''
}

const prevImage = () => {
  if (lightboxIndex.value > 0) {
    lightboxIndex.value--
  }
}

const nextImage = () => {
  if (project.value?.galleries && lightboxIndex.value < project.value.galleries.length - 2) {
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
  if (project.value && !loading.value) {
    const coverImage =
      project.value.galleries && project.value.galleries[0]?.image_url
        ? getFullImageUrl(project.value.galleries[0].image_url)
        : undefined

    setPageMeta({
      title: `${project.value.title} | Bob Tsou 作品集`,
      description: project.value.description,
      image: coverImage,
      url: window.location.href,
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
watch(projectId, () => {
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

<style scoped>
/* ============================================
   PROJECT DETAIL - DUNE AESTHETIC
   ============================================ */

.project-detail {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--ink);
  position: relative;
}

/* Atmosphere */
.detail-atmosphere {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.atmosphere-grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  opacity: 0.02;
}

.atmosphere-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  height: 60vh;
  background: radial-gradient(ellipse at top, rgba(225, 193, 110, 0.05) 0%, transparent 70%);
}

/* Hero Section */
.project-hero {
  position: relative;
  height: 70vh;
  min-height: 500px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.hero-background {
  position: absolute;
  inset: 0;
}

.hero-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(16, 12, 10, 0.3) 0%,
    rgba(16, 12, 10, 0.6) 50%,
    rgba(16, 12, 10, 1) 100%
  );
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 3rem 2rem;
}

/* Back Button */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: rgba(16, 12, 10, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(225, 193, 110, 0.2);
  border-radius: 100px;
  color: var(--pearl);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

.back-btn:hover {
  background: rgba(225, 193, 110, 0.1);
  border-color: var(--volt);
  color: var(--volt);
  transform: translateX(-4px);
}

.back-btn:focus-visible {
  outline: 2px solid var(--volt);
  outline-offset: 3px;
  border-color: var(--volt);
}

.back-btn:active {
  transform: translateX(-2px) scale(0.98);
}

.back-btn.center {
  margin: 0 auto;
}

/* Hero Info */
.hero-info {
  max-width: 800px;
}

.category-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(225, 193, 110, 0.15);
  border: 1px solid rgba(225, 193, 110, 0.3);
  border-radius: 100px;
  color: var(--volt);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 1rem;
}

.project-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  color: var(--pearl);
  letter-spacing: 2px;
  line-height: 1.1;
  margin-bottom: 1rem;
}

.project-date {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
}

.project-date svg {
  width: 16px;
  height: 16px;
  opacity: 0.6;
}

/* Content Section */
.project-content {
  position: relative;
  z-index: 1;
  padding: 4rem 0;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 4rem;
  align-items: start;
}

/* Description Column */
.section-block {
  margin-bottom: 3rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.5rem;
  color: var(--pearl);
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
}

.title-index {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  color: var(--volt);
  opacity: 0.6;
}

.description-text {
  font-family: 'DM Sans', sans-serif;
  font-size: 1.0625rem;
  color: var(--text-secondary);
  line-height: 1.8;
}

/* Tech Grid */
.tech-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.tech-item {
  padding: 0.5rem 1rem;
  background: rgba(225, 193, 110, 0.1);
  border: 1px solid rgba(225, 193, 110, 0.2);
  border-radius: 100px;
  color: var(--volt);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
}

/* Features List */
.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(225, 193, 110, 0.1);
  color: var(--text-secondary);
  font-size: 1rem;
  line-height: 1.6;
}

.features-list li:last-child {
  border-bottom: none;
}

.feature-marker {
  color: var(--volt);
  font-size: 0.75rem;
  margin-top: 0.25rem;
}

/* Tags */
.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag-item {
  padding: 0.35rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 4px;
  color: var(--text-muted);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
}

/* Actions Column */
.actions-card {
  position: sticky;
  top: 2rem;
  padding: 2rem;
  background: rgba(26, 22, 20, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(225, 193, 110, 0.15);
  border-radius: 16px;
}

.actions-title {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.25rem;
  color: var(--pearl);
  letter-spacing: 2px;
  margin-bottom: 1.5rem;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem 1.5rem;
  border-radius: 100px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 0.75rem;
  border: none;
}

.action-btn:focus-visible {
  outline: 2px solid var(--volt);
  outline-offset: 3px;
}

.action-btn:active {
  transform: translateY(0) scale(0.98);
}

.action-btn svg {
  width: 18px;
  height: 18px;
}

.action-btn.primary {
  background: var(--volt);
  color: var(--ink);
}

.action-btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(225, 193, 110, 0.3);
}

.action-btn.secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--pearl);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.action-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: var(--pearl);
}

.action-btn.ghost {
  background: transparent;
  color: var(--text-muted);
  border: 1px solid rgba(225, 193, 110, 0.2);
}

.action-btn.ghost:hover {
  color: var(--volt);
  border-color: var(--volt);
}

.action-btn.ghost.copied {
  background: rgba(39, 174, 96, 0.2);
  border-color: #27ae60;
  color: #27ae60;
}

.divider {
  height: 1px;
  background: rgba(225, 193, 110, 0.1);
  margin: 1.5rem 0;
}

/* Gallery */
.project-gallery {
  position: relative;
  z-index: 1;
  padding: 4rem 0;
  background: rgba(26, 22, 20, 0.5);
}

.gallery-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  color: var(--pearl);
  letter-spacing: 4px;
  margin-bottom: 3rem;
  text-align: center;
}

.title-ornament {
  color: var(--volt);
  font-size: 0.75rem;
  opacity: 0.6;
}

.gallery-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.gallery-item {
  position: relative;
  aspect-ratio: 16/10;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 1px solid rgba(225, 193, 110, 0.1);
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.gallery-item:hover img {
  transform: scale(1.05);
}

.gallery-overlay {
  position: absolute;
  inset: 0;
  background: rgba(16, 12, 10, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay,
.gallery-item:focus-visible .gallery-overlay {
  opacity: 1;
}

.gallery-item:focus-visible {
  outline: 2px solid var(--volt);
  outline-offset: 3px;
}

.gallery-overlay svg {
  width: 40px;
  height: 40px;
  color: var(--volt);
}

/* Related Projects */
.related-projects {
  position: relative;
  z-index: 1;
  padding: 4rem 0 6rem;
}

.related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.related-card {
  background: rgba(26, 22, 20, 0.6);
  border: 1px solid rgba(225, 193, 110, 0.1);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.related-card:hover {
  transform: translateY(-8px);
  border-color: rgba(225, 193, 110, 0.3);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
}

.related-card:focus-visible {
  outline: 2px solid var(--volt);
  outline-offset: 3px;
  border-color: var(--volt);
}

.related-card:active {
  transform: translateY(-2px) scale(0.99);
}

.related-image-wrapper {
  position: relative;
  aspect-ratio: 16/10;
  overflow: hidden;
}

.related-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.related-card:hover .related-image {
  transform: scale(1.05);
}

.related-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(16, 12, 10, 0.8) 100%);
}

.related-content {
  padding: 1.25rem;
}

.related-content h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 1.25rem;
  color: var(--pearl);
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.related-content p {
  color: var(--text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(16, 12, 10, 0.98);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 2rem;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 85vh;
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-close {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lightbox-close svg {
  width: 24px;
  height: 24px;
  color: white;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: rotate(90deg);
}

.lightbox-close:focus-visible {
  outline: 2px solid var(--volt);
  outline-offset: 3px;
}

.lightbox-close:active {
  transform: scale(0.92);
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.lightbox-nav svg {
  width: 24px;
  height: 24px;
  color: white;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.2);
}

.lightbox-nav:focus-visible {
  outline: 2px solid var(--volt);
  outline-offset: 3px;
}

.lightbox-nav:active {
  transform: translateY(-50%) scale(0.92);
}

.lightbox-nav.prev {
  left: 2rem;
}

.lightbox-nav.next {
  right: 2rem;
}

.lightbox-counter {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
}

/* ============================================
   LOADING SKELETON
   ============================================ */
.project-detail-skeleton {
  width: 100%;
  padding-bottom: var(--space-3xl);
}

.skeleton-hero {
  width: 100%;
  height: 80vh;
  min-height: 500px;
  background: var(--noir-70);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-container {
  max-width: 1200px;
  margin: -10vh auto 0;
  padding: 0 var(--space-xl);
  position: relative;
  z-index: 10;
}

.skeleton-header {
  margin-bottom: var(--space-2xl);
}
.skeleton-line {
  height: 20px;
  background: var(--noir-70);
  border-radius: 4px;
  margin-bottom: var(--space-md);
  width: 100%;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.skeleton-line.title {
  height: clamp(3rem, 6vw, 5rem);
  width: 60%;
  margin-bottom: var(--space-lg);
}
.skeleton-line.meta {
  width: 40%;
  height: 30px;
}

@keyframes skeleton-pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.4;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Loading & Not Found */
.loading-state,
.not-found-state {
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.5rem;
  background: var(--ink);
  color: var(--pearl);
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 2px solid rgba(225, 193, 110, 0.2);
  border-top-color: var(--volt);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.not-found-icon svg {
  width: 64px;
  height: 64px;
  color: var(--volt);
  opacity: 0.5;
}

.not-found-state h2 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 2rem;
  letter-spacing: 2px;
}

.not-found-state p {
  color: var(--text-muted);
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .actions-card {
    position: static;
  }
}

@media (max-width: 768px) {
  .project-hero {
    height: 60vh;
    min-height: 400px;
  }

  .hero-content {
    padding: 2rem 1rem;
  }

  .project-title {
    font-size: 2rem;
  }

  .content-container {
    padding: 0 1rem;
  }

  .gallery-grid,
  .related-grid {
    grid-template-columns: 1fr;
  }

  .lightbox-nav {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
  }

  .lightbox-close {
    width: 44px;
    height: 44px;
    min-width: 44px;
    min-height: 44px;
    top: 1rem;
    right: 1rem;
  }

  .lightbox-nav.prev {
    left: 0.75rem;
  }

  .lightbox-nav.next {
    right: 0.75rem;
  }

  .back-btn {
    min-height: 44px;
  }

  .lightbox-nav svg {
    width: 20px;
    height: 20px;
  }
}
</style>
