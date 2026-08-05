// 指标编辑器（内联，无弹窗）— 步骤化：选字段 → 筛选 → 计算 → 可视化
// 数据源/字段为 样例JSON 橘（midDataSources.json · 用户连接中台落本地）；实时计算 灰
import { Button } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import {
  type MidMetric, type MetricType, type AggOp, type MidDataSource, type MidMetricFilter, type MetricFilterOp, type VizSample,
  AGG_LABEL, evalMetricFormula, computeMetricValue, resolveMetricsForRows, FILTER_OP_LABEL,
} from './midData';
import { useMidVizSamples } from './midStore';
import { MetricViz, type MetricVizType } from './MetricChart';
import { fmt } from './ConfigTemplate';

const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 160 };

const card: React.CSSProperties = { border: '1px solid #E2E8F0', borderRadius: 10, padding: 14, background: '#fff' };
const cardHead: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 10 };
const stepTag: React.CSSProperties = { background: '#2563EB', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 };
const hint: React.CSSProperties = { fontSize: 11, fontWeight: 400, color: '#94A3B8' };
const warn: React.CSSProperties = { fontSize: 11, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 6, padding: '4px 8px', marginTop: 6 };
const VIZ_LABEL: Record<MetricVizType, string> = { table: '表格', bar: '柱状图', line: '折线图', area: '面积图', pie: '饼状图', hbar: '条形图', burndown: '燃尽图', radar: '雷达图' };
const VIZ_ORDER: MetricVizType[] = ['table', 'bar', 'hbar', 'line', 'area', 'pie', 'burndown', 'radar'];
function vizBtn(active: boolean): React.CSSProperties {
  return { padding: '5px 12px', borderRadius: 6, fontSize: 12, border: `1px solid ${active ? '#2563EB' : '#E2E8F0'}`, background: active ? '#EFF6FF' : '#fff', color: active ? '#2563EB' : '#475569', cursor: 'pointer', fontWeight: active ? 600 : 400 };
}
function chip(on: boolean): React.CSSProperties {
  return { padding: '4px 10px', borderRadius: 999, fontSize: 12, border: `1px solid ${on ? '#2563EB' : '#E2E8F0'}`, background: on ? '#EFF6FF' : '#fff', color: on ? '#2563EB' : '#64748B', cursor: 'pointer', fontWeight: on ? 600 : 400 };
}

export function MetricEditor({ value, metrics, sources, onChange, onRemove }: {
  value: MidMetric; metrics: MidMetric[]; sources: MidDataSource[];
  onChange: (v: MidMetric) => void; onRemove?: () => void;
}) {
  const set = (p: Partial<MidMetric>) => onChange({ ...value, ...p });
  const toggleGroupBy = (k: string) => {
    const cur = value.groupBy ?? [];
    set({ groupBy: cur.includes(k) ? cur.filter((x) => x !== k) : [...cur, k] });
  };
  const src = sources.find((s) => s.id === value.dataSourceId);
  const allRows = sources.flatMap((s) => s.rows ?? []);
  const ctx = resolveMetricsForRows(metrics, allRows); // 实时计算上下文（灰）
  const preview = value.type === 'base'
    ? computeMetricValue(value, src?.rows ?? [])
    : evalMetricFormula(value.formula ?? '', ctx);

  // 可视化预览数据：来自 midVizSamples.json（样例橘），不依赖指标配置
  const vizSamples = useMidVizSamples();
  const vizSample: VizSample | undefined = vizSamples.find((s) => s.id === value.vizSampleId) ?? vizSamples[0];
  const vizData = vizSample?.data ?? [];
  const vizUnit = vizSample?.unit ?? value.unit;
  const vizPrecision = vizSample?.precision ?? value.precision;
  const vizType: MetricVizType = value.vizType ?? 'bar';
  const vizStep = value.type === 'base' ? 4 : 2;

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* 基本信息 */}
      <div style={card}>
        <div style={cardHead}>基本信息 <span style={hint}>指标的身份与展示</span> <Sam value="midMetrics.json" /></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={lbl}>指标名称<input style={inp} value={value.name} onChange={(e) => set({ name: e.target.value })} placeholder="如 在贷余额" /></label>
          <label style={lbl}>分组<input style={inp} value={value.group ?? ''} onChange={(e) => set({ group: e.target.value })} placeholder="如 风险 / 预警" /></label>
          <label style={lbl}>类型
            <select style={inp} value={value.type} onChange={(e) => set({ type: e.target.value as MetricType })}>
              <option value="base">基础指标（统计字段）</option>
              <option value="derived">派生指标（公式）</option>
            </select>
          </label>
          <label style={lbl}>单位<input style={inp} value={value.unit ?? ''} onChange={(e) => set({ unit: e.target.value })} placeholder="元 / % / 次" /></label>
          <label style={lbl}>精度<input style={inp} type="number" value={value.precision ?? 0} onChange={(e) => set({ precision: Number(e.target.value) })} /></label>
        </div>
      </div>

      {value.type === 'base' ? (
        <>
          {/* 步骤 1 选字段 */}
          <div style={card}>
            <div style={cardHead}><span style={stepTag}>步骤 1</span> 选择字段 <span style={hint}>先选数据源，再选要统计的度量字段</span></div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={lbl}>数据源（字段来源） <Sam value="midDataSources.json" />
                <select style={inp} value={value.dataSourceId} onChange={(e) => set({ dataSourceId: e.target.value, field: '' })}>
                  {sources.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </label>
              <label style={lbl}>度量字段 <Sam value="midMetrics.json.field" />
                <select style={inp} value={value.field ?? ''} onChange={(e) => set({ field: e.target.value })}>
                  <option value="">— 选择字段 —</option>
                  {(src?.fields.filter((f) => f.kind === 'measure') ?? []).map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                </select>
              </label>
            </div>
            {!src && <div style={warn}>请先选择数据源</div>}
            {src && !src.fields.some((f) => f.kind === 'measure') && <div style={warn}>该数据源没有可用的度量字段</div>}
          </div>

          {/* 步骤 2 筛选 */}
          <div style={card}>
            <div style={cardHead}><span style={stepTag}>步骤 2</span> 筛选条件 <span style={hint}>统计前按维度过滤样例行（可多条；留空=不过滤）</span> <Sam value="midMetrics.json.filters" /></div>
            <FilterEditor value={value} src={src} setFilters={(nf) => set({ filters: nf })} />
          </div>

          {/* 步骤 3 计算 */}
          <div style={card}>
            <div style={cardHead}><span style={stepTag}>步骤 3</span> 计算方式 <span style={hint}>聚合方式，或写多字段表达式</span></div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <label style={lbl}>聚合方式 <Sam value="midMetrics.json.agg" />
                <select style={inp} value={value.agg ?? 'sum'} onChange={(e) => set({ agg: e.target.value as AggOp })}>
                  {(Object.keys(AGG_LABEL) as AggOp[]).map((k) => <option key={k} value={k}>{AGG_LABEL[k]}</option>)}
                </select>
              </label>
              {value.agg === 'distinct' && (
                <label style={lbl}>去重字段 <Sam value="midMetrics.json.dedupField" />
                  <select style={inp} value={value.dedupField ?? value.field ?? ''} onChange={(e) => set({ dedupField: e.target.value })}>
                    <option value="">— 同度量字段 —</option>
                    {(src?.fields ?? []).map((f) => <option key={f.key} value={f.key}>{f.label}</option>)}
                  </select>
                </label>
              )}
            </div>

            {/* 分组维度（可视化用） */}
            <div style={{ ...lbl, minWidth: '100%', marginTop: 10 }}>
              分组维度（可选·用于可视化按维度分布） <Sam value="midMetrics.json.groupBy" />
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                {(src?.fields.filter((f) => f.kind === 'dim') ?? []).map((f) => (
                  <button key={f.key} type="button" onClick={() => toggleGroupBy(f.key)} style={chip((value.groupBy ?? []).includes(f.key))}>{f.label}</button>
                ))}
              </div>
            </div>
            {!src && <div style={warn}>请先在「步骤 1」选择数据源后再设分组维度</div>}
            {src && !src.fields.some((f) => f.kind === 'dim') && <div style={warn}>该数据源没有维度字段，无法按维度分组（预览将显示整体值）</div>}

            <label style={{ ...lbl, minWidth: '100%', marginTop: 10 }}>
              多字段计算（可选·引用源字段 key，如 loan_balance/credit_line*100）<Sam value="midDataSources.json" />
              <input style={{ ...inp, fontFamily: 'monospace' }} value={value.expr ?? ''} placeholder="留空则直接用上方度量字段做聚合"
                onChange={(e) => set({ expr: e.target.value })} />
              <span style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>填写后将替代上方「聚合方式」，单独用于计算</span>
            </label>
          </div>
        </>
      ) : (
        <div style={card}>
          <div style={cardHead}><span style={stepTag}>步骤 1</span> 定义公式 <span style={hint}>引用其它指标算派生值</span></div>
          <input style={{ ...inp, fontFamily: 'monospace' }} value={value.formula ?? ''} placeholder="例如 m_overdue_amt / m_loan_balance * 100"
            onChange={(e) => set({ formula: e.target.value })} />
          <p style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
            引用方式：<code>m_指标ID</code>，支持 + - * / 与括号；可用 ratio(a,b) 表示 a/b*100。
          </p>
        </div>
      )}

      {/* 可视化 */}
      <div style={card}>
        <div style={cardHead}><span style={stepTag}>步骤 {vizStep}</span> 可视化预览 <Sam value="midVizSamples.json" /> <span style={hint}>样例数据 · 选图表类型查看效果</span></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 10, alignItems: 'flex-end' }}>
          <label style={{ ...lbl, minWidth: 220 }}>
            样例数据集 <Sam value="midVizSamples.json" />
            <select style={inp} value={vizSample?.id ?? ''} onChange={(e) => set({ vizSampleId: e.target.value })}>
              {vizSamples.map((s) => <option key={s.id} value={s.id}>{s.name}（{s.data.length} 项）</option>)}
            </select>
          </label>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {VIZ_ORDER.map((t) => (
            <button key={t} type="button" onClick={() => set({ vizType: t })} style={vizBtn(vizType === t)}>{VIZ_LABEL[t]}</button>
          ))}
        </div>
        <MetricViz data={vizData} type={vizType} unit={vizUnit} precision={vizPrecision} />
      </div>

      {/* 实时值 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F3F4F6', borderRadius: 8 }}>
        <Cal label="实时计算" />
        <span style={{ fontSize: 12, color: '#6B7280' }}>当前样例值：</span>
        <strong style={{ fontSize: 16, color: '#374151' }}>{fmt(preview, value.precision, value.unit)}</strong>
      </div>

      {onRemove && value.id && <Button variant="ghost" size="sm" onClick={onRemove}>删除该指标</Button>}
    </div>
  );
}

function FilterEditor({ value, src, setFilters }: { value: MidMetric; src?: MidDataSource; setFilters: (nf: MidMetricFilter[]) => void }) {
  const filters = value.filters ?? [];
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: '#475569' }}>已设 {filters.length} 条</span>
        <Button size="sm" variant="ghost" onClick={() => setFilters([...filters, { field: src?.fields[0]?.key ?? '', op: 'eq', value: '' }])}>+ 添加筛选</Button>
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {filters.map((f, i) => (
          <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <select style={{ ...inp, flex: '0 0 140px' }} value={f.field} onChange={(e) => { const nf = [...filters]; nf[i] = { ...f, field: e.target.value }; setFilters(nf); }}>
              <option value="">— 字段 —</option>
              {(src?.fields ?? []).map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}
            </select>
            <select style={{ ...inp, flex: '0 0 90px' }} value={f.op} onChange={(e) => { const nf = [...filters]; nf[i] = { ...f, op: e.target.value as MetricFilterOp }; setFilters(nf); }}>
              {(Object.keys(FILTER_OP_LABEL) as MetricFilterOp[]).map((o) => <option key={o} value={o}>{FILTER_OP_LABEL[o]}</option>)}
            </select>
            <input style={{ ...inp, flex: 1 }} value={f.value} placeholder="值" onChange={(e) => { const nf = [...filters]; nf[i] = { ...f, value: e.target.value }; setFilters(nf); }} />
            <Button size="sm" variant="ghost" onClick={() => setFilters(filters.filter((_, j) => j !== i))}>✕</Button>
          </div>
        ))}
        {!filters.length && <span style={{ fontSize: 11, color: '#94A3B8' }}>无筛选，聚合全部样例行</span>}
      </div>
    </div>
  );
}
