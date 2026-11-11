<template>
  <!-- 像素愛心對話框：沿用 BB 舊標誌裡 D 字中間的記號，跟像素頭像同一套語言 -->
  <svg
    class="pixel-heart"
    viewBox="0 0 13 12"
    width="13"
    height="12"
    shape-rendering="crispEdges"
    aria-hidden="true"
  >
    <rect
      v-for="([x, y], i) in BUBBLE"
      :key="`b${i}`"
      :x="x"
      :y="y"
      width="1"
      height="1"
      fill="currentColor"
    />
    <rect
      v-for="([x, y], i) in HEART"
      :key="`h${i}`"
      :x="x"
      :y="y"
      width="1"
      height="1"
      class="heart"
    />
  </svg>
</template>

<script setup lang="ts">
// 一格一像素：X 是有顏色的格子
const toCells = (rows: string[], dx = 0, dy = 0) =>
  rows.flatMap((row, y) => [...row].flatMap((c, x) => (c === 'X' ? [[x + dx, y + dy]] : [])))

const BUBBLE = toCells([
  '.XXXXXXXXXXX.',
  'X...........X',
  'X...........X',
  'X...........X',
  'X...........X',
  'X...........X',
  'X...........X',
  'X...........X',
  'X...........X',
  '.XXXXXXXXXXX.',
  '..XX.........',
  '..X..........'
])

const HEART = toCells(['.XX.XX.', 'XXXXXXX', 'XXXXXXX', '.XXXXX.', '..XXX..', '...X...'], 3, 2)
</script>

<style scoped>
.pixel-heart {
  display: inline-block;
  width: 1.15em;
  height: auto;
  vertical-align: -0.15em;
}

.heart {
  fill: var(--heart, #d7262d);
}
</style>
