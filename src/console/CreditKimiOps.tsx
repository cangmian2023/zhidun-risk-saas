// 信用风控（方案Kimi） · 状态/操作矩阵与操作弹窗
// 页面交互与「信息核验」(VerifyOps) 保持一致：系统自动审批结果 × 人工审核状态 → 操作按钮
// 自动审批 / 人工审核 标签配色与信息核验完全对齐（处理中灰/通过绿/拒绝红/预警橙；待确认蓝/已确认绿/待审核橙/双人复核蓝或红）
import { useEffect, useState } from 'react'
import { Badge, Button, Modal } from '../components/ui'
import type { CreditSysResult, CreditWorkStatus, CreditLevel } from './creditKimiReport'
import { CREDIT_SYS_KIND, CREDIT_WORK_KIND, CREDIT_LEVEL_KIND } from './creditKimiReport'

/* ===================== 状态模型 ===================== */
export type CreditKimiSysResult = CreditSysResult
export type CreditKimiWorkStatus = CreditWorkStatus

export interface CreditKimiRow {
  id: string
  name: string
  product: string
  channel: string
  amount: number
  creditScore: number
  riskLevel: CreditLevel
  sysResult: CreditKimiSysResult
  workStatus: CreditKimiWorkStatus
  operator: string
  auditTime: string
}

export type CreditOpKey =
  | 'view'
  | 'reportConfirm'
  | 'forceRecheck'
  | 'submitDual'
  | 'auditPass'
  | 'rejectCredit'
  | 'limitAmount'
  | 'note'

export const CREDIT_OP_LABEL: Record<CreditOpKey, string> = {
  view: '查看',
  reportConfirm: '报告确认',
  forceRecheck: '强制复审',
  submitDual: '提交双人复核',
  auditPass: '审核通过',
  rejectCredit: '拒绝授信',
  limitAmount: '限制额度',
  note: '录入备注',
}

/**
 * 列表操作矩阵：参照 docs/fraud-scheme4-status-ops-matrix.md「状态—操作对应矩阵」登记。
 * 由（信用风险等级 × 自动审批 × 人工审核）推导可用操作：
 *  - 处理中 / 核验计算中：仅查看（按钮置灰，见 creditViewLocked）
 *  - 已确认 / 双人复核办结：仅查看
 *  - 已提交双人复核：查看 + 审核通过 / 拒绝授信 / 录入备注（终审）
 *  - 中风险·预警·待审核：查看 + 提交双人复核 + 录入备注
 *  - 待确认：查看 + 报告确认；高 / 极高·拒绝类额外给「强制复审」
 */
export function creditOpsFor(sys: CreditKimiSysResult, work: CreditKimiWorkStatus, risk?: CreditLevel): CreditOpKey[] {
  if (sys === '处理中') return ['view']
  if (work === '已确认' || work === '双人复核-通过' || work === '双人复核-拒绝') return ['view']
  if (work === '已提交双人复核') return ['view', 'auditPass', 'rejectCredit', 'note']
  if (sys === '预警' && work === '待审核') return ['view', 'submitDual', 'note']
  if (work === '待确认') {
    if ((risk === '高' || risk === '极高') && sys === '拒绝') return ['view', 'reportConfirm', 'forceRecheck']
    return ['view', 'reportConfirm']
  }
  return ['view']
}

/** 详情页「授信建议」处置操作区：对齐文档第八段（审核通过/拒绝授信/限制额度/提交双人复核/录入备注） */
export function creditDispositionOpsFor(work: CreditKimiWorkStatus): CreditOpKey[] {
  if (work === '待确认' || work === '待审核') return ['auditPass', 'rejectCredit', 'limitAmount', 'submitDual', 'note']
  // 已提交双人复核 / 已确认 / 双人复核通过或拒绝：仅可录入备注（闭环）
  return ['note']
}

/** 查看按钮是否置灰：仅「处理中 / 核验计算中」行禁止查看（参照欺诈方案4登记 §3） */
export function creditViewLocked(sys: CreditKimiSysResult): boolean {
  return sys === '处理中'
}

export function CreditSysResultBadge({ value }: { value: CreditKimiSysResult }) {
  return <Badge kind={CREDIT_SYS_KIND[value]}>{value}</Badge>
}
export function CreditWorkStatusBadge({ value }: { value: CreditKimiWorkStatus }) {
  return <Badge kind={CREDIT_WORK_KIND[value]}>{value}</Badge>
}
export function CreditLevelBadge({ value }: { value: CreditLevel }) {
  return <Badge kind={CREDIT_LEVEL_KIND[value]}>{value}</Badge>
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

/* ===================== 操作弹窗 ===================== */

// 整体报告确认
function ReportConfirmModal({ row, open, onClose, onConfirm }: { row: CreditKimiRow; open: boolean; onClose: () => void; onConfirm: (note: string) => void }) {
  const [note, setNote] = useState('')
  useEffect(() => { if (open) setNote('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`整体报告确认 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" onClick={() => onConfirm(note)}>提交确认</Button></>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">本次信用评估终审说明（简述整体风险判断）</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="请填写本工单的整体风险判断与终审说明…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <AttachmentDrop label="附件上传区" />
        <p className="text-xs text-slate-400">提交后将锁定当前报告所有数据，写入终审日志，工单按原有系统结果正常流转。</p>
      </div>
    </Modal>
  )
}

// 强制复审（推翻系统自动拒绝，重新提交复审流程）
function ForceRecheckModal({ row, open, onClose, onConfirm }: { row: CreditKimiRow; open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  const [agree, setAgree] = useState(false)
  useEffect(() => { if (open) { setReason(''); setAgree(false) } }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`强制复审 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" disabled={!reason.trim() || !agree} onClick={() => onConfirm(reason)}>确认强制复审</Button></>}>
      <div className="space-y-4 text-sm">
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">本操作将推翻系统风控拦截，把申请重新提交复审流程，请谨慎操作。</div>
        <div>
          <p className="mb-2 text-xs text-slate-400">理由：详细写明系统拦截风险为误判的合理解释<span className="ml-1 text-rose-500">*</span></p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="请详细写明判定为误判的理由…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <AttachmentDrop required label="强制上传：客户佐证材料、沟通凭证" />
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
          <span>知悉本次操作豁免系统风控拦截，本人承担对应风控责任</span>
        </label>
      </div>
    </Modal>
  )
}

// 提交双人复核
function SubmitDualReviewModal({ row, open, onClose, onSubmit }: { row: CreditKimiRow; open: boolean; onClose: () => void; onSubmit: (note: string) => void }) {
  const [note, setNote] = useState('')
  useEffect(() => { if (open) setNote('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`提交双人复核 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button variant="primary" disabled={!note.trim()} onClick={() => onSubmit(note)}>提交推送</Button></>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">推送复核的理由、需要主管重点核查的风险点</p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="请填写需主管重点核查的风险点与说明…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <AttachmentDrop label="附件：打包当前全套信用评估报告（可选）" />
        <p className="text-xs text-slate-400">提交后工单锁定，流转至主管复核工作台，初审账号无法再编辑数据。</p>
      </div>
    </Modal>
  )
}

// 审核通过
function AuditPassModal({ row, open, onClose, onConfirm }: { row: CreditKimiRow; open: boolean; onClose: () => void; onConfirm: (note: string) => void }) {
  const [note, setNote] = useState('')
  useEffect(() => { if (open) setNote('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`审核通过 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>关闭</Button><Button variant="primary" disabled={!note.trim()} onClick={() => onConfirm(note)}>确认通过</Button></>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">通过依据、授信说明<span className="ml-1 text-rose-500">*</span></p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="请填写授信通过依据与已核实的风险点…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <AttachmentDrop required label="佐证材料上传（收入证明、资料佐证等）" />
      </div>
    </Modal>
  )
}

// 拒绝授信
function RejectCreditModal({ row, open, onClose, onConfirm }: { row: CreditKimiRow; open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  useEffect(() => { if (open) setReason('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`拒绝授信 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>关闭</Button><Button variant="primary" disabled={!reason.trim()} onClick={() => onConfirm(reason)}>确认拒绝</Button></>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">拒贷具体原因（对应信用历史 / 设备 / 关联哪项风险）<span className="ml-1 text-rose-500">*</span></p>
          <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={4} placeholder="请填写拒贷具体原因…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <AttachmentDrop label="附件（可选）：留存风险证据截图" />
      </div>
    </Modal>
  )
}

// 限制额度
function LimitAmountModal({ row, open, onClose, onConfirm }: { row: CreditKimiRow; open: boolean; onClose: () => void; onConfirm: (note: string) => void }) {
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  useEffect(() => { if (open) { setAmount(''); setNote('') } }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`限制额度 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>关闭</Button><Button variant="primary" disabled={!amount.trim() || !note.trim()} onClick={() => onConfirm(`限制授信额度 ¥${amount}；${note}`)}>确认限制</Button></>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">限制后授信额度（元）<span className="ml-1 text-rose-500">*</span></p>
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`申请额度 ${row.amount.toLocaleString()}`}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-400">限制理由<span className="ml-1 text-rose-500">*</span></p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="请填写限制额度的理由…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
      </div>
    </Modal>
  )
}

// 录入备注
function NoteModal({ open, target, onClose, onSubmit }: { open: boolean; target: string; onClose: () => void; onSubmit: (text: string) => void }) {
  const [text, setText] = useState('')
  useEffect(() => { if (open) setText('') }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">录入备注</h3>
        <p className="mb-3 text-xs text-slate-500">对象：{target}</p>
        <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="请输入备注内容..."
          className="mb-3 h-28 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400" />
        <div className="mb-4 rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center text-xs text-slate-400">点击或拖拽上传附件（通话录音、结清证明、证件佐证截图）</div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={() => { if (text.trim()) { onSubmit(text); setText(''); onClose() } }}>提交</Button>
        </div>
      </div>
    </div>
  )
}

/* ===================== 操作逻辑（列表行 / 详情栏 / 处置区 共用） ===================== */
export interface CreditKimiLog {
  id: string
  type: string
  content: string
  operator: string
  time: string
  result?: string
  remark?: string
}

export function useCreditKimiActions(
  row: CreditKimiRow,
  onApply: (next: Partial<CreditKimiRow>) => void,
  onLog?: (entry: Omit<CreditKimiLog, 'id'>) => void,
  onView?: () => void,
  flash?: (m: string) => void,
) {
  const [modal, setModal] = useState<CreditOpKey | null>(null)
  const ops = creditOpsFor(row.sysResult, row.workStatus, row.riskLevel)
  const dispOps = creditDispositionOpsFor(row.workStatus)
  const locked = creditViewLocked(row.sysResult)

  const open = (op: CreditOpKey) => {
    if (op === 'view') { onView?.(); return }
    setModal(op)
  }
  const close = () => setModal(null)
  const now = () => new Date().toLocaleString('zh-CN')
  const log = (type: string, content: string, result?: string, remark?: string) =>
    onLog?.({ type, content, operator: '当前用户', time: now(), result, remark })

  const applyReportConfirm = (note: string) => {
    onApply({ workStatus: '已确认', operator: '初审：审核员 1' })
    log('整体报告确认', `确认报告内容（${note || '无说明'}）`, '已确认')
    flash?.('已提交整体报告确认，工单归档')
    close()
  }
  const applyForceRecheck = (reason: string) => {
    onApply({ workStatus: '已提交双人复核', operator: '初审：审核员 1' })
    log('强制复审', '推翻系统自动结果，重新提交复审流程', '已提交双人复核', reason)
    flash?.('已强制复审，工单流转至主管')
    close()
  }
  const applySubmitDual = (note: string) => {
    onApply({ workStatus: '已提交双人复核', operator: '初审：审核员 1' })
    log('提交双人复核', `推送主管复核：${note || '无说明'}`, '已提交双人复核')
    flash?.('已提交双人复核，工单锁定流转至主管')
    close()
  }
  const applyAuditPass = (note: string) => {
    onApply({ workStatus: '已确认', operator: '初审：审核员 1；终审：主管 1' })
    log('审核通过', `人工复核通过授信（${note || '无说明'}）`, '已确认')
    flash?.('审核通过，允许授信')
    close()
  }
  const applyRejectCredit = (reason: string) => {
    onApply({ workStatus: '已确认', operator: '初审：审核员 1；终审：主管 1' })
    log('拒绝授信', `人工复核拒绝申请（${reason}）`, '已确认')
    flash?.('拒绝授信，工单办结')
    close()
  }
  const applyLimitAmount = (note: string) => {
    onApply({ workStatus: '已确认', operator: '初审：审核员 1；终审：主管 1' })
    log('限制额度', note, '已确认')
    flash?.('已限制额度，按限制额度授信')
    close()
  }
  const applyNote = (text: string) => {
    log('录入备注', text)
    flash?.('备注已保存')
    close()
  }

  const renderModals = (
    <>
      <ReportConfirmModal row={row} open={modal === 'reportConfirm'} onClose={close} onConfirm={applyReportConfirm} />
      <ForceRecheckModal row={row} open={modal === 'forceRecheck'} onClose={close} onConfirm={applyForceRecheck} />
      <SubmitDualReviewModal row={row} open={modal === 'submitDual'} onClose={close} onSubmit={applySubmitDual} />
      <AuditPassModal row={row} open={modal === 'auditPass'} onClose={close} onConfirm={applyAuditPass} />
      <RejectCreditModal row={row} open={modal === 'rejectCredit'} onClose={close} onConfirm={applyRejectCredit} />
      <LimitAmountModal row={row} open={modal === 'limitAmount'} onClose={close} onConfirm={applyLimitAmount} />
      <NoteModal open={modal === 'note'} target={row.id} onClose={close} onSubmit={applyNote} />
    </>
  )

  return { ops, dispOps, locked, open, renderModals }
}

function opVariant(op: CreditOpKey): 'primary' | 'secondary' | 'ghost' {
  if (op === 'auditPass' || op === 'reportConfirm') return 'primary'
  if (op === 'rejectCredit') return 'ghost'
  return 'secondary'
}

/** 列表行操作按钮 */
export function CreditKimiRowActions({ row, onApply, onView, flash }: { row: CreditKimiRow; onApply: (next: Partial<CreditKimiRow>) => void; onView?: () => void; flash?: (m: string) => void }) {
  const { ops, locked, open, renderModals } = useCreditKimiActions(row, onApply, undefined, onView, flash)
  return (
    <>
      <div className="flex flex-wrap items-center justify-start gap-3">
        {ops.map((op) => {
          const isViewLocked = op === 'view' && locked
          return (
            <button key={op} type="button" disabled={isViewLocked} onClick={() => open(op)}
              className={`whitespace-nowrap text-xs font-medium ${isViewLocked ? 'cursor-not-allowed text-slate-300' : 'text-brand-600 hover:underline'}`}>
              {CREDIT_OP_LABEL[op]}
            </button>
          )
        })}
      </div>
      {renderModals}
    </>
  )
}

/** 详情页顶部操作栏（系统结果 / 人工审核 / 操作人员 + 操作按钮，与列表一致） */
export function CreditKimiActionBar({ row, onApply, onView, flash, showView = true }: { row: CreditKimiRow; onApply: (next: Partial<CreditKimiRow>) => void; onView?: () => void; flash?: (m: string) => void; showView?: boolean }) {
  const base = useCreditKimiActions(row, onApply, undefined, onView, flash)
  const ops = showView ? base.ops : base.ops.filter((o) => o !== 'view')
  const { locked, open, renderModals } = base
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2"><span className="text-xs text-slate-400">系统结果</span><CreditSysResultBadge value={row.sysResult} /></div>
        <div className="flex items-center gap-2"><span className="text-xs text-slate-400">人工审核</span><CreditWorkStatusBadge value={row.workStatus} /></div>
        <div className="flex items-center gap-2"><span className="text-xs text-slate-400">操作人员</span><span className="text-sm text-slate-700">{row.operator}</span></div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {ops.map((op) => {
            if (op === 'view') return <Button key={op} variant="secondary" disabled={locked} onClick={() => open(op)}>{CREDIT_OP_LABEL[op]}</Button>
            return <Button key={op} variant={opVariant(op)} onClick={() => open(op)}>{CREDIT_OP_LABEL[op]}</Button>
          })}
        </div>
      </div>
      {renderModals}
    </div>
  )
}

/** 详情页「授信建议」处置操作区（文档第八段：审核通过/拒绝授信/限制额度/提交双人复核/录入备注） */
export function CreditKimiDispositionBar({ row, onApply, onLog, flash }: { row: CreditKimiRow; onApply: (next: Partial<CreditKimiRow>) => void; onLog?: (entry: Omit<CreditKimiLog, 'id'>) => void; flash?: (m: string) => void }) {
  const { dispOps, open, renderModals } = useCreditKimiActions(row, onApply, onLog, undefined, flash)
  return (
    <div className="flex flex-wrap items-center gap-2">
      {dispOps.map((op) => {
        if (op === 'note') return <Button key={op} variant="ghost" onClick={() => open(op)}>{CREDIT_OP_LABEL[op]}</Button>
        if (op === 'auditPass') return <Button key={op} variant="primary" onClick={() => open(op)}>{CREDIT_OP_LABEL[op]}</Button>
        if (op === 'rejectCredit') return <Button key={op} variant="ghost" onClick={() => open(op)}>{CREDIT_OP_LABEL[op]}</Button>
        return <Button key={op} variant="secondary" onClick={() => open(op)}>{CREDIT_OP_LABEL[op]}</Button>
      })}
      {renderModals}
    </div>
  )
}
