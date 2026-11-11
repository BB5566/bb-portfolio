<template>
  <!-- 優化前後拖曳比較：拉桿往右，露出更多「優化前」；條的長度照實際大小比例 -->
  <div class="size-compare" :style="{ '--x': `${position}%`, '--after': `${afterRatio}%` }">
    <div class="box">
      <div class="lab">
        <span>優化前</span>
        <span>拖曳比較 · 優化後</span>
      </div>
      <input
        v-model.number="position"
        type="range"
        min="0"
        max="100"
        :aria-label="`拖曳比較${label}：優化前 ${before} ${unit}、優化後 ${after} ${unit}`"
      />
      <div class="track" aria-hidden="true">
        <div class="before">
          <span>{{ before }} {{ unit }}</span>
        </div>
        <div class="after">
          <i></i>
          <span>{{ after }} {{ unit }}（−{{ saved }}%）</span>
        </div>
        <div class="handle"></div>
      </div>
      <p class="cap">{{ label }} {{ before }}→{{ after }} {{ unit }}。</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const props = defineProps<{
  label: string
  before: number
  after: number
  unit: string
}>()

const position = ref(50)
const afterRatio = computed(() => Math.round((props.after / props.before) * 100))
const saved = computed(() => 100 - afterRatio.value)
</script>

<style scoped>
.size-compare {
  margin-top: auto;
  padding-top: 14px;
}

.box {
  position: relative;
  padding: 12px 12px 10px;
  border: 1px solid var(--rule);
  border-radius: 10px;
  background: var(--paper);
}

.lab {
  display: flex;
  justify-content: space-between;
  font-family: var(--mono);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--ink-2);
}

.track {
  position: relative;
  height: 36px;
  margin-top: 8px;
  border-radius: 6px;
  overflow: hidden;
  background: #fff;
}

.before,
.after {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 8px;
  font-family: var(--latin);
  font-weight: 700;
  font-size: var(--fs-small);
}

.before {
  background: #c4bdad;
  color: var(--ink);
}

/* 拉桿右邊是優化後：白底上只剩一小段橘色，長度＝優化後／優化前 */
.after {
  clip-path: inset(0 0 0 var(--x));
  background: #fff;
}

.after i {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--after);
  background: var(--accent);
}

.after span {
  position: relative;
  margin-left: auto;
  color: var(--ink);
}

.handle {
  position: absolute;
  top: 0;
  bottom: 0;
  left: var(--x);
  width: 2px;
  background: var(--ink);
  transform: translateX(-50%);
  pointer-events: none;
}

.handle::after {
  content: '⇔';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--ink);
  color: #fff;
  font-size: var(--fs-small);
}

/* 真正的拉桿是透明的，疊在條上面接手指和鍵盤 */
input {
  position: absolute;
  left: 12px;
  right: 12px;
  top: 28px;
  z-index: 2;
  width: calc(100% - 24px);
  height: 44px;
  margin: 0;
  opacity: 0;
  cursor: ew-resize;
}

.box:has(input:focus-visible) .track {
  outline: 2px solid #d7262d;
  outline-offset: 2px;
}

.cap {
  margin: 8px 0 0;
  font-size: var(--fs-small);
  line-height: 1.5;
  color: var(--ink-2);
}
</style>
