import { PageShell } from './PageShell'

/* ============ 图标（等价 HTML：查询/营销/导出/下拉） ============ */
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="inline">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
    <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="inline align-middle">
    <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ArrowDown = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-1">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ============ 样例数据（与 HTML 逐行一致） ============ */
const ROWS = [
  { supplier: '深圳市德晟达电子科技有限公司', rel: '供应商', score: '701', founded: '2013-03-27', region: '广东省深圳市南山区', type: '有限责任公司', pub: '2014-12-31', source: '招股意向书' },
  { supplier: '北京山天大蓄知识产权科技服务集团股份有限公司', rel: '供应商', score: '376', founded: '2011-12-29', region: '北京市顺义区', type: '股份有限公司', pub: '2021-12-31', source: '供应商公告' },
  { supplier: '广州无线电集团有限公司', rel: '供应商', score: '828', founded: '1981-02-02', region: '广东省广州市天河区', type: '国有企业、有限责任公司', pub: '2017-04-20', source: '招投标' },
  { supplier: '上海协度电子科技有限公司', rel: '供应商', score: '402', founded: '2010-04-29', region: '上海市浦东新区', type: '有限责任公司', pub: '2016-06-30', source: '招股意向书' },
  { supplier: '路必康(香港)电子技术有限公司', rel: '供应商', score: '−', founded: '2017-11-30', region: '香港特别行政区', type: '−', pub: '2023-12-31', source: '年度报告' },
]

const thCls = 'bg-[#f5f6fa] px-2.5 py-3 text-left text-[15px] font-medium'
const tdCls = 'border-b border-[#e9ebf0] px-2.5 py-3.5 text-[15px]'
const LinkBlue = ({ children }: { children: React.ReactNode }) => (
  <span className="cursor-pointer text-[#2b65e8]">{children}</span>
)

export default function DmSupplyChain() {
  return (
    <div style={{ padding: 16 }} className="bg-white text-sm text-[#222]">
      <PageShell title="供应链" crumb="数字营销 / 商机挖掘" subtitle="产业链上下游企业挖掘与供应链金融商机识别" legend={false} />

      {/* ============ 搜索区域 ============ */}
      <div className="mb-8 flex items-center justify-center gap-3">
        <input
          defaultValue="广州视源电子科技股份有限公司"
          className="w-[520px] rounded-md bg-[#f5f6fa] px-4 py-3 text-[16px] outline-none"
        />
        <button className="cursor-pointer rounded bg-[#f7c548] px-7 py-3 text-[16px] hover:opacity-90"><SearchIcon /> 查询</button>
        <span className="cursor-pointer text-[16px] text-[#334155]">批量查询</span>
      </div>

      {/* ============ 筛选栏 ============ */}
      <div className="mb-4 flex items-center gap-9 bg-[#f5f6fa] px-4 py-3.5">
        <span className="cursor-pointer text-[16px] font-medium">基础信息</span>
        {['启信分', '企业关系', '成立时间', '省份地区', '企业类型'].map((f) => (
          <span key={f} className="flex cursor-pointer items-center gap-1 text-[16px]">
            {f} <ArrowDown />
          </span>
        ))}
      </div>

      {/* ============ 顶部操作栏 ============ */}
      <div className="mb-2.5 flex items-center justify-between">
        <div className="text-[16px]">
          找到 <span className="text-[#238b23]">43</span> 条结果
        </div>
        <div className="flex items-center gap-4">
          <input placeholder="查询/上传企业" className="rounded border border-[#b8bcc8] px-3 py-2 text-[15px] outline-none placeholder:text-gray-400" />
          <button className="cursor-pointer rounded border border-[#b8bcc8] bg-white px-5 py-2 text-[15px] hover:bg-gray-50">🗁 营销 <ArrowDown /></button>
          <button className="cursor-pointer rounded border border-[#b8bcc8] bg-white px-5 py-2 text-[15px] hover:bg-gray-50"><DownloadIcon /> 导出</button>
        </div>
      </div>

      {/* ============ 表格 ============ */}
      <div className="overflow-x-auto"><table className="w-full border-collapse">
        <thead>
          <tr>
            <th className={thCls}><input type="checkbox" /></th>
            <th className={thCls}>供应商/客户</th>
            <th className={thCls}>查询/上传企业</th>
            <th className={thCls}>企业关系</th>
            <th className={thCls}>启信分</th>
            <th className={thCls}>成立时间</th>
            <th className={thCls}>地区</th>
            <th className={thCls}>企业类型</th>
            <th className={thCls}>公开时间</th>
            <th className={thCls}>数据来源</th>
            <th className={thCls}>操作</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r.supplier} className="transition hover:bg-[#fafbfc]">
              <td className={tdCls}><input type="checkbox" /></td>
              <td className={tdCls}><LinkBlue>{r.supplier}</LinkBlue></td>
              <td className={tdCls}>广州视源电子科技股份有限公司</td>
              <td className={tdCls}>{r.rel}</td>
              <td className={tdCls}>{r.score}</td>
              <td className={tdCls}>{r.founded}</td>
              <td className={tdCls}>{r.region}</td>
              <td className={tdCls}>{r.type}</td>
              <td className={tdCls}>{r.pub}</td>
              <td className={tdCls}>{r.source}</td>
              <td className={tdCls}><LinkBlue>企业尽调</LinkBlue></td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </div>
  )
}
