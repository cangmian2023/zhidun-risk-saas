// 贷中监控 · 数据模型与种子数据（管理中心配置域）
// 数据来源约定：配置类存 mid*.json（蓝）｜样例数据行存各数据源 rows（橘）｜聚合/公式计算为实时（灰）

export type FieldKind = 'dim' | 'measure';
export type FieldType = 'string' | 'number' | 'date';

export interface MidField {
  key: string;
  label: string;
  kind: FieldKind;
  type: FieldType;
  unit?: string;
}

export type DataSourceType = 'sample' | 'api' | 'sql';

// 按类型的前置连接配置（创建时确定类型后按类型配置）
export interface MidConnConfig {
  // api
  method?: 'GET' | 'POST';
  authType?: 'none' | 'bearer' | 'apikey' | 'basic';
  account?: string;
  password?: string;
  // sql
  dbType?: string;          // mysql / oracle / postgres
  connStr?: string;         // 连接串
  query?: string;           // 查询语句
}

export interface MidDataSource {
  id: string;
  name: string;
  type: DataSourceType;      // 创建时确定，编辑时锁定
  desc?: string;
  conn?: MidConnConfig;      // 前置连接配置
  fields: MidField[];
  rows: Record<string, unknown>[];   // 样例数据行（sample 源）
  status?: 'connected' | 'failed';
  updatedAt?: string;
}

export type MetricType = 'base' | 'derived';
export type AggOp = 'sum' | 'count' | 'avg' | 'max' | 'min' | 'distinct';

export const AGG_LABEL: Record<AggOp, string> = {
  sum: '求和', count: '计数', avg: '平均', max: '最大', min: '最小', distinct: '去重计数',
};

export interface MidMetric {
  id: string;
  name: string;
  group?: string;
  desc?: string;
  dataSourceId: string;
  type: MetricType;
  field?: string;             // base：字段 key
  agg?: AggOp;                // base：聚合
  formula?: string;           // derived：公式（m_xxx 引用指标、数字、四则运算、函数）
  unit?: string;
  precision?: number;
}

// 监控策略（一页三 tab，一个 JSON 文件）
export type TaskFrequency = 'daily' | 'weekly' | 'monthly';
export type OutputWay = 'api' | 'url' | 'file' | 'web';
export type AlertLevel = 'RED' | 'YELLOW' | 'OPPORTUNITY';
export type RuleOp = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq';

export interface MidTask {
  id: string;
  name: string;
  crowd: string;              // 客群描述
  frequency: TaskFrequency;
  metricIds: string[];        // 关联指标
  output: OutputWay;          // 输出方式
  enabled: boolean;
  desc?: string;
}

export interface MidRule {
  id: string;
  name: string;
  metricId: string;
  op: RuleOp;
  value: number;
  level: AlertLevel;          // 命中后定级
  desc?: string;
}

export interface MidDispose {
  id: string;
  name: string;
  triggerLevel: AlertLevel;   // 触发等级
  action: string;             // 关注/预催/降额/冻结/止付/促活/提额
  targetSystem: string;       // 对接系统
  needApprove: boolean;       // 需审批
  needNotify: boolean;        // 需触达客户
  assignTo: string;           // 分派角色
  desc?: string;
}

export interface MidStrategy {
  tasks: MidTask[];
  rules: MidRule[];
  disposes: MidDispose[];
}

// 监控页面配置（看板）
export type WidgetType = 'metric' | 'line' | 'bar' | 'donut' | 'table';

export interface MidWidgetFilter {
  field: string;
  op: string;
  value: string;
}

export interface MidWidgetDrill {
  type: 'none' | 'detail';
  rowKey?: string;
  title?: string;
}

export interface MidWidget {
  id: string;
  type: WidgetType;
  title: string;
  datasetId: string;          // 数据源（数据集）
  metricId: string;           // 监控内容来自指标库
  dimensions?: string[];      // 维度字段
  filters?: MidWidgetFilter[];
  span?: 1 | 2;
  drill?: MidWidgetDrill;
}

export interface MidPageFilter {
  id: string;
  label: string;
  kind: 'dateRange' | 'select' | 'input';
}

export interface MidDashboardPage {
  id: string;
  key: string;
  name: string;
  group: string;
  order: number;
  enabled: boolean;
  desc?: string;
  filters?: MidPageFilter[];
  widgets: MidWidget[];
}

// ---------------- 种子数据 ----------------

export const SEED_DATA_SOURCES: MidDataSource[] = [
  {
    id: 'ds_customer', name: '客户信息', type: 'sample', desc: '在贷客户主档（样例）',
    fields: [
      { key: 'cust_id', label: '客户ID', kind: 'dim', type: 'string' },
      { key: 'cust_name', label: '客户姓名', kind: 'dim', type: 'string' },
      { key: 'product', label: '产品', kind: 'dim', type: 'string' },
      { key: 'risk_level', label: '风险等级', kind: 'dim', type: 'string' },
      { key: 'credit_line', label: '授信额度', kind: 'measure', type: 'number', unit: '元' },
      { key: 'loan_balance', label: '在贷余额', kind: 'measure', type: 'number', unit: '元' },
      { key: 'behavior_score', label: '行为分', kind: 'measure', type: 'number' },
    ],
    rows: [
      { cust_id: 'C0001', cust_name: '张*明', product: '信用贷', risk_level: '高风险', credit_line: 80000, loan_balance: 42000, behavior_score: 33 },
      { cust_id: 'C0002', cust_name: '李*华', product: '消费贷', risk_level: '中风险', credit_line: 50000, loan_balance: 18000, behavior_score: 52 },
      { cust_id: 'C0003', cust_name: '王*芳', product: '信用贷', risk_level: '低风险', credit_line: 100000, loan_balance: 35000, behavior_score: 78 },
      { cust_id: 'C0004', cust_name: '赵*强', product: '经营贷', risk_level: '高风险', credit_line: 200000, loan_balance: 156000, behavior_score: 28 },
      { cust_id: 'C0005', cust_name: '陈*敏', product: '消费贷', risk_level: '中风险', credit_line: 30000, loan_balance: 9000, behavior_score: 61 },
    ],
    status: 'connected',
  },
  {
    id: 'ds_alert', name: '预警明细', type: 'sample', desc: '红黄灯预警事件（样例，带规则明细快照）',
    fields: [
      { key: 'alert_id', label: '预警ID', kind: 'dim', type: 'string' },
      { key: 'cust_id', label: '客户ID', kind: 'dim', type: 'string' },
      { key: 'cust_name', label: '客户姓名', kind: 'dim', type: 'string' },
      { key: 'scene', label: '预警场景', kind: 'dim', type: 'string' },
      { key: 'level', label: '预警等级', kind: 'dim', type: 'string' },
      { key: 'alert_date', label: '预警日期', kind: 'dim', type: 'date' },
      { key: 'rule_name', label: '命中规则', kind: 'dim', type: 'string' },
      { key: 'metric_value', label: '指标值', kind: 'measure', type: 'number' },
      { key: 'threshold', label: '阈值', kind: 'measure', type: 'number' },
    ],
    rows: [
      { alert_id: 'AL240804-001', cust_id: 'C0001', cust_name: '张*明', scene: '负债激增', level: 'RED', alert_date: '2026-08-04', rule_name: '近30天新增贷款≥3笔', metric_value: 5, threshold: 3 },
      { alert_id: 'AL240804-002', cust_id: 'C0004', cust_name: '赵*强', scene: '司法涉诉', level: 'RED', alert_date: '2026-08-04', rule_name: '新增被执行记录', metric_value: 1, threshold: 0 },
      { alert_id: 'AL240804-003', cust_id: 'C0002', cust_name: '李*华', scene: '设备异常', level: 'YELLOW', alert_date: '2026-08-04', rule_name: '7日内更换设备', metric_value: 2, threshold: 1 },
      { alert_id: 'AL240803-004', cust_id: 'C0005', cust_name: '陈*敏', scene: '还款能力', level: 'YELLOW', alert_date: '2026-08-03', rule_name: '临期余额不足', metric_value: 1, threshold: 0 },
      { alert_id: 'AL240803-005', cust_id: 'C0001', cust_name: '张*明', scene: '行为评分', level: 'RED', alert_date: '2026-08-03', rule_name: '行为分<40', metric_value: 33, threshold: 40 },
      { alert_id: 'AL240802-006', cust_id: 'C0003', cust_name: '王*芳', scene: '需求上升', level: 'OPPORTUNITY', alert_date: '2026-08-02', rule_name: '额度使用率>80%', metric_value: 88, threshold: 80 },
    ],
    status: 'connected',
  },
  {
    id: 'ds_loan', name: '贷款台账', type: 'sample', desc: '在贷余额与逾期台账（样例）',
    fields: [
      { key: 'cust_id', label: '客户ID', kind: 'dim', type: 'string' },
      { key: 'product', label: '产品', kind: 'dim', type: 'string' },
      { key: 'loan_balance', label: '在贷余额', kind: 'measure', type: 'number', unit: '元' },
      { key: 'overdue_amt', label: '逾期金额', kind: 'measure', type: 'number', unit: '元' },
      { key: 'credit_line', label: '授信额度', kind: 'measure', type: 'number', unit: '元' },
    ],
    rows: [
      { cust_id: 'C0001', product: '信用贷', loan_balance: 42000, overdue_amt: 3200, credit_line: 80000 },
      { cust_id: 'C0002', product: '消费贷', loan_balance: 18000, overdue_amt: 0, credit_line: 50000 },
      { cust_id: 'C0003', product: '信用贷', loan_balance: 35000, overdue_amt: 0, credit_line: 100000 },
      { cust_id: 'C0004', product: '经营贷', loan_balance: 156000, overdue_amt: 12800, credit_line: 200000 },
      { cust_id: 'C0005', product: '消费贷', loan_balance: 9000, overdue_amt: 450, credit_line: 30000 },
    ],
    status: 'connected',
  },
  {
    id: 'ds_behavior', name: '行为指标月表', type: 'sample', desc: '客户月度行为指标（样例）',
    fields: [
      { key: 'cust_id', label: '客户ID', kind: 'dim', type: 'string' },
      { key: 'month', label: '月份', kind: 'dim', type: 'date' },
      { key: 'score', label: '行为分', kind: 'measure', type: 'number' },
      { key: 'new_loans', label: '新增贷款笔数', kind: 'measure', type: 'number' },
      { key: 'overdue_amt', label: '逾期金额', kind: 'measure', type: 'number', unit: '元' },
      { key: 'active_days', label: '活跃天数', kind: 'measure', type: 'number' },
    ],
    rows: [
      { cust_id: 'C0001', month: '2026-03', score: 58, new_loans: 1, overdue_amt: 0, active_days: 12 },
      { cust_id: 'C0001', month: '2026-04', score: 51, new_loans: 2, overdue_amt: 0, active_days: 9 },
      { cust_id: 'C0001', month: '2026-05', score: 44, new_loans: 3, overdue_amt: 1200, active_days: 6 },
      { cust_id: 'C0001', month: '2026-06', score: 38, new_loans: 4, overdue_amt: 2400, active_days: 4 },
      { cust_id: 'C0001', month: '2026-07', score: 33, new_loans: 5, overdue_amt: 3200, active_days: 3 },
      { cust_id: 'C0003', month: '2026-07', score: 78, new_loans: 0, overdue_amt: 0, active_days: 18 },
      { cust_id: 'C0004', month: '2026-07', score: 28, new_loans: 6, overdue_amt: 12800, active_days: 2 },
    ],
    status: 'connected',
  },
];

export const SEED_METRICS: MidMetric[] = [
  { id: 'm_cust_cnt', name: '在贷客户数', group: '客群', dataSourceId: 'ds_customer', type: 'base', field: 'cust_id', agg: 'count', precision: 0 },
  { id: 'm_loan_balance', name: '在贷余额', group: '风险', dataSourceId: 'ds_loan', type: 'base', field: 'loan_balance', agg: 'sum', unit: '元', precision: 0 },
  { id: 'm_overdue_amt', name: '逾期金额', group: '风险', dataSourceId: 'ds_loan', type: 'base', field: 'overdue_amt', agg: 'sum', unit: '元', precision: 0 },
  { id: 'm_overdue_rate', name: '逾期率', group: '风险', dataSourceId: 'ds_loan', type: 'derived', formula: 'm_overdue_amt / m_loan_balance * 100', unit: '%', precision: 2 },
  { id: 'm_alert_cnt', name: '预警数', group: '预警', dataSourceId: 'ds_alert', type: 'base', field: 'alert_id', agg: 'count', precision: 0 },
  { id: 'm_red_cnt', name: '红灯预警数', group: '预警', dataSourceId: 'ds_alert', type: 'base', field: 'alert_id', agg: 'count', precision: 0 },
  { id: 'm_score_avg', name: '行为均分', group: '风险', dataSourceId: 'ds_behavior', type: 'base', field: 'score', agg: 'avg', precision: 1 },
  { id: 'm_dispose_cnt', name: '处置次数', group: '处置', dataSourceId: 'ds_alert', type: 'base', field: 'alert_id', agg: 'count', precision: 0 },
];

export const SEED_STRATEGY: MidStrategy = {
  tasks: [
    {
      id: 't1', name: '全量在贷客群·日扫', crowd: '全部在贷客户', frequency: 'daily',
      metricIds: ['m_overdue_rate', 'm_alert_cnt', 'm_score_avg'], output: 'web', enabled: true,
      desc: '每日 02:00 扫描全量在贷客群，输出红黄灯预警',
    },
    {
      id: 't2', name: '经营贷客群·周扫', crowd: '经营贷产品客户', frequency: 'weekly',
      metricIds: ['m_loan_balance', 'm_overdue_amt'], output: 'file', enabled: true,
      desc: '每周一扫描经营贷客群，产出监控报表文件',
    },
  ],
  rules: [
    { id: 'r1', name: '逾期率超阈值', metricId: 'm_overdue_rate', op: 'gt', value: 5, level: 'RED', desc: '客群逾期率超过 5% 触发红灯' },
    { id: 'r2', name: '行为分过低', metricId: 'm_score_avg', op: 'lt', value: 40, level: 'RED', desc: '行为均分低于 40 触发红灯' },
    { id: 'r3', name: '预警量激增', metricId: 'm_alert_cnt', op: 'gte', value: 3, level: 'YELLOW', desc: '单日预警数≥3 触发黄灯' },
  ],
  disposes: [
    { id: 'd1', name: '红灯预催', triggerLevel: 'RED', action: '预催', targetSystem: '催收系统', needApprove: false, needNotify: true, assignTo: '催收专员' },
    { id: 'd2', name: '红灯降额', triggerLevel: 'RED', action: '降额', targetSystem: '核心信贷系统', needApprove: true, needNotify: true, assignTo: '风控主管' },
    { id: 'd3', name: '黄灯关注', triggerLevel: 'YELLOW', action: '关注', targetSystem: '工单系统', needApprove: false, needNotify: false, assignTo: '客户经理' },
    { id: 'd4', name: '机会提额', triggerLevel: 'OPPORTUNITY', action: '提额', targetSystem: '营销系统', needApprove: true, needNotify: true, assignTo: '客户经理' },
    { id: 'd5', name: '红灯冻结', triggerLevel: 'RED', action: '冻结', targetSystem: '核心信贷系统', needApprove: true, needNotify: true, assignTo: '风控主管' },
  ],
};

export const SEED_DASHBOARDS: MidDashboardPage[] = [
  {
    id: 'db-mid-overview', key: 'cr:mid-overview', name: '监控大盘', group: '监控总览', order: 0, enabled: true,
    desc: '管理层全局总览：预警量、红黄灯分布、逾期率、处置效率',
    filters: [
      { id: 'flt_date', label: '日期范围', kind: 'dateRange' },
      { id: 'flt_level', label: '预警等级', kind: 'select' },
    ],
    widgets: [
      { id: 'w1', type: 'metric', title: '预警总数', datasetId: 'ds_alert', metricId: 'm_alert_cnt', span: 1 },
      { id: 'w2', type: 'metric', title: '红灯预警', datasetId: 'ds_alert', metricId: 'm_red_cnt', span: 1 },
      { id: 'w3', type: 'metric', title: '逾期率', datasetId: 'ds_loan', metricId: 'm_overdue_rate', span: 1 },
      { id: 'w4', type: 'donut', title: '预警场景分布', datasetId: 'ds_alert', metricId: 'm_alert_cnt', dimensions: ['scene'], span: 1, drill: { type: 'detail', rowKey: 'cust_id', title: '预警个体明细' } },
      { id: 'w5', type: 'line', title: '近14日预警趋势', datasetId: 'ds_alert', metricId: 'm_alert_cnt', dimensions: ['alert_date'], span: 2 },
    ],
  },
  {
    id: 'db-mid-alert', key: 'cr:mid-alert', name: '红黄灯预警', group: '预警', order: 1, enabled: true,
    desc: '红黄灯预警明细与等级分布',
    widgets: [
      { id: 'w1', type: 'donut', title: '预警等级分布', datasetId: 'ds_alert', metricId: 'm_alert_cnt', dimensions: ['level'], span: 1 },
      { id: 'w2', type: 'table', title: '预警明细列表', datasetId: 'ds_alert', metricId: 'm_alert_cnt', dimensions: ['alert_id', 'cust_name', 'scene', 'level', 'alert_date'], span: 2, drill: { type: 'detail', rowKey: 'cust_id', title: '预警个体明细' } },
    ],
  },
  {
    id: 'db-mid-crowd', key: 'cr:mid-crowd', name: '客群风险', group: '客群', order: 2, enabled: true,
    desc: '在贷余额、逾期率与行为分趋势',
    widgets: [
      { id: 'w1', type: 'metric', title: '在贷余额', datasetId: 'ds_loan', metricId: 'm_loan_balance', span: 1 },
      { id: 'w2', type: 'metric', title: '逾期率', datasetId: 'ds_loan', metricId: 'm_overdue_rate', span: 1 },
      { id: 'w3', type: 'line', title: '行为分趋势', datasetId: 'ds_behavior', metricId: 'm_score_avg', dimensions: ['month'], span: 2 },
    ],
  },
];

// 公式引擎：派生指标求值（轻量：m_ 引用 + 四则运算 + ratio/mom/yoy 占位）
export function evalMetricFormula(formula: string, metricValues: Record<string, number>): number | null {
  if (!formula) return null;
  let expr = formula;
  // 替换 m_xxx 引用
  expr = expr.replace(/m_[A-Za-z0-9_]+/g, (m) => {
    const v = metricValues[m];
    return v === undefined ? '0' : String(v);
  });
  // 函数占位简化：ratio(a,b) -> a/b*100 ; mom(x) -> x ; yoy(x) -> x ; cumsum(x) -> x
  expr = expr.replace(/ratio\(\s*([^,()]+)\s*,\s*([^()]+)\s*\)/g, '($1 / $2 * 100)');
  expr = expr.replace(/mom\(\s*([^()]+)\s*\)/g, '($1)');
  expr = expr.replace(/yoy\(\s*([^()]+)\s*\)/g, '($1)');
  expr = expr.replace(/cumsum\(\s*([^()]+)\s*\)/g, '($1)');
  if (!/^[0-9+\-*/().\s]+$/.test(expr)) return null;
  try {
    // eslint-disable-next-line no-new-func
    const v = new Function(`"use strict"; return (${expr});`)();
    return typeof v === 'number' && isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

// ---------------- 使用域：个体详情 与 处置工单 样例 ----------------

export interface MidScorePoint { month: string; score: number; cohortAvg: number; }
export interface MidCustAlert {
  time: string;
  level: string;           // RED / YELLOW / OPPORTUNITY
  scene: string;
  ruleName: string;
  metricValue: number;
  threshold: number;
  status: string;          // 待处置/已解除/处置中
}
export interface MidCustDispose {
  time: string;
  operator: string;
  action: string;
  result: string;
  note?: string;
}
export interface MidCustomer {
  custId: string;
  name: string;
  idCard: string;
  product: string;
  creditLine: number;
  loanBalance: number;
  loanStatus: string;
  riskLevel: string;
  scoreHistory: MidScorePoint[];
  alerts: MidCustAlert[];
  disposes: MidCustDispose[];
}

export type DisposeStatus = '待处置' | '核实中' | '处置中' | '已解除' | '已升级' | '误报';
export interface MidDisposeTask {
  id: string;
  alertId: string;
  custId: string;
  custName: string;
  action: string;          // 建议动作
  targetSystem: string;    // 对接系统
  needApprove: boolean;
  assignTo: string;
  status: DisposeStatus;
  operator: string;
  updatedAt: string;
  logs: { time: string; who: string; what: string }[];
}

export const SEED_CUSTOMERS: MidCustomer[] = [
  {
    custId: 'C0001', name: '张*明', idCard: '3301**********1234', product: '信用贷',
    creditLine: 80000, loanBalance: 42000, loanStatus: '在贷', riskLevel: '高风险',
    scoreHistory: [
      { month: '2026-02', score: 62, cohortAvg: 74 }, { month: '2026-03', score: 58, cohortAvg: 74 },
      { month: '2026-04', score: 51, cohortAvg: 73 }, { month: '2026-05', score: 44, cohortAvg: 72 },
      { month: '2026-06', score: 38, cohortAvg: 72 }, { month: '2026-07', score: 33, cohortAvg: 71 },
    ],
    alerts: [
      { time: '2026-07-03', level: 'YELLOW', scene: '负债上升', ruleName: '近30天新增贷款≥2笔', metricValue: 2, threshold: 2, status: '已解除' },
      { time: '2026-07-18', level: 'RED', scene: '行为评分', ruleName: '行为分<40', metricValue: 38, threshold: 40, status: '处置中' },
      { time: '2026-08-04', level: 'RED', scene: '负债激增', ruleName: '近30天新增贷款≥3笔', metricValue: 5, threshold: 3, status: '待处置' },
    ],
    disposes: [
      { time: '2026-07-18', operator: '李四', action: '电话核实', result: '确认多笔网贷，收入下降', note: '建议降额并预催' },
      { time: '2026-07-19', operator: '王五', action: '降额', result: '已执行：80000→40000', note: '审批通过' },
    ],
  },
  {
    custId: 'C0002', name: '李*华', idCard: '3301**********5678', product: '消费贷',
    creditLine: 50000, loanBalance: 18000, loanStatus: '在贷', riskLevel: '中风险',
    scoreHistory: [
      { month: '2026-02', score: 55, cohortAvg: 74 }, { month: '2026-03', score: 54, cohortAvg: 74 },
      { month: '2026-04', score: 56, cohortAvg: 73 }, { month: '2026-05', score: 53, cohortAvg: 72 },
      { month: '2026-06', score: 52, cohortAvg: 72 }, { month: '2026-07', score: 52, cohortAvg: 71 },
    ],
    alerts: [
      { time: '2026-08-04', level: 'YELLOW', scene: '设备异常', ruleName: '7日内更换设备', metricValue: 2, threshold: 1, status: '待处置' },
    ],
    disposes: [],
  },
  {
    custId: 'C0003', name: '王*芳', idCard: '3301**********9012', product: '信用贷',
    creditLine: 100000, loanBalance: 35000, loanStatus: '在贷', riskLevel: '低风险',
    scoreHistory: [
      { month: '2026-02', score: 76, cohortAvg: 74 }, { month: '2026-03', score: 77, cohortAvg: 74 },
      { month: '2026-04', score: 76, cohortAvg: 73 }, { month: '2026-05', score: 78, cohortAvg: 72 },
      { month: '2026-06', score: 78, cohortAvg: 72 }, { month: '2026-07', score: 78, cohortAvg: 71 },
    ],
    alerts: [
      { time: '2026-08-02', level: 'OPPORTUNITY', scene: '需求上升', ruleName: '额度使用率>80%', metricValue: 88, threshold: 80, status: '待处置' },
    ],
    disposes: [],
  },
  {
    custId: 'C0004', name: '赵*强', idCard: '3301**********3456', product: '经营贷',
    creditLine: 200000, loanBalance: 156000, loanStatus: '在贷', riskLevel: '高风险',
    scoreHistory: [
      { month: '2026-02', score: 50, cohortAvg: 74 }, { month: '2026-03', score: 45, cohortAvg: 74 },
      { month: '2026-04', score: 41, cohortAvg: 73 }, { month: '2026-05', score: 36, cohortAvg: 72 },
      { month: '2026-06', score: 31, cohortAvg: 72 }, { month: '2026-07', score: 28, cohortAvg: 71 },
    ],
    alerts: [
      { time: '2026-07-25', level: 'RED', scene: '司法涉诉', ruleName: '新增被执行记录', metricValue: 1, threshold: 0, status: '处置中' },
      { time: '2026-08-04', level: 'RED', scene: '司法涉诉', ruleName: '新增被执行记录', metricValue: 1, threshold: 0, status: '待处置' },
    ],
    disposes: [
      { time: '2026-07-26', operator: '李四', action: '冻结额度', result: '已冻结全部可用额度', note: '待评估' },
    ],
  },
  {
    custId: 'C0005', name: '陈*敏', idCard: '3301**********7890', product: '消费贷',
    creditLine: 30000, loanBalance: 9000, loanStatus: '在贷', riskLevel: '中风险',
    scoreHistory: [
      { month: '2026-02', score: 60, cohortAvg: 74 }, { month: '2026-03', score: 61, cohortAvg: 74 },
      { month: '2026-04', score: 60, cohortAvg: 73 }, { month: '2026-05', score: 61, cohortAvg: 72 },
      { month: '2026-06', score: 61, cohortAvg: 72 }, { month: '2026-07', score: 61, cohortAvg: 71 },
    ],
    alerts: [
      { time: '2026-08-03', level: 'YELLOW', scene: '还款能力', ruleName: '临期余额不足', metricValue: 1, threshold: 0, status: '待处置' },
    ],
    disposes: [],
  },
];

export const SEED_DISPOSE_TASKS: MidDisposeTask[] = [
  {
    id: 'DP240804-001', alertId: 'AL240804-001', custId: 'C0001', custName: '张*明',
    action: '降额', targetSystem: '核心信贷系统', needApprove: true, assignTo: '风控主管',
    status: '待处置', operator: '风控专员-张三', updatedAt: '2026-08-04 02:10',
    logs: [{ time: '2026-08-04 02:10', who: '系统', what: '按处置策略「红灯降额」自动生成工单，等待审批' }],
  },
  {
    id: 'DP240804-002', alertId: 'AL240804-002', custId: 'C0004', custName: '赵*强',
    action: '冻结', targetSystem: '核心信贷系统', needApprove: true, assignTo: '风控主管',
    status: '核实中', operator: '风控专员-李四', updatedAt: '2026-08-04 09:30',
    logs: [
      { time: '2026-08-04 09:15', who: '李四', what: '电话核实：确认新增执行记录属实' },
      { time: '2026-08-04 09:30', who: '系统', what: '提交审批：冻结全部可用额度' },
    ],
  },
  {
    id: 'DP240804-003', alertId: 'AL240804-003', custId: 'C0002', custName: '李*华',
    action: '关注', targetSystem: '工单系统', needApprove: false, assignTo: '客户经理',
    status: '处置中', operator: '客户经理-赵敏', updatedAt: '2026-08-04 10:00',
    logs: [{ time: '2026-08-04 10:00', who: '赵敏', what: '联系客户确认换机原因，纳入观察名单' }],
  },
  {
    id: 'DP240804-004', alertId: 'AL240802-006', custId: 'C0003', custName: '王*芳',
    action: '提额', targetSystem: '营销系统', needApprove: true, assignTo: '客户经理',
    status: '待处置', operator: '客户经理-赵敏', updatedAt: '2026-08-04 02:15',
    logs: [{ time: '2026-08-04 02:15', who: '系统', what: '按处置策略「机会提额」生成工单（机会信号）' }],
  },
  {
    id: 'DP240803-005', alertId: 'AL240803-004', custId: 'C0005', custName: '陈*敏',
    action: '关注', targetSystem: '工单系统', needApprove: false, assignTo: '客户经理',
    status: '已解除', operator: '客户经理-赵敏', updatedAt: '2026-08-03 17:00',
    logs: [
      { time: '2026-08-03 15:00', who: '赵敏', what: '核实：还款日自动扣款失败，客户已手动还款' },
      { time: '2026-08-03 17:00', who: '赵敏', what: '解除预警，工单关闭' },
    ],
  },
  {
    id: 'DP240803-006', alertId: 'AL240803-005', custId: 'C0001', custName: '张*明',
    action: '预催', targetSystem: '催收系统', needApprove: false, assignTo: '催收专员',
    status: '已升级', operator: '催收专员-钱七', updatedAt: '2026-08-03 20:00',
    logs: [
      { time: '2026-08-03 14:00', who: '钱七', what: '预催短信已发送，客户未响应' },
      { time: '2026-08-03 20:00', who: '系统', what: '风险持续恶化（新红灯预警），工单升级' },
    ],
  },
];

export function computeAgg(rows: Record<string, unknown>[], field: string | undefined, agg: AggOp | undefined): number {
  if (!field || !rows.length) return 0;
  const nums = rows
    .map((r) => Number(r[field]))
    .filter((n) => Number.isFinite(n));
  switch (agg) {
    case 'sum': return nums.reduce((a, b) => a + b, 0);
    case 'avg': return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    case 'max': return nums.length ? Math.max(...nums) : 0;
    case 'min': return nums.length ? Math.min(...nums) : 0;
    case 'distinct': return new Set(rows.map((r) => r[field])).size;
    case 'count':
    default: return rows.length;
  }
}
