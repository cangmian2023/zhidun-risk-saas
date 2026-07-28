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
  ReportTemplate, ReportType, TplStatus, RiskLevel, DisplayComponent, ScoreGrade, ScoreComponent, ScoreDisplayConfig, BusinessFlowConfig,
  ThemeConfig, ExportConfig, SectionConfig, FieldConfig, SectionSource, ROLE_PERM, computeSectionScore,
  DataSourceConfig, DbField, ApiParam, ApiOutput, ApiConfig, ApiHeader, ApiMethod, ApiBodyType, ApiFieldType,
  RenderContainer, RENDER_CONTAINER_LABEL, API_FIELD_TYPE_LABEL, defaultContainer, recommendDbContainer,
  MaskRule, MASK_RULE_LABEL, autoMaskRule, Severity, SEVERITY_LABEL, Align, ALIGN_LABEL, FieldCondType, FIELD_COND_LABEL,
  REPORT_META, PRODUCT_TREE, PRODUCT_LEAVES, PRODUCT_ALL, scopeLabel,
  ACTION_CATALOG, ACTION_BY_TYPE, THEME_PRESETS, THEME_LIST,
  SECTION_SOURCE_LABEL, RULE_SETS, DB_TYPES, mockTableColumns,
  SourceTestResult, testSourceConfig, parseCurl, buildCurl,
  syncFlowToGrades, buildTemplate, seedReportTemplates,
} from './reportTemplateData'

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
const inpSm: React.CSSProperties = { padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, width: '100%', minWidth: 90 }
const numSm: React.CSSProperties = { width: 56, padding: '4px 6px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }
const colorInp: React.CSSProperties = { width: 48, height: 32, border: '1px solid #D1D5DB', borderRadius: 6, background: 'none' }
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
  const [tab, setTab] = useState<'content' | 'score' | 'flow' | 'theme' | 'export'>('content')
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
      const ng: ScoreGrade = { grade: `新档${t.scoreDisplay.grades.length + 1}`, label: '新风险档', minScore: base + 1, maxScore: 100, riskLevel: '中', color: '#F59E0B', description: '新评分档，请配置区间与处置' }
      const grades = [...t.scoreDisplay.grades, ng]
      setSyncHint('已新增评分档，下方「审核操作」已自动同步增加一行')
      return { ...t, scoreDisplay: { ...t.scoreDisplay, grades }, businessFlow: syncFlowToGrades(t.businessFlow, grades) }
    })
  }
  const delGrade = (i: number) => {
    if (i === 0) return
    patch((t) => {
      const grades = t.scoreDisplay.grades.filter((_, k) => k !== i)
      setSyncHint('已删除一个评分档，下方「审核操作」已自动同步删除对应行')
      return { ...t, scoreDisplay: { ...t.scoreDisplay, grades }, businessFlow: syncFlowToGrades(t.businessFlow, grades) }
    })
  }
  /* 总分计算方式（加权构成） */
  const patchScore = (fn: (s: ScoreDisplayConfig) => ScoreDisplayConfig) =>
    patch((t) => ({ ...t, scoreDisplay: fn(t.scoreDisplay) }))
  const addComponent = () =>
    patchScore((s) => ({ ...s, components: [...s.components, { name: '', weight: 0 }] }))
  const patchComponent = (i: number, fn: (c: ScoreComponent) => ScoreComponent) =>
    patchScore((s) => ({ ...s, components: s.components.map((c, k) => (k === i ? fn(c) : c)) }))
  const delComponent = (i: number) =>
    patchScore((s) => ({ ...s, components: s.components.filter((_, k) => k !== i) }))
  const compTotal = active.scoreDisplay.components.reduce((sum, c) => sum + (c.weight || 0), 0)
  const patchFlow = (i: number, fn: (f: BusinessFlowConfig) => BusinessFlowConfig) =>
    patch((t) => ({ ...t, businessFlow: t.businessFlow.map((f, k) => (k === i ? fn(f) : f)) }))
  const patchTheme = (fn: (th: ThemeConfig) => ThemeConfig) => patch((t) => ({ ...t, theme: fn(t.theme) }))
  const patchExport = (fn: (e: ExportConfig) => ExportConfig) => patch((t) => ({ ...t, export: fn(t.export) }))

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
  /* 计分改为逐条展示项配置（scoreMode / scorePoints / condType / condValue），本卡总分由 computeSectionScore 自动汇总 */
  /* 评分方案 / 审核操作 两个 Tab 的首行配置：显示开关 + 报告内卡片标题 */
  const patchScoreBlock = (fn: (b: { show: boolean; title: string }) => { show: boolean; title: string }) =>
    patch((t) => ({ ...t, scoreBlock: fn(t.scoreBlock) }))
  const patchFlowBlock = (fn: (b: { show: boolean; title: string }) => { show: boolean; title: string }) =>
    patch((t) => ({ ...t, flowBlock: fn(t.flowBlock) }))
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
  const saveDraft = () => { patch((t) => ({ ...t, status: '草稿' })); logChange('编辑', '保存模板配置') }
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
      businessFlow: src.businessFlow.map((f) => ({ ...f, allowedActions: [...f.allowedActions] })),
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
        <PageHeader title="报告模板配置" subtitle="统一管理信息核验 / 信用风控 / 欺诈识别 / 决策报告四类报告的展示模板、评分等级与审核操作"
          actions={<Button variant="primary" onClick={() => setShowNew(true)}>＋ 新建模板</Button>} />
        <Panel desc="报告模板决定「某类报告长什么样、分数怎么分档、不同分数触发什么业务动作」。每个报告类型可并存多个模板，其中一个设为默认。">
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
                    <Button variant="ghost" onClick={() => nav(`/console/cr/report-template-preview?id=${t.id}`)}>预览</Button>
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
              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>取自该表，勾选「启用」即展示；「字段名」是库表原始名（只读），「提示标签」是前端显示名（如 姓名），显示方式/脱敏规则/说明也可在卡片上直接配。</div>
              {(s.ds?.tableFields ?? []).length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>尚未读取表结构{opts.showConfigBtn ? '，点右上「配置来源」连接数据库并读取字段。' : '。'}</div>}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid #EEF2F7', borderRadius: 8, overflow: 'hidden' }}>
                <li style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 600, color: '#6B7280', background: '#F8FAFC', padding: '6px 10px', borderBottom: '1px solid #EEF2F7' }}>
                  <span style={{ width: 46, flex: '0 0 auto', textAlign: 'center' }}>启用</span>
                  <span style={{ flex: '1 1 40%', minWidth: 90 }}>字段名（原始）</span>
                  <span style={{ flex: '1 1 40%', minWidth: 90 }}>提示标签（显示名）</span>
                  <span style={{ width: 64, flex: '0 0 auto', textAlign: 'center' }}>类型</span>
                  <span style={{ width: 108, flex: '0 0 auto', textAlign: 'center' }}>显示方式</span>
                  <span style={{ width: 96, flex: '0 0 auto', textAlign: 'center' }}>脱敏规则</span>
                  <span style={{ width: 120, flex: '0 0 auto', textAlign: 'center' }}>说明</span>
                  <span style={{ width: 80, flex: '0 0 auto', textAlign: 'center' }}>计分</span>
                  <span style={{ width: 60, flex: '0 0 auto', textAlign: 'center' }}>分值</span>
                  <span style={{ width: 92, flex: '0 0 auto', textAlign: 'center' }}>条件</span>
                  <span style={{ width: 92, flex: '0 0 auto', textAlign: 'center' }}>条件值</span>
                </li>
                {(s.ds?.tableFields ?? []).map((tf, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 10px', borderBottom: '1px solid #F1F5F9', background: tf.visible ? '#ECFDF5' : '#fff' }}>
                    <input type="checkbox" title="勾选=启用，取消=禁用" disabled={!canEdit} checked={tf.visible} onChange={() => toggleDsField(s.id, idx)} style={{ width: 18, flex: '0 0 auto' }} />
                    <span style={{ fontWeight: 500, flex: '1 1 40%', minWidth: 90, color: '#374151' }}>{tf.name}</span>
                    <input disabled={!canEdit} value={tf.label ?? ''} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, label: e.target.value }))} placeholder={tf.name} style={{ ...inpSm, flex: '1 1 40%', minWidth: 90, fontSize: 12 }} title="前端显示名（如 姓名→张三）" />
                    <span style={{ width: 64, flex: '0 0 auto', textAlign: 'center', fontSize: 12, color: '#6B7280' }}>{tf.type}</span>
                    <select disabled={!canEdit} value={tf.container ?? recommendDbContainer(tf.type)} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, container: e.target.value as RenderContainer }))} style={{ ...inpSm, width: 108, flex: '0 0 auto', fontSize: 11 }} title="显示方式（按列类型推荐，可改）">
                      {containerOptions(recommendDbContainer(tf.type)).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select disabled={!canEdit} value={tf.maskRule ?? 'none'} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, maskRule: e.target.value as MaskRule }))} style={{ ...inpSm, width: 96, flex: '0 0 auto', fontSize: 11 }} title="脱敏规则">
                      {Object.entries(MASK_RULE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <input disabled={!canEdit} value={tf.remark ?? ''} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, remark: e.target.value }))} placeholder="备注" style={{ ...inpSm, width: 120, flex: '0 0 auto', fontSize: 12 }} />
                    <select disabled={!canEdit} value={tf.scoreMode ?? 'deduct'} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, scoreMode: e.target.value as 'add' | 'deduct' }))} style={{ ...inpSm, width: 80, flex: '0 0 auto', fontSize: 11 }} title="计分：加分/扣分">
                      <option value="add">加分</option><option value="deduct">扣分</option>
                    </select>
                    <input type="number" disabled={!canEdit} value={tf.scorePoints ?? 0} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, scorePoints: +e.target.value || 0 }))} title="分值（加 / 扣多少）" style={{ ...numSm, width: 60, flex: '0 0 auto', fontSize: 12 }} />
                    <select disabled={!canEdit} value={tf.condType ?? 'empty'} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, condType: e.target.value as FieldCondType }))} style={{ ...inpSm, width: 92, flex: '0 0 auto', fontSize: 11 }} title="计分条件">
                      {(['empty', 'notEmpty', 'gt', 'lt', 'eq'] as FieldCondType[]).map((c) => <option key={c} value={c}>{FIELD_COND_LABEL[c]}</option>)}
                    </select>
                    {(['gt', 'lt', 'eq'].includes(tf.condType ?? 'empty')) && (
                      <input disabled={!canEdit} value={tf.condValue ?? ''} onChange={(e) => patchDsField(s.id, idx, (f) => ({ ...f, condValue: e.target.value }))} placeholder="阈值" title="条件阈值" style={{ ...inpSm, width: 92, flex: '0 0 auto', fontSize: 12 }} />
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {st === 'api' && (
            <div>
              <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>取自接口返回值，可直接增 / 删 / 改 / 查；勾选「启用」即展示。字段 key / 显示名 / 类型 / 显示方式 / 单位 / 对齐均在卡片上配置，连接与请求体在「配置来源」弹窗里填。</div>
              {(s.api?.outputs ?? []).length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>暂无输出字段，点右下「＋ 输出字段」添加。</div>}
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid #EEF2F7', borderRadius: 8, overflow: 'hidden' }}>
                <li style={{ display: 'flex', gap: 8, fontSize: 11, fontWeight: 600, color: '#6B7280', background: '#F8FAFC', padding: '6px 10px', borderBottom: '1px solid #EEF2F7' }}>
                  <span style={{ width: 46, flex: '0 0 auto', textAlign: 'center' }}>启用</span>
                  <span style={{ flex: '1 1 40%', minWidth: 90 }}>显示名（标签）</span>
                  <span style={{ width: 110, flex: '0 0 auto' }}>字段 key</span>
                  <span style={{ width: 120, flex: '0 0 auto', textAlign: 'center' }}>类型</span>
                  <span style={{ width: 108, flex: '0 0 auto', textAlign: 'center' }}>显示方式</span>
                  <span style={{ width: 70, flex: '0 0 auto', textAlign: 'center' }}>单位</span>
                  <span style={{ width: 84, flex: '0 0 auto', textAlign: 'center' }}>对齐</span>
                  <span style={{ width: 80, flex: '0 0 auto', textAlign: 'center' }}>计分</span>
                  <span style={{ width: 60, flex: '0 0 auto', textAlign: 'center' }}>分值</span>
                  <span style={{ width: 92, flex: '0 0 auto', textAlign: 'center' }}>条件</span>
                  <span style={{ width: 92, flex: '0 0 auto', textAlign: 'center' }}>条件值</span>
                  <span style={{ width: 36, flex: '0 0 auto', textAlign: 'center' }}>操作</span>
                </li>
                {(s.api?.outputs ?? []).map((o, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, padding: '6px 10px', borderBottom: '1px solid #F1F5F9', background: (o.visible ?? true) ? '#EFF6FF' : '#fff' }}>
                    <input type="checkbox" title="勾选=启用，取消=禁用" disabled={!canEdit} checked={o.visible ?? true} onChange={() => patchApi(s.id, (a) => ({ ...a, outputs: a.outputs.map((x, k) => (k === idx ? { ...x, visible: !x.visible } : x)) }))} style={{ width: 18, flex: '0 0 auto' }} />
                    <input disabled={!canEdit} value={o.label} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, label: e.target.value }))} placeholder="显示名" style={{ ...inpSm, flex: '1 1 40%', minWidth: 90, fontSize: 12 }} />
                    <input disabled={!canEdit} value={o.key} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, key: e.target.value }))} placeholder="字段 key" style={{ ...inpSm, width: 110, flex: '0 0 auto', fontSize: 12 }} />
                    <select disabled={!canEdit} value={o.type} onChange={(e) => { const t = e.target.value as ApiFieldType; patchApiOutput(s.id, idx, (x) => ({ ...x, type: t, container: defaultContainer(t) })) }} style={{ ...inpSm, width: 120, flex: '0 0 auto', fontSize: 11 }} title="数据域类型">{Object.entries(API_FIELD_TYPE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
                    <select disabled={!canEdit} value={o.container ?? defaultContainer(o.type)} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, container: e.target.value as RenderContainer }))} style={{ ...inpSm, width: 108, flex: '0 0 auto', fontSize: 11 }} title="显示方式（按类型推荐，可改）">
                      {containerOptions(defaultContainer(o.type)).map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </select>
                    <input disabled={!canEdit} value={o.unit ?? ''} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, unit: e.target.value }))} placeholder="如 元/%" style={{ ...inpSm, width: 70, flex: '0 0 auto', fontSize: 12 }} />
                    <select disabled={!canEdit} value={o.align ?? 'right'} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, align: e.target.value as Align }))} style={{ ...inpSm, width: 84, flex: '0 0 auto', fontSize: 11 }} title="数值对齐">
                      {Object.entries(ALIGN_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <select disabled={!canEdit} value={o.scoreMode ?? 'deduct'} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, scoreMode: e.target.value as 'add' | 'deduct' }))} style={{ ...inpSm, width: 80, flex: '0 0 auto', fontSize: 11 }} title="计分：加分/扣分">
                      <option value="add">加分</option><option value="deduct">扣分</option>
                    </select>
                    <input type="number" disabled={!canEdit} value={o.scorePoints ?? 0} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, scorePoints: +e.target.value || 0 }))} title="分值（加 / 扣多少）" style={{ ...numSm, width: 60, flex: '0 0 auto', fontSize: 12 }} />
                    <select disabled={!canEdit} value={o.condType ?? 'empty'} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, condType: e.target.value as FieldCondType }))} style={{ ...inpSm, width: 92, flex: '0 0 auto', fontSize: 11 }} title="计分条件">
                      {(['empty', 'notEmpty', 'gt', 'lt', 'eq', 'regex'] as FieldCondType[]).map((c) => <option key={c} value={c}>{FIELD_COND_LABEL[c]}</option>)}
                    </select>
                    {(['gt', 'lt', 'eq', 'regex'].includes(o.condType ?? 'empty')) && (
                      <input disabled={!canEdit} value={o.condValue ?? ''} onChange={(e) => patchApiOutput(s.id, idx, (x) => ({ ...x, condValue: e.target.value }))} placeholder={o.condType === 'regex' ? '正则' : '阈值'} title="条件值（阈值 / 正则）" style={{ ...inpSm, width: 92, flex: '0 0 auto', fontSize: 12 }} />
                    )}
                    {canEdit && <button onClick={() => delApiOutput(s.id, idx)} title="删除该输出字段" style={{ ...miniBtn, color: '#DC2626', width: 36, flex: '0 0 auto', padding: '2px 0' }}>×</button>}
                  </li>
                ))}
              </ul>
              {canEdit && <button onClick={() => addApiOutput(s.id)} style={{ ...miniBtn, marginTop: 6 }}>＋ 输出字段</button>}
            </div>
          )}
          {st === 'rule_set' && (
            <div>
              {(!s.ruleSetId || s.fields.length === 0) && <div style={{ fontSize: 12, color: '#9CA3AF' }}>尚未选择规则合集{opts.showConfigBtn ? '，点右上「配置来源」选择并勾选用/不用的规则项。' : '。'}</div>}
              {s.ruleSetId && s.fields.length > 0 && (
                <div>
                  <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 600, marginBottom: 6 }}>已启用 {s.fields.filter((f) => f.visible).length} / 共 {s.fields.length} 条规则（勾选=启用；权重 / 风险等级 / 命中文案 / 命中即拒 可在卡片上直接改）</div>
                  <ul style={{ listStyle: 'none', margin: 0, padding: 0, border: '1px solid #EEF2F7', borderRadius: 8, overflow: 'hidden' }}>
                    <li style={{ display: 'flex', gap: 8, fontSize: 11, fontWeight: 600, color: '#6B7280', background: '#F8FAFC', padding: '6px 10px', borderBottom: '1px solid #EEF2F7' }}>
                      <span style={{ width: 46, flex: '0 0 auto', textAlign: 'center' }}>启用</span>
                      <span style={{ flex: 1, minWidth: 0 }}>规则名</span>
                      <span style={{ width: 150, flex: '0 0 auto' }}>说明</span>
                      <span style={{ width: 64, flex: '0 0 auto', textAlign: 'center' }}>权重</span>
                      <span style={{ width: 80, flex: '0 0 auto', textAlign: 'center' }}>风险等级</span>
                      <span style={{ width: 96, flex: '0 0 auto', textAlign: 'center' }}>命中文案</span>
                      <span style={{ width: 96, flex: '0 0 auto', textAlign: 'center' }}>命中即拒</span>
                      <span style={{ width: 80, flex: '0 0 auto', textAlign: 'center' }}>计分</span>
                      <span style={{ width: 60, flex: '0 0 auto', textAlign: 'center' }}>分值</span>
                      <span style={{ width: 92, flex: '0 0 auto', textAlign: 'center' }}>条件</span>
                    </li>
                    {s.fields.map((f) => (
                      <li key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '6px 10px', borderBottom: '1px solid #F1F5F9', background: f.visible ? '#F5F3FF' : '#fff' }}>
                        <input type="checkbox" title="勾选=启用，取消=禁用" disabled={!canEdit} checked={f.visible} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, visible: e.target.checked }))} style={{ width: 18, flex: '0 0 auto' }} />
                        <span style={{ fontWeight: 500, flex: 1, minWidth: 0 }}>{f.name}</span>
                        <span style={{ width: 150, flex: '0 0 auto', fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.desc}</span>
                        <input disabled={!canEdit} type="number" value={f.weight ?? 0} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, weight: +e.target.value || 0 }))} title="权重（影响风险累计）" style={{ ...inpSm, width: 64, flex: '0 0 auto', fontSize: 12 }} />
                        <select disabled={!canEdit} value={f.severity ?? 'mid'} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, severity: e.target.value as Severity }))} style={{ ...inpSm, width: 80, flex: '0 0 auto', fontSize: 11 }} title="风险等级">
                          {Object.entries(SEVERITY_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <input disabled={!canEdit} value={f.hitText ?? '命中'} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, hitText: e.target.value }))} title="命中时显示文案" style={{ ...inpSm, width: 96, flex: '0 0 auto', fontSize: 12 }} />
                        <input type="checkbox" disabled={!canEdit} checked={f.hitReject ?? false} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, hitReject: e.target.checked }))} title="该条规则命中即整笔申请拒绝" style={{ width: 18, flex: '0 0 auto' }} />
                        <select disabled={!canEdit} value={f.scoreMode ?? 'deduct'} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, scoreMode: e.target.value as 'add' | 'deduct' }))} style={{ ...inpSm, width: 80, flex: '0 0 auto', fontSize: 11 }} title="计分：加分/扣分（规则默认扣分）">
                          <option value="add">加分</option><option value="deduct">扣分</option>
                        </select>
                        <input type="number" disabled={!canEdit} value={f.scorePoints ?? 0} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, scorePoints: +e.target.value || 0 }))} title="分值（命中扣多少）" style={{ ...numSm, width: 60, flex: '0 0 auto', fontSize: 12 }} />
                        <span style={{ width: 92, flex: '0 0 auto', textAlign: 'center', fontSize: 12, color: '#6B7280' }} title="规则命中即触发，无需额外条件">命中</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {/* —— 本卡总分（按各展示项计分配置自动汇总，只读） —— */}
          <div style={{ padding: '8px 12px', background: '#F8FAFC', borderTop: '1px dashed #E5E7EB' }}>
            {(() => {
              const r = computeSectionScore(s)
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>本卡总分（按各项计分自动汇总）</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: r.total >= 0 ? '#047857' : '#DC2626' }}>{r.total >= 0 ? '+' : ''}{r.total}</span>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>（加分 {r.addCount} 项 · 扣分 {r.deductCount} 项；命中即拒项不计入）</span>
                </div>
              )
            })()}
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
            {canEdit && <Button onClick={saveDraft}>保存</Button>}
            {canEdit && <Button variant="secondary" onClick={publishNewVersion}>发布新版本</Button>}
            {perm.enable && active.status !== '已启用' && <Button variant="primary" onClick={() => changeStatus('已启用')}>启用</Button>}
            {perm.enable && active.status === '已启用' && <Button onClick={() => changeStatus('已停用')}>停用</Button>}
            {perm.setDefault && !active.isDefault && <Button variant="ghost" onClick={setDefault}>设为默认</Button>}
            {canEdit && <Button variant="ghost" onClick={copyTpl}>复制</Button>}
            {perm.del && active.status !== '已启用' && !active.isDefault && <Button variant="ghost" onClick={() => deleteTpl(active.id)}>删除</Button>}
          </>
        } />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, alignItems: 'start' }}>
        <div style={{ minWidth: 0 }}>
          {/* 基础信息 */}
          <Panel title="基础信息" desc="模板的通用属性与报告级基础开关（所有配置 Tab 共用）。操作日志不在「报告内容」里当分段配，由本处统一控制显隐。">
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
          </Panel>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 16, borderBottom: '1px solid #E5E7EB', marginBottom: 14 }}>
            {([['content', '报告内容'], ['score', '评分方案'], ['flow', '审核操作'], ['theme', '样式主题'], ['export', '导出模板']] as [any, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 16px', border: 'none', borderBottom: tab === k ? '2px solid #3B82F6' : '2px solid transparent', background: 'none', fontWeight: tab === k ? 700 : 400, color: tab === k ? '#1D4ED8' : '#6B7280', cursor: 'pointer' }}>{label}</button>
            ))}
          </div>

          {tab === 'content' && (
            <Panel title="报告内容配置" desc="每个分段有『单一来源』：数据源 / 接口调用 / 规则集。卡片上只勾选『报告中展示哪些项』；IP/端口/接口地址/规则集等『配置项』点「配置来源」在弹窗里填，并可一键测试可用性。每个分段还可配置「上分」（是否参与报告总分、加分/扣分、分值区间与权重）。">
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
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>读取表字段后，字段的「启用 / 提示标签（显示名）/ 显示方式 / 脱敏规则 / 说明」均在卡片上直接配置，无需在此填写。</div>
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
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>输出字段的「增 / 删 / 改 / 查」在卡片上直接操作（key / 显示名 / 类型 / 显示方式 / 单位 / 对齐）；此处仅配置接口请求（方法 / 地址 / 参数 / 请求头 / 请求体）。</div>
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
                      <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>勾选即纳入报告碰撞；「命中 / 未命中」文案在此配置。</div>
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
            <Panel title="评分方案配置" desc="选择评分卡形态，并划分评分等级（风险档）与阈值。等级名称/数量变更会自动同步到「审核操作」Tab。">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#F8FAFC', marginBottom: 12 }}>
                <input type="checkbox" disabled={!canEdit} checked={active.scoreBlock.show} onChange={(e) => patchScoreBlock((b) => ({ ...b, show: e.target.checked }))} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>在报告中显示「得分计算」卡片</span>
                <span style={{ flex: 1 }} />
                <input disabled={!canEdit} value={active.scoreBlock.title} onChange={(e) => patchScoreBlock((b) => ({ ...b, title: e.target.value }))} placeholder="卡片标题（留空则用默认「得分计算」）" style={{ ...inp, width: 300 }} />
              </div>
              {sections.filter((s) => (s.homeTab ?? 'content') === 'score').map((s) => renderSectionCard(s, { showConfigBtn: false, showDelete: false, showMove: false }))}
              <Field label="评分卡形态">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['大数字', '环形图', '进度条', '仪表盘'] as DisplayComponent[]).map((c) => (
                    <button key={c} disabled={!canEdit} onClick={() => patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, displayComponent: c } }))}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${active.scoreDisplay.displayComponent === c ? SEL : '#D1D5DB'}`, background: active.scoreDisplay.displayComponent === c ? SEL_BG : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{c}</button>
                  ))}
                </div>
              </Field>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '10px 0' }}>
                {([['showDescription', '显示风险描述'], ['showThresholdBar', '显示阈值刻度'], ['showComponents', '显示构成项'], ['showRiskTags', '显示风险标签']] as [keyof typeof active.scoreDisplay, string][]).map(([k, label]) => (
                  <label key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <input type="checkbox" disabled={!canEdit} checked={active.scoreDisplay[k] as boolean} onChange={(e) => patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, [k]: e.target.checked } }))} />{label}
                  </label>
                ))}
              </div>
              {/* 总分计算方式（加权构成）：算总分 */}
              <div style={{ marginTop: 14, padding: '12px 14px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#FBFCFE' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>总分计算方式（加权构成）</div>
                <div style={{ fontSize: 12, color: '#6B7280', margin: '2px 0 8' }}>各项按权重加权求和得到报告顶部的总分；权重合计应为 100%。</div>
                <div style={{ display: 'flex', gap: 10, fontSize: 11, fontWeight: 600, color: '#6B7280', padding: '4px 10px' }}>
                  <span style={{ flex: 1, minWidth: 0 }}>构成项</span>
                  <span style={{ width: 120, flex: '0 0 auto', textAlign: 'center' }}>权重（%）</span>
                  <span style={{ width: 32, flex: '0 0 auto' }}></span>
                </div>
                {active.scoreDisplay.components.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '4px 10px' }}>
                    <input disabled={!canEdit} value={c.name} onChange={(e) => patchComponent(i, (x) => ({ ...x, name: e.target.value }))} placeholder="构成项名称" style={{ ...inpSm, flex: 1 }} />
                    <input type="number" disabled={!canEdit} value={c.weight} onChange={(e) => patchComponent(i, (x) => ({ ...x, weight: +e.target.value }))} style={{ ...numSm, width: 120, flex: '0 0 auto' }} />
                    {canEdit && <button onClick={() => delComponent(i)} style={{ ...miniBtn, color: '#DC2626', width: 32, flex: '0 0 auto' }}>×</button>}
                  </div>
                ))}
                {canEdit && <button onClick={addComponent} style={{ ...miniBtn, marginTop: 4 }}>＋ 新增构成项</button>}
                <div style={{ marginTop: 8, fontSize: 12, color: compTotal === 100 ? '#047857' : '#B45309' }}>
                  权重合计：<b>{compTotal}%</b>{compTotal !== 100 && '（应为 100%，请调整各项权重）'}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, marginTop: 14 }}>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>评分等级（风险档 · 分值分段）</div>
                {canEdit && <button onClick={addGrade} style={miniBtn}>＋ 新增等级</button>}
              </div>
              <table className="w-full text-sm" style={{ marginTop: 4 }}>
                <thead><tr style={{ textAlign: 'left' }}>
                  <th className="px-2 py-2">等级名</th><th className="px-2 py-2">标签</th><th className="px-2 py-2">分值区间</th><th className="px-2 py-2">风险</th><th className="px-2 py-2">颜色</th><th className="px-2 py-2">说明</th><th className="px-2 py-2"></th>
                </tr></thead>
                <tbody>
                  {active.scoreDisplay.grades.map((g, i) => (
                    <tr key={g.grade} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td className="px-2 py-2 font-medium"><input disabled={!canEdit} value={g.grade} onChange={(e) => patchGrade(i, (x) => ({ ...x, grade: e.target.value }))} style={inpSm} /></td>
                      <td className="px-2 py-2"><input disabled={!canEdit} value={g.label} onChange={(e) => patchGrade(i, (x) => ({ ...x, label: e.target.value }))} style={inpSm} /></td>
                      <td className="px-2 py-2" style={{ display: 'flex', gap: 4 }}>
                        <input type="number" disabled={!canEdit} value={g.minScore} onChange={(e) => patchGrade(i, (x) => ({ ...x, minScore: +e.target.value }))} style={numSm} />~
                        <input type="number" disabled={!canEdit} value={g.maxScore} onChange={(e) => patchGrade(i, (x) => ({ ...x, maxScore: +e.target.value }))} style={numSm} />
                      </td>
                      <td className="px-2 py-2"><select disabled={!canEdit} value={g.riskLevel} onChange={(e) => patchGrade(i, (x) => ({ ...x, riskLevel: e.target.value as RiskLevel }))} style={inpSm}>{['低', '中', '高', '极高'].map((r) => <option key={r}>{r}</option>)}</select></td>
                      <td className="px-2 py-2"><input type="color" disabled={!canEdit} value={g.color} onChange={(e) => patchGrade(i, (x) => ({ ...x, color: e.target.value }))} style={{ width: 32, height: 28, border: 'none', background: 'none' }} /></td>
                      <td className="px-2 py-2"><input disabled={!canEdit} value={g.description} onChange={(e) => patchGrade(i, (x) => ({ ...x, description: e.target.value }))} style={inpSm} /></td>
                      <td className="px-2 py-2">{canEdit && i > 0 && <button onClick={() => delGrade(i)} style={{ ...miniBtn, color: '#DC2626', borderColor: '#FECACA' }}>删除</button>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>提示：等级按从上到下顺序对应「审核操作」的每一行，无需在审核操作里再单独命名。</div>
            </Panel>
          )}

          {tab === 'flow' && (
            <Panel title="审核操作配置" desc="按评分等级映射：自动审核结论、人工状态、授信额度比例、复核级别与可执行操作。每一行对应上方「评分方案」中的一个等级。">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#F8FAFC', marginBottom: 12 }}>
                <input type="checkbox" disabled={!canEdit} checked={active.flowBlock.show} onChange={(e) => patchFlowBlock((b) => ({ ...b, show: e.target.checked }))} />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>在报告中显示「结论与终审」卡片</span>
                <span style={{ flex: 1 }} />
                <input disabled={!canEdit} value={active.flowBlock.title} onChange={(e) => patchFlowBlock((b) => ({ ...b, title: e.target.value }))} placeholder="卡片标题（留空则用默认「结论与终审」）" style={{ ...inp, width: 300 }} />
              </div>
              {sections.filter((s) => (s.homeTab ?? 'content') === 'flow').map((s) => renderSectionCard(s, { showConfigBtn: false, showDelete: false, showMove: false }))}
              {syncHint && <div style={{ fontSize: 12, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 8, padding: '6px 10px', marginBottom: 10 }}>{syncHint}</div>}
              <div style={{ overflowX: 'auto' }}>
                <table className="w-full text-sm">
                  <thead><tr style={{ textAlign: 'left' }}>
                    <th className="px-2 py-2">评分等级</th><th className="px-2 py-2">自动审核</th><th className="px-2 py-2">人工状态</th><th className="px-2 py-2">授信额度比例</th><th className="px-2 py-2">复核级别</th><th className="px-2 py-2">需人工复核</th><th className="px-2 py-2">可执行操作</th><th className="px-2 py-2">决策建议文案</th>
                  </tr></thead>
                  <tbody>
                    <tr style={{ borderTop: '1px solid #F1F5F9', background: '#F8FAFC' }}>
                      <td className="px-2 py-2 font-medium" colSpan={8}>计算中（评分尚未得出时的初始态，不可配置）</td>
                    </tr>
                    {flowRows.map(({ grade, flow }, i) => (
                      <tr key={flow.gradeId} style={{ borderTop: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                        <td className="px-2 py-2 font-medium">{grade ? `${grade.grade} · ${grade.label}` : flow.gradeId}<br /><span style={{ fontSize: 11, color: grade?.color }}>{grade?.description}</span></td>
                        <td className="px-2 py-2"><select disabled={!canEdit} value={flow.autoDecision} onChange={(e) => patchFlow(i + 1, (x) => ({ ...x, autoDecision: e.target.value as any }))} style={inpSm}>{['通过', '预警', '拒绝', '处理中'].map((o) => <option key={o}>{o}</option>)}</select></td>
                        <td className="px-2 py-2"><select disabled={!canEdit} value={flow.manualStatus} onChange={(e) => patchFlow(i + 1, (x) => ({ ...x, manualStatus: e.target.value as any }))} style={inpSm}>{['—', '待确认', '待审核', '核验计算中'].map((o) => <option key={o}>{o}</option>)}</select></td>
                        <td className="px-2 py-2"><input type="number" disabled={!canEdit} value={flow.creditLimitRatio} onChange={(e) => patchFlow(i + 1, (x) => ({ ...x, creditLimitRatio: +e.target.value }))} style={numSm} />%</td>
                        <td className="px-2 py-2"><select disabled={!canEdit} value={flow.reviewLevel} onChange={(e) => patchFlow(i + 1, (x) => ({ ...x, reviewLevel: e.target.value as any }))} style={inpSm}>{['单人复核', '双人复核', '初审+终审两级'].map((o) => <option key={o}>{o}</option>)}</select></td>
                        <td className="px-2 py-2" style={{ textAlign: 'center' }}><input type="checkbox" disabled={!canEdit} checked={flow.needManualReview} onChange={(e) => patchFlow(i + 1, (x) => ({ ...x, needManualReview: e.target.checked }))} /></td>
                        <td className="px-2 py-2">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 220 }}>
                            {ACTION_BY_TYPE[active.reportType].map((a) => {
                              const on = flow.allowedActions.includes(a)
                              return <button key={a} disabled={!canEdit} onClick={() => patchFlow(i + 1, (x) => ({ ...x, allowedActions: on ? x.allowedActions.filter((y) => y !== a) : [...x.allowedActions, a] }))}
                                style={{ padding: '2px 8px', fontSize: 12, borderRadius: 999, border: `1px solid ${on ? SEL : '#D1D5DB'}`, background: on ? SEL_BG : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{ACTION_CATALOG[a]}</button>
                            })}
                          </div>
                        </td>
                        <td className="px-2 py-2"><input disabled={!canEdit} value={flow.suggestionText} onChange={(e) => patchFlow(i + 1, (x) => ({ ...x, suggestionText: e.target.value }))} style={inpSm} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {tab === 'theme' && (
            <Panel title="样式主题配置" desc="选择预设主题套用配色，或逐项自定义。影响报告导出与在线查看的视觉风格。">
              <Field label="主题预设">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {THEME_LIST.map((p) => (
                    <button key={p} disabled={!canEdit} onClick={() => patchTheme((th) => ({ ...th, preset: p, ...THEME_PRESETS[p] }))}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${active.theme.preset === p ? SEL : '#D1D5DB'}`, background: active.theme.preset === p ? SEL_BG : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{p}</button>
                  ))}
                </div>
              </Field>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14, marginTop: 8 }}>
                <Field label="主色"><input type="color" disabled={!canEdit} value={active.theme.primaryColor} onChange={(e) => patchTheme((th) => ({ ...th, primaryColor: e.target.value }))} style={colorInp} /></Field>
                <Field label="通过色"><input type="color" disabled={!canEdit} value={active.theme.passColor} onChange={(e) => patchTheme((th) => ({ ...th, passColor: e.target.value }))} style={colorInp} /></Field>
                <Field label="预警色"><input type="color" disabled={!canEdit} value={active.theme.warningColor} onChange={(e) => patchTheme((th) => ({ ...th, warningColor: e.target.value }))} style={colorInp} /></Field>
                <Field label="拒绝色"><input type="color" disabled={!canEdit} value={active.theme.rejectColor} onChange={(e) => patchTheme((th) => ({ ...th, rejectColor: e.target.value }))} style={colorInp} /></Field>
                <Field label="间距"><select disabled={!canEdit} value={active.theme.spacing} onChange={(e) => patchTheme((th) => ({ ...th, spacing: e.target.value as any }))} style={inp}>{['紧凑', '标准', '宽松'].map((o) => <option key={o}>{o}</option>)}</select></Field>
                <Field label="字号"><select disabled={!canEdit} value={active.theme.fontSize} onChange={(e) => patchTheme((th) => ({ ...th, fontSize: e.target.value as any }))} style={inp}>{['小', '标准', '大'].map((o) => <option key={o}>{o}</option>)}</select></Field>
                <Field label="表格风格"><select disabled={!canEdit} value={active.theme.tableStyle} onChange={(e) => patchTheme((th) => ({ ...th, tableStyle: e.target.value as any }))} style={inp}>{['线框表', '斑马纹', '无边框'].map((o) => <option key={o}>{o}</option>)}</select></Field>
                <Field label="圆角"><select disabled={!canEdit} value={active.theme.borderRadius} onChange={(e) => patchTheme((th) => ({ ...th, borderRadius: e.target.value as any }))} style={inp}>{['直角', '小圆角', '大圆角'].map((o) => <option key={o}>{o}</option>)}</select></Field>
                <Field label="表头风格" full><select disabled={!canEdit} value={active.theme.headerStyle} onChange={(e) => patchTheme((th) => ({ ...th, headerStyle: e.target.value as any }))} style={inp}>{['简洁', '标准', '完整'].map((o) => <option key={o}>{o}</option>)}</select></Field>
              </div>
            </Panel>
          )}

          {tab === 'export' && (
            <Panel title="导出模板配置" desc="配置报告可导出格式与 Word / Excel / PDF 细节。">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                <Field label="导出格式" full>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['PDF', 'Word', 'Excel'] as const).map((f) => {
                      const on = active.export.formats.includes(f)
                      return <button key={f} disabled={!canEdit} onClick={() => patchExport((e) => ({ ...e, formats: on ? e.formats.filter((x) => x !== f) : [...e.formats, f] }))}
                        style={{ padding: '4px 14px', borderRadius: 8, border: `1px solid ${on ? SEL : '#D1D5DB'}`, background: on ? SEL_BG : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{f}</button>
                    })}
                  </div>
                </Field>
                <Field label="默认格式"><select disabled={!canEdit} value={active.export.defaultFormat} onChange={(e) => patchExport((x) => ({ ...x, defaultFormat: e.target.value }))} style={inp}>{active.export.formats.map((f) => <option key={f}>{f}</option>)}</select></Field>
                <Field label="PDF 页眉" full><input disabled={!canEdit} value={active.export.pdfHeader} onChange={(e) => patchExport((x) => ({ ...x, pdfHeader: e.target.value }))} style={inp} /></Field>
                <Field label="PDF 页脚" full><input disabled={!canEdit} value={active.export.pdfFooter} onChange={(e) => patchExport((x) => ({ ...x, pdfFooter: e.target.value }))} style={inp} /></Field>
                <Field label="Word 样式"><select disabled={!canEdit} value={active.export.wordStyle} onChange={(e) => patchExport((x) => ({ ...x, wordStyle: e.target.value as any }))} style={inp}>{['与页面一致', '独立样式'].map((o) => <option key={o}>{o}</option>)}</select></Field>
                <Field label="导出范围"><select disabled={!canEdit} value={active.export.exportScope} onChange={(e) => patchExport((x) => ({ ...x, exportScope: e.target.value as any }))} style={inp}>{['完整报告', '仅当前可见分段', '自定义范围'].map((o) => <option key={o}>{o}</option>)}</select></Field>
                <Field label="水印" full>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" disabled={!canEdit} checked={active.export.watermark.enabled} onChange={(e) => patchExport((x) => ({ ...x, watermark: { ...x.watermark, enabled: e.target.checked } }))} />启用</label>
                    <input disabled={!canEdit} value={active.export.watermark.text} onChange={(e) => patchExport((x) => ({ ...x, watermark: { ...x.watermark, text: e.target.value } }))} style={inpSm} placeholder="水印文字" />
                    <span style={{ fontSize: 12, color: '#6B7280' }}>透明度 {active.export.watermark.opacity}%</span>
                    <input type="range" min={0} max={100} disabled={!canEdit} value={active.export.watermark.opacity} onChange={(e) => patchExport((x) => ({ ...x, watermark: { ...x.watermark, opacity: +e.target.value } }))} />
                  </div>
                </Field>
                <Field label="Excel 分表" full><label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" disabled={!canEdit} checked={active.export.excelSplitSheet} onChange={(e) => patchExport((x) => ({ ...x, excelSplitSheet: e.target.checked }))} />每个分段独立 Sheet</label></Field>
                <Field label="包含操作日志"><label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" disabled={!canEdit} checked={active.export.includeOpLogs} onChange={(e) => patchExport((x) => ({ ...x, includeOpLogs: e.target.checked }))} />包含</label></Field>
                <Field label="包含签章"><label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" disabled={!canEdit} checked={active.export.includeSignature} onChange={(e) => patchExport((x) => ({ ...x, includeSignature: e.target.checked }))} />包含</label></Field>
                {active.export.includeSignature && <Field label="签章模板" full><select disabled={!canEdit} value={active.export.signatureTemplate ?? ''} onChange={(e) => patchExport((x) => ({ ...x, signatureTemplate: e.target.value }))} style={inp}>{['风险审核专用章', '风控主管签章'].map((o) => <option key={o}>{o}</option>)}</select></Field>}
              </div>
            </Panel>
          )}

          {/* 变更日志 */}
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
