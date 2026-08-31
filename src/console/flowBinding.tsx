/* ============================================================================
 * 统一流程绑定层（全子系统唯一入口 · 页面关联版）
 * ----------------------------------------------------------------------------
 * 目标：管理中心「业务流程配置」里关联了页面之后，**所有**关联页面的列表与详情
 *      都自动显示同一套东西（流程状态列 / 详情流程操作条）。
 *      以后改这里一处，四个贷前页面 + 预警工作台 + 后续新页面全部同步生效。
 *
 * 三个统一出口：
 *   1) useFlowBinding(pageRoute)        —— 页面路由 → 该页关联的业务流程（配置作者维护）
 *   2) flowColumns({...})               —— 列表页统一列（流程状态，含操作按钮）
 *   3) <FlowBar />                      —— 详情页统一流程操作条（复用 FlowActionBar）
 *
 * 设计要点：
 *   - 流程从 flowStore（bizFlows.json）按 pageRoute / pageRoutes 匹配，不再各页自己 resolve；
 *   - 具体流程（flowGraph）按「对象字段」匹配（需求16），字段映射由各页传 matchFields 决定；
 *   - 每条数据的流程状态独立存在自己的样例 JSON（flowState / flowStateAt），per-object；
 *   - 匹配不到流程 → 统一显示「—」（方案B），不报错、不显示假按钮。
 *
 * 数据来源边界：流程定义=🔵Cfg（配置作者）｜每行 flowState=🟠Sam（使用域作者）。
 * ========================================================================== */
import { type ReactNode } from 'react'
import {
  useFlows, getFlowsByPage, DEFAULT_FLOW_STEPS, type FlowItem, type FlowStep,
} from './flowStore'
import { SingleSelect } from '../components/ui'
import FlowStateCell from './FlowStateCell'
import FlowActionBar from './FlowActionBar'

/* ---------------------------------------------------------------------------
 * 1. 页面 → 流程绑定
 * ------------------------------------------------------------------------- */

/** 该页面关联的业务流程列表（管理中心配置 pageRoutes 命中）。响应配置变更自动刷新。
 *  支持传多个路由（如列表页 + 详情页）：详情页通常复用「列表页关联的流程」，
 *  这样配置者只需在管理中心勾选一次页面，列表与详情就同时生效。 */
export function useFlowBinding(pageRoute: string | string[]): FlowItem[] {
  useFlows() // 订阅：配置改动后页面自动重渲染
  const routes = Array.isArray(pageRoute) ? pageRoute : [pageRoute]
  const out: FlowItem[] = []
  for (const r of routes) {
    for (const f of getFlowsByPage(r)) if (!out.some((x) => x.id === f.id)) out.push(f)
  }
  return out
}

/** 该页面的**主流程**（一个页面通常只关联一条业务流程配置）。 */
export function usePageFlow(pageRoute: string | string[]): FlowItem | undefined {
  return useFlowBinding(pageRoute)[0]
}

/** 每行的 flowId：行自带 flowKey 优先（多流程页面），否则回落页面主流程。 */
export function flowIdOfRow(row: Record<string, unknown>, pageFlow?: FlowItem): string {
  const own = String(row.flowKey ?? '')
  return own || pageFlow?.id || ''
}

/** 从行数据里抽出「用于匹配具体流程」的字段值（需求16）。
 *  matchFields: 具体流程 match 条件里用到的字段名 → 行上的取值键（同名可只写一个）。 */
export function matchObjOf(row: Record<string, unknown>, matchFields?: Record<string, string> | string[]): Record<string, unknown> {
  if (!matchFields) return {}
  const pairs = Array.isArray(matchFields)
    ? matchFields.map((k) => [k, k] as const)
    : Object.entries(matchFields)
  const o: Record<string, unknown> = {}
  for (const [field, rowKey] of pairs) o[field] = row[rowKey] ?? ''
  return o
}

/* ---------------------------------------------------------------------------
 * 2. 列表页统一列（流程状态）
 * ------------------------------------------------------------------------- */

/** 通用列定义（结构与 components/ui 的 Column 兼容，避免本文件反向依赖 ui 类型） */
export interface FlowColumnDef {
  key: string
  label: string
  width?: string
  fixed?: 'right'
  tag?: { kind: string; value: string }
  render: (row: any) => ReactNode
}

export interface FlowColumnsOpts {
  /** 当前页面路由（管理中心「关联业务页面」里配置的那个路由） */
  pageRoute: string
  /** 页面关联的主流程（由 usePageFlow 传入，避免每格重复查找） */
  pageFlow?: FlowItem
  /** 具体流程匹配字段：{ 流程里的字段名: 行数据的键名 }，或同名字段数组 */
  matchFields?: Record<string, string> | string[]
  /** 状态流转回调：把新状态写回该行所属的样例 JSON（per-object 持久化） */
  onStateChange: (row: any, next: string, at: string) => void
  /** 样例 JSON 文件名（用于流程状态列的数据来源标签） */
  sampleFile?: string
}

/** 现在时间戳（与既有样例 JSON 的 flowStateAt 格式一致：YYYY-MM-DD HH:mm:ss） */
export const nowStamp = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

/**
 * 列表页统一流程列。所有关联页面都调用这一个函数，列名/顺序/样式/交互完全一致。
 * 用法：`const cols = [...业务列, ...flowColumns({ pageRoute, pageFlow, matchFields, onStateChange })]`
 */
export function flowColumns(opts: FlowColumnsOpts): FlowColumnDef[] {
  const { pageFlow, matchFields, onStateChange, sampleFile } = opts
  const cols: FlowColumnDef[] = []

  // 配置驱动：页面未关联业务流程（管理中心未配）→ 不输出任何流程列，列表自然不显示
  if (!pageFlow) return cols

  cols.push({
    key: '__flowState',
    label: '流程状态',
    fixed: 'right',
    width: '170px',
    ...(sampleFile ? {  } : {}),
    render: (r: any) => (
      <FlowStateCell
        flowId={flowIdOfRow(r, pageFlow)}
        state={String(r.flowState ?? '')}
        matchObj={matchObjOf(r, matchFields)}
        onChange={(next) => onStateChange(r, next, nowStamp())}
      />
    ),
  })

  return cols
}

/**
 * 列表页「流程状态」筛选：仅当页面关联了业务流程时显示（未关联自动隐藏，与流程列同进退）。
 * 选项来自流程定义（自定义 flowSteps / 各流程图的 flowSteps / 默认状态机），按配置顺序去重。
 * 用法：`<FlowStateFilter pageRoute={route} value={fs} onChange={setFs} />`，页面再按 `row.flowState === fs` 过滤。
 */
export function FlowStateFilter({ pageRoute, value, onChange, label = '全部流程状态' }: {
  pageRoute: string | string[]
  value: string
  onChange: (v: string) => void
  label?: string
}) {
  const pageFlow = usePageFlow(pageRoute)
  if (!pageFlow) return null
  const states: string[] = []
  const push = (s?: string) => { if (s && !states.includes(s)) states.push(s) }
  ;(pageFlow.flowSteps ?? []).forEach((s) => push(s.state))
  ;(pageFlow.flowGraphs ?? []).forEach((g) => (g.flowSteps ?? []).forEach((s) => push(s.state)))
  if (!states.length) (DEFAULT_FLOW_STEPS as FlowStep[]).forEach((s) => push(s.state))
  if (!states.length) return null
  return (
    <SingleSelect label={label} clearable value={value} onChange={onChange}
      options={[{ value: '', label }, ...states.map((s) => ({ value: s, label: s }))]} />
  )
}

/* ---------------------------------------------------------------------------
 * 3. 详情页统一流程操作条
 * ------------------------------------------------------------------------- */

/**
 * 详情页统一流程操作条：流程名 + 状态 pill + 当前可执行按钮 + 节点时限。
 * 所有关联页面详情都用这一个组件，样式与预警处置详情完全一致。
 */
export function FlowBar({ pageRoute, row, matchFields, onStateChange, onSave, saveLabel }: {
  pageRoute: string | string[]
  row?: Record<string, unknown>
  matchFields?: Record<string, string> | string[]
  onStateChange?: (next: string, at: string) => void
  onSave?: () => void
  saveLabel?: string
}) {
  const pageFlow = usePageFlow(pageRoute)
  const flowId = flowIdOfRow(row ?? {}, pageFlow)
  return (
    <FlowActionBar
      flowId={flowId}
      state={String(row?.flowState ?? '')}
      matchObj={matchObjOf(row ?? {}, matchFields)}
      onStateChange={onStateChange ? (next) => onStateChange(next, nowStamp()) : undefined}
      onSave={onSave}
      saveLabel={saveLabel}
    />
  )
}
