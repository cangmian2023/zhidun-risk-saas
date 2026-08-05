// 指标详情 / 编辑（管理中心）— 直接在页面上编辑（无弹窗）
// 读 midMetrics.json 橘（样例·落本地）；关联数据源样例 橘；实时计算 灰
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Button, Badge, InfoCell } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidMetrics, useMidDataSources, useMidStrategy, useMidDashboards, updateMetrics, midNewId } from './midStore';
import { type MidMetric, computeMetricValue, resolveMetricsForRows, evalMetricFormula, FILTER_OP_LABEL } from './midData';
import { ConfigDetailPage, crumb, SRC_TYPE_LABEL, fmt } from './ConfigTemplate';
import { MetricEditor } from './MetricEditor';

function blankMetric(sources: { id: string }[]): MidMetric {
  return { id: midNewId('m'), name: '', group: '未分组', dataSourceId: sources[0]?.id ?? '', type: 'base', field: '', agg: 'sum', precision: 0, filters: [], groupBy: [], vizType: 'bar', vizSampleId: 'vs_product_loan' };
}

export default function MidMetricDetail() {
  const [params] = useSearchParams();
  const isNew = params.get('new') === '1';
  const id = params.get('id') ?? '';
  const metrics = useMidMetrics();
  const sources = useMidDataSources();
  const strategy = useMidStrategy();
  const dashboards = useMidDashboards();
  const nav = useNavigate();

  const existing: MidMetric | undefined = (!isNew && id) ? metrics.find((x) => x.id === id) : undefined;

  const [draft, setDraft] = useState<MidMetric>(() => (existing ? JSON.parse(JSON.stringify(existing)) : blankMetric(sources)));

  // 切换 id / new 时重载 draft（避免读到别的指标）
  const key = isNew ? 'new' : id;
  const loadedRef = useRef<string | null>(null);
  useEffect(() => {
    if (loadedRef.current === key) return;
    loadedRef.current = key;
    const ex: MidMetric | undefined = (!isNew && id) ? metrics.find((x) => x.id === id) : undefined;
    setDraft(ex ? JSON.parse(JSON.stringify(ex)) : blankMetric(sources));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, isNew, id]);

  const src = sources.find((s) => s.id === draft.dataSourceId);
  const allRows = sources.flatMap((s) => s.rows ?? []);
  const ctx = resolveMetricsForRows(metrics, allRows);
  const preview = draft.type === 'base'
    ? computeMetricValue(draft, src?.rows ?? [])
    : (ctx[draft.id] ?? evalMetricFormula(draft.formula ?? '', ctx));

  const save = () => {
    if (!draft.name.trim()) { window.alert('请填写指标名称'); return; }
    updateMetrics((list) => {
      const i = list.findIndex((x) => x.id === draft.id);
      return i < 0 ? [...list, draft] : list.map((x) => (x.id === draft.id ? draft : x));
    });
    if (isNew) nav(`/console/cm/mid-metric-detail?id=${draft.id}`, { replace: true });
  };
  const toggleEnabled = () => {
    const next = { ...draft, enabled: !(draft.enabled ?? true) };
    setDraft(next);
    updateMetrics((list) => list.map((x) => (x.id === draft.id ? next : x)));
  };
  const remove = () => {
    if (draft.id) { updateMetrics((list) => list.filter((x) => x.id !== draft.id)); nav(-1); }
  };

  // 被引用（基于已保存的 existing）
  const usedByRules = existing ? strategy.rules.filter((r) => r.metricId === existing.id) : [];
  const usedByWidgets = existing ? dashboards.flatMap((d) => d.widgets).filter((w) => w.metricId === existing.id) : [];

  const fieldCols: Column[] = [
    { key: 'key', label: '字段 key', tag: { kind: 'sample', value: 'midDataSources.json.fields.key' } },
    { key: 'label', label: '名称', tag: { kind: 'sample', value: 'midDataSources.json.fields.label' } },
    { key: 'kind', label: '类型', type: 'badge', tag: { kind: 'sample', value: 'midDataSources.json.fields.kind' } },
  ];
  const fieldRows: Row[] = (src?.fields ?? []).map((f) => ({
    id: f.key, key: f.key, label: f.label,
    kind: { v: f.kind === 'measure' ? '度量' : '维度', kind: f.kind === 'measure' ? 'blue' : 'gray' },
  } as unknown as Row));

  return (
    <ConfigDetailPage
      title={draft.name || (isNew ? '新建指标' : '指标详情')}
      crumbParts={['指标库']}
      subtitle={`${draft.type === 'base' ? '基础指标' : '派生指标'}　·　分组：${draft.group ?? '-'}　·　保存即落盘`}
      actions={<>
        <Sam value="midMetrics.json" />
        <Button size="sm" variant="primary" onClick={save}>保存</Button>
        {existing && <Button size="sm" variant={draft.enabled === false ? 'primary' : 'secondary'} onClick={toggleEnabled}>{draft.enabled === false ? '启用' : '停用'}</Button>}
        {existing && <Button size="sm" variant="ghost" onClick={remove}>删除</Button>}
        <Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>
      </>}
      infoCells={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <InfoCell label="类型" value={draft.type === 'base' ? '基础指标' : '派生指标'} tag={<Sam value="midMetrics.json.type" />} />
          <InfoCell label="状态" value={<Badge kind={(draft.enabled ?? true) ? 'green' : 'red'}>{(draft.enabled ?? true) ? '启用' : '停用'}</Badge>} tag={<Sam value="midMetrics.json.enabled" />} />
          <InfoCell label="分组" value={draft.group ?? '-'} tag={<Sam value="midMetrics.json.group" />} />
          <InfoCell label="单位" value={draft.unit ?? '-'} tag={<Sam value="midMetrics.json.unit" />} />
          <InfoCell label="精度" value={String(draft.precision ?? 0)} tag={<Sam value="midMetrics.json.precision" />} />
          <InfoCell label="实时值" value={fmt(preview, draft.precision, draft.unit)} tag={<Cal />} />
        </div>
      }
    >
      <MetricEditor value={draft} metrics={metrics} sources={sources} onChange={setDraft} onRemove={existing ? remove : undefined} />

      <Panel title="可用字段（数据源参考）" desc={<>来自 <Sam value="midDataSources.json" />，选字段时对照</>}>
        {src ? <DataTable columns={fieldCols} rows={fieldRows} /> : <div className="text-sm text-slate-400">请先在上方「步骤 1」选择数据源</div>}
        {src && (
          <div className="mt-2">
            <Button size="sm" variant="ghost" onClick={() => nav('/console/cm/mid-data-source-detail?id=' + src.id)}>查看数据源完整详情：{src.name} →</Button>
          </div>
        )}
      </Panel>

      {existing && (usedByRules.length > 0 || usedByWidgets.length > 0) && (
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
      )}
    </ConfigDetailPage>
  );
}
