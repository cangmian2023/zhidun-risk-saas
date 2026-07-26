import { useMemo, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { PageHeader, StatCard, Panel, Button, SingleSelect } from '../components/ui'
import {
  seedDecisionRows,
  DecisionRow,
  DecisionSuggestion,
  ApprovalStatus,
  InfoResult,
  RiskLevel,
  creditRiskLevel,
  fraudRiskLevel,
} from './decisionReport'
import {
  useDecisionActions,
  DecisionSuggestionBadge,
  DecisionInfoBadge,
  DecisionRiskBadge,
  DecisionAutoReviewBadge,
  DecisionManualReviewBadge,
  DecisionReviewActions,
} from './DecisionOps'

// 多选胶囊（与 CreditKimiList 同款）
function MultiChip<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { value: T; label: string }[]
  value: T[]
  onChange: (v: T[]) => void
}) {
  const toggle = (v: T) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => toggle(o.value)}
            className={`rounded-full px-2.5 py-1 text-xs transition ${
              value.includes(o.value) ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

const headStyle = (
  w: number | null,
  align: 'left' | 'right' | 'center' | null,
  frozen?: { left?: number; right?: boolean },
) => ({
  width: w ? `${w}px` : undefined,
  textAlign: align ?? 'left',
  position: frozen ? ('sticky' as const) : undefined,
  left: frozen?.left,
  right: frozen?.right ? 0 : undefined,
  // 冻结表头：不透明背景 + 高 z-index + 外缘投影 + 强制合成层，避免横向滚动时穿透
  zIndex: frozen?.right ? 30 : frozen ? 29 : undefined,
  background: frozen ? '#f8fafc' : undefined,
  willChange: frozen ? 'transform' : undefined,
  boxShadow: frozen?.right
    ? '-8px 0 10px -6px rgba(15,23,42,0.12)'
    : frozen
    ? '8px 0 10px -6px rgba(15,23,42,0.12)'
    : undefined,
})
const bodyStyle = (frozen?: { left?: number; right?: boolean }) => ({
  position: frozen ? ('sticky' as const) : undefined,
  left: frozen?.left,
  right: frozen?.right ? 0 : undefined,
  // 冻结单元格：纯白不透明背景 + 高于普通单元格的 z-index + 外缘投影 + 强制合成层
  zIndex: frozen?.right ? 21 : frozen ? 20 : undefined,
  background: frozen ? '#ffffff' : undefined,
  willChange: frozen ? 'transform' : undefined,
  boxShadow: frozen?.right
    ? '-8px 0 10px -6px rgba(15,23,42,0.12)'
    : frozen
    ? '8px 0 10px -6px rgba(15,23,42,0.12)'
    : undefined,
})

const PRODUCTS = ['信用贷', '抵押贷', '消费贷', '经营贷']
const CHANNELS = ['APP', 'H5', '柜台']
const SUGGESTIONS: DecisionSuggestion[] = ['优先通过', '通过', '限制额度', '严格限制', '拒绝']
const INFO_RESULTS: InfoResult[] = ['通过', '预警', '拒绝']
const RISK_LEVELS: RiskLevel[] = ['低风险', '中风险', '高风险', '极高风险']
const APPROVALS: ApprovalStatus[] = ['待审批', '审批中', '已通过', '已拒绝', '已退回', '已提交双人复核']

export default function DecisionList() {
  const nav = useNavigate()
  const [s] = useSearchParams()
  const [, force] = useState(0)

  const rows = seedDecisionRows
  const [kw, setKw] = useState('')
  const [product, setProduct] = useState('')
  const [channel, setChannel] = useState('')
  const [suggestion, setSuggestion] = useState('')
  const [scoreMin, setScoreMin] = useState('')
  const [scoreMax, setScoreMax] = useState('')
  const [infoResult, setInfoResult] = useState('')
  const [creditLevels, setCreditLevels] = useState<RiskLevel[]>([])
  const [fraudLevels, setFraudLevels] = useState<RiskLevel[]>([])
  const [approval, setApproval] = useState('')
  const [operator, setOperator] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [auditRow, setAuditRow] = useState<DecisionRow | null>(null)

  const filtered = useMemo(() => {
    const tKw = kw.trim().toLowerCase()
    return rows.filter((r) => {
      if (tKw && !(r.id.toLowerCase().includes(tKw) || r.appId.toLowerCase().includes(tKw) || r.name.toLowerCase().includes(tKw)))
        return false
      if (product && r.product !== product) return false
      if (channel && r.channel !== channel) return false
      if (suggestion && r.suggestion !== suggestion) return false
      if (scoreMin && r.decisionScore < Number(scoreMin)) return false
      if (scoreMax && r.decisionScore > Number(scoreMax)) return false
      if (infoResult && r.infoResult !== infoResult) return false
      if (creditLevels.length && !creditLevels.includes(creditRiskLevel[r.creditGrade])) return false
      if (fraudLevels.length && !fraudLevels.includes(fraudRiskLevel[r.fraudResult])) return false
      if (approval && r.approvalStatus !== approval) return false
      if (operator && !r.operator.toLowerCase().includes(operator.trim().toLowerCase())) return false
      const day = r.auditTime.slice(0, 10)
      if (dateFrom && day < dateFrom) return false
      if (dateTo && day > dateTo) return false
      return true
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, kw, product, channel, suggestion, scoreMin, scoreMax, infoResult, creditLevels, fraudLevels, approval, operator, dateFrom, dateTo])

  const page = Number(s.get('p')) || 0
  const pageSize = 8
  const pageRows = filtered.slice(page * pageSize, page * pageSize + pageSize)

  const stats = useMemo(() => {
    const pending = rows.filter((r) => r.approvalStatus === '待审批' || r.approvalStatus === '审批中').length
    const todayPass = rows.filter((r) => r.approvalStatus === '已通过').length
    const todayReject = rows.filter((r) => r.approvalStatus === '已拒绝').length
    const review = rows.filter((r) => r.approvalStatus === '已提交双人复核').length
    return { pending, todayPass, todayReject, review, avgTime: '1.8h' }
  }, [rows])

  const reset = () => {
    setKw(''); setProduct(''); setChannel(''); setSuggestion(''); setScoreMin(''); setScoreMax('')
    setInfoResult(''); setCreditLevels([]); setFraudLevels([]); setApproval(''); setOperator(''); setDateFrom(''); setDateTo('')
  }

  const applyAudit = (patch: Partial<DecisionRow>) => {
    if (!auditRow) return
    const i = rows.findIndex((r) => r.id === auditRow.id)
    if (i >= 0) Object.assign(rows[i], patch)
    setAuditRow(null)
    force((n) => n + 1)
  }

  const actions = useDecisionActions(auditRow, applyAudit)

  const goDetail = (id: string) => nav(`/console/cr/pre-report-detail?id=${id}`)

  return (
    <div>
      <PageHeader
        crumb="贷前审核 / 决策报告"
        title="决策报告"
        subtitle={`共 ${rows.length} 份 · 由决策引擎综合「信息核验 / 信用风控 / 欺诈识别」三套子系统输出`}
      />

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="待决策" value={String(stats.pending)} hint="待审批 + 审批中" accent="violet" />
        <StatCard label="今日通过" value={String(stats.todayPass)} hint="已通过" accent="emerald" />
        <StatCard label="今日拒绝" value={String(stats.todayReject)} hint="已拒绝" accent="rose" />
        <StatCard label="待双人复核" value={String(stats.review)} hint="需双人复核推翻" accent="cyan" />
        <StatCard label="平均审批耗时" value={stats.avgTime} hint="近 7 日均值" accent="amber" />
      </div>

      <Panel className="mt-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            value={kw}
            onChange={(e) => setKw(e.target.value)}
            placeholder="决策编号 / 申请编号 / 申请人"
            className="w-52 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
          <SingleSelect label="产品" value={product} onChange={setProduct} options={PRODUCTS.map((p) => ({ value: p, label: p }))} />
          <SingleSelect label="渠道" value={channel} onChange={setChannel} options={CHANNELS.map((c) => ({ value: c, label: c }))} />
          <SingleSelect label="决策建议" value={suggestion} onChange={setSuggestion} options={SUGGESTIONS.map((x) => ({ value: x, label: x }))} />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            决策评分
            <input value={scoreMin} onChange={(e) => setScoreMin(e.target.value)} placeholder="min" className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-violet-400" />
            <span>~</span>
            <input value={scoreMax} onChange={(e) => setScoreMax(e.target.value)} placeholder="max" className="w-16 rounded-lg border border-slate-300 px-2 py-2 text-sm outline-none focus:border-violet-400" />
          </div>
          <SingleSelect label="信息核验" value={infoResult} onChange={setInfoResult} options={INFO_RESULTS.map((x) => ({ value: x, label: x }))} />
          <SingleSelect label="审批状态" value={approval} onChange={setApproval} options={APPROVALS.map((x) => ({ value: x, label: x }))} />
          <input
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            placeholder="审批人"
            className="w-24 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            决策时间
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-violet-400" />
            <span>~</span>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-violet-400" />
          </div>
          <Button variant="ghost" onClick={reset}>重置</Button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <MultiChip label="信用风险等级" options={RISK_LEVELS.map((g) => ({ value: g, label: g }))} value={creditLevels} onChange={setCreditLevels} />
          <MultiChip label="欺诈风险等级" options={RISK_LEVELS.map((f) => ({ value: f, label: f }))} value={fraudLevels} onChange={setFraudLevels} />
        </div>
      </Panel>

      <Panel className="mt-4">
        {/* 滚动容器用负 margin 抵消 Panel 的 p-5，使冻结列紧贴面板边缘、无缝隙 */}
        <div className="-mx-5 overflow-x-auto">
        <table className="w-full min-w-[2100px] table-fixed border-separate border-spacing-0 text-left text-sm">
          <thead>
            <tr className="text-xs text-slate-400">
              <th style={headStyle(170, null, { left: 0 })} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">申请编号</th>
              <th style={headStyle(110, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">申请人</th>
              <th style={headStyle(100, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">产品</th>
              <th style={headStyle(90, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">渠道</th>
              <th style={headStyle(120, 'right')} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">申请额度</th>
              <th style={headStyle(140, 'right')} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">建议授信额度</th>
              <th style={headStyle(130, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">信息核验</th>
              <th style={headStyle(130, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">信用风险</th>
              <th style={headStyle(130, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">欺诈风险</th>
              <th style={headStyle(100, 'right')} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">决策评分</th>
              <th style={headStyle(120, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">决策建议</th>
              <th style={headStyle(130, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">人工审核</th>
              <th style={headStyle(100, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">自动审核</th>
              <th style={headStyle(180, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">审核人</th>
              <th style={headStyle(null, null)} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">决策时间</th>
              <th style={headStyle(200, 'center', { right: true })} className="whitespace-nowrap border-b border-slate-200 bg-slate-50 px-3 py-3 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r) => {
              const score = r.decisionScore
              return (
                <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td style={bodyStyle({ left: 0 })} className="whitespace-nowrap px-3 py-3 font-mono text-xs">
                    <button onClick={() => goDetail(r.id)} className="text-violet-600 hover:underline">{r.appId}</button>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-ink-900">{r.name}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">{r.product}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">{r.channel}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-ink-900">{r.amount.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-ink-900">{r.approvedAmount.toLocaleString()}</td>
                  <td className="whitespace-nowrap px-3 py-3"><DecisionInfoBadge v={r.infoResult} /></td>
                  <td className="whitespace-nowrap px-3 py-3"><DecisionRiskBadge v={creditRiskLevel[r.creditGrade]} /></td>
                  <td className="whitespace-nowrap px-3 py-3"><DecisionRiskBadge v={fraudRiskLevel[r.fraudResult]} /></td>
                  <td className="whitespace-nowrap px-3 py-3 text-right">
                    <span className={`tabular-nums font-semibold ${score >= 80 ? 'text-emerald-600' : score >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>{score}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3"><DecisionSuggestionBadge v={r.suggestion} /></td>
                  <td className="whitespace-nowrap px-3 py-3"><DecisionManualReviewBadge v={r.manualReview} /></td>
                  <td className="whitespace-nowrap px-3 py-3"><DecisionAutoReviewBadge v={r.autoReview} /></td>
                  <td className="whitespace-nowrap px-3 py-3 text-slate-500">{r.operator === '—' ? <span className="text-slate-300">—</span> : r.operator}</td>
                  <td className="whitespace-nowrap px-3 py-3 text-xs text-slate-400">{r.auditTime}</td>
                  <td style={bodyStyle({ right: true })} className="whitespace-nowrap px-3 py-3">
                    <DecisionReviewActions
                      row={r}
                      onView={() => goDetail(r.id)}
                      onAction={(k) => { setAuditRow(r); actions.run(k) }}
                    />
                  </td>
                </tr>
              )
            })}
            {pageRows.length === 0 && (
              <tr><td colSpan={16} className="px-3 py-10 text-center text-sm text-slate-400">无匹配报告</td></tr>
            )}
          </tbody>
        </table>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>共 {filtered.length} 条</span>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.max(1, Math.ceil(filtered.length / pageSize)) }).map((_, i) => (
              <button
                key={i}
                onClick={() => nav(`/console/cr/pre-report?p=${i}`)}
                className={`h-7 w-7 rounded ${i === page ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      </Panel>

      {actions.Modal}
    </div>
  )
}
