// 决策引擎 · 决策建模模块页面（特征库 / 特征监控 / 名单库 / 模板市场 / 模板详情）
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDecision, LIST_KIND_TAG, type DeFeature, type DeList } from './decisionData'
import { PageShell } from './PageShell'
import { Panel, DataTable, Badge, Button, StatCard, DetailHeader, type Column, type Row } from '../components/ui'
import { Sam, Cal } from './SourceTag'
import { EditFeatureDialog, BindModelDialog, ListRecordDialog, NewListDialog } from './DecisionDialogs'
import { useDecisionToast } from './useDecisionToast'
import { usePageNav } from './pageNav'
import FlowStateCell from './FlowStateCell'
import FlowActionBar from './FlowActionBar'
import { updateDecision } from './decisionData'

/* ============================================================
 * 特征库
 * ========================================================== */
export function DecisionFeatureLibPage() {
  const d = useDecision()
  const toast = useDecisionToast()
  const [editFeat, setEditFeat] = useState<DeFeature | null>(null)
  const [bindFeat, setBindFeat] = useState<DeFeature | null>(null)

  const typeTag: Record<string, string> = { 原始: 'blue', 外部: 'cyan', 聚合: 'violet' }

  const cols: Column[] = [
    { key: 'name', label: '特征名称', width: '18%', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'code', label: '特征编码', render: (r) => <code className="text-slate-500">{r.code}</code> },
    { key: 'type', label: '特征类型', render: (r) => <Badge kind={typeTag[r.type] as 'blue'}>{r.type}</Badge> },
    { key: 'dataType', label: '数据类型', render: (r) => <code className="text-xs text-slate-500">{r.dataType}</code> },
    { key: 'version', label: '版本' },
    { key: 'status', label: '状态', render: (r) => <Badge kind={r.status === '启用' ? 'green' : r.status === '禁用' ? 'gray' : 'orange'}>{r.status}</Badge> },
    { key: 'sceneTag', label: '场景标签' },
    { key: 'linkedModels', label: '关联模型', width: '18%', render: (r) => <span className="line-clamp-1 text-xs text-slate-500">{r.linkedModels || '—'}</span> },
    { key: 'flow', label: '流程状态', render: (r) => (
      <FlowStateCell flowId={r.flowId} state={r.flowState} onChange={(next) => {
        updateDecision((dd) => ({ ...dd, features: dd.features.map((f) => f.id === r.id ? { ...f, flowState: next } : f) }))
      }} />
    ) },
    { key: 'updatedAt', label: '创建时间', width: '130px' },
  ]
  const rows: Row[] = d.features.map((f) => ({
    id: f.id, name: f.name, code: f.code, type: f.type, dataType: f.dataType, version: f.version ?? 'v1.0.0',
    status: f.status ?? '启用', sceneTag: f.sceneTag ?? '—', linkedModels: f.linkedModels, updatedAt: f.updatedAt,
    flowId: f.flowId, flowState: f.flowState,
  }))
  const featOf = (id: string) => d.features.find((f) => f.id === id) ?? null

  return (
    <>
      <PageShell title="特征库" subtitle="决策特征资产管理：特征定义、加工逻辑、口径与血缘，供规则与模型引用" crumb="决策引擎 / 决策建模 / 特征库" actions={<Button onClick={() => toast.show('新建特征功能建设中，后台接入后可用')}>新建特征</Button>} />
      <Panel title="特征列表" actions={<Sam value="features" />}>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10} clickableKey="name"
          onCellClick={(r) => setEditFeat(featOf(r.id))}
          actions={(r) => (
            <div className="flex gap-3 text-sm">
              <button className="text-brand-600 hover:underline" onClick={() => setEditFeat(featOf(r.id))}>编辑</button>
              <button className="text-brand-600 hover:underline" onClick={() => setBindFeat(featOf(r.id))}>关联模型</button>
              <button className="text-rose-600 hover:underline" onClick={() => { updateDecision((dd) => ({ ...dd, features: dd.features.filter((f) => f.id !== r.id) })); toast.show('已删除') }}>删除</button>
              <button className={r.status === '启用' ? 'text-slate-400 hover:underline' : 'text-emerald-600 hover:underline'}
                onClick={() => { updateDecision((dd) => ({ ...dd, features: dd.features.map((f) => f.id === r.id ? { ...f, status: r.status === '启用' ? '禁用' : '启用' } : f) })); toast.show(r.status === '启用' ? '已禁用' : '已启用') }}>
                {r.status === '启用' ? '禁用' : '启用'}
              </button>
            </div>
          )}
        />
      </Panel>
      <EditFeatureDialog feature={editFeat} open={!!editFeat} onClose={() => setEditFeat(null)} />
      <BindModelDialog feature={bindFeat} open={!!bindFeat} onClose={() => setBindFeat(null)} />
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 特征监控
 * ========================================================== */
export function DecisionFeatureMonitorPage() {
  const d = useDecision()
  const toast = useDecisionToast()
  const fm = d.featureMonitor
  const totalCalls = fm.reduce((a, x) => a + x.calls, 0)
  const avgMissing = (fm.reduce((a, x) => a + x.missingRate, 0) / (fm.length || 1)).toFixed(2)
  const avgEmpty = (fm.reduce((a, x) => a + x.emptyRate, 0) / (fm.length || 1)).toFixed(2)

  const cols: Column[] = [
    { key: 'code', label: '特征编码', render: (r) => <code className="text-brand-600">{r.code}</code> },
    { key: 'name', label: '名称', width: '20%' },
    { key: 'type', label: '类型' },
    { key: 'dataType', label: '数据类型' },
    { key: 'calls', label: '调用次数', type: 'number', align: 'right' },
    { key: 'missing', label: '缺失数', type: 'number', align: 'right' },
    { key: 'empty', label: '空值数', type: 'number', align: 'right' },
    { key: 'missingRate', label: '缺失率', render: (r) => <span style={{ color: Number(r.missingRate) > 10 ? '#dc2626' : '#64748b' }}>{r.missingRate}%</span> },
    { key: 'emptyRate', label: '空值率', render: (r) => <span>{r.emptyRate}%</span> },
    { key: 'op', label: '操作', render: () => <button className="text-brand-600 hover:underline" onClick={() => toast.show('特征详情功能建设中，后台接入后可用')}>查看</button> },
  ]
  const rows: Row[] = fm.map((x, i) => ({ id: String(i), ...x }))

  return (
    <>
      <PageShell title="特征监控" subtitle="特征质量与稳定性监控：覆盖率、空值率、波动与分布漂移" crumb="决策引擎 / 决策建模 / 特征监控" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="总请求数" value={totalCalls.toLocaleString()} accent="brand" />
          <StatCard label="特征总数" value={fm.length} accent="violet" />
          <StatCard label="平均缺失率" value={`${avgMissing}%`} accent="rose" />
          <StatCard label="平均空值率" value={`${avgEmpty}%`} accent="amber" />
        </div>
        <Panel title="特征质量明细" actions={
          <div className="flex items-center gap-2">
            <Sam value="featureMonitor" />
            <Button size="sm" variant="ghost" onClick={() => toast.show('已刷新')}>刷 新</Button>
          </div>
        }>
          <DataTable columns={cols} rows={rows} pager defaultPageSize={10} />
        </Panel>
      </div>
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 名单库
 * ========================================================== */
export function DecisionListLibPage() {
  const d = useDecision()
  const toast = useDecisionToast()
  const [recList, setRecList] = useState<DeList | null>(null)
  const [showNew, setShowNew] = useState(false)

  const cols: Column[] = [
    { key: 'name', label: '名单名称', width: '16%', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'code', label: '名单编码', render: (r) => <code className="text-slate-500">{r.code}</code> },
    { key: 'kind', label: '类型', type: 'badge' },
    { key: 'matchKey', label: '匹配键' },
    { key: 'matchStrategy', label: '匹配策略' },
    { key: 'source', label: '来源' },
    { key: 'flow', label: '流程状态', render: (r) => (
      <FlowStateCell flowId={r.flowId} state={r.flowState} onChange={(next) => {
        updateDecision((dd) => ({ ...dd, lists: dd.lists.map((l) => l.id === r.id ? { ...l, flowState: next } : l) }))
      }} />
    ) },
    { key: 'createdAt', label: '创建时间', width: '130px' },
  ]
  const rows: Row[] = d.lists.map((l) => ({
    id: l.id, name: l.name, code: l.code, kind: { v: l.kind, kind: LIST_KIND_TAG[l.kind] }, matchKey: l.matchKey, matchStrategy: l.matchStrategy, source: l.source, createdAt: l.createdAt,
    flowId: l.flowId, flowState: l.flowState,
  }))

  return (
    <>
      <PageShell title="名单库" subtitle="黑白灰名单管理：名单接入、版本生效、命中测试与导出" crumb="决策引擎 / 决策建模 / 名单库" actions={<Button onClick={() => setShowNew(true)}>新建名单库</Button>} />
      <Panel title="名单列表" desc="黑名单直接拒绝 / 灰名单转人工 / 白名单放行" actions={<Sam value="lists" />}>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10} clickableKey="name"
          onCellClick={(r) => setRecList(d.lists.find((l) => l.id === r.id) ?? null)}
          actions={(r) => (
            <div className="flex gap-3 text-sm">
              <button className="text-brand-600 hover:underline" onClick={() => setRecList(d.lists.find((l) => l.id === r.id) ?? null)}>管理记录</button>
              <button className="text-brand-600 hover:underline" onClick={() => toast.show('名单编辑功能建设中，后台接入后可用')}>编辑</button>
              <button className="text-rose-600 hover:underline" onClick={() => { updateDecision((dd) => ({ ...dd, lists: dd.lists.filter((l) => l.id !== r.id) })); toast.show('已删除') }}>删除</button>
            </div>
          )}
        />
      </Panel>
      <ListRecordDialog list={recList} open={!!recList} onClose={() => setRecList(null)} />
      <NewListDialog open={showNew} onClose={() => setShowNew(false)} />
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 模板市场（卡片网格）
 * ========================================================== */
export function DecisionTemplateMarketPage() {
  const d = useDecision()
  const nav = useNavigate()
  const [kw, setKw] = useState('')
  const [industry, setIndustry] = useState('')
  const [scene, setScene] = useState('')

  const industries = ['银行', '电商', '互金', '保险', '通用', '社交']
  const scenes = ['信贷反欺诈', '营销防刷', '交易风控', '核保反欺诈', '盗刷监测', '订单风控', '贷款申请', '登录验证', '注册风控', '反洗钱']
  const list = d.templates.filter((t) =>
    (!kw || t.name.includes(kw) || t.desc.includes(kw)) &&
    (!industry || t.industry === industry) &&
    (!scene || t.tags.some((x) => x === scene)),
  )

  return (
    <>
      <PageShell title="模板市场" subtitle="决策策略模板市场：行业最佳实践模板，一键引用与二次编辑" crumb="决策引擎 / 决策建模 / 模板市场" />
      <Panel title="模板市场" actions={
        <div className="flex flex-wrap items-center gap-2">
          <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="搜索模板"
            className="h-9 w-44 rounded-lg border border-slate-200 px-3 text-sm focus:border-brand-300 focus:outline-none" />
          <select value={industry} onChange={(e) => setIndustry(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2 text-sm text-slate-600 focus:outline-none">
            <option value="">全部行业</option>
            {industries.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={scene} onChange={(e) => setScene(e.target.value)}
            className="h-9 rounded-lg border border-slate-200 px-2 text-sm text-slate-600 focus:outline-none">
            <option value="">全部场景</option>
            {scenes.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      }>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
          {list.map((t) => (
            <button key={t.id} onClick={() => nav('/console/de/template-detail?id=' + t.id)}
              className="group rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-card transition hover:border-brand-300 hover:shadow-lg">
              <div className="flex items-center gap-2">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-50 text-brand-500 text-lg">▦</span>
                <span className="text-sm font-semibold text-ink-900 group-hover:text-brand-600">{t.name}</span>
              </div>
              <p className="mt-3 line-clamp-3 min-h-[60px] text-xs leading-relaxed text-slate-500">{t.desc}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span className="text-amber-500">★ {t.rating} <span className="text-slate-400">({t.ratingCount})</span></span>
                <span>使用 {t.useCount} 次</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {t.tags.map((tag) => (
                  <span key={tag} className={`rounded px-1.5 py-0.5 text-[11px] ${tag === '官方' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500'}`}>{tag}</span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </Panel>
    </>
  )
}

/* ============================================================
 * 模板详情（子页面）
 * ========================================================== */
export function DecisionTemplateDetailPage({ search }: { search: string }) {
  const d = useDecision()
  const nav = useNavigate()
  const toast = useDecisionToast()
  const [sp] = useSearchParams()
  const [innerTab, setInnerTab] = useState<'策略' | '规则' | '决策流' | '特征'>('策略')
  const [ver, setVer] = useState('v1')
  const [rate, setRate] = useState(0)
  const [comment, setComment] = useState('')
  const id = sp.get('id') ?? new URLSearchParams(search).get('id') ?? ''
  const t = d.templates.find((x) => x.id === id) ?? d.templates[0]

  // 模板编码/策略（样例，营销防刷模板）
  const code = t.code ?? 'template_' + t.id
  const strategies = t.policies ?? [
    { name: '名单匹配策略', type: '名单匹配', code: 'blacklist_match' },
    { name: '账号质量分级表', type: '决策表', code: 'account_quality' },
    { name: '设备风险评分卡', type: '评分卡', code: 'device_risk_score' },
    { name: '频率限制策略', type: '规则引擎', code: 'frequency_check' },
    { name: '优惠券滥用策略', type: '规则集', code: 'coupon_abuse' },
  ]

  const contentCols: Column[] = [
    { key: 'name', label: '策略名称', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'code', label: '策略编码', render: (r) => <code className="text-slate-500">{r.code}</code> },
    { key: 'type', label: '策略类型', render: (r) => <Badge kind="gray">{r.type}</Badge> },
  ]
  const contentRows: Row[] = strategies.map((s, i) => ({ id: String(i), name: s.name, code: s.code, type: s.type }))

  // 规则 tab
  const ruleCols: Column[] = [
    { key: 'name', label: '规则名称', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'condition', label: '条件表达式', width: '46%', render: (r) => <code className="text-xs text-brand-600">{r.condition}</code> },
    { key: 'score', label: '得分', type: 'number', align: 'right' },
    { key: 'priority', label: '优先级', type: 'number', align: 'right' },
  ]
  const ruleRows: Row[] = (t.rules ?? []).map((r, i) => ({ id: String(i), name: r.name, condition: r.condition, score: r.score, priority: r.priority }))

  // 特征 tab
  const featTypeTag: Record<string, string> = { 外部: 'cyan', 原始: 'blue', 聚合: 'purple' }
  const featCols: Column[] = [
    { key: 'name', label: '特征名称', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'code', label: '特征编码', render: (r) => <code className="text-slate-500">{r.code}</code> },
    { key: 'type', label: '类型', render: (r) => <Badge kind={featTypeTag[r.type] as 'blue'}>{r.type}</Badge> },
    { key: 'dataType', label: '数据类型', render: (r) => <code className="text-xs text-slate-500">{r.dataType}</code> },
  ]
  const featRows: Row[] = (t.features ?? []).map((f, i) => ({ id: String(i), name: f.name, code: f.code, type: f.type, dataType: f.dataType }))

  return (
    <>
      <DetailHeader
        title={
          <span className="flex flex-wrap items-center gap-2">
            {t.name}
            <Badge kind="blue">场景模板</Badge>
            <Badge kind="gray">{t.industry}</Badge>
            <Badge kind="gray">{t.scene}</Badge>
            <Badge kind="amber">官方</Badge>
            <Badge kind="green">已发布</Badge>
          </span>
        }
        crumb="决策引擎 / 决策建模 / 模板市场 / 模板详情"
        backTo="/console/de/template-market"
        actions={
          <>
            <select value={ver} onChange={(e) => setVer(e.target.value)}
              className="h-8 w-16 rounded-lg border border-slate-200 px-1 text-sm text-slate-600 focus:outline-none">
              <option value="v1">v1</option>
              <option value="v2">v2</option>
            </select>
            <Button onClick={() => toast.show('已引用模板「' + t.name + '」，可在模型管理中查看')}>使用此模板</Button>
            <Button variant="secondary" onClick={() => toast.show('已发布新版本，可在版本管理中查看')}>发布新版本</Button>
            <Button variant="secondary" onClick={() => toast.show('模板已下线')}>下 线</Button>
            <Button variant="secondary" className="text-rose-600" onClick={() => toast.show('删除功能建设中，后台接入后可用')}>删 除</Button>
          </>
        }
      />

      {/* 业务流程操作条：管理中心配置了决策引擎流程才显示，未配置则不显示 */}
      <FlowActionBar flowId={t.flowId} state={t.flowState} onStateChange={(next) => {
        updateDecision((dd) => ({ ...dd, templates: dd.templates.map((x) => x.id === t.id ? { ...x, flowState: next, flowStateAt: '2026-08-15' } : x) }))
      }} />

      <div className="mt-4 space-y-4">
        {/* 基本信息（descriptions） */}
        <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-card">
          <div className="grid grid-cols-2 gap-y-4 md:grid-cols-3">
            <Info label="模板编码" value={code} mono />
            <Info label="版本" value={ver} />
            <Info label="使用次数" value={String(t.useCount)} />
            <Info label="评分" value={<><Star color="#faaa14" /> {t.rating} <span className="text-slate-400">({t.ratingCount} 人评价)</span></>} />
            <div className="col-span-2 md:col-span-2">
              <div className="text-xs text-slate-400">描述</div>
              <div className="mt-0.5 text-sm leading-relaxed text-slate-600">{t.desc}</div>
            </div>
          </div>
        </div>

        {/* 模板内容（策略/规则/决策流/特征） */}
        <Panel title="模板内容">
          <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1">
            {(['策略', '规则', '决策流', '特征'] as const).map((k) => (
              <button key={k} onClick={() => setInnerTab(k)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${innerTab === k ? 'bg-white text-ink-900 shadow-card' : 'text-slate-500'}`}>
                {k}
              </button>
            ))}
          </div>
          {innerTab === '策略' && <DataTable columns={contentCols} rows={contentRows} pager defaultPageSize={10} />}
          {innerTab === '规则' && <DataTable columns={ruleCols} rows={ruleRows} pager defaultPageSize={10} />}
          {innerTab === '决策流' && (
            <div className="py-8 text-center">
              <div className="mx-auto mb-2 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-2xl text-slate-300">▦</div>
              <p className="text-sm text-slate-400">无决策流</p>
              <p className="mt-1 text-xs text-slate-300">该模板暂未配置决策流，使用后可在决策流管理中编排。</p>
            </div>
          )}
          {innerTab === '特征' && <DataTable columns={featCols} rows={featRows} pager defaultPageSize={10} />}
        </Panel>

        {/* 用户评价 */}
        <Panel title="用户评价">
          <div className="mb-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRate(n)}>
                  <Star color={n <= rate ? '#faaa14' : '#d9d9d9'} />
                </button>
              ))}
            </div>
            <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="写下你的评价（可选）"
              className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-brand-300 focus:outline-none" />
            <Button size="sm" className="mt-2" onClick={() => { setRate(0); setComment(''); toast.show('评价已提交') }}>提交评价</Button>
          </div>
          <div className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">
            暂无评价，成为第一个评价该模板的用户吧。
          </div>
        </Panel>
      </div>
      {toast.toastEl}
    </>
  )
}

function Star({ color }: { color: string }) {
  return <span style={{ color }} className="text-base leading-none">★</span>
}

function Info({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`mt-0.5 text-sm font-medium ${mono ? 'font-mono text-slate-600' : 'text-ink-900'}`}>{value}</div>
    </div>
  )
}
