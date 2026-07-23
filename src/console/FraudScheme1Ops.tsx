// 欺诈识别（方案1）· 状态/操作矩阵与操作弹窗
// 框架与信息核验 VerifyOps 完全对齐：系统自动判定 × 工单人工状态 → 操作按钮；列表与详情共用
import { useEffect, useState } from 'react'
import { Badge, Button, Modal } from '../components/ui'

/* ===================== 状态模型 ===================== */
// 自动欺诈判定（DecisionTag 实色胶囊）
export type FraudSysResult = '处理中' | '无风险' | '确认欺诈' | '可疑'
// 人工审核（StatusTag 带点描边）
export type FraudWorkStatus =
  | '欺诈评估中'
  | '待确认'
  | '已排除'
  | '已确认'
  | '已加入黑名单办结'
  | '待复审'
  | '已提交双人复核'
  | '双人复核-排除'
  | '双人复核-确认欺诈'
  | '已标记观察'

export interface FraudRow {
  id: string
  name: string
  product: string
  channel: string
  amount: number
  fraudScore: number
  creditScore: number
  sysResult: FraudSysResult
  workStatus: FraudWorkStatus
  operator: string
  auditTime: string
}

export type FraudOpKey =
  | 'view'
  | 'excludeFraud'
  | 'confirmFraud'
  | 'forceBlacklist'
  | 'submitDual'
  | 'markObserve'

export const FRAUD_OP_LABEL: Record<FraudOpKey, string> = {
  view: '查看',
  excludeFraud: '排除欺诈',
  confirmFraud: '确认欺诈',
  forceBlacklist: '强制加入黑名单',
  submitDual: '提交双人复核',
  markObserve: '标记观察',
}

/** 按（系统自动判定 × 工单人工状态）推导该工单可执行的按钮 */
export function fraudOpsFor(sys: FraudSysResult, work: FraudWorkStatus): FraudOpKey[] {
  if (work === '欺诈评估中') return ['view'] // 接口计算中：仅查看（置灰）
  if (sys === '无风险') {
    return work === '待确认' ? ['view', 'excludeFraud'] : ['view'] // 待确认=排除欺诈；已排除=闭环
  }
  if (sys === '确认欺诈') {
    if (work === '待确认') return ['view', 'confirmFraud', 'forceBlacklist'] // 确认欺诈 / 强制加入黑名单
    return ['view'] // 已确认 / 已加入黑名单办结 = 闭环
  }
  // 可疑：待复审 提交双人复核 + 标记观察；已提交双人复核 由主管终审排除/确认欺诈
  if (work === '待复审') return ['view', 'submitDual', 'markObserve']
  if (work === '已提交双人复核') return ['view', 'excludeFraud', 'confirmFraud']
  return ['view'] // 双人复核-排除 / 双人复核-确认欺诈 / 已标记观察 = 已办结
}

export function fraudViewLocked(work: FraudWorkStatus): boolean {
  return work === '欺诈评估中'
}

const FRAUD_SYS_KIND: Record<FraudSysResult, 'gray' | 'green' | 'red' | 'amber'> = {
  处理中: 'gray',
  无风险: 'green',
  确认欺诈: 'red',
  可疑: 'amber',
}
const FRAUD_WORK_KIND: Record<FraudWorkStatus, 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
  欺诈评估中: 'gray',
  待确认: 'blue',
  已排除: 'green',
  已确认: 'red',
  已加入黑名单办结: 'violet',
  待复审: 'amber',
  已提交双人复核: 'amber',
  '双人复核-排除': 'green',
  '双人复核-确认欺诈': 'red',
  已标记观察: 'amber',
}

export function FraudSysBadge({ value }: { value: FraudSysResult }) {
  return <Badge kind={FRAUD_SYS_KIND[value]}>{value}</Badge>
}
export function FraudWorkBadge({ value }: { value: FraudWorkStatus }) {
  return <Badge kind={FRAUD_WORK_KIND[value]}>{value}</Badge>
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

/* ===================== 五个操作弹窗 ===================== */

// 1、排除欺诈（人工判定非欺诈）
function ExcludeFraudModal({
  row,
  open,
  onClose,
  onConfirm,
}: {
  row: FraudRow
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
      title={`排除欺诈 · ${row.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" disabled={!note.trim()} onClick={() => onConfirm(note)}>提交排除</Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">
            排除依据（说明判定为误报/非欺诈的理由）<span className="ml-1 text-rose-500">*</span>
          </p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="请填写排除欺诈的依据…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        <AttachmentDrop label="附件（可选）：留存排除佐证材料" />
        <p className="text-xs text-slate-400">提交后工单置「已排除」，欺诈预警解除。</p>
      </div>
    </Modal>
  )
}

// 2、确认欺诈（人工判定欺诈）
function ConfirmFraudModal({
  row,
  open,
  onClose,
  onConfirm,
}: {
  row: FraudRow
  open: boolean
  onClose: () => void
  onConfirm: (type: string, reason: string) => void
}) {
  const [type, setType] = useState('')
  const [reason, setReason] = useState('')
  useEffect(() => {
    if (open) {
      setType('')
      setReason('')
    }
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`确认欺诈 · ${row.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>关闭</Button>
          <Button variant="primary" disabled={!type || !reason.trim()} onClick={() => onConfirm(type, reason)}>
            确认欺诈
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">欺诈类型<span className="ml-1 text-rose-500">*</span></p>
          <div className="flex flex-wrap gap-2">
            {['申请欺诈', '信用欺诈', '团伙欺诈', '材料伪造', '其他'].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  type === t ? 'border-rose-400 bg-rose-50 text-rose-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-400">
            欺诈证据说明<span className="ml-1 text-rose-500">*</span>
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="请填写确认欺诈的具体证据…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        <AttachmentDrop required label="强制上传：欺诈证据截图/流水" />
      </div>
    </Modal>
  )
}

// 3、强制加入黑名单（高敏感）
function ForceBlacklistModal({
  row,
  open,
  onClose,
  onConfirm,
}: {
  row: FraudRow
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
      title={`强制加入黑名单 · ${row.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" disabled={!reason.trim() || !agree} onClick={() => onConfirm(reason)}>
            确认加入黑名单
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
          本操作将用户标记加入内部黑名单并直接办结，属高敏感操作，请谨慎执行。
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-400">
            黑名单原因（必填）<span className="ml-1 text-rose-500">*</span>
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            placeholder="请填写加入黑名单的原因…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        <AttachmentDrop required label="必传佐证材料" />
        <label className="flex items-start gap-2 text-xs text-slate-600">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5" />
          <span>知悉本次操作将标记客户为欺诈并加入黑名单，本人承担对应风控责任</span>
        </label>
      </div>
    </Modal>
  )
}

// 4、提交双人复核（与信息核验一致）
function SubmitDualReviewModal({
  row,
  open,
  onClose,
  onSubmit,
}: {
  row: FraudRow
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
          <p className="mb-2 text-xs text-slate-400">推送复核的理由、需要主管重点核查的欺诈点</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="请填写需主管重点核查的欺诈点与说明…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        <AttachmentDrop label="附件：打包当前全套反欺诈报告（可选）" />
        <p className="text-xs text-slate-400">提交后工单锁定，流转至主管复核工作台，初审账号无法再编辑数据。</p>
      </div>
    </Modal>
  )
}

// 5、标记观察（可疑但无确凿证据，加入观察名单）
function MarkObserveModal({
  row,
  open,
  onClose,
  onConfirm,
}: {
  row: FraudRow
  open: boolean
  onClose: () => void
  onConfirm: (period: string, note: string) => void
}) {
  const [period, setPeriod] = useState('30')
  const [note, setNote] = useState('')
  useEffect(() => {
    if (open) {
      setPeriod('30')
      setNote('')
    }
  }, [open])
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`标记观察 · ${row.id}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" disabled={!note.trim()} onClick={() => onConfirm(period, note)}>
            加入观察名单
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">观察期</p>
          <div className="flex gap-2">
            {['15', '30', '60', '90'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`rounded-lg border px-3 py-1.5 text-xs transition ${
                  period === p ? 'border-amber-400 bg-amber-50 text-amber-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {p} 天
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-400">观察说明（疑似异常但无确凿证据）</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="请填写标记观察的原因…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        <p className="text-xs text-slate-400">提交后工单置「已标记观察」，观察期内持续监控，可后续流转至排除或确认欺诈。</p>
      </div>
    </Modal>
  )
}

/* ===================== 操作逻辑（列表行 / 详情栏共用） ===================== */
function useFraudActions(
  row: FraudRow,
  onApply: (next: Partial<FraudRow>) => void,
  onView?: () => void,
  flash?: (m: string) => void,
) {
  const [modal, setModal] = useState<FraudOpKey | null>(null)
  const ops = fraudOpsFor(row.sysResult, row.workStatus)
  const locked = fraudViewLocked(row.workStatus)

  const open = (op: FraudOpKey) => {
    if (op === 'view') {
      onView?.()
      return
    }
    setModal(op)
  }
  const close = () => setModal(null)

  const applyExcludeFraud = (note: string) => {
    void note
    onApply({ workStatus: '已排除', operator: '初审：审核员 1' })
    flash?.('已排除欺诈，预警解除')
    close()
  }
  const applyConfirmFraud = (type: string, reason: string) => {
    void type
    void reason
    onApply({ workStatus: '已确认', operator: '初审：审核员 1；终审：主管 1' })
    flash?.('已确认欺诈，工单办结')
    close()
  }
  const applyForceBlacklist = (reason: string) => {
    void reason
    onApply({ workStatus: '已加入黑名单办结', operator: '初审：审核员 1；终审：主管 1' })
    flash?.('已强制加入黑名单并办结（高敏感）')
    close()
  }
  const applySubmitDual = (note: string) => {
    void note
    onApply({ workStatus: '已提交双人复核', operator: '初审：审核员 1' })
    flash?.('已提交双人复核，工单锁定流转至主管')
    close()
  }
  const applyMarkObserve = (period: string, note: string) => {
    void period
    void note
    onApply({ workStatus: '已标记观察', operator: '初审：审核员 1' })
    flash?.('已加入观察名单，观察期内持续监控')
    close()
  }

  const renderModals = (
    <>
      <ExcludeFraudModal row={row} open={modal === 'excludeFraud'} onClose={close} onConfirm={applyExcludeFraud} />
      <ConfirmFraudModal row={row} open={modal === 'confirmFraud'} onClose={close} onConfirm={applyConfirmFraud} />
      <ForceBlacklistModal row={row} open={modal === 'forceBlacklist'} onClose={close} onConfirm={applyForceBlacklist} />
      <SubmitDualReviewModal row={row} open={modal === 'submitDual'} onClose={close} onSubmit={applySubmitDual} />
      <MarkObserveModal row={row} open={modal === 'markObserve'} onClose={close} onConfirm={applyMarkObserve} />
    </>
  )

  return { ops, locked, open, renderModals }
}

function opVariant(op: FraudOpKey): 'primary' | 'secondary' | 'ghost' {
  if (op === 'confirmFraud' || op === 'forceBlacklist') return 'primary'
  return 'secondary'
}

/** 列表行操作按钮（不含状态标签，状态已在列中展示） */
export function FraudRowActions({
  row,
  onApply,
  onView,
  flash,
}: {
  row: FraudRow
  onApply: (next: Partial<FraudRow>) => void
  onView?: () => void
  flash?: (m: string) => void
}) {
  const { ops, locked, open, renderModals } = useFraudActions(row, onApply, onView, flash)
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
              {FRAUD_OP_LABEL[op]}
            </button>
          )
        })}
      </div>
      {renderModals}
    </>
  )
}

/** 详情页操作栏（含系统结果 / 工单状态 / 操作人员 + 操作按钮，与列表一致） */
export function FraudActionBar({
  row,
  onApply,
  onView,
  flash,
  showView = true,
}: {
  row: FraudRow
  onApply: (next: Partial<FraudRow>) => void
  onView?: () => void
  flash?: (m: string) => void
  showView?: boolean
}) {
  const base = useFraudActions(row, onApply, onView, flash)
  const ops = showView ? base.ops : base.ops.filter((o) => o !== 'view')
  const { locked, open, renderModals } = base
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">系统结果</span>
          <FraudSysBadge value={row.sysResult} />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">工单状态</span>
          <FraudWorkBadge value={row.workStatus} />
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
                  {FRAUD_OP_LABEL[op]}
                </Button>
              )
            }
            return (
              <Button key={op} variant={opVariant(op)} onClick={() => open(op)}>
                {FRAUD_OP_LABEL[op]}
              </Button>
            )
          })}
        </div>
      </div>
      {renderModals}
    </div>
  )
}
