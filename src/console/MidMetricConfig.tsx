// ② 指标库（管理中心）— 列表页；编辑入口跳详情页（页面内编辑，无弹窗）
// 数据 样例JSON 橘（midMetrics.json·落本地）；实时预览 灰（实时计算）
import { useNavigate } from 'react-router-dom';
import type { Column, Row } from '../components/ui';
import { Button } from '../components/ui';
import { useMidMetrics, useMidDataSources, updateMetrics } from './midStore';
import {
  type MidMetric, AGG_LABEL, evalMetricFormula, computeMetricValue, resolveMetricsForRows,
} from './midData';
import { ConfigListPage, METRIC_TYPE_LABEL, fmt } from './ConfigTemplate';
import FlowStateCell from './FlowStateCell';

export default function MidMetricConfig() {
  const metrics = useMidMetrics();
  const sources = useMidDataSources();
  const nav = useNavigate();
  const srcById = (id: string) => sources.find((s) => s.id === id);

  const cols: Column[] = [
    { key: 'name', label: '指标名称' },
    { key: 'group', label: '分组' },
    { key: 'typeLabel', label: '类型' },
    { key: 'def', label: '口径', type: 'badge' },
    { key: 'source', label: '数据源', type: 'badge' },
    { key: 'preview', label: '实时预览', align: 'right' },
    { key: 'flowState', label: '流程状态', fixed: 'right',  render: (r: Row) => (
      <FlowStateCell flowId={String(r.flowKey ?? '')} state={String(r.flowState ?? '')}
        onChange={(s) => updateMetrics((list) => list.map((x) => x.id === String(r.id) ? { ...x, flowState: s } : x))} />
    ) },
  ];

  const allMetricVals = resolveMetricsForRows(metrics, sources.flatMap((s) => s.rows ?? []));

  const rows: Row[] = metrics.map((m: MidMetric) => {
    const src = srcById(m.dataSourceId);
    const def = m.type === 'base'
      ? `${AGG_LABEL[m.agg ?? 'count']}·${src?.fields.find((f) => f.key === m.field)?.label ?? m.field ?? '-'}`
      : `公式：${m.formula ?? '-'}`;
    const preview = m.type === 'base'
      ? computeMetricValue(m, src?.rows ?? [])
      : (allMetricVals[m.id] ?? evalMetricFormula(m.formula ?? '', allMetricVals));
    return {
      id: m.id,
      name: m.name,
      group: m.group ?? '-',
      typeLabel: METRIC_TYPE_LABEL[m.type],
      def,
      source: src?.name ?? m.dataSourceId,
      flowKey: m.flowKey ?? '',
      flowState: m.flowState ?? '',
      preview: fmt(preview, m.precision, m.unit),
    } as unknown as Row;
  });

  return (
    <ConfigListPage
      title="指标库"
      crumbPath="指标库"
      subtitle="定义可复用指标（选字段→筛选→计算→可视化），被监控策略、看板组件引用"
      addLabel="新建指标"
      onAdd={() => nav('/console/cm/mid-metric-detail?new=1')}
      actions={<></>}
      panelTitle="指标列表"
      panelDesc="点击任意行进入编辑页（直接在页面上改，保存即落盘）；基础指标取数据源字段聚合，派生指标用公式引用其它指标"
      columns={cols}
      rows={rows}
      onView={(r) => nav('/console/cm/mid-metric-detail?id=' + String(r.id))}
      rowActions={(r) => (
        <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
          <Button size="sm" variant="ghost" onClick={() => nav('/console/cm/mid-metric-detail?id=' + String(r.id))}>查看</Button>
        </div>
      )}
      editOpen={false}
      editTitle=""
      onCloseEdit={() => {}}
      onSave={() => {}}
    >
      {null}
    </ConfigListPage>
  );
}
