// 指标编辑器（内联，无弹窗）— 三步：选择数据源 → SQL编辑器 → 可视化预览
// 数据源/字段为 样例JSON 橘（midDataSources.json · 用户连接中台落本地）；实时计算 灰
import { useState } from 'react';
import { Button, Badge, SingleSelect } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import {
  type MidMetric, type MetricType, type AggOp, type MidDataSource, type VizSample,
} from './midData';
import { useMidVizSamples } from './midStore';
import { MetricViz, type MetricVizType } from './MetricChart';
import { VisualSqlEditor } from './VisualSqlEditor';

const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 160 };

const card: React.CSSProperties = { border: '1px solid #E2E8F0', borderRadius: 10, padding: 14, background: '#fff' };
const cardHead: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 10 };
const stepTag: React.CSSProperties = { background: '#2563EB', color: '#fff', borderRadius: 6, padding: '2px 8px', fontSize: 11, fontWeight: 600 };
const hint: React.CSSProperties = { fontSize: 11, fontWeight: 400, color: '#94A3B8' };
const VIZ_LABEL: Record<MetricVizType, string> = { table: '表格', bar: '柱状图', line: '折线图', area: '面积图', pie: '饼状图', hbar: '条形图', burndown: '燃尽图', radar: '雷达图' };
const VIZ_ORDER: MetricVizType[] = ['table', 'bar', 'hbar', 'line', 'area', 'pie', 'burndown', 'radar'];
function vizBtn(active: boolean): React.CSSProperties {
  return { padding: '5px 12px', borderRadius: 6, fontSize: 12, border: `1px solid ${active ? '#2563EB' : '#E2E8F0'}`, background: active ? '#EFF6FF' : '#fff', color: active ? '#2563EB' : '#475569', cursor: 'pointer', fontWeight: active ? 600 : 400 };
}

// 由结构化定义 + 关联生成可读 SQL（用作 SQL 编辑框的初始占位与提示）
const SQL_AGG: Record<AggOp, string> = { sum: 'SUM', count: 'COUNT', avg: 'AVG', max: 'MAX', min: 'MIN', distinct: 'COUNT' };
function buildSql(value: MidMetric, sources: MidDataSource[]): string {
  const main = sources.find((s) => s.id === value.dataSourceId);
  const from = main?.conn?.database || main?.name || 'table';
  if (value.type === 'derived') {
    const expr = value.formula?.trim() || 'm_指标A / m_指标B * 100';
    let sql = `SELECT (${expr}) AS val\nFROM ${from}`;
    for (const j of value.joins ?? []) {
      const other = sources.find((s) => s.id === j.sourceId);
      if (other) sql += `\nJOIN ${other.conn?.database || other.name} ON ${from}.${j.key} = ${(other.conn?.database || other.name)}.${j.key}`;
    }
    return sql;
  }
  const agg = value.agg ?? 'sum';
  const field = value.field || 'field';
  const measure = agg === 'distinct'
    ? `COUNT(DISTINCT ${value.dedupField || value.field || 'field'})`
    : agg === 'count' ? 'COUNT(*)' : `${SQL_AGG[agg]}(${field})`;
  let sql = `SELECT ${measure} AS val\nFROM ${from}`;
  for (const j of value.joins ?? []) {
    const other = sources.find((s) => s.id === j.sourceId);
    if (other) sql += `\nJOIN ${other.conn?.database || other.name} ON ${from}.${j.key} = ${(other.conn?.database || other.name)}.${j.key}`;
  }
  const conds = (value.filters ?? [])
    .filter((f) => f.field && String(f.value) !== '')
    .map((f) => `${f.field} = ${/^\d+(\.\d+)?$/.test(String(f.value)) ? f.value : `'${f.value}'`}`);
  if (conds.length) sql += `\nWHERE ${conds.join(' AND ')}`;
  if (value.groupBy?.length) sql += `\nGROUP BY ${value.groupBy.join(', ')}`;
  return sql;
}

export function MetricEditor({ value, metrics, sources, onChange, onRemove, sourceViewSlot }: {
  value: MidMetric; metrics: MidMetric[]; sources: MidDataSource[];
  onChange: (v: MidMetric) => void; onRemove?: () => void; sourceViewSlot?: React.ReactNode;
}) {
  const set = (p: Partial<MidMetric>) => onChange({ ...value, ...p });

  // 步骤 1 下拉选择器的本地状态：展开 / 搜索关键字
  const [pickerOpen, setPickerOpen] = useState(false);
  const [kw, setKw] = useState('');

  // 步骤 1：已选数据源（多选）
  const selIds = (value.dataSourceIds && value.dataSourceIds.length)
    ? value.dataSourceIds
    : (value.dataSourceId ? [value.dataSourceId] : []);
  const toggleSource = (id: string) => {
    const next = selIds.includes(id) ? selIds.filter((x) => x !== id) : [...selIds, id];
    const nextPrimary = next.includes(value.dataSourceId) ? value.dataSourceId : next[0] ?? '';
    set({ dataSourceIds: next, dataSourceId: nextPrimary });
  };
  // 主数据源（FROM）：默认已选中第一项，供步骤 1 卡片高亮与步骤 2 生成占位 SQL
  const mainId = selIds.includes(value.dataSourceId) ? value.dataSourceId : (selIds[0] ?? '');
  const generatedSql = buildSql(value, sources);

  // 步骤 1 下拉：按业务域分组 + 关键字筛选
  const kwLower = kw.trim().toLowerCase();
  const filteredSrc = sources.filter((s) => {
    if (!kwLower) return true;
    const hay = `${s.name} ${s.desc ?? ''} ${s.category ?? ''}`.toLowerCase();
    return hay.includes(kwLower);
  });
  const dsGroups = new Map<string, MidDataSource[]>();
  for (const s of filteredSrc) {
    const cat = s.category || '未分类';
    if (!dsGroups.has(cat)) dsGroups.set(cat, []);
    dsGroups.get(cat)!.push(s);
  }
  const CAT_ORDER = ['客户域', '预警域', '信贷域', '行为域', '外部数据'];
  const orderedGroups = [...dsGroups.keys()].sort((a, b) => {
    const ia = CAT_ORDER.indexOf(a); const ib = CAT_ORDER.indexOf(b);
    return (ia < 0 ? 999 : ia) - (ib < 0 ? 999 : ib);
  });

  // 可视化预览数据
  const vizSamples = useMidVizSamples();
  const vizSample: VizSample | undefined = vizSamples.find((s) => s.id === value.vizSampleId) ?? vizSamples[0];
  const vizData = vizSample?.data ?? [];
  const vizUnit = vizSample?.unit ?? value.unit;
  const vizPrecision = vizSample?.precision ?? value.precision;
  const vizType: MetricVizType = value.vizType ?? 'bar';

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      {/* 基本信息（每个字段标注来源） */}
      <div style={card}>
        <div style={cardHead}>基本信息 <span style={hint}>指标的身份与展示</span> <Sam value="midMetrics.json" /></div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={lbl}>指标名称 <Sam value="midMetrics.json.name" /><input style={inp} value={value.name} onChange={(e) => set({ name: e.target.value })} placeholder="如 在贷余额" /></label>
          <GroupSelect value={value.group ?? ''} groups={Array.from(new Set(metrics.map((m) => m.group).filter(Boolean) as string[]))} onChange={(g) => set({ group: g })} />
          <label style={lbl}>类型 <Sam value="midMetrics.json.type" />
            <SingleSelect label="类型" fullWidth value={value.type} onChange={(v) => set({ type: v as MetricType })}
              options={[{ value: 'base', label: '基础指标（统计字段）' }, { value: 'derived', label: '派生指标（公式）' }]} />
          </label>
          <label style={lbl}>单位 <Sam value="midMetrics.json.unit" /><input style={inp} value={value.unit ?? ''} onChange={(e) => set({ unit: e.target.value })} placeholder="元 / % / 次" /></label>
          <label style={lbl}>精度 <Sam value="midMetrics.json.precision" /><input style={inp} type="number" value={value.precision ?? 0} onChange={(e) => set({ precision: Number(e.target.value) })} /></label>
          <label style={lbl}>描述 <Sam value="midMetrics.json.desc" /><input style={inp} value={value.desc ?? ''} onChange={(e) => set({ desc: e.target.value })} placeholder="指标的口径说明" /></label>
        </div>
      </div>

      {/* 步骤 1：选择数据源（下拉选择 + 分类分组 + 搜索筛选；已选卡片展示详情与字段） */}
      <div style={card}>
        <div style={cardHead}><span style={stepTag}>步骤 1</span> 选择数据源 <Sam value="midDataSources.json" /> <span style={hint}>可多选，来自数据源管理页配置</span>{sourceViewSlot && <span style={{ marginLeft: 'auto' }}>{sourceViewSlot}</span>}</div>

        <div style={{ position: 'relative', display: 'inline-block' }}>
          <button type="button" onClick={() => { setPickerOpen((v) => !v); setKw(''); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 8, border: '1px solid #2563EB', background: '#EFF6FF', color: '#2563EB', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            + 添加数据源{selIds.length > 0 && <span style={{ background: '#2563EB', color: '#fff', borderRadius: 999, padding: '0 6px', fontSize: 11 }}>{selIds.length}</span>}
          </button>
          {pickerOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setPickerOpen(false)} />
              <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50, width: 340, maxHeight: 340, overflowY: 'auto', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, boxShadow: '0 8px 24px rgba(15,23,42,.12)', padding: 8 }}>
                <input autoFocus style={{ ...inp, marginBottom: 8 }} placeholder="🔍 搜索名称 / 描述 / 分类" value={kw} onChange={(e) => setKw(e.target.value)} />
                {orderedGroups.length === 0 && <div style={{ fontSize: 12, color: '#94A3B8', padding: '8px 4px' }}>无匹配数据源</div>}
                {orderedGroups.map((cat) => (
                  <div key={cat}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', padding: '8px 4px 4px' }}>{cat}</div>
                    {dsGroups.get(cat)!.map((s) => {
                      const on = selIds.includes(s.id);
                      return (
                        <div key={s.id} onClick={() => toggleSource(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 8px', borderRadius: 6, cursor: 'pointer', background: on ? '#EFF6FF' : 'transparent', border: on ? '1px solid #BFDBFE' : '1px solid transparent' }}>
                          <span style={{ width: 16, height: 16, borderRadius: 4, border: `1px solid ${on ? '#2563EB' : '#CBD5E1'}`, background: on ? '#2563EB' : '#fff', color: '#fff', fontSize: 10, lineHeight: '14px', textAlign: 'center' }}>{on ? '✓' : ''}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: '#0F172A' }}>{s.name}</div>
                            <div style={{ fontSize: 11, color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.desc ?? ''}</div>
                          </div>
                          <Badge kind="slate">{s.type}</Badge>
                          <span style={{ fontSize: 12, color: on ? '#2563EB' : '#64748B', fontWeight: on ? 600 : 400 }}>{on ? '已选' : '＋加入'}</span>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* 已选详情 */}
        <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
          {selIds.map((id) => {
            const s = sources.find((x) => x.id === id); if (!s) return null;
            const m = s.fields.filter((f) => f.kind === 'measure');
            const d = s.fields.filter((f) => f.kind === 'dim');
            const isPrimary = id === mainId;
            return (
              <div key={id} style={{ border: '1px solid #EEF2F7', borderRadius: 8, padding: '10px 12px', background: isPrimary ? '#F8FAFF' : '#FBFCFE' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <strong style={{ fontSize: 13, color: '#0F172A' }}>{s.name}</strong>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#94A3B8' }}>{s.conn?.database || s.name}</span>
                  <Badge kind="slate">{s.category ?? '未分类'}</Badge>
                  {isPrimary && <Badge kind="blue">主源 · FROM</Badge>}
                  <button type="button" onClick={() => toggleSource(id)} style={{ marginLeft: 'auto', border: 'none', background: 'transparent', color: '#94A3B8', cursor: 'pointer', fontSize: 14 }}>✕</button>
                </div>
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 5 }}>
                  库：{s.conn?.database ?? '-'}　·　主机：{s.conn?.host ?? '-'}　·　端口：{s.conn?.port ?? '-'}　·　用户：{s.conn?.username ?? '-'}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 6 }}>
                  {m.map((f) => <span key={f.key} style={{ fontSize: 11, padding: '1px 7px', borderRadius: 5, background: '#EFF6FF', color: '#2563EB' }}>{f.label}<span style={{ color: '#94A3B8' }}>·{f.key}·度量</span></span>)}
                  {d.map((f) => <span key={f.key} style={{ fontSize: 11, padding: '1px 7px', borderRadius: 5, background: '#F1F5F9', color: '#475569' }}>{f.label}<span style={{ color: '#94A3B8' }}>·{f.key}·维度</span></span>)}
                  {!s.fields.length && <span style={{ fontSize: 11, color: '#94A3B8' }}>该数据源暂无字段</span>}
                </div>
              </div>
            );
          })}
          {!selIds.length && <span style={{ fontSize: 12, color: '#94A3B8' }}>尚未选择数据源，点「+ 添加数据源」选择。步骤 2 的字段选项依赖所选数据源。</span>}
        </div>
      </div>

      {/* 步骤 2：取数配置（需求42：双选项卡——第一个「可视化 SQL 编辑器」，第二个「SQL编辑器」） */}
      <div style={card}>
        <div style={cardHead}><span style={stepTag}>步骤 2</span> 取数配置 <Sam value="midMetrics.json.editorMode" /> <span style={hint}>可视化配置或直接编写 SQL，两者实时同步</span></div>

        {/* 选项卡切换 */}
        <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E2E8F0', marginBottom: 12 }}>
          {([['visual', '可视化 SQL 编辑器'], ['sql', 'SQL 编辑器']] as const).map(([mode, label]) => (
            <button key={mode} type="button" onClick={() => set({ editorMode: mode })}
              style={{ padding: '8px 16px', fontSize: 13, cursor: 'pointer', border: 'none', borderBottom: `2px solid ${(value.editorMode ?? 'visual') === mode ? '#2563EB' : 'transparent'}`, background: 'transparent', color: (value.editorMode ?? 'visual') === mode ? '#2563EB' : '#64748B', fontWeight: (value.editorMode ?? 'visual') === mode ? 600 : 400 }}>
              {label}
              {(value.editorMode ?? 'visual') === mode && <span style={{ marginLeft: 4, fontSize: 11, color: '#94A3B8' }}>●</span>}
            </button>
          ))}
        </div>

        {(value.editorMode ?? 'visual') === 'visual' ? (
          <VisualSqlEditor value={value} sources={sources} onChange={onChange} />
        ) : (
          <>
            <textarea style={{ ...inp, minHeight: 160, fontFamily: 'ui-monospace, monospace', resize: 'vertical', whiteSpace: 'pre' }} value={value.sql ?? ''}
              placeholder={generatedSql} onChange={(e) => set({ sql: e.target.value })} />
            <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>SELECT 结果需返回单列 <code>val</code>，作为该指标实时值；保存后由调度任务执行。</div>

            {/* 已选数据源字段提示（极简弱化，仅一行浅灰小字） */}
            {selIds.length > 0 && (
              <div style={{ marginTop: 8, fontSize: 11, color: '#9AA7B8', lineHeight: 1.8 }}>
                <span style={{ color: '#94A3B8' }}>参考字段（来自已选数据源）：</span>
                {selIds.flatMap((id) => {
                  const s = sources.find((x) => x.id === id); if (!s) return [];
                  const lib = s.conn?.database ?? s.name;
                  return s.fields.map((f) => ({ tok: `${lib}.${f.key}`, label: f.label }));
                }).map((it, i) => (
                  <span key={i} style={{ marginLeft: 6, fontFamily: 'ui-monospace, monospace', color: '#AEB9C9' }}>{it.tok}<span style={{ color: '#CDD6E0', marginLeft: 2 }}>{it.label}</span></span>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* 步骤 3：可视化预览（08081 3.7：删样例数据集下拉组） */}
      <div style={card}>
        <div style={cardHead}><span style={stepTag}>步骤 3</span> 可视化预览 <Cal label="实时计算" /> <span style={hint}>选图表类型查看效果</span></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {VIZ_ORDER.map((t) => (
            <button key={t} type="button" onClick={() => set({ vizType: t })} style={vizBtn(vizType === t)}>{VIZ_LABEL[t]}</button>
          ))}
        </div>
        <MetricViz data={vizData} type={vizType} unit={vizUnit} precision={vizPrecision} />
      </div>

      {onRemove && value.id && <Button variant="ghost" size="sm" onClick={onRemove}>删除该指标</Button>}
    </div>
  );
}

/* 分组下拉：选择已有分组或新建（选中「＋ 新建分组」后显示输入框） */
function GroupSelect({ value, groups, onChange }: { value: string; groups: string[]; onChange: (g: string) => void }) {
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState('');
  if (creating) {
    return (
      <label style={lbl}>分组 <Sam value="midMetrics.json.group" />
        <div style={{ display: 'flex', gap: 6 }}>
          <input style={{ ...inp, flex: 1 }} value={draft} autoFocus placeholder="新分组名称"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && draft.trim()) { onChange(draft.trim()); setCreating(false); setDraft(''); } }}
            onBlur={() => { if (draft.trim()) onChange(draft.trim()); setCreating(false); setDraft(''); }} />
          <button type="button" onClick={() => { if (draft.trim()) onChange(draft.trim()); setCreating(false); setDraft(''); }}
            style={{ border: '1px solid #2563EB', background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '0 10px', fontSize: 12, cursor: 'pointer' }}>确定</button>
        </div>
      </label>
    );
  }
  return (
    <label style={lbl}>分组 <Sam value="midMetrics.json.group" />
      <SingleSelect label="分组" fullWidth value={value} onChange={(v) => {
        if (v === '__new__') { setCreating(true); }
        else onChange(v);
      }} options={[
        ...(!groups.includes(value) && value ? [{ value, label: value }] : []),
        ...groups.map((g) => ({ value: g, label: g })),
        { value: '__new__', label: '＋ 新建分组…' },
      ]} />
    </label>
  );
}
