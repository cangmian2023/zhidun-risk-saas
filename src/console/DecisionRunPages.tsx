// 决策引擎 · 运行管理 + 审批管理模块页面（版本管理 / 流量分配 / 决策回放 / 回放结果 / 批量决策 / 审批管理）
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDecision, updateDecision, TASK_STATUS_TAG, APPROVAL_STATUS_TAG, DECISION_TAG, type DeApprovalStatus } from './decisionData'
import { PageShell } from './PageShell'
import { Panel, DataTable, Badge, Button, StatCard, DetailHeader, type Column, type Row } from '../components/ui'
import { Sam, Cal } from './SourceTag'
import { CreateReplayDialog, CreateBatchDialog, SnapshotDetailDialog, ApprovalDetailDrawer } from './DecisionDialogs'
import { useDecisionToast } from './useDecisionToast'
import { usePageNav } from './pageNav'
import FlowStateCell from './FlowStateCell'
import FlowActionBar from './FlowActionBar'

const VERSION_STATUS_TAG: Record<string, string> = {
  已发布: 'green',
  草稿: 'gray',
  已回滚: 'red',
  灰度中: 'blue',
}
const TRAFFIC_STATUS_TAG: Record<string, string> = {
  生效中: 'green',
  已暂停: 'gray',
}

/* ============================================================
 * 版本管理
 * ========================================================== */
export function DecisionVersionPage() {
  const d = useDecision()
  const toast = useDecisionToast()
  const [snap, setSnap] = useState<{ target: string; version: string } | null>(null)

  const cols: Column[] = [
    { key: 'name', label: '目标名称', width: '18%', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'type', label: '类型' },
    { key: 'version', label: '版本' },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'flow', label: '流程状态', render: (r) => (
      <FlowStateCell flowId={r.flowId} state={r.flowState} onChange={(next) => {
        updateDecision((dd) => ({ ...dd, versions: dd.versions.map((v) => v.id === r.id ? { ...v, flowState: next } : v) }))
      }} />
    ) },
    { key: 'creator', label: '创建人' },
    { key: 'createdAt', label: '创建时间', width: '150px' },
  ]
  const rows: Row[] = d.versions.map((v) => ({
    id: v.id, name: v.name, type: v.type, version: v.version, status: { v: v.status, kind: VERSION_STATUS_TAG[v.status] }, creator: v.creator, createdAt: v.createdAt,
    flowId: v.flowId, flowState: v.flowState,
  }))

  return (
    <>
      <PageShell title="版本管理" subtitle="策略与模型版本管理：版本留痕、回滚与灰度上线" crumb="决策引擎 / 运行管理 / 版本管理" />
      <Panel title="版本列表" desc="模型 / 策略 / 名单的统一版本管理" actions={<Sam value="versions" />}>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10} clickableKey="name"
          onCellClick={(r) => setSnap({ target: r.name, version: r.version })}
          actions={(r) => (
            <div className="flex gap-3 text-sm">
              <button className="text-brand-600 hover:underline" onClick={() => setSnap({ target: r.name, version: r.version })}>查看</button>
              <button className="text-brand-600 hover:underline" onClick={() => toast.show('版本对比功能建设中，后台接入后可用')}>对比</button>
              <button className="text-amber-600 hover:underline" onClick={() => toast.show('已回滚到该版本')}>回滚</button>
              <button className="text-slate-500 hover:underline" onClick={() => toast.show('已创建快照')}>创建快照</button>
            </div>
          )}
        />
      </Panel>
      <SnapshotDetailDialog open={!!snap} target={snap?.target ?? ''} version={snap?.version ?? ''} onClose={() => setSnap(null)} />
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 流量分配
 * ========================================================== */
export function DecisionTrafficPage() {
  const d = useDecision()
  const toast = useDecisionToast()
  const total = d.trafficSplits.reduce((a, t) => a + t.ratio, 0)

  const cols: Column[] = [
    { key: 'name', label: '名称', width: '20%', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'model', label: '所属模型', width: '30%' },
    { key: 'type', label: '类型', render: (r) => <Badge kind="gray">{r.type}</Badge> },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'creator', label: '创建人' },
    { key: 'createdAt', label: '创建时间', width: '160px' },
  ]
  const rows: Row[] = d.trafficSplits.map((t) => ({
    id: t.id, name: t.name, model: t.model, type: '流量分流', status: { v: t.status, kind: TRAFFIC_STATUS_TAG[t.status] }, creator: '风控运营', createdAt: '2026-08-14',
  }))

  return (
    <>
      <PageShell title="流量分配" subtitle="决策流量分拨：按比例在版本/模型间分配线上流量做 A/B 与灰度" crumb="决策引擎 / 运行管理 / 流量分配" actions={<Button onClick={() => toast.show('新建分流功能建设中，后台接入后可用')}>新建分流</Button>} />
      <Panel title="流量分拨" desc={`已分配流量合计 ${total}%`} actions={<Sam value="trafficSplits" />}>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10}
          actions={(r) => (
            <div className="flex gap-3 text-sm">
              <button className="text-brand-600 hover:underline" onClick={() => toast.show('编辑分流功能建设中，后台接入后可用')}>编辑</button>
              <button className="text-brand-600 hover:underline" onClick={() => toast.show('流量配置功能建设中，后台接入后可用')}>配置</button>
              <button className={r.status === '生效中' ? 'text-slate-400 hover:underline' : 'text-emerald-600 hover:underline'}
                onClick={() => toast.show(r.status === '生效中' ? '已暂停流量分配' : '已启用流量分配')}>{r.status === '生效中' ? '暂停' : '启用'}</button>
            </div>
          )}
        />
      </Panel>
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 决策回放
 * ========================================================== */
export function DecisionReplayPage() {
  const d = useDecision()
  const nav = useNavigate()
  const { goDetail } = usePageNav()
  const toast = useDecisionToast()
  const [showCreate, setShowCreate] = useState(false)

  const cols: Column[] = [
    { key: 'name', label: '任务名称', width: '18%' },
    { key: 'model', label: '模型', render: (r) => <code className="text-slate-600">{r.model}</code> },
    { key: 'targetVersion', label: '目标版本' },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'progress', label: '进度', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${r.progress}%` }} />
        </div>
        <span className="text-xs text-slate-500">{r.progress}%</span>
      </div>
    ) },
    { key: 'cnt', label: '总数/完成', render: (r) => `${r.total}/${r.done}` },
    { key: 'flow', label: '流程状态', render: (r) => (
      <FlowStateCell flowId={r.flowId} state={r.flowState} onChange={(next) => {
        updateDecision((dd) => ({ ...dd, replays: dd.replays.map((x) => x.id === r.id ? { ...x, flowState: next } : x) }))
      }} />
    ) },
    { key: 'creator', label: '创建人' },
    { key: 'createdAt', label: '创建时间', width: '150px' },
  ]
  const rows: Row[] = d.replays.map((r) => ({
    id: r.id, name: r.name, model: r.model, targetVersion: r.targetVersion || '—', status: { v: r.status, kind: TASK_STATUS_TAG[r.status] }, progress: r.progress, total: r.total, done: r.done, creator: r.creator, createdAt: r.createdAt,
    flowId: r.flowId, flowState: r.flowState,
  }))

  return (
    <>
      <PageShell title="决策回放" subtitle="批量回放历史决策，对比新旧版本差异" crumb="决策引擎 / 运行管理 / 决策回放" actions={<Button onClick={() => setShowCreate(true)}>创建回放任务</Button>} />
      <Panel title="回放任务" actions={<Sam value="replays" />}>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10} clickableKey="name"
          onCellClick={(r) => goDetail('/console/de/replay-result?rid=' + r.id)}
          actions={(r) => (
            <button className="text-brand-600 hover:underline" onClick={() => goDetail('/console/de/replay-result?rid=' + r.id)}>查看结果</button>
          )}
        />
      </Panel>
      <CreateReplayDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => {
          updateDecision((dd) => ({
            ...dd,
            replays: [...dd.replays, {
              id: `RP${Date.now().toString(36)}`,
              name: data.name || `回放任务${dd.replays.length + 1}`,
              model: data.model,
              targetVersion: data.targetVer,
              status: '执行中',
              progress: 0,
              total: 1000,
              done: 0,
              creator: 'admin',
              createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              flowId: '',
              flowState: '未配置',
            }],
          }))
          toast.show('回放任务已创建')
        }}
      />
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 回放结果（子页面）
 * ========================================================== */
export function DecisionReplayResultPage({ search }: { search: string }) {
  const d = useDecision()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const rid = sp.get('rid') ?? new URLSearchParams(search).get('rid') ?? ''
  const task = d.replays.find((r) => r.id === rid)
  const [filter, setFilter] = useState<'all' | 1 | 0>('all')

  const rows0 = d.replayResults
  const rows = filter === 'all' ? rows0 : rows0.filter((r) => r.changed === filter)

  const cols: Column[] = [
    { key: 'requestId', label: '请求ID', render: (r) => <code className="text-brand-600">{r.requestId}</code> },
    { key: 'oldDecision', label: '旧决策', type: 'badge' },
    { key: 'oldScore', label: '旧评分', type: 'number', align: 'right' },
    { key: 'newDecision', label: '新决策', type: 'badge' },
    { key: 'newScore', label: '新评分', type: 'number', align: 'right' },
    { key: 'changed', label: '差异', render: (r) => r.changed === 1 ? <Badge kind="red">有变化</Badge> : <Badge kind="gray">无变化</Badge> },
    { key: 'scoreDiff', label: '评分差异', type: 'number', align: 'right' },
    { key: 'costMs', label: '耗时(ms)', type: 'number', align: 'right' },
  ]
  const dataRows: Row[] = rows.map((r, i) => ({
    id: String(i), requestId: r.requestId, oldDecision: { v: r.oldDecision, kind: DECISION_TAG[r.oldDecision] }, oldScore: r.oldScore,
    newDecision: { v: r.newDecision, kind: DECISION_TAG[r.newDecision] }, newScore: r.newScore, changed: r.changed, scoreDiff: r.scoreDiff, costMs: r.costMs,
  }))

  const changedCnt = rows0.filter((r) => r.changed === 1).length
  const unchangedCnt = rows0.length - changedCnt

  return (
    <>
      <DetailHeader
        title={`回放结果 - ${task?.name ?? ''}`}
        crumb="决策引擎 / 运行管理 / 决策回放 / 回放结果"
        backTo="/console/de/decision-replay"
        subtitle={task ? `${task.model} · 目标版本 ${task.targetVersion || '线上'}` : '未找到回放任务'}
      />

      {/* 业务流程操作条：管理中心配置了决策引擎流程才显示，未配置则不显示 */}
      {task && (
        <FlowActionBar flowId={task.flowId} state={task.flowState} onStateChange={(next) => {
          updateDecision((dd) => ({ ...dd, replays: dd.replays.map((x) => x.id === task.id ? { ...x, flowState: next, flowStateAt: '2026-08-15' } : x) }))
        }} />
      )}

      {/* 回放统计概览 */}
      <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="总样本数" value={rows0.length} accent="brand" extra={<Cal value="replayResults" />} />
        <StatCard label="有变化" value={changedCnt} accent="rose" extra={<Cal value="replayResults" />} />
        <StatCard label="无变化" value={unchangedCnt} accent="emerald" extra={<Cal value="replayResults" />} />
        <StatCard label="变化率" value={`${changedCnt && rows0.length ? ((changedCnt / rows0.length) * 100).toFixed(1) : '0.0'}%`} accent="amber" extra={<Cal value="replayResults" />} />
      </div>

      {/* 回放任务信息 */}
      <Panel title="回放任务信息" className="mt-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-4">
          <DetailInfo label="任务名称" value={task?.name ?? '—'} />
          <DetailInfo label="模型" value={task?.model ?? '—'} />
          <DetailInfo label="目标版本" value={task?.targetVersion || '线上'} />
          <DetailInfo label="数据源类型" value="历史决策日志" />
          <DetailInfo label="创建人" value={task?.creator ?? '—'} />
          <DetailInfo label="创建时间" value={task?.createdAt ?? '—'} />
          <DetailInfo label="状态" value={task?.status ?? '—'} />
          <DetailInfo label="进度" value={task ? `${task.done}/${task.total}` : '—'} />
        </div>
      </Panel>

      {/* 新旧决策对比（变更矩阵，从 replayResults 真实计算） */}
      <Panel title="新旧决策对比" className="mt-4" actions={<Cal value="replayResults" />} desc="统计旧版本 → 新版本的决策结果变化流向">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <div className="mb-2 text-xs font-medium text-slate-400">决策变化矩阵</div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs text-slate-400">
                  <th className="py-2 pr-2">旧 \ 新</th>
                  <th className="py-2 pr-2">通过</th>
                  <th className="py-2 pr-2">拒绝</th>
                  <th className="py-2">人工复核</th>
                </tr>
              </thead>
              <tbody className="text-slate-600">
                {(['通过', '拒绝', '人工复核'] as const).map((old) => {
                  const newCols = ['通过', '拒绝', '人工复核'] as const
                  const row = newCols.map((nw) => rows0.filter((r) => r.oldDecision === old && r.newDecision === nw).length)
                  return (
                    <tr key={old} className="border-b border-slate-50">
                      <td className="py-2 pr-2 font-medium">{old}</td>
                      {row.map((v, i) => (
                        <td key={i} className="py-2 pr-2">
                          {v > 0 ? <Badge kind={newCols[i] === old ? 'green' : 'red'}>{v}</Badge> : <span className="text-slate-300">0</span>}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium text-slate-400">重点变化</div>
            <div className="space-y-2">
              {rows0.filter((r) => r.changed === 1).slice(0, 4).map((r) => (
                <div key={r.requestId} className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  <span className="font-medium">{r.requestId}</span>：旧「{r.oldDecision}」→ 新「{r.newDecision}」，评分 {r.oldScore} → {r.newScore}（差异 {r.scoreDiff}）
                </div>
              ))}
              {changedCnt === 0 && <div className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-400">本回放无决策变化</div>}
            </div>
          </div>
        </div>
      </Panel>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {(['all', 1, 0] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm transition ${filter === f ? 'bg-brand-600 text-white' : 'bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-700'}`}>
            {f === 'all' ? `全部 (${rows0.length})` : f === 1 ? `有变化 (${changedCnt})` : `无变化 (${unchangedCnt})`}
          </button>
        ))}
      </div>
      <Panel title="回放结果明细" className="mt-4" actions={<Sam value="replayResults" />}>
        <DataTable columns={cols} rows={dataRows} pager defaultPageSize={10} />
      </Panel>
    </>
  )
}

/* ============================================================
 * 批量决策
 * ========================================================== */
export function DecisionBatchPage() {
  const d = useDecision()
  const toast = useDecisionToast()
  const { goDetail } = usePageNav()
  const [showCreate, setShowCreate] = useState(false)

  const cols: Column[] = [
    { key: 'name', label: '任务名称', width: '20%' },
    { key: 'model', label: '模型', render: (r) => <code className="text-slate-600">{r.model}</code> },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'progress', label: '进度', render: (r) => (
      <div className="flex items-center gap-2">
        <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${r.progress}%` }} />
        </div>
        <span className="text-xs text-slate-500">{r.progress}%</span>
      </div>
    ) },
    { key: 'cnt', label: '完成/总数', render: (r) => `${r.done}/${r.total}` },
    { key: 'resultDist', label: '结果分布', width: '22%' },
    { key: 'flow', label: '流程状态', render: (r) => (
      <FlowStateCell flowId={r.flowId} state={r.flowState} onChange={(next) => {
        updateDecision((dd) => ({ ...dd, batchTasks: dd.batchTasks.map((b) => b.id === r.id ? { ...b, flowState: next } : b) }))
      }} />
    ) },
    { key: 'creator', label: '创建人' },
    { key: 'createdAt', label: '创建时间', width: '150px' },
  ]
  const rows: Row[] = d.batchTasks.map((b) => ({
    id: b.id, name: b.name, model: b.model, status: { v: b.status, kind: TASK_STATUS_TAG[b.status] }, progress: b.progress, done: b.done, total: b.total, resultDist: b.resultDist, creator: b.creator, createdAt: b.createdAt,
    flowId: b.flowId, flowState: b.flowState,
  }))

  return (
    <>
      <PageShell title="批量决策" subtitle="上传 CSV 批量执行决策，下载结果" crumb="决策引擎 / 运行管理 / 批量决策" actions={<Button onClick={() => setShowCreate(true)}>创建批量任务</Button>} />
      <Panel title="批量任务" actions={<Sam value="batchTasks" />}>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10} clickableKey="name"
          onCellClick={(r) => goDetail('/console/de/batch-detail?id=' + r.id)}
          actions={(r) => (
            <div className="flex gap-3 text-sm">
              <button className="text-brand-600 hover:underline" onClick={() => goDetail('/console/de/batch-detail?id=' + r.id)}>查看结果</button>
              <button className="text-slate-500 hover:underline" onClick={() => toast.show('已开始下载结果')}>下载结果</button>
              <button className="text-rose-600 hover:underline" onClick={() => { updateDecision((dd) => ({ ...dd, batchTasks: dd.batchTasks.map((b) => b.id === r.id ? { ...b, status: '失败' } : b) })); toast.show('已取消该任务') }}>取消任务</button>
            </div>
          )}
        />
      </Panel>
      <CreateBatchDialog
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={(data) => {
          updateDecision((dd) => ({
            ...dd,
            batchTasks: [...dd.batchTasks, {
              id: `BT${Date.now().toString(36)}`,
              name: data.name || `批量任务${dd.batchTasks.length + 1}`,
              model: data.model,
              status: '执行中',
              progress: 0,
              done: 0,
              total: 1000,
              resultDist: '通过 0% / 拒绝 0%',
              creator: 'admin',
              createdAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
              flowId: '',
              flowState: '未配置',
            }],
          }))
          toast.show('批量任务已创建')
        }}
      />
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 审批管理
 * ========================================================== */
export function DecisionApprovalPage() {
  const d = useDecision()
  const toast = useDecisionToast()
  const { goDetail } = usePageNav()
  const [tab, setTab] = useState<'pending' | 'all'>('pending')

  const list = tab === 'pending' ? d.approvals.filter((a) => a.status === '待审批') : d.approvals

  const cols: Column[] = [
    { key: 'target', label: '目标名称', width: '18%', render: (r) => <span className="font-medium text-brand-600">{r.target}</span> },
    { key: 'targetType', label: '目标类型', type: 'badge' },
    { key: 'action', label: '操作', render: (r) => <Badge kind="green">{r.action}</Badge> },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'flow', label: '流程状态', render: (r) => (
      <FlowStateCell flowId={r.flowId} state={r.flowState} onChange={(next) => {
        updateDecision((dd) => ({ ...dd, approvals: dd.approvals.map((a) => a.id === r.id ? { ...a, flowState: next, status: next as DeApprovalStatus } : a) }))
      }} />
    ) },
    { key: 'applicant', label: '申请人' },
    { key: 'approver', label: '审批人' },
    { key: 'applyTime', label: '申请时间', width: '150px' },
  ]
  const rows: Row[] = list.map((a) => ({
    id: a.id, target: a.target, targetType: { v: a.targetType, kind: a.targetType === '模型' ? 'blue' : a.targetType === '名单' ? 'violet' : a.targetType === '策略' ? 'cyan' : 'amber' },
    action: a.action, status: { v: a.status, kind: APPROVAL_STATUS_TAG[a.status] }, applicant: a.applicant, approver: a.approver || '—', applyTime: a.applyTime,
    flowId: a.flowId, flowState: a.flowState,
  }))

  const pending = d.approvals.filter((a) => a.status === '待审批').length
  const monthTotal = d.approvals.length

  return (
    <>
      <PageShell title="审批管理" subtitle="策略与模型上线审批流：提交、审核、发布与操作留痕" crumb="决策引擎 / 审批管理 / 审批管理" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="待审批" value={pending} hint="件" accent="rose" extra={<Cal value="approvals" />} />
          <StatCard label="本月通过率" value={`${monthTotal ? ((d.approvals.filter((a) => a.status === '已通过').length / monthTotal) * 100).toFixed(1) : '0'}%`} accent="emerald" extra={<Cal value="approvals" />} />
          <StatCard label="平均审批时长" value="6.5" hint="小时（样例）" accent="brand" extra={<Cal value="approvals" />} />
          <StatCard label="本月总量" value={monthTotal} accent="violet" extra={<Cal value="approvals" />} />
        </div>
        <Panel title="审批管理" actions={
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            <button onClick={() => setTab('pending')} className={`rounded-md px-3 py-1.5 text-sm transition ${tab === 'pending' ? 'bg-white font-medium text-ink-900 shadow-card' : 'text-slate-500'}`}>待审批</button>
            <button onClick={() => setTab('all')} className={`rounded-md px-3 py-1.5 text-sm transition ${tab === 'all' ? 'bg-white font-medium text-ink-900 shadow-card' : 'text-slate-500'}`}>全部记录</button>
          </div>
        }>
          <DataTable columns={cols} rows={rows} pager defaultPageSize={10} clickableKey="target"
            onCellClick={(r) => goDetail('/console/de/approval-detail?id=' + r.id)}
            actions={(r) => (
              <div className="flex gap-3 text-sm">
                <button className="text-brand-600 hover:underline" onClick={() => goDetail('/console/de/approval-detail?id=' + r.id)}>详情</button>
                <button className="text-slate-500 hover:underline" onClick={() => toast.show('转交功能建设中，后台接入后可用')}>转交</button>
                <button className="text-amber-600 hover:underline" onClick={() => toast.show('已发送催办提醒')}>催办</button>
              </div>
            )}
          />
        </Panel>
      </div>
      {toast.toastEl}
    </>
  )
}

/* ============================================================
 * 审批详情页（列表 → 详情 → 返回 + 业务流程关联）
 * ========================================================== */
export function DecisionApprovalDetailPage({ search }: { search: string }) {
  const d = useDecision()
  const { back } = usePageNav()
  const [sp] = useSearchParams()
  const id = sp.get('id') ?? new URLSearchParams(search).get('id') ?? ''
  const a = d.approvals.find((x) => x.id === id)

  if (!a) {
    return (
      <>
        <DetailHeader title="审批详情" crumb="决策引擎 / 审批管理 / 审批详情" backLabel="返回列表" onBack={() => back('/console/de/approval-manage')} />
        <div className="mt-6 rounded-xl border border-slate-100 p-6 text-sm text-slate-400">未找到该审批，请返回列表。</div>
      </>
    )
  }

  const updateFlowState = (next: string) => {
    updateDecision((dd) => ({ ...dd, approvals: dd.approvals.map((x) => x.id === a.id ? { ...x, flowState: next, flowStateAt: '2026-08-15', status: next as DeApprovalStatus } : x) }))
  }

  return (
    <>
      <DetailHeader
        title="审批详情"
        crumb="决策引擎 / 审批管理 / 审批详情"
        backLabel="返回列表"
        onBack={() => back('/console/de/approval-manage')}
        subtitle={`${a.target} · ${a.action}`}
        actions={<Badge kind={APPROVAL_STATUS_TAG[a.status]}>{a.status}</Badge>}
      />

      {/* 业务流程操作条：管理中心配置了决策引擎流程才显示，未配置则不显示 */}
      <FlowActionBar
        flowId={a.flowId}
        state={a.flowState}
        onStateChange={updateFlowState}
      />

      <div className="mt-4 space-y-4">
        <Panel title="审批信息">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
            <InfoRow label="目标名称" value={a.target} />
            <InfoRow label="目标类型" value={a.targetType} />
            <InfoRow label="操作类型" value={a.action} />
            <InfoRow label="审批状态" value={a.status} />
            <InfoRow label="申请人" value={a.applicant} />
            <InfoRow label="审批人" value={a.approver || '—'} />
            <InfoRow label="申请时间" value={a.applyTime} />
            <InfoRow label="流程状态" value={a.flowState ?? '—'} />
            <InfoRow label="流程状态时间" value={a.flowStateAt ?? '—'} />
          </div>
        </Panel>

        <Panel title="审批记录">
          <div className="space-y-0">
            <TraceItem time={a.applyTime} title={`${a.applicant} 提交${a.action}申请`} actor={a.applicant} active />
            <TraceItem time={a.flowStateAt ?? '—'} title={a.status === '待审批' ? '等待审批中...' : `${a.approver || '审批人'} ${a.status}`} actor={a.approver} last />
          </div>
        </Panel>
      </div>
    </>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-ink-900">{value}</div>
    </div>
  )
}

function TraceItem({ time, title, actor, active, last }: { time: string; title: string; actor?: string; active?: boolean; last?: boolean }) {
  return (
    <div className="relative flex gap-3 pb-6">
      {!last && <span className="absolute left-[7px] top-4 h-full w-px bg-slate-200" />}
      <span className={`relative z-10 mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full ${active ? 'bg-brand-500' : 'bg-slate-300'}`}>
        <span className="h-1.5 w-1.5 rounded-full bg-white" />
      </span>
      <div>
        <div className="text-sm font-medium text-ink-900">{title}</div>
        {actor && <div className="text-xs text-slate-500">{actor}</div>}
        <div className="text-xs text-slate-400">{time}</div>
      </div>
    </div>
  )
}

function DetailInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-ink-900">{value}</div>
    </div>
  )
}

/* ============================================================
 * 批量任务详情页（列表 → 详情 → 返回 + 业务流程关联）
 * ========================================================== */
export function DecisionBatchDetailPage({ search }: { search: string }) {
  const d = useDecision()
  const { back } = usePageNav()
  const [sp] = useSearchParams()
  const id = sp.get('id') ?? new URLSearchParams(search).get('id') ?? ''
  const b = d.batchTasks.find((x) => x.id === id)

  if (!b) {
    return (
      <>
        <DetailHeader title="批量任务详情" crumb="决策引擎 / 运行管理 / 批量决策 / 详情" backLabel="返回列表" onBack={() => back('/console/de/batch-decision')} />
        <div className="mt-6 rounded-xl border border-slate-100 p-6 text-sm text-slate-400">未找到该任务，请返回列表。</div>
      </>
    )
  }

  const updateFlowState = (next: string) => {
    updateDecision((dd) => ({ ...dd, batchTasks: dd.batchTasks.map((x) => x.id === b.id ? { ...x, flowState: next, flowStateAt: '2026-08-15' } : x) }))
  }

  const info: [string, string][] = [
    ['任务名称', b.name],
    ['模型', b.model],
    ['状态', b.status],
    ['进度', `${b.progress}%`],
    ['完成/总数', `${b.done}/${b.total}`],
    ['结果分布', b.resultDist],
    ['创建人', b.creator],
    ['创建时间', b.createdAt],
  ]

  return (
    <>
      <DetailHeader
        title="批量任务详情"
        crumb="决策引擎 / 运行管理 / 批量决策 / 详情"
        backLabel="返回列表"
        onBack={() => back('/console/de/batch-decision')}
        subtitle={`${b.name} · ${b.status}`}
        actions={<Badge kind={TASK_STATUS_TAG[b.status]}>{b.status}</Badge>}
      />

      {/* 业务流程操作条：管理中心配置了决策引擎流程才显示，未配置则不显示 */}
      <FlowActionBar flowId={b.flowId} state={b.flowState} onStateChange={updateFlowState} />

      <div className="mt-4 space-y-4">
        <Panel title="任务信息">
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
            {info.map(([k, v]) => (
              <div key={k}>
                <div className="text-xs text-slate-400">{k}</div>
                <div className="mt-0.5 text-sm font-medium text-ink-900">{v}</div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="任务进度">
          <div className="flex items-center gap-3">
            <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-500" style={{ width: `${b.progress}%` }} />
            </div>
            <span className="text-sm font-medium tabular-nums">{b.progress}%</span>
            <span className="text-xs text-slate-400">{b.done}/{b.total}</span>
          </div>
        </Panel>

        <Panel title="执行记录">
          <div className="space-y-0">
            <TraceItem time={b.createdAt} title={`${b.creator} 创建批量决策任务`} actor={b.creator} active />
            <TraceItem time={b.flowStateAt ?? '—'} title={b.status === '已完成' ? '批量决策执行完成' : `${b.status}中...`} last />
          </div>
        </Panel>
      </div>
    </>
  )
}
