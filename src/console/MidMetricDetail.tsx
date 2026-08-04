// 指标详情（管理中心 · 配置域）— 读 midMetrics.json 蓝；样例驱动 橘；实时计算 灰
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Button, Badge } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidMetrics, useMidDataSources, useMidStrategy, useMidDashboards } from './midStore';
import { AGG_LABEL, computeAgg, resolveMetricsForRows, evalMetricFormula } from './midData';

function fmt(v: number | null, precision = 0, unit = ''): string {
  if (v === null || v === undefined || Number.isNaN(v as number)) return '-';
  const n = Number(v);
  return `${n.toLocaleString(undefined, { maximumFractionDigits: precision, minimumFractionDigits: 0 })}${unit}`;
}

export default function MidMetricDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const metrics = useMidMetrics();
  const sources = useMidDataSources();
  const strategy = useMidStrategy();
  const dashboards = useMidDashboards();
  const nav = useNavigate();
  const m = metrics.find((x) => x.id === id);

  if (!m) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell title="指标详情" crumb="管理中心 / 贷中监控配置 / 指标库" actions={<Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>} />
        <div style={{ padding: 24, color: '#94A3B8', fontSize: 13 }}>未找到该指标（{id}）。</div>
      </div>
    );
  }

  const src = sources.find((s) => s.id === m.dataSourceId);
  const allRows = sources.flatMap((s) => s.rows ?? []);
  const ctx = resolveMetricsForRows(metrics, allRows);
  const preview = m.type === 'base'
    ? (src ? computeAgg(src.rows ?? [], m.field, m.agg) : 0)
    : (ctx[m.id] ?? evalMetricFormula(m.formula ?? '', ctx));

  const usedByRules = strategy.rules.filter((r) => r.metricId === m.id);
  const usedByWidgets = dashboards.flatMap((d) => d.widgets).filter((w) => w.metricId === m.id);

  const defCols: Column[] = [
    { key: 'k', label: '项目' }, { key: 'v', label: '内容' },
  ];
  const defRows: Row[] = m.type === 'base'
    ? ([
        { id: '1', k: '类型', v: '基础指标' },
        { id: '2', k: '聚合方式', v: AGG_LABEL[m.agg ?? 'count'] },
        { id: '3', k: '度量字段', v: src?.fields.find((f) => f.key === m.field)?.label ?? m.field ?? '-' },
        { id: '4', k: '单位', v: m.unit ?? '-' },
        { id: '5', k: '精度', v: String(m.precision ?? 0) },
        { id: '6', k: '分组', v: m.group ?? '-' },
      ] as unknown as Row[])
    : ([
        { id: '1', k: '类型', v: '派生指标' },
        { id: '2', k: '公式', v: m.formula ?? '-' },
        { id: '3', k: '单位', v: m.unit ?? '-' },
        { id: '4', k: '精度', v: String(m.precision ?? 0) },
        { id: '5', k: '分组', v: m.group ?? '-' },
      ] as unknown as Row[]);

  return (
    <div style={{ padding: 24, maxWidth: 1180 }}>
      <PageShell title={m.name} crumb="管理中心 / 贷中监控配置 / 指标库"
        subtitle={`分组：${m.group ?? '-'}`}
        actions={<>
          <Cfg label="配置JSON" value="midMetrics.json" />
          <Button size="sm" onClick={() => nav('/console/cm:mid-metric?edit=' + m.id)}>编辑</Button>
          <Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>
        </>} />

      <Panel title="口径定义" desc={<span><Sam label="样例驱动" value={`${src?.rows?.length ?? 0} 行`} /> 字段来源 <Cfg label="读配置" value="midDataSources.json" /></span>}>
        <DataTable columns={defCols} rows={defRows} />
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F3F4F6', borderRadius: 8 }}>
          <Cal label="实时计算" />
          <span style={{ fontSize: 12, color: '#6B7280' }}>当前样例值：</span>
          <strong style={{ fontSize: 16, color: '#374151' }}>{fmt(preview, m.precision, m.unit)}</strong>
        </div>
        <div style={{ marginTop: 8 }}>
          <Button size="sm" variant="ghost" onClick={() => nav('/console/cm:mid-data-source-detail?id=' + (src?.id ?? ''))}>查看数据源：{src?.name ?? m.dataSourceId} →</Button>
        </div>
      </Panel>

      <Panel title="被引用" desc="该指标被以下监控规则与看板组件引用">
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>监控规则 <Badge kind="amber">{usedByRules.length}</Badge></div>
        {usedByRules.length ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {usedByRules.map((r) => (
              <Button key={r.id} size="sm" variant="ghost" onClick={() => nav(`/console/cm:mid-strategy-detail?kind=rule&id=${r.id}`)}>{r.name}</Button>
            ))}
          </div>
        ) : <div style={{ color: '#94A3B8', fontSize: 12, marginBottom: 12 }}>暂无规则引用</div>}
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>看板组件 <Badge kind="blue">{usedByWidgets.length}</Badge></div>
        {usedByWidgets.length ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {usedByWidgets.map((w) => (
              <Button key={w.id} size="sm" variant="ghost" onClick={() => nav('/console/cm:mid-dashboard-detail?id=' + (dashboards.find((d) => d.widgets.includes(w))?.id ?? ''))}>{w.title}</Button>
            ))}
          </div>
        ) : <div style={{ color: '#94A3B8', fontSize: 12 }}>暂无组件引用</div>}
      </Panel>
    </div>
  );
}
