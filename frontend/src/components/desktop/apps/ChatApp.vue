<template>
  <div class="chat">
    <header class="chat__head">
      <div>
        <h3 class="chat__title">{{ displayName }}</h3>
        <p class="chat__status">
          <span class="chat__dot" />
          {{ isMock ? '示範模式 — 回應為預錄內容' : '線上' }}
        </p>
      </div>
    </header>

    <ol class="chat__log" ref="logRef">
      <li v-for="(msg, i) in messages" :key="i" class="chat__row" :class="`chat__row--${msg.role}`">
        <p class="chat__bubble">{{ msg.text }}</p>
      </li>

      <li v-if="pending" class="chat__row chat__row--assistant">
        <p class="chat__bubble chat__bubble--typing">
          <span />
          <span />
          <span />
        </p>
      </li>
    </ol>

    <form class="chat__composer" @submit.prevent="send">
      <input
        v-model="draft"
        type="text"
        class="chat__input"
        placeholder="問我任何事…"
        aria-label="訊息內容"
        maxlength="500"
        :disabled="pending"
      />
      <button
        type="submit"
        class="chat__send"
        :disabled="pending || !draft.trim()"
        aria-label="送出"
      >
        <Send :size="16" aria-hidden="true" />
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { Send } from 'lucide-vue-next'
import { useProfileStore } from '@/stores/profile'
import { useProjectStore } from '@/stores/projects'

interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

// 後端 proxy 好了之後只要設這個環境變數，其餘不用動
const CHAT_ENDPOINT = import.meta.env.VITE_CHAT_API || ''
const isMock = !CHAT_ENDPOINT

const profileStore = useProfileStore()
const projectStore = useProjectStore()

const messages = ref<ChatMessage[]>([])
const draft = ref('')
const pending = ref(false)
const logRef = ref<HTMLElement | null>(null)

const displayName = computed(
  () => profileStore.profile?.display_name || profileStore.profile?.name || 'Bob Tsou'
)

/** 假資料回應：從既有 API 資料組出答案，不憑空編造 */
function mockReply(question: string): string {
  const q = question.toLowerCase()
  const profile = profileStore.profile

  if (/技能|會什麼|skill|技術|stack/.test(q)) {
    const skills = profileStore.skillsByCategory
    const list = Array.isArray(skills) ? (skills as string[]) : Object.values(skills).flat()
    return list.length
      ? `我目前的技能包含：${list.join('、')}。想深入聊哪一項？`
      : '技能資料還在載入，稍等一下再問我一次。'
  }

  if (/經歷|工作|職涯|experience|公司/.test(q)) {
    const current = profileStore.currentExperience
    const count = profileStore.experiences.length
    return current
      ? `我現在在${current.company}擔任${current.position}。累積共 ${count} 段工作經歷，開 Calendar 視窗可以看完整時間軸。`
      : '經歷資料開 Calendar 視窗看最完整。'
  }

  if (/作品|專案|project|做過/.test(q)) {
    const titles = projectStore.publishedProjects.map((p) => p.title)
    return titles.length
      ? `目前展示中的作品有：${titles.join('、')}。開 Finder 視窗可以看細節。`
      : '作品資料還在載入中。'
  }

  if (/聯絡|contact|email|信箱|合作/.test(q)) {
    return `直接寄信給我：${profile?.email || 'hello@bb-made.com'}，或用 Dock 上的 Mail 視窗留言。`
  }

  if (/你好|哈囉|嗨|hi|hello/.test(q)) {
    return `嗨！我是 ${displayName.value}。可以問我技能、經歷、作品或聯絡方式。`
  }

  return '這題我還沒學會回答。試著問我「你會什麼技能」、「你的經歷」或「有哪些作品」。'
}

async function requestReply(question: string): Promise<string> {
  if (isMock) {
    // 模擬思考時間，讓打字指示器看得到
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 600))
    return mockReply(question)
  }

  const res = await fetch(CHAT_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: question, history: messages.value.slice(-10) })
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  return data.reply ?? data.message ?? ''
}

const send = async () => {
  const question = draft.value.trim()
  if (!question || pending.value) return

  messages.value.push({ role: 'user', text: question })
  draft.value = ''
  pending.value = true

  try {
    const reply = await requestReply(question)
    messages.value.push({ role: 'assistant', text: reply })
  } catch {
    messages.value.push({ role: 'assistant', text: '連線出了點問題，稍後再試一次。' })
  } finally {
    pending.value = false
  }
}

watch(
  () => [messages.value.length, pending.value],
  async () => {
    await nextTick()
    if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight
  }
)

onMounted(() => {
  messages.value.push({
    role: 'assistant',
    text: `嗨，我是 ${displayName.value}。可以問我技能、經歷、作品或聯絡方式。`
  })
  window.dispatchEvent(new CustomEvent('avatar-state', { detail: 'idle' }))
})

// 讓桌面 avatar 知道現在是不是在「說話」
watch(pending, (value) => {
  window.dispatchEvent(new CustomEvent('avatar-state', { detail: value ? 'thinking' : 'idle' }))
})

onUnmounted(() => {
  window.dispatchEvent(new CustomEvent('avatar-state', { detail: 'idle' }))
})
</script>

<style scoped>
.chat {
  display: flex;
  flex-direction: column;
  height: 100%;
  font-family: var(--font-body);
}

.chat__head {
  flex-shrink: 0;
  padding: 0.75rem 1.1rem;
  border-bottom: 1px solid var(--os-chrome-border);
}

.chat__title {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--text);
}

.chat__status {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  margin: 0.1rem 0 0;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.6875rem;
}

.chat__dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--electric-blue);
  box-shadow: 0 0 6px var(--electric-blue);
}

/* === 對話紀錄 === */
.chat__log {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin: 0;
  padding: 1rem 1.1rem;
  list-style: none;
}

.chat__row {
  display: flex;
  max-width: 78%;
}

.chat__row--user {
  align-self: flex-end;
  justify-content: flex-end;
}

.chat__row--assistant {
  align-self: flex-start;
}

.chat__bubble {
  margin: 0;
  padding: 0.55rem 0.9rem;
  border-radius: 16px;
  font-size: 0.875rem;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat__row--assistant .chat__bubble {
  background: rgba(46, 38, 32, 0.9);
  border: 1px solid var(--os-chrome-border);
  border-bottom-left-radius: 5px;
  color: var(--text-secondary);
}

.chat__row--user .chat__bubble {
  background: var(--volt);
  border-bottom-right-radius: 5px;
  color: var(--ink);
  font-weight: 500;
}

/* 打字指示器 */
.chat__bubble--typing {
  display: flex;
  gap: 4px;
  padding: 0.7rem 0.9rem;
}

.chat__bubble--typing span {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--text-muted);
  animation: chat-blink 1.2s ease-in-out infinite;
}

.chat__bubble--typing span:nth-child(2) {
  animation-delay: 0.2s;
}

.chat__bubble--typing span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes chat-blink {
  0%,
  60%,
  100% {
    opacity: 0.25;
  }
  30% {
    opacity: 1;
  }
}

/* === 輸入列 === */
.chat__composer {
  flex-shrink: 0;
  display: flex;
  gap: 0.5rem;
  padding: 0.75rem 1.1rem;
  border-top: 1px solid var(--os-chrome-border);
}

.chat__input {
  flex: 1;
  min-width: 0;
  padding: 0.55rem 0.9rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid var(--os-chrome-border);
  border-radius: 20px;
  color: var(--text);
  font-family: inherit;
  font-size: 0.875rem;
}

.chat__input:focus {
  outline: none;
  border-color: rgba(225, 193, 110, 0.5);
}

.chat__input::placeholder {
  color: var(--text-muted);
}

.chat__send {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  background: var(--volt);
  border: none;
  border-radius: 50%;
  color: var(--ink);
}

.chat__send:disabled {
  opacity: 0.4;
}

@media (prefers-reduced-motion: reduce) {
  .chat__bubble--typing span {
    animation: none;
    opacity: 0.6;
  }
}
</style>
