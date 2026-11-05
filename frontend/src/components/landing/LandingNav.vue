<template>
  <header class="nav">
    <div class="container nav-inner">
      <a href="#top" class="brand" aria-label="回到頂端">
        <img src="/favicon.svg" alt="" width="28" height="28" />
        <span>BB MADE</span>
      </a>

      <nav class="links" aria-label="頁面區塊">
        <a v-for="link in links" :key="link.href" :href="link.href">{{ link.label }}</a>
      </nav>

      <div class="actions">
        <RouterLink to="/os" class="action os" title="開啟 Portfolio OS">
          <Monitor :size="18" />
          <span>Portfolio OS</span>
        </RouterLink>
      </div>

      <button class="menu-toggle" @click="isMenuOpen = !isMenuOpen" :aria-label="isMenuOpen ? '關閉選單' : '開啟選單'" :aria-expanded="isMenuOpen">
        <Menu v-if="!isMenuOpen" :size="24" />
        <X v-else :size="24" />
      </button>
    </div>

    <div v-if="isMenuOpen" class="mobile-menu">
      <a v-for="link in links" :key="link.href" :href="link.href" @click="isMenuOpen = false">{{ link.label }}</a>

      <RouterLink to="/os" class="action os" title="開啟 Portfolio OS" @click="isMenuOpen = false">
        <Monitor :size="18" />
        <span>Portfolio OS</span>
      </RouterLink>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import { Monitor, Menu, X } from 'lucide-vue-next'

defineProps<{
  resumeUrl: string
  githubUrl: string
}>()

const isMenuOpen = ref(false)

const links = [
  { href: '#works', label: '作品' },
  { href: '#experience', label: '經歷' },
  { href: '#skills', label: '技能' },
  { href: '#contact', label: '聯絡' }
]
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky, 100);
  background: rgba(8, 9, 10, 0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--noir-70);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  height: 64px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  font-family: var(--font-display);
  font-size: 1.25rem;
  letter-spacing: 0.12em;
  color: var(--pearl);
  text-decoration: none;
}

.brand img {
  border-radius: 6px;
}

.links {
  display: flex;
  gap: var(--space-md);
}

.links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s;
}

.links a:hover {
  color: var(--volt);
}

.actions {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

.action {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: var(--radius-full);
  border: 1px solid var(--noir-60);
  color: var(--text-secondary);
  font-size: 0.85rem;
  text-decoration: none;
  transition:
    border-color 0.2s,
    color 0.2s;
}

.action:hover {
  border-color: var(--volt);
  color: var(--volt);
}

.action.os {
  border-color: var(--volt);
  color: var(--volt);
}

.action.os:hover {
  background: var(--volt);
  color: var(--ink);
}

.menu-toggle {
  display: none;
}

.mobile-menu {
  display: none;
}

@media (max-width: 768px) {
  .links {
    display: none;
  }

  .actions {
    display: none;
  }

  .menu-toggle {
    display: block;
    background: none;
    border: none;
    color: var(--pearl);
    cursor: pointer;
  }

  .mobile-menu {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    background: rgba(8, 9, 10, 0.95);
    padding: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
    border-bottom: 1px solid var(--noir-70);
  }

  .mobile-menu a:not(.action) {
    color: var(--text-muted);
    text-decoration: none;
    font-size: 1.1rem;
    padding: 8px 0;
  }

  .mobile-menu a:not(.action):hover {
    color: var(--volt);
  }
}
</style>
