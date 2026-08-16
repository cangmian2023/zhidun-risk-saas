/* 企业风控子系统 · 数据层
 * 持久化复用 /api/load-mid /api/save-mid；首启动 SEED 自动落盘（橘 Sam）。
 * 覆盖业务：尽调任务 / 存量监控名单 / 决策事件（含复核流程）/ 名单管理 / 数据源 / 预警规则 / 企业预警。
 */

import { useSyncExternalStore } from 'react';

/* ---------- 类型 ---------- */

/** 流程操作留痕（P0 合规：谁、何时、做了什么、意见） */
export interface FlowLog {
  at: string;        // 操作时间 YYYY-MM-DD HH:mm:ss
  action: string;    // 操作动作（如 提交复核 / 复核通过 / 驳回）
  operator: string;  // 操作人
  opinion?: string;  // 操作意见（可选）
}

/** 全局操作变更日志（P1：名单/规则/监控/尽调等写操作追溯） */
export interface OpLog {
  at: string;        // 操作时间
  module: string;    // 模块：名单管理 / 预警规则 / 监控名单 / 批量尽调
  type: string;      // 操作类型：新增 / 启停 / 复制 / 暂停 / 恢复 / 自动移除 / 新建任务
  target: string;    // 操作对象（企业名 / 规则名 / 任务名）
  operator: string;  // 操作人
  detail?: string;   // 变更说明
}

export interface DueTask {
  id: string;
  name: string;           // 任务名
  count: number;          // 企业数量
  source: string;         // 来源（上传/接口/手工）
  status: '进行中' | '已完成' | '失败' | '待开始';
  progress: number;       // 进度 0-100
  hitRisk: number;        // 命中风险企业数
  startedAt: string;
  finishedAt?: string;
  createdBy: string;
  flowLogs?: FlowLog[];   // 流程操作留痕
}

export interface MonitorEnt {
  keyNo: string;
  name: string;
  industry: string;
  riskLevel: '高' | '中' | '低';
  monitorSince: string;
  alerts: number;         // 累计预警数
  lastAlert: string;      // 最近预警时间
  status: '监控中' | '已移除' | '已暂停';
  flowLogs?: FlowLog[];   // 监控状态变更留痕
}

export interface DecisionEvent {
  id: string;
  entKeyNo: string;
  entName: string;
  scene: string;          // 决策场景：授信审批 / 尽调结论 / 名单命中 / 预警处置
  score: number;          // 企业分
  scoreModel: string;     // 模型名
  result: '通过' | '拒绝' | '转人工' | '预警';
  level: '高' | '中' | '低';
  status: '已完成' | '待复核' | '复核中';
  decidedAt: string;
  operator: string;
  rules: string[];        // 命中规则
  /* 统一流程绑定（与预警处置工作台同一套架构）：复核流程状态由 f-ent-decision 驱动，状态写回本行 */
  flowKey?: string;
  flowState?: string;
  flowStateAt?: string;
  reviewConclusion?: string;
  flowLogs?: FlowLog[];   // 复核流程操作留痕
}

export interface ListEnt {
  id: string;
  name: string;
  list: 'black' | 'white' | 'gray';
  reason: string;
  source: string;
  addedAt: string;
  operator: string;
  status: '生效' | '失效';
  expireAt?: string;      // 有效期截止（YYYY-MM-DD，空=永久名单）
  autoExpire?: boolean;   // 到期自动移除（临时名单）
  flowLogs?: FlowLog[];   // 名单状态变更留痕
}

export interface EntDataSource {
  id: string;
  name: string;
  category: string;       // 工商 / 司法 / 税务 / 征信 / 舆情 / 关联
  desc: string;
  status: '已接入' | '未接入' | '测试中';
  vendor: string;
  cost?: string;
  updatedAt: string;
}

export interface EntAlertRule {
  id: string;
  name: string;
  category: string;       // 司法涉诉 / 经营异常 / 舆情负面 / 财务恶化 / 关联风险
  condition: string;      // 触发条件
  level: '高' | '中' | '低';
  action: string;         // 处置动作
  enabled: boolean;
}

export interface EntAlert {
  id: string;
  entKeyNo: string;
  entName: string;
  ruleId: string;
  ruleName: string;
  category: string;
  level: 'RED' | 'YELLOW' | 'OPPORTUNITY';
  alert_date: string;
  detail: string;
  status: '待处置' | '核实中' | '已处置' | '误报';
  /* 统一流程绑定（与贷中预警工作台同一套架构）：flowKey 命中的具体流程 + 当前状态 + 进入时间 */
  flowKey?: string;
  flowState?: string;
  flowStateAt?: string;
  flowLogs?: FlowLog[];   // 处置流程操作留痕
}

export interface EntModel {
  id: string;
  name: string;
  range: [number, number];
  color: string;
  score: number;
  desc: string;
  algoType: string;
  version: string;
  enabled: boolean;
  updatedAt: string;
  factors: { name: string; weight: number }[];
  thresholds: { range: string; level: string; meaning: string; action: string }[];
  ops: { coverage: number; accuracy: number; timely: number; calls: number; trend: { month: string; coverage: number; accuracy: number; timely: number; calls: number }[] };
}

export interface EnterpriseData {
  dueTasks: DueTask[];
  monitorList: MonitorEnt[];
  decisionEvents: DecisionEvent[];
  listEnts: ListEnt[];
  dataSources: EntDataSource[];
  alertRules: EntAlertRule[];
  alerts: EntAlert[];
  models: EntModel[];
  opLogs: OpLog[];        // 全局操作变更日志（新在前）
}

/* ---------- SEED ---------- */
export const SEED_ENTERPRISE: EnterpriseData = {
  dueTasks: [
    { id: 'DT-2608-01', name: '8月对公存量客户尽调', count: 126, source: '接口导入', status: '进行中', progress: 68, hitRisk: 9, startedAt: '2026-08-11 09:00', createdBy: '系统管理员', flowLogs: [{ at: '2026-08-11 09:00:00', action: '任务启动', operator: '系统管理员' }] },
    { id: 'DT-2608-02', name: '新准入供应商风险筛查', count: 54, source: '上传名单', status: '已完成', progress: 100, hitRisk: 3, startedAt: '2026-08-09 14:30', finishedAt: '2026-08-10 10:12', createdBy: '张三' },
    { id: 'DT-2608-03', name: '授信到期续约尽调', count: 87, source: '接口导入', status: '待开始', progress: 0, hitRisk: 0, startedAt: '2026-08-12 08:00', createdBy: '李四' },
    { id: 'DT-2607-04', name: '园区重点企业季度复审', count: 32, source: '手工录入', status: '已完成', progress: 100, hitRisk: 4, startedAt: '2026-07-28 09:00', finishedAt: '2026-07-30 16:00', createdBy: '王五' },
    { id: 'DT-2607-05', name: '存量企业批量年检', count: 210, source: '接口导入', status: '失败', progress: 42, hitRisk: 0, startedAt: '2026-07-20 10:00', createdBy: '系统管理员' },
  ],
  monitorList: [
    { keyNo: 'e1', name: '永和食品（中国）股份有限公司', industry: '农副食品加工业', riskLevel: '中', monitorSince: '2025-03-01', alerts: 2, lastAlert: '2026-08-01', status: '监控中' },
    { keyNo: 'e2', name: '杭州云算科技有限公司', industry: '软件和信息技术服务业', riskLevel: '低', monitorSince: '2025-06-15', alerts: 1, lastAlert: '2026-07-20', status: '监控中' },
    { keyNo: 'e3', name: '深圳市锐进供应链有限公司', industry: '商务服务业', riskLevel: '高', monitorSince: '2025-02-10', alerts: 5, lastAlert: '2026-08-08', status: '监控中' },
    { keyNo: 'e4', name: '北京华信智控科技有限公司', industry: '专用设备制造业', riskLevel: '高', monitorSince: '2024-11-01', alerts: 7, lastAlert: '2026-08-06', status: '监控中' },
    { keyNo: 'e5', name: '上海晨光贸易有限公司', industry: '批发业', riskLevel: '中', monitorSince: '2025-09-20', alerts: 3, lastAlert: '2026-07-28', status: '已暂停' },
  ],
  decisionEvents: [
    { id: 'DE-2608-101', entKeyNo: 'e3', entName: '深圳市锐进供应链有限公司', scene: '授信审批', score: 482, scoreModel: '企业违约分', result: '拒绝', level: '高', status: '已完成', decidedAt: '2026-08-08 11:20', operator: '风控系统', rules: ['司法涉诉≥3', '欠税公告命中', '经营异常'], flowKey: 'f-ent-decision', flowState: '已复核', flowStateAt: '2026-08-08 11:20:00' },
    { id: 'DE-2608-102', entKeyNo: 'e1', entName: '永和食品（中国）股份有限公司', scene: '授信审批', score: 762, scoreModel: '企业违约分', result: '通过', level: '低', status: '已完成', decidedAt: '2026-08-02 15:40', operator: '风控系统', rules: ['无重大司法风险', '财务稳健'], flowKey: 'f-ent-decision', flowState: '已复核', flowStateAt: '2026-08-02 15:40:00' },
    { id: 'DE-2608-103', entKeyNo: 'e4', entName: '北京华信智控科技有限公司', scene: '尽调结论', score: 555, scoreModel: '企业欺诈分', result: '转人工', level: '高', status: '待复核', decidedAt: '2026-08-09 09:10', operator: '尽调引擎', rules: ['关联企业风险', '股权冻结'], flowKey: 'f-ent-decision', flowState: '待复核', flowStateAt: '2026-08-09 09:10:00', flowLogs: [{ at: '2026-08-09 09:10:00', action: '系统提交复核', operator: '尽调引擎' }] },
    { id: 'DE-2608-104', entKeyNo: 'e2', entName: '杭州云算科技有限公司', scene: '预警处置', score: 801, scoreModel: '企业违约分', result: '通过', level: '低', status: '已完成', decidedAt: '2026-07-30 10:00', operator: '风控系统', rules: ['高新技术企业', '无经营异常'], flowKey: 'f-ent-decision', flowState: '已复核', flowStateAt: '2026-07-30 10:00:00' },
    { id: 'DE-2608-105', entKeyNo: 'e5', entName: '上海晨光贸易有限公司', scene: '名单命中', score: 610, scoreModel: '企业违约分', result: '预警', level: '中', status: '复核中', decidedAt: '2026-08-05 14:00', operator: '名单引擎', rules: ['灰名单命中', '经营异常'], flowKey: 'f-ent-decision', flowState: '复核中', flowStateAt: '2026-08-05 14:00:00' },
  ],
  listEnts: [
    { id: 'LB-01', name: '广州联诚物流有限公司', list: 'black', reason: '重大司法涉诉 + 空壳特征', source: '尽调命中', addedAt: '2026-07-15', operator: '张三', status: '生效' },
    { id: 'LB-02', name: '上海晨光贸易有限公司', list: 'gray', reason: '经营异常，需持续观察', source: '规则命中', addedAt: '2026-08-01', operator: '李四', status: '生效', expireAt: '2026-08-31', autoExpire: true },
    { id: 'LB-03', name: '杭州云算科技有限公司', list: 'white', reason: '核心优质客户', source: '手工添加', addedAt: '2026-06-20', operator: '王五', status: '生效' },
    { id: 'LB-04', name: '成都明远机械有限公司', list: 'gray', reason: '税务异常待确认', source: '尽调命中', addedAt: '2026-08-03', operator: '张三', status: '生效', expireAt: '2026-08-20', autoExpire: true },
    { id: 'LB-05', name: '北京华信智控科技有限公司', list: 'black', reason: '股权冻结 + 关联风险', source: '模型命中', addedAt: '2026-08-08', operator: '李四', status: '生效' },
  ],
  dataSources: [
    { id: 'ES-01', name: '企业工商数据', category: '工商', desc: '工商注册、股东、主要人员、对外投资、变更记录', status: '已接入', vendor: '工商总局 / 企查查', updatedAt: '2026-08-01' },
    { id: 'ES-02', name: '司法涉诉数据', category: '司法', desc: '裁判文书、立案、开庭、执行、失信被执行人', status: '已接入', vendor: '中国裁判文书网', updatedAt: '2026-08-01' },
    { id: 'ES-03', name: '税务数据', category: '税务', desc: '欠税公告、纳税信用等级、税务异常', status: '已接入', vendor: '税务部门', updatedAt: '2026-07-28' },
    { id: 'ES-04', name: '征信数据', category: '征信', desc: '企业征信报告、信贷记录、授信情况', status: '测试中', vendor: '人行征信', updatedAt: '2026-07-30' },
    { id: 'ES-05', name: '舆情数据', category: '舆情', desc: '新闻舆情、负面报道、社交媒体', status: '已接入', vendor: '舆情监测', updatedAt: '2026-08-05' },
    { id: 'ES-06', name: '关联图谱数据', category: '关联', desc: '股权关联、投资关联、人员关联、担保关联', status: '已接入', vendor: '内部图谱引擎', updatedAt: '2026-08-01' },
    { id: 'ES-07', name: '财务数据', category: '财务', desc: '财报、审计报告、经营数据', status: '未接入', vendor: '—', updatedAt: '2026-08-06' },
  ],
  alertRules: [
    { id: 'ER-01', name: '司法涉诉预警', category: '司法涉诉', condition: '新增诉讼/被执行≥1 或 涉案金额≥500万', level: '高', action: '立即核实，暂停授信', enabled: true },
    { id: 'ER-02', name: '经营异常预警', category: '经营异常', condition: '被列入经营异常名录', level: '高', action: '核实原因，限时整改', enabled: true },
    { id: 'ER-03', name: '舆情负面预警', category: '舆情负面', condition: '出现重大负面舆情', level: '中', action: '舆情研判', enabled: true },
    { id: 'ER-04', name: '财务恶化预警', category: '财务恶化', condition: '资产负债率上升>15% 或 现金流恶化', level: '高', action: '财务尽调，压缩授信', enabled: false },
    { id: 'ER-05', name: '关联风险预警', category: '关联风险', condition: '关联企业出现黑名单/重大风险', level: '中', action: '核查关联关系', enabled: true },
    { id: 'ER-06', name: '欠税预警', category: '税务', condition: '出现欠税公告', level: '中', action: '核实欠税金额', enabled: true },
  ],
  alerts: [
    { id: 'EA-001', entKeyNo: 'e3', entName: '深圳市锐进供应链有限公司', ruleId: 'ER-01', ruleName: '司法涉诉预警', category: '司法涉诉', level: 'RED', alert_date: '2026-08-08 11:20', detail: '新增被执行案件1起，涉案金额 730 万', status: '待处置', flowKey: 'f-ent-alert', flowState: '预警确认中', flowStateAt: '2026-08-08 11:20:00' },
    { id: 'EA-002', entKeyNo: 'e4', entName: '北京华信智控科技有限公司', ruleId: 'ER-01', ruleName: '司法涉诉预警', category: '司法涉诉', level: 'RED', alert_date: '2026-08-06 09:00', detail: '新增股权冻结，关联企业风险上升', status: '核实中', flowKey: 'f-ent-alert', flowState: '风险研判中', flowStateAt: '2026-08-06 09:00:00', flowLogs: [{ at: '2026-08-06 09:00:00', action: '预警确认', operator: '风控系统', opinion: '股权冻结，进入风险研判' }] },
    { id: 'EA-003', entKeyNo: 'e1', entName: '永和食品（中国）股份有限公司', ruleId: 'ER-03', ruleName: '舆情负面预警', category: '舆情负面', level: 'YELLOW', alert_date: '2026-08-01 14:30', detail: '个别负面舆情报道，影响有限', status: '已处置', flowKey: 'f-ent-alert', flowState: '已结案', flowStateAt: '2026-08-02 10:00:00' },
    { id: 'EA-004', entKeyNo: 'e5', entName: '上海晨光贸易有限公司', ruleId: 'ER-02', ruleName: '经营异常预警', category: '经营异常', level: 'RED', alert_date: '2026-07-28 10:00', detail: '被列入经营异常名录（未按期年报）', status: '待处置', flowKey: 'f-ent-alert', flowState: '预警确认中', flowStateAt: '2026-07-28 10:00:00' },
    { id: 'EA-005', entKeyNo: 'e2', entName: '杭州云算科技有限公司', ruleId: 'ER-06', ruleName: '欠税预警', category: '税务', level: 'YELLOW', alert_date: '2026-07-20 09:00', detail: '小额欠税公告，金额 3.2 万', status: '已处置', flowKey: 'f-ent-alert', flowState: '已结案', flowStateAt: '2026-07-21 09:00:00' },
  ],
  models: [
    {
      id: 'ent-credit', name: '企业违约分', range: [300, 900], color: '#ef4444', score: 762,
      desc: '企业信用违约风险模型：结合工商、司法、税务、财务与征信数据评估违约概率',
      algoType: 'XGBoost', version: 'v2.4.1', enabled: true, updatedAt: '2026-08-01',
      factors: [
        { name: '司法涉诉记录', weight: 0.24 },
        { name: '财务健康度', weight: 0.22 },
        { name: '税务信用', weight: 0.18 },
        { name: '经营稳定性', weight: 0.16 },
        { name: '关联风险', weight: 0.12 },
        { name: '舆情负面', weight: 0.08 },
      ],
      thresholds: [
        { range: '300-600', level: '高风险', meaning: '违约概率极高', action: '拒绝授信' },
        { range: '601-750', level: '中风险', meaning: '违约概率较高', action: '审慎授信，加强担保' },
        { range: '751-900', level: '低风险', meaning: '违约概率较低', action: '标准授信' },
      ],
      ops: { coverage: 86, accuracy: 89, timely: 92, calls: 182300, trend: [
        { month: '2026-03', coverage: 82, accuracy: 85, timely: 88, calls: 152000 },
        { month: '2026-04', coverage: 83, accuracy: 86, timely: 89, calls: 158000 },
        { month: '2026-05', coverage: 84, accuracy: 87, timely: 90, calls: 165000 },
        { month: '2026-06', coverage: 85, accuracy: 88, timely: 91, calls: 172000 },
        { month: '2026-07', coverage: 85, accuracy: 88, timely: 92, calls: 178000 },
        { month: '2026-08', coverage: 86, accuracy: 89, timely: 92, calls: 182300 },
      ] },
    },
    {
      id: 'ent-fraud', name: '企业欺诈分', range: [0, 100], color: '#8b5cf6', score: 42,
      desc: '企业欺诈风险模型：识别空壳、关联欺诈、虚假经营等欺诈特征',
      algoType: 'LightGBM', version: 'v3.1.0', enabled: true, updatedAt: '2026-07-20',
      factors: [
        { name: '空壳特征', weight: 0.28 },
        { name: '关联团伙', weight: 0.24 },
        { name: '股东异常', weight: 0.20 },
        { name: '经营真实性', weight: 0.16 },
        { name: '注册异常', weight: 0.12 },
      ],
      thresholds: [
        { range: '0-40', level: '低风险', meaning: '欺诈风险较低', action: '正常处理' },
        { range: '41-70', level: '中风险', meaning: '存在欺诈特征', action: '加强核验' },
        { range: '71-100', level: '高风险', meaning: '高度疑似欺诈', action: '拒绝 + 名单' },
      ],
      ops: { coverage: 78, accuracy: 91, timely: 90, calls: 96500, trend: [
        { month: '2026-03', coverage: 74, accuracy: 88, timely: 87, calls: 82000 },
        { month: '2026-04', coverage: 75, accuracy: 89, timely: 88, calls: 86000 },
        { month: '2026-05', coverage: 76, accuracy: 90, timely: 89, calls: 89000 },
        { month: '2026-06', coverage: 77, accuracy: 90, timely: 89, calls: 92000 },
        { month: '2026-07', coverage: 78, accuracy: 91, timely: 90, calls: 94000 },
        { month: '2026-08', coverage: 78, accuracy: 91, timely: 90, calls: 96500 },
      ] },
    },
    {
      id: 'ent-rel', name: '关联风险分', range: [0, 100], color: '#0ea5e9', score: 61,
      desc: '企业关联风险模型：评估企业所处关联网络的风险传导与集中度',
      algoType: 'GraphSAGE', version: 'v1.3.2', enabled: true, updatedAt: '2026-06-30',
      factors: [
        { name: '关联网络密度', weight: 0.30 },
        { name: '关联企业风险', weight: 0.28 },
        { name: '控股集中度', weight: 0.18 },
        { name: '担保环', weight: 0.14 },
        { name: '投资异常', weight: 0.10 },
      ],
      thresholds: [
        { range: '0-40', level: '低风险', meaning: '关联风险较低', action: '正常处理' },
        { range: '41-70', level: '中风险', meaning: '关联网络存在风险传导', action: '关联尽调' },
        { range: '71-100', level: '高风险', meaning: '处于高风险关联网络', action: '拒绝 + 预警' },
      ],
      ops: { coverage: 72, accuracy: 87, timely: 91, calls: 54300, trend: [
        { month: '2026-03', coverage: 68, accuracy: 84, timely: 88, calls: 46000 },
        { month: '2026-04', coverage: 69, accuracy: 85, timely: 89, calls: 48000 },
        { month: '2026-05', coverage: 70, accuracy: 86, timely: 90, calls: 50000 },
        { month: '2026-06', coverage: 71, accuracy: 86, timely: 90, calls: 52000 },
        { month: '2026-07', coverage: 72, accuracy: 87, timely: 91, calls: 53000 },
        { month: '2026-08', coverage: 72, accuracy: 87, timely: 91, calls: 54300 },
      ] },
    },
  ],
  opLogs: [
    { at: '2026-08-16 10:24:00', module: '名单管理', type: '新增', target: '深圳市锐进供应链有限公司', operator: '当前用户', detail: '加入灰名单（临时名单，到期自动移除）' },
    { at: '2026-08-16 10:20:00', module: '预警规则', type: '启停', target: '财务恶化预警', operator: '当前用户', detail: '停用' },
    { at: '2026-08-16 09:58:00', module: '监控名单', type: '暂停', target: '上海晨光贸易有限公司', operator: '当前用户', detail: '暂停监控' },
    { at: '2026-08-16 09:40:00', module: '批量尽调', type: '新建任务', target: '8月对公存量客户尽调', operator: '当前用户', detail: '接口导入 126 家企业' },
  ],
};

/* ---------- store ---------- */
const FILES = { ent: 'enterpriseData.json' };
let data: EnterpriseData = JSON.parse(JSON.stringify(SEED_ENTERPRISE));
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
  const saved = await loadOne(FILES.ent);
  if (saved && typeof saved === 'object') {
    const s = saved as Partial<EnterpriseData>;
    data = {
      ...JSON.parse(JSON.stringify(SEED_ENTERPRISE)),
      ...(s.dueTasks ? { dueTasks: s.dueTasks } : {}),
      ...(s.monitorList ? { monitorList: s.monitorList } : {}),
      ...(s.decisionEvents ? { decisionEvents: s.decisionEvents } : {}),
      ...(s.listEnts ? { listEnts: s.listEnts } : {}),
      ...(s.dataSources ? { dataSources: s.dataSources } : {}),
      ...(s.alertRules ? { alertRules: s.alertRules } : {}),
      ...(s.alerts ? { alerts: s.alerts } : {}),
      ...(s.models ? { models: s.models } : {}),
      ...(s.opLogs ? { opLogs: s.opLogs } : {}),
    };
  } else {
    saveOne(FILES.ent, data);
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

export function useEnterpriseData(): EnterpriseData { return useSnap(() => data); }
/** 当前时间戳（与 flowStateAt 格式一致 YYYY-MM-DD HH:mm:ss） */
export const nowTime = () => new Date().toISOString().slice(0, 19).replace('T', ' ');
/** 追加一条流程操作日志（自动带时间/操作人；opinion 可选） */
export function appendLog(logs: FlowLog[] | undefined, action: string, operator = '当前用户', opinion?: string): FlowLog[] {
  return [...(logs ?? []), { at: nowTime(), action, operator, ...(opinion ? { opinion } : {}) }];
}
/** 追加一条全局操作变更日志（新在前，最多保留 200 条） */
export function appendOpLog(logs: OpLog[] | undefined, op: Omit<OpLog, 'at' | 'operator'>, operator = '当前用户'): OpLog[] {
  return [{ at: nowTime(), operator, ...op }, ...(logs ?? [])].slice(0, 200);
}
export function useEnterpriseSaveStatus(): 'ok' | 'error' | null {
  useSyncExternalStore(
    (l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; },
    () => saveStatus,
  );
  return saveStatus;
}
export function updateEnterpriseData(fn: (d: EnterpriseData) => EnterpriseData) {
  data = fn(data);
  emit();
  saveOne(FILES.ent, data);
}
export function entNewId(p: string) { return `${p}-${Date.now().toString(36)}`; }
