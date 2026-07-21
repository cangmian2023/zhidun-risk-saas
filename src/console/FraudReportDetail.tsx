// 欺诈识别报告详情页
// 依据 doc/欺诈识别报告功能设计.md 实现
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, DetailHeader, Panel } from '../components/ui'
import { ScoreBar } from '../components/scoreBar'
import { buildFraudReport, FRAUD_SAMPLES, type FraudReport, type SingleFraudResult, type FraudConclusionStatus, type CrossFusion } from './fraudReport'
import { FinalOpsCard } from './FinalOps'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')

// 欺诈分刻度（越高越危险）：0~100，50 存疑线 / 80 拒绝线
const FRAUD_MARKS: { at: number; label: string; color: 'red' | 'amber' | 'green' }[] = [
  { at: 50, label: '存疑', color: 'amber' },
  { at: 80, label: '拒绝', color: 'red' },
]

const conclBadge: Record<FraudConclusionStatus, 'green' | 'amber' | 'red'> = { '通过': 'green', '存疑': 'amber', '命中': 'red' }

// 设备 / 团伙 / 材料 概览卡（Q7：结构化特征可视化）
function FeatCard({ title, data }: { title: string; data: Record<string, string | number> }) {
  const entries = Object.entries(data)
  const anomaly = entries.some(([, v]) => {
    const s = String(v)
    return s.includes('是') || s.includes('疑似') || s.includes('高') || s.includes('>') || s.includes('命中') || s.includes('黑') || s.includes('团伙')
  })
  const main = entries[0]
  return (
    <div className={cn('rounded-xl border p-3', anomaly ? 'border-rose-200 bg-rose-50/40' : 'border-slate-200 bg-white')}>
      <div className="flex items-center gap-1.5">
        <span className={cn('h-2 w-2 rounded-full', anomaly ? 'bg-rose-500' : 'bg-emerald-500')} />
        <span className="text-xs font-semibold text-ink-900">{title}</span>
      </div>
      {main && (
        <div className="mt-1.5 text-[11px] text-slate-500">
          {main[0]}：
          <span className={cn('font-medium', anomaly ? 'text-rose-600' : 'text-slate-700')}>{String(main[1])}</span>
        </div>
      )}
    </div>
  )
}

// ========================= 主页面 =========================
export default function FraudReportDetail() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const reportId = params.get('id') ?? 'FR20260721001'
  const [sampleId, setSampleId] = useState(reportId)
  const d = buildFraudReport(sampleId)

  const navCards: { id: string; label: string; tone: 'ok' | 'alert' | 'normal' }[] = [
    { id: 'raw', label: '用户提交与入参', tone: 'normal' },
    { id: 'structured', label: '结构化欺诈特征', tone: d.single_results.some((s) => s.status !== '通过') ? 'alert' : 'ok' },
    { id: 'single', label: '单项欺诈判断', tone: d.single_results.some((s) => s.status !== '通过') ? 'alert' : 'ok' },
    { id: 'process', label: '欺诈识别过程', tone: 'ok' },
    { id: 'conclusion', label: '欺诈结论', tone: d.fraud_conclusion.decision !== '自动通过' ? 'alert' : 'ok' },
    { id: 'item-actions', label: '单条异常操作', tone: 'normal' },
    { id: 'final-ops', label: '终审操作', tone: 'normal' },
    { id: 'audit', label: '操作与审计', tone: 'normal' },
  ]

  const con = d.fraud_conclusion
  const isReview = con.decision === '人工复核' || con.decision === '退回补件'
  const isReject = con.decision === '直接拒绝'

  return (
    <div className="space-y-6">
      <DetailHeader
        title="欺诈识别报告"
        subtitle={`报告编号 ${d.report_id} · 进件号 ${d.apply_no} · ${d.applicant.name} · ${d.applicant.id_no}`}
        backLabel="返回欺诈识别"
        onBack={() => nav('/console/cr/pre-fraud')}
      />

      {/* 样例状态切换（演示三态 / 按 id 取数） */}
      <div className="mb-4 flex flex-wrap gap-2">
        {FRAUD_SAMPLES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSampleId(s.id)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-medium transition',
              sampleId === s.id
                ? 'border-brand-300 bg-brand-50 text-brand-700'
                : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300',
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* 结论与终审操作（合并，无标题） */}
      <div className={cn(
        'mb-6 flex flex-wrap items-center gap-3 rounded-xl border px-5 py-4 shadow-sm',
        isReject ? 'border-rose-200 bg-rose-50' : isReview ? 'border-amber-200 bg-amber-50' : 'border-emerald-200 bg-emerald-50'
      )}>
        <Badge kind={isReject ? 'red' : isReview ? 'amber' : 'green'} className="px-3 py-1 text-sm font-semibold">
          {String(con.decision)}
        </Badge>
        <span className="text-sm text-slate-600">{con.decision_detail}</span>
        <div className="ml-auto flex items-center gap-3 text-xs text-slate-400">
          <span>欺诈分：<span className={cn('font-semibold', con.fraud_score >= 80 ? 'text-rose-600' : con.fraud_score >= 50 ? 'text-amber-600' : 'text-emerald-600')}>{con.fraud_score}</span></span>
          <span>风险等级：{con.risk_level}</span>
        </div>
        <FinalOpsCard
          decision={isReject ? 'reject' : isReview ? 'pending' : 'pass'}
          reviewNote={isReview ? con.decision_detail : undefined}
        />
      </div>

      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1 space-y-4">
          {/* 一、用户提交与入参 */}
          <Panel title="一、用户提交与入参（原始）" id="raw">
            <div className="mb-4">
              <div className="mb-2 text-xs font-medium text-slate-500">用户结构化基础入参</div>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {Object.entries(d.raw_inputs.base).map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2">
                    <span className="text-xs text-slate-400">{k}</span>
                    <span className="text-xs font-medium text-ink-900">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            {(['device_env', 'internal', 'external_request'] as const).map((group) => {
              const titleMap: Record<string, string> = {
                device_env: '设备与环境数据（欺诈识别独有）',
                internal: '内部自有存量数据',
                external_request: '外部第三方请求',
              }
              const data = d.raw_inputs[group]
              return (
                <details key={group} className="group mb-3 rounded-lg border border-slate-200">
                  <summary className="flex cursor-pointer items-center justify-between px-3.5 py-2.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50">
                    {titleMap[group]}
                    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-slate-400 transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </summary>
                  <div className="grid grid-cols-2 gap-2 border-t border-slate-100 p-3 md:grid-cols-3">
                    {Object.entries(data).map(([k, v]) => {
                      const warnV = typeof v === 'string' && (v.includes('命中') || v.includes('疑似') || v.includes('代理') || v.includes('伪造'))
                      return (
                        <div key={k} className="flex items-center justify-between rounded bg-slate-50 px-2.5 py-1.5">
                          <span className="text-[11px] text-slate-400">{k}</span>
                          <span className={cn('text-[11px] font-medium', warnV ? 'text-amber-600' : 'text-slate-700')}>{String(v)}</span>
                        </div>
                      )
                    })}
                  </div>
                </details>
              )
            })}
          </Panel>

          {/* 二、结构化欺诈特征 */}
          <Panel title="二、结构化欺诈特征" id="structured">
            {/* 设备 / 团伙 / 材料 可视化概览（Q7） */}
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <FeatCard title="设备风险" data={d.structured['设备风险']} />
              <FeatCard title="团伙关联" data={d.structured['团伙关联']} />
              <FeatCard title="材料真伪" data={d.structured['材料真伪']} />
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {Object.entries(d.structured).map(([cat, fields]) => {
                const hasAnomaly = Object.values(fields).some((v) => String(v).includes('是') || String(v).includes('疑似') || String(v).includes('高'))
                return (
                  <div key={cat} className={cn('rounded-xl border p-3.5', hasAnomaly ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white')}>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-xs font-semibold text-ink-900">{cat}</span>
                      {hasAnomaly && <Badge kind="amber">异常</Badge>}
                    </div>
                    <div className="space-y-1.5">
                      {Object.entries(fields).map(([k, v]) => {
                        const abnormal = String(v).includes('是') || String(v).includes('疑似') || String(v).includes('高') || String(v).includes('>')
                        return (
                          <div key={k} className="flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">{k}</span>
                            <span className={cn('font-medium', abnormal ? 'text-rose-600' : 'text-slate-700')}>{String(v)}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </Panel>

          {/* 三、单项欺诈判断结果 */}
          <Panel title="三、单项欺诈判断结果" id="single">
            <div className="grid gap-3 md:grid-cols-2">
              {d.single_results.map((s) => (
                <SingleFraudCard key={s.source} s={s} />
              ))}
            </div>
          </Panel>

          {/* 四、欺诈识别过程 */}
          <Panel title="四、欺诈识别过程" id="process">
            <div className="relative mb-4">
              <div className="mb-2 text-xs text-slate-400">
                聚合耗时：<span className="font-medium text-slate-600">{d.fraud_process.aggregate_ms}ms</span>
                {d.fraud_process.circuit_break.length > 0 && (
                  <span className="ml-2 text-amber-600">（{d.fraud_process.circuit_break.length} 项熔断降级）</span>
                )}
              </div>
              <div className="space-y-2">
                {d.fraud_process.parallel_threads.map((t) => (
                  <div key={t.thread} className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5">
                    <span className="text-xs font-medium text-slate-500">{t.thread}</span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink-900">{t.source}</span>
                        {t.circuit_break && <Badge kind="amber">熔断</Badge>}
                      </div>
                      <div className="mt-0.5 text-[11px] text-slate-400">
                        发送 {t.send} → 接收 {t.recv} · {t.cost_ms}ms · 回执 {t.code}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className={cn('inline-block h-6 w-20 rounded text-center text-[10px] font-medium leading-6', t.cost_ms < 500 ? 'bg-emerald-100 text-emerald-600' : t.cost_ms < 1000 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600')}>{t.cost_ms}ms</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 聚合节点 */}
            <div className="rounded-lg border border-brand-200 bg-brand-50/40 px-3.5 py-2.5 text-xs text-brand-700">
              ✓ 全部 5 个引擎返回 → 聚合进入交叉融合计算
            </div>
          </Panel>

          {/* 五、欺诈结论 */}
          <Panel title="五、欺诈结论（含交叉融合）" id="conclusion">
            {/* 欺诈分 */}
            <div className="mb-4 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">欺诈分（智信分）</span>
                    <span className={cn('text-2xl font-bold', con.fraud_score >= 80 ? 'text-rose-600' : con.fraud_score >= 50 ? 'text-amber-600' : 'text-emerald-600')}>
                      {con.fraud_score}
                      <span className="text-xs font-normal text-slate-300">/100</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">风险等级</span>
                    <Badge kind={con.risk_level === '高风险' ? 'red' : con.risk_level === '中风险' ? 'amber' : 'green'}>{con.risk_level}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-1">
                    {con.risk_tags.map((t, i) => (
                      <span key={i} className="rounded bg-rose-100 px-2 py-0.5 text-[10px] font-medium text-rose-700">{t}</span>
                    ))}
                  </div>
                </div>
                <Badge kind={isReject ? 'red' : isReview ? 'amber' : 'green'} className="px-3 py-1 text-sm font-semibold">{String(con.decision)}</Badge>
              </div>
              <ScoreBar
                value={con.fraud_score}
                floor={0}
                max={100}
                kind={con.fraud_score >= 80 ? 'red' : con.fraud_score >= 50 ? 'amber' : 'green'}
                marks={FRAUD_MARKS}
              />
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600">{con.decision_detail}</p>
            </div>

            {/* 交叉融合 */}
            {con.cross_fusion.length > 0 && (
              <div>
                <div className="mb-2 text-xs font-medium text-slate-500">交叉融合冲突清单</div>
                <div className="space-y-2">
                  {con.cross_fusion.map((cf, i) => (
                    <CrossFusionCard key={i} cf={cf} />
                  ))}
                </div>
              </div>
            )}
            {con.cross_fusion.length === 0 && (
              <div className="rounded-lg bg-emerald-50 px-3.5 py-3 text-xs text-emerald-600">
                ✓ 无交叉冲突，各引擎结论一致通过。
              </div>
            )}
          </Panel>

          {/* 六、单条异常操作 */}
          <Panel title="六、操作人对单条欺诈异常的进一步操作" id="item-actions">
            <ItemActionTable rows={d.item_actions} />
          </Panel>



          {/* 八、操作记录与审计（Q8：原缺失，现补回） */}
          <Panel title="八、操作记录与审计" id="audit">
            <ReportActionTable rows={d.report_actions} audit={d.audit_trail} />
          </Panel>

          {/* 返回顶部 */}
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
                  onClick={() => { const el = document.getElementById(c.id); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }) }}
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

// ========================= 子组件 =========================

function SingleFraudCard({ s }: { s: SingleFraudResult }) {
  const isHit = s.status === '命中'
  const isDoubt = s.status === '存疑'
  const borderCls = isHit ? 'border-rose-200 bg-rose-50/30' : isDoubt ? 'border-amber-200 bg-amber-50/30' : 'border-slate-200 bg-white'
  return (
    <div className={cn('rounded-xl border p-3.5', borderCls)}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-semibold text-ink-900">{s.source}</span>
        <Badge kind={conclBadge[s.status]}>{s.status}</Badge>
      </div>
      <div className="space-y-1">
        {Object.entries(s.fields).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between text-[11px]">
            <span className="text-slate-400">{k}</span>
            <span className={cn('font-medium', isHit ? 'text-rose-600' : isDoubt ? 'text-amber-600' : 'text-slate-700')}>{String(v)}</span>
          </div>
        ))}
      </div>
      <div className="mt-2 border-t border-slate-100 pt-2 text-[10px] text-slate-400">
        回执：{s.receipt_code} · {s.cost_ms}ms
        {s.risk_tags.length > 0 && (
          <span className="ml-2">
            {s.risk_tags.map((t, i) => (
              <span key={i} className="ml-1 rounded bg-rose-100 px-1.5 py-0.5 text-[10px] text-rose-700">{t}</span>
            ))}
          </span>
        )}
      </div>
    </div>
  )
}

function CrossFusionCard({ cf }: { cf: CrossFusion }) {
  const isRed = cf.severity === '红'
  return (
    <div className={cn('rounded-lg border p-3', isRed ? 'border-rose-200 bg-rose-50/40' : 'border-amber-200 bg-amber-50/40')}>
      <div className="flex items-center gap-2">
        <Badge kind={isRed ? 'red' : 'amber'}>{cf.severity}</Badge>
        <span className="text-sm text-ink-900">{cf.desc}</span>
      </div>
      <div className="mt-1.5 text-xs text-slate-500">数据源冲突：{cf.sources}</div>
    </div>
  )
}

function ItemActionTable({ rows }: { rows: FraudReport['item_actions'] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th className="px-3 py-2 font-medium">异常项</th>
            <th className="px-3 py-2 font-medium">操作</th>
            <th className="px-3 py-2 font-medium">操作人</th>
            <th className="px-3 py-2 font-medium">时间</th>
            <th className="px-3 py-2 font-medium">结果</th>
            <th className="px-3 py-2 font-medium">备注</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-8 text-center text-xs text-slate-400">暂无单项操作记录</td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 align-top">
                <td className="px-3 py-2 text-xs font-medium text-slate-700">{r.item}</td>
                <td className="px-3 py-2"><Badge kind="blue">{r.action}</Badge></td>
                <td className="px-3 py-2 text-xs text-slate-500">{r.operator}</td>
                <td className="px-3 py-2 text-xs text-slate-500">{r.time}</td>
                <td className="px-3 py-2 text-xs"><span className={cn('font-medium', r.result.includes('确认') || r.result.includes('欺诈') || r.result.includes('团伙') ? 'text-rose-600' : 'text-amber-600')}>{r.result}</span></td>
                <td className="px-3 py-2 text-xs text-slate-600">{r.note}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

function ReportActionTable({ rows, audit }: { rows: FraudReport['report_actions']; audit: FraudReport['audit_trail'] }) {
  return (
    <div className="space-y-4">
      <div>
        <div className="mb-2 text-xs font-medium text-slate-500">全局操作记录</div>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="px-3 py-2 font-medium">操作</th>
              <th className="px-3 py-2 font-medium">操作人</th>
              <th className="px-3 py-2 font-medium">时间</th>
              <th className="px-3 py-2 font-medium">备注</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-3 py-8 text-center text-xs text-slate-400">暂无全局操作记录</td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-b border-slate-100 align-top">
                  <td className="px-3 py-2"><Badge kind={r.action === '自动通过' || r.action === '人工放行' ? 'green' : r.action === '直接拒绝' ? 'red' : 'amber'}>{r.action}</Badge></td>
                  <td className="px-3 py-2 text-xs text-slate-500">{r.operator}</td>
                  <td className="px-3 py-2 text-xs text-slate-500">{r.time}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{r.note}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div>
        <div className="mb-2 text-xs font-medium text-slate-500">全链路审计日志（监管留痕）</div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          {audit.length === 0 ? (
            <p className="text-xs text-slate-400">暂无审计日志</p>
          ) : (
            <div className="space-y-1.5">
              {audit.map((a, i) => (
                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="w-32 shrink-0 text-slate-400">{a.time}</span>
                  <span className="font-medium text-slate-700">{a.operator}</span>
                  <span>{a.action}</span>
                  {(a.from || a.to) && <span className="text-slate-400">（{a.from} → {a.to}）</span>}
                  {i < audit.length - 1 && <span className="ml-auto"><Badge kind="gray">↓</Badge></span>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
