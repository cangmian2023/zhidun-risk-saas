// 企业风控 · 监控规则详情（fk-monitor-detail）· 1:1 复刻「风险详情」截图
// 数据：本地样例 fkMonitorDetail.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, DataTable, useSample, Sam } from '../../epCommon'
import { LineChart, DonutChart } from '../../../../components/charts'
import type { Row, Column } from '../../../../components/ui'
import seedJson from '../../../fkMonitorDetail.json'
import { usePageNav } from '../../../pageNav'

type Data = typeof seedJson
type Risk = Data['risks'][number]

const LEVEL: Record<string, { c: string; b: string }> = {
  高风险: { c: '#B91C1C', b: '#FEE2E2' },
  中风险: { c: '#C2410C', b: '#FFEDD5' },
  低风险: { c: '#1D4ED8', b: '#EFF6FF' },
  轻微风险: { c: '#0F766E', b: '#CCFBF1' },
  日常资讯: { c: '#475569', b: '#F1F5F9' },
}

const TIMES = ['今日', '昨日', '近7天', '近30天', '自定义']
const RISK_TYPES = ['不限', '基本信息', '经营风险', '司法风险', '经营信息', '企业舆情', '供应链风险', '关联方风险', '关键词舆情']

export default function FkMonitorDetail({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('fkMonitorDetail.json', seedJson)
  const [time, setTime] = useState(data.filters?.timeMode || '近30天')
  const [period, setPeriod] = useState('近30天')
  const [timeKind, setTimeKind] = useState<'推送时间' | '发生时间'>('推送时间')
  const [levels, setLevels] = useState<string[]>([])
  const [readState, setReadState] = useState<string[]>([])
  const [followState, setFollowState] = useState<string[]>([])
  const [markState, setMarkState] = useState<string[]>([])
  const [ruleState, setRuleState] = useState<string[]>([])
  const [riskTypes, setRiskTypes] = useState<string[]>(['不限'])
  const { back } = usePageNav()

  const toggle = (list: string[], setList: (v: string[]) => void, v: string) => {
    if (v === '不限') {
      setList(list.includes('不限') ? [] : ['不限'])
      return
    }
    const next = list.includes('不限') ? [v] : list.includes(v) ? list.filter((x) => x !== v) : [...list, v]
    setList(next)
  }

  const rows = data.risks.filter((r) => {
    if (riskTypes.length && !riskTypes.includes('不限') && !riskTypes.includes(r.type)) return false
    if (levels.length && !levels.includes(r.level)) return false
    return true
  })

  const levelCell = (r: Row) => {
    const l = String(r.level)
    return <EpTag color={LEVEL[l]?.c} bg={LEVEL[l]?.b}>{l}</EpTag>
  }

  const typeCell = (r: Row) => (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#475569' }}>
      <span style={{ width: 14, height: 14, borderRadius: '50%', background: '#F59E0B', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7M17 7H7M17 7V17"/></svg>
      </span>
      {String(r.type)}
    </span>
  )

  const contentCell = (r: Row) => (
    <div style={{ maxWidth: 520, whiteSpace: 'normal', lineHeight: 1.6 }}>
      <div style={{ color: '#0F172A', fontWeight: 500, fontSize: 13 }}>{String(r.title)}</div>
      <div style={{ color: '#64748B', fontSize: 12, marginTop: 2 }}>{String(r.content)}</div>
      {r.related && <span style={{ marginTop: 4, display: 'inline-block', padding: '1px 6px', borderRadius: 4, background: '#FEF3C7', color: '#B45309', fontSize: 11 }}>{String(r.related)}</span>}
    </div>
  )

  const cols: Column[] = [
    { key: 'pushTime', label: '推送时间', width: 100 },
    { key: 'level', label: '风险等级', render: levelCell, width: 90 },
    { key: 'type', label: '风险类型', render: typeCell, width: 120 },
    { key: 'content', label: '风险内容', render: contentCell },
  ]

  return (
    <EpPage
      title="风险详情"
      subtitle={`${data.company} · 监控企业风险详情`}
      crumb="风控中心 / 监控列表 / 风险详情"
      actions={<Sam value="fkMonitorDetail.json" />}
      onBack={() => back('/console/ep/fk-monitor-list')}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '324px 1fr', gap: 16, alignItems: 'start' }}>
        {/* 左侧：企业信息 + 位置地图 */}
        <div style={{ position: 'sticky', top: 16 }}>
          <EpCard>
            {/* 企业头部 */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{data.companyInfo.name}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginTop: 6, fontSize: 12, color: '#64748B' }}>
                <span style={{ padding: '1px 8px', borderRadius: 10, background: '#DCFCE7', color: '#16A34A', fontSize: 11 }}>{data.companyInfo.status}</span>
                <span>{data.companyInfo.capital}</span>
                <span>{data.companyInfo.establishDate}</span>
                <span>{data.companyInfo.location}</span>
              </div>
            </div>
            {/* 公司位置地图 */}
            <div style={{ position: 'relative', height: 168, borderRadius: 10, overflow: 'hidden', border: '1px solid #E2E8F0', background: 'linear-gradient(135deg,#EAF3EC 0%,#E3EEF5 100%)' }}>
              <svg width="100%" height="100%" viewBox="0 0 320 168" preserveAspectRatio="xMidYMid slice">
                <rect x="0" y="58" width="320" height="14" fill="#fff" opacity="0.9" />
                <rect x="0" y="120" width="320" height="9" fill="#fff" opacity="0.8" />
                <rect x="78" y="0" width="12" height="168" fill="#fff" opacity="0.8" />
                <rect x="196" y="0" width="9" height="168" fill="#fff" opacity="0.7" />
                <rect x="18" y="18" width="48" height="30" rx="3" fill="#D7E6D9" />
                <rect x="108" y="80" width="70" height="30" rx="3" fill="#CFE3EF" />
                <rect x="226" y="18" width="58" height="26" rx="3" fill="#E6E0D2" />
                <rect x="226" y="132" width="58" height="24" rx="3" fill="#D7E6D9" />
                <g transform="translate(158,66)">
                  <path d="M0 0 C-13 -21 -13 -40 0 -40 C13 -40 13 -21 0 0 Z" fill="#DC2626" />
                  <circle cx="0" cy="-27" r="5.5" fill="#fff" />
                </g>
              </svg>
              <div style={{ position: 'absolute', left: 8, bottom: 8, background: 'rgba(255,255,255,0.92)', padding: '2px 8px', borderRadius: 6, fontSize: 11, color: '#334155' }}>
                {data.companyInfo.location} · 前海深港合作区
              </div>
            </div>
            {/* 企业信息明细 */}
            <div style={{ marginTop: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 6 }}>企业信息</div>
              {([
                ['信用代码', data.companyInfo.creditCode],
                ['国家/地区', data.companyInfo.country],
                ['详细地址', data.companyInfo.address],
                ['联系邮箱', data.companyInfo.email],
                ['企业编号', data.companyInfo.companyNo],
                ['企业简称', data.companyInfo.shortName],
                ['关联企业', data.companyInfo.related],
                ['企业标签', data.companyInfo.tags],
                ['企业分组', data.companyInfo.group],
                ['负责人/部门', data.companyInfo.owner],
                ['备注信息', data.companyInfo.remark],
                ['添加人员', data.companyInfo.addUser],
                ['添加时间', data.companyInfo.addTime],
                ['监控规则', data.companyInfo.monitorRule],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 10, padding: '7px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                  <span style={{ width: 76, flexShrink: 0, color: '#94A3B8' }}>{k}</span>
                  <span style={{ color: '#334155', wordBreak: 'break-all' }}>{v}</span>
                </div>
              ))}
            </div>
          </EpCard>
        </div>

        {/* 右侧：原有风险内容 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 风险概览 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        <EpCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'conic-gradient(#2563EB 0% 70%, #EFF6FF 70% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#2563EB' }}>{data.score}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#64748B' }}>风险分数</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>{data.score}</div>
            </div>
          </div>
        </EpCard>
        <EpCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'conic-gradient(#F59E0B 0% 45%, #EFF6FF 45% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#F59E0B' }}>{data.totalRisk}</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#64748B' }}>风险总数</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>{data.totalRisk}</div>
            </div>
          </div>
        </EpCard>
        <EpCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'conic-gradient(#EF4444 0% 0%, #EFF6FF 0% 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                <div style={{ width: 66, height: 66, borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#EF4444' }}>{data.highRisk}</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, color: '#64748B' }}>高风险</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: '#0F172A' }}>{data.highRisk}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setPeriod(t)}
                  style={{
                    padding: '4px 10px', borderRadius: 14, border: '1px solid ' + (period === t ? '#2563EB' : '#E2E8F0'),
                    background: period === t ? '#EFF6FF' : '#fff', color: period === t ? '#2563EB' : '#64748B', fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </EpCard>
      </div>

      {/* 风险分数趋势 + 风险分布 */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <EpCard title="风险分数趋势" extra={<select style={{ padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 12, color: '#64748B' }}><option>按天</option><option>按周</option></select>}>
          <LineChart labels={data.trend.labels} series={[{ name: '风险分数', color: '#2563EB', data: data.trend.score }]} height={240} yMax={1000} />
        </EpCard>
        <EpCard title="风险分布" subtitle={`${data.company} 9`}>
          <DonutChart data={data.distribution} centerValue={String(data.totalRisk)} centerLabel="风险总数" />
        </EpCard>
      </div>

      {/* 风险传导 */}
      <EpCard title="风险传导" style={{ marginBottom: 16 }}>
        <div style={{ position: 'relative', height: 220 }}>
          <svg width="100%" height="100%" viewBox="0 0 800 220">
            {/* 连接线 */}
            {data.chain.links.map((l, i) => {
              const from = data.chain.nodes.find((n) => n.id === l.from)
              const to = data.chain.nodes.find((n) => n.id === l.to)
              if (!from || !to) return null
              return (
                <g key={i}>
                  <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#CBD5E1" strokeWidth={2} strokeDasharray="6 4" />
                  <rect x={(from.x + to.x) / 2 - 45} y={(from.y + to.y) / 2 - 11} width={90} height={22} rx={11} fill="#EFF6FF" stroke="#93C5FD" />
                  <text x={(from.x + to.x) / 2} y={(from.y + to.y) / 2 + 4} textAnchor="middle" fontSize={11} fill="#2563EB">{l.label}</text>
                </g>
              )
            })}
            {/* 节点 */}
            {data.chain.nodes.map((n) => (
              <g key={n.id}>
                <rect x={n.x - 70} y={n.y - 28} width={140} height={56} rx={8} fill="#fff" stroke="#E2E8F0" strokeWidth={1} />
                <text x={n.x} y={n.y - 8} textAnchor="middle" fontSize={13} fontWeight={600} fill="#0F172A">{n.name}</text>
                {n.tag && <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize={11} fill="#2563EB">{n.tag}</text>}
                {n.risk != null && (
                  <text x={n.x} y={n.y + 12} textAnchor="middle" fontSize={11} fill="#64748B">
                    风险分：<tspan fill="#F59E0B">{n.risk}</tspan> · 关联风险：<tspan fill="#F59E0B">{n.court}</tspan>
                  </text>
                )}
                {n.date && <text x={n.x} y={n.y + 26} textAnchor="middle" fontSize={10} fill="#94A3B8">{n.date} · {n.person}</text>}
              </g>
            ))}
          </svg>
        </div>
      </EpCard>

      {/* 风险动态 */}
      <EpCard title="风险动态">
        {/* 监控筛选 */}
        <div style={{ paddingBottom: 12, borderBottom: '1px solid #F1F5F9', marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 20, marginBottom: 10 }}>
            <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>监控筛选</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 18px', flex: 1 }}>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                <input type="radio" checked={timeKind === '推送时间'} onChange={() => setTimeKind('推送时间')} /> 推送时间
              </label>
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                <input type="radio" checked={timeKind === '发生时间'} onChange={() => setTimeKind('发生时间')} /> 发生时间
              </label>
              {['风险等级', '阅读状态', '跟进状态', '标记动态', '监控规则'].map((label) => (
                <span key={label} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                  <input type="checkbox" /> {label}
                </span>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 500, whiteSpace: 'nowrap' }}>风险类型</span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 14px', flex: 1 }}>
              {RISK_TYPES.map((t) => (
                <label key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                  <input type="checkbox" checked={riskTypes.includes(t)} onChange={() => toggle(riskTypes, setRiskTypes, t)} /> {t}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 已选条件 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 13, color: '#64748B' }}>
          <span>已选条件：</span>
          <span style={{ padding: '3px 10px', background: '#F1F5F9', borderRadius: 12, color: '#0F172A', fontSize: 12 }}>推送时间：2026-07-20 至 2026-08-19 ×</span>
          <button style={{ marginLeft: 'auto', color: '#64748B', fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer' }}>清空</button>
        </div>

        {/* 表格 */}
        <DataTable columns={cols} rows={rows as unknown as Row[]} exportable exportName="风险动态" empty="暂无数据" />
      </EpCard>
        </div>
      </div>
    </EpPage>
  )
}
