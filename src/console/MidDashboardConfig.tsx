// ④ 监控页面配置（管理中心 · 配置域）— 页面配置JSON 橘（规则4）；监控内容来自指标库 蓝
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Modal, Button } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidDashboards, updateDashboards, useMidMetrics, useMidDataSources, midNewId } from './midStore';
import {
  type MidDashboardPage, type MidWidget, type WidgetType, type MidDataSource,
} from './midData';

const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 150 };
const inpSm: React.CSSProperties = { padding: '4px 6px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };

const WTYPE_LABEL: Record<WidgetType, string> = { metric: '指标卡', line: '折线', bar: '柱状', donut: '环形', table: '明细表' };

export default function MidDashboardConfig() {
  const dashboards = useMidDashboards();
  const metrics = useMidMetrics();
  const sources = useMidDataSources();
  const [editing, setEditing] = useState<MidDashboardPage | null>(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const openedRef = useRef<string | null>(null);
  useEffect(() => {
    const eid = params.get('edit');
    if (eid && openedRef.current !== eid) {
      const d = dashboards.find((x) => x.id === eid);
      if (d) { openedRef.current = eid; setEditing(JSON.parse(JSON.stringify(d))); setOpen(true); }
    }
  }, [params, dashboards]);

  const openAdd = () => {
    setEditing({ id: midNewId('db'), key: `cr:mid-${Date.now().toString(36)}`, name: '', group: '监控总览', order: dashboards.length, enabled: true, widgets: [] });
    setOpen(true);
  };
  const save = () => {
    if (!editing) return;
    updateDashboards((list) => {
      const i = list.findIndex((x) => x.id === editing.id);
      return i < 0 ? [...list, editing] : list.map((x) => (x.id === editing.id ? editing : x));
    });
    setOpen(false); setEditing(null);
  };
  const remove = (id: string) => updateDashboards((list) => list.filter((x) => x.id !== id));

  const cols: Column[] = [
    { key: 'name', label: '页面名称' }, { key: 'group', label: '分组' }, { key: 'key', label: '路由key' },
    { key: 'widgetCnt', label: '组件数' }, { key: 'enabled', label: '启用', type: 'badge' },
  ];
  const rows: Row[] = dashboards.map((d) => ({
    id: d.id, name: d.name, group: d.group, key: d.key,
    widgetCnt: String(d.widgets.length),
    enabled: d.enabled ? { v: '启用', kind: 'green' } : { v: '停用', kind: 'gray' },
  } as unknown as Row));

  return (
    <div style={{ padding: 24, maxWidth: 1180 }}>
      <PageShell title="监控页面配置" crumb="零售信贷风控 / 管理中心 / 贷中监控配置"
        subtitle="配置监控看板页面与可视化组件，保存后由监控看板按配置渲染"
        actions={<><Cfg label="读指标库" value="midMetrics.json" /><Sam label="页面配置JSON" value="midDashboards.json" /></>} />
      <Panel title="看板页面" desc="页面 + 组件（指标卡 / 折线 / 柱状 / 环形 / 明细表）配置，引用指标库与数据源"
        actions={<Button size="sm" onClick={openAdd}>新建页面</Button>}>
        <DataTable columns={cols} rows={rows} clickableKey="name"
          onCellClick={(r) => nav('/console/cm:mid-dashboard-detail?id=' + String(r.id))} />
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)}
        title={editing && dashboards.find((d) => d.id === editing.id) ? '编辑页面' : '新建页面'} width="max-w-4xl"
        footer={<><Button onClick={save}>保存</Button><Button variant="secondary" onClick={() => setOpen(false)}>取消</Button></>}>
        {editing && <Editor value={editing} metrics={metrics} sources={sources}
          onChange={setEditing} onRemove={() => { if (editing) { remove(editing.id); setOpen(false); setEditing(null); } }} />}
      </Modal>
    </div>
  );
}

function Editor({ value, metrics, sources, onChange, onRemove }: {
  value: MidDashboardPage; metrics: ReturnType<typeof useMidMetrics>; sources: MidDataSource[];
  onChange: (v: MidDashboardPage) => void; onRemove: () => void;
}) {
  const set = (p: Partial<MidDashboardPage>) => onChange({ ...value, ...p });
  const setWidget = (i: number, p: Partial<MidWidget>) => set({ widgets: value.widgets.map((w, idx) => idx === i ? { ...w, ...p } : w) });
  const addWidget = () => set({ widgets: [...value.widgets, { id: midNewId('w'), type: 'metric', title: '新组件', datasetId: sources[0]?.id ?? '', metricId: metrics[0]?.id ?? '', span: 1 }] });
  const removeWidget = (i: number) => set({ widgets: value.widgets.filter((_, idx) => idx !== i) });

  const srcFields = (dsId: string) => sources.find((s) => s.id === dsId)?.fields ?? [];
  const filterFields = (dsId: string) => {
    const f = srcFields(dsId);
    return f.length ? f : [{ key: 'alert_date', label: '日期', kind: 'dim' as const, type: 'date' as const }];
  };

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label style={lbl}>页面名称<input style={inp} value={value.name} onChange={(e) => set({ name: e.target.value })} /></label>
        <label style={lbl}>分组<input style={inp} value={value.group} onChange={(e) => set({ group: e.target.value })} /></label>
        <label style={lbl}>路由 key<input style={inp} value={value.key} onChange={(e) => set({ key: e.target.value })} /></label>
        <label style={lbl}>排序<input style={inp} type="number" value={value.order} onChange={(e) => set({ order: Number(e.target.value) })} /></label>
        <label style={{ ...lbl, minWidth: 90 }}><span style={{ opacity: 0 }}>-</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
            <input type="checkbox" checked={value.enabled} onChange={(e) => set({ enabled: e.target.checked })} /> 启用
          </label>
        </label>
      </div>
      <label style={{ ...lbl, minWidth: '100%' }}>页面说明<input style={inp} value={value.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} /></label>

      {/* 组件列表 */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>可视化组件 <Cal label="实时计算" /></span>
          <Button size="sm" variant="secondary" onClick={addWidget}>添加组件</Button>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {value.widgets.map((w, i) => (
            <div key={w.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 10, background: '#FAFAFB' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <label style={lbl}>标题<input style={inpSm} value={w.title} onChange={(e) => setWidget(i, { title: e.target.value })} /></label>
                <label style={lbl}>类型
                  <select style={inpSm} value={w.type} onChange={(e) => setWidget(i, { type: e.target.value as WidgetType })}>
                    {(Object.keys(WTYPE_LABEL) as WidgetType[]).map((t) => <option key={t} value={t}>{WTYPE_LABEL[t]}</option>)}
                  </select>
                </label>
                <label style={lbl}>数据集（数据源）
                  <select style={inpSm} value={w.datasetId} onChange={(e) => setWidget(i, { datasetId: e.target.value })}>
                    {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </label>
                <label style={lbl}>监控指标 <Cfg label="读指标库" value="midMetrics.json" />
                  <select style={inpSm} value={w.metricId} onChange={(e) => setWidget(i, { metricId: e.target.value })}>
                    {metrics.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </label>
                <label style={lbl}>跨列
                  <select style={inpSm} value={w.span ?? 1} onChange={(e) => setWidget(i, { span: Number(e.target.value) as 1 | 2 })}>
                    <option value={1}>1 列</option><option value={2}>2 列</option>
                  </select>
                </label>
                <Button size="sm" variant="ghost" onClick={() => removeWidget(i)}>删除</Button>
              </div>
              {w.type !== 'metric' && (
                <div style={{ marginTop: 8 }}>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>维度字段（{w.type === 'table' ? '展示列' : '分组/轴'}）</span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
                    {filterFields(w.datasetId).map((f) => {
                      const on = (w.dimensions ?? []).includes(f.key);
                      return (
                        <button key={f.key} type="button" onClick={() => setWidget(i, { dimensions: on ? (w.dimensions ?? []).filter((d) => d !== f.key) : [...(w.dimensions ?? []), f.key] })}
                          style={{ fontSize: 11, padding: '2px 8px', borderRadius: 12, border: `1px solid ${on ? '#93C5FD' : '#E2E8F0'}`, background: on ? '#DBEAFE' : '#fff', color: on ? '#1D4ED8' : '#64748B', cursor: 'pointer' }}>
                          {f.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              {w.type !== 'metric' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569', marginTop: 8 }}>
                  <input type="checkbox" checked={(w.drill?.type ?? 'none') !== 'none'} onChange={(e) => setWidget(i, { drill: e.target.checked ? { type: 'detail', rowKey: 'cust_id', title: '个体明细' } : { type: 'none' } })} />
                  支持下钻至个体详情
                </label>
              )}
            </div>
          ))}
          {value.widgets.length === 0 && <div style={{ fontSize: 12, color: '#94A3B8', padding: 8 }}>暂无组件，点击「添加组件」。</div>}
        </div>
      </div>

      {value.id && <Button variant="ghost" size="sm" onClick={onRemove}>删除该页面</Button>}
    </div>
  );
}
