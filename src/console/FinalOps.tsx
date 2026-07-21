// 终审操作 · 共享组件
// 所有报告页（信息核验 / 信用风控 / 欺诈识别）的「七、终审操作」统一复用本组件：
//   - 固定常驻按钮：提交双人复核 / 全局风险备注
//   - 互斥切换按钮：系统结论为「拒绝」显示「强制人工复审」；否则显示「整体报告确认」
// 每个按钮对应一种弹窗交互，提交后生成终审操作记录。
import { useEffect, useRef, useState } from 'react'
import { Button } from '../components/ui'

export type FinalDecision = 'reject' | 'pass' | 'pending'

export interface FinalRecord {
  id: string
  action: string
  badge: 'red' | 'amber' | 'blue' | 'green' | 'gray'
  operator: string
  time: string
  before: string
  after: string
  reason: string
  highlight?: boolean
  attachments?: string[]
  reviewStatus?: string
}

const nowStr = () => new Date().toLocaleString('zh-CN')

const fieldCls =
  'w-full resize-none rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-brand-400'
const labelCls = 'mb-1 block text-xs font-medium text-slate-600'

// ---------------- 文件上传（佐证材料） ----------------
function FileDrop({
  files,
  setFiles,
  required,
}: {
  files: string[]
  setFiles: (f: string[]) => void
  required?: boolean
}) {
  const ref = useRef<HTMLInputElement>(null)
  return (
    <div>
      <input
        ref={ref}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const names = Array.from(e.target.files ?? []).map((f) => f.name)
          setFiles(names)
        }}
      />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500 transition hover:bg-slate-50"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
        </svg>
        上传佐证文件{required ? '（必传）' : '（可多选）'}
      </button>
      {files.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {files.map((f, i) => (
            <span key={i} className="flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-[11px] text-slate-600">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15l-5 5-5-5M16 4v16" />
              </svg>
              {f}
              <button
                type="button"
                className="ml-0.5 text-slate-400 hover:text-rose-500"
                onClick={() => setFiles(files.filter((_, j) => j !== i))}
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------- 弹窗：提交双人复核 ----------------
function ReviewModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string, attachments: string[]) => void
}) {
  const [reason, setReason] = useState('')
  useEffect(() => {
    if (open) setReason('')
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">提交双人复核</h3>
        <p className="mb-3 text-xs text-slate-500">
          提交后工单将锁定并流转至主管复核工作台，初审将无法再修改风险判定。
        </p>
        <label className={labelCls}>
          推送复核理由 <span className="text-rose-500">*</span>
        </label>
        <textarea
          className={fieldCls}
          rows={4}
          placeholder="请填写提交双人复核的理由…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" disabled={!reason.trim()} onClick={() => onSubmit(reason.trim(), [])}>
            确定提交
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------- 弹窗：全局风险备注 ----------------
function GlobalNoteModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string, attachments: string[]) => void
}) {
  const [text, setText] = useState('')
  const [files, setFiles] = useState<string[]>([])
  useEffect(() => {
    if (open) {
      setText('')
      setFiles([])
    }
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">全局风险备注</h3>
        <p className="mb-3 text-xs text-slate-500">
          填写整单综合说明，可上传全单佐证文件（回访录音、收入证明等）。提交后仅留文字与附件记录，不改变工单 / 风险结论。
        </p>
        <label className={labelCls}>
          整单综合说明 <span className="text-rose-500">*</span>
        </label>
        <textarea
          className={fieldCls}
          rows={4}
          placeholder="请填写整单综合说明…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <div className="mt-3">
          <label className={labelCls}>全单佐证文件（选填）</label>
          <FileDrop files={files} setFiles={setFiles} />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" disabled={!text.trim()} onClick={() => onSubmit(text.trim(), files)}>
            提交留痕
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------- 弹窗：整体报告确认 ----------------
function FinalConfirmModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string, attachments: string[]) => void
}) {
  const [reason, setReason] = useState('')
  useEffect(() => {
    if (open) setReason('')
  }, [open])
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-1 text-base font-semibold text-ink-900">整体报告确认</h3>
        <p className="mb-3 text-xs text-slate-500">
          前置条件：系统结论为「自动通过 / 人工复核」。确认后锁定当前所有分项处置结果，生成终审记录，工单自动流转至下一环节（授信审批）。
        </p>
        <label className={labelCls}>
          终审处置理由 <span className="text-rose-500">*</span>
        </label>
        <textarea
          className={fieldCls}
          rows={4}
          placeholder="请填写终审处置理由…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <Button variant="primary" disabled={!reason.trim()} onClick={() => onSubmit(reason.trim(), [])}>
            确认终审
          </Button>
        </div>
      </div>
    </div>
  )
}

// ---------------- 弹窗：强制人工复审（推翻系统拦截） ----------------
function ForceReviewModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string, attachments: string[]) => void
}) {
  const [reason, setReason] = useState('')
  const [files, setFiles] = useState<string[]>([])
  useEffect(() => {
    if (open) {
      setReason('')
      setFiles([])
    }
  }, [open])
  if (!open) return null
  const canSubmit = reason.trim() !== '' && files.length > 0
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30" onClick={onClose}>
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-2 text-base font-semibold text-rose-600">强制人工复审（推翻系统拦截）</h3>
        <div className="mb-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs leading-relaxed text-rose-700">
          高敏感操作：仅当系统原始结论为「拒绝」时可用。必须填写完整理由并上传佐证材料，否则无法提交。提交后将推翻系统拒贷结论，工单转为人工通过状态，并强制留存双人复核痕迹。
        </div>
        <label className={labelCls}>
          完整理由 <span className="text-rose-500">*</span>
        </label>
        <textarea
          className={fieldCls}
          rows={4}
          placeholder="请填写推翻系统拒贷的完整理由…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
        <div className="mt-3">
          <label className={labelCls}>
            佐证材料 <span className="text-rose-500">*</span>
          </label>
          <FileDrop files={files} setFiles={setFiles} required />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            取消
          </Button>
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => onSubmit(reason.trim(), files)}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-rose-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            强制提交复审
          </button>
        </div>
      </div>
    </div>
  )
}

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

// ---------------- 对外主组件 ----------------
export function FinalOpsCard({
  decision: initDecision,
  initialRecords = [],
  reviewNote,
  disableRejectPassing = false,
}: {
  decision: FinalDecision
  initialRecords?: FinalRecord[]
  reviewNote?: string
  disableRejectPassing?: boolean
}) {
  const [, setRecs] = useState<FinalRecord[]>(initialRecords)
  const [decision, setDecision] = useState<FinalDecision>(initDecision)
  const [modal, setModal] = useState<null | 'review' | 'globalNote' | 'finalConfirm' | 'forceReview'>(null)
  const [outcome, setOutcome] = useState<{ ok: boolean; text: string } | null>(null)

  const push = (r: Omit<FinalRecord, 'id'>) =>
    setRecs((p) => [{ ...r, id: `fo${Date.now()}${Math.random().toString(36).slice(2, 6)}` }, ...p])

  const sysText = decision === 'reject' ? '拒绝' : '自动通过 / 人工复核'

  return (
    <div className="space-y-3">
      {/* 状态说明 + 按钮组 */}
      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        {decision === 'pending' && reviewNote && (
          <div className="text-xs text-amber-600">复核说明：{reviewNote}</div>
        )}
        <div className="flex flex-wrap items-center gap-2">
          {/* 固定常驻按钮 */}
          <Button variant="primary" onClick={() => setModal('review')}>
            提交双人复核
          </Button>
          <Button variant="primary" onClick={() => setModal('globalNote')}>
            全局风险备注
          </Button>
          {/* 互斥切换按钮 */}
          {decision === 'reject' ? (
            <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" disabled={disableRejectPassing} onClick={() => setModal('forceReview')}>
              强制人工复审
            </Button>
          ) : decision === 'pending' ? (
            <>
              <Button variant="primary" onClick={() => setModal('finalConfirm')}>
                整体报告确认
              </Button>
              <Button variant="primary" className="bg-rose-600 hover:bg-rose-700" onClick={() => setModal('forceReview')}>
                强制人工复审
              </Button>
            </>
          ) : (
            <Button variant="primary" onClick={() => setModal('finalConfirm')}>
              整体报告确认
            </Button>
          )}
        </div>
      </div>

      {/* 操作结果反馈 */}
      {outcome && (
        <div
          className={cn(
            'rounded-xl border px-4 py-3 text-sm',
            outcome.ok ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-rose-200 bg-rose-50 text-rose-700',
          )}
        >
          {outcome.text}
        </div>
      )}

      <ReviewModal
        open={modal === 'review'}
        onClose={() => setModal(null)}
        onSubmit={(reason) => {
          push({
            action: '提交双人复核',
            badge: 'blue',
            operator: '当前用户',
            time: nowStr(),
            before: '初审处理中',
            after: '待二级复核（工单锁定）',
            reason: `双人复核理由：${reason}`,
            reviewStatus: '待二级复核',
          })
          setOutcome({
            ok: true,
            text: '工单已锁定，流转至主管复核工作台，新增「待二级复核」终审日志，初审无法再修改风险判定。',
          })
          setModal(null)
        }}
      />
      <GlobalNoteModal
        open={modal === 'globalNote'}
        onClose={() => setModal(null)}
        onSubmit={(text, files) => {
          push({
            action: '全局风险备注',
            badge: 'gray',
            operator: '当前用户',
            time: nowStr(),
            before: '—',
            after: '仅留痕',
            reason: text,
            attachments: files,
          })
          setOutcome({
            ok: true,
            text: '已生成一条全局操作日志，不改变工单 / 风险结论，仅留文字附件记录。',
          })
          setModal(null)
        }}
      />
      <FinalConfirmModal
        open={modal === 'finalConfirm'}
        onClose={() => setModal(null)}
        onSubmit={(reason) => {
          push({
            action: '整体报告确认',
            badge: 'green',
            operator: '当前用户',
            time: nowStr(),
            before: sysText,
            after: '终审通过（锁定）',
            reason,
          })
          setOutcome({
            ok: true,
            text: '已锁定当前所有分项处置结果，生成终审记录；工单自动流转至下一环节（授信审批）。',
          })
          setModal(null)
        }}
      />
      <ForceReviewModal
        open={modal === 'forceReview'}
        onClose={() => setModal(null)}
        onSubmit={(reason, files) => {
          push({
            action: '强制人工复审',
            badge: 'red',
            highlight: true,
            operator: '当前用户',
            time: nowStr(),
            before: `系统结论：${sysText}`,
            after: '人工通过（已推翻拒贷）',
            reason,
            attachments: files,
          })
          setDecision('pass')
          setOutcome({
            ok: true,
            text: '已推翻系统拒贷结论，工单转为人工通过状态，自动生成高亮红色终审记录，强制留存双人复核痕迹。',
          })
          setModal(null)
        }}
      />
    </div>
  )
}
