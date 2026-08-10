/* 单客详情（零售信贷 · 贷中监控）· 页面（挂在「零售信贷风控 cr」子系统 · 贷中监控分区末尾）
 * 模块：单客 360° 画像（cr:mid-single-cust）
 * 顶层设计：功能 / 数据分离 —— 本文件只负责「功能（渲染）」，所有数据来自 custProfileData.ts。
 *   数据：custProfileData.ts（纯数据 + store，橘 Sam 样例，灰 Cal 实时聚合）
 *   结构：对齐企业档案（ep:qiye-profile）的头部卡 + 在档切换 + 板块化布局，并补齐 MidCustDetail
 *         的重度风控维度（模型评分(头部 2×2 面板) / 央行征信 / 实名与设备核验(并入基本信息) / 外部核验 /
 *         担保与经营 / 关系网络 / 多头共债 / 催收 / 贷后风险 / 处置日志），做到内容对等、实现独立（不引用 MidCustDetail）。
 */
import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Panel, StatCard, DataTable, Button, Badge } from '../components/ui'
import type { Column, Row } from '../components/ui'
import { Sam, Cal } from './SourceTag'
import { PageShell } from './PageShell'
import {
  useCustData,
  toggleFollowCust,
  type CustProfile,
  type CustScores,
  type CustRelationGraph,
  type GraphTheme,
  type CustLogEntry,
  type CustExternalCheck,
} from './custProfileData'

const CRUMB = '零售信贷风控 / 贷中监控 / 单客详情'

// 随屏幕宽度自适应的字段网格列数：宽屏 3 列 / 中屏 2 列 / 窄屏 1 列
function useScreenCols() {
  const calc = () => {
    if (typeof window === 'undefined') return 3
    const w = window.innerWidth
    if (w >= 1080) return 3
    if (w >= 720) return 2
    return 1
  }
  const [cols, setCols] = useState(calc)
  useEffect(() => {
    const onResize = () => setCols(calc())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return cols
}

// 占位照片（demo 用，内联 SVG，无需外部资源、离线必渲染）
function photoDataUri(label: string, bg: string) {
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='110' height='140'>` +
    `<rect width='110' height='140' rx='8' fill='${bg}'/>` +
    `<circle cx='55' cy='52' r='23' fill='#fff' opacity='0.92'/>` +
    `<rect x='31' y='82' width='48' height='38' rx='24' fill='#fff' opacity='0.92'/>` +
    `<text x='55' y='132' font-size='10' fill='#fff' text-anchor='middle' font-family='sans-serif'>${label}</text>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// 税务 / 社保 app 截屏缩略图（demo 占位，内联 SVG，模拟手机截图）
function appShotDataUri(shot: { title: string; note: string; status: '一致' | '异常' | '待核' }) {
  const color =
    shot.status === '一致' ? '#16A34A' : shot.status === '异常' ? '#DC2626' : '#D97706'
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='200'>` +
    `<rect width='160' height='200' rx='12' fill='#fff' stroke='#E2E8F0'/>` +
    `<path d='M0 12 a12 12 0 0 1 12 -12 h136 a12 12 0 0 1 12 12 v16 h-160 z' fill='#F8FAFC'/>` +
    `<circle cx='14' cy='14' r='4' fill='#CBD5E1'/>` +
    `<rect x='24' y='9' width='78' height='10' rx='5' fill='#E2E8F0'/>` +
    `<rect x='110' y='6' width='40' height='16' rx='8' fill='${color}' opacity='0.14'/>` +
    `<text x='130' y='18' font-size='9' fill='${color}' text-anchor='middle' font-family='sans-serif'>${shot.status}</text>` +
    `<rect x='12' y='44' width='136' height='92' rx='8' fill='#F1F5F9'/>` +
    `<text x='80' y='92' font-size='12' fill='#334155' text-anchor='middle' font-family='sans-serif'>${shot.title}</text>` +
    `<text x='80' y='114' font-size='10' fill='#94A3B8' text-anchor='middle' font-family='sans-serif'>mock 截屏</text>` +
    `<text x='80' y='168' font-size='10' fill='#475569' text-anchor='middle' font-family='sans-serif'>${shot.note}</text>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// 信息概要指标卡
function SummaryCard({ label, value, unit, danger }: { label: string; value: number; unit: string; danger?: boolean }) {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ fontSize: 12, color: '#94A3B8' }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 500, color: danger ? '#DC2626' : '#1E293B', marginTop: 2 }}>
        {value}<span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 2 }}>{unit}</span>
      </div>
    </div>
  )
}

// 各 Tab 标签后的括号计数（替代顶部统计概要卡）
function tabBadge(t: Tab, cur: CustProfile): string {
  switch (t) {
    case '央行征信': return `${cur.credit.accounts.length} 户`
    case '授信与额度': return `${cur.loans.length} 笔`
    case '负债与逾期': return `${cur.loans.length} 笔`
    case '行为画像': return `${cur.behavior.length} 项`
    case '风险预警': return `${cur.alerts.length} 条`
    case '担保与经营': return `${cur.collateralBiz.collateral.length + cur.collateralBiz.business.length} 项`
    case '关系网络': return `${cur.relationGraph.nodes.length} 节点`
    case '多头共债': return `${cur.coDebt.orgs.length} 家`
    case '催收案件': return `${cur.collections.length} 件`
    case '贷后风险': return `${cur.postRisk.fundFlow.length} 笔`
    case '处置与操作日志': return `${cur.disposeLog.length} 条`
    default: return ''
  }
}

const STATUS_KIND: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  正常: 'green',
  关注: 'amber',
  逾期: 'red',
  冻结: 'gray',
}
const STAGE_KIND: Record<string, 'green' | 'blue' | 'amber' | 'red'> = { M1: 'blue', M2: 'amber', 'M3+': 'red' }
const SCORE_KIND: Record<string, 'green' | 'blue' | 'amber' | 'red'> = { 优: 'green', 良: 'blue', 中: 'amber', 差: 'red' }

const TABS = [
  '基本信息',
  '央行征信',
  '授信与额度',
  '负债与逾期',
  '行为画像',
  '风险预警',
  '担保与经营',
  '关系网络',
  '多头共债',
  '催收案件',
  '贷后风险',
  '处置与操作日志',
] as const
type Tab = (typeof TABS)[number]

function money(n: number) {
  return `¥${n.toLocaleString()}`
}

/* ============ 字段级外部核验标记（绿✓通过 / 黄⚠未通过，绿✓带「!」悬停看渠道） ============ */
function VerifyMark({ checks }: { checks: CustExternalCheck[] }) {
  const [hover, setHover] = useState(false)
  const hasFail = checks.some((c) => c.status === '异常')
  const pending = checks.some((c) => c.status === '待核')
  const status: '一致' | '异常' | '待核' = hasFail ? '异常' : pending ? '待核' : '一致'
  const color = status === '一致' ? '#16A34A' : status === '异常' ? '#CA8A04' : '#94A3B8'
  const icon = status === '一致' ? '✓' : status === '异常' ? '⚠' : '?'
  const tip = checks.map((c) => `${c.source}·${c.item}：${c.result}（${c.status}）`).join('；')
  return (
    <span
      title={tip}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', marginLeft: 6, cursor: 'help' }}
    >
      <span style={{ color, fontSize: 13, fontWeight: 700 }}>{icon}</span>
      {status === '一致' && <span style={{ color, fontSize: 9, fontWeight: 700, marginLeft: 0.5 }}>!</span>}
      {hover && (
        <span
          style={{
            position: 'absolute',
            bottom: '150%',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#0F172A',
            color: '#fff',
            fontSize: 11,
            lineHeight: 1.5,
            padding: '6px 9px',
            borderRadius: 8,
            whiteSpace: 'nowrap',
            zIndex: 50,
            boxShadow: '0 4px 12px rgba(0,0,0,.18)',
          }}
        >
          {tip}
        </span>
      )}
    </span>
  )
}

/* ============ 模型评分（常驻 2×2：额度建议 + 智察 / 智信 / 智融 三卡，点击进详情） ============ */
function ModelScorePanel({ scores, custId }: { scores: CustScores; custId: string }) {
  const nav = useNavigate()
  const cards = [
    { prod: 'zhicha', c: scores.zhiCha },
    { prod: 'zhixin', c: scores.zhiXin },
    { prod: 'zhirong', c: scores.zhiRong },
  ]
  const go = (prod: string) => nav(`/console/cr/mid-cust-score?cust=${custId}&prod=${prod}`)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: 8, flex: 1, minHeight: 0 }}>
      {/* 额度建议：最左上角 */}
      <div style={{ border: '1px solid #EDE9FE', borderRadius: 10, padding: 10, background: '#F5F3FF', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 11, fontWeight: 600, color: '#6D28D9' }}>额度建议</div>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#6D28D9', marginTop: 3 }}>{money(scores.limitSuggest.suggested)}</div>
        <div style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>当前 {money(scores.limitSuggest.current)}</div>
      </div>
      {cards.map(({ prod, c }) => (
        <button
          key={prod}
          onClick={() => go(prod)}
          title={`查看 ${c.name} 详情`}
          style={{
            border: '1px solid #E2E8F0', borderRadius: 10, padding: 10, background: '#fff', cursor: 'pointer',
            textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 3, height: '100%', justifyContent: 'center', transition: 'border-color .15s, box-shadow .15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#A78BFA'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(139,92,246,.12)' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E2E8F0'; e.currentTarget.style.boxShadow = 'none' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{c.name}</span>
            <Badge kind={SCORE_KIND[c.level]}>{c.level}</Badge>
          </div>
          <div style={{ fontSize: 18, fontWeight: 800, color: '#0F172A' }}>{c.score}</div>
          <div style={{ height: 4, borderRadius: 3, background: '#EEF2FF', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.min(100, Math.round(c.score / 10))}%`, background: '#8B5CF6' }} />
          </div>
          <div style={{ fontSize: 10, color: '#8B5CF6' }}>› 查看模型详情</div>
        </button>
      ))}
    </div>
  )
}

/* ============ 关系图谱（SVG 网络图） ============ */
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
  self: '本人', person: '个人', company: '企业', account: '账户', device: '设备', product: '产品', org: '机构',
}

/* ============ 关系图谱（主题切换 + 力导向布局） ============ */
function RelationGraph({ graph, theme }: { graph: CustRelationGraph; theme: GraphTheme }) {
  const W = 720
  const H = 420
  const cx = W / 2
  const cy = H / 2
  const active = theme === '综合' ? graph.edges : graph.edges.filter((e) => e.theme === theme)
  const activeIds = new Set<string>(['self'])
  active.forEach((e) => { activeIds.add(e.source); activeIds.add(e.target) })
  const nodes = graph.nodes.filter((n) => activeIds.has(n.id))

  const pos = useMemo(() => {
    const ps: Record<string, { x: number; y: number }> = {}
    nodes.forEach((n, i) => {
      const ang = (Math.PI * 2 * i) / Math.max(nodes.length, 1)
      const rad = 70 + (i % 4) * 40
      ps[n.id] = { x: cx + rad * Math.cos(ang), y: cy + rad * Math.sin(ang) }
    })
    const selfN = nodes.find((n) => n.type === 'self')
    if (selfN) ps[selfN.id] = { x: cx, y: cy }
    for (let it = 0; it < 360; it++) {
      const disp: Record<string, { x: number; y: number }> = {}
      nodes.forEach((n) => (disp[n.id] = { x: 0, y: 0 }))
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = ps[nodes[i].id], b = ps[nodes[j].id]
          const dx = a.x - b.x, dy = a.y - b.y
          const d2 = dx * dx + dy * dy || 0.01
          const d = Math.sqrt(d2)
          const rep = 5200 / d2
          const fx = (dx / d) * rep, fy = (dy / d) * rep
          disp[nodes[i].id].x += fx; disp[nodes[i].id].y += fy
          disp[nodes[j].id].x -= fx; disp[nodes[j].id].y -= fy
        }
      }
      active.forEach((e) => {
        const a = ps[e.source], b = ps[e.target]
        if (!a || !b) return
        const dx = b.x - a.x, dy = b.y - a.y
        const d = Math.sqrt(dx * dx + dy * dy) || 0.01
        const att = d * d * 0.018
        const fx = (dx / d) * att, fy = (dy / d) * att
        disp[e.source].x += fx; disp[e.source].y += fy
        disp[e.target].x -= fx; disp[e.target].y -= fy
      })
      nodes.forEach((n) => {
        const p = ps[n.id]
        disp[n.id].x += (cx - p.x) * 0.012
        disp[n.id].y += (cy - p.y) * 0.012
      })
      const t = 9 * (1 - it / 360) + 0.4
      nodes.forEach((n) => {
        const p = ps[n.id]
        p.x += Math.max(-t, Math.min(t, disp[n.id].x))
        p.y += Math.max(-t, Math.min(t, disp[n.id].y))
        p.x = Math.max(34, Math.min(W - 34, p.x))
        p.y = Math.max(34, Math.min(H - 34, p.y))
      })
    }
    return ps
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph, theme])

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
        {active.map((e, i) => {
          const a = pos[e.source], b = pos[e.target]
          if (!a || !b) return null
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.danger ? '#DC2626' : '#CBD5E1'} strokeWidth={e.danger ? 1.8 : 1.1} strokeDasharray={e.danger ? '4 2' : undefined} />
        })}
        {nodes.map((n) => {
          const p = pos[n.id]
          const c = TYPE_COLOR[n.type] ?? '#64748B'
          const isHi = n.risk === '高危'
          const r = n.type === 'self' ? 26 : n.type === 'company' ? 22 : 18
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r={r} fill={c} fillOpacity={isHi ? 0.2 : n.risk === '关注' ? 0.14 : 0.1} stroke={isHi ? '#DC2626' : c} strokeWidth={isHi ? 2.2 : n.risk === '关注' ? 1.8 : 1.3} />
              <text x={p.x} y={p.y - 1} textAnchor="middle" fontSize={n.type === 'self' ? 12 : n.type === 'company' ? 11 : 10} fontWeight={600} fill={c}>{n.name.length > 6 ? n.name.slice(0, 5) + '…' : n.name}</text>
              <text x={p.x} y={p.y + 12} textAnchor="middle" fontSize={9} fill="#64748B">{n.rel}</text>
              {!!n.openAlerts && (
                <g>
                  <circle cx={p.x + r - 2} cy={p.y - r + 2} r={9} fill="#DC2626" stroke="#fff" strokeWidth={1.5} />
                  <text x={p.x + r - 2} y={p.y - r + 5.5} textAnchor="middle" fontSize={10} fontWeight={700} fill="#fff">{n.openAlerts}</text>
                </g>
              )}
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', gap: 14, fontSize: 11, color: '#64748B', marginTop: 6, flexWrap: 'wrap' }}>
        {Object.keys(TYPE_COLOR).map((k) => (
          <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 9, height: 9, borderRadius: '50%', background: TYPE_COLOR[k], display: 'inline-block' }} />{TYPE_LABEL[k] ?? k}
          </span>
        ))}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', border: '2px dashed #DC2626', display: 'inline-block' }} />高危/风险边
        </span>
      </div>
    </div>
  )
}

/* ============ 处置与操作日志（时间线） ============ */
function Timeline({ items }: { items: CustLogEntry[] }) {
  if (!items.length) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无处置与操作记录</div>
  return (
    <div style={{ position: 'relative', paddingLeft: 18 }}>
      <div style={{ position: 'absolute', left: 5, top: 4, bottom: 4, width: 2, background: '#E2E8F0' }} />
      {items.map((e, i) => (
        <div key={i} style={{ position: 'relative', paddingBottom: 16 }}>
          <span style={{ position: 'absolute', left: -16, top: 4, width: 10, height: 10, borderRadius: 999, background: e.kind === 'task' ? '#2563EB' : '#7C3AED', border: '2px solid #fff' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{e.title}</span>
            {e.status && <Badge kind={e.status === '待处置' ? 'red' : e.status === '处置中' ? 'amber' : 'green'}>{e.status}</Badge>}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{e.time} · {e.sub}</div>
        </div>
      ))}
    </div>
  )
}

/* ============ 单客详情 ============ */
export function CustProfile() {
  const d = useCustData()
  const cur = d.customers[0]
  const [tab, setTab] = useState<Tab>('基本信息')
  const [relTheme, setRelTheme] = useState<GraphTheme>('综合')
  const fieldCols = useScreenCols()

  if (!cur) return <div style={{ padding: 24 }}>暂无单客档案</div>

  // ---- 基本信息：身份 / 职业收入 / 联系方式（字段级外部核验标记） ----
  type InfoDef = { field: string; label: string; value: string }
  const infoDefs: InfoDef[] = [
    { field: 'custId', label: '客户标识', value: cur.custId },
    { field: 'maskedId', label: '证件号（脱敏）', value: cur.maskedId },
    { field: 'gender', label: '性别', value: cur.gender },
    { field: 'age', label: '年龄', value: `${cur.age} 岁` },
    { field: 'education', label: '学历', value: cur.education },
    { field: 'marital', label: '婚姻状况', value: cur.marital },
    { field: 'region', label: '所在地', value: cur.region },
  ]
  const jobDefs: InfoDef[] = [
    { field: 'occupation', label: '职业', value: cur.occupation },
    { field: 'employer', label: '工作单位', value: cur.employer },
    { field: 'income', label: '月收入', value: money(cur.income) },
    { field: 'channel', label: '进件渠道', value: cur.channel },
  ]
  // 联系方式：手机号（摘要 + 悬浮展开）+ 邮箱 + 多地址（户籍 / 居住 / 公司），一起进网格
  const contactDefs: InfoDef[] = [
    { field: 'phone', label: '手机号', value: cur.phones[0].number },
    { field: 'email', label: '邮箱', value: cur.email },
    ...cur.addresses.map((a) => ({ field: '', label: a.type, value: a.value })),
  ]
  const [phoneHover, setPhoneHover] = useState(false)
  // 税务 / 社保 截屏（来自 field==='income' 的核验项）
  const taxShots = cur.externalChecks
    .filter((e) => e.field === 'income')
    .map((e) => ({ title: `${e.source}·${e.item}`, note: e.result, status: e.status }))
  // 字段级外部核验：按 field 归集，未归集的进入「其他外部核验」列表
  const checksByField: Record<string, CustExternalCheck[]> = {}
  cur.externalChecks.forEach((e) => {
    if (e.field) (checksByField[e.field] ??= []).push(e)
  })
  const otherChecks = cur.externalChecks.filter((e) => !e.field)

  // ---- 授信与额度明细 ----
  const limitCols: Column[] = [
    { key: 'product', label: '贷款产品', type: 'text', fixed: 'left', width: '220px' },
    { key: 'balance', label: '已用额度', type: 'money', width: '140px', tag: 'calc' },
    { key: 'rate', label: '年化利率', type: 'percent', width: '120px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '110px' },
  ]
  const limitRows: Row[] = cur.loans.map((l) => ({
    id: l.id,
    product: l.product,
    balance: l.balance,
    rate: l.rate,
    status: { v: l.status, kind: l.status === '逾期' ? 'red' : l.status === '结清' ? 'gray' : 'green' },
  }))

  // ---- 贷款台账（在贷借据明细，本行核心系统，独立「负债与逾期」Tab）----
  const debtCols: Column[] = [
    { key: 'id', label: '借据号', type: 'text', fixed: 'left', width: '130px' },
    { key: 'product', label: '产品', type: 'text', width: '200px' },
    { key: 'principal', label: '合同本金', type: 'money', width: '140px' },
    { key: 'balance', label: '当前余额', type: 'money', width: '140px' },
    { key: 'rate', label: '年化', type: 'percent', width: '90px' },
    { key: 'term', label: '期限(月)', type: 'number', width: '100px' },
    { key: 'monthly', label: '月供', type: 'money', width: '120px' },
    { key: 'dueDays', label: '逾期天数', type: 'number', width: '100px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '100px' },
  ]
  const debtRows: Row[] = cur.loans.map((l) => ({
    id: l.id,
    product: l.product,
    principal: l.principal,
    balance: l.balance,
    rate: l.rate,
    term: l.term,
    monthly: l.monthly,
    dueDays: l.dueDays ?? 0,
    status: { v: l.status, kind: l.status === '逾期' ? 'red' : l.status === '结清' ? 'gray' : 'green' },
  }))

  // ---- 风险预警 ----
  const alertCols: Column[] = [
    { key: 'id', label: '预警号', type: 'text', width: '140px' },
    { key: 'rule', label: '命中规则', type: 'text' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'red', width: '90px' },
    { key: 'date', label: '触发日期', type: 'text', width: '120px' },
    { key: 'desc', label: '说明', type: 'text' },
    { key: 'status', label: '处置状态', type: 'badge', badgeKind: 'blue', width: '110px' },
  ]
  const alertRows: Row[] = cur.alerts.map((a) => ({
    id: a.id,
    rule: a.rule,
    level: { v: a.level, kind: a.level === '红' ? 'red' : a.level === '黄' ? 'amber' : 'blue' },
    date: a.date,
    desc: a.desc,
    status: { v: a.status, kind: a.status === '待处置' ? 'red' : a.status === '处置中' ? 'amber' : 'green' },
  }))
  const redCount = cur.alerts.filter((a) => a.level === '红').length
  const yellowCount = cur.alerts.filter((a) => a.level === '黄').length
  const pendingCount = cur.alerts.filter((a) => a.status === '待处置').length

  const dangerBehavior = cur.behavior.filter((b) => b.danger && b.count > 0).length

  // ---- 征信 ----
  const queryCols: Column[] = [
    { key: 'org', label: '查询机构', type: 'text', fixed: 'left', width: '200px' },
    { key: 'date', label: '日期', type: 'text', width: '140px' },
    { key: 'type', label: '查询类型', type: 'text' },
  ]
  const queryRows: Row[] = cur.credit.recentQueries.map((q, i) => ({ id: `q${i}`, org: q.org, date: q.date, type: q.type }))
  const acctCols: Column[] = [
    { key: 'type', label: '账户类型', type: 'text', fixed: 'left', width: '150px' },
    { key: 'bank', label: '机构', type: 'text', width: '150px' },
    { key: 'openDate', label: '开立日期', type: 'text', width: '120px' },
    { key: 'dueDate', label: '到期日', type: 'text', width: '120px' },
    { key: 'creditLimit', label: '授信额度', type: 'money', width: '130px' },
    { key: 'balance', label: '余额', type: 'money', width: '130px' },
    { key: 'guarantee', label: '担保方式', type: 'text', width: '90px' },
    { key: 'currency', label: '币种', type: 'text', width: '90px' },
    { key: 'overdue', label: '当前逾期', type: 'text', width: '150px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '100px' },
  ]
  const acctRows: Row[] = cur.credit.accounts.map((a, i) => ({
    id: `a${i}`,
    type: a.type,
    bank: a.bank,
    openDate: a.openDate,
    dueDate: a.dueDate,
    creditLimit: a.creditLimit,
    balance: a.balance,
    guarantee: a.guarantee,
    currency: a.currency,
    overdue: a.overdueMonths > 0 ? `${a.overdueMonths} 期 · ${money(a.overdueAmt)}` : '—',
    status: {
      v: a.status,
      kind: a.status === '逾期' || a.status === '呆账' || a.status === '冻结' || a.status === '止付' ? 'red' : a.status === '关注' ? 'amber' : 'green',
    },
  }))

  // ---- 设备与欺诈 ----
  const devDanger = cur.device.envRiskScore >= 60 || cur.device.simulator
  const sameDevRows: Row[] = cur.device.sameDeviceAccounts.map((s, i) => ({ id: `d${i}`, name: s.name, custId: s.custId }))

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell
        title="单客详情"
        crumb={`${CRUMB} / ${cur.name}`}
        actions={
          <>
            <Sam label="单客样例" value="custProfileData.ts" />
            <Cal label="实时聚合" />
          </>
        }
      />

      {/* 第一行：简介（左）+ 模型评分 2×2（右） 两栏等高对齐 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 12, alignItems: 'stretch', marginBottom: 12 }}>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg,#8B5CF6,#D946EF)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                {cur.avatarText}
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', display: 'flex', alignItems: 'center', gap: 8 }}>
                  {cur.name} <Badge kind={STATUS_KIND[cur.status]}>{cur.status}</Badge>
                </div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                  {cur.tags.map((t) => (
                    <Badge key={t} kind="blue">
                      {t}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Button size="sm" variant={cur.followed ? 'secondary' : 'primary'} onClick={() => toggleFollowCust(cur.custId)}>
                {cur.followed ? '已关注' : '＋ 关注'}
              </Button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 14 }}>
            {[
              ['身份证照片', '#475569'],
              ['身份证头像', '#0F766E'],
              ['最近采集照片', '#7C3AED'],
            ].map(([label, bg]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <img
                  src={photoDataUri(label, bg)}
                  alt={label}
                  style={{ width: 92, height: 116, borderRadius: 8, border: '1px solid #E2E8F0', objectFit: 'cover', display: 'block' }}
                />
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{label}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: '#64748B' }}>
            <span>证件号：{cur.maskedId}</span>
            <span>手机号：{cur.phone}</span>
            <span>所在地：{cur.region}</span>
            <span>进件渠道：{cur.channel}</span>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: '#64748B' }}>
            <span>性别：{cur.gender}</span>
            <span>年龄：{cur.age} 岁</span>
            <span>学历：{cur.education}</span>
            <span>婚姻状况：{cur.marital}</span>
            <span>客户标识：{cur.custId}</span>
          </div>
        </div>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 12, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>模型评分</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>点击卡片查看明细 <Sam label="样例" value="custProfileData.ts" /></span>
          </div>
          <ModelScorePanel scores={cur.scores} custId={cur.custId} />
        </div>
      </div>

      {/* Tab 导航 */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E2E8F0', marginBottom: 14, flexWrap: 'wrap' }}>
        {TABS.map((t) => {
          const badge = tabBadge(t, cur)
          return (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '8px 14px',
                fontSize: 13,
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: t === tab ? '#8B5CF6' : '#64748B',
                fontWeight: t === tab ? 700 : 400,
                borderBottom: t === tab ? '2px solid #8B5CF6' : '2px solid transparent',
                marginBottom: -1,
              }}
            >
              {t}
              {badge && <span style={{ fontSize: 11, opacity: 0.7, marginLeft: 2 }}>（{badge}）</span>}
            </button>
          )
        })}
      </div>

      {/* Tab 内容 */}
      {tab === '基本信息' && (
        <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {devDanger && (
                <div style={{ borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>
                  ⚠ 环境风险分 {cur.device.envRiskScore}（{cur.device.simulator ? '检测到模拟器' : '偏高'}），同设备关联 {cur.device.sameDeviceAccounts.length} 个账号，疑似团伙欺诈。
                </div>
              )}
              <Panel title="基础档案" desc={<span>身份 / 职业 / 联系 · <Sam value="custProfileData.ts" /></span>}>
                {/* 照片排：证件照 + 税务截图 */}
                <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
                  {[
                    ['身份证照片', '#475569'],
                    ['身份证头像', '#0F766E'],
                    ['最近采集照片', '#7C3AED'],
                  ].map(([label, bg]) => (
                    <div key={label} style={{ textAlign: 'center' }}>
                      <img src={photoDataUri(label, bg)} alt={label} style={{ width: 92, height: 116, borderRadius: 8, border: '1px solid #E2E8F0', objectFit: 'cover', display: 'block' }} />
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{label}</div>
                    </div>
                  ))}
                  {taxShots.map((s, i) => (
                    <div key={i} style={{ textAlign: 'center' }}>
                      <img src={appShotDataUri(s)} alt={s.title} style={{ width: 92, height: 116, borderRadius: 8, border: '1px solid #E2E8F0', objectFit: 'cover', display: 'block' }} />
                      <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>{s.title}</div>
                    </div>
                  ))}
                </div>
                {/* 分组 A：身份与联系 */}
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '2px 0 8px' }}>身份信息</div>
                <div style={{ display: 'grid', gridTemplateColumns: fieldCols === 3 ? '1fr 1fr 1fr' : fieldCols === 2 ? '1fr 1fr' : '1fr', gap: '6px 24px', fontSize: 13, marginBottom: 16 }}>
                  {infoDefs.map((def) => {
                    const cs = checksByField[def.field]
                    return (
                      <div key={def.field} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                        <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{def.label}</span>
                        <span style={{ color: '#334155', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          {def.value}
                          {cs && <VerifyMark checks={cs} />}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '2px 0 8px' }}>联系方式</div>
                <div style={{ display: 'grid', gridTemplateColumns: fieldCols === 3 ? '1fr 1fr 1fr' : fieldCols === 2 ? '1fr 1fr' : '1fr', gap: '6px 24px', fontSize: 13, marginBottom: 16 }}>
                  {contactDefs.map((def, i) => {
                    const cs = def.field ? checksByField[def.field] : undefined
                    if (def.field === 'phone') {
                      return (
                        <div
                          key={i}
                          onMouseEnter={() => setPhoneHover(true)}
                          onMouseLeave={() => setPhoneHover(false)}
                          style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}
                        >
                          <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{def.label}</span>
                          <span style={{ color: '#334155', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                            {def.value}
                            {cur.phones.length > 1 && (
                              <span style={{ fontSize: 11, lineHeight: 1, background: '#EEF2FF', color: '#534AB7', borderRadius: 999, padding: '2px 7px' }}>
                                共 {cur.phones.length} 个
                              </span>
                            )}
                          </span>
                          {phoneHover && cur.phones.length > 1 && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: 6, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(15,23,42,.12)', padding: 10, zIndex: 20, minWidth: 230 }}>
                              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>全部手机号（脱敏 · 核验）</div>
                              {cur.phones.map((p, j) => (
                                <div key={j} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, padding: '5px 0', borderBottom: j < cur.phones.length - 1 ? '1px dashed #F1F5F9' : 'none' }}>
                                  <span style={{ color: '#334155' }}>
                                    {p.number}
                                    {j === 0 && <span style={{ color: '#94A3B8', fontSize: 11, marginLeft: 4 }}>主号</span>}
                                  </span>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: p.verified ? '#16A34A' : '#D97706' }}>
                                    {p.verified ? '✓ 已核验' : '待核'}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    }
                    return (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                        <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{def.label}</span>
                        <span style={{ color: '#334155', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 2, textAlign: 'right' }}>
                          {def.value}
                          {cs && <VerifyMark checks={cs} />}
                        </span>
                      </div>
                    )
                  })}
                </div>
                {/* 分组 B：职业与收入 */}
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '2px 0 8px' }}>职业与收入</div>
                <div style={{ display: 'grid', gridTemplateColumns: fieldCols === 3 ? '1fr 1fr 1fr' : fieldCols === 2 ? '1fr 1fr' : '1fr', gap: '6px 24px', fontSize: 13 }}>
                  {jobDefs.map((def) => {
                    const cs = checksByField[def.field]
                    return (
                      <div key={def.field} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                        <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{def.label}</span>
                        <span style={{ color: '#334155', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                          {def.value}
                          {cs && <VerifyMark checks={cs} />}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </Panel>
              {otherChecks.length > 0 && (
                <Panel title="其他外部核验" desc={<span>司法 / 工商等渠道核验（未直接对应基本信息字段）· <Sam value="custProfileData.ts" /></span>}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {otherChecks.map((e, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Badge kind="blue">{e.source}</Badge>
                          <div>
                            <div style={{ fontSize: 13, color: '#334155', fontWeight: 500 }}>{e.item}</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>{e.result}</div>
                          </div>
                        </div>
                        <Badge kind={e.status === '一致' ? 'green' : e.status === '异常' ? 'red' : 'amber'}>{e.status}</Badge>
                      </div>
                    ))}
                  </div>
                </Panel>
              )}
              <Panel title="实名与设备核验" desc={<span>设备指纹 / 环境反欺诈 · <Sam value="custProfileData.ts" /></span>}>
                <div style={{ display: 'grid', gridTemplateColumns: fieldCols === 3 ? '1fr 1fr 1fr' : fieldCols === 2 ? '1fr 1fr' : '1fr', gap: '6px 24px', fontSize: 13 }}>
                  {[
                    ['设备号', cur.device.device],
                    ['机型', cur.device.model],
                    ['操作系统', cur.device.os],
                    ['常用登录地', cur.device.loginRegion],
                    ['最近登录', cur.device.lastLogin],
                    ['环境风险分', String(cur.device.envRiskScore)],
                    ['模拟器', cur.device.simulator ? '是（风险）' : '否'],
                  ].map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                      <span style={{ color: '#94A3B8' }}>{k}</span>
                      <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              </Panel>
              {cur.device.sameDeviceAccounts.length > 0 && (
                <Panel title="同设备多账号" desc={<span>同设备登录的其他借贷账号 · <Cal label="实时聚合" /></span>}>
                  <DataTable
                    columns={[{ key: 'name', label: '姓名', type: 'text', fixed: 'left' }, { key: 'custId', label: '客户标识', type: 'text' }]}
                    rows={sameDevRows}
                    empty="无"
                    pager
                    defaultPageSize={8}
                  />
                </Panel>
              )}
          </div>
        </>
      )}

      {tab === '授信与额度' && (
        <>
          <Panel title="额度明细" desc={<span>各产品已用额度 · <Cal label="实时聚合" /></span>}>
            <DataTable columns={limitCols} rows={limitRows} empty="无" pager defaultPageSize={10} />
          </Panel>
        </>
      )}

      {tab === '行为画像' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8 }}>
            {cur.behavior.map((it) => (
              <div
                key={it.name}
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: 8,
                  padding: '8px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: it.danger ? '#FEF2F2' : '#fff',
                }}
              >
                <span style={{ fontSize: 12, color: it.danger ? '#DC2626' : '#475569' }}>{it.name}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: it.danger ? '#DC2626' : '#334155' }}>{it.count}</span>
              </div>
            ))}
          </div>
          {dangerBehavior > 0 && (
            <div style={{ marginTop: 12, borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>
              ⚠ 命中 {dangerBehavior} 项风险行为（逾期还款 / 多头借贷 / 夜间用信 / 额度使用率过高），建议结合风险预警联动处置。
            </div>
          )}
        </>
      )}

      {tab === '风险预警' && (
        <>
          <Panel title="预警记录" desc={<span>贷中监控命中规则 · <Sam value="custProfileData.ts" /></span>}>
            <DataTable columns={alertCols} rows={alertRows} empty="无预警记录" pager defaultPageSize={10} />
          </Panel>
        </>
      )}

      {tab === '关系网络' && (
        <>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
            {(cur.relationGraph.themes ?? ['综合']).map((th) => (
              <button
                key={th}
                onClick={() => setRelTheme(th)}
                style={{
                  fontSize: 12,
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: '1px solid',
                  borderColor: th === relTheme ? '#8B5CF6' : '#E2E8F0',
                  background: th === relTheme ? '#F5F3FF' : '#fff',
                  color: th === relTheme ? '#6D28D9' : '#475569',
                  cursor: 'pointer',
                }}
              >
                {th}
              </button>
            ))}
          </div>
          <Panel title={`关系图谱 · ${relTheme}`} desc={<span>融合联系人、共债、资金、担保、设备等多维关系 · <Sam value="custProfileData.ts" /></span>}>
            <RelationGraph graph={cur.relationGraph} theme={relTheme} />
          </Panel>
          <Panel title="关系人清单（融合联系人 / 图谱节点）" desc={<span>去重合并的关系人 · <Sam value="custProfileData.ts" /></span>} className="mt-3">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
              {cur.relationGraph.nodes
                .filter((n) => n.type !== 'self' && (relTheme === '综合' || cur.relationGraph.edges.some((e) => e.theme === relTheme && (e.source === n.id || e.target === n.id))))
                .map((n) => (
                  <div key={n.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 12px', background: n.risk === '高危' ? '#FEF2F2' : '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{n.name}</span>
                      <Badge kind={n.risk === '高危' ? 'red' : n.risk === '关注' ? 'amber' : 'blue'}>{n.rel}</Badge>
                    </div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4, lineHeight: 1.5 }}>
                      {n.phone && <span>电话：{n.phone}　</span>}
                      {n.detail}
                    </div>
                  </div>
                ))}
            </div>
          </Panel>
        </>
      )}

      {/* ====== 新补齐板块 ====== */}

      {tab === '央行征信' && (
        <>
          <Panel title="信息概要" desc={<span>账户数汇总 · <Sam value="custProfileData.ts" /></span>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <SummaryCard label="信用卡账户" value={cur.credit.summary.creditCards} unit="个" />
              <SummaryCard label="贷款笔数" value={cur.credit.summary.loans} unit="笔" />
              <SummaryCard label="逾期账户" value={cur.credit.summary.overdueAccounts} unit="个" danger={cur.credit.summary.overdueAccounts > 0} />
              <SummaryCard label="90天以上逾期" value={cur.credit.summary.overdue90Plus} unit="个" danger={cur.credit.summary.overdue90Plus > 0} />
              <SummaryCard label="对外担保" value={cur.credit.summary.guaranteeCount} unit="笔" danger={cur.credit.summary.guaranteeCount > 0} />
              <SummaryCard label="相关还款责任" value={cur.credit.summary.relatedRepay} unit="个" danger={cur.credit.summary.relatedRepay > 0} />
            </div>
          </Panel>
          <Panel title="近 6 月查询记录" desc={<span>征信查询明细 · <Sam value="custProfileData.ts" /></span>}>
            <DataTable columns={queryCols} rows={queryRows} empty="无查询记录" pager defaultPageSize={8} />
          </Panel>
          <Panel title="信贷账户明细" desc={<span>人行征信账户 · <Sam value="custProfileData.ts" /></span>} className="mt-3">
            <DataTable columns={acctCols} rows={acctRows} empty="无信贷账户" pager defaultPageSize={8} />
          </Panel>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 12 }}>
            <Panel title="征信逾期" desc={<span>当前征信逾期 · <Cal label="实时聚合" /></span>}>
              <div style={{ fontSize: 13, color: '#475569' }}>
                逾期笔数：<b style={{ color: cur.credit.overdue.count > 0 ? '#DC2626' : '#16A34A' }}>{cur.credit.overdue.count}</b> 笔 ｜ 逾期金额：<b style={{ color: cur.credit.overdue.amount > 0 ? '#DC2626' : '#16A34A' }}>{money(cur.credit.overdue.amount)}</b>
              </div>
            </Panel>
            <Panel title="对外担保" desc={<span>担保责任 · <Sam value="custProfileData.ts" /></span>}>
              {cur.credit.guarantee.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {cur.credit.guarantee.map((g, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                      <span style={{ color: '#64748B' }}>{g.name}</span>
                      <span style={{ color: '#334155' }}>{money(g.amount)} · <Badge kind={g.status === '关注' ? 'amber' : 'gray'}>{g.status}</Badge></span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#94A3B8' }}>无对外担保</div>
              )}
            </Panel>
          </div>
        </>
      )}

      {tab === '负债与逾期' && (
        <>
          <Panel title="贷款台账" desc={<span>在贷借据明细 · 本行核心系统(Sam)</span>}>
            <DataTable columns={debtCols} rows={debtRows} empty="无在贷记录" pager defaultPageSize={10} />
          </Panel>
        </>
      )}

      {tab === '担保与经营' && (
        <>
          <Panel title="担保抵押物" desc={<span>抵押 / 质押物 · <Sam value="custProfileData.ts" /></span>}>
            {cur.collateralBiz.collateral.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cur.collateralBiz.collateral.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                    <span style={{ color: '#64748B' }}>{c.name}（{c.type}）</span>
                    <span style={{ color: '#334155' }}>{money(c.value)} · <Badge kind={c.status === '评估中' ? 'amber' : 'gray'}>{c.status}</Badge></span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>无担保抵押物（纯信用客户）</div>
            )}
          </Panel>
          <Panel title="经营实体" desc={<span>名下经营实体 · <Sam value="custProfileData.ts" /></span>} className="mt-3">
            {cur.collateralBiz.business.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cur.collateralBiz.business.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                    <span style={{ color: '#64748B' }}>{b.name}</span>
                    <span style={{ color: '#334155' }}>{b.role} · <Badge kind={b.status === '存续' ? 'green' : 'gray'}>{b.status}</Badge></span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>无经营实体</div>
            )}
          </Panel>
        </>
      )}

      {tab === '多头共债' && (
        <>
          <Panel title="共债机构清单" desc={<span>跨机构共债明细 · <Cal label="实时聚合" /></span>}>
            <DataTable
              columns={[
                { key: 'org', label: '机构', type: 'text', fixed: 'left', width: '200px' },
                { key: 'product', label: '产品', type: 'text', width: '200px' },
                { key: 'balance', label: '余额', type: 'money', width: '140px' },
                { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '110px' },
              ]}
              rows={cur.coDebt.orgs.map((o, i) => ({ id: `o${i}`, org: o.org, product: o.product, balance: o.balance, status: { v: o.status, kind: o.status === '逾期' ? 'red' : o.status === '关注' ? 'amber' : 'green' } }))}
              empty="无共债"
              pager
              defaultPageSize={8}
            />
          </Panel>
          <Panel title="共债链条" desc={<span>资金中介 / 同设备关联 · <Cal label="实时聚合" /></span>} className="mt-3">
            {cur.coDebt.chain.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cur.coDebt.chain.map((c, i) => (
                  <div key={i} style={{ fontSize: 13, color: '#334155', borderLeft: '3px solid #DC2626', paddingLeft: 10 }}>{c}</div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>无共债链条</div>
            )}
          </Panel>
        </>
      )}

      {tab === '催收案件' && (
        <>
          {cur.collections.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cur.collections.map((cs) => (
                <div key={cs.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{cs.id}</span>
                    <Badge kind={STAGE_KIND[cs.stage]}>{cs.stage}</Badge>
                    <span style={{ fontSize: 12, color: '#64748B' }}>{cs.product}</span>
                    <Badge kind={cs.status === '委外' || cs.status === '核销' ? 'red' : cs.status === '承诺还款' ? 'green' : 'blue'}>{cs.status}</Badge>
                    <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>催收员 {cs.owner} ｜ 最近触达 {cs.lastTouch}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 10 }}>
                    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>逾期金额</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#DC2626' }}>{money(cs.overdueAmt)}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>逾期天数</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{cs.overdueDays} 天</div>
                    </div>
                    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>应还日</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{cs.dueDate}</div>
                    </div>
                    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
                      <div style={{ fontSize: 11, color: '#94A3B8' }}>触达</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{cs.calls} 呼 / {cs.sms} 信</div>
                    </div>
                  </div>
                  {cs.notes.length > 0 && (
                    <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: 8 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>催收记录</div>
                      {cs.notes.slice(0, 3).map((n, i) => (
                        <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, padding: '3px 0', color: '#334155' }}>
                          <span style={{ color: '#94A3B8', flexShrink: 0 }}>{n.time}</span>
                          <span style={{ color: '#64748B', flexShrink: 0 }}>{n.who}</span>
                          <span>{n.what}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: '#94A3B8' }}>该客户当前无催收案件</div>
          )}
        </>
      )}

      {tab === '贷后风险' && (
        <>
          <Panel title="资金流向监控" desc={<span>贷后资金流向与标记 · <Cal label="实时聚合" /></span>}>
            <DataTable
              columns={[
                { key: 'date', label: '日期', type: 'text', width: '130px' },
                { key: 'direction', label: '方向', type: 'text', width: '80px' },
                { key: 'counterparty', label: '交易对手', type: 'text' },
                { key: 'amount', label: '金额', type: 'money', width: '140px' },
                { key: 'flag', label: '标记', type: 'badge', badgeKind: 'red', width: '140px' },
              ]}
              rows={cur.postRisk.fundFlow.map((f, i) => ({ id: `f${i}`, date: f.date, direction: f.direction, counterparty: f.counterparty, amount: f.amount, flag: { v: f.flag, kind: f.flag.includes('疑似') || f.flag.includes('不明') ? 'red' : 'blue' } }))}
              empty="无资金流向"
              pager
              defaultPageSize={8}
            />
          </Panel>
          <Panel title="黑名单反欺诈" desc={<span>本行 / 互金协会等名单 · <Cal label="实时聚合" /></span>} className="mt-3">
            {cur.postRisk.blacklist.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cur.postRisk.blacklist.map((b, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                    <span style={{ color: '#64748B' }}>{b.list}：{b.hit}</span>
                    <Badge kind={b.status === '正常' ? 'green' : b.status === '高风险' ? 'red' : 'amber'}>{b.status}</Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>未命中黑名单</div>
            )}
          </Panel>
        </>
      )}

      {tab === '处置与操作日志' && (
        <Panel title="处置与操作日志" desc={<span>处置工单 + 历史操作记录 · <Sam value="custProfileData.ts" /></span>}>
          <Timeline items={cur.disposeLog} />
        </Panel>
      )}
    </div>
  )
}
