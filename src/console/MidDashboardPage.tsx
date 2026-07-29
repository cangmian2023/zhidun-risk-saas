/* ============================================================
 * 数据看板渲染页（贷中监控）
 * 根据「管理中心-公共配置-数据看板配置」的页面配置渲染：
 * 指标卡组 / 折线图 / 柱状图 / 环形图 / 数据表
 * ========================================================== */
import { useMemo } from 'react'
import { PageHeader, StatCard, Panel, DataTable } from '../components/ui'
import { LineChart, BarChart, DonutChart } from '../components/charts'
import { getDashboardByKey, datasetById, type DashWidget } from './dashboardData'

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

  return (
    <div className="space-y-6">
      <PageHeader title={page.name} crumb={`零售信贷风控 / ${page.section}`} subtitle={page.desc} />

      <div className="grid gap-6 lg:grid-cols-2">
        {page.widgets.map((w) => (
          <WidgetBlock key={w.id} widget={w} />
        ))}
      </div>

      <p className="text-xs text-slate-400">
        本页为数据看板，展示内容由「管理中心 → 公共配置 → 数据看板配置」统一管理。数据每日 T+1 更新，实时指标延迟约 5 分钟。
      </p>
    </div>
  )
}

function WidgetBlock({ widget }: { widget: DashWidget }) {
  const ds = datasetById(widget.datasetId)
  const fullWidth = widget.type === 'stat' || widget.type === 'table' || widget.span === 2
  const spanCls = fullWidth ? 'lg:col-span-2' : ''

  if (!ds) {
    return (
      <Panel title={widget.title} className={spanCls}>
        <div className="px-4 py-8 text-center text-sm text-slate-400">数据集不存在（{widget.datasetId}），请检查看板配置。</div>
      </Panel>
    )
  }

  if (widget.type === 'stat') {
    return (
      <div className={`grid gap-4 sm:grid-cols-2 lg:grid-cols-4 ${spanCls}`}>
        {(ds.metrics ?? []).map((m) => (
          <StatCard key={m.label} label={m.label} value={m.value} delta={m.delta} deltaType={m.deltaType} accent="brand" />
        ))}
      </div>
    )
  }

  if (widget.type === 'line' || widget.type === 'bar') {
    const Chart = widget.type === 'line' ? LineChart : BarChart
    return (
      <Panel title={widget.title} className={spanCls}>
        <Chart labels={ds.labels ?? []} series={ds.series ?? []} unit={ds.unit} />
      </Panel>
    )
  }

  if (widget.type === 'donut') {
    return (
      <Panel title={widget.title} className={spanCls}>
        <DonutChart data={ds.donut ?? []} centerLabel={ds.donutCenterLabel} centerValue={ds.donutCenterValue} />
      </Panel>
    )
  }

  // table
  return (
    <Panel title={widget.title} className={spanCls}>
      <DataTable columns={ds.columns ?? []} rows={ds.rows ?? []} />
    </Panel>
  )
}
