import React, { useEffect, useRef, useState } from 'react'
import * as echarts from 'echarts'
import { PageShell } from './PageShell'

const GROUPS = ['全部', '未分组', '长时间未联系', '重点维护']
const PERIODS: { label: string; range?: string }[] = [
  { label: '近一个月', range: '2026/08/01 - 2026/08/19' },
  { label: '近两个月' },
  { label: '近三个月' },
  { label: '第一季度' },
  { label: '第二季度' },
  { label: '第三季度' },
  { label: '第四季度' },
]
const FOCUS_TABS = ['高风险等级', '高违约风险', '事件top20']
const TABLE_COLS = [
  '企业名称', '注册资本', '成立年限', '企业规模', '企业性质',
  '上市情况', '所属行业', '所属区域', '信用等级', '启信分', '所属分组',
]

/* ---- 图标（FontAwesome → 内联 SVG） ---- */
function InfoIcon() {
  return (
    <svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor" className="inline-block">
      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm32 664c0 4.4-3.6 8-8 8h-48c-4.4 0-8-3.6-8-8V456c0-4.4 3.6-8 8-8h48c4.4 0 8 3.6 8 8v272zm-32-344a48 48 0 110-96 48 48 0 010 96z" />
    </svg>
  )
}
function QuestionIcon() {
  return (
    <svg viewBox="0 0 1024 1024" width="14" height="14" fill="currentColor" className="inline-block">
      <path d="M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 708c-30.9 0-56-25.1-56-56s25.1-56 56-56 56 25.1 56 56-25.1 56-56 56zm58-346c-29.6 19.5-44.4 32.6-44.4 64.5V504c0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8v-13.5c0-20.6 5.5-29.6 33.4-49.6C673.4 414 696 374.3 696 328c0-96.6-78.4-176-176-176-95.8 0-176 78.4-176 176 0 4.4 3.6 8 8 8h48c4.4 0 8-3.6 8-8 0-58.5 47.5-104 104-104 58.5 0 104 47.5 104 104 0 32.1-15.6 60.7-44 82z" />
    </svg>
  )
}
function DownloadIcon() {
  return (
    <svg viewBox="0 0 1024 1024" width="12" height="12" fill="currentColor" className="inline-block">
      <path d="M505.7 661a8 8 0 0012.6 0l112-141.7c4.1-5.2.4-12.9-6.3-12.9h-74.1V168c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v338.3H400c-6.7 0-10.4 7.7-6.3 12.9l112 141.8z" />
      <path d="M878 726h-60c-4.4 0-8 3.6-8 8v86H214v-86c0-4.4-3.6-8-8-8h-60c-4.4 0-8 3.6-8 8v134c0 17.7 14.3 32 32 32h732c17.7 0 32-14.3 32-32V734c0-4.4-3.6-8-8-8z" />
    </svg>
  )
}

/* 空白 echarts 画布（与源一致：echarts.init 后不 setOption） */
function ChartBox() {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!ref.current) return
    const inst = echarts.init(ref.current)
    const onResize = () => inst.resize()
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      inst.dispose()
    }
  }, [])
  return <div ref={ref} className="h-[220px] w-full" />
}

function Card({ title, question, children }: { title: string; question?: boolean; children: React.ReactNode }) {
  return (
    <div className="rounded bg-white p-3 shadow-sm">
      <h4 className="mb-2 flex items-center font-medium">
        {title}
        {question && <span className="ml-1 text-gray-400"><QuestionIcon /></span>}
      </h4>
      {children}
    </div>
  )
}

export default function DmCrowdAnalysis() {
  const [group, setGroup] = useState('全部')
  const [period, setPeriod] = useState(0)
  const [focusTab, setFocusTab] = useState('高风险等级')

  return (
    <div className="min-h-full bg-gray-50 text-sm text-gray-700">
      <PageShell title="客群分析" crumb="数字营销 / 营销管理" legend={false} />

      <div className="mx-auto max-w-[1200px] p-4">
        {/* 顶部提示 */}
        <div className="mb-4 flex items-center text-xs text-[#ff7d00]">
          <InfoIcon />
          <span className="ml-1">温馨提示：企业动态每晚进行更新，新添加企业将于次日展示统计结果</span>
        </div>

        {/* 筛选栏：客群分组 + 分析周期 */}
        <div className="mb-4 flex flex-wrap items-center gap-y-3 gap-x-6 rounded bg-white p-3">
          <div className="flex items-center">
            <span className="mr-2 font-medium">客群分组</span>
            <div className="flex gap-1">
              {GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  className={`rounded px-3 py-1 ${group === g ? 'bg-[#1677ff] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center">
            <span className="mr-2 font-medium">分析周期</span>
            <div className="flex flex-wrap gap-1">
              {PERIODS.map((p, i) => (
                <button
                  key={p.label}
                  onClick={() => setPeriod(i)}
                  className={`rounded px-3 py-1 ${period === i ? 'bg-[#1677ff] text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  {period === i && p.range ? `${p.label}： ${p.range}` : p.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========== 模块1：企业结构 ========== */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium">企业结构</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card title="注册资本"><ChartBox /></Card>
            <Card title="成立年限"><ChartBox /></Card>
            <Card title="企业规模"><ChartBox /></Card>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Card title="企业性质">
              <ChartBox />
              <div className="mt-1 text-center text-xs">● 上市企业0家 ● 非上市企业2家</div>
            </Card>
            <Card title="行业分布"><ChartBox /></Card>
            <Card title="区域分布"><ChartBox /></Card>
          </div>
        </div>

        {/* ========== 模块2：信用质量 ========== */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium">信用质量</h3>
          <div className="grid grid-cols-3 gap-4">
            <Card title="信用等级" question><ChartBox /></Card>
            <Card title="空壳指数" question><ChartBox /></Card>
            <Card title="合同违约风险" question><ChartBox /></Card>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="col-span-3 rounded bg-white p-3 shadow-sm">
              <h4 className="mb-2 font-medium">事件动态</h4>
              <ChartBox />
            </div>
          </div>
        </div>

        {/* ========== 模块3：动态分析 ========== */}
        <div className="mb-6">
          <h3 className="mb-3 font-medium">动态分析</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card title="经营变更"><ChartBox /></Card>
            <Card title="合规管控"><ChartBox /></Card>
            <Card title="司法诉讼(审批流程)"><ChartBox /></Card>
            <Card title="负面舆情" question>
              <div className="flex h-[220px] items-center justify-center bg-[#1677ff] text-white">客户投诉 5</div>
            </Card>
          </div>
          <div className="mt-4 grid grid-cols-1 gap-4">
            <Card title="发展实力"><ChartBox /></Card>
          </div>
        </div>

        {/* ========== 模块4：重点关注企业 表格 ========== */}
        <div className="mb-4 rounded bg-white p-3 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center font-medium">
              重点关注企业
              <span className="ml-1 text-gray-400"><QuestionIcon /></span>
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">上限 5000 条</span>
              <button className="flex items-center rounded border px-3 py-1 text-xs">
                <DownloadIcon />
                <span className="ml-1">导出</span>
              </button>
            </div>
          </div>
          {/* Tab 切换 */}
          <div className="mb-3 flex border-b">
            {FOCUS_TABS.map((t) => (
              <button
                key={t}
                onClick={() => setFocusTab(t)}
                className={`border-b-2 px-3 py-1 ${focusTab === t ? 'border-[#1677ff] text-[#1677ff]' : 'border-transparent text-gray-500'}`}
              >
                {t}
              </button>
            ))}
          </div>
          {/* 表格 */}
          <div className="overflow-x-auto"><table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-1 py-2 text-left"><input type="checkbox" /></th>
                <th className="px-1 py-2 text-left">序号</th>
                {TABLE_COLS.map((c) => (
                  <th key={c} className="px-1 py-2 text-left">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={13} className="py-6 text-center text-gray-400">暂无数据</td>
              </tr>
            </tbody>
          </table></div>
        </div>
      </div>
    </div>
  )
}
