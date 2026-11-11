<template>
  <section id="ship" class="proof-ship" aria-labelledby="proof-ship-title">
    <ProofFrame class="wrap">
      <div class="shead">
        <h2 id="proof-ship-title">
          上線
          <small>聯絡</small>
        </h2>
      </div>

      <div class="grid">
        <div class="intro">
          <p class="lead">歡迎聊前端、AI 應用或合作機會，我通常一天內回覆。</p>
          <a v-if="email" class="mail" :href="`mailto:${email}`">{{ email }}</a>
          <div class="links">
            <a class="btn primary" :href="resumeUrl" target="_blank" rel="noopener">履歷 PDF</a>
            <a class="btn" :href="RESUME_EN_URL" target="_blank" rel="noopener">English</a>
            <a class="btn" :href="githubUrl" target="_blank" rel="noopener">GitHub</a>
          </div>
          <p v-if="location" class="loc">{{ location }}</p>
        </div>

        <!-- 表單放在一張白紙上，跟頁面同一套紙色 -->
        <div class="screen">
          <ContactForm compact />
        </div>
      </div>

      <footer class="foot">
        <span>© {{ year }} Bob Tsou · bb-made.com</span>
        <!-- 正式站 Lighthouse 12 實測（手機量 3 次取中位數）；改版後要重量再改這行 -->
        <span>本站 Lighthouse 實測 2026-11-09：手機效能 89・無障礙 100｜桌機效能 99</span>
        <RouterLink class="egg" to="/os" title="Portfolio OS">⌘ /os</RouterLink>
      </footer>

      <!-- 收尾的版權頁：滿版字標，像印刷品最後一頁 -->
      <ProofWordmark class="footmark" />
      <p class="colophon">
        <span>設計與前端：Bob Tsou</span>
        <span>Vue 3＋TypeScript・Laravel</span>
        <span>字型：DM Sans・Noto Serif TC</span>
        <a href="#main-content">回到頂端 ↑</a>
      </p>
    </ProofFrame>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import ContactForm from '@/components/ContactForm.vue'
import ProofFrame from './ProofFrame.vue'
import ProofWordmark from './ProofWordmark.vue'
import { RESUME_EN_URL } from './resume'

defineProps<{
  email: string | null
  location: string | null
  githubUrl: string
  resumeUrl: string
}>()

const year = new Date().getFullYear()
</script>

<style scoped>
.proof-ship {
  padding: 60px 0 48px;
}

.shead {
  margin-bottom: 22px;
}

.shead h2 {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 12px;
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: 900;
  letter-spacing: 0.02em;
}

.shead h2 small {
  font-family: var(--latin);
  font-size: var(--fs-ui);
  letter-spacing: 0.04em;
  color: var(--ink-2);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 40px;
  align-items: start;
}

.lead {
  margin: 0;
  font-size: var(--fs-lead);
  color: var(--ink);
}

.mail {
  display: block;
  margin-top: 14px;
  font-family: var(--latin);
  font-weight: 700;
  font-size: var(--fs-big);
  letter-spacing: -0.02em;
  color: var(--ink);
  text-decoration: none;
  word-break: break-all;
}

.mail:hover {
  color: var(--accent-ink);
}

.links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 22px;
}

.btn {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  padding: 0 22px;
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  color: var(--ink);
  font-weight: 700;
  font-size: var(--fs-body);
  text-decoration: none;
}

.btn.primary {
  background: var(--ink);
  color: var(--paper);
}

.loc {
  margin: 14px 0 0;
  font-size: var(--fs-ui);
  color: var(--ink-2);
}

/* 紙色表單：表單本身是深色系統的元件，這裡把它的顏色變數換成這頁的色票 */
.screen {
  --volt: var(--accent-ink);
  --pearl: var(--ink);
  --text-muted: var(--ink-2);
  padding: 28px;
  border-radius: 12px;
  background: #fff;
}

.screen :deep(.form-input),
.screen :deep(.form-textarea) {
  border-color: var(--rule);
  background: var(--paper);
  color: var(--ink);
}

.screen :deep(.form-input:focus),
.screen :deep(.form-textarea:focus) {
  border-color: var(--ink);
  background: var(--paper);
  box-shadow: 0 0 0 3px rgba(232, 84, 44, 0.18);
}

.screen :deep(.submit-btn) {
  border-radius: 12px;
  color: #fff;
}

.screen :deep(.submit-btn:hover:not(:disabled)) {
  box-shadow: none;
}

.foot {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 48px;
  padding-top: 16px;
  border-top: 1px solid var(--rule);
  font-size: var(--fs-small);
  color: var(--ink-2);
}

.egg {
  font-family: var(--mono);
  color: inherit;
  text-decoration: none;
  opacity: 0.92;
}

.egg:hover,
.egg:focus-visible {
  opacity: 1;
}

.footmark {
  margin-top: 40px;
}

.colophon {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin: 16px 0 0;
  font-size: var(--fs-small);
  color: var(--ink-2);
}

.colophon a {
  margin-left: auto;
  color: var(--ink);
  font-weight: 700;
  text-decoration: none;
}

.colophon a:hover {
  color: var(--accent-ink);
}

@media (max-width: 900px) {
  .grid {
    grid-template-columns: 1fr;
  }

  .screen {
    padding: 20px;
  }
}
</style>
