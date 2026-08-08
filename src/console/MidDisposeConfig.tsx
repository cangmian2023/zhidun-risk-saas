// 处置策略（管理中心）— 独立页面；按预警等级路由处置动作
// ① 处置策略样例 JSON 橘；按等级路由 灰
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Panel, DataTable, Modal } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam } from './SourceTag';
import FlowStateCell from './FlowStateCell';
import { useMidStrategy, updateStrategy, midNewId } from './midStore';
import { type MidDispose, type AlertLevel, LEVEL_META } from './midData';
import { PageShell } from './PageShell';
import { CONFIG_CONTAINER, crumb } from './ConfigTemplate';

export const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
export const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 150 };

export default function MidDisposeConfig() {
  const strategy = useMidStrategy();
  const [editing, setEditing] = useState<null | MidDispose>(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const openedRef = useRef<string | null>(null);
  useEffect(() => {
    const eid = params.get('edit');
    if (eid && openedRef.current !== eid) {
      const ent = strategy.disposes.find((x) => x.id === eid);
      if (ent) { openedRef.current = eid; setEditing(JSON.parse(JSON.stringify(ent))); setOpen(true); }
    }
  }, [params, strategy]);

  const openEdit = (data?: MidDispose) => {
    setEditing(data ?? { id: midNewId('d'), name: '', triggerLevel: 'RED', action: '关注', targetSystem: '', needApprove: false, needNotify: false, assignTo: '', desc: '' });
    setOpen(true);
  };
  const save = () => {
    if (!editing) return;
    updateStrategy((s) => {
      const i = s.disposes.findIndex((x) => x.id === editing.id);
      return { ...s, disposes: i < 0 ? [...s.disposes, editing] : s.disposes.map((x) => (x.id === editing.id ? editing : x)) };
    });
    setOpen(false); setEditing(null);
  };
  const remove = (id: string) => updateStrategy((s) => ({ ...s, disposes: s.disposes.filter((x) => x.id !== id) }));

  return (
    <div className={CONFIG_CONTAINER}>
      <PageShell title="处置策略" crumb={crumb('处置策略')}
        subtitle="配置自动处置策略（如自动降额、自动冻结），按预警等级路由；跨任务、跨业务域统一响应"
        actions={<Sam value="midStrategy.json" />} />

      <Panel title="处置策略" desc="按预警等级（红灯 / 黄灯）路由处置动作"
        actions={<Button size="sm" variant="secondary" onClick={() => openEdit()}>新建策略</Button>}>
        <DataTable columns={disposeCols} rows={strategy.disposes.map(disposeRow)}
          actions={(r) => (
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <Button size="sm" variant="ghost" onClick={() => nav(`/console/cm/mid-strategy-detail?kind=dispose&id=${String(r.id)}`)}>查看</Button>
            </div>
          )} />
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)} title="处置策略编辑"
        footer={<><Button onClick={save}>保存</Button><Button variant="secondary" onClick={() => setOpen(false)}>取消</Button></>}>
        {editing && <Editor value={editing} onChange={setEditing} onRemove={() => { remove(editing.id); setOpen(false); setEditing(null); }} />}
      </Modal>
    </div>
  );

  function disposeRow(d: MidDispose): Row {
    return {
      id: d.id, name: d.name, trigger: { v: LEVEL_META[d.triggerLevel].label, kind: LEVEL_META[d.triggerLevel].badge },
      action: d.action, system: d.targetSystem || '-', assign: d.assignTo || '-',
      approve: d.needApprove ? '需审批' : '免审批', notify: d.needNotify ? '需触达' : '-',
      flowKey: d.flowKey ?? '', flowState: d.flowState ?? '',
    } as unknown as Row;
  }
}

const disposeCols: Column[] = [
  { key: 'name', label: '策略名称', tag: { kind: 'sample', value: 'midStrategy.json.disposes.name' } },
  { key: 'trigger', label: '触发等级', type: 'badge', tag: { kind: 'sample', value: 'midStrategy.json.disposes.triggerLevel' } },
  { key: 'action', label: '动作', tag: { kind: 'sample', value: 'midStrategy.json.disposes.action' } },
  { key: 'system', label: '对接系统', tag: { kind: 'sample', value: 'midStrategy.json.disposes.targetSystem' } },
  { key: 'assign', label: '分派角色', tag: { kind: 'sample', value: 'midStrategy.json.disposes.assignTo' } },
  { key: 'approve', label: '审批', tag: { kind: 'sample', value: 'midStrategy.json.disposes.needApprove' } },
  { key: 'notify', label: '客户触达', tag: { kind: 'sample', value: 'midStrategy.json.disposes.needNotify' } },
  { key: 'flowState', label: '流程状态', fixed: 'right', tag: { kind: 'sample', value: 'midStrategy.json.disposes.flowState' }, render: (r: Row) => (
    <FlowStateCell flowId={String(r.flowKey ?? '')} state={String(r.flowState ?? '')}
      onChange={(s) => updateStrategy((st) => ({ ...st, disposes: st.disposes.map((d) => d.id === String(r.id) ? { ...d, flowState: s } : d) }))} />
  ) },
];

export const DISPOSE_ACTIONS = ['关注', '预催', '降额', '冻结', '止付', '促活', '提额'];
export const DISPOSE_SYSTEMS = ['催收系统', '工单系统', '营销系统', '核心信贷系统', '征信上报', '消息中心'];
export const DISPOSE_ROLES = ['催收专员', '客户经理', '风控主管', '运营专员', '法务'];

export function Editor({ value, onChange, onRemove }: { value: MidDispose; onChange: (v: MidDispose) => void; onRemove: () => void }) {
  const set = (p: Partial<MidDispose>) => onChange({ ...value, ...p });
  const sel: React.CSSProperties = { ...inp, cursor: 'pointer' };
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label style={lbl}>策略名称<input style={inp} value={value.name} onChange={(e) => set({ name: e.target.value })} /></label>
        <label style={lbl}>触发等级
          <select style={sel} value={value.triggerLevel} onChange={(e) => set({ triggerLevel: e.target.value as AlertLevel })}>
            {(Object.keys(LEVEL_META) as AlertLevel[]).map((l) => <option key={l} value={l}>{LEVEL_META[l].label}</option>)}
          </select>
        </label>
        <label style={lbl}>动作
          <select style={sel} value={value.action} onChange={(e) => set({ action: e.target.value })}>
            {DISPOSE_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label style={lbl}>对接系统
          <select style={sel} value={value.targetSystem} onChange={(e) => set({ targetSystem: e.target.value })}>
            {DISPOSE_SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>
        <label style={lbl}>分派角色
          <select style={sel} value={value.assignTo} onChange={(e) => set({ assignTo: e.target.value })}>
            {DISPOSE_ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>
        <label style={lbl}>等级预览
          <span style={{ display: 'flex', alignItems: 'center', height: 34 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, color: LEVEL_META[value.triggerLevel].fill }}>
              <span style={{ width: 10, height: 10, borderRadius: 999, background: LEVEL_META[value.triggerLevel].fill, display: 'inline-block' }} />
              {LEVEL_META[value.triggerLevel].label}
            </span>
          </span>
        </label>
      </div>
      <div style={{ display: 'flex', gap: 16 }}>
        <Switch on={value.needApprove} onChange={(v) => set({ needApprove: v })} label="需审批" />
        <Switch on={value.needNotify} onChange={(v) => set({ needNotify: v })} label="需触达客户" />
      </div>
      <label style={{ ...lbl, minWidth: '100%' }}>说明<input style={inp} value={value.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></label>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, borderTop: '1px solid #F1F5F9', paddingTop: 10 }}>
        {value.id && <Button variant="ghost" size="sm" onClick={onRemove}>删除</Button>}
      </div>
    </div>
  );
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
      <span style={{ position: 'relative', width: 40, height: 22, borderRadius: 999, background: on ? '#22C55E' : '#CBD5E1', transition: 'background .15s', display: 'inline-block' }}>
        <span style={{ position: 'absolute', top: 3, width: 16, height: 16, borderRadius: 999, background: '#fff', transition: 'left .15s', left: on ? 21 : 3, display: 'inline-block' }} />
      </span>
      <span style={{ fontSize: 12, color: '#475569' }}>{label}</span>
    </button>
  );
}
