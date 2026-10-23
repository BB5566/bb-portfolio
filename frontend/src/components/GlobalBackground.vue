<template>
  <div class="global-background">
    <!-- Atmospheric gradient overlays -->
    <div class="atmosphere-layer"></div>
    <div class="vignette-layer"></div>
  </div>
</template>

<script setup lang="ts">
// GlobalBackground 現在只負責大氣層效果
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

/* Atmospheric Layer - Warm Desert Glow */
.atmosphere-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 80% 50% at 50% 100%,
    rgba(225, 193, 110, 0.03) 0%,
    transparent 70%
  );
}

/* Vignette Effect */
.vignette-layer {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(16, 12, 10, 0.4) 100%);
}
</style>
