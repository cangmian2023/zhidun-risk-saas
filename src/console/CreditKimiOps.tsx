// 信用风控 · 状态/操作矩阵与操作弹窗
// 评分越高信用越好（300-900）：优秀/良好→自动通过；一般→预警进入人工审核；差→自动拒绝
// 人工审核流程（仅「一般/预警」）：待审核 → 提交复核 → 复核放行/复核拒绝
import { useEffect, useState } from 'react'
import { Badge, Button, Modal } from '../components/ui'
import type { CreditSysResult, CreditWorkStatus, CreditGrade } from './creditKimiReport'
import { CREDIT_SYS_KIND, CREDIT_WORK_KIND, CREDIT_GRADE_KIND } from './creditKimiReport'

/* ===================== 状态模型 ===================== */
export type CreditKimiSysResult = CreditSysResult
export type CreditKimiWorkStatus = CreditWorkStatus

export interface CreditKimiRow {
  id: string
  name: string
  product: string
  channel: string
  amount: number
  creditScore: number // 300-900，处理中时为 0（展示为 —）
  sysResult: CreditKimiSysResult
  workStatus: CreditKimiWorkStatus
  operator: string
  auditTime: string
}

export type CreditOpKey =
  | 'view'
  | 'submitReview'
  | 'confirmPass'
  | 'confirmReject'
  | 'note'

export const CREDIT_OP_LABEL: Record<CreditOpKey, string> = {
  view: '查看',
  submitReview: '提交复核',
  confirmPass: '确认放行',
  confirmReject: '确认拒绝',
  note: '录入备注',
}

/**
 * 列表操作矩阵（信用评分 → 自动审核 × 人工审核）：
 *  - 处理中：仅查看（按钮置灰，见 creditViewLocked）
 *  - 优秀/良好（自动通过）、差（自动拒绝）：仅查看
 *  - 一般/预警：
 *      · 待审核  → 查看、提交复核、录入备注
 *      · 提交复核 → 查看、确认放行、确认拒绝、录入备注
 *      · 复核放行 / 复核拒绝 → 仅查看
 */
export function creditOpsFor(sys: CreditKimiSysResult, work: CreditKimiWorkStatus): CreditOpKey[] {
  if (sys === '处理中') return ['view']
  if (sys === '通过' || sys === '拒绝') return ['view']
  // sys === '预警'（一般）
  if (work === '待审核') return ['view', 'submitReview', 'note']
  if (work === '提交复核') return ['view', 'confirmPass', 'confirmReject', 'note']
  // 复核放行 / 复核拒绝
  return ['view']
}

/** 查看按钮是否置灰：仅「处理中」行禁止查看 */
export function creditViewLocked(sys: CreditKimiSysResult): boolean {
  return sys === '处理中'
}

export function CreditSysResultBadge({ value }: { value: CreditKimiSysResult }) {
  return <Badge kind={CREDIT_SYS_KIND[value]}>{value}</Badge>
}
export function CreditWorkStatusBadge({ value }: { value: CreditKimiWorkStatus }) {
  return <Badge kind={CREDIT_WORK_KIND[value]}>{value}</Badge>
}
export function CreditGradeBadge({ value }: { value: CreditGrade }) {
  return <Badge kind={CREDIT_GRADE_KIND[value]}>{value}</Badge>
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

// 提交复核（初审提交，流转至主管终审）
function SubmitReviewModal({ row, open, onClose, onSubmit }: { row: CreditKimiRow; open: boolean; onClose: () => void; onSubmit: (note: string) => void }) {
  const [note, setNote] = useState('')
  useEffect(() => { if (open) setNote('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`提交复核 · ${row.id}`}
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

// 确认放行（主管终审通过）
function ConfirmPassModal({ row, open, onClose, onConfirm }: { row: CreditKimiRow; open: boolean; onClose: () => void; onConfirm: (note: string) => void }) {
  const [note, setNote] = useState('')
  useEffect(() => { if (open) setNote('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`确认放行 · ${row.id}`}
      footer={<><Button variant="ghost" onClick={onClose}>关闭</Button><Button variant="primary" disabled={!note.trim()} onClick={() => onConfirm(note)}>确认放行</Button></>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">放行依据、授信说明<span className="ml-1 text-rose-500">*</span></p>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={4} placeholder="请填写终审放行依据与已核实的风险点…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        </div>
        <AttachmentDrop required label="佐证材料上传（收入证明、资料佐证等）" />
      </div>
    </Modal>
  )
}

// 确认拒绝（主管终审拒绝）
function ConfirmRejectModal({ row, open, onClose, onConfirm }: { row: CreditKimiRow; open: boolean; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  useEffect(() => { if (open) setReason('') }, [open])
  return (
    <Modal open={open} onClose={onClose} title={`确认拒绝 · ${row.id}`}
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

/* ===================== 操作逻辑（列表行 / 详情栏 共用） ===================== */
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
  const ops = creditOpsFor(row.sysResult, row.workStatus)
  const locked = creditViewLocked(row.sysResult)

  const open = (op: CreditOpKey) => {
    if (op === 'view') { onView?.(); return }
    setModal(op)
  }
  const close = () => setModal(null)
  const now = () => new Date().toLocaleString('zh-CN')
  const log = (type: string, content: string, result?: string, remark?: string) =>
    onLog?.({ type, content, operator: '当前用户', time: now(), result, remark })

  const applySubmitReview = (note: string) => {
    onApply({ workStatus: '提交复核', operator: '初审：审核员 1' })
    log('提交复核', `初审提交主管复核：${note || '无说明'}`, '提交复核')
    flash?.('已提交复核，工单锁定流转至主管')
    close()
  }
  const applyConfirmPass = (note: string) => {
    onApply({ workStatus: '复核放行', operator: '初审：审核员 1；终审：主管 1' })
    log('确认放行', `主管终审放行授信（${note || '无说明'}）`, '复核放行')
    flash?.('已确认放行，允许授信')
    close()
  }
  const applyConfirmReject = (reason: string) => {
    onApply({ workStatus: '复核拒绝', operator: '初审：审核员 1；终审：主管 1' })
    log('确认拒绝', `主管终审拒绝申请（${reason}）`, '复核拒绝')
    flash?.('已确认拒绝，工单办结')
    close()
  }
  const applyNote = (text: string) => {
    log('录入备注', text)
    flash?.('备注已保存')
    close()
  }

  const renderModals = (
    <>
      <SubmitReviewModal row={row} open={modal === 'submitReview'} onClose={close} onSubmit={applySubmitReview} />
      <ConfirmPassModal row={row} open={modal === 'confirmPass'} onClose={close} onConfirm={applyConfirmPass} />
      <ConfirmRejectModal row={row} open={modal === 'confirmReject'} onClose={close} onConfirm={applyConfirmReject} />
      <NoteModal open={modal === 'note'} target={row.id} onClose={close} onSubmit={applyNote} />
    </>
  )

  return { ops, locked, open, renderModals }
}

function opVariant(op: CreditOpKey): 'primary' | 'secondary' | 'ghost' {
  if (op === 'confirmPass') return 'primary'
  if (op === 'confirmReject') return 'ghost'
  if (op === 'note') return 'ghost'
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
export function CreditKimiActionBar({ row, onApply, onLog, onView, flash, showView = true }: { row: CreditKimiRow; onApply: (next: Partial<CreditKimiRow>) => void; onLog?: (entry: Omit<CreditKimiLog, 'id'>) => void; onView?: () => void; flash?: (m: string) => void; showView?: boolean }) {
  const base = useCreditKimiActions(row, onApply, onLog, onView, flash)
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
