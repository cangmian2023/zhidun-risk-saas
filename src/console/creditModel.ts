/* ============================================================================
 * 信用模型配置页 —— 数据层（前端 mock 数据）
 * 对应文档：SaaS/doc/信用模型配置页功能设计.md
 * 说明：本报告「配置页」与展示端 creditReport.ts / creditKimiReport.ts 解耦，
 *       配置模型独立维护，可随真实后端接口替换。
 * ========================================================================== */

/* ----------------------------- 类型定义 ----------------------------- */

/** 评分规则：数值阈值 */
export interface ThresholdSegment {
  id: string
  operator: '>=' | '>' | '<=' | '<' | 'between' | 'outside'
  value: number
  value2?: number // between/outside 时的上界
  score: number
  label: string
}
/** 评分规则：枚举映射 */
export interface EnumMapping {
  id: string
  value: string | number
  score: number
  label: string
}
/** 评分规则：公式 */
export interface FormulaRule {
  expression: string // 例如 "(收入 - 负债) / 负债 * 100"
  lowerBound: number // 公式结果映射分数的下界
  upperBound: number // 公式结果映射分数的上界
}

export type ScoringRuleType = 'threshold' | 'enum' | 'formula'

export interface ScoringRule {
  type: ScoringRuleType
  // 以下字段按需填充：
  field?: string // 公式引用的数据字段
  segments?: ThresholdSegment[]
  mappings?: EnumMapping[]
  formula?: FormulaRule
}

export type SubIndicatorDataType = 'number' | 'enum' | 'boolean' | 'string'

export interface SubIndicator {
  id: string
  name: string
  dataField: string // 对接的数据字段标识
  dataType: SubIndicatorDataType
  maxScore: number
  weight: number // 子指标在所属维度内的权重（%）
  enabled: boolean
  scoringRules: ScoringRule[]
}

export interface Dimension {
  id: string
  name: string
  icon: string
  weight: number // 维度权重（%）
  description: string
  dataSources: string[]
  maxScore: number
  enabled: boolean
  subIndicators: SubIndicator[]
}

export type PenaltyType = 'reject' | 'fixed' | 'ratio'
export type TriggerConditionType = 'blacklist' | 'dataSourceResult' | 'score' | 'subScore' | 'field'

export interface TriggerCondition {
  id: string
  type: TriggerConditionType
  field?: string // score/subScore/field 时的字段
  operator?: '>=' | '>' | '<=' | '<' | '==' | 'in'
  value?: string | number | string[] // 触发阈值或枚举值
}

export interface PenaltyRule {
  id: string
  name: string
  description: string
  triggerConditions: TriggerCondition[]
  logic: 'AND' | 'OR'
  penaltyType: PenaltyType
  penaltyValue: number // reject 时忽略；fixed=扣分绝对值；ratio=基于当前分的比例（%）
  maxPenalty: number // 最大扣分（绝对分）
  exemptible: boolean // 是否可豁免
  exemptLevel: '系统管理员' | '风控主管' | '不可豁免'
  enabled: boolean
}

export type RiskLevel = '低' | '中' | '高'
export type AutoDecision = '通过' | '预警' | '拒绝'

export interface GradeMapping {
  grade: string
  label: string
  minScore: number
  maxScore: number
  riskLevel: RiskLevel
  autoDecision: AutoDecision
  needManualReview: boolean
  creditLimitRatio: number // 授信额度比例（%）
  color: string
}

export type ModelStatus = '草稿' | '已生效' | '已下线'

export interface ChangeLog {
  version: string
  action: '创建' | '编辑' | '保存草稿' | '生效' | '下线' | '回滚'
  operator: string
  timestamp: string
  summary: string
  approver?: string
  approvalComment?: string
}

export interface CreditModel {
  id: string
  name: string
  version: string
  status: ModelStatus
  scopeType: '全产品' | '指定产品'
  scope: string[]
  description: string
  totalScoreMin: number
  totalScoreMax: number
  dimensions: Dimension[]
  penalties: PenaltyRule[]
  grades: GradeMapping[]
  changeLogs: ChangeLog[]
}

/* ----------------------------- 目录 / 预设 ----------------------------- */

/** 数据源目录（用于维度数据来源多选） */
export const DATA_SOURCES = [
  '公安库',
  '银行卡四要素',
  '活体检测',
  '运营商',
  '人行征信',
  '内部库',
  '同盾联防',
  '多头借贷库',
  '设备风险库',
  '关联图谱',
]

/** 适用产品目录 */
export const PRODUCTS = ['消费分期', '现金贷', '信用贷', '小微经营贷', '白领贷']

/** 公式可用变量 / 数据字段（提示用） */
export const FORMULA_VARS = [
  '收入',
  '负债',
  '月供',
  '征信查询次数',
  '历史逾期次数',
  '授信账户数',
  '多头借贷平台数',
  '账户年龄(月)',
  '入网时长(月)',
  '申贷频率',
]

/* ----------------------------- 角色权限 ----------------------------- */
/* 文档 10. 角色权限矩阵：查看 / 编辑 / 生效·下线 / 灰度发布 / 回滚 */
export type Role = '系统管理员' | '风控主管' | '风控策略岗' | '风控专员' | '数据分析师'
export const ROLES: Role[] = ['系统管理员', '风控主管', '风控策略岗', '风控专员', '数据分析师']
export const ROLE_PERM: Record<
  Role,
  { edit: boolean; enable: boolean; rollback: boolean }
> = {
  系统管理员: { edit: true, enable: true, rollback: true },
  风控主管: { edit: false, enable: true, rollback: false },
  风控策略岗: { edit: true, enable: false, rollback: false },
  风控专员: { edit: false, enable: false, rollback: false },
  数据分析师: { edit: false, enable: false, rollback: false },
}

/* ----------------------------- 工具函数 ----------------------------- */
let _seq = 0
const uid = (p: string) => `${p}_${(++_seq).toString(36)}${Date.now().toString(36).slice(-3)}`

export const newId = (p: string) => uid(p)

export const nowStr = () => new Date().toISOString().slice(0, 16).replace('T', ' ')

export const bumpVersion = (v: string): string => {
  const m = /^V(\d+)\.(\d+)$/.exec(v)
  if (!m) return 'V1.1'
  return `V${m[1]}.${+m[2] + 1}`
}

export const sumWeights = (items: { weight: number }[]) =>
  Math.round(items.reduce((s, i) => s + (i.weight || 0), 0) * 100) / 100

export const defaultThresholdRule = (): ScoringRule => ({
  type: 'threshold',
  segments: [
    { id: newId('seg'), operator: '>=', value: 0, score: 100, label: '优秀' },
    { id: newId('seg'), operator: '<', value: 0, score: 0, label: '不合格' },
  ],
})

export const defaultEnumRule = (): ScoringRule => ({
  type: 'enum',
  mappings: [
    { id: newId('em'), value: '是', score: 100, label: '通过' },
    { id: newId('em'), value: '否', score: 0, label: '不通过' },
  ],
})

export const defaultFormulaRule = (): ScoringRule => ({
  type: 'formula',
  formula: { expression: '收入 / 负债 * 100', lowerBound: 0, upperBound: 200 },
})

/** 依据数据类型返回默认评分规则 */
export const defaultRuleForType = (dt: SubIndicatorDataType): ScoringRule => {
  if (dt === 'number') return defaultThresholdRule()
  if (dt === 'enum' || dt === 'boolean') return defaultEnumRule()
  return defaultFormulaRule()
}

/* ----------------------------- 种子模型 ----------------------------- */

function buildDimensions(): Dimension[] {
  return [
    {
      id: 'dim_identity',
      name: '身份真实性',
      icon: '🆔',
      weight: 20,
      description: '评估借款人身份的真实性、一致性与本人意愿，是模型的第一道风控防线。',
      dataSources: ['公安库', '银行卡四要素', '活体检测', '运营商'],
      maxScore: 100,
      enabled: true,
      subIndicators: [
        {
          id: 'sub_identity_1', name: '公安实名一致性', dataField: 'juxinli.gongan', dataType: 'enum',
          maxScore: 100, weight: 30, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '一致', score: 100, label: '一致' },
              { id: newId('em'), value: '不一致', score: 0, label: '不一致' },
            ],
          }],
        },
        {
          id: 'sub_identity_2', name: '银行卡四要素一致性', dataField: 'juxinli.bank4', dataType: 'enum',
          maxScore: 100, weight: 25, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '一致', score: 100, label: '一致' },
              { id: newId('em'), value: '不一致', score: 0, label: '不一致' },
            ],
          }],
        },
        {
          id: 'sub_identity_3', name: '人脸比对相似度', dataField: 'ocr.faceSimilarity', dataType: 'number',
          maxScore: 100, weight: 25, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '>=', value: 95, score: 100, label: '高度疑似本人' },
              { id: newId('seg'), operator: '>=', value: 80, score: 80, label: '疑似本人' },
              { id: newId('seg'), operator: '<', value: 80, score: 0, label: '非本人' },
            ],
          }],
        },
        {
          id: 'sub_identity_4', name: '活体检测结果', dataField: 'ocr.liveness', dataType: 'enum',
          maxScore: 100, weight: 10, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '通过', score: 100, label: '通过' },
              { id: newId('em'), value: '失败', score: 0, label: '失败' },
            ],
          }],
        },
        {
          id: 'sub_identity_5', name: '运营商实名一致性', dataField: 'operator.realName', dataType: 'enum',
          maxScore: 100, weight: 10, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '一致', score: 100, label: '一致' },
              { id: newId('em'), value: '不一致', score: 0, label: '不一致' },
            ],
          }],
        },
      ],
    },
    {
      id: 'dim_repayment',
      name: '还款能力',
      icon: '💰',
      weight: 25,
      description: '基于收入、负债、职业与资产，评估借款人的实际还款能力。',
      dataSources: ['内部库', '银行卡四要素', '运营商'],
      maxScore: 100,
      enabled: true,
      subIndicators: [
        {
          id: 'sub_repay_1', name: '月收入水平', dataField: 'income.monthly', dataType: 'number',
          maxScore: 100, weight: 30, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '>=', value: 20000, score: 100, label: '高收入' },
              { id: newId('seg'), operator: '>=', value: 10000, score: 80, label: '中高收入' },
              { id: newId('seg'), operator: '>=', value: 5000, score: 60, label: '中等收入' },
              { id: newId('seg'), operator: '<', value: 5000, score: 30, label: '低收入' },
            ],
          }],
        },
        {
          id: 'sub_repay_2', name: '负债收入比', dataField: 'debt.incomeRatio', dataType: 'number',
          maxScore: 100, weight: 30, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '<=', value: 30, score: 100, label: '健康' },
              { id: newId('seg'), operator: '<=', value: 50, score: 70, label: '可控' },
              { id: newId('seg'), operator: '<=', value: 80, score: 40, label: '偏高' },
              { id: newId('seg'), operator: '>', value: 80, score: 0, label: '过高' },
            ],
          }],
        },
        {
          id: 'sub_repay_3', name: '工作稳定性', dataField: 'job.stability', dataType: 'enum',
          maxScore: 100, weight: 20, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '正式员工', score: 100, label: '正式员工' },
              { id: newId('em'), value: '合同工', score: 70, label: '合同工' },
              { id: newId('em'), value: '自由职业', score: 40, label: '自由职业' },
              { id: newId('em'), value: '无业', score: 0, label: '无业' },
            ],
          }],
        },
        {
          id: 'sub_repay_4', name: '学历水平', dataField: 'profile.education', dataType: 'enum',
          maxScore: 100, weight: 10, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '研究生及以上', score: 100, label: '研究生及以上' },
              { id: newId('em'), value: '本科', score: 80, label: '本科' },
              { id: newId('em'), value: '大专', score: 60, label: '大专' },
              { id: newId('em'), value: '高中', score: 40, label: '高中' },
              { id: newId('em'), value: '其他', score: 20, label: '其他' },
            ],
          }],
        },
        {
          id: 'sub_repay_5', name: '资产情况', dataField: 'asset.level', dataType: 'enum',
          maxScore: 100, weight: 10, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '有房有车', score: 100, label: '有房有车' },
              { id: newId('em'), value: '有房', score: 80, label: '有房' },
              { id: newId('em'), value: '有车', score: 60, label: '有车' },
              { id: newId('em'), value: '无', score: 30, label: '无' },
            ],
          }],
        },
      ],
    },
    {
      id: 'dim_credit_history',
      name: '信用历史',
      icon: '📊',
      weight: 25,
      description: '基于征信与外部数据，评估借款人的历史信用表现与多头借贷风险。',
      dataSources: ['人行征信', '多头借贷库', '内部库'],
      maxScore: 100,
      enabled: true,
      subIndicators: [
        {
          id: 'sub_credit_1', name: '近6月机构查询次数', dataField: 'credit.query6m', dataType: 'number',
          maxScore: 100, weight: 25, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '<=', value: 3, score: 100, label: '低频' },
              { id: newId('seg'), operator: '<=', value: 6, score: 80, label: '正常' },
              { id: newId('seg'), operator: '<=', value: 10, score: 50, label: '偏高' },
              { id: newId('seg'), operator: '>', value: 10, score: 0, label: '高频' },
            ],
          }],
        },
        {
          id: 'sub_credit_2', name: '历史逾期记录', dataField: 'credit.overdue', dataType: 'enum',
          maxScore: 100, weight: 30, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '无', score: 100, label: '无逾期' },
              { id: newId('em'), value: '30天内', score: 50, label: '轻微' },
              { id: newId('em'), value: '90天内', score: 20, label: '严重' },
              { id: newId('em'), value: '90天以上', score: 0, label: '恶性' },
            ],
          }],
        },
        {
          id: 'sub_credit_3', name: '授信账户数', dataField: 'credit.accountCount', dataType: 'number',
          maxScore: 100, weight: 15, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '<=', value: 3, score: 100, label: '少' },
              { id: newId('seg'), operator: '<=', value: 5, score: 70, label: '适中' },
              { id: newId('seg'), operator: '<=', value: 8, score: 40, label: '偏多' },
              { id: newId('seg'), operator: '>', value: 8, score: 0, label: '过多' },
            ],
          }],
        },
        {
          id: 'sub_credit_4', name: '多头借贷平台数', dataField: 'loan.platformCount', dataType: 'number',
          maxScore: 100, weight: 20, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '<=', value: 2, score: 100, label: '少' },
              { id: newId('seg'), operator: '<=', value: 4, score: 70, label: '适中' },
              { id: newId('seg'), operator: '<=', value: 6, score: 40, label: '偏多' },
              { id: newId('seg'), operator: '>', value: 6, score: 0, label: '过多' },
            ],
          }],
        },
        {
          id: 'sub_credit_5', name: '账户年龄(月)', dataField: 'credit.ageMonths', dataType: 'number',
          maxScore: 100, weight: 10, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '>=', value: 24, score: 100, label: '老户' },
              { id: newId('seg'), operator: '>=', value: 12, score: 80, label: '稳定' },
              { id: newId('seg'), operator: '>=', value: 6, score: 50, label: '一般' },
              { id: newId('seg'), operator: '<', value: 6, score: 0, label: '新户' },
            ],
          }],
        },
      ],
    },
    {
      id: 'dim_behavior',
      name: '行为稳定性',
      icon: '🚶',
      weight: 10,
      description: '基于入网时长、设备使用与申请行为，评估用户行为的稳定性。',
      dataSources: ['运营商', '设备风险库', '内部库'],
      maxScore: 100,
      enabled: true,
      subIndicators: [
        {
          id: 'sub_behavior_1', name: '手机号入网时长(月)', dataField: 'operator.activeMonths', dataType: 'number',
          maxScore: 100, weight: 35, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '>=', value: 24, score: 100, label: '长期' },
              { id: newId('seg'), operator: '>=', value: 12, score: 70, label: '稳定' },
              { id: newId('seg'), operator: '>=', value: 6, score: 40, label: '一般' },
              { id: newId('seg'), operator: '<', value: 6, score: 0, label: '短期' },
            ],
          }],
        },
        {
          id: 'sub_behavior_2', name: '设备使用时长(月)', dataField: 'device.useMonths', dataType: 'number',
          maxScore: 100, weight: 25, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '>=', value: 12, score: 100, label: '长期' },
              { id: newId('seg'), operator: '>=', value: 6, score: 70, label: '稳定' },
              { id: newId('seg'), operator: '<', value: 6, score: 30, label: '短期' },
            ],
          }],
        },
        {
          id: 'sub_behavior_3', name: '近30天申贷频率', dataField: 'behavior.applyFreq30d', dataType: 'number',
          maxScore: 100, weight: 20, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '<=', value: 1, score: 100, label: '低频' },
              { id: newId('seg'), operator: '<=', value: 3, score: 70, label: '正常' },
              { id: newId('seg'), operator: '<=', value: 6, score: 40, label: '偏高' },
              { id: newId('seg'), operator: '>', value: 6, score: 0, label: '高频' },
            ],
          }],
        },
        {
          id: 'sub_behavior_4', name: '居住稳定性', dataField: 'profile.residence', dataType: 'enum',
          maxScore: 100, weight: 20, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '稳定', score: 100, label: '稳定' },
              { id: newId('em'), value: '一般', score: 60, label: '一般' },
              { id: newId('em'), value: '不稳定', score: 20, label: '不稳定' },
            ],
          }],
        },
      ],
    },
    {
      id: 'dim_device',
      name: '设备安全性',
      icon: '📱',
      weight: 10,
      description: '评估设备环境是否安全，拦截 Root/越狱、模拟器与代理等风险环境。',
      dataSources: ['设备风险库'],
      maxScore: 100,
      enabled: true,
      subIndicators: [
        {
          id: 'sub_device_1', name: 'Root/越狱', dataField: 'device.root', dataType: 'enum',
          maxScore: 100, weight: 30, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '无', score: 100, label: '安全' },
              { id: newId('em'), value: '有', score: 0, label: '风险' },
            ],
          }],
        },
        {
          id: 'sub_device_2', name: '模拟器检测', dataField: 'device.emulator', dataType: 'enum',
          maxScore: 100, weight: 30, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '正常', score: 100, label: '正常' },
              { id: newId('em'), value: '模拟器', score: 0, label: '风险' },
            ],
          }],
        },
        {
          id: 'sub_device_3', name: 'VPN/代理', dataField: 'device.proxy', dataType: 'enum',
          maxScore: 100, weight: 20, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '无', score: 100, label: '正常' },
              { id: newId('em'), value: '有', score: 30, label: '风险' },
            ],
          }],
        },
        {
          id: 'sub_device_4', name: '设备关联账号数', dataField: 'device.relAccount', dataType: 'number',
          maxScore: 100, weight: 20, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '<=', value: 2, score: 100, label: '少' },
              { id: newId('seg'), operator: '<=', value: 5, score: 70, label: '适中' },
              { id: newId('seg'), operator: '>', value: 5, score: 0, label: '过多' },
            ],
          }],
        },
      ],
    },
    {
      id: 'dim_association',
      name: '关联风险',
      icon: '🔗',
      weight: 10,
      description: '评估设备/IP/手机号/银行卡的关联风险与团伙欺诈可能性。',
      dataSources: ['关联图谱', '同盾联防', '设备风险库'],
      maxScore: 100,
      enabled: true,
      subIndicators: [
        {
          id: 'sub_assoc_1', name: '设备/IP关联风险账户数', dataField: 'graph.riskAccount', dataType: 'number',
          maxScore: 100, weight: 40, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '==', value: 0, score: 100, label: '无关联' },
              { id: newId('seg'), operator: '<=', value: 2, score: 60, label: '少量关联' },
              { id: newId('seg'), operator: '>', value: 2, score: 0, label: '高风险关联' },
            ],
          }],
        },
        {
          id: 'sub_assoc_2', name: '手机号关联逾期数', dataField: 'graph.relOverdue', dataType: 'number',
          maxScore: 100, weight: 30, enabled: true, scoringRules: [{
            type: 'threshold', segments: [
              { id: newId('seg'), operator: '==', value: 0, score: 100, label: '无' },
              { id: newId('seg'), operator: '<=', value: 1, score: 50, label: '少量' },
              { id: newId('seg'), operator: '>', value: 1, score: 0, label: '较多' },
            ],
          }],
        },
        {
          id: 'sub_assoc_3', name: '团伙关联', dataField: 'graph.gang', dataType: 'enum',
          maxScore: 100, weight: 30, enabled: true, scoringRules: [{
            type: 'enum', mappings: [
              { id: newId('em'), value: '无', score: 100, label: '无' },
              { id: newId('em'), value: '疑似', score: 40, label: '疑似' },
              { id: newId('em'), value: '确认', score: 0, label: '确认' },
            ],
          }],
        },
      ],
    },
  ]
}

function buildPenalties(): PenaltyRule[] {
  return [
    {
      id: 'pen_blacklist', name: '黑名单命中', description: '命中任一种黑名单（信贷/欺诈/催收）直接拒绝。',
      triggerConditions: [{ id: newId('tc'), type: 'blacklist' }],
      logic: 'AND', penaltyType: 'reject', penaltyValue: 0, maxPenalty: 0,
      exemptible: false, exemptLevel: '不可豁免', enabled: true,
    },
    {
      id: 'pen_dishonest', name: '失信被执行人', description: '命中法院失信被执行人名单，建议直接拒绝。',
      triggerConditions: [{ id: newId('tc'), type: 'dataSourceResult', field: '法院失信', operator: '==', value: '命中' }],
      logic: 'AND', penaltyType: 'fixed', penaltyValue: 30, maxPenalty: 30,
      exemptible: false, exemptLevel: '不可豁免', enabled: true,
    },
    {
      id: 'pen_gang', name: '团伙欺诈关联', description: '关联图谱确认团伙欺诈，建议直接拒绝。',
      triggerConditions: [{ id: newId('tc'), type: 'dataSourceResult', field: '同盾联防团伙关联', operator: '==', value: '确认' }],
      logic: 'AND', penaltyType: 'fixed', penaltyValue: 25, maxPenalty: 25,
      exemptible: false, exemptLevel: '不可豁免', enabled: true,
    },
    {
      id: 'pen_multi', name: '重度多头借贷', description: '近30天申贷平台数≥10，按比例扣分，可豁免。',
      triggerConditions: [{ id: newId('tc'), type: 'subScore', field: '多头借贷平台数', operator: '>=', value: 10 }],
      logic: 'AND', penaltyType: 'ratio', penaltyValue: 20, maxPenalty: 30,
      exemptible: true, exemptLevel: '风控主管', enabled: true,
    },
    {
      id: 'pen_debt', name: '高负债率', description: '负债收入比>100%，固定扣分，可自免。',
      triggerConditions: [{ id: newId('tc'), type: 'subScore', field: '负债收入比', operator: '>', value: 100 }],
      logic: 'AND', penaltyType: 'fixed', penaltyValue: 20, maxPenalty: 20,
      exemptible: true, exemptLevel: '风控主管', enabled: true,
    },
    {
      id: 'pen_device', name: '设备环境异常', description: '命中模拟器/Root/VPN 任一，固定扣分，可自免。',
      triggerConditions: [
        { id: newId('tc'), type: 'subScore', field: '模拟器检测', operator: '==', value: '模拟器' },
        { id: newId('tc'), type: 'subScore', field: 'Root/越狱', operator: '==', value: '有' },
        { id: newId('tc'), type: 'subScore', field: 'VPN/代理', operator: '==', value: '有' },
      ],
      logic: 'OR', penaltyType: 'fixed', penaltyValue: 15, maxPenalty: 15,
      exemptible: true, exemptLevel: '风控主管', enabled: true,
    },
  ]
}

function buildGrades(): GradeMapping[] {
  return [
    { grade: 'A', label: '优质', minScore: 75, maxScore: 100, riskLevel: '低', autoDecision: '通过', needManualReview: false, creditLimitRatio: 100, color: '#16A34A' },
    { grade: 'B', label: '良好', minScore: 60, maxScore: 74, riskLevel: '中', autoDecision: '预警', needManualReview: true, creditLimitRatio: 70, color: '#D97706' },
    { grade: 'C', label: '次级', minScore: 45, maxScore: 59, riskLevel: '高', autoDecision: '拒绝', needManualReview: false, creditLimitRatio: 0, color: '#EA580C' },
    { grade: 'D', label: '拒绝', minScore: 0, maxScore: 44, riskLevel: '高', autoDecision: '拒绝', needManualReview: false, creditLimitRatio: 0, color: '#DC2626' },
  ]
}

export function buildDefaultModel(): CreditModel {
  return {
    id: 'model_credit_default',
    name: '标准信用评分模型',
    version: 'V1.0',
    status: '已生效',
    scopeType: '全产品',
    scope: [],
    description: '面向消费分期与现金贷的标准信用评分模型，综合身份、还款能力、信用历史、行为、设备与关联六维风险。',
    totalScoreMin: 0,
    totalScoreMax: 100,
    dimensions: buildDimensions(),
    penalties: buildPenalties(),
    grades: buildGrades(),
    changeLogs: [
      { version: 'V1.0', action: '生效', operator: '系统管理员', timestamp: '2026-05-10 09:00', summary: '初始版本创建并生效', approver: '风控主管', approvalComment: '模型经评审通过，正式上线。' },
    ],
  }
}

export const seedModel = buildDefaultModel()
