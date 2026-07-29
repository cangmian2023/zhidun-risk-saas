/* ============================================================
 * 数据看板渲染页（贷中监控）
 * 根据「管理中心-公共配置-数据看板配置」的页面配置，从数据集实时计算并渲染：
 * 指标卡 / 折线图 / 柱状图 / 环形图 / 数据表
 * 每个组件 = 选数据集 → 选字段/计算 → 加筛选 → 选图表（神策式）
 * ========================================================== */
import { useMemo } from 'react'
import { PageHeader, StatCard, Panel, DataTable } from '../components/ui'
import { LineChart, BarChart, DonutChart } from '../components/charts'
import { getDashboardByKey, loadDatasets, buildComputed, type DashWidget } from './dashboardData'

export default function MidDashboardPage({ pageKey }: { pageKey: string }) {
  const page = useMemo(() => getDashboardByKey(pageKey), [pageKey])

  if (!page) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
        <h2 className="text-lg font-semibold text-ink-900">看板未配置或已停用</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
          请前往「管理中心 → 公共配置 → 数据看板配置」启用或创建该页面的看板配置。
        </p>
      </div>
    )
  }

  const datasets = useMemo(() => loadDatasets(), [])

  return (
    <div className="space-y-6">
      <PageHeader title={page.name} crumb={`零售信贷风控 / ${page.section}`} subtitle={page.desc} />

      <div className="grid gap-6 lg:grid-cols-2">
        {page.widgets.map((w) => (
          <WidgetBlock key={w.id} widget={w} datasets={datasets} />
        ))}
      </div>

      <p className="text-xs text-slate-400">
        本页为数据看板，内容由「管理中心 → 公共配置 → 数据看板配置」统一管理。组件从数据集实时计算（维度分组 + 度量聚合 + 筛选），
        数据每日 T+1 更新。
      </p>
    </div>
  )
}

function WidgetBlock({ widget, datasets }: { widget: DashWidget; datasets: ReturnType<typeof loadDatasets> }) {
  const ds = datasets.find((d) => d.id === widget.datasetId)
  const fullWidth = widget.type === 'metric' || widget.type === 'table' || widget.span === 2
  const spanCls = fullWidth ? 'lg:col-span-2' : ''

  if (!ds) {
    return (
      <Panel title={widget.title} className={spanCls}>
        <div className="px-4 py-8 text-center text-sm text-slate-400">数据集不存在（{widget.datasetId}），请检查看板配置。</div>
      </Panel>
    )
  }

  const c = buildComputed(ds, widget)

  if (!c.hasData) {
    return (
      <Panel title={widget.title} className={spanCls}>
        <div className="px-4 py-8 text-center text-sm text-slate-400">当前筛选条件下无数据。</div>
      </Panel>
    )
  }

  if (widget.type === 'metric') {
    return (
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${spanCls}`}>
        {c.metric.map((mt) => (
          <StatCard key={mt.label} label={mt.label} value={mt.value} hint={mt.hint} accent="brand" />
        ))}
      </div>
    )
  }

  if (widget.type === 'line' || widget.type === 'bar') {
    const Chart = widget.type === 'line' ? LineChart : BarChart
    return (
      <Panel title={widget.title} className={spanCls}>
        <Chart labels={c.categories} series={c.series} />
      </Panel>
    )
  }

  if (widget.type === 'donut') {
    const center = c.donut.length
      ? { label: '合计', value: c.donut.reduce((a, b) => a + b.value, 0).toLocaleString('en-US') }
      : undefined
    return (
      <Panel title={widget.title} className={spanCls}>
        <DonutChart data={c.donut} centerLabel={center?.label} centerValue={center?.value} />
      </Panel>
    )
  }

  // table
  return (
    <Panel title={widget.title} className={spanCls}>
      <DataTable columns={c.tableColumns} rows={c.tableRows} />
    </Panel>
  )
}
