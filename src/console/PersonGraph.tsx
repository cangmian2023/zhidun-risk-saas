// 个人档案 · 个人图谱（person-graph）· 1:1 复刻「个人图谱」字段级规格
// 交互：横向树状关系图（中心主体 → 关系分类 → 关联企业）、画布拖拽平移 / 滚轮缩放、
//        关系分支折叠展开、节点 hover Tooltip、点击跳转、右侧搜索定位、右侧手风琴菜单。
// 数据：本地样例 personGraph.json（橘 Sam）
import { useState, useRef, useEffect, useMemo } from 'react';

type Company = { name: string; credit: string; status: string; amount: string }
type Relation = {
  key: string
  label: string
  count: number
  color: string
  edgeColor: string
  companies: Company[]
}
type GraphData = { subject: string; queryTime: string; relations: Relation[] }

/* ---------------- 颜色规范（来自字段级规格） ---------------- */
const C = {
  primary: '#1677ff',
  underline: '#ffd140',
  centerFill: '#1677ff',
  title: '#333',
  body: '#333',
  aux: '#666',
  placeholder: '#999',
  line: '#c9cdd4',
}
const REL_COLOR: Record<string, string> = {
  legalRep: '#e6f7ff',
  executive: '#f0f7ff',
  shareholder: '#f9f0ff',
  histLegalRep: '#fff2e8',
  histExecutive: '#fff2e8',
  histShareholder: '#fff2e8',
  holding: '#ffe8e8',
}

/* ---------------- 布局常量 ---------------- */
const NODE_W = 200
const NODE_H = 40
const REL_W = 150
const REL_H = 36
const CENTER_X = 90
const CENTER_Y = 360
const COL_GAP = 70 // 列间水平间距（中心 / 关系 / 企业）
const ROW_GAP = 12
const PAD_TOP = 60

/* ---------------- 工具图标 ---------------- */
const Icon = ({ d, onClick, title }: { d: string; onClick?: () => void; title?: string }) => (
  <button
    title={title}
    onClick={onClick}
    style={{ width: 30, height: 30, border: '1px solid #e5e6eb', background: '#fff', borderRadius: 6, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
  >
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4e5969" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  </button>
)

export default function PersonGraph({ data, loading, error }: { data: GraphData; loading?: boolean; error?: string | null }) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [tf, setTf] = useState({ x: 0, y: 0, k: 1 }) // 平移 + 缩放
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({}) // 关系折叠态
  const [activeRel, setActiveRel] = useState<string | null>(null) // 手风琴展开项
  const [query, setQuery] = useState('')
  const [highlight, setHighlight] = useState<string | null>(null) // 高亮企业名
  const [filterOpen, setFilterOpen] = useState(false)
  const [filterOn, setFilterOn] = useState<Record<string, boolean>>({}) // 筛选：关系显隐
  const [showBackTop, setShowBackTop] = useState(false)

  /* ---- 计算所有节点坐标（横向树） ---- */
  const layout = useMemo(() => {
    const rels = (data?.relations ?? []).filter((r) => !filterOn[r.key])
    const center = { id: '__center', name: data?.subject ?? '主体', x: CENTER_X, y: CENTER_Y, w: NODE_W, h: NODE_H, kind: 'center' as const }
    let y = PAD_TOP
    const relNodes: any[] = []
    const compNodes: any[] = []
    const edges: any[] = []
    rels.forEach((r) => {
      const isCollapsed = collapsed[r.key]
      const shown = isCollapsed ? 0 : r.companies.length
      const relH = Math.max(REL_H, shown * (NODE_H + ROW_GAP) + ROW_GAP)
      const rx = CENTER_X + NODE_W + COL_GAP
      const ry = y + relH / 2 - REL_H / 2
      relNodes.push({ id: `rel-${r.key}`, name: r.label, x: rx, y: ry, w: REL_W, h: REL_H, kind: 'rel', color: REL_COLOR[r.key], relKey: r.key, count: r.count })
      edges.push({ from: center.id, to: `rel-${r.key}`, color: r.edgeColor, relKey: r.key })
      let cy = y
      r.companies.forEach((c) => {
        if (isCollapsed) return
        const cx = rx + REL_W + COL_GAP
        const cn = { id: `c-${r.key}-${c.name}`, name: c.name, x: cx, y: cy + NODE_H / 2, w: NODE_W, h: NODE_H, kind: 'company', color: REL_COLOR[r.key], relKey: r.key, company: c, hiddenCount: 0 }
        compNodes.push(cn)
        edges.push({ from: `rel-${r.key}`, to: cn.id, color: r.edgeColor, relKey: r.key })
        cy += NODE_H + ROW_GAP
      })
      // 折叠入口计数
      if (isCollapsed) {
        relNodes[relNodes.length - 1].hiddenCount = r.count
      }
      y += relH + ROW_GAP
    })
    const totalH = Math.max(y + PAD_TOP, 760)
    return { center, relNodes, compNodes, edges, totalH, totalW: CENTER_X + NODE_W + COL_GAP * 2 + REL_W + NODE_W + 80 }
  }, [data, collapsed, filterOn])

  /* ---- 拖拽平移 ---- */
  const onDown = (e: React.MouseEvent) => { drag.current = { x: e.clientX, y: e.clientY, ox: tf.x, oy: tf.y } }
  const onMove = (e: React.MouseEvent) => {
    if (!drag.current) return
    setTf((t) => ({ ...t, x: drag.current!.ox + (e.clientX - drag.current!.x), y: drag.current!.oy + (e.clientY - drag.current!.y) }))
  }
  const onUp = () => { drag.current = null }
  const onWheel = (e: React.WheelEvent) => {
    const delta = -e.deltaY * 0.0015
    setTf((t) => ({ ...t, k: Math.min(2.4, Math.max(0.4, t.k * (1 + delta))) }))
  }
  const zoom = (dir: number) => setTf((t) => ({ ...t, k: Math.min(2.4, Math.max(0.4, t.k * (1 + dir * 0.2))) }))
  const reset = () => setTf({ x: 0, y: 0, k: 1 })

  /* ---- 回到顶部 ---- */
  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const onScroll = () => setShowBackTop(el.scrollTop > 240)
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  /* ---- 搜索定位 ---- */
  const doSearch = (kw: string) => {
    const k = kw.trim()
    if (!k) { setHighlight(null); return }
    const hit = layout.compNodes.find((n) => n.name.includes(k))
    if (hit) {
      setHighlight(hit.id)
      // 居中到该节点
      const el = svgRef.current?.parentElement
      if (el) {
        const tx = el.clientWidth / 2 - (hit.x) * tf.k
        const ty = el.clientHeight / 2 - (hit.y) * tf.k
        setTf((t) => ({ ...t, x: tx, y: ty }))
      }
    } else {
      setHighlight(null)
    }
  }

  /* ---- 导出 PNG ---- */
  const exportPng = () => {
    const svg = svgRef.current
    if (!svg) return
    const xml = new XMLSerializer().serializeToString(svg)
    const svg64 = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(xml)
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = svg.clientWidth
      canvas.height = svg.clientHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0)
      const a = document.createElement('a')
      a.href = canvas.toDataURL('image/png')
      a.download = `${data?.subject ?? 'person'}-graph.png`
      a.click()
    }
    img.src = svg64
  }

  /* ---- 数据兜底 ---- */
  if (error) {
    return <EmptyBox title="图谱加载失败" desc={error} />
  }
  if (loading || !data) {
    return (
      <div style={{ height: 520, background: '#fafbfc', borderRadius: 12, border: '1px dashed #e5e6eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: 14 }}>
        <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><span className="pg-spin" />图谱数据加载中…</span>
      </div>
    )
  }
  if (!data.relations.length) {
    return <EmptyBox title="暂无关联企业" desc="该主体暂未采集到图谱关系数据" />
  }

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: C.title }}>个人图谱 <span style={{ fontSize: 13, color: C.aux, fontWeight: 400 }}>中心主体：{data.subject}</span></div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'stretch', minHeight: 560 }}>
        {/* ============ 左侧画布 ============ */}
        <div
          ref={wrapRef}
          style={{ position: 'relative', flex: 1, minWidth: 0, border: '1px solid #e5e6eb', borderRadius: 12, overflow: 'auto', background: '#fff' }}
        >
          {/* 画布顶部工具栏（主体名称行 + 功能图标） */}
          <div style={{ position: 'sticky', top: 0, zIndex: 5, display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#fff', borderBottom: '1px solid #f2f3f5' }}>
            <span style={{ fontWeight: 700, color: C.primary, fontSize: 15 }}>{data.subject}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
              <Icon title="筛选关系" d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" onClick={() => setFilterOpen((v) => !v)} />
              <Icon title="缩小" d="M5 12h14" onClick={() => zoom(-1)} />
              <Icon title="放大" d="M12 5v14M5 12h14" onClick={() => zoom(1)} />
              <Icon title="还原视图" d="M3 12a9 9 0 1 0 9-9 9 9 0 0 0-6.36 2.64L3 8m0-5v5h5" onClick={reset} />
              <Icon title="下载导出" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" onClick={exportPng} />
            </div>
          </div>

          {/* 筛选弹窗 */}
          {filterOpen && (
            <div style={{ position: 'absolute', top: 52, right: 12, zIndex: 20, background: '#fff', border: '1px solid #e5e6eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', padding: 12, width: 220 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.title, marginBottom: 8 }}>关系类型筛选</div>
              {data.relations.map((r) => (
                <label key={r.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontSize: 13, color: C.body, cursor: 'pointer' }}>
                  <input type="checkbox" checked={!filterOn[r.key]} onChange={(e) => setFilterOn((f) => ({ ...f, [r.key]: !e.target.checked }))} />
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: REL_COLOR[r.key], border: '1px solid #ccc' }} />
                  {r.label} <span style={{ color: C.aux, marginLeft: 'auto' }}>{r.count}</span>
                </label>
              ))}
            </div>
          )}

          {/* SVG 画布 */}
          <svg
            ref={svgRef}
            width="100%"
            height={layout.totalH}
            viewBox={`0 0 ${layout.totalW} ${layout.totalH}`}
            style={{ display: 'block', cursor: drag.current ? 'grabbing' : 'grab', userSelect: 'none', touchAction: 'none' }}
            onMouseDown={onDown}
            onMouseMove={onMove}
            onMouseUp={onUp}
            onMouseLeave={onUp}
            onWheel={onWheel}
          >
            <g transform={`translate(${tf.x},${tf.y}) scale(${tf.k})`}>
              {/* 连线 */}
              {layout.edges.map((e: any, i: number) => {
                const a = e.from === layout.center.id ? layout.center : (layout.relNodes.find((n: any) => n.id === e.from) || layout.compNodes.find((n: any) => n.id === e.from))
                const b = e.from === layout.center.id ? layout.relNodes.find((n: any) => n.id === e.to) : layout.compNodes.find((n: any) => n.id === e.to)
                if (!a || !b) return null
                const x1 = a.x + a.w, y1 = a.y + a.h / 2
                const x2 = b.x, y2 = b.y + b.h / 2
                const mx = (x1 + x2) / 2
                const lit = activeRel === e.relKey || highlight === b.id
                return <path key={i} d={`M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`} fill="none" stroke={lit ? e.color : C.line} strokeWidth={lit ? 2 : 1.2} />
              })}
              {/* 中心节点 */}
              <Rect node={layout.center} fill={C.centerFill} color="#fff" stroke={C.centerFill} onLocate={() => {}} />
              {/* 关系节点 */}
              {layout.relNodes.map((n: any) => (
                <g key={n.id}>
                  <Rect node={n} fill={n.color} color={C.title} stroke="#d9d9d9" onLocate={() => setActiveRel(activeRel === n.relKey ? null : n.relKey)} />
                  {/* 折叠入口：搜索(xx) */}
                  <foreignObject x={n.x} y={n.y + n.h + 4} width={n.w} height={22}>
                    <button
                      onClick={() => setCollapsed((c) => ({ ...c, [n.relKey]: !c[n.relKey] }))}
                      style={{ fontSize: 11, color: C.primary, background: '#f0f7ff', border: '1px solid #bcd8ff', borderRadius: 10, padding: '1px 8px', cursor: 'pointer' }}
                    >
                      {collapsed[n.relKey] ? `搜索(${n.hiddenCount ?? 0})` : '收起'}
                    </button>
                  </foreignObject>
                </g>
              ))}
              {/* 企业节点 */}
              {layout.compNodes.map((n: any) => (
                <Rect
                  key={n.id}
                  node={n}
                  fill={n.color}
                  color={C.title}
                  stroke={highlight === n.id ? C.primary : '#d9d9d9'}
                  strokeW={highlight === n.id ? 2 : 1}
                  onLocate={() => setHighlight(n.id)}
                  tip={n.company}
                />
              ))}
            </g>
          </svg>

          {/* 悬浮回到顶部 */}
          {showBackTop && (
            <button
              onClick={() => wrapRef.current?.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{ position: 'absolute', right: 16, bottom: 16, width: 40, height: 40, borderRadius: '50%', background: '#fff', border: '1px solid #e5e6eb', boxShadow: '0 4px 12px rgba(0,0,0,.12)', cursor: 'pointer', fontSize: 18, color: C.primary }}
              title="回到顶部"
            >↑</button>
          )}

          <style>{`
            .pg-spin{width:14px;height:14px;border:2px solid #ccc;border-top-color:#1677ff;border-radius:50%;display:inline-block;animation:pg-rot .8s linear infinite}
            @keyframes pg-rot{to{transform:rotate(360deg)}}
            .pg-node-rect:hover{filter:brightness(.97)}
          `}</style>
        </div>

        {/* ============ 右侧侧边面板 ============ */}
        <div style={{ width: 280, flexShrink: 0, border: '1px solid #e5e6eb', borderRadius: 12, background: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* 搜索框 */}
          <div style={{ padding: 12, borderBottom: '1px solid #f2f3f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, border: '1px solid #e5e6eb', borderRadius: 8, padding: '7px 10px' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.placeholder} strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && doSearch(query)}
                placeholder="搜索关联的企业或人名"
                style={{ border: 'none', outline: 'none', flex: 1, fontSize: 13, color: C.body }}
              />
            </div>
          </div>
          {/* 手风琴菜单 */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 6 }}>
            {data.relations.map((r) => {
              const open = activeRel === r.key
              return (
                <div key={r.key} style={{ borderBottom: '1px solid #f5f5f5' }}>
                  <div
                    onClick={() => setActiveRel(open ? null : r.key)}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 10px', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: C.title }}
                  >
                    <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: REL_COLOR[r.key], border: '1px solid #ccc' }} />
                    {r.label}
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: C.aux }}>{r.count}</span>
                    <span style={{ fontSize: 12, color: C.placeholder, transform: open ? 'rotate(90deg)' : 'none' }}>›</span>
                  </div>
                  {open && (
                    <div style={{ padding: '4px 10px 10px 28px' }}>
                      {r.companies.map((c) => (
                        <div
                          key={c.name}
                          onClick={() => { setHighlight(`c-${r.key}-${c.name}`); setActiveRel(r.key) }}
                          title={`${c.credit} · ${c.status} · ${c.amount}`}
                          style={{ padding: '6px 8px', fontSize: 12, color: C.body, cursor: 'pointer', borderRadius: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                          className="pg-node-rect"
                        >
                          {c.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ---------------- SVG 矩形节点（中心 / 关系 / 企业） ---------------- */
function Rect({ node, fill, color, stroke, strokeW = 1, onLocate, tip }: {
  node: any; fill: string; color: string; stroke: string; strokeW?: number; onLocate: () => void; tip?: Company
}) {
  const [hover, setHover] = useState(false)
  return (
    <g
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={onLocate}
      style={{ cursor: tip ? 'pointer' : 'default' }}
      className="pg-node-rect"
    >
      <rect x={node.x} y={node.y} width={node.w} height={node.h} rx={node.kind === 'center' ? 8 : 6} fill={fill} stroke={stroke} strokeWidth={strokeW} />
      <text x={node.x + node.w / 2} y={node.y + node.h / 2 + 4} fontSize={node.kind === 'center' ? 14 : 12} fontWeight={node.kind === 'center' ? 700 : 400} fill={color} textAnchor="middle" style={{ pointerEvents: 'none' }}>
        {node.name.length > 13 ? node.name.slice(0, 12) + '…' : node.name}
      </text>
      {tip && hover && (
        <g transform={`translate(${node.x + node.w / 2},${node.y - 8})`} style={{ pointerEvents: 'none' }}>
          <rect x={-110} y={-52} width={220} height={46} rx={6} fill="#1d2129" opacity={0.94} />
          <text x={0} y={-34} fontSize={11} fill="#fff" textAnchor="middle">{tip.credit}</text>
          <text x={0} y={-18} fontSize={11} fill="#c9cdd4" textAnchor="middle">{tip.status} · {tip.amount}</text>
        </g>
      )}
    </g>
  )
}

function EmptyBox({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ height: 460, border: '1px dashed #e5e6eb', borderRadius: 12, background: '#fafbfc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86909c' }}>
      <div style={{ fontSize: 40, marginBottom: 10 }}>🗺️</div>
      <div style={{ fontWeight: 600, color: '#1d2129' }}>{title}</div>
      <div style={{ fontSize: 13, marginTop: 4 }}>{desc}</div>
    </div>
  )
}
