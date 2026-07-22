// 轻量全局能力 hook（无需 Provider）
// 目前提供 flash：一次性 toast 提示，直接注入 DOM，自包含无依赖
import { useCallback } from 'react'

function showFlash(message: string) {
  if (typeof document === 'undefined') return
  const el = document.createElement('div')
  el.textContent = message
  el.style.cssText = [
    'position:fixed',
    'left:50%',
    'bottom:24px',
    'transform:translateX(-50%)',
    'z-index:9999',
    'max-width:80vw',
    'padding:10px 16px',
    'border-radius:12px',
    'background:#0f172a',
    'color:#fff',
    'font-size:14px',
    'line-height:1.4',
    'box-shadow:0 10px 25px rgba(15,23,42,.25)',
    'opacity:0',
    'transition:opacity .2s ease, transform .2s ease',
    'pointer-events:none',
  ].join(';')
  document.body.appendChild(el)
  // 进入动画
  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateX(-50%) translateY(-4px)'
  })
  // 退出并移除
  window.setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateX(-50%)'
    window.setTimeout(() => el.remove(), 250)
  }, 2000)
}

export function useModule() {
  const flash = useCallback((message: string) => showFlash(message), [])
  return { flash }
}
