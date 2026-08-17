// 企业风控子系统（风控中心 / 尽调中心 / 企业档案）· 共享脚手架
// 统一：① PageShell 外壳 + 三色来源图例 ② 本地样例 JSON 读写（/api/load-mid /api/save-mid）
//       ③ 错误边界（单页崩溃不影响整个子系统）④ 常用卡片 / 统计块 / 标签 / 筛选条
import React, { useEffect, useRef, useState, type ReactNode } from 'react'
import { PageShell } from '../PageShell'
import { Sam, Cfg, Cal, type SourceKind } from '../SourceTag'
import { DataTable, Panel } from '../../components/ui'

export { DataTable, Panel }

/* ---------------- 错误边界（防止单页语法/运行时错误拖垮整个 ep 子系统） ---------------- */
export class EpErrorBoundary extends React.Component<{ children: ReactNode; name?: string }, { err: Error | null }> {
  state = { err: null as Error | null }
  static getDerivedStateFromError(err: Error) {
    return { err }
  }
  componentDidCatch(err: Error) {
    // 仅打印，不阻断其它页面
    console.error('[ep page error]', this.props.name, err)
  }
  render() {
    if (this.state.err) {
      return (
        <div style={{ padding: 40, textAlign: 'center', color: '#B91C1C' }}>
          <div style={{ fontSize: 15, fontWeight: 600 }}>页面渲染出错（{this.props.name}）</div>
          <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8' }}>{String(this.state.err.message)}</div>
        </div>
      )
    }
    return this.props.children
  }
}

/* ---------------- 页面外壳（标题 + 三色图例 + 内容容器） ---------------- */
export function EpPage({
  title,
  subtitle,
  crumb,
  actions,
  children,
  maxWidth = 1180,
}: {
  title: string
  subtitle?: string
  crumb?: string
  actions?: ReactNode
  children: ReactNode
  maxWidth?: number
}) {
  return (
    <div style={{ padding: '24px 24px 60px', maxWidth }}>
      <PageShell title={title} subtitle={subtitle} crumb={crumb} actions={actions} />
      <div style={{ marginTop: 18 }}>{children}</div>
    </div>
  )
}

/* ---------------- 本地样例 JSON（橘 Sam） ----------------
 * 首屏用 seed 渲染；挂载后尝试从磁盘读取（不存在则保持 seed）；save 时落盘。
 * 文件直接放 src/console/ 根（vite 中间件只解析该目录下的 .json）。
 */
export function useSample<T>(file: string, seed: T): [T, (d: T) => void] {
  const [data, setData] = useState<T>(seed)
  const loaded = useRef(false)
  useEffect(() => {
    if (loaded.current) return
    loaded.current = true
    fetch(`/api/load-mid?file=${encodeURIComponent(file)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setData(d as T)
      })
      .catch(() => {})
  }, [file])
  const save = (d: T) => {
    setData(d)
    fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d, null, 1),
    }).catch(() => {})
  }
  return [data, save]
}

/* ---------------- 来源标签便捷封装 ---------------- */
export const SrcSam = (p: { value?: string }) => <Sam {...p} />
export const SrcCfg = (p: { value?: string }) => <Cfg {...p} />
export const SrcCal = (p: { value?: string }) => <Cal {...p} />

/* ---------------- 卡片 ---------------- */
export function EpCard({
  title,
  desc,
  actions,
  children,
  className = '',
  pad = true,
}: {
  title?: ReactNode
  desc?: ReactNode
  actions?: ReactNode
  children: ReactNode
  className?: string
  pad?: boolean
}) {
  return (
    <section className={`rounded-2xl border border-slate-100 bg-white shadow-card ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
          <div>
            {title && <div className="text-[15px] font-semibold text-slate-800">{title}</div>}
            {desc && <div className="mt-0.5 text-xs text-slate-400">{desc}</div>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={pad ? 'p-5' : ''}>{children}</div>
    </section>
  )
}

/* ---------------- 统计块 ---------------- */
export function EpStat({ label, value, sub, accent }: { label: string; value: ReactNode; sub?: ReactNode; accent?: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white px-4 py-3">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-2xl font-bold" style={{ color: accent ?? '#0F172A' }}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-slate-400">{sub}</div>}
    </div>
  )
}

/* ---------------- 标签 ---------------- */
export function EpTag({ children, color = '#1D4ED8', bg = '#EFF6FF' }: { children: ReactNode; color?: string; bg?: string }) {
  return (
    <span
      style={{ color, background: bg, border: `1px solid ${bg}` }}
      className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium"
    >
      {children}
    </span>
  )
}

/* ---------------- 按钮 ---------------- */
export function EpBtn({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled,
  style,
}: {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'default' | 'ghost' | 'danger'
  size?: 'sm' | 'md'
  disabled?: boolean
  style?: React.CSSProperties
}) {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: '#2563EB', color: '#fff', border: '1px solid #2563EB' },
    default: { background: '#fff', color: '#334155', border: '1px solid #CBD5E1' },
    ghost: { background: 'transparent', color: '#475569', border: '1px solid transparent' },
    danger: { background: '#DC2626', color: '#fff', border: '1px solid #DC2626' },
  }
  const pad = size === 'sm' ? '3px 10px' : '7px 16px'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      style={{
        ...styles[variant],
        padding: pad,
        borderRadius: 8,
        fontSize: size === 'sm' ? 12 : 13,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        ...style,
      }}
    >
      {children}
    </button>
  )
}

/* ---------------- 抽屉（右侧，展示型，不遮罩） ---------------- */
export function EpDrawer({ open, onClose, title, width = 560, children }: {
  open: boolean
  onClose: () => void
  title?: ReactNode
  width?: number
  children: ReactNode
}) {
  if (!open) return null
  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'transparent', pointerEvents: 'none', zIndex: 40 }} />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width,
          maxWidth: '92vw',
          background: '#fff',
          boxShadow: '-8px 0 30px rgba(0,0,0,.12)',
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          pointerEvents: 'auto',
        }}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="text-[15px] font-semibold text-slate-800">{title}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#94A3B8' }}>
            ×
          </button>
        </div>
        <div className="flex-1 overflow-auto p-5">{children}</div>
      </div>
    </>
  )
}

/* ---------------- 占位（未建页面） ---------------- */
export function EpPlaceholder({ name }: { name: string }) {
  return (
    <EpPage title={name}>
      <div style={{ padding: 60, textAlign: 'center', color: '#94A3B8' }}>
        <div style={{ fontSize: 14 }}>「{name}」页面建设中</div>
        <div style={{ marginTop: 6, fontSize: 12 }}>该页面已在菜单登记，后续批次实现</div>
      </div>
    </EpPage>
  )
}

export type { SourceKind }
