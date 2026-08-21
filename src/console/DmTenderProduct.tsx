import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from './PageShell'

/* 招投标 · 产品词库 → 产品标讯列表详情页
 * 按 record/页面功能描述/招投标 - 产品词库Tab点击标题进详情页点.HTML 落地。
 * 进入来源：招投标页「产品词库」Tab 点击产品标题
 *   URL: /console/dm/tender-product?name=产品名
 */

/* ============ 图标（等价 HTML：定位/订阅/搜索/批量/营销/导出等） ============ */
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
const LocIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline align-middle mr-1">
    <circle cx="8" cy="6" r="3.2" stroke="currentColor" strokeWidth="1.3" />
    <path d="M8 14c3-3.2 4.5-5.6 4.5-8A4.5 4.5 0 0 0 3.5 6c0 2.4 1.5 4.8 4.5 8Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
  </svg>
)

/* ============ 顶部 Tab 计数条（HTML .tab-count-bar） ============ */
const COUNT_TABS = ['招投标信息 518', '采购商 186', '供应商 167', '被提及 302', '代理方 124']

/* ============ 列表样例（与 HTML 逐行一致） ============ */
const LIST_ROWS = [
  {
    title: '张北县张北镇人民政府办本级张北镇三道洼村庄排水工程项目竞争性磋商公告',
    tags: ['招标公告 | 竞磋', '河北张家口市张北县', '市政公用', '230万', '有联系方式'],
    info1: ['发布时间：2026-08-19', '项目编号：HBZC2026-022', '联系人： 2个'],
    info2: ['张北县张北镇人民政府办本级', '–', '河北卓诚项目管理咨询有限公司'],
    info3: ['–', '–', '国家统计局'],
    product: '村庄排水工程项目 拆除、重建15cm混凝土路面 修建…+2',
    body: '公告概要：公告信息：采购项目名称张北镇三道洼村庄排水工程项目品目 采购单位张北县张北镇人民政府办本级行政区域张北县公告时间2026年08月19日 09:54获取采购文件时间20…',
  },
  {
    title: '张北县张北镇人民政府办本级张北镇三道洼村庄排水工程项目竞争性磋商公告',
    tags: ['招标公告 | 招标', '河北张家口市张北县', '水利水电', '230万', '有联系方式'],
    info1: ['发布时间：2026-08-17', '项目编号：HBZC2026-0022', '联系人： 2个'],
    info2: ['张北县张北镇人民政府办本级', '–', '河北卓诚项目管理咨询有限公司'],
    info3: ['–', '–', '国家统计局'],
    product: '村庄排水工程项目 拆除、重建15cm混凝土路面 修建…+3',
    body: '项目概况 张北镇三道洼村庄排水工程项目 招标项目的潜在投标人应在 "河北省公共资源交易服务平台张家口电子交易系统"（https://szj.hebei.gov.cn/hbggfwpt/municipal.html?…',
  },
]

const LinkBlue = ({ children }: { children: React.ReactNode }) => (
  <span className="cursor-pointer text-[#2563eb]">{children}</span>
)

export default function DmTenderProduct() {
  const [params] = useSearchParams()
  const name = params.get('name') || '新建排水工程'
  const [tab, setTab] = useState('招投标信息 518')

  return (
    <div style={{ padding: 12 }} className="bg-white text-sm text-[#222]">
      <PageShell title={name} crumb={`数字营销 / 招投标 / 产品词库 / ${name}`} legend={false} />

      {/* ============ 头部 ============ */}
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-[22px] font-semibold text-[#111827]">{name}</h1>
        <button className="cursor-pointer rounded-md bg-[#facc15] px-4 py-1.5 text-[15px] hover:opacity-90">☉ 订阅</button>
      </div>

      {/* ============ Tab 计数条 ============ */}
      <div className="mb-4 flex gap-8 border-b border-[#e5e7eb]">
        {COUNT_TABS.map((t) => (
          <span
            key={t}
            onClick={() => setTab(t)}
            className={`cursor-pointer pb-2 pt-2 text-[16px] ${tab === t ? 'border-b-2 border-[#eab308] font-semibold text-[#111827]' : 'text-[#4b5563]'}`}
          >
            {t}
          </span>
        ))}
      </div>

      {/* ============ 筛选区 ============ */}
      <div className="mb-4">
        <div className="mb-3 flex items-center gap-6 text-[15px]">
          <label className="flex items-center gap-1"><input type="checkbox" checked />标讯类型</label>
          <label className="flex items-center gap-1"><input type="checkbox" />招标公告</label>
          <label className="flex items-center gap-1"><input type="checkbox" />中标公告</label>
          <label className="flex items-center gap-1"><input type="checkbox" />拟建公告</label>
        </div>
        <div className="mb-3 flex items-center gap-6 text-[15px]">
          <label className="flex items-center gap-1"><input type="checkbox" />省份地区 <ArrowDown /></label>
          <span className="cursor-pointer rounded-full border border-[#cbd5e1] px-2.5 py-0.5 text-sm text-[#2563eb]"><LocIcon />定位本地: 北京市</span>
        </div>
        <div className="mb-3 flex flex-wrap items-center gap-6 text-[15px]">
          {['发布时间 不限', '今天', '近7天', '近30天', '近3个月', '近半年', '近1年', '近3年', '自定义 ▾'].map((p, i) => (
            <label key={p} className="flex items-center gap-1">
              <input type="radio" name="publish" defaultChecked={i === 0} />{p}
            </label>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-6 text-[15px]">
          <span>其他筛选</span>
          <label className="flex items-center gap-1"><input type="radio" name="other" />联系方式 <ArrowDown /></label>
          <label className="flex items-center gap-1"><input type="checkbox" />招标人 <ArrowDown /></label>
          <label className="flex items-center gap-1"><input type="checkbox" />所属行业 <ArrowDown /></label>
          <label className="flex items-center gap-1"><input type="radio" name="other" />预算金额 <ArrowDown /></label>
          <label className="flex items-center gap-1"><input type="radio" name="other" />中标金额 <ArrowDown /></label>
          <label className="flex items-center gap-1"><input type="checkbox" />附件 <ArrowDown /></label>
        </div>
      </div>

      {/* ============ 工具栏 ============ */}
      <div className="my-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <input type="checkbox" />
          <span>找到518条标讯</span>
          <select className="rounded border border-[#cbd5e1] px-2.5 py-1.5">
            <option>默认排序</option>
          </select>
        </div>
        <div className="flex items-center gap-2.5">
          <div className="flex gap-1.5">
            <span className="cursor-pointer rounded-md border border-[#cbd5e1] px-2.5 py-1.5">🗄</span>
            <span className="cursor-pointer rounded-md border border-[#cbd5e1] px-2.5 py-1.5">⊞</span>
          </div>
          <input placeholder="Q 请输入关键词" className="w-[220px] rounded-md border border-[#cbd5e1] px-3 py-1.5 outline-none placeholder:text-gray-400" />
          <button className="cursor-pointer rounded-md border border-[#cbd5e1] bg-white px-3.5 py-1.5 hover:bg-gray-50">☑ 批量操作</button>
          <button className="cursor-pointer rounded-md border border-[#cbd5e1] bg-white px-3.5 py-1.5 hover:bg-gray-50">🗂 营销</button>
          <button className="cursor-pointer rounded-md bg-[#facc15] px-3.5 py-1.5 hover:opacity-90"><DownloadIcon /> 导出</button>
        </div>
      </div>

      {/* ============ 标讯列表 ============ */}
      {LIST_ROWS.map((r) => (
        <div key={r.title + r.info1[0]} className="border-b border-dashed border-[#d1d5db] px-1 py-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="mt-1" />
              <div className="cursor-pointer text-[17px] font-semibold text-[#111827]">{r.title}</div>
            </div>
            <div className="flex gap-4 text-sm text-[#4b5563]">
              <span className="cursor-pointer">☉订阅</span>
              <span className="cursor-pointer">更多 ▾</span>
            </div>
          </div>
          <div className="my-2 flex flex-wrap gap-2 text-sm">
            <span className="rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[#374151]"><LinkBlue>招标公告</LinkBlue> | {r.tags[0].split('|')[1]}</span>
            {r.tags.slice(1).map((t) => (
              <span key={t} className="rounded bg-[#f3f4f6] px-1.5 py-0.5 text-[#374151]">{t}</span>
            ))}
          </div>
          <div className="my-1.5 grid grid-cols-3 gap-2 text-[15px] leading-7">
            {r.info1.map((v) => <div key={v}>{v}</div>)}
          </div>
          <div className="my-1.5 grid grid-cols-3 gap-2 text-[15px] leading-7">
            <div>招标单位：<LinkBlue>{r.info2[0]}</LinkBlue></div>
            <div>中标单位： {r.info2[1]}</div>
            <div>代理单位： <LinkBlue>{r.info2[2]}</LinkBlue></div>
          </div>
          <div className="my-1.5 grid grid-cols-3 gap-2 text-[15px] leading-7">
            <div>中标候选人： {r.info3[0]}</div>
            <div>投标单位： {r.info3[1]}</div>
            <div>被提及及单位： <LinkBlue>{r.info3[2]}</LinkBlue></div>
          </div>
          <div className="my-1.5 grid grid-cols-1 text-[15px] leading-7">
            <div>采购产品：<span className="text-[#4b5563]">{r.product}</span></div>
          </div>
          <div className="text-[#4b5563]">标讯正文：{r.body}</div>
        </div>
      ))}
    </div>
  )
}
