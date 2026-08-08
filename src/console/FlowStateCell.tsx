// 列表页「流程状态」单元格（受控版 · 需求21补充/28改造/33操作列/16匹配具体流程）
// 每个列表项传自己的 flowId + state（存各自样例 JSON，per-object 独立），
// 点按钮 → 弹确认弹窗 → onChange(next) 更新该项状态（不再改全局 flowState）
// matchObj（需求16）：对象字段值（如 level/alert_type），用于从配置的多条具体流程中匹配出该对象对应的流程；
//   匹配不到（方案B）→ 显示「—」；不传 matchObj 时回退配置级状态机（兼容旧流程）
// buttonOnly：操作列模式，只渲染操作按钮（不含状态 pill，状态在「流程状态」列显示）
import { useState } from 'react'
import { useFlows, flowStepOf, matchFlowGraph, stepColorOf, type FlowStep, type FlowItem } from './flowStore'
import { FlowConfirmModal } from './FlowConfirmModal'

export default function FlowStateCell({ flowId, state, onChange, buttonOnly = false, matchObj }: {
  flowId?: string
  state?: string
  onChange?: (next: string) => void
  buttonOnly?: boolean
  matchObj?: Record<string, unknown>  // 需求16：对象字段值，用于匹配具体流程
}) {
  const flows = useFlows()
  const f = flowId ? flows.find((x) => x.id === flowId) : undefined
  // 需求16：按对象字段匹配具体流程（flowGraph）；匹配不到 → steps 为空 → 显示 —
  const { steps, name } = matchFlowGraph(f, matchObj ?? {})
  const [confirm, setConfirm] = useState<{ f: FlowItem; step: FlowStep } | null>(null)
  if (!f) return <span style={{ color: '#CBD5E1' }}>—</span>
  if (!steps.length) return <span style={{ color: '#CBD5E1' }}>—</span> // 方案B：无匹配流程
  const { state: st, step } = flowStepOf({ flowSteps: steps, flowState: state })
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
          flowName={name || f.name}
          action={confirm?.step.action ?? ''}
          from={confirm ? flowStepOf({ flowSteps, flowState: state }).state : ''}
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
        flowName={name || f.name}
        action={confirm?.step.action ?? ''}
        from={confirm ? flowStepOf({ flowSteps, flowState: state }).state : ''}
        to={confirm?.step.next ?? ''}
        onClose={() => setConfirm(null)}
        onConfirm={() => { if (confirm) onChange(confirm.step.next!); setConfirm(null) }}
      />
    </>
  )
}
