<template>
  <header class="top">
    <div class="wrap row">
      <RouterLink class="brand" to="/" aria-label="BOB TSOU 首頁">
        <!-- 跟頁尾同一個字標；名字在首屏 who 那行與 aria-label -->
        <ProofWordmark class="mark" :mis="10" />
      </RouterLink>
      <nav class="nav" aria-label="主選單">
        <span class="links"><slot /></span>
        <a class="pill" :href="resumeUrl" target="_blank" rel="noopener">履歷 PDF</a>
        <button
          type="button"
          class="menu-toggle"
          :aria-expanded="menuOpen"
          aria-controls="proof-mobile-menu"
          :aria-label="menuOpen ? '關閉選單' : '開啟選單'"
          @click="menuOpen = !menuOpen"
        >
          <span class="bars" aria-hidden="true"></span>
        </button>
      </nav>
    </div>
    <div v-show="menuOpen" id="proof-mobile-menu" class="mobile-menu" @click="menuOpen = false">
      <nav class="wrap mobile-links" aria-label="手機主選單">
        <slot />
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProofWordmark from './ProofWordmark.vue'

defineProps<{ resumeUrl: string }>()

const menuOpen = ref(false)
</script>

<style scoped>
.top {
  position: relative;
  z-index: 3;
  padding: 20px 0;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand {
  display: flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
}

/* 字標縮到導覽列高度；錯位給 10，畫面上約 1px */
.mark {
  width: 132px;
}

.nav {
  display: flex;
  gap: 26px;
  align-items: center;
  font-size: var(--fs-ui);
  font-weight: 500;
}

.links {
  display: flex;
  gap: 26px;
  align-items: center;
}

/* 選單連結從外面用 slot 傳進來，所以要用 :slotted */
.nav :slotted(a),
.nav .pill {
  color: inherit;
  text-decoration: none;
  white-space: nowrap;
}

.menu-toggle {
  display: none;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
}

.bars,
.bars::before,
.bars::after {
  display: block;
  width: 20px;
  height: 2px;
  background: currentColor;
}

.bars {
  position: relative;
}

.bars::before,
.bars::after {
  content: '';
  position: absolute;
  left: 0;
}

.bars::before {
  top: -6px;
}

.bars::after {
  top: 6px;
}

.mobile-menu {
  display: none;
}

@media (max-width: 640px) {
  .nav :slotted(a.hide-sm) {
    display: none;
  }

  .menu-toggle {
    display: inline-flex;
  }

  .mobile-menu {
    display: block;
    position: absolute;
    left: 0;
    right: 0;
    top: 100%;
    background: var(--paper);
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
    box-shadow: 0 16px 24px rgba(0, 0, 0, 0.08);
  }

  .mobile-links {
    display: flex;
    flex-direction: column;
    font-size: var(--fs-body);
    font-weight: 600;
  }

  .mobile-links :slotted(a) {
    padding: 14px 0;
    border-bottom: 1px solid var(--rule);
    color: inherit;
    text-decoration: none;
  }

  .mobile-links :slotted(a:last-child) {
    border-bottom: 0;
  }
}

/* 360px 小手機：品牌＋履歷＋選單擠不下，收一點間距 */
@media (max-width: 400px) {
  .mark {
    width: 112px;
  }

  .nav {
    gap: 12px;
  }

  .links {
    gap: 16px;
  }
}

.nav .pill {
  border: 1.5px solid currentColor;
  border-radius: 999px;
  padding: 7px 16px;
  font-weight: 700;
}
</style>
