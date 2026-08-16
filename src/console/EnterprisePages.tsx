/* 企业风控子系统 · 业务页面（使用域）
 * 模块：一键查询 / 风险画像 / 批量尽调 / 监控名单 / 决策事件 / 模型列表 / 名单管理 / 数据源 / 预警规则 / 预警处置
 * 数据来源：enterpriseData.json（橘 Sam）｜实时统计（灰 Cal）
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable, Button, Badge, Modal, DetailHeader, SingleSelect } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam, Cal, Cfg } from './SourceTag';
import { PageShell } from './PageShell';
import { LineChart } from '../components/charts';
import { useEnterpriseData, updateEnterpriseData, appendLog, appendOpLog, type MonitorEnt, type ListEnt, type DueTask, type EntAlert } from './enterpriseData';
import { QiyeSearch, QiyeProfile, setQiyeSelected } from './QiyePages';
import { usePageNav } from './pageNav';
// 统一流程绑定层（与贷中预警工作台/贷前四页同一套）：列表显示「流程状态」列，状态流转写回 enterpriseData.json
import FlowStateCell from './FlowStateCell';
import { matchObjOf, flowIdOfRow, nowStamp, usePageFlow, flowColumns, FlowBar, FlowStateFilter } from './flowBinding';

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
  const pageFlow = usePageFlow('/console/ep/batch-due');
  const setDueFlow = (id: string, next: string, at: string) =>
    updateEnterpriseData((d) => ({ ...d, dueTasks: d.dueTasks.map((t) => t.id === id ? { ...t, status: next as DueTask['status'], flowState: next, flowStateAt: at, flowLogs: appendLog(t.flowLogs, next) } : t) }));
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', source: '上传名单' });
  const [fs, setFs] = useState('');
  const openTask = (id: string) => nav(`/console/ep/batch-due-detail?taskId=${encodeURIComponent(id)}`);
  const dlTpl = () => {
    const csv = '\ufeff企业名称,统一社会信用代码,行业,备注\n示例企业A,91110000MA00XXXXXX,批发业,\n示例企业B,91330000MA11XXXXXX,软件和信息技术服务业,\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '尽调名单模板.csv'; a.click(); URL.revokeObjectURL(a.href);
  };
  const rows: Row[] = ent.dueTasks
    .filter((t) => !fs || (t.flowState ?? t.status) === fs)
    .map((t) => ({
      id: t.id, id2: t.id, name: t.name, count: String(t.count), source: t.source,
      progress: `${t.progress}%`, hitRisk: String(t.hitRisk), startedAt: t.startedAt, createdBy: t.createdBy,
      flowState: t.flowState ?? t.status, flowStateAt: t.flowStateAt ?? '',
    }));
  const baseCols: Column[] = [
    { key: 'id2', label: '任务号', type: 'text', width: '120px', fixed: 'left' },
    { key: 'name', label: '任务名称', type: 'text', width: '220px' },
    { key: 'count', label: '企业数', type: 'text', width: '90px' },
    { key: 'source', label: '来源', type: 'text', width: '110px' },
    { key: 'progress', label: '进度', type: 'text', width: '90px' },
    { key: 'hitRisk', label: '命中风险', type: 'text', width: '100px' },
    { key: 'startedAt', label: '开始时间', type: 'text', width: '150px' },
    { key: 'createdBy', label: '创建人', type: 'text', width: '100px' },
  ];
  const cols: Column[] = [
    ...baseCols,
    ...flowColumns({ pageRoute: '/console/ep/batch-due', pageFlow, sampleFile: 'enterpriseData.json.dueTasks', onStateChange: (r, next, at) => setDueFlow(String(r.id), next, at) }),
  ];
  const doCreate = () => {
    if (!draft.name.trim()) return;
    const name = draft.name.trim();
    updateEnterpriseData((d) => ({
      ...d,
      dueTasks: [{
        id: `DT-2608-${Date.now().toString(36).toUpperCase()}`, name,
        count: 0, source: draft.source, status: '待开始', progress: 0, hitRisk: 0,
        startedAt: new Date().toLocaleString('zh-CN', { hour12: false }), createdBy: '当前用户',
      }, ...d.dueTasks],
      opLogs: appendOpLog(d.opLogs, { module: '批量尽调', type: '新建任务', target: name, detail: `来源：${draft.source}` }),
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
        <StatCard label="已完成" value={String(ent.dueTasks.filter((t) => t.status === '已完成').length)} accent="emerald" />
        <StatCard label="累计命中风险" value={String(ent.dueTasks.reduce((s, t) => s + t.hitRisk, 0))} accent="rose" />
      </div>
      <Panel title="尽调任务列表" desc={<span>批量尽调任务与进度 · <Sam value="enterpriseData.json" /></span>}
        actions={<FlowStateFilter pageRoute="/console/ep/batch-due" value={fs} onChange={setFs} />}>
        <DataTable columns={cols} rows={rows} empty="暂无任务" pager defaultPageSize={10} exportable exportName="批量尽调任务"
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
            <SingleSelect label="选择来源" fullWidth value={draft.source} onChange={(v) => setDraft({ ...draft, source: v })}
              options={[{ value: '上传名单', label: '上传名单' }, { value: '接口导入', label: '接口导入' }, { value: '手工录入', label: '手工录入' }]} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">企业名单（上传名单时使用，支持 .csv 模板）</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="file" accept=".csv" className="text-xs text-slate-500" />
              <button type="button" onClick={dlTpl}
                style={{ fontSize: 12, padding: '4px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', cursor: 'pointer' }}>
                ⬇ 下载标准模板
              </button>
            </div>
            <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#94A3B8' }}>模板列：企业名称、统一社会信用代码、行业、备注；名称或信用代码至少一项必填，逐行校验错误行会标红提示。</span>
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
  const setDueFlow = (next: string, at: string) =>
    updateEnterpriseData((d) => ({ ...d, dueTasks: d.dueTasks.map((t) => t.id === task.id ? { ...t, status: next as DueTask['status'], flowState: next, flowStateAt: at, flowLogs: appendLog(t.flowLogs, next) } : t) }));
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

      <div style={{ marginBottom: 16 }}>
        <FlowBar
          pageRoute="/console/ep/batch-due"
          row={{ flowState: task.flowState ?? task.status, flowStateAt: task.flowStateAt ?? '' }}
          onStateChange={setDueFlow}
        />
      </div>

      {/* 任务概览 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="任务状态" value={task.status} accent={task.status === '已完成' ? 'emerald' : task.status === '失败' ? 'rose' : task.status === '进行中' ? 'amber' : 'brand'} />
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

      <Panel title="流程日志" desc={<span>任务流程操作留痕（不可删除） · <Cal label="实时记录" /></span>}>
        <DataTable columns={[
          { key: 'at', label: '操作时间', width: '180px' },
          { key: 'action', label: '操作动作', width: '160px' },
          { key: 'operator', label: '操作人', width: '140px' },
          { key: 'opinion', label: '操作意见' },
        ]} rows={(task.flowLogs ?? []).map((l, i) => ({ id: String(i), at: l.at, action: l.action, operator: l.operator, opinion: l.opinion ?? '—' }))} empty="暂无流程操作记录" pager defaultPageSize={6} />
      </Panel>
    </div>
  );
}

/* ============ 存量企业监控名单 ============ */
export function EntMonitorList() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const pageFlow = usePageFlow('/console/ep/monitor-list');
  const setMonFlow = (id: string, next: string, at: string) =>
    updateEnterpriseData((d) => ({ ...d, monitorList: d.monitorList.map((m) => m.keyNo === id ? { ...m, status: next as MonitorEnt['status'], flowState: next, flowStateAt: at, flowLogs: appendLog(m.flowLogs, next) } : m) }));
  /* 暂停/恢复监控（不经过流程，直接写监控状态并留痕） */
  const toggleMon = (id: string) =>
    updateEnterpriseData((d) => ({ ...d,
      monitorList: d.monitorList.map((m) => m.keyNo === id
        ? { ...m, status: m.status === '监控中' ? '已暂停' as MonitorEnt['status'] : '监控中' as MonitorEnt['status'], flowLogs: appendLog(m.flowLogs, m.status === '监控中' ? '暂停监控' : '恢复监控') } : m),
      opLogs: appendOpLog(d.opLogs, { module: '监控名单', type: d.monitorList.find((m) => m.keyNo === id)?.status === '监控中' ? '暂停' : '恢复', target: d.monitorList.find((m) => m.keyNo === id)?.name ?? '—', detail: d.monitorList.find((m) => m.keyNo === id)?.status === '监控中' ? '暂停监控' : '恢复监控' }),
    }));
  /* 批量暂停/恢复/移除（P1） */
  const [selMon, setSelMon] = useState<string[]>([]);
  const batchMon = (mode: 'pause' | 'resume' | 'remove') => {
    updateEnterpriseData((d) => ({ ...d,
      monitorList: d.monitorList.map((m) => selMon.includes(m.keyNo)
        ? { ...m, status: mode === 'pause' ? '已暂停' as MonitorEnt['status'] : mode === 'resume' ? '监控中' as MonitorEnt['status'] : '已移除' as MonitorEnt['status'], flowLogs: appendLog(m.flowLogs, mode === 'pause' ? '暂停监控' : mode === 'resume' ? '恢复监控' : '移除监控') } : m),
      opLogs: appendOpLog(d.opLogs, { module: '监控名单', type: '批量', target: `选中 ${selMon.length} 家`, detail: mode === 'pause' ? '批量暂停监控' : mode === 'resume' ? '批量恢复监控' : '批量移除监控' }),
    }));
    setSelMon([]);
  };
  const [fs, setFs] = useState('');
  const rows: Row[] = ent.monitorList
    .filter((m) => !fs || (m.flowState ?? m.status) === fs)
    .map((m) => ({
      id: m.keyNo, name: m.name, industry: m.industry,
      riskLevel: { v: m.riskLevel, kind: ENT_KIND[m.riskLevel] },
      monitorSince: m.monitorSince, alerts: String(m.alerts), lastAlert: m.lastAlert,
      flowState: m.flowState ?? m.status, flowStateAt: m.flowStateAt ?? '',
    }));
  const baseCols: Column[] = [
    { key: 'name', label: '企业名称', type: 'text', width: '260px', fixed: 'left' },
    { key: 'industry', label: '行业', type: 'text', width: '180px' },
    { key: 'riskLevel', label: '风险等级', type: 'badge', badgeKind: 'gray', width: '100px' },
    { key: 'monitorSince', label: '开始监控', type: 'text', width: '120px' },
    { key: 'alerts', label: '累计预警', type: 'text', width: '100px' },
    { key: 'lastAlert', label: '最近预警', type: 'text', width: '120px' },
  ];
  const cols: Column[] = [
    ...baseCols,
    ...flowColumns({ pageRoute: '/console/ep/monitor-list', pageFlow, sampleFile: 'enterpriseData.json.monitorList', onStateChange: (r, next, at) => setMonFlow(String(r.id), next, at) }),
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
      <Panel title="监控名单" desc={<span>存量企业监控 · <Sam value="enterpriseData.json" /></span>}
        actions={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <FlowStateFilter pageRoute="/console/ep/monitor-list" value={fs} onChange={setFs} />
          {selMon.length > 0 && (
            <>
              <Button size="sm" variant="secondary" onClick={() => batchMon('pause')}>批量暂停</Button>
              <Button size="sm" variant="secondary" onClick={() => batchMon('resume')}>批量恢复</Button>
              <Button size="sm" variant="ghost" className="text-rose-600" onClick={() => batchMon('remove')}>批量移除</Button>
              <span style={{ fontSize: 12, color: '#64748B' }}>已选 {selMon.length} 家</span>
            </>
          )}
        </div>}>
        <DataTable columns={cols} rows={rows} empty="暂无监控企业" pager defaultPageSize={10} exportable exportName="存量监控名单"
          selectable selected={selMon} onSelectChange={setSelMon}
          actions={(r) => {
            const m = ent.monitorList.find((x) => x.keyNo === String(r.id));
            return (
              <div style={{ display: 'flex', gap: 6 }}>
                <Button size="sm" variant="ghost" onClick={() => m && toggleMon(String(r.id))}>{m?.status === '监控中' ? '暂停' : m?.status === '已暂停' ? '恢复' : ''}</Button>
                <button type="button" onClick={() => { if (m) { setQiyeSelected(m.name, m.keyNo); nav('/console/ep/qiye-profile'); } }}
                  style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看档案</button>
              </div>
            );
          }} />
      </Panel>
    </div>
  );
}

/* ============ 决策事件列表（接管理中心「决策复核流程」f-ent-decision） ============ */
export function EntDecisionEvents() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const pageFlow = usePageFlow('/console/ep/decision-events');
  const [result, setResult] = useState('');
  const [fs, setFs] = useState('');
  const filtered = ent.decisionEvents.filter((d) => (!result || d.result === result) && (!fs || d.flowState === fs));
  const setEvFlow = (id: string, next: string, at: string) =>
    updateEnterpriseData((d) => ({
      ...d,
      decisionEvents: d.decisionEvents.map((x) => x.id === id ? { ...x, flowState: next, flowStateAt: at, flowLogs: appendLog(x.flowLogs, next) } : x),
    }));
  const rows: Row[] = filtered.map((d) => ({
    id: d.id, id2: d.id, entName: d.entName, scene: d.scene, score: String(d.score),
    scoreModel: d.scoreModel, result: { v: d.result, kind: d.result === '拒绝' ? 'red' : d.result === '通过' ? 'green' : d.result === '转人工' ? 'amber' : 'violet' },
    level: { v: d.level, kind: ENT_KIND[d.level] },
    decidedAt: d.decidedAt, operator: d.operator,
    flowState: d.flowState ?? '', flowStateAt: d.flowStateAt ?? '',
  }));
  const baseCols: Column[] = [
    { key: 'id2', label: '事件号', type: 'text', width: '120px', fixed: 'left' },
    { key: 'entName', label: '企业', type: 'text', width: '240px' },
    { key: 'scene', label: '决策场景', type: 'text', width: '110px' },
    { key: 'score', label: '企业分', type: 'text', width: '80px' },
    { key: 'scoreModel', label: '模型', type: 'text', width: '100px' },
    { key: 'result', label: '结果', type: 'badge', badgeKind: 'gray', width: '90px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '80px' },
    { key: 'decidedAt', label: '决策时间', type: 'text', width: '150px' },
  ];
  const cols: Column[] = [
    ...baseCols,
    ...flowColumns({ pageRoute: '/console/ep/decision-events', pageFlow, sampleFile: 'enterpriseData.json.decisionEvents', onStateChange: (r, next, at) => setEvFlow(String(r.id), next, at) }),
  ];
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="决策事件列表" crumb={`${CRUMB} / 风险事件管理 / 决策事件列表`}
        subtitle="企业授信 / 尽调 / 名单 / 预警处置等决策事件列表，可追踪决策过程"
        actions={<><Sam value="enterpriseData.json.decisionEvents" /><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="决策事件" value={String(ent.decisionEvents.length)} accent="brand" />
        <StatCard label="通过" value={String(ent.decisionEvents.filter((d) => d.result === '通过').length)} accent="emerald" />
        <StatCard label="拒绝" value={String(ent.decisionEvents.filter((d) => d.result === '拒绝').length)} accent="rose" />
        <StatCard label="转人工" value={String(ent.decisionEvents.filter((d) => d.result === '转人工').length)} accent="amber" />
      </div>
      <Panel title="决策事件" desc={<span>决策事件队列 · <Cal label="实时过滤" /></span>}
        actions={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <FlowStateFilter pageRoute="/console/ep/decision-events" value={fs} onChange={setFs} />
          <SingleSelect label="全部结果" clearable value={result} onChange={setResult}
            options={[{ value: '', label: '全部结果' }, { value: '通过', label: '通过' }, { value: '拒绝', label: '拒绝' }, { value: '转人工', label: '转人工' }, { value: '预警', label: '预警' }]} />
        </div>}>
        <DataTable columns={cols} rows={rows} empty="暂无决策事件" pager defaultPageSize={10} exportable exportName="决策事件"
          actions={(r) => (
            <button type="button" onClick={() => nav('/console/ep/decision-trace?id=' + String(r.id))}
              style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>追踪 →</button>
          )} />
      </Panel>
    </div>
  );
}

/* ============ 决策追踪详情（按事件号展示完整链路；原误当看板渲染） ============ */
export function EntDecisionTraceDetail() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const { back } = usePageNav();
  const [params] = useNavParams();
  const id = params.get('id') ?? '';
  const ev = ent.decisionEvents.find((d) => d.id === id) ?? null;
  const [concl, setConcl] = useState('');

  if (!ev) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell header={<DetailHeader title="决策追踪详情" crumb={`${CRUMB} / 风险事件管理`} backLabel="返回列表" onBack={back} />} />
        <div style={{ padding: 24, color: '#94A3B8', fontSize: 13 }}>未找到该决策事件（{id}）。</div>
      </div>
    );
  }

  const setEvFlow = (next: string, at: string) =>
    updateEnterpriseData((d) => ({
      ...d,
      decisionEvents: d.decisionEvents.map((x) => x.id === ev.id ? { ...x, flowState: next, flowStateAt: at, reviewConclusion: concl || x.reviewConclusion, flowLogs: appendLog(x.flowLogs, next, '当前用户', concl || undefined) } : x),
    }));

  const mon = ent.monitorList.find((m) => m.name === ev.entName);
  const listHit = ent.listEnts.find((l) => l.name === ev.entName);
  const summary: [string, string][] = [
    ['决策场景', ev.scene],
    ['企业', ev.entName],
    ['企业分', String(ev.score)],
    ['评分模型', ev.scoreModel],
    ['决策结果', ev.result],
    ['风险等级', ev.level],
    ['命中规则', ev.rules.join('、') || '—'],
    ['决策时间', ev.decidedAt],
    ['操作人', ev.operator],
    ['复核流程状态', ev.flowState ?? '—'],
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1120 }}>
      <PageShell header={<DetailHeader title={`决策追踪 · ${ev.id}`} crumb={`${CRUMB} / 风险事件管理 / 决策追踪详情`} subtitle={`${ev.entName} · ${ev.scene}`} backLabel="返回列表" onBack={back} />} />

      <div style={{ marginBottom: 16 }}>
        <FlowBar
          pageRoute="/console/ep/decision-events"
          row={{ flowKey: ev.flowKey ?? '', flowState: ev.flowState ?? '', flowStateAt: ev.flowStateAt ?? '' }}
          onStateChange={(next, at) => setEvFlow(next, at)}
        />
      </div>

      <Panel className="mb-4" title="决策摘要" desc={<span><Sam value="enterpriseData.json.decisionEvents" /> 决策事件核心信息</span>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 24px', fontSize: 13 }}>
          {summary.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
              <span style={{ color: '#94A3B8' }}>{k}</span>
              <span style={{ color: '#334155', fontWeight: 500, textAlign: 'right', maxWidth: '70%' }}>{v}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="mb-4" title="关联风险视图" desc={<span>该企业的监控与名单状态 · <Sam value="enterpriseData.json" /></span>}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, alignItems: 'center' }}>
          <span style={{ padding: '4px 12px', borderRadius: 8, background: '#F1F5F9', color: '#475569' }}>监控名单：{mon ? `${mon.riskLevel} · ${mon.status}` : '未监控'}</span>
          <span style={{ padding: '4px 12px', borderRadius: 8, background: '#F1F5F9', color: '#475569' }}>名单命中：{listHit ? `${listHit.list} · ${listHit.status}` : '未命中'}</span>
          <button type="button" onClick={() => { setQiyeSelected(ev.entName, ev.entKeyNo); nav('/console/ep/qiye-profile'); }}
            style={{ padding: '4px 12px', borderRadius: 8, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看企业档案 →</button>
        </div>
      </Panel>

      <Panel className="mb-4" title="复核结论" desc="复核意见仅记录，不修改企业主数据（企业数据来自大数据平台对接，主数据只读）">
        <textarea value={concl} onChange={(e) => setConcl(e.target.value)} placeholder="填写复核结论 / 处置建议…"
          style={{ width: '100%', height: 90, resize: 'none', borderRadius: 8, border: '1px solid #E2E8F0', padding: 10, fontSize: 13, outline: 'none', color: '#334155' }} />
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
          <Button size="sm" variant="primary" onClick={() => updateEnterpriseData((d) => ({ ...d, decisionEvents: d.decisionEvents.map((x) => x.id === ev.id ? { ...x, reviewConclusion: concl } : x) }))}>保存结论</Button>
        </div>
      </Panel>

      <Panel className="mb-4" title="流程日志" desc={<span>复核流程操作留痕（不可删除） · <Cal label="实时记录" /></span>}>
        <DataTable columns={[
          { key: 'at', label: '操作时间', width: '180px' },
          { key: 'action', label: '操作动作', width: '150px' },
          { key: 'operator', label: '操作人', width: '130px' },
          { key: 'opinion', label: '操作意见' },
        ]} rows={(ev.flowLogs ?? []).map((l, i) => ({ id: String(i), at: l.at, action: l.action, operator: l.operator, opinion: l.opinion ?? '—' }))} empty="暂无流程操作记录" pager defaultPageSize={6} />
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
            <StatCard label="准确率" value={`${m.ops.accuracy}%`} accent="emerald" />
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
  const pageFlow = usePageFlow('/console/ep/list-manage');
  const setListFlow = (id: string, next: string, at: string) =>
    updateEnterpriseData((d) => ({ ...d, listEnts: d.listEnts.map((l) => l.id === id ? { ...l, status: next as ListEnt['status'], flowState: next, flowStateAt: at, flowLogs: appendLog(l.flowLogs, next) } : l) }));
  const [tab, setTab] = useState<'black' | 'white' | 'gray'>('black');
  const [fs, setFs] = useState('');
  const [newOpen, setNewOpen] = useState(false);
  const [draft, setDraft] = useState({ name: '', list: 'black' as 'black' | 'white' | 'gray', reason: '', source: '手工添加', expireAt: '', autoExpire: false });
  /* 批量失效（P1） */
  const [selList, setSelList] = useState<string[]>([]);
  const batchExpire = () => {
    updateEnterpriseData((d) => ({ ...d,
      listEnts: d.listEnts.map((l) => selList.includes(l.id) ? { ...l, status: '失效' as ListEnt['status'], flowLogs: appendLog(l.flowLogs, '批量失效', '当前用户') } : l),
      opLogs: appendOpLog(d.opLogs, { module: '名单管理', type: '批量', target: `选中 ${selList.length} 条`, detail: '批量置失效' }),
    }));
    setSelList([]);
  };
  /* 批量导入（P1）：CSV 列 = 企业名称,统一社会信用代码,行业,备注（首行表头跳过） */
  const [impMsg, setImpMsg] = useState('');
  const importRef = useRef<HTMLInputElement>(null);
  const onImportFile = (f: File | undefined) => {
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const lines = String(reader.result ?? '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).slice(1);
      const rows = lines.map((l) => l.split(/[,，]/).map((c) => c.trim()));
      const valid = rows.filter((r) => r[0] || r[1]);
      if (!valid.length) { setImpMsg('未解析到有效企业（需企业名称或统一社会信用代码至少一项）。'); return; }
      updateEnterpriseData((d) => ({
        ...d,
        listEnts: [...valid.map((r, i) => ({
          id: `LB-${Date.now().toString(36).toUpperCase()}${i}`, name: r[0] || r[1],
          list: tab as 'black' | 'white' | 'gray', reason: r[3] || '批量导入', source: '批量导入',
          addedAt: today, operator: '当前用户', status: '生效' as ListEnt['status'],
        })), ...d.listEnts],
        opLogs: appendOpLog(d.opLogs, { module: '名单管理', type: '批量导入', target: `${valid.length} 家企业`, detail: `导入到${LIST_LABEL[tab]}名单` }),
      }));
      setImpMsg(`成功导入 ${valid.length} 家（跳过 ${lines.length - valid.length} 行无效）。`);
    };
    reader.readAsText(f);
  };
  /* 到期自动移除（P0-4）：临时名单到期且开启自动移除 → 置失效并留痕 */
  const today = new Date().toISOString().slice(0, 10);
  useEffect(() => {
    const due = ent.listEnts.some((l) => l.status === '生效' && l.autoExpire && l.expireAt && l.expireAt <= today);
    if (!due) return;
    updateEnterpriseData((d) => ({ ...d,
      listEnts: d.listEnts.map((l) =>
        (l.status === '生效' && l.autoExpire && l.expireAt && l.expireAt <= today)
          ? { ...l, status: '失效' as ListEnt['status'], flowLogs: appendLog(l.flowLogs, '到期自动移除', '系统', `名单有效期至 ${l.expireAt} 已到期`) }
          : l),
      opLogs: appendOpLog(d.opLogs, { module: '名单管理', type: '自动移除', target: d.listEnts.find((l) => l.status === '生效' && l.autoExpire && l.expireAt && l.expireAt <= today)?.name ?? '—', detail: '临时名单到期自动置失效' }, '系统'),
    }));
  }, [ent.listEnts]); // eslint-disable-line react-hooks/exhaustive-deps
  const nearExpire = ent.listEnts.filter((l) => l.status === '生效' && l.autoExpire && l.expireAt && l.expireAt > today && l.expireAt <= today.slice(0, 7) + '-99').length;
  const doAdd = () => {
    if (!draft.name.trim()) return;
    const name = draft.name.trim();
    updateEnterpriseData((d) => ({
      ...d,
      listEnts: [{
        id: `LB-${Date.now().toString(36).toUpperCase()}`, name, list: draft.list,
        reason: draft.reason.trim() || '手工添加', source: draft.source, addedAt: today,
        operator: '当前用户', status: '生效' as ListEnt['status'],
        ...(draft.expireAt ? { expireAt: draft.expireAt, autoExpire: draft.autoExpire } : {}),
      }, ...d.listEnts],
      opLogs: appendOpLog(d.opLogs, { module: '名单管理', type: '新增', target: name, detail: `加入${draft.list === 'black' ? '黑' : draft.list === 'white' ? '白' : '灰'}名单${draft.expireAt ? `（临时名单，${draft.autoExpire ? '到期自动移除' : '手动移除'}）` : '（永久名单）'}` }),
    }));
    setNewOpen(false); setDraft({ name: '', list: 'black', reason: '', source: '手工添加', expireAt: '', autoExpire: false });
  };
  const filtered = ent.listEnts.filter((l) => l.list === tab && (!fs || (l.flowState ?? l.status) === fs));
  const rows: Row[] = filtered.map((l) => ({
    id: l.id, name: l.name, reason: l.reason, source: l.source, addedAt: l.addedAt, operator: l.operator,
    expireAt: l.expireAt ? `${l.expireAt}${l.autoExpire ? '·自动' : ''}` : '永久',
    flowState: l.flowState ?? l.status, flowStateAt: l.flowStateAt ?? '',
  }));
  const baseCols: Column[] = [
    { key: 'name', label: '企业名称', type: 'text', width: '240px', fixed: 'left' },
    { key: 'reason', label: '加入原因', type: 'text', width: '280px' },
    { key: 'source', label: '来源', type: 'text', width: '100px' },
    { key: 'addedAt', label: '加入时间', type: 'text', width: '110px' },
    { key: 'expireAt', label: '有效期', type: 'text', width: '110px' },
    { key: 'operator', label: '操作人', type: 'text', width: '90px' },
  ];
  const cols: Column[] = [
    ...baseCols,
    ...flowColumns({ pageRoute: '/console/ep/list-manage', pageFlow, sampleFile: 'enterpriseData.json.listEnts', onStateChange: (r, next, at) => setListFlow(String(r.id), next, at) }),
  ];
  const cnt = (t: 'black' | 'white' | 'gray') => ent.listEnts.filter((l) => l.list === t).length;
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="名单管理" crumb={`${CRUMB} / 名单管理`}
        subtitle="企业黑白灰名单：黑名单拦截、白名单放行、灰名单预警；临时名单支持到期自动移除"
        actions={<><Sam value="enterpriseData.json.listEnts" /><Cal label="实时统计" /><Button size="sm" variant="primary" onClick={() => setNewOpen(true)}>＋ 新增名单</Button></>} />
      {nearExpire > 0 && (
        <div style={{ marginBottom: 12, padding: '8px 14px', borderRadius: 8, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 12, color: '#92400E' }}>
          ⏰ 有 <b>{nearExpire}</b> 条临时名单将于本月到期（到期自动移除），请及时复核企业风险是否解除。
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="黑名单" value={String(cnt('black'))} accent="rose" />
        <StatCard label="白名单" value={String(cnt('white'))} accent="emerald" />
        <StatCard label="灰名单" value={String(cnt('gray'))} accent="brand" />
      </div>
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E2E8F0', marginBottom: 14 }}>
        {(['black', 'white', 'gray'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '8px 16px', fontSize: 13, border: 'none', background: 'none', cursor: 'pointer', color: tab === t ? '#0EA5E9' : '#64748B', fontWeight: tab === t ? 700 : 400, borderBottom: tab === t ? '2px solid #0EA5E9' : '2px solid transparent', marginBottom: -1 }}>
            {LIST_LABEL[t]}（{cnt(t)}）
          </button>
        ))}
      </div>
      <Panel title={`${LIST_LABEL[tab]}列表`} desc={<span>名单明细 · <Sam value="enterpriseData.json" /></span>}
        actions={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <FlowStateFilter pageRoute="/console/ep/list-manage" value={fs} onChange={setFs} />
          <Button size="sm" variant="secondary" onClick={() => importRef.current?.click()}>导入名单</Button>
          <input ref={importRef} type="file" accept=".csv" className="hidden" onChange={(e) => { onImportFile(e.target.files?.[0]); e.target.value = ''; }} />
          {impMsg && <span style={{ fontSize: 12, color: '#059669' }}>{impMsg}</span>}
          {selList.length > 0 && (
            <>
              <Button size="sm" variant="secondary" onClick={batchExpire}>批量失效（{selList.length}）</Button>
              <Button size="sm" variant="ghost" onClick={() => setSelList([])}>取消选择</Button>
            </>
          )}
        </div>}>
        <DataTable columns={cols} rows={rows} empty="该名单暂无企业" pager defaultPageSize={10} exportable exportName="名单管理"
          selectable selected={selList} onSelectChange={setSelList}
          actions={(r) => {
            const l = ent.listEnts.find((x) => x.id === String(r.id));
            return (
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => { if (l) { setQiyeSelected(l.name, l.id); nav('/console/ep/qiye-profile'); } }}
                  style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看档案</button>
              </div>
            );
          }} />
      </Panel>
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="新增名单">
        <div className="space-y-3">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="企业名称" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          <SingleSelect label="名单类型" fullWidth value={draft.list} onChange={(v) => setDraft({ ...draft, list: v as 'black' | 'white' | 'gray' })}
            options={[{ value: 'black', label: '黑名单（拦截）' }, { value: 'white', label: '白名单（放行）' }, { value: 'gray', label: '灰名单（预警）' }]} />
          <input value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} placeholder="加入原因" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          <SingleSelect label="来源" fullWidth value={draft.source} onChange={(v) => setDraft({ ...draft, source: v })}
            options={[{ value: '手工添加', label: '手工添加' }, { value: '规则命中', label: '规则命中' }, { value: '尽调命中', label: '尽调命中' }, { value: '模型命中', label: '模型命中' }]} />
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">有效期（可空 = 永久名单）</span>
            <input type="date" value={draft.expireAt} onChange={(e) => setDraft({ ...draft, expireAt: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" className="accent-blue-600" checked={draft.autoExpire} onChange={(e) => setDraft({ ...draft, autoExpire: e.target.checked })} />
            到期自动移除（临时名单）
          </label>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setNewOpen(false)}>取消</Button>
          <Button size="sm" variant="primary" onClick={doAdd} disabled={!draft.name.trim()}>确认新增</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ 数据源市场与管理 ============ */
export function EntDataSource() {
  const ent = useEnterpriseData();
  const [dsSel, setDsSel] = useState<{ id: string; name: string; category: string; desc: string; status: string; vendor: string; cost?: string; updatedAt: string } | null>(null);
  const [testId, setTestId] = useState('');
  const [testRes, setTestRes] = useState<string | null>(null);
  /* 数据质量示意（P1-3）：按数据源 id 稳定模拟近 7 天调用量/失败率/空值占比 */
  const seedOf = (id: string) => { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 997; return h; };
  const q = dsSel
    ? { calls: 1500 + seedOf(dsSel.id) * 37, fail: 1 + (seedOf(dsSel.id) % 4), empty: seedOf(dsSel.id) % 7, days: [0, 1, 2, 3, 4, 5, 6].map((d) => 180 + ((seedOf(dsSel.id) + d * 53) % 160)) }
    : { calls: 0, fail: 0, empty: 0, days: [] };
  const doTest = () => {
    if (!testId.trim()) { setTestRes('请输入企业名称或统一社会信用代码后重试。'); return; }
    const ok = seedOf(testId.trim()) % 10 !== 0;
    setTestRes(ok
      ? `HTTP 200 · 命中 12 条记录 · 耗时 ${80 + (seedOf(testId.trim()) % 120)}ms\n示例字段：企业名称、统一社会信用代码、经营状态=存续、法定代表人、注册资本、成立日期`
      : `HTTP 502 · 上游数据源超时（连续失败，请检查接入配置或联系供应商）`);
  };
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
        <StatCard label="已接入" value={String(ent.dataSources.filter((s) => s.status === '已接入').length)} accent="emerald" />
        <StatCard label="测试中" value={String(ent.dataSources.filter((s) => s.status === '测试中').length)} accent="amber" />
        <StatCard label="未接入" value={String(ent.dataSources.filter((s) => s.status === '未接入').length)} accent="brand" />
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
      <Modal open={dsSel != null} onClose={() => { setDsSel(null); setTestRes(null); setTestId(''); }} title={`数据源详情 · ${dsSel?.name ?? ''}`} width="max-w-2xl">
        {dsSel && (
          <>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">分类</span><b>{dsSel.category}</b></div>
              <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">接入状态</span><b>{dsSel.status}</b></div>
              <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">供应商</span><b>{dsSel.vendor}</b></div>
              <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">计费</span><b>{dsSel.cost ?? '—'}</b></div>
              <div className="flex justify-between border-b border-slate-50 py-1.5"><span className="text-slate-500">更新时间</span><b>{dsSel.updatedAt}</b></div>
              <div className="py-1.5"><span className="text-slate-500">说明</span><p className="mt-1 text-slate-700">{dsSel.desc}</p></div>
            </div>

            {/* 数据质量监控（P1-3） */}
            <div style={{ marginTop: 14, padding: 12, borderRadius: 10, background: '#F8FAFC', border: '1px solid #EEF2F6' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>数据质量（近 7 天） <Cal label="实时统计" /></div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 10 }}>
                <div style={{ background: '#fff', border: '1px solid #EEF2F6', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, color: '#64748B' }}>累计调用</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>{q.calls.toLocaleString()}</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #EEF2F6', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, color: '#64748B' }}>失败率</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: q.fail >= 3 ? '#DC2626' : '#059669' }}>{q.fail}%</div>
                </div>
                <div style={{ background: '#fff', border: '1px solid #EEF2F6', borderRadius: 8, padding: '8px 10px' }}>
                  <div style={{ fontSize: 11, color: '#64748B' }}>空值占比</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: q.empty >= 5 ? '#B45309' : '#059669' }}>{q.empty}%</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 10, height: 56 }}>
                {q.days.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                    <div style={{ width: '100%', background: '#BFDBFE', borderRadius: '3px 3px 0 0', height: `${(v / 340) * 44}px`, minHeight: 4 }} />
                    <span style={{ fontSize: 9, color: '#94A3B8' }}>{i === 6 ? '今' : `-${6 - i}`}</span>
                  </div>
                ))}
              </div>
              {q.fail >= 3 && (
                <div style={{ marginTop: 8, padding: '6px 10px', borderRadius: 6, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 11, color: '#B91C1C' }}>
                  ⚠ 失败率偏高（≥3%），建议检查接口配置；连续失败将触发异常告警（待接入消息推送）。
                </div>
              )}
            </div>

            {/* 测试调试（P1-3） */}
            <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: '#F8FAFC', border: '1px solid #EEF2F6' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>接口测试调试</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={testId} onChange={(e) => setTestId(e.target.value)} placeholder="输入企业名称 / 统一社会信用代码实时调试"
                  style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, outline: 'none' }} />
                <Button size="sm" variant="primary" onClick={doTest}>测试调试</Button>
              </div>
              {testRes && (
                <pre style={{ marginTop: 8, padding: 8, borderRadius: 6, background: '#0F172A', color: testRes.startsWith('HTTP 200') ? '#4ADE80' : '#F87171', fontSize: 11, whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace' }}>{testRes}</pre>
              )}
            </div>
          </>
        )}
        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="secondary" onClick={() => { setDsSel(null); setTestRes(null); setTestId(''); }}>关闭</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ 预警规则配置 ============ */
export function EntAlertRule() {
  const ent = useEnterpriseData();
  const [newOpen, setNewOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [draft, setDraft] = useState({ name: '', category: '司法涉诉', condition: '', level: '中', action: '' });
  const toggle = (id: string) => updateEnterpriseData((d) => ({ ...d,
    alertRules: d.alertRules.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)),
    opLogs: appendOpLog(d.opLogs, { module: '预警规则', type: '启停', target: d.alertRules.find((r) => r.id === id)?.name ?? '—', detail: d.alertRules.find((r) => r.id === id)?.enabled ? '停用' : '启用' }),
  }));
  const copyRule = (id: string) => updateEnterpriseData((d) => {
    const src = d.alertRules.find((r) => r.id === id);
    if (!src) return d;
    return { ...d, alertRules: [{ ...src, id: `ER-${Date.now().toString(36).toUpperCase()}`, name: `${src.name}（副本）`, enabled: true }, ...d.alertRules],
      opLogs: appendOpLog(d.opLogs, { module: '预警规则', type: '复制', target: src.name, detail: '复制生成副本' }) };
  });
  const add = () => updateEnterpriseData((d) => ({
    ...d,
    alertRules: [...d.alertRules, { id: `ER-${Date.now().toString(36).toUpperCase()}`, name: draft.name || '未命名规则', category: draft.category, condition: draft.condition || '自定义条件', level: draft.level as any, action: draft.action || '人工核实', enabled: true }],
    opLogs: appendOpLog(d.opLogs, { module: '预警规则', type: '新增', target: draft.name || '未命名规则', detail: `${draft.category} · 等级 ${draft.level}` }),
  }));
  /* 批量启停（P1） */
  const [selRule, setSelRule] = useState<string[]>([]);
  const batchToggleRule = () => {
    updateEnterpriseData((d) => ({ ...d,
      alertRules: d.alertRules.map((r) => selRule.includes(r.id) ? { ...r, enabled: !r.enabled } : r),
      opLogs: appendOpLog(d.opLogs, { module: '预警规则', type: '批量', target: `选中 ${selRule.length} 条`, detail: '批量切换启用/停用' }),
    }));
    setSelRule([]);
  };
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
        <StatCard label="启用" value={String(ent.alertRules.filter((r) => r.enabled).length)} accent="emerald" />
        <StatCard label="高风险" value={String(ent.alertRules.filter((r) => r.level === '高').length)} accent="rose" />
        <StatCard label="已停用" value={String(ent.alertRules.filter((r) => !r.enabled).length)} accent="brand" />
      </div>
      <Panel title="预警规则" desc={<span>企业预警规则 · <Cal label="实时统计" /></span>}
        actions={selRule.length > 0 ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <Button size="sm" variant="primary" onClick={batchToggleRule}>批量启停（{selRule.length}）</Button>
            <Button size="sm" variant="ghost" onClick={() => setSelRule([])}>取消选择</Button>
          </div>
        ) : undefined}>
        <DataTable columns={cols} rows={rows} empty="暂无规则" pager defaultPageSize={10} exportable exportName="预警规则"
          selectable selected={selRule} onSelectChange={setSelRule}
          actions={(r) => { const rule = ent.alertRules.find((x) => x.id === String(r.id)); return (
            <div style={{ display: 'flex', gap: 6 }}>
              <Button size="sm" variant="ghost" onClick={() => copyRule(String(r.id))}>复制</Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmId(String(r.id))}>{rule?.enabled ? '停用' : '启用'}</Button>
            </div>
          ); }} />
      </Panel>
      <Modal open={confirmId != null} onClose={() => setConfirmId(null)} title="操作确认">
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.7 }}>
          {(() => {
            const rule = ent.alertRules.find((x) => x.id === confirmId);
            if (!rule) return null;
            return <span>确定要<b>{rule.enabled ? '停用' : '启用'}</b>预警规则「{rule.name}」吗？{rule.enabled ? '停用后该规则将不再产生新预警。' : '启用后该规则立即生效。'}</span>;
          })()}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setConfirmId(null)}>取 消</Button>
          <Button size="sm" variant="primary" onClick={() => { if (confirmId) toggle(confirmId); setConfirmId(null); }}>确 定</Button>
        </div>
      </Modal>
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="新增预警规则">
        <div className="space-y-3">
          <input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="规则名称" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          <SingleSelect label="选择分类" fullWidth value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })}
            options={[{ value: '司法涉诉', label: '司法涉诉' }, { value: '经营异常', label: '经营异常' }, { value: '舆情负面', label: '舆情负面' }, { value: '财务恶化', label: '财务恶化' }, { value: '关联风险', label: '关联风险' }, { value: '税务', label: '税务' }]} />
          <input value={draft.condition} onChange={(e) => setDraft({ ...draft, condition: e.target.value })} placeholder="触发条件" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400" />
          <SingleSelect label="选择等级" fullWidth value={draft.level} onChange={(v) => setDraft({ ...draft, level: v })}
            options={[{ value: '高', label: '高' }, { value: '中', label: '中' }, { value: '低', label: '低' }]} />
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
  const pageFlow = usePageFlow('/console/ep/alert-workbench');
  const [lvl, setLvl] = useState('');
  const [fs, setFs] = useState('');
  const [logSel, setLogSel] = useState<EntAlert | null>(null);
  const filtered = ent.alerts.filter((a) => (!lvl || a.level === lvl) && (!fs || a.flowState === fs));
  const lc = { RED: 0, YELLOW: 0, OPPORTUNITY: 0 };
  ent.alerts.forEach((a) => { lc[a.level] = (lc[a.level] ?? 0) + 1; });
  const rows: Row[] = filtered.map((a) => ({
    id: a.id, id2: a.id, entName: a.entName, category: { v: a.category, kind: 'blue' },
    ruleName: a.ruleName, level: { v: a.level === 'RED' ? '红灯' : a.level === 'YELLOW' ? '黄灯' : '机会', kind: ALERT_KIND[a.level] },
    detail: a.detail, alert_date: a.alert_date, status: { v: a.status, kind: a.status === '待处置' ? 'red' : a.status === '核实中' ? 'amber' : 'green' },
    flowState: a.flowState ?? '', flowStateAt: a.flowStateAt ?? '',
  }));
  const setAlertFlow = (id: string, next: string, at: string) =>
    updateEnterpriseData((d) => ({
      ...d,
      alerts: d.alerts.map((a) => a.id === id ? { ...a, flowState: next, flowStateAt: at, flowLogs: appendLog(a.flowLogs, next) } : a),
    }));
  /* 批量结案（P1）：选中预警直接标记已处置 + 已结案并留痕 */
  const [selAlert, setSelAlert] = useState<string[]>([]);
  const batchClose = () => {
    updateEnterpriseData((d) => ({ ...d,
      alerts: d.alerts.map((a) => selAlert.includes(a.id) ? { ...a, status: '已处置' as EntAlert['status'], flowState: '已结案', flowStateAt: nowStamp(), flowLogs: appendLog(a.flowLogs, '批量结案', '当前用户', '批量标记已处置') } : a),
      opLogs: appendOpLog(d.opLogs, { module: '预警处置', type: '批量', target: `选中 ${selAlert.length} 条`, detail: '批量结案（标记已处置）' }),
    }));
    setSelAlert([]);
  };
  const cols: Column[] = [
    { key: 'id2', label: '预警ID', type: 'text', width: '110px', fixed: 'left' },
    { key: 'entName', label: '企业', type: 'text', width: '200px' },
    { key: 'category', label: '预警分类', type: 'badge', badgeKind: 'blue', width: '110px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'gray', width: '80px' },
    { key: 'detail', label: '预警内容', type: 'text', width: '220px' },
    { key: 'alert_date', label: '预警时间', type: 'text', width: '140px' },
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
        <StatCard label="待处置" value={String(ent.alerts.filter((a) => a.status === '待处置').length)} accent="rose" />
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12, fontSize: 11, color: '#475569' }}>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#FEF2F2', border: '1px solid #FECACA', color: '#B91C1C' }}>🔴 红灯 = 高风险：立即暂停业务，人工强制研判</span>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}>🟡 黄灯 = 中风险：审慎办理，补充尽调</span>
        <span style={{ padding: '4px 10px', borderRadius: 999, background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46' }}>🟢 机会 = 低风险正向信号（利好舆情/新增资质/政府扶持）：仅提示，无需拦截</span>
      </div>
      <Panel title="企业预警队列" desc={<span>筛选后 <b>{filtered.length}</b> 条 · <Cal label="实时过滤" /></span>}
        actions={<div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <FlowStateFilter pageRoute="/console/ep/alert-workbench" value={fs} onChange={setFs} />
          <SingleSelect label="全部等级" clearable value={lvl} onChange={setLvl}
            options={[{ value: '', label: '全部等级' }, { value: 'RED', label: '红灯' }, { value: 'YELLOW', label: '黄灯' }, { value: 'OPPORTUNITY', label: '机会' }]} />
          {selAlert.length > 0 && (
            <>
              <Button size="sm" variant="primary" onClick={batchClose}>批量结案（{selAlert.length}）</Button>
              <Button size="sm" variant="ghost" onClick={() => setSelAlert([])}>取消选择</Button>
            </>
          )}
        </div>}>
        <DataTable columns={cols} rows={rows} empty="无匹配预警" pager defaultPageSize={10} exportable exportName="企业预警队列"
          selectable selected={selAlert} onSelectChange={setSelAlert}
          actions={(r) => {
            const a = ent.alerts.find((x) => x.id === String(r.id))!;
            return (
              <div style={{ display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => setLogSel(a)}
                  style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#F8FAFC', color: '#475569', fontSize: 12, cursor: 'pointer' }}>日志</button>
                <button type="button" onClick={() => { setQiyeSelected(a.entName, a.entKeyNo ?? ''); nav('/console/ep/qiye-profile'); }}
                  style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看档案</button>
              </div>
            );
          }} />
      </Panel>
      <Modal open={logSel != null} onClose={() => setLogSel(null)} title={`处置流程日志 · ${logSel?.entName ?? ''}`}>
        {logSel && (
          <DataTable columns={[
            { key: 'at', label: '操作时间', width: '180px' },
            { key: 'action', label: '操作动作', width: '150px' },
            { key: 'operator', label: '操作人', width: '120px' },
            { key: 'opinion', label: '操作意见' },
          ]} rows={(logSel.flowLogs ?? []).map((l, i) => ({ id: String(i), at: l.at, action: l.action, operator: l.operator, opinion: l.opinion ?? '—' }))} empty="暂无流程操作记录" pager defaultPageSize={6} />
        )}
        <div className="mt-4 flex justify-end">
          <Button size="sm" variant="secondary" onClick={() => setLogSel(null)}>关闭</Button>
        </div>
      </Modal>
    </div>
  );
}

/* ============ 操作变更日志（P1：名单/规则/监控/尽调写操作追溯） ============ */
export function EntOperateLog() {
  const ent = useEnterpriseData();
  const [mod, setMod] = useState('');
  const MODULES = ['名单管理', '预警规则', '监控名单', '批量尽调'];
  const filtered = ent.opLogs.filter((l) => !mod || l.module === mod);
  const cnt = (m: string) => ent.opLogs.filter((l) => l.module === m).length;
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="操作变更日志" crumb={`${CRUMB} / 系统管理 / 操作变更日志`}
        subtitle="名单 / 预警规则 / 监控名单 / 批量尽调等变更操作追溯，按模块筛选，支持导出"
        actions={<><Sam value="enterpriseData.json.opLogs" /><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="变更记录" value={String(ent.opLogs.length)} accent="brand" />
        <StatCard label="名单管理" value={String(cnt('名单管理'))} accent="rose" />
        <StatCard label="预警规则" value={String(cnt('预警规则'))} accent="amber" />
        <StatCard label="监控名单" value={String(cnt('监控名单'))} accent="cyan" />
        <StatCard label="批量尽调" value={String(cnt('批量尽调'))} accent="violet" />
      </div>
      <Panel title="变更记录" desc={<span>全部写操作留痕（不可删除，最多保留最近 200 条） · <Sam value="enterpriseData.json" /></span>}
        actions={<SingleSelect label="全部模块" clearable value={mod} onChange={setMod}
          options={[{ value: '', label: '全部模块' }, ...MODULES.map((m) => ({ value: m, label: m }))]} />}>
        <DataTable columns={[
          { key: 'at', label: '操作时间', width: '180px' },
          { key: 'module', label: '模块', type: 'badge', badgeKind: 'blue', width: '110px' },
          { key: 'type', label: '操作类型', type: 'badge', badgeKind: 'gray', width: '110px' },
          { key: 'target', label: '操作对象', width: '240px' },
          { key: 'operator', label: '操作人', width: '120px' },
          { key: 'detail', label: '变更说明' },
        ]} rows={filtered.map((l, i) => ({
          id: String(i), at: l.at,
          module: { v: l.module, kind: 'blue' as const }, type: { v: l.type, kind: 'gray' as const },
          target: l.target, operator: l.operator, detail: l.detail ?? '—',
        }))} empty="暂无变更记录" pager defaultPageSize={15} exportable exportName="操作变更日志" />
      </Panel>
    </div>
  );
}

/* ============ 风险待办提醒中心（P1：超时/待复核/待处置/到期聚合） ============ */
export function EntTodoCenter() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const today = new Date().toISOString().slice(0, 10);
  const pendingReview = ent.decisionEvents.filter((d) => d.status === '待复核' || d.flowState === '待复核' || d.status === '复核中');
  const pendingAlert = ent.alerts.filter((a) => a.status === '待处置');
  const doingDue = ent.dueTasks.filter((t) => t.status === '进行中');
  const expireSoon = ent.listEnts.filter((l) => l.status === '生效' && l.autoExpire && l.expireAt && l.expireAt <= today.slice(0, 7) + '-99' && l.expireAt >= today.slice(0, 7) + '-01');
  const total = pendingReview.length + pendingAlert.length + doingDue.length + expireSoon.length;
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="风险待办中心" crumb={`${CRUMB} / 风险驾驶舱 / 风险待办中心`}
        subtitle="聚合待复核决策、待处置预警、进行中尽调与本月到期名单，一处看全，点击直达处理"
        actions={<><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="待复核决策" value={String(pendingReview.length)} accent={pendingReview.length ? 'amber' : 'green'} hint="需人工复核" />
        <StatCard label="待处置预警" value={String(pendingAlert.length)} accent={pendingAlert.length ? 'rose' : 'green'} hint="红灯优先" />
        <StatCard label="进行中尽调" value={String(doingDue.length)} accent="brand" hint="批量任务执行中" />
        <StatCard label="本月到期名单" value={String(expireSoon.length)} accent={expireSoon.length ? 'amber' : 'green'} hint="到期自动移除" />
      </div>
      {total === 0 && <Panel title="待办清单"><div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>🎉 暂无待办，全部处理完毕。</div></Panel>}

      {pendingReview.length > 0 && (
        <Panel className="mb-4" title="待复核决策" desc={<span>进入决策事件列表逐条复核 · <Cal label="实时统计" /></span>}>
          <DataTable columns={[
            { key: 'id2', label: '事件号', width: '120px' },
            { key: 'entName', label: '企业', width: '240px' },
            { key: 'scene', label: '场景', width: '110px' },
            { key: 'result', label: '结果', width: '90px' },
            { key: 'flowState', label: '复核状态', width: '100px' },
            { key: 'decidedAt', label: '决策时间', width: '150px' },
          ]} rows={pendingReview.map((d) => ({ id: d.id, id2: d.id, entName: d.entName, scene: d.scene, result: d.result, flowState: d.flowState ?? d.status, decidedAt: d.decidedAt }))} empty="无" pager defaultPageSize={5}
            actions={() => <Button size="sm" variant="secondary" onClick={() => nav('/console/ep/decision-events')}>去处理 →</Button>} />
        </Panel>
      )}

      {pendingAlert.length > 0 && (
        <Panel className="mb-4" title="待处置预警" desc={<span>红灯预警优先处置 · <Cal label="实时统计" /></span>}>
          <DataTable columns={[
            { key: 'id', label: '预警ID', width: '110px' },
            { key: 'entName', label: '企业', width: '240px' },
            { key: 'ruleName', label: '命中规则', width: '180px' },
            { key: 'lv', label: '等级', width: '90px' },
            { key: 'alert_date', label: '预警时间', width: '150px' },
            { key: 'detail', label: '预警内容' },
          ]} rows={pendingAlert.map((a) => ({ id: a.id, entName: a.entName, ruleName: a.ruleName, lv: a.level === 'RED' ? '红灯' : a.level === 'YELLOW' ? '黄灯' : '机会', alert_date: a.alert_date, detail: a.detail }))} empty="无" pager defaultPageSize={5}
            actions={() => <Button size="sm" variant="secondary" onClick={() => nav('/console/ep/alert-workbench')}>去处理 →</Button>} />
        </Panel>
      )}

      {doingDue.length > 0 && (
        <Panel className="mb-4" title="进行中尽调任务" desc={<span>跟踪任务进度与命中风险 · <Cal label="实时统计" /></span>}>
          <DataTable columns={[
            { key: 'id2', label: '任务号', width: '120px' },
            { key: 'name', label: '任务名称', width: '260px' },
            { key: 'progress', label: '进度', width: '90px' },
            { key: 'hitRisk', label: '命中风险', width: '100px' },
            { key: 'startedAt', label: '开始时间', width: '150px' },
          ]} rows={doingDue.map((t) => ({ id: t.id, id2: t.id, name: t.name, progress: `${t.progress}%`, hitRisk: String(t.hitRisk), startedAt: t.startedAt }))} empty="无" pager defaultPageSize={5}
            actions={() => <Button size="sm" variant="secondary" onClick={() => nav('/console/ep/batch-due')}>去查看 →</Button>} />
        </Panel>
      )}

      {expireSoon.length > 0 && (
        <Panel className="mb-4" title="本月到期临时名单" desc={<span>到期自动移除，请复核企业风险是否解除 · <Cal label="实时统计" /></span>}>
          <DataTable columns={[
            { key: 'name', label: '企业名称', width: '260px' },
            { key: 'list', label: '名单', width: '100px' },
            { key: 'reason', label: '加入原因', width: '300px' },
            { key: 'expireAt', label: '有效期至', width: '120px' },
          ]} rows={expireSoon.map((l) => ({ id: l.id, name: l.name, list: l.list === 'black' ? '黑名单' : l.list === 'white' ? '白名单' : '灰名单', reason: l.reason, expireAt: l.expireAt }))} empty="无" pager defaultPageSize={5}
            actions={() => <Button size="sm" variant="secondary" onClick={() => nav('/console/ep/list-manage')}>去管理 →</Button>} />
        </Panel>
      )}
    </div>
  );
}

/* ============ 数据同步任务管理（P1：同步周期/上次同步/失败企业清单/立即同步） ============ */
export function EntSyncTask() {
  const ent = useEnterpriseData();
  const seedOf = (s: string) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 97; return h; };
  const CYCLE: Record<string, string> = { 工商: '每日 02:00', 司法: '每日 03:00', 税务: '每日 04:00', 征信: '每周一 02:00', 舆情: '每小时', 关联: '每日 01:00', 财务: '每周日 23:00' };
  const [sync, setSync] = useState<Record<string, { last: string; status: string; fail: number }>>({});
  const st = (id: string) => sync[id] ?? (() => {
    const s = ent.dataSources.find((x) => x.id === id);
    return { last: s?.updatedAt ? `${s.updatedAt} 02:00` : '—', status: '正常', fail: seedOf(id) % 3 };
  })();
  const runSync = (id: string) => {
    const name = ent.dataSources.find((x) => x.id === id)?.name ?? id;
    setSync((p) => ({ ...p, [id]: { last: st(id).last, status: '同步中', fail: st(id).fail } }));
    setTimeout(() => {
      setSync((p) => ({ ...p, [id]: { last: new Date().toLocaleString('zh-CN', { hour12: false }), status: '正常', fail: seedOf(id) % 3 } }));
      updateEnterpriseData((d) => ({ ...d, opLogs: appendOpLog(d.opLogs, { module: '数据同步', type: '同步', target: name, detail: '手动触发同步完成' }) }));
    }, 1200);
  };
  const rows: Row[] = ent.dataSources.map((s, i) => {
    const x = st(s.id);
    return {
      id: s.id, name: s.name, category: { v: s.category, kind: 'blue' as const },
      cycle: CYCLE[s.category] ?? '每日', last: x.last, fail: x.fail,
      status: { v: x.status, kind: x.status === '同步中' ? 'amber' as const : x.status === '异常' ? 'red' as const : 'green' as const },
      _i: i,
    };
  });
  const nowSync = Object.values(sync).filter((x) => x.status === '同步中').length;
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="数据同步任务管理" crumb={`${CRUMB} / 数据源市场与管理 / 数据同步任务`}
        subtitle="各数据源同步周期、上次同步时间与失败企业清单，支持手动触发同步"
        actions={<><Sam value="enterpriseData.json.dataSources" /><Cal label="实时统计" /></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="数据源总数" value={String(ent.dataSources.length)} accent="brand" />
        <StatCard label="同步中" value={String(nowSync)} accent="amber" />
        <StatCard label="有失败企业" value={String(ent.dataSources.filter((s) => st(s.id).fail > 0).length)} accent="rose" />
        <StatCard label="已接入" value={String(ent.dataSources.filter((s) => s.status === '已接入').length)} accent="emerald" />
      </div>
      <Panel title="同步任务" desc={<span>点击「立即同步」手动触发（模拟执行 1.2s） · <Cal label="实时统计" /></span>}>
        <DataTable columns={[
          { key: 'name', label: '数据源', width: '220px', fixed: 'left' },
          { key: 'category', label: '分类', type: 'badge', badgeKind: 'blue', width: '90px' },
          { key: 'cycle', label: '同步周期', width: '140px' },
          { key: 'last', label: '上次同步', width: '180px' },
          { key: 'fail', label: '失败企业', width: '90px' },
          { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
        ]} rows={rows} empty="暂无数据源" pager defaultPageSize={10}
          actions={(r) => <Button size="sm" variant="secondary" onClick={() => runSync(String(r.id))} disabled={st(String(r.id)).status === '同步中'}>{st(String(r.id)).status === '同步中' ? '同步中…' : '立即同步'}</Button>} />
        <div style={{ marginTop: 10, fontSize: 12, color: '#94A3B8' }}>失败企业清单：进入「数据源市场与管理 → 查看」查看数据质量明细；连续失败将触发异常告警（待接入消息推送）。</div>
      </Panel>
    </div>
  );
}
