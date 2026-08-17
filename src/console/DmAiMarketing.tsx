import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel } from '../components/ui'
import { Sam } from './SourceTag'

const EXAMPLES = [
  '@合合信息科技股份有限公司 访前营销一页纸分析',
  '上海市注册资本500万以下,成立3年以上,有联系方式的企业名单',
  '常州市新能源汽车产业链的上游供应商的企业名单',
  '我要找本地的科创金融企业客群名单',
  '最近 7 天上海市静安区应收帐款融资到期的企业',
]

export default function DmAiMarketing() {
  const [q, setQ] = useState('')
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="AI营销" crumb="数字营销 / 潜客挖掘" subtitle="一句话找企业、找客群、匹配产品" />

      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">一句话找企业、找客群、匹配产品</h2>
            <p className="mt-2 text-sm text-slate-500">
              输入企业 / 客群 / 金融产品，AI 自动生成营销方案；输入 <code className="rounded bg-white px-1">@企业名</code> 可精准搜索企业。
            </p>
          </div>
          <div className="shrink-0 text-right">
            <div className="text-3xl font-bold tabular-nums text-emerald-600">4,071</div>
            <div className="text-xs text-slate-500">家银行已匹配</div>
            <div className="mt-2 text-3xl font-bold tabular-nums text-teal-600">10万+</div>
            <div className="text-xs text-slate-500">个金融产品</div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
          <textarea
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="输入企业/客群/金融产品，生成营销方案，输入 @企业名 可搜索企业"
            rows={3}
            className="w-full resize-none border-0 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-xs text-slate-400">支持自然语言客群圈选、产业链挖掘、到期提醒等</span>
            <button
              disabled={!q.trim()}
              className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              生成营销方案
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => setQ(ex)}
              className="rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs text-emerald-700 transition hover:border-emerald-400 hover:bg-emerald-50"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <Panel
          title="历史会话"
          desc={<Sam label="样例会话" value="0" />}
          actions={<span className="text-xs text-slate-400">AI 生成的营销方案将在此留存</span>}
        >
          <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p className="mt-3 text-sm text-slate-400">暂无数据</p>
          </div>
        </Panel>
      </div>
    </div>
  )
}
