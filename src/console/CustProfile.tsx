/* 单客详情（零售信贷 · 贷中监控）· 页面（挂在「零售信贷风控 cr」子系统 · 贷中监控分区末尾）
 * 模块：单客 360° 画像（cr:mid-single-cust）
 * 顶层设计：功能 / 数据分离 —— 本文件只负责「功能（渲染）」，所有数据来自 custProfileData.ts。
 *   数据：custProfileData.ts（纯数据 + store，橘 Sam 样例，灰 Cal 实时聚合）
 *   结构：零售信贷 SaaS 的「单客 360° 总览」—— 基本信息（风险预警首 + 基础档案 + 行为画像 +
 *         担保与经营 + 贷后风险 + 操作日志尾）收敛为一个主 Tab；央行征信、授信负债与共债、
 *         关系网络各自成 Tab。做到「一眼看全、按需下钻」。
 */
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Button, Badge, Modal, DetailHeader } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { PageShell } from './PageShell';
import { usePageNav } from './pageNav';
import { RelationGraphView } from './RelationGraphView';
import { ModelScorePanel } from './ModelScorePanel';
import {
  useCustData,
  toggleFollowCust,
  type CustProfile,
  type CustScores,
  type CustRelationGraph,
  type GraphTheme,
  type CustLogEntry,
  type CustExternalCheck,
  type CustAlert,
  type CustGraphNode,
  type CustGraphEdge,
  type CustLitigation,
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

// 信息概要指标卡（数值 + 单位）
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

// 概览卡（支持任意字符串值，用于基本信息顶部一览）
function Stat({ label, value, danger }: { label: string; value: React.ReactNode; danger?: boolean }) {
  return (
    <div style={{ background: '#F8FAFC', borderRadius: 10, padding: '10px 14px', border: danger ? '1px solid #FECACA' : '1px solid #EEF2F7' }}>
      <div style={{ fontSize: 12, color: '#94A3B8' }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600, color: danger ? '#DC2626' : '#1E293B', marginTop: 3 }}>{value}</div>
    </div>
  )
}

// 基础概略信息：核心指标以「标签 chip」形式呈现，置于 Tab 区上方（需求 2）
function OverviewTags({ cur }: { cur: CustProfile }) {
  const redCount = cur.alerts.filter((a) => a.level === '红').length
  const items: { label: string; value: React.ReactNode; danger?: boolean }[] = [
    { label: '风险等级', value: cur.status, danger: cur.status !== '正常' },
    { label: '授信总额', value: money(cur.creditLimit) },
    { label: '已用额度', value: money(cur.usedLimit) },
    { label: '在贷余额', value: money(cur.totalDebt) },
    { label: '当前逾期', value: money(cur.overdueAmt), danger: cur.overdueAmt > 0 },
    { label: '风险预警', value: `${cur.alerts.length} 条`, danger: redCount > 0 },
    { label: '共债机构', value: `${cur.coDebt.orgs.length} 家`, danger: cur.coDebt.orgs.some((o) => o.status === '逾期') },
    { label: '近30天多头', value: `${cur.coDebt.applications30d} 次`, danger: cur.coDebt.applications30d >= 5 },
  ]
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {items.map((it) => (
        <span
          key={it.label}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            padding: '5px 11px',
            borderRadius: 999,
            background: it.danger ? '#FEF2F2' : '#F1F5F9',
            border: it.danger ? '1px solid #FECACA' : '1px solid #E2E8F0',
            color: '#475569',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ color: '#94A3B8' }}>{it.label}</span>
          <b style={{ color: it.danger ? '#DC2626' : '#1E293B', fontWeight: 600 }}>{it.value}</b>
        </span>
      ))}
    </div>
  )
}

// 各 Tab 标签后的括号计数（替代顶部统计概要卡）
function tabBadge(t: Tab, cur: CustProfile): string {
  switch (t) {
    case '风险预警': return `${cur.alerts.length} 预警 · ${cur.litigation.length} 涉诉`
    case '央行征信': return `${cur.credit.accounts.length} 户`
    case '担保与经营': return `${cur.collateralBiz.collateral.length} 押品 · ${cur.collateralBiz.business.length} 实体`
    case '授信负债与共债': return `${cur.loans.length} 借据 · ${cur.coDebt.orgs.length} 共债 · ${cur.collections.length} 催收`
    case '关系网络': return `${cur.relationGraph.nodes.length} 节点`
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

const TABS = [
  '基本信息',
  '风险预警',
  '央行征信',
  '担保与经营',
  '授信负债与共债',
  '关系网络',
] as const
type Tab = (typeof TABS)[number]

function money(n: number) {
  return `¥${n.toLocaleString()}`
}

/* ============ 字段级外部核验标记（绿✓通过 / 黄⚠未通过，悬停看渠道+核验信息） ============ */
function VerifyMark({ checks }: { checks: CustExternalCheck[] }) {
  const [hover, setHover] = useState(false)
  const hasFail = checks.some((c) => c.status === '异常')
  const pending = checks.some((c) => c.status === '待核')
  const status: '一致' | '异常' | '待核' = hasFail ? '异常' : pending ? '待核' : '一致'
  const color = status === '一致' ? '#16A34A' : status === '异常' ? '#CA8A04' : '#94A3B8'
  const icon = status === '一致' ? '✓' : status === '异常' ? '⚠' : '?'
  const tip = checks
    .map((c) => {
      const tail = [c.verifyOrg, c.verifyTime, c.cost != null ? `¥${c.cost}` : null].filter(Boolean).join(' · ')
      return `${c.source}·${c.item}：${c.result}（${c.status}）${tail ? ` ｜ ${tail}` : ''}`
    })
    .join('；')
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
// 已抽取为通用组件 ModelScorePanel（见 ./ModelScorePanel.tsx），本页调用带跳转逻辑。

// 关系图谱组件已迁移至 RelationGraphView.tsx（分组放射布局 + 右侧联动清单）

/* ============ 操作日志（时间线） ============ */
function logDotColor(e: CustLogEntry): string {
  if (e.kind === 'task') return '#2563EB'
  if (e.kind === 'op') return '#7C3AED'
  if (e.kind === 'verify') return e.status === '异常' ? '#DC2626' : '#10B981'
  return '#0EA5E9' // credit 央行征信
}
function logBadgeKind(e: CustLogEntry): 'red' | 'amber' | 'green' {
  if (e.kind === 'verify' || e.kind === 'credit') return e.status === '异常' ? 'red' : e.status === '待核' ? 'amber' : 'green'
  return e.status === '待处置' ? 'red' : e.status === '处置中' ? 'amber' : 'green'
}
// 日志类别标签（合并为一条时间线后，每条仍标注来源，便于区分：处置工单 / 历史操作 / 自动核验 / 征信调取）
function logCat(e: CustLogEntry): string {
  if (e.kind === 'task') return '处置工单'
  if (e.kind === 'op') return '历史操作'
  if (e.kind === 'verify') return '自动核验'
  return '征信调取' // credit
}
function Timeline({ items }: { items: CustLogEntry[] }) {
  if (!items.length) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无记录</div>
  return (
    <div style={{ position: 'relative', paddingLeft: 18 }}>
      <div style={{ position: 'absolute', left: 5, top: 4, bottom: 4, width: 2, background: '#E2E8F0' }} />
      {items.map((e, i) => (
        <div key={i} style={{ position: 'relative', paddingBottom: 16 }}>
          <span style={{ position: 'absolute', left: -16, top: 4, width: 10, height: 10, borderRadius: 999, background: logDotColor(e), border: '2px solid #fff' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, padding: '1px 8px', borderRadius: 999, background: '#F1F5F9', color: '#64748B', whiteSpace: 'nowrap' }}>{logCat(e)}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{e.title}</span>
            {e.status && <Badge kind={logBadgeKind(e)}>{e.status}</Badge>}
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{e.time} · {e.sub}</div>
        </div>
      ))}
    </div>
  )
}

/* ============ 单客详情 ============ */
type GraphSelection =
  | { kind: 'node'; node: CustGraphNode }
  | { kind: 'edge'; edge: CustGraphEdge }

export function CustProfile({ custId, title = '单客详情' }: { custId?: string; title?: string }) {
  const d = useCustData()
  const [sp] = useSearchParams()
  // 来源感知：从「评分产品」子系统进入时带 source=sc，返回文案回到评分产品而非零售信贷
  const source = sp.get('source') ?? undefined
  const isSc = source === 'sc'
  const cur = custId ? (d.customers.find((c) => c.custId === custId) ?? d.customers[0]) : d.customers[0]
  const [tab, setTab] = useState<Tab>('基本信息')
  const [alertDetail, setAlertDetail] = useState<CustAlert | null>(null)
  const [relTheme, setRelTheme] = useState<GraphTheme>('综合')
  const [relSel, setRelSel] = useState<GraphSelection | null>(null)
  const [logFilter, setLogFilter] = useState<string>('全部') // 操作日志类型筛选
  const [logLimit, setLogLimit] = useState(5) // 操作日志默认展示条数（折叠）
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
  ]
  const contactDefs: InfoDef[] = [
    { field: 'phone', label: '手机号', value: cur.phones[0].number },
    { field: 'email', label: '邮箱', value: cur.email },
    ...cur.addresses.map((a) => ({ field: '', label: a.type, value: a.value })),
  ]
  const [phoneHover, setPhoneHover] = useState(false)
  const taxShots = cur.externalChecks
    .filter((e) => e.field === 'income')
    .map((e) => ({ title: `${e.source}·${e.item}`, note: e.result, status: e.status }))
  const checksByField: Record<string, CustExternalCheck[]> = {}
  cur.externalChecks.forEach((e) => {
    if (e.field) (checksByField[e.field] ??= []).push(e)
  })
  // 自动核验操作日志：所有第三方核验整理为操作日志条目（需求：其他外部核验整合进操作日志）
  const verifyLogs: CustLogEntry[] = cur.externalChecks
    .map((e) => ({
      time: e.verifyTime ?? '',
      kind: 'verify' as const,
      title: `${e.source} · ${e.item}`,
      sub: `${e.result} ｜ ${e.verifyOrg ?? '数据源'}${e.cost != null ? ` ｜ 花费 ¥${e.cost}` : ''}`,
      status: e.status === '一致' ? '通过' : e.status === '异常' ? '异常' : '待核',
    }))
    .sort((a, b) => b.time.localeCompare(a.time))
  const creditLogs: CustLogEntry[] = [...(cur.creditReportLog ?? [])].sort((a, b) => b.time.localeCompare(a.time))
  // 操作日志整合：处置工单 + 自动核验 + 央行征信调取 合并为一条时间线（按时间倒序，每条带类别标签）
  const allLogs: CustLogEntry[] = [...cur.disposeLog, ...verifyLogs, ...creditLogs].sort((a, b) => b.time.localeCompare(a.time))
  const filteredLogs = logFilter === '全部' ? allLogs : allLogs.filter((e) => logCat(e) === logFilter)

  // ---- 预警概览 ----
  const redCount = cur.alerts.filter((a) => a.level === '红').length
  const yellowCount = cur.alerts.filter((a) => a.level === '黄').length
  const pendingCount = cur.alerts.filter((a) => a.status === '待处置').length
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

  // ---- 行为画像分组 ----
  const BEHAVIOR_GROUPS: { key: string; title: string; desc: string }[] = [
    { key: '用信', title: '用信行为', desc: '借款支用频次、时段与额度占用，反映资金饥渴度与再融资倾向' },
    { key: '还款', title: '还款行为', desc: '历史还款履约情况，是信用评估最核心的回看信号' },
    { key: '查询', title: '查询与多头', desc: '机构查询与跨机构借贷密度，预警多头共债与以贷养贷' },
    { key: '风险', title: '风险标记', desc: '命中反欺诈 / 风险规则的行为信号' },
  ]
  const dangerBehavior = cur.behavior.filter((b) => b.danger && b.count > 0).length

  // ---- 设备与欺诈 ----
  const devDanger = cur.device.envRiskScore >= 60 || cur.device.simulator
  const sameDevRows: Row[] = cur.device.sameDeviceAccounts.map((s, i) => ({ id: `d${i}`, name: s.name, custId: s.custId }))

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
  const selfQueryCols: Column[] = [
    { key: 'date', label: '日期', type: 'text', width: '140px' },
    { key: 'type', label: '查询原因', type: 'text' },
  ]
  const selfQueryRows: Row[] = cur.credit.selfQueries.map((q, i) => ({ id: `sq${i}`, date: q.date, type: q.type }))
  const agreeCols: Column[] = [
    { key: 'org', label: '管理机构', type: 'text', fixed: 'left', width: '160px' },
    { key: 'limit', label: '授信额度', type: 'money', width: '130px' },
    { key: 'currency', label: '币种', type: 'text', width: '90px' },
    { key: 'shareAccounts', label: '协议账户数', type: 'text', width: '100px' },
    { key: 'effectiveDate', label: '生效日', type: 'text', width: '120px' },
    { key: 'expireDate', label: '到期日', type: 'text', width: '120px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '100px' },
  ]
  const agreeRows: Row[] = cur.credit.agreements.map((a, i) => ({
    id: `ag${i}`, org: a.org, limit: a.limit, currency: a.currency, shareAccounts: a.shareAccounts,
    effectiveDate: a.effectiveDate, expireDate: a.expireDate,
    status: { v: a.status, kind: a.status === '终止' ? 'red' : a.status === '关注' ? 'amber' : 'green' },
  }))
  const repayCols: Column[] = [
    { key: 'name', label: '责任人', type: 'text', fixed: 'left', width: '120px' },
    { key: 'relation', label: '关系', type: 'text', width: '90px' },
    { key: 'org', label: '管理机构', type: 'text', width: '150px' },
    { key: 'product', label: '业务品种', type: 'text', width: '120px' },
    { key: 'amount', label: '责任金额', type: 'money', width: '130px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '100px' },
  ]
  const repayRows: Row[] = cur.credit.relatedRepayList.map((r, i) => ({
    id: `rp${i}`, name: r.name, relation: r.relation, org: r.org, product: r.product, amount: r.amount,
    status: { v: r.status, kind: r.status === '逾期' ? 'red' : r.status === '关注' ? 'amber' : 'green' },
  }))
  const pubCols: Column[] = [
    { key: 'type', label: '记录类型', type: 'text', fixed: 'left', width: '120px' },
    { key: 'org', label: '记录机构', type: 'text', width: '220px' },
    { key: 'date', label: '发生日期', type: 'text', width: '130px' },
    { key: 'content', label: '内容', type: 'text' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '100px' },
  ]
  const pubRows: Row[] = cur.credit.publicRecords.map((p, i) => ({
    id: `pr${i}`, type: p.type, org: p.org, date: p.date, content: p.content,
    status: { v: p.status, kind: p.status === '未履行' || p.status === '逾期' ? 'red' : p.status === '已履行' || p.status === '已结清' ? 'green' : 'amber' },
  }))

  // ---- 授信负债与共债（合并：额度 / 台账 / 多头 / 催收） ----
  const limitCols: Column[] = [
    { key: 'product', label: '贷款产品', type: 'text', fixed: 'left', width: '220px' },
    { key: 'balance', label: '已用额度', type: 'money', width: '140px' },
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
  const coDebtCols: Column[] = [
    { key: 'org', label: '机构', type: 'text', fixed: 'left', width: '200px' },
    { key: 'product', label: '产品', type: 'text', width: '200px' },
    { key: 'balance', label: '余额', type: 'money', width: '140px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '110px' },
  ]
  const coDebtRows: Row[] = cur.coDebt.orgs.map((o, i) => ({ id: `o${i}`, org: o.org, product: o.product, balance: o.balance, status: { v: o.status, kind: o.status === '逾期' ? 'red' : o.status === '关注' ? 'amber' : 'green' } }))

  // ---- 关系图谱 nodeMap（供选中卡片解析名称） ----
  const relNodeMap = useMemo(() => {
    const m: Record<string, CustGraphNode> = {}
    cur.relationGraph.nodes.forEach((nn) => (m[nn.id] = nn))
    return m
  }, [cur.relationGraph])

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell
        header={
          <DetailHeader
            title={title}
            crumb={(isSc ? '评分产品' : CRUMB) + ' / ' + cur.name}
            backLabel={isSc ? '← 返回评分产品' : '← 返回'}
            backTo={isSc ? '/console/sc/score-records' : undefined}
            actions={
              <>
              </>
            }
          />
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
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: '#64748B' }}>
            <span>证件号：{cur.maskedId}</span>
            <span>手机号：{cur.phone}</span>
            <span>所在地：{cur.region}</span>
          </div>
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', marginTop: 6, fontSize: 12, color: '#64748B' }}>
            <span>性别：{cur.gender}</span>
            <span>年龄：{cur.age} 岁</span>
            <span>学历：{cur.education}</span>
            <span>婚姻状况：{cur.marital}</span>
            <span>客户标识：{cur.custId}</span>
          </div>
          {/* 概略信息标签（风险等级/授信/已用/在贷/逾期/预警/共债/多头） */}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px dashed #E2E8F0' }}>
            <OverviewTags cur={cur} />
          </div>
        </div>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 12, background: '#fff', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>模型评分</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>点击卡片查看明细 </span>
          </div>
          <ModelScorePanel scores={cur.scores} onCardClick={(prod) => goDetail(`/console/cr/mid-cust-score?cust=${cur.custId}&prod=${prod}`)} />
        </div>
      </div>

      {/* Tab 导航（吸顶 sticky：滚动到顶后固定在全局标题栏正下方，top=56px=标题栏高度） */}
      <div style={{ position: 'sticky', top: 56, zIndex: 35, background: 'rgba(248,250,252,0.96)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', padding: '10px 0', borderBottom: '1px solid #E2E8F0', marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
      </div>

      {/* ================= 基本信息（主 Tab：档案 + 行为 + 操作日志） ================= */}
      {tab === '基本信息' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {devDanger && (
            <div style={{ borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>
              ⚠ 环境风险分 {cur.device.envRiskScore}（{cur.device.simulator ? '检测到模拟器' : '偏高'}），同设备关联 {cur.device.sameDeviceAccounts.length} 个账号，疑似团伙欺诈。
            </div>
          )}

          {/* 基础档案：身份 / 职业 / 联系 */}
          <Panel title="基础档案" desc={<span>身份 / 职业 / 联系 · 字段级外部核验标记 · </span>}>
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

          {/* 实名与设备核验 */}
          <Panel title="实名与设备核验" desc={<span>设备指纹 / 环境反欺诈 · </span>}>
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
            <Panel title="同设备多账号" desc={<span>同设备登录的其他借贷账号 · </span>}>
              <DataTable
                columns={[{ key: 'name', label: '姓名', type: 'text', fixed: 'left' }, { key: 'custId', label: '客户标识', type: 'text' }]}
                rows={sameDevRows}
                empty="无"
                pager
                defaultPageSize={8}
              />
            </Panel>
          )}

          {/* 行为画像：分组 + 说明，让“看不懂在讲什么”变清晰（需求 4） */}
          <Panel title="行为画像" desc={<span>用信 / 还款 / 查询 / 风险的行为特征 · </span>}>
            {dangerBehavior > 0 && (
              <div style={{ marginBottom: 12, borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>
                ⚠ 命中 {dangerBehavior} 项风险行为（逾期还款 / 多头借贷 / 夜间用信 / 额度使用率过高），建议结合风险预警联动处置。
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {BEHAVIOR_GROUPS.map((g) => {
                const items = cur.behavior.filter((b) => (b.category ?? '风险') === g.key)
                if (!items.length) return null
                return (
                  <div key={g.key}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>{g.title}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', margin: '2px 0 8px' }}>{g.desc}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
                      {items.map((it) => (
                        <div
                          key={it.name}
                          style={{
                            border: '1px solid #E2E8F0',
                            borderRadius: 8,
                            padding: '8px 10px',
                            background: it.danger ? '#FEF2F2' : '#fff',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: 12, color: it.danger ? '#DC2626' : '#475569' }}>{it.name}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: it.danger ? '#DC2626' : '#334155' }}>{it.count}</span>
                          </div>
                          {it.desc && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>{it.desc}</div>}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          {/* 操作日志（合并：处置工单 + 自动核验 + 央行征信调取 同一时间线，按时间倒序；每条带类别标签，需求：按详情整合到一起） */}
          <Panel title="操作日志" desc={<span>处置工单 + 自动核验 + 央行征信调取 · 共 {allLogs.length} 条 · </span>}>
            {/* 类型筛选 */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {['全部', '处置工单', '历史操作', '自动核验', '征信调取'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setLogFilter(c); setLogLimit(5) }}
                  style={{
                    fontSize: 12, padding: '4px 12px', borderRadius: 999, cursor: 'pointer',
                    background: logFilter === c ? '#1E293B' : '#fff',
                    color: logFilter === c ? '#fff' : '#64748B',
                    border: logFilter === c ? '1px solid #1E293B' : '1px solid #E2E8F0',
                  }}
                >
                  {c}
                  {c !== '全部' && (
                    <span style={{ opacity: 0.7, marginLeft: 4 }}>
                      {allLogs.filter((e) => logCat(e) === c).length}
                    </span>
                  )}
                </button>
              ))}
            </div>
            <Timeline items={filteredLogs.slice(0, logLimit)} />
            {filteredLogs.length > logLimit && (
              <button
                type="button"
                onClick={() => setLogLimit(logLimit + 10)}
                style={{ marginTop: 4, fontSize: 12.5, color: '#185FA5', background: 'none', border: 'none', padding: '6px 0', cursor: 'pointer' }}
              >
                显示更多（还有 {filteredLogs.length - logLimit} 条）↓
              </button>
            )}
          </Panel>
        </div>
      )}

      {/* ================= 风险预警（风险预警 + 黑名单反欺诈 + 司法涉诉 + 贷后风险，需求） ================= */}
      {tab === '风险预警' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Panel title="风险预警" desc={<span>贷中监控命中规则 · 优先处置入口 · </span>}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: '#FEF2F2', color: '#DC2626' }}>红 {redCount}</span>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: '#FFFBEB', color: '#D97706' }}>黄 {yellowCount}</span>
              <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 999, background: '#EFF6FF', color: '#2563EB' }}>待处置 {pendingCount}</span>
            </div>
            <DataTable
              columns={alertCols}
              rows={alertRows}
              empty="无预警记录"
              pager
              defaultPageSize={10}
              actions={(r) => (
                <button
                  type="button"
                  onClick={() => setAlertDetail(cur.alerts.find((a) => a.id === r.id) ?? null)}
                  style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', color: '#475569', cursor: 'pointer', fontWeight: 500 }}
                >
                  查看详情
                </button>
              )}
            />
          </Panel>

          {/* 黑名单反欺诈：独立区块（本行黑名单 / 互金协会灰名单 等） */}
          <Panel title="黑名单反欺诈" desc={<span>本行黑名单 + 互金协会灰名单等反欺诈命中 · </span>}>
            {cur.postRisk.blacklist.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cur.postRisk.blacklist.map((b, i) => {
                  const danger = b.status === '高风险'
                  const kind = b.status === '正常' ? 'green' : danger ? 'red' : 'amber'
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        padding: '10px 14px',
                        borderRadius: 10,
                        border: `1px solid ${danger ? '#FECACA' : kind === 'amber' ? '#FDE68A' : '#E2E8F0'}`,
                        background: danger ? '#FEF2F2' : kind === 'amber' ? '#FFFBEB' : '#F8FAFC',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 4, height: 32, borderRadius: 2, background: danger ? '#DC2626' : kind === 'amber' ? '#D97706' : '#94A3B8' }} />
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{b.list}</div>
                          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>命中状态：{b.hit}</div>
                        </div>
                      </div>
                      <Badge kind={kind}>{b.status}</Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>未命中任何黑名单</div>
            )}
          </Panel>

          {/* 贷后风险：资金流向监控 */}
          <Panel title="贷后风险" desc={<span>资金流向监控 · 与风险预警同属贷中监控 · </span>}>
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

          {/* 司法涉诉（并入风险预警 Tab：同属风险视角） */}
          <Panel title="司法涉诉" desc={<span>裁判文书 / 被执行人 / 失信名单等涉诉信息 · 结构化展示 · </span>}>
            {cur.litigation.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cur.litigation.map((l, i) => {
                  const danger = l.status === '未结' || l.status === '执行中'
                  return (
                    <div
                      key={i}
                      style={{
                        border: `1px solid ${danger ? '#FECACA' : '#E2E8F0'}`,
                        borderRadius: 10,
                        padding: '12px 14px',
                        background: danger ? '#FEF2F2' : '#fff',
                      }}
                    >
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{l.type}</span>
                        <Badge kind={danger ? 'red' : 'green'}>{l.status}</Badge>
                        <span style={{ fontSize: 12, color: '#94A3B8' }}>{l.role}</span>
                        <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>立案/裁判：{l.filingDate}</span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 8, fontSize: 13 }}>
                        <div style={{ color: '#64748B' }}>案号：<b style={{ color: '#334155' }}>{l.caseNo}</b></div>
                        <div style={{ color: '#64748B' }}>审理法院：<b style={{ color: '#334155' }}>{l.court}</b></div>
                        <div style={{ color: '#64748B' }}>涉诉金额：<b style={{ color: danger ? '#DC2626' : '#334155' }}>{money(l.amount)}</b></div>
                      </div>
                      {l.desc && <div style={{ fontSize: 12, color: '#64748B', marginTop: 8, paddingTop: 8, borderTop: '1px dashed #F1F5F9' }}>{l.desc}</div>}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#16A34A' }}>✓ 暂无司法涉诉记录（涉诉查询无未结案件）</div>
            )}
          </Panel>
        </div>
      )}

      {/* ================= 担保与经营（独立 Tab，内容已丰富，需求 4） ================= */}
      {tab === '担保与经营' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {cur.collateralBiz.guaranteeAlert && (
            <div style={{ borderRadius: 12, border: '1px solid #FECACA', background: '#FEF2F2', padding: '10px 14px', fontSize: 13, color: '#B91C1C' }}>
              ⚠ 担保预警（{cur.collateralBiz.guaranteeAlert.level}）：{cur.collateralBiz.guaranteeAlert.rule} — {cur.collateralBiz.guaranteeAlert.desc}
            </div>
          )}
          <Panel title="担保与经营概览" desc={<span>担保覆盖 + 经营健康度 · </span>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <SummaryCard label="担保物数量" value={cur.collateralBiz.collateral.length} unit="项" />
              <SummaryCard label="经营实体数" value={cur.collateralBiz.business.length} unit="家" />
              {cur.collateralBiz.bizHealth && (() => {
                const bh = cur.collateralBiz.bizHealth!
                const stabColor = bh.stability === '稳定' ? '#16A34A' : bh.stability === '波动' ? '#D97706' : '#DC2626'
                return (
                  <>
                    <SummaryCard label="经营年限" value={bh.years} unit="年" />
                    <SummaryCard label="月均营收" value={bh.monthlyRevenue} unit="元" />
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: 12, background: '#fff' }}>
                      <div style={{ fontSize: 12, color: '#94A3B8' }}>经营稳定性</div>
                      <div style={{ fontSize: 22, fontWeight: 800, color: stabColor, marginTop: 4 }}>{bh.stability}</div>
                    </div>
                    <SummaryCard label="经营健康分" value={bh.score} unit="/100" danger={bh.score < 60} />
                  </>
                )
              })()}
            </div>
          </Panel>

          <Panel title="担保抵押物" desc={<span>抵押 / 质押物 · 含第三方核验 · </span>}>
            {cur.collateralBiz.collateral.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {cur.collateralBiz.collateral.map((c, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                    <span style={{ color: '#64748B' }}>{c.name}（{c.type}）</span>
                    <span style={{ color: '#334155', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {money(c.value)} · <Badge kind={c.status === '评估中' ? 'amber' : 'gray'}>{c.status}</Badge>
                      {c.verified != null && <Badge kind={c.verified ? 'green' : 'amber'}>{c.verified ? '已核验' : '待核验'}</Badge>}
                    </span>
                  </div>
                ))}
                {cur.collateralBiz.collateral.some((c) => c.verifyOrg) && (
                  <div style={{ fontSize: 11, color: '#94A3B8' }}>
                    核验来源：{cur.collateralBiz.collateral.filter((c) => c.verifyOrg).map((c) => `${c.name}·${c.verifyOrg}${c.verifyTime ? `(${c.verifyTime})` : ''}`).join('；')}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>无担保抵押物（纯信用客户）</div>
            )}
          </Panel>

          <Panel title="经营实体" desc={<span>名下经营主体 · 含基本信息与风险信息 · </span>}>
            {cur.collateralBiz.business.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {cur.collateralBiz.business.map((b, i) => {
                  const riskKind = b.risk === '高风险' ? 'red' : b.risk === '关注' ? 'amber' : 'green'
                  return (
                    <div key={i} style={{ border: `1px solid ${b.risk === '高风险' ? '#FECACA' : b.risk === '关注' ? '#FDE68A' : '#E2E8F0'}`, borderRadius: 10, padding: '12px 14px', background: b.risk === '高风险' ? '#FEF2F2' : '#fff' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{b.name}</span>
                        <Badge kind={b.status === '存续' ? 'green' : 'gray'}>{b.status}</Badge>
                        {b.risk && <Badge kind={riskKind}>主体风险·{b.risk}</Badge>}
                        {b.healthScore != null && (
                          <Badge kind={b.healthScore >= 75 ? 'green' : b.healthScore >= 55 ? 'amber' : 'red'}>
                            经营健康 {b.healthScore}
                          </Badge>
                        )}
                        {b.verified != null && <Badge kind={b.verified ? 'green' : 'amber'}>{b.verified ? '已核验' : '待核验'}</Badge>}
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 8, fontSize: 13 }}>
                        <div style={{ color: '#64748B' }}>统一信用代码：<b style={{ color: '#334155' }}>{b.creditCode ?? '—'}</b></div>
                        <div style={{ color: '#64748B' }}>法定代表人：<b style={{ color: '#334155' }}>{b.legalRep ?? '—'}</b></div>
                        <div style={{ color: '#64748B' }}>注册资本：<b style={{ color: '#334155' }}>{b.regCapital != null ? `${b.regCapital} 万元` : '—'}</b></div>
                        <div style={{ color: '#64748B' }}>成立日期：<b style={{ color: '#334155' }}>{b.regDate ?? '—'}</b></div>
                        <div style={{ color: '#64748B' }}>所属行业：<b style={{ color: '#334155' }}>{b.industry ?? '—'}</b></div>
                        <div style={{ color: '#64748B' }}>角色：<b style={{ color: '#334155' }}>{b.role}</b></div>
                        <div style={{ color: '#64748B' }}>涉诉案件：<b style={{ color: b.litigationCount ? '#DC2626' : '#334155' }}>{b.litigationCount ?? 0} 起</b></div>
                        <div style={{ color: '#64748B' }}>行政处罚：<b style={{ color: b.penaltyCount ? '#DC2626' : '#334155' }}>{b.penaltyCount ?? 0} 次</b></div>
                      </div>
                      {b.riskTags && b.riskTags.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                          {b.riskTags.map((t, j) => {
                            const isLitigation = t.includes('司法涉诉')
                            return isLitigation ? (
                              <button
                                key={j}
                                type="button"
                                onClick={() => setTab('风险预警')}
                                style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', cursor: 'pointer', fontWeight: 600 }}
                                title="查看司法涉诉明细（风险预警 Tab）"
                              >{t} ›</button>
                            ) : (
                              <span key={j} style={{ fontSize: 11, padding: '2px 9px', borderRadius: 999, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' }}>{t}</span>
                            )
                          })}
                        </div>
                      )}
                      {b.riskItems && b.riskItems.length > 0 && (
                        <div style={{ marginTop: 10, borderTop: '1px dashed #F1F5F9', paddingTop: 8 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>风险明细</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {b.riskItems.map((r, j) => (
                              <div key={j} style={{ borderLeft: '3px solid #DC2626', paddingLeft: 10, background: '#FEF2F2', borderRadius: 6, padding: '6px 10px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginBottom: 2 }}>
                                  <span style={{ fontWeight: 600, color: '#B91C1C' }}>{r.type}</span>
                                  <span>{r.date}</span>
                                </div>
                                <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.5 }}>{r.reason}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {b.verifyOrg && <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 8 }}>核验来源：{b.verifyOrg}{b.verifyTime ? `（${b.verifyTime}）` : ''}</div>}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>无经营实体</div>
            )}
          </Panel>
        </div>
      )}

      {/* ================= 央行征信 ================= */}
      {tab === '央行征信' && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px' }}>
            <span style={{ fontSize: 13, color: '#475569' }}>报告编号：<b style={{ color: '#1E293B' }}>{cur.credit.header.reportNo}</b></span>
            <span style={{ fontSize: 13, color: '#475569' }}>查询时间：<b style={{ color: '#1E293B' }}>{cur.credit.header.queryTime}</b></span>
            <span style={{ fontSize: 13, color: '#475569' }}>被查询者：<b style={{ color: '#1E293B' }}>{cur.credit.header.queriedBy}</b>（{cur.credit.header.idNo}）</span>
            <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94A3B8' }}>数据来源：人行征信接口（样例）</span>
          </div>

          <Panel title="标注及声明信息" desc={<span>本人声明 / 异议标注 · </span>} className="mt-3">
            {cur.credit.annotations.length ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cur.credit.annotations.map((a, i) => (
                  <div key={i} style={{ borderLeft: `3px solid ${a.type === '异议标注' ? '#D97706' : '#2563EB'}`, paddingLeft: 10, background: '#F8FAFC', borderRadius: 6, padding: '8px 10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748B', marginBottom: 2 }}>
                      <Badge kind={a.type === '异议标注' ? 'amber' : 'blue'}>{a.type}</Badge>
                      <span>{a.date}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#334155' }}>{a.content}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>无标注及声明信息</div>
            )}
          </Panel>

          <Panel title="信息概要" desc={<span>账户数汇总 · 人行征信口径（与他行授信/余额的合并视角）· </span>} className="mt-3">
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>① 账户数</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <SummaryCard label="信用卡账户" value={cur.credit.summary.creditCards} unit="个" />
              <SummaryCard label="贷款笔数" value={cur.credit.summary.loans} unit="笔" />
              <SummaryCard label="逾期账户" value={cur.credit.summary.overdueAccounts} unit="个" danger={cur.credit.summary.overdueAccounts > 0} />
              <SummaryCard label="90天以上逾期" value={cur.credit.summary.overdue90Plus} unit="个" danger={cur.credit.summary.overdue90Plus > 0} />
              <SummaryCard label="对外担保" value={cur.credit.summary.guaranteeCount} unit="笔" danger={cur.credit.summary.guaranteeCount > 0} />
              <SummaryCard label="相关还款责任" value={cur.credit.summary.relatedRepay} unit="个" danger={cur.credit.summary.relatedRepay > 0} />
            </div>
            <div style={{ fontSize: 12, color: '#94A3B8', margin: '16px 0 8px' }}>② 金额维度（未结清账户 · 人行口径）</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <SummaryCard label="首笔业务年份" value={cur.credit.summaryAmount.firstBizYear} unit="年" />
              <SummaryCard label="授信总额" value={cur.credit.summaryAmount.openCreditLimit} unit="元" />
              <SummaryCard label="余额合计" value={cur.credit.summaryAmount.usedBalance} unit="元" />
              <SummaryCard label="单月最高逾期" value={cur.credit.summaryAmount.maxMonthlyOverdue} unit="元" danger={cur.credit.summaryAmount.maxMonthlyOverdue > 0} />
              <SummaryCard label="最长逾期" value={cur.credit.summaryAmount.longestOverdueMonths} unit="月" danger={cur.credit.summaryAmount.longestOverdueMonths > 0} />
            </div>
          </Panel>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <Panel title="征信逾期" desc={<span>当前征信逾期 · </span>}>
              <div style={{ fontSize: 13, color: '#475569' }}>
                逾期笔数：<b style={{ color: cur.credit.overdue.count > 0 ? '#DC2626' : '#16A34A' }}>{cur.credit.overdue.count}</b> 笔 ｜ 逾期金额：<b style={{ color: cur.credit.overdue.amount > 0 ? '#DC2626' : '#16A34A' }}>{money(cur.credit.overdue.amount)}</b>
              </div>
            </Panel>
            <Panel title="对外担保" desc={<span>担保责任 · </span>}>
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

          <Panel title="近 6 月查询记录" desc={<span>征信查询明细 · </span>} className="mt-3">
            <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>机构查询</div>
            <DataTable columns={queryCols} rows={queryRows} empty="无机构查询记录" pager defaultPageSize={8} />
            <div style={{ fontSize: 12, color: '#94A3B8', margin: '16px 0 8px' }}>本人查询</div>
            {cur.credit.selfQueries.length ? (
              <DataTable columns={selfQueryCols} rows={selfQueryRows} empty="无本人查询" pager defaultPageSize={8} />
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>无本人查询记录</div>
            )}
          </Panel>

          <Panel title="信贷账户明细" desc={<span>人行征信账户 · 人行口径（含他行账户；本行借据见「授信负债与共债」Tab）· </span>} className="mt-3">
            <DataTable columns={acctCols} rows={acctRows} empty="无信贷账户" pager defaultPageSize={8} />
          </Panel>

          <Panel title="授信协议信息" desc={<span>循环额度共享协议 · </span>} className="mt-3">
            <DataTable columns={agreeCols} rows={agreeRows} empty="无授信协议" pager defaultPageSize={8} />
          </Panel>

          <Panel title="相关还款责任（共同借款）" desc={<span>共同借款 / 连带责任 · 与他行共同承担（区别于「授信负债与共债」Tab 的独立跨机构借贷）· </span>} className="mt-3">
            {cur.credit.relatedRepayList.length ? (
              <DataTable columns={repayCols} rows={repayRows} empty="无相关还款责任" pager defaultPageSize={8} />
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>无相关还款责任记录</div>
            )}
          </Panel>

          <Panel title="公共记录明细" desc={<span>欠税 / 民事判决 / 强制执行 / 行政处罚 · </span>} className="mt-3">
            {cur.credit.publicRecords.length ? (
              <DataTable columns={pubCols} rows={pubRows} empty="无公共记录" pager defaultPageSize={8} />
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8' }}>无公共记录（欠税 / 民事判决 / 强制执行 / 行政处罚）</div>
            )}
          </Panel>
        </>
      )}

      {/* ================= 授信负债与共债（合并：额度 / 台账 / 多头 / 催收，需求 3 & 7） ================= */}
      {tab === '授信负债与共债' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Panel title="额度与负债概览" desc={<span>本行口径：本行授信与在贷总览（金额与央行征信口径不同，勿混淆）· </span>}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }}>
              <SummaryCard label="授信总额" value={cur.creditLimit} unit="元" />
              <SummaryCard label="已用额度" value={cur.usedLimit} unit="元" danger={cur.usedLimit / Math.max(cur.creditLimit, 1) > 0.9} />
              <SummaryCard label="可用额度" value={cur.availLimit} unit="元" />
              <SummaryCard label="在贷余额" value={cur.totalDebt} unit="元" />
              <SummaryCard label="月供合计" value={cur.monthlyPay} unit="元" />
              <SummaryCard label="最大逾期天数" value={cur.overdueDays} unit="天" danger={cur.overdueDays > 0} />
            </div>
          </Panel>

          <Panel title="催收案件" desc={<span>逾期催收进展 · </span>}>
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
          </Panel>

          <Panel title="额度明细" desc={<span>各产品已用额度 · </span>}>
            <DataTable columns={limitCols} rows={limitRows} empty="无" pager defaultPageSize={10} />
          </Panel>

          <Panel title="贷款台账" desc={<span>在贷借据明细 · 本行核心系统（本行口径）· </span>}>
            <DataTable columns={debtCols} rows={debtRows} empty="无在贷记录" pager defaultPageSize={10} />
          </Panel>

          <Panel title="多头共债" desc={<span>跨机构独立借贷（共同借款 / 连带责任见「央行征信」Tab 相关还款责任）· 近 30 天多头申请 {cur.coDebt.applications30d} 次 · </span>}>
            <DataTable columns={coDebtCols} rows={coDebtRows} empty="无共债" pager defaultPageSize={8} />
            {cur.coDebt.chain.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 8 }}>共债链条</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {cur.coDebt.chain.map((c, i) => (
                    <div key={i} style={{ fontSize: 13, color: '#334155', borderLeft: '3px solid #DC2626', paddingLeft: 10 }}>{c}</div>
                  ))}
                </div>
              </div>
            )}
          </Panel>
        </div>
      )}

      {/* ================= 关系网络（升级：布局 / 主题叠加 / 点击属性 / 元数据，需求 1） ================= */}
      {tab === '关系网络' && (
        <Panel title="关系图谱" desc={<span>融合联系人、共债、资金、担保、设备等多维关系 · 点击节点/关系查看属性 · 右侧清单与图谱联动 · </span>}>
          <RelationGraphView
            graph={cur.relationGraph}
            theme={relTheme}
            onTheme={setRelTheme}
            sel={relSel}
            onPick={setRelSel}
            nodeMap={relNodeMap}
          />
        </Panel>
      )}

      {/* 预警明细 · 查看详情弹窗 */}
      <Modal open={!!alertDetail} onClose={() => setAlertDetail(null)} title="预警明细" width="max-w-lg">
        {alertDetail && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Badge kind={alertDetail.level === '红' ? 'red' : alertDetail.level === '黄' ? 'amber' : 'blue'}>{alertDetail.level}</Badge>
              <Badge kind={alertDetail.status === '待处置' ? 'red' : alertDetail.status === '处置中' ? 'amber' : 'green'}>{alertDetail.status}</Badge>
              <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>{alertDetail.id}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', rowGap: 12, columnGap: 12, fontSize: 13 }}>
              <div style={{ color: '#64748B' }}>命中规则</div>
              <div style={{ color: '#1E293B', fontWeight: 600 }}>{alertDetail.rule}</div>
              <div style={{ color: '#64748B' }}>触发日期</div>
              <div style={{ color: '#1E293B' }}>{alertDetail.date}</div>
              <div style={{ color: '#64748B' }}>规则说明</div>
              <div style={{ color: '#475569', lineHeight: 1.6 }}>{alertDetail.desc}</div>
              <div style={{ color: '#64748B' }}>处置状态</div>
              <div style={{ color: '#1E293B' }}>{alertDetail.status}</div>
              <div style={{ color: '#64748B' }}>处置建议</div>
              <div style={{ color: '#475569', lineHeight: 1.6 }}>
                {alertDetail.level === '红' && alertDetail.status === '待处置'
                  ? '红灯预警且未处置，建议立即介入：电话/上门核实、视情况冻结额度或启动催收。'
                  : alertDetail.level === '红'
                    ? '红灯预警处置中，持续跟进处置进展并复核闭环条件。'
                    : alertDetail.level === '黄'
                      ? '黄灯预警，纳入观察名单并安排复核，必要时升级处置。'
                      : '蓝灯预警，已闭环，转为常规观察即可。'}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
              <Button variant="secondary" onClick={() => setAlertDetail(null)}>关闭</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
