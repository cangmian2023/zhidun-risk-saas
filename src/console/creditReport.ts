// 信用风控报告 - 数据层
// 依据对话中「三、信用风控报告设计（新增）」3.1~3.4 实现
// 评分口径：0~100 综合信用评分，越高质量越好（与信息核验「异常值」反向，概念不同，不混用）
export interface CreditApplicant {
  name: string
  id_no: string
  phone: string
  bank_card: string
  work: string
  income: string
  env: string
}

export interface RiskDimension {
  key: string
  name: string
  score: number // 0~100
  weight: number // 0~1
  logic: string
  source: string
  level: 'high' | 'mid' | 'low' // 风险等级（low=优）
}

export interface TrendPoint {
  month: string
  user: number
  industry: number
}

export interface HistoryRecord {
  apply_no: string
  time: string
  product: string
  amount: string
  score: number
  result: string
  credit_amount: string
}

export interface LogItem {
  time: string
  operator: string
  action: string
  detail: string
}

export interface CreditReport {
  report_id: string
  apply_no: string
  applicant: CreditApplicant
  // 总览
  credit_score: number // 0~100 综合信用评分
  risk_grade: string // 风险等级，如 "B级-中风险"
  risk_tags: string[]
  industry_score: number // 行业平均综合评分（参考线）
  // 六维
  dimensions: RiskDimension[]
  industry_dim: number[] // 行业平均各维分数（雷达对比）
  // 趋势
  trend: TrendPoint[]
  // 决策建议
  decision_suggestion: string // 系统建议，如 "建议人工复核"
  positive_factors: string[]
  risk_factors: string[]
  // 历史授信
  history: HistoryRecord[]
  // 操作日志
  logs: LogItem[]
  // 列表页用
  platforms_30d: number
  agencies_cnt: number
  debt_ratio: string
  decision: string // 信用结论
  status: string
}

const NAMES = ['身份真实性', '还款能力', '信用历史', '行为稳定性', '设备安全性', '关联风险']
const WEIGHTS = [0.20, 0.25, 0.25, 0.10, 0.10, 0.10]
const LOGIC = [
  '公安实名+银行卡四要素+活体检测',
  '收入、负债率、工作稳定性',
  '逾期记录、查询次数、授信历史',
  '手机号入网时长、设备使用习惯',
  'Root/越狱、设备农场、群控检测',
  '关联身份、关联设备、关联逾期',
]
const SOURCE = [
  '多源核验接口',
  '用户填报+征信数据',
  '征信报告+联防联控库',
  '运营商+设备指纹',
  '设备风险库',
  '关联图谱分析',
]
const KEYS = ['identity', 'repay', 'history', 'behavior', 'device', 'relation']

function dimSet(scores: [number, number, number, number, number, number]): RiskDimension[] {
  return scores.map((s, i) => ({
    key: KEYS[i],
    name: NAMES[i],
    score: s,
    weight: WEIGHTS[i],
    logic: LOGIC[i],
    source: SOURCE[i],
    level: s >= 75 ? 'low' : s >= 45 ? 'mid' : 'high',
  }))
}

const TREND: TrendPoint[] = [
  { month: '01月', user: 44, industry: 70 },
  { month: '02月', user: 49, industry: 71 },
  { month: '03月', user: 52, industry: 72 },
  { month: '04月', user: 50, industry: 71 },
  { month: '05月', user: 55, industry: 72 },
  { month: '06月', user: 56, industry: 72 },
  { month: '07月', user: 58, industry: 72 },
]
const INDUSTRY_DIM = [88, 70, 62, 68, 75, 60]

const BASE = {
  report_id: 'CR-RPT-20260722-001',
  applicant: {
    name: '张明',
    id_no: '3301**********1234',
    phone: '138****5678',
    bank_card: '招商银行 储蓄卡 ****8821',
    work: '某科技有限公司 · 高级工程师（在职 3 年）',
    income: '月收入 ¥38,000',
    env: 'iOS 17.4 · iPhone 14 · Wi-Fi（办公网络）· 定位杭州',
  } as CreditApplicant,
  industry_score: 72,
  industry_dim: INDUSTRY_DIM,
  trend: TREND,
  decision_suggestion: '建议人工复核',
  positive_factors: [
    '身份真实性核验通过：公安实名+银行卡四要素+活体检测一致',
    '设备环境安全，无 Root/越狱/群控特征',
    '关联风险可控，无逾期关联账户',
  ],
  risk_factors: [
    '信用历史偏弱：近 2 年有 1 次 30 天以上逾期，近 6 月机构查询 8 次',
    '设备安全性评分低（28）：近期更换设备且登录地异常波动',
    '负债收入比偏高（约 55%），还款弹性不足',
  ],
  history: [
    { apply_no: 'CR2025110001', time: '2025-11-03', product: '消费分期', amount: '¥80,000', score: 54, result: '通过', credit_amount: '¥60,000' },
    { apply_no: 'CR2026020001', time: '2026-02-18', product: '现金贷', amount: '¥50,000', score: 49, result: '通过', credit_amount: '¥30,000' },
    { apply_no: 'CR20260722001', time: '2026-07-22', product: '消费分期', amount: '¥100,000', score: 58, result: '人工复核中', credit_amount: '—' },
  ] as HistoryRecord[],
  logs: [
    { time: '2026-07-22 09:12', operator: '系统', action: '报告生成', detail: '6 维信用评分模型生成综合评分 58（B级-中风险）' },
    { time: '2026-07-22 09:13', operator: '系统', action: '核验完成', detail: '身份/设备/征信三源核验完成，3 项通过、1 项存疑' },
    { time: '2026-07-22 09:15', operator: '系统', action: '预警触发', detail: '信用历史维度 ≤40 触发中风险预警' },
    { time: '2026-07-22 09:20', operator: '风控审核员 risk01', action: '审核操作', detail: '转人工复核，待终审人员确认' },
  ] as LogItem[],
}

export const creditReports: CreditReport[] = [
  {
    ...BASE,
    apply_no: 'CR20260722001',
    credit_score: 58,
    risk_grade: 'B级-中风险',
    risk_tags: ['信用历史偏弱', '设备环境安全', '关联风险可控'],
    dimensions: dimSet([92, 65, 38, 55, 28, 48]),
    platforms_30d: 3,
    agencies_cnt: 4,
    debt_ratio: '55%',
    decision: '建议人工复核',
    status: '人工复核中',
  },
  {
    ...BASE,
    report_id: 'CR-RPT-20260601-012',
    apply_no: 'CR2026060012',
    applicant: { ...BASE.applicant, name: '李雷' },
    credit_score: 81,
    risk_grade: 'A级-低风险',
    risk_tags: ['信用历史优良', '还款能力强', '无关联风险'],
    dimensions: dimSet([95, 86, 79, 82, 76, 71]),
    platforms_30d: 1,
    agencies_cnt: 2,
    debt_ratio: '32%',
    decision: '建议通过',
    status: '已通过',
  },
  {
    ...BASE,
    report_id: 'CR-RPT-20260503-033',
    apply_no: 'CR2026050033',
    applicant: { ...BASE.applicant, name: '王芳' },
    credit_score: 35,
    risk_grade: 'D级-高风险',
    risk_tags: ['信用历史极差', '多头借贷', '共债风险高'],
    dimensions: dimSet([70, 40, 12, 38, 20, 30]),
    platforms_30d: 7,
    agencies_cnt: 9,
    debt_ratio: '78%',
    decision: '建议拒绝授信',
    status: '已拒绝',
  },
  {
    ...BASE,
    report_id: 'CR-RPT-20260402-021',
    apply_no: 'CR2026040021',
    applicant: { ...BASE.applicant, name: '赵强' },
    credit_score: 62,
    risk_grade: 'B级-中风险',
    risk_tags: ['信用历史中等', '负债偏高', '关联风险可控'],
    dimensions: dimSet([88, 70, 45, 60, 35, 52]),
    platforms_30d: 4,
    agencies_cnt: 5,
    debt_ratio: '60%',
    decision: '建议人工复核',
    status: '人工复核中',
  },
  {
    ...BASE,
    report_id: 'CR-RPT-20260305-055',
    apply_no: 'CR2026030055',
    applicant: { ...BASE.applicant, name: '陈静' },
    credit_score: 74,
    risk_grade: 'A级-低风险',
    risk_tags: ['信用历史良好', '还款能力稳定', '设备环境安全'],
    dimensions: dimSet([90, 80, 70, 75, 68, 66]),
    platforms_30d: 2,
    agencies_cnt: 3,
    debt_ratio: '41%',
    decision: '建议通过',
    status: '已通过',
  },
  {
    ...BASE,
    report_id: 'CR-RPT-20260208-088',
    apply_no: 'CR2026020088',
    applicant: { ...BASE.applicant, name: '刘洋' },
    credit_score: 47,
    risk_grade: 'C级-中高风险',
    risk_tags: ['信用历史偏弱', '多头借贷', '设备环境存疑'],
    dimensions: dimSet([78, 52, 30, 50, 22, 42]),
    platforms_30d: 6,
    agencies_cnt: 7,
    debt_ratio: '66%',
    decision: '建议人工复核',
    status: '退回补充材料',
  },
]

export function getCreditReport(applyNo?: string | null): CreditReport {
  return creditReports.find((r) => r.apply_no === applyNo) ?? creditReports[0]
}

// 列表行（供 cr:pre-credit 列表页使用，保持导出兼容）
export interface CreditRow {
  apply_no: string
  name: string
  platforms: number
  agencies: number
  debt_ratio: string
  decision: string
  status: string
}

export const creditRows: CreditRow[] = creditReports.map((r) => ({
  apply_no: r.apply_no,
  name: r.applicant.name,
  platforms: r.platforms_30d,
  agencies: r.agencies_cnt,
  debt_ratio: r.debt_ratio,
  decision: r.decision,
  status: r.status,
}))

// 结论/状态 -> 徽标配色
export function conclKind(text: string): 'green' | 'red' | 'amber' | 'blue' | 'gray' {
  if (text.includes('拒绝')) return 'red'
  if (text.includes('通过')) return 'green'
  if (text.includes('人工复核')) return 'blue'
  if (text.includes('退回')) return 'blue'
  return 'gray'
}
