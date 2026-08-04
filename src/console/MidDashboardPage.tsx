// ⑧ 监控看板（贷中监控 · 使用域）— 读取 midDashboards.json（蓝）渲染，样例数据（橘）实时聚合（灰），点击下钻个体
import { useState } from 'react';
import { PageHeader, Panel, StatCard, DataTable, Modal, Button } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { LineChart, BarChart, DonutChart } from '../components/charts';
import { useMidDashboards, useMidDataSources, useMidMetrics } from './midStore';
import { Cfg, Sam, Cal } from './SourceTag';
import { computeAgg, evalMetricFormula } from './midData';
import type { MidDashboardPage, MidWidget, MidMetric, MidDataSource } from './midData';

const LEVEL_COLOR: Record<string, string> = { RED: '#DC2626', YELLOW: '#D97706', OPPORTUNITY: '#2563EB', GREEN: '#16A34A' };
const PALETTE = ['#2563EB', '#7C3AED', '#D97706', '#0F766E', '#DC2626', '#64748B', '#16A34A'];

interface GroupPoint { label: string; value: number; }

function groupAgg(
  rows: Record<string, unknown>[], dimKey: string, metric: MidMetric,
  dataSources: MidDataSource[], metrics: MidMetric[],
): GroupPoint[] {
  const groups = new Map<string, Record<string, unknown>[]>();
  for (const r of rows) {
    const k = String(r[dimKey] ?? '未知');
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(r);
  }
  const out: GroupPoint[] = [];
  for (const [k, grp] of groups) {
    let v: number;
    if (metric.type === 'base') {
      v = computeAgg(grp, metric.field, metric.agg);
    } else {
      const vals: Record<string, number> = {};
      for (const m of metrics) {
        if (m.type === 'base') {
          const d = dataSources.find((x) => x.id === m.dataSourceId);
          if (d) vals[m.id] = computeAgg(grp, m.field, m.agg);
        }
      }
      v = evalMetricFormula(metric.formula ?? '', vals) ?? 0;
    }
    out.push({ label: k, value: v });
  }
  return out.sort((a, b) => b.value - a.value);
}

function metricValue(metric: MidMetric, dataSources: MidDataSource[], metrics: MidMetric[]): number | null {
  const ds = dataSources.find((d) => d.id === metric.dataSourceId);
  if (!ds) return null;
  if (metric.type === 'base') return computeAgg(ds.rows, metric.field, metric.agg);
  const vals: Record<string, number> = {};
  for (const m of metrics) {
    if (m.type === 'base') {
      const d = dataSources.find((x) => x.id === m.dataSourceId);
      if (d) vals[m.id] = computeAgg(d.rows, m.field, m.agg);
    }
  }
  return evalMetricFormula(metric.formula ?? '', vals);
}

export default function MidDashboardPage({ pageKey }: { pageKey: string }) {
  const dashboards = useMidDashboards();
  const dataSources = useMidDataSources();
  const metrics = useMidMetrics();
  const [drill, setDrill] = useState<{ title: string; rows: Row[]; cols: Column[] } | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('');

  const page = dashboards.find((p) => p.key === pageKey) ?? dashboards[0];
  if (!page) return <div style={{ padding: 24, color: '#94A3B8' }}>未找到监控页面，请先在管理中心「监控页面配置」创建。</div>;

  const dsOf = (w: MidWidget) => dataSources.find((d) => d.id === w.datasetId);
  const metricOf = (w: MidWidget) => metrics.find((m) => m.id === w.metricId);
  const fmt = (v: number, m?: MidMetric) => (m?.precision != null && m.precision > 0 ? v.toFixed(m.precision) : String(Math.round(v * 100) / 100));

  const filtered = (w: MidWidget): Record<string, unknown>[] => {
    const ds = dsOf(w);
    if (!ds) return [];
    let rows = ds.rows;
    if (levelFilter && ds.fields.some((f) => f.key === 'level')) rows = rows.filter((r) => r.level === levelFilter);
    if (w.filters?.length) {
      rows = rows.filter((r) => w.filters!.every((f) => String(r[f.field]) === f.value));
    }
    return rows;
  };

  const openDrill = (w: MidWidget) => {
    if (w.drill?.type !== 'detail') return;
    const ds = dsOf(w);
    if (!ds) return;
    const cols: Column[] = [
      { key: 'cust_id', label: '客户ID' }, { key: 'cust_name', label: '客户' },
      ...ds.fields.filter((f) => (w.dimensions ?? []).includes(f.key) || f.key === 'level').map((f) => ({ key: f.key, label: f.label })),
    ];
    const rows: Row[] = filtered(w).slice(0, 20).map((r, i) => ({ id: String(r.cust_id ?? `r${i}`), ...r }) as unknown as Row);
    setDrill({ title: w.title, rows, cols });
  };

  return (
    <div style={{ padding: 24, maxWidth: 1280 }}>
      <PageHeader
        title={page.name}
        crumb="零售信贷风控 / 贷中监控 / 监控看板"
        subtitle={page.desc}
        actions={<>
          <Cfg label="页面配置" value={page.id} />
          {page.filters?.length ? <Sam label="样例数据" /> : null}
        </>}
      />

      {page.filters?.length ? (
        <div style={{ display: 'flex', gap: 8, marginBottom: 14, alignItems: 'center' }}>
          {page.filters.map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#475569' }}>
              <span>{f.label}：</span>
              {f.kind === 'select' ? (
                <select
                  style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' }}
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                >
                  <option value="">全部</option>
                  <option value="RED">红灯</option><option value="YELLOW">黄灯</option><option value="OPPORTUNITY">机会信号</option>
                </select>
              ) : <input type="date" style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12 }} />}
            </div>
          ))}
          <span style={{ fontSize: 11, color: '#94A3B8' }}><Cal label="筛选实时生效" /></span>
        </div>
      ) : null}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {page.widgets.map((w) => {
          const ds = dsOf(w);
          const m = metricOf(w);
          const rows = filtered(w);
          const pts = w.dimensions?.length ? groupAgg(rows, w.dimensions[0], m ?? metrics[0], dataSources, metrics) : [];
          const mv = m ? metricValue(m, dataSources, metrics) : null;
          return (
            <Panel
              key={w.id}
              title={w.title}
              desc={ds ? `${ds.name} · ${m?.name ?? ''}${w.dimensions?.length ? ` · 按 ${w.dimensions.join('/')}` : ''}` : undefined}
              className={w.span === 2 ? 'col-span-2' : ''}
              actions={<>
                <Sam label="样例数据" />
                {w.drill?.type === 'detail' ? <Button size="sm" variant="ghost" onClick={() => openDrill(w)}>下钻个体</Button> : null}
              </>}
            >
              {w.type === 'metric' && (
                <div>
                  <StatCard label={w.title} value={m?.unit === '元' ? fmt(mv ?? 0) : fmt(mv ?? 0)} hint={m?.unit ? `单位 ${m.unit}` : undefined} />
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}><Cal label="实时聚合" value={fmt(mv ?? 0)} /></div>
                </div>
              )}
              {w.type === 'line' && pts.length > 0 && (
                <div>
                  <LineChart labels={pts.map((p) => p.label)} series={[{ name: m?.name ?? '', data: pts.map((p) => p.value), color: '#2563EB' }]} unit={m?.unit} />
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}><Cal label="按维度实时聚合" /></div>
                </div>
              )}
              {w.type === 'bar' && pts.length > 0 && (
                <div>
                  <BarChart labels={pts.map((p) => p.label)} series={[{ name: m?.name ?? '', data: pts.map((p) => p.value), color: '#7C3AED' }]} unit={m?.unit} />
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}><Cal label="按维度实时聚合" /></div>
                </div>
              )}
              {w.type === 'donut' && pts.length > 0 && (
                <div>
                  <DonutChart
                    data={pts.map((p, i) => ({ label: p.label, value: p.value, color: LEVEL_COLOR[p.label] ?? PALETTE[i % PALETTE.length] }))}
                    centerLabel="总数" centerValue={String(pts.reduce((a, b) => a + b.value, 0))}
                  />
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}><Cal label="按维度实时聚合" /></div>
                </div>
              )}
              {w.type === 'table' && (
                <div>
                  <DataTable
                    columns={ds?.fields.filter((f) => (w.dimensions ?? []).includes(f.key) || f.key === 'level').map((f) => ({ key: f.key, label: f.label })) ?? []}
                    rows={rows.slice(0, 8).map((r, i) => ({ id: String(r.cust_id ?? `r${i}`), ...r }) as unknown as Row)}
                    clickableKey="cust_id"
                    onCellClick={(r) => {
                      const custId = String(r.cust_id ?? '');
                      if (custId) window.location.href = `/console/cr/mid-cust-detail?custId=${custId}&from=${encodeURIComponent(page.name + '/' + w.title)}`;
                    }}
                  />
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}><Sam label="样例明细" /> 点击行进入个体详情</div>
                </div>
              )}
              {w.type !== 'table' && !(w.type === 'metric') && pts.length === 0 && <div style={{ color: '#94A3B8', fontSize: 12, padding: 12 }}>该数据集暂无样例数据</div>}
            </Panel>
          );
        })}
      </div>

      <Modal open={!!drill} onClose={() => setDrill(null)} title={`下钻明细 · ${drill?.title ?? ''}`} width="max-w-3xl" footer={<Button onClick={() => setDrill(null)}>关闭</Button>}>
        <div style={{ marginBottom: 8, fontSize: 12, color: '#94A3B8' }}>
          <Sam label="样例数据" /> 点击客户行进入个体详情
        </div>
        <DataTable
          columns={drill?.cols ?? []}
          rows={drill?.rows ?? []}
          clickableKey="cust_id"
          onCellClick={(r) => {
            const custId = String(r.cust_id ?? '');
            if (custId) window.location.href = `/console/cr/mid-cust-detail?custId=${custId}&from=${encodeURIComponent(drill?.title ?? '')}`;
          }}
        />
      </Modal>
    </div>
  );
}
