import { useScore, SCORE_PROD_LABEL, type ScoreProd } from './scoreData';
import { PageShell } from './PageShell';
import { Panel, Badge } from '../components/ui';
import { LineChart, BarChart, DonutChart } from '../components/charts';

const MODEL_COLOR: Record<ScoreProd, string> = {
  zhicha: '#ef4444',
  zhixin: '#22c55e',
  zhirong: '#8b5cf6',
}
const DONUT_PALETTE = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#3b82f6']

export default function ScoreDist() {
  const data = useScore()
  const prods: ScoreProd[] = ['zhicha', 'zhixin', 'zhirong']
  // 三个模型共用同一套分数段标签，取首个有数据的模型标签作为横轴
  const distLabels = (data.dist.find((x) => x.labels.length)?.labels ?? []) as string[]

  return (
    <>
      <PageShell
        title="评分分布"
        subtitle="三个评分产品的分数段分布、占比、客群对比与调用量趋势（全部铺开展示）"
        crumb="评分产品 / 评分分布"
      />
      <div className="space-y-4">
        {/* 分数段分布：一张图内按模型分色对比 */}
        <Panel title="分数段分布" desc="各评分产品分数段样本数（一张图内按模型分色对比，颜色见下方图例）" >
          <BarChart
            labels={distLabels}
            series={prods.map((p) => {
              const d = data.dist.find((x) => x.prod === p) ?? { prod: p, labels: [], data: [] as number[] }
              return { name: SCORE_PROD_LABEL[p], color: MODEL_COLOR[p], data: d.data }
            })}
            height={300}
          />
        </Panel>

        {/* 占比：一行三个甜甜圈 */}
        <Panel title="占比" desc="各评分产品分数段样本占比（一行铺开三个模型）" >
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {prods.map((p) => {
              const d = data.dist.find((x) => x.prod === p) ?? { prod: p, labels: [] as string[], data: [] as number[] }
              const total = d.data.reduce((a, b) => a + b, 0)
              return (
                <div key={p} className="rounded-xl border border-slate-100 p-3">
                  <div className="mb-1 text-center text-sm font-medium text-ink-900">{SCORE_PROD_LABEL[p]}</div>
                  <DonutChart
                    data={d.labels.map((label, i) => ({ label, value: d.data[i] ?? 0, color: DONUT_PALETTE[i % DONUT_PALETTE.length] }))}
                    centerLabel="样本总数"
                    centerValue={String(total)}
                  />
                </div>
              )
            })}
          </div>
        </Panel>

        {/* 客群对比：单图 */}
        <Panel title="按客群对比" desc="各客群样本数量对比" >
          <BarChart
            labels={data.crowds.map((c) => c.name)}
            series={[{ name: '客群样本数', color: '#3b82f6', data: data.crowds.map((c) => c.count) }]}
          />
        </Panel>

        {/* 调用量趋势：三模型同图 */}
        <Panel title="调用量趋势" desc="近 6 个月各产品调用量" >
          <LineChart
            labels={data.callTrend.map((c) => c.month)}
            series={[
              { name: SCORE_PROD_LABEL.zhicha, color: MODEL_COLOR.zhicha, data: data.callTrend.map((c) => c.zhicha) },
              { name: SCORE_PROD_LABEL.zhixin, color: MODEL_COLOR.zhixin, data: data.callTrend.map((c) => c.zhixin) },
              { name: SCORE_PROD_LABEL.zhirong, color: MODEL_COLOR.zhirong, data: data.callTrend.map((c) => c.zhirong) },
            ]}
          />
        </Panel>
      </div>
    </>
  )
}
