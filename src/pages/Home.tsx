// ⚠️ 待重构（2026-07-18 标记）：初版营销展示页原型，保留现状，待用户给出具体改动要求后再修改。
import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import CTASection from '../components/CTASection'

const stats = [
  { value: '3000+', label: '服务金融机构' },
  { value: '10亿+', label: '日均决策调用' },
  { value: '99.5%', label: '欺诈识别准确率' },
  { value: '32', label: '覆盖行业场景' },
]

const modules = [
  {
    to: '/credit-risk',
    tag: '零售信贷风控',
    title: '贷前审核 · 贷中监控',
    desc: '覆盖信贷全生命周期，从申贷审核到贷中持续监测，识别欺诈、关联与共债风险。',
    points: ['信息核验', '信用风控', '欺诈识别', '红黄灯预警'],
    accent: 'from-brand-500 to-brand-700',
  },
  {
    to: '/scoring',
    tag: '评分产品',
    title: '智能察分 / 信分 / 融分',
    desc: '面向欺诈与违约场景的标准化评分，分数直观、可解释，助力自动化决策。',
    points: ['欺诈预测 0-100', '信用评分 300-900', '融合多维评分', '高频自动化监控'],
    accent: 'from-cyan-500 to-blue-600',
  },
  {
    to: '/credit-risk',
    tag: '决策引擎',
    title: '规则 + 模型 双引擎',
    desc: '可视化策略配置，灵活组合规则、名单与模型，快速上线并持续调优。',
    points: ['可视化配置', '实时决策', 'A/B 测试', '效果回溯'],
    accent: 'from-violet-500 to-indigo-600',
  },
]

const advantages = [
  {
    title: '跨行业联防联控',
    desc: '汇聚多行业风险标签，识别在多个平台多头申贷的高风险人群，破解信息孤岛。',
  },
  {
    title: '前沿建模能力',
    desc: '资深专家经验与机器学习结合，构建科学、可解释的模型与决策报告。',
  },
  {
    title: '设备指纹技术',
    desc: '基于设备指纹识别可疑与异常设备行为，精准定位骗贷风险团伙。',
  },
  {
    title: '灵活交付方式',
    desc: '支持 API、URL 推送、文件交换、网页下载等多种结果获取形式。',
  },
]

function HeroVisual() {
  return (
    <div className="relative grid h-72 w-full place-items-center rounded-3xl border border-white/10 bg-ink-800/80 p-6 shadow-glow sm:h-80">
      <div className="absolute inset-0 rounded-3xl bg-grid-line [background-size:26px_26px] opacity-30" />
      <div className="relative h-56 w-56">
        <div className="absolute inset-0 rounded-full border border-brand-400/30" />
        <div className="absolute inset-8 rounded-full border border-brand-400/30" />
        <div className="absolute inset-[4.5rem] rounded-full border border-brand-400/30" />
        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-brand-400/20" />
        <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-brand-400/20" />
        <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 origin-bottom animate-spin-slow rounded-full bg-gradient-to-t from-brand-500/40 to-transparent blur-[1px]" />
        <span className="absolute left-1/2 top-3 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_4px_rgba(34,211,238,0.6)]" />
        <span className="absolute bottom-6 right-8 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_3px_rgba(251,191,36,0.6)]" />
        <span className="absolute left-8 bottom-10 h-2 w-2 rounded-full bg-brand-300 shadow-[0_0_10px_3px_rgba(142,180,255,0.6)]" />
      </div>
      <div className="absolute bottom-5 left-5 rounded-xl bg-white/10 px-3 py-2 text-xs text-white backdrop-blur">
        <span className="text-emerald-300">●</span> 实时风险扫描中
      </div>
      <div className="absolute right-5 top-5 rounded-xl bg-white/10 px-3 py-2 text-xs text-white backdrop-blur">
        风险拦截 <b className="text-white"> 1,284</b> / 日
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 bg-grid-line [background-size:32px_32px] opacity-[0.15]" />
        <div className="absolute -top-32 left-1/2 h-72 w-[42rem] -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="container-page relative grid gap-12 py-20 lg:grid-cols-2 lg:items-center lg:py-28">
          <div className="fade-up">
            <span className="chip border-brand-400/30 bg-white/10 text-brand-100 ring-brand-400/30">
              全场景金融风控 SaaS 平台
            </span>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              让每一笔信贷
              <br />
              <span className="text-gradient">风险无处遁形</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              结合同盾级的市场理解、业务沉淀与专家经验，基于风险决策引擎与底层多元变量指标，
              为信贷机构提供贷前审核、贷中监控与智能评分一体化风控能力。
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/credit-risk" className="btn-primary">
                探索信贷风控
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
              <Link to="/scoring" className="btn-ghost !text-white !ring-white/30 hover:!bg-white/10">
                查看智能评分
              </Link>
            </div>
          </div>
          <div className="fade-up">
            <HeroVisual />
          </div>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="container-page grid grid-cols-2 gap-6 py-12 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-bold text-gradient sm:text-4xl">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <SectionHeading
            center
            eyebrow="Core Capabilities"
            title="三大核心能力模块"
            desc="从信贷全生命周期到标准化评分，构建可落地的智能风控体系。"
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {modules.map((m) => (
              <Link
                key={m.title}
                to={m.to}
                className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-6 shadow-card transition hover:-translate-y-1 hover:shadow-glow"
              >
                <div className={`absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${m.accent} opacity-10 transition group-hover:scale-150`} />
                <span className="chip">{m.tag}</span>
                <h3 className="mt-4 text-xl font-semibold text-ink-900">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{m.desc}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {m.points.map((p) => (
                    <span key={p} className="rounded-md bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
                      {p}
                    </span>
                  ))}
                </div>
                <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600">
                  了解更多
                  <svg viewBox="0 0 24 24" className="h-4 w-4 transition group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Why Us"
            title="为什么选择信贷风控云服务"
            desc="以数据、模型与工程能力，帮助机构把风控从成本中心变为竞争力。"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {advantages.map((a, i) => (
              <div key={a.title} className="card">
                <span className="text-2xl font-bold text-brand-200">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink-900">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}
