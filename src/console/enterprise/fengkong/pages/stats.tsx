// 风控中心 · 统计看板（fk-stats）· 1:1 复刻「统计看板」页面
// 数据：本地样例 fkStats.json（橘 Sam）
import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam, Cal, Cfg } from '../../epCommon'
import { LineChart, BarChart, DonutChart } from '../../../../components/charts'
import type { Row, Column } from '../../../../components/ui'
import { usePageNav } from '../../../pageNav'
import seedJson from '../../../fkStats.json'

type Stats = typeof seedJson

const TABS = [
  { key: 'report', label: '风险报告' },
  { key: 'rank', label: '企业风险排名' },
  { key: 'dynamic', label: '企业风险动态' },
  { key: 'other', label: '其他统计' },
] as const

// 风险等级配色（与风险预警一致，蓝/橙/红/青）
const LEVEL_COLOR: Record<string, string> = {
  高风险: '#B91C1C',
  中风险: '#C2410C',
  低风险: '#1D4ED8',
  轻微风险: '#0F766E',
}

// 修复 JSON 中 "render": "tag" 字符串 → 转成实际渲染函数（DataTable 要求 render 为函数）
const fixCols = (cols: any[]): Column[] => cols.map((c) => {
  if (c.render === 'tag') {
    return {
      ...c,
      render: (r: Row) => {
        const v = String(r[c.key] ?? '-')
        const color = LEVEL_COLOR[v] ?? '#475569'
        return <span style={{ padding: '2px 8px', borderRadius: 4, background: color + '18', color, fontSize: 12, fontWeight: 500 }}>{v}</span>
      },
    }
  }
  return c as Column
})

export default function FkStats({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkStats.json', seedJson)
  const [activeTab, setActiveTab] = useState<string>('report')
  const [drill, setDrill] = useState<null | { title: string; rows: Row[]; cols: Column[]; tag: string }>(null)
  const nav = useNavigate()
  const { goDetail } = usePageNav()
  const refs: Record<string, React.RefObject<HTMLDivElement>> = {
    report: useRef<HTMLDivElement>(null),
    rank: useRef<HTMLDivElement>(null),
    dynamic: useRef<HTMLDivElement>(null),
    other: useRef<HTMLDivElement>(null),
  }

  // 滚动到对应区块（tab 非切换，是锚点滚动）
  const scrollTo = (key: string) => {
    const el = refs[key]?.current
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // 滚动监听：高亮当前可见区块对应的 tab
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActiveTab(String((e.target as HTMLElement).dataset.tab))
        })
      },
      { rootMargin: '-120px 0px -55% 0px', threshold: 0 },
    )
    Object.values(refs).forEach((r) => r.current && obs.observe(r.current))
    return () => obs.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const openDrill = (item: {
    title: string
    drillRows?: Row[]
    drillCols?: Column[]
    drillTag?: string
  }) => {
    if (!item.drillRows || !item.drillCols) return
    setDrill({
      title: item.title,
      rows: item.drillRows as Row[],
      cols: item.drillCols as Column[],
      tag: item.drillTag || 'sam',
    })
  }

  return (
    <EpPage
      title="统计看板"
      desc="贷前风控 · 风险数据可视化看板"
      actions={<Sam value="fkStats.json" />}
    >
      {/* 吸顶 tab 工具条 + 筛选控件（筛选置于 tab 工具条下方） */}
      <div className="sticky top-[128px] z-30 -mx-6 -mt-[18px] mb-4 border-b border-slate-200 bg-white/95 px-6 pt-3 backdrop-blur">
        <div className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => scrollTo(t.key)}
              className="relative px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ color: activeTab === t.key ? '#0F172A' : '#64748B' }}
            >
              {t.label}
              {activeTab === t.key && (
                <span className="absolute left-3 right-3 -bottom-px h-0.5 rounded-full bg-[#2563EB]" />
              )}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3 px-0 py-3">
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            企业范围
            <select className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700">
              <option>50家</option>
              <option>100家</option>
              <option>全量</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            抵达时间
            <div className="flex items-center gap-1">
              <select className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700">
                <option>年</option><option>月</option><option>日</option>
              </select>
              <span className="text-slate-400">至</span>
              <select className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700">
                <option>年</option><option>月</option><option>日</option>
              </select>
            </div>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            风险等级
            <select className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700">
              <option>全部</option>
              <option>高风险</option>
              <option>中风险</option>
              <option>低风险</option>
              <option>轻微风险</option>
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            标签
            <select className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-700">
              <option>全部标签</option>
              <option>失信被执行人</option>
              <option>经营异常</option>
              <option>行政处罚</option>
              <option>股权冻结</option>
            </select>
          </label>
          <EpBtn variant="primary" size="sm" className="ml-auto" onClick={() => alert('已下载样例数据')}>
            下载数据
          </EpBtn>
        </div>
      </div>

      {/* 区块一：风险报告（报告列表表格） */}
      <div ref={refs.report} data-tab="report" className="scroll-mt-[112px]">
        <div className="mb-3 mt-5 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">风险报告</h2>
        </div>
        <EpCard>
          <DataTable
            rows={data.aiReport.list as Row[]}
            columns={fixCols(data.aiReport.cols)}
            pager
            defaultPageSize={5}
            actions={(r) => (
              <button
                type="button"
                className="text-[#2563EB] hover:underline"
                onClick={() => nav(`/console/ep/fk-risk-warning?kw=${encodeURIComponent(String(r.name))}`)}
              >
                查看
              </button>
            )}
          />
        </EpCard>
      </div>

      {/* 区块二：企业风险排名 */}
      <div ref={refs.rank} data-tab="rank" className="scroll-mt-[112px]">
        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">企业风险排名</h2>
        </div>
        <EpCard>
          <DataTable
            rows={data.rankRows as Row[]}
            columns={fixCols(data.rankCols)}
            pager
            defaultPageSize={8}
            actions={(r) => (
              <button
                type="button"
                className="text-[#2563EB] hover:underline"
                onClick={() => goDetail('/console/ep/fk-risk-warning?kw=' + encodeURIComponent(String(r.name)))}
              >
                详情
              </button>
            )}
          />
        </EpCard>
      </div>

      {/* 区块三：企业风险动态 */}
      <div ref={refs.dynamic} data-tab="dynamic" className="scroll-mt-[112px]">
        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">企业风险动态</h2>
        </div>

        {/* 风险类型分布（柱状图） */}
        <ChartCard title="风险类型分布" data={data.typeDist} onDrill={openDrill} />

        {/* 风险数量趋势（柱状图） */}
        <div className="mt-4">
          <ChartCard title="风险数量趋势" data={data.riskTrend} onDrill={openDrill} />
        </div>

        {/* 风险等级分布（环形图） */}
        <div className="mt-4">
          <EpCard>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">风险等级分布</h3>
              <Sam value="fkStats.json" />
            </div>
            <DonutChart
              data={data.chartGrid.find((c) => c.key === 'risk_level')!.donut.map((d) => ({ label: d.label, value: d.value, color: d.color }))}
              centerLabel="风险总量"
            />
            <div className="mt-3 flex flex-wrap gap-4">
              {data.chartGrid.find((c) => c.key === 'risk_level')!.donut.map((d) => (
                <span key={d.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.label}：{d.value}
                </span>
              ))}
            </div>
          </EpCard>
        </div>

        {/* 企业标签风险（柱状图） */}
        <div className="mt-4">
          <EpCard>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">企业标签风险</h3>
              <Sam value="fkStats.json" />
            </div>
            <BarChart
              labels={data.tagRisk.labels}
              series={[{ name: '触发企业数', color: '#B91C1C', data: data.tagRisk.values }]}
              unit=" 家"
            />
          </EpCard>
        </div>

        {/* 风险跟进分布（环形图） */}
        <div className="mt-4">
          <EpCard>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">风险跟进分布</h3>
              <Sam value="fkStats.json" />
            </div>
            <DonutChart
              data={data.followDist.map((d) => ({ label: d.label, value: d.value, color: d.color }))}
              centerLabel="跟进总量"
            />
            <div className="mt-3 flex flex-wrap gap-4">
              {data.followDist.map((d) => (
                <span key={d.label} className="flex items-center gap-1.5 text-xs text-slate-500">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.label}：{d.value}
                </span>
              ))}
            </div>
          </EpCard>
        </div>

        {/* 风险跟进趋势（折线图） */}
        <div className="mt-4">
          <EpCard>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">风险跟进趋势</h3>
              <Sam value="fkStats.json" />
            </div>
            <LineChart labels={data.followTrend.labels} series={data.followTrend.series} unit=" 条" />
          </EpCard>
        </div>
      </div>

      {/* 区块四：其他统计 */}
      <div ref={refs.other} data-tab="other" className="scroll-mt-[112px]">
        <div className="mb-3 mt-6 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-800">其他统计</h2>
        </div>

        {/* 港口 / 航线风险（表格） */}
        <EpCard>
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-700">港口 / 机场风险</h3>
            <Sam value="fkStats.json" />
          </div>
          <DataTable rows={data.portRisk.rows as Row[]} columns={fixCols(data.portRisk.cols)} pager defaultPageSize={6} />
        </EpCard>

        {/* 关键词分布（柱状图） */}
        <div className="mt-4">
          <ChartCard title="关键词分布" data={data.keywordDist} onDrill={openDrill} />
        </div>

        {/* 区域风险排名（表格） */}
        <div className="mt-4">
          <EpCard>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">区域风险排名</h3>
              <Sam value="fkStats.json" />
            </div>
            <DataTable rows={data.regionRank.rows as Row[]} columns={fixCols(data.regionRank.cols)} pager defaultPageSize={6} />
          </EpCard>
        </div>

        {/* 风险处理周期（柱状图） */}
        <div className="mt-4">
          <ChartCard title="风险处理周期" data={data.handleCycle} onDrill={openDrill} />
        </div>
      </div>

      <EpDrawer open={!!drill} onClose={() => setDrill(null)} title={drill?.title || '明细'}>
        {drill && (
          <>
            {drill.tag === 'sam' && <Sam value="fkStats.json" />}
            <div className="mt-2">
              <DataTable rows={drill.rows} columns={fixCols(drill.cols)} pager defaultPageSize={8} />
            </div>
          </>
        )}
      </EpDrawer>
    </EpPage>
  )
}

/* 图表卡片：标题 + 柱状图/折线图 + 明细下钻 */
function ChartCard({
  title,
  data,
  onDrill,
}: {
  title: string
  data: {
    title?: string
    labels: string[]
    series: { name: string; color: string; data: number[] }[]
    unit?: string
    drillRows?: Row[]
    drillCols?: Column[]
    drillTag?: string
  }
  onDrill: (item: { title: string; drillRows?: Row[]; drillCols?: Column[]; drillTag?: string }) => void
}) {
  return (
    <EpCard>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <div className="flex items-center gap-3">
          <Sam value="fkStats.json" />
          {data.drillRows && data.drillCols && (
            <button type="button" className="text-xs text-[#2563EB] hover:underline" onClick={() => onDrill({ title, drillRows: data.drillRows, drillCols: data.drillCols, drillTag: data.drillTag })}>
              明细
            </button>
          )}
        </div>
      </div>
      <BarChart labels={data.labels} series={data.series} unit={data.unit || ''} />
    </EpCard>
  )
}
