import Logo from './Logo'

const cols = [
  {
    title: '产品能力',
    items: ['零售信贷风控', '贷前审核', '贷中监控', '智能评分', '决策引擎'],
  },
  {
    title: '解决方案',
    items: ['银行信用卡', '消费金融', '互联网金融', '保险反欺诈', '小微普惠'],
  },
  {
    title: '资源中心',
    items: ['产品白皮书', '行业研究报告', 'API 文档', '客户案例', '开发者社区'],
  },
]

export default function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-100 bg-ink-900 text-slate-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <Logo className="[&_span:last-child]:text-white" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-400">
            全场景金融风控 SaaS 平台，以跨行业联防联控与前沿建模能力，
            助力信贷机构提升风险管控水平。
          </p>
          <div className="mt-5 flex gap-3">
            {['微信', '微博', '知乎'].map((s) => (
              <span
                key={s}
                className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 ring-1 ring-inset ring-white/10"
              >
                {s}
              </span>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4 className="text-sm font-semibold text-white">{c.title}</h4>
            <ul className="mt-4 space-y-2.5 text-sm">
              {c.items.map((i) => (
                <li key={i}>
                  <a href="#" className="text-slate-400 transition hover:text-brand-300">
                    {i}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 信贷风控云服务（演示页面）. 仅用于产品学习与原型展示。</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-slate-300">隐私政策</a>
            <a href="#" className="hover:text-slate-300">服务条款</a>
            <a href="#" className="hover:text-slate-300">合规说明</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
