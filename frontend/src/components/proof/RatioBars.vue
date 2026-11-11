<template>
  <!-- 前後對照條：兩條墨條的長度照實際數字的比例畫，不另外算百分比 -->
  <figure class="ratio-bars">
    <div class="row">
      <span class="lab">優化前</span>
      <span class="bar before" aria-hidden="true"></span>
      <b>{{ format(before) }} {{ unit }}</b>
    </div>
    <div class="row">
      <span class="lab">優化後</span>
      <span
        class="bar after"
        aria-hidden="true"
        :style="{ width: `${(after / before) * 100}%` }"
      ></span>
      <b>{{ format(after) }} {{ unit }}</b>
    </div>
    <figcaption>{{ label }}；條的長度照實際比例。</figcaption>
  </figure>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  before: number
  after: number
  unit: string
}>()

const format = (n: number) => n.toLocaleString('en-US')
</script>

<style scoped>
.ratio-bars {
  margin: 18px 0 0;
  padding: 14px 0 0;
  border-top: 1px solid var(--rule);
}

.row {
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 2px 12px;
}

.row + .row {
  margin-top: 10px;
}

.lab {
  font-family: var(--mono);
  font-size: var(--fs-small);
  letter-spacing: 0.1em;
  color: var(--ink-2);
}

.row b {
  justify-self: end;
  font-family: var(--latin);
  font-size: var(--fs-lead);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.bar {
  grid-column: 1 / -1;
  grid-row: 2;
  display: block;
  height: 18px;
}

/* 優化前：K 版滿版；優化後：專色，最細也留 3px 看得到 */
.before {
  width: 100%;
  background: var(--bk);
}

.after {
  min-width: 3px;
  background: var(--accent);
}

figcaption {
  margin-top: 10px;
  font-size: var(--fs-small);
  color: var(--ink-2);
}
</style>
