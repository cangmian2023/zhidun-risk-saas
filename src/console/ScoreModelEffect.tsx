import { useScore, SCORE_PROD_LABEL, type ScoreProd } from './scoreData';
import { PageShell } from './PageShell';
import { Panel, Badge } from '../components/ui';
import { LineChart } from '../components/charts';

const MODEL_COLOR: Record<ScoreProd, string> = {
  zhicha: '#ef4444',
  zhixin: '#22c55e',
  zhirong: '#8b5cf6',
}
const PSI_KIND: Record<string, 'green' | 'amber' | 'red'> = { 稳定: 'green', 临界: 'amber', 偏移: 'red' }

export default function ScoreModelEffectPage() {
  const data = useScore()
  const prods: ScoreProd[] = ['zhicha', 'zhixin', 'zhirong']
  const ops = prods.map((p) => data.ops.find((x) => x.prod === p)!)
  const labels = ops[0].trend.map((t) => t.month)

  const series = (sel: (t: (typeof ops)[number]['trend'][number]) => number) =>
    prods.map((p) => {
      const o = data.ops.find((x) => x.prod === p)!
      return { name: SCORE_PROD_LABEL[p], color: MODEL_COLOR[p], data: o.trend.map(sel) }
    })

  return (
    <>
      <PageShell
        title="模型效果"
        subtitle="三个评分产品的运营效果指标与趋势（全部铺开展示）"
        crumb="评分产品 / 模型管理"
      />
      <div className="space-y-4">
        {/* 三模型概览卡片 */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {ops.map((o) => {
            const p = o.prod
            const color = MODEL_COLOR[p]
            const stats: { label: string; value: string }[] = [
              { label: '评分覆盖率', value: `${o.coverage}%` },
              { label: '预警准确率', value: `${o.accuracy}%` },
              { label: '处置及时率', value: `${o.timely}%` },
              { label: '本月调用', value: o.calls.toLocaleString() },
            ]
            return (
              <div key={p} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: color }} />
                    <span className="text-base font-semibold text-ink-900">{SCORE_PROD_LABEL[p]}</span>
                  </div>
                  <Badge kind={PSI_KIND[o.psiStatus]}>PSI {o.psi}</Badge>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  {stats.map((s) => (
                    <div key={s.label}>
                      <div className="text-xs text-slate-400">{s.label}</div>
                      <div className="text-xl font-bold tabular-nums" style={{ color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* 趋势对比：四个面板，每面板三模型 */}
        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="评分覆盖率趋势" >
            <LineChart labels={labels} series={series((t) => t.coverage)} unit="%" height={220} />
          </Panel>
          <Panel title="预警准确率趋势" >
            <LineChart labels={labels} series={series((t) => t.accuracy)} unit="%" height={220} />
          </Panel>
          <Panel title="处置及时率趋势" >
            <LineChart labels={labels} series={series((t) => t.timely)} unit="%" height={220} />
          </Panel>
          <Panel title="本月调用趋势" >
            <LineChart labels={labels} series={series((t) => t.calls)} height={220} />
          </Panel>
        </div>
      </div>
    </>
  )
}
