import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ProofHero from '@/components/proof/ProofHero.vue'
import { splitClaimLine } from '@/components/proof/proofMotion'
import type { ProfileHeroProof } from '@/types/models'

const copy: ProfileHeroProof = {
  claim_lines: ['設計與電商出身，', '把 2 MB 的首頁', '壓成 79 KB。（本機量測）'],
  who: '前端工程師',
  role: '前端工程師',
  pitch: '自介',
  how: '做法'
}

const mountHero = () =>
  mount(ProofHero, {
    props: {
      name: 'Bob Tsou',
      copy,
      stats: [{ value: '2,100+', label: '平台服務學校數' }]
    }
  })

describe('ProofHero', () => {
  it('大標只有 K 版給報讀軟體讀，C／M／Y 色版藏起來', () => {
    const plates = mountHero().findAll('.claim > .plate')
    expect(plates.map((p) => p.attributes('aria-hidden'))).toEqual([
      'false',
      'true',
      'true',
      'true'
    ])
    expect(plates[0]?.text()).toBe('設計與電商出身，把 2 MB 的首頁壓成 79 KB。（本機量測）')
  })

  it('沒有 matchMedia 時不播開場（jsdom 等同不能跑動畫）', () => {
    const wrapper = mountHero()
    expect(wrapper.find('.proof-hero').attributes('data-intro')).toBeUndefined()
    expect(wrapper.find('.skip').exists()).toBe(false)
  })

  it('按「60 秒看重點」會通知外層打開', async () => {
    const wrapper = mountHero()
    await wrapper.find('.btn.quick').trigger('click')
    expect(wrapper.emitted('quick')).toHaveLength(1)
  })
})

describe('splitClaimLine', () => {
  it('數字＋單位變強調、結尾括號變小字', () => {
    expect(splitClaimLine('壓成 79 KB。（本機量測）')).toEqual([
      { text: '壓成 ', kind: 'text' },
      { text: '79 KB', kind: 'em' },
      { text: '。', kind: 'text' },
      { text: '（本機量測）', kind: 'small' }
    ])
  })

  it('AI 這類大寫縮寫也變強調', () => {
    expect(splitClaimLine('把 AI 搬進公司。')).toEqual([
      { text: '把 ', kind: 'text' },
      { text: 'AI', kind: 'em' },
      { text: ' 搬進公司。', kind: 'text' }
    ])
  })

  it('沒有數字的行原樣保留', () => {
    expect(splitClaimLine('設計與電商出身，')).toEqual([{ text: '設計與電商出身，', kind: 'text' }])
  })
})

// 路徑以 frontend/ 為準（vitest 從這裡跑）
describe('大標字型', () => {
  it('seeder 大標的每個中文字都收進裁好的字型（漏了就重跑 scripts/subset-claim-font.py）', () => {
    const seeder = readFileSync(resolve('../backend/database/seeders/ProfileSeeder.php'), 'utf-8')
    const block = seeder.match(/'claim_lines' => \[(.*?)\]/s)?.[1] ?? ''
    const claim = [...block.matchAll(/'([^']*)'/g)].map((m) => m[1]).join('')
    const font = readFileSync(resolve('src/assets/fonts/noto-serif-tc-claim-900.txt'), 'utf-8')
    expect(claim).not.toBe('')
    const missing = [...claim].filter((c) => !/[\sA-Za-z0-9.,]/.test(c) && !font.includes(c))
    expect(missing).toEqual([])
  })
})
