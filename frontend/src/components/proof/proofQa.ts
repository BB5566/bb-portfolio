/**
 * 校對稿 Q&A 的預先寫好的回答。
 * 規則：只能用作品集或公開履歷平台上已經寫的內容，每則附出處；沒寫的一律老實說沒寫，請對方寄信問。
 */

export interface QaItem {
  q: string
  keywords: string[] // 自己打字問的時候，有出現這些字就算問到這題
  a: string | null // null＝作品集沒寫，回「沒提到」
  source?: string
  href?: string // 出處在頁面上的位置
}

export const QA: QaItem[] = [
  {
    q: '他會 Vue 嗎？',
    keywords: ['vue', 'nuxt', '前端'],
    a: '會。技能清單列了 Vue 3、TypeScript、Nuxt 4、Vite、Vitest、GSAP；作品「官網首頁改版（Vue 3＋Nuxt）」2026/01 正式上線；現職主責學習平台前端主線（Vue 3 monorepo）。',
    source: '出處：技能／作品「官網首頁改版」／經歷',
    href: '#build'
  },
  {
    q: '做過什麼 AI？',
    keywords: ['ai', '模型', 'llm'],
    a: '2026/07 起一人重建地端 AI 內容產線：模型全部在公司機器上推論，改圖時間 66 秒→約 9 秒（測試）。工作之外用本地模型做了個人 AI 助理：工具收據、逐句查證、68 題自動考試。',
    source: '出處：作品「地端 AI 內容產線」、「本地 AI 助理（個人專案）」',
    href: '#works'
  },
  {
    q: '能遠端嗎？',
    keywords: ['遠端', 'remote', '遠距', '混合'],
    a: '可以，接受遠距與混合型，地點台北／新北。',
    source: '出處：LinkedIn 職場意向',
    href: '#ship'
  },
  {
    q: '現在還在念書嗎？',
    keywords: ['進修', '學校', '在學', '大學', '念書', '學什麼'],
    a: '是。目前輔大軟工進修部在學，半工半讀。',
    source: '出處：學歷與訓練',
    href: '#build'
  },
  {
    q: '怎麼用 AI 寫程式？',
    keywords: ['claude', 'coding', '寫程式'],
    a: '以 AI coding 工具（Claude Code）為主力開發：前端與 AI 產線的規格、架構、測試與程式審查由我主導。也推動團隊導入 AI 輔助開發，與後端主要開發者共建 Claude Code 工程規範（4 位開發者在用、累積 250+ 筆工單）。',
    source: '出處：關於我／經歷',
    href: '#build'
  }
]

/** 先比完整問題，再比關鍵字；都沒有就回 undefined（＝作品集沒寫） */
export function findAnswer(text: string): QaItem | undefined {
  const t = text.trim().toLowerCase()
  return (
    QA.find((x) => x.q === text.trim()) ?? QA.find((x) => x.keywords.some((k) => t.includes(k)))
  )
}
