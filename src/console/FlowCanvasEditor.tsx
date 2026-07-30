/* ============================================================================
 * 自由画布流程编辑器（审核操作 · 每个评分分段一张图）
 * - 节点可拖拽；「＋节点」从顶部工具栏添加；点节点出属性面板（标题/角色/签核方式/动作/附注/删除）
 * - 连线：点起点节点右侧圆点进入连线模式，再点目标节点完成；点连线可改标签/删除
 * - 顶部「流程名称」输入框给当前业务流程取名（运行时即操作按钮标识）
 * - 视图工具栏：放大 / 缩小 / 全画幅（适应）/ 居中 / 全屏
 * - 纯前端实现，无第三方依赖；数据结构见 reportTemplateData.ts 的 FlowGraph
 * ========================================================================= */
import { useRef, useState } from 'react'
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
let seq = 0
const nid = () => `n_${Date.now().toString(36)}_${seq++}`
const eid = () => `e_${Date.now().toString(36)}_${seq++}`

// 审批意见预设编辑器：按审批结果分组，每组可增删选项（运行时另允许手输）
function OpinionPresetsEditor({ node, patchNode, readOnly }: {
  node: FlowGraphNode
  patchNode: (id: string, p: Partial<FlowGraphNode>) => void
  readOnly?: boolean
}) {
  const presets = node.opinionPresets ?? defaultOpinionPresets()
  const [draft, setDraft] = useState<Record<ReviewResult, string>>({ '通过': '', '驳回': '', '拒绝': '' })
  const setGroup = (r: ReviewResult, next: string[]) => patchNode(node.id, { opinionPresets: { ...presets, [r]: next } })
  return (
    <div style={{ marginTop: 4, border: '1px solid #E5E7EB', borderRadius: 6, padding: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {REVIEW_RESULTS.map((r) => (
        <div key={r}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', marginBottom: 3 }}>{r}时的审批意见</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {presets[r].map((o) => (
              <span key={o} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, background: '#F1F5F9', borderRadius: 12, padding: '2px 8px', color: '#374151' }}>
                {o}
                {!readOnly && <button onClick={() => setGroup(r, presets[r].filter((x) => x !== o))} style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0 }}>×</button>}
              </span>
            ))}
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

export default function FlowCanvasEditor({ graph, onChange, readOnly, statusEnum }: {
  graph: FlowGraph
  onChange: (g: FlowGraph) => void
  readOnly?: boolean
  statusEnum?: string[]
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [selNode, setSelNode] = useState<string | null>(null)
  const [selEdge, setSelEdge] = useState<string | null>(null)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)
  const [customCheck, setCustomCheck] = useState('')
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
      checkItems: ['资料完整性检查'],
      results: ['通过', '驳回', '拒绝'] as ReviewResult[],
      opinionPresets: defaultOpinionPresets(),
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
  const toggleFull = () => {
    const el = canvasRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen?.()
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
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
        </div>
      </div>

      {/* 属性面板 */}
      <div style={{ width: 260, flexShrink: 0, border: '1px solid #E5E7EB', borderRadius: 10, padding: 12, alignSelf: 'flex-start', minHeight: 200, maxHeight: CANVAS_H + 120, overflowY: 'auto' }}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: FLOW_NODE_TYPE_COLOR[selected.type].text }}>{FLOW_NODE_TYPE_LABEL[selected.type]}节点</div>
            <label style={{ fontSize: 12, color: '#6B7280' }}>节点标题（画布显示）
              <input disabled={readOnly} value={selected.label} onChange={(e) => patchNode(selected.id, { label: e.target.value })} style={{ ...inp, marginTop: 4 }} />
            </label>
            {selected.type === 'end' ? (
              <>
                <div style={{ fontSize: 12, color: '#6B7280', lineHeight: 1.7, background: '#F8FAFC', border: '1px solid #E5E7EB', borderRadius: 6, padding: '8px 10px' }}>
                  结束节点的状态<span style={{ color: '#DC2626' }}>无需在此配置</span>。<br />
                  最终状态由<span style={{ color: '#1D4ED8', fontWeight: 600 }}>上一决策节点</span>的「审批结果 → 状态」映射（resultStates）派生，流程走到此处即落地该状态。
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', cursor: readOnly ? 'default' : 'pointer' }}>
                  <input type="checkbox" disabled={readOnly} checked={selected.showButton ?? false}
                    onChange={(e) => patchNode(selected.id, { showButton: e.target.checked })} />
                  继续显示按钮（在结束状态展示操作按钮）
                </label>
              </>
            ) : (
              <>
                <label style={{ fontSize: 12, color: '#6B7280' }}>按钮名称（运行时操作按钮文案）
                  <input disabled={readOnly} value={selected.buttonName ?? ''} onChange={(e) => patchNode(selected.id, { buttonName: e.target.value })} placeholder={selected.label || '缺省同节点标题'} style={{ ...inp, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 12, color: '#6B7280' }}>经办角色
                  <select disabled={readOnly} value={selected.role} onChange={(e) => patchNode(selected.id, { role: e.target.value as ReviewRole })} style={{ ...inp, marginTop: 4 }}>
                    {REVIEW_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                <div style={{ fontSize: 12, color: '#6B7280' }}>弹出内容 · 审核事项
                  <div style={{ marginTop: 4, border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 132, overflowY: 'auto' }}>
                    {REVIEW_CHECK_ITEMS.map((it) => (
                      <label key={it} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', cursor: readOnly ? 'default' : 'pointer' }}>
                        <input type="checkbox" disabled={readOnly} checked={(selected.checkItems ?? []).includes(it)}
                          onChange={(e) => patchNode(selected.id, { checkItems: e.target.checked ? [...(selected.checkItems ?? []), it] : (selected.checkItems ?? []).filter((x) => x !== it) })} />
                        {it}
                      </label>
                    ))}
                    {(selected.checkItems ?? []).filter((x) => !(REVIEW_CHECK_ITEMS as readonly string[]).includes(x)).map((it) => (
                      <div key={it} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6, fontSize: 12, color: '#374151', background: '#F1F5F9', borderRadius: 4, padding: '2px 6px' }}>
                        <span>{it}</span>
                        {!readOnly && <button onClick={() => patchNode(selected.id, { checkItems: (selected.checkItems ?? []).filter((x) => x !== it) })} style={{ border: 'none', background: 'transparent', color: '#DC2626', cursor: 'pointer', fontSize: 13, lineHeight: 1, padding: 0 }}>×</button>}
                      </div>
                    ))}
                  </div>
                  {!readOnly && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                      <input value={customCheck} onChange={(e) => setCustomCheck(e.target.value)} placeholder="自定义审核事项" style={{ ...inp, flex: 1 }} />
                      <button onClick={() => { const v = customCheck.trim(); if (v && !(selected.checkItems ?? []).includes(v)) patchNode(selected.id, { checkItems: [...(selected.checkItems ?? []), v] }); setCustomCheck('') }} style={{ border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, background: '#fff', cursor: 'pointer' }}>添加</button>
                    </div>
                  )}
                </div>
                {/* 审批结果 + 状态映射：原两处分散配置，合并为一组 */}
                <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: 10, background: '#F9FAFB' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>审批结果与状态映射（驱动运行时工单状态）</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 2 }}>弹出内容 · 审批结果（可多选）
                    <div style={{ marginTop: 4, display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {REVIEW_RESULTS.map((r) => (
                        <label key={r} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', cursor: readOnly ? 'default' : 'pointer' }}>
                          <input type="checkbox" disabled={readOnly} checked={(selected.results ?? REVIEW_RESULTS).includes(r)}
                            onChange={(e) => { const cur = selected.results ?? REVIEW_RESULTS; patchNode(selected.id, { results: e.target.checked ? [...cur, r] : cur.filter((x) => x !== r) }) }} />
                          {r}
                        </label>
                      ))}
                    </div>
                  </div>
                  {(selected.results && selected.results.length) ? (
                    <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>审批结果 → 状态映射
                      <div style={{ marginTop: 4, border: '1px solid #E5E7EB', borderRadius: 6, padding: 6, display: 'flex', flexDirection: 'column', gap: 6, background: '#fff' }}>
                        {REVIEW_RESULTS.filter((r) => (selected.results ?? []).includes(r)).map((r) => (
                          <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 36, fontSize: 12, color: '#374151', flexShrink: 0 }}>{r}</span>
                            <span style={{ color: '#9CA3AF' }}>→</span>
                            <input disabled={readOnly} value={selected.resultStates?.[r] ?? ''}
                              onChange={(e) => patchNode(selected.id, { resultStates: { ...(selected.resultStates ?? {}), [r]: e.target.value } })}
                              placeholder="操作后状态" list="statusEnumList" style={{ ...inp, flex: 1 }} />
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 4, fontSize: 11, color: '#9CA3AF' }}>取值来自本分段「状态枚举类」；运行时按所选审批结果落地对应状态。</div>
                    </div>
                  ) : (
                    <div style={{ marginTop: 8 }}>
                      <label style={{ fontSize: 12, color: '#6B7280' }}>操作后的状态（取自状态枚举类）
                        <input disabled={readOnly} value={selected.postState ?? ''} onChange={(e) => patchNode(selected.id, { postState: e.target.value })} placeholder="如 通过 / 已确认 / 待人工" list="statusEnumList" style={{ ...inp, marginTop: 4 }} />
                      </label>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>弹出内容 · 审批意见（按结果分组，可自定义）
                  <OpinionPresetsEditor node={selected} patchNode={patchNode} readOnly={readOnly} />
                </div>
                <label style={{ fontSize: 12, color: '#6B7280' }}>附注
                  <input disabled={readOnly} value={selected.note ?? ''} onChange={(e) => patchNode(selected.id, { note: e.target.value })} placeholder="选填" style={{ ...inp, marginTop: 4 }} />
                </label>
              </>
            )}
            {!readOnly && selected.type !== 'start' && (
              <button onClick={() => removeNode(selected.id)} style={{ padding: '5px 0', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626' }}>删除节点（含关联连线）</button>
            )}
          </div>
        ) : selectedEdge ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1D4ED8' }}>连线</div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>
              {nodeMap.get(selectedEdge.from)?.label ?? '?'} → {nodeMap.get(selectedEdge.to)?.label ?? '?'}
            </div>
            <label style={{ fontSize: 12, color: '#6B7280' }}>连线标签
              <input disabled={readOnly} value={selectedEdge.label ?? ''} onChange={(e) => patchEdge(selectedEdge.id, { label: e.target.value })} placeholder="如：通过 / 拒绝 / 退回" style={{ ...inp, marginTop: 4 }} />
            </label>
            {!readOnly && (
              <button onClick={() => removeEdge(selectedEdge.id)} style={{ padding: '5px 0', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: '#FEF2F2', border: '1px solid #FCA5A5', color: '#DC2626' }}>删除连线</button>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 12, color: '#9CA3AF', lineHeight: 1.8 }}>
            点击节点或连线查看属性。<br />
            · 顶部按钮添加节点<br />
            · 拖动节点调整布局<br />
            · 点节点右侧 ● 再点目标节点即连线<br />
            · 画布右上角图标按钮可调整视图（放大 / 缩小 / 全画幅 / 居中 / 全屏）
          </div>
        )}
      </div>
    </div>
  )
}
