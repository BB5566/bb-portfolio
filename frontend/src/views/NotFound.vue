<template>
  <!-- 找不到頁面：跟首頁同一套印刷打樣風格，蓋一個「缺頁」章 -->
  <div class="proof-page">
    <ProofTopbar :resume-url="RESUME_URL" />
    <main id="main-content" class="missing">
      <div class="wrap">
        <p class="code" aria-hidden="true">404</p>
        <p class="stamp" aria-hidden="true">缺頁</p>
        <h1>找不到這一頁</h1>
        <p class="desc">可能已經移除，或網址打錯了。</p>
        <div class="links">
          <RouterLink to="/" class="btn primary">回到首頁</RouterLink>
          <button type="button" class="btn" @click="goBack">返回上頁</button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useSEO } from '@/composables/useSEO'
import ProofTopbar from '@/components/proof/ProofTopbar.vue'
import { RESUME_URL } from '@/components/proof/resume'

const router = useRouter()

// 伺服器已經回 404；這裡把標題與 robots 也換掉，不讓缺頁掛著首頁的標題被收錄
useSEO().setPageMeta({ title: '找不到這一頁 | Bob Tsou 作品集', noindex: true })

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<style src="@/components/proof/proof-page.css"></style>

<style scoped>
.missing {
  position: relative;
  z-index: 2;
  padding: 12vh 0 0;
  text-align: center;
}

.code {
  margin: 0;
  font-family: var(--latin);
  font-weight: 700;
  font-size: clamp(96px, 18vw, 180px);
  line-height: 1;
  letter-spacing: -0.04em;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--ink);
}

.stamp {
  display: inline-block;
  margin: -28px 0 22px;
  padding: 6px 14px;
  border: 2px solid #d7262d;
  border-radius: 6px;
  background: var(--paper);
  color: #d7262d;
  font-weight: 900;
  font-size: 18px;
  letter-spacing: 0.3em;
  rotate: -6deg;
}

h1 {
  margin: 0;
  font-size: var(--fs-h2);
  font-weight: 900;
}

.desc {
  margin: 10px 0 26px;
  color: var(--ink-2);
}

.links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.btn {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 18px;
  border: 1.5px solid var(--ink);
  border-radius: 12px;
  background: none;
  color: var(--ink);
  font: inherit;
  font-size: var(--fs-ui);
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
}

.btn.primary {
  background: var(--ink);
  color: var(--paper);
}
</style>
