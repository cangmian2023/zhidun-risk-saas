import { useNavigate } from 'react-router-dom'
import { useScore, updateScore, SCORE_PROD_LABEL, type ScoreProd } from './scoreData'
import { PageShell } from './PageShell'
import { Panel, Button, Badge } from '../components/ui'
import { Sam } from './SourceTag'

const MODEL_COLOR: Record<ScoreProd, string> = {
  zhicha: '#ef4444',
  zhixin: '#22c55e',
  zhirong: '#8b5cf6',
}

export default function ScoreModelManagePage() {
  const data = useScore()
  const nav = useNavigate()
  const prods: ScoreProd[] = ['zhicha', 'zhixin', 'zhirong']

  const toggleEnabled = (prod: ScoreProd) =>
    updateScore((d) => ({
      ...d,
      models: d.models.map((m) => (m.prod === prod ? { ...m, enabled: !m.enabled } : m)),
    }))

  return (
    <>
      <PageShell
        title="模型管理"
        subtitle="评分产品下所有模型列表，点击卡片进入模型详情（基本信息、算法编辑、版本管理）"
        crumb="评分产品 / 模型管理"
      />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {prods.map((p) => {
            const m = data.models.find((x) => x.prod === p)!
            return (
              <button
                key={p}
                onClick={() => nav('/console/sc/model-detail?prod=' + p)}
                className="group rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-card transition hover:border-brand-300 hover:shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: MODEL_COLOR[p] }} />
                    <span className="text-base font-semibold text-ink-900">{m.name}</span>
                  </div>
                  <Badge kind={m.enabled ? 'green' : 'gray'}>{m.enabled ? '已启用' : '已停用'}</Badge>
                </div>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-bold tabular-nums" style={{ color: MODEL_COLOR[p] }}>{m.score}</span>
                  <span className="mb-1 text-xs text-slate-400">当前得分 · {m.range[0]}–{m.range[1]}</span>
                </div>

                <div className="mt-3 space-y-1 text-sm text-slate-500">
                  <div className="flex justify-between"><span>算法类型</span><span className="text-slate-700">{m.algoType}</span></div>
                  <div className="flex justify-between"><span>版本</span><span className="text-slate-700">{m.version}</span></div>
                  <div className="flex justify-between"><span>更新时间</span><span className="text-slate-700">{m.updatedAt}</span></div>
                  <div className="flex justify-between"><span>因子数</span><span className="text-slate-700">{m.factors.length}</span></div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleEnabled(p)
                    }}
                  >
                    {m.enabled ? '停用' : '启用'}
                  </Button>
                  <span className="text-sm font-medium text-brand-600 group-hover:underline">进入详情 →</span>
                </div>
              </button>
            )
          })}
        </div>
        <Panel title="说明" actions={<Sam value="scoreData.json" />}>
          <p className="text-sm text-slate-500">
            评分产品包含三个模型：智察分（欺诈识别）、智信分（信用违约）、智融分（综合价值）。
            点击任一模型卡片进入详情页，可查看与编辑基本信息、以「可视化 / 代码」两种方式编辑算法、并管理该模型的版本。
          </p>
        </Panel>
      </div>
    </>
  )
}
