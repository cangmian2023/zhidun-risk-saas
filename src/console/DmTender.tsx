import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageShell } from './PageShell'

/* ============ 图标（等价 HTML：搜索/下载/订阅等） ============ */
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

/* 搜索行（HTML .search-wrap） */
function SearchRow({ placeholder, withSelect }: { placeholder: string; withSelect?: boolean }) {
  return (
    <div className="mb-4.5 flex items-center gap-2.5">
      <div className="flex max-w-[620px] flex-1 overflow-hidden rounded-md bg-[#f5f6fa]">
        {withSelect && (
          <select className="border-none bg-[#f5f6fa] px-3.5 py-2.5 text-[15px] outline-none">
            <option>全部</option>
          </select>
        )}
        <input placeholder={placeholder} className="flex-1 bg-transparent px-3 py-2.5 text-[15px] outline-none placeholder:text-gray-400" />
      </div>
      <button className="cursor-pointer bg-[#f7c548] px-6 py-2.5 text-[15px] hover:opacity-90"><SearchIcon /> 搜索</button>
    </div>
  )
}

/* 顶部导航（HTML .top-nav-bar） */
const NAV_TABS = ['我的标讯', '全部标讯', '中标企业库', '产品词库']
const PANEL_KEYS: Record<string, string> = { '全部标讯': 'all-bid', '中标企业库': 'bid-company', '产品词库': 'product-lib' }

/* 通用样式类 */
const btnNormalCls = 'cursor-pointer rounded border border-[#b8bcc8] bg-white px-4 py-1.5'
const btnExportCls = 'cursor-pointer rounded bg-[#f7c548] px-4 py-1.5'

export default function DmTender() {
  const nav = useNavigate()
  const [tab, setTab] = useState('全部标讯')
  const [panel, setPanel] = useState('all-bid')
  const [bidOpen, setBidOpen] = useState(false)

  const switchTab = (t: string) => {
    setTab(t)
    if (PANEL_KEYS[t]) setPanel(PANEL_KEYS[t])
  }

  return (
    <div style={{ padding: 12 }} className="bg-white text-sm text-[#222]">
      <PageShell title="招投标" crumb="数字营销 / 商机挖掘" subtitle="招投标信息检索与商机挖掘" legend={false} />

      {/* ============ 顶部导航 ============ */}
      <div className="mb-4 flex items-center gap-8">
        {NAV_TABS.map((t) => (
          <span
            key={t}
            onClick={() => switchTab(t)}
            className={`relative cursor-pointer px-0.5 py-1.5 text-[17px] ${
              tab === t ? 'font-bold text-black' : 'text-[#444]'
            }`}
          >
            {t}
            {tab === t && PANEL_KEYS[t] && <span className="absolute -bottom-0.5 left-0 h-[3px] w-full bg-[#f7c548]" />}
          </span>
        ))}
        <div className="ml-auto">
          <button className="cursor-pointer rounded bg-[#f7c548] px-4.5 py-2 text-[15px] hover:opacity-90">＋ 添加订阅 ▾</button>
        </div>
      </div>

      {/* ============ Panel1 全部标讯 ============ */}
      {panel === 'all-bid' && (
        <div>
          <SearchRow placeholder="输入招投标关键词，如“科技软件”" withSelect />
          <div className="mb-2 flex items-center gap-1.5">
            <span>精准搜索ⓘ</span>
            <input type="checkbox" />
          </div>

          {/* 统计卡片 */}
          <div className="mb-4 grid grid-cols-4 gap-3">
            {[
              { title: '北京市企业大额中标 ⓘ', num: '6,761条' },
              { title: '北京市政府事业单位招标 ⓘ', num: '5,510条' },
              { title: '北京市国央企招标 ⓘ', num: '9,999+条' },
              { title: '北京市企业中标政府项目 ⓘ', num: '5,222条' },
            ].map((c) => (
              <div key={c.title} className="rounded-md bg-[#f5f6fa] p-3.5">
                <div className="mb-1.5 text-sm text-[#444]">{c.title}</div>
                <div className="text-[22px] font-bold text-[#2b65e8]">{c.num}</div>
              </div>
            ))}
          </div>

          {/* 筛选区 */}
          <div className="mb-3 rounded-md bg-[#f8f9fc] p-3.5">
            <div className="mb-2.5 flex flex-wrap items-center gap-3">
              <span className="w-[70px] text-[15px]">标讯类型</span>
              <label className="flex items-center gap-1"><input type="checkbox" checked />不限</label>
              <label className="flex items-center gap-1"><input type="checkbox" />招标公告</label>
              <label className="flex items-center gap-1"><input type="checkbox" />中标公告</label>
              <label className="flex items-center gap-1"><input type="checkbox" />拟建公告</label>
            </div>
            <div className="mb-2.5 flex flex-wrap items-center gap-3">
              <span className="w-[70px] text-[15px]">省份地区</span>
              <label className="flex items-center gap-1"><input type="checkbox" checked />省份地区 <ArrowDown /></label>
            </div>
            <div className="mb-2.5 flex flex-wrap items-center gap-3">
              <span className="w-[70px] text-[15px]">发布时间</span>
              {['不限', '今天', '近7天', '近30天', '近3个月', '近半年', '近1年', '近3年', '自定义 ▾'].map((p) => (
                <label key={p} className="flex items-center gap-1">
                  <input type="radio" name="pubtime" defaultChecked={p === '近30天'} />{p}
                </label>
              ))}
            </div>
            <div className="mb-2.5 flex flex-wrap items-center gap-3">
              <span className="w-[70px] text-[15px]">其他筛选</span>
              <label className="flex items-center gap-1"><input type="radio" name="other" />联系方式 <ArrowDown /></label>
              <label className="flex items-center gap-1"><input type="checkbox" />招标人 <ArrowDown /></label>
              <label className="flex items-center gap-1"><input type="checkbox" />所属行业 <ArrowDown /></label>
              <label className="flex items-center gap-1"><input type="radio" name="other" />预算金额 <ArrowDown /></label>
              <label className="flex items-center gap-1"><input type="radio" name="other" />中标金额 <ArrowDown /></label>
              <label className="flex items-center gap-1"><input type="radio" name="other" />附件 <ArrowDown /></label>
            </div>
            {/* 已选条件标签 */}
            <div className="mt-2 flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded bg-[#e7edfc] px-2.5 py-1 text-sm">省份地区：北京市 <span className="cursor-pointer">×</span></span>
              <span className="inline-flex items-center gap-1.5 rounded bg-[#e7edfc] px-2.5 py-1 text-sm">发布时间：近30天 <span className="cursor-pointer">×</span></span>
              <div className="ml-auto">
                <span className="cursor-pointer">订阅条件</span>
                <span className="ml-3 cursor-pointer">清空</span>
              </div>
            </div>
          </div>

          {/* 底部操作栏 */}
          <div className="my-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <input type="checkbox" />
              <span>找到 82,038 条标讯</span>
              <select className="rounded border border-[#ccc] px-2.5 py-1.5">
                <option>默认排序</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button className={btnNormalCls}>⿲</button>
              <button className={btnNormalCls}>⊞</button>
              <button className={btnNormalCls}>批量操作</button>
              <button className={btnNormalCls}>营销</button>
              <button className={btnExportCls}><DownloadIcon /> 导出</button>
            </div>
          </div>

          {/* 标讯列表项 */}
          <div className="border-b border-dashed border-[#dde0e8] px-3 py-4">
            <div className="flex items-center justify-between">
              <div className="mb-2 cursor-pointer text-lg font-bold" onClick={() => setBidOpen(true)}>OV支援勤务保障外包服务采购项目</div>
              <div className="text-sm text-[#444]"><span className="cursor-pointer">🗔订阅</span>｜<span className="cursor-pointer">更多 ▾</span></div>
            </div>
            <div className="mb-2.5 flex gap-2.5">
              <span className="text-sm text-[#2b65e8]">招标公告 | 招标</span>
              <span className="text-sm text-[#666]">北京市朝阳区</span>
              <span className="text-sm text-[#666]">服务采购</span>
              <span className="text-sm text-[#666]">有联系方式</span>
            </div>
            <div className="mb-2 grid grid-cols-3 gap-2 text-sm text-[#444]">
              <div>发布时间：2026-08-20 20小时前获取</div>
              <div>项目编号：OVBS-2026-0005</div>
              <div>联系人： 2个</div>
              <div>招标单位：<span className="text-[#2b65e8]">北京飞机维修工程有限公司</span></div>
              <div>中标单位： −</div>
              <div>代理单位： −</div>
              <div>中标候选人： −</div>
              <div>投标单位： −</div>
              <div>被提及单位：<span className="text-[#2b65e8]">中航集团</span></div>
            </div>
            <div className="text-sm text-[#666]">采购产品：OV支援勤务保障外包服务 OV飞机客舱清洁外包人… +1</div>
            <div className="mt-1.5 text-sm text-[#666]">标讯正文：OV支援勤务保障外包服务采购项目 北京飞机维修工程有限公司（Ameco）现就以下采购项目进行第二次公开招标，诚邀合格投标人参加投标。一、项目基本情况 1.项目名称：OV支…</div>
          </div>
        </div>
      )}

      {/* ============ Panel2 中标企业库 ============ */}
      {panel === 'bid-company' && (
        <div>
          <SearchRow placeholder="输入中标企业名称，如“小米”" />
          <div className="flex gap-6 border-b border-dashed border-[#dde0e8] py-3">
            {['中标人', '省份地区', '所在行业', '企业背景', '企业规模', '资质标签', '参保人数', '注册资本', '成立时间'].map((f) => (
              <span key={f} className="cursor-pointer text-sm">{f} ▾</span>
            ))}
          </div>
          <div className="flex gap-6 border-b border-dashed border-[#dde0e8] py-3">
            {['最新中标', '中标时间', '招标人背景', '招标人地区', '中标金额', '行业分类'].map((f) => (
              <span key={f} className={`cursor-pointer text-sm ${f === '最新中标' ? '' : ''}`}>{f === '最新中标' ? f : `${f} ▾`}</span>
            ))}
          </div>
          <div className="my-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span>发现 <span className="text-green-600">10万+</span> 条标讯结果</span>
            </div>
            <div className="flex gap-2">
              <button className={btnNormalCls}>营销</button>
              <button className={btnExportCls}><DownloadIcon />导出</button>
            </div>
          </div>
          <div className="my-2 rounded bg-[#f5f6fa] px-2.5 py-2.5">标讯信息</div>

          {/* 中标企业列表 */}
          {[
            { name: '中铁工程设计咨询集团有限公司', tags: ['北京市', '市政公用', '157.14737万', '事业单位'], desc: '2026-08-20　知识城湾区半导体产业园市政道路及配套工程（一期）勘察设计评标报告' },
            { name: '四川辰美益机电设备有限公司', tags: ['成都市', '房屋建筑', '2.526万', '机关'], desc: '2026-08-20　成都东部新区董家埂镇人民政府壁挂式空调机直接选定采购合同' },
            { name: '中铁桥隧技术有限公司', tags: ['南京市', '交通工程', '915.5585万', '国企'], desc: '2026-08-20　（南昌市本级）峰福线K278+029岳溪大桥第4、5孔钢梁换梁大修项目施工总价承包中标公告' },
          ].map((r) => (
            <div key={r.name} className="border-b border-dashed border-[#dde0e8] px-3 py-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input type="checkbox" />
                  <div className="cursor-pointer text-lg font-bold">{r.name}</div>
                </div>
                <div><span className="cursor-pointer">🗔订阅</span></div>
              </div>
              <div className="mb-2.5 flex gap-2.5">
                <span className="rounded bg-[#fce3d4] px-2 py-0.5 text-[13px] text-[#b34219]">中标</span>
                {r.tags.map((t) => (
                  <span key={t} className="text-sm text-[#222]">{t}</span>
                ))}
              </div>
              <div className="text-sm text-[#666]">{r.desc}</div>
            </div>
          ))}
        </div>
      )}

      {/* ============ Panel3 产品词库 ============ */}
      {panel === 'product-lib' && (
        <div>
          <SearchRow placeholder="请输入产品名称" />
          <div className="my-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span>找到<span className="text-green-600">10万+</span>个产品</span>
              <select className="rounded border border-[#ccc] px-2.5 py-1.5">
                <option>按公告更新日期排序</option>
              </select>
            </div>
            <div></div>
          </div>

          {/* 产品列表 */}
          {[
            { name: '新建排水工程', desc: '招标公告：295条｜中标公告：124条｜拟建公告：66条｜采购商：201家｜供应商：183家｜代理商：127家｜被提及：216家' },
            { name: '新能源汽车换电设施', desc: '中标公告：7条｜拟建公告：100条｜采购商：29家｜供应商：6家｜被提及：93家' },
            { name: '旋转叉车', desc: '招标公告：37条｜中标公告：7条｜采购商：29家｜供应商：10家｜代理商：11家｜被提及：13家' },
            { name: '数控双面研磨机', desc: '招标公告：11条｜中标公告：8条｜拟建公告：1条｜采购商：3家｜供应商：1家｜代理商：1家｜被提及：2家' },
            { name: '无线会议麦克风', desc: '招标公告：303条｜中标公告：400条｜采购商：454家｜供应商：420家｜代理商：125家｜被提及：360家' },
          ].map((r) => (
            <div key={r.name} className="border-b border-dashed border-[#dde0e8] px-3 py-4">
              <div className="mb-2 flex items-center justify-between">
                <div
                  className="cursor-pointer text-lg font-bold hover:text-[#2b65e8]"
                  onClick={() => nav(`/console/dm/tender-product?name=${encodeURIComponent(r.name)}`)}
                >
                  {r.name}
                </div>
                <div><span className="cursor-pointer">🗔订阅</span></div>
              </div>
              <p className="my-1.5 text-sm text-[#555]">{r.desc}</p>
            </div>
          ))}
        </div>
      )}

      {/* ============ 招标详情弹窗：标题点击 ============ */}
      {bidOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          onClick={(e) => { if (e.target === e.currentTarget) setBidOpen(false) }}
        >
          <div className="w-[860px] max-h-[90vh] overflow-y-auto rounded-lg border border-[#e5e7eb] bg-white shadow-xl">
            {/* 头部区域 */}
            <div className="flex items-start justify-between px-5 pb-2 pt-4">
              <div>
                <h1 className="mb-2.5 text-2xl font-semibold text-[#111827]">OV支援勤务保障外包服务采购项目</h1>
                <div>
                  <span className="mr-1 rounded bg-[#f3f4f6] px-1.5 py-0.5 text-sm text-[#374151]">招标公告|招标</span>
                  <span className="mr-1 rounded bg-[#f3f4f6] px-1.5 py-0.5 text-sm text-[#374151]">北京朝阳区</span>
                  <span className="mr-1 rounded bg-[#f3f4f6] px-1.5 py-0.5 text-sm text-[#374151]">国企</span>
                  <span className="mr-1 rounded bg-[#f3f4f6] px-1.5 py-0.5 text-sm text-[#374151]">有联系方式</span>
                </div>
                <div className="mt-2 text-[15px] text-[#4b5563]">
                  2026-08-20 20小时更新
                  <span className="ml-1.5 cursor-pointer text-[#2563eb]">🔗 查看原文</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="cursor-pointer rounded-md border border-[#9ca3af] bg-white px-3.5 py-1.5 text-[15px] hover:bg-gray-50">添加订阅 ▾</button>
                <button className="cursor-pointer rounded-md bg-[#2563EB] px-4 py-1.5 text-[15px] font-medium hover:opacity-90">更多 ▾</button>
                <button onClick={() => setBidOpen(false)} className="cursor-pointer text-2xl leading-none text-gray-400 hover:text-gray-600">×</button>
              </div>
            </div>

            {/* 信息卡片 */}
            <div className="mx-5 my-3 rounded-md border border-[#e0e7ff] bg-[#f8faff] p-3.5">
              <div className="mb-3.5 flex justify-between text-[15px]">
                <div>
                  招标单位：<span className="cursor-pointer text-[#2563eb]">北京飞机维修工程有限…</span>
                  <button className="ml-0.5 cursor-pointer rounded border border-[#cbd5e1] bg-white px-1 py-px text-xs">+ 订阅</button>
                  <span className="ml-1.5">更多招采联系方式 <span className="text-[#ea580c]">254</span></span>
                  &nbsp;招标联系方式：王女士 010-87495550
                </div>
                <div>
                  <span>更多2</span>
                  &nbsp;采购产品：<span className="cursor-pointer text-[#2563eb]">OV支援勤务保障外包服务 OV飞机客舱清洁外包人…</span> +1
                </div>
              </div>
              <div className="mb-3.5 grid grid-cols-3 text-[15px]">
                <div>项目名称：OV支援勤务保障外包服务采购项目</div>
                <div>项目编号：OVBS-2026-0005</div>
                <div>开标时间：2026-09-03 00:00:00</div>
              </div>
              <div className="grid grid-cols-3 text-[15px]">
                <div>标书最后获取时间：2026-08-18 00:00:00</div>
                <div>被提及单位：<span className="cursor-pointer text-[#2563eb]">中航集团</span> <button className="ml-0.5 cursor-pointer rounded border border-[#cbd5e1] bg-white px-1 py-px text-xs">+ 订阅</button></div>
                <div>联系方式：王女士 010-87495550 <span className="cursor-pointer">更多2</span></div>
              </div>
            </div>

            <div className="mx-5 mb-4 border-b border-dashed border-[#d1d5db]" />

            {/* 正文区域 */}
            <div className="px-5 pb-6">
              <div className="mb-3 flex items-center gap-1.5">
                <div className="h-5 w-1 bg-[#2563eb]" />
                <span className="text-lg font-semibold">正文</span>
              </div>
              <div className="text-[15px] leading-8">
                <p className="mb-3">OV支援勤务保障外包服务采购项目</p>
                <p className="mb-3"><span className="cursor-pointer text-[#2563eb]">北京飞机维修工程有限公司</span>（Ameco）现就以下采购项目进行第二次公开招标，诚邀合格投标人参加投标。</p>
                <p className="mb-3">一、项目基本情况</p>
                <p className="mb-3">1.项目名称：OV支援勤务保障外包服务采购项目</p>
                <p className="mb-3">2.项目编号：OVBS-2026-0005</p>
                <p className="mb-3">3.项目地点：北京</p>
                <p className="mb-3">二、公告发布日期</p>
                <p className="mb-3">2026年8月20日-2026年08月27日</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
