<template>
  <div class="term" ref="scrollRef" @click="skip">
    <p class="term__login">Last login: {{ loginStamp }} on ttys001</p>

    <div v-for="(line, i) in visibleLines" :key="i" class="term__line">
      <span v-if="line.type === 'cmd'" class="term__prompt">{{ PROMPT }}</span>
      <span :class="line.type === 'cmd' ? 'term__cmd' : 'term__out'">{{ line.text }}</span>
    </div>

    <div v-if="pending" class="term__line">
      <span v-if="pending.type === 'cmd'" class="term__prompt">{{ PROMPT }}</span>
      <span :class="pending.type === 'cmd' ? 'term__cmd' : 'term__out'">{{ pending.text }}</span>
      <span class="term__caret" />
    </div>

    <div v-if="finished" class="term__line">
      <span class="term__prompt">{{ PROMPT }}</span>
      <span class="term__caret" />
    </div>

    <p v-if="!finished" class="term__skip">（點擊視窗可跳過動畫）</p>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useProfileStore } from '@/stores/profile'

interface TermLine {
  type: 'cmd' | 'out'
  text: string
}

const PROMPT = 'bob@bb-made ~ % '
const TYPE_SPEED = 45
const OUT_DELAY = 90

const profileStore = useProfileStore()

const visibleLines = ref<TermLine[]>([])
const pending = ref<TermLine | null>(null)
const finished = ref(false)
const scrollRef = ref<HTMLElement | null>(null)

const loginStamp = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  month: 'short',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
}).format(new Date())

/** 依 API 資料組出 terminal 腳本 */
const script = computed<TermLine[]>(() => {
  const profile = profileStore.profile
  const lines: TermLine[] = []

  lines.push({ type: 'cmd', text: 'whoami' })
  lines.push({
    type: 'out',
    text: (profile?.display_name || profile?.name || 'BOB TSOU').toUpperCase()
  })

  lines.push({ type: 'cmd', text: 'cat bio.md' })
  if (profile?.title) lines.push({ type: 'out', text: `# ${profile.title}` })
  lines.push({
    type: 'out',
    text: profile?.bio || '前端工程師，專注於介面互動與使用者體驗。'
  })

  const roles = profile?.role_texts?.filter(Boolean) ?? []
  if (roles.length) {
    lines.push({ type: 'cmd', text: 'cat roles.txt' })
    roles.forEach((role) => lines.push({ type: 'out', text: `- ${role}` }))
  }

  const experiences = profileStore.experiences
  if (experiences.length) {
    lines.push({ type: 'cmd', text: 'ls -1 experience/' })
    experiences.forEach((exp) =>
      lines.push({ type: 'out', text: `${exp.company} — ${exp.position}` })
    )
  }

  lines.push({ type: 'cmd', text: 'echo $CONTACT' })
  lines.push({ type: 'out', text: profile?.email || 'hello@bb-made.com' })

  return lines
})

// ==========================================
// 打字機
// ==========================================
let cancelled = false
let timer: ReturnType<typeof setTimeout> | null = null

const wait = (ms: number) =>
  new Promise<void>((resolve) => {
    timer = setTimeout(resolve, ms)
  })

const skip = () => {
  if (finished.value) return
  cancelled = true
  if (timer) clearTimeout(timer)
  visibleLines.value = [...script.value]
  pending.value = null
  finished.value = true
}

const run = async () => {
  for (const line of script.value) {
    if (cancelled) return

    if (line.type === 'cmd') {
      let typed = ''
      pending.value = { type: 'cmd', text: '' }
      for (const char of line.text) {
        typed += char
        pending.value = { type: 'cmd', text: typed }
        await wait(TYPE_SPEED)
        if (cancelled) return
      }
      await wait(180)
    } else {
      await wait(OUT_DELAY)
    }

    if (cancelled) return
    visibleLines.value.push(line)
    pending.value = null
  }
  finished.value = true
}

// 每次有新內容就捲到底部
watch(
  () => [visibleLines.value.length, pending.value?.text],
  async () => {
    await nextTick()
    if (scrollRef.value) scrollRef.value.scrollTop = scrollRef.value.scrollHeight
  }
)

onMounted(async () => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    skip()
    return
  }
  // 等 API 資料到齊再開始，避免打完字才拿到 bio
  if (!profileStore.profile) await profileStore.fetchAllProfileData()
  if (!cancelled) run()
})

onUnmounted(() => {
  cancelled = true
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.term {
  /* 自己當捲動容器，打字時才能捲到底 */
  height: 100%;
  overflow-y: auto;
  padding: 1rem 1.15rem 2rem;
  background: rgba(8, 6, 5, 0.85);
  color: #d8ffd8;
  font-family: var(--font-mono);
  font-size: 0.8125rem;
  line-height: 1.7;
  cursor: text;
}

.term__login {
  margin: 0 0 0.75rem;
  color: var(--text-muted);
}

.term__line {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  white-space: pre-wrap;
  word-break: break-word;
}

.term__prompt {
  color: var(--volt);
  white-space: pre;
  flex-shrink: 0;
}

.term__cmd {
  color: var(--pearl);
  font-weight: 700;
}

.term__out {
  color: #a8d8b0;
}

.term__caret {
  display: inline-block;
  width: 8px;
  height: 1em;
  margin-left: 2px;
  background: var(--volt);
  animation: term-blink 1s steps(2, start) infinite;
  vertical-align: text-bottom;
}

.term__skip {
  margin: 1.25rem 0 0;
  color: var(--text-muted);
  font-size: 0.6875rem;
}

@keyframes term-blink {
  to {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .term__caret {
    animation: none;
  }
}
</style>
