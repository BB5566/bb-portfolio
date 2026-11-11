<template>
  <!-- 校對稿 Q&A：像一張校對稿，回答旁邊用紅筆標出處 -->
  <section
    v-if="open"
    id="proof-qa"
    class="qa"
    role="region"
    aria-label="校對稿 Q&A"
    @keydown.esc="emit('close')"
  >
    <div class="head">
      <b>
        <PixelHeart />
        校對稿 Q&amp;A
      </b>
      <span class="note">回答都是預先寫好的，只用作品集與公開求職檔案上的內容</span>
      <button type="button" aria-label="關閉校對稿" @click="emit('close')">✕</button>
    </div>

    <div ref="outEl" class="out" aria-live="polite">
      <template v-for="(m, i) in messages" :key="i">
        <div class="q">{{ m.q }}</div>
        <div v-if="m.item?.a" class="a">
          <div>{{ m.item.a }}</div>
          <span class="src">
            <a :href="m.item.href" @click="emit('close')">{{ m.item.source }}</a>
          </span>
        </div>
        <div v-else class="a fallback">
          <div>
            這個作品集沒提到，可以直接寄信問 Bob：
            <a v-if="email" :href="`mailto:${email}`">{{ email }}</a>
          </div>
          <span class="src">出處：無（作品集未提及）</span>
        </div>
      </template>
    </div>

    <div class="chips">
      <button v-for="x in QA" :key="x.q" type="button" @click="ask(x.q)">{{ x.q }}</button>
    </div>
    <form @submit.prevent="submit">
      <input
        ref="inputEl"
        v-model="draft"
        type="text"
        placeholder="問一個關於 Bob 的問題…"
        autocomplete="off"
        aria-label="輸入問題"
      />
      <button type="submit">送出</button>
    </form>
  </section>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import { QA, findAnswer, type QaItem } from './proofQa'
import PixelHeart from './PixelHeart.vue'

const props = defineProps<{ open: boolean; email: string | null }>()
const emit = defineEmits<{ close: [] }>()

// 一打開先有一則示範，讓人知道怎麼用
const messages = ref<{ q: string; item?: QaItem }[]>([
  {
    q: '這是誰的作品集？',
    item: {
      q: '這是誰的作品集？',
      keywords: [],
      a: 'Bob Tsou — 設計與電商出身的前端工程師，一人重建公司的地端 AI 內容產線。下面選一個問題，或自己打。',
      source: '出處：關於我',
      href: '#brief'
    }
  }
])
const draft = ref('')
const outEl = ref<HTMLElement>()
const inputEl = ref<HTMLInputElement>()

async function ask(text: string) {
  messages.value.push({ q: text, item: findAnswer(text) })
  await nextTick()
  outEl.value?.scrollTo({ top: outEl.value.scrollHeight })
}

function submit() {
  const text = draft.value.trim()
  if (!text) return
  ask(text)
  draft.value = ''
}

// 打開就把游標放進輸入框
watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    inputEl.value?.focus()
  }
)
</script>

<style scoped>
.qa {
  position: fixed;
  right: 16px;
  bottom: 72px;
  z-index: 70;
  display: flex;
  flex-direction: column;
  width: 440px;
  max-width: calc(100% - 32px);
  height: min(600px, 72vh);
  overflow: hidden;
  border: 1px solid var(--rule);
  border-radius: 12px;
  background: #fbf8f1;
  color: var(--ink);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
}

.head {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--rule);
  font-family: var(--mono);
  font-size: var(--fs-mark);
  letter-spacing: 0.1em;
}

.head b {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 400;
  color: #d7262d;
  white-space: nowrap;
}

.head b .pixel-heart {
  color: var(--ink);
  font-size: 15px;
}

.head .note {
  margin-left: auto;
  font-size: var(--fs-mark);
  letter-spacing: 0.04em;
  color: var(--ink-2);
  text-align: right;
}

.head button {
  padding: 4px 8px;
  border: 0;
  background: none;
  color: inherit;
  font-size: var(--fs-ui);
  cursor: pointer;
}

/* 稿紙橫線 */
.out {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
  overflow: auto;
  padding: 14px;
  background-image: linear-gradient(transparent 27px, rgba(21, 22, 26, 0.06) 28px);
  background-size: 100% 28px;
}

.q {
  font-weight: 700;
  font-size: var(--fs-body);
}

.q::before {
  content: 'Q';
  margin-right: 8px;
  padding: 0 5px;
  border: 1px solid #d7262d;
  border-radius: 3px;
  font-family: var(--mono);
  font-size: var(--fs-mark);
  color: #d7262d;
}

.a {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 118px;
  gap: 10px;
  padding-left: 22px;
  font-size: var(--fs-body);
  line-height: 1.7;
}

.a::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 4px;
  bottom: 4px;
  width: 2px;
  border-radius: 2px;
  background: #d7262d;
  opacity: 0.7;
}

.a a {
  color: inherit;
}

/* 出處：紅筆眉批 */
.src {
  align-self: start;
  padding-left: 8px;
  border-left: 1px dashed #d7262d;
  font-family: var(--mono);
  font-size: var(--fs-mark);
  line-height: 1.45;
  color: #d7262d;
  rotate: -1.2deg;
}

.src::before {
  content: '✓ ';
  font-weight: 600;
}

.fallback .src {
  border-color: var(--ink-2);
  color: var(--ink-2);
}

.fallback .src::before {
  content: '? ';
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 8px 14px;
  border-top: 1px solid var(--rule);
}

.chips button {
  min-height: 36px;
  padding: 7px 11px;
  border: 1px solid var(--ink);
  border-radius: 999px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: var(--fs-small);
  cursor: pointer;
}

.chips button:hover {
  background: var(--ink);
  color: #fff;
}

form {
  display: flex;
  gap: 6px;
  padding: 8px 14px 12px;
}

input {
  flex: 1;
  min-width: 0;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid var(--ink);
  border-radius: 8px;
  background: #fff;
  color: var(--ink);
  font: inherit;
  font-size: 16px; /* 16px 以上 iPhone 才不會自動放大 */
}

form button {
  min-height: 44px;
  padding: 0 14px;
  border: 0;
  border-radius: 8px;
  background: #d7262d;
  color: #fff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

@media (max-width: 900px) {
  .qa {
    right: 0;
    left: 0;
    bottom: 0;
    width: 100%;
    max-width: none;
    height: 78vh;
    border-radius: 16px 16px 0 0;
  }
}

@media (max-width: 480px) {
  .a {
    grid-template-columns: 1fr;
  }
}
</style>
