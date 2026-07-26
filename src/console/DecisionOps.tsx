import { useState } from 'react'
import { Badge, Button, Modal, DecisionTag, StatusTag } from '../components/ui'
import { useModule } from '../store'
import {
  DecisionRow,
  DecisionSuggestion,
  ApprovalStatus,
  InfoResult,
  CreditGrade,
  FraudResult,
  AutoReview,
  ManualReview,
  approvalKind,
  autoReviewKind,
  manualReviewKind,
  gradeKind,
  fraudKind,
  RiskLevel,
} from './decisionReport'

// 统一风险/核验标签体系：信息核验结果 / 信用风险等级 / 欺诈风险等级 共用一套颜色语义
// 严重度：通过/低风险 → 绿；预警/中风险 → 琥珀；拒绝/高风险 → 橙；极高风险 → 红
const UNIFIED_KIND: Record<string, 'green' | 'amber' | 'orange' | 'red'> = {
  通过: 'green', 低风险: 'green',
  预警: 'amber', 中风险: 'amber',
  拒绝: 'orange', 高风险: 'orange',
  极高风险: 'red',
}

// ============================ 徽标（与列表/详情共用） ============================
// 决策建议：浅底描边体系（Badge）
export function DecisionSuggestionBadge({ v }: { v: DecisionSuggestion }) {
  const kind: 'green' | 'amber' | 'orange' | 'red' =
    v === '优先通过' || v === '通过' ? 'green' : v === '限制额度' ? 'amber' : v === '严格限制' ? 'orange' : 'red'
  return <Badge kind={kind}>{v}</Badge>
}
// 审批状态：描边 + 前置圆点体系（StatusTag）
export function DecisionApprovalBadge({ v }: { v: ApprovalStatus }) {
  return <StatusTag kind={approvalKind[v]}>{v}</StatusTag>
}
// 信息核验结果：实色填充体系（DecisionTag，与风险等级共用 UNIFIED_KIND）
export function DecisionInfoBadge({ v }: { v: InfoResult }) {
  return <DecisionTag kind={UNIFIED_KIND[v]}>{v}</DecisionTag>
}
export function DecisionGradeBadge({ v }: { v: CreditGrade }) {
  return <Badge kind={gradeKind[v]}>{v}</Badge>
}
export function DecisionFraudBadge({ v }: { v: FraudResult }) {
  return <Badge kind={fraudKind[v]}>{v}</Badge>
}
// 信用风险等级 / 欺诈风险等级：实色填充体系（DecisionTag，与信息核验共用 UNIFIED_KIND）
export function DecisionRiskBadge({ v }: { v: RiskLevel }) {
  return <DecisionTag kind={UNIFIED_KIND[v]}>{v}</DecisionTag>
}

export function DecisionAutoReviewBadge({ v }: { v: AutoReview }) {
  return <Badge kind={autoReviewKind[v]}>{v}</Badge>
}

export function DecisionManualReviewBadge({ v }: { v: ManualReview }) {
  return <StatusTag kind={manualReviewKind[v]}>{v}</StatusTag>
}

// ============================ 操作矩阵 ============================
export type DecisionActionKey = 'view' | 'audit' | 'submitReview' | 'return' | 'note'

// 列表「人工审核」状态机 -> 可执行操作（与审核流转表保持一致）
export type ReviewOpKey =
  | 'view'
  | 'reportConfirm' // 报告确认
  | 'forceRecheck'   // 强制复审
  | 'blacklist'      // 加入黑名单
  | 'submitDual'     // 提交双人复核
  | 'note'           // 录入备注
  | 'confirmPass'    // 确认放行
  | 'confirmReject'  // 确认拒绝

export function reviewOpsFor(m: ManualReview, s: DecisionSuggestion): { key: ReviewOpKey; label: string; disabled?: boolean }[] {
  const view = { key: 'view' as const, label: '查看' }
  const note = { key: 'note' as const, label: '录入备注' }
  switch (m) {
    case '核验计算中':
      return [{ key: 'view', label: '查看', disabled: true }]
    case '待确认':
      if (s === '通过') return [view, { key: 'reportConfirm', label: '报告确认' }]
      if (s === '严格限制') return [view, { key: 'reportConfirm', label: '报告确认' }, { key: 'forceRecheck', label: '强制复审' }]
      // 拒绝
      return [view, { key: 'reportConfirm', label: '报告确认' }, { key: 'blacklist', label: '加入黑名单' }]
    case '已确认':
    case '初审拒贷':
    case '强制放行':
    case '复核通过':
    case '复核拒绝':
    case '加入黑名单':
      return [view]
    case '待审核':
      return [view, { key: 'submitDual', label: '提交双人复核' }, note]
    case '提交复核':
      return [view, { key: 'confirmPass', label: '确认放行' }, { key: 'confirmReject', label: '确认拒绝' }, note]
  }
}

export function decisionOpsFor(_s: DecisionSuggestion, w: ApprovalStatus): DecisionActionKey[] {
  if (w === '已通过' || w === '已拒绝' || w === '已退回') return ['view']
  if (w === '已提交双人复核') return ['view'] // 双人复核中，仅可查看
  if (w === '待审批') return ['view', 'audit', 'return']
  // 审批中
  return ['view', 'submitReview', 'return']
}

const opLabel: Record<DecisionActionKey, string> = {
  view: '查看',
  audit: '审批',
  submitReview: '提交复核',
  return: '退回补充材料',
  note: '录入备注',
}

const RATE_OPTIONS = ['基准利率+5%', '基准利率+10%', '基准利率+15%', '基准利率+20%']
const RISK_FOCUS_OPTIONS = ['信用历史', '设备安全', '团伙关联', '信息异常', '还款能力']

export function DecisionRowActions({ row, onAction }: { row: DecisionRow; onAction: (k: DecisionActionKey) => void }) {
  const ops = decisionOpsFor(row.suggestion, row.approvalStatus)
  return (
    <div className="flex flex-wrap items-center justify-start gap-3">
      {ops.map((op) => (
        <button
          key={op}
          type="button"
          onClick={() => onAction(op)}
          className="whitespace-nowrap text-xs font-medium text-brand-600 hover:underline"
        >
          {opLabel[op]}
        </button>
      ))}
    </div>
  )
}

export function DecisionReviewActions({
  row,
  onView,
  onAction,
}: {
  row: DecisionRow
  onView: () => void
  onAction: (k: Exclude<ReviewOpKey, 'view'>) => void
}) {
  const ops = reviewOpsFor(row.manualReview, row.suggestion)
  return (
    <div className="flex flex-wrap items-center justify-start gap-3">
      {ops.map((op) =>
        op.key === 'view' ? (
          <button
            key="view"
            type="button"
            disabled={op.disabled}
            onClick={onView}
            className={
              op.disabled
                ? 'cursor-not-allowed text-xs font-medium text-slate-300'
                : 'whitespace-nowrap text-xs font-medium text-brand-600 hover:underline'
            }
          >
            {op.label}
          </button>
        ) : (
          <button
            key={op.key}
            type="button"
            onClick={() => onAction(op.key as Exclude<ReviewOpKey, 'view'>)}
            className="whitespace-nowrap text-xs font-medium text-brand-600 hover:underline"
          >
            {op.label}
          </button>
        ),
      )}
    </div>
  )
}

// ============================ 弹窗与操作链 ============================
interface DecisionModalState {
  key: 'audit' | 'submitReview' | 'return' | 'note'
  visible: boolean
}

export function useDecisionActions(row: DecisionRow | null, onApply: (patch: Partial<DecisionRow>) => void) {
  const flash = useModule().flash
  const [modal, setModal] = useState<DecisionModalState | null>(null)
  const [opinion, setOpinion] = useState('')
  const [note, setNote] = useState('')
  const [creditLimit, setCreditLimit] = useState('')
  const [rateFloat, setRateFloat] = useState('')
  const [riskFocus, setRiskFocus] = useState<string[]>([])
  const [fileName, setFileName] = useState('')

  const close = () => {
    setModal(null)
    setOpinion('')
    setNote('')
    setCreditLimit('')
    setRateFloat('')
    setRiskFocus([])
    setFileName('')
  }

  // 列表审核流转：直接生效的人工审核操作
  const applyByKey = (k: ReviewOpKey) => {
    if (!row) return
    switch (k) {
      case 'reportConfirm':
        if (row.suggestion === '通过') onApply({ manualReview: '已确认', operator: '初审：审核员 1' })
        else onApply({ manualReview: '初审拒贷', operator: '初审：审核员 1' })
        flash(`已对 ${row.id} 完成报告确认`)
        break
      case 'forceRecheck':
        flash(`已对 ${row.id} 发起强制复审`)
        break
      case 'blacklist':
        onApply({ manualReview: '加入黑名单', operator: '初审：审核员 1；终审：主管 1' })
        flash(`已将 ${row.id} 加入黑名单`)
        break
      case 'submitDual':
        onApply({ manualReview: '提交复核', operator: '初审：审核员 1' })
        flash(`已提交 ${row.id} 进入双人复核`)
        break
      case 'confirmPass':
        onApply({ manualReview: '复核通过', operator: '初审：审核员 1；终审：主管 1' })
        flash(`已确认放行 ${row.id}`)
        break
      case 'confirmReject':
        onApply({ manualReview: '复核拒绝', operator: '初审：审核员 1；终审：主管 1' })
        flash(`已确认拒绝并办结 ${row.id}`)
        break
    }
  }

  const run = (k: DecisionActionKey | ReviewOpKey) => {
    if (k === 'view') return
    if (k === 'audit' || k === 'submitReview' || k === 'return') {
      setModal({ key: k as DecisionModalState['key'], visible: true })
      return
    }
    if (k === 'note') {
      setModal({ key: 'note', visible: true })
      return
    }
    applyByKey(k)
  }

  const confirm = () => {
    if (!row || !modal) return
    switch (modal.key) {
      case 'audit': {
        onApply({ approvalStatus: '审批中', operator: '李娜' })
        const extra = [creditLimit && `额度¥${creditLimit}`, rateFloat && `利率${rateFloat}`, riskFocus.length && `关注点${riskFocus.join('/')}`]
          .filter(Boolean)
          .join('，')
        flash(`已对 ${row.id} 完成初审并进入审批中${extra ? `（${extra}）` : ''}`)
        break
      }
      case 'submitReview': {
        onApply({ approvalStatus: '已提交双人复核', operator: '李娜' })
        flash(`已提交 ${row.id} 进入双人复核`)
        break
      }
      case 'return': {
        onApply({ approvalStatus: '已退回', operator: '李娜' })
        flash(`已退回 ${row.id} 补充材料`)
        break
      }
      case 'note': {
        flash(`已为 ${row.id} 录入备注`)
        break
      }
    }
    close()
  }

  const Modal_ = modal && (
    <Modal
      title={
        modal.key === 'audit'
          ? '审批决策'
          : modal.key === 'submitReview'
          ? '提交双人复核'
          : modal.key === 'return'
          ? '退回补充材料'
          : '录入备注'
      }
      open={modal.visible}
      onClose={close}
      footer={
        <>
          <Button variant="ghost" onClick={close}>
            取消
          </Button>
          <Button variant="primary" onClick={confirm}>
            {modal.key === 'audit' ? '确认审批' : modal.key === 'submitReview' ? '确认提交' : modal.key === 'return' ? '确认退回' : '保存备注'}
          </Button>
        </>
      }
    >
      {modal.key === 'audit' && (
        <div className="space-y-3">
          <div className="text-sm text-slate-600">
            审批结论：<span className="font-medium text-ink-900">{row?.suggestion}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="mb-1 text-xs text-slate-400">授信额度（元）</div>
              <input
                type="number"
                value={creditLimit || (row ? String(row.approvedAmount) : '')}
                onChange={(e) => setCreditLimit(e.target.value)}
                placeholder="审批结论为通过/调整额度时必填"
                className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-400"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-400">利率浮动</div>
              <select
                value={rateFloat || '基准利率+10%'}
                onChange={(e) => setRateFloat(e.target.value)}
                className="h-9 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-violet-400"
              >
                {RATE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-400">风险关注点（多选）</div>
            <div className="flex flex-wrap gap-1.5">
              {RISK_FOCUS_OPTIONS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setRiskFocus((prev) => (prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]))}
                  className={`rounded-full px-2.5 py-1 text-xs transition ${
                    riskFocus.includes(f) ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-400">附件上传</div>
            <input
              type="file"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? '')}
              className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-1.5 file:text-xs file:text-violet-600"
            />
            {fileName && <div className="mt-1 text-xs text-slate-400">已选：{fileName}</div>}
          </div>
          <div>
            <div className="mb-1 text-xs text-slate-400">审批意见</div>
            <textarea
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
              placeholder="填写审批意见（必填）"
              className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
          </div>
        </div>
      )}
      {modal.key === 'submitReview' && (
        <p className="text-sm text-slate-600">该报告将进入双人复核流程，需另一名审批员复核推翻后方可调整结论。</p>
      )}
      {modal.key === 'return' && (
        <div>
          <div className="mb-1 text-xs text-slate-400">退回原因</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="说明退回补充材料的原因"
            className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>
      )}
      {modal.key === 'note' && (
        <div>
          <div className="mb-1 text-xs text-slate-400">备注内容</div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="填写内部备注"
            className="h-24 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
          />
        </div>
      )}
    </Modal>
  )

  return { run, Modal: Modal_ }
}

// ============================ 详情页底部操作栏 ============================
export function DecisionActionBar({ row, onAction }: { row: DecisionRow; onAction: (k: DecisionActionKey) => void }) {
  const ops = decisionOpsFor(row.suggestion, row.approvalStatus)
  const actionable = ops.filter((o) => o !== 'view')
  return (
    <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-slate-200 bg-white/95 px-6 py-3 backdrop-blur">
      {actionable.length === 0 && (
        <span className="mr-auto text-xs text-slate-400">当前状态「{row.approvalStatus}」仅可查看，无可执行操作。</span>
      )}
      {actionable.map((op) => (
        <Button key={op} variant={op === 'return' ? 'ghost' : 'primary'} onClick={() => onAction(op)}>
          {opLabel[op]}
        </Button>
      ))}
    </div>
  )
}
