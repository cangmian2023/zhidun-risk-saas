// 催贷管理子系统 · 共享 UI 原语（与 dm/ep 框架统一：PageShell 吸顶 + 蓝色主色 + 无 fixed 全屏覆盖）
import { ReactNode, useEffect, useRef } from 'react'
import * as echarts from 'echarts'
import { PageShell } from './PageShell'

export function EChart({ option, height = 300 }: { option: echarts.EChartsOption; height?: number }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const inst = echarts.init(ref.current)
    inst.setOption(option)
    const onResize = () => inst.resize()
    window.addEventListener('resize', onResize)
    return () => { window.removeEventListener('resize', onResize); inst.dispose() }
  }, [option])
  return <div ref={ref} style={{ width: '100%', height }} />
}

export const BLUE = '#1677ff'

export function ZzPage({ title, crumb, subtitle, actions, children, max = 1680 }: {
  title: string; crumb: string; subtitle?: string; actions?: ReactNode; children: ReactNode; max?: number
}) {
  return (
    <div style={{ padding: 24, maxWidth: max, margin: '0 auto' }}>
      <PageShell title={title} crumb={crumb} subtitle={subtitle} actions={actions} legend={false} />
      {children}
    </div>
  )
}

export function ZzCard({ title, extra, children, bodyClass, onTitleClick, className }: { title?: ReactNode; extra?: ReactNode; children: ReactNode; bodyClass?: string; onTitleClick?: () => void; className?: string }) {
  return (
    <div className={(className ?? '') + ' mb-4 rounded border bg-white'}>
      {title !== undefined && (
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className={'font-medium' + (onTitleClick ? ' cursor-pointer text-[#1677ff] hover:underline' : '')} onClick={onTitleClick}>{title}</span>
          {extra}
        </div>
      )}
      <div className={bodyClass ?? 'p-4'}>{children}</div>
    </div>
  )
}

export function ZzStat({ label, value, sub, accent, tip }: { label: string; value: ReactNode; sub?: ReactNode; accent?: string; tip?: string }) {
  return (
    <div className="min-w-[170px] flex-1 rounded border bg-white px-4 py-3" title={tip}>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold" style={{ color: accent ?? '#111827' }}>{value}</div>
      {sub && <div className="mt-1 text-xs text-gray-400">{sub}</div>}
    </div>
  )
}

export function ZzBadge({ color = BLUE, children }: { color?: string; children: ReactNode }) {
  return <span className="inline-flex items-center rounded px-2 py-0.5 text-xs" style={{ background: color + '1a', color }}>{children}</span>
}

export function ZzBtn({ primary, onClick, children, disabled, sm, danger }: {
  primary?: boolean; onClick?: () => void; children: ReactNode; disabled?: boolean; sm?: boolean; danger?: boolean
}) {
  const base = `rounded text-sm ${sm ? 'px-2 py-1' : 'px-3 py-1.5'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`
  if (danger) return <button onClick={onClick} disabled={disabled} className={`${base} border border-red-300 text-red-600`}>{children}</button>
  if (primary) return <button onClick={onClick} disabled={disabled} className={`${base} text-white`} style={{ background: BLUE }}>{children}</button>
  return <button onClick={onClick} disabled={disabled} className={`${base} border border-slate-300 text-gray-700`}>{children}</button>
}

export function ZzModal({ open, title, onClose, children, width = 760, footer }: {
  open: boolean; title: ReactNode; onClose: () => void; children: ReactNode; width?: number; footer?: ReactNode
}) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.38)', zIndex: 1000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '48px 16px' }} onClick={onClose}>
      <div style={{ background: '#fff', borderRadius: 10, width: '100%', maxWidth: width, maxHeight: '86vh', display: 'flex', flexDirection: 'column', boxShadow: '0 12px 40px rgba(0,0,0,.18)' }} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-medium">{title}</span>
          <button onClick={onClose} className="text-gray-400 text-xl leading-none hover:text-gray-600">×</button>
        </div>
        <div style={{ overflow: 'auto', padding: 16 }}>{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t px-4 py-3">{footer}</div>}
      </div>
    </div>
  )
}

export function ZzTabs({ tabs, active, onChange }: { tabs: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="mb-4 flex gap-1 border-b border-slate-200">
      {tabs.map((t) => (
        <button key={t} onClick={() => onChange(t)} className={`-mb-px border-b-2 px-3 py-2 text-sm ${active === t ? 'border-[#1677ff] font-medium text-[#1677ff]' : 'border-transparent text-gray-600 hover:text-gray-900'}`}>{t}</button>
      ))}
    </div>
  )
}

export function ZzTable({ head, rows, onRow, rowKey }: {
  head: string[]; rows: ReactNode[][]; onRow?: (i: number) => void; rowKey?: (i: number) => string
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-[#f7f8fc]">
          <tr>
            {head.map((h, i) => <th key={i} className="border px-3 py-2 text-left font-medium text-gray-600">{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={rowKey ? rowKey(i) : i} onClick={onRow ? () => onRow(i) : undefined} className={`hover:bg-slate-50 ${onRow ? 'cursor-pointer' : ''}`}>
              {r.map((c, j) => <td key={j} className="border px-3 py-2 align-top">{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function ZzField({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={'flex flex-col gap-1' + (className ? ' ' + className : '')}>
      <span className="text-xs text-gray-500">{label}</span>
      {children}
    </label>
  )
}

export const ZzInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={`rounded border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-[#1677ff] ${props.className ?? ''}`} />
)
export const ZzSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={`rounded border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-[#1677ff] ${props.className ?? ''}`} />
)
export const ZzTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} className={`rounded border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-[#1677ff] ${props.className ?? ''}`} />
)

// 通用筛选行
export function ZzFilterBar({ children }: { children: ReactNode }) {
  return <div className="mb-4 flex flex-wrap items-end gap-3 rounded border bg-white p-3">{children}</div>
}
