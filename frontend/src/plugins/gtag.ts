import { log } from '@/utils/logger'
/**
 * Google Analytics 4 (GA4) 整合
 *
 * 使用方式：
 * 1. 在 .env 中設定 VITE_GA_MEASUREMENT_ID
 * 2. 在 main.ts 中初始化此插件
 * 3. 使用 useGtag() composable 追蹤事件
 */

import type { App } from 'vue'
import type { Router } from 'vue-router'

declare global {
  interface Window {
    dataLayer: unknown[]
    gtag: (...args: unknown[]) => void
  }
}

interface GtagConfig {
  measurementId: string
  router?: Router
  debug?: boolean
  useZaraz?: boolean
}

/**
 * 初始化 Google Analytics
 */
export function initGoogleAnalytics(config: GtagConfig) {
  const { measurementId, router, debug = false, useZaraz = false } = config

  // 如果沒有 Measurement ID，不載入 GA
  if (!measurementId || measurementId === 'G-XXXXXXXXXX') {
    if (debug) {
      log.warn('[GA4] Measurement ID 未設定，GA4 已停用')
    }
    return
  }

  // 載入 gtag.js (如果是使用 Cloudflare Zaraz 則跳過，以免阻礙效能且重複發送)
  if (!useZaraz) {
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    document.head.appendChild(script)
  } else if (debug) {
    log.info('[GA4] 偵測到 Cloudflare Zaraz 模式，跳過插入 gtag.js 腳本，保留 dataLayer Event 代理')
  }

  // 初始化 dataLayer
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
  }

  // 配置 GA4
  window.gtag('js', new Date())
  window.gtag('config', measurementId, {
    send_page_view: false, // 手動控制頁面瀏覽追蹤
    debug_mode: debug
  })

  if (debug) {
    log.info('[GA4] Google Analytics 已初始化:', measurementId)
  }

  // 整合 Vue Router
  if (router) {
    router.afterEach((to) => {
      // 追蹤頁面瀏覽
      window.gtag('event', 'page_view', {
        page_path: to.path,
        page_title: to.meta.title || document.title,
        page_location: window.location.href
      })

      if (debug) {
        log.info('[GA4] 頁面瀏覽:', to.path)
      }
    })
  }
}

/**
 * Vue Plugin
 */
export const GtagPlugin = {
  install(app: App, options: GtagConfig) {
    initGoogleAnalytics(options)

    // 提供全域方法
    app.config.globalProperties.$gtag = window.gtag
  }
}

/**
 * Composable: 使用 Google Analytics
 */
export function useGtag() {
  /**
   * 追蹤自訂事件
   */
  const trackEvent = (eventName: string, parameters?: Record<string, unknown>) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, parameters)
    }
  }

  /**
   * 追蹤頁面瀏覽
   */
  const trackPageView = (pagePath: string, pageTitle?: string) => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'page_view', {
        page_path: pagePath,
        page_title: pageTitle || document.title,
        page_location: window.location.href
      })
    }
  }

  /**
   * 追蹤專案互動
   */
  const trackProjectView = (projectId: number, projectTitle: string) => {
    trackEvent('view_project', {
      project_id: projectId,
      project_title: projectTitle
    })
  }

  /**
   * 追蹤專案連結點擊
   */
  const trackProjectLinkClick = (projectId: number, linkType: 'demo' | 'github') => {
    trackEvent('click_project_link', {
      project_id: projectId,
      link_type: linkType
    })
  }

  /**
   * 追蹤聯絡表單提交
   */
  const trackContactFormSubmit = (success: boolean) => {
    trackEvent('contact_form_submit', {
      success
    })
  }

  /**
   * 追蹤技能互動
   */
  const trackSkillInteraction = (skillName: string, category: string) => {
    trackEvent('interact_skill', {
      skill_name: skillName,
      skill_category: category
    })
  }

  /**
   * 追蹤分類篩選
   */
  const trackCategoryFilter = (categoryName: string) => {
    trackEvent('filter_by_category', {
      category: categoryName
    })
  }

  /**
   * 追蹤社交連結點擊
   */
  const trackSocialClick = (platform: string, url: string) => {
    trackEvent('click_social_link', {
      platform,
      url
    })
  }

  /**
   * 追蹤下載動作
   */
  const trackDownload = (fileName: string, fileType: string) => {
    trackEvent('file_download', {
      file_name: fileName,
      file_type: fileType
    })
  }

  return {
    trackEvent,
    trackPageView,
    trackProjectView,
    trackProjectLinkClick,
    trackContactFormSubmit,
    trackSkillInteraction,
    trackCategoryFilter,
    trackSocialClick,
    trackDownload
  }
}
