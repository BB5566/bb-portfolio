import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { OG_VERSION, projectShareImage } from '@/utils/shareImage'

const root = resolve(__dirname, '../../../..')

describe('作品頁分享圖', () => {
  it('網址是 JPG（LinkedIn 等平台的預覽卡不保證吃 WebP）', () => {
    const url = projectShareImage('portfolio-os')
    expect(url).toBe(`https://bb-made.com/og/portfolio-os.jpg?v=${OG_VERSION}`)
    expect(new URL(url).pathname.endsWith('.jpg')).toBe(true)
  })

  it('seeder 裡每件作品都有一張 public/og/{slug}.jpg', () => {
    const seeder = readFileSync(
      resolve(root, 'backend/database/seeders/ProjectSeeder.php'),
      'utf-8'
    )
    const slugs = [...seeder.matchAll(/'slug' => '([^']+)',\s+'title'/g)].map((m) => m[1])
    expect(slugs.length).toBeGreaterThan(0)
    const missing = slugs.filter(
      (slug) => !existsSync(resolve(root, `frontend/public/og/${slug}.jpg`))
    )
    expect(missing).toEqual([])
  })

  it('版號跟後端 ProjectShareController 一致', () => {
    const controller = readFileSync(
      resolve(root, 'backend/app/Http/Controllers/Api/ProjectShareController.php'),
      'utf-8'
    )
    expect(controller).toContain(`OG_VERSION = '${OG_VERSION}'`)
  })
})
