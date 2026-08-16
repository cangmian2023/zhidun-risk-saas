/* ============================================================================
 * 报告模块统一配置 + 通用列表组件（N.1：按信息核验222 架构，一套组件跑四类模块）
 * 信息核验 / 信用风控 / 欺诈识别 / 进件审核 共用同一列表逻辑：
 *   数据从本地 JSON 读取，得分/自动审核按模板分段生成；
 *   业务流程状态经统一绑定层（flowBinding）显示「流程状态」列并流转
 * ========================================================================== */
import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader, Panel, Badge, StatCard, SingleSelect, Button, DecisionTag, type SelectOption } from '../components/ui'
import type { VerifyRow } from './VerifyOps'
import { Sam } from './SourceTag'
import { useTemplate } from './templateStore'
import { useReportRows, updateReportRows } from './reportListStore'
// 统一流程绑定层（与预警工作台同一套）：列表页显示「流程状态」列，状态流转写回各自 JSON
import FlowStateCell from './FlowStateCell'
import { matchObjOf, flowIdOfRow, nowStamp, usePageFlow } from './flowBinding'
import { matchGrade, scoreForVerifySys, computeReportTotal, type ScoreGrade, type ReportType } from './reportTemplateData'
import infoListJson from './infoVerify222Data.json'
import infoDetailSamples from './infoVerify222DetailData.json'
import infoDefaultSample from './infoVerify222Sample.json'
import creditListJson from './creditVerifyData.json'
import creditDetailSamples from './creditVerifyDetailData.json'
import creditDefaultSample from './creditVerifySample.json'
import fraudListJson from './fraudVerifyData.json'
import fraudDetailSamples from './fraudVerifyDetailData.json'
import fraudDefaultSample from './fraudVerifySample.json'
import decisionListJson from './decisionVerifyData.json'
import decisionDetailSamples from './decisionVerifyDetailData.json'
import decisionDefaultSample from './decisionVerifySample.json'

/* ── 模块配置 ── */
export interface ReportModuleCfg {
  key: string                  // 'info' | 'credit' | 'fraud' | 'decision'
  title: string                // 列表页/详情页标题
  subtitle: string             // 列表页副标题（数据来源说明）
  crumb: string                // 面包屑
  templateId: string           // 关联模板 id（方案222备用）
  fallbackType: ReportType     // 模板缺失时的兜底类型
  listJson: VerifyRow[]        // 列表数据（本地 JSON）
  detailSamples: Record<string, any>   // A/B/C 样例池
  defaultSample: any           // 默认样例
  listRoute: string            // 列表路由
  detailRoute: string          // 详情路由
  saveFile: string             // 持久化文件名（infoVerify222Data.json 等）
}

export const INFO_MODULE: ReportModuleCfg = {
  key: 'info', title: '信息核验', subtitle: '模板驱动 · 数据从本地 JSON 文件读取（infoVerify222Data.json）',
  crumb: '零售信贷风控 / 贷前审核', templateId: 'tpl-info-backup222', fallbackType: 'info_verify',
  listJson: infoListJson as VerifyRow[], detailSamples: infoDetailSamples as Record<string, any>, defaultSample: infoDefaultSample,
  listRoute: '/console/cr/pre-verify', detailRoute: '/console/cr/pre-verify-detail', saveFile: 'infoVerify222Data.json',
}

export const CREDIT_MODULE: ReportModuleCfg = {
  key: 'credit', title: '信用风控', subtitle: '模板驱动 · 数据从本地 JSON 文件读取（creditVerifyData.json）',
  crumb: '零售信贷风控 / 贷前审核', templateId: 'tpl-credit-222', fallbackType: 'credit',
  listJson: creditListJson as VerifyRow[], detailSamples: creditDetailSamples as Record<string, any>, defaultSample: creditDefaultSample,
  listRoute: '/console/cr/credit-kimi', detailRoute: '/console/cr/credit-kimi-detail', saveFile: 'creditVerifyData.json',
}

export const FRAUD_MODULE: ReportModuleCfg = {
  key: 'fraud', title: '欺诈识别', subtitle: '模板驱动 · 数据从本地 JSON 文件读取（fraudVerifyData.json）',
  crumb: '零售信贷风控 / 贷前审核', templateId: 'tpl-fraud-222', fallbackType: 'fraud',
  listJson: fraudListJson as VerifyRow[], detailSamples: fraudDetailSamples as Record<string, any>, defaultSample: fraudDefaultSample,
  listRoute: '/console/cr/pre-fraud', detailRoute: '/console/cr/pre-fraud-detail', saveFile: 'fraudVerifyData.json',
}

export const DECISION_MODULE: ReportModuleCfg = {
  key: 'decision', title: '进件审核', subtitle: '模板驱动 · 数据从本地 JSON 文件读取（decisionVerifyData.json）',
  crumb: '零售信贷风控 / 贷前审核', templateId: 'tpl-decision-222', fallbackType: 'decision',
  listJson: decisionListJson as VerifyRow[], detailSamples: decisionDetailSamples as Record<string, any>, defaultSample: decisionDefaultSample,
  listRoute: '/console/cr/pre-report', detailRoute: '/console/cr/pre-report-detail', saveFile: 'decisionVerifyData.json',
}

/* ── 来源调试标签（蓝=模板配置 / 橙=本地JSON数据 / 灰=实时算法） ── */
const tagS: CSSProperties = { display: 'inline-block', fontSize: 9, fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, marginLeft: 3, verticalAlign: 'middle', lineHeight: '14px', fontWeight: 400 }
const Tpl = ({ f, v }: { f: string; v?: any }) => <span style={{ ...tagS, background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD' }}>{f}={v ?? 'null'}</span>
const Dat = ({ f, v }: { f: string; v?: any }) => <span style={{ ...tagS, background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' }}>{f}={v ?? 'null'}</span>
const Cal = ({ f, v }: { f: string; v?: any }) => <span style={{ ...tagS, background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB' }}>{f}={v ?? 'null'}</span>

/* 行增强：按模板分段生成得分与自动审核结果 */
export interface ModuleRow extends VerifyRow {
  segScore: number | null
  segGrade?: string
  segResult: string
}

const PRODUCTS = ['信用贷', '抵押贷', '经营贷']
const CHANNELS = ['APP', 'H5', '小程序', '线下']
const TIME_OPTIONS: SelectOption[] = [
  { value: '7', label: '近 7 天' },
  { value: '30', label: '近 30 天' },
  { value: '90', label: '近 90 天' },
]

const SYS_RESULTS: string[] = ['处理中', '通过', '转人工', '拒绝']
const SYS_KIND: Record<string, 'gray' | 'green' | 'red' | 'amber'> = {
  处理中: 'gray', 通过: 'green', 拒绝: 'red', 预警: 'amber', 转人工: 'amber',
}

function MultiChip<T extends string>({ label, options, selected, onChange }: {
  label: string; options: T[]; selected: T[]; onChange: (v: T[]) => void
}) {
  const [open, setOpen] = useState(false)
  const toggle = (v: T) => onChange(selected.includes(v) ? selected.filter((x) => x !== v) : [...selected, v])
  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition ${selected.length ? 'border-violet-300 bg-violet-50 text-violet-700' : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400'}`}>
        {label}{selected.length > 0 && <Badge kind="violet" className="ml-1">{selected.length}</Badge>}
        <svg className="h-3.5 w-3.5 opacity-60" viewBox="0 0 20 20" fill="currentColor"><path d="M5.5 7.5 10 12l4.5-4.5" /></svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-30 mt-1 w-44 rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
            {options.map((o) => (
              <label key={o} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-slate-50">
                <input type="checkbox" checked={selected.includes(o)} onChange={() => toggle(o)} className="h-4 w-4 rounded border-slate-300 text-violet-600" />
                <span className="text-slate-700">{o}</span>
              </label>
            ))}
            {selected.length > 0 && <button onClick={() => onChange([])} className="mt-1 w-full rounded px-2 py-1.5 text-left text-xs text-slate-500 hover:bg-slate-50">清空</button>}
          </div>
        </>
      )}
    </div>
  )
}

type Side = 'left' | 'right' | null
const C = { id: 168, name: 104, product: 96, channel: 84, amount: 128, score: 100, sys: 116, time: 160, flowState: 150, op: 224 }
const headStyle = (w: number, side: Side, offset = 0): CSSProperties => {
  const s: CSSProperties = { width: w, minWidth: w, maxWidth: w, position: 'sticky', top: 0 }
  if (side === 'left') { s.left = offset; s.zIndex = 30 }
  else if (side === 'right') { s.right = 0; s.zIndex = 30 }
  else s.zIndex = 20
  return s
}
const bodyStyle = (w: number, side: Side, offset = 0): CSSProperties => {
  const s: CSSProperties = { width: w, minWidth: w, maxWidth: w }
  if (side === 'left') { s.position = 'sticky'; s.left = offset; s.zIndex = 10 }
  else if (side === 'right') { s.position = 'sticky'; s.right = 0; s.zIndex = 10 }
  return s
}

export function ReportModuleList({ cfg }: { cfg: ReportModuleCfg }) {
  const tpl = useTemplate(cfg.templateId) ?? useTemplate(undefined, cfg.fallbackType)
  const grades: ScoreGrade[] = tpl?.scoreDisplay.grades ?? []
  // 统一流程绑定：本页关联的业务流程（bizFlows.json 由管理中心配置，四页共用 f-loan-review）
  const pageFlow = usePageFlow(cfg.listRoute)
  // 列表数据来自运行时磁盘读取（共享 store）；缺失回落打包 JSON。得分/自动审核实时算（与详情页共用算法）
  const allRows = useReportRows(cfg.saveFile, cfg.listJson)
  const enrichRow = (r: VerifyRow): ModuleRow => {
    const design = scoreForVerifySys(r.sysResult, grades)
    const seg = design != null ? matchGrade(design, grades) : undefined
    const sampleData: any = (seg && cfg.detailSamples[seg.grade]) || cfg.defaultSample
    const sc = seg && tpl ? computeReportTotal(tpl, sampleData).total : null
    const g = sc != null ? matchGrade(sc, grades) : undefined
    return { ...r, segScore: sc, segGrade: g?.grade ?? seg?.grade, segResult: g?.autoResult ?? r.sysResult }
  }
  const rows = useMemo<ModuleRow[]>(() => allRows.map(enrichRow), [allRows])
  const [kw, setKw] = useState('')
  const [products, setProducts] = useState<string[]>([])
  const [channels, setChannels] = useState<string[]>([])
  const [sysResults, setSysResults] = useState<string[]>([])
  const [creditMax, setCreditMax] = useState('')
  const [amountMax, setAmountMax] = useState('')
  const [timeRange, setTimeRange] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(50)
  const nav = useNavigate()

  const goReport = (r: VerifyRow) =>
    nav(`${cfg.detailRoute}?id=${encodeURIComponent(r.id)}`)

  const stats = useMemo(() => {
    const total = rows.length
    const passed = rows.filter((r) => r.sysResult === '通过').length
    const pending = rows.filter((r) => r.flowState === '待审核').length
    const doing = rows.filter((r) => r.flowState === '审核中').length
    const done = rows.filter((r) => r.flowState === '已通过').length
    return [
      { label: '待审核', value: String(pending), hint: '流程状态 · 待审核', accent: 'amber' as const },
      { label: '审核中', value: String(doing), hint: '流程状态 · 审核中', accent: 'blue' as const },
      { label: '已通过', value: String(done), hint: '流程状态 · 已通过', accent: 'emerald' as const },
      { label: '自动审核通过率', value: total ? `${Math.round((passed / total) * 100)}%` : '0%', hint: `系统通过 ${passed} / 共 ${total} 笔`, accent: 'violet' as const },
    ]
  }, [rows])

  const filtered = useMemo(() => {
    const now = new Date('2026-08-02T23:59:59').getTime()
    return rows.filter((r) => {
      if (kw && !`${r.id} ${r.name}`.toLowerCase().includes(kw.toLowerCase())) return false
      if (products.length && !products.includes(r.product)) return false
      if (channels.length && !channels.includes(r.channel)) return false
      if (sysResults.length && !sysResults.includes(r.segResult)) return false
      if (creditMax && r.segScore != null && r.segScore > Number(creditMax)) return false
      if (amountMax && r.amount > Number(amountMax)) return false
      if (timeRange) {
        const t = new Date(r.auditTime.replace(' ', 'T')).getTime()
        if (now - t > Number(timeRange) * 86400000) return false
      }
      return true
    })
  }, [rows, kw, products, channels, sysResults, creditMax, amountMax, timeRange])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, totalPages)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const resetFilters = () => {
    setKw(''); setProducts([]); setChannels([]); setSysResults([])
    setCreditMax(''); setAmountMax(''); setTimeRange('')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <PageHeader
        crumb={cfg.crumb}
        title={cfg.title}
        subtitle={cfg.subtitle}
      />

      <div className="mx-auto max-w-[1400px] space-y-5 px-4 pb-10">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={s.value} hint={s.hint} accent={s.accent} />
          ))}
        </div>

        <Panel>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2.5">
            <div className="flex flex-wrap items-center gap-3">
              <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="搜索申请编号 / 申请人" className="w-64 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100" />
              <MultiChip label="产品" options={PRODUCTS} selected={products} onChange={setProducts} />
              <MultiChip label="渠道" options={CHANNELS} selected={channels} onChange={setChannels} />
              <MultiChip label="自动审核" options={SYS_RESULTS} selected={sysResults} onChange={setSysResults} />
            </div>
            <div className="hidden min-w-[1rem] flex-1 xl:block" />
            <div className="flex flex-wrap items-center gap-3">
              <input value={creditMax} onChange={(e) => setCreditMax(e.target.value)} placeholder="得分 ≤" className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
              <input value={amountMax} onChange={(e) => setAmountMax(e.target.value)} placeholder="申请额度 ≤" className="w-28 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-violet-400" />
              <SingleSelect label="申请时间" options={TIME_OPTIONS} value={timeRange} onChange={setTimeRange} clearable />
              <Button variant="ghost" onClick={resetFilters}>重置</Button>
            </div>
          </div>
        </Panel>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="border-collapse text-sm" style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}>
              <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th style={headStyle(C.id, 'left', 0)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">申请编号</th>
                  <th style={headStyle(C.name, 'left', C.id)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">申请人</th>
                  <th style={headStyle(C.product, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">产品</th>
                  <th style={headStyle(C.channel, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">渠道</th>
                  <th style={headStyle(C.amount, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right font-medium">申请额度</th>
                  <th style={headStyle(C.score, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-right font-medium">得分</th>
                  <th style={headStyle(C.sys, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">自动审核</th>
                  <th style={headStyle(C.time, null)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-left font-medium">申请时间</th>
                  {pageFlow && <th style={headStyle(C.flowState, 'right', C.op)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 text-center font-medium">流程状态<Sam f="流程状态" /></th>}
                  <th style={headStyle(C.op, 'right', 0)} className="border-b border-slate-200 bg-slate-50 px-3 py-3 pr-[22px] text-left font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pageRows.map((r) => {
                  const seg = r.segScore != null ? matchGrade(r.segScore, grades) : undefined
                  return (
                    <tr key={r.id} className="group hover:bg-slate-50/60">
                      <td style={bodyStyle(C.id, 'left', 0)} className="whitespace-nowrap bg-white px-3 py-3 font-mono text-xs text-slate-700 group-hover:bg-slate-50/60">
                        <button onClick={() => goReport(r)} className="font-medium text-brand-600 hover:underline">{r.id}</button>
                        <Dat f="JSON:id" v={r.id} />
                      </td>
                      <td style={bodyStyle(C.name, 'left', C.id)} className="whitespace-nowrap bg-white px-3 py-3 text-slate-800 group-hover:bg-slate-50/60">{r.name}<Dat f="JSON:name" v={r.name} /></td>
                      <td style={bodyStyle(C.product, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.product}<Dat f="JSON:product" v={r.product} /></td>
                      <td style={bodyStyle(C.channel, null)} className="whitespace-nowrap px-3 py-3 text-slate-600">{r.channel}<Dat f="JSON:channel" v={r.channel} /></td>
                      <td style={bodyStyle(C.amount, null)} className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">¥{r.amount.toLocaleString()}<Dat f="JSON:amount" v={r.amount} /></td>
                      <td style={bodyStyle(C.score, null)} className="whitespace-nowrap px-3 py-3 text-right">
                        {r.segScore != null ? (
                          <span className="tabular-nums font-semibold" style={{ color: seg?.color ?? '#6B7280' }}>{r.segScore}</span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                        <Cal f="模板分段生成" v={r.segScore ?? '—'} />
                      </td>
                      <td style={bodyStyle(C.sys, null)} className="whitespace-nowrap px-3 py-3 text-center">
                        <DecisionTag kind={SYS_KIND[r.segResult]} soft={r.segResult === '处理中'}>{r.segResult}</DecisionTag>
                        <Cal f="matchGrade" v={r.segResult} />
                      </td>
                      <td style={bodyStyle(C.time, null)} className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-500">{r.auditTime}</td>
                      {pageFlow && (
                        <td style={bodyStyle(C.flowState, 'right', C.op)} className="whitespace-nowrap bg-white px-3 py-3 text-center group-hover:bg-slate-50/60">
                          <FlowStateCell
                            flowId={flowIdOfRow(r, pageFlow)}
                            state={String(r.flowState ?? '')}
                            matchObj={matchObjOf(r as any)}
                            onChange={(next) => updateReportRows(cfg.saveFile, (rs) => rs.map((x) => x.id === r.id ? { ...x, flowState: next, flowStateAt: nowStamp() } : x))}
                          />
                        </td>
                      )}
                      <td style={bodyStyle(C.op, 'right', 0)} className="whitespace-nowrap bg-white px-3 py-3 pr-[22px] text-left group-hover:bg-slate-50/60">
                        <div className="flex flex-wrap items-center justify-start gap-3">
                          <button type="button" onClick={() => goReport(r)} className="whitespace-nowrap text-xs font-medium text-brand-600 hover:underline">查看</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {pageRows.length === 0 && (
                  <tr><td colSpan={pageFlow ? 10 : 9} className="whitespace-nowrap px-3 py-10 text-center text-sm text-slate-400">暂无符合条件的核验记录</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 text-sm">
            <div className="text-slate-500">共 {filtered.length} 条</div>
            <div className="flex items-center gap-2">
              <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 enabled:hover:bg-slate-50 disabled:opacity-40">上一页</button>
              <span className="text-slate-500">第 {safePage} / {totalPages} 页</span>
              <button disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-slate-600 enabled:hover:bg-slate-50 disabled:opacity-40">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
