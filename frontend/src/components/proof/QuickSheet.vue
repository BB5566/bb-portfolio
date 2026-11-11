<template>
  <!-- 給招募者的 60 秒版：手機從下面滑出、桌機是置中的便利貼 -->
  <dialog
    ref="dialogEl"
    class="quick-sheet"
    aria-labelledby="quick-sheet-title"
    @click="onBackdrop"
  >
    <div class="sheet">
      <div class="head">
        <span>給招募者的 60 秒版</span>
        <button ref="closeEl" type="button" @click="close">關閉</button>
      </div>
      <h2 id="quick-sheet-title">{{ name }}</h2>
      <p class="role">
        {{ copy.role }}
        <template v-if="location">· {{ location }}</template>
      </p>
      <ul v-if="stats.length" class="nums">
        <li v-for="s in stats" :key="s.value">
          <b>{{ s.value }}</b>
          {{ s.label }}
        </li>
      </ul>
      <p class="how">{{ copy.how }}</p>
      <div class="go">
        <a :href="resumeUrl" target="_blank" rel="noopener">履歷 PDF</a>
        <a v-if="email" class="alt" :href="`mailto:${email}`">寄信</a>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { ProfileHeroProof, ProfileHighlight } from '@/types/models'

defineProps<{
  name: string
  copy: ProfileHeroProof
  stats: ProfileHighlight[]
  location: string | null
  email: string | null
  resumeUrl: string
}>()

const dialogEl = ref<HTMLDialogElement>()
const closeEl = ref<HTMLButtonElement>()

function open() {
  if (!dialogEl.value || dialogEl.value.open) return
  dialogEl.value.showModal()
  closeEl.value?.focus()
}

function close() {
  dialogEl.value?.close()
}

// 點到便利貼外面（dialog 本身就是背景那一層）就關掉
function onBackdrop(e: MouseEvent) {
  if (e.target === dialogEl.value) close()
}

defineExpose({ open, close })
</script>

<style scoped>
.quick-sheet {
  border: 0;
  padding: 0;
  background: transparent;
  max-width: none;
  max-height: none;
}

.quick-sheet::backdrop {
  background: rgba(21, 22, 26, 0.5);
  backdrop-filter: blur(6px);
}

.sheet {
  position: fixed;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  width: min(560px, 100%);
  max-height: 88vh;
  overflow: auto;
  padding: 22px 24px 28px;
  border-radius: 22px 22px 0 0;
  background: #fff9a8;
  color: #2a2400;
  box-shadow: 0 -20px 60px rgba(0, 0, 0, 0.35);
  font-family: 'PingFang TC', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif;
  font-size: var(--fs-body);
  line-height: 1.65;
}

@media (min-width: 901px) {
  .sheet {
    bottom: auto;
    top: 50%;
    transform: translate(-50%, -50%);
    border-radius: 14px;
    rotate: -0.6deg;
  }
}

.head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-family: 'JetBrains Mono', monospace;
  font-size: var(--fs-mark);
  letter-spacing: 0.14em;
  color: #6b5a00;
}

.head button {
  flex: none;
  min-height: 40px;
  padding: 8px 12px;
  border: 1.5px solid currentColor;
  border-radius: 8px;
  background: none;
  color: inherit;
  font: inherit;
  font-size: var(--fs-small);
  font-weight: 700;
  letter-spacing: 0;
  cursor: pointer;
}

h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 900;
}

.role {
  margin: 2px 0 0;
  font-weight: 500;
}

.nums {
  list-style: none;
  margin: 14px 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 14px;
  font-size: var(--fs-small);
}

.nums li:nth-child(3) {
  grid-column: 1 / -1;
}

.nums b {
  display: block;
  font-family: 'DM Sans', sans-serif;
  font-size: 20px;
  color: #15161a;
  white-space: nowrap;
}

.how {
  margin: 0;
  padding-top: 10px;
  border-top: 1px dashed rgba(0, 0, 0, 0.25);
  font-size: var(--fs-ui);
}

.go {
  display: flex;
  gap: 8px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.go a {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 11px 16px;
  border-radius: 10px;
  background: #15161a;
  color: #fff;
  font-weight: 700;
  font-size: var(--fs-ui);
  text-decoration: none;
}

.go a.alt {
  background: transparent;
  border: 1.5px solid #15161a;
  color: #15161a;
}
</style>
