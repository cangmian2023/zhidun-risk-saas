// 监控页面配置详情（管理中心）— 默认预览态，标题/描述可直接编辑；
// 预览态每个组件卡片有「编辑」「删除」按钮；预览标题行有「添加」按钮新增组件。
// 编辑态弹窗字段对应 record/temp/08071 文档第二点，首位移入与监控任务一致的指标选择器（多选）。
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, Modal, DetailHeader, SearchSelect, SingleSelect } from '../components/ui';
import type { SearchSelectOption, SearchSelectGroup } from '../components/ui';
import { Sam } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidDashboards, updateDashboards, useMidMetrics, useMidDataSources, midNewId } from './midStore';
import { type MidWidget, type WidgetType } from './midData';
import { WidgetView } from './MidDashboardPage';
import { MetricPicker } from './MidMonitorConfig';
import GroupSelect from './GroupSelect';
import FlowActionBar from './FlowActionBar';
import { useFlows } from './flowStore';

/* 业务流程按业务域分组（关联业务流程下拉） */
const FLOW_DOMAIN_LABEL: Record<string, string> = {
  info_verify: '信息核验', credit: '信用风控', fraud: '欺诈识别', decision: '进件审核', online_approve: '上线审核',
};

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

function WidgetEditModal({ w, metrics, flows, isNew, onClose, onSave }: {
  w: MidWidget; metrics: { id: string; name: string; group?: string }[]; flows: { id: string; name: string; domain?: string }[];
  isNew?: boolean; onClose: () => void; onSave: (nw: MidWidget) => void;
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
    const span: 1 | 2 | 3 = draft.windowSize === 'lg' ? 3 : draft.windowSize === 'sm' ? 1 : 2;
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
          <SingleSelect label="时间粒度" fullWidth value={draft.timeGranularity ?? '天'} onChange={(v) => set({ timeGranularity: v })}
            options={TIME_GRAN.map((g) => ({ value: g, label: g }))} />
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
        {/* 5.5 关联业务流程（需求23：组件级关联，渲染时顶部显示流程操作行） */}
        <Field label="关联业务流程">
          <SearchSelect options={flows.map((f) => ({ value: f.id, label: f.name, group: f.domain ?? '' }))}
            groups={Array.from(new Set(flows.map((f) => f.domain ?? ''))).filter(Boolean).map((d) => ({ key: d, label: FLOW_DOMAIN_LABEL[d] ?? d }))}
            value={draft.flowKey ?? ''}
            onChange={(v) => set({ flowKey: String(v) || undefined })}
            placeholder="选择关联的业务流程（可留空）" width="100%" portal />
        </Field>
        {/* 6. 窗口尺寸 */}
        <Field label="窗口尺寸">
          <SingleSelect label="窗口尺寸" fullWidth value={draft.windowSize ?? 'md'} onChange={(v) => set({ windowSize: v as 'sm' | 'md' | 'lg' })}
            options={[{ value: 'sm', label: '小（占 1 列）' }, { value: 'md', label: '中（占 2 列）' }, { value: 'lg', label: '大（占整行 3 列）' }]} />
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
  const flows = useFlows();
  const nav = useNavigate();
  const d = dashboards.find((x) => x.id === id);

  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [group, setGroup] = useState('');
  const [editW, setEditW] = useState<MidWidget | null>(null);
  const [editIsNew, setEditIsNew] = useState(false);

  // 页面切换时同步标题/描述/分组草稿
  useEffect(() => {
    if (d) { setTitle(d.name); setDesc(d.desc ?? ''); setGroup(d.group ?? ''); }
  }, [d?.id, d?.name, d?.desc, d?.group]);

  const savePage = () => {
    if (!d) return;
    updateDashboards((list) => list.map((pg) => pg.id === d.id ? { ...pg, name: title, desc, group } : pg));
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
        <PageShell header={<DetailHeader title="页面配置详情" crumb="零售信贷风控 / 管理中心 / 页面配置" backLabel="返回列表" backTo="/console/cm/mid-dashboard-config" />} />
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">未找到该页面（{id}）。</div>
      </div>
    );
  }

  // 统一用 DetailHeader（返回+面包屑第一行，标题+操作第二行）；标题/分组/描述行内编辑
  const header = (
    <DetailHeader
      title={<input value={title} onChange={(e) => setTitle(e.target.value)} className="dash-edit-input"
        style={{ marginTop: 2, fontSize: 20, fontWeight: 700, letterSpacing: '-0.01em', color: '#0F172A', padding: '4px 10px', width: 360 }} />}
      subtitle={<div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: '#64748B' }}>分组</span>
        <GroupSelect value={group} groups={dashboards.map((x) => x.group)} onChange={setGroup} width={140} />
        <input value={desc} onChange={(e) => setDesc(e.target.value)} className="dash-edit-input" placeholder="页面说明（可选）"
          style={{ flex: 1, minWidth: 220, maxWidth: 480, fontSize: 12, color: '#64748B', padding: '2px 10px' }} />
      </div>}
      crumb="零售信贷风控 / 管理中心 / 页面配置"
      backLabel="返回列表" backTo="/console/cm/mid-dashboard-config"
      flowBar={<FlowActionBar flowId={d?.flowKey} state={d?.flowState}
        onStateChange={(s) => updateDashboards((list) => list.map((pg) => pg.id === d.id ? { ...pg, flowState: s } : pg))} onSave={savePage} />}
      actions={<><Sam value="midMetrics.json" /><Sam value="midDashboards.json" /></>}
    />
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 lg:px-8">
      <style>{`
        .dash-edit-input { background: transparent; border: 1px solid transparent; border-radius: 8px; transition: border-color .15s, background .15s; }
        .dash-edit-input:hover { border-color: #E2E8F0; }
        .dash-edit-input:focus { background: #fff; border-color: #C7D2FE; outline: none; }
      `}</style>
      <PageShell header={header} />
      <div className="mb-1 flex items-center gap-1 text-xs text-slate-400" style={{ marginTop: -6 }}>
        数据来源：<Sam label="页面配置" value="midDashboards.json" /><Sam label="指标来源" value="midMetrics.json" />
      </div>

      {/* 可视化组件预览（默认预览态，每卡片可编辑/删除；标题行可添加组件） */}
      <Panel title="可视化组件预览" desc={<>详情页默认预览态，每个组件卡片点「编辑」可调整（编辑态字段对应 record/temp/08071 文档第二点） <Sam value="midDashboards.json.widgets" /></>}
        actions={<Button size="sm" variant="primary" onClick={openAdd}>添加组件</Button>}>
        {d.widgets.length > 0 ? (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {d.widgets.map((w) => {
              const ds = sources.find((s) => s.id === w.datasetId);
              const metric = metrics.find((m) => m.id === w.metricId);
              const rows = (ds?.rows ?? []) as Record<string, unknown>[];
              const cs = w.windowSize === 'lg' ? 'sm:col-span-3' : w.windowSize === 'sm' ? 'sm:col-span-1' : 'sm:col-span-2';
              return (
                <div key={w.id} className={`${cs} h-full`}>
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
        <WidgetEditModal w={editW} metrics={metrics} flows={flows} isNew={editIsNew}
          onClose={() => setEditW(null)} onSave={saveWidget} />
      )}
    </div>
  );
}
