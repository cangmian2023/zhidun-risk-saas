// 风控中心 · 统计看板（fk-stats）· 1:1 复刻「风控 - 统计看板」
// Tabs: AI 风险报告 / 企业风险排名 / 企业风险动态 / 其他统计
// 数据：本地样例 fkStats.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, DataTable, useSample, Sam } from '../epCommon'
import type { Row, Column } from '../../../../components/ui'
import { LineChart, BarChart } from '../../../../components/charts'

type Stats = typeof seed

const seed = {
  monitorCount: 16,
  aiReports: [
    { id: 1, type: '日报', role: '通用角色', title: '企业风险 AI 日报（2026-08-17）', genTime: '2026-08-17 08:00', op: '查看' },
    { id: 2, type: '周报', role: '信贷风控', title: '信贷客户风险周报（2026-08-第3周）', genTime: '2026-08-16 09:30', op: '查看' },
    { id: 3, type: '月报', role: '客户经理', title: '监控企业风险月报（2026-07）', genTime: '2026-08-01 10:00', op: '查看' },
    { id: 4, type: '季报', role: '通用角色', title: '企业风险季度研判报告（2026-Q2）', genTime: '2026-07-05 14:20', op: '查看' },
    { id: 5, type: '日报', role: '信贷风控', title: '企业风险 AI 日报（2026-08-16）', genTime: '2026-08-16 08:00', op: '查看' },
  ],
  reportTrend: {
    labels: ['08-11', '08-12', '08-13', '08-14', '08-15', '08-16', '08-17'],
    series: [
      { name: '生成报告数', color: '#2563EB', data: [3, 4, 2, 5, 4, 5, 5] },
      { name: '触发风险条目', color: '#DC2626', data: [12, 18, 9, 22, 17, 25, 28] },
    ],
  },
  rank: [
    { id: 1, name: '抖音有限公司', score: 92, owner: '信贷风控部', tag: '高关注', total: 34, high: 12, mid: 14, low: 6, micro: 2, daily: 0 },
    { id: 2, name: '北京首都国际机场', score: 88, owner: '客户经理-王敏', tag: '民航', total: 27, high: 9, mid: 11, low: 5, micro: 2, daily: 1 },
    { id: 3, name: 'Tesla, Inc.', score: 81, owner: '信贷风控部', tag: '境外', total: 21, high: 7, mid: 9, low: 4, micro: 1, daily: 0 },
    { id: 4, name: '深圳市腾讯计算机系统有限公司', score: 76, owner: '客户经理-李强', tag: '科技', total: 19, high: 5, mid: 8, low: 5, micro: 1, daily: 0 },
    { id: 5, name: '北京微梦创科网络技术有限公司', score: 70, owner: '信贷风控部', tag: '互联网', total: 15, high: 4, mid: 6, low: 4, micro: 1, daily: 0 },
    { id: 6, name: '乐视网信息技术（北京）股份有限公司', score: 64, owner: '客户经理-王敏', tag: '退市风险', total: 12, high: 6, mid: 4, low: 2, micro: 0, daily: 0 },
  ],
  dynamic: [
    { id: 1, name: '抖音有限公司', score: 92, owner: '信贷风控部', tag: '高关注', total: 34, high: 12, mid: 14, low: 6, micro: 2, daily: 0 },
    { id: 2, name: '北京首都国际机场', score: 88, owner: '客户经理-王敏', tag: '民航', total: 27, high: 9, mid: 11, low: 5, micro: 2, daily: 1 },
    { id: 3, name: 'Tesla, Inc.', score: 81, owner: '信贷风控部', tag: '境外', total: 21, high: 7, mid: 9, low: 4, micro: 1, daily: 0 },
    { id: 4, name: '深圳市腾讯计算机系统有限公司', score: 76, owner: '客户经理-李强', tag: '科技', total: 19, high: 5, mid: 8, low: 5, micro: 1, daily: 0 },
  ],
  period: [
    { id: 1, cycle: '今日', monitored: 16, riskSubjects: 4, total: 28, high: 9, genTime: '2026-08-17 15:40', role: '通用角色', op: '查看' },
    { id: 2, cycle: '本周', monitored: 16, riskSubjects: 9, total: 142, high: 41, genTime: '2026-08-17 08:00', role: '通用角色', op: '查看' },
    { id: 3, cycle: '本月', monitored: 16, riskSubjects: 13, total: 568, high: 162, genTime: '2026-08-01 08:00', role: '信贷风控', op: '查看' },
    { id: 4, cycle: '本季', monitored: 16, riskSubjects: 15, total: 1893, high: 521, genTime: '2026-07-01 08:00', role: '客户经理', op: '查看' },
  ],
  periodTrend: {
    labels: ['第1周', '第2周', '第3周', '第4周'],
    series: [
      { name: '周风险总数', color: '#2563EB', data: [320, 415, 388, 470] },
      { name: '周高风险数量', color: '#DC2626', data: [98, 132, 121, 158] },
    ],
  },
  region: [
    { id: 1, country: '中国', high: 120, mid: 85, low: 40, micro: 5, daily: 3, ratio: '72.4%' },
    { id: 2, country: '美国', high: 22, mid: 18, low: 9, micro: 1, daily: 1, ratio: '13.1%' },
    { id: 3, country: '新加坡', high: 8, mid: 6, low: 3, micro: 0, daily: 0, ratio: '5.0%' },
    { id: 4, country: '中国香港', high: 6, mid: 5, low: 2, micro: 0, daily: 0, ratio: '4.0%' },
    { id: 5, country: '德国', high: 4, mid: 3, low: 1, micro: 0, daily: 0, ratio: '2.5%' },
    { id: 6, country: '日本', high: 3, mid: 2, low: 1, micro: 0, daily: 0, ratio: '2.0%' },
    { id: 7, country: '其他', high: 2, mid: 2, low: 1, micro: 0, daily: 0, ratio: '1.0%' },
  ],
}

const TABS = ['AI 风险报告', '企业风险排名', '企业风险动态', '其他统计'] as const

function Filter({ placeholder }: { placeholder: string }) {
  return (
    <select
      defaultValue=""
      style={{ padding: '7px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, color: '#64748B', minWidth: 120 }}
    >
      <option value="">{placeholder}</option>
      <option>请选择</option>
    </select>
  )
}

const riskColor: Record<string, string> = {
  high: '#DC2626', mid: '#F59E0B', low: '#10B981', micro: '#94A3B8',
}

export default function FkStats({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Stats>('fkStats.json', seed)
  const [tab, setTab] = useState<string>(TABS[0])
  const [range, setRange] = useState('最近7天')

  return (
    <EpPage
      title="统计看板"
      subtitle="风控中心风险数据可视化与统计"
      crumb="风控中心 / 统计看板"
      actions={<span style={{ fontSize: 13, color: '#64748B' }}>监控企业数：<b style={{ color: '#2563EB' }}>{data.monitorCount}家</b></span>}
    >
      {/* 筛选 + 操作 */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
        <Filter placeholder="风险类型" />
        <Filter placeholder="风险等级" />
        <Filter placeholder="负责人/部门" />
        <Filter placeholder="标签" />
        <Filter placeholder="解读角色" />
        <div style={{ flex: 1 }} />
        <EpBtn variant="default" size="sm">风险和推送设置</EpBtn>
        <EpBtn variant="primary" size="sm">添加监控</EpBtn>
        <EpBtn variant="default" size="sm">输入添加</EpBtn>
        <EpBtn variant="default" size="sm">Excel上传</EpBtn>
        <EpBtn variant="default" size="sm">从客户列表导入</EpBtn>
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

      {/* 时间范围切换（通用） */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' }}>
        <EpTag color="#2563EB" bg="#EFF6FF">推送时间</EpTag>
        <EpTag>发生时间</EpTag>
        {['最近7天', '今天', '昨天', '最近30天', '最近3个月'].map((r) => (
          <button
            key={r}
            onClick={() => setRange(r)}
            style={{
              padding: '5px 12px', borderRadius: 8, fontSize: 12, cursor: 'pointer',
              border: '1px solid ' + (range === r ? '#2563EB' : '#CBD5E1'),
              background: range === r ? '#EFF6FF' : '#fff', color: range === r ? '#2563EB' : '#475569',
            }}
          >
            {r}
          </button>
        ))}
      </div>

      {tab === 'AI 风险报告' && <AiReport data={data} />}
      {tab === '企业风险排名' && <RankTab data={data} />}
      {tab === '企业风险动态' && <DynamicTab data={data} />}
      {tab === '其他统计' && <OtherTab data={data} />}
    </EpPage>
  )
}

/* ---------------- AI 风险报告 ---------------- */
function AiReport({ data }: { data: Stats }) {
  const cols: Column[] = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'type', label: '报告类型', render: (r: Row) => <EpTag color="#7C3AED" bg="#F5F3FF">{String(r.type)}</EpTag> },
    { key: 'role', label: '解读角色', render: (r: Row) => <EpTag color="#0EA5E9" bg="#E0F2FE">{String(r.role)}</EpTag> },
    { key: 'title', label: '报告名称' },
    { key: 'genTime', label: '生成时间' },
    {
      key: 'op', label: '操作',
      render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('查看 AI 风险报告')}>查看</a>,
    },
  ]
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 14 }}>
        <EpStat label="累计报告数" value={data.aiReports.length} sub="日报 / 周报 / 月报 / 季报" accent="#2563EB" />
        <EpStat label="今日生成" value={1} sub="2026-08-17" accent="#7C3AED" />
        <EpStat label="解读角色" value={3} sub="通用 / 信贷风控 / 客户经理" />
        <EpStat label="监控企业" value={data.monitorCount} sub="覆盖全部监控主体" />
      </div>
      <EpCard title="报告生成趋势" desc="近 7 日 AI 报告与触发风险条目" actions={<Sam value="fkStats.json" />}>
        <LineChart labels={data.reportTrend.labels} series={data.reportTrend.series} height={240} />
      </EpCard>
      <div style={{ marginTop: 14 }}>
        <EpCard title="报告列表" desc="按生成时间倒序">
          <DataTable columns={cols} rows={data.aiReports as unknown as Row[]} exportable exportName="AI风险报告" empty="暂无数据" />
        </EpCard>
      </div>
    </>
  )
}

/* ---------------- 企业风险排名 ---------------- */
function RankTab({ data }: { data: Stats }) {
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
    <>
      <EpCard title="风险评分排名" desc="监控企业风险评分（满分 100）" actions={<Sam value="fkStats.json" />}>
        <BarChart
          labels={data.rank.map((r) => r.name.length > 6 ? r.name.slice(0, 6) + '…' : r.name)}
          series={[{ name: '风险评分', color: '#2563EB', data: data.rank.map((r) => r.score) }]}
          height={240}
        />
      </EpCard>
      <div style={{ marginTop: 14 }}>
        <EpCard title="企业风险排名" desc="序号 / 监控企业 / 风险评分 / 负责人·部门 / 标签 / 风险数量 / 高·中·低·轻微 / 日常资讯 / 操作">
          <DataTable columns={cols} rows={data.rank as unknown as Row[]} exportable exportName="企业风险排名" empty="暂无数据" />
        </EpCard>
      </div>
    </>
  )
}

/* ---------------- 企业风险动态 ---------------- */
function DynamicTab({ data }: { data: Stats }) {
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
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('查看企业风险动态')}>详情</a> },
  ]
  return (
    <EpCard title="企业风险动态" desc="实时监控风险变化（序号 / 监控企业 / 风险评分 / 负责人·部门 / 标签 / 风险数量 / 高·中·低·轻微 / 日常资讯 / 操作）" actions={<Sam value="fkStats.json" />}>
      <DataTable columns={cols} rows={data.dynamic as unknown as Row[]} exportable exportName="企业风险动态" empty="暂无数据" />
    </EpCard>
  )
}

/* ---------------- 其他统计 ---------------- */
function OtherTab({ data }: { data: Stats }) {
  const periodCols: Column[] = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'cycle', label: '周期' },
    { key: 'monitored', label: '监控主体数' },
    { key: 'riskSubjects', label: '发生风险主体数' },
    { key: 'total', label: '风险总数', render: (r: Row) => <b>{r.total}</b> },
    { key: 'high', label: '高风险数量', render: (r: Row) => <span style={{ color: riskColor.high }}>{r.high}</span> },
    { key: 'genTime', label: '生成时间' },
    { key: 'role', label: '角色', render: (r: Row) => <EpTag color="#0EA5E9" bg="#E0F2FE">{String(r.role)}</EpTag> },
    { key: 'op', label: '操作', render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('查看周期统计')}>查看</a> },
  ]
  const regionCols: Column[] = [
    { key: 'idx', label: '序号', render: (r: Row) => r.id },
    { key: 'country', label: '国家/地区' },
    { key: 'high', label: '高风险', render: (r: Row) => <span style={{ color: riskColor.high }}>{r.high}</span> },
    { key: 'mid', label: '中风险', render: (r: Row) => <span style={{ color: riskColor.mid }}>{r.mid}</span> },
    { key: 'low', label: '低风险', render: (r: Row) => <span style={{ color: riskColor.low }}>{r.low}</span> },
    { key: 'micro', label: '轻微风险', render: (r: Row) => <span style={{ color: riskColor.micro }}>{r.micro}</span> },
    { key: 'daily', label: '日常资讯', render: (r: Row) => r.daily },
    { key: 'ratio', label: '风险数量和占比', render: (r: Row) => <b>{r.ratio}</b> },
  ]
  return (
    <>
      <EpCard title="周期风险统计" desc="周期 / 监控主体数 / 发生风险主体数 / 风险总数 / 高风险数量 / 生成时间 / 角色 / 操作" actions={<Sam value="fkStats.json" />}>
        <DataTable columns={periodCols} rows={data.period as unknown as Row[]} exportable exportName="周期风险统计" empty="暂无数据" />
      </EpCard>
      <div style={{ marginTop: 14 }}>
        <EpCard title="周期风险趋势" desc="各周风险总数与高风险数量">
          <LineChart labels={data.periodTrend.labels} series={data.periodTrend.series} height={240} />
        </EpCard>
      </div>
      <div style={{ marginTop: 14 }}>
        <EpCard title="国家/地区风险分布" desc="序号 / 国家·地区 / 高·中·低·轻微 / 日常资讯 / 风险数量和占比">
          <DataTable columns={regionCols} rows={data.region as unknown as Row[]} exportable exportName="国家地区风险分布" empty="暂无数据" />
        </EpCard>
      </div>
    </>
  )
}
