import { useState, type ReactNode } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { DetailHeader, Panel, Badge, Button } from '../components/ui'
import {
  getDecisionDetail,
  seedDecisionRows,
  DecisionRow,
  creditRiskLevel,
  fraudRiskLevel,
  infoKind,
  riskKind,
} from './decisionReport'
import {
  DecisionSuggestionBadge,
  DecisionInfoBadge,
  DecisionRiskBadge,
  DecisionActionKey,
  decisionOpsFor,
  useDecisionActions,
} from './DecisionOps'
import {
  computeSectionScore,
  type ReportType,
  evaluateFormula,
  formulaText,
  DECISION_SCORE_VARS,
} from './reportTemplateData'
import { TemplateDimTable } from './TemplateDimTable'
import { useTemplate } from './templateStore'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

const SECTIONS = [
  { id: 'overview', label: '决策总览' },
  { id: 'approval', label: '审批操作' },
  { id: 'basic', label: '用户基本信息' },
  { id: 'info', label: '信息核验摘要' },
  { id: 'credit', label: '信用风控摘要' },
  { id: 'fraud', label: '欺诈识别摘要' },
  { id: 'logs', label: '操作日志' },
]

const OPERATIONS = [
  { op: '审批', desc: '进入审批流程，按系统建议与流程配置完成审核结论', cond: '风控专员进行最终审批' },
]

function KV({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={`flex gap-4 border-b border-slate-100 py-2.5 text-sm ${full ? '' : 'justify-between'}`}>
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className={`text-ink-900 ${full ? 'mt-1 block' : 'text-right font-medium'}`}>{children}</span>
    </div>
  )
}

// 模板配置打分项明细：按「报告内容配置」分段（集合）分组，列出每集合的小项得分 + 集合汇总得分 + 权重。
// 数据来自该报告类型对应的 seed 模板（与报告模板页初始态一致）；符号按集合计分方向自动取 +/−（绝不再叠加负号）。
function TemplateScoredList({ reportType }: { reportType: ReportType }) {
  const tpl = useTemplate(undefined, reportType)
  if (!tpl) return null
  const sections = tpl.sections.filter(
    (s) => (s.homeTab ?? 'content') === 'content' && (s.fields ?? []).some((f) => f.visible && !f.hitReject),
  )
  if (sections.length === 0) return null
  return (
    <div className="mt-2 space-y-3">
      {sections.map((s) => {
        const sc = computeSectionScore(s)
        const items = s.fields.filter((f) => f.visible && !f.hitReject)
        // 符号按本卡计分方向取（扣分卡即使总分为 0 也应显示负号口径），避免出现"红色正数"
        const sign = sc.mode === 'deduct' ? '−' : '+'
        const valCls = sc.mode === 'deduct' ? 'text-rose-600' : 'text-emerald-600'
        const w = s.weight ?? 1
        if (items.length === 0) return null
        return (
          <div key={s.id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-ink-900">{s.name}</span>
              <span className="flex items-baseline gap-1.5 text-xs">
                <span className="text-slate-400">本集合汇总</span>
                <span className={cn('font-bold tabular-nums', valCls)}>{sign}{Math.abs(sc.total)} 分</span>
                <span className="text-slate-400">· 权重 {w}</span>
              </span>
            </div>
            <table className="mt-2 w-full text-xs">
              <tbody>
                {items.map((f) => (
                  <tr key={f.id} className="border-t border-slate-100">
                    <td className="py-1.5 pr-2 text-slate-600">{f.name}</td>
                    <td className={cn('py-1.5 text-right font-medium tabular-nums', valCls)}>{sign}{f.scorePoints ?? 0} 分</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      })}
    </div>
  )
}

function DefTable({ headers, children }: { headers: string[]; children: ReactNode }) {
  return (
    <table className="w-full text-left text-sm">
      <thead>
        <tr className="text-xs text-slate-400">
          {headers.map((h) => (
            <th key={h} className="border-b border-slate-200 bg-slate-50 px-3 py-2 font-medium">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}      </tbody>
    </table>
  )
}


// ============================ 复用块：欺诈识别报告 - 一、用户基本信息 ============================
function UserBasicBlock({ row }: { row: DecisionRow }) {
  const fields = [
    { label: '姓名', value: row.name },
    { label: '证件类型', value: '居民身份证' },
    { label: '证件号', value: '3301**********' + String(row.infoCreditScore).padStart(4, '0').slice(-4) },
    { label: '手机号', value: '138****' + String(row.infoCreditScore).slice(-4) },
    { label: '申请产品', value: row.product },
    { label: '申请额度', value: '¥' + row.amount.toLocaleString() },
    { label: '申请渠道', value: row.channel },
    { label: '进件时间', value: row.auditTime },
  ]
  return (
    <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
      {fields.map((f, i) => (
        <div key={i} className="flex min-w-0 items-center justify-between gap-2 rounded-lg bg-slate-50/60 px-3 py-2">
          <span className="shrink-0 whitespace-nowrap text-sm text-slate-400">{f.label}</span>
          <span className="truncate whitespace-nowrap text-sm font-medium text-ink-900">{f.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function DecisionDetail() {
  const [s] = useSearchParams()
  const nav = useNavigate()
  const id = s.get('id') ?? 'DEC20260518-0001'
  const [auditRow, setAuditRow] = useState<DecisionRow | null>(null)
  const [, force] = useState(0)

  const apply = (patch: Partial<DecisionRow>) => {
    const i = seedDecisionRows.findIndex((r) => r.id === auditRow?.id)
    if (i >= 0) Object.assign(seedDecisionRows[i], patch)
    setAuditRow(null)
    force((n) => n + 1)
  }
  const data = getDecisionDetail(id)
  const actions = useDecisionActions(auditRow, apply)
  const tpl = useTemplate(undefined, 'decision')

  if (!data) {
    return (
      <div className="space-y-6">
        <DetailHeader
          backLabel="返回进件审核"
          onBack={() => nav('/console/cr/pre-report')}
          title="未找到决策报告"
          subtitle={`编号 ${id}`}
        />
        <Panel className="mt-4"><div className="py-10 text-center text-sm text-slate-400">无匹配报告，请返回列表。</div></Panel>
      </div>
    )
  }

  const d = data
  const onAction = (k: DecisionActionKey) => {
    if (k === 'view') return
    setAuditRow(d.row)
    actions.run(k)
  }

  // 各段落状态提示：预警(alert)/正常(ok)/待定(normal)，驱动右侧导航卡着色与圆点
  type Tone = 'ok' | 'alert' | 'normal'
  const sectionTone = (id: string): Tone => {
    const r = d.row
    switch (id) {
      case 'overview': return r.suggestion === '拒绝' || r.suggestion === '严格限制' || r.suggestion === '限制额度' ? 'alert' : 'ok'
      case 'approval': return r.approvalStatus === '已拒绝' || r.approvalStatus === '已退回' ? 'alert' : r.approvalStatus === '待审批' ? 'normal' : 'ok'
      case 'plan': return r.suggestion === '拒绝' || r.suggestion === '严格限制' ? 'alert' : 'ok'
      case 'info': return d.info.result === '通过' ? 'ok' : 'alert'
      case 'credit': return r.creditGrade === 'C' || r.creditGrade === 'D' ? 'alert' : 'ok'
      case 'basic': return d.info.result === '通过' && r.fraudResult === '未发现' ? 'ok' : 'alert'
      case 'fraud': return r.fraudResult === '未发现' ? 'ok' : 'alert'
      default: return 'normal'
    }
  }

  const creditRiskText = (g: string) =>
    g === 'C' || g === 'D' ? '信用历史差（命中逾期）、设备安全性低（Root+群控）' : g === 'B' ? '负债比偏高、还款能力一般' : g === 'A' ? '偶发短期逾期' : '无显著风险'
  const creditPositiveText = '身份真实性良好、还款能力尚可'
  const jump = (path: string) => () => nav(path)

  // 审批操作按钮：统一为「审批」入口，弹出与流程配置对齐的审批弹窗
  const recOps = new Set<string>(['审批'])
  const actionableOps = decisionOpsFor(d.row.suggestion, d.row.approvalStatus).filter((o) => o !== 'view')
  const onOp = (op: string) => {
    const map: Record<string, DecisionActionKey> = { '审批': 'audit' }
    onAction(map[op] ?? 'audit')
  }

  // 分值配色与预警状态保持一致
  const toneText = (t: Tone) => t === 'alert' ? 'text-rose-600' : t === 'ok' ? 'text-emerald-600' : 'text-slate-700'

  // 卡片配色与列表「信息核验/信用风险/欺诈风险」子系统状态一致
  const CARD_TONE: Record<string, { card: string; pill: string; num: string }> = {
    green: { card: 'bg-emerald-50/50 ring-emerald-100', pill: 'bg-emerald-100 text-emerald-700', num: 'text-emerald-600' },
    cyan: { card: 'bg-cyan-50/50 ring-cyan-100', pill: 'bg-cyan-100 text-cyan-700', num: 'text-cyan-600' },
    amber: { card: 'bg-amber-50/50 ring-amber-100', pill: 'bg-amber-100 text-amber-700', num: 'text-amber-600' },
    red: { card: 'bg-rose-50/50 ring-rose-100', pill: 'bg-rose-100 text-rose-700', num: 'text-rose-600' },
    blue: { card: 'bg-sky-50/50 ring-sky-100', pill: 'bg-sky-100 text-sky-700', num: 'text-sky-600' },
    gray: { card: 'bg-slate-50/60 ring-slate-100', pill: 'bg-slate-100 text-slate-500', num: 'text-slate-700' },
  }

  return (
    <div className="space-y-6">
      <DetailHeader
        backLabel="返回决策报告"
        onBack={() => nav('/console/cr/pre-report')}
        title={`决策报告 · ${d.row.name}`}
        subtitle={`${d.row.product} · ${d.row.channel} · 申请编号 ${d.row.appId}`}
      />

      <div className="lg:flex lg:gap-6">
        {/* 全部内容滚动展示（非 tab 切页） */}
        <div className="min-w-0 flex-1 space-y-4">
          {/* 第1段：决策总览 */}
          <Panel id="overview" className="scroll-mt-24" title="1、决策总览">
            {tpl?.scoreFormula && (() => {
              const vals = { credit_score: d.creditScore900v, info_score: d.info.creditScore, fraud_score: d.fraudScoreRaw }
              const total = evaluateFormula(tpl.scoreFormula, vals)
              return (
                <div className="mb-6 rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-5">
                  {/* 上方小卡片：已配公式摘要 */}
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-white/70 px-3 py-2 ring-1 ring-inset ring-violet-100">
                    <span className="text-xs font-medium text-slate-500">综合总分计算公式</span>
                    <code className="text-xs font-semibold text-violet-700">{formulaText(tpl.scoreFormula, DECISION_SCORE_VARS)}</code>
                    <span className="ml-auto text-[11px] text-slate-400">在「报告模板配置 · 评分方案」中编辑</span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs text-slate-400">自动评审综合总分</div>
                      <div className="text-5xl font-bold tabular-nums text-violet-700">{total == null ? '—' : total.toFixed(1)}</div>
                    </div>
                    <div className="text-right text-xs text-slate-400">由公式实时计算 · 随模板配置联动</div>
                  </div>
                </div>
              )
            })()}
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <KV label="决策建议"><DecisionSuggestionBadge v={d.row.suggestion} /></KV>
                <KV label="建议授信额度">¥{d.row.approvedAmount.toLocaleString()}（申请额度 ¥{d.row.amount.toLocaleString()} 的 {Math.round((d.row.approvedAmount / d.row.amount) * 100)}%）</KV>
                <KV label="建议利率">{d.suggestedRate}</KV>
                <KV label="人工复核建议">
                  <Badge kind={d.reviewAdvice === '必须人工复核' ? 'red' : 'amber'}>{d.reviewAdvice}</Badge>
                </KV>
                <KV label="决策依据摘要">{d.basisSummary}</KV>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                {d.subCards.map((c) => {
                  // 预警色与列表子系统状态一致
                  const tone = c.name === '信息核验'
                    ? infoKind[d.row.infoResult]
                    : c.name === '信用风控'
                      ? riskKind[creditRiskLevel[d.row.creditGrade]]
                      : riskKind[fraudRiskLevel[d.row.fraudResult]]
                  const cls = CARD_TONE[tone]
                  const statusLabel = c.name === '信息核验'
                    ? d.row.infoResult
                    : c.name === '信用风控'
                      ? creditRiskLevel[d.row.creditGrade]
                      : fraudRiskLevel[d.row.fraudResult]
                  const idx = c.scoreText.lastIndexOf(' ')
                  const scoreLabel = idx > 0 ? c.scoreText.slice(0, idx) : c.scoreText
                  const scoreValue = idx > 0 ? c.scoreText.slice(idx + 1) : ''
                  return (
                    <div key={c.name} className={`flex flex-col rounded-xl p-3.5 ring-1 ring-inset ${cls.card}`}>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500">{c.name}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${cls.pill}`}>{statusLabel}</span>
                      </div>
                      <div className="flex flex-1 flex-col items-center justify-center py-4">
                        <span className={`text-3xl font-bold tabular-nums ${cls.num}`}>{scoreValue}</span>
                        <span className="mt-1 text-xs text-slate-400">{scoreLabel}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            {/* 评分维度分布：统一为模板驱动表（读报告模板「报告内容配置」分段，受 showSectionTotals 开关与编辑实时影响） */}
            <TemplateDimTable reportType="decision" title="评分维度分布（各集合加权）" />
          </Panel>

          {/* 2、审批操作（合并授信方案） */}
          <Panel id="approval" className="scroll-mt-24" title="2、审批操作">
            <h4 className="mb-2 text-xs font-semibold text-slate-500">审批操作</h4>
            {actionableOps.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">当前状态「{d.row.approvalStatus}」已终态，无需操作。</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {/* 按分段渲染多按钮：来自报告模板「审核操作配置」的当前结论分段流程 */}
                {actions.segmentButtons.map((b) => (
                  <button
                    key={`seg-${b.idx}`}
                    type="button"
                    onClick={() => actions.openSeg(b.idx)}
                    className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700"
                  >
                    {b.label}
                  </button>
                ))}
                {OPERATIONS.filter((o) => o.op !== '审批').map((o) => (
                  <button
                    key={o.op}
                    type="button"
                    onClick={() => onOp(o.op)}
                    className="rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    {o.op}
                  </button>
                ))}
              </div>
            )}
            {actionableOps.length > 0 && (
              <p className="mt-2 text-xs text-slate-400">
                说明：{OPERATIONS.find((o) => recOps.has(o.op))?.desc ?? '按系统建议执行'}；触发条件：{OPERATIONS.find((o) => recOps.has(o.op))?.cond ?? '—'}
              </p>
            )}

            <h4 className="mb-2 mt-6 text-xs font-semibold text-slate-500">授信方案</h4>
            <div>
              <KV label="申请额度">¥{d.row.amount.toLocaleString()}</KV>
              <KV label="建议授信额度">¥{d.row.approvedAmount.toLocaleString()}（申请额度的 {Math.round((d.row.approvedAmount / d.row.amount) * 100)}%）</KV>
              <KV label="建议期限">{d.approvedTerm}</KV>
              <KV label="建议利率">{d.suggestedRate}</KV>
              <KV label="还款方式">{d.repaymentMethod}</KV>
              <KV label="额度限制原因">{d.limitReason}</KV>
            </div>

            <h4 className="mb-2 mt-6 text-xs font-semibold text-slate-500">授信方案对比</h4>
            <DefTable headers={['方案', '授信额度', '利率', '期限', '适用条件']}>
              {d.planCompare.map((p) => (
                <tr key={p.plan} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium text-ink-900">{p.plan}</td>
                  <td className="px-3 py-2 tabular-nums">{p.amount}</td>
                  <td className="px-3 py-2">{p.rate}</td>
                  <td className="px-3 py-2">{p.term}</td>
                  <td className="px-3 py-2 text-slate-500">{p.cond}</td>
                </tr>
              ))}
            </DefTable>
          </Panel>

          {/* 3、用户基本信息 */}
          <Panel id="basic" className="scroll-mt-24" title="3、用户基本信息">
            <UserBasicBlock row={d.row} />
          </Panel>

          {/* 4、信息核验摘要 */}
          <Panel id="info" className="scroll-mt-24" title="4、信息核验摘要" actions={<Button variant="ghost" onClick={jump('/console/cr/pre-verify')}>查看信息核验报告 →</Button>}>
            <KV label="核验结果"><DecisionInfoBadge v={d.info.result} /></KV>
            <KV label="信息核验得分"><span className={toneText(sectionTone('info'))}>{d.info.creditScore}</span></KV>
            <KV label="关键异常项" full>{d.infoKeyAnomaly}</KV>
            <KV label="核验通过项" full>{d.infoPassed}</KV>
            {d.info.hitRules.length > 0 && (
              <div className="mt-3">
                <div className="mb-1 text-xs text-slate-400">命中规则</div>
                <div className="flex flex-wrap gap-1.5">
                  {d.info.hitRules.map((r) => (
                    <Badge key={r} kind="amber">{r}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="mb-1 text-xs font-medium text-slate-500">配置打分项明细（按模板集合分组）</div>
              <TemplateScoredList reportType="info_verify" />
            </div>
          </Panel>

          {/* 5、信用风控摘要 */}
          <Panel id="credit" className="scroll-mt-24" title="5、信用风控摘要" actions={<Button variant="ghost" onClick={jump('/console/cr/credit-kimi')}>查看信用风控报告 →</Button>}>
            <KV label="信用评分"><span className={toneText(sectionTone('credit'))}>{d.creditScore900v} 分</span></KV>
            <KV label="信用风险等级"><DecisionRiskBadge v={creditRiskLevel[d.row.creditGrade]} /></KV>
            <KV label="关键风险项" full>{creditRiskText(d.row.creditGrade)}</KV>
            <KV label="正向因素" full>{creditPositiveText}</KV>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="mb-1 text-xs font-medium text-slate-500">配置打分项明细（按模板集合分组）</div>
              <TemplateScoredList reportType="credit" />
            </div>
          </Panel>

          {/* 6、欺诈识别摘要 */}
          <Panel id="fraud" className="scroll-mt-24" title="6、欺诈识别摘要" actions={<Button variant="ghost" onClick={jump('/console/cr/pre-fraud')}>查看欺诈识别报告 →</Button>}>
            <KV label="欺诈评分"><span className={toneText(sectionTone('fraud'))}>{d.fraudScoreRaw} 分</span></KV>
            <KV label="欺诈风险等级"><DecisionRiskBadge v={fraudRiskLevel[d.row.fraudResult]} /></KV>
            <KV label="命中规则数">{d.fraudHitCount}</KV>
            <KV label="关键命中规则" full>{d.fraudKeyRules.join('、')}</KV>
            <KV label="团伙标签" full>{d.fraudGroupTag}</KV>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="mb-1 text-xs font-medium text-slate-500">配置打分项明细（按模板集合分组）</div>
              <TemplateScoredList reportType="fraud" />
            </div>
          </Panel>

          {/* 7、操作日志 */}
          <Panel id="logs" className="scroll-mt-24" title="7、操作日志">
            <ol className="relative space-y-4 pl-5">
              {d.logs.map((l, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-5 top-1.5 h-2.5 w-2.5 rounded-full bg-violet-400" />
                  <div className="text-sm">
                    <span className="font-medium text-ink-900">{l.action}</span>
                    <span className="ml-2 text-xs text-slate-400">{l.time}</span>
                    <span className="ml-2 text-xs text-slate-500">{l.operator}</span>
                  </div>
                  <div className="text-xs text-slate-500">{l.detail}</div>
                </li>
              ))}
            </ol>
          </Panel>

          {/* 固定返回顶部（右下角悬浮圆形按钮，与欺诈识别报告模板一致） */}
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="返回顶部"
            className="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>

        {/* 右侧：页面导航（固定位置随页滚动吸顶，与欺诈识别报告模板一致） */}
        <nav className="hidden lg:block lg:w-44 lg:shrink-0">
          <div className="sticky top-32 flex flex-col gap-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">页面导航</p>
            {SECTIONS.map((sec) => {
              const tone = sectionTone(sec.id)
              const toneCls = tone === 'alert'
                ? 'bg-rose-50 font-medium text-rose-600'
                : tone === 'ok'
                  ? 'bg-emerald-50 font-medium text-emerald-600'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              const dot = tone === 'alert' ? 'bg-rose-500' : tone === 'ok' ? 'bg-emerald-500' : 'bg-slate-400'
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => { const el = document.getElementById(sec.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${toneCls}`}
                >
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />
                  <span>{sec.label}</span>
                  {tone === 'alert' && <span className="ml-auto text-[10px]">预警</span>}
                  {tone === 'ok' && <span className="ml-auto text-[10px]">正常</span>}
                  {tone === 'normal' && <span className="ml-auto text-[10px] text-slate-400">待定</span>}
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      {actions.Modal}
      {actions.segModalEl}
    </div>
  )
}
