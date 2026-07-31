/* ============================================================================
 * 评分维度分布（模板驱动）——报告详情「首卡」内的得分列表
 *
 * 数据来源：报告模板 →「报告内容配置」Tab 的每一个来源卡片（集合）= 一行
 *   维度 = 集合名 / 得分 = 本卡汇总得分 / 权重 = 本卡权重占比
 *   等级 = 按模板配置的三档区间（高/中/低）派生 / 说明 = 行内说明，留空取档位说明
 * 显隐开关：模板「报告内容配置」Tab 的复选框「显示分段总分」(showSectionTotals)
 * 样式基准：信用风控报告「评分维度分布（六维加权）」列表
 * ========================================================================== */
import { buildDimRows, type DimLevel, type ReportType } from './reportTemplateData'
import { useTemplate } from './templateStore'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

const LEVEL_CLS: Record<DimLevel, string> = {
  低: 'bg-emerald-100 text-emerald-700',
  中: 'bg-amber-100 text-amber-700',
  高: 'bg-orange-100 text-orange-700',
}

export function TemplateDimTable({ reportType, templateId, title = '评分维度分布（各集合加权）', onRowClick }: {
  reportType?: ReportType
  templateId?: string
  title?: string
  onRowClick?: (sectionId: string) => void
}) {
  const tpl = useTemplate(templateId, reportType)
  if (!tpl || tpl.showSectionTotals === false) return null
  const rows = buildDimRows(tpl)
  if (rows.length === 0) return null

  return (
    <>
      <div className="mt-5 mb-1 text-xs font-medium text-slate-500">{title}</div>
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-400">
              <th className="px-3 py-2 font-medium">维度</th>
              <th className="px-3 py-2 text-right font-medium">得分</th>
              <th className="px-3 py-2 text-right font-medium">权重</th>
              <th className="px-3 py-2 text-center font-medium">等级</th>
              <th className="px-3 py-2 font-medium">说明</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className={cn('border-t border-slate-100 transition', onRowClick && 'cursor-pointer hover:bg-slate-50')}
                onClick={onRowClick ? () => onRowClick(r.id) : undefined}
                title={onRowClick ? '点击定位到对应模块' : undefined}
              >
                <td className="px-3 py-2.5 font-medium text-ink-900">{r.name}</td>
                <td className={cn('px-3 py-2.5 text-right font-semibold tabular-nums', r.score < 0 ? 'text-rose-600' : 'text-emerald-600')}>
                  {r.score < 0 ? '−' : '+'}{Math.abs(r.score)}
                </td>
                <td className="px-3 py-2.5 text-right text-slate-400 tabular-nums">{r.weightPct}%</td>
                <td className="px-3 py-2.5 text-center">
                  {r.level
                    ? <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', LEVEL_CLS[r.level])}>{r.level}</span>
                    : <span className="text-slate-300">—</span>}
                </td>
                <td className="px-3 py-2.5 text-slate-500">{r.note || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
