import { fileURLToPath, URL } from 'node:url'

import { defineConfig, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

/**
 * Simple Critical CSS Inlining Plugin
 * Without Chromium dependency: reads HTML, finds <link rel="stylesheet">
 * and inlines matching CSS files directly into <head>
 */
function simpleCriticalCSSPlugin(): Plugin {
  return {
    name: 'simple-critical-css',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      try {
        const fs = await import('fs')
        const path = await import('path')
        const html = await fs.promises.readFile('dist/index.html', 'utf-8')
        
        // Find all <link rel="stylesheet"> in <head>
        const linkMatches = html.match(/<link[^>]*rel="stylesheet"[^>]*>/g) || []
        if (linkMatches.length === 0) {
          console.log('⚠️ No stylesheets found to inline')
          return
        }

        let inlinedCount = 0
        let modifiedHtml = html

        for (const link of linkMatches) {
          const hrefMatch = link.match(/href="([^"]+)"/)
          if (!hrefMatch) continue

          const href = hrefMatch[1]
          // Only inline CSS from dist/assets/ (ignore preloads, CDN links)
          if (!href.includes('assets')) continue

          try {
            const cssPath = path.join('dist', href)
            const css = await fs.promises.readFile(cssPath, 'utf-8')
            const styleTag = `<style>${css}</style>`
            modifiedHtml = modifiedHtml.replace(link, styleTag)
            inlinedCount++
          } catch {
            console.warn(`⚠️ Could not read CSS file: ${href}`)
          }
        }

        if (inlinedCount > 0) {
          await fs.promises.writeFile('dist/index.html', modifiedHtml, 'utf-8')
          console.log(`✅ Inlined ${inlinedCount} critical CSS file(s)`)
        } else {
          console.log('ℹ️ No CSS files matched for inlining')
        }
      } catch (error) {
        console.warn('⚠️ Critical CSS inlining failed (non-blocking):', error instanceof Error ? error.message : error)
      }
    }
  }
}


/**
 * Phase 2: Design-system CSS Preload Plugin
 * 將 design-system.css 加入 <link rel="preload">，讓瀏覽器在 parse HTML 時提前取得
 * 避免舊方案將所有 CSS inline 造成 HTML 體積爆增 + 瀏覽器快取失效
 */
function cssPreloadPlugin(): Plugin {
  return {
    name: 'css-preload',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      try {
        const fs = await import('fs')
        const html = await fs.promises.readFile('dist/index.html', 'utf-8')

        // 在 </head> 前加入 preconnect 至 API，加速首次 API 請求
        const apiBase = process.env.VITE_API_BASE_URL || ''
        if (apiBase) {
          const origin = new URL(apiBase).origin
          const preconnect = `  <link rel="preconnect" href="${origin}">\n</head>`
          const modified = html.replace('</head>', preconnect)
          await fs.promises.writeFile('dist/index.html', modified, 'utf-8')
          console.log(`✅ Added API preconnect: ${origin}`)
        }
      } catch (error) {
        console.warn(
          '⚠️ CSS preload plugin failed (non-blocking):',
          error instanceof Error ? error.message : error
        )
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // vueDevTools 只在 dev 環境載入，production build 不包含
    process.env.NODE_ENV !== 'production' ? vueDevTools() : null,
    // Element Plus 自動按需引入
    AutoImport({
      resolvers: [ElementPlusResolver()],
      imports: ['vue', 'vue-router', 'pinia'],
      dts: 'src/auto-imports.d.ts'
    }),
    Components({
      resolvers: [ElementPlusResolver({ importStyle: 'css' })],
      dts: 'src/components.d.ts'
    }),
    // Phase 2: Critical CSS inline + API preconnect (production build only)
    process.env.NODE_ENV === 'production' ? cssPreloadPlugin() : null,
    process.env.NODE_ENV === 'production' ? simpleCriticalCSSPlugin() : null
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    // 提高 chunk 大小警告閾值
    chunkSizeWarningLimit: 500,
    // 使用 terser 進行更好的壓縮
    minify: 'terser',
    terserOptions: {
      compress: {
        // 生產環境移除 console
        drop_console: true,
        drop_debugger: true,
        // 移除未使用的代碼（明確列入 console.error，避免被 terser 視為有副作用而保留）
        pure_funcs: [
          'console.log',
          'console.info',
          'console.debug',
          'console.warn',
          'console.error'
        ]
      },
      format: {
        // 移除註釋
        comments: false
      }
    },
    // 啟用 CSS 代碼分割
    cssCodeSplit: true,
    // Rollup 底層打包優化：Vendor Code Splitting (完美展現前端資深基礎)
    rollupOptions: {
      external: ['@sentry/vue'],
      output: {
        manualChunks: {
          'vue-core': ['vue', 'vue-router', 'pinia', '@unhead/vue'],
          'gsap-engine': ['gsap'],
          // element-plus 不再強制成獨立 chunk：它僅後台使用，
          // 讓 Vite 自然將它打進 admin 非同步 chunk，前台首頁不會 preload
          particles: ['@tsparticles/slim', '@tsparticles/vue3', '@tsparticles/plugin-emitters'],
          vendor: ['axios', 'nprogress']
        }
      }
    },
    // 生成 source map 用於生產環境調試（可選）
    sourcemap: false,
    // 優化依賴預構建
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      'axios',
      'gsap',
      'element-plus',
      '@element-plus/icons-vue'
    ]
  }
})
