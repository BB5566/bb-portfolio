<template>
  <button
    ref="rootRef"
    type="button"
    class="avatar"
    :class="`avatar--${state}`"
    aria-label="開啟 Chat"
    @click="$emit('activate')"
  >
    <canvas ref="canvasRef" class="avatar__canvas" />
    <span class="avatar__label">{{ state === 'thinking' ? 'THINKING…' : 'ONLINE' }}</span>
  </button>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import * as THREE from 'three'

defineEmits<{ activate: [] }>()

const SIZE = 190
/** 金色 (--volt) 與冰藍 (--ibad-blue)，對齊既有設計語言 */
const GOLD = 0xe1c16e
const CYAN = 0x00a4cc

const rootRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const state = ref<'idle' | 'thinking'>('idle')

let renderer: THREE.WebGLRenderer | null = null
let scene: THREE.Scene | null = null
let camera: THREE.PerspectiveCamera | null = null
let frameId: number | null = null
const disposables: Array<{ dispose: () => void }> = []

// 滑鼠位置（正規化到 -1..1），讓 avatar 微微看向游標
const pointer = { x: 0, y: 0 }
const onPointerMove = (e: PointerEvent) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1
  pointer.y = (e.clientY / window.innerHeight) * 2 - 1
}

const onAvatarState = (e: Event) => {
  const detail = (e as CustomEvent).detail
  state.value = detail === 'thinking' ? 'thinking' : 'idle'
}

/** 用原生幾何體組出全息投影感的頭像，不依賴任何外部模型檔 */
function build() {
  const canvas = canvasRef.value
  if (!canvas) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true })
  renderer.setSize(SIZE, SIZE, false)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

  const group = new THREE.Group()
  scene.add(group)

  // 外層線框
  const shellGeo = new THREE.IcosahedronGeometry(1.5, 1)
  const shellMat = new THREE.MeshBasicMaterial({
    color: GOLD,
    wireframe: true,
    transparent: true,
    opacity: 0.55
  })
  const shell = new THREE.Mesh(shellGeo, shellMat)
  group.add(shell)
  disposables.push(shellGeo, shellMat)

  // 內核
  const coreGeo = new THREE.IcosahedronGeometry(0.85, 0)
  const coreMat = new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0.16 })
  const core = new THREE.Mesh(coreGeo, coreMat)
  group.add(core)
  disposables.push(coreGeo, coreMat)

  // 傾斜軌道環
  const ringGeo = new THREE.TorusGeometry(2.05, 0.012, 8, 90)
  const ringMat = new THREE.MeshBasicMaterial({ color: CYAN, transparent: true, opacity: 0.7 })
  const ring = new THREE.Mesh(ringGeo, ringMat)
  ring.rotation.x = Math.PI / 2.6
  scene.add(ring)
  disposables.push(ringGeo, ringMat)

  // 環繞星塵
  const dustCount = 140
  const positions = new Float32Array(dustCount * 3)
  for (let i = 0; i < dustCount; i++) {
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(2 * Math.random() - 1)
    const r = 1.75 + Math.random() * 0.7
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
    positions[i * 3 + 2] = r * Math.cos(phi)
  }
  const dustGeo = new THREE.BufferGeometry()
  dustGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  const dustMat = new THREE.PointsMaterial({
    color: GOLD,
    size: 0.045,
    transparent: true,
    opacity: 0.8
  })
  const dust = new THREE.Points(dustGeo, dustMat)
  scene.add(dust)
  disposables.push(dustGeo, dustMat)

  const render = (time: number) => {
    const t = time / 1000
    const busy = state.value === 'thinking'
    const speed = busy ? 3 : 1

    group.rotation.y += 0.004 * speed
    shell.rotation.x = Math.sin(t * 0.4) * 0.2
    ring.rotation.z += 0.006 * speed

    // 呼吸；thinking 時脈動更明顯
    const pulse = 1 + Math.sin(t * (busy ? 6 : 1.6)) * (busy ? 0.07 : 0.03)
    core.scale.setScalar(pulse)
    coreMat.opacity = busy ? 0.28 + Math.sin(t * 6) * 0.12 : 0.16
    shellMat.color.setHex(busy ? CYAN : GOLD)

    dust.rotation.y -= 0.0018 * speed

    // 輕微看向游標
    group.rotation.z += (pointer.x * 0.15 - group.rotation.z) * 0.05
    group.rotation.x += (pointer.y * 0.2 - group.rotation.x) * 0.05

    renderer?.render(scene as THREE.Scene, camera as THREE.PerspectiveCamera)
    frameId = requestAnimationFrame(render)
  }

  frameId = requestAnimationFrame(render)
}

onMounted(() => {
  build()
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('avatar-state', onAvatarState)
})

onUnmounted(() => {
  if (frameId) cancelAnimationFrame(frameId)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('avatar-state', onAvatarState)
  disposables.forEach((d) => d.dispose())
  // 反覆開關 Chat 會不斷建立 WebGL context，瀏覽器上限約 16 個，必須主動釋放
  renderer?.forceContextLoss()
  renderer?.dispose()
  renderer = null
  scene = null
  camera = null
})
</script>

<style scoped>
.avatar {
  position: absolute;
  right: 1.5rem;
  bottom: calc(var(--os-dock-h) + 1.5rem);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0;
  background: none;
  border: none;
  /* 低於視窗，避免擋到內容 */
  z-index: 2;
  filter: drop-shadow(0 0 24px rgba(225, 193, 110, 0.25));
  transition: filter 0.3s ease;
}

.avatar--thinking {
  filter: drop-shadow(0 0 28px rgba(0, 164, 204, 0.4));
}

.avatar__canvas {
  width: 190px;
  height: 190px;
  display: block;
}

.avatar__label {
  margin-top: -0.75rem;
  color: var(--text-muted);
  font-family: var(--font-mono);
  font-size: 0.625rem;
  letter-spacing: 0.18em;
}

.avatar--thinking .avatar__label {
  color: var(--electric-blue);
}

@media (max-width: 768px) {
  .avatar {
    display: none;
  }
}
</style>
