// 企业档案 · 集团信息（arc-group）· 1:1 复刻「企业档案 - 集团信息」
// 子快照「企业档案 - 集团信息 - 查看图谱」以图谱抽屉（SVG）折叠进本页
// 数据：本地样例 arcGroup.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'

type Member = { id: number; name: string; legal: string; capital: string; found: string }
type Row3 = { id: number; name: string; legal: string; capital: string; found: string; ratio?: string }

const seed = {
  summary: {
    mainCompany: '抖音有限公司',
    regCapitalSum: '1,199,174.662494 万元人民币',
    validRegCapitalSum: '1,180,338.069794 万元人民币',
    socialSum: '18,129 人',
  },
  members: [] as Member[],
  invests: [] as Row3[],
  shareholders: [] as Row3[],
  graph: {
    group: '抖音集团',
    main: '抖音有限公司',
    persons: [{ name: '银平', holds: [{ name: '海南磁极科技有限公司', ratio: '51.00%' }, { name: '厦门星辰启点科技有限公司', ratio: '50.00%' }] }],
    members: [] as string[],
  },
}

const memberCols: Column[] = [
  { key: 'id', label: '序号', width: 60, render: (r: Row) => r.id },
  { key: 'name', label: '企业名称' },
  { key: 'legal', label: '法定代表人' },
  { key: 'capital', label: '注册资本' },
  { key: 'found', label: '成立时间' },
]
const investCols: Column[] = [
  { key: 'id', label: '序号', width: 60, render: (r: Row) => r.id },
  { key: 'name', label: '被投资企业' },
  { key: 'legal', label: '法定代表人' },
  { key: 'capital', label: '注册资本' },
  { key: 'found', label: '成立时间' },
]
const shCols: Column[] = [
  { key: 'id', label: '序号', width: 60, render: (r: Row) => r.id },
  { key: 'name', label: '投资方' },
  { key: 'legal', label: '法定代表人' },
  { key: 'capital', label: '注册资本' },
  { key: 'found', label: '成立时间' },
  { key: 'ratio', label: '持股比例' },
]

export default function ArcGroup({ params }: { params: URLSearchParams }) {
  const [data, save] = useSample('arcGroup.json', seed)
  const [tab, setTab] = useState<'members' | 'invests' | 'shareholders'>('members')
  const [open, setOpen] = useState(false)

  const tabs = [
    { k: 'members', label: '集团成员', count: 330 },
    { k: 'invests', label: '对外投资', count: 96 },
    { k: 'shareholders', label: '集团内股东', count: 15 },
  ] as const

  const rowsMap = {
    members: data.members as unknown as Row[],
    invests: data.invests as unknown as Row[],
    shareholders: data.shareholders as unknown as Row[],
  }
  const colMap = { members: memberCols, invests: investCols, shareholders: shCols }

  return (
    <EpPage
      title="集团信息"
      subtitle="企业集团是利用全量的企业数据，通过挖掘企业间的股权投资等关系计算出的企业合集"
      crumb="企业档案 / 集团信息"
      actions={
        <>
          <EpBtn variant="default" onClick={() => alert('导出集团信息')}>导出</EpBtn>
          <EpBtn variant="primary" onClick={() => setOpen(true)}>查看图谱</EpBtn>
        </>
      }
    >
      {/* 汇总条 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        <EpStat label="集团主公司" value={data.summary.mainCompany} accent="#2563EB" />
        <EpStat label="注册资本总和" value={data.summary.regCapitalSum} />
        <EpStat label="有效注册资本总和" value={data.summary.validRegCapitalSum} />
        <EpStat label="社保人数总和" value={data.summary.socialSum} accent="#0F766E" />
      </div>

      <EpCard>
        {/* Tab 切换 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
          {tabs.map((t) => (
            <div
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                cursor: 'pointer',
                padding: '7px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: tab === t.k ? '#fff' : '#475569',
                background: tab === t.k ? '#2563EB' : '#F1F5F9',
              }}
            >
              {t.label}（{t.count}）
            </div>
          ))}
        </div>

        <DataTable
          columns={colMap[tab]}
          rows={rowsMap[tab]}
          pager
          exportable
          exportName="集团信息"
          empty="暂无数据"
        />
        <div style={{ marginTop: 8, fontSize: 12, color: '#94A3B8' }}>
          共 {tab === 'members' ? 330 : tab === 'invests' ? 96 : 15} 条 · 5/10/20/50/100 条每页 · 来源：<Sam value="arcGroup.json" />
        </div>
      </EpCard>

      {/* 查看图谱抽屉（SVG 还原「企业档案 - 集团信息 - 查看图谱」） */}
      <EpDrawer open={open} onClose={() => setOpen(false)} title="集团关系图谱" width={820}>
        <GroupGraph data={data.graph} />
        <div style={{ marginTop: 12, fontSize: 12, color: '#64748B' }}>
          企业集团是利用全量的企业数据，通过挖掘企业间的股权投资等关系计算出的企业合集。
        </div>
      </EpDrawer>
    </EpPage>
  )
}

/* ---------------- 集团关系 SVG ---------------- */
function GroupGraph({ data }: { data: typeof seed['graph'] }) {
  const W = 760
  const H = 480
  // 布局坐标
  const group = { x: W / 2, y: 50 }
  const main = { x: W / 2, y: 150 }
  const person = { x: 150, y: 270 }
  const holds = data.persons[0]?.holds ?? []
  const h1 = { x: 90, y: 380 }
  const h2 = { x: 330, y: 380 }
  const members = data.members.slice(0, 6)
  const mStart = { x: 470, y: 300 }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ background: '#FBFCFE', borderRadius: 12, border: '1px solid #E2E8F0' }}>
      <defs>
        <marker id="gArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="#94A3B8" />
        </marker>
      </defs>

      {/* 集团 → 主公司 */}
      <line x1={group.x} y1={group.y + 24} x2={main.x} y2={main.y - 24} stroke="#94A3B8" strokeWidth={1.5} markerEnd="url(#gArrow)" />
      <EdgeLabel x={(group.x + main.x) / 2 + 8} y={(group.y + main.y) / 2} text="集团主公司" />

      {/* 主公司 → 成员群 */}
      <line x1={main.x + 60} y1={main.y} x2={mStart.x + 10} y2={mStart.y} stroke="#CBD5E1" strokeWidth={1.5} markerEnd="url(#gArrow)" />
      <EdgeLabel x={(main.x + mStart.x) / 2} y={main.y - 10} text="集团成员" />

      {/* 主公司 → 银平(人) → 持股企业 */}
      <line x1={main.x - 60} y1={main.y} x2={person.x + 50} y2={person.y} stroke="#FB923C" strokeWidth={1.5} markerEnd="url(#gArrow)" />
      <EdgeLabel x={(main.x + person.x) / 2 - 30} y={main.y - 6} text="关键自然人" />
      <line x1={person.x + 50} y1={person.y} x2={h1.x + 70} y2={h1.y} stroke="#FB923C" strokeWidth={1.5} markerEnd="url(#gArrow)" />
      <line x1={person.x + 50} y1={person.y} x2={h2.x + 70} y2={h2.y} stroke="#FB923C" strokeWidth={1.5} markerEnd="url(#gArrow)" />
      <EdgeLabel x={person.x - 6} y={person.y + 36} text={holds[0]?.ratio ?? ''} color="#EA580C" />
      <EdgeLabel x={person.x + 110} y={h2.y - 14} text={holds[1]?.ratio ?? ''} color="#EA580C" />

      {/* 节点：集团 */}
      <Node x={group.x} y={group.y} w={120} h={44} fill="#2563EB" color="#fff" text={data.group} sub="企业集团" />
      {/* 主公司 */}
      <Node x={main.x} y={main.y} w={150} h={46} fill="#1D4ED8" color="#fff" text={data.main} sub="集团主公司" />
      {/* 自然人 */}
      <Node x={person.x} y={person.y} w={110} h={42} fill="#FFF7ED" color="#EA580C" text={data.persons[0]?.name ?? ''} sub="关键自然人" stroke="#FB923C" />
      {/* 持股企业 */}
      <Node x={h1.x} y={h1.y} w={150} h={40} fill="#fff" color="#0F172A" text={holds[0]?.name ?? ''} sub={`持股 ${holds[0]?.ratio ?? ''}`} stroke="#CBD5E1" />
      <Node x={h2.x} y={h2.y} w={160} h={40} fill="#fff" color="#0F172A" text={holds[1]?.name ?? ''} sub={`持股 ${holds[1]?.ratio ?? ''}`} stroke="#CBD5E1" />

      {/* 集团成员群 */}
      <g>
        <rect x={mStart.x - 8} y={mStart.y - 26} width={270} height={170} rx={10} fill="#F8FAFC" stroke="#E2E8F0" />
        <text x={mStart.x} y={mStart.y - 8} fontSize={12} fontWeight={600} fill="#475569">集团成员（330）</text>
        {members.map((m, i) => (
          <text key={m} x={mStart.x + 6} y={mStart.y + 18 + i * 22} fontSize={11.5} fill="#334155">· {m}</text>
        ))}
        <text x={mStart.x + 6} y={mStart.y + 18 + members.length * 22} fontSize={11} fill="#94A3B8">… 共 330 家</text>
      </g>
    </svg>
  )
}

function Node({ x, y, w, h, fill, color, text, sub, stroke }: { x: number; y: number; w: number; h: number; fill: string; color: string; text: string; sub?: string; stroke?: string }) {
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={9} fill={fill} stroke={stroke ?? 'none'} />
      <text x={x} y={sub ? y - 2 : y + 4} fontSize={12} fontWeight={600} fill={color} textAnchor="middle">{text}</text>
      {sub && <text x={x} y={y + 13} fontSize={10.5} fill={color === '#fff' ? '#DBEAFE' : '#64748B'} textAnchor="middle">{sub}</text>}
    </g>
  )
}

function EdgeLabel({ x, y, text, color = '#64748B' }: { x: number; y: number; text: string; color?: string }) {
  if (!text) return null
  return <text x={x} y={y} fontSize={11} fill={color}>{text}</text>
}
