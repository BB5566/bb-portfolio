/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_GA_MEASUREMENT_ID?: string
  readonly VITE_USE_ZARAZ?: string
  // 更多自行定義的變數可往這裡加
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
