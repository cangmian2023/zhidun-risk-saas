import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

// 以下所有文案/字段均取自源快照 `营销 - 客群分析`，未做任何编造。
const GROUPS = ['全部', '未分组', '长时间未联系', '重点维护']
const PERIODS: { label: string; range?: string }[] = [
  { label: '近一个月', range: '2026/08/01 - 2026/08/17' },
  { label: '近两个月' },
  { label: '近三个月' },
  { label: '第一季度' },
  { label: '第二季度' },
  { label: '第三季度' },
  { label: '第四季度' },
]

// 源快照中均为图表分区（ECharts 实时渲染，DOM 未含数据），仅还原分区标题，图表区留空。
const DIMENSIONS = ['企业结构', '注册资本', '成立年限', '企业规模', '企业性质', '行业分布', '区域分布']

// 信用质量的三个区块在源里都是「图表」：描述文字保留为图注，分档/色阶作为图例，图表区本身留空（无数据）。
const CREDIT_CHARTS = [
  {
    title: '信用等级',
    desc: '从公司成长性、资本背景、经营质量、企业规模、知识产权、风险状况等多个维度计算出的综合评分，用于表征企业的资质和信用状况。',
    legend: ['优秀 700~1000分', '良好 550~700分', '一般 小于550分'],
  },
  {
    title: '空壳指数',
    desc: '主要用于识别套牌公司、僵尸企业、皮包公司等非正常经营的企业，启信宝从企业经营场所、资产形态、企业人员、经营活动、经营资质以及风险信息对该企业进行六维扫描。',
    legend: ['L1 低风险 0~30分', 'L2 低风险 30~50分', 'L3 中风险 50~70分', 'L4 高风险 70~80分', 'L5 高风险 80~100分'],
  },
  {
    title: '合同违约风险',
    desc: '利用大数据挖掘技术，对企业近五年裁判文书中合同违约进行量化评估，以此判断主体在所属行业内的相对履约表现水平，也反映主体未来合作风险高低。分值越低，代表历史合同履约表现越好，未来违约的概率也越小。此外，合同违约特指买卖业务中发生的纠纷，如资源采购、商业合作、消费品零售等场景，不包含投资、贷款、所有权等纠纷。',
    legend: ['低 0~10分', '中 11~30分', '高 31~100分'],
  },
]

// 事件动态：源为 7 个 Tab，每个 Tab 对应一个图表 / 数据视图（DOM 无数据 → 图表区留空；重点关注企业为表）。
const EVENT_TABS = ['动态分析', '经营变更', '合规管控', '司法诉讼(审批流程)', '负面舆情', '发展实力', '重点关注企业']

// 源快照中「重点关注企业」表为虚拟表（无行数据），仅保留列头与「暂无数据」空态。
const FOCUS_COLUMNS = [
  { key: 'idx', label: '序号', width: '60px' },
  { key: 'name', label: '企业名称', fixed: 'left' },
  { key: 'list', label: '上市情况' },
  { key: 'ind', label: '所属行业' },
  { key: 'region', label: '所属区域' },
  { key: 'score', label: '启信分', align: 'right' as const },
  { key: 'group', label: '所属分组' },
]

// 图表占位：源 DOM 无数据，仅还原图表区轮廓 + 图例（若有），不编造任何数值。
function ChartBox({ legend }: { legend?: string[] }) {
  return (
    <div className="flex h-44 flex-col items-center justify-center gap-3 rounded-md border border-dashed border-slate-200 bg-slate-50/40 text-xs text-slate-400">
      <span>暂无数据</span>
      {legend && legend.length > 0 && (
        <div className="flex max-w-full flex-wrap justify-center gap-1.5 px-2">
          {legend.map((l) => (
            <span key={l} className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-500 ring-1 ring-slate-200">{l}</span>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DmCrowdAnalysis() {
  const [group, setGroup] = useState('重点维护')
  const [period, setPeriod] = useState('近一个月')
  const [eventTab, setEventTab] = useState('重点关注企业')

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="客群分析"
        crumb="数字营销 / 存客管理"
        subtitle="存量客群分层与价值 / 流失 / 潜力分析：结构、信用质量与事件动态多维洞察"
      />

      <div className="mb-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        温馨提示：企业动态每晚进行更新，新添加企业将于次日展示统计结果
      </div>

      {/* 筛选：客群分组 + 分析周期 */}
      <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel title="客群分组" className="bg-white">
          <div className="flex flex-wrap gap-1.5">
            {GROUPS.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`rounded-md border px-2.5 py-1 text-xs transition ${
                  group === g ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </Panel>
        <Panel
          title="分析周期"
          className="bg-white"
          actions={<span className="text-xs text-slate-400">{PERIODS.find((p) => p.label === period)?.range ?? ''}</span>}
        >
          <div className="flex flex-wrap gap-1.5">
            {PERIODS.map((p) => (
              <button
                key={p.label}
                onClick={() => setPeriod(p.label)}
                className={`rounded-md border px-2.5 py-1 text-xs transition ${
                  period === p.label ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </Panel>
      </div>

      {/* 结构类维度（图表分区，源无数据 → 留空） */}
      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {DIMENSIONS.map((d) => (
          <Panel key={d} title={d} className="bg-white">
            <ChartBox />
          </Panel>
        ))}
      </div>

      {/* 信用质量（三项均为图表，描述作图注，分档/色阶作图例，图表区留空） */}
      <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {CREDIT_CHARTS.map((c) => (
          <Panel
            key={c.title}
            title={c.title}
            className="bg-white"
            desc={<span className="text-xs leading-relaxed text-slate-400">{c.desc}</span>}
          >
            <ChartBox legend={c.legend} />
          </Panel>
        ))}
      </div>

      {/* 事件动态（Tab + 图表 / 表） */}
      <Panel
        title="事件动态"
        className="bg-white"
        desc={<span className="text-xs text-slate-400">高风险等级 · 高违约风险 · 事件top20</span>}
        actions={
          eventTab === '重点关注企业' ? (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>上限 5000 条</span>
              <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:border-brand-300">导出</button>
              <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:border-brand-300">导出所选</button>
              <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:border-brand-300">导出全部</button>
            </div>
          ) : undefined
        }
      >
        <div className="mb-3 flex flex-wrap gap-1.5">
          {EVENT_TABS.map((m) => (
            <button
              key={m}
              onClick={() => setEventTab(m)}
              className={`rounded-md border px-2.5 py-1 text-xs transition ${
                eventTab === m ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        {eventTab === '重点关注企业' ? (
          <div>
            <DataTable pager pageSizeOptions={[10, 20]} columns={FOCUS_COLUMNS} rows={[]} />
            <div className="py-6 text-center text-sm text-slate-400">暂无数据</div>
          </div>
        ) : (
          <ChartBox />
        )}
      </Panel>
    </div>
  )
}
