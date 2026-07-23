// 欺诈识别（方案4 · 完整版）· 状态/操作矩阵与操作弹窗
// 采用方案4 文档定义的独立欺诈处置状态机（非复用信息核验 VerifyOps）：
//   人工处置状态：核验计算中 / 待确认 / 已确认 / 初审确认拒贷办结 / 强制放行办结 / 加入黑名单 /
//                 待审核 / 已提交双人复核 / 双人复核-放行办结 / 双人复核-拒绝办结
//   行内操作：查看 / 报告确认 / 强制复审 / 加入黑名单 / 提交双人复核 / 录入备注 / 确认放行 / 确认拒绝
// 交互逻辑（弹窗 / 状态流转 / 日志追加）与信息核验体系 1:1 对齐。
import { useEffect, useState } from 'react'
import { Badge, Button, Modal, DecisionTag, StatusTag } from '../components/ui'
import type { FraudS4WorkStatus, FraudS4AutoDecision, FraudS4ScoreBand, FraudS4RuleType } from './fraudScheme4Report'

export type FraudScheme4SysResult = FraudS4ScoreBand // 欺诈风险等级（系统判定）
export type FraudScheme4WorkStatus = FraudS4WorkStatus // 人工处置状态（方案4 独立状态机）
export interface FraudScheme4Row {
  id: string
  name: string
  product: string
  amount: number
  fraudScore: number
  scoreBand: FraudS4ScoreBand
  hitRuleCount: number
  ruleTypes: FraudS4RuleType[]
  autoDecision: FraudS4AutoDecision
  workStatus: FraudS4WorkStatus
  operator: string
  gangTag: string
}

export type FraudScheme4OpKey =
  | 'view'
  | 'reportConfirm'
  | 'forceReview'
  | 'addBlacklist'
  | 'submitReview'
  | 'note'
  | 'confirmPass'
  | 'confirmReject'

export const FRAUD_S4_OP_LABEL: Record<FraudScheme4OpKey, string> = {
  view: '查看',
  reportConfirm: '报告确认',
  forceReview: '强制复审',
  addBlacklist: '加入黑名单',
  submitReview: '提交双人复核',
  note: '录入备注',
  confirmPass: '确认放行',
  confirmReject: '确认拒绝',
}

/** 列表/详情行按（欺诈风险等级 + 人工处置状态）推导可执行按钮（对齐 N8 矩阵） */
export function fraudScheme4OpsFor(work: FraudScheme4WorkStatus, band?: FraudS4ScoreBand): FraudScheme4OpKey[] {
  const isHigh = band === '高' || band === '极高'
  switch (work) {
    case '核验计算中': // 自动结果未出，仅可查看（置灰，见 viewLocked）
      return ['view']
    case '待确认': // 低/极低风险→查看/报告确认；高/极高风险→查看/报告确认/加入黑名单
      return isHigh ? ['view', 'reportConfirm', 'addBlacklist'] : ['view', 'reportConfirm']
    case '已确认': // 仅查看
      return ['view']
    case '初审确认拒贷办结':
    case '强制放行办结':
    case '加入黑名单': // 办结态，仅查看
      return ['view']
    case '待审核': // 中风险预警：查看/提交双人复核/录入备注
      return ['view', 'submitReview', 'note']
    case '已提交双人复核': // 中风险：查看/确认放行/确认拒绝/录入备注
      return ['view', 'confirmPass', 'confirmReject', 'note']
    case '双人复核-放行办结':
    case '双人复核-拒绝办结': // 办结态，仅查看
      return ['view']
  }
}

export function fraudScheme4ViewLocked(work: FraudS4WorkStatus): boolean {
  return work === '核验计算中'
}

const WORK_KIND: Record<FraudS4WorkStatus, 'red' | 'amber' | 'green' | 'blue' | 'gray'> = {
  核验计算中: 'gray', 待确认: 'amber', 已确认: 'green',
  初审确认拒贷办结: 'gray', 强制放行办结: 'gray', 加入黑名单: 'red',
  待审核: 'amber', 已提交双人复核: 'blue', '双人复核-放行办结': 'gray', '双人复核-拒绝办结': 'gray',
}
const BAND_KIND: Record<FraudS4ScoreBand, 'green' | 'amber' | 'orange' | 'red'> = {
  极低: 'green', 低: 'green', 中: 'amber', 高: 'orange', 极高: 'red',
}
const AUTO_KIND: Record<FraudS4AutoDecision, 'green' | 'red' | 'amber' | 'gray'> = {
  通过: 'green', 拒绝: 'red', 预警: 'amber', 处理中: 'gray',
}

export function FraudScheme4BandBadge({ value }: { value: FraudS4ScoreBand }) {
  return <Badge kind={BAND_KIND[value]}>{value}</Badge>
}
export function FraudScheme4AutoBadge({ value }: { value: FraudS4AutoDecision }) {
  const kind = AUTO_KIND[value]
  return <Badge kind={kind}>{value}</Badge>
}
export function FraudScheme4WorkBadge({ value }: { value: FraudS4WorkStatus }) {
  return <Badge kind={WORK_KIND[value]}>{value}</Badge>
}

/* ===================== 列表页三列标签（三套不同视觉体系，便于区分） ===================== */
// 欺诈风险等级 → 浅底描边胶囊（Badge，柔和）
// 自动审核   → 实色填充胶囊（DecisionTag，醒目）
// 人工审核   → 描边 + 前置圆点（StatusTag，沉稳）
export function FraudScheme4BandTag({ value }: { value: FraudS4ScoreBand }) {
  return <Badge kind={BAND_KIND[value]}>{value}</Badge>
}
export function FraudScheme4AutoTag({ value }: { value: FraudS4AutoDecision }) {
  return <DecisionTag kind={AUTO_KIND[value]}>{value}</DecisionTag>
}
export function FraudScheme4WorkTag({ value }: { value: FraudS4WorkStatus }) {
  return <StatusTag kind={WORK_KIND[value]}>{value}</StatusTag>
}

/* ===================== 处置弹窗 ===================== */
function GenericConfirmModal({ title, open, onClose, onConfirm }: { title: string; open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" onClick={onConfirm}>确认</Button></>}>
      <p className="text-sm text-slate-600">确认执行「{title}」操作？该操作将记录至操作日志。</p>
    </Modal>
  )
}

function AddBlacklistModal({ row, open, onClose, onConfirm }: { row: FraudScheme4Row; open: boolean; onClose: () => void; onConfirm: (payload: { phone: string; device: string; idNo: string; reason: string }) => void }) {
  const [phone, setPhone] = useState('')
  const [device, setDevice] = useState('')
  const [idNo, setIdNo] = useState('')
  const [reason, setReason] = useState('')
  useEffect(() => { if (open) { setPhone(''); setDevice(''); setIdNo(''); setReason('') } }, [open])
  const valid = phone.trim() || device.trim() || idNo.trim()
  return (
    <Modal open={open} onClose={onClose} title={`加入黑名单 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" disabled={!valid} onClick={() => onConfirm({ phone, device, idNo, reason })}>确认加入</Button></>}>
      <div className="space-y-3 text-sm">
        <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">将该用户加入黑名单库后，后续申请将被自动拦截。请选择要加入的维度（至少一项）。</p>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="手机号（如 138****1234）" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        <input value={device} onChange={(e) => setDevice(e.target.value)} placeholder="设备指纹（如 DV-9F2A-77C1）" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        <input value={idNo} onChange={(e) => setIdNo(e.target.value)} placeholder="身份证号（脱敏）" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="加入黑名单原因（可选）" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
      </div>
    </Modal>
  )
}

function SubmitReviewModal({ row, open, onClose, onSubmit }: { row: FraudScheme4Row; open: boolean; onClose: () => void; onSubmit: (note: string) => void }) {
  const [note, setNote] = useState('')
  useEffect(() => { if (open) setNote('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`提交复核 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" disabled={!note.trim()} onClick={() => onSubmit(note)}>提交推送</Button></>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">推送复核的理由、需上级/专家重点核查的风险点</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="请填写需重点核查的风险点与说明…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <p className="text-xs text-slate-400">提交后工单流转至复核人员，初审账号无法再编辑数据。</p>
      </div>
    </Modal>
  )
}

function NoteModal({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (text: string) => void }) {
  const [text, setText] = useState('')
  useEffect(() => { if (open) setText('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title="录入备注"
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" disabled={!text.trim()} onClick={() => { onSubmit(text); setText('') }}>提交</Button></>}>
      <div className="space-y-3 text-sm">
        <p className="text-xs text-slate-400">录入人工复核的备注说明，保存至操作日志。</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4} placeholder="请输入备注内容…"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
      </div>
    </Modal>
  )
}

/* ===================== 操作逻辑（列表行 / 详情栏共用） ===================== */
interface S4LogEntry { type: string; content: string; operator: string; time: string; result?: string; remark?: string }
function fraudScheme4UseActions(
  row: FraudScheme4Row,
  onApply: (next: Partial<FraudScheme4Row>) => void,
  onLog?: (e: S4LogEntry) => void,
  onView?: () => void,
  flash?: (m: string) => void,
) {
  const [modal, setModal] = useState<FraudScheme4OpKey | null>(null)
  const ops = fraudScheme4OpsFor(row.workStatus, row.scoreBand)
  const now = () => new Date().toLocaleString('zh-CN')

  const open = (op: FraudScheme4OpKey) => {
    if (op === 'view') { onView?.(); return }
    setModal(op)
  }
  const close = () => setModal(null)

  const applyReportConfirm = () => {
    onApply({ workStatus: '已确认', operator: '风控专员-张磊' })
    onLog?.({ type: '报告确认', content: '确认欺诈识别报告无误', operator: '风控专员-张磊', time: now(), remark: '报告已确认' })
    flash?.('已报告确认')
    close()
  }
  const applyForceReview = () => {
    onLog?.({ type: '强制复审', content: '发起强制复审（高/极高风险）', operator: '风控专员-张磊', time: now(), remark: '强制复审' })
    flash?.('已发起强制复审')
    close()
  }
  const applyAddBlacklist = (payload: { phone: string; device: string; idNo: string; reason: string }) => {
    const parts = [payload.phone && `手机号 ${payload.phone}`, payload.device && `设备 ${payload.device}`, payload.idNo && `身份证 ${payload.idNo}`].filter(Boolean).join('、')
    onLog?.({ type: '加入黑名单', content: `将 ${parts} 加入黑名单库`, operator: '风控专员-张磊', time: now(), remark: payload.reason || '后续申请自动拦截' })
    flash?.('已加入黑名单库，后续申请自动拦截')
    close()
  }
  const applySubmitReview = (note: string) => {
    onApply({ workStatus: '已提交双人复核', operator: '初审：审核员 1' })
    onLog?.({ type: '提交双人复核', content: '提交双人复核', operator: '初审：审核员 1', time: now(), remark: note })
    flash?.('已提交双人复核')
    close()
  }
  const applyNote = (text: string) => {
    onLog?.({ type: '录入备注', content: '录入人工复核备注', operator: '风控专员-张磊', time: now(), remark: text })
    flash?.('已录入备注')
    close()
  }
  const applyConfirmPass = () => {
    onApply({ workStatus: '双人复核-放行办结', operator: '初审：审核员 1；终审：主管 1' })
    onLog?.({ type: '确认放行', content: '双人复核确认放行', operator: '初审：审核员 1；终审：主管 1', time: now() })
    flash?.('已确认放行')
    close()
  }
  const applyConfirmReject = () => {
    onApply({ workStatus: '双人复核-拒绝办结', operator: '初审：审核员 1；终审：主管 1' })
    onLog?.({ type: '确认拒绝', content: '双人复核确认拒绝', operator: '初审：审核员 1；终审：主管 1', time: now() })
    flash?.('已确认拒绝')
    close()
  }

  const renderModals = (
    <>
      <AddBlacklistModal row={row} open={modal === 'addBlacklist'} onClose={close} onConfirm={applyAddBlacklist} />
      <SubmitReviewModal row={row} open={modal === 'submitReview'} onClose={close} onSubmit={applySubmitReview} />
      <NoteModal open={modal === 'note'} onClose={close} onSubmit={applyNote} />
      <GenericConfirmModal title={FRAUD_S4_OP_LABEL['reportConfirm']} open={modal === 'reportConfirm'} onClose={close} onConfirm={applyReportConfirm} />
      <GenericConfirmModal title={FRAUD_S4_OP_LABEL['forceReview']} open={modal === 'forceReview'} onClose={close} onConfirm={applyForceReview} />
      <GenericConfirmModal title={FRAUD_S4_OP_LABEL['confirmPass']} open={modal === 'confirmPass'} onClose={close} onConfirm={applyConfirmPass} />
      <GenericConfirmModal title={FRAUD_S4_OP_LABEL['confirmReject']} open={modal === 'confirmReject'} onClose={close} onConfirm={applyConfirmReject} />
    </>
  )

  return { ops, open, renderModals }
}

function opVariant(op: FraudScheme4OpKey): 'primary' | 'secondary' | 'ghost' {
  if (op === 'reportConfirm' || op === 'forceReview' || op === 'addBlacklist' || op === 'confirmPass' || op === 'confirmReject') return 'primary'
  if (op === 'note' || op === 'submitReview') return 'ghost'
  return 'secondary'
}

/** 列表行操作按钮 */
export function FraudScheme4RowActions({ row, onApply, onView, onLog, flash }: { row: FraudScheme4Row; onApply: (next: Partial<FraudScheme4Row>) => void; onView?: () => void; onLog?: (e: S4LogEntry) => void; flash?: (m: string) => void }) {
  const { ops, open, renderModals } = fraudScheme4UseActions(row, onApply, onLog, onView, flash)
  const locked = fraudScheme4ViewLocked(row.workStatus)
  return (
    <>
      <div className="flex flex-wrap items-center justify-start gap-3">
        {ops.map((op) => {
          const disabled = op === 'view' && locked
          return (
            <button key={op} type="button" disabled={disabled} onClick={() => open(op)}
              className={disabled ? 'cursor-not-allowed whitespace-nowrap text-xs font-medium text-slate-300' : 'whitespace-nowrap text-xs font-medium text-brand-600 hover:underline'}>
              {FRAUD_S4_OP_LABEL[op]}
            </button>
          )
        })}
      </div>
      {renderModals}
    </>
  )
}

/** 详情页处置操作栏（含风险等级 / 工单状态 / 操作人员 + 处置按钮） */
export function FraudScheme4ActionBar({ row, onApply, onView, onLog, flash, showView = true }: {
  row: FraudScheme4Row; onApply: (next: Partial<FraudScheme4Row>) => void; onView?: () => void; onLog?: (e: S4LogEntry) => void; flash?: (m: string) => void; showView?: boolean
}) {
  const base = fraudScheme4UseActions(row, onApply, onLog, onView, flash)
  const locked = fraudScheme4ViewLocked(row.workStatus)
  const ops = base.ops.slice()
  if (showView && !ops.includes('view') && !locked) ops.unshift('view')
  const { open, renderModals } = base
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">风险等级</span>
          <FraudScheme4BandBadge value={row.scoreBand} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">自动审核</span>
          <FraudScheme4AutoBadge value={row.autoDecision} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">处置状态</span>
          <FraudScheme4WorkBadge value={row.workStatus} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">处置人</span>
          <span className="text-sm text-slate-700">{row.operator}</span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {ops.map((op) => {
            if (op === 'view') {
              return <Button key={op} variant="secondary" onClick={() => open(op)}>{FRAUD_S4_OP_LABEL[op]}</Button>
            }
            return <Button key={op} variant={opVariant(op)} onClick={() => open(op)}>{FRAUD_S4_OP_LABEL[op]}</Button>
          })}
        </div>
      </div>
      {renderModals}
    </div>
  )
}
