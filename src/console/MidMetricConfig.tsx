// ② 指标库（管理中心 · 配置域）— 配置JSON 蓝；公式预览 灰（实时计算）
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Cal, Sam } from './SourceTag';
import { useMidMetrics, updateMetrics, useMidDataSources, midNewId } from './midStore';
import {
  type MidMetric, type MetricType, type AggOp, type MidDataSource,
  AGG_LABEL, evalMetricFormula, computeAgg, resolveMetricsForRows,
} from './midData';
import { ConfigListPage, METRIC_TYPE_LABEL, fmt } from './ConfigTemplate';

const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 160 };

export default function MidMetricConfig() {
  const metrics = useMidMetrics();
  const sources = useMidDataSources();
  const [editing, setEditing] = useState<MidMetric | null>(null);
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const [params] = useSearchParams();
  const openedRef = useRef<string | null>(null);
  useEffect(() => {
    const eid = params.get('edit');
    if (eid && openedRef.current !== eid) {
      const m = metrics.find((x) => x.id === eid);
      if (m) { openedRef.current = eid; setEditing(JSON.parse(JSON.stringify(m))); setOpen(true); }
    }
  }, [params, metrics]);

  const srcById = (id: string) => sources.find((s) => s.id === id);

  const openAdd = () => {
    setEditing({ id: midNewId('m'), name: '', group: '未分组', dataSourceId: sources[0]?.id ?? '', type: 'base', field: '', agg: 'sum', precision: 0 });
    setOpen(true);
  };
  const save = () => {
    if (!editing) return;
    updateMetrics((list) => {
      const i = list.findIndex((x) => x.id === editing.id);
      return i < 0 ? [...list, editing] : list.map((x) => (x.id === editing.id ? editing : x));
    });
    setOpen(false); setEditing(null);
  };
  const remove = (id: string) => updateMetrics((list) => list.filter((x) => x.id !== id));

  const cols: Column[] = [
    { key: 'name', label: '指标名称', tag: { kind: 'cfg', value: 'midMetrics.json.name' } },
    { key: 'group', label: '分组', tag: { kind: 'cfg', value: 'midMetrics.json.group' } },
    { key: 'typeLabel', label: '类型', tag: { kind: 'cfg', value: 'midMetrics.json.type' } },
    { key: 'def', label: '口径', type: 'badge', tag: { kind: 'cfg', value: 'midMetrics.json.formula' } },
    { key: 'source', label: '数据源', type: 'badge', tag: { kind: 'cfg', value: 'midMetrics.json.dataSourceId' } },
    { key: 'status', label: '状态', type: 'badge', tag: { kind: 'cfg', value: 'midMetrics.json.enabled' } },
    { key: 'preview', label: '实时预览', align: 'right', tag: { kind: 'calc' } },
  ];

  // 全局实时计算预览（灰）：用各数据源样例行解析基础指标，派生指标经公式求值
  const allMetricVals = resolveMetricsForRows(metrics, sources.flatMap((s) => s.rows ?? []));

  const rows: Row[] = metrics.map((m) => {
    const src = srcById(m.dataSourceId);
    const def = m.type === 'base'
      ? `${AGG_LABEL[m.agg ?? 'count']}·${src?.fields.find((f) => f.key === m.field)?.label ?? m.field ?? '-'}`
      : `公式：${m.formula ?? '-'}`;
    const preview = m.type === 'base'
      ? (src ? computeAgg(src.rows ?? [], m.field, m.agg) : 0)
      : (allMetricVals[m.id] ?? evalMetricFormula(m.formula ?? '', allMetricVals));
    return {
      id: m.id,
      name: m.name,
      group: m.group ?? '-',
      typeLabel: METRIC_TYPE_LABEL[m.type],
      def,
      source: src?.name ?? m.dataSourceId,
      status: m.enabled === false ? { v: '停用', kind: 'red' } : { v: '启用', kind: 'green' },
      preview: fmt(preview, m.precision, m.unit),
    } as unknown as Row;
  });

  return (
    <ConfigListPage
      title="指标库"
      crumbPath="指标库"
      subtitle="定义可复用指标（基础聚合 + 派生公式），被监控策略、看板组件引用"
      addLabel="新建指标"
      onAdd={openAdd}
      actions={<Cfg value="midMetrics.json" />}
      panelTitle="指标列表"
      panelDesc="配置即落盘；基础指标取数据源字段聚合，派生指标用公式引用其它指标（实时计算见「实时预览」列）"
      columns={cols}
      rows={rows}
      onView={(r) => nav('/console/cm/mid-metric-detail?id=' + String(r.id))}
      editOpen={open}
      editTitle={editing && metrics.find((m) => m.id === editing.id) ? '编辑指标' : '新建指标'}
      onCloseEdit={() => setOpen(false)}
      onSave={save}
    >
      {editing && <Editor value={editing} metrics={metrics} sources={sources} onChange={setEditing} onRemove={() => { if (editing) { remove(editing.id); setOpen(false); setEditing(null); } }} />}
    </ConfigListPage>
  );
}

function Editor({ value, metrics, sources, onChange, onRemove }: { value: MidMetric; metrics: MidMetric[]; sources: MidDataSource[]; onChange: (v: MidMetric) => void; onRemove: () => void }) {
  const set = (p: Partial<MidMetric>) => onChange({ ...value, ...p });
  const src = sources.find((s) => s.id === value.dataSourceId);
  const allRows = sources.flatMap((s) => s.rows ?? []);
  const ctx = resolveMetricsForRows(metrics, allRows); // 实时计算上下文（灰）

  // 实时计算预览（灰）：该指标在当前样例上的值
  const preview = value.type === 'base'
    ? (src ? computeAgg(src.rows ?? [], value.field, value.agg) : 0)
    : evalMetricFormula(value.formula ?? '', ctx);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label style={lbl}>指标名称<input style={inp} value={value.name} onChange={(e) => set({ name: e.target.value })} /></label>
        <label style={lbl}>分组<input style={inp} value={value.group ?? ''} onChange={(e) => set({ group: e.target.value })} /></label>
        <label style={lbl}>类型
          <select style={inp} value={value.type} onChange={(e) => set({ type: e.target.value as MetricType })}>
            <option value="base">基础指标</option><option value="derived">派生指标</option>
          </select>
        </label>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <label style={lbl}>数据源（字段来源） <Cfg value="midDataSources.json" />
          <select style={inp} value={value.dataSourceId} onChange={(e) => set({ dataSourceId: e.target.value, field: '' })}>
            {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
        {value.type === 'base' && (
          <>
            <label style={lbl}>度量字段
              <select style={inp} value={value.field ?? ''} onChange={(e) => set({ field: e.target.value })}>
                <option value="">— 选择字段 —</option>
                {(src?.fields.filter((f) => f.kind === 'measure') ?? []).map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
              </select>
            </label>
            <label style={lbl}>聚合方式
              <select style={inp} value={value.agg ?? 'sum'} onChange={(e) => set({ agg: e.target.value as AggOp })}>
                {(Object.keys(AGG_LABEL) as AggOp[]).map((k) => <option key={k} value={k}>{AGG_LABEL[k]}</option>)}
              </select>
            </label>
          </>
        )}
        <label style={lbl}>单位<input style={inp} value={value.unit ?? ''} onChange={(e) => set({ unit: e.target.value })} placeholder="元 / % / 次" /></label>
        <label style={lbl}>精度<input style={inp} type="number" value={value.precision ?? 0} onChange={(e) => set({ precision: Number(e.target.value) })} /></label>
      </div>

      {value.type === 'derived' && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>派生公式 <Cal label="实时计算" /></div>
          <input style={{ ...inp, fontFamily: 'monospace' }} value={value.formula ?? ''}
            placeholder="例如 m_overdue_amt / m_loan_balance * 100" onChange={(e) => set({ formula: e.target.value })} />
          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
            引用方式：<code>m_指标ID</code>，支持 + - * / 与括号；可用 ratio(a,b) 表示 a/b*100。
          </p>
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F3F4F6', borderRadius: 8 }}>
        <Cal label="实时计算" />
        <span style={{ fontSize: 12, color: '#6B7280' }}>当前样例值：</span>
        <strong style={{ fontSize: 16, color: '#374151' }}>{fmt(preview, value.precision, value.unit)}</strong>
      </div>

      {value.id && <Button variant="ghost" size="sm" onClick={onRemove}>删除该指标</Button>}
    </div>
  );
}
