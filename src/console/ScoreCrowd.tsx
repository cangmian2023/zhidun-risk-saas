import { useState } from 'react'
import { useScore, updateScore, type CrowdGroup } from './scoreData'
import { useMidCustomers } from './midStore'
import { PageShell } from './PageShell'
import { Button, Badge, Modal } from '../components/ui'
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

  // 新增分组弹窗
  const [addOpen, setAddOpen] = useState(false)
  const [draft, setDraft] = useState<{ name: string; rule: string; riskLevel: string; count: string }>({
    name: '', rule: '', riskLevel: '低', count: '0',
  })

  const openAdd = () => {
    setDraft({ name: '', rule: '', riskLevel: '低', count: '0' })
    setAddOpen(true)
  }
  const confirmAdd = () => {
    const name = draft.name.trim()
    if (!name) return
    const g: CrowdGroup = {
      id: 'g-' + Date.now().toString(36),
      name,
      rule: draft.rule.trim() || '—',
      riskLevel: draft.riskLevel,
      count: Math.max(0, parseInt(draft.count || '0', 10) || 0),
    }
    updateScore((d) => ({ ...d, crowds: [...d.crowds, g] }))
    setAddOpen(false)
  }

  const removeGroup = (id: string) => {
    updateScore((d) => ({ ...d, crowds: d.crowds.filter((g) => g.id !== id) }))
  }

  const openDetail = (custId: string) => nav('/console/cr/mid-cust-score?cust=' + custId + '&prod=zhixin&back=' + encodeURIComponent('/console/sc/crowd-groups'))

  return (
    <>
      <PageShell title="客户分组" crumb="评分产品 / 客户洞察" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sam value="scoreData.json" />
            <p className="text-xs text-slate-400">点击任意分组卡片，进入该分组的客户列表（新页面）。</p>
          </div>
          <Button size="sm" variant="primary" onClick={openAdd}>＋ 新增分组</Button>
        </div>

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
                  <div className="flex items-center gap-2">
                    <Badge kind={riskKind(group.riskLevel)}>{group.riskLevel ?? '—'}</Badge>
                    <button
                      type="button"
                      title="删除该分组"
                      onClick={(e) => { e.stopPropagation(); removeGroup(group.id) }}
                      className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-400 transition hover:border-rose-300 hover:text-rose-600"
                    >
                      删除
                    </button>
                  </div>
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
                        key={c?.custId ?? ''}
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

        {/* 新增分组弹窗 */}
        <Modal open={addOpen} onClose={() => setAddOpen(false)} title="新增客户分组">
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs text-slate-500">分组名称 *</div>
              <input
                value={draft.name}
                onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                placeholder="如：高额度活跃客户"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-500">分组规则</div>
              <input
                value={draft.rule}
                onChange={(e) => setDraft((p) => ({ ...p, rule: e.target.value }))}
                placeholder="如：智融分≥680 且 近30天活跃≥15天"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-500">风险等级</div>
              <select
                value={draft.riskLevel}
                onChange={(e) => setDraft((p) => ({ ...p, riskLevel: e.target.value }))}
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
              >
                <option value="低">低</option>
                <option value="中">中</option>
                <option value="高">高</option>
              </select>
            </div>
            <div>
              <div className="mb-1 text-xs text-slate-500">成员数</div>
              <input
                value={draft.count}
                onChange={(e) => setDraft((p) => ({ ...p, count: e.target.value }))}
                placeholder="0"
                type="number"
                className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
              />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setAddOpen(false)}>取消</Button>
            <Button size="sm" variant="primary" onClick={confirmAdd} disabled={!draft.name.trim()}>确认新增</Button>
          </div>
        </Modal>
      </div>
    </>
  )
}
