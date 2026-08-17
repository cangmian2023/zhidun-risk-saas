/* 企业风控子系统（v2 新 IA）· 路由中心
 * 所有 ep:* 非看板页面在此分发；看板类（ep:overview / ep:overview-realtime）由 EnterpriseDashboard 渲染。
 * 复用：企业档案（QiyePages）、数据看板模板（MidDashboardPage）。
 */
import { QiyeSearch, QiyeProfile } from './QiyePages';
import { EntGraphDetail, EntCreditReport, EntVerifyReport } from './EntReportPages';
import {
  EntQuickSearch, EntBatchDue, EntBatchDueDetail, EntMonitorList,
  EntDecisionEvents, EntDecisionTraceDetail,
  EntModelDetail, EntArchive, EntOperateLog,
} from './EnterprisePages';
import MidAlertWorkbench from './MidAlertWorkbench';
import ScoreModelManagePage from './ScoreModelManage';

export default function EnterpriseModule({ pageKey }: { pageKey: string }) {
  const cur = pageKey.split(':')[1] ?? 'overview';
  switch (cur) {
    case 'qiye-search':
      return <EntQuickSearch />;
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
      // 带 model 参数 → 模型详情；否则模型列表（共用评分产品「模型管理」页面，仅加载企业风控数据）
      return new URLSearchParams(window.location.search).get('model') ? <EntModelDetail /> : <ScoreModelManagePage domain="ep" />;
    case 'alert-workbench':
      return <MidAlertWorkbench domain="ep" />;
    case 'qiye-profile':
      // 企业档案详情：由「企业档案检索 / 企业一键风险查询」页的「查看档案」按钮进入（菜单入口已按需求删除，仅保留路由）
      return <QiyeProfile />;
    case 'archive':
      return <EntArchive />;
    case 'operate-log':
      return <EntOperateLog />;
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
