/* ============================================================================
 * 业务流程库 store（方案A 公共化 · 页面关联版）
 * 独立于报告模板存储业务流程（bizFlows.json，本地持久化）：
 *   - 条目 = 一个业务流程（关联业务页面 + 可选分段 + flowGraphs 数组）
 *   - 报告模板通过 flowBlock.flowRefId 关联业务域（info_verify/credit/fraud/decision）
 *   - 运行时 resolveBizFlow 优先按页面路由匹配，其次 flowRefId（域），最后回退模板 businessFlow
 * ========================================================================== */
import { useSyncExternalStore } from 'react'
import type { BusinessFlowConfig, FlowGraph } from './reportTemplateData'

export interface FlowItem extends BusinessFlowConfig {
  id: string
  domain: string   // 业务域（info_verify / credit / fraud / decision / 自定义场景）
  name: string     // 业务流程名称（展示用，详情页标题行内可编辑）
  desc?: string    // 业务流程描述（详情页标题下可编辑，可选）
  pageName?: string  // 关联业务页面名称（兼容单页面，首项）
  pageRoute?: string // 关联页面路由（兼容单页面，首项）
  pageNames?: string[] // 关联业务页面名称（多选）
  pageRoutes?: string[] // 关联页面路由（多选，运行时据此把流程挂到页面操作列）
  flowState?: string // 当前审核状态（需求21：待初审/待复审/已上线/已下线，跟流程配置走）
  flowSteps?: FlowStep[] // 需求27：自定义状态机（state → action → next），缺省用 DEFAULT_FLOW_STEPS
}

/* ---------- 流程状态机（需求27：支持自定义 flowSteps，缺省上线审核状态机） ---------- */
export interface FlowStep {
  state: string
  action: string
  next?: string
  color?: string
  timeLimit?: number  // 需求14：节点时限倒计时（分钟，0/缺省 = 不限制）
}
export const DEFAULT_FLOW_STEPS: FlowStep[] = [
  { state: '待初审', action: '初审', next: '待复审' },
  { state: '待复审', action: '复审', next: '已上线' },
  { state: '已上线', action: '下线', next: '已下线' },
  { state: '已下线', action: '', next: '' },
]
export function stepColorOf(st: string): string {
  if (st.includes('待')) return '#D97706'
  if (st.includes('中')) return '#2563EB'
  if (st.includes('已')) return '#059669'
  return '#94A3B8'
}
/** 取流程当前状态与操作步（自定义 flowSteps 优先，缺省用上线审核状态机） */
export function flowStepOf(f: { flowSteps?: FlowStep[]; flowState?: string }) {
  const steps = f.flowSteps?.length ? f.flowSteps : DEFAULT_FLOW_STEPS
  const state = f.flowState ?? steps[0]?.state ?? ''
  const step = steps.find((s) => s.state === state)
  return { steps, state, step }
}

/** 需求30：把斜线分隔的状态机输入解析为 FlowStep[]。
 * 支持三种格式：
 *  - 三段式（需求14）：状态/动作/时限分钟/状态/动作/时限分钟…（如 待初审/初审/30/待复审/复审/120/已上线/下线/已上线；时限留空=不限制）
 *  - 交替（推荐）：状态/动作/状态/动作/状态…（如 待初审/初审/待复审/复审/已上线/下线/已下线）
 *  - 纯状态：状态1/状态2/状态3…（按钮动作自动取下一状态名，最后一步无按钮）
 * 颜色按状态名自动推导（待→橙 / 中→蓝 / 已→绿）。 */
export function parseFlowStepsInput(input: string): FlowStep[] {
  const toks = String(input ?? '')
    .split(/[/／,，、\s]+/)
    .map((t) => t.trim())
  const nonEmpty = toks.filter(Boolean)
  if (nonEmpty.length === 0) return DEFAULT_FLOW_STEPS
  if (nonEmpty.length === 1) return [{ state: nonEmpty[0], action: '', next: '', color: stepColorOf(nonEmpty[0]) }]
  // 三段式（状态/动作/时限分钟）：每 3 段一组，第 3 段为数字或空
  const isTriple = toks.length % 3 === 0 &&
    Array.from({ length: toks.length / 3 }, (_, k) => toks[k * 3 + 2] === '' || /^\d+$/.test(toks[k * 3 + 2])).every(Boolean)
  if (isTriple) {
    const steps: FlowStep[] = []
    for (let i = 0; i < toks.length; i += 3) {
      const tl = toks[i + 2]
      steps.push({
        state: toks[i],
        action: toks[i + 1] ?? '',
        next: toks[i + 3] ?? '',
        color: stepColorOf(toks[i]),
        timeLimit: tl && /^\d+$/.test(tl) ? Number(tl) : undefined,
      })
    }
    return steps
  }
  if (nonEmpty.length % 2 === 1) {
    // 交替：状态/动作/状态/动作/状态
    const steps: FlowStep[] = []
    for (let i = 0; i < nonEmpty.length; i += 2) {
      steps.push({ state: nonEmpty[i], action: nonEmpty[i + 1] ?? '', next: nonEmpty[i + 2] ?? '', color: stepColorOf(nonEmpty[i]) })
    }
    return steps
  }
  // 纯状态：动作 = 下一状态名
  return nonEmpty.map((st, i) => ({ state: st, action: nonEmpty[i + 1] ?? '', next: nonEmpty[i + 1] ?? '', color: stepColorOf(st) }))
}

const newId = (p: string) => `${p}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

/* ---------- 本地文件持久化（vite 插件 /api/load-bizflows /api/save-bizflows） ---------- */
let flows: FlowItem[] = []
let version = 0
let saveTimer: ReturnType<typeof setTimeout> | null = null

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer)
  saveTimer = setTimeout(() => {
    fetch('/api/save-bizflows', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flows }),
    }).then((r) => { if (!r.ok) console.error('[flowStore] 保存失败:', r.status) })
      .catch((e) => console.error('[flowStore] 保存异常:', e))
  }, 300)
}

// 启动时加载已保存的文件
try {
  const saved = await fetch('/api/load-bizflows').then((r) => (r.ok ? r.json() : null)).catch(() => null)
  if (saved && Array.isArray(saved.flows)) flows = saved.flows
} catch { /* 首次启动无文件时用代码默认 */ }

/* ---------- 订阅 ---------- */
const listeners = new Set<() => void>()
function emit() { version++; listeners.forEach((fn) => fn()) }
function subscribe(fn: () => void) { listeners.add(fn); return () => { listeners.delete(fn) } }
function getSnapshot() { return version }
export function useFlowsVersion() { return useSyncExternalStore(subscribe, getSnapshot) }

export function useFlows(): FlowItem[] {
  useFlowsVersion()
  return flows
}

export function getFlowsByDomain(domain: string): FlowItem[] {
  return flows.filter((f) => f.domain === domain)
}

export function getFlowsByPage(pageRoute: string): FlowItem[] {
  return flows.filter((f) => f.pageRoute === pageRoute || f.pageRoutes?.includes(pageRoute))
}

export function getFlowById(id: string): FlowItem | undefined {
  return flows.find((f) => f.id === id)
}

/* ---------- 变更（写回本地 JSON） ---------- */
export function addFlowItem(item: Partial<FlowItem> & { domain: string }): FlowItem {
  const it: FlowItem = {
    id: newId('f'), name: item.name ?? '业务流程', suggestionText: '', passNeedConfirm: true, passConfirmRole: '初审员',
    rejectAllowRecheck: true, recheckSubmitRole: '复审员', recheckApproveRole: '风控主管', manualSuggestRole: '初审员',
    manualApproveRole: '风控主管', flowGraphs: [],
    ...item,
  }
  flows = [...flows, it]
  emit(); scheduleSave()
  return it
}

export function updateFlowItem(id: string, fn: (f: FlowItem) => FlowItem) {
  flows = flows.map((f) => (f.id === id ? fn(f) : f))
  emit(); scheduleSave()
}

export function removeFlowItem(id: string) {
  flows = flows.filter((f) => f.id !== id)
  emit(); scheduleSave()
}

export function patchFlowItem(id: string, p: Partial<FlowItem>) {
  updateFlowItem(id, (f) => ({ ...f, ...p }))
}

export function patchFlowItemGraphs(id: string, graphs: FlowGraph[]) {
  updateFlowItem(id, (f) => ({ ...f, flowGraphs: graphs }))
}

/** 需求21：流程审核状态流转（待初审→待复审→已上线→已下线），状态跟流程配置一起存 bizFlows.json */
export function advanceFlowState(id: string, next: string) {
  updateFlowItem(id, (f) => ({ ...f, flowState: next }))
}

/* ---------- 模板/页面 → 流程 解析（运行时注入，消费函数零改动） ----------
 * 优先按页面路由匹配（业务流程条目 pageRoute 命中，按 gradeId 过滤由调用方做）；
 * 其次按模板 flowBlock.flowRefId（业务域）匹配；最后回退模板内 businessFlow。 */
export function resolveBizFlow(tpl: { flowBlock?: { flowRefId?: string }; businessFlow?: BusinessFlowConfig[] } | undefined, pageRoutes?: string[]): BusinessFlowConfig[] | undefined {
  if (pageRoutes?.length) {
    const byPage = flows.filter((f) =>
      (f.pageRoute && pageRoutes.includes(f.pageRoute)) || f.pageRoutes?.some((r) => pageRoutes.includes(r)),
    )
    if (byPage.length) return byPage as BusinessFlowConfig[]
  }
  if (!tpl) return undefined
  const refId = tpl.flowBlock?.flowRefId
  if (refId) {
    const fromLib = flows.filter((f) => f.domain === refId)
    if (fromLib.length) return fromLib as BusinessFlowConfig[]
  }
  return tpl.businessFlow
}

/** 运行时使用的模板（已注入流程库）：详情/列表页把此对象传给 getAuditFlowByGrade 等，函数签名不变。
 * pageRoutes = 当前页面路由（列表页可传 [listRoute, detailRoute]，详情页传 [detailRoute]） */
export function withResolvedFlows(tpl: { flowBlock?: { flowRefId?: string }; businessFlow?: BusinessFlowConfig[] } | undefined, pageRoutes?: string[]): any {
  if (!tpl) return tpl
  return { ...tpl, businessFlow: resolveBizFlow(tpl, pageRoutes) }
}
