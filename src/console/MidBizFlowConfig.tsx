/* ============================================================================
 * 业务流程配置（管理中心 · 配置域 · 方案A 流程库·页面关联版）
 * 独立列表页组织：
 *   - 列表页：每行 = 一个业务流程（业务流程名称 + 关联业务页面 + 流程数），可 新建/进入/删除
 *   - 点进业务流程图：该业务流程下的流程（图）列表，每条流程 = 页面操作列的一个按钮（复用 FlowCanvasEditor）
 *   - 业务流程关联「业务页面」（页面名称 + 页面路由），运行时按页面路由挂到页面操作列
 * 数据独立存 bizFlows.json（flowStore），不依赖报告模板；模板 flowRefId 仅作兼容兜底。
 * ========================================================================== */
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Panel, Button, Modal, DetailHeader } from '../components/ui'
import type { SearchSelectOption, SearchSelectGroup } from '../components/ui'
import { PageShell } from './PageShell'
import FlowCanvasEditor from './FlowCanvasEditor'
import { CONFIG_CONTAINER, crumb } from './ConfigTemplate';
import { MENU_BY_SUB, subNames } from './menus';
import PagePicker from './PagePicker'
import { useMidDashboards } from './midStore'
import { useFlows, addFlowItem, updateFlowItem, removeFlowItem, patchFlowItemGraphs, type FlowItem } from './flowStore'
import {
  summarizeFlowGraph, buildDefaultFlowGraph, defaultButtonName,
  type FlowGraph,
} from './reportTemplateData'

/* 可关联的业务页面 = 全部左侧菜单页面（按子系统分组），供关联页面下拉（支持模糊查询） */
const ALL_PAGES: SearchSelectOption[] = Object.entries(MENU_BY_SUB).flatMap(([sub, groups]) =>
  groups.flatMap((g) => g.items.map((it) => ({
    value: `/console/${sub}/${it.key.split(':')[1]}`,
    label: it.label,
    group: sub,
  }))),
)
const PAGE_GROUPS: SearchSelectGroup[] = Object.entries(MENU_BY_SUB).map(([sub]) => ({ key: sub, label: subNames[sub] ?? sub }))

const inp: React.CSSProperties = { border: '1px solid #E5E7EB', borderRadius: 6, padding: '4px 8px', fontSize: 12, outline: 'none', width: '100%' }
const SEL = '#2563EB'
const miniBtn: React.CSSProperties = { padding: '3px 10px', fontSize: 12, borderRadius: 6, cursor: 'pointer', background: '#fff', border: '1px solid #E5E7EB' }
const miniInp: React.CSSProperties = { padding: '4px 8px', fontSize: 12, borderRadius: 6, border: '1px solid #E2E8F0', outline: 'none', background: '#fff' }
/* 标题/描述行内编辑（与页面配置详情一致：悬停描边、聚焦白底） */
const DASH_EDIT_CSS = `
  .dash-edit-input { background: transparent; border: 1px solid transparent; border-radius: 8px; transition: border-color .15s, background .15s; }
  .dash-edit-input:hover { border-color: #E2E8F0; }
  .dash-edit-input:focus { background: #fff; border-color: #C7D2FE; outline: none; }
`
const editTitleStyle: React.CSSProperties = { marginTop: 2, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: '#0F172A', padding: '4px 10px', width: 360 }
const editDescStyle: React.CSSProperties = { marginTop: 4, fontSize: 12, color: '#64748B', padding: '2px 10px', width: 480 }

export default function MidBizFlowConfig() {
  const flows = useFlows()
  const dashboards = useMidDashboards()
  // 反向引用统计（实时扫描）：flowKey → { 组件数, 页面数, 页面名列表 }，来自看板/对象配置的 widget.flowKey
  const refMap = useMemo(() => {
    const m: Record<string, { comps: number; pages: Set<string>; pageNames: Set<string> }> = {}
    for (const pg of dashboards) {
      for (const w of pg.widgets ?? []) {
        const fk = w.flowKey
        if (!fk) continue
        const e = (m[fk] ??= { comps: 0, pages: new Set(), pageNames: new Set() })
        e.comps++
        if (pg.key) e.pages.add(String(pg.key))
        if (pg.name) e.pageNames.add(String(pg.name))
      }
    }
    return m
  }, [dashboards])
  const refInfo = (flowKey?: string) => {
    if (!flowKey) return { comps: 0, pages: 0, pageNames: [] as string[] }
    const e = refMap[flowKey]
    return { comps: e?.comps ?? 0, pages: e?.pages.size ?? 0, pageNames: [...(e?.pageNames ?? [])].slice(0, 4) }
  }
  // 视图态由 URL 路由管理（searchParams ?id=）：详情/列表切换产生 history 记录，浏览器后退正确回到列表
  const [params, setParams] = useSearchParams()
  const selId = params.get('id')
  const view: 'list' | 'detail' = selId ? 'detail' : 'list'
  // 新建业务流程弹窗
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')
  const [newPages, setNewPages] = useState<string[]>(['/console/cr/pre-verify']) // 默认信息核验（可多选）
  // 画布弹窗草稿
  const [flowEdit, setFlowEdit] = useState<{ itemId: string; sub: number } | null>(null)
  const [draftGraph, setDraftGraph] = useState<FlowGraph | null>(null)

  const selItem = selId ? flows.find((i) => i.id === selId) : undefined
  const pageMeta = (r?: string) => ALL_PAGES.find((p) => p.value === r)
  const pageListOf = (f: FlowItem) => (f.pageRoutes?.length ? f.pageRoutes : f.pageRoute ? [f.pageRoute] : [])

  /* ---- 列表页操作 ---- */
  // 进入详情：路由跳转（pushSearchParams），与数据源/指标/策略/页面配置详情行为一致
  const openDetail = (it: FlowItem) => setParams({ id: it.id })
  // 返回列表：路由跳转，浏览器后退/前进能正确回到详情
  const backToList = () => setParams({}, { replace: true })
  const doNew = () => {
    const routes = newPages.filter(Boolean)
    const first = routes[0] ?? ''
    const firstMeta = ALL_PAGES.find((x) => x.value === first)
    const it = addFlowItem({
      domain: first.includes('pre-verify') ? 'info_verify' : first.includes('credit-kimi') ? 'credit' : first.includes('pre-fraud') ? 'fraud' : 'decision',
      name: newName.trim() || `${firstMeta?.label ?? '页面'}·业务流程`,
      pageName: firstMeta?.label, pageRoute: first || undefined,
      pageNames: routes.map((r) => ALL_PAGES.find((x) => x.value === r)?.label ?? r),
      pageRoutes: routes,
    })
    setShowNew(false); setNewName('')
    openDetail(it)
  }

  /* ---- 流程（图）操作 ---- */
  const openCanvas = (item: FlowItem, sub: number) => {
    const g = item.flowGraphs?.[sub]
    setDraftGraph(g ? { nodes: g.nodes.map((n) => ({ ...n })), edges: g.edges.map((e) => ({ ...e })), name: g.name, match: g.match ? g.match.map((m) => ({ ...m })) : undefined, flowSteps: g.flowSteps ? g.flowSteps.map((s) => ({ ...s })) : undefined } : buildDefaultFlowGraph(item as any, '转人工'))
    setFlowEdit({ itemId: item.id, sub })
  }
  const addGraph = (item: FlowItem) => {
    const ng = buildDefaultFlowGraph(item as any, '转人工', defaultButtonName('转人工'))
    // 需求16：新建具体流程默认三节点状态机（状态机下沉到每条流程）
    ng.flowSteps = [...DEFAULT_GRAPH_STEPS]
    patchFlowItemGraphs(item.id, [...(item.flowGraphs ?? []), ng])
    setDraftGraph({ nodes: ng.nodes.map((n) => ({ ...n })), edges: ng.edges.map((e) => ({ ...e })), name: ng.name, flowSteps: ng.flowSteps.map((s) => ({ ...s })) })
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

  // 需求16：关联字段候选（关联页面列表字段）——预警工作台/监控任务等使用域的筛选维度
  const MATCH_FIELD_OPTS: { field: string; label: string }[] = [
    { field: 'level', label: '等级 level' },
    { field: 'alert_type', label: '预警类型 alert_type' },
    { field: 'scene', label: '触发场景 scene' },
    { field: 'rule_name', label: '命中规则 rule_name' },
    { field: 'cust_name', label: '客户 cust_name' },
  ]
  // 需求16：新建具体流程默认状态机（三节点：待处理 → 处理中 → 已处理）
  const DEFAULT_GRAPH_STEPS: { state: string; action: string; timeLimit?: number }[] = [
    { state: '待处理', action: '处理', timeLimit: 60 },
    { state: '处理中', action: '完成', timeLimit: 240 },
    { state: '已处理', action: '', timeLimit: undefined },
  ]

  return (
    <div className={CONFIG_CONTAINER}>
      {view === 'list' ? (
        <PageShell title="业务流程配置" crumb={crumb('业务流程配置')}
          subtitle="独立业务流程库（bizFlows.json）· 每条业务流程关联一个业务页面，配置后挂到页面操作列"
           />
      ) : (
        <>
          <style>{DASH_EDIT_CSS}</style>
          <PageShell header={<DetailHeader
            title={selItem
              ? <input className="dash-edit-input" value={selItem.name} onChange={(e) => updateFlowItem(selItem.id, (f) => ({ ...f, name: e.target.value }))} style={editTitleStyle} />
              : '业务流程配置'}
            crumb="零售信贷风控 / 管理中心 / 业务流程配置"
            subtitle={selItem
              ? <input className="dash-edit-input" value={selItem.desc ?? ''} placeholder="业务流程描述（可选）" onChange={(e) => updateFlowItem(selItem.id, (f) => ({ ...f, desc: e.target.value }))} style={editDescStyle} />
              : undefined}
            backLabel="返回列表" onBack={backToList}
            />} />
        </>
      )}

      {view === 'list' ? (
        <Panel title="业务流程" desc="每行 = 一个业务流程（关联业务页面）；点「进入」管理该流程下的操作按钮流程"
          actions={<Button variant="primary" onClick={() => setShowNew(true)}>＋ 新建业务流程</Button>}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead><tr style={{ background: '#F8FAFC' }}>
              {['业务流程名称', '关联业务页面', '页面地址', '流程数', '被引用', '操作'].map((h) => (
                <th key={h} style={{ padding: '8px', fontSize: 12, fontWeight: 600, color: '#6B7280', textAlign: 'left', borderBottom: '1px solid #E5E7EB' }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {flows.length === 0 && (
                <tr><td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: '#9CA3AF', fontSize: 12 }}>暂无业务流程，点击右上角「＋ 新建业务流程」创建。</td></tr>
              )}
              {flows.map((it) => {
                const pgNames = it.pageNames?.length
                  ? it.pageNames
                  : pageListOf(it).map((r) => pageMeta(r)?.label ?? r)
                const pgRoutes = pageListOf(it)
                const ref = refInfo(it.id)
                const refTxt = ref.comps > 0 ? `${ref.comps} 个组件 / ${ref.pages} 个页面` : '—'
                return (
                  <tr key={it.id} style={{ borderTop: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '8px', fontWeight: 600, color: '#111827', maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={it.name}>{it.name}</td>
                    <td style={{ padding: '8px', color: '#374151', maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={pgNames.join(' / ')}>{pgNames.join(' / ') || '—'}</td>
                    <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: 12, color: '#6B7280', maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={pgRoutes.join('；')}>{pgRoutes.join('；') || '—'}</td>
                    <td style={{ padding: '8px', color: '#6B7280', whiteSpace: 'nowrap' }}>{it.flowGraphs?.length ?? 0} 条</td>
                    <td style={{ padding: '8px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                      <span style={{ color: '#6B7280' }}>{refTxt}</span>
                    </td>
                    <td style={{ padding: '8px', display: 'flex', gap: 6, whiteSpace: 'nowrap' }}>
                      <button onClick={() => openDetail(it)} style={{ ...miniBtn, borderColor: SEL, color: SEL }}>查看</button>
                      <button onClick={() => {
                        if (ref.comps > 0) {
                          if (!window.confirm(`删除业务流程「${it.name}」？\n\n⚠️ 该流程正被 ${ref.comps} 个看板组件引用（分布于 ${ref.pages} 个页面，如 ${ref.pageNames.join('、')}…），删除后这些组件的流程按钮将失效。确认删除？`)) return
                        } else {
                          if (!window.confirm(`删除业务流程「${it.name}」？`)) return
                        }
                        removeFlowItem(it.id)
                      }}
                        style={{ ...miniBtn, borderColor: '#FCA5A5', color: '#DC2626' }}>删除</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ marginTop: 10, fontSize: 12, color: '#6B7280', lineHeight: 1.7 }}>
            说明：业务流程独立于报告模板存储；「关联业务页面」= 流程主动控制哪些页面的操作列（仅上线审核类流程配置）；
            「被引用」= 看板组件通过 flowKey 反选的流程（谁在用我，实时扫描计算，不落数据）。
            删除流程时若存在引用会弹出警告。一条业务流程配置下可挂多条具体流程（「＋ 添加流程」），每条流程 = 页面操作列的一个按钮：
            名称即按钮文案；可配「关联字段」按数据字段值分发（不关联 = 全部数据走本流程）；独立状态机（默认三节点）；
            画布图与节点属性在编辑弹窗中配置。名称与描述在详情页标题行内直接编辑。
          </div>
        </Panel>
      ) : (
        selItem ? (
          <Panel title={selItem.name}
            desc={selItem.desc || undefined}>
            {/* 关联业务页面（可多选，左侧分组按钮 + 右侧页面列表） */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: '#374151', marginBottom: 6 }}>关联页面（可多选 · 业务流程将挂到这些页面的操作列）</div>
              <PagePicker options={ALL_PAGES} groups={PAGE_GROUPS}
                value={selItem.pageRoutes?.length ? selItem.pageRoutes : selItem.pageRoute ? [selItem.pageRoute] : []}
                onChange={(v) => {
                  const routes = v.filter(Boolean)
                  const names = routes.map((r) => ALL_PAGES.find((x) => x.value === r)?.label ?? r)
                  updateFlowItem(selItem.id, (f) => ({ ...f, pageRoutes: routes, pageNames: names, pageRoute: routes[0], pageName: names[0] }))
                }} />
              <div style={{ marginTop: 6, fontSize: 12, color: '#64748B' }}>
                当前：{pageListOf(selItem).map((r) => `${ALL_PAGES.find((x) => x.value === r)?.label ?? r} · ${r}`).join('；') || '—'}
              </div>
            </div>
            {/* 流程（图）列表 = 页面操作列按钮（需求16：每条具体流程 = 名称 + 关联条件 + 独立状态机 + 画布图） */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {(selItem.flowGraphs ?? []).length === 0 && (
                <div style={{ fontSize: 12, color: '#9CA3AF', padding: '6px 0' }}>（暂无流程，点击下方「＋ 添加流程」创建）</div>
              )}
              {(selItem.flowGraphs ?? []).map((g, sub) => {
                const matchTxt = (g.match ?? []).length
                  ? g.match!.map((m) => `${m.field}=${m.value}`).join(' 且 ')
                  : '不关联（全部数据）'
                const stepsTxt = (g.flowSteps ?? []).length
                  ? `${g.flowSteps!.length} 节点`
                  : '默认状态机'
                return (
                  <div key={sub} style={{ display: 'flex', alignItems: 'center', gap: 8, border: '1px solid #E5E7EB', borderRadius: 8, padding: '6px 8px', background: '#fff' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: '#1E40AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{g.name ?? '未命名流程'}</div>
                      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, lineHeight: 1.5, wordBreak: 'break-all' }}>
                        <span style={{ color: '#B45309' }}>关联：{matchTxt}</span> · <span style={{ color: '#1D4ED8' }}>{stepsTxt}</span> · {summarizeFlowGraph(g)}
                      </div>
                    </div>
                    <button onClick={() => openCanvas(selItem, sub)} style={{ ...miniBtn, borderColor: SEL, color: SEL }}>编辑</button>
                    <button onClick={() => removeGraph(selItem, sub)} style={{ ...miniBtn, borderColor: '#FCA5A5', color: '#DC2626' }}>删除</button>
                  </div>
                )
              })}
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
      <Modal open={showNew} onClose={() => setShowNew(false)} title="新建业务流程" width="max-w-lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>业务流程名称<span style={{ color: '#DC2626' }}>*</span></div>
            <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="如：确认报告流程 / 转人工审核流程" style={{ ...inp }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 4 }}>关联业务页面<span style={{ color: '#DC2626' }}>*</span>（可多选）</div>
            <PagePicker options={ALL_PAGES} groups={PAGE_GROUPS} value={newPages} onChange={(v) => setNewPages(v as string[])} />
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4, fontFamily: 'monospace' }}>页面地址：{newPages.filter(Boolean).join('；')}</div>
          </div>
          <div>
            <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>创建后进入配置页：为流程添加具体流程（每条流程配名称 / 关联字段 / 独立状态机 / 画布图）。</div>
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
        {draftGraph && <FlowCanvasEditor graph={draftGraph} onChange={setDraftGraph} readOnly={false} statusEnum={undefined}
          matchFieldOptions={MATCH_FIELD_OPTS} defaultSteps={DEFAULT_GRAPH_STEPS} />}
      </Modal>
    </div>
  )
}
