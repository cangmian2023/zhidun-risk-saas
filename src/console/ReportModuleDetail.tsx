/* ============================================================================
 * 报告模块通用详情页（N.2：按信息核验222 架构，一套组件跑四类模块）
 * 数据来源：模板配置(templateSeed.json) + 用户JSON（各模块自己的样例数据，本地保存）
 * 蓝标=模板配置 橙标=JSON数据 灰标=计算结果
 * ========================================================================== */
import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Badge, DetailHeader, Panel } from '../components/ui'
import { ApprovalModal } from './ApprovalModal'
import { ScoreVisual } from './ScoreVisual'
import { TemplateDimTable } from './TemplateDimTable'
import { useTemplate } from './templateStore'
import { DisplayModeToggle } from './DisplayModeToggle'
import { computeSectionScore, matchGrade, scoreForVerifySys, computeReportTotal, getAuditFlowByGrade, nextNodeByResult, type SectionConfig, type ReviewResult, type ReportType } from './reportTemplateData'
import type { ReportModuleCfg } from './ReportModule'
import { useReportRows, updateReportRows } from './reportListStore'

const cn = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')
const V = (v: any) => (v != null ? String(v) : 'null')

/* ─── 调试标签 ─── */
const tagS: React.CSSProperties = { display: 'inline-block', fontSize: 9, fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, marginLeft: 3, verticalAlign: 'middle', lineHeight: '14px', fontWeight: 400 }
const Tpl = ({ f, v }: { f: string; v?: any }) => <span style={{ ...tagS, background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD' }}>{f}={v ?? 'null'}</span>
const Dat = ({ f, v }: { f: string; v?: any }) => <span style={{ ...tagS, background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74' }}>{f}={v ?? 'null'}</span>
const Cal = ({ f, v }: { f: string; v?: any }) => <span style={{ ...tagS, background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB' }}>{f}={v ?? 'null'}</span>

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
        <Cal f={`得分汇总`} v={totalScore} />
      </div>
      <div className="mb-3 text-xs text-slate-500">本卡得分 · 集合权重 {section?.weight ?? 1} · 本卡满分 {cardMax}<Tpl f="section.weight" v={section?.weight ?? 1} /><Cal f="cardMax" v={cardMax} /></div>

      {mode === 'list' ? (
        <div className="space-y-4">
          {data.groups.map((g, gi) => (
            <div key={gi}>
              <div className="mb-2 text-xs font-medium text-slate-500">{g.name}<Tpl f={`fieldGroups[${gi}].name`} v={g.name} /></div>
              <SectionTable head={['字段', '内容', '校验', '得分', '总分', ...(hasOps ? ['操作'] : [])]}>
                {g.rows.map((r: any, ri: number) => (
                  <tr key={ri} className="border-b border-slate-100">
                    <td className={`px-3 py-2 text-sm text-slate-500 ${freezeF}`}>{r.field}<Tpl f={`fields[${ri}].name`} v={r.field} /></td>
                    <td className="px-3 py-2 text-sm font-medium text-ink-900">{V(r.value)}<Dat f={`JSON:value`} v={V(r.value)} /></td>
                    <td className="px-3 py-2">{r.valid ? <span className="text-[11px] text-emerald-500">✓ 正常</span> : <Badge kind="red">异常</Badge>}<Dat f="JSON:valid" v={r.valid} /></td>
                    <td className="px-3 py-2"><ScoreTag pts={r.score} /><Dat f="JSON:score" v={r.score} /></td>
                    <td className="px-3 py-2 text-xs text-slate-400">{section?.fields?.[ri]?.scorePoints ?? '-'}<Tpl f="scorePoints" v={section?.fields?.[ri]?.scorePoints} /></td>
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
              <div className="mb-2 text-xs font-medium text-slate-500">{g.name}<Tpl f={`fieldGroups[${gi}].name`} v={g.name} /></div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.rows.map((r: any, ri: number) => (
                  <div key={ri} className="rounded-xl border border-slate-200 bg-white p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-xs text-slate-500">{r.field}<Tpl f={`fields[${ri}].name`} v={r.field} /></span>
                      {r.valid ? <span className="text-[11px] text-emerald-500">✓</span> : <Badge kind="red">!</Badge>}
                    </div>
                    <div className="mt-1.5 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-ink-900">{V(r.value)}<Dat f="JSON:value" v={V(r.value)} /></span>
                      <ScoreTag pts={r.score} max={section?.fields?.[ri]?.scorePoints} /><Dat f="JSON:score" v={r.score} />
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
        <Cal f="得分汇总" v={totalScore} />
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
                  <span className="truncate text-xs font-semibold text-ink-900">{img.name}<Dat f="JSON:name" v={img.name} /></span>
                  {img.type === '视频' ? <Badge kind="blue">视频</Badge> : <Badge kind="gray">图片</Badge>}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">{V(img.value)}<Dat f="JSON:value" v={V(img.value)} /></span>
                  {img.valid ? <span className="text-[11px] text-emerald-500">✓</span> : <Badge kind="red">!</Badge>}
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <ScoreTag pts={img.score} max={section?.fields?.[i]?.scorePoints} /><Dat f="JSON:score" v={img.score} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
      <SectionTable head={['名称', '类型', '预览', '校验', '得分', '总分', ...(hasOps ? ['操作'] : [])]}>
        {data.map((img: any, i: number) => (
          <tr key={i} className="border-b border-slate-100 align-top">
            <td className={`px-3 py-2 text-sm font-medium text-ink-900 ${freezeF}`}>{img.name}<Dat f="JSON:name" v={img.name} /></td>
            <td className="px-3 py-2">{img.type === '视频' ? <Badge kind="blue">视频</Badge> : '图片'}<Dat f="JSON:type" v={img.type} /></td>
            <td className="px-3 py-2"><div className="grid h-10 w-14 place-items-center rounded bg-slate-100 text-[10px] text-slate-400">预览</div></td>
            <td className="px-3 py-2">{img.valid ? <span className="text-[11px] text-emerald-500">✓</span> : <Badge kind="red">!</Badge>}<Dat f="JSON:valid" v={img.valid} /></td>
            <td className="px-3 py-2"><ScoreTag pts={img.score} /><Dat f="JSON:score" v={img.score} /></td>
            <td className="px-3 py-2 text-xs text-slate-400">{section?.fields?.[i]?.scorePoints ?? '-'}<Tpl f="scorePoints" v={section?.fields?.[i]?.scorePoints} /></td>
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
        <Cal f="得分汇总" v={totalScore} />
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
                    <span className="truncate text-sm font-semibold text-ink-900">{r.name}<Dat f="JSON:name" v={r.name} /></span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <Badge kind={conclBadge}>{V(r.conclusion)}<Dat f="JSON:conclusion" v={r.conclusion} /></Badge>
                    <ScoreTag pts={r.score} /><Dat f="JSON:score" v={r.score} />
                  </div>
                </div>
                {/* 调用信息 */}
                <div className="mb-2 text-xs text-slate-400">{r.callStatus === 'success' ? '调用成功' : r.callStatus === 'fail' ? '调用失败' : '部分成功'}<Dat f="JSON:callStatus" v={r.callStatus} /> · {r.costMs}ms<Dat f="JSON:costMs" v={r.costMs} /> · {V(r.channel)}<Dat f="JSON:channel" v={r.channel} /></div>
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
            <td className={`px-3 py-2 text-sm font-medium text-ink-900 ${freezeF}`}>{r.name}<Dat f="JSON:name" v={r.name} /></td>
            <td className="px-3 py-2"><Badge kind={r.conclusion === '通过' ? 'green' : r.conclusion === '拒绝' ? 'red' : 'amber'}>{V(r.conclusion)}<Dat f="JSON:conclusion" v={r.conclusion} /></Badge></td>
            <td className="px-3 py-2"><ScoreTag pts={r.score} /><Dat f="JSON:score" v={r.score} /></td>
            <td className="px-3 py-2 text-sm text-slate-600">{r.callStatus === 'success' ? '成功' : r.callStatus}<Dat f="JSON:callStatus" v={r.callStatus} /></td>
            <td className="px-3 py-2 text-sm text-slate-600">{r.costMs}ms<Dat f="JSON:costMs" v={r.costMs} /></td>
            <td className="px-3 py-2 text-sm text-slate-600">{V(r.verifyTime)}<Dat f="JSON:verifyTime" v={r.verifyTime} /></td>
            <td className="px-3 py-2 text-sm text-slate-600">{V(r.channel)}<Dat f="JSON:channel" v={r.channel} /></td>
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
  // 统计口径：总数/有效 = 模板 copySections 的字段（可见即有效）；正常/异常 = 样例数据该段 items 的 valid/conclusion
  const totalItems = copys.reduce((a, cs) => a + (cs.fields ?? []).length, 0)
  const validItems = copys.reduce((a, cs) => a + (cs.fields ?? []).filter((f) => f.visible !== false).length, 0)
  const items = (data as any[]) ?? []
  const normal = items.filter((i) => i.valid === true || i.conclusion === '通过').length
  const abnormal = items.length - normal

  return (
    <Panel title={title} id={secId} actions={<DisplayModeToggle reportType={reportType} sectionId={secId} />}>
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          <span className={cn('text-2xl font-bold tabular-nums', totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{totalScore >= 0 ? '+' : '−'}{Math.abs(totalScore)}</span>
          <Cal f="得分汇总" v={totalScore} />
        </div>
        <span className="text-xs text-slate-500">共 {totalItems} 项 · 有效 {validItems} 项 · 正常 {normal} 项 · 异常 {abnormal} 项<Cal f="模板fields/样例valid" v={`${totalItems}/${validItems}/${normal}/${abnormal}`} /></span>
        <button onClick={() => setOpen((o) => !o)} className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600">{open ? '收起 ▴' : '展开 ▾'}</button>
      </div>
      {open && (
        <div className="space-y-3">
          {copys.map((cs, i) => {
            const fields = (cs.fields ?? []).filter((f: any) => f.visible !== false)
            return (
              <div key={cs.id ?? i} className="rounded-xl border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-medium text-slate-600">{cs.name}<Tpl f={`copySections[${i}].name`} v={cs.name} /><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">{cs.sourceType === 'rule_set' ? '规则集' : cs.sourceType === 'data_source' ? '数据源' : '接口'}</span></div>
                <div className="flex flex-wrap gap-1.5">
                  {fields.map((f: any, k: number) => (
                    <span key={k} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">{f.name}<b className="ml-1 text-slate-400">{f.scorePoints ?? 0}分</b><Tpl f={`fields[${k}].name`} v={f.name} /></span>
                  ))}
                  {fields.length === 0 && <span className="text-[11px] text-slate-300">（无展示项）</span>}
                </div>
              </div>
            )
          })}
          {copys.length === 0 && <div className="text-xs text-slate-400">无集成维度<Tpl f="copySections" v="[]" /></div>}
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
    { id: 'score', label: <>{tpl.scoreBlock.title || '得分计算'}<Tpl f="scoreBlock.title" v={tpl.scoreBlock.title} /></>, tone: totalScore >= 0 ? 'ok' : 'alert' },
    ...contentSecs.map((s, idx) => ({ id: s.id, label: <>{s.name || '—'}<Tpl f={`sections[${idx}].name`} v={s.name} /></>, tone: 'ok' as const })),
    ...(tpl.showOpLog ? [{ id: 'oplogs', label: '操作日志', tone: 'normal' as const }] : []),
  ]

  // 处理中（计算中）：没有得分 → 自动审核无结果状态、人工审核为空、无业务流程按钮
  const isPending = (row as any)?.sysResult === '处理中'
  // 命中分段（A/B/C）+ 业务按钮：按钮来自模板 businessFlow 对应分段的 flowGraphs，标签取 start 节点 buttonName
  const grade = isPending ? undefined : tpl.scoreDisplay.grades.find((g) => totalScore >= g.minScore && totalScore <= g.maxScore)
  const bizButtons = isPending ? [] : (tpl.businessFlow ?? []).filter(bf => bf.gradeId === grade?.grade).flatMap(bf => bf.flowGraphs ?? [])
  // 3.2 状态枚举类来自模板人工审核配置（斜杠分割）；无业务流程时人工审核继承自动审核结果
  const statusEnum: string[] = tpl.flowBlock?.statusEnum?.length ? tpl.flowBlock.statusEnum : ['待人工', '通过', '拒绝', '驳回']

  // 3.2 人工审核初始状态：用户数据（json workStatus）优先；无业务流程 → 继承自动审核结果；有流程未操作 → 枚举[0]
  const [workStatus, setWorkStatus] = useState<string>(() =>
    (row as any)?.workStatus ?? (bizButtons.length ? statusEnum[0] : (grade?.autoResult ?? statusEnum[0])),
  )
  // 3.3 流程步进（条件边驱动）：activeFlow=当前操作的流程下标；flowNodeId=当前待审节点 id（null=未开始/已结束）；flowDone=是否已走完
  const [activeFlow, setActiveFlow] = useState<number | null>(null)
  // 流程进度从持久化恢复：flowNodeId=当前待审节点（刷新后按钮显示正确节点）；flowDone=是否已走完
  const [flowNodeId, setFlowNodeId] = useState<string | null>((row as any)?.flowNodeId ?? null)
  const [flowDone, setFlowDone] = useState<boolean>((row as any)?.flowDone === true)
  // 从磁盘恢复的审核进度（flowNodeId/flowDone/workStatus）同步到本地状态：列表或详情刷新后能恢复审批进度
  useEffect(() => {
    if (!row) return
    setWorkStatus((row as any)?.workStatus ?? (bizButtons.length ? statusEnum[0] : (grade?.autoResult ?? statusEnum[0])))
    setFlowNodeId((row as any)?.flowNodeId ?? null)
    setFlowDone((row as any)?.flowDone === true)
  }, [row])
  // 3.6 审核人轨迹（已完成节点名 + 操作人）；初始来自用户数据（json operator）
  const [auditTrail, setAuditTrail] = useState<{ node: string; operator: string }[]>([])
  // 3.5 本次会话的人工审核操作日志（追加在报告末尾操作日志区）
  const [runtimeLogs, setRuntimeLogs] = useState<{ time: string; actor: string; action: string; detail: string }[]>([])
  // 审批弹窗：当前激活流程的「当前待审批节点」（按 flowNodeId 沿边走定位）
  const [auditIdx, setAuditIdx] = useState<number | null>(null)
  // curGraph 以「流程激活」（activeFlow）为准：弹窗关闭后仍能按当前节点继续渲染按钮/找下一节点；
  // curFlow 以弹窗 index（auditIdx）为准，两者在点按钮时同步赋值。
  const curFlow = auditIdx != null ? bizButtons[auditIdx] : undefined
  const curGraph = activeFlow != null ? bizButtons[activeFlow] : undefined
  const curNode = curGraph && flowNodeId ? curGraph.nodes.find((n: any) => n.id === flowNodeId) : undefined
  const auditFlow = auditIdx != null && grade && curGraph ? getAuditFlowByGrade(tpl, grade.grade, auditIdx, 0, flowNodeId ?? undefined) : null
  const applyAudit = (p: { result: ReviewResult; checks: string[]; opinionText: string; fileName: string }) => {
    if (!curGraph) return
    const node = curNode ?? curGraph.nodes.find((n: any) => n.type === 'start')
    if (!node) return
    const af = getAuditFlowByGrade(tpl, grade?.grade ?? '', auditIdx ?? 0, 0, node.id)
    // 状态 = 模板决策节点 resultStates（结果→状态）；未配置用默认兜底
    const fallback: Record<string, string> = { 通过: '已确认', 转人工: '待审核', 拒绝: '复核拒绝' }
    const next = af.resultStates?.[p.result] ?? fallback[p.result]
    if (next) setWorkStatus(next)
    // 3.6 审核人：模板节点名 + 操作人用户名（角色 → 演示用户名映射，与 json 用户数据格式「节点名：用户名」一致）
    const roleToUser: Record<string, string> = { 初审员: '张三', 复审员: '李四', 风控主管: '王五', 风控经理: '赵六', 风控总监: '管理员' }
    const op = (node?.role && roleToUser[node.role]) || '管理员'
    const trailNode = node?.buttonName ?? node?.label ?? '审批'
    setAuditTrail((t) => [...t, { node: trailNode, operator: op }])
    // 3.5 操作日志：自动追加
    setRuntimeLogs((l) => [...l, {
      time: new Date().toLocaleString('zh-CN', { hour12: false }),
      actor: op,
      action: '人工审核',
      detail: `${trailNode}：${p.result}${p.opinionText ? `｜意见：${p.opinionText}` : ''}`,
    }])
    // 持久化：把该行人工审核状态/审核人/流程进度写回本地 JSON（与列表页同一保存接口），刷新不丢
    const fullOp = [(row as any)?.operator, ...auditTrail.map((t) => `${t.node}：${t.operator}`), `${trailNode}：${op}`].filter(Boolean).join('；')
    // 沿边步进：按审批结果选下一条边（匹配 result===审批结果 的条件边，否则无条件兜底）
    // 注意：end 节点可能残留 results 默认值，不能当作「还有审批内容」的中间态 → type==='end' 一律算流程结束
    const nextNode = nextNodeByResult(curGraph, node.id, p.result)
    const hasNext = !!(nextNode && nextNode.results?.length && nextNode.type !== 'end')
    try {
      const updated = (allRows as any[]).map((r) => r.id === reportId ? {
        ...r,
        workStatus: next ?? (row as any)?.workStatus ?? null,
        operator: fullOp,
        flowNodeId: hasNext ? nextNode.id : undefined,
        flowDone: hasNext ? undefined : true,
      } : r)
      // 落盘：经共享 store 写回本地 JSON（与列表页同一缓存，跨页一致），刷新不丢
      updateReportRows(cfg.saveFile, () => updated)
    } catch { /* 持久化失败不影响交互 */ }
    // 沿边步进：按审批结果选下一条边（匹配 result===审批结果 的条件边，否则无条件兜底）
    if (hasNext) {
      setFlowNodeId(nextNode.id) // 继续到下一审核节点
    } else {
      setFlowNodeId(null); setFlowDone(true) // 到达结束/无后继：流程结束
    }
    setAuditIdx(null)
  }
  // 审核人字段（3.6）：json 初始 + 已完成节点轨迹拼接，如「提交复审：张三；复审确认：管理员」
  const operatorText = [
    (row as any)?.operator && auditTrail.length ? (row as any).operator : ((row as any)?.operator ?? ''),
    ...auditTrail.map((t) => `${t.node}：${t.operator}`),
  ].filter(Boolean).join('；') || '—'
  // 按钮渲染（3.3/3.4）：未激活=入口/恢复当前节点按钮；激活中=当前待审批节点按钮；流程完成=按 end.showButton 决定是否显示「已办结」
  // 流程进度来自持久化（flowNodeId/flowDone）：走一半刷新后仍显示当前节点按钮，走完显示已办结（按配置隐藏）
  const flowButton = (fi: number): { label: string; done: boolean; hidden: boolean } => {
    const fg = bizButtons[fi]
    const start = fg?.nodes.find((n: any) => n.type === 'start')
    const end = fg?.nodes.find((n: any) => n.type === 'end')
    if (activeFlow !== fi) {
      if (flowDone) return { label: '已办结', done: true, hidden: end?.showButton === false }
      if (flowNodeId) {
        const n = fg?.nodes.find((x: any) => x.id === flowNodeId)
        // 防御：flowNodeId 若落在 end 节点（旧数据残留），视为已办结
        if (n && n.type !== 'end') return { label: n?.buttonName ?? n?.label ?? start?.buttonName ?? '操作', done: false, hidden: false }
        if (n) return { label: '已办结', done: true, hidden: end?.showButton === false }
      }
      return { label: start?.buttonName ?? fg?.name ?? '操作', done: false, hidden: false }
    }
    if (flowDone || !flowNodeId) {
      // 流程完成：3.4 结束节点 showButton 控制是否继续显示
      return { label: '已办结', done: true, hidden: end?.showButton === false }
    }
    const node = curNode ?? start
    return { label: node?.buttonName ?? start?.buttonName ?? fg?.name ?? '操作', done: false, hidden: false }
  }
  const WORK_KIND: Record<string, 'gray' | 'blue' | 'green' | 'amber' | 'red' | 'violet'> = {
    核验计算中: 'gray', 待确认: 'blue', 已确认: 'green', 待审核: 'amber',
    提交复核: 'amber', '复核通过': 'green', '复核拒绝': 'red', 强制放行: 'violet',
    待人工: 'blue', 通过: 'green', 拒绝: 'red', 驳回: 'amber', 待复核: 'amber',
    加入黑名单: 'red', 复核中: 'amber', 退回: 'amber',
  }

  return (
    <div className="space-y-6 min-h-screen bg-slate-50">
      <DetailHeader title={`贷前审核 · ${cfg.title} · ${computedAt}`} subtitle={`进件号 ${reportId}${row ? ` · 申请人 ${row.name}` : ''}`} backLabel="返回列表" onBack={() => nav(cfg.listRoute)} />

      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1 space-y-4 p-5 lg:pl-5 lg:pr-0">
          {/* 第一个卡片：评分卡 */}
          <Panel id="score" title={<>{tpl.scoreBlock.title || '得分计算'}<Tpl f="scoreBlock.title" v={tpl.scoreBlock.title} /></>} desc={<>规则版本 {tpl.version}<Tpl f="version" v={tpl.version} /> · 报告ID {reportId}<Dat f={urlId ? 'URL:id' : 'JSON:reportId'} v={reportId} /></>}>
            <ScoreVisual sd={tpl.scoreDisplay} rawScore={totalScore} />
            <div className="mt-2 text-xs text-slate-500">
              <Cal f="evaluateFormula(tpl.scoreFormula)" v={totalScore} />
              <Tpl f="scoreFormula" v={tpl.scoreFormula ? (tpl.scoreFormula.terms.map(t => `${t.op}${t.varId}×${t.factor}`).join(' ')) : 'null'} />
            </div>

            {tpl.showSectionTotals && <div className="mt-4"><TemplateDimTable templateId={tpl.id} actualScores={scoreById} debug /></div>}

            {(tpl.specialRules ?? []).length > 0 && <div className="mt-4"><SectionTable head={['规则项', '触发条件', '对应审核结果', '优先级', '说明']}>{(tpl.specialRules ?? []).map(r => {
              // 规则项=模板配置；触发/结果/优先级/说明=用户实际触发（样例 json specialRules 按 ruleId 关联）
              const hit = ((sampleData as any).specialRules ?? []).find((h: any) => h.ruleId === r.id)
              const hitFlag = hit?.hit === true
              return (
                <tr key={r.id} className="border-b border-slate-100">
                  <td className="px-3 py-2"><div className="text-sm font-medium text-ink-900">{r.ruleName}<Tpl f="specialRules.ruleName" v={r.ruleName} /></div><div className="text-[11px] text-slate-400">{r.sectionName}<Tpl f="sectionName" v={r.sectionName} /></div></td>
                  <td className="px-3 py-2 text-sm text-slate-600">{hitFlag ? '命中' : '未触发'}<Dat f="JSON:specialRules.hit" v={hit?.hit ?? false} /></td>
                  <td className="px-3 py-2">{hitFlag ? <Badge kind={hit.autoResult === '拒绝' ? 'red' : hit.autoResult === '转人工' ? 'amber' : 'green'}>{hit.autoResult}</Badge> : <span className="text-sm text-slate-300">—</span>}<Dat f="JSON:autoResult" v={hitFlag ? hit.autoResult : '—'} /></td>
                  <td className="px-3 py-2">{hitFlag ? <span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${hit.priority === 'decisive' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>{hit.priority === 'decisive' ? '决定' : '预警'}</span> : <span className="text-sm text-slate-300">—</span>}<Dat f="JSON:priority" v={hitFlag ? hit.priority : '—'} /></td>
                  <td className="px-3 py-2 text-sm text-slate-500">{hitFlag ? (hit.note ?? '—') : <span className="text-slate-300">—</span>}<Dat f="JSON:note" v={hitFlag ? hit.note : '—'} /></td>
                </tr>
              )
            })}</SectionTable></div>}
          </Panel>

          {/* 结论与终审 */}
          <div id="conclusion" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="mb-3 text-base font-semibold text-ink-900">{tpl.flowBlock?.title || '结论与终审'}<Tpl f="flowBlock.title" v={tpl.flowBlock?.title} /></div>
            <div className="space-y-1.5 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <span>自动审核：</span>
                {isPending
                  ? <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">处理中</span>
                  : <Badge kind={grade?.autoResult === '拒绝' ? 'red' : grade?.autoResult === '转人工' ? 'amber' : 'green'}>{grade?.autoResult ?? '—'}</Badge>}
                <Tpl f="scoreDisplay.grades" v={tpl.scoreDisplay.grades.map(g => `${g.grade}:${g.minScore}~${g.maxScore}`).join(' ')} />
              </div>
              <div className="flex items-center gap-2">
                <span>人工审核：</span>
                {isPending
                  ? <span className="text-xs text-slate-300">—</span>
                  : <><Badge kind={WORK_KIND[workStatus] ?? 'blue'}>{workStatus}</Badge>
                    <span className="text-xs text-slate-400">操作人员 {operatorText}</span>
                    <Tpl f="flowBlock.statusEnum" v={tpl.flowBlock?.statusEnum?.join(' / ') ?? '—'} /></>}
              </div>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {bizButtons.length === 0 && <span className="text-xs text-slate-400">无业务流程按钮<Tpl f="businessFlow" v={`${tpl.businessFlow?.length ?? 0}条`} /><Tpl f="grades" v={`${tpl.scoreDisplay.grades.map(g=>g.grade).join(',')}`} /></span>}
              {bizButtons.map((fg, fi) => {
                const b = flowButton(fi)
                if (b.hidden) return null
                return (
                  <button key={fi} disabled={b.done}
                    onClick={() => { const st = fg.nodes.find((n: any) => n.type === 'start'); setActiveFlow(fi); setAuditIdx(fi); setFlowDone(false); setFlowNodeId((prev) => (activeFlow === fi && prev) ? prev : (st?.id ?? null)) }}
                    className={`rounded-lg border px-4 py-2 text-sm ${b.done ? 'cursor-not-allowed border-slate-200 text-slate-300' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                    {b.label}
                    <Tpl f="businessFlow.flowGraphs" v={fg.name} />
                  </button>
                )
              })}
            </div>
          </div>

          {auditFlow && (
            <ApprovalModal
              open={auditIdx !== null}
              title={`审批决策 · ${curFlow?.nodes.find((n: any) => n.type === 'start')?.buttonName ?? curFlow?.name ?? '审批'}`}
              conclusion={`案件结论：自动审核 ${grade?.autoResult ?? '—'}（${workStatus}）`}
              auditFlow={auditFlow}
              onClose={() => setAuditIdx(null)}
              onConfirm={applyAudit}
            />
          )}

          {/* 各内容分段：按模板 sections 遍历，自动匹配 sourceType；数据从 dataBlocks 按 id 取（兼容旧结构顶层 key） */}
          {contentSecs.map((s, idx) => {
            const title = <>{s.name || `分段 ${idx + 1}`}<Tpl f={`sections[${idx}].name`} v={s.name} /></>
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
          {tpl.showOpLog && <Panel id="oplogs" title="操作日志"><Tpl f="showOpLog" v={tpl.showOpLog} /><div className="space-y-2">{[...((sampleData as any).opLogs ?? (sampleData as any).op_logs ?? []), ...runtimeLogs].map((l: any, i: number) => <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm"><span className="mt-0.5 shrink-0 text-xs text-slate-400">{V(l.time)}</span><span className="mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{V(l.actor)}</span><span className="mt-0.5 font-medium text-ink-900">{V(l.action)}</span><span className="mt-0.5 text-slate-500">{V(l.detail)}</span>{i >= ((sampleData as any).opLogs ?? (sampleData as any).op_logs ?? []).length && <Dat f="本次操作" v="实时记录" />}</div>)}</div></Panel>}
        </div>

        {/* 右侧导航 */}
        <nav className="hidden w-44 shrink-0 lg:block"><div className="sticky top-32 flex flex-col gap-1 pr-5"><p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">页面导航<Tpl f="从页面卡片提取" v={navCards.length + '项'} /></p>{navCards.map(c => { const cls = c.tone === 'alert' ? 'bg-rose-50 font-medium text-rose-600' : c.tone === 'ok' ? 'bg-emerald-50 font-medium text-emerald-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'; const dot = c.tone === 'alert' ? 'bg-rose-500' : c.tone === 'ok' ? 'bg-emerald-500' : ''; return <button key={c.id} onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${cls}`}>{dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}<span className={dot ? '' : 'pl-3.5'}>{c.label}</span></button> })}</div></nav>
      </div>

      {scrollVisible && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg" title="返回顶部"><svg className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" /></svg></button>}
    </div>
  )
}
