<template>
  <div class="finder">
    <!-- 側欄分類 -->
    <aside class="finder__sidebar">
      <p class="finder__sidebar-title">位置</p>
      <ul class="finder__nav">
        <li>
          <button
            type="button"
            class="finder__nav-btn"
            :class="{ 'is-active': activeCategoryId === null }"
            @click="selectCategory(null)"
          >
            <Folder :size="15" aria-hidden="true" />
            <span>全部作品</span>
            <em>{{ projectStore.publishedProjects.length }}</em>
          </button>
        </li>
        <li v-for="cat in categoriesWithCount" :key="cat.id">
          <button
            type="button"
            class="finder__nav-btn"
            :class="{ 'is-active': activeCategoryId === cat.id }"
            @click="selectCategory(cat.id)"
          >
            <FolderOpen :size="15" aria-hidden="true" />
            <span>{{ cat.name }}</span>
            <em>{{ cat.count }}</em>
          </button>
        </li>
      </ul>
    </aside>

    <!-- 主區域 -->
    <div class="finder__main">
      <!-- 詳細檢視 -->
      <article v-if="selected" class="finder__detail">
        <div class="finder__toolbar">
          <button type="button" class="finder__back" @click="selected = null">
            <ChevronLeft :size="15" aria-hidden="true" />
            返回
          </button>
          <span class="finder__path">{{ selected.title }}</span>
        </div>

        <div class="finder__detail-body">
          <img
            v-if="coverOf(selected)"
            :src="coverOf(selected) ?? undefined"
            :alt="selected.title"
            class="finder__cover"
            loading="lazy"
          />

          <h3 class="finder__detail-title">{{ selected.title }}</h3>
          <p v-if="selected.category" class="finder__detail-kind">
            種類：{{ selected.category.name }}
          </p>
          <p class="finder__detail-desc">{{ selected.description }}</p>

          <template v-if="techOf(selected).length">
            <h4 class="finder__detail-h4">技術架構</h4>
            <ul class="finder__chips">
              <li v-for="tech in techOf(selected)" :key="tech">{{ tech }}</li>
            </ul>
          </template>

          <div class="finder__actions">
            <RouterLink :to="`/projects/${selected.id}`" class="finder__btn finder__btn--primary">
              開啟完整頁面
            </RouterLink>
            <a
              v-if="selected.project_link || selected.demo_url"
              :href="(selected.project_link || selected.demo_url) ?? undefined"
              target="_blank"
              rel="noopener noreferrer"
              class="finder__btn"
            >
              <ExternalLink :size="14" aria-hidden="true" />
              線上展示
            </a>
            <a
              v-if="selected.github_link || selected.github_url"
              :href="(selected.github_link || selected.github_url) ?? undefined"
              target="_blank"
              rel="noopener noreferrer"
              class="finder__btn"
            >
              <Github :size="14" aria-hidden="true" />
              原始碼
            </a>
          </div>
        </div>
      </article>

      <!-- 列表檢視 -->
      <template v-else>
        <div class="finder__toolbar">
          <span class="finder__path">
            {{ activeCategoryName }} — {{ filteredProjects.length }} 個項目
          </span>
          <label class="finder__search">
            <Search :size="14" aria-hidden="true" />
            <input v-model="query" type="search" placeholder="搜尋" aria-label="搜尋作品" />
          </label>
        </div>

        <p v-if="projectStore.loading && !projectStore.projects.length" class="finder__empty">
          讀取磁碟中…
        </p>
        <p v-else-if="!filteredProjects.length" class="finder__empty">此位置沒有項目</p>

        <ul v-else class="finder__grid">
          <li v-for="project in filteredProjects" :key="project.id">
            <button type="button" class="finder__card" @click="selected = project">
              <span class="finder__thumb">
                <img
                  v-if="coverOf(project)"
                  :src="coverOf(project) ?? undefined"
                  :alt="project.title"
                  loading="lazy"
                />
                <Folder v-else :size="32" :stroke-width="1.4" aria-hidden="true" />
              </span>
              <span class="finder__card-name">{{ project.title }}</span>
              <span class="finder__card-meta">{{ project.category?.name || '未分類' }}</span>
            </button>
          </li>
        </ul>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { ChevronLeft, ExternalLink, Folder, FolderOpen, Github, Search } from 'lucide-vue-next'
import { useProjectStore } from '@/stores/projects'
import { getProjectCoverImage } from '@/utils/image'
import type { Project } from '@/types/models'

const projectStore = useProjectStore()

const activeCategoryId = ref<number | null>(null)
const selected = ref<Project | null>(null)
const query = ref('')

const categoriesWithCount = computed(() =>
  projectStore.categories.map((cat) => ({
    ...cat,
    count: projectStore.publishedProjects.filter((p) => p.category_id === cat.id).length
  }))
)

const activeCategoryName = computed(() => {
  if (activeCategoryId.value === null) return '全部作品'
  return projectStore.categories.find((c) => c.id === activeCategoryId.value)?.name || '未分類'
})

const filteredProjects = computed(() => {
  const keyword = query.value.trim().toLowerCase()
  return projectStore.publishedProjects.filter((p) => {
    if (activeCategoryId.value !== null && p.category_id !== activeCategoryId.value) return false
    if (!keyword) return true
    return (
      p.title.toLowerCase().includes(keyword) ||
      (p.description || '').toLowerCase().includes(keyword)
    )
  })
})

const selectCategory = (id: number | null) => {
  activeCategoryId.value = id
  selected.value = null
}

const coverOf = (project: Project) => getProjectCoverImage(project)
const techOf = (project: Project) => project.technologies || project.tech_stack || []
</script>

<style scoped>
.finder {
  display: flex;
  min-height: 100%;
  font-family: var(--font-body);
}

/* === 側欄 === */
.finder__sidebar {
  flex-shrink: 0;
  width: 178px;
  padding: 0.9rem 0.6rem;
  background: rgba(12, 9, 7, 0.55);
  border-right: 1px solid var(--os-chrome-border);
}

.finder__sidebar-title {
  margin: 0 0 0.5rem 0.5rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.finder__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.finder__nav-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.4rem 0.5rem;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.8125rem;
  text-align: left;
}

.finder__nav-btn svg {
  color: var(--volt);
  flex-shrink: 0;
}

.finder__nav-btn span {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.finder__nav-btn em {
  font-style: normal;
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.finder__nav-btn:hover {
  background: rgba(225, 193, 110, 0.1);
}

.finder__nav-btn.is-active {
  background: rgba(225, 193, 110, 0.18);
  color: var(--text);
}

/* === 主區 === */
.finder__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.finder__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.6rem 0.9rem;
  border-bottom: 1px solid var(--os-chrome-border);
}

.finder__path {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.finder__search {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.25rem 0.6rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--os-chrome-border);
  border-radius: 20px;
  color: var(--text-muted);
}

.finder__search input {
  width: 130px;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-family: inherit;
  font-size: 0.8125rem;
}

.finder__back {
  display: flex;
  align-items: center;
  gap: 0.2rem;
  padding: 0.2rem 0.5rem 0.2rem 0.3rem;
  background: rgba(225, 193, 110, 0.12);
  border: 1px solid var(--os-chrome-border);
  border-radius: 6px;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 0.75rem;
}

.finder__back:hover {
  background: rgba(225, 193, 110, 0.22);
}

/* === 網格 === */
.finder__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
  gap: 0.5rem;
  margin: 0;
  padding: 0.9rem;
  list-style: none;
}

.finder__card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  width: 100%;
  padding: 0.7rem 0.4rem;
  background: none;
  border: 1px solid transparent;
  border-radius: 8px;
  color: var(--text-secondary);
  font-family: inherit;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    transform 0.2s ease;
}

.finder__card:hover,
.finder__card:focus-visible {
  background: rgba(225, 193, 110, 0.1);
  border-color: rgba(225, 193, 110, 0.28);
  transform: translateY(-2px);
}

.finder__thumb {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: linear-gradient(160deg, rgba(111, 195, 232, 0.9), rgba(42, 127, 184, 0.85));
  border-radius: 8px;
  color: rgba(16, 12, 10, 0.75);
}

.finder__thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.finder__card-name {
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  line-height: 1.3;
  word-break: break-word;
}

.finder__card-meta {
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  color: var(--text-muted);
}

.finder__empty {
  padding: 3rem 1rem;
  text-align: center;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

/* === 詳細檢視 === */
.finder__detail {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.finder__detail-body {
  padding: 1.1rem 1.25rem 1.75rem;
}

.finder__cover {
  width: 100%;
  max-height: 260px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--os-chrome-border);
  margin-bottom: 1rem;
}

.finder__detail-title {
  margin: 0 0 0.25rem;
  font-family: var(--font-display);
  font-size: 1.75rem;
  letter-spacing: 0.02em;
  color: var(--text);
}

.finder__detail-kind {
  margin: 0 0 1rem;
  color: var(--volt);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.finder__detail-desc {
  margin: 0 0 1.25rem;
  color: var(--text-secondary);
  font-size: 0.9375rem;
  line-height: 1.75;
  white-space: pre-line;
}

.finder__detail-h4 {
  margin: 0 0 0.6rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.finder__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin: 0 0 1.25rem;
  padding: 0;
  list-style: none;
}

.finder__chips li {
  padding: 0.2rem 0.6rem;
  background: rgba(225, 193, 110, 0.1);
  border: 1px solid rgba(225, 193, 110, 0.25);
  border-radius: 20px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.finder__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.finder__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.5rem 1rem;
  background: rgba(225, 193, 110, 0.1);
  border: 1px solid rgba(225, 193, 110, 0.3);
  border-radius: 8px;
  color: var(--text);
  font-size: 0.8125rem;
  font-weight: 700;
  text-decoration: none;
}

.finder__btn:hover {
  background: rgba(225, 193, 110, 0.2);
}

.finder__btn--primary {
  background: var(--volt);
  color: var(--ink);
  border-color: var(--volt);
}

.finder__btn--primary:hover {
  background: var(--primary-dark);
}

@media (max-width: 768px) {
  .finder {
    flex-direction: column;
  }

  .finder__sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--os-chrome-border);
    padding: 0.6rem;
  }

  .finder__nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .finder__nav-btn {
    width: auto;
    white-space: nowrap;
  }

  .finder__sidebar-title {
    display: none;
  }

  .finder__search input {
    width: 88px;
  }
}
</style>
