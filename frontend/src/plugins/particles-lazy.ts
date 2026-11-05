import { log } from '@/utils/logger'
import type { App } from 'vue'
import type { Engine } from '@tsparticles/engine'

/**
 * Lazy-load Particles plugin
 * Defers particles library loading until it's actually needed
 * This removes ~155KB (gzip 42KB) from the main bundle
 */
let particlesLoaded = false

export default {
  async install(app: App) {
    if (particlesLoaded) return

    try {
      const [{ default: Particles }, { loadSlim }, { loadEmittersPlugin }] = await Promise.all([
        import('@tsparticles/vue3'),
        import('@tsparticles/slim'),
        import('@tsparticles/plugin-emitters')
      ])

      // Register the plugin with engine initialization
      app.use(Particles, {
        init: async (engine: Engine) => {
          await loadSlim(engine)
          await loadEmittersPlugin(engine)
        }
      })

      particlesLoaded = true
    } catch (error) {
      log.error('Failed to load Particles plugin:', error)
    }
  }
}
