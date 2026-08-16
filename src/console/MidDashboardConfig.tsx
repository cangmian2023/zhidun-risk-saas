// ④ 监控页面配置（管理中心）— 页面样例JSON 橘；组件关联指标库/数据源（样例） 橘；实时渲染 灰
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Modal, SingleSelect } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam } from './SourceTag';
import { useMidDashboards, updateDashboards, useMidMetrics, useMidDataSources, midNewId } from './midStore';
import { MetricPicker } from './MidMonitorConfig';
import GroupSelect from './GroupSelect';
import FlowStateCell from './FlowStateCell';
import {
  type MidDashboardPage, type MidWidget, type WidgetType, type MidDataSource,
} from './midData';
import { ConfigListPage, WTYPE_LABEL } from './ConfigTemplate';

const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 150 };
const inpSm: React.CSSProperties = { padding: '4px 6px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };

export default function MidDashboardConfig() {
  const dashboards = useMidDashboards();
  const metrics = useMidMetrics();
  const sources = useMidDataSources();
  const [editing, setEditing] = useState<MidDashboardPage | null>(null);
  const [open, setOpen] = useState(false);
  // 新建页面弹窗（简化：仅 名称 / 说明 / 分组，分组下拉可新建）
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newGroup, setNewGroup] = useState('');
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

  const openAdd = () => setShowNew(true);
  const doCreate = () => {
    if (!newName.trim()) return;
    updateDashboards((list) => [...list, {
      id: midNewId('db'), key: `cr:mid-${Date.now().toString(36)}`, name: newName.trim(),
      group: newGroup.trim() || '监控总览', order: dashboards.length, enabled: true,
      desc: newDesc.trim(), widgets: [],
    }]);
    setShowNew(false); setNewName(''); setNewDesc(''); setNewGroup('');
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
    { key: 'name', label: '页面名称', tag: { kind: 'sample', value: 'midDashboards.json.name' }, fixed: 'left' },
    { key: 'group', label: '分组', tag: { kind: 'sample', value: 'midDashboards.json.group' } },
    { key: 'widgetCnt', label: '组件数', tag: { kind: 'sample', value: 'midDashboards.json.widgets' } },
    { key: 'desc', label: '说明', tag: { kind: 'sample', value: 'midDashboards.json.desc' }, render: (r: Row) => <span style={{ color: '#64748B' }}>{String(r.desc ?? '—')}</span> },
    { key: 'flowState', label: '流程状态', tag: { kind: 'sample', value: 'midDashboards.json.flowState' }, fixed: 'right', render: (r: Row) => (
      <FlowStateCell flowId={String(r.flowKey ?? '')} state={String(r.flowState ?? '')}
        onChange={(s) => updateDashboards((list) => list.map((pg) => pg.id === String(r.id) ? { ...pg, flowState: s } : pg))} />
    ) },
  ];
  const rows: Row[] = dashboards.map((d) => ({
    id: d.id, name: d.name, group: d.group, key: d.key, desc: d.desc ?? '',
    widgetCnt: String(d.widgets.length),
    flowKey: d.flowKey ?? '',
    flowState: d.flowState ?? '',
  } as unknown as Row));

  return (
    <>
      <ConfigListPage
        title="页面配置"
        crumbPath="页面配置"
        subtitle="在此配置监控看板页面与可视化组件，保存为 midDashboards.json 配置文件；贷中监测模块按该配置文件加载并渲染对应的可视化组件"
        addLabel="新建页面"
        onAdd={openAdd}
        actions={<Sam label="读指标库" value="midMetrics.json" />}
        panelTitle="看板页面"
        panelDesc="看板页面按 midDashboards.json 配置文件加载对应的可视化组件（指标卡 / 折线 / 柱状 / 环形 / 明细表），组件引用指标库与数据源"
        columns={cols}
        rows={rows}
        onView={(r) => nav('/console/cm/mid-dashboard-detail?id=' + String(r.id))}
        rowActions={(r) => (
          <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            <Button size="sm" variant="ghost" onClick={() => nav('/console/cm/mid-dashboard-detail?id=' + String(r.id))}>查看</Button>
          </div>
        )}
        editOpen={open}
        editTitle={editing && dashboards.find((d) => d.id === editing.id) ? '编辑页面' : '新建页面'}
        onCloseEdit={() => setOpen(false)}
        onSave={save}
        modalWidth="max-w-4xl"
      >
        {editing && <Editor value={editing} metrics={metrics} sources={sources}
          onChange={setEditing} onRemove={() => { if (editing) { remove(editing.id); setOpen(false); setEditing(null); } }} />}
      </ConfigListPage>

      {/* 新建页面弹窗（名称 / 说明 / 分组，分组下拉可新建）——必须放 ConfigListPage 外，否则被其编辑 Modal 吞掉 */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="新建页面" width="max-w-md"
        footer={<>
          <Button onClick={doCreate} disabled={!newName.trim()}>创建</Button>
          <Button variant="secondary" onClick={() => setShowNew(false)}>取消</Button>
        </>}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569' }}>页面名称
            <input style={inp} value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="如：贷中监控大盘" />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569' }}>页面说明
            <input style={inp} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="描述该看板页面用途（可选）" />
          </label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569' }}>分组
            <GroupSelect value={newGroup} groups={dashboards.map((d) => d.group)} onChange={setNewGroup} />
          </label>
        </div>
      </Modal>
    </>
  );
}

export function Editor({ value, metrics, sources, onChange, onRemove }: {
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
          <span style={{ fontSize: 13, fontWeight: 500 }}>可视化组件 <Sam value="midDashboards.json.widgets" /></span>
          <Button size="sm" variant="secondary" onClick={addWidget}>添加组件</Button>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {value.widgets.map((w, i) => (
            <div key={w.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: 10, background: '#FAFAFB' }}>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                <label style={lbl}>标题<input style={inpSm} value={w.title} onChange={(e) => setWidget(i, { title: e.target.value })} /></label>
                <label style={lbl}>类型
                  <SingleSelect label="选择类型" value={w.type} onChange={(v) => setWidget(i, { type: v as WidgetType })}
                    options={(Object.keys(WTYPE_LABEL) as WidgetType[]).map((t) => ({ value: t, label: WTYPE_LABEL[t] }))} />
                </label>
                {w.type === 'productMetrics' ? (
                  <label style={lbl}>评分产品
                    <SingleSelect label="选择产品" value={w.product ?? 'zhixin'} onChange={(v) => setWidget(i, { product: v })}
                      options={[{ value: 'zhixin', label: '智信分' }, { value: 'zhirong', label: '智融分' }, { value: 'zhicha', label: '智查分' }]} />
                  </label>
                ) : (
                  <>
                <label style={lbl}>数据集（数据源）
                  <SingleSelect label="选择数据集" value={w.datasetId} onChange={(v) => setWidget(i, { datasetId: v })}
                    options={sources.map((s) => ({ value: s.id, label: s.name }))} />
                </label>
                <label style={lbl}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>监控指标 <Sam label="读指标库" value="midMetrics.json" /></span>
                  <MetricPicker metrics={metrics} value={w.metricIds ?? (w.metricId ? [w.metricId] : [])}
                    onChange={(v) => setWidget(i, { metricIds: v, metricId: v[0] ?? '' })} />
                </label>
                  </>
                )}
                <label style={lbl}>跨列
                  <SingleSelect label="跨列" value={String(w.span ?? 1)} onChange={(v) => setWidget(i, { span: Number(v) as 1 | 2 })}
                    options={[{ value: '1', label: '1 列' }, { value: '2', label: '2 列' }]} />
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
