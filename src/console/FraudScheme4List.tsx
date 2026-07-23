// 欺诈识别（方案4 · 完整版）· 列表页
// 平行、独立、不破坏现有 cr:pre-fraud。框架/交互 1:1 复用信息核验体系（统计卡片 / 多筛选 / 冻结列宽表格 / 行内操作矩阵）。
// 内容承载方案4 文档的列表设计：4 张顶部统计卡 + 9 个筛选条件 + 13 列富表格；人工处置状态按方案4 独立状态机流转。
import { useMemo, useRef, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel, Badge, StatCard, SingleSelect, Button, type SelectOption } from '../components/ui'
import type {
  FraudS4ScoreBand,
  FraudS4RuleType,
  FraudS4AutoDecision,
  FraudS4WorkStatus,
} from './fraudScheme4Report'
import {
  FraudScheme4RowActions,
  FraudScheme4BandBadge,
  FraudScheme4AutoBadge,
  FraudScheme4WorkBadge,
  type FraudScheme4Row,
} from './FraudScheme4Ops'

/* ───────────────────────── 取值与筛选常量（对齐文档 1.3 / 1.5） ───────────────────────── */
// 欺诈风险等级（四档：极低/低(0-39)·中(40-59)·高(60-79)·极高(80-100)）
const BANDS: FraudS4ScoreBand[] = ['极低', '低', '中', '高', '极高']
// 命中规则类型（六类）
const RULE_TYPES: FraudS4RuleType[] = ['设备欺诈', '身份欺诈', '团伙欺诈', '行为欺诈', '信息伪造', '黑名单命中']
// 自动决策
const AUTO_DECISIONS: FraudS4AutoDecision[] = ['通过', '拒绝', '转人工', '观察']
// 人工处置状态（方案4 独立状态机）
const WORK_STATUS: FraudS4WorkStatus[] = ['待复核', '复核中', '已确认欺诈', '误判放行', '已归档']
// 团伙标签候选（来自样例数据）
const GANG_TAGS: string[] = ['未关联团伙', '团伙A', '团伙B（疑似）', '团伙C']
// 命中黑名单（命中 = 命中黑名单命中类规则）
const BLACKLIST_OPTS: SelectOption[] = [
  { value: 'hit', label: '已命中黑名单' },
  { value: 'miss', label: '未命中黑名单' },
]
const TIME_OPTIONS: SelectOption[] = [
  { value: '7', label: '近 7 天' },
  { value: '30', label: '近 30 天' },
  { value: '90', label: '近 90 天' },
]

/* 样例行：扩展 FraudScheme4Row，附带列表联动用的申请时间 / 处置时间 */
type S4ListRow = FraudScheme4Row & { applyTime: string; disposeTime: string }

const seedRows: S4ListRow[] = [
  { id: 'FA-20260618-003', name: '王*强', product: '信用贷', amount: 30000, fraudScore: 88, scoreBand: '极高', hitRuleCount: 5, ruleTypes: ['设备欺诈', '团伙欺诈', '黑名单命中'], autoDecision: '拒绝', workStatus: '待复核', operator: '--', gangTag: '团伙A', applyTime: '2026-07-21 14:55', disposeTime: '' },
  { id: 'FA-20260618-004', name: '赵*敏', product: '经营贷', amount: 200000, fraudScore: 52, scoreBand: '中', hitRuleCount: 2, ruleTypes: ['设备欺诈', '团伙欺诈'], autoDecision: '转人工', workStatus: '待复核', operator: '--', gangTag: '团伙B（疑似）', applyTime: '2026-07-21 13:15', disposeTime: '' },
  { id: 'FA-20260620-011', name: '冯*雪', product: '信用贷', amount: 60000, fraudScore: 91, scoreBand: '极高', hitRuleCount: 6, ruleTypes: ['设备欺诈', '身份欺诈', '团伙欺诈', '黑名单命中'], autoDecision: '拒绝', workStatus: '复核中', operator: '风控专员-张磊', gangTag: '团伙C', applyTime: '2026-07-20 09:50', disposeTime: '2026-07-20 18:20' },
  { id: 'FA-20260619-010', name: '郑*浩', product: '抵押贷', amount: 680000, fraudScore: 95, scoreBand: '极高', hitRuleCount: 7, ruleTypes: ['设备欺诈', '团伙欺诈', '行为欺诈', '黑名单命中'], autoDecision: '拒绝', workStatus: '已确认欺诈', operator: '风控专员-张磊；主管-王芳', gangTag: '团伙A', applyTime: '2026-07-19 14:30', disposeTime: '2026-07-19 17:10' },
  { id: 'FA-20260619-007', name: '孙*丽', product: '信用贷', amount: 120000, fraudScore: 61, scoreBand: '高', hitRuleCount: 3, ruleTypes: ['行为欺诈', '信息伪造'], autoDecision: '转人工', workStatus: '误判放行', operator: '初审：审核员 1', gangTag: '未关联团伙', applyTime: '2026-07-19 10:03', disposeTime: '2026-07-20 09:40' },
  { id: 'FA-20260620-012', name: '蒋*磊', product: '经营贷', amount: 150000, fraudScore: 44, scoreBand: '中', hitRuleCount: 1, ruleTypes: ['行为欺诈'], autoDecision: '观察', workStatus: '已归档', operator: '初审：审核员 1', gangTag: '未关联团伙', applyTime: '2026-07-20 10:25', disposeTime: '2026-07-21 11:15' },
  { id: 'FA-20260618-001', name: '张*伟', product: '信用贷', amount: 80000, fraudScore: 8, scoreBand: '低', hitRuleCount: 0, ruleTypes: [], autoDecision: '通过', workStatus: '待复核', operator: '--', gangTag: '未关联团伙', applyTime: '2026-07-18 11:20', disposeTime: '' },
  { id: 'FA-20260618-002', name: '李*娜', product: '抵押贷', amount: 500000, fraudScore: 15, scoreBand: '低', hitRuleCount: 0, ruleTypes: [], autoDecision: '通过', workStatus: '待复核', operator: '--', gangTag: '未关联团伙', applyTime: '2026-07-18 15:10', disposeTime: '' },
  { id: 'FA-20260620-013', name: '韩*梅', product: '信用贷', amount: 35000, fraudScore: 56, scoreBand: '中', hitRuleCount: 2, ruleTypes: ['设备欺诈', '行为欺诈'], autoDecision: '转人工', workStatus: '复核中', operator: '初审：审核员 1', gangTag: '未关联团伙', applyTime: '2026-07-20 11:15', disposeTime: '2026-07-21 09:00' },
  { id: 'FA-20260618-005', name: '陈*刚', product: '信用贷', amount: 50000, fraudScore: 9, scoreBand: '低', hitRuleCount: 0, ruleTypes: [], autoDecision: '通过', workStatus: '待复核', operator: '--', gangTag: '未关联团伙', applyTime: '2026-07-18 16:40', disposeTime: '' },
  { id: 'FA-20260619-008', name: '周*杰', product: '经营贷', amount: 90000, fraudScore: 16, scoreBand: '低', hitRuleCount: 0, ruleTypes: [], autoDecision: '通过', workStatus: '待复核', operator: '--', gangTag: '未关联团伙', applyTime: '2026-07-19 11:20', disposeTime: '' },
  { id: 'FA-20260620-014', name: '杨*柳', product: '抵押贷', amount: 420000, fraudScore: 88, scoreBand: '极高', hitRuleCount: 5, ruleTypes: ['设备欺诈', '团伙欺诈', '黑名单命中'], autoDecision: '拒绝', workStatus: '待复核', operator: '--', gangTag: '团伙A', applyTime: '2026-07-20 14:08', disposeTime: '' },
  { id: 'FA-20260619-009', name: '吴*婷', product: '信用贷', amount: 45000, fraudScore: 11, scoreBand: '低', hitRuleCount: 0, ruleTypes: [], autoDecision: '通过', workStatus: '已归档', operator: '初审：审核员 1', gangTag: '未关联团伙', applyTime: '2026-07-19 13:45', disposeTime: '2026-07-20 16:30' },
  { id: 'FA-20260620-015', name: '何*强', product: '信用贷', amount: 70000, fraudScore: 67, scoreBand: '高', hitRuleCount: 3, ruleTypes: ['行为欺诈', '信息伪造', '设备欺诈'], autoDecision: '转人工', workStatus: '复核中', operator: '初审：审核员 1', gangTag: '团伙B（疑似）', applyTime: '2026-07-21 08:42', disposeTime: '' },
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
          selected.length ? 'border-rose-300 bg-rose-50 text-rose-700' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'
        }`}
      >
        {label}
        {selected.length > 0 && <Badge kind="red" className="ml-1">{selected.length}</Badge>}
        <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 7.5 10 12l4.5-4.5" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-30 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            {options.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} className="h-4 w-4 rounded border-slate-300 text-rose-600" />
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
  id: 168, name: 104, product: 96, amount: 128, band: 112, hits: 96, rule: 200, score: 104, auto: 104, work: 128, operator: 208, gang: 144, op: 224,
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

const scoreColor = (v: number) => (v >= 80 ? 'text-rose-600' : v >= 60 ? 'text-orange-600' : v >= 40 ? 'text-amber-600' : 'text-emerald-600')

export default function FraudScheme4List() {
  const [rows, setRows] = useState<S4ListRow[]>(seedRows)

  const [kw, setKw] = useState('')
  const [bands, setBands] = useState<FraudS4ScoreBand[]>([])
  const [ruleTypes, setRuleTypes] = useState<FraudS4RuleType[]>([])
  const [auto, setAuto] = useState('')
  const [works, setWorks] = useState<FraudS4WorkStatus[]>([])
  const [blacklist, setBlacklist] = useState('')
  const [gang, setGang] = useState('')
  const [applyTime, setApplyTime] = useState('')
  const [disposeTime, setDisposeTime] = useState('')

  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const [toast, setToast] = useState<string | null>(null)
  const nav = useNavigate()
  const toastTimer = useRef<number | null>(null)

  const goReport = (r: S4ListRow) =>
    nav(
      `/console/cr/fraud-s4-detail?sys=${encodeURIComponent(r.scoreBand)}&work=${encodeURIComponent(
        r.workStatus,
      )}&op=${encodeURIComponent(r.operator)}&id=${encodeURIComponent(r.id)}`,
    )

  const showToast = (m: string) => {
    setToast(m)
    if (toastTimer.current) window.clearTimeout(toastTimer.current)
    toastTimer.current = window.setTimeout(() => setToast(null), 2200)
  }

  const applyRow = (id: string, next: Partial<FraudScheme4Row>) =>
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...next } : r)))

  const stats = useMemo(() => {
    const total = rows.length
    const pending = rows.filter((r) => r.workStatus === '待复核' || r.workStatus === '复核中').length
    const reject = rows.filter((r) => r.autoDecision === '拒绝').length
    const gang = rows.filter((r) => r.gangTag !== '未关联团伙').length
    const today = '2026-07-21'
    const todayNew = rows.filter((r) => r.applyTime.startsWith(today)).length
    return [
      { label: '待处置欺诈案件', value: String(pending), hint: '待复核 / 复核中 待人工处置', accent: 'amber' as const },
      { label: '欺诈拦截率', value: total ? `${Math.round((reject / total) * 100)}%` : '0%', hint: `自动拒绝 ${reject} / 共 ${total} 笔`, accent: 'rose' as const },
      { label: '团伙欺诈预警', value: String(gang), hint: '已关联欺诈团伙案件', accent: 'rose' as const },
      { label: '今日新增欺诈', value: String(todayNew), hint: '今日（07-21）新增申请', accent: 'violet' as const },
    ]
  }, [rows])

  const filtered = useMemo(() => {
    const refApply = new Date('2026-07-21T23:59:59').getTime()
    const refDispose = new Date('2026-07-21T23:59:59').getTime()
    return rows.filter((r) => {
      if (kw && !`${r.id} ${r.name}`.toLowerCase().includes(kw.toLowerCase())) return false
      if (bands.length && !bands.includes(r.scoreBand)) return false
      if (ruleTypes.length && !ruleTypes.some((t) => r.ruleTypes.includes(t))) return false
      if (auto && r.autoDecision !== auto) return false
      if (works.length && !works.includes(r.workStatus)) return false
      if (blacklist === 'hit' && !r.ruleTypes.includes('黑名单命中')) return false
      if (blacklist === 'miss' && r.ruleTypes.includes('黑名单命中')) return false
      if (gang && r.gangTag !== gang) return false
      if (applyTime) {
        const t = new Date(r.applyTime.replace(' ', 'T')).getTime()
        if (refApply - t > Number(applyTime) * 86400000) return false
      }
      if (disposeTime) {
        if (!r.disposeTime) return false
        const t = new Date(r.disposeTime.replace(' ', 'T')).getTime()
        if (refDispose - t > Number(disposeTime) * 86400000) return false
      }
      return true
    })
  }, [rows, kw, bands, ruleTypes, auto, works, blacklist, gang, applyTime, disposeTime])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const resetFilters = () => {
    setKw(''); setBands([]); setRuleTypes([]); setAuto(''); setWorks([])
    setBlacklist(''); setGang(''); setApplyTime(''); setDisposeTime('')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PageHeader
        crumb="零售信贷风控 / 贷前审核"
        title="欺诈识别（方案4）"
        subtitle="完整版设计文档实现 · 四档风险等级 + 六类规则命中 + 独立欺诈处置状态机（确认欺诈 / 误判放行 / 加入黑名单 / 提交复核 / 录入备注 / 归档）"
      />

      <div className="mx-auto max-w-[1500px] space-y-5 px-4 pb-10">
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
                className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              />
              <MultiChip label="欺诈风险等级" options={BANDS} selected={bands} onChange={setBands} />
              <MultiChip label="命中规则类型" options={RULE_TYPES} selected={ruleTypes} onChange={setRuleTypes} />
              <SingleSelect label="自动决策" options={AUTO_DECISIONS.map((a) => ({ value: a, label: a }))} value={auto} onChange={setAuto} clearable />
              <MultiChip label="人工处置状态" options={WORK_STATUS} selected={works} onChange={setWorks} />
              <SingleSelect label="命中黑名单" options={BLACKLIST_OPTS} value={blacklist} onChange={setBlacklist} clearable />
              <SingleSelect label="团伙标签" options={GANG_TAGS.map((g) => ({ value: g, label: g }))} value={gang} onChange={setGang} clearable />
            </div>
            <div className="hidden min-w-[1rem] flex-1 xl:block" />
            <div className="flex flex-wrap items-center gap-3">
              <SingleSelect label="申请时间" options={TIME_OPTIONS} value={applyTime} onChange={setApplyTime} clearable />
              <SingleSelect label="处置时间" options={TIME_OPTIONS} value={disposeTime} onChange={setDisposeTime} clearable />
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
                  <th style={headStyle(C.amount, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right font-medium">申请额度</th>
                  <th style={headStyle(C.band, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">欺诈风险等级</th>
                  <th style={headStyle(C.hits, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">命中规则数</th>
                  <th style={headStyle(C.rule, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">命中规则类型</th>
                  <th style={headStyle(C.score, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right font-medium">欺诈评分</th>
                  <th style={headStyle(C.auto, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">自动决策</th>
                  <th style={headStyle(C.work, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">人工处置状态</th>
                  <th style={headStyle(C.operator, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">处置人</th>
                  <th style={headStyle(C.gang, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">团伙标签</th>
                  <th style={headStyle(C.op, 'right', 0)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 pr-[22px] text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((r) => (
                  <tr key={r.id} className="group hover:bg-slate-50/60">
                    <td style={bodyStyle(C.id, 'left', 0)} className="whitespace-nowrap bg-white px-3 py-3 font-mono text-xs text-slate-700 group-hover:bg-slate-50/60">
                      <button onClick={() => goReport(r)} className="font-medium text-brand-600 hover:underline">{r.id}</button>
                    </td>
                    <td style={bodyStyle(C.name, 'left', C.id)} className="whitespace-nowrap bg-white px-3 py-3 text-slate-800 group-hover:bg-slate-50/60">{r.name}</td>
                    <td style={bodyStyle(C.product, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.product}</td>
                    <td style={bodyStyle(C.amount, null)} className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">¥{r.amount.toLocaleString()}</td>
                    <td style={bodyStyle(C.band, null)} className="whitespace-nowrap px-3 py-3 text-center">
                      <FraudScheme4BandBadge value={r.scoreBand} />
                    </td>
                    <td style={bodyStyle(C.hits, null)} className="whitespace-nowrap px-3 py-3 text-center tabular-nums font-semibold text-ink-900">{r.hitRuleCount}</td>
                    <td style={bodyStyle(C.rule, null)} className="whitespace-nowrap px-3 py-3">
                      {r.ruleTypes.length === 0 ? (
                        <span className="text-xs text-slate-300">无</span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {r.ruleTypes.map((t) => <Badge key={t} kind="blue">{t}</Badge>)}
                        </div>
                      )}
                    </td>
                    <td style={bodyStyle(C.score, null)} className="whitespace-nowrap px-3 py-3 text-right">
                      <span className={`tabular-nums font-semibold ${scoreColor(r.fraudScore)}`}>{r.fraudScore}</span>
                    </td>
                    <td style={bodyStyle(C.auto, null)} className="whitespace-nowrap px-3 py-3 text-center">
                      <FraudScheme4AutoBadge value={r.autoDecision} />
                    </td>
                    <td style={bodyStyle(C.work, null)} className="whitespace-nowrap px-3 py-3 text-center">
                      <FraudScheme4WorkBadge value={r.workStatus} />
                    </td>
                    <td style={bodyStyle(C.operator, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.operator}</td>
                    <td style={bodyStyle(C.gang, null)} className="whitespace-nowrap px-3 py-3 text-slate-700">{r.gangTag}</td>
                    <td style={bodyStyle(C.op, 'right', 0)} className="whitespace-nowrap bg-white px-3 py-3 pr-[22px] text-left group-hover:bg-slate-50/60">
                      <FraudScheme4RowActions row={r} onApply={(next) => applyRow(r.id, next)} onView={() => goReport(r)} flash={showToast} />
                    </td>
                  </tr>
                ))}
                {pageRows.length === 0 && (
                  <tr><td colSpan={13} className="whitespace-nowrap px-3 py-10 text-center text-sm text-slate-400">暂无符合条件的记录</td></tr>
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
