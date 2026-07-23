// 欺诈识别报告详情（方案4 · 完整版「功能与内容设计文档」V1.0）
// 平行、独立、不破坏现有 cr:pre-fraud。交互骨架（PageHeader/DetailHeader、右侧锚点导航、操作栏+弹窗、操作日志、返回顶部）
// 1:1 复用信息核验体系；内容承载方案4 文档的 9 段详情（评分总览/规则命中/设备指纹/行为轨迹/关联图谱/黑名单/历史/处置建议/日志）。
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Button, DetailHeader, Panel } from '../components/ui'
import {
  buildFraudScheme4Report,
  S4_AUTO_KIND,
  type FraudS4Report,
  type FraudS4Rule,
  type FraudS4OpLog,
  type FraudS4ScoreBand,
  type FraudS4Level,
} from './fraudScheme4Report'
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
function ExemptModal({ open, target, onClose, onSubmit }: { open: boolean; target: string; onClose: () => void; onSubmit: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">规则豁免 · 填写豁免原因</h3>
        <p className="mb-3 text-xs text-slate-500">对象：{target}</p>
        <textarea className="mb-3 h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400" placeholder="请填写规则豁免原因…" value={reason} onChange={(e) => setReason(e.target.value)} />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={() => { if (reason.trim()) { onSubmit(reason); setReason(''); onClose() } }}>确认豁免</Button>
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
function Sparkline({ data, color = '#f43f5e' }: { data: number[]; color?: string }) {
  const w = 220, h = 44, pad = 4
  const min = Math.min(...data), max = Math.max(...data)
  const span = max - min || 1
  const pts = data.map((v, i) => {
    const x = pad + (i / (data.length - 1)) * (w - pad * 2)
    const y = h - pad - ((v - min) / span) * (h - pad * 2)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full">
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
      {pts.length > 0 && <circle cx={pad + ((data.length - 1) / (data.length - 1)) * (w - pad * 2)} cy={h - pad - ((data[data.length - 1] - min) / span) * (h - pad * 2)} r={2.5} fill={color} />}
    </svg>
  )
}

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

/* ========================= 规则卡片 ========================= */
function RuleCard({ r, onExempt }: { r: FraudS4Rule; onExempt: (name: string) => void }) {
  const [open, setOpen] = useState(false)
  const hit = r.status === '命中'
  return (
    <div className={cn('rounded-xl border bg-white p-4', hit ? 'border-rose-200 bg-rose-50/30' : 'border-slate-200')}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', hit ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-400')}>{r.status}</span>
          <span className="text-sm font-semibold text-ink-900">{r.name}</span>
          <Badge kind="blue">{r.type}</Badge>
        </div>
        <button type="button" onClick={() => setOpen(!open)} className="rounded p-1 text-slate-400 transition hover:bg-slate-100"><svg viewBox="0 0 24 24" className={cn('h-4 w-4 transition', open ? '' : 'rotate-180')} fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span>命中权重：<span className={r.weight === '—' ? 'text-slate-300' : levelCls[r.weight]}>{r.weight}</span></span>
        {hit && <span>处置建议：{r.advice}</span>}
      </div>
      {open && (
        <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">
          <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">命中详情：{r.detail}</div>
          <div className="flex flex-wrap gap-2">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>收起</Button>
            {hit && r.exemptible && <Button variant="ghost" size="sm" onClick={() => onExempt(r.name)}>规则豁免</Button>}
          </div>
        </div>
      )}
    </div>
  )
}

/* ========================= 操作日志时间线 ========================= */
function TimelineLog({ logs }: { logs: FraudS4OpLog[] }) {
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-5">
      {logs.map((l, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[26px] top-1 h-3 w-3 rounded-full border-2 border-white bg-brand-500" />
          <div className="rounded-lg border border-slate-100 bg-white px-3 py-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-ink-900">{l.type}</span>
              {l.result && <Badge kind={l.result === '命中' ? 'red' : 'gray'}>{l.result}</Badge>}
              <span className="text-xs text-slate-400">{l.operator} · {l.time}</span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{l.content}{l.remark ? `（${l.remark}）` : ''}</p>
          </div>
        </li>
      ))}
    </ol>
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

  const navCards: { id: string; label: string }[] = [
    { id: 'score', label: '欺诈评分' },
    { id: 'rules', label: '规则命中' },
    { id: 'device', label: '设备指纹' },
    { id: 'behavior', label: '行为轨迹' },
    { id: 'graph', label: '关联图谱' },
    { id: 'blacklist', label: '黑名单命中' },
    { id: 'disposition', label: '处置建议' },
    { id: 'logs', label: '操作日志' },
  ]

  return (
    <div className="space-y-6">
      <DetailHeader
        title="欺诈识别报告"
        subtitle={`申请编号 ${d.appId} · 申请人 ${d.name} · ${d.idNo} · 报告生成时间 ${d.reportTime}`}
        backLabel="返回欺诈识别"
        onBack={() => nav('/console/cr/fraud-s4')}
      />

      {/* 报告切换 tab */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-medium text-white">欺诈识别报告</span>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-400">信息核验报告</span>
        <span className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-400">信用风控报告</span>
      </div>

      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          {/* 一、欺诈风险评分总览 */}
          <Panel title="一、欺诈风险评分总览" id="score">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className={cn('text-5xl font-bold leading-none', bandText[d.scoreBand])}>{d.fraudScore}</span>
                <span className="text-sm text-slate-400">/ 100</span>
                <span className={cn('rounded-full px-3 py-1 text-sm font-semibold', bandChip[d.scoreBand])}>{d.scoreBand}风险</span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500">命中规则数：<b className="text-ink-900">{d.hitRuleCount}</b> 条</span>
                <Badge kind={S4_AUTO_KIND[d.autoDecision]}>{d.autoDecision}</Badge>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {d.fraudTags.map((t) => <span key={t} className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">{t}</span>)}
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="text-[11px] text-slate-400">近 30 天欺诈评分趋势</div>
                <div className="mt-1"><Sparkline data={d.scoreTrend} /></div>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                <div className="text-[11px] text-slate-400">自动决策</div>
                <div className="mt-2"><Badge kind={S4_AUTO_KIND[d.autoDecision]}>{d.autoDecision}</Badge></div>
                <p className="mt-2 text-xs text-slate-500">系统基于规则引擎的自动处置结果。</p>
              </div>
            </div>
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
                    <tr key={f.name} className="border-t border-slate-100">
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
          </div>

          {/* 二、反欺诈规则命中详情 */}
          <Panel title="二、反欺诈规则命中详情" id="rules" desc="以卡片列表展示每条命中的规则，可查看详情或标记规则豁免">
            <div className="grid gap-3 lg:grid-cols-2">
              {d.rules.map((r) => (
                <RuleCard key={r.name} r={r} onExempt={(name) => setModal({ type: 'exempt', target: name })} />
              ))}
            </div>
          </Panel>

          {/* 三、设备指纹分析 */}
          <Panel title="三、设备指纹分析" id="device">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { k: '设备指纹', v: d.device.fingerprint },
                { k: '设备类型', v: d.device.type },
                { k: 'Root/越狱状态', v: d.device.root },
                { k: '模拟器检测', v: d.device.simulator },
                { k: '代理/VPN检测', v: d.device.vpn },
                { k: '设备关联身份数', v: `${d.device.relatedIdentities} 个` },
                { k: '设备关联申请数', v: `${d.device.relatedApplications} 次` },
                { k: '设备首次出现时间', v: d.device.firstSeen },
              ].map((e) => (
                <div key={e.k} className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2">
                  <span className="text-sm text-slate-500">{e.k}</span>
                  <span className="text-sm font-medium text-ink-900">{e.v}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {d.device.riskTags.map((t) => <span key={t} className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">{t}</span>)}
            </div>
            <div className="mt-4">
              <div className="mb-2 text-xs font-medium text-slate-500">设备关联图谱（简版）</div>
              <DeviceGraph nodes={d.deviceNodes} edges={d.deviceEdges} />
            </div>
          </Panel>

          {/* 四、行为轨迹分析 */}
          <Panel title="四、行为轨迹分析" id="behavior">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { k: '申请耗时', v: d_b(d).duration },
                { k: '表单填写速度', v: d_b(d).fillSpeed },
                { k: '页面停留分布', v: d_b(d).dwell },
                { k: '操作路径', v: d_b(d).path },
                { k: '异常行为标记', v: d_b(d).anomalies.join('、') },
                { k: '与正常用户对比', v: d_b(d).deviation },
              ].map((e) => (
                <div key={e.k} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 px-3.5 py-2">
                  <span className="text-sm text-slate-500">{e.k}</span>
                  <span className="text-right text-sm font-medium text-ink-900">{e.v}</span>
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

          {/* 五、关联图谱分析（团伙欺诈） */}
          <Panel title="五、关联图谱分析（团伙欺诈）" id="graph">
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
                <div className="mb-2 text-xs font-medium text-slate-500">关联图谱可视化（力导向示意）</div>
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

          {/* 六、黑名单命中详情 */}
          <Panel title="六、黑名单命中详情" id="blacklist">
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

          {/* 七、历史欺诈记录 */}
          <Panel title="七、历史欺诈记录" id="history">
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

          {/* 八、风控处置建议 */}
          <Panel title="八、风控处置建议" id="disposition">
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
          </Panel>

          {/* 九、欺诈处置操作日志 */}
          <Panel title="九、欺诈处置操作日志" id="logs">
            <TimelineLog logs={logs} />
          </Panel>

          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="返回顶部"
            className="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>

        <nav className="hidden lg:block lg:w-44 lg:shrink-0">
          <div className="sticky top-32 flex flex-col gap-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">页面导航</p>
            {navCards.map((c) => (
              <button key={c.id} type="button" onClick={() => { const el = document.getElementById(c.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
                className="rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-500 transition hover:bg-slate-100 hover:text-slate-700">
                {c.label}
              </button>
            ))}
          </div>
        </nav>
      </div>

      <ExemptModal open={modal.type === 'exempt'} target={modal.target} onClose={() => setModal({ type: null, target: '' })} onSubmit={(reason) => addLog({ type: '规则豁免', content: `豁免规则：${modal.target}`, operator: '风控专员-张磊', time: new Date().toLocaleString('zh-CN'), remark: reason })} />
      <NoteModal open={modal.type === 'note'} target="" onClose={() => setModal({ type: null, target: '' })} onSubmit={(text) => addLog({ type: '录入备注', content: '录入人工复核备注', operator: '风控专员-张磊', time: new Date().toLocaleString('zh-CN'), remark: text })} />
    </div>
  )
}

// 行为字段取值辅助（保持 JSX 简洁）
function d_b(d: FraudS4Report) {
  return d.behavior
}
