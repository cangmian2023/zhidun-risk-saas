// 指标详情 / 编辑（管理中心）— 直接在页面上编辑（无弹窗）
// 读 midMetrics.json 橘（样例·落本地）；关联数据源样例 橘；实时计算 灰
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, Badge, InfoCell } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { useMidMetrics, useMidDataSources, useMidStrategy, useMidDashboards, updateMetrics, midNewId } from './midStore';
import { type MidMetric } from './midData';
import { ConfigDetailPage } from './ConfigTemplate';
import FlowActionBar from './FlowActionBar';
import { MetricEditor } from './MetricEditor';

function blankMetric(sources: { id: string }[]): MidMetric {
  return { id: midNewId('m'), name: '', group: '未分组', dataSourceId: sources[0]?.id ?? '', dataSourceIds: sources[0] ? [sources[0].id] : [], type: 'base', field: '', agg: 'sum', precision: 0, filters: [], groupBy: [], vizType: 'bar', vizSampleId: 'vs_product_loan' };
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

  const src = sources.find((s) => s.id === (draft.dataSourceIds?.[0] ?? draft.dataSourceId));
  // 指标取数由 SQL 脚本执行，详情页不在此计算实时值

  const save = () => {
    if (!draft.name.trim()) { window.alert('请填写指标名称'); return; }
    updateMetrics((list) => {
      const i = list.findIndex((x) => x.id === draft.id);
      return i < 0 ? [...list, draft] : list.map((x) => (x.id === draft.id ? draft : x));
    });
    if (isNew) nav(`/console/cm/mid-metric-detail?id=${draft.id}`, { replace: true });
  };
  // 被引用（基于已保存的 existing）
  const usedByRules = existing ? strategy.rules.filter((r) => r.conds.some((c) => c.metricId === existing.id)) : [];
  const usedByWidgets = existing ? dashboards.flatMap((d) => d.widgets).filter((w) => w.metricId === existing.id) : [];

  return (
    <ConfigDetailPage
      title={draft.name || (isNew ? '新建指标' : '指标详情')}
      crumbParts={['指标库']}
      subtitle={`${draft.type === 'base' ? '基础指标' : '派生指标'}　·　分组：${draft.group ?? '-'}　·　保存即落盘`}
      backLabel="返回列表" backTo="/console/cm/mid-metric"
      flowBar={<FlowActionBar flowId={draft.flowKey} state={draft.flowState}
        onStateChange={(s) => setDraft({ ...draft, flowState: s })} onSave={save} />}
      actions={<>
        <Sam value="midMetrics.json" />
      </>}
      infoCells={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <InfoCell label="类型" value={draft.type === 'base' ? '基础指标' : '派生指标'} tag={<Sam value="midMetrics.json.type" />} />
          <InfoCell label="状态" value={<Badge kind={(draft.enabled ?? true) ? 'green' : 'red'}>{(draft.enabled ?? true) ? '启用' : '停用'}</Badge>} tag={<Sam value="midMetrics.json.enabled" />} />
          <InfoCell label="分组" value={draft.group ?? '-'} tag={<Sam value="midMetrics.json.group" />} />
          <InfoCell label="单位" value={draft.unit ?? '-'} tag={<Sam value="midMetrics.json.unit" />} />
          <InfoCell label="精度" value={String(draft.precision ?? 0)} tag={<Sam value="midMetrics.json.precision" />} />
          <InfoCell label="实时值" value={'—'} tag={<Cal />} />
        </div>
      }
    >
      <MetricEditor value={draft} metrics={metrics} sources={sources} onChange={setDraft} />

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
