// 企业风控 · 监控规则 创建/查看 共用表单
// 创建页与查看页共用同一套规则结构（维度树 / 指标 / 分类），仅标题与只读态不同
// 数据：本地样例 fkMonRuleCreate.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpBtn, useSample, Sam } from '../../epCommon'
import { usePageNav } from '../../../pageNav'
import seedJson from '../../../fkMonRuleCreate.json'

type Data = typeof seedJson
type DimNode = Data['dims'][number]

const GRADE_COLOR: Record<string, string> = {
  高风险: '#DC2626',
  中风险: '#F59E0B',
  低风险: '#10B981',
  轻微风险: '#94A3B8',
  日常资讯: '#3B82F6',
}

const LEVEL_TABS = [
  { key: 'high', label: '高风险' },
  { key: 'mid', label: '中风险' },
  { key: 'low', label: '低风险' },
  { key: 'micro', label: '轻微风险' },
  { key: 'daily', label: '日常资讯' },
] as const

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
)

const IconCalendar = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
)

const IconDown = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
)

const IconSave = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <polyline points="17 21 17 13 7 13 7 21" />
    <polyline points="7 3 7 8 15 8" />
  </svg>
)

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)

function Chevron({ expanded }: { expanded?: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform .15s' }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

function GradeBadge({ grade, readOnly }: { grade: string; readOnly?: boolean }) {
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 8px',
        border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, color: '#334155',
        cursor: readOnly ? 'default' : 'pointer', background: '#fff',
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: GRADE_COLOR[grade] || '#94A3B8' }} />
      <span>{grade}</span>
      {!readOnly && <IconDown />}
    </div>
  )
}

function CountTab({ label, value, color, active, onClick }: { label: string; value: number; color: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8,
        border: '1px solid ' + (active ? color : '#E2E8F0'), background: active ? '#fff' : '#F8FAFC',
        color: active ? color : '#64748B', fontSize: 13, cursor: 'pointer',
      }}
    >
      <span style={{ color: active ? color : '#94A3B8' }}>{label}</span>
      <b style={{ color }}>{value}</b>
    </button>
  )
}

function toggleNode(nodes: DimNode[], id: string): DimNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, checked: !n.checked }
    if (n.children?.length) return { ...n, children: toggleNode(n.children, id) }
    return n
  })
}

function expandNode(nodes: DimNode[], id: string): DimNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, expanded: !n.expanded }
    if (n.children?.length) return { ...n, children: expandNode(n.children, id) }
    return n
  })
}

function updateNode(nodes: DimNode[], id: string, patch: Partial<DimNode>): DimNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...patch }
    if (n.children?.length) return { ...n, children: updateNode(n.children, id, patch) }
    return n
  })
}

export function RuleForm({
  mode,
  ruleName,
  ruleDesc,
  backTo,
}: {
  mode: 'create' | 'view'
  ruleName?: string
  ruleDesc?: string
  backTo: string
}) {
  const [data] = useSample<Data>('fkMonRuleCreate.json', seedJson)
  const { back } = usePageNav()
  const readOnly = mode === 'view'

  const [name, setName] = useState(ruleName ?? data.ruleName)
  const [desc, setDesc] = useState(ruleDesc ?? data.ruleDesc)
  const [activeCat, setActiveCat] = useState(data.activeCategory)
  const [activeLevel, setActiveLevel] = useState<string | null>(null)
  const [search, setSearch] = useState(data.search)
  const [dims, setDims] = useState<DimNode[]>(data.dims)

  const lc = data.levelCounts
  const filteredDims = dims
    .filter((d) => d.category === activeCat)
    .filter((d) => !search || d.name.includes(search))

  const renderNode = (node: DimNode, depth = 0) => {
    const hasChildren = (node.children?.length || 0) > 0
    return (
      <div key={node.id}>
        <div
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 0',
            borderBottom: '1px solid #F1F5F9', fontSize: 13,
          }}
        >
          <span style={{ width: 16, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            {hasChildren ? (
              <span style={{ cursor: 'pointer' }} onClick={() => !readOnly && setDims((prev) => expandNode(prev, node.id))}>
                <Chevron expanded={node.expanded} />
              </span>
            ) : null}
          </span>
          <span style={{ width: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
            <input
              type="checkbox"
              checked={node.checked}
              disabled={readOnly}
              onChange={() => !readOnly && setDims((prev) => toggleNode(prev, node.id))}
              style={{ width: 14, height: 14, accentColor: '#2563EB', cursor: readOnly ? 'default' : 'pointer' }}
            />
          </span>
          <span style={{ flex: 1, paddingLeft: depth * 14, color: '#0F172A' }}>{node.name}</span>
          <span style={{ width: 110 }}>
            {node.operator != null ? (
              <select
                value={node.operator}
                disabled={readOnly}
                onChange={(e) => setDims((prev) => updateNode(prev, node.id, { operator: e.target.value }))}
                style={{ width: 110, padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, color: '#334155', background: '#fff' }}
              >
                <option value="">请选择</option>
                <option value="大于等于">大于等于</option>
                <option value="小于">小于</option>
                <option value="等于">等于</option>
              </select>
            ) : null}
          </span>
          <span style={{ width: 80 }}>
            {node.percent != null && node.percent !== '' ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <input
                  value={node.percent}
                  disabled={readOnly}
                  onChange={(e) => setDims((prev) => updateNode(prev, node.id, { percent: e.target.value }))}
                  style={{ width: 54, padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, textAlign: 'right' }}
                />
                <span style={{ color: '#64748B' }}>%</span>
              </div>
            ) : null}
          </span>
          <span style={{ width: 140 }}>{node.grade ? <GradeBadge grade={node.grade} readOnly={readOnly} /> : null}</span>
          <span style={{ width: 100 }}>
            {node.score != null ? (
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <input
                  type="number"
                  value={node.score}
                  disabled={readOnly}
                  onChange={(e) => setDims((prev) => updateNode(prev, node.id, { score: Number(e.target.value) }))}
                  style={{ width: 60, padding: '4px 8px', border: '1px solid #E2E8F0', borderRadius: 6, fontSize: 13, textAlign: 'right' }}
                />
                <span style={{ color: '#64748B' }}>分</span>
              </div>
            ) : null}
          </span>
        </div>
        {hasChildren && node.expanded && node.children!.map((child) => renderNode(child, depth + 1))}
      </div>
    )
  }

  return (
    <EpPage
      title={readOnly ? '查看监控规则' : '创建国内企业规则'}
      crumb="监控规则 / 规则详情"
      actions={
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Sam value="fkMonRuleCreate.json" />
          {readOnly ? (
            <EpBtn variant="default" size="sm" onClick={() => back(backTo)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <IconClose /> 关闭
            </EpBtn>
          ) : (
            <>
              <EpBtn variant="default" size="sm" onClick={() => back(backTo)} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <IconClose /> 取消
              </EpBtn>
              <EpBtn variant="primary" size="sm" onClick={() => alert('保存规则')} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#2563EB', borderColor: '#2563EB' }}>
                <IconSave /> 保存
              </EpBtn>
            </>
          )}
        </div>
      }
      onBack={() => back(backTo)}
    >
      {/* 规则名称 + 规则说明 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>
            规则名称 <span style={{ color: '#DC2626' }}>*</span>
          </div>
          <input
            value={name}
            disabled={readOnly}
            onChange={(e) => setName(e.target.value.slice(0, data.ruleNameMax))}
            placeholder="请输入规则名称"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', background: readOnly ? '#F8FAFC' : '#fff' }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{name.length}/{data.ruleNameMax}</div>
        </div>
        <div>
          <div style={{ fontSize: 13, color: '#475569', marginBottom: 6 }}>规则说明</div>
          <input
            value={desc}
            disabled={readOnly}
            onChange={(e) => setDesc(e.target.value.slice(0, data.ruleDescMax))}
            placeholder="请输入规则说明"
            style={{ width: '100%', padding: '8px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', background: readOnly ? '#F8FAFC' : '#fff' }}
          />
          <div style={{ textAlign: 'right', fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{desc.length}/{data.ruleDescMax}</div>
        </div>
      </div>

      {/* 规则指标 */}
      <EpCard>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>规则指标</span>
            <span style={{ fontSize: 12, color: '#64748B' }}>
              共 <b style={{ color: '#0F172A' }}>{data.totalDims}</b> 个维度，已监控 <b style={{ color: '#0F172A' }}>{data.monitoredDims}</b> 个维度
            </span>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {LEVEL_TABS.map((t) => (
              <CountTab
                key={t.key}
                label={t.label}
                value={lc[t.key as keyof typeof lc]}
                color={GRADE_COLOR[t.label]}
                active={activeLevel === t.key}
                onClick={() => setActiveLevel(activeLevel === t.key ? null : t.key)}
              />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 220 }}>
              <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                <IconSearch />
              </span>
              <input
                value={search}
                disabled={readOnly}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="搜索风险类型"
                style={{ width: '100%', padding: '6px 10px 6px 30px', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, outline: 'none', background: readOnly ? '#F8FAFC' : '#fff' }}
              />
            </div>
            <button
              disabled={readOnly}
              style={{ width: 32, height: 32, border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: readOnly ? 'default' : 'pointer' }}
            >
              <IconCalendar />
            </button>
          </div>
        </div>

        {/* 分类侧边栏 + 维度树 */}
        <div style={{ display: 'grid', gridTemplateColumns: '168px 1fr', border: '1px solid #F1F5F9', borderRadius: 12, overflow: 'hidden', minHeight: 420 }}>
          {/* 左侧分类 */}
          <div style={{ borderRight: '1px solid #F1F5F9', background: '#FAFBFC' }}>
            {data.categories.map((c) => (
              <div
                key={c}
                onClick={() => setActiveCat(c)}
                style={{
                  padding: '12px 16px', fontSize: 13,
                  color: activeCat === c ? '#2563EB' : '#475569',
                  background: activeCat === c ? '#EFF6FF' : 'transparent',
                  borderLeft: activeCat === c ? '3px solid #2563EB' : '3px solid transparent',
                  cursor: 'pointer', fontWeight: activeCat === c ? 600 : 400,
                }}
              >
                {c}
              </div>
            ))}
          </div>

          {/* 右侧维度表 */}
          <div style={{ padding: '12px 16px 16px', background: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, padding: '6px 10px', background: '#EFF6FF', borderRadius: 6 }}>
              <span style={{ width: 3, height: 16, background: '#2563EB', borderRadius: 2 }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{activeCat}</span>
            </div>

            {/* 表头 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 0', borderBottom: '1px solid #E2E8F0', fontSize: 12, color: '#64748B', fontWeight: 500 }}>
              <span style={{ width: 16 }} />
              <span style={{ width: 14 }} />
              <span style={{ flex: 1 }}>监控维度</span>
              <span style={{ width: 110 }}>触发条件</span>
              <span style={{ width: 80 }}>阈值</span>
              <span style={{ width: 140 }}>等级设置</span>
              <span style={{ width: 100 }}>风险分值（0-100分）</span>
            </div>

            {/* 维度行 */}
            <div>{filteredDims.map((d) => renderNode(d))}</div>
          </div>
        </div>
      </EpCard>
    </EpPage>
  )
}
