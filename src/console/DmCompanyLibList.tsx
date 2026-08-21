import { useMemo, useState, useRef, useEffect } from 'react'
import { usePageNav } from './pageNav'
import { PageShell } from './PageShell'

type Row = {
  id: string
  name: string
  abbrColor: string
  investmentCount: number
  agencies: string[]
  ratios: number[]
  industries: string[]
  investors: string[]
}

const INDUSTRY_OPTIONS = [
  '引导基金最关注的产业类型（前三）',
  '全部产业',
  '新一代信息技术',
  '高端装备制造',
  '生物医药',
  '新材料',
  '新能源',
  '节能环保',
  '数字创意',
]

const MOCK_ROWS: Row[] = [
  {
    id: '1',
    name: '北京清微智能科技股份有限公司',
    abbrColor: '#f56c6c',
    investmentCount: 44,
    agencies: ['北京市人民政府国有资产监督管理委员会', '北京市海淀区人民政府国有资产监督管理委员会'],
    ratios: [3.219, 1.4264],
    industries: ['基础软件、软件和信息技术服务', '半导体、集成电路'],
    investors: ['北京信息产业发展投资基金（有限合伙）', '北京中关村科学城科技成长投资合伙企业（有限合伙）'],
  },
  {
    id: '2',
    name: '深圳云豹智能股份有限公司',
    abbrColor: '#4096ff',
    investmentCount: 44,
    agencies: ['深圳市财政局', '深圳市宝安区财政局'],
    ratios: [2.2358, 2.2358],
    industries: ['半导体、工业互联网、湿电子化学品', '半导体、食品饮料、冷链物流'],
    investors: ['深圳市引导基金投资有限公司', '深圳市宝安区产业投资引导基金有限公司'],
  },
  {
    id: '3',
    name: '中科宇航技术股份有限公司',
    abbrColor: '#52c41a',
    investmentCount: 42,
    agencies: ['广州市人民政府办公厅', '南充市国有资产监督管理委员会'],
    ratios: [3.4995, 2.1347],
    industries: ['航空航天、基础软件、电子信息', '新型显示产业、智能终端'],
    investors: ['广州科创产业投资基金合伙企业（有限合伙）', '四川南充临江产业发展投资合伙企业（有限合伙）'],
  },
  {
    id: '4',
    name: '奕斯伟计算技术股份有限公司',
    abbrColor: '#722ed1',
    investmentCount: 41,
    agencies: ['鄂州葛店经济技术开发区', '四川天府新区财政局'],
    ratios: [0.5861, 0.5518],
    industries: ['智能手机'],
    investors: ['鄂州市葛店芯存储产业投资基金合伙企业', '成都华泰天府数智创业投资合伙企业（有限合伙）'],
  },
  {
    id: '5',
    name: '上海同创普润新材料股份有限公司',
    abbrColor: '#fa8c16',
    investmentCount: 39,
    agencies: ['国务院国有资产监督管理委员会', '河北省人民政府国有资产监督管理委员会'],
    ratios: [0.9, 0.8982],
    industries: ['新能源汽车、高端装备、先进钢铁材料', '手机外壳、沥青、溅射靶材'],
    investors: ['中建材（安徽）新材料产业投资基金合伙企业', '信金交股权投资（雄安）合伙企业（有限合伙）'],
  },
  {
    id: '6',
    name: '福建德尔科技股份有限公司',
    abbrColor: '#13c2c2',
    investmentCount: 38,
    agencies: ['安徽省人民政府国有资产监督管理委员会', '龙岩市人民政府国有资产监督管理委员会'],
    ratios: [0.852, 0.5312],
    industries: ['模具、高端装备、集成电路', '电子气体'],
    investors: ['安徽交控招商产业投资基金（有限合伙）', '龙岩投资发展集团有限公司'],
  },
  {
    id: '7',
    name: '上海天数智芯半导体有限公司',
    abbrColor: '#eb2f96',
    investmentCount: 37,
    agencies: ['上海市财政局', '上海市浦东新区财政局'],
    ratios: [1.8034, 1.1122],
    industries: ['集成电路、人工智能', '云计算设备'],
    investors: ['上海集成电路产业投资基金（二期）', '上海浦东新兴产业投资基金'],
  },
  {
    id: '8',
    name: '沐曦集成电路（上海）股份有限公司',
    abbrColor: '#1890ff',
    investmentCount: 36,
    agencies: ['上海市财政局', '江苏省财政厅'],
    ratios: [1.5602, 0.9876],
    industries: ['集成电路、人工智能', '高性能计算'],
    investors: ['中国互联网投资基金（有限合伙）', '江苏走泉集成电路产业投资基金'],
  },
  {
    id: '9',
    name: '合肥启芯微电子有限公司',
    abbrColor: '#faad14',
    investmentCount: 35,
    agencies: ['合肥市人民政府国有资产监督管理委员会', '安徽省财政厅'],
    ratios: [2.112, 1.456],
    industries: ['半导体、智能终端', '传感器'],
    investors: ['合肥产投集团', '安徽省集成电路产业投资基金'],
  },
  {
    id: '10',
    name: '珠海芯聚未来科技有限公司',
    abbrColor: '#a0d911',
    investmentCount: 34,
    agencies: ['珠海市财政局', '横琴粤澳深度合作区财政局'],
    ratios: [1.234, 0.876],
    industries: ['集成电路、物联网', '人工智能芯片'],
    investors: ['珠海发展投资基金', '横琴产业投资基金'],
  },
  {
    id: '11',
    name: '西安铂力特增材技术股份有限公司',
    abbrColor: '#f5222d',
    investmentCount: 33,
    agencies: ['西安市人民政府国有资产监督管理委员会', '陕西省财政厅'],
    ratios: [1.678, 1.123],
    industries: ['高端装备制造、增材制造', '航空航天零部件'],
    investors: ['陕西省高端装备制造产业投资基金', '西安创新投资基金'],
  },
  {
    id: '12',
    name: '武汉敏芯半导体股份有限公司',
    abbrColor: '#2f54eb',
    investmentCount: 32,
    agencies: ['武汉市人民政府国有资产监督管理委员会', '湖北省财政厅'],
    ratios: [1.456, 0.987],
    industries: ['光通信、半导体', '激光器芯片'],
    investors: ['湖北省长江产业投资集团', '武汉光谷烽火产业投资基金'],
  },
]

function ChevronDownIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function SearchIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function MarketingIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function ExportIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <path d="M17 8 12 3 7 8" />
      <path d="M12 3v12" />
    </svg>
  )
}

function InfoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}

function BuildingIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 21h18" />
      <path d="M5 21V7l8-4 8 4v14" />
      <path d="M10 9h4" />
      <path d="M10 13h4" />
      <path d="M10 17h4" />
    </svg>
  )
}

function SortDownIcon({ className = 'w-3 h-3' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function LogoBox({ text, color }: { text: string; color: string }) {
  return (
    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded text-xs font-bold text-white" style={{ background: color }}>
      {text.slice(0, 1)}
    </div>
  )
}

export default function DmCompanyLibList() {
  const { back } = usePageNav()
  const params = useMemo(() => {
    const usp = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    return { cat: usp.get('cat') || '', name: usp.get('name') || '' }
  }, [])

  const title = params.name || '企业列表'

  const [keyword, setKeyword] = useState('')
  const [industryOpen, setIndustryOpen] = useState(false)
  const [industrySel, setIndustrySel] = useState(INDUSTRY_OPTIONS[0])
  const [marketingOpen, setMarketingOpen] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [sortDesc, setSortDesc] = useState(true)
  const [toast, setToast] = useState('')
  const [oppOpen, setOppOpen] = useState(false)

  const industryWrapRef = useRef<HTMLDivElement>(null)
  const marketingWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (industryWrapRef.current && !industryWrapRef.current.contains(e.target as Node)) setIndustryOpen(false)
      if (marketingWrapRef.current && !marketingWrapRef.current.contains(e.target as Node)) setMarketingOpen(false)
    }
    if (industryOpen || marketingOpen) document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [industryOpen, marketingOpen])

  const filtered = useMemo(() => {
    let rows = MOCK_ROWS.slice()
    if (keyword.trim()) {
      rows = rows.filter((r) => r.name.toLowerCase().includes(keyword.trim().toLowerCase()))
    }
    if (industrySel !== INDUSTRY_OPTIONS[0] && industrySel !== '全部产业') {
      rows = rows.filter((r) => r.industries.some((i) => i.includes(industrySel)))
    }
    rows.sort((a, b) => sortDesc ? b.investmentCount - a.investmentCount : a.investmentCount - b.investmentCount)
    return rows
  }, [keyword, industrySel, sortDesc])

  const allSelected = filtered.length > 0 && selected.size === filtered.length

  function toggleAll() {
    const next = new Set(selected)
    if (allSelected) filtered.forEach((r) => next.delete(r.id))
    else filtered.forEach((r) => next.add(r.id))
    setSelected(next)
  }

  function toggleRow(id: string) {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelected(next)
  }

  function showToast(msg: string) {
    setToast(msg)
    setTimeout(() => setToast(''), 2200)
  }

  function addSelected() {
    if (selected.size === 0) return
    showToast(`已将 ${selected.size} 家企业加入营销名单`)
    setMarketingOpen(false)
  }

  function addTop30k() {
    showToast(`已将当前筛选结果的前 30,000 条加入营销名单（本次样例 ${filtered.length} 条）`)
    setMarketingOpen(false)
  }

  return (
    <div className="min-h-full bg-white">
      <PageShell
        title={title}
        crumb={`数字营销 / 企业库 / ${title}`}
        legend={false}
        subtitle="政府产业引导基金与被投企业名单"
        actions={
          <button
            onClick={() => back()}
            className="rounded border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          >
            返回企业库
          </button>
        }
      />

      <div className="mx-auto max-w-[1200px] px-4 pb-8">
        {/* 筛选区 */}
        <div className="flex flex-wrap items-center gap-4 border-b border-slate-100 py-4">
          <div className="text-sm font-semibold text-slate-800">基础筛选</div>

          <div className="relative" ref={industryWrapRef}>
            <button
              onClick={() => setIndustryOpen((v) => !v)}
              className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-[#1677ff] hover:text-[#1677ff]"
            >
              <span>{industrySel}</span>
              <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
            </button>
            {industryOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded border border-slate-200 bg-white py-1 shadow-lg">
                {INDUSTRY_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      setIndustrySel(opt)
                      setIndustryOpen(false)
                      setSelected(new Set())
                    }}
                    className={`block w-full px-4 py-2 text-left text-sm hover:bg-slate-50 ${
                      opt === industrySel ? 'text-[#1677ff]' : 'text-slate-700'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 工具栏 */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm text-slate-700">
            找到 <span className="font-semibold text-slate-900">{filtered.length.toLocaleString()}</span> 条结果
            {selected.size > 0 && (
              <span className="ml-2 text-xs text-[#1677ff]">已选择 {selected.size} 家</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="请输入企业名称"
                className="w-56 rounded border border-slate-200 py-1.5 pl-8 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-[#1677ff] focus:outline-none"
              />
              <SearchIcon className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="relative" ref={marketingWrapRef}>
              <button
                onClick={() => setMarketingOpen((v) => !v)}
                className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-[#1677ff] hover:text-[#1677ff]"
              >
                <MarketingIcon className="h-4 w-4" />
                <span>营销</span>
                <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400" />
              </button>
              {marketingOpen && (
                <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded border border-slate-200 bg-white py-1 shadow-lg">
                  <button
                    onClick={addSelected}
                    disabled={selected.size === 0}
                    className={`block w-full px-4 py-2 text-left text-sm ${
                      selected.size === 0 ? 'cursor-not-allowed text-slate-400' : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    加入所选
                  </button>
                  <button
                    onClick={addTop30k}
                    className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  >
                    加入前 3 万条
                  </button>
                </div>
              )}
            </div>

            <button className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-[#1677ff] hover:text-[#1677ff]">
              <ExportIcon className="h-4 w-4" />
              <span>导出</span>
            </button>
          </div>
        </div>

        {/* 表格 */}
        <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-[#f8fafc] text-left text-xs font-medium text-slate-500">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-3.5 w-3.5 rounded border-slate-300 text-[#1677ff] focus:ring-[#1677ff]"
                  />
                </th>
                <th className="px-3 py-3">被投资企业</th>
                <th className="px-3 py-3">
                  <button
                    onClick={() => setSortDesc((v) => !v)}
                    className="flex items-center gap-1 text-[#1677ff]"
                  >
                    被投资次数
                    <SortDownIcon className="h-3 w-3" />
                  </button>
                </th>
                <th className="px-3 py-3">政府机关</th>
                <th className="px-3 py-3">
                  <div className="flex items-center gap-1">
                    政府投资比例
                    <InfoIcon className="h-3.5 w-3.5 text-slate-400" />
                  </div>
                </th>
                <th className="px-3 py-3">引导基金最关注的产业（前三）</th>
                <th className="px-3 py-3">投资机构</th>
                <th className="px-3 py-3">最新商机</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 hover:bg-slate-50/60">
                  <td className="px-3 py-3 align-top">
                    <input
                      type="checkbox"
                      checked={selected.has(row.id)}
                      onChange={() => toggleRow(row.id)}
                      className="h-3.5 w-3.5 rounded border-slate-300 text-[#1677ff] focus:ring-[#1677ff]"
                    />
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex items-start gap-3">
                      <LogoBox text={row.name} color={row.abbrColor} />
                      <div className="min-w-0">
                        <div className="cursor-pointer font-medium text-[#1677ff] hover:underline" title={row.name}>
                          {row.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top text-base font-semibold text-[#1677ff]">
                    {row.investmentCount}
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      {row.agencies.map((a, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                          <BuildingIcon className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-[#1677ff]" />
                          <span className="line-clamp-2" title={a}>{a}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      {row.ratios.map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-xs text-slate-700">
                          <BuildingIcon className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                          <span>{r.toFixed(r < 1 ? 4 : 3)}%</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      {row.industries.map((ind, i) => (
                        <span key={i} className="line-clamp-2 text-xs text-slate-700" title={ind}>{ind}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <div className="flex flex-col gap-1">
                      {row.investors.map((inv, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-xs text-slate-700">
                          <span className="mt-0.5 flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded bg-[#1677ff]/10 text-[10px] font-bold text-[#1677ff]">基</span>
                          <span className="line-clamp-2" title={inv}>{inv}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 align-top">
                    <button
                      onClick={() => setOppOpen(true)}
                      className="rounded bg-[#1677ff]/10 px-2 py-0.5 text-xs font-medium text-[#1677ff] hover:bg-[#1677ff]/20"
                      title="查看商机详情"
                    >
                      拟IPO
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 商机详情弹窗：最新商机列点击 */}
      {oppOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setOppOpen(false) }}
        >
          <div className="w-[760px] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
            {/* 弹窗头部 */}
            <div className="flex items-center justify-between px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="text-lg font-semibold text-slate-800">商机详情：拟IPO–最新进程</span>
                <span className="text-base tracking-[4px] text-blue-500">★★★★★</span>
              </div>
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 text-sm text-slate-800 hover:bg-gray-200">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                  分享
                </button>
                <button
                  onClick={() => setOppOpen(false)}
                  className="text-2xl leading-none text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            {/* 信息表格 */}
            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="w-[22%] border border-slate-200 bg-[#f7f8fc] px-5 py-3.5 text-sm font-semibold text-slate-600">最新进程</td>
                  <td className="w-[28%] border border-slate-200 px-5 py-3.5 text-sm text-slate-900">注册生效</td>
                  <td className="w-[22%] border border-slate-200 bg-[#f7f8fc] px-5 py-3.5 text-sm font-semibold text-slate-600">披露时间</td>
                  <td className="w-[28%] border border-slate-200 px-5 py-3.5 text-sm text-slate-900">2026-07-14</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 bg-[#f7f8fc] px-5 py-3.5 text-sm font-semibold text-slate-600">所属领域</td>
                  <td className="border border-slate-200 px-5 py-3.5 text-sm text-slate-900">软件和信息技术服务业</td>
                  <td className="border border-slate-200 bg-[#f7f8fc] px-5 py-3.5 text-sm font-semibold text-slate-600">拟上市市场</td>
                  <td className="border border-slate-200 px-5 py-3.5 text-sm text-slate-900">上交所科创板</td>
                </tr>
                <tr>
                  <td className="border border-slate-200 bg-[#f7f8fc] px-5 py-3.5 text-sm font-semibold text-slate-600">保荐机构</td>
                  <td className="border border-slate-200 px-5 py-3.5 text-sm text-slate-900">中信证券股份有限公司</td>
                  <td className="border border-slate-200 bg-[#f7f8fc] px-5 py-3.5 text-sm font-semibold text-slate-600">交易市场</td>
                  <td className="border border-slate-200 px-5 py-3.5 text-sm text-slate-900">上交所科创板</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded bg-slate-800 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  )
}
