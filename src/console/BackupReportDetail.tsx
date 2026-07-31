/* ============================================================================
 * 备用信息核验报告（模板驱动演示）
 *
 * 完全由「报告模板 · 权威信息核验报告模板（备用）」(tpl-info-authority) 驱动：
 *   - 申请人信息 / 各集合卡片 / 评分维度分布 均读取模板（含 demoApplicant / demoScore / demoValues）
 *   - 通过 templateStore 的 useTemplate 订阅，配置页编辑模板后本页实时刷新
 *   - 当前为备用方案，不替换任何现有报告功能
 * ========================================================================== */
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { DetailHeader, Panel, Badge } from '../components/ui'
import { matchDimBand, DEFAULT_DIM_BANDS } from './reportTemplateData'
import { useTemplate } from './templateStore'

type DemoStatus = 'pass' | 'warn' | 'reject'
const STATUS_CLS: Record<DemoStatus, string> = {
  pass: 'bg-emerald-100 text-emerald-700',
  warn: 'bg-amber-100 text-amber-700',
  reject: 'bg-rose-100 text-rose-700',
}
const STATUS_LABEL: Record<DemoStatus, string> = { pass: '通过', warn: '关注', reject: '拒绝' }

/* 异常值配色：越高风险越高（与信息核验「异常值越高风险越高」口径一致） */
function anomalyColor(v: number): string {
  const a = Math.abs(v)
  if (a >= 51) return 'text-rose-600'
  if (a >= 21) return 'text-amber-600'
  return 'text-emerald-600'
}
const anomalySign = (v: number) => (v < 0 ? '−' : '+')

export default function BackupReportDetail() {
  const nav = useNavigate()
  const tpl = useTemplate('tpl-info-authority')

  if (!tpl) {
    return (
      <div className="p-10 text-center text-slate-400">
        未找到备用信息核验模板（tpl-info-authority）。
      </div>
    )
  }

  const sections = tpl.sections.filter((s) => (s.homeTab ?? 'content') === 'content' && s.visible)
  const sumW = sections.reduce((a, s) => a + (s.weight ?? 1), 0) || 1
  const overall = Math.round(sections.reduce((a, s) => a + (s.demoScore ?? 0) * (s.weight ?? 1), 0) / sumW)
  const grade = overall >= 50 ? '警示' : overall >= 20 ? '关注' : '通过'
  const gradeCls = overall >= 50 ? 'text-rose-600' : overall >= 20 ? 'text-amber-600' : 'text-emerald-600'
  const bands = tpl.dimBands ?? DEFAULT_DIM_BANDS
  const applicant = tpl.demoApplicant ?? {}

  return (
    <div className="min-h-screen bg-slate-50">
      <DetailHeader
        title="信息核验报告（备用演示）"
        crumb="报告中心 / 信息核验 / 备用方案"
        subtitle={`${tpl.name} · ${tpl.version}`}
        backLabel="返回模板详情"
        onBack={() => nav(`/console/cm/report-template?id=${tpl.id}`)}
        actions={<Badge kind="amber">备用方案 · 不替换现有功能</Badge>}
      />

      <div className="mx-auto max-w-5xl space-y-4 p-5">
        {/* 申请人 + 综合结论 */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="text-xs text-slate-400">报告结论</div>
              <div className={`text-3xl font-bold ${gradeCls}`}>{grade}</div>
              <div className="mt-1 text-xs text-slate-500">
                综合异常值 {anomalySign(overall)}
                {Math.abs(overall)}（越高风险越高）
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
              {Object.entries(applicant).map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span className="text-slate-400">{k}</span>
                  <span className="font-medium text-ink-900">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 各集合卡片（模板驱动；从第三个卡片起可配置显示方式：列表 / 2排卡片 / 3排卡片） */}
        {sections.map((s) => {
          const score = s.demoScore ?? 0
          const mode = s.displayMode ?? 'list'
          const items = Object.entries(s.demoValues ?? {}) as [string, { name?: string; value: string; status: DemoStatus }][]
          const wrapCls =
            mode === 'grid2' ? 'grid grid-cols-2 gap-2'
            : mode === 'grid3' ? 'grid grid-cols-3 gap-2'
            : 'space-y-1.5'
          /* 内部分组（数据源/接口合集可拆成命名子组）：分组标题 + 组内项，列表模式用整行小标题，网格模式用跨列标题 */
          const groups = s.fieldGroups ?? []
          const renderItem = ([fid, fv]: [string, { name?: string; value: string; status: DemoStatus }]) => {
            const label = s.fields.find((f) => f.id === fid)?.displayLabel ?? (fv.name ?? fid)
            const badge = <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${STATUS_CLS[fv.status]}`}>{STATUS_LABEL[fv.status]}</span>
            if (mode === 'list') {
              return (
                <div key={fid} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm">
                  <span className="text-slate-600">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-ink-900">{fv.value}</span>
                    {badge}
                  </div>
                </div>
              )
            }
            return (
              <div key={fid} className="flex flex-col gap-1 rounded-lg border border-slate-100 px-3 py-2 text-sm">
                <span className="truncate text-xs text-slate-500" title={label}>{label}</span>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-ink-900">{fv.value}</span>
                  {badge}
                </div>
              </div>
            )
          }
          const bodyNodes: ReactNode[] = []
          if (groups.length === 0) {
            if (items.length === 0) bodyNodes.push(<div key="empty" className="text-xs text-slate-400">暂无展示项</div>)
            else items.forEach((e) => bodyNodes.push(renderItem(e)))
          } else {
            groups.forEach((g) => {
              const gItems = items.filter(([fid]) => (s.fields.find((f) => f.id === fid)?.group ?? groups[0]?.id) === g.id)
              if (gItems.length === 0) return
              bodyNodes.push(
                <div key={`gh-${g.id}`} className={mode === 'list' ? 'mt-1 text-[11px] font-semibold text-slate-500' : 'col-span-full mt-1 text-[11px] font-semibold text-slate-500'}>
                  {g.name}
                </div>,
              )
              gItems.forEach((e) => bodyNodes.push(renderItem(e)))
            })
          }
          return (
            <Panel
              key={s.id}
              title={s.name}
              actions={<span className={`text-sm font-semibold ${anomalyColor(score)}`}>{anomalySign(score)}{Math.abs(score)}</span>}
            >
              <p className="mb-3 text-xs text-slate-500">{s.desc}</p>
              <div className={wrapCls}>
                {bodyNodes}
              </div>
              <div className="mt-2 text-right text-[11px] text-slate-400">
                显示方式 {mode === 'grid2' ? '2排卡片' : mode === 'grid3' ? '3排卡片' : '列表'} · 本卡权重 {s.weight ?? 1}% · 本卡异常值 {anomalySign(score)}
                {Math.abs(score)}
              </div>
            </Panel>
          )
        })}

        {/* 评分维度分布（模板驱动） */}
        <Panel title="评分维度分布（各集合加权）">
          <div className="overflow-hidden rounded-xl border border-slate-100">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400">
                  <th className="px-3 py-2 font-medium">维度</th>
                  <th className="px-3 py-2 text-right font-medium">异常值</th>
                  <th className="px-3 py-2 text-right font-medium">权重</th>
                  <th className="px-3 py-2 text-center font-medium">等级</th>
                  <th className="px-3 py-2 font-medium">说明</th>
                </tr>
              </thead>
              <tbody>
                {sections.map((s) => {
                  const sc = s.demoScore ?? 0
                  const w = s.weight ?? 1
                  const band = matchDimBand(sc, bands)
                  const lvl = band?.level
                  const lvlCls =
                    lvl === '高'
                      ? 'bg-orange-100 text-orange-700'
                      : lvl === '中'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                  return (
                    <tr key={s.id} className="border-t border-slate-100">
                      <td className="px-3 py-2.5 font-medium text-ink-900">{s.name}</td>
                      <td className={`px-3 py-2.5 text-right font-semibold ${anomalyColor(sc)}`}>{anomalySign(sc)}{Math.abs(sc)}</td>
                      <td className="px-3 py-2.5 text-right text-slate-400">{w}%</td>
                      <td className="px-3 py-2.5 text-center">
                        {lvl ? <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${lvlCls}`}>{lvl}</span> : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">{s.dimNote?.trim() || band?.note || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <p className="rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-700">
          备用方案演示：本页内容完全由「报告模板 · {tpl.name}」驱动。在报告模板页编辑该模板（集合名称、权重、显隐、示例分值/字段）后，返回本页即可看到实时更新。当前不替换任何现有报告功能。
        </p>
      </div>
    </div>
  )
}
