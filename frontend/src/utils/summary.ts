/**
 * 卡片摘要：把長說明縮到 max 字內，盡量在句子邊界收尾。
 * - 有句號就收在句號（整句保留，不加刪節號）
 * - 沒有就退到逗號、頓號等停頓處，後面補「…」
 * - 不切在還沒關起來的括號或引號裡
 */
const PAIRS: [string, string][] = [
  ['（', '）'],
  ['「', '」']
]

export function summarize(text: string, max = 60): string {
  if (text.length <= max) return text

  let head = text.slice(0, max)
  for (const [open, close] of PAIRS) {
    const at = head.lastIndexOf(open)
    if (at > head.lastIndexOf(close)) head = head.slice(0, at)
  }

  const end = head.lastIndexOf('。')
  if (end >= max / 2) return head.slice(0, end + 1)

  const pause = Math.max(...['，', '；', '：', '、'].map((c) => head.lastIndexOf(c)))
  return (pause >= max / 3 ? head.slice(0, pause) : head) + '…'
}
