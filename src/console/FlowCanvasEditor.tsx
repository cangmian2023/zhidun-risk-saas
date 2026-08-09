/* ============================================================================
 * 自由画布流程编辑器（审核操作 · 每个评分分段一张图）
 * - 节点可拖拽；「＋节点」从顶部工具栏添加；点节点出属性弹层（画布内弹出，节点置中）
 * - 连线：点起点节点右侧圆点进入连线模式，再点目标节点完成；点连线可改标签/删除
 * - 顶部「流程名称」输入框给当前业务流程取名（运行时即操作按钮标识）
 * - 视图工具栏：放大 / 缩小 / 全画幅（适应）/ 居中 / 全屏
 * - 纯前端实现，无第三方依赖；数据结构见 reportTemplateData.ts 的 FlowGraph
 * ========================================================================= */
import { useRef, useState, useEffect } from 'react'
import {
  FlowGraph, FlowGraphNode, FlowGraphEdge, FlowNodeType, ReviewResult,
  FLOW_NODE_TYPE_LABEL, FLOW_NODE_TYPE_COLOR, ReviewRole, REVIEW_ROLES,
  REVIEW_CHECK_ITEMS, REVIEW_RESULTS, defaultOpinionPresets,
} from './reportTemplateData'

const NODE_W = 132
const NODE_H = 52
const CANVAS_H = 420
const CONTENT_W = 1600

const inp: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', width: '100%' }
const SEL = '#2563EB'
const miniBtn: React.CSSProperties = { padding: '3px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: '#fff', border: '1px solid #E5E7EB' }
const miniInp: React.CSSProperties = { padding: '4px 8px', fontSize: 12, borderRadius: 6, border: '1px solid #E2E8F0', outline: 'none', background: '#fff' }
let seq = 0
const nid = () => `n_${Date.now().toString(36)}_${seq++}`
const eid = () => `e_${Date.now().toString(36)}_${seq++}`
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v))

// 审批意见预设编辑器：按审批结果分组，每组可增删选项（运行时另允许手输）
function OpinionPresetsEditor({ node, patchNode, readOnly }: {
  node: FlowGraphNode
  patchNode: (id: string, p: Partial<FlowGraphNode>) => void
  readOnly?: boolean
}) {
  const base = node.opinionPresets ?? defaultOpinionPresets()
  // 用户节点可能只配了部分结果的预设 → 缺键兜底为空数组，避免 presets[r].length 崩溃
  const presets: Record<ReviewResult, string[]> = {
    '通过': base['通过'] ?? [],
    '转人工': base['转人工'] ?? [],
    '拒绝': base['拒绝'] ?? [],
  }
  const [draft, setDraft] = useState<Record<ReviewResult, string>>({ '通过': '', '转人工': '', '拒绝': '' })
  const setGroup = (r: ReviewResult, next: string[]) => patchNode(node.id, { opinionPresets: { ...presets, [r]: next } })
  return (
    <div style={{ marginTop: 4, border: '1px solid #E5E7EB', borderRadius: 6, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {REVIEW_RESULTS.map((r) => (
        <div key={r}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 3 }}>{r}时的审批意见</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {presets[r].length === 0 ? (
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>（默认无预设，添加后生成标签）</span>
            ) : (
              presets[r].map((o) => (
                <span key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, background: '#F1F5F9', borderRadius: 12, padding: '2px 8px', color: '#374151' }}>
                  {o}
                  {!readOnly && <button onClick={() => setGroup(r, presets[r].filter((x) => x !== o))} style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>}
                </span>
              ))
            )}
          </div>
          {!readOnly && (
            <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
              <input value={draft[r]} onChange={(e) => setDraft((d) => ({ ...d, [r]: e.target.value }))} placeholder={`自定义（${r}）`} style={{ ...inp, flex: 1 }} />
              <button onClick={() => { const v = draft[r].trim(); if (v && !presets[r].includes(v)) setGroup(r, [...presets[r], v]); setDraft((d) => ({ ...d, [r]: '' })) }} style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, background: '#fff', cursor: 'pointer' }}>添加</button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

/* 视图工具栏：图标按钮 + tooltip（浮于画布右上角） */
const IconBtn = ({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) => (
  <button title={title} onClick={(e) => { e.stopPropagation(); onClick() }}
    style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, cursor: 'pointer', background: '#fff', border: '1px solid #E5E7EB', color: '#475569', boxShadow: '0 1px 2px rgba(0,0,0,.06)' }}>
    {children}
  </button>
)
const IconZoomIn = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" /></svg>)
const IconZoomOut = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /><line x1="8" y1="11" x2="14" y2="11" /></svg>)
const IconFit = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 9V5a1 1 0 0 1 1-1h4" /><path d="M20 9V5a1 1 0 0 0-1-1h-4" /><path d="M4 15v4a1 1 0 0 0 1 1h4" /><path d="M20 15v4a1 1 0 0 1-1 1h-4" /></svg>)
const IconCenter = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" /><line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" /></svg>)
const IconFull = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>)

export default function FlowCanvasEditor({ graph, onChange, readOnly, statusEnum, matchFieldOptions, defaultSteps }: {
  graph: FlowGraph
  onChange: (g: FlowGraph) => void
  readOnly?: boolean
  statusEnum?: string[]
  // 需求16：流程配置区（业务流程图编辑传入；报告模板不传则不显示）
  matchFieldOptions?: { field: string; label: string }[]  // 关联字段候选（关联页面列表字段）
  defaultSteps?: { state: string; action: string; timeLimit?: number }[]  // 新建默认状态机（三节点）
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [selNode, setSelNode] = useState<string | null>(null)
  const [selEdge, setSelEdge] = useState<string | null>(null)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const [customCheck, setCustomCheck] = useState('')
  const [showCheckPresets, setShowCheckPresets] = useState(false)
  // 关联字段与状态机：默认收起，点击展开编辑（需求8.1）
  const [matchOpen, setMatchOpen] = useState(false)
  // 视口变换：缩放 + 平移（用于 放大/缩小/全画幅/居中/全屏）
  const [scale, setScale] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })

  const nodeMap = new Map(graph.nodes.map((n) => [n.id, n]))
  const selected = selNode ? nodeMap.get(selNode) : undefined
  const selectedEdge = selEdge ? graph.edges.find((e) => e.id === selEdge) : undefined

  const patchNode = (id: string, p: Partial<FlowGraphNode>) =>
    onChange({ ...graph, nodes: graph.nodes.map((n) => (n.id === id ? { ...n, ...p } : n)) })
  const patchEdge = (id: string, p: Partial<FlowGraphEdge>) =>
    onChange({ ...graph, edges: graph.edges.map((e) => (e.id === id ? { ...e, ...p } : e)) })

  const addNode = (type: FlowNodeType) => {
    if (readOnly) return
    const n: FlowGraphNode = {
      id: nid(), type, label: FLOW_NODE_TYPE_LABEL[type],
      x: 60 + ((graph.nodes.length * 40) % 400), y: 40 + ((graph.nodes.length * 60) % 280),
      role: REVIEW_ROLES[0],
      checkItems: [],
      results: ['通过', '转人工', '拒绝'] as ReviewResult[],
      opinionPresets: { '通过': [], '转人工': [], '拒绝': [] },
    }
    onChange({ ...graph, nodes: [...graph.nodes, n] })
    setSelNode(n.id); setSelEdge(null)
  }

  const removeNode = (id: string) => {
    onChange({ nodes: graph.nodes.filter((n) => n.id !== id), edges: graph.edges.filter((e) => e.from !== id && e.to !== id) })
    setSelNode(null)
  }
  const removeEdge = (id: string) => { onChange({ ...graph, edges: graph.edges.filter((e) => e.id !== id) }); setSelEdge(null) }

  const onNodeClick = (id: string) => {
    if (linkFrom) {
      if (linkFrom !== id && !graph.edges.some((e) => e.from === linkFrom && e.to === id)) {
        onChange({ ...graph, edges: [...graph.edges, { id: eid(), from: linkFrom, to: id }] })
      }
      setLinkFrom(null)
      return
    }
    setSelNode(id); setSelEdge(null)
  }

  const onPointerDown = (ev: React.PointerEvent, n: FlowGraphNode) => {
    if (readOnly || linkFrom) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const localX = (ev.clientX - rect.left - offset.x) / scale
    const localY = (ev.clientY - rect.top - offset.y) / scale
    dragRef.current = { id: n.id, dx: localX - n.x, dy: localY - n.y }
    ;(ev.target as HTMLElement).setPointerCapture(ev.pointerId)
  }
  const onPointerMove = (ev: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = (ev.clientX - rect.left - offset.x) / scale - d.dx
    const y = (ev.clientY - rect.top - offset.y) / scale - d.dy
    patchNode(d.id, { x: Math.round(Math.max(0, Math.min(CONTENT_W - NODE_W, x))), y: Math.round(Math.max(0, Math.min(CANVAS_H - NODE_H, y))) })
  }
  const onPointerUp = () => { dragRef.current = null }

  /* 连线路径：起点右中 → 终点左中，水平贝塞尔 */
  const edgePath = (e: FlowGraphEdge) => {
    const a = nodeMap.get(e.from); const b = nodeMap.get(e.to)
    if (!a || !b) return null
    const x1 = a.x + NODE_W, y1 = a.y + NODE_H / 2, x2 = b.x, y2 = b.y + NODE_H / 2
    const c = Math.max(30, Math.abs(x2 - x1) / 2)
    return { d: `M ${x1} ${y1} C ${x1 + c} ${y1}, ${x2 - c} ${y2}, ${x2} ${y2}`, mx: (x1 + x2) / 2, my: (y1 + y2) / 2 - 8 }
  }

  /* —— 视图工具栏操作 —— */
  const zoom = (dir: 1 | -1) => setScale((s) => Math.max(0.4, Math.min(2.5, dir > 0 ? s * 1.15 : s / 1.15)))
  const bbox = () => {
    if (!graph.nodes.length) return { w: 0, h: 0 }
    const w = Math.max(...graph.nodes.map((n) => n.x + NODE_W))
    const h = Math.max(...graph.nodes.map((n) => n.y + NODE_H))
    return { w, h }
  }
  const fitView = () => {
    const el = canvasRef.current
    if (!el || !graph.nodes.length) { setScale(1); setOffset({ x: 0, y: 0 }); return }
    const { w, h } = bbox()
    const cw = el.clientWidth, ch = CANVAS_H
    const s = Math.min(cw / w, ch / h, 1.6)
    setScale(s)
    setOffset({ x: Math.max(0, (cw - w * s) / 2), y: Math.max(0, (ch - h * s) / 2) })
  }
  const centerView = () => {
    const el = canvasRef.current
    if (!el || !graph.nodes.length) return
    const { w, h } = bbox()
    const cw = el.clientWidth, ch = CANVAS_H
    setOffset({ x: Math.max(0, (cw - w * scale) / 2), y: Math.max(0, (ch - h * scale) / 2) })
  }
  // 需求8.2：点击节点 → 把该节点移到画布中心（弹层随节点定位）
  const centerOnNode = (n: FlowGraphNode) => {
    const el = canvasRef.current
    if (!el) return
    const cw = el.clientWidth, ch = CANVAS_H
    const cx = n.x + NODE_W / 2, cy = n.y + NODE_H / 2
    setOffset({ x: cw / 2 - cx * scale, y: ch / 2 - cy * scale })
  }
  useEffect(() => {
    if (selNode) {
      const n = graph.nodes.find((x) => x.id === selNode)
      if (n) centerOnNode(n)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selNode])

  const toggleFull = () => {
    const el = canvasRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  return (
    <div style={{ position: 'relative' }}>
      <datalist id="statusEnumList">
        {(statusEnum ?? []).map((s) => <option key={s} value={s} />)}
      </datalist>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* 流程名称 + 视图工具栏（始终可见） */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#6B7280', whiteSpace: 'nowrap' }}>流程名称</span>
            <input disabled={readOnly} value={graph.name ?? ''} onChange={(e) => onChange({ ...graph, name: e.target.value })}
              placeholder="如 确认通过 / 转人工审核" style={{ ...inp, width: 200 }} />
          </div>
        </div>
        {/* 需求16 + 8.1：关联字段与状态机（可折叠，默认收起；点击展开编辑） */}
        {matchFieldOptions && !readOnly && (
          <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, background: '#FAFBFE', marginBottom: 8, overflow: 'hidden' }}>
            <div onClick={() => setMatchOpen((v) => !v)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', cursor: 'pointer', userSelect: 'none' }}>
              <span style={{ transform: matchOpen ? 'rotate(90deg)' : 'none', transition: 'transform .15s', fontSize: 10, color: '#9CA3AF' }}>▶</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>关联字段与状态机</span>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>
                可选 · 不关联 = 该页面所有数据都走本流程 · 已配 {(graph.match ?? []).length} 条关联 / {(graph.flowSteps ?? []).length} 个状态节点
              </span>
            </div>
            {matchOpen && (
              <div style={{ padding: '0 10px 10px', borderTop: '1px solid #EEF2F7' }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '10px 0 4px' }}>
                  关联字段<span style={{ fontWeight: 400, fontSize: 11, color: '#9CA3AF' }}>按「字段 = 值」匹配数据到本流程；值支持逗号分隔多选</span>
                </div>
                {(graph.match ?? []).length === 0 && (
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>（未关联字段：页面所有数据都关联本流程）</div>
                )}
                {(graph.match ?? []).map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                    <select value={m.field} onChange={(e) => {
                      const arr = [...(graph.match ?? [])]
                      arr[i] = { ...arr[i], field: e.target.value }
                      onChange({ ...graph, match: arr })
                    }} style={{ ...inp, width: 150 }}>
                      <option value="">选择字段</option>
                      {matchFieldOptions.map((o) => <option key={o.field} value={o.field}>{o.label}</option>)}
                    </select>
                    <input value={m.value} placeholder="值（如 RED / 负债激增，逗号分隔多选）"
                      onChange={(e) => {
                        const arr = [...(graph.match ?? [])]
                        arr[i] = { ...arr[i], value: e.target.value }
                        onChange({ ...graph, match: arr })
                      }} style={{ ...inp, width: 240 }} />
                    <button onClick={() => onChange({ ...graph, match: (graph.match ?? []).filter((_, k) => k !== i) })}
                      style={{ ...miniBtn, borderColor: '#FCA5A5', color: '#DC2626' }}>删除</button>
                  </div>
                ))}
                <button onClick={() => onChange({ ...graph, match: [...(graph.match ?? []), { field: matchFieldOptions[0]?.field ?? '', value: '' }] })}
                  style={{ ...miniBtn, borderColor: SEL, color: SEL, marginTop: 2 }}>＋ 添加关联条件</button>

                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', margin: '12px 0 4px' }}>
                  状态机（本流程独立 · 新建默认三个节点）<span style={{ fontWeight: 400, fontSize: 11, color: '#9CA3AF' }}>每个节点：状态名 / 操作按钮（时限在节点属性面板配置）</span>
                </div>
                {(graph.flowSteps ?? []).length === 0 && (
                  <div style={{ fontSize: 11, color: '#9CA3AF', marginBottom: 4 }}>
                    （未配置独立状态机，使用默认三节点：待处理 → 处理中 → 已处理）
                    {defaultSteps && (
                      <button onClick={() => onChange({ ...graph, flowSteps: defaultSteps.map((s) => ({ ...s })) })}
                        style={{ ...miniBtn, borderColor: SEL, color: SEL, marginLeft: 8 }}>用默认三节点</button>
                    )}
                  </div>
                )}
                {(graph.flowSteps ?? []).map((s, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 11, color: '#94A3B8', width: 14 }}>{i + 1}</span>
                    <input value={s.state ?? ''} placeholder="状态名"
                      onChange={(e) => {
                        const arr = [...(graph.flowSteps ?? [])]
                        arr[i] = { ...arr[i], state: e.target.value }
                        onChange({ ...graph, flowSteps: arr })
                      }} style={{ ...miniInp, width: 130 }} />
                    <span style={{ color: '#CBD5E1' }}>→</span>
                    <input value={s.action ?? ''} placeholder="操作按钮（终态留空）"
                      onChange={(e) => {
                        const arr = [...(graph.flowSteps ?? [])]
                        arr[i] = { ...arr[i], action: e.target.value }
                        onChange({ ...graph, flowSteps: arr })
                      }} style={{ ...miniInp, width: 110 }} />
                    <button onClick={() => onChange({ ...graph, flowSteps: (graph.flowSteps ?? []).filter((_, k) => k !== i) })}
                      style={{ ...miniBtn, borderColor: '#FCA5A5', color: '#DC2626' }}>删除</button>
                  </div>
                ))}
                <button onClick={() => onChange({ ...graph, flowSteps: [...(graph.flowSteps ?? []), { state: '', action: '', timeLimit: undefined }] })}
                  style={{ ...miniBtn, borderColor: SEL, color: SEL }}>＋ 添加节点</button>
                <span style={{ marginLeft: 8, fontSize: 11, color: '#9CA3AF' }}>状态按 待→橙 / 中→蓝 / 已→绿 自动配色</span>
              </div>
            )}
          </div>
        )}
        {/* 节点添加工具栏（仅编辑态） */}
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {(['start', 'normal', 'end'] as FlowNodeType[]).map((t) => (
              <button key={t} onClick={() => addNode(t)}
                style={{ padding: '4px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: FLOW_NODE_TYPE_COLOR[t].bg, border: `1px solid ${FLOW_NODE_TYPE_COLOR[t].border}`, color: FLOW_NODE_TYPE_COLOR[t].text }}>
                ＋ {FLOW_NODE_TYPE_LABEL[t]}
              </button>
            ))}
            <span style={{ flex: 1 }} />
            {linkFrom
              ? <span style={{ fontSize: 12, color: '#1D4ED8' }}>连线模式：点击目标节点完成，<a style={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => setLinkFrom(null)}>取消</a></span>
              : <span style={{ fontSize: 12, color: '#9CA3AF' }}>拖动节点调整位置；点节点右侧 ● 开始连线</span>}
          </div>
        )}
        <div ref={canvasRef} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
          onClick={(e) => { if (e.target === canvasRef.current || e.target === contentRef.current) { setSelNode(null); setSelEdge(null); setLinkFrom(null) } }}
          style={{ position: 'relative', height: CANVAS_H, border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', cursor: linkFrom ? 'crosshair' : 'default', background: '#FBFCFE' }}>
          <div ref={contentRef}
            style={{ position: 'absolute', top: 0, left: 0, width: CONTENT_W, height: CANVAS_H, transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`, transformOrigin: '0 0', backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
            <svg style={{ position: 'absolute', inset: 0, width: CONTENT_W, height: CANVAS_H, pointerEvents: 'none' }}>
              <defs>
                <marker id="fc-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M1 1L9 5L1 9" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
                <marker id="fc-arrow-sel" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                  <path d="M1 1L9 5L1 9" fill="none" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </marker>
              </defs>
              {graph.edges.map((e) => {
                const p = edgePath(e)
                if (!p) return null
                const sel = e.id === selEdge
                return (
                  <g key={e.id}>
                    <path d={p.d} fill="none" stroke="transparent" strokeWidth="12" style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                      onClick={(ev) => { ev.stopPropagation(); setSelEdge(e.id); setSelNode(null) }} />
                    <path d={p.d} fill="none" stroke={sel ? '#2563EB' : '#94A3B8'} strokeWidth={sel ? 2 : 1.5} markerEnd={sel ? 'url(#fc-arrow-sel)' : 'url(#fc-arrow)'} />
                    {e.label && <text x={p.mx} y={p.my} textAnchor="middle" fontSize="11" fill={sel ? '#2563EB' : '#64748B'} style={{ paintOrder: 'stroke', stroke: '#FBFCFE', strokeWidth: 3 }}>{e.label}</text>}
                    {e.result && <text x={p.mx} y={(p.my ?? 0) + 13} textAnchor="middle" fontSize="10" fill={sel ? '#DB2777' : '#BE185D'} style={{ paintOrder: 'stroke', stroke: '#FBFCFE', strokeWidth: 3 }}>if {e.result}</text>}
                  </g>
                )
              })}
            </svg>
            {graph.nodes.map((n) => {
              const c = FLOW_NODE_TYPE_COLOR[n.type]
              const sel = n.id === selNode
              const linkable = !!linkFrom && linkFrom !== n.id
              return (
                <div key={n.id} onPointerDown={(ev) => onPointerDown(ev, n)} onClick={(ev) => { ev.stopPropagation(); onNodeClick(n.id) }}
                  style={{ position: 'absolute', left: n.x, top: n.y, width: NODE_W, height: NODE_H, borderRadius: 8, background: c.bg, border: `${sel || linkable ? 2 : 1}px solid ${linkable ? '#2563EB' : sel ? c.border : c.border + '99'}`, boxShadow: sel ? '0 2px 8px rgba(37,99,235,.18)' : '0 1px 2px rgba(0,0,0,.05)', cursor: readOnly ? 'default' : 'grab', userSelect: 'none', padding: '7px 10px', boxSizing: 'border-box' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: c.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.label}</div>
                  <div style={{ fontSize: 11, color: c.text, opacity: 0.75, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {FLOW_NODE_TYPE_LABEL[n.type]}
                    {n.role ? ` · ${n.role}` : ''}
                    {n.buttonName ? ` · 按钮「${n.buttonName}」` : ''}
                    {n.type !== 'end' && n.results && n.results.length
                      ? (n.resultStates ? ' ⟶ 结果映射' : '')
                      : (n.postState ? ` → ${n.postState}` : '')}
                  </div>
                  {!readOnly && n.type !== 'end' && (
                    <div onClick={(ev) => { ev.stopPropagation(); setLinkFrom(n.id); setSelNode(null); setSelEdge(null) }} title="从此节点连线"
                      style={{ position: 'absolute', right: -7, top: NODE_H / 2 - 7, width: 14, height: 14, borderRadius: 999, background: linkFrom === n.id ? '#2563EB' : '#fff', border: '2px solid #2563EB', cursor: 'crosshair' }} />
                  )}
                </div>
              )
            })}
          </div>
          {/* 视图工具栏：图标 + tooltip，浮于画布右上角 */}
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', top: 10, right: 10, zIndex: 5, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <IconBtn title="放大" onClick={() => zoom(1)}><IconZoomIn /></IconBtn>
            <IconBtn title="缩小" onClick={() => zoom(-1)}><IconZoomOut /></IconBtn>
            <IconBtn title="全画幅（适应内容）" onClick={fitView}><IconFit /></IconBtn>
            <IconBtn title="居中" onClick={centerView}><IconCenter /></IconBtn>
            <IconBtn title="全屏" onClick={toggleFull}><IconFull /></IconBtn>
          </div>
          {/* 需求8.2：节点属性弹层（点击图上节点后在图上弹出；节点已置中） */}
          {selected && (() => {
            const n = selected
            const cx = n.x + NODE_W / 2, cy = n.y + NODE_H / 2
            const sx = offset.x + cx * scale, sy = offset.y + cy * scale
            const cw = canvasRef.current?.clientWidth ?? 800, ch = CANVAS_H, W = 282
            const px = clamp(sx + (NODE_W * scale) / 2 + 14, 8, Math.max(8, cw - W - 8))
            const py = clamp(sy - 90, 8, Math.max(8, ch - 340))
            return (
              <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: px, top: py, width: W, zIndex: 20, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', padding: 12, maxHeight: ch - 16, overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: FLOW_NODE_TYPE_COLOR[n.type].text }}>节点属性</div>
                    <div style={{ fontSize: 11, color: '#9CA3AF' }}>{FLOW_NODE_TYPE_LABEL[n.type]} · {n.label}{n.role ? ` · ${n.role}` : ''}</div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); setSelNode(null); setSelEdge(null) }} style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {n.type === 'end' ? (
                    <>
                      <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.7, background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 10px' }}>
                        结束节点的状态<span style={{ color: '#DC2626' }}>无需在此配置</span>。<br />
                        最终状态由<span style={{ color: '#1D4ED8', fontWeight: 600 }}>上一决策节点</span>的「审批结果 → 状态」映射（resultStates）派生，流程走到此处即落地该状态。
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', cursor: readOnly ? 'default' : 'pointer' }}>
                        <input type="checkbox" disabled={readOnly} checked={n.showButton ?? false}
                          onChange={(e) => patchNode(n.id, { showButton: e.target.checked })} />
                        继续显示按钮（在结束状态展示操作按钮）
                      </label>
                    </>
                  ) : (
                    <>
                      <label style={{ fontSize: 12, color: '#6B7280' }}>节点标题（画布显示）
                        <input disabled={readOnly} value={n.label} onChange={(e) => patchNode(n.id, { label: e.target.value })} style={{ ...inp, marginTop: 4 }} />
                      </label>
                      <label style={{ fontSize: 12, color: '#6B7280' }}>按钮名称（运行时操作按钮文案）
                        <input disabled={readOnly} value={n.buttonName ?? ''} onChange={(e) => patchNode(n.id, { buttonName: e.target.value })} placeholder={n.label || '缺省同节点标题'} style={{ ...inp, marginTop: 4 }} />
                      </label>
                      <label style={{ fontSize: 12, color: '#6B7280' }}>时限倒计时（分钟，空 = 不限制）
                        <input type="number" min={0} disabled={readOnly} value={n.timeLimit ?? ''}
                          onChange={(e) => patchNode(n.id, { timeLimit: e.target.value === '' ? undefined : Math.max(0, Number(e.target.value)) })}
                          placeholder="如 30 / 120" style={{ ...inp, marginTop: 4 }} />
                      </label>
                      <label style={{ fontSize: 12, color: '#6B7280' }}>经办角色
                        <select disabled={readOnly} value={n.role} onChange={(e) => patchNode(n.id, { role: e.target.value as ReviewRole })} style={{ ...inp, marginTop: 4 }}>
                          {REVIEW_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </label>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>弹出内容 · 审核事项
                        <div style={{ marginTop: 4, border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 132, overflowY: 'auto' }}>
                          {(n.checkItems ?? []).length === 0 ? (
                            <span style={{ fontSize: 11, color: '#9CA3AF' }}>（默认无审核事项，添加后生成标签）</span>
                          ) : (
                            (n.checkItems ?? []).map((it) => (
                              <div key={it} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, fontSize: 12, color: '#374151', background: '#F1F5F9', borderRadius: 4, padding: '2px 6px' }}>
                                <span>{it}</span>
                                {!readOnly && <button onClick={() => patchNode(n.id, { checkItems: (n.checkItems ?? []).filter((x) => x !== it) })} style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>}
                              </div>
                            ))
                          )}
                          {showCheckPresets && (
                            <div style={{ borderTop: '1px dashed #E5E7EB', marginTop: 2, paddingTop: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                              {REVIEW_CHECK_ITEMS.map((it) => (
                                <label key={it} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', cursor: readOnly ? 'default' : 'pointer' }}>
                                  <input type="checkbox" disabled={readOnly} checked={(n.checkItems ?? []).includes(it)}
                                    onChange={(e) => patchNode(n.id, { checkItems: e.target.checked ? [...(n.checkItems ?? []), it] : (n.checkItems ?? []).filter((x) => x !== it) })} />
                                  {it}
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                        {!readOnly && (
                          <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                            <input value={customCheck} onChange={(e) => setCustomCheck(e.target.value)} placeholder="自定义审核事项" style={{ ...inp, flex: 1 }} />
                            <button onClick={() => { const v = customCheck.trim(); if (v && !(n.checkItems ?? []).includes(v)) patchNode(n.id, { checkItems: [...(n.checkItems ?? []), v] }); setCustomCheck('') }} style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px', fontSize: 12, background: '#fff', cursor: 'pointer' }}>添加</button>
                            <button onClick={() => setShowCheckPresets((v) => !v)} style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, background: '#fff', cursor: 'pointer', whiteSpace: 'nowrap' }}>{showCheckPresets ? '收起预设' : '从预设选择'}</button>
                          </div>
                        )}
                      </div>
                      {/* 审批结果 → 状态映射（与「弹出内容·审批结果」合并，复选框即是否可选该结果） */}
                      <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 10, background: '#F9FAFB' }}>
                        <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>审批结果 → 状态映射（驱动运行时工单状态）</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                          {REVIEW_RESULTS.map((r) => {
                            const on = (n.results ?? REVIEW_RESULTS).includes(r)
                            return (
                              <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <input type="checkbox" disabled={readOnly} checked={on}
                                  onChange={(e) => { const cur = n.results ?? REVIEW_RESULTS; patchNode(n.id, { results: e.target.checked ? [...cur, r] : cur.filter((x) => x !== r) }) }} />
                                <span style={{ width: 42, fontSize: 12, color: '#374151' }}>{r}</span>
                                <span style={{ color: '#9CA3AF' }}>→</span>
                                <input disabled={readOnly} value={n.resultStates?.[r] ?? ''}
                                  onChange={(e) => patchNode(n.id, { resultStates: { ...(n.resultStates ?? {}), [r]: e.target.value } })}
                                  placeholder="操作后状态" list="statusEnumList" style={{ ...inp, flex: 1 }} />
                              </div>
                            )
                          })}
                        </div>
                        {!((n.results ?? REVIEW_RESULTS).length) && (
                          <div style={{ marginTop: 8 }}>
                            <label style={{ fontSize: 12, color: '#6B7280' }}>操作后的状态（未勾选任何审批结果，取自状态枚举类）
                              <input disabled={readOnly} value={n.postState ?? ''} onChange={(e) => patchNode(n.id, { postState: e.target.value })} placeholder="如 通过 / 已确认 / 待人工" list="statusEnumList" style={{ ...inp, marginTop: 4 }} />
                            </label>
                          </div>
                        )}
                        <div style={{ marginTop: 4, fontSize: 11, color: '#9CA3AF' }}>勾选即该结果可选；取值来自本分段「状态枚举类」；运行时按所选审批结果落地对应状态。</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#6B7280' }}>弹出内容 · 审批意见（按结果分组，可自定义）
                        <OpinionPresetsEditor node={n} patchNode={patchNode} readOnly={readOnly} />
                      </div>
                      <label style={{ fontSize: 12, color: '#6B7280' }}>附注
                        <input disabled={readOnly} value={n.note ?? ''} onChange={(e) => patchNode(n.id, { note: e.target.value })} placeholder="选填" style={{ ...inp, marginTop: 4 }} />
                      </label>
                    </>
                  )}
                  {!readOnly && n.type !== 'start' && (
                    <button onClick={() => removeNode(n.id)} style={{ padding: '5px 0', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626' }}>删除节点（含关联连线）</button>
                  )}
                </div>
              </div>
            )
          })()}
          {/* 连线属性弹层（点击图上连线后在图上弹出） */}
          {selectedEdge && (() => {
            const a = nodeMap.get(selectedEdge.from), b = nodeMap.get(selectedEdge.to)
            const mx = a && b ? (a.x + NODE_W / 2 + b.x + NODE_W / 2) / 2 : 400
            const my = a && b ? (a.y + NODE_H / 2 + b.y + NODE_H / 2) / 2 : 200
            const sx = offset.x + mx * scale, sy = offset.y + my * scale
            const cw = canvasRef.current?.clientWidth ?? 800, ch = CANVAS_H, W = 282
            const px = clamp(sx + 14, 8, Math.max(8, cw - W - 8))
            const py = clamp(sy - 60, 8, Math.max(8, ch - 300))
            return (
              <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: px, top: py, width: W, zIndex: 20, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', padding: 12, maxHeight: ch - 16, overflowY: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>连线属性</div>
                  <button onClick={(e) => { e.stopPropagation(); setSelEdge(null); setSelNode(null) }} style={{ border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ fontSize: 12, color: '#6B7280' }}>
                    {nodeMap.get(selectedEdge.from)?.label ?? '?'} → {nodeMap.get(selectedEdge.to)?.label ?? '?'}
                  </div>
                  <label style={{ fontSize: 12, color: '#6B7280' }}>连线标签
                    <input disabled={readOnly} value={selectedEdge.label ?? ''} onChange={(e) => patchEdge(selectedEdge.id, { label: e.target.value })} placeholder="如：通过 / 拒绝 / 退回" style={{ ...inp, marginTop: 4 }} />
                  </label>
                  <label style={{ fontSize: 12, color: '#6B7280' }}>流转条件（if）—— 起点审批结果等于此值时走该线；无条件则作为兜底
                    <select disabled={readOnly} value={selectedEdge.result ?? ''} onChange={(e) => patchEdge(selectedEdge.id, { result: e.target.value || undefined })} style={{ ...inp, marginTop: 4 }}>
                      <option value="">无条件（兜底）</option>
                      {REVIEW_RESULTS.map((r) => (
                        <option key={r} value={r}>审批结果 = {r}</option>
                      ))}
                    </select>
                    <span style={{ display: 'block', fontSize: 11, color: '#9CA3AF', marginTop: 3 }}>例：复审节点出两条线 —— 「通过」条件线 → 下一审核节点；「拒绝」条件线 → 结束（拒绝）。运行时按审批结果选线。</span>
                  </label>
                  {!readOnly && (
                    <button onClick={() => removeEdge(selectedEdge.id)} style={{ padding: '5px 0', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626' }}>删除连线</button>
                  )}
                </div>
              </div>
            )
          })()}
          {!selected && !selectedEdge && !readOnly && (
            <div style={{ position: 'absolute', left: 12, bottom: 12, fontSize: 12, color: '#9CA3AF', background: 'rgba(255,255,255,.82)', padding: '4px 8px', borderRadius: 6, pointerEvents: 'none' }}>
              点击节点 / 连线查看与编辑属性
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
