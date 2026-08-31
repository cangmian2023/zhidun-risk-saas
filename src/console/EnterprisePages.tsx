/* 企业风控子系统 · 业务页面（使用域）
 * 模块：一键查询 / 风险画像 / 批量尽调 / 监控名单 / 决策事件 / 模型列表 / 名单管理 / 数据源 / 预警规则 / 预警处置
 * 数据来源：enterpriseData.json（橘 Sam）｜实时统计（灰 Cal）
 */
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable, Button, Badge, Modal, DetailHeader, SingleSelect } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { PageShell } from './PageShell';
import { LineChart } from '../components/charts';
import { useEnterpriseData, updateEnterpriseData, appendLog, appendOpLog, nowTime, updateAlertVerify, type MonitorEnt, type DueTask, type EntAlert } from './enterpriseData';
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
        actions={<><Button size="sm" variant="primary" onClick={() => setNewOpen(true)}>＋ 新建尽调任务</Button></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="任务总数" value={String(ent.dueTasks.length)} accent="brand" />
        <StatCard label="进行中" value={String(ent.dueTasks.filter((t) => t.status === '进行中').length)} accent="amber" />
        <StatCard label="已完成" value={String(ent.dueTasks.filter((t) => t.status === '已完成').length)} accent="emerald" />
        <StatCard label="累计命中风险" value={String(ent.dueTasks.reduce((s, t) => s + t.hitRisk, 0))} accent="rose" />
      </div>
      <Panel title="尽调任务列表" desc={<span>批量尽调任务与进度 · </span>}
        actions={<FlowStateFilter pageRoute="/console/ep/batch-due" value={fs} onChange={setFs} />}>
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
            <SingleSelect label="选择来源" fullWidth value={draft.source} onChange={(v) => setDraft({ ...draft, source: v })}
              options={[{ value: '上传名单', label: '上传名单' }, { value: '接口导入', label: '接口导入' }, { value: '手工录入', label: '手工录入' }]} />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">企业名单（上传名单时使用，支持 .csv）</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="file" accept=".csv" className="text-xs text-slate-500" />
            </div>
            <span style={{ display: 'block', marginTop: 4, fontSize: 11, color: '#94A3B8' }}>名单列：企业名称、统一社会信用代码、行业、备注；名称或信用代码至少一项必填，逐行校验错误行会标红提示。</span>
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
const LINK_BTN = { padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' };
const LINK_BTN2 = { padding: '3px 12px', borderRadius: 6, border: '1px solid #E2E8F0', background: '#fff', color: '#475569', fontSize: 12, cursor: 'pointer' };

export function EntBatchDueDetail() {
  const ent = useEnterpriseData();
  const nav = useNavigate();
  const [params] = useNavParams();
  const task = ent.dueTasks.find((t) => t.id === (params.get('taskId') ?? '')) ?? ent.dueTasks[0];
  const [onlyRisk, setOnlyRisk] = useState(false);
  const [verifyEnt, setVerifyEnt] = useState<MonitorEnt | null>(null);
  if (!task) return <div style={{ padding: 24 }}><PageShell title="批量尽调任务详情" crumb={`${CRUMB} / 企业风险尽调中心 / 批量尽调任务`} subtitle="未找到任务" /></div>;

  // 进行中任务缓慢推进进度（约 2 分钟跑满），完成后落「已完成」+ 完成时间 + 流程日志
  useEffect(() => {
    if (task.status !== '进行中' || task.progress >= 100) return;
    const timer = setInterval(() => {
      updateEnterpriseData((d) => ({
        ...d,
        dueTasks: d.dueTasks.map((x) => {
          if (x.id !== task.id || x.status !== '进行中' || x.progress >= 100) return x;
          const np = Math.min(100, x.progress + 1);
          const finished = np >= 100;
          return {
            ...x, progress: np,
            status: finished ? '已完成' : x.status,
            finishedAt: finished ? nowTime() : x.finishedAt,
            flowLogs: finished ? appendLog(x.flowLogs, '任务执行完成') : x.flowLogs,
          };
        }),
      }));
    }, 1200);
    return () => clearInterval(timer);
  }, [task.id, task.status]);

  const setDueFlow = (next: string, at: string) =>
    updateEnterpriseData((d) => ({ ...d, dueTasks: d.dueTasks.map((t) => t.id === task.id ? { ...t, status: next as DueTask['status'], flowState: next, flowStateAt: at, flowLogs: appendLog(t.flowLogs, next) } : t) }));
  const meta: Record<string, { color: string; soft: string }> = {
    待开始: { color: '#94A3B8', soft: '#F1F5F9' },
    进行中: { color: '#2563EB', soft: '#DBEAFE' },
    已完成: { color: '#059669', soft: '#D1FAE5' },
    失败: { color: '#E11D48', soft: '#FFE4E6' },
  };
  const m = meta[task.status] ?? meta.待开始;

  // 任务企业档案（全部 / 仅命中风险），每行可查看档案 + 核验预警
  const ents = ent.monitorList.filter((x) => (onlyRisk ? x.riskLevel === '高' || x.riskLevel === '中' : true));
  const rows: Row[] = ents.map((e) => {
    const a = ent.alerts.filter((al) => al.entName === e.name);
    return {
      id: e.keyNo, name: e.name, industry: e.industry,
      riskLevel: { v: e.riskLevel, kind: e.riskLevel === '高' ? 'red' : e.riskLevel === '中' ? 'amber' : 'green' },
      hitRule: a.length ? a.map((x) => x.ruleName).slice(0, 2).join(' / ') : '—',
      verifyDone: String(a.filter((x) => x.verifyState === '已核验').length),
    };
  });
  const cols: Column[] = [
    { key: 'name', label: '企业名称', type: 'text', width: '280px' },
    { key: 'industry', label: '行业', type: 'text', width: '200px' },
    { key: 'riskLevel', label: '风险等级', type: 'badge', badgeKind: 'gray', width: '110px' },
    { key: 'hitRule', label: '命中风险项', type: 'text', width: '260px' },
    { key: 'verifyDone', label: '已核验', type: 'text', width: '90px' },
  ];
  const viewArchive = (e: MonitorEnt) => { setQiyeSelected(e.name, e.keyNo); nav('/console/ep/qiye-profile'); };

  // 数据核验弹窗：企业预警内容 + 核验流程（由管理中心「企业风险数据核验」业务流程驱动）
  const verifyAlerts = verifyEnt ? ent.alerts.filter((a) => a.entName === verifyEnt.name) : [];
  const verifyCols: Column[] = [
    { key: 'alert_date', label: '预警时间', type: 'text', width: '150px' },
    { key: 'ruleName', label: '命中规则', type: 'text', width: '180px' },
    { key: 'lv', label: '等级', type: 'badge', badgeKind: 'gray', width: '100px' },
    { key: 'detail', label: '预警内容', type: 'text' },
    { key: 'status', label: '处置状态', type: 'badge', badgeKind: 'gray', width: '100px' },
  ];
  const verifyRows: Row[] = verifyAlerts.map((a) => ({
    id: a.id, alert_date: a.alert_date, ruleName: a.ruleName,
    lv: { v: a.level === 'RED' ? '红灯' : a.level === 'YELLOW' ? '黄灯' : '机会', kind: a.level === 'RED' ? 'red' : a.level === 'YELLOW' ? 'amber' : 'cyan' },
    detail: a.detail,
    status: { v: a.status, kind: a.status === '待处置' ? 'red' : a.status === '核实中' ? 'amber' : 'green' },
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="批量尽调任务详情" crumb={`${CRUMB} / 企业风险尽调中心 / 批量尽调任务 / ${task.name}`}
        subtitle="任务进度监控与任务企业档案、风险数据核验"
        actions={<><Button size="sm" variant="secondary" onClick={() => nav('/console/ep/batch-due')}>← 返回任务列表</Button></>} />

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

      {/* 任务进度（进行中实时推进） */}
      <Panel title="任务进度" desc={<span>批量尽调执行进度（进行中实时推进） · </span>}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: '#475569' }}>{task.status === '进行中' ? '批量查询执行中…' : task.status === '已完成' ? '任务已完成' : task.status === '失败' ? '任务执行失败' : '任务待开始'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: m.color }}>{task.progress}%</span>
            </div>
            <div style={{ height: 12, borderRadius: 6, background: '#F1F5F9', overflow: 'hidden' }}>
              <div style={{ width: `${task.progress}%`, height: '100%', borderRadius: 6, background: m.color, transition: 'width 0.8s ease' }} />
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

      {/* 任务企业档案（全部 / 仅命中风险）+ 查看档案 + 核验 */}
      <Panel title="任务企业档案" desc={<span>本任务覆盖的企业（可筛选命中风险）；查看档案 / 对预警项做数据核验 · </span>}
        actions={
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={() => setOnlyRisk(false)} style={{ ...LINK_BTN2, borderColor: !onlyRisk ? '#1D4ED8' : '#E2E8F0', color: !onlyRisk ? '#1D4ED8' : '#475569', background: !onlyRisk ? '#EFF6FF' : '#fff' }}>全部</button>
            <button onClick={() => setOnlyRisk(true)} style={{ ...LINK_BTN2, borderColor: onlyRisk ? '#DC2626' : '#E2E8F0', color: onlyRisk ? '#DC2626' : '#475569', background: onlyRisk ? '#FEF2F2' : '#fff' }}>仅命中风险</button>
          </div>
        }>
        <DataTable columns={cols} rows={rows} empty="暂无企业" pager defaultPageSize={8}
          actions={(r) => {
            const e = ent.monitorList.find((x) => x.keyNo === String(r.id));
            if (!e) return null;
            const hasAlerts = ent.alerts.some((a) => a.entName === e.name);
            return (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <button onClick={() => viewArchive(e)} style={LINK_BTN}>查看档案</button>
                {hasAlerts
                  ? <button onClick={() => setVerifyEnt(e)} style={LINK_BTN2}>核验</button>
                  : <span style={{ fontSize: 12, color: '#94A3B8' }}>无预警</span>}
              </div>
            );
          }} />
      </Panel>

      {/* 流程日志 */}
      <Panel title="流程日志" desc={<span>任务流程操作留痕（不可删除） · </span>}>
        <DataTable columns={[
          { key: 'at', label: '操作时间', width: '180px' },
          { key: 'action', label: '操作动作', width: '160px' },
          { key: 'operator', label: '操作人', width: '140px' },
          { key: 'opinion', label: '操作意见' },
        ]} rows={(task.flowLogs ?? []).map((l, i) => ({ id: String(i), at: l.at, action: l.action, operator: l.operator, opinion: l.opinion ?? '—' }))} empty="暂无流程操作记录" pager defaultPageSize={6} />
      </Panel>

      {/* 数据核验弹窗 */}
      <Modal open={!!verifyEnt} onClose={() => setVerifyEnt(null)} title={verifyEnt ? `企业风险数据核验 · ${verifyEnt.name}` : '数据核验'} width="max-w-4xl">
        {verifyEnt && (
          <div>
            <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13, color: '#475569', flexWrap: 'wrap' }}>
              <span>风险等级：<b style={{ color: verifyEnt.riskLevel === '高' ? '#DC2626' : verifyEnt.riskLevel === '中' ? '#D97706' : '#059669' }}>{verifyEnt.riskLevel}</b></span>
              <span>预警总数：<b>{verifyAlerts.length}</b></span>
              <span>已核验：<b style={{ color: '#059669' }}>{verifyAlerts.filter((a) => a.verifyState === '已核验').length}</b></span>
            </div>
            <DataTable columns={verifyCols} rows={verifyRows} empty="该企业暂无预警" pager defaultPageSize={8}
              actions={(r) => {
                const a = verifyAlerts.find((x) => x.id === String(r.id));
                if (!a) return null;
                return (
                  <FlowStateCell
                    flowId="f-ep-verify"
                    state={a.verifyState ?? ''}
                    matchObj={{ level: a.level, alert_type: a.category }}
                    onChange={(next) => updateAlertVerify(a.entName, a.id, next, nowStamp())}
                    buttonOnly
                  />
                );
              }} />
          </div>
        )}
      </Modal>
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
        actions={<></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="监控中企业" value={String(ent.monitorList.filter((m) => m.status === '监控中').length)} accent="brand" />
        <StatCard label="高风险" value={String(ent.monitorList.filter((m) => m.riskLevel === '高').length)} accent="rose" />
        <StatCard label="中风险" value={String(ent.monitorList.filter((m) => m.riskLevel === '中').length)} accent="amber" />
        <StatCard label="累计预警" value={String(ent.monitorList.reduce((s, m) => s + m.alerts, 0))} accent="violet" />
      </div>
      <Panel title="监控名单" desc={<span>存量企业监控 · </span>}
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
        actions={<></>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="决策事件" value={String(ent.decisionEvents.length)} accent="brand" />
        <StatCard label="通过" value={String(ent.decisionEvents.filter((d) => d.result === '通过').length)} accent="emerald" />
        <StatCard label="拒绝" value={String(ent.decisionEvents.filter((d) => d.result === '拒绝').length)} accent="rose" />
        <StatCard label="转人工" value={String(ent.decisionEvents.filter((d) => d.result === '转人工').length)} accent="amber" />
      </div>
      <Panel title="决策事件" desc={<span>决策事件队列 · </span>}
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

      <Panel className="mb-4" title="决策摘要" desc={<span> 决策事件核心信息</span>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 24px', fontSize: 13 }}>
          {summary.map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
              <span style={{ color: '#94A3B8' }}>{k}</span>
              <span style={{ color: '#334155', fontWeight: 500, textAlign: 'right', maxWidth: '70%' }}>{v}</span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="mb-4" title="关联风险视图" desc={<span>该企业的监控与名单状态 · </span>}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 13, alignItems: 'center' }}>
          <span style={{ padding: '4px 12px', borderRadius: 8, background: '#F1F5F9', color: '#475569' }}>监控名单：{mon ? `${mon.riskLevel} · ${mon.status}` : '未监控'}</span>
          <button type="button" onClick={() => { setQiyeSelected(ev.entName, ev.entKeyNo); nav('/console/ep/qiye-search'); }}
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

      <Panel className="mb-4" title="流程日志" desc={<span>复核流程操作留痕（不可删除） · </span>}>
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
        actions={<><Button size="sm" variant="secondary" onClick={() => window.history.back()}>← 返回模型列表</Button></>} />
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
          <Panel title="特征因子权重" desc={<span>模型特征与权重 · </span>}>
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
          <Panel title="运营趋势" >
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
        <Panel title="评分阈值" desc="分数区间 → 等级 → 含义 → 建议动作" >
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


export function EntArchive() {
  return <QiyeProfile />;
}

/* ============ 操作变更日志（P1：名单/规则/监控/尽调写操作追溯） ============ */
export function EntOperateLog() {
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="操作变更日志" crumb={`${CRUMB} / 规划中 / 操作变更日志`}
        subtitle="本页面需求尚未明确，整体规划中" />
      <Panel title="规划中">
        <div style={{ padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>操作变更日志功能规划中，需求待定。</div>
      </Panel>
    </div>
  );
}

/* ============ 数据同步任务管理（P1：同步周期/上次同步/失败企业清单/立即同步） ============ */
