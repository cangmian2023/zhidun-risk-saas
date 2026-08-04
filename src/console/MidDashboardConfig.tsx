// ④ 监控页面配置（管理中心 · 贷中监控配置）— 页面 + 组件 + 下钻 + 全局筛选，监控内容来自指标库
import { useState } from 'react';
import { PageHeader, Panel, Button, DataTable, Modal } from '../components/ui';
import type { Column } from '../components/ui';
import { useMidDataSources, useMidMetrics, useMidDashboards, updateDashboards, midNewId, useMidSaveStatus } from './midStore';
import { MidSaveToast, Cfg, Sam, Cal } from './SourceTag';
import { computeAgg, evalMetricFormula } from './midData';
import type { MidDashboardPage, MidWidget, WidgetType, MidPageFilter } from './midData';

const WTYPE_LABEL: Record<WidgetType, string> = { metric: '指标卡', line: '折线图', bar: '柱状图', donut: '环形图', table: '数据表' };
const WTYPE_COLOR: Record<WidgetType, string> = { metric: '#2563EB', line: '#0F766E', bar: '#7C3AED', donut: '#D97706', table: '#475569' };

export default function MidDashboardConfig() {
  const dataSources = useMidDataSources();
  const metrics = useMidMetrics();
  const dashboards = useMidDashboards();
  const saveStatus = useMidSaveStatus();
  const [activeId, setActiveId] = useState<string | null>(dashboards[0]?.id ?? null);
  const [editingWidget, setEditingWidget] = useState<{ pageId: string; widget: MidWidget } | null>(null);
  const [showFilter, setShowFilter] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const active = dashboards.find((p) => p.id === activeId) ?? null;
  const dsName = (id: string) => dataSources.find((d) => d.id === id)?.name ?? id;
  const metricName = (id: string) => metrics.find((m) => m.id === id)?.name ?? id;

  const patchPage = (next: MidDashboardPage) => {
    updateDashboards((l) => l.map((p) => (p.id === next.id ? next : p)));
  };
  const patchWidget = (pageId: string, widget: MidWidget) => {
    const p = dashboards.find((x) => x.id === pageId);
    if (!p) return;
    const exists = p.widgets.some((w) => w.id === widget.id);
    patchPage({ ...p, widgets: exists ? p.widgets.map((w) => (w.id === widget.id ? widget : w)) : [...p.widgets, widget] });
  };

  const pageCols: Column[] = [
    { key: 'order', label: '#' }, { key: 'name', label: '页面名称' },
    { key: 'group', label: '分组' }, { key: 'widgets', label: '组件数' }, { key: 'enabled', label: '状态', type: 'badge' },
  ];
  const pageRows = [...dashboards].sort((a, b) => a.order - b.order).map((p) => ({
    id: p.id, order: p.order, name: p.name, group: p.group, widgets: p.widgets.length,
    enabled: p.enabled ? '已启用' : '已停用',
  }));

  // 组件实时预览值（灰）：按指标对数据集样例聚合
  const previewValue = (w: MidWidget): number | null => {
    const ds = dataSources.find((d) => d.id === w.datasetId);
    const m = metrics.find((x) => x.id === w.metricId);
    if (!ds || !m) return null;
    if (m.type === 'base') return computeAgg(ds.rows, m.field, m.agg);
    const vals: Record<string, number> = {};
    for (const mm of metrics) {
      if (mm.type === 'base') {
        const d2 = dataSources.find((x) => x.id === mm.dataSourceId);
        if (d2) vals[mm.id] = computeAgg(d2.rows, mm.field, mm.agg);
      }
    }
    return evalMetricFormula(m.formula ?? '', vals);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1280 }}>
      <PageHeader
        title="监控页面配置"
        crumb="管理中心 / 贷中监控配置 / 监控页面配置"
        subtitle="配置监控看板页面与可视化组件（组件度量来自指标库），保存后由「监控看板」渲染"
        actions={<Button onClick={() => setShowNew(true)}>新建页面</Button>}
      />
      <MidSaveToast status={saveStatus} />

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, marginTop: 16 }}>
        <Panel
          title="页面列表"
          desc={<span>启用后动态挂到贷中监控菜单 <Cfg label="页面配置" /></span>}
          actions={active ? (
            <Button size="sm" variant="ghost" onClick={() => {
              if (confirm(`确认删除页面 ${active.name}？`)) updateDashboards((l) => l.filter((p) => p.id !== active.id));
            }}>删除页面</Button>
          ) : undefined}
        >
          <DataTable columns={pageCols} rows={pageRows} clickableKey="id" onCellClick={(r) => setActiveId(r.id as string)} />
        </Panel>

        {active && (
          <Panel
            title={active.name}
            desc={`分组：${active.group} · 排序：${active.order}${active.desc ? ` · ${active.desc}` : ''}`}
            actions={<>
              <Button size="sm" variant="ghost" onClick={() => setShowFilter(true)}>全局筛选</Button>
              <Button size="sm" variant="secondary" onClick={() => patchPage({ ...active, enabled: !active.enabled })}>
                {active.enabled ? '停用' : '启用'}
              </Button>
              <Button size="sm" onClick={() => patchPage({ ...active, widgets: [...active.widgets, { id: midNewId('w'), type: 'metric', title: '新组件', datasetId: dataSources[0]?.id ?? '', metricId: metrics[0]?.id ?? '' }] })}>添加组件</Button>
            </>}
          >
            <div style={{ display: 'grid', gap: 10 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px', gap: 8 }}>
                <div><label style={lb}>页面名称 <Cfg /></label><input style={inp} value={active.name} onChange={(e) => patchPage({ ...active, name: e.target.value })} /></div>
                <div><label style={lb}>分组</label><input style={inp} value={active.group} onChange={(e) => patchPage({ ...active, group: e.target.value })} /></div>
                <div><label style={lb}>排序</label><input style={inp} type="number" value={active.order} onChange={(e) => patchPage({ ...active, order: Number(e.target.value) })} /></div>
                <div><label style={lb}>说明</label><input style={inp} value={active.desc ?? ''} onChange={(e) => patchPage({ ...active, desc: e.target.value })} /></div>
              </div>

              {active.filters && active.filters.length > 0 && (
                <div style={{ fontSize: 12, color: '#64748B', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 6, padding: '6px 10px' }}>
                  全局筛选器：{active.filters.map((f) => `${f.label}（${f.kind === 'dateRange' ? '日期范围' : f.kind === 'select' ? '下拉' : '输入'}）`).join('、')}
                </div>
              )}

              <div style={{ display: 'grid', gap: 8 }}>
                {active.widgets.map((w, i) => {
                  const pv = previewValue(w);
                  return (
                    <div key={w.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 12, background: '#fff' }}>
                      <span style={{ width: 6, height: 34, borderRadius: 3, background: WTYPE_COLOR[w.type] }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{w.title}
                          <span style={{ marginLeft: 6, fontSize: 11, color: '#94A3B8' }}>{WTYPE_LABEL[w.type]}</span>
                          {w.drill?.type === 'detail' && <span style={{ marginLeft: 6, fontSize: 11, color: '#7C3AED' }}>↳ 可下钻个体</span>}
                        </div>
                        <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                          {dsName(w.datasetId)} · 指标 <b>{metricName(w.metricId)}</b>
                          {w.dimensions?.length ? ` · 维度 ${w.dimensions.join('/')}` : ''}
                          {w.span === 2 ? ' · 通栏' : ''}
                        </div>
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', minWidth: 60, textAlign: 'right' }}>
                        {pv !== null ? pv : '—'} <Cal label="预览" />
                      </div>
                      <Button size="sm" variant="secondary" onClick={() => setEditingWidget({ pageId: active.id, widget: w })}>配置</Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        const up = i > 0 ? i - 1 : i;
                        const arr = [...active.widgets];
                        arr.splice(i, 1);
                        arr.splice(up, 0, w);
                        patchPage({ ...active, widgets: arr });
                      }}>↑</Button>
                      <Button size="sm" variant="ghost" onClick={() => patchPage({ ...active, widgets: active.widgets.filter((x) => x.id !== w.id) })}>×</Button>
                    </div>
                  );
                })}
                {active.widgets.length === 0 && <div style={{ color: '#94A3B8', textAlign: 'center', padding: 20, fontSize: 13 }}>暂无组件，点击右上「添加组件」</div>}
              </div>

              <div style={{ fontSize: 12, color: '#94A3B8' }}>
                <Sam label="样例数据" /> 用于预览聚合值；<Cal label="实时计算" /> 为指标对样例数据实时聚合（不落盘）；<Cfg label="配置JSON" /> 为页面配置。
              </div>
            </div>
          </Panel>
        )}
      </div>

      {editingWidget && renderWidgetEditor(editingWidget.pageId, editingWidget.widget, patchWidget, () => setEditingWidget(null), dataSources, metrics)}

      <Modal open={showFilter} onClose={() => setShowFilter(false)} title="全局筛选器配置" footer={<Button onClick={() => setShowFilter(false)}>完成</Button>}>
        {active && (
          <div style={{ display: 'grid', gap: 8 }}>
            {(active.filters ?? []).map((f, i) => (
              <div key={f.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <input value={f.label} onChange={(e) => {
                  const fs = [...(active.filters ?? [])];
                  fs[i] = { ...f, label: e.target.value };
                  patchPage({ ...active, filters: fs });
                }} style={{ ...inp, flex: 1 }} placeholder="筛选器名称" />
                <select style={sel} value={f.kind} onChange={(e) => {
                  const fs = [...(active.filters ?? [])];
                  fs[i] = { ...f, kind: e.target.value as MidPageFilter['kind'] };
                  patchPage({ ...active, filters: fs });
                }}>
                  <option value="dateRange">日期范围</option><option value="select">下拉</option><option value="input">输入</option>
                </select>
                <Button variant="ghost" size="sm" onClick={() => patchPage({ ...active, filters: (active.filters ?? []).filter((x) => x.id !== f.id) })}>删</Button>
              </div>
            ))}
            <Button size="sm" variant="secondary" onClick={() => patchPage({ ...active, filters: [...(active.filters ?? []), { id: midNewId('flt'), label: '新筛选', kind: 'select' }] })}>添加筛选器</Button>
          </div>
        )}
      </Modal>

      <Modal open={showNew} onClose={() => setShowNew(false)} title="新建监控页面" footer={<>
        <Button variant="secondary" onClick={() => setShowNew(false)}>取消</Button>
        <Button onClick={() => {
          const maxOrder = dashboards.reduce((m, p) => Math.max(m, p.order), -1);
          const pg: MidDashboardPage = {
            id: midNewId('db'), key: `cr:mid-${Date.now().toString(36)}`, name: '新监控页面',
            group: '自定义', order: maxOrder + 1, enabled: true, widgets: [],
          };
          updateDashboards((l) => [...l, pg]);
          setActiveId(pg.id);
          setShowNew(false);
        }}>创建</Button>
      </>}>
        <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.7 }}>
          创建后将生成空白页面，可添加组件（组件度量来自指标库）。<br />启用后自动挂到「贷中监控」菜单，由监控看板渲染。
        </div>
      </Modal>
    </div>
  );
}

function renderWidgetEditor(
  pageId: string, w: MidWidget,
  patchWidget: (pid: string, w: MidWidget) => void,
  close: () => void,
  dataSources: ReturnType<typeof useMidDataSources>,
  metrics: ReturnType<typeof useMidMetrics>,
) {
  const set = (p: Partial<MidWidget>) => patchWidget(pageId, { ...w, ...p });
  const ds = dataSources.find((d) => d.id === w.datasetId);
  const metric = metrics.find((m) => m.id === w.metricId);
  const dimFields = (ds?.fields ?? []).filter((f) => f.kind === 'dim');
  const preview = (() => {
    if (!ds || !metric) return null;
    if (metric.type === 'base') return computeAgg(ds.rows, metric.field, metric.agg);
    const vals: Record<string, number> = {};
    for (const mm of metrics) {
      if (mm.type === 'base') {
        const d2 = dataSources.find((x) => x.id === mm.dataSourceId);
        if (d2) vals[mm.id] = computeAgg(d2.rows, mm.field, mm.agg);
      }
    }
    return evalMetricFormula(metric.formula ?? '', vals);
  })();

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={close}>
      <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 640, boxShadow: '0 8px 30px rgba(0,0,0,.15)' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>组件配置 <Cfg label="组件配置" /></div>
        <div style={{ display: 'grid', gap: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lb}>组件标题</label><input style={inp} value={w.title} onChange={(e) => set({ title: e.target.value })} /></div>
            <div><label style={lb}>图表类型</label>
              <select style={sel} value={w.type} onChange={(e) => set({ type: e.target.value as WidgetType })}>
                {(Object.keys(WTYPE_LABEL) as WidgetType[]).map((t) => <option key={t} value={t}>{WTYPE_LABEL[t]}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div><label style={lb}>数据源（数据集）</label>
              <select style={sel} value={w.datasetId} onChange={(e) => set({ datasetId: e.target.value, dimensions: [] })}>
                {dataSources.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div><label style={lb}>指标（来自指标库）</label>
              <select style={sel} value={w.metricId} onChange={(e) => set({ metricId: e.target.value })}>
                {metrics.map((m) => <option key={m.id} value={m.id}>{m.name}（{m.id}）</option>)}
              </select>
            </div>
          </div>
          {w.type !== 'metric' && (
            <div><label style={lb}>维度字段（分组）</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {dimFields.map((f) => (
                  <button key={f.key} onClick={() => {
                    const has = (w.dimensions ?? []).includes(f.key);
                    set({ dimensions: has ? (w.dimensions ?? []).filter((x) => x !== f.key) : [...(w.dimensions ?? []), f.key] });
                  }} style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    border: (w.dimensions ?? []).includes(f.key) ? '1px solid #2563EB' : '1px solid #E2E8F0',
                    background: (w.dimensions ?? []).includes(f.key) ? '#EFF6FF' : '#fff',
                    color: (w.dimensions ?? []).includes(f.key) ? '#1D4ED8' : '#475569',
                  }}>{f.label}</button>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <div><label style={lb}>下钻个体</label>
              <select style={sel} value={w.drill?.type ?? 'none'} onChange={(e) => set({ drill: { type: e.target.value as 'none' | 'detail', rowKey: w.drill?.rowKey ?? 'cust_id' } })}>
                <option value="none">不启用</option><option value="detail">点击进个体详情</option>
              </select>
            </div>
            <div><label style={lb}>个体主键</label>
              <select style={sel} value={w.drill?.rowKey ?? 'cust_id'} onChange={(e) => set({ drill: { type: 'detail', rowKey: e.target.value } })} disabled={w.drill?.type !== 'detail'}>
                {dimFields.map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </div>
            <div><label style={lb}>宽度</label>
              <select style={sel} value={String(w.span ?? 1)} onChange={(e) => set({ span: Number(e.target.value) as 1 | 2 })}>
                <option value="1">半宽</option><option value="2">通栏</option>
              </select>
            </div>
          </div>
          {w.type === 'table' && (
            <div><label style={lb}>表格列（维度字段，按点击顺序）</label>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                {(w.dimensions ?? []).map((k) => dimFields.find((f) => f.key === k)?.label ?? k).join(' / ') || '请在「维度字段」选择'}
              </div>
            </div>
          )}
          <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>实时预览</span>
            <Cal label="样例数据聚合" value={preview !== null ? (metric?.precision != null && metric.precision > 0 ? preview.toFixed(metric.precision) : preview) : undefined} />
            <Sam label="数据集" value={ds?.name} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 6 }}>
            <Button variant="secondary" onClick={close}>关闭</Button>
            <Button onClick={close}>保存</Button>
          </div>
        </div>
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
