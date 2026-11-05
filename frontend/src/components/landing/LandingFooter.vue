<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="brand">
        <img src="/favicon.svg" alt="" width="24" height="24" />
        <span>© {{ year }} Bob Tsou・bb-made.com</span>
      </div>
      <RouterLink to="/os" class="os-link">
        <Monitor :size="16" />
        開啟 Portfolio OS
      </RouterLink>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Monitor } from 'lucide-vue-next'

const year = new Date().getFullYear()
</script>

<style scoped>
.footer {
  padding: var(--space-lg) 0;
  background: var(--surface); /* 用底色跟內容分開，不畫細線 */
}

.footer-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  flex-wrap: wrap;
  color: var(--text-muted);
  font-size: 0.9rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
}

.brand img {
  border-radius: 5px;
}

.os-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--text-muted);
  text-decoration: none;
}

.os-link:hover {
  color: var(--volt);
}
</style>
