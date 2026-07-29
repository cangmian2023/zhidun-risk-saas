/* ============================================================================
 * 自由画布流程编辑器（审核操作 · 每个评分分段一张图）
 * - 节点可拖拽；「＋节点」从顶部工具栏添加；点节点出属性面板（标题/角色/签核方式/动作/附注/删除）
 * - 连线：点起点节点右侧圆点进入连线模式，再点目标节点完成；点连线可改标签/删除
 * - 纯前端实现，无第三方依赖；数据结构见 reportTemplateData.ts 的 FlowGraph
 * ========================================================================= */
import { useRef, useState } from 'react'
import {
  FlowGraph, FlowGraphNode, FlowGraphEdge, FlowNodeType, FlowAutoAction,
  FLOW_NODE_TYPE_LABEL, FLOW_NODE_TYPE_COLOR, ReviewRole, REVIEW_ROLES,
  FlowCondField, FlowCondOp, FLOW_COND_FIELDS, FLOW_COND_OPS,
  REVIEW_CHECK_ITEMS, REVIEW_FORM_FIELDS, FlowTimeoutAction, FLOW_TIMEOUT_ACTIONS,
} from './reportTemplateData'

const NODE_W = 132
const NODE_H = 52
const CANVAS_H = 420

const inp: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', width: '100%' }

let seq = 0
const nid = () => `n_${Date.now().toString(36)}_${seq++}`
const eid = () => `e_${Date.now().toString(36)}_${seq++}`

export default function FlowCanvasEditor({ graph, onChange, readOnly }: {
  graph: FlowGraph
  onChange: (g: FlowGraph) => void
  readOnly?: boolean
}) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [selNode, setSelNode] = useState<string | null>(null)
  const [selEdge, setSelEdge] = useState<string | null>(null)
  const [linkFrom, setLinkFrom] = useState<string | null>(null)
  const dragRef = useRef<{ id: string; dx: number; dy: number } | null>(null)

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
      ...(type === 'manual' ? { role: REVIEW_ROLES[0], signMode: 'any' as const, checkItems: ['资料完整性检查'], formFields: ['审批意见（必填）'], timeoutHours: 24, timeoutAction: '仅提醒' as FlowTimeoutAction, returnable: false } : {}),
      ...(type === 'auto' ? { autoAction: '自动通过' as FlowAutoAction, cond: { field: '无条件（直接执行）' as FlowCondField, op: '≥' as FlowCondOp, value: '' } } : {}),
      ...(type === 'notify' ? { role: REVIEW_ROLES[3] } : {}),
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
    dragRef.current = { id: n.id, dx: ev.clientX - rect.left - n.x, dy: ev.clientY - rect.top - n.y }
    ;(ev.target as HTMLElement).setPointerCapture(ev.pointerId)
  }
  const onPointerMove = (ev: React.PointerEvent) => {
    const d = dragRef.current
    if (!d) return
    const rect = canvasRef.current!.getBoundingClientRect()
    const x = Math.max(0, Math.min(rect.width - NODE_W, ev.clientX - rect.left - d.dx))
    const y = Math.max(0, Math.min(CANVAS_H - NODE_H, ev.clientY - rect.top - d.dy))
    patchNode(d.id, { x: Math.round(x), y: Math.round(y) })
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

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {(['manual', 'auto', 'notify', 'end'] as FlowNodeType[]).map((t) => (
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
          onClick={(e) => { if (e.target === canvasRef.current) { setSelNode(null); setSelEdge(null); setLinkFrom(null) } }}
          style={{ position: 'relative', height: CANVAS_H, border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden', cursor: linkFrom ? 'crosshair' : 'default', background: '#FBFCFE', backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
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
                  {n.type === 'manual' && n.role ? ` · ${n.role}${n.signMode === 'all' ? '·会签' : ''}` : ''}
                  {n.type === 'auto' && n.autoAction ? ` · ${n.autoAction}${n.cond && n.cond.field !== '无条件（直接执行）' ? `（${n.cond.field}${n.cond.op}${n.cond.value}）` : ''}` : ''}
                  {n.type === 'notify' && n.role ? ` · ${n.role}` : ''}
                </div>
                {!readOnly && n.type !== 'end' && (
                  <div onClick={(ev) => { ev.stopPropagation(); setLinkFrom(n.id); setSelNode(null); setSelEdge(null) }} title="从此节点连线"
                    style={{ position: 'absolute', right: -7, top: NODE_H / 2 - 7, width: 14, height: 14, borderRadius: 999, background: linkFrom === n.id ? '#2563EB' : '#fff', border: '2px solid #2563EB', cursor: 'crosshair' }} />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* 属性面板 */}
      <div style={{ width: 260, flexShrink: 0, border: '1px solid #E5E7EB', borderRadius: 10, padding: 12, alignSelf: 'flex-start', minHeight: 200, maxHeight: CANVAS_H + 40, overflowY: 'auto' }}>
        {selected ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: FLOW_NODE_TYPE_COLOR[selected.type].text }}>{FLOW_NODE_TYPE_LABEL[selected.type]}节点</div>
            <label style={{ fontSize: 12, color: '#6B7280' }}>节点标题
              <input disabled={readOnly} value={selected.label} onChange={(e) => patchNode(selected.id, { label: e.target.value })} style={{ ...inp, marginTop: 4 }} />
            </label>
            {(selected.type === 'manual' || selected.type === 'notify') && (
              <label style={{ fontSize: 12, color: '#6B7280' }}>{selected.type === 'manual' ? '经办角色' : '抄送角色'}
                <select disabled={readOnly} value={selected.role} onChange={(e) => patchNode(selected.id, { role: e.target.value as ReviewRole })} style={{ ...inp, marginTop: 4 }}>
                  {REVIEW_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
            )}
            {selected.type === 'manual' && (
              <>
                <label style={{ fontSize: 12, color: '#6B7280' }}>签核方式
                  <select disabled={readOnly} value={selected.signMode ?? 'any'} onChange={(e) => patchNode(selected.id, { signMode: e.target.value as 'any' | 'all' })} style={{ ...inp, marginTop: 4 }}>
                    <option value="any">或签（一人通过即可）</option>
                    <option value="all">会签（须全部通过）</option>
                  </select>
                </label>
                <div style={{ fontSize: 12, color: '#6B7280' }}>审核事项（审核什么）
                  <div style={{ marginTop: 4, border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 118, overflowY: 'auto' }}>
                    {REVIEW_CHECK_ITEMS.map((it) => (
                      <label key={it} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', cursor: readOnly ? 'default' : 'pointer' }}>
                        <input type="checkbox" disabled={readOnly} checked={(selected.checkItems ?? []).includes(it)}
                          onChange={(e) => patchNode(selected.id, { checkItems: e.target.checked ? [...(selected.checkItems ?? []), it] : (selected.checkItems ?? []).filter((x) => x !== it) })} />
                        {it}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>审批表单（需填写内容）
                  <div style={{ marginTop: 4, border: '1px solid #E5E7EB', borderRadius: 6, padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: 4, maxHeight: 118, overflowY: 'auto' }}>
                    {REVIEW_FORM_FIELDS.map((it) => (
                      <label key={it} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', cursor: readOnly ? 'default' : 'pointer' }}>
                        <input type="checkbox" disabled={readOnly} checked={(selected.formFields ?? []).includes(it)}
                          onChange={(e) => patchNode(selected.id, { formFields: e.target.checked ? [...(selected.formFields ?? []), it] : (selected.formFields ?? []).filter((x) => x !== it) })} />
                        {it}
                      </label>
                    ))}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: '#6B7280' }}>超时处理
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <input type="number" disabled={readOnly} min={0} value={selected.timeoutHours ?? 0}
                      onChange={(e) => patchNode(selected.id, { timeoutHours: Math.max(0, +e.target.value) })}
                      style={{ ...inp, width: 64 }} title="小时，0=不限时" />
                    <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>小时后</span>
                    <select disabled={readOnly || !(selected.timeoutHours ?? 0)} value={selected.timeoutAction ?? '仅提醒'}
                      onChange={(e) => patchNode(selected.id, { timeoutAction: e.target.value as FlowTimeoutAction })} style={{ ...inp, flex: 1 }}>
                      {FLOW_TIMEOUT_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                  {!(selected.timeoutHours ?? 0) && <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>0 = 不限时</div>}
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#374151', cursor: readOnly ? 'default' : 'pointer' }}>
                  <input type="checkbox" disabled={readOnly} checked={selected.returnable ?? false}
                    onChange={(e) => patchNode(selected.id, { returnable: e.target.checked })} />
                  允许退回上一节点
                </label>
              </>
            )}
            {selected.type === 'auto' && (
              <>
                <div style={{ fontSize: 12, color: '#6B7280' }}>触发条件（满足才执行）
                  <select disabled={readOnly} value={selected.cond?.field ?? '无条件（直接执行）'}
                    onChange={(e) => patchNode(selected.id, { cond: { field: e.target.value as FlowCondField, op: selected.cond?.op ?? '≥', value: selected.cond?.value ?? '' } })}
                    style={{ ...inp, marginTop: 4 }}>
                    {FLOW_COND_FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select>
                  {selected.cond && selected.cond.field !== '无条件（直接执行）' && (
                    <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                      <select disabled={readOnly} value={selected.cond.op}
                        onChange={(e) => patchNode(selected.id, { cond: { ...selected.cond!, op: e.target.value as FlowCondOp } })} style={{ ...inp, width: 72 }}>
                        {FLOW_COND_OPS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                      <input disabled={readOnly} value={selected.cond.value}
                        onChange={(e) => patchNode(selected.id, { cond: { ...selected.cond!, value: e.target.value } })}
                        placeholder={selected.cond.op === '介于' ? '如 60 ~ 79' : '阈值 / 标签值'} style={{ ...inp, flex: 1 }} />
                    </div>
                  )}
                </div>
                <label style={{ fontSize: 12, color: '#6B7280' }}>自动动作
                  <select disabled={readOnly} value={selected.autoAction ?? '自动通过'} onChange={(e) => patchNode(selected.id, { autoAction: e.target.value as FlowAutoAction })} style={{ ...inp, marginTop: 4 }}>
                    {(['自动通过', '自动拒绝', '额度试算'] as FlowAutoAction[]).map((a) => <option key={a} value={a}>{a}</option>)}
                  </select>
                </label>
              </>
            )}
            <label style={{ fontSize: 12, color: '#6B7280' }}>附注
              <input disabled={readOnly} value={selected.note ?? ''} onChange={(e) => patchNode(selected.id, { note: e.target.value })} placeholder="选填" style={{ ...inp, marginTop: 4 }} />
            </label>
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
            · 点节点右侧 ● 再点目标节点即连线
          </div>
        )}
      </div>
    </div>
  )
}
