<template>
  <!-- 首頁：印刷打樣版。構想 → 打樣 → 實作 → 上線，四個區塊各是一頁打樣 -->
  <div class="proof-page">
    <ProofTopbar :resume-url="resumeUrl">
      <a class="hide-sm" href="#works">作品</a>
      <a class="hide-sm" href="#build">經歷</a>
      <a class="hide-sm" href="#ship">聯絡</a>
      <!-- 技術主管第一個找 repo；手機收進漢堡選單，桌機留在導覽列 -->
      <a class="hide-sm" :href="githubUrl" target="_blank" rel="noopener">GitHub ↗</a>
    </ProofTopbar>

    <main id="main-content">
      <ProofHero
        v-if="profile?.hero_proof"
        :name="profile.name"
        :copy="profile.hero_proof"
        :stats="stats"
        @quick="openSheet"
      />
      <!-- 個人資料還沒回來時先佔住第一屏 -->
      <div v-else-if="!profileStore.error" class="hero-placeholder" aria-busy="true"></div>
      <ProofWorks
        v-if="projectStore.publishedProjects.length"
        :projects="projectStore.publishedProjects"
      />
      <ProofBuild
        v-if="profile"
        :experiences="profileStore.experiences"
        :education="profileStore.education"
        :skills="profileStore.skillsByCategory"
      />
      <ProofShip
        v-if="profile"
        :email="profile.email"
        :location="profile.location"
        :github-url="githubUrl"
        :resume-url="resumeUrl"
      />
    </main>

    <nav v-if="profile?.hero_proof" class="dock" :class="{ early: !pastHero }" aria-label="工具列">
      <!-- 首屏已經有同一顆按鈕，捲過首屏才出現 -->
      <button v-if="pastHero" type="button" class="quick" @click="openSheet">60 秒看重點</button>
      <button
        type="button"
        class="qa-btn"
        :aria-expanded="qaOpen"
        aria-controls="proof-qa"
        @click="qaOpen = !qaOpen"
      >
        <PixelHeart class="qa-icon" />
        校對稿 Q&amp;A
      </button>
    </nav>

    <QaPanel :open="qaOpen" :email="profile?.email ?? null" @close="qaOpen = false" />

    <QuickSheet
      v-if="profile?.hero_proof"
      ref="sheet"
      :name="profile.name"
      :copy="profile.hero_proof"
      :stats="stats"
      :location="profile.location"
      :email="profile.email"
      :resume-url="resumeUrl"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, useTemplateRef, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { log } from '@/utils/logger'
import { useSEO } from '@/composables/useSEO'
import { useGtag } from '@/plugins/gtag'
import { useProfileStore } from '@/stores/profile'
import { useProjectStore } from '@/stores/projects'
import ProofHero from '@/components/proof/ProofHero.vue'
import ProofWorks from '@/components/proof/ProofWorks.vue'
import ProofBuild from '@/components/proof/ProofBuild.vue'
import ProofShip from '@/components/proof/ProofShip.vue'
import QaPanel from '@/components/proof/QaPanel.vue'
import QuickSheet from '@/components/proof/QuickSheet.vue'
import ProofTopbar from '@/components/proof/ProofTopbar.vue'
import PixelHeart from '@/components/proof/PixelHeart.vue'
import { RESUME_URL } from '@/components/proof/resume'

const profileStore = useProfileStore()
const projectStore = useProjectStore()
const profile = computed(() => profileStore.profile)
const stats = computed(() => profile.value?.highlights ?? [])
const resumeUrl = computed(() => profile.value?.resume_url || RESUME_URL)
const githubUrl = computed(() => profile.value?.github || 'https://github.com/BB5566')

// 底部工具列的「60 秒看重點」：捲過大半個首屏才出現
const pastHero = ref(false)
const onScroll = () => {
  pastHero.value = window.scrollY > window.innerHeight * 0.6
}
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const sheet = useTemplateRef<InstanceType<typeof QuickSheet>>('sheet')
const { trackEvent } = useGtag()
const openSheet = () => {
  trackEvent('open_quick_sheet')
  sheet.value?.open()
}
const qaOpen = ref(false)

// 給招募者的連結 ?for=recruiter：一進來就打開「60 秒看重點」
const route = useRoute()
watch(sheet, (s) => {
  if (s && route.query.for === 'recruiter') s.open()
})

// SEO：meta 與 JSON-LD 依 profile 載入結果設定
const { setPageMeta, generateWebsiteSchema, generatePersonSchema } = useSEO()

watch(
  profile,
  (p) => {
    if (!p) return
    setPageMeta({
      title: `${p.name || 'Bob Tsou'} | 前端工程師・地端 AI 內容產線負責人 作品集`,
      description: p.meta_description || p.bio || undefined,
      type: 'website'
    })
  },
  { immediate: true }
)

useHead(() => {
  if (!profile.value) return {}
  const schemas = [generateWebsiteSchema(), generatePersonSchema(profile.value)]
  return {
    script: schemas.map((s) => ({ type: 'application/ld+json', innerHTML: JSON.stringify(s) }))
  }
})

onMounted(async () => {
  try {
    await Promise.all([profileStore.fetchAllProfileData(), projectStore.fetchProjects()])
  } catch (error) {
    log.error('Failed to fetch initial data:', error)
  }
})
</script>

<!-- 紙色、墨色、版心：首頁、作品頁、找不到頁面共用 -->
<style src="@/components/proof/proof-page.css"></style>

<style>
/* 大標的中文襯線粗體：只收大標用到的字（scripts/subset-claim-font.py 產生），只有這頁載入 */
@font-face {
  font-family: 'Noto Serif TC Claim';
  font-style: normal;
  font-weight: 900;
  font-display: swap;
  src: url('@/assets/fonts/noto-serif-tc-claim-900.woff2') format('woff2');
}

/* 套色錯位量要註冊成數字，才能用 transition 慢慢對準 */
@property --mis {
  syntax: '<number>';
  inherits: true;
  initial-value: 0;
}
</style>

<style scoped>
.hero-placeholder {
  min-height: calc(100svh - 80px);
}

.dock {
  position: fixed;
  left: 50%;
  bottom: 14px;
  z-index: 60;
  transform: translateX(-50%);
  display: flex;
  gap: 6px;
  align-items: center;
  max-width: calc(100% - 16px);
  padding: 5px;
  border-radius: 999px;
  background: rgba(21, 22, 26, 0.92);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
}

.dock .qa-btn {
  background: rgba(255, 255, 255, 0.1);
}

.dock .qa-icon {
  --heart: #ff8a8e;
  margin-right: 6px;
}

/* 手機／平板首屏下緣是頭像，工具列捲過首屏才出現，免得蓋住 */
.dock {
  transition:
    opacity 0.25s ease,
    visibility 0.25s;
}

@media (max-width: 900px) {
  .dock.early {
    opacity: 0;
    visibility: hidden;
  }
}

/* 桌機放右下角，才不會蓋住首屏的數字 */
@media (min-width: 901px) {
  .dock {
    left: auto;
    right: 20px;
    transform: none;
  }
}

.dock button {
  min-height: 42px;
  padding: 0 16px;
  border: 0;
  border-radius: 999px;
  background: var(--accent-ink);
  color: #fff;
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
}
</style>
