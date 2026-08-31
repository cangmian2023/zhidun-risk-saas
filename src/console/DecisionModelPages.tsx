// 决策引擎 · 决策建模模块页面（模型管理 / 模型详情 / 决策流编辑 / 模型测试）
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDecision, updateDecision, MODEL_STATUS_TAG, type DeFlowGraph } from './decisionData';
import { PageShell } from './PageShell';
import { Panel, DataTable, Badge, Button, DetailHeader, type Column, type Row } from '../components/ui';
import DecisionFlowGraph from './DecisionFlowGraph'
import DecisionFlowEditor from './DecisionFlowEditor'
import { useDecisionToast } from './useDecisionToast'
import { usePageNav } from './pageNav'
import FlowStateCell from './FlowStateCell'
import FlowActionBar from './FlowActionBar'

const MODEL_COLOR: Record<string, string> = {
  评分卡: '#22c55e',
  规则集: '#2563eb',
  决策树: '#f59e0b',
  XGBoost: '#8b5cf6',
  规则引擎: '#0ea5e9',
  名单匹配: '#ef4444',
}

const FEATURE_CAT_TAG: Record<string, string> = {
  原始: 'blue',
  外部: 'cyan',
  聚合: 'violet',
}

const FLOW_STATUS_TAG: Record<string, string> = {
  草稿: 'orange',
  已发布: 'green',
  测试中: 'blue',
}

/* ============================================================
 * 模型管理（列表）
 * ========================================================== */
export function DecisionModelManagePage() {
  const d = useDecision()
  const nav = useNavigate()
  const { goDetail } = usePageNav()
  const toast = useDecisionToast()
  const [openMore, setOpenMore] = useState<string | null>(null)

  const moreItems = ['发布新版本', '创建快照', '模型授权', '历史版本', '删除模型']

  const cols: Column[] = [
    { key: 'name', label: '模型名称', width: '18%', render: (r) => (
      <span className="font-medium text-brand-600">{r.name}</span>
    ) },
    { key: 'code', label: '模型编码', render: (r) => <code className="text-slate-500">{r.code}</code> },
    { key: 'desc', label: '描述', width: '28%', render: (r) => <span className="line-clamp-1 text-xs text-slate-500">{r.desc}</span> },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'flow', label: '流程状态', render: (r) => (
      <FlowStateCell flowId={r.flowId} state={r.flowState} onChange={(next) => {
        updateDecision((dd) => ({ ...dd, models: dd.models.map((m) => m.id === r.id ? { ...m, flowState: next } : m) }))
      }} />
    ) },
    { key: 'createdAt', label: '创建时间', width: '150px' },
  ]
  const rows: Row[] = d.models.map((m) => ({
    id: m.id, name: m.name, code: m.code, desc: m.desc, status: { v: m.status, kind: MODEL_STATUS_TAG[m.status] }, createdAt: m.createdAt,
    flowId: m.flowId, flowState: m.flowState,
  }))

  return (
    <>
      <PageShell title="模型管理" subtitle="决策模型全生命周期管理：模型上传、版本、发布与下线" crumb="决策引擎 / 决策建模 / 模型管理" actions={
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => toast.show('导入模型功能建设中，后台接入后可用')}>导入模型</Button>
          <Button onClick={() => toast.show('新建模型功能建设中，后台接入后可用')}>新建模型</Button>
        </div>
      } />
      <Panel title="模型列表" >
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10} clickableKey="name"
          onCellClick={(r) => goDetail('/console/de/model-detail?mid=' + r.id)}
          actions={(r) => (
            <div className="flex items-center gap-3 text-sm">
              <button className="text-brand-600 hover:underline" onClick={() => goDetail('/console/de/model-detail?mid=' + r.id)}>详情</button>
              <button className="text-brand-600 hover:underline" onClick={() => goDetail('/console/de/model-detail?mid=' + r.id)}>编辑</button>
              <button className="text-brand-600 hover:underline" onClick={() => nav('/console/de/model-test?mid=' + r.id)}>测试</button>
              <button className="text-slate-500 hover:underline" onClick={() => toast.show('模型已上线')}>上线</button>
              <button className="text-slate-500 hover:underline" onClick={() => toast.show('模型已下线')}>下线</button>
              <span className="relative">
                <button className="text-slate-500 hover:underline" onClick={() => setOpenMore(openMore === r.id ? null : String(r.id))}>更多 ▾</button>
                {openMore === String(r.id) && (
                  <span className="absolute right-0 z-10 mt-1 w-32 rounded-lg border border-slate-100 bg-white p-1 shadow-card">
                    {moreItems.map((it) => (
                      <button key={it} onClick={() => { setOpenMore(null); toast.show(it + '功能建设中，后台接入后可用') }} className="block w-full rounded px-2 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50">{it}</button>
                    ))}
                  </span>
                )}
              </span>
            </div>
          )}
        />
      </Panel>
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 模型详情（策略管理 / 决策流 / 关联特征 / 版本历史）
 * ========================================================== */
export function DecisionModelDetailPage({ search }: { search: string }) {
  const d = useDecision()
  const nav = useNavigate()
  const toast = useDecisionToast()
  const [sp] = useSearchParams()
  const mid = sp.get('mid') ?? new URLSearchParams(search).get('mid') ?? ''
  const model = d.models.find((m) => m.id === mid) ?? d.models[0]
  const [tab, setTab] = useState<'policy' | 'flow' | 'feature' | 'version'>('policy')

  // 策略管理
  const policyCols: Column[] = [
    { key: 'name', label: '策略名称', width: '26%', render: (r) => <span className="font-medium text-brand-600 hover:underline cursor-pointer" onClick={() => nav('/console/de/policy-edit?mid=' + model.id + '&pid=' + r.id)}>{r.name}</span> },
    { key: 'code', label: '策略编码', render: (r) => <code className="text-slate-500">{r.code}</code> },
    { key: 'type', label: '类型', render: (r) => <Badge kind="gray">{r.type}</Badge> },
    { key: 'updatedAt', label: '更新时间', width: '200px' },
  ]
  const policyRows: Row[] = model.policies.map((p) => ({ id: p.id, name: p.name, code: p.code, type: p.type, updatedAt: p.updatedAt }))

  // 决策流列表
  const flowCols: Column[] = [
    { key: 'name', label: '决策流名称', width: '20%', render: (r) => <span className="font-medium text-brand-600">{r.name}</span> },
    { key: 'code', label: '决策流编码', render: (r) => <code className="text-slate-500">{r.code}</code> },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'version', label: '版本' },
    { key: 'updatedAt', label: '更新时间', width: '200px' },
  ]
  const flowRows: Row[] = model.flows.map((f) => ({
    id: f.id, name: f.name, code: f.code, status: { v: f.status, kind: FLOW_STATUS_TAG[f.status] }, version: f.version, updatedAt: f.updatedAt,
  }))

  // 关联特征
  const featureCols: Column[] = [
    { key: 'name', label: '特征名称', width: '22%', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'code', label: '特征编码', render: (r) => <code className="text-slate-500">{r.code}</code> },
    { key: 'category', label: '类型', render: (r) => <Badge kind={FEATURE_CAT_TAG[r.category] as 'blue'}>{r.category === '原始' ? 'RAW' : r.category === '聚合' ? 'AGGREGATE' : '外部特征'}</Badge> },
    { key: 'dataType', label: '数据类型', render: (r) => <code className="text-xs text-slate-500">{r.dataType}</code> },
  ]
  const featureRows: Row[] = model.featureList.map((f, i) => ({ id: String(i), name: f.name, code: f.code, category: f.category, dataType: f.dataType }))

  // 版本历史
  const versionCols: Column[] = [
    { key: 'version', label: '版本' },
    { key: 'date', label: '日期', width: '180px' },
    { key: 'note', label: '说明', width: '50%' },
    { key: 'current', label: '当前版本', render: (r) => r.current ? <Badge kind="green">当前</Badge> : <span className="text-slate-400">历史</span> },
  ]
  const versionRows: Row[] = model.versions.map((v, i) => ({ id: String(i), version: v.version, date: v.date, note: v.note, current: v.current }))

  const tabs = [
    { key: 'policy' as const, label: '策略管理' },
    { key: 'flow' as const, label: '决策流' },
    { key: 'feature' as const, label: '关联特征' },
    { key: 'version' as const, label: '版本历史' },
  ]

  return (
    <>
      <DetailHeader
        title={model.name}
        crumb="决策引擎 / 决策建模 / 模型管理 / 模型详情"
        subtitle={String(model.headerNo ?? model.version)}
        backTo="/console/de/model-manage"
        actions={
          <>
            <Badge kind="orange">{model.approvalStatus ?? '草稿'}</Badge>
            <Button onClick={() => nav('/console/de/model-test?mid=' + model.id)}>模型测试</Button>
          </>
        }
      />
      {/* 业务流程操作条：管理中心配置了决策引擎流程才显示，未配置则不显示 */}
      <FlowActionBar
        flowId={model.flowId}
        state={model.flowState}
        onStateChange={(next) => updateDecision((dd) => ({ ...dd, models: dd.models.map((m) => m.id === model.id ? { ...m, flowState: next, flowStateAt: '2026-08-15' } : m) }))}
      />
      <div className="mt-4 flex gap-1 rounded-xl bg-slate-100 p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${tab === t.key ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500 hover:text-slate-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-4">
        {tab === 'policy' && (
          <Panel title="策略管理" actions={<Button size="sm" onClick={() => toast.show('新建策略功能建设中，后台接入后可用')}>新建策略</Button>}>
            <DataTable columns={policyCols} rows={policyRows} pager defaultPageSize={10}
              actions={(r) => (
                <div className="flex gap-3 text-sm">
                  <button className="text-brand-600 hover:underline" onClick={() => nav('/console/de/policy-edit?mid=' + model.id + '&pid=' + r.id)}>编辑</button>
                  <button className="text-rose-600 hover:underline" onClick={() => toast.show('已删除策略')}>删除</button>
                </div>
              )}
            />
          </Panel>
        )}
        {tab === 'flow' && (
          <Panel title="决策流" actions={<Button size="sm" onClick={() => nav('/console/de/flow-edit?mid=' + model.id)}>新建决策流</Button>}>
            <DataTable columns={flowCols} rows={flowRows} pager defaultPageSize={10}
              actions={(r) => (
                <div className="flex gap-3 text-sm">
                  <button className="text-brand-600 hover:underline" onClick={() => nav('/console/de/flow-edit?mid=' + model.id + '&fid=' + r.id)}>编辑</button>
                  <button className="text-cyan-600 hover:underline" onClick={() => toast.show('决策流仿真中，请稍候...')}>仿真</button>
                  <button className="text-rose-600 hover:underline" onClick={() => toast.show('已删除决策流')}>删除</button>
                </div>
              )}
            />
          </Panel>
        )}
        {tab === 'feature' && (
          <Panel
            title="关联特征"
            actions={
              <div className="flex items-center gap-3">
                <span className="text-sm text-slate-500">已关联 {model.featureList.length} 个特征</span>
                <Button size="sm" onClick={() => toast.show('添加特征功能建设中，后台接入后可用')}>添加特征</Button>
              </div>
            }
          >
            <DataTable columns={featureCols} rows={featureRows} pager defaultPageSize={10}
              actions={(r) => <button className="text-rose-600 hover:underline" onClick={() => toast.show('已移除特征')}>移除</button>}
            />
          </Panel>
        )}
        {tab === 'version' && (
          <Panel title="版本历史" actions={<Button size="sm" onClick={() => toast.show('新建版本功能建设中，后台接入后可用')}>新建版本</Button>}>
            <DataTable columns={versionCols} rows={versionRows} pager defaultPageSize={10} />
          </Panel>
        )}
      </div>
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 决策流编辑页
 * ========================================================== */
export function DecisionFlowEditPage({ search }: { search: string }) {
  const d = useDecision()
  const nav = useNavigate()
  const toast = useDecisionToast()
  const [sp] = useSearchParams()
  const mid = sp.get('mid') ?? new URLSearchParams(search).get('mid') ?? ''
  const fid = sp.get('fid') ?? ''
  const model = d.models.find((m) => m.id === mid) ?? d.models[0]
  const flow = model.flows.find((f) => f.id === fid) ?? model.flows[0]

  const handleSave = (g: DeFlowGraph) => {
    updateDecision((dd) => ({
      ...dd,
      models: dd.models.map((m) => m.id === model.id
        ? { ...m, flows: m.flows.map((f) => (f.id === flow.id ? { ...f, graph: g } : f)) }
        : m),
    }))
  }

  return (
    <>
      <DetailHeader
        title={`决策流编辑`}
        crumb="决策引擎 / 决策建模 / 模型管理 / 决策流编辑"
        backTo={`/console/de/model-detail?mid=${model.id}`}
      />
      <div className="mt-4">
        <DecisionFlowEditor
          flow={flow.graph}
          flowName={flow.name}
          policyOptions={model.policies.map((p) => ({ id: p.id, name: p.name, code: p.code, type: p.type }))}
          listOptions={d.lists.map((l) => ({ id: l.id, name: l.name, type: l.kind }))}
          onRenameFlow={(v) => updateDecision((dd) => ({ ...dd, models: dd.models.map((m) => m.id === model.id ? { ...m, flows: m.flows.map((f) => (f.id === flow.id ? { ...f, name: v } : f)) } : m) }))}
          onSave={(g) => { handleSave(g); toast.show('已保存决策流') }}
          onPublish={(g) => { handleSave(g); toast.show('决策流已发布') }}
        />
      </div>
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 模型测试页（关联特征 / 事件数据 / 执行结果）
 * ========================================================== */
export function DecisionModelTestPage({ search }: { search: string }) {
  const d = useDecision()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const mid = sp.get('mid') ?? new URLSearchParams(search).get('mid') ?? ''
  const model = d.models.find((m) => m.id === mid) ?? d.models[0]
  const [json, setJson] = useState('{\n}')
  const [executed, setExecuted] = useState(false)

  const mock = () => {
    const obj: Record<string, unknown> = {}
    model.featureList.filter((f) => f.isInput).forEach((f) => {
      obj[f.code] = f.dataType === 'NUMBER' ? 1 : f.dataType === 'BOOLEAN' ? true : '示例值'
    })
    setJson(JSON.stringify(obj, null, 2))
  }
  const format = () => {
    try { setJson(JSON.stringify(JSON.parse(json), null, 2)) } catch { /* 忽略非法 JSON */ }
  }
  const clear = () => setJson('{\n}')

  const featureCols: Column[] = [
    { key: 'code', label: '特征编码', render: (r) => <code className="text-slate-600">{r.code}</code> },
    { key: 'name', label: '特征名称', width: '18%', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'category', label: '特征类型', render: (r) => <Badge kind={FEATURE_CAT_TAG[r.category] as 'blue'}>{r.category}</Badge> },
    { key: 'dataType', label: '数据类型', render: (r) => <code className="text-xs text-slate-500">{r.dataType}</code> },
    { key: 'isInput', label: '是否输入', render: (r) => r.isInput ? <Badge kind="green">输入</Badge> : <span className="text-sm text-slate-400">自动计算</span> },
    { key: 'desc', label: '描述', width: '30%', render: (r) => <span className="text-xs text-slate-500">{r.desc}</span> },
  ]
  const featureRows: Row[] = model.featureList.map((f, i) => ({ id: String(i), code: f.code, name: f.name, category: f.category, dataType: f.dataType, isInput: f.isInput, desc: f.desc }))

  return (
    <>
      <DetailHeader
        title={`模型测试 - ${model.name}`}
        crumb="决策引擎 / 决策建模 / 模型管理 / 模型测试"
        backTo={`/console/de/model-detail?mid=${model.id}`}
      />
      <div className="mt-4 space-y-4">
        <Panel title="关联特征" actions={<span className="rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-600">{model.featureList.length} 个特征</span>}>
          <div className="mb-3 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
            标记为「输入」的特征需要提供事件数据，其他类型特征由引擎自动计算
          </div>
          <DataTable columns={featureCols} rows={featureRows} pager defaultPageSize={10} />
        </Panel>

        <Panel title="事件数据" actions={
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={mock}>MOCK 数据</Button>
            <Button size="sm" variant="ghost" onClick={format}>格式化</Button>
            <Button size="sm" variant="ghost" onClick={clear}>清 空</Button>
          </div>
        }>
          <textarea value={json} onChange={(e) => setJson(e.target.value)}
            spellCheck={false}
            className="h-56 w-full resize-y rounded-lg border border-slate-200 bg-slate-50/60 p-3 font-mono text-xs leading-relaxed text-slate-700 focus:border-brand-300 focus:outline-none" />
        </Panel>

        <Panel title="执行结果" actions={<Button onClick={() => setExecuted(true)}>执 行</Button>}>
          {!executed ? (
            <div className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-600">
              模型未发布，请先发布模型后再进行测试
            </div>
          ) : (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-600">
              执行完成：模型通过样例事件数据计算，输出决策「通过」（样例模拟，后台接入后由接口返回真实结果）
            </div>
          )}
        </Panel>
      </div>
    </>
  )
}
