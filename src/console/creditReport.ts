// 信用风控报告 - 数据层
// 直接引用 doc/信用风控报告-示例数据.json（8 份覆盖各信用状态的样例报告）
import rawJson from '../../doc/信用风控报告-示例数据.json'

export interface CreditApplicant {
  name: string
  id_no: string
  phone: string
  product: string
  amount: string
  term: string
}

export interface CreditReport {
  report_id: string
  apply_no: string
  applicant: CreditApplicant
  status: string
  raw_inputs: {
    base: Record<string, string>
    internal: Record<string, string>
    external_request: Record<string, string>
  }
  structured: {
    多头指标: Record<string, string | number>
    负债: Record<string, string | number>
    失信: Record<string, string>
    关联: Record<string, string | number>
  }
  single_results: {
    source: string
    status: string
    fields: Record<string, string>
    receipt_code: string
    cost_ms: number
    risk_tags: string[]
  }[]
  credit_process: {
    parallel_threads: {
      thread: string
      source: string
      send: string
      recv: string
      cost_ms: number
      code: string
    }[]
    aggregate_ms: number
  }
  credit_conclusion: {
    cross_fusion: {
      severity: string
      desc: string
      sources: string
    }[]
    credit_score: number
    risk_level: string
    risk_tags: string[]
    decision: string
    decision_detail: string
  }
  item_actions: {
    item: string
    action: string
    operator: string
    time: string
    result: string
    note: string
  }[]
  report_actions: {
    action: string
    operator: string
    time: string
    note: string
  }[]
  audit_trail: {
    time: string
    operator: string
    action: string
    from: string
    to: string
  }[]
}

interface RawJson {
  meta: Record<string, unknown>
  reports: CreditReport[]
}

const data = rawJson as unknown as RawJson

export const creditReports: CreditReport[] = data.reports

export function getCreditReport(applyNo?: string | null): CreditReport {
  return creditReports.find((r) => r.apply_no === applyNo) ?? creditReports[0]
}

// 列表行（对应功能设计 4.1 的列）
export interface CreditRow {
  apply_no: string
  name: string
  platforms: number | string
  agencies: number
  debt_ratio: string
  decision: string
  status: string
}

export const creditRows: CreditRow[] = creditReports.map((r) => ({
  apply_no: r.apply_no,
  name: r.applicant.name,
  platforms: r.structured['多头指标']['近30天申贷平台数'] ?? '-',
  agencies: r.single_results.length,
  debt_ratio: String(r.structured['负债']['负债收入比'] ?? '-'),
  decision: r.credit_conclusion.decision,
  status: r.status,
}))

// 结论/状态 -> 徽标配色
export function conclKind(text: string): 'green' | 'red' | 'amber' | 'blue' | 'gray' {
  if (text.includes('拒绝')) return 'red'
  if (text.includes('通过')) return 'green'
  if (text.includes('降额')) return 'amber'
  if (text.includes('退回')) return 'blue'
  if (text.includes('审核') || text.includes('人工')) return 'blue'
  return 'gray'
}

// 单项状态 -> 徽标配色
export function singleKind(status: string): 'green' | 'red' | 'amber' | 'blue' {
  if (status === '通过') return 'green'
  if (status === '失败') return 'red'
  if (status === '存疑') return 'amber'
  return 'blue'
}

// 风险等级 -> 徽标配色
export function riskKind(level: string): 'green' | 'red' | 'amber' | 'blue' {
  if (level.includes('高')) return 'red'
  if (level.includes('中')) return 'amber'
  if (level.includes('低')) return 'green'
  return 'blue'
}

// 交叉比对严重度 -> 徽标配色
export function severityKind(sev: string): 'green' | 'red' | 'amber' | 'blue' {
  if (sev === '红') return 'red'
  if (sev === '黄') return 'amber'
  if (sev === '蓝') return 'blue'
  return 'gray'
}
