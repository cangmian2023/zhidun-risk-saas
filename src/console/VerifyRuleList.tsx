// 信息核验 — 规则配置 · 卡片网格列表页
// 点击卡片跳转详情页（VerifyRuleConfig），不走抽屉。
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel, StatCard, SingleSelect, Button } from '../components/ui'

/* ───────────────────────── 类型 ───────────────────────── */
export interface VerifyRuleSet {
  id: string
  name: string
  version: string
  status: '草稿' | '已生效' | '已下线'
  scope: '全产品' | string[]
  ruleCount: number
  lastEditor: string
  lastEditTime: string
  desc?: string
}

/* ───────────────────────── 筛选常量 ───────────────────────── */
const STATUS_OPTIONS = ['草稿', '已生效', '已下线']
const SCOPE_OPTIONS = ['全产品', '信用贷', '抵押贷', '经营贷']

/* ───────────────────────── 样例数据 ───────────────────────── */
export const seedRows: VerifyRuleSet[] = [
  { id: 'RS-20260701-001', name: '信用贷-信息核验规则配置', version: 'V2.6', status: '已生效', scope: ['信用贷'], ruleCount: 23, lastEditor: '风控主管-王芳', lastEditTime: '2026-07-21 14:30', desc: '' },
]


/* ───────────────────────── 主组件 ───────────────────────── */
export default function VerifyRuleList() {
  const nav = useNavigate()
  const [rows] = useState<VerifyRuleSet[]>(seedRows)
  const [kw, setKw] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [scopeFilter, setScopeFilter] = useState('')

  const stats = useMemo(() => {
    const active = rows.filter((r) => r.status === '已生效').length
    const draft = rows.filter((r) => r.status === '草稿').length
    const offline = rows.filter((r) => r.status === '已下线').length
    const today = '2026-07-23'
    const todayEdit = rows.filter((r) => r.lastEditTime.startsWith(today)).length
    return [
      { label: '已生效规则集', value: String(active), hint: '当前生效中的核验规则集', accent: 'emerald' as const },
      { label: '草稿规则集', value: String(draft), hint: '待启用/审批中的规则集', accent: 'cyan' as const },
      { label: '已下线规则集', value: String(offline), hint: '已归档的历史版本', accent: 'brand' as const },
      { label: '今日编辑', value: String(todayEdit), hint: '今日有修改记录的规则集', accent: 'amber' as const },
    ]
  }, [rows])

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (kw && !`${r.id} ${r.name}`.toLowerCase().includes(kw.toLowerCase())) return false
      if (statusFilter && r.status !== statusFilter) return false
      if (scopeFilter) {
        const scopeText = Array.isArray(r.scope) ? r.scope.join('、') : r.scope
        if (!scopeText.includes(scopeFilter)) return false
      }
      return true
    })
  }, [rows, kw, statusFilter, scopeFilter])

  const resetFilters = () => { setKw(''); setStatusFilter(''); setScopeFilter('') }

  const goConfig = (id: string) => {
    nav(`/console/cr/pre-verify-config-detail?id=${encodeURIComponent(id)}`)
  }

  const goNew = () => {
    nav('/console/cr/pre-verify-config-detail?id=new')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PageHeader
        crumb="零售信贷风控 / 贷前审核"
        title="规则配置"
        subtitle="配置信息核验、欺诈识别、信用风控等模块的核验规则、阈值与判定条件"
      />

      <div className="mx-auto max-w-[1500px] space-y-5 px-4 pb-10">
        {/* 统计卡 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} hint={s.hint} accent={s.accent} />
          ))}
        </div>

        {/* 筛选栏 */}
        <Panel>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <input
                value={kw}
                onChange={(e) => setKw(e.target.value)}
                placeholder="搜索规则集名称 / ID"
                className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
              <SingleSelect label="生效状态" options={STATUS_OPTIONS.map((a) => ({ value: a, label: a }))} value={statusFilter} onChange={setStatusFilter} clearable />
              <SingleSelect label="适用范围" options={SCOPE_OPTIONS.map((a) => ({ value: a, label: a }))} value={scopeFilter} onChange={setScopeFilter} clearable />
            </div>
            <div className="hidden min-w-[1rem] flex-1 xl:block" />
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" onClick={goNew}>新建规则集</Button>
              <Button variant="ghost" onClick={resetFilters}>重置</Button>
            </div>
          </div>
        </Panel>

        {/* 卡片网格 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-brand-200 hover:shadow-md"
            >
              {/* 名称 */}
              <h3 className="text-base font-semibold text-ink-900 line-clamp-2">{r.name}</h3>

              {/* 描述 */}
              {r.desc && <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{r.desc}</p>}

              {/* 信息行 */}
              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">适用范围</span>
                  <span className="font-medium text-slate-700">
                    {Array.isArray(r.scope) ? r.scope.join('、') : r.scope}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">规则数</span>
                  <span className="font-semibold text-ink-900">{r.ruleCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">版本</span>
                  <span className="font-mono text-xs text-slate-600">{r.version}</span>
                </div>
              </div>

              {/* 分隔线 */}
              <div className="my-3 border-t border-slate-100" />

              {/* 修改信息 */}
              <div className="mb-2 text-xs text-slate-400">
                <span>{r.lastEditor}</span>
                <span className="mx-1">·</span>
                <span>{r.lastEditTime}</span>
              </div>

              {/* 底部操作 */}
              <div className="mt-auto flex items-center gap-2">
                <Button variant="primary" size="sm" className="flex-1" onClick={() => goConfig(r.id)}>
                  配置
                </Button>
                {r.status === '草稿' && (
                  <Button variant="secondary" size="sm" className="flex-1">
                    生效
                  </Button>
                )}
                <button
                  onClick={() => {
                    if (confirm(`确定删除规则集「${r.name}」？`)) {
                      /* 调用删除 API */
                    }
                  }}
                  className="rounded-lg px-3 py-1.5 text-xs text-rose-500 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  删除
                </button>
              </div>
            </div>
          ))}

          {/* 新增规则集卡片 */}
          <button
            onClick={goNew}
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-5 text-slate-400 transition hover:border-brand-300 hover:text-brand-600 hover:shadow-sm"
          >
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span className="text-sm font-medium">新建规则集</span>
          </button>
        </div>

        {/* 无数据 */}
        {filtered.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white py-16 text-center text-sm text-slate-400">
            暂无符合条件的规则集
          </div>
        )}
      </div>
    </div>
  )
}
