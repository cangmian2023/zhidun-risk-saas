// 生成 50 个零售信贷金融风控 SaaS 页面配置（看板）
// 引用现有 7 个数据源(midDataSources.json) + 200 指标(midMetrics.json)
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..', '..');
const ds = require(path.join(root, 'src/console/midDataSources.json'));
const metrics = require(path.join(root, 'src/console/midMetrics.json'));

const dsById = Object.fromEntries(ds.map((d) => [d.id, d]));
const CAT = ['risk_level', 'product', 'scene', 'level', 'country', 'month'];

const defs = [
  ['客群画像总览', '客群', 'ds_customer', '客群'],
  ['新客获取分析', '客群', 'ds_customer', '客群'],
  ['活跃客群监控', '客群', 'ds_customer', '客群'],
  ['客群分层看板', '客群', 'ds_customer', '客群'],
  ['高价值客群洞察', '客群', 'ds_customer', '客群'],
  ['风险总览驾驶舱', '风险', 'ds_alert', '风险'],
  ['信用风险评估', '风险', 'ds_loan', '风险'],
  ['风险等级分布', '风险', 'ds_alert', '风险'],
  ['风险趋势监控', '风险', 'ds_behavior', '风险'],
  ['风险敞口看板', '风险', 'ds_loan', '风险'],
  ['贷后风险预警', '风险', 'ds_alert', '风险'],
  ['红黄灯预警', '预警', 'ds_alert', '预警'],
  ['预警等级分布', '预警', 'ds_alert', '预警'],
  ['预警处置时效', '预警', 'ds_alert', '预警'],
  ['预警来源分析', '预警', 'ds_alert', '预警'],
  ['处置闭环总览', '处置', 'ds_alert', '处置'],
  ['处置策略效果', '处置', 'ds_alert', '处置'],
  ['自动处置监控', '处置', 'ds_alert', '处置'],
  ['处置工单分析', '处置', 'ds_alert', '处置'],
  ['授信审批监控', '授信', 'ds_loan', '授信'],
  ['授信额度使用', '授信', 'ds_loan', '授信'],
  ['授信政策效果', '授信', 'ds_loan', '授信'],
  ['授信通过率分析', '授信', 'ds_loan', '授信'],
  ['授信客群分析', '授信', 'ds_customer', '授信'],
  ['贷款业务总览', '贷款', 'ds_loan', '贷款'],
  ['贷款余额监控', '贷款', 'ds_loan', '贷款'],
  ['贷款逾期分析', '贷款', 'ds_loan', '贷款'],
  ['贷款质量看板', '贷款', 'ds_loan', '贷款'],
  ['还款行为分析', '贷款', 'ds_behavior', '贷款'],
  ['贷款发放趋势', '贷款', 'ds_loan', '贷款'],
  ['客户行为分析', '行为', 'ds_behavior', '行为'],
  ['行为评分监控', '行为', 'ds_behavior', '行为'],
  ['行为趋势看板', '行为', 'ds_behavior', '行为'],
  ['用信行为分析', '行为', 'ds_behavior', '行为'],
  ['沉睡客户预警', '行为', 'ds_behavior', '行为'],
  ['欺诈风险总览', '欺诈', 'ds_api_demo', '欺诈'],
  ['欺诈识别监控', '欺诈', 'ds_api_demo', '欺诈'],
  ['欺诈案件分析', '欺诈', 'ds_api_demo', '欺诈'],
  ['设备指纹风险', '欺诈', 'ds_api_demo', '欺诈'],
  ['异常行为预警', '欺诈', 'ds_api_demo', '欺诈'],
  ['营销活动效果', '营销', 'ds_customer', '营销'],
  ['营销机会挖掘', '营销', 'ds_customer', '营销'],
  ['营销响应分析', '营销', 'ds_customer', '营销'],
  ['精准营销看板', '营销', 'ds_customer', '营销'],
  ['客户生命周期', '营销', 'ds_customer', '营销'],
  ['合规指标监控', '合规', 'ds_sql_demo', '合规'],
  ['监管报送看板', '合规', 'ds_sql_demo', '合规'],
  ['合规风险预警', '合规', 'ds_sql_demo', '合规'],
  ['事件分析总览', '事件分析', 'ds_event', '事件分析'],
  ['用户启动时长分析', '事件分析', 'ds_event', '事件分析'],
];

function metricsOf(g) { const m = metrics.filter((x) => x.group === g); return m.length ? m : metrics; }
function catDim(d) { return CAT.find((c) => d.fields.some((f) => f.key === c)); }

const dashboards = defs.map(([name, group, dsId, tg], i) => {
  const source = dsById[dsId];
  const ms = metricsOf(tg);
  const m0 = ms[0], m1 = ms[1] || ms[0];
  const cd = catDim(source);
  const widgets = [];
  let wi = 1;
  if (cd) {
    widgets.push({ id: 'w' + wi++, type: 'donut', title: name + '·' + cd + '分布', datasetId: source.id, metricId: m0.id, dimensions: [cd], span: 1, drill: { type: 'detail', rowKey: source.fields[0]?.key || 'cust_id', title: '明细' } });
  }
  widgets.push({ id: 'w' + wi++, type: 'metric', title: m1.name, datasetId: source.id, metricId: m1.id, span: 1 });
  widgets.push({ id: 'w' + wi++, type: 'table', title: name + '明细', datasetId: source.id, metricId: m0.id, dimensions: source.fields.slice(0, 5).map((f) => f.key), span: 2, drill: { type: 'none', title: '' } });
  if (source.fields.some((f) => f.key === 'month')) {
    widgets.push({ id: 'w' + wi++, type: 'line', title: '月度趋势', datasetId: source.id, metricId: m0.id, dimensions: ['month'], span: 2 });
  }
  if (!cd && widgets.length < 3) {
    widgets.push({ id: 'w' + wi++, type: 'metric', title: m0.name, datasetId: source.id, metricId: m0.id, span: 1 });
  }
  return { id: 'db-' + String(i + 1).padStart(3, '0'), key: 'cr:mid-p' + (i + 1), name, group, order: i, enabled: true, desc: name + '实时监控看板', widgets };
});

// 1) 写入磁盘 JSON（运行时优先读取）
fs.writeFileSync(path.join(root, 'src/console/midDashboards.json'), JSON.stringify(dashboards, null, 2));

// 2) 生成 SEED TS 文件（供 midData.ts 引入，保持 SEED 与磁盘一致）
const ts = `// 自动生成：50 个零售信贷金融风控 SaaS 页面配置（看板）
// 由 record/temp/_gen_dash50.js 生成，引用 midDataSources.json + midMetrics.json
import type { MidDashboardPage } from './midData';

export const SEED_DASHBOARDS: MidDashboardPage[] = ${JSON.stringify(dashboards, null, 2)};
`;
fs.writeFileSync(path.join(root, 'src/console/midDashboardSeed.ts'), ts);

console.log('dashboards:', dashboards.length, '| widgets total:', dashboards.reduce((s, d) => s + d.widgets.length, 0));
console.log('sample:', dashboards[0].id, dashboards[0].name, '| widgets:', dashboards[0].widgets.length);
