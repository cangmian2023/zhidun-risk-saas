// 决策引擎子系统 · 数据层（规则 + 模型双引擎 · 可视化决策编排与运行）
// 数据流向（严格按 AGENTS 铁律：功能与数据分离）：
//   样例 JSON（橘，使用域作者维护）: decisionData.json —— 模拟金融风控平台数据，
//     前端只读该文件渲染页面；后台按此契约实现接口并更新该文件。
// 启动：/api/load-mid 加载（通用本地 JSON 端点）；文件不存在则用代码 SEED 并立即落盘（创建样例 JSON）。
// 本数据层不实现接口对接，仅读取本地样例 JSON decisionData.json；后台接入后由后台更新该 JSON 文件。

import { useSyncExternalStore } from 'react';

/* ============================================================
 * 类型定义（接口契约 · 后台按此实现）
 * ========================================================== */

/** 模型状态 */
export type DeModelStatus = '草稿' | '已上线' | '已下线' | '测试中';
/** 模型类型 */
export type DeModelType = '评分卡' | '规则集' | '决策树' | 'XGBoost' | '规则引擎' | '名单匹配';

export interface DeModel extends DeFlowable {
  id: string;
  name: string;
  code: string;
  desc: string;
  status: DeModelStatus;
  type: DeModelType;
  version: string;
  creator: string;
  updatedAt: string;
  createdAt: string;
  /** header 副标题数字（如版本号 12） */
  headerNo?: number;
  /** 审批状态（模型详情 header 标签） */
  approvalStatus?: string;
  /** 模型内策略列表 */
  policies: DePolicy[];
  /** 模型关联特征（编码） */
  features: string[];
  /** 模型关联特征明细（关联特征 tab / 模型测试） */
  featureList: DeModelFeature[];
  /** 版本历史 */
  versions: DeVersion[];
  /** 决策流列表（决策流 tab） */
  flows: DeFlowItem[];
  /** 决策流（可视化决策编排图，兼容旧字段） */
  flow?: DeFlowGraph;
}

/** 模型关联特征 */
export type DeFeatureCategory = '原始' | '外部' | '聚合';

export interface DeModelFeature {
  code: string;
  name: string;
  category: DeFeatureCategory;   // 原始 RAW / 外部 / 聚合 AGGREGATE
  dataType: string;              // NUMBER / STRING / BOOLEAN
  isInput: boolean;              // 是否输入（true=输入，false=自动计算）
  desc: string;
}

/** 业务流程关联（对接管理中心 bizFlows，后台接入后填；flowId 指向 flowStore 流程 id） */
export interface DeFlowable {
  flowId?: string;
  flowState?: string;
  flowStateAt?: string;
}

/** 决策流列表项 */
export interface DeFlowItem {
  id: string;
  name: string;
  code: string;
  status: '草稿' | '已发布' | '测试中';
  version: number;
  updatedAt: string;
  /** 该决策流的可视化图数据 */
  graph: DeFlowGraph;
}

export interface DePolicy {
  id: string;
  name: string;
  code: string;
  type: '决策表' | '规则集' | '名单匹配' | '评分卡' | '规则引擎';
  updatedAt: string;
  /** 策略编辑：拒绝阈值 */
  rejectThreshold?: number;
  /** 策略编辑：审核阈值 */
  reviewThreshold?: number;
  /** 决策表行条件配置 */
  rows?: DeDecisionRow[];
}

/** 决策表行条件 */
export interface DePolicyCondition {
  field: string;   // 字段（关联特征库 featureList.code）
  expr: string;    // 标准化表达式，如 coupon_value >= 100（由 field/op/value 拼装）
  /** 标准化条件字段：操作符（值比较运算符，来自特征库类型） */
  op?: string;
  /** 标准化条件字段：值（与特征库 dataType 对应） */
  value?: string;
  /** 字段名称快照（编辑展示用） */
  fieldName?: string;
}

/** 条件操作符候选（按特征库 dataType 过滤可用集） */
export const DE_CONDITION_OPS: Record<string, string[]> = {
  NUMBER: ['>', '>=', '<', '<=', '=', '!='],
  BOOLEAN: ['=', '!='],
  STRING: ['=', '!=', '包含', '不包含'],
  DATETIME: ['>=', '<', '='],
}

/** 生成标准化表达式 */
export function buildConditionExpr(field: string, op: string, value: string): string {
  const v = op === '包含' ? `'${value}'` : op === '不包含' ? `!${value}` : /^\d+(\.\d+)?$/.test(value) ? value : `'${value}'`
  if (op === '包含') return `contains(${field}, '${value}')`
  if (op === '不包含') return `!contains(${field}, '${value}')`
  return `${field} ${op} ${v}`
}

/** 决策表行 */
export interface DeDecisionRow {
  name: string;          // 行名称
  score: number;         // 得分
  conditions: DePolicyCondition[];
}

/** 决策流节点类型（对齐 6.* 节点属性文档） */
export type DeFlowNodeType =
  | 'start'      // 开始节点
  | 'end'        // 结束节点
  | 'policy'     // 策略节点（关联策略）
  | 'list'       // 名单匹配（关联名单库 / 匹配字段 / 匹配分数）
  | 'condition'  // 条件节点（出边条件）
  | 'parallel'   // 并行网关
  | 'merge'      // 合并网关
  | 'feature'    // 特征节点（计算特征）
  | 'subflow';   // 子流程

/** 策略节点：关联的策略 */
export interface DeNodePolicyRef {
  policyId: string;   // 关联策略 id
  policyName: string; // 策略名称
}

/** 名单匹配节点：关联名单库 */
export interface DeNodeListRef {
  listId: string;     // 关联名单库 id
  listName: string;   // 名单库名称
  matchField: string; // 匹配字段（如 phone / ip / device_id）
  matchScore: number; // 匹配分数
}

/** 特征节点：计算特征（多选，原始/外部/聚合 分组） */
export interface DeNodeFeatureRef {
  code: string;
  name: string;
  category: '原始' | '外部' | '聚合';
}

export interface DeFlowNode {
  id: string;
  type: DeFlowNodeType;
  title: string;
  subtitle?: string;
  meta?: string[];       // 节点内要点（特征/规则/阈值等）
  badge?: string;        // 右上角小标签
  x: number;
  y: number;
  /* ---- 6.* 文档字段级属性 ---- */
  policy?: DeNodePolicyRef;       // 策略节点：关联策略
  listRef?: DeNodeListRef;        // 名单匹配：关联名单库/匹配字段/匹配分数
  features?: DeNodeFeatureRef[];  // 特征节点：计算特征
  conditions?: DeFlowEdgeCondition[]; // 条件节点：出边条件（每条出边对应一条条件/标签）
  subflowId?: string;             // 子流程：关联的子决策流 id
  subflowName?: string;           // 子流程名称
  /** 兼容旧字段：碰撞裁决规则（多条，顺序即优先级，命中冲突时取最高优先） */
  collisionRules?: DeCollisionRule[];
}

/* ============================================================
 * 碰撞裁决（collision 节点 · 决策引擎侧）
 * 当多条并行支线 / 规则同时命中产生冲突时，按此逐条裁决并生成结论。
 * 条件结构化（信号源字段 + 操作符 + 值，可序列化可执行），结果枚举化，
 * 保存后随决策流 graph 持久化到 decisionData.json。后台按此契约实现执行引擎。
 * ========================================================== */
/** 标准裁决结果（枚举）——后端执行可直接映射动作 */
export type DeCollisionOutcome =
  | '强制拒绝'
  | '升级高风险预警'
  | '欺诈覆盖预警'
  | '降为审慎授信'
  | '取保守策略'
  | '转人工复核'
  | '通过放行';
export const DE_COLLISION_OUTCOMES: DeCollisionOutcome[] = [
  '强制拒绝',
  '升级高风险预警',
  '欺诈覆盖预警',
  '降为审慎授信',
  '取保守策略',
  '转人工复核',
  '通过放行',
];

/** 裁决优先级（决定多条命中时的取舍） */
export type DeCollisionPriority = '拦截优先' | '分数优先' | '转人工';
export const DE_COLLISION_PRIORITIES: DeCollisionPriority[] = ['拦截优先', '分数优先', '转人工'];

/** 碰撞裁决可用「信号源」字段池（条件下拉用） */
export const DE_COLLISION_SIGNAL_FIELDS: { ref: string; label: string }[] = [
  { ref: 'blacklist', label: '外部黑灰名单' },
  { ref: 'device_sim', label: '设备模拟器特征' },
  { ref: 'rule_hit', label: '规则集命中' },
  { ref: 'score_device', label: '设备风险分(0-100)' },
  { ref: 'score_credit', label: '信用分(300-900)' },
  { ref: 'm3_overdue', label: '历史 M3+ 逾期次数' },
  { ref: 'address_cnt', label: '近30天收货地址数' },
  { ref: 'order_cnt', label: '近30天订单数' },
];

/** 条件操作符 */
export type DeCollisionOp = '>' | '>=' | '<' | '<=' | '=' | '!=' | '命中' | '未命中';

/** 单条碰撞裁决规则 */
export interface DeCollisionRule {
  id: string;
  /** 信号源字段 ref（来自 DE_COLLISION_SIGNAL_FIELDS） */
  field: string;
  /** 操作符（= / > / 命中 等） */
  op: DeCollisionOp;
  /** 比较值（文本或数字） */
  value: string;
  /** 标准裁决结果 */
  result: DeCollisionOutcome;
  /** 裁决优先级 */
  priority: DeCollisionPriority;
  /** 是否启用 */
  enabled: boolean;
  /** 规则说明 */
  note?: string;
}

/** 规则 → 可读文本（节点卡 / 详情展示用） */
export function deCollisionRuleText(r: DeCollisionRule): string {
  const f = DE_COLLISION_SIGNAL_FIELDS.find((x) => x.ref === r.field)?.label ?? r.field;
  return `${f} ${r.op} ${r.value} → ${r.result}`;
}

/** 条件节点「出边条件」：每条出边对应一条条件（标签 + 表达式） */
export interface DeFlowEdgeCondition {
  id: string;
  label: string;    // 出边标签（如：是/否、命中/未命中、通过/拒绝）
  expr: string;     // 条件表达式（Aviator，如 score > 60）
}

export interface DeFlowEdge {
  from: string;
  to: string;
  /** 连线标签（如 是/否、命中 → 拒绝） */
  label?: string;
  /** 连线条件表达式（Aviator，来自「连线属性-条件表达式」） */
  expr?: string;
  /** 来源节点为条件节点时对应的出边条件 id（对应节点 conditions） */
  conditionId?: string;
  dashed?: boolean;      // 虚线 = 并行支线，不阻塞主线
  color?: string;
}

export interface DeFlowGraph {
  width: number;
  height: number;
  nodes: DeFlowNode[];
  edges: DeFlowEdge[];
  /** 子流程集合（subflow 节点引用的子决策流） */
  subflows?: DeFlowGraph[];
}

export interface DeVersion {
  version: string;
  date: string;
  note: string;
  current: boolean;
}

/** 特征 */
export interface DeFeature {
  id: string;
  code: string;
  name: string;
  type: string;          // 如 原始 / 外部 / 聚合
  dataType: string;      // 如 NUMBER / STRING / BOOLEAN
  owner: string;         // 维护域
  desc: string;
  updatedAt: string;
  version?: string;      // 版本
  status?: '启用' | '禁用' | '草稿';
  sceneTag?: string;     // 场景标签
  linkedModels?: string; // 关联模型
  /** 外部特征 API 配置 */
  externalApi?: DeExternalApi;
  /** 关联模型列表（关联模型弹窗多选） */
  boundModels?: string[];
}

/** 外部特征 API 配置 */
export interface DeExternalApi {
  mode: 'INLINE' | 'DATASOURCE';  // 取数方式：内联HTTP配置 / 选择已有数据源
  datasource?: string;            // 数据源
  responsePath?: string;          // 提取路径
}

/** 特征监控 */
export interface DeFeatureMonitor {
  code: string;
  name: string;
  type: string;
  dataType: string;
  calls: number;       // 调用次数
  missing: number;     // 缺失数
  empty: number;       // 空值数
  missingRate: number; // 缺失率(%)
  emptyRate: number;   // 空值率(%)
}

/** 名单库 */
export type DeListKind = '黑名单' | '灰名单' | '白名单';
export type DeListMatch = '精确匹配' | '模糊匹配' | '正则匹配';

/** 名单记录（管理记录弹窗） */
export interface DeListRecord {
  id: string;
  value: string;        // 键值
  ext?: string;         // 扩展属性
  expireAt?: string;    // 过期时间
  createdAt: string;    // 创建时间
}

export interface DeList extends DeFlowable {
  id: string;
  name: string;
  code: string;
  kind: DeListKind;
  matchKey: string;    // 匹配键：手机号/身份证/IP/设备ID/地址等
  matchStrategy: DeListMatch;
  source: string;      // 来源：内置/人工导入/第三方
  recordCount: number; // 记录数
  createdAt: string;
  /** 名单记录（管理记录弹窗） */
  records: DeListRecord[];
  /** 记录统计 */
  stat?: { valid: number; expired: number; expiring: number };
}

/** 模板市场 */
export interface DeTemplate extends DeFlowable {
  id: string;
  name: string;
  scene: string;        // 场景标签：场景/行业
  desc: string;
  industry: string;
  tags: string[];       // 行业 / 场景 / 官方
  rating: number;
  ratingCount: number;
  useCount: number;
  /** 模板编码（详情页） */
  code?: string;
  /** 模板包含的策略（详情页 - 策略 tab） */
  policies?: DeTemplatePolicy[];
  /** 模板包含的规则（详情页 - 规则 tab） */
  rules?: DeTemplateRule[];
  /** 模板包含的特征（详情页 - 特征 tab） */
  features?: DeTemplateFeature[];
}

/** 模板策略 */
export interface DeTemplatePolicy {
  name: string;   // 策略名称
  code: string;   // 策略编码
  type: string;   // 策略类型
}

/** 模板规则 */
export interface DeTemplateRule {
  name: string;        // 规则名称
  condition: string;   // 条件表达式
  score: number;       // 得分
  priority: number;    // 优先级
}

/** 模板特征 */
export interface DeTemplateFeature {
  name: string;   // 特征名称
  code: string;   // 特征编码
  type: string;   // 外部 / 原始 / 聚合
  dataType: string;  // NUMBER / STRING / BOOLEAN
}

/** 版本管理（运行管理） */
export interface DeVersionManage extends DeFlowable {
  id: string;
  name: string;
  type: string;         // 模型 / 策略 / 名单
  version: string;
  status: '已发布' | '草稿' | '已回滚' | '灰度中';
  creator: string;
  createdAt: string;
}

/** 流量分配 */
export interface DeTrafficSplit {
  id: string;
  name: string;
  model: string;        // 分配目标（模型/版本）
  ratio: number;        // 流量占比(%)
  status: '生效中' | '已暂停';
  desc: string;
}

/** 决策回放任务 */
export interface DeReplayTask extends DeFlowable {
  id: string;
  name: string;
  model: string;
  targetVersion: string; // 目标版本（空=对比当前线上）
  status: '已完成' | '执行中' | '失败' | '待执行';
  progress: number;      // 0-100
  total: number;
  done: number;
  creator: string;
  createdAt: string;
}

/** 回放结果明细 */
export interface DeReplayResult {
  requestId: string;
  oldDecision: string;
  oldScore: number;
  newDecision: string;
  newScore: number;
  changed: 1 | 0;        // 是否有变化
  scoreDiff: number;
  costMs: number;
}

/** 批量决策任务 */
export interface DeBatchTask extends DeFlowable {
  id: string;
  name: string;
  model: string;
  status: '执行中' | '已完成' | '失败' | '排队中';
  progress: number;
  done: number;
  total: number;
  resultDist: string;    // 结果分布：如 通过 82% / 拒绝 18%
  creator: string;
  createdAt: string;
}

/** 监控大盘 */
export interface DeMonitor {
  todayCalls: number;
  todayPassRate: number;
  todayRejectRate: number;
  todayReviewRate: number;
  avgCostMs: number;
  p95CostMs: number;
  activeModels: number;
  activeFeatures: number;
  /** 近 7 日决策量趋势 */
  callTrend: { date: string; calls: number; pass: number; reject: number }[];
  /** 决策结构分布 */
  decisionDist: { label: string; value: number }[];
  /** 拦截类型分布 */
  blockDist: { label: string; value: number }[];
  /** 规则 TOP 命中 */
  topRules: { rule: string; hits: number }[];
  /** 模型健康度 */
  modelHealth: { model: string; calls: number; errorRate: number; avgCost: number; status: '稳定' | '注意' | '异常' }[];
}

/** 告警 */
export type DeAlertLevel = '紧急' | '重要' | '提示';
export type DeAlertStatus = '待处理' | '处理中' | '已处理' | '已忽略';

export interface DeAlert extends DeFlowable {
  id: string;
  title: string;
  level: DeAlertLevel;
  status: DeAlertStatus;
  source: string;       // 触发源：决策耗时/模型错误率/特征缺失率/流量异常
  desc: string;
  createdAt: string;
  handler?: string;
}

/** 告警规则 */
export interface DeAlertRule {
  id: string;
  name: string;
  metric: string;       // 监控指标值（PASS_RATE 等）
  metricType?: string;  // 指标类型（通过率/拒绝率/耗时等）
  condition: string;    // 触发条件
  threshold: number;
  level: DeAlertLevel;  // 严重程度
  enabled: boolean;     // 状态：启用/禁用
}

/** 告警通知渠道 */
export interface DeNotifyChannel {
  id: string;
  name: string;
  type: string;         // 短信/邮件/企业微信/电话
  target: string;       // 接收人/群
  level: DeAlertLevel;
  enabled: boolean;
}

/** 决策分析 */
export interface DeDecisionAnalysis {
  /** 决策结果结构 */
  decisionDist: { label: string; value: number; rate: number }[];
  /** 各渠道决策量 */
  channelTrend: { date: string; online: number; api: number; batch: number }[];
  /** 规则贡献 */
  ruleContribution: { rule: string; hits: number; blockRate: number }[];
  /** 客群画像（命中拒绝的客群特征） */
  profile: { dim: string; desc: string; rate: number }[];
}

/** 规则命中分析 */
export interface DeRuleHit {
  topRules: { rule: string; hits: number; rate: number; trend: number[] }[];
  hitTrend: { date: string; hits: number }[];
  ruleDist: { type: string; value: number }[];
  hitDetail: { rule: string; code: string; type: string; hits: number; rate: number; status: '启用' | '停用' }[];
}

/** 决策日志 */
export interface DeDecisionLog extends DeFlowable {
  id: string;
  requestId: string;
  time: string;
  channel: '在线' | 'API' | '批量';
  custId: string;
  custName: string;
  model: string;
  score: number;
  decision: '通过' | '拒绝' | '人工复核' | '观察';
  costMs: number;
  source: string;       // 命中依据
}

/** 审批 */
export type DeApprovalStatus = '待审批' | '审批中' | '已通过' | '已驳回' | '已转交';

export interface DeApproval {
  id: string;
  target: string;        // 目标名称（模型/策略/名单）
  targetType: '模型' | '策略' | '名单' | '模板';
  action: '发布' | '上线' | '下线' | '修改';
  status: DeApprovalStatus;
  applicant: string;
  approver?: string;
  applyTime: string;
  /** 业务流程关联（对接管理中心 bizFlows，后台接入后填；flowId 指向 flowStore 中的流程 id） */
  flowId?: string;
  flowState?: string;
  flowStateAt?: string;
}

/** 工作台 */
export interface DeWorkbench {
  todayCalls: number;
  todayPassRate: number;
  todayRejectRate: number;
  todayReviewRate: number;
  avgCostMs: number;
  pendingApproval: number;
  runningModels: number;
  activeAlerts: number;
  recentAlerts: DeAlert[];
  recentModels: DeModel[];
  quickActions: { label: string; key: string; desc: string }[];
}

/* ============================================================
 * 完整数据聚合
 * ========================================================== */
export interface DecisionData {
  workbench: DeWorkbench;
  models: DeModel[];
  features: DeFeature[];
  featureMonitor: DeFeatureMonitor[];
  lists: DeList[];
  templates: DeTemplate[];
  versions: DeVersionManage[];
  trafficSplits: DeTrafficSplit[];
  replays: DeReplayTask[];
  replayResults: DeReplayResult[];
  batchTasks: DeBatchTask[];
  monitor: DeMonitor;
  alerts: DeAlert[];
  alertRules: DeAlertRule[];
  notifyChannels: DeNotifyChannel[];
  decisionAnalysis: DeDecisionAnalysis;
  ruleHit: DeRuleHit;
  decisionLogs: DeDecisionLog[];
  approvals: DeApproval[];
}

/* ============================================================
 * 样例数据 SEED（模拟金融风控平台 · 后台按此契约更新 decisionData.json）
 * ========================================================== */

const NOW = '2026-08-14';

export const SEED_DECISION: DecisionData = {
  /* ---------- 工作台 ---------- */
  workbench: {
    todayCalls: 18420,
    todayPassRate: 76.2,
    todayRejectRate: 18.4,
    todayReviewRate: 5.4,
    avgCostMs: 32,
    pendingApproval: 3,
    runningModels: 12,
    activeAlerts: 2,
    quickActions: [
      { label: '模型管理', key: 'model-manage', desc: '管理决策模型' },
      { label: '监控大盘', key: 'monitor-board', desc: '决策运行监控' },
      { label: '模板市场', key: 'template-market', desc: '模板快速构建' },
      { label: '决策日志', key: 'decision-log', desc: '全量决策日志' },
    ],
    recentAlerts: [
      { id: 'AL-1001', title: '「电商薅羊毛风控」P95 耗时突增', level: '重要', status: '待处理', source: '决策耗时', desc: 'P95 耗时 86ms，较基线上升 42%，请核查模型性能', createdAt: NOW + ' 09:20', handler: undefined },
      { id: 'AL-1002', title: '「设备风险评分卡」特征缺失率超阈值', level: '紧急', status: '处理中', source: '特征缺失率', desc: '特征 device_score 缺失率 38%，超过阈值 30%', createdAt: NOW + ' 08:45', handler: '风控运营' },
    ],
    recentModels: [
      { id: 'M-001', name: '电商薅羊毛风控', code: 'ecommerce_hair', desc: '电商优惠券/秒杀/拼团活动防薅羊毛，覆盖账号质量、名单匹配、活动分级、设备评分、地址聚集', status: '已上线', type: '规则集', version: 'v2.3.1', headerNo: 12, approvalStatus: '待审批', creator: '风控运营', updatedAt: NOW + ' 09:10', createdAt: '2026-07-28', policies: [], features: [], featureList: [], versions: [], flows: [] },
      { id: 'M-002', name: '注册测试风控', code: 'register_test', desc: '注册环节反机器人，覆盖机器特征、名单匹配、注册分级、账号评分', status: '草稿', type: 'XGBoost', version: 'v0.9.0', headerNo: 3, approvalStatus: '草稿', creator: '算法组', updatedAt: NOW + ' 08:30', createdAt: '2026-08-01', policies: [], features: [], featureList: [], versions: [], flows: [] },
    ],
  },

  /* ---------- 模型管理 ---------- */
  models: [
    {
      id: 'M-001',
      name: '电商薅羊毛风控',
      code: 'ecommerce_hair',
      desc: '适用于电商优惠券/秒杀/拼团活动防薅羊毛，覆盖账号质量、名单匹配、活动分级、设备评分、地址聚集等多维度策略',
      status: '已上线',
      type: '规则集',
      version: 'v2.3.1',
      creator: '风控运营',
      updatedAt: NOW + ' 09:10',
      createdAt: '2026-07-28',
      policies: [
        {
          id: 'P-101', name: '活动风险分级表', code: 'activity_tier', type: '决策表', updatedAt: '2026-07-28',
          rejectThreshold: 80,
          reviewThreshold: 50,
          rows: [
            { name: '高面值+新号+无消费-高危', score: 70, conditions: [
              { field: 'coupon_value', fieldName: '优惠券面值', op: '>=', value: '100', expr: 'coupon_value >= 100' },
              { field: 'account_age_hours', fieldName: '账号注册小时数', op: '<', value: '24', expr: 'account_age_hours < 24' },
              { field: 'history_order_count', fieldName: '历史订单数', op: '=', value: '0', expr: 'history_order_count = 0' },
            ] },
            { name: '高面值+低消费-中危', score: 45, conditions: [
              { field: 'coupon_value', fieldName: '优惠券面值', op: '>=', value: '100', expr: 'coupon_value >= 100' },
              { field: 'history_order_count', fieldName: '历史订单数', op: '<', value: '3', expr: 'history_order_count < 3' },
            ] },
            { name: '中面值+新号-关注', score: 30, conditions: [
              { field: 'coupon_value', fieldName: '优惠券面值', op: '>=', value: '30', expr: 'coupon_value >= 30' },
              { field: 'coupon_value', fieldName: '优惠券面值', op: '<', value: '100', expr: 'coupon_value < 100' },
              { field: 'account_age_hours', fieldName: '账号注册小时数', op: '<', value: '24', expr: 'account_age_hours < 24' },
            ] },
            { name: '低面值-低危', score: 5, conditions: [
              { field: 'coupon_value', fieldName: '优惠券面值', op: '<', value: '30', expr: 'coupon_value < 30' },
            ] },
          ],
        },
        { id: 'P-102', name: '地址聚集策略', code: 'address_aggregation', type: '规则集', updatedAt: '2026-07-28' },
        { id: 'P-103', name: '名单匹配策略', code: 'blacklist_match', type: '名单匹配', updatedAt: '2026-07-28' },
        { id: 'P-104', name: '设备风险评分卡', code: 'device_score', type: '评分卡', updatedAt: '2026-07-28' },
        { id: 'P-105', name: '账号质量策略', code: 'identity_quality', type: '规则引擎', updatedAt: '2026-07-28' },
      ],
      features: ['user_age', 'device_score', 'address_cnt', 'order_cnt', 'blacklist_hit'],
      versions: [
        { version: 'v2.3.1', date: NOW + ' 09:10', note: '优化地址聚集识别，召回提升 3pp', current: true },
        { version: 'v2.2.0', date: '2026-07-28', note: '接入设备评分卡，拦截率提升 2pp', current: false },
        { version: 'v2.1.0', date: '2026-07-15', note: '新增名单匹配策略', current: false },
      ],
      headerNo: 12,
      approvalStatus: '待审批',
      featureList: [
        { code: 'account_age_hours', name: '账号注册小时数', category: '原始', dataType: 'NUMBER', isInput: true, desc: '账号注册至今小时数' },
        { code: 'address', name: '收货地址', category: '原始', dataType: 'STRING', isInput: true, desc: '收货地址文本，用于名单匹配' },
        { code: 'address_is_empty_box', name: '是否空包号地址', category: '外部', dataType: 'BOOLEAN', isInput: false, desc: '收货地址是否为空包号物流点' },
        { code: 'address_user_count_7d', name: '同地址7日账号数', category: '聚合', dataType: 'NUMBER', isInput: false, desc: '同收货地址7日不同账号数' },
        { code: 'coupon_value', name: '优惠券面值', category: '原始', dataType: 'NUMBER', isInput: true, desc: '本单使用优惠券面值' },
        { code: 'device_fingerprint_match_count', name: '设备指纹匹配数', category: '聚合', dataType: 'NUMBER', isInput: false, desc: '近7天同设备指纹关联不同账号数' },
        { code: 'device_is_emulator', name: '是否模拟器', category: '外部', dataType: 'BOOLEAN', isInput: false, desc: '设备是否为模拟器运行' },
        { code: 'device_is_rooted', name: '是否Root/越狱', category: '原始', dataType: 'BOOLEAN', isInput: true, desc: '设备是否已Root/越狱' },
        { code: 'history_order_count', name: '历史订单数', category: '外部', dataType: 'NUMBER', isInput: false, desc: '账号历史订单总数' },
        { code: 'ip', name: 'IP地址', category: '原始', dataType: 'STRING', isInput: true, desc: '注册请求IP地址，用于名单匹配' },
        { code: 'ip_is_proxy', name: 'IP是否代理', category: '外部', dataType: 'BOOLEAN', isInput: false, desc: 'IP是否为代理/VPN/IDC机房' },
        { code: 'ip_user_count_1h', name: '同IP1小时账号数', category: '聚合', dataType: 'NUMBER', isInput: false, desc: '同IP最近1小时不同账号数' },
        { code: 'phone', name: '手机号', category: '原始', dataType: 'STRING', isInput: true, desc: '用户手机号，用于名单匹配' },
        { code: 'phone_is_virtual', name: '是否虚拟号', category: '外部', dataType: 'BOOLEAN', isInput: false, desc: '手机号是否为170/171等虚拟号段' },
      ],
      flows: [
        {
          id: 'DF-1',
          name: '电商薅羊毛主流程',
          code: 'ecommerce_hair_flow_1',
          status: '已发布',
          version: 2,
          updatedAt: '2026-07-30T06:52:07',
          graph: {
            width: 1760,
            height: 520,
            nodes: [
              { id: 'start', type: 'start', title: '开始', subtitle: 'start', x: 40, y: 200 },
              { id: 'f1', type: 'feature', title: '特征加工', subtitle: 'feature_transform', badge: '特征', features: [
                { code: 'phone_is_virtual', name: '是否虚拟号', category: '外部' },
                { code: 'account_age_hours', name: '账号注册小时数', category: '原始' },
                { code: 'coupon_value', name: '优惠券面值', category: '原始' },
                { code: 'ip_user_count_1h', name: '同IP1小时账号数', category: '聚合' },
              ], x: 300, y: 200 },
              { id: 'l1', type: 'list', title: '名单匹配', subtitle: 'blacklist_match', badge: '名单', listRef: { listId: 'L-001', listName: '电商黑名单', matchField: 'phone', matchScore: 80 }, x: 560, y: 200 },
              { id: 'p1', type: 'policy', title: '账号质量策略', subtitle: 'identity_quality', badge: '策略', policy: { policyId: 'P-105', policyName: '账号质量策略' }, x: 820, y: 200 },
              { id: 'c1', type: 'condition', title: '风险等级判定', subtitle: 'risk_tier', badge: '条件', conditions: [
                { id: 'cd-1', label: '命中', expr: 'score >= 60' },
                { id: 'cd-2', label: '未命中', expr: 'score < 60' },
              ], x: 1080, y: 200 },
              { id: 'par1', type: 'parallel', title: '并行分发', subtitle: 'parallel', x: 1340, y: 60 },
              { id: 'p2', type: 'policy', title: '设备评分卡', subtitle: 'device_score', badge: '策略', policy: { policyId: 'P-104', policyName: '设备风险评分卡' }, x: 1340, y: 260 },
              { id: 'sub1', type: 'subflow', title: '地址聚集子流程', subtitle: 'address_check', badge: '子流程', subflowId: 'SF-1', subflowName: '地址聚集子流程', x: 1340, y: 420 },
              { id: 'mg1', type: 'merge', title: '合并汇流', subtitle: 'merge', x: 1620, y: 200 },
              { id: 'end', type: 'end', title: '结束', subtitle: 'end', x: 1620, y: 400 },
            ],
            edges: [
              { from: 'start', to: 'f1' },
              { from: 'f1', to: 'l1' },
              { from: 'l1', to: 'p1', label: '未命中', expr: 'blacklist_hit == false' },
              { from: 'l1', to: 'end', label: '命中', expr: 'blacklist_hit == true' },
              { from: 'p1', to: 'c1' },
              { from: 'c1', to: 'par1', label: '命中', expr: 'score >= 60', conditionId: 'cd-1' },
              { from: 'c1', to: 'end', label: '未命中', expr: 'score < 60', conditionId: 'cd-2' },
              { from: 'par1', to: 'p2', dashed: true },
              { from: 'par1', to: 'sub1', dashed: true },
              { from: 'p2', to: 'mg1' },
              { from: 'sub1', to: 'mg1' },
              { from: 'mg1', to: 'end' },
            ],
            subflows: [
              {
                width: 800, height: 260,
                nodes: [
                  { id: 'sf-start', type: 'start', title: '地址子流程开始', x: 40, y: 100 },
                  { id: 'sf-f', type: 'feature', title: '地址聚集特征', features: [{ code: 'address_user_count_7d', name: '同地址7日账号数', category: '聚合' }, { code: 'address_is_empty_box', name: '是否空包号地址', category: '外部' }], x: 260, y: 100 },
                  { id: 'sf-c', type: 'condition', title: '聚集判定', conditions: [{ id: 'sfc-1', label: '聚集', expr: 'address_user_count_7d >= 5' }, { id: 'sfc-2', label: '正常', expr: 'address_user_count_7d < 5' }], x: 480, y: 100 },
                  { id: 'sf-end', type: 'end', title: '返回主流程', x: 260, y: 220 },
                ],
                edges: [
                  { from: 'sf-start', to: 'sf-f' },
                  { from: 'sf-f', to: 'sf-c' },
                  { from: 'sf-c', to: 'sf-end', label: '聚集', expr: 'address_user_count_7d >= 5', conditionId: 'sfc-1' },
                  { from: 'sf-c', to: 'sf-end', label: '正常', expr: 'address_user_count_7d < 5', conditionId: 'sfc-2' },
                ],
              },
            ],
          },
        },
        {
          id: 'DF-3',
          name: '活动分级支流程',
          code: 'activity_tier_flow',
          status: '草稿',
          version: 1,
          updatedAt: '2026-07-30T06:52:07',
          graph: {
            width: 720,
            height: 260,
            nodes: [
              { id: 'astart', type: 'start', title: '开始', x: 40, y: 100 },
              { id: 'ap1', type: 'policy', title: '活动分级策略', policy: { policyId: 'P-101', policyName: '活动风险分级表' }, x: 260, y: 100 },
              { id: 'aend', type: 'end', title: '结束', x: 480, y: 100 },
            ],
            edges: [
              { from: 'astart', to: 'ap1' },
              { from: 'ap1', to: 'aend' },
            ],
          },
        },
      ],
    },
    {
      id: 'M-003',
      name: '交易反欺诈风控',
      code: 'trade_fraud',
      desc: '适用于互金/支付交易反欺诈，覆盖金额异常、名单匹配、交易分级、行为异常、设备环境评分等多维度策略',
      status: '已上线',
      type: '规则引擎',
      version: 'v1.5.0',
      creator: '风控运营',
      updatedAt: NOW + ' 07:45',
      createdAt: '2026-07-20',
      policies: [
        { id: 'P-301', name: '交易金额分级表', code: 'amount_tier', type: '决策表', updatedAt: '2026-07-20' },
        { id: 'P-302', name: '行为异常策略', code: 'behavior_anomaly', type: '规则集', updatedAt: '2026-07-20' },
        { id: 'P-303', name: '设备环境评分卡', code: 'device_env', type: '评分卡', updatedAt: '2026-07-20' },
      ],
      features: ['trade_amount', 'device_score', 'ip_risk', 'm3_overdue', 'debt_income_ratio'],
      versions: [
        { version: 'v1.5.0', date: NOW + ' 07:45', note: '接入行为异常规则集，拦截率提升 4pp', current: true },
      ],
      headerNo: 8,
      approvalStatus: '已通过',
      featureList: [
        { code: 'trade_amount', name: '交易金额', category: '原始', dataType: 'NUMBER', isInput: true, desc: '本次交易金额(元)' },
        { code: 'device_score', name: '设备风险评分', category: '外部', dataType: 'NUMBER', isInput: false, desc: '设备环境风险 0-100' },
        { code: 'ip_risk', name: 'IP风险画像', category: '外部', dataType: 'NUMBER', isInput: false, desc: 'IP风险等级 0-5' },
        { code: 'm3_overdue', name: '历史M3+逾期次数', category: '外部', dataType: 'NUMBER', isInput: false, desc: '历史M3+逾期次数' },
        { code: 'debt_income_ratio', name: '负债收入比', category: '聚合', dataType: 'NUMBER', isInput: false, desc: '月负债/月收入比' },
        { code: 'phone', name: '手机号', category: '原始', dataType: 'STRING', isInput: true, desc: '交易账号手机号，用于名单匹配' },
        { code: 'id_card', name: '身份证号', category: '原始', dataType: 'STRING', isInput: true, desc: '实名认证身份证，用于名单匹配' },
      ],
      flows: [
        {
          id: 'DF-4',
          name: '交易风控主流程',
          code: 'trade_fraud_flow_1',
          status: '已发布',
          version: 2,
          updatedAt: NOW + ' 07:45',
          graph: {
            width: 1600,
            height: 440,
            nodes: [
              { id: 'tstart', type: 'start', title: '开始', x: 40, y: 180 },
              { id: 'tf1', type: 'feature', title: '交易特征加工', features: [
                { code: 'trade_amount', name: '交易金额', category: '原始' },
                { code: 'device_score', name: '设备风险评分', category: '外部' },
                { code: 'ip_risk', name: 'IP风险画像', category: '外部' },
              ], x: 300, y: 180 },
              { id: 'tl1', type: 'list', title: '交易名单匹配', listRef: { listId: 'L-003', listName: '交易黑名单', matchField: 'phone', matchScore: 100 }, x: 560, y: 180 },
              { id: 'tp1', type: 'policy', title: '金额分级策略', policy: { policyId: 'P-301', policyName: '交易金额分级表' }, x: 820, y: 180 },
              { id: 'tc1', type: 'condition', title: '金额风险判定', conditions: [{ id: 'tcd-1', label: '大额', expr: 'trade_amount >= 50000' }, { id: 'tcd-2', label: '常规', expr: 'trade_amount < 50000' }], x: 1080, y: 180 },
              { id: 'tpar', type: 'parallel', title: '并行复核', x: 1340, y: 40 },
              { id: 'tp2', type: 'policy', title: '行为异常策略', policy: { policyId: 'P-302', policyName: '行为异常策略' }, x: 1340, y: 240 },
              { id: 'tsub', type: 'subflow', title: '设备环境子流程', subflowId: 'SF-2', subflowName: '设备环境子流程', x: 1340, y: 400 },
              { id: 'tmg', type: 'merge', title: '合并汇流', x: 1620, y: 200 },
              { id: 'tend', type: 'end', title: '结束', x: 1620, y: 380 },
            ],
            edges: [
              { from: 'tstart', to: 'tf1' },
              { from: 'tf1', to: 'tl1' },
              { from: 'tl1', to: 'tp1', label: '未命中', expr: 'blacklist_hit == false' },
              { from: 'tl1', to: 'tend', label: '命中', expr: 'blacklist_hit == true' },
              { from: 'tp1', to: 'tc1' },
              { from: 'tc1', to: 'tpar', label: '大额', expr: 'trade_amount >= 50000', conditionId: 'tcd-1' },
              { from: 'tc1', to: 'tend', label: '常规', expr: 'trade_amount < 50000', conditionId: 'tcd-2' },
              { from: 'tpar', to: 'tp2', dashed: true },
              { from: 'tpar', to: 'tsub', dashed: true },
              { from: 'tp2', to: 'tmg' },
              { from: 'tsub', to: 'tmg' },
              { from: 'tmg', to: 'tend' },
            ],
            subflows: [
              {
                width: 780, height: 240,
                nodes: [
                  { id: 'tsf-s', type: 'start', title: '设备环境开始', x: 40, y: 100 },
                  { id: 'tsf-p', type: 'policy', title: '设备环境评分', policy: { policyId: 'P-303', policyName: '设备环境评分卡' }, x: 260, y: 100 },
                  { id: 'tsf-c', type: 'condition', title: '设备风险判定', conditions: [{ id: 'tsfc-1', label: '高风险', expr: 'device_score >= 70' }, { id: 'tsfc-2', label: '正常', expr: 'device_score < 70' }], x: 480, y: 100 },
                  { id: 'tsf-e', type: 'end', title: '返回主流程', x: 260, y: 220 },
                ],
                edges: [
                  { from: 'tsf-s', to: 'tsf-p' },
                  { from: 'tsf-p', to: 'tsf-c' },
                  { from: 'tsf-c', to: 'tsf-e', label: '高风险', expr: 'device_score >= 70', conditionId: 'tsfc-1' },
                  { from: 'tsf-c', to: 'tsf-e', label: '正常', expr: 'device_score < 70', conditionId: 'tsfc-2' },
                ],
              },
            ],
          },
        },
      ],
    },
    {
      id: 'M-004',
      name: '账号登录风控',
      code: 'account_login',
      desc: '通用账号登录风控，覆盖暴力破解、名单匹配、登录决策树、环境评分等多维度策略',
      status: '测试中',
      type: '决策树',
      version: 'v1.0.0',
      creator: '算法组',
      updatedAt: NOW + ' 06:50',
      createdAt: '2026-07-30',
      policies: [
        { id: 'P-401', name: '登录环境评分卡', code: 'login_env', type: '评分卡', updatedAt: '2026-07-30' },
        { id: 'P-402', name: '暴力破解策略', code: 'brute_force', type: '规则引擎', updatedAt: '2026-07-30' },
      ],
      features: ['login_cnt_1h', 'device_score', 'ip_risk', 'captcha_pass'],
      versions: [
        { version: 'v1.0.0', date: NOW + ' 06:50', note: '初版登录风控，待灰度', current: true },
      ],
      headerNo: 2,
      approvalStatus: '草稿',
      featureList: [
        { code: 'login_cnt_1h', name: '1小时内登录失败次数', category: '聚合', dataType: 'NUMBER', isInput: false, desc: '同账号1小时内登录失败次数' },
        { code: 'device_score', name: '设备风险评分', category: '外部', dataType: 'NUMBER', isInput: false, desc: '设备环境风险 0-100' },
        { code: 'ip_risk', name: 'IP风险画像', category: '外部', dataType: 'NUMBER', isInput: false, desc: 'IP风险等级 0-5' },
        { code: 'captcha_pass', name: '验证码是否通过', category: '原始', dataType: 'BOOLEAN', isInput: true, desc: '图形/短信验证码是否通过' },
        { code: 'account', name: '登录账号', category: '原始', dataType: 'STRING', isInput: true, desc: '登录账号，用于名单匹配' },
      ],
      flows: [
        {
          id: 'DF-5',
          name: '登录风控主流程',
          code: 'account_login_flow_1',
          status: '测试中',
          version: 1,
          updatedAt: NOW + ' 06:50',
          graph: {
            width: 1240,
            height: 360,
            nodes: [
              { id: 'gstart', type: 'start', title: '开始', x: 40, y: 140 },
              { id: 'gf1', type: 'feature', title: '登录特征加工', features: [
                { code: 'login_cnt_1h', name: '1小时内登录失败次数', category: '聚合' },
                { code: 'device_score', name: '设备风险评分', category: '外部' },
                { code: 'ip_risk', name: 'IP风险画像', category: '外部' },
                { code: 'captcha_pass', name: '验证码是否通过', category: '原始' },
              ], x: 300, y: 140 },
              { id: 'gl1', type: 'list', title: '账号名单匹配', listRef: { listId: 'L-004', listName: '账号黑名单', matchField: 'account', matchScore: 85 }, x: 560, y: 140 },
              { id: 'gc1', type: 'condition', title: '暴力破解判定', conditions: [{ id: 'gcd-1', label: '疑似爆破', expr: 'login_cnt_1h >= 5' }, { id: 'gcd-2', label: '正常', expr: 'login_cnt_1h < 5' }], x: 820, y: 140 },
              { id: 'gp1', type: 'policy', title: '登录环境评分', policy: { policyId: 'P-401', policyName: '登录环境评分卡' }, x: 820, y: 300 },
              { id: 'gmg', type: 'merge', title: '合并', x: 1080, y: 140 },
              { id: 'gend', type: 'end', title: '结束', x: 1080, y: 300 },
            ],
            edges: [
              { from: 'gstart', to: 'gf1' },
              { from: 'gf1', to: 'gl1' },
              { from: 'gl1', to: 'gc1', label: '未命中', expr: 'blacklist_hit == false' },
              { from: 'gl1', to: 'gend', label: '命中', expr: 'blacklist_hit == true' },
              { from: 'gc1', to: 'gp1', label: '疑似爆破', expr: 'login_cnt_1h >= 5', conditionId: 'gcd-1' },
              { from: 'gc1', to: 'gmg', label: '正常', expr: 'login_cnt_1h < 5', conditionId: 'gcd-2' },
              { from: 'gp1', to: 'gmg' },
              { from: 'gmg', to: 'gend' },
            ],
          },
        },
      ],
    },
    {
      id: 'M-002',
      name: '注册测试风控',
      code: 'register_test',
      desc: '注册环节反机器人，覆盖机器特征、名单匹配、注册分级、账号评分',
      status: '草稿',
      type: 'XGBoost',
      version: 'v0.9.0',
      creator: '算法组',
      updatedAt: NOW + ' 08:30',
      createdAt: '2026-08-01',
      policies: [
        { id: 'P-201', name: '注册分级策略', code: 'register_tier', type: '决策表', updatedAt: '2026-08-01' },
      ],
      features: ['reg_cnt', 'device_score', 'ip_risk', 'email_domain'],
      versions: [
        { version: 'v0.9.0', date: NOW + ' 08:30', note: '初版模型，待测试', current: true },
      ],
      headerNo: 3,
      approvalStatus: '草稿',
      featureList: [
        { code: 'reg_cnt', name: '当日注册数', category: '聚合', dataType: 'NUMBER', isInput: false, desc: '同设备/IP当日注册次数' },
        { code: 'device_score', name: '设备风险评分', category: '外部', dataType: 'NUMBER', isInput: false, desc: '设备环境风险评分 0-100' },
        { code: 'ip_risk', name: 'IP风险画像', category: '外部', dataType: 'NUMBER', isInput: false, desc: 'IP风险等级 0-5' },
        { code: 'email_domain', name: '邮箱域名风险', category: '原始', dataType: 'NUMBER', isInput: true, desc: '邮箱域名风险分 0-10' },
        { code: 'phone', name: '手机号', category: '原始', dataType: 'STRING', isInput: true, desc: '注册手机号，用于名单匹配' },
        { code: 'ip', name: 'IP地址', category: '原始', dataType: 'STRING', isInput: true, desc: '注册IP，用于名单匹配' },
      ],
      flows: [
        {
          id: 'DF-2',
          name: '注册风控主流程',
          code: 'register_test_flow_1',
          status: '草稿',
          version: 1,
          updatedAt: NOW + ' 08:30',
          graph: {
            width: 1480,
            height: 440,
            nodes: [
              { id: 'rstart', type: 'start', title: '开始', subtitle: 'start', x: 40, y: 180 },
              { id: 'rf1', type: 'feature', title: '注册特征加工', features: [
                { code: 'reg_cnt', name: '当日注册数', category: '聚合' },
                { code: 'device_score', name: '设备风险评分', category: '外部' },
                { code: 'ip_risk', name: 'IP风险画像', category: '外部' },
                { code: 'email_domain', name: '邮箱域名风险', category: '原始' },
              ], x: 300, y: 180 },
              { id: 'rl1', type: 'list', title: '名单匹配', listRef: { listId: 'L-002', listName: '注册黑名单', matchField: 'phone', matchScore: 90 }, x: 560, y: 180 },
              { id: 'rp1', type: 'policy', title: '注册分级策略', policy: { policyId: 'P-201', policyName: '注册分级策略' }, x: 820, y: 180 },
              { id: 'rc1', type: 'condition', title: '注册风险分级', conditions: [{ id: 'rcd-1', label: '高危', expr: 'risk_score >= 80' }, { id: 'rcd-2', label: '中危', expr: 'risk_score >= 60' }, { id: 'rcd-3', label: '低危', expr: 'risk_score < 60' }], x: 1080, y: 180 },
              { id: 'rend', type: 'end', title: '结束', subtitle: 'end', x: 1320, y: 180 },
            ],
            edges: [
              { from: 'rstart', to: 'rf1' },
              { from: 'rf1', to: 'rl1' },
              { from: 'rl1', to: 'rp1', label: '未命中', expr: 'blacklist_hit == false' },
              { from: 'rl1', to: 'rend', label: '命中', expr: 'blacklist_hit == true' },
              { from: 'rp1', to: 'rc1' },
              { from: 'rc1', to: 'rend', label: '高危', expr: 'risk_score >= 80', conditionId: 'rcd-1' },
              { from: 'rc1', to: 'rend', label: '中危', expr: 'risk_score >= 60', conditionId: 'rcd-2' },
              { from: 'rc1', to: 'rend', label: '低危', expr: 'risk_score < 60', conditionId: 'rcd-3' },
            ],
          },
        },
      ],
    },
  ],

  /* ---------- 特征库 ---------- */
  features: [
    { id: 'F-001', code: 'user_age', name: '用户注册时长(天)', type: '原始', dataType: 'NUMBER', owner: '客户域', desc: '账号注册到当前的时长', updatedAt: '2026-07-20', version: 'v1.0.0', status: '启用', sceneTag: '账号', linkedModels: '电商薅羊毛风控' },
    { id: 'F-002', code: 'device_score', name: '设备风险评分', type: '外部', dataType: 'NUMBER', owner: '设备域', desc: '设备环境风险评估 0-100，越高风险越大', updatedAt: '2026-07-21', version: 'v1.2.0', status: '启用', sceneTag: '设备', linkedModels: '电商薅羊毛风控、注册测试风控', externalApi: { mode: 'DATASOURCE', datasource: '91001', responsePath: 'data' } },
    { id: 'F-003', code: 'address_cnt', name: '近30天收货地址数', type: '聚合', dataType: 'NUMBER', owner: '订单域', desc: '近30天下单使用的收货地址数量', updatedAt: '2026-07-22', version: 'v1.1.0', status: '启用', sceneTag: '地址', linkedModels: '电商薅羊毛风控' },
    { id: 'F-004', code: 'order_cnt', name: '近30天订单数', type: '原始', dataType: 'NUMBER', owner: '订单域', desc: '近30天订单总量', updatedAt: '2026-07-22', version: 'v1.0.0', status: '启用', sceneTag: '行为', linkedModels: '电商薅羊毛风控' },
    { id: 'F-005', code: 'blacklist_hit', name: '黑名单命中标识', type: '聚合', dataType: 'BOOLEAN', owner: '名单域', desc: '是否命中黑名单 0/1', updatedAt: '2026-07-23', version: 'v1.0.0', status: '启用', sceneTag: '名单', linkedModels: '电商薅羊毛风控、注册测试风控' },
    { id: 'F-006', code: 'ip_risk', name: 'IP 风险画像', type: '外部', dataType: 'NUMBER', owner: '网络域', desc: 'IP 风险等级 0-5，越高风险越大', updatedAt: '2026-07-24', version: 'v1.3.0', status: '启用', sceneTag: '网络', linkedModels: '注册测试风控' },
    { id: 'F-007', code: 'reg_cnt', name: '当日注册数', type: '聚合', dataType: 'NUMBER', owner: '注册域', desc: '同设备/IP当日注册次数', updatedAt: '2026-07-25', version: 'v1.0.0', status: '草稿', sceneTag: '注册', linkedModels: '注册测试风控' },
    { id: 'F-008', code: 'email_domain', name: '邮箱域名风险', type: '原始', dataType: 'NUMBER', owner: '账户域', desc: '邮箱域名风险分 0-10', updatedAt: '2026-07-26', version: 'v1.0.0', status: '禁用', sceneTag: '账号', linkedModels: '' },
  ],

  /* ---------- 特征监控 ---------- */
  featureMonitor: [
    { code: 'user_age', name: '用户注册时长(天)', type: '基础特征', dataType: 'int', calls: 12480, missing: 120, empty: 98, missingRate: 0.96, emptyRate: 0.79 },
    { code: 'device_score', name: '设备风险评分', type: '模型特征', dataType: 'float', calls: 11830, missing: 4495, empty: 0, missingRate: 38.0, emptyRate: 0 },
    { code: 'address_cnt', name: '近30天收货地址数', type: '衍生特征', dataType: 'int', calls: 9860, missing: 395, empty: 210, missingRate: 4.0, emptyRate: 2.1 },
    { code: 'order_cnt', name: '近30天订单数', type: '基础特征', dataType: 'int', calls: 9860, missing: 0, empty: 0, missingRate: 0, emptyRate: 0 },
    { code: 'blacklist_hit', name: '黑名单命中标识', type: '衍生特征', dataType: 'bool', calls: 12480, missing: 0, empty: 0, missingRate: 0, emptyRate: 0 },
    { code: 'ip_risk', name: 'IP 风险画像', type: '模型特征', dataType: 'int', calls: 11020, missing: 1830, empty: 0, missingRate: 16.6, emptyRate: 0 },
    { code: 'reg_cnt', name: '当日注册数', type: '衍生特征', dataType: 'int', calls: 8050, missing: 320, empty: 150, missingRate: 3.98, emptyRate: 1.86 },
    { code: 'email_domain', name: '邮箱域名风险', type: '基础特征', dataType: 'int', calls: 7120, missing: 285, empty: 0, missingRate: 4.0, emptyRate: 0 },
  ],

  /* ---------- 名单库 ---------- */
  lists: [
    { id: 'L-001', name: '中介号码名单', code: 'mid_num_black', kind: '黑名单', matchKey: '手机号', matchStrategy: '精确匹配', source: '人工导入', recordCount: 12843, createdAt: '2026-05-12', records: [], stat: { valid: 12843, expired: 0, expiring: 0 } },
    { id: 'L-002', name: '空包号地址名单', code: 'empty_addr_black', kind: '黑名单', matchKey: '地址', matchStrategy: '模糊匹配', source: '人工导入', recordCount: 8920, createdAt: '2026-05-20', records: [], stat: { valid: 8920, expired: 0, expiring: 0 } },
    { id: 'L-003', name: '虚拟号段名单', code: 'virtual_num_black', kind: '黑名单', matchKey: '手机号段', matchStrategy: '模糊匹配', source: '第三方', recordCount: 356, createdAt: '2026-06-02', records: [], stat: { valid: 356, expired: 0, expiring: 0 } },
    { id: 'L-004', name: 'PEP 政治敏感名单', code: 'pep_black', kind: '黑名单', matchKey: '姓名', matchStrategy: '模糊匹配', source: '第三方', recordCount: 2080, createdAt: '2026-06-15', records: [], stat: { valid: 2080, expired: 0, expiring: 0 } },
    { id: 'L-005', name: '制裁名单', code: 'sanction_black', kind: '黑名单', matchKey: '姓名', matchStrategy: '精确匹配', source: '第三方', recordCount: 1520, createdAt: '2026-06-18', records: [], stat: { valid: 1520, expired: 0, expiring: 0 } },
    { id: 'L-006', name: '代理IP灰名单', code: 'proxy_ip_gray', kind: '灰名单', matchKey: 'IP', matchStrategy: '精确匹配', source: '系统自学习', recordCount: 54210, createdAt: '2026-07-01', records: [], stat: { valid: 54210, expired: 0, expiring: 0 } },
    { id: 'L-007', name: 'IP黑名单', code: 'ip_black', kind: '黑名单', matchKey: 'IP', matchStrategy: '精确匹配', source: '人工导入', recordCount: 34500, createdAt: '2026-07-08', records: [], stat: { valid: 34500, expired: 0, expiring: 0 } },
    { id: 'L-008', name: '设备黑名单', code: 'device_black', kind: '黑名单', matchKey: '设备ID', matchStrategy: '精确匹配', source: '系统自学习', recordCount: 20810, createdAt: '2026-07-15', records: [], stat: { valid: 20810, expired: 0, expiring: 0 } },
    { id: 'L-009', name: '手机号黑名单', code: 'mobile_black', kind: '黑名单', matchKey: '手机号', matchStrategy: '精确匹配', source: '人工导入', recordCount: 98760, createdAt: '2026-07-20', records: [], stat: { valid: 98760, expired: 0, expiring: 0 } },
    {
      id: 'L-010', name: '城市名单', code: 'city_list', kind: '灰名单', matchKey: '城市', matchStrategy: '模糊匹配', source: '内置', recordCount: 120, createdAt: '2026-04-01',
      stat: { valid: 6, expired: 1, expiring: 2 },
      records: [
        { id: 'R-1', value: '北京', ext: '高渗透', createdAt: '2026-04-01' },
        { id: 'R-2', value: '上海', ext: '高渗透', createdAt: '2026-04-01' },
        { id: 'R-3', value: '广州', ext: '中渗透', createdAt: '2026-05-10' },
        { id: 'R-4', value: '深圳', ext: '中渗透', createdAt: '2026-05-10' },
        { id: 'R-5', value: '杭州', ext: '低渗透', expireAt: '2026-08-18', createdAt: '2026-06-01' },
        { id: 'R-6', value: '成都', ext: '低渗透', expireAt: '2026-08-20', createdAt: '2026-06-01' },
        { id: 'R-7', value: '武汉', ext: '已失效', expireAt: '2026-07-01', createdAt: '2026-01-10' },
      ],
    },
  ],

  /* ---------- 模板市场 ---------- */
  templates: [
    { id: '9001', name: '信贷反欺诈', scene: '银行', desc: '适用于银行信贷业务反欺诈场景，覆盖身份验证、名单匹配、设备风险评分、申请行为异常、关联网络风险等多维度策略', industry: '银行', tags: ['银行', '信贷反欺诈', '官方'], rating: 4.5, ratingCount: 2, useCount: 0 },
    { id: '9002', name: '营销防刷', scene: '电商', desc: '适用于电商/互金营销活动防刷场景，覆盖频率限制、名单匹配、设备评分、账号质量分级、优惠券滥用等多维度策略', industry: '电商', tags: ['电商', '营销防刷', '官方'], rating: 4.0, ratingCount: 1, useCount: 0, code: 'marketing_anti_cheat', policies: [
      { name: '频率限制策略', code: 'frequency_check', type: '规则引擎' },
      { name: '名单匹配策略', code: 'blacklist_match', type: '名单匹配' },
      { name: '设备风险评分卡', code: 'device_risk_score', type: '评分卡' },
      { name: '账号质量分级表', code: 'account_quality', type: '决策表' },
      { name: '优惠券滥用策略', code: 'coupon_abuse', type: '规则集' },
    ] },
    { id: '9003', name: '交易风控', scene: '互金', desc: '适用于互金/支付交易风控场景，覆盖金额异常、名单匹配、交易分级、行为异常、设备环境评分等多维度策略', industry: '互金', tags: ['互金', '交易风控', '官方'], rating: 0.0, ratingCount: 0, useCount: 0 },
    { id: '9004', name: '保险核保反欺诈', scene: '保险', desc: '适用于寿险/健康险核保环节反欺诈，覆盖投保人风险、名单匹配、核保分级、健康评分、代理人风险等多维度策略', industry: '保险', tags: ['保险', '核保反欺诈', '官方'], rating: 0.0, ratingCount: 0, useCount: 0 },
    { id: '9005', name: '信用卡盗刷监测', scene: '银行', desc: '适用于信用卡实时交易盗刷监测，覆盖位置异常、名单匹配、交易决策树、用卡评分、商户风险等多维度策略', industry: '银行', tags: ['银行', '盗刷监测', '官方'], rating: 0.0, ratingCount: 0, useCount: 0 },
    { id: '9006', name: '电商防薅羊毛', scene: '电商', desc: '适用于电商优惠券/秒杀/拼团活动防薅羊毛，覆盖账号质量、名单匹配、活动分级、设备评分、地址聚集等多维度策略', industry: '电商', tags: ['电商', '订单风控', '官方'], rating: 0.0, ratingCount: 0, useCount: 0, code: 'ecommerce_anti_wool', policies: [
      { name: '账号质量策略', code: 'identity_quality', type: '规则引擎' },
      { name: '名单匹配策略', code: 'blacklist_match', type: '名单匹配' },
      { name: '活动风险分级表', code: 'activity_tier', type: '决策表' },
      { name: '设备风险评分卡', code: 'device_score', type: '评分卡' },
      { name: '地址聚集策略', code: 'address_aggregation', type: '规则集' },
    ], rules: [
      { name: '虚拟号段手机号', condition: 'phone_is_virtual == true', score: 50, priority: 150 },
      { name: '新注册账号秒下单', condition: 'account_age_hours < 1', score: 40, priority: 120 },
      { name: '无任何历史交易', condition: 'history_order_count == 0 && coupon_value > 50', score: 30, priority: 100 },
      { name: '同地址多账号收货', condition: 'address_user_count_7d > 5', score: 60, priority: 160 },
      { name: '同IP多账号下单', condition: 'ip_user_count_1h > 8', score: 50, priority: 140 },
      { name: '空包号物流地址', condition: 'address_is_empty_box == true', score: 70, priority: 180 },
    ], features: [
      { name: '是否虚拟号', code: 'phone_is_virtual', type: '外部', dataType: 'BOOLEAN' },
      { name: '账号注册小时数', code: 'account_age_hours', type: '原始', dataType: 'NUMBER' },
      { name: '历史订单数', code: 'history_order_count', type: '外部', dataType: 'NUMBER' },
      { name: '优惠券面值', code: 'coupon_value', type: '原始', dataType: 'NUMBER' },
      { name: '同地址7日账号数', code: 'address_user_count_7d', type: '聚合', dataType: 'NUMBER' },
      { name: '同IP1小时账号数', code: 'ip_user_count_1h', type: '聚合', dataType: 'NUMBER' },
      { name: '是否空包号地址', code: 'address_is_empty_box', type: '外部', dataType: 'BOOLEAN' },
      { name: '是否模拟器', code: 'device_is_emulator', type: '外部', dataType: 'BOOLEAN' },
      { name: '是否Root/越狱', code: 'device_is_rooted', type: '原始', dataType: 'BOOLEAN' },
      { name: '设备指纹匹配数', code: 'device_fingerprint_match_count', type: '聚合', dataType: 'NUMBER' },
      { name: 'IP是否代理', code: 'ip_is_proxy', type: '外部', dataType: 'BOOLEAN' },
      { name: '手机号', code: 'phone', type: '原始', dataType: 'STRING' },
      { name: '收货地址', code: 'address', type: '原始', dataType: 'STRING' },
      { name: 'IP地址', code: 'ip', type: '原始', dataType: 'STRING' },
    ] },
    { id: '9007', name: '借贷申请反欺诈', scene: '互金', desc: '适用于P2P/消费金融贷款申请环节反欺诈，覆盖多头借贷、名单匹配、信用评分、负债分级、资料伪造等多维度策略', industry: '互金', tags: ['互金', '贷款申请', '官方'], rating: 0.0, ratingCount: 0, useCount: 0 },
    { id: '9008', name: '账号登录风控', scene: '通用', desc: '通用账号登录风控，覆盖暴力破解、名单匹配、登录决策树、环境评分等多维度策略，适用于所有需要登录的业务', industry: '通用', tags: ['通用', '登录验证', '官方'], rating: 0.0, ratingCount: 0, useCount: 0 },
    { id: '9009', name: '社交注册反垃圾', scene: '社交', desc: '适用于社交/IM/UGC平台注册环节反机器人，覆盖机器特征、名单匹配、注册分级、账号评分等多维度策略', industry: '社交', tags: ['社交', '注册风控', '官方'], rating: 0.0, ratingCount: 0, useCount: 0 },
    { id: '9010', name: '企业账户反洗钱', scene: '银行', desc: '适用于企业账户反洗钱(AML)监测，覆盖交易模式、制裁名单匹配、交易分级、客户评分、异常模式等多维度策略', industry: '银行', tags: ['银行', '反洗钱', '官方'], rating: 0.0, ratingCount: 0, useCount: 0 },
  ],

  /* ---------- 版本管理（运行管理） ---------- */
  versions: [
    { id: 'V-001', name: '电商薅羊毛风控', type: '模型', version: 'v2.3.1', status: '已发布', creator: '风控运营', createdAt: NOW + ' 09:10' },
    { id: 'V-002', name: '电商薅羊毛风控', type: '模型', version: 'v2.2.0', status: '已回滚', creator: '风控运营', createdAt: '2026-07-28' },
    { id: 'V-003', name: '注册测试风控', type: '模型', version: 'v0.9.0', status: '草稿', creator: '算法组', createdAt: NOW + ' 08:30' },
    { id: 'V-004', name: '活动风险分级表', type: '策略', version: 'v1.2.0', status: '灰度中', creator: '风控运营', createdAt: NOW + ' 07:45' },
    { id: 'V-005', name: '手机号黑名单', type: '名单', version: 'v20260814', status: '已发布', creator: '名单管理员', createdAt: NOW + ' 06:20' },
  ],

  /* ---------- 流量分配 ---------- */
  trafficSplits: [
    { id: 'T-001', name: '电商薅羊毛灰度', model: '电商薅羊毛风控 v2.3.1(新)', ratio: 20, status: '生效中', desc: '20% 流量走新版本，对比拒绝率' },
    { id: 'T-002', name: '注册测试引流', model: '注册测试风控 v0.9.0(测试)', ratio: 10, status: '生效中', desc: '10% 注册流量走测试模型' },
    { id: 'T-003', name: '线上稳定流量', model: '电商薅羊毛风控 v2.2.0(线上)', ratio: 70, status: '生效中', desc: '主流量走线上稳定版本' },
  ],

  /* ---------- 决策回放 ---------- */
  replays: [
    { id: 'R-1001', name: '测试回放', model: 'reg_test', targetVersion: 'v2.3.1', status: '已完成', progress: 100, total: 14, done: 14, creator: 'test', createdAt: '2026-07-28T03:49:58' },
    { id: 'R-1002', name: '灰度对比回放', model: 'ecommerce_hair', targetVersion: 'v2.3.1', status: '执行中', progress: 62, total: 1000, done: 620, creator: '风控运营', createdAt: NOW + ' 10:00' },
  ],

  /* ---------- 回放结果 ---------- */
  replayResults: [
    { requestId: 'REQ-202608140001', oldDecision: '通过', oldScore: 82, newDecision: '拒绝', newScore: 91, changed: 1, scoreDiff: 9, costMs: 28 },
    { requestId: 'REQ-202608140002', oldDecision: '通过', oldScore: 75, newDecision: '通过', newScore: 76, changed: 0, scoreDiff: 1, costMs: 25 },
    { requestId: 'REQ-202608140003', oldDecision: '拒绝', oldScore: 88, newDecision: '拒绝', newScore: 89, changed: 0, scoreDiff: 1, costMs: 31 },
    { requestId: 'REQ-202608140004', oldDecision: '人工复核', oldScore: 63, newDecision: '拒绝', newScore: 78, changed: 1, scoreDiff: 15, costMs: 40 },
    { requestId: 'REQ-202608140005', oldDecision: '通过', oldScore: 70, newDecision: '通过', newScore: 71, changed: 0, scoreDiff: 1, costMs: 22 },
  ],

  /* ---------- 批量决策 ---------- */
  batchTasks: [
    { id: 'B-1001', name: '8月客群批量跑分', model: 'ecommerce_hair', status: '已完成', progress: 100, done: 5000, total: 5000, resultDist: '通过 82% / 拒绝 18%', creator: '风控运营', createdAt: NOW + ' 09:00' },
    { id: 'B-1002', name: '新客名单反欺诈', model: 'register_test', status: '执行中', progress: 45, done: 2250, total: 5000, resultDist: '通过 88% / 拒绝 12%', creator: '算法组', createdAt: NOW + ' 10:20' },
  ],

  /* ---------- 监控大盘 ---------- */
  monitor: {
    todayCalls: 18420,
    todayPassRate: 76.2,
    todayRejectRate: 18.4,
    todayReviewRate: 5.4,
    avgCostMs: 32,
    p95CostMs: 86,
    activeModels: 12,
    activeFeatures: 268,
    callTrend: [
      { date: '08-08', calls: 15620, pass: 12000, reject: 2860 },
      { date: '08-09', calls: 16200, pass: 12450, reject: 2990 },
      { date: '08-10', calls: 15880, pass: 12180, reject: 2910 },
      { date: '08-11', calls: 17120, pass: 13060, reject: 3160 },
      { date: '08-12', calls: 17560, pass: 13400, reject: 3240 },
      { date: '08-13', calls: 17980, pass: 13720, reject: 3320 },
      { date: '08-14', calls: 18420, pass: 14040, reject: 3390 },
    ],
    decisionDist: [
      { label: '通过', value: 76.2 },
      { label: '拒绝', value: 18.4 },
      { label: '人工复核', value: 5.4 },
    ],
    blockDist: [
      { label: '名单命中', value: 42 },
      { label: '规则拦截', value: 31 },
      { label: '模型分超限', value: 18 },
      { label: '设备风险', value: 9 },
    ],
    topRules: [
      { rule: '命中黑名单', hits: 1842 },
      { rule: '设备风险评分≥80', hits: 1320 },
      { rule: '近30天订单数异常', hits: 1105 },
      { rule: '地址聚集≥3', hits: 980 },
      { rule: 'IP风险画像≥4', hits: 764 },
    ],
    modelHealth: [
      { model: 'ecommerce_hair', calls: 8420, errorRate: 0.02, avgCost: 30, status: '稳定' },
      { model: 'register_test', calls: 3150, errorRate: 0.05, avgCost: 45, status: '注意' },
      { model: 'credit_fraud', calls: 6850, errorRate: 1.2, avgCost: 120, status: '异常' },
    ],
  },

  /* ---------- 告警 ---------- */
  alerts: [
    { id: 'AL-1001', title: '「电商薅羊毛风控」P95 耗时突增', level: '重要', status: '待处理', source: '决策耗时', desc: 'P95 耗时 86ms，较基线上升 42%，请核查模型性能', createdAt: NOW + ' 09:20', handler: undefined },
    { id: 'AL-1002', title: '「设备风险评分卡」特征缺失率超阈值', level: '紧急', status: '处理中', source: '特征缺失率', desc: '特征 device_score 缺失率 38%，超过阈值 30%', createdAt: NOW + ' 08:45', handler: '风控运营' },
    { id: 'AL-1003', title: '「credit_fraud」错误率偏高', level: '重要', status: '待处理', source: '模型错误率', desc: '模型错误率 1.2%，超过阈值 0.5%', createdAt: NOW + ' 08:10' },
    { id: 'AL-1004', title: '「IP黑名单」命中量突增', level: '提示', status: '已处理', source: '名单命中', desc: '近1小时命中量较均值上升 2.1 倍', createdAt: NOW + ' 07:00', handler: '风控运营' },
    { id: 'AL-1005', title: '「决策回放-灰度对比」完成', level: '提示', status: '已处理', source: '回放任务', desc: '回放任务 R-1001 已完成，差异 3 条', createdAt: NOW + ' 06:30', handler: 'test' },
  ],
  alertRules: [
    { id: 'AR-1', name: '决策耗时预警', metric: 'P95 耗时(ms)', metricType: '耗时', condition: '>', threshold: 80, level: '重要', enabled: true },
    { id: 'AR-2', name: '特征缺失率预警', metric: '特征缺失率(%)', metricType: '特征', condition: '>', threshold: 30, level: '紧急', enabled: true },
    { id: 'AR-3', name: '模型错误率预警', metric: '模型错误率(%)', metricType: '错误率', condition: '>', threshold: 0.5, level: '重要', enabled: true },
    { id: 'AR-4', name: '名单命中量突增', metric: '命中量增幅(倍)', metricType: '命中', condition: '>', threshold: 2, level: '提示', enabled: false },
  ],
  notifyChannels: [
    { id: 'NC-1', name: '风控值班短信', type: '短信', target: '138****8899', level: '紧急', enabled: true },
    { id: 'NC-2', name: '风控运营邮件', type: '邮件', target: 'riskops@company.com', level: '重要', enabled: true },
    { id: 'NC-3', name: '告警群企微', type: '企业微信', target: '风控告警群', level: '提示', enabled: true },
    { id: 'NC-4', name: '测试', type: 'Webhook', target: '', level: '提示', enabled: true },
  ],

  /* ---------- 决策分析 ---------- */
  decisionAnalysis: {
    decisionDist: [
      { label: '通过', value: 14040, rate: 76.2 },
      { label: '拒绝', value: 3390, rate: 18.4 },
      { label: '人工复核', value: 995, rate: 5.4 },
    ],
    channelTrend: [
      { date: '08-08', online: 8200, api: 5200, batch: 2220 },
      { date: '08-09', online: 8600, api: 5300, batch: 2300 },
      { date: '08-10', online: 8400, api: 5200, batch: 2280 },
      { date: '08-11', online: 9100, api: 5500, batch: 2520 },
      { date: '08-12', online: 9300, api: 5600, batch: 2660 },
      { date: '08-13', online: 9500, api: 5700, batch: 2780 },
      { date: '08-14', online: 9800, api: 5900, batch: 2720 },
    ],
    ruleContribution: [
      { rule: '命中黑名单', hits: 1842, blockRate: 28.4 },
      { rule: '设备风险评分≥80', hits: 1320, blockRate: 21.3 },
      { rule: '地址聚集≥3', hits: 980, blockRate: 15.8 },
      { rule: 'IP风险画像≥4', hits: 764, blockRate: 12.3 },
    ],
    profile: [
      { dim: '设备风险', desc: '被拒客群中设备风险评分≥80 占比 41%', rate: 41 },
      { dim: '地址聚集', desc: '被拒客群中近30天地址数≥3 占比 35%', rate: 35 },
      { dim: '账号质量', desc: '被拒客群中注册时长<30天 占比 28%', rate: 28 },
    ],
  },

  /* ---------- 规则命中 ---------- */
  ruleHit: {
    topRules: [
      { rule: '命中黑名单', hits: 1842, rate: 11.3, trend: [8.5, 9.1, 9.8, 10.4, 11.0, 11.3] },
      { rule: '设备风险评分≥80', hits: 1320, rate: 8.1, trend: [6.2, 6.8, 7.2, 7.6, 7.9, 8.1] },
      { rule: '近30天订单数异常', hits: 1105, rate: 6.8, trend: [5.5, 5.9, 6.2, 6.4, 6.6, 6.8] },
      { rule: '地址聚集≥3', hits: 980, rate: 6.0, trend: [4.8, 5.2, 5.5, 5.7, 5.9, 6.0] },
      { rule: 'IP风险画像≥4', hits: 764, rate: 4.7, trend: [3.9, 4.1, 4.3, 4.5, 4.6, 4.7] },
    ],
    hitTrend: [
      { date: '08-08', hits: 1650 }, { date: '08-09', hits: 1720 }, { date: '08-10', hits: 1690 },
      { date: '08-11', hits: 1830 }, { date: '08-12', hits: 1870 }, { date: '08-13', hits: 1910 }, { date: '08-14', hits: 1970 },
    ],
    ruleDist: [
      { type: '名单命中', value: 42 }, { type: '规则拦截', value: 31 }, { type: '模型分超限', value: 18 }, { type: '设备风险', value: 9 },
    ],
    hitDetail: [
      { rule: '命中黑名单', code: 'blacklist_match', type: '名单匹配', hits: 1842, rate: 11.3, status: '启用' },
      { rule: '设备风险评分≥80', code: 'device_score', type: '评分卡', hits: 1320, rate: 8.1, status: '启用' },
      { rule: '近30天订单数异常', code: 'order_abnormal', type: '规则引擎', hits: 1105, rate: 6.8, status: '启用' },
      { rule: '地址聚集≥3', code: 'address_aggregation', type: '规则集', hits: 980, rate: 6.0, status: '启用' },
      { rule: 'IP风险画像≥4', code: 'ip_risk', type: '规则引擎', hits: 764, rate: 4.7, status: '停用' },
    ],
  },

  /* ---------- 决策日志 ---------- */
  decisionLogs: [
    { id: '1', requestId: 'REQ-202608140001', time: NOW + ' 10:32:18', channel: '在线', custId: 'CUST-100901', custName: '张伟', model: 'ecommerce_hair', score: 91, decision: '拒绝', costMs: 28, source: '命中黑名单' },
    { id: '2', requestId: 'REQ-202608140002', time: NOW + ' 10:31:55', channel: 'API', custId: 'CUST-100902', custName: '李娜', model: 'ecommerce_hair', score: 65, decision: '人工复核', costMs: 35, source: '设备风险评分≥80' },
    { id: '3', requestId: 'REQ-202608140003', time: NOW + ' 10:31:22', channel: '在线', custId: 'CUST-100903', custName: '王芳', model: 'ecommerce_hair', score: 76, decision: '通过', costMs: 25, source: '无命中' },
    { id: '4', requestId: 'REQ-202608140004', time: NOW + ' 10:30:50', channel: '批量', custId: 'CUST-100904', custName: '刘强', model: 'register_test', score: 88, decision: '拒绝', costMs: 40, source: 'IP风险画像≥4' },
    { id: '5', requestId: 'REQ-202608140005', time: NOW + ' 10:30:20', channel: 'API', custId: 'CUST-100905', custName: '陈静', model: 'ecommerce_hair', score: 59, decision: '通过', costMs: 22, source: '无命中' },
    { id: '6', requestId: 'REQ-202608140006', time: NOW + ' 10:29:47', channel: '在线', custId: 'CUST-100906', custName: '杨光', model: 'ecommerce_hair', score: 94, decision: '拒绝', costMs: 31, source: '命中黑名单' },
    { id: '7', requestId: 'REQ-202608140007', time: NOW + ' 10:29:15', channel: '批量', custId: 'CUST-100907', custName: '赵敏', model: 'register_test', score: 72, decision: '人工复核', costMs: 38, source: '近30天订单数异常' },
    { id: '8', requestId: 'REQ-202608140008', time: NOW + ' 10:28:43', channel: '在线', custId: 'CUST-100908', custName: '孙磊', model: 'ecommerce_hair', score: 68, decision: '通过', costMs: 26, source: '无命中' },
  ],

  /* ---------- 审批 ---------- */
  approvals: [
    { id: 'AP-1', target: '电商薅羊毛风控', targetType: '模型', action: '发布', status: '待审批', applicant: '风控运营', approver: undefined, applyTime: NOW + ' 12:12:50', flowId: 'f-de-approve', flowState: '待审批', flowStateAt: NOW + ' 12:12:50' },
    { id: 'AP-2', target: '手机号黑名单', targetType: '名单', action: '上线', status: '待审批', applicant: '名单管理员', approver: undefined, applyTime: NOW + ' 11:40:00', flowId: 'f-de-approve', flowState: '待审批', flowStateAt: NOW + ' 11:40:00' },
    { id: 'AP-3', target: '活动风险分级表', targetType: '策略', action: '修改', status: '已通过', applicant: '风控运营', approver: '系统管理员', applyTime: '2026-08-13', flowId: 'f-de-approve', flowState: '已通过', flowStateAt: '2026-08-13' },
    { id: 'AP-4', target: '注册测试风控', targetType: '模型', action: '上线', status: '已驳回', applicant: '算法组', approver: '系统管理员', applyTime: '2026-08-12', flowId: 'f-de-approve', flowState: '已驳回', flowStateAt: '2026-08-12' },
  ],
};

/* ============================================================
 * 轻量 store（复用 scoreData / midStore 模式）
 * ========================================================== */
const FILE = 'decisionData.json';
let data: DecisionData = JSON.parse(JSON.stringify(SEED_DECISION));
let version = 0;
let saveStatus: 'ok' | 'error' | null = null;
const listeners = new Set<() => void>();
const statusListeners = new Set<() => void>();

function emit() { version++; listeners.forEach((fn) => fn()); }
function emitStatus() { statusListeners.forEach((fn) => fn()); }

async function loadOne(file: string): Promise<unknown> {
  try {
    const r = await fetch(`/api/load-mid?file=${encodeURIComponent(file)}`);
    if (r.ok) return await r.json();
    return null;
  } catch { return null; }
}
function saveOne(file: string, body: unknown) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => { saveStatus = r.ok ? 'ok' : 'error'; emitStatus(); })
    .catch(() => { saveStatus = 'error'; emitStatus(); });
}

async function bootstrap() {
  const saved = await loadOne(FILE);
  const hasNewShape =
    saved && typeof saved === 'object' &&
    Array.isArray((saved as DecisionData).models) &&
    (saved as DecisionData).models.every((m) => Array.isArray((m as { featureList?: unknown }).featureList)) &&
    Array.isArray((saved as DecisionData).monitor as unknown);
  if (hasNewShape) {
    data = saved as DecisionData;
  } else {
    data = JSON.parse(JSON.stringify(SEED_DECISION));
    saveOne(FILE, data);
  }
  emit();
}
void bootstrap();

function useSnap<T>(sel: () => T): T {
  useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => version,
  );
  return sel();
}

export function useDecision(): DecisionData { return useSnap(() => data); }
export function useDecisionSaveStatus(): 'ok' | 'error' | null {
  useSyncExternalStore(
    (l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; },
    () => saveStatus,
  );
  return saveStatus;
}
export function updateDecision(fn: (d: DecisionData) => DecisionData) {
  data = fn(data);
  emit();
  saveOne(FILE, data);
}

/** 决策结果 → 标签色 */
export const DECISION_TAG: Record<string, string> = {
  通过: 'green',
  拒绝: 'red',
  人工复核: 'amber',
  观察: 'blue',
};

/** 模型状态 → 标签色 */
export const MODEL_STATUS_TAG: Record<string, string> = {
  草稿: 'gray',
  已上线: 'green',
  已下线: 'gray',
  测试中: 'blue',
};

/** 名单类型 → 标签色 */
export const LIST_KIND_TAG: Record<string, string> = {
  黑名单: 'red',
  灰名单: 'amber',
  白名单: 'green',
};

/** 告警级别 → 标签色 */
export const ALERT_LEVEL_TAG: Record<string, string> = {
  紧急: 'red',
  重要: 'amber',
  提示: 'blue',
};

/** 告警状态 → 标签色 */
export const ALERT_STATUS_TAG: Record<string, string> = {
  待处理: 'orange',
  处理中: 'blue',
  已处理: 'green',
  已忽略: 'gray',
};

/** 审批状态 → 标签色 */
export const APPROVAL_STATUS_TAG: Record<string, string> = {
  待审批: 'orange',
  已通过: 'green',
  已驳回: 'red',
  已转交: 'blue',
};

/** 任务状态 → 标签色 */
export const TASK_STATUS_TAG: Record<string, string> = {
  已完成: 'green',
  执行中: 'blue',
  失败: 'red',
  待执行: 'gray',
  排队中: 'gray',
};
