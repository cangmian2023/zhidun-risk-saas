/* 企业风控子系统（v2 新 IA）· 路由中心
 * 所有 ep:* 非看板页面在此分发；看板类（ep:overview / ep:overview-realtime）由 EnterpriseDashboard 渲染。
 * 复用：企业档案（QiyePages）、数据看板模板（MidDashboardPage）。
 */
import { QiyeSearch, QiyeProfile } from './QiyePages';
import { EntGraphDetail, EntCreditReport, EntVerifyReport } from './EntReportPages';
import {
  EntQuickSearch, EntRiskProfile, EntBatchDue, EntBatchDueDetail, EntMonitorList,
  EntDecisionEvents, EntDecisionTraceDetail,
  EntModelList, EntModelDetail, EntListManage, EntDataSource,
  EntAlertRule, EntAlertWorkbench, EntArchive, EntOperateLog, EntTodoCenter, EntSyncTask,
} from './EnterprisePages';

export default function EnterpriseModule({ pageKey }: { pageKey: string }) {
  const cur = pageKey.split(':')[1] ?? 'overview';
  switch (cur) {
    case 'qiye-search':
      return <EntQuickSearch />;
    case 'qiye-profile':
      return <EntRiskProfile />;
    case 'batch-due':
      return <EntBatchDue />;
    case 'batch-due-detail':
      return <EntBatchDueDetail />;
    case 'monitor-list':
      return <EntMonitorList />;
    case 'decision-events':
      return <EntDecisionEvents />;
    case 'decision-trace':
      return <EntDecisionTraceDetail />;
    case 'model-list':
      // 带 model 参数 → 模型详情；否则模型列表
      return new URLSearchParams(window.location.search).get('model') ? <EntModelDetail /> : <EntModelList />;
    case 'list-manage':
      return <EntListManage />;
    case 'datasource':
      return <EntDataSource />;
    case 'alert-rule':
      return <EntAlertRule />;
    case 'alert-workbench':
      return <EntAlertWorkbench />;
    case 'archive':
      return <EntArchive />;
    case 'operate-log':
      return <EntOperateLog />;
    case 'todo-center':
      return <EntTodoCenter />;
    case 'sync-task':
      return <EntSyncTask />;
    case 'ent-graph-detail':
      return <EntGraphDetail />;
    case 'ent-credit-detail':
      return <EntCreditReport />;
    case 'ent-verify-detail':
      return <EntVerifyReport />;
    default:
      return <QiyeSearch />;
  }
}
