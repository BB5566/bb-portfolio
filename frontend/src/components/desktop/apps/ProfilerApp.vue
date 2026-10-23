<template>
  <div class="prof">
    <!-- 側欄：硬體 / 軟體分類 -->
    <aside class="prof__sidebar">
      <p class="prof__sidebar-title">內容</p>
      <ul class="prof__nav">
        <li>
          <button
            type="button"
            class="prof__nav-btn"
            :class="{ 'is-active': activeSection === OVERVIEW }"
            @click="activeSection = OVERVIEW"
          >
            <HardDrive :size="14" aria-hidden="true" />
            系統總覽
          </button>
        </li>
        <li v-for="group in skillGroups" :key="group.name">
          <button
            type="button"
            class="prof__nav-btn"
            :class="{ 'is-active': activeSection === group.name }"
            @click="activeSection = group.name"
          >
            <Layers :size="14" aria-hidden="true" />
            {{ group.name }}
          </button>
        </li>
      </ul>
    </aside>

    <!-- 主區 -->
    <div class="prof__main">
      <template v-if="activeSection === OVERVIEW">
        <h3 class="prof__heading">{{ machineName }}</h3>
        <p class="prof__sub">bb-made.com — Frontend Workstation</p>

        <dl class="prof__table">
          <div v-for="row in overviewRows" :key="row.label" class="prof__row">
            <dt>{{ row.label }}</dt>
            <dd>{{ row.value }}</dd>
          </div>
        </dl>
      </template>

      <template v-else-if="activeGroup">
        <h3 class="prof__heading">{{ activeGroup.name }}</h3>
        <p class="prof__sub">共 {{ activeGroup.items.length }} 個已安裝模組</p>

        <ul class="prof__skills">
          <li v-for="skill in activeGroup.items" :key="skill" class="prof__skill">
            <span class="prof__skill-name">{{ skill }}</span>
            <span class="prof__skill-bar">
              <span class="prof__skill-fill" />
            </span>
          </li>
        </ul>
      </template>

      <p v-else class="prof__empty">沒有可顯示的資訊</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { HardDrive, Layers } from 'lucide-vue-next'
import { useProfileStore } from '@/stores/profile'

const OVERVIEW = '__overview__'

const profileStore = useProfileStore()
const activeSection = ref<string>(OVERVIEW)

const machineName = computed(() => {
  const profile = profileStore.profile
  return `${profile?.display_name || profile?.name || 'Bob Tsou'}'s MacBook Pro`
})

// API 的 skills 可能是扁平陣列，也可能是 { 分類: [...] }，兩種都要吃
const skillGroups = computed(() => {
  const raw = profileStore.skillsByCategory
  if (Array.isArray(raw)) return [{ name: 'Skills', items: raw as string[] }]

  return Object.entries(raw)
    .map(([name, items]) => ({ name, items: Array.isArray(items) ? items : [] }))
    .filter((group) => group.items.length > 0)
})

const activeGroup = computed(() => skillGroups.value.find((g) => g.name === activeSection.value))

const overviewRows = computed(() => {
  const profile = profileStore.profile
  const rows: Array<{ label: string; value: string }> = [
    { label: '使用者名稱', value: profile?.name || 'Bob Tsou' },
    { label: '職稱', value: profile?.title || '前端工程師' }
  ]

  if (profile?.location) rows.push({ label: '所在地', value: profile.location })
  if (profile?.years_experience)
    rows.push({ label: '運作時間', value: `${profile.years_experience} 年` })
  if (profile?.projects_delivered)
    rows.push({ label: '已交付專案', value: `${profile.projects_delivered} 件` })
  if (profile?.hours_training)
    rows.push({ label: '訓練時數', value: `${profile.hours_training} 小時` })

  rows.push({
    label: '技能模組',
    value: `${skillGroups.value.length} 類 / ${skillGroups.value.reduce((n, g) => n + g.items.length, 0)} 項`
  })
  rows.push({ label: '狀態', value: '運作正常 — 開放合作洽談' })

  return rows
})
</script>

<style scoped>
.prof {
  display: flex;
  min-height: 100%;
  font-family: var(--font-body);
}

.prof__sidebar {
  flex-shrink: 0;
  width: 190px;
  padding: 0.9rem 0.6rem;
  background: rgba(12, 9, 7, 0.55);
  border-right: 1px solid var(--os-chrome-border);
}

.prof__sidebar-title {
  margin: 0 0 0.5rem 0.5rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.prof__nav {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.prof__nav-btn {
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

.prof__nav-btn svg {
  color: var(--volt);
  flex-shrink: 0;
}

.prof__nav-btn:hover {
  background: rgba(225, 193, 110, 0.1);
}

.prof__nav-btn.is-active {
  background: rgba(225, 193, 110, 0.18);
  color: var(--text);
}

.prof__main {
  flex: 1;
  min-width: 0;
  padding: 1.25rem 1.5rem 2rem;
}

.prof__heading {
  margin: 0 0 0.15rem;
  font-family: var(--font-display);
  font-size: 1.6rem;
  letter-spacing: 0.03em;
  color: var(--text);
}

.prof__sub {
  margin: 0 0 1.25rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

/* === 總覽表 === */
.prof__table {
  margin: 0;
  border: 1px solid var(--os-chrome-border);
  border-radius: 8px;
  overflow: hidden;
}

.prof__row {
  display: flex;
  gap: 1rem;
  padding: 0.55rem 0.9rem;
  border-bottom: 1px solid rgba(225, 193, 110, 0.08);
}

.prof__row:nth-child(odd) {
  background: rgba(38, 32, 28, 0.4);
}

.prof__row:last-child {
  border-bottom: none;
}

.prof__row dt {
  flex: 0 0 40%;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.75rem;
}

.prof__row dd {
  flex: 1;
  margin: 0;
  color: var(--text);
  font-size: 0.8125rem;
}

/* === 技能清單 === */
.prof__skills {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.prof__skill {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.5rem 0.9rem;
  background: rgba(38, 32, 28, 0.45);
  border: 1px solid var(--os-chrome-border);
  border-radius: 6px;
}

.prof__skill-name {
  flex: 0 0 45%;
  color: var(--text);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

.prof__skill-bar {
  flex: 1;
  height: 5px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 3px;
  overflow: hidden;
}

/* ponytail: API 沒有熟練度欄位，這裡只是視覺節奏，不假裝有數據 */
.prof__skill-fill {
  display: block;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, var(--volt), var(--plasma));
}

.prof__empty {
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
}

@media (max-width: 768px) {
  .prof {
    flex-direction: column;
  }

  .prof__sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--os-chrome-border);
  }

  .prof__nav {
    flex-direction: row;
    overflow-x: auto;
  }

  .prof__nav-btn {
    width: auto;
    white-space: nowrap;
  }

  .prof__sidebar-title {
    display: none;
  }

  .prof__main {
    padding: 1rem;
  }
}
</style>
