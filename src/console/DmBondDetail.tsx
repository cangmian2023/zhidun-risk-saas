import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from './PageShell'
import { usePageNav } from './pageNav'

/* ============ 图标 ============ */
const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-1 text-[#999]">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const thCls = 'border border-[#eee] bg-[#f7f7fc] px-3 py-2.5 text-left font-medium text-[#333]'
const tdCls = 'border-b border-dashed border-[#e8e8ee] px-3 py-2.5 align-middle'

/* 详情 Tab */
const DETAIL_TABS = ['基础信息', '信用评级', '主体评级', '债券公告', '财务分析']

/* 样例数据 */
const BASIC_INFO = [
  { label: '债券全称', value: '和县城市建设投资有限责任公司2021年面向专业投资者非公开发行公司债券' },
  { label: '债券简称', value: '21和县城投债' },
  { label: '债券代码', value: '2180123.IB' },
  { label: '发行人', value: '和县城市建设投资有限责任公司' },
  { label: '发行总额', value: '8.00亿元' },
  { label: '票面利率', value: '5.80%' },
  { label: '债券期限', value: '7年（第5年起分期还本）' },
  { label: '起息日', value: '2021-12-31' },
  { label: '到期日', value: '2028-12-31' },
  { label: '主承销商', value: '开源证券股份有限公司' },
  { label: '信用评级机构', value: '联合资信评估股份有限公司' },
  { label: '上市地点', value: '银行间债券市场' },
]

const RATING_ROWS = [
  { agency: '联合资信', bondRating: 'AA', subjectRating: 'AA', outlook: '稳定', date: '2021-12-20', valid: '有效' },
  { agency: '联合资信', bondRating: 'AA', subjectRating: 'AA', outlook: '稳定', date: '2022-06-15', valid: '有效' },
  { agency: '联合资信', bondRating: 'AA-', subjectRating: 'AA-', outlook: '负面', date: '2023-05-10', valid: '已失效' },
]

const SUBJECT_HISTORY = [
  { agency: '联合资信', grade: 'AA', date: '2021-12-20', outlook: '稳定', disclose: '2021-12-22' },
  { agency: '联合资信', grade: 'AA', date: '2022-06-15', outlook: '稳定', disclose: '2022-06-17' },
  { agency: '联合资信', grade: 'AA-', date: '2023-05-10', outlook: '负面', disclose: '2023-05-12' },
]

const ANNOUNCE_ROWS = [
  { date: '2021-12-28', title: '2021年非公开发行公司债券发行结果公告', source: '中国货币网' },
  { date: '2022-06-20', title: '2021年度第一期中期票据付息公告', source: '上海清算所' },
  { date: '2023-05-12', title: '联合资信关于下调主体评级至AA-的公告', source: '联合资信' },
  { date: '2024-12-30', title: '2024年债券分期还本兑付公告', source: '中国货币网' },
]

const FINANCE_ROWS = [
  { year: '2023', revenue: '12.34亿', profit: '1.85亿', asset: '98.76亿', debtRatio: '56.2%', cash: '3.21亿' },
  { year: '2022', revenue: '10.98亿', profit: '1.62亿', asset: '91.45亿', debtRatio: '58.7%', cash: '2.88亿' },
  { year: '2021', revenue: '9.76亿', profit: '1.41亿', asset: '85.20亿', debtRatio: '61.3%', cash: '2.45亿' },
]

export default function DmBondDetail() {
  const [params] = useSearchParams()
  const { back } = usePageNav()
  const name = params.get('name') || '21和县城投债'
  const issuer = params.get('issuer') || '和县城市建设投资有限责任公司'
  const [tab, setTab] = useState('基础信息')

  return (
    <div style={{ padding: 16, background: '#f5f6f8', minHeight: '100vh' }}>
      <div style={{ padding: 20, maxWidth: 1440, margin: '0 auto' }}>
        <PageShell
          title={name}
          crumb={`数字营销 / 金融工具 / 债券数据 / ${name}`}
          subtitle={issuer}
          legend={false}
          actions={
            <button
              onClick={() => back('/console/dm/bond-data')}
              className="rounded border border-[#d8dbe6] bg-white px-3 py-1.5 text-sm text-[#555] hover:border-[#1f47f5] hover:text-[#1f47f5]"
            >
              ← 返回
            </button>
          }
        />

        {/* 详情 Tab */}
        <div className="mb-5 mt-3 flex gap-8 border-b border-[#e5e7eb]">
          {DETAIL_TABS.map((t) => (
            <span
              key={t}
              onClick={() => setTab(t)}
              className={`relative cursor-pointer select-none py-2.5 pr-1 text-[15px] ${
                tab === t ? 'font-medium text-[#111]' : 'text-[#666]'
              }`}
            >
              {t}
              {tab === t && <span className="absolute -bottom-px left-0 h-[3px] w-full bg-[#1f47f5]" />}
            </span>
          ))}
        </div>

        {/* 基础信息 */}
        {tab === '基础信息' && (
          <div className="grid grid-cols-2 gap-x-10 gap-y-0">
            {BASIC_INFO.map((it) => (
              <div key={it.label} className="flex border-b border-dashed border-[#e8e8ee] py-3">
                <span className="w-32 shrink-0 text-sm text-[#999]">{it.label}</span>
                <span className="text-sm text-[#333]">{it.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* 信用评级 */}
        {tab === '信用评级' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thCls}>评级公司</th>
                  <th className={thCls}>债项评级</th>
                  <th className={thCls}>主体评级</th>
                  <th className={thCls}>评级展望</th>
                  <th className={thCls}>评级日期</th>
                  <th className={thCls}>状态</th>
                </tr>
              </thead>
              <tbody>
                {RATING_ROWS.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-[#f8f8fe]">
                    <td className={tdCls}>{r.agency}</td>
                    <td className={tdCls}>{r.bondRating}</td>
                    <td className={tdCls}>{r.subjectRating}</td>
                    <td className={tdCls}>{r.outlook}</td>
                    <td className={tdCls}>{r.date}</td>
                    <td className={tdCls}>{r.valid}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 主体评级 */}
        {tab === '主体评级' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thCls}>评级公司</th>
                  <th className={thCls}>主体评级</th>
                  <th className={thCls}>评级日期</th>
                  <th className={thCls}>评级展望</th>
                  <th className={thCls}>披露日期</th>
                </tr>
              </thead>
              <tbody>
                {SUBJECT_HISTORY.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-[#f8f8fe]">
                    <td className={tdCls}>{r.agency}</td>
                    <td className={tdCls}>{r.grade}</td>
                    <td className={tdCls}>{r.date}</td>
                    <td className={tdCls}>{r.outlook}</td>
                    <td className={tdCls}>{r.disclose}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 债券公告 */}
        {tab === '债券公告' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thCls}>公告日期</th>
                  <th className={thCls}>公告标题</th>
                  <th className={thCls}>来源</th>
                </tr>
              </thead>
              <tbody>
                {ANNOUNCE_ROWS.map((r, i) => (
                  <tr key={i} className="odd:bg-white even:bg-[#f8f8fe]">
                    <td className={tdCls}>{r.date}</td>
                    <td className={tdCls}>{r.title}</td>
                    <td className={tdCls}>{r.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 财务分析 */}
        {tab === '财务分析' && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className={thCls}>报告期</th>
                  <th className={thCls}>营业收入</th>
                  <th className={thCls}>净利润</th>
                  <th className={thCls}>总资产</th>
                  <th className={thCls}>资产负债率</th>
                  <th className={thCls}>货币资金</th>
                </tr>
              </thead>
              <tbody>
                {FINANCE_ROWS.map((r) => (
                  <tr key={r.year} className="odd:bg-white even:bg-[#f8f8fe]">
                    <td className={tdCls}>{r.year}</td>
                    <td className={tdCls}>{r.revenue}</td>
                    <td className={tdCls}>{r.profit}</td>
                    <td className={tdCls}>{r.asset}</td>
                    <td className={tdCls}>{r.debtRatio}</td>
                    <td className={tdCls}>{r.cash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
