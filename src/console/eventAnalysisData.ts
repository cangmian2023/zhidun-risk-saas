// 事件分析 · 种子数据（还原 sensors/visual/2.1 事件分析.html）
// 规则②：本文件仅提供 SEED，运行期数据落 src/console/eventAnalysis.json，经 /api/load-mid?file= 读写
// 真值锚点：分组「[未知] / 10.130.14.3」的 A=4,819、B=0 与静态页完全一致；
//           其余分组为演示「前 N 项 / 降序 / 图表」而补充的样例数据，页面上以 Sam 橙标标注。

/* ---------- 类型 ---------- */
export type EaGranularity = 'minute' | 'hour' | 'day' | 'week' | 'month';

export interface EaEventItem {
  id: string;        // A / B / C ...
  event: string;     // 事件名，如「点击注册按钮」
  metric: string;    // 指标，如「总次数」
  color: string;     // 图表配色
  filterHint?: string; // 事件级筛选摘要（空表示未设置）
}

export interface EaFilterCond {
  id: string;
  prop: string;      // 属性名
  op: string;        // 运算符
  values: string[];  // 取值（多选）
}

export interface EaGroupItem {
  id: string;
  prop: string;      // 分组属性，如「IP」
}

export interface EaGroupRow {
  id: string;
  country: string;
  ip: string;
  totals: Record<string, number>;                       // eventId -> 合计
  series: Record<EaGranularity | string, Record<string, number[]>>; // 粒度 -> eventId -> 各时间点值
}

/* ---------- 顶部摘要（静态页真值） ---------- */
export const EA_UPDATED_AT = '8-6 10:24:05';
export const EA_SUBJECT = '用户 ID (默认)';
export const EA_TIMEZONE = 'UTC-03:00';
export const EA_SUMMARY_CFG = '快速总和';

/* ---------- 事件选择（静态页真值：A / B 两条） ---------- */
export const SEED_EA_EVENTS: EaEventItem[] = [
  { id: 'A', event: '点击注册按钮', metric: '总次数', color: '#2563eb' },
  { id: 'B', event: '提交订单详情', metric: '总次数', color: '#f59e0b' },
];

/* ---------- 下拉选项（全部取自静态页） ---------- */
export const OPT_EA_METRIC = ['总次数', '用户数', '人均次数', '预定义指标', '自定义指标'];
export const OPT_EA_EVENT = [
  '点击注册按钮', '提交订单详情', '$启动时长', '分享时的层级',
  '屏幕宽度，例如1080', '屏幕高度，例如1920', '视区宽度', '视区距顶部的位置',
  '视区高度', '[虚拟]事件发生次数',
];
export const OPT_EA_PROP = ['国家', 'IP', '最近一次站外地址', '屏幕宽度，例如1080', '视区高度', '$启动时长'];
export const OPT_EA_OP = ['等于', '不等于', '小于'];
export const OPT_EA_VALUE = ['中国', '美国', '日本', 'url的domain解析失败'];
export const OPT_EA_GROUP_PROP = ['IP', '国家', '最近一次站外地址'];
export const OPT_EA_SUBJECT = ['用户 ID (默认)', '设备 ID', '账号 ID'];
export const OPT_EA_TIMEZONE = ['UTC-03:00', 'UTC+08:00', 'UTC+00:00'];
export const OPT_EA_SUMMARY = ['快速总和', '精确去重', '近似去重'];
export const OPT_EA_TOPN = [5, 10, 15, 20, 25, 30, 50];

/* ---------- 全局筛选（静态页真值：2 条，关系「且」） ---------- */
export const SEED_EA_FILTERS: EaFilterCond[] = [
  { id: 'f1', prop: '国家', op: '等于', values: ['中国', '美国', '日本'] },
  { id: 'f2', prop: '最近一次站外地址', op: '不等于', values: ['url的domain解析失败'] },
];
export const SEED_EA_FILTER_REL: '且' | '或' = '且';

/* ---------- 分组选择（静态页真值：IP） ---------- */
export const SEED_EA_GROUPS: EaGroupItem[] = [{ id: 'gp1', prop: 'IP' }];

/* ---------- 时间粒度 ---------- */
export const EA_GRANULARITY: { value: EaGranularity; label: string }[] = [
  { value: 'minute', label: '按分钟' },
  { value: 'hour', label: '按小时' },
  { value: 'day', label: '按天' },
  { value: 'week', label: '按周' },
  { value: 'month', label: '按月' },
];

export const EA_LABELS: Record<string, string[]> = {
  week: ['08-03 (当周)'],
  day: ['07-31', '08-01', '08-02', '08-03', '08-04', '08-05', '08-06'],
  hour: ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'],
  month: ['2026-06', '2026-07', '2026-08'],
  minute: ['10:00', '10:01', '10:02', '10:03', '10:04', '10:05'],
};

/* ---------- 分组明细数据 ---------- */
export const SEED_EA_ROWS: EaGroupRow[] = [
  {
    id: 'g1',
    country: '[未知]',
    ip: '10.130.14.3',
    totals: { A: 4819, B: 0 },
    series: {
      week: { A: [4819], B: [0] },
      day: { A: [612, 704, 670, 742, 689, 723, 679], B: [0, 0, 0, 0, 0, 0, 0] },
      hour: { A: [212, 169, 395, 814, 737, 906, 887, 699], B: [0, 0, 0, 0, 0, 0, 0, 0] },
      month: { A: [1494, 1638, 1687], B: [0, 0, 0] },
      minute: { A: [22, 17, 23, 19, 20, 19], B: [0, 0, 0, 0, 0, 0] },
    },
  },
  {
    id: 'g2',
    country: '中国',
    ip: '172.16.3.21',
    totals: { A: 3204, B: 126 },
    series: {
      week: { A: [3204], B: [126] },
      day: { A: [407, 468, 445, 493, 458, 481, 452], B: [16, 18, 18, 19, 18, 19, 18] },
      hour: { A: [141, 112, 263, 541, 490, 602, 590, 465], B: [6, 5, 10, 21, 19, 24, 23, 18] },
      month: { A: [993, 1089, 1122], B: [39, 43, 44] },
      minute: { A: [14, 11, 15, 13, 14, 13], B: [1, 0, 1, 0, 1, 0] },
    },
  },
  {
    id: 'g3',
    country: '美国',
    ip: '10.42.7.88',
    totals: { A: 2571, B: 88 },
    series: {
      week: { A: [2571], B: [88] },
      day: { A: [327, 375, 357, 396, 368, 386, 362], B: [11, 13, 12, 14, 13, 13, 12] },
      hour: { A: [113, 90, 211, 435, 393, 483, 473, 373], B: [4, 3, 7, 15, 13, 17, 16, 13] },
      month: { A: [797, 874, 900], B: [27, 30, 31] },
      minute: { A: [12, 9, 12, 10, 11, 10], B: [1, 0, 1, 0, 0, 0] },
    },
  },
  {
    id: 'g4',
    country: '日本',
    ip: '10.88.21.5',
    totals: { A: 1466, B: 41 },
    series: {
      week: { A: [1466], B: [41] },
      day: { A: [186, 214, 204, 226, 209, 220, 207], B: [5, 6, 6, 6, 6, 6, 6] },
      hour: { A: [64, 51, 120, 248, 224, 276, 270, 213], B: [2, 1, 3, 7, 6, 8, 8, 6] },
      month: { A: [455, 498, 513], B: [13, 14, 14] },
      minute: { A: [6, 5, 7, 6, 6, 6], B: [0, 0, 1, 0, 0, 0] },
    },
  },
  {
    id: 'g5',
    country: '中国',
    ip: '192.168.11.7',
    totals: { A: 982, B: 17 },
    series: {
      week: { A: [982], B: [17] },
      day: { A: [125, 143, 137, 151, 140, 147, 139], B: [2, 3, 2, 3, 2, 3, 2] },
      hour: { A: [43, 34, 81, 166, 150, 185, 181, 142], B: [1, 1, 1, 3, 3, 3, 3, 2] },
      month: { A: [304, 334, 344], B: [5, 6, 6] },
      minute: { A: [4, 3, 5, 4, 4, 4], B: [0, 0, 0, 0, 0, 0] },
    },
  },
  {
    id: 'g6',
    country: '美国',
    ip: '10.7.55.90',
    totals: { A: 634, B: 9 },
    series: {
      week: { A: [634], B: [9] },
      day: { A: [80, 93, 88, 98, 91, 95, 89], B: [1, 1, 1, 2, 1, 2, 1] },
      hour: { A: [28, 22, 52, 107, 97, 119, 117, 92], B: [0, 0, 1, 2, 1, 2, 2, 1] },
      month: { A: [196, 216, 222], B: [3, 3, 3] },
      minute: { A: [3, 2, 3, 2, 3, 2], B: [0, 0, 0, 0, 0, 0] },
    },
  },
];
