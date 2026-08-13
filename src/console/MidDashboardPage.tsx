// ⑤ 监控看板（使用域）— 读页面样例 midDashboards.json 橘；数据源样例 橘；实时计算 灰
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable, RightDrawer } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { LineChart, BarChart, DonutChart } from '../components/charts';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import FlowActionBar from './FlowActionBar';
import { useMidDashboards, useMidDataSources, useMidMetrics, updateDataSources } from './midStore';
import {
  type MidDashboardPage, type MidWidget, type MidPageFilter, type MidDataSource, type MidMetric,
  resolveMetricsForRows, groupRowsByDim, LEVEL_META,
} from './midData';

const PALETTE = ['#2563EB', '#0891B2', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#CA8A04', '#475569'];
const inp: React.CSSProperties = { padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' };
/* 数据集 → 默认业务流程（需求27/覆盖所有明细：行无流程、组件无流程时兜底到数据集默认流程，保证每个明细都有流程按钮） */
const DATA_FLOW_MAP: Record<string, string> = {
  ds_alert: 'f-alert-dispose',
  ds_loan: 'f-loan-collect',
  ds_sql_demo: 'f-loan-collect',
  ds_customer: 'f-cust-operate',
  ds_behavior: 'f-behavior-promote',
  ds_api_demo: 'f-credit-check',
  ds_event: 'f-event-analyze',
};

export default function MidDashboardPage({ pageKey }: { pageKey: string }) {
  const dashboards = useMidDashboards();
  const sources = useMidDataSources();
  const metrics = useMidMetrics();
  const nav = useNavigate();

  const page = useMemo(() => dashboards.find((d) => d.key === pageKey), [dashboards, pageKey]);
  const dsById = (id: string) => sources.find((s) => s.id === id);
  const metricById = (id: string) => metrics.find((m) => m.id === id);

  // 页面级交叉筛选
  const [filters, setFilters] = useState<Record<string, any>>({});

  if (!page) {
    return <div style={{ padding: 24 }}><PageShell title="监控看板" crumb="零售信贷风控 / 贷中监控" subtitle="暂无页面配置" /></div>;
  }

  // 数据集（页面组件涉及的所有数据源）
  const pageDs = Array.from(new Set(page.widgets.map((w) => w.datasetId))).map(dsById).filter(Boolean) as MidDataSource[];

  const applyFilters = (rows: Record<string, unknown>[], fs: MidPageFilter[]) =>
    rows.filter((r) => fs.every((f) => {
      const v = filters[f.id];
      if (v == null || v === '' || (Array.isArray(v) && !v.length)) return true;
      const cell = String(r[f.field ?? ''] ?? '');
      if (f.kind === 'select') return cell === String(v);
      if (f.kind === 'dateRange') {
        const from = v?.from, to = v?.to;
        if (from && cell < from) return false;
        if (to && cell > to) return false;
        return true;
      }
      if (f.kind === 'input') return JSON.stringify(r).includes(String(v));
      return true;
    }));

  const filteredRows = (dsId: string) => applyFilters(dsById(dsId)?.rows ?? [], page.filters ?? []);

  const drillTo = (w: MidWidget) => {
    if ((w.drill?.type ?? 'none') === 'none' || !w.drill?.rowKey) return;
    const rows = filteredRows(w.datasetId);
    const firstCust = rows.find((r) => r[w.drill!.rowKey!])?.[w.drill!.rowKey!];
    if (firstCust) nav(`/console/cr/mid-single-cust?cust=${firstCust}`);
  };

  // 需求18：组件「数据详情」→ 左侧嵌套抽屉（外层=明细列表，内层=行数据详情两列）
  const [dlWidget, setDlWidget] = useState<MidWidget | null>(null);
  const [dlOpen, setDlOpen] = useState(false);
  const [dlRow, setDlRow] = useState<number | null>(null);
  const openDetail = (w: MidWidget) => { setDlWidget(w); setDlRow(null); setDlOpen(true); };
  // 需求23：组件关联流程 → 卡片顶部 + 数据详情抽屉显示流程操作行
  const dlDs = dlWidget ? dsById(dlWidget.datasetId) : undefined;
  const dlMetric = dlWidget ? metricById(dlWidget.metricId) : undefined;
  const dlRows = dlWidget ? filteredRows(dlWidget.datasetId) : [];
  const dlCols: Column[] = (dlDs?.fields ?? []).map((f) => ({ key: f.key, label: f.label ?? f.key, type: 'text' as const }));
  const dlTrows: Row[] = dlRows.map((r, i) => ({ id: String(i), ...Object.fromEntries((dlDs?.fields ?? []).map((f) => [f.key, String(r[f.key] ?? '')])) }));
  const dlRowData = dlRow != null ? dlRows[dlRow] : undefined; // 与抽屉列表同源（筛选后的行），避免下标错位

  return (
    <div style={{ padding: 24, maxWidth: 1280 }}>
      <PageShell title={page.name} crumb={`零售信贷风控 / 贷中监控 / ${page.group}`} subtitle={page.desc}
        actions={<><Sam label="页面配置" value="midDashboards.json" /><Sam label="样例数据" value={`${pageDs.reduce((a, s) => a + (s.rows?.length || 0), 0)} 行`} /><Cal label="实时计算" /></>} />

      {/* 交叉筛选条 */}
      {page.filters && page.filters.length > 0 && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end', margin: '4px 0 16px', padding: 12, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 12 }}>
          {page.filters.map((f) => (
            <FilterControl key={f.id} f={f} rows={pageDs.flatMap((s) => s.rows ?? [])} value={filters[f.id]} onChange={(v) => setFilters((p) => ({ ...p, [f.id]: v }))} />
          ))}
          <button type="button" onClick={() => setFilters({})} style={{ ...inp, cursor: 'pointer', color: '#64748B', borderColor: '#E2E8F0' }}>重置</button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, alignItems: 'stretch' }}>
        {page.widgets.map((w) => (
          <div key={w.id} style={{ gridColumn: `span ${widgetColSpan(w)}`, height: '100%' }}>
            <WidgetView w={w} ds={dsById(w.datasetId)} metric={metricById(w.metricId)} metrics={metrics} rows={filteredRows(w.datasetId)} onDrill={() => drillTo(w)} onDetail={() => openDetail(w)} nav={nav} />
          </div>
        ))}
      </div>

      {/* 外层抽屉：数据明细列表（每行「详情」→ 内层抽屉） */}
      <RightDrawer open={dlOpen} onClose={() => setDlOpen(false)} title={`${dlWidget?.title ?? '组件'} · 数据明细`} width={620} level={1}>
        {dlDs ? (
          <>
            <div style={{ marginBottom: 10, fontSize: 12, color: '#64748B' }}>{dlDs.name} · {dlMetric?.name ?? ''} · {dlRows.length} 行（点击行「详情」查看单行字段名 / 字段值）</div>
            <DataTable columns={dlCols} rows={dlTrows} clickableKey={dlCols[0]?.key} onCellClick={(r) => setDlRow(Number(r.id))}
              actions={(r) => <button type="button" onClick={() => setDlRow(Number(r.id))} style={{ fontSize: 12, color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer' }}>详情</button>}
              pager defaultPageSize={15} empty="暂无数据" />
          </>
        ) : (
          <div style={{ fontSize: 12, color: '#94A3B8' }}>数据集未找到</div>
        )}
      </RightDrawer>

      {/* 内层抽屉：单行数据详情（两列：字段名 | 字段值，叠在外层右侧）—— 流程操作行只显示在这一层顶部
          三级兜底：行.flowKey → 组件 widget.flowKey → 数据集默认流程（DATA_FLOW_MAP），保证所有明细都有流程按钮；
          state 来自该行自己的样例 JSON（per-object 独立），点按钮落盘到该行（按引用匹配，避免筛选后下标错位） */}
      <RightDrawer open={dlOpen && dlRow != null} onClose={() => setDlRow(null)} title={`${dlWidget?.title ?? '组件'} · 数据详情`} width={400} level={2}>
        {dlRowData && dlDs && (
          <FlowActionBar
            flowId={String(dlRowData.flowKey ?? dlWidget?.flowKey ?? DATA_FLOW_MAP[dlWidget?.datasetId ?? ''] ?? '')}
            state={String(dlRowData.flowState ?? '')}
            onStateChange={(s) => updateDataSources((list) => list.map((ds) => {
              if (ds.id !== dlDs.id) return ds;
              return { ...ds, rows: ds.rows.map((r) => r === dlRowData ? { ...r, flowState: s } : r) };
            }))}
          />
        )}
        {dlRowData && dlDs && (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, marginTop: 8 }}>
            <tbody>
              {dlDs.fields.map((f) => (
                <tr key={f.key} style={{ borderTop: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '8px 12px', width: '42%', fontWeight: 600, color: '#334155', background: '#F8FAFC' }}>{f.label ?? f.key}</td>
                  <td style={{ padding: '8px 12px', color: '#0F172A', wordBreak: 'break-all' }}>{String(dlRowData[f.key] ?? '')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </RightDrawer>
    </div>
  );
}

/* 窗口尺寸 → 卡片占列数（3 列网格：小=1/中=2/大=3）；同时驱动图表高度，使三种尺寸视觉可区分 */
export function widgetColSpan(w: MidWidget): 1 | 2 | 3 {
  return w.windowSize === 'lg' ? 3 : w.windowSize === 'sm' ? 1 : 2;
}
function widgetChartH(w: MidWidget): number {
  return w.windowSize === 'lg' ? 300 : w.windowSize === 'sm' ? 170 : 240;
}

export function WidgetView({ w, ds, metric, metrics, rows, onDrill, nav, onEdit, onDelete, onDetail }: {
  w: MidWidget; ds?: MidDataSource; metric?: MidMetric; metrics: MidMetric[];
  rows: Record<string, unknown>[]; onDrill: () => void; nav: (p: string) => void; onEdit?: () => void; onDelete?: () => void;
  onDetail?: (rowIndex?: number) => void; // 需求11：查看详情 → 子页面
}) {
  const H = widgetChartH(w);
  // 需求38：组件说明（hover 角标）——数据源/指标/维度/粒度
  const tip = [
    ds ? `数据源：${ds.name}` : '',
    metric ? `指标：${metric.name}` : '',
    w.dimensions?.length ? `维度：${w.dimensions.join('、')}` : '',
    w.timeGranularity ? `时间粒度：${w.timeGranularity}` : '',
    w.windowSize === 'lg' ? '窗口：大（整行）' : w.windowSize === 'sm' ? '窗口：小（1 列）' : '窗口：中（2 列）',
  ].filter(Boolean).join('\n');
  const editAction = (
    <div style={{ display: 'flex', gap: 6 }}>
      {onDetail && <button type="button" onClick={() => onDetail()} style={{ fontSize: 12, color: '#1D4ED8', background: 'none', border: '1px solid #C7D2FE', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>数据详情</button>}
      {onEdit && <button type="button" onClick={onEdit} style={{ fontSize: 12, color: '#1D4ED8', background: 'none', border: '1px solid #C7D2FE', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>编辑</button>}
      {onDelete && <button type="button" onClick={onDelete} style={{ fontSize: 12, color: '#B91C1C', background: 'none', border: '1px solid #FECACA', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>删除</button>}
    </div>
  );

  if (!ds || !metric) return <Panel title={w.title} actions={editAction} className="h-full" hoverTip={tip}><div style={{ fontSize: 12, color: '#94A3B8' }}>配置缺失：数据集或指标未找到</div></Panel>;

  const vals = resolveMetricsForRows(metrics, rows);

  if (w.type === 'metric') {
    const v = vals[w.metricId] ?? 0;
    return (
      <Panel title={w.title} actions={editAction} className="h-full" hoverTip={tip}>
        <StatCard label={metric.name} value={fmt(v, metric.precision, metric.unit)} accent="brand" />
      </Panel>
    );
  }

  const dim = w.dimensions?.[0];
  if (!dim) return <Panel title={w.title} className="h-full" hoverTip={tip}><div style={{ fontSize: 12, color: '#94A3B8' }}>未配置维度字段</div></Panel>;

  const groups = groupRowsByDim(rows, dim);
  const labels = groups.map((g) => g.key);
  const seriesData = groups.map((g) => resolveMetricsForRows(metrics, g.rows)[w.metricId] ?? 0);
  const colorOf = (k: string) => LEVEL_META[k]?.fill ?? PALETTE[labels.indexOf(k) % PALETTE.length];

  const drillable = (w.drill?.type ?? 'none') !== 'none';
  const footer = drillable ? (
    <div style={{ marginTop: 8, textAlign: 'right' }}>
      <button type="button" onClick={onDrill} style={{ fontSize: 12, color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer' }}>下钻个体明细 →</button>
    </div>
  ) : null;

  if (w.type === 'donut') {
    const data = groups.map((g) => ({ label: g.key, value: resolveMetricsForRows(metrics, g.rows)[w.metricId] ?? 0, color: colorOf(g.key) }));
    return <Panel title={w.title} actions={editAction} className="h-full" hoverTip={tip}>{footer}<DonutChart data={data} centerLabel={metric.name} centerValue={fmt(vals[w.metricId] ?? 0, metric.precision, metric.unit)} height={H} /></Panel>;
  }
  if (w.type === 'bar') {
    return <Panel title={w.title} actions={editAction} className="h-full" hoverTip={tip}>{footer}<BarChart labels={labels} series={[{ name: metric.name, color: '#2563EB', data: seriesData }]} unit={metric.unit ?? ''} height={H} /></Panel>;
  }
  if (w.type === 'line') {
    return <Panel title={w.title} actions={editAction} className="h-full" hoverTip={tip}>{footer}<LineChart labels={labels} series={[{ name: metric.name, color: '#2563EB', data: seriesData }]} unit={metric.unit ?? ''} height={H} /></Panel>;
  }
  // table
  const cols: Column[] = (w.dimensions ?? []).map((d) => {
    const f = ds.fields.find((x) => x.key === d);
    return { key: d, label: f?.label ?? d, type: d === 'level' ? 'badge' : 'text' } as Column;
  });
  const trows: Row[] = rows.map((r, i) => {
    const o: any = { id: String(i) };
    (w.dimensions ?? []).forEach((d) => {
      if (d === 'level' && LEVEL_META[String(r[d])]) o[d] = { v: LEVEL_META[String(r[d])].label, kind: LEVEL_META[String(r[d])].badge };
      else o[d] = String(r[d] ?? '');
    });
    return o as Row;
  });
  const tableActions = (
    <>
      {drillable && <button type="button" onClick={onDrill} style={{ fontSize: 12, color: '#1D4ED8', background: 'none', border: 'none', cursor: 'pointer' }}>下钻 →</button>}
      {editAction}
    </>
  );
  return (
    <Panel title={w.title} actions={tableActions} className="h-full" hoverTip={tip}>
      <DataTable columns={cols} rows={trows} clickableKey={w.dimensions?.[0]} onCellClick={(r) => { if (drillable && w.drill?.rowKey) { const raw = rows[Number(r.id)]; const cid = raw?.[w.drill.rowKey]; if (cid) nav(`/console/cr/mid-single-cust?cust=${cid}`); } }} />
    </Panel>
  );
}

function FilterControl({ f, rows, value, onChange }: { f: MidPageFilter; rows: Record<string, unknown>[]; value: any; onChange: (v: any) => void }) {
  if (f.kind === 'select') {
    const opts = Array.from(new Set(rows.map((r) => String(r[f.field ?? ''] ?? '')))).filter(Boolean);
    return (
      <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 140 }}>
        {f.label}
        <select style={inp} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">全部</option>
          {opts.map((o) => <option key={o} value={o}>{LEVEL_META[o]?.label ?? o}</option>)}
        </select>
      </label>
    );
  }
  if (f.kind === 'dateRange') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 200 }}>
        {f.label}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <input style={inp} type="date" value={value?.from ?? ''} onChange={(e) => onChange({ ...value, from: e.target.value })} />
          <span style={{ color: '#94A3B8' }}>~</span>
          <input style={inp} type="date" value={value?.to ?? ''} onChange={(e) => onChange({ ...value, to: e.target.value })} />
        </div>
      </div>
    );
  }
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 160 }}>
      {f.label}
      <input style={inp} value={value ?? ''} placeholder="关键词" onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function fmt(v: number | null, precision = 0, unit = ''): string {
  if (v === null || v === undefined || Number.isNaN(v as number)) return '-';
  const n = Number(v);
  return `${n.toLocaleString(undefined, { maximumFractionDigits: precision, minimumFractionDigits: 0 })}${unit}`;
}
