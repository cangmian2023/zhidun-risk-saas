// 欺诈识别（方案4 · 完整版）· 状态/操作矩阵与操作弹窗
// 采用方案4 文档定义的独立欺诈处置状态机（非复用信息核验 VerifyOps）：
//   人工处置状态：待复核 / 复核中 / 已确认欺诈 / 误判放行 / 已归档
//   处置按钮：查看 / 确认欺诈 / 误判放行 / 加入黑名单 / 归档 / 提交复核 / 录入备注
// 交互逻辑（弹窗 / 状态流转 / 日志追加）与信息核验体系 1:1 对齐。
import { useEffect, useState } from 'react'
import { Badge, Button, Modal } from '../components/ui'
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
  | 'confirmFraud'
  | 'misjudgeRelease'
  | 'addBlacklist'
  | 'archive'
  | 'submitReview'
  | 'note'

export const FRAUD_S4_OP_LABEL: Record<FraudScheme4OpKey, string> = {
  view: '查看',
  confirmFraud: '确认欺诈',
  misjudgeRelease: '误判放行',
  addBlacklist: '加入黑名单',
  archive: '归档',
  submitReview: '提交复核',
  note: '录入备注',
}

/** 列表行按人工处置状态推导可执行按钮（对齐文档 1.5 操作按钮说明） */
export function fraudScheme4OpsFor(work: FraudScheme4WorkStatus): FraudScheme4OpKey[] {
  switch (work) {
    case '待复核':
      return ['view', 'confirmFraud', 'misjudgeRelease']
    case '复核中':
      return ['view', 'confirmFraud', 'misjudgeRelease']
    case '已确认欺诈':
      return ['view', 'addBlacklist', 'archive']
    case '误判放行':
      return ['view', 'archive']
    case '已归档':
      return ['view']
  }
}

export function fraudScheme4ViewLocked(_work: FraudS4WorkStatus): boolean {
  return false
}

const WORK_KIND: Record<FraudS4WorkStatus, 'red' | 'amber' | 'green' | 'violet' | 'gray'> = {
  待复核: 'red', 复核中: 'amber', 已确认欺诈: 'red', 误判放行: 'green', 已归档: 'gray',
}
const BAND_KIND: Record<FraudS4ScoreBand, 'green' | 'amber' | 'orange' | 'red'> = {
  极低: 'green', 低: 'green', 中: 'amber', 高: 'orange', 极高: 'red',
}
const AUTO_KIND: Record<FraudS4AutoDecision, 'green' | 'red' | 'amber' | 'blue'> = {
  通过: 'green', 拒绝: 'red', 转人工: 'amber', 观察: 'blue',
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

/* ===================== 附件上传（模拟） ===================== */
function AttachmentDrop({ required, label }: { required?: boolean; label: string }) {
  const [files, setFiles] = useState<string[]>([])
  return (
    <div>
      <p className="mb-2 text-xs text-slate-400">
        {label}
        {required ? <span className="ml-1 text-rose-500">*</span> : <span className="ml-1 text-slate-300">（选填）</span>}
      </p>
      <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-400 transition hover:border-brand-300 hover:bg-brand-50/40">
        <span className="text-lg">📎</span>
        <span>点击上传附件{required ? '（必填）' : ''}</span>
        <input
          type="file"
          multiple
          className="hidden"
          onChange={(e) => setFiles(Array.from(e.target.files ?? []).map((f) => f.name))}
        />
      </label>
      {files.length > 0 && (
        <ul className="mt-2 space-y-1 text-xs text-slate-500">
          {files.map((f, i) => (
            <li key={i} className="rounded bg-slate-100 px-2 py-1">✓ {f}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ===================== 处置弹窗 ===================== */
function ConfirmFraudModal({ row, open, onClose, onConfirm }: { row: FraudScheme4Row; open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  useEffect(() => { if (open) setReason('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`确认欺诈 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" disabled={!reason.trim()} onClick={() => onConfirm(reason)}>确认欺诈</Button></>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">确认欺诈的具体理由（对应命中规则与风险点）<span className="ml-1 text-rose-500">*</span></p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="请填写确认欺诈的具体理由…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <AttachmentDrop label="附件（可选）：留存风险证据截图" />
      </div>
    </Modal>
  )
}

function MisjudgeReleaseModal({ row, open, onClose, onConfirm }: { row: FraudScheme4Row; open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  useEffect(() => { if (open) setReason('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`误判放行 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" disabled={!reason.trim()} onClick={() => onConfirm(reason)}>确认放行</Button></>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">误判放行的具体理由（说明为何判定无欺诈）<span className="ml-1 text-rose-500">*</span></p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="请填写误判放行的具体理由…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <AttachmentDrop label="附件（可选）：客户佐证材料" />
      </div>
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

function ArchiveModal({ row, open, onClose, onConfirm }: { row: FraudScheme4Row; open: boolean; onClose: () => void; onConfirm: () => void }) {
  return (
    <Modal open={open} onClose={onClose} title={`归档 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" onClick={onConfirm}>确认归档</Button></>}>
      <p className="text-sm text-slate-600">确认将该案件归档？归档后处置流程完结，仅保留查看权限。</p>
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
  const ops = fraudScheme4OpsFor(row.workStatus)
  const now = () => new Date().toLocaleString('zh-CN')

  const open = (op: FraudScheme4OpKey) => {
    if (op === 'view') { onView?.(); return }
    setModal(op)
  }
  const close = () => setModal(null)

  const applyConfirmFraud = (reason: string) => {
    onApply({ workStatus: '已确认欺诈', operator: '风控专员-张磊' })
    onLog?.({ type: '确认欺诈', content: '人工确认存在欺诈行为', operator: '风控专员-张磊', time: now(), remark: reason })
    flash?.('已确认欺诈，记录欺诈行为')
    close()
  }
  const applyMisjudge = (reason: string) => {
    onApply({ workStatus: '误判放行', operator: '风控专员-张磊' })
    onLog?.({ type: '误判放行', content: '人工复核后确认无欺诈，允许通过', operator: '风控专员-张磊', time: now(), remark: reason })
    flash?.('已误判放行，允许继续流转')
    close()
  }
  const applyAddBlacklist = (payload: { phone: string; device: string; idNo: string; reason: string }) => {
    const parts = [payload.phone && `手机号 ${payload.phone}`, payload.device && `设备 ${payload.device}`, payload.idNo && `身份证 ${payload.idNo}`].filter(Boolean).join('、')
    onLog?.({ type: '加入黑名单', content: `将 ${parts} 加入黑名单库`, operator: '风控专员-张磊', time: now(), remark: payload.reason || '后续申请自动拦截' })
    flash?.('已加入黑名单库，后续申请自动拦截')
    close()
  }
  const applySubmitReview = (note: string) => {
    onApply({ workStatus: '复核中', operator: '风控专员-张磊' })
    onLog?.({ type: '提交复核', content: '提交上级/专家复核', operator: '风控专员-张磊', time: now(), remark: note })
    flash?.('已提交复核，流转至复核人员')
    close()
  }
  const applyNote = (text: string) => {
    onLog?.({ type: '录入备注', content: '录入人工复核备注', operator: '风控专员-张磊', time: now(), remark: text })
    flash?.('已录入备注')
    close()
  }
  const applyArchive = () => {
    onApply({ workStatus: '已归档', operator: row.operator })
    onLog?.({ type: '归档', content: '案件处置完成，已归档', operator: '风控专员-张磊', time: now() })
    flash?.('已归档，案件完结')
    close()
  }

  const renderModals = (
    <>
      <ConfirmFraudModal row={row} open={modal === 'confirmFraud'} onClose={close} onConfirm={applyConfirmFraud} />
      <MisjudgeReleaseModal row={row} open={modal === 'misjudgeRelease'} onClose={close} onConfirm={applyMisjudge} />
      <AddBlacklistModal row={row} open={modal === 'addBlacklist'} onClose={close} onConfirm={applyAddBlacklist} />
      <SubmitReviewModal row={row} open={modal === 'submitReview'} onClose={close} onSubmit={applySubmitReview} />
      <NoteModal open={modal === 'note'} onClose={close} onSubmit={applyNote} />
      <ArchiveModal row={row} open={modal === 'archive'} onClose={close} onConfirm={applyArchive} />
    </>
  )

  return { ops, open, renderModals }
}

function opVariant(op: FraudScheme4OpKey): 'primary' | 'secondary' | 'ghost' {
  if (op === 'confirmFraud' || op === 'addBlacklist') return 'primary'
  if (op === 'note' || op === 'submitReview' || op === 'archive') return 'ghost'
  return 'secondary'
}

/** 列表行操作按钮 */
export function FraudScheme4RowActions({ row, onApply, onView, onLog, flash }: { row: FraudScheme4Row; onApply: (next: Partial<FraudScheme4Row>) => void; onView?: () => void; onLog?: (e: S4LogEntry) => void; flash?: (m: string) => void }) {
  const { ops, open, renderModals } = fraudScheme4UseActions(row, onApply, onLog, onView, flash)
  return (
    <>
      <div className="flex flex-wrap items-center justify-start gap-3">
        {ops.map((op) => (
          <button key={op} type="button" onClick={() => open(op)}
            className="whitespace-nowrap text-xs font-medium text-brand-600 hover:underline">
            {FRAUD_S4_OP_LABEL[op]}
          </button>
        ))}
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
  const ops = base.ops.slice()
  if (showView && !ops.includes('view')) ops.unshift('view')
  if (row.workStatus !== '已归档') ops.push('submitReview', 'note')
  const { open, renderModals } = base
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">风险等级</span>
          <FraudScheme4BandBadge value={row.scoreBand} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">自动决策</span>
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
