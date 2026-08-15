/* ============================================================================
 * 评分模型 · 决策图画板（算法编辑「可视化」tab）
 *
 * 只读画板（非编辑态）：把模型真实的【决策图】摆出来——
 *   - 多数据源并行、多个子分模型并行、多套规则集、规则碰撞冲突裁决、阈值分支、输出
 *   - 画板内顶部贴图工具条：缩放 / 平移 / 全屏 / 主线·支线高亮 / 适应 / 1:1 / 复位
 *   - 点击任意节点在【画板内右侧】弹出抽屉（不置灰、不遮挡画板操作，全屏可见）
 *   - 下方三张表：①分数段→处置（阈值决策映射）②审批结论与预警裁决 ③节点明细（说明/输入/输出）
 *
 * 纯前端、零依赖。
 * ========================================================================= */
import { useState, useRef, useEffect, useMemo } from 'react'
import type { ScoreProd, ModelMeta, ThresholdRow, CollisionRule, ScoreCardFactor } from './scoreData'
import { SCORE_PROD_LABEL, COLLISION_SEED, COLLISION_SIGNAL_FIELDS, COLLISION_OUTCOME_LABEL, collisionCondText, ZHIXIN_SCORECARD } from './scoreData'
import type { VFilter } from './CondBuilder'
import { CondBuilder } from './CondBuilder'
import { MODEL_DECISION_GRAPH, GNODE_META, NODE_W, NODE_H, type GNode, type GNodeType, type GGraph, type GEdge } from './modelGraphData'

/* 左侧工具条按「分层」分组，便于添加节点时按业务阶段筛选 */
const NODE_CATEGORY: { label: string; types: GNodeType[] }[] = [
  { label: '输入层', types: ['source', 'transform'] },
  { label: '计算层', types: ['model', 'graph', 'ruleset'] },
  { label: '决策层', types: ['collision', 'decision', 'block'] },
  { label: '输出层', types: ['output', 'alert'] },
]

/* 模型节点内渲染的「评分卡计分表」：直接读 model.bins（与 computeZhixin 同源）。 */
function ScoreCardView({ bins }: { bins: ScoreCardFactor[] }) {
  return (
    <div className="text-[11px] leading-tight">
      <div className="mb-1 font-semibold text-slate-700">基础分 600 + 各因子查表加分</div>
      {bins.map((f) => (
        <div key={f.key} className="mb-1">
          <div className="text-slate-600">{f.name}</div>
          <div className="text-slate-400">
            {f.bins.map((b) => (
              <span key={b.label} className="mr-2 inline-block">
                {b.label} <span className={b.points >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{b.points >= 0 ? '+' : ''}{b.points}</span>
              </span>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-1 border-t border-slate-100 pt-1 text-slate-500">合计 = 600 + Σ加分，裁剪 [300,900]</div>
    </div>
  )
}

type Hi = 'all' | 'main' | 'branch'

/* 节点取值提示色：按风险语义着色，与得分预警色一致（不再一律绿色）。
   命中风险关键词→红；关注/临界→琥珀；正常/通过→绿；其余→中性灰。 */
const HINT_TONE: Record<'danger' | 'warn' | 'safe' | 'neutral', string> = {
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  warn: 'bg-amber-50 text-amber-700 border-amber-200',
  safe: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  neutral: 'bg-slate-50 text-slate-600 border-slate-200',
}
function hintTone(text?: string): string {
  const t = (text ?? '').replace(/\s/g, '')
  if (/拒绝|高危|高风险|危险|欺诈|逾期|不良|拦截|冻结|告警|红/.test(t)) return HINT_TONE.danger
  if (/关注|临界|降级|审慎|待观察|中风险|预警|黄/.test(t)) return HINT_TONE.warn
  if (/正常|通过|标准|低风|核准|绿/.test(t)) return HINT_TONE.safe
  return HINT_TONE.neutral
}

export default function ModelDecisionGraph({
  prod, model, thresholds, onJumpRules, onJumpStrategy, onSaveCollisions, graph: graphProp,
  nodeResults, currentScore, editable, onSaveGraph, mainOnly,
}: {
  prod: ScoreProd
  model: ModelMeta
  thresholds: ThresholdRow[]
  onJumpRules: () => void
  onJumpStrategy: () => void
  onSaveCollisions?: (rules: CollisionRule[]) => void
  graph?: GGraph
  /* 主线视图：仅展示 数据源 → 算法/因子 → 输出概率p+SHAP，隐藏规则集/碰撞/决策等支线节点，并自动桥接被跳过的主线连接 */
  mainOnly?: boolean
  /* 当前用户在该节点上的实际输出（key = 节点 id），用于「节点明细」表「结果」列 */
  nodeResults?: Record<string, string>
  /* 当前用户评分：用于「决策映射」表高亮所在分数段 */
  currentScore?: number
  /* 编辑态：显示左侧节点工具条（分类添加节点 + 连线）；默认仅在传入 onSaveCollisions 的配置态开启 */
  editable?: boolean
  /* 编辑后保存整张画布（节点/连线）；模型管理据此持久化 */
  onSaveGraph?: (g: GGraph) => void
}) {
  const graphBase = graphProp ?? MODEL_DECISION_GRAPH[prod]
  const [localGraph, setLocalGraph] = useState<GGraph | null>(null)
  const graph = localGraph ?? graphBase
  const isPipeline = !!graphProp

  /* ---- 主线视图：仅保留 数据源/特征变换/模型/图谱/输出 节点，桥接被支线（规则集/碰撞/决策等）隔断的主线连接 ---- */
  const MAIN_TYPES: GNodeType[] = ['source', 'transform', 'model', 'graph', 'output']
  const displayGraph = useMemo<GGraph>(() => {
    if (!mainOnly) return graph
    const mainIds = new Set(graph.nodes.filter((n) => MAIN_TYPES.includes(n.type)).map((n) => n.id))
    const mainNodes = graph.nodes.filter((n) => mainIds.has(n.id))
    const kept = graph.edges.filter((e) => mainIds.has(e.from) && mainIds.has(e.to))
    const keptKeys = new Set(kept.map((e) => `${e.from}->${e.to}`))
    const bridgeSeen = new Set<string>()
    const bridge: GEdge[] = []
    for (const a of mainIds) {
      const stack: string[] = [a]
      const seen = new Set<string>([a])
      while (stack.length) {
        const cur = stack.pop()!
        for (const e of graph.edges) {
          if (e.from !== cur) continue
          if (mainIds.has(e.to)) {
            if (e.to !== a) {
              const key = `${a}->${e.to}`
              if (!bridgeSeen.has(key)) { bridgeSeen.add(key); bridge.push({ from: a, to: e.to }) }
            }
          } else if (!seen.has(e.to)) {
            seen.add(e.to); stack.push(e.to)
          }
        }
      }
    }
    const extra = bridge.filter((e) => !keptKeys.has(`${e.from}->${e.to}`))
    return { ...graph, nodes: mainNodes, edges: [...kept, ...extra] }
  }, [graph, mainOnly])
  const isEditable = editable ?? !!onSaveCollisions
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [hi, setHi] = useState<Hi>('all')
  const [focus, setFocus] = useState<string | null>(null)
  const [selected, setSelected] = useState<GNode | null>(null)
  const [editingCollision, setEditingCollision] = useState(false)
  const [localRules, setLocalRules] = useState<CollisionRule[]>([])
  const [isFs, setIsFs] = useState(false)
  const [openNodes, setOpenNodes] = useState<Set<string>>(new Set())
  /* 节点拖拽：位置覆盖（原始坐标），未拖动则回退到 graph 里的 x/y */
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({})
  const dragRef = useRef<{ id: string; sx: number; sy: number; px: number; py: number; moved: boolean } | null>(null)
  const [dragging, setDragging] = useState(false)
  /* ---- 编辑态：左侧工具条（添加节点 + 连线） ---- */
  const [editMode, setEditMode] = useState(false)
  const [linkMode, setLinkMode] = useState(false)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const [nodeFilter, setNodeFilter] = useState('')
  const dirty = !!localGraph || Object.keys(pos).length > 0

  const nodeMap = new Map<string, GNode>(displayGraph.nodes.map((n) => [n.id, n]))
  const ppos = (n: GNode) => pos[n.id] ?? { x: n.x, y: n.y }
  const anchorR = (n: GNode) => ({ x: ppos(n).x + NODE_W, y: ppos(n).y + NODE_H / 2 })
  const anchorL = (n: GNode) => ({ x: ppos(n).x, y: ppos(n).y + NODE_H / 2 })
  const isAlertEdge = (e: { from: string; to: string }) =>
    nodeMap.get(e.from)?.type === 'alert' || nodeMap.get(e.to)?.type === 'alert'

  const effectiveRules = model.collisionRules?.length ? model.collisionRules : COLLISION_SEED[prod]
  const metaOf = (n: GNode): string[] => {
    if (n.type === 'collision' && effectiveRules.length) {
      return effectiveRules.map((r) => `${r.enabled ? '' : '【停用】'}${collisionCondText(r.cond)} → ${r.result}`)
    }
    return n.meta ?? []
  }

  /* ---- 工具条动作 ---- */
  const zoom = (d: number) => setScale((s) => +Math.min(2, Math.max(0.4, +(s + d).toFixed(2))))
  const pan = (dx: number, dy: number) => { setTx((x) => x + dx); setTy((y) => y + dy) }
  const resetView = () => { setScale(1); setTx(0); setTy(0) }
  const fit = () => {
    const el = containerRef.current
    if (!el) return
    const s = Math.min(el.clientWidth / displayGraph.width, el.clientHeight / displayGraph.height)
    setScale(+Math.min(2, Math.max(0.4, s)).toFixed(2)); setTx(0); setTy(0)
  }
  useEffect(() => {
    const onCh = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onCh)
    return () => document.removeEventListener('fullscreenchange', onCh)
  }, [])
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else containerRef.current?.requestFullscreen?.()
  }
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(graph, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `decision-graph-${isPipeline ? 'pipeline' : prod}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  const print = () => window.print()

  /* ---- 编辑动作：添加节点 / 连线 / 删除 / 保存 ---- */
  /* 首次编辑时把静态图（或传入的定制图）克隆进 localGraph，避免改动模块级常量 */
  const ensureEditable = (): GGraph => {
    if (localGraph) return localGraph
    return {
      ...graphBase,
      nodes: graphBase.nodes.map((n) => ({ ...n })),
      edges: graphBase.edges.map((e) => ({ ...e })),
    }
  }
  const addNode = (type: GNodeType) => {
    const g = ensureEditable()
    const n = g.nodes.length
    const COLS = 4
    const x = 40 + (n % COLS) * (NODE_W + 28)
    const y = 40 + Math.floor(n / COLS) * (NODE_H + 28)
    const id = `${type}_${Date.now().toString(36)}`
    const newNode: GNode = { id, type, title: GNODE_META[type].label, x, y }
    setLocalGraph({
      ...g,
      nodes: [...g.nodes, newNode],
      width: Math.max(g.width, x + NODE_W + 40),
      height: Math.max(g.height, y + NODE_H + 40),
    })
  }
  const addEdge = (from: string, to: string) => {
    if (from === to) return
    const g = ensureEditable()
    if (g.edges.some((e) => e.from === from && e.to === to)) return
    setLocalGraph({ ...g, edges: [...g.edges, { from, to }] })
  }
  const removeNode = (id: string) => {
    const g = ensureEditable()
    setLocalGraph({
      ...g,
      nodes: g.nodes.filter((n) => n.id !== id),
      edges: g.edges.filter((e) => e.from !== id && e.to !== id),
    })
    setSelected(null); setFocus(null)
  }
  const removeEdge = (i: number) => {
    const g = ensureEditable()
    setLocalGraph({ ...g, edges: g.edges.filter((_, j) => j !== i) })
  }
  const renameNode = (id: string, title: string) => {
    const g = ensureEditable()
    setLocalGraph({ ...g, nodes: g.nodes.map((n) => (n.id === id ? { ...n, title: title || GNODE_META[n.type].label } : n)) })
  }
  /* 保存时把拖拽产生的位置偏移（pos 覆盖层）合并回节点坐标，避免丢位置 */
  const saveGraph = () => {
    if (!onSaveGraph) return
    const g = localGraph ?? graph
    const merged: GGraph = {
      ...g,
      nodes: g.nodes.map((n) => { const p = pos[n.id]; return p ? { ...n, x: p.x, y: p.y } : n }),
    }
    onSaveGraph(merged)
    setLocalGraph(null); setPos({}); setEditMode(false); setLinkMode(false); setLinkFrom(null)
  }

  /* ---- 节点拖拽：区分「拖拽」与「点击查看详情」 ---- */
  const startDrag = (e: React.MouseEvent, n: GNode) => {
    e.stopPropagation()
    const cur = pos[n.id] ?? { x: n.x, y: n.y }
    dragRef.current = { id: n.id, sx: e.clientX, sy: e.clientY, px: cur.x, py: cur.y, moved: false }
    setDragging(true)
    const onMove = (ev: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const dx = (ev.clientX - d.sx) / scale
      const dy = (ev.clientY - d.sy) / scale
      if (Math.abs(ev.clientX - d.sx) > 3 || Math.abs(ev.clientY - d.sy) > 3) d.moved = true
      setPos((p) => ({ ...p, [d.id]: { x: Math.round(d.px + dx), y: Math.round(d.py + dy) } }))
    }
    const onUp = () => {
      const d = dragRef.current
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      setDragging(false)
      if (d && !d.moved) {
        if (editMode && linkMode) {
          if (!linkFrom) setLinkFrom(d.id)
          else if (linkFrom !== d.id) { addEdge(linkFrom, d.id); setLinkMode(false); setLinkFrom(null) }
          else setLinkFrom(null)
        } else {
          setSelected(nodeMap.get(d.id) ?? null); setFocus(d.id)
        }
      }
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  /* ---- 高亮 / 聚焦 计算 ---- */
  const focusPath = useMemo(() => {
    if (!focus) return null
    const anc = new Set<string>()
    const dec = new Set<string>([focus])
    let st: string[] = [focus]
    while (st.length) {
      const c = st.pop()!
      displayGraph.edges.forEach((e) => { if (e.to === c && !anc.has(e.from)) { anc.add(e.from); st.push(e.from) } })
    }
    st = [focus]
    while (st.length) {
      const c = st.pop()!
      displayGraph.edges.forEach((e) => { if (e.from === c && !dec.has(e.to)) { dec.add(e.to); st.push(e.to) } })
    }
    return new Set<string>([...anc, ...dec])
  }, [focus, graph])
  const nodeDim = (n: GNode) =>
    mainOnly ? false : (focusPath ? !focusPath.has(n.id) : (hi === 'main' && n.type === 'alert') || (hi === 'branch' && n.type !== 'alert'))
  const edgeDim = (e: GEdgeLocal) =>
    mainOnly ? false : (focusPath ? !(focusPath.has(e.from) && focusPath.has(e.to)) : (hi === 'main' && isAlertEdge(e)) || (hi === 'branch' && !isAlertEdge(e)))

  /* 节点的输入（上游）/输出（下游）来源 = 边 */
  const inputsOf = (id: string) => displayGraph.edges.filter((e) => e.to === id).map((e) => nodeMap.get(e.from)?.title ?? e.from)
  const outputsOf = (id: string) => displayGraph.edges.filter((e) => e.from === id).map((e) => nodeMap.get(e.to)?.title ?? e.to)
  const toggleNode = (id: string) => setOpenNodes((prev) => { const s = new Set(prev); if (s.has(id)) s.delete(id); else s.add(id); return s })

  /* ---- 碰撞编辑抽屉 ---- */
  const openCollision = () => {
    setLocalRules(effectiveRules.map((r) => ({ ...r })))
    setEditingCollision(true)
  }
  const patchRule = (id: string, patch: Partial<CollisionRule>) =>
    setLocalRules((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)))
  const updateCond = (id: string, cond: VFilter) => patchRule(id, { cond })
  const updateResult = (id: string, val: string) => patchRule(id, { result: val as CollisionRule['result'] })
  const updatePriority = (id: string, val: string) => patchRule(id, { priority: val as CollisionRule['priority'] })
  const toggleRule = (id: string) =>
    setLocalRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  const removeRule = (id: string) => setLocalRules((rs) => rs.filter((r) => r.id !== id))
  const addRule = () =>
    setLocalRules((rs) => [...rs, {
      id: `cc-${Date.now().toString(36)}`,
      cond: { logic: 'and', groups: [], loose: [] },
      result: '转人工复核',
      priority: '转人工',
      enabled: true,
    }])
  const saveCollision = () => { onSaveCollisions(localRules); setEditingCollision(false) }

  const TBtn = ({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) => (
    <button onClick={onClick} title={title} className="h-7 min-w-7 rounded-md border border-slate-200 bg-white px-2 text-xs text-slate-600 hover:border-brand-400 hover:bg-slate-50">
      {children}
    </button>
  )

  return (
    <div>
      {/* ============ 画板外框（即全屏目标；relative 让抽屉 absolute 相对它定位） ============ */}
      <div
        ref={containerRef}
        className="relative flex overflow-hidden rounded-xl border border-slate-200 bg-[#FAFBFC]"
        style={isFs ? { height: '100vh' } : { maxHeight: 600 }}
      >
        {/* ============ 左侧节点工具条（仅编辑态显示）：分类筛选 + 添加节点 + 连线 ============ */}
        {isEditable && editMode && (
          <aside className="z-30 flex w-[188px] shrink-0 flex-col border-r border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-100 px-3 py-2">
              <span className="text-xs font-semibold text-slate-600">添加节点</span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">{displayGraph.nodes.length} 个</span>
            </div>
            <div className="px-3 pb-2 pt-2">
              <input
                value={nodeFilter}
                onChange={(e) => setNodeFilter(e.target.value)}
                placeholder="筛选节点类型"
                className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-400"
              />
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-3 pb-3">
              {NODE_CATEGORY.map((cat) => {
                const items = cat.types.filter((t) => GNODE_META[t].label.includes(nodeFilter) || nodeFilter === '')
                if (!items.length) return null
                return (
                  <div key={cat.label}>
                    <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">{cat.label}</div>
                    <div className="space-y-1">
                      {items.map((t) => (
                        <button
                          key={t}
                          onClick={() => addNode(t)}
                          className="flex w-full items-center gap-2 rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-600 hover:border-brand-400 hover:bg-slate-50"
                        >
                          <span className="h-3 w-3 shrink-0 rounded-sm" style={{ background: GNODE_META[t].color }} />
                          <span className="truncate">{GNODE_META[t].label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="border-t border-slate-100 p-2">
              <button
                onClick={() => { setLinkMode((v) => !v); setLinkFrom(null) }}
                title="进入连线模式后，先点起点节点、再点终点节点即可连接"
                className={`w-full rounded-lg border px-2 py-1.5 text-xs font-medium ${linkMode ? 'border-cyan-400 bg-cyan-50 text-cyan-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {linkMode ? (linkFrom ? '连线中… 点终点 ✓' : '连线模式（开启）') : '连线模式'}
              </button>
            </div>
          </aside>
        )}

        {/* 工具条：固定在画板顶部 */}
        <div className="flex min-w-0 flex-1 flex-col">
        <div className="sticky top-0 z-20 flex shrink-0 flex-wrap items-center gap-1 border-b border-slate-200 bg-white/95 px-2 py-1.5 backdrop-blur">
          {/* 缩放组 */}
          <span className="mr-1 text-[11px] text-slate-400">缩放</span>
          <TBtn onClick={() => zoom(-0.1)} title="缩小">−</TBtn>
          <span className="w-12 text-center text-xs tabular-nums text-slate-500">{Math.round(scale * 100)}%</span>
          <TBtn onClick={() => zoom(0.1)} title="放大">＋</TBtn>
          <TBtn onClick={fit} title="适应屏幕">适应</TBtn>
          <TBtn onClick={() => setScale(1)} title="原始大小 100%">1:1</TBtn>
          <span className="mx-1 h-5 w-px bg-slate-200" />
          {/* 视图组 */}
          <span className="mr-1 text-[11px] text-slate-400">视图</span>
          <TBtn onClick={resetView} title="复位（缩放+平移归零）">复位</TBtn>
          <TBtn onClick={toggleFs} title={isFs ? '退出全屏' : '全屏'}>{isFs ? '退出全屏' : '全屏'}</TBtn>
          {!mainOnly && (
            <>
              <span className="mx-1 h-5 w-px bg-slate-200" />
              {/* 高亮组 */}
              <span className="mr-1 text-[11px] text-slate-400">高亮</span>
              <TBtn onClick={() => { setHi('main'); setFocus(null) }} title="仅高亮主线（串行链路）">主线</TBtn>
              <TBtn onClick={() => { setHi('branch'); setFocus(null) }} title="仅高亮支线（并行预警）">支线</TBtn>
              <TBtn onClick={() => { setHi('all'); setFocus(null) }} title="全部显示（取消高亮）">全部</TBtn>
            </>
          )}
          {isEditable && (
            <>
              <span className="mx-1 h-5 w-px bg-slate-200" />
              <span className="mr-1 text-[11px] text-slate-400">编辑</span>
              <TBtn onClick={() => { setEditMode((v) => !v); setLinkMode(false); setLinkFrom(null) }} title={editMode ? '退出画布编辑' : '进入画布编辑（添加节点 / 连线 / 删除）'}>
                {editMode ? '完成编辑' : '编辑画布'}
              </TBtn>
              {editMode && dirty && (
                <button onClick={saveGraph} title="保存当前画布（节点 / 连线 / 位置）到模型配置" className="h-7 rounded-md bg-brand-600 px-3 text-xs font-medium text-white hover:bg-brand-700">
                  保存画布
                </button>
              )}
            </>
          )}
          <span className="ml-2 text-[11px] text-slate-300">
            {editMode && linkMode ? (linkFrom ? '连线中 · 点击终点节点完成连线' : '连线模式 · 点击起点节点') : '拖拽节点可调整位置 · 点击节点查看详情并高亮其整条链路'}
          </span>
        </div>

        {/* 画布滚动视口（缩放/平移作用于内层 transform） */}
        <div className="relative flex-1 overflow-auto">
          <div
            style={{
              width: displayGraph.width * scale,
              height: displayGraph.height * scale,
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              transformOrigin: 'top left',
              backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '18px 18px',
            }}
          >
            {/* 连线层 */}
            <svg width={displayGraph.width} height={displayGraph.height} className="pointer-events-none absolute left-0 top-0">
              <defs>
                <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
                  <path d="M0,0 L8,3 L0,6 Z" fill="#94A3B8" />
                </marker>
              </defs>
              {displayGraph.edges.map((e, i) => {
                const a = anchorR(nodeMap.get(e.from)!)
                const b = anchorL(nodeMap.get(e.to)!)
                const midX = (a.x + b.x) / 2
                const d = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`
                const col = e.color ?? (isAlertEdge(e) ? '#0891B2' : '#CBD5E1')
                const dim = edgeDim(e)
                return (
                  <g key={i} style={{ opacity: dim ? 0.18 : 1, transition: 'opacity .15s' }}>
                    <path d={d} fill="none" stroke={col} strokeWidth={isAlertEdge(e) ? 2 : 1.5} strokeDasharray={e.dashed ? '5 4' : undefined} markerEnd={'url(#arrow)'} />
                    {e.label && <text x={midX} y={(a.y + b.y) / 2 - 6} textAnchor="middle" fontSize={11} fill={col}>{e.label}</text>}
                    {editMode && (
                      <path
                        d={d}
                        fill="none"
                        stroke="transparent"
                        strokeWidth={14}
                        style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                        onClick={() => removeEdge(i)}
                      >
                        <title>点击删除该连线</title>
                      </path>
                    )}
                  </g>
                )
              })}
            </svg>

            {/* 节点层 */}
            {displayGraph.nodes.map((n) => {
              const meta = GNODE_META[n.type]
              const isModel = n.type === 'model'
              const isAlertNode = n.type === 'alert'
              const cardBins = isPipeline ? undefined : (isModel && prod === 'zhixin' ? (model.bins?.length ? model.bins : ZHIXIN_SCORECARD) : undefined)
              const headerBg = isModel ? model.color : meta.color
              const isCollision = n.type === 'collision'
              const dim = nodeDim(n)
              const cp = pos[n.id] ?? { x: n.x, y: n.y }
              return (
                <div
                  key={n.id}
                  className={`absolute flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm transition-opacity ${dim ? 'opacity-20' : 'opacity-100'} ${isCollision ? 'cursor-grab hover:border-rose-400 hover:ring-2 hover:ring-rose-200 active:cursor-grabbing' : 'cursor-grab hover:border-slate-400 hover:ring-2 hover:ring-slate-200 active:cursor-grabbing'}`}
                  style={{ left: cp.x, top: cp.y, width: NODE_W, height: NODE_H, ...(isAlertNode ? { borderStyle: 'dashed', borderColor: '#0891B2' } : {}) }}
                  onMouseDown={(e) => startDrag(e, n)}
                >
                  <div className="flex shrink-0 items-center justify-between rounded-t-xl px-3 py-1.5" style={{ background: headerBg }}>
                    <span className="text-xs font-semibold text-white">{n.title}</span>
                    <span className="flex items-center gap-1.5">
                      {isCollision && onSaveCollisions && <span className="rounded bg-white/25 px-1 py-0.5 text-[10px] font-medium text-white">可编辑</span>}
                      {n.badge && <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-medium text-white">{n.badge}</span>}
                    </span>
                  </div>
                  <div className="min-h-0 flex-1 overflow-y-auto px-3 py-1.5">
                    {/* 本客户在该节点的值（数据源=实际值/阈值；模型=中间计算结果）—— 突出显示 */}
                    {nodeResults?.[n.id] && (
                      <div className={'mb-1.5 rounded-md border px-1.5 py-1 text-[11px] font-semibold leading-snug ' + hintTone(nodeResults?.[n.id])}>
                        {nodeResults[n.id]}
                      </div>
                    )}
                    {cardBins ? (
                      <ScoreCardView bins={cardBins} />
                    ) : (
                      <>
                        {n.subtitle && <div className="mb-1 text-[11px] text-slate-400">{n.subtitle}</div>}
                        {/* 算法/规则说明：弱化（更小、更浅、默认折叠） */}
                        <div className="space-y-0.5 opacity-60">
                          {metaOf(n).map((m, i) => (
                            <div key={i} className={`whitespace-normal break-words text-[10.5px] leading-tight text-slate-500 ${!openNodes.has(n.id) && i > 0 ? 'hidden' : ''}`}>{m}</div>
                          ))}
                        </div>
                        {metaOf(n).length > 1 && (
                          <button onClick={() => toggleNode(n.id)} className="mt-0.5 text-[10px] text-blue-500 hover:underline">
                            {openNodes.has(n.id) ? '收起说明' : '展开说明'}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        </div>

        {/* ============ 节点详情抽屉（画板内右侧，不置灰、不遮挡画板操作，全屏可见） ============ */}
        {selected && (
          <div className="absolute right-0 top-10 bottom-0 z-30 flex w-[360px] max-w-[80%] flex-col border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-sm" style={{ background: GNODE_META[selected.type].color }} />
                <span className="text-sm font-semibold text-slate-800">{selected.title}</span>
              </div>
              <button onClick={() => { setSelected(null); setFocus(null) }} className="rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100">关闭</button>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500">{GNODE_META[selected.type].label}</span>
                {selected.subtitle && <span className="text-slate-400">{selected.subtitle}</span>}
                {selected.badge && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-brand-600">{selected.badge}</span>}
              </div>
              {/* 本客户在该节点的值（与图上绿条同源） */}
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">本客户值</div>
                <div className={'rounded-lg border px-3 py-2 text-[12.5px] font-semibold leading-relaxed ' + hintTone(nodeResults?.[selected.id])}>
                  {nodeResults?.[selected.id] ?? '—（该节点无本客户取值）'}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">说明</div>
                <div className="rounded-lg bg-slate-50 px-3 py-2 text-[12px] leading-relaxed text-slate-600">
                  {(metaOf(selected).length ? metaOf(selected) : ['（该节点无额外配置说明）']).map((m, i) => (
                    <div key={i} className="whitespace-pre-wrap">{m}</div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">输入（上游节点）</div>
                <div className="flex flex-wrap gap-1.5">
                  {inputsOf(selected.id).map((t, i) => (
                    <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{t}</span>
                  ))}
                  {inputsOf(selected.id).length === 0 && <span className="text-[11px] text-slate-300">无（起点节点）</span>}
                </div>
              </div>
              <div>
                <div className="mb-1 text-xs font-medium text-slate-500">输出（下游节点）</div>
                <div className="flex flex-wrap gap-1.5">
                  {outputsOf(selected.id).map((t, i) => (
                    <span key={i} className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600">{t}</span>
                  ))}
                  {outputsOf(selected.id).length === 0 && <span className="text-[11px] text-slate-300">无（终点节点）</span>}
                </div>
              </div>
              {selected.type === 'collision' && onSaveCollisions && (
                <>
                  <p className="text-xs leading-relaxed text-slate-400">当多条规则同时命中产生冲突时，按此裁决逻辑取舍并生成对应的预警等级。修改仅影响本模型的配置，保存后随模型持久化。</p>
                  <button onClick={() => { setSelected(null); setFocus(null); openCollision() }} className="w-full rounded-lg border border-rose-200 bg-rose-50 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100">
                    编辑冲突裁决规则 →
                  </button>
                </>
              )}
              {editMode && (
                <>
                  <div>
                    <div className="mb-1 text-xs font-medium text-slate-500">节点标题</div>
                    <input
                      value={selected.title}
                      onChange={(e) => renameNode(selected.id, e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    />
                  </div>
                  <button
                    onClick={() => removeNode(selected.id)}
                    className="w-full rounded-lg border border-rose-200 bg-rose-50 py-2 text-sm font-medium text-rose-600 hover:bg-rose-100"
                  >
                    删除该节点（含相关连线）
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* ============ 规则碰撞 · 冲突裁决 编辑抽屉（仅配置态 onSaveCollisions 传入时可用） ============ */}
        {editingCollision && onSaveCollisions && (
          <div className="absolute inset-0 z-40 flex justify-end bg-black/20" onClick={() => setEditingCollision(false)}>
            <div className="flex h-full w-[440px] max-w-[90%] flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                <div className="text-sm font-semibold text-slate-800">
                  规则碰撞 · 冲突裁决 <span className="ml-1 text-xs font-normal text-slate-400">{SCORE_PROD_LABEL[prod]}</span>
                </div>
                <button onClick={() => setEditingCollision(false)} className="rounded-md px-2 py-1 text-sm text-slate-400 hover:bg-slate-100">关闭</button>
              </div>
              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
                <p className="text-xs text-slate-400">定义当多条规则同时命中产生冲突时如何裁决、并生成何种预警。此即模型配置阶段的冲突逻辑，保存后随模型持久化。</p>
                {localRules.map((r, i) => (
                  <div key={r.id} className="rounded-xl border border-slate-200 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-500">裁决规则 {i + 1}</span>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1 text-xs text-slate-500">
                          <input type="checkbox" checked={r.enabled} onChange={() => toggleRule(r.id)} className="accent-rose-500" /> 启用
                        </label>
                        <button onClick={() => removeRule(r.id)} className="text-xs text-rose-500 hover:underline">删除</button>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="mb-1 text-xs text-slate-500">冲突条件（结构化：选信号源 + 操作符 + 值，可嵌套且/或）</div>
                      <CondBuilder
                        title=""
                        value={r.cond}
                        fields={COLLISION_SIGNAL_FIELDS}
                        onChange={(c) => updateCond(r.id, c)}
                        showLogicHint={false}
                      />
                    </div>
                    <select
                      className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                      value={r.result}
                      onChange={(e) => updateResult(r.id, e.target.value)}
                    >
                      {COLLISION_OUTCOME_LABEL.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <select
                      className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                      value={r.priority}
                      onChange={(e) => updatePriority(r.id, e.target.value)}
                    >
                      <option value="拦截优先">优先级：拦截优先（规则/名单压过分数）</option>
                      <option value="分数优先">优先级：分数优先（模型分决定）</option>
                      <option value="转人工">优先级：转人工复核</option>
                    </select>
                  </div>
                ))}
                {localRules.length === 0 && <div className="rounded-lg border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-400">暂无冲突裁决规则，点击下方新增。</div>}
                <button onClick={addRule} className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-sm text-slate-500 hover:border-brand-400 hover:text-brand-600">＋ 新增冲突裁决规则</button>
              </div>
              <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
                <button onClick={saveCollision} className="flex-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">保存</button>
                <button onClick={() => setEditingCollision(false)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50">取消</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 图例 */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {(Object.keys(GNODE_META) as (keyof typeof GNODE_META)[]).filter((t) => !mainOnly || MAIN_TYPES.includes(t as GNodeType)).map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: GNODE_META[t].color }} />
            {GNODE_META[t].label}
          </span>
        ))}
        {!mainOnly && <span className="flex items-center gap-1.5 text-xs text-slate-500"><span className="inline-block h-0 w-5 border-t-2 border-dashed border-cyan-500" />并行预警（虚线）</span>}
      </div>

      {/* ============ 底部表 1：节点明细（表格；说明列可折叠） ============ */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
          <div className="text-sm font-semibold text-slate-800">节点明细 · 每个节点的说明 / 输入 / 输出</div>
          <button
            onClick={() => setOpenNodes(openNodes.size === displayGraph.nodes.length ? new Set() : new Set(displayGraph.nodes.map((n) => n.id)))}
            className="text-xs text-blue-600 hover:underline"
          >
            {openNodes.size === displayGraph.nodes.length ? '全部展开说明' : '全部收起说明'}
          </button>
        </div>
        <div className="max-h-[340px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50">
              <tr className="text-left text-xs text-slate-400">
                <th className="px-3 py-2 font-medium">节点</th>
                <th className="px-3 py-2 font-medium">类型</th>
                <th className="px-3 py-2 font-medium">结果（本客户在此节点的输出）</th>
                <th className="px-3 py-2 font-medium">说明</th>
                <th className="px-3 py-2 font-medium">输入（上游）</th>
                <th className="px-3 py-2 font-medium">输出（下游）</th>
              </tr>
            </thead>
            <tbody>
              {displayGraph.nodes.map((n) => {
                const open = openNodes.has(n.id)
                const ins = inputsOf(n.id)
                const outs = outputsOf(n.id)
                const m = metaOf(n)
                return (
                  <tr key={n.id} className="border-t border-slate-50 align-top">
                    <td className="px-3 py-2">
                      <span className="flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: GNODE_META[n.type].color }} />
                        <span className="font-medium text-slate-700">{n.title}</span>
                        {n.badge && <span className="rounded-full bg-brand-50 px-1.5 py-0.5 text-[10px] text-brand-600">{n.badge}</span>}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-500">{GNODE_META[n.type].label}</td>
                    <td className="px-3 py-2">
                      {nodeResults?.[n.id] ? (
                        <span className={'inline-block max-w-[240px] whitespace-pre-wrap rounded-md border px-2 py-1 text-[11px] font-medium leading-snug ' + hintTone(nodeResults?.[n.id])}>{nodeResults[n.id]}</span>
                      ) : (
                        <span className="text-[11px] text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      <div className="space-y-0.5">
                        {m.length ? m.map((t, i) => (
                          <div key={i} className={`whitespace-pre-wrap text-[12px] leading-tight ${!open && i > 0 ? 'hidden' : ''}`}>{t}</div>
                        )) : <span className="text-[12px] text-slate-300">（无）</span>}
                      </div>
                      {m.length > 1 && (
                        <button onClick={() => toggleNode(n.id)} className="mt-1 text-[11px] text-blue-600 hover:underline">{open ? '收起' : '展开说明'}</button>
                      )}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {ins.length ? ins.map((t, i) => (
                        <span key={i} className="mr-1 mb-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{t}</span>
                      )) : <span className="text-[11px] text-slate-300">无</span>}
                    </td>
                    <td className="px-3 py-2 text-slate-600">
                      {outs.length ? outs.map((t, i) => (
                        <span key={i} className="mr-1 mb-1 inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[11px] text-slate-600">{t}</span>
                      )) : <span className="text-[11px] text-slate-300">无</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* 本地边类型（仅用于高亮计算，避免与 modelGraphData 的 GEdge 循环引用麻烦） */
interface GEdgeLocal { from: string; to: string; dashed?: boolean; color?: string }
