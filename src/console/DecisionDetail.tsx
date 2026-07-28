import { useState, type ReactNode } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { DetailHeader, Panel, Badge, Button } from '../components/ui'
import {
  getDecisionDetail,
  seedDecisionRows,
  DecisionRow,
  InfoResult,
  creditRiskLevel,
  fraudRiskLevel,
  infoKind,
  riskKind,
} from './decisionReport'
import {
  DecisionSuggestionBadge,
  DecisionInfoBadge,
  DecisionRiskBadge,
  DecisionActionBar,
  DecisionActionKey,
  decisionOpsFor,
  useDecisionActions,
} from './DecisionOps'

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
  { op: '通过', desc: '同意系统建议，按建议额度授信', cond: '风控专员认为风险可控' },
  { op: '调整额度', desc: '通过但调整授信额度', cond: '风控专员认为系统建议额度偏高或偏低' },
  { op: '调整利率', desc: '通过但调整利率', cond: '风控专员认为系统建议利率不合适' },
  { op: '拒绝', desc: '拒绝授信申请', cond: '风控专员认为风险过高' },
  { op: '转人工', desc: '提交给上级或专家复核', cond: '风控专员无法判断' },
  { op: '退回补充材料', desc: '退回申请，要求补充材料', cond: '发现材料缺失或存疑' },
]

function KV({ label, children, full }: { label: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={`flex gap-4 border-b border-slate-100 py-2.5 text-sm ${full ? '' : 'justify-between'}`}>
      <span className="shrink-0 text-slate-400">{label}</span>
      <span className={`text-ink-900 ${full ? 'mt-1 block' : 'text-right font-medium'}`}>{children}</span>
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

// ============================ 复用块：证件与材料（与 pre-application 样式一致） ============================
type MatStatus = 'pass' | 'fail' | 'missing'
const MAT_META: Record<MatStatus, { box: string; icon: string; panel: string }> = {
  pass: { box: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: '✓', panel: 'bg-emerald-50/40' },
  fail: { box: 'bg-rose-50 text-rose-700 ring-rose-200', icon: '✕', panel: 'bg-rose-50/40' },
  missing: { box: 'bg-slate-50 text-slate-500 ring-slate-200', icon: '—', panel: 'bg-slate-50/40' },
}
interface MatFile { name: string; type: 'image' | 'video' | 'pdf' }
interface MatItem { name: string; status: MatStatus; submitted: string; result: string; files: MatFile[] }

function buildMaterials(info: InfoResult): MatItem[] {
  const bank = info === '通过' ? 'pass' : 'fail'
  const live = info === '拒绝' ? 'fail' : info === '通过' ? 'pass' : 'fail'
  return [
    { name: '身份证·人像面', status: 'pass', submitted: '申请人上传·人像面.jpg', result: '与公安库一致，姓名/证件号匹配', files: [{ name: '身份证人像面.jpg', type: 'image' }] },
    { name: '身份证·国徽面', status: 'pass', submitted: '申请人上传·国徽面.jpg', result: '证件有效期 > 3 个月，无误', files: [{ name: '身份证国徽面.jpg', type: 'image' }] },
    { name: '银行卡', status: bank, submitted: '绑定银行卡照片', result: bank === 'pass' ? '四要素核验通过' : '四要素与预留信息不一致', files: [{ name: '银行卡.jpg', type: 'image' }] },
    { name: '活体检测', status: live, submitted: '实时活体视频', result: live === 'pass' ? '活体通过，无翻拍攻击' : '活体存疑/未通过', files: [{ name: '活体检测.mp4', type: 'video' }] },
    { name: '收入证明', status: 'pass', submitted: '单位开具收入证明.pdf', result: '收入与负债比匹配', files: [{ name: '收入证明.pdf', type: 'pdf' }] },
  ]
}

function MaterialBlock({ infoResult }: { infoResult: InfoResult }) {
  const [tab, setTab] = useState(0)
  const mats = buildMaterials(infoResult)
  const active = mats[tab]
  const meta = MAT_META[active.status]
  return (
    <div className="mt-4 rounded-xl border border-slate-200 p-3">
      <div className="flex flex-wrap gap-2 text-xs">
        {mats.map((m, i) => {
          const mm = MAT_META[m.status]
          return (
            <button key={m.name} type="button" onClick={() => setTab(i)}
              className={`rounded-lg px-2.5 py-1 ring-1 ring-inset transition ${mm.box} ${tab === i ? 'ring-2 font-medium' : 'opacity-80 hover:opacity-100'}`}>
              {mm.icon} {m.name}
            </button>
          )
        })}
      </div>
      <div className={`mt-3 rounded-xl p-3 text-sm ${meta.panel}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium text-slate-700">{active.name}</span>
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${meta.box}`}>
            {meta.icon} {active.status === 'pass' ? '比对通过' : active.status === 'fail' ? '比对不通过' : '缺少资料'}
          </span>
        </div>
        <dl className="mt-2 space-y-1.5">
          <div className="flex gap-2"><dt className="shrink-0 text-slate-400">提交的资料</dt><dd className="text-slate-600">{active.submitted}</dd></div>
          <div className="flex gap-2"><dt className="shrink-0 text-slate-400">比对结果</dt><dd className="text-slate-600">{active.result}</dd></div>
        </dl>
        <div className="mt-3 border-t border-slate-200/70 pt-3">
          <p className="mb-2 text-xs text-slate-400">证明材料（图片、视频可直接查看，其余文档点击预览）</p>
          <div className="flex flex-wrap gap-3">
            {active.files.map((f) => {
              if (f.type === 'image') {
                return (
                  <div key={f.name} className="w-36 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200">
                    <div className="h-24 w-full" />
                    <span className="block truncate px-2 py-1.5 text-xs text-slate-600">{f.name}</span>
                  </div>
                )
              }
              if (f.type === 'video') {
                return (
                  <div key={f.name} className="relative w-36 overflow-hidden rounded-xl border border-slate-200 bg-black">
                    <div className="h-24 w-full bg-gradient-to-br from-slate-700 to-slate-900" />
                    <span className="absolute inset-0 grid place-items-center">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/25 backdrop-blur">
                        <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                      </span>
                    </span>
                    <span className="block truncate bg-white px-2 py-1.5 text-xs text-slate-600">{f.name}</span>
                  </div>
                )
              }
              return (
                <button key={f.name} type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs transition hover:border-brand-200 hover:bg-brand-50">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-100">📄</span>
                  <span className="max-w-[140px] truncate text-slate-600">{f.name}</span>
                  <span className="text-brand-600">预览</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
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

  // 审批操作按钮：根据报告结论/状态推荐对应操作
  const recOps = new Set<string>()
  {
    const r = d.row
    if (r.suggestion === '拒绝' || r.suggestion === '严格限制') recOps.add('拒绝')
    if (r.suggestion === '通过' || r.suggestion === '优先通过') recOps.add('通过')
    if (r.suggestion === '限制额度' || r.suggestion === '严格限制') { recOps.add('调整额度'); recOps.add('调整利率') }
    if (r.fraudResult === '疑似风险' || r.infoResult === '预警' || r.suggestion === '限制额度') recOps.add('转人工')
    if (r.infoResult === '预警') recOps.add('退回补充材料')
  }
  const actionableOps = decisionOpsFor(d.row.suggestion, d.row.approvalStatus).filter((o) => o !== 'view')
  const onOp = (op: string) => {
    const map: Record<string, DecisionActionKey> = {
      '通过': 'audit', '调整额度': 'audit', '调整利率': 'audit', '拒绝': 'audit',
      '转人工': 'submitReview', '退回补充材料': 'return',
    }
    onAction(map[op] ?? 'audit')
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
          </Panel>

          {/* 2、审批操作（合并授信方案） */}
          <Panel id="approval" className="scroll-mt-24" title="2、审批操作">
            <h4 className="mb-2 text-xs font-semibold text-slate-500">审批操作</h4>
            {actionableOps.length === 0 ? (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">当前状态「{d.row.approvalStatus}」已终态，无需操作。</p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                {OPERATIONS.map((o) => {
                  const rec = recOps.has(o.op)
                  return (
                    <button
                      key={o.op}
                      type="button"
                      onClick={() => onOp(o.op)}
                      className={rec
                        ? 'rounded-lg bg-brand-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-brand-700'
                        : 'rounded-lg border border-slate-200 px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50'}
                    >
                      {o.op}
                    </button>
                  )
                })}
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
            <MaterialBlock infoResult={d.info.result} />
          </Panel>

          {/* 5、信用风控摘要 */}
          <Panel id="credit" className="scroll-mt-24" title="5、信用风控摘要" actions={<Button variant="ghost" onClick={jump('/console/cr/credit-kimi')}>查看信用风控报告 →</Button>}>
            <KV label="信用评分"><span className={toneText(sectionTone('credit'))}>{d.creditScore900v} 分</span></KV>
            <KV label="信用风险等级"><DecisionRiskBadge v={creditRiskLevel[d.row.creditGrade]} /></KV>
            <KV label="关键风险项" full>{creditRiskText(d.row.creditGrade)}</KV>
            <KV label="正向因素" full>{creditPositiveText}</KV>
            <h4 className="mb-2 mt-5 text-xs font-semibold text-slate-500">六大维度得分摘要</h4>
            <DefTable headers={['维度', '得分', '等级', '说明']}>
              {d.creditDimensions.map((x) => (
                <tr key={x.name} className="border-b border-slate-100">
                  <td className="px-3 py-2 font-medium text-ink-900">{x.name}</td>
                  <td className={`px-3 py-2 tabular-nums font-medium ${toneText(x.level === '低风险' || x.level === '中风险' ? 'ok' : 'alert')}`}>{x.score}</td>
                  <td className="px-3 py-2"><DecisionRiskBadge v={x.level} /></td>
                  <td className="px-3 py-2 text-slate-500">{x.note}</td>
                </tr>
              ))}
            </DefTable>
          </Panel>

          {/* 6、欺诈识别摘要 */}
          <Panel id="fraud" className="scroll-mt-24" title="6、欺诈识别摘要" actions={<Button variant="ghost" onClick={jump('/console/cr/pre-fraud')}>查看欺诈识别报告 →</Button>}>
            <KV label="欺诈评分"><span className={toneText(sectionTone('fraud'))}>{d.fraudScoreRaw} 分</span></KV>
            <KV label="欺诈风险等级"><DecisionRiskBadge v={fraudRiskLevel[d.row.fraudResult]} /></KV>
            <KV label="命中规则数">{d.fraudHitCount}</KV>
            <KV label="关键命中规则" full>{d.fraudKeyRules.join('、')}</KV>
            <KV label="团伙标签" full>{d.fraudGroupTag}</KV>
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

      <DecisionActionBar row={d.row} onAction={onAction} />
      {actions.Modal}
    </div>
  )
}
