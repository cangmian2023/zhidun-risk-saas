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

export type DataSourceType = 'sql';

// 按类型的前置连接配置（创建时确定类型后按类型配置）
export interface MidConnConfig {
  // api
  method?: 'GET' | 'POST';
  authType?: 'none' | 'bearer' | 'apikey' | 'basic';
  host?: string;            // 域名 / IP
  account?: string;         // 账号
  password?: string;        // 密钥 / 密码
  // sql
  dbType?: string;          // mysql / oracle / postgres
  port?: number;            // 端口
  database?: string;        // 库名
  username?: string;        // 用户名
  connStr?: string;         // 连接串
  query?: string;           // 查询语句
}

export interface MidDataSource {
  id: string;
  name: string;
  type: DataSourceType;      // 创建时确定，编辑时锁定
  desc?: string;
  category?: string;         // 业务域分类（用于数据源选择器的分组，如 客户域/信贷域/外部数据）
  conn?: MidConnConfig;      // 前置连接配置
  fields: MidField[];
  rows: Record<string, unknown>[];   // 样例数据行
  status?: 'connected' | 'failed';
  updatedAt?: string;
}

export type MetricType = 'base' | 'derived';
/* 基础指标聚合（存量数据 agg 字段用此枚举，勿改） */
export type AggOp = 'sum' | 'count' | 'avg' | 'max' | 'min' | 'distinct';

export const AGG_LABEL: Record<AggOp, string> = {
  sum: '求和', count: '计数', avg: '平均', max: '最大', min: '最小', distinct: '去重计数',
};

/* ── 可视化 SQL 编辑器事件聚合（神策口径，08081 3.1）── */
export type VisualAggOp =
  | 'total' | 'users' | 'perCapita'
  | 'd7total' | 'd7users' | 'd30total' | 'd30users'
  | 'mtotal' | 'musers' | 'sumTotal' | 'sumUsers';
export const VISUAL_AGG_LABEL: Record<VisualAggOp, string> = {
  total: '总次数', users: '用户数', perCapita: '人均次数',
  d7total: '过去 7 天总次数', d7users: '过去 7 天用户数',
  d30total: '过去 30 天总次数', d30users: '过去 30 天用户数',
  mtotal: '当月总次数', musers: '当月用户数',
  sumTotal: '合计总次数', sumUsers: '合计用户数',
};
/* 事件聚合 → SQL（subject=分析主体字段，用户数/人均 去重口径） */
export const VISUAL_AGG_TO_SQL: Record<VisualAggOp, (subject: string) => string> = {
  total: () => 'COUNT(*)',
  users: (s) => `COUNT(DISTINCT ${s})`,
  perCapita: (s) => `COUNT(*) / COUNT(DISTINCT ${s})`,
  d7total: () => 'COUNT(*) /* 过去7天 */',
  d7users: (s) => `COUNT(DISTINCT ${s}) /* 过去7天 */`,
  d30total: () => 'COUNT(*) /* 过去30天 */',
  d30users: (s) => `COUNT(DISTINCT ${s}) /* 过去30天 */`,
  mtotal: () => 'COUNT(*) /* 当月 */',
  musers: (s) => `COUNT(DISTINCT ${s}) /* 当月 */`,
  sumTotal: () => 'SUM(1) /* 合计 */',
  sumUsers: (s) => `COUNT(DISTINCT ${s}) /* 合计 */`,
};

export interface MidMetric {
  id: string;
  name: string;
  group?: string;
  desc?: string;
  dataSourceId: string;          // 主数据源（步骤1多选中的第一个，作为 FROM / 计算引擎使用）
  dataSourceIds?: string[];      // 选择数据源步骤：可多选（来自数据源管理页配置）
  joins?: MidMetricJoin[];       // 关联数据源（步骤2 可视化设计器：除主源外的其他已选源，按需 JOIN）
  editorMode?: 'visual' | 'sql'; // SQL编辑器步骤：可视化配置 / 直接写 SQL（默认 visual）
  sql?: string;                  // editorMode=sql 时的 SQL 语句
  visualSql?: {                  // 需求42：可视化 SQL 编辑器（神策 BI 事件分析配置器风格）的配置快照
    subject?: string;            // 分析主体（dim 字段 key，默认 user_id / cust_id）
    timeZone?: string;           // 时区（如 UTC-03:00）
    aggMode?: string;            // 汇总配置（快速总和/用户数/人均次数/最大值/最小值/平均值/去重数）
    // 字段选择（A/B/C）：字段 + 聚合（神策口径 VisualAggOp）+ 数值格式（3.14）+ 字段级筛选（08081 3.2）
    events?: {
      name: string; field: string; agg: VisualAggOp;
      format?: 'pct2' | 'pct3' | 'int';  // 数值格式（3.14）：百分比两位小数 / 百分比三位小数 / 取整
      filters?: { logic: 'and' | 'or'; groups: { logic: 'and' | 'or'; conds: VisualCond[] }[] };
    }[];
    calcMode?: 'metric' | 'custom';  // 字段选择模式（3.13）：metric=指标（多列）/ custom=自定义指标（公式即指标）
    formula?: string;            // 自定义指标公式（3.13）：引用字段字母 A/B/C，如 (A + B) * C - 100
    // 自定义指标流式表达式（3.14，严格按神策样例）：单元序列 = 字段单元(字段.聚合) / 运算符单元 / 数字输入
    customExpr?: Array<
      { t: 'field'; field: string; agg: VisualAggOp; format?: 'pct2' | 'pct3' | 'int'; filters?: { logic: 'and' | 'or'; groups: { logic: 'and' | 'or'; conds: VisualCond[] }[] } }
      | { t: 'op'; op: string }
      | { t: 'num'; value: string }
    >;
    customFormat?: 'pct2' | 'pct3' | 'int';  // 自定义指标数值显示方式（3.14：百分比两位小数/三位小数/取整）
    customMolecular?: boolean;   // 按分子属性查看（3.14 神策复选框）
    // 全局筛选（神策嵌套结构 08081）：组间用顶层 logic 连接；每组内条件用组 logic 连接
    globalFilters?: {
      logic: 'and' | 'or';                                       // 组间关系（顶层）
      groups: { logic: 'and' | 'or'; conds: VisualCond[] }[];
    };
    groupBy?: string[];          // 分组选择（维度字段）
    timeGran?: string;           // 时间粒度（08081 3.5：按小时/按分钟/按天/按周/按月）
    // 时间范围（08081 3.5）：动态 / 静态 + 对比（上一段时间 / 去年同期 / 自定义）
    timeRange?: {
      mode: 'dynamic' | 'static';       // 动态时间（如近7天） / 静态时间（起止日期）
      dynamic?: string;                 // 动态预设：近7天/近30天/近90天/本月/上月
      start?: string; end?: string;     // 静态起止（YYYY-MM-DD）
      compare?: {
        enabled: boolean; mode: 'prev' | 'yoy' | 'custom';  // 上一段时间/去年同期/自定义
        start?: string; end?: string;   // 自定义对比范围
      };
    };
  };
  type: MetricType;
  field?: string;             // base：字段 key
  agg?: AggOp;                // base：聚合
  formula?: string;           // derived：公式（m_xxx 引用指标、数字、四则运算、函数）
  unit?: string;
  precision?: number;
  enabled?: boolean;        // 是否启用（默认 true）；停用后暂停采集/计算
  filters?: MidMetricFilter[];   // 筛选条件（基础指标，聚合前过滤数据源样例行）
  groupBy?: string[];            // 分组维度（基础指标，用于可视化预览）
  dedupField?: string;           // 去重字段（agg=distinct 时计数依据；默认 field）
  expr?: string;                 // 多字段计算表达式（基础指标，引用源字段 key，如 loan_balance/credit_line*100）
  vizType?: 'table' | 'bar' | 'line' | 'area' | 'pie' | 'hbar' | 'burndown' | 'radar';  // 可视化预览首选类型（默认 bar）
  vizSampleId?: string;          // 可视化预览所用样例数据集 ID（对应 midVizSamples.json 中的 id；默认取第一套）
  flowKey?: string;              // 需求28：关联业务流程 id（该指标自身的流程实例，存 midMetrics.json）
  flowState?: string;            // 需求28：该指标当前流程状态（per-object，独立于流程定义）
}

// 可视化预览样例数据集（midVizSamples.json · 样例橘）
export interface VizSample {
  id: string;
  name: string;
  unit?: string;
  precision?: number;
  data: { key: string; value: number }[];
}

// 监控粒度（频率）：realtime=实时；minute=按分钟；hour=按小时；day=按天；week=按周；month=按月
export type MonitorGranularity = 'realtime' | 'minute' | 'hour' | 'day' | 'week' | 'month';
// 监控时段：星期（周粒度生效）+ 小时槽（日/周/月粒度生效）——对齐文件「监控时段」
export type WeekDay = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
export interface MonitorPeriod {
  days?: WeekDay[];     // 监控时段·星期（周粒度时生效，如 ['mon'] 表示每周一）
  hours?: string[];    // 监控时段·小时槽（日/周/月粒度时生效，如 ['02'] 表示 02:00-03:00）
}
export const WEEK_DAYS: { key: WeekDay; label: string }[] = [
  { key: 'mon', label: '周一' }, { key: 'tue', label: '周二' }, { key: 'wed', label: '周三' },
  { key: 'thu', label: '周四' }, { key: 'fri', label: '周五' }, { key: 'sat', label: '周六' }, { key: 'sun', label: '周日' },
];
export const HOUR_SLOTS: string[] = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0')); // '00'..'23'

// 指标筛选操作符（聚合前的 WHERE 条件）
export type MetricFilterOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains';
export const FILTER_OP_LABEL: Record<MetricFilterOp, string> = { eq: '=', neq: '≠', gt: '>', gte: '≥', lt: '<', lte: '≤', contains: '包含' };

/* ── 可视化编辑器全局筛选操作符（神策口径，08081 3.3）── */
export type VisualFilterOp =
  | 'eq' | 'neq'          // 等于 / 不等于 → 单输入框
  | 'lt' | 'gt'           // 小于 / 大于 → 单输入框
  | 'range'               // 区间 → 两个输入框
  | 'has' | 'empty'       // 有值 / 没值 → 无输入框
  | 'in';                 // 包含 → 下拉多选
export const VISUAL_OP_LABEL: Record<VisualFilterOp, string> = {
  eq: '等于', neq: '不等于', lt: '小于', gt: '大于', range: '区间', has: '有值', empty: '没值', in: '包含',
};

/* 可视化筛选条件：value=单值（eq/neq/lt/gt）；range 用 value/rangeMax；has/empty 无值；in 用 values[] */
export interface VisualCond {
  field: string;
  op: VisualFilterOp;
  value?: string;
  rangeMax?: string;
  values?: string[];
}
export interface MidMetricFilter { field: string; op: MetricFilterOp; value: string; }
export interface MidMetricJoin { sourceId: string; key: string; } // 关联源 + 关联键（与主源同名字段，如 customer_id）
export type OutputWay = 'api' | 'url' | 'file' | 'web';
export type AlertLevel = 'RED' | 'YELLOW' | 'OPPORTUNITY' | 'GREEN';
export type RuleOp = 'gt' | 'gte' | 'lt' | 'lte' | 'eq' | 'neq' | 'exists' | 'contains';

export interface MidTask {
  id: string;
  name: string;
  crowd: string;              // 客群描述（详情页显示为「描述」）
  granularity: MonitorGranularity;  // 监控粒度（频率）
  period?: MonitorPeriod;           // 监控时段（星期 / 小时槽）
  metricIds: string[];        // 关联指标
  output: OutputWay;          // 输出方式
  enabled: boolean;
  desc?: string;
  scene?: string;                // 业务场景（标准化枚举：贷中风控/存量运营/贷后催收/反欺诈监测）——预警记录的 scene 由任务继承
  flowKey?: string;              // 需求28：关联业务流程 id（该任务自身的流程实例，存 midStrategy.json）
  flowState?: string;            // 需求28：该任务当前流程状态（per-object）
}

// 预警规则：支持多条件组合（且/或）——对齐事件分析「自定义规则」
export type RuleLogic = 'and' | 'or';
export interface RuleCond {
  id: string;
  metricId: string;     // 指标（或事件属性指标）
  op: RuleOp;           // 运算符（大于 / 小于 / 等于 / 有值 / 包含…）
  value: number | string; // 阈值；contains 时为逗号分隔字符串枚举；exists 时为空
}
export type RuleCompare = 'lt' | 'gt' | 'eq';            // 触发规则：低于 / 高于 / 等于
export type RuleBaseline = 'yesterday' | 'lastWeek' | 'lastMonth'; // 对比基准：昨天同期 / 上周同期 / 上月同期
export interface MidRule {
  id: string;
  name: string;
  logic: RuleLogic;     // 条件间关系：且(and) / 或(or)（旧结构保留兼容）
  conds: RuleCond[];    // 多条件（旧结构保留兼容 + 任务关联用）
  level: AlertLevel;    // 等级：绿灯 / 黄灯 / 红灯 / 机会
  groupValue?: string[];       // 分组值（神策：总体）
  triggerMode?: 'int' | 'ratio'; // 触发方式：绝对值变化 / 百分比变化
  compare?: RuleCompare;       // 触发规则-比较：低于 / 高于 / 等于
  baseline?: RuleBaseline;     // 触发规则-基准：昨天同期 / 上周同期 / 上月同期
  threshold?: number;          // 触发规则-阈值
  alertType?: string;          // 预警类型（标准化枚举：负债激增/多头借贷/逾期预警/司法涉诉/设备异常/反欺诈命中/…）——预警记录的 alert_type 由规则继承
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
  flowKey?: string;              // 需求28：关联业务流程 id（该策略自身的流程实例，存 midStrategy.json）
  flowState?: string;            // 需求28：该策略当前流程状态（per-object）
}

export interface MidStrategy {
  tasks: MidTask[];
  rules: MidRule[];
  disposes: MidDispose[];
}

// 向后兼容迁移：把旧结构（任务 frequency/schedule、规则单条件 metricId/op/value）
// 规整为新结构（任务 granularity/period、规则 logic/conds[]）。加载磁盘 JSON 时统一过一遍，
// 避免历史数据缺字段导致渲染 `t.metricIds` / `r.conds` 为 undefined 而白屏。
const FREQ_TO_GRAN: Record<string, MonitorGranularity> = {
  realtime: 'realtime', every5m: 'minute', hourly: 'hour', daily: 'day', weekly: 'week', monthly: 'month',
};
export function normalizeStrategy(input: unknown): MidStrategy {
  const raw = (input ?? {}) as Record<string, any>;
  const tasks: MidTask[] = Array.isArray(raw.tasks)
    ? raw.tasks.map((t: any): MidTask => {
        let period: MonitorPeriod | undefined = t.period;
        if (!period && typeof t.schedule === 'string') {
          const hh = String(t.schedule).split(':')[0];
          if (hh) period = { hours: [hh] };
        }
        const granularity: MonitorGranularity =
          (FREQ_TO_GRAN[t.frequency as string] ?? (t.granularity as MonitorGranularity)) || 'day';
        return {
          id: t.id,
          name: t.name ?? '',
          crowd: t.crowd ?? '',
          granularity,
          period,
          metricIds: Array.isArray(t.metricIds) ? t.metricIds : [],
          output: t.output ?? 'web',
          enabled: t.enabled ?? true,
          desc: t.desc,
          scene: t.scene,
          flowKey: t.flowKey,
          flowState: t.flowState,
        };
      })
    : [];
  const rules: MidRule[] = Array.isArray(raw.rules)
    ? raw.rules.map((r: any): MidRule => {
        const normCond = (c: any, i: number): RuleCond => {
          const op: RuleOp = (['gt', 'gte', 'lt', 'lte', 'eq', 'neq', 'exists', 'contains'] as RuleOp[]).includes(c.op) ? c.op : 'gt';
          let value: number | string = '';
          if (op === 'exists') value = '';
          else if (op === 'contains') value = typeof c.value === 'string' ? c.value : String(c.value ?? '');
          else value = typeof c.value === 'number' ? c.value : Number(c.value) || 0;
          return { id: c.id ?? `${r.id}__c${i}`, metricId: c.metricId ?? '', op, value };
        };
        const conds: RuleCond[] =
          Array.isArray(r.conds) && r.conds.length
            ? r.conds.map((c: any, i: number) => normCond(c, i))
            : [normCond({ metricId: r.metricId, op: r.op, value: r.value }, 0)];
        return {
          id: r.id,
          name: r.name ?? '',
          logic: r.logic === 'or' ? 'or' : 'and',
          conds,
          level: r.level ?? 'RED',
          groupValue: Array.isArray(r.groupValue) ? r.groupValue : ['总体'],
          triggerMode: r.triggerMode === 'ratio' ? 'ratio' : 'int',
          compare: (['lt', 'gt', 'eq'] as RuleCompare[]).includes(r.compare) ? r.compare : 'lt',
          baseline: (['yesterday', 'lastWeek', 'lastMonth'] as RuleBaseline[]).includes(r.baseline) ? r.baseline : 'yesterday',
          threshold: typeof r.threshold === 'number' ? r.threshold : 0,
          alertType: r.alertType,
          desc: r.desc,
        };
      })
    : [];
  const disposes: MidDispose[] = Array.isArray(raw.disposes) ? (raw.disposes as MidDispose[]) : [];
  return { tasks, rules, disposes };
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
  metricId: string;           // 主指标（取 metricIds 首项，供渲染）
  metricIds?: string[];       // 关联指标（多选，与监控任务一致）
  dimensions?: string[];      // 维度字段
  filters?: MidWidgetFilter[];
  span?: 1 | 2 | 3;          // 占列数（3 列网格下：1=小/2=中/3=大）
  drill?: MidWidgetDrill;
  // 可视化组件编辑态（对应 record/temp/08071 文档第二点 编辑状态）
  timeGranularity?: string;         // 时间粒度
  showExtra?: string[];             // 同时显示（复选项）
  windowSize?: 'sm' | 'md' | 'lg';  // 窗口尺寸
  remark?: string;                  // 备注
  flowKey?: string;                 // 需求23：关联业务流程 id（组件级，渲染时顶部显示流程操作行）
}

export interface MidPageFilter {
  id: string;
  label: string;
  kind: 'dateRange' | 'select' | 'input';
  field?: string;            // 绑定到数据集字段（用于看板交叉筛选）
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
  flowKey?: string;              // 需求28：关联业务流程 id（该页面自身的流程实例，存 midDashboards.json）
  flowState?: string;            // 需求28：该页面当前流程状态（per-object）
}

// ---------------- 种子数据 ----------------

export const SEED_DATA_SOURCES: MidDataSource[] = [
  {
    id: 'ds_customer', name: '客户信息', type: 'sql', category: '客户域', desc: '在贷客户主档',
    conn: { dbType: 'mysql', host: '10.20.30.11', port: 3306, database: 'crm', username: 'crm_rw', password: 'Crm@2026****', connStr: 'mysql://crm_rw:***@10.20.30.11:3306/crm', query: 'SELECT cust_id, cust_name, product, risk_level, credit_line, loan_balance, behavior_score FROM cust_master' },
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
    id: 'ds_alert', name: '预警明细', type: 'sql', category: '预警域', desc: '红黄灯预警事件',
    conn: { dbType: 'oracle', host: '10.20.30.22', port: 1521, database: 'risk_db', username: 'alert_ro', password: 'Alert@2026****', connStr: 'oracle://alert_ro:***@10.20.30.22:1521/risk_db', query: 'SELECT alert_id, cust_id, cust_name, scene, level, alert_date, rule_name, metric_value, threshold FROM alert_event' },
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
    id: 'ds_loan', name: '贷款台账', type: 'sql', category: '信贷域', desc: '在贷余额与逾期台账',
    conn: { dbType: 'mysql', host: '10.20.30.33', port: 3306, database: 'core_loan', username: 'loan_rw', password: 'Loan@2026****', connStr: 'mysql://loan_rw:***@10.20.30.33:3306/core_loan', query: 'SELECT cust_id, product, loan_balance, overdue_amt, credit_line FROM loan_ledger' },
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
    id: 'ds_behavior', name: '行为指标月表', type: 'sql', category: '行为域', desc: '客户月度行为指标',
    conn: { dbType: 'postgres', host: '10.20.30.44', port: 5432, database: 'behavior', username: 'beh_ro', password: 'Beh@2026****', connStr: 'postgres://beh_ro:***@10.20.30.44:5432/behavior', query: 'SELECT cust_id, month, score, new_loans, overdue_amt, active_days FROM behavior_monthly' },
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
  {
    id: 'ds_api_demo', name: '外部征信库', type: 'sql', category: '外部数据', desc: '第三方征信数据（演示连接配置）',
    conn: { dbType: 'mysql', host: '10.20.30.55', port: 3306, database: 'credit_ref', username: 'ref_ro', password: 'Ref@2026****', connStr: 'mysql://ref_ro:***@10.20.30.55:3306/credit_ref', query: 'SELECT id_no, score, query_cnt FROM credit_report' },
    fields: [
      { key: 'id_no', label: '证件号', kind: 'dim', type: 'string' },
      { key: 'score', label: '征信分', kind: 'measure', type: 'number' },
      { key: 'query_cnt', label: '查询次数', kind: 'measure', type: 'number' },
    ],
    rows: [
      { id_no: '3301**********1234', score: 682, query_cnt: 3 },
      { id_no: '4401**********5678', score: 551, query_cnt: 7 },
    ],
    status: 'connected',
  },
  {
    id: 'ds_sql_demo', name: '核心信贷库', type: 'sql', category: '信贷域', desc: '核心系统数据库（演示连接配置）',
    conn: { dbType: 'mysql', host: '10.20.30.40', port: 3306, database: 'core_loan', username: 'etl_rw', password: 'Core@2026****', connStr: 'mysql://etl_rw:***@10.20.30.40:3306/core_loan', query: 'SELECT cust_id, loan_balance, overdue_amt FROM loan_ledger' },
    fields: [
      { key: 'cust_id', label: '客户ID', kind: 'dim', type: 'string' },
      { key: 'loan_balance', label: '在贷余额', kind: 'measure', type: 'number', unit: '元' },
      { key: 'overdue_amt', label: '逾期金额', kind: 'measure', type: 'number', unit: '元' },
    ],
    rows: [
      { cust_id: 'C0001', loan_balance: 42000, overdue_amt: 3200 },
      { cust_id: 'C0004', loan_balance: 156000, overdue_amt: 12800 },
    ],
    status: 'connected',
  },
  {
    // 神策「事件分析」导出对应的事件数据源（record/temp/event）——用于承载 A/B/C 指标与全局筛选条件
    id: 'ds_event', name: '事件分析数据源', type: 'sql', category: '行为域', desc: '神策事件分析导出（Web 视区停留 / 直播间点击购买 / IP·启动时长·国家 等事件属性）',
    conn: { dbType: 'mysql', host: '10.20.30.66', port: 3306, database: 'sens_event', username: 'evt_ro', password: 'Evt@2026****', connStr: 'mysql://evt_ro:***@10.20.30.66:3306/sens_event', query: 'SELECT user_id, ip, startup_dur, country, web_stay_7d, live_buy_peruser, live_buy_users, live_buy_total FROM event_analysis' },
    fields: [
      { key: 'user_id', label: '用户ID', kind: 'dim', type: 'string' },
      { key: 'ip', label: 'IP', kind: 'dim', type: 'string' },
      { key: 'startup_dur', label: '$启动时长', kind: 'measure', type: 'number', unit: 's' },
      { key: 'country', label: '国家', kind: 'dim', type: 'string' },
      { key: 'web_stay_7d', label: 'Web视区停留·过去7天总次数', kind: 'measure', type: 'number' },
      { key: 'live_buy_peruser', label: '直播间点击购买·人均次数', kind: 'measure', type: 'number' },
      { key: 'live_buy_users', label: '直播间点击购买·用户数', kind: 'measure', type: 'number' },
      { key: 'live_buy_total', label: '直播间点击购买·总次数', kind: 'measure', type: 'number' },
    ],
    rows: [
      { user_id: 'U0001', ip: '112.10.2.31', startup_dur: 42, country: '中国', web_stay_7d: 18, live_buy_peruser: 0.6, live_buy_users: 12, live_buy_total: 20 },
      { user_id: 'U0002', ip: '8.34.9.7', startup_dur: 71, country: '美国', web_stay_7d: 33, live_buy_peruser: 1.2, live_buy_users: 30, live_buy_total: 25 },
      { user_id: 'U0003', ip: '', startup_dur: 12, country: '日本', web_stay_7d: 9, live_buy_peruser: 0.2, live_buy_users: 4, live_buy_total: 18 },
      { user_id: 'U0004', ip: '200.18.4.2', startup_dur: 58, country: '瑞士', web_stay_7d: 27, live_buy_peruser: 0.9, live_buy_users: 21, live_buy_total: 23 },
      { user_id: 'U0005', ip: '61.3.8.9', startup_dur: 95, country: '德国', web_stay_7d: 41, live_buy_peruser: 1.5, live_buy_users: 38, live_buy_total: 25 },
    ],
    status: 'connected',
  },
{
  'id': 'ds_pre_apply',
  'name': '进件申请',
  'type': 'sql',
  'category': '贷前域',
  'desc': '贷前进件申请（进件审核/信息核验/信用风控/欺诈识别）',
  'conn': {
    'dbType': 'mysql',
    'host': '10.20.30.33',
    'port': 3306,
    'database': 'pre_apply',
    'username': 'pre_rw',
    'password': 'Pre@2026****',
    'connStr': 'mysql://pre_rw:***@10.20.30.33:3306/pre_apply',
    'query': 'SELECT apply_id, apply_date, cust_name, channel, product, verify_pass, credit_score, fraud_hit, decision FROM pre_apply'
  },
  'fields': [
    {
      'key': 'apply_id',
      'label': '进件ID',
      'kind': 'dim',
      'type': 'string'
    },
    {
      'key': 'apply_date',
      'label': '申请日期',
      'kind': 'dim',
      'type': 'string'
    },
    {
      'key': 'cust_name',
      'label': '客户姓名',
      'kind': 'dim',
      'type': 'string'
    },
    {
      'key': 'channel',
      'label': '进件渠道',
      'kind': 'dim',
      'type': 'string'
    },
    {
      'key': 'product',
      'label': '申请产品',
      'kind': 'dim',
      'type': 'string'
    },
    {
      'key': 'verify_pass',
      'label': '信息核验',
      'kind': 'dim',
      'type': 'string'
    },
    {
      'key': 'credit_score',
      'label': '预授信评分',
      'kind': 'measure',
      'type': 'number'
    },
    {
      'key': 'fraud_hit',
      'label': '欺诈命中',
      'kind': 'dim',
      'type': 'string'
    },
    {
      'key': 'decision',
      'label': '审批结论',
      'kind': 'dim',
      'type': 'string'
    }
  ],
  'rows': [
    {
      'apply_id': 'AP20260808-001',
      'apply_date': '2026-08-08',
      'cust_name': '张*明',
      'channel': '线上App',
      'product': '信用贷',
      'verify_pass': '通过',
      'credit_score': 620,
      'fraud_hit': '否',
      'decision': '通过'
    },
    {
      'apply_id': 'AP20260808-002',
      'apply_date': '2026-08-08',
      'cust_name': '李*华',
      'channel': '合作渠道',
      'product': '消费贷',
      'verify_pass': '通过',
      'credit_score': 585,
      'fraud_hit': '否',
      'decision': '通过'
    },
    {
      'apply_id': 'AP20260808-003',
      'apply_date': '2026-08-08',
      'cust_name': '王*芳',
      'channel': '线上App',
      'product': '信用贷',
      'verify_pass': '未通过',
      'credit_score': 540,
      'fraud_hit': '否',
      'decision': '拒绝'
    },
    {
      'apply_id': 'AP20260808-004',
      'apply_date': '2026-08-08',
      'cust_name': '赵*强',
      'channel': '线下门店',
      'product': '经营贷',
      'verify_pass': '通过',
      'credit_score': 645,
      'fraud_hit': '否',
      'decision': '人工复核'
    },
    {
      'apply_id': 'AP20260808-005',
      'apply_date': '2026-08-08',
      'cust_name': '陈*敏',
      'channel': '微信小程序',
      'product': '消费贷',
      'verify_pass': '通过',
      'credit_score': 598,
      'fraud_hit': '否',
      'decision': '通过'
    },
    {
      'apply_id': 'AP20260808-006',
      'apply_date': '2026-08-08',
      'cust_name': '孙*华',
      'channel': '合作渠道',
      'product': '信用贷',
      'verify_pass': '通过',
      'credit_score': 660,
      'fraud_hit': '是',
      'decision': '拒绝'
    },
    {
      'apply_id': 'AP20260808-007',
      'apply_date': '2026-08-08',
      'cust_name': '周*伟',
      'channel': '线上App',
      'product': '抵押贷',
      'verify_pass': '未通过',
      'credit_score': 570,
      'fraud_hit': '否',
      'decision': '拒绝'
    },
    {
      'apply_id': 'AP20260808-008',
      'apply_date': '2026-08-08',
      'cust_name': '吴*军',
      'channel': '线下门店',
      'product': '经营贷',
      'verify_pass': '通过',
      'credit_score': 615,
      'fraud_hit': '否',
      'decision': '通过'
    },
    {
      'apply_id': 'AP20260808-009',
      'apply_date': '2026-08-08',
      'cust_name': '郑*丽',
      'channel': '微信小程序',
      'product': '消费贷',
      'verify_pass': '通过',
      'credit_score': 630,
      'fraud_hit': '是',
      'decision': '人工复核'
    },
    {
      'apply_id': 'AP20260808-010',
      'apply_date': '2026-08-08',
      'cust_name': '冯*军',
      'channel': '线上App',
      'product': '信用贷',
      'verify_pass': '通过',
      'credit_score': 590,
      'fraud_hit': '否',
      'decision': '通过'
    }
  ],
  'status': 'connected'
},
];

export const SEED_METRICS: MidMetric[] = [
  // 客群
  { id: 'm_cust_cnt', name: '在贷客户数', group: '客群', dataSourceId: 'ds_customer', type: 'base', field: 'cust_id', agg: 'count', precision: 0, enabled: true },
  { id: 'm_new_cust', name: '本月新增客户数', group: '客群', dataSourceId: 'ds_customer', type: 'base', field: 'new_loans', agg: 'sum', precision: 0, enabled: false },
  { id: 'm_active_days', name: '平均活跃天数', group: '客群', dataSourceId: 'ds_customer', type: 'base', field: 'active_days', agg: 'avg', precision: 1, enabled: false },
  // 风险
  { id: 'm_loan_balance', name: '在贷余额', group: '风险', dataSourceId: 'ds_loan', type: 'base', field: 'loan_balance', agg: 'sum', unit: '元', precision: 0, enabled: true, groupBy: ['product'], vizType: 'bar', vizSampleId: 'vs_product_loan' },
  { id: 'm_overdue_amt', name: '逾期金额', group: '风险', dataSourceId: 'ds_loan', type: 'base', field: 'overdue_amt', agg: 'sum', unit: '元', precision: 0, enabled: true, groupBy: ['product'], vizType: 'line', vizSampleId: 'vs_monthly_overdue' },
  { id: 'm_credit_line', name: '授信额度', group: '风险', dataSourceId: 'ds_loan', type: 'base', field: 'credit_line', agg: 'sum', unit: '元', precision: 0, enabled: true, vizType: 'bar', vizSampleId: 'vs_quarter_revenue' },
  { id: 'm_score_avg', name: '行为均分', group: '风险', dataSourceId: 'ds_behavior', type: 'base', field: 'score', agg: 'avg', precision: 1, enabled: true, groupBy: ['month'], vizType: 'radar', vizSampleId: 'vs_region_score' },
  { id: 'm_overdue_rate', name: '逾期率', group: '风险', dataSourceId: 'ds_loan', type: 'derived', formula: 'm_overdue_amt / m_loan_balance * 100', unit: '%', precision: 2, enabled: true, vizType: 'line', vizSampleId: 'vs_monthly_overdue' },
  { id: 'm_util_rate', name: '额度使用率', group: '风险', dataSourceId: 'ds_loan', type: 'derived', formula: 'm_loan_balance / m_credit_line * 100', unit: '%', precision: 1, enabled: true, vizType: 'pie', vizSampleId: 'vs_risk_level' },
  { id: 'm_npl_amt', name: '不良金额', group: '风险', dataSourceId: 'ds_loan', type: 'base', field: 'overdue_amt', agg: 'sum', unit: '元', precision: 0, enabled: true, vizType: 'bar', vizSampleId: 'vs_product_loan' },
  { id: 'm_npl_rate', name: '不良率', group: '风险', dataSourceId: 'ds_loan', type: 'derived', formula: 'm_npl_amt / m_loan_balance * 100', unit: '%', precision: 2, enabled: false, vizType: 'pie', vizSampleId: 'vs_risk_level' },
  // 预警
  { id: 'm_alert_cnt', name: '预警总数', group: '预警', dataSourceId: 'ds_alert', type: 'base', field: 'alert_id', agg: 'count', precision: 0, enabled: true, groupBy: ['level'], vizType: 'pie', vizSampleId: 'vs_risk_level' },
  { id: 'm_red_cnt', name: '红灯预警数', group: '预警', dataSourceId: 'ds_alert', type: 'base', field: 'alert_id', agg: 'count', precision: 0, enabled: true, vizType: 'bar', vizSampleId: 'vs_age_risk' },
  { id: 'm_opp_cnt', name: '机会预警数', group: '预警', dataSourceId: 'ds_alert', type: 'base', field: 'alert_id', agg: 'count', precision: 0, enabled: true, vizType: 'hbar', vizSampleId: 'vs_channel_approval' },
  // 处置
  { id: 'm_dispose_cnt', name: '处置次数', group: '处置', dataSourceId: 'ds_alert', type: 'base', field: 'alert_id', agg: 'count', precision: 0, enabled: true, vizType: 'burndown', vizSampleId: 'vs_burndown_task' },
  { id: 'm_dispose_rate', name: '处置率', group: '处置', dataSourceId: 'ds_alert', type: 'derived', formula: 'm_dispose_cnt / m_alert_cnt * 100', unit: '%', precision: 1, enabled: true, vizType: 'area', vizSampleId: 'vs_channel_approval' },
  // ---- 事件分析（record/temp/event）指标：A/B/C + 三个事件属性（供预警规则引用） ----
  { id: 'm_web_stay_7d', name: 'Web 视区停留的过去 7 天总次数', group: '事件分析', dataSourceId: 'ds_event', type: 'base', field: 'web_stay_7d', agg: 'sum', precision: 0, enabled: true, vizType: 'bar', vizSampleId: 'vs_product_loan' },
  { id: 'm_live_buy_peruser', name: '直播间-点击立即购买的人均次数', group: '事件分析', dataSourceId: 'ds_event', type: 'base', field: 'live_buy_peruser', agg: 'avg', precision: 2, enabled: true, vizType: 'line', vizSampleId: 'vs_monthly_overdue' },
  { id: 'm_live_buy_users', name: '直播间-点击立即购买·用户数', group: '事件分析', dataSourceId: 'ds_event', type: 'base', field: 'live_buy_users', agg: 'sum', precision: 0, enabled: true, vizType: 'bar', vizSampleId: 'vs_quarter_revenue' },
  { id: 'm_live_buy_total', name: '直播间-点击立即购买·总次数', group: '事件分析', dataSourceId: 'ds_event', type: 'base', field: 'live_buy_total', agg: 'sum', precision: 0, enabled: true, vizType: 'bar', vizSampleId: 'vs_product_loan' },
  { id: 'm_custom_idx2', name: '自定义指标2', group: '事件分析', dataSourceId: 'ds_event', type: 'derived', formula: 'm_live_buy_users / m_live_buy_total * 100', unit: '%', precision: 1, enabled: true, vizType: 'pie', vizSampleId: 'vs_risk_level' },
  { id: 'm_ip', name: 'IP（事件属性）', group: '事件属性', dataSourceId: 'ds_event', type: 'base', field: 'ip', agg: 'count', precision: 0, enabled: true, vizType: 'bar', vizSampleId: 'vs_age_risk' },
  { id: 'm_startup_dur', name: '$启动时长（事件属性）', group: '事件属性', dataSourceId: 'ds_event', type: 'base', field: 'startup_dur', agg: 'avg', unit: 's', precision: 1, enabled: true, vizType: 'bar', vizSampleId: 'vs_quarter_revenue' },
  { id: 'm_country', name: '国家（事件属性）', group: '事件属性', dataSourceId: 'ds_event', type: 'base', field: 'country', agg: 'count', precision: 0, enabled: true, vizType: 'hbar', vizSampleId: 'vs_channel_approval' },
{ id: 'm_age_avg', name: '客户平均年龄', group: '客群', desc: '在贷客户平均年龄', dataSourceId: 'ds_customer', type: 'base', field: 'age_avg', agg: 'avg', unit: '岁', precision: 0, enabled: true },
    { id: 'm_age_dist', name: '客户年龄分布', group: '客群', desc: '按年龄分组客户数', dataSourceId: 'ds_customer', type: 'base', field: 'age_dist', agg: 'distinct', unit: '人', precision: 0, enabled: true, vizType: 'bar' },
    { id: 'm_gender_cnt', name: '男性客户数', group: '客群', desc: '性别=男的在贷客户数', dataSourceId: 'ds_customer', type: 'base', field: 'gender_cnt', agg: 'count', unit: '人', precision: 0, enabled: true, vizType: 'hbar' },
    { id: 'm_married_cnt', name: '已婚客户数', group: '客群', desc: '婚姻状态=已婚的客户数', dataSourceId: 'ds_customer', type: 'base', field: 'married_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_edu_cnt', name: '本科及以上客户数', group: '客群', desc: '学历=本科/硕士/博士客户数', dataSourceId: 'ds_customer', type: 'base', field: 'edu_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_house_cnt', name: '有房客户数', group: '客群', desc: '住房性质=自有客户数', dataSourceId: 'ds_customer', type: 'base', field: 'house_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_car_cnt', name: '有车客户数', group: '客群', desc: '拥有车辆的客户数', dataSourceId: 'ds_customer', type: 'base', field: 'car_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_work_years_avg', name: '平均工作年限', group: '客群', desc: '在贷客户平均工作年限', dataSourceId: 'ds_customer', type: 'base', field: 'work_years_avg', agg: 'avg', unit: '年', precision: 1, enabled: true },
    { id: 'm_income_avg', name: '客户平均月收入', group: '客群', desc: '客户平均月收入', dataSourceId: 'ds_customer', type: 'base', field: 'income_avg', agg: 'avg', unit: '元', precision: 0, enabled: true },
    { id: 'm_income_high_cnt', name: '高收入客户数', group: '客群', desc: '月收入≥3万的客户数', dataSourceId: 'ds_customer', type: 'base', field: 'income_high_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_social_cnt', name: '缴纳社保客户数', group: '客群', desc: '有社保记录的客户数', dataSourceId: 'ds_customer', type: 'base', field: 'social_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_fund_cnt', name: '缴纳公积金客户数', group: '客群', desc: '有公积金记录的客户数', dataSourceId: 'ds_customer', type: 'base', field: 'fund_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_company_avg', name: '平均企业规模', group: '客群', desc: '客户所在企业平均人数', dataSourceId: 'ds_customer', type: 'base', field: 'company_avg', agg: 'avg', unit: '人', precision: 0, enabled: true },
    { id: 'm_industry_cnt', name: '行业分布客户数', group: '客群', desc: '按行业分组的客户数', dataSourceId: 'ds_customer', type: 'base', field: 'industry_cnt', agg: 'distinct', unit: '人', precision: 0, enabled: true, vizType: 'bar' },
    { id: 'm_city_cnt', name: '城市分布客户数', group: '客群', desc: '按城市分组的客户数', dataSourceId: 'ds_customer', type: 'base', field: 'city_cnt', agg: 'distinct', unit: '人', precision: 0, enabled: true, vizType: 'bar' },
    { id: 'm_blacklist_cnt', name: '黑名单客户数', group: '客群', desc: '命中外部黑名单的在贷客户数', dataSourceId: 'ds_api_demo', type: 'base', field: 'blacklist_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_credit_remain', name: '剩余授信额度', group: '授信', desc: '授信额度-已用额度', dataSourceId: 'ds_customer', type: 'base', field: 'credit_remain', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_util_high_cnt', name: '额度使用率>90%客户数', group: '授信', desc: '额度使用率超过90%的客户', dataSourceId: 'ds_loan', type: 'base', field: 'util_high_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_temp_credit', name: '临时授信额度', group: '授信', desc: '临时提额额度总额', dataSourceId: 'ds_customer', type: 'base', field: 'temp_credit', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_cycle_credit', name: '循环授信额度', group: '授信', desc: '循环额度总额', dataSourceId: 'ds_customer', type: 'base', field: 'cycle_credit', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_upgrade_cnt', name: '提额次数', group: '授信', desc: '近12个月提额次数', dataSourceId: 'ds_customer', type: 'base', field: 'upgrade_cnt', agg: 'sum', unit: '次', precision: 0, enabled: true },
    { id: 'm_downgrade_cnt', name: '降额次数', group: '授信', desc: '近12个月降额次数', dataSourceId: 'ds_customer', type: 'base', field: 'downgrade_cnt', agg: 'sum', unit: '次', precision: 0, enabled: true },
    { id: 'm_freeze_amt', name: '冻结授信额度', group: '授信', desc: '被冻结的授信额度', dataSourceId: 'ds_customer', type: 'base', field: 'freeze_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_avail_credit', name: '可用授信额度', group: '授信', desc: '当前可用的授信额度', dataSourceId: 'ds_customer', type: 'base', field: 'avail_credit', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_credit_avg', name: '人均授信额度', group: '授信', desc: '授信额度/客户数', dataSourceId: 'ds_customer', type: 'base', field: 'credit_avg', agg: 'avg', unit: '元', precision: 0, enabled: true },
    { id: 'm_credit_peak', name: '授信使用峰值', group: '授信', desc: '历史授信使用峰值', dataSourceId: 'ds_loan', type: 'base', field: 'credit_peak', agg: 'max', unit: '元', precision: 0, enabled: true },
    { id: 'm_credit_recover', name: '额度回收金额', group: '授信', desc: '逾期后回收的授信额度', dataSourceId: 'ds_loan', type: 'base', field: 'credit_recover', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_credit_review', name: '额度复议次数', group: '授信', desc: '额度复议申请次数', dataSourceId: 'ds_customer', type: 'base', field: 'credit_review', agg: 'sum', unit: '次', precision: 0, enabled: true },
    { id: 'm_guarantee_credit', name: '担保授信额度', group: '授信', desc: '担保类授信总额', dataSourceId: 'ds_loan', type: 'base', field: 'guarantee_credit', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_pledge_credit', name: '质押授信额度', group: '授信', desc: '质押类授信总额', dataSourceId: 'ds_loan', type: 'base', field: 'pledge_credit', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_instal_credit', name: '分期授信额度', group: '授信', desc: '分期类授信总额', dataSourceId: 'ds_loan', type: 'base', field: 'instal_credit', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_cash_credit', name: '取现授信额度', group: '授信', desc: '可取现的授信额度', dataSourceId: 'ds_loan', type: 'base', field: 'cash_credit', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_credit_expire', name: '即将到期授信', group: '授信', desc: '30天内到期的授信额度', dataSourceId: 'ds_customer', type: 'base', field: 'credit_expire', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_credit_gap', name: '授信缺口', group: '授信', desc: '客户用信需求与授信差额', dataSourceId: 'ds_loan', type: 'base', field: 'credit_gap', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_cnt', name: '贷款笔数', group: '贷款', desc: '当前在贷贷款笔数', dataSourceId: 'ds_loan', type: 'base', field: 'loan_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_loan_total', name: '贷款发放总额', group: '贷款', desc: '历史累计发放贷款金额', dataSourceId: 'ds_loan', type: 'base', field: 'loan_total', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_principal', name: '剩余本金', group: '贷款', desc: '贷款未还本金合计', dataSourceId: 'ds_loan', type: 'base', field: 'loan_principal', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_interest', name: '应收利息', group: '贷款', desc: '已计提未收利息', dataSourceId: 'ds_loan', type: 'base', field: 'loan_interest', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_rate_avg', name: '平均贷款利率', group: '贷款', desc: '在贷贷款加权平均利率', dataSourceId: 'ds_loan', type: 'base', field: 'loan_rate_avg', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_loan_term_avg', name: '平均贷款期限', group: '贷款', desc: '贷款平均期限（月）', dataSourceId: 'ds_loan', type: 'base', field: 'loan_term_avg', agg: 'avg', unit: '月', precision: 0, enabled: true },
    { id: 'm_loan_remain_term', name: '剩余期数', group: '贷款', desc: '全部贷款剩余还款期数', dataSourceId: 'ds_loan', type: 'base', field: 'loan_remain_term', agg: 'sum', unit: '期', precision: 0, enabled: true },
    { id: 'm_loan_paid_term', name: '已还期数', group: '贷款', desc: '累计已还期数', dataSourceId: 'ds_loan', type: 'base', field: 'loan_paid_term', agg: 'sum', unit: '期', precision: 0, enabled: true },
    { id: 'm_monthly_pay', name: '月供合计', group: '贷款', desc: '客户月还款额合计', dataSourceId: 'ds_loan', type: 'base', field: 'monthly_pay', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_prepay', name: '提前还款金额', group: '贷款', desc: '提前还款金额合计', dataSourceId: 'ds_loan', type: 'base', field: 'loan_prepay', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_prepay_cnt', name: '提前还款次数', group: '贷款', desc: '提前还款笔数', dataSourceId: 'ds_loan', type: 'base', field: 'loan_prepay_cnt', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_loan_extend', name: '展期贷款金额', group: '贷款', desc: '展期贷款余额', dataSourceId: 'ds_loan', type: 'base', field: 'loan_extend', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_renew', name: '借新还旧金额', group: '贷款', desc: '借新还旧涉及金额', dataSourceId: 'ds_loan', type: 'base', field: 'loan_renew', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_new_cnt', name: '当月新增贷款笔数', group: '贷款', desc: '本月新发放贷款笔数', dataSourceId: 'ds_loan', type: 'base', field: 'loan_new_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_loan_mature', name: '当月到期贷款', group: '贷款', desc: '当月到期应还本金', dataSourceId: 'ds_loan', type: 'base', field: 'loan_mature', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_fine', name: '罚息金额', group: '贷款', desc: '逾期罚息合计', dataSourceId: 'ds_loan', type: 'base', field: 'loan_fine', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_compound', name: '复利金额', group: '贷款', desc: '复利计提金额', dataSourceId: 'ds_loan', type: 'base', field: 'loan_compound', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_latefee', name: '滞纳金金额', group: '贷款', desc: '滞纳金合计', dataSourceId: 'ds_loan', type: 'base', field: 'loan_latefee', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_status_dist', name: '贷款状态分布', group: '贷款', desc: '按贷款状态分组笔数', dataSourceId: 'ds_loan', type: 'base', field: 'loan_status_dist', agg: 'distinct', unit: '笔', precision: 0, enabled: true, vizType: 'pie' },
    { id: 'm_loan_product_dist', name: '产品分布', group: '贷款', desc: '按产品分组的贷款余额', dataSourceId: 'ds_loan', type: 'base', field: 'loan_product_dist', agg: 'distinct', unit: '元', precision: 0, enabled: true, vizType: 'pie' },
    { id: 'm_loan_stage5', name: '五级分类分布', group: '贷款', desc: '正常/关注/次级/可疑/损失分布', dataSourceId: 'ds_loan', type: 'base', field: 'loan_stage5', agg: 'distinct', unit: '元', precision: 0, enabled: true, vizType: 'bar' },
    { id: 'm_loan_disbursed', name: '本月放款金额', group: '贷款', desc: '本月实际放款金额', dataSourceId: 'ds_loan', type: 'base', field: 'loan_disbursed', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_loan_due_amt', name: '本月应还金额', group: '贷款', desc: '本月全部应还本息', dataSourceId: 'ds_loan', type: 'base', field: 'loan_due_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_overdue_days', name: '平均逾期天数', group: '风险', desc: '逾期客户平均逾期天数', dataSourceId: 'ds_loan', type: 'base', field: 'overdue_days', agg: 'avg', unit: '天', precision: 0, enabled: true },
    { id: 'm_overdue_cnt', name: '逾期客户数', group: '风险', desc: '存在逾期记录的客户数', dataSourceId: 'ds_loan', type: 'base', field: 'overdue_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_m1_amt', name: 'M1逾期金额', group: '风险', desc: '逾期1-30天金额', dataSourceId: 'ds_loan', type: 'base', field: 'm1_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_m2_amt', name: 'M2逾期金额', group: '风险', desc: '逾期31-60天金额', dataSourceId: 'ds_loan', type: 'base', field: 'm2_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_m3_amt', name: 'M3逾期金额', group: '风险', desc: '逾期61-90天金额', dataSourceId: 'ds_loan', type: 'base', field: 'm3_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_m4p_amt', name: 'M4+逾期金额', group: '风险', desc: '逾期90天以上金额', dataSourceId: 'ds_loan', type: 'base', field: 'm4p_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_risk_level_dist', name: '风险等级分布', group: '风险', desc: '低/中/高风险客户分布', dataSourceId: 'ds_customer', type: 'base', field: 'risk_level_dist', agg: 'distinct', unit: '人', precision: 0, enabled: true, vizType: 'pie' },
    { id: 'm_high_risk_cnt', name: '高风险客户数', group: '风险', desc: '风险等级=高的客户数', dataSourceId: 'ds_customer', type: 'base', field: 'high_risk_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_score_low_cnt', name: '低行为分客户数', group: '风险', desc: '行为分低于40的客户数', dataSourceId: 'ds_behavior', type: 'base', field: 'score_low_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_anti_fraud_score', name: '反欺诈均分', group: '风险', desc: '反欺诈评分均值', dataSourceId: 'ds_api_demo', type: 'base', field: 'anti_fraud_score', agg: 'avg', unit: '分', precision: 0, enabled: true },
    { id: 'm_credit_score', name: '信用均分', group: '风险', desc: '外部信用评分均值', dataSourceId: 'ds_api_demo', type: 'base', field: 'credit_score', agg: 'avg', unit: '分', precision: 0, enabled: true },
    { id: 'm_dti_ratio', name: '收入负债比', group: '风险', desc: '月负债/月收入×100', dataSourceId: 'ds_loan', type: 'base', field: 'dti_ratio', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_inq_cnt', name: '征信查询次数', group: '风险', desc: '近6个月征信硬查询次数', dataSourceId: 'ds_api_demo', type: 'base', field: 'inq_cnt', agg: 'sum', unit: '次', precision: 0, enabled: true },
    { id: 'm_inq_high_cnt', name: '查询频繁客户数', group: '风险', desc: '近6个月查询≥10次客户', dataSourceId: 'ds_api_demo', type: 'base', field: 'inq_high_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_rule_hit_cnt', name: '命中规则数', group: '风险', desc: '预警规则命中次数', dataSourceId: 'ds_alert', type: 'base', field: 'rule_hit_cnt', agg: 'sum', unit: '次', precision: 0, enabled: true },
    { id: 'm_yellow_cnt', name: '黄灯预警数', group: '风险', desc: '黄灯级别预警数', dataSourceId: 'ds_alert', type: 'base', field: 'yellow_cnt', agg: 'count', unit: '条', precision: 0, enabled: true },
    { id: 'm_multi_debt_cnt', name: '多头借贷客户数', group: '风险', desc: '近30天申贷≥3家客户数', dataSourceId: 'ds_api_demo', type: 'base', field: 'multi_debt_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_court_cnt', name: '涉诉客户数', group: '风险', desc: '有法律诉讼记录的客户数', dataSourceId: 'ds_api_demo', type: 'base', field: 'court_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_lost_debt_cnt', name: '失信客户数', group: '风险', desc: '失信被执行客户数', dataSourceId: 'ds_api_demo', type: 'base', field: 'lost_debt_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_relate_risk', name: '关联风险客户数', group: '风险', desc: '关联企业/担保圈风险客户', dataSourceId: 'ds_sql_demo', type: 'base', field: 'relate_risk', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_txn_amt', name: '交易金额', group: '行为', desc: '交易金额合计', dataSourceId: 'ds_behavior', type: 'base', field: 'txn_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_txn_cnt', name: '交易笔数', group: '行为', desc: '交易笔数合计', dataSourceId: 'ds_behavior', type: 'base', field: 'txn_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_txn_daily_avg', name: '日均交易金额', group: '行为', desc: '每日平均交易金额', dataSourceId: 'ds_behavior', type: 'base', field: 'txn_daily_avg', agg: 'avg', unit: '元', precision: 0, enabled: true },
    { id: 'm_txn_month_avg', name: '月均消费金额', group: '行为', desc: '每月平均消费金额', dataSourceId: 'ds_behavior', type: 'base', field: 'txn_month_avg', agg: 'avg', unit: '元', precision: 0, enabled: true },
    { id: 'm_txn_large_cnt', name: '大额交易笔数', group: '行为', desc: '单笔≥5万交易笔数', dataSourceId: 'ds_behavior', type: 'base', field: 'txn_large_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_txn_abnormal', name: '异常交易笔数', group: '行为', desc: '风控规则标记的异常交易', dataSourceId: 'ds_behavior', type: 'base', field: 'txn_abnormal', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_login_cnt', name: '登录次数', group: '行为', desc: '累计登录次数', dataSourceId: 'ds_behavior', type: 'base', field: 'login_cnt', agg: 'sum', unit: '次', precision: 0, enabled: true },
    { id: 'm_login_dev_cnt', name: '登录设备数', group: '行为', desc: '登录设备去重数', dataSourceId: 'ds_behavior', type: 'base', field: 'login_dev_cnt', agg: 'distinct', unit: '台', precision: 0, enabled: true },
    { id: 'm_active_ratio', name: '活跃率', group: '行为', desc: '活跃客户占比', dataSourceId: 'ds_behavior', type: 'base', field: 'active_ratio', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_txn_type_dist', name: '消费类型分布', group: '行为', desc: '按消费类型分组金额', dataSourceId: 'ds_behavior', type: 'base', field: 'txn_type_dist', agg: 'distinct', unit: '元', precision: 0, enabled: true, vizType: 'pie' },
    { id: 'm_online_amt', name: '线上消费金额', group: '行为', desc: '线上渠道消费金额', dataSourceId: 'ds_behavior', type: 'base', field: 'online_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_offline_amt', name: '线下消费金额', group: '行为', desc: '线下渠道消费金额', dataSourceId: 'ds_behavior', type: 'base', field: 'offline_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_transfer_amt', name: '转账金额', group: '行为', desc: '转账支出金额', dataSourceId: 'ds_behavior', type: 'base', field: 'transfer_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_transfer_cnt', name: '转账笔数', group: '行为', desc: '转账笔数', dataSourceId: 'ds_behavior', type: 'base', field: 'transfer_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_receive_amt', name: '收款金额', group: '行为', desc: '收款入账金额', dataSourceId: 'ds_behavior', type: 'base', field: 'receive_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_receive_cnt', name: '收款笔数', group: '行为', desc: '收款笔数', dataSourceId: 'ds_behavior', type: 'base', field: 'receive_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_game_amt', name: '游戏充值金额', group: '行为', desc: '游戏类充值金额', dataSourceId: 'ds_behavior', type: 'base', field: 'game_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_dining_amt', name: '餐饮消费金额', group: '行为', desc: '餐饮类消费金额', dataSourceId: 'ds_behavior', type: 'base', field: 'dining_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_shopping_amt', name: '网购消费金额', group: '行为', desc: '电商类消费金额', dataSourceId: 'ds_behavior', type: 'base', field: 'shopping_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_travel_amt', name: '出行消费金额', group: '行为', desc: '出行类消费金额', dataSourceId: 'ds_behavior', type: 'base', field: 'travel_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_pay_fail_cnt', name: '支付失败笔数', group: '行为', desc: '支付失败交易笔数', dataSourceId: 'ds_behavior', type: 'base', field: 'pay_fail_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_refund_amt', name: '退款金额', group: '行为', desc: '退款金额合计', dataSourceId: 'ds_behavior', type: 'base', field: 'refund_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_withdraw_cnt', name: '提现次数', group: '行为', desc: '提现次数', dataSourceId: 'ds_behavior', type: 'base', field: 'withdraw_cnt', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_fraud_hit', name: '欺诈命中次数', group: '欺诈', desc: '欺诈规则命中次数', dataSourceId: 'ds_api_demo', type: 'base', field: 'fraud_hit', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_fraud_hit_cust', name: '欺诈命中客户数', group: '欺诈', desc: '命中欺诈规则的客户数', dataSourceId: 'ds_api_demo', type: 'base', field: 'fraud_hit_cust', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_fraud_score', name: '欺诈评分', group: '欺诈', desc: '欺诈风险评分均值', dataSourceId: 'ds_api_demo', type: 'base', field: 'fraud_score', agg: 'avg', unit: '分', precision: 0, enabled: true },
    { id: 'm_device_cnt', name: '设备指纹数', group: '欺诈', desc: '设备指纹去重数', dataSourceId: 'ds_behavior', type: 'base', field: 'device_cnt', agg: 'distinct', unit: '台', precision: 0, enabled: true },
    { id: 'm_device_risk', name: '高危设备数', group: '欺诈', desc: '标记高危设备数量', dataSourceId: 'ds_behavior', type: 'base', field: 'device_risk', agg: 'count', unit: '台', precision: 0, enabled: true },
    { id: 'm_ip_risk_cnt', name: '风险IP交易笔数', group: '欺诈', desc: '风险IP发起的交易笔数', dataSourceId: 'ds_behavior', type: 'base', field: 'ip_risk_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_geo_abnormal', name: '异地登录次数', group: '欺诈', desc: '与常用地不符的登录', dataSourceId: 'ds_behavior', type: 'base', field: 'geo_abnormal', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_stolen_cnt', name: '盗刷交易笔数', group: '欺诈', desc: '疑似盗刷交易笔数', dataSourceId: 'ds_api_demo', type: 'base', field: 'stolen_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_cashout_cnt', name: '套现交易笔数', group: '欺诈', desc: '疑似套现交易笔数', dataSourceId: 'ds_behavior', type: 'base', field: 'cashout_cnt', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_cashout_amt', name: '套现交易金额', group: '欺诈', desc: '疑似套现金额', dataSourceId: 'ds_behavior', type: 'base', field: 'cashout_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_aml_cnt', name: '反洗钱预警次数', group: '欺诈', desc: '可疑洗钱交易预警次数', dataSourceId: 'ds_sql_demo', type: 'base', field: 'aml_cnt', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_aml_amt', name: '可疑交易金额', group: '欺诈', desc: '可疑资金流动金额', dataSourceId: 'ds_sql_demo', type: 'base', field: 'aml_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_sybil_cnt', name: '团伙关联客户数', group: '欺诈', desc: '关联团伙客户数', dataSourceId: 'ds_sql_demo', type: 'base', field: 'sybil_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_wool_cnt', name: '羊毛党命中次数', group: '欺诈', desc: '营销活动套利命中次数', dataSourceId: 'ds_behavior', type: 'base', field: 'wool_cnt', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_proxy_ip', name: '代理IP交易笔数', group: '欺诈', desc: '代理/匿名IP交易笔数', dataSourceId: 'ds_behavior', type: 'base', field: 'proxy_ip', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_emu_cnt', name: '模拟器设备数', group: '欺诈', desc: '模拟器环境设备数', dataSourceId: 'ds_behavior', type: 'base', field: 'emu_cnt', agg: 'count', unit: '台', precision: 0, enabled: true },
    { id: 'm_root_cnt', name: '越狱设备数', group: '欺诈', desc: 'root/越狱设备数', dataSourceId: 'ds_behavior', type: 'base', field: 'root_cnt', agg: 'count', unit: '台', precision: 0, enabled: true },
    { id: 'm_batch_open', name: '批量开户数量', group: '欺诈', desc: '同设备批量开户数', dataSourceId: 'ds_sql_demo', type: 'base', field: 'batch_open', agg: 'count', unit: '户', precision: 0, enabled: true },
    { id: 'm_cred_stuff', name: '撞库攻击次数', group: '欺诈', desc: '撞库登录攻击次数', dataSourceId: 'ds_sql_demo', type: 'base', field: 'cred_stuff', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_phish_cnt', name: '钓鱼投诉次数', group: '欺诈', desc: '钓鱼欺诈投诉次数', dataSourceId: 'ds_sql_demo', type: 'base', field: 'phish_cnt', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_open_abn', name: '开户异常笔数', group: '欺诈', desc: '开户信息异常笔数', dataSourceId: 'ds_sql_demo', type: 'base', field: 'open_abn', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_txn_abn_amt', name: '异常交易金额', group: '欺诈', desc: '风控标记异常交易金额', dataSourceId: 'ds_behavior', type: 'base', field: 'txn_abn_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_collect_cnt', name: '催收次数', group: '处置', desc: '催收联系次数合计', dataSourceId: 'ds_alert', type: 'base', field: 'collect_cnt', agg: 'sum', unit: '次', precision: 0, enabled: true },
    { id: 'm_recover_rate', name: '回款率', group: '处置', desc: '催收回款金额/应收金额', dataSourceId: 'ds_alert', type: 'base', field: 'recover_rate', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_recover_amt', name: '催收回款金额', group: '处置', desc: '催收实际回款金额', dataSourceId: 'ds_alert', type: 'base', field: 'recover_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_promise_cnt', name: '承诺还款次数', group: '处置', desc: '客户承诺还款次数', dataSourceId: 'ds_alert', type: 'base', field: 'promise_cnt', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_promise_keep', name: '承诺履约率', group: '处置', desc: '承诺按期履约比例', dataSourceId: 'ds_alert', type: 'base', field: 'promise_keep', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_workorder_cnt', name: '催收工单数', group: '处置', desc: '催收工单数量', dataSourceId: 'ds_alert', type: 'base', field: 'workorder_cnt', agg: 'count', unit: '单', precision: 0, enabled: true },
    { id: 'm_workorder_overdue', name: '工单超时数', group: '处置', desc: '超过SLA未处理工单', dataSourceId: 'ds_alert', type: 'base', field: 'workorder_overdue', agg: 'count', unit: '单', precision: 0, enabled: true },
    { id: 'm_lost_contact', name: '失联客户数', group: '处置', desc: '催收失联客户数', dataSourceId: 'ds_alert', type: 'base', field: 'lost_contact', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_contact_rate', name: '电话接通率', group: '处置', desc: '催收电话接通比例', dataSourceId: 'ds_alert', type: 'base', field: 'contact_rate', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_outsource', name: '委外催收金额', group: '处置', desc: '委外机构承接金额', dataSourceId: 'ds_alert', type: 'base', field: 'outsource', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_visit_cnt', name: '上门催收次数', group: '处置', desc: '上门催收次数', dataSourceId: 'ds_alert', type: 'base', field: 'visit_cnt', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_lawsuit_cnt', name: '诉讼案件数', group: '处置', desc: '催收诉讼案件数量', dataSourceId: 'ds_alert', type: 'base', field: 'lawsuit_cnt', agg: 'count', unit: '件', precision: 0, enabled: true },
    { id: 'm_writeoff_amt', name: '核销金额', group: '处置', desc: '不良贷款核销金额', dataSourceId: 'ds_alert', type: 'base', field: 'writeoff_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_writeoff_recover', name: '核销回收金额', group: '处置', desc: '核销后追回金额', dataSourceId: 'ds_alert', type: 'base', field: 'writeoff_recover', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_relief_amt', name: '减免金额', group: '处置', desc: '减免本金利息金额', dataSourceId: 'ds_alert', type: 'base', field: 'relief_amt', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_collect_eff', name: '有效催收率', group: '处置', desc: '有效催收联系/总联系', dataSourceId: 'ds_alert', type: 'base', field: 'collect_eff', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_promo_cnt', name: '促活客户数', group: '营销', desc: '促活营销触达客户数', dataSourceId: 'ds_behavior', type: 'base', field: 'promo_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_invite_cnt', name: '提额邀请数', group: '营销', desc: '提额邀请发送次数', dataSourceId: 'ds_customer', type: 'base', field: 'invite_cnt', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_cross_sell', name: '交叉销售数', group: '营销', desc: '交叉销售成交次数', dataSourceId: 'ds_behavior', type: 'base', field: 'cross_sell', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_resp_rate', name: '营销响应率', group: '营销', desc: '营销活动响应比例', dataSourceId: 'ds_behavior', type: 'base', field: 'resp_rate', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_conv_rate', name: '转化率', group: '营销', desc: '营销线索转化比例', dataSourceId: 'ds_behavior', type: 'base', field: 'conv_rate', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_activate_rate', name: '激活率', group: '营销', desc: '新客激活比例', dataSourceId: 'ds_behavior', type: 'base', field: 'activate_rate', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_retain_rate', name: '留存率', group: '营销', desc: '次月留存比例', dataSourceId: 'ds_behavior', type: 'base', field: 'retain_rate', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_rebuy_rate', name: '复购率', group: '营销', desc: '重复消费比例', dataSourceId: 'ds_behavior', type: 'base', field: 'rebuy_rate', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_refer_cnt', name: '推荐客户数', group: '营销', desc: '老带新推荐客户数', dataSourceId: 'ds_customer', type: 'base', field: 'refer_cnt', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_coupon_use', name: '优惠券使用数', group: '营销', desc: '优惠券核销数量', dataSourceId: 'ds_behavior', type: 'base', field: 'coupon_use', agg: 'count', unit: '张', precision: 0, enabled: true },
    { id: 'm_activity_join', name: '活动参与人数', group: '营销', desc: '营销活动参与人数', dataSourceId: 'ds_behavior', type: 'base', field: 'activity_join', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_sleep_wake', name: '沉睡唤醒数', group: '营销', desc: '沉睡客户唤醒数量', dataSourceId: 'ds_behavior', type: 'base', field: 'sleep_wake', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_churn_warn', name: '流失预警客户数', group: '营销', desc: '预警流失风险客户数', dataSourceId: 'ds_behavior', type: 'base', field: 'churn_warn', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_churn_save', name: '流失挽回数', group: '营销', desc: '挽回流失客户数量', dataSourceId: 'ds_behavior', type: 'base', field: 'churn_save', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_page_view', name: '页面浏览次数', group: '事件分析', desc: '页面浏览 PV', dataSourceId: 'ds_event', type: 'base', field: 'page_view', agg: 'sum', unit: '次', precision: 0, enabled: true },
    { id: 'm_btn_click', name: '按钮点击次数', group: '事件分析', desc: '关键按钮点击次数', dataSourceId: 'ds_event', type: 'base', field: 'btn_click', agg: 'sum', unit: '次', precision: 0, enabled: true },
    { id: 'm_car_ratio', name: '资本充足率', group: '合规', desc: '资本充足率监管指标', dataSourceId: 'ds_sql_demo', type: 'base', field: 'car_ratio', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_provision', name: '拨备覆盖率', group: '合规', desc: '拨备覆盖率监管指标', dataSourceId: 'ds_sql_demo', type: 'base', field: 'provision', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_leverage', name: '杠杆率', group: '合规', desc: '杠杆率监管指标', dataSourceId: 'ds_sql_demo', type: 'base', field: 'leverage', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_age_lt25', name: '25岁以下客户数', group: '客群', desc: '年龄<25岁的在贷客户数', dataSourceId: 'ds_customer', type: 'base', field: 'age_lt25', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_age_50p', name: '50岁以上客户数', group: '客群', desc: '年龄≥50岁的在贷客户数', dataSourceId: 'ds_customer', type: 'base', field: 'age_50p', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_local_cust', name: '本地户籍客户数', group: '客群', desc: '户籍地与常驻地一致的客户数', dataSourceId: 'ds_customer', type: 'base', field: 'local_cust', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_credit_fixed', name: '固定授信额度', group: '授信', desc: '固定额度授信总额', dataSourceId: 'ds_customer', type: 'base', field: 'credit_fixed', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_credit_self', name: '自助提额次数', group: '授信', desc: '客户自助申请提额次数', dataSourceId: 'ds_customer', type: 'base', field: 'credit_self', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_credit_reval', name: '额度重估次数', group: '授信', desc: '系统额度重估次数', dataSourceId: 'ds_customer', type: 'base', field: 'credit_reval', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_loan_settle', name: '当月结清贷款', group: '贷款', desc: '当月正常结清贷款笔数', dataSourceId: 'ds_loan', type: 'base', field: 'loan_settle', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_loan_migrate', name: '贷款迁徙率', group: '贷款', desc: 'M0→M1迁徙比例', dataSourceId: 'ds_loan', type: 'base', field: 'loan_migrate', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_loan_util_days', name: '贷款使用天数', group: '贷款', desc: '贷款平均实际使用天数', dataSourceId: 'ds_loan', type: 'base', field: 'loan_util_days', agg: 'avg', unit: '天', precision: 0, enabled: true },
    { id: 'm_first_overdue', name: '首逾率', group: '风险', desc: '新发放贷款首次逾期比例', dataSourceId: 'ds_loan', type: 'base', field: 'first_overdue', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_three_six', name: '连三累六客户数', group: '风险', desc: '连续3次/累计6次逾期客户', dataSourceId: 'ds_loan', type: 'base', field: 'three_six', agg: 'count', unit: '人', precision: 0, enabled: true },
    { id: 'm_sleep_cust', name: '睡眠客户占比', group: '风险', desc: '30天无交易客户占比', dataSourceId: 'ds_behavior', type: 'base', field: 'sleep_cust', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_night_txn', name: '夜间消费金额', group: '行为', desc: '22:00-06:00消费金额', dataSourceId: 'ds_behavior', type: 'base', field: 'night_txn', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_offsite_txn', name: '异地消费金额', group: '行为', desc: '非常驻地消费金额', dataSourceId: 'ds_behavior', type: 'base', field: 'offsite_txn', agg: 'sum', unit: '元', precision: 0, enabled: true },
    { id: 'm_fake_info', name: '虚假资料申请数', group: '欺诈', desc: '申请资料造假笔数', dataSourceId: 'ds_sql_demo', type: 'base', field: 'fake_info', agg: 'count', unit: '笔', precision: 0, enabled: true },
    { id: 'm_collect_complaint', name: '催收投诉次数', group: '处置', desc: '催收相关客户投诉次数', dataSourceId: 'ds_alert', type: 'base', field: 'collect_complaint', agg: 'count', unit: '次', precision: 0, enabled: true },
    { id: 'm_pay_intent', name: '还款意愿评分', group: '处置', desc: '客户还款意愿评分均值', dataSourceId: 'ds_alert', type: 'base', field: 'pay_intent', agg: 'avg', unit: '分', precision: 0, enabled: true },
    { id: 'm_click_rate', name: '按钮点击率', group: '事件分析', desc: '按钮点击/曝光比例', dataSourceId: 'ds_event', type: 'base', field: 'click_rate', agg: 'avg', unit: '%', precision: 2, enabled: true },
    { id: 'm_stay_dur', name: '平均停留时长', group: '事件分析', desc: '页面平均停留时长', dataSourceId: 'ds_event', type: 'base', field: 'stay_dur', agg: 'avg', unit: '秒', precision: 0, enabled: true },
  {'id': 'm_pre_in_cnt', 'name': '今日进件量', 'group': '贷前', 'dataSourceId': 'ds_pre_apply', 'type': 'base', 'field': 'apply_id', 'agg': 'count', 'unit': '笔', 'precision': 0, 'enabled': true, 'desc': '今日进件申请总笔数'},
  {'id': 'm_pre_pass_cnt', 'name': '进件通过数', 'group': '贷前', 'dataSourceId': 'ds_pre_apply', 'type': 'base', 'field': 'apply_id', 'agg': 'count', 'filters': [{'field': 'decision', 'op': 'eq', 'value': '通过'}], 'unit': '笔', 'precision': 0, 'enabled': true, 'desc': '审批结论=通过的进件数'},
  {'id': 'm_pre_pass_rate', 'name': '进件通过率', 'group': '贷前', 'dataSourceId': 'ds_pre_apply', 'type': 'derived', 'formula': 'm_pre_pass_cnt / m_pre_in_cnt * 100', 'unit': '%', 'precision': 1, 'enabled': true, 'desc': '通过数/进件量'},
  {'id': 'm_pre_fraud_cnt', 'name': '欺诈命中件数', 'group': '贷前', 'dataSourceId': 'ds_pre_apply', 'type': 'base', 'field': 'apply_id', 'agg': 'count', 'filters': [{'field': 'fraud_hit', 'op': 'eq', 'value': '是'}], 'unit': '件', 'precision': 0, 'enabled': true, 'desc': '欺诈命中=是的进件数'},
  {'id': 'm_pre_fraud_rate', 'name': '欺诈命中率', 'group': '贷前', 'dataSourceId': 'ds_pre_apply', 'type': 'derived', 'formula': 'm_pre_fraud_cnt / m_pre_in_cnt * 100', 'unit': '%', 'precision': 1, 'enabled': true, 'desc': '欺诈命中件数/进件量'},
];

/* ---------- 监控任务详情要原样展示的「事件分析配置」（逐字照搬 record/temp/event，常量直渲，不依赖磁盘 JSON，保证与文档一致） ---------- */
export const EVENT_ANALYSIS_CONFIG = {
  subject: '用户 ID (默认)',
  timezone: 'UTC-03:00',
  summary: '快速总和',
  events: [
    { id: 'A', name: 'Web 视区停留的过去 7 天总次数', event: 'Web视区停留', metric: '总次数' },
    { id: 'B', name: '直播间-点击立即购买的人均次数', event: '直播间-点击立即购买', metric: '人均次数' },
    { id: 'C', name: '自定义指标2', event: '直播间-点击立即购买', metric: '自定义指标', formula: '用户数 / 总次数 · 百分比 · 按分子属性查看' },
  ],
  filterRel: '且',
  filters: [
    { prop: 'IP', op: '有值', values: [] as string[] },
    { prop: '$启动时长', op: '大于', values: ['[阈值未解析，暂置 0]'] },
    { prop: '国家', op: '包含', values: ['中国', '美国', '日本', '瑞士', '德国', '土耳其', '印度', '英国', '奥地利'] },
  ],
  group: '省份',
  time: '按天',
  monitor: { granularity: '按小时', period: '每周 7 天 × 24 小时槽（00:00–24:00）' },
};

export const SEED_STRATEGY: MidStrategy = {
  tasks: [
    { id: 't001', name: '全量在贷客户逾期率日扫', crowd: '全量在贷客户', scene: '贷中风控',
      granularity: 'day', period: {'hours': ['00']},
      metricIds: ['m_overdue_rate', 'm_overdue_cnt'], output: 'web', enabled: true,
      desc: '每日 00:00 扫描全量在贷客群逾期率与逾期客户数，超阈值触发红黄灯预警', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't002', name: '信用卡客群逾期抬头监控', crowd: '存量信用卡客户', scene: '贷中风控',
      granularity: 'day', period: {'hours': ['00']},
      metricIds: ['m_overdue_rate', 'm_m1_amt'], output: 'web', enabled: true,
      desc: '信用卡客群 M1 逾期金额日级跟踪，抬头即预警', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't003', name: '消费贷资产质量日监控', crowd: '消费贷在贷客户', scene: '贷中风控',
      granularity: 'day', period: {'hours': ['01']},
      metricIds: ['m_overdue_rate', 'm_loan_balance'], output: 'web', enabled: true,
      desc: '消费贷资产质量与余额日监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't004', name: '经营贷逾期率周报', crowd: '经营贷在贷客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['mon', 'wed', 'fri'], 'hours': ['09']},
      metricIds: ['m_overdue_rate'], output: 'web', enabled: true,
      desc: '经营贷逾期率周度趋势，周五 09:00 复核', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't005', name: 'M1 逾期金额滚动监控', crowd: '全量在贷客户', scene: '贷中风控',
      granularity: 'day', period: {'hours': ['02']},
      metricIds: ['m_m1_amt', 'm_overdue_cnt'], output: 'web', enabled: true,
      desc: 'M1 逾期金额滚动监控，防首逾恶化', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't006', name: 'M2 逾期资产周监控', crowd: 'M1/M2 逾期客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['tue'], 'hours': ['09']},
      metricIds: ['m_m2_amt'], output: 'web', enabled: true,
      desc: 'M2 逾期资产每周盘点', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't007', name: 'M3+ 严重逾期资产监控', crowd: 'M3+ 逾期客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['thu'], 'hours': ['10']},
      metricIds: ['m_m3_amt', 'm_m4p_amt'], output: 'web', enabled: true,
      desc: 'M3+ 严重逾期资产监控，联动处置策略', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't008', name: '首逾率趋势监控', crowd: '新增放款客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['09']},
      metricIds: ['m_first_overdue'], output: 'web', enabled: true,
      desc: '新客首逾率周监控，评估进件质量', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't009', name: '连三累六高风险客户识别', crowd: '全量在贷客户', scene: '贷中风控',
      granularity: 'month', period: {'hours': ['02']},
      metricIds: ['m_three_six'], output: 'web', enabled: true,
      desc: '连三累六（连续3期/累计6期逾期）客户月度识别', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't010', name: '逾期天数均值监控', crowd: '逾期客户', scene: '贷中风控',
      granularity: 'day', period: {'hours': ['03']},
      metricIds: ['m_overdue_days'], output: 'web', enabled: true,
      desc: '平均逾期天数日监控，观察催收进展', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't011', name: '罚息滞纳金增长监控', crowd: '逾期客户', scene: '贷中风控',
      granularity: 'month', period: {'hours': ['03']},
      metricIds: ['m_loan_fine', 'm_loan_latefee'], output: 'web', enabled: true,
      desc: '罚息/滞纳金月度增长监控，评估计息合规', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't012', name: '五级分类迁徙监控', crowd: '全量贷款资产', scene: '贷中风控',
      granularity: 'month', period: {'hours': ['04']},
      metricIds: ['m_loan_stage5', 'm_loan_migrate'], output: 'web', enabled: true,
      desc: '贷款五级分类迁徙月度监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't013', name: '不良贷款新增监控', crowd: '全量在贷客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['fri'], 'hours': ['09']},
      metricIds: ['m_npl_amt', 'm_npl_rate'], output: 'web', enabled: true,
      desc: '新增不良贷款周监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't014', name: '行为分骤降预警', crowd: '行为分≥70 的存量客户', scene: '贷中风控',
      granularity: 'day', period: {'hours': ['08']},
      metricIds: ['m_score_avg'], output: 'web', enabled: true,
      desc: '客户行为分单日骤降触发关注', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't015', name: '低行为分客户清单', crowd: '全量活跃客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['tue', 'thu'], 'hours': ['09']},
      metricIds: ['m_score_low_cnt'], output: 'web', enabled: true,
      desc: '行为分持续走低客户名单周更新', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't016', name: '高额度客户用信率监控', crowd: '授信额度≥50万客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['10']},
      metricIds: ['m_util_rate'], output: 'web', enabled: true,
      desc: '高敞口客户额度使用率周监控，接近上限提前预警', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't017', name: '额度使用率超90%预警', crowd: '全部授信客户', scene: '贷中风控',
      granularity: 'day', period: {'hours': ['09']},
      metricIds: ['m_util_high_cnt'], output: 'web', enabled: true,
      desc: '额度使用率>90% 客户日预警，防过度用信', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't018', name: '授信缺口客户监控', crowd: '有授信缺口客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['wed'], 'hours': ['10']},
      metricIds: ['m_credit_gap'], output: 'web', enabled: true,
      desc: '授信缺口客户周盘点，评估补充授信', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't019', name: '可用额度骤降监控', crowd: '全部在用客户', scene: '贷中风控',
      granularity: 'day', period: {'hours': ['10']},
      metricIds: ['m_avail_credit'], output: 'web', enabled: true,
      desc: '可用额度单日骤降监控，防异常透支', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't020', name: '即将到期授信回收监控', crowd: '授信临期客户', scene: '贷中风控',
      granularity: 'month', period: {'hours': ['05']},
      metricIds: ['m_credit_expire'], output: 'web', enabled: true,
      desc: '即将到期授信月度回收计划监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't021', name: '涉诉客户风险监控', crowd: '全量在贷客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['11']},
      metricIds: ['m_court_cnt'], output: 'web', enabled: true,
      desc: '新增司法涉诉客户周监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't022', name: '失信被执行人监控', crowd: '全量在贷客户', scene: '贷中风控',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['11']},
      metricIds: ['m_lost_debt_cnt'], output: 'web', enabled: true,
      desc: '新增失信被执行人周监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't023', name: '异常登录事件监控', crowd: '全部登录用户', scene: '反欺诈监测',
      granularity: 'hour', period: {'days': ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], 'hours': ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']},
      metricIds: ['m_login_cnt', 'm_login_dev_cnt'], output: 'web', enabled: true,
      desc: '按小时扫描异常登录（登录频次/设备数突变）', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't024', name: '异地登录与夜间消费监控', crowd: '全部在用客户', scene: '反欺诈监测',
      granularity: 'day', period: {'hours': ['11']},
      metricIds: ['m_geo_abnormal', 'm_offsite_txn', 'm_night_txn'], output: 'web', enabled: true,
      desc: '异地登录+夜间/异地消费组合异常监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't025', name: '大额交易实时监控', crowd: '单笔≥10万交易客户', scene: '反欺诈监测',
      granularity: 'minute', period: {},
      metricIds: ['m_txn_large_cnt'], output: 'web', enabled: true,
      desc: '大额交易分钟级实时预警', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't026', name: '支付失败率监控', crowd: '全部在用客户', scene: '反欺诈监测',
      granularity: 'day', period: {'hours': ['12']},
      metricIds: ['m_pay_fail_cnt'], output: 'web', enabled: true,
      desc: '支付失败笔数日监控，识别卡盗刷/账户异常', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't027', name: '反欺诈命中实时监控', crowd: '全部申请/在用客户', scene: '反欺诈监测',
      granularity: 'hour', period: {'days': ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], 'hours': ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']},
      metricIds: ['m_fraud_hit', 'm_fraud_hit_cust'], output: 'web', enabled: true,
      desc: '反欺诈规则命中实时监控（含黑名单命中）', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't028', name: '高危设备与模拟器监控', crowd: '全部在用客户', scene: '反欺诈监测',
      granularity: 'day', period: {'hours': ['13']},
      metricIds: ['m_device_risk', 'm_emu_cnt', 'm_root_cnt'], output: 'web', enabled: true,
      desc: '高危设备/模拟器/越狱设备日监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't029', name: '风险IP交易监控', crowd: '全部在用客户', scene: '反欺诈监测',
      granularity: 'day', period: {'hours': ['13']},
      metricIds: ['m_ip_risk_cnt', 'm_proxy_ip'], output: 'web', enabled: true,
      desc: '风险IP/代理IP交易日监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't030', name: '盗刷交易监控', crowd: '全部在用客户', scene: '反欺诈监测',
      granularity: 'hour', period: {'days': ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], 'hours': ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']},
      metricIds: ['m_stolen_cnt'], output: 'web', enabled: true,
      desc: '盗刷交易小时级实时预警', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't031', name: '套现交易监控', crowd: '信用卡/取现客户', scene: '反欺诈监测',
      granularity: 'day', period: {'hours': ['14']},
      metricIds: ['m_cashout_cnt', 'm_cashout_amt'], output: 'web', enabled: true,
      desc: '信用卡套现交易日监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't032', name: '反洗钱可疑交易监控', crowd: '全部在用客户', scene: '反欺诈监测',
      granularity: 'hour', period: {'days': ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], 'hours': ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23']},
      metricIds: ['m_aml_cnt', 'm_aml_amt'], output: 'web', enabled: true,
      desc: '可疑跨境资金流动小时级实时预警', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't033', name: '团伙关联风险监控', crowd: '全部在用客户', scene: '反欺诈监测',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['14']},
      metricIds: ['m_sybil_cnt'], output: 'web', enabled: true,
      desc: '欺诈团伙关联客户周监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't034', name: '批量开户与撞库监控', crowd: '开户/登录用户', scene: '反欺诈监测',
      granularity: 'day', period: {'hours': ['15']},
      metricIds: ['m_batch_open', 'm_cred_stuff'], output: 'web', enabled: true,
      desc: '同IP批量开户/撞库攻击日监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't035', name: '多头借贷客户监控', crowd: '全量在贷客户', scene: '反欺诈监测',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['15']},
      metricIds: ['m_multi_debt_cnt'], output: 'web', enabled: true,
      desc: '多头借贷（多平台共债）客户周监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't036', name: '征信查询激增监控', crowd: '全量在贷客户', scene: '反欺诈监测',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['15']},
      metricIds: ['m_inq_high_cnt', 'm_inq_cnt'], output: 'web', enabled: true,
      desc: '征信查询频次激增周监控，识别共债风险', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't037', name: '催收工单响应监控', crowd: '催收队列客户', scene: '贷后催收',
      granularity: 'day', period: {'hours': ['17']},
      metricIds: ['m_workorder_cnt', 'm_workorder_overdue'], output: 'web', enabled: true,
      desc: '催收工单 2 小时响应率日监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't038', name: '失联客户监控', crowd: '逾期客户', scene: '贷后催收',
      granularity: 'day', period: {'hours': ['18']},
      metricIds: ['m_lost_contact', 'm_contact_rate'], output: 'web', enabled: true,
      desc: '失联客户数与电话接通率日监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't039', name: '承诺还款履约监控', crowd: '承诺还款客户', scene: '贷后催收',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['16']},
      metricIds: ['m_promise_cnt', 'm_promise_keep'], output: 'web', enabled: true,
      desc: '承诺还款履约率周监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't040', name: '催收回款率监控', crowd: '催收队列客户', scene: '贷后催收',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['16']},
      metricIds: ['m_recover_rate', 'm_recover_amt'], output: 'web', enabled: true,
      desc: '催收回款率与回款金额周监控', flowKey: 'f-online-approve', flowState: '已上线' },
    { id: 't041', name: '委外催收进度监控', crowd: '委外资产客户', scene: '贷后催收',
      granularity: 'month', period: {'hours': ['06']},
      metricIds: ['m_outsource'], output: 'web', enabled: true,
      desc: '委外催收金额与进度月度监控', flowKey: 'f-online-approve', flowState: '复审中' },
    { id: 't042', name: '诉讼与核销监控', crowd: '诉讼/核销资产', scene: '贷后催收',
      granularity: 'month', period: {'hours': ['07']},
      metricIds: ['m_lawsuit_cnt', 'm_writeoff_amt'], output: 'web', enabled: true,
      desc: '诉讼案件与核销金额月度监控', flowKey: 'f-online-approve', flowState: '复审中' },
    { id: 't043', name: '核销回收评估', crowd: '核销资产', scene: '贷后催收',
      granularity: 'month', period: {'hours': ['07']},
      metricIds: ['m_writeoff_recover'], output: 'web', enabled: true,
      desc: '核销客户回收率月度评估', flowKey: 'f-online-approve', flowState: '复审中' },
    { id: 't044', name: '催收投诉合规监控', crowd: '催收队列客户', scene: '贷后催收',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['17']},
      metricIds: ['m_collect_complaint'], output: 'web', enabled: true,
      desc: '催收投诉集中度周监控，合规红线', flowKey: 'f-online-approve', flowState: '复审中' },
    { id: 't045', name: '有效催收率监控', crowd: '催收队列客户', scene: '贷后催收',
      granularity: 'day', period: {'hours': ['19']},
      metricIds: ['m_collect_eff'], output: 'web', enabled: true,
      desc: '有效催收率日监控', flowKey: 'f-online-approve', flowState: '复审中' },
    { id: 't046', name: '睡眠客户唤醒监控', crowd: '睡眠客户', scene: '存量运营',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['18']},
      metricIds: ['m_sleep_wake', 'm_sleep_cust'], output: 'web', enabled: true,
      desc: '睡眠客户唤醒活动效果周监控', flowKey: 'f-online-approve', flowState: '初审中' },
    { id: 't047', name: '提额机会识别', crowd: '活跃优质客户', scene: '存量运营',
      granularity: 'week', period: {'days': ['mon'], 'hours': ['18']},
      metricIds: ['m_invite_cnt', 'm_util_rate'], output: 'web', enabled: true,
      desc: '提额邀请候选识别，促用信增收', flowKey: 'f-online-approve', flowState: '初审中' },
    { id: 't048', name: '流失预警与挽回', crowd: '活跃度骤降客户', scene: '存量运营',
      granularity: 'week', period: {'days': ['tue'], 'hours': ['18']},
      metricIds: ['m_churn_warn', 'm_churn_save'], output: 'web', enabled: true,
      desc: '老客流失预警与挽回周监控', flowKey: 'f-online-approve', flowState: '初审中' },
    { id: 't049', name: '老客促活监控', crowd: '存量在贷客户', scene: '存量运营',
      granularity: 'week', period: {'days': ['wed'], 'hours': ['18']},
      metricIds: ['m_promo_cnt', 'm_activity_join'], output: 'web', enabled: true,
      desc: '促活活动参与度周监控', flowKey: 'f-online-approve', flowState: '待上线' },
    { id: 't050', name: '交叉销售机会监控', crowd: '存量优质客户', scene: '存量运营',
      granularity: 'week', period: {'days': ['thu'], 'hours': ['18']},
      metricIds: ['m_cross_sell', 'm_resp_rate'], output: 'web', enabled: true,
      desc: '交叉销售机会识别与响应率周监控', flowKey: 'f-online-approve', flowState: '待上线' },
  ],
  rules: [
    { id: 'r_ip', name: 'IP 有值', logic: 'and', conds: [{ id: 'c_ip', metricId: 'm_ip', op: 'exists', value: '' }], level: 'YELLOW',
      groupValue: ['总体'], triggerMode: 'int', compare: 'lt', baseline: 'yesterday', threshold: 0,
      desc: 'IP 字段有值（事件属性非空）' , alertType: '反欺诈命中' },
    { id: 'r_startup', name: '$启动时长 大于阈值', logic: 'and', conds: [{ id: 'c_su', metricId: 'm_startup_dur', op: 'gt', value: 0 }], level: 'YELLOW',
      groupValue: ['总体'], triggerMode: 'int', compare: 'lt', baseline: 'yesterday', threshold: 0,
      desc: '$启动时长 大于阈值；阈值文件未解析，暂置 0，待你确认真实值' , alertType: '行为评分下降' },
    { id: 'r_country', name: '国家 包含白名单', logic: 'and', conds: [{ id: 'c_ct', metricId: 'm_country', op: 'contains', value: '中国,美国,日本,瑞士,德国,土耳其,印度,英国,奥地利' }], level: 'RED',
      groupValue: ['总体'], triggerMode: 'int', compare: 'lt', baseline: 'yesterday', threshold: 0,
      desc: '国家 包含（中国/美国/日本/瑞士/德国/土耳其/印度/英国/奥地利）', alertType: '反欺诈命中' },
  ],
  disposes: [
    { id: 'd1', name: '红灯·自动冻结', triggerLevel: 'RED', action: '冻结', targetSystem: '核心信贷系统', needApprove: true, needNotify: true, assignTo: '风控主管',
      desc: '逾期90天以上或欺诈规则命中：自动冻结授信额度，禁止新增用信' },
    { id: 'd2', name: '红灯·立即止付', triggerLevel: 'RED', action: '止付', targetSystem: '核心信贷系统', needApprove: true, needNotify: true, assignTo: '风控主管',
      desc: '盗刷/套现/反洗钱嫌疑：立即止付账户，阻断资金流出' },
    { id: 'd3', name: '红灯·紧急降额', triggerLevel: 'RED', action: '降额', targetSystem: '核心信贷系统', needApprove: true, needNotify: true, assignTo: '风控主管',
      desc: '多头借贷或征信大幅恶化：额度降至原 50%，控制敞口' },
    { id: 'd4', name: '红灯·委外预催', triggerLevel: 'RED', action: '预催', targetSystem: '催收系统', needApprove: false, needNotify: true, assignTo: '催收专员',
      desc: 'M3+ 委外前集中预催一轮，同步更新联系方式' },
    { id: 'd5', name: '黄灯·预警降额', triggerLevel: 'YELLOW', action: '降额', targetSystem: '核心信贷系统', needApprove: false, needNotify: true, assignTo: '风控主管',
      desc: '行为分连续下降：额度下调 20% 观察期 3 个月' },
    { id: 'd6', name: '黄灯·短信预催', triggerLevel: 'YELLOW', action: '预催', targetSystem: '消息中心', needApprove: false, needNotify: true, assignTo: '催收专员',
      desc: 'M1 逾期：短信+智能语音双渠道提醒还款' },
    { id: 'd7', name: '黄灯·首逾关注', triggerLevel: 'YELLOW', action: '关注', targetSystem: '工单系统', needApprove: false, needNotify: false, assignTo: '客户经理',
      desc: '首次逾期客户加入关注名单，人工电话回访了解原因' },
    { id: 'd8', name: '黄灯·大额人工复核', triggerLevel: 'YELLOW', action: '关注', targetSystem: '工单系统', needApprove: true, needNotify: false, assignTo: '客户经理',
      desc: '单笔大额提现/转账触发人工复核，核实用途' },
    { id: 'd9', name: '机会·优质提额', triggerLevel: 'OPPORTUNITY', action: '提额', targetSystem: '营销系统', needApprove: true, needNotify: true, assignTo: '客户经理',
      desc: '活跃优质客户：额度上浮 20% 促进用信，提升资产收益' },
    { id: 'd10', name: '机会·睡眠唤醒', triggerLevel: 'OPPORTUNITY', action: '促活', targetSystem: '营销系统', needApprove: false, needNotify: true, assignTo: '运营专员',
      desc: '30 天无交易睡眠户：定向权益触达，唤醒复贷' },
    { id: 'd11', name: '绿灯·健康保持', triggerLevel: 'GREEN', action: '关注', targetSystem: '工单系统', needApprove: false, needNotify: false, assignTo: '客户经理',
      desc: '风险恢复正常客户：持续观察 3 个月，无异常后解除监控' },
    { id: 'd12', name: '绿灯·定期促活', triggerLevel: 'GREEN', action: '促活', targetSystem: '营销系统', needApprove: false, needNotify: true, assignTo: '运营专员',
      desc: '健康客群：定期营销活动维持活跃度与黏性' },
  ],
};

export { SEED_DASHBOARDS } from './midDashboardSeed';


// ---------------- 使用域：预警事件样例（橘，本地 JSON）----------------
// 预警工作台 / 监控看板 共用的预警事件清单；首次加载由 store 落盘 midAlerts.json
export type MidAlertStatus = '待处置' | '核实中' | '处置中' | '已解除' | '已升级' | '误报';

export interface MidAlert {
  alert_id: string;
  cust_id: string;
  cust_name: string;
  scene: string;              // 触发场景（业务场景：贷中风控/反欺诈监测/贷后催收/营销促活等，预警在哪个场景产生）
  alert_type: string;         // 预警类型（具体预警类别：负债激增/多头借贷/司法涉诉/设备异常/逾期预警等）
  level: 'RED' | 'YELLOW' | 'OPPORTUNITY';
  alert_date: string;
  rule_name: string;
  metric_value: number;
  threshold: number;
  status?: MidAlertStatus;     // 需求7：预警处置状态已由业务流程状态（flowState）承担，status 仅保留兼容（可选）
  flowKey?: string;            // 需求8/9：关联业务流程 id（预警处置流程，如 f-alert-freeze/f-alert-limit/...）
  flowState?: string;          // 需求8/9：当前流程节点状态（如 预警确认中/风险研判中/冻结止付中/已结案）
  flowStateAt?: string;        // 需求14：进入当前流程节点的时间（ISO，用于节点时限倒计时）
}

export const SEED_ALERTS: MidAlert[] = [
  { alert_id: 'AL0808-001', cust_id: 'C0001', cust_name: '张*明', alert_type: '负债激增', scene: '贷中风控',
    level: 'RED', alert_date: '2026-08-08', rule_name: '近30天新增贷款≥3笔', metric_value: 5, threshold: 3,
    flowKey: 'f-alert-limit', flowState: '风险研判中' },
  { alert_id: 'AL0808-002', cust_id: 'C0009', cust_name: '何*杰', alert_type: '负债激增', scene: '贷中风控',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '月还款额/月收入>70%', metric_value: 73, threshold: 70,
    flowKey: 'f-alert-watch', flowState: '预警确认中' },
  { alert_id: 'AL0808-003', cust_id: 'C0010', cust_name: '罗*峰', alert_type: '多头借贷', scene: '贷中风控',
    level: 'RED', alert_date: '2026-08-08', rule_name: '近7天征信查询≥5次', metric_value: 7, threshold: 5,
    flowKey: 'f-alert-limit', flowState: '降额执行中' },
  { alert_id: 'AL0808-004', cust_id: 'C0002', cust_name: '李*华', alert_type: '多头借贷', scene: '贷中风控',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '同时在贷平台≥4家', metric_value: 5, threshold: 4,
    flowKey: 'f-alert-watch', flowState: '预警确认中' },
  { alert_id: 'AL0808-005', cust_id: 'C0005', cust_name: '陈*敏', alert_type: '逾期预警', scene: '贷中风控',
    level: 'RED', alert_date: '2026-08-08', rule_name: '还款日临近且余额不足', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-precollect', flowState: '预催执行中' },
  { alert_id: 'AL0808-006', cust_id: 'C0011', cust_name: '许*文', alert_type: '逾期预警', scene: '贷中风控',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '历史还款日延迟≥2天', metric_value: 2, threshold: 1,
    flowKey: 'f-alert-precollect', flowState: '预警确认中' },
  { alert_id: 'AL0808-007', cust_id: 'C0004', cust_name: '赵*强', alert_type: '司法涉诉', scene: '贷中风控',
    level: 'RED', alert_date: '2026-08-08', rule_name: '新增被执行记录', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-freeze', flowState: '冻结止付中' },
  { alert_id: 'AL0808-008', cust_id: 'C0012', cust_name: '韩*磊', alert_type: '司法涉诉', scene: '贷中风控',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '新增开庭公告', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-watch', flowState: '预警确认中' },
  { alert_id: 'AL0808-009', cust_id: 'C0008', cust_name: '吴*军', alert_type: '关联企业风险', scene: '贷中风控',
    level: 'RED', alert_date: '2026-08-08', rule_name: '关联企业经营异常', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-limit', flowState: '降额执行中' },
  { alert_id: 'AL0808-010', cust_id: 'C0013', cust_name: '曹*刚', alert_type: '关联企业风险', scene: '贷中风控',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '担保企业出现逾期', metric_value: 2, threshold: 1,
    flowKey: 'f-alert-watch', flowState: '预警确认中' },
  { alert_id: 'AL0808-011', cust_id: 'C0002', cust_name: '李*华', alert_type: '设备异常', scene: '反欺诈监测',
    level: 'RED', alert_date: '2026-08-08', rule_name: '7日内更换设备≥2次', metric_value: 2, threshold: 1,
    flowKey: 'f-alert-freeze', flowState: '冻结止付中' },
  { alert_id: 'AL0808-012', cust_id: 'C0014', cust_name: '唐*霞', alert_type: '设备异常', scene: '反欺诈监测',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '新设备深夜登录', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-watch', flowState: '预警确认中' },
  { alert_id: 'AL0808-013', cust_id: 'C0004', cust_name: '赵*强', alert_type: '反欺诈命中', scene: '反欺诈监测',
    level: 'RED', alert_date: '2026-08-08', rule_name: '命中黑名单手机号', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-freeze', flowState: '预警确认中' },
  { alert_id: 'AL0808-014', cust_id: 'C0015', cust_name: '冯*军', alert_type: '反欺诈命中', scene: '反欺诈监测',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '资料与历史申请冲突', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-watch', flowState: '人工复核中' },
  { alert_id: 'AL0808-015', cust_id: 'C0001', cust_name: '张*明', alert_type: '行为评分下降', scene: '贷中风控',
    level: 'RED', alert_date: '2026-08-08', rule_name: '行为分单日降幅>15%', metric_value: 18, threshold: 15,
    flowKey: 'f-alert-limit', flowState: '风险研判中' },
  { alert_id: 'AL0808-016', cust_id: 'C0003', cust_name: '王*芳', alert_type: '行为评分下降', scene: '贷中风控',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '行为分连续3日走低', metric_value: 5, threshold: 3,
    flowKey: 'f-alert-watch', flowState: '预警确认中' },
  { alert_id: 'AL0808-017', cust_id: 'C0005', cust_name: '陈*敏', alert_type: '还款能力不足', scene: '贷中风控',
    level: 'RED', alert_date: '2026-08-08', rule_name: '月供/收入>65%', metric_value: 68, threshold: 65,
    flowKey: 'f-alert-limit', flowState: '降额执行中' },
  { alert_id: 'AL0808-018', cust_id: 'C0016', cust_name: '邓*平', alert_type: '还款能力不足', scene: '贷中风控',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '临期余额不足', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-precollect', flowState: '预警确认中' },
  { alert_id: 'AL0808-019', cust_id: 'C0003', cust_name: '王*芳', alert_type: '回访失联', scene: '贷后催收',
    level: 'RED', alert_date: '2026-08-08', rule_name: '回访失联≥2次', metric_value: 2, threshold: 1,
    flowKey: 'f-alert-precollect', flowState: '催收介入中' },
  { alert_id: 'AL0808-020', cust_id: 'C0017', cust_name: '曾*琳', alert_type: '回访失联', scene: '贷后催收',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '电话拒接≥3次', metric_value: 3, threshold: 2,
    flowKey: 'f-alert-watch', flowState: '预警确认中' },
  { alert_id: 'AL0808-021', cust_id: 'C0007', cust_name: '周*伟', alert_type: '舆情负面', scene: '贷中风控',
    level: 'RED', alert_date: '2026-08-08', rule_name: '涉借贷纠纷负面舆情', metric_value: 2, threshold: 1,
    flowKey: 'f-alert-limit', flowState: '风险研判中' },
  { alert_id: 'AL0808-022', cust_id: 'C0018', cust_name: '袁*华', alert_type: '舆情负面', scene: '贷中风控',
    level: 'YELLOW', alert_date: '2026-08-08', rule_name: '被投诉催收关联', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-watch', flowState: '预警确认中' },
  { alert_id: 'AL0808-023', cust_id: 'C0003', cust_name: '王*芳', alert_type: '提额机会', scene: '存量运营',
    level: 'OPPORTUNITY', alert_date: '2026-08-08', rule_name: '额度使用率>80%且履约良好', metric_value: 88, threshold: 80,
    flowKey: 'f-alert-promote', flowState: '价值研判中' },
  { alert_id: 'AL0808-024', cust_id: 'C0001', cust_name: '张*明', alert_type: '提额机会', scene: '存量运营',
    level: 'OPPORTUNITY', alert_date: '2026-08-08', rule_name: '近90天无逾期且收入提升', metric_value: 0, threshold: 0,
    flowKey: 'f-alert-promote', flowState: '机会确认中' },
  { alert_id: 'AL0808-025', cust_id: 'C0019', cust_name: '蒋*梅', alert_type: '需求上升', scene: '存量运营',
    level: 'OPPORTUNITY', alert_date: '2026-08-08', rule_name: '近期借款需求上升', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-promote', flowState: '机会确认中' },
  { alert_id: 'AL0808-026', cust_id: 'C0006', cust_name: '孙*华', alert_type: '需求上升', scene: '存量运营',
    level: 'OPPORTUNITY', alert_date: '2026-08-08', rule_name: '活跃度持续提升', metric_value: 1, threshold: 0,
    flowKey: 'f-alert-promote', flowState: '机会确认中' },
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
// 需求20：单客 360 图谱——关联实体（企业/担保/设备/联系人）与风险维度评分
export interface CustRelationNode {
  id: string
  name: string             // 实体名（企业名/人/设备号）
  rel: string              // 与客户关系：法人/担保/设备/联系人/共借人
  type: 'company' | 'person' | 'device' | 'contact'
  risk?: string            // 实体风险标记（可选）
}
export interface CustRiskDim {
  dim: string              // 风险维度：负债/多头/欺诈/司法/行为/舆情
  score: number            // 0-100（越高风险越大）
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
  relations?: CustRelationNode[];   // 需求20：关联图谱节点
  riskDims?: CustRiskDim[];         // 需求20：风险维度雷达
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

/* 需求20：SEED 客户兜底图谱/风险维度（文件已持久化时不用） */
function withCustGraph(c: MidCustomer): MidCustomer {
  if (c.relations && c.riskDims) return c;
  const base = c.riskLevel === '高风险' ? 72 : c.riskLevel === '中风险' ? 48 : 22;
  return {
    ...c,
    relations: c.relations ?? [
      { id: c.custId + '-r0', name: '华信商贸', rel: '法人', type: 'company', risk: c.riskLevel === '高风险' ? '高危' : undefined },
      { id: c.custId + '-r1', name: 'IMEI-86' + c.custId.slice(1), rel: '设备', type: 'device' },
    ],
    riskDims: c.riskDims ?? ['负债','多头','欺诈','司法','行为','舆情'].map((dim, i) => ({ dim, score: Math.max(8, Math.min(96, base + i * 3)) })),
  };
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

export const SEED_VIZ_SAMPLES: VizSample[] = [
  {
    id: 'vs_product_loan',
    name: '各产品在贷余额分布',
    unit: '万元',
    precision: 0,
    data: [
      { key: '信用贷', value: 45200 },
      { key: '抵押贷', value: 38600 },
      { key: '车贷', value: 21800 },
      { key: '消费贷', value: 16400 },
      { key: '经营贷', value: 12900 },
      { key: '其他', value: 5300 },
    ],
  },
  {
    id: 'vs_monthly_overdue',
    name: '月度逾期金额趋势',
    unit: '万元',
    precision: 0,
    data: [
      { key: '1月', value: 3200 }, { key: '2月', value: 2850 }, { key: '3月', value: 4100 },
      { key: '4月', value: 3650 }, { key: '5月', value: 5200 }, { key: '6月', value: 4800 },
      { key: '7月', value: 5900 }, { key: '8月', value: 5400 }, { key: '9月', value: 6300 },
      { key: '10月', value: 5800 }, { key: '11月', value: 6700 }, { key: '12月', value: 7200 },
    ],
  },
  {
    id: 'vs_risk_level',
    name: '风险等级分布',
    unit: '人',
    precision: 0,
    data: [
      { key: '低风险', value: 12450 },
      { key: '中风险', value: 5230 },
      { key: '高风险', value: 1860 },
      { key: '极高风险', value: 420 },
    ],
  },
  {
    id: 'vs_region_score',
    name: '各区域风控评分',
    unit: '分',
    precision: 1,
    data: [
      { key: '华东', value: 82.5 }, { key: '华南', value: 76.3 }, { key: '华北', value: 79.8 },
      { key: '华中', value: 71.2 }, { key: '西南', value: 68.5 }, { key: '西北', value: 65.0 },
    ],
  },
  {
    id: 'vs_channel_approval',
    name: '各渠道审批通过率',
    unit: '%',
    precision: 1,
    data: [
      { key: 'APP申请', value: 78.5 }, { key: '网页申请', value: 72.3 }, { key: '线下网点', value: 85.1 },
      { key: '合作方', value: 69.8 }, { key: '电销', value: 63.2 },
    ],
  },
  {
    id: 'vs_burndown_task',
    name: '风控任务燃尽追踪',
    unit: '个',
    precision: 0,
    data: [
      { key: 'D1', value: 120 }, { key: 'D2', value: 105 }, { key: 'D3', value: 92 },
      { key: 'D4', value: 78 }, { key: 'D5', value: 65 }, { key: 'D6', value: 51 },
      { key: 'D7', value: 38 }, { key: 'D8', value: 25 }, { key: 'D9', value: 15 }, { key: 'D10', value: 6 },
    ],
  },
  {
    id: 'vs_age_risk',
    name: '年龄段违约率',
    unit: '%',
    precision: 1,
    data: [
      { key: '18-25', value: 5.8 }, { key: '26-35', value: 3.2 }, { key: '36-45', value: 2.1 },
      { key: '46-55', value: 1.5 }, { key: '56-65', value: 2.7 }, { key: '65+', value: 4.3 },
    ],
  },
  {
    id: 'vs_quarter_revenue',
    name: '季度放款金额',
    unit: '万元',
    precision: 0,
    data: [
      { key: 'Q1-2025', value: 8600 }, { key: 'Q2-2025', value: 12300 }, { key: 'Q3-2025', value: 15800 },
      { key: 'Q4-2025', value: 19200 }, { key: 'Q1-2026', value: 16500 }, { key: 'Q2-2026', value: 21400 },
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

// ---- 指标高级定义：筛选 / 分组 / 去重 / 多字段计算 ----
// 筛选条件：聚合前对数据源样例行做 WHERE 过滤
export function applyMetricFilters(rows: Record<string, unknown>[], filters?: MidMetricFilter[]): Record<string, unknown>[] {
  if (!filters || !filters.length) return rows;
  return rows.filter((r) => filters.every((f) => {
    const cell = r[f.field];
    const cv = Number(cell);
    const nv = Number(f.value);
    const isnum = f.value !== '' && Number.isFinite(cv) && !Number.isNaN(nv);
    switch (f.op) {
      case 'eq': return String(cell) === f.value;
      case 'neq': return String(cell) !== f.value;
      case 'gt': return isnum && cv > nv;
      case 'gte': return isnum && cv >= nv;
      case 'lt': return isnum && cv < nv;
      case 'lte': return isnum && cv <= nv;
      case 'contains': return String(cell).includes(f.value);
      default: return true;
    }
  }));
}

// 多字段计算：在单行上按字段表达式求值（引用源字段 key，支持 + - * / 与括号）
export function evalFieldExpr(expr: string, row: Record<string, unknown>): number | null {
  if (!expr) return null;
  const e = expr.replace(/[A-Za-z_][A-Za-z0-9_]*/g, (tok) => {
    if (Object.prototype.hasOwnProperty.call(row, tok)) {
      const v = Number(row[tok]);
      return Number.isFinite(v) ? String(v) : '0';
    }
    return tok;
  });
  if (!/^[0-9+\-*/().\s]+$/.test(e)) return null;
  try {
    const v = new Function(`"use strict"; return (${e});`)();
    return typeof v === 'number' && isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

// 基础指标标量求值（应用筛选 / 多字段表达式 / 聚合；忽略 groupBy 以维持 widget 标量语义）
export function computeMetricValue(m: MidMetric, rows: Record<string, unknown>[]): number {
  if (m.type === 'derived') return 0;
  const filtered = applyMetricFilters(rows, m.filters);
  const nums = filtered.map((r) => (m.expr ? (evalFieldExpr(m.expr, r) ?? 0) : Number(r[m.field ?? ''])));
  switch (m.agg) {
    case 'sum': return nums.reduce((a, b) => a + b, 0);
    case 'avg': return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    case 'max': return nums.length ? Math.max(...nums) : 0;
    case 'min': return nums.length ? Math.min(...nums) : 0;
    case 'distinct': return new Set(filtered.map((r) => r[m.dedupField ?? m.field ?? ''])).size;
    case 'count':
    default: return filtered.length;
  }
}

// 分组预览：按维度聚合，返回 分组→数值（用于可视化预览）
// 未设分组维度时返回整体单值（label「整体」），保证可视化始终有内容
export function computeMetricGrouped(m: MidMetric, rows: Record<string, unknown>[]): { key: string; value: number }[] {
  if (m.type === 'derived') return [];
  const filtered = applyMetricFilters(rows, m.filters);
  if (!m.groupBy || !m.groupBy.length) {
    return [{ key: '整体', value: computeMetricValue(m, rows) }];
  }
  const map = new Map<string, Record<string, unknown>[]>();
  for (const r of filtered) {
    const k = m.groupBy!.map((d) => String(r[d] ?? '未知')).join(' / ');
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  }
  return Array.from(map.entries()).map(([key, rs]) => {
    const nums = rs.map((r) => (m.expr ? (evalFieldExpr(m.expr, r) ?? 0) : Number(r[m.field ?? ''])));
    let value = 0;
    switch (m.agg) {
      case 'sum': value = nums.reduce((a, b) => a + b, 0); break;
      case 'avg': value = nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0; break;
      case 'max': value = nums.length ? Math.max(...nums) : 0; break;
      case 'min': value = nums.length ? Math.min(...nums) : 0; break;
      case 'distinct': value = new Set(rs.map((r) => r[m.dedupField ?? m.field ?? ''])).size; break;
      default: value = rs.length;
    }
    return { key, value };
  }).sort((a, b) => b.value - a.value);
}

// 在一组数据行上解析所有指标（基础聚合 + 派生公式），返回 metricId → 数值。
// 用于看板 widget 的实时计算（灰）：先算基础指标，再迭代求解派生指标依赖。
export function resolveMetricsForRows(metrics: MidMetric[], rows: Record<string, unknown>[]): Record<string, number> {
  const vals: Record<string, number> = {};
  let changed = true;
  let guard = 0;
  while (changed && guard++ < 16) {
    changed = false;
    for (const m of metrics) {
      if (m.type === 'base') {
        const v = computeMetricValue(m, rows);
        if (vals[m.id] !== v) { vals[m.id] = v; changed = true; }
      } else {
        const v = evalMetricFormula(m.formula ?? '', vals);
        if (v !== null && vals[m.id] !== v) { vals[m.id] = v; changed = true; }
      }
    }
  }
  return vals;
}

// 按维度字段分组
export function groupRowsByDim(rows: Record<string, unknown>[], dim: string): { key: string; rows: Record<string, unknown>[] }[] {
  const map = new Map<string, Record<string, unknown>[]>();
  for (const r of rows) {
    const k = String(r[dim] ?? '未知');
    if (!map.has(k)) map.set(k, []);
    map.get(k)!.push(r);
  }
  return Array.from(map.entries()).map(([key, rs]) => ({ key, rows: rs }));
}

// 红黄绿灯等级 → 配色（看板 / 工作台统一）
export const LEVEL_META: Record<string, { label: string; badge: 'red' | 'amber' | 'cyan' | 'gray' | 'green'; fill: string; soft: string }> = {
  RED: { label: '红灯', badge: 'red', fill: '#E11D48', soft: '#FFE4E6' },
  YELLOW: { label: '黄灯', badge: 'amber', fill: '#D97706', soft: '#FEF3C7' },
  OPPORTUNITY: { label: '机会', badge: 'cyan', fill: '#0891B2', soft: '#CFFAFE' },
  GREEN: { label: '绿灯', badge: 'green', fill: '#059669', soft: '#D1FAE5' },
};
