// 欺诈识别报告详情（方案1）
// 框架与信息核验 PreVerifyDetail 完全对齐：页面结构、sticky 导航、分支/标签/图片/预警/联动/操作日志/返回顶部
// 内容围绕「反欺诈评分 / 欺诈网络 / 关联黑名单 / 设备环境」展开，复用同一套组件与交互。
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, Button, DetailHeader, Panel } from '../components/ui'
import {
  buildFraudScheme1Report,
  type Conclusion,
  type RiskLevel,
  type SingleResult,
  type RulePromptType,
  type OpLog,
  type AtomicResult,
  type VerifyConflict,
  type ScoreComponent,
  type CrossCheck,
} from './fraudScheme1Report'
import { useModule } from '../store'
import { FraudActionBar, type FraudRow, type FraudWorkStatus, type FraudSysResult } from './FraudScheme1Ops'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

// 反欺诈结论文案：复用 Conclusion 类型（pass/warning/reject），仅改展示文案
const conclText: Record<Conclusion, string> = {
  pass: '无风险', warning: '可疑', reject: '确认欺诈', pending: '待定',
}
const conclKind: Record<Conclusion, 'green' | 'red' | 'amber' | 'blue'> = {
  pass: 'green', reject: 'red', warning: 'amber', pending: 'blue',
}
const riskText: Record<RiskLevel, string> = { high: '高', medium: '中', low: '低' }
const riskKind: Record<RiskLevel, 'red' | 'amber' | 'blue'> = {
  high: 'red', medium: 'amber', low: 'blue',
}

const statusCls: Record<string, string> = {
  ok: 'text-emerald-600', fail: 'text-rose-600', warn: 'text-amber-600', info: 'text-sky-600',
}

const srcIcon: Record<string, string> = {
  police: 'M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z',
  operator: 'M6 3h12v18H6zM9 7h6M9 11h6M9 15h3',
  unionpay: 'M3 8h18v8H3zM3 11h18',
  device: 'M4 5h16v11H4zM8 20h8M12 16v4',
  network: 'M12 3l9 5v8l-9 5-9-5V8z',
  rule: 'M4 6h16M4 12h16M4 18h10',
}
function SrcIcon({ name }: { name: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d={srcIcon[name] ?? srcIcon.network} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ========================= 操作模态框 =========================

function NoteModal({ open, target, onClose, onSubmit }: { open: boolean; target: string; onClose: () => void; onSubmit: (text: string) => void }) {
  const [text, setText] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">录入备注</h3>
        <p className="mb-3 text-xs text-slate-500">对象：{target}</p>
        <textarea
          className="mb-3 h-28 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400"
          placeholder="请输入备注内容..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mb-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-400">
          点击或拖拽上传附件（通话录音、结清证明、证件佐证截图）
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={() => { if (text.trim()) { onSubmit(text); setText(''); onClose() } }}>提交</Button>
        </div>
      </div>
    </div>
  )
}

function ReceiptModal({ open, target, onClose }: { open: boolean; target: string; onClose: () => void }) {
  if (!open) return null
  const mockJson = JSON.stringify({
    report_id: 'FR2026072114320056',
    channel: 'device_fingerprint',
    status: 'success',
    result: { device_id: 'DV-9F2A-77C1', emulator: false, root: false, group_hit: false },
    receipt_no: 'FR-20260721-143218-7F3A',
  }, null, 2)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-ink-900">原始回执</h3>
            <p className="text-xs text-slate-500">对象：{target}</p>
          </div>
          <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">官方回执流水</span>
        </div>
        <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-xs text-emerald-400">{mockJson}</pre>
        <div className="mt-3 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  )
}

function ExemptModal({ open, target, onClose, onSubmit }: { open: boolean; target: string; onClose: () => void; onSubmit: (reason: string, reviewer: string) => void }) {
  const [reason, setReason] = useState('')
  const [reviewer, setReviewer] = useState('')
  const [step, setStep] = useState<'apply' | 'review'>('apply')
  if (!open) return null
  const handleNext = () => {
    if (!reason.trim()) return
    setStep('review')
  }
  const handleSubmit = () => {
    if (!reviewer.trim()) return
    onSubmit(reason, reviewer)
    setReason('')
    setReviewer('')
    setStep('apply')
    onClose()
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">
          {step === 'apply' ? '标记豁免 · 提交豁免申请' : '标记豁免 · 二级复核确认'}
        </h3>
        <p className="mb-3 text-xs text-slate-500">对象：{target}</p>
        {step === 'apply' ? (
          <>
            <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
              风险提示：豁免操作需双人复核，单人无法直接豁免风险。请填写豁免原因后进入复核环节。
            </div>
            <textarea
              className="mb-3 h-24 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400"
              placeholder="请输入豁免原因..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>取消</Button>
              <Button variant="primary" onClick={handleNext}>提交 → 进入二级复核</Button>
            </div>
          </>
        ) : (
          <>
            <div className="mb-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
              <span className="text-xs text-slate-400">豁免原因：</span>{reason}
            </div>
            <div className="mb-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 p-3 text-xs text-amber-700">
              二级复核人须为独立审核人员，不得为豁免申请人本人。请确认复核人身份后填写姓名确认。
            </div>
            <input
              className="mb-3 w-full rounded-lg border border-slate-200 px-3 py-3 text-sm outline-none focus:border-brand-400"
              placeholder="复核人姓名"
              value={reviewer}
              onChange={(e) => setReviewer(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setStep('apply')}>返回修改</Button>
              <Button variant="primary" onClick={handleSubmit}>确认豁免</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ---- 全局操作弹窗：查看打分权重明细 ----
function WeightsModal({
  open, onClose, score, scoreCap, ruleVersion, components,
}: { open: boolean; onClose: () => void; score: number; scoreCap: number; ruleVersion: string; components: ScoreComponent[] }) {
  if (!open) return null
  const levelCls: Record<RiskLevel, string> = {
    high: 'text-rose-600', medium: 'text-amber-600', low: 'text-emerald-600',
  }
  const barCls: Record<RiskLevel, string> = {
    high: 'bg-rose-500', medium: 'bg-amber-500', low: 'bg-emerald-500',
  }
  const compTotal = components.reduce((s, c) => s + c.score, 0)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">打分权重明细</h3>
        <p className="mb-3 text-xs text-slate-500">策略人员 / 审计追溯打分逻辑 · 规则版本：{ruleVersion}</p>

        <div className="mb-4 rounded-lg bg-slate-50 p-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">欺诈评分</span>
            <span className="text-lg font-bold text-rose-600">{score}<span className="text-xs font-normal text-slate-400">/{scoreCap}</span></span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">计算明细：Σ 各风险项得分 = {compTotal}{compTotal === 0 ? '（未累计到风险证据）' : ''}</div>
        </div>

        <div className="mb-3 text-xs font-medium text-slate-500">① 各风险项权重占比</div>
        <div className="space-y-2.5">
          {components.length === 0
            ? <div className="rounded-lg bg-slate-50 px-3 py-3 text-xs text-slate-400">无风险证据累计，欺诈评分为 0。</div>
            : components.map((c) => (
              <div key={c.name}>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">{c.name}{c.core ? '（核心因子）' : ''}</span>
                  <span className={cn('font-semibold', levelCls[c.level])}>权重 {c.weight}% · 得分 {c.score}</span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div className={cn('h-full rounded-full', barCls[c.level])} style={{ width: `${(c.score / scoreCap) * 100}%` }} />
                </div>
              </div>
            ))}
        </div>

        <div className="mb-2 mt-4 text-xs font-medium text-slate-500">② 对应风控策略版本规则原文（{ruleVersion}）</div>
        <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-emerald-400">{
`策略 V3.0（节选）
R1 设备命中虚拟机+群控，权重 42%，直接触发确认欺诈；
R2 命中伪造网络环境（代理/VPN/数据中心），权重 26%，叠加高风险升级确认欺诈；
R3 欺诈评分 = Σ(风险项得分)，≥700 且命中团伙规则 → 确认欺诈，需双人复核推翻。`
        }</pre>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>关闭</Button>
        </div>
      </div>
    </div>
  )
}

// ========================= 单项核验卡片 =========================

function ActionDropdown({
  open,
  onToggle,
  actions,
}: {
  open: boolean
  onToggle: () => void
  actions: { label: string; onClick: () => void }[]
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
      >
        操作
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={onToggle} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
            {actions.map((a) => (
              <button
                key={a.label}
                type="button"
                className="w-full px-3 py-3 text-left text-xs text-slate-600 transition hover:bg-slate-50 hover:text-ink-900"
                onClick={() => { a.onClick(); onToggle() }}
              >
                {a.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function RuleTooltip({ type }: { type: RulePromptType }) {
  if (type === 'pass') return null
  return (
    <span className="group relative ml-1.5 cursor-help text-[10px] text-slate-400">
      ⓘ 处置规则
      <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-3 text-[11px] leading-relaxed text-white opacity-0 transition group-hover:opacity-100" style={{ minWidth: '320px', whiteSpace: 'normal' }}>
        {type === 'reject'
          ? '当前项为重度欺诈风险，系统默认拦截，仅可双人复核后手动推翻确认欺诈结论。'
          : '当前项为轻度风险，多条预警叠加将提升欺诈评分，必须人工电话核实客户信息，核实无误可标记豁免。'}
        <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800" />
      </span>
    </span>
  )
}

function getActionsForConclusion(concl: Conclusion, handlers: {
  onReverify: () => void
  onNote: () => void
  onExempt: () => void
  onReceipt: () => void
  onECLink: () => void
}) {
  const actions: { label: string; onClick: () => void }[] = []
  if (concl === 'reject' || concl === 'warning' || concl === 'pending') {
    actions.push({ label: '重新核验', onClick: handlers.onReverify })
  }
  if (concl !== 'pass') {
    actions.push({ label: '录入备注', onClick: handlers.onNote })
  }
  if (concl === 'warning') {
    actions.push({ label: '标记豁免', onClick: handlers.onExempt })
  }
  actions.push({ label: '查看原始回执', onClick: handlers.onReceipt })
  if (concl === 'warning') {
    actions.push({ label: '关联电核记录', onClick: handlers.onECLink })
  }
  return actions
}

function SingleCard({
  s,
  onReverify,
  onNote,
  onExempt,
  onReceipt,
  onECLink,
}: {
  s: SingleResult
  onReverify: (name: string) => void
  onNote: (name: string) => void
  onExempt: (name: string) => void
  onReceipt: (name: string) => void
  onECLink: (name: string) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const actions = getActionsForConclusion(s.conclusion, {
    onReverify: () => onReverify(s.name),
    onNote: () => onNote(s.name),
    onExempt: () => onExempt(s.name),
    onReceipt: () => onReceipt(s.name),
    onECLink: () => onECLink(s.name),
  })

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
            <SrcIcon name={s.icon} />
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold text-ink-900">{s.name}</span>
            <Badge kind={conclKind[s.conclusion]}>{conclText[s.conclusion]}</Badge>
            <RuleTooltip type={s.rulePromptType} />
          </div>
        </div>
        <ActionDropdown open={menuOpen} onToggle={() => setMenuOpen(!menuOpen)} actions={actions} />
      </div>

      <div className="mb-2 text-xs text-slate-400">
        {s.callStatus === 'success' ? '调用成功' : s.callStatus === 'fail' ? '调用失败' : '部分成功'}
        {' · '}{s.costMs}ms
      </div>

      <p className="mb-3 rounded-lg bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-600">
        {s.reason}
      </p>

      <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {s.items.map((it) => (
          <div key={it.label} className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{it.label}</span>
            <span className={cn('font-medium', statusCls[it.status])}>{it.value}</span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-2.5 text-[11px] leading-relaxed text-slate-400">
        核验流水：{s.verifyNo} | 核验时间：{s.verifyTime} | 客户已授权第三方数据查询 | 渠道：{s.channel}
      </div>
    </div>
  )
}

// ========================= 主页面 =========================

export default function FraudScheme1Detail() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  // 由列表跳转带来的参数还原该行的「自动判定 / 人工状态 / 操作人员 / 编号」，确保详情页与列表完全一致
  const sysParam = (params.get('sys') as FraudSysResult) ?? '处理中'
  const workParam = (params.get('work') as FraudWorkStatus) ?? '欺诈评估中'
  const opParam = params.get('op') ?? '--'
  const sampleId = params.get('id') ?? undefined
  // 报告内容按自动判定结果选套餐：确认欺诈→红 / 可疑→黄 / 无风险·处理中→绿
  const variantId = sysParam === '确认欺诈' ? 'FRAUD' : sysParam === '可疑' ? 'SUSPECT' : 'PASS'
  const d = buildFraudScheme1Report(variantId)

  // 详情页第二卡片仅用 FraudRow 的「自动判定 / 人工状态 / 审核人 / 编号」驱动操作按钮
  const [fraudRow, setFraudRow] = useState<FraudRow>(() => ({
    id: sampleId ?? d.appId,
    name: d.name,
    product: '—',
    channel: '—',
    amount: 0,
    fraudScore: 0,
    creditScore: 0,
    sysResult: sysParam,
    workStatus: workParam,
    operator: opParam,
    auditTime: '—',
  }))
  const applyFraud = (next: Partial<FraudRow>) => setFraudRow((r) => ({ ...r, ...next }))
  const { flash } = useModule()

  type ModalType = 'note' | 'receipt' | 'exempt' | 'weights' | null
  const [modal, setModal] = useState<{ type: ModalType; target: string }>({ type: null, target: '' })

  const [logs, setLogs] = useState<OpLog[]>(d.opLogs)

  const addLog = (entry: Omit<OpLog, 'id'>) => {
    setLogs((prev) => [{ ...entry, id: `log${Date.now()}` }, ...prev])
  }

  const navCards: { id: string; label: string; tone: 'ok' | 'alert' | 'normal' }[] = [
    { id: 'score', label: '欺诈评分', tone: d.cross.overallRisk === 'high' ? 'alert' : 'ok' },
    { id: 'basic', label: '用户基本信息', tone: d.basic.some((f) => !f.valid) ? 'alert' : 'ok' },
    { id: 'photos', label: '用户证件照', tone: 'ok' },
    { id: 'single', label: '多源反欺诈单项报告', tone: d.single.some((s) => s.conclusion !== 'pass') ? 'alert' : 'ok' },
    { id: 'cross', label: '数据交叉融合综合报告', tone: d.cross.finalConclusion === 'reject' || d.cross.finalConclusion === 'warning' ? 'alert' : 'ok' },
    { id: 'merged-ops', label: '全量操作日志', tone: 'normal' },
    { id: 'report-actions', label: '整体操作', tone: 'normal' },
  ]

  return (
    <div className="space-y-6">
      <DetailHeader
        title="欺诈识别报告"
        subtitle={`进件号 ${d.appId} · 申请人 ${d.name} · ${d.idNo}`}
        backLabel="返回欺诈识别"
        onBack={() => nav('/console/cr/fraud-s1')}
      />

      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          {/* 反欺诈评分模型卡（结论级，领衔整份报告） */}
          <FraudScoreModelCard cross={d.cross} />

          {/* 结论与终审操作（与列表一致：系统结果 / 工单状态 / 操作人员 + 操作按钮） */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <FraudActionBar row={fraudRow} onApply={applyFraud} flash={flash} showView={false} />
            <div className="mt-4 border-t border-slate-100 pt-3">
              <div className="mb-2 text-[11px] font-medium text-slate-400">欺诈核查过程</div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                {d.threads.map((t, i) => {
                  const tone = (t.conclusion ?? 'pass') as Conclusion
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

          {/* 一、用户基本信息 */}
          <Panel title="一、用户基本信息" id="basic">
            <div className="grid grid-cols-1 gap-x-8 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {d.basic.map((f) => (
                <div key={f.key} className="flex items-center justify-between rounded-lg border border-slate-100 px-3.5 py-2.5">
                  <span className="text-sm text-slate-500">{f.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-medium text-ink-900">{f.value}</span>
                    {f.valid ? (
                      <span className="text-[10px] font-normal text-slate-300">✓</span>
                    ) : (
                      <Badge kind="red">格式异常</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="mb-2 text-xs font-medium text-slate-500">环境采集</div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {d.env.map((e) => (
                  <div key={e.key} className="flex items-center justify-between rounded-lg bg-slate-50 px-3.5 py-2">
                    <span className="text-sm text-slate-500">{e.label}</span>
                    <span className="text-sm font-medium text-ink-900">{e.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* 二、用户证件照 */}
          <Panel title="二、用户证件照" id="photos">
            <div className="grid gap-4 md:grid-cols-2">
              {d.images.map((img) => (
                <div key={img.key} className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-ink-900">{img.label}</span>
                    {img.kind === 'video' && <Badge kind="blue">视频</Badge>}
                  </div>
                  <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-lg bg-slate-900">
                    {img.kind === 'video' ? (
                      <video controls poster={img.url} src="/sample/live.mp4" className="h-full w-full object-contain" />
                    ) : (
                      <img
                        src={img.url}
                        alt={img.label}
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          const el = e.currentTarget
                          el.style.display = 'none'
                          const p = el.parentElement
                          if (p && !p.querySelector('.ph')) {
                            const s = document.createElement('span')
                            s.className = 'ph text-xs text-slate-400'
                            s.textContent = '图片占位'
                            p.appendChild(s)
                          }
                        }}
                      />
                    )}
                  </div>
                  <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
                    <span className="font-medium text-slate-500">OCR 识别：</span>
                    {img.ocr}
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 三、多源反欺诈单项报告 */}
          <Panel title="三、多源反欺诈单项报告" id="single">
            <div className="grid gap-4 lg:grid-cols-2">
              {d.single.map((s) => (
                <SingleCard
                  key={s.source}
                  s={s}
                  onReverify={(name) => addLog({ target: name, actionType: '重新核验', operator: '当前用户', time: new Date().toLocaleString('zh-CN'), remark: `二次核验流水号：FR${Date.now()}` })}
                  onNote={(name) => setModal({ type: 'note', target: name })}
                  onExempt={(name) => setModal({ type: 'exempt', target: name })}
                  onReceipt={(name) => {
                    setModal({ type: 'receipt', target: name })
                    addLog({ target: name, actionType: '查看回执', operator: '当前用户', time: new Date().toLocaleString('zh-CN'), remark: '查看第三方接口原始回执流水' })
                  }}
                  onECLink={(name) => addLog({ target: name, actionType: '关联电核', operator: '当前用户', time: new Date().toLocaleString('zh-CN'), remark: `关联电核台账编号 EC${Date.now().toString(36).toUpperCase()}` })}
                />
              ))}
            </div>
          </Panel>

          {/* 五、数据交叉融合综合报告 · 5项 */}
          <Panel
            title="五、数据交叉融合综合报告 · 5项"
            id="cross"
            actions={<Button variant="ghost" size="sm" onClick={() => setModal({ type: 'weights', target: '' })}>查看打分权重明细</Button>}
          >
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
              {d.cross.atomic.map((a) => (
                <AtomicCard key={a.key} a={a} conflicts={d.cross.conflicts} />
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
              <div className="flex flex-wrap items-center gap-4">
                <Badge kind={conclKind[d.cross.finalConclusion]} className="px-3 py-1 text-sm font-semibold">
                  {conclText[d.cross.finalConclusion]}
                </Badge>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">综合风险</span>
                  <RiskLevelBadge level={d.cross.overallRisk} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">欺诈评分</span>
                  <span className="text-xl font-bold text-rose-600">
                    {d.cross.riskScore}<span className="text-xs font-normal text-slate-300">/{d.cross.scoreCap}</span>
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {d.cross.riskTags.map((tg) => {
                    const targetConflict = d.cross.conflicts.find((c) =>
                      c.relatedAtomicKeys.some((ak) => {
                        const atom = d.cross.atomic.find((a) => a.key === ak)
                        return atom && atom.status !== 'ok' && tg.label.includes(
                          tg.kind === 'red' ? '团伙' : tg.kind === 'amber' ? (atom.label.includes('设备') ? '设备' : '关联') : ''
                        )
                      })
                    )
                    const scrollId = targetConflict ? `conflict-${targetConflict.id}` : undefined
                    return (
                      <button
                        key={tg.label}
                        type="button"
                        className={cn(
                          'cursor-pointer rounded-full px-2.5 py-0.5 text-xs font-medium transition hover:ring-2 hover:ring-offset-1',
                          tg.kind === 'red' ? 'bg-rose-100 text-rose-700 hover:ring-rose-300' :
                          tg.kind === 'amber' ? 'bg-amber-100 text-amber-700 hover:ring-amber-300' :
                          'bg-sky-100 text-sky-700 hover:ring-sky-300'
                        )}
                        onClick={() => { if (scrollId) { const el = document.getElementById(scrollId); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' }) } }}
                        title={scrollId ? '点击定位到疑点详情' : undefined}
                      >
                        {tg.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-3 text-xs leading-relaxed text-slate-500">
                {d.cross.ruleBasis}
              </p>

              <p className="mt-3 text-sm text-slate-700">{d.cross.finalReason}</p>

              <div className="mt-3 border-t border-slate-100 pt-2.5 text-[11px] leading-relaxed text-slate-400">
                交叉计算时间：{d.cross.auditTime} | 规则版本：{d.cross.ruleVersion} | 综合报告ID：{d.cross.reportId}
              </div>
            </div>

            <div className="mt-5">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-semibold text-ink-900">多源风险交叉疑点明细</span>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">{d.cross.conflicts.length} 项</span>
              </div>
              <div className="space-y-3">
                {d.cross.conflicts.map((c) => (
                  <ConflictCard
                    key={c.id}
                    c={c}
                    onExempt={() => setModal({ type: 'exempt', target: c.desc.slice(0, 20) + '...' })}
                    onNote={() => setModal({ type: 'note', target: c.desc.slice(0, 20) + '...' })}
                  />
                ))}
              </div>
            </div>
          </Panel>

          {/* 六、单项核验全量操作日志 */}
          <Panel title="六、单项核验全量操作日志" id="merged-ops">
            <MergedOpTable itemActions={d.itemActions} opLogs={logs} />
          </Panel>

          {/* 返回顶部 */}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="返回顶部"
            className="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
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
                  onClick={() => {
                    const el = document.getElementById(c.id)
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
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

      <NoteModal
        open={modal.type === 'note'}
        target={modal.target}
        onClose={() => setModal({ type: null, target: '' })}
        onSubmit={(text) => addLog({ target: modal.target, actionType: '录入备注', operator: '当前用户', time: new Date().toLocaleString('zh-CN'), remark: text })}
      />
      <ReceiptModal
        open={modal.type === 'receipt'}
        target={modal.target}
        onClose={() => setModal({ type: null, target: '' })}
      />
      <ExemptModal
        open={modal.type === 'exempt'}
        target={modal.target}
        onClose={() => setModal({ type: null, target: '' })}
        onSubmit={(reason, reviewer) => addLog({ target: modal.target, actionType: '标记豁免', operator: '当前用户', time: new Date().toLocaleString('zh-CN'), remark: reason, reviewStatus: '已复核', reviewer, reviewTime: new Date().toLocaleString('zh-CN') })}
      />
      <WeightsModal
        open={modal.type === 'weights'}
        onClose={() => setModal({ type: null, target: '' })}
        score={d.cross.riskScore}
        scoreCap={d.cross.scoreCap}
        ruleVersion={d.cross.ruleVersion}
        components={d.cross.scoreComponents}
      />
    </div>
  )
}

// ========================= 子组件 =========================

function MergedOpTable({ itemActions, opLogs }: { itemActions: any[]; opLogs: OpLog[] }) {
  interface MergedRow {
    id: string; target: string; action: string; badgeKind: 'red' | 'amber' | 'blue' | 'gray' | 'green'
    operator: string; time: string; before: string; after: string; remark: string; attachments?: string[]
    reviewStatus?: string; reviewer?: string; reviewTime?: string
  }
  const opBadge: Record<string, 'red' | 'amber' | 'blue' | 'gray' | 'green'> = {
    '重新核验': 'blue', '录入备注': 'blue', '标记豁免': 'amber', '查看回执': 'gray', '关联电核': 'blue',
  }
  const actKind: Record<string, 'red' | 'amber' | 'blue' | 'gray'> = {
    reject: 'red', pass: 'blue', warning: 'amber', neutral: 'gray',
  }
  const merged: MergedRow[] = [
    ...itemActions.map((a) => ({
      id: a.id, target: a.target, action: a.action,
      badgeKind: actKind[a.actionKind] ?? 'gray' as const,
      operator: a.operator, time: a.time,
      before: a.before, after: a.after,
      remark: a.reason,
    })),
    ...opLogs.map((l) => ({
      id: l.id, target: l.target, action: l.actionType,
      badgeKind: opBadge[l.actionType] ?? 'gray' as const,
      operator: l.operator, time: l.time,
      before: '-', after: '-',
      remark: l.remark,
      attachments: l.attachments,
      reviewStatus: l.reviewStatus, reviewer: l.reviewer, reviewTime: l.reviewTime,
    })),
  ].sort((a, b) => a.time.localeCompare(b.time))

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
      <table className="w-full min-w-[860px] text-sm">
        <thead>
          <tr className="sticky top-0 z-30 border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
            <th className="px-3 py-3 font-medium">操作对象（数据源）</th>
            <th className="px-3 py-3 font-medium">操作类型</th>
            <th className="px-3 py-3 font-medium">操作标签</th>
            <th className="px-3 py-3 font-medium">操作人</th>
            <th className="px-3 py-3 font-medium">操作时间</th>
            <th className="px-3 py-3 font-medium">变更前判定</th>
            <th className="px-3 py-3 font-medium">变更后判定</th>
            <th className="px-3 py-3 font-medium">操作原因 / 备注 &amp; 附件</th>
            <th className="px-3 py-3 font-medium">复核状态</th>
          </tr>
        </thead>
        <tbody>
          {merged.length === 0 ? (
            <tr>
              <td colSpan={9} className="px-3 py-8 text-center text-xs text-slate-400">暂无操作记录</td>
            </tr>
          ) : (
            merged.map((r) => (
              <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 align-top">
                <td className="px-3 py-3 text-xs font-medium text-slate-700">{r.target}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{r.action}</td>
                <td className="px-3 py-3"><Badge kind={r.badgeKind === 'green' ? 'green' : r.badgeKind as any}>{r.badgeKind === 'red' ? '拒绝' : r.badgeKind === 'blue' ? '操作' : r.badgeKind === 'amber' ? '豁免' : r.badgeKind === 'green' ? '放行' : '操作'}</Badge></td>
                <td className="px-3 py-3 text-xs text-slate-500">{r.operator}</td>
                <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap">{r.time}</td>
                <td className="px-3 py-3 text-xs text-slate-400">{r.before}</td>
                <td className="px-3 py-3 text-xs text-slate-700">{r.after}</td>
                <td className="px-3 py-3 max-w-[200px] text-xs text-slate-600">
                  <div className="leading-relaxed">{r.remark}</div>
                  {r.attachments && r.attachments.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {r.attachments.map((a, i) => (
                        <span key={i} className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">📎 {a}</span>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-3 py-3 text-xs">
                  {r.reviewStatus ? (
                    r.reviewStatus === '已复核' ? (
                      <div>
                        <Badge kind="green">已复核</Badge>
                        <div className="mt-0.5 text-[11px] text-slate-400">{r.reviewer} · {r.reviewTime}</div>
                      </div>
                    ) : (
                      <Badge kind="amber">待复核</Badge>
                    )
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// ========================= 反欺诈评分模型卡（顶部结论级，0-1000 刻度） =========================
function FraudScoreModelCard({ cross }: { cross: CrossCheck }) {
  const { riskScore, scoreCap, overallRisk, scoreComponents, ruleVersion, ruleBasis, auditTime, reportId } = cross
  // 阈值分段：0–400 低(绿) / 400–700 中(黄) / 700–1000 高(红)
  const scorePct = Math.min(100, Math.max(0, (riskScore / scoreCap) * 100))
  const bandColor = overallRisk === 'high' ? 'text-rose-600' : overallRisk === 'medium' ? 'text-amber-600' : 'text-emerald-600'
  const levelCls: Record<RiskLevel, string> = {
    high: 'bg-rose-100 text-rose-700',
    medium: 'bg-amber-100 text-amber-700',
    low: 'bg-emerald-100 text-emerald-700',
  }
  const compTotal = scoreComponents.reduce((s, c) => s + c.score, 0)
  const jump = (id?: string) => {
    if (!id) return
    const el = document.getElementById(`conflict-${id}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }

  return (
    <div id="score" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-md bg-slate-800 px-2 text-[11px] font-medium text-white">欺诈评分</span>
          <span className="text-sm font-semibold text-ink-900">反欺诈综合评分模型</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">规则版本 {ruleVersion}</span>
        </div>
        <span className="text-[11px] text-slate-400">分值越大风险越高 · 满分 {scoreCap}</span>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex items-end gap-3">
          <div className="flex items-baseline">
            <span className={cn('text-5xl font-bold leading-none', bandColor)}>{riskScore}</span>
            <span className="ml-1 text-sm font-normal text-slate-300">/ {scoreCap}</span>
          </div>
          <div className="mb-1">
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', levelCls[overallRisk])}>
              {riskText[overallRisk]}风险
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="relative h-2.5 w-full overflow-visible rounded-full">
            <div className="absolute inset-0 flex overflow-hidden rounded-full">
              <div className="h-full bg-emerald-400" style={{ width: '40%' }} />
              <div className="h-full bg-amber-400" style={{ width: '30%' }} />
              <div className="h-full bg-rose-400" style={{ width: '30%' }} />
            </div>
            <div
              className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${scorePct}%` }}
            >
              <div className="h-4 w-4 rounded-full border-2 border-white bg-slate-800 shadow" />
            </div>
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
            <span>0 · 低风险</span>
            <span>400</span>
            <span>700</span>
            <span>1000 · 高风险</span>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-400">
              <th className="px-3 py-2 font-medium">风险维度</th>
              <th className="px-3 py-2 font-medium">用户情况</th>
              <th className="px-3 py-2 text-right font-medium">得分</th>
              <th className="px-3 py-2 text-right font-medium">权重</th>
              <th className="px-3 py-2 text-center font-medium">等级</th>
            </tr>
          </thead>
          <tbody>
            {scoreComponents.map((c) => (
              <tr
                key={c.name}
                className={cn(
                  'border-t border-slate-100 align-top transition',
                  c.traceTo ? 'cursor-pointer hover:bg-slate-50' : '',
                  c.core ? 'bg-rose-50/40' : '',
                )}
                onClick={() => jump(c.traceTo)}
                title={c.traceTo ? '点击定位到对应疑点详情' : undefined}
              >
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-ink-900">{c.name}</span>
                    {c.core && (
                      <span className="rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-medium text-rose-700">核心因子</span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-2.5 text-slate-500">{c.situation}</td>
                <td className={cn('px-3 py-2.5 text-right font-semibold', c.level === 'high' ? 'text-rose-600' : c.level === 'medium' ? 'text-amber-600' : 'text-emerald-600')}>
                  +{c.score}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-400">{c.weight}</td>
                <td className="px-3 py-2.5 text-center">
                  <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', levelCls[c.level])}>{riskText[c.level]}</span>
                </td>
              </tr>
            ))}
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="px-3 py-2.5 font-semibold text-ink-900" colSpan={2}>欺诈评分（各风险项累加）</td>
              <td className={cn('px-3 py-2.5 text-right text-sm font-bold', bandColor)}>{compTotal}</td>
              <td className="px-3 py-2.5" colSpan={2} />
            </tr>
          </tbody>
        </table>
      </div>

      <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500">{ruleBasis}</p>
      <div className="mt-2 border-t border-slate-100 pt-2 text-[11px] leading-relaxed text-slate-400">
        计算时间：{auditTime} | 规则版本：{ruleVersion} | 综合报告ID：{reportId}
      </div>
    </div>
  )
}

function RiskLevelBadge({ level, noTooltip }: { level: RiskLevel; noTooltip?: boolean }) {
  const label = riskText[level]
  const color = riskKind[level]
  const tooltip = level === 'high'
    ? '单条命中直接拉高欺诈评分，多条叠加系统自动确认欺诈'
    : level === 'medium'
      ? '单独存在仅人工复核，叠加高风险则升级拦截'
      : '风险较低，纳入常规监控'
  return (
    <span className="group relative cursor-help">
      <Badge kind={color}>{label}</Badge>
      {!noTooltip && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-3 text-[11px] leading-relaxed text-white opacity-0 transition group-hover:opacity-100">
          {tooltip}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  )
}

function ConflictCard({
  c,
  onExempt,
  onNote,
}: {
  c: VerifyConflict
  onExempt: () => void
  onNote: () => void
}) {
  const [collapsed, setCollapsed] = useState(false)
  const isHigh = c.level === 'high'
  return (
    <div
      id={`conflict-${c.id}`}
      className={cn(
        'scroll-mt-24 rounded-xl border p-4 transition',
        c.isCoreFactor && isHigh
          ? 'border-rose-300 bg-rose-50/60 shadow-[0_0_0_1px_rgba(244,63,94,0.15)]'
          : isHigh
            ? 'border-rose-200 bg-rose-50/30'
            : c.level === 'medium'
              ? 'border-amber-200 bg-amber-50/30'
              : 'border-slate-200 bg-white'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {c.isCoreFactor && isHigh && (
            <span className="rounded bg-rose-500 px-2 py-0.5 text-[10px] font-semibold text-white">核心拒贷因子</span>
          )}
          <RiskLevelBadge level={c.level} />
          <span className={cn('text-sm font-medium', isHigh ? 'text-rose-800' : 'text-ink-900')}>{c.desc}</span>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="shrink-0 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          title={collapsed ? '展开' : '收起'}
        >
          <svg viewBox="0 0 24 24" className={cn('h-4 w-4 transition', collapsed ? '' : 'rotate-180')} fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 15l6-6 6 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      {!collapsed && (
        <>
          <div className="mt-3 flex flex-wrap gap-3 text-xs">
            {c.items.map((it, idx) => (
              <div key={idx} className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm">
                <span className="font-medium text-slate-500">{it.side}</span>
                <span className="mx-1 text-slate-300">|</span>
                <span className={cn('font-semibold', it.tone === 'fail' ? 'text-rose-700' : it.tone === 'warn' ? 'text-amber-600' : 'text-emerald-600')}>{it.value}</span>
              </div>
            ))}
          </div>

          <div className="mt-2 text-xs text-slate-500">
            <span className="font-medium text-slate-400">处理逻辑：</span>
            <span className="text-slate-600">{c.resolution}</span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-slate-200/60 pt-3">
            <Button variant="ghost" size="sm" onClick={onExempt}>本条风险豁免</Button>
            <Button variant="ghost" size="sm" onClick={onNote}>录入核实备注</Button>
            <Button variant="ghost" size="sm">上传佐证材料</Button>
          </div>
        </>
      )}
    </div>
  )
}

function AtomicCard({ a, conflicts }: { a: AtomicResult; conflicts: VerifyConflict[] }) {
  const bgCls = a.status === 'fail' ? 'bg-rose-50 border-rose-200' : a.status === 'warn' ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50/50 border-emerald-200'
  const textCls = statusCls[a.status]
  const hasConflict = a.conflictIds.length > 0
  const linkedConflict = hasConflict ? conflicts.find((c) => c.id === a.conflictIds[0]) : undefined
  const level: RiskLevel = a.status === 'fail' ? 'high' : a.status === 'warn' ? 'medium' : 'low'
  const riskTooltip = level === 'high'
    ? '单条命中直接拉高欺诈评分，多条叠加系统自动确认欺诈'
    : level === 'medium'
      ? '单独存在仅人工复核，叠加高风险则升级拦截'
      : ''
  const mergedTooltip = a.tooltip ? (riskTooltip ? `${a.tooltip}\n━━━━━━━━━━━━━━\n${riskTooltip}` : a.tooltip) : riskTooltip

  const handleClick = () => {
    if (linkedConflict) {
      const el = document.getElementById(`conflict-${linkedConflict.id}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!hasConflict}
      className={cn(
        'group relative rounded-xl border p-3 text-left transition',
        bgCls,
        hasConflict ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="text-xs text-slate-400">{a.label}</div>
        {a.status === 'ok' ? (
          <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600">正常</span>
        ) : (
          <RiskLevelBadge level={level} noTooltip />
        )}
      </div>
      <div className={cn('mt-1 text-base font-bold', textCls)}>{a.value}</div>
      {mergedTooltip && (
        <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-800 px-3 py-3 text-[11px] leading-relaxed text-white opacity-0 transition group-hover:opacity-100" style={{ minWidth: '240px', whiteSpace: 'normal' }}>
          {mergedTooltip.split('\n').map((line, i) => (
            <span key={i}>{line}<br /></span>
          ))}
          <span className="absolute left-1/2 top-full -translate-x-1/2 border-[5px] border-transparent border-t-slate-800" />
        </span>
      )}
      {hasConflict && (
        <div className="mt-1.5 text-[10px] text-slate-400">
          关联疑点 → 点击跳转
        </div>
      )}
    </button>
  )
}
