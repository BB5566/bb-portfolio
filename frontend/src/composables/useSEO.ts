import { injectHead, useHead } from '@unhead/vue'
import type { Profile } from '@/services/profileApi'
import type { Project } from '@/types/models'

interface SEOConfig {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: 'website' | 'article' | 'profile'
}

/**
 * SEO 和 Schema.org 結構化資料管理
 */
export function useSEO() {
  const baseUrl = import.meta.env.VITE_APP_URL || 'https://bb-made.com'
  // 在 setup 階段先拿到 head：setPageMeta 常在 watch / await 之後呼叫，
  // 那時已不在 setup 裡，unhead v3 找不到 context 會整頁報錯
  const head = injectHead()

  /**
   * 設定頁面 Meta 標籤
   */
  const setPageMeta = (config: SEOConfig) => {
    const title = config.title || 'Bob Tsou | 前端工程師・地端 AI 內容產線負責人 作品集'
    const description =
      config.description ||
      '前端工程師（Vue 3 × TypeScript），兼任地端 AI 內容產線負責人：官網首頁讀取的資料 2 MB→79 KB（本機量測）、786／829 本教材可自動抓考題、內容產製流程自動化。'
    const image = config.image || `${baseUrl}/og-image-v5.png`
    const url = config.url || baseUrl

    useHead(
      {
        title,
        meta: [
          { name: 'description', content: description },
          // Open Graph
          { property: 'og:title', content: title },
          { property: 'og:description', content: description },
          { property: 'og:image', content: image },
          { property: 'og:url', content: url },
          { property: 'og:type', content: config.type || 'website' },
          // Twitter
          { name: 'twitter:title', content: title },
          { name: 'twitter:description', content: description },
          { name: 'twitter:image', content: image }
        ],
        link: [{ rel: 'canonical', href: url }]
      },
      { head }
    )
  }

  /**
   * 生成個人資料 Schema.org (Person)
   */
  const generatePersonSchema = (profile: Profile) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      // 跟 index.html 裡的靜態 JSON-LD 用同一個 @id，搜尋引擎會當成同一個人
      '@id': `${baseUrl}/#person`,
      name: profile.name || 'Bob Tsou',
      givenName: 'Bob',
      familyName: 'Tsou',
      jobTitle: profile.title || '前端工程師',
      description: profile.bio,
      url: baseUrl,
      image: profile.avatar ? `${baseUrl}${profile.avatar}` : undefined,
      email: profile.email,
      sameAs: [profile.github, profile.linkedin].filter(Boolean),
      knowsAbout: [
        'Vue 3',
        'TypeScript',
        '.NET 8',
        'Laravel',
        'Docker',
        'LLM 應用',
        'ComfyUI',
        'Web Performance'
      ],
      hasOccupation: {
        '@type': 'Occupation',
        name: 'Frontend Developer',
        occupationalCategory: '15-1252.00'
      },
      alumniOf: [
        { '@type': 'CollegeOrUniversity', name: '輔仁大學' },
        { '@type': 'EducationalOrganization', name: '勞動部勞動力發展署 泰山職業訓練場' }
      ]
    }
  }

  /**
   * 生成作品集網站 Schema.org (WebSite + ProfilePage)
   */
  const generateWebsiteSchema = () => {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': `${baseUrl}/#website`,
      name: 'Bob Tsou Portfolio',
      alternateName: 'Bob Tsou 前端工程師・地端 AI 內容產線負責人 作品集',
      url: baseUrl,
      description:
        '前端工程師（Vue 3 × TypeScript），兼任地端 AI 內容產線負責人：官網首頁讀取的資料 2 MB→79 KB（本機量測）、786／829 本教材可自動抓考題、內容產製流程自動化。',
      inLanguage: 'zh-TW',
      author: { '@id': `${baseUrl}/#person` }
    }
  }

  /**
   * 生成專案作品 Schema.org (CreativeWork)
   */
  const generateProjectSchema = (project: Project) => {
    // 封面圖：網址開頭的 / 拿掉，才不會變成 bb-made.com//covers/…
    const cover = project.cover_image_url ?? project.galleries?.[0]?.image_url
    const coverImage = cover ? `${baseUrl}/${cover.replace(/^\//, '')}` : undefined

    return {
      '@context': 'https://schema.org',
      '@type': 'CreativeWork',
      name: project.title,
      description: project.description,
      url: `${baseUrl}/projects/${project.id}`,
      image: coverImage,
      dateCreated: project.created_at,
      keywords:
        project.tags && project.tags.length > 0
          ? project.tags.map((tag: { name: string }) => tag.name).join(', ')
          : undefined,
      author: {
        '@type': 'Person',
        name: 'Bob Tsou'
      },
      ...(project.project_link && {
        workExample: {
          '@type': 'WebSite',
          url: project.project_link
        }
      }),
      ...(project.github_link && {
        codeRepository: project.github_link
      })
    }
  }

  /**
   * 生成麵包屑 Schema.org (BreadcrumbList)
   */
  const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        item: `${baseUrl}${item.url}`
      }))
    }
  }

  /**
   * 插入 JSON-LD Script 到 head
   */
  const insertSchema = (schema: object | object[]) => {
    const schemas = Array.isArray(schema) ? schema : [schema]

    useHead(
      {
        script: schemas.map((s) => ({
          type: 'application/ld+json',
          innerHTML: JSON.stringify(s)
        }))
      },
      { head }
    )
  }

  return {
    setPageMeta,
    generatePersonSchema,
    generateWebsiteSchema,
    generateProjectSchema,
    generateBreadcrumbSchema,
    insertSchema
  }
}
