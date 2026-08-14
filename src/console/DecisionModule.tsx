// 决策引擎子系统 · 路由分发（对应菜单 de:*）
import { DecisionWorkbenchPage, DecisionMonitorPage, DecisionAnalysisPage, DecisionRuleHitPage, DecisionLogPage, DecisionAlertPage } from './DecisionPages'
import { DecisionModelManagePage, DecisionModelDetailPage, DecisionModelTestPage, DecisionFlowEditPage } from './DecisionModelPages'
import DecisionPolicyEditPage from './DecisionPolicyEdit'
import { DecisionFeatureLibPage, DecisionFeatureMonitorPage, DecisionListLibPage, DecisionTemplateMarketPage, DecisionTemplateDetailPage } from './DecisionBuildPages'
import { DecisionVersionPage, DecisionTrafficPage, DecisionReplayPage, DecisionReplayResultPage, DecisionBatchPage, DecisionApprovalPage } from './DecisionRunPages'

export default function DecisionModule({ pageKey, search }: { pageKey: string; search: string }) {
  const cur = pageKey.split(':')[1]
  switch (cur) {
    case 'overview': return <DecisionWorkbenchPage />
    case 'model-manage': return <DecisionModelManagePage />
    case 'model-detail': return <DecisionModelDetailPage search={search} />
    case 'model-test': return <DecisionModelTestPage search={search} />
    case 'flow-edit': return <DecisionFlowEditPage search={search} />
    case 'policy-edit': return <DecisionPolicyEditPage search={search} />
    case 'feature-lib': return <DecisionFeatureLibPage />
    case 'feature-monitor': return <DecisionFeatureMonitorPage />
    case 'list-lib': return <DecisionListLibPage />
    case 'template-market': return <DecisionTemplateMarketPage />
    case 'template-detail': return <DecisionTemplateDetailPage search={search} />
    case 'version-manage': return <DecisionVersionPage />
    case 'traffic-split': return <DecisionTrafficPage />
    case 'decision-replay': return <DecisionReplayPage />
    case 'replay-result': return <DecisionReplayResultPage search={search} />
    case 'batch-decision': return <DecisionBatchPage />
    case 'monitor-board': return <DecisionMonitorPage />
    case 'alert-manage': return <DecisionAlertPage />
    case 'decision-analysis': return <DecisionAnalysisPage />
    case 'rule-hit': return <DecisionRuleHitPage />
    case 'decision-log': return <DecisionLogPage />
    case 'approval-manage': return <DecisionApprovalPage />
    default: return <DecisionWorkbenchPage />
  }
}
