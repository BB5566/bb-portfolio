/**
 * 作品頁的分享圖（og:image、twitter:image、JSON-LD image）。
 * 封面是 WebP，LinkedIn 等平台的預覽卡不保證會顯示，所以另外出 1200×630 的 JPG：public/og/{slug}.jpg
 * （frontend/scripts/make-og-images.py 產生）。
 *
 * 重出圖片後 OG_VERSION 要換新，後端 ProjectShareController::OG_VERSION 也要一起換（邊緣快取一天）。
 */
export const OG_VERSION = '20261111a'

export function projectShareImage(slug: string, siteUrl = 'https://bb-made.com'): string {
  return `${siteUrl}/og/${slug}.jpg?v=${OG_VERSION}`
}
