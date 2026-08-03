/* ============================================================================
 * 报告模板配置页（可用性重构版）
 * 对应文档：SaaS/doc/报告模板配置页功能设计.md
 *
 * 重构要点（解决"页面看不懂"）：
 *  1. 列表页 → 详情配置页 两层清晰，详情页不再嵌套"模板列表"侧栏。
 *  2. 报告内容配置改用业务语言，每个分段/字段展示说明（勾掉会怎样）。
 *  3. 实时预览改为独立子页面（cr:report-template-preview）：点击"预览"打开新页，
 *     用样例数据渲染报告真实长相；子页面可一键跳回本详情页。
 *  4. 评分展示（等级）与业务流程按 index 显式联动，改名/增删自动跟随。
 *  5. 详情页"当前登录角色"切换器，让使用者感知权限差异。
 *  6. 列表页移除大块权限矩阵（权限在角色说明里体现）。
 * ========================================================================== */
import { useState, useMemo, useRef, useEffect, Fragment } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageHeader, Panel, Badge, Button, DetailHeader, SingleSelect, SearchSelect, Modal } from '../components/ui'
import {
  ReportTemplate, ReportType, TplStatus, DisplayComponent, ScoreGrade, BusinessFlowConfig,
  SectionConfig, FieldConfig, SectionSource, ROLE_PERM, computeSectionScore,
  DataSourceConfig, DbField, ApiParam, ApiOutput, ApiConfig, ApiHeader, ApiMethod, ApiBodyType, ApiFieldType,
  RenderContainer, RENDER_CONTAINER_LABEL, API_FIELD_TYPE_LABEL, defaultContainer, recommendDbContainer,
  MaskRule, MASK_RULE_LABEL, autoMaskRule, Severity, SEVERITY_LABEL, FieldCondType, FieldCondition, FIELD_COND_LABEL,
  REPORT_META, PRODUCT_TREE, PRODUCT_LEAVES, PRODUCT_ALL, scopeLabel,
  AutoResult, AUTO_RESULT_LIST, AUTO_RESULT_COLOR, RiskLevel,
  SpecialRule, SpecialRuleTrigger, SpecialRulePriority, SPECIAL_TRIGGER_LABEL, SPECIAL_PRIORITY_LABEL, SPECIAL_PRIORITY_HINT,
  computeScoreSummary, validateGrades,
  DimLevel, DimLevelBand, buildDimRows, defaultDimBandsForScore,
  SECTION_SOURCE_LABEL, RULE_SETS, DB_TYPES, mockTableColumns,
  SourceTestResult, testSourceConfig, parseCurl, buildCurl,
  FieldGroup,
  ScoreDisplayConfig,
  syncFlowToGrades, buildTemplate, seedReportTemplates, DECISION_SCORE_VARS, buildDefaultScoreFormula, defaultABCGrades, buildDefaultGradesForRange, buildTemplateSample, ScoreSummary,
  FlowGraph, buildDefaultFlowGraph, summarizeFlowGraph, defaultButtonName,
} from './reportTemplateData'
import { touch } from './templateStore'
import FormulaEditor from './formulaEditor'
import FlowCanvasEditor from './FlowCanvasEditor'
import { ScoreVisual } from './ScoreVisual'
import listJson from './reportTemplateList.json'

/* 模板列表元数据（2.1：列表展示数据来自本地 json 模拟数据 reportTemplateList.json，编辑后同步更新） */
export interface TemplateListMeta {
  id: string
  name: string
  reportType: string
  status: string
  isDefault: boolean
  version: string
  lastEditor: string
  lastEditTime: string
  scope: string[]
  description: string
  sectionCount: number
  visibleCount: number
}

/* 显示方式下拉项：对给定类型推荐一个默认值，标注「（推荐）」以便用户可改 */
const containerOptions = (rec: RenderContainer) =>
  (Object.entries(RENDER_CONTAINER_LABEL) as [RenderContainer, string][])
    .map(([k, v]) => ({ value: k, label: k === rec ? `${v}（推荐）` : v }))

/* ---------- 局部小组件 ---------- */
function Field({ label, children, full, hint }: { label: string; children: React.ReactNode; full?: boolean; hint?: string }) {
  return <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}{hint && <span style={{ color: '#9CA3AF', marginLeft: 6, fontSize: 11 }}>{hint}</span>}</div>{children}
  </div>
}
const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8, width: '100%', fontSize: 14 }
const inpSm: React.CSSProperties = { padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, width: '100%', minWidth: 0 }
const dimTh: React.CSSProperties = { padding: '7px 8px', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }
const dimTd: React.CSSProperties = { padding: '5px 8px', fontSize: 12, verticalAlign: 'middle' }
const numSm: React.CSSProperties = { width: 56, padding: '4px 6px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }
const miniBtn: React.CSSProperties = { padding: '3px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer' }
const SEL = '#3B82F6', SEL_BG = '#EFF6FF'

/* 规则合集选择器：复杂下拉搜索框（搜索合集名 / 规则名 / 说明，支持键盘导航与命中高亮） */
function RuleSetSearchSelect({ value, onChange, disabled }: { value: string; onChange: (id: string) => void; disabled?: boolean }) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])
  useEffect(() => { if (open) { setQ(''); setActive(0); setTimeout(() => inputRef.current?.focus(), 0) } }, [open])

  const ql = q.trim().toLowerCase()
  const match = (rs: typeof RULE_SETS[number]) =>
    !ql || rs.name.toLowerCase().includes(ql) || rs.rules.some((r) => r.name.toLowerCase().includes(ql) || r.desc.toLowerCase().includes(ql))
  const list = RULE_SETS.filter(match)
  const sel = RULE_SETS.find((r) => r.id === value)

  const choose = (id: string) => { onChange(id); setOpen(false) }
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, list.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); if (list[active]) choose(list[active].id) }
    else if (e.key === 'Escape') setOpen(false)
  }
  const hl = (text: string): React.ReactNode => {
    if (!ql) return text
    const i = text.toLowerCase().indexOf(ql)
    if (i < 0) return text
    return <>{text.slice(0, i)}<mark style={{ background: '#FEF08A', color: 'inherit', borderRadius: 3, padding: '0 1px' }}>{text.slice(i, i + ql.length)}</mark>{text.slice(i + ql.length)}</>
  }

  return (
    <div ref={ref} style={{ position: 'relative', minWidth: 260, flex: '0 0 auto' }}>
      <button type="button" disabled={disabled} onClick={() => !disabled && setOpen((o) => !o)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', border: `1px solid ${open ? '#3B82F6' : '#D1D5DB'}`, borderRadius: 8, background: '#fff', cursor: disabled ? 'not-allowed' : 'pointer', fontSize: 13, color: sel ? '#111827' : '#9CA3AF' }}>
        <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sel ? sel.name : '（请选择规则合集）'}</span>
        {sel && <span style={{ fontSize: 11, color: '#6D28D9', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 999, padding: '0 8px' }}>{sel.rules.length} 条</span>}
        <span style={{ fontSize: 11, color: '#9CA3AF' }}>▾</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', zIndex: 50, top: 'calc(100% + 4px)', left: 0, right: 0, background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.12)', overflow: 'hidden' }}>
          <div style={{ padding: 8, borderBottom: '1px solid #F1F5F9' }}>
            <input ref={inputRef} value={q} onChange={(e) => { setQ(e.target.value); setActive(0) }} onKeyDown={onKey}
              placeholder="搜索合集名 / 规则名 / 说明…" style={{ width: '100%', padding: '7px 10px', border: '1px solid #D1D5DB', borderRadius: 8, fontSize: 13, outline: 'none' }} />
          </div>
          <div style={{ maxHeight: 264, overflowY: 'auto', padding: 6 }}>
            <button type="button" onClick={() => choose('')}
              style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8, fontSize: 13, color: '#9CA3AF', background: value === '' ? '#F5F3FF' : 'transparent', border: value === '' ? '1px solid #DDD6FE' : '1px solid transparent' }}>（请选择 / 清空）</button>
            {list.length === 0 && <div style={{ padding: 16, textAlign: 'center', color: '#9CA3AF', fontSize: 13 }}>无匹配规则合集</div>}
            {list.map((rs, idx) => (
              <button key={rs.id} type="button" onClick={() => choose(rs.id)} onMouseEnter={() => setActive(idx)}
                style={{ width: '100%', display: 'block', textAlign: 'left', padding: '8px 10px', borderRadius: 8, background: idx === active ? '#EFF6FF' : value === rs.id ? '#F5F3FF' : 'transparent', border: value === rs.id ? '1px solid #DDD6FE' : '1px solid transparent' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1F2937' }}>{hl(rs.name)}</span>
                  <span style={{ fontSize: 11, color: '#6D28D9', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 999, padding: '0 8px' }}>{rs.rules.length} 条规则</span>
                  {value === rs.id && <span style={{ marginLeft: 'auto', color: '#6D28D9', fontSize: 12 }}>✓</span>}
                </div>
                <div style={{ marginTop: 4, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {rs.rules.slice(0, 5).map((r) => <span key={r.id} style={{ fontSize: 11, color: '#6B7280', background: '#F3F4F6', borderRadius: 4, padding: '1px 6px' }}>{hl(r.name)}</span>)}
                  {rs.rules.length > 5 && <span style={{ fontSize: 11, color: '#9CA3AF' }}>+{rs.rules.length - 5}</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ============================ 主组件 ============================ */
export default function ReportTemplateConfig() {
  const nav = useNavigate()
  const loc = useLocation()
  const initId = new URLSearchParams(loc.search).get('id')
  const [templates, setTemplates] = useState<ReportTemplate[]>(seedReportTemplates)
  // 2.1 列表元数据：初始来自本地 json（reportTemplateList.json），编辑/增删同步更新
  const [listMeta, setListMeta] = useState<TemplateListMeta[]>(listJson as TemplateListMeta[])
  const syncMeta = (t: ReportTemplate) => setListMeta((l) => l.map((m) => m.id === t.id ? {
    ...m, name: t.name, status: t.status, isDefault: !!t.isDefault, version: t.version,
    lastEditor: t.lastEditor, lastEditTime: t.lastEditTime, scope: t.scope, description: t.description ?? '',
    sectionCount: t.sections.length, visibleCount: t.sections.filter((s) => s.visible).length,
  } : m))
  // 页面新建/复制模板时，样例数据落本地（samples/sample-{id}.json，经 vite 代理写入）
  const persistSample = (id: string, tpl: ReportTemplate) => {
    const sample = buildTemplateSample(tpl)
    fetch('/api/save-sample', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, sample }) }).catch(() => {})
  }
  const [view, setView] = useState<'list' | 'detail'>(initId ? 'detail' : 'list')
  const [activeId, setActiveId] = useState<string>(initId ?? seedReportTemplates[0].id)
  const [tab, setTab] = useState<'content' | 'score' | 'flow'>('content')
  const [configSid, setConfigSid] = useState<string | null>(null)
  const [apiTab, setApiTab] = useState<'params' | 'headers' | 'body' | 'code'>('params')
  const [apiCode, setApiCode] = useState('')
  const openConfig = (sid: string) => { setApiTab('params'); setApiCode(''); setConfigSid(sid) }
  const [testResult, setTestResult] = useState<SourceTestResult | null>(null)
  const [testing, setTesting] = useState(false)
  const [flashId, setFlashId] = useState<string | null>(null) // 新增分段后高亮闪一下，确保「点击有反馈」
  const [search, setSearch] = useState('')
  const [fType, setFType] = useState('全部')
  const [fStatus, setFStatus] = useState('全部')
  const [fScope, setFScope] = useState('全部')
  const [showNew, setShowNew] = useState(false)
  const [syncHint, setSyncHint] = useState<string>('')
  const [demoScore, setDemoScore] = useState<number | null>(null) // 评分卡形态预览的示例分值（null=自动取范围 72% 处）
  const [basicExpanded, setBasicExpanded] = useState(false) // 基础信息默认收起，展开可编辑
  const secRefs = useRef<Record<string, HTMLDivElement | null>>({}) // 各分段/基础信息卡片 DOM 引用，供右侧导航锚点跳转
  const [openSecs, setOpenSecs] = useState<Set<string>>(() => new Set()) // 报告内容配置各数据区块默认收起（item13）；新增块默认打开
  const [condEdit, setCondEdit] = useState<{ kind: 'ds' | 'api' | 'rule'; sId: string; index?: number; fid?: string; name: string } | null>(null)
  const [copyPick, setCopyPick] = useState(false) // 「＋ 复制现有模板」选择弹窗
  const [specialPick, setSpecialPick] = useState(false) // 「＋ 添加规则」选择弹窗（特殊命中规则）
  /* —— 条件配置弹窗辅助（五：多条件组合编辑器） —— */
  const getCondSection = (sId: string) => active.sections.find((s) => s.id === sId)!
  const getCondList = (t: NonNullable<typeof condEdit>): FieldCondition[] => {
    const s = getCondSection(t.sId)
    if (t.kind === 'ds') return s.ds?.tableFields[t.index!]?.conditions ?? []
    if (t.kind === 'api') return s.api?.outputs[t.index!]?.conditions ?? []
    return s.fields.find((f) => f.id === t.fid)?.conditions ?? []
  }
  const getCondFields = (t: NonNullable<typeof condEdit>): string[] => {
    const s = getCondSection(t.sId)
    if (t.kind === 'ds') return (s.ds?.tableFields ?? []).map((f) => f.name)
    if (t.kind === 'api') return (s.api?.outputs ?? []).map((o) => o.key)
    return s.fields.map((f) => f.name)
  }
  const getCondOps = (kind: 'ds' | 'api' | 'rule'): FieldCondType[] =>
    kind === 'ds' ? ['eq', 'empty', 'notEmpty', 'gt', 'lt'] : kind === 'api' ? ['eq', 'empty', 'notEmpty', 'gt', 'lt', 'regex'] : ['hit', 'miss']
  const applyCondList = (t: NonNullable<typeof condEdit>, list: FieldCondition[]) => {
    if (t.kind === 'ds') patchDsField(t.sId, t.index!, (f) => ({ ...f, conditions: list }))
    else if (t.kind === 'api') patchApiOutput(t.sId, t.index!, (x) => ({ ...x, conditions: list }))
    else patchField(t.sId, t.fid!, (x) => ({ ...x, conditions: list }))
  }

  const active = useMemo(() => templates.find((t) => t.id === activeId) ?? templates[0], [templates, activeId])
  const perm = ROLE_PERM['系统管理员'] // 权限固定为系统管理员（全权）；角色模拟切换已移除
  const canEdit = perm.edit

  /* 编辑写回：除本地 state 外，同步回共享种子 seedReportTemplates —— 各报告详情页读的是它，
     否则配置页改了开关/分值，详情页看不到变化（无跨页 store 时的最小可用做法）。 */
  const patch = (fn: (t: ReportTemplate) => ReportTemplate) =>
    setTemplates((l) => l.map((t) => {
      if (t.id !== activeId) return t
      const next = fn(t)
      const i = seedReportTemplates.findIndex((s) => s.id === t.id)
      if (i >= 0) seedReportTemplates[i] = next
      touch() // 通知订阅了模板 store 的详情/预览组件实时刷新
      syncMeta(next) // 同步列表元数据（json 模拟数据）
      return next
    }))
  const patchSection = (sid: string, fn: (s: SectionConfig) => SectionConfig) =>
    patch((t) => ({ ...t, sections: t.sections.map((s) => (s.id === sid ? fn(s) : s)) }))
  /* 评分维度分布：逐维度 低/中/高 三档区间/说明（每个集合独立配置，不再全局共用） */
  const patchSectionDimBand = (sid: string, bi: number, p: Partial<DimLevelBand>) =>
    patchSection(sid, (s) => {
      const base = s.dimBands ?? active.dimBands ?? defaultDimBandsForScore(computeSectionScore(s).total)
      const next = base.map((b, k) => (k === bi ? { ...b, ...p } : b))
      return { ...s, dimBands: next }
    })
  const patchGrade = (i: number, fn: (g: ScoreGrade) => ScoreGrade) =>
    patch((t) => {
      const grades = t.scoreDisplay.grades.map((g, k) => (k === i ? fn(g) : g))
      return { ...t, scoreDisplay: { ...t.scoreDisplay, grades }, businessFlow: syncFlowToGrades(t.businessFlow, grades) }
    })
  const addGrade = () => {
    patch((t) => {
      const last = t.scoreDisplay.grades[t.scoreDisplay.grades.length - 1]
      const base = last ? last.maxScore : 0
      const ng: ScoreGrade = { grade: `新档${t.scoreDisplay.grades.length + 1}`, label: '新风险档', minScore: base + 1, maxScore: 100, riskLevel: '中', color: '#F59E0B', autoResult: '转人工', description: '新评分档，请配置区间与处置' }
      const grades = [...t.scoreDisplay.grades, ng]
      setSyncHint('已新增评分档，下方「人工审核」已自动同步增加一行')
      return { ...t, scoreDisplay: { ...t.scoreDisplay, grades }, businessFlow: syncFlowToGrades(t.businessFlow, grades) }
    })
  }
  const delGrade = (i: number) => {
    if (i === 0) return
    patch((t) => {
      const grades = t.scoreDisplay.grades.filter((_, k) => k !== i)
      setSyncHint('已删除一个评分档，下方「人工审核」已自动同步删除对应行')
      return { ...t, scoreDisplay: { ...t.scoreDisplay, grades }, businessFlow: syncFlowToGrades(t.businessFlow, grades) }
    })
  }
  const resetGrades = () => {
    patch((t) => {
      const grades = buildDefaultGradesForRange(scoreSummary.min, scoreSummary.max, 3, t.scoreDisplay.scoreSemantic)
      setSyncHint('分值分段已根据分值预测范围重新生成为三等分')
      return { ...t, scoreDisplay: { ...t.scoreDisplay, grades }, businessFlow: syncFlowToGrades(t.businessFlow, grades) }
    })
  }
  /* ---- 特殊命中规则：命中即定结论，不受分值分段约束 ---- */
  const patchSpecial = (id: string, fn: (r: SpecialRule) => SpecialRule) =>
    patch((t) => ({ ...t, specialRules: (t.specialRules ?? []).map((r) => (r.id === id ? fn(r) : r)) }))
  const delSpecial = (id: string) =>
    patch((t) => ({ ...t, specialRules: (t.specialRules ?? []).filter((r) => r.id !== id) }))
  const addSpecial = (sectionId: string, fieldId: string, sectionName: string, ruleName: string) =>
    patch((t) => {
      if ((t.specialRules ?? []).some((r) => r.sectionId === sectionId && r.fieldId === fieldId)) return t
      const nr: SpecialRule = {
        id: `sr_${sectionId}_${fieldId}_${Date.now()}`, sectionId, fieldId, sectionName, ruleName,
        trigger: 'hit', autoResult: '拒绝', priority: 'decisive', note: '',
      }
      return { ...t, specialRules: [...(t.specialRules ?? []), nr] }
    })
  /* 可选规则项：来自「报告内容配置」里已启用的分段与已勾选的展示项 */
  const specialCandidates = useMemo(() => active.sections
    .filter((s) => (s.homeTab ?? 'content') === 'content' && s.visible && s.sourceType !== 'tpl_copy')
    .sort((a, b) => a.order - b.order)
    .map((s) => ({
      sectionId: s.id,
      sectionName: s.sourceName || s.name,
      sourceType: s.sourceType,
      items: s.fields.filter((f) => f.visible).map((f) => ({ id: f.id, name: f.name })),
    }))
    .filter((g) => g.items.length > 0), [active.sections])

  /* 评分方案：总分 = 基础分 + 各卡得分直接汇总（见 computeScoreSummary），此处仅用于分段区间校验 */
  const scoreSummary = useMemo(() => computeScoreSummary(active), [active])
  const dimRows = useMemo(() => buildDimRows(active), [active])
  const gradeErrs = useMemo(() => validateGrades(active.scoreDisplay.grades, scoreSummary.min, scoreSummary.max), [active.scoreDisplay.grades, scoreSummary])
  // 9.5 分值预测：max/min/命中即拒 由「总分公式 + sections 区间」实时算出，同步落盘到 scoreBlock（保存到 json，值相等不再写）
  useEffect(() => {
    const blk = active.scoreBlock
    if (blk.min !== scoreSummary.min || blk.max !== scoreSummary.max || blk.rejectCount !== scoreSummary.rejectTotal) {
      patch((t) => ({ ...t, scoreBlock: { ...t.scoreBlock, min: scoreSummary.min, max: scoreSummary.max, rejectCount: scoreSummary.rejectTotal } }))
    }
  }, [active.id, scoreSummary.min, scoreSummary.max, scoreSummary.rejectTotal])
  const patchFlow = (i: number, fn: (f: BusinessFlowConfig) => BusinessFlowConfig) =>
    patch((t) => ({ ...t, businessFlow: t.businessFlow.map((f, k) => (k === i ? fn(f) : f)) }))

  /* ---- 审核操作：分段业务流程（每条一图，在弹窗画布中配置） ----
     flowEdit = { gi: businessFlow 下标(i+1), sub: 该分段内第几条流程 }；draftGraph 为画布草稿，点「保存流程」才写回模板 */
  const [flowEdit, setFlowEdit] = useState<{ gi: number; sub: number } | null>(null)
  const [draftGraph, setDraftGraph] = useState<FlowGraph | null>(null)
  const openFlowCanvas = (gi: number, sub: number, flow: BusinessFlowConfig, ar: AutoResult) => {
    const g = flow.flowGraphs?.[sub]
    setDraftGraph(g ? { nodes: g.nodes.map((n) => ({ ...n })), edges: g.edges.map((e) => ({ ...e })) } : buildDefaultFlowGraph(flow, ar))
    setFlowEdit({ gi, sub })
  }
  const addFlow = (gi: number, flow: BusinessFlowConfig, ar: AutoResult) => {
    const ng = buildDefaultFlowGraph(flow, ar, defaultButtonName(ar))
    patchFlow(gi, (x) => ({ ...x, flowGraphs: [...(x.flowGraphs ?? []), ng] }))
    setDraftGraph({ nodes: ng.nodes.map((n) => ({ ...n })), edges: ng.edges.map((e) => ({ ...e })) })
    setFlowEdit({ gi, sub: (flow.flowGraphs ?? []).length })
  }
  const removeFlow = (gi: number, sub: number) => {
    patchFlow(gi, (x) => ({ ...x, flowGraphs: (x.flowGraphs ?? []).filter((_, k) => k !== sub) }))
  }
  const saveFlowCanvas = () => {
    if (!flowEdit || !draftGraph) return
    patchFlow(flowEdit.gi, (x) => {
      const arr = [...(x.flowGraphs ?? [])]
      arr[flowEdit.sub] = draftGraph
      return { ...x, flowGraphs: arr }
    })
    setFlowEdit(null); setDraftGraph(null)
  }

  /* ---- 报告内容：分段 / 来源配置（三种来源各自专属配置） ---- */
  /* 字段 id 由来源块派生：数据源=ds.tableFields / 接口=api.outputs / 规则集=规则项，见各来源 helper */
  const nextOrder = (arr: { order: number }[]) => arr.reduce((m, x) => Math.max(m, x.order), 0) + 1
  const addSection = (sType: SectionSource) => {
    if (!canEdit) return
    const order = nextOrder(active.sections)
    const sid = `sec_${Date.now()}`
    const base: SectionConfig = {
      id: sid, name: sType === 'data_source' ? '新数据源分段' : sType === 'api' ? '新接口结果分段' : '新规则集分段',
      desc: SECTION_SOURCE_LABEL[sType], order, visible: true, sourceType: sType, sourceName: '', fields: [],
    }
    const ns: SectionConfig = sType === 'data_source'
      ? { ...base, ds: { dbType: 'MySQL', ip: '', port: '3306', username: '', password: '', database: '', table: '', tableFields: [] } }
      : sType === 'api'
        ? { ...base, api: { url: '', method: 'POST', headers: [], inputs: [], bodyType: 'none', bodyText: '', outputs: [] } }
        : { ...base, ruleSetId: RULE_SETS[0].id, fields: RULE_SETS[0].rules.map((r) => ({ id: r.id, name: r.name, desc: r.desc, visible: true, sourceRef: r.id, hitText: '命中', missText: '未命中' })) }
    patch((t) => ({ ...t, sections: [...t.sections, ns] })); logChange('编辑', `新增分段「${ns.name}」`)
    setOpenSecs((p) => new Set(p).add(sid)); setFlashId(ns.id); setTimeout(() => setFlashId((cur) => (cur === ns.id ? null : cur)), 1600)
  }
  /* 复制现有模板：把来源模板「报告内容配置」的全部分段快照进一个只读卡片（一个卡片、多个列表，配置不可修改） */
  const addTplCopySection = (src: (typeof templates)[number]) => {
    if (!canEdit) return
    const snap = src.sections
      .filter((x) => (x.homeTab ?? 'content') === 'content')
      .map((x) => JSON.parse(JSON.stringify(x)) as SectionConfig)
    const ns: SectionConfig = {
      id: `sec_${Date.now()}`, name: `复制 · ${src.name}`, desc: '复制现有模板', order: nextOrder(active.sections),
      visible: true, sourceType: 'tpl_copy', sourceName: src.name, fields: [],
      copyFromId: src.id, copyFromName: src.name, copySections: snap,
      copyScoreRange: (() => { const m = computeScoreSummary(src); return { min: m.min, max: m.max, base: m.baseScore } })(),
    }
    patch((t) => ({ ...t, sections: [...t.sections, ns] })); logChange('编辑', `复制模板「${src.name}」的报告内容配置（${snap.length} 个列表，只读）`)
    setOpenSecs((p) => new Set(p).add(ns.id)); setCopyPick(false)
    setFlashId(ns.id); setTimeout(() => setFlashId((cur) => (cur === ns.id ? null : cur)), 1600)
  }
  const delSection = (sid: string) => {
    if (!canEdit) return
    const s = active.sections.find((x) => x.id === sid); if (!s) return
    if (!window.confirm(`确认删除分段「${s.name}」及其下 ${s.fields.length} 个字段？`)) return
    patch((t) => ({ ...t, sections: t.sections.filter((x) => x.id !== sid) })); logChange('编辑', `删除分段「${s.name}」`)
  }
  const moveSection = (sid: string, dir: -1 | 1) => {
    if (!canEdit) return
    const arr = [...active.sections].sort((a, b) => a.order - b.order)
    const i = arr.findIndex((x) => x.id === sid); if (i < 0) return
    const j = i + dir; if (j < 0 || j >= arr.length) return
    const a = arr[i], b = arr[j]; const o = a.order; a.order = b.order; b.order = o
    patch((t) => ({ ...t, sections: t.sections.map((x) => (x.id === a.id ? a : x.id === b.id ? b : x)) }))
  }
  /* 字段来自来源，不可凭空新增：数据源=表字段、接口=输出字段、规则集=规则项。
     各来源的字段增删在下方专属 helper 中处理（readTable / addApiOutput / selectRuleSet）。 */
  const patchField = (sid: string, fid: string, fn: (f: FieldConfig) => FieldConfig) =>
    patchSection(sid, (x) => ({ ...x, fields: x.fields.map((f) => (f.id === fid ? fn(f) : f)) }))
  /* 计分方向提到分段（卡片）级 cardScoreMode；逐条展示项仅配置 scorePoints / condType / condValue，本卡总分由 computeSectionScore 自动汇总 */
  /* —— 数据源：连接配置 + 读取表字段 —— */
  const patchDs = (sid: string, fn: (d: DataSourceConfig) => DataSourceConfig) =>
    patchSection(sid, (s) => {
      const ds = fn(s.ds ?? { dbType: 'MySQL', ip: '', port: '3306', username: '', password: '', database: '', table: '', tableFields: [] })
      // 重建 fields 时保留已配置的计分字段，并以本行（DbField）的分值优先；
      // 缺失时回落到旧字段配置，避免编辑任意一项后被整体清零导致本卡总分计算错误。
      const fields = ds.tableFields.map((tf, k) => {
        const old = s.fields.find((f) => f.sourceRef === tf.name) ?? s.fields[k]
        return {
          ...old,
          id: old?.id ?? `dsf_${k}`,
          name: tf.name,
          desc: old?.desc ?? '数据库表字段',
          visible: tf.visible,
          sourceRef: tf.name,
          displayLabel: tf.label ?? tf.name,
          mask: /身份证|手机|银行卡|证件|姓名/.test(tf.name),
          group: tf.group ?? old?.group,
          scorePoints: tf.scorePoints ?? old?.scorePoints ?? 0,
          condType: tf.condType ?? old?.condType,
          condValue: tf.condValue ?? old?.condValue,
          exempt: tf.exempt ?? old?.exempt,
          conditions: tf.conditions ?? old?.conditions,
        }
      })
      return { ...s, ds, fields }
    })
  const readTable = (sid: string) => {
    if (!canEdit) return
    patchDs(sid, (d) => ({ ...d, tableFields: mockTableColumns(d.table || 'applicant_info').map((c) => ({ name: c.name, type: c.type, visible: true, container: recommendDbContainer(c.type), maskRule: autoMaskRule(c.name) })) }))
    logChange('编辑', `读取数据源表字段`)
  }
  const toggleDsField = (sid: string, idx: number) =>
    patchDs(sid, (d) => ({ ...d, tableFields: d.tableFields.map((t, k) => (k === idx ? { ...t, visible: !t.visible } : t)) }))
  /* 数据源字段级配置：显示名 / 显示方式 / 脱敏规则 / 说明（类型从表结构读取，只读） */
  const patchDsField = (sid: string, idx: number, fn: (f: DbField) => DbField) =>
    patchDs(sid, (d) => ({ ...d, tableFields: d.tableFields.map((t, k) => (k === idx ? fn(t) : t)) }))
  /* 数据源 / 接口合集的内部分组（可命名）：增删分组、改名、删除时把组内字段并入首个剩余组 */
  const patchFieldGroups = (sid: string, fn: (g: FieldGroup[] | undefined) => FieldGroup[] | undefined) =>
    patchSection(sid, (s) => ({ ...s, fieldGroups: fn(s.fieldGroups) }))
  const addFieldGroup = (sid: string) =>
    patchFieldGroups(sid, (g) => {
      const groups = g ?? []
      const n = groups.length + 1
      return [...groups, { id: `grp_${Date.now()}_${n}`, name: `新分组${n}` }]
    })
  const renameFieldGroup = (sid: string, gid: string, name: string) =>
    patchFieldGroups(sid, (g) => (g ?? []).map((x) => (x.id === gid ? { ...x, name } : x)))
  const delFieldGroup = (sid: string, gid: string) =>
    patchSection(sid, (s) => {
      const groups = (s.fieldGroups ?? []).filter((x) => x.id !== gid)
      const fallback = groups[0]?.id
      const ds = s.ds ? { ...s.ds, tableFields: s.ds.tableFields.map((t) => (t.group === gid ? { ...t, group: fallback } : t)) } : s.ds
      const fields = s.fields.map((f) => (f.group === gid ? { ...f, group: fallback } : f))
      return { ...s, fieldGroups: groups, ds, fields }
    })
  /* —— 接口：API 地址 + 输入参数 + 输出字段 —— */
  const patchApi = (sid: string, fn: (a: ApiConfig) => ApiConfig) =>
    patchSection(sid, (s) => {
      const api = fn(s.api ?? { url: '', method: 'POST', headers: [], inputs: [], bodyType: 'none', bodyText: '', outputs: [] })
      // 与数据源一致：重建 fields 时保留计分字段，并以本行（ApiOutput）的分值优先。
      const fields = api.outputs.map((o, k) => {
        const old = s.fields.find((f) => f.sourceRef === o.key) ?? s.fields[k]
        return {
          ...old,
          id: old?.id ?? `apo_${k}`,
          name: o.label,
          desc: old?.desc ?? '接口输出字段',
          visible: o.visible ?? true,
          sourceRef: o.key,
          displayLabel: o.label ?? o.key,
          group: o.group ?? old?.group,
          scorePoints: o.scorePoints ?? old?.scorePoints ?? 0,
          condType: o.condType ?? old?.condType,
          condValue: o.condValue ?? old?.condValue,
          exempt: o.exempt ?? old?.exempt,
          conditions: o.conditions ?? old?.conditions,
        }
      })
      return { ...s, api, fields }
    })
  const addApiInput = (sid: string) => patchApi(sid, (a) => ({ ...a, inputs: [...a.inputs, { key: '', from: '', required: false }] }))
  const patchApiInput = (sid: string, idx: number, fn: (p: ApiParam) => ApiParam) =>
    patchApi(sid, (a) => ({ ...a, inputs: a.inputs.map((p, k) => (k === idx ? fn(p) : p)) }))
  const delApiInput = (sid: string, idx: number) =>
    patchApi(sid, (a) => ({ ...a, inputs: a.inputs.filter((_, k) => k !== idx) }))
  const addApiHeader = (sid: string) => patchApi(sid, (a) => ({ ...a, headers: [...(a.headers ?? []), { key: '', value: '' }] }))
  const patchApiHeader = (sid: string, idx: number, fn: (h: ApiHeader) => ApiHeader) =>
    patchApi(sid, (a) => ({ ...a, headers: (a.headers ?? []).map((h, k) => (k === idx ? fn(h) : h)) }))
  const delApiHeader = (sid: string, idx: number) =>
    patchApi(sid, (a) => ({ ...a, headers: (a.headers ?? []).filter((_, k) => k !== idx) }))
  const addApiOutput = (sid: string) => patchApi(sid, (a) => ({ ...a, outputs: [...a.outputs, { key: '', label: '', type: 'string', container: 'text' }] }))
  const patchApiOutput = (sid: string, idx: number, fn: (o: ApiOutput) => ApiOutput) =>
    patchApi(sid, (a) => ({ ...a, outputs: a.outputs.map((o, k) => (k === idx ? fn(o) : o)) }))
  const delApiOutput = (sid: string, idx: number) =>
    patchApi(sid, (a) => ({ ...a, outputs: a.outputs.filter((_, k) => k !== idx) }))
  /* —— 规则集：选择合集后对其规则项用/不用 —— */
  const selectRuleSet = (sid: string, rsId: string) => {
    if (!canEdit) return
    const rs = RULE_SETS.find((r) => r.id === rsId)
    patchSection(sid, (s) => {
      const fields = (rs?.rules ?? []).map((r) => ({ id: r.id, name: r.name, desc: r.desc, visible: true, sourceRef: r.id, hitText: '命中', missText: '未命中' }))
      return { ...s, ruleSetId: rsId, fields }
    })
    logChange('编辑', `选择规则合集「${rs?.name ?? rsId}」`)
  }

  const bump = (v: string) => {
    const m = /^V(\d+)\.(\d+)$/.exec(v)
    if (!m) return 'V1.1'
    return `V${m[1]}.${+m[2] + 1}`
  }
  /* 来源配置弹窗：测试当前分段来源是否可用（模拟校验） */
  const runTest = (s: SectionConfig) => {
    setTesting(true)
    setTestResult(null)
    setTimeout(() => { setTestResult(testSourceConfig(s)); setTesting(false) }, 480)
  }
  const nowStr = () => new Date().toISOString().slice(0, 16).replace('T', ' ')
  const logChange = (action: '编辑' | '启用' | '停用' | '复制' | '删除' | '创建', summary: string) => {
    const now = nowStr()
    patch((t) => {
      const nv = action === '创建' ? t.version : bump(t.version)
      return { ...t, version: nv, lastEditTime: now, lastEditor: '当前用户', changeLogs: [{ version: nv, action, operator: '当前用户', timestamp: now, summary }, ...t.changeLogs] }
    })
  }
  const changeStatus = (next: TplStatus) => {
    if (next === active.status) return
    if (next === '已启用') {
      const reason = window.prompt('请输入启用原因（将记入审批日志）：')
      if (reason === null) return
      patch((t) => ({ ...t, status: '已启用' }))
      logChange('启用', reason ? `启用模板：${reason}` : '启用模板')
    } else if (next === '已停用') {
      patch((t) => ({ ...t, status: '已停用' }))
      logChange('停用', '停用模板')
    } else {
      patch((t) => ({ ...t, status: '草稿' }))
      logChange('编辑', '保存为草稿')
    }
  }
  const saveDraft = () => {
    if (active.scoreBlock.title.trim() === '') { window.alert('「自动审核」标题为必填项，不可为空'); return }
    if (active.flowBlock.title.trim() === '') { window.alert('「人工审核」标题为必填项，不可为空'); return }
    patch((t) => ({ ...t, status: '草稿' })); logChange('编辑', '保存模板配置')
  }
  const publishNewVersion = () => {
    if (!canEdit) return
    const note = window.prompt('请输入本次发布的版本说明（将记入版本日志并自动启用该模板）：')
    if (note === null) return
    const nv = bump(active.version)
    const now = nowStr()
    patch((t) => ({
      ...t,
      version: nv,
      status: '已启用',
      lastEditTime: now,
      lastEditor: '当前用户',
      changeLogs: [{ version: nv, action: '发布', operator: '当前用户', timestamp: now, summary: note ? `发布新版本：${note}` : '发布新版本' }, ...t.changeLogs],
    }))
  }
  /* 设为默认：①默认位在「同一报告类型」内互斥转移（原来对全部模板置位，会顺手把别的
     报告类型的默认也清掉）；②必须同步写回 seedReportTemplates 并 touch()，否则报告详情页
     （经 templateStore 读 seed）根本感知不到，按钮弹的「新进件将使用新模板」就成了空话。 */
  const setDefault = () => {
    if (active.isDefault) return
    if (!window.confirm('设为默认后，新进入件将使用新模板，历史报告不受影响。是否继续？')) return
    setTemplates((l) => l.map((t) => {
      if (t.reportType !== active.reportType) return t
      const next = { ...t, isDefault: t.id === activeId }
      const i = seedReportTemplates.findIndex((s) => s.id === t.id)
      if (i >= 0) seedReportTemplates[i] = next
      return next
    }))
    touch()
  }
  const copyTpl = () => {
    const id = `tpl-${Date.now()}`
    const src = active
    const now = nowStr()
    const copy: ReportTemplate = {
      ...src, id, name: `${src.name} - 复制`, isDefault: false, status: '草稿', version: 'V1.0', lastEditTime: now, lastEditor: '当前用户',
      sections: src.sections.map((s) => ({ ...s, fields: s.fields.map((f) => ({ ...f })) })),
      scoreDisplay: { ...src.scoreDisplay, grades: src.scoreDisplay.grades.map((g) => ({ ...g })) },
      businessFlow: src.businessFlow.map((f) => ({ ...f })),
      theme: { ...src.theme },
      export: { ...src.export, formats: [...src.export.formats], watermark: { ...src.export.watermark } },
      changeLogs: [{ version: 'V1.0', action: '创建', operator: '当前用户', timestamp: now, summary: `由「${src.name}」复制创建` }],
    }
    setTemplates((l) => [copy, ...l]); setActiveId(id); setView('detail')
    setListMeta((l) => [{ id, name: copy.name, reportType: copy.reportType, status: copy.status, isDefault: false, version: copy.version, lastEditor: copy.lastEditor, lastEditTime: copy.lastEditTime, scope: copy.scope, description: copy.description ?? '', sectionCount: copy.sections.length, visibleCount: copy.sections.filter((s) => s.visible).length }, ...l])
    persistSample(id, copy) // 复制模板样例落本地
  }
  const deleteTpl = (id: string) => {
    const t = templates.find((x) => x.id === id); if (!t) return
    if (t.status === '已启用' || t.isDefault) { window.alert('已启用或默认模板不可删除，请先停用并取消默认。'); return }
    if (!window.confirm(`确认删除模板「${t.name}」？`)) return
    const now = nowStr()
    // 同步删除 seed
    const si = seedReportTemplates.findIndex((x) => x.id === id)
    if (si >= 0) seedReportTemplates.splice(si, 1)
    touch()
    setTemplates((l) => {
      const withLog = l.map((x) => x.id === id ? { ...x, changeLogs: [{ version: x.version, action: '删除' as const, operator: '当前用户', timestamp: now, summary: `删除模板「${x.name}」` }, ...x.changeLogs] } : x)
      return withLog.filter((x) => x.id !== id)
    })
    setListMeta((l) => l.filter((x) => x.id !== id))
    if (activeId === id) {
      const rest = templates.filter((x) => x.id !== id)
      if (rest.length) { setActiveId(rest[0].id); setView('detail') } else setView('list')
    }
  }
  const createNew = (type: ReportType) => {
    const id = `tpl-${Date.now()}`
    const t = buildTemplate(type, { id, name: `${REPORT_META[type].label}报告模板`, status: '草稿', scope: ['全产品'], isDefault: false, version: 'V1.0', lastEditor: '当前用户', lastEditTime: '刚刚' })
    const abc = defaultABCGrades(t.scoreDisplay.scoreSemantic).map((g) => ({ ...g }))
    t.scoreDisplay = { ...t.scoreDisplay, grades: abc }
    t.businessFlow = syncFlowToGrades(t.businessFlow, abc)
    seedReportTemplates.unshift(t)
    touch()
    setTemplates((l) => [t, ...l]); setActiveId(id); setShowNew(false); setView('detail')
    setListMeta((l) => [{ id, name: t.name, reportType: t.reportType, status: t.status, isDefault: false, version: t.version, lastEditor: t.lastEditor, lastEditTime: t.lastEditTime, scope: t.scope, description: t.description ?? '', sectionCount: t.sections.length, visibleCount: t.sections.filter((s) => s.visible).length }, ...l])
    persistSample(id, t) // 新模板样例落本地（samples/sample-{id}.json）
  }

  const statusBadge = (s: string) => <Badge kind={s === '已启用' ? 'green' : s === '已停用' ? 'gray' : 'amber'}>{s}</Badge>
  /* ===================== 列表页 ===================== */
  if (view === 'list') {
    const scopeMatch = (scope: string[], f: string) => {
      if (f === '全部') return true
      if (scope.includes(PRODUCT_ALL)) return true
      if (scope.includes(f)) return true
      const cat = PRODUCT_TREE.find((c) => c.name === f)
      if (cat) return cat.children.some((ch) => scope.includes(ch.name))
      return false
    }
    const filtered = listMeta.filter((t) => {
      if (search && !t.name.includes(search)) return false
      if (fType !== '全部' && REPORT_META[t.reportType as ReportType]?.label !== fType) return false
      if (fStatus !== '全部' && t.status !== fStatus) return false
      if (fScope !== '全部' && !scopeMatch(t.scope, fScope)) return false
      return true
    })
    const typeOptions = [{ value: '全部', label: '全部报告类型' }, ...(['info_verify', 'credit', 'fraud', 'decision'] as ReportType[]).map((t) => ({ value: REPORT_META[t].label, label: REPORT_META[t].label }))]
    const statusOptions = [{ value: '全部', label: '全部状态' }, { value: '草稿', label: '草稿' }, { value: '已启用', label: '已启用' }, { value: '已停用', label: '已停用' }]
    const scopeOptions = [
      { value: '全部', label: '全部适用产品' },
      ...PRODUCT_TREE.map((c) => ({ value: c.name, label: c.name, group: c.id })),
      ...PRODUCT_LEAVES.map((l) => ({ value: l.name, label: l.name, group: l.catId })),
    ]
    return (
      <div>
        <PageHeader title="报告模板配置" subtitle="统一管理信息核验 / 信用风控 / 欺诈识别 / 决策报告四类报告的展示模板、评分等级与人工审核"
          actions={<Button variant="primary" onClick={() => setShowNew(true)}>＋ 新建模板</Button>} />
        <Panel>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <input className="flex-1 min-w-[200px]" placeholder="搜索模板名称…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8 }} />
            <SingleSelect label="" options={typeOptions} value={fType} onChange={setFType} />
            <SingleSelect label="" options={statusOptions} value={fStatus} onChange={setFStatus} />
            <SearchSelect
              options={scopeOptions}
              groups={PRODUCT_TREE.map((c) => ({ key: c.id, label: c.name }))}
              value={fScope}
              onChange={(v) => setFScope(v as string)}
              placeholder="全部适用产品"
              searchPlaceholder="搜索产品 / 类目…"
              width={220}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((t) => {
              const meta = REPORT_META[t.reportType as ReportType]
              return (
                <div key={t.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}<span style={{ marginLeft: 6, display: 'inline-block', fontSize: 9, fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74', verticalAlign: 'middle', lineHeight: '14px', fontWeight: 400 }}>JSON:name</span></div>
                    {t.isDefault && <Badge kind="blue">默认</Badge>}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge kind={meta?.color}>{meta?.icon} {meta?.label}</Badge>
                    {statusBadge(t.status)}
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{meta?.hint}</span>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: '#6B7280', lineHeight: 1.7, flex: 1 }}>
                    <div>适用产品：{scopeLabel(t.scope)}</div>
                    <div>分段：显示 {t.visibleCount}/{t.sectionCount} 个　·　版本 {t.version}</div>
                    <div>最近编辑：{t.lastEditor} · {t.lastEditTime}</div>
                  </div>
                  <div style={{ marginTop: 'auto', paddingTop: 12, display: 'flex', gap: 8 }}>
                    <Button variant="primary" onClick={() => { setActiveId(t.id); setView('detail') }}>配置</Button>
                    <Button variant="ghost" onClick={() => nav(`/console/cm/report-template-preview?id=${t.id}`)}>预览</Button>
                    {perm.del && (t.status !== '已启用' && !t.isDefault) && (
                      <Button variant="ghost" onClick={() => deleteTpl(t.id)}>删除</Button>
                    )}
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && <div style={{ color: '#9CA3AF', padding: 24 }}>没有匹配的模板</div>}
          </div>
        </Panel>
        <Modal open={showNew} onClose={() => setShowNew(false)} title="新建报告模板" footer={<><Button variant="ghost" onClick={() => setShowNew(false)}>取消</Button></>}>
          <div style={{ display: 'grid', gap: 12 }}>
            {(['info_verify', 'credit', 'fraud', 'decision'] as ReportType[]).map((t) => {
              const m = REPORT_META[t]
              return (
                <button key={t} onClick={() => createNew(t)} style={{ textAlign: 'left', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', background: '#fff' }}>
                  <div style={{ fontWeight: 600 }}>{m.icon} {m.label}报告模板</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{m.hint}</div>
                </button>
              )
            })}
          </div>
        </Modal>
      </div>
    )
  }

  /* ===================== 详情配置页 ===================== */
  const sections = [...active.sections].sort((a, b) => a.order - b.order)
  const visibleCount = sections.filter((s) => s.visible).length
  const configSection = configSid ? sections.find((s) => s.id === configSid) ?? null : null
  const flowRows = active.businessFlow.slice(1).map((f, i) => ({ grade: active.scoreDisplay.grades[i], flow: f }))

  /* 右侧章节导航（仅「报告内容」Tab 渲染）：由基础信息 + content Tab 数据区块派生，动态同步增删 */
  const contentSections = sections.filter((s) => (s.homeTab ?? 'content') === 'content')
  const navCards: { id: string; label: string; tone: 'ok' | 'alert' | 'normal' }[] = [
    ...contentSections.map((s) => ({ id: s.id, label: s.name, tone: 'normal' as const })),
  ]

  /* 分段卡片渲染（报告内容 / 评分方案 / 审核操作 三 Tab 复用）：
     - content 段：可移动 / 删除 / 配置来源
     - score / flow 段（得分计算 / 结论与终审）：由已配置的数据源/规则集算得，只展示勾选项，无「配置来源」「删除」 */
  const renderSectionCard = (s: SectionConfig, opts: { showConfigBtn: boolean; showDelete: boolean; showMove: boolean }) => {
    const st = s.sourceType
    /* 本卡计分方向：扣分卡的分值一律以负数呈现（输入框、汇总、复制卡都统一带 − 号） */
    const cardDeduct = (s.cardScoreMode ?? (st === 'rule_set' ? 'deduct' : 'add')) === 'deduct'
    const stColor = st === 'data_source' ? { bg: '#ECFDF5', bd: '#A7F3D0', tx: '#047857' } : st === 'api' ? { bg: '#EFF6FF', bd: '#BFDBFE', tx: '#1D4ED8' } : st === 'tpl_copy' ? { bg: '#FFFBEB', bd: '#FDE68A', tx: '#B45309' } : { bg: '#F5F3FF', bd: '#DDD6FE', tx: '#6D28D9' }
    /* 表头 / 单元格统一样式：列宽由 colgroup 锁定，全部居中，杜绝 flex 错位 */
    const thStyle: React.CSSProperties = { textAlign: 'center', verticalAlign: 'middle', padding: '7px 6px', borderBottom: '1px solid #EEF2F7', fontWeight: 600, color: '#6B7280', fontSize: 11, whiteSpace: 'nowrap' }
    const tdStyle: React.CSSProperties = { textAlign: 'center', verticalAlign: 'middle', padding: '5px 6px', borderBottom: '1px solid #F1F5F9', fontSize: 12 }
    const disabled = opts.showMove ? (s.visible && visibleCount <= 1) : false
    const isFlash = s.id === flashId
    /* 数据源 / 接口合集内部分组（可命名）：分组元数据 + 字段归属 + 有效分组（无分组字段归入首个组） */
    const dsGroups = s.fieldGroups ?? []
    const apiGroups = s.fieldGroups ?? []
    const tableFieldsDs = s.ds?.tableFields ?? []
    const apiOutputs = s.api?.outputs ?? []
    const effGroup = (g?: string) => (g && (dsGroups.length ? dsGroups : apiGroups).find((x) => x.id === g) ? g : ((dsGroups.length ? dsGroups : apiGroups)[0]?.id ?? ''))
    /* 数据源 / 接口字段行（含可选的「分组」列，用于把字段归入某个命名子组） */
    const renderDsRow = (tf: DbField, realIdx: number) => {
      const rowOn = tf.visible
      const rowBg = tf.visible ? '#ECFDF5' : '#fff'
      const grouped = dsGroups.length > 0
      return (
        <tr key={realIdx} style={{ borderBottom: '1px solid #F1F5F9', background: rowBg, opacity: rowOn ? 1 : 0.6 }}>
          <td style={{ ...tdStyle, position: 'sticky', left: 0, zIndex: 2, background: rowBg, color: '#9CA3AF' }}>{realIdx + 1}</td>
          <td style={{ ...tdStyle, position: 'sticky', left: 40, zIndex: 2, background: rowBg }}><input type="checkbox" disabled={!canEdit} checked={tf.visible} onChange={() => toggleDsField(s.id, realIdx)} style={{ width: 16, cursor: canEdit ? 'pointer' : 'not-allowed' }} /></td>
          <td style={{ ...tdStyle, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', position: 'sticky', left: 88, zIndex: 2, background: rowBg, boxShadow: '1px 0 0 #E5E7EB' }}>{tf.name}</td>
          {grouped && (
            <td style={tdStyle}>
              <select disabled={!canEdit || !rowOn} value={effGroup(tf.group)} onChange={(e) => patchDsField(s.id, realIdx, (f) => ({ ...f, group: e.target.value || undefined }))} style={{ ...inpSm, width: '100%', fontSize: 11 }}>
                {dsGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </td>
          )}
          <td style={tdStyle}><input disabled={!canEdit || !rowOn} value={tf.label ?? ''} onChange={(e) => patchDsField(s.id, realIdx, (f) => ({ ...f, label: e.target.value }))} placeholder={tf.name} style={{ ...inpSm, width: '100%', fontSize: 12 }} /></td>
          <td style={{ ...tdStyle, color: '#6B7280' }}>{tf.type}</td>
          <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={tf.container ?? recommendDbContainer(tf.type)} onChange={(e) => patchDsField(s.id, realIdx, (f) => ({ ...f, container: e.target.value as RenderContainer }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{containerOptions(recommendDbContainer(tf.type)).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
          <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={tf.maskRule ?? 'none'} onChange={(e) => patchDsField(s.id, realIdx, (f) => ({ ...f, maskRule: e.target.value as MaskRule }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{Object.entries(MASK_RULE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
          <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={(tf.exempt ?? false) ? 'yes' : 'no'} onChange={(e) => patchDsField(s.id, realIdx, (f) => ({ ...f, exempt: e.target.value === 'yes' }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} ><option value="no">不可以</option><option value="yes">可以</option></select></td>
          <td style={tdStyle}>
            <button disabled={!canEdit || !rowOn} onClick={() => setCondEdit({ kind: 'ds', sId: s.id, index: realIdx, name: tf.name })} style={{ ...miniBtn, fontSize: 11, ...((tf.conditions?.length ?? 0) > 0 ? { borderColor: SEL, color: SEL } : {}) }}>{tf.conditions?.length ? `已配 ${tf.conditions.length} 条` : '配置条件'}</button>
          </td>
          <td style={tdStyle}><input type="number" disabled={!canEdit || !rowOn} value={cardDeduct ? -(tf.scorePoints ?? 0) : (tf.scorePoints ?? 0)} onChange={(e) => patchDsField(s.id, realIdx, (f) => ({ ...f, scorePoints: Math.abs(+e.target.value) || 0 }))} style={{ ...numSm, width: '100%', fontSize: 12, ...(cardDeduct ? { color: '#DC2626' } : {}) }} /></td>
          <td style={{ ...tdStyle, width: 10, padding: '5px 0' }} />
        </tr>
      )
    }
    const renderApiRow = (o: ApiOutput, realIdx: number) => {
      const rowOn = o.visible ?? true
      const rowBg = rowOn ? '#EFF6FF' : '#fff'
      const grouped = apiGroups.length > 0
      return (
        <tr key={realIdx} style={{ borderBottom: '1px solid #F1F5F9', background: rowBg, opacity: rowOn ? 1 : 0.6 }}>
          <td style={{ ...tdStyle, position: 'sticky', left: 0, zIndex: 2, background: rowBg, color: '#9CA3AF' }}>{realIdx + 1}</td>
          <td style={{ ...tdStyle, position: 'sticky', left: 40, zIndex: 2, background: rowBg }}><input type="checkbox" disabled={!canEdit} checked={o.visible ?? true} onChange={() => patchApi(s.id, (a) => ({ ...a, outputs: a.outputs.map((x, k) => (k === realIdx ? { ...x, visible: !x.visible } : x)) }))} style={{ width: 16, cursor: canEdit ? 'pointer' : 'not-allowed' }} /></td>
          <td style={{ ...tdStyle, position: 'sticky', left: 88, zIndex: 2, background: rowBg, boxShadow: '1px 0 0 #E5E7EB' }}><input disabled={!canEdit || !rowOn} value={o.key} onChange={(e) => patchApiOutput(s.id, realIdx, (x) => ({ ...x, key: e.target.value }))} placeholder="字段 key" style={{ ...inpSm, width: '100%', fontSize: 12 }} /></td>
          {grouped && (
            <td style={tdStyle}>
              <select disabled={!canEdit || !rowOn} value={effGroup(o.group)} onChange={(e) => patchApiOutput(s.id, realIdx, (x) => ({ ...x, group: e.target.value || undefined }))} style={{ ...inpSm, width: '100%', fontSize: 11 }}>
                {apiGroups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </td>
          )}
          <td style={tdStyle}><input disabled={!canEdit || !rowOn} value={o.label ?? ''} onChange={(e) => patchApiOutput(s.id, realIdx, (x) => ({ ...x, label: e.target.value }))} placeholder={o.key} style={{ ...inpSm, width: '100%', fontSize: 12 }} /></td>
          <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={o.type} onChange={(e) => { const t = e.target.value as ApiFieldType; patchApiOutput(s.id, realIdx, (x) => ({ ...x, type: t, container: defaultContainer(t) })) }} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{Object.entries(API_FIELD_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
          <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={o.container ?? defaultContainer(o.type)} onChange={(e) => patchApiOutput(s.id, realIdx, (x) => ({ ...x, container: e.target.value as RenderContainer }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{containerOptions(defaultContainer(o.type)).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></td>
          <td style={tdStyle}>
            <button disabled={!canEdit || !rowOn} onClick={() => setCondEdit({ kind: 'api', sId: s.id, index: realIdx, name: o.key })} style={{ ...miniBtn, fontSize: 11, ...((o.conditions?.length ?? 0) > 0 ? { borderColor: SEL, color: SEL } : {}) }}>{o.conditions?.length ? `已配 ${o.conditions.length} 条` : '配置条件'}</button>
          </td>
          <td style={tdStyle}><input type="number" disabled={!canEdit || !rowOn} value={cardDeduct ? -(o.scorePoints ?? 0) : (o.scorePoints ?? 0)} onChange={(e) => patchApiOutput(s.id, realIdx, (x) => ({ ...x, scorePoints: Math.abs(+e.target.value) || 0 }))} style={{ ...numSm, width: '100%', fontSize: 12, ...(cardDeduct ? { color: '#DC2626' } : {}) }} /></td>
          <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={(o.exempt ?? false) ? 'yes' : 'no'} onChange={(e) => patchApiOutput(s.id, realIdx, (x) => ({ ...x, exempt: e.target.value === 'yes' }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} ><option value="no">不可以</option><option value="yes">可以</option></select></td>
          <td style={tdStyle}>{canEdit && <button disabled={!rowOn} onClick={() => delApiOutput(s.id, realIdx)} style={{ ...miniBtn, color: '#DC2626', width: 28, padding: '2px 0' }}>×</button>}</td>
          <td style={{ ...tdStyle, width: 10, padding: '5px 0' }} />
        </tr>
      )
    }
    return (
      <div
        key={s.id}
        ref={(el) => { secRefs.current[s.id] = el; if (isFlash && el && typeof (el as HTMLElement).scrollIntoView === 'function') (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
        style={{ border: '1px solid #E5E7EB', borderLeft: `4px solid ${stColor.bd}`, borderRadius: 10, overflow: 'hidden', transition: 'box-shadow .3s', boxShadow: isFlash ? '0 0 0 3px rgba(59,130,246,.45)' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: stColor.bg, flexWrap: 'wrap' }}>
          {opts.showMove && canEdit && <button onClick={() => moveSection(s.id, -1)} style={miniBtn} title="上移">↑</button>}
          {opts.showMove && canEdit && <button onClick={() => moveSection(s.id, 1)} style={miniBtn} title="下移">↓</button>}
          <input type="checkbox" disabled={disabled || !canEdit} checked={s.visible} onChange={(e) => patchSection(s.id, (x) => ({ ...x, visible: e.target.checked }))} />
          <input disabled={!canEdit} value={s.name} onChange={(e) => patchSection(s.id, (x) => ({ ...x, name: e.target.value }))} style={{ ...inp, width: 190, fontWeight: 600, fontSize: 14 }} />
          <span style={{ fontSize: 12, fontWeight: 600, background: '#fff', border: `1px solid ${stColor.bd}`, color: stColor.tx, padding: '2px 8px', borderRadius: 999 }}>{SECTION_SOURCE_LABEL[st]}</span>
          {st === 'tpl_copy'
            ? <span style={{ fontSize: 12, color: '#9CA3AF' }}>集成 {(s.copySections ?? []).length} 个列表{s.copyScoreRange ? <> · 总分区间 <b style={{ color: '#B45309' }}>{s.copyScoreRange.min} ~ {s.copyScoreRange.max}</b>（基础分 {s.copyScoreRange.base}）</> : null} · 配置只读</span>
            : <span style={{ fontSize: 12, color: '#9CA3AF' }}>展示 {s.fields.filter((f) => f.visible).length}/{s.fields.length}</span>}
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {opts.showConfigBtn && (
              <button
                onClick={() => setOpenSecs((p) => { const n = new Set(p); if (n.has(s.id)) n.delete(s.id); else n.add(s.id); return n })}
                style={{ ...miniBtn, borderColor: '#CBD5E1', color: '#475569' }}
              >{openSecs.has(s.id) ? '收起 ▴' : '展开 ▾'}</button>
            )}
            {opts.showDelete && canEdit && <button onClick={() => delSection(s.id)} style={{ ...miniBtn, color: '#DC2626', borderColor: '#FECACA' }}>删除分段</button>}
            {opts.showConfigBtn && st !== 'tpl_copy' && <button onClick={() => openConfig(s.id)} style={{ ...miniBtn, borderColor: SEL, color: SEL }}>配置来源</button>}
          </div>
        </div>
        {opts.showConfigBtn && !openSecs.has(s.id) && (
          <div style={{ padding: '10px 12px', background: '#F8FAFC', borderTop: '1px solid #F1F5F9', fontSize: 12, color: '#9CA3AF' }}>
            已收起 · 共 {s.fields.length} 个字段 / {s.ds?.tableFields.length ?? 0} 表字段 / {s.api?.outputs.length ?? 0} 输出项，点击右侧「展开 ▾」查看与编辑
          </div>
        )}
        <div style={{ padding: '10px 12px', background: '#fff', borderTop: '1px solid #F1F5F9', display: (opts.showConfigBtn && !openSecs.has(s.id)) ? 'none' : 'block' }}>
          {st === 'tpl_copy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontSize: 12, color: '#9CA3AF' }}>来源模板：{s.copyFromName ?? s.sourceName}（全量集成「报告内容配置」，只读不可修改；如需调整请到原模板修改后删除本卡重新复制）</div>
              {(s.copySections ?? []).map((cs) => {
                /* 分值优先取来源编辑对象（DbField/ApiOutput），缺省回落到 FieldConfig（种子分值都在这里），保证每个 item 都有分 */
                const rows: { name: string; pts: number; on: boolean }[] = cs.sourceType === 'data_source'
                  ? (cs.ds?.tableFields ?? []).map((f) => ({ name: f.label ?? f.name, pts: f.scorePoints ?? cs.fields.find((x) => x.sourceRef === f.name)?.scorePoints ?? 0, on: f.visible }))
                  : cs.sourceType === 'api'
                    ? (cs.api?.outputs ?? []).map((o) => ({ name: o.label || o.key, pts: o.scorePoints ?? cs.fields.find((x) => x.sourceRef === o.key)?.scorePoints ?? 0, on: o.visible !== false }))
                    : cs.fields.map((f) => ({ name: f.name, pts: f.scorePoints ?? 0, on: f.visible }))
                const shown = rows.filter((r) => r.on)
                const csDeduct = (cs.cardScoreMode ?? (cs.sourceType === 'rule_set' ? 'deduct' : 'add')) === 'deduct'
                return (
                  <div key={cs.id} style={{ border: '1px solid #F1F5F9', borderRadius: 8, overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F8FAFC', fontSize: 12 }}>
                      <b style={{ color: '#374151' }}>{cs.name}</b>
                      <span style={{ color: '#9CA3AF' }}>{SECTION_SOURCE_LABEL[cs.sourceType]}</span>
                      <span style={{ marginLeft: 'auto', color: '#9CA3AF' }}>展示 {shown.length}/{rows.length} 项</span>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '8px 10px' }}>
                      {shown.map((r, i) => (
                        <span key={i} style={{ fontSize: 12, padding: '2px 8px', borderRadius: 999, background: '#fff', border: '1px solid #E5E7EB', color: '#374151' }}>
                          {r.name}<b style={{ marginLeft: 4, color: csDeduct ? '#DC2626' : '#B45309' }}>{csDeduct ? '−' : ''}{r.pts}分</b>
                        </span>
                      ))}
                      {shown.length === 0 && <span style={{ fontSize: 12, color: '#9CA3AF' }}>（无展示项）</span>}
                    </div>
                  </div>
                )
              })}
              {(s.copySections ?? []).length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>来源模板没有报告内容分段。</div>}
            </div>
          )}
          {st === 'data_source' && (
            <div>
              {(s.ds?.tableFields ?? []).length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>尚未读取表结构{opts.showConfigBtn ? '，点右上「配置来源」连接数据库并读取字段。' : '。'}</div>}
              {canEdit && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {dsGroups.length > 0 && <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>内部分组：</span>}
                  {dsGroups.map((g) => (
                    <span key={g.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: '#F1F5F9', border: '1px solid #E5E7EB', borderRadius: 6, padding: '2px 4px 2px 6px' }}>
                      <input value={g.name} onChange={(e) => renameFieldGroup(s.id, g.id, e.target.value)} style={{ ...inpSm, width: 92, fontSize: 12, border: 'none', background: 'transparent', fontWeight: 600 }} />
                      <button onClick={() => delFieldGroup(s.id, g.id)} style={{ ...miniBtn, color: '#DC2626', padding: '0 4px', border: 'none', background: 'transparent' }} title="删除分组（组内字段并入首个分组）">×</button>
                    </span>
                  ))}
                  <button onClick={() => addFieldGroup(s.id)} style={{ ...miniBtn, fontSize: 12 }}>+ 添加分组</button>
                </div>
              )}
              <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: dsGroups.length > 0 ? 980 : 900, borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed', border: '1px solid #EEF2F7', borderRadius: 8, overflow: 'hidden' }}>
                <colgroup>
                  <col style={{ width: 40 }} />
                  <col style={{ width: 48 }} />
                  <col style={{ width: 120 }} />
                  {dsGroups.length > 0 && <col style={{ width: 110 }} />}
                  <col style={{ width: 120 }} />
                  <col style={{ width: 64 }} />
                  <col style={{ width: 108 }} />
                  <col style={{ width: 96 }} />
                  <col style={{ width: 72 }} />
                  <col style={{ width: 88 }} />
                  <col style={{ width: 88 }} />
                  <col style={{ width: 60 }} />
                  <col style={{ width: 10 }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ ...thStyle, position: 'sticky', left: 0, zIndex: 3, background: '#F1F5F9' }}>序号</th>
                    <th style={{ ...thStyle, position: 'sticky', left: 40, zIndex: 3, background: '#F1F5F9' }}>启用</th>
                    <th style={{ ...thStyle, position: 'sticky', left: 88, zIndex: 3, background: '#F1F5F9', boxShadow: '1px 0 0 #E5E7EB' }}>字段名（原始）</th>
                    {dsGroups.length > 0 && <th style={thStyle}>分组</th>}
                    <th style={thStyle}>显示标签</th>
                    <th style={thStyle}>类型</th>
                    <th style={thStyle}>显示方式</th>
                    <th style={thStyle}>脱敏规则</th>
                    <th style={thStyle}>豁免</th>
                    <th style={thStyle}>条件配置</th>
                    <th style={thStyle}>分值</th>
                    <th style={{ ...thStyle, width: 10, padding: '7px 0' }} />
                  </tr>
                </thead>
                <tbody>
                  {dsGroups.length > 0 ? (
                    dsGroups.map((g) => {
                      const grpRows = tableFieldsDs.map((tf, realIdx) => ({ tf, realIdx })).filter(({ tf }) => effGroup(tf.group) === g.id)
                      const shown = grpRows.filter(({ tf }) => tf.visible).length
                      return (
                        <Fragment key={g.id}>
                          <tr>
                            <td colSpan={12} style={{ background: '#F1F5F9', padding: '5px 10px', fontSize: 12, fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                              {g.name}<span style={{ marginLeft: 8, color: '#9CA3AF', fontWeight: 400 }}>展示 {shown}/{grpRows.length} 项</span>
                            </td>
                          </tr>
                          {grpRows.map(({ tf, realIdx }) => renderDsRow(tf, realIdx))}
                        </Fragment>
                      )
                    })
                  ) : (
                    tableFieldsDs.map((tf, realIdx) => renderDsRow(tf, realIdx))
                  )}
                </tbody>
              </table>
              </div>
            </div>
          )}
          {st === 'api' && (
            <div>
              {(s.api?.outputs ?? []).length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>暂无输出字段，点右下「＋ 输出字段」添加。</div>}
              {canEdit && (
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  {apiGroups.length > 0 && <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>内部分组：</span>}
                  {apiGroups.map((g) => (
                    <span key={g.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, background: '#F1F5F9', border: '1px solid #E5E7EB', borderRadius: 6, padding: '2px 4px 2px 6px' }}>
                      <input value={g.name} onChange={(e) => renameFieldGroup(s.id, g.id, e.target.value)} style={{ ...inpSm, width: 92, fontSize: 12, border: 'none', background: 'transparent', fontWeight: 600 }} />
                      <button onClick={() => delFieldGroup(s.id, g.id)} style={{ ...miniBtn, color: '#DC2626', padding: '0 4px', border: 'none', background: 'transparent' }} title="删除分组（组内字段并入首个分组）">×</button>
                    </span>
                  ))}
                  <button onClick={() => addFieldGroup(s.id)} style={{ ...miniBtn, fontSize: 12 }}>+ 添加分组</button>
                </div>
              )}
              <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: apiGroups.length > 0 ? 1000 : 920, borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed', border: '1px solid #EEF2F7', borderRadius: 8, overflow: 'hidden' }}>
                <colgroup>
                  <col style={{ width: 40 }} />
                  <col style={{ width: 48 }} />
                  <col style={{ width: 110 }} />
                  {apiGroups.length > 0 && <col style={{ width: 110 }} />}
                  <col style={{ width: 120 }} />
                  <col style={{ width: 96 }} />
                  <col style={{ width: 96 }} />
                  <col style={{ width: 84 }} />
                  <col style={{ width: 56 }} />
                  <col style={{ width: 72 }} />
                  <col style={{ width: 36 }} />
                  <col style={{ width: 10 }} />
                </colgroup>
                <thead>
                  <tr style={{ background: '#F8FAFC' }}>
                    <th style={{ ...thStyle, position: 'sticky', left: 0, zIndex: 3, background: '#F1F5F9' }}>序号</th>
                    <th style={{ ...thStyle, position: 'sticky', left: 40, zIndex: 3, background: '#F1F5F9' }}>启用</th>
                    <th style={{ ...thStyle, position: 'sticky', left: 88, zIndex: 3, background: '#F1F5F9', boxShadow: '1px 0 0 #E5E7EB' }}>字段 key</th>
                    {apiGroups.length > 0 && <th style={thStyle}>分组</th>}
                    <th style={thStyle}>显示标签</th>
                    <th style={thStyle}>类型</th>
                    <th style={thStyle}>显示方式</th>
                    <th style={thStyle}>条件配置</th>
                    <th style={thStyle}>分值</th>
                    <th style={thStyle}>豁免</th>
                    <th style={thStyle}>操作</th>
                    <th style={{ ...thStyle, width: 10, padding: '7px 0' }} />
                  </tr>
                </thead>
                <tbody>
                  {apiGroups.length > 0 ? (
                    apiGroups.map((g) => {
                      const grpRows = apiOutputs.map((o, realIdx) => ({ o, realIdx })).filter(({ o }) => effGroup(o.group) === g.id)
                      const shown = grpRows.filter(({ o }) => o.visible !== false).length
                      return (
                        <Fragment key={g.id}>
                          <tr>
                            <td colSpan={12} style={{ background: '#F1F5F9', padding: '5px 10px', fontSize: 12, fontWeight: 600, color: '#374151', borderBottom: '1px solid #E5E7EB' }}>
                              {g.name}<span style={{ marginLeft: 8, color: '#9CA3AF', fontWeight: 400 }}>展示 {shown}/{grpRows.length} 项</span>
                            </td>
                          </tr>
                          {grpRows.map(({ o, realIdx }) => renderApiRow(o, realIdx))}
                        </Fragment>
                      )
                    })
                  ) : (
                    apiOutputs.map((o, realIdx) => renderApiRow(o, realIdx))
                  )}
                </tbody>
              </table>
              </div>
              {canEdit && <button onClick={() => addApiOutput(s.id)} style={{ ...miniBtn, marginTop: 6 }}>＋ 输出字段</button>}
            </div>
          )}
          {st === 'rule_set' && (
            <div>
              {(!s.ruleSetId || s.fields.length === 0) && <div style={{ fontSize: 12, color: '#9CA3AF' }}>尚未选择规则合集{opts.showConfigBtn ? '，点右上「配置来源」选择并勾选用/不用的规则项。' : '。'}</div>}
              {s.ruleSetId && s.fields.length > 0 && (
                <div>
                  <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: 820, borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed', border: '1px solid #EEF2F7', borderRadius: 8, overflow: 'hidden' }}>
                    <colgroup>
                      <col style={{ width: 40 }} />
                      <col style={{ width: 48 }} />
                      <col style={{ width: 130 }} />
                      <col style={{ width: 64 }} />
                      <col style={{ width: 80 }} />
                      <col style={{ width: 80 }} />
                      <col style={{ width: 72 }} />
                      <col style={{ width: 88 }} />
                      <col style={{ width: 60 }} />
                      <col style={{ width: 10 }} />
                    </colgroup>
                    <thead>
                      <tr style={{ background: '#F8FAFC' }}>
                        <th style={{ ...thStyle, position: 'sticky', left: 0, zIndex: 3, background: '#F1F5F9' }}>序号</th>
                        <th style={{ ...thStyle, position: 'sticky', left: 40, zIndex: 3, background: '#F1F5F9' }}>启用</th>
                        <th style={{ ...thStyle, position: 'sticky', left: 88, zIndex: 3, background: '#F1F5F9', boxShadow: '1px 0 0 #E5E7EB' }}>规则名</th>
                        <th style={thStyle}>权重</th>
                        <th style={thStyle}>风险等级</th>
                        <th style={thStyle}>命中即拒</th>
                        <th style={thStyle}>豁免</th>
                        <th style={thStyle}>条件配置</th>
                        <th style={thStyle}>分值</th>
                        <th style={{ ...thStyle, width: 10, padding: '7px 0' }} />
                      </tr>
                    </thead>
                    <tbody>
                      {s.fields.map((f, idx) => {
                        const rowOn = f.visible
                        const rowBg = f.visible ? '#F5F3FF' : '#fff'
                        return (
                        <tr key={f.id} style={{ borderBottom: '1px solid #F1F5F9', background: rowBg, opacity: rowOn ? 1 : 0.6 }}>
                          <td style={{ ...tdStyle, position: 'sticky', left: 0, zIndex: 2, background: rowBg, color: '#9CA3AF' }}>{idx + 1}</td>
                          <td style={{ ...tdStyle, position: 'sticky', left: 40, zIndex: 2, background: rowBg }}><input type="checkbox"  disabled={!canEdit} checked={f.visible} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, visible: e.target.checked }))} style={{ width: 16, cursor: canEdit ? 'pointer' : 'not-allowed' }} /></td>
                          <td style={{ ...tdStyle, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', position: 'sticky', left: 88, zIndex: 2, background: rowBg, boxShadow: '1px 0 0 #E5E7EB' }}>{f.name}</td>
                          <td style={tdStyle}><input disabled={!canEdit || !rowOn} type="number" value={f.weight ?? 0} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, weight: +e.target.value || 0 }))}  style={{ ...inpSm, width: '100%', fontSize: 12 }} /></td>
                          <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={f.severity ?? 'mid'} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, severity: e.target.value as Severity }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{Object.entries(SEVERITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
                          <td style={tdStyle}><input type="checkbox" disabled={!canEdit || !rowOn} checked={f.hitReject ?? false} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, hitReject: e.target.checked }))}  style={{ width: 16, cursor: canEdit ? 'pointer' : 'not-allowed' }} /></td>
                          <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={(f.exempt ?? false) ? 'yes' : 'no'} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, exempt: e.target.value === 'yes' }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} ><option value="no">不可以</option><option value="yes">可以</option></select></td>
                          <td style={tdStyle}>
                            <button disabled={!canEdit || !rowOn} onClick={() => setCondEdit({ kind: 'rule', sId: s.id, fid: f.id, name: f.name })} style={{ ...miniBtn, fontSize: 11, ...((f.conditions?.length ?? 0) > 0 ? { borderColor: SEL, color: SEL } : {}) }}>{f.conditions?.length ? `已配 ${f.conditions.length} 条` : '配置条件'}</button>
                          </td>
                          <td style={tdStyle}><input type="number" disabled={!canEdit || !rowOn} value={-(f.scorePoints ?? 0)} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, scorePoints: Math.abs(+e.target.value) || 0 }))}  style={{ ...numSm, width: '100%', fontSize: 12, color: '#DC2626' }} /></td>
                          <td style={{ ...tdStyle, width: 10, padding: '5px 0' }} />
                        </tr>
                        )
                      })}
                    </tbody>
                  </table>
                  </div>
                </div>
              )}
            </div>
          )}
          {/* —— 本卡总分（按卡片级计分方向与各展示项计分配置自动汇总，只读） —— */}
          <div style={{ padding: '8px 12px', background: '#F8FAFC', borderTop: '1px dashed #E5E7EB', display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
            {(() => {
              {/* 仅展示提示已按需求移除：所有内容分段均参与评分 */}
              const r = computeSectionScore(s)
              if (r.mode === 'reject') {
                return (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>计分方式</span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#DC2626' }}>命中即拒</span>
                    <span style={{ fontSize: 12, color: '#6B7280' }}>任一启用项命中即直接拒绝申请，不参与加减分</span>
                  </div>
                )
              }
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>分值区间</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: r.mode === 'deduct' ? '#DC2626' : '#047857' }}>
                    {r.mode === 'deduct' ? `−${Math.abs(r.total)}` : '0'} ～ {r.mode === 'deduct' ? '0' : Math.abs(r.total)}
                  </span>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>（{r.mode === 'add' ? '达标加分' : '命中扣分'} {r.mode === 'add' ? r.addCount : r.deductCount} 项；命中即拒项不计入）</span>
                </div>
              )
            })()}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>权重</span>
              <input type="number" step="0.1" min="0" disabled={!canEdit} value={s.weight ?? 1} onChange={(e) => patchSection(s.id, (x) => ({ ...x, weight: +e.target.value || 0 }))} style={{ ...inpSm, width: 64 }} />
              <span style={{ fontSize: 12, color: '#6B7280' }}>（报告总分 = 基础分 + Σ 各卡计分 × 权重）</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      {condEdit && (
        <ConditionModal
          open
          title={`配置条件 · ${condEdit.name}`}
          conditions={getCondList(condEdit)}
          fieldOptions={getCondFields(condEdit)}
          valueOptions={(() => {
            const sec = getCondSection(condEdit.sId)
            if (condEdit.kind === 'ds') return sec.ds?.tableFields[condEdit.index ?? -1]?.options
            if (condEdit.kind === 'api') return sec.api?.outputs[condEdit.index ?? -1]?.options
            return sec.fields.find((f) => f.id === condEdit.fid)?.options
          })()}
          ops={getCondOps(condEdit.kind)}
          onSave={(list) => applyCondList(condEdit, list)}
          onClose={() => setCondEdit(null)}
        />
      )}
      <DetailHeader title={active.name} crumb="公共配置 / 报告模板" subtitle={`${REPORT_META[active.reportType].label} · ${active.version} · 适用 ${scopeLabel(active.scope)}`}
        backLabel="返回列表" onBack={() => setView('list')}
        actions={
          <>
            <Button variant="primary" onClick={() => nav(`/console/cm/report-template-preview?id=${active.id}`, { state: { tpl: active } })}>预览</Button>
            {canEdit && <Button variant="secondary" onClick={saveDraft}>保存</Button>}
            {canEdit && <Button variant="secondary" onClick={publishNewVersion}>发布新版本</Button>}
            {perm.enable && active.status !== '已启用' && <Button variant="secondary" onClick={() => changeStatus('已启用')}>启用</Button>}
            {perm.enable && active.status === '已启用' && <Button variant="secondary" onClick={() => changeStatus('已停用')}>停用</Button>}
            {perm.setDefault && !active.isDefault && <Button variant="secondary" onClick={setDefault}>设为默认</Button>}
            {canEdit && <Button variant="secondary" onClick={copyTpl}>复制</Button>}
            {perm.del && active.status !== '已启用' && !active.isDefault && <Button variant="ghost" onClick={() => deleteTpl(active.id)}>删除</Button>}
          </>
        } />
      {/* 数据来源图例（第 2 条：报告模板详情/预览的数据来源标注，与报告详情页标签一致） */}
      <div style={{ margin: '10px 0', fontSize: 11, color: '#6B7280', display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span>数据来源：</span>
        <span style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD', fontFamily: 'monospace', padding: '0 4px', borderRadius: 2 }}>蓝=模板配置</span>
        <span style={{ background: '#FFF7ED', color: '#C2410C', border: '1px solid #FDBA74', fontFamily: 'monospace', padding: '0 4px', borderRadius: 2 }}>橙=本地JSON样例(samples/sample-{active.id}.json)</span>
        <span style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB', fontFamily: 'monospace', padding: '0 4px', borderRadius: 2 }}>灰=实时算法</span>
      </div>
      <div>
        <div className="min-w-0">
          {/* 基础信息（默认收起，缩略显示；展开可编辑、可收起） */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-card" ref={(el) => { secRefs.current['__basic'] = el }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: basicExpanded ? '1px solid #F1F5F9' : 'none' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#111827' }}>基础信息</span>
              <button
                onClick={() => setBasicExpanded((v) => !v)}
                style={{ border: '1px solid #E5E7EB', borderRadius: 8, padding: '4px 10px', fontSize: 13, color: '#374151', background: '#fff', cursor: 'pointer' }}
              >{basicExpanded ? '收起 ▴' : '展开编辑 ▾'}</button>
            </div>
            {basicExpanded ? (
              <div style={{ padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <Field label="模板名称" ><input disabled={!canEdit} value={active.name} onChange={(e) => patch((t) => ({ ...t, name: e.target.value }))} style={inp} /></Field>
              <Field label="报告类型"><input disabled value={REPORT_META[active.reportType].icon + ' ' + REPORT_META[active.reportType].label} style={{ ...inp, background: '#F3F4F6' }} /></Field>
              <Field label="适用产品" hint="大平台产品分两级类目，可搜索、按类目整类勾选；「全产品」为互斥项，选中即覆盖其余选择。">
                <SearchSelect
                  multiple
                  fullWidth
                  disabled={!canEdit}
                  pinned={[{ value: PRODUCT_ALL, label: '全产品（全部适用）' }]}
                  groups={PRODUCT_TREE.map((c) => ({ key: c.id, label: c.name }))}
                  options={PRODUCT_LEAVES.map((l) => ({ value: l.name, label: l.name, group: l.catId }))}
                  value={active.scope}
                  exclusiveValues={[PRODUCT_ALL]}
                  placeholder="选择适用产品"
                  searchPlaceholder="搜索产品名称…"
                  onChange={(v) => patch((t) => ({ ...t, scope: v as string[] }))}
                />
              </Field>
              <Field label="模板状态">
                <SingleSelect label="" value={active.status} options={(['草稿', '已启用', '已停用'] as TplStatus[]).map((s) => ({ value: s, label: s }))}
                  onChange={(v) => changeStatus(v as TplStatus)} fullWidth />
              </Field>
              <Field label="设为默认模板">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" disabled={!perm.setDefault} checked={active.isDefault} onChange={setDefault} />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{active.isDefault ? '当前为默认模板（新进入件默认使用）' : '设为该报告类型的默认模板'}</span>
                </label>
              </Field>
              <Field label="在报告中显示操作日志">
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" disabled={!canEdit} checked={active.showOpLog} onChange={(e) => patch((t) => ({ ...t, showOpLog: e.target.checked }))} />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{active.showOpLog ? '显示' : '不显示'}</span>
                </label>
              </Field>
              <Field label="模板描述" full>
                <textarea disabled={!canEdit} value={active.description} onChange={(e) => patch((t) => ({ ...t, description: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} />
              </Field>
            </div>
              </div>
            ) : (
              <div style={{ padding: '12px 16px', fontSize: 13, color: '#6B7280' }}>
                模板名称：{active.name} · 报告类型：{REPORT_META[active.reportType].label} · 状态：{active.status}{active.isDefault ? ' · 默认模板' : ''} · 适用：{active.scope.includes(PRODUCT_ALL) ? '全产品' : `${active.scope.length} 个产品`} · 操作日志：{active.showOpLog ? '显示' : '不显示'}
              </div>
            )}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 16, borderBottom: '1px solid #E5E7EB', marginBottom: 14 }}>
            {([['content', '报告内容'], ['score', '自动审核'], ['flow', '人工审核']] as [any, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 16px', border: 'none', borderBottom: tab === k ? '2px solid #3B82F6' : '2px solid transparent', background: 'none', fontWeight: tab === k ? 700 : 400, color: tab === k ? '#1D4ED8' : '#6B7280', cursor: 'pointer' }}>{label}</button>
            ))}
          </div>

          {tab === 'content' && (
            <div className="lg:flex lg:gap-6">
              <div className="min-w-0 flex-1">
                <Panel title="报告内容配置">
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                    {canEdit && (
                      <div style={{ display: 'flex', gap: 8 }}>
                        {(['data_source', 'api', 'rule_set'] as SectionSource[]).map((st) => (
                          <button key={st} onClick={() => addSection(st)} style={miniBtn}>＋ {SECTION_SOURCE_LABEL[st]}</button>
                        ))}
                        <button onClick={() => setCopyPick(true)} style={{ ...miniBtn, borderColor: '#FDE68A', color: '#B45309' }}>＋ 复制现有模板</button>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sections.filter((s) => (s.homeTab ?? 'content') === 'content').map((s) => renderSectionCard(s, { showConfigBtn: true, showDelete: true, showMove: true }))}
                  </div>
                </Panel>
              </div>
              {/* 右侧章节导航：属于「报告内容」Tab 内容块内部，样式与贷前报告详情一致（状态色点 + 滚动锚点） */}
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
                        onClick={() => secRefs.current[c.id]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
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
          )}

          {/* 复制现有模板弹窗：选择来源模板，整卡集成其报告内容配置（只读） */}
          <Modal open={copyPick} onClose={() => setCopyPick(false)} title="复制现有模板 · 选择来源" width="max-w-md">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {templates.filter((t) => t.id !== active.id).map((t) => {
                const n = t.sections.filter((x) => (x.homeTab ?? 'content') === 'content').length
                return (
                  <button key={t.id} onClick={() => addTplCopySection(t)} style={{ ...miniBtn, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', textAlign: 'left' }}>
                    <span style={{ fontWeight: 600 }}>{t.name}</span>
                    <span style={{ color: '#9CA3AF', fontSize: 12 }}>内容分段 {n} 个</span>
                  </button>
                )
              })}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#9CA3AF' }}>复制来源模板「报告内容配置」的全部分段，在本模板中合成一个只读卡片（一个卡片、多个列表），配置全部集成、不可修改。</div>
          </Modal>

          {/* 特殊命中规则 · 选择规则项弹窗：只列「报告内容配置」里已启用分段的已勾选展示项 */}
          <Modal open={specialPick} onClose={() => setSpecialPick(false)} title="添加特殊命中规则 · 选择规则项" width="max-w-lg">
            <div style={{ maxHeight: 420, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {specialCandidates.length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>「报告内容配置」里还没有可选的展示项。</div>}
              {specialCandidates.map((g) => (
                <div key={g.sectionId}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                    {g.sectionName}
                    <span style={{ marginLeft: 6, fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}>{SECTION_SOURCE_LABEL[g.sourceType] ?? ''}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {g.items.map((it) => {
                      const used = (active.specialRules ?? []).some((r) => r.sectionId === g.sectionId && r.fieldId === it.id)
                      return (
                        <button key={it.id} disabled={used}
                          onClick={() => { addSpecial(g.sectionId, it.id, g.sectionName, it.name); setSpecialPick(false) }}
                          style={{ ...miniBtn, ...(used ? { color: '#9CA3AF', borderColor: '#E5E7EB', cursor: 'not-allowed', background: '#F9FAFB' } : {}) }}>
                          {it.name}{used ? ' · 已添加' : ''}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: 12, color: '#9CA3AF' }}>选中后即加入下方清单，可再配置触发条件（命中/未命中）、对应审核结果与优先级（决定规则/预警规则）。</div>
          </Modal>

          {/* 配置来源弹窗：把连接/接口/规则集等「配置项」集中到弹窗，与卡片上的「展示项」分离 */}
          <Modal open={!!configSection} onClose={() => { setConfigSid(null); setTestResult(null) }} title={configSection ? `配置来源 · ${configSection.name}` : ''} width="max-w-2xl">
            {configSection && (() => {
              const s = configSection
              const st = s.sourceType
              return (
                <div>
                  {st === 'data_source' && (
                    <div>
                      <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>① 配置数据库连接（IP / 端口 / 账号 / 库 / 表）</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                        <Field label="数据库类型"><select disabled={!canEdit} value={s.ds?.dbType ?? 'MySQL'} onChange={(e) => patchDs(s.id, (d) => ({ ...d, dbType: e.target.value }))} style={inp}>{DB_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}</select></Field>
                        <Field label="IP 地址"><input disabled={!canEdit} value={s.ds?.ip ?? ''} onChange={(e) => patchDs(s.id, (d) => ({ ...d, ip: e.target.value }))} placeholder="如 10.0.12.5" style={inp} /></Field>
                        <Field label="端口"><input disabled={!canEdit} value={s.ds?.port ?? ''} onChange={(e) => patchDs(s.id, (d) => ({ ...d, port: e.target.value }))} placeholder="3306" style={inp} /></Field>
                        <Field label="用户名"><input disabled={!canEdit} value={s.ds?.username ?? ''} onChange={(e) => patchDs(s.id, (d) => ({ ...d, username: e.target.value }))} style={inp} /></Field>
                        <Field label="密码"><input type="password" disabled={!canEdit} value={s.ds?.password ?? ''} onChange={(e) => patchDs(s.id, (d) => ({ ...d, password: e.target.value }))} placeholder="******" style={inp} /></Field>
                        <Field label="数据库名"><input disabled={!canEdit} value={s.ds?.database ?? ''} onChange={(e) => patchDs(s.id, (d) => ({ ...d, database: e.target.value }))} placeholder="risk_db" style={inp} /></Field>
                        <Field label="表名"><input disabled={!canEdit} value={s.ds?.table ?? ''} onChange={(e) => patchDs(s.id, (d) => ({ ...d, table: e.target.value }))} placeholder="applicant_info" style={inp} /></Field>
                      </div>
                      <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
                        {canEdit && <button onClick={() => readTable(s.id)} style={{ ...miniBtn, borderColor: SEL, color: SEL }}>读取表字段</button>}
                        {canEdit && <button onClick={() => runTest(s)} disabled={testing} style={{ ...miniBtn, borderColor: '#047857', color: '#047857' }}>{testing ? '测试中…' : '测试连接'}</button>}
                      </div>
                    </div>
                  )}
                  {st === 'api' && (
                    <div>
                      {/* ① 请求栏：方法 + 地址（Postman 风格） */}
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
                        <select disabled={!canEdit} value={s.api?.method ?? 'POST'} onChange={(e) => patchApi(s.id, (a) => ({ ...a, method: e.target.value as ApiMethod }))} style={{ ...inp, width: 110, flex: '0 0 auto', fontWeight: 600 }}>
                          {(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as ApiMethod[]).map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <input disabled={!canEdit} value={s.api?.url ?? ''} onChange={(e) => patchApi(s.id, (a) => ({ ...a, url: e.target.value }))} placeholder="https://api.xxx.com/v1/score" style={{ ...inp, flex: 1 }} />
                      </div>

                      {/* Tabs：参数 / 请求头 / 请求体 / 代码 */}
                      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E5E7EB', marginBottom: 12 }}>
                        {([['params', '参数 Params'], ['headers', '请求头 Headers'], ['body', '请求体 Body'], ['code', '代码 Code']] as [any, string][]).map(([k, label]) => (
                          <button key={k} onClick={() => setApiTab(k)} style={{ padding: '8px 14px', border: 'none', borderBottom: apiTab === k ? '2px solid #3B82F6' : '2px solid transparent', background: 'none', fontWeight: apiTab === k ? 700 : 400, color: apiTab === k ? '#1D4ED8' : '#6B7280', cursor: 'pointer' }}>{label}</button>
                        ))}
                      </div>

                      {apiTab === 'params' && (
                        <div>
                          <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>访问的用户基本信息（输入参数 = Params）</div>
                          {(s.api?.inputs ?? []).map((p, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                              <input disabled={!canEdit} value={p.key} onChange={(e) => patchApiInput(s.id, idx, (x) => ({ ...x, key: e.target.value }))} placeholder="参数 key" style={{ ...inpSm, width: 130 }} />
                              <span style={{ color: '#9CA3AF' }}>←</span>
                              <input disabled={!canEdit} value={p.from} onChange={(e) => patchApiInput(s.id, idx, (x) => ({ ...x, from: e.target.value }))} placeholder="数据来自（如 进件表单.申请人ID）" style={inpSm} />
                              <label style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 12, color: '#6B7280' }}><input type="checkbox" disabled={!canEdit} checked={p.required} onChange={(e) => patchApiInput(s.id, idx, (x) => ({ ...x, required: e.target.checked }))} />必填</label>
                              {canEdit && <button onClick={() => delApiInput(s.id, idx)} style={{ ...miniBtn, color: '#DC2626' }}>×</button>}
                            </div>
                          ))}
                          {canEdit && <button onClick={() => addApiInput(s.id)} style={miniBtn}>＋ 输入参数</button>}
                        </div>
                      )}

                      {apiTab === 'headers' && (
                        <div>
                          <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>请求头（Headers）</div>
                          {(s.api?.headers ?? []).length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 6 }}>暂无请求头，点「＋ 请求头」添加。</div>}
                          {(s.api?.headers ?? []).map((h, idx) => (
                            <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                              <input disabled={!canEdit} value={h.key} onChange={(e) => patchApiHeader(s.id, idx, (x) => ({ ...x, key: e.target.value }))} placeholder="Header 名（如 Authorization）" style={{ ...inpSm, width: 160 }} />
                              <input disabled={!canEdit} value={h.value} onChange={(e) => patchApiHeader(s.id, idx, (x) => ({ ...x, value: e.target.value }))} placeholder="Header 值" style={inpSm} />
                              {canEdit && <button onClick={() => delApiHeader(s.id, idx)} style={{ ...miniBtn, color: '#DC2626' }}>×</button>}
                            </div>
                          ))}
                          {canEdit && <button onClick={() => addApiHeader(s.id)} style={miniBtn}>＋ 请求头</button>}
                        </div>
                      )}

                      {apiTab === 'body' && (
                        <div>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>请求体类型：</span>
                            {(['none', 'json', 'form', 'urlencoded'] as ApiBodyType[]).map((b) => (
                              <button key={b} disabled={!canEdit} onClick={() => patchApi(s.id, (a) => ({ ...a, bodyType: b }))} style={{ padding: '4px 12px', borderRadius: 8, border: `1px solid ${s.api?.bodyType === b ? SEL : '#D1D5DB'}`, background: s.api?.bodyType === b ? SEL_BG : '#fff', cursor: canEdit ? 'pointer' : 'default', fontSize: 13 }}>{b === 'none' ? '无' : b === 'json' ? 'JSON' : b === 'form' ? 'form-data' : 'x-www-form'}</button>
                            ))}
                          </div>
                          {s.api?.bodyType !== 'none' ? (
                            <textarea disabled={!canEdit} value={s.api?.bodyText ?? ''} onChange={(e) => patchApi(s.id, (a) => ({ ...a, bodyText: e.target.value }))} rows={6} placeholder={s.api?.bodyType === 'json' ? '{\n  "applicantId": "{{进件表单.申请人ID}}"\n}' : 'key1=value1&key2=value2'} style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
                          ) : (
                            <div style={{ fontSize: 12, color: '#9CA3AF' }}>该接口无需请求体（如 GET 查询）。</div>
                          )}
                        </div>
                      )}

                      {apiTab === 'code' && (
                        <div>
                          <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>直接粘贴「统一代码」一键填充（支持 cURL / 类 HTTP 请求串）；或点「用当前配置生成代码」反向导出。</div>
                          <textarea disabled={!canEdit} value={apiCode} onChange={(e) => setApiCode(e.target.value)} rows={6} placeholder={'curl -X POST https://api.xxx.com/v1/score \\\n  -H "Content-Type: application/json" \\\n  -d \'{"applicantId":"..."}\''} style={{ ...inp, resize: 'vertical', fontFamily: 'monospace', fontSize: 13 }} />
                          <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                            {canEdit && <button onClick={() => { const p = parseCurl(apiCode); if (Object.keys(p).length) { patchApi(s.id, (a) => ({ ...a, ...p })); setApiTab('params') } else window.alert('未能从代码解析出接口配置，请检查格式（示例：curl -X POST url -H "K: V" -d \'{...}\'）') }} style={{ ...miniBtn, borderColor: '#1D4ED8', color: '#1D4ED8' }}>解析并填充配置</button>}
                            {canEdit && <button onClick={() => setApiCode(buildCurl(s.api))} style={miniBtn}>用当前配置生成代码</button>}
                          </div>
                        </div>
                      )}

                      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        {canEdit && <button onClick={() => runTest(s)} disabled={testing} style={{ ...miniBtn, borderColor: '#1D4ED8', color: '#1D4ED8' }}>{testing ? '测试中…' : '测试接口'}</button>}
                      </div>
                    </div>
                  )}
                  {st === 'rule_set' && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>选择规则合集：</span>
                        <RuleSetSearchSelect value={s.ruleSetId ?? ''} onChange={(v) => selectRuleSet(s.id, v)} disabled={!canEdit} />
                      </div>
                      {(!s.ruleSetId || s.fields.length === 0) && <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 8 }}>请选择规则合集，下方将列出该合集的规则项。</div>}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 6 }}>
                        {s.fields.map((f) => (
                          <div key={f.id} style={{ border: '1px solid #EEF2F7', borderRadius: 8, padding: 8, background: f.visible ? '#F5F3FF' : '#F9FAFB' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <input type="checkbox" disabled={!canEdit} checked={f.visible} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, visible: e.target.checked }))} />
                              <span style={{ fontWeight: 600, fontSize: 13 }}>{f.name}</span>
                              <span style={{ fontSize: 11, color: '#9CA3AF' }}>{f.desc}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: '#6B7280', width: 56, flex: '0 0 auto' }}>命中显示</span>
                              <input disabled={!canEdit} value={f.hitText ?? ''} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, hitText: e.target.value }))} placeholder="如：命中" style={inpSm} />
                            </div>
                            <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                              <span style={{ fontSize: 11, color: '#6B7280', width: 56, flex: '0 0 auto' }}>未命中</span>
                              <input disabled={!canEdit} value={f.missText ?? ''} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, missText: e.target.value }))} placeholder="如：未命中" style={inpSm} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                        {canEdit && <button onClick={() => runTest(s)} disabled={testing} style={{ ...miniBtn, borderColor: '#6D28D9', color: '#6D28D9' }}>{testing ? '测试中…' : '测试规则集'}</button>}
                      </div>
                    </div>
                  )}
                  {testing && <div style={{ marginTop: 14, fontSize: 13, color: '#6B7280' }}>测试中，请稍候…</div>}
                  {testResult && (
                    <div style={{ marginTop: 14, border: `1px solid ${testResult.ok ? '#A7F3D0' : '#FECACA'}`, background: testResult.ok ? '#ECFDF5' : '#FEF2F2', borderRadius: 8, padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, color: testResult.ok ? '#047857' : '#B91C1C' }}>{testResult.ok ? '✓ ' : '✕ '}{testResult.title}</div>
                      <div style={{ fontSize: 12, color: '#374151', marginTop: 4, lineHeight: 1.7 }}>
                        {testResult.lines.map((l, i) => <div key={i}>· {l}</div>)}
                        <div style={{ color: '#9CA3AF', marginTop: 2 }}>耗时 {testResult.durationMs} ms</div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })()}
          </Modal>

          {tab === 'score' && (
            <Panel title="自动审核配置" id="score-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#F8FAFC', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#374151' }}>标题<span style={{ color: '#DC2626', marginLeft: 2 }}>*</span></span>
                <input disabled={!canEdit} value={active.scoreBlock.title}
                  onChange={(e) => patch((t) => ({ ...t, scoreBlock: { ...t.scoreBlock, title: e.target.value } }))}
                  placeholder="输入标题（必填）" style={{ ...inp, width: 260, ...(active.scoreBlock.title.trim() === '' ? { borderColor: '#DC2626' } : {}) }} />
                {active.scoreBlock.title.trim() === '' && <span style={{ fontSize: 12, color: '#DC2626' }}>标题不可为空</span>}
                <span style={{ flex: 1 }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', cursor: canEdit ? 'pointer' : 'default' }}>
                  <input type="checkbox" disabled={!canEdit} checked={active.scoreBlock.show}
                    onChange={(e) => patch((t) => ({ ...t, scoreBlock: { ...t.scoreBlock, show: e.target.checked } }))} />
                  启用
                </label>
                <span style={{ fontSize: 12, color: active.scoreBlock.show ? '#047857' : '#9CA3AF' }}>{active.scoreBlock.show ? '已启用' : '未启用'}</span>
              </div>
              {/* 综合总分计算公式 + 分值预测（融合为同一卡片：分值预测置于首行） */}
              <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {/* 分值预测：根据报告内容配置自动计算（不可手动编辑），与内容区块联动 */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 12px', border: '1px solid #DBEAFE', background: '#EFF6FF', borderRadius: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#1E40AF' }}>分值预测</span>
                  <span style={{ fontSize: 13, color: '#374151' }}>最小分值 <b style={{ color: '#DC2626' }}>{scoreSummary.min}</b><span style={{ fontSize: 9, fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, marginLeft: 3, background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB' }}>computeScoreSummary</span></span>
                  <span style={{ fontSize: 13, color: '#374151' }}>最大分值 <b style={{ color: '#047857' }}>{scoreSummary.max}</b></span>
                  <span style={{ fontSize: 13, color: '#374151' }}>命中即拒 <b style={{ color: '#DC2626' }}>{scoreSummary.rejectTotal}</b> 项</span>
                  <span style={{ fontSize: 11, color: '#9CA3AF', marginLeft: 4 }}>|</span>
                  <label style={{ fontSize: 13, color: '#374151', display: 'flex', alignItems: 'center', gap: 4 }}>
                    基础分
                    <input type="number" disabled={!canEdit}
                      value={active.scoreDisplay.baseScore ?? 0}
                      onChange={(e) => patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, baseScore: +e.target.value || 0 } }))}
                      style={{ ...numSm, width: 56 }} />
                  </label>
                  <span style={{ fontSize: 11, color: '#6B7280' }}>（由公式计算结果 + 基础分，默认 0）</span>
                </div>
                <FormulaEditor
                  formula={active.scoreFormula ?? buildDefaultScoreFormula(active.sections)}
                  vars={active.reportType === 'decision'
                    ? DECISION_SCORE_VARS
                    : active.sections.filter((s) => (s.homeTab ?? 'content') === 'content').map((s) => {
                        const r = computeSectionScore(s)
                        const absTotal = Math.abs(r.total)
                        const hint = r.mode === 'deduct' ? `-${absTotal}～0` : `0～${absTotal}`
                        return {
                          id: 'sec_' + s.id,
                          label: s.name,
                          dir: s.cardScoreMode === 'deduct' ? 'up-risk' : 'up-good',
                          sample: 50,
                          rangeHint: hint,
                        }
                      })}
                  canEdit={canEdit}
                  onSave={(f) => patch((t) => {
                    // 9.4.1 公式权重联动：公式中 sec_xxx 项的 factor 同步回写对应 section 的 weight（保存到 json）
                    const sections = t.sections.map((s) => {
                      const term = f.terms.find((x) => x.kind === 'var' && x.varId === 'sec_' + s.id)
                      if (term && term.factor != null && term.factor !== (s.weight ?? 1)) {
                        return { ...s, weight: term.factor }
                      }
                      return s
                    })
                    return { ...t, scoreFormula: f, sections }
                  })}
                />
              </div>
              <div style={active.scoreBlock.show ? undefined : { opacity: 0.45, pointerEvents: 'none', userSelect: 'none' }}>
              <Field label="评分卡形态">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['大数字', '环形图', '进度条', '仪表盘'] as DisplayComponent[]).map((c) => (
                    <button key={c} disabled={!canEdit} onClick={() => patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, displayComponent: c } }))}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${active.scoreDisplay.displayComponent === c ? SEL : '#D1D5DB'}`, background: active.scoreDisplay.displayComponent === c ? SEL_BG : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{c}</button>
                  ))}
                </div>
              </Field>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '10px 0' }}>
                {([['showDescription', '显示风险描述'], ['showRiskTags', '显示风险标签']] as [keyof typeof active.scoreDisplay, string][]).map(([k, label]) => (
                  <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <input type="checkbox" disabled={!canEdit} checked={active.scoreDisplay[k] as boolean} onChange={(e) => patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, [k]: e.target.checked } }))} />{label}
                  </label>
                ))}
              </div>
              {/* 评分卡形态预览：按分值分段 + 所选形态实时渲染示例效果 */}
              {(() => {
                const pvMin = scoreSummary.min
                const pvMax = scoreSummary.max
                const raw = demoScore ?? Math.round(pvMin + (pvMax - pvMin) * 0.72)
                const pvScore = Math.max(pvMin, Math.min(pvMax, raw))
                return (
                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: 10, background: '#FBFCFE', padding: '14px 16px', margin: '4px 0 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>效果预览 · {active.scoreDisplay.displayComponent}</span>
                      <span style={{ flex: 1 }} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151', cursor: canEdit ? 'pointer' : 'default' }}>
                        <input type="checkbox" disabled={!canEdit} checked={active.scoreDisplay.showThresholdBar} onChange={(e) => patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, showThresholdBar: e.target.checked } }))} />启用刻度条
                      </label>
                      {/* 分值语义控件已按需求移除（异常值/信用值方向由模板默认语义驱动） */}
                      <span style={{ fontSize: 12, color: '#6B7280' }}>示例分值</span>
                      <input type="range" min={pvMin} max={pvMax} value={pvScore} onChange={(e) => setDemoScore(+e.target.value)} style={{ width: 160 }} />
                      <input type="number" value={pvScore} onChange={(e) => setDemoScore(+e.target.value)} style={{ ...numSm, width: 70 }} />
                    </div>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>评分卡形态预览：<span style={{ background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD', fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, fontSize: 9 }}>模板配置</span><span style={{ background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB', fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, fontSize: 9, marginLeft: 3 }}>示例分={pvScore} 实时算</span></span>
                    <ScoreCardPreview key={active.scoreDisplay.grades.map(g => g.grade + '|' + (g.tags ?? '')).join(',')} sd={active.scoreDisplay} score={pvScore} />
                  </div>
                )
              })()}
              {/* 分值预测已上移并融合至上方「综合总分计算公式」卡片首行 */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>分值分段</div>
                <div style={{ display: 'flex', gap: 8 }}>{canEdit && <button onClick={addGrade} style={miniBtn}>＋ 新增分段</button>}
                {canEdit && active.scoreDisplay.grades.length > 0 && <button onClick={resetGrades} style={{ ...miniBtn, borderColor: '#BFDBFE', color: '#1D4ED8' }}>重置为默认三等分</button>}</div>
              </div>
              <table className="w-full text-sm" style={{ marginTop: 4 }}>
                <thead><tr style={{ textAlign: 'left' }}>
                  <th className="px-2 py-2">分段名</th><th className="px-2 py-2">分值区间</th><th className="px-2 py-2">自动审核结果</th><th className="px-2 py-2">标签配色</th><th className="px-2 py-2">说明</th><th className="px-2 py-2">标签（空格分隔）</th><th className="px-2 py-2"></th>
                </tr></thead>
                <tbody>
                  {active.scoreDisplay.grades.map((g, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td className="px-2 py-2 font-medium"><input disabled={!canEdit} value={g.grade} onChange={(e) => patchGrade(i, (x) => ({ ...x, grade: e.target.value }))} style={inpSm} /></td>
                      <td className="px-2 py-2" style={{ display: 'flex', gap: 4 }}>
                        <input type="number" disabled={!canEdit} value={g.minScore} onChange={(e) => patchGrade(i, (x) => ({ ...x, minScore: +e.target.value }))} style={numSm} />~
                        <input type="number" disabled={!canEdit} value={g.maxScore} onChange={(e) => patchGrade(i, (x) => ({ ...x, maxScore: +e.target.value }))} style={numSm} />
                      </td>
                      <td className="px-2 py-2">
                        <select disabled={!canEdit} value={g.autoResult} onChange={(e) => patchGrade(i, (x) => ({ ...x, autoResult: e.target.value as AutoResult }))}
                          style={{ ...inpSm, fontWeight: 600, color: AUTO_RESULT_COLOR[g.autoResult] }}>
                          {AUTO_RESULT_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </td>
                      <td className="px-2 py-2"><input type="color" disabled={!canEdit} value={g.color} onChange={(e) => patchGrade(i, (x) => ({ ...x, color: e.target.value }))} style={{ width: 32, height: 28, border: 'none', background: 'none' }} /></td>
                      <td className="px-2 py-2"><input disabled={!canEdit} value={g.description} onChange={(e) => patchGrade(i, (x) => ({ ...x, description: e.target.value }))} style={inpSm} /></td>
                      <td className="px-2 py-2"><input disabled={!canEdit} value={g.tags ?? ''} onChange={(e) => patchGrade(i, (x) => ({ ...x, tags: e.target.value }))} placeholder="空格分隔，如：设备环境异常 关联风险偏高" style={inpSm} /></td>
                      <td className="px-2 py-2">{canEdit && i > 0 && <button onClick={() => delGrade(i)} style={{ ...miniBtn, color: '#DC2626', borderColor: '#FECACA' }}>删除</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {gradeErrs.length > 0 ? (
                <div style={{ marginTop: 8, fontSize: 12, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 10px' }}>
                  <b>分段区间校验未通过：</b>
                  {gradeErrs.map((e, k) => <div key={k}>· {e}</div>)}
                </div>
              ) : (
                <div style={{ marginTop: 8, fontSize: 12, color: '#047857' }}>✓ 分段区间已完整覆盖分值预测范围 {scoreSummary.min} ~ {scoreSummary.max}，无重叠无缝隙。</div>
              )}

              {/* ---------- 特殊命中规则：命中即定结论，不受分值分段约束 ---------- */}
              <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px dashed #E5E7EB' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', gap: 8 }}>
                  <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>
                    特殊命中规则
                  </div>
                  {canEdit && <button onClick={() => setSpecialPick(true)} style={{ ...miniBtn, borderColor: '#FCA5A5', color: '#B91C1C' }}>＋ 添加规则</button>}
                </div>
                {(active.specialRules ?? []).length === 0 ? (
                  <div style={{ fontSize: 12, color: '#9CA3AF', border: '1px dashed #E5E7EB', borderRadius: 8, padding: '14px 12px', textAlign: 'center' }}>
                    暂未配置特殊命中规则 —— 点「＋ 添加规则」，从「报告内容配置」里已选的规则项中挑选。
                  </div>
                ) : (
                  <table className="w-full text-sm" style={{ marginTop: 4 }}>
                    <colgroup>
                      <col /><col style={{ width: 110 }} /><col style={{ width: 120 }} /><col style={{ width: 140 }} /><col style={{ width: 220 }} /><col style={{ width: 64 }} />
                    </colgroup>
                    <thead><tr style={{ textAlign: 'left' }}>
                      <th className="px-2 py-2">规则项</th><th className="px-2 py-2">触发条件</th><th className="px-2 py-2">对应审核结果</th><th className="px-2 py-2">优先级</th><th className="px-2 py-2">说明</th><th className="px-2 py-2"></th>
                    </tr></thead>
                    <tbody>
                      {(active.specialRules ?? []).map((r) => (
                        <tr key={r.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                          <td className="px-2 py-2">
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{r.ruleName}</div>
                            <div style={{ fontSize: 11, color: '#9CA3AF' }}>{r.sectionName}</div>
                          </td>
                          <td className="px-2 py-2">
                            <select disabled={!canEdit} value={r.trigger} onChange={(e) => patchSpecial(r.id, (x) => ({ ...x, trigger: e.target.value as SpecialRuleTrigger }))} style={{ ...inpSm, width: '100%' }}>
                              {(['hit', 'miss'] as SpecialRuleTrigger[]).map((t) => <option key={t} value={t}>{SPECIAL_TRIGGER_LABEL[t]}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <select disabled={!canEdit} value={r.autoResult} onChange={(e) => patchSpecial(r.id, (x) => ({ ...x, autoResult: e.target.value as AutoResult }))}
                              style={{ ...inpSm, width: '100%', fontWeight: 600, color: AUTO_RESULT_COLOR[r.autoResult] }}>
                              {AUTO_RESULT_LIST.map((a) => <option key={a} value={a}>{a}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <select disabled={!canEdit} value={r.priority} onChange={(e) => patchSpecial(r.id, (x) => ({ ...x, priority: e.target.value as SpecialRulePriority }))}
                              title={SPECIAL_PRIORITY_HINT[r.priority]}
                              style={{ ...inpSm, width: '100%', fontWeight: 600, color: r.priority === 'decisive' ? '#B91C1C' : '#B45309' }}>
                              {(['decisive', 'warning'] as SpecialRulePriority[]).map((p) => <option key={p} value={p}>{SPECIAL_PRIORITY_LABEL[p]}</option>)}
                            </select>
                          </td>
                          <td className="px-2 py-2"><input disabled={!canEdit} value={r.note ?? ''} onChange={(e) => patchSpecial(r.id, (x) => ({ ...x, note: e.target.value }))} placeholder="补充说明（选填）" style={{ ...inpSm, width: '100%' }} /></td>
                          <td className="px-2 py-2">{canEdit && <button onClick={() => delSpecial(r.id)} style={{ ...miniBtn, color: '#DC2626', borderColor: '#FECACA' }}>删除</button>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
                {/* 决定规则提示控件已按需求彻底移除（不再展示「共 N 条决定规则」提示） */}
              </div>
              {/* ===== 评分维度分布：报告详情首卡的得分列表（每个来源卡片 = 一行，逐维度独立配 低/中/高 档位） ===== */}
              <div style={{ marginBottom: 18, border: '1px solid #E5E7EB', borderRadius: 10, background: '#F8FAFC', overflow: 'hidden' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderBottom: '1px solid #E5E7EB' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', cursor: canEdit ? 'pointer' : 'default' }}>
                    <input type="checkbox" disabled={!canEdit} checked={active.showSectionTotals}
                      onChange={(e) => patch((t) => ({ ...t, showSectionTotals: e.target.checked }))} />
                    显示分段总分
                  </label>
                  <span style={{ fontSize: 12, color: active.showSectionTotals ? '#047857' : '#9CA3AF' }}>
                    {active.showSectionTotals ? '各集合展示汇总得分，并在报告详情首卡显示下方「评分维度分布」列表' : '不展示集合汇总得分，报告详情首卡不显示评分维度分布列表'}
                  </span>
                </div>

                <div style={active.showSectionTotals ? { padding: 12 } : { padding: 12, opacity: 0.45, pointerEvents: 'none', userSelect: 'none' }}>
                  {/* 逐维度档位配置表：每个维度独立配 一/二/三 分段区间与标签 */}
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>评分维度分布（{dimRows.length} 个集合 · 报告详情首卡按此渲染，每个维度独立配 一/二/三 分段）<span style={{ fontSize: 9, fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, marginLeft: 3, background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB' }}>buildDimRows 实时</span></div>
                  <div style={{ border: '1px solid #E5E7EB', borderRadius: 8, overflow: 'hidden', background: '#fff', overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 900 }}>
                      <thead>
                        <tr style={{ background: '#F1F5F9', color: '#94A3B8' }}>
                          <th style={{ ...dimTh, textAlign: 'left' }}>维度</th>
                          <th style={{ ...dimTh, textAlign: 'right', width: 80 }}>本卡总分</th>
                          <th style={{ ...dimTh, textAlign: 'right', width: 56 }}>权重</th>
                          <th style={{ ...dimTh, textAlign: 'center', minWidth: 150 }}>一分段（区间·标签）</th>
                          <th style={{ ...dimTh, textAlign: 'center', minWidth: 150 }}>二分段（区间·标签）</th>
                          <th style={{ ...dimTh, textAlign: 'center', minWidth: 150 }}>三分段（区间·标签）</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dimRows.length === 0 && (
                          <tr><td colSpan={6} style={{ ...dimTd, color: '#9CA3AF', textAlign: 'center' }}>「报告内容配置」里还没有启用的来源卡片</td></tr>
                        )}
                        {dimRows.map((r) => {
                          const sec = sections.find((s) => s.id === r.id)
                          const secBands = sec?.dimBands ?? active.dimBands ?? defaultDimBandsForScore(r.score)
                          return (
                            <tr key={r.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                              <td style={{ ...dimTd, fontWeight: 600, color: '#111827' }}>{r.name}<span style={{ fontSize: 9, fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, marginLeft: 3, background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD' }}>sections[{r.id}].name</span></td>
                              <td style={{ ...dimTd, textAlign: 'right', fontWeight: 700, color: r.score < 0 ? '#E11D48' : '#059669' }}>{r.score < 0 ? '−' : '+'}{Math.abs(r.score)}<span style={{ fontSize: 9, fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, marginLeft: 3, background: '#F3F4F6', color: '#6B7280', border: '1px solid #D1D5DB' }}>computeSectionScore</span></td>
                              <td style={{ ...dimTd, textAlign: 'right', color: '#9CA3AF' }}>{r.weight}<span style={{ fontSize: 9, fontFamily: 'monospace', padding: '0 3px', borderRadius: 2, marginLeft: 3, background: '#DBEAFE', color: '#1D4ED8', border: '1px solid #93C5FD' }}>weight</span></td>
                              {(['低', '中', '高'] as DimLevel[]).map((lv) => {
                                const bi = secBands.findIndex((b) => b.level === lv)
                                const b = secBands[bi]
                                return (
                                  <td key={lv} style={{ ...dimTd, verticalAlign: 'top' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
                                      <input type="number" disabled={!canEdit} value={b?.min ?? 0}
                                        onChange={(e) => patchSectionDimBand(r.id, bi, { min: Number(e.target.value) })}
                                        style={{ ...inpSm, width: 54 }} />
                                      <span style={{ color: '#9CA3AF' }}>~</span>
                                      <input type="number" disabled={!canEdit} value={b?.max ?? 0}
                                        onChange={(e) => patchSectionDimBand(r.id, bi, { max: Number(e.target.value) })}
                                        style={{ ...inpSm, width: 54 }} />
                                    </div>
                                    <input disabled={!canEdit} value={b?.note ?? ''} placeholder={`${lv}分段标签（空格分隔）`}
                                      onChange={(e) => patchSectionDimBand(r.id, bi, { note: e.target.value })}
                                      style={{ ...inpSm, width: '100%', marginTop: 4 }} />
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#9CA3AF' }}>
                    维度 = 集合名称（来自 sections，蓝标）· 本卡总分 = 实时计算（灰标）· 权重 = sections 权重原值（蓝标，公式编辑器修改后同步）· 一/二/三 分段区间与标签逐维度独立配置（默认分支区间三等分，可编辑）。
                  </div>
                </div>
              </div>
              </div>
            </Panel>
          )}

          {tab === 'flow' && (
            <Panel title="人工审核配置" id="flow-panel">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#F8FAFC', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#374151' }}>标题<span style={{ color: '#DC2626', marginLeft: 2 }}>*</span></span>
                <input disabled={!canEdit} value={active.flowBlock.title}
                  onChange={(e) => patch((t) => ({ ...t, flowBlock: { ...t.flowBlock, title: e.target.value } }))}
                  placeholder="输入标题（必填）" style={{ ...inp, width: 260, ...(active.flowBlock.title.trim() === '' ? { borderColor: '#DC2626' } : {}) }} />
                {active.flowBlock.title.trim() === '' && <span style={{ fontSize: 12, color: '#DC2626' }}>标题不可为空</span>}
                <span style={{ flex: 1 }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', cursor: canEdit ? 'pointer' : 'default' }}>
                  <input type="checkbox" disabled={!canEdit} checked={active.flowBlock.show}
                    onChange={(e) => patch((t) => ({ ...t, flowBlock: { ...t.flowBlock, show: e.target.checked } }))} />
                  启用
                </label>
                <span style={{ fontSize: 12, color: active.flowBlock.show ? '#047857' : '#9CA3AF' }}>{active.flowBlock.show ? '已启用' : '未启用'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#F8FAFC', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>状态枚举类<span style={{ color: '#DC2626', marginLeft: 2 }}>*</span></span>
                <input disabled={!canEdit} value={(active.flowBlock.statusEnum ?? []).join('/')}
                  onChange={(e) => patch((t) => ({ ...t, flowBlock: { ...t.flowBlock, statusEnum: e.target.value.split('/').map((s) => s.trim()).filter(Boolean) } }))}
                  placeholder="用 / 分隔，如 待确认/通过/拒绝/完结/挂起/转人工" style={{ ...inp, flex: 1 }} />
                <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>共 {(active.flowBlock.statusEnum ?? []).length} 个状态</span>
              </div>
              <div style={active.flowBlock.show ? undefined : { opacity: 0.45, pointerEvents: 'none', userSelect: 'none' }}>
              {syncHint && <div style={{ fontSize: 12, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '6px 10px', marginBottom: 10 }}>{syncHint}</div>}
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', fontSize: 13 }}>
                <colgroup><col style={{ width: 190 }} /><col style={{ width: 90 }} /><col /></colgroup>
                <thead><tr style={{ background: '#F8FAFC' }}>
                  {['触发分段（报告状态）', '自动结果', '业务流程配置'].map((h) => (
                    <th key={h} style={{ padding: '8px', fontSize: 12, fontWeight: 600, color: '#6B7280', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {flowRows.map(({ grade, flow }, i) => {
                    const ar: AutoResult = grade?.autoResult ?? '转人工'
                    return (
                      <tr key={i} style={{ borderTop: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>
                          <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 999, background: grade?.color ?? '#9CA3AF', marginRight: 6 }} />
                          {grade ? grade.grade : flow.gradeId}
                          <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 400, marginTop: 2 }}>区间 {grade ? `${grade.minScore} ~ ${grade.maxScore}` : '—'} 分</div>
                          <div style={{ fontSize: 11, color: grade?.color, fontWeight: 400 }}>{grade?.description}</div>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ padding: '2px 10px', fontSize: 12, fontWeight: 600, borderRadius: 999, color: '#fff', background: AUTO_RESULT_COLOR[ar] }}>{ar}</span>
                        </td>
                        <td style={{ padding: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                            {(flow.flowGraphs ?? []).length === 0 && (
                              <div style={{ fontSize: 12, color: '#9CA3AF' }}>（暂无业务流程，点击下方添加流程）</div>
                            )}
                            {(flow.flowGraphs ?? []).map((g, sub) => {
                              return (
                                <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 8px', background: '#fff' }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {g.name ?? '未命名流程'}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, lineHeight: 1.5, wordBreak: 'break-all' }}>
                                      {summarizeFlowGraph(g)}
                                    </div>
                                  </div>
                                  <button onClick={() => openFlowCanvas(i + 1, sub, flow, ar)} style={{ ...miniBtn, borderColor: SEL, color: SEL, flexShrink: 0 }}>
                                    {canEdit ? '编辑' : '查看'}
                                  </button>
                                  {canEdit && <button onClick={() => removeFlow(i + 1, sub)} style={{ ...miniBtn, borderColor: '#FCA5A5', color: '#DC2626', flexShrink: 0 }}>删除</button>}
                                </div>
                              )
                            })}
                            {canEdit && (
                              <button onClick={() => addFlow(i + 1, flow, ar)} style={{ ...miniBtn, borderColor: SEL, color: SEL, alignSelf: 'flex-start' }}>＋ 添加流程</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280', lineHeight: 1.7 }}>
                说明：每行对应一个评分分段（即一种报告状态）。「业务流程配置」中每条流程 = 该状态下出现的一个操作按钮（如「确认通过」「转人工审核」）；流程名称在画布编辑器中设置。「查看」按钮由系统强制提供，不需配置。一个状态下可配置多个按钮（多条流程）。
              </div>
              </div>

              {/* 分段业务流程 · 自由画布弹窗 */}
              <Modal open={flowEdit != null} onClose={() => { setFlowEdit(null); setDraftGraph(null) }}
                title={flowEdit != null ? `业务流程配置 · 第 ${flowEdit.sub + 1} 条 · ${active.scoreDisplay.grades[flowEdit.gi - 1] ? `${active.scoreDisplay.grades[flowEdit.gi - 1].grade} · ${active.scoreDisplay.grades[flowEdit.gi - 1].label}` : ''}` : ''}
                width="max-w-5xl"
                footer={<>
                  <Button variant="ghost" onClick={() => { setFlowEdit(null); setDraftGraph(null) }}>取消</Button>
                  {canEdit && flowEdit != null && (
                    <Button variant="ghost" onClick={() => {
                      const f = active.businessFlow[flowEdit.gi]
                      const g = active.scoreDisplay.grades[flowEdit.gi - 1]
                      setDraftGraph(buildDefaultFlowGraph(f, g?.autoResult ?? '转人工'))
                    }}>重置为默认流程</Button>
                  )}
                  {canEdit && <Button variant="primary" onClick={saveFlowCanvas}>保存流程</Button>}
                </>}>
                {draftGraph && <FlowCanvasEditor graph={draftGraph} onChange={setDraftGraph} readOnly={!canEdit} statusEnum={active.flowBlock.statusEnum} />}
              </Modal>
            </Panel>
          )}

          <Panel title="变更日志" desc={`共 ${active.changeLogs.length} 条`} className="mt-4">
            <div style={{ maxHeight: 200, overflow: 'auto' }}>
              {active.changeLogs.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                  <Badge kind="blue">{c.version}</Badge>
                  <Badge kind={c.action === '删除' ? 'red' : c.action === '启用' ? 'green' : c.action === '停用' ? 'gray' : c.action === '发布' ? 'violet' : 'amber'}>{c.action}</Badge>
                  <span style={{ color: '#374151' }}>{c.summary}</span>
                  <span style={{ marginLeft: 'auto', color: '#9CA3AF', fontSize: 12 }}>{c.operator} · {c.timestamp}</span>
                </div>
              ))}
            </div>
          </Panel>
          {/* 返回顶部浮动按钮（对齐贷前报告详情右下角样式） */}
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="返回顶部"
            className="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
          </button>
        </div>
      </div>
    </div>
  )
}

/* 审核状态机（可编辑）表已移除：审核操作改由「审核操作配置」中按评分分段的多行业务流程配置（节点=状态枚举）驱动。运行时 MACHINE_BY_TYPE / resolveActions 不变。 */

/* =============================================================================
 * 评分卡形态预览：按「分值分段 + 所选形态」渲染示例效果（评分方案 Tab 内嵌）
 * ========================================================================== */
const pvTag = (c: string): React.CSSProperties => ({ padding: '1px 8px', fontSize: 11, fontWeight: 600, borderRadius: 999, color: c, border: `1px solid ${c}55`, background: `${c}14` })

/* 评分卡预览：与报告详情页共用 ScoreVisual —— 这里看到什么样，报告生成出来就是
   什么样（展示形态 / 分段配色 / 语义方向 / 三个开关全部同一份渲染代码）。
   风险标签统一取自「分值分段表」里该分段的「标签」列（grade.tags，空格分隔）。 */
function ScoreCardPreview({ sd, score }: {
  sd: ScoreDisplayConfig
  score: number
}) {
  return (
    <ScoreVisual
      sd={sd}
      rawScore={score}
    />
  )
}

/* ===================== 多条件组合编辑器弹窗（五） ===================== */
const ConditionModal = ({ open, title, conditions, fieldOptions, ops, valueOptions, onSave, onClose }: {
  open: boolean
  title: string
  conditions: FieldCondition[]
  fieldOptions: string[]
  ops: FieldCondType[]
  valueOptions?: string[] // 枚举值下拉：当某字段配置了可选枚举时，值以下拉选择而非自由输入
  onSave: (list: FieldCondition[]) => void
  onClose: () => void
}) => {
  const [list, setList] = useState<FieldCondition[]>(conditions)
  useEffect(() => { setList(conditions.map((c) => ({ ...c }))) }, [open]) // 每次打开重置草稿
  const valueDisabled = (op: FieldCondType) => ['empty', 'notEmpty', 'hit', 'miss'].includes(op)
  const update = (i: number, patch: Partial<FieldCondition>) => setList((l) => l.map((c, k) => (k === i ? { ...c, ...patch } : c)))
  const remove = (i: number) => setList((l) => l.filter((_, k) => k !== i))
  const add = () => setList((l) => [...l, { id: `c${Date.now()}`, field: fieldOptions[0] ?? '', op: ops[0], value: '', logic: 'and' }])
  return (
    <Modal open={open} onClose={onClose} title={title}
      footer={<><Button variant="ghost" onClick={onClose}>取消</Button><Button onClick={() => { onSave(list); onClose() }}>完成</Button></>}>
      <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 8 }}>可添加多条条件，按顺序以「且 / 或」组合。运算符：等于 / 空 / 非空 / 大于 / 小于 / 正则（规则项仅命中 / 未命中）。</div>
      <div style={{ maxHeight: 360, overflowY: 'auto' }}>
        {list.length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF', padding: '12px 0' }}>尚未配置条件，点下方「＋ 添加条件」。</div>}
        {list.map((c, i) => (
          <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', borderBottom: '1px dashed #EEF2F7', flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, color: '#9CA3AF', width: 18 }}>{i + 1}</span>
            <select value={c.field} onChange={(e) => update(i, { field: e.target.value })} style={{ ...inpSm, width: 120, fontSize: 11 }}>
              {fieldOptions.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
            <select value={c.op} onChange={(e) => update(i, { op: e.target.value as FieldCondType })} style={{ ...inpSm, width: 96, fontSize: 11 }}>
              {ops.map((o) => <option key={o} value={o}>{FIELD_COND_LABEL[o]}</option>)}
            </select>
            {valueOptions && valueOptions.length > 0 && !valueDisabled(c.op) ? (
              <select value={c.value ?? ''} onChange={(e) => update(i, { value: e.target.value })} style={{ ...inpSm, width: 120, fontSize: 11 }}>
                {(c.value && !valueOptions.includes(c.value) ? [c.value, ...valueOptions] : valueOptions).map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input value={c.value ?? ''} disabled={valueDisabled(c.op)} onChange={(e) => update(i, { value: e.target.value })} placeholder="值" style={{ ...inpSm, width: 90, fontSize: 11, opacity: valueDisabled(c.op) ? 0.5 : 1 }} />
            )}
            {i < list.length - 1 && (
              <select value={c.logic} onChange={(e) => update(i, { logic: e.target.value as 'and' | 'or' })} style={{ ...inpSm, width: 56, fontSize: 11 }}>
                <option value="and">且</option>
                <option value="or">或</option>
              </select>
            )}
            <button onClick={() => remove(i)} style={{ ...miniBtn, color: '#DC2626', borderColor: '#FECACA', padding: '2px 8px' }}>删除</button>
          </div>
        ))}
      </div>
      <button onClick={add} style={{ ...miniBtn, marginTop: 10 }}>＋ 添加条件</button>
    </Modal>
  )
}
