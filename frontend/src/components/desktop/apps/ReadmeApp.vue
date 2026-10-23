<template>
  <article class="readme">
    <h1 class="readme__h1"># {{ displayName }} — Portfolio OS</h1>

    <p class="readme__p">
      這是一個以「桌面作業系統」為隱喻的個人作品集。所有內容都放在視窗裡，
      你可以像使用電腦一樣拖曳、縮放與切換。
    </p>

    <h2 class="readme__h2">## 怎麼逛</h2>
    <ul class="readme__list">
      <li>
        <b>Finder</b>
        — 作品集，依分類瀏覽專案
      </li>
      <li>
        <b>Terminal</b>
        — 關於我，會自己把自我介紹打出來
      </li>
      <li>
        <b>Calendar</b>
        — 工作經歷與學習歷程時間軸
      </li>
      <li>
        <b>System Profiler</b>
        — 技能與統計數據
      </li>
      <li>
        <b>Mail</b>
        — 想聊聊的話從這裡寄信給我
      </li>
    </ul>

    <h2 class="readme__h2">## 快捷操作</h2>
    <ul v-if="!isMobile" class="readme__list">
      <li>拖曳視窗標題列可移動視窗，雙擊標題列可切換全螢幕</li>
      <li>
        <code>Esc</code>
        關閉目前最上層的視窗
      </li>
      <li>再次點擊 Dock 圖示可把視窗縮到最小</li>
    </ul>
    <ul v-else class="readme__list">
      <li>點擊左上角紅綠燈按鈕可關閉、最小化或全螢幕</li>
      <li>再次點擊 Dock 圖示可把視窗縮到最小</li>
    </ul>

    <h2 class="readme__h2">## 技術棧</h2>
    <pre class="readme__code">
frontend  Vue 3 · TypeScript · Vite · Pinia · GSAP
backend   Laravel 11 · MySQL
deploy    Docker · GitHub Actions</pre
    >

    <p class="readme__footer">— {{ displayName }}, {{ year }}</p>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useProfileStore } from '@/stores/profile'
import { useIsMobile } from '@/composables/useIsMobile'

const profileStore = useProfileStore()
const isMobile = useIsMobile()
const displayName = computed(
  () => profileStore.profile?.display_name || profileStore.profile?.name || 'Bob Tsou'
)
const year = new Date().getFullYear()
</script>

<style scoped>
.readme {
  min-height: 100%;
  padding: 1.5rem 1.75rem 2.5rem;
  background: rgba(240, 230, 210, 0.03);
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.85;
  color: var(--text-secondary);
}

.readme__h1 {
  margin: 0 0 1rem;
  font-family: var(--font-mono);
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--volt);
}

.readme__h2 {
  margin: 1.5rem 0 0.5rem;
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--text);
}

.readme__p {
  margin: 0;
}

.readme__list {
  margin: 0;
  padding-left: 1.2rem;
}

.readme__list li::marker {
  color: var(--volt);
}

.readme__list b {
  color: var(--text);
}

.readme code {
  padding: 0.05rem 0.35rem;
  background: rgba(225, 193, 110, 0.12);
  border-radius: 4px;
  color: var(--volt);
}

.readme__code {
  margin: 0.5rem 0 0;
  padding: 0.85rem 1rem;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--os-chrome-border);
  border-radius: 6px;
  color: var(--text-light);
  font-size: 0.75rem;
  line-height: 1.7;
  overflow-x: auto;
}

.readme__footer {
  margin: 2rem 0 0;
  color: var(--text-muted);
  font-size: 0.75rem;
}
</style>
