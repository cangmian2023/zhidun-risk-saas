/* ============================================================
 * 数据看板：配置数据层（v2 · 神策式）
 * ------------------------------------------------------------
 * 设计思路（参考神策等分析平台）：
 *   1. 数据集（Dataset）= 数据来源：每张表有「字段 schema」(维度/度量)
 *      与「行级明细数据」(rows)。内置数据集模拟指标集市 / 数仓宽表；
 *      用户也可在「数据集」Tab 注册 接口(API) / SQL 数据集。
 *   2. 看板组件（DashWidget）= 从某个数据集「选字段、做计算、加筛选、
 *      选图表」得到的可视化单元。组件不再写死数据，而是配置。
 *   3. 渲染时由 buildComputed() 按 维度分组 + 度量聚合 + 筛选 实时算出。
 * ========================================================== */
import type { Column, Row } from '../components/ui'
import type { MenuGroup } from './menus'

/* ---------------- 基础类型 ---------------- */
export type FieldKind = 'dim' | 'measure'
export type FieldType = 'string' | 'number' | 'date'
export type DatasetSource = 'builtin' | 'api' | 'sql'

export interface DatasetField {
  key: string
  label: string
  kind: FieldKind
  type: FieldType
  unit?: string
  /** 维度字段：可选值样例；度量字段：取值区间提示 */
  sample?: string
}

export interface Dataset {
  id: string
  name: string
  source: DatasetSource
  desc?: string
  fields: DatasetField[]
  rows: Record<string, any>[]
  /** source=api 时填写接口地址；source=sql 时填写查询语句 */
  endpoint?: string
}

/* ---------------- 组件（可视化单元）类型 ---------------- */
export type WidgetType = 'metric' | 'line' | 'bar' | 'donut' | 'table'
export type AggFn = 'sum' | 'count' | 'avg' | 'max' | 'min' | 'distinct'
export type FilterOp = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains'

export interface WidgetFilter {
  id: string
  field: string
  op: FilterOp
  value: string
}
export interface WidgetMeasure {
  id: string
  field: string
  agg: AggFn
  alias?: string
}

export interface DashWidget {
  id: string
  type: WidgetType
  title: string
  datasetId: string
  /** 维度字段 key（折线/柱状/环形/数据表 的分组依据；多维度用 / 拼接） */
  dimensions: string[]
  /** 度量字段 + 计算方式 */
  measures: WidgetMeasure[]
  /** 筛选条件（全部 AND） */
  filters: WidgetFilter[]
  sort?: 'asc' | 'desc' | 'none'
  /** 数据表原始明细的最大行数 */
  limit?: number
  /** 1=半宽 2=全宽（指标卡/数据表恒全宽） */
  span?: 1 | 2
}

export interface DashboardPage {
  id: string
  key: string
  name: string
  sub: string
  section: string
  group: string
  order: number
  enabled: boolean
  desc?: string
  builtin?: boolean
  widgets: DashWidget[]
  updatedAt: string
}

/* ---------------- 元信息 ---------------- */
export const WIDGET_META: Record<WidgetType, { label: string; hint: string }> = {
  metric: { label: '指标卡', hint: '把度量聚合为 KPI 数字，可多卡并列' },
  line: { label: '折线图', hint: '按时间/维度看趋势' },
  bar: { label: '柱状图', hint: '按维度对比数值' },
  donut: { label: '环形图', hint: '看结构占比' },
  table: { label: '数据表', hint: '展示原始明细或分组汇总' },
}

export const AGG_META: Record<AggFn, { label: string; short: string }> = {
  sum: { label: '求和', short: '求和' },
  count: { label: '计数(记录数)', short: '计数' },
  avg: { label: '平均值', short: '均值' },
  max: { label: '最大值', short: '最大' },
  min: { label: '最小值', short: '最小' },
  distinct: { label: '去重计数', short: '去重' },
}

export const OP_META: Record<FilterOp, { label: string; needsValue: boolean }> = {
  eq: { label: '等于', needsValue: true },
  neq: { label: '不等于', needsValue: true },
  contains: { label: '包含', needsValue: true },
  in: { label: '属于(逗号分隔)', needsValue: true },
  gt: { label: '大于', needsValue: true },
  gte: { label: '大于等于', needsValue: true },
  lt: { label: '小于', needsValue: true },
  lte: { label: '小于等于', needsValue: true },
}

const PALETTE = ['#3366ff', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16']

let _seq = 1
export const newId = (p: string) => `${p}-${Date.now().toString(36)}-${(_seq++).toString(36)}`

/* ============================================================
 * 内置数据集（行级数据，模拟指标集市）
 * ========================================================== */
const ds_task: Dataset = {
  id: 'ds_task',
  name: '监控任务明细',
  source: 'builtin',
  desc: '贷中监控任务运行明细：覆盖客群、扫描量、触发预警与执行健康度。',
  fields: [
    { key: 'task_id', label: '任务编号', kind: 'dim', type: 'string' },
    { key: 'task_name', label: '任务名称', kind: 'dim', type: 'string' },
    { key: 'product', label: '适用产品', kind: 'dim', type: 'string', sample: '现金贷/消费分期/信用卡代偿/小微经营贷/车主贷/公积金贷/全部产品' },
    { key: 'scene', label: '监控场景', kind: 'dim', type: 'string', sample: '多头借贷/他机构逾期/名单风险/司法风险/失联修复/行为评分/额度异动' },
    { key: 'freq', label: '执行频次', kind: 'dim', type: 'string', sample: '每日/实时/每周/每月' },
    { key: 'status', label: '运行状态', kind: 'dim', type: 'string', sample: '运行中/异常/已暂停' },
    { key: 'owner', label: '负责人', kind: 'dim', type: 'string', sample: '李瑞/周敏/张倩/陈晨/刘阳/赵璐' },
    { key: 'last_run', label: '最近执行', kind: 'dim', type: 'date' },
    { key: 'scan_customers', label: '扫描客户数', kind: 'measure', type: 'number', unit: '万' },
    { key: 'trigger_alerts', label: '触发预警数', kind: 'measure', type: 'number' },
    { key: 'success_rate', label: '执行成功率', kind: 'measure', type: 'number', unit: '%' },
    { key: 'duration_sec', label: '执行时长', kind: 'measure', type: 'number', unit: 's' },
  ],
  rows: [
    { task_id: 'MT-001', task_name: '在贷客户多头监测', product: '现金贷', scene: '多头借贷', freq: '每日', status: '运行中', owner: '李瑞', last_run: '2026-07-29 04:00', scan_customers: 86.2, trigger_alerts: 312, success_rate: 99.8, duration_sec: 182 },
    { task_id: 'MT-002', task_name: '他机构逾期回扫', product: '全部产品', scene: '他机构逾期', freq: '每日', status: '运行中', owner: '周敏', last_run: '2026-07-29 03:30', scan_customers: 234.0, trigger_alerts: 421, success_rate: 99.9, duration_sec: 421 },
    { task_id: 'MT-003', task_name: '高危名单实时碰撞', product: '全部产品', scene: '名单风险', freq: '实时', status: '运行中', owner: '张倩', last_run: '2026-07-29 13:20', scan_customers: 234.0, trigger_alerts: 96, success_rate: 99.5, duration_sec: 12 },
    { task_id: 'MT-004', task_name: '司法涉诉周扫描', product: '小微经营贷', scene: '司法风险', freq: '每周', status: '运行中', owner: '陈晨', last_run: '2026-07-27 02:00', scan_customers: 12.6, trigger_alerts: 58, success_rate: 99.7, duration_sec: 96 },
    { task_id: 'MT-005', task_name: '失联风险识别', product: '消费分期', scene: '失联修复', freq: '每日', status: '异常', owner: '刘阳', last_run: '2026-07-29 05:10', scan_customers: 60.1, trigger_alerts: 137, success_rate: 97.2, duration_sec: 233 },
    { task_id: 'MT-006', task_name: '行为评分月度重估', product: '全部产品', scene: '行为评分', freq: '每月', status: '运行中', owner: '赵璐', last_run: '2026-07-01 01:00', scan_customers: 234.0, trigger_alerts: 188, success_rate: 100, duration_sec: 912 },
    { task_id: 'MT-007', task_name: '额度使用异动监测', product: '信用卡代偿', scene: '额度异动', freq: '每日', status: '已暂停', owner: '李瑞', last_run: '2026-07-29 06:00', scan_customers: 21.1, trigger_alerts: 72, success_rate: 99.4, duration_sec: 141 },
    { task_id: 'MT-008', task_name: '车主贷贷后回访', product: '车主贷', scene: '名单风险', freq: '每周', status: '运行中', owner: '周敏', last_run: '2026-07-26 09:00', scan_customers: 16.9, trigger_alerts: 41, success_rate: 99.6, duration_sec: 88 },
    { task_id: 'MT-009', task_name: '公积金贷稳建监测', product: '公积金贷', scene: '行为评分', freq: '每月', status: '运行中', owner: '张倩', last_run: '2026-07-02 01:00', scan_customers: 23.0, trigger_alerts: 33, success_rate: 100, duration_sec: 120 },
    { task_id: 'MT-010', task_name: '共债预警实时碰撞', product: '全部产品', scene: '多头借贷', freq: '实时', status: '运行中', owner: '陈晨', last_run: '2026-07-29 13:05', scan_customers: 234.0, trigger_alerts: 128, success_rate: 99.3, duration_sec: 14 },
    { task_id: 'MT-011', task_name: '信用卡代偿逾期预警', product: '信用卡代偿', scene: '他机构逾期', freq: '每日', status: '运行中', owner: '刘阳', last_run: '2026-07-29 03:50', scan_customers: 21.1, trigger_alerts: 64, success_rate: 99.7, duration_sec: 165 },
    { task_id: 'MT-012', task_name: '小微贷司法周扫', product: '小微经营贷', scene: '司法风险', freq: '每周', status: '运行中', owner: '赵璐', last_run: '2026-07-27 02:30', scan_customers: 12.6, trigger_alerts: 49, success_rate: 99.6, duration_sec: 102 },
    { task_id: 'MT-013', task_name: '消费分期失联修复', product: '消费分期', scene: '失联修复', freq: '每日', status: '运行中', owner: '李瑞', last_run: '2026-07-29 05:30', scan_customers: 60.1, trigger_alerts: 121, success_rate: 99.5, duration_sec: 198 },
    { task_id: 'MT-014', task_name: '全产品行为分重估', product: '全部产品', scene: '行为评分', freq: '每月', status: '运行中', owner: '周敏', last_run: '2026-07-01 02:00', scan_customers: 234.0, trigger_alerts: 205, success_rate: 100, duration_sec: 1024 },
  ],
}

const ds_alert_daily: Dataset = {
  id: 'ds_alert_daily',
  name: '预警日报(近14日)',
  source: 'builtin',
  desc: '按日汇聚的红/黄/蓝灯预警量，用于趋势分析。',
  fields: [
    { key: 'date', label: '日期', kind: 'dim', type: 'date' },
    { key: 'red_cnt', label: '红灯数', kind: 'measure', type: 'number' },
    { key: 'yellow_cnt', label: '黄灯数', kind: 'measure', type: 'number' },
    { key: 'blue_cnt', label: '蓝灯数', kind: 'measure', type: 'number' },
    { key: 'total_cnt', label: '预警总数', kind: 'measure', type: 'number' },
  ],
  rows: [
    { date: '2026-07-16', red_cnt: 162, yellow_cnt: 820, blue_cnt: 410, total_cnt: 1392 },
    { date: '2026-07-17', red_cnt: 171, yellow_cnt: 861, blue_cnt: 421, total_cnt: 1453 },
    { date: '2026-07-18', red_cnt: 168, yellow_cnt: 843, blue_cnt: 399, total_cnt: 1410 },
    { date: '2026-07-19', red_cnt: 180, yellow_cnt: 902, blue_cnt: 433, total_cnt: 1515 },
    { date: '2026-07-20', red_cnt: 176, yellow_cnt: 887, blue_cnt: 418, total_cnt: 1481 },
    { date: '2026-07-21', red_cnt: 195, yellow_cnt: 941, blue_cnt: 452, total_cnt: 1588 },
    { date: '2026-07-22', red_cnt: 172, yellow_cnt: 872, blue_cnt: 401, total_cnt: 1445 },
    { date: '2026-07-23', red_cnt: 181, yellow_cnt: 897, blue_cnt: 430, total_cnt: 1508 },
    { date: '2026-07-24', red_cnt: 188, yellow_cnt: 932, blue_cnt: 447, total_cnt: 1567 },
    { date: '2026-07-25', red_cnt: 197, yellow_cnt: 968, blue_cnt: 466, total_cnt: 1631 },
    { date: '2026-07-26', red_cnt: 190, yellow_cnt: 943, blue_cnt: 439, total_cnt: 1572 },
    { date: '2026-07-27', red_cnt: 205, yellow_cnt: 1012, blue_cnt: 488, total_cnt: 1705 },
    { date: '2026-07-28', red_cnt: 195, yellow_cnt: 987, blue_cnt: 461, total_cnt: 1643 },
    { date: '2026-07-29', red_cnt: 213, yellow_cnt: 1071, blue_cnt: 503, total_cnt: 1787 },
  ],
}

const ds_alert: Dataset = {
  id: 'ds_alert',
  name: '预警事件明细',
  source: 'builtin',
  desc: '单条预警事件流水：等级、场景、产品、处置建议与处理状态。',
  fields: [
    { key: 'alert_id', label: '预警号', kind: 'dim', type: 'string' },
    { key: 'cust_name', label: '客户', kind: 'dim', type: 'string' },
    { key: 'risk_level', label: '风险等级', kind: 'dim', type: 'string', sample: '红/黄/蓝' },
    { key: 'scene', label: '预警场景', kind: 'dim', type: 'string', sample: '多头借贷激增/他机构逾期/失联风险/司法涉诉/额度使用异动/行为评分下滑' },
    { key: 'product', label: '产品', kind: 'dim', type: 'string' },
    { key: 'suggest_action', label: '处置建议', kind: 'dim', type: 'string', sample: '额度冻结/提前催收/电核提醒/额度下调/持续关注/解除预警' },
    { key: 'alert_date', label: '监测日期', kind: 'dim', type: 'date' },
    { key: 'is_disposed', label: '处置状态', kind: 'dim', type: 'string', sample: '已处置/未处置' },
  ],
  rows: [
    { alert_id: 'AL-0729-0861', cust_name: '王*成', risk_level: '红', scene: '多头借贷激增', product: '现金贷', suggest_action: '额度冻结', alert_date: '2026-07-29', is_disposed: '未处置' },
    { alert_id: 'AL-0729-0837', cust_name: '李*娜', risk_level: '红', scene: '他机构逾期', product: '消费分期', suggest_action: '提前催收', alert_date: '2026-07-29', is_disposed: '未处置' },
    { alert_id: 'AL-0729-0790', cust_name: '张*伟', risk_level: '黄', scene: '额度使用异动', product: '信用卡代偿', suggest_action: '电核提醒', alert_date: '2026-07-29', is_disposed: '未处置' },
    { alert_id: 'AL-0729-0752', cust_name: '刘*洋', risk_level: '黄', scene: '失联风险', product: '现金贷', suggest_action: '电核提醒', alert_date: '2026-07-29', is_disposed: '未处置' },
    { alert_id: 'AL-0729-0713', cust_name: '陈*晨', risk_level: '红', scene: '司法涉诉', product: '小微经营贷', suggest_action: '额度下调', alert_date: '2026-07-29', is_disposed: '未处置' },
    { alert_id: 'AL-0728-1104', cust_name: '赵*璐', risk_level: '黄', scene: '行为评分下滑', product: '消费分期', suggest_action: '持续关注', alert_date: '2026-07-28', is_disposed: '已处置' },
    { alert_id: 'AL-0728-1088', cust_name: '孙*丽', risk_level: '红', scene: '多头借贷激增', product: '现金贷', suggest_action: '额度冻结', alert_date: '2026-07-28', is_disposed: '已处置' },
    { alert_id: 'AL-0728-1061', cust_name: '钱*鹏', risk_level: '红', scene: '他机构逾期', product: '消费分期', suggest_action: '提前催收', alert_date: '2026-07-28', is_disposed: '已处置' },
    { alert_id: 'AL-0728-1022', cust_name: '吴*霞', risk_level: '黄', scene: '额度使用异动', product: '信用卡代偿', suggest_action: '电核提醒', alert_date: '2026-07-28', is_disposed: '已处置' },
    { alert_id: 'AL-0727-0990', cust_name: '郑*凯', risk_level: '红', scene: '司法涉诉', product: '小微经营贷', suggest_action: '额度下调', alert_date: '2026-07-27', is_disposed: '已处置' },
    { alert_id: 'AL-0727-0951', cust_name: '冯*军', risk_level: '黄', scene: '失联风险', product: '现金贷', suggest_action: '电核提醒', alert_date: '2026-07-27', is_disposed: '已处置' },
    { alert_id: 'AL-0727-0918', cust_name: '蒋*敏', risk_level: '黄', scene: '行为评分下滑', product: '消费分期', suggest_action: '持续关注', alert_date: '2026-07-27', is_disposed: '已处置' },
    { alert_id: 'AL-0726-0880', cust_name: '韩*梅', risk_level: '红', scene: '多头借贷激增', product: '现金贷', suggest_action: '额度冻结', alert_date: '2026-07-26', is_disposed: '已处置' },
    { alert_id: 'AL-0726-0842', cust_name: '杨*涛', risk_level: '黄', scene: '他机构逾期', product: '车主贷', suggest_action: '提前催收', alert_date: '2026-07-26', is_disposed: '已处置' },
    { alert_id: 'AL-0726-0809', cust_name: '朱*琳', risk_level: '蓝', scene: '额度使用异动', product: '信用卡代偿', suggest_action: '解除预警', alert_date: '2026-07-26', is_disposed: '已处置' },
    { alert_id: 'AL-0725-0770', cust_name: '秦*峰', risk_level: '红', scene: '司法涉诉', product: '小微经营贷', suggest_action: '额度下调', alert_date: '2026-07-25', is_disposed: '已处置' },
    { alert_id: 'AL-0725-0733', cust_name: '许*静', risk_level: '黄', scene: '行为评分下滑', product: '公积金贷', suggest_action: '持续关注', alert_date: '2026-07-25', is_disposed: '已处置' },
    { alert_id: 'AL-0725-0701', cust_name: '何*龙', risk_level: '蓝', scene: '失联风险', product: '现金贷', suggest_action: '电核提醒', alert_date: '2026-07-25', is_disposed: '已处置' },
    { alert_id: 'AL-0724-0660', cust_name: '吕*芳', risk_level: '红', scene: '多头借贷激增', product: '现金贷', suggest_action: '额度冻结', alert_date: '2026-07-24', is_disposed: '已处置' },
    { alert_id: 'AL-0724-0628', cust_name: '施*宇', risk_level: '黄', scene: '他机构逾期', product: '消费分期', suggest_action: '提前催收', alert_date: '2026-07-24', is_disposed: '已处置' },
    { alert_id: 'AL-0723-0590', cust_name: '孔*杰', risk_level: '红', scene: '司法涉诉', product: '小微经营贷', suggest_action: '额度下调', alert_date: '2026-07-23', is_disposed: '已处置' },
    { alert_id: 'AL-0723-0551', cust_name: '曹*悦', risk_level: '黄', scene: '额度使用异动', product: '信用卡代偿', suggest_action: '电核提醒', alert_date: '2026-07-23', is_disposed: '已处置' },
    { alert_id: 'AL-0722-0512', cust_name: '严*斌', risk_level: '黄', scene: '行为评分下滑', product: '公积金贷', suggest_action: '持续关注', alert_date: '2026-07-22', is_disposed: '已处置' },
    { alert_id: 'AL-0722-0480', cust_name: '华*雯', risk_level: '蓝', scene: '失联风险', product: '车主贷', suggest_action: '电核提醒', alert_date: '2026-07-22', is_disposed: '已处置' },
  ],
}

const ds_segment: Dataset = {
  id: 'ds_segment',
  name: '客群风险明细',
  source: 'builtin',
  desc: '各在贷客群的风险结构：客户数、在贷余额、行为分、逾期率与迁徙。',
  fields: [
    { key: 'segment_id', label: '客群编号', kind: 'dim', type: 'string' },
    { key: 'segment_name', label: '客群名称', kind: 'dim', type: 'string' },
    { key: 'product', label: '产品', kind: 'dim', type: 'string' },
    { key: 'cust_count', label: '客户数', kind: 'measure', type: 'number', unit: '万' },
    { key: 'balance', label: '在贷余额', kind: 'measure', type: 'number', unit: '亿' },
    { key: 'avg_score', label: '平均行为分', kind: 'measure', type: 'number' },
    { key: 'overdue_rate', label: '逾期率', kind: 'measure', type: 'number', unit: '%' },
    { key: 'high_ratio', label: '高风险占比', kind: 'measure', type: 'number', unit: '%' },
    { key: 'migration_rate', label: '月上迁率', kind: 'measure', type: 'number', unit: '%' },
  ],
  rows: [
    { segment_id: 'CG-001', segment_name: '现金贷-在贷客群', product: '现金贷', cust_count: 47.2, balance: 86.4, avg_score: 655, overdue_rate: 3.8, high_ratio: 4.7, migration_rate: 2.4 },
    { segment_id: 'CG-002', segment_name: '消费分期-在贷客群', product: '消费分期', cust_count: 60.1, balance: 132.7, avg_score: 681, overdue_rate: 2.1, high_ratio: 3.0, migration_rate: 1.8 },
    { segment_id: 'CG-003', segment_name: '信用卡代偿-在贷客群', product: '信用卡代偿', cust_count: 21.1, balance: 38.2, avg_score: 668, overdue_rate: 4.4, high_ratio: 5.2, migration_rate: 2.6 },
    { segment_id: 'CG-004', segment_name: '小微经营贷-在贷客群', product: '小微经营贷', cust_count: 13.0, balance: 96.5, avg_score: 692, overdue_rate: 5.1, high_ratio: 6.9, migration_rate: 2.9 },
    { segment_id: 'CG-005', segment_name: '车主贷-在贷客群', product: '车主贷', cust_count: 16.9, balance: 71.3, avg_score: 701, overdue_rate: 1.6, high_ratio: 3.6, migration_rate: 1.2 },
    { segment_id: 'CG-006', segment_name: '公积金贷-在贷客群', product: '公积金贷', cust_count: 23.0, balance: 64.8, avg_score: 726, overdue_rate: 0.9, high_ratio: 1.7, migration_rate: 0.8 },
    { segment_id: 'CG-007', segment_name: '现金贷-新客(≤3月)', product: '现金贷', cust_count: 9.4, balance: 14.2, avg_score: 632, overdue_rate: 5.7, high_ratio: 7.1, migration_rate: 3.5 },
    { segment_id: 'CG-008', segment_name: '消费分期-高件均', product: '消费分期', cust_count: 12.3, balance: 41.6, avg_score: 690, overdue_rate: 1.8, high_ratio: 2.4, migration_rate: 1.1 },
  ],
}

const ds_risk_band: Dataset = {
  id: 'ds_risk_band',
  name: '客群风险等级分布',
  source: 'builtin',
  desc: '在贷客户按风险等级的户数结构。',
  fields: [
    { key: 'band', label: '风险等级', kind: 'dim', type: 'string', sample: '低风险/中低风险/中风险/高风险' },
    { key: 'cust_count', label: '客户数', kind: 'measure', type: 'number', unit: '万' },
  ],
  rows: [
    { band: '低风险', cust_count: 151.2 },
    { band: '中低风险', cust_count: 48.6 },
    { band: '中风险', cust_count: 23.1 },
    { band: '高风险', cust_count: 11.0 },
  ],
}

const ds_behavior: Dataset = {
  id: 'ds_behavior',
  name: '单客行为明细',
  source: 'builtin',
  desc: '示例客户行为评分与风险信号月度观测（含客群均值对比）。',
  fields: [
    { key: 'cust_id', label: '客户号', kind: 'dim', type: 'string' },
    { key: 'cust_name', label: '客户', kind: 'dim', type: 'string' },
    { key: 'obs_month', label: '观测月份', kind: 'dim', type: 'date' },
    { key: 'behavior_score', label: '行为评分', kind: 'measure', type: 'number' },
    { key: 'cohort_avg', label: '客群均值', kind: 'measure', type: 'number' },
    { key: 'query_30d', label: '近30日查询次数', kind: 'measure', type: 'number' },
    { key: 'other_overdue', label: '他机构逾期笔数', kind: 'measure', type: 'number' },
    { key: 'spend_mom', label: '消费金额环比', kind: 'measure', type: 'number', unit: '%' },
    { key: 'risk_events', label: '风险事件数', kind: 'measure', type: 'number' },
  ],
  rows: [
    { cust_id: 'C-1001', cust_name: '王*成', obs_month: '2026-02', behavior_score: 688, cohort_avg: 676, query_30d: 3, other_overdue: 0, spend_mom: 4, risk_events: 0 },
    { cust_id: 'C-1001', cust_name: '王*成', obs_month: '2026-03', behavior_score: 672, cohort_avg: 678, query_30d: 4, other_overdue: 0, spend_mom: 2, risk_events: 1 },
    { cust_id: 'C-1001', cust_name: '王*成', obs_month: '2026-04', behavior_score: 665, cohort_avg: 674, query_30d: 5, other_overdue: 1, spend_mom: -3, risk_events: 1 },
    { cust_id: 'C-1001', cust_name: '王*成', obs_month: '2026-05', behavior_score: 641, cohort_avg: 675, query_30d: 6, other_overdue: 1, spend_mom: -6, risk_events: 2 },
    { cust_id: 'C-1001', cust_name: '王*成', obs_month: '2026-06', behavior_score: 612, cohort_avg: 673, query_30d: 7, other_overdue: 2, spend_mom: -9, risk_events: 2 },
    { cust_id: 'C-1001', cust_name: '王*成', obs_month: '2026-07', behavior_score: 588, cohort_avg: 672, query_30d: 8, other_overdue: 2, spend_mom: -12, risk_events: 3 },
    { cust_id: 'C-1002', cust_name: '李*娜', obs_month: '2026-02', behavior_score: 701, cohort_avg: 681, query_30d: 2, other_overdue: 0, spend_mom: 3, risk_events: 0 },
    { cust_id: 'C-1002', cust_name: '李*娜', obs_month: '2026-03', behavior_score: 698, cohort_avg: 681, query_30d: 3, other_overdue: 0, spend_mom: 1, risk_events: 0 },
    { cust_id: 'C-1002', cust_name: '李*娜', obs_month: '2026-04', behavior_score: 690, cohort_avg: 680, query_30d: 4, other_overdue: 1, spend_mom: -2, risk_events: 1 },
    { cust_id: 'C-1002', cust_name: '李*娜', obs_month: '2026-05', behavior_score: 677, cohort_avg: 679, query_30d: 5, other_overdue: 1, spend_mom: -4, risk_events: 1 },
    { cust_id: 'C-1002', cust_name: '李*娜', obs_month: '2026-06', behavior_score: 661, cohort_avg: 677, query_30d: 6, other_overdue: 2, spend_mom: -7, risk_events: 2 },
    { cust_id: 'C-1002', cust_name: '李*娜', obs_month: '2026-07', behavior_score: 644, cohort_avg: 676, query_30d: 7, other_overdue: 2, spend_mom: -10, risk_events: 2 },
    { cust_id: 'C-1003', cust_name: '赵*璐', obs_month: '2026-02', behavior_score: 722, cohort_avg: 726, query_30d: 1, other_overdue: 0, spend_mom: 2, risk_events: 0 },
    { cust_id: 'C-1003', cust_name: '赵*璐', obs_month: '2026-03', behavior_score: 719, cohort_avg: 726, query_30d: 1, other_overdue: 0, spend_mom: 1, risk_events: 0 },
    { cust_id: 'C-1003', cust_name: '赵*璐', obs_month: '2026-04', behavior_score: 724, cohort_avg: 726, query_30d: 2, other_overdue: 0, spend_mom: 3, risk_events: 0 },
    { cust_id: 'C-1003', cust_name: '赵*璐', obs_month: '2026-05', behavior_score: 718, cohort_avg: 725, query_30d: 2, other_overdue: 0, spend_mom: 0, risk_events: 0 },
    { cust_id: 'C-1003', cust_name: '赵*璐', obs_month: '2026-06', behavior_score: 721, cohort_avg: 725, query_30d: 2, other_overdue: 0, spend_mom: 2, risk_events: 0 },
    { cust_id: 'C-1003', cust_name: '赵*璐', obs_month: '2026-07', behavior_score: 717, cohort_avg: 724, query_30d: 3, other_overdue: 0, spend_mom: -1, risk_events: 1 },
  ],
}

const ds_migration_trend: Dataset = {
  id: 'ds_migration_trend',
  name: '风险迁徙趋势(近6月)',
  source: 'builtin',
  desc: '客群每月风险上迁(变差)与下迁(转好)的客户数。',
  fields: [
    { key: 'month', label: '月份', kind: 'dim', type: 'date' },
    { key: 'up_migrate', label: '上迁客户数', kind: 'measure', type: 'number', unit: '百' },
    { key: 'down_migrate', label: '下迁客户数', kind: 'measure', type: 'number', unit: '百' },
  ],
  rows: [
    { month: '2026-02', up_migrate: 4.12, down_migrate: 3.88 },
    { month: '2026-03', up_migrate: 4.38, down_migrate: 4.02 },
    { month: '2026-04', up_migrate: 4.65, down_migrate: 3.91 },
    { month: '2026-05', up_migrate: 4.47, down_migrate: 4.20 },
    { month: '2026-06', up_migrate: 4.92, down_migrate: 4.31 },
    { month: '2026-07', up_migrate: 4.86, down_migrate: 4.55 },
  ],
}

const ds_migration_matrix: Dataset = {
  id: 'ds_migration_matrix',
  name: '风险等级迁徙矩阵(月)',
  source: 'builtin',
  desc: '期初风险等级到本期的分布与留存率。',
  fields: [
    { key: 'from_band', label: '期初等级', kind: 'dim', type: 'string' },
    { key: 'to_low', label: '流向低风险', kind: 'measure', type: 'number', unit: '%' },
    { key: 'to_mid', label: '流向中风险', kind: 'measure', type: 'number', unit: '%' },
    { key: 'to_high', label: '流向高风险', kind: 'measure', type: 'number', unit: '%' },
    { key: 'stay_rate', label: '留存率', kind: 'measure', type: 'number', unit: '%' },
  ],
  rows: [
    { from_band: '低风险', to_low: 96.6, to_mid: 2.8, to_high: 0.6, stay_rate: 96.6 },
    { from_band: '中风险', to_low: 18.2, to_mid: 74.5, to_high: 7.3, stay_rate: 74.5 },
    { from_band: '高风险', to_low: 3.1, to_mid: 16.8, to_high: 80.1, stay_rate: 80.1 },
  ],
}

const ds_dispose_task: Dataset = {
  id: 'ds_dispose_task',
  name: '处置任务明细',
  source: 'builtin',
  desc: '预警处置工作台任务流水：等级、场景、建议动作、处理人与状态。',
  fields: [
    { key: 'task_id', label: '任务编号', kind: 'dim', type: 'string' },
    { key: 'cust_name', label: '客户', kind: 'dim', type: 'string' },
    { key: 'risk_level', label: '预警等级', kind: 'dim', type: 'string', sample: '红/黄' },
    { key: 'scene', label: '预警场景', kind: 'dim', type: 'string' },
    { key: 'suggest_action', label: '建议动作', kind: 'dim', type: 'string', sample: '额度冻结/提前催收/电核提醒/额度下调/持续关注' },
    { key: 'owner', label: '处理人', kind: 'dim', type: 'string', sample: '李瑞/周敏/张倩/陈晨/刘阳/赵璐' },
    { key: 'status', label: '处置状态', kind: 'dim', type: 'string', sample: '处理中/待领取/已超时/已完成' },
    { key: 'create_date', label: '创建日期', kind: 'dim', type: 'date' },
    { key: 'duration_h', label: '处置时长', kind: 'measure', type: 'number', unit: 'h' },
  ],
  rows: [
    { task_id: 'DP-118', cust_name: '王*成', risk_level: '红', scene: '多头借贷激增', suggest_action: '额度冻结', owner: '李瑞', status: '处理中', create_date: '2026-07-29', duration_h: 2.1 },
    { task_id: 'DP-117', cust_name: '李*娜', risk_level: '红', scene: '他机构逾期', suggest_action: '提前催收', owner: '周敏', status: '待领取', create_date: '2026-07-29', duration_h: 0 },
    { task_id: 'DP-116', cust_name: '陈*晨', risk_level: '红', scene: '司法涉诉', suggest_action: '额度下调', owner: '张倩', status: '处理中', create_date: '2026-07-29', duration_h: 3.4 },
    { task_id: 'DP-115', cust_name: '刘*洋', risk_level: '黄', scene: '失联风险', suggest_action: '电核提醒', owner: '刘阳', status: '已超时', create_date: '2026-07-28', duration_h: 26 },
    { task_id: 'DP-114', cust_name: '赵*璐', risk_level: '黄', scene: '行为评分下滑', suggest_action: '持续关注', owner: '赵璐', status: '待领取', create_date: '2026-07-28', duration_h: 0 },
    { task_id: 'DP-113', cust_name: '孙*丽', risk_level: '红', scene: '多头借贷激增', suggest_action: '额度冻结', owner: '李瑞', status: '已完成', create_date: '2026-07-29', duration_h: 1.5 },
    { task_id: 'DP-112', cust_name: '钱*鹏', risk_level: '红', scene: '他机构逾期', suggest_action: '提前催收', owner: '周敏', status: '已完成', create_date: '2026-07-29', duration_h: 2.8 },
    { task_id: 'DP-111', cust_name: '吴*霞', risk_level: '黄', scene: '额度使用异动', suggest_action: '电核提醒', owner: '张倩', status: '已完成', create_date: '2026-07-28', duration_h: 1.2 },
    { task_id: 'DP-110', cust_name: '郑*凯', risk_level: '红', scene: '司法涉诉', suggest_action: '额度下调', owner: '陈晨', status: '已完成', create_date: '2026-07-28', duration_h: 4.1 },
    { task_id: 'DP-109', cust_name: '冯*军', risk_level: '黄', scene: '失联风险', suggest_action: '电核提醒', owner: '刘阳', status: '已完成', create_date: '2026-07-28', duration_h: 0.8 },
    { task_id: 'DP-108', cust_name: '蒋*敏', risk_level: '黄', scene: '行为评分下滑', suggest_action: '持续关注', owner: '赵璐', status: '已完成', create_date: '2026-07-27', duration_h: 1.0 },
    { task_id: 'DP-107', cust_name: '韩*梅', risk_level: '红', scene: '多头借贷激增', suggest_action: '额度冻结', owner: '李瑞', status: '已完成', create_date: '2026-07-27', duration_h: 2.0 },
    { task_id: 'DP-106', cust_name: '杨*涛', risk_level: '黄', scene: '他机构逾期', suggest_action: '提前催收', owner: '周敏', status: '已完成', create_date: '2026-07-27', duration_h: 3.2 },
    { task_id: 'DP-105', cust_name: '朱*琳', risk_level: '蓝', scene: '额度使用异动', suggest_action: '解除预警', owner: '张倩', status: '已完成', create_date: '2026-07-27', duration_h: 0.5 },
    { task_id: 'DP-104', cust_name: '秦*峰', risk_level: '红', scene: '司法涉诉', suggest_action: '额度下调', owner: '陈晨', status: '已完成', create_date: '2026-07-26', duration_h: 5.0 },
    { task_id: 'DP-103', cust_name: '许*静', risk_level: '黄', scene: '行为评分下滑', suggest_action: '持续关注', owner: '赵璐', status: '已完成', create_date: '2026-07-26', duration_h: 1.1 },
    { task_id: 'DP-102', cust_name: '何*龙', risk_level: '蓝', scene: '失联风险', suggest_action: '电核提醒', owner: '刘阳', status: '已完成', create_date: '2026-07-26', duration_h: 0.7 },
    { task_id: 'DP-101', cust_name: '吕*芳', risk_level: '红', scene: '多头借贷激增', suggest_action: '额度冻结', owner: '李瑞', status: '已完成', create_date: '2026-07-25', duration_h: 2.3 },
    { task_id: 'DP-100', cust_name: '施*宇', risk_level: '黄', scene: '他机构逾期', suggest_action: '提前催收', owner: '周敏', status: '已完成', create_date: '2026-07-25', duration_h: 3.0 },
    { task_id: 'DP-099', cust_name: '孔*杰', risk_level: '红', scene: '司法涉诉', suggest_action: '额度下调', owner: '陈晨', status: '已完成', create_date: '2026-07-24', duration_h: 4.6 },
    { task_id: 'DP-098', cust_name: '严*斌', risk_level: '黄', scene: '行为评分下滑', suggest_action: '持续关注', owner: '赵璐', status: '已完成', create_date: '2026-07-24', duration_h: 1.4 },
    { task_id: 'DP-097', cust_name: '华*雯', risk_level: '蓝', scene: '失联风险', suggest_action: '电核提醒', owner: '刘阳', status: '已完成', create_date: '2026-07-23', duration_h: 0.6 },
    { task_id: 'DP-096', cust_name: '王*强', risk_level: '红', scene: '多头借贷激增', suggest_action: '额度冻结', owner: '李瑞', status: '已完成', create_date: '2026-07-23', duration_h: 2.2 },
    { task_id: 'DP-095', cust_name: '李*梅', risk_level: '黄', scene: '额度使用异动', suggest_action: '电核提醒', owner: '张倩', status: '已完成', create_date: '2026-07-22', duration_h: 1.0 },
    { task_id: 'DP-094', cust_name: '张*军', risk_level: '红', scene: '司法涉诉', suggest_action: '额度下调', owner: '陈晨', status: '已完成', create_date: '2026-07-22', duration_h: 4.4 },
    { task_id: 'DP-093', cust_name: '刘*燕', risk_level: '黄', scene: '他机构逾期', suggest_action: '提前催收', owner: '周敏', status: '已完成', create_date: '2026-07-21', duration_h: 3.3 },
    { task_id: 'DP-092', cust_name: '陈*东', risk_level: '蓝', scene: '失联风险', suggest_action: '电核提醒', owner: '刘阳', status: '已完成', create_date: '2026-07-21', duration_h: 0.7 },
    { task_id: 'DP-091', cust_name: '杨*丽', risk_level: '红', scene: '多头借贷激增', suggest_action: '额度冻结', owner: '李瑞', status: '已完成', create_date: '2026-07-20', duration_h: 2.5 },
    { task_id: 'DP-090', cust_name: '黄*波', risk_level: '黄', scene: '行为评分下滑', suggest_action: '持续关注', owner: '赵璐', status: '已完成', create_date: '2026-07-20', duration_h: 1.2 },
  ],
}

const ds_dispose_result: Dataset = {
  id: 'ds_dispose_result',
  name: '处置效果明细',
  source: 'builtin',
  desc: '各处置动作本月的效果评估：笔数、回收金额、时长与有效率。',
  fields: [
    { key: 'action', label: '处置动作', kind: 'dim', type: 'string', sample: '电核提醒/额度冻结/额度下调/提前催收/解除预警' },
    { key: 'dispose_cnt', label: '处置笔数', kind: 'measure', type: 'number' },
    { key: 'success_amt', label: '成功回收金额', kind: 'measure', type: 'number', unit: '万' },
    { key: 'avg_duration', label: '平均处置时长', kind: 'measure', type: 'number', unit: 'h' },
    { key: 'recovery_rate', label: '回款率', kind: 'measure', type: 'number', unit: '%' },
    { key: 'effective_rate', label: '有效率', kind: 'measure', type: 'number', unit: '%' },
  ],
  rows: [
    { action: '电核提醒', dispose_cnt: 2214, success_amt: 320.5, avg_duration: 1.1, recovery_rate: 41.2, effective_rate: 78.4 },
    { action: '额度冻结', dispose_cnt: 1436, success_amt: 580.2, avg_duration: 2.4, recovery_rate: 63.5, effective_rate: 88.1 },
    { action: '额度下调', dispose_cnt: 1108, success_amt: 412.7, avg_duration: 4.2, recovery_rate: 55.8, effective_rate: 84.6 },
    { action: '提前催收', dispose_cnt: 682, success_amt: 296.9, avg_duration: 3.1, recovery_rate: 58.3, effective_rate: 86.2 },
    { action: '解除预警', dispose_cnt: 432, success_amt: 0, avg_duration: 0.6, recovery_rate: 0, effective_rate: 71.0 },
  ],
}

export const BUILTIN_DATASETS: Dataset[] = [
  ds_task, ds_alert_daily, ds_alert, ds_segment, ds_risk_band,
  ds_behavior, ds_migration_trend, ds_migration_matrix, ds_dispose_task, ds_dispose_result,
]

export const datasetById = (id: string, all?: Dataset[]): Dataset | undefined =>
  (all ?? BUILTIN_DATASETS).find((d) => d.id === id)

/* ============================================================
 * 计算引擎：把「组件配置」算成「图表数据」
 * ========================================================== */
export interface ComputedMetric { label: string; value: string; hint?: string }
export interface WidgetComputed {
  metric: ComputedMetric[]
  categories: string[]
  series: { name: string; data: number[]; color: string }[]
  donut: { label: string; value: number; color: string }[]
  tableColumns: Column[]
  tableRows: Row[]
  hasData: boolean
}

const num = (v: any): number | null => {
  if (typeof v === 'number') return v
  if (typeof v === 'string' && v.trim() !== '' && !isNaN(Number(v))) return Number(v)
  return null
}
const round = (n: number) => Math.round(n)
const round1 = (n: number) => Math.round(n * 10) / 10
const fmtAgg = (v: number, m: WidgetMeasure, ds: Dataset): string => {
  const f = ds.fields.find((x) => x.key === m.field)
  const unit = f?.unit ?? ''
  if (m.agg === 'count' || m.agg === 'distinct') return `${round(v).toLocaleString('en-US')}${unit}`
  if (m.agg === 'avg') return `${round1(v).toLocaleString('en-US')}${unit}`
  return `${round(v).toLocaleString('en-US')}${unit}`
}

export function measureLabel(ds: Dataset, m: WidgetMeasure): string {
  if (m.alias) return m.alias
  const f = ds.fields.find((x) => x.key === m.field)
  if (!f) return m.field
  if (m.agg === 'count') return '记录数'
  if (m.agg === 'distinct') return `${f.label}去重`
  return `${f.label}·${AGG_META[m.agg].short}`
}

function applyFilters(rows: Record<string, any>[], filters: WidgetFilter[]): Record<string, any>[] {
  if (!filters.length) return rows
  return rows.filter((row) =>
    filters.every((f) => {
      if (!f.field || f.value === undefined || f.value === '') return true
      const cv = String(row[f.field] ?? '')
      const tv = f.value
      switch (f.op) {
        case 'eq': return cv === tv
        case 'neq': return cv !== tv
        case 'contains': return cv.includes(tv)
        case 'in': return tv.split(/[,，]/).map((s) => s.trim()).includes(cv)
        case 'gt': { const n = num(row[f.field]); return n !== null && n > Number(tv) }
        case 'gte': { const n = num(row[f.field]); return n !== null && n >= Number(tv) }
        case 'lt': { const n = num(row[f.field]); return n !== null && n < Number(tv) }
        case 'lte': { const n = num(row[f.field]); return n !== null && n <= Number(tv) }
      }
      return true
    }),
  )
}

function aggregate(rows: Record<string, any>[], measures: WidgetMeasure[]): number[] {
  return measures.map((m) => {
    if (m.agg === 'count') return rows.length
    if (m.agg === 'distinct') return new Set(rows.map((r) => String(r[m.field] ?? ''))).size
    const vals = rows.map((r) => num(r[m.field])).filter((v) => v !== null) as number[]
    if (!vals.length) return 0
    switch (m.agg) {
      case 'sum': return vals.reduce((a, b) => a + b, 0)
      case 'avg': return vals.reduce((a, b) => a + b, 0) / vals.length
      case 'max': return Math.max(...vals)
      case 'min': return Math.min(...vals)
    }
    return 0
  })
}

function groupRows(rows: Record<string, any>[], dims: string[]): { key: string; rows: any[] }[] {
  const map = new Map<string, any[]>()
  for (const r of rows) {
    const k = dims.map((d) => String(r[d] ?? '—')).join(' / ')
    if (!map.has(k)) map.set(k, [])
    map.get(k)!.push(r)
  }
  return Array.from(map, ([key, rs]) => ({ key, rows: rs }))
}

export function buildComputed(ds: Dataset, w: DashWidget): WidgetComputed {
  const empty = (): WidgetComputed => ({ metric: [], categories: [], series: [], donut: [], tableColumns: [], tableRows: [], hasData: false })
  const rows = applyFilters(ds.rows, w.filters)
  if (!rows.length) return empty()

  const measures = w.measures
  const dims = w.dimensions

  /* ---------- 数据表 ---------- */
  if (w.type === 'table') {
    if (dims.length === 0) {
      const cols: Column[] = ds.fields.map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type === 'number' ? 'number' : f.type === 'date' ? 'datetime' : 'text',
        align: f.type === 'number' ? 'right' : 'left',
      }))
      const trows: Row[] = rows.slice(0, w.limit ?? 50).map((r, i) => ({ id: String(r.id ?? i), ...r }))
      return { ...empty(), tableColumns: cols, tableRows: trows, hasData: true }
    }
    const grouped = groupRows(rows, dims)
    const data = grouped.map((g) => ({ key: g.key, aggs: aggregate(g.rows, measures) }))
    const dimLabels = dims.map((d) => ds.fields.find((f) => f.key === d)?.label ?? d)
    const cols: Column[] = [
      ...dims.map((_d, i) => ({ key: `d${i}`, label: dimLabels[i] })),
      ...measures.map((m) => ({ key: m.id, label: measureLabel(ds, m), align: 'right' as const, type: 'number' as const })),
    ]
    const trows: Row[] = data.map((d, i) => ({
      id: String(i),
      ...Object.fromEntries(dims.map((_, idx) => [`d${idx}`, d.key.split(' / ')[idx]])),
      ...Object.fromEntries(measures.map((m, mi) => [m.id, round(d.aggs[mi])])),
    }))
    return { ...empty(), tableColumns: cols, tableRows: trows, hasData: true }
  }

  /* ---------- 指标卡 ---------- */
  if (w.type === 'metric') {
    if (dims.length === 0) {
      const metric = measures.map((m) => ({
        label: measureLabel(ds, m),
        value: fmtAgg(aggregate(rows, [m])[0], m, ds),
        hint: m.agg === 'avg' ? '区间均值' : m.agg === 'count' ? '满足条件的记录数' : undefined,
      }))
      return { ...empty(), metric, hasData: true }
    }
    const grouped = groupRows(rows, dims)
    const metric = grouped.map((g) => ({
      label: g.key,
      value: measures.length ? fmtAgg(aggregate(g.rows, [measures[0]])[0], measures[0], ds) : String(g.rows.length),
      hint: undefined,
    }))
    return { ...empty(), metric, hasData: true }
  }

  /* ---------- 折线 / 柱状 / 环形：按 dimensions[0] 分组聚合 ---------- */
  const dim = dims[0] ?? ds.fields.find((f) => f.kind === 'dim')?.key
  if (!dim || !measures.length) return empty()
  const grouped = groupRows(rows, [dim])
  let entries = grouped.map((g) => ({ cat: g.key, aggs: aggregate(g.rows, measures) }))
  const isDate = ds.fields.find((f) => f.key === dim)?.type === 'date'
  if (w.type === 'line') {
    if (isDate) entries.sort((a, b) => (a.cat < b.cat ? -1 : 1))
    else entries.sort((a, b) => a.cat.localeCompare(b.cat))
  } else {
    // 柱状 / 环形：按首个度量降序，读图更直观
    entries.sort((a, b) => b.aggs[0] - a.aggs[0])
  }
  const cats = entries.map((e) => e.cat)

  if (w.type === 'donut') {
    const donut = entries.map((e, i) => ({ label: e.cat, value: round(e.aggs[0]), color: PALETTE[i % PALETTE.length] }))
    return { ...empty(), donut, hasData: true }
  }

  const series = measures.map((m, mi) => ({
    name: measureLabel(ds, m),
    color: PALETTE[mi % PALETTE.length],
    data: entries.map((e) => round(e.aggs[mi])),
  }))
  return { ...empty(), categories: cats, series, hasData: true }
}

/* ============================================================
 * 默认看板（贷中监控 7 个页面，全部由组件配置驱动）
 * ========================================================== */
const NOW = '2026-07-29 13:30'
const m = (field: string, agg: AggFn, alias?: string): WidgetMeasure => ({ id: newId('m'), field, agg, alias })
const f = (field: string, op: FilterOp, value: string): WidgetFilter => ({ id: newId('f'), field, op, value })

export const DEFAULT_DASHBOARDS: DashboardPage[] = [
  {
    id: 'db-mid-task', key: 'cr:mid-task', name: '监控任务看板', sub: 'cr', section: '贷中监控', group: '监控任务看板', order: 1, enabled: true, builtin: true,
    desc: '贷中监控任务运行总览：任务规模、扫描覆盖、预警产出与执行健康度。',
    widgets: [
      { id: 'w1', type: 'metric', title: '核心指标', datasetId: 'ds_task', dimensions: [], measures: [m('task_id', 'count', '监控任务总数'), m('scan_customers', 'sum', '累计扫描客户(万)'), m('success_rate', 'avg', '平均执行成功率'), m('trigger_alerts', 'sum', '触发预警总数')], filters: [], span: 2 },
      { id: 'w2', type: 'bar', title: '各产品扫描客户数', datasetId: 'ds_task', dimensions: ['product'], measures: [m('scan_customers', 'sum')], filters: [], span: 1 },
      { id: 'w3', type: 'donut', title: '任务运行状态分布', datasetId: 'ds_task', dimensions: ['status'], measures: [m('task_id', 'count')], filters: [], span: 1 },
      { id: 'w4', type: 'bar', title: '按监控场景触发预警', datasetId: 'ds_task', dimensions: ['scene'], measures: [m('trigger_alerts', 'sum')], filters: [], span: 1 },
      { id: 'w5', type: 'bar', title: '各负责人扫描贡献(万)', datasetId: 'ds_task', dimensions: ['owner'], measures: [m('scan_customers', 'sum')], filters: [], span: 1 },
      { id: 'w6', type: 'table', title: '监控任务明细', datasetId: 'ds_task', dimensions: [], measures: [], filters: [], limit: 14, span: 2 },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-alert', key: 'cr:mid-alert', name: '红黄灯预警', sub: 'cr', section: '贷中监控', group: '红黄灯预警', order: 1, enabled: true, builtin: true,
    desc: '红黄灯预警产出与处置进展：等级结构、趋势、场景分布与最新记录。',
    widgets: [
      { id: 'w1', type: 'metric', title: '今日各等级预警', datasetId: 'ds_alert', dimensions: ['risk_level'], measures: [m('alert_id', 'count')], filters: [f('alert_date', 'eq', '2026-07-29')], span: 2 },
      { id: 'w2', type: 'metric', title: '处置进展(今日)', datasetId: 'ds_alert', dimensions: ['is_disposed'], measures: [m('alert_id', 'count')], filters: [f('alert_date', 'eq', '2026-07-29')], span: 2 },
      { id: 'w3', type: 'line', title: '近14日红黄蓝灯预警趋势', datasetId: 'ds_alert_daily', dimensions: ['date'], measures: [m('red_cnt', 'sum'), m('yellow_cnt', 'sum'), m('blue_cnt', 'sum')], filters: [], span: 2 },
      { id: 'w4', type: 'donut', title: '今日预警场景分布', datasetId: 'ds_alert', dimensions: ['scene'], measures: [m('alert_id', 'count')], filters: [f('alert_date', 'eq', '2026-07-29')], span: 1 },
      { id: 'w5', type: 'bar', title: '各产品今日预警数', datasetId: 'ds_alert', dimensions: ['product'], measures: [m('alert_id', 'count')], filters: [f('alert_date', 'eq', '2026-07-29')], span: 1 },
      { id: 'w6', type: 'table', title: '最新预警记录', datasetId: 'ds_alert', dimensions: [], measures: [], filters: [], limit: 12, span: 2 },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-crowd', key: 'cr:mid-crowd', name: '客群风险', sub: 'cr', section: '贷中监控', group: '客群风险', order: 1, enabled: true, builtin: true,
    desc: '在贷客群风险全景：风险结构、各客群分布与客群明细。',
    widgets: [
      { id: 'w1', type: 'metric', title: '客群核心指标', datasetId: 'ds_segment', dimensions: [], measures: [m('cust_count', 'sum', '在贷客户(万)'), m('avg_score', 'avg', '平均行为分'), m('high_ratio', 'avg', '高风险占比'), m('migration_rate', 'avg', '月上迁率')], filters: [], span: 2 },
      { id: 'w2', type: 'bar', title: '各客群平均行为分', datasetId: 'ds_segment', dimensions: ['segment_name'], measures: [m('avg_score', 'avg')], filters: [], span: 1 },
      { id: 'w3', type: 'bar', title: '各客群高风险占比(%)', datasetId: 'ds_segment', dimensions: ['segment_name'], measures: [m('high_ratio', 'avg')], filters: [], span: 1 },
      { id: 'w4', type: 'donut', title: '在贷客群风险等级结构', datasetId: 'ds_risk_band', dimensions: ['band'], measures: [m('cust_count', 'sum')], filters: [], span: 1 },
      { id: 'w5', type: 'bar', title: '各产品在贷客户数(万)', datasetId: 'ds_segment', dimensions: ['product'], measures: [m('cust_count', 'sum')], filters: [], span: 1 },
      { id: 'w6', type: 'table', title: '客群风险明细', datasetId: 'ds_segment', dimensions: [], measures: [], filters: [], limit: 8, span: 2 },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-crowd-single', key: 'cr:mid-crowd-single', name: '单客风险', sub: 'cr', section: '贷中监控', group: '客群风险', order: 2, enabled: true, builtin: true,
    desc: '单客户风险画像追踪（示例客户 王*成）：行为评分走势、共债变化与风险事件。',
    widgets: [
      { id: 'w1', type: 'metric', title: '王*成 近6月风险信号', datasetId: 'ds_behavior', dimensions: [], measures: [m('behavior_score', 'avg', '平均行为分'), m('query_30d', 'avg', '近30日查询(均值)'), m('other_overdue', 'sum', '他机构逾期(累计)'), m('risk_events', 'sum', '风险事件(累计)')], filters: [f('cust_name', 'eq', '王*成')], span: 2 },
      { id: 'w2', type: 'line', title: '行为评分走势 vs 客群均值', datasetId: 'ds_behavior', dimensions: ['obs_month'], measures: [m('behavior_score', 'avg'), m('cohort_avg', 'avg')], filters: [f('cust_name', 'eq', '王*成')], span: 2 },
      { id: 'w3', type: 'bar', title: '共债与查询次数走势', datasetId: 'ds_behavior', dimensions: ['obs_month'], measures: [m('query_30d', 'avg'), m('other_overdue', 'avg')], filters: [f('cust_name', 'eq', '王*成')], span: 1 },
      { id: 'w4', type: 'bar', title: '消费环比与风险事件', datasetId: 'ds_behavior', dimensions: ['obs_month'], measures: [m('spend_mom', 'avg'), m('risk_events', 'avg')], filters: [f('cust_name', 'eq', '王*成')], span: 1 },
      { id: 'w5', type: 'table', title: '风险信号月度观测', datasetId: 'ds_behavior', dimensions: [], measures: [], filters: [f('cust_name', 'eq', '王*成')], limit: 6, span: 2 },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-crowd-trend', key: 'cr:mid-crowd-trend', name: '风险趋势', sub: 'cr', section: '贷中监控', group: '客群风险', order: 3, enabled: true, builtin: true,
    desc: '客群风险趋势与迁徙分析：行为分走势、月度迁徙与迁徙矩阵。',
    widgets: [
      { id: 'w1', type: 'metric', title: '客群趋势核心指标', datasetId: 'ds_segment', dimensions: [], measures: [m('avg_score', 'avg', '客群平均行为分'), m('high_ratio', 'avg', '高风险占比'), m('migration_rate', 'avg', '月上迁率'), m('cust_count', 'sum', '在贷客户(万)')], filters: [], span: 2 },
      { id: 'w2', type: 'line', title: '客群风险迁徙(近6月)', datasetId: 'ds_migration_trend', dimensions: ['month'], measures: [m('up_migrate', 'sum'), m('down_migrate', 'sum')], filters: [], span: 2 },
      { id: 'w3', type: 'bar', title: '各客群平均行为分', datasetId: 'ds_segment', dimensions: ['segment_name'], measures: [m('avg_score', 'avg')], filters: [], span: 1 },
      { id: 'w4', type: 'bar', title: '各客群月上迁率(%)', datasetId: 'ds_segment', dimensions: ['segment_name'], measures: [m('migration_rate', 'avg')], filters: [], span: 1 },
      { id: 'w5', type: 'table', title: '风险等级迁徙矩阵(月)', datasetId: 'ds_migration_matrix', dimensions: [], measures: [], filters: [], limit: 10, span: 2 },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-dispose', key: 'cr:mid-dispose', name: '处置任务', sub: 'cr', section: '贷中监控', group: '处置管理', order: 1, enabled: true, builtin: true,
    desc: '预警处置工作台：任务分布、人员工作量与处置方式结构。',
    widgets: [
      { id: 'w1', type: 'metric', title: '处置任务状态分布', datasetId: 'ds_dispose_task', dimensions: ['status'], measures: [m('task_id', 'count')], filters: [], span: 2 },
      { id: 'w2', type: 'donut', title: '处置方式分布', datasetId: 'ds_dispose_task', dimensions: ['suggest_action'], measures: [m('task_id', 'count')], filters: [], span: 1 },
      { id: 'w3', type: 'bar', title: '各处理人工作量', datasetId: 'ds_dispose_task', dimensions: ['owner'], measures: [m('task_id', 'count')], filters: [], span: 1 },
      { id: 'w4', type: 'bar', title: '按预警场景分布', datasetId: 'ds_dispose_task', dimensions: ['scene'], measures: [m('task_id', 'count')], filters: [], span: 1 },
      { id: 'w5', type: 'donut', title: '处置状态结构', datasetId: 'ds_dispose_task', dimensions: ['status'], measures: [m('task_id', 'count')], filters: [], span: 1 },
      { id: 'w6', type: 'table', title: '处置任务明细', datasetId: 'ds_dispose_task', dimensions: [], measures: [], filters: [], limit: 14, span: 2 },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-dispose-record', key: 'cr:mid-dispose-record', name: '处置记录', sub: 'cr', section: '贷中监控', group: '处置管理', order: 2, enabled: true, builtin: true,
    desc: '处置历史与效果评估：处置量趋势、笔数与回收、方式结构与明细。',
    widgets: [
      { id: 'w1', type: 'metric', title: '处置效果核心指标', datasetId: 'ds_dispose_result', dimensions: [], measures: [m('dispose_cnt', 'sum', '处置笔数'), m('effective_rate', 'avg', '平均有效率'), m('avg_duration', 'avg', '平均时长(h)'), m('success_amt', 'sum', '回收金额(万)')], filters: [], span: 2 },
      { id: 'w2', type: 'line', title: '近14日处置任务创建量', datasetId: 'ds_dispose_task', dimensions: ['create_date'], measures: [m('task_id', 'count')], filters: [], span: 2 },
      { id: 'w3', type: 'bar', title: '各处置方式笔数与回收(万)', datasetId: 'ds_dispose_result', dimensions: ['action'], measures: [m('dispose_cnt', 'sum'), m('success_amt', 'sum')], filters: [], span: 1 },
      { id: 'w4', type: 'donut', title: '处置方式笔数结构', datasetId: 'ds_dispose_result', dimensions: ['action'], measures: [m('dispose_cnt', 'sum')], filters: [], span: 1 },
      { id: 'w5', type: 'table', title: '处置任务记录', datasetId: 'ds_dispose_task', dimensions: [], measures: [], filters: [f('status', 'eq', '已完成')], limit: 14, span: 2 },
    ],
    updatedAt: NOW,
  },
]

/* ============================================================
 * 存储（localStorage）
 * ========================================================== */
const LS_PAGES = 'zd-dashboard-pages-v2'
const LS_DATASETS = 'zd-dashboard-datasets-v1'

export function loadDashboards(): DashboardPage[] {
  try {
    const raw = localStorage.getItem(LS_PAGES)
    if (raw) {
      const arr = JSON.parse(raw) as DashboardPage[]
      if (Array.isArray(arr) && arr.length > 0) return arr
    }
  } catch { /* 回退默认 */ }
  return DEFAULT_DASHBOARDS
}

export function saveDashboards(pages: DashboardPage[]) {
  localStorage.setItem(LS_PAGES, JSON.stringify(pages))
}

export function resetDashboards(): DashboardPage[] {
  localStorage.removeItem(LS_PAGES)
  return DEFAULT_DASHBOARDS
}

export function getDashboardByKey(key: string): DashboardPage | undefined {
  return loadDashboards().find((p) => p.key === key && p.enabled)
}

/* ---------- 数据集（内置 + 用户自建 API/SQL） ---------- */
export function loadDatasets(): Dataset[] {
  let user: Dataset[] = []
  try {
    const raw = localStorage.getItem(LS_DATASETS)
    if (raw) {
      const arr = JSON.parse(raw) as Dataset[]
      if (Array.isArray(arr)) user = arr
    }
  } catch { /* ignore */ }
  return [...BUILTIN_DATASETS, ...user]
}

export function saveUserDatasets(user: Dataset[]) {
  localStorage.setItem(LS_DATASETS, JSON.stringify(user))
}

/* ============================================================
 * 菜单合并：用看板配置驱动「贷中监控」分区菜单
 * ========================================================== */
export function mergeMidMenu(base: MenuGroup[], pages: DashboardPage[]): MenuGroup[] {
  const midPages = pages.filter((p) => p.sub === 'cr' && p.section === '贷中监控')
  const enabledKeys = new Set(midPages.filter((p) => p.enabled).map((p) => p.key))
  const allKeys = new Set(midPages.map((p) => p.key))

  const merged: MenuGroup[] = base.map((g) => ({
    ...g,
    items: g.items.filter((it) => {
      if (g.section !== '贷中监控') return true
      if (!allKeys.has(it.key)) return true
      return enabledKeys.has(it.key)
    }),
  }))

  const baseKeys = new Set(base.flatMap((g) => g.items.map((it) => it.key)))
  const extras = midPages.filter((p) => p.enabled && !baseKeys.has(p.key)).sort((a, b) => a.order - b.order)

  for (const p of extras) {
    const grp = merged.find((g) => g.section === '贷中监控' && g.group === p.group)
    const item = { label: p.name, key: p.key, desc: p.desc, keep: true }
    if (grp) grp.items.push(item)
    else {
      let lastMid = -1
      merged.forEach((g, i) => { if (g.section === '贷中监控') lastMid = i })
      merged.splice(lastMid + 1, 0, { group: p.group, section: '贷中监控', items: [item] })
    }
  }
  return merged.filter((g) => g.items.length > 0)
}
