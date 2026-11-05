<template>
  <div class="global-background">
    <div class="vignette-layer"></div>
  </div>
</template>

<script setup lang="ts">
// GlobalBackground 現在只留四周壓暗（11-03 拿掉 3% 的金色光暈）
// 粒子效果統一由 SpiceEffects.vue (tsparticles) 處理
</script>

<style scoped>
.global-background {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

/* Vignette Effect */
.vignette-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(16, 12, 10, 0.4) 100%);
}
</style>
