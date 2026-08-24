import { useState } from 'react'
import { PageShell } from './PageShell'

/* ============ 图标（等价 HTML：查询/下拉/下载） ============ */
const ArrowDown = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-1">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="inline align-middle">
    <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ============ 筛选配置（HTML .filter-row） ============ */
const REPORT_TYPES = ['不限', '其他报告(期货资讯晨会)', '公司研究', '年报季报', '行业研究', '宏观策略', '招股说明书', '管理咨询', '政策法规', '综合其他']
const INDUSTRIES = ['不限', '综合其他', '工业制造', '能源矿产', '金融地产', '科技传媒', '大消费', '健康医疗', '公共服务', '农林牧渔', '交通物流']
const FEATURE_TAGS = ['不限', '新鲜出炉', '非券商', '英文', '深度研究', '热门']

/* ============ 列表样例（首条与 HTML 一致，其余按同结构补充） ============ */
type ReportItem = { title: string; badges: string[]; tags: string[]; meta: string; size: string }
const REPORTS: ReportItem[] = [
  { title: '滨海泰达物流 2026年中期业绩报告', badges: ['新', '英文'], tags: ['滨海泰达物流', '综合其他', '年报季报'], meta: '2026-08-18　共34页　港交所', size: '1M' },
  { title: '中石化炼化工程 2026半年度报告', badges: ['新'], tags: ['中石化炼化工程', '工业制造', '年报季报'], meta: '2026-08-15　共139页　港交所', size: '16M' },
  { title: '2026年中国低空文旅观光行业研究报告', badges: ['新'], tags: ['硕远咨询', '综合其他', '行业研究'], meta: '2026-08-16　共32页　陆家嘴研究院', size: '1M' },
  { title: 'Bangkok & Phuket Hotel Market H1 2026', badges: ['英文'], tags: ['莱坊', '大消费', '行业研究'], meta: '2026-08-15　共8页　莱坊', size: '3M' },
  { title: '预期开始波动——2026年7月金融数据点评', badges: ['新'], tags: ['华创证券', '金融地产', '宏观策略'], meta: '2026-08-13　共14页　华创证券', size: '1M' },
]

function FilterBlock({ label, items, active, onSelect }: { label: string; items: string[]; active: string; onSelect: (t: string) => void }) {
  return (
    <div className="mb-4.5 flex items-center gap-3">
      <div className="w-[90px] shrink-0 text-[17px] font-medium">{label}</div>
      <div>
        {items.map((it) => (
          <span
            key={it}
            onClick={() => onSelect(it)}
            className={`cursor-pointer rounded px-3 py-1 text-[16px] ${active === it ? 'bg-[#e1ecff] text-[#2255bb]' : ''}`}
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  )
}

export default function DmIndustryReport() {
  const [rType, setRType] = useState('不限')
  const [industry, setIndustry] = useState('不限')
  const [tag, setTag] = useState('不限')

  return (
    <div style={{ padding: 24 }} className="text-sm text-[#333]">
      <PageShell title="行业研报" crumb="数字营销 / 金融工具" subtitle="行业研究报告库：检索、订阅与解读" legend={false} />

      {/* ============ 搜索栏 ============ */}
      <div className="mb-8 flex justify-center">
        <input
          placeholder="请输入报告名称、公司简称、发布机构等关键词"
          className="h-14 w-[600px] rounded-l-md border border-[#e8e8f0] bg-[#f5f5fa] px-5 text-[16px] outline-none placeholder:text-gray-400"
        />
        <button className="h-14 w-[110px] cursor-pointer rounded-r-md bg-[#1677ff] text-[16px] hover:opacity-90">
          ⵠ 查询
        </button>
      </div>

      {/* ============ 筛选区 ============ */}
      <div className="border-t border-[#eee] pt-4">
        <FilterBlock label="报告类型" items={REPORT_TYPES} active={rType} onSelect={setRType} />
        <div className="my-3 border-b border-dashed border-[#eee]" />
        <FilterBlock label="行业分类" items={INDUSTRIES} active={industry} onSelect={setIndustry} />
        <div className="my-3 border-b border-dashed border-[#eee]" />
        <FilterBlock label="特色标签" items={FEATURE_TAGS} active={tag} onSelect={setTag} />

        {/* 更多筛选 */}
        <div className="my-5 flex items-center gap-3">
          <div className="w-[90px] shrink-0 text-[17px] font-medium">更多筛选</div>
          {['发布时间', '报告页数', '发布机构'].map((d) => (
            <span key={d} className="flex cursor-pointer items-center gap-1 text-[16px]">
              {d} <ArrowDown />
            </span>
          ))}
        </div>
      </div>

      {/* ============ 结果统计行 ============ */}
      <div className="mb-4 mt-6 flex items-center justify-between text-[17px] text-[#444]">
        <span>找到1693825条结果</span>
        <span className="cursor-pointer select-none">发布时间 ▲</span>
      </div>

      {/* ============ 列表 ============ */}
      {REPORTS.map((r) => (
        <div key={r.title} className="flex items-center justify-between border-t border-[#e9e9ee] py-3.5">
          <div>
            <div className="mb-2 text-[17px]">
              {r.title}
              {r.badges.map((b) => (
                <span key={b} className={`mx-1 inline-block rounded-md px-2 py-0.5 text-[13px] ${b === '新' ? 'bg-[#e8f8d8]' : 'bg-[#d8e8ff]'}`}>
                  {b}
                </span>
              ))}
            </div>
            <div>
              {r.tags.map((t) => (
                <span key={t} className="mr-1.5 inline-block rounded bg-[#e8edff] px-2.5 py-0.5 text-sm">{t}</span>
              ))}
              <span className="text-[15px] text-[#666]">{r.meta}</span>
            </div>
          </div>
          <button className="flex cursor-pointer items-center gap-1.5 rounded border border-[#bbb] bg-white px-5 py-2 text-sm hover:bg-gray-50">
            <DownloadIcon /> {r.size}
          </button>
        </div>
      ))}
    </div>
  )
}
