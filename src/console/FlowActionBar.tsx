// 流程操作行（受控版 · 需求21/28/29）
//  - 保存按钮：页面有编辑功能才显示（onSave 传入）
//  - 流程按钮 + 状态标签：按 flowId 关联 bizFlows 中的流程定义（name/flowSteps），
//    当前状态由外部传入（state = 该对象自己的流程状态，存各自样例 JSON，per-object 独立），
//    点按钮 → 弹确认弹窗 → onStateChange(next) 更新该对象状态（不再改全局 flowState）
//  - 无关联流程且无保存按钮 → 整个控件隐藏（如纯数据看板）
import { useState } from 'react'
import { useFlows, flowStepOf, stepColorOf, type FlowStep, type FlowItem } from './flowStore'
import { FlowConfirmModal } from './FlowConfirmModal'

export default function FlowActionBar({ flowId, state, onStateChange, onSave, saveLabel = '保存' }: {
  flowId?: string
  state?: string            // 该对象当前流程状态（受控，来自对象自己的样例 JSON）
  onStateChange?: (next: string) => void
  onSave?: () => void
  saveLabel?: string
}) {
  const flows = useFlows()
  const f = flowId ? flows.find((x) => x.id === flowId) : undefined
  const [confirm, setConfirm] = useState<{ f: FlowItem; step: FlowStep } | null>(null)
  if (!f && !onSave) return null // 无关联流程且无编辑 → 整行隐藏

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10, padding: '8px 12px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
      {onSave && (
        <button type="button" onClick={onSave}
          style={{ height: 28, padding: '0 16px', fontSize: 12, fontWeight: 600, borderRadius: 8, border: 'none', cursor: 'pointer', background: '#2563EB', color: '#fff' }}>
          {saveLabel}
        </button>
      )}
      {f && (() => {
        const { state: st, step } = flowStepOf({ flowSteps: f.flowSteps, flowState: state })
        const sc = step?.color ?? stepColorOf(st)
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '3px 8px' }}>
            <span style={{ fontSize: 12, color: '#64748B' }}>{f.name}</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600, color: sc, background: `${sc}1A`, borderRadius: 10, padding: '1px 9px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc, display: 'inline-block' }} />
              {st}
            </span>
            {step?.next && onStateChange && (
              <button type="button" onClick={() => setConfirm({ f, step })}
                style={{ height: 22, padding: '0 12px', fontSize: 12, borderRadius: 6, border: 'none', cursor: 'pointer', background: '#2563EB', color: '#fff', fontWeight: 500 }}>
                {step.action}
              </button>
            )}
          </span>
        )
      })()}
      <FlowConfirmModal
        open={confirm != null}
        flowName={confirm?.f.name ?? ''}
        action={confirm?.step.action ?? ''}
        from={confirm ? flowStepOf({ flowSteps: confirm.f.flowSteps, flowState: state }).state : ''}
        to={confirm?.step.next ?? ''}
        onClose={() => setConfirm(null)}
        onConfirm={() => { if (confirm) onStateChange?.(confirm.step.next!); setConfirm(null) }}
      />
    </div>
  )
}
