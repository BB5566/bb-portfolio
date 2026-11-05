<template>
  <section id="experience" class="section">
    <div class="container">
      <header class="section-head">
        <h2 v-reveal>經歷</h2>
      </header>

      <ol class="timeline">
        <li v-for="exp in experiences" :key="exp.id" v-reveal.left class="item">
          <p class="period">{{ period(exp.start_date, exp.end_date, exp.is_current) }}</p>
          <div class="content">
            <h3>{{ exp.position }}</h3>
            <p class="company">{{ exp.company }}</p>
            <p v-if="exp.description" class="desc">{{ exp.description }}</p>
            <ul v-if="exp.achievements?.length" class="achievements">
              <li v-for="line in exp.achievements" :key="line">{{ line }}</li>
            </ul>
            <ul v-if="exp.technologies?.length" class="tech" aria-label="使用技術">
              <li v-for="tech in exp.technologies" :key="tech">{{ tech }}</li>
            </ul>
          </div>
        </li>
      </ol>

      <h3 v-if="education.length" v-reveal class="sub-title">
        <GraduationCap :size="20" />
        學歷與訓練
      </h3>
      <ul class="education">
        <li v-for="(edu, i) in education" :key="edu.id" v-reveal.left="i * 70">
          <p class="period">{{ period(edu.start_date, edu.end_date, edu.is_current) }}</p>
          <div>
            <strong>{{ edu.school }}</strong>
            <span>{{ edu.field_of_study }}・{{ edu.degree }}</span>
          </div>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { GraduationCap } from 'lucide-vue-next'
import type { Experience, Education } from '@/types/models'
import { getDatePeriod } from '@/utils/date'
import { vReveal } from '@/directives/reveal'

defineProps<{
  experiences: Experience[]
  education: Education[]
}>()

const period = (start: string, end: string | null, isCurrent: boolean) =>
  getDatePeriod(start, end, isCurrent, 'dot')
</script>

<style scoped>
.section {
  padding: var(--space-2xl) 0;
  scroll-margin-top: 64px;
}

.section-head {
  margin-bottom: var(--space-lg);
}

h2 {
  font-family: var(--font-display);
  font-size: var(--text-title);
  letter-spacing: 0.04em;
  color: var(--pearl);
  margin: 0;
}

.timeline {
  list-style: none;
  padding: 0;
  margin: 0;
}

.item {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--space-md);
  padding: var(--space-lg) 0;
}

.period {
  color: var(--volt);
  font-size: 0.95rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin: 4px 0 0;
}

.content h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--pearl);
  margin: 0 0 4px;
}

.company {
  color: var(--chrome);
  margin: 0 0 var(--space-sm);
}

.desc {
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 var(--space-sm);
}

.achievements {
  margin: 0 0 var(--space-sm);
  padding-left: 1.2em;
  color: var(--text-secondary);
  line-height: 1.7;
}

.tech {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech li {
  font-size: 0.8125rem;
  padding: 3px 8px;
  border-radius: var(--radius-xs);
  background: var(--noir-80);
  color: var(--text-light);
}

.sub-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.1rem;
  color: var(--pearl);
  margin: var(--space-xl) 0 var(--space-sm);
}

.education {
  list-style: none;
  padding: 0;
  margin: 0;
}

.education li {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
}

.education strong {
  display: block;
  color: var(--pearl);
}

.education span {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

@media (max-width: 640px) {
  .item,
  .education li {
    grid-template-columns: 1fr;
    gap: var(--space-xs);
  }
}
</style>
