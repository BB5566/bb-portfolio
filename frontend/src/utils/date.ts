/**
 * 日期區間格式化工具
 * 統一前台與後台原本各自重複實作的「年月區間」格式化邏輯。
 * - 'ch'  → 2024年3月（前台 About / 經歷時間軸）
 * - 'dot' → 2024.03（後台 Experiences / Education 列表）
 */
type MonthFormat = 'ch' | 'dot'

export function formatMonth(dateStr: string, format: MonthFormat = 'ch'): string {
  const date = new Date(dateStr)
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  return format === 'dot' ? `${year}.${String(month).padStart(2, '0')}` : `${year}年${month}月`
}

export function getDatePeriod(
  startDate: string,
  endDate: string | null,
  isCurrent: boolean,
  format: MonthFormat = 'ch'
): string {
  const start = formatMonth(startDate, format)
  const end = isCurrent ? '現在' : endDate ? formatMonth(endDate, format) : '現在'
  return `${start} - ${end}`
}
