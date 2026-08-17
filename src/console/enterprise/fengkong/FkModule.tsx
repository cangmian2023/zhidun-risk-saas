// 风控中心分发器：base 形如 fk-xxx → 加载 ./pages/xxx.tsx
import React, { Suspense } from 'react'
import { EpErrorBoundary, EpPlaceholder } from '../epCommon'

const pages = import.meta.glob('./pages/*.tsx') as Record<string, () => Promise<{ default: React.ComponentType<{ params: URLSearchParams }> }>>

export function FkModule({ base, params }: { base: string; params: URLSearchParams }) {
  const key = base.replace(/^fk-/, '')
  const file = `./pages/${key}.tsx`
  const imp = pages[file]
  if (!imp) return <EpPlaceholder name={base} />
  const Comp = React.lazy(imp)
  return (
    <EpErrorBoundary name={base}>
      <Suspense fallback={<div style={{ padding: 32, color: '#94A3B8' }}>加载中…</div>}>
        <Comp params={params} />
      </Suspense>
    </EpErrorBoundary>
  )
}
