// 风险评分与命中规则 —— 展示数据（来源：doc/风险评分与命中规则详情设计.md
// 与 doc/申贷审核报告-风险评分与命中规则展示规范与样例数据.md §4 样例数据）
// 前端直接消费样例数据，按申请风险层级（低/中/高）选择对应示例（A/B/C）。
import type { AppRow } from './preApp'

/* ---------- 原始样例结构 ---------- */
export interface RawFactor {
  name: string
  userValue: string
  score: number
  standard: string
  level: string
}
export interface RawComponent {
  name: string
  userValue: string
  value: number
  weight: string
  direction: string
  standard: string
}
export interface RawBlock {
  score: number
  level: string
  range: string
  threshold: string
  summary: string
  factors?: RawFactor[]
  components?: RawComponent[]
}
export interface RawRule {
  name: string
  hit: boolean
  userValue: string
  threshold: string
  weight: string
  impact: string
  desc: string
  dataSource: string
  risk: string
  advice: string
}
export interface RawSample {
  fraudScore: RawBlock
  creditScore: RawBlock
  compositeScore: RawBlock
  rules: RawRule[]
}

/* ---------- 进度条阈值刻度线（绝对刻度值） ---------- */
export const FRAUD_MARKS = [
  { at: 30, label: '预警', color: 'amber' as const },
  { at: 60, label: '决策', color: 'red' as const },
]
export const CREDIT_MARKS = [
  { at: 580, label: '预警', color: 'amber' as const },
  { at: 720, label: '优', color: 'green' as const },
]

/* ---------- 示例 A：欺诈分 8 / 信用分 526 / 综合分 589（中风险，准入但降额） ---------- */
const SAMPLE_A: RawSample = {
  fraudScore: {
    score: 8,
    level: '低',
    range: '0 ~ 100',
    threshold: '≥60 高风险',
    summary: '本次申请欺诈风险极低，仅有轻微的多头借贷迹象，建议正常受理。',
    factors: [
      { name: '设备指纹一致性', userValue: '一致（IOS / 北京）', score: 2, standard: '一致=0~10', level: '低风险' },
      { name: '活体检测', userValue: '通过（置信度 0.98）', score: 1, standard: '通过=0~5', level: '低风险' },
      { name: '身份一致性', userValue: '三要素一致', score: 2, standard: '一致=0~10', level: '低风险' },
      { name: '黑名单命中', userValue: '未命中', score: 0, standard: '未命中=0', level: '低风险' },
      { name: '行为异常', userValue: '无异常', score: 2, standard: '无异常=0~10', level: '低风险' },
      { name: '多头借贷', userValue: '近30天3家机构在查', score: 1, standard: '≤2家=0~5', level: '低风险' },
    ],
  },
  creditScore: {
    score: 526,
    level: '弱',
    range: '300 ~ 900',
    threshold: '≥720 优质',
    summary: '信用资质偏弱，负债水平偏高（DTI 55%），还款能力一般，建议适度授信。',
    factors: [
      { name: '历史还款', userValue: '近24期1次逾期（15天）', score: 110, standard: '无逾期=120~150', level: '偏弱' },
      { name: '负债水平', userValue: 'DTI 约 55%', score: 90, standard: 'DTI<40%=100~130', level: '偏弱' },
      { name: '信用历史长度', userValue: '4.2 年', score: 120, standard: '≥3年=110~130', level: '正常' },
      { name: '信贷活跃度', userValue: '活跃（3个账户）', score: 106, standard: '适中=100~120', level: '正常' },
      { name: '查询频次', userValue: '近6月硬查询 19 次', score: 100, standard: '≤10次=110~130', level: '偏弱' },
    ],
  },
  compositeScore: {
    score: 589,
    level: '中',
    range: '300 ~ 900',
    threshold: '≥720 优质',
    summary: '综合分中等，信用偏弱叠加多头借贷迹象，整体处于“准入但需控制额度”区间。',
    components: [
      { name: '信用分贡献', userValue: '526 分（弱）', value: 0.38, weight: '60%', direction: '拉低综合分', standard: '信用分映射到 0~1 区间' },
      { name: '风险安全度', userValue: 'RiskRaw 36.2（预警）', value: 0.64, weight: '40%', direction: '拉高综合分', standard: '1 − RiskRaw/100' },
      { name: '产品策略系数', userValue: '消费分期', value: 1.0, weight: '—', direction: '中性', standard: '产品配置，默认中性' },
    ],
  },
  rules: [
    {
      name: '反欺诈-设备指纹黑名单',
      hit: false,
      userValue: '当前设备无异常',
      threshold: '命中即触发',
      weight: '高',
      impact: '无影响',
      desc: '检查当前申请设备是否出现在已知欺诈设备黑名单中。',
      dataSource: '设备指纹服务 + 黑名单库',
      risk: '未命中表示当前设备未关联已知欺诈行为。',
      advice: '无异常，可忽略。',
    },
    {
      name: '反欺诈-多头借贷监测',
      hit: true,
      userValue: '近30天 3 家机构在查',
      threshold: '≥2 家机构触发关注',
      weight: '中',
      impact: '中等风险，关注负债',
      desc: '监测近 30 天内查询申请人征信或授信的信贷机构数量。',
      dataSource: '外部多头数据服务',
      risk: '短期内被多家机构查询，可能存在资金饥渴或多头借贷风险。',
      advice: '关注收入负债比；若收入不足，建议降额或补充材料。',
    },
    {
      name: '信用-近6月查询次数',
      hit: true,
      userValue: '近6月硬查询 19 次',
      threshold: '≥15 次触发关注',
      weight: '中',
      impact: '信用资质弱',
      desc: '统计近 6 个月内对申请人的硬查询次数。',
      dataSource: '征信数据',
      risk: '查询次数过多通常意味着近期频繁寻求信贷，可能资金紧张。',
      advice: '要求说明近期申贷原因；结合信用分判断。',
    },
    {
      name: '策略-收入负债比阈值',
      hit: true,
      userValue: 'DTI 约 55%',
      threshold: '≥50% 触发',
      weight: '高',
      impact: '偿债压力大，建议降额/拒绝',
      desc: '计算月收入中用于偿还债务的比例。',
      dataSource: '申请人填写收入 + 外部负债数据',
      risk: '收入负债比过高，可支配现金流不足，违约概率上升。',
      advice: '重点复核收入证明真实性；可考虑拒绝或大幅降低额度。',
    },
    {
      name: '名单-行业灰名单',
      hit: false,
      userValue: '所属行业未命中',
      threshold: '命中即触发',
      weight: '低',
      impact: '无影响',
      desc: '检查申请人所属行业是否命中内部风险行业灰名单。',
      dataSource: '内部名单库',
      risk: '未命中表示行业无特殊风险。',
      advice: '无异常，可忽略。',
    },
  ],
}

/* ---------- 示例 B：欺诈分 45 / 信用分 610 / 综合分 642（中风险，需人工复核） ---------- */
const SAMPLE_B: RawSample = {
  fraudScore: {
    score: 45,
    level: '中',
    range: '0 ~ 100',
    threshold: '≥60 高风险',
    summary: '存在多头借贷与频繁查询迹象，欺诈风险中等，建议人工复核后受理。',
    factors: [
      { name: '设备指纹一致性', userValue: '基本一致（Android / 深圳）', score: 8, standard: '一致=0~10', level: '低风险' },
      { name: '活体检测', userValue: '通过（置信度 0.91）', score: 4, standard: '通过=0~5', level: '低风险' },
      { name: '身份一致性', userValue: '三要素一致', score: 3, standard: '一致=0~10', level: '低风险' },
      { name: '黑名单命中', userValue: '未命中', score: 0, standard: '未命中=0', level: '低风险' },
      { name: '行为异常', userValue: '短时跨城申请', score: 15, standard: '无异常=0~10', level: '中等风险' },
      { name: '多头借贷', userValue: '近30天5家机构在查', score: 15, standard: '≤2家=0~5', level: '中等风险' },
    ],
  },
  creditScore: {
    score: 610,
    level: '中',
    range: '300 ~ 900',
    threshold: '≥720 优质',
    summary: '信用资质中等，历史还款良好但负债偏高，整体可接受。',
    factors: [
      { name: '历史还款', userValue: '近24期无逾期', score: 145, standard: '无逾期=120~150', level: '正常' },
      { name: '负债水平', userValue: 'DTI 约 48%', score: 115, standard: 'DTI<40%=100~130', level: '正常' },
      { name: '信用历史长度', userValue: '5.6 年', score: 125, standard: '≥3年=110~130', level: '正常' },
      { name: '信贷活跃度', userValue: '适中（2个账户）', score: 115, standard: '适中=100~120', level: '正常' },
      { name: '查询频次', userValue: '近6月硬查询 12 次', score: 110, standard: '≤10次=110~130', level: '正常' },
    ],
  },
  compositeScore: {
    score: 642,
    level: '中',
    range: '300 ~ 900',
    threshold: '≥720 优质',
    summary: '综合分中等偏上，欺诈风险可控、信用资质中等，建议人工复核后正常授信。',
    components: [
      { name: '信用分贡献', userValue: '610 分（中）', value: 0.44, weight: '60%', direction: '拉低综合分', standard: '信用分映射到 0~1 区间' },
      { name: '风险安全度', userValue: 'RiskRaw 41（预警）', value: 0.59, weight: '40%', direction: '拉高综合分', standard: '1 − RiskRaw/100' },
      { name: '产品策略系数', userValue: '现金分期', value: 1.0, weight: '—', direction: '中性', standard: '产品配置，默认中性' },
    ],
  },
  rules: [
    {
      name: '反欺诈-设备指纹黑名单',
      hit: false,
      userValue: '当前设备无异常',
      threshold: '命中即触发',
      weight: '高',
      impact: '无影响',
      desc: '检查当前申请设备是否出现在已知欺诈设备黑名单中。',
      dataSource: '设备指纹服务 + 黑名单库',
      risk: '未命中表示当前设备未关联已知欺诈行为。',
      advice: '无异常，可忽略。',
    },
    {
      name: '反欺诈-多头借贷监测',
      hit: true,
      userValue: '近30天 5 家机构在查',
      threshold: '≥2 家机构触发关注',
      weight: '中',
      impact: '中等风险，关注负债',
      desc: '监测近 30 天内查询申请人征信或授信的信贷机构数量。',
      dataSource: '外部多头数据服务',
      risk: '短期内被多家机构查询，可能存在资金饥渴或多头借贷风险。',
      advice: '关注收入负债比；若收入不足，建议降额或补充材料。',
    },
    {
      name: '信用-近6月查询次数',
      hit: true,
      userValue: '近6月硬查询 12 次',
      threshold: '≥15 次触发关注',
      weight: '中',
      impact: '信用资质中等',
      desc: '统计近 6 个月内对申请人的硬查询次数。',
      dataSource: '征信数据',
      risk: '查询次数偏多，需结合信用分与收入综合判断。',
      advice: '结合信用分判断，无重大异常可正常受理。',
    },
    {
      name: '策略-收入负债比阈值',
      hit: false,
      userValue: 'DTI 约 48%',
      threshold: '≥50% 触发',
      weight: '高',
      impact: '无影响',
      desc: '计算月收入中用于偿还债务的比例。',
      dataSource: '申请人填写收入 + 外部负债数据',
      risk: '收入负债比处于临界，但可控。',
      advice: '保持关注，正常受理。',
    },
    {
      name: '名单-行业灰名单',
      hit: false,
      userValue: '所属行业未命中',
      threshold: '命中即触发',
      weight: '低',
      impact: '无影响',
      desc: '检查申请人所属行业是否命中内部风险行业灰名单。',
      dataSource: '内部名单库',
      risk: '未命中表示行业无特殊风险。',
      advice: '无异常，可忽略。',
    },
  ],
}

/* ---------- 示例 C：欺诈分 78 / 信用分 420 / 综合分 463（高风险，建议拒绝） ---------- */
const SAMPLE_C: RawSample = {
  fraudScore: {
    score: 78,
    level: '高',
    range: '0 ~ 100',
    threshold: '≥60 高风险',
    summary: '命中设备黑名单且多头借贷严重，欺诈风险高，建议直接拒绝。',
    factors: [
      { name: '设备指纹一致性', userValue: '不一致（模拟器特征）', score: 20, standard: '一致=0~10', level: '高风险' },
      { name: '活体检测', userValue: '通过（置信度 0.72）', score: 5, standard: '通过=0~5', level: '低风险' },
      { name: '身份一致性', userValue: '三要素一致', score: 3, standard: '一致=0~10', level: '低风险' },
      { name: '黑名单命中', userValue: '命中设备黑名单', score: 30, standard: '未命中=0', level: '高风险' },
      { name: '行为异常', userValue: '凌晨高频操作', score: 10, standard: '无异常=0~10', level: '中等风险' },
      { name: '多头借贷', userValue: '近30天 9 家机构在查', score: 10, standard: '≤2家=0~5', level: '高风险' },
    ],
  },
  creditScore: {
    score: 420,
    level: '弱',
    range: '300 ~ 900',
    threshold: '≥720 优质',
    summary: '信用资质弱，历史存在逾期且负债过高，还款能力明显不足。',
    factors: [
      { name: '历史还款', userValue: '近24期3次逾期（最长60天）', score: 80, standard: '无逾期=120~150', level: '偏弱' },
      { name: '负债水平', userValue: 'DTI 约 68%', score: 80, standard: 'DTI<40%=100~130', level: '偏弱' },
      { name: '信用历史长度', userValue: '2.1 年', score: 90, standard: '≥3年=110~130', level: '偏弱' },
      { name: '信贷活跃度', userValue: '过度活跃（6个账户）', score: 85, standard: '适中=100~120', level: '偏弱' },
      { name: '查询频次', userValue: '近6月硬查询 28 次', score: 85, standard: '≤10次=110~130', level: '偏弱' },
    ],
  },
  compositeScore: {
    score: 463,
    level: '低',
    range: '300 ~ 900',
    threshold: '≥720 优质',
    summary: '综合分偏低，强欺诈信号叠加弱信用，整体处于高风险区间，建议拒绝。',
    components: [
      { name: '信用分贡献', userValue: '420 分（弱）', value: 0.2, weight: '60%', direction: '拉低综合分', standard: '信用分映射到 0~1 区间' },
      { name: '风险安全度', userValue: 'RiskRaw 67（高危）', value: 0.33, weight: '40%', direction: '拉低综合分', standard: '1 − RiskRaw/100' },
      { name: '产品策略系数', userValue: '现金分期', value: 1.0, weight: '—', direction: '中性', standard: '产品配置，默认中性' },
    ],
  },
  rules: [
    {
      name: '反欺诈-设备指纹黑名单',
      hit: true,
      userValue: '命中设备黑名单（模拟器特征）',
      threshold: '命中即触发',
      weight: '高',
      impact: '强欺诈信号，建议拒绝',
      desc: '检查当前申请设备是否出现在已知欺诈设备黑名单中。',
      dataSource: '设备指纹服务 + 黑名单库',
      risk: '命中设备黑名单，强烈指向欺诈申请。',
      advice: '直接拒绝，并上报欺诈识别模块。',
    },
    {
      name: '反欺诈-多头借贷监测',
      hit: true,
      userValue: '近30天 9 家机构在查',
      threshold: '≥2 家机构触发关注',
      weight: '中',
      impact: '高风险，关注负债',
      desc: '监测近 30 天内查询申请人征信或授信的信贷机构数量。',
      dataSource: '外部多头数据服务',
      risk: '短期内被大量机构查询，存在严重多头借贷与资金链紧张迹象。',
      advice: '结合设备黑名单，建议拒绝。',
    },
    {
      name: '信用-近6月查询次数',
      hit: true,
      userValue: '近6月硬查询 28 次',
      threshold: '≥15 次触发关注',
      weight: '中',
      impact: '信用资质弱',
      desc: '统计近 6 个月内对申请人的硬查询次数。',
      dataSource: '征信数据',
      risk: '查询次数过高，资金紧张迹象明显。',
      advice: '结合信用分，建议拒绝或大幅降额。',
    },
    {
      name: '策略-收入负债比阈值',
      hit: true,
      userValue: 'DTI 约 68%',
      threshold: '≥50% 触发',
      weight: '高',
      impact: '偿债压力极大，建议拒绝',
      desc: '计算月收入中用于偿还债务的比例。',
      dataSource: '申请人填写收入 + 外部负债数据',
      risk: '收入负债比过高，可支配现金流严重不足，违约概率高。',
      advice: '重点复核收入真实性；建议拒绝。',
    },
    {
      name: '名单-行业灰名单',
      hit: false,
      userValue: '所属行业未命中',
      threshold: '命中即触发',
      weight: '低',
      impact: '无影响',
      desc: '检查申请人所属行业是否命中内部风险行业灰名单。',
      dataSource: '内部名单库',
      risk: '未命中表示行业无特殊风险。',
      advice: '无异常，可忽略。',
    },
  ],
}

export const SAMPLES: RawSample[] = [SAMPLE_A, SAMPLE_B, SAMPLE_C]

/* ---------- 按申请风险层级选择示例 ---------- */
export function selectSample(r: AppRow): number {
  if (r.fraudScore > 60 || r.creditScore < 480) return 2 // 高
  if (r.fraudScore >= 30 || r.creditScore < 720) return 1 // 中
  return 0 // 低
}

/* ---------- 等级 → 颜色语义 ---------- */
export function levelKind(level: string): 'red' | 'amber' | 'green' {
  if (['高', '弱', '命中', '高风险', '中等风险', '偏弱', '高危'].includes(level)) return 'red'
  if (['中', '良', '一般'].includes(level)) return 'amber'
  return 'green'
}

/* ---------- 统一「风险指数」(RiskRaw)：§2.7.1 ---------- */
const WEIGHT_MAP: Record<string, number> = { 高: 22, 中: 12, 低: 6 }
function ruleSeverity(rule: RawRule): number {
  if (!rule.hit) return 0
  if (rule.name.includes('黑名单') || rule.name.includes('设备指纹')) return 1.0
  if (rule.name.includes('多头')) {
    const n = parseInt(rule.userValue.replace(/[^0-9]/g, ''), 10) || 0
    return Math.min(1, (n - 2) / 4)
  }
  if (rule.name.includes('查询')) {
    const n = parseInt(rule.userValue.replace(/[^0-9]/g, ''), 10) || 0
    return Math.min(1, (n - 15) / 15)
  }
  if (rule.name.includes('收入负债')) return rule.userValue.includes('超阈') ? 1.0 : 1.0
  return 1.0
}
export function computeRiskIndex(raw: RawSample) {
  const fraud = raw.fraudScore.score
  const rulePoints = raw.rules.reduce((s, r) => s + (r.hit ? (WEIGHT_MAP[r.weight] ?? 6) * ruleSeverity(r) : 0), 0)
  const rawVal = 0.5 * fraud + 0.5 * rulePoints
  const value = Math.max(0, Math.min(100, Math.round(rawVal)))
  const level = value >= 60 ? '高' : value >= 30 ? '中' : '低'
  return { value, level, kind: levelKind(level) }
}

/* ---------- 构建三张分数卡 ---------- */
export interface ScoreFactorView {
  name: string
  userValue: string
  score: number
  standard: string
  level: string
}
export interface ScoreComponentView {
  name: string
  userValue: string
  value: number
  weight: string
  direction: string
  standard: string
}
export interface ScoreView {
  code: string
  name: string
  direction: string
  dirKind: 'red' | 'emerald'
  value: number
  level: string
  kind: 'red' | 'amber' | 'green'
  max: number
  floor: number
  threshold: string
  marks: { at: number; label: string; color: 'red' | 'amber' | 'green' }[]
  summary: string
  model: string
  calcTime: string
  factors?: ScoreFactorView[]
  components?: ScoreComponentView[]
}
export function buildScores(raw: RawSample, calcTime: string): ScoreView[] {
  return [
    {
      code: '智察分',
      name: '欺诈分',
      direction: '↑ 越高越危险',
      dirKind: 'red',
      value: raw.fraudScore.score,
      level: raw.fraudScore.level,
      kind: levelKind(raw.fraudScore.level),
      max: 100,
      floor: 0,
      threshold: raw.fraudScore.threshold,
      marks: FRAUD_MARKS,
      summary: raw.fraudScore.summary,
      model: 'AntiFraud-v3.2',
      calcTime,
      factors: raw.fraudScore.factors!.map((f) => ({
        name: f.name,
        userValue: f.userValue,
        score: f.score,
        standard: f.standard,
        level: f.level,
      })),
    },
    {
      code: '智信分',
      name: '信用分',
      direction: '↑ 越高越优质',
      dirKind: 'emerald',
      value: raw.creditScore.score,
      level: raw.creditScore.level,
      kind: levelKind(raw.creditScore.level),
      max: 900,
      floor: 300,
      threshold: raw.creditScore.threshold,
      marks: CREDIT_MARKS,
      summary: raw.creditScore.summary,
      model: 'CreditScore-v2.8',
      calcTime,
      factors: raw.creditScore.factors!.map((f) => ({
        name: f.name,
        userValue: f.userValue,
        score: f.score,
        standard: f.standard,
        level: f.level,
      })),
    },
    {
      code: '智融分',
      name: '综合分',
      direction: '↑ 越高越优质',
      dirKind: 'emerald',
      value: raw.compositeScore.score,
      level: raw.compositeScore.level,
      kind: levelKind(raw.compositeScore.level),
      max: 900,
      floor: 300,
      threshold: raw.compositeScore.threshold,
      marks: CREDIT_MARKS,
      summary: raw.compositeScore.summary,
      model: 'BlendScore-v1.5',
      calcTime,
      components: raw.compositeScore.components!.map((c) => ({
        name: c.name,
        userValue: c.userValue,
        value: c.value,
        weight: c.weight,
        direction: c.direction,
        standard: c.standard,
      })),
    },
  ]
}

/* ---------- 构建命中规则与模型 ---------- */
export interface RuleHit {
  name: string
  hit: boolean
  hitText: string
  level: 'red' | 'amber' | 'green'
  userValue: string
  threshold: string
  weight: string
  impact: string
  desc: string
  dataSource: string
  risk: string
  advice: string
}
export function buildRules(raw: RawRule[]): RuleHit[] {
  return raw.map((r) => ({
    name: r.name,
    hit: r.hit,
    hitText: r.hit ? '命中' : '未命中',
    level: r.hit ? (r.weight === '高' ? 'red' : 'amber') : 'green',
    userValue: r.userValue,
    threshold: r.threshold,
    weight: r.weight,
    impact: r.impact,
    desc: r.desc,
    dataSource: r.dataSource,
    risk: r.risk,
    advice: r.advice,
  }))
}
