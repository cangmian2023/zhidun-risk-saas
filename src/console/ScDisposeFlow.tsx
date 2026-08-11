/* ============================================================================
 * 评分产品 · 策略配置 · 处置流程
 * 复用管理中心「业务流程」库中已配置的「预警处置流程 (f-alert-dispose)」，
 * 直接以 FlowCanvasEditor 画布展示并编辑其首条流程图的节点与流转。
 * 保存经 patchFlowItemGraphs 写回 bizFlows.json（与 MidBizFlowConfig 同源）。
 * ========================================================================== */
import { PageHeader, Panel, Sam, Cal } from '../components/ui'
import FlowCanvasEditor from './FlowCanvasEditor'
import { useFlows, patchFlowItemGraphs } from './flowStore'
import type { FlowGraph } from './reportTemplateData'

const DISPOSE_FLOW_ID = 'f-alert-dispose'

export default function ScDisposeFlow() {
  const flows = useFlows()
  const item = flows.find((f) => f.id === DISPOSE_FLOW_ID)
  const graph: FlowGraph | undefined = item?.flowGraphs?.[0]

  if (!item || !graph) {
    return (
      <>
        <PageHeader title="处置流程" crumb="评分产品 / 策略配置" subtitle="预警处置节点与流转配置" />
        <Panel title="暂无处置流程配置">
          <p className="text-sm leading-relaxed text-slate-500">
            管理中心「业务流程」中尚未配置「预警处置流程（{DISPOSE_FLOW_ID}）」。
            请先到「管理中心 → 业务流程」创建并关联本页面，或确认 bizFlows.json 已包含该流程。
          </p>
        </Panel>
      </>
    )
  }

  return (
    <>
      <PageHeader
        title="处置流程"
        crumb="评分产品 / 策略配置"
        subtitle="预警处置节点与流转配置（复用流程画布），保存后实时生效于预警处置"
        actions={<><Sam label="配置" value="bizFlows.json" /><Cal label="实时" /></>}
      />
      <Panel title={item.name} desc="编辑节点与流转；其余分场景流程可在管理中心「业务流程」中维护">
        <FlowCanvasEditor
          graph={graph}
          onChange={(g) => patchFlowItemGraphs(item.id, [g, ...(item.flowGraphs?.slice(1) ?? [])])}
          readOnly={false}
          statusEnum={undefined}
          matchFieldOptions={[]}
          defaultSteps={[]}
        />
      </Panel>
    </>
  )
}
