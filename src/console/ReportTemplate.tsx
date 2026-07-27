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
import { useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { PageHeader, Panel, Badge, Button, DetailHeader, SingleSelect, Modal } from '../components/ui'
import {
  ReportTemplate, ReportType, TplStatus, RiskLevel, DisplayComponent, ScoreGrade, BusinessFlowConfig,
  ThemeConfig, ExportConfig, SectionConfig, FieldConfig, SectionSource, Role, ROLES, ROLE_PERM, ROLE_HINT,
  REPORT_META, PRODUCTS, ACTION_CATALOG, ACTION_BY_TYPE, THEME_PRESETS, THEME_LIST,
  SECTION_SOURCE_LABEL, DATA_SOURCE_FIELDS, RULE_POOL,
  syncFlowToGrades, buildTemplate, seedReportTemplates,
} from './reportTemplateData'

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

/* ============================ 主组件 ============================ */
export default function ReportTemplateConfig() {
  const nav = useNavigate()
  const loc = useLocation()
  const initId = new URLSearchParams(loc.search).get('id')
  const [templates, setTemplates] = useState<ReportTemplate[]>(seedReportTemplates)
  const [view, setView] = useState<'list' | 'detail'>(initId ? 'detail' : 'list')
  const [activeId, setActiveId] = useState<string>(initId ?? seedReportTemplates[0].id)
  const [tab, setTab] = useState<'content' | 'score' | 'flow' | 'theme' | 'export'>('content')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [role, setRole] = useState<Role>('系统管理员') // 默认管理员可见全部操作；可切换以感知不同角色权限差异
  const [search, setSearch] = useState('')
  const [fType, setFType] = useState('全部')
  const [fStatus, setFStatus] = useState('全部')
  const [fScope, setFScope] = useState('全部')
  const [showNew, setShowNew] = useState(false)
  const [syncHint, setSyncHint] = useState<string>('')

  const active = useMemo(() => templates.find((t) => t.id === activeId) ?? templates[0], [templates, activeId])
  const perm = ROLE_PERM[role]
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
      setSyncHint('已新增评分档，下方「业务流程」已自动同步增加一行')
      return { ...t, scoreDisplay: { ...t.scoreDisplay, grades }, businessFlow: syncFlowToGrades(t.businessFlow, grades) }
    })
  }
  const delGrade = (i: number) => {
    if (i === 0) return
    patch((t) => {
      const grades = t.scoreDisplay.grades.filter((_, k) => k !== i)
      setSyncHint('已删除一个评分档，下方「业务流程」已自动同步删除对应行')
      return { ...t, scoreDisplay: { ...t.scoreDisplay, grades }, businessFlow: syncFlowToGrades(t.businessFlow, grades) }
    })
  }
  const patchFlow = (i: number, fn: (f: BusinessFlowConfig) => BusinessFlowConfig) =>
    patch((t) => ({ ...t, businessFlow: t.businessFlow.map((f, k) => (k === i ? fn(f) : f)) }))
  const patchTheme = (fn: (th: ThemeConfig) => ThemeConfig) => patch((t) => ({ ...t, theme: fn(t.theme) }))
  const patchExport = (fn: (e: ExportConfig) => ExportConfig) => patch((t) => ({ ...t, export: fn(t.export) }))

  /* ---- 报告内容：分段 / 字段 增删改与来源配置 ---- */
  const sourceDefaults = (st: SectionSource): Pick<FieldConfig, 'sourceRef' | 'mask' | 'inputParam' | 'hitText' | 'missText'> => {
    if (st === 'data_source') return { sourceRef: '', mask: false }
    if (st === 'api') return { sourceRef: '', inputParam: '' }
    return { sourceRef: '', hitText: '命中', missText: '未命中' }
  }
  const newField = (st: SectionSource, name: string): FieldConfig => ({ id: `f_${Date.now()}`, name, desc: '', visible: true, ...sourceDefaults(st) })
  const nextOrder = (arr: { order: number }[]) => arr.reduce((m, x) => Math.max(m, x.order), 0) + 1
  const addSection = (sType: SectionSource) => {
    if (!canEdit) return
    const order = nextOrder(active.sections)
    const sid = `sec_${Date.now()}`
    const ns: SectionConfig = {
      id: sid, name: sType === 'data_source' ? '新数据源分段' : sType === 'api' ? '新接口结果分段' : '新规则集分段',
      desc: SECTION_SOURCE_LABEL[sType], order, visible: true, sourceType: sType, sourceName: '',
      inputs: sType === 'api' ? [] : undefined, fields: [newField(sType, '新字段')],
    }
    patch((t) => ({ ...t, sections: [...t.sections, ns] })); logChange('编辑', `新增分段「${ns.name}」`)
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
  const setSectionSource = (sid: string, st: SectionSource) => {
    if (!canEdit) return
    patchSection(sid, (s) => ({ ...s, sourceType: st, inputs: st === 'api' ? (s.inputs ?? []) : undefined, fields: s.fields.map((f) => ({ ...f, ...sourceDefaults(st) })) }))
    logChange('编辑', `分段来源改为「${SECTION_SOURCE_LABEL[st]}」`)
  }
  const addField = (sid: string) => {
    if (!canEdit) return
    const s = active.sections.find((x) => x.id === sid); if (!s) return
    patchSection(sid, (x) => ({ ...x, fields: [...x.fields, newField(x.sourceType, '新字段')] }))
  }
  const delField = (sid: string, fid: string) => {
    if (!canEdit) return
    patchSection(sid, (x) => ({ ...x, fields: x.fields.filter((f) => f.id !== fid) }))
  }
  const moveField = (sid: string, fid: string, dir: -1 | 1) => {
    if (!canEdit) return
    patchSection(sid, (x) => {
      const arr = [...x.fields]; const i = arr.findIndex((f) => f.id === fid); if (i < 0) return x
      const j = i + dir; if (j < 0 || j >= arr.length) return x
      const [item] = arr.splice(i, 1); arr.splice(j, 0, item)
      return { ...x, fields: arr }
    })
  }
  const patchField = (sid: string, fid: string, fn: (f: FieldConfig) => FieldConfig) =>
    patchSection(sid, (x) => ({ ...x, fields: x.fields.map((f) => (f.id === fid ? fn(f) : f)) }))
  const addInput = (sid: string) => patchSection(sid, (x) => ({ ...x, inputs: [...(x.inputs ?? []), { key: '', from: '' }] }))
  const patchInput = (sid: string, idx: number, fn: (p: { key: string; from: string }) => { key: string; from: string }) =>
    patchSection(sid, (x) => ({ ...x, inputs: (x.inputs ?? []).map((p, k) => (k === idx ? fn(p) : p)) }))
  const delInput = (sid: string, idx: number) =>
    patchSection(sid, (x) => ({ ...x, inputs: (x.inputs ?? []).filter((_, k) => k !== idx) }))

  const bump = (v: string) => {
    const m = /^V(\d+)\.(\d+)$/.exec(v)
    if (!m) return 'V1.1'
    return `V${m[1]}.${+m[2] + 1}`
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
    const filtered = templates.filter((t) => {
      if (search && !t.name.includes(search)) return false
      if (fType !== '全部' && REPORT_META[t.reportType].label !== fType) return false
      if (fStatus !== '全部' && t.status !== fStatus) return false
      if (fScope !== '全部' && !t.scope.includes(fScope)) return false
      return true
    })
    const typeOptions = [{ value: '全部', label: '全部报告类型' }, ...(['info_verify', 'credit', 'fraud', 'decision'] as ReportType[]).map((t) => ({ value: REPORT_META[t].label, label: REPORT_META[t].label }))]
    const statusOptions = [{ value: '全部', label: '全部状态' }, { value: '草稿', label: '草稿' }, { value: '已启用', label: '已启用' }, { value: '已停用', label: '已停用' }]
    const scopeOptions = [{ value: '全部', label: '全部适用产品' }, ...PRODUCTS.map((p) => ({ value: p, label: p }))]
    return (
      <div>
        <PageHeader title="报告模板配置" subtitle="统一管理信息核验 / 信用风控 / 欺诈识别 / 决策报告四类报告的展示模板、评分等级与业务流程"
          actions={<Button variant="primary" onClick={() => setShowNew(true)}>＋ 新建模板</Button>} />
        <Panel desc="报告模板决定「某类报告长什么样、分数怎么分档、不同分数触发什么业务动作」。每个报告类型可并存多个模板，其中一个设为默认。">
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <input className="flex-1 min-w-[200px]" placeholder="搜索模板名称…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8 }} />
            <SingleSelect label="" options={typeOptions} value={fType} onChange={setFType} />
            <SingleSelect label="" options={statusOptions} value={fStatus} onChange={setFStatus} />
            <SingleSelect label="" options={scopeOptions} value={fScope} onChange={setFScope} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map((t) => {
              const meta = REPORT_META[t.reportType]
              const secCount = t.sections.length
              const visSec = t.sections.filter((s) => s.visible).length
              return (
                <div key={t.id} style={{ border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, background: '#fff', position: 'relative' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{t.name}</div>
                    {t.isDefault && <Badge kind="blue">默认</Badge>}
                  </div>
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Badge kind={meta.color}>{meta.icon} {meta.label}</Badge>
                    {statusBadge(t.status)}
                    <span style={{ fontSize: 12, color: '#6B7280' }}>{meta.hint}</span>
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>
                    <div>适用产品：{t.scope.join('、')}</div>
                    <div>分段：显示 {visSec}/{secCount} 个　·　版本 {t.version}</div>
                    <div>最近编辑：{t.lastEditor} · {t.lastEditTime}</div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
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
  const flowRows = active.businessFlow.slice(1).map((f, i) => ({ grade: active.scoreDisplay.grades[i], flow: f }))

  return (
    <div>
      <DetailHeader title={active.name} crumb="公共配置 / 报告模板" subtitle={`${REPORT_META[active.reportType].label} · ${active.version} · 适用 ${active.scope.join('、')}`}
        backLabel="返回列表" onBack={() => setView('list')}
        actions={
          <>
            <Button variant="primary" onClick={() => nav(`/console/cr/report-template-preview?id=${active.id}`, { state: { tpl: active } })}>预览</Button>
            {canEdit && <Button onClick={saveDraft}>保存</Button>}
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
          <Panel title="基础信息" desc="模板的通用属性，所有配置 Tab 共用。">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <Field label="模板名称" ><input disabled={!canEdit} value={active.name} onChange={(e) => patch((t) => ({ ...t, name: e.target.value }))} style={inp} /></Field>
              <Field label="报告类型"><input disabled value={REPORT_META[active.reportType].icon + ' ' + REPORT_META[active.reportType].label} style={{ ...inp, background: '#F3F4F6' }} /></Field>
              <Field label="适用产品">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PRODUCTS.map((p) => {
                    const on = active.scope.includes(p)
                    return <button key={p} disabled={!canEdit} onClick={() => patch((t) => ({ ...t, scope: on ? t.scope.filter((x) => x !== p) : [...t.scope, p] }))}
                      style={{ padding: '4px 10px', borderRadius: 999, fontSize: 13, border: `1px solid ${on ? SEL : '#D1D5DB'}`, background: on ? SEL_BG : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{p}</button>
                  })}
                </div>
              </Field>
              <Field label="模板状态">
                <SingleSelect label="" value={active.status} options={(['草稿', '已启用', '已停用'] as TplStatus[]).map((s) => ({ value: s, label: s }))}
                  onChange={(v) => changeStatus(v as TplStatus)} fullWidth />
              </Field>
              <Field label="当前登录角色（模拟）">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 180 }}>
                    <SingleSelect label="" value={role} options={ROLES.map((r) => ({ value: r, label: r }))} onChange={(v) => setRole(v as Role)} fullWidth />
                  </div>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>{ROLE_HINT[role]}</span>
                </div>
              </Field>
              <Field label="设为默认模板" full>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" disabled={!perm.setDefault} checked={active.isDefault} onChange={setDefault} />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{active.isDefault ? '当前为默认模板（新进入件默认使用）' : '设为该报告类型的默认模板'}</span>
                </label>
              </Field>
              <Field label="模板描述" full>
                <textarea disabled={!canEdit} value={active.description} onChange={(e) => patch((t) => ({ ...t, description: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} />
              </Field>
            </div>
          </Panel>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 16, borderBottom: '1px solid #E5E7EB', marginBottom: 14 }}>
            {([['content', '报告内容'], ['score', '评分方案'], ['flow', '业务流程'], ['theme', '样式主题'], ['export', '导出模板']] as [any, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 16px', border: 'none', borderBottom: tab === k ? '2px solid #3B82F6' : '2px solid transparent', background: 'none', fontWeight: tab === k ? 700 : 400, color: tab === k ? '#1D4ED8' : '#6B7280', cursor: 'pointer' }}>{label}</button>
            ))}
          </div>

          {tab === 'content' && (
            <Panel title="报告内容配置" desc="每个分段有『单一来源』：数据源（用户首填）/ 接口调用结果（含输入→输出）/ 规则集碰撞结果。勾选决定报告是否展示该分段/字段；可新增、删除、调整顺序，并逐项配置来源。">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>分段（{sections.length}）</span>
                {canEdit && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['data_source', 'api', 'rule_set'] as SectionSource[]).map((st) => (
                      <button key={st} onClick={() => addSection(st)} style={miniBtn}>＋ {SECTION_SOURCE_LABEL[st].split('（')[0]}分段</button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sections.map((s) => {
                  const disabled = s.visible && visibleCount <= 1
                  const exp = expanded[s.id]
                  const st = s.sourceType
                  const stColor = st === 'data_source' ? { bg: '#ECFDF5', bd: '#A7F3D0', tx: '#047857' } : st === 'api' ? { bg: '#EFF6FF', bd: '#BFDBFE', tx: '#1D4ED8' } : { bg: '#F5F3FF', bd: '#DDD6FE', tx: '#6D28D9' }
                  return (
                    <div key={s.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: '#F9FAFB', flexWrap: 'wrap' }}>
                        {canEdit && <button onClick={() => moveSection(s.id, -1)} style={miniBtn} title="上移">↑</button>}
                        {canEdit && <button onClick={() => moveSection(s.id, 1)} style={miniBtn} title="下移">↓</button>}
                        <input type="checkbox" disabled={disabled || !canEdit} checked={s.visible} onChange={(e) => patchSection(s.id, (x) => ({ ...x, visible: e.target.checked }))} />
                        <input disabled={!canEdit} value={s.name} onChange={(e) => patchSection(s.id, (x) => ({ ...x, name: e.target.checked ? x.name : e.target.value }))} style={{ ...inp, width: 190, fontWeight: 600, fontSize: 14 }} />
                        <span style={{ fontSize: 12, background: stColor.bg, border: `1px solid ${stColor.bd}`, color: stColor.tx, padding: '2px 8px', borderRadius: 999 }}>{SECTION_SOURCE_LABEL[st]}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 'auto' }}>字段 {s.fields.filter((f) => f.visible).length}/{s.fields.length}</span>
                        <div style={{ display: 'flex', gap: 6 }}>
                          {canEdit && <select value={st} onChange={(e) => setSectionSource(s.id, e.target.value as SectionSource)} style={miniBtn as any}>
                            <option value="data_source">数据源</option><option value="api">接口调用</option><option value="rule_set">规则集</option>
                          </select>}
                          {canEdit && <button onClick={() => addField(s.id)} style={miniBtn}>＋ 字段</button>}
                          {canEdit && <button onClick={() => delSection(s.id)} style={{ ...miniBtn, color: '#DC2626', borderColor: '#FECACA' }}>删除分段</button>}
                          <button onClick={() => setExpanded((e) => ({ ...e, [s.id]: !exp }))} style={miniBtn}>{exp ? '收起' : '展开字段'}</button>
                        </div>
                      </div>
                      {/* 来源级配置 */}
                      {exp && (
                        <div style={{ padding: '8px 12px', background: '#fff', borderTop: '1px solid #F1F5F9' }}>
                          <Field label={st === 'data_source' ? '数据源名' : st === 'api' ? '接口名' : '规则集名'}>
                            <input disabled={!canEdit} value={s.sourceName ?? ''} onChange={(e) => patchSection(s.id, (x) => ({ ...x, sourceName: e.target.value }))} style={inp} />
                          </Field>
                          {st === 'api' && (
                            <div style={{ marginTop: 6 }}>
                              <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>输入参数（接口调用有输入→输出）：</div>
                              {(s.inputs ?? []).map((p, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 6, marginBottom: 4, alignItems: 'center' }}>
                                  <input disabled={!canEdit} value={p.key} onChange={(e) => patchInput(s.id, idx, (x) => ({ ...x, key: e.target.value }))} placeholder="参数 key" style={{ ...inpSm, width: 140 }} />
                                  <span style={{ color: '#9CA3AF' }}>←</span>
                                  <input disabled={!canEdit} value={p.from} onChange={(e) => patchInput(s.id, idx, (x) => ({ ...x, from: e.target.value }))} placeholder="数据来自" style={inpSm} />
                                  {canEdit && <button onClick={() => delInput(s.id, idx)} style={{ ...miniBtn, color: '#DC2626' }}>×</button>}
                                </div>
                              ))}
                              {canEdit && <button onClick={() => addInput(s.id)} style={miniBtn}>＋ 输入参数</button>}
                            </div>
                          )}
                        </div>
                      )}
                      {/* 字段网格（按来源类型显示不同设置项） */}
                      {exp && (
                        <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 8, background: '#FCFCFD' }}>
                          {s.fields.map((f) => (
                            <div key={f.id} style={{ border: '1px solid #EEF2F7', borderRadius: 8, padding: 8, background: f.visible ? '#fff' : '#F9FAFB' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                {canEdit && <button onClick={() => moveField(s.id, f.id, -1)} style={miniBtn} title="上移">↑</button>}
                                {canEdit && <button onClick={() => moveField(s.id, f.id, 1)} style={miniBtn} title="下移">↓</button>}
                                <input type="checkbox" disabled={!canEdit} checked={f.visible} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, visible: e.target.checked }))} />
                                <input disabled={!canEdit} value={f.name} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, name: e.target.value }))} style={{ ...inp, flex: 1, fontWeight: 500 }} />
                                {canEdit && <button onClick={() => delField(s.id, f.id)} style={{ ...miniBtn, color: '#DC2626' }}>×</button>}
                              </div>
                              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 3, lineHeight: 1.5 }}>{f.desc || '（无说明）'}</div>
                              <div style={{ marginTop: 6, display: 'grid', gap: 4 }}>
                                {st === 'data_source' && (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 11, color: '#6B7280', width: 56, flex: '0 0 auto' }}>来源字段</span>
                                      <select disabled={!canEdit} value={f.sourceRef ?? ''} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, sourceRef: e.target.value }))} style={inpSm}>
                                        <option value="">（未绑定）</option>
                                        {DATA_SOURCE_FIELDS.map((d) => <option key={d} value={d}>{d}</option>)}
                                      </select>
                                    </div>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#6B7280' }}>
                                      <input type="checkbox" disabled={!canEdit} checked={!!f.mask} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, mask: e.target.checked }))} /> 脱敏显示
                                    </label>
                                  </>
                                )}
                                {st === 'api' && (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 11, color: '#6B7280', width: 56, flex: '0 0 auto' }}>输出字段</span>
                                      <input disabled={!canEdit} value={f.sourceRef ?? ''} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, sourceRef: e.target.value }))} placeholder="输出字段名" style={inpSm} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 11, color: '#6B7280', width: 56, flex: '0 0 auto' }}>对应输入</span>
                                      <select disabled={!canEdit} value={f.inputParam ?? ''} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, inputParam: e.target.value }))} style={inpSm}>
                                        <option value="">（无）</option>
                                        {(s.inputs ?? []).map((p) => <option key={p.key} value={p.key}>{p.key}</option>)}
                                      </select>
                                    </div>
                                  </>
                                )}
                                {st === 'rule_set' && (
                                  <>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 11, color: '#6B7280', width: 56, flex: '0 0 auto' }}>规则项</span>
                                      <select disabled={!canEdit} value={f.sourceRef ?? ''} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, sourceRef: e.target.value }))} style={inpSm}>
                                        <option value="">（未绑定）</option>
                                        {RULE_POOL.map((r) => <option key={r} value={r}>{r}</option>)}
                                      </select>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 11, color: '#6B7280', width: 56, flex: '0 0 auto' }}>命中显示</span>
                                      <input disabled={!canEdit} value={f.hitText ?? ''} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, hitText: e.target.value }))} style={inpSm} />
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                      <span style={{ fontSize: 11, color: '#6B7280', width: 56, flex: '0 0 auto' }}>未命中</span>
                                      <input disabled={!canEdit} value={f.missText ?? ''} onChange={(e) => patchField(s.id, f.id, (x) => ({ ...x, missText: e.target.value }))} style={inpSm} />
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          ))}
                          {s.fields.length === 0 && <div style={{ fontSize: 12, color: '#9CA3AF' }}>本分段暂无字段，点击「＋ 字段」添加。</div>}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Panel>
          )}

          {tab === 'score' && (
            <Panel title="评分方案配置" desc="选择评分卡形态，并划分评分等级（风险档）与阈值。等级名称/数量变更会自动同步到「业务流程」Tab。">
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <div style={{ fontSize: 13, color: '#374151', fontWeight: 600 }}>评分等级（风险档）</div>
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
              <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 6 }}>提示：等级按从上到下顺序对应「业务流程」的每一行，无需在业务流程里再单独命名。</div>
            </Panel>
          )}

          {tab === 'flow' && (
            <Panel title="业务流程配置" desc="按评分等级映射：自动审核结论、人工状态、授信额度比例、复核级别与可执行操作。每一行对应上方「评分方案」中的一个等级。">
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
                  <Badge kind={c.action === '删除' ? 'red' : c.action === '启用' ? 'green' : c.action === '停用' ? 'gray' : 'amber'}>{c.action}</Badge>
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
