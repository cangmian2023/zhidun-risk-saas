// 欺诈识别报告（方案4 · 完整版「功能与内容设计文档」V1.0）· 数据模型与示例数据
// 与方案1/2/3 平行、独立、已作为 cr:pre-fraud 模块（原 fraudReport 数据层已退役）。
// 框架/交互沿用信息核验体系（组件与交互骨架 1:1 复用），内容承载方案4 文档的列表页 + 9 段详情。
// 风险等级采用文档四档：极低/低(0-39) · 中(40-59) · 高(60-79) · 极高(80-100)。
import type { VerifyThread, Conclusion, BasicField } from './infoVerifyReport'
export type FraudS4ScoreBand = '极低' | '低' | '中' | '高' | '极高'
// 自动决策（自动审核）按欺诈等级映射（见 N7）：低→通过 / 中→预警 / 高→拒绝 / 极高→拒绝；结果计算前为 处理中
export type FraudS4AutoDecision = '通过' | '拒绝' | '预警' | '处理中'
export type FraudS4RuleType = '设备欺诈' | '身份欺诈' | '团伙欺诈' | '行为欺诈' | '信息伪造' | '黑名单命中'
// 人工处置状态（方案4 独立状态机，按 N8 矩阵）：核验计算中 / 待确认 / 已确认 / 初审拒贷 / 强制放行 / 加入黑名单 / 待审核 / 提交复核 / 复核通过 / 复核拒绝 - 拒绝办结
export type FraudS4WorkStatus = '核验计算中' | '待确认' | '已确认' | '初审拒贷' | '强制放行' | '加入黑名单' | '待审核' | '提交复核' | '复核通过' | '复核拒绝 - 拒绝办结'
export type FraudS4Level = '极高' | '高' | '中' | '低'

export interface FraudS4Factor {
  name: string
  score: number
  weight: number // 权重百分比
  level: FraudS4Level
  desc: string
  traceTo?: string // 点击跳转到对应分析模块（与右侧导航锚点 id 对齐）
}
export interface FraudS4Rule {
  name: string
  type: FraudS4RuleType
  status: '命中' | '未命中'
  condition: string // 命中条件
  weight: FraudS4Level | '—' // 该规则的权重档位（命中时有效，未命中显示「—」）
  linkage: string // 信息核验联动
  advice: string // 处置建议（命中时有效）
  exemptible: boolean
}
export interface FraudS4Device {
  fingerprint: string
  type: string
  root: string
  simulator: string
  vpn: string
  relatedIdentities: number
  relatedApplications: number
  firstSeen: string
  riskTags: string[]
}
export interface FraudS4DeviceNode {
  id: string
  label: string
  kind: 'current' | 'applicant' | 'device' | 'network' | 'phone'
}
export interface FraudS4DeviceEdge {
  from: string
  to: string
  label: string
}
export interface FraudS4BehaviorEvent {
  time: string
  action: string
  flag: string
}
export interface FraudS4Behavior {
  duration: string
  fillSpeed: string
  dwell: string
  path: string
  anomalies: string[]
  deviation: string
  gps: string
  timeline: FraudS4BehaviorEvent[]
}
export interface FraudS4Association {
  type: string
  target: string
  strength: string
  status: string
}
export interface FraudS4Graph {
  gangTag: string
  relevanceScore: number
  dimensions: string[]
  nodeCount: number
  gangSize: number
  gangHistory: number
  associations: FraudS4Association[]
}
export interface FraudS4BlacklistHit {
  type: string
  field: string
  source: string
  reason: string
  time: string
  level: '极高危' | '高危' | '中' | '低'
}
export interface FraudS4BlacklistRecord {
  db: string
  field: string
  content: string
  reason: string
  time: string
  level: '极高危' | '高危' | '中' | '低'
}
export interface FraudS4History {
  appId: string
  time: string
  score: number
  rules: string
  result: string
  operator: string
  opTime: string
}
export interface FraudS4OpLog {
  type: string
  content: string
  operator: string
  time: string
  result?: string
  remark?: string
}
export interface FraudS4Disposition {
  suggestion: string
  reason: string
  evidence: string[]
}

export interface FraudS4Report {
  appId: string
  name: string
  idNo: string // 脱敏身份证
  reportTime: string
  ruleVersion: string
  fraudScore: number
  scoreBand: FraudS4ScoreBand
  hitRuleCount: number
  totalRuleCount: number
  autoDecision: FraudS4AutoDecision
  fraudTags: string[]
  scoreTrend: number[]
  factors: FraudS4Factor[]
  rules: FraudS4Rule[]
  device: FraudS4Device
  deviceNodes: FraudS4DeviceNode[]
  deviceEdges: FraudS4DeviceEdge[]
  behavior: FraudS4Behavior
  graph: FraudS4Graph
  blacklistHit: FraudS4BlacklistHit
  blacklistRecords: FraudS4BlacklistRecord[]
  history: FraudS4History[]
  disposition: FraudS4Disposition
  opLogs: FraudS4OpLog[]
  threads: VerifyThread[] // 9 步欺诈识别过程（结论随风险等级上色，仿信息核验「核验过程」）
  basic: BasicField[] // 用户基本信息（简化、弱化展示）
  // 列表联动字段
  workStatus: FraudS4WorkStatus
  operator: string
  gangTag: string
  product: string
  amount: number
  ruleTypes: FraudS4RuleType[]
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T
}

/* ───────────────────── 9 步欺诈识别过程（结论随风险等级上色，仿信息核验「核验过程」） ───────────────────── */
const mkThread = (
  id: string,
  name: string,
  icon: VerifyThread['icon'],
  conclusion: Conclusion,
  result: string,
): VerifyThread => ({
  id,
  name,
  icon,
  status: conclusion === 'reject' ? 'fail' : 'done',
  start: '2026-07-21 14:22:01.000',
  end: '2026-07-21 14:22:02.000',
  result,
  conclusion,
})
function buildFraudS4Threads(variant: 'pass' | 'warning' | 'reject'): VerifyThread[] {
  const base = [
    mkThread('t1', '用户填报资料提交申请', 'police', 'pass', '资料完整提交'),
    mkThread('t2', '活体检测', 'police', 'pass', '活体通过 · 人脸一致'),
    mkThread('t3', '设备环境采集', 'device', 'pass', '环境正常'),
    mkThread('t4', '信息格式校验', 'rule', 'pass', '格式校验通过'),
    mkThread('t5', 'OCR 反欺诈识别', 'operator', 'pass', 'OCR 识别一致'),
    mkThread('t6', '多源反欺诈单项策略核验', 'network', 'pass', '单项核验通过'),
    mkThread('t7', '关联网络分析', 'network', 'pass', '关联网络正常'),
    mkThread('t8', '团伙欺诈模型', 'rule', 'pass', '未命中团伙规则'),
    mkThread('t9', '反欺诈评分', 'network', 'pass', '低风险通过'),
  ]
  if (variant === 'pass') return base
  if (variant === 'warning') {
    return base.map((t) =>
      t.id === 't3' || t.id === 't6' || t.id === 't7' || t.id === 't8' || t.id === 't9'
        ? { ...t, conclusion: 'warning' as Conclusion, result: t.result.replace('正常', '存疑').replace('通过', '疑似风险').replace('未命中团伙规则', '疑似团伙关联') }
        : t,
    )
  }
  // reject（确认欺诈）
  return base.map((t) =>
    ['t3', 't6', 't7', 't8', 't9'].includes(t.id)
      ? { ...t, conclusion: 'reject' as Conclusion, result: t.result.replace('正常', '高危').replace('通过', '拒绝').replace('未命中团伙规则', '命中团伙规则') }
      : t,
  )
}

/* ───────────────────── 规则库（身份欺诈 7 + 信息伪造 8） ───────────────────── */
// 命中条件 / 权重 / 信息核验联动 依设计表固化；status 由下方命中集合按预警情况（reject/warning/pass）动态标记。
const RULE_DEFS: FraudS4Rule[] = [
  // —— 身份欺诈（7） ——
  { name: '公安实名核验不一致', type: '身份欺诈', status: '未命中', weight: '极高', condition: '姓名+身份证号+人脸与公安库比对不一致', linkage: '信息核验第7步：三要素核验', advice: '建议拒绝并加入黑名单', exemptible: false },
  { name: '活体攻击检测', type: '身份欺诈', status: '未命中', weight: '极高', condition: '检测到屏幕翻拍、照片攻击、深度伪造（Deepfake）、面具/头模攻击', linkage: '信息核验第2步：活体检测', advice: '建议拒绝并人工复核', exemptible: false },
  { name: '人脸相似度过低', type: '身份欺诈', status: '未命中', weight: '高', condition: '活体采集人脸与身份证照片相似度<阈值（如80%）', linkage: '信息核验第2步：人脸一致', advice: '建议转人工复核', exemptible: true },
  { name: '身份证照片非实拍', type: '身份欺诈', status: '未命中', weight: '高', condition: '上传的身份证照片为翻拍、扫描件、PS合成', linkage: '信息核验第6步：OCR识别', advice: '建议拒绝并复核', exemptible: true },
  { name: '身份证有效期异常', type: '身份欺诈', status: '未命中', weight: '中', condition: '身份证已过期、即将过期（<3个月）、挂失状态', linkage: '信息核验第6步：OCR识别', advice: '建议转人工复核', exemptible: true },
  { name: '手机号实名不一致', type: '身份欺诈', status: '未命中', weight: '高', condition: '手机号实名姓名与申请人姓名不一致', linkage: '信息核验第7步：运营商核验', advice: '建议转人工复核', exemptible: true },
  { name: '银行卡四要素不一致', type: '身份欺诈', status: '未命中', weight: '极高', condition: '卡号+姓名+身份证+手机号四要素核验失败', linkage: '信息核验第7步：四要素核验', advice: '建议拒绝', exemptible: false },
  // —— 信息伪造（8） ——
  { name: '工作单位虚假', type: '信息伪造', status: '未命中', weight: '高', condition: '填报单位名称在工商库中不存在，或单位电话无法接通', linkage: '信息核验：无直接联动，需外部核验', advice: '建议转人工复核（外部工商核验）', exemptible: true },
  { name: '收入证明伪造', type: '信息伪造', status: '未命中', weight: '高', condition: '上传的收入证明文件元数据异常（如截图、修改时间异常）或与银行流水不符', linkage: '信息核验：无直接联动', advice: '建议转人工复核', exemptible: true },
  { name: '银行流水伪造', type: '信息伪造', status: '未命中', weight: '高', condition: '流水文件为PS/截图、交易对手异常、金额规律性异常（如固定间隔入账）', linkage: '信息核验：无直接联动', advice: '建议转人工复核', exemptible: true },
  { name: '居住地址虚假', type: '信息伪造', status: '未命中', weight: '中', condition: '填报地址与GPS定位偏差过大（如>100km），或地址不存在', linkage: '信息核验：环境采集GPS', advice: '建议转人工复核', exemptible: true },
  { name: '学历信息虚假', type: '信息伪造', status: '未命中', weight: '中', condition: '填报学历与学信网核验不一致', linkage: '信息核验：无直接联动', advice: '建议转人工复核', exemptible: true },
  { name: '紧急联系人异常', type: '信息伪造', status: '未命中', weight: '中', condition: '紧急联系人手机号与申请人存在关联（如共享设备、同IP），或为空号/停机', linkage: '信息核验：无直接联动', advice: '建议转人工复核', exemptible: true },
  { name: '工作单位与行业不符', type: '信息伪造', status: '未命中', weight: '低', condition: '填报行业与单位经营范围不符（如科技公司填报制造业）', linkage: '信息核验：无直接联动', advice: '建议转人工复核', exemptible: true },
  { name: '收入与职位不匹配', type: '信息伪造', status: '未命中', weight: '中', condition: '填报职位对应的行业平均收入与申报收入偏差过大（如前台申报月薪5万）', linkage: '信息核验：无直接联动', advice: '建议转人工复核', exemptible: true },
]

// 三态命中集合（命中 = 命中规则名）
const REJECT_HIT = new Set<string>([
  '活体攻击检测', '人脸相似度过低', '身份证照片非实拍', // 身份 3
  '工作单位虚假', '银行流水伪造', '居住地址虚假', '紧急联系人异常', '收入与职位不匹配', // 信息伪造 5
])
const WARNING_HIT = new Set<string>([
  '活体攻击检测', '人脸相似度过低', // 身份 2
  '工作单位虚假', '居住地址虚假', // 信息伪造 2
])
const PASS_HIT = new Set<string>([])

function buildRules(hit: Set<string>): FraudS4Rule[] {
  return RULE_DEFS.map((r) => {
    const isHit = hit.has(r.name)
    return { ...r, status: isHit ? '命中' : '未命中', advice: isHit ? r.advice : '—' }
  })
}

/* ───────────────────── 确认欺诈（reject · 极高）完整样本（对齐文档 FA-20260618-003） ───────────────────── */
function baseReport(): FraudS4Report {
  return {
    appId: 'FA-20260618-003',
    name: '王强',
    idNo: '110101********0314',
    reportTime: '2026-07-21 15:00:22',
    ruleVersion: 'V2.6',
    fraudScore: 88,
    scoreBand: '极高',
    hitRuleCount: 8,
    totalRuleCount: 15,
    autoDecision: '拒绝',
    fraudTags: ['设备群控', '团伙欺诈', '黑名单命中'],
    scoreTrend: [62, 66, 70, 68, 74, 79, 82, 84, 86, 88],
    factors: [
      { name: '设备欺诈', score: 95, weight: 25, level: '极高', desc: '设备存在 Root/越狱，关联多身份申请', traceTo: 'device' },
      { name: '身份欺诈', score: 30, weight: 20, level: '低', desc: '身份核验三要素一致，无异常', traceTo: 'rules' },
      { name: '团伙欺诈', score: 85, weight: 20, level: '极高', desc: '关联已知欺诈团伙，共享设备/网络', traceTo: 'graph' },
      { name: '行为欺诈', score: 70, weight: 15, level: '高', desc: '操作轨迹异常，疑似脚本/自动化工具', traceTo: 'behavior' },
      { name: '信息伪造', score: 45, weight: 10, level: '中', desc: '部分填报信息与核验结果不一致', traceTo: 'forge' },
      { name: '黑名单命中', score: 100, weight: 10, level: '极高', desc: '命中反欺诈黑名单库', traceTo: 'blacklist' },
    ],
    rules: buildRules(REJECT_HIT),
    device: {
      fingerprint: 'DV-9F2A-77C1',
      type: 'Android 13，小米13',
      root: '已 Root',
      simulator: '未检测到模拟器',
      vpn: '检测到 VPN',
      relatedIdentities: 5,
      relatedApplications: 12,
      firstSeen: '2026-07-15',
      riskTags: ['Root设备', '多身份关联', 'VPN使用'],
    },
    deviceNodes: [
      { id: 'cur', label: '王强(当前)', kind: 'current' },
      { id: 'dev', label: 'DV-9F2A-77C1', kind: 'device' },
      { id: 'net', label: '共享网络', kind: 'network' },
      { id: 'ph', label: '138****1234', kind: 'phone' },
      { id: 'a1', label: '李某', kind: 'applicant' },
      { id: 'a2', label: '张某', kind: 'applicant' },
    ],
    deviceEdges: [
      { from: 'cur', to: 'dev', label: '使用设备' },
      { from: 'cur', to: 'net', label: '共享网络' },
      { from: 'cur', to: 'ph', label: '绑定手机号' },
      { from: 'a1', to: 'dev', label: '共享设备' },
      { from: 'a2', to: 'dev', label: '共享设备' },
    ],
    behavior: {
      duration: '45 秒',
      fillSpeed: '2.3 秒/字段（异常快）',
      dwell: '各页面停留时间普遍 < 1 秒，无正常浏览行为',
      path: '进入→填姓名→填身份证→填手机号→填银行卡→上传身份证→活体→提交，全程无回退',
      anomalies: ['无停顿连续输入', '无鼠标移动', '复制粘贴高频'],
      deviation: '偏离度 87%（显著异常）',
      gps: 'GPS 定位漂移，与基站定位偏差 38km（异常）',
      timeline: [
        { time: '14:30:00', action: '进入申请页面', flag: '—' },
        { time: '14:30:02', action: '填写姓名', flag: '无停顿输入' },
        { time: '14:30:03', action: '填写身份证号', flag: '无停顿输入' },
        { time: '14:30:05', action: '填写手机号', flag: '无停顿输入' },
        { time: '14:30:06', action: '填写银行卡号', flag: '无停顿输入' },
        { time: '14:30:08', action: '上传身份证照片', flag: '图片为截图而非实拍' },
        { time: '14:30:10', action: '活体检测', flag: '检测到屏幕翻拍' },
        { time: '14:30:15', action: '提交申请', flag: '表单填写速度异常' },
      ],
    },
    graph: {
      gangTag: '团伙A',
      relevanceScore: 92,
      dimensions: ['共享设备', '共享网络', '共享手机号'],
      nodeCount: 8,
      gangSize: 23,
      gangHistory: 15,
      associations: [
        { type: '共享设备', target: '申请人-李某', strength: '强', status: '已确认欺诈' },
        { type: '共享设备', target: '申请人-张某', strength: '强', status: '已确认欺诈' },
        { type: '共享网络', target: '申请人-王某', strength: '中', status: '高风险' },
        { type: '共享手机号段', target: '申请人-赵某', strength: '弱', status: '待复核' },
        { type: '共享GPS', target: '申请人-陈某', strength: '中', status: '已确认欺诈' },
      ],
    },
    blacklistHit: {
      type: '手机号黑名单',
      field: '138****1234',
      source: '跨行业联防联控库',
      reason: '已确认欺诈-设备群控',
      time: '2026-06-15',
      level: '高危',
    },
    blacklistRecords: [
      { db: '反欺诈黑名单', field: '手机号', content: '138****1234', reason: '已确认欺诈-设备群控', time: '2026-06-15', level: '高危' },
      { db: '设备黑名单', field: '设备指纹', content: 'DV-9F2A-77C1', reason: '设备农场关联', time: '2026-06-20', level: '高危' },
      { db: '团伙黑名单', field: '团伙标签', content: '团伙A', reason: '团伙欺诈已确认', time: '2026-05-10', level: '极高危' },
    ],
    history: [
      { appId: 'FA-20260512-089', time: '2026-05-12', score: 82, rules: '设备群控、操作轨迹异常', result: '已确认欺诈', operator: '风控专员-张磊', opTime: '2026-05-12 16:30' },
    ],
    disposition: {
      suggestion: '建议拒绝并加入黑名单',
      reason: '命中黑名单 + 设备群控 + 团伙关联，欺诈概率极高',
      evidence: ['设备 Root+关联 3 身份', '命中反欺诈黑名单', '关联团伙A（关联度 92）'],
    },
    opLogs: [
      { type: '欺诈报告生成', content: '系统自动生成欺诈识别报告', operator: '系统', time: '2026-07-21 15:00:22', remark: '欺诈评分 88 分，命中 5 条规则' },
      { type: '黑名单命中', content: '手机号命中反欺诈黑名单库', operator: '系统', time: '2026-07-21 14:59:10', result: '命中', remark: '来源：跨行业联防联控库' },
      { type: '团伙关联检测', content: '关联已知欺诈团伙"团伙A"', operator: '系统', time: '2026-07-21 14:58:30', result: '命中', remark: '关联度评分 92' },
      { type: '设备风险检测', content: '设备存在 Root/越狱', operator: '系统', time: '2026-07-21 14:57:45', result: '命中', remark: '设备指纹：DV-9F2A-77C1' },
      { type: '设备群控检测', content: '近 7 日关联 3 个以上不同身份', operator: '系统', time: '2026-07-21 14:57:20', result: '命中', remark: '关联身份：李某、张某、王某' },
      { type: '行为轨迹检测', content: '表单填写速度异常', operator: '系统', time: '2026-07-21 14:56:50', result: '命中', remark: '平均 2.3 秒/字段' },
      { type: '申请提交', content: '用户提交申请', operator: '系统', time: '2026-07-21 14:55:00', remark: '申请额度 ¥30,000' },
    ],
    workStatus: '待确认',
    operator: '--',
    gangTag: '团伙A',
    product: '信用贷',
    amount: 30000,
    ruleTypes: ['身份欺诈', '信息伪造'],
    basic: [
      { key: 'name', label: '姓名', value: '王强', valid: true },
      { key: 'idNo', label: '身份证号', value: '110101********0314', valid: true },
      { key: 'phone', label: '手机号', value: '138****1234', valid: true },
      { key: 'age', label: '年龄', value: '34', valid: true },
      { key: 'gender', label: '性别', value: '男', valid: true },
      { key: 'edu', label: '学历', value: '本科', valid: true },
      { key: 'employer', label: '工作单位', value: '北京某某科技有限公司', valid: true },
      { key: 'city', label: '居住城市', value: '北京市', valid: true },
    ],
    threads: buildFraudS4Threads('reject'),
  }
}

/* ───────────────────── 三态报告构建 ───────────────────── */
export function buildFraudScheme4Report(id?: string): FraudS4Report {
  const status: 'pass' | 'reject' | 'warning' = id
    ? id.includes('FRAUD')
      ? 'reject'
      : id.includes('SUSPECT') || id.includes('WARNING')
        ? 'warning'
        : 'pass'
    : 'reject' // 默认展示文档主样例（王强 / 极高风险 / 88 分 / 拒绝 / 待复核 / 团伙A）

  if (status === 'reject') return baseReport()

  if (status === 'warning') {
    const w = clone(baseReport())
    w.appId = id?.includes('SUSPECT') ? 'FA-20260618-004' : 'FA-20260618-004'
    w.name = '赵*敏'
    w.fraudScore = 52
    w.scoreBand = '中'
    w.hitRuleCount = 4
    w.autoDecision = '预警'
    w.fraudTags = ['设备群控', '团伙欺诈']
    w.scoreTrend = [30, 33, 38, 40, 44, 48, 50, 51, 52, 52]
    w.factors = w.factors.map((f) => {
      const s = Math.round(f.score * 0.55)
      const level: FraudS4Level = s >= 80 ? '极高' : s >= 60 ? '高' : s >= 40 ? '中' : '低'
      return { ...f, score: s, level }
    })
    w.rules = buildRules(WARNING_HIT)
    w.device.riskTags = ['Root设备']
    w.device.root = '已 Root（疑似云手机）'
    w.device.relatedIdentities = 2
    w.behavior.gps = 'GPS 定位正常（偏差 < 2km）'
    w.graph = { ...w.graph, gangTag: '团伙B（疑似）', relevanceScore: 62, dimensions: ['共享设备'], nodeCount: 3, gangSize: 5, gangHistory: 1 }
    w.blacklistHit = { ...w.blacklistHit, level: '中', reason: '未命中核心黑名单，命中行业共享灰名单' }
    w.blacklistRecords = [w.blacklistRecords[0]]
    w.disposition = {
      suggestion: '建议转人工复核',
      reason: '设备群控 + 团伙关联，欺诈概率中等，需人工确认',
      evidence: ['设备疑似云手机', '关联团伙B（疑似）'],
    }
    w.workStatus = '待审核'
    w.opLogs = [
      { type: '欺诈报告生成', content: '系统自动生成欺诈识别报告', operator: '系统', time: '2026-07-21 13:20:10', remark: '欺诈评分 52 分，命中 2 条规则' },
      { type: '设备群控检测', content: '设备疑似云手机、关联 2 个身份', operator: '系统', time: '2026-07-21 13:19:30', result: '命中', remark: '关联身份：周某、吴某' },
      { type: '团伙关联检测', content: '关联疑似团伙"团伙B"', operator: '系统', time: '2026-07-21 13:18:50', result: '命中', remark: '关联度评分 62' },
      { type: '申请提交', content: '用户提交申请', operator: '系统', time: '2026-07-21 13:15:00', remark: '申请额度 ¥50,000' },
    ]
    w.workStatus = '待审核'
    w.operator = '--'
    w.gangTag = '团伙B（疑似）'
    w.ruleTypes = ['身份欺诈', '信息伪造']
    w.basic = w.basic.map((f) => (f.key === 'name' ? { ...f, value: w.name } : f))
    w.threads = buildFraudS4Threads('warning')
    return w
  }

  // pass（低风险 / 通过）
  const p = clone(baseReport())
  p.name = '张*伟'
  p.fraudScore = 8
  p.scoreBand = '低'
  p.hitRuleCount = 0
  p.autoDecision = '通过'
  p.fraudTags = []
  p.scoreTrend = [10, 9, 12, 8, 11, 9, 10, 8, 9, 8]
  p.factors = p.factors.map((f) => ({ ...f, score: 4, level: '低' as FraudS4Level }))
  p.rules = buildRules(PASS_HIT)
  p.device = {
    ...p.device,
    root: '未 Root / 未越狱',
    vpn: '未检测到 VPN',
    relatedIdentities: 1,
    relatedApplications: 1,
    riskTags: [],
  }
  p.behavior = { ...p.behavior, anomalies: [], deviation: '偏离度 6%（正常）', gps: 'GPS 定位正常（偏差 < 1km）', timeline: p.behavior.timeline.map((t) => ({ ...t, flag: '—' })) }
  p.graph = { ...p.graph, gangTag: '未关联团伙', relevanceScore: 0, dimensions: [], nodeCount: 0, gangSize: 0, gangHistory: 0, associations: [] }
  p.blacklistHit = { ...p.blacklistHit, level: '低', reason: '未命中任何黑名单', field: '—', source: '—', time: '—' }
  p.blacklistRecords = []
  p.disposition = {
    suggestion: '建议通过，进入信息核验 / 信用评估环节',
    reason: '未命中任何欺诈规则，欺诈评分极低',
    evidence: ['无规则命中', '设备环境干净', '未关联团伙'],
  }
  p.workStatus = '已确认'
  p.opLogs = [
    { type: '欺诈报告生成', content: '系统自动生成欺诈识别报告', operator: '系统', time: '2026-07-21 10:02:00', remark: '欺诈评分 8 分，未命中规则' },
    { type: '申请提交', content: '用户提交申请', operator: '系统', time: '2026-07-21 10:00:00', remark: '申请额度 ¥80,000' },
  ]
  p.workStatus = '已确认'
  p.operator = '--'
  p.gangTag = '未关联团伙'
  p.ruleTypes = []
  p.basic = p.basic.map((f) => (f.key === 'name' ? { ...f, value: p.name } : f))
  p.threads = buildFraudS4Threads('pass')
  return p
}

/* 等级 → 配色（与文档四档一致：极低/低 绿 · 中 黄 · 高 橙 · 极高 红） */
export const S4_BAND_KIND: Record<FraudS4ScoreBand, 'green' | 'amber' | 'orange' | 'red'> = {
  极低: 'green', 低: 'green', 中: 'amber', 高: 'orange', 极高: 'red',
}
export const S4_LEVEL_KIND: Record<FraudS4Level, 'green' | 'amber' | 'orange' | 'red'> = {
  低: 'green', 中: 'amber', 高: 'orange', 极高: 'red',
}
export const S4_AUTO_KIND: Record<FraudS4AutoDecision, 'green' | 'red' | 'amber' | 'gray'> = {
  通过: 'green', 拒绝: 'red', 预警: 'amber', 处理中: 'gray',
}
export const S4_WORK_KIND: Record<FraudS4WorkStatus, 'red' | 'amber' | 'green' | 'blue' | 'gray'> = {
  核验计算中: 'gray', 待确认: 'amber', 已确认: 'green',
  初审拒贷: 'gray', 强制放行: 'gray', 加入黑名单: 'red',
  待审核: 'amber', 提交复核: 'blue', '复核通过': 'green', '复核拒绝 - 拒绝办结': 'gray',
}
