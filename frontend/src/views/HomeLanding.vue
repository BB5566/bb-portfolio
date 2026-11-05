<template>
  <div class="landing" id="main-content">
    <LandingNav :resume-url="resumeUrl" :github-url="githubUrl" />

    <main>
      <HeroSection
        v-if="profileStore.profile"
        :profile="profileStore.profile"
        :resume-url="resumeUrl"
        :github-url="githubUrl"
      />
      <!-- 個人資料還沒回來時先佔住第一屏，作品區才不會先跑到最上面、等 Hero 到了再被推下去 -->
      <div v-else-if="!profileStore.error" class="hero-placeholder" aria-busy="true"></div>
      <WorksSection
        :projects="projectStore.publishedProjects"
        :categories="projectStore.categories"
      />
      <ExperienceSection
        :experiences="profileStore.experiences"
        :education="profileStore.education"
      />
      <SkillsSection :skills="profileStore.skillsByCategory" />
      <ContactSection
        :email="profileStore.profile?.email ?? null"
        :github-url="githubUrl"
        :resume-url="resumeUrl"
      />
    </main>

    <LandingFooter />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useHead } from '@unhead/vue'
import { log } from '@/utils/logger'
import { useProjectStore } from '@/stores/projects'
import { useProfileStore } from '@/stores/profile'
import { useSEO } from '@/composables/useSEO'
import LandingNav from '@/components/landing/LandingNav.vue'
import HeroSection from '@/components/landing/HeroSection.vue'
import WorksSection from '@/components/landing/WorksSection.vue'
import ExperienceSection from '@/components/landing/ExperienceSection.vue'
import SkillsSection from '@/components/landing/SkillsSection.vue'
import ContactSection from '@/components/landing/ContactSection.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'

const projectStore = useProjectStore()
const profileStore = useProfileStore()

const resumeUrl = computed(() => profileStore.profile?.resume_url || '/resume.pdf?v=20261105f')
const githubUrl = computed(() => profileStore.profile?.github || 'https://github.com/BB5566')

onMounted(async () => {
  try {
    await Promise.all([
      projectStore.fetchProjects(),
      projectStore.fetchCategories(),
      profileStore.fetchAllProfileData()
    ])
  } catch (error) {
    log.error('Failed to fetch initial data:', error)
  }
})

// SEO：meta 與 JSON-LD 依 profile 載入結果設定
const { setPageMeta, generateWebsiteSchema, generatePersonSchema } = useSEO()

watch(
  () => profileStore.profile,
  (profile) => {
    if (!profile) return
    setPageMeta({
      title: `${profile.name || 'Bob Tsou'} | 前端工程師・地端 AI 內容產線負責人 作品集`,
      description: profile.meta_description || profile.bio || undefined,
      type: 'website'
    })
  },
  { immediate: true }
)

useHead(() => {
  if (!profileStore.profile) return {}
  const schemas = [generateWebsiteSchema(), generatePersonSchema(profileStore.profile)]
  return {
    script: schemas.map((s) => ({ type: 'application/ld+json', innerHTML: JSON.stringify(s) }))
  }
})
</script>

<style>
/* 共用容器：給 landing 底下所有區塊用，所以不加 scoped */
.landing .container {
  width: 100%;
  max-width: 1120px;
  margin: 0 auto;
  padding: 0 16px;
}
</style>

<style scoped>
.landing {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  background: var(--ink);
  color: var(--pearl);
  font-family: var(--font-body);
}

.hero-placeholder {
  min-height: calc(100svh - 64px);
}
</style>
