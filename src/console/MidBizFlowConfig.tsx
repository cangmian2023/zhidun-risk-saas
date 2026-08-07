/* ============================================================================
 * 业务流程配置（管理中心 · 配置域 · 方案A 流程库·页面关联版）
 * 独立列表页组织：
 *   - 列表页：每行 = 一个业务流程（业务流程名称 + 关联业务页面 + 流程数），可 新建/进入/删除
 *   - 点进业务流程图：该业务流程下的流程（图）列表，每条流程 = 页面操作列的一个按钮（复用 FlowCanvasEditor）
 *   - 业务流程关联「业务页面」（页面名称 + 页面路由），运行时按页面路由挂到页面操作列
 * 数据独立存 bizFlows.json（flowStore），不依赖报告模板；模板 flowRefId 仅作兼容兜底。
 * ========================================================================== */
import { useState } from 'react'
import { Panel, Button, Modal } from '../components/ui'
import { PageShell } from './PageShell'
import FlowCanvasEditor from './FlowCanvasEditor'
import { CONFIG_CONTAINER, crumb } from './ConfigTemplate'
import { Cfg } from './SourceTag'
import { useFlows, addFlowItem, updateFlowItem, removeFlowItem, patchFlowItemGraphs, type FlowItem } from './flowStore'
import {
  summarizeFlowGraph, buildDefaultFlowGraph, defaultButtonName,
  type FlowGraph,
} from './reportTemplateData'

/* 可关联的业务页面（页面名称 + 路由地址）——列表页/详情页操作列均来自关联的业务流程 */
const PAGES = [
  { name: '信息核验', route: '/console/cr/pre-verify' },
  { name: '信用风控', route: '/console/cr/credit-kimi' },
  { name: '欺诈识别', route: '/console/cr/pre-fraud' },
  { name: '进件审核', route: '/console/cr/pre-report' },
]
const GRADES = [
  { grade: '', label: '全部（不分段）' },
  { grade: 'A', label: 'A 档（通过）' },
  { grade: 'B', label: 'B 档（转人工）' },
  { grade: 'C', label: 'C 档（拒绝）' },
]

const inp: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', width: '100%' }
const SEL = '#2563EB'
const miniBtn: React.CSSProperties = { padding: '3px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: '#fff', border: '1px solid #E5E7EB' }

export default function MidBizFlowConfig() {
  const flows = useFlows()
  // 视图：list = 业务流程列表；detail = 选中业务流程的流程列表
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [selId, setSelId] = useState<string | null>(null)
  // 新建业务流程弹窗
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPage, setNewPage] = useState(PAGES[1].route) // 默认详情页
  const [newGrade, setNewGrade] = useState('')
  // 画布弹窗草稿
  const [flowEdit, setFlowEdit] = useState<{ itemId: string; sub: number } | null>(null)
  const [draftGraph, setDraftGraph] = useState<FlowGraph | null>(null)

  const selItem = selId ? flows.find((i) => i.id === selId) : undefined
  const pageMeta = (r?: string) => PAGES.find((p) => p.route === r)

  /* ---- 列表页操作 ---- */
  const openDetail = (it: FlowItem) => { setSelId(it.id); setView('detail') }
  const doNew = () => {
    const p = PAGES.find((x) => x.route === newPage)!
    const it = addFlowItem({
      domain: p.route.includes('pre-verify') ? 'info_verify' : p.route.includes('credit-kimi') ? 'credit' : p.route.includes('pre-fraud') ? 'fraud' : 'decision',
      name: newName.trim() || `${p.name}·业务流程`,
      gradeId: newGrade || undefined,
      pageName: p.name, pageRoute: p.route,
    })
    setShowNew(false); setNewName(''); setNewGrade('')
    openDetail(it)
  }

  /* ---- 流程（图）操作 ---- */
  const openCanvas = (item: FlowItem, sub: number) => {
    const g = item.flowGraphs?.[sub]
    setDraftGraph(g ? { nodes: g.nodes.map((n) => ({ ...n })), edges: g.edges.map((e) => ({ ...e })) } : buildDefaultFlowGraph(item as any, '转人工'))
    setFlowEdit({ itemId: item.id, sub })
  }
  const addGraph = (item: FlowItem) => {
    const ng = buildDefaultFlowGraph(item as any, '转人工', defaultButtonName('转人工'))
    patchFlowItemGraphs(item.id, [...(item.flowGraphs ?? []), ng])
    setDraftGraph({ nodes: ng.nodes.map((n) => ({ ...n })), edges: ng.edges.map((e) => ({ ...e })) })
    setFlowEdit({ itemId: item.id, sub: (item.flowGraphs ?? []).length })
  }
  const removeGraph = (item: FlowItem, sub: number) => {
    patchFlowItemGraphs(item.id, (item.flowGraphs ?? []).filter((_, k) => k !== sub))
  }
  const saveCanvas = () => {
    if (!flowEdit || !draftGraph) return
    updateFlowItem(flowEdit.itemId, (f) => {
      const arr = [...(f.flowGraphs ?? [])]
      arr[flowEdit.sub] = draftGraph
      return { ...f, flowGraphs: arr }
    })
    setFlowEdit(null); setDraftGraph(null)
  }

  const gradeMeta = (g?: string) => GRADES.find((x) => x.grade === (g ?? ''))

  return (
    <div className={CONFIG_CONTAINER}>
      <PageShell title="业务流程配置" crumb={crumb('业务流程配置')}
        subtitle="独立业务流程库（bizFlows.json）· 每条业务流程关联一个业务页面，配置后挂到页面操作列"
        actions={<Cfg value="bizFlows.json (flows)" />} />

      {view === 'list' ? (
        <Panel title="业务流程" desc="每行 = 一个业务流程（关联业务页面）；点「进入」管理该流程下的操作按钮流程"
          actions={<Button variant="primary" onClick={() => setShowNew(true)}>＋ 新建业务流程</Button>}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#F8FAFC' }}>
              {['业务流程名称', '关联业务页面', '页面地址', '流程数', '操作'].map((h) => (
                <th key={h} style={{ padding: '8px', fontSize: 12, fontWeight: 600, color: '#6B7280', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {flows.length === 0 && (
                <tr><td colSpan={5} style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>暂无业务流程，点击右上角「＋ 新建业务流程」创建。</td></tr>
              )}
              {flows.map((it) => {
                const pm = pageMeta(it.pageRoute)
                return (
                  <tr key={it.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '8px', fontWeight: 600, color: '#111827' }}>{it.name}<Cfg f="flows[].name" v={it.name} /></td>
                    <td style={{ padding: '8px', color: '#374151' }}>{it.pageName ?? pm?.name ?? '—'}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: 12, color: '#6B7280' }}>{it.pageRoute ?? '—'}</td>
                    <td style={{ padding: '8px', color: '#6B7280' }}>{it.flowGraphs?.length ?? 0} 条</td>
                    <td style={{ padding: '8px', display: 'flex', gap: 6 }}>
                      <button onClick={() => openDetail(it)} style={{ ...miniBtn, borderColor: SEL, color: SEL }}>查看</button>
                      <button onClick={() => { if (window.confirm(`删除业务流程「${it.name}」？`)) removeFlowItem(it.id) }}
                        style={{ ...miniBtn, borderColor: '#FCA5A5', color: '#DC2626' }}>删除</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 10, fontSize: 12, color: '#6B7280', lineHeight: 1.7 }}>
            说明：业务流程独立于报告模板存储；运行时按「关联页面地址」把流程挂到该页面的操作列（列表页操作列 / 详情页按钮共用）。
            每条流程 = 页面操作列的一个按钮，流程名称即按钮文案；可按得分落段（A/B/C）区分按钮，不选则所有行都显示。
          </div>
        </Panel>
      ) : (
        selItem ? (
          <Panel title={<>{selItem.name}<Cfg f="flows[].name" v={selItem.name} /></>}
            desc={<>关联页面：{selItem.pageName ?? '—'} · {selItem.pageRoute ?? '—'} · 分段 {gradeMeta(selItem.gradeId)?.label ?? '全部'}</>}
            actions={<Button variant="ghost" onClick={() => setView('list')}>← 返回列表</Button>}>
            {/* 基本信息编辑 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: '#374151' }}>业务流程名称</span>
              <input value={selItem.name} onChange={(e) => updateFlowItem(selItem.id, (f) => ({ ...f, name: e.target.value }))} style={{ ...inp, width: 200 }} />
              <span style={{ fontSize: 12, color: '#374151' }}>关联页面</span>
              <select value={selItem.pageRoute ?? ''} onChange={(e) => { const p = PAGES.find((x) => x.route === e.target.value); updateFlowItem(selItem.id, (f) => ({ ...f, pageRoute: p?.route, pageName: p?.name })) }} style={{ ...inp, width: 200 }}>
                {PAGES.map((p) => <option key={p.route} value={p.route}>{p.name}</option>)}
              </select>
              <select value={selItem.gradeId ?? ''} onChange={(e) => updateFlowItem(selItem.id, (f) => ({ ...f, gradeId: e.target.value || undefined }))} style={{ ...inp, width: 150 }}>
                {GRADES.map((g) => <option key={g.grade} value={g.grade}>{g.label}</option>)}
              </select>
            </div>
            {/* 流程（图）列表 = 页面操作列按钮 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>操作按钮流程（{selItem.flowGraphs?.length ?? 0} 条 · 每条 = 操作列一个按钮）</div>
              {(selItem.flowGraphs ?? []).length === 0 && (
                <div style={{ fontSize: 12, color: '#9CA3AF', padding: '6px 0' }}>（暂无流程，点击下方「＋ 添加流程」创建）</div>
              )}
              {(selItem.flowGraphs ?? []).map((g, sub) => (
                <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 8px', background: '#fff' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name ?? '未命名流程'}</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, lineHeight: 1.5, wordBreak: 'break-all' }}>{summarizeFlowGraph(g)}</div>
                  </div>
                  <button onClick={() => openCanvas(selItem, sub)} style={{ ...miniBtn, borderColor: SEL, color: SEL }}>编辑</button>
                  <button onClick={() => removeGraph(selItem, sub)} style={{ ...miniBtn, borderColor: '#FCA5A5', color: '#DC2626' }}>删除</button>
                </div>
              ))}
              <div>
                <button onClick={() => addGraph(selItem)} style={{ ...miniBtn, borderColor: SEL, color: SEL }}>＋ 添加流程</button>
              </div>
            </div>
          </Panel>
        ) : (
          <Panel title="业务流程" desc=""><div className="px-4 py-12 text-center text-sm text-slate-400">未找到业务流程，返回列表重选。</div></Panel>
        )
      )}

      {/* 新建业务流程弹窗 */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="新建业务流程" width="max-w-md">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>业务流程名称<span style={{ color: '#DC2626' }}>*</span></div>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="如：确认报告流程 / 转人工审核流程" style={{ ...inp }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>关联业务页面<span style={{ color: '#DC2626' }}>*</span></div>
            <select value={newPage} onChange={(e) => setNewPage(e.target.value)} style={{ ...inp }}>
              {PAGES.map((p) => <option key={p.route} value={p.route}>{p.name}</option>)}
            </select>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, fontFamily: 'monospace' }}>页面地址：{newPage}</div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>分段（可选）</div>
            <select value={newGrade} onChange={(e) => setNewGrade(e.target.value)} style={{ ...inp }}>
              {GRADES.map((g) => <option key={g.grade} value={g.grade}>{g.label}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="ghost" onClick={() => setShowNew(false)}>取消</Button>
          <Button variant="primary" onClick={doNew} disabled={!newName.trim()}>创建并进入</Button>
        </div>
      </Modal>

      {/* 画布弹窗 */}
      <Modal open={flowEdit != null} onClose={() => { setFlowEdit(null); setDraftGraph(null) }}
        title={flowEdit != null && selItem ? `操作按钮流程 · 第 ${flowEdit.sub + 1} 条 · ${selItem.name}` : ''}
        width="max-w-5xl"
        footer={<>
          <Button variant="ghost" onClick={() => { setFlowEdit(null); setDraftGraph(null) }}>取消</Button>
          {flowEdit != null && (
            <Button variant="ghost" onClick={() => setDraftGraph(buildDefaultFlowGraph(selItem as any, '转人工'))}>重置为默认流程</Button>
          )}
          <Button variant="primary" onClick={saveCanvas}>保存流程</Button>
        </>}>
        {draftGraph && <FlowCanvasEditor graph={draftGraph} onChange={setDraftGraph} readOnly={false} statusEnum={undefined} />}
      </Modal>
    </div>
  )
}
