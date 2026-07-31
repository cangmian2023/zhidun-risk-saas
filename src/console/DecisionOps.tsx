import { useState, useEffect, useMemo } from 'react'
import { Badge, Button, Modal, DecisionTag, StatusTag } from '../components/ui'
import { ApprovalModal } from './ApprovalModal'
import { getDecisionAuditFlow, getAuditFlow, getSegmentButtons, resolveActions, DECISION_APPROVAL_MACHINE, DECISION_REVIEW_MACHINE, type ReviewResult } from './reportTemplateData'
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
  const locked = false // 查看在所有状态下均可用（不再置灰）
  return resolveActions(DECISION_REVIEW_MACHINE, { manualReview: m, suggestion: s }, { context: 'detail' }).map((a) => ({
    key: a.key as ReviewOpKey,
    label: a.label,
    disabled: locked,
  }))
}

export function decisionOpsFor(_s: DecisionSuggestion, w: ApprovalStatus): DecisionActionKey[] {
  return resolveActions(DECISION_APPROVAL_MACHINE, { suggestion: _s, approvalStatus: w }, { context: 'list' }).map(
    (a) => a.key as DecisionActionKey,
  )
}

const opLabel: Record<DecisionActionKey, string> = {
  view: '查看',
  audit: '审批',
  submitReview: '提交复核',
  return: '退回补充材料',
  note: '录入备注',
}

// 审批意见预设项中，含"调整/利率/额度/金额/期限/减免"等需填写具体值的，渲染输入框；其余（如"打回重审"）直接采用标签值
function opinionNeedsInput(label: string): boolean {
  return /调整|利率|额度|金额|期限|减免|降息|加息|上浮|下调/.test(label)
}

export function DecisionRowActions({ row, onAction, onSeg }: { row: DecisionRow; onAction: (k: DecisionActionKey) => void; onSeg?: (idx: number) => void }) {
  const ops = decisionOpsFor(row.suggestion, row.approvalStatus)
  const segmentButtons = useMemo(() => getSegmentButtons('decision', row.suggestion), [row.suggestion])
  // 查看在所有状态下均可用，且默认排在第一位
  const showView = ops.includes('view')
  const restOps = ops.filter((op) => op !== 'view' && op !== 'audit')
  return (
    <div className="flex flex-wrap items-center justify-start gap-3">
      {showView && (
        <button
          key="view"
          type="button"
          onClick={() => onAction('view')}
          className="whitespace-nowrap text-xs font-medium text-brand-600 hover:underline"
        >
          {opLabel['view']}
        </button>
      )}
      {segmentButtons.map((b) => (
        <button
          key={`seg-${b.idx}`}
          type="button"
          onClick={() => (onSeg ? onSeg(b.idx) : onAction('view'))}
          className="whitespace-nowrap text-xs font-medium text-brand-600 hover:underline"
        >
          {b.label}
        </button>
      ))}
      {restOps.map((op) => (
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
  // 审批弹窗与报告模板的审核流程配置对齐：依据报告 suggestion 取对应流程节点的审核事项/结果/意见预设
  const auditFlow = useMemo(() => (row ? getDecisionAuditFlow(row.suggestion) : null), [row?.suggestion])
  // 运行时「按分段渲染多按钮」：当前结论分段对应的全部触发按钮 + 各自审批弹窗
  const segmentButtons = useMemo(() => (row ? getSegmentButtons('decision', row.suggestion) : []), [row?.suggestion])
  const [segModal, setSegModal] = useState<number | null>(null)
  const openSeg = (idx: number) => setSegModal(idx)
  const closeSeg = () => setSegModal(null)
  const applySeg = (p: { result: ReviewResult; checks: string[]; opinionText: string; fileName: string }) => {
    if (!row) return
    const af = getAuditFlow('decision', row.suggestion, segModal ?? 0)
    const fallback: ApprovalStatus = p.result === '通过' ? '审批中' : p.result === '驳回' ? '已退回' : '已拒绝'
    onApply({ approvalStatus: ((af.resultStates?.[p.result] ?? fallback) as ApprovalStatus), operator: '李娜' })
    flash(`已审批（${p.result}）｜审核事项 ${p.checks.length} 项｜意见：${p.opinionText}${p.fileName ? `｜附件：${p.fileName}` : ''}`)
    closeSeg()
  }
  const segModalEl = (
    <ApprovalModal
      open={segModal !== null}
      title={`审批决策 · ${segModal !== null ? segmentButtons[segModal]?.label ?? '审批' : '审批'}`}
      conclusion={`案件结论：${row?.suggestion ?? ''}`}
      auditFlow={getAuditFlow('decision', row?.suggestion ?? '', segModal ?? 0)}
      onClose={closeSeg}
      onConfirm={applySeg}
    />
  )

  const [modal, setModal] = useState<DecisionModalState | null>(null)
  const [opinionKeys, setOpinionKeys] = useState<string[]>([])
  const [opinionValues, setOpinionValues] = useState<Record<string, string>>({})
  const [opinionExtra, setOpinionExtra] = useState('')
  const [note, setNote] = useState('')
  const [result, setResult] = useState<ReviewResult>('通过')
  const [checks, setChecks] = useState<string[]>([])
  const [fileName, setFileName] = useState('')

  // 弹窗打开到「审批决策」时，按当前流程配置初始化审批结果与审核事项
  useEffect(() => {
    if (modal?.key === 'audit' && auditFlow) {
      setResult(auditFlow.results[0])
      setChecks(auditFlow.checkItems)
    }
  }, [modal?.key, auditFlow])

  const close = () => {
    setModal(null)
    setOpinionKeys([])
    setOpinionValues({})
    setOpinionExtra('')
    setNote('')
    setResult('通过')
    setChecks([])
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
        const opinionText = [
          ...opinionKeys.map((k) => opinionValues[k] ?? k),
          ...(opinionExtra.trim() ? [opinionExtra.trim()] : []),
        ].join('；')
        const extra = [
          `结论：${result}`,
          auditFlow && checks.length && `审核事项 ${checks.length}/${auditFlow.checkItems.length}`,
          opinionText && `审批意见：${opinionText}`,
        ]
          .filter(Boolean)
          .join('，')
        flash(`已对 ${row.id} 完成初审并进入审批中（${extra}）`)
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
            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-500">流程节点：{auditFlow?.nodeLabel}</span>
          </div>

          {/* 审核事项：来自模板流程配置 checkItems */}
          <div>
            <div className="mb-1 text-xs text-slate-400">审核事项（按流程配置核对）</div>
            <div className="flex flex-wrap gap-1.5">
              {(auditFlow?.checkItems ?? []).map((c) => {
                const on = checks.includes(c)
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setChecks((p) => (on ? p.filter((x) => x !== c) : [...p, c]))}
                    className={`rounded-lg px-2.5 py-1 text-xs ring-1 ring-inset transition ${on ? 'bg-violet-50 text-violet-700 ring-violet-200' : 'bg-slate-50 text-slate-500 ring-slate-200 hover:bg-slate-100'}`}
                  >
                    {on ? '✓ ' : ''}{c}
                  </button>
                )
              })}
            </div>
          </div>

          {/* 审批结果：来自模板流程配置 results */}
          <div>
            <div className="mb-1 text-xs text-slate-400">审批结果（按流程配置可选）</div>
            <div className="flex flex-wrap gap-1.5">
              {(auditFlow?.results ?? []).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setResult(r)}
                  className={`rounded-full px-3 py-1 text-xs transition ${result === r ? 'bg-violet-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 审批意见：来自模板流程配置 opinionPresets[result]，多项可选、可填写 */}
          <div>
            <div className="mb-1 text-xs text-slate-400">审批意见（{result} 预设，可多选、可填写）</div>
            <div className="space-y-2">
              {((auditFlow?.opinionPresets ?? {})[result] ?? []).map((p) => {
                const on = opinionKeys.includes(p)
                const need = opinionNeedsInput(p)
                return (
                  <div key={p} className={`flex items-start gap-2 rounded-lg border px-2.5 py-2 transition ${on ? 'border-violet-200 bg-violet-50/50' : 'border-slate-200'}`}>
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        setOpinionKeys((p2) => {
                          if (p2.includes(p)) return p2.filter((x) => x !== p)
                          setOpinionValues((m) => ({ ...m, [p]: m[p] ?? p }))
                          return [...p2, p]
                        })
                      }
                      className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-violet-600"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm text-slate-700">{p}</div>
                      {on && need && (
                        <input
                          value={opinionValues[p] ?? ''}
                          onChange={(e) => setOpinionValues((m) => ({ ...m, [p]: e.target.value }))}
                          placeholder={`请输入「${p}」的具体内容`}
                          className="mt-1 h-8 w-full rounded-md border border-slate-300 px-2 text-xs outline-none focus:border-violet-400"
                        />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <textarea
              value={opinionExtra}
              onChange={(e) => setOpinionExtra(e.target.value)}
              placeholder="其他审批意见（可自填）"
              className="mt-2 h-16 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400"
            />
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

  return { run, Modal: Modal_, segmentButtons, openSeg, segModalEl }
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
