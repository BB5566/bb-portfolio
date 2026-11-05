<template>
  <div ref="root" class="media">
    <img :src="src" :alt="alt" loading="lazy" width="640" height="360" />
    <!-- 有動態版的封面：捲到畫面內才載入影片，離開就暫停 -->
    <video
      v-if="video && visible"
      ref="player"
      :src="video"
      :poster="src"
      muted
      loop
      playsinline
      autoplay
      aria-hidden="true"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps<{ src: string; alt: string }>()

// /covers/xxx.webp 有對應的 /covers/motion/xxx.mp4
const MOTION_COVERS = [
  'ai-pipeline-v2',
  'local-ai-assistant-v2',
  'student-page-perf-v2',
  'security-tests-v2',
  'eat-at-fju',
  'portfolio-os'
]

const video = computed(() => {
  const name = props.src.match(/\/covers\/([\w-]+)\.webp$/)?.[1]
  return name && MOTION_COVERS.includes(name) ? `/covers/motion/${name}.mp4` : null
})

const root = ref<HTMLElement>()
const player = ref<HTMLVideoElement>()
const visible = ref(false)
let observer: IntersectionObserver | undefined

onMounted(() => {
  // 系統設定「減少動態效果」就只放靜態圖
  if (!video.value || matchMedia('(prefers-reduced-motion: reduce)').matches) return

  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry?.isIntersecting) {
        visible.value = true
        player.value?.play().catch(() => {})
      } else {
        player.value?.pause()
      }
    },
    { threshold: 0.4 }
  )
  if (root.value) observer.observe(root.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<style scoped>
.media {
  position: relative;
  width: 100%;
  height: 100%;
}

img,
video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
