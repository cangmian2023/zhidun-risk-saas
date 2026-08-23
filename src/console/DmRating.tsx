import { useState } from 'react'
import { PageShell } from './PageShell'
import { usePageNav } from './pageNav'
import { RightDrawer } from './components/ui'

/* ============ 图标（等价 HTML：搜索/营销/导出/下载报告） ============ */
const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
    <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="9" width="3" height="5" fill="currentColor" opacity="0.85" />
    <rect x="6.5" y="5" width="3" height="9" fill="currentColor" opacity="0.55" />
    <rect x="11" y="2" width="3" height="12" fill="currentColor" opacity="0.35" />
  </svg>
)
const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M8 11V3m0 0L5 6m3-3 3 3M3 12v1h10v-1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ArrowDown = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-1 text-[#999]">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
/* 评级报告下载图标（HTML .report-icon svg，两种配色：灰白 / 橙色） */
const ReportIcon = ({ orange }: { orange?: boolean }) =>
  orange ? (
    <svg viewBox="0 0 24 28" fill="none" className="h-7 w-6">
      <path d="M4 2h12l4 4v20H4V2z" fill="#fff1e6" stroke="#f5b82e" strokeWidth="1" />
      <path d="M16 2v4h4" fill="#ffe4c4" stroke="#f5b82e" strokeWidth="1" />
      <path d="M7 12h10M7 16h10M7 20h6" stroke="#e8a820" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18 18l3 3-3 3" stroke="#f57c00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M21 21h-6" stroke="#f57c00" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 28" fill="none" className="h-7 w-6">
      <path d="M4 2h12l4 4v20H4V2z" fill="#e8eaf0" stroke="#c0c4cc" strokeWidth="1" />
      <path d="M16 2v4h4" fill="#dcdfe6" stroke="#c0c4cc" strokeWidth="1" />
      <path d="M7 12h10M7 16h10M7 20h6" stroke="#909399" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M18 18l3 3-3 3" stroke="#4a7dff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M21 21h-6" stroke="#4a7dff" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )

/* ============ 企业图标（HTML .enterprise-icon） ============ */
function EntIcon({ kind, char }: { kind: 'diamond' | 'char'; char?: string }) {
  if (kind === 'diamond') {
    return (
      <span
        className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px]"
        style={{ background: 'linear-gradient(135deg, #e74c3c, #c0392b)' }}
      >
        <span className="h-2 w-2 rotate-45" style={{ background: 'rgba(255,255,255,0.3)' }} />
      </span>
    )
  }
  return (
    <span
      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-[3px] text-[11px] font-bold text-white"
      style={{ background: 'linear-gradient(135deg, #4a90d9, #357abd)' }}
    >
      {char}
    </span>
  )
}

/* ============ 样例数据（与 HTML 逐行一致） ============ */
type Row = { icon: 'diamond' | '泰' | '遂'; name: string; grade: string; outlook: string; date: string; agency: string; reportOrange?: boolean }
const ROWS: Row[] = [
  { icon: 'diamond', name: '江苏金融租赁股份有限公司', grade: 'Baa2', outlook: '稳定', date: '2026-08-20', agency: '穆迪' },
  { icon: 'diamond', name: '江苏金融租赁股份有限公司', grade: 'Baa2', outlook: '稳定', date: '2026-08-20', agency: '穆迪' },
  { icon: '泰', name: '泰兴市襟江投资有限公司', grade: 'BBB+', outlook: '正面', date: '2026-08-20', agency: '联合国际', reportOrange: true },
  { icon: '遂', name: '遂宁市河东开发建设投资有限公司', grade: 'AA', outlook: '稳定', date: '2026-08-20', agency: '联合资信', reportOrange: true },
  { icon: 'diamond', name: '江苏金融租赁股份有限公司', grade: 'P-2', outlook: '－', date: '2026-08-20', agency: '穆迪' },
]

function outlookColor(o: string) {
  if (o === '正面') return 'text-[#52c41a]'
  if (o === '负面') return 'text-[#ff4d4f]'
  if (o === '－') return 'text-[#999]'
  return 'text-[#333]'
}

/* 历史评级列表（查看弹窗） */
const RATING_HISTORY = [
  { idx: 1, agency: '联合资信', grade: 'AA', date: '2026-08-21', outlook: '稳定', disclose: '2026-08-21' },
  { idx: 2, agency: '中诚信国际', grade: 'AA', date: '2026-03-15', outlook: '稳定', disclose: '2026-03-17' },
  { idx: 3, agency: '联合资信', grade: 'AA-', date: '2025-08-20', outlook: '负面', disclose: '2025-08-22' },
  { idx: 4, agency: '大公国际', grade: 'A+', date: '2024-09-10', outlook: '稳定', disclose: '2024-09-12' },
]

export default function DmRating() {
  const { goDetail } = usePageNav()
  const [outlook, setOutlook] = useState('全部')
  const [checked, setChecked] = useState<boolean[]>(() => ROWS.map(() => false))
  const [historyOpen, setHistoryOpen] = useState(false)
  const allChecked = checked.every(Boolean)

  const toggleAll = () => setChecked(ROWS.map(() => !allChecked))
  const toggleOne = (i: number) => setChecked((c) => c.map((v, idx) => (idx === i ? !v : v)))

  return (
    <div style={{ minHeight: '100vh' }} className="bg-white text-sm text-[#333]">
      <PageShell title="主体评级" crumb="数字营销 / 金融工具" subtitle="企业主体信用评级与评级迁移" legend={false} />

      {/* ============ 搜索栏 ============ */}
      <div className="flex items-center justify-center px-6 pb-6">
        <div className="flex w-full max-w-[600px] items-center overflow-hidden rounded border-2 border-[#4a7dff]">
          <input
            placeholder="可输入企业名称/评级公司名称进行搜索"
            className="h-11 flex-1 bg-white px-4 text-[15px] text-[#333] outline-none placeholder:text-[#999]"
          />
          <button className="flex h-11 cursor-pointer items-center gap-1.5 bg-[#f5b82e] px-7 text-[15px] font-medium text-[#333] transition hover:bg-[#e8a820]">
            <SearchIcon /> 查询
          </button>
        </div>
      </div>

      {/* ============ 筛选区域（浅灰底） ============ */}
      <div className="bg-[#f5f6fa] px-6 py-5">
        <div className="mb-4 flex items-center">
          <span className="min-w-[70px] whitespace-nowrap text-[15px] font-bold text-[#1a1a1a]">评级展望</span>
          <div className="flex flex-wrap items-center gap-2">
            {['全部', '正面', '稳定', '负面', '列入评级观察', '待决定'].map((o) => (
              <span
                key={o}
                onClick={() => setOutlook(o)}
                className={`cursor-pointer select-none rounded px-3.5 py-1.5 text-sm transition ${
                  outlook === o ? 'bg-[#e8f0ff] font-medium text-[#4a7dff]' : 'text-[#555] hover:bg-[#e8eaf0] hover:text-[#333]'
                }`}
              >
                {o}
              </span>
            ))}
          </div>
        </div>

        <hr className="my-3 border-t border-dashed border-[#dcdfe6]" />

        <div className="flex items-center">
          <span className="min-w-[70px] whitespace-nowrap text-[15px] font-bold text-[#1a1a1a]">企业筛选</span>
          <div className="flex items-center gap-6">
            {['评级', '评级日期', '省份地区'].map((d) => (
              <span key={d} className="flex cursor-pointer select-none items-center gap-1 py-1 text-sm text-[#555] hover:text-[#333]">
                {d} <ArrowDown />
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ============ 结果区域 ============ */}
      <div className="px-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[15px] text-[#333]">
            找到<span className="mx-0.5 font-semibold text-[#4a7dff]">30000</span>条结果
          </div>
          <div className="flex items-center gap-4">
            <button className="flex cursor-pointer select-none items-center gap-1.5 rounded border border-[#dcdfe6] bg-white px-4 py-2 text-sm text-[#555] transition hover:border-[#4a7dff] hover:text-[#4a7dff]">
              <ChartIcon /> 营销 <ArrowDown />
            </button>
            <button className="flex cursor-pointer select-none items-center gap-1.5 rounded border border-[#dcdfe6] bg-white px-4 py-2 text-sm text-[#555] transition hover:border-[#4a7dff] hover:text-[#4a7dff]">
              <UploadIcon /> 导出
            </button>
          </div>
        </div>

        {/* 数据表格 */}
        <div className="w-full overflow-x-auto">
          <table className="w-full table-fixed border-collapse">
            <thead>
              <tr>
                <th className="w-10 border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-3 text-center font-semibold text-[#333]">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    onChange={toggleAll}
                    className="h-4 w-4 cursor-pointer appearance-none rounded-sm border border-[#dcdfe6] bg-white align-middle transition checked:border-[#4a7dff] checked:bg-[#4a7dff] checked:after:absolute checked:after:left-1 checked:after:top-0.5 checked:after:h-2 checked:after:w-1 checked:after:rotate-45 checked:after:border-2 checked:after:border-l-0 checked:after:border-t-0 checked:after:border-white checked:after:content-['']"
                    style={{ position: 'relative' }}
                  />
                </th>
                <th className="w-[28%] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-3 text-left font-semibold text-[#333]">企业名称</th>
                <th className="w-[10%] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-3 text-left font-semibold text-[#333]">本次评级</th>
                <th className="w-[9%] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-3 text-left font-semibold text-[#333]">评级展望</th>
                <th className="w-[11%] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-3 text-left font-semibold text-[#333]">评级日期</th>
                <th className="w-[11%] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-3 text-left font-semibold text-[#333]">披露日期</th>
                <th className="w-[10%] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-3 text-left font-semibold text-[#333]">评级公司</th>
                <th className="w-[8%] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-3 text-center font-semibold text-[#333]">评级报告</th>
                <th className="w-[9%] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-3 text-center font-semibold text-[#333]">历史评级</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr key={i} className="transition hover:bg-[#fafbfc]">
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-3.5 text-center">
                    <input
                      type="checkbox"
                      checked={checked[i]}
                      onChange={() => toggleOne(i)}
                      className="h-4 w-4 cursor-pointer appearance-none rounded-sm border border-[#dcdfe6] bg-white align-middle transition checked:border-[#4a7dff] checked:bg-[#4a7dff] checked:after:absolute checked:after:left-1 checked:after:top-0.5 checked:after:h-2 checked:after:w-1 checked:after:rotate-45 checked:after:border-2 checked:after:border-l-0 checked:after:border-t-0 checked:after:border-white checked:after:content-['']"
                      style={{ position: 'relative' }}
                    />
                  </td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-3.5">
                    <div className="flex items-center gap-2">
                      <EntIcon kind={r.icon === 'diamond' ? 'diamond' : 'char'} char={r.icon !== 'diamond' ? r.icon : undefined} />
                      <span
                        className="cursor-pointer text-sm font-medium text-[#1a1a1a] hover:text-[#1f47f5] hover:underline"
                        onClick={() => goDetail('/console/dm/ent-archive-basic', { name: r.name })}
                      >
                        {r.name}
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-3.5">
                    <span className="text-sm font-medium text-[#333]">{r.grade}</span>
                  </td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-3.5">
                    <span className={`text-sm ${outlookColor(r.outlook)}`}>{r.outlook}</span>
                  </td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-3.5">{r.date}</td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-3.5">{r.date}</td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-3.5">
                    <span className="text-sm font-medium text-[#333]">{r.agency}</span>
                  </td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-3.5 text-center">
                    <span title="下载评级报告" className="inline-flex h-8 w-7 cursor-pointer items-center justify-center">
                      <ReportIcon orange={r.reportOrange} />
                    </span>
                  </td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-3.5 text-center">
                    <span
                      className="cursor-pointer text-sm text-[#4a7dff] hover:underline"
                      onClick={() => setHistoryOpen(true)}
                    >
                      查看
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="h-10" />
      </div>

      {/* 历史评级弹窗 */}
      <RightDrawer open={historyOpen} onClose={() => setHistoryOpen(false)} title="历史评级" width={640}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-2.5 text-left text-sm font-semibold text-[#333]">序号</th>
                <th className="border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-2.5 text-left text-sm font-semibold text-[#333]">评级公司</th>
                <th className="border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-2.5 text-left text-sm font-semibold text-[#333]">主体评级</th>
                <th className="border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-2.5 text-left text-sm font-semibold text-[#333]">评级日期</th>
                <th className="border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-2.5 text-left text-sm font-semibold text-[#333]">评级展望</th>
                <th className="border-b border-[#e8eaf0] bg-[#f5f6fa] px-3 py-2.5 text-left text-sm font-semibold text-[#333]">披露日期</th>
              </tr>
            </thead>
            <tbody>
              {RATING_HISTORY.map((r) => (
                <tr key={r.idx} className="odd:bg-white even:bg-[#f8f8fe]">
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-2.5 text-sm">{r.idx}</td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-2.5 text-sm">{r.agency}</td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-2.5 text-sm font-medium">{r.grade}</td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-2.5 text-sm">{r.date}</td>
                  <td className={`border-b border-dashed border-[#dcdfe6] px-3 py-2.5 text-sm ${outlookColor(r.outlook)}`}>{r.outlook}</td>
                  <td className="border-b border-dashed border-[#dcdfe6] px-3 py-2.5 text-sm">{r.disclose}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </RightDrawer>
    </div>
  )
}
