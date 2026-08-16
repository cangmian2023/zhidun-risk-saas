// 决策引擎 · 工作台 + 监控分析模块页面（工作台 / 监控大盘 / 告警管理 / 决策分析 / 规则命中 / 决策日志）
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDecision, updateDecision, ALERT_LEVEL_TAG, ALERT_STATUS_TAG, DECISION_TAG, type DeAlertRule, type DeNotifyChannel } from './decisionData'
import { useAuth } from '../auth/AuthContext'
import { PageShell } from './PageShell'
import { Panel, StatCard, DataTable, Badge, Button, DetailHeader, SingleSelect, type Column, type Row } from '../components/ui'
import { LineChart, DonutChart, BarChart } from '../components/charts'
import { Sam, Cal } from './SourceTag'
import { AlertRuleDialog, NotifyChannelDialog } from './DecisionDialogs'
import { useDecisionToast } from './useDecisionToast'
import { usePageNav } from './pageNav'
import FlowStateCell from './FlowStateCell'
import FlowActionBar from './FlowActionBar'

const DOT = { 稳定: '#22c55e', 注意: '#f59e0b', 异常: '#ef4444' } as const

/* ============================================================
 * 工作台
 * ========================================================== */
export function DecisionWorkbenchPage() {
  const d = useDecision()
  const nav = useNavigate()
  const toast = useDecisionToast()
  const { user } = useAuth()
  const w = d.workbench
  const today = new Date().toISOString().slice(0, 10)

  const alertCols: Column[] = [
    { key: 'level', label: '严重程度', type: 'badge' },
    { key: 'title', label: '告警', width: '40%', render: (r) => <span className="font-medium text-ink-900">{r.title}</span> },
    { key: 'source', label: '来源' },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'createdAt', label: '时间', width: '160px' },
    { key: 'op', label: '操作', render: (r) => <button className="text-brand-600 hover:underline" onClick={() => nav(`/console/de/alert-detail?id=${r.id}`)}>查看</button> },
  ]
  const alertRows: Row[] = w.recentAlerts.map((a) => ({
    id: a.id, level: { v: a.level, kind: ALERT_LEVEL_TAG[a.level] }, title: a.title, source: a.source,
    status: { v: a.status, kind: ALERT_STATUS_TAG[a.status] }, createdAt: a.createdAt,
  }))

  const modelCols: Column[] = [
    { key: 'name', label: '模型名称', width: '26%', render: (r) => <span className="font-medium text-brand-600">{r.name}</span> },
    { key: 'code', label: '模型编码', render: (r) => <code className="text-slate-500">{r.code}</code> },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'updatedAt', label: '更新时间', width: '170px' },
    { key: 'op', label: '操作', render: (r) => <button className="text-brand-600 hover:underline" onClick={() => nav(`/console/de/model-detail?mid=${r.id}`)}>查看</button> },
  ]
  const modelRows: Row[] = w.recentModels.map((m) => ({
    id: m.id, name: m.name, code: m.code, status: { v: m.status, kind: m.status === '已上线' ? 'green' : m.status === '草稿' ? 'orange' : 'gray' }, updatedAt: m.updatedAt,
  }))

  return (
    <>
      <PageShell title="决策引擎工作台" subtitle="决策引擎概览：在策决策、运行状态、调用量与近况一览，规则与模型双引擎统一入口" crumb="决策引擎 / 工作台" />
      <div className="mb-4 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm text-brand-700">
        晚上好，<span className="font-medium">{user?.name || '管理员'}</span>！今天是 {today}，祝你工作顺利。
      </div>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="今日决策量" value={w.todayCalls.toLocaleString()} hint="次" accent="brand" />
          <StatCard label="通过率" value={`${w.todayPassRate}%`} hint="较昨日 +1.2pp" accent="emerald" />
          <StatCard label="拒绝率" value={`${w.todayRejectRate}%`} hint="名单命中占比 42%" accent="rose" />
          <StatCard label="平均耗时" value={`${w.avgCostMs}ms`} hint="P95 86ms" accent="cyan" />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Panel
              title="最近告警"
              actions={<Button size="sm" variant="ghost" onClick={() => nav('/console/de/alert-manage')}>查看全部</Button>}
            >
              <DataTable columns={alertCols} rows={alertRows} pager />
            </Panel>
            <Panel
              title="最近模型"
              actions={<Button size="sm" variant="ghost" onClick={() => nav('/console/de/model-manage')}>模型管理</Button>}
            >
              <DataTable columns={modelCols} rows={modelRows} pager />
            </Panel>
          </div>
          <div className="space-y-4">
            <Panel title="快捷操作">
              <div className="grid grid-cols-2 gap-3">
                {w.quickActions.map((q) => (
                  <button key={q.key} onClick={() => nav(`/console/de/${q.key}`)}
                    className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 text-left transition hover:border-brand-300 hover:bg-white">
                    <div className="text-sm font-medium text-ink-900">{q.label}</div>
                    <div className="mt-1 text-xs text-slate-400">{q.desc}</div>
                  </button>
                ))}
              </div>
            </Panel>
            <Panel title="运行概况">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-slate-500">在策模型</span><span className="font-semibold text-ink-900">{w.runningModels} 个</span></div>
                <div className="flex justify-between"><span className="text-slate-500">活跃特征</span><span className="font-semibold text-ink-900">268 个</span></div>
                <div className="flex justify-between"><span className="text-slate-500">待审批</span><span className="font-semibold text-ink-900">{w.pendingApproval} 件</span></div>
                <div className="flex justify-between"><span className="text-slate-500">待处理告警</span><span className="font-semibold text-ink-900">{w.activeAlerts} 条</span></div>
              </div>
            </Panel>
          </div>
        </div>

        <Panel title="数据说明" actions={<Sam value="decisionData.json" />}>
          <p className="text-sm text-slate-500">
            决策引擎为「规则 + 模型」双引擎统一平台。工作台数据来自本地样例 <code className="text-brand-600">decisionData.json</code>（模拟金融风控平台），
            后台按此契约实现接口后由后台更新该文件，前端只读渲染。
          </p>
        </Panel>
      </div>
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 监控大盘
 * ========================================================== */
export function DecisionMonitorPage() {
  const d = useDecision()
  const nav = useNavigate()
  const m = d.monitor
  const [dash, setDash] = useState('默认决策监控')

  /* 仪表盘 → 模型 code 映射（切换时按模型过滤统计卡） */
  const dashModel: Record<string, string | null> = { '默认决策监控': null, '电商薅羊毛监控': 'ecommerce_hair', '注册风控监控': 'register_test' }
  const curHealth = dashModel[dash] ? m.modelHealth.find((h) => h.model === dashModel[dash]) : null

  return (
    <>
      <PageShell title="监控大盘" subtitle="决策运行监控大盘：调用量、耗时、拦截率与趋势总览" crumb="决策引擎 / 监控分析 / 监控大盘" />
      <Panel title="仪表盘"
        actions={
          <div className="flex items-center gap-2">
            <SingleSelect label="选择大盘" value={dash} onChange={setDash}
              options={['默认决策监控', '电商薅羊毛监控', '注册风控监控'].map((x) => ({ value: x, label: x }))} />
            <Button size="sm" variant="ghost" onClick={() => nav('/console/de/model-manage')}>管理模型</Button>
          </div>
        }>
        <div className="mb-3 rounded-lg bg-sky-50 px-3 py-2 text-xs text-sky-700">
          当前仪表盘：{dash} · 实时指标监控{curHealth ? `（${curHealth.model} · 状态 ${curHealth.status}）` : ''}（数据源 <code className="text-brand-600">decisionData.json → monitor</code>）
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="总请求数" value={(curHealth ? curHealth.calls : m.todayCalls).toLocaleString()} accent="brand" extra={<Cal value="monitor" />} />
          <StatCard label="通过率" value={`${curHealth ? +(100 - curHealth.errorRate * 100 - 18).toFixed(1) : m.todayPassRate}%`} accent="emerald" extra={<Cal value="monitor" />} />
          <StatCard label="拒绝率" value={`${curHealth ? +(curHealth.errorRate * 100 + 18).toFixed(1) : m.todayRejectRate}%`} accent="rose" extra={<Cal value="monitor" />} />
          <StatCard label="平均延迟" value={`${curHealth ? curHealth.avgCost : m.avgCostMs}ms`} accent="cyan" extra={<Cal value="monitor" />} />
        </div>
      </Panel>

      <Panel title="请求趋势" actions={<Sam value="monitor.callTrend" />}>
        <LineChart
          labels={m.callTrend.map((t) => t.date)}
          series={[
            { name: '总请求', color: '#2563eb', data: m.callTrend.map((t) => t.calls) },
            { name: '通过', color: '#22c55e', data: m.callTrend.map((t) => t.pass) },
            { name: '拒绝', color: '#ef4444', data: m.callTrend.map((t) => t.reject) },
          ]}
          height={260}
        />
      </Panel>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Panel title="结果分布" actions={<Sam value="monitor.decisionDist" />}>
          <DonutChart
            data={m.decisionDist.map((x) => ({ label: x.label, value: x.value, color: x.label === '通过' ? '#22c55e' : x.label === '拒绝' ? '#ef4444' : '#f59e0b' }))}
            centerLabel="决策结果"
          />
        </Panel>
        <Panel title="延迟分布" actions={<Sam value="monitor.blockDist" />}>
          <DonutChart
            data={m.blockDist.map((x, i) => ({ label: x.label, value: x.value, color: ['#6366f1', '#f59e0b', '#22c55e', '#0ea5e9'][i % 4] }))}
            centerLabel="延迟占比"
          />
        </Panel>
      </div>
    </>
  )
}

/* ============================================================
 * 告警管理（告警记录 / 告警规则 / 通知渠道）
 * ========================================================== */
export function DecisionAlertPage() {
  const d = useDecision()
  const toast = useDecisionToast()
  const { goDetail } = usePageNav()
  const [editRule, setEditRule] = useState<string | null>(null)
  const [editChannel, setEditChannel] = useState<string | null>(null)
  const [showRule, setShowRule] = useState(false)
  const [showChannel, setShowChannel] = useState(false)

  const alertCols: Column[] = [
    { key: 'level', label: '严重程度', type: 'badge' },
    { key: 'title', label: '告警标题', width: '34%', render: (r) => <span className="font-medium text-ink-900">{r.title}</span> },
    { key: 'source', label: '触发源' },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'createdAt', label: '时间', width: '160px' },
    { key: 'op', label: '操作', render: (r) => <button className="text-brand-600 hover:underline" onClick={() => goDetail('/console/de/alert-detail?id=' + r.id)}>查看</button> },
  ]
  const alertRows: Row[] = d.alerts.map((a) => ({
    id: a.id, level: { v: a.level, kind: ALERT_LEVEL_TAG[a.level] }, title: a.title, source: a.source,
    status: { v: a.status, kind: ALERT_STATUS_TAG[a.status] }, createdAt: a.createdAt,
    flowId: a.flowId, flowState: a.flowState,
  }))

  const ruleCols: Column[] = [
    { key: 'name', label: '规则名称', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'metricType', label: '指标类型' },
    { key: 'condition', label: '条件', width: '60px' },
    { key: 'threshold', label: '阈值', type: 'number', align: 'right' },
    { key: 'level', label: '严重程度', type: 'badge' },
    { key: 'enabled', label: '状态', render: (r) => <Badge kind={r.enabled ? 'green' : 'red'}>{r.enabled ? '启用' : '禁用'}</Badge> },
  ]
  const ruleRows: Row[] = d.alertRules.map((r) => ({
    id: r.id, name: r.name, metricType: r.metricType ?? r.metric, condition: r.condition, threshold: r.threshold,
    level: { v: r.level, kind: r.level === '紧急' ? 'red' : r.level === '重要' ? 'orange' : 'blue' }, enabled: r.enabled,
  }))

  const channelCols: Column[] = [
    { key: 'name', label: '渠道名称', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'type', label: '类型', render: (r) => <Badge kind="gray">{r.type}</Badge> },
  ]
  const channelRows: Row[] = d.notifyChannels.map((c) => ({
    id: c.id, name: c.name, type: c.type,
  }))

  return (
    <>
      <PageShell title="告警管理" subtitle="决策链路告警管理：阈值告警规则配置与告警消息处理" crumb="决策引擎 / 监控分析 / 告警管理" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="待处理" value={String(d.alerts.filter((a) => a.status === '待处理').length)} accent="rose" extra={<Cal value="alerts" />} />
          <StatCard label="处理中" value={String(d.alerts.filter((a) => a.status === '处理中').length)} accent="amber" extra={<Cal value="alerts" />} />
          <StatCard label="今日告警" value={String(d.alerts.filter((a) => a.createdAt.includes('2026-08-14')).length)} accent="brand" extra={<Cal value="alerts" />} />
          <StatCard label="已启用规则" value={String(d.alertRules.filter((r) => r.enabled).length)} accent="emerald" extra={<Cal value="alertRules" />} />
        </div>

        <Panel title="告警记录" actions={<Sam value="alerts" />}>
          <DataTable columns={alertCols} rows={alertRows} pager defaultPageSize={10} clickableKey="title"
            onCellClick={(r) => goDetail('/console/de/alert-detail?id=' + r.id)} />
        </Panel>
        <Panel title="告警规则" actions={<div className="flex items-center gap-2"><Sam value="alertRules" /><Button size="sm" onClick={() => setShowRule(true)}>新 建</Button></div>}>
          <DataTable columns={ruleCols} rows={ruleRows} pager defaultPageSize={10}
            actions={(r) => (
              <div className="flex items-center gap-3 text-sm">
                <button className="text-brand-600 hover:underline" onClick={() => setEditRule(r.id)}>编 辑</button>
                <button className={r.enabled ? 'text-amber-600 hover:underline' : 'text-emerald-600 hover:underline'}
                  onClick={() => updateDecision((dd) => ({ ...dd, alertRules: dd.alertRules.map((x) => x.id === r.id ? { ...x, enabled: !x.enabled } : x) }))}>{r.enabled ? '禁 用' : '启 用'}</button>
                <button className="text-slate-500 hover:underline" onClick={() => toast.show('规则测试中，请稍候...')}>测 试</button>
                <button className="text-rose-600 hover:underline" onClick={() => updateDecision((dd) => ({ ...dd, alertRules: dd.alertRules.filter((x) => x.id !== r.id) }))}>删 除</button>
              </div>
            )}
          />
        </Panel>
        <Panel title="通知渠道" actions={<div className="flex items-center gap-2"><Sam value="notifyChannels" /><Button size="sm" onClick={() => setShowChannel(true)}>新 建</Button></div>}>
          <DataTable columns={channelCols} rows={channelRows} pager defaultPageSize={10}
            actions={(r) => (
              <div className="flex items-center gap-3 text-sm">
                <button className="text-brand-600 hover:underline" onClick={() => setEditChannel(r.id)}>编 辑</button>
                <button className="text-slate-500 hover:underline" onClick={() => toast.show('通知渠道测试中，请稍候...')}>测 试</button>
                <button className="text-rose-600 hover:underline" onClick={() => updateDecision((dd) => ({ ...dd, notifyChannels: dd.notifyChannels.filter((x) => x.id !== r.id) }))}>删 除</button>
              </div>
            )}
          />
        </Panel>
      </div>
      <AlertRuleDialog
        rule={d.alertRules.find((x) => x.id === editRule) ?? null}
        open={!!editRule || showRule}
        onClose={() => { setEditRule(null); setShowRule(false) }}
        onConfirm={(data) => {
          const existing = d.alertRules.find((x) => x.id === data.id)
          const next = {
            id: data.id,
            name: data.name,
            metricType: data.metricType,
            metric: data.metricType,
            condition: data.condition,
            threshold: data.threshold,
            level: data.level as DeAlertRule['level'],
            enabled: existing?.enabled ?? true,
          }
          updateDecision((dd) => ({
            ...dd,
            alertRules: existing ? dd.alertRules.map((r) => (r.id === data.id ? { ...r, ...next } : r)) : [...dd.alertRules, next],
          }))
          toast.show(existing ? '告警规则已更新' : '告警规则已创建')
        }}
      />
      <NotifyChannelDialog
        channel={d.notifyChannels.find((x) => x.id === editChannel) ?? null}
        open={!!editChannel || showChannel}
        onClose={() => { setEditChannel(null); setShowChannel(false) }}
        onConfirm={(data) => {
          const existing = d.notifyChannels.find((x) => x.id === data.id)
          const next: DeNotifyChannel = { id: data.id, name: data.name, type: data.type, target: data.target || '运营群', level: existing?.level ?? '提示', enabled: existing?.enabled ?? true }
          updateDecision((dd) => ({
            ...dd,
            notifyChannels: existing ? dd.notifyChannels.map((c) => (c.id === data.id ? { ...c, ...next } : c)) : [...dd.notifyChannels, next],
          }))
          toast.show(existing ? '通知渠道已更新' : '通知渠道已创建')
        }}
      />
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 决策分析
 * ========================================================== */
export function DecisionAnalysisPage() {
  const d = useDecision()
  const m = d.monitor
  const nav = useNavigate()
  const [modelFilter, setModelFilter] = useState('全部模型')
  const [start, setStart] = useState('2026-08-13')
  const [end, setEnd] = useState('2026-08-14')

  /* 按模型统计：从 monitor.modelHealth 派生真实 per-model 数据，模型中文名取 models 定义 */
  const statCols: Column[] = [
    { key: 'name', label: '模型名称', render: (r) => <span className="font-medium text-brand-600">{r.name}</span> },
    { key: 'calls', label: '决策数', type: 'number', align: 'right' },
    { key: 'passRate', label: '通过率', render: (r) => `${r.passRate}%` },
    { key: 'rejectRate', label: '拒绝率', render: (r) => `${r.rejectRate}%` },
    { key: 'cost', label: '平均耗时(ms)', type: 'number', align: 'right' },
    { key: 'status', label: '健康度', type: 'badge' },
    { key: 'op', label: '操作', render: (r) => <button className="text-brand-600 hover:underline" onClick={() => nav(`/console/de/model-detail?mid=${r.mid}`)}>详情</button> },
  ]
  const allStatRows: Row[] = d.monitor.modelHealth.map((h, i) => {
    const model = d.models.find((x) => x.code === h.model)
    return {
      id: h.model + i,
      mid: model?.id ?? '',
      name: model?.name ?? h.model,
      calls: h.calls,
      passRate: +(100 - (h.errorRate || 0) - 18).toFixed(1),
      rejectRate: +((h.errorRate || 0) + 18).toFixed(1),
      cost: h.avgCost,
      status: { v: h.status, kind: h.status === '稳定' ? 'success' : h.status === '注意' ? 'warning' : 'danger' },
    }
  })
  const statRows = modelFilter === '全部模型' ? allStatRows : allStatRows.filter((r) => d.models.find((x) => x.id === r.mid)?.code === modelFilter)

  return (
    <>
      <PageShell title="决策分析" subtitle="运营数据统计与趋势" crumb="决策引擎 / 监控分析 / 决策分析"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <input value={start} onChange={(e) => setStart(e.target.value)} className="h-8 w-40 rounded-lg border border-slate-200 px-2 text-sm text-slate-600 focus:outline-none" />
            <span className="text-slate-400">~</span>
            <input value={end} onChange={(e) => setEnd(e.target.value)} className="h-8 w-40 rounded-lg border border-slate-200 px-2 text-sm text-slate-600 focus:outline-none" />
            <SingleSelect label="全部模型" clearable value={modelFilter} onChange={setModelFilter}
              options={[{ value: '全部模型', label: '全部模型' }, ...d.models.map((x) => ({ value: x.code, label: x.name }))]} />
          </div>
        }
      />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="总决策数" value={m.todayCalls.toLocaleString()} accent="brand" extra={<Cal value="monitor" />} />
          <StatCard label="通过率" value={`${m.todayPassRate}%`} accent="emerald" extra={<Cal value="monitor" />} />
          <StatCard label="拒绝率" value={`${m.todayRejectRate}%`} accent="rose" extra={<Cal value="monitor" />} />
          <StatCard label="平均耗时" value={`${m.avgCostMs}`} hint="ms" accent="cyan" extra={<Cal value="monitor" />} />
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="决策趋势" actions={<Cal value="callTrend" />}>
            <LineChart
              labels={m.callTrend.map((t) => t.date)}
              series={[
                { name: '总决策数', color: '#2563eb', data: m.callTrend.map((t) => t.calls) },
                { name: '通过', color: '#22c55e', data: m.callTrend.map((t) => t.pass) },
                { name: '拒绝', color: '#ef4444', data: m.callTrend.map((t) => t.reject) },
              ]}
              height={260}
            />
          </Panel>
          <Panel title="Top 命中策略" actions={<Cal value="topRules" />}>
            <BarChart
              labels={m.topRules.map((r) => r.rule)}
              series={[{ name: '命中次数', color: '#8b5cf6', data: m.topRules.map((r) => r.hits) }]}
              height={260}
            />
          </Panel>
        </div>

        <Panel title="按模型统计" actions={<Cal value="modelHealth" />}>
          <DataTable columns={statCols} rows={statRows} pager defaultPageSize={10} />
        </Panel>
      </div>
    </>
  )
}

/* ============================================================
 * 规则命中
 * ========================================================== */
export function DecisionRuleHitPage() {
  const d = useDecision()
  const r = d.ruleHit
  const [modelFilter, setModelFilter] = useState('全部模型')

  const policyName = (code: string) => {
    for (const m of d.models) { const p = m.policies.find((x) => x.code === code); if (p) return p.name }
    return code
  }

  const detailCols: Column[] = [
    { key: 'rule', label: '规则名称', render: (x) => <span className="font-medium text-ink-900">{x.rule}</span> },
    { key: 'code', label: '模型编码', render: (x) => <code className="text-brand-600">{x.code}</code> },
    { key: 'policyName', label: '策略名称' },
    { key: 'hits', label: '命中次数', type: 'number', align: 'right' },
    { key: 'rate', label: '命中率', render: (x) => `${x.rate}%` },
    { key: 'statDate', label: '统计日期', width: '130px', render: () => '2026-08-14' },
  ]
  const allDetailRows: Row[] = r.hitDetail.map((x, i) => ({ id: String(i), rule: x.rule, code: x.code, policyName: policyName(x.code), hits: x.hits, rate: x.rate }))
  const detailRows = modelFilter === '全部模型' ? allDetailRows : allDetailRows.filter((x) => x.code === modelFilter)

  return (
    <>
      <PageShell title="规则命中" subtitle="规则命中分析：命中 TOP 规则、命中分布与规则贡献" crumb="决策引擎 / 监控分析 / 规则命中" />
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Panel title="近 7 日命中趋势" actions={<Sam value="ruleHit.hitTrend" />}>
            <LineChart labels={r.hitTrend.map((t) => t.date)} series={[{ name: '命中数', color: '#ef4444', data: r.hitTrend.map((t) => t.hits) }]} height={230} />
          </Panel>
          <Panel title="命中类型分布" actions={<Sam value="ruleHit.ruleDist" />}>
            <DonutChart data={r.ruleDist.map((x, i) => ({ label: x.type, value: x.value, color: ['#6366f1', '#f59e0b', '#22c55e', '#0ea5e9'][i % 4] }))} centerLabel="命中占比" />
          </Panel>
        </div>

        <Panel title="TOP 命中规则">
          <div className="space-y-2.5">
            {r.topRules.map((x, i) => (
              <div key={x.rule} className="flex items-center gap-3 text-sm">
                <span className="w-5 text-xs text-slate-400">{i + 1}</span>
                <span className="w-44 truncate text-slate-600">{x.rule}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full bg-rose-500" style={{ width: `${(x.hits / r.topRules[0].hits) * 100}%` }} />
                </div>
                <span className="w-16 text-right font-medium tabular-nums text-ink-900">{x.hits}</span>
                <span className="w-12 text-right text-xs text-slate-400">{x.rate}%</span>
              </div>
            ))}
          </div>
        </Panel>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="总决策数" value={d.monitor.todayCalls.toLocaleString()} accent="brand" extra={<Cal value="monitor" />} />
          <StatCard label="命中次数" value={r.hitDetail.reduce((a, x) => a + x.hits, 0).toLocaleString()} accent="rose" extra={<Cal value="hitDetail" />} />
          <StatCard label="总命中率" value={`${r.hitDetail.reduce((a, x) => a + x.rate, 0).toFixed(1)}%`} accent="amber" extra={<Cal value="hitDetail" />} />
          <StatCard label="启用规则" value={String(r.hitDetail.filter((x) => x.status === '启用').length)} accent="emerald" extra={<Cal value="hitDetail" />} />
        </div>

        <Panel title="规则命中明细" actions={<Sam value="ruleHit.hitDetail" />}>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <SingleSelect label="全部模型" clearable value={modelFilter} onChange={setModelFilter}
              options={[{ value: '全部模型', label: '全部模型' }, ...d.models.map((m) => ({ value: m.code, label: m.name }))]} />
          </div>
          <DataTable columns={detailCols} rows={detailRows} pager defaultPageSize={10} />
        </Panel>
      </div>
    </>
  )
}

/* ============================================================
 * 决策日志
 * ========================================================== */
export function DecisionLogPage() {
  const d = useDecision()
  const toast = useDecisionToast()
  const { goDetail } = usePageNav()
  const [result, setResult] = useState('全部')
  const [modelFilter, setModelFilter] = useState('全部模型')
  const [range, setRange] = useState('')

  const modelName = (code: string) => d.models.find((m) => m.code === code)?.name ?? code

  const cols: Column[] = [
    { key: 'requestId', label: '请求ID', render: (r) => <code className="text-brand-600">{r.requestId}</code> },
    { key: 'modelName', label: '模型名称', render: (r) => <span className="font-medium text-ink-900">{r.modelName}</span> },
    { key: 'model', label: '模型编码', render: (r) => <code className="text-slate-500">{r.model}</code> },
    { key: 'score', label: '总分', type: 'number', align: 'right' },
    { key: 'costMs', label: '耗时(ms)', type: 'number', align: 'right' },
    { key: 'decision', label: '决策结果', type: 'badge' },
    { key: 'flow', label: '流程状态', render: (r) => (
      <FlowStateCell flowId={r.flowId} state={r.flowState} onChange={(next) => {
        updateDecision((dd) => ({ ...dd, decisionLogs: dd.decisionLogs.map((x) => x.id === r.id ? { ...x, flowState: next } : x) }))
      }} />
    ) },
    { key: 'time', label: '创建时间', width: '170px' },
    { key: 'op', label: '操作', render: (r) => <button className="text-brand-600 hover:underline" onClick={() => goDetail('/console/de/log-detail?id=' + r.id)}>查看</button> },
  ]
  const rows: Row[] = d.decisionLogs.filter((x) =>
    (result === '全部' || x.decision === result) &&
    (modelFilter === '全部模型' || x.model === modelFilter) &&
    (!range || x.time.includes(range)),
  ).map((x) => ({
    id: x.id, requestId: x.requestId, modelName: modelName(x.model), model: x.model, score: x.score,
    costMs: x.costMs, decision: { v: x.decision, kind: DECISION_TAG[x.decision] }, time: x.time,
    flowId: x.flowId, flowState: x.flowState,
  }))

  return (
    <>
      <PageShell title="决策日志" subtitle="全量决策日志明细：入参、特征、规则/模型结果与最终结论" crumb="决策引擎 / 监控分析 / 决策日志" />
      <Panel title="决策日志" actions={<Sam value="decisionLogs" />}>
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <SingleSelect label="全部结果" clearable value={result} onChange={setResult}
            options={[{ value: '全部', label: '全部' }, { value: '通过', label: '通过' }, { value: '拒绝', label: '拒绝' }, { value: '人工复核', label: '人工复核' }]} />
          <SingleSelect label="全部模型" clearable value={modelFilter} onChange={setModelFilter}
            options={[{ value: '全部模型', label: '全部模型' }, ...d.models.map((m) => ({ value: m.code, label: m.name }))]} />
          <input value={range} onChange={(e) => setRange(e.target.value)} placeholder="时间范围" className="h-8 w-36 rounded-lg border border-slate-200 px-2 text-sm focus:outline-none" />
          <Button size="sm">查 询</Button>
          <Button size="sm" variant="ghost" onClick={() => { setResult('全部'); setModelFilter('全部模型'); setRange('') }}>重 置</Button>
        </div>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={20} clickableKey="requestId"
          onCellClick={(r) => goDetail('/console/de/log-detail?id=' + r.id)} />
      </Panel>
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 决策日志详情页（列表 → 详情 → 返回 + 业务流程关联）
 * ========================================================== */
export function DecisionLogDetailPage({ search }: { search: string }) {
  const d = useDecision()
  const { back } = usePageNav()
  const [sp] = useSearchParams()
  const id = sp.get('id') ?? new URLSearchParams(search).get('id') ?? ''
  const x = d.decisionLogs.find((l) => l.id === id)
  const modelName = (code: string) => d.models.find((m) => m.code === code)?.name ?? code

  if (!x) {
    return (
      <>
        <DetailHeader title="决策日志详情" crumb="决策引擎 / 监控分析 / 决策日志 / 详情" backLabel="返回列表" onBack={() => back('/console/de/decision-log')} />
        <div className="mt-6 rounded-xl border border-slate-100 p-6 text-sm text-slate-400">未找到该日志，请返回列表。</div>
      </>
    )
  }

  const updateFlowState = (next: string) => {
    updateDecision((dd) => ({ ...dd, decisionLogs: dd.decisionLogs.map((l) => l.id === x.id ? { ...l, flowState: next, flowStateAt: '2026-08-15' } : l) }))
  }

  const info: [string, string][] = [
    ['请求 ID', x.requestId],
    ['模型名称', modelName(x.model)],
    ['模型编码', x.model],
    ['决策结果', x.decision],
    ['总分', String(x.score)],
    ['耗时(ms)', String(x.costMs)],
    ['渠道', x.channel],
    ['客户', `${x.custName} (${x.custId})`],
    ['命中依据', x.source],
    ['创建时间', x.time],
  ]

  return (
    <>
      <DetailHeader
        title="决策日志详情"
        crumb="决策引擎 / 监控分析 / 决策日志 / 详情"
        backLabel="返回列表"
        onBack={() => back('/console/de/decision-log')}
        subtitle={`${modelName(x.model)} · ${x.requestId}`}
        actions={<Badge kind={DECISION_TAG[x.decision]}>{x.decision}</Badge>}
      />

      {/* 业务流程操作条：管理中心配置了决策引擎流程才显示，未配置则不显示 */}
      <FlowActionBar flowId={x.flowId} state={x.flowState} onStateChange={updateFlowState} />

      <div className="mt-4 space-y-4">
        <Panel title="日志信息">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
            {info.map(([k, v]) => (
              <div key={k}>
                <div className="text-xs text-slate-400">{k}</div>
                <div className="mt-0.5 text-sm font-medium text-ink-900">{v}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="原始入参与命中详情" desc="入参特征、规则/模型结果与最终结论（样例示意，后台接入后由接口返回）">
          <div className="rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-400">
            该日志的完整入参特征、特征计算、规则命中明细与决策轨迹在此展示（后台接入后填充）。
          </div>
        </Panel>
      </div>
    </>
  )
}

/* ============================================================
 * 告警详情页（列表 → 详情 → 返回 + 业务流程关联）
 * ========================================================== */
export function DecisionAlertDetailPage({ search }: { search: string }) {
  const d = useDecision()
  const { back } = usePageNav()
  const [sp] = useSearchParams()
  const id = sp.get('id') ?? new URLSearchParams(search).get('id') ?? ''
  const a = d.alerts.find((x) => x.id === id)

  if (!a) {
    return (
      <>
        <DetailHeader title="告警详情" crumb="决策引擎 / 监控分析 / 告警管理 / 详情" backLabel="返回列表" onBack={() => back('/console/de/alert-manage')} />
        <div className="mt-6 rounded-xl border border-slate-100 p-6 text-sm text-slate-400">未找到该告警，请返回列表。</div>
      </>
    )
  }

  const updateFlowState = (next: string) => {
    updateDecision((dd) => ({ ...dd, alerts: dd.alerts.map((x) => x.id === a.id ? { ...x, flowState: next, flowStateAt: '2026-08-15' } : x) }))
  }

  const info: [string, string][] = [
    ['告警标题', a.title],
    ['严重程度', a.level],
    ['状态', a.status],
    ['触发源', a.source],
    ['处理人', a.handler || '—'],
    ['触发时间', a.createdAt],
  ]

  return (
    <>
      <DetailHeader
        title="告警详情"
        crumb="决策引擎 / 监控分析 / 告警管理 / 详情"
        backLabel="返回列表"
        onBack={() => back('/console/de/alert-manage')}
        subtitle={a.title}
        actions={<Badge kind={ALERT_LEVEL_TAG[a.level]}>{a.level}</Badge>}
      />

      {/* 业务流程操作条：管理中心配置了决策引擎流程才显示，未配置则不显示 */}
      <FlowActionBar flowId={a.flowId} state={a.flowState} onStateChange={updateFlowState} />

      <div className="mt-4 space-y-4">
        <Panel title="告警信息">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
            {info.map(([k, v]) => (
              <div key={k}>
                <div className="text-xs text-slate-400">{k}</div>
                <div className="mt-0.5 text-sm font-medium text-ink-900">{v}</div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="mb-1 text-xs text-slate-400">告警描述</div>
            <p className="text-sm leading-relaxed text-slate-600">{a.desc}</p>
          </div>
        </Panel>

        <Panel title="处置记录">
          <div className="space-y-0">
            <TraceLine time={a.createdAt} title={`触发告警：${a.source}`} active />
            <TraceLine time={a.flowStateAt ?? '—'} title={a.status === '待处理' ? '等待处理中...' : `已${a.status}`} last />
          </div>
        </Panel>
      </div>
    </>
  )
}

function TraceLine({ time, title, active, last }: { time: string; title: string; active?: boolean; last?: boolean }) {
  return (
    <div className="relative flex gap-3 pb-6">
      {!last && <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />}
      <span className={`relative z-10 mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full ${active ? 'bg-brand-500' : 'bg-slate-300'}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      <div>
        <div className="text-sm font-medium text-ink-900">{title}</div>
        <div className="text-xs text-slate-400">{time}</div>
      </div>
    </div>
  )
}
