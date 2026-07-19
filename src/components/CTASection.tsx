export default function CTASection() {
  return (
    <section className="container-page py-20">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-8 py-14 text-center shadow-glow sm:px-16">
        <div className="absolute inset-0 bg-grid-line [background-size:28px_28px] opacity-20" />
        <div className="relative">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">开启智能风控新体验</h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100">
            立即注册即可免费试用贷前审核、贷中监控与智能评分全系产品，
            让风险无所遁形。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-brand-700 shadow-card transition hover:scale-[1.02]">
              免费试用
            </button>
            <button className="rounded-full border border-white/40 px-7 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              预约产品演示
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
