<template>
  <section id="skills" class="section">
    <div class="container">
      <header class="section-head">
        <h2 v-reveal>技能</h2>
      </header>

      <div class="groups">
        <div v-for="(items, name, i) in skills" :key="name" v-reveal.settle="(i % 2) * 90" class="group">
          <h3>{{ name }}</h3>
          <ul>
            <li v-for="skill in items" :key="skill">{{ skill }}</li>
          </ul>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { vReveal } from '@/directives/reveal'
defineProps<{
  skills: Record<string, string[]>
}>()
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

.groups {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
}

.group {
  padding: var(--space-md);
  border-radius: var(--radius-lg);
  background: var(--surface);
}

.group h3 {
  font-size: 1rem;
  color: var(--volt);
  margin: 0 0 var(--space-sm);
}

.group ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.group li {
  font-size: 0.9rem;
  padding: 6px 12px;
  border-radius: var(--radius-full);
  background: var(--noir-80);
  color: var(--text-secondary);
}

@media (max-width: 640px) {
  .groups {
    grid-template-columns: 1fr;
  }
}
</style>
