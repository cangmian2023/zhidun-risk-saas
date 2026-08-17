/* 企业风控 · 数据看板（使用域 · 企业专家语义渲染版）
 * 企业看板由「管理中心」配置（数据源-指标库-页面配置）后渲染，与零售贷/评分共用数据源。
 * 本组件在共享数据之上叠加「企业领域语义层」：
 *   - 维度值中文化（高/中/低 → 红/黄/绿；RED/YELLOW → 红灯/黄灯；分类/场景/结果中文）
 *   - metric 卡片带业务副标题（大数字 + 业务含义 + 粒度说明）
 *   - 图表语义标题 + 精致视觉（渐变标题条 / 卡片阴影 / 圆角留白）
 * 复用 midData 的聚合函数保证数字准确，不改动共享渲染模板。
 */
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { BarChart, DonutChart, LineChart } from '../components/charts';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidDashboards, useMidDataSources, useMidMetrics } from './midStore';
import { resolveMetricsForRows, groupRowsByDim, applyMetricFilters, type MidWidget, type MidDataSource, type MidMetric } from './midData';

/* —— 企业领域语义映射 —— */
const RISK_LEVEL: Record<string, { label: string; color: string; soft: string }> = {
  高: { label: '高风险', color: '#E11D48', soft: '#FFE4E6' },
  中: { label: '中风险', color: '#D97706', soft: '#FEF3C7' },
  低: { label: '低风险', color: '#059669', soft: '#D1FAE5' },
};
const ALERT_LEVEL: Record<string, { label: string; color: string; soft: string }> = {
  RED: { label: '红灯预警', color: '#E11D48', soft: '#FFE4E6' },
  YELLOW: { label: '黄灯预警', color: '#D97706', soft: '#FEF3C7' },
  OPPORTUNITY: { label: '机会信号', color: '#0891B2', soft: '#CFFAFE' },
  GREEN: { label: '绿灯', color: '#059669', soft: '#D1FAE5' },
};
const CATEGORY_META: Record<string, { label: string; color: string }> = {
  司法涉诉: { label: '司法涉诉', color: '#E11D48' },
  经营异常: { label: '经营异常', color: '#D97706' },
  舆情负面: { label: '舆情负面', color: '#DB2777' },
  财务恶化: { label: '财务恶化', color: '#7C3AED' },
  关联风险: { label: '关联风险', color: '#0891B2' },
  税务: { label: '税务风险', color: '#EA580C' },
};
const SCENE_META: Record<string, { label: string; color: string }> = {
  授信审批: { label: '授信审批', color: '#2563EB' },
  尽调结论: { label: '尽调结论', color: '#7C3AED' },
  名单命中: { label: '名单命中', color: '#EA580C' },
  预警处置: { label: '预警处置', color: '#0891B2' },
};
const RESULT_META: Record<string, { label: string; color: string; soft: string }> = {
  通过: { label: '通过', color: '#059669', soft: '#D1FAE5' },
  拒绝: { label: '拒绝', color: '#E11D48', soft: '#FFE4E6' },
  转人工: { label: '转人工', color: '#D97706', soft: '#FEF3C7' },
  预警: { label: '预警', color: '#7C3AED', soft: '#EDE9FE' },
};
const DUE_STATUS: Record<string, { label: string; color: string; soft: string }> = {
  进行中: { label: '进行中', color: '#D97706', soft: '#FEF3C7' },
  已完成: { label: '已完成', color: '#059669', soft: '#D1FAE5' },
  待开始: { label: '待开始', color: '#64748B', soft: '#F1F5F9' },
  失败: { label: '失败', color: '#E11D48', soft: '#FFE4E6' },
  待复核: { label: '待复核', color: '#E11D48', soft: '#FFE4E6' },
  复核中: { label: '复核中', color: '#D97706', soft: '#FEF3C7' },
  待处置: { label: '待处置', color: '#E11D48', soft: '#FFE4E6' },
  核实中: { label: '核实中', color: '#D97706', soft: '#FEF3C7' },
  已处置: { label: '已处置', color: '#059669', soft: '#D1FAE5' },
  监控中: { label: '监控中', color: '#059669', soft: '#D1FAE5' },
  已暂停: { label: '已暂停', color: '#64748B', soft: '#F1F5F9' },
};

const PALETTE = ['#2563EB', '#7C3AED', '#DB2777', '#EA580C', '#0891B2', '#16A34A', '#CA8A04', '#64748B'];
const GRAD = 'linear-gradient(135deg,#1E293B 0%,#0F172A 100%)';

/* 维度值 → 语义化（按字段 key 分派） */
function dimMeta(key: string, v: string): { label: string; color: string; soft: string } | null {
  if (RISK_LEVEL[v]) return RISK_LEVEL[v];
  if (ALERT_LEVEL[v]) return ALERT_LEVEL[v];
  if (key === 'category' && CATEGORY_META[v]) return { ...CATEGORY_META[v], soft: '#F8FAFC' };
  if (key === 'scene' && SCENE_META[v]) return { ...SCENE_META[v], soft: '#F8FAFC' };
  if (key === 'result' && RESULT_META[v]) return RESULT_META[v];
  if (key === 'status' && DUE_STATUS[v]) return DUE_STATUS[v];
  return null;
}
const dimLabel = (key: string, v: string) => dimMeta(key, v)?.label ?? v;
const dimColor = (key: string, v: string, i: number) => dimMeta(key, v)?.color ?? PALETTE[i % PALETTE.length];

/* metric 的业务语义说明（按指标 id 提供副标题/口径） */
const METRIC_HINT: Record<string, string> = {
  m_ent_monitor_cnt: '存量名单内在保企业总数',
  m_ent_monitor_high: '存在重大司法/经营/关联风险，需重点监控',
  m_ent_monitor_mid: '存在一定风险信号，建议定期复核',
  m_ent_alert_cnt: '命中企业风险预警规则的累计条数',
  m_ent_alert_red: '需立即核实处置的红灯级预警',
  m_ent_alert_yellow: '需关注研判的黄灯级预警',
  m_ent_event_cnt: '企业授信/尽调/名单/预警等决策事件',
  m_ent_event_reject: '模型/规则判定拒绝的决策事件',
  m_ent_event_manual: '需人工研判后决策的事件',
  m_ent_due_cnt: '批量尽调任务的执行数量',
  m_ent_due_hit: '尽调中发现风险信号的企业数',
};

export default function EnterpriseDashboard({ pageKey }: { pageKey: string }) {
  const dashboards = useMidDashboards();
  const sources = useMidDataSources();
  const metrics = useMidMetrics();
  const nav = useNavigate();
  const page = useMemo(() => dashboards.find((d) => d.key === pageKey), [dashboards, pageKey]);
  const dsById = (id: string) => sources.find((s) => s.id === id);
  const metricById = (id: string) => metrics.find((m) => m.id === id);

  const [dlOpen, setDlOpen] = useState(false);
  const [dl, setDl] = useState<{ ds: MidDataSource; metric?: MidMetric; w: MidWidget; rows: Record<string, unknown>[] } | null>(null);

  if (!page) return <div style={{ padding: 24 }}><PageShell title="数据看板" crumb="企业风控 / 数据看板" subtitle="暂无页面配置" /></div>;

  const pageDs = Array.from(new Set(page.widgets.map((w) => w.datasetId))).map(dsById).filter(Boolean) as MidDataSource[];

  const renderTitle = (w: MidWidget) => {
    const extra = w.type === 'table' ? ' · 明细' : '';
    return (
      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {w.title}
        <span style={{ fontSize: 10, fontWeight: 500, color: '#94A3B8', background: '#F1F5F9', borderRadius: 4, padding: '1px 6px', letterSpacing: 0.5 }}>{extra || '指标'}</span>
      </span>
    );
  };

  return (
    <div style={{ padding: 24, maxWidth: 1280, background: '#F1F5F9', minHeight: '100vh' }}>
      <PageShell title={page.name} crumb={`企业风控 / ${page.group}`} subtitle={page.desc}
        actions={<><Sam label="页面配置" value="midDashboards.json" /><Sam label="样例数据" value={`${pageDs.reduce((a, s) => a + (s.rows?.length || 0), 0)} 行`} /><Cal label="实时计算" /></>} />

      {/* 顶部统计条（metric 类 widget 汇总展示：大数字 + 业务副标题） */}
      {page.widgets.some((w) => w.type === 'metric') && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
          {page.widgets.filter((w) => w.type === 'metric').map((w) => {
            const ds = dsById(w.datasetId);
            const metric = metricById(w.metricId);
            if (!ds || !metric) return null;
            const rows = w.filters?.length ? applyMetricFilters(ds.rows ?? [], w.filters) : (ds.rows ?? []);
            const v = resolveMetricsForRows(metrics, rows)[w.metricId] ?? 0;
            const hint = METRIC_HINT[w.metricId] ?? '';
            return (
              <div key={w.id} style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', boxShadow: '0 1px 2px rgba(15,23,42,.06)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>{w.title}</div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                  <span style={{ fontSize: 30, fontWeight: 800, color: '#0F172A', fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{v.toLocaleString()}</span>
                  <span style={{ fontSize: 12, color: '#94A3B8' }}>{metric.unit ?? ''}</span>
                </div>
                {hint && <div style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.4 }}>{hint}</div>}
                <div style={{ fontSize: 10, color: '#CBD5E1', marginTop: 2 }}>{ds.name}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* 图表区 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 16, alignItems: 'stretch' }}>
        {page.widgets.filter((w) => w.type !== 'metric').map((w) => {
          const ds = dsById(w.datasetId);
          const metric = metricById(w.metricId);
          if (!ds || !metric) return null;
          const rows = w.filters?.length ? applyMetricFilters(ds.rows ?? [], w.filters) : (ds.rows ?? []);
          const vals = resolveMetricsForRows(metrics, rows);
          const dim = w.dimensions?.[0];
          const groups = dim ? groupRowsByDim(rows, dim) : [];
          const labels = groups.map((g) => g.key);
          const metricIds = (w.metricIds?.length ? w.metricIds : [w.metricId]).filter((id) => metricById(id));
          const height = w.windowSize === 'lg' ? 300 : w.windowSize === 'sm' ? 180 : 240;
          const span = w.windowSize === 'lg' ? 'span 3' : w.windowSize === 'sm' ? 'span 1' : 'span 2';

          const openDetail = () => setDl({ ds, metric, w, rows });

          // 图表卡片壳
          const shell = (body: React.ReactNode, legend?: React.ReactNode) => (
            <div style={{ gridColumn: span, height: '100%' }}>
              <div style={{ background: '#fff', borderRadius: 14, padding: '16px 18px', boxShadow: '0 1px 2px rgba(15,23,42,.06)', border: '1px solid #E2E8F0', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ width: 4, height: 16, borderRadius: 2, background: GRAD }} />
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>{w.title}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {legend}
                    <button type="button" onClick={openDetail} style={{ fontSize: 11, color: '#2563EB', background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 6, padding: '2px 8px', cursor: 'pointer' }}>明细</button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 10, lineHeight: 1.5 }}>
                  {metric.name}{metricIds.length > 1 ? ` · ${metricIds.map((id) => metricById(id)?.name).filter(Boolean).join(' / ')}` : ''}
                  {dim ? ` · 按「${ds.fields.find((f) => f.key === dim)?.label ?? dim}」分布` : ''}
                </div>
                <div style={{ flex: 1 }}>{body}</div>
              </div>
            </div>
          );

          if (!dim) return null;

          // —— 柱状/折线（多系列：各 metricIds 一根线/一组柱） ——
          if (w.type === 'bar' || w.type === 'line') {
            const series = metricIds.map((mid, si) => {
              const m = metricById(mid)!;
              return { name: m.name, color: PALETTE[si % PALETTE.length], data: groups.map((g) => resolveMetricsForRows(metrics, g.rows)[mid] ?? 0) };
            });
            const body = w.type === 'bar'
              ? <BarChart labels={labels.map((k) => dimLabel(dim, k))} series={series} unit={series[0]?.unit ?? metric.unit ?? ''} height={height} />
              : <LineChart labels={labels.map((k) => dimLabel(dim, k))} series={series} unit={series[0]?.unit ?? metric.unit ?? ''} height={height} />;
            const legend = <div style={{ display: 'flex', gap: 10 }}>{series.map((s) => <span key={s.name} style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: s.color }} />{s.name}</span>)}</div>;
            return shell(body, legend);
          }

          // —— 环形图 ——
          if (w.type === 'donut') {
            const m0 = metricById(metricIds[0]);
            const data = groups.map((g, i) => ({ label: dimLabel(dim, g.key), value: resolveMetricsForRows(metrics, g.rows)[metricIds[0]] ?? 0, color: dimColor(dim, g.key, i) }));
            const center = vals[metricIds[0]] ?? 0;
            const legend = <div style={{ display: 'flex', gap: 10 }}>{data.map((d) => <span key={d.label} style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: 8, background: d.color }} />{d.label}</span>)}</div>;
            return shell(<DonutChart data={data} centerLabel={m0?.name ?? metric.name} centerValue={center.toLocaleString()} height={height} />, legend);
          }

          // —— 明细表 ——
          if (w.type === 'table') {
            const cols: Column[] = (w.dimensions ?? []).map((d) => {
              const f = ds.fields.find((x) => x.key === d);
              const isLv = !!dimMeta(d, '高') || !!dimMeta(d, 'RED') || !!dimMeta(d, '通过');
              return { key: d, label: f?.label ?? d, type: (isLv ? 'badge' : 'text') as 'badge' | 'text' };
            });
            const trows: Row[] = rows.map((r, i) => {
              const o: any = { id: String(i) };
              (w.dimensions ?? []).forEach((d) => {
                const raw = String(r[d] ?? '');
                const m = dimMeta(d, raw);
                if (m) o[d] = { v: m.label, kind: levelKind(m) };
                else o[d] = raw;
              });
              return o as Row;
            });
            return shell(
              <DataTable columns={cols} rows={trows} pager defaultPageSize={8} empty="暂无数据" />,
              <span style={{ fontSize: 11, color: '#94A3B8' }}>{rows.length} 条</span>,
            );
          }
          return null;
        })}
      </div>

      {/* 明细抽屉 */}
      {dl && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', justifyContent: 'flex-end' }} onClick={() => setDl(null)}>
          <div style={{ background: 'rgba(15,23,42,.4)', position: 'absolute', inset: 0 }} />
          <div style={{ position: 'relative', width: 640, background: '#fff', height: '100%', boxShadow: '-8px 0 24px rgba(15,23,42,.12)', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{dl.w.title} · 数据明细</span>
              <button onClick={() => setDl(null)} style={{ background: 'none', border: 'none', fontSize: 18, color: '#64748B', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '8px 20px', fontSize: 12, color: '#94A3B8', borderBottom: '1px solid #F1F5F9' }}>{dl.ds.name} · {dl.metric?.name ?? ''} · 共 {dl.rows.length} 条</div>
            <div style={{ flex: 1, overflow: 'auto', padding: 16 }}>
              <DataTable
                columns={(dl.ds.fields ?? []).map((f) => ({ key: f.key, label: f.label ?? f.key, type: 'text' }))}
                rows={dl.rows.map((r, i) => ({ id: String(i), ...Object.fromEntries((dl.ds.fields ?? []).map((f) => [f.key, String(r[f.key] ?? '')])) }))}
                pager defaultPageSize={12} empty="暂无数据" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function levelKind(m: { color: string; soft: string }): 'red' | 'amber' | 'green' | 'cyan' | 'gray' {
  const c = m.color;
  if (c === '#E11D48') return 'red';
  if (c === '#D97706' || c === '#EA580C') return 'amber';
  if (c === '#059669' || c === '#16A34A') return 'green';
  if (c === '#0891B2' || c === '#7C3AED' || c === '#2563EB') return 'cyan';
  return 'gray';
}
