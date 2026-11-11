import { describe, it, expect } from 'vitest'
import { summarize } from '@/utils/summary'

describe('summarize', () => {
  it('短句原樣回傳', () => {
    expect(summarize('短說明。')).toBe('短說明。')
  })

  it('收在句號，不加刪節號', () => {
    const text =
      'AI 心情日記：寫下心情，由 AI 生成一幅專屬畫作與一句短語。PHP MVC＋SQLite，3D 翻轉卡片互動；Docker 部署於 NAS。'
    expect(summarize(text)).toBe('AI 心情日記：寫下心情，由 AI 生成一幅專屬畫作與一句短語。')
  })

  it('沒有句號就退到逗號並補刪節號', () => {
    const text =
      '2026/07 起由我一人重建公司的 AI 內容產線並負責維運：從雲端模型改成程式化的本機產線，7 月在 Mac mini 改用 9B 本機模型'
    expect(summarize(text)).toBe(
      '2026/07 起由我一人重建公司的 AI 內容產線並負責維運：從雲端模型改成程式化的本機產線…'
    )
  })

  it('不切在沒關起來的括號裡', () => {
    const text =
      '主導前端弱掃修補規劃，完成主站前端函式庫升級（jQuery 1.11／2.1→3.5.1、Bootstrap 3→4 相容層，涵蓋 31 頁）並修補 12 項反射型 XSS'
    expect(summarize(text)).toBe('主導前端弱掃修補規劃，完成主站前端函式庫升級…')
  })
})
