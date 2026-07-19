import { useMemo, useState, type ReactNode } from 'react'
import { Badge, Panel, SingleSelect, type Column, type Row } from '../components/ui'
import { maskName, maskId, maskPhone } from './data'

const OP_W = 120

function wpx(w?: string) {
  if (!w) return 120
  const n = parseInt(w, 10)
  return Number.isFinite(n) ? n : 120
}

function cellText(v: any): string {
  if (v == null) return ''
  if (typeof v === 'object' && v.v !== undefined) return String(v.v)
  return String(v)
}

const alignCls = (a?: Column['align']) =>
  a === 'right' ? 'text-right' : a === 'center' ? 'text-center' : 'text-left'

// 仅对“离散、低基数”的列生成下拉筛选；时间类列与 id 列不参与
const EXCLUDE_KEYS = new Set(['id', 'time', 'gen', 'last', 'lastRun', 'updated', 'lastTrain'])
function buildFilterCols(columns: Column[], rows: Row[]) {
  return columns.filter((c) => {
    if (c.type === 'badge') return true
    if (EXCLUDE_KEYS.has(c.key)) return false
    const uniq = Array.from(new Set(rows.map((r) => cellText(r[c.key])).filter((x) => x !== '')))
    return uniq.length >= 2 && uniq.length <= 10
  })
}

export default function ListPage({
  columns,
  rows,
  searchable = true,
  reportKey,
  note,
  title = '数据明细',
  headerActions,
  onView,
  onExport,
  onViewRow,
}: {
  columns: Column[]
  rows: Row[]
  searchable?: boolean
  reportKey?: string
  note?: string
  title?: string
  headerActions?: ReactNode
  onView?: (row: Row) => void
  onExport?: (row: Row) => void
  onViewRow?: (row: Row) => void
}) {
  const filterCols = useMemo(() => buildFilterCols(columns, rows), [columns, rows])
  const filterDefs = useMemo(
    () =>
      filterCols.map((c) => ({
        key: c.key,
        label: c.label,
        options: Array.from(new Set(rows.map((r) => cellText(r[c.key])).filter((x) => x !== ''))),
      })),
    [filterCols, rows],
  )

  const [filt, setFilt] = useState<Record<string, string>>({})
  const [kw, setKw] = useState('')

  const filtered = useMemo(() => {
    const q = kw.trim().toLowerCase()
    return rows.filter((r) => {
      for (const [k, v] of Object.entries(filt)) {
        if (v && cellText(r[k]) !== v) return false
      }
      if (q && !Object.values(r).some((val) => cellText(val).toLowerCase().includes(q))) return false
      return true
    })
  }, [rows, filt, kw])

  const hasFilter = filterDefs.length > 0
  const active = Object.values(filt).some(Boolean) || kw.trim() !== ''

  const firstKey = columns[0]?.key
  const minWidth = columns.reduce((s, c) => s + wpx(c.width), 0) + OP_W

  const renderCell = (col: Column, row: Row) => {
    const v: any = row[col.key]
    switch (col.type) {
      case 'money':
        return <span className="tabular-nums font-medium">{typeof v === 'number' ? `¥${v.toLocaleString()}` : v}</span>
      case 'percent':
        return <span className="tabular-nums">{typeof v === 'number' ? `${v}%` : v}</span>
      case 'number':
        return <span className="tabular-nums">{typeof v === 'number' ? v.toLocaleString() : v}</span>
      case 'datetime':
        return <span className="text-slate-500">{v}</span>
      case 'mask-name':
        return <span className="text-slate-700">{maskName(v)}</span>
      case 'mask-id':
        return <span className="font-mono text-slate-500">{maskId(v)}</span>
      case 'mask-phone':
        return <span className="font-mono text-slate-500">{maskPhone(v)}</span>
      case 'badge':
        return v && typeof v === 'object' ? (
          <Badge kind={(v.kind as any) || 'gray'}>{v.v}</Badge>
        ) : (
          <span className="text-slate-600">{v}</span>
        )
      case 'score':
        return <span className="font-semibold tabular-nums text-ink-900">{typeof v === 'number' ? v : v}</span>
      case 'progress': {
        const num = typeof v === 'number' ? v : Number(v) || 0
        return (
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-slate-100">
              <div className={`h-full ${col.progressColor || 'bg-brand-500'}`} style={{ width: `${Math.min(100, Math.max(0, num))}%` }} />
            </div>
            <span className="text-xs text-slate-500 tabular-nums">{num}%</span>
          </div>
        )
      }
      default:
        if (col.key === reportKey && onView) {
          return (
            <button
              className="font-medium text-brand-600 hover:underline"
              onClick={(e) => {
                e.stopPropagation()
                onView(row)
              }}
            >
              {v}
            </button>
          )
        }
        return <span className="text-slate-700">{v}</span>
    }
  }

  return (
    <Panel title={title} note={note} actions={headerActions}>
      {(hasFilter || searchable) && (
        <div className="mb-4 flex flex-wrap items-center gap-3">
          {filterDefs.map((f) => (
            <SingleSelect
              key={f.key}
              label={f.label}
              clearable
              options={f.options.map((o) => ({ value: o, label: o }))}
              value={filt[f.key] || ''}
              onChange={(v) => setFilt((p) => ({ ...p, [f.key]: v }))}
            />
          ))}

          {searchable && (
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder="搜索关键字"
              className="w-full max-w-xs rounded-lg border border-slate-200 px-3.5 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
            />
          )}

          <span className="shrink-0 text-xs text-slate-400">共 {filtered.length} 条</span>

          {active && (
            <button
              onClick={() => {
                setFilt({})
                setKw('')
              }}
              className="text-xs text-slate-400 transition hover:text-brand-600"
            >
              重置
            </button>
          )}
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
        <table className="w-full table-fixed" style={{ minWidth: minWidth }}>
          <thead>
            <tr className="sticky top-0 z-20 border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={`px-3 py-3 ${alignCls(c.align)} ${c.key === firstKey ? 'sticky left-0 z-20 bg-slate-50' : ''}`}
                >
                  {c.label}
                </th>
              ))}
              <th style={{ width: OP_W }} className="sticky right-0 z-20 bg-slate-50 px-3 py-3 text-right">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-4 py-10 text-center text-sm text-slate-400">
                  暂无数据
                </td>
              </tr>
            ) : (
              filtered.map((r, i) => (
                <tr key={(r.id as string) ?? i} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                  {columns.map((c) => {
                    const sticky = c.key === firstKey
                    return (
                      <td
                        key={c.key}
                        style={{ width: c.width }}
                        className={`px-3 py-3 ${alignCls(c.align)} ${
                          sticky ? 'sticky left-0 z-10 bg-white group-hover:bg-slate-50/60' : ''
                        }`}
                      >
                        {renderCell(c, r)}
                      </td>
                    )
                  })}
                  <td className="sticky right-0 z-10 bg-white px-3 py-3 text-right group-hover:bg-slate-50/60">
                    <div className="flex items-center justify-end gap-2 text-xs">
                      {onViewRow && (
                        <button onClick={() => onViewRow(r)} className="font-medium text-brand-600 hover:underline">
                          查看
                        </button>
                      )}
                      {onView && !onViewRow && (
                        <button onClick={() => onView(r)} className="font-medium text-brand-600 hover:underline">
                          查看
                        </button>
                      )}
                      {onExport && (
                        <button onClick={() => onExport?.(r)} className="font-medium text-slate-400 transition hover:text-brand-600">
                          导出
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
