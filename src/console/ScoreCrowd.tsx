import { useMemo, useState } from 'react'
import { useScore, updateScore, type CrowdGroup } from './scoreData'
import { useMidCustomers } from './midStore'
import { PageShell } from './PageShell'
import { Button, Badge } from '../components/ui'
import { Sam } from './SourceTag'
import { useNavigate } from 'react-router-dom'
import { CrowdDrawer } from './CrowdDrawer'
import { crowdMembers } from './crowdRule'

// 客户风险等级 → 徽标样式（客户主档为「高风险/中风险/低风险」）
function riskKindOf(level?: string): 'red' | 'amber' | 'green' {
  const l = (level ?? '').replace('风险', '')
  if (l === '高') return 'red'
  if (l === '中') return 'amber'
  return 'green'
}

const CARD_PREVIEW_N = 5 // 卡片上展示的命中客户条数

export default function ScoreCrowdPage() {
  const data = useScore()
  const customers = useMidCustomers()
  const nav = useNavigate()

  const crowds: CrowdGroup[] = data.crowds ?? []

  /* ---- 新增 / 编辑抽屉（3.3：弹窗改右侧抽屉；卡片与客户列表均入口） ---- */
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editing, setEditing] = useState<CrowdGroup | null>(null)

  const openNew = () => { setEditing(null); setDrawerOpen(true) }
  const openEdit = (g: CrowdGroup) => { setEditing(g); setDrawerOpen(true) }
  const closeDrawer = () => setDrawerOpen(false)

  const saveGroup = (g: CrowdGroup) => {
    updateScore((d) => ({
      ...d,
      crowds: d.crowds.some((x) => x.id === g.id) ? d.crowds.map((x) => (x.id === g.id ? g : x)) : [...d.crowds, g],
    }))
  }

  const removeGroup = (id: string) => {
    updateScore((d) => ({ ...d, crowds: d.crowds.filter((g) => g.id !== id) }))
  }

  const openDetail = (custId: string) => nav('/console/cr/mid-cust-score?cust=' + custId + '&prod=zhixin&back=' + encodeURIComponent('/console/sc/crowd-groups'))
  const openList = (g: CrowdGroup) => nav('/console/sc/customer-list?group=' + g.id)

  return (
    <>
      <PageShell title="客户分组" crumb="评分产品 / 客户洞察" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sam value="scoreData.json" />
            <p className="text-xs text-slate-400">按规则定义客群：成员数由规则实时计算，点击分组进入该分组的客户列表。</p>
          </div>
          <Button size="sm" variant="primary" onClick={openNew}>＋ 新增分组</Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {crowds.map((group) => {
            const list = useCrowdMembers(group, customers)
            const preview = list.slice(0, CARD_PREVIEW_N)
            return (
              <div
                key={group.id}
                className="flex flex-col rounded-2xl border border-slate-100 bg-white p-5 shadow-card transition hover:border-brand-400 hover:shadow-md"
              >
                {/* 头部：名称 + 操作（编辑 / 删除，悬停显示） */}
                <div className="flex items-center justify-between">
                  <span className="text-[15px] font-semibold text-ink-900">{group.name}</span>
                  <div className="flex items-center gap-2 opacity-0 transition group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => openEdit(group)}
                      className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-500 transition hover:border-brand-400 hover:text-brand-600"
                    >
                      编辑
                    </button>
                    <button
                      type="button"
                      title="删除该分组"
                      onClick={() => removeGroup(group.id)}
                      className="rounded-md border border-slate-200 px-2 py-0.5 text-xs text-slate-400 transition hover:border-rose-300 hover:text-rose-600"
                    >
                      删除
                    </button>
                  </div>
                </div>

                {/* 规则（可读文本） */}
                <div className="mt-2 min-h-[40px] text-sm leading-relaxed text-slate-500">{group.rule}</div>

                {/* 成员数（实时计算，不可编辑）+ 命中占比 */}
                <div className="mt-3 flex items-end gap-2">
                  <span className="text-[26px] font-bold leading-none text-ink-900 tabular-nums">{list.length.toLocaleString()}</span>
                  <span className="mb-0.5 text-xs text-slate-400">
                    成员 / {customers.length} 客户
                    <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">实时计算</span>
                  </span>
                </div>

                {/* 命中客户预览（点击进入得分详情） */}
                {preview.length > 0 ? (
                  <div className="mt-3 flex-1 space-y-1">
                    {preview.map((c) => (
                      <button
                        key={c?.custId ?? ''}
                        type="button"
                        onClick={() => openDetail(c?.custId ?? '')}
                        className="flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs text-slate-500 transition hover:bg-slate-50"
                      >
                        <span className="text-ink-900">{c?.custId ?? '—'}</span>
                        <span>{c?.name ?? '—'}</span>
                        <Badge kind={riskKindOf(c?.riskLevel)}>{(c?.riskLevel ?? '—').replace('风险', '')}</Badge>
                        <span className="ml-auto tabular-nums">智融 {c?.scores?.zhirong?.score ?? '—'}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 flex-1 rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-400">暂无成员</div>
                )}

                {/* 查看全部成员 */}
                <div className="mt-4 flex justify-end">
                  <Button variant="secondary" size="sm" onClick={() => openList(group)}>
                    查看全部成员（{list.length}） →
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 新增 / 编辑抽屉（共享组件，客户列表页同款入口） */}
      <CrowdDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        editing={editing}
        customers={customers}
        onSave={saveGroup}
      />
    </>
  )
}

/* 卡片内实时求值（规则变化时随 store 重算） */
function useCrowdMembers(group: CrowdGroup, customers: ReturnType<typeof useMidCustomers>) {
  return useMemo(
    () => crowdMembers({ conds: group.conds, logic: group.logic }, customers),
    [group.conds, group.logic, customers],
  )
}
