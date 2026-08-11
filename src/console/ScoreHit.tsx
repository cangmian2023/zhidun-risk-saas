import { useScore, SCORE_PROD_LABEL, type ScoreProd } from './scoreData'
import { PageShell } from './PageShell'
import { Panel, DataTable, type Column, type Row } from '../components/ui'
import { Sam } from './SourceTag'
import { BarChart } from '../components/charts'

const MODEL_COLOR: Record<ScoreProd, string> = {
  zhicha: '#ef4444',
  zhixin: '#22c55e',
  zhirong: '#8b5cf6',
}
const KIND_OF: Record<ScoreProd, string> = {
  zhicha: 'red',
  zhixin: 'green',
  zhirong: 'violet',
}
const FUNNEL_COLORS = ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e']

export default function ScoreHit() {
  const data = useScore()
  const prods: ScoreProd[] = ['zhicha', 'zhixin', 'zhirong']

  const byModel = (p: ScoreProd) =>
    data.hits.filter((h) => h.model === p).slice().sort((a, b) => b.hits - a.hits)

  // 全部规则按命中数排序，单图内按所属模型着色（三色对应三模型）
  const allHits = data.hits.slice().sort((a, b) => b.hits - a.hits)

  const hitColumns: Column[] = [
    { key: 'rule', label: '规则' },
    { key: 'hits', label: '命中数', align: 'right' },
    { key: 'rate', label: '命中率', align: 'right' },
  ]

  const maxFunnel = Math.max(...data.funnel.map((f) => f.value), 1)

  return (
    <>
      <PageShell
        title="命中分析"
        subtitle="三个评分产品的规则命中 Top 榜、命中率统计与预警转化漏斗（全部铺开展示）"
        crumb="评分产品 / 命中分析"
      />
      <div className="space-y-4">
        {/* 规则命中 Top 榜：一张图内按模型分色 */}
        <Panel title="规则命中 Top 榜" desc="所有评分产品的规则命中数（一张图内按所属模型分色，颜色见下方图例）" actions={<Sam value="scoreData.json" />}>
          <BarChart
            labels={allHits.map((h) => (h.rule.length > 6 ? `${h.rule.slice(0, 6)}…` : h.rule))}
            series={prods.map((p) => ({
              name: SCORE_PROD_LABEL[p],
              color: MODEL_COLOR[p],
              data: allHits.map((h) => (h.model === p ? h.hits : 0)),
            }))}
            height={320}
          />
        </Panel>

        {/* 命中率统计：一行三模型 */}
        <Panel title="命中率统计" desc="各模型规则命中数与命中率（一行铺开三个模型）" actions={<Sam value="scoreData.json" />}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {prods.map((p) => {
              const hits = byModel(p)
              const rows: Row[] = hits.map((h, i) => ({
                id: `${p}-${i}`,
                rule: h.rule,
                hits: h.hits,
                rate: { v: `${h.rate}%`, kind: KIND_OF[p] as 'red' | 'green' | 'violet' },
              }))
              return (
                <div key={p} className="rounded-xl border border-slate-100 p-3">
                  <div className="mb-2 text-sm font-semibold text-ink-900">{SCORE_PROD_LABEL[p]}</div>
                  <DataTable columns={hitColumns} rows={rows} empty="暂无命中规则" />
                </div>
              )
            })}
          </div>
        </Panel>

        {/* 预警转化漏斗（全局） */}
        <Panel title="预警转化漏斗" desc="从触发预警到处置闭环的转化情况（全局）" actions={<Sam value="scoreData.json" />}>
          <div className="space-y-2">
            {data.funnel.map((f, i) => {
              const pct = (f.value / maxFunnel) * 100
              const color = FUNNEL_COLORS[i % FUNNEL_COLORS.length]
              return (
                <div key={f.label} className="flex items-center gap-3">
                  <div className="w-32 shrink-0 text-sm text-slate-600">{f.label}</div>
                  <div className="flex-1">
                    <div
                      className="flex h-9 items-center rounded-lg px-3 text-sm font-medium text-white transition-all"
                      style={{
                        width: `${Math.max(pct, 6)}%`,
                        background: color,
                        opacity: Math.max(0.35, 1 - i * 0.16),
                      }}
                    >
                      {f.value.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm tabular-nums text-slate-500">
                    {f.value.toLocaleString()}
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>
      </div>
    </>
  )
}
