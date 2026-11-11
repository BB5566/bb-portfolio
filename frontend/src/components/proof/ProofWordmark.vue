<template>
  <!-- BB-MADE 字標：青、洋紅兩版微錯位疊在黑版下，跟首屏標題同一套套印手法。
       textLength 讓字永遠剛好撐滿寬度 -->
  <svg class="wordmark" viewBox="0 0 1000 170" aria-hidden="true">
    <text
      v-for="plate in PLATES"
      :key="plate.name"
      :class="plate.name"
      :transform="`translate(${plate.dx * mis} ${plate.dy * mis})`"
      x="0"
      y="150"
      textLength="1000"
      lengthAdjust="spacingAndGlyphs"
    >
      BB-MADE
    </text>
  </svg>
</template>

<script setup lang="ts">
// mis：錯位量，單位是 viewBox 座標（寬 1000）。字標顯示得越小，要給越大才看得到
withDefaults(defineProps<{ mis?: number }>(), { mis: 4 })

const PLATES = [
  { name: 'c', dx: -1, dy: 0.5 },
  { name: 'm', dx: 0.75, dy: -0.5 },
  { name: 'k', dx: 0, dy: 0 }
] as const
</script>

<style scoped>
.wordmark {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;
}

.wordmark text {
  font-family: var(--latin);
  font-weight: 700;
  font-size: 200px;
}

.c {
  fill: var(--cy);
  mix-blend-mode: multiply;
}

.m {
  fill: var(--mg);
  mix-blend-mode: multiply;
}

.k {
  fill: var(--ink);
}
</style>
