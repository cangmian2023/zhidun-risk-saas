/* ============================================================================
 * 信用模型配置页
 * 对应文档：SaaS/doc/信用模型配置页功能设计.md
 * 列表 + 配置（全局信息 / 六维维度与子指标 / 惩罚机制 / 评分等级映射）
 * + 版本审批 / 回滚 / 变更日志 + 角色权限控制。
 * ========================================================================== */
import { useState, useMemo, useRef, Fragment } from 'react'
import { PageHeader, Panel, Badge, Button, Modal, SingleSelect } from '../components/ui'
import { useModule } from '../store'
import {
  CreditModel, Dimension, SubIndicator, SubIndicatorDataType, ScoringRule, ScoringRuleType,
  ThresholdSegment, EnumMapping, PenaltyRule, TriggerCondition, TriggerConditionType,
  PenaltyType, GradeMapping, ChangeLog, Role, ROLES, ROLE_PERM,
  DATA_SOURCES, PRODUCTS, FORMULA_VARS, newId, nowStr, bumpVersion, defaultRuleForType, seedModel,
} from './creditModel'

const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o))

type NavKey = string // 维度 id | 'penalty' | 'grade'

/* ----------------------------- 样式常量 ----------------------------- */
const inp: React.CSSProperties = { padding: '8px 10px', border: '1px solid #D1D5DB', borderRadius: 8, width: '100%', fontSize: 14 }
const inpSm: React.CSSProperties = { padding: '4px 8px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13, width: '100%' }
const num: React.CSSProperties = { width: 64, padding: '6px 8px', border: '1px solid #D1D5DB', borderRadius: 6, fontSize: 13 }
const colorInp: React.CSSProperties = { width: 40, height: 30, border: '1px solid #D1D5DB', borderRadius: 6, background: 'none', padding: 2 }

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div style={{ gridColumn: full ? '1 / -1' : undefined }}>
    <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 4 }}>{label}</div>{children}
  </div>
}

const OPERATORS: ThresholdSegment['operator'][] = ['>=', '>', '<=', '<', 'between', 'outside']
const PEN_TYPES: PenaltyType[] = ['reject', 'fixed', 'ratio']
const PEN_TYPE_LABEL: Record<PenaltyType, string> = { reject: '直接拒绝', fixed: '固定扣分', ratio: '按比例扣分' }
const TRIG_TYPES: TriggerConditionType[] = ['blacklist', 'dataSourceResult', 'score', 'subScore', 'field']
const TRIG_LABEL: Record<TriggerConditionType, string> = {
  blacklist: '黑名单命中', dataSourceResult: '数据源结论', score: '总分阈值', subScore: '子指标阈值', field: '数据字段',
}
const RISK_LEVELS = ['低', '中', '高'] as const
const AUTO_DECISIONS = ['通过', '预警', '拒绝'] as const

/* ----------------------------- 评分规则编辑器 ----------------------------- */
function ScoringRuleEditor({ rule, dataType, disabled, onChange }: {
  rule: ScoringRule; dataType: SubIndicatorDataType; disabled: boolean; onChange: (r: ScoringRule) => void
}) {
  const typeOptions: ScoringRuleType[] =
    dataType === 'number' ? ['threshold', 'formula'] :
    dataType === 'enum' || dataType === 'boolean' ? ['enum', 'formula'] :
    ['formula']
  const typeLabel: Record<ScoringRuleType, string> = { threshold: '数值阈值', enum: '枚举映射', formula: '公式评分' }

  const setType = (t: ScoringRuleType) => onChange(defaultRuleForType(dataType === 'enum' || dataType === 'boolean' ? 'enum' : dataType))

  if (rule.type === 'threshold') {
    const segs = rule.segments ?? []
    const setSeg = (id: string, fn: (s: ThresholdSegment) => ThresholdSegment) =>
      onChange({ ...rule, segments: segs.map((s) => (s.id === id ? fn(s) : s)) })
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <select disabled={disabled} value={rule.type} onChange={(e) => setType(e.target.value as ScoringRuleType)} style={inpSm}>
            {typeOptions.map((t) => <option key={t} value={t}>{typeLabel[t]}</option>)}
          </select>
          <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>按区间/阈值映射分数</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {segs.map((s) => (
            <div key={s.id} style={{ display: 'flex', gap: 4, alignItems: 'center', border: '1px solid #EEF2F7', borderRadius: 8, padding: 6, background: '#F9FAFB' }}>
              <select disabled={disabled} value={s.operator} onChange={(e) => setSeg(s.id, (x) => ({ ...x, operator: e.target.value as any }))} style={{ ...inpSm, width: 92 }}>
                {OPERATORS.map((o) => <option key={o} value={o}>{o === 'between' ? '区间' : o === 'outside' ? '区间外' : o}</option>)}
              </select>
              <input disabled={disabled} type="number" value={s.value} onChange={(e) => setSeg(s.id, (x) => ({ ...x, value: +e.target.value }))} style={{ ...num, width: 56 }} />
              {(s.operator === 'between' || s.operator === 'outside') && <span style={{ fontSize: 12, color: '#9CA3AF' }}>~</span>}
              {(s.operator === 'between' || s.operator === 'outside') && (
                <input disabled={disabled} type="number" value={s.value2 ?? 0} onChange={(e) => setSeg(s.id, (x) => ({ ...x, value2: +e.target.value }))} style={{ ...num, width: 56 }} />
              )}
              <input disabled={disabled} type="number" value={s.score} onChange={(e) => setSeg(s.id, (x) => ({ ...x, score: +e.target.value }))} style={{ ...num, width: 48 }} title="得分" />
              <input disabled={disabled} value={s.label} onChange={(e) => setSeg(s.id, (x) => ({ ...x, label: e.target.value }))} style={{ ...inpSm, minWidth: 64 }} placeholder="标签" />
              <button disabled={disabled} onClick={() => onChange({ ...rule, segments: segs.filter((x) => x.id !== s.id) })} style={miniBtn}>×</button>
            </div>
          ))}
        </div>
        <button disabled={disabled} onClick={() => onChange({ ...rule, segments: [...segs, { id: newId('seg'), operator: '>=', value: 0, score: 100, label: '新区间' }] })} style={{ ...miniBtn, marginTop: 6 }}>+ 添加区间</button>
      </div>
    )
  }

  if (rule.type === 'enum') {
    const maps = rule.mappings ?? []
    const setMap = (id: string, fn: (m: EnumMapping) => EnumMapping) =>
      onChange({ ...rule, mappings: maps.map((m) => (m.id === id ? fn(m) : m)) })
    return (
      <div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <select disabled={disabled} value={rule.type} onChange={(e) => setType(e.target.value as ScoringRuleType)} style={inpSm}>
            {typeOptions.map((t) => <option key={t} value={t}>{typeLabel[t]}</option>)}
          </select>
          <span style={{ fontSize: 12, color: '#9CA3AF', alignSelf: 'center' }}>枚举值 → 分数映射</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
          {maps.map((m) => (
            <div key={m.id} style={{ display: 'flex', gap: 4, alignItems: 'center', border: '1px solid #EEF2F7', borderRadius: 8, padding: 6, background: '#F9FAFB' }}>
              <input disabled={disabled} value={String(m.value)} onChange={(e) => setMap(m.id, (x) => ({ ...x, value: e.target.value }))} style={{ ...inpSm, minWidth: 64 }} placeholder="值" />
              <input disabled={disabled} type="number" value={m.score} onChange={(e) => setMap(m.id, (x) => ({ ...x, score: +e.target.value }))} style={{ ...num, width: 48 }} title="得分" />
              <input disabled={disabled} value={m.label} onChange={(e) => setMap(m.id, (x) => ({ ...x, label: e.target.value }))} style={{ ...inpSm, minWidth: 64 }} placeholder="标签" />
              <button disabled={disabled} onClick={() => onChange({ ...rule, mappings: maps.filter((x) => x.id !== m.id) })} style={miniBtn}>×</button>
            </div>
          ))}
        </div>
        <button disabled={disabled} onClick={() => onChange({ ...rule, mappings: [...maps, { id: newId('em'), value: '新值', score: 0, label: '新标签' }] })} style={{ ...miniBtn, marginTop: 6 }}>+ 添加映射</button>
      </div>
    )
  }

  // formula
  const f = rule.formula ?? { expression: '', lowerBound: 0, upperBound: 100 }
  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <select disabled={disabled} value={rule.type} onChange={(e) => setType(e.target.value as ScoringRuleType)} style={inpSm}>
          {typeOptions.map((t) => <option key={t} value={t}>{typeLabel[t]}</option>)}
        </select>
      </div>
      <input disabled={disabled} value={f.expression} onChange={(e) => onChange({ ...rule, formula: { ...f, expression: e.target.value } })} style={inp} placeholder="例如：收入 / 负债 * 100" />
      <div style={{ display: 'flex', gap: 12, marginTop: 6, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#6B7280' }}>结果区间</span>
        <input disabled={disabled} type="number" value={f.lowerBound} onChange={(e) => onChange({ ...rule, formula: { ...f, lowerBound: +e.target.value } })} style={num} title="下界" />
        <span style={{ color: '#9CA3AF' }}>~</span>
        <input disabled={disabled} type="number" value={f.upperBound} onChange={(e) => onChange({ ...rule, formula: { ...f, upperBound: +e.target.value } })} style={num} title="上界" />
        <span style={{ fontSize: 12, color: '#9CA3AF' }}>映射至 0~100 分</span>
      </div>
      <div style={{ marginTop: 6, fontSize: 12, color: '#9CA3AF' }}>可用变量：{FORMULA_VARS.join('、')}</div>
    </div>
  )
}

const miniBtn: React.CSSProperties = { padding: '3px 10px', fontSize: 12, borderRadius: 6, border: '1px solid #D1D5DB', background: '#fff', cursor: 'pointer' }
const chipOn = (b: boolean) => ({
  padding: '4px 12px', borderRadius: 999, fontSize: 13, cursor: 'pointer' as const,
  border: `1px solid ${b ? '#3B82F6' : '#D1D5DB'}`, background: b ? '#EFF6FF' : '#fff', color: b ? '#1D4ED8' : '#374151',
})

/* ============================ 主组件 ============================ */
export default function CreditModelConfig() {
  const [model, setModelState] = useState<CreditModel>(() => clone(seedModel))
  const baselineRef = useRef<CreditModel>(clone(seedModel))
  const historyRef = useRef<{ version: string; model: CreditModel; timestamp: string }[]>([])
  const [dirty, setDirty] = useState(false)
  const [navKey, setNavKey] = useState<string>(seedModel.dimensions[0].id)
  const [role, setRole] = useState<Role>('系统管理员')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [showRollback, setShowRollback] = useState(false)

  const perm = ROLE_PERM[role]
  const canEdit = perm.edit

  const dimWeightSum = useMemo(() => Math.round(model.dimensions.reduce((s, d) => s + d.weight, 0) * 100) / 100, [model.dimensions])
  const activeDim = model.dimensions.find((d) => d.id === navKey)
  const subWeightSum = (d: Dimension) => Math.round(d.subIndicators.reduce((s, x) => s + x.weight, 0) * 100) / 100

  /* ---------------- 通用更新 ---------------- */
  const update = (fn: (m: CreditModel) => CreditModel) => { setDirty(true); setModelState((m) => fn(m)) }
  const patchModel = (fn: (m: CreditModel) => CreditModel) => update(fn)
  const patchDim = (id: string, fn: (d: Dimension) => Dimension) =>
    update((m) => ({ ...m, dimensions: m.dimensions.map((d) => (d.id === id ? fn(d) : d)) }))
  const patchSub = (dimId: string, subId: string, fn: (s: SubIndicator) => SubIndicator) =>
    patchDim(dimId, (d) => ({ ...d, subIndicators: d.subIndicators.map((s) => (s.id === subId ? fn(s) : s)) }))
  const patchPenalty = (id: string, fn: (p: PenaltyRule) => PenaltyRule) =>
    update((m) => ({ ...m, penalties: m.penalties.map((p) => (p.id === id ? fn(p) : p)) }))
  const patchGrade = (i: number, fn: (g: GradeMapping) => GradeMapping) =>
    update((m) => ({ ...m, grades: m.grades.map((g, k) => (k === i ? fn(g) : g)) }))

  /* ---------------- 版本动作 ---------------- */
  const commit = (next: CreditModel, action: ChangeLog['action'], summary: string, approver?: string) => {
    const nv = bumpVersion(model.version)
    const logged: CreditModel = {
      ...next, version: nv,
      changeLogs: [{ version: nv, action, operator: '当前用户', timestamp: nowStr(), summary, approver }, ...next.changeLogs],
    }
    setModelState(logged)
    baselineRef.current = clone(logged)
    historyRef.current = [...historyRef.current, { version: nv, model: clone(logged), timestamp: nowStr() }]
    setDirty(false)
  }

  const saveDraft = () => {
    if (!canEdit) return
    commit(model, '保存草稿', '保存草稿配置')
    flash('已保存草稿')
  }
  const activate = () => {
    if (!perm.enable) return
    const reason = window.prompt('请输入生效审批意见（将记入审批日志）：')
    if (reason === null) return
    const nv = bumpVersion(model.version)
    const next: CreditModel = { ...model, status: '已生效', version: nv, changeLogs: [{ version: nv, action: '生效', operator: '当前用户', timestamp: nowStr(), summary: reason ? `生效模型：${reason}` : '生效模型', approver: '风控主管', approvalComment: reason || '' }, ...model.changeLogs] }
    setModelState(next); baselineRef.current = clone(next)
    historyRef.current = [...historyRef.current, { version: nv, model: clone(next), timestamp: nowStr() }]; setDirty(false)
    flash('模型已生效')
  }
  const deactivate = () => {
    if (!perm.enable) return
    const nv = bumpVersion(model.version)
    const next: CreditModel = { ...model, status: '已下线', version: nv, changeLogs: [{ version: nv, action: '下线', operator: '当前用户', timestamp: nowStr(), summary: '下线模型', approver: '风控主管' }, ...model.changeLogs] }
    setModelState(next); baselineRef.current = clone(next)
    historyRef.current = [...historyRef.current, { version: nv, model: clone(next), timestamp: nowStr() }]; setDirty(false)
    flash('模型已下线')
  }
  const rollbackTo = (version: string) => {
    if (!perm.rollback) return
    const snap = historyRef.current.find((h) => h.version === version)
    if (!snap) return
    const nv = bumpVersion(model.version)
    const restored = clone(snap.model)
    const next: CreditModel = { ...restored, version: nv, changeLogs: [{ version: nv, action: '回滚', operator: '当前用户', timestamp: nowStr(), summary: `回滚至版本 ${version}` }, ...restored.changeLogs] }
    setModelState(next); baselineRef.current = clone(next); setDirty(false); setShowRollback(false)
    flash(`已回滚至版本 ${version}`)
  }
  const reset = () => { setModelState(clone(baselineRef.current)); setDirty(false); flash('已重置为上次保存') }

  const { flash } = useModule()

  /* ---------------- 角色权限矩阵展示 ---------------- */
  const permRows: { role: Role; edit: boolean; enable: boolean; rollback: boolean }[] = ROLES.map((r) => ({
    role: r, ...ROLE_PERM[r],
  }))

  return (
    <div style={{ padding: 20, maxWidth: 1280, margin: '0 auto' }}>
      <PageHeader
        title="信用模型配置"
        subtitle={`${model.name} · ${model.version} · 状态 ${model.status} · 适用范围 ${model.scopeType === '全产品' ? '全产品' : model.scope.join('、')}`}
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <SingleSelect label="当前角色" value={role} onChange={(v) => setRole(v as Role)}
              options={ROLES.map((r) => ({ label: r, value: r }))} />
            <Button size="sm" variant="secondary" disabled={!canEdit} onClick={saveDraft}>保存草稿</Button>
            <Button size="sm" variant="secondary" disabled={!canEdit || !dirty} onClick={reset}>重置</Button>
            {model.status !== '已生效'
              ? <Button size="sm" disabled={!perm.enable} onClick={activate}>生效</Button>
              : <Button size="sm" variant="secondary" disabled={!perm.enable} onClick={deactivate}>下线</Button>}
            <Button size="sm" variant="ghost" disabled={!perm.rollback || historyRef.current.length === 0} onClick={() => setShowRollback(true)}>回滚</Button>
          </div>
        }
      />
      {dirty && <div style={{ fontSize: 12, color: '#D97706', margin: '6px 0' }}>● 有未保存的修改</div>}

      {/* 全局信息 */}
      <Panel title="模型全局信息" desc="基础信息与适用范围" className="mt-3">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          <Field label="模型名称"><input disabled={!canEdit} value={model.name} onChange={(e) => patchModel((m) => ({ ...m, name: e.target.value }))} style={inp} /></Field>
          <Field label="当前版本"><Badge kind="blue">{model.version}</Badge> <span style={{ fontSize: 12, color: '#9CA3AF', marginLeft: 6 }}>保存/生效后自动递增</span></Field>
          <Field label="生效状态">
            <Badge kind={model.status === '已生效' ? 'green' : model.status === '已下线' ? 'gray' : 'amber'}>{model.status}</Badge>
          </Field>
          <Field label="适用产品范围">
            <select disabled={!canEdit} value={model.scopeType} onChange={(e) => patchModel((m) => ({ ...m, scopeType: e.target.value as any, scope: e.target.value === '全产品' ? [] : m.scope }))} style={inp}>
              <option>全产品</option><option>指定产品</option>
            </select>
            {model.scopeType === '指定产品' && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                {PRODUCTS.map((p) => {
                  const on = model.scope.includes(p)
                  return <button key={p} type="button" disabled={!canEdit} onClick={() => patchModel((m) => ({ ...m, scope: on ? m.scope.filter((x) => x !== p) : [...m.scope, p] }))} style={chipOn(on)}>{p}</button>
                })}
              </div>
            )}
          </Field>
          <Field label="总分下限" full><div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input disabled={!canEdit} type="number" value={model.totalScoreMin} onChange={(e) => patchModel((m) => ({ ...m, totalScoreMin: +e.target.value }))} style={num} />
            <span style={{ color: '#9CA3AF' }}>~</span>
            <input disabled={!canEdit} type="number" value={model.totalScoreMax} onChange={(e) => patchModel((m) => ({ ...m, totalScoreMax: +e.target.value }))} style={num} />
            <span style={{ fontSize: 12, color: '#9CA3AF' }}>（默认 0~100）</span>
          </div></Field>
          <Field label="模型描述" full>
            <textarea disabled={!canEdit} value={model.description} onChange={(e) => patchModel((m) => ({ ...m, description: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} />
          </Field>
        </div>
      </Panel>

      {/* 左右布局 */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, marginTop: 16 }}>
        {/* 左侧导航 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#9CA3AF', fontWeight: 600, paddingLeft: 4 }}>评估维度（权重合计 {dimWeightSum}%）</div>
          {dimWeightSum !== 100 && <Badge kind="red">维度权重合计需为 100%</Badge>}
          {model.dimensions.map((d) => (
            <button key={d.id} type="button" onClick={() => setNavKey(d.id)}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                border: `1px solid ${navKey === d.id ? '#3B82F6' : '#E5E7EB'}`,
                background: navKey === d.id ? '#EFF6FF' : '#fff',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 18 }}>{d.icon}</span>
                <span style={{ fontWeight: 600 }}>{d.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: 12, color: '#6B7280' }}>{d.weight}%</span>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: d.enabled ? '#16A34A' : '#D1D5DB' }} />
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{d.subIndicators.length} 个子指标</div>
            </button>
          ))}
          <div style={{ borderTop: '1px solid #EEF2F7', margin: '6px 0' }} />
          <button type="button" onClick={() => setNavKey('penalty')}
            style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${navKey === 'penalty' ? '#3B82F6' : '#E5E7EB'}`, background: navKey === 'penalty' ? '#EFF6FF' : '#fff' }}>
            <span style={{ fontWeight: 600 }}>⚠️ 惩罚机制</span><span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280' }}>{model.penalties.length} 条</span>
          </button>
          <button type="button" onClick={() => setNavKey('grade')}
            style={{ textAlign: 'left', padding: '10px 12px', borderRadius: 10, cursor: 'pointer', border: `1px solid ${navKey === 'grade' ? '#3B82F6' : '#E5E7EB'}`, background: navKey === 'grade' ? '#EFF6FF' : '#fff' }}>
            <span style={{ fontWeight: 600 }}>📊 评分等级映射</span><span style={{ marginLeft: 8, fontSize: 12, color: '#6B7280' }}>{model.grades.length} 级</span>
          </button>

          {/* 角色权限矩阵 */}
          <Panel title="角色权限矩阵" desc="当前页面操作权限" className="mt-2">
            <div style={{ fontSize: 12 }}>
              {permRows.map((r) => (
                <div key={r.role} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ width: 72, color: '#374151' }}>{r.role}</span>
                  <Badge kind={r.edit ? 'green' : 'gray'}>{r.edit ? '编辑' : '只读'}</Badge>
                  <Badge kind={r.enable ? 'green' : 'gray'}>{r.enable ? '可生效' : '不可'}</Badge>
                  <Badge kind={r.rollback ? 'green' : 'gray'}>{r.rollback ? '可回滚' : '不可'}</Badge>
                </div>
              ))}
            </div>
          </Panel>
        </div>

        {/* 右侧配置面板 */}
        <div>
          {activeDim && (
            <Panel title={`${activeDim.icon} ${activeDim.name} · 维度配置`} desc={`维度权重 ${activeDim.weight}%（子指标权重合计 ${subWeightSum(activeDim)}%）`}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
                <Field label="维度名称"><input disabled={!canEdit} value={activeDim.name} onChange={(e) => patchDim(activeDim.id, (d) => ({ ...d, name: e.target.value }))} style={inp} /></Field>
                <Field label="维度标识"><input disabled value={activeDim.id} style={{ ...inp, color: '#9CA3AF' }} /></Field>
                <Field label="维度权重 (%)">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <input disabled={!canEdit} type="range" min={0} max={100} value={activeDim.weight} onChange={(e) => patchDim(activeDim.id, (d) => ({ ...d, weight: +e.target.value }))} />
                    <input disabled={!canEdit} type="number" value={activeDim.weight} onChange={(e) => patchDim(activeDim.id, (d) => ({ ...d, weight: +e.target.value }))} style={num} />
                    <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" disabled={!canEdit} checked={activeDim.enabled} onChange={(e) => patchDim(activeDim.id, (d) => ({ ...d, enabled: e.target.checked }))} />启用</label>
                  </div>
                </Field>
                <Field label="数据来源" full>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {DATA_SOURCES.map((s) => {
                      const on = activeDim.dataSources.includes(s)
                      return <button key={s} type="button" disabled={!canEdit} onClick={() => patchDim(activeDim.id, (d) => ({ ...d, dataSources: on ? d.dataSources.filter((x) => x !== s) : [...d.dataSources, s] }))} style={chipOn(on)}>{s}</button>
                    })}
                  </div>
                </Field>
                <Field label="维度描述" full>
                  <textarea disabled={!canEdit} value={activeDim.description} onChange={(e) => patchDim(activeDim.id, (d) => ({ ...d, description: e.target.value }))} rows={2} style={{ ...inp, resize: 'vertical' }} />
                </Field>
              </div>

              {/* 子指标表 */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontWeight: 600 }}>子指标（{activeDim.subIndicators.length}）</div>
                  <Button size="sm" variant="secondary" disabled={!canEdit} onClick={() => patchDim(activeDim.id, (d) => ({ ...d, subIndicators: [...d.subIndicators, {
                    id: newId('sub'), name: '新子指标', dataField: 'new.field', dataType: 'number', maxScore: 100, weight: 0, enabled: true, scoringRules: [defaultRuleForType('number')],
                  }] }))}>+ 添加子指标</Button>
                </div>
                <div style={{ border: '1px solid #EEF2F7', borderRadius: 10, overflow: 'hidden' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', textAlign: 'left', color: '#6B7280' }}>
                        <th style={th}>名称</th><th style={th}>数据字段</th><th style={th}>类型</th>
                        <th style={th}>最大分</th><th style={th}>权重%</th><th style={th}>启用</th><th style={th}>评分规则</th><th style={th}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeDim.subIndicators.map((s) => {
                        const open = expanded[s.id]
                        const rule = s.scoringRules[0]
                        return (
                          <Fragment key={s.id}>
                            <tr key={s.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                              <td style={td}><input disabled={!canEdit} value={s.name} onChange={(e) => patchSub(activeDim.id, s.id, (x) => ({ ...x, name: e.target.value }))} style={{ ...inpSm, minWidth: 110 }} /></td>
                              <td style={td}><input disabled={!canEdit} value={s.dataField} onChange={(e) => patchSub(activeDim.id, s.id, (x) => ({ ...x, dataField: e.target.value }))} style={{ ...inpSm, minWidth: 120 }} /></td>
                              <td style={td}>
                                <select disabled={!canEdit} value={s.dataType} onChange={(e) => { const dt = e.target.value as SubIndicatorDataType; patchSub(activeDim.id, s.id, (x) => ({ ...x, dataType: dt, scoringRules: [defaultRuleForType(dt)] })) }} style={inpSm}>
                                  <option value="number">数值</option><option value="enum">枚举</option><option value="boolean">布尔</option><option value="string">文本</option>
                                </select>
                              </td>
                              <td style={td}><input disabled={!canEdit} type="number" value={s.maxScore} onChange={(e) => patchSub(activeDim.id, s.id, (x) => ({ ...x, maxScore: +e.target.value }))} style={{ ...num, width: 56 }} /></td>
                              <td style={td}><input disabled={!canEdit} type="number" value={s.weight} onChange={(e) => patchSub(activeDim.id, s.id, (x) => ({ ...x, weight: +e.target.value }))} style={{ ...num, width: 56 }} /></td>
                              <td style={td}><input type="checkbox" disabled={!canEdit} checked={s.enabled} onChange={(e) => patchSub(activeDim.id, s.id, (x) => ({ ...x, enabled: e.target.checked }))} /></td>
                              <td style={td}><button disabled={!canEdit} onClick={() => setExpanded((p) => ({ ...p, [s.id]: !p[s.id] }))} style={miniBtn}>{open ? '收起' : '编辑'}</button></td>
                              <td style={td}><button disabled={!canEdit} onClick={() => patchDim(activeDim.id, (d) => ({ ...d, subIndicators: d.subIndicators.filter((x) => x.id !== s.id) }))} style={{ ...miniBtn, color: '#DC2626' }}>删除</button></td>
                            </tr>
                            {open && rule && (
                              <tr key={s.id + '_rule'} style={{ background: '#FCFCFD' }}>
                                <td colSpan={8} style={{ padding: 12 }}>
                                  <div style={{ fontSize: 12, color: '#6B7280', marginBottom: 6 }}>评分规则（按类型配置映射逻辑）</div>
                                  <ScoringRuleEditor rule={rule} dataType={s.dataType} disabled={!canEdit}
                                    onChange={(r) => patchSub(activeDim.id, s.id, (x) => ({ ...x, scoringRules: [r] }))} />
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </Panel>
          )}

          {navKey === 'penalty' && (
            <Panel title="⚠️ 惩罚机制">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <Button size="sm" variant="secondary" disabled={!canEdit} onClick={() => update((m) => ({ ...m, penalties: [...m.penalties, {
                  id: newId('pen'), name: '新惩罚规则', description: '', triggerConditions: [{ id: newId('tc'), type: 'blacklist' }],
                  logic: 'AND', penaltyType: 'fixed', penaltyValue: 10, maxPenalty: 10, exemptible: true, exemptLevel: '风控主管', enabled: true,
                }] }))}>+ 添加惩罚规则</Button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {model.penalties.map((p) => (
                  <div key={p.id} style={{ border: '1px solid #EEF2F7', borderRadius: 10, padding: 12 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                      <Field label="规则名称"><input disabled={!canEdit} value={p.name} onChange={(e) => patchPenalty(p.id, (x) => ({ ...x, name: e.target.value }))} style={inp} /></Field>
                      <Field label="启用 / 豁免">
                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                          <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" disabled={!canEdit} checked={p.enabled} onChange={(e) => patchPenalty(p.id, (x) => ({ ...x, enabled: e.target.checked }))} />启用</label>
                          <label style={{ fontSize: 13, display: 'flex', gap: 6, alignItems: 'center' }}><input type="checkbox" disabled={!canEdit} checked={p.exemptible} onChange={(e) => patchPenalty(p.id, (x) => ({ ...x, exemptible: e.target.checked }))} />可豁免</label>
                          {p.exemptible && <select disabled={!canEdit} value={p.exemptLevel} onChange={(e) => patchPenalty(p.id, (x) => ({ ...x, exemptLevel: e.target.value as any }))} style={inpSm}><option>风控主管</option><option>系统管理员</option><option>不可豁免</option></select>}
                        </div>
                      </Field>
                      <Field label="规则描述" full><input disabled={!canEdit} value={p.description} onChange={(e) => patchPenalty(p.id, (x) => ({ ...x, description: e.target.value }))} style={inp} /></Field>
                      <Field label="惩罚类型">
                        <select disabled={!canEdit} value={p.penaltyType} onChange={(e) => patchPenalty(p.id, (x) => ({ ...x, penaltyType: e.target.value as PenaltyType }))} style={inp}>
                          {PEN_TYPES.map((t) => <option key={t} value={t}>{PEN_TYPE_LABEL[t]}</option>)}
                        </select>
                      </Field>
                      {p.penaltyType !== 'reject' && (
                        <>
                          <Field label={p.penaltyType === 'fixed' ? '扣分绝对值' : '扣分比例(%)'}>
                            <input disabled={!canEdit} type="number" value={p.penaltyValue} onChange={(e) => patchPenalty(p.id, (x) => ({ ...x, penaltyValue: +e.target.value }))} style={inp} />
                          </Field>
                          <Field label="最大扣分"><input disabled={!canEdit} type="number" value={p.maxPenalty} onChange={(e) => patchPenalty(p.id, (x) => ({ ...x, maxPenalty: +e.target.value }))} style={inp} /></Field>
                        </>
                      )}
                    </div>
                    {/* 触发条件 */}
                    <div style={{ marginTop: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>触发条件（</span>
                        <select disabled={!canEdit} value={p.logic} onChange={(e) => patchPenalty(p.id, (x) => ({ ...x, logic: e.target.value as any }))} style={{ ...inpSm, width: 70 }}>
                          <option value="AND">AND</option><option value="OR">OR</option>
                        </select>
                        <span style={{ fontSize: 12, color: '#6B7280' }}>满足）</span>
                        <button disabled={!canEdit} onClick={() => patchPenalty(p.id, (x) => ({ ...x, triggerConditions: [...x.triggerConditions, { id: newId('tc'), type: 'subScore', field: '', operator: '>=', value: 0 }] }))} style={{ ...miniBtn, marginLeft: 'auto' }}>+ 条件</button>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {p.triggerConditions.map((c) => {
                          const setC = (fn: (x: TriggerCondition) => TriggerCondition) => patchPenalty(p.id, (x) => ({ ...x, triggerConditions: x.triggerConditions.map((y) => (y.id === c.id ? fn(y) : y)) }))
                          return (
                            <div key={c.id} style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', background: '#F9FAFB', border: '1px solid #EEF2F7', borderRadius: 8, padding: 6 }}>
                              <select disabled={!canEdit} value={c.type} onChange={(e) => setC((x) => ({ ...x, type: e.target.value as TriggerConditionType }))} style={{ ...inpSm, width: 120 }}>
                                {TRIG_TYPES.map((t) => <option key={t} value={t}>{TRIG_LABEL[t]}</option>)}
                              </select>
                              {c.type !== 'blacklist' && <input disabled={!canEdit} value={c.field ?? ''} onChange={(e) => setC((x) => ({ ...x, field: e.target.value }))} style={{ ...inpSm, minWidth: 120 }} placeholder="字段/数据源" />}
                              {c.type !== 'blacklist' && (
                                <select disabled={!canEdit} value={c.operator ?? '>='} onChange={(e) => setC((x) => ({ ...x, operator: e.target.value as any }))} style={{ ...inpSm, width: 64 }}>
                                  {['>=', '>', '<=', '<', '==', 'in'].map((o) => <option key={o} value={o}>{o}</option>)}
                                </select>
                              )}
                              {c.type !== 'blacklist' && <input disabled={!canEdit} value={Array.isArray(c.value) ? c.value.join(',') : String(c.value ?? '')} onChange={(e) => setC((x) => ({ ...x, value: e.target.value }))} style={{ ...inpSm, width: 110 }} placeholder="阈值/值" />}
                              <button disabled={!canEdit} onClick={() => patchPenalty(p.id, (x) => ({ ...x, triggerConditions: x.triggerConditions.filter((y) => y.id !== c.id) }))} style={{ ...miniBtn, color: '#DC2626' }}>×</button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div style={{ marginTop: 8, textAlign: 'right' }}>
                      <button disabled={!canEdit} onClick={() => update((m) => ({ ...m, penalties: m.penalties.filter((x) => x.id !== p.id) }))} style={{ ...miniBtn, color: '#DC2626' }}>删除规则</button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {navKey === 'grade' && (
            <Panel title="📊 评分等级映射">
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                <Button size="sm" variant="secondary" disabled={!canEdit} onClick={() => update((m) => ({ ...m, grades: [...m.grades, {
                  grade: `级${m.grades.length + 1}`, label: '新等级', minScore: 0, maxScore: 0, riskLevel: '中', autoDecision: '预警', needManualReview: false, creditLimitRatio: 0, color: '#64748B',
                }] }))}>+ 添加等级</Button>
              </div>
              <div style={{ border: '1px solid #EEF2F7', borderRadius: 10, overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', textAlign: 'left', color: '#6B7280' }}>
                      <th style={th}>等级</th><th style={th}>标签</th><th style={th}>分数区间</th><th style={th}>风险</th>
                      <th style={th}>自动决策</th><th style={th}>人工复核</th><th style={th}>授信比例%</th><th style={th}>颜色</th><th style={th}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {model.grades.map((g, i) => (
                      <tr key={g.grade + i} style={{ borderTop: '1px solid #F1F5F9' }}>
                        <td style={td}><input disabled={!canEdit} value={g.grade} onChange={(e) => patchGrade(i, (x) => ({ ...x, grade: e.target.value }))} style={{ ...inpSm, width: 56 }} /></td>
                        <td style={td}><input disabled={!canEdit} value={g.label} onChange={(e) => patchGrade(i, (x) => ({ ...x, label: e.target.value }))} style={{ ...inpSm, width: 80 }} /></td>
                        <td style={td}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                            <input disabled={!canEdit} type="number" value={g.minScore} onChange={(e) => patchGrade(i, (x) => ({ ...x, minScore: +e.target.value }))} style={{ ...num, width: 52 }} />
                            <span style={{ color: '#9CA3AF' }}>~</span>
                            <input disabled={!canEdit} type="number" value={g.maxScore} onChange={(e) => patchGrade(i, (x) => ({ ...x, maxScore: +e.target.value }))} style={{ ...num, width: 52 }} />
                          </div>
                        </td>
                        <td style={td}>
                          <select disabled={!canEdit} value={g.riskLevel} onChange={(e) => patchGrade(i, (x) => ({ ...x, riskLevel: e.target.value as any }))} style={inpSm}>
                            {RISK_LEVELS.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td style={td}>
                          <select disabled={!canEdit} value={g.autoDecision} onChange={(e) => patchGrade(i, (x) => ({ ...x, autoDecision: e.target.value as any }))} style={inpSm}>
                            {AUTO_DECISIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </td>
                        <td style={td}><input type="checkbox" disabled={!canEdit} checked={g.needManualReview} onChange={(e) => patchGrade(i, (x) => ({ ...x, needManualReview: e.target.checked }))} /></td>
                        <td style={td}><input disabled={!canEdit} type="number" value={g.creditLimitRatio} onChange={(e) => patchGrade(i, (x) => ({ ...x, creditLimitRatio: +e.target.value }))} style={{ ...num, width: 56 }} /></td>
                        <td style={td}><input type="color" disabled={!canEdit} value={g.color} onChange={(e) => patchGrade(i, (x) => ({ ...x, color: e.target.value }))} style={colorInp} /></td>
                        <td style={td}><button disabled={!canEdit} onClick={() => update((m) => ({ ...m, grades: m.grades.filter((_, k) => k !== i) }))} style={{ ...miniBtn, color: '#DC2626' }}>删除</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          )}

          {/* 变更日志 */}
          <Panel title="模型变更日志" desc={`共 ${model.changeLogs.length} 条`} className="mt-4">
            <div style={{ maxHeight: 220, overflow: 'auto' }}>
              {model.changeLogs.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
                  <Badge kind="blue">{c.version}</Badge>
                  <Badge kind={c.action === '下线' ? 'gray' : c.action === '回滚' ? 'violet' : c.action === '保存草稿' ? 'amber' : 'green'}>{c.action}</Badge>
                  <span style={{ color: '#374151' }}>{c.summary}</span>
                  {c.approver && <Badge kind="gray">审批：{c.approver}</Badge>}
                  <span style={{ marginLeft: 'auto', color: '#9CA3AF', fontSize: 12 }}>{c.operator} · {c.timestamp}</span>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      {/* 回滚弹窗 */}
      <Modal open={showRollback} onClose={() => setShowRollback(false)} title="回滚至历史版本">
        <div style={{ fontSize: 13, color: '#6B7280', marginBottom: 10 }}>选择要恢复的版本（将生成新的递增版本并记录回滚日志）</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflow: 'auto' }}>
          {[...historyRef.current].reverse().map((h) => (
            <div key={h.version + h.timestamp} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #EEF2F7', borderRadius: 8, padding: '8px 10px' }}>
              <Badge kind="blue">{h.version}</Badge>
              <span style={{ color: '#374151', fontSize: 13 }}>{h.timestamp}</span>
              <button onClick={() => rollbackTo(h.version)} style={{ ...miniBtn, marginLeft: 'auto' }}>回滚到此版本</button>
            </div>
          ))}
          {historyRef.current.length === 0 && <div style={{ color: '#9CA3AF', fontSize: 13 }}>暂无历史版本（请先保存或生效）</div>}
        </div>
      </Modal>
    </div>
  )
}

/* 避免重复 import useModule 的轻封装 */
const th: React.CSSProperties = { padding: '8px 10px', fontWeight: 600, whiteSpace: 'nowrap' }
const td: React.CSSProperties = { padding: '6px 8px', verticalAlign: 'top' }
