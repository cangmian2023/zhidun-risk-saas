// ⚠️ 待重构（2026-07-18 标记）：初版营销展示页原型，保留现状，待用户给出具体改动要求后再修改。
import { Link } from 'react-router-dom'
import SectionHeading from '../components/SectionHeading'
import FeatureCard from '../components/FeatureCard'
import CTASection from '../components/CTASection'

const I = (p: { d: string }) => (
  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={p.d} />
  </svg>
)

const preLoan = [
  {
    icon: <I d="M9 12l2 2 4-4M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />,
    title: '信息核验',
    desc: '精准识别申贷人填写的基本信息的格式异常与真实性，及时预警信息异常，筑牢风险第一道防线。',
    tags: ['格式校验', '真实性核验', '异常预警'],
    accent: 'brand' as const,
  },
  {
    icon: <I d="M3 12h4l3 8 4-16 3 8h4" />,
    title: '信用风控',
    desc: '依托强大的跨行业联防联控机制，有效甄别在多个平台同时申请信贷的高风险人群，识别多头借贷。',
    tags: ['多头借贷', '联防联控', '跨行业'],
    accent: 'cyan' as const,
  },
  {
    icon: <I d="M12 2v4M12 18v4M2 12h4M18 12h4M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3" />,
    title: '欺诈识别',
    desc: '借助先进的设备指纹技术与动态欺诈模型，识别可疑与异常设备行为，精准定位存在骗贷风险的团伙。',
    tags: ['设备指纹', '动态模型', '团伙挖掘'],
    accent: 'violet' as const,
  },
  {
    icon: <I d="M6 2h9l5 5v15H6zM14 2v6h6M9 13h6M9 17h6" />,
    title: '决策报告',
    desc: '报告基于专家经验与前沿建模技术构建，内容科学、直观、易懂，有效提升审核人员的工作效率。',
    tags: ['可解释', '直观易懂', '提效'],
    accent: 'amber' as const,
  },
]

const midLoan = [
  {
    icon: <I d="M12 7v5l3 3M21 12a9 9 0 11-9-9" />,
    title: '持续性周期监测评估',
    desc: '支持多种扫描频次，可对借款人群进行持续性的监测与评估，动态捕捉风险变化。',
    tags: ['多频次', '持续监测'],
    accent: 'brand' as const,
  },
  {
    icon: <I d="M4 19h16M4 5l4 5 4-3 4 6 4-4" />,
    title: '分场景分产品监测',
    desc: '可按照产品线和业务场景对客群分别配置策略，实现适配特定客群与产品的精细化监控。',
    tags: ['客群分层', '策略配置'],
    accent: 'cyan' as const,
  },
  {
    icon: <I d="M12 3a9 9 0 100 18 9 9 0 000-18zM12 8v4M12 16h.01" />,
    title: '红黄灯综合预警信号',
    desc: '面向需要决策建议的客户，输出红黄灯预警信号，并完整还原预警信号的产生规则明细。',
    tags: ['红灯/黄灯', '规则明细'],
    accent: 'amber' as const,
  },
  {
    icon: <I d="M4 6h16M4 12h16M4 18h10M4 6V4h16v2M4 12v-2M4 18v-2" />,
    title: '模块化灵活定制',
    desc: '面向自主建模的客户，支持自由挑选与组装模块，灵活满足特定业务需求。',
    tags: ['自由组装', '自主建模'],
    accent: 'violet' as const,
  },
  {
    icon: <I d="M8 3H5a2 2 0 00-2 2v3M16 3h3a2 2 0 012 2v3M8 21H5a2 2 0 01-2-2v-3M16 21h3a2 2 0 002-2v-3" />,
    title: '多方式获取结果',
    desc: '支持 API 接口、URL 推送、文件交换、网页下载等多种结果输出形式，无缝对接现有系统。',
    tags: ['API', 'URL推送', '文件/网页'],
    accent: 'brand' as const,
  },
]

const workflow = [
  { step: '贷前审核', desc: '信息核验 · 信用风控 · 欺诈识别', color: 'bg-brand-500' },
  { step: '贷中监控', desc: '周期评估 · 红黄灯预警', color: 'bg-cyan-500' },
  { step: '贷后管理', desc: '预催降额 · 客群经营', color: 'bg-violet-500' },
]

export default function CreditRisk() {
  return (
    <div>
      <section className="relative overflow-hidden bg-ink-900 text-white">
        <div className="absolute inset-0 bg-grid-line [background-size:32px_32px] opacity-[0.15]" />
        <div className="container-page relative py-16 lg:py-20">
          <nav className="text-sm text-slate-400">
            <Link to="/" className="hover:text-white">首页</Link>
            <span className="mx-2">/</span>
            <span className="text-brand-200">零售信贷风控</span>
          </nav>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">零售信贷风控</h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-slate-300">
            覆盖信贷全生命周期，从申贷审核到贷中持续监测，结合丰富的业务场景，
            有效识别欺诈、关联与共债风险，实现全面而精细的客群管理。
          </p>
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white">
        <div className="container-page py-12">
          <div className="grid gap-4 md:grid-cols-3">
            {workflow.map((w, i) => (
              <div key={w.step} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-5">
                <div className="flex items-center gap-3">
                  <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white ${w.color}`}>
                    {i + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-ink-900">{w.step}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-500">{w.desc}</p>
                {i < workflow.length - 1 && (
                  <span className="absolute -right-3 top-1/2 hidden -translate-y-1/2 text-brand-300 md:block">
                    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Pre-loan Review"
            title="贷前审核"
            desc="针对借贷申请环节，结合同盾级的市场理解、业务沉淀与底层多元变量指标，通过风险决策引擎有效识别欺诈、关联与共债风险。"
          />
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {preLoan.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container-page">
          <SectionHeading
            eyebrow="Mid-loan Monitoring"
            title="贷中监控"
            desc="结合贷中贷后丰富的业务场景，提供灵活的策略配置与持续的场景化监控服务，实现对贷中客群全面而精细的管理需求。"
          />

          <div className="mt-8 rounded-2xl border border-slate-100 bg-gradient-to-br from-brand-50 to-cyan-50 p-6 sm:p-8">
            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-ink-900">贷中风控场景</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  对授信后借款人的风险变化进行周期性监测和评估，并给出风险预警，
                  辅助客户进行 <b className="text-brand-700">预催</b>、<b className="text-brand-700">降额</b>。
                </p>
                <h3 className="mt-6 text-lg font-semibold text-ink-900">存量客群运营场景</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  对借款人的资产状况、资金需求和行为习惯等进行周期性评估，
                  辅助客户进行 <b className="text-brand-700">促活</b>、<b className="text-brand-700">提额</b>、二次客户经营。
                </p>
              </div>
              <div className="rounded-xl border border-white bg-white/70 p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-ink-900">客群风险看板</span>
                  <span className="chip !bg-emerald-50 !text-emerald-600 !ring-emerald-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> 实时监控
                  </span>
                </div>
                <div className="mt-5 space-y-3">
                  {[
                    { l: '共债预警', v: 82, c: 'bg-red-500' },
                    { l: '设备异常', v: 47, c: 'bg-amber-500' },
                    { l: '信用波动', v: 63, c: 'bg-brand-500' },
                    { l: '活跃度下降', v: 35, c: 'bg-cyan-500' },
                  ].map((b) => (
                    <div key={b.l}>
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>{b.l}</span>
                        <span>{b.v}%</span>
                      </div>
                      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className={`h-full rounded-full ${b.c}`} style={{ width: `${b.v}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {midLoan.map((f) => (
              <FeatureCard key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  )
}
