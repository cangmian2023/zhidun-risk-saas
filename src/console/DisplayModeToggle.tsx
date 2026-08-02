// 报告详情页分段「显示方式」切换：纯图标按钮 + tooltip
// 切换 列表 ⇄ 小卡片，落库到模板分段（useSectionDisplayMode）。
import { useSectionDisplayMode } from './templateStore'
import type { ReportType } from './reportTemplateData'

const listIcon = (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M6 5h10M6 10h10M6 15h10" />
  </svg>
)
const cardIcon = (
  <svg viewBox="0 0 20 20" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3.5" y="3.5" width="6" height="6" rx="1" />
    <rect x="10.5" y="3.5" width="6" height="6" rx="1" />
    <rect x="3.5" y="10.5" width="6" height="6" rx="1" />
    <rect x="10.5" y="10.5" width="6" height="6" rx="1" />
  </svg>
)

export function DisplayModeToggle({ reportType, sectionId }: { reportType: ReportType; sectionId: string }) {
  const { mode, toggle } = useSectionDisplayMode(reportType, sectionId)
  const isList = mode === 'list'
  return (
    <button
      type="button"
      onClick={toggle}
      title={isList ? '当前：列表（点击切换为小卡片）' : '当前：小卡片（点击切换为列表）'}
      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
    >
      {isList ? listIcon : cardIcon}
    </button>
  )
}
