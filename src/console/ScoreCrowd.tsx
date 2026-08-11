import { useScore, type CrowdGroup } from './scoreData'
import { useMidCustomers } from './midStore'
import { PageShell } from './PageShell'
import { Button, Badge } from '../components/ui'
import { Sam } from './SourceTag'
import { useNavigate } from 'react-router-dom'

// 客户数据 riskLevel 为「高风险/中风险/低风险」，分组 riskLevel 为「高/中/低」，归一化后比对
function normRisk(level?: string): '高' | '中' | '低' {
  const l = (level ?? '').replace('风险', '')
  if (l === '高') return '高'
  if (l === '中') return '中'
  return '低'
}
function riskKind(level?: string): 'red' | 'amber' | 'green' {
  const n = normRisk(level)
  if (n === '高') return 'red'
  if (n === '中') return 'amber'
  return 'green'
}

const cardCls =
  'rounded-2xl border border-slate-100 bg-white p-5 shadow-card cursor-pointer transition hover:border-brand-400'

export default function ScoreCrowdPage() {
  const data = useScore()
  const customers = useMidCustomers()
  const nav = useNavigate()

  const crowds: CrowdGroup[] = data.crowds ?? []
  const openDetail = (custId: string) => nav('/console/cr/mid-cust-score?cust=' + custId + '&prod=zhixin')

  return (
    <>
      <PageShell title="客户分组" crumb="评分产品 / 客户洞察" />
      <div className="space-y-4">
        <Sam value="scoreData.json" />
        <p className="text-xs text-slate-400">点击任意分组卡片，进入该分组的客户列表（新页面）。</p>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {crowds.map((group) => {
            const preview = (customers ?? [])
              .filter((c) => normRisk(c?.riskLevel) === group.riskLevel)
              .slice(0, 6)

            return (
              <div
                key={group.id}
                className={cardCls}
                onClick={() => nav('/console/sc/customer-list?group=' + group.id)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-ink-900">{group.name}</span>
                  <Badge kind={riskKind(group.riskLevel)}>{group.riskLevel ?? '—'}</Badge>
                </div>

                <p className="mt-2 text-sm text-slate-500">{group.rule}</p>

                <p className="mt-3 text-sm text-slate-500">
                  成员数{' '}
                  <span className="font-medium text-ink-900">
                    {(group.count ?? 0).toLocaleString()}
                  </span>
                </p>

                {preview.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {preview.map((c) => (
                      <div
                        key={c?.custId ?? Math.random()}
                        className="flex items-center justify-between rounded-md px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                        onClick={(e) => {
                          e.stopPropagation()
                          openDetail(c?.custId ?? '')
                        }}
                      >
                        <span className="text-ink-900">{c?.custId ?? '—'}</span>
                        <span>{c?.name ?? '—'}</span>
                        <span>{c?.product ?? '—'}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" size="sm" onClick={() => nav('/console/sc/score-records')}>
                    评分记录
                  </Button>
                  <Button variant="secondary" size="sm" onClick={() => nav('/console/sc/alert-workbench')}>
                    预警处置
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
