// 欺诈识别报告详情（方案4 · 完整版「功能与内容设计文档」V1.0）
// 平行、独立、已作为 cr:pre-fraud 模块（原 FraudReportDetail 已退役）。交互骨架（PageHeader/DetailHeader、右侧锚点导航、操作栏+弹窗、操作日志、返回顶部）
// 1:1 复用信息核验体系；内容承载方案4 文档的 9 段详情（评分总览/规则命中/设备指纹/行为轨迹/关联图谱/黑名单/历史/处置建议/日志）。
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Button, DetailHeader, Panel } from '../components/ui'
import { MergedOpTable } from '../components/MergedOpTable'
import {
  buildFraudScheme4Report,
  S4_AUTO_KIND,
  type FraudS4Report,
  type FraudS4Rule,
  type FraudS4OpLog,
  type FraudS4ScoreBand,
  type FraudS4Level,
} from './fraudScheme4Report'
import type { OpLog, OpActionType } from './infoVerifyReport'
import { useModule } from '../store'
import {
  FraudScheme4ActionBar,
  type FraudScheme4Row,
  type FraudScheme4WorkStatus,
  type FraudScheme4SysResult,
} from './FraudScheme4Ops'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

const bandText: Record<FraudS4ScoreBand, string> = { 极低: 'text-emerald-600', 低: 'text-emerald-600', 中: 'text-amber-600', 高: 'text-orange-600', 极高: 'text-rose-600' }
const bandChip: Record<FraudS4ScoreBand, string> = { 极低: 'bg-emerald-100 text-emerald-700', 低: 'bg-emerald-100 text-emerald-700', 中: 'bg-amber-100 text-amber-700', 高: 'bg-orange-100 text-orange-700', 极高: 'bg-rose-100 text-rose-700' }
const levelCls: Record<FraudS4Level, string> = { 低: 'text-emerald-600', 中: 'text-amber-600', 高: 'text-orange-600', 极高: 'text-rose-600' }
const levelBg: Record<FraudS4Level, string> = { 低: 'bg-emerald-100 text-emerald-700', 中: 'bg-amber-100 text-amber-700', 高: 'bg-orange-100 text-orange-700', 极高: 'bg-rose-100 text-rose-700' }
const blacklistLevelCls: Record<'极高危' | '高危' | '中' | '低', string> = { 极高危: 'text-rose-600', 高危: 'text-rose-500', 中: 'text-amber-600', 低: 'text-emerald-600' }

/* ========================= 弹窗 ========================= */
function ExemptModal({ open, target, onClose, onSubmit }: { open: boolean; target: string; onClose: () => void; onSubmit: (reason: string, attachment: string) => void }) {
  const [reason, setReason] = useState('')
  const [fileName, setFileName] = useState('')
  if (!open) return null
  const canSubmit = reason.trim() !== '' && fileName !== ''
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">规则豁免 · 填写豁免原因</h3>
        <p className="mb-3 text-xs text-slate-500">对象：{target}</p>
        <textarea className="mb-3 h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400" placeholder="请填写规则豁免原因…" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="mb-4">
          <label className="mb-1.5 block text-xs font-medium text-slate-500">豁免附件<span className="ml-0.5 text-rose-500">*</span></label>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center text-xs text-slate-400 transition hover:border-brand-300 hover:bg-brand-50/40">
            <span className="text-lg">📎</span>
            <span>{fileName ? `已选：${fileName}` : '点击上传豁免证明材料（必填）'}</span>
            <input type="file" className="hidden" onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')} />
          </label>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" disabled={!canSubmit} onClick={() => { if (canSubmit) { onSubmit(reason.trim(), fileName); setReason(''); setFileName(''); onClose() } }}>确认豁免</Button>
        </div>
      </div>
    </div>
  )
}

function NoteModal({ open, target, onClose, onSubmit }: { open: boolean; target: string; onClose: () => void; onSubmit: (text: string) => void }) {
  const [text, setText] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">录入备注</h3>
        <p className="mb-3 text-xs text-slate-500">对象：{target}</p>
        <textarea className="mb-3 h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400" placeholder="请输入备注内容…" value={text} onChange={(e) => setText(e.target.value)} />
        <div className="mb-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-400">点击或拖拽上传附件（通话录音、佐证截图、图谱导出）</div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={() => { if (text.trim()) { onSubmit(text); setText(''); onClose() } }}>提交</Button>
        </div>
      </div>
    </div>
  )
}

/* ========================= 小图表 ========================= */
function DeviceGraph({ nodes, edges }: { nodes: FraudS4Report['deviceNodes']; edges: FraudS4Report['deviceEdges'] }) {
  const pos: Record<string, { x: number; y: number }> = {
    cur: { x: 220, y: 60 }, dev: { x: 220, y: 170 }, net: { x: 90, y: 230 }, ph: { x: 350, y: 230 }, a1: { x: 110, y: 110 }, a2: { x: 330, y: 110 },
  }
  const color: Record<string, string> = { current: '#e11d48', applicant: '#f59e0b', device: '#6366f1', network: '#0ea5e9', phone: '#10b981' }
  return (
    <svg viewBox="0 0 440 280" className="h-56 w-full rounded-xl border border-slate-100 bg-slate-50/40">
      {edges.map((e, i) => {
        const a = pos[e.from], b = pos[e.to]
        if (!a || !b) return null
        return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#cbd5e1" strokeWidth={1.5} />
      })}
      {nodes.map((n) => {
        const p = pos[n.id]
        if (!p) return null
        return (
          <g key={n.id}>
            <circle cx={p.x} cy={p.y} r={16} fill={color[n.kind]} />
            <text x={p.x} y={p.y + 30} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 10 }}>{n.label}</text>
          </g>
        )
      })}
    </svg>
  )
}

function AssocGraph({ associations, gangTag }: { associations: FraudS4Report['graph']['associations']; gangTag: string }) {
  const cx = 180, cy = 150, R = 105
  const colors: Record<string, string> = { 强: '#e11d48', 中: '#f59e0b', 弱: '#94a3b8' }
  const statusColor: Record<string, string> = { 已确认欺诈: '#e11d48', 高风险: '#f59e0b', 待复核: '#94a3b8' }
  return (
    <svg viewBox="0 0 360 300" className="h-60 w-full rounded-xl border border-slate-100 bg-slate-50/40">
      {associations.map((a, i) => {
        const ang = (i / Math.max(1, associations.length)) * Math.PI * 2 - Math.PI / 2
        const x = cx + R * Math.cos(ang), y = cy + R * Math.sin(ang)
        return (
          <g key={i}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke={colors[a.strength] ?? '#94a3b8'} strokeWidth={a.strength === '强' ? 3 : a.strength === '中' ? 2 : 1} />
            <circle cx={x} cy={y} r={13} fill={statusColor[a.status] ?? '#94a3b8'} />
            <text x={x} y={y + 28} textAnchor="middle" className="fill-slate-600" style={{ fontSize: 9 }}>{a.target.replace('申请人-', '')}</text>
          </g>
        )
      })}
      <circle cx={cx} cy={cy} r={20} fill="#e11d48" />
      <text x={cx} y={cy + 4} textAnchor="middle" className="fill-white" style={{ fontSize: 10 }}>{gangTag.replace('（疑似）', '')}</text>
    </svg>
  )
}

/* ========================= 规则详情弹窗 ========================= */
function RuleDetailModal({ rule, onClose }: { rule: FraudS4Rule; onClose: () => void }) {
  const hit = rule.status === '命中'
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', hit ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400')}>{rule.status}</span>
          <h3 className="text-base font-semibold text-ink-900">{rule.name}</h3>
          <Badge kind="blue">{rule.type}</Badge>
        </div>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs text-slate-400">命中条件</dt>
            <dd className="mt-0.5 leading-relaxed text-slate-600">{rule.condition}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">权重</dt>
            <dd className="mt-0.5 text-slate-700">{rule.weight}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">信息核验联动</dt>
            <dd className="mt-0.5 text-slate-700">{rule.linkage}</dd>
          </div>
          {hit && (
            <div>
              <dt className="text-xs text-slate-400">处置建议</dt>
              <dd className="mt-0.5 text-slate-700">{rule.advice}</dd>
            </div>
          )}
        </dl>
        <div className="mt-5 flex justify-end">
          <Button variant="ghost" onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  )
}

/* ========================= 规则豁免策略（仅驱动「豁免」按钮显隐，不进入状态列） ========================= */
type S4ExemptPolicy = { canExempt: boolean }
function s4ExemptPolicy(weight: FraudS4Level | '—', hit: boolean): S4ExemptPolicy {
  if (!hit) return { canExempt: false }
  switch (weight) {
    case '极高': return { canExempt: false }          // 极高：不可豁免（无按钮）
    case '高':                                          // 高：豁免需审批（有按钮，审批在后续流程）
    case '中':
    case '低': return { canExempt: true }              // 中/低：可自免（有按钮）
    default: return { canExempt: false }
  }
}

/* ========================= 规则列表（表格 + 操作列） ========================= */
function RuleTable({ rules, onExempt }: { rules: FraudS4Rule[]; onExempt: (name: string) => void }) {
  const [detail, setDetail] = useState<FraudS4Rule | null>(null)
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-400">
              <th className="w-10 px-3 py-2 font-medium">序号</th>
              <th className="px-3 py-2 font-medium">规则名称</th>
              <th className="px-3 py-2 font-medium">命中条件</th>
              <th className="px-3 py-2 font-medium">权重</th>
              <th className="px-3 py-2 font-medium">信息核验联动</th>
              <th className="px-3 py-2 font-medium">状态</th>
              <th className="px-3 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => {
              const hit = r.status === '命中'
              const pol = s4ExemptPolicy(r.weight as FraudS4Level | '—', hit)
              const wCls = levelBg[r.weight as FraudS4Level]
              const sCls = hit ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400'
              return (
                <tr key={r.name} className={cn('border-t border-slate-100 align-top', hit ? 'bg-rose-50/40' : '')}>
                  <td className="px-3 py-2.5 text-slate-400 tabular-nums">{i + 1}</td>
                  <td className="px-3 py-2.5 font-medium text-ink-900">{r.name}</td>
                  <td className="max-w-xs px-3 py-2.5 leading-relaxed text-slate-600">{r.condition}</td>
                  <td className="px-3 py-2.5"><span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', wCls)}>{r.weight}</span></td>
                  <td className="max-w-xs px-3 py-2.5 text-slate-500">{r.linkage}</td>
                  <td className="px-3 py-2.5">
                    <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', sCls)}>{r.status}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <button type="button" onClick={() => setDetail(r)} className="text-brand-600 transition hover:underline">详情</button>
                    {hit && pol.canExempt && (
                      <button type="button" onClick={() => onExempt(r.name)} className="ml-2 text-slate-500 transition hover:underline">豁免</button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {detail && <RuleDetailModal rule={detail} onClose={() => setDetail(null)} />}
    </>
  )
}

/* ========================= 主页面 ========================= */
export default function FraudScheme4Detail() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const sysParam = (params.get('sys') as FraudScheme4SysResult) ?? '极高'
  const workParam = (params.get('work') as FraudScheme4WorkStatus) ?? '待复核'
  const opParam = params.get('op') ?? '--'
  const sampleId = params.get('id') ?? undefined
  const variantId = sysParam === '极高' || sysParam === '高' ? 'FRAUD' : sysParam === '中' ? 'SUSPECT' : 'PASS'
  const d = buildFraudScheme4Report(variantId)

  // 异常值（欺诈分）阈值刻度条：0-39 低(绿) / 40-79 中(黄) / 80-100 高(红)
  const scorePct = Math.min(100, Math.max(0, d.fraudScore))
  const jump = (id?: string) => {
    if (!id) return
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  const [fraudRow, setFraudRow] = useState<FraudScheme4Row>(() => ({
    id: sampleId ?? d.appId,
    name: d.name,
    product: d.product,
    amount: d.amount,
    fraudScore: d.fraudScore,
    scoreBand: d.scoreBand,
    hitRuleCount: d.hitRuleCount,
    ruleTypes: d.ruleTypes,
    autoDecision: d.autoDecision,
    workStatus: workParam,
    operator: opParam,
    gangTag: d.gangTag,
  }))
  const applyFraud = (next: Partial<FraudScheme4Row>) => setFraudRow((r) => ({ ...r, ...next }))
  const { flash } = useModule()

  type ModalType = 'exempt' | 'note' | null
  const [modal, setModal] = useState<{ type: ModalType; target: string }>({ type: null, target: '' })
  const [logs, setLogs] = useState<FraudS4OpLog[]>(d.opLogs)
  const addLog = (entry: FraudS4OpLog) => setLogs((prev) => [...prev, entry])
  // 操作日志复用信息核验「整体操作」合并表格：将欺诈日志映射为 OpLog 形状
  const opLogRows: OpLog[] = logs.map((l, i) => ({
    id: `${d.appId}-op-${i}`,
    target: d.name,
    actionType: l.type as OpActionType,
    operator: l.operator,
    time: l.time,
    remark: [l.content, l.remark].filter(Boolean).join(' · '),
  }))

  const navCards: { id: string; label: string; tone: 'ok' | 'alert' | 'normal' }[] = [
    { id: 'score', label: '欺诈评分', tone: d.scoreBand === '极低' || d.scoreBand === '低' ? 'ok' : 'alert' },
    { id: 'basic', label: '用户基本信息', tone: d.basic.some((f) => !f.valid) ? 'alert' : 'ok' },
    { id: 'rules', label: '身份欺诈详情', tone: d.rules.some((r) => r.type === '身份欺诈' && r.status === '命中') ? 'alert' : 'ok' },
    { id: 'forge', label: '信息伪造详情', tone: d.rules.some((r) => r.type === '信息伪造' && r.status === '命中') ? 'alert' : 'ok' },
    { id: 'device', label: '设备欺诈详情', tone: d.device.riskTags.length > 0 ? 'alert' : 'ok' },
    { id: 'behavior', label: '行为欺诈详情', tone: d.behavior.anomalies.length > 0 ? 'alert' : 'ok' },
    { id: 'graph', label: '团伙欺诈详情', tone: d.graph.gangTag.includes('团伙') ? 'alert' : 'ok' },
    { id: 'blacklist', label: '黑名单命中详情', tone: d.blacklistRecords.length > 0 ? 'alert' : 'ok' },
    { id: 'disposition', label: '处置建议', tone: d.autoDecision === '拒绝' ? 'alert' : 'ok' },
    { id: 'logs', label: '操作日志', tone: 'ok' },
  ]

  return (
    <div className="space-y-6">
      <DetailHeader
        title="欺诈识别报告"
        subtitle={`申请编号 ${d.appId} · 申请人 ${d.name} · ${d.idNo} · 报告生成时间 ${d.reportTime}`}
        backLabel="返回欺诈识别"
        onBack={() => nav('/console/cr/pre-fraud')}
      />

      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          {/* 欺诈风险评分模型卡（结论级，领衔整份报告） */}
          <Panel id="score">
            {/* 标识行 */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-6 items-center rounded-md bg-slate-800 px-2 text-[11px] font-medium text-white">欺诈风险</span>
                <span className="text-sm font-semibold text-ink-900">欺诈风险评分模型</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">规则版本 {d.ruleVersion}</span>
              </div>
              <span className="text-[11px] text-slate-400">分值越大风险越高 · 满分 100</span>
            </div>

            {/* 总分 + 阈值刻度条 */}
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="flex items-end gap-3">
                <div className="flex items-baseline">
                  <span className={cn('text-5xl font-bold leading-none', bandText[d.scoreBand])}>{d.fraudScore}</span>
                  <span className="ml-1 text-sm font-normal text-slate-300">/ 100</span>
                </div>
              </div>

              {/* 阈值刻度条 */}
              <div className="min-w-0 flex-1">
                <div className="relative h-2.5 w-full overflow-visible rounded-full">
                  <div className="absolute inset-0 flex overflow-hidden rounded-full">
                    <div className="h-full bg-emerald-400" style={{ width: '40%' }} />
                    <div className="h-full bg-amber-400" style={{ width: '20%' }} />
                    <div className="h-full bg-orange-400" style={{ width: '20%' }} />
                    <div className="h-full bg-rose-400" style={{ width: '20%' }} />
                  </div>
                  {/* 指针 */}
                  <div
                    className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${scorePct}%` }}
                  >
                    <div className="h-4 w-4 rounded-full border-2 border-white bg-slate-800 shadow" />
                  </div>
                </div>
                <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
                  <span>0 · 极低</span>
                  <span>40</span>
                  <span>60</span>
                  <span>80</span>
                  <span>100 · 极高</span>
                </div>
              </div>
            </div>

            {/* 标签合并一行：拒绝 / 极高风险 / 设备群控·团伙欺诈·黑名单命中 / 命中占比（高度一致） */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge kind={S4_AUTO_KIND[d.autoDecision]}>{d.autoDecision}</Badge>
              <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', bandChip[d.scoreBand])}>{d.scoreBand}风险</span>
              {d.fraudTags.map((t) => <span key={t} className="inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">{t}</span>)}
              {(() => {
                const pct = Math.round((d.hitRuleCount / d.totalRuleCount) * 100)
                const pctCls = pct <= 1 ? 'bg-emerald-100 text-emerald-700' : pct <= 50 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                return (
                  <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', pctCls)}>
                    命中 <b className="text-ink-900">{d.hitRuleCount}</b>/{d.totalRuleCount} 条规则，占比 {pct}%
                  </span>
                )
              })()}
            </div>

            {/* 因子构成表（可点击定位到对应分析模块） */}
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400">
                    <th className="px-3 py-2 font-medium">欺诈因子</th>
                    <th className="px-3 py-2 text-right font-medium">得分</th>
                    <th className="px-3 py-2 text-right font-medium">权重</th>
                    <th className="px-3 py-2 text-center font-medium">等级</th>
                    <th className="px-3 py-2 font-medium">说明</th>
                  </tr>
                </thead>
                <tbody>
                  {d.factors.map((f) => (
                    <tr
                      key={f.name}
                      className={cn(
                        'border-t border-slate-100 align-top transition',
                        f.traceTo ? 'cursor-pointer hover:bg-slate-50' : '',
                      )}
                      onClick={() => jump(f.traceTo)}
                      title={f.traceTo ? '点击定位到对应分析模块' : undefined}
                    >
                      <td className="px-3 py-2.5 font-medium text-ink-900">{f.name}</td>
                      <td className={cn('px-3 py-2.5 text-right font-semibold', levelCls[f.level])}>{f.score}</td>
                      <td className="px-3 py-2.5 text-right text-slate-400">{f.weight}%</td>
                      <td className="px-3 py-2.5 text-center"><span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', levelBg[f.level])}>{f.level}</span></td>
                      <td className="px-3 py-2.5 text-slate-500">{f.desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 审计栏 */}
            <div className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-relaxed text-slate-400">
              计算时间：{d.reportTime} | 规则版本：{d.ruleVersion} | 综合报告ID：{d.appId}
            </div>
          </Panel>

          {/* 系统状态 / 处置操作栏 */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <FraudScheme4ActionBar
              row={fraudRow}
              onApply={applyFraud}
              onLog={(e) => addLog(e)}
              flash={flash}
              showView={false}
            />
            {/* 处置建议（原第九部分：删除标题，置于操作栏与欺诈识别过程之间） */}
            <div id="disposition" className="mt-4 border-t border-slate-100 pt-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                <div className="text-sm font-semibold text-ink-900">系统建议：{d.disposition.suggestion}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">建议理由：{d.disposition.reason}</p>
                <div className="mt-2">
                  <div className="mb-1 text-[11px] font-medium text-slate-400">证据链</div>
                  <div className="flex flex-wrap gap-1.5">
                    {d.disposition.evidence.map((e) => <span key={e} className="rounded-full bg-white px-2.5 py-0.5 text-xs text-rose-700 ring-1 ring-rose-200">{e}</span>)}
                  </div>
                </div>
              </div>
            </div>
            {/* 欺诈识别过程（原「核验过程」卡片，弱化、横向置于卡底） */}
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="mb-2 text-[11px] font-medium text-slate-400">欺诈识别过程</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {d.threads.map((t, i) => {
                  // 每步按自身 conclusion 上色：拒绝=红 / 预警=黄 / 待定=灰 / 通过=绿
                  const tone = (t.conclusion ?? 'pass') as 'reject' | 'warning' | 'pending' | 'pass'
                  const dot =
                    tone === 'reject'
                      ? 'bg-rose-500'
                      : tone === 'warning'
                        ? 'bg-amber-500'
                        : tone === 'pending'
                          ? 'bg-slate-400'
                          : 'bg-emerald-500'
                  const res =
                    tone === 'reject'
                      ? 'text-rose-600'
                      : tone === 'warning'
                        ? 'text-amber-600'
                        : tone === 'pending'
                          ? 'text-slate-500'
                          : 'text-emerald-600'
                  return (
                    <div key={t.id} className="flex items-center gap-1.5 text-[11px]">
                      <span className="w-3 shrink-0 text-right tabular-nums text-slate-400">{i + 1}</span>
                      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
                      <span className="text-slate-500">{t.name}</span>
                      <span className={res}>{t.result}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 一、用户基本信息（简化、弱化） */}
          <Panel title="一、用户基本信息" id="basic">
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">
              {d.basic.map((f) => (
                <div key={f.key} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50/60 px-3 py-2">
                  <span className="text-sm text-slate-400">{f.label}</span>
                  <span className="text-sm font-medium text-ink-900">{f.value}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* 二、身份欺诈详情 */}
          <Panel title="二、身份欺诈详情" id="rules" desc="展示身份维度的命中规则，可查看详情或标记规则豁免">
            <RuleTable rules={d.rules.filter((r) => r.type === '身份欺诈')} onExempt={(name) => setModal({ type: 'exempt', target: name })} />
          </Panel>

          {/* 三、信息伪造详情 */}
          <Panel title="三、信息伪造详情" id="forge" desc="展示信息伪造维度的命中规则，可查看详情或标记规则豁免">
            <RuleTable rules={d.rules.filter((r) => r.type === '信息伪造')} onExempt={(name) => setModal({ type: 'exempt', target: name })} />
          </Panel>

          {/* 四、设备欺诈详情（原设备指纹分析） */}
          <Panel title="四、设备欺诈详情" id="device">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {([
                { k: '设备指纹', v: d.device.fingerprint },
                { k: '设备类型', v: d.device.type },
                { k: 'Root/越狱状态', v: d.device.root },
                { k: '模拟器检测', v: d.device.simulator },
                { k: '代理/VPN检测', v: d.device.vpn, exempt: true },
                { k: '设备关联身份数', v: `${d.device.relatedIdentities} 个`, exempt: true },
                { k: '设备关联申请数', v: `${d.device.relatedApplications} 次` },
                { k: '设备首次出现时间', v: d.device.firstSeen },
              ] as Array<{ k: string; v: string; exempt?: boolean }>).map((e) => (
                <div key={e.k} className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3.5 py-2">
                  <span className="text-sm text-slate-500">{e.k}</span>
                  <span className="flex items-center gap-2">
                    <span className="text-right text-sm font-medium text-ink-900">{e.v}</span>
                    {e.exempt && (
                      <button type="button" onClick={() => setModal({ type: 'exempt', target: e.k })} className="whitespace-nowrap text-xs text-brand-600 transition hover:underline">豁免</button>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {d.device.riskTags.map((t) => <span key={t} className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">{t}</span>)}
            </div>
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-slate-500">设备关联图谱</div>
              <DeviceGraph nodes={d.deviceNodes} edges={d.deviceEdges} />
            </div>
          </Panel>

          {/* 五、行为欺诈详情（原行为轨迹分析） */}
          <Panel title="五、行为欺诈详情" id="behavior">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {([
                { k: '申请耗时', v: d_b(d).duration },
                { k: '填写速度异常', v: d_b(d).fillSpeed, exempt: true },
                { k: '页面停留分布', v: d_b(d).dwell },
                { k: '操作路径', v: d_b(d).path },
                { k: '操作轨迹异常', v: d_b(d).anomalies.join('、') || '—', exempt: true },
                { k: '与正常用户对比', v: d_b(d).deviation },
                { k: 'GPS定位异常', v: d.behavior.gps, exempt: true },
              ] as Array<{ k: string; v: string; exempt?: boolean }>).map((e) => (
                <div key={e.k} className="flex flex-col gap-0.5 rounded-lg bg-slate-50 px-3.5 py-2">
                  <span className="text-xs text-slate-400">{e.k}</span>
                  <span className="text-sm font-medium text-ink-900">{e.v}</span>
                  {e.exempt && (
                    <button type="button" onClick={() => setModal({ type: 'exempt', target: e.k })} className="mt-0.5 self-start whitespace-nowrap text-xs text-brand-600 transition hover:underline">豁免</button>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-slate-500">行为轨迹时间线</div>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400">
                      <th className="px-3 py-2 font-medium">时间</th>
                      <th className="px-3 py-2 font-medium">行为</th>
                      <th className="px-3 py-2 font-medium">异常标记</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.behavior.timeline.map((t, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-slate-500">{t.time}</td>
                        <td className="px-3 py-2 text-ink-900">{t.action}</td>
                        <td className={cn('px-3 py-2', t.flag === '—' ? 'text-slate-300' : 'text-rose-600')}>{t.flag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>

          {/* 六、团伙欺诈详情（原关联图谱分析） */}
          <Panel title="六、团伙欺诈详情" id="graph">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { k: '团伙标签', v: d.graph.gangTag },
                { k: '关联度评分', v: `${d.graph.relevanceScore}` },
                { k: '关联维度', v: d.graph.dimensions.join('、') || '—' },
                { k: '关联节点数', v: `${d.graph.nodeCount} 个` },
                { k: '团伙规模', v: `共 ${d.graph.gangSize} 人` },
                { k: '团伙历史案件', v: `已确认欺诈 ${d.graph.gangHistory} 起` },
              ].map((e) => (
                <div key={e.k} className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2">
                  <span className="text-sm text-slate-500">{e.k}</span>
                  <span className="text-right text-sm font-medium text-ink-900">{e.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
              <div>
                <div className="mb-2 text-xs font-medium text-slate-500">关联图谱可视化</div>
                <AssocGraph associations={d.graph.associations} gangTag={d.graph.gangTag} />
              </div>
              <div>
                <div className="mb-2 text-xs font-medium text-slate-500">关联列表</div>
                <div className="overflow-hidden rounded-xl border border-slate-100">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-400">
                        <th className="px-3 py-2 font-medium">关联类型</th>
                        <th className="px-3 py-2 font-medium">关联对象</th>
                        <th className="px-3 py-2 font-medium">关联强度</th>
                        <th className="px-3 py-2 font-medium">对象状态</th>
                      </tr>
                    </thead>
                    <tbody>
                      {d.graph.associations.map((a, i) => (
                        <tr key={i} className="border-t border-slate-100">
                          <td className="px-3 py-2 text-slate-700">{a.type}</td>
                          <td className="px-3 py-2 text-ink-900">{a.target}</td>
                          <td className={cn('px-3 py-2 font-medium', a.strength === '强' ? 'text-rose-600' : a.strength === '中' ? 'text-amber-600' : 'text-slate-400')}>{a.strength}</td>
                          <td className="px-3 py-2 text-slate-500">{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </Panel>

          {/* 七、黑名单命中详情 */}
          <Panel title="七、黑名单命中详情" id="blacklist">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { k: '黑名单类型', v: d.blacklistHit.type },
                { k: '命中字段', v: d.blacklistHit.field },
                { k: '黑名单来源', v: d.blacklistHit.source },
                { k: '入库原因', v: d.blacklistHit.reason },
                { k: '入库时间', v: d.blacklistHit.time },
                { k: '命中等级', v: d.blacklistHit.level },
              ].map((e) => (
                <div key={e.k} className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2">
                  <span className="text-sm text-slate-500">{e.k}</span>
                  <span className="text-right text-sm font-medium text-ink-900">{e.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-slate-500">黑名单命中记录</div>
              <div className="overflow-hidden rounded-xl border border-slate-100">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-400">
                      <th className="px-3 py-2 font-medium">黑名单库</th>
                      <th className="px-3 py-2 font-medium">命中字段</th>
                      <th className="px-3 py-2 font-medium">命中内容</th>
                      <th className="px-3 py-2 font-medium">入库原因</th>
                      <th className="px-3 py-2 font-medium">入库时间</th>
                      <th className="px-3 py-2 font-medium">命中等级</th>
                    </tr>
                  </thead>
                  <tbody>
                    {d.blacklistRecords.length === 0 ? (
                      <tr><td colSpan={6} className="px-3 py-6 text-center text-slate-400">未命中任何黑名单</td></tr>
                    ) : d.blacklistRecords.map((r, i) => (
                      <tr key={i} className="border-t border-slate-100">
                        <td className="px-3 py-2 text-slate-700">{r.db}</td>
                        <td className="px-3 py-2 text-slate-600">{r.field}</td>
                        <td className="px-3 py-2 text-ink-900">{r.content}</td>
                        <td className="px-3 py-2 text-slate-500">{r.reason}</td>
                        <td className="px-3 py-2 text-slate-500">{r.time}</td>
                        <td className={cn('px-3 py-2 font-medium', blacklistLevelCls[r.level])}>{r.level}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Panel>

          {/* 八、历史欺诈记录 */}
          <Panel title="八、历史欺诈记录" id="history">
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400">
                    <th className="px-3 py-2 font-medium">申请编号</th>
                    <th className="px-3 py-2 font-medium">申请时间</th>
                    <th className="px-3 py-2 text-right font-medium">欺诈评分</th>
                    <th className="px-3 py-2 font-medium">命中规则</th>
                    <th className="px-3 py-2 font-medium">处置结果</th>
                    <th className="px-3 py-2 font-medium">处置人</th>
                    <th className="px-3 py-2 font-medium">处置时间</th>
                  </tr>
                </thead>
                <tbody>
                  {d.history.length === 0 ? (
                    <tr><td colSpan={7} className="px-3 py-6 text-center text-slate-400">无历史欺诈记录</td></tr>
                  ) : d.history.map((h, i) => (
                    <tr key={i} className="border-t border-slate-100">
                      <td className="px-3 py-2 text-slate-700">{h.appId}</td>
                      <td className="px-3 py-2 text-slate-500">{h.time}</td>
                      <td className="px-3 py-2 text-right font-semibold text-rose-600">{h.score}</td>
                      <td className="px-3 py-2 text-slate-500">{h.rules}</td>
                      <td className="px-3 py-2 text-ink-900">{h.result}</td>
                      <td className="px-3 py-2 text-slate-500">{h.operator}</td>
                      <td className="px-3 py-2 text-slate-500">{h.opTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Panel>

          {/* 九、操作日志（复用信息核验「整体操作」合并表格） */}
          <Panel title="九、操作日志" id="logs">
            <MergedOpTable itemActions={[]} opLogs={opLogRows} />
          </Panel>

          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="返回顶部"
            className="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>

        <nav className="hidden lg:block lg:w-44 lg:shrink-0">
          <div className="sticky top-32 flex flex-col gap-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">页面导航</p>
            {navCards.map((c) => {
              const toneCls =
                c.tone === 'alert'
                  ? 'bg-rose-50 font-medium text-rose-600'
                  : c.tone === 'ok'
                    ? 'bg-emerald-50 font-medium text-emerald-600'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              const dot = c.tone === 'alert' ? 'bg-rose-500' : c.tone === 'ok' ? 'bg-emerald-500' : ''
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { const el = document.getElementById(c.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${toneCls}`}
                >
                  {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}
                  <span className={dot ? '' : 'pl-3.5'}>{c.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>

      <ExemptModal open={modal.type === 'exempt'} target={modal.target} onClose={() => setModal({ type: null, target: '' })} onSubmit={(reason, attachment) => addLog({ type: '规则豁免', content: `豁免规则：${modal.target}`, operator: '风控专员-张磊', time: new Date().toLocaleString('zh-CN'), remark: `${reason}${attachment ? `（附件：${attachment}）` : ''}` })} />
      <NoteModal open={modal.type === 'note'} target="" onClose={() => setModal({ type: null, target: '' })} onSubmit={(text) => addLog({ type: '录入备注', content: '录入人工复核备注', operator: '风控专员-张磊', time: new Date().toLocaleString('zh-CN'), remark: text })} />
    </div>
  )
}

// 行为字段取值辅助（保持 JSX 简洁）
function d_b(d: FraudS4Report) {
  return d.behavior
}
