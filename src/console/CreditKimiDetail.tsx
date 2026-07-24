// 信用风控报告（方案Kimi）详情页
// 页面结构与「信息核验」(PreVerifyDetail) 保持一致：头部 + 顶部评分总览卡 + 操作栏 + 右侧锚点导航 + 卡片式分段
// 复用信息核验的效果：分支(右导航/分段)、标签体系(风险等级/自动审批/人工审核)、图片展示(影像资料/视频/OCR)、预警(橙/红)、页面结构
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, DetailHeader, Panel } from '../components/ui'
import {
  buildCreditKimiReport,
  CREDIT_LEVEL_KIND,
  type CreditKimiReport,
  type CreditDimension,
  type CreditImageItem,
  type CreditLevel,
} from './creditKimiReport'
import { useModule } from '../store'
import {
  CreditKimiActionBar,
  CreditKimiDispositionBar,
  type CreditKimiRow,
  type CreditKimiLog,
} from './CreditKimiOps'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

const levelCls: Record<CreditLevel, string> = {
  低: 'bg-emerald-100 text-emerald-700',
  中: 'bg-amber-100 text-amber-700',
  高: 'bg-orange-100 text-orange-700',
  极高: 'bg-rose-100 text-rose-700',
}
const levelText: Record<CreditLevel, string> = { 低: '低', 中: '中', 高: '高', 极高: '极高' }

/* ========================= 影像资料（复用信息核验证件照展示） ========================= */
function ImageCard({ img }: { img: CreditImageItem }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-ink-900">{img.label}</span>
        {img.kind === 'video' && <Badge kind="blue">视频</Badge>}
      </div>
      <div className="grid aspect-[4/3] place-items-center overflow-hidden rounded-lg bg-slate-900">
        {img.kind === 'video' ? (
          <video controls poster={img.url} src="/sample/live.mp4" className="h-full w-full object-contain" />
        ) : (
          <img
            src={img.url}
            alt={img.label}
            className="h-full w-full object-contain"
            onError={(e) => {
              const el = e.currentTarget
              el.style.display = 'none'
              const p = el.parentElement
              if (p && !p.querySelector('.ph')) {
                const s = document.createElement('span')
                s.className = 'ph text-xs text-slate-400'
                s.textContent = '图片占位'
                p.appendChild(s)
              }
            }}
          />
        )}
      </div>
      <div className="mt-2 rounded-lg bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
        <span className="font-medium text-slate-500">OCR 识别：</span>
        {img.ocr}
      </div>
    </div>
  )
}

/* ========================= 顶部：信用评分总览 ========================= */
function ScoreOverviewCard({ d }: { d: CreditKimiReport }) {
  const bandColor = CREDIT_LEVEL_KIND[d.riskLevel]
  const penaltyHit = d.penalty.filter((p) => p.hit).reduce((s, p) => s + p.add, 0)
  return (
    <div id="score" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-6 items-center rounded-md bg-slate-800 px-2 text-[11px] font-medium text-white">信用评分</span>
          <span className="text-sm font-semibold text-ink-900">信用风控综合评分模型</span>
        </div>
        <span className="text-[11px] text-slate-400">分值越高风险越高 · 满分 100</span>
      </div>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-end gap-3">
          <div className="flex items-baseline">
            <span className={cn('text-5xl font-bold leading-none', bandColor)}>{d.creditScore}</span>
            <span className="ml-1 text-sm font-normal text-slate-300">/ 100</span>
          </div>
          <div className="mb-1">
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', levelCls[d.riskLevel])}>{d.riskLevel}风险</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500">自动审批：<b className={cn('font-semibold', bandColor)}>{d.autoDecision}</b></span>
          <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-500">授信建议：<b className="font-semibold text-ink-900">{d.creditAdvice}</b></span>
        </div>
      </div>

      {/* 六大维度得分卡片 */}
      <div className="mt-5 mb-1 text-xs font-medium text-slate-500">评分维度分布（六维加权）</div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        {d.dimensions.map((dim) => (
          <div key={dim.key} className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
            <div className="text-xs text-slate-400">{dim.name}</div>
            <div className={cn('mt-1 text-xl font-bold', CREDIT_LEVEL_KIND[dim.level])}>{dim.score}</div>
            <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
              <span>权重 {dim.weight}%</span>
              <span className={cn('rounded px-1.5 py-0.5 font-medium', levelCls[dim.level])}>{levelText[dim.level]}</span>
            </div>
          </div>
        ))}
      </div>

      {/* 计算明细 */}
      <div className="mt-5 rounded-xl border border-slate-100 p-4">
        <div className="mb-2 text-xs font-medium text-slate-500">信用评分计算公式</div>
        <pre className="overflow-auto whitespace-pre-wrap rounded-lg bg-slate-900 p-3 text-[11px] leading-relaxed text-emerald-400">{`信用评分 = 身份真实性×20% + 还款能力×25% + 信用历史×25%
         + 行为稳定性×10% + 设备安全性×10% + 关联风险×10%
         = ${d.dimensions.map((x) => `${x.score}×${x.weight / 100}`).join(' + ')}
         = ${d.baseScore.toFixed(2)}（基础加权得分）`}</pre>
        <div className="mt-3 text-xs font-medium text-slate-500">叠加惩罚机制（多维度同时中高风险时额外加分）</div>
        <div className="mt-1.5 space-y-1.5">
          {d.penalty.map((p, i) => (
            <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs">
              <span className={cn(p.hit ? 'text-rose-600' : 'text-slate-400')}>{p.condition}</span>
              <span className={cn('font-semibold', p.hit ? 'text-rose-600' : 'text-slate-300')}>{p.hit ? `+${(d.baseScore + penaltyHit).toFixed(2)}` : '+0'}（{p.hit ? '已触发' : '未触发'}）</span>
            </div>
          ))}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs">
          <span className="text-slate-500">基础分 <b className="text-ink-900">{d.baseScore.toFixed(2)}</b></span>
          <span className="text-slate-500">叠加惩罚 <b className="text-rose-600">+{penaltyHit}</b></span>
          <span className="text-slate-500">最终评分 <b className="text-ink-900">{d.finalComputed.toFixed(2)}</b></span>
          <span className="text-slate-500">实际评定 <b className={cn('font-bold', bandColor)}>{d.creditScore} 分（{d.riskLevel}风险）</b></span>
        </div>
      </div>
    </div>
  )
}

/* ========================= 维度分段 ========================= */
function DimensionPanel({ d, images }: { d: CreditDimension; images?: CreditImageItem[] }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold text-ink-900">{d.score}</span>
            <span className="text-sm text-slate-400">/ 100</span>
            <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', levelCls[d.level])}>{d.level}风险</span>
          </div>
          <div className="mt-1 text-xs text-slate-500">维度权重 {d.weight}% · {d.note}</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-400">
              <th className="px-3 py-2 font-medium">评估项</th>
              <th className="px-3 py-2 font-medium">结果</th>
              <th className="px-3 py-2 text-right font-medium">得分</th>
              <th className="px-3 py-2 text-right font-medium">权重</th>
            </tr>
          </thead>
          <tbody>
            {d.items.map((it) => (
              <tr key={it.name} className="border-t border-slate-100">
                <td className="px-3 py-2.5 font-medium text-ink-900">{it.name}</td>
                <td className="px-3 py-2.5 text-slate-500">{it.result}</td>
                <td className="px-3 py-2.5 text-right font-semibold text-slate-700">{it.score}</td>
                <td className="px-3 py-2.5 text-right text-slate-400">{it.weight}%</td>
              </tr>
            ))}
            <tr className="border-t border-slate-200 bg-slate-50">
              <td className="px-3 py-2.5 font-semibold text-ink-900" colSpan={2}>加权得分（得分 × 权重）</td>
              <td className="px-3 py-2.5 text-right text-sm font-bold text-ink-900">{(d.score * d.weight / 100).toFixed(2)}</td>
              <td className="px-3 py-2.5" />
            </tr>
          </tbody>
        </table>
      </div>

      {images && images.length > 0 && (
        <div>
          <div className="mb-2 text-xs font-medium text-slate-500">影像资料（复用信息核验证件照展示）</div>
          <div className="grid gap-4 md:grid-cols-2">
            {images.map((img) => <ImageCard key={img.key} img={img} />)}
          </div>
        </div>
      )}
    </div>
  )
}

/* ========================= 授信建议 ========================= */
function RecommendationPanel({ d }: { d: CreditKimiReport }) {
  const r = d.recommendation
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
        <div className="text-sm font-semibold text-ink-900">{r.advice}</div>
        <div className="mt-1 text-xs text-slate-500">建议理由：{r.reason}</div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
          <div className="mb-1 text-xs font-medium text-emerald-700">正向因素</div>
          <div className="text-xs text-slate-600">{r.positive}</div>
        </div>
        <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3">
          <div className="mb-1 text-xs font-medium text-rose-700">风险因素</div>
          <div className="text-xs text-slate-600">{r.risk}</div>
        </div>
      </div>
      <div className="rounded-lg border border-slate-100 p-3 text-xs">
        <span className="text-slate-500">参考授信额度：</span><b className="text-ink-900">{r.creditLimit}</b>
      </div>
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-400">
              <th className="px-3 py-2 font-medium">信用评分</th>
              <th className="px-3 py-2 font-medium">风险等级</th>
              <th className="px-3 py-2 font-medium">建议授信额度</th>
              <th className="px-3 py-2 font-medium">建议利率浮动</th>
            </tr>
          </thead>
          <tbody>
            {r.limitTable.map((row, i) => (
              <tr key={i} className="border-t border-slate-100">
                <td className="px-3 py-2.5 text-slate-700">{row.scoreRange}</td>
                <td className="px-3 py-2.5"><span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', levelCls[(row.level.replace('风险', '') as CreditLevel) || '低'])}>{row.level}</span></td>
                <td className="px-3 py-2.5 text-slate-600">{row.limit}</td>
                <td className="px-3 py-2.5 text-slate-500">{row.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ========================= 操作日志时间线 ========================= */
function TimelineLog({ logs }: { logs: CreditKimiLog[] }) {
  return (
    <ol className="relative space-y-4 border-l border-slate-200 pl-5">
      {logs.map((l) => (
        <li key={l.id} className="relative">
          <span className="absolute -left-[1.4rem] top-1 h-2.5 w-2.5 rounded-full bg-brand-500 ring-4 ring-white" />
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-ink-900">{l.type}</span>
            {l.result && (
              <span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', l.result === '命中' ? 'bg-rose-100 text-rose-700' : l.result === '通过' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600')}>{l.result}</span>
            )}
            <span className="text-[11px] text-slate-400">{l.time}</span>
            <span className="text-[11px] text-slate-400">· {l.operator}</span>
          </div>
          <div className="mt-0.5 text-xs text-slate-600">{l.content}</div>
          {l.remark && <div className="mt-0.5 text-[11px] text-slate-400">备注：{l.remark}</div>}
        </li>
      ))}
    </ol>
  )
}

/* ========================= 主页面 ========================= */
export default function CreditKimiDetail() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const sysParam = (params.get('sys') as CreditKimiRow['sysResult']) ?? '拒绝'
  const workParam = (params.get('work') as CreditKimiRow['workStatus']) ?? '待确认'
  const opParam = params.get('op') ?? '--'
  const sampleId = params.get('id') ?? undefined
  const variant = sampleId && sampleId.includes('REJECT')
    ? 'REJECT'
    : sampleId && sampleId.includes('WARNING')
      ? 'WARNING'
      : sampleId && sampleId.includes('PASS')
        ? 'PASS'
        : (sysParam === '通过' ? 'PASS' : sysParam === '预警' ? 'WARNING' : 'REJECT')
  const d = buildCreditKimiReport(variant)

  const [row, setRow] = useState<CreditKimiRow>(() => ({
    id: sampleId ?? d.appId,
    name: d.name,
    product: d.product,
    channel: d.channel,
    amount: d.amount,
    creditScore: d.creditScore,
    riskLevel: d.riskLevel,
    sysResult: sysParam,
    workStatus: workParam,
    operator: opParam,
    auditTime: d.reportTime,
  }))
  const applyRow = (next: Partial<CreditKimiRow>) => setRow((r) => ({ ...r, ...next }))
  const { flash } = useModule()

  const [logs, setLogs] = useState<CreditKimiLog[]>(d.opLogs)
  const addLog = (entry: Omit<CreditKimiLog, 'id'>) =>
    setLogs((prev) => [{ ...entry, id: `log${Date.now()}` }, ...prev])

  const toneFor = (lv: CreditLevel): 'ok' | 'alert' | 'normal' =>
    lv === '低' ? 'ok' : 'alert'

  const navCards: { id: string; label: string; tone: 'ok' | 'alert' | 'normal' }[] = [
    { id: 'score', label: '信用评分', tone: toneFor(d.riskLevel) },
    { id: 'identity', label: '身份真实性', tone: toneFor(d.dimensions[0].level) },
    { id: 'repay', label: '还款能力', tone: toneFor(d.dimensions[1].level) },
    { id: 'history', label: '信用历史', tone: toneFor(d.dimensions[2].level) },
    { id: 'behavior', label: '行为稳定性', tone: toneFor(d.dimensions[3].level) },
    { id: 'device', label: '设备安全性', tone: toneFor(d.dimensions[4].level) },
    { id: 'assoc', label: '关联风险', tone: toneFor(d.dimensions[5].level) },
    { id: 'recommend', label: '授信建议', tone: d.creditAdvice.includes('拒绝') || d.creditAdvice.includes('风险') ? 'alert' : 'ok' },
    { id: 'logs', label: '操作日志', tone: 'normal' },
  ]

  return (
    <div className="space-y-6">
      <DetailHeader
        title="信用风控报告"
        subtitle={`申请编号 ${d.appId} · 申请人 ${d.name} · ${d.idNo}`}
        backLabel="返回信用风控"
        onBack={() => nav('/console/cr/credit-kimi')}
      />

      <div className="lg:flex lg:gap-6">
        {/* 左侧主内容区 */}
        <div className="min-w-0 flex-1 space-y-4">
          <ScoreOverviewCard d={d} />

          <CreditKimiActionBar row={row} onApply={applyRow} flash={flash} showView={false} />

          <Panel title="一、身份真实性" id="identity">
            <DimensionPanel d={d.dimensions[0]} images={d.images} />
          </Panel>

          <Panel title="二、还款能力" id="repay">
            <DimensionPanel d={d.dimensions[1]} />
          </Panel>

          <Panel title="三、信用历史" id="history">
            <DimensionPanel d={d.dimensions[2]} />
          </Panel>

          <Panel title="四、行为稳定性" id="behavior">
            <DimensionPanel d={d.dimensions[3]} />
          </Panel>

          <Panel title="五、设备安全性" id="device">
            <DimensionPanel d={d.dimensions[4]} />
          </Panel>

          <Panel title="六、关联风险" id="assoc">
            <DimensionPanel d={d.dimensions[5]} />
          </Panel>

          <Panel title="七、授信建议" id="recommend">
            <RecommendationPanel d={d} />
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="mb-2 text-xs font-medium text-slate-500">处置操作区</div>
              <CreditKimiDispositionBar row={row} onApply={applyRow} onLog={addLog} flash={flash} />
            </div>
          </Panel>

          <Panel title="八、信用评估操作日志" id="logs">
            <TimelineLog logs={logs} />
          </Panel>

          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            title="返回顶部"
            className="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>

        {/* 右侧章节导航 */}
        <nav className="hidden lg:block lg:w-44 lg:shrink-0">
          <div className="sticky top-32 flex flex-col gap-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">页面导航</p>
            {navCards.map((c) => {
              const toneCls =
                c.tone === 'alert'
                  ? 'bg-rose-50 font-medium text-rose-600'
                  : c.tone === 'ok'
                    ? 'bg-emerald-50 font-medium text-emerald-600'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
              const dot = c.tone === 'alert' ? 'bg-rose-500' : c.tone === 'ok' ? 'bg-emerald-500' : ''
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    const el = document.getElementById(c.id)
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${toneCls}`}
                >
                  {dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}
                  <span className={dot ? '' : 'pl-3.5'}>{c.label}</span>
                </button>
              )
            })}
          </div>
        </nav>
      </div>
    </div>
  )
}
