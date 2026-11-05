<template>
  <section id="contact" class="section">
    <div class="container contact-grid">
      <div class="intro">
        <h2 v-reveal>聯絡</h2>
        <p v-reveal="80" class="lead">歡迎聊前端、AI 應用或合作機會，我通常一天內回覆。</p>

        <ul v-reveal="160" class="channels">
          <li v-if="email">
            <Mail :size="18" />
            <a :href="`mailto:${email}`">{{ email }}</a>
          </li>
          <li>
            <Github :size="18" />
            <a :href="githubUrl" target="_blank" rel="noopener">{{ githubLabel }}</a>
          </li>
          <li>
            <FileText :size="18" />
            <a :href="resumeUrl" target="_blank" rel="noopener">履歷 PDF</a>
            <span aria-hidden="true">／</span>
            <a href="/resume-en.pdf?v=20261105f" target="_blank" rel="noopener">English</a>
          </li>
        </ul>
      </div>

      <div v-reveal.settle="120" class="form-wrap">
        <ContactForm />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Mail, Github, FileText } from 'lucide-vue-next'
import ContactForm from '@/components/ContactForm.vue'
import { vReveal } from '@/directives/reveal'

const props = defineProps<{
  email: string | null
  githubUrl: string
  resumeUrl: string
}>()

const githubLabel = computed(() => props.githubUrl.replace(/^https?:\/\//, ''))
</script>

<style scoped>
.section {
  padding: var(--space-2xl) 0;
  scroll-margin-top: 64px;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: var(--space-2xl);
  align-items: start;
}

h2 {
  font-family: var(--font-display);
  font-size: var(--text-title);
  letter-spacing: 0.04em;
  color: var(--pearl);
  margin: 0 0 var(--space-sm);
}

.lead {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 var(--space-lg);
}

.channels {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.channels li {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--volt);
}

.channels a {
  color: var(--text-secondary);
  text-decoration: none;
  word-break: break-all;
}

.channels a:hover {
  color: var(--volt);
}

.form-wrap {
  padding: var(--space-lg);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: var(--space-lg);
  }

  .form-wrap {
    padding: var(--space-md);
  }
}
</style>
