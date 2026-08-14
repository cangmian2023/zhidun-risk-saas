import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import type {
  CustRelationGraph,
  CustGraphNode,
  CustGraphEdge,
  GraphTheme,
} from './custProfileData'

// 时间段筛选：以图谱采集时间（collectedAt）为"现在"，仅保留起止日期选择框，默认近一年
// 从 "2026-08-10 02:15（T+1 批跑）" 中解析采集日期作为时间基准
function parseCollectedAt(s: string): Date {
  const m = /(\d{4}-\d{2}-\d{2})/.exec(s)
  if (!m) return new Date(2026, 7, 10)
  const [y, mo, d] = m[1].split('-').map(Number)
  return new Date(y, mo - 1, d)
}
function fmtDate(d: Date): string {
  const y = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${day}`
}
function cutoffOf(now: Date, days: number): string {
  if (!isFinite(days)) return ''
  const d = new Date(now)
  d.setDate(d.getDate() - days)
  return fmtDate(d)
}
// 颜色加深/提亮（percent<0 加深，>0 提亮），用于主题按钮渐变
function shade(hex: string, percent: number): string {
  const h = hex.replace('#', '')
  if (h.length !== 6) return hex
  const num = parseInt(h, 16)
  let r = (num >> 16) & 0xff
  let g = (num >> 8) & 0xff
  let b = num & 0xff
  const t = percent < 0 ? 0 : 255
  const p = Math.abs(percent) / 100
  r = Math.round((t - r) * p + r)
  g = Math.round((t - g) * p + g)
  b = Math.round((t - b) * p + b)
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}
// 关系是否满足时间窗口 [lo, hi]（无 since 视为常驻、永远命中；lo/hi 缺省代表开区间）
function inWindow(since: string | undefined, lo: string | undefined, hi: string | undefined): boolean {
  if (!since) return true
  if (lo && since < lo) return false
  if (hi && since > hi) return false
  return true
}

const TYPE_COLOR: Record<string, string> = {
  self: '#8B5CF6',
  person: '#7C3AED',
  company: '#2563EB',
  account: '#0EA5E9',
  device: '#F59E0B',
  product: '#10B981',
  org: '#64748B',
}
const TYPE_LABEL: Record<string, string> = {
  self: '本人',
  person: '个人',
  company: '企业',
  account: '账户',
  device: '设备',
  product: '产品',
  org: '机构',
}
const THEME_COLOR: Record<string, string> = {
  家族: '#7C3AED',
  社交: '#0EA5E9',
  资金: '#10B981',
  经营: '#2563EB',
  共债: '#DC2626',
  担保: '#D97706',
  设备: '#F59E0B',
}

// 综合视图下，每个节点归属到哪个主题分组（按与"本人"的关系就近归类）
const GROUP_PRIORITY = ['经营', '共债', '担保', '家族', '社交', '设备', '资金']
function primaryGroup(nodeId: string, edges: CustGraphEdge[], theme: GraphTheme): string {
  if (theme !== '综合') return theme
  const selfEdges = edges.filter(
    (e) => (e.source === 'self' && e.target === nodeId) || (e.target === 'self' && e.source === nodeId),
  )
  for (const g of GROUP_PRIORITY) if (selfEdges.some((e) => e.theme === g)) return g
  if (selfEdges.length) return selfEdges[0].theme
  const any = edges.find((e) => e.source === nodeId || e.target === nodeId)
  return any ? any.theme : '社交'
}

function chipW(name: string) {
  return Math.min(128, 26 + [...name].length * 11)
}

type GraphSelection = { kind: 'node'; node: CustGraphNode } | { kind: 'edge'; edge: CustGraphEdge }

export function RelationGraphView({
  graph,
  theme,
  onTheme,
  sel,
  onPick,
  nodeMap,
}: {
  graph: CustRelationGraph
  theme: GraphTheme
  onTheme: (t: GraphTheme) => void
  sel: GraphSelection | null
  onPick: (s: GraphSelection | null) => void
  nodeMap: Record<string, CustGraphNode>
}) {
  const W = 820
  const H = 520
  const cx = W / 2
  const cy = H / 2

  // 时间段筛选：仅保留起止日期选择框，默认最近一年（采集日 - 365 天 ~ 采集日）
  const now = useMemo(() => parseCollectedAt(graph.collectedAt), [graph.collectedAt])
  const nowStr = useMemo(() => fmtDate(now), [now])
  const defStart = useMemo(() => cutoffOf(now, 365), [now])
  const [customStart, setCustomStart] = useState(defStart)
  const [customEnd, setCustomEnd] = useState(nowStr)
  const periodInfo = useMemo(() => {
    const lo = customStart || defStart
    const hi = customEnd || nowStr
    return { lo, hi }
  }, [customStart, customEnd, defStart, nowStr])

  // ---- 确定性「分组放射」布局：本人居中，按主题分扇区排布，避免堆挤 ----
  const { nodes, pos, highRisk } = useMemo(() => {
    let active = theme === '综合' ? graph.edges : graph.edges.filter((e) => e.theme === theme)
    // 时间段筛选：仅保留落在时间窗口 [lo, hi] 内的关系（无 since 默认常驻）
    if (periodInfo.lo || periodInfo.hi) {
      active = active.filter((e) => inWindow(e.since, periodInfo.lo, periodInfo.hi))
    }
    const activeIds = new Set<string>(['self'])
    active.forEach((e) => {
      activeIds.add(e.source)
      activeIds.add(e.target)
    })
    const ns = graph.nodes.filter((n) => activeIds.has(n.id))
    const ps: Record<string, { x: number; y: number }> = {}
    const self = ns.find((n) => n.type === 'self')
    if (self) ps[self.id] = { x: cx, y: cy }

    const grp: Record<string, CustGraphNode[]> = {}
    ns.filter((n) => n.type !== 'self').forEach((n) => {
      const g = primaryGroup(n.id, active, theme)
      ;(grp[g] ??= []).push(n)
    })
    const order = (theme === '综合' ? Object.keys(THEME_COLOR) : [theme]).filter(
      (g) => (grp[g]?.length ?? 0) > 0,
    )
    const total = order.reduce((s, g) => s + Math.sqrt(grp[g].length), 0) || 1
    let angle = -Math.PI / 2
    const R1 = 140
    const R2 = 214
    order.forEach((g) => {
      const cnt = grp[g].length
      const span = (Math.sqrt(cnt) / total) * Math.PI * 2
      const start = angle + span * 0.14
      const end = angle + span * 0.86
      grp[g].forEach((n, i) => {
        const t = cnt === 1 ? 0.5 : i / (cnt - 1)
        const a = start + t * (end - start)
        const ring = i % 2 === 0 ? R1 : R2
        ps[n.id] = { x: cx + Math.cos(a) * ring, y: cy + Math.sin(a) * ring }
      })
      angle += span
    })
    const hr = ns.filter((n) => n.risk === '高危').length
    return { nodes: ns, pos: ps, highRisk: hr }
  }, [graph, theme, periodInfo])

  const persons = useMemo(() => nodes.filter((n) => n.type !== 'self'), [nodes])

  const rowRefs = useRef<Record<string, HTMLDivElement | null>>({})
  useEffect(() => {
    if (sel?.kind === 'node') rowRefs.current[sel.node.id]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [sel])

  const themeList = graph.themes ?? ['综合']
  // 与布局保持一致的「主题 + 时间段」双重过滤后的关系集合（用于连线渲染与计数）
  const active = useMemo(() => {
    let es = theme === '综合' ? graph.edges : graph.edges.filter((e) => e.theme === theme)
    if (periodInfo.lo || periodInfo.hi) es = es.filter((e) => inWindow(e.since, periodInfo.lo, periodInfo.hi))
    return es
  }, [graph.edges, theme, periodInfo])

  // 连线：以中心为参照向外微弯，呈花瓣状，避免穿过中心堆叠
  const edgePath = (ax: number, ay: number, bx: number, by: number) => {
    const mx = (ax + bx) / 2
    const my = (ay + by) / 2
    const dx = mx - cx
    const dy = my - cy
    const len = Math.hypot(dx, dy) || 1
    const push = Math.min(44, len * 0.16)
    const cxp = mx + (dx / len) * push
    const cyp = my + (dy / len) * push
    return `M ${ax} ${ay} Q ${cxp} ${cyp} ${bx} ${by}`
  }

  return (
    <div>
      {/* 元数据（精简：去掉采集时间 / 时间范围展示） */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 14,
          alignItems: 'center',
          fontSize: 12,
          color: '#64748B',
          marginBottom: 8,
        }}
      >
        <span>
          📡 来源：<b style={{ color: '#334155' }}>{graph.source}</b>
        </span>
        <span>
          节点 <b style={{ color: '#334155' }}>{nodes.length}</b>
        </span>
        <span>
          关系 <b style={{ color: '#334155' }}>{active.length}</b>
        </span>
        {highRisk > 0 && (
          <span style={{ color: '#DC2626', fontWeight: 600 }}>高危节点 {highRisk}</span>
        )}
      </div>

      {/* 控制条：图谱主题 + 时间段 合并到同一行 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: '#94A3B8', marginRight: 2 }}>图谱主题</span>
        {themeList.map((th) => {
          const on = th === theme
          const col = THEME_COLOR[th] ?? '#8B5CF6'
          return (
            <button
              key={th}
              title={th}
              onClick={() => {
                onTheme(th)
                onPick(null)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                fontSize: 12,
                padding: '6px 14px',
                borderRadius: 10,
                border: 'none',
                background: `linear-gradient(135deg, ${col} 0%, ${shade(col, -16)} 100%)`,
                color: '#fff',
                cursor: 'pointer',
                fontWeight: on ? 700 : 500,
                opacity: on ? 1 : 0.5,
                boxShadow: on ? `0 0 0 2px #fff, 0 0 0 4px ${col}, 0 4px 10px ${col}55` : '0 1px 3px rgba(15,23,42,.12)',
                transform: on ? 'scale(1.06)' : 'scale(1)',
                transition: 'all .15s ease',
              }}
            >
              {on && <span style={{ fontSize: 11, lineHeight: 1 }}>✓</span>}
              {th}
            </button>
          )
        })}
        <span style={{ width: 1, height: 18, background: '#E2E8F0', margin: '0 6px' }} />
        <span style={{ fontSize: 12, color: '#94A3B8', marginRight: 2 }}>时间段</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginLeft: 4 }}>
          <input
            type="date"
            value={customStart}
            max={customEnd || nowStr}
            onChange={(e) => setCustomStart(e.target.value)}
            style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, border: '1px solid #E2E8F0', color: '#475569' }}
          />
          <span style={{ color: '#94A3B8', fontSize: 12 }}>~</span>
          <input
            type="date"
            value={customEnd}
            min={customStart || undefined}
            max={nowStr}
            onChange={(e) => setCustomEnd(e.target.value)}
            style={{ fontSize: 12, padding: '4px 8px', borderRadius: 8, border: '1px solid #E2E8F0', color: '#475569' }}
          />
        </span>
      </div>

      {/* 主体：图谱 + 关系人清单（高度对齐，右列拉伸至与左图一致） */}
      <div style={{ display: 'flex', gap: 18, alignItems: 'stretch', flexWrap: 'wrap' }}>
        {/* 左：图谱 */}
        <div style={{ flex: '1 1 520px', minWidth: 480, position: 'relative' }}>
          <svg
          viewBox={`0 0 ${W} ${H}`}
          style={{
            width: '100%',
            height: 'auto',
            background: 'radial-gradient(circle at 50% 45%, #FBFCFE 0%, #EEF2F7 100%)',
            borderRadius: 14,
            border: '1px solid #E2E8F0',
            display: 'block',
          }}
          onClick={() => onPick(null)}
        >
          {/* 连线 */}
          {active.map((e, i) => {
            const a = pos[e.source]
            const b = pos[e.target]
            if (!a || !b) return null
            const inc = sel?.kind === 'node' && (e.source === sel.node.id || e.target === sel.node.id)
            const isSel = sel?.kind === 'edge' && sel.edge === e
            const dim = sel ? !inc && !isSel : false
            const col = e.danger ? '#DC2626' : THEME_COLOR[e.theme] ?? '#CBD5E1'
            const d = edgePath(a.x, a.y, b.x, b.y)
            const mx = (a.x + b.x) / 2
            const my = (a.y + b.y) / 2
            return (
              <g
                key={i}
                style={{ cursor: 'pointer' }}
                onClick={(ev) => {
                  ev.stopPropagation()
                  onPick({ kind: 'edge', edge: e })
                }}
              >
                <path
                  d={d}
                  fill="none"
                  stroke={col}
                  strokeWidth={isSel ? 3 : inc ? 2.4 : e.danger ? 1.8 : 1.2}
                  strokeDasharray={e.danger ? '5 3' : undefined}
                  strokeOpacity={dim ? 0.14 : inc || isSel ? 1 : 0.62}
                />
                <path d={d} fill="none" stroke="transparent" strokeWidth={14} />
                {e.danger && (
                  <text
                    x={mx}
                    y={my - 4}
                    textAnchor="middle"
                    fontSize={9}
                    fontWeight={700}
                    fill="#DC2626"
                    style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}
                  >
                    {e.rel}
                  </text>
                )}
              </g>
            )
          })}

          {/* 节点（卡片式） */}
          {nodes.map((n) => {
            const p = pos[n.id]
            if (!p) return null
            const c = TYPE_COLOR[n.type] ?? '#64748B'
            const isSelf = n.type === 'self'
            const seld = sel?.kind === 'node' && sel.node.id === n.id
            const w = isSelf ? Math.min(150, 34 + [...n.name].length * 13) : chipW(n.name)
            const h = isSelf ? 36 : 28
            return (
              <g
                key={n.id}
                transform={`translate(${p.x},${p.y})`}
                style={{ cursor: 'pointer' }}
                onClick={(ev) => {
                  ev.stopPropagation()
                  onPick({ kind: 'node', node: n })
                }}
              >
                {seld && (
                  <rect
                    x={-w / 2 - 5}
                    y={-h / 2 - 5}
                    width={w + 10}
                    height={h + 10}
                    rx={16}
                    fill="none"
                    stroke={c}
                    strokeWidth={2}
                    strokeOpacity={0.5}
                  />
                )}
                <rect
                  x={-w / 2}
                  y={-h / 2}
                  width={w}
                  height={h}
                  rx={isSelf ? 18 : 14}
                  fill={isSelf ? c : '#fff'}
                  stroke={c}
                  strokeWidth={seld ? 2.2 : n.risk === '高危' ? 1.8 : 1.3}
                  strokeDasharray={n.risk === '关注' ? '4 2' : undefined}
                />
                <circle
                  cx={-w / 2 + (isSelf ? 16 : 14)}
                  cy={0}
                  r={isSelf ? 6 : 5}
                  fill={isSelf ? '#fff' : c}
                  stroke={isSelf ? 'rgba(255,255,255,.6)' : 'none'}
                />
                <text
                  x={-w / 2 + (isSelf ? 30 : 26)}
                  y={isSelf ? 5 : 4}
                  fontSize={isSelf ? 13 : 11.5}
                  fontWeight={600}
                  fill={isSelf ? '#fff' : '#334155'}
                >
                  {n.name}
                </text>
                {!!n.openAlerts && (
                  <g>
                    <circle cx={w / 2 - 12} cy={-h / 2 + 12} r={8} fill="#DC2626" stroke="#fff" strokeWidth={1.5} />
                    <text
                      x={w / 2 - 12}
                      y={-h / 2 + 15.5}
                      textAnchor="middle"
                      fontSize={10}
                      fontWeight={700}
                      fill="#fff"
                    >
                      {n.openAlerts}
                    </text>
                  </g>
                )}
                {n.risk === '高危' && !n.openAlerts && (
                  <circle cx={w / 2 - 10} cy={-h / 2 + 10} r={5} fill="#DC2626" stroke="#fff" strokeWidth={1.5} />
                )}
              </g>
            )
          })}
        </svg>

        {/* 关系属性：浮层显示在图谱上（替代原右侧详情块，满足"放到图上显示"） */}
        <div style={{ position: 'absolute', top: 12, right: 12, width: 218, zIndex: 5 }}>
          <RelDetail sel={sel} nodeMap={nodeMap} onClose={() => onPick(null)} />
        </div>

        {/* 图例 */}
        <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#64748B', marginTop: 10, flexWrap: 'wrap' }}>
          {Object.keys(TYPE_COLOR)
            .filter((k) => k !== 'self')
            .map((k) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: TYPE_COLOR[k], display: 'inline-block' }} />
                {TYPE_LABEL[k] ?? k}
              </span>
            ))}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 16, height: 0, borderTop: '2px dashed #DC2626', display: 'inline-block' }} />
            高危 / 风险关系
          </span>
        </div>
      </div>

      {/* 右：详情 + 关系人清单（与图谱联动） */}
      <RelSide persons={persons} sel={sel} nodeMap={nodeMap} onPick={onPick} rowRefs={rowRefs} />
      </div>
    </div>
  )
}

function KV({ k, v, danger }: { k: string; v: string; danger?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '3px 0', fontSize: 12 }}>
      <span style={{ color: '#94A3B8' }}>{k}</span>
      <span style={{ color: danger ? '#DC2626' : '#334155', fontWeight: 500, textAlign: 'right' }}>{v}</span>
    </div>
  )
}

function RelDetail({
  sel,
  nodeMap,
  onClose,
}: {
  sel: GraphSelection | null
  nodeMap: Record<string, CustGraphNode>
  onClose: () => void
}) {
  if (!sel) {
    return (
      <div
        style={{
          border: '1px dashed #CBD5E1',
          borderRadius: 12,
          padding: '16px',
          fontSize: 12,
          color: '#94A3B8',
          background: '#F8FAFC',
          lineHeight: 1.6,
        }}
      >
        点击左侧图谱中的 <b style={{ color: '#8B5CF6' }}>节点</b> 或 <b style={{ color: '#DC2626' }}>关系</b>，或下方清单中的任一关系人，查看对象属性。
      </div>
    )
  }
  if (sel.kind === 'node') {
    const n = sel.node
    return (
      <div
        style={{
          background: '#fff',
          border: '1px solid #E2E8F0',
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(15,23,42,.1)',
          padding: '12px 14px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{n.name}</span>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 16, lineHeight: 1 }}
          >
            ×
          </button>
        </div>
        <KV k="类型" v={TYPE_LABEL[n.type] ?? n.type} />
        <KV k="关系" v={n.rel} />
        {n.risk && <KV k="风险等级" v={n.risk} danger={n.risk !== '正常'} />}
        {n.riskLevel && <KV k="风险档" v={n.riskLevel} danger={n.riskLevel !== '低'} />}
        {n.phone && <KV k="联系电话" v={n.phone} />}
        {n.idCard && <KV k="证件号" v={n.idCard} />}
        {n.openAlerts != null && <KV k="关联预警" v={`${n.openAlerts} 条`} danger={n.openAlerts > 0} />}
        {n.ringId != null && <KV k="团伙编号" v={`#${n.ringId}`} danger={n.ringId > 0} />}
        {n.channel && <KV k="接入渠道" v={n.channel} />}
        {n.regCapital && <KV k="注册资本" v={n.regCapital} />}
        {n.legalPerson && <KV k="法定代表人" v={n.legalPerson} />}
        {n.detail && <KV k="说明" v={n.detail} />}
      </div>
    )
  }
  const e = sel.edge
  const sName = nodeMap[e.source]?.name ?? e.source
  const tName = nodeMap[e.target]?.name ?? e.target
  return (
    <div
      style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: 12,
        boxShadow: '0 8px 24px rgba(15,23,42,.1)',
        padding: '12px 14px',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>关系属性</span>
        <button
          onClick={onClose}
          style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94A3B8', fontSize: 16, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
      <KV k="关系类型" v={e.rel} danger={e.danger} />
      <KV k="起点" v={sName} />
      <KV k="终点" v={tName} />
      <KV k="所属主题" v={e.theme} />
      <KV k="最近活跃" v={e.since ?? '—'} />
      <KV k="风险标记" v={e.danger ? '高危 / 风险边' : '正常'} danger={e.danger} />
    </div>
  )
}

function RelSide({
  persons,
  sel,
  nodeMap,
  onPick,
  rowRefs,
}: {
  persons: CustGraphNode[]
  sel: GraphSelection | null
  nodeMap: Record<string, CustGraphNode>
  onPick: (s: GraphSelection | null) => void
  rowRefs: MutableRefObject<Record<string, HTMLDivElement | null>>
}) {
  return (
    <div style={{ flex: '0 0 320px', minWidth: 280, display: 'flex', flexDirection: 'column', gap: 10, height: '100%' }}>
      <div
        style={{
          fontSize: 12,
          color: '#64748B',
          fontWeight: 600,
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <span>关系人清单</span>
        <span>{persons.length} 人</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: 4 }}>
        {persons.map((n) => {
          const seld = sel?.kind === 'node' && sel.node.id === n.id
          const c = TYPE_COLOR[n.type] ?? '#64748B'
          return (
            <div
              key={n.id}
              ref={(el) => {
                rowRefs.current[n.id] = el
              }}
              onClick={() => onPick({ kind: 'node', node: n })}
              style={{
                border: `1px solid ${seld ? '#8B5CF6' : '#E2E8F0'}`,
                borderLeft: `3px solid ${c}`,
                borderRadius: 10,
                padding: '8px 10px',
                background: seld ? '#F5F3FF' : n.risk === '高危' ? '#FEF2F2' : '#fff',
                cursor: 'pointer',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{n.name}</span>
                <span style={{ fontSize: 11, color: c }}>{TYPE_LABEL[n.type] ?? n.type}</span>
              </div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>
                {n.rel}
                {n.risk && n.risk !== '正常' ? ` · ${n.risk}` : ''}
              </div>
              {n.detail && (
                <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2, lineHeight: 1.45 }}>{n.detail}</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
