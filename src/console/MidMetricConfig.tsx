// ② 指标库（管理中心 · 贷中监控配置）
import { useState, useMemo } from 'react';
import { PageHeader, Panel, Button, DataTable } from '../components/ui';
import type { Column } from '../components/ui';
import { useMidDataSources, useMidMetrics, useMidStrategy, useMidDashboards, updateMetrics, midNewId, useMidSaveStatus } from './midStore';
import { MidSaveToast, Cfg, Sam, Cal } from './SourceTag';
import { computeAgg, evalMetricFormula, AGG_LABEL } from './midData';
import type { MidMetric, MetricType, AggOp } from './midData';

const aggCols: Column[] = [
  { key: 'id', label: '指标ID' },
  { key: 'name', label: '名称' },
  { key: 'type', label: '类型', type: 'badge' },
  { key: 'src', label: '数据源' },
  { key: 'expr', label: '聚合 / 公式' },
  { key: 'ref', label: '引用' },
];

const AGG_OPTIONS: AggOp[] = ['sum', 'count', 'avg', 'max', 'min', 'distinct'];

export default function MidMetricConfig() {
  const dataSources = useMidDataSources();
  const metrics = useMidMetrics();
  const strategy = useMidStrategy();
  const dashboards = useMidDashboards();
  const saveStatus = useMidSaveStatus();
  const [activeId, setActiveId] = useState<string | null>(metrics[0]?.id ?? null);
  const [draft, setDraft] = useState<MidMetric | null>(null);   // 新建/编辑草稿
  const [kw, setKw] = useState('');
  const [groupFilter, setGroupFilter] = useState<string>('');

  const groups = Array.from(new Set(metrics.map((m) => m.group ?? '未分组')));

  const active = metrics.find((m) => m.id === activeId) ?? null;
  const dsName = (id: string) => dataSources.find((d) => d.id === id)?.name ?? id;
  const dsFields = (dsId: string) => dataSources.find((d) => d.id === dsId)?.fields ?? [];

  // 基础指标实时聚合值（灰）
  const baseValue = useMemo(() => {
    if (!active || active.type !== 'base') return null;
    const ds = dataSources.find((d) => d.id === active.dataSourceId);
    if (!ds) return null;
    return computeAgg(ds.rows, active.field, active.agg);
  }, [active, dataSources]);

  // 派生指标实时计算值（灰）：先算全部基础指标，再代公式
  const derivedValue = useMemo(() => {
    if (!active || active.type !== 'derived') return null;
    const vals: Record<string, number> = {};
    for (const m of metrics) {
      if (m.type === 'base') {
        const ds = dataSources.find((d) => d.id === m.dataSourceId);
        if (ds) vals[m.id] = computeAgg(ds.rows, m.field, m.agg);
      }
    }
    return evalMetricFormula(active.formula ?? '', vals);
  }, [active, metrics, dataSources]);

  // 引用计数：被其他指标公式 / 策略任务规则 / 页面组件引用
  const refCount = (id: string) => {
    let n = 0;
    if (metrics.some((m) => m.type === 'derived' && m.formula?.includes(id))) n += 1;
    if (strategy.tasks.some((t) => t.metricIds.includes(id))) n += 1;
    if (strategy.rules.some((r) => r.metricId === id)) n += 1;
    if (dashboards.some((p) => p.widgets.some((w) => w.metricId === id))) n += 1;
    return n;
  };

  const rows = metrics
    .filter((m) => (!groupFilter || (m.group ?? '未分组') === groupFilter))
    .filter((m) => !kw || m.name.includes(kw) || m.id.includes(kw))
    .map((m) => ({
      id: m.id, name: m.name,
      type: m.type === 'base' ? '基础' : '派生',
      src: dsName(m.dataSourceId),
      expr: m.type === 'base' ? `${m.field ?? ''} · ${AGG_LABEL[m.agg ?? 'count']}` : m.formula ?? '',
      ref: refCount(m.id),
    }));

  const insertToFormula = (token: string) => {
    if (!draft || draft.type !== 'derived') return;
    setDraft({ ...draft, formula: `${draft.formula ?? ''}${draft.formula ? ' ' : ''}${token} ` });
  };

  return (
    <div style={{ padding: 24, maxWidth: 1200 }}>
      <PageHeader
        title="指标库"
        crumb="管理中心 / 贷中监控配置 / 指标库"
        subtitle="定义可复用指标（基础 + 派生公式），被监控策略、看板组件引用"
        actions={<Button onClick={() => { setDraft({ id: midNewId('m'), name: '', group: '客群', dataSourceId: dataSources[0]?.id ?? '', type: 'base', field: '', agg: 'count', precision: 0 }); }}>新建指标</Button>}
      />
      <MidSaveToast status={saveStatus} />

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 16, marginTop: 16 }}>
        <Panel title="指标列表" desc={<span>点击选中查看 / 编辑 <Cfg label="指标配置" /></span>}
          actions={<div style={{ display: 'flex', gap: 6 }}>
            <input value={kw} onChange={(e) => setKw(e.target.value)} placeholder="搜索名称/ID" style={{ ...inp, width: 130, fontSize: 12, padding: '5px 8px' }} />
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} style={{ ...sel, width: 90, fontSize: 12, padding: '5px 6px' }}>
              <option value="">全部分组</option>
              {groups.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>}
        >
          <DataTable columns={aggCols} rows={rows} clickableKey="id" onCellClick={(r) => setActiveId(r.id as string)} />
        </Panel>

        <Panel
          title={draft ? '编辑指标' : (active ? active.name : '请选择指标')}
          desc={active && !draft ? `${dsName(active.dataSourceId)} · ${active.type === 'base' ? '基础指标' : '派生指标'}` : undefined}
          actions={active && !draft ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => {
                if (refCount(active.id) > 0) { alert(`该指标被 ${refCount(active.id)} 处引用（策略/看板/公式），禁止删除`); return; }
                if (confirm(`确认删除指标 ${active.name}？`)) updateMetrics((l) => l.filter((m) => m.id !== active.id));
              }}>删除</Button>
              <Button size="sm" onClick={() => setDraft({ ...active })}>编辑</Button>
            </>
          ) : undefined}
        >
          {draft ? (
            <div style={{ display: 'grid', gap: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lb}>名称 <Cfg /></label><input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} style={inp} /></div>
                <div><label style={lb}>分组</label><input value={draft.group ?? ''} onChange={(e) => setDraft({ ...draft, group: e.target.value })} style={inp} placeholder="风险 / 预警 / 经营" /></div>
              </div>
              <div><label style={lb}>所属数据源 <Cfg /></label>
                <select style={sel} value={draft.dataSourceId} onChange={(e) => setDraft({ ...draft, dataSourceId: e.target.value, field: '' })}>
                  {dataSources.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label style={lb}>指标类型 <Cfg /></label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {(['base', 'derived'] as MetricType[]).map((t) => (
                    <button key={t} onClick={() => setDraft({ ...draft, type: t })} style={{
                      padding: '6px 12px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                      border: draft.type === t ? '1px solid #2563EB' : '1px solid #E2E8F0',
                      background: draft.type === t ? '#EFF6FF' : '#fff', color: draft.type === t ? '#1D4ED8' : '#475569',
                    }}>{t === 'base' ? '基础指标（字段+聚合）' : '派生指标（公式）'}</button>
                  ))}
                </div>
              </div>

              {draft.type === 'base' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><label style={lb}>字段</label>
                    <select style={sel} value={draft.field} onChange={(e) => setDraft({ ...draft, field: e.target.value })}>
                      <option value="">选择字段</option>
                      {dsFields(draft.dataSourceId).filter((f) => f.kind === 'measure').map((f) => <option key={f.key} value={f.key}>{f.label}（{f.key}）</option>)}
                    </select>
                  </div>
                  <div><label style={lb}>聚合</label>
                    <select style={sel} value={draft.agg} onChange={(e) => setDraft({ ...draft, agg: e.target.value as AggOp })}>
                      {AGG_OPTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label style={lb}>公式 <Cfg label="公式配置" /></label>
                  <textarea value={draft.formula ?? ''} onChange={(e) => setDraft({ ...draft, formula: e.target.value })} style={{ ...inp, width: '100%', minHeight: 60, fontFamily: 'monospace' }} placeholder="m_overdue_amt / m_loan_balance * 100" />
                  <div style={{ marginTop: 8, fontSize: 12, color: '#64748B' }}>变量面板（点击插入指标引用，支持 m_ 指标 + 四则运算 + ratio/mom/yoy）：</div>
                  {(() => {
                    const refs = metrics.filter((m) => m.id !== draft.id);
                    const gs = Array.from(new Set(refs.map((m) => m.group ?? '未分组')));
                    return gs.map((g) => (
                      <div key={g} style={{ marginTop: 6 }}>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{g}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 3 }}>
                          {refs.filter((m) => (m.group ?? '未分组') === g).map((m) => (
                            <button key={m.id} onClick={() => insertToFormula(m.id)} title={`${m.name}`} style={chip}>{m.id}</button>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div><label style={lb}>单位</label><input value={draft.unit ?? ''} onChange={(e) => setDraft({ ...draft, unit: e.target.value })} style={inp} placeholder="元 / % / 无" /></div>
                <div><label style={lb}>小数位</label><input type="number" value={draft.precision ?? 0} onChange={(e) => setDraft({ ...draft, precision: Number(e.target.value) })} style={inp} /></div>
              </div>
              <div><label style={lb}>说明</label><input value={draft.desc ?? ''} onChange={(e) => setDraft({ ...draft, desc: e.target.value })} style={inp} /></div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 12 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  实时预览 <Cal label="样例数据实时计算" /> <Sam label="样例数据源" value={dsName(draft.dataSourceId)} />
                </div>
                <div style={{ fontSize: 20, fontWeight: 600, color: '#0F172A' }}>
                  {draft.type === 'base'
                    ? (baseValue ?? '—')
                    : (derivedValue !== null ? derivedValue.toFixed(draft.precision ?? 2) : '—')}
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                  使用数据源样例数据（橘）{draft.type === 'base' ? '聚合计算' : '公式求值'}，结果实时（灰），不落盘
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <Button variant="secondary" onClick={() => setDraft(null)}>取消</Button>
                <Button onClick={() => {
                  if (!draft.name.trim()) { alert('请填写指标名称'); return; }
                  if (draft.type === 'base' && !draft.field) { alert('请选择字段'); return; }
                  const exists = metrics.some((m) => m.id === draft.id);
                  updateMetrics((l) => exists ? l.map((m) => (m.id === draft.id ? draft : m)) : [...l, draft]);
                  setActiveId(draft.id);
                  setDraft(null);
                }}>保存指标</Button>
              </div>
            </div>
          ) : active ? (
            <div style={{ display: 'grid', gap: 10, fontSize: 13, color: '#334155' }}>
              <div>ID：<b>{active.id}</b></div>
              <div>数据源：{dsName(active.dataSourceId)}</div>
              <div>类型：{active.type === 'base' ? '基础指标' : '派生指标'}</div>
              {active.type === 'base' ? (
                <div>计算：字段 <b>{active.field}</b> 聚合 <b>{active.agg}</b> <Cal label="实时计算" value={baseValue} /></div>
              ) : (
                <div>公式：<code style={{ background: '#F8FAFC', padding: '2px 6px', borderRadius: 4 }}>{active.formula}</code> <Cal label="实时计算" value={derivedValue !== null ? derivedValue.toFixed(active.precision ?? 2) : undefined} /></div>
              )}
              <div>单位：{active.unit || '无'} ｜ 小数位：{active.precision ?? 0}</div>
              <div>说明：{active.desc || '—'}</div>
              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
                <div style={{ fontWeight: 500, marginBottom: 4 }}>引用管理（{refCount(active.id)} 处） <Cfg label="被引用关系" /></div>
                {(() => {
                  const r: string[] = [];
                  metrics.filter((m) => m.type === 'derived' && m.formula?.includes(active.id)).forEach((m) => r.push(`指标公式：${m.name}`));
                  strategy.tasks.filter((t) => t.metricIds.includes(active.id)).forEach((t) => r.push(`监控任务：${t.name}`));
                  strategy.rules.filter((x) => x.metricId === active.id).forEach((x) => r.push(`预警规则：${x.name}`));
                  dashboards.forEach((p) => p.widgets.filter((w) => w.metricId === active.id).forEach((w) => r.push(`看板组件：${p.name} / ${w.title}`)));
                  return r.length ? (
                    <div style={{ display: 'grid', gap: 4 }}>
                      {r.map((x, i) => <div key={i} style={{ fontSize: 12, color: '#475569', background: '#F8FAFC', borderRadius: 4, padding: '4px 8px' }}>{x}</div>)}
                    </div>
                  ) : <div style={{ fontSize: 12, color: '#94A3B8' }}>未被引用，可安全删除</div>;
                })()}
              </div>
            </div>
          ) : <div style={{ color: '#94A3B8', padding: 24, textAlign: 'center' }}>左侧选择指标，或点击右上「新建指标」</div>}
        </Panel>
      </div>
    </div>
  );
}

const lb: React.CSSProperties = { display: 'block', fontSize: 12, color: '#64748B', marginBottom: 4 };
const inp: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13,
  outline: 'none', color: '#0F172A', background: '#fff', width: '100%', boxSizing: 'border-box',
};
const sel: React.CSSProperties = {
  padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13, background: '#fff', color: '#0F172A', width: '100%',
};
const chip: React.CSSProperties = {
  padding: '3px 8px', borderRadius: 4, fontSize: 11, fontFamily: 'monospace',
  border: '1px solid #C7D2FE', background: '#EEF2FF', color: '#4338CA', cursor: 'pointer',
};
