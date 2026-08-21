import { useState } from 'react'
import { PageShell } from './PageShell'

/* 科创金融 · 企业详情 · 企业概览
 * 按 record/科创金融 - 企业详情 - 企业概览.html 整页重写（原 qixinRuntime 注入方案废弃）。
 * 7 个大 tab 保留；本次落地「企业概览」tab 全量内容，其余 6 tab 待用户提供快照后填充。
 */

/* ============ 大 Tab（HTML .main-tabs） ============ */
const DETAIL_TABS = ['企业概览', '科创能力分析', '科创成果分析', '科研团队分析', '荣誉资质', '资产分析', '风险分析']

/* ============ 图标（等价 HTML 文本箭头） ============ */
const ArrowDown = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-1">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ============ 通用小组件 ============ */
function ModuleTitle({ title, fold, extra }: { title: React.ReactNode; fold?: string; extra?: React.ReactNode }) {
  return (
    <div className="mb-2.5 flex items-center justify-between">
      <span className="text-sm font-bold">{title}</span>
      {extra}
      {fold && <span className="cursor-pointer text-xs text-[#2762e8]">{fold}</span>}
    </div>
  )
}
function ChartPlaceholder({ text }: { text: string }) {
  return (
    <div className="my-2 flex h-[160px] w-full items-center justify-center rounded border border-dashed border-[#dde1ee] bg-[#f8f9fc] text-xs text-gray-400">
      {text}
    </div>
  )
}

const thCls = 'border border-[#e4e7f1] bg-[#f3f5fc] px-1.5 py-2 text-left text-xs'
const tdCls = 'border border-[#e4e7f1] px-1.5 py-2 text-xs'

/* ============ 启信指数（环形指标，HTML .index-row） ============ */
const INDEXES = [
  { val: '88分', label: '科创分', desc: '优秀，科创等级AA', danger: false },
  { val: '825分', label: '启信分', desc: '优秀，行业排名前5%', danger: false },
  { val: '0分', label: '空壳指数', desc: '风险低，空壳等级:L1', danger: false },
  { val: '0分', label: '合同违约指数', desc: '风险低，暂无数据', danger: false },
  { val: '2%', label: '司法风险', desc: '风险低，涉诉数量:4，涉诉金额：59.22万元', danger: false },
  { val: '!!', label: '债务指数', desc: '风险高，融资债务：270313.91万元', danger: true },
]

export default function DmTechFinDetail() {
  const [tab, setTab] = useState('企业概览')

  return (
    <div style={{ padding: 12 }} className="min-h-screen bg-[#f7f8fc] text-[13px] leading-relaxed text-[#222]">
      <PageShell title="科创企业详情" crumb="数字营销 / 产业金融 / 科创金融" legend={false} />

      {/* ============ 头部企业信息 ============ */}
      <div className="mb-2.5 rounded-md bg-white px-4 py-3.5">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="mr-2 inline-block text-lg font-bold">中工国际工程股份有限公司</h1>
            <span className="inline-block rounded border border-[#73c98b] px-1.5 py-0.5 text-xs text-[#20883e]">存续</span>
            <span className="ml-2 cursor-pointer text-[#2762e8]">完整企业详情<ArrowDown /></span>
            <div className="mt-1.5 text-xs text-[#555]">
              科创等级<span className="text-[#f3a226]">AA</span> · 商机事件29条 · 关联商机2480条
            </div>
          </div>
          <div className="flex gap-2">
            {['AI触达', '查看触客指引报告', 'PK企业PK', '营销'].map((b) => (
              <button key={b} className="cursor-pointer rounded border border-[#d3d8e4] bg-white px-2.5 py-1 text-xs hover:bg-gray-50">{b}</button>
            ))}
          </div>
        </div>
        {/* 四栏集团信息 */}
        <div className="mt-3 grid grid-cols-4 gap-3">
          {[
            { title: '集团信息', val: '成员4256｜对外投资838' },
            { title: '上市', val: '深交所主板A股 002051｜总市值102.17亿' },
            { title: '所在园区', val: '中国电子大厦(中关村)｜园区企业168家｜面积24亩' },
            { title: '所在行业', val: '建筑业 > 土木工程建筑业' },
          ].map((c) => (
            <div key={c.title} className="rounded-md border border-[#e8ebf4] p-2.5">
              <h4 className="mb-1 text-[13px]">{c.title}</h4>
              <div className="text-sm font-medium">{c.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ============ 大 Tab 栏 ============ */}
      <div className="flex rounded-t-md border-b border-[#e4e7f1] bg-white px-4">
        {DETAIL_TABS.map((t) => (
          <span
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer border-b-2 px-3.5 py-2.5 text-[13px] ${tab === t ? 'border-[#2762e8] font-medium text-[#2762e8]' : 'border-transparent'}`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* ============ Tab1 企业概览 ============ */}
      {tab === '企业概览' && (
        <div className="rounded-b-md bg-white px-4 py-3.5">
          {/* 企业概览 */}
          <ModuleTitle title="企业概览" fold="复制简况" />
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <h4 className="mb-2 text-[13px]">简介</h4>
              <div className="text-xs">
                该企业已成立25年2个月29天，比北京市的98.51%的企业早，企业背景是国资背景，企业共有11个股东。<br />
                <b>主业</b>：建材、机械设备、建筑工程承包商、咨询设计、国内工程总承包、国际工程承包、贸易与服务、关键核心装备研发与制造、工程投资与运营。<br />
                <b>排名</b>：该企业在海投区全行业中排名第242名，在2020年入选承包商会发布2020年对外承包工程企业业务排名中名列第77名，在2019年入选2019我国对外承包工程业务完成营业额前100家企业中名列第43名，在2016年入选2016年我国对外承包工程业务新签合同额前100家企业中名列第63名。<br />
                <b>集团</b>：隶属于中国机械工业集团，集团成员4256家，集团对外投资838家，集团注册资本总和33125012.3712077万元人民币。社保人数总和：94854人。<br />
                <b>软实力</b>：该企业拥有206项专利，25项商标，17项资质许可。<br />
                <b>商机</b>：该企业最近一年的商机信息，其中新拟投资项目5次，签订重大合同（公告）5次，属/央国企类项目招标5次，应收账款融资到期4次，应收账款转让（保理）4次。与该企业关联的商机信息29条。<br />
                <b>投资</b>：该企业参与对外投资16次，实控49，间接控股86家企业，有5次融资事件。<br />
                <b>上市</b>：该企业是深交所主板上市企业股票代码：002051
              </div>
            </div>
            <div className="rounded-md border border-[#e8ebf4] p-3 text-center">
              <h4 className="mb-2 text-[13px]">多维简况</h4>
              <div className="mx-auto my-2.5 h-[120px] w-[120px] rounded-full border-2 border-[#cad4fc]" />
              <div>行业排名</div>
            </div>
          </div>

          {/* 启信指数环形指标行 */}
          <div className="my-4 grid grid-cols-6 gap-2">
            {INDEXES.map((it) => (
              <div key={it.label} className="text-center">
                <div
                  className={`mx-auto mb-1.5 flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px] text-sm ${it.danger ? 'border-[#f24444] text-[#f24444]' : 'border-[#ccc] text-[#222]'}`}
                >
                  {it.val}
                </div>
                <div className="text-xs">{it.label}</div>
                <div className="text-[11px] text-[#666]">{it.desc}</div>
              </div>
            ))}
          </div>

          {/* 行业产业分析 */}
          <ModuleTitle title="行业产业分析" fold="收起图表⌄" />
          <div className="grid grid-cols-[62%_36%] gap-[2%]">
            <div>
              <div className="rounded-md border border-[#e8ebf4] p-3 text-xs">
                <b>所在产业</b>：该企业属于北京市政府重点支持的产业目录中的绿色能源与节能环保产业。绿色能源与节能环保产业现有23363家存续企业。近5个季度企业数量总体呈下降趋势，平均季度增速为-0.48%。<br />
                <b>所在行业</b>：该企业属于建筑业&gt;土木工程建筑业&gt;其他土木工程建筑&gt;其他土木工程建筑施工(E4899)
              </div>
              <div className="my-3 grid grid-cols-3 gap-2.5">
                {[
                  { label: '行业企业总量', val: '21,121 家', chart: '饼图占位｜优质企业分布' },
                  { label: '行业新增融资总额', val: '650,000 万元', chart: '资金背景分布' },
                  { label: '行业专利授权总量', val: '6,353 件', chart: '企业存活时间分布' },
                ].map((c) => (
                  <div key={c.label} className="rounded-md border border-[#e8ebf4] p-2.5">
                    <div className="text-xs">{c.label}</div>
                    <div className="text-[16px] font-bold">{c.val}</div>
                    <ChartPlaceholder text={c.chart} />
                  </div>
                ))}
              </div>
              {['行业企业总量与增速情况折线图', '行业新增融资情况图表', '投融资趋势图表', '行业财务分析图表', '创新投入图表', '专利类型分布饼图'].map((c) => (
                <ChartPlaceholder key={c} text={c} />
              ))}
            </div>
            <div>
              <div className="rounded-md border border-[#e8ebf4] p-3 text-xs">
                <b>该企业产业布局 5</b>
                <div className="mt-1 leading-6">
                  🔋储能<br />⚙️变压器<br />♻️节能环保<br />📐测量仪器<br />🔌新能源汽车充电桩<br />💉骨科植入耗材
                </div>
              </div>
            </div>
          </div>

          {/* 上下游 */}
          <ModuleTitle title="上下游⌄" />
          <div className="grid grid-cols-3 gap-2.5">
            <div>
              <b className="text-xs">95 个供应商</b>
              <div className="overflow-x-auto"><table className="mt-1 w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className={thCls}>序号</th>
                    <th className={thCls}>品名名称</th>
                    <th className={thCls}>融资轮次</th>
                    <th className={thCls}>所属地</th>
                    <th className={thCls}>企业名称</th>
                    <th className={thCls}>成立日期</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['中铝国际', 'IPO', '北京', '中铝国际工程股…', '2003-12-16'],
                    ['三维化学', 'IPO', '山东', '山东三维化学集…', '1994-11-18'],
                    ['中国铁建', 'IPO', '北京', '中国铁建股份有…', '2007-11-05'],
                    ['东华科技', 'IPO', '安徽', '东华工程科技股…', '2001-07-18'],
                    ['上海建工', 'IPO', '上海', '上海建工集团股…', '1998-06-15'],
                  ].map((r, i) => (
                    <tr key={r[0]}>
                      <td className={tdCls}>{i + 1}</td>
                      <td className={tdCls}>{r[0]}</td>
                      <td className={tdCls}>{r[1]}</td>
                      <td className={tdCls}>{r[2]}</td>
                      <td className={tdCls}>{r[3]}</td>
                      <td className={tdCls}>{r[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
              <div className="py-1.5 text-right text-xs">共20条 5条/页｜1 2 3 4 5 &gt; 前往 页</div>
            </div>
            <div>
              <b className="text-xs">7 个客户</b>
              <div className="overflow-x-auto"><table className="mt-1 w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className={thCls}>简介</th>
                    <th className={thCls}>启信分</th>
                    <th className={thCls}>科创分</th>
                    <th className={thCls}>空壳指数</th>
                    <th className={thCls}>合同违约指数</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['中铝国际是一家有…', '830', '95', '低-', '低-'],
                    ['三维工程是一家石…', '760', '85', '低-', '低-'],
                    ['中国铁建是一家综…', '818', '96', '低-', '低-'],
                    ['东华科技是一家环…', '872', '89', '低-', '低-'],
                    ['上海建工是一家建…', '735', '95', '低-', '低-'],
                  ].map((r) => (
                    <tr key={r[0]}>
                      <td className={tdCls}>{r[0]}</td>
                      <td className={tdCls}>{r[1]}</td>
                      <td className={tdCls}>{r[2]}</td>
                      <td className={tdCls}>{r[3]}</td>
                      <td className={tdCls}>{r[4]}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            </div>
            <div>
              <b className="text-xs">3 个竞争对手</b>
            </div>
          </div>

          {/* 企业信息 工商基础信息 */}
          <div className="mt-3">
            <ModuleTitle
              title={<span>企业信息 <span className="cursor-pointer text-[#2762e8]">完整企业详情<ArrowDown /></span></span>}
              fold="收起图表⌄"
            />
            <div className="mb-3 grid grid-cols-4 gap-2">
              <div><label className="text-xs text-[#666]">成立日期</label><br />2001-05-22</div>
              <div><label className="text-xs text-[#666]">注册资本</label><br />123740.8937万人民币</div>
              <div><label className="text-xs text-[#666]">实缴资本</label><br />123740.8937万人民币</div>
              <div><label className="text-xs text-[#666]">参保人数</label><br />458人</div>
              <div><label className="text-xs text-[#666]">企业背景</label><br />国央企</div>
            </div>
            <div className="overflow-x-auto"><table className="w-full border-collapse text-xs">
              <tbody>
                <tr>
                  <th className={thCls}>统一社会信用代码</th>
                  <th className={thCls}>企业名称</th>
                  <th className={thCls}>登记状态</th>
                  <th className={thCls}>成立日期</th>
                </tr>
                <tr>
                  <td className={tdCls}>91110000710928321N</td>
                  <td className={tdCls}>中工国际工程股份有限公司</td>
                  <td className={tdCls}>存续（在营、开业、在册）</td>
                  <td className={tdCls}>2001-05-22</td>
                </tr>
                <tr>
                  <th className={thCls}>法定代表人</th>
                  <th className={thCls}>工商注册号</th>
                  <th className={thCls}>实缴资本</th>
                  <th className={thCls}>纳税人识别号</th>
                </tr>
                <tr>
                  <td className={tdCls}>王博</td>
                  <td className={tdCls}>1100000009591448</td>
                  <td className={tdCls}>123740.8937万人民币</td>
                  <td className={tdCls}>91110000710928321N</td>
                </tr>
                <tr>
                  <th className={thCls}>企业类型</th>
                  <th className={thCls}>营业期限</th>
                  <th className={thCls}>纳税人资质</th>
                  <th className={thCls}>核准日期</th>
                </tr>
                <tr>
                  <td className={tdCls}>其他股份有限公司(上市)</td>
                  <td className={tdCls}>2001-05-22 ~--</td>
                  <td className={tdCls}>增值税一般纳税人</td>
                  <td className={tdCls}>2025-11-18</td>
                </tr>
                <tr>
                  <th className={thCls}>人员规模</th>
                  <th className={thCls}>参保人数</th>
                  <th className={thCls}>登记机关</th>
                  <th className={thCls}>进出口企业代码</th>
                </tr>
                <tr>
                  <td className={tdCls}>400-499人</td>
                  <td className={tdCls}>458人（2025年报）</td>
                  <td className={tdCls}>北京市海淀区市场监督管理局</td>
                  <td className={tdCls}>1100710928321</td>
                </tr>
                <tr>
                  <th className={thCls}>所属地区</th>
                  <th className={thCls}>英文名</th>
                  <th className={thCls} colSpan={2}>历史名称</th>
                </tr>
                <tr>
                  <td className={tdCls}>北京市海淀区</td>
                  <td className={tdCls}>China Camc Engineering Co.,Ltd.</td>
                  <td className={tdCls} colSpan={2}>-</td>
                </tr>
                <tr>
                  <th className={thCls}>国标行业</th>
                  <th className={thCls} colSpan={3}>注册地址</th>
                </tr>
                <tr>
                  <td className={tdCls}>其他土木工程建筑施工 E4899</td>
                  <td className={tdCls} colSpan={3}>北京市海淀区丹棱街3号</td>
                </tr>
                <tr>
                  <th className={thCls} colSpan={4}>经营范围</th>
                </tr>
                <tr>
                  <td className={tdCls} colSpan={4}>承包各类境外工程及境内国际招标工程；上述境外工程所需的设备、材料出口；经营和代理各类商品及技术的进出口业务（国家限定公司经营或禁止进出口的商品及技术除外）；经营进料加工和"三来一补"业务；经营对销贸易和转口贸易；销售医疗器械Ⅰ、Ⅱ类；对外派遣工程、生产及服务行业所需的劳务人员（不含海员）。（市场主体依法自主选择经营项目，开展经营活动；依法须经批准的项目，经相关部门批准后依批准的内容开展经营活动；不得从事国家和本市产业政策禁止和限制类项目的经营活动。）</td>
                </tr>
              </tbody>
            </table></div>
          </div>

          {/* 团队分析 */}
          <div className="mt-3">
            <ModuleTitle title="团队分析" fold="收起图表⌄" />
            <p className="text-xs">创始团队：创始人团队共有14名成员，副总经理闫海禄：男，大学本科学历，高级工程师。曾任中国土木工程集团有限公司海外部一助理工程师、工程师，中师国际合作有限责任公司高级项目经理，本公司成套工程四部高级项目经理、总经理助理兼驻外机构总代表、副总经理、总经理，本公司亚太事业部总经理兼成套工程四部总经理、第一工程事业部总经理。现任本公司副总经理。</p>
            <br />
            <b className="text-xs">核心高管</b>
            <div className="overflow-x-auto"><table className="mt-1 w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className={thCls}>序号</th>
                  <th className={thCls}>姓名</th>
                  <th className={thCls}>学历</th>
                  <th className={thCls}>职务</th>
                  <th className={thCls}>持股比例</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['王博', '硕士', '董事长,非独立董事,法定代表人', '-'],
                  ['芮红', '硕士', '董事会秘书', '-'],
                  ['王世宏', '本科', '独立董事', '-'],
                  ['张荣群', '博士', '独立董事', '-'],
                  ['马超英', '本科', '独立董事', '-'],
                ].map((r, i) => (
                  <tr key={r[0]}>
                    <td className={tdCls}>{i + 1}</td>
                    <td className={tdCls}>{r[0]}</td>
                    <td className={tdCls}>{r[1]}</td>
                    <td className={tdCls}>{r[2]}</td>
                    <td className={tdCls}>{r[3]}</td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>

          {/* 资本市场分析 */}
          <div className="mt-3">
            <ModuleTitle title="资本市场分析" fold="收起图表⌄" />
            <p className="text-xs">该企业有PE/VC融资信息，在2019-05-30发生了主板定向增发轮的融资，投资方：国机集团（创投机构评级L1指数：75.91分），融资金额为1999.9994万人民币，自2001-05-22起该企业已经进行了5轮融资。</p>
            <div className="my-3 grid grid-cols-2 gap-3">
              <div className="rounded-md border border-[#e8ebf4] p-3">
                <h4 className="mb-2 text-[13px]">股权融资</h4>
                <div className="text-xs">PE/VC｜股权出质 0｜股权质押 0</div>
              </div>
              <div className="rounded-md border border-[#e8ebf4] p-3">
                <h4 className="mb-2 text-[13px]">动产融资</h4>
                <div className="text-xs">应收账款质押 0｜应收账款转让 13｜融资租赁 0｜其他动产融资0</div>
              </div>
              <div className="rounded-md border border-[#e8ebf4] p-3">
                <h4 className="mb-2 text-[13px]">上市发债</h4>
                <div className="text-xs">债务融资0｜DCM注册额度0｜授信额度0｜上市融资4</div>
              </div>
              <div className="rounded-md border border-[#e8ebf4] p-3">
                <h4 className="mb-2 text-[13px]">更多融资</h4>
                <div className="text-xs">银行借款0｜信托融资0｜知识产权出质0</div>
              </div>
            </div>
            <b className="text-xs">财务报表</b>
            <div className="mt-1 w-full overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className={thCls}>主要指标</th>
                    <th className={thCls}>2026-06-30</th>
                    <th className={thCls}>2026-03-31</th>
                    <th className={thCls}>2025-12-31</th>
                    <th className={thCls}>2025-09-30</th>
                    <th className={thCls}>2025-06-30</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className={tdCls}>成长能力指标</td>
                    <td className={tdCls}>9.89亿</td>
                    <td className={tdCls}>4.77亿</td>
                    <td className={tdCls}>20.20亿</td>
                    <td className={tdCls}>13.23亿</td>
                    <td className={tdCls}>8.90亿</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 资产分析 */}
          <div className="mt-3">
            <ModuleTitle title="资产分析" fold="收起图表⌄" />
            <div className="grid grid-cols-4 gap-2">
              {['55专利 发明专利', '79实用新型专利', '25商标评估', '41软著评估', '3不动产', '16股权', '2预估未来财产线索'].map((a) => (
                <div key={a} className="rounded-md border border-[#e8ebf4] p-3 text-xs">
                  {a.includes(' ') ? (
                    <>
                      <div>{a.split(' ')[0]}</div>
                      <div>{a.split(' ')[1]}</div>
                    </>
                  ) : (
                    <div>{a}</div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 风险分析 */}
          <div className="mt-3">
            <ModuleTitle title="风险分析" fold="收起图表⌄" />
            <div className="border-b border-dotted border-[#e2e5f0] py-2 text-xs">
              <b>中风险（1项）</b>：环保公告1次
            </div>
            <div className="border-b border-dotted border-[#e2e5f0] py-2 text-xs">
              <b>低风险（2项）</b>：股权质押（0.28%），员工人数458人
            </div>
            <div className="border-b border-dotted border-[#e2e5f0] py-2 text-xs">
              <b>利好信息（25项）</b>：A级纳税人，招投标项目，近72年名单，合同违约指数，经营状态存续，科创等级AA，国有企业，启信分825分，成立25年，实缴资本100%等。
            </div>
          </div>

          {/* 企业舆情 */}
          <div className="mt-3">
            <ModuleTitle title="企业舆情" fold="收起图表⌄" />
            <div className="mb-2 flex gap-5 text-xs">
              <div><b>48</b>舆情总量</div>
              <div><b>3</b>消极舆情</div>
              <div><b>30.43%↑</b>同比上月</div>
            </div>
            {[
              { tag: '积极', cls: 'bg-[#e6f7ef] text-[#198742]', text: '中工国际：尼加拉瓜布港建设项目一标段已具备开工条件', date: '2026-08-20' },
              { tag: '中立', cls: 'bg-[#e8edfc] text-[#2756b8]', text: '中工国际公司将持续关注股价表现', date: '2026-08-19' },
              { tag: '积极', cls: 'bg-[#e6f7ef] text-[#198742]', text: '中工国际：公司在拉美地区重点市场之一，工程承包项目', date: '2026-08-19' },
            ].map((n) => (
              <div key={n.text} className="flex items-center justify-between border-b border-[#f0f1f7] px-1 py-2 text-xs">
                <span>
                  <span className={`mr-1.5 rounded px-1 py-0.5 text-[11px] ${n.cls}`}>{n.tag}</span>
                  {n.text}
                </span>
                <span className="shrink-0 text-gray-500">{n.date}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============ 其余 6 个 Tab（待提供快照后填充） ============ */}
      {tab !== '企业概览' && (
        <div className="rounded-b-md bg-white px-4 py-16 text-center text-sm text-gray-400">
          「{tab}」内容待提供，后续补充
        </div>
      )}
    </div>
  )
}
