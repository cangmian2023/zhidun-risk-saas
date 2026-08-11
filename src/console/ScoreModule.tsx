/* 评分产品子系统（v3 新 IA）· 路由中心
 * 所有 sc:* 页面统一在此分发；复用零售信贷的预警工作台与单客详情。
 */
import ScoreOverviewPage from './ScoreOverview'
import ScoreRecordsPage from './ScoreRecords'
import ScoreCrowdPage from './ScoreCrowd'
import ScoreCustomerListPage from './ScoreCustomerList'
import ScoreDist from './ScoreDist'
import ScoreHit from './ScoreHit'
import ScoreModelManagePage from './ScoreModelManage'
import ScoreModelDetailPage from './ScoreModelDetail'
import ScoreModelEffectPage from './ScoreModelEffect'
import ScoreThresholdPage from './ScoreThreshold'
import ScoreAlertRulePage from './ScoreAlertRule'
import ScoreDisposeFlowPage from './ScoreDisposeFlow'
import MidAlertWorkbench from './MidAlertWorkbench'

export default function ScoreModule({ pageKey }: { pageKey: string; search?: string }) {
  const cur = pageKey.split(':')[1] ?? 'overview'
  switch (cur) {
    case 'overview':
      return <ScoreOverviewPage />
    case 'alert-workbench':
      return <MidAlertWorkbench />
    case 'score-records':
      return <ScoreRecordsPage />
    case 'crowd-groups':
      return <ScoreCrowdPage />
    case 'customer-list':
      return <ScoreCustomerListPage />
    case 'score-dist':
      return <ScoreDist />
    case 'hit-analysis':
      return <ScoreHit />
    case 'model-manage':
      return <ScoreModelManagePage />
    case 'model-detail':
      return <ScoreModelDetailPage />
    case 'model-effect':
      return <ScoreModelEffectPage />
    case 'score-threshold':
      return <ScoreThresholdPage />
    case 'alert-rule':
      return <ScoreAlertRulePage />
    case 'dispose-flow':
      return <ScoreDisposeFlowPage />
    default:
      return <ScoreOverviewPage />
  }
}
