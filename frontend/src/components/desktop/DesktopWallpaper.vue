<template>
  <div class="wallpaper" aria-hidden="true">
    <div class="wallpaper__nebula wallpaper__nebula--a" />
    <div class="wallpaper__nebula wallpaper__nebula--b" />
    <div class="wallpaper__grid" />
    <vue-particles id="desktop-dust" class="wallpaper__particles" :options="dustOptions" />
    <div class="wallpaper__vignette" />
  </div>
</template>

<script setup lang="ts">
import type { ISourceOptions } from '@tsparticles/engine'

// 星塵：緩慢漂浮的金砂粒子，取代原本 hero 的沙塵層
const dustOptions: ISourceOptions = {
  fullScreen: { enable: false },
  fpsLimit: 60,
  particles: {
    number: { value: 90, density: { enable: true, width: 1920, height: 1080 } },
    color: { value: ['#8a8f98', '#d0d6e0', '#f7f8f8', '#7170ff'] },
    shape: { type: 'circle' },
    opacity: {
      value: { min: 0.08, max: 0.45 },
      animation: { enable: true, speed: 0.5, startValue: 'random', destroy: 'none' }
    },
    size: { value: { min: 0.4, max: 1.6 } },
    move: {
      enable: true,
      direction: 'top',
      speed: { min: 0.08, max: 0.35 },
      straight: false,
      outModes: { default: 'out' },
      random: true
    },
    wobble: { enable: true, distance: 8, speed: { min: 0.5, max: 2 } }
  },
  responsive: [{ maxWidth: 768, options: { particles: { number: { value: 45 } } } }],
  detectRetina: true
}
</script>

<style scoped>
.wallpaper {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background:
    radial-gradient(ellipse 120% 80% at 50% 110%, rgba(94, 106, 210, 0.08), transparent 60%),
    linear-gradient(170deg, #08090a 0%, #0b0c0d 45%, #0f1011 100%);
}

.wallpaper__nebula {
  position: absolute;
  border-radius: 50%;
  filter: blur(90px);
  will-change: transform;
}

.wallpaper__nebula--a {
  top: -18%;
  left: -8%;
  width: 55vw;
  height: 55vw;
  background: radial-gradient(circle, rgba(94, 106, 210, 0.14), transparent 65%);
  animation: nebula-drift-a 34s ease-in-out infinite alternate;
}

.wallpaper__nebula--b {
  bottom: -22%;
  right: -12%;
  width: 62vw;
  height: 62vw;
  background: radial-gradient(circle, rgba(16, 185, 129, 0.07), transparent 65%);
  animation: nebula-drift-b 42s ease-in-out infinite alternate;
}

/* 極淡的網格，強化「桌面」感 */
.wallpaper__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, #000 20%, transparent 80%);
}

.wallpaper__particles {
  position: absolute !important;
  inset: 0;
}

.wallpaper__vignette {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 45%, rgba(4, 5, 6, 0.7) 100%);
}

@keyframes nebula-drift-a {
  from {
    transform: translate3d(0, 0, 0) scale(1);
  }
  to {
    transform: translate3d(8vw, 6vh, 0) scale(1.12);
  }
}

@keyframes nebula-drift-b {
  from {
    transform: translate3d(0, 0, 0) scale(1.08);
  }
  to {
    transform: translate3d(-7vw, -5vh, 0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .wallpaper__nebula {
    animation: none;
  }
}
</style>
