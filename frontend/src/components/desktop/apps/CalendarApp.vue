<template>
  <div class="cal">
    <div class="cal__tabs" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        role="tab"
        class="cal__tab"
        :class="{ 'is-active': activeTab === tab.key }"
        :aria-selected="activeTab === tab.key"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" :size="14" aria-hidden="true" />
        {{ tab.label }}
      </button>
    </div>

    <p v-if="!entries.length" class="cal__empty">此行事曆沒有事件</p>

    <ol v-else class="cal__timeline">
      <li v-for="entry in entries" :key="entry.key" class="cal__event">
        <div class="cal__rail">
          <span class="cal__dot" :class="{ 'cal__dot--current': entry.isCurrent }" />
        </div>

        <div class="cal__card">
          <p class="cal__period">
            {{ entry.period }}
            <span v-if="entry.isCurrent" class="cal__badge">進行中</span>
          </p>
          <h3 class="cal__title">{{ entry.title }}</h3>
          <p class="cal__subtitle">
            {{ entry.subtitle }}
            <span v-if="entry.location" class="cal__location">· {{ entry.location }}</span>
          </p>

          <p v-if="entry.description" class="cal__desc">{{ entry.description }}</p>

          <ul v-if="entry.bullets.length" class="cal__bullets">
            <li v-for="(item, i) in entry.bullets" :key="i">{{ item }}</li>
          </ul>

          <ul v-if="entry.tags.length" class="cal__tags">
            <li v-for="tag in entry.tags" :key="tag">{{ tag }}</li>
          </ul>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Briefcase, GraduationCap } from 'lucide-vue-next'
import { useProfileStore } from '@/stores/profile'

interface CalendarEntry {
  key: string
  period: string
  title: string
  subtitle: string
  location: string | null
  description: string | null
  bullets: string[]
  tags: string[]
  isCurrent: boolean
}

const profileStore = useProfileStore()

const tabs = [
  { key: 'work' as const, label: '工作經歷', icon: Briefcase },
  { key: 'education' as const, label: '學習歷程', icon: GraduationCap }
]
const activeTab = ref<'work' | 'education'>('work')

const workEntries = computed<CalendarEntry[]>(() =>
  profileStore.experiences.map((exp) => ({
    key: `exp-${exp.id}`,
    period: profileStore.getDatePeriod(exp.start_date, exp.end_date, exp.is_current),
    title: exp.position,
    subtitle: exp.company,
    location: exp.location,
    description: exp.description,
    bullets: exp.achievements ?? [],
    tags: exp.technologies ?? [],
    isCurrent: exp.is_current
  }))
)

const educationEntries = computed<CalendarEntry[]>(() =>
  profileStore.education.map((edu) => ({
    key: `edu-${edu.id}`,
    period: profileStore.getDatePeriod(edu.start_date, edu.end_date, edu.is_current),
    title: edu.school,
    subtitle: [edu.degree, edu.field_of_study].filter(Boolean).join(' · '),
    location: edu.location,
    description: edu.description,
    bullets: edu.activities ?? [],
    tags: [],
    isCurrent: edu.is_current
  }))
)

const entries = computed(() =>
  activeTab.value === 'work' ? workEntries.value : educationEntries.value
)
</script>

<style scoped>
.cal {
  min-height: 100%;
  padding: 1rem 1.25rem 2rem;
  font-family: var(--font-body);
}

.cal__tabs {
  display: flex;
  gap: 0.35rem;
  margin-bottom: 1.25rem;
  padding: 0.25rem;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--os-chrome-border);
  border-radius: 8px;
  width: fit-content;
}

.cal__tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  background: none;
  border: none;
  border-radius: 6px;
  color: var(--text-muted);
  font-family: inherit;
  font-size: 0.8125rem;
  font-weight: 700;
}

.cal__tab:hover {
  color: var(--text-secondary);
}

.cal__tab.is-active {
  background: var(--volt);
  color: var(--ink);
}

.cal__empty {
  padding: 3rem 0;
  text-align: center;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.cal__timeline {
  margin: 0;
  padding: 0;
  list-style: none;
}

.cal__event {
  display: flex;
  gap: 1rem;
}

.cal__rail {
  position: relative;
  flex-shrink: 0;
  width: 12px;
  display: flex;
  justify-content: center;
}

/* 連接線 */
.cal__rail::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: 1px;
  background: linear-gradient(180deg, rgba(225, 193, 110, 0.35), rgba(225, 193, 110, 0.08));
}

.cal__event:last-child .cal__rail::before {
  bottom: auto;
  height: 20px;
}

.cal__dot {
  position: relative;
  z-index: 1;
  width: 9px;
  height: 9px;
  margin-top: 16px;
  border-radius: 50%;
  background: var(--titanium);
  border: 2px solid var(--surface);
  box-shadow: 0 0 0 1px rgba(225, 193, 110, 0.3);
}

.cal__dot--current {
  background: var(--volt);
  box-shadow:
    0 0 0 1px var(--volt),
    0 0 12px rgba(225, 193, 110, 0.6);
}

.cal__card {
  flex: 1;
  min-width: 0;
  margin-bottom: 1rem;
  padding: 0.9rem 1.1rem;
  background: rgba(38, 32, 28, 0.55);
  border: 1px solid var(--os-chrome-border);
  border-left: 2px solid rgba(225, 193, 110, 0.35);
  border-radius: 8px;
}

.cal__period {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.35rem;
  color: var(--volt);
  font-family: var(--font-mono);
  font-size: 0.75rem;
  letter-spacing: 0.04em;
}

.cal__badge {
  padding: 0.05rem 0.45rem;
  background: rgba(64, 224, 208, 0.15);
  border: 1px solid rgba(64, 224, 208, 0.4);
  border-radius: 20px;
  color: var(--electric-blue);
  font-size: 0.625rem;
}

.cal__title {
  margin: 0 0 0.15rem;
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--text);
}

.cal__subtitle {
  margin: 0 0 0.6rem;
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.cal__location {
  color: var(--text-muted);
  font-size: 0.8125rem;
}

.cal__desc {
  margin: 0 0 0.6rem;
  color: var(--text-light);
  font-size: 0.875rem;
  line-height: 1.7;
  white-space: pre-line;
}

.cal__bullets {
  margin: 0 0 0.6rem;
  padding-left: 1.1rem;
  color: var(--text-light);
  font-size: 0.8125rem;
  line-height: 1.7;
}

.cal__bullets li::marker {
  color: var(--volt);
}

.cal__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.cal__tags li {
  padding: 0.1rem 0.5rem;
  background: rgba(225, 193, 110, 0.1);
  border: 1px solid rgba(225, 193, 110, 0.22);
  border-radius: 20px;
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
}

@media (max-width: 768px) {
  .cal {
    padding: 0.9rem 0.9rem 2rem;
  }

  .cal__card {
    padding: 0.75rem 0.9rem;
  }
}
</style>
