// 企业风控 · 监控规则详情（fk-monitor-detail）· 1:1 复刻「风险详情」截图
// 数据：本地样例 fkMonitorDetail.json（橘 Sam）
import { useState } from 'react';
import { EpPage, EpCard, EpTag, EpBtn, DataTable, useSample } from '../../epCommon';
import { LineChart, DonutChart } from '../../../../components/charts';
import type { Row, Column } from '../../../../components/ui';
import seedJson from '../../../fkMonitorDetail.json'
import { usePageNav } from '../../../pageNav'
import { RiskContentDrawer } from '../components/RiskContentDrawer'

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
  const [riskOpen, setRiskOpen] = useState(false)
  const [cur, setCur] = useState<Risk | null>(null)
  const { back } = usePageNav()

  // 已选条件 chips
  const chips: { label: string; text: string; onRemove: () => void }[] = [
    { label: timeKind, text: period, onRemove: () => { setTimeKind('推送时间'); setPeriod('近30天') } },
    ...(levels.length ? [{ label: '风险等级', text: levels.join('、'), onRemove: () => setLevels([]) }] : []),
    ...(readState.length ? [{ label: '阅读状态', text: readState.join('、'), onRemove: () => setReadState([]) }] : []),
    ...(followState.length ? [{ label: '跟进状态', text: followState.join('、'), onRemove: () => setFollowState([]) }] : []),
    ...(markState.length ? [{ label: '标记动态', text: markState.join('、'), onRemove: () => setMarkState([]) }] : []),
    ...(ruleState.length ? [{ label: '监控规则', text: ruleState.join('、'), onRemove: () => setRuleState([]) }] : []),
    ...(riskTypes.filter((t) => t !== '不限').length ? [{ label: '风险类型', text: riskTypes.filter((t) => t !== '不限').join('、'), onRemove: () => setRiskTypes(['不限']) }] : []),
  ]
  const resetFilters = () => {
    setLevels([]); setReadState([]); setFollowState([]); setMarkState([]); setRuleState([]); setRiskTypes(['不限'])
  }

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
    <div
      style={{ maxWidth: 620, whiteSpace: 'normal', lineHeight: 1.7, cursor: 'pointer' }}
      onClick={() => { setCur(r as unknown as Risk); setRiskOpen(true) }}
    >
      <div style={{ color: '#0F172A', fontWeight: 500, fontSize: 13, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{String(r.title)}</div>
      <div style={{ color: '#64748B', fontSize: 12, marginTop: 2, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{String(r.content)}</div>
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
          {/* 页面级时间筛选 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 16px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, color: '#0F172A', fontWeight: 600 }}>时间筛选</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {TIMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setPeriod(t)}
                  style={{
                    padding: '4px 12px', borderRadius: 14, border: '1px solid ' + (period === t ? '#2563EB' : '#E2E8F0'),
                    background: period === t ? '#EFF6FF' : '#fff', color: period === t ? '#2563EB' : '#64748B', fontSize: 12, cursor: 'pointer',
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
            <span style={{ width: 1, height: 18, background: '#E2E8F0', margin: '0 4px' }} />
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              <input type="radio" checked={timeKind === '推送时间'} onChange={() => setTimeKind('推送时间')} /> 推送时间
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
              <input type="radio" checked={timeKind === '发生时间'} onChange={() => setTimeKind('发生时间')} /> 发生时间
            </label>
          </div>

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
        <div style={{ position: 'relative', height: 240 }}>
          <svg width="100%" height="100%" viewBox="0 0 640 240">
            {/* 连接线（整体居中偏移） */}
            {data.chain.links.map((l, i) => {
              const from = data.chain.nodes.find((n) => n.id === l.from)
              const to = data.chain.nodes.find((n) => n.id === l.to)
              if (!from || !to) return null
              const fx = from.x + 80, fy = from.y + 40, tx = to.x + 80, ty = to.y + 40
              return (
                <g key={i}>
                  <line x1={fx} y1={fy} x2={tx} y2={ty} stroke="#CBD5E1" strokeWidth={2} strokeDasharray="6 4" />
                  <rect x={(fx + tx) / 2 - 48} y={(fy + ty) / 2 - 12} width={96} height={24} rx={12} fill="#EFF6FF" stroke="#93C5FD" />
                  <text x={(fx + tx) / 2} y={(fy + ty) / 2 + 4} textAnchor="middle" fontSize={11} fill="#2563EB">{l.label}</text>
                </g>
              )
            })}
            {/* 节点（放大并居中） */}
            {data.chain.nodes.map((n) => {
              const nx = n.x + 80, ny = n.y + 40
              return (
                <g key={n.id}>
                  <rect x={nx - 80} y={ny - 31} width={160} height={62} rx={8} fill="#fff" stroke="#E2E8F0" strokeWidth={1} />
                  <text x={nx} y={ny - 9} textAnchor="middle" fontSize={14} fontWeight={600} fill="#0F172A">{n.name}</text>
                  {n.tag && <text x={nx} y={ny + 13} textAnchor="middle" fontSize={12} fill="#2563EB">{n.tag}</text>}
                  {n.risk != null && (
                    <text x={nx} y={ny + 13} textAnchor="middle" fontSize={12} fill="#64748B">
                      风险分：<tspan fill="#F59E0B">{n.risk}</tspan> · 关联风险：<tspan fill="#F59E0B">{n.court}</tspan>
                    </text>
                  )}
                  {n.date && <text x={nx} y={ny + 28} textAnchor="middle" fontSize={11} fill="#94A3B8">{n.date} · {n.person}</text>}
                </g>
              )
            })}
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
              <FilterChip2 kind="check" label="风险等级" active={levels.length > 0} options={['高风险', '中风险', '低风险', '轻微风险']} value={levels} onChange={(v) => toggle(levels, setLevels, v)} />
              <FilterChip2 kind="check" label="阅读状态" active={readState.length > 0} options={['已读', '未读']} value={readState} onChange={(v) => toggle(readState, setReadState, v)} />
              <FilterChip2 kind="check" label="跟进状态" active={followState.length > 0} options={['未处理', '处理中', '已处理', '无需处理']} value={followState} onChange={(v) => toggle(followState, setFollowState, v)} />
              <FilterChip2 kind="check" label="标记动态" active={markState.length > 0} options={['重点关注风险', '存在信用风险', '重大工商变更', '外部供应链风险']} value={markState} onChange={(v) => toggle(markState, setMarkState, v)} />
              <FilterChip2 kind="check" label="监控规则" active={ruleState.length > 0} options={['企业征信默认规则(国内)', '企业征信默认规则(境外)', '外部供应链风险']} value={ruleState} onChange={(v) => toggle(ruleState, setRuleState, v)} />
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, fontSize: 13, color: '#64748B', flexWrap: 'wrap' }}>
          <span>已选条件：</span>
          {chips.map((c, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: '#F1F5F9', borderRadius: 12, color: '#0F172A', fontSize: 12 }}>
              {c.label}：{c.text}
              <span style={{ cursor: 'pointer', color: '#94A3B8' }} onClick={c.onRemove}>×</span>
            </span>
          ))}
          <button style={{ marginLeft: 'auto', color: '#64748B', fontSize: 12, border: 'none', background: 'transparent', cursor: 'pointer' }} onClick={resetFilters}>清空</button>
        </div>

        {/* 表格 */}
        <DataTable columns={cols} rows={rows as unknown as Row[]} exportable exportName="风险动态" empty="暂无数据" />
      </EpCard>
        </div>
      </div>

      {/* 风险内容点击弹窗（与风险预警页共用同一弹窗） */}
      <RiskContentDrawer
        open={riskOpen}
        row={cur ? (cur as unknown as Record<string, any>) : null}
        read={cur ? {
          think: '(0.0s)',
          items: [
            { k: '影响程度', v: cur.level === '高风险' ? '高' : cur.level === '中风险' ? '中' : '低' },
            { k: '风险类型', v: String(cur.type) },
            { k: '风险摘要', v: String(cur.content).slice(0, 120) },
            { k: '关联企业', v: String(cur.title) },
            { k: '行动建议', v: '建议进一步核查该风险事件的具体案情与进展，评估对监控企业的实际影响程度，必要时启动关联风险排查并制定应对措施。' },
          ],
          footer: '本次分析由AI生成，仅供参考，不构成法律或投资建议。',
        } : undefined}
        onClose={() => setRiskOpen(false)}
        title="风险详情"
      />
    </EpPage>
  )
}

/* ---------------- 筛选下拉组件 ---------------- */
function FilterChip2({ kind, label, active, options, value, onChange }: {
  kind: 'radio' | 'check'
  label: string
  active: boolean
  options: string[]
  value: string[]
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span
        onClick={() => setOpen((v) => !v)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 13, color: '#4E5969', userSelect: 'none', whiteSpace: 'nowrap' }}
      >
        {kind === 'radio' ? (
          <span style={{ width: 14, height: 14, borderRadius: '50%', border: `1px solid ${active ? '#165DFF' : '#C9CDD4'}`, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
            {active && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#165DFF' }} />}
          </span>
        ) : (
          <span style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${active ? '#165DFF' : '#C9CDD4'}`, background: active ? '#165DFF' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {active && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            )}
          </span>
        )}
        <span style={{ color: active ? '#165DFF' : '#4E5969' }}>{label}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: active ? '#165DFF' : '#C9CDD4' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </span>
      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 39 }} onClick={() => setOpen(false)} />
          <div style={{ position: 'absolute', top: '100%', left: 0, zIndex: 40, minWidth: 176, marginTop: 4, background: '#fff', border: '1px solid #E5E6EB', borderRadius: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)', padding: 6 }}>
            {options.map((o) => {
              const checked = value.includes(o)
              return (
                <div
                  key={o}
                  onClick={() => { onChange(o) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 4, cursor: 'pointer', fontSize: 13, color: checked ? '#165DFF' : '#1D2129' }}
                >
                  <span style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${checked ? '#165DFF' : '#C9CDD4'}`, background: checked ? '#165DFF' : '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <span>{o}</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </span>
  )
}
