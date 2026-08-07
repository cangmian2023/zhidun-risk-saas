// 监控页面配置详情（管理中心）— 默认预览态，标题/描述可直接编辑；
// 预览态每个组件卡片有「编辑」「删除」按钮；预览标题行有「添加」按钮新增组件。
// 编辑态弹窗字段对应 record/temp/08071 文档第二点，首位移入与监控任务一致的指标选择器（多选）。
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, Modal } from '../components/ui';
import { Sam } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidDashboards, updateDashboards, useMidMetrics, useMidDataSources, midNewId } from './midStore';
import { type MidWidget, type WidgetType } from './midData';
import { WidgetView } from './MidDashboardPage';
import { MetricPicker } from './MidMonitorConfig';

const inp: React.CSSProperties = { height: 34, border: '1px solid #CBD5E1', borderRadius: 8, padding: '0 10px', fontSize: 13, outline: 'none', background: '#fff' };
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{label}</span>
    {children}
  </div>
);

const TIME_GRAN = ['实时', '分钟', '小时', '天', '周', '月'];
const CHART_TYPES: { key: WidgetType | 'stack'; label: string }[] = [
  { key: 'line', label: '折线' },
  { key: 'bar', label: '柱状' },
  { key: 'donut', label: '环形' },
  { key: 'stack', label: '堆叠' },
  { key: 'table', label: '表格' },
  { key: 'metric', label: '数值' },
];
const EXTRA_OPTS = ['数值标签', '图例', '网格线', '数据标签'];

function ChartIcon({ k }: { k: string }) {
  const c = '#475569';
  const common = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: c, strokeWidth: 1.8 } as const;
  if (k === 'line') return <svg {...common}><polyline points="3,17 9,9 15,13 21,5" /></svg>;
  if (k === 'bar') return <svg {...common}><rect x="4" y="11" width="4" height="9" /><rect x="10" y="6" width="4" height="14" /><rect x="16" y="13" width="4" height="7" /></svg>;
  if (k === 'donut') return <svg {...common}><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3" fill="#fff" /></svg>;
  if (k === 'stack') return <svg {...common}><rect x="4" y="13" width="5" height="7" /><rect x="4" y="8" width="5" height="5" /><rect x="11" y="10" width="5" height="10" /><rect x="11" y="6" width="5" height="3" /><rect x="18" y="6" width="3" height="14" /></svg>;
  if (k === 'table') return <svg {...common}><rect x="4" y="5" width="16" height="14" /><line x1="4" y1="10" x2="20" y2="10" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="11" y1="5" x2="11" y2="19" /></svg>;
  return <svg {...common}><text x="6" y="17" fontSize="13" fill={c} stroke="none" fontFamily="monospace">123</text></svg>;
}

function WidgetEditModal({ w, metrics, isNew, onClose, onSave }: {
  w: MidWidget; metrics: { id: string; name: string; group?: string }[]; isNew?: boolean;
  onClose: () => void; onSave: (nw: MidWidget) => void;
}) {
  const [draft, setDraft] = useState<MidWidget>(JSON.parse(JSON.stringify(w)));
  const [chart, setChart] = useState<WidgetType | 'stack'>(w.type);
  const set = (patch: Partial<MidWidget>) => setDraft((d) => ({ ...d, ...patch }));
  const toggleExtra = (s: string) => setDraft((d) => {
    const cur = d.showExtra ?? [];
    return { ...d, showExtra: cur.includes(s) ? cur.filter((x) => x !== s) : [...cur, s] };
  });
  const save = () => {
    const finalType: WidgetType = chart === 'stack' ? 'bar' : chart;
    const span: 1 | 2 = (draft.windowSize ?? 'md') === 'lg' ? 2 : 1;
    onSave({ ...draft, type: finalType, span });
  };
  return (
    <Modal open onClose={onClose} title={isNew ? '新增组件' : `编辑组件 · ${w.title}`} width="max-w-3xl"
      footer={<><Button variant="secondary" onClick={onClose}>取消</Button><Button variant="primary" onClick={save}>保存</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 1. 名称 */}
        <Field label="名称">
          <input style={inp} value={draft.title} onChange={(e) => set({ title: e.target.value })} />
        </Field>
        {/* 2. 选择指标（与监控任务指标选择器保持一致，支持多选） */}
        <Field label="选择指标">
          <MetricPicker metrics={metrics} value={draft.metricIds ?? (draft.metricId ? [draft.metricId] : [])}
            onChange={(v) => set({ metricIds: v, metricId: v[0] ?? '' })} />
        </Field>
        {/* 3. 时间粒度 */}
        <Field label="时间粒度">
          <select style={inp} value={draft.timeGranularity ?? '天'} onChange={(e) => set({ timeGranularity: e.target.value })}>
            {TIME_GRAN.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        {/* 4. 图表类型 */}
        <Field label="图表类型">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CHART_TYPES.map((t) => (
              <button key={t.key} type="button" onClick={() => setChart(t.key)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, width: 64, padding: '8px 0', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: chart === t.key ? '#2563EB' : '#475569', border: chart === t.key ? '1px solid #2563EB' : '1px solid #E2E8F0', background: chart === t.key ? '#EFF6FF' : '#fff' }}>
                <ChartIcon k={t.key} />
                {t.label}
              </button>
            ))}
          </div>
        </Field>
        {/* 5. 同时显示 */}
        <Field label="同时显示">
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {EXTRA_OPTS.map((s) => (
              <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" checked={(draft.showExtra ?? []).includes(s)} onChange={() => toggleExtra(s)} />
                {s}
              </label>
            ))}
          </div>
        </Field>
        {/* 6. 窗口尺寸 */}
        <Field label="窗口尺寸">
          <select style={inp} value={draft.windowSize ?? 'md'} onChange={(e) => set({ windowSize: e.target.value as 'sm' | 'md' | 'lg' })}>
            <option value="sm">小</option>
            <option value="md">中</option>
            <option value="lg">大（跨 2 列）</option>
          </select>
        </Field>
        {/* 7. 备注 */}
        <Field label="备注">
          <textarea style={{ ...inp, height: 64, padding: '8px 10px', resize: 'vertical' }} value={draft.remark ?? ''} onChange={(e) => set({ remark: e.target.value })} />
        </Field>
      </div>
    </Modal>
  );
}

export default function MidDashboardDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const dashboards = useMidDashboards();
  const metrics = useMidMetrics();
  const sources = useMidDataSources();
  const nav = useNavigate();
  const d = dashboards.find((x) => x.id === id);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [editW, setEditW] = useState<MidWidget | null>(null);
  const [editIsNew, setEditIsNew] = useState(false);

  // 页面切换时同步标题/描述草稿
  useEffect(() => {
    if (d) { setTitle(d.name); setDesc(d.desc ?? ''); }
  }, [d?.id, d?.name, d?.desc]);

  const savePage = () => {
    if (!d) return;
    updateDashboards((list) => list.map((pg) => pg.id === d.id ? { ...pg, name: title, desc } : pg));
  };

  const openAdd = () => {
    setEditW({ id: midNewId('w'), type: 'donut', title: '新组件', datasetId: sources[0]?.id ?? '', metricId: '', metricIds: [], dimensions: [], span: 1, drill: { type: 'none', title: '' } });
    setEditIsNew(true);
  };
  const openEditW = (w: MidWidget) => { setEditW(JSON.parse(JSON.stringify(w))); setEditIsNew(false); };
  const saveWidget = (nw: MidWidget) => {
    if (!d) return;
    updateDashboards((list) => list.map((pg) => pg.id === d.id
      ? { ...pg, widgets: pg.widgets.some((x) => x.id === nw.id) ? pg.widgets.map((x) => (x.id === nw.id ? nw : x)) : [...pg.widgets, nw] }
      : pg));
    setEditW(null);
  };
  const delW = (wid: string) => {
    if (!d) return;
    if (!window.confirm('确认删除该组件？')) return;
    updateDashboards((list) => list.map((pg) => pg.id === d.id ? { ...pg, widgets: pg.widgets.filter((x) => x.id !== wid) } : pg));
  };

  if (!d) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageShell title="页面配置详情" crumb="零售信贷风控 / 管理中心 / 页面配置" actions={<Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>} />
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">未找到该页面（{id}）。</div>
      </div>
    );
  }

  const header = (
    <div className="sticky top-14 z-30 -mx-4 border-b border-slate-100 bg-slate-50 px-4 pb-5 pt-1 lg:-mx-8 lg:px-8">
      <style>{`
        .dash-edit-input { background: transparent; border: 1px solid transparent; border-radius: 8px; transition: border-color .15s, background .15s; }
        .dash-edit-input:hover { border-color: #E2E8F0; }
        .dash-edit-input:focus { background: #fff; border-color: #C7D2FE; outline: none; }
      `}</style>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-brand-600">零售信贷风控 / 管理中心 / 页面配置</p>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="dash-edit-input"
            style={{ marginTop: 4, width: '100%', maxWidth: 520, fontSize: 24, fontWeight: 700, letterSpacing: '-0.01em', color: '#0F172A', padding: '4px 10px' }} />
          <input value={desc} onChange={(e) => setDesc(e.target.value)} className="dash-edit-input"
            style={{ marginTop: 6, width: '100%', maxWidth: 720, fontSize: 13, lineHeight: '1.5', color: '#64748B', padding: '4px 10px' }} />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Sam value="midMetrics.json" />
          <Sam value="midDashboards.json" />
          <Button size="sm" variant="primary" onClick={savePage}>保存</Button>
          <Button size="sm" variant="secondary" onClick={() => nav('/console/cm/mid-dashboard-config')}>返回列表</Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 lg:px-8">
      <PageShell header={header} />
      <div className="mb-1 flex items-center gap-1 text-xs text-slate-400" style={{ marginTop: -6 }}>
        数据来源：<Sam label="页面配置" value="midDashboards.json" /><Sam label="指标来源" value="midMetrics.json" />
      </div>

      {/* 可视化组件预览（默认预览态，每卡片可编辑/删除；标题行可添加组件） */}
      <Panel title="可视化组件预览" desc={<>详情页默认预览态，每个组件卡片点「编辑」可调整（编辑态字段对应 record/temp/08071 文档第二点） <Sam value="midDashboards.json.widgets" /></>}
        actions={<Button size="sm" variant="primary" onClick={openAdd}>添加组件</Button>}>
        {d.widgets.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2">
            {d.widgets.map((w) => {
              const ds = sources.find((s) => s.id === w.datasetId);
              const metric = metrics.find((m) => m.id === w.metricId);
              const rows = (ds?.rows ?? []) as Record<string, unknown>[];
              return (
                <div key={w.id} className={w.span === 2 ? 'sm:col-span-2' : ''}>
                  <WidgetView w={w} ds={ds} metric={metric} metrics={metrics} rows={rows} onDrill={() => {}} nav={nav}
                    onEdit={() => openEditW(w)} onDelete={() => delW(w.id)} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-sm text-slate-400">暂无可视化组件，点击右上角「添加组件」。</div>
        )}
      </Panel>

      {/* 单组件弹窗（新增 / 编辑，对应 08071 文档第二点 编辑状态） */}
      {editW && (
        <WidgetEditModal w={editW} metrics={metrics} isNew={editIsNew}
          onClose={() => setEditW(null)} onSave={saveWidget} />
      )}
    </div>
  );
}
