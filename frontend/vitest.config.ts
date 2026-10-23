import { fileURLToPath } from 'node:url'
import { mergeConfig, defineConfig } from 'vitest/config'
import viteConfig from './vite.config'

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'happy-dom',
      globals: true,
      root: fileURLToPath(new URL('./', import.meta.url)),
      include: ['src/**/*.{test,spec}.{js,ts}'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,vue}'],
        exclude: [
          'src/**/*.d.ts',
          'src/main.ts',
          'src/auto-imports.d.ts',
          'src/components.d.ts',
          'src/**/*.spec.ts',
          'src/**/*.test.ts'
        ]
      },
      setupFiles: ['./src/__tests__/setup.ts']
    }
  })
)
