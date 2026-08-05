// 指标详情（管理中心 · 配置域）— 读 midMetrics.json 蓝；样例驱动 橘；实时计算 灰
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Button, Badge, InfoCell } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidMetrics, useMidDataSources, useMidStrategy, useMidDashboards, updateMetrics } from './midStore';
import { AGG_LABEL, computeAgg, resolveMetricsForRows, evalMetricFormula } from './midData';
import { ConfigDetailPage, crumb, SRC_TYPE_LABEL, fmt } from './ConfigTemplate';

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
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageShell title="指标详情" crumb={crumb('指标库')} actions={<Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>} />
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">未找到该指标（{id}）。</div>
      </div>
    );
  }

  const enabled = m.enabled ?? true;
  const toggleEnabled = () => updateMetrics((list) => list.map((x) => x.id === m.id ? { ...x, enabled: !enabled } : x));
  const src = sources.find((s) => s.id === m.dataSourceId);
  const allRows = sources.flatMap((s) => s.rows ?? []);
  const ctx = resolveMetricsForRows(metrics, allRows);
  const preview = m.type === 'base'
    ? (src ? computeAgg(src.rows ?? [], m.field, m.agg) : 0)
    : (ctx[m.id] ?? evalMetricFormula(m.formula ?? '', ctx));

  const usedByRules = strategy.rules.filter((r) => r.metricId === m.id);
  const usedByWidgets = dashboards.flatMap((d) => d.widgets).filter((w) => w.metricId === m.id);

  const defCols: Column[] = [
    { key: 'k', label: '项目', tag: { kind: 'cfg', value: 'midMetrics.json' } },
    { key: 'v', label: '内容', tag: { kind: 'cfg', value: 'midMetrics.json' } },
  ];
  const defRows: Row[] = m.type === 'base'
    ? ([
        { id: '1', k: '类型', v: '基础指标' },
        { id: '2', k: '聚合方式', v: AGG_LABEL[m.agg ?? 'count'] },
        { id: '3', k: '度量字段', v: src?.fields.find((f) => f.key === m.field)?.label ?? m.field ?? '-' },
        { id: '4', k: '单位', v: m.unit ?? '-' },
        { id: '5', k: '精度', v: String(m.precision ?? 0) },
        { id: '6', k: '分组', v: m.group ?? '-' },
        { id: '7', k: '状态', v: enabled ? '启用' : '停用' },
      ] as unknown as Row[])
    : ([
        { id: '1', k: '类型', v: '派生指标' },
        { id: '2', k: '公式', v: m.formula ?? '-' },
        { id: '3', k: '单位', v: m.unit ?? '-' },
        { id: '4', k: '精度', v: String(m.precision ?? 0) },
        { id: '5', k: '分组', v: m.group ?? '-' },
        { id: '6', k: '状态', v: enabled ? '启用' : '停用' },
      ] as unknown as Row[]);

  const fieldCols: Column[] = [
    { key: 'key', label: '字段 key', tag: { kind: 'cfg', value: 'midDataSources.json.fields.key' } },
    { key: 'label', label: '名称', tag: { kind: 'cfg', value: 'midDataSources.json.fields.label' } },
    { key: 'kind', label: '类型', type: 'badge', tag: { kind: 'cfg', value: 'midDataSources.json.fields.kind' } },
  ];
  const fieldRows: Row[] = (src?.fields ?? []).map((f) => ({
    id: f.key,
    key: f.key,
    label: f.label,
    kind: { v: f.kind === 'measure' ? '度量' : '维度', kind: f.kind === 'measure' ? 'blue' : 'gray' },
  } as unknown as Row));

  return (
    <ConfigDetailPage
      title={m.name}
      crumbParts={['指标库']}
      subtitle={`分组：${m.group ?? '-'}　·　${m.type === 'base' ? '基础指标' : '派生指标'}`}
      actions={<>
        <Cfg value="midMetrics.json" />
        <Button size="sm" onClick={() => nav('/console/cm/mid-metric?edit=' + m.id)}>编辑</Button>
        <Button size="sm" variant={enabled ? 'secondary' : 'primary'} onClick={toggleEnabled}>
          {enabled ? '停用' : '启用'}
        </Button>
        <Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>
      </>}
      infoCells={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <InfoCell label="类型" value={m.type === 'base' ? '基础指标' : '派生指标'} />
          <InfoCell label="状态" value={<Badge kind={enabled ? 'green' : 'red'}>{enabled ? '启用' : '停用'}</Badge>} />
          <InfoCell label="分组" value={m.group ?? '-'} />
          <InfoCell label="单位" value={m.unit ?? '-'} />
          <InfoCell label="精度" value={String(m.precision ?? 0)} />
          <InfoCell label="实时值" value={fmt(preview, m.precision, m.unit)} tag={<Cal />} />
        </div>
      }
    >
      <Panel title="口径定义" desc={<span><Sam value={`${src?.rows?.length ?? 0} 行`} /> 字段来源 <Cfg value="midDataSources.json" /></span>}>
        <DataTable columns={defCols} rows={defRows} />
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5">
          <Cal />
          <span className="text-xs text-slate-500">当前样例值：</span>
          <strong className="text-base font-semibold text-ink-900">{fmt(preview, m.precision, m.unit)}</strong>
        </div>
      </Panel>

      <Panel title="数据源" desc={<>指标由该数据源生成，字段来源 <Cfg value="midDataSources.json" /></>}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoCell label="名称" value={src?.name ?? '-'} tag={<Cfg value="midDataSources.json.name" />} />
          <InfoCell label="类型" value={src ? (SRC_TYPE_LABEL[src.type] ?? src.type) : '-'} tag={<Cfg value="midDataSources.json.type" />} />
          <InfoCell label="状态" value={src?.status ?? 'connected'} tag={<Cfg value="midDataSources.json.status" />} />
        </div>
        <div className="mt-3">
          <DataTable columns={fieldCols} rows={fieldRows} />
        </div>
        {src && (
          <div className="mt-2">
            <Button size="sm" variant="ghost" onClick={() => nav('/console/cm/mid-data-source-detail?id=' + src.id)}>查看数据源完整详情：{src.name} →</Button>
          </div>
        )}
      </Panel>

      <Panel title="被引用" desc="该指标被以下监控规则与看板组件引用">
        <div className="mb-2 text-sm font-medium text-slate-600">监控规则 <Badge kind="amber">{usedByRules.length}</Badge></div>
        {usedByRules.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {usedByRules.map((r) => (
              <Button key={r.id} size="sm" variant="ghost" onClick={() => nav(`/console/cm/mid-strategy-detail?kind=rule&id=${r.id}`)}>{r.name}</Button>
            ))}
          </div>
        ) : <div className="mb-4 rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-400">暂无规则引用</div>}
        <div className="mb-2 text-sm font-medium text-slate-600">看板组件 <Badge kind="blue">{usedByWidgets.length}</Badge></div>
        {usedByWidgets.length ? (
          <div className="flex flex-wrap gap-2">
            {usedByWidgets.map((w) => (
              <Button key={w.id} size="sm" variant="ghost" onClick={() => nav('/console/cm/mid-dashboard-detail?id=' + (dashboards.find((d) => d.widgets.includes(w))?.id ?? ''))}>{w.title}</Button>
            ))}
          </div>
        ) : <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm text-slate-400">暂无组件引用</div>}
      </Panel>
    </ConfigDetailPage>
  );
}
