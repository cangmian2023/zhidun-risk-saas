// 智能金融风控平台 · 首页（克制高级官网风，2026-08-31 重做）
// 设计语言：浅色留白 + 单一品牌蓝(brand-600) 强调 + 静态产品示意，无炫光/无口号文案
import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'

const stats = [
  { value: '8', label: '一体化业务子系统' },
  { value: '3000+', label: '服务金融机构' },
  { value: '贷前 → 贷后', label: '风险全生命周期覆盖' },
  { value: '规则 + 模型', label: '双决策引擎' },
]

// 八大业务子系统：to=控制台真实入口，points=核心功能
const subsystems = [
  {
    no: '01',
    to: '/console/cr/overview',
    tag: '零售信贷风控',
    title: '贷前审核 · 贷中监控',
    desc: '覆盖信贷全生命周期，从申贷进件、信息核验到贷中持续监测，识别欺诈、关联与共债风险。',
    points: ['贷前进件审核', '信息核验 / 信用 / 欺诈报告', '红黄灯预警工作台', '单客 360 画像与评分'],
  },
  {
    no: '02',
    to: '/console/sc/score-records',
    tag: '评分产品',
    title: '智察分 · 智信分 · 智融分',
    desc: '面向欺诈与违约场景的标准化评分，分数直观、可解释，覆盖模型管理、分布监控与自动处置。',
    points: ['三产品评分总览', '模型管理与效果', '评分分布与漂移', '自动处置策略'],
  },
  {
    no: '03',
    to: '/console/ep/fk-risk-warning',
    tag: '企业风控',
    title: '企业风险全景洞察',
    desc: '围绕企业关联关系、股权结构、经营与法律风险，构建实控人穿透、受益所有人认定的全景风控。',
    points: ['关联关系与股权图谱', '实控 / 受益人穿透', '经营与法律风险', '尽调 / 体检 / 财产报告'],
  },
  {
    no: '04',
    to: '/console/dm/ai-marketing',
    tag: '数字营销',
    title: '智能营销拓客',
    desc: '一站式智能营销工作台，全维搜索、区域商机、地图拓客与客群运营，助力精准获客。',
    points: ['AI 营销工作台', '全维搜索与区域商机', '地图 / 网格拓客', '营销名单与线索'],
  },
  {
    no: '05',
    to: '/console/dg/meta-event',
    tag: '数据治理',
    title: '元数据与埋点管理',
    desc: '统一管理事件元定义、用户 / 物品维度、虚拟属性与复合事件，支撑下游建模与监控。',
    points: ['元事件与属性', '用户 / 物品维度', 'SQL 派生属性', '可视化全埋点'],
  },
  {
    no: '06',
    to: '/console/zz/cases',
    tag: '催贷管理',
    title: '智能催收作业',
    desc: '覆盖案件管理、坐席工作台、AI 外呼、委外与法务的一体化催收闭环与质检。',
    points: ['案件队列与详情', '坐席 / AI 外呼', '委外与法务', '智能质检与 BI 报表'],
  },
  {
    no: '07',
    to: '/console/de/overview',
    tag: '决策引擎',
    title: '规则 + 模型 双引擎',
    desc: '可视化策略配置，灵活组合规则、名单与模型，快速上线并持续调优。',
    points: ['决策建模', '策略 / 特征 / 名单', '决策流编排', '决策核验与回放'],
  },
  {
    no: '08',
    to: '/console/cm/rule-hub',
    tag: '管理中心',
    title: '规则与配置中枢',
    desc: '统一预警规则、规则合集与跨子系统配置，集中管控平台级策略与档案备份。',
    points: ['统一预警配置', '规则合集管理', '元数据配置', '档案备份'],
  },
]

const advantages = [
  {
    title: '跨场景联防联控',
    desc: '整合多业务线风险标签，识别跨平台多头申贷与关联风险，打破信息孤岛。',
  },
  {
    title: '专家经验 + 机器学习',
    desc: '将资深风控经验与建模能力结合，输出可解释、可追溯的决策结果。',
  },
  {
    title: '设备与环境识别',
    desc: '基于设备指纹识别异常设备行为，定位可疑操作与骗贷风险团伙。',
  },
  {
    title: '灵活的交付方式',
    desc: '支持 API、文件交换、页面嵌入等多种集成形态，适配机构既有系统。',
  },
]

// 静态产品界面示意（克制，非动画/非炫光）
function ConsolePreview() {
  const stages = [
    { k: '贷前', v: '进件审核', c: 'bg-brand-50 text-brand-700' },
    { k: '贷中', v: '持续监测', c: 'bg-slate-100 text-slate-600' },
    { k: '贷后', v: '预警处置', c: 'bg-slate-100 text-slate-600' },
  ]
  const rows = [
    { name: '企业关联穿透', status: '已启用', c: 'text-emerald-600' },
    { name: '评分分布监控', status: '运行中', c: 'text-brand-600' },
    { name: '催收策略画布', status: '已配置', c: 'text-emerald-600' },
  ]
  return (
    <div className="relative">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          </div>
          <span className="text-xs text-slate-400">风控工作台</span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {stages.map((s) => (
            <div key={s.k} className={`rounded-lg px-3 py-2.5 ${s.c}`}>
              <p className="text-xs font-medium opacity-70">{s.k}</p>
              <p className="text-sm font-semibold">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-100">
          {rows.map((r) => (
            <div key={r.name} className="flex items-center justify-between px-3 py-2.5">
              <span className="text-sm text-slate-600">{r.name}</span>
              <span className={`text-xs font-medium ${r.c}`}>{r.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute -bottom-5 -right-3 hidden rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-card sm:block">
        <p className="text-xs text-slate-400">实时预警</p>
        <p className="text-lg font-semibold text-ink-900">8 大子系统 · 在线</p>
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div>
      {/* Hero —— 浅色克制 */}
      <section className="bg-white">
        <div className="container-page grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="fade-up">
            <span className="chip">智能金融风控平台</span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-ink-900 sm:text-5xl">
              覆盖信贷全生命周期的
              <br />
              一体化智能风控能力
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-600">
              整合零售信贷、企业风控、数字营销、催贷管理、决策引擎、评分产品、数据治理与管理中心八大业务子系统，
              以规则与模型双引擎，为金融机构提供从贷前审核到贷后管理的端到端风控与营销作业支持。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/console" className="btn-primary">
                进入工作台
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <a href="#modules" className="btn-ghost">
                浏览八大子系统
              </a>
            </div>
          </div>
          <div className="fade-up">
            <ConsolePreview />
          </div>
        </div>
      </section>

      {/* 数据条 —— 中性事实 */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="container-page grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-ink-900 sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 八大子系统 */}
      <section id="modules" className="bg-white py-20">
        <div className="container-page">
          <SectionHeading
            center
            eyebrow="业务子系统"
            title="八大业务子系统，覆盖风险全生命周期"
            desc="从零售信贷、企业风控到数字营销与催贷管理，覆盖风险全生命周期与营销作业闭环。"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {subsystems.map((m) => (
              <Link
                key={m.tag}
                to={m.to}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-sm font-semibold text-brand-700">
                    {m.no}
                  </span>
                  <span className="text-sm font-medium text-brand-700">{m.tag}</span>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{m.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-500">{m.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.points.map((p) => (
                    <span
                      key={p}
                      className="rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  进入子系统
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 核心能力 */}
      <section className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why Us"
            title="为什么选择风控云平台"
            desc="以数据、模型与工程能力，帮助机构把风控从成本中心变为竞争力。"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a, i) => (
              <div key={a.title} className="rounded-2xl border border-slate-200 bg-white p-6">
                <span className="text-2xl font-bold text-brand-200">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink-900">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 收尾 CTA —— 克制务实 */}
      <section className="bg-white py-20">
        <div className="container-page">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 px-8 py-16 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-ink-900">需要为您的机构定制风控方案？</h2>
            <p className="mx-auto mt-4 max-w-xl text-slate-500">
              基于现有八大子系统可快速部署，支持私有化与 API 对接，适配机构既有业务系统。
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link to="/console" className="btn-primary">
                进入工作台
              </Link>
              <a href="mailto:contact@risk-platform.example" className="btn-ghost">
                联系我们
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
