/* ============================================================================
 * 评分产品 · 处置流程（已统一至管理中心）
 * 预警处置流程由「管理中心 → 业务流程」配置（bizFlows.json · f-alert-dispose），
 * 本页仅作只读展示 + 跳转入口，不再持有独立流程数据。
 * 运行时消费方（预警处置工作台 / 预警详情 / 模型评分页）均读 f-alert-dispose。
 * ========================================================================== */
import { useNavigate } from 'react-router-dom';
import { useFlows, type FlowItem } from './flowStore';
import { PageShell } from './PageShell';
import { Panel, Button, Badge } from '../components/ui';

export default function ScoreDisposeFlowPage() {
  const flows = useFlows()
  const nav = useNavigate()
  const item: FlowItem | undefined = flows.find((f) => f.id === 'f-alert-dispose')

  const graphs = item?.flowGraphs ?? []

  return (
    <>
      <PageShell
        title="处置流程"
        crumb="评分产品 / 策略配置"
        actions={
          <Button size="sm" variant="primary" onClick={() => nav('/console/cm/biz-flow?id=f-alert-dispose')}>
            前往管理中心配置 →
          </Button>
        }
      />
      <div className="space-y-4">
        <Panel title="流程已统一到管理中心" >
          <p className="text-sm leading-relaxed text-slate-600">
            评分产品的预警处置流程已统一由「管理中心 → 业务流程」配置（流程 ID：<code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs">f-alert-dispose</code>），
            与预警处置工作台、预警详情、模型评分页「预警处置」共用同一份配置，改一处全局生效。
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => nav('/console/cm/biz-flow')}>管理中心 · 业务流程</Button>
            <Button size="sm" variant="ghost" onClick={() => nav('/console/sc/alert-workbench')}>预警处置工作台</Button>
          </div>
        </Panel>

        <Panel title={`预警处置流程 · 子流程一览（${graphs.length} 条）`} desc="按预警等级/类型自动匹配；编辑请前往管理中心">
          {graphs.length === 0 ? (
            <p className="text-sm text-slate-500">管理中心尚未配置「预警处置流程（f-alert-dispose）」，请先到管理中心创建。</p>
          ) : (
            <div className="space-y-3">
              {graphs.map((g, i) => {
                const steps = g.flowSteps ?? []
                const matchTxt = (g.match ?? [])
                  .map((m) => `${m.field}=${m.value}`)
                  .join(' 且 ')
                return (
                  <div key={i} className="rounded-xl border border-slate-200 p-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink-900">{g.name}</span>
                      <Badge kind="gray">match：{matchTxt || '全部'}</Badge>
                      <span className="text-xs text-slate-400">{steps.length} 步</span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-1.5">
                      {steps.map((s, j) => (
                        <span key={j} className="flex items-center gap-1.5">
                          <span
                            className="rounded-md px-2 py-0.5 text-xs font-medium"
                            style={{ background: (s.color ?? '#94A3B8') + '1a', color: s.color ?? '#475569' }}
                          >
                            {s.state}
                          </span>
                          {j < steps.length - 1 && <span className="text-slate-300">→</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Panel>
      </div>
    </>
  )
}
