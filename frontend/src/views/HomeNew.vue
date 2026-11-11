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

const SITE_URL = import.meta.env.VITE_APP_URL || 'https://bb-made.com'
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

    // /os 是彩蛋頁，有自己的標題與 canonical，不跟首頁搶
    setPageMeta({
      title: `Portfolio OS | ${profile.name || 'Bob Tsou'} 作品集`,
      description: profile.meta_description || profile.bio || undefined,
      url: `${SITE_URL}/os`,
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
