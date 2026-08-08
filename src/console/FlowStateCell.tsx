// 列表页「流程状态」单元格（受控版 · 需求21补充/28改造/33操作列）
// 每个列表项传自己的 flowId + state（存各自样例 JSON，per-object 独立），
// 点按钮 → 弹确认弹窗 → onChange(next) 更新该项状态（不再改全局 flowState）
// buttonOnly：操作列模式，只渲染操作按钮（不含状态 pill，状态在「流程状态」列显示）
import { useState } from 'react'
import { useFlows, flowStepOf, stepColorOf, type FlowStep, type FlowItem } from './flowStore'
import { FlowConfirmModal } from './FlowConfirmModal'

export default function FlowStateCell({ flowId, state, onChange, buttonOnly = false }: {
  flowId?: string
  state?: string
  onChange?: (next: string) => void
  buttonOnly?: boolean
}) {
  const flows = useFlows()
  const f = flowId ? flows.find((x) => x.id === flowId) : undefined
  const [confirm, setConfirm] = useState<{ f: FlowItem; step: FlowStep } | null>(null)
  if (!f) return <span style={{ color: '#CBD5E1' }}>—</span>
  const { state: st, step } = flowStepOf({ flowSteps: f.flowSteps, flowState: state })
  const sc = step?.color ?? stepColorOf(st)

  if (buttonOnly) {
    // 操作列模式：只显示「当前可执行操作」按钮（终态无按钮）
    if (!step?.next || !onChange) return <span style={{ color: '#CBD5E1' }}>—</span>
    return (
      <>
        <button type="button" onClick={() => setConfirm({ f, step })}
          style={{ fontSize: 11, padding: '3px 10px', borderRadius: 4, border: 'none', cursor: 'pointer', background: '#2563EB', color: '#fff' }}>
          {step.action}
        </button>
        <FlowConfirmModal
          open={confirm != null}
          flowName={f.name}
          action={confirm?.step.action ?? ''}
          from={confirm ? flowStepOf({ flowSteps: confirm.f.flowSteps, flowState: state }).state : ''}
          to={confirm?.step.next ?? ''}
          onClose={() => setConfirm(null)}
          onConfirm={() => { if (confirm) onChange(confirm.step.next!); setConfirm(null) }}
        />
      </>
    )
  }

  return (
    <>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '2px 6px', whiteSpace: 'nowrap' }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: sc }}>{st}</span>
        {step?.next && onChange && (
          <button type="button" onClick={() => setConfirm({ f, step })}
            style={{ fontSize: 11, padding: '1px 9px', borderRadius: 4, border: 'none', cursor: 'pointer', background: '#2563EB', color: '#fff' }}>
            {step.action}
          </button>
        )}
      </div>
      <FlowConfirmModal
        open={confirm != null}
        flowName={f.name}
        action={confirm?.step.action ?? ''}
        from={confirm ? flowStepOf({ flowSteps: confirm.f.flowSteps, flowState: state }).state : ''}
        to={confirm?.step.next ?? ''}
        onClose={() => setConfirm(null)}
        onConfirm={() => { if (confirm) onChange(confirm.step.next!); setConfirm(null) }}
      />
    </>
  )
}
