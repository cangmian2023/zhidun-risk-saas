import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel, Badge, StatCard, SingleSelect, Button, DecisionTag, StatusTag, type SelectOption } from '../components/ui'
import {
  VerifyRowActions,
  type VerifyRow,
  type SysResult,
  type WorkStatus,
} from './VerifyOps'
import seedJson from './infoVerify222Data.json'

/* ───────────────────────── 信息核验222 · 数据从本地 JSON 读取 ───────────────────────── */
const SYS_RESULTS: SysResult[] = ['处理中', '通过', '拒绝', '预警']
const WORK_STATUSES: WorkStatus[] = [
  '核验计算中', '待确认', '已确认', '待审核', '提交复核', '复核通过', '复核拒绝', '强制放行',
]

const seedRows: VerifyRow[] = seedJson as VerifyRow[]

const PRODUCTS = ['信用贷', '抵押贷', '经营贷']
const CHANNELS = ['APP', 'H5', '小程序', '线下']
const TIME_OPTIONS: SelectOption[] = [
  { value: '7', label: '近 7 天' },
  { value: '30', label: '近 30 天' },
  { value: '90', label: '近 90 天' },
]

const SYS_KIND: Record<SysResult, 'gray' | 'green' | 'red' | 'amber'> = {
  处理中: 'gray', 通过: 'green', 拒绝: 'red', 预警: 'amber',
}
const WORK_KIND: Record<WorkStatus, 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
  核验计算中: 'gray', 待确认: 'blue', 已确认: 'green', 待审核: 'amber',
  提交复核: 'amber', '复核通过': 'green', '复核拒绝': 'red', 强制放行: 'violet',
}

function MultiChip<T extends string>({ label, options, selected, onChange }: {
  label: string; options: T[]; selected: T[]; onChange: (v: T[]) => void
}) {
  const [open, setOpen] = useState(false)
  const toggle = (v: T) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition ${selected.length ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'}`}>
        {label}{selected.length > 0 && <Badge kind="violet" className="ml-1">{selected.length}</Badge>}
        <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 7.5 10 12l4.5-4.5" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-30 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            {options.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} className="h-4 w-4 rounded border-slate-300 text-violet-600" />
                <span className="text-slate-700">{o}</span>
              </label>
            ))}
            {selected.length > 0 && <button onClick={() => onChange([])} className="mt-1 w-full rounded px-2 py-1.5 text-left text-xs text-slate-500 hover:bg-slate-50">清空</button>}
          </div>
        </>
      )}
    </div>
  )
}

type Side = 'left' | 'right' | null
const C = { id: 168, name: 104, product: 96, channel: 84, amount: 128, score: 100, sys: 116, work: 148, operator: 208, time: 160, op: 224 }
const headStyle = (w: number, side: Side, offset = 0): CSSProperties => {
  const s: CSSProperties = { width: w, minWidth: w, maxWidth: w, position: 'sticky', top: 0 }
  if (side === 'left') { s.left = offset; s.zIndex = 30 }
  else if (side === 'right') { s.right = 0; s.zIndex = 30 }
  else s.zIndex = 20
  return s
}
const bodyStyle = (w: number, side: Side, offset = 0): CSSProperties => {
  const s: CSSProperties = { width: w, minWidth: w, maxWidth: w }
  if (side === 'left') { s.position = 'sticky'; s.left = offset; s.zIndex = 10 }
  else if (side === 'right') { s.position = 'sticky'; s.right = 0; s.zIndex = 10 }
  return s
}

export default function InfoVerify222() {
  const [rows] = useState<VerifyRow[]>(seedRows)
  const [kw, setKw] = useState('')
  const [products, setProducts] = useState<string[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const [sysResults, setSysResults] = useState<SysResult[]>([])
  const [workStatuses, setWorkStatuses] = useState<WorkStatus[]>([])
  const [opKw, setOpKw] = useState('')
  const [creditMax, setCreditMax] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [timeRange, setTimeRange] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const nav = useNavigate()

  const goReport = (r: VerifyRow) =>
    nav(`/console/cr/pre-verify-222-detail?id=${encodeURIComponent(r.id)}`)

  const stats = useMemo(() => {
    const total = rows.length
    const pending = rows.filter((r) => ['核验计算中', '待确认', '待审核'].includes(r.workStatus)).length
    const review = rows.filter((r) => r.workStatus === '提交复核').length
    const passed = rows.filter((r) => r.sysResult === '通过').length
    const forced = rows.filter((r) => r.workStatus === '强制放行').length
    return [
      { label: '待人工处置', value: String(pending), hint: '核验计算中 / 待确认 / 待审核', accent: 'amber' as const },
      { label: '自动审核通过率', value: total ? `${Math.round((passed / total) * 100)}%` : '0%', hint: `系统通过 ${passed} / 共 ${total} 笔`, accent: 'emerald' as const },
      { label: '待双人复核', value: String(review), hint: '提交复核等待终审', accent: 'violet' as const },
      { label: '强制放行(高敏感)', value: String(forced), hint: '人工强制放行件', accent: 'rose' as const },
    ]
  }, [rows])

  const filtered = useMemo(() => {
    const now = new Date('2026-08-02T23:59:59').getTime()
    return rows.filter((r) => {
      if (kw && !`${r.id} ${r.name}`.toLowerCase().includes(kw.toLowerCase())) return false
      if (products.length && !products.includes(r.product)) return false
      if (channels.length && !channels.includes(r.channel)) return false
      if (sysResults.length && !sysResults.includes(r.sysResult)) return false
      if (workStatuses.length && !workStatuses.includes(r.workStatus)) return false
      if (opKw && !r.operator.toLowerCase().includes(opKw.toLowerCase())) return false
      if (creditMax && 100 - r.fraudScore > Number(creditMax)) return false
      if (amountMax && r.amount > Number(amountMax)) return false
      if (timeRange) {
        const t = new Date(r.auditTime.replace(' ', 'T')).getTime()
        if (now - t > Number(timeRange) * 86400000) return false
      }
      return true
    })
  }, [rows, kw, products, channels, sysResults, workStatuses, opKw, creditMax, amountMax, timeRange])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const resetFilters = () => {
    setKw(''); setProducts([]); setChannels([]); setSysResults([]); setWorkStatuses([])
    setOpKw(''); setCreditMax(''); setAmountMax(''); setTimeRange('')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PageHeader
        crumb="零售信贷风控 / 贷前审核"
        title="信息核验222"
        subtitle="模板驱动 · 数据从本地 JSON 文件读取（infoVerify222Data.json）"
      />

      <div className="mx-auto max-w-[1400px] space-y-5 px-4 pb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} hint={s.hint} accent={s.accent} />
          ))}
        </div>

        <Panel>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="搜索申请编号 / 申请人" className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
              <MultiChip label="产品" options={PRODUCTS} selected={products} onChange={setProducts} />
              <MultiChip label="渠道" options={CHANNELS} selected={channels} onChange={setChannels} />
              <MultiChip label="自动审核" options={SYS_RESULTS} selected={sysResults} onChange={setSysResults} />
              <MultiChip label="人工审核" options={WORK_STATUSES} selected={workStatuses} onChange={setWorkStatuses} />
              <input value={opKw} onChange={(e) => setOpKw(e.target.value)} placeholder="搜索审核人" className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div className="hidden min-w-[1rem] flex-1 xl:block" />
            <div className="flex flex-wrap items-center gap-3">
              <input value={creditMax} onChange={(e) => setCreditMax(e.target.value)} placeholder="信用值 ≤" className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
              <input value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="申请额度 ≤" className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
              <SingleSelect label="申请时间" options={TIME_OPTIONS} value={timeRange} onChange={setTimeRange} clearable />
              <Button variant="ghost" onClick={resetFilters}>重置</Button>
            </div>
          </div>
        </Panel>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="border-collapse text-sm" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th style={headStyle(C.id, 'left', 0)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">申请编号</th>
                  <th style={headStyle(C.name, 'left', C.id)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">申请人</th>
                  <th style={headStyle(C.product, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">产品</th>
                  <th style={headStyle(C.channel, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">渠道</th>
                  <th style={headStyle(C.amount, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right font-medium">申请额度</th>
                  <th style={headStyle(C.score, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right font-medium">信用值</th>
                  <th style={headStyle(C.sys, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">自动审核</th>
                  <th style={headStyle(C.work, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">人工审核</th>
                  <th style={headStyle(C.operator, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">审核人</th>
                  <th style={headStyle(C.time, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">申请时间</th>
                  <th style={headStyle(C.op, 'right', 0)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 pr-[22px] text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((r) => {
                  const credit = 100 - r.fraudScore
                  return (
                    <tr key={r.id} className="group hover:bg-slate-50/60">
                      <td style={bodyStyle(C.id, 'left', 0)} className="whitespace-nowrap bg-white px-3 py-3 font-mono text-xs text-slate-700 group-hover:bg-slate-50/60">
                        <button onClick={() => goReport(r)} className="font-medium text-brand-600 hover:underline">{r.id}</button>
                      </td>
                      <td style={bodyStyle(C.name, 'left', C.id)} className="whitespace-nowrap bg-white px-3 py-3 text-slate-800 group-hover:bg-slate-50/60">{r.name}</td>
                      <td style={bodyStyle(C.product, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.product}</td>
                      <td style={bodyStyle(C.channel, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.channel}</td>
                      <td style={bodyStyle(C.amount, null)} className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">¥{r.amount.toLocaleString()}</td>
                      <td style={bodyStyle(C.score, null)} className="whitespace-nowrap px-3 py-3 text-right">
                        <span className={`tabular-nums font-semibold ${credit >= 80 ? 'text-emerald-600' : credit >= 20 ? 'text-amber-600' : 'text-rose-600'}`}>{credit}</span>
                      </td>
                      <td style={bodyStyle(C.sys, null)} className="whitespace-nowrap px-3 py-3 text-center">
                        <DecisionTag kind={SYS_KIND[r.sysResult]} soft={r.sysResult === '处理中'}>{r.sysResult}</DecisionTag>
                      </td>
                      <td style={bodyStyle(C.work, null)} className="whitespace-nowrap px-3 py-3 text-center">
                        <StatusTag kind={WORK_KIND[r.workStatus]}>{r.workStatus}</StatusTag>
                      </td>
                      <td style={bodyStyle(C.operator, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.operator}</td>
                      <td style={bodyStyle(C.time, null)} className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-500">{r.auditTime}</td>
                      <td style={bodyStyle(C.op, 'right', 0)} className="whitespace-nowrap bg-white px-3 py-3 pr-[22px] text-left group-hover:bg-slate-50/60">
                        <VerifyRowActions row={r} onApply={() => {}} onView={() => goReport(r)} flash={() => {}} />
                      </td>
                    </tr>
                  )
                })}
                {pageRows.length === 0 && (
                  <tr><td colSpan={11} className="whitespace-nowrap px-3 py-10 text-center text-sm text-slate-400">暂无符合条件的核验记录</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-sm">
            <div className="text-slate-500">共 {filtered.length} 条</div>
            <div className="flex items-center gap-2">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 enabled:hover:bg-slate-50 disabled:opacity-40">上一页</button>
              <span className="text-slate-500">第 {safePage} / {totalPages} 页</span>
              <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 enabled:hover:bg-slate-50 disabled:opacity-40">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
