import { useState, useRef, useEffect, useLayoutEffect } from 'react'
import type { ReactNode, ButtonHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { SourceTag } from '../console/SourceTag'
import { usePageNav } from '../console/pageNav'

/* ---------- Page header ---------- */
export function PageHeader({
  title,
  subtitle,
  actions,
  crumb,
  crumbNodes,
  onBack,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
  crumb?: string
  crumbNodes?: ReactNode
  onBack?: () => void
}) {
  return (
    <div className="sticky top-14 z-30 -mx-4 border-b border-slate-100 bg-slate-50 px-4 pb-5 pt-1 lg:-mx-8 lg:px-8">
      {/* 第一行：面包屑（与详情页 DetailHeader 一致，放最上面，可与页面标题左对齐） */}
      {crumbNodes ?? (crumb && <div className="text-xs text-slate-400">{crumb}</div>)}
      {/* 第二行：标题 + 右侧操作 */}
      <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1 flex items-center gap-2">
          {onBack && (
            <button
              onClick={onBack}
              style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#64748B', padding: '6px', borderRadius: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#E2E8F0'; e.currentTarget.style.color = '#0F172A' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#64748B' }}
              title="返回"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg>
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-ink-900">{title}</h1>
            {subtitle && <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-slate-500">{subtitle}</p>}
          </div>
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
  extra,
}: {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'flat'
  hint?: ReactNode
  accent?: 'brand' | 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose'
  extra?: ReactNode
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
      <p className="flex items-center gap-1.5 text-sm text-slate-500">{label}{extra}</p>
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
  backTo,
  actions,
  id,
  flowBar,
  sticky = true,
}: {
  title: ReactNode
  crumb?: string
  subtitle?: ReactNode
  backLabel?: string
  onBack?: () => void
  backTo?: string // 统一框架兜底：未传 onBack 时，返回优先读 ?back=，否则回退到此路径
  actions?: ReactNode
  id?: string
  flowBar?: ReactNode // 需求21：流程操作行（面包屑下方，保存/流程按钮/状态标签）
  sticky?: boolean // 是否吸顶（默认吸顶；个别页面仅需 Tab 吸顶时传 false）
}) {
  const { back } = usePageNav()
  // 统一返回：调用方显式 onBack > 框架自动返回（?back= → backTo → 浏览器后退）
  const onBackResolved = onBack ?? (() => back(backTo))
  return (
    <div
      id={id}
      className={
        (sticky ? 'sticky top-14 z-30 ' : '') + '-mx-4 bg-slate-50 px-4 pb-4 pt-1 lg:-mx-8 lg:px-8'
      }
    >
      {/* 第一行：返回按钮 + 面包屑 */}
      <div className="flex flex-wrap items-center gap-3">
        {onBackResolved && (
          <button
            type="button"
            onClick={onBackResolved}
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
  exportable = false,
  exportName = '导出',
  selectable = false,
  selected = [],
  onSelectChange,
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
  exportable?: boolean
  exportName?: string
  selectable?: boolean
  selected?: string[]
  onSelectChange?: (ids: string[]) => void
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

  // 多选（P1 批量操作）：当前页全选 / 单行勾选
  const pageIds = view.map((r) => r.id);
  const allOn = selectable && pageIds.length > 0 && pageIds.every((id) => selected.includes(id));
  const toggleAll = () => {
    if (!onSelectChange) return;
    onSelectChange(allOn ? selected.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...selected, ...pageIds])));
  };
  const toggleOne = (id: string) => {
    if (!onSelectChange) return;
    onSelectChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  const doExport = () => {
    const esc = (v: unknown) => {
      const s = v == null ? '' : (typeof v === 'object' && v !== null && 'v' in (v as Record<string, unknown>) ? String((v as { v: unknown }).v) : String(v));
      return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
    };
    const head = columns.map((c) => esc(c.label)).join(',');
    const lines = rows.map((r) => columns.map((c) => esc(r[c.key])).join(','));
    const csv = '\ufeff' + [head, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${exportName}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div>
      {exportable && total > 0 && (
        <div className="mb-2 flex justify-end">
          <button type="button" onClick={doExport}
            style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', cursor: 'pointer' }}>
            ⬇ 导出 CSV
          </button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs font-semibold text-slate-600">
              {selectable && (
                <th className="whitespace-nowrap px-3 py-3 bg-slate-50" style={{ width: 40 }}>
                  <input type="checkbox" checked={allOn} onChange={toggleAll} className="accent-blue-600" />
                </th>
              )}
              {columns.map((c, i) => (
                <th
                  key={c.key}
                  className={`whitespace-nowrap px-3 py-3 bg-slate-50 ${c.fixed === 'left' || i === 0 ? 'sticky left-0 z-20' : ''} ${c.fixed === 'right' ? 'sticky z-20' : ''}`}
                  style={{ width: c.width, textAlign: c.align ?? 'left', ...(c.fixed === 'right' ? { right: actionsW } : {}) }}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{c.label}</span>
                    {c.tag && <ColumnTag tag={c.tag} />}
                  </div>
                </th>
              ))}
              {actions && (
                <th ref={actionsRef} className="whitespace-nowrap px-3 py-3 bg-slate-50 sticky right-0 z-20 text-left">操作</th>
              )}
            </tr>
          </thead>
          <tbody>
            {view.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions ? 1 : 0) + (selectable ? 1 : 0)} className="px-3 py-10 text-center text-sm text-slate-400">
                  {empty}
                </td>
              </tr>
            ) : (
              view.map((r, rowIdx) => (
                <tr key={r.id} className={`group border-b border-slate-50 transition hover:bg-slate-100/60 ${rowIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                  {selectable && (
                    <td className={`whitespace-nowrap px-3 py-3 group-hover:bg-slate-100/60 ${rowIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
                      <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)} className="accent-blue-600" />
                    </td>
                  )}
                  {columns.map((c, i) => {
                    const clickable = !!clickableKey && c.key === clickableKey
                    const isFixed = c.fixed === 'left' || i === 0
                    const isFixedRight = c.fixed === 'right'
                    const rowBg = rowIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'
                    return (
                      <td
                        key={c.key}
                        className={`whitespace-nowrap px-3 py-3 text-slate-600 ${isFixed ? `sticky left-0 z-10 ${rowBg} group-hover:bg-slate-100/60` : ''} ${isFixedRight ? `sticky z-10 ${rowBg} group-hover:bg-slate-100/60` : ''}`}
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
                    <td className={`whitespace-nowrap px-3 py-3 text-left sticky right-0 z-10 group-hover:bg-slate-100/60 ${rowIdx % 2 === 1 ? 'bg-slate-50/50' : 'bg-white'}`}>
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
              style={{ height: 28, borderRadius: 6, border: '1px solid #E2E8F0', padding: '0 6px', fontSize: 12, color: '#334155', background: '#fff', cursor: 'pointer', outline: 'none' }}>
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
  clearable?: boolean // 单选可清除（清空为 ''）
  categoryMode?: 'chips' | 'sidebar' // 有分组时分类按钮呈现：顶部胶囊(chips) / 左侧栏(sidebar)
  showCategory?: boolean // 是否显示分类筛选（默认有分组即显示）
}
export function SearchSelect({
  options,
  value,
  onChange,
  multiple = false,
  groups,
  pinned = [],
  placeholder = '请选择',
  searchPlaceholder = '输入关键字筛选…',
  emptyText = '无匹配项',
  disabled = false,
  fullWidth = false,
  width,
  exclusiveValues = [],
  portal = false,
  clearable = false,
  categoryMode = 'chips',
  showCategory = true,
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cat, setCat] = useState<string>('__all__')
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
  useEffect(() => { if (!open) { setQ(''); setCat('__all__') } }, [open])

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
  const matchOpt = (o: SearchSelectOption) => !ql || o.label.toLowerCase().includes(ql) || (o.group?.toLowerCase().includes(ql) ?? false)
  const usedGroups = (groups && groups.length ? groups : Array.from(new Set(options.map((o) => o.group).filter(Boolean) as string[])).map((k) => ({ key: k, label: k })))
  const hasGroup = usedGroups.length > 0
  const visibleGroups = hasGroup && showCategory && cat !== '__all__' ? usedGroups.filter((g) => g.key === cat) : usedGroups
  const visibleOptions = (o: SearchSelectOption) => matchOpt(o) && (!hasGroup || cat === '__all__' || o.group === cat)
  const totalMatch =
    pinned.filter(visibleOptions).length +
    (!hasGroup
      ? options.filter(visibleOptions).length
      : usedGroups.reduce((n, g) => n + options.filter((o) => o.group === g.key && visibleOptions(o)).length, 0))

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
    trigger = value ? <span className="truncate">{labelOf(value as string)}</span> : <span className="truncate text-slate-400">{placeholder}</span>
  }

  const rect = ref.current?.getBoundingClientRect()
  const listBody = (
    <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-1">
      {pinned.filter(visibleOptions).length > 0 && (
        <div className="mb-1">
          {pinned.filter(visibleOptions).map((p) => (
            <Row key={p.value} opt={p} checked={isSel(p.value)} onToggle={() => toggle(p.value)} multiple={multiple} />
          ))}
          <div className="my-1 border-t border-slate-100" />
        </div>
      )}
      {!hasGroup ? (
        options.filter(visibleOptions).map((o) => (
          <Row key={o.value} opt={o} checked={isSel(o.value)} onToggle={() => toggle(o.value)} multiple={multiple} />
        ))
      ) : (
        visibleGroups.map((g) => {
          const gOpts = options.filter((o) => o.group === g.key && visibleOptions(o))
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
        })
      )}
      {totalMatch === 0 && <div className="px-2 py-8 text-center text-sm text-slate-400">{emptyText}</div>}
    </div>
  )
  const categoryBar = hasGroup && showCategory && categoryMode !== 'sidebar' && (
    <div className="flex flex-wrap gap-1.5 border-b border-slate-100 bg-slate-50/60 p-2">
      <button type="button" onClick={() => setCat('__all__')} className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${cat === '__all__' ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100'}`}>全部</button>
      {usedGroups.map((g) => (
        <button key={g.key} type="button" onClick={() => setCat(g.key)} className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${cat === g.key ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:bg-slate-100'}`}>{g.label}</button>
      ))}
    </div>
  )
  const sidebar = categoryMode === 'sidebar' && hasGroup && showCategory && (
    <div className="w-32 shrink-0 overflow-y-auto border-r border-slate-100 bg-slate-50/60 p-2">
      <button type="button" onClick={() => setCat('__all__')} className={`mb-1 block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium transition ${cat === '__all__' ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-white'}`}>全部</button>
      {usedGroups.map((g) => (
        <button key={g.key} type="button" onClick={() => setCat(g.key)} className={`mb-1 block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium transition ${cat === g.key ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-white'}`}>{g.label}</button>
      ))}
    </div>
  )

  const panelInner = (
    <div className="flex max-h-[60vh] min-h-[220px] flex-col">
      <div className="border-b border-slate-100 p-2.5">
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 focus-within:border-brand-400">
          <span className="text-sm text-slate-400">🔍</span>
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={searchPlaceholder} className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400" />
        </div>
      </div>
      {categoryBar}
      <div className="flex min-h-0 flex-1">
        {sidebar}
        {listBody}
      </div>
      {multiple && (
        <div className="flex items-center justify-between border-t border-slate-100 px-3 py-2 text-xs text-slate-500">
          <span>已选 {(value as string[]).length} 项</span>
          <button type="button" className="text-slate-400 hover:text-slate-600" onClick={() => onChange([])}>清空</button>
        </div>
      )}
      {!multiple && clearable && (
        <div className="border-t border-slate-100 px-3 py-2">
          <button type="button" className="w-full rounded-lg px-2 py-1.5 text-left text-xs text-slate-400 hover:bg-slate-50" onClick={() => { onChange(''); setOpen(false) }}>清除选择</button>
        </div>
      )}
    </div>
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
        {!multiple && clearable && !!value && (
          <span role="button" onClick={(e) => { e.stopPropagation(); onChange('') }} className="pointer-events-auto ml-1 text-xs text-slate-400 hover:text-slate-600">✕</span>
        )}
        <span className="pointer-events-none ml-1 text-xs text-slate-400">▾</span>
      </button>
      {open && (
        portal && ref.current ? (
          createPortal(
            <div ref={panelRef} style={{ position: 'fixed', left: rect?.left ?? 0, top: (rect?.bottom ?? 0) + 4, width: rect?.width ?? 260, zIndex: 999, maxHeight: '70vh' }} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
              {panelInner}
            </div>,
            document.body,
          )
        ) : (
          <div ref={panelRef} className="absolute z-50 mt-1.5 w-full min-w-[240px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
            {panelInner}
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
  width,
  disabled = false,
  portal = false,
}: {
  label: string
  options: SelectOption[]
  value: string
  onChange: (v: string) => void
  clearable?: boolean
  fullWidth?: boolean
  width?: number | string
  disabled?: boolean
  portal?: boolean
}) {
  const sopts: SearchSelectOption[] = options.map((o) => ({ value: o.value, label: o.label }))
  return (
    <SearchSelect
      options={sopts}
      value={value}
      onChange={(v) => onChange(v as string)}
      placeholder={label}
      clearable={clearable}
      fullWidth={fullWidth}
      width={width}
      disabled={disabled}
      searchPlaceholder="输入关键字筛选…"
      portal={portal}
    />
  )
}

/* 表单用：内部自管理的下拉（支持在静态 JSX 中直接使用，无需父组件 state） */
export function SelectField({ label, options, defaultValue = '' }: { label: string; options: SelectOption[]; defaultValue?: string }) {
  const [val, setVal] = useState(defaultValue || (options[0] ? options[0].value : ''))
  return <SingleSelect label={label} options={options} value={val} onChange={setVal} fullWidth />
}
