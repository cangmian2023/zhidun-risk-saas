/* ============================================================================
 * 报告模块通用详情页（N.2：按信息核验222 架构，一套组件跑四类模块）
 * 数据来源：模板配置(templateSeed.json) + 用户JSON（各模块自己的样例数据，本地保存）
 * 蓝标=模板配置 橙标=JSON数据 灰标=计算结果
 * ========================================================================== */
import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, DetailHeader, Panel } from '../components/ui'
import { ScoreVisual } from './ScoreVisual'
import { TemplateDimTable } from './TemplateDimTable'
import { useTemplate } from './templateStore'
import { DisplayModeToggle } from './DisplayModeToggle'
import { computeSectionScore, matchGrade, scoreForVerifySys, computeReportTotal, type SectionConfig, type ReportType } from './reportTemplateData'
import type { ReportModuleCfg } from './ReportModule'
import { useReportRows, updateReportRows } from './reportListStore'
// 统一流程绑定层（与预警工作台同一套）：详情页顶部显示流程操作条
import { FlowBar } from './flowBinding'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')
const V = (v: any) => (v != null ? String(v) : 'null')

/* ─── 调试标签 ─── */

/* ─── 共享组件 ─── */
function SectionTable({ head, children }: { head: string[]; children: ReactNode }) {
  return <div className="overflow-x-auto rounded-xl border border-slate-200"><table className="w-max min-w-full border-collapse text-sm whitespace-nowrap"><thead><tr className="bg-slate-50 text-left text-xs font-medium text-slate-500">{head.map((h, i) => {
    const stickyLeft = i === 0 ? 'sticky left-0 z-10 bg-slate-50' : ''
    const stickyRight = i === head.length - 1 ? 'sticky right-0 z-10 bg-slate-50' : ''
    return <th key={i} className={`border-b border-slate-200 px-3 py-2 ${stickyLeft} ${stickyRight}`}>{h}</th>
  })}</tr></thead><tbody>{children}</tbody></table></div>
}

function ScoreTag({ pts, max }: { pts?: number; max?: number }) {
  if (pts == null) return null
  // 0 分也要显示（用户：得分等于 0 时不能只看到 JSON 标签）；中性灰
  if (pts === 0) return <span className="ml-1.5 inline-flex shrink-0 items-center rounded-md bg-slate-50 px-1.5 py-0.5 text-[11px] font-medium tabular-nums text-slate-500 ring-1 ring-slate-200">0分</span>
  const minus = pts < 0
  return <span className={cn('ml-1.5 inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums', minus ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200')}>{minus ? '−' : '+'}{Math.abs(pts)}分{max != null && max !== Math.abs(pts) ? <span className="ml-0.5 text-[9px] opacity-60">/{max}</span> : null}</span>
}

/* ─── 冻结列工具：第一列 sticky left，最后一列 sticky right ─── */
const freezeF = 'sticky left-0 z-10 bg-white group-hover:bg-slate-50/60'
const freezeL = 'sticky right-0 z-10 bg-white group-hover:bg-slate-50/60'

/* ─── 标准化区块渲染（汇总分由外部传入，内部不再重算） ─── */
function DataSourceSection({ section, data, title, secId, totalScore, reportType }: { section?: SectionConfig; data: { groups: { name: string; rows: any[] }[] }; title: ReactNode; secId: string; totalScore: number; reportType: ReportType }) {
  const mode = section?.displayMode ?? 'list'
  const sc = section ? computeSectionScore(section) : null
  const cardMax = sc ? Math.abs(sc.total) : 0
  const hasOps = true // 所有区块都有操作列，豁免按钮由模板 fields[].hitReject 决定

  return (
    <Panel title={title} id={secId} actions={<DisplayModeToggle reportType={reportType} sectionId={secId} />}>
      {/* 总得分 */}
      <div className="mb-4 flex items-center gap-2">
        <span className={cn('text-3xl font-bold tabular-nums', totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{totalScore >= 0 ? '+' : '−'}{Math.abs(totalScore)}</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', totalScore >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>{totalScore >= 0 ? '达标加分' : '命中扣分'}</span>
      </div>
      <div className="mb-3 text-xs text-slate-500">本卡得分 · 集合权重 {section?.weight ?? 1} · 本卡满分 {cardMax}</div>

      {mode === 'list' ? (
        <div className="space-y-4">
          {data.groups.map((g, gi) => (
            <div key={gi}>
              <div className="mb-2 text-xs font-medium text-slate-500">{g.name}</div>
              <SectionTable head={['字段', '内容', '校验', '得分', '总分', ...(hasOps ? ['操作'] : [])]}>
                {g.rows.map((r: any, ri: number) => (
                  <tr key={ri} className="border-b border-slate-100">
                    <td className={`px-3 py-2 text-sm text-slate-500 ${freezeF}`}>{r.field}</td>
                    <td className="px-3 py-2 text-sm font-medium text-ink-900">{V(r.value)}</td>
                    <td className="px-3 py-2">{r.valid ? <span className="text-[11px] text-emerald-500">✓ 正常</span> : <Badge kind="red">异常</Badge>}</td>
                    <td className="px-3 py-2"><ScoreTag pts={r.score} /></td>
                    <td className="px-3 py-2 text-xs text-slate-400">{section?.fields?.[ri]?.scorePoints ?? '-'}</td>
                    {hasOps && <td className={`px-3 py-2 ${freezeL}`}>{section?.fields?.[ri]?.hitReject ? <button className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">豁免</button> : null}</td>}
                  </tr>
                ))}
              </SectionTable>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {data.groups.map((g, gi) => (
            <div key={gi}>
              <div className="mb-2 text-xs font-medium text-slate-500">{g.name}</div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.rows.map((r: any, ri: number) => (
                  <div key={ri} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-slate-500">{r.field}</span>
                      {r.valid ? <span className="text-[11px] text-emerald-500">✓</span> : <Badge kind="red">!</Badge>}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-ink-900">{V(r.value)}</span>
                      <ScoreTag pts={r.score} max={section?.fields?.[ri]?.scorePoints} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

function ApiSection({ section, data, title, secId, totalScore, reportType }: { section?: SectionConfig; data: any[]; title: ReactNode; secId: string; totalScore: number; reportType: ReportType }) {
  const mode = section?.displayMode ?? 'list'
  const sc = section ? computeSectionScore(section) : null
  const cardMax = sc ? Math.abs(sc.total) : 0
  const hasOps = true // 所有区块都有操作列，豁免按钮由模板 fields[].hitReject 决定

  return (
    <Panel title={title} id={secId} actions={<DisplayModeToggle reportType={reportType} sectionId={secId} />}>
      <div className="mb-4 flex items-center gap-2">
        <span className={cn('text-3xl font-bold tabular-nums', totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{totalScore >= 0 ? '+' : '−'}{Math.abs(totalScore)}</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', totalScore >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>{totalScore >= 0 ? '达标加分' : '命中扣分'}</span>
      </div>
      <div className="mb-3 text-xs text-slate-500">本卡得分 · 集合权重 {section?.weight ?? 1} · 本卡满分 {cardMax}</div>
      {mode === 'card' ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {data.map((img: any, i: number) => (
            <div key={i} className={`overflow-hidden rounded-xl border bg-white ${img.valid ? 'border-slate-200' : 'border-rose-200'}`}>
              {/* 预览占位 */}
              <div className="flex aspect-[4/3] items-center justify-center bg-slate-100 text-[10px] text-slate-400">
                {img.type === '视频' ? (
                  <span className="flex items-center gap-1"><svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor"><path d="M4 4h8v12H4z" opacity="0.3" /><path d="M12 6l4-2v12l-4-2z" /></svg>视频</span>
                ) : '图片预览'}
              </div>
              <div className="p-2.5">
                <div className="flex items-center justify-between gap-1.5">
                  <span className="truncate text-xs font-semibold text-ink-900">{img.name}</span>
                  {img.type === '视频' ? <Badge kind="blue">视频</Badge> : <Badge kind="gray">图片</Badge>}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{V(img.value)}</span>
                  {img.valid ? <span className="text-[11px] text-emerald-500">✓</span> : <Badge kind="red">!</Badge>}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <ScoreTag pts={img.score} max={section?.fields?.[i]?.scorePoints} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <SectionTable head={['名称', '类型', '预览', '校验', '得分', '总分', ...(hasOps ? ['操作'] : [])]}>
        {data.map((img: any, i: number) => (
          <tr key={i} className="border-b border-slate-100 align-top">
            <td className={`px-3 py-2 text-sm font-medium text-ink-900 ${freezeF}`}>{img.name}</td>
            <td className="px-3 py-2">{img.type === '视频' ? <Badge kind="blue">视频</Badge> : '图片'}</td>
            <td className="px-3 py-2"><div className="grid h-10 w-14 place-items-center rounded bg-slate-100 text-[10px] text-slate-400">预览</div></td>
            <td className="px-3 py-2">{img.valid ? <span className="text-[11px] text-emerald-500">✓</span> : <Badge kind="red">!</Badge>}</td>
            <td className="px-3 py-2"><ScoreTag pts={img.score} /></td>
            <td className="px-3 py-2 text-xs text-slate-400">{section?.fields?.[i]?.scorePoints ?? '-'}</td>
            {hasOps && <td className={`px-3 py-2 ${freezeL}`}>{section?.fields?.[i]?.hitReject ? <button className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">豁免</button> : null}</td>}
          </tr>
        ))}
      </SectionTable>
      )}
    </Panel>
  )
}

function RuleSetSection({ section, data, title, secId, totalScore, reportType }: { section?: SectionConfig; data: any[]; title: ReactNode; secId: string; totalScore: number; reportType: ReportType }) {
  const mode = section?.displayMode ?? 'list'
  const sc = section ? computeSectionScore(section) : null
  const cardMax = sc ? Math.abs(sc.total) : 0
  const hasOps = true // 所有区块都有操作列，豁免按钮由模板 fields[].hitReject 决定

  return (
    <Panel title={title} id={secId} actions={<DisplayModeToggle reportType={reportType} sectionId={secId} />}>
      <div className="mb-4 flex items-center gap-2">
        <span className={cn('text-3xl font-bold tabular-nums', totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{totalScore >= 0 ? '+' : '−'}{Math.abs(totalScore)}</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', totalScore >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>{totalScore >= 0 ? '达标加分' : '命中扣分'}</span>
      </div>
      <div className="mb-3 text-xs text-slate-500">本卡得分 · 集合权重 {section?.weight ?? 1} · 本卡满分 {cardMax}</div>
      {mode === 'card' ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((r: any, i: number) => {
            const conclBadge = r.conclusion === '通过' ? 'green' : r.conclusion === '拒绝' ? 'red' : 'amber'
            return (
              <div key={i} className="rounded-xl border border-slate-200 bg-white p-4">
                {/* 标题栏：名称 + 结论 + 得分 */}
                <div className="mb-2 flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">{r.name?.slice(0, 2)}</span>
                    <span className="truncate text-sm font-semibold text-ink-900">{r.name}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge kind={conclBadge}>{V(r.conclusion)}</Badge>
                    <ScoreTag pts={r.score} />
                  </div>
                </div>
                {/* 调用信息 */}
                <div className="mb-2 text-xs text-slate-400">{r.callStatus === 'success' ? '调用成功' : r.callStatus === 'fail' ? '调用失败' : '部分成功'} · {r.costMs}ms · {V(r.channel)}</div>
                {/* 关键字段 */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                  {(r.items ?? []).map((it: any, k: number) => (
                    <div key={k} className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">{it.label}</span>
                      <span className={cn('font-medium', it.status === 'pass' ? 'text-emerald-600' : it.status === 'fail' ? 'text-rose-600' : 'text-amber-600')}>{V(it.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
      <SectionTable head={['数据源', '结论', '得分', '调用状态', '耗时', '核验时间', '渠道', '关键字段', ...(hasOps ? ['操作'] : [])]}>
        {data.map((r: any, i: number) => (
          <tr key={i} className="border-b border-slate-100 align-top">
            <td className={`px-3 py-2 text-sm font-medium text-ink-900 ${freezeF}`}>{r.name}</td>
            <td className="px-3 py-2"><Badge kind={r.conclusion === '通过' ? 'green' : r.conclusion === '拒绝' ? 'red' : 'amber'}>{V(r.conclusion)}</Badge></td>
            <td className="px-3 py-2"><ScoreTag pts={r.score} /></td>
            <td className="px-3 py-2 text-sm text-slate-600">{r.callStatus === 'success' ? '成功' : r.callStatus}</td>
            <td className="px-3 py-2 text-sm text-slate-600">{r.costMs}ms</td>
            <td className="px-3 py-2 text-sm text-slate-600">{V(r.verifyTime)}</td>
            <td className="px-3 py-2 text-sm text-slate-600">{V(r.channel)}</td>
            <td className="px-3 py-2 text-xs text-slate-600">{(r.items ?? []).map((it: any) => `${it.label}:${V(it.value)}`).join(' ')}</td>
            {hasOps && <td className={`px-3 py-2 ${freezeL}`}>{section?.fields?.[i]?.hitReject ? <button className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">豁免</button> : <span className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">重新核验</span>}</td>}
          </tr>
        ))}
      </SectionTable>
      )}
    </Panel>
  )
}

/* ─── 模板复制（现有模板）区块：摘要卡 —— 显示 section 名称 + 得分 + 统计（总/有效/正常/异常），可展开成列表 ─── */
function TplCopySection({ section, data, title, secId, totalScore, reportType }: { section?: SectionConfig; data: any[]; title: ReactNode; secId: string; totalScore: number; reportType: ReportType }) {
  const [open, setOpen] = useState(false)
  const copys = section?.copySections ?? []
  // 统计口径（2026-08-07 修正）：全部来自样例 JSON 该段 items（总数/有效 = items 长度；正常/异常 = items 的 valid/conclusion）。
  // 模板 copySections 仅是展示骨架（哪些项可见），不是数据来源。
  const items = (data as any[]) ?? []
  const totalItems = items.length
  const validItems = items.length
  const normal = items.filter((i) => i.valid === true || i.conclusion === '通过').length
  const abnormal = items.length - normal

  return (
    <Panel title={title} id={secId} actions={<DisplayModeToggle reportType={reportType} sectionId={secId} />}>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-bold tabular-nums', totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{totalScore >= 0 ? '+' : '−'}{Math.abs(totalScore)}</span>
        </div>
        <span className="text-xs text-slate-500">共 {totalItems} 项 · 有效 {validItems} 项 · 正常 {normal} 项 · 异常 {abnormal} 项</span>
        <button onClick={() => setOpen((o) => !o)} className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">{open ? '收起 ▴' : '展开 ▾'}</button>
      </div>
      {open && (
        <div className="space-y-3">
          {copys.map((cs, i) => {
            const fields = (cs.fields ?? []).filter((f: any) => f.visible !== false)
            return (
              <div key={cs.id ?? i} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600">{cs.name}<span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{cs.sourceType === 'rule_set' ? '规则集' : cs.sourceType === 'data_source' ? '数据源' : '接口'}</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {fields.map((f: any, k: number) => {
                    // 该项实际得分：与总分同源（样例 JSON items 按 name 匹配），不再显示模板满分以免误导
                    const it = items.find((i) => i.name === f.name)
                    const pts = it && typeof it.score === 'number' ? it.score : null
                    return (
                      <span key={k} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">{f.name}<b className={`ml-1 ${pts == null ? 'text-slate-300' : pts >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{pts == null ? '—' : `${pts >= 0 ? '+' : ''}${pts}`}</b></span>
                    )
                  })}
                  {fields.length === 0 && <span className="text-[11px] text-slate-300">（无展示项）</span>}
                </div>
              </div>
            )
          })}
          {copys.length === 0 && <div className="text-xs text-slate-400">无集成维度</div>}
        </div>
      )}
    </Panel>
  )
}

/* ─── 主组件 ─── */
export function ReportModuleDetail({ cfg }: { cfg: ReportModuleCfg }) {
  const nav = useNavigate()
  const [params] = useSearchParams()
  // URL 进件号：决定本页展示哪份报告（列表「查看」跳转时携带）；缺省回落到样例 JSON
  const urlId = params.get('id') ?? undefined
  let tpl = useTemplate(cfg.templateId)
  if (!tpl) tpl = useTemplate(undefined, cfg.fallbackType)
  // 列表数据来自运行时磁盘读取（共享 store）；缺失回落打包 JSON。审核状态按 id 取该行
  const allRows = useReportRows(cfg.saveFile, cfg.listJson)
  const row = urlId ? (allRows as any[]).find((r) => r.id === urlId) : undefined
  // 样例数据：按该行得分匹配的分段（A/B/C）从样例池选取；无进件/处理中回落默认样例
  const rowScore = row ? scoreForVerifySys((row as any).sysResult ?? '', tpl?.scoreDisplay.grades ?? []) : null
  const segGrade = rowScore != null ? matchGrade(rowScore, tpl?.scoreDisplay.grades ?? [])?.grade : undefined
  const sampleData: any = (segGrade && cfg.detailSamples[segGrade]) || cfg.defaultSample
  const [scrollVisible, setScrollVisible] = useState(false)
  useEffect(() => { const f = () => setScrollVisible(window.scrollY > 400); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f) }, [])

  if (!tpl) return <div className="flex min-h-screen items-center justify-center text-slate-400">未找到模板（{cfg.templateId}）。</div>

  const secMap: Record<string, SectionConfig | undefined> = Object.fromEntries(tpl.sections.map((s) => [s.id, s]))
  const contentSecs = tpl.sections.filter((s) => (s.homeTab ?? 'content') === 'content' && s.visible)

  // 综合总分：与列表「得分」列共用同一算法（模板公式 + 样例数据），保证两边一致
  const { total: totalScore, scoreById } = computeReportTotal(tpl, sampleData)

  // 报告ID：URL 进件号优先（列表跳转传入），否则取样例 JSON 的 reportId
  const reportId = urlId ?? (sampleData.reportId as string)
  const computedAt = sampleData.computedAt as string

  // 标题：得分计算的第一个卡片 + 各内容分段
  const navCards: { id: string; label: ReactNode; tone: 'ok' | 'alert' | 'normal' }[] = [
    { id: 'score', label: <>{tpl.scoreBlock.title || '得分计算'}</>, tone: totalScore >= 0 ? 'ok' : 'alert' },
    ...contentSecs.map((s, idx) => ({ id: s.id, label: <>{s.name || '—'}</>, tone: 'ok' as const })),
    ...(tpl.showOpLog ? [{ id: 'oplogs', label: '操作日志', tone: 'normal' as const }] : []),
  ]

  // 业务流程状态流转由顶部 FlowBar（统一绑定层）接管，不再走旧的人工审核弹窗

  return (
    <div className="space-y-6 min-h-screen bg-slate-50">
      <DetailHeader title={`贷前审核 · ${cfg.title} · ${computedAt}`} subtitle={`进件号 ${reportId}${row ? ` · 申请人 ${row.name}` : ''}`} backLabel="返回列表" onBack={() => nav(cfg.listRoute)} />

      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1 space-y-4 p-5 lg:pl-5 lg:pr-0">
          {/* 统一流程操作条（与预警处置详情一致）：流程名 + 状态 + 当前可执行按钮，流转写回本行 JSON */}
          <FlowBar
            pageRoute={[cfg.listRoute, cfg.detailRoute]}
            row={(row ?? {}) as Record<string, unknown>}
            onStateChange={(next, at) => {
              if (!row) return
              updateReportRows(cfg.saveFile, (rs) => rs.map((x) => x.id === (row as any).id ? { ...x, flowState: next, flowStateAt: at } : x))
            }}
          />

          {/* 第一个卡片：评分卡 */}
          <Panel id="score" title={<>{tpl.scoreBlock.title || '得分计算'}</>} desc={<>规则版本 {tpl.version} · 报告ID {reportId}</>}>
            <ScoreVisual sd={tpl.scoreDisplay} rawScore={totalScore} />
            <div className="mt-2 text-xs text-slate-500">
              
            </div>

            {tpl.showSectionTotals && <div className="mt-4"><TemplateDimTable templateId={tpl.id} actualScores={scoreById} debug /></div>}

            {(tpl.specialRules ?? []).length > 0 && <div className="mt-4"><SectionTable head={['规则项', '触发条件', '对应审核结果', '优先级', '说明']}>{(tpl.specialRules ?? []).map(r => {
              // 规则项=模板配置；触发/结果/优先级/说明=用户实际触发（样例 json specialRules 按 ruleId 关联）
              const hit = ((sampleData as any).specialRules ?? []).find((h: any) => h.ruleId === r.id)
              const hitFlag = hit?.hit === true
              return (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2"><div className="text-sm font-medium text-ink-900">{r.ruleName}</div><div className="text-[11px] text-slate-400">{r.sectionName}</div></td>
                  <td className="px-3 py-2 text-sm text-slate-600">{hitFlag ? '命中' : '未触发'}</td>
                  <td className="px-3 py-2">{hitFlag ? <Badge kind={hit.autoResult === '拒绝' ? 'red' : hit.autoResult === '转人工' ? 'amber' : 'green'}>{hit.autoResult}</Badge> : <span className="text-sm text-slate-300">—</span>}</td>
                  <td className="px-3 py-2">{hitFlag ? <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${hit.priority === 'decisive' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>{hit.priority === 'decisive' ? '决定' : '预警'}</span> : <span className="text-sm text-slate-300">—</span>}</td>
                  <td className="px-3 py-2 text-sm text-slate-500">{hitFlag ? (hit.note ?? '—') : <span className="text-slate-300">—</span>}</td>
                </tr>
              )
            })}</SectionTable></div>}
          </Panel>

          {/* 各内容分段：按模板 sections 遍历，自动匹配 sourceType；数据从 dataBlocks 按 id 取（兼容旧结构顶层 key） */}
          {contentSecs.map((s, idx) => {
            const title = <>{s.name || `分段 ${idx + 1}`}</>
            const sid = scoreById[s.id] ?? 0
            const sd = sampleData as any
            const blk = (Array.isArray(sd.dataBlocks) ? sd.dataBlocks.find((b: any) => b.id === s.id) : undefined)
            const raw = blk?.groups ?? blk?.items ?? sd[s.id]
            // groups：模板配了 fieldGroups → 按组名取；未配（credit/fraud/decision 多数 data_source 段）→ 直接用 dataBlocks.groups
            const groups = (s.fieldGroups ?? []).length
              ? (s.fieldGroups ?? []).map((g: any) => ({
                  name: g.name,
                  rows: blk?.groups ? (blk.groups.find((x: any) => x.name === g.name)?.items ?? []) : (raw as any)?.[g.name] ?? [],
                }))
              : (Array.isArray(blk?.groups)
                  ? blk.groups.map((g: any) => ({ name: g.name, rows: g.items ?? [] }))
                  : (s.sourceType === 'data_source' ? ((raw as any)?.['基础资料'] ?? []) : []))
            const data = Array.isArray(raw) ? raw : []

            if (s.sourceType === 'data_source') {
              return <DataSourceSection key={s.id} section={s} data={{ groups }} title={title} secId={s.id} totalScore={sid} reportType={tpl.reportType} />
            }
            if (s.sourceType === 'api') {
              return <ApiSection key={s.id} section={s} data={data} title={title} secId={s.id} totalScore={sid} reportType={tpl.reportType} />
            }
            if (s.sourceType === 'tpl_copy') {
              return <TplCopySection key={s.id} section={s} data={data} title={title} secId={s.id} totalScore={sid} reportType={tpl.reportType} />
            }
            return <RuleSetSection key={s.id} section={s} data={data} title={title} secId={s.id} totalScore={sid} reportType={tpl.reportType} />
          })}

          {/* 操作日志 */}
          {tpl.showOpLog && <Panel id="oplogs" title="操作日志"><div className="space-y-2">{((sampleData as any).opLogs ?? (sampleData as any).op_logs ?? []).map((l: any, i: number) => <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm"><span className="mt-0.5 shrink-0 text-xs text-slate-400">{V(l.time)}</span><span className="mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{V(l.actor)}</span><span className="mt-0.5 font-medium text-ink-900">{V(l.action)}</span><span className="mt-0.5 text-slate-500">{V(l.detail)}</span></div>)}</div></Panel>}
        </div>

        {/* 右侧导航 */}
        <nav className="hidden w-44 shrink-0 lg:block"><div className="sticky top-32 flex flex-col gap-1 pr-5"><p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">页面导航</p>{navCards.map(c => { const cls = c.tone === 'alert' ? 'bg-rose-50 font-medium text-rose-600' : c.tone === 'ok' ? 'bg-emerald-50 font-medium text-emerald-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'; const dot = c.tone === 'alert' ? 'bg-rose-500' : c.tone === 'ok' ? 'bg-emerald-500' : ''; return <button key={c.id} onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${cls}`}>{dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}<span className={dot ? '' : 'pl-3.5'}>{c.label}</span></button> })}</div></nav>
      </div>

      {scrollVisible && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg" title="返回顶部"><svg className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" /></svg></button>}
    </div>
  )
}
