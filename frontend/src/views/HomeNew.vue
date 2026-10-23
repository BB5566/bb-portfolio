<template>
  <main class="main-stage" id="main-content">
    <DesktopShell />
  </main>
</template>

<script setup lang="ts">
import { log } from '@/utils/logger'
import { onMounted, watch } from 'vue'
import { useHead } from '@unhead/vue'
import DesktopShell from '@/components/desktop/DesktopShell.vue'
import { useProjectStore } from '@/stores/projects'
import { useProfileStore } from '@/stores/profile'
import { useSEO } from '@/composables/useSEO'

const projectStore = useProjectStore()
const profileStore = useProfileStore()

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

// SEO：動態設定 meta，依賴 profile 載入結果
const { setPageMeta, generateWebsiteSchema, generatePersonSchema } = useSEO()

watch(
  () => profileStore.profile,
  (profile) => {
    if (!profile) return

    setPageMeta({
      title: `${profile.display_name || profile.name || 'Bob Tsou'} | AI 應用工程師作品集`,
      description:
        profile.bio ||
        `${profile.name || 'Bob Tsou'} 的AI 應用工程師作品集，結合電商、前端與 AI 應用，打造可驗證的 AI 工具與高品質介面`,
      type: 'website'
    })
  },
  { immediate: true }
)

useHead(() => {
  if (!profileStore.profile) return {}

  const schemas = [generateWebsiteSchema(), generatePersonSchema(profileStore.profile)]

  return {
    script: schemas.map((s) => ({
      type: 'application/ld+json',
      innerHTML: JSON.stringify(s)
    }))
  }
})
</script>

<style scoped>
.main-stage {
  position: fixed;
  inset: 0;
  overflow: hidden;
  background: var(--ink);
}
</style>
