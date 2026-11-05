/**
 * 零依賴輕量 Toast 提示
 *
 * 取代 client.ts 對 element-plus ElMessage 的依賴，讓前台首頁完全不需載入
 * element-plus（~313KB gzip）。樣式融入 Dune 暗色主題，並支援無障礙播報。
 */
type ToastType = 'error' | 'success' | 'warning' | 'info'

const ACCENT: Record<ToastType, string> = {
  error: '#f56c6c',
  success: '#67c23a',
  warning: '#e6a23c',
  info: '#909399'
}

export function toast(type: ToastType, message: string, duration = 3000): void {
  if (typeof document === 'undefined' || !message) return

  const el = document.createElement('div')
  el.textContent = message
  el.setAttribute('role', type === 'error' ? 'alert' : 'status')
  el.setAttribute('aria-live', type === 'error' ? 'assertive' : 'polite')
  el.style.cssText = [
    'position:fixed',
    'top:24px',
    'left:50%',
    'transform:translateX(-50%) translateY(-12px)',
    'z-index:99999',
    'padding:12px 20px',
    'border-radius:4px',
    `border-left:3px solid ${ACCENT[type]}`,
    'background:rgba(16,12,10,0.95)',
    'color:#f0e6d2',
    "font-family:'DM Sans',-apple-system,sans-serif",
    'font-size:14px',
    'line-height:1.4',
    'box-shadow:0 8px 24px rgba(0,0,0,0.4)',
    'backdrop-filter:blur(8px)',
    'max-width:90vw',
    'opacity:0',
    'transition:opacity .3s ease,transform .3s ease',
    'pointer-events:none'
  ].join(';')

  document.body.appendChild(el)

  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateX(-50%) translateY(0)'
  })

  window.setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateX(-50%) translateY(-12px)'
    window.setTimeout(() => el.remove(), 300)
  }, duration)
}
