/* 单客详情（零售信贷 · 贷中监控）· 页面（挂在「零售信贷风控 cr」子系统 · 贷中监控分区末尾）
 * 模块：单客 360° 画像（cr:mid-single-cust）
 * 顶层设计：功能 / 数据分离 —— 本文件只负责「功能（渲染）」，所有数据来自 custProfileData.ts。
 *   数据：custProfileData.ts（纯数据 + store，橘 Sam 样例，灰 Cal 实时聚合）
 *   结构：对齐企业档案（ep:qiye-profile）的头部卡 + 在档切换 + 板块化布局，并补齐 MidCustDetail
 *         的重度风控维度（模型评分 / 征信 / 设备与欺诈 / 外部核验 / 担保与经营 / 关系图谱 /
 *         多头共债 / 催收 / 贷后风险 / 处置日志），做到内容对等、实现独立（不引用 MidCustDetail）。
 */
import { useState } from 'react'
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
  type CustLogEntry,
} from './custProfileData'

const CRUMB = '零售信贷风控 / 贷中监控 / 单客详情'

const STATUS_KIND: Record<string, 'green' | 'blue' | 'amber' | 'red' | 'gray'> = {
  正常: 'green',
  关注: 'amber',
  逾期: 'red',
  冻结: 'gray',
}
const CHECK_KIND: Record<string, 'green' | 'amber' | 'red'> = { 一致: 'green', 待核: 'amber', 异常: 'red' }
const STAGE_KIND: Record<string, 'green' | 'blue' | 'amber' | 'red'> = { M1: 'blue', M2: 'amber', 'M3+': 'red' }
const SCORE_KIND: Record<string, 'green' | 'blue' | 'amber' | 'red'> = { 优: 'green', 良: 'blue', 中: 'amber', 差: 'red' }

const TABS = [
  '基本信息',
  '授信与额度',
  '负债与逾期',
  '行为画像',
  '风险预警',
  '联系人关系',
  '模型评分',
  '征信',
  '设备与欺诈',
  '外部数据核验',
  '担保与经营',
  '关系图谱',
  '多头共债',
  '催收案件',
  '贷后风险',
  '处置与操作日志',
] as const
type Tab = (typeof TABS)[number]

function money(n: number) {
  return `¥${n.toLocaleString()}`
}

/* ============ 模型评分（常驻面板：智察 / 智信 / 智融 三卡 + 额度建议） ============ */
function ModelScorePanel({ scores }: { scores: CustScores }) {
  const cards = [scores.zhiCha, scores.zhiXin, scores.zhiRong]
  return (
    <Panel title="模型评分" desc={<span>准入 / 授信三评分卡 <Sam label="样例" /> 智察(反欺诈) / 智信(信用) / 智融(综合) 与额度建议</span>} className="mb-3">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {cards.map((c) => (
          <div key={c.name} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{c.name}</span>
              <Badge kind={SCORE_KIND[c.level]}>{c.level}</Badge>
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0F172A', marginTop: 6 }}>{c.score}</div>
            <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
              {c.factors.map((f) => (
                <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B' }}>
                  <span>{f.name}</span>
                  <span style={{ color: f.impact === '正面' ? '#16A34A' : f.impact === '负面' ? '#DC2626' : '#94A3B8' }}>{f.detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        <div style={{ border: '1px solid #EDE9FE', borderRadius: 12, padding: 14, background: '#F5F3FF' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6D28D9' }}>额度建议</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: '#6D28D9', marginTop: 6 }}>{money(scores.limitSuggest.suggested)}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>当前授信 {money(scores.limitSuggest.current)}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 8 }}>{scores.limitSuggest.note}</div>
        </div>
      </div>
    </Panel>
  )
}

/* ============ 关系图谱（SVG 网络图） ============ */
function RelationGraph({ graph }: { graph: CustRelationGraph }) {
  const W = 680
  const H = 340
  const cx = W / 2
  const cy = H / 2
  const others = graph.nodes.filter((n) => n.id !== 'self')
  const R = Math.min(W, H) / 2 - 60
  const pos: Record<string, { x: number; y: number }> = {}
  const self = graph.nodes.find((n) => n.id === 'self')
  if (self) pos[self.id] = { x: cx, y: cy }
  others.forEach((n, i) => {
    const ang = (Math.PI * 2 * i) / others.length - Math.PI / 2
    pos[n.id] = { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }
  })
  const color = (kind: 'person' | 'company') => (kind === 'company' ? '#2563EB' : '#7C3AED')
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 240px', gap: 16, alignItems: 'start' }}>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', background: '#F8FAFC', borderRadius: 12, border: '1px solid #E2E8F0' }}>
        {graph.edges.map((e, i) => {
          const a = pos[e.source]
          const b = pos[e.target]
          if (!a || !b) return null
          return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={e.rel === '共债' || e.rel === '共债链条' ? '#DC2626' : '#CBD5E1'} strokeWidth={e.rel === '共债' || e.rel === '共债链条' ? 1.8 : 1.2} strokeDasharray={e.rel === '共债链条' ? '4 2' : undefined} />
        })}
        {graph.nodes.map((n) => {
          const p = pos[n.id]
          const c = color(n.type)
          const isHi = n.risk === '高危'
          const r = n.type === 'company' ? 24 : 19
          return (
            <g key={n.id}>
              <circle cx={p.x} cy={p.y} r={r} fill={c} fillOpacity={isHi ? 0.18 : 0.1} stroke={isHi ? '#DC2626' : c} strokeWidth={isHi ? 2 : 1.4} />
              <text x={p.x} y={p.y - 2} textAnchor="middle" fontSize={n.type === 'company' ? 11 : 10} fontWeight={600} fill={c}>{n.name.slice(0, 5)}</text>
              <text x={p.x} y={p.y + 11} textAnchor="middle" fontSize={9} fill="#64748B">{n.rel}</text>
              {isHi && <text x={p.x} y={p.y - r - 6} textAnchor="middle" fontSize={10} fontWeight={700} fill="#DC2626">{n.openAlerts ?? ''} 高危</text>}
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 2 }}>关系列表</div>
        {graph.nodes.filter((n) => n.id !== 'self').map((n) => (
          <div key={n.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: n.risk === '高危' ? '#FEF2F2' : '#fff' }}>
            <span style={{ fontSize: 12, color: '#334155' }}>{n.name}</span>
            <Badge kind={n.risk === '高危' ? 'red' : n.type === 'company' ? 'blue' : 'violet'}>{n.rel}</Badge>
          </div>
        ))}
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
  const [cur, setCur] = useState<CustProfile>(d.customers[0])
  const [tab, setTab] = useState<Tab>('基本信息')

  const switchTo = (c: CustProfile) => {
    setCur(c)
    setTab('基本信息')
  }

  if (!cur) return <div style={{ padding: 24 }}>暂无单客档案</div>

  // ---- 基本信息：身份 / 职业收入 / 联系方式 ----
  const infoRows: [string, string][] = [
    ['客户标识', cur.custId],
    ['证件号（脱敏）', cur.maskedId],
    ['性别', cur.gender],
    ['年龄', `${cur.age} 岁`],
    ['学历', cur.education],
    ['婚姻状况', cur.marital],
    ['所在地', cur.region],
  ]
  const jobRows: [string, string][] = [
    ['职业', cur.occupation],
    ['工作单位', cur.employer],
    ['月收入', money(cur.income)],
    ['收入证明', cur.incomeProof],
    ['进件渠道', cur.channel],
  ]

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

  // ---- 负债与逾期：贷款台账 ----
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

  // ---- 联系人 / 关系 ----
  const contactCols: Column[] = [
    { key: 'name', label: '姓名', type: 'text', fixed: 'left', width: '140px' },
    { key: 'relation', label: '关系', type: 'text', width: '140px' },
    { key: 'phone', label: '联系方式（脱敏）', type: 'text', width: '180px' },
    { key: 'coDebt', label: '是否共债', type: 'badge', badgeKind: 'red', width: '110px' },
  ]
  const contactRows: Row[] = cur.contacts.map((c) => ({
    id: c.id,
    name: c.name,
    relation: c.relation,
    phone: c.phone,
    coDebt: c.coDebt ? { v: '共债', kind: 'red' } : { v: '否', kind: 'gray' },
  }))
  const coDebtCount = cur.contacts.filter((c) => c.coDebt).length
  const relationCount = cur.contacts.filter((c) => c.relation === '关联账户').length

  const dangerBehavior = cur.behavior.filter((b) => b.danger && b.count > 0).length

  // ---- 征信 ----
  const queryCols: Column[] = [
    { key: 'org', label: '查询机构', type: 'text', fixed: 'left', width: '200px' },
    { key: 'date', label: '日期', type: 'text', width: '140px' },
    { key: 'type', label: '查询类型', type: 'text' },
  ]
  const queryRows: Row[] = cur.credit.recentQueries.map((q, i) => ({ id: `q${i}`, org: q.org, date: q.date, type: q.type }))
  const acctCols: Column[] = [
    { key: 'type', label: '账户类型', type: 'text', fixed: 'left', width: '160px' },
    { key: 'bank', label: '机构', type: 'text', width: '180px' },
    { key: 'balance', label: '余额/授信', type: 'money', width: '160px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '110px' },
  ]
  const acctRows: Row[] = cur.credit.accounts.map((a, i) => ({
    id: `a${i}`,
    type: a.type,
    bank: a.bank,
    balance: a.balance,
    status: { v: a.status, kind: a.status === '逾期' ? 'red' : a.status === '关注' ? 'amber' : 'green' },
  }))

  // ---- 设备与欺诈 ----
  const devDanger = cur.device.envRiskScore >= 60 || cur.device.simulator
  const sameDevRows: Row[] = cur.device.sameDeviceAccounts.map((s, i) => ({ id: `d${i}`, name: s.name, custId: s.custId }))

  // ---- 外部数据核验 ----
  const extCols: Column[] = [
    { key: 'source', label: '来源', type: 'text', fixed: 'left', width: '140px' },
    { key: 'item', label: '核验项', type: 'text', width: '160px' },
    { key: 'result', label: '结果', type: 'text' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '110px' },
  ]
  const extRows: Row[] = cur.externalChecks.map((e, i) => ({
    id: `e${i}`,
    source: e.source,
    item: e.item,
    result: e.result,
    status: { v: e.status, kind: CHECK_KIND[e.status] },
  }))

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell
        title="单客详情"
        crumb={`${CRUMB} / ${cur.name}`}
        subtitle="零售信贷单客 360° 画像：身份与职业收入、授信额度、负债与逾期、行为画像、风险预警、联系人关系，及模型评分 / 征信 / 设备与欺诈 / 外部核验 / 担保与经营 / 关系图谱 / 多头共债 / 催收 / 贷后风险 / 处置日志"
        actions={
          <>
            <Sam label="单客样例" value="custProfileData.ts" />
            <Cal label="实时聚合" />
          </>
        }
      />

      {/* 头部卡片（已移除风险评分） */}
      <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, background: '#fff', marginBottom: 12 }}>
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
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>综合评分</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: '#8B5CF6' }}>
                {cur.scores.zhiRong.score}
                <span style={{ fontSize: 12, fontWeight: 500, color: '#94A3B8' }}> · {cur.scores.zhiRong.level}</span>
              </div>
            </div>
            <Button size="sm" variant={cur.followed ? 'secondary' : 'primary'} onClick={() => toggleFollowCust(cur.custId)}>
              {cur.followed ? '已关注' : '＋ 关注'}
            </Button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 14, fontSize: 13, color: '#475569' }}>
          <span>授信额度：<b>{money(cur.creditLimit)}</b></span>
          <span>已用额度：<b>{money(cur.usedLimit)}</b></span>
          <span>可用额度：<b>{money(cur.availLimit)}</b></span>
          <span>在贷余额：<b>{money(cur.totalDebt)}</b></span>
          <span>月供合计：<b>{money(cur.monthlyPay)}</b></span>
          <span>职业：<b>{cur.occupation}</b></span>
        </div>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: '#64748B' }}>
          <span>证件号：{cur.maskedId}</span>
          <span>手机号：{cur.phone}</span>
          <span>所在地：{cur.region}</span>
          <span>进件渠道：{cur.channel}</span>
        </div>
      </div>

      {/* 在档客户切换 */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {d.customers.map((c) => (
          <button
            key={c.custId}
            onClick={() => switchTo(c)}
            style={{
              fontSize: 12,
              padding: '4px 10px',
              borderRadius: 999,
              border: '1px solid',
              borderColor: c.custId === cur.custId ? '#8B5CF6' : '#E2E8F0',
              background: c.custId === cur.custId ? '#F5F3FF' : '#fff',
              color: c.custId === cur.custId ? '#6D28D9' : '#475569',
              cursor: 'pointer',
            }}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* 模型评分（常驻，置于 Tab 上方） */}
      <ModelScorePanel scores={cur.scores} />

      {/* Tab 导航 */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E2E8F0', marginBottom: 14, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
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
          </button>
        ))}
      </div>

      {/* Tab 内容 */}
      {tab === '基本信息' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="贷款产品数" value={String(cur.loans.length)} accent="violet" hint={<Sam label="样例" />} />
            <StatCard label="在贷余额" value={money(cur.totalDebt)} accent="brand" hint={<Cal label="实时聚合" />} />
            <StatCard label="授信额度" value={money(cur.creditLimit)} accent="cyan" hint={<Sam label="样例" />} />
            <StatCard label="模型综合分" value={`${cur.scores.zhiRong.score}`} accent="violet" hint={<Sam label="样例" />} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel title="身份信息" desc={<span>基础登记信息 · <Sam value="custProfileData.ts" /></span>}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: 13 }}>
                {infoRows.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                    <span style={{ color: '#94A3B8' }}>{k}</span>
                    <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="职业与收入" desc={<span>收入与职业 · <Sam value="custProfileData.ts" /></span>}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: 13 }}>
                {jobRows.map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                    <span style={{ color: '#94A3B8' }}>{k}</span>
                    <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>
          <Panel title="联系方式" desc={<span>脱敏联系方式 · <Sam value="custProfileData.ts" /></span>} className="mt-3">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px 24px', fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                <span style={{ color: '#94A3B8' }}>手机号</span>
                <span style={{ color: '#334155', fontWeight: 500 }}>{cur.phone}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                <span style={{ color: '#94A3B8' }}>进件渠道</span>
                <span style={{ color: '#334155', fontWeight: 500 }}>{cur.channel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                <span style={{ color: '#94A3B8' }}>所在地</span>
                <span style={{ color: '#334155', fontWeight: 500 }}>{cur.region}</span>
              </div>
            </div>
          </Panel>
        </>
      )}

      {tab === '授信与额度' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="授信额度" value={money(cur.creditLimit)} accent="violet" hint={<Sam label="样例" />} />
            <StatCard label="已用额度" value={money(cur.usedLimit)} accent="brand" hint={<Cal label="实时聚合" />} />
            <StatCard label="可用额度" value={money(cur.availLimit)} accent="cyan" hint={<Cal label="实时聚合" />} />
            <StatCard label="额度年化" value={`${cur.annualRate}%`} accent="amber" hint={<Sam label="样例" />} />
          </div>
          <Panel title="额度明细" desc={<span>各产品已用额度 · <Cal label="实时聚合" /></span>}>
            <DataTable columns={limitCols} rows={limitRows} empty="无" pager defaultPageSize={10} />
          </Panel>
        </>
      )}

      {tab === '负债与逾期' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="贷款余额" value={money(cur.totalDebt)} accent="brand" hint={<Cal label="实时聚合" />} />
            <StatCard label="月供合计" value={money(cur.monthlyPay)} accent="cyan" hint={<Cal label="实时聚合" />} />
            <StatCard label="当前逾期天数" value={String(cur.overdueDays)} accent={cur.overdueDays > 0 ? 'rose' : 'emerald'} hint="0 表示未逾期" />
            <StatCard label="当前逾期金额" value={money(cur.overdueAmt)} accent={cur.overdueAmt > 0 ? 'rose' : 'emerald'} hint="0 表示未逾期" />
          </div>
          <Panel title="贷款台账" desc={<span>在贷借据明细 · <Sam value="custProfileData.ts" /></span>}>
            <DataTable columns={debtCols} rows={debtRows} empty="无在贷记录" pager defaultPageSize={10} />
          </Panel>
        </>
      )}

      {tab === '行为画像' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="用信笔数" value={String(cur.behavior.find((b) => b.name === '用信笔数')?.count ?? 0)} accent="violet" hint={<Cal label="实时聚合" />} />
            <StatCard label="正常还款" value={String(cur.behavior.find((b) => b.name === '正常还款')?.count ?? 0)} accent="emerald" hint={<Cal label="实时聚合" />} />
            <StatCard label="机构查询" value={String(cur.behavior.find((b) => b.name === '机构查询')?.count ?? 0)} accent="cyan" hint={<Cal label="实时聚合" />} />
            <StatCard label="多头借贷" value={String(cur.behavior.find((b) => b.name === '多头借贷')?.count ?? 0)} accent="amber" hint="家数" />
          </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="预警总数" value={String(cur.alerts.length)} accent="violet" hint={<Sam label="样例" />} />
            <StatCard label="红灯" value={String(redCount)} accent="rose" hint="需立即处置" />
            <StatCard label="黄灯" value={String(yellowCount)} accent="amber" hint="关注" />
            <StatCard label="待处置" value={String(pendingCount)} accent="brand" hint="流程在途" />
          </div>
          <Panel title="预警记录" desc={<span>贷中监控命中规则 · <Sam value="custProfileData.ts" /></span>}>
            <DataTable columns={alertCols} rows={alertRows} empty="无预警记录" pager defaultPageSize={10} />
          </Panel>
        </>
      )}

      {tab === '联系人关系' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="联系人" value={String(cur.contacts.length)} accent="violet" hint={<Sam label="样例" />} />
            <StatCard label="共债人数" value={String(coDebtCount)} accent="rose" hint="共债关联" />
            <StatCard label="关联账户" value={String(relationCount)} accent="cyan" hint="跨账户" />
            <StatCard label="风险关联" value={String(coDebtCount)} accent="amber" hint="共债标记" />
          </div>
          <Panel title="联系人 / 关系" desc={<span>紧急联系人、关联账户与共债关系 · <Sam value="custProfileData.ts" /></span>}>
            <DataTable columns={contactCols} rows={contactRows} empty="无" pager defaultPageSize={10} />
          </Panel>
        </>
      )}

      {/* ====== 新补齐板块 ====== */}

      {tab === '模型评分' && (
        <Panel title="模型评分明细" desc={<span>智察 / 智信 / 智融 分项与额度建议 · <Sam value="custProfileData.ts" /></span>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12 }}>
            {[cur.scores.zhiCha, cur.scores.zhiXin, cur.scores.zhiRong].map((c) => (
              <div key={c.name} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{c.name}</span>
                  <Badge kind={SCORE_KIND[c.level]}>{c.level}</Badge>
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#0F172A', marginTop: 6 }}>{c.score}</div>
                <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {c.factors.map((f) => (
                    <div key={f.name} style={{ fontSize: 12, color: '#475569' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>{f.name}</span>
                        <span style={{ color: f.impact === '正面' ? '#16A34A' : f.impact === '负面' ? '#DC2626' : '#94A3B8' }}>{f.impact}</span>
                      </div>
                      <div style={{ color: '#94A3B8', fontSize: 11 }}>{f.detail}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, borderRadius: 12, border: '1px solid #EDE9FE', background: '#F5F3FF', padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#6D28D9' }}>额度建议</div>
            <div style={{ fontSize: 13, color: '#475569', marginTop: 6 }}>
              建议授信 <b>{money(cur.scores.limitSuggest.suggested)}</b> ｜ 当前授信 {money(cur.scores.limitSuggest.current)}
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>{cur.scores.limitSuggest.note}</div>
          </div>
        </Panel>
      )}

      {tab === '征信' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="近6月查询" value={String(cur.credit.recentQueries.length)} accent="cyan" hint={<Cal label="实时聚合" />} />
            <StatCard label="信贷账户" value={String(cur.credit.accounts.length)} accent="violet" hint={<Cal label="实时聚合" />} />
            <StatCard label="逾期笔数" value={String(cur.credit.overdue.count)} accent={cur.credit.overdue.count > 0 ? 'rose' : 'emerald'} hint="征信逾期" />
            <StatCard label="对外担保" value={String(cur.credit.guarantee.length)} accent="amber" hint="担保笔数" />
          </div>
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

      {tab === '设备与欺诈' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="环境风险分" value={String(cur.device.envRiskScore)} accent={devDanger ? 'rose' : 'emerald'} hint="越高越危险" />
            <StatCard label="模拟器" value={cur.device.simulator ? '是' : '否'} accent={cur.device.simulator ? 'rose' : 'emerald'} hint="运行环境" />
            <StatCard label="同设备账号" value={String(cur.device.sameDeviceAccounts.length)} accent={cur.device.sameDeviceAccounts.length > 1 ? 'rose' : 'cyan'} hint="团伙信号" />
            <StatCard label="登录地区" value={cur.device.loginRegion} accent="brand" hint="常用地" />
          </div>
          {devDanger && (
            <div style={{ borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', padding: '10px 14px', fontSize: 13, color: '#B91C1C', marginBottom: 12 }}>
              ⚠ 环境风险分 {cur.device.envRiskScore}（{cur.device.simulator ? '检测到模拟器' : '偏高'}），同设备关联 {cur.device.sameDeviceAccounts.length} 个账号，疑似团伙欺诈。
            </div>
          )}
          <Panel title="设备指纹与登录环境" desc={<span>设备号 / 机型 / 系统 · <Sam value="custProfileData.ts" /></span>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}><span style={{ color: '#94A3B8' }}>设备</span><span style={{ color: '#334155', fontWeight: 500 }}>{cur.device.device}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}><span style={{ color: '#94A3B8' }}>机型</span><span style={{ color: '#334155', fontWeight: 500 }}>{cur.device.model}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}><span style={{ color: '#94A3B8' }}>系统</span><span style={{ color: '#334155', fontWeight: 500 }}>{cur.device.os}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}><span style={{ color: '#94A3B8' }}>最近登录</span><span style={{ color: '#334155', fontWeight: 500 }}>{cur.device.lastLogin}</span></div>
            </div>
          </Panel>
          {cur.device.sameDeviceAccounts.length > 0 && (
            <Panel title="同设备多账号" desc={<span>同设备登录的其他借贷账号 · <Cal label="实时聚合" /></span>} className="mt-3">
              <DataTable
                columns={[{ key: 'name', label: '姓名', type: 'text', fixed: 'left' }, { key: 'custId', label: '客户标识', type: 'text' }]}
                rows={sameDevRows}
                empty="无"
                pager
                defaultPageSize={8}
              />
            </Panel>
          )}
        </>
      )}

      {tab === '外部数据核验' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="核验来源" value={String(cur.externalChecks.length)} accent="violet" hint={<Sam label="样例" />} />
            <StatCard label="一致" value={String(cur.externalChecks.filter((e) => e.status === '一致').length)} accent="emerald" hint="核验通过" />
            <StatCard label="异常" value={String(cur.externalChecks.filter((e) => e.status === '异常').length)} accent="rose" hint="需核查" />
            <StatCard label="待核" value={String(cur.externalChecks.filter((e) => e.status === '待核').length)} accent="amber" hint="处理中" />
          </div>
          <Panel title="跨源外部数据核验" desc={<span>工商 / 司法 / 税务 / 社保公积金 · <Sam value="custProfileData.ts" /></span>}>
            <DataTable columns={extCols} rows={extRows} empty="无核验数据" pager defaultPageSize={8} />
          </Panel>
        </>
      )}

      {tab === '担保与经营' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="抵押物" value={String(cur.collateralBiz.collateral.length)} accent="violet" hint={<Sam label="样例" />} />
            <StatCard label="抵押物价值" value={money(cur.collateralBiz.collateral.reduce((s, c) => s + c.value, 0))} accent="brand" hint={<Cal label="实时聚合" />} />
            <StatCard label="经营实体" value={String(cur.collateralBiz.business.length)} accent="cyan" hint={<Sam label="样例" />} />
            <StatCard label="实体状态" value={cur.collateralBiz.business.length ? cur.collateralBiz.business[0].status : '无'} accent="amber" hint="经营贷" />
          </div>
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

      {tab === '关系图谱' && (
        <Panel title="关系图谱" desc={<span>关系网络与高危标记 · <Cal label="实时聚合" /></span>}>
          <RelationGraph graph={cur.relationGraph} />
        </Panel>
      )}

      {tab === '多头共债' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="近30天申请" value={String(cur.coDebt.applications30d)} accent={cur.coDebt.applications30d >= 5 ? 'rose' : 'cyan'} hint="多头申请" />
            <StatCard label="共债机构" value={String(cur.coDebt.orgs.length)} accent={cur.coDebt.orgs.length >= 5 ? 'rose' : 'amber'} hint="家数" />
            <StatCard label="共债链条" value={String(cur.coDebt.chain.length)} accent="violet" hint="链条数" />
            <StatCard label="在贷共债额" value={money(cur.coDebt.orgs.filter((o) => o.status !== '结清').reduce((s, o) => s + o.balance, 0))} accent="brand" hint={<Cal label="实时聚合" />} />
          </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="催收案件" value={String(cur.collections.length)} accent="violet" hint={<Sam label="样例" />} />
            <StatCard label="M3+ 案件" value={String(cur.collections.filter((c) => c.stage === 'M3+').length)} accent="rose" hint="重度逾期" />
            <StatCard label="委外/核销" value={String(cur.collections.filter((c) => c.status === '委外' || c.status === '核销').length)} accent="rose" hint="外置处置" />
            <StatCard label="总逾期金额" value={money(cur.collections.reduce((s, c) => s + c.overdueAmt, 0))} accent="brand" hint={<Cal label="实时聚合" />} />
          </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="资金流向" value={String(cur.postRisk.fundFlow.length)} accent="cyan" hint={<Cal label="实时聚合" />} />
            <StatCard label="黑名单命中" value={String(cur.postRisk.blacklist.filter((b) => b.status !== '正常').length)} accent="rose" hint="反欺诈" />
            <StatCard label="异常流向" value={String(cur.postRisk.fundFlow.filter((f) => f.flag.includes('疑似') || f.flag.includes('不明')).length)} accent="amber" hint="需核查" />
            <StatCard label="监控名单" value={String(cur.postRisk.blacklist.length)} accent="violet" hint="名单数" />
          </div>
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
