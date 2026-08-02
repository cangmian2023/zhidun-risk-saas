// 决策报告（贷前审核综合决策）数据模块
// 内容对齐 doc/贷前审核-决策报告功能设计.md
// 设计意图：决策报告由「信息核验 / 信用风控 / 欺诈识别」三套子系统汇聚，
// 经决策引擎加权计算「决策评分(0-100，越高=通过优先)」，输出「决策建议」与「建议授信额度」。

export type DecisionSuggestion = '优先通过' | '通过' | '限制额度' | '严格限制' | '拒绝'
export type ApprovalStatus =
  | '待审批'
  | '审批中'
  | '已通过'
  | '已拒绝'
  | '已退回'
  | '已提交双人复核'
export type InfoResult = '通过' | '预警' | '拒绝'
export type CreditGrade = 'AAA' | 'AA' | 'A' | 'B' | 'C' | 'D'
export type FraudResult = '未发现' | '疑似风险' | '命中欺诈'

// 自动审核结果（决策引擎自动结论，与决策建议同源）
export type AutoReview = '处理中' | '通过' | '拒绝' | '预警'
// 人工审核状态机（审批流转各环节）
export type ManualReview =
  | '核验计算中'   // 报告刚生成，等待人工介入
  | '待确认'       // 待初审确认
  | '已确认'       // 初审已确认放行
  | '初审拒贷'     // 初审拒贷
  | '强制放行'     // 经强制复审后放行
  | '待审核'       // 预警类，待提交双人复核
  | '提交复核'     // 已提交双人复核
  | '复核通过'     // 双人复核通过
  | '复核拒绝'     // 双人复核拒绝 - 拒绝办结
  | '加入黑名单'   // 拒绝并加入黑名单

// 决策评分 -> 决策建议（规则3：分数越高越优先通过）
export function suggestionOfScore(score: number): DecisionSuggestion {
  if (score >= 80) return '优先通过'
  if (score >= 60) return '通过'
  if (score >= 40) return '限制额度'
  if (score >= 20) return '严格限制'
  return '拒绝'
}

// 决策建议 -> 自动审核结果（同源：优先通过/通过→通过，限制额度→预警，严格限制/拒绝→拒绝）
export function autoReviewOf(s: DecisionSuggestion): AutoReview {
  if (s === '优先通过' || s === '通过') return '通过'
  if (s === '限制额度') return '预警'
  return '拒绝'
}

export const suggestionKind: Record<DecisionSuggestion, 'green' | 'amber' | 'orange' | 'red'> = {
  优先通过: 'green',
  通过: 'green',
  限制额度: 'amber',
  严格限制: 'orange',
  拒绝: 'red',
}

export const approvalKind: Record<ApprovalStatus, 'gray' | 'amber' | 'blue' | 'green' | 'red' | 'orange'> = {
  待审批: 'gray',
  审批中: 'amber',
  已通过: 'green',
  已拒绝: 'red',
  已退回: 'orange',
  已提交双人复核: 'blue',
}

export const autoReviewKind: Record<AutoReview, 'green' | 'amber' | 'red' | 'blue'> = {
  处理中: 'blue',
  通过: 'green',
  拒绝: 'red',
  预警: 'amber',
}

// 人工审核状态：处理/待办→蓝灰，确认放行→绿，拒贷/黑名单/复核拒绝→红，待确认/待审核→琥珀，提交复核→蓝
export const manualReviewKind: Record<ManualReview, 'green' | 'amber' | 'red' | 'blue' | 'orange'> = {
  核验计算中: 'blue',
  待确认: 'amber',
  已确认: 'green',
  初审拒贷: 'red',
  强制放行: 'green',
  待审核: 'amber',
  提交复核: 'blue',
  复核通过: 'green',
  复核拒绝: 'red',
  加入黑名单: 'red',
}

export const infoKind: Record<InfoResult, 'green' | 'amber' | 'red'> = {
  通过: 'green',
  预警: 'amber',
  拒绝: 'red',
}

export const gradeKind: Record<CreditGrade, 'green' | 'cyan' | 'blue' | 'amber' | 'red'> = {
  AAA: 'green',
  AA: 'green',
  A: 'cyan',
  B: 'blue',
  C: 'amber',
  D: 'red',
}

export const fraudKind: Record<FraudResult, 'green' | 'amber' | 'red'> = {
  未发现: 'green',
  疑似风险: 'amber',
  命中欺诈: 'red',
}

// 风险等级（列表/筛选统一用文字档位，对齐文档 3.4 / 3.3）
export type RiskLevel = '低风险' | '中风险' | '高风险' | '极高风险'
export const creditRiskLevel: Record<CreditGrade, RiskLevel> = {
  AAA: '低风险',
  AA: '低风险',
  A: '中风险',
  B: '中风险',
  C: '高风险',
  D: '极高风险',
}
export const fraudRiskLevel: Record<FraudResult, RiskLevel> = {
  未发现: '低风险',
  疑似风险: '高风险',
  命中欺诈: '极高风险',
}
export const riskKind: Record<RiskLevel, 'green' | 'cyan' | 'amber' | 'red'> = {
  低风险: 'green',
  中风险: 'cyan',
  高风险: 'amber',
  极高风险: 'red',
}

// ============================ 列表行 ============================
export interface DecisionRow {
  id: string // 决策编号 DEC...
  appId: string // 申请编号 APP...
  name: string
  product: string
  channel: string
  amount: number // 申请额度
  decisionScore: number // 决策评分 0-100
  suggestion: DecisionSuggestion // 决策建议
  approvedAmount: number // 建议授信额度
  infoResult: InfoResult // 信息核验结果
  creditGrade: CreditGrade // 信用风险等级
  fraudResult: FraudResult // 欺诈风险等级
  approvalStatus: ApprovalStatus // 审批状态（保留字段，详情/旧流程使用）
  autoReview: AutoReview // 自动审核结果（决策引擎自动结论）
  manualReview: ManualReview // 人工审核状态机
  operator: string // 审核人（— / 初审：审核员 1 / 初审：审核员 1；终审：主管 1）
  auditTime: string // 决策时间
  templateId: string // 报告模板
  infoCreditScore: number // 信息核验真实性得分 0-100（越高越好）
}

// 信用评分（0-900 体系，越高越好）
function creditScore900(g: CreditGrade): number {
  return { AAA: 880, AA: 820, A: 680, B: 520, C: 420, D: 300 }[g]
}
// 欺诈分（0-100，越高越坏）
function fraudRawScore(f: FraudResult): number {
  return { 未发现: 10, 疑似风险: 88, 命中欺诈: 95 }[f]
}
function computeApproved(amount: number, s: DecisionSuggestion, grade: CreditGrade): number {
  if (s === '拒绝') return 0
  if (s === '严格限制') return Math.round(amount * 0.3)
  if (s === '限制额度') return Math.round(amount * 0.6)
  const factor: Record<CreditGrade, number> = { AAA: 1, AA: 1, A: 0.9, B: 0.7, C: 0.5, D: 0 }
  return Math.round(amount * factor[grade])
}

// 统一构造：用文档决策引擎公式（信息核验30% + 信用风控40% + 欺诈识别30%）
// 保证 决策评分 / 决策建议 / 建议授信额度 内部自洽，且列表与详情计算一致。
function mk(
  p: Omit<DecisionRow, 'decisionScore' | 'suggestion' | 'approvedAmount' | 'autoReview'> & { autoReview?: AutoReview },
): DecisionRow {
  const creditNorm = +(creditScore900(p.creditGrade) / 900 * 100).toFixed(1)
  const fraudSafety = 100 - fraudRawScore(p.fraudResult)
  const decisionScore = Math.round(0.3 * p.infoCreditScore + 0.4 * creditNorm + 0.3 * fraudSafety)
  const suggestion = suggestionOfScore(decisionScore)
  const approvedAmount = computeApproved(p.amount, suggestion, p.creditGrade)
  const autoReview = p.autoReview ?? autoReviewOf(suggestion)
  return { ...p, decisionScore, suggestion, approvedAmount, autoReview }
}

export const seedDecisionRows: DecisionRow[] = [
  mk({
    id: 'DEC20260518-0001', appId: 'APP20260518-0001', name: '张伟', product: '信用贷', channel: 'APP',
    amount: 200000, infoResult: '通过', creditGrade: 'AAA', fraudResult: '未发现',
    approvalStatus: '已通过', manualReview: '已确认', operator: '初审：审核员 1', auditTime: '2026-05-18 09:41', templateId: 'tpl-standard',
    infoCreditScore: 96,
  }),
  mk({
    id: 'DEC20260518-0002', appId: 'APP20260518-0002', name: '王芳', product: '信用贷', channel: 'H5',
    amount: 150000, infoResult: '预警', creditGrade: 'B', fraudResult: '疑似风险',
    approvalStatus: '审批中', manualReview: '提交复核', operator: '初审：审核员 1', auditTime: '2026-05-18 10:12', templateId: 'tpl-standard',
    infoCreditScore: 58,
  }),
  mk({
    id: 'DEC20260518-0003', appId: 'APP20260518-0003', name: '刘强', product: '抵押贷', channel: '柜台',
    amount: 500000, infoResult: '通过', creditGrade: 'AA', fraudResult: '未发现',
    approvalStatus: '已提交双人复核', manualReview: '提交复核', operator: '赵敏', auditTime: '2026-05-18 11:03', templateId: 'tpl-mortgage',
    infoCreditScore: 90,
  }),
  mk({
    id: 'DEC20260518-0004', appId: 'APP20260518-0004', name: '陈静', product: '信用贷', channel: 'APP',
    amount: 80000, infoResult: '通过', creditGrade: 'A', fraudResult: '未发现',
    approvalStatus: '待审批', manualReview: '待确认', operator: '—', auditTime: '2026-05-18 13:27', templateId: 'tpl-standard',
    infoCreditScore: 88,
  }),
  mk({
    id: 'DEC20260518-0005', appId: 'APP20260518-0005', name: '杨洋', product: '消费贷', channel: 'H5',
    amount: 120000, infoResult: '拒绝', creditGrade: 'D', fraudResult: '命中欺诈',
    approvalStatus: '已拒绝', manualReview: '强制放行', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-05-18 14:50', templateId: 'tpl-standard',
    infoCreditScore: 20,
  }),
  mk({
    id: 'DEC20260518-0006', appId: 'APP20260518-0006', name: '赵磊', product: '信用贷', channel: 'APP',
    amount: 300000, infoResult: '通过', creditGrade: 'A', fraudResult: '未发现',
    approvalStatus: '已通过', manualReview: '已确认', operator: '初审：审核员 1', auditTime: '2026-05-18 15:36', templateId: 'tpl-standard',
    infoCreditScore: 82,
  }),
  mk({
    id: 'DEC20260519-0001', appId: 'APP20260519-0001', name: '孙浩', product: '经营贷', channel: '柜台',
    amount: 800000, infoResult: '通过', creditGrade: 'AA', fraudResult: '未发现',
    approvalStatus: '审批中', manualReview: '已确认', operator: '赵敏', auditTime: '2026-05-19 09:08', templateId: 'tpl-mortgage',
    infoCreditScore: 91,
  }),
  mk({
    id: 'DEC20260519-0002', appId: 'APP20260519-0002', name: '周婷', product: '信用贷', channel: 'H5',
    amount: 100000, infoResult: '预警', creditGrade: 'B', fraudResult: '未发现',
    approvalStatus: '待审批', manualReview: '待确认', operator: '—', auditTime: '2026-05-19 10:22', templateId: 'tpl-standard',
    infoCreditScore: 64,
  }),
  mk({
    id: 'DEC20260519-0003', appId: 'APP20260519-0003', name: '吴勇', product: '信用贷', channel: 'APP',
    amount: 60000, infoResult: '通过', creditGrade: 'A', fraudResult: '疑似风险',
    approvalStatus: '已退回', manualReview: '复核拒绝', operator: '李娜', auditTime: '2026-05-19 11:45', templateId: 'tpl-standard',
    infoCreditScore: 78,
  }),
  mk({
    id: 'DEC20260519-0004', appId: 'APP20260519-0004', name: '郑爽', product: '抵押贷', channel: '柜台',
    amount: 1200000, infoResult: '通过', creditGrade: 'AAA', fraudResult: '未发现',
    approvalStatus: '已提交双人复核', manualReview: '提交复核', operator: '赵敏', auditTime: '2026-05-19 14:13', templateId: 'tpl-mortgage',
    infoCreditScore: 94,
  }),
  mk({
    id: 'DEC20260519-0005', appId: 'APP20260519-0005', name: '冯雷', product: '消费贷', channel: 'H5',
    amount: 50000, infoResult: '预警', creditGrade: 'C', fraudResult: '疑似风险',
    approvalStatus: '审批中', manualReview: '提交复核', operator: '李娜', auditTime: '2026-05-19 15:30', templateId: 'tpl-standard',
    infoCreditScore: 48,
  }),
  mk({
    id: 'DEC20260519-0006', appId: 'APP20260519-0006', name: '蒋欣', product: '信用贷', channel: 'APP',
    amount: 180000, infoResult: '通过', creditGrade: 'AA', fraudResult: '未发现',
    approvalStatus: '待审批', manualReview: '已确认', operator: '初审：审核员 1', auditTime: '2026-05-19 16:48', templateId: 'tpl-standard',
    infoCreditScore: 86,
  }),
  // 以下样例用于覆盖「拒绝 / 复核拒绝 / 处理中」等状态
  mk({
    id: 'DEC20260520-0001', appId: 'APP20260520-0001', name: '黄伟', product: '信用贷', channel: 'APP',
    amount: 60000, infoResult: '拒绝', creditGrade: 'D', fraudResult: '命中欺诈',
    approvalStatus: '已拒绝', manualReview: '加入黑名单', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-05-20 09:20', templateId: 'tpl-standard',
    infoCreditScore: 10,
  }),
  mk({
    id: 'DEC20260520-0002', appId: 'APP20260520-0002', name: '徐丽', product: '消费贷', channel: 'H5',
    amount: 90000, infoResult: '预警', creditGrade: 'C', fraudResult: '疑似风险',
    approvalStatus: '已退回', manualReview: '复核拒绝', operator: '初审：审核员 1；终审：主管 1', auditTime: '2026-05-20 10:05', templateId: 'tpl-standard',
    infoCreditScore: 40,
  }),
  mk({
    id: 'DEC20260520-0003', appId: 'APP20260520-0003', name: '钱多', product: '信用贷', channel: 'APP',
    amount: 100000, infoResult: '通过', creditGrade: 'AA', fraudResult: '未发现',
    approvalStatus: '待审批', manualReview: '核验计算中', operator: '—', auditTime: '2026-05-20 10:40', templateId: 'tpl-standard',
    infoCreditScore: 88,
    autoReview: '处理中',
  }),
]

// ============================ 详情 ============================
export interface InfoVerifySum {
  result: InfoResult
  creditScore: number // 信息核验真实性得分 0-100（越高越是真实，越低越异常）
  hitRules: string[]
  conclusion: string
  keyAnomaly: string // 关键异常项
  passed: string // 核验通过项
}
export interface CreditSum {
  grade: CreditGrade
  riskScore: number
  overdueRate: string
  conclusion: string
}
export interface FraudSum {
  result: FraudResult
  hitRules: string[]
  conclusion: string
}
export interface EngineFactor {
  name: string
  weight: number
  score: number
  note: string
}
export interface DecisionEngineOut {
  decisionScore: number
  suggestion: DecisionSuggestion
  approvedAmount: number
  factors: EngineFactor[]
  summary: string
}

// 决策评分计算过程行
export interface EngineCalcRow {
  name: string
  raw: string // 原始评分
  converted: string // 统一转换
  weight: number
  weighted: number // 加权得分
  note: string
}
// 信用六大维度
export interface CreditDimension {
  name: string
  score: number
  level: RiskLevel
  note: string
}
// 三子系统结果摘要卡片
export interface SubSystemCard {
  name: string
  result: string
  scoreText: string // 评分/异常值
  riskLevel: RiskLevel | '--' // 风险等级（信息核验为 '--'）
  statusText: string
  statusTone: 'ok' | 'alert' | 'normal'
}
// 授信方案对比
export interface PlanCompareRow {
  plan: string
  amount: string
  rate: string
  term: string
  cond: string
}
// 审批表单字段
export interface AuditFormField {
  field: string
  type: string
  required: string
  desc: string
}
export interface DecisionAdvice {
  type: '同意' | '不同意' | '补充材料' | '双人复核' | '转人工'
  reason: string
}
export interface DecisionOpLog {
  time: string
  operator: string
  action: string
  detail: string
}
export interface DecisionDetailData {
  row: DecisionRow
  info: InfoVerifySum
  credit: CreditSum
  fraud: FraudSum
  engine: DecisionEngineOut
  calcRows: EngineCalcRow[]
  calcTotal: number
  subCards: SubSystemCard[]
  advice: DecisionAdvice[]
  logs: DecisionOpLog[]
  templateId: string
  templateName: string
  reportTime: string // 报告生成时间（报告名称生成用）
  // 第1段：决策总览
  suggestedRate: string // 建议利率
  reviewAdvice: string // 人工复核建议
  basisSummary: string // 决策依据摘要
  // 第3段：授信方案
  approvedTerm: string // 建议期限
  repaymentMethod: string // 还款方式
  limitReason: string // 额度限制原因
  planCompare: PlanCompareRow[]
  // 第4段：信息核验摘要
  infoKeyAnomaly: string
  infoPassed: string
  // 第5段：信用风控摘要
  creditScore900v: number
  creditDimensions: CreditDimension[]
  // 第6段：欺诈识别摘要
  fraudScoreRaw: number
  fraudHitCount: string
  fraudKeyRules: string[]
  fraudGroupTag: string
  // 第2段：审批操作
  auditFormFields: AuditFormField[]
}

function infoSum(r: DecisionRow): InfoVerifySum {
  const map: Record<InfoResult, { hit: string[]; conclusion: string; keyAnomaly: string; passed: string }> = {
    通过: { hit: [], conclusion: '信息核验无风险证据，真实性良好。', keyAnomaly: '无', passed: '公安实名核验通过、银行卡四要素通过、活体检测通过' },
    预警: { hit: ['R2 设备与常用设备不一致', 'R5 通讯录命中中介名单'], conclusion: '存在轻度信息异常，需人工核实。', keyAnomaly: '手机号入网仅21天（不足30天）', passed: '公安实名核验通过、银行卡四要素通过' },
    拒绝: { hit: ['R1 命中黑名单', 'R3 证件号多地申请'], conclusion: '命中硬性拒绝规则，直接拒贷。', keyAnomaly: '证件号多地申请、命中黑名单', passed: '—' },
  }
  return {
    result: r.infoResult,
    creditScore: r.infoResult === '通过' ? r.infoCreditScore : r.infoResult === '预警' ? 58 : 18,
    hitRules: map[r.infoResult].hit,
    conclusion: map[r.infoResult].conclusion,
    keyAnomaly: map[r.infoResult].keyAnomaly,
    passed: map[r.infoResult].passed,
  }
}
function creditSum(r: DecisionRow): CreditSum {
  const map: Record<CreditGrade, { risk: number; od: string; conclusion: string }> = {
    AAA: { risk: 8, od: '0.00%', conclusion: '信用极优，历史零逾期。' },
    AA: { risk: 14, od: '0.12%', conclusion: '信用优良，逾期率极低。' },
    A: { risk: 26, od: '0.85%', conclusion: '信用良好，偶发短期逾期。' },
    B: { risk: 42, od: '2.30%', conclusion: '信用一般，需关注负债比。' },
    C: { risk: 63, od: '5.10%', conclusion: '信用偏弱，存在多头借贷。' },
    D: { risk: 88, od: '12.40%', conclusion: '信用较差，历史严重逾期。' },
  }
  return { grade: r.creditGrade, riskScore: map[r.creditGrade].risk, overdueRate: map[r.creditGrade].od, conclusion: map[r.creditGrade].conclusion }
}
function fraudSum(r: DecisionRow): FraudSum {
  const map: Record<FraudResult, { hit: string[]; conclusion: string }> = {
    未发现: { hit: [], conclusion: '未命中任何欺诈规则与团伙库。' },
    疑似风险: { hit: ['F4 设备聚集', 'F7 夜间高频申请'], conclusion: '命中疑似风险规则，建议加强核验。' },
    命中欺诈: { hit: ['F1 命中欺诈黑库', 'F9 中介包装'], conclusion: '命中欺诈规则，直接拒贷并标记。' },
  }
  return { result: r.fraudResult, hitRules: map[r.fraudResult].hit, conclusion: map[r.fraudResult].conclusion }
}

const dimMap: Record<CreditGrade, [number, number, number, number, number, number]> = {
  AAA: [92, 80, 95, 88, 90, 85],
  AA: [88, 72, 82, 80, 82, 78],
  A: [84, 65, 70, 60, 68, 62],
  B: [70, 55, 45, 52, 45, 48],
  C: [60, 45, 38, 45, 35, 40],
  D: [40, 30, 20, 28, 18, 25],
}
const dimNames = ['身份真实性', '还款能力', '信用历史', '行为稳定性', '设备安全性', '关联风险']
const dimLevel = (s: number): RiskLevel => (s >= 75 ? '低风险' : s >= 55 ? '中风险' : '高风险')
const dimNote = (s: number): string => (s >= 75 ? '良好' : s >= 55 ? '一般' : '差')

export function getDecisionDetail(id: string): DecisionDetailData | null {
  const row = seedDecisionRows.find((r) => r.id === id)
  if (!row) return null
  const info = infoSum(row)
  const credit = creditSum(row)
  const fraud = fraudSum(row)

  // 决策引擎：统一转换 + 加权
  const creditNorm = +((creditScore900(row.creditGrade) / 900) * 100).toFixed(1)
  const fraudSafety = 100 - fraudRawScore(row.fraudResult)
  const calcRows: EngineCalcRow[] = [
    { name: '信息核验', raw: `真实性得分 ${row.infoCreditScore}`, converted: String(row.infoCreditScore), weight: 0.3, weighted: +(0.3 * row.infoCreditScore).toFixed(1), note: '真实性越高越好' },
    { name: '信用风控', raw: `信用评分 ${creditScore900(row.creditGrade)}`, converted: String(creditNorm), weight: 0.4, weighted: +(0.4 * creditNorm).toFixed(2), note: '信用评分归一化（/900×100）' },
    { name: '欺诈识别', raw: `欺诈分 ${fraudRawScore(row.fraudResult)}`, converted: String(fraudSafety), weight: 0.3, weighted: +(0.3 * fraudSafety).toFixed(1), note: '欺诈分转为安全分（100-欺诈分）' },
  ]
  const calcTotal = +calcRows.reduce((s, r) => s + r.weighted, 0).toFixed(2)

  const decisionScore = row.decisionScore
  const engine: DecisionEngineOut = {
    decisionScore,
    suggestion: row.suggestion,
    approvedAmount: row.approvedAmount,
    factors: calcRows.map((c) => ({ name: c.name, weight: c.weight, score: Number(c.converted), note: c.note })),
    summary: `决策引擎综合三套子系统输出，加权得到决策评分 ${decisionScore}（满分 100，越高越优先通过），对应决策建议「${row.suggestion}」，建议授信额度 ¥${row.approvedAmount.toLocaleString()}。`,
  }

  const subCards: SubSystemCard[] = [
    {
      name: '信息核验', result: info.result, scoreText: `信息核验得分 ${info.creditScore}`, riskLevel: '--',
      statusText: info.result === '通过' ? '✅ 正常' : info.result === '预警' ? '⚠️ 异常' : '🔴 拒绝',
      statusTone: info.result === '通过' ? 'ok' : 'alert',
    },
    {
      name: '信用风控', result: credit.grade, scoreText: `信用评分 ${creditScore900(row.creditGrade)}`, riskLevel: creditRiskLevel[row.creditGrade],
      statusText: `🔴 ${creditRiskLevel[row.creditGrade]}`, statusTone: 'alert',
    },
    {
      name: '欺诈识别', result: fraud.result, scoreText: `欺诈评分 ${fraudRawScore(row.fraudResult)}`, riskLevel: fraudRiskLevel[row.fraudResult],
      statusText: `🔴 ${fraudRiskLevel[row.fraudResult]}`, statusTone: 'alert',
    },
  ]

  // 第1段
  const suggestedRate = row.suggestion === '拒绝' ? '—' : row.suggestion === '限制额度' || row.suggestion === '严格限制' ? '基准利率+15%' : '基准利率+10%'
  const reviewAdvice =
    row.suggestion === '拒绝' || row.fraudResult === '命中欺诈' || row.suggestion === '限制额度' || row.suggestion === '严格限制' || row.infoResult === '预警'
      ? '必须人工复核'
      : '建议人工复核'
  const basisSummary = `信用评分${creditScore900(row.creditGrade)}（${creditRiskLevel[row.creditGrade]}）+ 欺诈评分${fraudRawScore(row.fraudResult)}（${fraudRiskLevel[row.fraudResult]}）`

  // 第3段
  const approvedTerm = '12个月'
  const repaymentMethod = '等额本息'
  const limitParts: string[] = []
  if (row.creditGrade === 'C' || row.creditGrade === 'D') limitParts.push('信用历史差')
  if (row.fraudResult === '命中欺诈' || row.fraudResult === '疑似风险') limitParts.push('疑似团伙关联')
  if (info.creditScore < 70) limitParts.push('设备异常/信息存疑')
  const limitReason = limitParts.length ? limitParts.join('、') : '风险可控'
  const planCompare: PlanCompareRow[] = [
    { plan: '方案A（系统建议）', amount: `¥${row.approvedAmount.toLocaleString()}`, rate: suggestedRate, term: approvedTerm, cond: `当前决策评分${decisionScore}分` },
    { plan: '方案B（保守）', amount: `¥${Math.round(row.approvedAmount * 0.66).toLocaleString()}`, rate: '基准利率+15%', term: approvedTerm, cond: '如风险进一步上升' },
    { plan: '方案C（拒绝）', amount: '—', rate: '—', term: '—', cond: '如人工确认风险过高' },
  ]

  // 第4段
  const infoKeyAnomaly = info.keyAnomaly
  const infoPassed = info.passed

  // 第5段
  const creditScore900v = creditScore900(row.creditGrade)
  const creditDimensions: CreditDimension[] = dimNames.map((n, i) => {
    const s = dimMap[row.creditGrade][i]
    return { name: n, score: s, level: dimLevel(s), note: dimNote(s) }
  })

  // 第6段
  const fraudHitCount = row.fraudResult === '命中欺诈' ? '12/18' : row.fraudResult === '疑似风险' ? '5/18' : '0/18'
  const fraudKeyRules = fraud.hitRules.length ? fraud.hitRules : ['无命中规则']
  const fraudGroupTag = row.fraudResult === '命中欺诈' ? '团伙A' : row.fraudResult === '疑似风险' ? '疑似团伙B' : '无'

  // 第2段
  const auditFormFields: AuditFormField[] = [
    { field: '审批结论', type: '单选', required: '是', desc: '通过/拒绝/调整额度/转人工/退回' },
    { field: '授信额度', type: '数字输入', required: '条件必填', desc: '审批结论为"通过"或"调整额度"时必填' },
    { field: '利率浮动', type: '下拉选择', required: '条件必填', desc: '审批结论为"通过"或"调整利率"时必填' },
    { field: '审批意见', type: '文本域', required: '是', desc: '详细审批说明' },
    { field: '风险关注点', type: '多选', required: '否', desc: '需要后续关注的风险点' },
    { field: '附件上传', type: '文件上传', required: '否', desc: '上传佐证材料' },
  ]

  const advice: DecisionAdvice[] = []
  if (row.fraudResult === '命中欺诈' || row.suggestion === '拒绝') {
    advice.push({ type: '不同意', reason: '命中欺诈或硬性拒绝规则，须直接拒贷并双人复核留痕。' })
    advice.push({ type: '双人复核', reason: '拒绝类结论必须双人复核推翻。' })
  } else if (row.infoResult === '预警') {
    advice.push({ type: '补充材料', reason: '信息核验存在预警，需补充材料后再决策。' })
    advice.push({ type: '双人复核', reason: '预警叠加建议授信，需双人复核。' })
  } else if (row.suggestion === '限制额度' || row.suggestion === '严格限制') {
    advice.push({ type: '同意', reason: '可在建议授信额度内放行，建议双人复核确认。' })
  } else {
    advice.push({ type: '同意', reason: '各子系统结论一致，可按建议授信额度自动放行。' })
  }

  const logs: DecisionOpLog[] = [
    { time: row.auditTime, operator: '决策引擎', action: '生成报告', detail: `决策评分 ${decisionScore} / 建议「${row.suggestion}」` },
  ]
  if (row.approvalStatus === '审批中' || row.approvalStatus === '已提交双人复核') {
    logs.push({ time: row.auditTime, operator: row.operator, action: '初审', detail: '完成系统结论复核，提交人工审批。' })
  }
  if (row.approvalStatus === '已提交双人复核') {
    logs.push({ time: row.auditTime, operator: '赵敏', action: '提交双人复核', detail: '高风险结论提交双人复核。' })
  }
  if (row.approvalStatus === '已通过') {
    logs.push({ time: row.auditTime, operator: row.operator, action: '复核放行', detail: '双人复核通过，放款生效。' })
  }
  if (row.approvalStatus === '已拒绝') {
    logs.push({ time: row.auditTime, operator: row.operator, action: '复核拒绝', detail: '双人复核拒绝，关闭工单。' })
  }
  if (row.approvalStatus === '已退回') {
    logs.push({ time: row.auditTime, operator: row.operator, action: '退回补充', detail: '退回补充材料后重新进件。' })
  }
  // 示例豁免操作记录（与「统一豁免弹窗」产出一致：原因 + 双人复核 + 附件）
  logs.push({ time: row.auditTime, operator: '风控专员-张磊', action: '标记豁免', detail: '信息核验项「运营商手机号实名核验」入网时长不足，经电话核实为本人新办卡，申请豁免。复核人：风控主管-王伟（已复核）。' })
  logs.push({ time: row.auditTime, operator: '风控专员-张磊', action: '标记豁免', detail: '信用风控项「手机号入网仅 21 天」命中，附 6 个月通话记录佐证，申请豁免。复核人：风控主管-王伟（已复核）。' })

  const tpl = seedDecisionTemplates.find((t) => t.id === row.templateId)
  return {
    row,
    info,
    credit,
    fraud,
    engine,
    calcRows,
    calcTotal,
    subCards,
    advice,
    logs,
    templateId: row.templateId,
    templateName: tpl?.name ?? '标准决策报告模板',
    reportTime: row.auditTime,
    suggestedRate,
    reviewAdvice,
    basisSummary,
    approvedTerm,
    repaymentMethod,
    limitReason,
    planCompare,
    infoKeyAnomaly,
    infoPassed,
    creditScore900v,
    creditDimensions,
    fraudScoreRaw: fraudRawScore(row.fraudResult),
    fraudHitCount,
    fraudKeyRules,
    fraudGroupTag,
    auditFormFields,
  }
}

// ============================ 报告模板 ============================
export interface DecisionTemplateDef {
  id: string
  name: string
  enabled: boolean
  scope: string[]
  fields: string[]
  style: '标准' | '精简' | '监管报送'
  rule: string
}
export const seedDecisionTemplates: DecisionTemplateDef[] = [
  {
    id: 'tpl-standard',
    name: '标准决策报告模板',
    enabled: true,
    scope: ['信用贷', '消费贷', '经营贷'],
    fields: ['决策总览', '审批操作', '授信方案', '信息核验摘要', '信用风控摘要', '欺诈识别摘要', '操作日志'],
    style: '标准',
    rule: '默认模板，覆盖全部子系统结论与决策建议。',
  },
  {
    id: 'tpl-mortgage',
    name: '抵押贷专用模板',
    enabled: true,
    scope: ['抵押贷'],
    fields: ['决策总览', '审批操作', '授信方案', '信用风控摘要', '欺诈识别摘要', '操作日志'],
    style: '监管报送',
    rule: '抵押贷去除信息核验摘要，强化信用与欺诈结论。',
  },
  {
    id: 'tpl-lite',
    name: '移动端精简模板',
    enabled: false,
    scope: ['信用贷', '消费贷'],
    fields: ['决策总览', '审批操作'],
    style: '精简',
    rule: '移动端精简模板，仅保留决策总览与审批操作。',
  },
]