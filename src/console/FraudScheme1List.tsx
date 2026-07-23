// 欺诈识别（方案1）· 列表页
// 框架与信息核验 InfoVerifyList 完全对齐：统计概览 / 筛选卡 / 冻结列宽表格 / 行内操作矩阵 / 两套独立标签体系
import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel, Badge, StatCard, SingleSelect, Button, DecisionTag, StatusTag, type SelectOption } from '../components/ui'
import {
  FraudRowActions,
  type FraudRow,
  type FraudSysResult,
  type FraudWorkStatus,
} from './FraudScheme1Ops'

/* ───────────────────────── 欺诈识别 · 样例数据 ───────────────────────── */
const FRAUD_SYS: FraudSysResult[] = ['处理中', '无风险', '确认欺诈', '可疑']
const FRAUD_WORK: FraudWorkStatus[] = [
  '欺诈评估中',
  '待确认',
  '已排除',
  '已确认',
  '已加入黑名单办结',
  '待复审',
  '已提交双人复核',
  '双人复核-排除',
  '双人复核-确认欺诈',
  '已标记观察',
]

// 自动判定：无风险绿 / 可疑黄 / 确认欺诈红 / 处理中灰
const SYS_KIND: Record<FraudSysResult, 'gray' | 'green' | 'red' | 'amber'> = {
  处理中: 'gray', 无风险: 'green', 确认欺诈: 'red', 可疑: 'amber',
}
// 人工状态：欺诈评估中灰 / 待确认蓝 / 已排除绿 / 已确认红 / 已加入黑名单办结紫 / 待复审黄 / 已提交双人复核黄 / 双人复核-排除绿 / 双人复核-确认欺诈红 / 已标记观察黄
const WORK_KIND: Record<FraudWorkStatus, 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
  欺诈评估中: 'gray', 待确认: 'blue', 已排除: 'green', 已确认: 'red', 已加入黑名单办结: 'violet',
  待复审: 'amber', 已提交双人复核: 'amber', '双人复核-排除': 'green', '双人复核-确认欺诈': 'red', 已标记观察: 'amber',
}

// 严格对齐交互说明：自动判定 × 人工状态 × 审核员 × 欺诈分档位
//   无风险→<400 / 可疑→400-700 / 确认欺诈→>700 / 处理中→低
const seedRows: FraudRow[] = [
  { id: 'FR-20260618-001', name: '张*伟', product: '信用贷', channel: 'APP', amount: 80000, fraudScore: 95, creditScore: 742, sysResult: '处理中', workStatus: '欺诈评估中', operator: '--', auditTime: '2026-06-18 14:32' },
  { id: 'FR-20260618-002', name: '李*娜', product: '抵押贷', channel: '线下', amount: 500000, fraudScore: 120, creditScore: 688, sysResult: '无风险', workStatus: '待确认', operator: '--', auditTime: '2026-06-18 15:10' },
  { id: 'FR-20260618-005', name: '陈*刚', product: '信用贷', channel: '小程序', amount: 50000, fraudScore: 88, creditScore: 780, sysResult: '无风险', workStatus: '已排除', operator: '初审：审核员 1', auditTime: '2026-06-18 16:40' },
  { id: 'FR-20260618-003', name: '王*强', product: '信用贷', channel: 'H5', amount: 30000, fraudScore: 870, creditScore: 521, sysResult: '确认欺诈', workStatus: '待确认', operator: '--', auditTime: '2026-06-18 15:48' },
  { id: 'FR-20260620-011', name: '冯*雪', product: '信用贷', channel: 'APP', amount: 60000, fraudScore: 905, creditScore: 498, sysResult: '确认欺诈', workStatus: '已确认', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-06-20 09:50' },
  { id: 'FR-20260619-010', name: '郑*浩', product: '抵押贷', channel: '线下', amount: 680000, fraudScore: 932, creditScore: 505, sysResult: '确认欺诈', workStatus: '已加入黑名单办结', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-06-19 14:30' },
  { id: 'FR-20260618-004', name: '赵*敏', product: '经营贷', channel: 'APP', amount: 200000, fraudScore: 520, creditScore: 635, sysResult: '可疑', workStatus: '待复审', operator: '--', auditTime: '2026-06-18 16:05' },
  { id: 'FR-20260618-006', name: '刘*洋', product: '抵押贷', channel: '线下', amount: 350000, fraudScore: 480, creditScore: 560, sysResult: '可疑', workStatus: '待复审', operator: '--', auditTime: '2026-06-19 09:12' },
  { id: 'FR-20260619-007', name: '孙*丽', product: '信用贷', channel: 'APP', amount: 120000, fraudScore: 610, creditScore: 700, sysResult: '可疑', workStatus: '已提交双人复核', operator: '初审：审核员 1', auditTime: '2026-06-19 10:03' },
  { id: 'FR-20260620-012', name: '蒋*磊', product: '经营贷', channel: 'H5', amount: 150000, fraudScore: 440, creditScore: 540, sysResult: '可疑', workStatus: '已标记观察', operator: '初审：审核员 1', auditTime: '2026-06-20 10:25' },
  { id: 'FR-20260620-013', name: '韩*梅', product: '信用贷', channel: '小程序', amount: 35000, fraudScore: 560, creditScore: 763, sysResult: '可疑', workStatus: '双人复核-排除', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-06-20 11:15' },
  { id: 'FR-20260619-009', name: '吴*婷', product: '信用贷', channel: '小程序', amount: 45000, fraudScore: 102, creditScore: 755, sysResult: '无风险', workStatus: '待确认', operator: '--', auditTime: '2026-06-19 13:45' },
  { id: 'FR-20260619-008', name: '周*杰', product: '经营贷', channel: 'H5', amount: 90000, fraudScore: 150, creditScore: 612, sysResult: '无风险', workStatus: '已排除', operator: '初审：审核员 1', auditTime: '2026-06-19 11:20' },
  { id: 'FR-20260620-014', name: '杨*柳', product: '抵押贷', channel: '线下', amount: 420000, fraudScore: 880, creditScore: 605, sysResult: '确认欺诈', workStatus: '待确认', operator: '--', auditTime: '2026-06-20 14:08' },
]

const PRODUCTS = ['信用贷', '抵押贷', '经营贷']
const CHANNELS = ['APP', 'H5', '小程序', '线下']
const TIME_OPTIONS: SelectOption[] = [
  { value: '7', label: '近 7 天' },
  { value: '30', label: '近 30 天' },
  { value: '90', label: '近 90 天' },
]

/* ───────────────────────── 多选项下拉（沿用信息核验筛选卡外观） ───────────────────────── */
function MultiChip<T extends string>({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: T[]
  selected: T[]
  onChange: (v: T[]) => void
}) {
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
  id: 168, name: 104, product: 96, channel: 84, amount: 128, score: 110, sys: 120, work: 168, operator: 208, time: 160, op: 224,
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

export default function FraudScheme1List() {
  const [rows, setRows] = useState<FraudRow[]>(seedRows)

  const [kw, setKw] = useState('')
  const [products, setProducts] = useState<string[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const [sysResults, setSysResults] = useState<FraudSysResult[]>([])
  const [workStatuses, setWorkStatuses] = useState<FraudWorkStatus[]>([])
  const [opKw, setOpKw] = useState('')
  const [scoreMin, setScoreMin] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [timeRange, setTimeRange] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [toast, setToast] = useState<string | null>(null)
  const nav = useNavigate()
  const toastTimer = useRef<number | null>(null)

  const goReport = (r: FraudRow) =>
    nav(
      `/console/cr/fraud-s1-detail?sys=${encodeURIComponent(r.sysResult)}&work=${encodeURIComponent(
        r.workStatus,
      )}&op=${encodeURIComponent(r.operator)}&id=${encodeURIComponent(r.id)}`,
    )

  const showToast = (m: string) => {
    setToast(m)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  const applyRow = (id: string, next: Partial<FraudRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...next } : r)))

  const stats = useMemo(() => {
    const total = rows.length
    const pending = rows.filter((r) => ['欺诈评估中', '待确认', '待复审'].includes(r.workStatus)).length
    const review = rows.filter((r) => r.workStatus === '已提交双人复核').length
    const fraud = rows.filter((r) => r.sysResult === '确认欺诈').length
    const black = rows.filter((r) => r.workStatus === '已加入黑名单办结').length
    return [
      { label: '待人工处置', value: String(pending), hint: '评估中 / 待确认 / 待复审', accent: 'amber' as const },
      { label: '确认欺诈率', value: total ? `${Math.round((fraud / total) * 100)}%` : '0%', hint: `确认欺诈 ${fraud} / 共 ${total} 笔`, accent: 'rose' as const },
      { label: '待双人复核', value: String(review), hint: '已提交双人复核等待终审', accent: 'violet' as const },
      { label: '强制加黑(高敏感)', value: String(black), hint: '已加入黑名单办结件', accent: 'rose' as const },
    ]
  }, [rows])

  const filtered = useMemo(() => {
    const now = new Date('2026-06-20T23:59:59').getTime()
    return rows.filter((r) => {
      if (kw && !`${r.id} ${r.name}`.toLowerCase().includes(kw.toLowerCase())) return false
      if (products.length && !products.includes(r.product)) return false
      if (channels.length && !channels.includes(r.channel)) return false
      if (sysResults.length && !sysResults.includes(r.sysResult)) return false
      if (workStatuses.length && !workStatuses.includes(r.workStatus)) return false
      if (opKw && !r.operator.toLowerCase().includes(opKw.toLowerCase())) return false
      if (scoreMin && r.fraudScore < Number(scoreMin)) return false
      if (amountMax && r.amount > Number(amountMax)) return false
      if (timeRange) {
        const t = new Date(r.auditTime.replace(' ', 'T')).getTime()
        if (now - t > Number(timeRange) * 86400000) return false
      }
      return true
    })
  }, [rows, kw, products, channels, sysResults, workStatuses, opKw, scoreMin, amountMax, timeRange])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const resetFilters = () => {
    setKw(''); setProducts([]); setChannels([]); setSysResults([]); setWorkStatuses([])
    setOpKw(''); setScoreMin(''); setAmountMax(''); setTimeRange('')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PageHeader
        crumb="零售信贷风控 / 贷前审核"
        title="欺诈识别（方案1）"
        subtitle="反欺诈评分 / 欺诈网络 / 关联黑名单 + 工单人工处置（操作随审核状态动态变化）"
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
              <input
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                placeholder="搜索申请编号 / 申请人"
                className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
              <MultiChip label="产品" options={PRODUCTS} selected={products} onChange={setProducts} />
              <MultiChip label="渠道" options={CHANNELS} selected={channels} onChange={setChannels} />
              <MultiChip label="自动判定" options={FRAUD_SYS} selected={sysResults} onChange={setSysResults} />
              <MultiChip label="人工状态" options={FRAUD_WORK} selected={workStatuses} onChange={setWorkStatuses} />
              <input
                value={opKw}
                onChange={(e) => setOpKw(e.target.value)}
                placeholder="搜索审核人"
                className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            <div className="hidden min-w-[1rem] flex-1 xl:block" />
            <div className="flex flex-wrap items-center gap-3">
              <input value={scoreMin} onChange={(e) => setScoreMin(e.target.value)} placeholder="欺诈分 ≥" className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
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
                  <th style={headStyle(C.score, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right font-medium">欺诈分</th>
                  <th style={headStyle(C.sys, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">自动判定</th>
                  <th style={headStyle(C.work, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">人工状态</th>
                  <th style={headStyle(C.operator, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">审核人</th>
                  <th style={headStyle(C.time, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">申请时间</th>
                  <th style={headStyle(C.op, 'right', 0)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 pr-[22px] text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((r) => {
                  const s = r.fraudScore
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
                        <span className={`tabular-nums font-semibold ${SYS_KIND[r.sysResult] === 'green' ? 'text-emerald-600' : SYS_KIND[r.sysResult] === 'amber' ? 'text-amber-600' : SYS_KIND[r.sysResult] === 'red' ? 'text-rose-600' : 'text-slate-400'}`}>{s}</span>
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
                        <FraudRowActions row={r} onApply={(next) => applyRow(r.id, next)} onView={() => goReport(r)} flash={showToast} />
                      </td>
                    </tr>
                  )
                })}
                {pageRows.length === 0 && (
                  <tr><td colSpan={11} className="whitespace-nowrap px-3 py-10 text-center text-sm text-slate-400">暂无符合条件的记录</td></tr>
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
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
