// 决策引擎 · 统一轻提示钩子（复用项目底部浮动 toast 模式）
import { useState, useCallback } from 'react'

export function useDecisionToast() {
  const [toast, setToast] = useState<string | null>(null)
  const show = useCallback((msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(null), 2000)
  }, [])

  const toastEl = toast ? (
    <div className="pointer-events-none fixed bottom-6 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm text-white shadow-lg">
      {toast}
    </div>
  ) : null

  return { show, toastEl }
}
