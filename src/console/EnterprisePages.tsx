/* 企业风控子系统 · 业务页面（使用域）
 * 模块：一键查询 / 风险画像 / 批量尽调 / 监控名单 / 决策事件 / 复核工单 / 模型列表 / 名单管理 / 数据源 / 预警规则 / 预警处置
 * 数据来源：enterpriseData.json（橘 Sam）｜实时统计（灰 Cal）
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable, Button, Badge, Modal } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam, Cal, Cfg } from './SourceTag';
import { PageShell } from './PageShell';
import { LineChart } from '../components/charts';
import { useEnterpriseData, updateEnterpriseData } from './enterpriseData';
import { QiyeSearch, QiyeProfile, qiyeSelectedKeyNo, qiyeSelectedName } from './QiyePages';
// 统一流程绑定层（与贷中预警工作台/贷前四页同一套）：列表显示「时限倒计时 + 流程状态」列，状态流转写回 enterpriseData.json
import FlowStateCell from './FlowStateCell';
import { useMinuteTick, renderCountdown, matchObjOf, flowIdOfRow, nowStamp, usePageFlow } from './flowBinding';

const CRUMB = '企业风控';
const ENT_KIND: Record<string, 'red' | 'amber' | 'blue' | 'green' | 'gray'> = {
  高: 'red', 中: 'amber', 低: 'green',
};
const LIST_KIND: Record<string, 'red' | 'green' | 'gray'> = {
  black: 'red', white: 'green', gray: 'gray',
};
const LIST_LABEL: Record<string, string> = { black: '黑名单', white: '白名单', gray: '灰名单' };
const DS_KIND: Record<string, 'green' | 'gray' | 'amber'> = {
  已接入: 'green', 未接入: 'gray', 测试中: 'amber',
};
const ALERT_KIND: Record<string, 'red' | 'amber' | 'green'> = {
  RED: 'red', YELLOW: 'amber', OPPORTUNITY: 'green',
};
const ORDER_KIND: Record<string, 'red' | 'amber' | 'blue' | 'green' | 'gray'> = {
  待复核: 'red', 复核中: 'amber', 已复核: 'green', 已驳回: 'gray',
};

/* ============ 企业一键风险查询 ============ */
export function EntQuickSearch() {
  return <QiyeSearch />;
}

/* ============ 企业风险画像详情（企业档案检索的次级页面，点击「查看档案」进入） ============ */
export function EntRiskProfile() {
  // 直接呈现完整企业档案（工商/司法/经营/舆情/关联全维度画像），
  // 作为「企业一键风险查询 → 查看档案」的次级详情页；不含独立菜单入口。
  return <QiyeProfile />;
}

/* ============ 批量尽调任务 ============ */
export function EntBatchDue() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', source: '上传名单' });
  const openTask = (id: string) => nav(`/console/ep/batch-due-detail?taskId=${encodeURIComponent(id)}`);
  const rows: Row[] = ent.dueTasks.map((t) => ({
    id: t.id, id2: t.id, name: t.name, count: String(t.count), source: t.source,
    status: { v: t.status, kind: t.status === '已完成' ? 'green' : t.status === '失败' ? 'red' : t.status === '进行中' ? 'amber' : 'gray' },
    progress: `${t.progress}%`, hitRisk: String(t.hitRisk), startedAt: t.startedAt, createdBy: t.createdBy,
  }));
  const cols: Column[] = [
    { key: 'id2', label: '任务号', type: 'text', width: '120px', fixed: 'left' },
    { key: 'name', label: '任务名称', type: 'text', width: '220px' },
    { key: 'count', label: '企业数', type: 'text', width: '90px' },
    { key: 'source', label: '来源', type: 'text', width: '110px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '100px' },
    { key: 'progress', label: '进度', type: 'text', width: '90px' },
    { key: 'hitRisk', label: '命中风险', type: 'text', width: '100px' },
    { key: 'startedAt', label: '开始时间', type: 'text', width: '150px' },
    { key: 'createdBy', label: '创建人', type: 'text', width: '100px' },
  ];
  const doCreate = () => {
    if (!draft.name.trim()) return;
    updateEnterpriseData((d) => ({
      ...d,
      dueTasks: [{
        id: `DT-2608-${Date.now().toString(36).toUpperCase()}`, name: draft.name.trim(),
        count: 0, source: draft.source, status: '待开始', progress: 0, hitRisk: 0,
        startedAt: new Date().toLocaleString('zh-CN', { hour12: false }), createdBy: '当前用户',
      }, ...d.dueTasks],
    }));
    setNewOpen(false); setDraft({ name: '', source: '上传名单' });
  };
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="批量尽调任务" crumb={`${CRUMB} / 企业风险尽调中心 / 批量尽调任务`}
        subtitle="上传企业名单批量查询风险，跟踪任务进度与命中结果"
        actions={<><Sam value="enterpriseData.json.dueTasks" /><Cal label="实时统计" /><Button size="sm" variant="primary" onClick={() => setNewOpen(true)}>＋ 新建尽调任务</Button></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="任务总数" value={String(ent.dueTasks.length)} accent="brand" />
        <StatCard label="进行中" value={String(ent.dueTasks.filter((t) => t.status === '进行中').length)} accent="amber" />
        <StatCard label="已完成" value={String(ent.dueTasks.filter((t) => t.status === '已完成').length)} accent="green" />
        <StatCard label="累计命中风险" value={String(ent.dueTasks.reduce((s, t) => s + t.hitRisk, 0))} accent="rose" />
      </div>
      <Panel title="尽调任务列表" desc={<span>批量尽调任务与进度 · <Sam value="enterpriseData.json" /></span>}>
        <DataTable columns={cols} rows={rows} empty="暂无任务" pager defaultPageSize={10}
          actions={(r) => (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button type="button" onClick={() => openTask(String(r.id))}
                style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看 →</button>
            </div>
          )} />
      </Panel>
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="新建尽调任务">
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">任务名称</span>
            <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">来源</span>
            <select value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400">
              <option value="上传名单">上传名单</option>
              <option value="接口导入">接口导入</option>
              <option value="手工录入">手工录入</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setNewOpen(false)}>取消</Button>
          <Button size="sm" variant="primary" onClick={doCreate}>确认创建</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ 批量尽调任务详情 ============ */
export function EntBatchDueDetail() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const [params] = useNavParams();
  const task = ent.dueTasks.find((t) => t.id === (params.get('taskId') ?? '')) ?? ent.dueTasks[0];
  if (!task) return <div style={{ padding: 24 }}><PageShell title="批量尽调任务详情" crumb={`${CRUMB} / 企业风险尽调中心 / 批量尽调任务`} subtitle="未找到任务" /></div>;
  const meta: Record<string, { color: string; soft: string }> = {
    待开始: { color: '#94A3B8', soft: '#F1F5F9' },
    进行中: { color: '#2563EB', soft: '#DBEAFE' },
    已完成: { color: '#059669', soft: '#D1FAE5' },
    失败: { color: '#E11D48', soft: '#FFE4E6' },
  };
  const m = meta[task.status] ?? meta.待开始;
  // 命中风险企业示例：取监控名单中高风险企业（业务口径：尽调命中风险的企业）
  const hitEnts = ent.monitorList.filter((x) => x.riskLevel === '高' || x.riskLevel === '中').slice(0, task.hitRisk || 0);
  const rows: Row[] = hitEnts.map((e, i) => ({
    id: String(i), name: e.name, industry: e.industry,
    riskLevel: { v: e.riskLevel, kind: e.riskLevel === '高' ? 'red' : e.riskLevel === '中' ? 'amber' : 'green' },
    hitRule: e.riskLevel === '高' ? '司法涉诉 / 经营异常' : '经营异常 / 关联风险',
  }));
  const cols: Column[] = [
    { key: 'name', label: '命中企业', type: 'text', width: '280px' },
    { key: 'industry', label: '行业', type: 'text', width: '200px' },
    { key: 'riskLevel', label: '风险等级', type: 'badge', badgeKind: 'gray', width: '110px' },
    { key: 'hitRule', label: '命中风险项', type: 'text', width: '260px' },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="批量尽调任务详情" crumb={`${CRUMB} / 企业风险尽调中心 / 批量尽调任务 / ${task.name}`}
        subtitle="任务进度监控与命中风险企业明细"
        actions={<><Sam value="enterpriseData.json.dueTasks" /><Cal label="实时计算" /><Button size="sm" variant="secondary" onClick={() => nav('/console/ep/batch-due')}>← 返回任务列表</Button></>} />

      {/* 任务概览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="任务状态" value={task.status} accent={task.status === '已完成' ? 'green' : task.status === '失败' ? 'rose' : task.status === '进行中' ? 'amber' : 'gray'} />
        <StatCard label="企业总数" value={String(task.count)} accent="brand" />
        <StatCard label="命中风险" value={String(task.hitRisk)} accent="rose" />
        <StatCard label="创建人" value={task.createdBy} accent="cyan" />
      </div>

      <Panel title="任务进度" desc={<span>批量尽调执行进度 · <Cal label="实时计算" /></span>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#475569' }}>{task.status === '进行中' ? '批量查询执行中' : task.status === '已完成' ? '任务已完成' : task.status === '失败' ? '任务执行失败' : '任务待开始'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{task.progress}%</span>
            </div>
            <div style={{ height: 12, borderRadius: 6, background: '#F1F5F9', overflow: 'hidden' }}>
              <div style={{ width: `${task.progress}%`, height: '100%', borderRadius: 6, background: m.color }} />
            </div>
          </div>
          <div style={{ fontSize: 11, color: '#94A3B8', textAlign: 'right' }}>
            <div>开始：{task.startedAt}</div>
            {task.finishedAt && <div>完成：{task.finishedAt}</div>}
          </div>
        </div>
        {/* 阶段监控 */}
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {['企业名单解析', '工商核验', '司法涉诉', '经营/财务', '舆情监测', '风险汇总'].map((s, i) => {
            const done = task.progress >= ((i + 1) / 6) * 100 || task.status === '已完成';
            return (
              <span key={s} style={{ fontSize: 11, padding: '4px 10px', borderRadius: 999, background: done ? '#D1FAE5' : '#F1F5F9', color: done ? '#059669' : '#94A3B8', border: `1px solid ${done ? '#A7F3D0' : '#E2E8F0'}` }}>
                {done ? '✓ ' : ''}{s}
              </span>
            );
          })}
        </div>
      </Panel>

      <Panel title="命中风险企业" desc={<span>该任务命中风险信号的企业明细 · <Sam value="enterpriseData.json.monitorList" /></span>}>
        <DataTable columns={cols} rows={rows} empty="暂无命中风险企业" pager defaultPageSize={8} />
      </Panel>
    </div>
  );
}

/* ============ 存量企业监控名单 ============ */
export function EntMonitorList() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const rows: Row[] = ent.monitorList.map((m) => ({
    id: m.keyNo, name: m.name, industry: m.industry,
    riskLevel: { v: m.riskLevel, kind: ENT_KIND[m.riskLevel] },
    monitorSince: m.monitorSince, alerts: String(m.alerts), lastAlert: m.lastAlert,
    status: { v: m.status, kind: m.status === '监控中' ? 'green' : m.status === '已暂停' ? 'amber' : 'gray' },
  }));
  const cols: Column[] = [
    { key: 'name', label: '企业名称', type: 'text', width: '260px', fixed: 'left' },
    { key: 'industry', label: '行业', type: 'text', width: '180px' },
    { key: 'riskLevel', label: '风险等级', type: 'badge', badgeKind: 'gray', width: '100px' },
    { key: 'monitorSince', label: '开始监控', type: 'text', width: '120px' },
    { key: 'alerts', label: '累计预警', type: 'text', width: '100px' },
    { key: 'lastAlert', label: '最近预警', type: 'text', width: '120px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '100px' },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="存量企业监控名单" crumb={`${CRUMB} / 企业风险尽调中心 / 存量企业监控名单`}
        subtitle="名单内企业持续监控，风险变化即触发预警"
        actions={<><Sam value="enterpriseData.json.monitorList" /><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="监控中企业" value={String(ent.monitorList.filter((m) => m.status === '监控中').length)} accent="brand" />
        <StatCard label="高风险" value={String(ent.monitorList.filter((m) => m.riskLevel === '高').length)} accent="rose" />
        <StatCard label="中风险" value={String(ent.monitorList.filter((m) => m.riskLevel === '中').length)} accent="amber" />
        <StatCard label="累计预警" value={String(ent.monitorList.reduce((s, m) => s + m.alerts, 0))} accent="violet" />
      </div>
      <Panel title="监控名单" desc={<span>存量企业监控 · <Sam value="enterpriseData.json" /></span>}>
        <DataTable columns={cols} rows={rows} empty="暂无监控企业" pager defaultPageSize={10}
          actions={(r) => {
            const m = ent.monitorList.find((x) => x.keyNo === String(r.id));
            return (
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => { if (m) { qiyeSelectedName = m.name; qiyeSelectedKeyNo = m.keyNo; nav('/console/ep/qiye-profile'); } }}
                  style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看档案</button>
              </div>
            );
          }} />
      </Panel>
    </div>
  );
}

/* ============ 决策事件列表 ============ */
export function EntDecisionEvents() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const [result, setResult] = useState('');
  const filtered = ent.decisionEvents.filter((d) => !result || d.result === result);
  const rows: Row[] = filtered.map((d) => ({
    id: d.id, id2: d.id, entName: d.entName, scene: d.scene, score: String(d.score),
    scoreModel: d.scoreModel, result: { v: d.result, kind: d.result === '拒绝' ? 'red' : d.result === '通过' ? 'green' : d.result === '转人工' ? 'amber' : 'violet' },
    level: { v: d.level, kind: ENT_KIND[d.level] }, status: { v: d.status, kind: d.status === '待复核' ? 'red' : d.status === '复核中' ? 'amber' : 'green' },
    decidedAt: d.decidedAt, operator: d.operator,
  }));
  const cols: Column[] = [
    { key: 'id2', label: '事件号', type: 'text', width: '120px', fixed: 'left' },
    { key: 'entName', label: '企业', type: 'text', width: '240px' },
    { key: 'scene', label: '决策场景', type: 'text', width: '110px' },
    { key: 'score', label: '企业分', type: 'text', width: '80px' },
    { key: 'scoreModel', label: '模型', type: 'text', width: '100px' },
    { key: 'result', label: '结果', type: 'badge', badgeKind: 'gray', width: '90px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '80px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '100px' },
    { key: 'decidedAt', label: '决策时间', type: 'text', width: '150px' },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="决策事件列表" crumb={`${CRUMB} / 风险事件管理 / 决策事件列表`}
        subtitle="企业授信 / 尽调 / 名单 / 预警处置等决策事件列表，可追踪决策过程"
        actions={<><Sam value="enterpriseData.json.decisionEvents" /><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="决策事件" value={String(ent.decisionEvents.length)} accent="brand" />
        <StatCard label="通过" value={String(ent.decisionEvents.filter((d) => d.result === '通过').length)} accent="green" />
        <StatCard label="拒绝" value={String(ent.decisionEvents.filter((d) => d.result === '拒绝').length)} accent="rose" />
        <StatCard label="转人工" value={String(ent.decisionEvents.filter((d) => d.result === '转人工').length)} accent="amber" />
      </div>
      <Panel title="决策事件" desc={<span>决策事件队列 · <Cal label="实时过滤" /></span>}
        actions={<select value={result} onChange={(e) => setResult(e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' }}><option value="">全部结果</option><option value="通过">通过</option><option value="拒绝">拒绝</option><option value="转人工">转人工</option><option value="预警">预警</option></select>}>
        <DataTable columns={cols} rows={rows} empty="暂无决策事件" pager defaultPageSize={10}
          actions={(r) => (
            <button type="button" onClick={() => nav('/console/ep/decision-trace?id=' + String(r.id))}
              style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>追踪 →</button>
          )} />
      </Panel>
    </div>
  );
}

/* ============ 人工复核工单 ============ */
export function EntReviewOrders() {
  const ent = useEnterpriseData();
  const [st, setSt] = useState('');
  const filtered = ent.reviewOrders.filter((o) => !st || o.status === st);
  const rows: Row[] = filtered.map((o) => ({
    id: o.id, id2: o.id, eventId: o.eventId, entName: o.entName, reason: o.reason,
    level: { v: o.level, kind: ENT_KIND[o.level] }, status: { v: o.status, kind: ORDER_KIND[o.status] },
    assignee: o.assignee, createdAt: o.createdAt,
  }));
  const cols: Column[] = [
    { key: 'id2', label: '工单号', type: 'text', width: '120px', fixed: 'left' },
    { key: 'eventId', label: '关联事件', type: 'text', width: '130px' },
    { key: 'entName', label: '企业', type: 'text', width: '240px' },
    { key: 'reason', label: '复核原因', type: 'text', width: '300px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '80px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '100px' },
    { key: 'assignee', label: '处理人', type: 'text', width: '100px' },
    { key: 'createdAt', label: '创建时间', type: 'text', width: '150px' },
  ];
  const review = (id: string, ok: boolean) => updateEnterpriseData((d) => ({
    ...d,
    reviewOrders: d.reviewOrders.map((o) => o.id === id ? { ...o, status: ok ? '已复核' : '已驳回', conclusion: ok ? '复核通过，同意原决策' : '复核驳回，重新评估', reviewer: '当前用户', reviewedAt: new Date().toLocaleString('zh-CN', { hour12: false }) } : o),
  }));
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="人工复核工单" crumb={`${CRUMB} / 风险事件管理 / 人工复核工单`}
        subtitle="需人工复核的决策工单：待复核 / 复核中 / 已复核队列"
        actions={<><Sam value="enterpriseData.json.reviewOrders" /><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="工单总数" value={String(ent.reviewOrders.length)} accent="brand" />
        <StatCard label="待复核" value={String(ent.reviewOrders.filter((o) => o.status === '待复核').length)} accent="red" />
        <StatCard label="复核中" value={String(ent.reviewOrders.filter((o) => o.status === '复核中').length)} accent="amber" />
        <StatCard label="已复核" value={String(ent.reviewOrders.filter((o) => o.status === '已复核').length)} accent="green" />
      </div>
      <Panel title="复核工单" desc={<span>复核工单队列 · <Cal label="实时过滤" /></span>}
        actions={<select value={st} onChange={(e) => setSt(e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' }}><option value="">全部状态</option><option value="待复核">待复核</option><option value="复核中">复核中</option><option value="已复核">已复核</option><option value="已驳回">已驳回</option></select>}>
        <DataTable columns={cols} rows={rows} empty="暂无工单" pager defaultPageSize={10}
          actions={(r) => (String(r.status) === '已复核' || String(r.status) === '已驳回') ? null : (
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" onClick={() => review(String(r.id), true)} style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #A7F3D0', background: '#ECFDF5', color: '#059669', fontSize: 12, cursor: 'pointer' }}>通过</button>
              <button type="button" onClick={() => review(String(r.id), false)} style={{ padding: '3px 10px', borderRadius: 6, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: 12, cursor: 'pointer' }}>驳回</button>
            </div>
          )} />
      </Panel>
    </div>
  );
}

/* ============ 模型列表（复用评分产品模型列表，调整为符合企业） ============ */
export function EntModelList() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="模型列表" crumb={`${CRUMB} / 模型管理中心 / 模型列表`}
        subtitle="企业风控模型：企业违约分 / 欺诈分 / 关联风险分，点击卡片进入模型详情"
        actions={<><Cfg value="enterpriseData.json.models" /></>} />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {ent.models.map((m) => (
          <button key={m.id} onClick={() => nav('/console/ep/model-list?model=' + m.id)}
            className="group rounded-2xl border border-slate-100 bg-white p-5 text-left shadow-card transition hover:border-brand-300 hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full" style={{ background: m.color }} />
                <span className="text-base font-semibold text-ink-900">{m.name}</span>
              </div>
              <Badge kind={m.enabled ? 'green' : 'gray'}>{m.enabled ? '已启用' : '已停用'}</Badge>
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold tabular-nums" style={{ color: m.color }}>{m.score}</span>
              <span className="mb-1 text-xs text-slate-400">当前分 · {m.range[0]}–{m.range[1]}</span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-500">
              <div className="flex justify-between"><span>算法类型</span><span className="text-slate-700">{m.algoType}</span></div>
              <div className="flex justify-between"><span>版本</span><span className="text-slate-700">{m.version}</span></div>
              <div className="flex justify-between"><span>更新时间</span><span className="text-slate-700">{m.updatedAt}</span></div>
              <div className="flex justify-between"><span>因子数</span><span className="text-slate-700">{m.factors.length}</span></div>
            </div>
            <div className="mt-4 text-right text-sm font-medium text-brand-600 group-hover:underline">进入详情 →</div>
          </button>
        ))}
      </div>
      <div style={{ marginTop: 12 }}><Panel title="说明" actions={<Cfg value="enterpriseData.json.models" />}><p className="text-sm text-slate-500">企业风控模型参考评分产品模型列表复用，模型信息调整为符合企业业务（工商/司法/税务/征信/关联/舆情因子）。点击卡片进入模型详情，查看因子权重、评分阈值与运营效果。</p></Panel></div>
    </div>
  );
}

/* ============ 模型详情（单模型） ============ */
export function EntModelDetail() {
  const ent = useEnterpriseData();
  const [params] = useNavParams();
  const id = params.get('model') ?? 'ent-credit';
  const m = ent.models.find((x) => x.id === id) ?? ent.models[0];
  const [tab, setTab] = useState<'base' | 'effect' | 'threshold'>('base');
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title={m.name} crumb={`${CRUMB} / 模型管理中心 / 模型列表 / ${m.name}`}
        subtitle={`${m.desc} · ${m.version}`}
        actions={<><Cfg value="enterpriseData.json.models" /><Button size="sm" variant="secondary" onClick={() => window.history.back()}>← 返回模型列表</Button></>} />
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E2E8F0', marginBottom: 14 }}>
        {([['base', '基本信息'], ['effect', '模型效果'], ['threshold', '评分阈值']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '8px 14px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', color: tab === k ? '#0EA5E9' : '#64748B', fontWeight: tab === k ? 700 : 400, borderBottom: tab === k ? '2px solid #0EA5E9' : '2px solid transparent', marginBottom: -1 }}>{l}</button>
        ))}
      </div>
      {tab === 'base' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="当前分" value={String(m.score)} accent="brand" hint={`区间 ${m.range[0]}–${m.range[1]}`} />
            <StatCard label="算法类型" value={m.algoType} accent="cyan" />
            <StatCard label="版本" value={m.version} accent="violet" />
            <StatCard label="更新时间" value={m.updatedAt} accent="emerald" />
          </div>
          <Panel title="特征因子权重" desc={<span>模型特征与权重 · <Cfg value="enterpriseData.json" /></span>}>
            <div className="space-y-2">
              {m.factors.map((f) => (
                <div key={f.name} className="flex items-center gap-3">
                  <span style={{ width: 160, fontSize: 13, color: '#475569' }}>{f.name}</span>
                  <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#F1F5F9', overflow: 'hidden' }}>
                    <div style={{ width: `${f.weight * 100}%`, height: '100%', background: m.color, borderRadius: 4 }} />
                  </div>
                  <span style={{ width: 50, textAlign: 'right', fontSize: 13, fontWeight: 600 }}>{(f.weight * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
      {tab === 'effect' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 14 }}>
            <StatCard label="覆盖率" value={`${m.ops.coverage}%`} accent="brand" />
            <StatCard label="准确率" value={`${m.ops.accuracy}%`} accent="green" />
            <StatCard label="及时率" value={`${m.ops.timely}%`} accent="amber" />
            <StatCard label="累计调用" value={m.ops.calls.toLocaleString()} accent="violet" />
          </div>
          <Panel title="运营趋势" actions={<Cal />}>
            <LineChart labels={m.ops.trend.map((t) => t.month)} height={240}
              series={[
                { name: '覆盖率', color: m.color, data: m.ops.trend.map((t) => t.coverage) },
                { name: '准确率', color: '#3b82f6', data: m.ops.trend.map((t) => t.accuracy) },
                { name: '及时率', color: '#8b5cf6', data: m.ops.trend.map((t) => t.timely) },
              ]} unit="%" />
          </Panel>
        </>
      )}
      {tab === 'threshold' && (
        <Panel title="评分阈值" desc="分数区间 → 等级 → 含义 → 建议动作" actions={<Cfg value="enterpriseData.json" />}>
          <DataTable columns={[
            { key: 'range', label: '分数区间', width: '160px' },
            { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '120px' },
            { key: 'meaning', label: '含义' },
            { key: 'action', label: '建议动作' },
          ]} rows={m.thresholds.map((t) => ({ id: t.range, range: t.range, level: { v: t.level, kind: ENT_KIND[t.level.split('风险')[0] ?? '中'] ?? 'gray' }, meaning: t.meaning, action: t.action }))} empty="暂无阈值" pager defaultPageSize={10} />
        </Panel>
      )}
    </div>
  );
}
function useNavParams() {
  const s = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  return [s] as const;
}

/* ============ 名单管理（黑白灰名单） ============ */
export function EntListManage() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const [tab, setTab] = useState<'black' | 'white' | 'gray'>('black');
  const filtered = ent.listEnts.filter((l) => l.list === tab);
  const rows: Row[] = filtered.map((l) => ({
    id: l.id, name: l.name, reason: l.reason, source: l.source, addedAt: l.addedAt, operator: l.operator,
    status: { v: l.status, kind: l.status === '生效' ? 'green' : 'gray' },
  }));
  const cols: Column[] = [
    { key: 'name', label: '企业名称', type: 'text', width: '260px', fixed: 'left' },
    { key: 'reason', label: '加入原因', type: 'text', width: '300px' },
    { key: 'source', label: '来源', type: 'text', width: '110px' },
    { key: 'addedAt', label: '加入时间', type: 'text', width: '130px' },
    { key: 'operator', label: '操作人', type: 'text', width: '100px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
  ];
  const cnt = (t: 'black' | 'white' | 'gray') => ent.listEnts.filter((l) => l.list === t).length;
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="名单管理" crumb={`${CRUMB} / 名单管理`}
        subtitle="企业黑白灰名单：黑名单拦截、白名单放行、灰名单预警"
        actions={<><Sam value="enterpriseData.json.listEnts" /><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="黑名单" value={String(cnt('black'))} accent="rose" />
        <StatCard label="白名单" value={String(cnt('white'))} accent="green" />
        <StatCard label="灰名单" value={String(cnt('gray'))} accent="gray" />
      </div>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E2E8F0', marginBottom: 14 }}>
        {(['black', 'white', 'gray'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 16px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', color: tab === t ? '#0EA5E9' : '#64748B', fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? '2px solid #0EA5E9' : '2px solid transparent', marginBottom: -1 }}>
            {LIST_LABEL[t]}（{cnt(t)}）
          </button>
        ))}
      </div>
      <Panel title={`${LIST_LABEL[tab]}列表`} desc={<span>名单明细 · <Sam value="enterpriseData.json" /></span>}>
        <DataTable columns={cols} rows={rows} empty="该名单暂无企业" pager defaultPageSize={10}
          actions={(r) => {
            const l = ent.listEnts.find((x) => x.id === String(r.id));
            return (
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => { if (l) { qiyeSelectedName = l.name; qiyeSelectedKeyNo = l.id; nav('/console/ep/qiye-profile'); } }}
                  style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看档案</button>
              </div>
            );
          }} />
      </Panel>
    </div>
  );
}

/* ============ 数据源市场与管理 ============ */
export function EntDataSource() {
  const ent = useEnterpriseData();
  const [dsSel, setDsSel] = useState<{ id: string; name: string; category: string; desc: string; status: string; vendor: string; cost?: string; updatedAt: string } | null>(null);
  const rows: Row[] = ent.dataSources.map((s) => ({
    id: s.id, name: s.name, category: { v: s.category, kind: 'blue' }, desc: s.desc,
    status: { v: s.status, kind: DS_KIND[s.status] }, vendor: s.vendor, cost: s.cost ?? '—', updatedAt: s.updatedAt,
  }));
  const cols: Column[] = [
    { key: 'name', label: '数据源', type: 'text', width: '200px', fixed: 'left' },
    { key: 'category', label: '分类', type: 'badge', badgeKind: 'blue', width: '100px' },
    { key: 'desc', label: '说明', type: 'text', width: '300px' },
    { key: 'status', label: '接入状态', type: 'badge', badgeKind: 'gray', width: '110px' },
    { key: 'vendor', label: '供应商', type: 'text', width: '160px' },
    { key: 'cost', label: '计费', type: 'text', width: '100px' },
    { key: 'updatedAt', label: '更新时间', type: 'text', width: '120px' },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="数据源市场与管理" crumb={`${CRUMB} / 数据源市场与管理`}
        subtitle="企业数据源市场：工商 / 司法 / 税务 / 征信 / 舆情 / 关联等数据源接入与管理"
        actions={<><Sam value="enterpriseData.json.dataSources" /><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="数据源总数" value={String(ent.dataSources.length)} accent="brand" />
        <StatCard label="已接入" value={String(ent.dataSources.filter((s) => s.status === '已接入').length)} accent="green" />
        <StatCard label="测试中" value={String(ent.dataSources.filter((s) => s.status === '测试中').length)} accent="amber" />
        <StatCard label="未接入" value={String(ent.dataSources.filter((s) => s.status === '未接入').length)} accent="gray" />
      </div>
      <Panel title="数据源列表" desc={<span>企业数据源 · <Sam value="enterpriseData.json" /></span>}>
        <DataTable columns={cols} rows={rows} empty="暂无数据源" pager defaultPageSize={10}
          actions={(r) => {
            const s = ent.dataSources.find((x) => x.id === String(r.id));
            return (
              <button type="button" onClick={() => s && setDsSel({ id: s.id, name: s.name, category: s.category, desc: s.desc, status: s.status, vendor: s.vendor, cost: s.cost, updatedAt: s.updatedAt })}
                style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看</button>
            );
          }} />
      </Panel>
      <Modal open={dsSel != null} onClose={() => setDsSel(null)} title={`数据源详情 · ${dsSel?.name ?? ''}`}>
        {dsSel && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">分类</span><b>{dsSel.category}</b></div>
            <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">接入状态</span><b>{dsSel.status}</b></div>
            <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">供应商</span><b>{dsSel.vendor}</b></div>
            <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">计费</span><b>{dsSel.cost ?? '—'}</b></div>
            <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">更新时间</span><b>{dsSel.updatedAt}</b></div>
            <div className="py-1.5"><span className="text-slate-500">说明</span><p className="mt-1 text-slate-700">{dsSel.desc}</p></div>
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="secondary" onClick={() => setDsSel(null)}>关闭</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ 预警规则配置 ============ */
export function EntAlertRule() {
  const ent = useEnterpriseData();
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', category: '司法涉诉', condition: '', level: '中', action: '' });
  const toggle = (id: string) => updateEnterpriseData((d) => ({ ...d, alertRules: d.alertRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)) }));
  const add = () => updateEnterpriseData((d) => ({
    ...d,
    alertRules: [...d.alertRules, { id: `ER-${Date.now().toString(36).toUpperCase()}`, name: draft.name || '未命名规则', category: draft.category, condition: draft.condition || '自定义条件', level: draft.level as any, action: draft.action || '人工核实', enabled: true }],
  }));
  const rows: Row[] = ent.alertRules.map((r) => ({
    id: r.id, name: r.name, category: { v: r.category, kind: 'blue' }, condition: r.condition,
    level: { v: r.level, kind: ENT_KIND[r.level] }, action: r.action,
    status: { v: r.enabled ? '启用' : '停用', kind: r.enabled ? 'green' : 'gray' },
  }));
  const cols: Column[] = [
    { key: 'name', label: '规则名称', type: 'text', width: '180px', fixed: 'left' },
    { key: 'category', label: '分类', type: 'badge', badgeKind: 'blue', width: '120px' },
    { key: 'condition', label: '触发条件', type: 'text', width: '320px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '90px' },
    { key: 'action', label: '处置动作', type: 'text', width: '200px' },
    { key: 'status', label: '生效状态', type: 'badge', badgeKind: 'gray', width: '100px' },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="预警规则配置" crumb={`${CRUMB} / 风险预警中心 / 预警规则配置`}
        subtitle="企业风险预警规则：司法涉诉 / 经营异常 / 舆情负面 / 财务恶化 / 关联风险等"
        actions={<><Sam value="enterpriseData.json.alertRules" /><Button size="sm" variant="primary" onClick={() => setNewOpen(true)}>＋ 新增规则</Button></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="规则总数" value={String(ent.alertRules.length)} accent="brand" />
        <StatCard label="启用" value={String(ent.alertRules.filter((r) => r.enabled).length)} accent="green" />
        <StatCard label="高风险" value={String(ent.alertRules.filter((r) => r.level === '高').length)} accent="rose" />
        <StatCard label="已停用" value={String(ent.alertRules.filter((r) => !r.enabled).length)} accent="gray" />
      </div>
      <Panel title="预警规则" desc={<span>企业预警规则 · <Cal label="实时统计" /></span>}>
        <DataTable columns={cols} rows={rows} empty="暂无规则" pager defaultPageSize={10}
          actions={(r) => { const rule = ent.alertRules.find((x) => x.id === String(r.id)); return <Button size="sm" variant="ghost" onClick={() => toggle(String(r.id))}>{rule?.enabled ? '停用' : '启用'}</Button>; }} />
      </Panel>
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="新增预警规则">
        <div className="space-y-3">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="规则名称" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          <select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400">
            <option value="司法涉诉">司法涉诉</option><option value="经营异常">经营异常</option><option value="舆情负面">舆情负面</option><option value="财务恶化">财务恶化</option><option value="关联风险">关联风险</option><option value="税务">税务</option>
          </select>
          <input value={draft.condition} onChange={(e) => setDraft({ ...draft, condition: e.target.value })} placeholder="触发条件" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          <select value={draft.level} onChange={(e) => setDraft({ ...draft, level: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400">
            <option value="高">高</option><option value="中">中</option><option value="低">低</option>
          </select>
          <input value={draft.action} onChange={(e) => setDraft({ ...draft, action: e.target.value })} placeholder="处置动作" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setNewOpen(false)}>取消</Button>
          <Button size="sm" variant="primary" onClick={() => { add(); setNewOpen(false); setDraft({ name: '', category: '司法涉诉', condition: '', level: '中', action: '' }); }}>确认新增</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ 企业档案（复用企业档案页面） ============ */
export function EntArchive() {
  return <QiyeProfile />;
}

/* ============ 预警处置工作台（内容数据换成企业） ============ */
export function EntAlertWorkbench() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  useMinuteTick();
  const pageFlow = usePageFlow('/console/ep/alert-workbench');
  const [lvl, setLvl] = useState('');
  const filtered = ent.alerts.filter((a) => !lvl || a.level === lvl);
  const lc = { RED: 0, YELLOW: 0, OPPORTUNITY: 0 };
  ent.alerts.forEach((a) => { lc[a.level] = (lc[a.level] ?? 0) + 1; });
  const rows: Row[] = filtered.map((a) => ({
    id: a.id, id2: a.id, entName: a.entName, category: { v: a.category, kind: 'blue' },
    ruleName: a.ruleName, level: { v: a.level === 'RED' ? '红灯' : a.level === 'YELLOW' ? '黄灯' : '机会', kind: ALERT_KIND[a.level] },
    detail: a.detail, alert_date: a.alert_date, status: { v: a.status, kind: a.status === '待处置' ? 'red' : a.status === '核实中' ? 'amber' : 'green' },
    flowKey: a.flowKey ?? '', flowState: a.flowState ?? '', flowStateAt: a.flowStateAt ?? '',
  }));
  const setAlertFlow = (id: string, next: string, at: string) =>
    updateEnterpriseData((d) => ({
      ...d,
      alerts: d.alerts.map((a) => a.id === id ? { ...a, flowState: next, flowStateAt: at } : a),
    }));
  const cols: Column[] = [
    { key: 'id2', label: '预警ID', type: 'text', width: '110px', fixed: 'left' },
    { key: 'entName', label: '企业', type: 'text', width: '200px' },
    { key: 'category', label: '预警分类', type: 'badge', badgeKind: 'blue', width: '110px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '80px' },
    { key: 'detail', label: '预警内容', type: 'text', width: '220px' },
    { key: 'alert_date', label: '预警时间', type: 'text', width: '140px' },
    {
      key: 'countdown', label: '时限倒计时', width: '110px',
      render: (r: Row) => renderCountdown({
        flowId: flowIdOfRow(r as any, pageFlow),
        flowState: String(r.flowState ?? ''),
        flowStateAt: String(r.flowStateAt ?? ''),
        matchObj: matchObjOf(r as any, { level: 'level', category: 'category' }),
      }),
    },
    {
      key: 'flowState', label: '流程状态', fixed: 'right', width: '170px', tag: { kind: 'sample', value: 'enterpriseData.json.flowState' },
      render: (r: Row) => (
        <FlowStateCell
          flowId={flowIdOfRow(r as any, pageFlow)}
          state={String(r.flowState ?? '')}
          matchObj={matchObjOf(r as any, { level: 'level', category: 'category' })}
          onChange={(next) => setAlertFlow(String(r.id), next, nowStamp())}
        />
      ),
    },
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="预警处置工作台" crumb={`${CRUMB} / 风险预警中心 / 预警处置工作台`}
        subtitle="企业预警队列 · 逐条核实、发起处置（数据来源已切换为企业预警）"
        actions={<><Sam value="enterpriseData.json.alerts" /><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="预警总数" value={String(ent.alerts.length)} accent="brand" />
        <StatCard label="红灯预警" value={String(lc.RED)} accent="rose" />
        <StatCard label="黄灯预警" value={String(lc.YELLOW)} accent="amber" />
        <StatCard label="待处置" value={String(ent.alerts.filter((a) => a.status === '待处置').length)} accent="red" />
      </div>
      <Panel title="企业预警队列" desc={<span>筛选后 <b>{filtered.length}</b> 条 · <Cal label="实时过滤" /></span>}
        actions={<select value={lvl} onChange={(e) => setLvl(e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' }}><option value="">全部等级</option><option value="RED">红灯</option><option value="YELLOW">黄灯</option><option value="OPPORTUNITY">机会</option></select>}>
        <DataTable columns={cols} rows={rows} empty="无匹配预警" pager defaultPageSize={10}
          actions={(r) => {
            const a = ent.alerts.find((x) => x.id === String(r.id))!;
            return (
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => { qiyeSelectedName = a.entName; qiyeSelectedKeyNo = a.entKeyNo ?? ''; nav('/console/ep/qiye-profile'); }}
                  style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看档案</button>
              </div>
            );
          }} />
      </Panel>
    </div>
  );
}
