<template>
  <!-- 親手跑一次：左邊深色螢幕（輸入＋閘道）貼在印刷頁上，右邊是印出來的產出 -->
  <div ref="stage" class="stage" :data-state="state">
    <svg class="wires" aria-hidden="true">
      <template v-for="w in wirePaths" :key="w.index">
        <path :d="w.d" :class="{ hot: hotWires.includes(w.index) }" />
        <!-- 沿線跑的光點 -->
        <circle v-if="hotWires.includes(w.index) && !reduced" r="4">
          <animateMotion :path="w.d" dur="1.4s" repeatCount="indefinite" />
        </circle>
      </template>
    </svg>
    <i class="pcrop k1" aria-hidden="true"></i>
    <i class="pcrop k2" aria-hidden="true"></i>
    <i class="pcrop k3" aria-hidden="true"></i>
    <i class="pcrop k4" aria-hidden="true"></i>

    <div class="screen">
      <i class="tape t1" aria-hidden="true"></i>
      <i class="tape t2" aria-hidden="true"></i>

      <!-- 輸入 -->
      <div ref="inputs" class="col inputs">
        <div class="col-h">
          輸入 ·
          <b>點一個試試</b>
        </div>
        <button
          ref="inExam"
          type="button"
          class="in"
          :class="{ active: activeInputs.includes('exam') }"
          aria-label="輸入：一題國考考題，跑抓題與核對"
          @click="run('exam')"
        >
          <span class="hit">▶ 跑這題</span>
          <div class="doc pdf">
            <span class="tab">PDF</span>
            <div class="t">115 年初等考試 · 資料處理大意</div>
            <div class="meta">公開試題 · 試題代號 3511 · 第 11 題</div>
            <div class="q">
              <i>11</i>
              <span>下列那一種程式語言常用於網頁前端開發？</span>
            </div>
            <div class="opts">
              <span>(A) Python</span>
              <span>(B) PHP</span>
              <span>(C) Perl</span>
              <span>(D) JavaScript</span>
            </div>
          </div>
        </button>
        <button
          ref="inPoster"
          type="button"
          class="in"
          :class="{ active: activeInputs.includes('poster') }"
          aria-label="輸入：PM 要一張活動海報，跑出圖"
          @click="run('poster')"
        >
          <span class="hit">▶ 跑出圖</span>
          <div class="chat">
            <div class="who">
              <i></i>
              PM · Telegram
            </div>
            <span class="bubble">這週要一張活動海報</span>
          </div>
        </button>
        <button
          ref="inPost"
          type="button"
          class="in"
          :class="{ active: activeInputs.includes('post') }"
          aria-label="輸入：寫一則粉專貼文，跑文案"
          @click="run('post')"
        >
          <span class="hit">▶ 跑文案</span>
          <div class="chat">
            <div class="who">
              <i></i>
              PM · Telegram
            </div>
            <span class="bubble">再幫我寫一則粉專貼文</span>
          </div>
        </button>
        <button ref="runall" type="button" class="runall" @click="run('all')">
          ▶ 跑一次（三件全部，約 8 秒）
        </button>
      </div>

      <!-- 處理 -->
      <div class="col proc">
        <div class="col-h">處理</div>
        <div ref="gate" class="gate">
          <div class="gt">
            統一模型閘道
            <small>128GB 主機 · 互動優先</small>
            <span class="clock">{{ clock }}</span>
          </div>
          <div class="local">
            <i></i>
            <span>{{ LOCAL_TEXT[state] }}</span>
          </div>
          <div class="jobs">
            <div :class="['job', jobs.exam]" :style="dur('exam')">
              <span class="n">抓題 → 逐字核對</span>
              <span class="r">題數對原卷才送出</span>
              <span class="p"><i></i></span>
            </div>
            <div :class="['job', jobs.poster]" :style="dur('poster')">
              <span class="n">出圖（ComfyUI／FLUX）</span>
              <span class="r">
                <span>66s→約 9s</span>
                <span>照做率 70%→86%</span>
              </span>
              <span class="p"><i></i></span>
            </div>
            <div :class="['job', jobs.post]" :style="dur('post')">
              <span class="n">文案（本機 LLM）</span>
              <span class="r">粉專已發 43 篇</span>
              <span class="p"><i></i></span>
            </div>
          </div>
          <div class="log" aria-live="polite">
            <div v-for="(line, i) in logLines" :key="i" :class="line.kind">
              <span v-if="line.head" class="c">{{ line.head }}</span>
              {{ line.text }}
            </div>
            <div v-if="cursor" class="cur"></div>
          </div>
          <div class="ctrl">
            <span v-if="state === 'idle'" class="hint">
              右邊是上次跑完的結果；點一個輸入就會重新組裝。
            </span>
            <template v-else-if="state === 'running'">
              <button type="button" @click="skip">跳過 ▸</button>
              <span class="hint">跑完會停在結果，隨時可以跳過。</span>
            </template>
            <template v-else>
              <button type="button" class="primary" @click="run(lastPath)">再跑一次</button>
              <button type="button" @click="pickOther">換一個輸入</button>
            </template>
          </div>
        </div>
      </div>
    </div>

    <!-- 產出：印在紙上，零件照時間軸一個個亮（data-part 由上到下編號） -->
    <div class="col outputs">
      <div class="col-h">產出</div>
      <div class="outs">
        <div
          ref="outExam"
          class="out"
          :class="{ active: activeOuts.includes('exam') }"
          data-out="exam"
        >
          <div class="doc word">
            <div class="wbar" data-part :class="part('exam', 0)">
              <span>題庫.docx</span>
              <span>W</span>
            </div>
            <div class="wbody">
              <div class="h" data-part :class="part('exam', 1)">
                <span>第 11 題</span>
                <i>單選 · 資料處理大意</i>
              </div>
              <div class="qt" data-part :class="[part('exam', 2), { check: checking }]">
                下列那一種程式語言常用於網頁前端開發？
              </div>
              <div class="opts">
                <span data-part :class="part('exam', 3)">(A) Python</span>
                <span data-part :class="part('exam', 4)">(B) PHP</span>
                <span data-part :class="part('exam', 5)">(C) Perl</span>
                <span class="ans" data-part :class="part('exam', 6)">(D) JavaScript</span>
              </div>
              <div class="ans-row">
                <div class="ans-line" data-part :class="part('exam', 7)">
                  標準答案：D（考選部公布）
                </div>
                <span class="stamp" data-part :class="part('exam', 8)">逐字核對 ✓</span>
              </div>
              <div class="src" data-part :class="part('exam', 9)">
                題目來源：考選部 115 年公務人員初等考試 資料處理大意（試題代號 3511）第 11 題
                公開試題；依著作權法第 9 條，依法令舉行之考試試題不受著作權保護。
              </div>
            </div>
          </div>
          <div class="caption">
            Word 題庫 ·
            <b>786／829</b>
            本教材可自動抓題
          </div>
        </div>
        <div
          ref="outPoster"
          class="out"
          :class="{ active: activeOuts.includes('poster') }"
          data-out="poster"
        >
          <div class="poster">
            <span class="tag" data-part :class="part('poster', 0)">示意 · FLUX 本機</span>
            <div class="art" data-part :class="part('poster', 1)"></div>
            <div class="ptxt">
              <div class="big" data-part :class="part('poster', 2)">
                活動
                <br />
                海報
              </div>
              <div data-part :class="part('poster', 3)">
                <div class="bar m"></div>
                <div class="bar s"></div>
              </div>
            </div>
          </div>
          <div class="caption">
            海報（示意）· 改圖
            <b>約 9 秒</b>
            （測試）
          </div>
        </div>
        <div
          ref="outPost"
          class="out"
          :class="{ active: activeOuts.includes('post') }"
          data-out="post"
        >
          <div class="post">
            <div class="ph" data-part :class="part('post', 0)">
              <i></i>
              <div>
                <div class="bar"></div>
                <div class="bar g"></div>
              </div>
            </div>
            <div class="pimg" data-part :class="part('post', 1)"><span>NEW POST</span></div>
            <div class="pa" data-part :class="part('post', 2)">
              <span>♡</span>
              <span>◯</span>
              <span>➤</span>
            </div>
            <div class="pc" data-part :class="part('post', 3)">
              <div class="bar l"></div>
              <div class="bar m"></div>
              <div class="note">（示意文案）</div>
            </div>
          </div>
          <div class="caption">
            社群貼文（示意）· 已實際發到粉專
            <b>43 篇</b>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, useTemplateRef, watch } from 'vue'

type Name = 'exam' | 'poster' | 'post'
type Path = Name | 'all'
type State = 'idle' | 'running' | 'done'
type Step = { t: number; log: [string, string]; on?: number[]; stagger?: number; check?: boolean }

const NAMES: Name[] = ['exam', 'poster', 'post']

// ---- 每條路徑的時間軸：t 毫秒、log 文字、要點亮的零件；wires 是要變熱的連線 ----
const TIMELINES: Record<Name, { wires: number[]; dur: number; steps: Step[] }> = {
  exam: {
    wires: [0, 3],
    dur: 2800,
    steps: [
      { t: 0, log: ['d', '$ pipeline run --input 考題.pdf'] },
      { t: 300, log: ['', '讀取 PDF… 1 頁（試題代號 3511）'], on: [0] },
      { t: 800, log: ['', '偵測 1 題、4 個選項（A–D）'], on: [1, 2] },
      { t: 1300, log: ['', '轉成可編輯格式 → 題庫.docx'], on: [3, 4, 5, 6], stagger: 90 },
      { t: 1900, log: ['c', '與原卷逐字核對：題幹 ✓ 選項 4/4 ✓'], check: true, on: [7] },
      { t: 2450, log: ['a', '寫入 題庫.docx ✓ 本機完成，未呼叫雲端模型'], on: [8, 9] }
    ]
  },
  poster: {
    wires: [1, 4],
    dur: 2400,
    steps: [
      { t: 0, log: ['d', '$ pipeline run --input "這週要一張活動海報"'] },
      { t: 300, log: ['', '解析需求：活動海報 · 直式'], on: [0] },
      { t: 800, log: ['', '送出圖任務 → ComfyUI／FLUX（本機）'], on: [1] },
      { t: 1500, log: ['c', '出圖完成（此處加速示意）'], on: [2] },
      { t: 2050, log: ['a', '合成標題與文字區 ✓ 輸出 海報.png（示意）'], on: [3] }
    ]
  },
  post: {
    wires: [2, 5],
    dur: 2400,
    steps: [
      { t: 0, log: ['d', '$ pipeline run --input "再幫我寫一則粉專貼文"'] },
      { t: 300, log: ['', '解析需求：粉專貼文'], on: [0] },
      { t: 800, log: ['', '本機 LLM 撰寫文案…'], on: [3] },
      { t: 1450, log: ['', '配圖：取用剛出的海報版本'], on: [1] },
      { t: 2050, log: ['a', '送出前檢查：字數、連結 ✓ 輸出 貼文草稿（示意）'], on: [2] }
    ]
  }
}

const LOCAL_TEXT: Record<State, string> = {
  idle: '模型全部本機推論 · 待命',
  running: '本機推論中 · 不呼叫雲端模型',
  done: '✓ 本機完成 · 未呼叫雲端模型'
}

// 沒有 matchMedia（測試環境）就當作可以跑動畫
const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
const isPhone = () => window.innerWidth <= 1100

// ---- 畫面狀態 ----
const state = ref<State>('idle')
const activeInputs = ref<Name[]>([])
const activeOuts = ref<Name[]>([])
const jobs = reactive<Record<Name, 'ok' | 'busy'>>({ exam: 'ok', poster: 'ok', post: 'ok' })
const lit = reactive<Record<Name, number[]>>({ exam: [], poster: [], post: [] })
const checking = ref(false)
const hotWires = ref<number[]>([])
let lastPath: Path = 'exam'

// 零件亮不亮：工作做完就全亮，跑的時候照時間軸一個個亮
const part = (name: Name, index: number) => ({
  on: jobs[name] === 'ok' || lit[name].includes(index)
})
const dur = (name: Name) => ({ '--dur': `${TIMELINES[name].dur / 1000}s` })

function setHot(wires: number[], hot: boolean) {
  hotWires.value = hot
    ? [...hotWires.value, ...wires]
    : hotWires.value.filter((w) => !wires.includes(w))
}

// ---- 終端機記錄：最多 7 行（游標也算一行） ----
type LogLine = { kind: string; text: string; head?: string }
const logLines = ref<LogLine[]>([
  { kind: 'd', text: '$ pipeline status' },
  { kind: '', head: 'ready', text: ' · 三條工作流待命，模型全部在本機' },
  { kind: 'd', text: '點左邊任一輸入，或按「跑一次」' }
])
const cursor = ref(true)

function addLog(kind: string, text: string, keepCursor = true) {
  logLines.value.push({ kind, text })
  cursor.value = keepCursor
  while (logLines.value.length + (cursor.value ? 1 : 0) > 7) logLines.value.shift()
}

// ---- 計時器：跑的時候跳秒，結束停在總耗時 ----
const clock = ref('0.0s')
let clockStart = 0
let clockRaf = 0

function tick() {
  clock.value = ((performance.now() - clockStart) / 1000).toFixed(1) + 's'
  clockRaf = requestAnimationFrame(tick)
}
function clockRun() {
  cancelAnimationFrame(clockRaf)
  clockStart = performance.now()
  tick()
}
function clockStop() {
  cancelAnimationFrame(clockRaf)
}

let timers: number[] = []
const after = (ms: number, fn: () => void) => timers.push(window.setTimeout(fn, ms))
function clearTimers() {
  timers.forEach(clearTimeout)
  timers = []
}

// ---- 跑一條路徑 ----
function prepare(name: Name) {
  activeInputs.value = [name]
  activeOuts.value.push(name)
  lit[name] = []
  checking.value = false
  jobs[name] = 'busy'
  setHot(TIMELINES[name].wires, true)
}

function finishPath(name: Name) {
  jobs[name] = 'ok'
  setHot(TIMELINES[name].wires, false)
}

function playPath(name: Name, offset: number) {
  const tl = TIMELINES[name]
  after(offset, () => prepare(name))
  tl.steps.forEach((step) =>
    after(offset + step.t, () => {
      addLog(step.log[0], step.log[1])
      step.on?.forEach((index, k) => after(k * (step.stagger ?? 0), () => lit[name].push(index)))
      if (step.check) checking.value = true
    })
  )
  after(offset + tl.dur, () => finishPath(name))
  return tl.dur
}

function run(path: Path) {
  clearTimers()
  lastPath = path
  const names = path === 'all' ? NAMES : [path]
  // 先把上一輪的狀態收乾淨
  activeOuts.value = []
  NAMES.forEach((n) => (jobs[n] = 'ok'))
  hotWires.value = []
  logLines.value = []

  if (reduced) {
    // 減少動態：直接給完成結果
    names.forEach((n) => TIMELINES[n].steps.forEach((s) => addLog(s.log[0], s.log[1])))
    activeOuts.value = [...names]
    activeInputs.value = [...names]
    state.value = 'done'
    return
  }

  state.value = 'running'
  clockRun()
  // 手機：捲到閘道，看得到記錄跟產出
  if (isPhone()) els.gate.value?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  let offset = 0
  names.forEach((n) => (offset += playPath(n, offset) + 200))
  after(offset, () => {
    activeOuts.value = [...names]
    addLog('c', `done · ${names.length} 件產出完成，全程本機推論`, false)
    clockStop()
    state.value = 'done'
  })
}

function skip() {
  clearTimers()
  const names = lastPath === 'all' ? NAMES : [lastPath]
  names.forEach((n) => finishPath(n))
  checking.value = false
  logLines.value = []
  names.forEach((n) => TIMELINES[n].steps.forEach((s) => addLog(s.log[0], s.log[1], false)))
  addLog('c', '已跳過 · 結果如右', false)
  clockStop()
  activeOuts.value = [...names]
  state.value = 'done'
}

function pickOther() {
  state.value = 'idle'
  activeInputs.value = []
  activeOuts.value = []
  if (isPhone()) {
    inputsEl.value?.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  } else {
    els.inExam.value?.focus()
  }
}

// ---- 連線：依元素實際位置畫（桌機水平＋匯流排；手機直排） ----
const stageEl = useTemplateRef<HTMLElement>('stage')
const inputsEl = useTemplateRef<HTMLElement>('inputs')
const els = {
  inExam: useTemplateRef<HTMLElement>('inExam'),
  inPoster: useTemplateRef<HTMLElement>('inPoster'),
  inPost: useTemplateRef<HTMLElement>('inPost'),
  runall: useTemplateRef<HTMLElement>('runall'),
  gate: useTemplateRef<HTMLElement>('gate'),
  outExam: useTemplateRef<HTMLElement>('outExam'),
  outPoster: useTemplateRef<HTMLElement>('outPoster'),
  outPost: useTemplateRef<HTMLElement>('outPost')
}
type ElName = keyof typeof els

const LINKS: [ElName, ElName][] = [
  ['inExam', 'gate'],
  ['inPoster', 'gate'],
  ['inPost', 'gate'],
  ['gate', 'outExam'],
  ['gate', 'outPoster'],
  ['gate', 'outPost']
]
const wirePaths = ref<{ index: number; d: string }[]>([])

function draw() {
  const stage = stageEl.value
  if (!stage) return
  const s = stage.getBoundingClientRect()
  const box = (name: ElName) => {
    const r = els[name].value?.getBoundingClientRect() ?? s
    return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }
  }
  const vertical = isPhone()
  const paths: { index: number; d: string }[] = []

  LINKS.forEach(([a, b], i) => {
    // 手機：只畫「跑一次 → 閘道」和「閘道 → 題庫」
    if (vertical && i !== 0 && i !== 3) return
    const A = box(vertical && i === 0 ? 'runall' : a)
    const B = box(b)
    let d: string
    if (!vertical && i < 3) {
      // 輸入 → 閘道：水平 S 形
      const x1 = A.x + A.w
      const y1 = A.y + A.h / 2
      const x2 = B.x
      const y2 = B.y + B.h / 2
      const mx = (x1 + x2) / 2
      d = `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`
    } else if (!vertical) {
      // 閘道 → 產出：先接到產出上方的匯流排，再往下
      const exam = box('outExam')
      const x1 = A.x + A.w
      const y1 = A.y + A.h / 2
      const bx = exam.x - 28
      const by = exam.y - 20
      const tx = B.x + B.w / 2
      const y2 = B.y
      d = `M${x1},${y1} C${x1 + 40},${y1} ${bx - 40},${by} ${bx},${by} L${tx - 12},${by} Q${tx},${by} ${tx},${by + 12} L${tx},${y2}`
    } else {
      // 手機：由上往下
      const x1 = A.x + A.w / 2
      const y1 = A.y + A.h
      const x2 = B.x + B.w / 2
      const y2 = B.y
      const my = (y1 + y2) / 2
      d = `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`
    }
    paths.push({ index: i, d })
  })
  wirePaths.value = paths
}

let resizeObserver: ResizeObserver | undefined

onMounted(() => {
  // 版面變動、字型載完都重畫（ResizeObserver 一開始也會觸發一次）
  resizeObserver = new ResizeObserver(() => draw())
  if (stageEl.value) resizeObserver.observe(stageEl.value)
  document.fonts?.ready.then(draw)
})

// 狀態一變，產出的大小位置會跟著變
watch(state, draw, { flush: 'post' })

onBeforeUnmount(() => {
  clearTimers()
  clockStop()
  resizeObserver?.disconnect()
})
</script>

<style scoped>
/* 示範專用的顏色；紙、墨、橘、字型沿用外層 .proof-page */
.stage {
  --screen-bg: #15161a;
  --screen-line: rgba(243, 239, 230, 0.08);
  --screen-text: #f3efe6;
  --screen-muted: #a3a09a;
  --ease-io: cubic-bezier(0.65, 0, 0.35, 1);

  position: relative;
  display: grid;
  grid-template-columns: 3fr 2fr;
  gap: 44px;
  align-items: stretch;
  color: var(--ink);
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: 0;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

button:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 3px;
}

/* ====== 連線 ====== */
.wires {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: visible;
}

.wires path {
  fill: none;
  stroke: rgba(21, 22, 26, 0.3);
  stroke-width: 1.5;
  stroke-dasharray: 5 7;
  transition: stroke 0.3s;
}

.wires path.hot {
  stroke: var(--accent);
  stroke-width: 2;
}

.wires circle {
  fill: var(--accent);
}

@media (prefers-reduced-motion: no-preference) {
  .wires path.hot {
    animation: dash 1s linear infinite;
  }
}

@keyframes dash {
  to {
    stroke-dashoffset: -24;
  }
}

/* 舞台四角的裁切線 */
.pcrop {
  position: absolute;
  z-index: 3;
  width: 16px;
  height: 16px;
  pointer-events: none;
}

.pcrop::before,
.pcrop::after {
  content: '';
  position: absolute;
  background: var(--ink);
}

.pcrop::before {
  width: 16px;
  height: 1px;
}

.pcrop::after {
  width: 1px;
  height: 16px;
}

.k1 {
  left: -24px;
  top: -20px;
}
.k1::before {
  left: 0;
  top: 16px;
}
.k1::after {
  left: 16px;
  top: 0;
}

.k2 {
  right: -24px;
  top: -20px;
}
.k2::before {
  right: 0;
  top: 16px;
}
.k2::after {
  right: 16px;
  top: 0;
}

.k3 {
  left: -24px;
  bottom: -20px;
}
.k3::before {
  left: 0;
  bottom: 16px;
}
.k3::after {
  left: 16px;
  bottom: 0;
}

.k4 {
  right: -24px;
  bottom: -20px;
}
.k4::before {
  right: 0;
  bottom: 16px;
}
.k4::after {
  right: 16px;
  bottom: 0;
}

/* ====== 螢幕：深色畫面用膠帶貼在印刷頁上 ====== */
.screen {
  position: relative;
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 40px;
  padding: 26px 26px 24px;
  border: 10px solid #2a2b30;
  border-radius: 10px;
  background-color: var(--screen-bg);
  background-image:
    linear-gradient(var(--screen-line) 1px, transparent 1px),
    linear-gradient(90deg, var(--screen-line) 1px, transparent 1px);
  background-size: 40px 40px;
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.35) inset,
    0 22px 50px rgba(21, 22, 26, 0.28);
  color: var(--screen-text);
}

.screen::after {
  content: '圖 1 · 產線操作畫面（互動示範）';
  position: absolute;
  left: -10px;
  bottom: -34px;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.1em;
  color: var(--ink);
}

.tape {
  position: absolute;
  z-index: 4;
  width: 96px;
  height: 26px;
  background: rgba(255, 241, 160, 0.55);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(1px);
  pointer-events: none;
}

.t1 {
  left: -38px;
  top: -20px;
  transform: rotate(-10deg);
}

.t2 {
  right: -34px;
  bottom: -18px;
  transform: rotate(-8deg);
}

.col {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 14px;
  min-width: 0;
  padding-top: 30px;
}

.col-h {
  position: absolute;
  top: 0;
  left: 0;
  font-family: var(--mono);
  font-size: 11px;
  letter-spacing: 0.14em;
  color: var(--screen-muted);
  text-transform: uppercase;
}

.col-h b {
  color: var(--accent-ink);
  font-weight: 600;
}

.outputs .col-h {
  color: var(--ink-2);
}

.caption {
  margin-top: 8px;
  font-size: 12px;
  line-height: 1.5;
  color: var(--ink-2);
}

.caption b {
  color: var(--accent-ink);
  font-weight: 500;
}

/* ====== 輸入：可按的卡 ====== */
.in {
  position: relative;
  display: block;
  width: 100%;
  text-align: left;
  border-radius: 12px;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

.in:active {
  transform: scale(0.97);
}

.in:hover {
  transform: translateY(-2px);
}

.in::after {
  content: '';
  position: absolute;
  inset: -2px;
  border-radius: 14px;
  box-shadow:
    0 0 0 1px rgba(232, 84, 44, 0),
    0 0 0 rgba(232, 84, 44, 0);
  transition: box-shadow 0.3s var(--ease);
  pointer-events: none;
}

.in:hover::after {
  box-shadow:
    0 0 0 1px rgba(232, 84, 44, 0.7),
    0 0 24px rgba(232, 84, 44, 0.2);
}

.in .hit {
  position: absolute;
  right: 10px;
  top: 10px;
  z-index: 2;
  padding: 2px 8px;
  border-radius: 999px;
  background: var(--accent-ink);
  color: #fff;
  font-family: var(--mono);
  font-size: 10px;
  font-weight: 600;
}

[data-state='running'] .in {
  pointer-events: none;
  opacity: 0.6;
}

[data-state='running'] .in.active,
[data-state='done'] .in.active {
  opacity: 1;
  box-shadow:
    0 0 0 2px var(--accent),
    0 0 26px rgba(232, 84, 44, 0.3);
}

.doc {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: #fff;
  color: var(--ink);
}

.pdf {
  padding: 14px 14px 12px;
  font-size: 9.5px;
  line-height: 1.5;
}

.pdf .tab {
  position: absolute;
  top: 0;
  left: 0;
  padding: 2px 7px;
  border-radius: 0 0 6px 0;
  background: #d7332b;
  color: #fff;
  font-family: var(--mono);
  font-size: 9px;
}

.pdf .t {
  margin: 8px 64px 2px 0;
  font-weight: 700;
  font-size: 10px;
}

.pdf .meta {
  margin-bottom: 6px;
  font-size: 8px;
  color: #666;
}

.pdf .q {
  display: flex;
  gap: 5px;
  align-items: flex-start;
  line-height: 1.45;
}

.pdf .q i {
  flex: none;
  font-style: normal;
  font-family: var(--mono);
  font-size: 9px;
  color: #444;
}

.pdf .opts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1px 8px;
  margin-top: 4px;
  padding-left: 16px;
  font-size: 9px;
}

.chat {
  min-height: 60px;
  padding: 10px 12px;
  border: 1px solid rgba(243, 239, 230, 0.18);
  border-radius: 12px;
  background: #22242a;
  font-size: 12px;
  line-height: 1.5;
}

.chat .who {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  font-family: var(--mono);
  font-size: 10px;
  color: var(--screen-muted);
}

.chat .who i {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
}

.chat .bubble {
  display: inline-block;
  padding: 7px 10px;
  border-radius: 10px 10px 10px 2px;
  background: #2e3036;
  color: var(--screen-text);
}

.runall {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 48px;
  border-radius: 12px;
  background: var(--accent);
  color: #fff;
  font-weight: 900;
  font-size: 15px;
  box-shadow: 0 8px 24px rgba(232, 84, 44, 0.3);
  transition: transform 0.15s;
}

.runall:active {
  transform: scale(0.97);
}

[data-state='running'] .runall {
  opacity: 0.5;
  pointer-events: none;
}

/* ====== 閘道 ====== */
.gate {
  scroll-margin-top: 64px; /* 手機全螢幕時頂部有標題列，捲過來別被擋住 */
  position: relative;
  padding: 16px;
  border: 1px solid rgba(243, 239, 230, 0.3);
  border-radius: 14px;
  background: rgba(243, 239, 230, 0.04);
}

.gate .gt {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 15px;
}

.gate .gt small {
  font-family: var(--mono);
  font-weight: 400;
  font-size: 10px;
  color: #dcd6ca;
}

.gate .gt .clock {
  min-width: 4.5ch;
  margin-left: auto;
  font-family: var(--mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  color: var(--screen-muted);
}

[data-state='running'] .gate .gt .clock {
  color: var(--screen-text);
}

[data-state='done'] .gate .gt .clock {
  color: var(--accent-ink);
}

/* 「本機推論」小膠囊：待命灰、跑的時候閃、完成變橘 */
.local {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 3px 9px;
  border: 1px solid rgba(141, 196, 209, 0.3);
  border-radius: 999px;
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--screen-muted);
  transition: all 0.3s;
}

.local i {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--screen-muted);
}

[data-state='running'] .local {
  color: var(--screen-text);
  border-color: rgba(243, 239, 230, 0.6);
}

[data-state='running'] .local i {
  background: var(--accent);
  box-shadow: 0 0 10px var(--accent);
}

@media (prefers-reduced-motion: no-preference) {
  [data-state='running'] .local i {
    animation: blink 1s infinite;
  }
}

@keyframes blink {
  50% {
    opacity: 0.3;
  }
}

[data-state='done'] .local {
  color: #fff;
  background: var(--accent-ink);
  border-color: var(--accent);
}

[data-state='done'] .local i {
  background: #fff;
}

.jobs {
  margin-top: 12px;
}

.job {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 10px;
  padding: 8px 0;
  border-top: 1px dashed rgba(243, 239, 230, 0.2);
  font-size: 12px;
}

.job .n {
  font-weight: 500;
  white-space: nowrap;
}

.job .r {
  align-self: center;
  max-width: 150px;
  font-family: var(--mono);
  font-size: 10px;
  line-height: 1.4;
  text-align: right;
  color: var(--accent-ink);
}

.job .r span {
  display: block;
}

.job .p {
  grid-column: 1 / -1;
  height: 3px;
  overflow: hidden;
  border-radius: 2px;
  background: rgba(243, 239, 230, 0.15);
}

.job .p i {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--accent);
  transform-origin: left;
}

/* 進度條：從 0 跑滿，長度照這條路徑的時間 */
.job.busy .p i {
  animation: grow var(--dur) linear both;
}

@keyframes grow {
  from {
    transform: scaleX(0);
  }
}

.job.busy .n::after {
  content: ' ⟳';
  color: var(--accent-ink);
}

.job.ok .n::after {
  content: ' ✓';
  color: var(--accent-ink);
}

/* 終端機記錄：新的一行從下面長出來 */
.log {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  min-height: 132px;
  max-height: 132px;
  margin-top: 12px;
  padding: 10px 12px;
  overflow: hidden;
  border: 1px solid rgba(243, 239, 230, 0.15);
  border-radius: 8px;
  background: #0d0e12;
  font-family: var(--mono);
  font-size: 11px;
  line-height: 1.7;
  color: #d9d4c8;
}

.log div {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.log .c {
  color: var(--screen-text);
}

.log .a {
  color: var(--accent-ink);
}

.log .d {
  color: var(--screen-muted);
}

.log .cur::after {
  content: '▍';
  color: var(--accent-ink);
}

@media (prefers-reduced-motion: no-preference) {
  .log .cur::after {
    animation: blink 1s steps(1) infinite;
  }
}

.ctrl {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.ctrl button {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(243, 239, 230, 0.35);
  border-radius: 9px;
  color: var(--screen-text);
  font-weight: 700;
  font-size: 13px;
  transition: transform 0.15s;
}

.ctrl button:active {
  transform: scale(0.96);
}

.ctrl button.primary {
  background: var(--accent-ink);
  border-color: var(--accent-ink);
  color: #fff;
}

.ctrl .hint {
  font-size: 12px;
  color: var(--screen-muted);
}

/* ====== 產出：印在紙上，四角有裁切線 ====== */
.outs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  align-items: start;
  justify-content: start;
  max-width: 420px;
}

.outs .out:first-child {
  grid-column: 1 / -1;
  align-items: center;
  text-align: center;
}

.out {
  --ck: linear-gradient(var(--ink), var(--ink));

  display: flex;
  flex-direction: column;
  padding: 12px;
  background-repeat: no-repeat;
  background-image:
    var(--ck), var(--ck), var(--ck), var(--ck), var(--ck), var(--ck), var(--ck), var(--ck);
  background-size:
    11px 1px,
    1px 11px,
    11px 1px,
    1px 11px,
    11px 1px,
    1px 11px,
    11px 1px,
    1px 11px;
  background-position:
    left 0 top 11px,
    left 11px top 0,
    right 0 top 11px,
    right 11px top 0,
    left 0 bottom 11px,
    left 11px bottom 0,
    right 0 bottom 11px,
    right 11px bottom 0;
  transition:
    opacity 0.4s var(--ease),
    filter 0.4s var(--ease),
    transform 0.6s var(--ease);
}

[data-state='done'] .out.active {
  transform: translateY(-4px);
}

[data-state='running'] .out:not(.active) {
  opacity: 0.4;
}

.doc,
.poster,
.post {
  box-shadow: 0 6px 18px rgba(21, 22, 26, 0.14);
  transition: box-shadow 0.6s var(--ease);
}

[data-state='done'] .out.active .doc,
[data-state='done'] .out.active .poster,
[data-state='done'] .out.active .post {
  box-shadow:
    0 0 0 2px var(--accent),
    0 14px 30px rgba(21, 22, 26, 0.14);
}

/* 組裝：跑的時候，該產出的零件先隱藏，再逐一出現；靜態時全部顯示 */
[data-state='running'] .out.active [data-part] {
  opacity: 0;
  transform: translateY(8px);
}

[data-state='running'] .out.active [data-part].on {
  opacity: 1;
  transform: none;
  transition:
    opacity 0.5s var(--ease),
    transform 0.6s var(--ease);
}

.word {
  width: min(300px, 100%);
  font-size: 9.5px;
  line-height: 1.5;
}

.word .wbar {
  display: flex;
  justify-content: space-between;
  padding: 4px 8px;
  background: #2b579a;
  color: #fff;
  font-family: var(--mono);
  font-size: 9px;
}

.word .wbody {
  padding: 12px 14px 14px;
}

.word .h {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-weight: 700;
  font-size: 10px;
}

.word .h i {
  font-style: normal;
  font-family: var(--mono);
  font-weight: 400;
  font-size: 8px;
  color: #2b579a;
}

.word .qt {
  padding: 2px 3px;
  border-radius: 3px;
  line-height: 1.5;
}

/* 逐字核對：題幹刷上一道螢光 */
.word .qt.check {
  background: linear-gradient(90deg, rgba(53, 224, 198, 0.55), rgba(53, 224, 198, 0.55)) no-repeat 0
    0 / 0% 100%;
}

@media (prefers-reduced-motion: no-preference) {
  .word .qt.check {
    animation: sweep 0.9s var(--ease-io) forwards;
  }
}

@keyframes sweep {
  to {
    background-size: 100% 100%;
  }
}

.word .opts {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px 8px;
  margin-top: 5px;
  padding-left: 6px;
}

.word .opts span.ans {
  font-weight: 700;
  color: #1b8a5a;
}

.word .ans-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 7px;
}

.word .ans-line {
  font-family: var(--mono);
  font-size: 8.5px;
  color: #2b579a;
}

.word .src {
  margin-top: 8px;
  padding-top: 5px;
  border-top: 1px solid #e4e2da;
  font-size: 7.5px;
  line-height: 1.4;
  color: #777;
}

.stamp {
  display: inline-block;
  padding: 2px 6px;
  border: 1.5px solid #1b8a5a;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.85);
  color: #1b8a5a;
  font-family: var(--mono);
  font-size: 8px;
  transform: rotate(-4deg);
}

.poster {
  position: relative;
  width: 100%;
  aspect-ratio: 172 / 240;
  overflow: hidden;
  border-radius: 8px;
  background: #2a1f3d;
}

.poster .art {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.55) 0 18px, transparent 19px),
    radial-gradient(circle at 60% 60%, rgba(255, 255, 255, 0.25) 0 36px, transparent 37px),
    linear-gradient(160deg, transparent 55%, rgba(0, 0, 0, 0.35)),
    radial-gradient(120% 80% at 20% 15%, #ffd37a 0%, #f28c3b 35%, #7b2e8e 75%, #1c1646 100%);
}

.poster .ptxt {
  position: absolute;
  left: 14px;
  right: 14px;
  bottom: 14px;
  color: #fff;
}

.poster .ptxt .big {
  font-weight: 900;
  font-size: 22px;
  line-height: 1.15;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.bar {
  height: 5px;
  margin: 4px 0;
  border-radius: 3px;
  background: #c8c6be;
}

.bar.s {
  width: 55%;
}

.bar.m {
  width: 78%;
}

.bar.l {
  width: 95%;
}

.poster .ptxt .bar {
  background: rgba(255, 255, 255, 0.75);
}

.tag {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-family: var(--mono);
  font-size: 9px;
}

.post {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 10px;
  background: #fff;
  color: #111;
  font-size: 9px;
}

.post .ph {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
}

.post .ph i {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ffb547, #35e0c6);
}

.post .ph .bar {
  width: 70px;
  height: 5px;
  margin: 0;
  background: #333;
}

.post .ph .bar.g {
  width: 44px;
  margin-top: 3px;
  background: #bbb;
}

.post .pimg {
  position: relative;
  height: 112px;
  background:
    radial-gradient(circle at 70% 70%, rgba(255, 255, 255, 0.5) 0 14px, transparent 15px),
    radial-gradient(120% 80% at 20% 15%, #ffd37a 0%, #f28c3b 35%, #7b2e8e 75%, #1c1646 100%);
}

.post .pimg span {
  position: absolute;
  left: 12px;
  bottom: 10px;
  color: #fff;
  font-weight: 900;
  font-size: 13px;
  letter-spacing: 0.1em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.post .pa {
  display: flex;
  gap: 8px;
  padding: 8px 10px 2px;
  font-size: 11px;
}

.post .pc {
  padding: 4px 10px 10px;
}

.post .pc .bar {
  background: #ddd;
}

.post .pc .note {
  margin-top: 4px;
  font-size: 8px;
  color: #888;
}

/* ====== 手機：螢幕在上、產出在下，直排 ====== */
@media (max-width: 1100px) {
  .stage {
    grid-template-columns: 1fr;
    gap: 40px;
    padding-bottom: 10px;
  }

  .screen {
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
    padding: 18px 14px 16px;
    border-width: 8px;
  }

  .screen::after {
    left: 0;
    bottom: -30px;
  }

  .col {
    gap: 12px;
  }

  .col:not(.inputs) {
    padding-top: 0;
  }

  .col:not(.inputs) .col-h {
    display: none;
  }

  .col-h {
    right: 0;
    text-align: center;
  }

  .in .pdf {
    font-size: 10px;
  }

  .outs {
    gap: 12px;
    justify-content: center;
    max-width: 460px;
    margin-inline: auto;
  }

  .word {
    width: min(260px, 100%);
  }

  /* 跑的時候：非當前產出縮成小標籤，讓閘道＋產出塞進一屏 */
  [data-state='running'] .out:not(.active) .doc,
  [data-state='running'] .out:not(.active) .poster,
  [data-state='running'] .out:not(.active) .post {
    display: none;
  }

  [data-state='running'] .out:not(.active) .caption {
    margin: 0;
    padding: 8px;
    border: 1px dashed var(--rule);
    border-radius: 8px;
    background: #ede7da;
    color: var(--ink-2);
    text-align: center;
  }

  [data-state='running'] .out.active {
    grid-column: 1 / -1;
    align-items: center;
    text-align: center;
  }

  [data-state='running'] .out.active .poster {
    max-width: 220px;
  }

  [data-state='running'] .out.active .post {
    max-width: 240px;
  }
}

@media (max-width: 640px) {
  .pcrop,
  .tape {
    display: none;
  }
}
</style>
