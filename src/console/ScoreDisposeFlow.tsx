import { useScore, updateScore } from './scoreData'
import { PageShell } from './PageShell'
import { Panel, Button } from '../components/ui'
import { Cfg } from './SourceTag'
import FlowCanvasEditor from './FlowCanvasEditor'

export default function ScoreDisposeFlowPage() {
  const data = useScore()
  const save = () => updateScore((d) => ({ ...d }))

  return (
    <>
      <PageShell
        title="处置流程配置"
        crumb="评分产品 / 策略配置"
        actions={<Button variant="primary" size="sm" onClick={save}>保存</Button>}
      />
      <div className="space-y-4">
        <Panel
          title="业务流程画布"
          desc="编辑处置节点与流转，保存后预警处置工作台实时生效"
          actions={<Cfg value="scoreData.json" />}
        >
          <FlowCanvasEditor graph={data.flow} onChange={(g) => updateScore((d) => ({ ...d, flow: g }))} />
        </Panel>
        <p className="text-xs text-slate-400">
          本流程在「预警处置」工作台实时生效，复用零售信贷的业务流程编排能力（FlowCanvasEditor）。
        </p>
      </div>
    </>
  )
}
