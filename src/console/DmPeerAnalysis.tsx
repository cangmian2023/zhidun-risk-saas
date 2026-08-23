import { useState } from 'react'
import { PageShell } from './PageShell'
import { usePageNav } from './pageNav'

/* ============ 图标（等价 HTML：收起/图表/搜索/排序/涨跌箭头） ============ */
const ArrowDown = ({ active }: { active?: boolean }) => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className={`inline align-middle ml-1 ${active ? 'text-[#4a7dff]' : 'text-[#c0c4cc]'}`}>
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SortBoth = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="inline align-middle ml-1 text-[#c0c4cc]">
    <path d="M2 4 5 1l3 3M2 8 5 11l3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ChartIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="9" width="3" height="5" fill="currentColor" opacity="0.85" />
    <rect x="6.5" y="5" width="3" height="9" fill="currentColor" opacity="0.55" />
    <rect x="11" y="2" width="3" height="12" fill="currentColor" opacity="0.35" />
  </svg>
)
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
    <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
/* ============ 行业 tab（HTML .industry-tab，3 行） ============ */
const INDUSTRY_ROWS = [
  ['煤炭', '农林牧渔', '基础化工', '钢铁', '有色金属', '电子', '汽车', '家用电器', '食品饮料', '纺织服饰', '轻工制造', '医药生物', '公用事业'],
  ['交通运输', '房地产', '商贸零售', '社会服务', '银行', '非银金融', '建筑材料', '建筑装饰', '电力设备', '机械设备', '国防军工', '计算机', '传媒'],
  ['通信', '石油石化', '环保', '美容护理', '综合'],
]

/* ============ 已选标签（HTML .selected-tag） ============ */
const INITIAL_SELECTED = ['最高值', '最低值', '平均值', '2021年 中报']

/* ============ 表格数据（与 HTML 逐行一致） ============ */
type StatRow = { label: string; cells: (string | { roe: boolean; value: string })[] }
const STAT_ROWS: StatRow[] = [
  {
    label: '煤炭行业最高值',
    cells: ['1439.79', '260.26', '5993.34', '4212.79', { roe: true, value: '24.07%' }, '255.32'],
  },
  {
    label: '煤炭行业最低值',
    cells: ['0.05', '-3.47', '3.88', '3.25', { roe: true, value: '-13.15%' }, '-3.61'],
  },
  {
    label: '煤炭行业平均值',
    cells: ['166.80', '18.57', '582.33', '287.86', { roe: true, value: '6.24%' }, '17.82'],
  },
]

type CompanyRow = {
  rank: number
  name: string
  cells: { value: string; yoy?: string }[]
  roe: string
}
const COMPANY_ROWS: CompanyRow[] = [
  {
    rank: 1,
    name: '中国神华能源股份有限公司',
    cells: [
      { value: '1439.79', yoy: '37.10%' },
      { value: '260.26', yoy: '25.99%' },
      { value: '5993.34', yoy: '4.07%' },
      { value: '4212.79', yoy: '1.07%' },
      { value: '255.32', yoy: '24.15%' },
    ],
    roe: '7.32%',
  },
  {
    rank: 2,
    name: '中国中煤能源股份有限公司',
    cells: [
      { value: '1021.79', yoy: '60.80%' },
      { value: '76.15', yoy: '228.46%' },
      { value: '3013.40', yoy: '6.70%' },
      { value: '1330.76', yoy: '9.78%' },
      { value: '73.45', yoy: '215.30%' },
    ],
    roe: '7.27%',
  },
  {
    rank: 3,
    name: '陕西煤业股份有限公司',
    cells: [
      { value: '847.21', yoy: '12.45%' },
      { value: '198.33', yoy: '15.20%' },
      { value: '1820.56', yoy: '3.11%' },
      { value: '1105.42', yoy: '2.88%' },
      { value: '61.28', yoy: '18.74%' },
    ],
    roe: '12.05%',
  },
  {
    rank: 4,
    name: '兖矿能源集团股份有限公司',
    cells: [
      { value: '756.84', yoy: '9.33%' },
      { value: '142.07', yoy: '11.62%' },
      { value: '1654.30', yoy: '2.45%' },
      { value: '988.16', yoy: '1.92%' },
      { value: '52.73', yoy: '13.05%' },
    ],
    roe: '11.42%',
  },
  {
    rank: 5,
    name: '山西焦煤能源集团股份有限公司',
    cells: [
      { value: '521.66', yoy: '-4.18%' },
      { value: '61.58', yoy: '-8.77%' },
      { value: '1120.88', yoy: '1.36%' },
      { value: '654.20', yoy: '0.54%' },
      { value: '38.91', yoy: '-5.62%' },
    ],
    roe: '8.94%',
  },
]

/* 同比涨跌颜色：涨红 #f5222d / 跌绿 #52c41a（HTML .yoy.up/.yoy.down） */
function YoY({ yoy }: { yoy: string }) {
  const up = yoy.startsWith('-') ? false : true
  return (
    <span className={`inline-flex items-center gap-0.5 text-[13px] ${up ? 'text-[#f5222d]' : 'text-[#52c41a]'}`}>
      <span className="text-[11px]">{up ? '▲' : '▼'}</span>
      {yoy}
    </span>
  )
}

export default function DmPeerAnalysis() {
  const { goDetail } = usePageNav()
  const [industry, setIndustry] = useState('煤炭')
  const [collapsed, setCollapsed] = useState(false)
  const [selected, setSelected] = useState<string[]>(INITIAL_SELECTED)

  const closeTag = (tag: string) => setSelected((s) => s.filter((t) => t !== tag))
  const reset = () => setSelected(INITIAL_SELECTED)

  return (
    <div style={{ minHeight: '100vh' }} className="bg-white text-sm text-[#333]">
      <PageShell title="同业分析" crumb="数字营销 / 金融工具" subtitle="同业机构对标与竞争格局分析" legend={false} />

      {/* ============ 浅灰筛选区 ============ */}
      <div className="bg-[#f5f6fa] px-6 py-5">
        {/* 行业选择 第一行（含收起按钮） */}
        <div className="relative mb-3 flex flex-wrap items-center gap-2 pr-20">
          <span className="mr-3 min-w-[70px] whitespace-nowrap text-[15px] font-bold text-[#1a1a1a]">行业选择</span>
          {INDUSTRY_ROWS[0].map((ind) => (
            <span
              key={ind}
              onClick={() => setIndustry(ind)}
              className={`cursor-pointer select-none whitespace-nowrap rounded px-3.5 py-1.5 text-sm transition ${
                industry === ind ? 'bg-[#e8f0ff] font-medium text-[#4a7dff]' : 'text-[#555] hover:bg-[#e8eaf0] hover:text-[#333]'
              }`}
            >
              {ind}
            </span>
          ))}
          <span
            onClick={() => setCollapsed((c) => !c)}
            className="absolute right-0 top-0 cursor-pointer select-none text-sm text-[#4a7dff]"
          >
            {collapsed ? '展开 ⌄' : '收起 ⌃'}
          </span>
        </div>

        {/* 第二、三行（收起时隐藏） */}
        {!collapsed &&
          [INDUSTRY_ROWS[1], INDUSTRY_ROWS[2]].map((row, ri) => (
            <div key={ri} className="mb-3 flex flex-wrap items-center gap-2">
              <span className="mr-3 min-w-[70px] whitespace-nowrap text-[15px] font-bold text-[#1a1a1a] opacity-0">行业选择</span>
              {row.map((ind) => (
                <span
                  key={ind}
                  onClick={() => setIndustry(ind)}
                  className={`cursor-pointer select-none whitespace-nowrap rounded px-3.5 py-1.5 text-sm transition ${
                    industry === ind ? 'bg-[#e8f0ff] font-medium text-[#4a7dff]' : 'text-[#555] hover:bg-[#e8eaf0] hover:text-[#333]'
                  }`}
                >
                  {ind}
                </span>
              ))}
            </div>
          ))}

        <hr className="my-3 border-t border-dashed border-[#dcdfe6]" />

        {/* 数值筛选 */}
        <div className="flex items-center gap-6">
          <span className="min-w-[70px] text-[15px] font-bold text-[#1a1a1a]">数值筛选</span>
          <span className="flex cursor-pointer select-none items-center gap-1 py-1 text-sm text-[#4a7dff]">
            统计值 <ArrowDown active />
          </span>
          <span className="flex cursor-pointer select-none items-center gap-1 py-1 text-sm text-[#4a7dff]">
            报告期 <ArrowDown active />
          </span>
          <span className="flex cursor-pointer select-none items-center gap-1 py-1 text-sm text-[#555]">
            地区 <ArrowDown />
          </span>
        </div>
      </div>

      {/* ============ 已选标签 ============ */}
      <div className="flex flex-wrap items-center gap-2.5 px-6 py-4">
        <span className="mr-1 text-[15px] font-bold text-[#1a1a1a]">已选</span>
        {selected.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-2 rounded bg-[#f0f4ff] px-3 py-1.5 text-sm text-[#4a7dff]">
            {tag}
            <span onClick={() => closeTag(tag)} className="cursor-pointer text-sm leading-none text-[#999] hover:text-[#666]">
              ×
            </span>
          </span>
        ))}
        <span onClick={reset} className="ml-auto cursor-pointer select-none text-sm text-[#555] hover:text-[#4a7dff]">
          重置
        </span>
      </div>

      {/* ============ 结果区域 ============ */}
      <div className="bg-[#f5f6fa] px-6 pt-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="text-[15px] text-[#333]">
            找到 <span className="font-semibold text-[#4a7dff]">40</span> 条结果
          </div>
          <div className="flex w-[260px] items-center gap-2 rounded border border-[#dcdfe6] bg-white px-3.5 py-2">
            <span className="text-sm text-[#999]"><SearchIcon /></span>
            <input placeholder="请输入公司名称" className="flex-1 bg-transparent text-sm text-[#333] outline-none placeholder:text-[#999]" />
          </div>
        </div>

        {/* 数据表格 */}
        <div className="w-full overflow-x-auto bg-white">
          <table className="w-full min-w-[1200px] table-fixed border-collapse">
            <thead>
              <tr>
                <th className="w-[50px] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-2.5 py-3 text-center font-semibold text-[#333]"></th>
                <th className="w-[220px] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-2.5 py-3 text-left font-semibold text-[#333]">行业统计值</th>
                <th className="w-[160px] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-2.5 py-3 text-left font-semibold text-[#333]">
                  <span className="inline-flex cursor-pointer items-center gap-1">营业收入(亿元/同比) <ArrowDown active /></span>
                </th>
                <th className="w-[160px] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-2.5 py-3 text-left font-semibold text-[#333]">
                  <span className="inline-flex cursor-pointer items-center gap-1">归母净利润(亿元/同比) <SortBoth /></span>
                </th>
                <th className="w-[160px] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-2.5 py-3 text-left font-semibold text-[#333]">
                  <span className="inline-flex cursor-pointer items-center gap-1">总资产(亿元/同比) <SortBoth /></span>
                </th>
                <th className="w-[160px] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-2.5 py-3 text-left font-semibold text-[#333]">
                  <span className="inline-flex cursor-pointer items-center gap-1">净资产(亿元/同比) <SortBoth /></span>
                </th>
                <th className="w-[160px] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-2.5 py-3 text-left font-semibold text-[#333]">
                  <span className="inline-flex cursor-pointer items-center gap-1">净资产收益率(%) <SortBoth /></span>
                </th>
                <th className="w-[160px] whitespace-nowrap border-b border-[#e8eaf0] bg-[#f5f6fa] px-2.5 py-3 text-left font-semibold text-[#333]">
                  <span className="inline-flex cursor-pointer items-center gap-1">扣非净利润(亿元/同比) <SortBoth /></span>
                </th>
              </tr>
            </thead>
            <tbody>
              {/* 行业统计值行（浅绿背景） */}
              {STAT_ROWS.map((r) => (
                <tr key={r.label} className="transition hover:bg-[#e8f5e0]">
                  <td className="border-b border-[#f0f0f0] px-2.5 py-3.5 text-center bg-[#f0f9eb]"></td>
                  <td className="border-b border-[#f0f0f0] px-2.5 py-3.5 bg-[#f0f9eb]">
                    <div className="flex items-center gap-2 text-sm text-[#333]">
                      {r.label} <span className="text-sm text-[#333]"><ChartIcon /></span>
                    </div>
                  </td>
                  {r.cells.map((c, i) => (
                    <td key={i} className="border-b border-[#f0f0f0] px-2.5 py-3.5 bg-[#f0f9eb]">
                      {typeof c === 'string' ? (
                        <span className="text-sm text-[#333]">{c}</span>
                      ) : (
                        <span className={`text-sm font-medium ${c.roe && c.value.startsWith('-') ? 'text-[#52c41a]' : 'text-[#f5222d]'}`}>{c.value}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}

              {/* 公司行 */}
              {COMPANY_ROWS.map((r) => (
                <tr key={r.rank} className="transition hover:bg-[#fafbfc]">
                  <td className="border-b border-[#f0f0f0] px-2.5 py-3.5 text-center text-sm text-[#666]">{r.rank}</td>
                  <td className="border-b border-[#f0f0f0] px-2.5 py-3.5">
                    <span
                      className="cursor-pointer text-sm font-medium text-[#1a1a1a] hover:text-[#1f47f5] hover:underline"
                      onClick={() => goDetail('/console/dm/ent-archive-basic', { name: r.name })}
                    >
                      {r.name}
                    </span>
                  </td>
                  {r.cells.slice(0, 4).map((c, i) => (
                    <td key={i} className="border-b border-[#f0f0f0] px-2.5 py-3.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm text-[#333]">{c.value}</span>
                        {c.yoy && <YoY yoy={c.yoy} />}
                      </div>
                    </td>
                  ))}
                  <td className="border-b border-[#f0f0f0] px-2.5 py-3.5">
                    <span className="text-sm font-medium text-[#f5222d]">{r.roe}</span>
                  </td>
                  <td className="border-b border-[#f0f0f0] px-2.5 py-3.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm text-[#333]">{r.cells[4].value}</span>
                      {r.cells[4].yoy && <YoY yoy={r.cells[4].yoy} />}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="h-10" />
      </div>
    </div>
  )
}
