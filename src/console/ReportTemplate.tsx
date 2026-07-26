/* ============================================================================
 * 报告模板配置页（统一四大报告：信息核验 / 信用风控 / 欺诈识别 / 决策报告）
 * 对应文档：SaaS/doc/报告模板配置页功能设计.md
 * 列表页 + 详情配置页（5 个 Tab：报告内容 / 评分展示 / 业务流程 / 样式主题 / 导出模板）
 * + 实时预览 + 版本与变更日志 + 角色权限控制。
 * ========================================================================== */
import { useState, useMemo, useEffect } from 'react'
import { PageHeader, Panel, Badge, Button, DetailHeader, SingleSelect, Modal } from '../components/ui'
import {
  ReportTemplate, ReportType, TplStatus, RiskLevel, DisplayComponent, ScoreGrade, BusinessFlowConfig,
  ThemeConfig, ExportConfig, SectionConfig, ScoreDisplayConfig,
  REPORT_META, PRODUCTS, ACTION_CATALOG, ACTION_BY_TYPE, THEME_PRESETS, THEME_LIST,
  PREVIEW_STATES, gradeForScore, buildTemplate, seedReportTemplates,
} from './reportTemplateData'

type Role = '系统管理员' | '风控主管' | '风控策略岗' | '风控专员' | '数据分析师'
const ROLES: Role[] = ['系统管理员', '风控主管', '风控策略岗', '风控专员', '数据分析师']
const ROLE_PERM: Record<Role, { edit: boolean; enable: boolean; setDefault: boolean; del: boolean }> = {
  系统管理员: { edit: true, enable: true, setDefault: true, del: true },
  风控主管: { edit: true, enable: true, setDefault: true, del: false },
  风控策略岗: { edit: true, enable: false, setDefault: false, del: false },
  风控专员: { edit: false, enable: false, setDefault: false, del: false },
  数据分析师: { edit: false, enable: false, setDefault: false, del: false },
}


/* 评分展示组件（预览用） */
function ScoreHero({ score, grade, component }: { score: number; grade: ScoreGrade; component: DisplayComponent }) {
  const color = grade.color
  if (component === '环形图') {
    const r = 34, c = 2 * Math.PI * r, off = c * (1 - score / 100)
    return (
      <svg width="92" height="92" viewBox="0 0 92 92">
        <circle cx="46" cy="46" r={r} fill="none" stroke="#E5E7EB" strokeWidth="9" />
        <circle cx="46" cy="46" r={r} fill="none" stroke={color} strokeWidth="9" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 46 46)" />
        <text x="46" y="44" textAnchor="middle" fontSize="20" fontWeight="700" fill={color}>{score}</text>
        <text x="46" y="62" textAnchor="middle" fontSize="11" fill="#6B7280">分</text>
      </svg>
    )
  }
  if (component === '进度条') {
    return (
      <div style={{ width: 220 }}>
        <div style={{ height: 14, borderRadius: 999, background: '#EEF2F7', overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', background: color }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 13, color: '#374151' }}>评分 <b style={{ color }}>{score}</b> / 100</div>
      </div>
    )
  }
  if (component === '仪表盘') {
    const ang = Math.PI * (1 - score / 100)
    const x = 46 + 34 * Math.cos(ang), y = 46 - 34 * Math.sin(ang)
    return (
      <svg width="92" height="64" viewBox="0 0 92 64">
        <path d="M 12 50 A 34 34 0 0 1 80 50" fill="none" stroke="#E5E7EB" strokeWidth="9" />
        <path d="M 12 50 A 34 34 0 0 1 80 50" fill="none" stroke={color} strokeWidth="9"
          strokeDasharray={`${score / 100 * 107} 107`} />
        <line x1="46" y1="50" x2={x} y2={y} stroke={color} strokeWidth="3" />
        <text x="46" y="34" textAnchor="middle" fontSize="18" fontWeight="700" fill={color}>{score}</text>
      </svg>
    )
  }
  return <div style={{ fontSize: 40, fontWeight: 800, color, lineHeight: 1 }}>{score}<span style={{ fontSize: 16, fontWeight: 500 }}> 分</span></div>
}

/* 实时预览 */
function Preview({ tpl, stateKey }: { tpl: ReportTemplate; stateKey: string }) {
  const meta = REPORT_META[tpl.reportType]
  const states = PREVIEW_STATES[tpl.reportType]
  const st = states.find((s) => s.key === stateKey) ?? states[0]
  const grade = gradeForScore(tpl, st.score)
  const theme = tpl.theme
  const fs = theme.fontSize === '小' ? 14 : theme.fontSize === '大' ? 18 : 16
  const visibleSections = [...tpl.sections].sort((a, b) => a.order - b.order).filter((s) => s.visible)
  return (
    <div style={{ fontFamily: 'system-ui', fontSize: fs, color: '#111827' }}>
      <div style={{ borderBottom: `3px solid ${theme.primaryColor}`, padding: '0 4px 10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontWeight: 700, fontSize: fs + 4 }}>{tpl.name}（预览）</div>
          <Badge kind="violet">{meta.icon} {meta.label}</Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
          <ScoreHero score={st.score} grade={grade} component={tpl.scoreDisplay.displayComponent} />
          <div>
            <div style={{ fontSize: fs + 2, fontWeight: 700, color: grade.color }}>{grade.grade} · {grade.label}</div>
            {tpl.scoreDisplay.showDescription && <div style={{ fontSize: fs - 2, color: '#6B7280', marginTop: 4, maxWidth: 260 }}>{grade.description}</div>}
            {tpl.scoreDisplay.showRiskTags && <div style={{ marginTop: 6 }}><Badge kind="red">风险等级 {grade.riskLevel}</Badge></div>}
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 4px' }}>
        {visibleSections.length === 0 && <div style={{ color: '#9CA3AF', padding: 16 }}>当前未勾选任何分段</div>}
        {visibleSections.map((s) => (
          <div key={s.id} style={{ marginBottom: 12, border: '1px solid #E5E7EB', borderRadius: theme.borderRadius === '直角' ? 0 : theme.borderRadius === '大圆角' ? 14 : 8, overflow: 'hidden' }}>
            <div style={{ background: theme.headerStyle === '简洁' ? 'transparent' : '#F8FAFC', borderBottom: '1px solid #EEF2F7', padding: '8px 12px', fontWeight: 600 }}>
              {s.name}
            </div>
            <div style={{ padding: 10, display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
              {s.fields.filter((f) => f.visible).map((f) => (
                <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: fs - 2, padding: '4px 8px', background: '#F9FAFB', borderRadius: 6 }}>
                  <span style={{ color: '#6B7280' }}>{f.name}</span><span style={{ color: '#9CA3AF' }}>样例</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ============================ 主组件 ============================ */
export default function ReportTemplateConfig() {
  const [templates, setTemplates] = useState<ReportTemplate[]>(seedReportTemplates)
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [activeId, setActiveId] = useState<string>(seedReportTemplates[0].id)
  const [tab, setTab] = useState<'content' | 'score' | 'flow' | 'theme' | 'export'>('content')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [previewState, setPreviewState] = useState<string>(PREVIEW_STATES[seedReportTemplates[0].reportType][0].key)
  const [role, setRole] = useState<Role>('系统管理员')
  const [search, setSearch] = useState('')
  const [fType, setFType] = useState('全部')
  const [fStatus, setFStatus] = useState('全部')
  const [fScope, setFScope] = useState('全部')
  const [showNew, setShowNew] = useState(false)
  const [previewTpl, setPreviewTpl] = useState<ReportTemplate>(seedReportTemplates[0])

  const active = useMemo(() => templates.find((t) => t.id === activeId) ?? templates[0], [templates, activeId])
  const perm = ROLE_PERM[role]
  const canEdit = perm.edit

  /* 切换模板时重置预览状态到该报告类型的首个样例 */
  useEffect(() => { setPreviewState(PREVIEW_STATES[active.reportType][0].key) }, [activeId]) // eslint-disable-line
  /* 配置变更 300ms 防抖后刷新预览 */
  useEffect(() => {
    const tm = setTimeout(() => setPreviewTpl(active), 300)
    return () => clearTimeout(tm)
  }, [active])

  const patch = (fn: (t: ReportTemplate) => ReportTemplate) =>
    setTemplates((l) => l.map((t) => (t.id === activeId ? fn(t) : t)))
  const patchSection = (sid: string, fn: (s: SectionConfig) => SectionConfig) =>
    patch((t) => ({ ...t, sections: t.sections.map((s) => (s.id === sid ? fn(s) : s)) }))
  const patchGrade = (i: number, fn: (g: ScoreGrade) => ScoreGrade) =>
    patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, grades: t.scoreDisplay.grades.map((g, k) => (k === i ? fn(g) : g)) } }))
  const patchFlow = (i: number, fn: (f: BusinessFlowConfig) => BusinessFlowConfig) =>
    patch((t) => ({ ...t, businessFlow: t.businessFlow.map((f, k) => (k === i ? fn(f) : f)) }))
  const patchTheme = (fn: (th: ThemeConfig) => ThemeConfig) => patch((t) => ({ ...t, theme: fn(t.theme) }))
  const patchExport = (fn: (e: ExportConfig) => ExportConfig) => patch((t) => ({ ...t, export: fn(t.export) }))

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
  const riskBadge = (r: RiskLevel) => <Badge kind={r === '低' ? 'green' : r === '中' ? 'amber' : r === '高' ? 'orange' : 'red'}>{r}风险</Badge>

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
        <PageHeader title="报告模板配置" subtitle="统一管理信息核验 / 信用风控 / 欺诈识别 / 决策报告四类报告的展示模板"
          actions={
            <>
              <SingleSelect label="当前角色" value={role} options={ROLES.map((r) => ({ value: r, label: r }))} onChange={(v) => setRole(v as Role)} fullWidth />
              <Button variant="primary" onClick={() => setShowNew(true)}>＋ 新建模板</Button>
            </>
          } />
        <Panel>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
            <input className="flex-1 min-w-[200px]" placeholder="搜索模板名称…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8 }} />
            <SingleSelect label="" options={typeOptions} value={fType} onChange={setFType} fullWidth />
            <SingleSelect label="" options={statusOptions} value={fStatus} onChange={setFStatus} fullWidth />
            <SingleSelect label="" options={scopeOptions} value={fScope} onChange={setFScope} fullWidth />
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
                  <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Badge kind={meta.color}>{meta.icon} {meta.label}</Badge>
                    {statusBadge(t.status)}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 13, color: '#6B7280', lineHeight: 1.7 }}>
                    <div>适用产品：{t.scope.join('、')}</div>
                    <div>分段：显示 {visSec}/{secCount} 个</div>
                    <div>版本：{t.version}　{riskBadge(t.scoreDisplay.grades[t.scoreDisplay.grades.length - 1].riskLevel)}</div>
                    <div>最近编辑：{t.lastEditor} · {t.lastEditTime}</div>
                  </div>
                  <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <Button variant="primary" onClick={() => { setActiveId(t.id); setView('detail') }}>配置</Button>
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
        <Panel title="角色权限矩阵" desc="不同角色对报告模板的查看 / 编辑 / 启用 / 设默认 / 删除权限">
          <div style={{ overflowX: 'auto' }}>
            <table className="w-full text-sm">
              <thead><tr style={{ textAlign: 'left' }}>
                <th className="px-3 py-2">角色</th><th className="px-3 py-2">查看</th><th className="px-3 py-2">编辑</th><th className="px-3 py-2">启用/停用</th><th className="px-3 py-2">设为默认</th><th className="px-3 py-2">删除</th>
              </tr></thead>
              <tbody>
                {ROLES.map((r) => {
                  const p = ROLE_PERM[r]
                  const cell = (ok: boolean) => <td className="px-3 py-2">{ok ? <Badge kind="green">✓</Badge> : <Badge kind="gray">—</Badge>}</td>
                  return (<tr key={r} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td className="px-3 py-2 font-medium">{r}</td>
                    {cell(true)}{cell(p.edit)}{cell(p.enable)}{cell(p.setDefault)}{cell(p.del)}
                  </tr>)
                })}
              </tbody>
            </table>
          </div>
        </Panel>
        <Modal open={showNew} onClose={() => setShowNew(false)} title="新建报告模板" footer={<><Button variant="ghost" onClick={() => setShowNew(false)}>取消</Button></>}>
          <div style={{ display: 'grid', gap: 12 }}>
            {(['info_verify', 'credit', 'fraud', 'decision'] as ReportType[]).map((t) => {
              const m = REPORT_META[t]
              return (
                <button key={t} onClick={() => createNew(t)} style={{ textAlign: 'left', border: '1px solid #E5E7EB', borderRadius: 10, padding: '12px 14px', cursor: 'pointer', background: '#fff' }}>
                  <div style={{ fontWeight: 600 }}>{m.icon} {m.label}报告模板</div>
                  <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>基于「{m.label}」标准分段与等级创建</div>
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

  return (
    <div>
      <DetailHeader title={active.name} crumb="公共配置 / 报告模板" subtitle={`${REPORT_META[active.reportType].label} · ${active.version} · 适用 ${active.scope.join('、')}`}
        backLabel="返回列表" onBack={() => setView('list')}
        actions={<>
          <SingleSelect label="" value={role} options={ROLES.map((r) => ({ value: r, label: r }))} onChange={(v) => setRole(v as Role)} fullWidth />
          {canEdit && <Button onClick={saveDraft}>保存</Button>}
          {perm.enable && active.status !== '已启用' && <Button variant="primary" onClick={() => changeStatus('已启用')}>启用</Button>}
          {perm.enable && active.status === '已启用' && <Button onClick={() => changeStatus('已停用')}>停用</Button>}
          {perm.setDefault && !active.isDefault && <Button variant="ghost" onClick={setDefault}>设为默认</Button>}
          {canEdit && <Button variant="ghost" onClick={copyTpl}>复制</Button>}
          {perm.del && active.status !== '已启用' && !active.isDefault && <Button variant="ghost" onClick={() => deleteTpl(active.id)}>删除</Button>}
        </>} />

      <div style={{ display: 'grid', gridTemplateColumns: '232px 1fr', gap: 16, alignItems: 'start' }}>
        {/* 左侧模板列表 */}
        <Panel title="模板列表" desc={`共 ${templates.length} 个`} className="sticky top-4">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 520, overflow: 'auto' }}>
            {templates.map((t) => (
              <button key={t.id} onClick={() => setActiveId(t.id)} style={{ textAlign: 'left', border: `1px solid ${t.id === activeId ? '#3B82F6' : '#E5E7EB'}`, borderRadius: 8, padding: '8px 10px', cursor: 'pointer', background: t.id === activeId ? '#EFF6FF' : '#fff' }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{t.name} {t.isDefault && <Badge kind="blue">默认</Badge>}</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{REPORT_META[t.reportType].icon} {REPORT_META[t.reportType].label} · {statusBadge(t.status)}</div>
              </button>
            ))}
          </div>
        </Panel>

        {/* 右侧配置 */}
        <div style={{ minWidth: 0 }}>
          {/* 基础信息 */}
          <Panel title="基础信息">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
              <Field label="模板名称" ><input disabled={!canEdit} value={active.name} onChange={(e) => patch((t) => ({ ...t, name: e.target.value }))} style={inp} /></Field>
              <Field label="报告类型"><input disabled value={REPORT_META[active.reportType].icon + ' ' + REPORT_META[active.reportType].label} style={{ ...inp, background: '#F3F4F6' }} /></Field>
              <Field label="适用产品">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {PRODUCTS.map((p) => {
                    const on = active.scope.includes(p)
                    return <button key={p} disabled={!canEdit} onClick={() => patch((t) => ({ ...t, scope: on ? t.scope.filter((x) => x !== p) : [...t.scope, p] }))}
                      style={{ padding: '4px 10px', borderRadius: 999, fontSize: 13, border: `1px solid ${on ? '#3B82F6' : '#D1D5DB'}`, background: on ? '#EFF6FF' : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{p}</button>
                  })}
                </div>
              </Field>
              <Field label="模板状态">
                <SingleSelect label="" value={active.status} options={(['草稿', '已启用', '已停用'] as TplStatus[]).map((s) => ({ value: s, label: s }))}
                  onChange={(v) => changeStatus(v as TplStatus)} fullWidth />
              </Field>
              <Field label="设为默认模板" full>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="checkbox" disabled={!perm.setDefault} checked={active.isDefault} onChange={setDefault} />
                  <span style={{ fontSize: 13, color: '#6B7280' }}>{active.isDefault ? '当前为默认模板' : '设为该报告类型默认模板'}</span>
                </label>
              </Field>
              <Field label="模板描述" full>
                <textarea disabled={!canEdit} value={active.description} onChange={(e) => patch((t) => ({ ...t, description: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} />
              </Field>
            </div>
          </Panel>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginTop: 16, borderBottom: '1px solid #E5E7EB', marginBottom: 14 }}>
            {([['content', '报告内容'], ['score', '评分展示'], ['flow', '业务流程'], ['theme', '样式主题'], ['export', '导出模板']] as [any, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setTab(k)} style={{ padding: '10px 16px', border: 'none', borderBottom: tab === k ? '2px solid #3B82F6' : '2px solid transparent', background: 'none', fontWeight: tab === k ? 700 : 400, color: tab === k ? '#1D4ED8' : '#6B7280', cursor: 'pointer' }}>{label}</button>
            ))}
          </div>

          {tab === 'content' && (
            <Panel title="报告内容配置" desc="勾选分段 / 字段的显隐，拖拽调整分段顺序（至少保留 1 个分段）">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sections.map((s) => {
                  const disabled = s.visible && visibleCount <= 1
                  const exp = expanded[s.id]
                  return (
                    <div key={s.id} style={{ border: '1px solid #E5E7EB', borderRadius: 10, overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: '#F9FAFB' }}>
                        <span style={{ cursor: canEdit ? 'grab' : 'default', color: '#9CA3AF' }}>⠿</span>
                        <input type="checkbox" disabled={disabled || !canEdit} checked={s.visible} onChange={(e) => patchSection(s.id, (x) => ({ ...x, visible: e.target.checked }))} />
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{s.order}、{s.name}</span>
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>字段 {s.fields.filter((f) => f.visible).length}/{s.fields.length}</span>
                        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                          {canEdit && <button onClick={() => patchSection(s.id, (x) => ({ ...x, fields: x.fields.map((f) => ({ ...f, visible: true })) }))} style={miniBtn}>全选</button>}
                          {canEdit && <button onClick={() => patchSection(s.id, (x) => ({ ...x, fields: x.fields.map((f) => ({ ...f, visible: false })) }))} style={miniBtn}>全不选</button>}
                          <button onClick={() => setExpanded((e) => ({ ...e, [s.id]: !exp }))} style={miniBtn}>{exp ? '收起' : '展开字段'}</button>
                        </div>
                      </div>
                      {exp && (
                        <div style={{ padding: '10px 12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 6 }}>
                          {s.fields.map((f) => (
                            <label key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, padding: '4px 6px', background: f.visible ? '#EFF6FF' : '#F9FAFB', borderRadius: 6 }}>
                              <input type="checkbox" disabled={!canEdit} checked={f.visible} onChange={(e) => patchSection(s.id, (x) => ({ ...x, fields: x.fields.map((ff) => (ff.id === f.id ? { ...ff, visible: e.target.checked } : ff)) }))} />
                              <span>{f.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Panel>
          )}

          {tab === 'score' && (
            <Panel title="评分展示配置" desc="选择评分组件形态，配置等级划分与阈值">
              <Field label="评分组件形态">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['大数字', '环形图', '进度条', '仪表盘'] as DisplayComponent[]).map((c) => (
                    <button key={c} disabled={!canEdit} onClick={() => patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, displayComponent: c } }))}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${active.scoreDisplay.displayComponent === c ? '#3B82F6' : '#D1D5DB'}`, background: active.scoreDisplay.displayComponent === c ? '#EFF6FF' : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{c}</button>
                  ))}
                </div>
              </Field>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', margin: '10px 0' }}>
                {([['showDescription', '显示风险描述'], ['showThresholdBar', '显示阈值刻度'], ['showComponents', '显示构成项'], ['showRiskTags', '显示风险标签']] as [keyof ScoreDisplayConfig, string][]).map(([k, label]) => (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
                    <input type="checkbox" disabled={!canEdit} checked={active.scoreDisplay[k] as boolean} onChange={(e) => patch((t) => ({ ...t, scoreDisplay: { ...t.scoreDisplay, [k]: e.target.checked } }))} />{label}
                  </label>
                ))}
              </div>
              <table className="w-full text-sm" style={{ marginTop: 10 }}>
                <thead><tr style={{ textAlign: 'left' }}>
                  <th className="px-2 py-2">等级</th><th className="px-2 py-2">标签</th><th className="px-2 py-2">分值区间</th><th className="px-2 py-2">风险</th><th className="px-2 py-2">颜色</th><th className="px-2 py-2">描述</th>
                </tr></thead>
                <tbody>
                  {active.scoreDisplay.grades.map((g, i) => (
                    <tr key={g.grade} style={{ borderTop: '1px solid #F1F5F9' }}>
                      <td className="px-2 py-2 font-medium">{g.grade}</td>
                      <td className="px-2 py-2"><input disabled={!canEdit} value={g.label} onChange={(e) => patchGrade(i, (x) => ({ ...x, label: e.target.value }))} style={inpSm} /></td>
                      <td className="px-2 py-2" style={{ display: 'flex', gap: 4 }}>
                        <input type="number" disabled={!canEdit} value={g.minScore} onChange={(e) => patchGrade(i, (x) => ({ ...x, minScore: +e.target.value }))} style={numSm} />~
                        <input type="number" disabled={!canEdit} value={g.maxScore} onChange={(e) => patchGrade(i, (x) => ({ ...x, maxScore: +e.target.value }))} style={numSm} />
                      </td>
                      <td className="px-2 py-2"><select disabled={!canEdit} value={g.riskLevel} onChange={(e) => patchGrade(i, (x) => ({ ...x, riskLevel: e.target.value as RiskLevel }))} style={inpSm}>{['低', '中', '高', '极高'].map((r) => <option key={r}>{r}</option>)}</select></td>
                      <td className="px-2 py-2"><input type="color" disabled={!canEdit} value={g.color} onChange={(e) => patchGrade(i, (x) => ({ ...x, color: e.target.value }))} style={{ width: 32, height: 28, border: 'none', background: 'none' }} /></td>
                      <td className="px-2 py-2"><input disabled={!canEdit} value={g.description} onChange={(e) => patchGrade(i, (x) => ({ ...x, description: e.target.value }))} style={inpSm} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          )}

          {tab === 'flow' && (
            <Panel title="业务流程配置" desc="按评分等级映射自动审核结论、人工状态、决策建议与可执行操作">
              <div style={{ overflowX: 'auto' }}>
                <table className="w-full text-sm">
                  <thead><tr style={{ textAlign: 'left' }}>
                    <th className="px-2 py-2">评分等级</th><th className="px-2 py-2">自动审核</th><th className="px-2 py-2">人工状态</th><th className="px-2 py-2">授信额度比例</th><th className="px-2 py-2">复核级别</th><th className="px-2 py-2">需人工复核</th><th className="px-2 py-2">可执行操作</th><th className="px-2 py-2">决策建议文案</th>
                  </tr></thead>
                  <tbody>
                    {active.businessFlow.map((f, i) => {
                      const g = active.scoreDisplay.grades.find((x) => x.grade === f.gradeId)
                      return (
                        <tr key={f.gradeId} style={{ borderTop: '1px solid #F1F5F9', verticalAlign: 'top' }}>
                          <td className="px-2 py-2 font-medium">{f.gradeId === '—' ? '计算中' : f.gradeId}<br /><span style={{ fontSize: 11, color: g?.color }}>{g?.label}</span></td>
                          <td className="px-2 py-2"><select disabled={!canEdit} value={f.autoDecision} onChange={(e) => patchFlow(i, (x) => ({ ...x, autoDecision: e.target.value as any }))} style={inpSm}>{['通过', '预警', '拒绝', '处理中'].map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-2"><select disabled={!canEdit} value={f.manualStatus} onChange={(e) => patchFlow(i, (x) => ({ ...x, manualStatus: e.target.value as any }))} style={inpSm}>{['—', '待确认', '待审核', '核验计算中'].map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-2"><input type="number" disabled={!canEdit} value={f.creditLimitRatio} onChange={(e) => patchFlow(i, (x) => ({ ...x, creditLimitRatio: +e.target.value }))} style={numSm} />%</td>
                          <td className="px-2 py-2"><select disabled={!canEdit} value={f.reviewLevel} onChange={(e) => patchFlow(i, (x) => ({ ...x, reviewLevel: e.target.value as any }))} style={inpSm}>{['单人复核', '双人复核', '初审+终审两级'].map((o) => <option key={o}>{o}</option>)}</select></td>
                          <td className="px-2 py-2" style={{ textAlign: 'center' }}><input type="checkbox" disabled={!canEdit} checked={f.needManualReview} onChange={(e) => patchFlow(i, (x) => ({ ...x, needManualReview: e.target.checked }))} /></td>
                          <td className="px-2 py-2">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 220 }}>
                              {ACTION_BY_TYPE[active.reportType].map((a) => {
                                const on = f.allowedActions.includes(a)
                                return <button key={a} disabled={!canEdit} onClick={() => patchFlow(i, (x) => ({ ...x, allowedActions: on ? x.allowedActions.filter((y) => y !== a) : [...x.allowedActions, a] }))}
                                  style={{ padding: '2px 8px', fontSize: 12, borderRadius: 999, border: `1px solid ${on ? '#3B82F6' : '#D1D5DB'}`, background: on ? '#EFF6FF' : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{ACTION_CATALOG[a]}</button>
                              })}
                            </div>
                          </td>
                          <td className="px-2 py-2"><input disabled={!canEdit} value={f.suggestionText} onChange={(e) => patchFlow(i, (x) => ({ ...x, suggestionText: e.target.value }))} style={inpSm} /></td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {tab === 'theme' && (
            <Panel title="样式主题配置" desc="选择预设主题套用配色，或逐项自定义">
              <Field label="主题预设">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {THEME_LIST.map((p) => (
                    <button key={p} disabled={!canEdit} onClick={() => patchTheme((th) => ({ ...th, preset: p, ...THEME_PRESETS[p] }))}
                      style={{ padding: '6px 14px', borderRadius: 8, border: `1px solid ${active.theme.preset === p ? '#3B82F6' : '#D1D5DB'}`, background: active.theme.preset === p ? '#EFF6FF' : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{p}</button>
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
            <Panel title="导出模板配置" desc="配置报告可导出格式与 Word / Excel / PDF 细节">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                <Field label="导出格式" full>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {(['PDF', 'Word', 'Excel'] as const).map((f) => {
                      const on = active.export.formats.includes(f)
                      return <button key={f} disabled={!canEdit} onClick={() => patchExport((e) => ({ ...e, formats: on ? e.formats.filter((x) => x !== f) : [...e.formats, f] }))}
                        style={{ padding: '4px 14px', borderRadius: 8, border: `1px solid ${on ? '#3B82F6' : '#D1D5DB'}`, background: on ? '#EFF6FF' : '#fff', cursor: canEdit ? 'pointer' : 'default' }}>{f}</button>
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

          {/* 实时预览 */}
          <Panel title="实时预览" desc="底部为只读样例，配置变更 300ms 后自动刷新" className="mt-4">
            <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
              {PREVIEW_STATES[active.reportType].map((s) => (
                <button key={s.key} onClick={() => setPreviewState(s.key)} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 13, border: `1px solid ${previewState === s.key ? '#3B82F6' : '#D1D5DB'}`, background: previewState === s.key ? '#EFF6FF' : '#fff', cursor: 'pointer' }}>{s.label}</button>
              ))}
            </div>
            <div style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 10, padding: 14 }}>
              <Preview tpl={previewTpl} stateKey={previewState} />
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}

/* ===== 局部小组件 ===== */
function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</div>{children}
  </div>
}
const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8, width: '100%', fontSize: 14 }
const inpSm: React.CSSProperties = { padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, width: '100%', minWidth: 90 }
const numSm: React.CSSProperties = { width: 56, padding: '4px 6px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }
const colorInp: React.CSSProperties = { width: 48, height: 32, border: '1px solid #D1D5DB', borderRadius: 6, background: 'none' }
const miniBtn: React.CSSProperties = { padding: '3px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer' }
