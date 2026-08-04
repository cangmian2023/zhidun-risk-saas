// ② 指标库（管理中心 · 配置域）— 配置JSON 蓝；公式预览 灰（实时计算）
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Modal, Button } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Cal, Sam } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidMetrics, updateMetrics, useMidDataSources, midNewId } from './midStore';
import {
  type MidMetric, type MetricType, type AggOp, type MidDataSource,
  AGG_LABEL, evalMetricFormula, computeAgg, resolveMetricsForRows,
} from './midData';

const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 160 };

const TYPE_LABEL: Record<MetricType, string> = { base: '基础指标', derived: '派生指标' };

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
    { key: 'name', label: '指标名称' },
    { key: 'group', label: '分组' },
    { key: 'typeLabel', label: '类型' },
    { key: 'def', label: '口径', type: 'badge' },
    { key: 'source', label: '数据源', type: 'badge' },
    { key: 'preview', label: '实时预览', align: 'right' },
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
      typeLabel: TYPE_LABEL[m.type],
      def,
      source: src?.name ?? m.dataSourceId,
      preview: fmt(preview, m.precision, m.unit),
    } as unknown as Row;
  });

  return (
    <div style={{ padding: 24, maxWidth: 1180 }}>
      <PageShell title="指标库" crumb="零售信贷风控 / 管理中心 / 贷中监控配置"
        subtitle="定义可复用指标（基础聚合 + 派生公式），被监控策略、看板组件引用"
        actions={<><Cfg label="配置JSON" value="midMetrics.json" /><Button size="sm" onClick={openAdd}>新建指标</Button></>} />
      <Panel title="指标列表" desc="配置即落盘；基础指标取数据源字段聚合，派生指标用公式引用其它指标"
        actions={<Sam label="样例数据" value={`${sources.reduce((a, s) => a + (s.rows?.length || 0), 0)} 行驱动`} />}>
        <DataTable columns={cols} rows={rows} clickableKey="name"
          onCellClick={(r) => nav('/console/cm:mid-metric-detail?id=' + String(r.id))} />
      </Panel>

      <Modal open={open} onClose={() => setOpen(false)}
        title={editing && metrics.find((m) => m.id === editing.id) ? '编辑指标' : '新建指标'} width="max-w-2xl"
        footer={<><Button onClick={save}>保存</Button><Button variant="secondary" onClick={() => setOpen(false)}>取消</Button></>}>
        {editing && <Editor value={editing} metrics={metrics} sources={sources} onChange={setEditing} onRemove={() => { if (editing) { remove(editing.id); setOpen(false); setEditing(null); } }} />}
      </Modal>
    </div>
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
        <label style={lbl}>数据源（字段来源） <Cfg label="配置JSON" value="midDataSources.json" />
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

function fmt(v: number | null, precision = 0, unit = ''): string {
  if (v === null || v === undefined || Number.isNaN(v as number)) return '-';
  const n = Number(v);
  return `${n.toLocaleString(undefined, { maximumFractionDigits: precision, minimumFractionDigits: 0 })}${unit}`;
}
