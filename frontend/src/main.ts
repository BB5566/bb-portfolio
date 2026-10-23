import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createHead } from '@unhead/vue/client'

// Import self-hosted fonts (Latin subset only, woff2, font-display:swap)
import './styles/fonts.css'

// Import new design system
import './styles/design-system.css'

import App from './App.vue'
import router from './router'
import { GtagPlugin } from './plugins/gtag'
import { setAppInstance } from './app-instance'

const app = createApp(App)
const head = createHead()

// 將 app 實例存入 holder，供 router 守衛在進入後台時動態註冊 Element Plus 圖標
setAppInstance(app)

// ⚡ 初始化 Sentry 錯誤追蹤 (production only, async, non-blocking)
;(async () => {
  const { initSentry } = await import('./plugins/sentry')
  await initSentry(app, router)
})()

app.use(createPinia())
app.use(router)
app.use(head)

// 延遲載入 Particles — 使用 requestIdleCallback 避免阻塞首屏渲染
// 只有在使用者未啟用 prefers-reduced-motion 時才載入
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const loadParticles = () => {
    import('./plugins/particles-lazy').then((m) => app.use(m.default))
  }
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadParticles, { timeout: 3000 })
  } else {
    setTimeout(loadParticles, 300)
  }
}

// 註冊 Plugins
const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID || ''
const useZaraz = import.meta.env.VITE_USE_ZARAZ === 'true'

if (measurementId && measurementId !== 'G-XXXXXXXXXX') {
  app.use(GtagPlugin, {
    measurementId,
    router,
    debug: import.meta.env.DEV,
    useZaraz
  })
}
app.mount('#app')
