// 信用风控（方案Kimi）列表页
// 页面样式与「信息核验列表页」(InfoVerifyList) 保持一致：顶部导航/统计卡片/筛选区域/表格布局/冻结列/右导航
import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel, Badge, StatCard, SingleSelect, Button, type SelectOption } from '../components/ui'
import {
  CreditKimiRowActions,
  type CreditKimiRow,
  type CreditKimiSysResult,
  type CreditKimiWorkStatus,
} from './CreditKimiOps'
import { CreditSysResultBadge, CreditWorkStatusBadge, CreditLevelBadge } from './CreditKimiOps'

/* ───────────────────────── 样例数据（覆盖多状态） ───────────────────────── */
const RISK_LEVELS: CreditLevelLabel[] = ['低风险', '中风险', '高风险', '极高风险']
type CreditLevelLabel = '低风险' | '中风险' | '高风险' | '极高风险'
const SYS_RESULTS: CreditKimiSysResult[] = ['处理中', '通过', '拒绝', '预警']
const WORK_STATUSES: CreditKimiWorkStatus[] = [
  '待确认',
  '已确认',
  '待审核',
  '已提交双人复核',
  '双人复核-通过',
  '双人复核-拒绝',
]

function riskLabelFromScore(score: number): CreditLevelLabel {
  if (score >= 80) return '极高风险'
  if (score >= 60) return '高风险'
  if (score >= 40) return '中风险'
  return '低风险'
}
function riskLevelFromScore(score: number): '低' | '中' | '高' | '极高' {
  if (score >= 80) return '极高'
  if (score >= 60) return '高'
  if (score >= 40) return '中'
  return '低'
}

const seedRows: CreditKimiRow[] = [
  { id: 'PA-20260618-003', name: '王强', product: '信用贷', channel: 'H5', amount: 30000, creditScore: 88, riskLevel: '极高', sysResult: '拒绝', workStatus: '待确认', operator: '--', auditTime: '2026-06-18 15:48' },
  { id: 'PA-20260618-002', name: '张*伟', product: '信用贷', channel: 'APP', amount: 80000, creditScore: 15, riskLevel: '低', sysResult: '通过', workStatus: '待确认', operator: '--', auditTime: '2026-06-18 15:10' },
  { id: 'PA-20260618-005', name: '陈刚', product: '抵押贷', channel: '线下', amount: 500000, creditScore: 12, riskLevel: '低', sysResult: '通过', workStatus: '已确认', operator: '初审：审核员 1', auditTime: '2026-06-18 16:40' },
  { id: 'PA-20260618-004', name: '赵*敏', product: '经营贷', channel: 'APP', amount: 200000, creditScore: 52, riskLevel: '中', sysResult: '预警', workStatus: '待审核', operator: '--', auditTime: '2026-06-18 16:05' },
  { id: 'PA-20260618-006', name: '刘洋', product: '抵押贷', channel: '线下', amount: 350000, creditScore: 45, riskLevel: '中', sysResult: '预警', workStatus: '已确认', operator: '初审：审核员 1', auditTime: '2026-06-19 09:12' },
  { id: 'PA-20260619-007', name: '孙丽', product: '信用贷', channel: 'APP', amount: 120000, creditScore: 68, riskLevel: '高', sysResult: '拒绝', workStatus: '已提交双人复核', operator: '初审：审核员 1', auditTime: '2026-06-19 10:03' },
  { id: 'PA-20260620-012', name: '蒋磊', product: '经营贷', channel: 'H5', amount: 150000, creditScore: 72, riskLevel: '高', sysResult: '预警', workStatus: '双人复核-通过', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-06-20 10:25' },
  { id: 'PA-20260620-013', name: '韩梅', product: '信用贷', channel: '小程序', amount: 35000, creditScore: 85, riskLevel: '极高', sysResult: '拒绝', workStatus: '双人复核-拒绝', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-06-20 11:15' },
  { id: 'PA-20260619-009', name: '吴婷', product: '信用贷', channel: '小程序', amount: 45000, creditScore: 18, riskLevel: '低', sysResult: '通过', workStatus: '待确认', operator: '--', auditTime: '2026-06-19 13:45' },
  { id: 'PA-20260619-008', name: '周杰', product: '经营贷', channel: 'H5', amount: 90000, creditScore: 22, riskLevel: '低', sysResult: '通过', workStatus: '已确认', operator: '初审：审核员 1', auditTime: '2026-06-19 11:20' },
  { id: 'PA-20260620-014', name: '杨柳', product: '抵押贷', channel: '线下', amount: 420000, creditScore: 90, riskLevel: '极高', sysResult: '拒绝', workStatus: '已确认', operator: '初审：审核员 1', auditTime: '2026-06-20 14:08' },
  { id: 'PA-20260618-001', name: '张伟', product: '信用贷', channel: 'APP', amount: 80000, creditScore: 8, riskLevel: '低', sysResult: '处理中', workStatus: '待确认', operator: '--', auditTime: '2026-06-18 14:32' },
]

const PRODUCTS = ['信用贷', '抵押贷', '经营贷']
const CHANNELS = ['APP', 'H5', '小程序', '线下']
const TIME_OPTIONS: SelectOption[] = [
  { value: '7', label: '近 7 天' },
  { value: '30', label: '近 30 天' },
  { value: '90', label: '近 90 天' },
]

/* ───────────────────────── 多选项下拉（沿用信息核验列表筛选卡外观） ───────────────────────── */
function MultiChip<T extends string>({ label, options, selected, onChange }: { label: string; options: T[]; selected: T[]; onChange: (v: T[]) => void }) {
  const [open, setOpen] = useState(false)
  const toggle = (v: T) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition ${
          selected.length ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
        }`}
      >
        {label}
        {selected.length > 0 && <Badge kind="violet" className="ml-1">{selected.length}</Badge>}
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
            {selected.length > 0 && (
              <button onClick={() => onChange([])} className="mt-1 w-full rounded px-2 py-1.5 text-left text-xs text-slate-500 hover:bg-slate-50">清空</button>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/* ───────────────────────── 冻结列 ───────────────────────── */
type Side = 'left' | 'right' | null
const C = {
  id: 168, name: 104, product: 96, channel: 84, amount: 128, score: 100, risk: 104, sys: 116, work: 148, operator: 208, op: 224,
}
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

export default function CreditKimiList() {
  const [rows, setRows] = useState<CreditKimiRow[]>(seedRows)

  const [kw, setKw] = useState('')
  const [products, setProducts] = useState<string[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const [riskLevels, setRiskLevels] = useState<CreditLevelLabel[]>([]) // 信用风险等级
  const [autoResults, setAutoResults] = useState<CreditKimiSysResult[]>([]) // 自动审批
  const [workStatuses, setWorkStatuses] = useState<CreditKimiWorkStatus[]>([]) // 人工审核
  const [opKw, setOpKw] = useState('') // 审核人
  const [scoreMin, setScoreMin] = useState('') // 信用评分 ≥
  const [amountMax, setAmountMax] = useState('') // 申请额度 ≤
  const [timeRange, setTimeRange] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [toast, setToast] = useState<string | null>(null)
  const nav = useNavigate()
  const toastTimer = useRef<number | null>(null)

  const goReport = (r: CreditKimiRow) =>
    nav(`/console/cr/credit-kimi-detail?sys=${encodeURIComponent(r.sysResult)}&work=${encodeURIComponent(r.workStatus)}&op=${encodeURIComponent(r.operator)}&id=${encodeURIComponent(r.id)}`)

  const showToast = (m: string) => {
    setToast(m)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }
  const applyRow = (id: string, next: Partial<CreditKimiRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...next } : r)))

  const stats = useMemo(() => {
    const total = rows.length
    const pending = rows.filter((r) => r.workStatus === '待确认' || r.workStatus === '待审核').length
    const review = rows.filter((r) => r.workStatus === '已提交双人复核').length
    const passed = rows.filter((r) => r.sysResult === '通过').length
    const highRisk = rows.filter((r) => r.creditScore >= 60).length
    return [
      { label: '待人工审核', value: String(pending), hint: '待确认 / 待审核', accent: 'amber' as const },
      { label: '自动审批通过率', value: total ? `${Math.round((passed / total) * 100)}%` : '0%', hint: `系统通过 ${passed} / 共 ${total} 笔`, accent: 'emerald' as const },
      { label: '待双人复核', value: String(review), hint: '已提交双人复核等待终审', accent: 'violet' as const },
      { label: '高风险预警', value: String(highRisk), hint: '信用评分 ≥ 60 分', accent: 'rose' as const },
    ]
  }, [rows])

  const filtered = useMemo(() => {
    const now = new Date('2026-06-20T23:59:59').getTime()
    return rows.filter((r) => {
      if (kw && !`${r.id} ${r.name}`.toLowerCase().includes(kw.toLowerCase())) return false
      if (products.length && !products.includes(r.product)) return false
      if (channels.length && !channels.includes(r.channel)) return false
      if (riskLevels.length && !riskLevels.includes(riskLabelFromScore(r.creditScore))) return false
      if (autoResults.length && !autoResults.includes(r.sysResult)) return false
      if (workStatuses.length && !workStatuses.includes(r.workStatus)) return false
      if (opKw && !r.operator.toLowerCase().includes(opKw.toLowerCase())) return false
      if (scoreMin && r.creditScore < Number(scoreMin)) return false
      if (amountMax && r.amount > Number(amountMax)) return false
      if (timeRange) {
        const t = new Date(r.auditTime.replace(' ', 'T')).getTime()
        if (now - t > Number(timeRange) * 86400000) return false
      }
      return true
    })
  }, [rows, kw, products, channels, riskLevels, autoResults, workStatuses, opKw, scoreMin, amountMax, timeRange])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)
  const resetFilters = () => {
    setKw(''); setProducts([]); setChannels([]); setRiskLevels([]); setAutoResults([]); setWorkStatuses([])
    setOpKw(''); setScoreMin(''); setAmountMax(''); setTimeRange('')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PageHeader
        crumb="零售信贷风控 / 贷前审核"
        title="信用风控（方案Kimi）"
        subtitle="贷前审核 · 信用评分 / 六维评估 / 授信决策 + 工单人工处置（操作随审核状态动态变化）"
      />

      <div className="mx-auto max-w-[1400px] space-y-5 px-4 pb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (<StatCard key={s.label} label={s.label} value={s.value} hint={s.hint} accent={s.accent} />))}
        </div>

        <Panel>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="搜索申请编号 / 申请人" className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
              <MultiChip label="产品" options={PRODUCTS} selected={products} onChange={setProducts} />
              <MultiChip label="渠道" options={CHANNELS} selected={channels} onChange={setChannels} />
              <MultiChip label="信用风险等级" options={RISK_LEVELS} selected={riskLevels} onChange={setRiskLevels} />
              <MultiChip label="自动审批" options={SYS_RESULTS} selected={autoResults} onChange={setAutoResults} />
              <MultiChip label="人工审核" options={WORK_STATUSES} selected={workStatuses} onChange={setWorkStatuses} />
              <input value={opKw} onChange={(e) => setOpKw(e.target.value)} placeholder="搜索审核人" className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
            </div>
            <div className="hidden min-w-[1rem] flex-1 xl:block" />
            <div className="flex flex-wrap items-center gap-3">
              <input value={scoreMin} onChange={(e) => setScoreMin(e.target.value)} placeholder="信用评分 ≥" className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
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
                  <th style={headStyle(C.score, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right font-medium">信用评分</th>
                  <th style={headStyle(C.risk, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">信用风险等级</th>
                  <th style={headStyle(C.sys, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">自动审批</th>
                  <th style={headStyle(C.work, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">人工审核</th>
                  <th style={headStyle(C.operator, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">审核人</th>
                  <th style={headStyle(C.op, 'right', 0)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 pr-[22px] text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((r) => {
                  const lvl = riskLevelFromScore(r.creditScore)
                  const scoreColor = r.creditScore >= 80 ? 'text-rose-600' : r.creditScore >= 60 ? 'text-orange-600' : r.creditScore >= 40 ? 'text-amber-600' : 'text-emerald-600'
                  return (
                    <tr key={r.id} className="group hover:bg-slate-50/60">
                      <td style={bodyStyle(C.id, 'left', 0)} className="whitespace-nowrap bg-white px-3 py-3 font-mono text-xs text-slate-700 group-hover:bg-slate-50/60">
                        <button onClick={() => goReport(r)} className="font-medium text-brand-600 hover:underline">{r.id}</button>
                      </td>
                      <td style={bodyStyle(C.name, 'left', C.id)} className="whitespace-nowrap bg-white px-3 py-3 text-slate-800 group-hover:bg-slate-50/60">{r.name}</td>
                      <td style={bodyStyle(C.product, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.product}</td>
                      <td style={bodyStyle(C.channel, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.channel}</td>
                      <td style={bodyStyle(C.amount, null)} className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">¥{r.amount.toLocaleString()}</td>
                      <td style={bodyStyle(C.score, null)} className="whitespace-nowrap px-3 py-3 text-right"><span className={`tabular-nums font-semibold ${scoreColor}`}>{r.creditScore}</span></td>
                      <td style={bodyStyle(C.risk, null)} className="whitespace-nowrap px-3 py-3 text-center"><CreditLevelBadge value={lvl} /></td>
                      <td style={bodyStyle(C.sys, null)} className="whitespace-nowrap px-3 py-3 text-center"><CreditSysResultBadge value={r.sysResult} /></td>
                      <td style={bodyStyle(C.work, null)} className="whitespace-nowrap px-3 py-3 text-center"><CreditWorkStatusBadge value={r.workStatus} /></td>
                      <td style={bodyStyle(C.operator, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.operator}</td>
                      <td style={bodyStyle(C.op, 'right', 0)} className="whitespace-nowrap bg-white px-3 py-3 pr-[22px] text-left group-hover:bg-slate-50/60">
                        <CreditKimiRowActions row={r} onApply={(next) => applyRow(r.id, next)} onView={() => goReport(r)} flash={showToast} />
                      </td>
                    </tr>
                  )
                })}
                {pageRows.length === 0 && (
                  <tr><td colSpan={11} className="whitespace-nowrap px-3 py-10 text-center text-sm text-slate-400">暂无符合条件的信用风控记录</td></tr>
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">{toast}</div>
      )}
    </div>
  )
}
