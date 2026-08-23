import { useState } from 'react'
import { PageShell } from './PageShell'
import { usePageNav } from './pageNav'
import { RightDrawer } from '../components/ui'

/* ============ 图标（系统未引入 FontAwesome，按 HTML 视觉等价替换为内联 SVG） ============ */
const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-1">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="inline align-middle">
    <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="inline align-middle">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
    <path d="m11 11 3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)
const InfoIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline align-middle">
    <circle cx="8" cy="8" r="6.2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 7.2v3.4M8 5.2v.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
)

/* ============ 主 Tab 配置（HTML .main-tabs） ============ */
const MAIN_TABS = ['债券公告', '债券审批', '债券发行', '债券违约', '债券承销', '债券担保']

/* ============ 审批内部子 Tab ============ */
const APPROVE_SUBS = ['发债审核进程', '企业债审批', 'DCM注册进程']

/* ============ 通用小组件 ============ */
function SearchRow({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div className="mb-3 flex items-center gap-2.5">
      <span className="font-bold text-[15px]">{label}</span>
      <input
        placeholder={placeholder}
        className="w-[340px] rounded-md border border-[#e2e2eb] bg-[#f7f7fc] px-3 py-2.5 text-sm outline-none placeholder:text-gray-400"
      />
      <button className="flex items-center gap-1 rounded-md bg-[#2563EB] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
        <SearchIcon /> 搜索
      </button>
    </div>
  )
}
function FilterRow({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="mb-3.5 flex flex-wrap items-center gap-7 border-b border-dashed border-[#ddd] py-2.5">
      <span className="font-bold text-[15px]">{label}</span>
      {items.map((it) => (
        <span key={it} className="flex cursor-pointer items-center gap-1 text-[#333]">
          {it} <ChevronDown />
        </span>
      ))}
    </div>
  )
}
function TagGroup({ label, tags, active, onChange }: { label: string; tags: string[]; active: string; onChange: (t: string) => void }) {
  return (
    <div className="mb-2 flex flex-wrap items-center gap-3">
      <span className="font-bold text-[15px]">{label}</span>
      <div className="flex flex-wrap gap-3">
        {tags.map((t) => (
          <span
            key={t}
            onClick={() => onChange(t)}
            className={`cursor-pointer rounded px-2.5 py-1 ${active === t ? 'bg-[#e8f0ff] text-[#2b65e8]' : ''}`}
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}
function TagSmall({ children }: { children: React.ReactNode }) {
  return (
    <span className="mx-1 inline-block rounded border border-[#c9d8ff] px-1.5 py-0.5 text-xs text-[#2b4899]">{children}</span>
  )
}
function ResultCount({ n, color = '#278027' }: { n: string; color?: string }) {
  return (
    <div className="my-3 text-sm text-[#444]">
      找到<span style={{ color }} className="mx-0.5 font-medium">{n}</span>条结果
    </div>
  )
}
const LinkBlue = ({ children }: { children: React.ReactNode }) => (
  <span className="cursor-pointer text-[#2b65e8]">{children}</span>
)

/* ============ 表格通用样式（等价 HTML table） ============ */
const thCls = 'border border-[#eee] bg-[#f7f7fc] px-2.5 py-3 text-left font-medium text-[#333]'
const tdCls = 'border-b border-dashed border-[#e8e8ee] px-2.5 py-3 align-middle'

/* ============ 样例数据（与 HTML 逐行一致） ============ */
/* Tab1 债券公告 */
const ANNOUNCE_ROWS = [
  {
    company: '招商局港口集团股份有限公司',
    bond: '25招港K1',
    content: '25招港K1:2025年面向专业投资者公开发行科技创新公司债券(第一期)(品种一)2026年付息公告',
    source: '深交所‑债券',
    date: '2026-08-21',
  },
  {
    company: '安徽应流机电股份有限公司',
    bond: '-',
    content: '应流股份:应流股份2026年度第二期科技创新债券发行结果公告',
    source: '上海交易所',
    date: '2026-08-21',
  },
  {
    company: '大唐国际发电股份有限公司',
    bond: '-',
    content: '大唐发电:大唐发电关于中期票据发行的公告',
    source: '上海交易所',
    date: '2026-08-21',
  },
  {
    company: '无锡派克新材料科技股份有限公司',
    bond: '-',
    content: '派克新材:派克新材向不特定对象发行可转换公司债券上市公告书',
    source: '上海交易所',
    date: '2026-08-21',
  },
]

/* Tab2 发债审核进程 */
const APPROVE_ROWS = [
  {
    bond: '和县城市建设投资有限责任公司2021年面向专业投资者非公开发行公司债券',
    amount: '8亿',
    issuer: '和县城市建设投资有限责任公司',
    issuerTag: 'ⓘ历史发行项目',
    status: '已受理',
    lead: '开源证券股份有限公司',
    leadTag: 'ⓘ历史项目',
    date: '2021-12-31',
  },
  {
    bond: '宿州马鞍山投资集团(控股)有限公司2021年非公开发行公司债券',
    amount: '10亿',
    issuer: '宿州马鞍山投资集团(控股)有限公司',
    issuerTag: 'ⓘ历史发行项目',
    status: '已反馈',
    lead: '华安证券股份有限公司',
    leadTag: 'ⓘ历史项目',
    date: '2021-12-31',
  },
]

/* Tab3 债券发行 */
const ISSUE_ROWS = [
  {
    bond: '2026年记账式贴现(五十四期)国债',
    tags: ['国债', '上交所'],
    lead: '主承销商 −',
    issuer: '中华人民共和国财政部',
    amount: '300.00亿',
    rate: '-',
    term: '0.2493年',
    grade: '-',
    start: '2026-08-26',
    end: '2026-08-26',
  },
  {
    bond: '2026年吉林省土地储备专项债券(一期)-2026年吉林省政府专项债券(十四期)',
    tags: ['地方政府债', '深交所'],
    lead: '主承销商 −',
    issuer: '吉林省人民政府',
    amount: '6.19亿',
    rate: '-',
    term: '5年',
    grade: '-',
    start: '2026-08-26',
    end: '2026-08-26',
  },
]

/* Tab4 债券违约 */
const DEFAULT_ROWS = [
  { date: '2026-07-30', bond: '20荣盛地产MTN001', issuer: '荣盛房地产发展股份有限公司', type: '未按时足额兑付', content: '主承销商关于荣盛房地产发展股份有限公司2020年度第一期中期票据未按期足额兑付的进展公告(2026年7月)' },
  { date: '2026-07-30', bond: '20荣盛地产MTN002', issuer: '荣盛房地产发展股份有限公司', type: '未按时足额兑付', content: '主承销商关于荣盛房地产发展股份有限公司2020年度第二期中期票据未按期足额兑付的进展公告(2026年7月)' },
  { date: '2026-07-30', bond: '20荣盛地产MTN003', issuer: '荣盛房地产发展股份有限公司', type: '未按时足额兑付', content: '荣盛房地产发展股份有限公司关于"20荣盛地产MTN003"未按期足额兑付本金的处置进展公告(2026年7月)' },
  { date: '2026-07-30', bond: '20荣盛地产MTN003', issuer: '荣盛房地产发展股份有限公司', type: '未按时足额兑付', content: '主承销商关于荣盛房地产发展股份有限公司2020年度第三期中期票据未按期足额兑付的进展公告(2026年7月)' },
]

/* Tab5 债券承销 */
const UNDERWRITE_ROWS = [
  { idx: 1, name: '中信证券股份有限公司', count: 1155 },
  { idx: 2, name: '中信建投证券股份有限公司', count: 1117 },
  { idx: 3, name: '国泰海通证券股份有限公司', count: 1100 },
  { idx: 4, name: '中信银行股份有限公司', count: 629 },
  { idx: 5, name: '兴业银行股份有限公司', count: 621 },
]

/* Tab6 债券担保 */
const GUARANTEE_ROWS = [
  { company: '上海陆家嘴金融发展有限公司', bond: '23LJZ优', type: '券商专项资产管理', guarantor: '上海陆家嘴金融贸易区开发股份有限公司', start: '2041-06-06/-', way: '质押担保', surety: '-', market: '上海证券交易所' },
  { company: '上海陆家嘴金融发展有限公司', bond: '23LJZ优', type: '券商专项资产管理', guarantor: '上海陆家嘴金融贸易区开发股份有限公司', start: '2041-06-06/-', way: '抵押担保', surety: '-', market: '上海证券交易所' },
]

/* Tab2 进程明细（查看弹窗 + 里程碑节点时间轴） */
const APPROVE_DETAIL = {
  bond: '和县城市建设投资有限责任公司2021年面向专业投资者非公开发行公司债券',
  issuer: '和县城市建设投资有限责任公司',
  amount: '8亿',
  lead: '开源证券股份有限公司',
  status: '已受理',
  milestones: [
    { date: '2021-09-10', node: '项目受理', done: true, desc: '发行人提交申请材料，交易所正式受理' },
    { date: '2021-10-15', node: '反馈意见', done: true, desc: '收到审核反馈意见，要求补充说明' },
    { date: '2021-11-20', node: '反馈回复', done: true, desc: '主承销商提交反馈意见回复' },
    { date: '2021-12-31', node: '已受理', done: true, desc: '审核通过，项目状态更新为已受理' },
    { date: '2022-03-01', node: '注册生效', done: false, desc: '待发行注册' },
    { date: '—', node: '发行完成', done: false, desc: '尚未发行' },
  ],
}

export default function DmBond() {
  const { goDetail } = usePageNav()
  const [tab, setTab] = useState('债券公告')
  const [sub, setSub] = useState('发债审核进程')
  /* Tab3/5/6 tag 选中态 */
  const [issueState, setIssueState] = useState('全部')
  const [uwType, setUwType] = useState('不限')
  const [uwYear, setUwYear] = useState('2025')
  const [uwPeriod, setUwPeriod] = useState('年度')
  const [guMarket, setGuMarket] = useState('不限')
  const [guBondType, setGuBondType] = useState('不限')
  const [guWay, setGuWay] = useState('不限')
  const [approveOpen, setApproveOpen] = useState(false)

  return (
    <div style={{ padding: 24, maxWidth: 2400, margin: '0 auto' }}>
      <PageShell title="债券数据" crumb="数字营销 / 金融工具" subtitle="债券发行、存续期与违约风险数据" legend={false} />

      {/* ============ 顶层主 Tab ============ */}
      <div className="mb-4 flex gap-8 border-b border-[#e5e7eb]">
        {MAIN_TABS.map((t) => (
          <span
            key={t}
            onClick={() => setTab(t)}
            className={`relative cursor-pointer select-none py-2.5 pr-1 text-[15px] ${
              tab === t ? 'font-medium text-[#111]' : 'text-[#666]'
            }`}
          >
            {t}
            {tab === t && <span className="absolute -bottom-px left-0 h-[3px] w-full bg-[#2563EB]" />}
          </span>
        ))}
      </div>

      {/* ============ Tab1 债券公告 ============ */}
      {tab === '债券公告' && (
        <div>
          <SearchRow label="高级搜索" placeholder="输入公告关键字/企业名称" />
          <div className="mb-5 ml-2 mt-1.5">
            <span className="text-[13px] text-[#666]">试一下：</span>
            {['募集说明书', '发行结果', '付息兑付', '评级报告', '持有人会议'].map((h) => (
              <LinkBlue key={h}><span className="mx-1.5 text-[13px]">{h}</span></LinkBlue>
            ))}
          </div>
          <FilterRow label="基本筛选" items={['债券类型', '地区', '发布主体', '公告日期']} />
          <ResultCount n="4656011" />
          <div className="overflow-x-auto"><table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}>企业名称</th>
                <th className={thCls}>债券简称</th>
                <th className={thCls}>公告内容</th>
                <th className={thCls}>公告日期</th>
              </tr>
            </thead>
            <tbody>
              {ANNOUNCE_ROWS.map((r) => (
                <tr key={r.company + r.date} className="odd:bg-white even:bg-[#f8f8fe]">
                  <td className={tdCls}>
                    <span
                      className="cursor-pointer text-[#2b65e8] hover:underline"
                      onClick={() => goDetail('/console/dm/ent-archive-basic', { name: r.company })}
                    >
                      {r.company}
                    </span>
                  </td>
                  <td className={tdCls}>{r.bond}</td>
                  <td className={tdCls}>
                    {r.content}
                    <br />
                    <span className="text-[#555]">{r.source}</span>
                  </td>
                  <td className={tdCls}>{r.date}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* ============ Tab2 债券审批 ============ */}
      {tab === '债券审批' && (
        <div>
          <div className="mb-4 flex gap-6">
            {APPROVE_SUBS.map((s) => (
              <span
                key={s}
                onClick={() => setSub(s)}
                className={`cursor-pointer rounded-md px-3 py-2 text-sm ${
                  sub === s ? 'bg-[#e8f0ff] text-[#2b65e8]' : 'text-[#444]'
                }`}
              >
                {s}
              </span>
            ))}
          </div>

          {sub === '发债审核进程' && (
            <div>
              <SearchRow label="搜索" placeholder="输入债券/发行人等关键词搜索" />
              <FilterRow label="筛选" items={['交易市场', '债券年份', '项目状态', '省份地区', '所在行业']} />
              <div className="flex items-center justify-between">
                <ResultCount n="18593" />
                <button className="mb-2 flex cursor-pointer items-center gap-1.5 rounded-md border border-[#bbb] bg-white px-3.5 py-1.5 text-sm">
                  <DownloadIcon /> 下载前500条
                </button>
              </div>
              <div className="overflow-x-auto"><table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className={thCls}>债券名称</th>
                    <th className={thCls}>拟发行金额</th>
                    <th className={thCls}>发行人</th>
                    <th className={thCls}>项目状态</th>
                    <th className={thCls}>主承销商</th>
                    <th className={thCls}>最新更新日期</th>
                    <th className={thCls}>进程</th>
                  </tr>
                </thead>
                <tbody>
                  {APPROVE_ROWS.map((r) => (
                    <tr key={r.bond} className="odd:bg-white even:bg-[#f8f8fe]">
                      <td className={tdCls}>{r.bond}</td>
                      <td className={tdCls}>{r.amount}</td>
                      <td className={tdCls}>
                        <span
                          className="cursor-pointer text-[#2b65e8] hover:underline"
                          onClick={() => goDetail('/console/dm/ent-archive-basic', { name: r.issuer })}
                        >
                          {r.issuer}
                        </span>
                        <br />
                        <TagSmall><InfoIcon />{r.issuerTag}</TagSmall>
                      </td>
                      <td className={tdCls}>{r.status}</td>
                      <td className={tdCls}>
                        {r.lead} <TagSmall><InfoIcon />{r.leadTag}</TagSmall>
                      </td>
                      <td className={tdCls}>{r.date}</td>
                      <td className={tdCls}><LinkBlue><span onClick={() => setApproveOpen(true)}>查看</span></LinkBlue></td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
          )}
          {sub === '企业债审批' && <div className="py-8 text-center text-sm text-gray-400">企业债审批面板占位</div>}
          {sub === 'DCM注册进程' && <div className="py-8 text-center text-sm text-gray-400">DCM注册进程面板占位</div>}
        </div>
      )}

      {/* ============ Tab3 债券发行 ============ */}
      {tab === '债券发行' && (
        <div>
          <SearchRow label="高级搜索" placeholder="请输入企业名称/债券名称" />
          <TagGroup label="发行状态" tags={['全部', '等待发行', '正在发行', '已完成发行']} active={issueState} onChange={setIssueState} />
          <FilterRow label="基本筛选" items={['交易市场', '债券类型', '年份', '债项评级']} />
          <ResultCount n="516066" />
          <div className="overflow-x-auto"><table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}>债券名称</th>
                <th className={thCls}>发行规模</th>
                <th className={thCls}>票面利率</th>
                <th className={thCls}>债券期限</th>
                <th className={thCls}>债项评级</th>
                <th className={thCls}>发行起始日</th>
                <th className={thCls}>发行截止日</th>
              </tr>
            </thead>
            <tbody>
              {ISSUE_ROWS.map((r) => (
                <tr key={r.bond} className="odd:bg-white even:bg-[#f8f8fe]">
                  <td className={tdCls}>
                    <span
                      className="cursor-pointer text-[#2b65e8] hover:underline"
                      onClick={() => goDetail('/console/dm/bond-detail', { name: r.bond, issuer: r.issuer })}
                    >
                      {r.bond}
                    </span>
                    {r.tags.map((t) => <TagSmall key={t}>{t}</TagSmall>)}
                    <br />
                    <span className="text-[#555]">{r.lead}</span>
                    <br />
                    <b>{r.issuer}</b>
                    <br />
                    <span className="text-[#555]">发行人</span>
                  </td>
                  <td className={`${tdCls} text-xl font-bold text-[#f28028]`}>{r.amount}</td>
                  <td className={tdCls}>{r.rate}</td>
                  <td className={tdCls}>{r.term}</td>
                  <td className={tdCls}>{r.grade}</td>
                  <td className={tdCls}>{r.start}</td>
                  <td className={tdCls}>{r.end}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* ============ Tab4 债券违约 ============ */}
      {tab === '债券违约' && (
        <div>
          <SearchRow label="高级搜索" placeholder="请输入企业名称" />
          <FilterRow label="更多筛选" items={['公告日期', '省份地区']} />
          <ResultCount n="1857" />
          <div className="overflow-x-auto"><table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}>公告日期</th>
                <th className={thCls}>债券名称</th>
                <th className={thCls}>发行人</th>
                <th className={thCls}>违约类型</th>
                <th className={thCls}>公告内容</th>
              </tr>
            </thead>
            <tbody>
              {DEFAULT_ROWS.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-[#f8f8fe]">
                  <td className={tdCls}>{r.date}</td>
                  <td className={tdCls}>{r.bond}</td>
                  <td className={tdCls}>
                    <span
                      className="cursor-pointer text-[#2b65e8] hover:underline"
                      onClick={() => goDetail('/console/dm/ent-archive-basic', { name: r.issuer })}
                    >
                      {r.issuer}
                    </span>
                  </td>
                  <td className={tdCls}>{r.type}</td>
                  <td className={tdCls}>{r.content}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* ============ Tab5 债券承销 ============ */}
      {tab === '债券承销' && (
        <div>
          <SearchRow label="高级搜索" placeholder="请输入承销商名称" />
          <TagGroup
            label="债券类型"
            tags={['不限', '同业存单', '地方政府债', '公司债', '超短期融资券', '券商专项资产管理', '中期票据', '短期融资券', '企业债', '政策性银行债', '定向工具', '其他']}
            active={uwType}
            onChange={setUwType}
          />
          <TagGroup label="年　份" tags={['2026', '2025', '2024', '2023', '2022']} active={uwYear} onChange={setUwYear} />
          <TagGroup label="报告期" tags={['年度', '上半年', '下半年', '一季度', '二季度', '三季度', '四季度']} active={uwPeriod} onChange={setUwPeriod} />
          <div className="my-3 text-sm text-[#444]">
            当前承销商企业共计<span style={{ color: '#278027' }} className="mx-0.5 font-medium">986</span>家
          </div>
          <div className="overflow-x-auto"><table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}>序号</th>
                <th className={thCls}>承销商</th>
                <th className={thCls}>承销只数</th>
                <th className={thCls}>操作</th>
              </tr>
            </thead>
            <tbody>
              {UNDERWRITE_ROWS.map((r) => (
                <tr key={r.idx} className="odd:bg-white even:bg-[#f8f8fe]">
                  <td className={tdCls}>{r.idx}</td>
                  <td className={tdCls}>{r.name}</td>
                  <td className={tdCls}>{r.count}</td>
                  <td className={tdCls}><LinkBlue>查看承销详情</LinkBlue></td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* ============ Tab6 债券担保 ============ */}
      {tab === '债券担保' && (
        <div>
          <SearchRow label="高级搜索" placeholder="请输入债券代码/简称/发债人/担保人" />
          <TagGroup
            label="交易市场"
            tags={['不限', '上海证券交易所', '中国银行间市场', '深圳证券交易所', '浙江股权交易中心', '天津股权交易所', '江苏股权交易中心', '机构间市场']}
            active={guMarket}
            onChange={setGuMarket}
          />
          <div className="mb-2 ml-2 -mt-1"><LinkBlue>更多 <ChevronDown /></LinkBlue></div>
          <TagGroup
            label="债券类型"
            tags={['不限', '公司债', '券商专项资产管理', '企业债', '中期票据', '定向工具', '超短期融资券', '可交换债券', '资产支持票据', '可转换债券', '短期融资券']}
            active={guBondType}
            onChange={setGuBondType}
          />
          <div className="mb-2 ml-2 -mt-1"><LinkBlue>更多 <ChevronDown /></LinkBlue></div>
          <TagGroup
            label="担保方式"
            tags={['不限', '保证担保', '抵押担保', '留置担保', '信用担保', '质押担保', '抵押担保和质押担保', '其他', '个人担保', '第三方担保和质押担保']}
            active={guWay}
            onChange={setGuWay}
          />
          <div className="my-3 flex items-center justify-between">
            <div className="text-sm text-[#444]">
              当前企业数 <span style={{ color: '#d04020' }} className="font-bold">29,022</span>
            </div>
            <div className="flex gap-3">
              <button className="cursor-pointer rounded-md border border-[#ddd] bg-white px-4 py-2 text-sm">＋批量添加</button>
              <button className="flex cursor-pointer items-center gap-1.5 rounded-md bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
                <DownloadIcon /> 下载
              </button>
            </div>
          </div>
          <div className="overflow-x-auto"><table className="w-full border-collapse">
            <thead>
              <tr>
                <th className={thCls}></th>
                <th className={thCls}>企业名称</th>
                <th className={thCls}>债券信息</th>
                <th className={thCls}>债券类型</th>
                <th className={thCls}>担保人</th>
                <th className={thCls}>担保起始时间</th>
                <th className={thCls}>担保方式</th>
                <th className={thCls}>保证方式</th>
                <th className={thCls}>市场</th>
              </tr>
            </thead>
            <tbody>
              {GUARANTEE_ROWS.map((r, i) => (
                <tr key={i} className="odd:bg-white even:bg-[#f8f8fe]">
                  <td className={tdCls}><input type="checkbox" /></td>
                  <td className={tdCls}>
                    <span
                      className="cursor-pointer text-[#2b65e8] hover:underline"
                      onClick={() => goDetail('/console/dm/ent-archive-basic', { name: r.company })}
                    >
                      {r.company}
                    </span>
                  </td>
                  <td className={tdCls}>{r.bond}</td>
                  <td className={tdCls}>{r.type}</td>
                  <td className={tdCls}>{r.guarantor}</td>
                  <td className={tdCls}>{r.start}</td>
                  <td className={tdCls}>{r.way}</td>
                  <td className={tdCls}>{r.surety}</td>
                  <td className={tdCls}>{r.market}</td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}

      {/* 进程查看弹窗（里程碑节点时间轴） */}
      <RightDrawer open={approveOpen} onClose={() => setApproveOpen(false)} title="审核进程" width={560}>
        <div className="px-1">
          <div className="mb-4 rounded-md bg-[#f7f8fc] p-4">
            <div className="mb-2 text-[15px] font-semibold text-[#111]">{APPROVE_DETAIL.bond}</div>
            <div className="grid grid-cols-2 gap-y-1.5 text-sm text-[#444]">
              <div>发行人：{APPROVE_DETAIL.issuer}</div>
              <div>拟发行金额：{APPROVE_DETAIL.amount}</div>
              <div>主承销商：{APPROVE_DETAIL.lead}</div>
              <div>当前状态：<span className="font-medium text-[#278027]">{APPROVE_DETAIL.status}</span></div>
            </div>
          </div>
          <div className="mb-3 text-[15px] font-semibold text-[#111]">里程碑节点</div>
          <div className="relative pl-6">
            <div className="absolute left-[7px] top-1 bottom-1 w-px bg-[#d8dbe6]" />
            {APPROVE_DETAIL.milestones.map((m, i) => (
              <div key={i} className="relative mb-5 last:mb-0">
                <span
                  className={`absolute -left-6 top-1 h-3.5 w-3.5 rounded-full border-2 ${
                    m.done ? 'border-[#278027] bg-[#278027]' : 'border-[#c0c4cc] bg-white'
                  }`}
                />
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#111]">{m.node}</span>
                  <span className="text-xs text-[#999]">{m.date}</span>
                </div>
                <div className="mt-0.5 text-xs text-[#666]">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </RightDrawer>
    </div>
  )
}
