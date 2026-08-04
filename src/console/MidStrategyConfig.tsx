// ③ 监控策略配置（管理中心 · 贷中监控配置）— 三个 tab：监控任务 / 预警规则 / 处置策略
import { useState } from 'react';
import { PageHeader, Panel, Button, DataTable } from '../components/ui';
import type { Column } from '../components/ui';
import { useMidMetrics, useMidStrategy, updateStrategy, midNewId, useMidSaveStatus } from './midStore';
import { MidSaveToast, Cfg, Cal } from './SourceTag';
import type { MidTask, MidRule, MidDispose, TaskFrequency, OutputWay, RuleOp, AlertLevel } from './midData';

const FREQ_LABEL: Record<TaskFrequency, string> = { daily: '每日', weekly: '每周', monthly: '每月' };
const OUT_LABEL: Record<OutputWay, string> = { api: 'API', url: 'URL推送', file: '文件交换', web: '网页下载' };
const OP_LABEL: Record<RuleOp, string> = { gt: '>', gte: '≥', lt: '<', lte: '≤', eq: '=', neq: '≠' };
const LEVEL_LABEL: Record<AlertLevel, string> = { RED: '红灯', YELLOW: '黄灯', OPPORTUNITY: '机会信号' };
const ACTIONS = ['关注', '预催', '降额', '冻结', '止付', '促活', '提额'];
const SYSTEMS = ['核心信贷系统', '催收系统', '营销系统', '触达平台', '工单系统', '审批流'];
const ASSIGNS = ['风控专员', '客户经理', '风控主管', '催收专员'];

type TabKey = 'task' | 'rule' | 'dispose';

export default function MidStrategyConfig() {
  const metrics = useMidMetrics();
  const strategy = useMidStrategy();
  const saveStatus = useMidSaveStatus();
  const [tab, setTab] = useState<TabKey>('task');
  const [draft, setDraft] = useState<MidTask | MidRule | MidDispose | null>(null);

  const metricName = (id: string) => metrics.find((m) => m.id === id)?.name ?? id;

  const save = (next: MidTask | MidRule | MidDispose) => {
    if (tab === 'task') updateStrategy((s) => ({ ...s, tasks: s.tasks.map((t) => (t.id === next.id ? next as MidTask : t)) }));
    if (tab === 'rule') updateStrategy((s) => ({ ...s, rules: s.rules.map((r) => (r.id === next.id ? next as MidRule : r)) }));
    if (tab === 'dispose') updateStrategy((s) => ({ ...s, disposes: s.disposes.map((d) => (d.id === next.id ? next as MidDispose : d)) }));
  };

  const remove = (id: string) => {
    if (tab === 'task') updateStrategy((s) => ({ ...s, tasks: s.tasks.filter((t) => t.id !== id) }));
    if (tab === 'rule') updateStrategy((s) => ({ ...s, rules: s.rules.filter((r) => r.id !== id) }));
    if (tab === 'dispose') updateStrategy((s) => ({ ...s, disposes: s.disposes.filter((d) => d.id !== id) }));
  };

  const empty = (): MidTask | MidRule | MidDispose => {
    if (tab === 'task') return { id: midNewId('t'), name: '', crowd: '', frequency: 'daily', metricIds: [], output: 'web', enabled: true };
    if (tab === 'rule') return { id: midNewId('r'), name: '', metricId: '', op: 'gt', value: 0, level: 'YELLOW' };
    return { id: midNewId('d'), name: '', triggerLevel: 'RED', action: '关注', targetSystem: '工单系统', needApprove: false, needNotify: false, assignTo: '客户经理' };
  };

  const taskCols: Column[] = [
    { key: 'name', label: '任务名称' }, { key: 'crowd', label: '客群' },
    { key: 'freq', label: '扫描频次', type: 'badge' }, { key: 'metrics', label: '关联指标' },
    { key: 'output', label: '输出方式' }, { key: 'enabled', label: '状态', type: 'badge' },
  ];
  const ruleCols: Column[] = [
    { key: 'name', label: '规则名称' }, { key: 'metric', label: '指标' },
    { key: 'expr', label: '判定' }, { key: 'level', label: '定级', type: 'badge' },
  ];
  const disposeCols: Column[] = [
    { key: 'name', label: '处置动作' }, { key: 'trigger', label: '触发等级', type: 'badge' },
    { key: 'action', label: '动作' }, { key: 'system', label: '对接系统' },
    { key: 'approve', label: '需审批' }, { key: 'notify', label: '需触达' }, { key: 'assign', label: '分派' },
  ];

  const tabs: { key: TabKey; label: string; count: number }[] = [
    { key: 'task', label: '监控任务', count: strategy.tasks.length },
    { key: 'rule', label: '预警规则', count: strategy.rules.length },
    { key: 'dispose', label: '处置策略', count: strategy.disposes.length },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <PageHeader
        title="监控策略配置"
        crumb="管理中心 / 贷中监控配置 / 监控策略配置"
        subtitle="定义监控什么客群、按什么规则判定、命中后建议什么处置动作（内容来自指标库）"
        actions={<Button onClick={() => setDraft(empty())}>新建{tab === 'task' ? '任务' : tab === 'rule' ? '规则' : '处置策略'}</Button>}
      />
      <MidSaveToast status={saveStatus} />

      <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
        {tabs.map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); setDraft(null); }} style={{
            padding: '8px 16px', borderRadius: 8, fontSize: 13, cursor: 'pointer',
            border: tab === t.key ? '1px solid #2563EB' : '1px solid #E2E8F0',
            background: tab === t.key ? '#EFF6FF' : '#fff',
            color: tab === t.key ? '#1D4ED8' : '#475569', fontWeight: tab === t.key ? 500 : 400,
          }}>
            {t.label} <span style={{ color: '#94A3B8' }}>{t.count}</span>
          </button>
        ))}
        <div style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 12, color: '#94A3B8' }}>
          <Cfg label="策略配置" /> 全部保存到本地 JSON
        </div>
      </div>

      {tab === 'task' && (
        <Panel title="监控任务" desc={<span>客群 + 扫描频次 + 关联指标 + 输出方式 <Cfg label="监控任务配置" /></span>}>
          <DataTable
            columns={taskCols}
            rows={strategy.tasks.map((t) => ({
              id: t.id, name: t.name, crowd: t.crowd, freq: FREQ_LABEL[t.frequency],
              metrics: t.metricIds.map(metricName).join('、'), output: OUT_LABEL[t.output],
              enabled: t.enabled ? '已启用' : '已停用',
            }))}
            clickableKey="id"
            onCellClick={(r) => setDraft(strategy.tasks.find((t) => t.id === r.id) ?? null)}
          />
        </Panel>
      )}
      {tab === 'rule' && (
        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          <div style={{ fontSize: 12, color: '#64748B', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px' }}>
            定级逻辑：命中 <b style={{ color: '#DC2626' }}>红灯规则</b> → 综合红灯；命中 <b style={{ color: '#D97706' }}>黄灯规则</b> → 综合黄灯；规则明细随预警事件快照保存，支持「规则明细还原」<Cal label="实时定级" />（Demo 由样例预警数据模拟命中）
          </div>
          <Panel title="预警规则" desc={<span>指标 + 阈值 + 定级（指标来自指标库） <Cfg label="预警规则配置" /></span>}>
            <DataTable
              columns={ruleCols}
              rows={strategy.rules.map((r) => ({
                id: r.id, name: r.name, metric: metricName(r.metricId),
                expr: `${OP_LABEL[r.op]} ${r.value}`, level: LEVEL_LABEL[r.level],
              }))}
              clickableKey="id"
              onCellClick={(r) => setDraft(strategy.rules.find((x) => x.id === r.id) ?? null)}
            />
          </Panel>
        </div>
      )}
      {tab === 'dispose' && (
        <Panel title="处置策略" desc={<span>预警等级 → 建议处置动作（含对接系统 / 审批 / 触达） <Cfg label="处置策略配置" /></span>}>
          <DataTable
            columns={disposeCols}
            rows={strategy.disposes.map((d) => ({
              id: d.id, name: d.name, trigger: LEVEL_LABEL[d.triggerLevel], action: d.action,
              system: d.targetSystem, approve: d.needApprove ? '是' : '否', notify: d.needNotify ? '是' : '否', assign: d.assignTo,
            }))}
            clickableKey="id"
            onCellClick={(r) => setDraft(strategy.disposes.find((x) => x.id === r.id) ?? null)}
          />
        </Panel>
      )}

      {draft && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDraft(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 560, boxShadow: '0 8px 30px rgba(0,0,0,.15)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>编辑{tab === 'task' ? '监控任务' : tab === 'rule' ? '预警规则' : '处置策略'} <Cfg label="配置" /></div>
            {tab === 'task' && renderTaskEditor(draft as MidTask, setDraft, metrics)}
            {tab === 'rule' && renderRuleEditor(draft as MidRule, setDraft, metrics)}
            {tab === 'dispose' && renderDisposeEditor(draft as MidDispose, setDraft)}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
              <Button variant="secondary" onClick={() => setDraft(null)}>关闭</Button>
              <Button variant="ghost" onClick={() => { remove(draft.id); setDraft(null); }}>删除</Button>
              <Button onClick={() => { save(draft); setDraft(null); }}>保存</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function renderTaskEditor(d: MidTask, setDraft: (t: MidTask | null) => void, metrics: ReturnType<typeof useMidMetrics>) {
  const set = (p: Partial<MidTask>) => setDraft({ ...d, ...p });
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div><label style={lb}>任务名称</label><input style={inp} value={d.name} onChange={(e) => set({ name: e.target.value })} /></div>
      <div><label style={lb}>监控客群</label><input style={inp} value={d.crowd} onChange={(e) => set({ crowd: e.target.value })} placeholder="全部在贷客户 / 经营贷产品客户" /></div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label style={lb}>扫描频次</label>
          <select style={sel} value={d.frequency} onChange={(e) => set({ frequency: e.target.value as TaskFrequency })}>
            <option value="daily">每日</option><option value="weekly">每周</option><option value="monthly">每月</option>
          </select>
        </div>
        <div><label style={lb}>输出方式</label>
          <select style={sel} value={d.output} onChange={(e) => set({ output: e.target.value as OutputWay })}>
            <option value="api">API</option><option value="url">URL推送</option><option value="file">文件交换</option><option value="web">网页下载</option>
          </select>
        </div>
      </div>
      <div><label style={lb}>关联指标（来自指标库）</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {metrics.map((m) => (
            <button key={m.id} onClick={() => {
              const has = d.metricIds.includes(m.id);
              set({ metricIds: has ? d.metricIds.filter((x) => x !== m.id) : [...d.metricIds, m.id] });
            }} style={{
              padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
              border: d.metricIds.includes(m.id) ? '1px solid #2563EB' : '1px solid #E2E8F0',
              background: d.metricIds.includes(m.id) ? '#EFF6FF' : '#fff',
              color: d.metricIds.includes(m.id) ? '#1D4ED8' : '#475569',
            }}>{m.name}</button>
          ))}
        </div>
      </div>
      <div><label style={lb}>说明</label><input style={inp} value={d.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></div>
      <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
        <input type="checkbox" checked={d.enabled} onChange={(e) => set({ enabled: e.target.checked })} /> 启用该任务
      </label>
    </div>
  );
}

function renderRuleEditor(d: MidRule, setDraft: (r: MidRule | null) => void, metrics: ReturnType<typeof useMidMetrics>) {
  const set = (p: Partial<MidRule>) => setDraft({ ...d, ...p });
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div><label style={lb}>规则名称</label><input style={inp} value={d.name} onChange={(e) => set({ name: e.target.value })} /></div>
      <div><label style={lb}>判定指标（来自指标库）</label>
        <select style={sel} value={d.metricId} onChange={(e) => set({ metricId: e.target.value })}>
          <option value="">选择指标</option>
          {metrics.map((m) => <option key={m.id} value={m.id}>{m.name}（{m.id}）</option>)}
        </select>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label style={lb}>比较符</label>
          <select style={sel} value={d.op} onChange={(e) => set({ op: e.target.value as RuleOp })}>
            <option value="gt">&gt;</option><option value="gte">≥</option><option value="lt">&lt;</option>
            <option value="lte">≤</option><option value="eq">=</option><option value="neq">≠</option>
          </select>
        </div>
        <div><label style={lb}>阈值</label><input type="number" style={inp} value={d.value} onChange={(e) => set({ value: Number(e.target.value) })} /></div>
      </div>
      <div><label style={lb}>命中定级</label>
        <select style={sel} value={d.level} onChange={(e) => set({ level: e.target.value as AlertLevel })}>
          <option value="RED">红灯</option><option value="YELLOW">黄灯</option><option value="OPPORTUNITY">机会信号</option>
        </select>
      </div>
      <div><label style={lb}>说明</label><input style={inp} value={d.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></div>
      <div style={{ fontSize: 12, color: '#94A3B8' }}>规则命中后，预警事件将保存该规则快照（规则名 / 指标值 / 阈值），用于详情页「规则明细还原」。</div>
    </div>
  );
}

function renderDisposeEditor(d: MidDispose, setDraft: (d: MidDispose | null) => void) {
  const set = (p: Partial<MidDispose>) => setDraft({ ...d, ...p });
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label style={lb}>处置动作名称</label><input style={inp} value={d.name} onChange={(e) => set({ name: e.target.value })} /></div>
        <div><label style={lb}>触发等级</label>
          <select style={sel} value={d.triggerLevel} onChange={(e) => set({ triggerLevel: e.target.value as AlertLevel })}>
            <option value="RED">红灯</option><option value="YELLOW">黄灯</option><option value="OPPORTUNITY">机会信号</option>
          </select>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div><label style={lb}>处置动作</label>
          <select style={sel} value={d.action} onChange={(e) => set({ action: e.target.value })}>
            {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div><label style={lb}>对接系统</label>
          <select style={sel} value={d.targetSystem} onChange={(e) => set({ targetSystem: e.target.value })}>
            {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={d.needApprove} onChange={(e) => set({ needApprove: e.target.checked })} /> 需审批（主管）
        </label>
        <label style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={d.needNotify} onChange={(e) => set({ needNotify: e.target.checked })} /> 需触达客户
        </label>
      </div>
      <div><label style={lb}>分派角色</label>
        <select style={sel} value={d.assignTo} onChange={(e) => set({ assignTo: e.target.value })}>
          {ASSIGNS.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>
      <div><label style={lb}>说明</label><input style={inp} value={d.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></div>
      <div style={{ fontSize: 12, color: '#94A3B8' }}>
        处置工单执行时将按此处配置模拟对接：{d.needApprove ? '先主管审批' : '直接下发'} → {d.targetSystem} {d.needNotify ? '→ 触达客户' : ''}
      </div>
    </div>
  );
}

const lb: React.CSSProperties = { display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 };
const inp: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13,
  outline: 'none', color: '#0F172A', background: '#fff', width: '100%', boxSizing: 'border-box',
};
const sel: React.CSSProperties = {
  padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13, background: '#fff', color: '#0F172A', width: '100%',
};
