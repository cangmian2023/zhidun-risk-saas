// 信用风控报告（方案Kimi）详情页
// 页面结构与「信息核验」(PreVerifyDetail) 保持一致：头部 + 顶部评分总览卡 + 操作栏 + 右侧锚点导航 + 卡片式分段
// 复用信息核验的效果：分支(右导航/分段)、标签体系(风险等级/自动审批/人工审核)、图片展示(影像资料/视频/OCR)、预警(橙/红)、页面结构
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, DetailHeader, Panel } from '../components/ui'
import { MergedOpTable } from '../components/MergedOpTable'
import {
  buildCreditKimiReport,
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
import type { OpLog, OpActionType } from './infoVerifyReport'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

const levelCls: Record<CreditLevel, string> = {
  低: 'bg-emerald-100 text-emerald-700',
  中: 'bg-amber-100 text-amber-700',
  高: 'bg-orange-100 text-orange-700',
  极高: 'bg-rose-100 text-rose-700',
}
const levelText: Record<CreditLevel, string> = { 低: '低', 中: '中', 高: '高', 极高: '极高' }
// 风险等级 → 文字色（与「预警/风险」徽标配色一致：低绿/中黄/高橙/极高红）
const bandText: Record<CreditLevel, string> = {
  低: 'text-emerald-600',
  中: 'text-amber-600',
  高: 'text-orange-600',
  极高: 'text-rose-600',
}

// 点击列表项定位到对应维度分析模块（与欺诈识别报告因子表交互一致）
const jumpTo = (id?: string) => {
  if (id) document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

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
  const bandColor = bandText[d.riskLevel]
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
        </div>
      </div>

      {/* 得分进度条（阈值刻度，对齐欺诈识别报告第一个卡片） */}
      <div className="mt-4">
        <div className="relative h-2.5 w-full overflow-visible rounded-full">
          <div className="absolute inset-0 flex overflow-hidden rounded-full">
            <div className="h-full bg-emerald-400" style={{ width: '40%' }} />
            <div className="h-full bg-amber-400" style={{ width: '20%' }} />
            <div className="h-full bg-orange-400" style={{ width: '20%' }} />
            <div className="h-full bg-rose-400" style={{ width: '20%' }} />
          </div>
          <div
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${d.creditScore}%` }}
          >
            <div className="h-4 w-4 rounded-full border-2 border-white bg-slate-800 shadow" />
          </div>
        </div>
        <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
          <span>0 · 极低</span>
          <span>40</span>
          <span>60</span>
          <span>80</span>
          <span>100 · 极高</span>
        </div>
      </div>

      {/* 评分维度分布（六维加权）— 列表，样式与欺诈识别报告「因子构成表」一致 */}
      <div className="mt-5 mb-1 text-xs font-medium text-slate-500">评分维度分布（六维加权）</div>
      <div className="overflow-hidden rounded-xl border border-slate-100">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-400">
              <th className="px-3 py-2 font-medium">维度</th>
              <th className="px-3 py-2 text-right font-medium">得分</th>
              <th className="px-3 py-2 text-right font-medium">权重</th>
              <th className="px-3 py-2 text-center font-medium">等级</th>
              <th className="px-3 py-2 font-medium">说明</th>
            </tr>
          </thead>
          <tbody>
            {d.dimensions.map((dim) => (
              <tr
                key={dim.key}
                className="cursor-pointer border-t border-slate-100 transition hover:bg-slate-50"
                onClick={() => jumpTo(dim.key)}
                title="点击定位到对应维度分析"
              >
                <td className="px-3 py-2.5 font-medium text-ink-900">{dim.name}</td>
                <td className={cn('px-3 py-2.5 text-right font-semibold', bandText[dim.level])}>{dim.score}</td>
                <td className="px-3 py-2.5 text-right text-slate-400">{dim.weight}%</td>
                <td className="px-3 py-2.5 text-center"><span className={cn('rounded px-1.5 py-0.5 text-[10px] font-medium', levelCls[dim.level])}>{levelText[dim.level]}</span></td>
                <td className="px-3 py-2.5 text-slate-500">{dim.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
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

  // 操作日志复用信息核验「整体操作」合并表格：将信用日志映射为 OpLog（与欺诈识别报告九、操作日志一致）
  const opLogRows: OpLog[] = logs.map((l, i) => ({
    id: `${d.appId}-op-${i}`,
    target: d.name,
    actionType: l.type as OpActionType,
    operator: l.operator,
    time: l.time,
    remark: [l.content, l.remark].filter(Boolean).join(' · '),
  }))

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

          {/* 系统状态 / 处置操作栏（第二个卡片）：操作按钮 + 授信建议（对齐欺诈识别报告「处置建议」） */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <CreditKimiActionBar row={row} onApply={applyRow} flash={flash} showView={false} />
            {/* 授信建议（原第七部分：移至第二卡片，删除独立标题） */}
            <div id="recommend" className="mt-4 border-t border-slate-100 pt-3">
              <div className="rounded-xl border border-rose-200 bg-rose-50/50 p-4">
                <div className="text-sm font-semibold text-ink-900">授信建议：{d.creditAdvice}</div>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">建议理由：{d.recommendation.reason}</p>
              </div>
            </div>
          </div>

          {/* 授信补充说明（原「七、授信建议」：删除标题与额度列表，保留因素与处置区，置于第二个卡片下方） */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-3">
                <div className="mb-1 text-xs font-medium text-emerald-700">正向因素</div>
                <div className="text-xs text-slate-600">{d.recommendation.positive}</div>
              </div>
              <div className="rounded-lg border border-rose-100 bg-rose-50/50 p-3">
                <div className="mb-1 text-xs font-medium text-rose-700">风险因素</div>
                <div className="text-xs text-slate-600">{d.recommendation.risk}</div>
              </div>
            </div>
            <div className="mt-3 rounded-lg border border-slate-100 p-3 text-xs">
              <span className="text-slate-500">参考授信额度：</span><b className="text-ink-900">{d.recommendation.creditLimit}</b>
            </div>
            <div className="mt-3 border-t border-slate-100 pt-3">
              <div className="mb-2 text-xs font-medium text-slate-500">处置操作区</div>
              <CreditKimiDispositionBar row={row} onApply={applyRow} onLog={addLog} flash={flash} />
            </div>
          </div>

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

        <Panel title="七、操作日志" id="logs">
          <MergedOpTable itemActions={[]} opLogs={opLogRows} />
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
