// 决策引擎 · 决策流编辑器（可视化决策编排）
// 左侧节点面板拖拽添加节点 → 画布自由排布 → 右侧属性面板编辑。
// 与样例交互一致：开始/结束/策略/名单匹配/条件/并行网关/合并网关/特征/子流程。
import { useState, useRef, useEffect, useCallback } from 'react'
import type { DeFlowGraph, DeFlowNode, DeFlowNodeType } from './decisionData'

const NODE_DEFS: { type: DeFlowNodeType; label: string; color: string; icon: string }[] = [
  { type: 'source', label: '开始节点', color: '#1890ff', icon: '▶' },
  { type: 'output', label: '结束节点', color: '#52c41a', icon: '✔' },
  { type: 'ruleset', label: '策略节点', color: '#fa8c16', icon: '盾' },
  { type: 'list', label: '名单匹配', color: '#f5222d', icon: '搜' },
  { type: 'decision', label: '条件节点', color: '#eb2f96', icon: '⊕' },
  { type: 'collision', label: '并行网关', color: '#722ed1', icon: '▤' },
  { type: 'feature', label: '合并网关', color: '#eb2f96', icon: '⬌' },
  { type: 'scorecard', label: '特征节点', color: '#13c2c2', icon: '≡' },
  { type: 'subflow', label: '子流程', color: '#fa8c16', icon: '▦' },
]

const NODE_W = 200
const NODE_H = 96

function NodeCard({ n, selected, onSelect, onMove, editing, onRename }: {
  n: DeFlowNode; selected: boolean; onSelect: () => void; onMove: (dx: number, dy: number) => void;
  editing: boolean; onRename: (v: string) => void;
}) {
  const def = NODE_DEFS.find((x) => x.type === n.type) ?? NODE_DEFS[0]
  return (
    <div
      onMouseDown={(e) => {
        const startX = e.clientX, startY = e.clientY
        const move = (ev: MouseEvent) => onMove(ev.clientX - startX, ev.clientY - startY)
        const up = () => { window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up) }
        window.addEventListener('mousemove', move)
        window.addEventListener('mouseup', up)
      }}
      onClick={onSelect}
      className="absolute cursor-move rounded-xl border bg-white shadow-card transition hover:shadow-lg"
      style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H, borderColor: `${def.color}33`, borderTopWidth: 3, borderTopColor: def.color, outline: selected ? `2px solid ${def.color}` : undefined }}
    >
      <div className="flex items-center gap-1.5 p-2">
        <span className="grid h-6 w-6 place-items-center rounded-md text-xs font-bold text-white" style={{ background: def.color }}>{def.icon}</span>
        {editing ? (
          <input defaultValue={n.title} autoFocus onBlur={(e) => onRename(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
            className="w-full rounded border border-slate-200 px-1 py-0.5 text-xs focus:outline-none" />
        ) : (
          <span className="text-xs font-medium text-ink-900">{n.title}</span>
        )}
      </div>
      {n.meta && n.meta.length > 0 && (
        <div className="px-2 pb-2">
          <div className="line-clamp-2 text-[10px] leading-tight text-slate-400">{n.meta.join(' · ')}</div>
        </div>
      )}
    </div>
  )
}

export default function DecisionFlowEditor({ flow, onSave, onPublish, flowName, onRenameFlow }: {
  flow: DeFlowGraph;
  onSave: (g: DeFlowGraph) => void;
  onPublish: (g: DeFlowGraph) => void;
  flowName: string;
  onRenameFlow: (v: string) => void;
}) {
  const [g, setG] = useState<DeFlowGraph>(() => JSON.parse(JSON.stringify(flow)))
  const [scale, setScale] = useState(1)
  const [selected, setSelected] = useState<string | null>(null)
  const [editingName, setEditingName] = useState(false)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const fit = useCallback(() => {
    const el = canvasRef.current
    if (!el) return
    const avail = Math.max(el.clientWidth - 40, 600)
    setScale(Math.min(avail / (g.width || 1000), 1.2))
  }, [g.width])

  useEffect(() => { fit() }, [fit])

  const addNode = (type: DeFlowNodeType) => {
    const def = NODE_DEFS.find((x) => x.type === type)!
    const id = `node_${Date.now()}`
    const n: DeFlowNode = {
      id, type,
      title: def.label.replace('节点', ''),
      subtitle: '',
      meta: type === 'list' ? ['命中黑名单 → 拒绝'] : [],
      x: 60 + (g.nodes.length % 3) * 240,
      y: 60 + Math.floor(g.nodes.length / 3) * 140,
    }
    setG((prev) => ({ ...prev, nodes: [...prev.nodes, n] }))
    setSelected(id)
  }

  const moveNode = (id: string, dx: number, dy: number) => {
    setG((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) => (n.id === id ? { ...n, x: Math.max(0, n.x + dx), y: Math.max(0, n.y + dy) } : n)),
    }))
  }

  const connect = (from: string, to: string) => {
    setG((prev) => {
      if (prev.edges.some((e) => e.from === from && e.to === to)) return prev
      return { ...prev, edges: [...prev.edges, { from, to }] }
    })
  }

  const sel = g.nodes.find((n) => n.id === selected) ?? null

  return (
    <div className="flex h-[calc(100vh-120px)] min-h-[520px] flex-col overflow-hidden rounded-xl border border-slate-100 bg-white">
      {/* 顶部工具条 */}
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
          <button onClick={() => { onSave(g); setEditingName(false) }} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:border-brand-300 hover:text-brand-600">保 存</button>
          <button onClick={() => { onPublish(g); setEditingName(false) }} className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm text-white hover:bg-brand-700">发 布</button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* 左侧节点面板 */}
        <div className="w-44 shrink-0 space-y-1 overflow-y-auto border-r border-slate-100 p-3">
          <div className="mb-2 text-xs font-medium text-slate-400">节点面板</div>
          {NODE_DEFS.map((d) => (
            <div key={d.type}
              onClick={() => addNode(d.type)}
              className="flex cursor-grab items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-2.5 py-2 text-sm text-slate-600 transition hover:border-brand-300 hover:bg-white">
              <span className="grid h-5 w-5 place-items-center rounded text-[10px] font-bold text-white" style={{ background: d.color }}>{d.icon}</span>
              <span>{d.label}</span>
            </div>
          ))}
        </div>

        {/* 中部画布 */}
        <div ref={canvasRef} className="relative flex-1 overflow-hidden bg-slate-50/40"
          onWheel={(e) => { e.preventDefault(); setScale((s) => Math.min(2, Math.max(0.4, s * (e.deltaY < 0 ? 1.08 : 0.92)))) }}>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle, #cbd5e1 1px, transparent 1px)', backgroundSize: '24px 24px',
          }} />
          <div className="absolute" style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0', width: g.width || 1000, height: g.height || 500 }}>
            <svg width={g.width || 1000} height={g.height || 500} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
              {g.edges.map((e, i) => {
                const f = g.nodes.find((n) => n.id === e.from)
                const t = g.nodes.find((n) => n.id === e.to)
                if (!f || !t) return null
                const a = { x: f.x + NODE_W, y: f.y + NODE_H / 2 }
                const b = { x: t.x, y: t.y + NODE_H / 2 }
                const mx = (a.x + b.x) / 2
                const d = `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
                return <path key={i} d={d} fill="none" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="5 4" />
              })}
            </svg>
            {g.nodes.map((n) => (
              <NodeCard key={n.id} n={n} selected={selected === n.id}
                onSelect={() => { setSelected(n.id); setEditingNode(null) }}
                onMove={(dx, dy) => moveNode(n.id, dx, dy)}
                editing={editingNode === n.id}
                onRename={(v) => { setG((prev) => ({ ...prev, nodes: prev.nodes.map((x) => x.id === n.id ? { ...x, title: v } : x) })); setEditingNode(null) }}
              />
            ))}
          </div>

          <div className="absolute bottom-4 left-4 flex flex-col gap-1 rounded-lg border border-slate-200 bg-white p-1 shadow-card">
            <button onClick={() => setScale((s) => Math.min(2, +(s + 0.15).toFixed(2)))} className="grid h-7 w-7 place-items-center rounded text-sm text-slate-500 hover:bg-slate-50">+</button>
            <button onClick={() => setScale((s) => Math.max(0.4, +(s - 0.15).toFixed(2)))} className="grid h-7 w-7 place-items-center rounded text-sm text-slate-500 hover:bg-slate-50">−</button>
            <button onClick={fit} className="grid h-7 w-7 place-items-center rounded text-sm text-slate-500 hover:bg-slate-50">⤢</button>
          </div>
        </div>

        {/* 右侧属性面板 */}
        <div className="w-72 shrink-0 border-l border-slate-100 p-4">
          {sel ? (
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ background: NODE_DEFS.find((x) => x.type === sel.type)?.color }}>{sel.type}</span>
                <div className="flex gap-2">
                  <button onClick={() => { setEditingNode(sel.id); setSelected(null) }} className="text-xs text-brand-600 hover:underline">编辑</button>
                  <button onClick={() => setG((prev) => ({ ...prev, nodes: prev.nodes.filter((n) => n.id !== sel.id), edges: prev.edges.filter((e) => e.from !== sel.id && e.to !== sel.id) }))} className="text-xs text-rose-600 hover:underline">删除</button>
                </div>
              </div>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-slate-400">节点名称</label>
                  <input value={sel.title} onChange={(e) => setG((prev) => ({ ...prev, nodes: prev.nodes.map((n) => n.id === sel.id ? { ...n, title: e.target.value } : n) }))}
                    className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm focus:border-brand-300 focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">节点 ID</label>
                  <code className="block w-full rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500">{sel.id}</code>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-slate-400">连接到</label>
                  <div className="max-h-32 space-y-1 overflow-y-auto">
                    {g.nodes.filter((n) => n.id !== sel.id).map((n) => (
                      <label key={n.id} className="flex items-center gap-2 text-xs text-slate-600">
                        <input type="checkbox" checked={g.edges.some((e) => e.from === sel.id && e.to === n.id)}
                          onChange={(ev) => ev.target.checked ? connect(sel.id, n.id) : setG((prev) => ({ ...prev, edges: prev.edges.filter((e) => !(e.from === sel.id && e.to === n.id)) }))} />
                        <span className="truncate">{n.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-xs text-slate-400">
              <p className="mb-1 text-lg">◈</p>
              点击节点或连线查看属性
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
