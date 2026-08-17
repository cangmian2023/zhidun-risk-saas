// 企业档案 · 企业图谱（arc-graph）· 1:1 复刻「企业档案 - 企业图谱」（中心 hub 页）
// 内部用 tabs 组织 8 个子图，每个子图用 SVG 还原原图的分组 / 层级 / 标注（不简化）
// 数据：本地样例 arcGraph.json（橘 Sam）
import { useState, type ReactNode } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'

type GNode = { id: string; name: string; x: number; y: number; type: string; ratio?: string; rel?: string; note?: string; amount?: string }
type GEdge = { from: string; to: string; label?: string }

const seed = {
  company: '抖音有限公司',
  queryTime: '2026-08-17 14:10:14',
  hub: { title: '企业图谱', nav: [] as string[], graphTabs: [] as string[] },
  equityStructure: { center: '抖音有限公司', nodes: [] as GNode[], edges: [] as GEdge[] },
  equityPenetration: { center: '抖音有限公司', suspectController: '银平', totalRatio: '49.41%', nodes: [] as GNode[], edges: [] as GEdge[] },
  beneficialOwner: { center: '抖音有限公司', standards: [] as any[], nodes: [] as GNode[], edges: [] as GEdge[] },
  companyRelation: { center: '抖音有限公司', layers: [] as string[], levelRel: [] as string[], investRel: [] as string[], companies: [] as string[], nodes: [] as GNode[], edges: [] as GEdge[] },
  companyChain: { center: '抖音有限公司', groups: [] as any[], nodes: [] as GNode[], edges: [] as GEdge[] },
  controllerRelation: { center: '抖音有限公司', nodes: [] as GNode[], edges: [] as GEdge[] },
  relatedParty: { center: '抖音有限公司', groups: [] as any[] },
  topBeneficiary: { center: '抖音有限公司', list: [] as any[] },
}

const tabs = [
  { k: 'equityStructure', label: '股权结构' },
  { k: 'equityPenetration', label: '股权穿透' },
  { k: 'beneficialOwner', label: '受益所有人' },
  { k: 'companyRelation', label: '企业关系' },
  { k: 'companyChain', label: '企业链图' },
  { k: 'controllerRelation', label: '控制人关系' },
  { k: 'relatedParty', label: '关联方认定' },
  { k: 'topBeneficiary', label: '十大受益人' },
] as const

export default function ArcGraph({ params }: { params: URLSearchParams }) {
  const [data, save] = useSample('arcGraph.json', seed)
  const [tab, setTab] = useState<string>('equityStructure')
  const active = tabs.find((t) => t.k === tab)!

  return (
    <EpPage
      title="企业图谱"
      subtitle={`中心企业：${data.company} · 查询时间：${data.queryTime}`}
      crumb="企业档案 / 企业图谱"
      actions={<EpBtn variant="default" onClick={() => alert('下载图谱数据')}>下载数据</EpBtn>}
    >
      {/* 子图 Tab 切换（对应原页 8 个子图入口） */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
        {tabs.map((t) => (
          <div
            key={t.k}
            onClick={() => setTab(t.k)}
            style={{
              cursor: 'pointer',
              padding: '7px 14px',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: tab === t.k ? '#fff' : '#475569',
              background: tab === t.k ? '#2563EB' : '#F1F5F9',
            }}
          >
            {t.label}
          </div>
        ))}
      </div>

      <EpCard title={active.label} desc={<Sam value="arcGraph.json" />} actions={<EpBtn variant="ghost" size="sm">还原</EpBtn>}>
        {tab === 'equityStructure' && <EquityStructure data={data.equityStructure} />}
        {tab === 'equityPenetration' && <EquityPenetration data={data.equityPenetration} />}
        {tab === 'beneficialOwner' && <BeneficialOwner data={data.beneficialOwner} />}
        {tab === 'companyRelation' && <CompanyRelation data={data.companyRelation} />}
        {tab === 'companyChain' && <CompanyChain data={data.companyChain} />}
        {tab === 'controllerRelation' && <ControllerRelation data={data.controllerRelation} />}
        {tab === 'relatedParty' && <RelatedParty data={data.relatedParty} />}
        {tab === 'topBeneficiary' && <TopBeneficiary data={data.topBeneficiary} />}
      </EpCard>
    </EpPage>
  )
}

/* ===================== 通用 SVG 节点-连线渲染 ===================== */
function GraphSVG({ nodes, edges, width = 760, height = 460 }: { nodes: GNode[]; edges: GEdge[]; width?: number; height?: number }) {
  const byId = (id: string) => nodes.find((n) => n.id === id)
  const colorOf = (t: string) => {
    if (t === 'center') return { fill: '#1D4ED8', color: '#fff', stroke: 'none' }
    if (t === 'person') return { fill: '#FFF7ED', color: '#EA580C', stroke: '#FB923C' }
    if (t === 'other') return { fill: '#F1F5F9', color: '#64748B', stroke: '#CBD5E1' }
    return { fill: '#ffffff', color: '#0F172A', stroke: '#CBD5E1' } // company
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" style={{ background: '#FBFCFE', borderRadius: 12, border: '1px solid #E2E8F0' }}>
      <defs>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#94A3B8" />
        </marker>
      </defs>
      {edges.map((e, i) => {
        const a = byId(e.from)
        const b = byId(e.to)
        if (!a || !b) return null
        const mx = (a.x + b.x) / 2
        const my = (a.y + b.y) / 2
        const stroke = a.type === 'person' || b.type === 'person' ? '#FB923C' : '#94A3B8'
        return (
          <g key={i}>
            <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={stroke} strokeWidth={1.5} markerEnd="url(#arr)" />
            {e.label && (
              <g>
                <rect x={mx - (e.label.length * 6 + 6)} y={my - 10} width={e.label.length * 6 + 12} height={18} rx={9} fill="#fff" stroke="#E2E8F0" />
                <text x={mx} y={my + 3} fontSize={11} fill="#334155" textAnchor="middle">{e.label}</text>
              </g>
            )}
          </g>
        )
      })}
      {nodes.map((n) => {
        const c = colorOf(n.type)
        const w = Math.max(120, n.name.length * 13 + 24)
        const h = 44
        return (
          <g key={n.id}>
            <rect x={n.x - w / 2} y={n.y - h / 2} width={w} height={h} rx={9} fill={c.fill} stroke={c.stroke} />
            <text x={n.x} y={n.rel || n.ratio || n.note ? n.y - 4 : n.y + 4} fontSize={12} fontWeight={600} fill={c.color} textAnchor="middle">{n.name}</text>
            {(n.rel || n.ratio || n.note) && (
              <text x={n.x} y={n.y + 13} fontSize={10.5} fill={c.color === '#fff' ? '#DBEAFE' : '#64748B'} textAnchor="middle">{n.ratio ?? n.rel ?? n.note}</text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

/* ===================== 1. 股权结构 ===================== */
function EquityStructure({ data }: { data: typeof seed['equityStructure'] }) {
  return (
    <div>
      <Toolbar />
      <GraphSVG nodes={data.nodes} edges={data.edges} height={400} />
      <Note>股权结构：还原抖音有限公司的股东构成（厦门星辰启点科技有限公司 98.814%、张利东 1.186%）。</Note>
    </div>
  )
}

/* ===================== 2. 股权穿透 ===================== */
function EquityPenetration({ data }: { data: typeof seed['equityPenetration'] }) {
  return (
    <div>
      <Toolbar extra={`疑似实控人：${data.suspectController} · 总持股比例：${data.totalRatio}`} />
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        <EpTag color="#1D4ED8" bg="#EFF6FF">股东持股</EpTag>
        <EpTag color="#1D4ED8" bg="#EFF6FF">对外投资</EpTag>
        <EpTag color="#1D4ED8" bg="#EFF6FF">历史股东持股</EpTag>
        <EpBtn variant="ghost" size="sm" onClick={() => alert('查看控制链')}>查看控制链</EpBtn>
      </div>
      <GraphSVG nodes={data.nodes} edges={data.edges} height={440} />
      <Note>股权穿透：自银平向下穿透，经厦门星辰启点科技有限公司（50.00%）持有抖音有限公司 98.8140%，张利东直接持股 1.1860%（认缴 118.6 万元）。</Note>
    </div>
  )
}

/* ===================== 3. 受益所有人 ===================== */
function BeneficialOwner({ data }: { data: typeof seed['beneficialOwner'] }) {
  const stdCols: Column[] = [
    { key: 'id', label: '序号', width: 50, render: (r: Row) => r.id },
    { key: 'name', label: '受益所有人' },
    { key: 'type', label: '受益类型' },
    { key: 'role', label: '任职类型' },
    { key: 'ratio', label: '持股比例' },
    { key: 'path', label: '持股路径' },
    { key: 'date', label: '形成日期' },
    { key: 'reason', label: '判定原因' },
  ]
  return (
    <div>
      <Toolbar extra="主体类型：公司 · 需要备案 · 正常识别" />
      <GraphSVG nodes={data.nodes} edges={data.edges} height={420} />
      <div style={{ marginTop: 14, display: 'grid', gap: 12 }}>
        {data.standards.map((s) => (
          <EpCard key={s.no} title={`${s.no}：${s.title}`} pad>
            <DataTable columns={stdCols} rows={s.items as unknown as Row[]} empty="暂无数据" />
          </EpCard>
        ))}
      </div>
      <Note>大数据分析引擎基于公开数据进行的动态分析，仅供参考。查询时间：2026-08-17 14:10:39</Note>
    </div>
  )
}

/* ===================== 4. 企业关系 ===================== */
function CompanyRelation({ data }: { data: typeof seed['companyRelation'] }) {
  return (
    <div>
      <Toolbar />
      <div style={{ display: 'flex', gap: 18, marginBottom: 10, flexWrap: 'wrap', fontSize: 12, color: '#475569' }}>
        <span><b>层级关系：</b>{data.layers.join(' / ')}</span>
        <span><b>任职关系：</b>{data.levelRel.join(' / ')}</span>
        <span><b>投资关系：</b>{data.investRel.join(' / ')}</span>
      </div>
      <GraphSVG nodes={data.nodes} edges={data.edges} height={460} />
      <Note>企业关系：还原抖音有限公司与一层 / 二层关联企业的股东、历史股东、分支机构与任职关系。</Note>
    </div>
  )
}

/* ===================== 5. 企业链图 ===================== */
function CompanyChain({ data }: { data: typeof seed['companyChain'] }) {
  return (
    <div>
      <Toolbar />
      <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
        {data.groups.map((g) => (
          <EpTag key={g.label} color="#0F766E" bg="#ECFDF5">{g.label}</EpTag>
        ))}
      </div>
      <GraphSVG nodes={data.nodes} edges={data.edges} height={440} />
      <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10 }}>
        {data.groups.map((g) => (
          <div key={g.label} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#0F766E', marginBottom: 4 }}>{g.label}</div>
            {g.items.map((it: string) => (
              <div key={it} style={{ fontSize: 12, color: '#334155' }}>· {it}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ===================== 6. 控制人关系 ===================== */
function ControllerRelation({ data }: { data: typeof seed['controllerRelation'] }) {
  return (
    <div>
      <Toolbar />
      <GraphSVG nodes={data.nodes} edges={data.edges} height={420} />
      <Note>控制人关系：银平（实际控制人）经厦门星辰启点科技有限公司（50.00%）控制抖音有限公司（98.81%）。</Note>
    </div>
  )
}

/* ===================== 7. 关联方认定 ===================== */
function RelatedParty({ data }: { data: typeof seed['relatedParty'] }) {
  const colors: Record<string, { c: string; b: string }> = {
    control: { c: '#1D4ED8', b: '#EFF6FF' },
    person: { c: '#EA580C', b: '#FFF7ED' },
    controlled: { c: '#0F766E', b: '#ECFDF5' },
    manager: { c: '#7C3AED', b: '#F5F3FF' },
  }
  return (
    <div>
      <Toolbar extra="查询时间：2026-08-17 14:11:25" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 12 }}>
        {data.groups.map((g, i) => {
          const col = colors[g.kind] ?? { c: '#475569', b: '#F1F5F9' }
          return (
            <div key={i} style={{ border: `1px solid ${col.b}`, borderRadius: 12, padding: 14, background: '#fff' }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: col.c, marginBottom: 8 }}>{g.label}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {g.items.map((it: string) => (
                  <EpTag key={it} color={col.c} bg={col.b}>{it}</EpTag>
                ))}
                <span style={{ fontSize: 12, color: '#94A3B8', alignSelf: 'center' }}>查看全部 ›</span>
              </div>
            </div>
          )
        })}
      </div>
      <Note>关联方认定：按「控制 / 影响」两个维度还原母公司、持股自然人、受控企业与董监高法关联企业。</Note>
    </div>
  )
}

/* ===================== 8. 十大受益人 ===================== */
function TopBeneficiary({ data }: { data: typeof seed['topBeneficiary'] }) {
  const max = Math.max(...data.list.map((d) => parseFloat(d.ratio)))
  return (
    <div>
      <Toolbar extra="还原 · 放大 · 缩小 · 保存" />
      <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#fff' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#1D4ED8', marginBottom: 12 }}>十大受益人 · {data.center}</div>
        {data.list.map((d) => {
          const v = parseFloat(d.ratio)
          return (
            <div key={d.rank} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <div style={{ width: 28, textAlign: 'center', fontWeight: 700, color: '#2563EB' }}>{d.rank}</div>
              <div style={{ width: 220, fontSize: 13, color: '#0F172A' }}>{d.name}</div>
              <div style={{ flex: 1, height: 14, background: '#F1F5F9', borderRadius: 7 }}>
                <div style={{ width: `${(v / max) * 100}%`, height: '100%', background: '#2563EB', borderRadius: 7 }} />
              </div>
              <div style={{ width: 90, textAlign: 'right', fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{d.ratio}</div>
              <div style={{ width: 90, fontSize: 12, color: '#64748B' }}>{d.note}</div>
            </div>
          )
        })}
      </div>
      <Note>十大受益人：李英 49.407%、厦门星辰启点科技有限公司 98.814%、银平（实际控制人）、张利东 1.186%（最终受益股份）。</Note>
    </div>
  )
}

/* ===================== 公共小组件 ===================== */
function Toolbar({ extra }: { extra?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
      <EpBtn variant="ghost" size="sm">下载数据</EpBtn>
      {extra && <span style={{ fontSize: 12, color: '#64748B' }}>{extra}</span>}
      <span style={{ marginLeft: 'auto', fontSize: 12, color: '#94A3B8' }}>查询时间：2026-08-17 14:10:14</span>
    </div>
  )
}
function Note({ children }: { children: ReactNode }) {
  return <div style={{ marginTop: 12, fontSize: 12, color: '#64748B', lineHeight: 1.7 }}>{children}</div>
}
