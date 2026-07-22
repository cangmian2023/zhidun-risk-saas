// 信用风控报告页（新设计 3.1~3.4）
// 复用信息核验报告详情「外壳 + 右侧锚点导航」模式；评分口径 0~100，越高越好
import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Badge, Button, DetailHeader, Panel, ProgressBar } from '../components/ui'
import {
  conclKind,
  getCreditReport,
  type CreditReport,
  type RiskDimension,
} from './creditReport'

function scrollTo(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 信用评分：越高越好 → 配色与信息核验「异常值」相反
function scoreColor(s: number): string {
  return s >= 75 ? '#22c55e' : s >= 45 ? '#f59e0b' : '#ef4444'
}
function scoreBarColor(s: number): string {
  return s >= 75 ? 'bg-emerald-500' : s >= 45 ? 'bg-amber-500' : 'bg-rose-500'
}
function levelKind(l: 'high' | 'mid' | 'low'): 'red' | 'amber' | 'green' {
  return l === 'high' ? 'red' : l === 'mid' ? 'amber' : 'green'
}
function levelLabel(l: 'high' | 'mid' | 'low'): string {
  return l === 'high' ? '高风险' : l === 'mid' ? '中风险' : '低风险'
}

export default function CreditReportDetail() {
  const nav = useNavigate()
  const id = new URLSearchParams(useLocation().search).get('id')
  const r = getCreditReport(id)
  return <ReportView r={r} onBack={() => nav('/console/cr/pre-credit')} />
}

/* ===================== 环形评分图 ===================== */
function RingChart({ score, color }: { score: number; color: string }) {
  const size = 168
  const stroke = 16
  const r = (size - stroke) / 2
  const cx = size / 2
  const cy = size / 2
  const c = 2 * Math.PI * r
  const offset = c * (1 - score / 100)
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} stroke="#eef2f7" strokeWidth={stroke} fill="none" />
      <circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="40" fontWeight="700" fill="#0f172a">
        {score}
      </text>
      <text x={cx} y={cy + 20} textAnchor="middle" fontSize="12" fill="#64748b">
        综合信用评分
      </text>
    </svg>
  )
}

/* ===================== 折线趋势图 ===================== */
function LineChart({ trend }: { trend: { month: string; user: number; industry: number }[] }) {
  const w = 560
  const h = 230
  const padL = 38
  const padR = 14
  const padT = 16
  const padB = 30
  const innerW = w - padL - padR
  const innerH = h - padT - padB
  const x = (i: number) => padL + (innerW * i) / (trend.length - 1)
  const y = (v: number) => padT + innerH * (1 - v / 100)
  const userPts = trend.map((p, i) => `${x(i)},${y(p.user)}`).join(' ')
  const indPts = trend.map((p, i) => `${x(i)},${y(p.industry)}`).join(' ')
  const ticks = [0, 25, 50, 75, 100]
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="max-w-full">
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} y1={y(t)} x2={w - padR} y2={y(t)} stroke="#f1f5f9" strokeWidth={1} />
          <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#94a3b8">
            {t}
          </text>
        </g>
      ))}
      {trend.map((p, i) => (
        <text key={p.month} x={x(i)} y={h - 10} textAnchor="middle" fontSize="10" fill="#94a3b8">
          {p.month}
        </text>
      ))}
      <polyline points={indPts} fill="none" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 4" />
      <polyline points={userPts} fill="none" stroke="#3366ff" strokeWidth={2.5} />
      {trend.map((p, i) => (
        <circle key={'u' + i} cx={x(i)} cy={y(p.user)} r={3.5} fill="#3366ff" />
      ))}
      {trend.map((p, i) => (
        <circle key={'i' + i} cx={x(i)} cy={y(p.industry)} r={3} fill="#cbd5e1" />
      ))}
    </svg>
  )
}

/* ===================== 雷达对比图 ===================== */
function RadarChart({ dims, industry }: { dims: RiskDimension[]; industry: number[] }) {
  const size = 300
  const cx = size / 2
  const cy = size / 2
  const R = 108
  const n = dims.length
  const angle = (i: number) => -Math.PI / 2 + (i * 2 * Math.PI) / n
  const pt = (i: number, v: number) => {
    const rr = (R * v) / 100
    return [cx + rr * Math.cos(angle(i)), cy + rr * Math.sin(angle(i))]
  }
  const userPoly = dims.map((d, i) => pt(i, d.score).join(',')).join(' ')
  const indPoly = industry.map((v, i) => pt(i, v).join(',')).join(' ')
  const rings = [25, 50, 75, 100]
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {rings.map((rg) => (
        <polygon
          key={rg}
          points={dims.map((_, i) => pt(i, rg).join(',')).join(' ')}
          fill="none"
          stroke="#eef2f7"
          strokeWidth={1}
        />
      ))}
      {dims.map((_, i) => {
        const [ex, ey] = pt(i, 100)
        return <line key={i} x1={cx} y1={cy} x2={ex} y2={ey} stroke="#eef2f7" strokeWidth={1} />
      })}
      <polygon points={indPoly} fill="rgba(203,213,225,0.35)" stroke="#cbd5e1" strokeWidth={1.5} strokeDasharray="5 4" />
      <polygon points={userPoly} fill="rgba(51,102,255,0.18)" stroke="#3366ff" strokeWidth={2} />
      {dims.map((d, i) => {
        const [lx, ly] = pt(i, 122)
        return (
          <text key={d.key} x={lx} y={ly} textAnchor="middle" fontSize="10" fill="#475569">
            {d.name}
          </text>
        )
      })}
    </svg>
  )
}

/* ===================== 报告视图 ===================== */
function ReportView({ r, onBack }: { r: CreditReport; onBack: () => void }) {
  const [exportMsg, setExportMsg] = useState('')
  const [decisionMsg, setDecisionMsg] = useState('')
  const NAV: { id: string; label: string; tone: 'ok' | 'alert' | 'normal' }[] = [
    { id: 'overview', label: '信用评分总览', tone: 'normal' },
    { id: 'applicant', label: '用户基本信息', tone: 'normal' },
    { id: 'factors', label: '风险因子分析', tone: 'alert' },
    { id: 'trend', label: '信用评分趋势', tone: 'normal' },
    { id: 'radar', label: '风险维度雷达图', tone: 'normal' },
    { id: 'suggestion', label: '风控决策建议', tone: 'alert' },
    { id: 'history', label: '历史授信记录', tone: 'normal' },
    { id: 'logs', label: '风控操作日志', tone: 'normal' },
  ]
  return (
    <div>
      <DetailHeader
        title="信用风控报告"
        crumb="零售信贷风控 / 贷前审核"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>进件号 {r.apply_no}</span>
            <span>·</span>
            <span>申请人 {r.applicant.name}</span>
            <span>·</span>
            <span>{r.risk_grade}</span>
          </span>
        }
        backLabel="信用风控列表"
        onBack={onBack}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => setExportMsg('报告已生成导出文件（演示）')}
            >
              导出报告
            </Button>
            <Button variant="primary" onClick={() => scrollTo('suggestion')}>
              去决策
            </Button>
          </div>
        }
      />

      <div className="lg:flex lg:items-start lg:gap-6">
        <div className="min-w-0 flex-1">
          {/* 一、信用评分总览 */}
          <Panel
            title="一、信用评分总览"
            id="overview"
            className="mb-4"
            actions={
              <Button variant="secondary" size="sm" onClick={() => setExportMsg('报告已生成导出文件（演示）')}>
                导出报告
              </Button>
            }
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              <div className="flex flex-col items-center">
                <RingChart score={r.credit_score} color={scoreColor(r.credit_score)} />
                <div className="mt-2 flex items-center gap-2">
                  <Badge kind={r.credit_score >= 75 ? 'green' : r.credit_score >= 45 ? 'amber' : 'red'}>
                    {r.risk_grade}
                  </Badge>
                  <span className="text-xs text-slate-400">行业平均 {r.industry_score}</span>
                </div>
              </div>
              <div className="flex-1 space-y-3">
                <div className="text-xs font-medium text-slate-500">六大维度评分</div>
                {r.dimensions.map((d) => (
                  <div key={d.key}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">
                        {d.name}
                        <span className="ml-1 text-slate-400">权重 {Math.round(d.weight * 100)}%</span>
                      </span>
                      <span className="font-semibold text-ink-900">{d.score}</span>
                    </div>
                    <ProgressBar value={d.score} color={scoreBarColor(d.score)} />
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {r.risk_tags.map((t) => (
                <Badge key={t} kind="blue">
                  {t}
                </Badge>
              ))}
            </div>
            {exportMsg && (
              <div className="mt-3 rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700">{exportMsg}</div>
            )}
          </Panel>

          {/* 二、用户基本信息 */}
          <Panel title="二、用户基本信息" id="applicant" className="mb-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <InfoField label="姓名" value={r.applicant.name} />
              <InfoField label="身份证" value={r.applicant.id_no} />
              <InfoField label="手机号" value={r.applicant.phone} />
              <InfoField label="银行卡" value={r.applicant.bank_card} />
              <InfoField label="工作信息" value={r.applicant.work} />
              <InfoField label="收入" value={r.applicant.income} />
              <div className="lg:col-span-2">
                <InfoField label="环境采集信息" value={r.applicant.env} />
              </div>
            </div>
          </Panel>

          {/* 三、风险因子分析 */}
          <Panel title="三、风险因子分析" id="factors" className="mb-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {r.dimensions.map((d) => (
                <div key={d.key} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-ink-900">{d.name}</div>
                    <Badge kind={levelKind(d.level)}>{levelLabel(d.level)}</Badge>
                  </div>
                  <div
                    className="text-3xl font-bold"
                    style={{ color: scoreColor(d.score) }}
                  >
                    {d.score}
                    <span className="ml-1 text-sm font-normal text-slate-400">/100</span>
                  </div>
                  <div className="mt-2">
                    <ProgressBar value={d.score} color={scoreBarColor(d.score)} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="px-3 py-2 font-medium">维度</th>
                    <th className="px-3 py-2 font-medium">权重</th>
                    <th className="px-3 py-2 font-medium">评分逻辑</th>
                    <th className="px-3 py-2 font-medium">数据来源</th>
                  </tr>
                </thead>
                <tbody>
                  {r.dimensions.map((d) => (
                    <tr key={d.key} className="border-b border-slate-100 align-top">
                      <td className="px-3 py-2 font-medium text-slate-800">{d.name}</td>
                      <td className="px-3 py-2 text-slate-600">{Math.round(d.weight * 100)}%</td>
                      <td className="px-3 py-2 text-slate-600">{d.logic}</td>
                      <td className="px-3 py-2 text-slate-600">{d.source}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* 四、信用评分趋势 */}
          <Panel title="四、信用评分趋势（近 7 个月）" id="trend" className="mb-4">
            <div className="mb-3 flex items-center gap-5 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-4 rounded bg-brand-600" />综合评分趋势
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-4 rounded border border-dashed border-slate-400 bg-slate-200" />行业平均趋势
              </span>
            </div>
            <LineChart trend={r.trend} />
          </Panel>

          {/* 五、风险维度雷达图 */}
          <Panel title="五、风险维度雷达图（当前 vs 行业平均）" id="radar" className="mb-4">
            <div className="mb-3 flex items-center justify-center gap-5 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-4 rounded bg-brand-600" />当前用户
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-4 rounded bg-slate-300" />行业平均
              </span>
            </div>
            <div className="flex justify-center">
              <RadarChart dims={r.dimensions} industry={r.industry_dim} />
            </div>
          </Panel>

          {/* 六、风控决策建议 */}
          <Panel title="六、风控决策建议" id="suggestion" className="mb-4">
            <div className="mb-4 flex flex-wrap items-center gap-3">
              <span className="text-xs text-slate-500">系统建议</span>
              <Badge kind="blue" className="px-3 py-1 text-sm">
                {r.decision_suggestion}
              </Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
                <div className="mb-2 text-sm font-semibold text-emerald-700">支持通过的因素</div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {r.positive_factors.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-emerald-600">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                <div className="mb-2 text-sm font-semibold text-rose-700">风险因素</div>
                <ul className="space-y-1.5 text-xs text-slate-700">
                  {r.risk_factors.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="mt-0.5 text-rose-600">!</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="mb-2 text-xs font-medium text-slate-500">审核决策</div>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={() => setDecisionMsg('已执行：审核通过（需权限）')}>
                  审核通过
                </Button>
                <Button variant="secondary" onClick={() => setDecisionMsg('已执行：拒绝授信（需权限）')}>
                  拒绝授信
                </Button>
                <Button variant="secondary" onClick={() => setDecisionMsg('已执行：提交人工复核，流转至终审人员')}>
                  提交人工复核
                </Button>
                <Button variant="ghost" onClick={() => setDecisionMsg('已执行：退回补充材料，工单退回至申请人')}>
                  退回补充材料
                </Button>
              </div>
              {decisionMsg && (
                <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">{decisionMsg}</div>
              )}
            </div>
          </Panel>

          {/* 七、历史授信记录 */}
          <Panel title="七、历史授信记录" id="history" className="mb-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                    <th className="px-3 py-2 font-medium">申请编号</th>
                    <th className="px-3 py-2 font-medium">时间</th>
                    <th className="px-3 py-2 font-medium">产品</th>
                    <th className="px-3 py-2 font-medium text-right">申请额度</th>
                    <th className="px-3 py-2 font-medium text-right">评分</th>
                    <th className="px-3 py-2 font-medium">结果</th>
                    <th className="px-3 py-2 font-medium text-right">授信额度</th>
                  </tr>
                </thead>
                <tbody>
                  {r.history.map((h) => (
                    <tr key={h.apply_no} className="border-b border-slate-100 align-top">
                      <td className="px-3 py-2 font-medium text-slate-800">{h.apply_no}</td>
                      <td className="px-3 py-2 text-slate-600">{h.time}</td>
                      <td className="px-3 py-2 text-slate-600">{h.product}</td>
                      <td className="px-3 py-2 text-right text-slate-600">{h.amount}</td>
                      <td className="px-3 py-2 text-right font-semibold text-ink-900">{h.score}</td>
                      <td className="px-3 py-2">
                        <Badge kind={conclKind(h.result)}>{h.result}</Badge>
                      </td>
                      <td className="px-3 py-2 text-right text-slate-600">{h.credit_amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* 八、风控操作日志 */}
          <Panel title="八、风控操作日志" id="logs" className="mb-4">
            <div className="space-y-0">
              {r.logs.map((l, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-brand-500" />
                    {i !== r.logs.length - 1 && <span className="w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-medium text-slate-700">{l.action}</span>
                      <span className="text-xs text-slate-400">{l.operator}</span>
                      <span className="text-xs text-slate-400">{l.time}</span>
                    </div>
                    <div className="mt-0.5 text-xs text-slate-500">{l.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        <aside className="hidden w-40 shrink-0 lg:block">
          <div className="sticky top-4 space-y-1 rounded-xl border border-slate-200 bg-white p-2">
            {NAV.map((n) => {
              const toneCls =
                n.tone === 'alert'
                  ? 'bg-rose-50 font-medium text-rose-600'
                  : n.tone === 'ok'
                    ? 'bg-emerald-50 font-medium text-emerald-600'
                    : 'text-slate-600 hover:bg-brand-50 hover:text-brand-700'
              const dot = n.tone === 'alert' ? 'bg-rose-500' : n.tone === 'ok' ? 'bg-emerald-500' : ''
              return (
                <button
                  key={n.id}
                  onClick={() => scrollTo(n.id)}
                  className={`block w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium transition ${toneCls}`}
                >
                  {dot && <span className={`mr-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}
                  {n.label}
                </button>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-1 text-xs font-medium text-slate-400">{label}</div>
      <div className="text-sm text-slate-800">{value}</div>
    </div>
  )
}
