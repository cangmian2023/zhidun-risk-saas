import type { BadgeVal, Row } from '../components/ui'
import { applications } from './data'
import { type ScoreView, type RuleHit, buildScores, buildRules, computeRiskIndex, SAMPLES, selectSample } from './scoreReport'

/* ============ 类型 ============ */

/** 审核状态：与「决策结果」正交的第二个维度（状态机流转对象） */
export type AuditStatus =
  | '待审核'
  | '审核中'
  | '待人工复核'
  | '已通过'
  | '已拒绝'
  | '已关闭'

/**
 * 决策结果：由审核状态 + 审核方式（系统 / 人工）共同推导
 * - 处理中：待审核 / 审核中（尚未形成结论）
 * - 准入 / 拒绝：系统引擎直接决策（未转人工），审核状态显示「--」
 * - 人工复核：转人工路径（待复核 / 已通过 / 已拒绝 / 已关闭）
 */
export type DecisionGroup = '处理中' | '准入' | '拒绝' | '人工复核'

export type BadgeKind = 'green' | 'red' | 'amber' | 'blue' | 'gray'

export interface AppRow extends Row {
  name: string
  idNo: string
  phone: string
  product: string
  channel: string
  amount: number
  fraudScore: number
  creditScore: number
  decision: BadgeVal
  operator: string
  auditStatus: AuditStatus
  gender: string
  age: number
  term: string
  purpose: string
  device: string
  ip: string
  city: string
  sameDevice: number
  multiOrgs: number
  reasonCode: string
}

/* ============ 状态元数据 ============ */

export const auditStatusMeta: Record<AuditStatus, { kind: BadgeKind; desc: string }> = {
  待审核: { kind: 'gray', desc: '已进件，尚未进入自动审核引擎' },
  审核中: { kind: 'blue', desc: '自动审核引擎处理中（反欺诈 / 信用 / 决策）' },
  待人工复核: { kind: 'amber', desc: '已转人工，等待复核员给出最终判定' },
  已通过: { kind: 'green', desc: '审核完成，予以准入' },
  已拒绝: { kind: 'red', desc: '审核完成，予以拒绝' },
  已关闭: { kind: 'gray', desc: '已关闭 / 作废，归档且不可再操作' },
}

export const decisionGroupMeta: Record<DecisionGroup, { kind: BadgeKind; desc: string }> = {
  处理中: { kind: 'blue', desc: '自动审核引擎处理中，尚未产生最终结论' },
  准入: { kind: 'green', desc: '系统直接准入，可进入授信与用信环节' },
  拒绝: { kind: 'red', desc: '系统直接拒绝，需合规告知原因' },
  人工复核: { kind: 'amber', desc: '已转人工复核，由复核员给出最终判定' },
}

/** 是否系统审核方式（系统自动 / 无复核员） */
export function isSystemOperator(r: AppRow): boolean {
  return !r.operator || String(r.operator).startsWith('系统')
}

/** 审核状态可流转到的目标（状态机） */
export const statusTransitions: Record<AuditStatus, AuditStatus[]> = {
  待审核: ['审核中'],
  审核中: ['已通过', '已拒绝', '待人工复核'],
  待人工复核: ['已通过', '已拒绝'], // 退回补充 / 挂起均保持本态
  已通过: ['已关闭'],
  已拒绝: ['已关闭'],
  已关闭: [],
}

export type ReviewerKind = 'pending' | 'system' | 'manual'

export interface ReviewerInfo {
  kind: ReviewerKind
  /** pending: '-'；system: '系统审核'；manual: '人工复核' */
  label: string
  /** 人工复核时的复核员姓名 */
  name?: string
}

/**
 * 审核方式 / 审核人（与「决策结果」对应）：
 * - 处理中（待审核 / 审核中）：尚未形成结论，审核人 = 「--」
 * - 准入 / 拒绝（系统直接决策）：审核人 = 「系统审核」
 * - 人工复核-待复核（待人工复核）：尚未形成结论，审核人 = 「--」
 * - 人工复核-已通过 / 已拒绝 / 已关闭：审核人 = 复核员用户名
 */
export function reviewerInfo(r: AppRow): ReviewerInfo {
  const g = rowDecisionGroup(r)
  if (g === '处理中') return { kind: 'pending', label: '--' }
  if (g === '准入' || g === '拒绝') return { kind: 'system', label: '系统审核' }
  // 人工复核路径
  if (r.auditStatus === '待人工复核') return { kind: 'pending', label: '--' }
  return { kind: 'manual', label: '人工复核', name: r.operator }
}

/** 审核人显示文本（列表 / 详情通用） */
export function reviewerText(r: AppRow): string {
  const i = reviewerInfo(r)
  return i.kind === 'manual' ? `${i.name}` : i.label
}

/* ============ 列表数据构建 ============ */

const genders = ['男', '女']
const terms = ['3 期', '6 期', '12 期', '24 期', '36 期']
const purposes = ['日常消费', '装修', '教育培训', '经营周转', '购车']
const cities = ['北京', '上海', '广州', '深圳', '成都', '杭州', '武汉']

/**
 * 场景循环：保证「审核状态」与「审核方式（系统 / 人工）」内部一致，
 * 覆盖 处理中 / 系统准入 / 系统拒绝 / 人工复核（待复核·已通过·已拒绝·已关闭）全部对应关系
 */
const scenarioCycle: { status: AuditStatus; system: boolean }[] = [
  { status: '待审核', system: true },      // 处理中
  { status: '审核中', system: true },      // 处理中
  { status: '已通过', system: true },      // 准入（系统审核）
  { status: '已拒绝', system: true },      // 拒绝（系统审核）
  { status: '待人工复核', system: false }, // 人工复核 · 待复核
  { status: '已通过', system: false },     // 人工复核 · 已通过
  { status: '已拒绝', system: false },     // 人工复核 · 已拒绝
  { status: '已关闭', system: false },     // 人工复核 · 已关闭
]

/** 在原始 applications 基础上补全申贷审核所需的扩展字段 */
export function getPreApps(): AppRow[] {
  return (applications as Row[]).map((r, i) => {
    const fraud = Number(r.fraudScore)
    const credit = Number(r.creditScore)
    const amount = Number(r.amount)
    const sc = scenarioCycle[i % scenarioCycle.length]
    return {
      ...r,
      name: r.name as string,
      idNo: (r.idNo as string) ?? '',
      phone: (r.phone as string) ?? '',
      product: r.product as string,
      channel: r.channel as string,
      amount,
      fraudScore: fraud,
      creditScore: credit,
      decision: r.decision as BadgeVal,
      operator: sc.system ? '系统自动' : '审核员' + ((i % 6) + 1),
      auditStatus: sc.status,
      gender: genders[i % 2],
      age: 22 + ((i * 7) % 43),
      term: terms[i % terms.length],
      purpose: purposes[i % purposes.length],
      device: `FP-${(1_000_000 + i * 13_337).toString(36).toUpperCase()}`,
      ip: `223.${i % 255}.${(i * 7) % 255}.${(i * 3) % 255}`,
      city: cities[i % cities.length],
      sameDevice: (i * 3) % 7,
      multiOrgs: 1 + (i % 9),
      reasonCode: `R-${2001 + i}`,
    } as AppRow
  })
}

/* ============ 筛选选项 ============ */

export const productOptions = ['现金贷', '消费分期', '信用卡', '汽车金融', '经营贷', '助学贷']
export const channelOptions = ['App', 'H5', '小程序', '线下', '合作方']

/** 由行推导决策结果分组（审核状态 + 审核方式共同决定） */
export function rowDecisionGroup(r: AppRow): DecisionGroup {
  const s = r.auditStatus
  if (s === '待审核' || s === '审核中') return '处理中'
  // 系统引擎直接给出准入 / 拒绝（未转人工）
  if ((s === '已通过' || s === '已拒绝') && isSystemOperator(r)) {
    return s === '已通过' ? '准入' : '拒绝'
  }
  // 其余（待人工复核 / 人工已通过 / 人工已拒绝 / 已关闭）均属人工复核路径
  return '人工复核'
}

/* ============ 同设备 / 关联进件 假数据 ============ */

function buildFakeApps(row: AppRow, count: number, sameDevice: boolean): AppRow[] {
  const products = ['现金贷', '消费分期', '信用卡', '汽车金融', '经营贷', '助学贷']
  const channels = ['App', 'H5', '小程序', '线下', '合作方']
  const statuses: AuditStatus[] = ['已通过', '已拒绝', '待人工复核', '已关闭', '审核中', '待审核']
  const decisions: BadgeVal[] = [
    { v: '准入', kind: 'green' },
    { v: '拒绝', kind: 'red' },
    { v: '人工复核', kind: 'amber' },
  ]
  const base = Number(String(row.id).replace(/\D/g, '')) || 0
  const arr: AppRow[] = []
  for (let i = 0; i < count; i++) {
    const seed = base + i * 31 + row.id.length
    const st = statuses[seed % statuses.length]
    arr.push({
      ...row,
      id: `${row.id}-${sameDevice ? 'D' : 'R'}${i + 1}`,
      product: products[seed % products.length],
      channel: channels[(seed >> 1) % channels.length],
      device: sameDevice ? row.device : `FP-${(base * 7 + i * 101 + 17).toString(36).toUpperCase()}`,
      city: row.city,
      auditStatus: st,
      decision: decisions[seed % decisions.length],
      operator: st === '待审核' || st === '审核中' ? '系统自动' : '审核员' + ((i % 6) + 1),
    })
  }
  return arr
}

/** 同设备近 30 天申请（假数据）：数量与详情页「同设备近 30 天申请 N 笔」完全一致 */
export function getDeviceApps(row: AppRow): AppRow[] {
  const n = Math.min(6, Math.max(1, row.sameDevice))
  return buildFakeApps(row, n, true)
}

/** 关联进件（假数据）：与申请定位城市相关的其他进件 */
export function getRelatedApps(row: AppRow): AppRow[] {
  return buildFakeApps(row, 5, false)
}

/* ============ 详情数据 ============ */

export interface FlowNode {
  name: string
  state: 'done' | 'active' | 'pending' | 'disabled'
  note?: string
}

/** 多轮人工复核中的单条记录（会话式时间线） */
export interface ReviewEntry {
  time: string
  party: string // 系统 / 复核员 / 主管 / 申请人
  action: string // 转人工 / 补充材料请求 / 材料提交 / 电话核实 / 提交结论 / 主管审批 / 关闭作废
  content: string
  attachment?: string
  fromStatus: AuditStatus
  toStatus: AuditStatus
  internal: boolean // true=风控内部（不对客），false=对客动作
}

export interface DetailData {
  base: { label: string; value: string }[]
  device: { label: string; value: string }[]
  deviceRisk: string[]
  association: { label: string; value: string }[]
  conclusion: { result: DecisionGroup; status: AuditStatus; finalAmount: string; finalRate: string; time: string; handler: string }
  scores: ScoreView[]
  rules: RuleHit[]
  riskIndex: { value: number; level: string; kind: 'red' | 'amber' | 'green' }
  flow: FlowNode[]
  reviews: ReviewEntry[]
}

const idTypes = ['身份证', '身份证', '护照', '港澳台居民居住证']
const timeSegments = ['工作日 09:12', '周末 22:47', '工作日 14:03', '凌晨 03:21']

/** 由申请时间与偏移构造精确到秒的时间戳 */
function reviewTime(datePrefix: string, h: number, m: number, s: number): string {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${datePrefix} ${p(h)}:${p(m)}:${p(s)}`
}

/** 构造多轮人工复核时间线（系统路由 → 复核员 → 申请人 → 复核员 → 提交结论 → 主管审批） */
function buildReviews(r: AppRow, _idx: number): ReviewEntry[] {
  // 处理中（待审核 / 审核中）：尚未进入人工复核，无复核留痕
  if (r.auditStatus === '待审核' || r.auditStatus === '审核中') return []

  const datePrefix = String(r.applyTime).slice(0, 10)
  const isSystemDecided = String(r.operator).startsWith('系统')
  const reviewer = isSystemDecided ? '复核员·张衡' : r.operator
  const isPass = r.auditStatus === '已通过'

  // 待人工复核：已进入人工复核队列，等待最终结论（无论 operator 是否系统占位，均展示待判定过程）
  if (r.auditStatus === '待人工复核') {
    return [
      {
        time: reviewTime(datePrefix, 14, 2, 11),
        party: '系统',
        action: '转人工',
        content: `综合评分临界（欺诈分 ${r.fraudScore} / 信用分 ${r.creditScore}），自动路由转人工复核。`,
        fromStatus: '审核中',
        toStatus: '待人工复核',
        internal: true,
      },
      {
        time: reviewTime(datePrefix, 14, 10, 33),
        party: reviewer,
        action: '补充材料请求',
        content: '请补充近 6 个月收入证明与银行流水，并核实现工作单位。',
        fromStatus: '待人工复核',
        toStatus: '待人工复核',
        internal: true,
      },
      {
        time: reviewTime(datePrefix, 14, 35, 7),
        party: '申请人',
        action: '材料提交',
        content: '已上传：收入证明.pdf、银行流水.pdf、在职证明.png。',
        attachment: '收入证明.pdf',
        fromStatus: '待人工复核',
        toStatus: '待人工复核',
        internal: false,
      },
      {
        time: reviewTime(datePrefix, 15, 20, 49),
        party: reviewer,
        action: '电话核实',
        content: '已电核单位座机，信息属实，未见异常；与申请人本人核实一致。',
        fromStatus: '待人工复核',
        toStatus: '待人工复核',
        internal: true,
      },
      {
        time: reviewTime(datePrefix, 15, 41, 2),
        party: reviewer,
        action: '提交前复核',
        content: '材料齐全，等待复核员提交最终结论（退回补充 / 挂起均保持本态）。',
        fromStatus: '待人工复核',
        toStatus: '待人工复核',
        internal: true,
      },
    ]
  }

  // 已通过 / 已拒绝 / 已关闭：仅人工复核结论才有复核留痕；系统审核直接决策，无人工复核
  if (isSystemDecided) return []

  const base: ReviewEntry[] = [
    {
      time: reviewTime(datePrefix, 14, 2, 11),
      party: '系统',
      action: '转人工',
      content: `综合评分临界（欺诈分 ${r.fraudScore} / 信用分 ${r.creditScore}），自动路由转人工复核。`,
      fromStatus: '审核中',
      toStatus: '待人工复核',
      internal: true,
    },
    {
      time: reviewTime(datePrefix, 14, 10, 33),
      party: reviewer,
      action: '补充材料请求',
      content: '请补充近 6 个月收入证明与银行流水，并核实现工作单位。',
      fromStatus: '待人工复核',
      toStatus: '待人工复核',
      internal: true,
    },
    {
      time: reviewTime(datePrefix, 14, 35, 7),
      party: '申请人',
      action: '材料提交',
      content: '已上传：收入证明.pdf、银行流水.pdf、在职证明.png。',
      attachment: '收入证明.pdf',
      fromStatus: '待人工复核',
      toStatus: '待人工复核',
      internal: false,
    },
    {
      time: reviewTime(datePrefix, 15, 20, 49),
      party: reviewer,
      action: '电话核实',
      content: '已电核单位座机，信息属实，未见异常；与申请人本人核实一致。',
      fromStatus: '待人工复核',
      toStatus: '待人工复核',
      internal: true,
    },
  ]

  if (r.auditStatus === '已通过' || r.auditStatus === '已拒绝') {
    base.push({
      time: reviewTime(datePrefix, 15, 40, 12),
      party: reviewer,
      action: '提交结论',
      content: isPass ? '材料齐全、反欺诈与信用均达标，予以准入。' : '多头借贷超阈且收入佐证不足，予以拒绝。',
      fromStatus: '待人工复核',
      toStatus: r.auditStatus,
      internal: true,
    })
    base.push({
      time: reviewTime(datePrefix, 15, 52, 30),
      party: '主管',
      action: '主管审批',
      content: isPass ? '同意准入，按建议额度与利率核发。' : '同意拒绝，按合规口径告知原因。',
      fromStatus: r.auditStatus,
      toStatus: r.auditStatus,
      internal: true,
    })
    return base
  }

  // 已关闭（人工复核结论后被关闭）
  base.push({
    time: reviewTime(datePrefix, 16, 5, 0),
    party: '系统',
    action: '关闭 / 作废',
    content: '申请已关闭（过期 / 撤单 / 客户放弃），归档且不可再操作。',
    fromStatus: '待人工复核',
    toStatus: '已关闭',
    internal: true,
  })
  return base
}

export function getDetail(r: AppRow, idx: number): DetailData {
  const result = rowDecisionGroup(r)
  const sample = SAMPLES[selectSample(r)]
  const finalAmount = r.amount * (r.auditStatus === '已拒绝' ? 0 : 0.9)
  const finalRate = 5.6 + (r.fraudScore / 100) * 6 + (900 - r.creditScore) / 100

  const deviceApps = getDeviceApps(r)
  const deviceRisk: string[] = []
  if (r.fraudScore > 60) deviceRisk.push('设备命中群控特征库')
  if (deviceApps.length > 0) deviceRisk.push(`同设备近 30 天申请 ${deviceApps.length} 笔`)
  if (r.city === '深圳' && r.ip.startsWith('223.0')) deviceRisk.push('IP 归属地与申请定位不一致')
  if (deviceRisk.length === 0) deviceRisk.push('设备环境未见明显异常')

  const rules = buildRules(sample.rules)
  const st = r.auditStatus
  const flow: FlowNode[] = [
    { name: '进件提交', state: st === '待审核' ? 'active' : 'done' },
    { name: '要素核验', state: st === '待审核' ? 'pending' : 'done', note: '三要素一致' },
    { name: '反欺诈识别', state: st === '待审核' ? 'pending' : 'done', note: `欺诈分 ${r.fraudScore}` },
    { name: '信用评估', state: st === '待审核' ? 'pending' : 'done', note: `信用分 ${r.creditScore}` },
    {
      name: '决策输出',
      state: st === '审核中' ? 'active' : st === '待审核' ? 'pending' : 'done',
      note: st === '待审核' ? undefined : r.decision.v,
    },
    {
      name: '人工复核',
      // 仅进入人工复核流程（待人工复核 / 已终结 / 已关闭）时可用；自动处理阶段（待审核 / 审核中）不涉及人工复核，置为不可用
      state:
        st === '待人工复核' ? 'active'
        : st === '已通过' || st === '已拒绝' || st === '已关闭' ? 'done'
        : 'disabled',
      note: st === '已关闭' ? '已关闭' : undefined,
    },
  ]

  const reviews = buildReviews(r, idx)

  const calcTime = `${String(r.applyTime).slice(0, 10)} 10:23:14`
  const scores = buildScores(sample, calcTime)
  const riskIndex = computeRiskIndex(sample)

  return {
    base: [
      { label: '申请人', value: `${r.name}（${r.gender} / ${r.age} 岁）` },
      { label: '证件类型', value: idTypes[idx % idTypes.length] },
      { label: '证件号', value: maskId(r.idNo) },
      { label: '手机号', value: maskPhone(r.phone) },
      { label: '产品', value: r.product },
      { label: '渠道', value: r.channel },
      { label: '申请额度', value: '¥' + r.amount.toLocaleString('zh-CN') },
      { label: '期限', value: r.term },
      { label: '申请用途', value: r.purpose },
      { label: '申请时间', value: r.applyTime as string },
    ],
    device: [
      { label: '设备指纹', value: r.device },
      { label: 'IP 地址', value: r.ip },
      { label: '申请定位', value: r.city },
      { label: '申请时段', value: timeSegments[idx % timeSegments.length] },
    ],
    deviceRisk,
    association: [
      { label: '同设备历史申请', value: `${deviceApps.length} 笔` },
      { label: '同人历史进件', value: `${1 + (idx % 4)} 笔` },
      { label: '多头借贷机构数', value: `${r.multiOrgs} 家` },
    ],
    conclusion: {
      result,
      status: r.auditStatus,
      finalAmount: '¥' + finalAmount.toLocaleString('zh-CN'),
      finalRate: finalRate.toFixed(2) + '%',
      time: String(r.applyTime).slice(0, 10) + ' 16:' + String(10 + (idx % 49)).padStart(2, '0'),
      handler: r.operator,
    },
    scores,
    rules,
    riskIndex,
    flow,
    reviews,
  }
}

function maskId(s: string): string {
  if (!s) return '-'
  return s.slice(0, 4) + '**********' + s.slice(-4)
}
function maskPhone(s: string): string {
  if (!s) return '-'
  return s.slice(0, 3) + '****' + s.slice(-4)
}

/* ============ 按产品差异化的自动报告 ============ */

export interface ReportModule {
  title: string
  items: string[]
}
export interface ProductReport {
  emphasis: string
  modules: ReportModule[]
  advice: string
}

export function getReport(r: AppRow, detail: DetailData): ProductReport {
  const g = detail.conclusion.result
  const s = r.auditStatus
  const decisionText =
    g === '处理中' ? '处理中，等待引擎结论'
    : g === '准入' ? '建议准入'
    : g === '拒绝' ? '建议拒绝'
    : s === '待人工复核' ? '建议转人工复核'
    : s === '已通过' ? '人工复核准入'
    : s === '已拒绝' ? '人工复核拒绝'
    : '已关闭，归档'
  const common: ReportModule[] = [
    { title: '申请人画像', items: [`${r.name} · ${r.gender} · ${r.age} 岁`, `风险分层：${detail.scores[0].level}欺诈 / ${detail.scores[1].level}信用`] },
    {
      title: '风险评分区',
      items: [
        `欺诈分（智察分）：${detail.scores[0].value}（${detail.scores[0].level}）`,
        `信用分（智信分）：${detail.scores[1].value}（${detail.scores[1].level}）`,
        `综合分（智融分）：${detail.scores[2].value}（${detail.scores[2].level}）`,
      ],
    },
    { title: '命中规则与模型', items: detail.rules.map((x) => `${x.name}：${x.hitText}（权重 ${x.weight}）`) },
    {
      title: '决策建议',
      items: [decisionText, `额度建议：${detail.conclusion.finalAmount} / 利率 ${detail.conclusion.finalRate}`],
    },
  ]

  switch (r.product) {
    case '现金贷':
      return {
        emphasis: '欺诈分为主（精简版，强调实时风险）',
        modules: [
          { title: '欺诈识别', items: [`欺诈分 ${detail.scores[0].value}`, ...detail.deviceRisk] },
          { title: '设备指纹', items: [r.device, r.ip, r.city] },
          { title: '多头借贷', items: [`近 30 天 ${r.multiOrgs} 家机构在查`, `同设备 ${r.sameDevice} 笔申请`] },
          { title: '黑名单命中', items: detail.rules.filter((x) => x.level === 'red').map((x) => x.name) },
          ...common.slice(1),
        ],
        advice: '小额短期产品以实时反欺诈为核心，长期信用权重下调；建议单笔额度≤ ¥20,000。',
      }
    case '消费分期':
      return {
        emphasis: '信用分 + 消费场景核验',
        modules: [
          { title: '信用评估', items: [`信用分 ${detail.scores[1].value}`, `多头借贷 ${r.multiOrgs} 家`] },
          { title: '消费场景核验', items: [`申请用途：${r.purpose}`, '商户真实性核验通过'] },
          { title: '还款能力', items: [`授信额度建议：${detail.conclusion.finalAmount}`, `利率建议：${detail.conclusion.finalRate}`] },
          ...common.slice(1),
        ],
        advice: '结合消费场景与还款能力给出授信，强调额度与场景匹配。',
      }
    case '汽车金融':
      return {
        emphasis: '车辆信息 + 身份反欺诈',
        modules: [
          { title: '车辆信息', items: ['车辆 VIN 已核验', 'GPS/抵押状态正常'] },
          { title: '身份反欺诈', items: [...detail.deviceRisk] },
          { title: '首付来源', items: ['首付比例核验通过', '资金来源未见异常'] },
          ...common.slice(1),
        ],
        advice: '车辆为核心抵押物，重点核验权属与抵押状态。',
      }
    case '经营贷':
      return {
        emphasis: '企业风控 + 经营流水',
        modules: [
          { title: '法人关联', items: ['法人关联企业 2 家', '无重大司法风险'] },
          { title: '企业征信', items: ['企业征信正常', '无欠税记录'] },
          { title: '经营流水', items: ['近 12 月流水稳定', '营收覆盖负债'] },
          ...common.slice(1),
        ],
        advice: '以企业经营稳定性为核心，关注流水与负债覆盖。',
      }
    default:
      return {
        emphasis: '综合评估（信用 + 反欺诈）',
        modules: common,
        advice: '综合信用与反欺诈结论，按通用口径给出决策建议。',
      }
  }
}

/* ============ 信息核验（申贷审核详情页「信息核验区」与独立核验页共用） ============ */
export type VResult = 'pass' | 'fail' | 'pending' | 'warn'
export interface InfoVerifyVM {
  conclusion: '通过' | '不通过' | '待人工确认'
  mode: string
  verifyTime: string
  handler: string
  format: { label: string; value: string; result: VResult; note?: string }[]
  identity: { label: string; result: string; time: string }[]
  liveness: { live: string; score: string; threshold: string; judge: string }
  ocr: { confidence: string; antiFake: string }
  logic: { pass: boolean; conflicts: string[] }
  hasManual: boolean
  manual: { time: string; party: string; action: string; content: string }[]
}
function maskName(s: string): string {
  return s ? s.slice(0, 1) + '**' : '-'
}
/**
 * 信息核验结论（自动为主、人工兜底）：
 * - 由欺诈分派生演示结论（>70 不通过 / >55 待人工 / 其余通过），对应「宽松 / 标准 / 严格」核验模式。
 * - 输出 4 组核验条目（格式校验 / 身份要素 / 活体人脸 / 逻辑一致性），作为申贷审核详情页「信息核验区」与独立核验页的统一数据源。
 */
export function buildInfoVerify(r: AppRow, idx: number): InfoVerifyVM {
  const c = r.fraudScore
  const conclusion: InfoVerifyVM['conclusion'] = c > 70 ? '不通过' : c > 55 ? '待人工确认' : '通过'
  const mode =
    r.product === '现金贷'
      ? '宽松模式'
      : r.product === '汽车金融' || r.product === '经营贷'
        ? '严格模式'
        : '标准模式'
  const verifyTime = String(r.applyTime).slice(0, 10) + ' 10:23'
  const handler = conclusion === '通过' ? '自动（STP）' : '人工兜底'
  const idInconsistent = conclusion === '不通过'
  const bankTail = String(((idx * 137 + 1234) % 9000) + 1000)
  const format = [
    { label: '姓名', value: maskName(r.name), result: 'pass' as VResult },
    {
      label: '身份证号',
      value: maskId(r.idNo),
      result: (idInconsistent ? 'fail' : 'pass') as VResult,
      note: idInconsistent ? '与申请填写年龄不一致' : undefined,
    },
    { label: '手机号', value: maskPhone(r.phone), result: 'pass' as VResult },
    {
      label: '银行卡号',
      value: '**** **** **** ' + bankTail,
      result: (conclusion === '不通过' ? 'fail' : 'pass') as VResult,
    },
  ]
  const identity = [
    { label: '二要素（姓名+身份证）', result: idInconsistent ? '不一致' : '一致', time: verifyTime },
    { label: '三要素（+银行卡）', result: idInconsistent ? '不一致' : '一致', time: verifyTime },
    {
      label: '四要素（+手机号）',
      result: conclusion === '待人工确认' ? '无法核实' : idInconsistent ? '不一致' : '一致',
      time: verifyTime,
    },
  ]
  const liveness = {
    live: conclusion === '不通过' ? '未通过' : '通过',
    score: conclusion === '待人工确认' ? '82.3%' : conclusion === '不通过' ? '61.2%' : '98.6%',
    threshold: '≥ 90%',
    judge: conclusion === '待人工确认' ? '临界·待人工目视复核' : conclusion === '不通过' ? '非同一人' : '同一人',
  }
  const ocr = {
    confidence: conclusion === '待人工确认' ? '76%' : conclusion === '不通过' ? '58%' : '98%',
    antiFake: conclusion === '不通过' ? '疑似伪造/篡改' : '正常',
  }
  const logic = {
    pass: !idInconsistent,
    conflicts: idInconsistent
      ? [`身份证推算年龄 23 岁 与 申请填写年龄 ${r.age} 岁 不一致`, '证件照与活体照相似度低于阈值']
      : [],
  }
  const hasManual = conclusion !== '通过'
  const manual = hasManual
    ? [
        {
          time: verifyTime,
          party: '系统',
          action: '自动核验',
          content: '格式 / OCR / 要素核验完成，落入「待人工确认」区间，自动转入异常件队列。',
        },
        {
          time: verifyTime + ':40',
          party: '复核员·李杭',
          action: '目视比对',
          content: `活体照与证件照相似度 ${liveness.score}，处于临界区间，人工目视复核中。`,
        },
        {
          time: verifyTime + ':55',
          party: '复核员·李杭',
          action: '处置结论',
          content:
            conclusion === '不通过'
              ? '证件疑似篡改，判定不通过并上报欺诈识别模块。'
              : '临界但可确认同一人，人工确认通过，结论回流引擎。',
        },
      ]
    : []
  return { conclusion, mode, verifyTime, handler, format, identity, liveness, ocr, logic, hasManual, manual }
}

/* ============ 信用风控区（多头 / 共债 / 联防联控） ============ */
export interface CreditRiskVM {
  level: 'green' | 'amber' | 'red'
  multiOrg: number
  samePerson: string
  coDebt: { label: string; value: string; level: 'green' | 'amber' | 'red' }
  jointDefense: { label: string; value: string; level: 'green' | 'amber' | 'red' }
  items: { label: string; value: string; level: 'green' | 'amber' | 'red' }[]
}
export function buildCreditRisk(r: AppRow, detail: DetailData): CreditRiskVM {
  const multiOrg = r.multiOrgs
  const samePerson = detail.association.find((a) => a.label === '同人历史进件')?.value ?? '0 笔'
  const coLevel: 'green' | 'amber' | 'red' = multiOrg >= 6 ? 'red' : multiOrg >= 3 ? 'amber' : 'green'
  const coDebt = {
    label: '共债评估',
    value: coLevel === 'red' ? '共债偏高 · 多机构叠加负债' : coLevel === 'amber' ? '共债中等 · 需关注' : '共债可控',
    level: coLevel,
  }
  const jointHit = detail.deviceRisk.some((t) => t.includes('群控') || t.includes('名单'))
  const jointDefense = {
    label: '联防联控',
    value: jointHit ? '命中联防联控名单' : '未命中联防联控名单',
    level: jointHit ? 'red' : 'green',
  }
  const level: 'green' | 'amber' | 'red' = coLevel === 'red' || jointHit ? 'red' : coLevel === 'amber' ? 'amber' : 'green'
  const items = [
    { label: '多头借贷机构数', value: `${multiOrg} 家（近 30 天）`, level: multiOrg >= 6 ? 'red' : multiOrg >= 3 ? 'amber' : 'green' },
    { label: '同人历史进件', value: samePerson, level: 'green' },
    { label: '共债率', value: coLevel === 'red' ? '> 60%' : coLevel === 'amber' ? '30% ~ 60%' : '< 30%', level: coLevel },
    { label: '联防联控', value: jointHit ? '已命中' : '未命中', level: jointHit ? 'red' : 'green' },
  ]
  return { level, multiOrg, samePerson, coDebt, jointDefense, items }
}

/* ============ 欺诈识别区（含「设备与环境」） ============ */
export interface FraudRiskVM {
  device: { label: string; value: string }[]
  deviceRisk: string[]
  gang: { label: string; hit: boolean; note: string }[]
  behavior: { label: string; hit: boolean; note: string }[]
}
export function buildFraudRisk(r: AppRow, detail: DetailData): FraudRiskVM {
  const device = detail.device
  const deviceRisk = detail.deviceRisk
  const sameDevice = r.sameDevice
  const gang = [
    { label: '设备聚集', hit: sameDevice >= 3, note: `同设备近 30 天申请 ${sameDevice} 笔${sameDevice >= 3 ? '（命中聚集特征）' : ''}` },
    { label: '关系网络', hit: r.multiOrgs >= 6, note: r.multiOrgs >= 6 ? '多机构借贷，疑似共债团伙' : '未见显著关系网络聚集' },
  ]
  const seg = detail.device.find((d) => d.label === '申请时段')?.value ?? ''
  const behavior = [
    { label: '群控 / 模拟器', hit: deviceRisk.some((t) => t.includes('群控')), note: deviceRisk.some((t) => t.includes('群控')) ? '设备命中群控特征库' : '未检出群控 / 模拟器特征' },
    { label: '异地 / IP 不一致', hit: deviceRisk.some((t) => t.includes('IP 归属')), note: deviceRisk.some((t) => t.includes('IP 归属')) ? 'IP 归属地与申请定位不一致' : 'IP 与定位一致' },
    { label: '异常时段', hit: ['凌晨 03:21', '周末 22:47'].includes(seg), note: ['凌晨 03:21', '周末 22:47'].includes(seg) ? '深夜 / 凌晨高频申请，需关注' : '常规时段申请' },
  ]
  return { device, deviceRisk, gang, behavior }
}
