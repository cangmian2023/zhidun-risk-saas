import { useState } from 'react'
import { PageShell } from './PageShell'

/* ============ 图标（等价 HTML：下拉/下载/日期等，FontAwesome → 内联 SVG） ============ */
const ArrowRight = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline">
    <path d="M4.5 2.5 8 6l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ArrowDown = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="inline">
    <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const SearchIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="inline">
    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
    <path d="m11 11 3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
  </svg>
)

/* ============ 通用样式类（等价 HTML 表单控件） ============ */
const inputCls = 'flex-1 rounded border border-[#ced2e0] px-2.5 py-2 text-sm outline-none'
const btnResetCls = 'cursor-pointer rounded border border-[#2b65e8] bg-white px-5 py-2 text-sm text-[#2b65e8]'
const btnSearchCls = 'cursor-pointer rounded bg-[#2b65e8] px-5 py-2 text-sm text-white'

/* 左侧栏标题 + 条目（HTML .sidebar-block/.sidebar-item） */
function SidebarBlock({ title, extra, children }: { title: string; extra?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between border-b border-[#eee] pb-1 text-[17px] font-bold">{title}{extra}</div>
      {children}
    </div>
  )
}
function SidebarItem({ children, arrow, sub }: { children: React.ReactNode; arrow?: 'right' | 'down'; sub?: boolean }) {
  return (
    <div className={`flex cursor-pointer items-center justify-between py-1.5 pr-1 text-[15px] text-[#333] ${sub ? 'pl-[18px]' : 'pl-1'}`}>
      <span>{children}</span>
      {arrow === 'right' && <span className="text-[13px] text-[#666]"><ArrowRight /></span>}
      {arrow === 'down' && <span className="text-[13px] text-[#666]"><ArrowDown /></span>}
    </div>
  )
}
function SidebarCheck({ children, arrow }: { children: React.ReactNode; arrow?: boolean }) {
  return (
    <label className="flex cursor-pointer items-center gap-1.5 py-1.5 pl-1 text-[15px]">
      <input type="checkbox" className="accent-[#2b65e8]" />
      {children}
      {arrow && <span className="ml-auto"><ArrowRight /></span>}
    </label>
  )
}

export default function DmFinLaw() {
  const [tab, setTab] = useState('处罚案例')
  const [modal, setModal] = useState(false)

  return (
    <div style={{ padding: 20 }} className="min-h-screen bg-[#f7f8fc] text-sm text-[#333]">
      <PageShell title="金融法规" crumb="数字营销 / 金融工具" subtitle="金融法律法规与监管文件库" legend={false} />

      {/* ============ 顶层 Tab（金色下划线，HTML .tab-wrap/.tab-item） ============ */}
      <div className="mb-5 flex border-b-2 border-[#e5e7f2]">
        {['金融法规', '处罚案例'].map((t) => (
          <span
            key={t}
            onClick={() => setTab(t)}
            className={`relative cursor-pointer px-6 py-3 text-[17px] ${
              tab === t ? 'font-bold text-[#cc9900]' : ''
            }`}
          >
            {t}
            {tab === t && <span className="absolute -bottom-0.5 left-0 h-[3px] w-full bg-[#f2c94c]" />}
          </span>
        ))}
      </div>

      {/* ============ Tab1 金融法规 ============ */}
      {tab === '金融法规' && (
        <div className="flex gap-6">
          {/* 左侧筛选栏 */}
          <div className="w-[220px] shrink-0 rounded-md bg-white px-3 py-4">
            <SidebarBlock title="法规层级（全部）">
              {['法律', '行政法规', '司法解释', '部门规章', '地方法规', '行业规范'].map((l) => (
                <SidebarItem key={l} arrow="right">{l}</SidebarItem>
              ))}
            </SidebarBlock>
            <SidebarBlock title="效力范围（全部）">
              <SidebarItem>全国性（1000+）</SidebarItem>
              <SidebarItem arrow="down">地方性</SidebarItem>
              <SidebarItem arrow="right" sub>省市级</SidebarItem>
              <SidebarItem sub>县处级</SidebarItem>
            </SidebarBlock>
            <SidebarBlock title="时效性（全部）">
              <SidebarItem>有效（1000+）</SidebarItem>
              <SidebarItem>失效（1000+）</SidebarItem>
              <SidebarItem>部分修订（1000+）</SidebarItem>
              <SidebarItem>修订失效（1000+）</SidebarItem>
            </SidebarBlock>
          </div>

          {/* 主内容区 */}
          <div className="min-w-0 flex-1">
            <div className="mb-5 rounded-lg border border-[#e2e5f3] bg-white p-5">
              {/* 标题搜索行 */}
              <div className="mb-3.5 flex items-center gap-2">
                <span className="w-[100px] shrink-0 text-[15px]">标题搜索：</span>
                <div>
                  <button className="cursor-pointer rounded bg-[#2b65e8] px-3.5 py-1.5 text-white">精确</button>
                  <button className="cursor-pointer rounded bg-[#eee] px-3.5 py-1.5">模糊</button>
                  <span className="ml-2.5 text-[13px] text-[#666]">使用&quot;+&quot;(且的关系)；使用&quot;/&quot;(或的关系)进行多关键词组合搜索</span>
                </div>
                <div className="ml-auto">
                  <button className={btnSearchCls}><SearchIcon /> 检索</button>
                </div>
              </div>

              {/* 两列表单 */}
              <div className="mb-3.5 grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-start gap-2">
                    <span className="w-[100px] shrink-0 text-[15px]">正文搜索：</span>
                    <textarea rows={3} placeholder='使用"+"(且的关系)；使用"/"(或的关系)进行多关键词组合搜索' className="flex-1 rounded border border-[#ced2e0] px-2.5 py-2 text-sm outline-none" />
                  </div>
                  <div className="my-2 flex items-center gap-5 text-sm">
                    {['同条', '同段', '同句'].map((m) => (
                      <label key={m} className="flex items-center gap-1">
                        <input type="radio" name="searchMode" className="accent-[#2b65e8]" />{m}
                      </label>
                    ))}
                    <span className="text-xs text-[#666]">ⓘ 检索符号</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-[100px] shrink-0 text-[15px]">颁布时间：</span>
                    <input placeholder="开始日期" className={inputCls} />
                    <span>~</span>
                    <input placeholder="结束日期" className={inputCls} />
                    <span>🗓</span>
                  </div>
                </div>
                <div>
                  <div className="mb-3.5 flex items-center gap-2">
                    <span className="w-[100px] shrink-0 text-[15px]">法规文号：</span>
                    <input placeholder="请输入法规文号" className={inputCls} />
                  </div>
                  <div className="mb-3.5 flex items-center gap-2">
                    <span className="w-[100px] shrink-0 text-[15px]">颁布单位：</span>
                    <select className={inputCls}><option>请输入颁布单位</option></select>
                  </div>
                  <div className="my-2 ml-[100px] text-sm">
                    <label><input type="checkbox" className="accent-[#2b65e8]" />银行业</label>
                    <label className="ml-4"><input type="checkbox" className="accent-[#2b65e8]" />证券业</label>
                    <label className="ml-4"><input type="checkbox" className="accent-[#2b65e8]" />保险业</label>
                  </div>
                </div>
              </div>

              <div className="mt-5 flex justify-center gap-4">
                <button className={btnResetCls}>重置</button>
                <button className={btnSearchCls}>检索</button>
              </div>
            </div>

            {/* 结果头 */}
            <div className="mb-3.5 flex items-center justify-between">
              <span>共 1000+ 条结果</span>
              <div>
                <span>法规层级</span>
                <input type="checkbox" checked className="ml-1 w-10 accent-[#2b65e8]" />
                <span className="ml-3.5">时间降序 ▽</span>
              </div>
            </div>

            {/* 规章制度横幅 */}
            <div className="mb-3 flex items-center justify-between rounded bg-[#203380] px-4 py-2.5 text-white">
              <span>规章制度 1000+条</span>
              <span className="cursor-pointer">更多</span>
            </div>

            {/* 列表项 */}
            <div className="mb-2.5 rounded-md bg-white px-4 py-3.5">
              <div className="mb-1.5 cursor-pointer text-[16px] text-[#003399]">
                <span className="mr-1.5 inline-block rounded bg-[#e8e8eb] px-1.5 py-0.5 text-xs">未生效</span>
                金融产品网络营销管理办法
                <span className="ml-2 rounded border border-[#2b65e8] px-1.5 py-0.5 text-xs">🔗 关联图谱</span>
              </div>
              <div className="text-sm text-[#666]">
                2026-04-21颁布 | 中国人民银行 工业和信息化部 市场监管总局 金融监管总局 中国证监会 国家知识产权局 国家网信办 国家外汇局公告（2026）第9号 | 中国人民银行、工业和信息化部、国家市场监督管理总局、国家金融监督管理总局、中国证券监督管理委员会、国家...
                <span className="float-right"><DownloadIcon /></span>
              </div>
            </div>
            <div className="mb-2.5 rounded-md bg-white px-4 py-3.5">
              <div className="mb-1.5 cursor-pointer text-[16px] text-[#003399]">
                <span className="mr-1.5 inline-block rounded bg-[#d7e3ff] px-1.5 py-0.5 text-xs">有效</span>
                推动生态环境损害赔偿制度改革进程的十大案例
              </div>
              <div className="text-sm text-[#666]">
                2026-08-15颁布 | 生态环境部、最高人民法院、最高人民检察院
                <span className="float-right"><DownloadIcon /></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ Tab2 处罚案例（默认） ============ */}
      {tab === '处罚案例' && (
        <div className="flex gap-6">
          {/* 左侧筛选栏 */}
          <div className="w-[220px] shrink-0 rounded-md bg-white px-3 py-4">
            <SidebarBlock title="案例分类" extra={<span className="text-[13px] font-normal text-[#2b65e8]"><SearchIcon /> 查看全部</span>}>
              {['同业及金融市场', '公司治理', '监管报告报表', '供应链金融', '信贷业务', '柜台业务', '大资管', '小微涉农金融（739）', '内控合规案防', '消费者保护'].map((c) => (
                <SidebarItem key={c} arrow="right">{c}（1000+）</SidebarItem>
              ))}
            </SidebarBlock>
            <SidebarBlock title="受罚机构类型（全部）">
              <SidebarCheck arrow>国有大型银行</SidebarCheck>
              <SidebarCheck>股份制银行</SidebarCheck>
              <SidebarCheck>城市商业银行</SidebarCheck>
              <SidebarCheck arrow>农村金融机构</SidebarCheck>
              <SidebarCheck>政策性银行</SidebarCheck>
              <SidebarCheck>民营银行</SidebarCheck>
              <SidebarCheck>外资银行</SidebarCheck>
              <SidebarCheck>资产管理机构</SidebarCheck>
            </SidebarBlock>
          </div>

          {/* 主内容区 */}
          <div className="min-w-0 flex-1">
            <div className="mb-5 rounded-lg border border-[#e2e5f3] bg-white p-5">
              {/* FR AI搜索 */}
              <div className="mb-2.5">
                <span className="text-lg font-bold">FR AI搜索</span>
                <span className="ml-2 text-[13px] text-[#666]">(注：直接描述您关注的机构、时间、违规行为或处罚结果，信息越具体，结果越准确。)</span>
              </div>
              <div className="mb-4 flex">
                <input
                  placeholder="例如：2025年金管总局对农村金融机构的处罚"
                  className="flex-1 rounded-l-lg border-2 border-[#2b65e8] px-3.5 py-3 text-[15px] outline-none"
                />
                <button className="cursor-pointer rounded-r-lg bg-[#2b65e8] px-6 text-white">AI搜索</button>
              </div>
              <div className="mb-4.5 flex items-center gap-2.5">
                <span>试试这样问：</span>
                <span className="rounded bg-[#e8edf8] px-2.5 py-1 text-[13px]">2025年金管总局对农村金融机构的处罚</span>
                <span className="rounded bg-[#e8edf8] px-2.5 py-1 text-[13px]">近三年保险公司虚假宣传处罚</span>
                <span className="rounded bg-[#e8edf8] px-2.5 py-1 text-[13px]">因贷后管理不到位被罚100万元以上</span>
              </div>
              <div className="mb-2.5">
                <span className="font-bold">处罚机构：</span>
                <span className="mx-2.5 cursor-pointer text-[#2b65e8]">金管总局(银行)</span>
                <span className="mx-2.5 cursor-pointer">人民银行</span>
                <span className="mx-2.5 cursor-pointer">证券基金业</span>
              </div>

              {/* 表单区 */}
              <div className="mb-3 grid grid-cols-2 gap-3.5">
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">处罚案由ⓘ:</span>
                  <input placeholder="请输入关键词" className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">处罚日期∨:</span>
                  <input placeholder="开始日期" className={inputCls} />
                  <span>~</span>
                  <input placeholder="结束日期" className={inputCls} />
                  <span>🗓</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">受罚机构类型:</span>
                  <input placeholder="请选择受罚机构类型" className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">受罚单位:</span>
                  <input placeholder="输入受罚单位或受罚人任职单位" className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">受罚个人：</span>
                  <input placeholder='请输入"职位"或"姓名"关键词搜索查询' className={inputCls} />
                  <SearchIcon />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">处罚手段:</span>
                  <input placeholder="请选择处罚手段" className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">违规依据：</span>
                  <select className={inputCls}><option>查询该法规作为违规依据的所有处罚案例</option></select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">行政处罚号:</span>
                  <input placeholder="请输入行政处罚号" className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">处罚机构：</span>
                  <input placeholder="请输入或者选择监管单位" className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">处罚省市：</span>
                  <input placeholder="请输入处罚省市" className={inputCls} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">罚没总金额:</span>
                  <input placeholder="最小值" className="w-[90px] rounded border border-[#ced2e0] px-2 py-2 text-sm outline-none" />
                  <span>-</span>
                  <input placeholder="最大值" className="w-[90px] rounded border border-[#ced2e0] px-2 py-2 text-sm outline-none" />
                  <span>万元</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-[110px] shrink-0 text-[15px]">案例分类:</span>
                  <input placeholder="请选择案例分类" className={inputCls} />
                </div>
              </div>

              {/* 底部操作行 */}
              <div className="mt-3.5 flex items-center justify-between">
                <label className="flex items-center gap-1"><input type="checkbox" className="accent-[#2b65e8]" />仅查机构双罚</label>
                <div>
                  <button className={btnResetCls}>重置</button>
                  <button className={`${btnSearchCls} ml-2`}>检索</button>
                  <span className="ml-6 cursor-pointer text-[#2b65e8]">我保存的条件</span>
                </div>
              </div>
              <div className="mt-4.5 flex items-center justify-between">
                <div>
                  <label className="mr-1"><input type="checkbox" className="accent-[#2b65e8]" />全选</label>
                  <span>共 1000+ 处罚案例，总计处罚金额 244.67亿元</span>
                  <button className="ml-2.5 cursor-pointer rounded border border-[#2b65e8] bg-white px-3 py-1 text-[#2b65e8]">↖ 生成图表 &gt;</button>
                </div>
                <div>
                  <span>发布日期 ∨</span>
                  <span> 降序 ⇓</span>
                </div>
              </div>
            </div>

            {/* 处罚案例列表 */}
            <div className="mb-2.5 rounded-md bg-white px-4 py-3.5">
              <div className="mb-1.5 cursor-pointer text-[16px] text-[#003399]" onClick={() => setModal(true)}>
                国家金融监督管理总局常州监管分局对中国建设银行溧阳西平路支行的处罚
              </div>
              <div className="text-sm text-[#666]">
                发布日期：2026-08-20 &nbsp;&nbsp; 处罚机构：国家金融监督管理总局常州监管分局
                <span className="float-right"><DownloadIcon /></span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============ 处罚详情弹窗 ============ */}
      {modal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45" onClick={(e) => { if (e.target === e.currentTarget) setModal(false) }}>
          <div className="w-[720px] rounded-lg bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">处罚详情</h3>
              <span className="cursor-pointer text-[22px]" onClick={() => setModal(false)}>×</span>
            </div>
            <div className="space-y-2 text-sm">
              <p><b>处罚标题：</b>国家金融监督管理总局常州监管分局对中国建设银行溧阳西平路支行的处罚</p>
              <p><b>发布日期：</b>2026-08-20</p>
              <p><b>处罚机构：</b>国家金融监督管理总局常州监管分局</p>
              <p><b>受罚单位：</b>中国建设银行溧阳西平路支行</p>
              <p><b>处罚事由：</b>违反金融监管相关管理规定</p>
              <p><b>处罚结果：</b>予以罚款处理</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
