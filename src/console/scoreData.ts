// 评分产品子系统（v3 新 IA）· 数据层
// 三个产品：智察分（欺诈 0-100）/ 智信分（违约 300-900）/ 智融分（综合 350-950）
// 数据持久化到本地 scoreData.json，复用 /api/load-mid /api/save-mid
// 处置流程统一由管理中心「业务流程」配置（bizFlows.json · f-alert-dispose），本数据层不再持有 flow

import { useSyncExternalStore } from 'react'
import type { VisualCond } from './midData'
import { VISUAL_OP_LABEL } from './midData'
import type { VFilter } from './CondBuilder'

export type ScoreProd =
  | 'zhicha' | 'zhixin' | 'zhirong'
  | 'jd-zonghe' | 'jd-jingying' | 'jd-kongke' | 'jd-kechuang' | 'jd-hetong' | 'jd-sifa'
  | 'gp-chain' | 'gp-equity-pen' | 'gp-equity-str' | 'gp-controller' | 'gp-beneficial'
  | 'gp-company-rel' | 'gp-related-party' | 'gp-top-beneficiary' | 'gp-person-rel'

export const SCORE_PROD_LABEL: Record<ScoreProd, string> = {
  zhicha: '智察分',
  zhixin: '智信分',
  zhirong: '智融分',
  'jd-zonghe': '综合得分',
  'jd-jingying': '经营指数',
  'jd-kongke': '空壳指数',
  'jd-kechuang': '科创分',
  'jd-hetong': '合同违约指数',
  'jd-sifa': '司法风险',
  'gp-chain': '企业链图',
  'gp-equity-pen': '股权穿透',
  'gp-equity-str': '股权结构',
  'gp-controller': '控制人关系',
  'gp-beneficial': '受益所有人',
  'gp-company-rel': '企业关系',
  'gp-related-party': '关联方认定',
  'gp-top-beneficiary': '十大受益人',
  'gp-person-rel': '个人关系图谱',
}
export const SCORE_PROD_DESC: Record<ScoreProd, string> = {
  zhicha: '欺诈识别模型，分数越高欺诈风险越高',
  zhixin: '信用违约模型，分数越高违约概率越低',
  zhirong: '综合价值模型，融合违约/兴趣/资产维度',
  'jd-zonghe': '企业尽调综合得分，融合存客商机与风险动态',
  'jd-jingying': '企业健康度综合评分（成长性/知识产权/规模/质量/资本背景）',
  'jd-kongke': '空壳指数，从多维度扫描空壳特征，分值越大空壳概率越高',
  'jd-kechuang': '科创分，综合评价技术创新/科创资质/研发实力/成长性/行业潜力',
  'jd-hetong': '合同违约指数，评估企业合同违约风险等级',
  'jd-sifa': '司法风险，基于涉诉与司法执行情况评估风险',
  'gp-chain': '企业链图模型：融合股权、任职、担保等多维关系，刻画企业关联链路与核心主体',
  'gp-equity-pen': '股权穿透模型：穿透多层股权结构，识别最终实际控制人及持股路径',
  'gp-equity-str': '股权结构模型：解析企业股权构成与层级分布，量化集中度与稳定性',
  'gp-controller': '控制人关系模型：识别法定代表人与实际控制人的控制链条与关联关系',
  'gp-beneficial': '受益所有人模型：依据反洗钱口径识别最终受益所有人及其受益比例',
  'gp-company-rel': '企业关系模型：刻画企业间投资、担保、交易等关联关系网络',
  'gp-related-party': '关联方认定模型：按会计准则与监管口径认定关联方及其交易',
  'gp-top-beneficiary': '十大受益人模型：识别持股比例最高的前十名受益人及权益结构',
  'gp-person-rel': '个人关系图谱模型：融合联系人、共债、资金、担保、设备等多维关系，刻画个人关联网络',
}

/* ---------- 模型 ---------- */
export interface ModelDim {
  name: string
  value: string
  weight: number
}
export interface ModelMeta {
  prod: ScoreProd
  name: string
  range: [number, number]
  color: string
  score: number
  dims: ModelDim[]
  enabled: boolean
  version: string
  updatedAt: string
  factors: { name: string; weight: number }[]
  algoType: string
  algoCode: string
  summary?: string // 模型一句话简介（卡片展示，区别于个体得分）
  versions: ModelVersion[]
  collisionRules: CollisionRule[]
  bins?: ScoreCardFactor[] // 评分卡：分箱→计分表（让分数可从原始数据算出、可验证）
  decisionGraph?: import('./modelGraphData').GGraph // 算法编辑画布：用户定制的决策图（未定制则用静态默认）
  /* ===== 三层封装改造（2026-08-15）：Tab3 全局 + Tab4 上区域 + Tab3 + Tab4 下区域 ===== */
  riskTagConfig?: RiskTagConfig // Tab3 全局配置（标签支线开关/冲突策略/空命中默认标签）
  scoreMapMode?: 'segment' | 'formula' // Tab4 区块B 映射方式：分段表 / 线性公式
  scoreFormula?: string               // Tab4 区块B 线性公式（如 standard_score = Round(predict_prob * 100)）
  probScoreMap?: ProbScoreSeg[]       // Tab4 区块B：原生概率 p → 标准分 映射段
  scoreLevelMap?: ScoreLevelSeg[]     // Tab4 区块C：标准分 → 风险等级 分段
  riskLabels?: RiskLabel[]            // Tab3 风险标签：引用决策引擎资产的并行规则支线，产出风险标签
  fusionStrategy?: FusionStrategy     // Tab4 区块A：融合处置策略全局配置
  levelDefaultDecision?: LevelDefaultDecision[] // Tab4 兜底：等级默认处置映射表
  fusionRules?: FusionRule[]          // Tab4 下区域：等级 × 标签 融合处置规则
}

/* 模型配置阶段的「规则碰撞 · 冲突裁决」规则：
 * 当多条规则同时命中产生冲突时，如何裁决、并由此生成什么预警。
 * 冲突条件结构化（字段+操作符+值，可序列化、可执行），结果枚举化（不再自由文本）。
 * 这是真实可配置的模型策略，编辑后随 scoreData.json 持久化。 */
export interface CollisionRule {
  id: string
  cond: VFilter // 结构化冲突条件：信号源字段 + 操作符 + 值（复用 CondBuilder 的 VFilter）
  result: CollisionOutcome // 标准裁决结果 / 由此生成的预警（枚举，后端可直接映射动作）
  priority: '拦截优先' | '分数优先' | '转人工'
  enabled: boolean
}

/* 标准裁决结果（枚举）——原自由文本收敛为固定选项，后端执行可被映射 */
export type CollisionOutcome =
  | '强制拒绝'
  | '升级高风险预警'
  | '欺诈覆盖预警'
  | '评分-规则冲突预警'
  | '降为审慎授信'
  | '取保守策略'
  | '转人工复核'
export const COLLISION_OUTCOME_LABEL: CollisionOutcome[] = [
  '强制拒绝',
  '升级高风险预警',
  '欺诈覆盖预警',
  '评分-规则冲突预警',
  '降为审慎授信',
  '取保守策略',
  '转人工复核',
]

/* ===== 三层封装：Tab4 上区域·区块B「概率 p → 标准分映射」（分段表） ===== */
export interface ProbScoreSeg {
  probMin: number      // 概率下界（含），0~1
  probMax: number      // 概率上界（不含，末段取 1）
  standardScore: number // 映射出的对外标准分
  remark?: string       // 备注
}

/* ===== 三层封装：Tab4 上区域·区块C「标准分 → 风险等级 分段」 ===== */
export interface ScoreLevelSeg {
  scoreMin: number
  scoreMax: number
  levelCode: 'VLOW' | 'LOW' | 'MID' | 'HIGH' | 'VHIGH'
  levelName: string
}

/* ===== Tab3 全局配置（风险标签支线） ===== */
export interface RiskTagConfig {
  tagSwitch: boolean            // 标签支线总开关
  conflictStrategy: 'keep-all' | 'keep-highest' // 多标签命中冲突：全部保留 / 只保留最高优先级
  defaultTagOpen: boolean       // 空命中是否输出默认标签
}

/* ===== Tab4 上区域·区块A：融合处置策略全局配置 ===== */
export interface FusionStrategy {
  strategyName: string
  priorityMode: 'tag-first' | 'score-first' // 标签优先（强规则拦截）/ 分数优先
  defaultDecision: '通过' | '转人工' | '拒绝' // 兜底处置
  strategyStatus: boolean
  validStart: string  // 生效起（日期时间）
  validEnd: string    // 生效止（可空）
  strategyVersion: string
  updateUser: string
  updateTime: string
}

/* ===== 三层封装：Tab3「风险标签」（业务封装层，并行规则支线） =====
 * 引用决策引擎资产（名单库 list / 规则集 ruleset），命中派生风险标签；
 * 标签仅作解释信号，不影响概率与标准分，可配置是否计入 Tab4 融合处置。 */
export interface RiskLabel {
  id: string
  tagSort: number                // 遍历顺序（从小到大）
  tagCode: string                // 系统生成唯一编码（对外 API 标识）
  name: string                   // 标签名称（tag_name）
  tagLevel: '重度风险' | '中度风险' | '轻度风险' | '监控信号' // 标签等级/严重度
  refType: 'list' | 'ruleset'    // 数据源类型（公共名单库 / 公共规则集）
  ref: string                    // 决策引擎资产 id
  collisionCondition: 'single' | 'all' // 单条件触发 / 多规则同时命中才生成
  joinFusion: boolean            // 是否计入 Tab4 融合处置（核心控制位）
  isRiskMonitorTag: boolean      // 是否纳入自动化监控样本
  tagDesc: string                // 风险描述/业务解释
  enabled: boolean               // 启用/禁用
}

/* ===== 三级封装：Tab4 等级默认处置映射（兜底，无标签命中时生效） ===== */
export interface LevelDefaultDecision {
  level: 'VLOW' | 'LOW' | 'MID' | 'HIGH' | 'VHIGH'
  decision: '通过' | '转人工' | '拒绝'
  processId?: string
}

/* ===== 三层封装：Tab4 下区域·区块D「等级 + 标签 融合处置」 ===== */
export interface FusionRule {
  id: string
  ruleSort: number                         // 规则排序（从上至下依次匹配，命中即终止）
  baseRiskLevel: ('VLOW' | 'LOW' | 'MID' | 'HIGH' | 'VHIGH' | 'ALL')[] // 适配基础等级（ALL=全部）
  matchTagList: string[]                   // 引用的风险标签 tag_code 列表
  matchMode: 'all' | 'any'                 // 全部命中 / 任意命中
  finalDecision: '通过' | '转人工' | '拒绝'  // 处置意见
  processId?: string                        // 关联业务流程（bizFlows）
  outputRemark: string                      // 对外报文处置说明
  isActive: boolean                          // 启用开关
}

/** 全链路模拟：给定 predict_prob 与命中的标签 tag_code 列表，算出最终处置。 */
export function simulateFusion(m: ModelMeta, prob: number, hitTagCodes: string[]) {
  const probMap = m.probScoreMap ?? []
  const levelMap = m.scoreLevelMap ?? []
  let standardScore = 0
  if ((m.scoreMapMode ?? 'segment') === 'formula' && m.scoreFormula) {
    try {
      const Round = (x: number) => Math.round(x)
      // 仅允许 predict_prob 变量与基础运算，安全沙箱
      const expr = m.scoreFormula.split('=').slice(1).join('=')
      standardScore = Number(new Function('predict_prob', 'Round', `return (${expr})`)(prob, Round))
      if (!isFinite(standardScore)) standardScore = 0
    } catch { standardScore = 0 }
  } else {
    const seg = probMap.find((s) => prob >= s.probMin && prob < (s.probMax === 1 ? 1.0001 : s.probMax))
    standardScore = seg?.standardScore ?? (probMap[probMap.length - 1]?.standardScore ?? 0)
  }
  const lv = levelMap.find((s) => standardScore >= s.scoreMin && standardScore <= s.scoreMax)
  const riskLevel = lv?.levelCode ?? 'LOW'
  const riskLevelName = lv?.levelName ?? '未知'
  // 按 ruleSort 依次匹配融合规则（命中即终止）
  const rules = [...(m.fusionRules ?? [])].filter((r) => r.isActive).sort((a, b) => a.ruleSort - b.ruleSort)
  const strat = m.fusionStrategy
  let matched: FusionRule | undefined
  for (const r of rules) {
    const levelOk = r.baseRiskLevel.length === 0 || r.baseRiskLevel.includes('ALL') || r.baseRiskLevel.includes(riskLevel as 'VLOW' | 'LOW' | 'MID' | 'HIGH' | 'VHIGH')
    if (!levelOk) continue
    const hit = r.matchTagList.filter((t) => hitTagCodes.includes(t))
    if (r.matchTagList.length === 0) {
      // 无标签条件：仅看等级（用于纯分数兜底规则）；空 baseRiskLevel = 适用于所有等级
      if (hitTagCodes.length === 0 || strat?.priorityMode === 'score-first') { matched = r; break }
      continue
    }
    const tagOk = r.matchMode === 'all' ? hit.length === r.matchTagList.length : hit.length > 0
    if (tagOk) { matched = r; break }
  }
  const priorityTagHit = hitTagCodes.length > 0 && strat?.priorityMode === 'tag-first'
  let decision: '通过' | '转人工' | '拒绝'
  let processId: string | undefined
  let remark: string
  if (matched) {
    decision = matched.finalDecision
    processId = matched.processId
    remark = matched.outputRemark
  } else {
    // 兜底：等级默认处置
    const def = m.levelDefaultDecision?.find((d) => d.level === riskLevel)
    decision = def?.decision ?? (strat?.defaultDecision ?? '转人工')
    processId = def?.processId
    remark = priorityTagHit ? '命中标签但无匹配融合规则，按处置策略兜底' : '无标签命中，按处置策略兜底'
  }
  return { standardScore, riskLevel, riskLevelName, matchedRule: matched, decision, processId, remark }
}

/* 冲突裁决可用的「信号源」字段池（复用于 CondBuilder 下拉；与模型规则集/名单/分值区间同源） */
export const COLLISION_SIGNAL_FIELDS: { ref: string; label: string }[] = [
  { ref: 'blacklist', label: '外部黑灰名单' },
  { ref: 'device_sim', label: '设备模拟器特征' },
  { ref: 'rule_hit', label: '规则集命中' },
  { ref: 'score_zhicha', label: '智察分(0-100)' },
  { ref: 'score_zhixin', label: '智信分(300-900)' },
  { ref: 'score_zhirong', label: '智融分(350-950)' },
  { ref: 'm3_overdue', label: '历史 M3+ 逾期次数' },
  { ref: 'dir', label: '负债收入比(%)' },
  { ref: 'interest_dim', label: '兴趣维度' },
  { ref: 'asset_dim', label: '资产维度' },
]

/* 结构化冲突条件 → 可读文本（节点卡/详情展示用） */
export function collisionCondText(cond?: VFilter): string {
  if (!cond) return '（未配置条件）'
  const labelOf = (ref: string) => COLLISION_SIGNAL_FIELDS.find((f) => f.ref === ref)?.label ?? ref
  const render = (c: VisualCond): string => {
    const f = labelOf(c.field)
    const op = VISUAL_OP_LABEL[c.op] ?? c.op
    if (c.op === 'range') return `${f} ${op} ${c.value ?? ''}~${c.rangeMax ?? ''}`
    if (c.op === 'in') return `${f} ${op} [${(c.values ?? []).join('/')}]`
    if (c.op === 'has' || c.op === 'empty') return `${f} ${op}`
    return `${f} ${op} ${c.value ?? ''}`
  }
  const parts: string[] = []
  ;(cond.loose ?? []).forEach((c) => parts.push(render(c)))
  ;(cond.groups ?? []).forEach((g) => {
    const inner = (g.conds ?? []).map(render).join(g.logic === 'or' ? ' 或 ' : ' 且 ')
    parts.push(`（${inner}）`)
  })
  if (!parts.length) return '（未配置条件）'
  return parts.join(cond.logic === 'or' ? ' 或 ' : ' 且 ')
}

/* 默认碰撞裁决规则（单一来源：SEED 引用、组件回退旧数据均用它） */
export const COLLISION_SEED: Record<ScoreProd, CollisionRule[]> = {
  zhicha: [
    { id: 'zc-1', cond: { logic: 'and', groups: [], loose: [{ field: 'blacklist', op: 'eq', value: '命中' }] }, result: '强制拒绝', priority: '拦截优先', enabled: true },
    { id: 'zc-2', cond: { logic: 'and', groups: [], loose: [
      { field: 'device_sim', op: 'eq', value: '命中' },
      { field: 'score_zhicha', op: 'range', value: '40', rangeMax: '69' },
    ] }, result: '升级高风险预警', priority: '转人工', enabled: true },
    { id: 'zc-3', cond: { logic: 'and', groups: [], loose: [
      { field: 'rule_hit', op: 'eq', value: '拒绝' },
      { field: 'score_zhicha', op: 'lt', value: '40' },
    ] }, result: '欺诈覆盖预警', priority: '拦截优先', enabled: true },
  ],
  zhixin: [
    { id: 'zx-1', cond: { logic: 'and', groups: [], loose: [
      { field: 'score_zhixin', op: 'range', value: '781', rangeMax: '900' },
      { field: 'm3_overdue', op: 'range', value: '2', rangeMax: '99' },
    ] }, result: '评分-规则冲突预警', priority: '拦截优先', enabled: true },
    { id: 'zx-2', cond: { logic: 'and', groups: [], loose: [
      { field: 'dir', op: 'range', value: '70', rangeMax: '100' },
      { field: 'score_zhixin', op: 'range', value: '661', rangeMax: '780' },
    ] }, result: '降为审慎授信', priority: '分数优先', enabled: true },
  ],
  zhirong: [
    { id: 'zr-1', cond: { logic: 'and', groups: [], loose: [
      { field: 'score_zhicha', op: 'range', value: '70', rangeMax: '100' },
      { field: 'score_zhirong', op: 'range', value: '800', rangeMax: '950' },
    ] }, result: '欺诈覆盖预警', priority: '拦截优先', enabled: true },
    { id: 'zr-2', cond: { logic: 'or', groups: [], loose: [
      { field: 'interest_dim', op: 'eq', value: '冲突' },
      { field: 'asset_dim', op: 'eq', value: '冲突' },
    ] }, result: '取保守策略', priority: '分数优先', enabled: true },
  ],
}

/* ---------- 评分卡 · 分箱→计分表（让模型真正可从原始数据算出来） ----------
 * 之前 ModelMeta.factors 只存「特征重要性权重」，algoCode 是伪代码，
 * 所以 score 只是存着的数、倒推不出 —— 不可验证。
 * 这里补上「某个原始值 → 加几分」的硬规则（可序列化、可编辑、可审计）。
 * 匹配顺序：从上到下取第一个命中的区间（min/max 含端点，gt/lt 不含）。 */
export interface ScoreCardBin {
  label: string
  points: number
  min?: number
  max?: number
  gt?: number
  lt?: number
}
export interface ScoreCardFactor {
  key: string // 原始数据字段 key
  name: string // 展示名
  bins: ScoreCardBin[]
}

/* 智信分评分卡（单一来源，与 model-trace.html 2.2 一致；样例客户算得 712） */
export const ZHIXIN_SCORECARD: ScoreCardFactor[] = [
  { key: 'm3', name: '历史逾期记录（近2年 M3+ 次数）', bins: [
    { label: '0 次', points: 48, min: 0, max: 0 },
    { label: '1 次', points: 30, min: 1, max: 1 },
    { label: '2 次', points: 0, min: 2, max: 2 },
    { label: '≥3 次', points: -48, min: 3 },
  ] },
  { key: 'dir', name: '负债收入比（%）', bins: [
    { label: '≤40%', points: 44, max: 40 },
    { label: '41–60%', points: 26, min: 41, max: 60 },
    { label: '61–70%', points: -10, min: 61, max: 70 },
    { label: '>70%', points: -44, gt: 70 },
  ] },
  { key: 'inc', name: '收入稳定性（连续按时还款月数）', bins: [
    { label: '≥24 月', points: 40, min: 24 },
    { label: '12–23 月', points: 28, min: 12, max: 23 },
    { label: '6–11 月', points: -5, min: 6, max: 11 },
    { label: '<6 月', points: -40, lt: 6 },
  ] },
  { key: 'q6', name: '征信查询频次（近6月次数）', bins: [
    { label: '≤4 次', points: 40, max: 4 },
    { label: '5–9 次', points: 16, min: 5, max: 9 },
    { label: '10–15 次', points: -22, min: 10, max: 15 },
    { label: '>15 次', points: -40, gt: 15 },
  ] },
  { key: 'util', name: '授信使用率（%）', bins: [
    { label: '≤30%', points: 36, max: 30 },
    { label: '31–50%', points: 12, min: 31, max: 50 },
    { label: '51–70%', points: -14, min: 51, max: 70 },
    { label: '>70%', points: -36, gt: 70 },
  ] },
]
const ZHIXIN_BASE = 600

/** 智信分：基础分 600 + 各因子查表加分，裁剪到 [300,900]。
 *  raw 形如 { m3, dir, inc, q6, util }（数值）。返回每步明细，便于前端展示账本。 */
export function computeZhixin(raw: Record<string, number>): { score: number; total: number; steps: { factor: string; input: number; bin: string; points: number }[] } {
  let total = 0
  const steps: { factor: string; input: number; bin: string; points: number }[] = []
  for (const f of ZHIXIN_SCORECARD) {
    const v = Number(raw[f.key])
    const hit = f.bins.find((b) =>
      (b.min === undefined || v >= b.min) &&
      (b.max === undefined || v <= b.max) &&
      (b.gt === undefined || v > b.gt) &&
      (b.lt === undefined || v < b.lt),
    )
    if (hit) {
      total += hit.points
      steps.push({ factor: f.name, input: v, bin: hit.label, points: hit.points })
    } else {
      // 未命中任何分箱（如小数落在整数箱间隙）：显式记 0 分并标注，避免静默落到最差档误判
      steps.push({ factor: f.name, input: v, bin: '未覆盖区间', points: 0 })
    }
  }
  return { score: Math.max(300, Math.min(900, ZHIXIN_BASE + total)), total, steps }
}

/** 通用「分数 → 等级 / 风险结论」解析：单一数据源，直接查 thresholds 配置。
 *  与 SEED_SCORE.thresholds 保持一致，避免列表/详情里的等级和阈值页脱节
 *  （之前 ScoreRecords 的 computeLevel 把 zhixin/zhirong 分界写死成 580，与阈值配置的 540/499 不符）。 */
export function resolveRisk(prod: ScoreProd, score: number): { level: string; meaning: string; action: string; range: string } | null {
  for (const t of SEED_SCORE.thresholds) {
    if (t.prod !== prod) continue
    const m = t.range.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/)
    if (!m) continue
    const min = Number(m[1])
    const max = Number(m[2])
    if (score >= min && score <= max) return { level: t.level, meaning: t.meaning, action: t.action, range: t.range }
  }
  return null
}

/** 单一数据源（模具 → 产品）：客户得分的风险等级 / 默认处置直接读模型 Tab4 的
 *  「风险等级映射表」(scoreLevelMap) +「等级默认处置」(levelDefaultDecision)，
 *  不再走独立的全局 thresholds，模型把等级扩成 4/5 段、改默认处置，得分页自动同步。 */
export function resolveRiskByModel(prod: ScoreProd, score: number): { level: string; code: string; meaning: string; action: string; range: string } | null {
  const m = SEED_SCORE.models.find((x) => x.prod === prod)
  if (!m) return null
  const seg = (m.scoreLevelMap ?? []).find((s) => score >= s.scoreMin && score <= s.scoreMax)
  if (!seg) return null
  const dec = (m.levelDefaultDecision ?? []).find((d) => d.level === seg.levelCode)
  return { level: seg.levelName, code: seg.levelCode, meaning: seg.levelName, action: dec?.decision ?? '—', range: `${seg.scoreMin}-${seg.scoreMax}` }
}

/** 模型等级分段表（按分数升序），供 nextUpgrade 等使用（单一数据源，读 scoreLevelMap）。 */
export function modelLevelRows(prod: ScoreProd) {
  const m = SEED_SCORE.models.find((x) => x.prod === prod)
  return (m?.scoreLevelMap ?? [])
    .map((s) => ({ min: s.scoreMin, max: s.scoreMax, code: s.levelCode, level: s.levelName }))
    .sort((a, b) => a.min - b.min)
}

/** 给定已判定的基础风险等级 + 本客户命中标签，匹配融合规则并得出最终处置（复用 simulateFusion 的匹配逻辑，
 *  但直接以等级 code 入参，避免用概率反推标准分导致与客户实际得分错位）。 */
export function fusionByLevel(m: ModelMeta, riskLevel: string, hitTagCodes: string[]) {
  const rules = [...(m.fusionRules ?? [])].filter((r) => r.isActive).sort((a, b) => a.ruleSort - b.ruleSort)
  const strat = m.fusionStrategy
  let matched: FusionRule | undefined
  for (const r of rules) {
    const levelOk = r.baseRiskLevel.length === 0 || r.baseRiskLevel.includes('ALL') || r.baseRiskLevel.includes(riskLevel as 'VLOW' | 'LOW' | 'MID' | 'HIGH' | 'VHIGH')
    if (!levelOk) continue
    const hit = r.matchTagList.filter((t) => hitTagCodes.includes(t))
    if (r.matchTagList.length === 0) {
      if (hitTagCodes.length === 0 || strat?.priorityMode === 'score-first') { matched = r; break }
      continue
    }
    const tagOk = r.matchMode === 'all' ? hit.length === r.matchTagList.length : hit.length > 0
    if (tagOk) { matched = r; break }
  }
  const priorityTagHit = hitTagCodes.length > 0 && strat?.priorityMode === 'tag-first'
  let decision: string
  let processId: string | undefined
  let remark: string
  if (matched) {
    decision = matched.finalDecision
    processId = matched.processId
    remark = matched.outputRemark
  } else {
    const def = m.levelDefaultDecision?.find((d) => d.level === riskLevel)
    decision = def?.decision ?? (strat?.defaultDecision ?? '转人工')
    processId = def?.processId
    remark = hitTagCodes.length > 0 ? '命中标签但无匹配融合规则，按处置策略兜底' : '无标签命中，按处置策略兜底'
  }
  return { matchedRule: matched, decision, processId, remark }
}

/** 智信分 → 等级/动作（委托 resolveRisk，与 SEED thresholds 单一来源一致） */
export function zhixinGrade(s: number): { level: string; action: string } {
  const r = resolveRisk('zhixin', s)
  return r ? { level: r.level, action: r.action } : { level: 'D', action: '拒绝' }
}

/** 某产品阈值档位（按分数升序，含边界） */
export function thresholdRows(prod: ScoreProd) {
  return SEED_SCORE.thresholds
    .filter((t) => t.prod === prod)
    .map((t) => {
      const m = t.range.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/)
      return { min: Number(m?.[1]), max: Number(m?.[2]), level: t.level, range: t.range, action: t.action }
    })
    .sort((a, b) => a.min - b.min)
}

/** 某产品运营效果指标（覆盖率/准确率/及时率/调用量，供「评分产品指标卡」组件使用） */
export function scoreOpsOf(prod: ScoreProd): OpsMetric | undefined {
  return SEED_SCORE.ops.find((o) => o.prod === prod)
}

/** 距「下一档」的距离（用于概览提示）：
 *   信用/综合分（越高越好）→ 距上升一档的分数；欺诈分（越高越危险）→ 距高风险线的分数；已最优/已最高危返回 null。
 *   段位读模型 scoreLevelMap（单一数据源，与模具一致）。 */
export function nextUpgrade(prod: ScoreProd, score: number): { toLevel: string; gap: number } | null {
  const rows = modelLevelRows(prod)
  if (!rows.length) return null
  if (prod === 'zhicha') {
    const hi = rows.find((r) => r.code === 'HIGH')
    if (hi && score < hi.min) return { toLevel: hi.level, gap: hi.min - score }
    return null
  }
  const better = rows.filter((r) => r.min > score).sort((a, b) => a.min - b.min)[0]
  return better ? { toLevel: better.level, gap: better.min - score } : null
}

/* ---------- 评分记录 ---------- */
export interface ScoreRecord {
  id: string
  time: string
  custId: string
  custName: string
  model: ScoreProd
  score: number
  level: string
  hitLabels?: string[]      // 本次评分命中的风险标签（与模型风险标签同源，空数组表示未命中）
  source: string
  status: 'success' | 'fail'
}

/* ---------- 客群分组 ---------- */
export interface CrowdGroup {
  id: string
  name: string
  rule: string              // 规则可读文本（由 conds 生成；旧数据直接存文案）
  riskLevel?: string        // 兼容旧数据（已弃用：分组不再按风险等级定义）
  count: number             // 成员数：规则求值所得（编辑保存时写回；渲染时实时计算覆盖展示）
  conds?: VisualCond[]      // 结构化规则条件（复用指标库可视化 SQL 的条件结构）
  logic?: 'and' | 'or'      // 顶层条件连接关系
  createdAt?: string
  updatedAt?: string
}

/* ---------- 评分分布 ---------- */
export interface ScoreDist {
  prod: ScoreProd
  labels: string[]
  data: number[]
}

/* ---------- 命中分析 ---------- */
export interface HitRule {
  rule: string
  model: ScoreProd
  hits: number
  rate: number
  type?: 'rule' | 'list' // 命中来源：规则命中 / 名单命中
}
export interface FunnelStep {
  label: string
  value: number
}

/* ---------- 运营效果指标（模型监控 / 模型效果） ---------- */
export interface OpsMetric {
  prod: ScoreProd
  coverage: number
  accuracy: number
  timely: number
  calls: number
  psi: number
  psiStatus: '稳定' | '临界' | '偏移'
  trend: { month: string; coverage: number; accuracy: number; timely: number; calls: number }[]
}

/* ---------- 评分阈值 ---------- */
export interface ThresholdRow {
  prod: ScoreProd
  range: string
  level: string
  meaning: string
  action: string
  bizFlowId?: string // 关联预警业务流程（管理中心「业务流程」库），分值落入该分区即触发对应预警流程
}

/* ---------- 预警规则 ---------- */
export interface AlertRule {
  id: string
  name: string
  cond: string
  threshold: number
  level: string
  enabled: boolean
}

/* ---------- 版本管理 ---------- */
export interface ModelVersion {
  version: string
  date: string
  note: string
  current: boolean
}

export interface ScoreData {
  models: ModelMeta[]
  records: ScoreRecord[]
  crowds: CrowdGroup[]
  dist: ScoreDist[]
  hits: HitRule[]
  funnel: FunnelStep[]
  ops: OpsMetric[]
  thresholds: ThresholdRow[]
  alertRules: AlertRule[]
  callTrend: { month: string; zhicha: number; zhixin: number; zhirong: number }[]
  riskRate: number
  monthlyCount: number
}

export const SEED_SCORE: ScoreData = {
  models: [
    {
      prod: 'zhicha',
      name: '智察分',
      range: [0, 100],
      color: '#ef4444',
      score: 78,
      dims: [
        { name: '多头借贷强度', value: '7 家 / 30天', weight: 28 },
        { name: '设备环境风险', value: '模拟器特征命中', weight: 22 },
        { name: '黑灰名单命中', value: '外部灰名单', weight: 20 },
        { name: '同设备关联', value: '3 个关联账号', weight: 18 },
      ],
      enabled: true,
      version: 'v2.3.1',
      updatedAt: '2026-07-28',
        summary: "基于设备/网络/行为/名单多维度识别欺诈风险，分数越高欺诈概率越高",
      algoType: '梯度提升树 XGBoost + 规则硬拦截 + 规则修正',
      algoCode: `# 智察分 · 欺诈识别模型（XGBoost + 规则硬拦截 + 主线规则修正）
# 输出 0-100，分数越高欺诈风险越高
def score_zhicha(req):
    feats = extract_features(req)                 # 设备/网络/行为/名单
    base = xgb_model.predict_proba(feats)['fraud'] * 100   # 欺诈基础分 0-100
    if hit_blacklist(req):                        # 规则硬拦截：命中外部黑灰名单直接封顶
        base = max(base, 95)
    # 主线风险规则修正引擎（独立判定、累加，封顶 100）
    adjust = 0
    if device_multi_apply_tag == 1:  adjust += 12   # Rule-001 同设备短期多次申请
    if ip_risk_tag == 1:            adjust += 10   # Rule-002 申请IP风险画像
    if black_contact_tag == 1:      adjust += 15   # Rule-003 紧急联系人命中风险名单
    if mobile_register_months < 3:  adjust += 8    # Rule-004 手机号入网不足3个月
    final = min(base + adjust, 100)                # 分数上限100，不溢出
    return round(final, 1)

# 特征分裂增益（归一化）
WEIGHTS = {
    '近30天申贷平台数': 0.28,
    '设备环境风险':     0.22,
    '命中黑灰名单':     0.20,
    '同设备关联账号':   0.18,
    '负债收入比':       0.12,
}`,
      versions: [
        { version: 'v2.3.1', date: '2026-07-28', note: '优化设备风险识别，欺诈召回提升 3.1pp', current: true },
        { version: 'v1.3.0', date: '2026-06-15', note: '三模型统一评分服务化，支持批量与 API', current: false },
      ],
      factors: [
        { name: '近30天申贷平台数', weight: 28 },
        { name: '设备环境风险', weight: 22 },
        { name: '命中黑灰名单', weight: 20 },
        { name: '同设备关联账号', weight: 18 },
        { name: '负债收入比', weight: 12 },
      ],
      /* 主线规则修正引擎（数据落地：规则集与算法分离，改内容只动此处） */
      bins: [
        { key: 'rule_001', name: 'Rule-001 同一设备短期内多次申请', bins: [{ label: 'device_multi_apply_tag == 1', points: 12 }] },
        { key: 'rule_002', name: 'Rule-002 申请IP存在风险画像', bins: [{ label: 'ip_risk_tag == 1', points: 10 }] },
        { key: 'rule_003', name: 'Rule-003 紧急联系人命中风险名单', bins: [{ label: 'black_contact_tag == 1', points: 15 }] },
        { key: 'rule_004', name: 'Rule-004 手机号入网不足3个月', bins: [{ label: 'mobile_register_months < 3', points: 8 }] },
      ],
      collisionRules: COLLISION_SEED.zhicha.map((r) => ({ ...r })),
      /* ===== Tab3 全局配置（风险标签支线） ===== */
      riskTagConfig: { tagSwitch: true, conflictStrategy: 'keep-all', defaultTagOpen: true },
      /* ===== Tab4 区块B：概率 p → 标准分 映射（智察分 0~100，分段表） ===== */
      scoreMapMode: 'segment',
      scoreFormula: 'standard_score = Round(predict_prob * 100)',
      probScoreMap: [
        { probMin: 0, probMax: 0.1, standardScore: 5, remark: '欺诈概率极低' },
        { probMin: 0.1, probMax: 0.3, standardScore: 25, remark: '' },
        { probMin: 0.3, probMax: 0.7, standardScore: 60, remark: '' },
        { probMin: 0.7, probMax: 1, standardScore: 92, remark: '欺诈概率极高' },
      ],
      /* ===== Tab4 区块C：标准分 → 风险等级 分段 ===== */
      scoreLevelMap: [
        { scoreMin: 0, scoreMax: 15, levelCode: 'VLOW', levelName: '极低欺诈风险' },
        { scoreMin: 16, scoreMax: 42, levelCode: 'LOW', levelName: '低欺诈风险' },
        { scoreMin: 43, scoreMax: 76, levelCode: 'MID', levelName: '中等欺诈风险' },
        { scoreMin: 77, scoreMax: 100, levelCode: 'HIGH', levelName: '高欺诈风险' },
      ],
      /* ===== Tab3 风险标签：引用决策引擎资产，命中派生风险标签 ===== */
      riskLabels: [
        { id: 'rl-zc-1', tagSort: 1, tagCode: 'TAG_FRD_001', name: '黑灰名单命中', tagLevel: '重度风险', refType: 'list', ref: 'L-009', collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '命中外部黑灰名单，存在欺诈嫌疑', enabled: true },
        { id: 'rl-zc-2', tagSort: 2, tagCode: 'TAG_FRD_002', name: '设备群控特征', tagLevel: '中度风险', refType: 'ruleset', ref: 'P-104', collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '同设备群控特征，疑似团伙申请', enabled: true },
        { id: 'rl-zc-3', tagSort: 3, tagCode: 'TAG_FRD_003', name: '团伙欺诈关联', tagLevel: '重度风险', refType: 'list', ref: 'L-008', collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '与已知欺诈团伙关联', enabled: true },
        { id: 'rl-zc-4', tagSort: 4, tagCode: 'TAG_MON_001', name: '新手机号异地申请监控', tagLevel: '监控信号', refType: 'list', ref: 'L-001', collisionCondition: 'single', joinFusion: false, isRiskMonitorTag: true, tagDesc: '新入网手机号异地申请，纳入模型日常监控样本', enabled: true },
      ],
      /* ===== Tab4 区块A：融合处置策略全局配置 ===== */
      fusionStrategy: { strategyName: '智能察分V2.4处置策略', priorityMode: 'tag-first', defaultDecision: '转人工', strategyStatus: true, validStart: '2026-08-15 00:00', validEnd: '', strategyVersion: 'V2.4', updateUser: 'admin', updateTime: '2026-08-15 16:00' },
      /* ===== Tab4 等级默认处置映射（兜底） ===== */
      levelDefaultDecision: [
        { level: 'VLOW', decision: '通过', processId: 'f-online-approve' },
        { level: 'LOW', decision: '通过', processId: 'f-online-approve' },
        { level: 'MID', decision: '转人工', processId: 'f-loan-review' },
        { level: 'HIGH', decision: '拒绝', processId: 'f-score-dispose' },
      ],
      /* ===== Tab4 区块D：融合处置规则（等级 + 标签） ===== */
      fusionRules: [
        { id: 'fr-zc-1', ruleSort: 1, baseRiskLevel: [], matchTagList: ['TAG_FRD_001', 'TAG_FRD_003'], matchMode: 'any', finalDecision: '拒绝', processId: 'f-score-dispose', outputRemark: '命中黑灰名单 / 团伙欺诈等重度欺诈标签，不论分值区间一律拒绝', isActive: true },
        { id: 'fr-zc-2', ruleSort: 2, baseRiskLevel: ['HIGH'], matchTagList: [], matchMode: 'any', finalDecision: '拒绝', processId: 'f-score-dispose', outputRemark: '高风险分值区间，即便无严重标签也按评分预警处置拒绝', isActive: true },
        { id: 'fr-zc-3', ruleSort: 3, baseRiskLevel: ['LOW', 'MID'], matchTagList: ['TAG_FRD_002'], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '中低分值区间命中设备群控等中度风险标签，转贷前人工复核', isActive: true },
        { id: 'fr-zc-4', ruleSort: 4, baseRiskLevel: ['VLOW', 'LOW'], matchTagList: [], matchMode: 'any', finalDecision: '通过', processId: 'f-online-approve', outputRemark: '极低 / 低分值区间且无风险预警命中，自动通过上线', isActive: true },
        { id: 'fr-zc-5', ruleSort: 5, baseRiskLevel: ['HIGH'], matchTagList: ['TAG_FRD_002'], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '高风险区间命中设备群控等中度风险标签，转人工复核', isActive: true },
        { id: 'fr-zc-6', ruleSort: 6, baseRiskLevel: ['MID'], matchTagList: [], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '中风险区间无标签命中，按等级默认处置转人工复核', isActive: true },
        { id: 'fr-zc-7', ruleSort: 7, baseRiskLevel: ['VLOW', 'LOW'], matchTagList: ['TAG_FRD_001', 'TAG_FRD_003'], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '极低 / 低分区间仍命中重度欺诈标签，转人工复核（不轻易通过）', isActive: true },
      ],
    },
    {
      prod: 'zhixin',
      name: '智信分',
      range: [300, 900],
      color: '#22c55e',
      score: 712,
      dims: [
        { name: '历史逾期记录', value: '近2年 M3+ 1 次', weight: 26 },
        { name: '负债收入比', value: '58%', weight: 22 },
        { name: '征信查询频次', value: '近6月 8 次', weight: 18 },
        { name: '收入稳定性', value: '连续 14 月', weight: 20 },
        { name: '授信使用率', value: '43%', weight: 14 },
      ],
      enabled: true,
      version: 'v3.1.0',
      updatedAt: '2026-08-02',
        summary: "评估企业信用违约概率，融合历史逾期、负债收入比、征信查询等维度",
      algoType: '评分卡 · 逻辑回归（Logistic Regression）',
      algoCode: `# 智信分 · 评分卡算法（逻辑回归）
# Score = A - B * ln(odds)，基础分 A=600，斜率 B=20
def score_zhixin(features):
    points = 600                         # 基础分
    points += w_历史逾期记录(features['m3_overdue'])
    points += w_负债收入比(features['dir'])
    points += w_征信查询频次(features['query_6m'])
    points += w_收入稳定性(features['income_stable'])
    points += w_授信使用率(features['util_rate'])
    return clip(points, 300, 900)

# 因子权重（WOE 系数 * B）
WEIGHTS = {
    '历史逾期记录': 0.26,
    '负债收入比':   0.22,
    '征信查询频次': 0.18,
    '收入稳定性':   0.20,
    '授信使用率':   0.14,
}`,
      versions: [
        { version: 'v3.1.0', date: '2026-08-02', note: '新增负债收入比特征，KS 提升至 0.38', current: true },
        { version: 'v1.3.0', date: '2026-06-15', note: '三模型统一评分服务化，支持批量与 API', current: false },
      ],
      factors: [
        { name: '历史逾期记录', weight: 26 },
        { name: '负债收入比', weight: 22 },
        { name: '征信查询频次', weight: 18 },
        { name: '收入稳定性', weight: 20 },
        { name: '授信使用率', weight: 14 },
      ],
      collisionRules: COLLISION_SEED.zhixin.map((r) => ({ ...r })),
      bins: ZHIXIN_SCORECARD.map((f) => ({ ...f, bins: f.bins.map((b) => ({ ...b })) })),
      /* ===== Tab3 全局配置（风险标签支线） ===== */
      riskTagConfig: { tagSwitch: true, conflictStrategy: 'keep-all', defaultTagOpen: true },
      /* ===== Tab4 区块B：概率 p → 标准分 映射（智信分 300~900，分段表） ===== */
      scoreMapMode: 'segment',
      scoreFormula: 'standard_score = 300 + Round(predict_prob * 600)',
      probScoreMap: [
        { probMin: 0, probMax: 0.3, standardScore: 350, remark: '信用极好' },
        { probMin: 0.3, probMax: 0.5, standardScore: 560, remark: '' },
        { probMin: 0.5, probMax: 0.7, standardScore: 720, remark: '' },
        { probMin: 0.7, probMax: 1, standardScore: 820, remark: '信用较差' },
      ],
      /* ===== Tab4 区块C：标准分 → 风险等级 分段 ===== */
      scoreLevelMap: [
        { scoreMin: 300, scoreMax: 430, levelCode: 'VLOW', levelName: '极低信用风险' },
        { scoreMin: 431, scoreMax: 640, levelCode: 'LOW', levelName: '低信用风险' },
        { scoreMin: 641, scoreMax: 760, levelCode: 'MID', levelName: '中等信用风险' },
        { scoreMin: 761, scoreMax: 900, levelCode: 'HIGH', levelName: '高信用风险' },
      ],
      /* ===== Tab3 风险标签：引用决策引擎资产，命中派生信用标签 ===== */
      riskLabels: [
        { id: 'rl-zx-1', tagSort: 1, tagCode: 'TAG_CRD_001', name: '制裁/PEP 名单命中', tagLevel: '重度风险', refType: 'list', ref: 'L-005', collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '命中制裁/PEP 名单，合规强拒', enabled: true },
        { id: 'rl-zx-2', tagSort: 2, tagCode: 'TAG_CRD_002', name: '地址聚集风险', tagLevel: '中度风险', refType: 'ruleset', ref: 'P-102', collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '申请地址高度聚集，疑似中介包装', enabled: true },
        { id: 'rl-zx-3', tagSort: 3, tagCode: 'TAG_CRD_003', name: '中介号码关联', tagLevel: '中度风险', refType: 'list', ref: 'L-001', collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '号码关联已知中介，疑似骗贷', enabled: true },
      ],
      /* ===== Tab4 区块A：融合处置策略全局配置 ===== */
      fusionStrategy: { strategyName: '智信分V3.1处置策略', priorityMode: 'score-first', defaultDecision: '转人工', strategyStatus: true, validStart: '2026-08-02 00:00', validEnd: '', strategyVersion: 'V3.1', updateUser: 'admin', updateTime: '2026-08-02 10:00' },
      /* ===== Tab4 等级默认处置映射（兜底） ===== */
      levelDefaultDecision: [
        { level: 'VLOW', decision: '通过', processId: 'f-online-approve' },
        { level: 'LOW', decision: '通过', processId: 'f-online-approve' },
        { level: 'MID', decision: '转人工', processId: 'f-loan-review' },
        { level: 'HIGH', decision: '拒绝', processId: 'f-score-dispose' },
      ],
      /* ===== Tab4 区块D：融合处置规则（等级 + 标签） ===== */
      fusionRules: [
        { id: 'fr-zx-1', ruleSort: 1, baseRiskLevel: [], matchTagList: ['TAG_CRD_001'], matchMode: 'any', finalDecision: '拒绝', processId: 'f-score-dispose', outputRemark: '命中制裁 / PEP 名单，合规强拒不论分值区间', isActive: true },
        { id: 'fr-zx-2', ruleSort: 2, baseRiskLevel: ['HIGH'], matchTagList: [], matchMode: 'any', finalDecision: '拒绝', processId: 'f-score-dispose', outputRemark: '高风险分值区间，即便无严重标签也按评分预警处置拒绝', isActive: true },
        { id: 'fr-zx-3', ruleSort: 3, baseRiskLevel: ['LOW', 'MID'], matchTagList: ['TAG_CRD_002', 'TAG_CRD_003'], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '中低分值区间命中地址聚集 / 中介号码等中度风险，转贷前人工复核', isActive: true },
        { id: 'fr-zx-4', ruleSort: 4, baseRiskLevel: ['VLOW', 'LOW'], matchTagList: [], matchMode: 'any', finalDecision: '通过', processId: 'f-online-approve', outputRemark: '极低 / 低分值区间且无风险预警，自动通过上线', isActive: true },
        { id: 'fr-zx-5', ruleSort: 5, baseRiskLevel: ['HIGH'], matchTagList: ['TAG_CRD_002', 'TAG_CRD_003'], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '高风险区间命中地址聚集 / 中介号码等中度风险，转人工复核', isActive: true },
        { id: 'fr-zx-6', ruleSort: 6, baseRiskLevel: ['MID'], matchTagList: [], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '中风险区间无标签命中，按等级默认处置转人工复核', isActive: true },
        { id: 'fr-zx-7', ruleSort: 7, baseRiskLevel: ['VLOW'], matchTagList: ['TAG_CRD_002', 'TAG_CRD_003'], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '极低分区间命中中度风险标签，转人工复核（不自动通过）', isActive: true },
      ],
    },
    {
      prod: 'zhirong',
      name: '智融分',
      range: [350, 950],
      color: '#8b5cf6',
      score: 655,
      dims: [
        { name: '违约维度（智信分）', value: '信用分 712', weight: 34 },
        { name: '借贷兴趣', value: '近30天活跃 18 天', weight: 24 },
        { name: '转化意愿', value: '活动响应 2 次', weight: 18 },
        { name: '资产状况', value: '房产+理财持仓', weight: 24 },
      ],
      enabled: true,
      version: 'v1.4.2',
      updatedAt: '2026-07-31',
        summary: "融合违约、兴趣与资产维度评估客户综合价值，支撑差异化经营策略",
      algoType: '梯度提升树GBDT + 逻辑回归融合模型 · 信用规则修正 + 加权融合',
      algoCode: `# 智融分 · 综合价值模型（GBDT+LR 基础模型 + 信用规则修正 + 加权融合）
# 分数区间 350-950，基础分 600；分数越高信用资质越好、违约概率越低
def score_zhirong(cust):
    # 基础模型：GBDT+LR 融合违约/兴趣/转化/资产，输出 base_credit_score（350-950）
    base = gbdt_lr_model.predict(cust_features(cust))
    # 主线信用规则修正引擎（独立判定、累加；负向扣减、正向加分；封顶区间）
    adjust = 0
    if current_overdue_status == 1:                 adjust -= 60   # Rule-001 当前存在逾期
    if twentyfour_month_overdue_cnt >= 3:           adjust -= 40   # Rule-002 近24月多次逾期
    if credit_util_ratio > 0.85:                    adjust -= 35   # Rule-003 授信使用率过高
    if dti_ratio > 0.8:                             adjust -= 30   # Rule-004 负债收入比超标
    if six_month_query_cnt > 12:                    adjust -= 25   # Rule-005 征信查询频繁
    if overdue == 0 and util < 0.5 and dti < 0.4:   adjust += 20   # Rule-006 征信优质负债健康
    final_credit_score = clip(base + adjust, 350, 950)            # 强制约束区间，无溢出
    # 综合价值融合（违约维度由智信分提供）
    value = (0.34 * normalize(zhixin(cust)) +
             0.24 * interest(cust) +
             0.18 * conversion(cust) +
             0.24 * asset(cust)) * 600 + 300
    return value

# 融合权重
WEIGHTS = {
    '违约维度（智信分）': 0.34,
    '借贷兴趣':           0.24,
    '转化意愿':           0.18,
    '资产状况':           0.24,
}`,
      versions: [
        { version: 'v1.4.2', date: '2026-07-31', note: '融合资产维度，综合区分力提升', current: true },
        { version: 'v1.3.0', date: '2026-06-15', note: '三模型统一评分服务化，支持批量与 API', current: false },
      ],
      factors: [
        { name: '违约维度（智信分）', weight: 34 },
        { name: '借贷兴趣', weight: 24 },
        { name: '转化意愿', weight: 18 },
        { name: '资产状况', weight: 24 },
      ],
      /* 主线信用规则修正引擎（数据落地：规则集与算法分离，改内容只动此处） */
      bins: [
        { key: 'rule_001', name: 'Rule-001 当前存在逾期', bins: [{ label: 'current_overdue_status == 1', points: -60 }] },
        { key: 'rule_002', name: 'Rule-002 近24个月多次逾期', bins: [{ label: 'twentyfour_month_overdue_cnt >= 3', points: -40 }] },
        { key: 'rule_003', name: 'Rule-003 循环授信使用率过高', bins: [{ label: 'credit_util_ratio > 0.85', points: -35 }] },
        { key: 'rule_004', name: 'Rule-004 负债收入比超标', bins: [{ label: 'dti_ratio > 0.8', points: -30 }] },
        { key: 'rule_005', name: 'Rule-005 短期征信查询频繁', bins: [{ label: 'six_month_query_cnt > 12', points: -25 }] },
        { key: 'rule_006', name: 'Rule-006 征信优质负债健康', bins: [{ label: 'overdue == 0 && util < 0.5 && dti < 0.4', points: 20 }] },
      ],
      collisionRules: COLLISION_SEED.zhirong.map((r) => ({ ...r })),
      /* ===== Tab3 全局配置（风险标签支线） ===== */
      riskTagConfig: { tagSwitch: true, conflictStrategy: 'keep-all', defaultTagOpen: true },
      /* ===== Tab4 区块B：概率 p → 标准分 映射（智融分 350~950，越高越好） ===== */
      scoreMapMode: 'segment',
      scoreFormula: 'standard_score = 950 - Round(predict_prob * 570)',
      probScoreMap: [
        { probMin: 0, probMax: 0.2, standardScore: 900, remark: '优质价值客户' },
        { probMin: 0.2, probMax: 0.4, standardScore: 780, remark: '' },
        { probMin: 0.4, probMax: 0.6, standardScore: 650, remark: '' },
        { probMin: 0.6, probMax: 0.8, standardScore: 500, remark: '' },
        { probMin: 0.8, probMax: 1, standardScore: 380, remark: '低价值高风险' },
      ],
      /* ===== Tab4 区块C：标准分 → 风险等级 分段 ===== */
      scoreLevelMap: [
        { scoreMin: 350, scoreMax: 439, levelCode: 'VHIGH', levelName: '低价值高风险客户' },
        { scoreMin: 440, scoreMax: 574, levelCode: 'HIGH', levelName: '偏低价值客户' },
        { scoreMin: 575, scoreMax: 729, levelCode: 'MID', levelName: '一般价值客户' },
        { scoreMin: 730, scoreMax: 849, levelCode: 'LOW', levelName: '优质价值客户' },
        { scoreMin: 850, scoreMax: 950, levelCode: 'VLOW', levelName: '极高价值客户' },
      ],
      /* ===== Tab3 风险标签：引用决策引擎资产，命中派生价值/风险标签 ===== */
      riskLabels: [
        { id: 'rl-zr-1', tagSort: 1, tagCode: 'TAG_VAL_001', name: '代理IP灰名单', tagLevel: '监控信号', refType: 'list', ref: 'L-006', collisionCondition: 'single', joinFusion: false, isRiskMonitorTag: true, tagDesc: '命中代理IP灰名单，纳入模型日常监控样本', enabled: true },
        { id: 'rl-zr-2', tagSort: 2, tagCode: 'TAG_VAL_002', name: '设备风险评分卡低分', tagLevel: '中度风险', refType: 'ruleset', ref: 'P-104', collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '设备风险评分卡低分，疑似异常设备', enabled: true },
        { id: 'rl-zr-3', tagSort: 3, tagCode: 'TAG_VAL_003', name: '黑灰名单命中', tagLevel: '重度风险', refType: 'list', ref: 'L-009', collisionCondition: 'single', joinFusion: true, isRiskMonitorTag: false, tagDesc: '命中外部黑灰名单，存在欺诈嫌疑', enabled: true },
      ],
      /* ===== Tab4 区块A：融合处置策略全局配置 ===== */
      fusionStrategy: { strategyName: '智融分V1.4处置策略', priorityMode: 'score-first', defaultDecision: '转人工', strategyStatus: true, validStart: '2026-07-31 00:00', validEnd: '', strategyVersion: 'V1.4', updateUser: 'admin', updateTime: '2026-07-31 16:00' },
      /* ===== Tab4 等级默认处置映射（兜底） ===== */
      levelDefaultDecision: [
        { level: 'VLOW', decision: '通过', processId: 'f-online-approve' },
        { level: 'LOW', decision: '通过', processId: 'f-online-approve' },
        { level: 'MID', decision: '转人工', processId: 'f-loan-review' },
        { level: 'HIGH', decision: '转人工', processId: 'f-loan-review' },
        { level: 'VHIGH', decision: '拒绝', processId: 'f-score-dispose' },
      ],
      /* ===== Tab4 区块D：融合处置规则（等级 + 标签） ===== */
      fusionRules: [
        { id: 'fr-zr-1', ruleSort: 1, baseRiskLevel: [], matchTagList: ['TAG_VAL_003'], matchMode: 'any', finalDecision: '拒绝', processId: 'f-score-dispose', outputRemark: '命中黑灰名单等重度风险，不论价值高低一律拒绝', isActive: true },
        { id: 'fr-zr-2', ruleSort: 2, baseRiskLevel: ['VHIGH'], matchTagList: [], matchMode: 'any', finalDecision: '拒绝', processId: 'f-score-dispose', outputRemark: '低价值高风险区间，即便无严重标签也按评分预警处置拒绝', isActive: true },
        { id: 'fr-zr-3', ruleSort: 3, baseRiskLevel: ['MID', 'HIGH'], matchTagList: ['TAG_VAL_002'], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '偏低价值区间命中设备风险评分卡低分等中度风险，转人工复核', isActive: true },
        { id: 'fr-zr-4', ruleSort: 4, baseRiskLevel: ['VLOW', 'LOW'], matchTagList: [], matchMode: 'any', finalDecision: '通过', processId: 'f-online-approve', outputRemark: '极高 / 优质价值区间且无风险预警，自动通过上线', isActive: true },
        { id: 'fr-zr-5', ruleSort: 5, baseRiskLevel: ['HIGH'], matchTagList: ['TAG_VAL_002'], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '偏低价值高风险区间命中中度设备风险，转人工复核', isActive: true },
        { id: 'fr-zr-6', ruleSort: 6, baseRiskLevel: ['MID', 'HIGH'], matchTagList: [], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '中高风险区间无标签命中，按等级默认处置转人工复核', isActive: true },
        { id: 'fr-zr-7', ruleSort: 7, baseRiskLevel: ['VLOW', 'LOW'], matchTagList: ['TAG_VAL_003'], matchMode: 'any', finalDecision: '转人工', processId: 'f-loan-review', outputRemark: '极高价值区间仍命中黑灰名单等重度风险，转人工复核（不轻易通过）', isActive: true },
      ],
    },
    {
        prod: "jd-zonghe",
        name: "综合得分",
        range: [
          0,
          100
        ],
        color: "#DC2626",
        score: 0,
        algoType: "企业综合评估模型（存客商机与风险动态）",
        algoCode: "综合得分基于企业尽调的存客商机与风险动态综合评估。商机维度覆盖商机营销、关联营销、集团营销、相似营销、位置营销等渠道数量；风险维度覆盖开庭公告、法院公告、裁判文书等风险动态，综合得出企业合作价值与风险结论。",
        dims: [
          {
            name: "商机营销",
            value: "2 条",
            weight: 2
          },
          {
            name: "关联营销",
            value: "611 条",
            weight: 611
          },
          {
            name: "集团营销",
            value: "249 条",
            weight: 249
          },
          {
            name: "相似营销",
            value: "11 条",
            weight: 11
          },
          {
            name: "位置营销",
            value: "20353 条",
            weight: 20353
          },
          {
            name: "风险动态",
            value: "95 条",
            weight: 95
          }
        ],
        factors: [
          {
            name: "商机营销",
            weight: 2
          },
          {
            name: "关联营销",
            weight: 611
          },
          {
            name: "集团营销",
            weight: 249
          },
          {
            name: "相似营销",
            weight: 11
          },
          {
            name: "位置营销",
            weight: 20353
          },
          {
            name: "风险动态",
            weight: 95
          }
        ],
        enabled: true,
        version: "v1.0.0",
        updatedAt: "2026-08-24",
        summary: "融合存客商机与风险动态，综合评估企业合作价值与风险结论",
        versions: [
          {
            version: "v1.0.0",
            date: "2026-08-24",
            note: "企业尽调报告导入",
            current: true
          }
        ],
        collisionRules: [
          {
            id: "jd-zonghe-1",
            cond: {
              logic: "and",
              groups: [],
              loose: []
            },
            result: "转人工复核",
            priority: "分数优先",
            enabled: false
          }
        ],
        decisionGraph: {
          width: 800,
          height: 400,
          nodes: [],
          edges: []
        }
      },
    {
        prod: "jd-jingying",
        name: "经营指数",
        range: [
          0,
          100
        ],
        color: "#1677ff",
        score: 65,
        algoType: "企业健康度综合评分模型（多维加权）",
        algoCode: "经营指数（企业健康度 / 启信分）从成长性、知识产权、企业规模、经营质量、资本背景等维度综合评分，总分 450 分，多维加权得出企业整体健康度。",
        dims: [
          {
            name: "成长性",
            value: "30 分",
            weight: 30
          },
          {
            name: "知识产权",
            value: "95 分",
            weight: 95
          },
          {
            name: "企业规模",
            value: "95 分",
            weight: 95
          },
          {
            name: "经营质量",
            value: "95 分",
            weight: 95
          },
          {
            name: "资本背景",
            value: "90 分",
            weight: 90
          }
        ],
        factors: [
          {
            name: "成长性",
            weight: 30
          },
          {
            name: "知识产权",
            weight: 95
          },
          {
            name: "企业规模",
            weight: 95
          },
          {
            name: "经营质量",
            weight: 95
          },
          {
            name: "资本背景",
            weight: 90
          }
        ],
        enabled: true,
        version: "v1.0.0",
        updatedAt: "2026-08-24",
        summary: "从成长性、知识产权、企业规模、经营质量、资本背景等维度综合评估企业健康度",
        versions: [
          {
            version: "v1.0.0",
            date: "2026-08-24",
            note: "企业尽调报告导入",
            current: true
          }
        ],
        collisionRules: [
          {
            id: "jd-jingying-1",
            cond: {
              logic: "and",
              groups: [],
              loose: []
            },
            result: "转人工复核",
            priority: "分数优先",
            enabled: false
          }
        ],
        decisionGraph: {
          width: 800,
          height: 400,
          nodes: [],
          edges: []
        }
      },
    {
        prod: "jd-kongke",
        name: "空壳指数",
        range: [
          0,
          100
        ],
        color: "#D97706",
        score: 72,
        algoType: "空壳特征扫描模型",
        algoCode: "空壳指数是从企业经营场所、资产形态、企业人员、经营活动、经营资质、风险信息等维度，扫描空壳特征，用于供应链管理、信贷风控、经济犯罪侦查或税务稽查等应用场景。指数范围0-100，分值越大，主体是空壳的概率越高。",
        dims: [
          {
            name: "经营异常",
            value: "扫描项",
            weight: 1
          },
          {
            name: "治理结构异常",
            value: "扫描项",
            weight: 1
          },
          {
            name: "税务违法违规",
            value: "扫描项",
            weight: 1
          },
          {
            name: "相关诉讼违法记录",
            value: "扫描项",
            weight: 1
          },
          {
            name: "严重违法失信",
            value: "扫描项",
            weight: 1
          },
          {
            name: "联系方式异常",
            value: "扫描项",
            weight: 1
          },
          {
            name: "注册地址异常",
            value: "扫描项",
            weight: 1
          },
          {
            name: "法定代表人异常",
            value: "扫描项",
            weight: 1
          },
          {
            name: "高危变更",
            value: "扫描项",
            weight: 1
          },
          {
            name: "关联企业异常",
            value: "扫描项",
            weight: 1
          },
          {
            name: "一址多企",
            value: "扫描项",
            weight: 1
          }
        ],
        factors: [
          {
            name: "经营异常",
            weight: 1
          },
          {
            name: "治理结构异常",
            weight: 1
          },
          {
            name: "税务违法违规",
            weight: 1
          },
          {
            name: "相关诉讼违法记录",
            weight: 1
          },
          {
            name: "严重违法失信",
            weight: 1
          },
          {
            name: "联系方式异常",
            weight: 1
          },
          {
            name: "注册地址异常",
            weight: 1
          },
          {
            name: "法定代表人异常",
            weight: 1
          },
          {
            name: "高危变更",
            weight: 1
          },
          {
            name: "关联企业异常",
            weight: 1
          },
          {
            name: "一址多企",
            weight: 1
          }
        ],
        enabled: true,
        version: "v1.0.0",
        updatedAt: "2026-08-24",
        summary: "从经营场所、资产形态、人员、活动、资质、风险信息等维度扫描空壳特征",
        versions: [
          {
            version: "v1.0.0",
            date: "2026-08-24",
            note: "企业尽调报告导入",
            current: true
          }
        ],
        collisionRules: [
          {
            id: "jd-kongke-1",
            cond: {
              logic: "and",
              groups: [],
              loose: []
            },
            result: "转人工复核",
            priority: "分数优先",
            enabled: false
          }
        ],
        decisionGraph: {
          width: 800,
          height: 400,
          nodes: [],
          edges: []
        }
      },
    {
        prod: "jd-kechuang",
        name: "科创分",
        range: [
          0,
          100
        ],
        color: "#7C3AED",
        score: 81,
        algoType: "科创企业评分模型（5大类20+细分维度）",
        algoCode: "科创企业评分，是从企业技术创新、科创资质、研发实力、企业成长性以及行业潜力5个大类（20+个细分维度）维度综合评价企业的科技创新能力以及发展潜力。辅助金融机构、政府/产业园等多种业务应用场景决策。",
        dims: [
          {
            name: "技术创新",
            value: "90 分",
            weight: 90
          },
          {
            name: "研发实力",
            value: "85 分",
            weight: 85
          },
          {
            name: "科创资质",
            value: "40 分",
            weight: 40
          },
          {
            name: "企业成长性",
            value: "30 分",
            weight: 30
          },
          {
            name: "行业潜力",
            value: "45 分",
            weight: 45
          }
        ],
        factors: [
          {
            name: "技术创新",
            weight: 90
          },
          {
            name: "研发实力",
            weight: 85
          },
          {
            name: "科创资质",
            weight: 40
          },
          {
            name: "企业成长性",
            weight: 30
          },
          {
            name: "行业潜力",
            weight: 45
          }
        ],
        enabled: true,
        version: "v1.0.0",
        updatedAt: "2026-08-24",
        summary: "从技术创新、科创资质、研发实力、企业成长性、行业潜力综合评价科技创新能力",
        versions: [
          {
            version: "v1.0.0",
            date: "2026-08-24",
            note: "企业尽调报告导入",
            current: true
          }
        ],
        collisionRules: [
          {
            id: "jd-kechuang-1",
            cond: {
              logic: "and",
              groups: [],
              loose: []
            },
            result: "转人工复核",
            priority: "分数优先",
            enabled: false
          }
        ],
        decisionGraph: {
          width: 800,
          height: 400,
          nodes: [],
          edges: []
        }
      },
    {
        prod: "jd-hetong",
        name: "合同违约指数",
        range: [
          0,
          100
        ],
        color: "#EA580C",
        score: 58,
        algoType: "合同违约风险评估模型",
        algoCode: "合同违约指数基于企业服务合同纠纷裁判文书，统计违约次数、被执行次数、违约金额及行业排名等，评估企业合同履约风险。指数范围0-100，分值越高违约风险越高。当前违约指数55分、违约等级L6、违约风险高；违约次数59、被执行次数264、违约金额1.68亿元、行业平均违约金额303.07万元。",
        dims: [
          {
            name: "违约次数",
            value: "59 次",
            weight: 59
          },
          {
            name: "被执行次数",
            value: "264 次",
            weight: 264
          },
          {
            name: "违约金额",
            value: "1.68 亿元",
            weight: 16800
          },
          {
            name: "违约金额行业排名",
            value: "100%",
            weight: 100
          },
          {
            name: "违约金额行业平均数",
            value: "303.07 万元",
            weight: 303
          }
        ],
        factors: [
          {
            name: "违约次数",
            weight: 59
          },
          {
            name: "被执行次数",
            weight: 264
          },
          {
            name: "违约金额(万元)",
            weight: 16800
          },
          {
            name: "违约金额行业排名(%)",
            weight: 100
          },
          {
            name: "违约金额行业平均数(万元)",
            weight: 303
          }
        ],
        enabled: true,
        version: "v1.0.0",
        updatedAt: "2026-08-24",
        summary: "基于服务合同纠纷裁判文书，统计违约次数、被执行、违约金额评估履约风险",
        versions: [
          {
            version: "v1.0.0",
            date: "2026-08-24",
            note: "企业尽调报告导入",
            current: true
          }
        ],
        collisionRules: [
          {
            id: "jd-hetong-1",
            cond: {
              logic: "and",
              groups: [],
              loose: []
            },
            result: "转人工复核",
            priority: "分数优先",
            enabled: false
          }
        ],
        decisionGraph: {
          width: 800,
          height: 400,
          nodes: [],
          edges: []
        }
      },
    {
        prod: "jd-sifa",
        name: "司法风险",
        range: [
          0,
          100
        ],
        color: "#DC2626",
        score: 30,
        algoType: "司法风险评估模型",
        algoCode: "司法风险基于裁判文书（文书类型为判决书、案件身份为原告和被告的案件），统计涉诉案件数量、涉诉金额、行业排名等，评估司法风险。当前涉诉案件212件、涉诉总金额14.81亿元、行业排名92%。细分维度：商业纠纷、遵纪守法、权益规范、劳务管理。",
        dims: [
          {
            name: "涉诉案件数量",
            value: "212 件",
            weight: 212
          },
          {
            name: "涉诉数量行业排名",
            value: "92%",
            weight: 92
          },
          {
            name: "涉诉总金额",
            value: "14.81 亿元",
            weight: 148100
          },
          {
            name: "原告案件数",
            value: "7 件",
            weight: 7
          },
          {
            name: "被告案件数",
            value: "205 件",
            weight: 205
          }
        ],
        factors: [
          {
            name: "涉诉案件数量",
            weight: 212
          },
          {
            name: "涉诉数量行业排名(%)",
            weight: 92
          },
          {
            name: "涉诉总金额(万元)",
            weight: 148100
          },
          {
            name: "原告案件数",
            weight: 7
          },
          {
            name: "被告案件数",
            weight: 205
          }
        ],
        enabled: true,
        version: "v1.0.0",
        updatedAt: "2026-08-24",
        summary: "基于裁判文书统计涉诉数量、涉诉金额、行业排名，评估企业司法风险",
        versions: [
          {
            version: "v1.0.0",
            date: "2026-08-24",
            note: "企业尽调报告导入",
            current: true
          }
        ],
        collisionRules: [
          {
            id: "jd-sifa-1",
            cond: {
              logic: "and",
              groups: [],
              loose: []
            },
            result: "转人工复核",
            priority: "分数优先",
            enabled: false
          }
        ],
        decisionGraph: {
          width: 800,
          height: 400,
          nodes: [],
          edges: []
        }
      },
    {
      "prod": "gp-chain",
      "name": "企业链图",
      "range": [
        0,
        100
      ],
      "color": "#1677ff",
      "score": 60,
      "algoType": "企业关系链图谱模型（多维关系融合）",
      "algoCode": "企业链图：融合股权、任职、担保、交易等多维关系，构建企业关联链路，识别核心主体与关键路径。",
      "dims": [
        {
          "name": "股权关系",
          "value": "—",
          "weight": 0
        },
        {
          "name": "任职关系",
          "value": "—",
          "weight": 0
        },
        {
          "name": "担保关系",
          "value": "—",
          "weight": 0
        },
        {
          "name": "交易关系",
          "value": "—",
          "weight": 0
        }
      ],
      "factors": [
        {
          "name": "股权关系",
          "weight": 0
        },
        {
          "name": "任职关系",
          "weight": 0
        },
        {
          "name": "担保关系",
          "weight": 0
        },
        {
          "name": "交易关系",
          "weight": 0
        }
      ],
      "enabled": true,
      "version": "v1.0.0",
      "updatedAt": "2026-08-24",
      "summary": "融合股权、任职、担保等多维关系，刻画企业关联链路与核心主体",
      "versions": [
        {
          "version": "v1.0.0",
          "date": "2026-08-24",
          "note": "企业图谱/个人关系图谱建模导入",
          "current": true
        }
      ],
      "collisionRules": [
        {
          "id": "gp-chain-1",
          "cond": {
            "logic": "and",
            "groups": [],
            "loose": []
          },
          "result": "转人工复核",
          "priority": "分数优先",
          "enabled": false
        }
      ],
      "decisionGraph": {
        "width": 800,
        "height": 400,
        "nodes": [],
        "edges": []
      }
    },
    {
      "prod": "gp-equity-pen",
      "name": "股权穿透",
      "range": [
        0,
        100
      ],
      "color": "#13c2c2",
      "score": 60,
      "algoType": "股权穿透图谱模型（多层穿透）",
      "algoCode": "股权穿透：逐层穿透企业股权结构，还原持股路径，识别最终实际控制人及其控制比例。",
      "dims": [
        {
          "name": "直接持股",
          "value": "—",
          "weight": 0
        },
        {
          "name": "间接持股",
          "value": "—",
          "weight": 0
        },
        {
          "name": "穿透层级",
          "value": "—",
          "weight": 0
        },
        {
          "name": "实控路径",
          "value": "—",
          "weight": 0
        }
      ],
      "factors": [
        {
          "name": "直接持股",
          "weight": 0
        },
        {
          "name": "间接持股",
          "weight": 0
        },
        {
          "name": "穿透层级",
          "weight": 0
        },
        {
          "name": "实控路径",
          "weight": 0
        }
      ],
      "enabled": true,
      "version": "v1.0.0",
      "updatedAt": "2026-08-24",
      "summary": "穿透多层股权结构，识别最终实际控制人及持股路径",
      "versions": [
        {
          "version": "v1.0.0",
          "date": "2026-08-24",
          "note": "企业图谱/个人关系图谱建模导入",
          "current": true
        }
      ],
      "collisionRules": [
        {
          "id": "gp-equity-pen-1",
          "cond": {
            "logic": "and",
            "groups": [],
            "loose": []
          },
          "result": "转人工复核",
          "priority": "分数优先",
          "enabled": false
        }
      ],
      "decisionGraph": {
        "width": 800,
        "height": 400,
        "nodes": [],
        "edges": []
      }
    },
    {
      "prod": "gp-equity-str",
      "name": "股权结构",
      "range": [
        0,
        100
      ],
      "color": "#722ed1",
      "score": 60,
      "algoType": "股权结构分析模型（构成量化）",
      "algoCode": "股权结构：解析企业股权构成与层级分布，量化股权集中度、制衡度与结构稳定性。",
      "dims": [
        {
          "name": "股权集中度",
          "value": "—",
          "weight": 0
        },
        {
          "name": "层级分布",
          "value": "—",
          "weight": 0
        },
        {
          "name": "制衡度",
          "value": "—",
          "weight": 0
        },
        {
          "name": "稳定性",
          "value": "—",
          "weight": 0
        }
      ],
      "factors": [
        {
          "name": "股权集中度",
          "weight": 0
        },
        {
          "name": "层级分布",
          "weight": 0
        },
        {
          "name": "制衡度",
          "weight": 0
        },
        {
          "name": "稳定性",
          "weight": 0
        }
      ],
      "enabled": true,
      "version": "v1.0.0",
      "updatedAt": "2026-08-24",
      "summary": "解析企业股权构成与层级分布，量化集中度与稳定性",
      "versions": [
        {
          "version": "v1.0.0",
          "date": "2026-08-24",
          "note": "企业图谱/个人关系图谱建模导入",
          "current": true
        }
      ],
      "collisionRules": [
        {
          "id": "gp-equity-str-1",
          "cond": {
            "logic": "and",
            "groups": [],
            "loose": []
          },
          "result": "转人工复核",
          "priority": "分数优先",
          "enabled": false
        }
      ],
      "decisionGraph": {
        "width": 800,
        "height": 400,
        "nodes": [],
        "edges": []
      }
    },
    {
      "prod": "gp-controller",
      "name": "控制人关系",
      "range": [
        0,
        100
      ],
      "color": "#eb2f96",
      "score": 60,
      "algoType": "控制人关系图谱模型（控制链识别）",
      "algoCode": "控制人关系：识别法定代表人与实际控制人的控制链条，刻画关键人物与企业的关联网络。",
      "dims": [
        {
          "name": "法定代表人",
          "value": "—",
          "weight": 0
        },
        {
          "name": "实际控制人",
          "value": "—",
          "weight": 0
        },
        {
          "name": "控制链条",
          "value": "—",
          "weight": 0
        },
        {
          "name": "关联人物",
          "value": "—",
          "weight": 0
        }
      ],
      "factors": [
        {
          "name": "法定代表人",
          "weight": 0
        },
        {
          "name": "实际控制人",
          "weight": 0
        },
        {
          "name": "控制链条",
          "weight": 0
        },
        {
          "name": "关联人物",
          "weight": 0
        }
      ],
      "enabled": true,
      "version": "v1.0.0",
      "updatedAt": "2026-08-24",
      "summary": "识别法定代表人与实际控制人的控制链条与关联关系",
      "versions": [
        {
          "version": "v1.0.0",
          "date": "2026-08-24",
          "note": "企业图谱/个人关系图谱建模导入",
          "current": true
        }
      ],
      "collisionRules": [
        {
          "id": "gp-controller-1",
          "cond": {
            "logic": "and",
            "groups": [],
            "loose": []
          },
          "result": "转人工复核",
          "priority": "分数优先",
          "enabled": false
        }
      ],
      "decisionGraph": {
        "width": 800,
        "height": 400,
        "nodes": [],
        "edges": []
      }
    },
    {
      "prod": "gp-beneficial",
      "name": "受益所有人",
      "range": [
        0,
        100
      ],
      "color": "#fa8c16",
      "score": 60,
      "algoType": "受益所有人识别模型（AML 口径）",
      "algoCode": "受益所有人：依据反洗钱监管口径，穿透识别最终受益所有人及其受益比例与权益结构。",
      "dims": [
        {
          "name": "受益比例",
          "value": "—",
          "weight": 0
        },
        {
          "name": "穿透深度",
          "value": "—",
          "weight": 0
        },
        {
          "name": "权益结构",
          "value": "—",
          "weight": 0
        },
        {
          "name": "AML 口径",
          "value": "—",
          "weight": 0
        }
      ],
      "factors": [
        {
          "name": "受益比例",
          "weight": 0
        },
        {
          "name": "穿透深度",
          "weight": 0
        },
        {
          "name": "权益结构",
          "weight": 0
        },
        {
          "name": "AML 口径",
          "weight": 0
        }
      ],
      "enabled": true,
      "version": "v1.0.0",
      "updatedAt": "2026-08-24",
      "summary": "依据反洗钱口径识别最终受益所有人及其受益比例",
      "versions": [
        {
          "version": "v1.0.0",
          "date": "2026-08-24",
          "note": "企业图谱/个人关系图谱建模导入",
          "current": true
        }
      ],
      "collisionRules": [
        {
          "id": "gp-beneficial-1",
          "cond": {
            "logic": "and",
            "groups": [],
            "loose": []
          },
          "result": "转人工复核",
          "priority": "分数优先",
          "enabled": false
        }
      ],
      "decisionGraph": {
        "width": 800,
        "height": 400,
        "nodes": [],
        "edges": []
      }
    },
    {
      "prod": "gp-company-rel",
      "name": "企业关系",
      "range": [
        0,
        100
      ],
      "color": "#52c41a",
      "score": 60,
      "algoType": "企业关系网络模型（关联刻画）",
      "algoCode": "企业关系：刻画企业间投资、担保、交易、任职等关联关系，构建企业关系网络图谱。",
      "dims": [
        {
          "name": "投资关系",
          "value": "—",
          "weight": 0
        },
        {
          "name": "担保关系",
          "value": "—",
          "weight": 0
        },
        {
          "name": "交易关系",
          "value": "—",
          "weight": 0
        },
        {
          "name": "任职关系",
          "value": "—",
          "weight": 0
        }
      ],
      "factors": [
        {
          "name": "投资关系",
          "weight": 0
        },
        {
          "name": "担保关系",
          "weight": 0
        },
        {
          "name": "交易关系",
          "weight": 0
        },
        {
          "name": "任职关系",
          "weight": 0
        }
      ],
      "enabled": true,
      "version": "v1.0.0",
      "updatedAt": "2026-08-24",
      "summary": "刻画企业间投资、担保、交易等关联关系网络",
      "versions": [
        {
          "version": "v1.0.0",
          "date": "2026-08-24",
          "note": "企业图谱/个人关系图谱建模导入",
          "current": true
        }
      ],
      "collisionRules": [
        {
          "id": "gp-company-rel-1",
          "cond": {
            "logic": "and",
            "groups": [],
            "loose": []
          },
          "result": "转人工复核",
          "priority": "分数优先",
          "enabled": false
        }
      ],
      "decisionGraph": {
        "width": 800,
        "height": 400,
        "nodes": [],
        "edges": []
      }
    },
    {
      "prod": "gp-related-party",
      "name": "关联方认定",
      "range": [
        0,
        100
      ],
      "color": "#2f54eb",
      "score": 60,
      "algoType": "关联方认定模型（准则口径）",
      "algoCode": "关联方认定：按企业会计准则与监管口径，认定关联方及其关联交易，识别隐性关联。",
      "dims": [
        {
          "name": "准则口径",
          "value": "—",
          "weight": 0
        },
        {
          "name": "关联交易",
          "value": "—",
          "weight": 0
        },
        {
          "name": "隐性关联",
          "value": "—",
          "weight": 0
        },
        {
          "name": "认定路径",
          "value": "—",
          "weight": 0
        }
      ],
      "factors": [
        {
          "name": "准则口径",
          "weight": 0
        },
        {
          "name": "关联交易",
          "weight": 0
        },
        {
          "name": "隐性关联",
          "weight": 0
        },
        {
          "name": "认定路径",
          "weight": 0
        }
      ],
      "enabled": true,
      "version": "v1.0.0",
      "updatedAt": "2026-08-24",
      "summary": "按会计准则与监管口径认定关联方及其交易",
      "versions": [
        {
          "version": "v1.0.0",
          "date": "2026-08-24",
          "note": "企业图谱/个人关系图谱建模导入",
          "current": true
        }
      ],
      "collisionRules": [
        {
          "id": "gp-related-party-1",
          "cond": {
            "logic": "and",
            "groups": [],
            "loose": []
          },
          "result": "转人工复核",
          "priority": "分数优先",
          "enabled": false
        }
      ],
      "decisionGraph": {
        "width": 800,
        "height": 400,
        "nodes": [],
        "edges": []
      }
    },
    {
      "prod": "gp-top-beneficiary",
      "name": "十大受益人",
      "range": [
        0,
        100
      ],
      "color": "#a0d911",
      "score": 60,
      "algoType": "十大受益人识别模型（权益排序）",
      "algoCode": "十大受益人：按持股比例排序，识别前十大受益人及其权益结构与受益比例。",
      "dims": [
        {
          "name": "持股排序",
          "value": "—",
          "weight": 0
        },
        {
          "name": "受益比例",
          "value": "—",
          "weight": 0
        },
        {
          "name": "权益结构",
          "value": "—",
          "weight": 0
        },
        {
          "name": "受益人类型",
          "value": "—",
          "weight": 0
        }
      ],
      "factors": [
        {
          "name": "持股排序",
          "weight": 0
        },
        {
          "name": "受益比例",
          "weight": 0
        },
        {
          "name": "权益结构",
          "weight": 0
        },
        {
          "name": "受益人类型",
          "weight": 0
        }
      ],
      "enabled": true,
      "version": "v1.0.0",
      "updatedAt": "2026-08-24",
      "summary": "识别持股比例最高的前十名受益人及权益结构",
      "versions": [
        {
          "version": "v1.0.0",
          "date": "2026-08-24",
          "note": "企业图谱/个人关系图谱建模导入",
          "current": true
        }
      ],
      "collisionRules": [
        {
          "id": "gp-top-beneficiary-1",
          "cond": {
            "logic": "and",
            "groups": [],
            "loose": []
          },
          "result": "转人工复核",
          "priority": "分数优先",
          "enabled": false
        }
      ],
      "decisionGraph": {
        "width": 800,
        "height": 400,
        "nodes": [],
        "edges": []
      }
    },
    {
      "prod": "gp-person-rel",
      "name": "个人关系图谱",
      "range": [
        0,
        100
      ],
      "color": "#f5222d",
      "score": 60,
      "algoType": "个人关系网络模型（多维融合）",
      "algoCode": "个人关系图谱：融合联系人、共债、资金、担保、设备等多维关系，刻画个人关联网络与风险传导路径。",
      "dims": [
        {
          "name": "联系人",
          "value": "—",
          "weight": 0
        },
        {
          "name": "共债",
          "value": "—",
          "weight": 0
        },
        {
          "name": "资金",
          "value": "—",
          "weight": 0
        },
        {
          "name": "担保",
          "value": "—",
          "weight": 0
        },
        {
          "name": "设备",
          "value": "—",
          "weight": 0
        }
      ],
      "factors": [
        {
          "name": "联系人",
          "weight": 0
        },
        {
          "name": "共债",
          "weight": 0
        },
        {
          "name": "资金",
          "weight": 0
        },
        {
          "name": "担保",
          "weight": 0
        },
        {
          "name": "设备",
          "weight": 0
        }
      ],
      "enabled": true,
      "version": "v1.0.0",
      "updatedAt": "2026-08-24",
      "summary": "融合联系人、共债、资金、担保、设备等多维关系，刻画个人关联网络",
      "versions": [
        {
          "version": "v1.0.0",
          "date": "2026-08-24",
          "note": "企业图谱/个人关系图谱建模导入",
          "current": true
        }
      ],
      "collisionRules": [
        {
          "id": "gp-person-rel-1",
          "cond": {
            "logic": "and",
            "groups": [],
            "loose": []
          },
          "result": "转人工复核",
          "priority": "分数优先",
          "enabled": false
        }
      ],
      "decisionGraph": {
        "width": 800,
        "height": 400,
        "nodes": [],
        "edges": []
      }
    },
  ],
  records: [
    { id: 'R-001', time: '2026-08-11 09:12', custId: 'CUST-100891', custName: '张伟', model: 'zhicha', score: 82, level: '高', source: '实时', status: 'success', hitLabels: ['黑灰名单命中', '多头借贷强度高'] },
    { id: 'R-002', time: '2026-08-11 09:15', custId: 'CUST-100892', custName: '李娜', model: 'zhixin', score: 688, level: 'B', source: '实时', status: 'success', hitLabels: ['负债收入比偏高'] },
    { id: 'R-003', time: '2026-08-11 09:21', custId: 'CUST-100893', custName: '王芳', model: 'zhirong', score: 642, level: 'B', source: 'API', status: 'success', hitLabels: ['转化意愿低'] },
    { id: 'R-004', time: '2026-08-11 09:33', custId: 'CUST-100894', custName: '刘强', model: 'zhicha', score: 41, level: '低', source: '实时', status: 'success', hitLabels: [] },
    { id: 'R-005', time: '2026-08-11 09:40', custId: 'CUST-100895', custName: '陈静', model: 'zhixin', score: 521, level: 'C', source: '批量', status: 'fail', hitLabels: ['历史M3+逾期'] },
    { id: 'R-006', time: '2026-08-11 09:52', custId: 'CUST-100896', custName: '杨光', model: 'zhirong', score: 703, level: 'A', source: '实时', status: 'success', hitLabels: [] },
    { id: 'R-007', time: '2026-08-11 10:01', custId: 'CUST-100897', custName: '赵敏', model: 'zhicha', score: 67, level: '中', source: 'API', status: 'success', hitLabels: ['设备模拟器特征'] },
    { id: 'R-008', time: '2026-08-11 10:14', custId: 'CUST-100898', custName: '孙磊', model: 'zhixin', score: 745, level: 'A', source: '实时', status: 'success', hitLabels: [] },
    { id: 'R-009', time: '2026-08-11 10:22', custId: 'CUST-100899', custName: '周婷', model: 'zhirong', score: 598, level: 'C', source: '批量', status: 'success', hitLabels: ['多头借贷强度高'] },
    { id: 'R-010', time: '2026-08-11 10:31', custId: 'CUST-100900', custName: '吴昊', model: 'zhicha', score: 91, level: '高', source: '实时', status: 'success', hitLabels: ['黑灰名单命中', '同设备关联'] },
    { id: 'R-011', time: '2026-08-11 10:44', custId: 'CUST-100901', custName: '郑爽', model: 'zhixin', score: 612, level: 'B', source: 'API', status: 'fail', hitLabels: [] },
    { id: 'R-012', time: '2026-08-11 10:58', custId: 'CUST-100902', custName: '冯雪', model: 'zhirong', score: 668, level: 'B', source: '实时', status: 'success', hitLabels: ['资产缺失'] },
    { id: 'R-013', time: '2026-08-10 14:09', custId: 'CUST-100903', custName: '蒋勇', model: 'zhicha', score: 55, level: '中', source: '批量', status: 'success', hitLabels: ['征信查询频繁'] },
    { id: 'R-014', time: '2026-08-10 14:20', custId: 'CUST-100904', custName: '韩梅', model: 'zhixin', score: 729, level: 'A', source: '实时', status: 'success', hitLabels: [] },
    { id: 'R-015', time: '2026-08-10 14:37', custId: 'CUST-100905', custName: '曹颖', model: 'zhirong', score: 631, level: 'B', source: 'API', status: 'success', hitLabels: [] },
    { id: 'R-016', time: '2026-08-10 15:02', custId: 'CUST-100906', custName: '邓超', model: 'zhicha', score: 33, level: '低', source: '实时', status: 'success', hitLabels: [] },
    { id: 'R-017', time: '2026-08-10 15:19', custId: 'CUST-100907', custName: '许晴', model: 'zhixin', score: 489, level: 'D', source: '批量', status: 'fail', hitLabels: ['历史M3+逾期', '负债收入比偏高'] },
    { id: 'R-018', time: '2026-08-10 15:33', custId: 'CUST-100908', custName: '高峰', model: 'zhirong', score: 690, level: 'A', source: '实时', status: 'success', hitLabels: [] },
    { id: 'R-019', time: '2026-08-10 16:01', custId: 'CUST-100909', custName: '林涛', model: 'zhicha', score: 74, level: '中', source: 'API', status: 'success', hitLabels: ['设备模拟器特征'] },
    { id: 'R-020', time: '2026-08-10 16:18', custId: 'CUST-100910', custName: '马莉', model: 'zhixin', score: 701, level: 'A', source: '实时', status: 'success', hitLabels: [] },
  ],
  crowds: [
    { id: 'g-high', name: '高价值客户', rule: '智融分 大于 680', logic: 'and', count: 0, conds: [{ field: 'score.zhirong', op: 'gt', value: '680' }] },
    { id: 'g-active', name: '活跃客户', rule: '贷款状态 等于 在贷 且 额度使用率 区间 30~80', logic: 'and', count: 0, conds: [{ field: 'loanStatus', op: 'eq', value: '在贷' }, { field: 'utilization', op: 'range', value: '30', rangeMax: '80' }] },
    { id: 'g-lowval', name: '低价值客户', rule: '智融分 小于 600', logic: 'and', count: 0, conds: [{ field: 'score.zhirong', op: 'lt', value: '600' }] },
    { id: 'g-risk', name: '高风险客户', rule: '智察分 大于 70', logic: 'and', count: 0, conds: [{ field: 'score.zhicha', op: 'gt', value: '70' }] },
    { id: 'g-watch', name: '观测客户', rule: '智信分 区间 600~660', logic: 'and', count: 0, conds: [{ field: 'score.zhixin', op: 'range', value: '600', rangeMax: '660' }] },
  ],
  dist: [
    { prod: 'zhicha', labels: ['0-20', '21-40', '41-60', '61-80', '81-100'], data: [12, 28, 35, 18, 7] },
    { prod: 'zhixin', labels: ['300-420', '421-540', '541-660', '661-780', '781-900'], data: [5, 14, 30, 34, 17] },
    { prod: 'zhirong', labels: ['300-420', '421-540', '541-660', '661-780', '781-900'], data: [8, 18, 32, 29, 13] },
  ],
  hits: [
    { rule: '近30天申贷平台数≥5', model: 'zhicha', hits: 1842, rate: 11.3, type: 'rule' },
    { rule: '设备模拟器特征命中', model: 'zhicha', hits: 1320, rate: 8.1, type: 'rule' },
    { rule: '命中外部黑灰名单', model: 'zhicha', hits: 980, rate: 6.0, type: 'list' },
    { rule: '历史 M3+ 逾期≥2', model: 'zhixin', hits: 760, rate: 4.7, type: 'rule' },
    { rule: '负债收入比≥70%', model: 'zhixin', hits: 1120, rate: 6.9, type: 'rule' },
    { rule: '征信月查询≥10', model: 'zhixin', hits: 640, rate: 3.9, type: 'rule' },
    { rule: '转化意愿低且资产缺失', model: 'zhirong', hits: 510, rate: 3.1, type: 'rule' },
    { rule: '多头借贷强度高', model: 'zhirong', hits: 880, rate: 5.4, type: 'rule' },
  ],
  funnel: [
    { label: '触发预警', value: 18420 },
    { label: '规则命中', value: 9630 },
    { label: '核实为真实风险', value: 5420 },
    { label: '发起处置', value: 4180 },
    { label: '处置闭环', value: 3860 },
  ],
  ops: [
    {
      prod: 'zhicha', coverage: 98.5, accuracy: 86.2, timely: 92.0, calls: 12480, psi: 0.11, psiStatus: '稳定',
      trend: [
        { month: '03月', coverage: 97.8, accuracy: 85.1, timely: 90.4, calls: 10230 },
        { month: '04月', coverage: 98.0, accuracy: 85.6, timely: 91.0, calls: 10980 },
        { month: '05月', coverage: 98.2, accuracy: 85.9, timely: 91.5, calls: 11340 },
        { month: '06月', coverage: 98.3, accuracy: 86.0, timely: 91.8, calls: 11920 },
        { month: '07月', coverage: 98.4, accuracy: 86.1, timely: 91.9, calls: 12210 },
        { month: '08月', coverage: 98.5, accuracy: 86.2, timely: 92.0, calls: 12480 },
      ],
    },
    {
      prod: 'zhixin', coverage: 97.2, accuracy: 88.4, timely: 90.1, calls: 9820, psi: 0.24, psiStatus: '临界',
      trend: [
        { month: '03月', coverage: 96.4, accuracy: 87.0, timely: 88.6, calls: 8120 },
        { month: '04月', coverage: 96.7, accuracy: 87.4, timely: 89.0, calls: 8560 },
        { month: '05月', coverage: 96.9, accuracy: 87.9, timely: 89.5, calls: 8940 },
        { month: '06月', coverage: 97.0, accuracy: 88.1, timely: 89.8, calls: 9410 },
        { month: '07月', coverage: 97.1, accuracy: 88.3, timely: 90.0, calls: 9650 },
        { month: '08月', coverage: 97.2, accuracy: 88.4, timely: 90.1, calls: 9820 },
      ],
    },
    {
      prod: 'zhirong', coverage: 95.8, accuracy: 84.0, timely: 89.3, calls: 7610, psi: 0.31, psiStatus: '偏移',
      trend: [
        { month: '03月', coverage: 94.5, accuracy: 82.1, timely: 87.2, calls: 6420 },
        { month: '04月', coverage: 94.9, accuracy: 82.8, timely: 87.9, calls: 6780 },
        { month: '05月', coverage: 95.2, accuracy: 83.2, timely: 88.4, calls: 7050 },
        { month: '06月', coverage: 95.5, accuracy: 83.7, timely: 88.9, calls: 7340 },
        { month: '07月', coverage: 95.7, accuracy: 83.9, timely: 89.1, calls: 7480 },
        { month: '08月', coverage: 95.8, accuracy: 84.0, timely: 89.3, calls: 7610 },
      ],
    },
    {
        prod: "jd-zonghe",
        coverage: 95,
        accuracy: 88,
        timely: 90,
        calls: 5200,
        psi: 0.12,
        psiStatus: "稳定",
        trend: [
          {
            month: "03月",
            coverage: 94.5,
            accuracy: 87.5,
            timely: 89.5,
            calls: 4600
          },
          {
            month: "04月",
            coverage: 94.6,
            accuracy: 87.6,
            timely: 89.6,
            calls: 4720
          },
          {
            month: "05月",
            coverage: 94.7,
            accuracy: 87.7,
            timely: 89.7,
            calls: 4840
          },
          {
            month: "06月",
            coverage: 94.8,
            accuracy: 87.8,
            timely: 89.8,
            calls: 4960
          },
          {
            month: "07月",
            coverage: 94.9,
            accuracy: 87.9,
            timely: 89.9,
            calls: 5080
          },
          {
            month: "08月",
            coverage: 95,
            accuracy: 88,
            timely: 90,
            calls: 5200
          }
        ]
      },
    {
        prod: "jd-jingying",
        coverage: 96,
        accuracy: 89,
        timely: 91,
        calls: 6100,
        psi: 0.15,
        psiStatus: "稳定",
        trend: [
          {
            month: "03月",
            coverage: 95.4,
            accuracy: 88.5,
            timely: 90.4,
            calls: 5500
          },
          {
            month: "04月",
            coverage: 95.5,
            accuracy: 88.6,
            timely: 90.5,
            calls: 5620
          },
          {
            month: "05月",
            coverage: 95.6,
            accuracy: 88.7,
            timely: 90.6,
            calls: 5740
          },
          {
            month: "06月",
            coverage: 95.7,
            accuracy: 88.8,
            timely: 90.7,
            calls: 5860
          },
          {
            month: "07月",
            coverage: 95.8,
            accuracy: 88.9,
            timely: 90.8,
            calls: 5980
          },
          {
            month: "08月",
            coverage: 95.9,
            accuracy: 89,
            timely: 90.9,
            calls: 6100
          }
        ]
      },
    {
        prod: "jd-kongke",
        coverage: 94,
        accuracy: 86,
        timely: 89,
        calls: 4800,
        psi: 0.18,
        psiStatus: "稳定",
        trend: [
          {
            month: "03月",
            coverage: 93.5,
            accuracy: 85.5,
            timely: 88.5,
            calls: 4300
          },
          {
            month: "04月",
            coverage: 93.6,
            accuracy: 85.6,
            timely: 88.6,
            calls: 4420
          },
          {
            month: "05月",
            coverage: 93.7,
            accuracy: 85.7,
            timely: 88.7,
            calls: 4540
          },
          {
            month: "06月",
            coverage: 93.8,
            accuracy: 85.8,
            timely: 88.8,
            calls: 4660
          },
          {
            month: "07月",
            coverage: 93.9,
            accuracy: 85.9,
            timely: 88.9,
            calls: 4780
          },
          {
            month: "08月",
            coverage: 94,
            accuracy: 86,
            timely: 89,
            calls: 4900
          }
        ]
      },
    {
        prod: "jd-kechuang",
        coverage: 93,
        accuracy: 85,
        timely: 88,
        calls: 4100,
        psi: 0.21,
        psiStatus: "临界",
        trend: [
          {
            month: "03月",
            coverage: 92.5,
            accuracy: 84.5,
            timely: 87.5,
            calls: 3700
          },
          {
            month: "04月",
            coverage: 92.6,
            accuracy: 84.6,
            timely: 87.6,
            calls: 3820
          },
          {
            month: "05月",
            coverage: 92.7,
            accuracy: 84.7,
            timely: 87.7,
            calls: 3940
          },
          {
            month: "06月",
            coverage: 92.8,
            accuracy: 84.8,
            timely: 87.8,
            calls: 4060
          },
          {
            month: "07月",
            coverage: 92.9,
            accuracy: 84.9,
            timely: 87.9,
            calls: 4180
          },
          {
            month: "08月",
            coverage: 93,
            accuracy: 85,
            timely: 88,
            calls: 4300
          }
        ]
      },
    {
        prod: "jd-hetong",
        coverage: 92,
        accuracy: 84,
        timely: 87,
        calls: 3600,
        psi: 0.24,
        psiStatus: "临界",
        trend: [
          {
            month: "03月",
            coverage: 91.5,
            accuracy: 83.5,
            timely: 86.5,
            calls: 3300
          },
          {
            month: "04月",
            coverage: 91.6,
            accuracy: 83.6,
            timely: 86.6,
            calls: 3420
          },
          {
            month: "05月",
            coverage: 91.7,
            accuracy: 83.7,
            timely: 86.7,
            calls: 3540
          },
          {
            month: "06月",
            coverage: 91.8,
            accuracy: 83.8,
            timely: 86.8,
            calls: 3660
          },
          {
            month: "07月",
            coverage: 91.9,
            accuracy: 83.9,
            timely: 86.9,
            calls: 3780
          },
          {
            month: "08月",
            coverage: 92,
            accuracy: 84,
            timely: 87,
            calls: 3900
          }
        ]
      },
    {
        prod: "jd-sifa",
        coverage: 91,
        accuracy: 83,
        timely: 86,
        calls: 3000,
        psi: 0.27,
        psiStatus: "偏移",
        trend: [
          {
            month: "03月",
            coverage: 90.5,
            accuracy: 82.5,
            timely: 85.5,
            calls: 2900
          },
          {
            month: "04月",
            coverage: 90.6,
            accuracy: 82.6,
            timely: 85.6,
            calls: 3020
          },
          {
            month: "05月",
            coverage: 90.7,
            accuracy: 82.7,
            timely: 85.7,
            calls: 3140
          },
          {
            month: "06月",
            coverage: 90.8,
            accuracy: 82.8,
            timely: 85.8,
            calls: 3260
          },
          {
            month: "07月",
            coverage: 90.9,
            accuracy: 82.9,
            timely: 85.9,
            calls: 3380
          },
          {
            month: "08月",
            coverage: 91,
            accuracy: 83,
            timely: 86,
            calls: 3500
          }
        ]
      },
        {
      "prod": "gp-chain",
      "coverage": 93,
      "accuracy": 86,
      "timely": 90,
      "calls": 4880,
      "psi": 0.12,
      "psiStatus": "稳定",
      "trend": [
        {
          "month": "03月",
          "coverage": 92,
          "accuracy": 85,
          "timely": 89,
          "calls": 3800
        },
        {
          "month": "04月",
          "coverage": 92.2,
          "accuracy": 85.2,
          "timely": 89.3,
          "calls": 3980
        },
        {
          "month": "05月",
          "coverage": 92.4,
          "accuracy": 85.4,
          "timely": 89.6,
          "calls": 4160
        },
        {
          "month": "06月",
          "coverage": 92.6,
          "accuracy": 85.5,
          "timely": 89.9,
          "calls": 4340
        },
        {
          "month": "07月",
          "coverage": 92.8,
          "accuracy": 85.7,
          "timely": 90.2,
          "calls": 4520
        },
        {
          "month": "08月",
          "coverage": 93,
          "accuracy": 85.9,
          "timely": 90.5,
          "calls": 4700
        }
      ]
    },
    {
      "prod": "gp-equity-pen",
      "coverage": 93,
      "accuracy": 86,
      "timely": 90,
      "calls": 4880,
      "psi": 0.12,
      "psiStatus": "稳定",
      "trend": [
        {
          "month": "03月",
          "coverage": 92,
          "accuracy": 85,
          "timely": 89,
          "calls": 3800
        },
        {
          "month": "04月",
          "coverage": 92.2,
          "accuracy": 85.2,
          "timely": 89.3,
          "calls": 3980
        },
        {
          "month": "05月",
          "coverage": 92.4,
          "accuracy": 85.4,
          "timely": 89.6,
          "calls": 4160
        },
        {
          "month": "06月",
          "coverage": 92.6,
          "accuracy": 85.5,
          "timely": 89.9,
          "calls": 4340
        },
        {
          "month": "07月",
          "coverage": 92.8,
          "accuracy": 85.7,
          "timely": 90.2,
          "calls": 4520
        },
        {
          "month": "08月",
          "coverage": 93,
          "accuracy": 85.9,
          "timely": 90.5,
          "calls": 4700
        }
      ]
    },
    {
      "prod": "gp-equity-str",
      "coverage": 93,
      "accuracy": 86,
      "timely": 90,
      "calls": 4880,
      "psi": 0.12,
      "psiStatus": "稳定",
      "trend": [
        {
          "month": "03月",
          "coverage": 92,
          "accuracy": 85,
          "timely": 89,
          "calls": 3800
        },
        {
          "month": "04月",
          "coverage": 92.2,
          "accuracy": 85.2,
          "timely": 89.3,
          "calls": 3980
        },
        {
          "month": "05月",
          "coverage": 92.4,
          "accuracy": 85.4,
          "timely": 89.6,
          "calls": 4160
        },
        {
          "month": "06月",
          "coverage": 92.6,
          "accuracy": 85.5,
          "timely": 89.9,
          "calls": 4340
        },
        {
          "month": "07月",
          "coverage": 92.8,
          "accuracy": 85.7,
          "timely": 90.2,
          "calls": 4520
        },
        {
          "month": "08月",
          "coverage": 93,
          "accuracy": 85.9,
          "timely": 90.5,
          "calls": 4700
        }
      ]
    },
    {
      "prod": "gp-controller",
      "coverage": 93,
      "accuracy": 86,
      "timely": 90,
      "calls": 4880,
      "psi": 0.12,
      "psiStatus": "稳定",
      "trend": [
        {
          "month": "03月",
          "coverage": 92,
          "accuracy": 85,
          "timely": 89,
          "calls": 3800
        },
        {
          "month": "04月",
          "coverage": 92.2,
          "accuracy": 85.2,
          "timely": 89.3,
          "calls": 3980
        },
        {
          "month": "05月",
          "coverage": 92.4,
          "accuracy": 85.4,
          "timely": 89.6,
          "calls": 4160
        },
        {
          "month": "06月",
          "coverage": 92.6,
          "accuracy": 85.5,
          "timely": 89.9,
          "calls": 4340
        },
        {
          "month": "07月",
          "coverage": 92.8,
          "accuracy": 85.7,
          "timely": 90.2,
          "calls": 4520
        },
        {
          "month": "08月",
          "coverage": 93,
          "accuracy": 85.9,
          "timely": 90.5,
          "calls": 4700
        }
      ]
    },
    {
      "prod": "gp-beneficial",
      "coverage": 93,
      "accuracy": 86,
      "timely": 90,
      "calls": 4880,
      "psi": 0.12,
      "psiStatus": "稳定",
      "trend": [
        {
          "month": "03月",
          "coverage": 92,
          "accuracy": 85,
          "timely": 89,
          "calls": 3800
        },
        {
          "month": "04月",
          "coverage": 92.2,
          "accuracy": 85.2,
          "timely": 89.3,
          "calls": 3980
        },
        {
          "month": "05月",
          "coverage": 92.4,
          "accuracy": 85.4,
          "timely": 89.6,
          "calls": 4160
        },
        {
          "month": "06月",
          "coverage": 92.6,
          "accuracy": 85.5,
          "timely": 89.9,
          "calls": 4340
        },
        {
          "month": "07月",
          "coverage": 92.8,
          "accuracy": 85.7,
          "timely": 90.2,
          "calls": 4520
        },
        {
          "month": "08月",
          "coverage": 93,
          "accuracy": 85.9,
          "timely": 90.5,
          "calls": 4700
        }
      ]
    },
    {
      "prod": "gp-company-rel",
      "coverage": 93,
      "accuracy": 86,
      "timely": 90,
      "calls": 4880,
      "psi": 0.12,
      "psiStatus": "稳定",
      "trend": [
        {
          "month": "03月",
          "coverage": 92,
          "accuracy": 85,
          "timely": 89,
          "calls": 3800
        },
        {
          "month": "04月",
          "coverage": 92.2,
          "accuracy": 85.2,
          "timely": 89.3,
          "calls": 3980
        },
        {
          "month": "05月",
          "coverage": 92.4,
          "accuracy": 85.4,
          "timely": 89.6,
          "calls": 4160
        },
        {
          "month": "06月",
          "coverage": 92.6,
          "accuracy": 85.5,
          "timely": 89.9,
          "calls": 4340
        },
        {
          "month": "07月",
          "coverage": 92.8,
          "accuracy": 85.7,
          "timely": 90.2,
          "calls": 4520
        },
        {
          "month": "08月",
          "coverage": 93,
          "accuracy": 85.9,
          "timely": 90.5,
          "calls": 4700
        }
      ]
    },
    {
      "prod": "gp-related-party",
      "coverage": 93,
      "accuracy": 86,
      "timely": 90,
      "calls": 4880,
      "psi": 0.12,
      "psiStatus": "稳定",
      "trend": [
        {
          "month": "03月",
          "coverage": 92,
          "accuracy": 85,
          "timely": 89,
          "calls": 3800
        },
        {
          "month": "04月",
          "coverage": 92.2,
          "accuracy": 85.2,
          "timely": 89.3,
          "calls": 3980
        },
        {
          "month": "05月",
          "coverage": 92.4,
          "accuracy": 85.4,
          "timely": 89.6,
          "calls": 4160
        },
        {
          "month": "06月",
          "coverage": 92.6,
          "accuracy": 85.5,
          "timely": 89.9,
          "calls": 4340
        },
        {
          "month": "07月",
          "coverage": 92.8,
          "accuracy": 85.7,
          "timely": 90.2,
          "calls": 4520
        },
        {
          "month": "08月",
          "coverage": 93,
          "accuracy": 85.9,
          "timely": 90.5,
          "calls": 4700
        }
      ]
    },
    {
      "prod": "gp-top-beneficiary",
      "coverage": 93,
      "accuracy": 86,
      "timely": 90,
      "calls": 4880,
      "psi": 0.12,
      "psiStatus": "稳定",
      "trend": [
        {
          "month": "03月",
          "coverage": 92,
          "accuracy": 85,
          "timely": 89,
          "calls": 3800
        },
        {
          "month": "04月",
          "coverage": 92.2,
          "accuracy": 85.2,
          "timely": 89.3,
          "calls": 3980
        },
        {
          "month": "05月",
          "coverage": 92.4,
          "accuracy": 85.4,
          "timely": 89.6,
          "calls": 4160
        },
        {
          "month": "06月",
          "coverage": 92.6,
          "accuracy": 85.5,
          "timely": 89.9,
          "calls": 4340
        },
        {
          "month": "07月",
          "coverage": 92.8,
          "accuracy": 85.7,
          "timely": 90.2,
          "calls": 4520
        },
        {
          "month": "08月",
          "coverage": 93,
          "accuracy": 85.9,
          "timely": 90.5,
          "calls": 4700
        }
      ]
    },
    {
      "prod": "gp-person-rel",
      "coverage": 93,
      "accuracy": 86,
      "timely": 90,
      "calls": 4880,
      "psi": 0.12,
      "psiStatus": "稳定",
      "trend": [
        {
          "month": "03月",
          "coverage": 92,
          "accuracy": 85,
          "timely": 89,
          "calls": 3800
        },
        {
          "month": "04月",
          "coverage": 92.2,
          "accuracy": 85.2,
          "timely": 89.3,
          "calls": 3980
        },
        {
          "month": "05月",
          "coverage": 92.4,
          "accuracy": 85.4,
          "timely": 89.6,
          "calls": 4160
        },
        {
          "month": "06月",
          "coverage": 92.6,
          "accuracy": 85.5,
          "timely": 89.9,
          "calls": 4340
        },
        {
          "month": "07月",
          "coverage": 92.8,
          "accuracy": 85.7,
          "timely": 90.2,
          "calls": 4520
        },
        {
          "month": "08月",
          "coverage": 93,
          "accuracy": 85.9,
          "timely": 90.5,
          "calls": 4700
        }
      ]
    },
  ],
  thresholds: [
    { prod: 'zhicha', range: '0-39', level: '低风险', meaning: '欺诈概率极低', action: '自动通过' },
    { prod: 'zhicha', range: '40-69', level: '中风险', meaning: '存在一定欺诈特征', action: '转人工复核' },
    { prod: 'zhicha', range: '70-100', level: '高风险', meaning: '强欺诈特征命中', action: '拒绝 / 强化核验' },
    { prod: 'zhixin', range: '300-540', level: 'D', meaning: '违约概率高', action: '拒绝' },
    { prod: 'zhixin', range: '541-660', level: 'C', meaning: '违约概率偏高', action: '审慎授信' },
    { prod: 'zhixin', range: '661-780', level: 'B', meaning: '违约概率可控', action: '标准额度' },
    { prod: 'zhixin', range: '781-900', level: 'A', meaning: '违约概率低', action: '提额 + 优先经营' },
    { prod: 'zhirong', range: '350-499', level: 'D', meaning: '综合价值低且高风险', action: '拒绝或仅营销低风险产品' },
    { prod: 'zhirong', range: '500-649', level: 'C', meaning: '综合价值一般', action: '标准策略' },
    { prod: 'zhirong', range: '650-799', level: 'B', meaning: '价值与风险均衡', action: '常规经营' },
    { prod: 'zhirong', range: '800-950', level: 'A', meaning: '高价值低风险的优质客户', action: '提额 + 优先经营' },
  ],
  alertRules: [
    { id: 'AR-1', name: '智察分阈值预警', cond: '智察分 ≥ 70', threshold: 70, level: '高', enabled: true },
    { id: 'AR-2', name: '智信分阈值预警', cond: '智信分 ≤ 540', threshold: 540, level: '高', enabled: true },
    { id: 'AR-3', name: '智融分阈值预警', cond: '智融分 ≤ 540', threshold: 540, level: '中', enabled: true },
    { id: 'AR-4', name: '多头借贷规则命中', cond: '命中「近30天申贷平台数≥5」', threshold: 5, level: '中', enabled: true },
    { id: 'AR-5', name: '黑灰名单命中', cond: '命中外部黑灰名单', threshold: 1, level: '高', enabled: false },
    { id: 'AR-6', name: 'PSI 偏移预警', cond: '模型 PSI ≥ 0.25', threshold: 0.25, level: '中', enabled: true },
  ],
  callTrend: [
    { month: '03月', zhicha: 9200, zhixin: 7600, zhirong: 5400 },
    { month: '04月', zhicha: 9800, zhixin: 8100, zhirong: 5900 },
    { month: '05月', zhicha: 10400, zhixin: 8600, zhirong: 6300 },
    { month: '06月', zhicha: 11200, zhixin: 9100, zhirong: 6900 },
    { month: '07月', zhicha: 11800, zhixin: 9500, zhirong: 7200 },
    { month: '08月', zhicha: 12480, zhixin: 9820, zhirong: 7610 },
  ],
  riskRate: 6.8,
  monthlyCount: 29910,
}

/* ---- 轻量 store ---- */
const FILE = 'scoreData.json'
let data: ScoreData = JSON.parse(JSON.stringify(SEED_SCORE))
let version = 0
let saveStatus: 'ok' | 'error' | null = null
const listeners = new Set<() => void>()
const statusListeners = new Set<() => void>()

function emit() { version++; listeners.forEach((fn) => fn()); }
function emitStatus() { statusListeners.forEach((fn) => fn()); }

async function loadOne(file: string): Promise<unknown> {
  try {
    const r = await fetch(`/api/load-mid?file=${encodeURIComponent(file)}`)
    if (r.ok) return await r.json()
    return null
  } catch { return null }
}
function saveOne(file: string, body: unknown) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => { saveStatus = r.ok ? 'ok' : 'error'; emitStatus(); })
    .catch(() => { saveStatus = 'error'; emitStatus(); })
}

async function bootstrap() {
  const saved = await loadOne(FILE)
  const hasNewShape =
    saved && typeof saved === 'object' &&
    Array.isArray((saved as ScoreData).models) &&
    (saved as ScoreData).models.every((m) => 'algoCode' in m && Array.isArray((m as ModelMeta).versions))
  if (hasNewShape) {
    data = saved as ScoreData
  } else {
    data = JSON.parse(JSON.stringify(SEED_SCORE))
    saveOne(FILE, data)
  }
  emit()
}
void bootstrap()

function useSnap<T>(sel: () => T): T {
  useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => version,
  )
  return sel()
}

export function useScore(): ScoreData { return useSnap(() => data) }
export function useScoreSaveStatus(): 'ok' | 'error' | null {
  useSyncExternalStore(
    (l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; },
    () => saveStatus,
  )
  return saveStatus
}
export function updateScore(fn: (d: ScoreData) => ScoreData) {
  data = fn(data)
  emit()
  saveOne(FILE, data)
}
