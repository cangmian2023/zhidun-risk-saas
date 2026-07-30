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
import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageHeader, Panel, Badge, Button, DetailHeader, SingleSelect, SearchSelect, Modal } from '../components/ui'
import {
  ReportTemplate, ReportType, TplStatus, DisplayComponent, ScoreGrade, BusinessFlowConfig,
  SectionConfig, FieldConfig, SectionSource, ROLE_PERM, computeSectionScore,
  DataSourceConfig, DbField, ApiParam, ApiOutput, ApiConfig, ApiHeader, ApiMethod, ApiBodyType, ApiFieldType,
  RenderContainer, RENDER_CONTAINER_LABEL, API_FIELD_TYPE_LABEL, defaultContainer, recommendDbContainer,
  MaskRule, MASK_RULE_LABEL, autoMaskRule, Severity, SEVERITY_LABEL, FieldCondType, FIELD_COND_LABEL,
  REPORT_META, PRODUCT_TREE, PRODUCT_LEAVES, PRODUCT_ALL, scopeLabel,
  AutoResult, AUTO_RESULT_LIST, AUTO_RESULT_COLOR, RiskLevel,
  computeScoreSummary, validateGrades,
  SECTION_SOURCE_LABEL, RULE_SETS, DB_TYPES, mockTableColumns,
  SourceTestResult, testSourceConfig, parseCurl, buildCurl,
  syncFlowToGrades, buildTemplate, seedReportTemplates,
  FlowGraph, buildDefaultFlowGraph, summarizeFlowGraph, defaultButtonName,
} from './reportTemplateData'
import FlowCanvasEditor from './FlowCanvasEditor'

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

  const active = useMemo(() => templates.find((t) => t.id === activeId) ?? templates[0], [templates, activeId])
  const perm = ROLE_PERM['系统管理员'] // 权限固定为系统管理员（全权）；角色模拟切换已移除
  const canEdit = perm.edit

  const patch = (fn: (t: ReportTemplate) => ReportTemplate) =>
    setTemplates((l) => l.map((t) => (t.id === activeId ? fn(t) : t)))
  const patchSection = (sid: string, fn: (s: SectionConfig) => SectionConfig) =>
    patch((t) => ({ ...t, sections: t.sections.map((s) => (s.id === sid ? fn(s) : s)) }))
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
  /* 评分方案：总分 = 基础分 + 各卡得分直接汇总（见 computeScoreSummary），此处仅用于分段区间校验 */
  const scoreSummary = useMemo(() => computeScoreSummary(active), [active])
  const gradeErrs = useMemo(() => validateGrades(active.scoreDisplay.grades, scoreSummary.min, scoreSummary.max), [active.scoreDisplay.grades, scoreSummary])
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
      const fields = ds.tableFields.map((tf, k) => ({ id: `dsf_${k}`, name: tf.name, desc: '数据库表字段', visible: tf.visible, sourceRef: tf.name, mask: /身份证|手机|银行卡|证件|姓名/.test(tf.name) }))
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
  /* —— 接口：API 地址 + 输入参数 + 输出字段 —— */
  const patchApi = (sid: string, fn: (a: ApiConfig) => ApiConfig) =>
    patchSection(sid, (s) => {
      const api = fn(s.api ?? { url: '', method: 'POST', headers: [], inputs: [], bodyType: 'none', bodyText: '', outputs: [] })
      const fields = api.outputs.map((o, k) => ({ id: `apo_${k}`, name: o.label, desc: '接口输出字段', visible: o.visible ?? true, sourceRef: o.key }))
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
  const setDefault = () => {
    if (active.isDefault) return
    if (!window.confirm('设为默认后，新进入件将使用新模板，历史报告不受影响。是否继续？')) return
    setTemplates((l) => l.map((t) => ({ ...t, isDefault: t.id === activeId })))
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
  }
  const deleteTpl = (id: string) => {
    const t = templates.find((x) => x.id === id); if (!t) return
    if (t.status === '已启用' || t.isDefault) { window.alert('已启用或默认模板不可删除，请先停用并取消默认。'); return }
    if (!window.confirm(`确认删除模板「${t.name}」？`)) return
    const now = nowStr()
    setTemplates((l) => {
      const withLog = l.map((x) => x.id === id ? { ...x, changeLogs: [{ version: x.version, action: '删除' as const, operator: '当前用户', timestamp: now, summary: `删除模板「${x.name}」` }, ...x.changeLogs] } : x)
      return withLog.filter((x) => x.id !== id)
    })
    if (activeId === id) {
      const rest = templates.filter((x) => x.id !== id)
      if (rest.length) { setActiveId(rest[0].id); setView('detail') } else setView('list')
    }
  }
  const createNew = (type: ReportType) => {
    const id = `tpl-${Date.now()}`
    const t = buildTemplate(type, { id, name: `${REPORT_META[type].label}报告模板`, status: '草稿', scope: ['全产品'], isDefault: false, version: 'V1.0', lastEditor: '当前用户', lastEditTime: '刚刚' })
    setTemplates((l) => [t, ...l]); setActiveId(id); setShowNew(false); setView('detail')
  }

  const statusBadge = (s: TplStatus) => <Badge kind={s === '已启用' ? 'green' : s === '已停用' ? 'gray' : 'amber'}>{s}</Badge>
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
    const filtered = templates.filter((t) => {
      if (search && !t.name.includes(search)) return false
      if (fType !== '全部' && REPORT_META[t.reportType].label !== fType) return false
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
              const meta = REPORT_META[t.reportType]
              const secCount = t.sections.length
              const visSec = t.sections.filter((s) => s.visible).length
              return (
                <div key={t.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#fff', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                    {t.isDefault && <Badge kind="blue">默认</Badge>}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge kind={meta.color}>{meta.icon} {meta.label}</Badge>
                    {statusBadge(t.status)}
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{meta.hint}</span>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: '#6B7280', lineHeight: 1.7, flex: 1 }}>
                    <div>适用产品：{scopeLabel(t.scope)}</div>
                    <div>分段：显示 {visSec}/{secCount} 个　·　版本 {t.version}</div>
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

  /* 分段卡片渲染（报告内容 / 评分方案 / 审核操作 三 Tab 复用）：
     - content 段：可移动 / 删除 / 配置来源
     - score / flow 段（得分计算 / 结论与终审）：由已配置的数据源/规则集算得，只展示勾选项，无「配置来源」「删除」 */
  const renderSectionCard = (s: SectionConfig, opts: { showConfigBtn: boolean; showDelete: boolean; showMove: boolean }) => {
    const st = s.sourceType
    const stColor = st === 'data_source' ? { bg: '#ECFDF5', bd: '#A7F3D0', tx: '#047857' } : st === 'api' ? { bg: '#EFF6FF', bd: '#BFDBFE', tx: '#1D4ED8' } : { bg: '#F5F3FF', bd: '#DDD6FE', tx: '#6D28D9' }
    /* 表头 / 单元格统一样式：列宽由 colgroup 锁定，全部居中，杜绝 flex 错位 */
    const thStyle: React.CSSProperties = { textAlign: 'center', verticalAlign: 'middle', padding: '7px 6px', borderBottom: '1px solid #EEF2F7', fontWeight: 600, color: '#6B7280', fontSize: 11, whiteSpace: 'nowrap' }
    const tdStyle: React.CSSProperties = { textAlign: 'center', verticalAlign: 'middle', padding: '5px 6px', borderBottom: '1px solid #F1F5F9', fontSize: 12 }
    const disabled = opts.showMove ? (s.visible && visibleCount <= 1) : false
    const isFlash = s.id === flashId
    return (
      <div
        key={s.id}
        ref={(el) => { if (isFlash && el && typeof (el as HTMLElement).scrollIntoView === 'function') (el as HTMLElement).scrollIntoView({ behavior: 'smooth', block: 'center' }) }}
        style={{ border: '1px solid #E5E7EB', borderLeft: `4px solid ${stColor.bd}`, borderRadius: 10, overflow: 'hidden', transition: 'box-shadow .3s', boxShadow: isFlash ? '0 0 0 3px rgba(59,130,246,.45)' : 'none' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: stColor.bg, flexWrap: 'wrap' }}>
          {opts.showMove && canEdit && <button onClick={() => moveSection(s.id, -1)} style={miniBtn} title="上移">↑</button>}
          {opts.showMove && canEdit && <button onClick={() => moveSection(s.id, 1)} style={miniBtn} title="下移">↓</button>}
          <input type="checkbox" disabled={disabled || !canEdit} checked={s.visible} onChange={(e) => patchSection(s.id, (x) => ({ ...x, visible: e.target.checked }))} />
          <input disabled={!canEdit} value={s.name} onChange={(e) => patchSection(s.id, (x) => ({ ...x, name: e.target.value }))} style={{ ...inp, width: 190, fontWeight: 600, fontSize: 14 }} />
          <span style={{ fontSize: 12, fontWeight: 600, background: '#fff', border: `1px solid ${stColor.bd}`, color: stColor.tx, padding: '2px 8px', borderRadius: 999 }}>{SECTION_SOURCE_LABEL[st]}</span>
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>展示 {s.fields.filter((f) => f.visible).length}/{s.fields.length}</span>
          <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
            {opts.showDelete && canEdit && <button onClick={() => delSection(s.id)} style={{ ...miniBtn, color: '#DC2626', borderColor: '#FECACA' }}>删除分段</button>}
            {opts.showConfigBtn && <button onClick={() => openConfig(s.id)} style={{ ...miniBtn, borderColor: SEL, color: SEL }}>配置来源</button>}
          </div>
        </div>
        <div style={{ padding: '10px 12px', background: '#fff', borderTop: '1px solid #F1F5F9' }}>
          {st === 'data_source' && (
            <div>
              {(s.ds?.tableFields ?? []).length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>尚未读取表结构{opts.showConfigBtn ? '，点右上「配置来源」连接数据库并读取字段。' : '。'}</div>}
              <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 900, borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed', border: '1px solid #EEF2F7', borderRadius: 8, overflow: 'hidden' }}>
                <colgroup>
                  <col style={{ width: 40 }} />
                  <col style={{ width: 48 }} />
                  <col style={{ width: 120 }} />
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
                    <th style={thStyle}>提示标签</th>
                    <th style={thStyle}>类型</th>
                    <th style={thStyle}>显示方式</th>
                    <th style={thStyle}>脱敏规则</th>
                    <th style={thStyle}>豁免</th>
                    <th style={thStyle}>条件</th>
                    <th style={thStyle}>条件值</th>
                    <th style={thStyle}>分值</th>
                    <th style={{ ...thStyle, width: 10, padding: '7px 0' }} />
                  </tr>
                </thead>
                <tbody>
                  {(s.ds?.tableFields ?? []).map((tf, idx) => {
                    const rowOn = tf.visible
                    const rowBg = tf.visible ? '#ECFDF5' : '#fff'
                    return (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', background: rowBg, opacity: rowOn ? 1 : 0.6 }}>
                      <td style={{ ...tdStyle, position: 'sticky', left: 0, zIndex: 2, background: rowBg, color: '#9CA3AF' }}>{idx + 1}</td>
                      <td style={{ ...tdStyle, position: 'sticky', left: 40, zIndex: 2, background: rowBg }}><input type="checkbox"  disabled={!canEdit} checked={tf.visible} onChange={() => toggleDsField(s.id, idx)} style={{ width: 16, cursor: canEdit ? 'pointer' : 'not-allowed' }} /></td>
                      <td style={{ ...tdStyle, fontWeight: 500, color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', position: 'sticky', left: 88, zIndex: 2, background: rowBg, boxShadow: '1px 0 0 #E5E7EB' }}>{tf.name}</td>
                      <td style={tdStyle}><input disabled={!canEdit || !rowOn} value={tf.label ?? ''} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, label: e.target.value }))} placeholder={tf.name} style={{ ...inpSm, width: '100%', fontSize: 12 }}  /></td>
                      <td style={{ ...tdStyle, color: '#6B7280' }}>{tf.type}</td>
                      <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={tf.container ?? recommendDbContainer(tf.type)} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, container: e.target.value as RenderContainer }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{containerOptions(recommendDbContainer(tf.type)).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
                      <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={tf.maskRule ?? 'none'} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, maskRule: e.target.value as MaskRule }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{Object.entries(MASK_RULE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
                      <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={(tf.exempt ?? false) ? 'yes' : 'no'} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, exempt: e.target.value === 'yes' }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} ><option value="no">不可以</option><option value="yes">可以</option></select></td>
                      <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={tf.condType ?? 'eq'} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, condType: e.target.value as FieldCondType }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{(['eq', 'empty', 'notEmpty', 'gt', 'lt'] as FieldCondType[]).map((c) => <option key={c} value={c}>{FIELD_COND_LABEL[c]}</option>)}</select></td>
                      {(['gt', 'lt', 'eq'].includes(tf.condType ?? 'eq')) ? (
                        <td style={tdStyle}><input disabled={!canEdit || !rowOn} value={tf.condValue ?? ''} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, condValue: e.target.value }))} placeholder="阈值"  style={{ ...inpSm, width: '100%', fontSize: 12 }} /></td>
                      ) : <td style={tdStyle}></td>}
                      <td style={tdStyle}><input type="number" disabled={!canEdit || !rowOn} value={tf.scorePoints ?? 0} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, scorePoints: +e.target.value || 0 }))}  style={{ ...numSm, width: '100%', fontSize: 12 }} /></td>
                      <td style={{ ...tdStyle, width: 10, padding: '5px 0' }} />
                    </tr>
                    )
                  })}
                </tbody>
              </table>
              </div>
            </div>
          )}
          {st === 'api' && (
            <div>
              {(s.api?.outputs ?? []).length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>暂无输出字段，点右下「＋ 输出字段」添加。</div>}
              <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: 920, borderCollapse: 'collapse', fontSize: 12, tableLayout: 'fixed', border: '1px solid #EEF2F7', borderRadius: 8, overflow: 'hidden' }}>
                <colgroup>
                  <col style={{ width: 40 }} />
                  <col style={{ width: 48 }} />
                  <col style={{ width: 100 }} />
                  <col style={{ width: 110 }} />
                  <col style={{ width: 96 }} />
                  <col style={{ width: 96 }} />
                  <col style={{ width: 84 }} />
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
                    <th style={{ ...thStyle, position: 'sticky', left: 88, zIndex: 3, background: '#F1F5F9', boxShadow: '1px 0 0 #E5E7EB' }}>提示标签</th>
                    <th style={thStyle}>字段 key</th>
                    <th style={thStyle}>类型</th>
                    <th style={thStyle}>显示方式</th>
                    <th style={thStyle}>条件</th>
                    <th style={thStyle}>条件值</th>
                    <th style={thStyle}>分值</th>
                    <th style={thStyle}>豁免</th>
                    <th style={thStyle}>操作</th>
                    <th style={{ ...thStyle, width: 10, padding: '7px 0' }} />
                  </tr>
                </thead>
                <tbody>
                  {(s.api?.outputs ?? []).map((o, idx) => {
                    const rowOn = o.visible ?? true
                    const rowBg = rowOn ? '#EFF6FF' : '#fff'
                    return (
                    <tr key={idx} style={{ borderBottom: '1px solid #F1F5F9', background: rowBg, opacity: rowOn ? 1 : 0.6 }}>
                      <td style={{ ...tdStyle, position: 'sticky', left: 0, zIndex: 2, background: rowBg, color: '#9CA3AF' }}>{idx + 1}</td>
                      <td style={{ ...tdStyle, position: 'sticky', left: 40, zIndex: 2, background: rowBg }}><input type="checkbox"  disabled={!canEdit} checked={o.visible ?? true} onChange={() => patchApi(s.id, (a) => ({ ...a, outputs: a.outputs.map((x, k) => (k === idx ? { ...x, visible: !x.visible } : x)) }))} style={{ width: 16, cursor: canEdit ? 'pointer' : 'not-allowed' }} /></td>
                      <td style={{ ...tdStyle, position: 'sticky', left: 88, zIndex: 2, background: rowBg, boxShadow: '1px 0 0 #E5E7EB' }}><input disabled={!canEdit || !rowOn} value={o.label} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, label: e.target.value }))} placeholder="显示名" style={{ ...inpSm, width: '100%', fontSize: 12 }} /></td>
                      <td style={tdStyle}><input disabled={!canEdit || !rowOn} value={o.key} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, key: e.target.value }))} placeholder="字段 key" style={{ ...inpSm, width: '100%', fontSize: 12 }} /></td>
                      <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={o.type} onChange={(e) => { const t = e.target.value as ApiFieldType; patchApiOutput(s.id, idx, (x) => ({ ...x, type: t, container: defaultContainer(t) })) }} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{Object.entries(API_FIELD_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></td>
                      <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={o.container ?? defaultContainer(o.type)} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, container: e.target.value as RenderContainer }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{containerOptions(defaultContainer(o.type)).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></td>
                      <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={o.condType ?? 'eq'} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, condType: e.target.value as FieldCondType }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{(['eq', 'empty', 'notEmpty', 'gt', 'lt', 'regex'] as FieldCondType[]).map((c) => <option key={c} value={c}>{FIELD_COND_LABEL[c]}</option>)}</select></td>
                      {(['gt', 'lt', 'eq', 'regex'].includes(o.condType ?? 'eq')) ? (
                        <td style={tdStyle}><input disabled={!canEdit || !rowOn} value={o.condValue ?? ''} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, condValue: e.target.value }))} placeholder={o.condType === 'regex' ? '正则' : '阈值'}  style={{ ...inpSm, width: '100%', fontSize: 12 }} /></td>
                      ) : <td style={tdStyle}></td>}
                      <td style={tdStyle}><input type="number" disabled={!canEdit || !rowOn} value={o.scorePoints ?? 0} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, scorePoints: +e.target.value || 0 }))}  style={{ ...numSm, width: '100%', fontSize: 12 }} /></td>
                      <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={(o.exempt ?? false) ? 'yes' : 'no'} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, exempt: e.target.value === 'yes' }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} ><option value="no">不可以</option><option value="yes">可以</option></select></td>
                      <td style={tdStyle}>{canEdit && <button disabled={!rowOn} onClick={() => delApiOutput(s.id, idx)}  style={{ ...miniBtn, color: '#DC2626', width: 28, padding: '2px 0' }}>×</button>}</td>
                      <td style={{ ...tdStyle, width: 10, padding: '5px 0' }} />
                    </tr>
                    )
                  })}
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
                        <th style={thStyle}>条件</th>
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
                          <td style={tdStyle}><select disabled={!canEdit || !rowOn} value={f.condType ?? 'hit'} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, condType: e.target.value as FieldCondType }))} style={{ ...inpSm, width: '100%', fontSize: 11 }} >{(['hit', 'miss'] as FieldCondType[]).map((c) => <option key={c} value={c}>{FIELD_COND_LABEL[c]}</option>)}</select></td>
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
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>本卡总分（按各项计分自动汇总）</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: r.total >= 0 ? '#047857' : '#DC2626' }}>{r.total >= 0 ? '+' : ''}{r.total}</span>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          {/* 基础信息（默认收起，缩略显示；展开可编辑、可收起） */}
          <div className="rounded-2xl border border-slate-100 bg-white shadow-card">
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
            <Panel title="报告内容配置">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>分段（{sections.length}）</span>
                {canEdit && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['data_source', 'api', 'rule_set'] as SectionSource[]).map((st) => (
                      <button key={st} onClick={() => addSection(st)} style={miniBtn}>＋ {SECTION_SOURCE_LABEL[st]}</button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sections.filter((s) => (s.homeTab ?? 'content') === 'content').map((s) => renderSectionCard(s, { showConfigBtn: true, showDelete: true, showMove: true }))}
              </div>
            </Panel>
          )}

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
            <Panel title="自动审核配置">
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
                const raw = demoScore ?? Math.round(scoreSummary.min + (scoreSummary.max - scoreSummary.min) * 0.72)
                const pvScore = Math.max(scoreSummary.min, Math.min(scoreSummary.max, raw))
                return (
                  <div style={{ border: '1px dashed #CBD5E1', borderRadius: 10, background: '#FBFCFE', padding: '14px 16px', margin: '4px 0 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#6B7280' }}>效果预览 · {active.scoreDisplay.displayComponent}</span>
                      <span style={{ flex: 1 }} />
                      <label style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#374151', cursor: canEdit ? 'pointer' : 'default' }}>
                        <input type="checkbox" disabled={!canEdit} checked={active.scoreDisplay.showThresholdBar} onChange={(e) => patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, showThresholdBar: e.target.checked } }))} />启用刻度条
                      </label>
                      <span style={{ fontSize: 12, color: '#6B7280' }}>示例分值</span>
                      <input type="range" min={scoreSummary.min} max={scoreSummary.max} value={pvScore} onChange={(e) => setDemoScore(+e.target.value)} style={{ width: 160 }} />
                      <input type="number" value={pvScore} onChange={(e) => setDemoScore(+e.target.value)} style={{ ...numSm, width: 70 }} />
                    </div>
                    <ScoreCardPreview sd={active.scoreDisplay} min={scoreSummary.min} max={scoreSummary.max} score={pvScore} patchGrade={patchGrade} canEdit={canEdit} />
                  </div>
                )
              })()}
              {/* 分值预测：最大 / 最小分值 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '8px 12px', border: '1px solid #DBEAFE', background: '#EFF6FF', borderRadius: 8, marginTop: 14, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1E40AF' }}>分值预测</span>
                <span style={{ fontSize: 13, color: '#374151' }}>最小分值 <b style={{ color: '#DC2626' }}>{scoreSummary.min}</b></span>
                <span style={{ fontSize: 13, color: '#374151' }}>最大分值 <b style={{ color: '#047857' }}>{scoreSummary.max}</b></span>
                <span style={{ fontSize: 12, color: '#6B7280' }}>（基础分 {active.scoreDisplay.baseScore} ＋ 加分满分 {scoreSummary.addMax} − 最大扣分 {scoreSummary.deductMax}）</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>分值分段</div>
                {canEdit && <button onClick={addGrade} style={miniBtn}>＋ 新增分段</button>}
              </div>
              <table className="w-full text-sm" style={{ marginTop: 4 }}>
                <thead><tr style={{ textAlign: 'left' }}>
                  <th className="px-2 py-2">分段名</th><th className="px-2 py-2">分值区间</th><th className="px-2 py-2">自动审核结果</th><th className="px-2 py-2">标签配色</th><th className="px-2 py-2">说明</th><th className="px-2 py-2"></th>
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
                <div style={{ marginTop: 8, fontSize: 12, color: '#047857' }}>✓ 分段区间已完整覆盖总分范围 {scoreSummary.min} ~ {scoreSummary.max}，无重叠无缝隙。</div>
              )}
              </div>
            </Panel>
          )}

          {tab === 'flow' && (
            <Panel title="人工审核配置">
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
                <colgroup><col style={{ width: 190 }} /><col style={{ width: 90 }} /><col /><col style={{ width: 220 }} /></colgroup>
                <thead><tr style={{ background: '#F8FAFC' }}>
                  {['触发分段（报告状态）', '自动结果', '业务流程配置', '决策建议文案'].map((h) => (
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
                        <td style={{ padding: '8px' }}><input disabled={!canEdit} value={flow.suggestionText} onChange={(e) => patchFlow(i + 1, (x) => ({ ...x, suggestionText: e.target.value }))} style={{ ...inpSm, width: '100%' }} /></td>
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

function ScoreCardPreview({ sd, min, max, score, patchGrade, canEdit }: {
  sd: { displayComponent: DisplayComponent; grades: ScoreGrade[]; showDescription: boolean; showThresholdBar: boolean; showRiskTags: boolean }
  min: number; max: number; score: number
  patchGrade: (i: number, fn: (g: ScoreGrade) => ScoreGrade) => void
  canEdit: boolean
}) {
  const range = Math.max(1, max - min)
  const pct = Math.max(0, Math.min(1, (score - min) / range))
  const grade = sd.grades.find((g) => score >= g.minScore && score <= g.maxScore)
    ?? (score < (sd.grades[0]?.minScore ?? min) ? sd.grades[0] : sd.grades[sd.grades.length - 1])
  const color = grade?.color ?? '#1D4ED8'
  const gradeChip = grade && (
    <span style={{ padding: '2px 10px', fontSize: 12, fontWeight: 600, borderRadius: 999, color: '#fff', background: color }}>{grade.grade}</span>
  )

  /* 阈值刻度条：以「分段自身覆盖区间」[barMin,barMax] 为分母（而非理论 min/max），四段铺满整条；
     数字按分段边界百分比绝对定位，与彩条精确对齐 */
  const barMin = sd.grades[0]?.minScore ?? min
  const barMax = sd.grades[sd.grades.length - 1]?.maxScore ?? max
  const barRange = Math.max(1, barMax - barMin)
  const thresholdBar = (
    <div style={{ marginTop: 10, width: '100%' }}>
      <div style={{ position: 'relative', height: 8, borderRadius: 999, background: '#E5E7EB', overflow: 'hidden' }}>
        {sd.grades.map((g, i) => {
          const left = ((Math.max(g.minScore, barMin) - barMin) / barRange) * 100
          const width = ((Math.min(g.maxScore, barMax) - Math.max(g.minScore, barMin)) / barRange) * 100
          return (
            <div key={i} style={{ position: 'absolute', left: `${left}%`, width: `${Math.max(0, width)}%`, height: '100%', background: g.color, opacity: g === grade ? 1 : 0.35 }} />
          )
        })}
      </div>
      <div style={{ position: 'relative', height: 16, marginTop: 3, width: '100%' }}>
        {(() => {
          const bounds = [barMin, ...sd.grades.slice(0, -1).map((g) => g.maxScore), barMax]
          return bounds.map((b, i) => {
            const leftPct = ((Math.min(Math.max(b, barMin), barMax) - barMin) / barRange) * 100
            const align = i === 0 ? 'left' : i === bounds.length - 1 ? 'right' : 'center'
            const translate = align === 'left' ? 'translateX(0)' : align === 'right' ? 'translateX(-100%)' : 'translateX(-50%)'
            return (
              <span key={i} style={{ position: 'absolute', left: `${leftPct}%`, transform: translate, fontSize: 11, color: i === 0 || i === bounds.length - 1 ? '#6B7280' : '#9CA3AF' }}>{b}</span>
            )
          })
        })()}
      </div>
    </div>
  )

  let visual: React.ReactNode = null
  if (sd.displayComponent === '大数字') {
    visual = (
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 46, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 13, color: '#9CA3AF' }}>/ {max} 分</span>
        {gradeChip}
      </div>
    )
  } else if (sd.displayComponent === '环形图') {
    const R = 46, C = 2 * Math.PI * R
    visual = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width="120" height="120" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r={R} fill="none" stroke="#E5E7EB" strokeWidth="12" />
          <circle cx="60" cy="60" r={R} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
            strokeDasharray={`${(C * pct).toFixed(1)} ${C.toFixed(1)}`} transform="rotate(-90 60 60)" />
          <text x="60" y="58" textAnchor="middle" fontSize="26" fontWeight="800" fill={color}>{score}</text>
          <text x="60" y="76" textAnchor="middle" fontSize="11" fill="#9CA3AF">/ {max} 分</text>
        </svg>
        {gradeChip}
      </div>
    )
  } else if (sd.displayComponent === '进度条') {
    visual = (
      <div style={{ width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color }}>{score} 分</span>
          {gradeChip}
        </div>
        <div style={{ position: 'relative', height: 16, borderRadius: 999, overflow: 'hidden', display: 'flex', background: '#F1F5F9' }}>
          {sd.grades.map((g, i) => (
            <div key={i} style={{ width: `${Math.max(0, (Math.min(g.maxScore, max) - Math.max(g.minScore, min)) / range) * 100}%`, background: g.color, opacity: 0.28 }} />
          ))}
          <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct * 100}%`, background: color, opacity: 0.9, borderRadius: 999 }} />
        </div>
      </div>
    )
  } else {
    /* 仪表盘：半圆弧按分段着色 + 指针；以分段覆盖区间[barMin,barMax]为分母，弧与指针对齐铺满整弧 */
    const cx = 90, cy = 84, R2 = 66
    const pt = (p: number, r: number) => ({ x: cx - r * Math.cos(p * Math.PI), y: cy - r * Math.sin(p * Math.PI) })
    const arc = (p1: number, p2: number, r: number) => {
      const a = pt(p1, r), b = pt(p2, r)
      return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} A ${r} ${r} 0 0 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)}`
    }
    const gPct = Math.max(0, Math.min(1, (score - barMin) / barRange))
    const needle = pt(gPct, R2 - 16)
    visual = (
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <svg width="180" height="104" viewBox="0 0 180 104">
          {sd.grades.map((g, i) => {
            const p1 = Math.max(0, (g.minScore - barMin) / barRange), p2 = Math.min(1, (g.maxScore - barMin) / barRange)
            if (p2 <= p1) return null
            return <path key={i} d={arc(p1, p2, R2)} fill="none" stroke={g.color} strokeWidth="12" opacity={g === grade ? 1 : 0.35} />
          })}
          <line x1={cx} y1={cy} x2={needle.x.toFixed(1)} y2={needle.y.toFixed(1)} stroke="#334155" strokeWidth="3" strokeLinecap="round" />
          <circle cx={cx} cy={cy} r="5" fill="#334155" />
          <text x={cx} y={cy + 16} textAnchor="middle" fontSize="20" fontWeight="800" fill={color}>{score}</text>
        </svg>
        {gradeChip}
      </div>
    )
  }

  return (
    <div>
      {visual}
      {sd.showThresholdBar && thresholdBar}
      {sd.showRiskTags && grade && (() => {
        const gi = sd.grades.findIndex((g) => g === grade)
        const editable = canEdit && gi >= 0
        return (
          <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            {editable ? (
              <>
                <select value={grade.riskLevel}
                  onChange={(e) => patchGrade(gi, (g) => ({ ...g, riskLevel: e.target.value as RiskLevel }))}
                  style={{ ...pvTag(color), cursor: 'pointer' }}>
                  {(['低', '中', '高', '极高'] as RiskLevel[]).map((r) => <option key={r} value={r}>风险{r}</option>)}
                </select>
                <select value={grade.autoResult}
                  onChange={(e) => patchGrade(gi, (g) => ({ ...g, autoResult: e.target.value as AutoResult }))}
                  style={{ ...pvTag(AUTO_RESULT_COLOR[grade.autoResult]), cursor: 'pointer' }}>
                  {AUTO_RESULT_LIST.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </>
            ) : (
              <>
                <span style={pvTag(color)}>风险{grade.riskLevel}</span>
                <span style={pvTag('#64748B')}>{grade.autoResult}</span>
              </>
            )}
          </div>
        )
      })()}
      {sd.showDescription && grade?.description && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#6B7280' }}>{grade.description}</div>
      )}
    </div>
  )
}
