<template>
  <figure class="before-after">
    <div class="stage" :style="{ '--split': split }">
      <img :src="before" :alt="beforeLabel" class="layer" loading="lazy" />
      <img :src="after" :alt="afterLabel" class="layer after" loading="lazy" />
      <span class="divider" aria-hidden="true"></span>
      <span class="tag tag-before" aria-hidden="true">改版前</span>
      <span class="tag tag-after" aria-hidden="true">改版後</span>
      <input
        v-model.number="split"
        type="range"
        min="0"
        max="100"
        class="handle"
        aria-label="拖曳比較改版前後"
      />
    </div>
    <figcaption>{{ beforeLabel }} ／ {{ afterLabel }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  before: string
  after: string
  beforeLabel: string
  afterLabel: string
}>()

// 分界線位置（%）：左邊是改版前，右邊是改版後
const split = ref(50)
</script>

<style scoped>
.before-after {
  margin: 0;
}

.stage {
  /* 跟拉桿圓鈕中心同一個位置：圓鈕 36px，兩端各內縮半顆 */
  --x: calc(18px + (100% - 36px) * var(--split) / 100);
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 12px;
  overflow: hidden;
  background: var(--surface);
}

.layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top;
}

.after {
  clip-path: inset(0 0 0 var(--x));
}

.divider {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--x);
  width: 2px;
  translate: -1px 0;
  background: var(--volt);
  pointer-events: none;
}

.tag {
  position: absolute;
  top: 0.75rem;
  padding: 0.25rem 0.625rem;
  border-radius: 999px;
  background: rgba(8, 9, 10, 0.75);
  color: var(--pearl);
  font-size: 0.8125rem;
  pointer-events: none;
}

.tag-before {
  left: 0.75rem;
}

.tag-after {
  right: 0.75rem;
}

/* 整張圖都是拖曳區；拉桿本身透明，只留分界線上的圓鈕 */
.handle {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  appearance: none;
  background: transparent;
  cursor: ew-resize;
  touch-action: pan-y; /* 手機上下滑照樣捲頁面，左右滑才拉動分界線 */
}

.handle::-webkit-slider-thumb {
  appearance: none;
  box-sizing: border-box;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--volt);
  border: 3px solid var(--ink);
}

.handle::-moz-range-thumb {
  box-sizing: border-box;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--volt);
  border: 3px solid var(--ink);
}

.handle:focus-visible::-webkit-slider-thumb {
  outline: 2px solid var(--pearl);
  outline-offset: 2px;
}

figcaption {
  margin-top: 0.75rem;
  color: var(--text-muted);
  font-size: 0.875rem;
  text-align: center;
}
</style>
