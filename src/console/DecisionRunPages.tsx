// 决策引擎 · 运行管理 + 审批管理模块页面（版本管理 / 流量分配 / 决策回放 / 回放结果 / 批量决策 / 审批管理）
import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDecision, TASK_STATUS_TAG, APPROVAL_STATUS_TAG, DECISION_TAG } from './decisionData'
import { PageShell } from './PageShell'
import { Panel, DataTable, Badge, Button, StatCard, DetailHeader, type Column, type Row } from '../components/ui'
import { Sam, Cal } from './SourceTag'
import { CreateReplayDialog, CreateBatchDialog, SnapshotDetailDialog, ApproveDialog, ApprovalDetailDrawer } from './DecisionDialogs'
import { useDecisionToast } from './useDecisionToast'

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
    { key: 'name', label: '目标名称', width: '22%', render: (r) => <span className="font-medium text-ink-900">{r.name}</span> },
    { key: 'type', label: '类型' },
    { key: 'version', label: '版本' },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'creator', label: '创建人' },
    { key: 'createdAt', label: '创建时间', width: '170px' },
  ]
  const rows: Row[] = d.versions.map((v) => ({
    id: v.id, name: v.name, type: v.type, version: v.version, status: { v: v.status, kind: VERSION_STATUS_TAG[v.status] }, creator: v.creator, createdAt: v.createdAt,
  }))

  return (
    <>
      <PageShell title="版本管理" subtitle="策略与模型版本管理：版本留痕、回滚与灰度上线" crumb="决策引擎 / 运行管理 / 版本管理" />
      <Panel title="版本列表" desc="模型 / 策略 / 名单的统一版本管理" actions={<Sam value="versions" />}>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10}
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
    { key: 'creator', label: '创建人' },
    { key: 'createdAt', label: '创建时间', width: '160px' },
  ]
  const rows: Row[] = d.replays.map((r) => ({
    id: r.id, name: r.name, model: r.model, targetVersion: r.targetVersion || '—', status: { v: r.status, kind: TASK_STATUS_TAG[r.status] }, progress: r.progress, total: r.total, done: r.done, creator: r.creator, createdAt: r.createdAt,
  }))

  return (
    <>
      <PageShell title="决策回放" subtitle="批量回放历史决策，对比新旧版本差异" crumb="决策引擎 / 运行管理 / 决策回放" actions={<Button onClick={() => setShowCreate(true)}>创建回放任务</Button>} />
      <Panel title="回放任务" actions={<Sam value="replays" />}>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10}
          actions={(r) => (
            <button className="text-brand-600 hover:underline" onClick={() => nav('/console/de/replay-result?rid=' + r.id)}>查看结果</button>
          )}
        />
      </Panel>
      <CreateReplayDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={() => {}} />
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
    { key: 'resultDist', label: '结果分布', width: '26%' },
    { key: 'creator', label: '创建人' },
    { key: 'createdAt', label: '创建时间', width: '150px' },
  ]
  const rows: Row[] = d.batchTasks.map((b) => ({
    id: b.id, name: b.name, model: b.model, status: { v: b.status, kind: TASK_STATUS_TAG[b.status] }, progress: b.progress, done: b.done, total: b.total, resultDist: b.resultDist, creator: b.creator, createdAt: b.createdAt,
  }))

  return (
    <>
      <PageShell title="批量决策" subtitle="上传 CSV 批量执行决策，下载结果" crumb="决策引擎 / 运行管理 / 批量决策" actions={<Button onClick={() => setShowCreate(true)}>创建批量任务</Button>} />
      <Panel title="批量任务" actions={<Sam value="batchTasks" />}>
        <DataTable columns={cols} rows={rows} pager defaultPageSize={10}
          actions={(r) => (
            <div className="flex gap-3 text-sm">
              <button className="text-brand-600 hover:underline" onClick={() => toast.show('批量任务详情功能建设中，后台接入后可用')}>查看结果</button>
              <button className="text-slate-500 hover:underline" onClick={() => toast.show('已开始下载结果')}>下载结果</button>
              <button className="text-rose-600 hover:underline" onClick={() => toast.show('已取消该任务')}>取消任务</button>
            </div>
          )}
        />
      </Panel>
      <CreateBatchDialog open={showCreate} onClose={() => setShowCreate(false)} onCreate={() => {}} />
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
  const [tab, setTab] = useState<'pending' | 'all'>('pending')
  const [detailId, setDetailId] = useState<string | null>(null)
  const [approveId, setApproveId] = useState<string | null>(null)

  const list = tab === 'pending' ? d.approvals.filter((a) => a.status === '待审批') : d.approvals

  const cols: Column[] = [
    { key: 'target', label: '目标名称', width: '20%', render: (r) => <span className="font-medium text-brand-600">{r.target}</span> },
    { key: 'targetType', label: '目标类型', type: 'badge' },
    { key: 'action', label: '操作', render: (r) => <Badge kind="green">{r.action}</Badge> },
    { key: 'status', label: '状态', type: 'badge' },
    { key: 'applicant', label: '申请人' },
    { key: 'approver', label: '审批人' },
    { key: 'applyTime', label: '申请时间', width: '160px' },
  ]
  const rows: Row[] = list.map((a) => ({
    id: a.id, target: a.target, targetType: { v: a.targetType, kind: a.targetType === '模型' ? 'blue' : a.targetType === '名单' ? 'violet' : a.targetType === '策略' ? 'cyan' : 'amber' },
    action: a.action, status: { v: a.status, kind: APPROVAL_STATUS_TAG[a.status] }, applicant: a.applicant, approver: a.approver || '—', applyTime: a.applyTime,
  }))

  const pending = d.approvals.filter((a) => a.status === '待审批').length
  const monthTotal = d.approvals.length

  return (
    <>
      <PageShell title="审批管理" subtitle="策略与模型上线审批流：提交、审核、发布与操作留痕" crumb="决策引擎 / 审批管理 / 审批管理" />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="待审批" value={pending} hint="件" accent="rose" />
          <StatCard label="本月通过率" value="75.0%" accent="emerald" />
          <StatCard label="平均审批时长" value="6.5" hint="小时" accent="brand" />
          <StatCard label="本月总量" value={monthTotal} accent="violet" />
        </div>
        <Panel title="审批管理" actions={
          <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
            <button onClick={() => setTab('pending')} className={`rounded-md px-3 py-1.5 text-sm transition ${tab === 'pending' ? 'bg-white font-medium text-ink-900 shadow-card' : 'text-slate-500'}`}>待审批</button>
            <button onClick={() => setTab('all')} className={`rounded-md px-3 py-1.5 text-sm transition ${tab === 'all' ? 'bg-white font-medium text-ink-900 shadow-card' : 'text-slate-500'}`}>全部记录</button>
          </div>
        }>
          <DataTable columns={cols} rows={rows} pager defaultPageSize={10}
            actions={(r) => (
              <div className="flex gap-3 text-sm">
                <button className="text-brand-600 hover:underline" onClick={() => setDetailId(r.id)}>详情</button>
                <button className="text-slate-500 hover:underline" onClick={() => toast.show('转交功能建设中，后台接入后可用')}>转交</button>
                <button className="text-emerald-600 hover:underline" onClick={() => setApproveId(r.id)}>通过</button>
                <button className="text-rose-600 hover:underline" onClick={() => toast.show('已驳回')}>驳回</button>
                <button className="text-amber-600 hover:underline" onClick={() => toast.show('已发送催办提醒')}>催办</button>
              </div>
            )}
          />
        </Panel>
      </div>
      <ApprovalDetailDrawer
        open={!!detailId}
        onClose={() => setDetailId(null)}
        approval={(() => { const a = d.approvals.find((x) => x.id === detailId); return a ? { target: a.target, targetType: a.targetType, action: a.action, status: a.status, applicant: a.applicant } : null })()}
      />
      <ApproveDialog open={!!approveId} onClose={() => setApproveId(null)} approval={(() => { const a = d.approvals.find((x) => x.id === approveId); return a ? { target: a.target } : null })()} />
      {toast.toastEl}
    </>
  )
}
