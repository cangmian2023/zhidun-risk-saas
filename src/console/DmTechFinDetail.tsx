import { useState, useRef, useEffect } from 'react'
import * as echarts from 'echarts'
import { DetailHeader, Modal, RightDrawer } from '../components/ui'
import { usePageNav } from './pageNav'

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

/* ============ ECharts 画布封装（样例数据，带提示色） ============ */
function EChart({ option, height = 280, className }: { option: Record<string, unknown>; height?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const inst = useRef<echarts.ECharts | null>(null)
  useEffect(() => {
    if (!ref.current) return
    inst.current = echarts.init(ref.current)
    const onResize = () => inst.current?.resize()
    window.addEventListener('resize', onResize)
    return () => {
      inst.current?.dispose()
      window.removeEventListener('resize', onResize)
      inst.current = null
    }
  }, [])
  useEffect(() => {
    inst.current?.setOption(option, true)
  }, [JSON.stringify(option)])
  return <div ref={ref} style={{ height, width: '100%' }} className={className} />
}

const C = { blue: '#2762e8', green: '#00b42a', orange: '#ff7d00', purple: '#722ED1', red: '#f24444', gray: '#c9d2e8', cyan: '#13c2c2' }
const YEARS = ['2021', '2022', '2023', '2024', '2025', '2026']

/* 多维能力图（雷达，替换原「多维简况」空圈） */
const RADAR_OPT: Record<string, unknown> = {
  tooltip: {},
  radar: {
    indicator: [
      { name: '技术创新', max: 100 }, { name: '研发实力', max: 100 }, { name: '科创资质', max: 100 },
      { name: '企业成长性', max: 100 }, { name: '行业潜力', max: 100 }, { name: '经营稳定性', max: 100 },
    ],
    radius: '66%', splitArea: { areaStyle: { color: ['#fafbff', '#f1f4fd'] } },
  },
  series: [{ type: 'radar', data: [{ value: [98, 95, 70, 88, 85, 92], areaStyle: { color: 'rgba(39,98,232,0.18)' }, lineStyle: { color: C.blue, width: 2 }, itemStyle: { color: C.blue } }] }],
}

/* 科创能力评分雷达（5 维） */
const ABILITY_RADAR_OPT: Record<string, unknown> = {
  tooltip: {},
  radar: {
    indicator: [
      { name: '技术创新', max: 100 }, { name: '研发实力', max: 100 }, { name: '科创资质', max: 100 },
      { name: '企业成长性', max: 100 }, { name: '行业潜力', max: 100 },
    ],
    radius: '62%', splitArea: { areaStyle: { color: ['#f6fcf8', '#eefaf2'] } },
  },
  series: [{ type: 'radar', data: [{ value: [98, 95, 72, 80, 85], areaStyle: { color: 'rgba(0,180,42,0.18)' }, lineStyle: { color: C.green, width: 2 }, itemStyle: { color: C.green } }] }],
}

/* 柱状 + 折线 组合图构造器 */
function comboOpt(
  cats: string[],
  bars: { name: string; data: number[]; color?: string }[],
  lines: { name: string; data: number[]; color?: string }[],
): Record<string, unknown> {
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: [...bars.map((b) => b.name), ...lines.map((l) => l.name)], top: 0, type: 'scroll', textStyle: { fontSize: 11 } },
    grid: { left: 56, right: 56, top: 44, bottom: 28 },
    xAxis: { type: 'category', data: cats, axisLabel: { fontSize: 11 } },
    yAxis: [
      { type: 'value', name: bars[0]?.name ?? '', nameTextStyle: { fontSize: 10, color: '#888' }, axisLabel: { fontSize: 10 } },
      { type: 'value', name: lines[0]?.name ?? '', nameTextStyle: { fontSize: 10, color: '#888' }, axisLabel: { fontSize: 10 } },
    ],
    series: [
      ...bars.map((b) => ({ name: b.name, type: 'bar', data: b.data, itemStyle: { color: b.color ?? C.blue }, barMaxWidth: 22 })),
      ...lines.map((l) => ({ name: l.name, type: 'line', yAxisIndex: 1, data: l.data, smooth: true, itemStyle: { color: l.color ?? C.orange }, symbolSize: 6 })),
    ],
  }
}

const OPT_IND_GROWTH = comboOpt(
  YEARS,
  [{ name: '企业数量(家)', data: [15000, 17000, 19000, 21000, 20500, 21121], color: C.blue }],
  [{ name: '企业环比增速(%)', data: [5.2, 8.1, 6.3, 4.0, -2.1, 3.4], color: C.orange }],
)
const OPT_FINANCE = comboOpt(
  YEARS,
  [
    { name: '新增融资事件(次)', data: [120, 150, 180, 160, 140, 200], color: C.blue },
    { name: '新增融资企业(家)', data: [80, 100, 120, 110, 95, 130], color: C.green },
  ],
  [{ name: '新增融资金额(万元)', data: [500000, 550000, 600000, 520000, 480000, 650000], color: C.orange }],
)
const OPT_INVEST_TREND = comboOpt(
  YEARS,
  [
    { name: '行业对外投资(次)', data: [60, 80, 95, 110, 120, 140], color: C.blue },
    { name: '外来投资(次)', data: [40, 55, 70, 85, 90, 105], color: C.purple },
    { name: '新增融资(次)', data: [120, 150, 180, 160, 140, 200], color: C.green },
  ],
  [
    { name: '新增融资企业(家)', data: [80, 100, 120, 110, 95, 130], color: C.orange },
    { name: '对外投资企业(家)', data: [50, 70, 85, 100, 110, 125], color: C.red },
    { name: '外来投资企业(家)', data: [30, 45, 60, 72, 80, 95], color: C.cyan },
  ],
)
const OPT_FINANCE_ROE = comboOpt(
  YEARS,
  [{ name: '省平均净资产收益率(%)', data: [8.2, 8.5, 7.9, 8.1, 8.3, 8.6], color: C.blue }],
  [{ name: '全国平均净资产收益率(%)', data: [7.5, 7.8, 7.2, 7.4, 7.6, 7.9], color: C.orange }],
)
const OPT_INNOVATION: Record<string, unknown> = {
  tooltip: { trigger: 'axis' },
  grid: { left: 50, right: 20, top: 30, bottom: 28 },
  xAxis: { type: 'category', data: ['研发投入', '人员投入', '专利产出', '软著产出', '科创资质'], axisLabel: { fontSize: 11 } },
  yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
  series: [{ type: 'bar', data: [92, 88, 95, 80, 72], itemStyle: { color: C.blue }, barMaxWidth: 32, label: { show: true, position: 'top', fontSize: 11 } }],
}

/* 环形图构造器 */
function donutOpt(data: { name: string; value: number; color: string }[]): Record<string, unknown> {
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { fontSize: 11 } },
    series: [{
      type: 'pie', radius: ['45%', '70%'], center: ['50%', '44%'],
      label: { show: true, formatter: '{b}\n{c}', fontSize: 11 },
      data: data.map((d) => ({ name: d.name, value: d.value, itemStyle: { color: d.color } })),
    }],
  }
}
const OPT_QUALITY = donutOpt([
  { name: '优质企业', value: 4200, color: C.green },
  { name: '其他企业', value: 16921, color: C.gray },
])
const OPT_SURVIVE = donutOpt([
  { name: '3年以内', value: 1200, color: C.orange },
  { name: '3-5年', value: 3400, color: C.blue },
  { name: '5-10年', value: 9800, color: C.green },
  { name: '10年以上', value: 6721, color: C.purple },
])
const OPT_PATENT = donutOpt([
  { name: '发明专利', value: 413, color: C.blue },
  { name: '实用新型', value: 3, color: C.green },
  { name: '外观设计', value: 1, color: C.orange },
])

/* 折线图构造器 */
function lineOpt(cats: string[], series: { name: string; data: number[]; color?: string }[]): Record<string, unknown> {
  return {
    tooltip: { trigger: 'axis' },
    legend: { data: series.map((s) => s.name), top: 0, type: 'scroll', textStyle: { fontSize: 11 } },
    grid: { left: 48, right: 20, top: 40, bottom: 28 },
    xAxis: { type: 'category', data: cats, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: series.map((s) => ({ name: s.name, type: 'line', smooth: true, data: s.data, itemStyle: { color: s.color }, symbolSize: 6 })),
  }
}
/* 单系列柱状图 */
function barOpt(cats: string[], data: number[], color: string, name: string): Record<string, unknown> {
  return {
    tooltip: { trigger: 'axis' },
    grid: { left: 48, right: 20, top: 30, bottom: 28 },
    xAxis: { type: 'category', data: cats, axisLabel: { fontSize: 11 } },
    yAxis: { type: 'value', axisLabel: { fontSize: 10 } },
    series: [{ name, type: 'bar', data, itemStyle: { color }, barMaxWidth: 30, label: { show: true, position: 'top', fontSize: 10 } }],
  }
}

/* ============ 待补充区块的样例图表（按上下文数据生成） ============ */
const OPT_TECH_TREND = lineOpt(YEARS, [
  { name: '包装袋', data: [40, 42, 45, 47, 50, 52], color: C.blue },
  { name: '阻气膜', data: [30, 33, 35, 38, 40, 43], color: C.green },
  { name: '锂离子', data: [20, 22, 25, 28, 30, 33], color: C.orange },
])
const OPT_PATENT_VALUE = donutOpt([
  { name: '高价值', value: 57.6, color: C.green },
  { name: '中价值', value: 40.4, color: C.blue },
  { name: '低价值', value: 2, color: C.orange },
])
const OPT_IPC = donutOpt([
  { name: 'G06F17/00', value: 35, color: C.blue },
  { name: 'G06Q10/00', value: 22, color: C.green },
  { name: 'G06F19/00', value: 18, color: C.orange },
  { name: 'H01L', value: 15, color: C.purple },
  { name: '其他', value: 10, color: C.gray },
])
const OPT_APP_TREND = comboOpt(YEARS,
  [{ name: '专利申请量', data: [120, 140, 160, 150, 180, 210], color: C.blue }],
  [{ name: '平均分', data: [70, 72, 71, 74, 73, 76], color: C.orange }])
const OPT_CORE_RATIO = lineOpt(YEARS, [{ name: '有效核心专利占比(%)', data: [60, 63, 65, 68, 70, 72], color: C.green }])
const OPT_APP_STRUCT = lineOpt(YEARS, [
  { name: '发明专利', data: [80, 90, 100, 95, 110, 130], color: C.blue },
  { name: '实用新型', data: [10, 12, 14, 13, 15, 18], color: C.green },
  { name: '外观设计', data: [5, 6, 7, 6, 8, 9], color: C.orange },
])
const OPT_GRANT_STRUCT = lineOpt(YEARS, [
  { name: '发明授权', data: [70, 78, 85, 82, 95, 110], color: C.blue },
  { name: '实用新型授权', data: [9, 11, 13, 12, 14, 16], color: C.green },
])
const OPT_UPDATE_CYCLE = donutOpt([
  { name: '<3年', value: 12, color: C.orange },
  { name: '3-6年', value: 25, color: C.blue },
  { name: '6-9年', value: 35, color: C.green },
  { name: '9-15年', value: 18, color: C.purple },
  { name: '>15年', value: 10, color: C.gray },
])
const OPT_LIFE_YEAR = barOpt(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '15', '20'], [2, 5, 12, 30, 68, 55, 40, 30, 20, 12, 5, 1], C.blue, '专利数')
const OPT_RND_OUTPUT = barOpt(['企业年均申请', '行业年均申请'], [95, 120], C.blue, '年均专利申请')
const OPT_RND_STABLE = lineOpt(YEARS, [
  { name: '发明数量', data: [80, 90, 100, 95, 110, 130], color: C.blue },
  { name: '发明人数量', data: [40, 45, 52, 50, 58, 65], color: C.orange },
])
const OPT_IUR = lineOpt(YEARS, [
  { name: '高校/研究机构合作', data: [0, 1, 0, 1, 0, 0], color: C.blue },
  { name: '企业合作', data: [1, 1, 0, 1, 0, 1], color: C.green },
])
const OPT_LIFE_CURVE = lineOpt(['初创', '成长', '成熟', '稳定', '衰退'], [
  { name: '企业生命周期指数', data: [20, 55, 90, 85, 60], color: C.blue },
])
const OPT_PATENT_LEGAL = donutOpt([
  { name: '有权', value: 40.09, color: C.blue },
  { name: '审中', value: 23.96, color: C.orange },
  { name: '无权', value: 35.94, color: C.purple },
])
const OPT_PATENT_TYPE_BAR = barOpt(['发明专利', '实用新型', '外观设计'], [413, 3, 1], C.blue, '专利数量')
const OPT_TRADEMARK = barOpt(['第9类', '第35类', '第42类', '第41类', '第16类'], [120, 95, 80, 40, 25], C.green, '商标注册数')

/* 空 tab 区块的兜底样例图表（按 tab 名匹配合适图表） */
function subChartFor(sub: string): Record<string, unknown> {
  if (sub.includes('团队') || sub.includes('人员') || sub.includes('招聘') || sub.includes('研发'))
    return lineOpt(YEARS, [
      { name: '研发人员', data: [40, 45, 52, 50, 58, 65], color: C.blue },
      { name: '招聘人数', data: [12, 18, 15, 20, 22, 25], color: C.green },
    ])
  if (sub.includes('信用') || sub.includes('税务') || sub.includes('标准') || sub.includes('认定') || sub.includes('榜单') || sub.includes('资质') || sub.includes('荣誉') || sub.includes('等级') || sub.includes('审批'))
    return barOpt(['企业A', '企业B', '企业C', '企业D', '企业E'], [98, 95, 92, 88, 85], C.blue, '科创能力分')
  if (sub.includes('商标')) return OPT_TRADEMARK
  if (sub.includes('软著') || sub.includes('著作权')) return barOpt(['软著', '作品著作权'], [41, 2], C.green, '数量')
  if (sub.includes('土地') || sub.includes('抵押') || sub.includes('不动产') || sub.includes('动产') || sub.includes('专利分析'))
    return barOpt(['专利', '商标', '软著', '不动产', '股权'], [55, 25, 41, 3, 16], C.blue, '资产项')
  if (sub.includes('债务') || sub.includes('诉讼') || sub.includes('转让') || sub.includes('保全') || sub.includes('无效') || sub.includes('质押') || sub.includes('舆情'))
    return lineOpt(YEARS, [{ name: '风险事件', data: [3, 2, 4, 1, 2, 3], color: C.red }])
  return OPT_PATENT_VALUE
}

/* ============ 颜色提示工具 ============ */
function toneCls(tone: 'good' | 'warn' | 'danger') {
  if (tone === 'good') return { border: 'border-[#00b42a] text-[#00b42a]', tag: 'text-[#00b42a]' }
  if (tone === 'warn') return { border: 'border-[#ff7d00] text-[#ff7d00]', tag: 'text-[#ff7d00]' }
  return { border: 'border-[#f24444] text-[#f24444]', tag: 'text-[#f24444]' }
}

const thCls = 'border border-[#e4e7f1] bg-[#f3f5fc] px-1.5 py-2 text-left text-xs'
const tdCls = 'border border-[#e4e7f1] px-1.5 py-2 text-xs'

/* ============ 企业健康度（环形指标，HTML .index-row） ============ */
const INDEXES = [
  { val: '88分', label: '科创分', desc: '优秀，科创等级AA', tone: 'good' as const },
  { val: '825分', label: '企业健康度', desc: '优秀，行业排名前5%', tone: 'good' as const },
  { val: '0分', label: '空壳指数', desc: '风险低，空壳等级:L1', tone: 'good' as const },
  { val: '0分', label: '合同违约指数', desc: '风险低，暂无数据', tone: 'good' as const },
  { val: '2%', label: '司法风险', desc: '风险低，涉诉数量:4', tone: 'warn' as const },
  { val: '高', label: '债务指数', desc: '风险高，融资债务27.03亿元', tone: 'danger' as const },
]

/* ============ 通用小组件 ============ */
function Chevron() { return <span className="ml-1 text-gray-400">▾</span> }
function Cross() { return <span className="text-gray-400">×</span> }
function Bar({ color, widthClass }: { color: string; widthClass: string }) {
  return (
    <div className="h-[6px] w-[180px] overflow-hidden rounded bg-gray-200">
      <div className={`h-full ${color} ${widthClass}`} />
    </div>
  )
}
function SubTabs({ items, active, onChange }: { items: string[]; active: string; onChange: (s: string) => void }) {
  return (
    <div className="mb-3 flex overflow-x-auto border-b border-[#e5e6eb] bg-[#f7f8fa]">
      {items.map((t) => (
        <span key={t} onClick={() => onChange(t)}
          className={`cursor-pointer whitespace-nowrap border-b-2 px-3 py-2 text-xs ${active === t ? 'border-[#165DFF] font-medium text-[#165DFF]' : 'border-transparent text-gray-600'}`}>
          {t}
        </span>
      ))}
    </div>
  )
}
function SubTabsPill({ items, active, onChange }: { items: string[]; active: string; onChange: (s: string) => void }) {
  return (
    <div className="mb-3 flex gap-1 rounded bg-[#f7f8fa] p-2">
      {items.map((t) => (
        <span key={t} onClick={() => onChange(t)}
          className={`cursor-pointer whitespace-nowrap rounded px-3 py-2 text-xs ${active === t ? 'bg-[#165DFF] text-white' : 'text-gray-500'}`}>
          {t}
        </span>
      ))}
    </div>
  )
}
function Pager({ total, pages }: { total: string; pages: string[] }) {
  return (
    <div className="mt-3 flex items-center justify-between text-xs">
      <div>{total}</div>
      <div className="flex items-center gap-1">
        <button className="flex h-6 w-6 items-center justify-center rounded border border-[#e5e6eb] text-xs">&lt;</button>
        {pages.map((p, i) => (
          <button key={i} className={`flex h-6 w-6 items-center justify-center rounded border text-xs ${p === '1' ? 'border-[#165DFF] bg-[#165DFF] text-white' : 'border-[#e5e6eb]'}`}>{p}</button>
          ))}
        <button className="flex h-6 w-6 items-center justify-center rounded border border-[#e5e6eb] text-xs">&gt;</button>
        <span className="ml-2">前往 <input className="w-6 rounded border border-[#e5e6eb] text-center" defaultValue="1" /> 页</span>
      </div>
    </div>
  )
}

/* ============ 科创能力分析（设计名：科创力分析） ============ */
const ABILITY_SUBTABS = ['科创评分', '科创分析', '科创经营动态标签', '重点技术趋势', '科创技术画像', '专利结构分析', '专利申请趋势', '专利申请结构趋势', '技术更新周期分析', '研发产出率', '研发稳定性', '全球布局', '生命周期']
const ABILITY_DIMS = [
  { dim: '技术创新', score: '98', level: '优秀', cls: 'text-[#00b42a]' },
  { dim: '研发实力', score: '95', level: '优秀', cls: 'text-[#00b42a]' },
  { dim: '科创资质', score: '0', level: '一般', cls: 'text-[#ff7d00]' },
  { dim: '企业成长性', score: '0', level: '一般', cls: 'text-[#ff7d00]' },
  { dim: '行业潜力', score: '0', level: '一般', cls: 'text-[#ff7d00]' },
]
const ABILITY_ROWS: [string, string, string, string][] = [
  ['有效发明专利数量(公司本身)', 'bg-[#4080FF]', 'w-[85%]', '413 前13%'],
  ['有效发明专利数量(含子公司)', 'bg-[#4080FF]', 'w-[72%]', '413 前28%'],
  ['有效发明授权数量(公司本身)', 'bg-[#4080FF]', 'w-[70%]', '257 前17%'],
  ['有效发明授权数量(含子公司)', 'bg-[#4080FF]', 'w-[65%]', '257 前33%'],
  ['有效实用新型数量(公司本身)', 'bg-[#00B42A]', 'w-[5%]', '3 后2%'],
  ['有效实用新型数量(含子公司)', 'bg-[#00B42A]', 'w-[5%]', '3 后1%'],
  ['有效外观设计数量(公司本身)', 'bg-[#FF7D00]', 'w-[3%]', '1 后1%'],
  ['有效外观设计数量(含子公司)', 'bg-[#FF7D00]', 'w-[3%]', '1 后1%'],
  ['原创专利转移数', 'bg-[#722ED1]', 'w-[2%]', '0 后1%'],
  ['专利增长水平', 'bg-[#722ED1]', 'w-[2%]', '0 后1%'],
  ['专利平均维持年限', 'bg-[#4080FF]', 'w-[80%]', '8.18 前10%'],
  ['PCT专利申请数', 'bg-[#4080FF]', 'w-[75%]', '368 前9%'],
  ['软著数量(公司本身)', 'bg-[#00B42A]', 'w-[2%]', '0 后1%'],
  ['软著数量(含子公司)', 'bg-[#00B42A]', 'w-[2%]', '0 后1%'],
  ['参保人数增长率', 'bg-[#FF7D00]', 'w-[50%]', '0 前47%'],
  ['行业融资次数增长率', 'bg-[#FF7D00]', 'w-[55%]', '-3.41% 后43%'],
  ['行业融资金额增长率', 'bg-[#722ED1]', 'w-[30%]', '-41.52% 后28%'],
]

function TechFinAbility({ stickyTop = 150, scrollMt = 210 }: { stickyTop?: number; scrollMt?: number }) {
  const [sub, setSub] = useState('科创评分')
  const scrollTo = (name: string) => {
    setSub(name)
    const el = document.getElementById('ability-' + name)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  return (
    <div>
      {/* 二级 tab 工具条：不切换视图内容，点击锚点滑动到对应区块 */}
      <div className="sticky z-10 -mx-4 mb-3 border-b border-[#e5e6eb] bg-white px-4 py-2" style={{ top: stickyTop }}>
        <div className="flex overflow-x-auto">
          {ABILITY_SUBTABS.map((t) => (
            <span
              key={t}
              onClick={() => scrollTo(t)}
              className={`cursor-pointer whitespace-nowrap border-b-2 px-3 py-1.5 text-xs ${sub === t ? 'border-[#165DFF] font-medium text-[#165DFF]' : 'border-transparent text-gray-600'}`}
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* 科创评分（含能力雷达图） */}
      <section id="ability-科创评分" style={{ scrollMarginTop: scrollMt }}>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-7 border border-[#e5e6eb] rounded p-3">
            <div className="flex items-center gap-4">
              <EChart option={ABILITY_RADAR_OPT} height={210} className="w-[220px] shrink-0" />
              <div>
                <div className="text-lg font-bold">科创能力评分80分</div>
                <div className="text-base font-medium text-[#00b42a]">优秀</div>
                <div className="mt-1 text-xs text-gray-500">跑赢全国商务服务业中99%的企业</div>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">科创能力高</span>
                  <div className="h-[4px] w-[120px] overflow-hidden rounded bg-gray-200">
                    <div className="float-left h-full w-[80%] bg-[#00b42a]" />
                    <div className="float-left h-full w-[20%] bg-[#ff7d00]" />
                  </div>
                  <span className="text-xs text-gray-500">科创能力低</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col-span-5 border border-[#e5e6eb] rounded p-3">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#f7f8fa]">
                  <th className="p-1 text-left">科创评分维度</th>
                  <th className="p-1 text-center">得分</th>
                  <th className="p-1 text-left">得分情况</th>
                </tr>
              </thead>
              <tbody>
                {ABILITY_DIMS.map((d) => (
                  <tr key={d.dim}>
                    <td className="p-1">{d.dim}</td>
                    <td className="p-1 text-center">{d.score}</td>
                    <td className={`p-1 ${d.cls}`}>{d.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="col-span-12 border border-[#e5e6eb] rounded p-3">
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              {ABILITY_ROWS.map((r) => (
                <div key={r[0]} className="flex items-center justify-between">
                  <span>{r[0]}</span>
                  <div className="flex items-center gap-2">
                    <Bar color={r[1]} widthClass={r[2]} />
                    <span>{r[3]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">重点技术趋势图</div>
            <EChart option={OPT_TECH_TREND} height={200} />
            <div className="mt-2 text-xs text-gray-500">该企业的主要主题词稳定（如果企业主要主题词发生了变化，则企业的重点布局领域可能也发生了变更）。</div>
          </div>
          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">科创技术画像</div>
            <div className="flex h-[220px] items-center justify-center text-center text-xs leading-5">
              包装袋 阻气 锂离子<br />片材 量子 显示装置 转印 图像<br />滤光片 高分子 装饰元件 催化剂 玻璃<br />电路 电阻 电池 油墨 阻气膜<br />容器 部件IC 薄膜<br />介质树脂 蓄电 合体 装饰板<br />片剂 配线电极 基板 气体 信息<br />成像 光学 体及荧光<br />照明 燃料电池 固体 照相机<br />固态 包装材料波长<br />遮光板 喷墨 包装容器<br />电子仪器
            </div>
          </div>

          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">专利结构分析<br /><span className="text-xs font-normal text-gray-500">专利IPC分类: 不同专利类别占比</span></div>
            <EChart option={OPT_IPC} height={200} />
            <div className="mt-1 text-center text-xs text-gray-500">▲ 1/2 ▼</div>
          </div>
          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">专利评级结构: 不同价值的专利的占比</div>
            <EChart option={OPT_PATENT_VALUE} height={200} />
            <div className="mt-1 text-xs text-gray-500">
              <span className="mr-1 inline-block h-2 w-2 rounded bg-[#00B42A]" />高价值 57.60%
              <span className="mr-1 ml-2 inline-block h-2 w-2 rounded bg-[#4080FF]" />中价值 40.40%
              <span className="mr-1 ml-2 inline-block h-2 w-2 rounded bg-[#FF7D00]" />低价值 2.00%
            </div>
          </div>

          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">专利申请趋势<br /><span className="text-xs font-normal text-gray-500">专利平均分趋势</span></div>
            <EChart option={OPT_APP_TREND} height={200} />
          </div>
          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">有效核心专利占比的趋势</div>
            <EChart option={OPT_CORE_RATIO} height={200} />
          </div>

          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">专利申请结构趋势</div>
            <EChart option={OPT_APP_STRUCT} height={200} />
          </div>
          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">专利授权结构趋势</div>
            <EChart option={OPT_GRANT_STRUCT} height={200} />
          </div>

          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">技术更新周期<br /><span className="text-xs font-normal text-gray-500">技术更新周期</span></div>
            <EChart option={OPT_UPDATE_CYCLE} height={200} />
            <div className="mt-1 text-xs text-gray-500">该企业专利34.77%维持年限在6-9年。</div>
          </div>
          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">专利生命周期年限</div>
            <EChart option={OPT_LIFE_YEAR} height={200} />
            <div className="mt-1 text-xs text-gray-500">该企业专利最长维持年限是20年，有1个专利；该企业专利在维持年限5年的最多。</div>
          </div>

          <div className="col-span-12 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">研发产出率</div>
            <EChart option={OPT_RND_OUTPUT} height={200} />
            <div className="mt-2 text-xs text-gray-500">该企业年均专利申请数量低于其所属国标二级行业。</div>
          </div>

          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">研发稳定性<br /><span className="text-xs font-normal text-gray-500">历年发明及发明人数量趋势</span></div>
            <EChart option={OPT_RND_STABLE} height={200} />
          </div>
          <div className="col-span-6 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">产学研合作趋势</div>
            <EChart option={OPT_IUR} height={200} />
            <div className="mt-1 text-xs text-gray-500">该企业与高校或研究机构展开2次合作，与企业展开4次合作。历年合作趋势如图。</div>
          </div>

          <div className="col-span-12 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">全球专利布局</div>
            <div className="flex gap-4">
              <div className="flex h-[240px] w-[60%] items-center justify-center bg-[#f7f8fa] text-xs text-gray-500">世界地图占位（专利布局热力图）</div>
              <div className="w-[40%]">
                <div className="mb-2 text-xs text-gray-500">该企业在至少1个国家或地区有366个有效专利<br />共有583个国际专利 <a className="text-[#165DFF]">查看全部 &gt;</a></div>
                <div className="mb-2 flex items-center gap-2">
                  <span className="w-12 text-xs">1 日本</span>
                  <div className="h-[6px] w-[160px] overflow-hidden rounded bg-gray-200"><div className="h-full w-full bg-[#4080FF]" /></div>
                  <span className="text-xs">366</span>
                </div>
                <div className="mt-4 text-xs text-gray-500">图例：<br />1.0-74.0 &nbsp;74-147 &nbsp;147-220 &nbsp;220-293 &nbsp;293-366</div>
              </div>
            </div>
          </div>

          <div className="col-span-12 border border-[#e5e6eb] rounded p-3">
            <div className="mb-2 text-xs font-medium">企业生命周期</div>
            <div className="flex gap-4">
              <div className="h-[260px] w-[70%]"><EChart option={OPT_LIFE_CURVE} height={260} /></div>
              <div className="w-[30%] rounded border border-[#e5e6eb] bg-[#f7f8fa] p-2">
                <div className="mb-2 text-xs font-medium">成熟期</div>
                <div className="text-xs leading-5 text-gray-500">基于企业征信大数据模型计算，该企业属于成熟期的科创企业</div>
                <div className="mt-2 text-xs leading-5 text-gray-500">融资模式以银行信贷、股权融资、留存盈余、集合债融资和供应链融资为主</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 其余二级 tab 区块（锚点占位，后续补充内容） */}
      {ABILITY_SUBTABS.filter((t) => t !== '科创评分').map((t) => (
        <section key={t} id={'ability-' + t} className="mt-4 rounded-md border border-[#e5e6eb] p-4" style={{ scrollMarginTop: scrollMt }}>
          <EChart option={subChartFor(t)} height={240} />
          <div className="mt-2 text-sm text-gray-400">「{t}」示例图表（样例数据）</div>
        </section>
      ))}
    </div>
  )
}

/* ============ 科创成果分析 ============ */
const ACH_SUBTABS = ['专利价值概览', '专利信息 651', '软著信息', '作品著作权 2', '国际专利 583', '集成电路布图']
const ACH_PATENT: [string, string, string, string, string, string, string, '高价值' | '中价值'][] = [
  ['1', '复合颗粒及其制造方法、个人护理产品、个人护理用颗粒及其制造方法、…', '2020-06-03', '2022-02-01', 'CN202080041771.9', '发明专利', '75', '高价值'],
  ['2', '树脂成型体、层状体及装片', '2018-05-30', '2020-01-14', 'CN201880034403.4', '发明专利', '75', '高价值'],
  ['3', '复合颗粒、复合颗粒的制造方法、干燥粉体以及成型用树脂组合物', '2018-12-27', '2020-08-21', 'CN201880084299.X', '发明专利', '75', '高价值'],
  ['4', '显示体、ID卡、显示体的制造方法及制造装置', '2018-03-08', '2019-11-08', 'CN201880011294.4', '发明专利', '74', '高价值'],
  ['5', '红外光截止滤光片、固态成像元件用滤光片、固态成像元件、以及固态成像…', '2020-09-17', '2022-04-12', 'CN202080062875.8', '发明专利', '74', '高价值'],
  ['6', '不燃性装饰片材、金属装饰部件及金属装饰部件的制造方法', '2015-05-22', '2017-08-29', 'CN201580072607.3', '发明专利', '74', '高价值'],
  ['7', '身份证明', '2018-08-22', '2022-01-04', 'CN202111135737.X', '发明专利', '73', '高价值'],
  ['8', '固体摄像元件用彩色滤波器用感光性绿色组合物，彩色滤波器及固体摄像元件', '2018-03-29', '2019-12-06', 'CN201880022180.X', '发明专利', '73', '高价值'],
  ['9', '阻气膜', '2020-12-04', '2022-07-08', 'CN202080081430.4', '发明专利', '73', '高价值'],
  ['10', '量子点及其制造方法、使用量子点的波长转换构件、照明构件、背光装置以…', '2018-10-12', '2021-11-02', 'CN202110710825.2', '发明专利', '72', '中价值'],
]
const ACH_WORKS: string[][] = [
  ['1', '小熊角色1', '2022-08-24', '国作登字-2022-F-10174906', '美术', '2003-03-01', '2002-10-18'],
  ['2', '小熊角色2', '2022-08-24', '国作登字-2022-F-10174905', '美术', '2015-03-01', '2014-10-01'],
]
const ACH_INTL: string[][] = [
  ['1', '转印箔、转印物、显示体、显示体的真实性的验证方法及验证装置、以及个体认证方法', '日本', '实质审查的生效', 'CN202280059114.6', '2022-08-30', 'CN117916080A', '2024-04-19', '一种转离地'],
  ['2', '纸浆模塑成形品及其制造方法', '日本', '实质审查的生效', 'CN202280052569.5', '2022-08-02', 'CN117716088A', '2024-03-15', '能够不在短'],
  ['3', '信息处理方法以及信息处理系统', '日本', '实质审查的生效', 'CN202280034359.3', '2022-06-17', 'CN117716433A', '2024-03-15', '一种信息系统具'],
  ['4', '纸浆模塑成形品及其制造方法', '日本', '实质审查的生效', 'CN202280052796.8', '2022-08-02', 'CN117716089A', '2024-03-15', '能够实现质、目'],
  ['5', '固体成像元件', '日本', '实质审查的生效', 'CN202280050201.5', '2022-07-15', 'CN117693815A', '2024-03-12', '一种面具有多'],
  ['6', '灭火材料形成用组合物、灭火材料以及灭火性部件及其制造方法', '日本', '实质审查的生效', 'CN202280049881.9', '2022-07-28', 'CN117693384A', '2024-03-12', '一种灭火包含灭'],
  ['7', '包装材料订购系统以及包装材料订购管理装置', '日本', '实质审查的生效', 'CN202280045810.1', '2022-06-27', 'CN117581251A', '2024-02-20', '包装材料订'],
  ['8', '灭火体', '日本', '公布', 'CN202280045049.1', '2022-06-28', 'CN117545531A', '2024-02-09', '本公开由包含'],
  ['9', '层压管用层叠体以及层压管', '日本', '实质审查的生效', 'CN202280044572.2', '2022-06-27', 'CN117545631A', '2024-02-09', '本公开具备'],
  ['10', '装饰片以及装饰片的制造方法', '日本', '实质审查的生效', 'CN202280044585.X', '2022-07-06', 'CN117545630A', '2024-02-09', '本发'],
]

function TechFinAchievement() {
  const [sub, setSub] = useState('专利价值概览')
  return (
    <div>
      <SubTabs items={ACH_SUBTABS} active={sub} onChange={setSub} />
      {sub === '专利价值概览' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-3 border border-[#e5e6eb] rounded p-3">
            <div className="col-span-4">
              <div className="mb-2 text-xs font-medium">有权专利整体价值状况 <span className="text-gray-400">ⓘ</span></div>
              {[
                ['法律价值度', '89.8%', 'w-[89.8%]'],
                ['专利价值度', '58.09%', 'w-[58.09%]'],
                ['技术价值度', '54.67%', 'w-[54.67%]'],
                ['经济价值度', '27.58%', 'w-[27.58%]'],
              ].map((r) => (
                <div key={r[0]} className="mb-2">
                  <div className="flex items-center justify-between text-xs"><span>{r[0]}</span><span>{r[1]}</span></div>
                  <div className="mt-1 h-[6px] w-full overflow-hidden rounded bg-gray-200"><div className={`h-full bg-[#4080FF] ${r[2]}`} /></div>
                </div>
              ))}
            </div>
            <div className="col-span-4">
              <div className="mb-2 text-xs font-medium">专利价值度结构 <span className="text-gray-400">ⓘ</span></div>
              <EChart option={OPT_PATENT_VALUE} height={200} />
              <div className="mt-1 text-xs text-gray-500">
                <span className="mr-1 inline-block h-2 w-2 rounded bg-[#00B42A]" />高价值 57.60%
                <span className="mr-1 ml-2 inline-block h-2 w-2 rounded bg-[#4080FF]" />中价值 40.40%
                <span className="mr-1 ml-2 inline-block h-2 w-2 rounded bg-[#FF7D00]" />低价值 2.00%
              </div>
            </div>
            <div className="col-span-4">
              <div className="mb-2 text-xs font-medium">专利法律状态</div>
              <EChart option={OPT_PATENT_LEGAL} height={200} />
              <div className="mt-1 text-xs text-gray-500">
                <span className="mr-1 inline-block h-2 w-2 rounded bg-[#4080FF]" />有权 40.09%
                <span className="mr-1 ml-2 inline-block h-2 w-2 rounded bg-[#FF7D00]" />审中 23.96%
                <span className="mr-1 ml-2 inline-block h-2 w-2 rounded bg-[#722ED1]" />无权 35.94%
              </div>
            </div>
          </div>

          <div className="border border-[#e5e6eb] rounded p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-medium">专利信息 651</div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs">注册地区 <Chevron /></button>
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs">专利类型 <Chevron /></button>
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs">申请日期 <Chevron /></button>
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs">发布日期 <Chevron /></button>
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs"><span className="text-[#165DFF]">↓</span>下载数据</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    {['序号', '专利名称', '申请日期', '发布日期', '申请号', '专利类型', '价值分', '专利价值', '操作', '文档'].map((h) => (<th key={h} className="border border-[#e5e6eb] px-2 py-1 text-center">{h}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {ACH_PATENT.map((r) => (
                    <tr key={r[0]}>
                      <td className="border border-[#e5e6eb] px-2 py-1 text-center">{r[0]}</td>
                      <td className="border border-[#e5e6eb] px-2 py-1">{r[1]}</td>
                      <td className="border border-[#e5e6eb] px-2 py-1 text-center">{r[2]}</td>
                      <td className="border border-[#e5e6eb] px-2 py-1 text-center">{r[3]}</td>
                      <td className="border border-[#e5e6eb] px-2 py-1 text-center">{r[4]}</td>
                      <td className="border border-[#e5e6eb] px-2 py-1 text-center">{r[5]}</td>
                      <td className="border border-[#e5e6eb] px-2 py-1 text-center">{r[6]}</td>
                      <td className="border border-[#e5e6eb] px-2 py-1 text-center"><span className={r[7] === '高价值' ? 'text-[#00b42a]' : 'text-[#ff7d00]'}>{r[7]}</span></td>
                      <td className="border border-[#e5e6eb] px-2 py-1 text-center"><a className="text-[#165DFF]">详情</a></td>
                      <td className="border border-[#e5e6eb] px-2 py-1 text-center"><span className="text-[#f53f3f]">📄</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager total="共 651 条 10条/页" pages={['1', '2', '3', '4', '…', '66']} />
          </div>

          <div className="border border-[#e5e6eb] rounded p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-medium">作品著作权 2</div>
              <div className="flex items-center gap-2">
                <input className="w-48 rounded border border-[#e5e6eb] px-2 py-1 text-xs" placeholder="请输入作品名称" />
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs">作品类别 <Chevron /></button>
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs">登记日期开始 - 登记日期结束 <Chevron /></button>
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs"><span className="text-[#165DFF]">↓</span>下载数据</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    {['序号', '作品名称', '登记日期', '登记号', '作品类型', '首次发表日期', '创作完成日期'].map((h) => (<th key={h} className="border border-[#e5e6eb] px-2 py-1 text-center">{h}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {ACH_WORKS.map((r) => (
                    <tr key={r[0]}>
                      {r.map((c, i) => (<td key={i} className="border border-[#e5e6eb] px-2 py-1 text-center">{c}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="border border-[#e5e6eb] rounded p-3">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-xs font-medium">国际专利 583</div>
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs">法律状态 <Chevron /></button>
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs">申请日期开始 - 申请日期结束 <Chevron /></button>
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs">公开日期开始 - 公开日期结束 <Chevron /></button>
                <button className="flex items-center gap-1 rounded border border-[#e5e6eb] bg-white px-2 py-1 text-xs"><span className="text-[#165DFF]">↓</span>下载数据</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    {['序号', '专利名称', '申请国家', '最新状态', '申请号', '申请日期', '公开(公告)号', '公开(公告)日', '摘要'].map((h) => (<th key={h} className="border border-[#e5e6eb] px-2 py-1 text-center">{h}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {ACH_INTL.map((r) => (
                    <tr key={r[0]}>
                      {r.map((c, i) => (<td key={i} className={`border border-[#e5e6eb] px-2 py-1 ${i === 1 ? 'text-left' : 'text-center'}`}>{c}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager total="共 583 条 10条/页" pages={['1', '2', '3', '4', '…', '59']} />
          </div>
        </div>
      ) : (
        <div className="py-6">
          <EChart option={subChartFor(sub)} height={240} />
          <div className="mt-2 text-center text-xs text-gray-400">「{sub}」示例图表（样例数据）</div>
        </div>
      )}
    </div>
  )
}

/* ============ 科研团队分析 ============ */
const TEAM_SUBTABS = ['团队核心人员介绍', '科研团队', '核心研发人员稳定性', '招聘信息']
function TechFinTeam() {
  const [sub, setSub] = useState('团队核心人员介绍')
  return (
    <div>
      <SubTabs items={TEAM_SUBTABS} active={sub} onChange={setSub} />
      <div className="flex flex-col items-center justify-center py-20 text-sm text-gray-500">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <rect x="35" y="60" width="50" height="30" rx="6" fill="#e8edff" />
          <circle cx="50" cy="45" r="4" fill="#4070f4" />
          <circle cx="62" cy="32" r="4" fill="#4070f4" />
          <circle cx="75" cy="48" r="4" fill="#4070f4" />
          <circle cx="60" cy="65" r="4" fill="#4070f4" />
          <line x1="50" y1="45" x2="62" y2="32" stroke="#4070f4" strokeWidth="1.5" />
          <line x1="62" y1="32" x2="75" y2="48" stroke="#4070f4" strokeWidth="1.5" />
          <line x1="75" y1="48" x2="60" y2="65" stroke="#4070f4" strokeWidth="1.5" />
          <line x1="60" y1="65" x2="50" y2="45" stroke="#4070f4" strokeWidth="1.5" />
          <rect x="48" y="43" width="4" height="4" fill="#ff8844" />
          <rect x="60" y="30" width="4" height="4" fill="#ff8844" />
          <rect x="73" y="46" width="4" height="4" fill="#ff8844" />
          <rect x="58" y="63" width="4" height="4" fill="#ff8844" />
        </svg>
        <div className="mt-3">暂无科研团队分析信息</div>
      </div>
    </div>
  )
}

/* ============ 荣誉资质 ============ */
const HONOR_SUBTABS = ['科创榜单', '荣誉标签画像', '科技认定', '标准制定', '信用评级', '税务资质', '税务荣誉等级', '进出口信用等级 1', '游戏审批', '其他资质']
const HONOR_LIST = [
  { name: '凸版印刷株式会社北京办事处', top: 'TOP 267', topCls: 'bg-[#00b42a]', score: '80' },
  { name: '天地科技股份有限公司', top: 'TOP 1', topCls: 'bg-[#00b42a]', score: '98' },
  { name: '北方华创科技集团股份有限公司', top: 'TOP 2', topCls: 'bg-[#00b42a]', score: '98' },
  { name: '京东方科技集团股份有限公司', top: 'TOP 3', topCls: 'bg-[#165DFF]', score: '98' },
  { name: '中国生物技术股份有限公司', top: 'TOP 4', topCls: 'bg-[#165DFF]', score: '97' },
  { name: '北京奇虎科技有限公司', top: 'TOP 5', topCls: 'bg-[#165DFF]', score: '97' },
]
const HONOR_CREDIT = [
  ['1', '2012-12-03', '注册登记和备案企业', '京会展关', '不需要', '查看'],
]
function TechFinHonor() {
  const [sub, setSub] = useState('科创榜单')
  return (
    <div>
      <SubTabsPill items={HONOR_SUBTABS} active={sub} onChange={setSub} />
      {sub === '科创榜单' ? (
        <div className="space-y-6">
          <div>
            <div className="mb-2 text-sm font-medium">科创榜单</div>
            <div className="mb-3 text-xs text-gray-600">该企业入选了2026年度，朝阳区，全行业的科创企业榜单第267名</div>
            <div className="mb-3 flex gap-3">
              <div className="flex items-center rounded border border-[#e5e6eb] px-2 py-1 text-xs">朝阳区 <Cross /> <span className="ml-2 text-gray-400">▾</span></div>
              <div className="flex items-center rounded border border-[#e5e6eb] px-2 py-1 text-xs">所在行业 <span className="ml-2 text-gray-400">▾</span></div>
            </div>
            <div className="overflow-hidden rounded border border-[#e5e6eb]">
              {HONOR_LIST.map((c, i) => (
                <div key={i} className={`flex items-center justify-between px-3 py-2 ${i < HONOR_LIST.length - 1 ? 'border-b border-[#e5e6eb]' : ''}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <span>{c.name}</span>
                    <span className={`rounded px-1 text-white ${c.topCls}`}>{c.top}</span>
                  </div>
                  <div className="rounded bg-gray-100 px-2 py-0.5 text-xs">科创能力分 {c.score}</div>
                </div>
              ))}
            </div>
            <Pager total="共 500 条" pages={['1', '2', '3', '4', '…', '100']} />
          </div>

          <div>
            <div className="mb-2 text-sm font-medium">进出口信用等级 1</div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    {['序号', '注册日期', '海关信用等级', '注册海关', '年报情况', '信息来源'].map((h) => (<th key={h} className="border border-[#e5e6eb] px-2 py-2 text-center">{h}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {HONOR_CREDIT.map((r) => (
                    <tr key={r[0]}>
                      {r.map((c, i) => (<td key={i} className="border border-[#e5e6eb] px-2 py-2 text-center">{i === 5 ? <a className="text-[#165DFF]">{c}</a> : c}</td>))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-1 text-sm font-medium">
              其他资质
              <span className="text-xs text-[#165DFF]"><span className="text-gray-400">↗</span> 去企业详情页查看详情</span>
            </div>
            <div className="rounded border border-[#e5e6eb] py-6 text-center text-xs text-gray-500">
              <div className="mb-1 text-base">1 个</div>
              <div>行政许可</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6">
          <EChart option={subChartFor(sub)} height={240} />
          <div className="mt-2 text-center text-xs text-gray-400">「{sub}」示例图表（样例数据）</div>
        </div>
      )}
    </div>
  )
}

/* ============ 资产分析 ============ */
const ASSET_SUBTABS = ['专利分析', '商标分析', '软件著作权分析', '集成电路布图分析', '土地使用权分析', '动产抵押分析', '不动产分析']
const ASSET_REALTY = [
  ['1', '注册地址', '北京市东城区珠市口东大街3号119室'],
  ['2', '注册地址', '北京市通州区经济开发区东区靓丽三街9号-215'],
]
function TechFinAsset() {
  const [sub, setSub] = useState('专利分析')
  return (
    <div>
      <SubTabsPill items={ASSET_SUBTABS} active={sub} onChange={setSub} />
      {sub === '专利分析' ? (
        <div className="space-y-4">
          <div className="text-xs text-gray-600">该企业为专利分析, 无形资产420。可点击<a className="text-[#165DFF]">查看详细</a>。</div>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded border border-[#e5e6eb] p-3">
              <div className="mb-2 text-xs font-medium">专利类型分布 <span className="font-normal text-gray-400">1/2</span></div>
              <EChart option={OPT_PATENT_TYPE_BAR} height={200} />
              <div className="mt-2 text-xs text-gray-500">该企业专利中, 发明专利占比最高, 主要分布在G06F17/00、G06Q10/00、G06F19/00领域。</div>
            </div>
            <div className="rounded border border-[#e5e6eb] p-3">
              <div className="mb-2 text-xs font-medium">商标注册类别分布 <span className="font-normal text-gray-400">1/2</span></div>
              <EChart option={OPT_TRADEMARK} height={200} />
              <div className="mt-2 text-xs text-gray-500">该企业商标主要注册在第9类、第35类、第42类等类别。</div>
            </div>
          </div>
          <div className="rounded border border-[#e5e6eb] p-3">
            <div className="mb-3 text-xs font-medium">不动产分析 <span className="font-normal text-gray-400">2</span></div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f7f8fa]">
                    {['序号', '数据来源', '地址'].map((h) => (<th key={h} className="border border-[#e5e6eb] px-2 py-2 text-center">{h}</th>))}
                  </tr>
                </thead>
                <tbody>
                  {ASSET_REALTY.map((r) => (
                    <tr key={r[0]}>
                      <td className="border border-[#e5e6eb] px-2 py-2 text-center">{r[0]}</td>
                      <td className="border border-[#e5e6eb] px-2 py-2 text-center">{r[1]}</td>
                      <td className="border border-[#e5e6eb] px-2 py-2">{r[2]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-6">
          <EChart option={subChartFor(sub)} height={240} />
          <div className="mt-2 text-center text-xs text-gray-400">「{sub}」示例图表（样例数据）</div>
        </div>
      )}
    </div>
  )
}

/* ============ 风险分析 ============ */
const RISK_SUBTABS = ['债务分析', '知识产权诉讼', '专利转让 29', '专利保全', '专利被无效', '专利质押', '专利舆情']
const RISK_TRANSFER = [
  ['1', '2023-08-28', '反射型掩模以及反射型掩模的制造方法', 'CN202080072898.7', '专利申请权的转移 IPC(主分类):G03F 1/24 登记生效...', '凸版印刷株式会社', '凸版光掩模有限公司'],
  ['2', '2022-12-27', '电子器件的印刷制造系统', 'CN201480070549.6', '专利权的转移 IPC(主分类):H01L21/02 登记生效日:...', '株式会社理光 凸版印刷株式会社', '柯尼卡美能达株式会社'],
  ['3', '2022-11-14', '光掩模坯料和制造方法、光掩模、光图案...', 'CN201510140000.6', '专利权的转移 IPC(主分类):G03F1/32 登记生效日:2...', '凸版印刷株式会社', '凸版光掩模有限公司'],
  ['4', '2022-11-14', '光掩模基板以及光掩模制作方法', 'CN201310245719.7', '专利权的转移 IPC(主分类):G03F1/32 登记生效日:2...', '凸版印刷株式会社', '凸版光掩模有限公司'],
  ['5', '2022-11-11', '光掩模基板以及光掩模制作方法', 'CN200710136300.2', '专利权的转移 IPC(主分类):G03F1/32 登记生效日:2...', '凸版印刷株式会社', '凸版光掩模有限公司'],
]
function TechFinRisk() {
  const [sub, setSub] = useState('专利转让 29')
  return (
    <div>
      <SubTabsPill items={RISK_SUBTABS} active={sub} onChange={setSub} />
      {sub === '专利转让 29' ? (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-medium">专利转让 29</div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 rounded border border-[#e5e6eb] px-2 py-1 text-xs"><span className="text-gray-400">📅</span> 登记生效日期开始 - 登记生效日期结束</div>
              <button className="flex items-center gap-1 rounded border border-[#e5e6eb] px-2 py-1 text-xs"><span className="text-[#165DFF]">↓</span> 下载数据</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#f7f8fa]">
                  {['序号', '登记生效日', '专利名称', '申请号', '变更事项', '转让人', '受让人'].map((h) => (
                    <th key={h} className={`border border-[#e5e6eb] px-3 py-2 text-center ${['专利名称', '变更事项', '转让人', '受让人'].includes(h) ? 'text-left' : ''}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {RISK_TRANSFER.map((r) => (
                  <tr key={r[0]}>
                    <td className="border border-[#e5e6eb] px-3 py-2 text-center">{r[0]}</td>
                    <td className="border border-[#e5e6eb] px-3 py-2 text-center">{r[1]}</td>
                    <td className="border border-[#e5e6eb] px-3 py-2">{r[2]}</td>
                    <td className="border border-[#e5e6eb] px-3 py-2 text-center">{r[3]}</td>
                    <td className="border border-[#e5e6eb] px-3 py-2">{r[4]} <a className="text-[#165DFF]">展开</a></td>
                    <td className="border border-[#e5e6eb] px-3 py-2">{r[5]}</td>
                    <td className="border border-[#e5e6eb] px-3 py-2">{r[6]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager total="共 29 条  5条/页" pages={['1', '2', '3', '4', '…', '6']} />
        </div>
      ) : (
        <div className="py-6">
          <EChart option={subChartFor(sub)} height={240} />
          <div className="mt-2 text-center text-xs text-gray-400">「{sub}」示例图表（样例数据）</div>
        </div>
      )}
    </div>
  )
}

export default function DmTechFinDetail() {
  const { goDetail } = usePageNav()
  const [tab, setTab] = useState('企业概览')
  const [contact, setContact] = useState<null | { company: string }>(null)
  const [marketing, setMarketing] = useState(false)
    const [guidance, setGuidance] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const [headH, setHeadH] = useState(80)
  const STICKY = 56 + headH
  // 企业标签默认收起
  const [tagsCollapsed, setTagsCollapsed] = useState(true)
  useEffect(() => {
    const measure = () => { if (headerRef.current) setHeadH(headerRef.current.offsetHeight) }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  /* 公司标签 概要（1:1 复刻 record/0822/科创金融 - 详情 - 企业标签.md） */
  const TAG_SECTIONS: { label: string; tags: string[]; tone: 'blue' | 'green' }[] = [
    { label: '企业规模', tags: ['规模以上企业(官方)', '规模以上服务业(官方)', '大型企业(挖掘)'], tone: 'blue' },
    { label: '通用标签', tags: ['曾用名', '企业健康度：742分', '发票抬头', '福建新意科技集团'], tone: 'blue' },
    { label: '企业性质', tags: ['科创板上市企业竞争对手', '外商投资'], tone: 'blue' },
    { label: '榜单认定', tags: ['高新技术企业'], tone: 'green' },
    { label: '企业亮点', tags: ['标准起草单位', '有商标', '有招聘', '有网站', '有发明专利', '国家标准起草单位', '行业标准起草单位', '融资金额大', '有专利', '有软著', '上市公司供应商', '国有企业供应商', '知名企业供应商', '金融机构供应商', '双A发债企业供应商'], tone: 'green' },
    { label: '资质证照', tags: ['一般纳税人', '信息安全管理体系认证', '信息技术服务管理体系认证', '国家推行的服务认证', '软件产品证书'], tone: 'green' },
    { label: '资本市场', tags: ['股权投资'], tone: 'blue' },
    { label: '经营动态', tags: ['估值超过10亿人民币', '近3个月中标国企招投标项目', '近3个月中标上市公司招投标项目', '近3个月中标双A及以上发债人招投标项目', '近1年新增质量管理体系认证', '参保人数突破200人', '近1个月有新增软件著作权'], tone: 'green' },
  ]

  return (
    <div style={{ padding: 12 }} className="min-h-screen bg-[#f7f8fc] text-[13px] leading-relaxed text-[#222]">
      <div ref={headerRef}>
      <DetailHeader
        title="中工国际工程股份有限公司"
        crumb="数字营销 / 产业金融 / 科创金融"
        backTo="/console/dm/techfin"
        actions={
          <>
            <button onClick={() => setContact({ company: '中工国际工程股份有限公司' })} className="cursor-pointer rounded border border-[#d3d8e4] bg-white px-2.5 py-1 text-xs hover:bg-gray-50">AI触达</button>
            <button onClick={() => setGuidance(true)} className="cursor-pointer rounded border border-[#d3d8e4] bg-white px-2.5 py-1 text-xs hover:bg-gray-50">查看触客指引报告</button>
            <button onClick={() => goDetail('/console/dm/techfin-pk')} className="cursor-pointer rounded border border-[#d3d8e4] bg-white px-2.5 py-1 text-xs hover:bg-gray-50">企业PK</button>
            <button onClick={() => setMarketing(true)} className="cursor-pointer rounded border border-[#d3d8e4] bg-white px-2.5 py-1 text-xs hover:bg-gray-50">营销</button>
          </>
        }
      />
      </div>

      {/* ============ 企业信息卡片 ============ */}
      <div className="mb-2.5 rounded-md bg-white px-4 py-3.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-block rounded border border-[#73c98b] px-1.5 py-0.5 text-xs text-[#20883e]">存续</span>
          <span className="text-xs text-[#f3a226]">科创等级 AA</span>
          <span className="text-xs text-[#666]">商机事件29条 · 关联商机2480条</span>
          <span className="cursor-pointer text-[#2762e8]" onClick={() => goDetail('/console/dm/ent-archive-basic')}>完整企业详情<ArrowDown /></span>
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

      {/* ============ 公司标签 概要（1:1 复刻 企业标签.md） ============ */}
      <div className="mb-2.5 rounded-md bg-white px-4 py-3.5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-[#fff5e6] px-2 py-0.5 text-xs">科创等级 🅰️ A</span>
            <span className="cursor-pointer text-[#2762e8] text-xs">⦿ 商机线索：商机事件61条 ▶</span>
            <span className="cursor-pointer text-[#2762e8] text-xs">关联商机52条 ▶</span>
          </div>
          <button
            onClick={() => setTagsCollapsed((o) => !o)}
            className="cursor-pointer rounded border border-[#d1d5e0] px-2.5 py-1 text-xs text-[#2762e8] hover:bg-[#f4f7ff]"
          >
            {tagsCollapsed ? '展开企业标签 ▾' : '收起企业标签 ▴'}
          </button>
        </div>
        {!tagsCollapsed && (
          <>
            {TAG_SECTIONS.map((s) => (
              <div key={s.label} className="flex items-start gap-3 border-b border-dashed border-[#eef0f6] py-1.5 last:border-0">
                <div className="w-[88px] shrink-0 pt-1 text-xs text-[#666]">{s.label}</div>
                <div className="flex flex-1 flex-wrap gap-2">
                  {s.tags.map((t) => (
                    <span key={t} className={`rounded px-2 py-0.5 text-xs ${s.tone === 'blue' ? 'bg-[#e8f3ff] text-[#165DFF]' : 'bg-[#edf7ed] text-[#2e7d32]'}`}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ============ 大 Tab 栏（吸顶，吸到页面标题下方） ============ */}
      <div className="sticky z-30 flex rounded-t-md border-b border-[#e4e7f1] bg-white px-4" style={{ top: STICKY }}>
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
          <ModuleTitle title="企业概览"  />
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
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <h4 className="mb-2 text-[13px]">多维能力图</h4>
              <EChart option={RADAR_OPT} height={260} />
            </div>
          </div>

          {/* 企业健康度环形指标行（颜色提示） */}
          <div className="my-4 grid grid-cols-6 gap-2">
            {INDEXES.map((it) => {
              const c = toneCls(it.tone)
              return (
                <div key={it.label} className="text-center">
                  <div
                    className={`mx-auto mb-1.5 flex h-[70px] w-[70px] items-center justify-center rounded-full border-[3px] text-sm ${c.border}`}
                  >
                    {it.val}
                  </div>
                  <div className="text-xs">{it.label}</div>
                  <div className={`text-[11px] ${c.tag}`}>{it.desc}</div>
                </div>
              )
            })}
          </div>

          {/* 行业产业分析 + 该企业产业布局（同排） */}
          <ModuleTitle title="行业产业分析" />
          <div className="grid grid-cols-[62%_36%] gap-[2%]">
            <div className="rounded-md border border-[#e8ebf4] p-3 text-xs">
              <b>所在产业</b>：该企业属于北京市政府重点支持的产业目录中的绿色能源与节能环保产业。绿色能源与节能环保产业现有23363家存续企业。近5个季度企业数量总体呈下降趋势，平均季度增速为-0.48%。<br />
              <b>所在行业</b>：该企业属于建筑业&gt;土木工程建筑业&gt;其他土木工程建筑&gt;其他土木工程建筑施工(E4899)
            </div>
            <div className="rounded-md border border-[#e8ebf4] p-3 text-xs">
              <div className="mb-1 font-medium text-[13px]">该企业产业布局</div>
              <div className="leading-6">
                🔋储能<br />⚙️变压器<br />♻️节能环保<br />📐测量仪器<br />🔌新能源汽车充电桩<br />💉骨科植入耗材
              </div>
            </div>
          </div>

          {/* 三张统计卡片（删除占位控件，撑开铺满） */}
          <div className="my-3 grid grid-cols-3 gap-3">
            {[
              { label: '行业企业总量', val: '21,121 家' },
              { label: '行业新增融资总额', val: '650,000 万元' },
              { label: '行业专利授权总量', val: '6,353 件' },
            ].map((c) => (
              <div key={c.label} className="rounded-md border border-[#e8ebf4] p-3">
                <div className="text-xs text-[#666]">{c.label}</div>
                <div className="text-[18px] font-bold">{c.val}</div>
              </div>
            ))}
          </div>

          {/* 优质企业分布 / 资本背景分布 / 企业存活时间分布 */}
          <div className="my-3 grid grid-cols-3 gap-3">
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <ModuleTitle title="优质企业分布" />
              <EChart option={OPT_QUALITY} height={200} />
            </div>
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <ModuleTitle title="资本背景分布" />
              <div className="grid grid-cols-2 gap-2">
                {[['国有企业', '350'], ['港澳台企业', '482'], ['外资企业', '163'], ['民营企业', '41,803']].map(([n, v]) => (
                  <div key={n} className="rounded border border-[#eef0f6] bg-[#fafbff] p-2.5 text-center">
                    <div className="text-[18px] font-bold text-[#2762e8]">{v}</div>
                    <div className="text-xs text-[#666]">{n}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <ModuleTitle title="企业存活时间分布" />
              <EChart option={OPT_SURVIVE} height={200} />
            </div>
          </div>

          {/* 柱状折线图 / 环形图 组合 */}
          <div className="my-3 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <ModuleTitle title="行业企业总量与增速情况" />
              <EChart option={OPT_IND_GROWTH} height={260} />
            </div>
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <ModuleTitle title="行业新增融资情况" />
              <EChart option={OPT_FINANCE} height={260} />
            </div>
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <ModuleTitle title="投融资趋势" />
              <EChart option={OPT_INVEST_TREND} height={260} />
            </div>
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <ModuleTitle title="行业财务分析" />
              <EChart option={OPT_FINANCE_ROE} height={260} />
            </div>
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <ModuleTitle title="创新投入图表" />
              <EChart option={OPT_INNOVATION} height={260} />
            </div>
            <div className="rounded-md border border-[#e8ebf4] p-3">
              <ModuleTitle title="专利类型分布饼图" />
              <EChart option={OPT_PATENT} height={260} />
            </div>
          </div>

          {/* 上下游 */}
          <ModuleTitle title="上下游" />
          <div className="mb-3 grid grid-cols-3 gap-3">
            {[['供应商', '95', '上游配套企业'], ['客户', '7', '下游采购企业'], ['竞争对手', '3', '同业竞品企业']].map(([n, v, d]) => (
              <div key={n} className="flex min-h-[92px] flex-col justify-center rounded-md border border-[#e8ebf4] bg-gradient-to-b from-[#f7f9ff] to-white p-3">
                <div className="text-xs text-[#666]">{n}</div>
                <div className="text-[26px] font-bold leading-none text-[#2762e8]">{v}</div>
                <div className="mt-1 text-[11px] text-gray-400">{d}</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto rounded-md border border-[#e8ebf4]">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-[#f3f5fc]">
                  {['序号', '品名名称(竞品名称)', '融资轮次', '所属地', '企业名称', '成立日期', '简介', '企业健康度', '科创分', '空壳指数', '合同违约指数'].map((h) => (
                    <th key={h} className="border border-[#e4e7f1] px-2 py-2 text-center">{h}</th>
                  ))}
                </tr>
                </thead>
              <tbody>
                {[
                  ['中铝国际', 'IPO', '北京', '中铝国际工程股份有限公司', '2003-12-16', '大型有色金属工程承包商', '830', '95', '低', '低'],
                  ['三维化学', 'IPO', '山东', '山东三维化学集团股份有限公司', '1994-11-18', '化工石化工程服务商', '760', '85', '低', '低'],
                  ['中国铁建', 'IPO', '北京', '中国铁建股份有限公司', '2007-11-05', '综合建筑工程央企', '818', '96', '低', '低'],
                  ['东华科技', 'IPO', '安徽', '东华工程科技股份有限公司', '2001-07-18', '化工工程设计与总承包', '872', '89', '低', '低'],
                  ['上海建工', 'IPO', '上海', '上海建工集团股份有限公司', '1998-06-15', '建筑施工总承包龙头', '735', '95', '低', '低'],
                  ['宁德时代', 'IPO', '福建', '宁德时代新能源科技股份有限公司', '2011-12-16', '动力电池系统提供商', '905', '92', '低', '低'],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className="border border-[#e4e7f1] px-2 py-1.5 text-center">{i + 1}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5">{r[0]}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5 text-center">{r[1]}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5 text-center">{r[2]}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5">{r[3]}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5 text-center">{r[4]}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5">{r[5]}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5 text-center text-[#00b42a]">{r[6]}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5 text-center">{r[7]}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5 text-center text-[#00b42a]">{r[8]}</td>
                    <td className="border border-[#e4e7f1] px-2 py-1.5 text-center text-[#00b42a]">{r[9]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 企业信息 工商基础信息 */}
          <div className="mt-3">
            <ModuleTitle
              title={<span>企业信息 <span className="cursor-pointer text-[#2762e8]" onClick={() => goDetail('/console/dm/ent-archive-basic')}>完整企业详情<ArrowDown /></span></span>}
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
            <ModuleTitle title="团队分析"  />
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
            <ModuleTitle title="资本市场分析"  />
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
            <ModuleTitle title="资产分析"  />
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
            <ModuleTitle title="风险分析"  />
            <div className="border-b border-dotted border-[#e2e5f0] py-2 text-xs">
              <b>中风险（1项）</b>：环保公告1次
            </div>
            <div className="border-b border-dotted border-[#e2e5f0] py-2 text-xs">
              <b>低风险（2项）</b>：股权质押（0.28%），员工人数458人
            </div>
            <div className="border-b border-dotted border-[#e2e5f0] py-2 text-xs">
              <b>利好信息（25项）</b>：A级纳税人，招投标项目，近72年名单，合同违约指数，经营状态存续，科创等级AA，国有企业，企业健康度825分，成立25年，实缴资本100%等。
            </div>
          </div>

          {/* 企业舆情 */}
          <div className="mt-3">
            <ModuleTitle title="企业舆情"  />
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

      {/* ============ 其余 6 个分析 Tab ============ */}
      {tab === '科创能力分析' && (
        <div className="rounded-b-md bg-white px-4 py-3.5">
          <TechFinAbility stickyTop={STICKY + 44} scrollMt={STICKY + 90} />
        </div>
      )}
      {tab === '科创成果分析' && (
        <div className="rounded-b-md bg-white px-4 py-3.5">
          <TechFinAchievement />
        </div>
      )}
      {tab === '科研团队分析' && (
        <div className="rounded-b-md bg-white px-4 py-3.5">
          <TechFinTeam />
        </div>
      )}
      {tab === '荣誉资质' && (
        <div className="rounded-b-md bg-white px-4 py-3.5">
          <TechFinHonor />
        </div>
      )}
      {tab === '资产分析' && (
        <div className="rounded-b-md bg-white px-4 py-3.5">
          <TechFinAsset />
        </div>
      )}
      {tab === '风险分析' && (
        <div className="rounded-b-md bg-white px-4 py-3.5">
          <TechFinRisk />
        </div>
      )}

      {/* ============ 弹窗：AI触达（全部联系方式） ============ */}
      <RightDrawer open={!!contact} onClose={() => setContact(null)} title={contact ? `${contact.company} - 全部联系方式` : ''} width={820} level={2}>
        {contact && (
          <div>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-blue-600 text-sm font-bold text-white">中</div>
              <div>
                <span className="text-base font-bold">{contact.company}</span>
                <span className="ml-1 rounded bg-green-100 px-1.5 py-0.5 text-xs text-green-700">存续</span>
                <div className="mt-1 text-xs text-gray-500">123,740.8937万人民币 ｜ 2001-05-22 ｜ 建筑业</div>
              </div>
            </div>
            <div className="mb-4">
              <div className="mb-3 flex items-center justify-between">
                <div className="text-base font-medium">全部联系方式</div>
                <div className="flex gap-2">
                  <button className="rounded border border-slate-200 px-3 py-1 text-xs">AI 分析</button>
                  <button className="rounded border border-slate-200 px-3 py-1 text-xs">下载</button>
                </div>
              </div>
              <table className="w-full border-collapse text-xs">
                <thead>
                  <tr>
                    <th className="border border-slate-200 bg-slate-50 p-2 text-left">序号</th>
                    <th className="border border-slate-200 bg-slate-50 p-2 text-left">联系方式</th>
                    <th className="border border-slate-200 bg-slate-50 p-2 text-left">类型</th>
                    <th className="border border-slate-200 bg-slate-50 p-2 text-left">来源</th>
                    <th className="border border-slate-200 bg-slate-50 p-2 text-left">空号筛选</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { seq: '1', c: '010-8888xxxx', t: '座机', s: '招投标大数据', e: '未检测' },
                    { seq: '2', c: '138xxxx8888', t: '电话', s: '工商', e: '实号' },
                    { seq: '3', c: 'bj@camc.com', t: '邮箱', s: '年报', e: '无需检测' },
                  ].map((r) => (
                    <tr key={r.seq}>
                      <td className="border border-slate-200 p-2">{r.seq}</td>
                      <td className="border border-slate-200 p-2">{r.c}</td>
                      <td className="border border-slate-200 p-2">{r.t}</td>
                      <td className="border border-slate-200 p-2">{r.s}</td>
                      <td className="border border-slate-200 p-2">{r.e}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-3 flex items-center justify-end gap-2 text-xs">
                <span>共 3 条</span>
                <button className="rounded border border-slate-200 px-2 py-0.5">&lt;</button>
                <button className="rounded border border-brand-600 bg-brand-600 px-2 py-0.5 text-white">1</button>
                <button className="rounded border border-slate-200 px-2 py-0.5">&gt;</button>
              </div>
            </div>
            <div>
              <div className="mb-2 text-base font-medium">存客触达</div>
              <div className="text-xs text-gray-700">您的存客中暂未发现与该企业的关联关系。可<span className="cursor-pointer text-brand-600">上传更多存客名单</span>，查看更多触达路径（上传后，第二天凌晨生效）</div>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* ============ 弹窗：营销（关联营销） ============ */}
      <RightDrawer open={marketing} onClose={() => setMarketing(false)} title="中工国际工程股份有限公司 - 关联营销" width={860} level={2}>
        <div className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            {[['关联营销', 242], ['集团营销', 74369], ['相似营销', 1], ['位置营销', 6689]].map(([t, n]) => (
              <div key={t as string} className="rounded-md border border-slate-100 p-3 text-center">
                <div className="text-xs text-slate-500">{t}</div>
                <div className="text-2xl font-bold text-brand-600">{n as number}</div>
              </div>
            ))}
          </div>
          <div>
            <div className="mb-2 text-base font-medium">关联营销</div>
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr>
                  <th className="border border-slate-200 bg-slate-50 p-2 text-left">序号</th>
                  <th className="border border-slate-200 bg-slate-50 p-2 text-left">营销主题</th>
                  <th className="border border-slate-200 bg-slate-50 p-2 text-left">触达渠道</th>
                  <th className="border border-slate-200 bg-slate-50 p-2 text-left">状态</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { s: '1', m: '科创金融政策宣讲会', c: '短信+邮件', st: '已发送' },
                  { s: '2', m: '产业链上下游对接', c: '企微', st: '进行中' },
                  { s: '3', m: '融资需求调研', c: '电话', st: '待启动' },
                ].map((r) => (
                  <tr key={r.s}>
                    <td className="border border-slate-200 p-2">{r.s}</td>
                    <td className="border border-slate-200 p-2">{r.m}</td>
                    <td className="border border-slate-200 p-2">{r.c}</td>
                    <td className="border border-slate-200 p-2">{r.st}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </RightDrawer>

      {/* ============ 弹窗：查看触客指引报告 ============ */}
      <Modal open={guidance} onClose={() => setGuidance(false)} title="触客指引报告" width="max-w-2xl">
        <div className="space-y-3 text-sm">
          <p>本报告基于企业科创资质、产业布局与经营动态，生成针对性触客策略：</p>
          <ul className="list-disc space-y-1 pl-5 text-xs text-slate-600">
            <li>该企业为国资背景、科创潜力客户，建议优先推送科创信贷与产业基金产品。</li>
            <li>产业链上下游含 95 家供应商、7 家客户，可通过供应链金融切入。</li>
            <li>近期中标国企/上市公司项目，适合推荐招投标履约保函。</li>
          </ul>
        </div>
      </Modal>
    </div>
  )
}
