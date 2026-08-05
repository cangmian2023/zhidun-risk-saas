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
  name: string     // 业务流程名称（展示用）
  pageName?: string  // 关联业务页面名称（如「信息核验·详情页」）
  pageRoute?: string // 关联页面路由/地址（运行时据此把流程挂到页面操作列）
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
  return flows.filter((f) => f.pageRoute === pageRoute)
}

export function getFlowById(id: string): FlowItem | undefined {
  return flows.find((f) => f.id === id)
}

/* ---------- 变更（写回本地 JSON） ---------- */
export function addFlowItem(item: Partial<FlowItem> & { domain: string; gradeId: string }): FlowItem {
  const it: FlowItem = {
    id: newId('f'), name: `${item.gradeId}档`, suggestionText: '', passNeedConfirm: true, passConfirmRole: '初审员',
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

/* ---------- 模板/页面 → 流程 解析（运行时注入，消费函数零改动） ----------
 * 优先按页面路由匹配（业务流程条目 pageRoute 命中，按 gradeId 过滤由调用方做）；
 * 其次按模板 flowBlock.flowRefId（业务域）匹配；最后回退模板内 businessFlow。 */
export function resolveBizFlow(tpl: { flowBlock?: { flowRefId?: string }; businessFlow?: BusinessFlowConfig[] } | undefined, pageRoutes?: string[]): BusinessFlowConfig[] | undefined {
  if (pageRoutes?.length) {
    const byPage = flows.filter((f) => f.pageRoute && pageRoutes.includes(f.pageRoute))
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
