import { PageShell } from './PageShell'

/* ============ 图标（系统未引入 FontAwesome，按 HTML 视觉等价替换为内联 SVG） ============ */
const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-1">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const PieChartIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="inline">
    <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 8V1.5A6.5 6.5 0 0 1 14.5 8H8Z" fill="currentColor" opacity="0.25" />
    <path d="M8 8V1.5A6.5 6.5 0 0 1 14.5 8" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SortIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="inline align-middle ml-1 text-gray-400">
    <path d="M2 4 5 1l3 3M2 8 5 11l3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SortDescIcon = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-1 text-blue-500">
    <path d="M2.5 4 6 8l3.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ============ 排名色（等价 HTML rank1~rank4） ============ */
const RANK_COLORS = ['#f56c6c', '#e6a23c', '#409eff', '#909399']
const rankColor = (r: number) => RANK_COLORS[r - 1]

/* ============ 顶部指标卡（等价 HTML .stat-card / .stat-arrow） ============ */
function StatCard({ children, last }: { children: React.ReactNode; last?: boolean }) {
  return (
    <div className={`relative flex-1 min-w-[280px] px-4 py-3 ${last ? '' : 'border-r border-slate-200'}`}>
      {children}
      {!last && (
        <span className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 border-y-[12px] border-r-[12px] border-y-transparent border-r-white" />
      )}
    </div>
  )
}

/* ============ 表格数据（与 HTML 样例逐行一致） ============ */
type DeptRow = { idx: number; dept: string; wait: string; ing: string; follow: string; succ: string; fc: string; active: string }
const DEPT_ROWS: DeptRow[] = [
  { idx: 1, dept: '授信部', wait: '-', ing: '-', follow: '-', succ: '-', fc: '-', active: '-' },
  { idx: 2, dept: '风险部', wait: '-', ing: '-', follow: '-', succ: '-', fc: '-', active: '-' },
  { idx: 3, dept: '普惠部', wait: '-', ing: '-', follow: '-', succ: '-', fc: '-', active: '-' },
  { idx: 4, dept: '公司部', wait: '-', ing: '-', follow: '-', succ: '-', fc: '-', active: '-' },
]

type PersonRow = { idx: number; name: string; dept: string; wait: string; ing: string; follow: string; succ: string; fc: string; active: string }
const PERSON_ROWS: PersonRow[] = [
  { idx: 1, name: '19156027703', dept: '广州粤信科技有限公司', wait: '-', ing: '1 5.00%', follow: '1 5.00%', succ: '-', fc: '-', active: '1323' },
]

export default function DmMarketBoard() {
  return (
    <div style={{ padding: 24, maxWidth: 2800, margin: '0 auto' }}>
      <PageShell title="营销看板" crumb="数字营销 / 营销管理" subtitle="营销核心指标实时看板：触达、转化与 ROI" legend={false} />

      {/* 顶部筛选行 */}
      <div className="mb-4 flex items-center gap-4 text-sm">
        <span className="flex cursor-pointer items-center gap-1">线索筛选 <ChevronDown /></span>
        <span className="flex cursor-pointer items-center gap-1">名单筛选 <ChevronDown /></span>
        <span className="flex cursor-pointer items-center gap-1">更新日期 <ChevronDown /></span>
        <span className="flex cursor-pointer items-center gap-1">创建日期 <ChevronDown /></span>
      </div>

      {/* 顶部指标卡片组 */}
      <div className="relative mb-4 flex overflow-x-auto rounded border bg-white">
        <StatCard>
          <div className="text-base font-semibold">总线索 <span className="text-lg">20</span> 条</div>
          <div className="mt-1 text-sm text-gray-500">未分配 <span className="text-red-500">19</span> &nbsp;|&nbsp; 已分配 1</div>
        </StatCard>
        <StatCard>
          <div className="text-base font-semibold">待营销 <span className="text-lg">0</span> 条</div>
          <div className="mt-1 text-sm text-gray-500">30天未跟进 0 &nbsp;|&nbsp; 近7日新增 0</div>
        </StatCard>
        <StatCard>
          <div className="text-base font-semibold">营销中 <span className="text-lg text-blue-600">1</span> 条</div>
          <div className="mt-1 text-sm text-gray-500">有限进记录 0 &nbsp;|&nbsp; 无跟进记录 1</div>
        </StatCard>
        <StatCard last>
          <div className="text-base font-semibold">营销结束 <span className="text-lg">0</span> 条</div>
          <div className="mt-1 text-sm text-gray-500">成功 0 &nbsp;|&nbsp; 失败 0 &nbsp;|&nbsp; 无需营销 0</div>
        </StatCard>
      </div>

      {/* 部门营销数据区域 */}
      <div className="mb-4 overflow-x-auto rounded border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-medium">部门营销数据</span>
            <button className="flex items-center gap-1 text-sm text-blue-500">
              <PieChartIcon /> 图表分析
            </button>
            <span className="text-sm text-gray-500">统计口径: 全部名单及线索，其中包含了个人可见的名单及线索。</span>
          </div>
          <button className="flex items-center gap-1 rounded border px-3 py-1 text-sm">
            <DownloadIcon /> 导出
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#f7f8fc]">
            <tr>
              <th className="w-12 border px-3 py-2 text-left">序号</th>
              <th className="min-w-[160px] border px-3 py-2 text-left">部门</th>
              <th className="min-w-[120px] border px-3 py-2 text-right">待营销 <SortIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">营销中 <SortDescIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">有跟进 <SortIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">营销成功 <SortIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">跟进次数 <SortIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">活跃次数 <SortIcon /></th>
            </tr>
          </thead>
          <tbody>
            {DEPT_ROWS.map((d) => (
              <tr key={d.idx} className="hover:bg-gray-50">
                <td className="border px-3 py-2"><span className="font-bold" style={{ color: rankColor(d.idx) }}>{d.idx}</span></td>
                <td className="cursor-pointer border px-3 py-2 text-blue-500">{d.dept}</td>
                <td className="border px-3 py-2 text-right">{d.wait}</td>
                <td className="border px-3 py-2 text-right">{d.ing}</td>
                <td className="border px-3 py-2 text-right">{d.follow}</td>
                <td className="border px-3 py-2 text-right">{d.succ}</td>
                <td className="border px-3 py-2 text-right">{d.fc}</td>
                <td className="border px-3 py-2 text-right">{d.active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 个人排行榜区域 */}
      <div className="overflow-x-auto rounded border bg-white">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-3">
            <span className="font-medium">个人排行榜</span>
            <button className="flex items-center gap-1 text-sm text-blue-500">
              <PieChartIcon /> 图表分析
            </button>
            <span className="text-sm text-gray-500">统计口径: 全部名单及线索，其中包含了个人可见的名单及线索。</span>
          </div>
          <div className="flex items-center gap-3">
            <select className="rounded border px-3 py-1 text-sm">
              <option>选择部门</option>
            </select>
            <button className="flex items-center gap-1 rounded border px-3 py-1 text-sm">
              <DownloadIcon /> 导出
            </button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-[#f7f8fc]">
            <tr>
              <th className="w-12 border px-3 py-2 text-left">序号</th>
              <th className="min-w-[140px] border px-3 py-2 text-left">姓名</th>
              <th className="min-w-[240px] border px-3 py-2 text-left">部门</th>
              <th className="min-w-[120px] border px-3 py-2 text-right">待营销 <SortIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">营销中 <SortDescIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">有跟进 <SortIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">营销成功 <SortIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">跟进次数 <SortIcon /></th>
              <th className="min-w-[120px] border px-3 py-2 text-right">活跃次数 <SortIcon /></th>
            </tr>
          </thead>
          <tbody>
            {PERSON_ROWS.map((p) => (
              <tr key={p.idx} className="hover:bg-gray-50">
                <td className="border px-3 py-2"><span className="font-bold" style={{ color: rankColor(p.idx) }}>{p.idx}</span></td>
                <td className="border px-3 py-2">{p.name}</td>
                <td className="border px-3 py-2">{p.dept}</td>
                <td className="border px-3 py-2 text-right">{p.wait}</td>
                <td className="border px-3 py-2 text-right">{p.ing}</td>
                <td className="border px-3 py-2 text-right">{p.follow}</td>
                <td className="border px-3 py-2 text-right">{p.succ}</td>
                <td className="border px-3 py-2 text-right">{p.fc}</td>
                <td className="border px-3 py-2 text-right">{p.active}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
