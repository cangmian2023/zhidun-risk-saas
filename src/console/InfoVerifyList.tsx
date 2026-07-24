import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel, Badge, StatCard, SingleSelect, Button, DecisionTag, StatusTag, type SelectOption } from '../components/ui'
import {
  VerifyRowActions,
  type VerifyRow,
  type SysResult,
  type WorkStatus,
} from './VerifyOps'

/* ───────────────────────── 信息核验 · 样例数据（1.5 足够样例） ───────────────────────── */
const SYS_RESULTS: SysResult[] = ['处理中', '通过', '拒绝', '预警']
const WORK_STATUSES: WorkStatus[] = [
  '核验计算中',
  '待确认',
  '已确认',
  '待审核',
  '提交复核',
  '复核通过',
  '复核拒绝',
  '强制放行',
]

// 严格对齐交互说明：自动审核 × 人工审核 × 审核员 × 异常值(欺诈分档位)
//   通过→<20 / 预警→20-60 / 拒绝→>80 / 处理中→低
const seedRows: VerifyRow[] = [
  // 1. 处理中 / 核验计算中 / -- / 查看(置灰)
  { id: 'PA-20260618-001', name: '张伟', product: '信用贷', channel: 'APP', amount: 80000, fraudScore: 8, creditScore: 742, sysResult: '处理中', workStatus: '核验计算中', operator: '--', auditTime: '2026-06-18 14:32' },
  // 2. 通过 / 待确认 / -- / 查看、报告确认
  { id: 'PA-20260618-002', name: '李娜', product: '抵押贷', channel: '线下', amount: 500000, fraudScore: 12, creditScore: 688, sysResult: '通过', workStatus: '待确认', operator: '--', auditTime: '2026-06-18 15:10' },
  // 3. 通过 / 已确认 / 初审：审核员 1 / 查看
  { id: 'PA-20260618-005', name: '陈刚', product: '信用贷', channel: '小程序', amount: 50000, fraudScore: 10, creditScore: 780, sysResult: '通过', workStatus: '已确认', operator: '初审：审核员 1', auditTime: '2026-06-18 16:40' },
  // 4. 拒绝 / 待确认 / -- / 查看、报告确认、强制复审
  { id: 'PA-20260618-003', name: '王强', product: '信用贷', channel: 'H5', amount: 30000, fraudScore: 88, creditScore: 521, sysResult: '拒绝', workStatus: '待确认', operator: '--', auditTime: '2026-06-18 15:48' },
  // 5. 拒绝 / 已确认 / 初审：审核员 1 / 查看
  { id: 'PA-20260620-011', name: '冯雪', product: '信用贷', channel: 'APP', amount: 60000, fraudScore: 85, creditScore: 498, sysResult: '拒绝', workStatus: '已确认', operator: '初审：审核员 1', auditTime: '2026-06-20 09:50' },
  // 6. 拒绝 / 强制放行 / 初审：审核员 1；终审：主管 1 / 查看
  { id: 'PA-20260619-010', name: '郑浩', product: '抵押贷', channel: '线下', amount: 680000, fraudScore: 92, creditScore: 505, sysResult: '拒绝', workStatus: '强制放行', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-06-19 14:30' },
  // 7. 预警 / 待审核 / -- / 查看、提交双人复核
  { id: 'PA-20260618-004', name: '赵敏', product: '经营贷', channel: 'APP', amount: 200000, fraudScore: 42, creditScore: 635, sysResult: '预警', workStatus: '待审核', operator: '--', auditTime: '2026-06-18 16:05' },
  // 8. 预警 / 待审核 / -- (第二笔)
  { id: 'PA-20260618-006', name: '刘洋', product: '抵押贷', channel: '线下', amount: 350000, fraudScore: 35, creditScore: 560, sysResult: '预警', workStatus: '待审核', operator: '--', auditTime: '2026-06-19 09:12' },
  // 9. 预警 / 提交复核 / 初审：审核员 1 / 查看、确认放行、确认拒绝
  { id: 'PA-20260619-007', name: '孙丽', product: '信用贷', channel: 'APP', amount: 120000, fraudScore: 30, creditScore: 700, sysResult: '预警', workStatus: '提交复核', operator: '初审：审核员 1', auditTime: '2026-06-19 10:03' },
  // 10. 预警 / 复核通过 / 初审：审核员 1；终审：主管 1 / 查看
  { id: 'PA-20260620-012', name: '蒋磊', product: '经营贷', channel: 'H5', amount: 150000, fraudScore: 47, creditScore: 540, sysResult: '预警', workStatus: '复核通过', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-06-20 10:25' },
  // 11. 预警 / 复核拒绝 / 初审：审核员 1；终审：主管 1 / 查看
  { id: 'PA-20260620-013', name: '韩梅', product: '信用贷', channel: '小程序', amount: 35000, fraudScore: 52, creditScore: 763, sysResult: '预警', workStatus: '复核拒绝', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-06-20 11:15' },
  // 12. 通过 / 待确认 / -- (第二笔)
  { id: 'PA-20260619-009', name: '吴婷', product: '信用贷', channel: '小程序', amount: 45000, fraudScore: 9, creditScore: 755, sysResult: '通过', workStatus: '待确认', operator: '--', auditTime: '2026-06-19 13:45' },
  // 13. 通过 / 已确认 / 初审：审核员 1 (第二笔)
  { id: 'PA-20260619-008', name: '周杰', product: '经营贷', channel: 'H5', amount: 90000, fraudScore: 15, creditScore: 612, sysResult: '通过', workStatus: '已确认', operator: '初审：审核员 1', auditTime: '2026-06-19 11:20' },
  // 14. 拒绝 / 已确认 / 初审：审核员 1 (第二笔)
  { id: 'PA-20260620-014', name: '杨柳', product: '抵押贷', channel: '线下', amount: 420000, fraudScore: 81, creditScore: 605, sysResult: '拒绝', workStatus: '已确认', operator: '初审：审核员 1', auditTime: '2026-06-20 14:08' },
]

const PRODUCTS = ['信用贷', '抵押贷', '经营贷']
const CHANNELS = ['APP', 'H5', '小程序', '线下']
const TIME_OPTIONS: SelectOption[] = [
  { value: '7', label: '近 7 天' },
  { value: '30', label: '近 30 天' },
  { value: '90', label: '近 90 天' },
]

// 信用值列 = 100 − 欺诈分（0-100）；分值越高越安全：高绿 / 中黄 / 低红
// 自动审核 / 人工审核 两套独立标签体系，沿用申贷审核的 DecisionTag（实色胶囊）/ StatusTag（带点描边）
const SYS_KIND: Record<SysResult, 'gray' | 'green' | 'red' | 'amber'> = {
  处理中: 'gray', 通过: 'green', 拒绝: 'red', 预警: 'amber',
}
const WORK_KIND: Record<WorkStatus, 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
  核验计算中: 'gray', 待确认: 'blue', 已确认: 'green', 待审核: 'amber',
  提交复核: 'amber', '复核通过': 'green', '复核拒绝': 'red', 强制放行: 'violet',
}

/* ───────────────────────── 多选项下拉（沿用申贷审核筛选卡外观） ───────────────────────── */
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

/* ───────────────────────── 冻结列：前两列固定（左）/ 操作列固定（右），中间横向滚动 ───────────────────────── */
type Side = 'left' | 'right' | null
const C = {
  id: 168,
  name: 104,
  product: 96,
  channel: 84,
  amount: 128,
  score: 100,
  sys: 116,
  work: 148,
  operator: 208,
  time: 160,
  op: 224,
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

export default function InfoVerifyList() {
  const [rows, setRows] = useState<VerifyRow[]>(seedRows)

  // 筛选状态（筛选项对齐信息核验列表列：申请编号/申请人·产品·渠道·申请额度·综合打分·自动审核·人工审核·审核人·申请时间）
  const [kw, setKw] = useState('') // 申请编号 / 申请人
  const [products, setProducts] = useState<string[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const [sysResults, setSysResults] = useState<SysResult[]>([]) // 自动审核
  const [workStatuses, setWorkStatuses] = useState<WorkStatus[]>([]) // 人工审核
  const [opKw, setOpKw] = useState('') // 审核人
  const [creditMax, setCreditMax] = useState('') // 信用值 ≤
  const [amountMax, setAmountMax] = useState('') // 申请额度 ≤
  const [timeRange, setTimeRange] = useState('') // 申请时间

  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [toast, setToast] = useState<string | null>(null)
  const nav = useNavigate()
  const toastTimer = useRef<number | null>(null)

  // 查看 / 申请编号点击 → 跳转信息核验报告详情页（路由 /console/cr/pre-verify-detail，与申贷审核的页内切换不同）
  // 通过 URL 参数把该行的「自动审核 / 人工审核 / 审核人 / 编号」带到报告页，确保详情页状态与操作按钮一致
  const goReport = (r: VerifyRow) =>
    nav(
      `/console/cr/pre-verify-detail?sys=${encodeURIComponent(r.sysResult)}&work=${encodeURIComponent(
        r.workStatus,
      )}&op=${encodeURIComponent(r.operator)}&id=${encodeURIComponent(r.id)}`,
    )

  const showToast = (m: string) => {
    setToast(m)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  const applyRow = (id: string, next: Partial<VerifyRow>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...next } : r)))

  // ── 统计项（1.2 旧核验页面口径，源自 VerifyRow 工作流）──
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
    const now = new Date('2026-06-20T23:59:59').getTime()
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
      {/* 1.1 面包屑 / 标题 / 提示：保持旧版信息核验不变 */}
      <PageHeader
        crumb="零售信贷风控 / 贷前审核"
        title="信息核验"
        subtitle="贷前审核 · 核验 / 反欺诈 / 信用交叉结果 + 工单人工处置（操作随审核状态动态变化）"
      />

      <div className="mx-auto max-w-[1400px] space-y-5 px-4 pb-10">
        {/* 1.2 顶部 4 个统计项：旧核验页面口径 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} hint={s.hint} accent={s.accent} />
          ))}
        </div>

        {/* 1.3 筛选条件卡片：沿用申贷审核筛选卡外观，筛选项对齐列表列（样式继承、未改观感） */}
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
              <MultiChip label="自动审核" options={SYS_RESULTS} selected={sysResults} onChange={setSysResults} />
              <MultiChip label="人工审核" options={WORK_STATUSES} selected={workStatuses} onChange={setWorkStatuses} />
              <input
                value={opKw}
                onChange={(e) => setOpKw(e.target.value)}
                placeholder="搜索审核人"
                className="w-40 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
              />
            </div>
            {/* 弹性占位：仅宽屏时把右侧条件推到最右，避免小屏换行出现巨大空隙 */}
            <div className="hidden min-w-[1rem] flex-1 xl:block" />
            <div className="flex flex-wrap items-center gap-3">
              <input value={creditMax} onChange={(e) => setCreditMax(e.target.value)} placeholder="信用值 ≤" className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
              <input value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="申请额度 ≤" className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
              <SingleSelect label="申请时间" options={TIME_OPTIONS} value={timeRange} onChange={setTimeRange} clearable />
              <Button variant="ghost" onClick={resetFilters}>重置</Button>
            </div>
          </div>
        </Panel>

        {/* 1.4 列表：前两列与操作列冻结，中间横向滚动；列宽贴合内容、不换行 */}
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
                      {/* 自动审核：沿用申贷审核「决策结果」体系（DecisionTag 实色胶囊） */}
                      <td style={bodyStyle(C.sys, null)} className="whitespace-nowrap px-3 py-3 text-center">
                        <DecisionTag kind={SYS_KIND[r.sysResult]} soft={r.sysResult === '处理中'}>{r.sysResult}</DecisionTag>
                      </td>
                      {/* 人工审核：沿用申贷审核「审核状态」体系（StatusTag 带点描边，独立标签） */}
                      <td style={bodyStyle(C.work, null)} className="whitespace-nowrap px-3 py-3 text-center">
                        <StatusTag kind={WORK_KIND[r.workStatus]}>{r.workStatus}</StatusTag>
                      </td>
                      <td style={bodyStyle(C.operator, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.operator}</td>
                      <td style={bodyStyle(C.time, null)} className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-500">{r.auditTime}</td>
                      <td style={bodyStyle(C.op, 'right', 0)} className="whitespace-nowrap bg-white px-3 py-3 pr-[22px] text-left group-hover:bg-slate-50/60">
                        <VerifyRowActions row={r} onApply={(next) => applyRow(r.id, next)} onView={() => goReport(r)} flash={showToast} />
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

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-[100] -translate-x-1/2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
