import { useState, useRef, useEffect, useCallback } from 'react'
import { SingleSelect } from '../components/ui'
import type { DeFlowGraph, DeFlowNode, DeFlowNodeType } from './decisionData'

const NODE_W = 212
const NODE_H = 116

/* 节点类型（对齐 6.* 节点属性文档） */
const NODE_DEFS: { type: DeFlowNodeType; label: string; color: string; icon: string }[] = [
  { type: 'start', label: '开始节点', color: '#1890ff', icon: '▶' },
  { type: 'end', label: '结束节点', color: '#52c41a', icon: '✔' },
  { type: 'policy', label: '策略节点', color: '#fa8c16', icon: '盾' },
  { type: 'list', label: '名单匹配', color: '#f5222d', icon: '搜' },
  { type: 'condition', label: '条件节点', color: '#eb2f96', icon: '⊕' },
  { type: 'parallel', label: '并行网关', color: '#722ed1', icon: '▤' },
  { type: 'merge', label: '合并网关', color: '#13c2c2', icon: '⬌' },
  { type: 'feature', label: '特征节点', color: '#0ea5e9', icon: '≡' },
  { type: 'subflow', label: '子流程', color: '#b54708', icon: '▦' },
]

/* 计算特征候选池（特征节点多选用） */
const FEATURE_POOL: { code: string; name: string; category: '原始' | '外部' | '聚合' }[] = [
  { code: 'phone_is_virtual', name: '是否虚拟号', category: '外部' },
  { code: 'account_age_hours', name: '账号注册小时数', category: '原始' },
  { code: 'history_order_count', name: '历史订单数', category: '外部' },
  { code: 'coupon_value', name: '优惠券面值', category: '原始' },
  { code: 'address_user_count_7d', name: '同地址7日账号数', category: '聚合' },
  { code: 'ip_user_count_1h', name: '同IP1小时账号数', category: '聚合' },
  { code: 'address_is_empty_box', name: '是否空包号地址', category: '外部' },
  { code: 'device_is_emulator', name: '是否模拟器', category: '外部' },
  { code: 'device_is_rooted', name: '是否Root/越狱', category: '原始' },
  { code: 'device_fingerprint_match_count', name: '设备指纹匹配数', category: '聚合' },
  { code: 'ip_is_proxy', name: 'IP是否代理', category: '外部' },
  { code: 'm3_overdue_count', name: '历史M3+逾期次数', category: '外部' },
  { code: 'debt_income_ratio', name: '负债收入比', category: '聚合' },
  { code: 'credit_score', name: '信用评分', category: '外部' },
]

/** 节点摘要（卡片下方要点）：按节点类型展示其关联内容 */
export function nodeSummary(n: DeFlowNode): string[] {
  if (n.type === 'policy' && n.policy) return [`关联策略 · ${n.policy.policyName}`]
  if (n.type === 'list' && n.listRef) return [`名单库 · ${n.listRef.listName}`, `匹配字段 ${n.listRef.matchField} · 得分 ${n.listRef.matchScore}`]
  if (n.type === 'condition' && n.conditions) return n.conditions.map((c) => `${c.label}${c.expr ? `: ${c.expr}` : ''}`)
  if (n.type === 'feature' && n.features) return n.features.map((f) => `${f.name}（${f.category}）`)
  if (n.type === 'subflow' && n.subflowName) return [`子流程 · ${n.subflowName}`]
  return n.meta ?? []
}

function NodeCard({ n, selected, onMouseDown, onRename, linkActive, onLinkPointDown }: {
  n: DeFlowNode; selected: boolean; onMouseDown: (e: React.MouseEvent) => void;
  onRename: (v: string) => void;
  linkActive: boolean;
  onLinkPointDown: (e: React.MouseEvent) => void;
}) {
  const def = NODE_DEFS.find((x) => x.type === n.type) ?? NODE_DEFS[0]
  const icon = def.icon || '●'
  const summary = nodeSummary(n)
  return (
    <div
      onMouseDown={onMouseDown}
      className="absolute select-none rounded-xl border bg-white shadow-card transition hover:shadow-lg group"
      style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H, borderColor: `${def.color}33`, borderTopWidth: 3, borderTopColor: def.color, outline: selected || linkActive ? `2px solid ${def.color}` : undefined, cursor: 'grab' }}
    >
      <div className="flex items-center gap-2 p-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-sm font-bold text-white" style={{ background: def.color }}>{icon}</span>
        <div className="min-w-0 flex-1">
          {n.title ? (
            <div className="truncate text-[13px] font-semibold text-ink-900">{n.title}</div>
          ) : (
            <input defaultValue={n.title} autoFocus onBlur={(e) => onRename(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
              className="w-full rounded border border-slate-200 px-1 py-0.5 text-xs focus:outline-none" />
          )}
          <div className="truncate text-[10px] text-slate-400">{def.label}</div>
        </div>
        {n.badge && <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{n.badge}</span>}
      </div>
      {summary.length > 0 && (
        <div className="px-2 pb-2">
          <div className="line-clamp-2 space-y-0.5">
            {summary.slice(0, 2).map((s, i) => (
              <div key={i} className="truncate text-[10px] leading-tight text-slate-400">{s}</div>
            ))}
          </div>
        </div>
      )}
      {/* 右侧连接点：hover 显示，鼠标按下开始连线 */}
      <div
        onMouseDown={(e) => { e.stopPropagation(); onLinkPointDown(e) }}
        onClick={(e) => e.stopPropagation()}
        title="从此节点开始连线"
        className="absolute -right-2 top-1/2 grid h-4 w-4 -translate-y-1/2 cursor-crosshair place-items-center rounded-full border-2 border-cyan-500 bg-white text-[10px] leading-none text-cyan-600 opacity-0 transition group-hover:opacity-100 hover:scale-125 hover:bg-cyan-50"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,.15)' }}
      >
        ●
      </div>
    </div>
  )
}

export default function DecisionFlowEditor({ flow, onSave, onPublish, flowName, onRenameFlow, policyOptions = [], listOptions = [] }: {
  flow: DeFlowGraph;
  onSave: (g: DeFlowGraph) => void;
  onPublish: (g: DeFlowGraph) => void;
  flowName: string;
  onRenameFlow: (v: string) => void;
  /** 可关联的策略（策略节点用） */
  policyOptions?: { id: string; name: string; code: string; type: string }[];
  /** 可关联的名单库（名单匹配节点用） */
  listOptions?: { id: string; name: string; type: string }[];
}) {
  const [g, setG] = useState<DeFlowGraph>(() => JSON.parse(JSON.stringify(flow)))
  const [scale, setScale] = useState(1)
  const [tx, setTx] = useState(0)
  const [ty, setTy] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<number | null>(null)
  const [editingName, setEditingName] = useState(false)
  /* 节点拖拽：位置覆盖（原始坐标），未拖动则回退 graph 的 x/y */
  const [pos, setPos] = useState<Record<string, { x: number; y: number }>>({})
  const dragRef = useRef<{ id: string; sx: number; sy: number; px: number; py: number; moved: boolean } | null>(null)
  /* 连线起点（点节点右侧圆点 / 工具栏 → 进入连线） */
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  /* 连线预览（鼠标移动时的动态曲线，画布坐标） */
  const [linkPreview, setLinkPreview] = useState<{ x: number; y: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [isFs, setIsFs] = useState(false)

  const zoom = (d: number) => setScale((s) => +Math.min(2, Math.max(0.4, +(s + d).toFixed(2))))
  const resetView = () => { setScale(1); setTx(0); setTy(0) }
  const fit = useCallback(() => {
    const el = wrapRef.current
    if (!el) return
    const gw = g.width || 1000
    const gh = g.height || 500
    const s = Math.min(el.clientWidth / gw, (el.clientHeight || 600) / gh)
    setScale(+Math.min(1.5, Math.max(0.4, s)).toFixed(2)); setTx(0); setTy(0)
  }, [g.width, g.height])

  useEffect(() => { fit() }, [fit])
  useEffect(() => {
    const onFsChange = () => setIsFs(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])
  const toggleFs = () => {
    if (document.fullscreenElement) document.exitFullscreen()
    else wrapRef.current?.requestFullscreen?.()
  }

  const nodePos = (id: string) => pos[id] ?? g.nodes.find((n) => n.id === id) ?? { x: 0, y: 0 }

  const addNode = (type: DeFlowNodeType) => {
    const def = NODE_DEFS.find((x) => x.type === type)!
    const id = `node_${Date.now().toString(36)}`
    const n = g.nodes.length
    const x = 40 + (n % 3) * (NODE_W + 28)
    const y = 40 + Math.floor(n / 3) * (NODE_H + 28)
    const newNode: DeFlowNode = {
      id, type,
      title: def.label.replace('节点', ''),
      subtitle: '',
      meta: type === 'list' ? ['未关联名单库'] : type === 'policy' ? ['未关联策略'] : [],
      x, y,
    }
    setG((prev) => ({ ...prev, nodes: [...prev.nodes, newNode] }))
    setSelected(id); setSelectedEdge(null)
  }

  const connect = (from: string, to: string) => {
    setG((prev) => {
      if (prev.edges.some((e) => e.from === from && e.to === to)) return prev
      return { ...prev, edges: [...prev.edges, { from, to }] }
    })
  }

  /* 开始连线：点节点右侧圆点触发 */
  const beginLink = (n: DeFlowNode) => {
    setLinkFrom(n.id)
    setSelected(n.id); setSelectedEdge(null)
    // 起点右侧中点
    const p = nodePos(n.id)
    setLinkPreview({ x: p.x + NODE_W, y: p.y + NODE_H / 2 })
  }

  /* 节点拖拽：区分「拖拽」与「点击查看/编辑」 */
  const startDrag = (e: React.MouseEvent, n: DeFlowNode) => {
    if (e.button !== 0) return
    e.stopPropagation()
    const cur = pos[n.id] ?? { x: n.x, y: n.y }
    dragRef.current = { id: n.id, sx: e.clientX, sy: e.clientY, px: cur.x, py: cur.y, moved: false }
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
      if (d && !d.moved) {
        // 节点点击处理：连线起点已设 → 点目标节点完成连线；否则选中节点
        if (linkFrom && linkFrom !== d.id) {
          connect(linkFrom, d.id)
          setLinkFrom(null); setLinkPreview(null); setSelected(null); setSelectedEdge(g.edges.length)
        } else {
          setSelected(d.id); setSelectedEdge(null)
          // 取消同一节点的连线
          if (linkFrom === d.id) { setLinkFrom(null); setLinkPreview(null) }
        }
      }
      dragRef.current = null
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  /* 连线预览：window mousemove 跟踪鼠标位置 → 画布坐标 */
  useEffect(() => {
    if (!linkFrom) return
    const onMv = (ev: MouseEvent) => {
      // 画布坐标：从 clientX/Y 减去 canvasRef 偏移 + tx/ty，再除以 scale
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const cx = ev.clientX - rect.left + canvas.scrollLeft
      const cy = ev.clientY - rect.top + canvas.scrollTop
      const x = (cx - tx) / scale
      const y = (cy - ty) / scale
      setLinkPreview({ x, y })
    }
    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === 'Escape') { setLinkFrom(null); setLinkPreview(null) }
    }
    window.addEventListener('mousemove', onMv)
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('mousemove', onMv); window.removeEventListener('keydown', onKey) }
  }, [linkFrom, scale, tx, ty])

  const TBtn = ({ onClick, title, children, active }: { onClick: () => void; title: string; children: React.ReactNode; active?: boolean }) => (
    <button onClick={onClick} title={title}
      className={`h-7 min-w-7 rounded-md border px-2 text-xs transition ${active ? 'border-cyan-400 bg-cyan-50 text-cyan-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-400 hover:bg-slate-50'}`}>
      {children}
    </button>
  )

  const sel = g.nodes.find((n) => n.id === selected) ?? null
  const selEdge = selectedEdge != null ? g.edges[selectedEdge] : null

  /* ---- 节点属性编辑：更新选中节点字段，并同步生成节点摘要 ---- */
  const patchSelNode = (patch: Partial<DeFlowNode>) => {
    if (!sel) return
    setG((prev) => ({ ...prev, nodes: prev.nodes.map((n) => (n.id === sel.id ? { ...n, ...patch, meta: nodeSummary({ ...n, ...patch }) } : n)) }))
  }
  const patchNodeField = (patch: Partial<DeFlowNode>) => patchSelNode(patch)

  /* ---- 连线属性编辑 ---- */
  const patchSelEdge = (patch: Partial<{ label?: string; expr?: string }>) => {
    if (selectedEdge == null) return
    setG((prev) => ({ ...prev, edges: prev.edges.map((e, i) => (i === selectedEdge ? { ...e, ...patch } : e)) }))
  }
  const deleteSelEdge = () => {
    if (selectedEdge == null) return
    setG((prev) => ({ ...prev, edges: prev.edges.filter((_, i) => i !== selectedEdge) }))
    setSelectedEdge(null)
  }

  /* 保存/发布前把拖拽位置(pos 覆盖)合并进图数据 */
  const commitGraph = (): DeFlowGraph => ({
    ...g,
    nodes: g.nodes.map((n) => { const p = pos[n.id]; return p ? { ...n, x: p.x, y: p.y } : n }),
  })

  const edgeA = (id: string) => { const p = nodePos(id); return { x: p.x + NODE_W, y: p.y + NODE_H / 2 } }
  const edgeB = (id: string) => { const p = nodePos(id); return { x: p.x, y: p.y + NODE_H / 2 } }

  /* 取消连线（点击画布空白） */
  const onCanvasClick = () => {
    if (linkFrom) { setLinkFrom(null); setLinkPreview(null) }
    setSelected(null); setSelectedEdge(null)
  }

  return (
    <div ref={wrapRef} className="flex h-[calc(100vh-120px)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-slate-100 bg-white">
      {/* 顶部工具条：流名称 + 保存/发布 */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-2.5">
        <div className="flex items-center gap-2">
          {editingName ? (
            <input defaultValue={flowName} autoFocus
              onBlur={(e) => { onRenameFlow(e.target.value); setEditingName(false) }}
              onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
              className="w-40 rounded border border-slate-200 px-2 py-1 text-sm font-medium focus:outline-none" />
          ) : (
            <span className="cursor-pointer text-sm font-medium text-ink-900" onClick={() => setEditingName(true)}>
              {flowName} <span className="ml-1 text-xs text-slate-300">✎</span>
            </span>
          )}
          <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-600">草稿</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { onSave(commitGraph()); setEditingName(false) }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-brand-300 hover:text-brand-600">保 存</button>
          <button onClick={() => { onPublish(commitGraph()); setEditingName(false) }} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700">发 布</button>
        </div>
      </div>

      {/* 画布工具条：缩放 / 视图 / 连线 */}
      <div className="flex flex-wrap items-center gap-1 border-b border-slate-100 bg-white/95 px-2 py-1.5 backdrop-blur">
        <span className="mr-1 text-[11px] text-slate-400">缩放</span>
        <TBtn onClick={() => zoom(-0.1)} title="缩小">−</TBtn>
        <span className="w-12 text-center text-xs tabular-nums text-slate-500">{Math.round(scale * 100)}%</span>
        <TBtn onClick={() => zoom(0.1)} title="放大">＋</TBtn>
        <TBtn onClick={fit} title="适应屏幕">适应</TBtn>
        <TBtn onClick={() => setScale(1)} title="原始大小 100%">1:1</TBtn>
        <span className="mx-1 h-5 w-px bg-slate-200" />
        <span className="mr-1 text-[11px] text-slate-400">视图</span>
        <TBtn onClick={resetView} title="复位（缩放+平移归零）">复位</TBtn>
        <TBtn onClick={toggleFs} title={isFs ? '退出全屏' : '全屏'}>{isFs ? '退出全屏' : '全屏'}</TBtn>
        <span className="mx-2 h-5 w-px bg-slate-200" />
        <span className="text-[11px] text-cyan-600">
          {linkFrom
            ? <>连线中：<span className="font-medium">{g.nodes.find((n) => n.id === linkFrom)?.title ?? '起点'}</span> → 点击目标节点完成连线（按 <kbd className="rounded bg-slate-100 px-1">Esc</kbd> 取消）</>
            : '悬停节点 → 右侧 ● 圆点 → 起连线（拖拽节点调整位置）'}
        </span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧节点面板 */}
        <div className="w-44 shrink-0 space-y-1 overflow-y-auto border-r border-slate-100 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">节点面板</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-400">{g.nodes.length} 个</span>
          </div>
          {NODE_DEFS.map((d) => (
            <div key={d.type}
              onClick={() => addNode(d.type)}
              className="flex cursor-grab items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-2 text-sm text-slate-600 transition hover:border-brand-300 hover:bg-white">
              <span className="grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white" style={{ background: d.color }}>{d.icon}</span>
              <span>{d.label}</span>
            </div>
          ))}
        </div>

        {/* 中部画布（滚动视口；Ctrl/Cmd+滚轮缩放） */}
        <div ref={canvasRef} className="relative flex-1 overflow-auto bg-slate-50/40"
          onWheel={(e) => { if (e.ctrlKey || e.metaKey) { e.preventDefault(); zoom(e.deltaY < 0 ? 0.1 : -0.1) } }}
          onClick={onCanvasClick}>

          <div
            style={{
              width: (g.width || 1000) * scale,
              height: (g.height || 500) * scale,
              transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
              transformOrigin: 'top left',
              backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '18px 18px',
            }}
          >
            <svg width={g.width || 1000} height={g.height || 500} className="pointer-events-none absolute left-0 top-0">
              <defs>
                <marker id="de-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
                </marker>
                <marker id="de-arrow-active" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M0,0 L10,5 L0,10 z" fill="#0891b2" />
                </marker>
              </defs>
              {g.edges.map((e, i) => {
                const f = g.nodes.find((n) => n.id === e.from)
                const t = g.nodes.find((n) => n.id === e.to)
                if (!f || !t) return null
                const a = edgeA(e.from)
                const b = edgeB(e.to)
                const mx = (a.x + b.x) / 2
                const d = `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
                const active = selectedEdge === i
                return (
                  <g key={i}>
                    {/* 命中区域（加宽，便于点击选中连线） */}
                    <path d={d} fill="none" stroke="transparent" strokeWidth={14} className="cursor-pointer" style={{ pointerEvents: 'stroke' }}
                      onClick={(ev) => { ev.stopPropagation(); setSelectedEdge(i); setSelected(null) }} />
                    <path d={d} fill="none" stroke={active ? '#6366f1' : '#94a3b8'} strokeWidth={active ? 2.5 : 1.5} strokeDasharray={e.dashed ? '5 4' : undefined} markerEnd={active ? 'url(#de-arrow-active)' : 'url(#de-arrow)'} />
                    {e.label && <text x={mx} y={(a.y + b.y) / 2 - 6} textAnchor="middle" fontSize="11" fill={active ? '#6366f1' : '#94a3b8'}>{e.label}</text>}
                  </g>
                )
              })}
              {/* 连线预览：从起点到鼠标当前位置 */}
              {linkFrom && linkPreview && (() => {
                const a = edgeA(linkFrom)
                const mx = (a.x + linkPreview.x) / 2
                const d = `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${linkPreview.y}, ${linkPreview.x} ${linkPreview.y}`
                return <path d={d} fill="none" stroke="#0891b2" strokeWidth={2} strokeDasharray="6 4" markerEnd="url(#de-arrow-active)" />
              })()}
            </svg>
            {g.nodes.map((n) => {
              const cp = nodePos(n.id)
              return (
                <NodeCard key={n.id} n={{ ...n, x: cp.x, y: cp.y }} selected={selected === n.id}
                  linkActive={linkFrom === n.id}
                  onMouseDown={(e) => startDrag(e, n)}
                  onRename={(v) => setG((prev) => ({ ...prev, nodes: prev.nodes.map((x) => x.id === n.id ? { ...x, title: v } : x) }))}
                  onLinkPointDown={() => beginLink(n)}
                />
              )
            })}
          </div>
        </div>

        {/* 右侧属性面板 */}
        <div className="w-72 shrink-0 border-l border-slate-100 p-4">
          {selectedEdge != null && selEdge ? (
            /* ===== 连线属性 ===== */
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded bg-slate-500 px-1.5 py-0.5 text-[10px] font-medium text-white">连线属性</span>
                <div className="flex gap-2">
                  <button onClick={deleteSelEdge} className="text-xs text-rose-600 hover:underline">删除连线</button>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">来源节点</label>
                  <span className="inline-block rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{g.nodes.find((n) => n.id === selEdge.from)?.title ?? selEdge.from}</span>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">目标节点</label>
                  <span className="inline-block rounded bg-slate-100 px-2 py-1 text-xs text-slate-600">{g.nodes.find((n) => n.id === selEdge.to)?.title ?? selEdge.to}</span>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">条件表达式</label>
                  <textarea value={selEdge.expr ?? ''} rows={3} placeholder="如：score > 60 && blacklist == false"
                    onChange={(e) => patchSelEdge({ expr: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 font-mono text-xs focus:border-brand-300 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">标签</label>
                  <input value={selEdge.label ?? ''} placeholder="连线标签（如：命中 / 通过）"
                    onChange={(e) => patchSelEdge({ label: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-brand-300 focus:outline-none" />
                </div>
              </div>
            </div>
          ) : sel ? (
            /* ===== 节点属性 ===== */
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ background: NODE_DEFS.find((x) => x.type === sel.type)?.color }}>{NODE_DEFS.find((x) => x.type === sel.type)?.label ?? sel.type}</span>
                <div className="flex gap-2">
                  <button onClick={() => setG((prev) => ({ ...prev, nodes: prev.nodes.filter((n) => n.id !== sel.id), edges: prev.edges.filter((e) => e.from !== sel.id && e.to !== sel.id) }))} className="text-xs text-rose-600 hover:underline">删除节点</button>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">节点名称</label>
                  <input value={sel.title} onChange={(e) => patchNodeField({ title: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-brand-300 focus:outline-none" />
                </div>

                {/* 策略节点：关联策略 */}
                {sel.type === 'policy' && (
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">关联策略</label>
                    <SingleSelect label="请选择策略" clearable fullWidth value={sel.policy?.policyId ?? ''} onChange={(v) => {
                        const opt = policyOptions.find((p) => p.id === v)
                        patchNodeField({ policy: opt ? { policyId: opt.id, policyName: opt.name } : undefined })
                      }} options={[{ value: '', label: '请选择策略' }, ...policyOptions.map((p) => ({ value: p.id, label: `${p.name}（${p.type}）` }))]} />
                  </div>
                )}

                {/* 名单匹配：关联名单库 / 匹配字段 / 匹配分数 */}
                {sel.type === 'list' && (
                  <>
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">关联名单库</label>
                      <SingleSelect label="请选择名单库" clearable fullWidth value={sel.listRef?.listId ?? ''} onChange={(v) => {
                          const opt = listOptions.find((l) => l.id === v)
                          patchNodeField({ listRef: { listId: opt?.id ?? '', listName: opt?.name ?? '', matchField: sel.listRef?.matchField ?? 'phone', matchScore: sel.listRef?.matchScore ?? 0 } })
                        }} options={[{ value: '', label: '请选择名单库' }, ...listOptions.map((l) => ({ value: l.id, label: l.name }))]} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">匹配字段</label>
                      <SingleSelect label="匹配字段" fullWidth value={sel.listRef?.matchField ?? 'phone'}
                        onChange={(v) => patchNodeField({ listRef: { listId: sel.listRef?.listId ?? '', listName: sel.listRef?.listName ?? '', matchField: v, matchScore: sel.listRef?.matchScore ?? 0 } })}
                        options={['phone', 'ip', 'device_id', 'id_card', 'address'].map((f) => ({ value: f, label: f }))} />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs text-slate-400">匹配分数</label>
                      <input type="number" value={sel.listRef?.matchScore ?? 0}
                        onChange={(e) => patchNodeField({ listRef: { listId: sel.listRef?.listId ?? '', listName: sel.listRef?.listName ?? '', matchField: sel.listRef?.matchField ?? 'phone', matchScore: +e.target.value } })}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-brand-300 focus:outline-none" />
                    </div>
                  </>
                )}

                {/* 条件节点：出边条件 */}
                {sel.type === 'condition' && (
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">出边条件</label>
                    <div className="space-y-1.5">
                      {(sel.conditions ?? []).map((c) => (
                        <div key={c.id} className="rounded-lg border border-slate-200 bg-slate-50/50 p-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-slate-400">→</span>
                            <span className="truncate text-[11px] text-slate-600">{g.nodes.find((n) => n.id === selEdge?.to)?.title ?? '目标'}</span>
                          </div>
                          <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                            <input value={c.label} placeholder="标签（如：是/否）"
                              onChange={(e) => patchNodeField({ conditions: (sel.conditions ?? []).map((x) => x.id === c.id ? { ...x, label: e.target.value } : x) })}
                              className="rounded border border-slate-200 px-1.5 py-1 text-[11px] focus:border-brand-300 focus:outline-none" />
                            <input value={c.expr} placeholder="表达式"
                              onChange={(e) => patchNodeField({ conditions: (sel.conditions ?? []).map((x) => x.id === c.id ? { ...x, expr: e.target.value } : x) })}
                              className="rounded border border-slate-200 px-1.5 py-1 font-mono text-[11px] focus:border-brand-300 focus:outline-none" />
                          </div>
                        </div>
                      ))}
                      {(!sel.conditions || sel.conditions.length === 0) && (
                        <div className="rounded-lg border border-dashed border-slate-200 px-2 py-3 text-center text-[11px] text-slate-400">出边条件随连线自动生成</div>
                      )}
                    </div>
                  </div>
                )}

                {/* 特征节点：计算特征（多选，原始/外部/聚合） */}
                {sel.type === 'feature' && (
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">计算特征</label>
                    {(['原始', '外部', '聚合'] as const).map((cat) => {
                      const items = FEATURE_POOL.filter((f) => f.category === cat)
                      return (
                        <div key={cat} className="mb-2">
                          <div className="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">{cat}</div>
                          <div className="space-y-1">
                            {items.map((f) => {
                              const checked = sel.features?.some((x) => x.code === f.code) ?? false
                              return (
                                <label key={f.code} className="flex items-center gap-2 text-xs text-slate-600">
                                  <input type="checkbox" checked={checked}
                                    onChange={(ev) => {
                                      const cur = sel.features ?? []
                                      const next = ev.target.checked
                                        ? [...cur, { code: f.code, name: f.name, category: f.category }]
                                        : cur.filter((x) => x.code !== f.code)
                                      patchNodeField({ features: next })
                                    }} />
                                  <span className="truncate">{f.name}</span>
                                </label>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* 子流程：关联子流程 */}
                {sel.type === 'subflow' && (
                  <div>
                    <label className="mb-1 block text-xs text-slate-400">关联子流程</label>
                    <input value={sel.subflowName ?? ''} placeholder="子流程名称"
                      onChange={(e) => patchNodeField({ subflowName: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-brand-300 focus:outline-none" />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              <p className="mb-1 text-lg">◈</p>
              <div className="mb-2">点击节点或连线查看属性</div>
              <div className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50/50 px-2 py-2 text-[11px] text-cyan-700">
                <span className="font-medium">连线方法：</span><br />
                1. 鼠标悬停节点 → 出现<span className="mx-1 inline-block h-3 w-3 rounded-full border-2 border-cyan-500 bg-white align-middle" />右侧圆点<br />
                2. 按住圆点拖到目标节点 / 点圆点后点目标节点
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
