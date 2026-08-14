// 决策引擎 · 决策流可视化画板（只读）
// 把模型的【决策流 / 策略树】摆出来：数据源 → 特征 → 名单/评分卡/规则集 → 碰撞裁决 → 阈值决策 → 输出。
// 虚线边 = 并行支线（不阻塞主线）；点击节点弹出要点抽屉。
import { useState, useRef, useMemo } from 'react'
import type { DeFlowGraph, DeFlowNode, DeFlowNodeType } from './decisionData'

export const FLOW_NODE_W = 224
export const FLOW_NODE_H = 128

export const FLOW_NODE_META: Record<DeFlowNodeType, { label: string; color: string }> = {
  source: { label: '数据源', color: '#0EA5E9' },
  feature: { label: '特征工程', color: '#8B5CF6' },
  list: { label: '名单匹配', color: '#E11D48' },
  scorecard: { label: '评分卡 / 模型', color: '#334155' },
  ruleset: { label: '规则集', color: '#F59E0B' },
  collision: { label: '规则碰撞 · 冲突裁决', color: '#B91C1C' },
  decision: { label: '阈值决策', color: '#475569' },
  output: { label: '决策输出', color: '#16A34A' },
  subflow: { label: '子流程', color: '#f59e0b' },
}

export default function DecisionFlowGraph({ graph }: { graph: DeFlowGraph }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.85)
  const [selected, setSelected] = useState<DeFlowNode | null>(null)

  const nodeMap = useMemo(() => new Map(graph.nodes.map((n) => [n.id, n])), [graph])
  const anchorR = (n: DeFlowNode) => ({ x: n.x + FLOW_NODE_W, y: n.y + FLOW_NODE_H / 2 })
  const anchorL = (n: DeFlowNode) => ({ x: n.x, y: n.y + FLOW_NODE_H / 2 })
  const isDashed = (e: { from: string; to: string }) =>
    nodeMap.get(e.from)?.type === 'collision' || nodeMap.get(e.from)?.type === 'output' || !!graph.edges.find((x) => x.from === e.from && x.to === e.to)?.dashed

  const fit = () => {
    const el = wrapRef.current
    if (!el) return
    const avail = Math.max(el.clientWidth - 40, 600)
    setScale(Math.min(avail / graph.width, 1))
  }

  return (
    <div ref={wrapRef} className="overflow-auto rounded-xl border border-slate-100">
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50/60 px-3 py-2">
        <div className="text-xs text-slate-400">虚线边 = 并行支线，不阻塞主线 · 点击节点查看要点</div>
        <div className="flex items-center gap-1">
          <button onClick={() => setScale((s) => Math.max(0.4, +(s - 0.15).toFixed(2)))} className="rounded px-2 py-1 text-xs text-slate-500 ring-1 ring-slate-200 hover:text-slate-700">−</button>
          <span className="w-10 text-center text-xs text-slate-500">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(1.5, +(s + 0.15).toFixed(2)))} className="rounded px-2 py-1 text-xs text-slate-500 ring-1 ring-slate-200 hover:text-slate-700">+</button>
          <button onClick={fit} className="ml-1 rounded px-2 py-1 text-xs text-slate-500 ring-1 ring-slate-200 hover:text-slate-700">适应</button>
        </div>
      </div>

      <div className="relative" style={{ width: graph.width, height: graph.height }}>
        <svg width={graph.width} height={graph.height} className="absolute inset-0">
          <defs>
            <marker id="flow-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
            </marker>
            <marker id="flow-arrow-dash" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0,0 L10,5 L0,10 z" fill="#0891B2" />
            </marker>
          </defs>
          {graph.edges.map((e, i) => {
            const from = nodeMap.get(e.from)
            const to = nodeMap.get(e.to)
            if (!from || !to) return null
            const a = anchorR(from)
            const b = anchorL(to)
            const dashed = isDashed(e)
            const mx = (a.x + b.x) / 2
            const path = `M ${a.x} ${a.y} C ${mx} ${a.y}, ${mx} ${b.y}, ${b.x} ${b.y}`
            return (
              <g key={i}>
                <path d={path} fill="none" stroke={dashed ? '#0891B2' : '#94a3b8'} strokeWidth={1.5}
                  strokeDasharray={dashed ? '5 4' : undefined} markerEnd={dashed ? 'url(#flow-arrow-dash)' : 'url(#flow-arrow)'} />
                {e.label && (
                  <text x={mx} y={(a.y + b.y) / 2 - 6} textAnchor="middle" fontSize="11" fill={dashed ? '#0891B2' : '#94a3b8'}>
                    {e.label}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {graph.nodes.map((n) => {
          const meta = FLOW_NODE_META[n.type]
          return (
            <div key={n.id}
              onClick={() => setSelected(n)}
              className="absolute cursor-pointer rounded-xl border bg-white p-3 shadow-card transition hover:shadow-lg"
              style={{ left: n.x, top: n.y, width: FLOW_NODE_W, height: FLOW_NODE_H, borderColor: `${meta.color}33`, borderTopWidth: 3, borderTopColor: meta.color }}>
              <div className="flex items-center gap-1.5">
                <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ background: meta.color }}>{meta.label}</span>
                {n.badge && <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{n.badge}</span>}
              </div>
              <div className="mt-1.5 text-[13px] font-semibold leading-tight text-ink-900">{n.title}</div>
              {n.subtitle && <div className="text-[11px] text-slate-400">{n.subtitle}</div>}
              <div className="mt-1.5 space-y-0.5">
                {(n.meta ?? []).slice(0, 3).map((m, i) => (
                  <div key={i} className="truncate text-[11px] leading-tight text-slate-500">{m}</div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {selected && (
        <div className="absolute right-0 top-0 z-10 h-full w-72 overflow-y-auto border-l border-slate-100 bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="rounded px-1.5 py-0.5 text-[10px] font-medium text-white" style={{ background: FLOW_NODE_META[selected.type].color }}>{FLOW_NODE_META[selected.type].label}</span>
            <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
          <div className="mt-2 text-sm font-semibold text-ink-900">{selected.title}</div>
          {selected.subtitle && <div className="text-xs text-slate-400">{selected.subtitle}</div>}
          <div className="mt-3 space-y-1.5">
            {(selected.meta ?? []).map((m, i) => (
              <div key={i} className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-600">{m}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
