<template>
  <!-- 打樣框：四角裁切線＋右上頁碼，每個區塊都用它包起來 -->
  <div class="proof-frame">
    <i class="crop c1" aria-hidden="true"></i>
    <i class="crop c2" aria-hidden="true"></i>
    <i class="crop c3" aria-hidden="true"></i>
    <i class="crop c4" aria-hidden="true"></i>
    <span v-if="folio" class="folio" aria-hidden="true">
      <b>{{ folio }}</b>
      {{ label }}
    </span>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  folio?: string // 例如「02 / 04」
  label?: string // 例如「打樣 · PROOF」
}>()
</script>

<style scoped>
.proof-frame {
  position: relative;
}

.crop {
  position: absolute;
  width: 18px;
  height: 18px;
  pointer-events: none;
  z-index: 2;
}

.crop::before,
.crop::after {
  content: '';
  position: absolute;
  background: var(--ink);
  transform-origin: left top;
}

.crop::before {
  width: 18px;
  height: 1px;
}

.crop::after {
  width: 1px;
  height: 18px;
}

.c1 {
  left: -26px;
  top: -22px;
}
.c1::before {
  left: 0;
  top: 18px;
}
.c1::after {
  left: 18px;
  top: 0;
}

.c2 {
  right: -26px;
  top: -22px;
}
.c2::before {
  right: 0;
  top: 18px;
}
.c2::after {
  right: 18px;
  top: 0;
}

.c3 {
  left: -26px;
  bottom: -22px;
}
.c3::before {
  left: 0;
  bottom: 18px;
}
.c3::after {
  left: 18px;
  bottom: 0;
}

.c4 {
  right: -26px;
  bottom: -22px;
}
.c4::before {
  right: 0;
  bottom: 18px;
}
.c4::after {
  right: 18px;
  bottom: 0;
}

.folio {
  position: absolute;
  right: 0;
  top: -22px;
  transform: translateY(-100%);
  font-family: var(--mono);
  font-size: var(--fs-mark);
  letter-spacing: 0.12em;
  color: var(--ink-2);
  white-space: nowrap;
}

.folio b {
  font-weight: 400;
  color: var(--ink);
  margin-right: 8px;
}

/* 開場：裁切線從角落畫出來 */
@media (prefers-reduced-motion: no-preference) {
  [data-intro='run'] .crop::before,
  [data-intro='run'] .crop::after {
    animation: proof-draw 0.45s var(--ease) both 0.05s;
  }
}

@keyframes proof-draw {
  from {
    transform: scale(0);
  }
  to {
    transform: scale(1);
  }
}

@media (max-width: 640px) {
  .crop {
    display: none;
  }
  .folio {
    right: auto;
    left: 0;
  }
}
</style>
