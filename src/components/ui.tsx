import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { SourceTag } from '../console/SourceTag'

/* ---------- Page header ---------- */
export function PageHeader({
  title,
  subtitle,
  actions,
  crumb,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  crumb?: string
}) {
  return (
    <div className="sticky top-14 z-30 -mx-4 border-b border-slate-100 bg-slate-50 px-4 pb-5 pt-1 lg:-mx-8 lg:px-8">
      {/* 第一行：面包屑（与详情页 DetailHeader 一致，放最上面） */}
      {crumb && <div className="text-xs text-slate-400">{crumb}</div>}
      {/* 第二行：标题 + 右侧操作 */}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
          {subtitle && <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">{subtitle}</p>}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </div>
  )
}

/* ---------- Panel ---------- */
export function Panel({
  title,
  desc,
  note,
  actions,
  children,
  id,
  className = '',
  hoverTip,
}: {
  title?: string
  desc?: string | ReactNode
  note?: string
  actions?: ReactNode
  children: ReactNode
  id?: string
  className?: string
  hoverTip?: string // 需求38：标题旁问号角标，鼠标移入显示组件说明
}) {
  return (
    <section id={id} className={`scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-5 shadow-card ${className}`}>
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              {title && (typeof title === 'string' ? <h3 className="text-base font-semibold text-ink-900">{title}</h3> : <h3 className="text-base font-semibold text-ink-900">{title}</h3>)}
              {hoverTip && (
                <span className="group relative inline-flex h-4 w-4 cursor-help items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">
                  ?
                  <span className="pointer-events-none absolute left-1/2 top-full z-40 mt-1.5 w-52 -translate-x-1/2 whitespace-normal rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs font-normal leading-relaxed text-slate-600 opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    {hoverTip}
                  </span>
                </span>
              )}
            </div>
            {desc && <p className="mt-0.5 text-xs text-slate-400">{desc}</p>}
          </div>
          {actions}
        </div>
      )}
      {note && (
        <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs leading-relaxed text-brand-800">
          💡 {note}
        </div>
      )}
      {children}
    </section>
  )
}

/* ---------- Info cell（详情页顶部紧凑元信息条） ---------- */
export function InfoCell({
  label,
  value,
  icon,
  tag,
}: {
  label: ReactNode
  value: ReactNode
  icon?: ReactNode
  tag?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-card">
      {icon && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-50 text-slate-400">{icon}</span>}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-slate-400">{label}</span>
          {tag}
        </div>
        <div className="mt-0.5 truncate text-sm font-semibold text-ink-900">{value}</div>
      </div>
    </div>
  )
}

/* ---------- Stat card ---------- */
export function StatCard({
  label,
  value,
  delta,
  deltaType,
  hint,
  accent = 'brand',
}: {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'flat'
  hint?: ReactNode
  accent?: 'brand' | 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose'
}) {
  const accents: Record<string, string> = {
    brand: 'text-brand-600',
    cyan: 'text-cyan-600',
    violet: 'text-violet-600',
    amber: 'text-amber-600',
    emerald: 'text-emerald-600',
    rose: 'text-rose-600',
  }
  const deltaColor =
    deltaType === 'up' ? 'text-emerald-600' : deltaType === 'down' ? 'text-rose-600' : 'text-slate-400'
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold tabular-nums ${accents[accent]}`}>{value}</p>
      <div className="mt-1.5 flex items-center gap-2 text-xs">
        {delta && <span className={`font-medium ${deltaColor}`}>{delta}</span>}
        {hint && <span className="text-slate-400">{hint}</span>}
      </div>
    </div>
  )
}

/* ---------- DetailHeader（详情页通用：固定顶部 + 返回） ---------- */
export function DetailHeader({
  title,
  crumb,
  subtitle,
  backLabel,
  onBack,
  actions,
  id,
  flowBar,
}: {
  title: ReactNode
  crumb?: string
  subtitle?: ReactNode
  backLabel?: string
  onBack?: () => void
  actions?: ReactNode
  id?: string
  flowBar?: ReactNode // 需求21：流程操作行（面包屑下方，保存/流程按钮/状态标签）
}) {
  return (
    <div id={id} className="sticky top-14 z-30 -mx-4 bg-slate-50 px-4 pb-4 pt-1 lg:-mx-8 lg:px-8">
      {/* 第一行：返回按钮 + 面包屑 */}
      <div className="flex flex-wrap items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100"
          >
            {backLabel ?? '← 返回'}
          </button>
        )}
        {crumb && <span className="text-xs text-slate-400">{crumb}</span>}
      </div>
      {/* 流程操作行（面包屑下方一行，需求21） */}
      {flowBar}
      {/* 第二行：标题 + 右侧操作按钮 */}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-bold text-ink-900">{title}</h1>
          {subtitle && <div className="mt-0.5 text-xs text-slate-400">{subtitle}</div>}
        </div>
        {actions && <div className="flex flex-wrap items-center justify-end gap-2">{actions}</div>}
      </div>
    </div>
  )
}

/* ---------- Badge ---------- */
const badgeStyles: Record<string, string> = {
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  blue: 'bg-brand-50 text-brand-700 ring-brand-200',
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  violet: 'bg-violet-50 text-violet-700 ring-violet-200',
  gray: 'bg-slate-100 text-slate-600 ring-slate-200',
}
export function Badge({ kind = 'gray', children, className }: { kind?: keyof typeof badgeStyles; children: ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${badgeStyles[kind]} ${className ?? ''}`}>
      {children}
    </span>
  )
}

/* ---------- 决策结果标签（实色填充胶囊，与审核状态标签区分体系） ---------- */
const decisionFills: Record<string, string> = {
  red: 'bg-rose-600 text-white',
  orange: 'bg-orange-500 text-white',
  amber: 'bg-amber-500 text-white',
  green: 'bg-emerald-600 text-white',
  blue: 'bg-brand-600 text-white',
  cyan: 'bg-cyan-600 text-white',
  violet: 'bg-violet-600 text-white',
  gray: 'bg-slate-500 text-white',
}
const decisionSoft: Record<string, string> = {
  red: 'bg-rose-50 text-rose-600 ring-rose-200',
  orange: 'bg-orange-50 text-orange-600 ring-orange-200',
  amber: 'bg-amber-50 text-amber-600 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  blue: 'bg-slate-100 text-slate-500 ring-slate-200',
  cyan: 'bg-cyan-50 text-cyan-600 ring-cyan-200',
  violet: 'bg-violet-50 text-violet-600 ring-violet-200',
  gray: 'bg-slate-100 text-slate-500 ring-slate-200',
}
export function DecisionTag({ kind = 'gray', soft = false, children }: { kind?: keyof typeof badgeStyles; soft?: boolean; children: ReactNode }) {
  if (soft) {
    return (
      <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${decisionSoft[kind]}`}>
        {children}
      </span>
    )
  }
  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${decisionFills[kind]}`}>
      {children}
    </span>
  )
}

/* ---------- 审核状态标签（浅底描边 + 前置圆点，体系区别于决策结果） ---------- */
const statusDots: Record<string, string> = {
  red: 'bg-rose-500',
  orange: 'bg-orange-500',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
  blue: 'bg-brand-500',
  cyan: 'bg-cyan-500',
  violet: 'bg-violet-500',
  gray: 'bg-slate-400',
}
export function StatusTag({ kind = 'gray', children }: { kind?: keyof typeof badgeStyles; children: ReactNode }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-medium ${badgeStyles[kind]}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${statusDots[kind]}`} />
      {children}
    </span>
  )
}

/* ---------- Progress ---------- */
export function ProgressBar({ value, color = 'bg-brand-500' }: { value: number; color?: string }) {
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  )
}

/* ---------- Data table ---------- */
export type ColType =
  | 'text'
  | 'mask-name'
  | 'mask-id'
  | 'mask-phone'
  | 'money'
  | 'number'
  | 'percent'
  | 'datetime'
  | 'badge'
  | 'progress'
  | 'score'

export interface Column {
  key: string
  label: string
  type?: ColType
  width?: string
  badgeKind?: string
  progressColor?: string
  align?: 'left' | 'right' | 'center'
  hint?: string
  render?: (r: Row) => ReactNode  // 需求14：列级自定义渲染（整行传入），优先于 type
  fixed?: 'left' | 'right'  // 需求15：固定列（左/右侧粘住，右侧自动让出操作列宽度）
  tag?: 'cfg' | 'sample' | 'calc' | { kind: 'cfg' | 'sample' | 'calc'; value: string }
}

export interface BadgeVal {
  v: string
  kind: string
}
export type CellVal = string | number | ReactNode | BadgeVal
export interface Row {
  id: string
  [k: string]: CellVal
}

export function DataTable({
  columns,
  rows,
  empty = '暂无数据',
  clickableKey,
  onCellClick,
  actions,
  pager = false,
  defaultPageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
}: {
  columns: Column[]
  rows: Row[]
  empty?: string
  clickableKey?: string
  onCellClick?: (row: Row) => void
  actions?: (row: Row) => ReactNode
  pager?: boolean
  defaultPageSize?: number
  pageSizeOptions?: number[]
}) {
  const [page, setPage] = useState(1);
  const [ps, setPs] = useState<number>(defaultPageSize);
  // 需求15：右侧固定列需要知道操作列宽度（right 偏移）
  const actionsRef = useRef<HTMLTableCellElement>(null)
  const [actionsW, setActionsW] = useState(0)
  useLayoutEffect(() => {
    if (actionsRef.current) setActionsW(actionsRef.current.offsetWidth)
  }, [actions, rows])
  const total = rows.length;
  const totalPages = pager ? Math.max(1, Math.ceil(total / ps)) : 1;
  const curPage = pager ? Math.min(page, totalPages) : 1;
  const view = pager ? rows.slice((curPage - 1) * ps, curPage * ps) : rows;
  useEffect(() => { setPage(1); }, [rows, ps]); // 数据或每页条数变化时回到第一页

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-medium uppercase tracking-wide text-slate-400">
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={`whitespace-nowrap px-3 py-3 bg-white ${c.fixed === 'left' || i === 0 ? 'sticky left-0 z-20' : ''} ${c.fixed === 'right' ? 'sticky z-20' : ''}`}
                  style={{ width: c.width, textAlign: c.align ?? 'left', ...(c.fixed === 'right' ? { right: actionsW } : {}) }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{c.label}</span>
                    {c.tag && <ColumnTag tag={c.tag} />}
                  </div>
                </th>
              ))}
              {actions && (
                <th ref={actionsRef} className="whitespace-nowrap px-3 py-3 bg-white sticky right-0 z-20 text-left">操作</th>
              )}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-3 py-10 text-center text-sm text-slate-400">
                  {empty}
                </td>
              </tr>
            ) : (
              view.map((r) => (
                <tr key={r.id} className="group border-b border-slate-50 transition hover:bg-slate-50/60">
                  {columns.map((c, i) => {
                    const clickable = !!clickableKey && c.key === clickableKey
                    return (
                      <td
                        key={c.key}
                        className={`whitespace-nowrap px-3 py-3 text-slate-600 ${c.fixed === 'left' || i === 0 ? 'sticky left-0 z-10 bg-white group-hover:bg-slate-50/60' : ''} ${c.fixed === 'right' ? 'sticky z-10 bg-white group-hover:bg-slate-50/60' : ''}`}
                        style={{ textAlign: c.align ?? 'left', ...(c.fixed === 'right' ? { right: actionsW } : {}) }}
                      >
                        {clickable ? (
                          <button
                            type="button"
                            onClick={() => onCellClick?.(r)}
                            className="font-medium text-brand-600 hover:underline"
                          >
                            {renderCell(r, c)}
                          </button>
                        ) : (
                          renderCell(r, c)
                        )}
                      </td>
                    )
                  })}
                  {actions && (
                    <td className="whitespace-nowrap px-3 py-3 text-left sticky right-0 z-10 bg-white group-hover:bg-slate-50/60">
                      {actions(r)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pager && total > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>每页显示</span>
            <select value={ps} onChange={(e) => setPs(Number(e.target.value))}
              style={{ height: 30, border: '1px solid #CBD5E1', borderRadius: 6, padding: '0 6px', fontSize: 12, background: '#fff' }}>
              {pageSizeOptions.map((o) => <option key={o} value={o}>{o} 行</option>)}
            </select>
            <span>共 {total} 条</span>
          </div>
          <div className="flex items-center gap-2">
            <span>第 {curPage} / {totalPages} 页</span>
            <button type="button" disabled={curPage <= 1} onClick={() => setPage(curPage - 1)}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: curPage <= 1 ? '#F1F5F9' : '#fff', color: curPage <= 1 ? '#94A3B8' : '#334155', cursor: curPage <= 1 ? 'not-allowed' : 'pointer' }}>
              上一页
            </button>
            <button type="button" disabled={curPage >= totalPages} onClick={() => setPage(curPage + 1)}
              style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: curPage >= totalPages ? '#F1F5F9' : '#fff', color: curPage >= totalPages ? '#94A3B8' : '#334155', cursor: curPage >= totalPages ? 'not-allowed' : 'pointer' }}>
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// 列级来源标签：渲染在表头（每列一次），避免每个单元格重复堆叠标签
function ColumnTag({ tag }: { tag: Column['tag'] }) {
  if (!tag) return null;
  if (typeof tag === 'string') return <SourceTag kind={tag} />;
  return <SourceTag kind={tag.kind} value={tag.value} />;
}

function renderCell(r: Row, c: Column) {
  const v = r[c.key]
  const t = c.type ?? 'text'
  // 列级自定义渲染（需求14）：整行传入，优先于 type
  if (c.render) return c.render(r)
  // 稳健兜底：只要值是 { v, kind } 形态的徽标对象，无论列是否声明 type:'badge' 都按徽标渲染，
  // 避免把对象直接作为 React 子节点导致整页白屏。
  if (typeof v === 'object' && v !== null && 'kind' in v && 'v' in v) {
    const b = v as BadgeVal
    return <Badge kind={(b.kind as keyof typeof badgeStyles) ?? 'gray'}>{b.v}</Badge>
  }
  if (t === 'badge') {
    return <Badge kind={(c.badgeKind as keyof typeof badgeStyles) ?? 'gray'}>{v as unknown as ReactNode}</Badge>
  }
  if (t === 'progress')
    return (
      <div className="flex items-center gap-2">
        <ProgressBar value={Number(v)} color={c.progressColor ?? 'bg-brand-500'} />
        <span className="w-10 text-right text-xs tabular-nums text-slate-500">{v as unknown as ReactNode}%</span>
      </div>
    )
  if (t === 'money') return <span className="tabular-nums text-slate-700">¥{(v as number).toLocaleString()}</span>
  if (t === 'number') return <span className="tabular-nums text-slate-700">{v as unknown as ReactNode}</span>
  if (t === 'percent') return <span className="tabular-nums text-slate-700">{v as unknown as ReactNode}%</span>
  if (t === 'score') return <span className="font-semibold tabular-nums text-ink-900">{v as unknown as ReactNode}</span>
  if (t === 'mask-name' || t === 'mask-id' || t === 'mask-phone') return <span className="font-mono text-slate-700">{v as unknown as ReactNode}</span>
  if (t === 'datetime') return <span className="text-slate-500">{v as unknown as ReactNode}</span>
  return <span className="text-slate-700">{v as unknown as ReactNode}</span>
}

/* ---------- Button ---------- */
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' }) {
  const variants: Record<string, string> = {
    primary: 'bg-brand-600 text-white hover:bg-brand-700',
    secondary: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    ghost: 'text-slate-600 hover:bg-slate-100',
  }
  const sizes: Record<string, string> = {
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3.5 py-2 text-sm',
  }
  return (
    <button
      {...rest}
      className={`inline-flex items-center gap-1.5 rounded-lg font-medium transition ${sizes[size]} ${variants[variant]} ${className}`}
    />
  )
}

/* ---------- RightDrawer（右侧抽屉，支持嵌套层级：level 越高越靠前，内层叠在外层上） ---------- */
export function RightDrawer({
  open,
  onClose,
  title,
  children,
  width = 560,
  level = 1,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: number
  level?: number
}) {
  if (!open) return null
  const z = 50 + level * 10 // 外层 60 / 内层 70（逐层前置）
  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: z }}>
      {/* 遮罩：外层全屏；内层只盖住内层抽屉左侧（外层露出部分可见，体现层级包含） */}
      <div
        className="absolute inset-y-0 bg-slate-900/40"
        style={{ left: 0, right: level > 1 ? width : 0, zIndex: z - 1 }}
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 overflow-y-auto bg-white shadow-2xl" style={{ width, zIndex: z }}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
          <h2 className="text-base font-semibold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

/* ---------- Drawer ---------- */
export function Drawer({
  open,
  onClose,
  title,
  children,
  width = 'max-w-lg',
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  width?: string
}) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className={`relative h-full w-full ${width} overflow-y-auto bg-white shadow-2xl`}>
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white/95 px-6 py-4 backdrop-blur">
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>,
    document.body,
  )
}

/* ---------- Modal ---------- */
export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'max-w-lg',
  zIndex = 50,
}: {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  footer?: ReactNode
  width?: string
  zIndex?: number // 弹窗层级（默认 50；嵌套在 RightDrawer 之上需调高，如抽屉 level=2 为 70）
}) {
  if (!open) return null
  return createPortal(
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex }}>
      <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
      <div className={`relative w-full ${width} overflow-hidden rounded-2xl bg-white shadow-2xl`}>
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="关闭"
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}

/* ---------- 统一下拉筛选（与首行筛选一致的样式：h-9 / 圆角 / border / 小三角箭头 / 足够右内边距） ---------- */
export interface SelectOption {
  value: string
  label: string
}

/* ---------- 可搜索复杂下拉（分组 + 搜索 + 整类全选 + 多选/单选 + 互斥项） ---------- */
export interface SearchSelectOption {
  value: string
  label: string
  group?: string // 所属分组 key（与 groups[].key 对应）
  disabled?: boolean
}
export interface SearchSelectGroup {
  key: string
  label: string
}
export interface SearchSelectProps {
  options: SearchSelectOption[]
  value: string | string[]
  onChange: (v: string | string[]) => void
  multiple?: boolean
  groups?: SearchSelectGroup[]
  pinned?: SearchSelectOption[] // 置顶固定项（如「全产品」），不参与分组搜索
  placeholder?: string
  searchPlaceholder?: string
  emptyText?: string
  disabled?: boolean
  fullWidth?: boolean
  width?: number | string
  exclusiveValues?: string[] // 选中其中之一即清空其余（如「全产品」互斥）
  portal?: boolean // 浮层渲染到 body（fixed 定位），避免在 Modal 等 overflow 容器内被裁剪
}
export function SearchSelect({
  options,
  value,
  onChange,
  multiple = false,
  groups,
  pinned = [],
  placeholder = '请选择',
  searchPlaceholder = '搜索…',
  emptyText = '无匹配项',
  disabled = false,
  fullWidth = false,
  width,
  exclusiveValues = [],
  portal = false,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const ref = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const t = e.target as Node
      if (ref.current && !ref.current.contains(t) && panelRef.current && !panelRef.current.contains(t)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])
  useEffect(() => { if (!open) setQ('') }, [open])

  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v
  const isSel = (v: string) => (multiple ? (value as string[]).includes(v) : value === v)
  const toggle = (v: string) => {
    if (multiple) {
      const arr = value as string[]
      const checked = arr.includes(v)
      let next: string[]
      if (checked) next = arr.filter((x) => x !== v)
      else if (exclusiveValues.includes(v)) next = [v]
      else next = [...arr.filter((x) => !exclusiveValues.includes(x)), v]
      onChange(next)
    } else {
      onChange(v)
      setOpen(false)
    }
  }
  const toggleGroup = (gKey: string) => {
    const leaves = options.filter((o) => o.group === gKey).map((o) => o.value)
    const arr = value as string[]
    const allOn = leaves.length > 0 && leaves.every((v) => arr.includes(v))
    const next = allOn
      ? arr.filter((x) => !leaves.includes(x))
      : [...arr.filter((x) => !exclusiveValues.includes(x)), ...leaves.filter((v) => !arr.includes(v))]
    onChange(next)
  }

  const ql = q.trim().toLowerCase()
  const matchOpt = (o: SearchSelectOption) => !ql || o.label.toLowerCase().includes(ql)
  const usedGroups = (groups && groups.length ? groups : Array.from(new Set(options.map((o) => o.group).filter(Boolean) as string[])).map((k) => ({ key: k, label: k })))
  const totalMatch =
    pinned.filter(matchOpt).length +
    usedGroups.reduce((n, g) => n + options.filter((o) => o.group === g.key && matchOpt(o)).length, 0)

  let trigger: ReactNode
  if (multiple) {
    const arr = value as string[]
    if (arr.length === 0) trigger = <span className="text-slate-400">{placeholder}</span>
    else if (arr.length <= 2)
      trigger = arr.map((v) => (
        <span key={v} className="rounded-full bg-brand-50 px-2 py-0.5 text-xs text-brand-700">{labelOf(v)}</span>
      ))
    else trigger = <span className="text-brand-700">{`已选 ${arr.length} 项`}</span>
  } else {
    trigger = value ? <span>{labelOf(value as string)}</span> : <span className="text-slate-400">{placeholder}</span>
  }

  const rect = ref.current?.getBoundingClientRect()
  const panelBody = (
    <>
      <div className="border-b border-slate-100 p-2">
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm outline-none focus:border-brand-400"
        />
      </div>
      <div className="max-h-64 overflow-y-auto p-1.5">
        {pinned.length > 0 && (
          <div className="mb-1">
            {pinned.map((p) => (
              <Row key={p.value} opt={p} checked={isSel(p.value)} onToggle={() => toggle(p.value)} multiple={multiple} />
            ))}
            <div className="my-1 border-t border-slate-100" />
          </div>
        )}
        {usedGroups.map((g) => {
          const gOpts = options.filter((o) => o.group === g.key && matchOpt(o))
          if (gOpts.length === 0) return null
          const allOn = gOpts.every((o) => isSel(o.value))
          const someOn = gOpts.some((o) => isSel(o.value))
          return (
            <div key={g.key} className="mb-1">
              <div className="flex items-center gap-2 rounded-lg px-2 py-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
                {multiple && (
                  <input
                    type="checkbox"
                    checked={allOn}
                    ref={(el) => { if (el) el.indeterminate = !allOn && someOn }}
                    onChange={() => toggleGroup(g.key)}
                  />
                )}
                <span>{g.label}</span>
                {multiple && (
                  <span className="ml-auto text-slate-300">{`${gOpts.filter((o) => isSel(o.value)).length}/${gOpts.length}`}</span>
                )}
              </div>
              {gOpts.map((o) => (
                <Row key={o.value} opt={o} checked={isSel(o.value)} onToggle={() => toggle(o.value)} multiple={multiple} />
              ))}
            </div>
          )
        })}
        {totalMatch === 0 && <div className="px-2 py-6 text-center text-sm text-slate-400">{emptyText}</div>}
      </div>
      {multiple && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
          <span>已选 {(value as string[]).length} 项</span>
          <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => onChange([])}>清空</button>
        </div>
      )}
    </>
  )

  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={ref} style={width ? { width } : undefined}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`flex min-h-9 w-full items-center gap-1.5 rounded-lg border px-3 py-1.5 text-left text-sm transition ${
          multiple ? (value as string[]).length > 0 : !!value
            ? 'border-brand-200 bg-brand-50 text-brand-700'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      >
        <span className="flex flex-1 flex-wrap items-center gap-1 overflow-hidden">{trigger}</span>
        <span className="pointer-events-none ml-1 text-xs text-slate-400">▾</span>
      </button>
      {open && (
        portal && ref.current ? (
          createPortal(
            <div ref={panelRef} style={{ position: 'fixed', left: rect?.left ?? 0, top: (rect?.bottom ?? 0) + 4, width: rect?.width ?? 240, zIndex: 999, maxHeight: '70vh' }} className="overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl">
              {panelBody}
            </div>,
            document.body,
          )
        ) : (
          <div ref={panelRef} className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
            {panelBody}
          </div>
        )
      )}
    </div>
  )
}

function Row({ opt, checked, onToggle, multiple }: { opt: SearchSelectOption; checked: boolean; onToggle: () => void; multiple: boolean }) {
  return (
    <button
      type="button"
      disabled={opt.disabled}
      onClick={onToggle}
      className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-slate-50 ${
        checked ? 'text-brand-700' : 'text-slate-600'
      } ${opt.disabled ? 'cursor-not-allowed opacity-50' : ''}`}
    >
      <input type={multiple ? 'checkbox' : 'radio'} readOnly checked={checked} tabIndex={-1} className="pointer-events-none" />
      <span className="flex-1 truncate">{opt.label}</span>
      {checked && multiple && <span className="text-brand-600">✓</span>}
    </button>
  )
}


export function SingleSelect({
  label,
  options,
  value,
  onChange,
  clearable = false,
  fullWidth = false,
}: {
  label: string
  options: SelectOption[]
  value: string
  onChange: (v: string) => void
  clearable?: boolean
  fullWidth?: boolean
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])
  const selected = options.find((o) => o.value === value)
  return (
    <div className={`relative ${fullWidth ? 'w-full' : ''}`} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex h-9 items-center gap-1.5 rounded-lg border pr-8 pl-3 text-sm transition ${
          value
            ? 'border-brand-200 bg-brand-50 text-brand-700'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        } ${fullWidth ? 'w-full justify-between' : ''}`}
      >
        <span className="truncate">{selected ? selected.label : label}</span>
        <span className="pointer-events-none absolute right-3 text-xs text-slate-400">▾</span>
      </button>
      {open && (
        <div className={`absolute z-50 mt-1 rounded-xl border border-slate-200 bg-white p-2 shadow-xl ${fullWidth ? 'w-full' : 'w-44'}`}>
          {clearable && (
            <button
              type="button"
              onClick={() => {
                onChange('')
                setOpen(false)
              }}
              className="mb-1 w-full rounded-lg px-2 py-1.5 text-left text-xs text-slate-400 hover:bg-slate-50"
            >
              清除筛选
            </button>
          )}
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => {
                onChange(o.value)
                setOpen(false)
              }}
              className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-slate-50 ${
                value === o.value ? 'text-brand-700' : 'text-slate-600'
              }`}
            >
              <span>{o.label}</span>
              {value === o.value && <span className="text-brand-600">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* 表单用：内部自管理的下拉（支持在静态 JSX 中直接使用，无需父组件 state） */
export function SelectField({ label, options, defaultValue = '' }: { label: string; options: SelectOption[]; defaultValue?: string }) {
  const [val, setVal] = useState(defaultValue || (options[0] ? options[0].value : ''))
  return <SingleSelect label={label} options={options} value={val} onChange={setVal} fullWidth />
}
