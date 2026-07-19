// ⚠️ 待重构（2026-07-18 标记）：初版营销展示页原型，保留现状，待用户给出具体改动要求后再修改。
import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import ScoreGauge from '../components/ScoreGauge'
import CTASection from '../components/CTASection'

const I = (p: { d: string }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={p.d} />
  </svg>
)

interface Feature {
  title: string
  desc: string
  icon: string
  accent: string
}

interface Product {
  tag: string
  name: string
  summary: string
  range: [number, number]
  value: number
  color: string
  hint: string
  features: Feature[]
  audience: string
}

const products: Product[] = [
  {
    tag: 'Intelligent Fraud Score',
    name: '智能察分',
    summary:
      '针对银行、保险、消费金融、互联网金融等机构开发的欺诈类评分预测产品，适用于除小额短期现金贷客群之外的金融全行业客群，特别适用于消费金融场景。',
    range: [0, 100],
    value: 78,
    color: '#ef4444',
    hint: '分数越高，欺诈风险越高',
    audience: '消费金融 · 银行 · 保险 · 互联网金融',
    features: [
      {
        title: '欺诈预测',
        desc: '对评分对象的欺诈风险概率做出精准预测，输出直观的分数。',
        icon: 'M12 3l8 4v5c0 5-3.5 8.5-8 9-4.5-.5-8-4-8-9V7z',
        accent: 'text-red-600 bg-red-50',
      },
      {
        title: '自动化监控',
        desc: '实现自动化高频监控，便于发现异常及模型调优。',
        icon: 'M12 7v5l3 3M21 12a9 9 0 11-9-9',
        accent: 'text-amber-600 bg-amber-50',
      },
    ],
  },
  {
    tag: 'Intelligent Credit Score',
    name: '智能信分',
    summary:
      '一款对申请人的申请违约风险进行预测的标准评分产品，以分数形式展现个人风险等级，广泛应用于信贷决策。',
    range: [300, 900],
    value: 712,
    color: '#22c55e',
    hint: '分数越高，违约概率越低',
    audience: '银行信用卡 · 消费金融 · 小额信贷',
    features: [
      {
        title: '违约预测',
        desc: '对评分对象的违约概率做出精准预测，支撑授信与定价。',
        icon: 'M3 17l6-6 4 4 8-8M21 7v6h-6',
        accent: 'text-emerald-600 bg-emerald-50',
      },
      {
        title: '自动化监控',
        desc: '实现自动化高频监控，便于发现异常及模型调优。',
        icon: 'M12 7v5l3 3M21 12a9 9 0 11-9-9',
        accent: 'text-cyan-600 bg-cyan-50',
      },
    ],
  },
  {
    tag: 'Intelligent Finance Score',
    name: '智能融分',
    summary:
      '基于大数据和机器学习技术，融合多方面信息，与违约风险审核、授信申请转化、借贷兴趣场景有效融合打造的标准评分产品。',
    range: [300, 900],
    value: 655,
    color: '#8b5cf6',
    hint: '综合评分，全面刻画风险与价值',
    audience: '综合信贷 · 授信转化 · 借贷兴趣',
    features: [
      {
        title: '违约预测',
        desc: '对评分对象的违约概率做出精准预测。',
        icon: 'M3 17l6-6 4 4 8-8M21 7v6h-6',
        accent: 'text-violet-600 bg-violet-50',
      },
      {
        title: '风险评估',
        desc: '360 度全面评估用户风险，挖掘客户潜在违约概率。',
        icon: 'M12 2a10 10 0 100 20 10 10 0 000-20zM2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20',
        accent: 'text-indigo-600 bg-indigo-50',
      },
      {
        title: '自动化监控',
        desc: '实现自动化、高频监控，便于发现异常及模型调优。',
        icon: 'M12 7v5l3 3M21 12a9 9 0 11-9-9',
        accent: 'text-fuchsia-600 bg-fuchsia-50',
      },
    ],
  },
]

const compare = [
  { k: '产品定位', v0: '欺诈类评分', v1: '标准信用评分', v2: '融合综合评分' },
  { k: '分数区间', v0: '0 ~ 100', v1: '300 ~ 900', v2: '300 ~ 900' },
  { k: '分数含义', v0: '越高欺诈风险越高', v1: '越高违约概率越低', v2: '越高综合资质越好' },
  { k: '核心能力', v0: '欺诈概率预测', v1: '违约概率预测', v2: '违约+价值双评估' },
  { k: '适用客群', v0: '消费金融等全行业', v1: '通用信贷申贷客群', v2: '综合信贷/转化场景' },
  { k: '监控方式', v0: '自动化高频监控', v1: '自动化高频监控', v2: '自动化高频监控' },
]

export default function Scoring() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 bg-grid-line [background-size:32px_32px] opacity-[0.15]" />
        <div className="container-page relative py-16 lg:py-20">
          <nav className="text-sm text-slate-400">
            <Link to="/" className="hover:text-white">首页</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-200">评分产品</span>
          </nav>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">智能评分产品</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            以分数形式直观展现个人风险等级，覆盖欺诈与违约场景，支撑信贷机构在贷前审核中的自动化决策。
          </p>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container-page space-y-10">
          {products.map((p) => (
            <div
              key={p.name}
              className="grid items-center gap-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-card lg:grid-cols-[320px_1fr]"
            >
              <div className="flex flex-col items-center justify-center rounded-2xl bg-gradient-to-b from-slate-50 to-brand-50/40 p-6">
                <ScoreGauge
                  value={p.value}
                  min={p.range[0]}
                  max={p.range[1]}
                  label={p.name}
                  color={p.color}
                  hint={p.hint}
                />
                <span className="mt-4 chip">{p.audience}</span>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">{p.tag}</p>
                <h2 className="mt-1 text-2xl font-bold text-ink-900">{p.name}</h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{p.summary}</p>

                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {p.features.map((f) => (
                    <div key={f.title} className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
                      <div className={`grid h-9 w-9 place-items-center rounded-lg ${f.accent}`}>
                        <I d={f.icon} />
                      </div>
                      <h4 className="mt-3 text-sm font-semibold text-ink-900">{f.title}</h4>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{f.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <SectionHeading center eyebrow="Compare" title="三款评分产品对比" />
          <div className="mt-10 overflow-hidden rounded-2xl border border-slate-100 shadow-card">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-ink-900 text-white">
                  <th className="px-6 py-4 text-left font-medium">维度</th>
                  <th className="px-6 py-4 text-left font-semibold text-red-300">智能察分</th>
                  <th className="px-6 py-4 text-left font-semibold text-emerald-300">智能信分</th>
                  <th className="px-6 py-4 text-left font-semibold text-violet-300">智能融分</th>
                </tr>
              </thead>
              <tbody>
                {compare.map((r, i) => (
                  <tr key={r.k} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-6 py-4 font-medium text-slate-700">{r.k}</td>
                    <td className="px-6 py-4 text-slate-600">{r.v0}</td>
                    <td className="px-6 py-4 text-slate-600">{r.v1}</td>
                    <td className="px-6 py-4 text-slate-600">{r.v2}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}
