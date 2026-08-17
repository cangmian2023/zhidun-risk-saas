import { useNavigate } from 'react-router-dom'
import { useScore, updateScore } from './scoreData'
import { useEnterpriseData, updateEnterpriseData } from './enterpriseData'
import { PageShell } from './PageShell'
import { Panel, Button, Badge } from '../components/ui'
import { Sam } from './SourceTag'

type Domain = 'sc' | 'ep'

// 评分产品 / 企业风控 共用同一「模型管理」页面：仅加载数据不同（domain 切换）
export default function ScoreModelManagePage({ domain = 'sc' }: { domain?: Domain }) {
  const score = useScore()
  const ent = useEnterpriseData()
  const nav = useNavigate()
  const models = (domain === 'ep' ? ent.models : score.models) as any[]
  const title = '模型管理'
  const crumb = domain === 'ep' ? '企业风控 / 模型管理中心' : '评分产品 / 模型管理'
  const detailBase = domain === 'ep' ? '/console/ep/model-list?model=' : '/console/sc/model-detail?prod='

  const toggle = (id: string) =>
    domain === 'ep'
      ? updateEnterpriseData((d) => ({ ...d, models: d.models.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m)) }))
      : updateScore((d) => ({ ...d, models: d.models.map((m) => ((m as any).prod === id ? { ...m, enabled: !m.enabled } : m)) }))

  return (
    <>
      <PageShell
        title={title}
        subtitle={domain === 'ep' ? '企业风控模型：企业违约分 / 欺诈分 / 关联风险分，点击卡片进入模型详情' : '评分产品下所有模型列表，点击卡片进入模型详情（基本信息、算法编辑、版本管理）'}
        crumb={crumb}
        actions={<Sam value={domain === 'ep' ? 'enterpriseData.json.models' : 'scoreData.json'} />}
      />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {models.map((m: any) => {
            const id: string = m.prod ?? m.id
            return (
              <button key={id} onClick={() => nav(detailBase + id)}
                className="group rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-card transition hover:border-brand-300 hover:shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ background: m.color }} />
                    <span className="text-base font-semibold text-ink-900">{m.name}</span>
                  </div>
                  <Badge kind={m.enabled ? 'green' : 'gray'}>{m.enabled ? '已启用' : '已停用'}</Badge>
                </div>

                <div className="mt-3 flex items-end gap-2">
                  <span className="text-3xl font-bold tabular-nums" style={{ color: m.color }}>{m.score}</span>
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
                      toggle(id)
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
        <Panel title="说明" actions={<Sam value={domain === 'ep' ? 'enterpriseData.json.models' : 'scoreData.json'} />}>
          <p className="text-sm text-slate-500">
            {domain === 'ep'
              ? '企业风控模型复用评分产品「模型管理」页面（同一组件，仅加载企业风控数据）：企业违约分 / 企业欺诈分 / 关联风险分。点击卡片进入详情，查看因子权重、评分阈值与运营效果。'
              : '评分产品包含三个模型：智察分（欺诈识别）、智信分（信用违约）、智融分（综合价值）。点击任一模型卡片进入详情页，可查看与编辑基本信息、以「可视化 / 代码」两种方式编辑算法、并管理该模型的版本。'}
          </p>
        </Panel>
      </div>
    </>
  )
}
