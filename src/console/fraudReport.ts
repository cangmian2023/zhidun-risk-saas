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

// 基于 JSON 构建默认报告（FR20260721001 全通过样例）
export function buildFraudReport(): FraudReport {
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
