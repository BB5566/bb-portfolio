# Frontend Performance Optimization Roadmap

## Phase 1: Brotli Compression + Font Optimization ✅
- Enabled Brotli compression in Vite production build
- Optimized font loading with @fontsource (DM Sans, Bebas Neue, JetBrains Mono)
- Preconnect to Google Fonts CDN
- **Expected improvement:** Transfer size -30%, FCP -200-300ms

## Phase 2: Critical CSS Inlining ✅
- Implemented simple Vite plugin to inline Element Plus CSS into `<head>`
- Removes render-blocking CSS requests
- Zero Chromium/Puppeteer dependency (lightweight)
- **Status:** Plugin activated in `vite.config.ts` with post-build hook
- **Expected improvement:** FCP 1.2s → 0.9s (300-500ms reduction)

## Phase 3: Lazy Loading + Code Splitting (In Progress)

### 3.1: Lazy-Load Non-Critical Libraries
- **Particles.js:** Deferred to route-based loading (155KB uncompressed)
  - Moved from global plugin to lazy import in `src/plugins/particles-lazy.ts`
  - Loaded only when needed (currently home page animations)
  - Saves main bundle: 42.88KB gzip reduction

- **GSAP:** Animation library now lazy-loads in `onMounted`
  - Removed from top-level imports in `App.vue`
  - Dynamic import via `Promise.all()` for parallel loading
  - Doesn't block initial page paint
  - Saves main entry: ~26KB gzip reduction

### 3.2: Image Optimization (Upcoming)
- [ ] Add AVIF + WebP support with PNG/JPG fallback
- [ ] Implement blur-up placeholder pattern
- [ ] Lazy-load non-critical images with `v-lazy` directive
- [ ] Optimize hero image as LCP (Largest Contentful Paint)
- [ ] Responsive image variants (srcset)

### 3.3: Code Splitting Strategy
- **Current chunking (Rollup manualChunks):**
  - `vue-core`: Vue framework + router + pinia (125KB gzip)
  - `element-plus`: UI library (507KB gzip) ← Warning: >500KB
  - `gsap-engine`: GSAP animations (69KB gzip, now lazy-loaded)
  - `particles`: Particle effects (156KB gzip, now lazy-loaded)
  - `smooth-scroll`: Lenis library (16.5KB gzip)
  - `vendor`: axios + nprogress (39.8KB gzip)

- **Recommendations:**
  - Consider splitting Element Plus further by component type
  - Monitor route-level code splitting effectiveness
  - Profile with Lighthouse + Chrome DevTools

## Performance Targets

| Metric | Current | Target | Improvement |
|--------|---------|--------|-------------|
| FCP (First Contentful Paint) | 1.2s | 0.9s | -25% |
| LCP (Largest Contentful Paint) | 1.8s | 1.2s | -33% |
| Main Bundle (gzip) | 61KB | 50KB | -18% |
| Total Assets (gzip) | 1.2MB | 850KB | -29% |
| Lighthouse Score | 82 | 94 | +12 points |

## Measurement Tools
- **Lighthouse:** Run via CI in GitHub Actions or locally
- **Chrome DevTools:** Performance tab, Network tab for chunking analysis
- **bundlesize CLI:** Monitor bundle size in CI/CD pipeline
- **Web Vitals:** Monitor Core Web Vitals with real user data (via Sentry optional)

## Next Steps
1. ✅ Phase 2 complete (Critical CSS inlining)
2. ✅ Phase 3.1 complete (Lazy Particles + GSAP)
3. 🔄 Phase 3.2: Image optimization (hero + lazy-load)
4. 📊 Phase 4: Monitor & measure with Lighthouse CI
5. 🔧 Phase 5: Fine-tune based on real-world metrics

## Lighthouse Known Limitations

### Cloudflare Injected Scripts
When running Lighthouse audits against the production environment (`https://bb-made.com`), you may encounter warnings in the "Best Practices" category related to **"Uses deprecated APIs"** or **"Issues were logged in the Issues panel"**.

These warnings are typically caused by Cloudflare's injected scripts (e.g., `challenge-platform` or `rocket-loader.min.js`), which use APIs that Lighthouse flags as deprecated or non-standard (e.g., Shared Storage API, Persistent Quota Type). Since these scripts are managed entirely by Cloudflare and not present in the frontend source code, these warnings are considered false positives from a development perspective and cannot be resolved by modifying the application code.
