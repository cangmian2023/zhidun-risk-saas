/* 评分产品子系统（v3 新 IA）· 路由中心
 * 所有 sc:* 页面统一在此分发；复用零售信贷的预警工作台与单客详情。
 * 看板页（总览/分布/命中/效果）= 配置驱动：读 midDashboards.json 的 sc:* 页面配置渲染；
 * 无配置时 MidDashboardPage 自带「暂无页面配置」空态。
 */
import ScoreRecordsPage from './ScoreRecords'
import ScoreCrowdPage from './ScoreCrowd'
import ScoreCustomerListPage from './ScoreCustomerList'
import ScoreModelManagePage from './ScoreModelManage'
import ScoreModelDetailPage from './ScoreModelDetail'
import ScoreDisposeFlowPage from './ScoreDisposeFlow'
import MidAlertWorkbench from './MidAlertWorkbench'
import MidDashboardPage from './MidDashboardPage'

/* 看板页：pageKey → 页面配置 key（管理中心页面配置里配置这些 key） */
const DASHBOARD_PAGES: Record<string, string> = {
  overview: 'sc:overview',
  'score-dist': 'sc:score-dist',
  'hit-analysis': 'sc:hit-analysis',
  'model-effect': 'sc:model-effect',
}

export default function ScoreModule({ pageKey }: { pageKey: string; search?: string }) {
  const cur = pageKey.split(':')[1] ?? 'overview'
  const dashKey = DASHBOARD_PAGES[cur]
  if (dashKey) return <MidDashboardPage pageKey={dashKey} crumbPrefix="评分产品" />
  switch (cur) {
    case 'alert-workbench':
      return <MidAlertWorkbench />
    case 'score-records':
      return <ScoreRecordsPage />
    case 'crowd-groups':
      return <ScoreCrowdPage />
    case 'customer-list':
      return <ScoreCustomerListPage />
    case 'model-manage':
      return <ScoreModelManagePage />
    case 'model-detail':
      return <ScoreModelDetailPage />
    case 'dispose-flow':
      return <ScoreDisposeFlowPage />
    default:
      return <MidDashboardPage pageKey="sc:overview" crumbPrefix="评分产品" />
  }
}
