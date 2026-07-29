/* ============================================================
 * 数据看板：配置数据层
 * - 贷中监控下所有页面均为「数据看板」，由本文件的配置驱动渲染
 * - 管理中心-公共配置-数据看板配置 页面对看板进行增删改查
 * - 页面配置持久化到 localStorage；数据集为内置注册表（模拟数仓指标集市）
 * ========================================================== */
import type { Column, Row } from '../components/ui'
import type { MenuGroup } from './menus'

/* ---------------- 类型定义 ---------------- */
export type DatasetKind = 'metrics' | 'series' | 'donut' | 'table'

export interface MetricItem {
  label: string
  value: string
  delta?: string
  deltaType?: 'up' | 'down' | 'flat'
  accent?: string
}

export interface Dataset {
  id: string
  name: string
  kind: DatasetKind
  desc?: string
  /** kind=metrics */
  metrics?: MetricItem[]
  /** kind=series（折线/柱状共用） */
  labels?: string[]
  series?: { name: string; color: string; data: number[] }[]
  unit?: string
  /** kind=donut */
  donut?: { label: string; value: number; color: string }[]
  donutCenterLabel?: string
  donutCenterValue?: string
  /** kind=table */
  columns?: Column[]
  rows?: Row[]
}

export type WidgetType = 'stat' | 'line' | 'bar' | 'donut' | 'table'

export interface DashWidget {
  id: string
  type: WidgetType
  title: string
  datasetId: string
  /** 图表宽度：1=半宽 2=全宽（指标卡/数据表恒为全宽） */
  span?: 1 | 2
}

export interface DashboardPage {
  id: string
  /** 路由 key，如 cr:mid-task；决定页面地址 /console/cr/mid-task */
  key: string
  name: string
  sub: string // 子系统，目前固定 cr（零售信贷风控）
  section: string // 左侧菜单分区，固定 贷中监控
  group: string // 左侧菜单分组名
  order: number // 分组内排序
  enabled: boolean
  desc?: string
  builtin?: boolean // 内置看板（随产品预置，可编辑、可停用）
  widgets: DashWidget[]
  updatedAt: string
}

/* ---------------- 组件类型 ↔ 数据集类别 兼容关系 ---------------- */
export const WIDGET_TYPE_META: Record<WidgetType, { label: string; kind: DatasetKind }> = {
  stat: { label: '指标卡组', kind: 'metrics' },
  line: { label: '折线图', kind: 'series' },
  bar: { label: '柱状图', kind: 'series' },
  donut: { label: '环形图', kind: 'donut' },
  table: { label: '数据表', kind: 'table' },
}

/* ============================================================
 * 内置数据集注册表（模拟指标集市 / 数仓宽表，参考同盾贷中监控指标体系）
 * ========================================================== */
export const DATASETS: Dataset[] = [
  /* ---- 指标卡数据集 ---- */
  {
    id: 'm-task-stats',
    name: '监控任务核心指标',
    kind: 'metrics',
    desc: '任务总数 / 扫描量 / 触发预警 / 成功率',
    metrics: [
      { label: '监控任务总数', value: '36', delta: '+2 本周', deltaType: 'up' },
      { label: '今日扫描客户数', value: '182.4万', delta: '+3.1% 环比', deltaType: 'up' },
      { label: '今日触发预警', value: '1,284', delta: '红灯 213', deltaType: 'down' },
      { label: '任务执行成功率', value: '99.6%', delta: '+0.2pp', deltaType: 'up' },
    ],
  },
  {
    id: 'm-alert-stats',
    name: '红黄灯预警核心指标',
    kind: 'metrics',
    desc: '今日红灯 / 黄灯 / 待处理 / 处理率',
    metrics: [
      { label: '今日红灯预警', value: '213', delta: '+18 较昨日', deltaType: 'down' },
      { label: '今日黄灯预警', value: '1,071', delta: '+64 较昨日', deltaType: 'down' },
      { label: '待处理预警', value: '486', delta: '超 24h 未处理 37', deltaType: 'flat' },
      { label: '预警处理率', value: '92.4%', delta: '+1.3pp', deltaType: 'up' },
    ],
  },
  {
    id: 'm-crowd-stats',
    name: '客群风险核心指标',
    kind: 'metrics',
    desc: '在贷客户 / 高风险占比 / 平均行为分 / 迁徙率',
    metrics: [
      { label: '在贷监测客户', value: '234.0万', delta: '+3.4万 本月', deltaType: 'up' },
      { label: '高风险客户占比', value: '4.7%', delta: '+0.3pp', deltaType: 'down' },
      { label: '平均行为评分', value: '672', delta: '-3 较上月', deltaType: 'down' },
      { label: '风险上迁率(月)', value: '2.1%', delta: '-0.2pp', deltaType: 'up' },
    ],
  },
  {
    id: 'm-single-stats',
    name: '单客风险核心指标',
    kind: 'metrics',
    desc: '当前行为分 / 风险等级 / 累计预警 / 共债机构数',
    metrics: [
      { label: '当前行为评分', value: '588', delta: '-46 近30日', deltaType: 'down' },
      { label: '当前风险等级', value: '高', delta: '由中 → 高', deltaType: 'down' },
      { label: '累计预警次数', value: '7', delta: '近30日 +3', deltaType: 'down' },
      { label: '多头共债机构数', value: '6', delta: '+2 近30日', deltaType: 'down' },
    ],
  },
  {
    id: 'm-trend-stats',
    name: '风险趋势核心指标',
    kind: 'metrics',
    desc: '本月平均分 / 环比 / 同比 / 高风险净流入',
    metrics: [
      { label: '本月客群平均分', value: '672', delta: '-3 环比', deltaType: 'down' },
      { label: '平均分环比', value: '-0.44%', delta: '连续 2 月下行', deltaType: 'down' },
      { label: '平均分同比', value: '+1.2%', delta: '好于去年同期', deltaType: 'up' },
      { label: '高风险净流入(月)', value: '+3,120 人', delta: '上迁-下迁', deltaType: 'down' },
    ],
  },
  {
    id: 'm-dispose-stats',
    name: '处置任务核心指标',
    kind: 'metrics',
    desc: '待处置 / 今日新增 / 超时 / 完成率',
    metrics: [
      { label: '待处置任务', value: '486', delta: '红灯 176', deltaType: 'flat' },
      { label: '今日新增任务', value: '231', delta: '+12 较昨日', deltaType: 'down' },
      { label: '超时未处置', value: '37', delta: '需重点跟进', deltaType: 'down' },
      { label: '7 日处置完成率', value: '91.8%', delta: '+0.9pp', deltaType: 'up' },
    ],
  },
  {
    id: 'm-record-stats',
    name: '处置记录核心指标',
    kind: 'metrics',
    desc: '累计处置 / 本月处置 / 有效率 / 平均时长',
    metrics: [
      { label: '累计处置预警', value: '48,206', delta: '近12月', deltaType: 'flat' },
      { label: '本月处置量', value: '5,872', delta: '+6.4% 环比', deltaType: 'up' },
      { label: '处置有效率', value: '87.3%', delta: '处置后风险下降占比', deltaType: 'up' },
      { label: '平均处置时长', value: '5.2h', delta: '-0.8h 环比', deltaType: 'up' },
    ],
  },

  /* ---- 序列数据集（折线/柱状） ---- */
  {
    id: 's-scan-alert-14d',
    name: '近14日扫描量与预警量',
    kind: 'series',
    desc: '监控任务每日扫描客户数(万)与触发预警数',
    labels: ['07-16', '07-17', '07-18', '07-19', '07-20', '07-21', '07-22', '07-23', '07-24', '07-25', '07-26', '07-27', '07-28', '07-29'],
    series: [
      { name: '扫描客户数(万)', color: '#3366ff', data: [168, 171, 175, 172, 176, 178, 174, 177, 180, 179, 181, 183, 180, 182] },
      { name: '触发预警数(十)', color: '#ef4444', data: [98, 104, 101, 109, 112, 118, 107, 111, 116, 121, 119, 124, 122, 128] },
    ],
  },
  {
    id: 's-alert-redyellow-14d',
    name: '近14日红黄灯预警趋势',
    kind: 'series',
    desc: '每日红灯/黄灯预警数量',
    labels: ['07-16', '07-17', '07-18', '07-19', '07-20', '07-21', '07-22', '07-23', '07-24', '07-25', '07-26', '07-27', '07-28', '07-29'],
    series: [
      { name: '红灯', color: '#ef4444', data: [162, 171, 168, 180, 176, 195, 172, 181, 188, 197, 190, 205, 195, 213] },
      { name: '黄灯', color: '#f59e0b', data: [820, 861, 843, 902, 887, 941, 872, 897, 932, 968, 943, 1012, 987, 1071] },
    ],
  },
  {
    id: 's-crowd-riskdist',
    name: '各客群风险分布',
    kind: 'series',
    desc: '按产品客群统计高/中/低风险客户数(千)',
    labels: ['现金贷', '消费分期', '信用卡代偿', '小微经营贷', '车主贷', '公积金贷'],
    series: [
      { name: '低风险(千)', color: '#22c55e', data: [386, 512, 168, 96, 142, 208] },
      { name: '中风险(千)', color: '#f59e0b', data: [64, 71, 32, 25, 21, 18] },
      { name: '高风险(千)', color: '#ef4444', data: [22, 18, 11, 9, 6, 4] },
    ],
  },
  {
    id: 's-behavior-score-6m',
    name: '单客行为评分走势(近6月)',
    kind: 'series',
    desc: '示例客户 王*成 的月度行为评分',
    labels: ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'],
    series: [
      { name: '行为评分', color: '#3366ff', data: [688, 672, 665, 641, 612, 588] },
      { name: '客群均值', color: '#94a3b8', data: [676, 678, 674, 675, 673, 672] },
    ],
  },
  {
    id: 's-risk-trend-12w',
    name: '客群风险分趋势(近12周)',
    kind: 'series',
    desc: '客群平均行为分与高风险占比走势',
    labels: ['W18', 'W19', 'W20', 'W21', 'W22', 'W23', 'W24', 'W25', 'W26', 'W27', 'W28', 'W29'],
    series: [
      { name: '平均行为分(÷10)', color: '#3366ff', data: [68.1, 68.0, 67.8, 67.9, 67.7, 67.6, 67.7, 67.5, 67.4, 67.4, 67.3, 67.2] },
      { name: '高风险占比(‰)', color: '#ef4444', data: [41, 42, 42, 43, 44, 44, 45, 45, 46, 46, 47, 47] },
    ],
  },
  {
    id: 's-migration-6m',
    name: '月度风险迁徙(近6月)',
    kind: 'series',
    desc: '每月风险上迁 / 下迁客户数(百)',
    labels: ['2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07'],
    series: [
      { name: '上迁(变差)(百)', color: '#ef4444', data: [412, 438, 465, 447, 492, 486] },
      { name: '下迁(转好)(百)', color: '#22c55e', data: [388, 402, 391, 420, 431, 455] },
    ],
  },
  {
    id: 's-dispose-14d',
    name: '近14日处置量',
    kind: 'series',
    desc: '每日新增任务与完成处置数量',
    labels: ['07-16', '07-17', '07-18', '07-19', '07-20', '07-21', '07-22', '07-23', '07-24', '07-25', '07-26', '07-27', '07-28', '07-29'],
    series: [
      { name: '新增任务', color: '#f59e0b', data: [196, 204, 198, 216, 208, 225, 202, 211, 219, 228, 221, 240, 226, 231] },
      { name: '完成处置', color: '#22c55e', data: [188, 195, 201, 205, 212, 208, 210, 206, 214, 220, 225, 231, 229, 224] },
    ],
  },
  {
    id: 's-dispose-workload',
    name: '处置人员工作量(本周)',
    kind: 'series',
    desc: '各风控专员本周处置完成量',
    labels: ['李瑞', '周敏', '张倩', '陈晨', '刘阳', '赵璐'],
    series: [{ name: '处置完成量', color: '#3366ff', data: [186, 172, 164, 151, 148, 132] }],
  },

  /* ---- 环形数据集 ---- */
  {
    id: 'd-task-type',
    name: '监控任务类型分布',
    kind: 'donut',
    donutCenterLabel: '任务总数',
    donutCenterValue: '36',
    donut: [
      { label: '定时批量扫描', value: 18, color: '#3366ff' },
      { label: '实时事件触发', value: 9, color: '#22c55e' },
      { label: '名单定期回扫', value: 6, color: '#f59e0b' },
      { label: '模型定期重估', value: 3, color: '#8b5cf6' },
    ],
  },
  {
    id: 'd-alert-scene',
    name: '预警场景分布(今日)',
    kind: 'donut',
    donutCenterLabel: '今日预警',
    donutCenterValue: '1,284',
    donut: [
      { label: '多头借贷激增', value: 428, color: '#ef4444' },
      { label: '他机构逾期', value: 312, color: '#f59e0b' },
      { label: '失联风险', value: 217, color: '#8b5cf6' },
      { label: '司法涉诉', value: 158, color: '#3366ff' },
      { label: '额度使用异动', value: 169, color: '#22c55e' },
    ],
  },
  {
    id: 'd-risk-level',
    name: '在贷客群风险等级分布',
    kind: 'donut',
    donutCenterLabel: '在贷客户',
    donutCenterValue: '234.0万',
    donut: [
      { label: '低风险', value: 1512000, color: '#22c55e' },
      { label: '中低风险', value: 486000, color: '#a3e635' },
      { label: '中风险', value: 231000, color: '#f59e0b' },
      { label: '高风险', value: 110000, color: '#ef4444' },
    ],
  },
  {
    id: 'd-dispose-action',
    name: '处置方式分布(本月)',
    kind: 'donut',
    donutCenterLabel: '本月处置',
    donutCenterValue: '5,872',
    donut: [
      { label: '电核提醒', value: 2214, color: '#3366ff' },
      { label: '额度冻结', value: 1436, color: '#ef4444' },
      { label: '额度下调', value: 1108, color: '#f59e0b' },
      { label: '提前催收', value: 682, color: '#8b5cf6' },
      { label: '解除预警', value: 432, color: '#22c55e' },
    ],
  },

  /* ---- 表格数据集 ---- */
  {
    id: 't-task-list',
    name: '监控任务列表',
    kind: 'table',
    columns: [
      { key: 'id', label: '任务编号', width: '120px' },
      { key: 'name', label: '任务名称', width: '190px' },
      { key: 'product', label: '适用产品', width: '110px' },
      { key: 'scene', label: '监控场景', width: '130px' },
      { key: 'freq', label: '频次', width: '90px' },
      { key: 'cover', label: '覆盖客群', align: 'right', width: '110px' },
      { key: 'lastRun', label: '最近执行', type: 'datetime', width: '150px' },
      { key: 'status', label: '状态', type: 'badge', width: '90px' },
    ],
    rows: [
      { id: 'MT-2026-001', name: '在贷客户多头监测', product: '现金贷', scene: '多头借贷', freq: '每日', cover: '86.2万', lastRun: '2026-07-29 04:00', status: { v: '运行中', kind: 'green' } },
      { id: 'MT-2026-002', name: '他机构逾期回扫', product: '全部产品', scene: '逾期恶化', freq: '每日', cover: '234.0万', lastRun: '2026-07-29 03:30', status: { v: '运行中', kind: 'green' } },
      { id: 'MT-2026-003', name: '高危名单实时碰撞', product: '全部产品', scene: '名单风险', freq: '实时', cover: '234.0万', lastRun: '2026-07-29 13:20', status: { v: '运行中', kind: 'green' } },
      { id: 'MT-2026-004', name: '司法涉诉周扫描', product: '小微经营贷', scene: '司法风险', freq: '每周', cover: '12.6万', lastRun: '2026-07-27 02:00', status: { v: '运行中', kind: 'green' } },
      { id: 'MT-2026-005', name: '失联风险识别', product: '消费分期', scene: '失联修复', freq: '每日', cover: '60.1万', lastRun: '2026-07-29 05:10', status: { v: '异常', kind: 'red' } },
      { id: 'MT-2026-006', name: '行为评分月度重估', product: '全部产品', scene: '行为评分', freq: '每月', cover: '234.0万', lastRun: '2026-07-01 01:00', status: { v: '运行中', kind: 'green' } },
      { id: 'MT-2026-007', name: '额度使用异动监测', product: '信用卡代偿', scene: '额度异动', freq: '每日', cover: '21.1万', lastRun: '2026-07-29 06:00', status: { v: '已暂停', kind: 'gray' } },
    ],
  },
  {
    id: 't-alert-list',
    name: '预警记录列表',
    kind: 'table',
    columns: [
      { key: 'id', label: '预警号', width: '130px' },
      { key: 'name', label: '客户', type: 'mask-name', width: '90px' },
      { key: 'level', label: '等级', type: 'badge', width: '80px' },
      { key: 'scene', label: '预警场景', width: '130px' },
      { key: 'signal', label: '触发信号', width: '220px' },
      { key: 'product', label: '产品', width: '100px' },
      { key: 'suggest', label: '处置建议', type: 'badge', width: '100px' },
      { key: 'time', label: '监测时间', type: 'datetime', width: '150px' },
    ],
    rows: [
      { id: 'AL-20260729-0861', name: '王成', level: { v: '红灯', kind: 'red' }, scene: '多头借贷激增', signal: '近7日新增申请机构 5 家', product: '现金贷', suggest: { v: '额度冻结', kind: 'red' }, time: '2026-07-29 11:42' },
      { id: 'AL-20260729-0837', name: '李娜', level: { v: '红灯', kind: 'red' }, scene: '他机构逾期', signal: '他机构当前逾期 M1+', product: '消费分期', suggest: { v: '提前催收', kind: 'orange' }, time: '2026-07-29 10:58' },
      { id: 'AL-20260729-0790', name: '张伟', level: { v: '黄灯', kind: 'amber' }, scene: '额度使用异动', signal: '单日支用率 92%，历史均值 31%', product: '信用卡代偿', suggest: { v: '电核提醒', kind: 'blue' }, time: '2026-07-29 09:31' },
      { id: 'AL-20260729-0752', name: '刘洋', level: { v: '黄灯', kind: 'amber' }, scene: '失联风险', signal: '预留手机停机 14 天', product: '现金贷', suggest: { v: '电核提醒', kind: 'blue' }, time: '2026-07-29 08:47' },
      { id: 'AL-20260729-0713', name: '陈晨', level: { v: '红灯', kind: 'red' }, scene: '司法涉诉', signal: '新增被执行人记录 1 条', product: '小微经营贷', suggest: { v: '额度下调', kind: 'orange' }, time: '2026-07-29 08:02' },
      { id: 'AL-20260728-1104', name: '赵璐', level: { v: '黄灯', kind: 'amber' }, scene: '行为评分下滑', signal: '行为分月降幅 46 分', product: '消费分期', suggest: { v: '持续关注', kind: 'gray' }, time: '2026-07-28 22:15' },
    ],
  },
  {
    id: 't-crowd-list',
    name: '客群风险列表',
    kind: 'table',
    columns: [
      { key: 'id', label: '客群编号', width: '110px' },
      { key: 'name', label: '客群名称', width: '160px' },
      { key: 'cnt', label: '客户数', align: 'right', width: '100px' },
      { key: 'avgScore', label: '平均行为分', type: 'score', align: 'right', width: '110px' },
      { key: 'highRatio', label: '高风险占比', align: 'right', width: '110px' },
      { key: 'migration', label: '月上迁率', align: 'right', width: '100px' },
      { key: 'trend', label: '风险趋势', type: 'badge', width: '100px' },
    ],
    rows: [
      { id: 'CG-001', name: '现金贷-在贷客群', cnt: '47.2万', avgScore: 655, highRatio: '4.7%', migration: '2.4%', trend: { v: '上行', kind: 'red' } },
      { id: 'CG-002', name: '消费分期-在贷客群', cnt: '60.1万', avgScore: 681, highRatio: '3.0%', migration: '1.8%', trend: { v: '平稳', kind: 'gray' } },
      { id: 'CG-003', name: '信用卡代偿-在贷客群', cnt: '21.1万', avgScore: 668, highRatio: '5.2%', migration: '2.6%', trend: { v: '上行', kind: 'red' } },
      { id: 'CG-004', name: '小微经营贷-在贷客群', cnt: '13.0万', avgScore: 692, highRatio: '6.9%', migration: '2.9%', trend: { v: '上行', kind: 'red' } },
      { id: 'CG-005', name: '车主贷-在贷客群', cnt: '16.9万', avgScore: 701, highRatio: '3.6%', migration: '1.2%', trend: { v: '下行', kind: 'green' } },
      { id: 'CG-006', name: '公积金贷-在贷客群', cnt: '23.0万', avgScore: 726, highRatio: '1.7%', migration: '0.8%', trend: { v: '下行', kind: 'green' } },
    ],
  },
  {
    id: 't-single-history',
    name: '单客风险事件记录',
    kind: 'table',
    columns: [
      { key: 'id', label: '事件编号', width: '130px' },
      { key: 'time', label: '发生时间', type: 'datetime', width: '150px' },
      { key: 'type', label: '事件类型', width: '130px' },
      { key: 'detail', label: '事件详情', width: '260px' },
      { key: 'scoreChg', label: '评分变化', align: 'right', width: '100px' },
      { key: 'level', label: '事件等级', type: 'badge', width: '90px' },
    ],
    rows: [
      { id: 'EV-0729-311', time: '2026-07-29 11:42', type: '多头预警', detail: '近7日新增申请机构 5 家（红灯）', scoreChg: '-18', level: { v: '红灯', kind: 'red' } },
      { id: 'EV-0722-208', time: '2026-07-22 09:12', type: '共债上升', detail: '共债机构数 4 → 6，预估负债/收入 58%', scoreChg: '-12', level: { v: '黄灯', kind: 'amber' } },
      { id: 'EV-0715-166', time: '2026-07-15 16:40', type: '还款行为', detail: '当期最低还款（连续第 2 期）', scoreChg: '-9', level: { v: '黄灯', kind: 'amber' } },
      { id: 'EV-0703-090', time: '2026-07-03 10:05', type: '联系方式', detail: '预留手机号变更并完成验证', scoreChg: '-4', level: { v: '提示', kind: 'gray' } },
      { id: 'EV-0620-045', time: '2026-06-20 14:22', type: '行为评分', detail: '月度重估：641 → 612', scoreChg: '-29', level: { v: '黄灯', kind: 'amber' } },
    ],
  },
  {
    id: 't-migration-matrix',
    name: '风险等级迁徙矩阵(月)',
    kind: 'table',
    columns: [
      { key: 'from', label: '上月等级 \\ 本月', width: '130px' },
      { key: 'low', label: '低风险', align: 'right', width: '110px' },
      { key: 'mid', label: '中风险', align: 'right', width: '110px' },
      { key: 'high', label: '高风险', align: 'right', width: '110px' },
      { key: 'stay', label: '留存率', align: 'right', width: '100px' },
    ],
    rows: [
      { id: 'mg-1', from: '低风险', low: '96.6%', mid: '2.8%', high: '0.6%', stay: '96.6%' },
      { id: 'mg-2', from: '中风险', low: '18.2%', mid: '74.5%', high: '7.3%', stay: '74.5%' },
      { id: 'mg-3', from: '高风险', low: '3.1%', mid: '16.8%', high: '80.1%', stay: '80.1%' },
    ],
  },
  {
    id: 't-dispose-todo',
    name: '待处置任务列表',
    kind: 'table',
    columns: [
      { key: 'id', label: '任务编号', width: '130px' },
      { key: 'name', label: '客户', type: 'mask-name', width: '90px' },
      { key: 'level', label: '预警等级', type: 'badge', width: '90px' },
      { key: 'scene', label: '预警场景', width: '130px' },
      { key: 'suggest', label: '建议动作', type: 'badge', width: '100px' },
      { key: 'owner', label: '当前处理人', width: '110px' },
      { key: 'deadline', label: '处置时限', type: 'datetime', width: '150px' },
      { key: 'status', label: '状态', type: 'badge', width: '90px' },
    ],
    rows: [
      { id: 'DP-20260729-118', name: '王成', level: { v: '红灯', kind: 'red' }, scene: '多头借贷激增', suggest: { v: '额度冻结', kind: 'red' }, owner: '李瑞', deadline: '2026-07-29 17:42', status: { v: '处理中', kind: 'blue' } },
      { id: 'DP-20260729-102', name: '李娜', level: { v: '红灯', kind: 'red' }, scene: '他机构逾期', suggest: { v: '提前催收', kind: 'orange' }, owner: '周敏', deadline: '2026-07-29 16:58', status: { v: '待领取', kind: 'amber' } },
      { id: 'DP-20260729-096', name: '陈晨', level: { v: '红灯', kind: 'red' }, scene: '司法涉诉', suggest: { v: '额度下调', kind: 'orange' }, owner: '张倩', deadline: '2026-07-29 14:02', status: { v: '处理中', kind: 'blue' } },
      { id: 'DP-20260728-233', name: '刘洋', level: { v: '黄灯', kind: 'amber' }, scene: '失联风险', suggest: { v: '电核提醒', kind: 'blue' }, owner: '—', deadline: '2026-07-29 08:47', status: { v: '已超时', kind: 'red' } },
      { id: 'DP-20260728-217', name: '赵璐', level: { v: '黄灯', kind: 'amber' }, scene: '行为评分下滑', suggest: { v: '持续关注', kind: 'gray' }, owner: '刘阳', deadline: '2026-07-30 22:15', status: { v: '待领取', kind: 'amber' } },
    ],
  },
  {
    id: 't-dispose-record',
    name: '处置历史记录',
    kind: 'table',
    columns: [
      { key: 'id', label: '处置编号', width: '130px' },
      { key: 'name', label: '客户', type: 'mask-name', width: '90px' },
      { key: 'scene', label: '预警场景', width: '130px' },
      { key: 'action', label: '处置动作', type: 'badge', width: '100px' },
      { key: 'operator', label: '处置人', width: '90px' },
      { key: 'time', label: '处置时间', type: 'datetime', width: '150px' },
      { key: 'result', label: '处置结果', width: '190px' },
      { key: 'effect', label: '效果评估', type: 'badge', width: '90px' },
    ],
    rows: [
      { id: 'DR-20260729-071', name: '孙丽', scene: '多头借贷激增', action: { v: '额度冻结', kind: 'red' }, operator: '李瑞', time: '2026-07-29 10:22', result: '冻结剩余额度 ¥38,000，客户已知悉', effect: { v: '有效', kind: 'green' } },
      { id: 'DR-20260729-064', name: '钱鹏', scene: '他机构逾期', action: { v: '提前催收', kind: 'orange' }, operator: '周敏', time: '2026-07-29 09:47', result: '触达成功，承诺 3 日内归还当期', effect: { v: '有效', kind: 'green' } },
      { id: 'DR-20260728-352', name: '吴霞', scene: '额度使用异动', action: { v: '电核提醒', kind: 'blue' }, operator: '张倩', time: '2026-07-28 17:31', result: '核实为装修大额支出，解除预警', effect: { v: '解除', kind: 'gray' } },
      { id: 'DR-20260728-346', name: '郑凯', scene: '失联风险', action: { v: '电核提醒', kind: 'blue' }, operator: '刘阳', time: '2026-07-28 16:05', result: '新联系方式修复成功', effect: { v: '有效', kind: 'green' } },
      { id: 'DR-20260728-320', name: '冯军', scene: '司法涉诉', action: { v: '额度下调', kind: 'orange' }, operator: '陈晨', time: '2026-07-28 14:40', result: '额度 8万 → 3万，转人工持续跟踪', effect: { v: '跟踪中', kind: 'amber' } },
      { id: 'DR-20260727-301', name: '蒋敏', scene: '行为评分下滑', action: { v: '持续关注', kind: 'gray' }, operator: '赵璐', time: '2026-07-27 11:18', result: '纳入周度观察名单', effect: { v: '跟踪中', kind: 'amber' } },
    ],
  },
]

export const datasetById = (id: string): Dataset | undefined => DATASETS.find((d) => d.id === id)

/* ============================================================
 * 内置默认看板（贷中监控 7 个页面）
 * ========================================================== */
const NOW = '2026-07-29 13:30'

export const DEFAULT_DASHBOARDS: DashboardPage[] = [
  {
    id: 'db-mid-task',
    key: 'cr:mid-task',
    name: '监控任务看板',
    sub: 'cr',
    section: '贷中监控',
    group: '监控任务看板',
    order: 1,
    enabled: true,
    builtin: true,
    desc: '贷中监控任务运行总览：任务规模、扫描与预警产出、任务健康度。',
    widgets: [
      { id: 'w1', type: 'stat', title: '核心指标', datasetId: 'm-task-stats' },
      { id: 'w2', type: 'line', title: '近14日扫描量与预警量', datasetId: 's-scan-alert-14d', span: 1 },
      { id: 'w3', type: 'donut', title: '监控任务类型分布', datasetId: 'd-task-type', span: 1 },
      { id: 'w4', type: 'table', title: '监控任务列表', datasetId: 't-task-list' },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-alert',
    key: 'cr:mid-alert',
    name: '红黄灯预警',
    sub: 'cr',
    section: '贷中监控',
    group: '红黄灯预警',
    order: 1,
    enabled: true,
    builtin: true,
    desc: '红黄灯预警产出与处理进展：预警趋势、场景分布与最新预警记录。',
    widgets: [
      { id: 'w1', type: 'stat', title: '核心指标', datasetId: 'm-alert-stats' },
      { id: 'w2', type: 'line', title: '近14日红黄灯预警趋势', datasetId: 's-alert-redyellow-14d', span: 1 },
      { id: 'w3', type: 'donut', title: '预警场景分布(今日)', datasetId: 'd-alert-scene', span: 1 },
      { id: 'w4', type: 'table', title: '最新预警记录', datasetId: 't-alert-list' },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-crowd',
    key: 'cr:mid-crowd',
    name: '客群风险',
    sub: 'cr',
    section: '贷中监控',
    group: '客群风险',
    order: 1,
    enabled: true,
    builtin: true,
    desc: '在贷客群风险全景：风险等级结构、各客群分布与客群明细。',
    widgets: [
      { id: 'w1', type: 'stat', title: '核心指标', datasetId: 'm-crowd-stats' },
      { id: 'w2', type: 'bar', title: '各客群风险分布', datasetId: 's-crowd-riskdist', span: 1 },
      { id: 'w3', type: 'donut', title: '在贷客群风险等级分布', datasetId: 'd-risk-level', span: 1 },
      { id: 'w4', type: 'table', title: '客群风险明细', datasetId: 't-crowd-list' },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-crowd-single',
    key: 'cr:mid-crowd-single',
    name: '单客风险',
    sub: 'cr',
    section: '贷中监控',
    group: '客群风险',
    order: 2,
    enabled: true,
    builtin: true,
    desc: '单个客户的风险画像追踪：行为评分走势、风险事件与预警记录（示例客户 王*成）。',
    widgets: [
      { id: 'w1', type: 'stat', title: '核心指标', datasetId: 'm-single-stats' },
      { id: 'w2', type: 'line', title: '行为评分走势(近6月)', datasetId: 's-behavior-score-6m', span: 2 },
      { id: 'w3', type: 'table', title: '风险事件记录', datasetId: 't-single-history' },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-crowd-trend',
    key: 'cr:mid-crowd-trend',
    name: '风险趋势',
    sub: 'cr',
    section: '贷中监控',
    group: '客群风险',
    order: 3,
    enabled: true,
    builtin: true,
    desc: '客群风险趋势与迁徙分析：平均分走势、月度迁徙与迁徙矩阵。',
    widgets: [
      { id: 'w1', type: 'stat', title: '核心指标', datasetId: 'm-trend-stats' },
      { id: 'w2', type: 'line', title: '客群风险分趋势(近12周)', datasetId: 's-risk-trend-12w', span: 1 },
      { id: 'w3', type: 'bar', title: '月度风险迁徙(近6月)', datasetId: 's-migration-6m', span: 1 },
      { id: 'w4', type: 'table', title: '风险等级迁徙矩阵(月)', datasetId: 't-migration-matrix' },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-dispose',
    key: 'cr:mid-dispose',
    name: '处置任务',
    sub: 'cr',
    section: '贷中监控',
    group: '处置管理',
    order: 1,
    enabled: true,
    builtin: true,
    desc: '预警处置工作台：待处置任务、人员工作量与处置方式分布。',
    widgets: [
      { id: 'w1', type: 'stat', title: '核心指标', datasetId: 'm-dispose-stats' },
      { id: 'w2', type: 'donut', title: '处置方式分布(本月)', datasetId: 'd-dispose-action', span: 1 },
      { id: 'w3', type: 'bar', title: '处置人员工作量(本周)', datasetId: 's-dispose-workload', span: 1 },
      { id: 'w4', type: 'table', title: '待处置任务', datasetId: 't-dispose-todo' },
    ],
    updatedAt: NOW,
  },
  {
    id: 'db-mid-dispose-record',
    key: 'cr:mid-dispose-record',
    name: '处置记录',
    sub: 'cr',
    section: '贷中监控',
    group: '处置管理',
    order: 2,
    enabled: true,
    builtin: true,
    desc: '处置历史与效果评估：处置量趋势、处置明细与效果回收。',
    widgets: [
      { id: 'w1', type: 'stat', title: '核心指标', datasetId: 'm-record-stats' },
      { id: 'w2', type: 'line', title: '近14日处置量', datasetId: 's-dispose-14d', span: 2 },
      { id: 'w3', type: 'table', title: '处置历史记录', datasetId: 't-dispose-record' },
    ],
    updatedAt: NOW,
  },
]

/* ============================================================
 * 存储（localStorage）
 * ========================================================== */
const LS_KEY = 'zd-dashboard-pages-v1'

export function loadDashboards(): DashboardPage[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) {
      const arr = JSON.parse(raw) as DashboardPage[]
      if (Array.isArray(arr) && arr.length > 0) return arr
    }
  } catch {
    /* 解析失败回退默认 */
  }
  return DEFAULT_DASHBOARDS
}

export function saveDashboards(pages: DashboardPage[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(pages))
}

export function resetDashboards(): DashboardPage[] {
  localStorage.removeItem(LS_KEY)
  return DEFAULT_DASHBOARDS
}

export function getDashboardByKey(key: string): DashboardPage | undefined {
  return loadDashboards().find((p) => p.key === key && p.enabled)
}

/* ============================================================
 * 菜单合并：用看板配置驱动「贷中监控」分区菜单
 * - 停用的看板从菜单隐藏；新增看板按 分组+排序 插入
 * ========================================================== */
export function mergeMidMenu(base: MenuGroup[], pages: DashboardPage[]): MenuGroup[] {
  const midPages = pages.filter((p) => p.sub === 'cr' && p.section === '贷中监控')
  const enabledKeys = new Set(midPages.filter((p) => p.enabled).map((p) => p.key))
  const allKeys = new Set(midPages.map((p) => p.key))

  // 1) 复制基础菜单：贷中监控分区里，属于看板体系的项按启用状态过滤
  const merged: MenuGroup[] = base.map((g) => ({
    ...g,
    items: g.items.filter((it) => {
      if (g.section !== '贷中监控') return true
      if (!allKeys.has(it.key)) return true // 非看板体系的项保留
      return enabledKeys.has(it.key)
    }),
  }))

  // 2) 把配置中新增（基础菜单不存在）且启用的看板插入对应分组
  const baseKeys = new Set(base.flatMap((g) => g.items.map((it) => it.key)))
  const extras = midPages
    .filter((p) => p.enabled && !baseKeys.has(p.key))
    .sort((a, b) => a.order - b.order)

  for (const p of extras) {
    const grp = merged.find((g) => g.section === '贷中监控' && g.group === p.group)
    const item = { label: p.name, key: p.key, desc: p.desc, keep: true }
    if (grp) {
      grp.items.push(item)
    } else {
      // 新分组：插到贷中监控分区末尾
      let lastMid = -1
      merged.forEach((g, i) => {
        if (g.section === '贷中监控') lastMid = i
      })
      merged.splice(lastMid + 1, 0, { group: p.group, section: '贷中监控', items: [item] })
    }
  }

  // 3) 清理因停用导致的空分组
  return merged.filter((g) => g.items.length > 0)
}
