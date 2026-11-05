<template>
  <section id="works" class="section">
    <div class="container">
      <header class="section-head">
        <h2 v-reveal>作品</h2>
      </header>

      <div v-reveal="80" class="filters" role="tablist" aria-label="作品分類">
        <button
          v-for="tab in tabs"
          :key="tab.slug"
          type="button"
          role="tab"
          class="chip"
          :class="{ active: tab.slug === activeSlug }"
          :aria-selected="tab.slug === activeSlug"
          @click="activeSlug = tab.slug"
        >
          {{ tab.name }}
          <small>{{ tab.count }}</small>
        </button>
      </div>

      <div class="grid">
        <RouterLink
          v-for="(project, i) in visibleProjects"
          :key="project.id"
          v-reveal="(i % 3) * 80"
          :to="{ name: 'ProjectDetail', params: { id: project.id } }"
          class="card"
        >
          <div class="cover">
            <CoverMedia
              v-if="getProjectCoverImage(project)"
              :src="getProjectCoverImage(project) || ''"
              :alt="`${project.title} 封面`"
            />
            <div v-else class="cover-empty">{{ project.title }}</div>
          </div>
          <div class="body">
            <p class="category">{{ project.category?.name || '專案' }}</p>
            <h3>{{ project.title }}</h3>
            <p class="desc">{{ project.description }}</p>
            <ul class="tech" aria-label="使用技術">
              <li v-for="tech in techOf(project)" :key="tech">{{ tech }}</li>
            </ul>
          </div>
        </RouterLink>
      </div>

      <p v-if="!projects.length" class="empty">作品載入中…</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import type { Project, Category } from '@/types/models'
import { getProjectCoverImage } from '@/utils/image'
import { vReveal } from '@/directives/reveal'
import CoverMedia from './CoverMedia.vue'

const props = defineProps<{
  projects: Project[]
  categories: Category[]
}>()

const activeSlug = ref('all')

const sorted = computed(() => [...props.projects].sort((a, b) => a.sort_order - b.sort_order))

// 分類頁籤：全部 ＋ 有作品的分類（附件數）
const tabs = computed(() => {
  const withProjects = props.categories
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      count: sorted.value.filter((p) => p.category_id === c.id).length
    }))
    .filter((c) => c.count > 0)

  return [{ slug: 'all', name: '全部', count: sorted.value.length }, ...withProjects]
})

const visibleProjects = computed(() => {
  if (activeSlug.value === 'all') return sorted.value
  const category = props.categories.find((c) => c.slug === activeSlug.value)
  return sorted.value.filter((p) => p.category_id === category?.id)
})

const techOf = (project: Project) => (project.technologies ?? project.tech_stack ?? []).slice(0, 4)
</script>

<style scoped>
.section {
  padding: var(--space-2xl) 0;
  scroll-margin-top: 64px;
}

.section-head {
  margin-bottom: var(--space-lg);
}

h2 {
  font-family: var(--font-display);
  font-size: var(--text-title);
  letter-spacing: 0.04em;
  color: var(--pearl);
  margin: 0;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-xs);
  margin-bottom: var(--space-lg);
}

.chip {
  padding: 8px 14px;
  border-radius: var(--radius-full);
  border: 0;
  background: var(--noir-80);
  color: var(--text-secondary);
  font: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  transition:
    color 0.2s,
    background 0.2s;
}

.chip small {
  color: var(--text-muted);
  margin-left: 4px;
}

.chip:hover {
  background: var(--noir-70);
  color: var(--pearl);
}

.chip.active {
  background: var(--volt);
  color: var(--ink);
}

.chip.active small {
  color: var(--ink);
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.card {
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-lg);
  background: var(--surface);
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition:
    transform 0.25s,
    background 0.25s,
    opacity 0.7s var(--ease-out-expo) var(--reveal-delay, 0ms),
    translate 0.8s var(--ease-out-expo) var(--reveal-delay, 0ms);
}

.card:hover {
  transform: translateY(-4px);
  background: var(--noir-80);
}

.card:first-child {
  grid-column: span 2;
}

.card:first-child h3 {
  font-size: 1.6rem;
}

.card:first-child .desc {
  -webkit-line-clamp: 3;
  line-clamp: 3;
}

.cover {
  aspect-ratio: 16 / 9;
  background: var(--noir-90);
  overflow: hidden;
}

.cover .media {
  transition: transform 0.4s;
}

.card:hover .cover .media {
  transform: scale(1.04);
}

.cover-empty {
  height: 100%;
  display: grid;
  place-items: center;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--space-md);
}

.category {
  font-size: 0.875rem;
  color: var(--volt);
  margin: 0;
}

h3 {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--pearl);
  margin: 0;
}

.desc {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.tech {
  list-style: none;
  padding: 0;
  margin: 4px 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech li {
  font-size: 0.8125rem;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  background: var(--noir-80);
  color: var(--text-light);
}

.empty {
  color: var(--text-muted);
  text-align: center;
  padding: var(--space-xl) 0;
}

@media (max-width: 1024px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .card:first-child {
    grid-column: auto;
  }

  .card:first-child h3 {
    font-size: 1.2rem;
  }
}
</style>
