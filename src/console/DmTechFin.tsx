import { useNavigate } from 'react-router-dom'
import { PageShell } from './PageShell'

/* ============ 图标（等价 HTML：地图/搜索/视图/营销/导出/下拉） ============ */
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

/* ============ 筛选面板（HTML .filter-panel） ============ */
type FilterGroup = { label: string; items: string[]; more?: boolean }
const FILTER_GROUPS: FilterGroup[] = [
  { label: '常用筛选', items: ['省份地区 ▾', '所在行业 ▾'] },
  { label: '科创等级', items: ['不限', 'AAA(3,243)', 'AA(20,816)', 'A(30,000+)', 'BBB(30,000+)', 'BB(30,000+)', 'B(30,000+)', 'CCC(30,000+)', 'CC(30,000+)', 'C(30,000+)', '科创分筛选 ▾'] },
  { label: '科创排名', items: ['不限30,000+', '前20%(30,000+)', '前20%-40%(30,000+)', '前40%-60%(30,000+)', '前60%-80%(30,000+)', '前80%-100%(30,000+)'] },
  { label: '科创认定', items: ['不限', '专精特新', '专精特新小巨人', '科技小巨人', '科技型中小企业', '高新技术企业', '独角兽企业', '潜在独角兽企业', '种子独角兽企业', '未来独角兽企业', '民营科技企业'], more: true },
  { label: '产业链', items: ['新基建 ▾'] },
  { label: '上市信息', items: ['不限', 'A股上市', '新三板', '上交所', '深交所', '科创板', '创业板', '中概股', '新四板', 'A股退市'] },
  { label: '上市进度', items: ['不限', 'IPO辅导', '主板申报中 ▾', '科创板申报中 ▾'] },
  { label: 'PE/VC', items: ['不限', '种子轮', '天使轮', 'Pre-A轮', 'A轮', 'A+轮', 'Pre-B轮', 'B轮', 'B+轮', 'C轮', 'C+轮', 'D轮', 'E轮', 'F轮', '后期阶段(late stage)', '战略投资'], more: true },
  { label: '生命周期', items: ['不限', '种子期', '初创期', '成长期', '成熟期'] },
  { label: '企业规模', items: ['不限', '小型企业', '中型企业', '大型企业', '规模以上企业', '规模以上服务业企业', '规模以上工业企业'] },
  { label: '企业类型', items: ['不限', '外商投资', '中外合资', '外商独资', '港澳台投资', '港澳台和大陆合资', '民营企业', '国有企业', '央企', '事业单位'] },
  { label: '注册资本', items: ['不限', '0-100万', '100-200万', '200-500万', '500-1000万', '100万以上', '200万以上', '500万以上', '1000万以上', '自定义 ▾'] },
  { label: '成立年限', items: ['不限', '1年内', '1-5年', '5-10年', '10-15年', '15年以上', '3年以上', '5年以上', '10年以上', '自定义 ▾'] },
  { label: '经营状态', items: ['不限', '存续', '迁出'] },
  { label: '启信分', items: ['不限', '200-400分', '401-500分', '501-600分', '601-700分', '700分以上', '自定义 ▾'] },
  { label: '经营信息', items: ['商机信息 ▾', '参保人数 ▾'] },
  { label: '经营标签', items: ['资金扩张 ▾', '业务扩张 ▾', '人员扩张 ▾', '地域扩张 ▾', '业务概念 ▾', '技术领先 ▾', '政府扶持和奖励 ▾'] },
]

const HOT_LIBS = ['专精特新', '专精特新小巨人', '科技小巨人', '科技型中小企业', '高新技术企业']

const btnViewCls = 'cursor-pointer rounded border border-[#d1d5e0] bg-white px-3 py-1.5'

export default function DmTechFin() {
  const nav = useNavigate()
  return (
    <div style={{ padding: 12 }} className="bg-white text-sm text-[#222]">
      <PageShell title="科创金融" crumb="数字营销 / 产业金融" subtitle="科创企业专属金融服务：科创企业库与资质画像" legend={false} />

      {/* ============ 顶部搜索 ============ */}
      <div className="mb-2 flex items-center justify-center gap-2">
        <div className="flex w-[440px] items-center rounded-md bg-[#f4f5f9] px-3.5 py-2.5">
          <span className="mr-1 text-[#3670d8]">🗺</span>
          <input placeholder="请输入企业名称、标签、产业等" className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400" />
        </div>
        <button className="cursor-pointer rounded bg-[#f7c43c] px-5 py-2.5 font-medium hover:opacity-90"><SearchIcon /> 查询</button>
      </div>
      <div className="mb-3 text-center">
        <span className="text-[13px] text-[#666]">热门企业库：</span>
        {HOT_LIBS.map((h) => (
          <span key={h} className="mx-1.5 cursor-pointer text-[13px] text-[#2b63e6] hover:underline">{h}</span>
        ))}
      </div>

      {/* ============ 筛选面板 ============ */}
      <div className="rounded-md border border-[#e5e7f0] px-3.5 py-2.5">
        {FILTER_GROUPS.map((g) => (
          <div key={g.label} className="my-1.5 flex flex-wrap items-center leading-7">
            <div className="w-[80px] shrink-0 text-[#444]">{g.label}</div>
            {g.items.map((it) => (
              <span key={it} className="mx-2 cursor-pointer hover:text-[#2b63e6]">{it}</span>
            ))}
            {g.more && <span className="cursor-pointer text-[#2b63e6]">更多 <ArrowDown /></span>}
          </div>
        ))}
      </div>

      {/* ============ 结果栏 ============ */}
      <div className="my-3.5 flex items-center justify-between">
        <div className="text-sm">为您找到30,000+条结果</div>
        <div className="flex gap-2">
          <button className={btnViewCls}>🗏 列表视图</button>
          <button className={btnViewCls}>🗄 表格视图</button>
          <button className={btnViewCls}>🗁 营销</button>
          <button className="cursor-pointer rounded bg-[#f7c43c] px-3.5 py-1.5"><DownloadIcon /> 导出数据</button>
        </div>
      </div>

      {/* ============ 地图分布栏 ============ */}
      <div className="mb-3 flex items-center justify-between rounded-md bg-[#f4f6fc] px-3.5 py-2.5">
        <div className="text-[13px] text-[#444]">🗺 地图分布 *该地图仅展示当前筛选条件下的企业数据</div>
        <div className="cursor-pointer text-[#2b63e6]">展开地图 <ArrowDown /></div>
      </div>

      {/* ============ 企业卡片 ============ */}
      <div className="rounded-md border border-[#e5e7f0] p-3.5">
        <div className="flex items-start gap-2.5">
          <input type="checkbox" className="mt-1" />
          <div className="h-12 w-12 shrink-0 rounded bg-[#3669bc]" />
          <div className="min-w-0 flex-1">
            <div className="mb-1.5 text-[16px] font-bold">
              <span
                className="cursor-pointer hover:text-[#2b63e6]"
                onClick={() => nav(`/console/dm/techfin-detail?name=${encodeURIComponent('中工国际工程股份有限公司')}&back=/console/dm/techfin`)}
              >
                中工国际工程股份有限公司
              </span>
              <span className="ml-2 align-middle">
                <span className="mx-0.5 inline-block rounded border border-[#c9d2e8] px-1.5 py-0.5 text-xs">存续</span>
                <span className="mx-0.5 inline-block rounded border border-[#c9d2e8] px-1.5 py-0.5 text-xs">科创等级 AA</span>
                <span className="mx-0.5 inline-block rounded border border-[#c9d2e8] px-1.5 py-0.5 text-xs">商机线索：商机事件29条</span>
              </span>
            </div>
            <div className="mb-1">
              {['启信分：825分', '发票抬头', '集团', '大型企业(挖掘)', '国有企业', '央企子公司', '国有绝对控股', '园区企业', '行政处罚', '高新技术企业', '标准起草单位', '有商标', '全部标签(35)'].map((t) => (
                <span key={t} className="mx-0.5 my-0.5 inline-block rounded border border-[#c9d2e8] px-1.5 py-0.5 text-xs">{t}</span>
              ))}
            </div>
            <div className="mt-1 text-[13px] text-[#444]">
              主营业务：#建材 #机械设备 #建筑工程承包商 #咨询设计 #国内工程总承包 #国际工程承包 #贸易与服务 #关键核心装备研发与制造 #工程投资与运营
            </div>
          </div>
          <div className="shrink-0">
            <button className="mx-0.5 cursor-pointer rounded border border-[#d1d5e0] bg-white px-2 py-1">PK企业PK</button>
            <button className="mx-0.5 cursor-pointer rounded border border-[#d1d5e0] bg-white px-2 py-1">🗁营销</button>
          </div>
        </div>

        {/* 基础信息网格 */}
        <div className="mt-2.5 grid grid-cols-4 gap-x-1 gap-y-2 text-[13px]">
          <div><label className="text-[#666]">法定代表人</label>：王博镕4</div>
          <div><label className="text-[#666]">成立日期</label>：2001-05-22</div>
          <div><label className="text-[#666]">注册资本</label>：123,740.8937万元人民币</div>
          <div><label className="text-[#666]">注册地址</label>：北京市海淀区丹棱街3号</div>
          <div><label className="text-[#666]">科创资质</label>：高新技术企业</div>
          <div><label className="text-[#666]">国标行业</label>：建筑业 &gt; 土木工程建筑业</div>
          <div><label className="text-[#666]">产业链</label>：储能,节能环保,测量仪器,新能源汽车充电桩…</div>
          <div><label className="text-[#666]">园区</label>：中国电子大厦(中关村)</div>
        </div>
      </div>
    </div>
  )
}
