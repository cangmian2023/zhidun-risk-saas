// 欺诈识别（方案3）· 状态/操作矩阵与操作弹窗
// 直接复用信息核验 VerifyOps 的操作栏交互逻辑（提交双人复核 / 强制复审 / 确认放行 / 确认拒绝 + 全局风险备注 / 查看打分权重明细）
// 仅将「系统结果」词汇调整为欺诈语义（无风险 / 可疑 / 确认欺诈 / 处理中），工单流转逻辑与信息核验保持一致
import { useEffect, useState } from 'react'
import { Badge, Button, Modal } from '../components/ui'

/* ===================== 状态模型 ===================== */
// 自动欺诈判定（实色胶囊，沿用信息核验配色逻辑：无风险绿 / 可疑黄 / 确认欺诈红 / 处理中灰）
export type FraudScheme3SysResult = '处理中' | '无风险' | '确认欺诈' | '可疑'
// 工单人工状态：直接复用信息核验 VerifyOps 的流转状态
export type FraudScheme3WorkStatus =
  | '核验计算中'
  | '待确认'
  | '已确认'
  | '待审核'
  | '已提交双人复核'
  | '双人复核-通过'
  | '双人复核-拒绝'
  | '强制放行办结'

export interface FraudScheme3Row {
  id: string
  name: string
  product: string
  channel: string
  amount: number
  fraudScore: number // 自研欺诈汇总分 0-100
  zhichaScore: number // 智察分（同盾原生）0-100
  sysResult: FraudScheme3SysResult
  workStatus: FraudScheme3WorkStatus
  operator: string
  auditTime: string
}

export type FraudScheme3OpKey =
  | 'view'
  | 'reportConfirm'
  | 'forceRecheck'
  | 'submitDual'
  | 'confirmPass'
  | 'confirmReject'

export const FRAUD_S3_OP_LABEL: Record<FraudScheme3OpKey, string> = {
  view: '查看',
  reportConfirm: '报告确认',
  forceRecheck: '强制复审',
  submitDual: '提交双人复核',
  confirmPass: '确认放行',
  confirmReject: '确认拒绝',
}

/** 按（系统自动审核结果 × 工单人工状态）推导该工单可执行的按钮 —— 与信息核验逻辑 1:1 复用 */
export function fraudScheme3OpsFor(sys: FraudScheme3SysResult, work: FraudScheme3WorkStatus): FraudScheme3OpKey[] {
  if (work === '核验计算中') return ['view'] // 接口计算中：仅查看（置灰）
  if (sys === '无风险') {
    return work === '待确认' ? ['view', 'reportConfirm'] : ['view'] // 待确认=报告确认；已确认=闭环
  }
  if (sys === '确认欺诈') {
    if (work === '待确认') return ['view', 'reportConfirm', 'forceRecheck'] // 报告确认 / 强制复审（推翻拦截）
    return ['view'] // 已确认 / 强制放行办结 = 闭环
  }
  // 可疑：待审核 仅可提交双人复核；已提交双人复核 由主管终审放行/拒绝
  if (work === '待审核') return ['view', 'submitDual']
  if (work === '已提交双人复核') return ['view', 'confirmPass', 'confirmReject']
  return ['view'] // 双人复核-通过 / 双人复核-拒绝 = 已办结
}

export function fraudScheme3ViewLocked(work: FraudScheme3WorkStatus): boolean {
  return work === '核验计算中'
}

const SYS_KIND: Record<FraudScheme3SysResult, 'gray' | 'green' | 'red' | 'amber'> = {
  处理中: 'gray', 无风险: 'green', 确认欺诈: 'red', 可疑: 'amber',
}
const WORK_KIND: Record<FraudScheme3WorkStatus, 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
  核验计算中: 'gray', 待确认: 'blue', 已确认: 'green', 待审核: 'amber', 已提交双人复核: 'amber',
  '双人复核-通过': 'green', '双人复核-拒绝': 'red', 强制放行办结: 'violet',
}

export function FraudScheme3SysBadge({ value }: { value: FraudScheme3SysResult }) {
  return <Badge kind={SYS_KIND[value]}>{value}</Badge>
}
export function FraudScheme3WorkBadge({ value }: { value: FraudScheme3WorkStatus }) {
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

/* ===================== 五个操作弹窗（与信息核验 1:1 复用） ===================== */

// 1、整体报告确认（纯归档背书，不改结果）
function ReportConfirmModal({
  row,
  open,
  onClose,
  onConfirm,
}: {
  row: FraudScheme3Row
  open: boolean
  onClose: () => void
  onConfirm: (note: string) => void
}) {
  const [note, setNote] = useState('')
  useEffect(() => {
    if (open) setNote('')
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`整体报告确认 · ${row.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={() => onConfirm(note)}>提交确认</Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">本次欺诈识别终审说明（简述整体风险判断）</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="请填写本工单的整体欺诈风险判断与终审说明…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        <AttachmentDrop label="附件上传区" />
        <p className="text-xs text-slate-400">提交后将锁定当前报告所有数据，写入终审日志，工单按原有系统结果正常流转。</p>
      </div>
    </Modal>
  )
}

// 2、确认放行（人工判定通过）
function ConfirmPassModal({
  row,
  open,
  onClose,
  onConfirm,
}: {
  row: FraudScheme3Row
  open: boolean
  onClose: () => void
  onConfirm: (note: string) => void
}) {
  const [note, setNote] = useState('')
  const [agree, setAgree] = useState(false)
  useEffect(() => {
    if (open) {
      setNote('')
      setAgree(false)
    }
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`确认放行 · ${row.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>关闭</Button>
          <Button variant="primary" disabled={!note.trim() || !agree} onClick={() => onConfirm(note)}>
            确认放行
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">
            放行依据、风险核实说明<span className="ml-1 text-rose-500">*</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="请填写放行依据与已核实的风险点…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        <AttachmentDrop required label="佐证材料上传（通话录音、资料证明等）" />
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
          <span>本人已逐项核验全部欺诈风险疑点，放行操作真实有效</span>
        </label>
      </div>
    </Modal>
  )
}

// 3、确认拒绝（人工判定拒贷）
function ConfirmRejectModal({
  row,
  open,
  onClose,
  onConfirm,
}: {
  row: FraudScheme3Row
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  useEffect(() => {
    if (open) setReason('')
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`确认拒绝 · ${row.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>关闭</Button>
          <Button variant="primary" disabled={!reason.trim()} onClick={() => onConfirm(reason)}>
            确认拒绝
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">
            拒贷具体原因（对应设备 / 行为 / 团伙 / 黑名单哪项风险）<span className="ml-1 text-rose-500">*</span>
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="请填写拒贷具体原因…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        <AttachmentDrop label="附件（可选）：留存风险证据截图" />
      </div>
    </Modal>
  )
}

// 4、提交双人复核
function SubmitDualReviewModal({
  row,
  open,
  onClose,
  onSubmit,
}: {
  row: FraudScheme3Row
  open: boolean
  onClose: () => void
  onSubmit: (note: string) => void
}) {
  const [note, setNote] = useState('')
  useEffect(() => {
    if (open) setNote('')
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`提交双人复核 · ${row.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" disabled={!note.trim()} onClick={() => onSubmit(note)}>
            提交推送
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">推送复核的理由、需要主管重点核查的风险点</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="请填写需主管重点核查的风险点与说明…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        <AttachmentDrop label="附件：打包当前全套欺诈报告（可选）" />
        <p className="text-xs text-slate-400">提交后工单锁定，流转至主管复核工作台，初审账号无法再编辑数据。</p>
      </div>
    </Modal>
  )
}

// 5、强制复审（推翻系统自动拒绝，放行工单，高敏感操作）
function ForceRecheckModal({
  row,
  open,
  onClose,
  onConfirm,
}: {
  row: FraudScheme3Row
  open: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
}) {
  const [reason, setReason] = useState('')
  const [agree, setAgree] = useState(false)
  useEffect(() => {
    if (open) {
      setReason('')
      setAgree(false)
    }
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`强制复审 · ${row.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" disabled={!reason.trim() || !agree} onClick={() => onConfirm(reason)}>
            确认强制放行
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          本操作豁免系统风控拦截，将推翻系统自动拒绝结论，请谨慎操作。
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-400">
            理由：详细写明系统拦截风险为误判的合理解释<span className="ml-1 text-rose-500">*</span>
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="请详细写明判定为误判的理由…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
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

/* ===================== 操作逻辑（列表行 / 详情栏共用） ===================== */
function fraudScheme3UseActions(
  row: FraudScheme3Row,
  onApply: (next: Partial<FraudScheme3Row>) => void,
  onView?: () => void,
  flash?: (m: string) => void,
) {
  const [modal, setModal] = useState<FraudScheme3OpKey | null>(null)
  const ops = fraudScheme3OpsFor(row.sysResult, row.workStatus)
  const locked = fraudScheme3ViewLocked(row.workStatus)

  const open = (op: FraudScheme3OpKey) => {
    if (op === 'view') {
      onView?.()
      return
    }
    setModal(op)
  }
  const close = () => setModal(null)

  const applyReportConfirm = (note: string) => {
    void note
    onApply({ workStatus: '已确认', operator: '初审：审核员 1' })
    flash?.('已提交整体报告确认，工单归档')
    close()
  }
  const applyForceRecheck = (reason: string) => {
    void reason
    onApply({ workStatus: '强制放行办结', operator: '初审：审核员 1；终审：主管 1' })
    flash?.('已强制放行，生成高亮敏感操作日志')
    close()
  }
  const applySubmitDual = (note: string) => {
    void note
    onApply({ workStatus: '已提交双人复核', operator: '初审：审核员 1' })
    flash?.('已提交双人复核，工单锁定流转至主管')
    close()
  }
  const applyConfirmPass = (note: string) => {
    void note
    onApply({ workStatus: '双人复核-通过', operator: '初审：审核员 1；终审：主管 1' })
    flash?.('双人复核通过，工单办结')
    close()
  }
  const applyConfirmReject = (reason: string) => {
    void reason
    onApply({ workStatus: '双人复核-拒绝', operator: '初审：审核员 1；终审：主管 1' })
    flash?.('双人复核拒绝，工单办结')
    close()
  }

  const renderModals = (
    <>
      <ReportConfirmModal row={row} open={modal === 'reportConfirm'} onClose={close} onConfirm={applyReportConfirm} />
      <ForceRecheckModal row={row} open={modal === 'forceRecheck'} onClose={close} onConfirm={applyForceRecheck} />
      <SubmitDualReviewModal row={row} open={modal === 'submitDual'} onClose={close} onSubmit={applySubmitDual} />
      <ConfirmPassModal row={row} open={modal === 'confirmPass'} onClose={close} onConfirm={applyConfirmPass} />
      <ConfirmRejectModal row={row} open={modal === 'confirmReject'} onClose={close} onConfirm={applyConfirmReject} />
    </>
  )

  return { ops, locked, open, renderModals }
}

function opVariant(op: FraudScheme3OpKey): 'primary' | 'secondary' | 'ghost' {
  if (op === 'forceRecheck' || op === 'confirmPass') return 'primary'
  return 'secondary'
}

/** 列表行操作按钮（不含状态标签，状态已在列中展示） */
export function FraudScheme3RowActions({
  row,
  onApply,
  onView,
  flash,
}: {
  row: FraudScheme3Row
  onApply: (next: Partial<FraudScheme3Row>) => void
  onView?: () => void
  flash?: (m: string) => void
}) {
  const { ops, locked, open, renderModals } = fraudScheme3UseActions(row, onApply, onView, flash)
  return (
    <>
      <div className="flex flex-wrap items-center justify-start gap-3">
        {ops.map((op) => {
          const isViewLocked = op === 'view' && locked
          return (
            <button
              key={op}
              type="button"
              disabled={isViewLocked}
              onClick={() => open(op)}
              className={`whitespace-nowrap text-xs font-medium ${
                isViewLocked ? 'cursor-not-allowed text-slate-300' : 'text-brand-600 hover:underline'
              }`}
            >
              {FRAUD_S3_OP_LABEL[op]}
            </button>
          )
        })}
      </div>
      {renderModals}
    </>
  )
}

/** 详情页操作栏（含系统结果 / 工单状态 / 操作人员 + 操作按钮，与列表一致） */
export function FraudScheme3ActionBar({
  row,
  onApply,
  onView,
  flash,
  showView = true,
}: {
  row: FraudScheme3Row
  onApply: (next: Partial<FraudScheme3Row>) => void
  onView?: () => void
  flash?: (m: string) => void
  showView?: boolean
}) {
  const base = fraudScheme3UseActions(row, onApply, onView, flash)
  const ops = showView ? base.ops : base.ops.filter((o) => o !== 'view')
  const { locked, open, renderModals } = base
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">系统结果</span>
          <FraudScheme3SysBadge value={row.sysResult} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">工单状态</span>
          <FraudScheme3WorkBadge value={row.workStatus} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">操作人员</span>
          <span className="text-sm text-slate-700">{row.operator}</span>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {ops.map((op) => {
            if (op === 'view') {
              return (
                <Button key={op} variant="secondary" disabled={locked} onClick={() => open(op)}>
                  {FRAUD_S3_OP_LABEL[op]}
                </Button>
              )
            }
            return (
              <Button key={op} variant={opVariant(op)} onClick={() => open(op)}>
                {FRAUD_S3_OP_LABEL[op]}
              </Button>
            )
          })}
        </div>
      </div>
      {renderModals}
    </div>
  )
}
