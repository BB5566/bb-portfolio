<template>
  <div class="custom-cursor" :class="{ hidden: isHidden }">
    <div class="cursor-dot" ref="cursorDot"></div>
    <div class="cursor-ring" ref="cursorRing" :class="cursorState">
      <span v-if="cursorState === 'code'" class="cursor-text">&lt;/&gt;</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import gsap from 'gsap'

const cursorDot = ref<HTMLElement | null>(null)
const cursorRing = ref<HTMLElement | null>(null)
const isHidden = ref(false)
const cursorState = ref<'default' | 'hover' | 'text' | 'code'>('default')

let mouseX = 0
let mouseY = 0
let ringX = 0
let ringY = 0
let rafId: number | null = null
let ctx: gsap.Context | null = null

const onMouseMove = (e: MouseEvent) => {
  mouseX = e.clientX
  mouseY = e.clientY

  if (cursorDot.value) {
    gsap.set(cursorDot.value, { x: mouseX, y: mouseY })
  }
}

const onMouseDown = () => {
  if (cursorRing.value) {
    gsap.to(cursorRing.value, { scale: 0.8, duration: 0.1 })
  }
}

const onMouseUp = () => {
  if (cursorRing.value) {
    gsap.to(cursorRing.value, { scale: 1, duration: 0.1 })
  }
}

const onMouseEnter = () => {
  isHidden.value = false
}
const onMouseLeave = () => {
  isHidden.value = true
}

let magneticX = 0
let magneticY = 0
let isMagnetic = false

const updateCursorState = (e: MouseEvent) => {
  const target = e.target as HTMLElement

  // Check for interactive elements
  const isLink = target.closest('a, button, .action-btn, .dock-item, .bento-card')
  const isText = target.closest('p, h1, h2, h3, h4, span, input, textarea')
  const isCode = target.closest('.code-keyword, .code-var, .code-string, .terminal-content')

  if (isCode) {
    cursorState.value = 'code'
    isMagnetic = false
  } else if (isLink) {
    cursorState.value = 'hover'

    // Magnetic Logic
    const rect = (isLink as HTMLElement).getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    // Only magnetize if close enough to center (optional, but keeps it subtle)
    magneticX = centerX
    magneticY = centerY
    isMagnetic = true
  } else if (isText) {
    cursorState.value = 'text'
    isMagnetic = false
  } else {
    cursorState.value = 'default'
    isMagnetic = false
  }
}

const renderLoop = () => {
  // Smooth follow for the ring
  let targetX = mouseX
  let targetY = mouseY

  if (isMagnetic) {
    // Pull towards magnetic center but keep some mouse influence
    targetX = mouseX + (magneticX - mouseX) * 0.3
    targetY = mouseY + (magneticY - mouseY) * 0.3
  }

  ringX += (targetX - ringX) * 0.15
  ringY += (targetY - ringY) * 0.15

  if (cursorRing.value) {
    gsap.set(cursorRing.value, { x: ringX, y: ringY })
  }

  rafId = requestAnimationFrame(renderLoop)
}

onMounted(() => {
  ctx = gsap.context(() => {
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mouseup', onMouseUp)
    // mouseenter/mouseleave 不會冒泡，需掛在 documentElement(<html>) 才能可靠偵測滑鼠進出視窗
    document.documentElement.addEventListener('mouseenter', onMouseEnter)
    document.documentElement.addEventListener('mouseleave', onMouseLeave)
    document.addEventListener('mouseover', updateCursorState)

    rafId = requestAnimationFrame(renderLoop)
  })
})

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  ctx?.revert()

  document.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mousedown', onMouseDown)
  document.removeEventListener('mouseup', onMouseUp)
  document.documentElement.removeEventListener('mouseenter', onMouseEnter)
  document.documentElement.removeEventListener('mouseleave', onMouseLeave)
  document.removeEventListener('mouseover', updateCursorState)
})
</script>

<style scoped>
.custom-cursor {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  pointer-events: none;
  z-index: 2147483647; /* Max z-index */
}

.hidden {
  opacity: 0;
}

/* Dune-style diamond cursor */
.cursor-dot {
  position: absolute;
  width: 12px;
  height: 12px;
  background-color: transparent;
  border: 2px solid var(--volt);
  transform: translate(-50%, -50%) rotate(45deg);
  z-index: 2;
  box-shadow:
    0 0 15px var(--volt),
    inset 0 0 8px rgba(225, 193, 110, 0.3);
  will-change: transform;
  transition:
    background-color 0.2s,
    border-color 0.2s;
}

.cursor-ring {
  position: absolute;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(225, 193, 110, 0.4);
  border-radius: 0;
  transform: translate(-50%, -50%) rotate(45deg);
  /* 排除 transform，避免與 GSAP 的 x/y lerp 疊加成雙重平滑 */
  transition:
    width 0.3s cubic-bezier(0.19, 1, 0.22, 1),
    height 0.3s cubic-bezier(0.19, 1, 0.22, 1),
    background-color 0.3s cubic-bezier(0.19, 1, 0.22, 1),
    border-color 0.3s cubic-bezier(0.19, 1, 0.22, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  box-shadow: 0 0 10px rgba(225, 193, 110, 0.1);
  will-change: transform, width, height;
}

/* States */
.cursor-ring.hover {
  width: 60px;
  height: 60px;
  background-color: rgba(0, 164, 204, 0.1);
  border-color: var(--ibad-blue);
  box-shadow: 0 0 20px rgba(0, 164, 204, 0.3);
}

.cursor-ring.text {
  width: 4px;
  height: 24px;
  border-radius: 2px;
  background-color: var(--volt);
  border: none;
}

.cursor-ring.code {
  width: 50px;
  height: 50px;
  background-color: var(--volt);
  border: none;
  color: var(--ink);
}

.cursor-text {
  font-family: var(--font-mono);
  font-weight: bold;
  font-size: 0.8rem;
}

@media (hover: none) {
  .custom-cursor {
    display: none;
  }
}
</style>
