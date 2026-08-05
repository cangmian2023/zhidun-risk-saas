// ③ 监控策略配置（管理中心 · 配置域）— 策略配置JSON 橘（规则3）；监控内容来自指标库 蓝
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Badge } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Cal } from './SourceTag';
import { useMidStrategy, updateStrategy, useMidMetrics, midNewId } from './midStore';
import {
  type MidTask, type MidRule, type MidDispose, type AlertLevel, type TaskFrequency,
  type OutputWay, type RuleOp, LEVEL_META,
} from './midData';
import { ConfigListPage, type ListTab, FREQ_LABEL, OUTPUT_LABEL, OP_LABEL } from './ConfigTemplate';

const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 150 };

export default function MidStrategyConfig() {
  const strategy = useMidStrategy();
  const metrics = useMidMetrics();
  const [tab, setTab] = useState<'task' | 'rule' | 'dispose'>('task');
  const [editing, setEditing] = useState<null | { kind: 'task' | 'rule' | 'dispose'; data: any }>(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const openedRef = useRef<string | null>(null);
  useEffect(() => {
    const eid = params.get('edit');
    const ek = (params.get('kind') ?? 'task') as 'task' | 'rule' | 'dispose';
    if (eid && openedRef.current !== eid) {
      const ent = ek === 'task' ? strategy.tasks.find((x) => x.id === eid)
        : ek === 'rule' ? strategy.rules.find((x) => x.id === eid)
        : strategy.disposes.find((x) => x.id === eid);
      if (ent) { openedRef.current = eid; setTab(ek); setEditing({ kind: ek, data: JSON.parse(JSON.stringify(ent)) }); setOpen(true); }
    }
  }, [params, strategy]);

  const metricName = (id: string) => metrics.find((m) => m.id === id)?.name ?? id;

  const openEdit = (kind: 'task' | 'rule' | 'dispose', data?: any) => {
    if (kind === 'task') setEditing({ kind, data: data ?? { id: midNewId('t'), name: '', crowd: '', frequency: 'daily', metricIds: [], output: 'web', enabled: true, desc: '' } });
    if (kind === 'rule') setEditing({ kind, data: data ?? { id: midNewId('r'), name: '', metricId: metrics[0]?.id ?? '', op: 'gt', value: 0, level: 'RED', desc: '' } });
    if (kind === 'dispose') setEditing({ kind, data: data ?? { id: midNewId('d'), name: '', triggerLevel: 'RED', action: '关注', targetSystem: '', needApprove: false, needNotify: false, assignTo: '', desc: '' } });
    setOpen(true);
  };
  const save = () => {
    if (!editing) return;
    const { kind, data } = editing;
    updateStrategy((s) => {
      if (kind === 'task') {
        const i = s.tasks.findIndex((x) => x.id === data.id);
        return { ...s, tasks: i < 0 ? [...s.tasks, data] : s.tasks.map((x) => (x.id === data.id ? data : x)) };
      }
      if (kind === 'rule') {
        const i = s.rules.findIndex((x) => x.id === data.id);
        return { ...s, rules: i < 0 ? [...s.rules, data] : s.rules.map((x) => (x.id === data.id ? data : x)) };
      }
      const i = s.disposes.findIndex((x) => x.id === data.id);
      return { ...s, disposes: i < 0 ? [...s.disposes, data] : s.disposes.map((x) => (x.id === data.id ? data : x)) };
    });
    setOpen(false); setEditing(null);
  };
  const remove = (kind: 'task' | 'rule' | 'dispose', id: string) => updateStrategy((s) => {
    if (kind === 'task') return { ...s, tasks: s.tasks.filter((x) => x.id !== id) };
    if (kind === 'rule') return { ...s, rules: s.rules.filter((x) => x.id !== id) };
    return { ...s, disposes: s.disposes.filter((x) => x.id !== id) };
  });

  const TABS: { key: 'task' | 'rule' | 'dispose'; label: string; count: number }[] = [
    { key: 'task', label: '监控任务', count: strategy.tasks.length },
    { key: 'rule', label: '预警规则', count: strategy.rules.length },
    { key: 'dispose', label: '处置策略', count: strategy.disposes.length },
  ];

  const tabs: ListTab[] = [
    { key: 'task', label: '监控任务', count: strategy.tasks.length, columns: taskCols(), rows: strategy.tasks.map(taskRow) },
    { key: 'rule', label: '预警规则', count: strategy.rules.length, columns: ruleCols(), rows: strategy.rules.map(ruleRow) },
    { key: 'dispose', label: '处置策略', count: strategy.disposes.length, columns: disposeCols, rows: strategy.disposes.map(disposeRow) },
  ];

  return (
    <ConfigListPage
      title="策略配置"
      crumbPath="策略配置"
      subtitle="配置监控任务、红黄灯预警规则与处置策略；监控内容引用指标库"
        actions={<><Cfg label="读指标库" value="midMetrics.json" /><Cfg value="midStrategy.json" /></>}
        panelTitle="策略配置"
        panelDesc="监控任务 / 预警规则 / 处置策略 三类配置，监控内容引用指标库"
        panelActions={(
          <>
            <Button size="sm" variant="secondary" onClick={() => openEdit('task')}>新建任务</Button>
            <Button size="sm" variant="secondary" onClick={() => openEdit('rule')}>新建规则</Button>
            <Button size="sm" variant="secondary" onClick={() => openEdit('dispose')}>新建策略</Button>
          </>
        )}
        tabs={tabs}
        onView={(r, k) => nav(`/console/cm/mid-strategy-detail?kind=${k ?? 'task'}&id=${String(r.id)}`)}
        editOpen={open}
        editTitle={editing ? `${TABS.find((t) => t.key === editing.kind)?.label}编辑` : '编辑'}
        onCloseEdit={() => setOpen(false)}
        onSave={save}
      >
        {editing && <Editor kind={editing.kind} value={editing.data} metrics={metrics} onChange={(data) => setEditing({ ...editing, data })} onRemove={() => { if (editing) { remove(editing.kind, editing.data.id); setOpen(false); setEditing(null); } }} />}
      </ConfigListPage>
  );

  // ---- 行映射 ----
  function taskRow(t: MidTask): Row {
    return {
      id: t.id, name: t.name, crowd: t.crowd, freq: FREQ_LABEL[t.frequency],
      metrics: t.metricIds.map(metricName).join('、') || '-', output: OUTPUT_LABEL[t.output],
      enabled: t.enabled ? { v: '启用', kind: 'green' } : { v: '停用', kind: 'gray' },
    } as unknown as Row;
  }
  function ruleRow(r: MidRule): Row {
    return {
      id: r.id, name: r.name, metric: metricName(r.metricId), cond: `${OP_LABEL[r.op]} ${r.value}`,
      level: { v: LEVEL_META[r.level].label, kind: LEVEL_META[r.level].badge },
    } as unknown as Row;
  }
  function disposeRow(d: MidDispose): Row {
    return {
      id: d.id, name: d.name, trigger: { v: LEVEL_META[d.triggerLevel].label, kind: LEVEL_META[d.triggerLevel].badge },
      action: d.action, system: d.targetSystem || '-', approve: d.needApprove ? '需审批' : '免审批',
    } as unknown as Row;
  }
}

function taskCols(): Column[] {
  return [
    { key: 'name', label: '任务名称', tag: { kind: 'cfg', value: 'midStrategy.json.tasks.name' } },
    { key: 'crowd', label: '客群', tag: { kind: 'cfg', value: 'midStrategy.json.tasks.crowd' } },
    { key: 'freq', label: '频率', tag: { kind: 'cfg', value: 'midStrategy.json.tasks.frequency' } },
    { key: 'metrics', label: '关联指标', tag: { kind: 'cfg', value: 'midMetrics.json' } },
    { key: 'output', label: '输出', tag: { kind: 'cfg', value: 'midStrategy.json.tasks.output' } },
    { key: 'enabled', label: '状态', type: 'badge', tag: { kind: 'cfg', value: 'midStrategy.json.tasks.enabled' } },
  ];
}
function ruleCols(): Column[] {
  return [
    { key: 'name', label: '规则名称', tag: { kind: 'cfg', value: 'midStrategy.json.rules.name' } },
    { key: 'metric', label: '监控指标', type: 'badge', tag: { kind: 'cfg', value: 'midMetrics.json' } },
    { key: 'cond', label: '触发条件', tag: { kind: 'cfg', value: 'midStrategy.json.rules.op' } },
    { key: 'level', label: '命中定级', type: 'badge', tag: { kind: 'cfg', value: 'midStrategy.json.rules.level' } },
  ];
}
const disposeCols: Column[] = [
  { key: 'name', label: '策略名称', tag: { kind: 'cfg', value: 'midStrategy.json.disposes.name' } },
  { key: 'trigger', label: '触发等级', type: 'badge', tag: { kind: 'cfg', value: 'midStrategy.json.disposes.triggerLevel' } },
  { key: 'action', label: '动作', tag: { kind: 'cfg', value: 'midStrategy.json.disposes.action' } },
  { key: 'system', label: '对接系统', tag: { kind: 'cfg', value: 'midStrategy.json.disposes.targetSystem' } },
  { key: 'approve', label: '审批', tag: { kind: 'cfg', value: 'midStrategy.json.disposes.needApprove' } },
];

function Editor({ kind, value, metrics, onChange, onRemove }: {
  kind: 'task' | 'rule' | 'dispose'; value: any; metrics: ReturnType<typeof useMidMetrics>;
  onChange: (v: any) => void; onRemove: () => void;
}) {
  const set = (p: any) => onChange({ ...value, ...p });
  const metricOpts = metrics.map((m) => ({ value: m.id, label: m.name }));

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {kind === 'task' && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={lbl}>任务名称<input style={inp} value={value.name} onChange={(e) => set({ name: e.target.value })} /></label>
            <label style={lbl}>客群描述<input style={inp} value={value.crowd} onChange={(e) => set({ crowd: e.target.value })} /></label>
            <label style={lbl}>频率
              <select style={inp} value={value.frequency} onChange={(e) => set({ frequency: e.target.value })}>
                {(['daily', 'weekly', 'monthly'] as TaskFrequency[]).map((f) => <option key={f} value={f}>{FREQ_LABEL[f]}</option>)}
              </select>
            </label>
            <label style={lbl}>输出方式
              <select style={inp} value={value.output} onChange={(e) => set({ output: e.target.value })}>
                {(Object.keys(OUTPUT_LABEL) as OutputWay[]).map((o) => <option key={o} value={o}>{OUTPUT_LABEL[o]}</option>)}
              </select>
            </label>
          </div>
          <label style={{ ...lbl, minWidth: '100%' }}>关联指标（可多选，Ctrl/⌘ 多选）
            <select multiple style={{ ...inp, minHeight: 80 }} value={value.metricIds}
              onChange={(e) => set({ metricIds: Array.from(e.target.options).filter((o) => o.selected).map((o) => o.value) })}>
              {metricOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </label>
          <label style={{ ...lbl, minWidth: '100%' }}>说明<input style={inp} value={value.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
            <input type="checkbox" checked={value.enabled} onChange={(e) => set({ enabled: e.target.checked })} /> 启用该任务
          </label>
        </>
      )}
      {kind === 'rule' && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={lbl}>规则名称<input style={inp} value={value.name} onChange={(e) => set({ name: e.target.value })} /></label>
            <label style={lbl}>监控指标 <Cfg label="读指标库" value="midMetrics.json" />
              <select style={inp} value={value.metricId} onChange={(e) => set({ metricId: e.target.value })}>
                {metricOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={lbl}>运算符
              <select style={inp} value={value.op} onChange={(e) => set({ op: e.target.value })}>
                {(Object.keys(OP_LABEL) as RuleOp[]).map((o) => <option key={o} value={o}>{OP_LABEL[o]}</option>)}
              </select>
            </label>
            <label style={lbl}>阈值<input style={inp} type="number" value={value.value} onChange={(e) => set({ value: Number(e.target.value) })} /></label>
            <label style={lbl}>命中定级
              <select style={inp} value={value.level} onChange={(e) => set({ level: e.target.value as AlertLevel })}>
                {(Object.keys(LEVEL_META) as AlertLevel[]).map((l) => <option key={l} value={l}>{LEVEL_META[l].label}</option>)}
              </select>
            </label>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#F3F4F6', borderRadius: 8, fontSize: 12, color: '#6B7280' }}>
            <Cal label="实时计算" /> 当「{metrics.find((m) => m.id === value.metricId)?.name ?? '指标'}」{OP_LABEL[value.op as RuleOp]} {value.value} 时，自动定级为 <Badge kind={LEVEL_META[value.level].badge}>{LEVEL_META[value.level].label}</Badge>
          </div>
          <label style={{ ...lbl, minWidth: '100%' }}>说明<input style={inp} value={value.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></label>
        </>
      )}
      {kind === 'dispose' && (
        <>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={lbl}>策略名称<input style={inp} value={value.name} onChange={(e) => set({ name: e.target.value })} /></label>
            <label style={lbl}>触发等级
              <select style={inp} value={value.triggerLevel} onChange={(e) => set({ triggerLevel: e.target.value as AlertLevel })}>
                {(Object.keys(LEVEL_META) as AlertLevel[]).map((l) => <option key={l} value={l}>{LEVEL_META[l].label}</option>)}
              </select>
            </label>
            <label style={lbl}>动作<input style={inp} value={value.action} onChange={(e) => set({ action: e.target.value })} placeholder="降额/冻结/预催/关注/提额" /></label>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <label style={lbl}>对接系统<input style={inp} value={value.targetSystem} onChange={(e) => set({ targetSystem: e.target.value })} /></label>
            <label style={lbl}>分派角色<input style={inp} value={value.assignTo} onChange={(e) => set({ assignTo: e.target.value })} /></label>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
              <input type="checkbox" checked={value.needApprove} onChange={(e) => set({ needApprove: e.target.checked })} /> 需审批
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
              <input type="checkbox" checked={value.needNotify} onChange={(e) => set({ needNotify: e.target.checked })} /> 需触达客户
            </label>
          </div>
          <label style={{ ...lbl, minWidth: '100%' }}>说明<input style={inp} value={value.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></label>
        </>
      )}
      {value.id && <Button variant="ghost" size="sm" onClick={onRemove}>删除</Button>}
    </div>
  );
}
