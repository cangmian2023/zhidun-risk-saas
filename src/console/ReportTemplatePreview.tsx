/* ============================================================================
 * 报告模板 · 实时预览子页面（独立路由 cm:report-template-preview）
 * 从列表/详情页点击「预览」跳转至此，用样例数据渲染报告真实长相（只读）。
 * 顶栏可一键跳回对应报告模板详情页（cm:report-template?id=...）。
 * ========================================================================== */
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { DetailHeader, Panel, Badge, Button, SingleSelect } from '../components/ui'
import {
  ReportTemplate, ScoreGrade, DisplayComponent, REPORT_META, PREVIEW_STATES, PREVIEW_SAMPLE, gradeForScore, computeSectionScore,
  SECTION_SOURCE_LABEL, ROLES, ROLE_HINT, seedReportTemplates, type Role,
  RENDER_CONTAINER_LABEL, defaultContainer, type RenderContainer,
} from './reportTemplateData'

const SEL = '#3B82F6', SEL_BG = '#EFF6FF'

/* ---------- 评分展示组件（预览用） ---------- */
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

/* ---------- 实时预览（真预览：渲染报告真实长相） ---------- */
function Preview({ tpl, stateKey }: { tpl: ReportTemplate; stateKey: string }) {
  const meta = REPORT_META[tpl.reportType]
  const states = PREVIEW_STATES[tpl.reportType]
  const st = states.find((s) => s.key === stateKey) ?? states[0]
  const grade = gradeForScore(tpl, st.score)
  const theme = tpl.theme
  const fs = theme.fontSize === '小' ? 13 : theme.fontSize === '大' ? 16 : 14
  const sample = PREVIEW_SAMPLE[tpl.reportType]
  /* 解析字段的「呈现容器」与「类型」：数据源→表字段；接口→输出字段；规则集→标签 */
  const fieldMeta = (s: ReportTemplate['sections'][number], f: { sourceRef?: string }) => {
    if (s.sourceType === 'data_source') {
      const t = s.ds?.tableFields.find((x) => x.name === f.sourceRef)
      return { container: (t?.container ?? 'text') as RenderContainer, type: t?.type ?? '' }
    }
    if (s.sourceType === 'api') {
      const o = s.api?.outputs.find((x) => x.key === f.sourceRef)
      return { container: (o?.container ?? defaultContainer(o?.type ?? 'string')) as RenderContainer, type: o?.type ?? '' }
    }
    return { container: 'tags' as RenderContainer, type: '' }
  }
  const visibleSections = [...tpl.sections].sort((a, b) => a.order - b.order).filter((s) => s.visible && ((s.homeTab ?? 'content') !== 'log' || tpl.showOpLog))
  const borderR = theme.borderRadius === '直角' ? 0 : theme.borderRadius === '大圆角' ? 14 : 8
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
            <div style={{ fontSize: fs + 2, fontWeight: 700, color: grade.color }}>{grade.grade}</div>
            {tpl.scoreDisplay.showDescription && <div style={{ fontSize: fs - 2, color: '#6B7280', marginTop: 4, maxWidth: 260 }}>{grade.description}</div>}
            {tpl.scoreDisplay.showRiskTags && <div style={{ marginTop: 6 }}><Badge kind="red">风险等级 {grade.riskLevel}</Badge></div>}
          </div>
        </div>
        {tpl.scoreDisplay.showThresholdBar && (
          <div style={{ marginTop: 8 }}>
            <div style={{ position: 'relative', height: 10, borderRadius: 999, background: '#EEF2F7', overflow: 'hidden' }}>
              {tpl.scoreDisplay.grades.map((g, i) => {
                const left = (g.minScore / 100) * 100
                const width = ((g.maxScore - g.minScore + 1) / 100) * 100
                return <span key={i} title={`${g.grade} ${g.minScore}-${g.maxScore}`} style={{ position: 'absolute', left: `${left}%`, width: `${width}%`, height: '100%', background: g.color, opacity: 0.85 }} />
              })}
            </div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>阈值刻度（色块即各风险档区间）</div>
          </div>
        )}
      </div>
      {/* —— 结论与终审卡片（flowBlock，受模板「结论」Tab 显隐/标题控制） —— */}
      {tpl.flowBlock.show && (
        <div style={{ marginBottom: 12, border: '1px solid #E5E7EB', borderRadius: borderR, overflow: 'hidden' }}>
          <div style={{ background: theme.headerStyle === '简洁' ? 'transparent' : '#F8FAFC', borderBottom: '1px solid #EEF2F7', padding: '8px 12px', fontWeight: 600 }}>
            {tpl.flowBlock.title || '结论与终审'}
          </div>
          <div style={{ padding: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: fs, fontWeight: 700, padding: '3px 12px', borderRadius: 999, color: grade.color, background: grade.color + '1A', border: `1px solid ${grade.color}55` }}>{st.label}</span>
              <span style={{ fontSize: fs - 1, color: '#6B7280' }}>系统建议结论（预览样例）</span>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {['审核通过', '拒绝授信', '预警观察', '退回补充'].map((b) => (
                <span key={b} style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #D1D5DB', color: '#9CA3AF', background: '#F9FAFB', cursor: 'not-allowed' }}>{b}</span>
              ))}
            </div>
            <div style={{ marginTop: 10, fontSize: fs - 2, color: '#6B7280' }}>审核人：— ｜ 决策时间：—（只读预览，不落库）</div>
          </div>
        </div>
      )}
      {/* —— 得分计算卡片（scoreBlock，受模板「评分方案」Tab 显隐/标题控制） —— */}
      {tpl.scoreBlock.show && (
        <div style={{ marginBottom: 12, border: '1px solid #E5E7EB', borderRadius: borderR, overflow: 'hidden' }}>
          <div style={{ background: theme.headerStyle === '简洁' ? 'transparent' : '#F8FAFC', borderBottom: '1px solid #EEF2F7', padding: '8px 12px', fontWeight: 600 }}>
            {tpl.scoreBlock.title || '得分计算'}
          </div>
          <div style={{ padding: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <ScoreHero score={st.score} grade={grade} component={tpl.scoreDisplay.displayComponent} />
              <div>
                <div style={{ fontSize: fs + 2, fontWeight: 700, color: grade.color }}>{grade.grade}</div>
                <div style={{ fontSize: fs - 2, color: '#6B7280', marginTop: 4 }}>由各分段计分项自动汇总</div>
              </div>
            </div>
            {(() => {
              const parts = tpl.sections
                .filter((s) => (s.homeTab ?? 'content') === 'content' && s.fields.some((f) => (f.scorePoints ?? 0) !== 0))
                .map((s) => ({ name: s.name, ...computeSectionScore(s) }))
              if (parts.length === 0) return <div style={{ marginTop: 10, fontSize: fs - 2, color: '#9CA3AF' }}>暂无分段配置计分项</div>
              return (
                <div style={{ marginTop: 10, border: '1px solid #EEF2F7', borderRadius: 8, overflow: 'hidden' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr', fontSize: fs - 3, color: '#6B7280', background: '#F8FAFC', padding: '6px 10px', fontWeight: 600 }}>
                    <span>分段</span><span>本卡总分</span><span>加 / 扣 项</span>
                  </div>
                  {parts.map((p, i) => (
                    <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.8fr', fontSize: fs - 2, padding: '6px 10px', borderTop: '1px solid #EEF2F7' }}>
                      <span>{p.name}</span>
                      <span style={{ color: p.mode === 'deduct' ? '#DC2626' : '#047857', fontWeight: 600 }}>{p.mode === 'deduct' ? '−' : '+'}{Math.abs(p.total)}</span>
                      <span>{p.addCount} / {p.deductCount}</span>
                    </div>
                  ))}
                </div>
              )
            })()}
          </div>
        </div>
      )}
      <div style={{ padding: '10px 4px' }}>
        {visibleSections.length === 0 && <div style={{ color: '#9CA3AF', padding: 16 }}>当前未勾选任何分段</div>}
        {visibleSections.map((s) => {
          const sSample = sample.sections[s.id] ?? {}
          const visFields = s.fields.filter((f) => f.visible)
          return (
            <div key={s.id} style={{ marginBottom: 12, border: '1px solid #E5E7EB', borderRadius: borderR, overflow: 'hidden' }}>
              <div style={{ background: theme.headerStyle === '简洁' ? 'transparent' : '#F8FAFC', borderBottom: '1px solid #EEF2F7', padding: '8px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {s.name}
                <span style={{ fontWeight: 400, fontSize: fs - 2, color: '#9CA3AF' }}>（{s.desc}）</span>
                <span style={{ fontSize: fs - 3, padding: '1px 8px', borderRadius: 999, background: s.sourceType === 'data_source' ? '#ECFDF5' : s.sourceType === 'api' ? '#EFF6FF' : '#F5F3FF', border: `1px solid ${s.sourceType === 'data_source' ? '#A7F3D0' : s.sourceType === 'api' ? '#BFDBFE' : '#DDD6FE'}`, color: s.sourceType === 'data_source' ? '#047857' : s.sourceType === 'api' ? '#1D4ED8' : '#6D28D9' }}>{SECTION_SOURCE_LABEL[s.sourceType]}</span>
              </div>
              <div style={{ padding: 10 }}>
                {visFields.length === 0 && <div style={{ fontSize: fs - 2, color: '#9CA3AF' }}>本分段字段已全部隐藏</div>}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 6 }}>
                  {visFields.map((f) => {
                    const val = sSample[f.id] ?? sSample[f.name] ?? (s.sourceType === 'rule_set' ? (f.hitText ?? '命中') : '样例值')
                    const meta = fieldMeta(s, f)
                    const c = meta.container
                    return (
                      <div key={f.id} style={{ fontSize: fs - 2, padding: '6px 8px', background: '#F9FAFB', borderRadius: 6, border: '1px solid #EEF2F7' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                          <span style={{ color: '#6B7280', flex: '0 0 auto' }}>{f.name}</span>
                          <span style={{ fontSize: 10, color: '#9CA3AF', border: '1px solid #E5E7EB', borderRadius: 999, padding: '0 6px', whiteSpace: 'nowrap' }}>{RENDER_CONTAINER_LABEL[c]}{meta.type ? ` · ${meta.type}` : ''}</span>
                        </div>
                        <div style={{ marginTop: 4 }}>
                          {c === 'image' && <div style={{ height: 56, borderRadius: 6, background: 'repeating-conic-gradient(#E5E7EB 0% 25%, #F3F4F6 0% 50%) 50% / 12px 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF', fontSize: 11 }}>🖼 图片预览</div>}
                          {c === 'video' && <div style={{ height: 56, borderRadius: 6, background: 'linear-gradient(135deg,#1E293B,#334155)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: '#E5E7EB', fontSize: 11 }}><span style={{ fontSize: 18, lineHeight: 1 }}>▶</span>视频预览{val && val !== '—' ? `（${val}）` : ''}</div>}
                          {c === 'file' && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#1D4ED8', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '3px 8px' }}>📎 {val} <span style={{ color: '#9CA3AF' }}>下载</span></span>}
                          {c === 'tags' && <span style={{ display: 'inline-block', fontSize: 12, color: '#6D28D9', background: '#F5F3FF', border: '1px solid #DDD6FE', borderRadius: 999, padding: '2px 10px' }}>{val}</span>}
                          {c === 'link' && <a style={{ fontSize: 12, color: '#1D4ED8', textDecoration: 'underline' }} href="#" onClick={(e) => e.preventDefault()}>{val}</a>}
                          {(c === 'text' || c === 'table') && <span style={{ color: '#374151', fontWeight: 500 }}>{val}</span>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ============================ 预览子页面 ============================ */
export default function ReportTemplatePreview() {
  const nav = useNavigate()
  const loc = useLocation()
  const stateTpl = (loc.state as any)?.tpl as ReportTemplate | undefined
  const id = new URLSearchParams(loc.search).get('id') ?? seedReportTemplates[0].id
  const tpl = stateTpl ?? seedReportTemplates.find((t) => t.id === id) ?? seedReportTemplates[0]
  const meta = REPORT_META[tpl.reportType]
  const [stateKey, setStateKey] = useState<string>(PREVIEW_STATES[tpl.reportType][0].key)
  const [role, setRole] = useState<Role>('风控专员')

  const back = () => nav(`/console/cm/report-template?id=${tpl.id}`)

  return (
    <div>
      <DetailHeader
        title={`${tpl.name} · 预览`}
        crumb="公共配置 / 报告模板 / 预览"
        subtitle={`${meta.label} · ${tpl.version}`}
        backLabel="返回详情"
        onBack={back}
        actions={<Button variant="primary" onClick={back}>返回模板详情</Button>}
      />
      <Panel title="报告预览（只读样例）" desc="用样例数据渲染该模板下报告的实际长相。可切换评分档与预览角色查看不同效果。">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10, flexWrap: 'wrap', background: '#F8FAFC', border: '1px solid #EEF2F7', borderRadius: 8, padding: '8px 12px' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>以角色预览：</span>
          <div style={{ width: 160 }}>
            <SingleSelect label="" value={role} options={ROLES.map((r) => ({ value: r, label: r }))} onChange={(v) => setRole(v as Role)} fullWidth />
          </div>
          <span style={{ fontSize: 12, color: '#6B7280' }}>{ROLE_HINT[role]}（仅影响本预览区展示，不影响真实配置权限）</span>
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          {PREVIEW_STATES[tpl.reportType].map((s) => (
            <button key={s.key} onClick={() => setStateKey(s.key)} style={{ padding: '4px 12px', borderRadius: 999, fontSize: 13, border: `1px solid ${stateKey === s.key ? SEL : '#D1D5DB'}`, background: stateKey === s.key ? SEL_BG : '#fff', cursor: 'pointer' }}>{s.label}</button>
          ))}
        </div>
        <div style={{ background: '#fff', border: '1px solid #EEF2F7', borderRadius: 10, padding: 14 }}>
          <Preview tpl={tpl} stateKey={stateKey} />
        </div>
      </Panel>
    </div>
  )
}
