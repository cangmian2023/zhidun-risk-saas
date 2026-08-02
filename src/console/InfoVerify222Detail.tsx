/* ============================================================================
 * 信息核验222 报告详情页
 * 数据来源：模板配置(templateSeed.json) + 用户JSON(infoVerify222Sample.json)
 * 蓝标=模板配置 橙标=JSON数据 灰标=计算结果
 * ========================================================================== */
import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Badge, DetailHeader, Panel } from '../components/ui'
import { ScoreVisual } from './ScoreVisual'
import { TemplateDimTable } from './TemplateDimTable'
import { useTemplate } from './templateStore'
import { DisplayModeToggle } from './DisplayModeToggle'
import { evaluateFormula, computeSectionScore, buildDefaultScoreFormula, fieldGridClass, type SectionConfig } from './reportTemplateData'
import sample from './infoVerify222Sample.json'

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

function ScoreTag({ pts, max, deduct }: { pts?: number; max?: number; deduct?: boolean }) {
  if (pts == null || pts === 0) return null
  const minus = pts < 0
  return <span className={cn('ml-1.5 inline-flex shrink-0 items-center rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums', minus ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200' : 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200')}>{minus ? '−' : '+'}{Math.abs(pts)}分{max != null && max !== Math.abs(pts) ? <span className="ml-0.5 text-[9px] opacity-60">/{max}</span> : null}</span>
}

/* ─── 冻结列工具：第一列 sticky left，最后一列 sticky right ─── */
const freezeF = 'sticky left-0 z-10 bg-white group-hover:bg-slate-50/60'
const freezeL = 'sticky right-0 z-10 bg-white group-hover:bg-slate-50/60'
function sumScores(items: any[]): number { return items.reduce((a, x) => a + (typeof x.score === 'number' ? x.score : 0), 0) }

/* ─── 标准化区块渲染（汇总分由外部传入，内部不再重算） ─── */
function DataSourceSection({ section, data, title, secId, totalScore }: { section?: SectionConfig; data: { groups: { name: string; rows: any[] }[] }; title: ReactNode; secId: string; totalScore: number }) {
  const mode = section?.displayMode ?? 'list'
  const sc = section ? computeSectionScore(section) : null
  const cardMax = sc ? Math.abs(sc.total) : 0
  const hasOps = true // 所有区块都有操作列，豁免按钮由模板 fields[].hitReject 决定

  return (
    <Panel title={title} id={secId} actions={<DisplayModeToggle reportType="info_verify" sectionId={secId} />}>
      {/* 总得分 */}
      <div className="mb-4 flex items-center gap-2">
        <span className={cn('text-3xl font-bold tabular-nums', totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{totalScore >= 0 ? '+' : '−'}{Math.abs(totalScore)}</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', totalScore >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>{totalScore >= 0 ? '达标加分' : '命中扣分'}</span>
        <Cal f={`得分汇总`} v={totalScore} />
      </div>
      <div className="mb-3 text-xs text-slate-500">本卡得分 · 集合权重 {section?.weight ?? 1} · 本卡满分 {cardMax}<Tpl f="section.weight" v={section?.weight ?? 1} /><Tpl f="cardMax" v={cardMax} /></div>

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
              <div className={fieldGridClass('card')}>
                {g.rows.map((r: any, ri: number) => (
                  <div key={ri} className="flex items-center justify-between rounded-lg border border-slate-100 px-3.5 py-2.5">
                    <span className="text-sm text-slate-500">{r.field}</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-ink-900">{V(r.value)}</span>
                      {r.valid ? <span className="text-[10px] text-slate-300">✓</span> : <Badge kind="red">!</Badge>}
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

function ApiSection({ section, data, title, secId, totalScore }: { section?: SectionConfig; data: any[]; title: ReactNode; secId: string; totalScore: number }) {
  const mode = section?.displayMode ?? 'list'
  const sc = section ? computeSectionScore(section) : null
  const cardMax = sc ? Math.abs(sc.total) : 0
  const hasOps = true // 所有区块都有操作列，豁免按钮由模板 fields[].hitReject 决定

  return (
    <Panel title={title} id={secId} actions={<DisplayModeToggle reportType="info_verify" sectionId={secId} />}>
      <div className="mb-4 flex items-center gap-2">
        <span className={cn('text-3xl font-bold tabular-nums', totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{totalScore >= 0 ? '+' : '−'}{Math.abs(totalScore)}</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', totalScore >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>{totalScore >= 0 ? '达标加分' : '命中扣分'}</span>
        <Cal f="得分汇总" v={totalScore} />
      </div>
      <div className="mb-3 text-xs text-slate-500">本卡得分 · 集合权重 {section?.weight ?? 1} · 本卡满分 {cardMax}</div>
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
    </Panel>
  )
}

function RuleSetSection({ section, data, title, secId, totalScore }: { section?: SectionConfig; data: any[]; title: ReactNode; secId: string; totalScore: number }) {
  const mode = section?.displayMode ?? 'list'
  const sc = section ? computeSectionScore(section) : null
  const cardMax = sc ? Math.abs(sc.total) : 0
  const hasOps = true // 所有区块都有操作列，豁免按钮由模板 fields[].hitReject 决定

  return (
    <Panel title={title} id={secId} actions={<DisplayModeToggle reportType="info_verify" sectionId={secId} />}>
      <div className="mb-4 flex items-center gap-2">
        <span className={cn('text-3xl font-bold tabular-nums', totalScore >= 0 ? 'text-emerald-600' : 'text-rose-600')}>{totalScore >= 0 ? '+' : '−'}{Math.abs(totalScore)}</span>
        <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', totalScore >= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700')}>{totalScore >= 0 ? '达标加分' : '命中扣分'}</span>
        <Cal f="得分汇总" v={totalScore} />
      </div>
      <div className="mb-3 text-xs text-slate-500">本卡得分 · 集合权重 {section?.weight ?? 1} · 本卡满分 {cardMax}</div>
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
    </Panel>
  )
}

/* ─── 主组件 ─── */
export default function InfoVerify222Detail() {
  const nav = useNavigate()
  let tpl = useTemplate('tpl-info-backup222')
  if (!tpl) tpl = useTemplate(undefined, 'info_verify')
  const [scrollVisible, setScrollVisible] = useState(false)
  useEffect(() => { const f = () => setScrollVisible(window.scrollY > 400); window.addEventListener('scroll', f, { passive: true }); return () => window.removeEventListener('scroll', f) }, [])

  if (!tpl) return <div className="flex min-h-screen items-center justify-center text-slate-400">未找到信息核验模板。</div>

  const secMap: Record<string, SectionConfig | undefined> = Object.fromEntries(tpl.sections.map((s) => [s.id, s]))
  const contentSecs = tpl.sections.filter((s) => (s.homeTab ?? 'content') === 'content' && s.visible)

  // 各分段实际得分 — 按 section.id 遍历 contentSecs 计算
  const scoreById: Record<string, number> = {}
  for (const s of contentSecs) {
    const raw = (sample as any)[s.id]
    if (!raw) { scoreById[s.id] = 0; continue }
    if (s.sourceType === 'data_source' && (s.fieldGroups?.length ?? 0) > 0) {
      scoreById[s.id] = (s.fieldGroups ?? []).reduce((a: number, g: any) => a + sumScores(raw[g.name] ?? []), 0)
    } else if (Array.isArray(raw)) {
      scoreById[s.id] = sumScores(raw)
    } else {
      scoreById[s.id] = 0
    }
  }

  // 用模板公式计算总分
  const formula = tpl.scoreFormula ?? buildDefaultScoreFormula(tpl.sections)
  const sectionValues: Record<string, number> = {}
  for (const s of contentSecs) {
    sectionValues['sec_' + s.id] = scoreById[s.id] ?? 0
  }
  // 补充非 content 的分段默认值
  for (const t of formula.terms) {
    if (t.varId && !(t.varId in sectionValues)) sectionValues[t.varId] = 0
  }
  const totalScore = evaluateFormula(formula, sectionValues) ?? (basicScore + imgScore + singleScore + crossScore)

  const reportId = sample.reportId as string
  const computedAt = sample.computedAt as string

  // 标题：得分计算的第一个卡片 + 各内容分段
  const navCards: { id: string; label: ReactNode; tone: 'ok' | 'alert' | 'normal' }[] = [
    { id: 'score', label: <>{tpl.scoreBlock.title || '得分计算'}<Tpl f="scoreBlock.title" v={tpl.scoreBlock.title} /></>, tone: totalScore >= 0 ? 'ok' : 'alert' },
    ...contentSecs.map((s) => ({ id: s.id, label: <>{s.name || '—'}<Tpl f={`sections.${s.id}.name`} v={s.name} /></>, tone: 'ok' as const })),
    ...(tpl.showOpLog ? [{ id: 'oplogs', label: '操作日志', tone: 'normal' as const }] : []),
  ]

  // 业务按钮
  const bizButtons = (() => {
    const grade = tpl.scoreDisplay.grades.find((g) => totalScore >= g.minScore && totalScore <= g.maxScore)
    if (!grade) return []
    return (tpl.businessFlow ?? []).filter(bf => bf.gradeId === grade.grade).flatMap(bf => bf.flowGraphs ?? [])
  })()

  return (
    <div className="space-y-6 min-h-screen bg-slate-50">
      <DetailHeader title={`贷前审核 · 信息核验222 · ${computedAt}`} subtitle={`进件号 ${reportId}`} backLabel="返回列表" onBack={() => nav('/console/cr/pre-verify-222')} />

      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1 space-y-4 p-5 lg:pl-5 lg:pr-0">
          {/* 第一个卡片：评分卡 */}
          <Panel id="score" title={<>{tpl.scoreBlock.title || '得分计算'}<Tpl f="scoreBlock.title" v={tpl.scoreBlock.title} /></>} desc={<>规则版本 {tpl.version}<Tpl f="version" v={tpl.version} /> · 报告ID {reportId}<Dat f="sample.reportId" v={reportId} /></>}>
            <ScoreVisual sd={tpl.scoreDisplay} rawScore={totalScore} />
            <div className="mt-2 text-xs text-slate-500">
              <Cal f="evaluateFormula(tpl.scoreFormula)" v={totalScore} />
              <Tpl f="scoreFormula" v={tpl.scoreFormula ? (tpl.scoreFormula.terms.map(t => `${t.op}${t.varId}×${t.factor}`).join(' ')) : 'null'} />
            </div>

            {tpl.showSectionTotals && <div className="mt-4"><TemplateDimTable templateId={tpl.id} actualScores={scoreById} debug /></div>}

            {(tpl.specialRules ?? []).length > 0 && <div className="mt-4"><SectionTable head={['规则项', '触发条件', '对应审核结果', '优先级', '说明']}>{(tpl.specialRules ?? []).map(r => (
              <tr key={r.id} className="border-b border-slate-100"><td className="px-3 py-2"><div className="text-sm font-medium text-ink-900">{r.ruleName}<Tpl f="specialRules.ruleName" v={r.ruleName} /></div><div className="text-[11px] text-slate-400">{r.sectionName}</div></td><td className="px-3 py-2 text-sm text-slate-600">{r.trigger === 'hit' ? '命中' : '未命中'}<Tpl f="trigger" v={r.trigger} /></td><td className="px-3 py-2"><Badge kind={r.autoResult === '拒绝' ? 'red' : r.autoResult === '转人工' ? 'amber' : 'green'}>{r.autoResult}<Tpl f="autoResult" v={r.autoResult} /></Badge></td><td className="px-3 py-2"><span className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${r.priority === 'decisive' ? 'bg-orange-100 text-orange-700' : 'bg-amber-100 text-amber-700'}`}>{r.priority === 'decisive' ? '决定' : '预警'}<Tpl f="priority" v={r.priority} /></span></td><td className="px-3 py-2 text-sm text-slate-500">{r.note ?? '—'}</td></tr>
            ))}</SectionTable></div>}
          </Panel>

          {/* 结论与终审 */}
          <div id="conclusion" className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="mb-3 text-base font-semibold text-ink-900">{tpl.flowBlock?.title || null}<Tpl f="flowBlock.title" v={tpl.flowBlock?.title} /></div>
            <div className="text-sm text-slate-500">
              自动审核：
              {(() => { const g = tpl.scoreDisplay.grades.find(gr => totalScore >= gr.minScore && totalScore <= gr.maxScore); return <Badge kind={g?.autoResult === '拒绝' ? 'red' : g?.autoResult === '转人工' ? 'amber' : 'green'}>{g?.autoResult ?? '—'}</Badge> })()}
              <Tpl f="scoreDisplay.grades" v="按分段判定" />
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {bizButtons.length === 0 && <span className="text-xs text-slate-400">无业务流程按钮<Tpl f="businessFlow" v={`${tpl.businessFlow?.length ?? 0}条`} /><Tpl f="grades" v={`${tpl.scoreDisplay.grades.map(g=>g.grade).join(',')}`} /></span>}
              {bizButtons.map((fg, fi) => (
                <button key={fi} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                  {fg.nodes.find(n => n.type === 'start')?.buttonName ?? fg.name ?? '操作'}
                  <Tpl f="businessFlow.flowGraphs" v={fg.name} />
                </button>
              ))}
            </div>
          </div>

          {/* 各内容分段：按模板 sections 遍历，自动匹配 sourceType */}
          {contentSecs.map((s, idx) => {
            const title = <>{s.name || `分段 ${idx + 1}`}<Tpl f={`sections[${idx}].name`} v={s.name} /></>
            const sid = scoreById[s.id] ?? 0
            const raw = (sample as any)[s.id]
            const groups = (s.fieldGroups ?? []).map((g: any) => ({
              name: g.name,
              rows: (raw as any)?.[g.name] ?? [],
            }))
            const data = Array.isArray(raw) ? raw : []

            if (s.sourceType === 'data_source') {
              return <DataSourceSection key={s.id} section={s} data={{ groups }} title={title} secId={s.id} totalScore={sid} />
            }
            if (s.sourceType === 'api') {
              return <ApiSection key={s.id} section={s} data={data} title={title} secId={s.id} totalScore={sid} />
            }
            return <RuleSetSection key={s.id} section={s} data={data} title={title} secId={s.id} totalScore={sid} />
          })}

          {/* 操作日志 */}
          {tpl.showOpLog && <Panel id="oplogs" title="操作日志"><Tpl f="showOpLog" v={tpl.showOpLog} /><div className="space-y-2">{(sample as any).op_logs?.map((l: any, i: number) => <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 px-3 py-2 text-sm"><span className="mt-0.5 shrink-0 text-xs text-slate-400">{V(l.time)}</span><span className="mt-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-600">{V(l.actor)}</span><span className="mt-0.5 font-medium text-ink-900">{V(l.action)}</span><span className="mt-0.5 text-slate-500">{V(l.detail)}</span></div>)}</div></Panel>}
        </div>

        {/* 右侧导航 */}
        <nav className="hidden w-44 shrink-0 lg:block"><div className="sticky top-32 flex flex-col gap-1 pr-5"><p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">页面导航<Tpl f="从页面卡片提取" v={navCards.length + '项'} /></p>{navCards.map(c => { const cls = c.tone === 'alert' ? 'bg-rose-50 font-medium text-rose-600' : c.tone === 'ok' ? 'bg-emerald-50 font-medium text-emerald-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'; const dot = c.tone === 'alert' ? 'bg-rose-500' : c.tone === 'ok' ? 'bg-emerald-500' : ''; return <button key={c.id} onClick={() => document.getElementById(c.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })} className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${cls}`}>{dot && <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} />}<span className={dot ? '' : 'pl-3.5'}>{c.label}</span></button> })}</div></nav>
      </div>

      {scrollVisible && <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="fixed bottom-8 right-8 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white shadow-lg" title="返回顶部"><svg className="h-5 w-5 text-slate-500" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 17a.75.75 0 0 1-.75-.75V5.612L5.29 9.77a.75.75 0 0 1-1.08-1.04l5.25-5.5a.75.75 0 0 1 1.08 0l5.25 5.5a.75.75 0 1 1-1.08 1.04l-3.96-4.158V16.25A.75.75 0 0 1 10 17Z" clipRule="evenodd" /></svg></button>}
    </div>
  )
}
