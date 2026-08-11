/* ============================================================================
 * 评分模型 · 决策图画板（算法编辑「可视化」tab）
 *
 * 只读画板（非编辑态）：把模型真实的【决策图】摆出来——
 *   - 多数据源并行、多个子分模型并行、多套规则集、规则碰撞冲突裁决、阈值分支、输出
 *   - 带缩放 / 平移工具条 + 图例，像真编辑器，但所有节点都是真实配置实体（不发明、不编辑）
 *   - 节点里的因子权重 / 规则命中次数 / 阈值动作 均来自本系统真实配置（与命中分析、评分阈值页同源）
 *   - 「规则碰撞 · 冲突裁决」节点可点击进入编辑抽屉：在模型配置阶段定义冲突如何生成预警，随 scoreData.json 持久化
 *   - 下方「决策映射表」把分数段 → 等级 → 动作 → 执行引擎 一一对应
 *
 * 纯前端、零依赖。
 * ========================================================================= */
import { useState } from 'react'
import type { ScoreProd, ModelMeta, ThresholdRow, CollisionRule, ScoreCardFactor } from './scoreData'
import { SCORE_PROD_LABEL, COLLISION_SEED, ZHIXIN_SCORECARD } from './scoreData'
import { MODEL_DECISION_GRAPH, GNODE_META, NODE_W, NODE_H, type GNode } from './modelGraphData'

/* 模型节点内渲染的「评分卡计分表」：直接读 model.bins（与 computeZhixin 同源），
 * 让决策图里画出来的算法 = 推演页里可验算的算法（基础分 600 + 各因子分箱→加分）。 */
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

export default function ModelDecisionGraph({
  prod, model, thresholds, onJumpRules, onJumpStrategy, onSaveCollisions,
}: {
  prod: ScoreProd
  model: ModelMeta
  thresholds: ThresholdRow[]
  onJumpRules: () => void
  onJumpStrategy: () => void
  onSaveCollisions: (rules: CollisionRule[]) => void
}) {
  const graph = MODEL_DECISION_GRAPH[prod]
  const [scale, setScale] = useState(1)
  const [editingCollision, setEditingCollision] = useState(false)
  const [localRules, setLocalRules] = useState<CollisionRule[]>([])
  const nodeMap = new Map<string, GNode>(graph.nodes.map((n) => [n.id, n]))

  const anchorR = (n: GNode) => ({ x: n.x + NODE_W, y: n.y + NODE_H / 2 })
  const anchorL = (n: GNode) => ({ x: n.x, y: n.y + NODE_H / 2 })
  const isAlertEdge = (e: { from: string; to: string }) =>
    nodeMap.get(e.from)?.type === 'collision' || nodeMap.get(e.to)?.type === 'collision'

  const rows = thresholds.filter((t) => t.prod === prod)

  /* 碰撞节点展示内容来自可配置的 collisionRules（旧数据缺失时回退到 COALLISION_SEED） */
  const effectiveRules = model.collisionRules?.length ? model.collisionRules : COLLISION_SEED[prod]
  const metaOf = (n: GNode): string[] => {
    if (n.type === 'collision' && effectiveRules.length) {
      return effectiveRules.map((r) => `${r.enabled ? '' : '【停用】'}${r.conflict} → ${r.result}`)
    }
    return n.meta ?? []
  }

  const openCollision = () => {
    setLocalRules(effectiveRules.map((r) => ({ ...r })))
    setEditingCollision(true)
  }
  const updateRule = (id: string, key: keyof CollisionRule, val: string) =>
    setLocalRules((rs) => rs.map((r) => (r.id === id ? { ...r, [key]: val } : r)))
  const toggleRule = (id: string) =>
    setLocalRules((rs) => rs.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)))
  const removeRule = (id: string) => setLocalRules((rs) => rs.filter((r) => r.id !== id))
  const addRule = () =>
    setLocalRules((rs) => [
      ...rs,
      { id: `cc-${Date.now().toString(36)}`, conflict: '', result: '', priority: '转人工', enabled: true },
    ])
  const saveCollision = () => {
    onSaveCollisions(localRules)
    setEditingCollision(false)
  }

  return (
    <div>
      {/* 工具条 */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-0.5">
          <button onClick={() => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)))} className="h-7 w-7 rounded-md text-slate-600 hover:bg-slate-100" title="缩小">−</button>
          <span className="w-12 text-center text-xs tabular-nums text-slate-500">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale((s) => Math.min(1.6, +(s + 0.1).toFixed(2)))} className="h-7 w-7 rounded-md text-slate-600 hover:bg-slate-100" title="放大">+</button>
          <button onClick={() => setScale(1)} className="h-7 rounded-md px-2 text-xs text-slate-600 hover:bg-slate-100" title="重置">重置</button>
        </div>
        <span className="text-xs text-slate-400">只读画板 · 每个节点均为真实配置（可缩放 / 滚动条平移；点击红色「规则碰撞」节点可编辑冲突裁决）</span>
        <div className="ml-auto flex flex-wrap items-center gap-3">
          {(['source', 'transform', 'model', 'ruleset', 'collision', 'decision', 'output'] as const).map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-xs text-slate-500">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: GNODE_META[t].color }} />
              {GNODE_META[t].label}
            </span>
          ))}
        </div>
      </div>

      {/* 画板（可平移的滚动视口 + 缩放画布） */}
      <div className="relative max-h-[560px] overflow-auto rounded-xl border border-slate-200 bg-[#FAFBFC]" style={{ backgroundImage: 'radial-gradient(#E2E8F0 1px, transparent 1px)', backgroundSize: '18px 18px' }}>
        <div style={{ width: graph.width * scale, height: graph.height * scale, position: 'relative', transform: `scale(${scale})`, transformOrigin: 'top left' }}>
          {/* 连线层 */}
          <svg width={graph.width} height={graph.height} className="pointer-events-none absolute left-0 top-0">
            {graph.edges.map((e, i) => {
              const a = anchorR(nodeMap.get(e.from)!)
              const b = anchorL(nodeMap.get(e.to)!)
              const alert = isAlertEdge(e)
              const midX = (a.x + b.x) / 2
              const d = `M ${a.x} ${a.y} C ${midX} ${a.y}, ${midX} ${b.y}, ${b.x} ${b.y}`
              const col = alert ? '#E11D48' : '#CBD5E1'
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke={col} strokeWidth={alert ? 2 : 1.5} strokeDasharray={e.dashed ? '5 4' : undefined} />
                  {e.label && (
                    <text x={midX} y={(a.y + b.y) / 2 - 6} textAnchor="middle" fontSize={11} fill={col}>{e.label}</text>
                  )}
                </g>
              )
            })}
          </svg>

          {/* 节点层 */}
          {graph.nodes.map((n) => {
            const meta = GNODE_META[n.type]
            const isModel = n.type === 'model'
            const cardBins = isModel ? (model.bins?.length ? model.bins : (prod === 'zhixin' ? ZHIXIN_SCORECARD : undefined)) : undefined
            const headerBg = isModel ? model.color : meta.color
            const isCollision = n.type === 'collision'
            return (
              <div
                key={n.id}
                className={`absolute flex flex-col overflow-hidden rounded-xl border bg-white shadow-sm ${isCollision ? 'cursor-pointer hover:border-rose-400 hover:ring-2 hover:ring-rose-200' : ''}`}
                style={{ left: n.x, top: n.y, width: NODE_W, height: NODE_H }}
                onClick={isCollision ? openCollision : undefined}
              >
                <div className="flex shrink-0 items-center justify-between rounded-t-xl px-3 py-1.5" style={{ background: headerBg }}>
                  <span className="text-xs font-semibold text-white">{n.title}</span>
                  <span className="flex items-center gap-1.5">
                    {isCollision && <span className="rounded bg-white/25 px-1 py-0.5 text-[10px] font-medium text-white">点击编辑</span>}
                    {n.badge && <span className="rounded-full bg-white/25 px-1.5 py-0.5 text-[10px] font-medium text-white">{n.badge}</span>}
                  </span>
                </div>
                <div className="min-h-0 flex-1 overflow-y-auto px-3 py-1.5">
                  {cardBins ? (
                    <ScoreCardView bins={cardBins} />
                  ) : (
                    <>
                      {n.subtitle && <div className="mb-1 text-[11px] text-slate-400">{n.subtitle}</div>}
                      <div className="space-y-0.5">
                        {metaOf(n).map((m, i) => (
                          <div key={i} className="whitespace-normal break-words text-[11px] leading-tight text-slate-600">{m}</div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 决策映射表 */}
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-3 py-2">
          <div className="text-sm font-semibold text-slate-800">决策映射 · 输出分数如何变成处置动作</div>
          <button onClick={onJumpStrategy} className="text-xs text-blue-600 hover:underline">在规则引擎配置 →</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-400">
              <th className="px-3 py-2 font-medium">分数段</th>
              <th className="px-3 py-2 font-medium">等级</th>
              <th className="px-3 py-2 font-medium">含义</th>
              <th className="px-3 py-2 font-medium">建议动作（阈值规则）</th>
              <th className="px-3 py-2 font-medium">执行引擎</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => (
              <tr key={t.range} className="border-t border-slate-50">
                <td className="px-3 py-2 tabular-nums text-slate-700">{t.range}</td>
                <td className="px-3 py-2 text-slate-700">{t.level}</td>
                <td className="px-3 py-2 text-slate-500">{t.meaning}</td>
                <td className="px-3 py-2 text-slate-700">{t.action}</td>
                <td className="px-3 py-2 text-sky-500">规则引擎 · 实时 API</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-3 py-2 text-[11px] text-slate-400">
          <span>阈值规则与预警规则均由规则引擎子系统统一执行（实时 API）；「规则碰撞 · 冲突裁决」节点在模型配置阶段即定义了冲突如何生成预警，点击该节点可编辑并持久化。链路实体均来自真实配置（scoreData.json / ruleHub.json），非示意。</span>
          <button onClick={onJumpRules} className="ml-3 shrink-0 text-xs text-blue-600 hover:underline">在规则引擎查看全部规则 →</button>
        </div>
      </div>

      {/* 规则碰撞 · 冲突裁决 编辑抽屉 */}
      {editingCollision && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setEditingCollision(false)}>
          <div className="flex h-full w-[460px] flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
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
                  <input
                    className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    placeholder="冲突条件（如：黑灰名单命中 ∩ XGB 中风险）"
                    value={r.conflict}
                    onChange={(e) => updateRule(r.id, 'conflict', e.target.value)}
                  />
                  <input
                    className="mb-2 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    placeholder="裁决结果 / 生成的预警（如：强制拒绝，生成欺诈预警）"
                    value={r.result}
                    onChange={(e) => updateRule(r.id, 'result', e.target.value)}
                  />
                  <select
                    className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm outline-none focus:border-brand-400"
                    value={r.priority}
                    onChange={(e) => updateRule(r.id, 'priority', e.target.value)}
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
  )
}
