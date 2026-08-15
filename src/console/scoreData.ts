// 评分产品子系统（v3 新 IA）· 数据层
// 三个产品：智察分（欺诈 0-100）/ 智信分（违约 300-900）/ 智融分（综合 350-950）
// 数据持久化到本地 scoreData.json，复用 /api/load-mid /api/save-mid
// 处置流程统一由管理中心「业务流程」配置（bizFlows.json · f-alert-dispose），本数据层不再持有 flow

import { useSyncExternalStore } from 'react'
import type { VisualCond } from './midData'
import { VISUAL_OP_LABEL } from './midData'
import type { VFilter } from './CondBuilder'

export type ScoreProd = 'zhicha' | 'zhixin' | 'zhirong'

export const SCORE_PROD_LABEL: Record<ScoreProd, string> = {
  zhicha: '智察分',
  zhixin: '智信分',
  zhirong: '智融分',
}
export const SCORE_PROD_DESC: Record<ScoreProd, string> = {
  zhicha: '欺诈识别模型，分数越高欺诈风险越高',
  zhixin: '信用违约模型，分数越高违约概率越低',
  zhirong: '综合价值模型，融合违约/兴趣/资产维度',
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
  versions: ModelVersion[]
  collisionRules: CollisionRule[]
  bins?: ScoreCardFactor[] // 评分卡：分箱→计分表（让分数可从原始数据算出、可验证）
  decisionGraph?: import('./modelGraphData').GGraph // 算法编辑画布：用户定制的决策图（未定制则用静态默认）
  /* ===== 三层封装改造（2026-08-15）：Tab4 上区域 + Tab3 + Tab4 下区域 ===== */
  scoreMap?: ScoreMapSeg[]   // Tab4 上区域：原生概率 p → 标准分 映射段（Rule A，标准化映射层）
  riskLabels?: RiskLabel[]   // Tab3 风险标签：引用决策引擎资产的并行规则支线，产出风险标签
  fusionRules?: FusionRule[] // Tab4 下区域：等级 × 标签 融合处置规则
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

/* ===== 三层封装：Tab4 上区域「概率 → 标准分映射」（标准化映射层 Rule A） ===== */
export interface ScoreMapSeg {
  pMin: number  // 概率下界（含），0~1
  pMax: number  // 概率上界（不含，末段取 1）
  score: number // 映射出的对外标准分
  level: string // 该段风险等级（低/中/高 或 A/B/C/D）
}

/* ===== 三层封装：Tab3「风险标签」（业务封装层，并行规则支线） =====
 * 引用决策引擎资产（名单库 list:xxx / 规则集 ruleset:xxx），命中派生风险标签；
 * 标签仅作解释信号，不影响概率与标准分，可配置是否计入 Tab4 融合处置。 */
export interface RiskLabel {
  id: string
  name: string                  // 标签名称
  refType: 'list' | 'ruleset'   // 引用资产类型
  ref: string                   // 决策引擎资产 id（list:xxx / ruleset:xxx）
  hit: '命中' | '未命中'         // 触发条件
  level: '轻度' | '中度' | '重度' // 标签等级
  ltype: '欺诈标签' | '信用标签' | '监控标签'
  show: boolean                 // 是否对外展示
  toFusion: boolean             // 是否计入融合处置
  enabled: boolean
}

/* ===== 三层封装：Tab4 下区域「等级 × 标签 融合处置」 ===== */
export interface FusionRule {
  id: string
  when: string        // 触发描述（如「高风险等级 + 重度欺诈标签」）
  labelPriority: boolean // 标签优先于分数等级（命中严重标签直接拒绝，无视分数）
  decision: '通过' | '转人工' | '拒绝' // 处置意见
  bizFlowId?: string  // 关联业务审核/处置流程（复用管理中心 bizFlows）
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
 *   信用/综合分（越高越好）→ 距上升一档的分数；欺诈分（越高越危险）→ 距高风险线的分数；已最优/已最高危返回 null。 */
export function nextUpgrade(prod: ScoreProd, score: number): { toLevel: string; gap: number } | null {
  const rows = thresholdRows(prod)
  if (!rows.length) return null
  if (prod === 'zhicha') {
    const hi = rows.find((r) => r.level === '高风险')
    if (hi && score < hi.min) return { toLevel: '高风险', gap: hi.min - score }
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
      /* ===== Tab4 上区域：概率 p → 标准分 映射（智察分 0~100，欺诈越高越危险） ===== */
      scoreMap: [
        { pMin: 0, pMax: 0.4, score: 20, level: '低' },
        { pMin: 0.4, pMax: 0.7, score: 55, level: '中' },
        { pMin: 0.7, pMax: 1, score: 85, level: '高' },
      ],
      /* ===== Tab3 风险标签：引用决策引擎资产，命中派生欺诈标签 ===== */
      riskLabels: [
        { id: 'rl-zc-1', name: '黑灰名单命中', refType: 'list', ref: 'L-009', hit: '命中', level: '重度', ltype: '欺诈标签', show: true, toFusion: true, enabled: true },
        { id: 'rl-zc-2', name: '设备群控特征', refType: 'ruleset', ref: 'P-104', hit: '命中', level: '中度', ltype: '欺诈标签', show: true, toFusion: true, enabled: true },
        { id: 'rl-zc-3', name: '团伙欺诈关联', refType: 'list', ref: 'L-008', hit: '命中', level: '重度', ltype: '欺诈标签', show: true, toFusion: true, enabled: true },
      ],
      /* ===== Tab4 下区域：等级 × 标签 融合处置 ===== */
      fusionRules: [
        { id: 'fr-zc-1', when: '高风险等级 + 重度欺诈标签', labelPriority: true, decision: '拒绝' },
        { id: 'fr-zc-2', when: '中风险等级 + 中度欺诈标签', labelPriority: false, decision: '转人工' },
        { id: 'fr-zc-3', when: '低风险等级', labelPriority: false, decision: '通过' },
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
      /* ===== Tab4 上区域：概率 p → 标准分 映射（智信分 300~900，越高越好） ===== */
      scoreMap: [
        { pMin: 0, pMax: 0.3, score: 350, level: 'D' },
        { pMin: 0.3, pMax: 0.5, score: 560, level: 'C' },
        { pMin: 0.5, pMax: 0.7, score: 720, level: 'B' },
        { pMin: 0.7, pMax: 1, score: 820, level: 'A' },
      ],
      /* ===== Tab3 风险标签：引用决策引擎资产，命中派生信用标签 ===== */
      riskLabels: [
        { id: 'rl-zx-1', name: '制裁/PEP 名单命中', refType: 'list', ref: 'L-005', hit: '命中', level: '重度', ltype: '信用标签', show: true, toFusion: true, enabled: true },
        { id: 'rl-zx-2', name: '地址聚集风险', refType: 'ruleset', ref: 'P-102', hit: '命中', level: '中度', ltype: '信用标签', show: true, toFusion: true, enabled: true },
        { id: 'rl-zx-3', name: '中介号码关联', refType: 'list', ref: 'L-001', hit: '命中', level: '中度', ltype: '信用标签', show: false, toFusion: true, enabled: true },
      ],
      /* ===== Tab4 下区域：等级 × 标签 融合处置 ===== */
      fusionRules: [
        { id: 'fr-zx-1', when: 'D 等级 + 重度信用标签', labelPriority: true, decision: '拒绝' },
        { id: 'fr-zx-2', when: 'C 等级 + 中度信用标签', labelPriority: false, decision: '转人工' },
        { id: 'fr-zx-3', when: 'A/B 等级', labelPriority: false, decision: '通过' },
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
      /* ===== Tab4 上区域：概率 p → 标准分 映射（智融分 350~950，越高越好） ===== */
      scoreMap: [
        { pMin: 0, pMax: 0.3, score: 400, level: 'D' },
        { pMin: 0.3, pMax: 0.5, score: 600, level: 'C' },
        { pMin: 0.5, pMax: 0.7, score: 760, level: 'B' },
        { pMin: 0.7, pMax: 1, score: 850, level: 'A' },
      ],
      /* ===== Tab3 风险标签：引用决策引擎资产，命中派生标签 ===== */
      riskLabels: [
        { id: 'rl-zr-1', name: '代理IP灰名单', refType: 'list', ref: 'L-006', hit: '命中', level: '轻度', ltype: '监控标签', show: true, toFusion: false, enabled: true },
        { id: 'rl-zr-2', name: '设备风险评分卡低分', refType: 'ruleset', ref: 'P-104', hit: '命中', level: '中度', ltype: '信用标签', show: true, toFusion: true, enabled: true },
        { id: 'rl-zr-3', name: '黑灰名单命中', refType: 'list', ref: 'L-009', hit: '命中', level: '重度', ltype: '欺诈标签', show: true, toFusion: true, enabled: true },
      ],
      /* ===== Tab4 下区域：等级 × 标签 融合处置 ===== */
      fusionRules: [
        { id: 'fr-zr-1', when: 'D 等级 + 重度欺诈标签', labelPriority: true, decision: '拒绝' },
        { id: 'fr-zr-2', when: 'C 等级 + 中度信用标签', labelPriority: false, decision: '转人工' },
        { id: 'fr-zr-3', when: 'A/B 等级', labelPriority: false, decision: '通过' },
      ],
    },
  ],
  records: [
    { id: 'R-001', time: '2026-08-11 09:12', custId: 'CUST-100891', custName: '张伟', model: 'zhicha', score: 82, level: '高', source: '实时', status: 'success' },
    { id: 'R-002', time: '2026-08-11 09:15', custId: 'CUST-100892', custName: '李娜', model: 'zhixin', score: 688, level: 'B', source: '实时', status: 'success' },
    { id: 'R-003', time: '2026-08-11 09:21', custId: 'CUST-100893', custName: '王芳', model: 'zhirong', score: 642, level: 'B', source: 'API', status: 'success' },
    { id: 'R-004', time: '2026-08-11 09:33', custId: 'CUST-100894', custName: '刘强', model: 'zhicha', score: 41, level: '低', source: '实时', status: 'success' },
    { id: 'R-005', time: '2026-08-11 09:40', custId: 'CUST-100895', custName: '陈静', model: 'zhixin', score: 521, level: 'C', source: '批量', status: 'fail' },
    { id: 'R-006', time: '2026-08-11 09:52', custId: 'CUST-100896', custName: '杨光', model: 'zhirong', score: 703, level: 'A', source: '实时', status: 'success' },
    { id: 'R-007', time: '2026-08-11 10:01', custId: 'CUST-100897', custName: '赵敏', model: 'zhicha', score: 67, level: '中', source: 'API', status: 'success' },
    { id: 'R-008', time: '2026-08-11 10:14', custId: 'CUST-100898', custName: '孙磊', model: 'zhixin', score: 745, level: 'A', source: '实时', status: 'success' },
    { id: 'R-009', time: '2026-08-11 10:22', custId: 'CUST-100899', custName: '周婷', model: 'zhirong', score: 598, level: 'C', source: '批量', status: 'success' },
    { id: 'R-010', time: '2026-08-11 10:31', custId: 'CUST-100900', custName: '吴昊', model: 'zhicha', score: 91, level: '高', source: '实时', status: 'success' },
    { id: 'R-011', time: '2026-08-11 10:44', custId: 'CUST-100901', custName: '郑爽', model: 'zhixin', score: 612, level: 'B', source: 'API', status: 'fail' },
    { id: 'R-012', time: '2026-08-11 10:58', custId: 'CUST-100902', custName: '冯雪', model: 'zhirong', score: 668, level: 'B', source: '实时', status: 'success' },
    { id: 'R-013', time: '2026-08-10 14:09', custId: 'CUST-100903', custName: '蒋勇', model: 'zhicha', score: 55, level: '中', source: '批量', status: 'success' },
    { id: 'R-014', time: '2026-08-10 14:20', custId: 'CUST-100904', custName: '韩梅', model: 'zhixin', score: 729, level: 'A', source: '实时', status: 'success' },
    { id: 'R-015', time: '2026-08-10 14:37', custId: 'CUST-100905', custName: '曹颖', model: 'zhirong', score: 631, level: 'B', source: 'API', status: 'success' },
    { id: 'R-016', time: '2026-08-10 15:02', custId: 'CUST-100906', custName: '邓超', model: 'zhicha', score: 33, level: '低', source: '实时', status: 'success' },
    { id: 'R-017', time: '2026-08-10 15:19', custId: 'CUST-100907', custName: '许晴', model: 'zhixin', score: 489, level: 'D', source: '批量', status: 'fail' },
    { id: 'R-018', time: '2026-08-10 15:33', custId: 'CUST-100908', custName: '高峰', model: 'zhirong', score: 690, level: 'A', source: '实时', status: 'success' },
    { id: 'R-019', time: '2026-08-10 16:01', custId: 'CUST-100909', custName: '林涛', model: 'zhicha', score: 74, level: '中', source: 'API', status: 'success' },
    { id: 'R-020', time: '2026-08-10 16:18', custId: 'CUST-100910', custName: '马莉', model: 'zhixin', score: 701, level: 'A', source: '实时', status: 'success' },
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
    { rule: '近30天申贷平台数≥5', model: 'zhicha', hits: 1842, rate: 11.3 },
    { rule: '设备模拟器特征命中', model: 'zhicha', hits: 1320, rate: 8.1 },
    { rule: '命中外部黑灰名单', model: 'zhicha', hits: 980, rate: 6.0 },
    { rule: '历史 M3+ 逾期≥2', model: 'zhixin', hits: 760, rate: 4.7 },
    { rule: '负债收入比≥70%', model: 'zhixin', hits: 1120, rate: 6.9 },
    { rule: '征信月查询≥10', model: 'zhixin', hits: 640, rate: 3.9 },
    { rule: '转化意愿低且资产缺失', model: 'zhirong', hits: 510, rate: 3.1 },
    { rule: '多头借贷强度高', model: 'zhirong', hits: 880, rate: 5.4 },
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
