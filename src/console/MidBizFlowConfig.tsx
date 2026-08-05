// 业务流程配置（管理中心 · 配置域）— 复用各报告模板内的 businessFlow（按 信息核验 / 信用风控 / 欺诈识别 / 进件审核 四个业务域分组）
// 编辑器与 ReportTemplate「人工审核」Tab 同源，复用 FlowCanvasEditor；写回通过 updateTemplate 自动落盘 templateSeed.json。
// 四个运行时审核页（信息核验/信用风控/欺诈识别/进件审核）仍读取各自模板的 businessFlow，无需改动即可生效。
import { useState } from 'react'
import { useTemplates, updateTemplate } from './templateStore'
import { Panel, Button, Modal } from '../components/ui'
import { PageShell } from './PageShell'
import FlowCanvasEditor from './FlowCanvasEditor'
import { CONFIG_CONTAINER, crumb } from './ConfigTemplate'
import { Cfg } from './SourceTag'
import {
  summarizeFlowGraph, buildDefaultFlowGraph, defaultButtonName, AUTO_RESULT_COLOR,
  type BusinessFlowConfig, type FlowGraph, type AutoResult,
} from './reportTemplateData'

const DOMAINS = [
  { key: 'info_verify', label: '信息核验', templateId: 'tpl-info-backup222' },
  { key: 'credit', label: '信用风控', templateId: 'tpl-credit-222' },
  { key: 'fraud', label: '欺诈识别', templateId: 'tpl-fraud-222' },
  { key: 'decision', label: '进件审核', templateId: 'tpl-decision-222' },
]

const inp: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', width: '100%' }
const SEL = '#2563EB'
const miniBtn: React.CSSProperties = { padding: '3px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: '#fff', border: '1px solid #E5E7EB' }

export default function MidBizFlowConfig() {
  const templates = useTemplates()
  const [domainKey, setDomainKey] = useState(DOMAINS[0].key)
  const domain = DOMAINS.find((d) => d.key === domainKey)!
  const tpl = templates.find((t) => t.id === domain.templateId)
    ?? templates.find((t) => t.reportType === domain.key)

  const canEdit = true

  // 弹窗画布草稿（点「保存流程」才写回模板）
  const [flowEdit, setFlowEdit] = useState<{ gi: number; sub: number } | null>(null)
  const [draftGraph, setDraftGraph] = useState<FlowGraph | null>(null)

  if (!tpl) {
    return (
      <div className={CONFIG_CONTAINER}>
        <PageShell title="业务流程配置" crumb={crumb('业务流程配置')} />
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
          未找到业务域「{domain.label}」对应的报告模板（{domain.templateId}）。
        </div>
      </div>
    )
  }

  const grades = tpl.scoreDisplay?.grades ?? []
  const patchFlow = (i: number, fn: (f: BusinessFlowConfig) => BusinessFlowConfig) =>
    updateTemplate(tpl.id, (t) => ({ ...t, businessFlow: t.businessFlow.map((f, k) => (k === i ? fn(f) : f)) }))
  const patchFlowBlock = (p: Partial<typeof tpl.flowBlock>) =>
    updateTemplate(tpl.id, (t) => ({ ...t, flowBlock: { ...t.flowBlock, ...p } }))

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

  const flowRows = (tpl.businessFlow ?? []).slice(1).map((flow, i) => ({ grade: grades[i], flow }))

  return (
    <div className={CONFIG_CONTAINER}>
      <PageShell title="业务流程配置" crumb={crumb('业务流程配置')}
        subtitle="按业务域统一管理各报告模板的审核操作流程；配置后实时生效于对应审核页的操作按钮"
        actions={<Cfg value="templateSeed.json (businessFlow)" />} />

      {/* 业务域分签 */}
      <div className="flex gap-1 border-b border-slate-200">
        {DOMAINS.map((d) => (
          <button key={d.key} type="button" onClick={() => setDomainKey(d.key)}
            className={`px-4 py-2 text-sm font-medium ${domainKey === d.key ? 'border-b-2 border-brand-600 text-brand-600' : 'border-b-2 border-transparent text-slate-500'}`}>
            {d.label}
          </button>
        ))}
      </div>

      <Panel title={`${domain.label} · 人工审核配置`} desc="每个评分分段（报告状态）下可配置多条业务流程，每条对应审核页中的一个操作按钮">
        {/* 标题 + 启用 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#F8FAFC', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#374151' }}>标题<span style={{ color: '#DC2626', marginLeft: 2 }}>*</span></span>
          <input disabled={!canEdit} value={tpl.flowBlock.title}
            onChange={(e) => patchFlowBlock({ title: e.target.value })}
            placeholder="输入标题（必填）" style={{ ...inp, width: 260, ...(tpl.flowBlock.title.trim() === '' ? { borderColor: '#DC2626' } : {}) }} />
          <span style={{ flex: 1 }} />
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', cursor: canEdit ? 'pointer' : 'default' }}>
            <input type="checkbox" disabled={!canEdit} checked={tpl.flowBlock.show}
              onChange={(e) => patchFlowBlock({ show: e.target.checked })} />
            启用
          </label>
          <span style={{ fontSize: 12, color: tpl.flowBlock.show ? '#047857' : '#9CA3AF' }}>{tpl.flowBlock.show ? '已启用' : '未启用'}</span>
        </div>
        {/* 状态枚举类 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid #E5E7EB', borderRadius: 10, background: '#F8FAFC', marginBottom: 12 }}>
          <span style={{ fontSize: 13, color: '#374151', whiteSpace: 'nowrap' }}>状态枚举类<span style={{ color: '#DC2626', marginLeft: 2 }}>*</span></span>
          <input disabled={!canEdit} value={(tpl.flowBlock.statusEnum ?? []).join('/')}
            onChange={(e) => patchFlowBlock({ statusEnum: e.target.value.split('/').map((s) => s.trim()).filter(Boolean) })}
            placeholder="用 / 分隔，如 待确认/通过/拒绝/完结/挂起/转人工" style={{ ...inp, flex: 1 }} />
          <span style={{ fontSize: 12, color: '#9CA3AF', whiteSpace: 'nowrap' }}>共 {(tpl.flowBlock.statusEnum ?? []).length} 个状态</span>
        </div>

        <div style={tpl.flowBlock.show ? undefined : { opacity: 0.45, pointerEvents: 'none', userSelect: 'none' }}>
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
                        {(flow.flowGraphs ?? []).map((g, sub) => (
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
                        ))}
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
            说明：每行对应一个评分分段（即一种报告状态）。「业务流程配置」中每条流程 = 该状态下出现的一个操作按钮（如「确认通过」「转人工审核」）；流程名称在画布编辑器中设置。一个状态下可配置多个按钮（多条流程）。
          </div>
        </div>
      </Panel>

      {/* 分段业务流程 · 自由画布弹窗 */}
      <Modal open={flowEdit != null} onClose={() => { setFlowEdit(null); setDraftGraph(null) }}
        title={flowEdit != null ? `业务流程配置 · 第 ${flowEdit.sub + 1} 条 · ${grades[flowEdit.gi - 1] ? `${grades[flowEdit.gi - 1].grade} · ${grades[flowEdit.gi - 1].label}` : ''}` : ''}
        width="max-w-5xl"
        footer={<>
          <Button variant="ghost" onClick={() => { setFlowEdit(null); setDraftGraph(null) }}>取消</Button>
          {canEdit && flowEdit != null && (
            <Button variant="ghost" onClick={() => {
              const f = tpl.businessFlow[flowEdit.gi]
              const g = grades[flowEdit.gi - 1]
              setDraftGraph(buildDefaultFlowGraph(f, g?.autoResult ?? '转人工'))
            }}>重置为默认流程</Button>
          )}
          {canEdit && <Button variant="primary" onClick={saveFlowCanvas}>保存流程</Button>}
        </>}>
        {draftGraph && <FlowCanvasEditor graph={draftGraph} onChange={setDraftGraph} readOnly={!canEdit} statusEnum={tpl.flowBlock.statusEnum} />}
      </Modal>
    </div>
  )
}
