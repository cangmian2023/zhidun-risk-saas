// 风控中心 · 统计看板（fk-stats）· 1:1 复刻「启信慧眼 - 统计看板」
// 内容区：筛选栏 + 报告列表 + 企业风险排名 + 图表区（动态/趋势/等级/雷达/新增）+ 其他统计 + 区域排名 + 趋势预测
// 数据：本地样例 fkStats.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'
import { LineChart, BarChart, DonutChart } from '../../../../components/charts'

type Stats = typeof seed

const seed = {
  monitorCount: 16,
  // 报告列表
  reports: [
    { id: 1, date: '2026-08-17', monitored: 16, riskSubjects: 4, total: 28, high: 9, genTime: '2026-08-17 15:40', report: '企业风险 AI 日报（2026-08-17）', op: '下载' },
    { id: 2, date: '2026-08-16', monitored: 16, riskSubjects: 4, total: 25, high: 8, genTime: '2026-08-16 15:40', report: '企业风险 AI 日报（2026-08-16）', op: '下载' },
    { id: 3, date: '2026-08-15', monitored: 16, riskSubjects: 5, total: 31, high: 11, genTime: '2026-08-15 15:40', report: '企业风险 AI 日报（2026-08-15）', op: '下载' },
    { id: 4, date: '2026-08-14', monitored: 16, riskSubjects: 3, total: 22, high: 7, genTime: '2026-08-14 15:40', report: '企业风险 AI 日报（2026-08-14）', op: '下载' },
    { id: 5, date: '2026-08-13', monitored: 16, riskSubjects: 6, total: 35, high: 13, genTime: '2026-08-13 15:40', report: '企业风险 AI 日报（2026-08-13）', op: '下载' },
    { id: 6, date: '2026-08-12', monitored: 16, riskSubjects: 4, total: 26, high: 9, genTime: '2026-08-12 15:40', report: '企业风险 AI 日报（2026-08-12）', op: '下载' },
  ],
  // 企业风险排名
  rank: [
    { id: 1, name: '抖音有限公司', score: 92, owner: '信贷风控部', tag: '高关注', total: 34, high: 12, mid: 14, low: 6, micro: 2, daily: 0 },
    { id: 2, name: '北京首都国际机场', score: 88, owner: '客户经理-王敏', tag: '民航', total: 27, high: 9, mid: 11, low: 5, micro: 2, daily: 1 },
    { id: 3, name: 'Tesla, Inc.', score: 81, owner: '信贷风控部', tag: '境外', total: 21, high: 7, mid: 9, low: 4, micro: 1, daily: 0 },
    { id: 4, name: '深圳市腾讯计算机系统有限公司', score: 76, owner: '客户经理-李强', tag: '科技', total: 19, high: 5, mid: 8, low: 5, micro: 1, daily: 0 },
    { id: 5, name: '北京微梦创科网络技术有限公司', score: 70, owner: '信贷风控部', tag: '互联网', total: 15, high: 4, mid: 6, low: 4, micro: 1, daily: 0 },
    { id: 6, name: '乐视网信息技术（北京）股份有限公司', score: 64, owner: '客户经理-王敏', tag: '退市风险', total: 12, high: 6, mid: 4, low: 2, micro: 0, daily: 0 },
  ],
  // 企业风险动态（横向条形图）
  dynamic: [
    { name: '抖音有限公司', value: 34 },
    { name: '北京首都国际机场', value: 27 },
    { name: 'Tesla, Inc.', value: 21 },
    { name: '深圳市腾讯计算机系统有限公司', value: 19 },
    { name: '北京微梦创科网络技术有限公司', value: 15 },
    { name: '乐视网信息技术（北京）股份有限公司', value: 12 },
  ],
  // 风险数量趋势（柱状图）
  riskTrend: {
    labels: ['08-11', '08-12', '08-13', '08-14', '08-15', '08-16', '08-17'],
    series: [{ name: '风险总数', color: '#2563EB', data: [28, 25, 31, 22, 26, 35, 28] }],
  },
  // 风险等级分布（环形图）
  levelDist: [
    { label: '高风险', value: 42, color: '#DC2626' },
    { label: '中风险', value: 58, color: '#F59E0B' },
    { label: '低风险', value: 33, color: '#10B981' },
    { label: '轻微风险', value: 12, color: '#94A3B8' },
  ],
  // 风险雷达分布（环形图）
  radarDist: [
    { label: '工商变更', value: 28, color: '#2563EB' },
    { label: '司法诉讼', value: 19, color: '#DC2626' },
    { label: '经营异常', value: 22, color: '#F59E0B' },
    { label: '舆情负面', value: 15, color: '#8B5CF6' },
    { label: '信用风险', value: 26, color: '#10B981' },
  ],
  // 风险趋势（折线图）
  trend: {
    labels: ['第1周', '第2周', '第3周', '第4周'],
    series: [
      { name: '风险总数', color: '#2563EB', data: [320, 415, 388, 470] },
      { name: '高风险数量', color: '#DC2626', data: [98, 132, 121, 158] },
    ],
  },
  // 企业新增风险
  newRisk: [
    { id: 1, name: '抖音有限公司', type: '司法诉讼', level: '高', time: '2026-08-17 10:12', count: 3 },
    { id: 2, name: '北京首都国际机场', type: '经营异常', level: '中', time: '2026-08-17 09:40', count: 2 },
    { id: 3, name: 'Tesla, Inc.', type: '舆情负面', level: '中', time: '2026-08-16 22:05', count: 1 },
    { id: 4, name: '深圳市腾讯计算机系统有限公司', type: '工商变更', level: '低', time: '2026-08-16 18:33', count: 2 },
    { id: 5, name: '乐视网信息技术（北京）股份有限公司', type: '司法诉讼', level: '高', time: '2026-08-16 15:20', count: 4 },
  ],
  // 港口/航线风险（空状态）
  portEmpty: true,
  // 关键字分布（横向条形图）
  keyword: [
    { name: '失信被执行人', value: 18 },
    { name: '限制高消费', value: 14 },
    { name: '股权冻结', value: 11 },
    { name: '行政处罚', value: 9 },
    { name: '环保处罚', value: 6 },
    { name: '欠税公告', value: 4 },
  ],
  // 区域风险排名
  region: [
    { id: 1, region: '华东地区', high: 120, mid: 85, low: 40, micro: 5, total: 250, ratio: '38.4%' },
    { id: 2, region: '华南地区', high: 92, mid: 64, low: 31, micro: 4, total: 191, ratio: '29.3%' },
    { id: 3, region: '华北地区', high: 58, mid: 41, low: 22, micro: 3, total: 124, ratio: '19.0%' },
    { id: 4, region: '西南地区', high: 24, mid: 18, low: 9, micro: 1, total: 52, ratio: '8.0%' },
    { id: 5, region: '其他地区', high: 16, mid: 12, low: 6, micro: 1, total: 35, ratio: '5.3%' },
  ],
  // 风险趋势预测（折线图）
  forecast: {
    labels: ['08-17', '08-18', '08-19', '08-20', '08-21', '08-22', '08-23'],
    series: [
      { name: '实际风险数', color: '#2563EB', data: [28, 25, 31, 22, 26, 35, 28] },
      { name: '预测风险数', color: '#F59E0B', data: [28, 30, 33, 29, 32, 36, 34] },
    ],
  },
}

const TABS = ['AI 风险报告', '企业风险排名', '企业风险动态', '其他统计'] as const

const riskColor: Record<string, string> = {
  high: '#DC2626', mid: '#F59E0B', low: '#10B981', micro: '#94A3B8',
}

/* 横向条形图 */
function HBarChart({ data, color = '#2563EB', height = 240 }: { data: { name: string; value: number }[]; color?: string; height?: number }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  const rowH = 30
  const labelW = 200
  const valW = 44
  return (
    <div style={{ padding: '4px 4px' }}>
      {data.map((d) => (
        <div key={d.name} style={{ display: 'flex', alignItems: 'center', height: rowH }}>
          <div style={{ width: labelW, fontSize: 12, color: '#475569', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', paddingRight: 8 }}>
            {d.name}
          </div>
          <div style={{ flex: 1, background: '#F1F5F9', borderRadius: 6, height: 16, position: 'relative' }}>
            <div style={{ width: `${(d.value / max) * 100}%`, background: color, borderRadius: 6, height: 16, transition: 'width .2s' }} />
          </div>
          <div style={{ width: valW, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#334155' }}>{d.value}</div>
        </div>
      ))}
    </div>
  )
}

export default function FkStats({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Stats>('fkStats.json', seed)
  const [tab, setTab] = useState<string>(TABS[0])
  const [riskNum, setRiskNum] = useState('10家')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [grain, setGrain] = useState('日报')

  return (
    <EpPage
      title="统计看板"
      subtitle="风控中心风险数据可视化与统计"
      crumb="风控中心 / 统计看板"
      actions={<span style={{ fontSize: 13, color: '#64748B' }}>监控企业数：<b style={{ color: '#2563EB' }}>{data.monitorCount}家</b></span>}
    >
      {/* 筛选栏 */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <Select value={riskNum} onChange={setRiskNum} options={['10家', '20家', '50家', '全部']} />
        <span style={{ fontSize: 13, color: '#475569' }}>抵达时间</span>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} style={dateStyle} />
        <span style={{ fontSize: 13, color: '#94A3B8' }}>至</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} style={dateStyle} />
        <Select value="风险等级" onChange={() => {}} options={['风险等级', '高风险', '中风险', '低风险', '轻微风险']} />
        <Select value="标签" onChange={() => {}} options={['标签', '高关注', '民航', '境外', '科技', '互联网', '退市风险']} />
        <div style={{ flex: 1 }} />
        <EpBtn variant="primary" size="sm">下载数据</EpBtn>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #E2E8F0', marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '10px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
              fontSize: 14, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? '#2563EB' : '#64748B',
              borderBottom: tab === t ? '2px solid #2563EB' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* 时间粒度切换 */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: '#475569' }}>报告周期：</span>
        {['日报', '周报', '月报', '季报'].map((g) => (
          <button
            key={g}
            onClick={() => setGrain(g)}
            style={{
              padding: '5px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              border: '1px solid ' + (grain === g ? '#2563EB' : '#CBD5E1'),
              background: grain === g ? '#EFF6FF' : '#fff', color: grain === g ? '#2563EB' : '#475569',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {tab === 'AI 风险报告' && <ReportTab data={data} />}
      {tab === '企业风险排名' && <RankTab data={data} />}
      {tab === '企业风险动态' && <DynamicTab data={data} />}
      {tab === '其他统计' && <OtherTab data={data} />}
    </EpPage>
  )
}

/* ---------------- AI 风险报告 ---------------- */
function ReportTab({ data }: { data: Stats }) {
  const cols: Column[] = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'date', label: '日期' },
    { key: 'monitored', label: '监控主体数', render: (r: Row) => <b>{r.monitored}</b> },
    { key: 'riskSubjects', label: '发生风险主体数', render: (r: Row) => <span style={{ color: riskColor.high }}>{r.riskSubjects}</span> },
    { key: 'total', label: '风险总数', render: (r: Row) => <b>{r.total}</b> },
    { key: 'high', label: '高风险数量', render: (r: Row) => <span style={{ color: riskColor.high }}>{r.high}</span> },
    { key: 'genTime', label: '生成时间' },
    { key: 'report', label: '报告' },
    {
      key: 'op', label: '操作',
      render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('下载报告')}>下载</a>,
    },
  ]
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
        <EpStat label="监控主体数" value={data.monitorCount} sub="当前监控企业总数" accent="#2563EB" />
        <EpStat label="今日风险总数" value={data.reports[0].total} sub={`${data.reports[0].date}`} accent="#DC2626" />
        <EpStat label="今日高风险" value={data.reports[0].high} sub="需重点关注" accent="#F59E0B" />
        <EpStat label="累计报告" value={data.reports.length} sub="日报 / 周报 / 月报 / 季报" />
      </div>
      <EpCard title="报告列表" desc="按生成时间倒序排列的 AI 风险报告" actions={<Sam value="fkStats.json" />}>
        <DataTable columns={cols} rows={data.reports as unknown as Row[]} exportable exportName="AI风险报告" empty="暂无数据" />
      </EpCard>
      <div style={{ marginTop: 14 }}>
        <RankTable data={data} />
      </div>
      <div style={{ marginTop: 14 }}>
        <ChartGrid data={data} />
      </div>
      <div style={{ marginTop: 14 }}>
        <OtherStat data={data} />
      </div>
      <div style={{ marginTop: 14 }}>
        <RegionTable data={data} />
      </div>
      <div style={{ marginTop: 14 }}>
        <EpCard title="风险趋势预测" desc="基于历史数据预测未来 7 日风险走势" actions={<Sam value="fkStats.json" />}>
          <LineChart labels={data.forecast.labels} series={data.forecast.series} height={240} />
        </EpCard>
      </div>
    </>
  )
}

/* ---------------- 企业风险排名 ---------------- */
function RankTab({ data }: { data: Stats }) {
  return <RankTable data={data} />
}

/* ---------------- 企业风险动态 ---------------- */
function DynamicTab({ data }: { data: Stats }) {
  return (
    <>
      <EpCard title="企业风险动态" desc="各监控企业当前风险数量横向对比" actions={<Sam value="fkStats.json" />}>
        <HBarChart data={data.dynamic} color="#2563EB" />
      </EpCard>
      <div style={{ marginTop: 14 }}>
        <ChartGrid data={data} />
      </div>
    </>
  )
}

/* ---------------- 其他统计 ---------------- */
function OtherTab({ data }: { data: Stats }) {
  return (
    <>
      <OtherStat data={data} />
      <div style={{ marginTop: 14 }}>
        <RegionTable data={data} />
      </div>
    </>
  )
}

/* ============ 复用区块 ============ */

function RankTable({ data }: { data: Stats }) {
  const cols: Column[] = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'name', label: '监控企业' },
    { key: 'score', label: '风险评分', render: (r: Row) => <b style={{ color: (r.score as number) >= 80 ? '#DC2626' : '#2563EB' }}>{r.score}</b> },
    { key: 'owner', label: '负责人/部门' },
    { key: 'tag', label: '标签', render: (r: Row) => <EpTag>{String(r.tag)}</EpTag> },
    { key: 'total', label: '风险数量', render: (r: Row) => <b>{r.total}</b> },
    { key: 'high', label: '高风险', render: (r: Row) => <span style={{ color: riskColor.high }}>{r.high}</span> },
    { key: 'mid', label: '中风险', render: (r: Row) => <span style={{ color: riskColor.mid }}>{r.mid}</span> },
    { key: 'low', label: '低风险', render: (r: Row) => <span style={{ color: riskColor.low }}>{r.low}</span> },
    { key: 'micro', label: '轻微风险', render: (r: Row) => <span style={{ color: riskColor.micro }}>{r.micro}</span> },
    { key: 'daily', label: '日常资讯', render: (r: Row) => r.daily },
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('查看企业风险详情')}>详情</a> },
  ]
  return (
    <EpCard title="企业风险排名" desc="序号 / 监控企业 / 风险评分 / 负责人·部门 / 标签 / 风险数量 / 高·中·低·轻微 / 日常资讯 / 操作" actions={<Sam value="fkStats.json" />}>
      <DataTable columns={cols} rows={data.rank as unknown as Row[]} exportable exportName="企业风险排名" empty="暂无数据" />
    </EpCard>
  )
}

function ChartGrid({ data }: { data: Stats }) {
  const newRiskCols: Column[] = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'name', label: '企业' },
    { key: 'type', label: '风险类型' },
    { key: 'level', label: '等级', render: (r: Row) => <span style={{ color: r.level === '高' ? riskColor.high : r.level === '中' ? riskColor.mid : riskColor.low }}>{String(r.level)}</span> },
    { key: 'time', label: '发生时间' },
    { key: 'count', label: '新增数', render: (r: Row) => <b>{r.count}</b> },
  ]
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <EpCard title="企业风险动态" desc="各企业当前风险数量" actions={<Sam value="fkStats.json" />}>
          <HBarChart data={data.dynamic} color="#2563EB" />
        </EpCard>
        <EpCard title="风险数量趋势" desc="近 7 日风险总数变化" actions={<Sam value="fkStats.json" />}>
          <BarChart labels={data.riskTrend.labels} series={data.riskTrend.series} height={240} />
        </EpCard>
        <EpCard title="风险等级分布" desc="高·中·低·轻微风险占比" actions={<Sam value="fkStats.json" />}>
          <DonutChart data={data.levelDist} centerValue={String(data.levelDist.reduce((a, d) => a + d.value, 0))} centerLabel="风险总数" height={220} />
        </EpCard>
        <EpCard title="风险雷达分布" desc="各风险维度占比" actions={<Sam value="fkStats.json" />}>
          <DonutChart data={data.radarDist} centerValue={String(data.radarDist.reduce((a, d) => a + d.value, 0))} centerLabel="风险维度" height={220} />
        </EpCard>
      </div>
      <div style={{ marginTop: 14 }}>
        <EpCard title="企业新增风险" desc="最新触发的风险事件明细" actions={<Sam value="fkStats.json" />}>
          <DataTable columns={newRiskCols} rows={data.newRisk as unknown as Row[]} exportable exportName="企业新增风险" empty="暂无数据" />
        </EpCard>
      </div>
      <div style={{ marginTop: 14 }}>
        <EpCard title="风险趋势" desc="各周风险总数与高风险数量" actions={<Sam value="fkStats.json" />}>
          <LineChart labels={data.trend.labels} series={data.trend.series} height={240} />
        </EpCard>
      </div>
    </>
  )
}

function OtherStat({ data }: { data: Stats }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
      <EpCard title="港口/航线风险" desc="按港口与航线统计的风险分布" actions={<Sam value="fkStats.json" />}>
        {data.portEmpty ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>暂无港口/航线风险数据</div>
        ) : null}
      </EpCard>
      <EpCard title="关键字分布" desc="高频风险关键字命中统计" actions={<Sam value="fkStats.json" />}>
        <HBarChart data={data.keyword} color="#7C3AED" />
      </EpCard>
    </div>
  )
}

function RegionTable({ data }: { data: Stats }) {
  const cols: Column[] = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'region', label: '区域' },
    { key: 'high', label: '高风险', render: (r: Row) => <span style={{ color: riskColor.high }}>{r.high}</span> },
    { key: 'mid', label: '中风险', render: (r: Row) => <span style={{ color: riskColor.mid }}>{r.mid}</span> },
    { key: 'low', label: '低风险', render: (r: Row) => <span style={{ color: riskColor.low }}>{r.low}</span> },
    { key: 'micro', label: '轻微风险', render: (r: Row) => <span style={{ color: riskColor.micro }}>{r.micro}</span> },
    { key: 'total', label: '风险总数', render: (r: Row) => <b>{r.total}</b> },
    { key: 'ratio', label: '占比', render: (r: Row) => <b>{r.ratio}</b> },
  ]
  return (
    <EpCard title="区域风险排名" desc="序号 / 区域 / 高·中·低·轻微 / 风险总数 / 占比" actions={<Sam value="fkStats.json" />}>
      <DataTable columns={cols} rows={data.region as unknown as Row[]} exportable exportName="区域风险排名" empty="暂无数据" />
    </EpCard>
  )
}

/* ---------------- 通用下拉 ---------------- */
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, color: '#475569', minWidth: 120, background: '#fff' }}
    >
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

const dateStyle: React.CSSProperties = {
  padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, color: '#475569',
}
