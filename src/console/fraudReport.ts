// 欺诈识别报告 - 数据模型与示例数据
// 依据 doc/欺诈识别报告功能设计.md 与 doc/欺诈识别报告-示例数据.json 构建

export type FraudConclusionStatus = '通过' | '存疑' | '命中'
export type FraudDecision = '自动通过' | '人工复核' | '直接拒绝' | '退回补件' | '人工放行'
export type FraudStatus = '待审核' | '审核中' | '已通过' | '已拒绝' | '已退回' | '已归档'
export type FraudRiskLevel = '低风险' | '中风险' | '高风险'

export interface Applicant {
  name: string
  id_no: string
  phone: string
  product: string
  amount: string
  term: string
}

export interface RawInputs {
  base: Record<string, string>
  device_env: Record<string, string>
  internal: Record<string, string>
  external_request: Record<string, string>
}

export interface StructuredFraud {
  structured: Record<string, Record<string, string | number>>
}

export interface SingleFraudResult {
  source: string
  status: FraudConclusionStatus
  fields: Record<string, string | number | string[]>
  receipt_code: string
  cost_ms: number
  risk_tags: string[]
}

export interface FraudThread {
  thread: string
  source: string
  send: string
  recv: string
  cost_ms: number
  code: string
  circuit_break?: boolean
}

export interface FraudProcess {
  parallel_threads: FraudThread[]
  aggregate_ms: number
  circuit_break: string[]
}

export interface CrossFusion {
  severity: '黄' | '红'
  desc: string
  sources: string
}

export interface FraudConclusion {
  cross_fusion: CrossFusion[]
  fraud_score: number
  risk_level: FraudRiskLevel
  risk_tags: string[]
  decision: FraudDecision
  decision_detail: string
}

export interface FraudItemAction {
  item: string
  action: string
  operator: string
  time: string
  result: string
  note: string
}

export interface FraudReportAction {
  action: string
  operator: string
  time: string
  note: string
}

export interface FraudAuditTrail {
  time: string
  operator: string
  action: string
  from: string
  to: string
}

export interface FraudReport {
  report_id: string
  apply_no: string
  applicant: Applicant
  status: FraudStatus
  raw_inputs: RawInputs
  structured: Record<string, Record<string, string | number>>
  single_results: SingleFraudResult[]
  fraud_process: FraudProcess
  fraud_conclusion: FraudConclusion
  item_actions: FraudItemAction[]
  report_actions: FraudReportAction[]
  audit_trail: FraudAuditTrail[]
}

// 三种状态样例元数据（供报告页切换演示 / 列表按 id 取数）
export const FRAUD_SAMPLES = [
  { id: 'FR20260721001', label: '自动通过' },
  { id: 'FR20260721002', label: '人工复核' },
  { id: 'FR20260721003', label: '直接拒绝' },
]

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v))

// 基于描述构建默认报告（FR20260721001 全通过样例）
export function buildBaseFraudReport(): FraudReport {
  return {
    report_id: 'FR20260721001',
    apply_no: 'J20260721F0001',
    applicant: {
      name: '陈**', id_no: '310***********1523', phone: '138****1234',
      product: '消费分期', amount: '50,000', term: '12期',
    },
    status: '已通过',
    raw_inputs: {
      base: {
        '姓名': '陈一', '身份证号': '310101199203151523', '手机号': '13800001234',
        '申请金额': '50000', '期限': '12期', '年龄': '33', '月收入': '18000',
        '工作单位': '上海某某科技有限公司',
      },
      device_env: {
        '设备指纹ID': 'DEV-9F2A', '设备型号': 'iPhone14,2',
        '是否模拟器': '否', '是否多开': '否', '是否Root': '否',
        'IP类型': '真实(上海)', 'GPS': '上海', '传感器': '正常',
      },
      internal: {
        '本行欺诈黑名单': '否', '灰名单': '否',
        '历史设备库': '无命中', '历史申请': '首贷',
      },
      external_request: {
        '设备指纹库': '已比对', '同盾联防': '已调用',
        '规则引擎': '已触发', '材料OCR': '未上传材料(无)',
      },
    },
    structured: {
      '设备风险': {
        '模拟器': '否', '多开': '否', 'Root': '否', '群控': '否',
        '设备复用次数': 0, '设备风险分': 6, 'IP风险': '无',
      },
      '行为异常': {
        '近7天申贷平台数': 0, '近30天申贷平台数': 2,
        '异地/跨境': '否', '新号撸贷': '否',
      },
      '团伙关联': {
        '关联身份证': 0, '关联手机号': 0, '关联设备': 0,
        '团伙风险等级': '无', '中介特征': '无',
      },
      '材料真伪': {
        '流水PS': '否', '执照伪造': '否', '人证不符': '否',
      },
    },
    single_results: [
      { source: '设备风险引擎', status: '通过', fields: { '模拟器': '否', '多开': '否', '设备黑名单': '无命中', '设备复用': 0 }, receipt_code: 'DEV-0000', cost_ms: 300, risk_tags: [] },
      { source: '规则引擎', status: '通过', fields: { '命中规则数': 0, '触发规则': '无' }, receipt_code: 'RUL-0000', cost_ms: 50, risk_tags: [] },
      { source: 'ML欺诈评分', status: '通过', fields: { '智信分': 8, '欺诈概率': '低' }, receipt_code: 'ML-0000', cost_ms: 900, risk_tags: [] },
      { source: '图计算·团伙关联', status: '通过', fields: { '关联节点': 0, '团伙': '无' }, receipt_code: 'GRP-0000', cost_ms: 800, risk_tags: [] },
      { source: '材料真伪', status: '通过', fields: { 'OCR': '未上传', '篡改检测': '无材料' }, receipt_code: 'OCR-0000', cost_ms: 1100, risk_tags: [] },
    ],
    fraud_process: {
      parallel_threads: [
        { thread: 'T1', source: '设备风险引擎', send: '00:00.000', recv: '00:00.30', cost_ms: 300, code: 'DEV-0000' },
        { thread: 'T2', source: '规则引擎', send: '00:00.000', recv: '00:00.05', cost_ms: 50, code: 'RUL-0000' },
        { thread: 'T3', source: 'ML欺诈评分', send: '00:00.000', recv: '00:00.90', cost_ms: 900, code: 'ML-0000' },
        { thread: 'T4', source: '图计算·团伙关联', send: '00:00.000', recv: '00:00.80', cost_ms: 800, code: 'GRP-0000' },
        { thread: 'T5', source: '材料真伪', send: '00:00.000', recv: '00:01.10', cost_ms: 1100, code: 'OCR-0000' },
      ],
      aggregate_ms: 1100,
      circuit_break: [],
    },
    fraud_conclusion: {
      cross_fusion: [],
      fraud_score: 8,
      risk_level: '低风险',
      risk_tags: [],
      decision: '自动通过',
      decision_detail: '无设备异常/无团伙/无规则命中/智信分低 → 系统自动审批通过',
    },
    item_actions: [],
    report_actions: [
      { action: '自动通过', operator: '系统', time: '2026-07-21 09:01:12', note: '无风险自动放行, 进入授信定价' },
    ],
    audit_trail: [
      { time: '2026-07-21 09:01:12', operator: '系统', action: '生成欺诈识别报告', from: '-', to: '已通过' },
    ],
  }
}

// 按 id 构建对应状态报告（Q1/C1：支持 拒绝 / 复核 / 通过 三态路由）
export function buildFraudReport(id?: string): FraudReport {
  const base = buildBaseFraudReport()
  if (!id || id === 'FR20260721001') return base
  if (id === 'FR20260721002') return toReview(base)
  if (id === 'FR20260721003') return toReject(base)
  return base
}

// 人工复核态：欺诈分落入存疑区间，材料存在瑕疵，转人工复核
function toReview(base: FraudReport): FraudReport {
  const r = clone(base)
  r.report_id = 'FR20260721002'
  r.status = '审核中'
  r.fraud_conclusion = {
    cross_fusion: [
      { severity: '黄', desc: '材料一致性校验：活体抓拍与身份证 OCR 人脸相似度 0.86（阈值 0.90），存在细微差异', sources: '活体核验 ↔ 身份证OCR' },
    ],
    fraud_score: 58,
    risk_level: '中风险',
    risk_tags: ['中欺诈分', '材料存疑', '活体相似度偏低'],
    decision: '人工复核',
    decision_detail: '欺诈分 58 处于存疑区间（50~80），且材料存在 1 项瑕疵，转人工复核确认。',
  }
  if (r.single_results[4]) {
    r.single_results[4] = { ...r.single_results[4], status: '存疑' as const, risk_tags: ['活体相似度0.86'] }
  }
  r.item_actions = [
    { item: '材料真伪·活体抓拍', action: '标记存疑', operator: '审核员-周敏', time: '2026-07-21 11:20', result: '已转人工复核', note: '活体与证件人脸相似度不足' },
  ]
  r.report_actions = [
    { action: '人工复核', operator: '审核员-周敏', time: '2026-07-21 11:20', note: '命中存疑规则，转人工复核' },
  ]
  r.audit_trail = [
    { time: '2026-07-21 09:01:12', operator: '系统', action: '生成欺诈识别报告', from: '-', to: '审核中' },
    { time: '2026-07-21 11:20:05', operator: '审核员-周敏', action: '转人工复核', from: '审核中', to: '审核中' },
  ]
  return r
}

// 直接拒绝态：欺诈分超拒绝线，多源高危命中
function toReject(base: FraudReport): FraudReport {
  const r = clone(base)
  r.report_id = 'FR20260721003'
  r.status = '已拒绝'
  r.structured = {
    ...base.structured,
    '设备风险': { ...base.structured['设备风险'], '设备复用次数': 7, '设备风险分': 82, '群控': '是', 'Root': '是' },
    '团伙关联': { ...base.structured['团伙关联'], '关联设备': 12, '团伙风险等级': '高', '中介特征': '是' },
    '材料真伪': { ...base.structured['材料真伪'], '人证不符': '是', '流水PS': '是' },
  }
  r.single_results = r.single_results.map((s, i) => {
    if (i === 0) return { ...s, status: '命中' as const, risk_tags: ['设备群控', 'Root'] }
    if (i === 1) return { ...s, status: '命中' as const, fields: { '命中规则数': 4, '触发规则': 'R001,R017,R032,R118' }, risk_tags: ['多头', '中介'] }
    if (i === 2) return { ...s, fields: { '智信分': 88, '欺诈概率': '高' }, risk_tags: ['高欺诈分'] }
    if (i === 3) return { ...s, status: '命中' as const, fields: { '关联节点': 12, '团伙': '黑产团伙G-7' }, risk_tags: ['团伙'] }
    if (i === 4) return { ...s, status: '命中' as const, fields: { 'OCR': '已比对', '篡改检测': '人证不符' }, risk_tags: ['人证不符'] }
    return s
  })
  r.fraud_conclusion = {
    cross_fusion: [
      { severity: '红', desc: '设备指纹命中黑产设备库：同一设备 7 天内关联 12 笔申请，复用率异常', sources: '设备指纹库 ↔ 历史设备库' },
      { severity: '红', desc: '活体抓拍与身份证 OCR 人脸相似度 0.42，疑似冒用他人身份', sources: '活体核验 ↔ 身份证OCR' },
      { severity: '黄', desc: '图计算发现关联中介团伙 G-7，3 个关联手机号共用同一 WiFi', sources: '图计算 ↔ 同盾联防' },
    ],
    fraud_score: 88,
    risk_level: '高风险',
    risk_tags: ['高欺诈分', '设备群控', '疑似团伙', '材料伪造', '人证不符'],
    decision: '直接拒绝',
    decision_detail: '欺诈分 88 超拒绝线（≥80），命中设备群控/团伙/材料伪造多项高危规则，直接拒绝。',
  }
  r.item_actions = [
    { item: '设备风险·设备复用', action: '确认拒绝', operator: '审核员-李强', time: '2026-07-21 10:05', result: '确认欺诈', note: '设备关联黑产库' },
    { item: '材料真伪·活体抓拍', action: '确认拒绝', operator: '审核员-李强', time: '2026-07-21 10:06', result: '确认冒用', note: '人证相似度0.42' },
  ]
  r.report_actions = [
    { action: '直接拒绝', operator: '审核员-李强', time: '2026-07-21 10:08', note: '多源高危命中，直接拒绝' },
  ]
  r.audit_trail = [
    { time: '2026-07-21 09:01:12', operator: '系统', action: '生成欺诈识别报告', from: '-', to: '已拒绝' },
    { time: '2026-07-21 10:08:00', operator: '审核员-李强', action: '直接拒绝', from: '审核中', to: '已拒绝' },
  ]
  return r
}
