// 事件分析（还原 sensors/visual/2.1 事件分析.html）
// 复用优先（规则④）：PageShell / Panel / DataTable / SingleSelect / Button / Drawer / charts 全部取自既有实现
// 三色标签（规则③）：Cfg=查询配置 · Sam=样例数据 · Cal=前端实时计算
import { useMemo, useState, type ReactNode } from 'react';
import { Panel, DataTable, Drawer, SingleSelect, Button, Badge } from '../components/ui';
import type { Column, Row, SelectOption } from '../components/ui';
import { LineChart, BarChart, DonutChart } from '../components/charts';
import { MenuIcon, type IconName } from '../components/icons';
import { PageShell } from './PageShell';
import { MidSaveToast } from './SourceTag';
import { crumb, CONFIG_CONTAINER } from './ConfigTemplate';
import {
  EA_UPDATED_AT, EA_LABELS, EA_GRANULARITY, SEED_EA_ROWS,
  OPT_EA_METRIC, OPT_EA_EVENT, OPT_EA_PROP, OPT_EA_OP, OPT_EA_VALUE,
  OPT_EA_GROUP_PROP, OPT_EA_SUBJECT, OPT_EA_TIMEZONE, OPT_EA_SUMMARY, OPT_EA_TOPN,
} from './eventAnalysisData';
import type { EaEventItem, EaFilterCond } from './eventAnalysisData';
import {
  useEaConfig, updateEaConfig, resetEaConfig, useEaSaveStatus, eaNewId,
} from './eventAnalysisStore';
import type { EaConfig, EaChartType } from './eventAnalysisStore';

/* ---------- 小工具 ---------- */
const opts = (list: readonly (string | number)[]): SelectOption[] =>
  list.map((v) => ({ value: String(v), label: String(v) }));

const PALETTE = ['#2563eb', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16', '#f97316', '#6366f1'];
const fmt = (n: number) => n.toLocaleString('en-US');
const eventLabel = (e: EaEventItem) => `${e.event}的${e.metric}`;

/* ---------- 堆叠柱（charts.tsx 无此形态，页面内轻量实现，不污染公共组件） ---------- */
function StackBar({ labels, series, height = 240 }: {
  labels: string[];
  series: { name: string; color: string; data: number[] }[];
  height?: number;
}) {
  const W = 640, padL = 46, padR = 16, padT = 16, padB = 30;
  const plotW = W - padL - padR, plotH = height - padT - padB;
  const totals = labels.map((_, i) => series.reduce((a, s) => a + (s.data[i] ?? 0), 0));
  const max = Math.max(1, ...totals);
  const groupW = plotW / labels.length;
  const barW = Math.min(46, groupW * 0.55);
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${height}`} className="w-full" style={{ height }}>
        {Array.from({ length: 5 }).map((_, i) => {
          const gy = padT + (i / 4) * plotH;
          return (
            <g key={i}>
              <line x1={padL} y1={gy} x2={W - padR} y2={gy} stroke="#eef2f7" strokeWidth={1} />
              <text x={padL - 8} y={gy + 4} textAnchor="end" className="fill-slate-400" fontSize={11}>
                {Math.round(max - (i / 4) * max)}
              </text>
            </g>
          );
        })}
        {labels.map((lb, i) => {
          const cx = padL + groupW * i + groupW / 2;
          let acc = 0;
          return (
            <g key={lb}>
              {series.map((s) => {
                const v = s.data[i] ?? 0;
                const h = (v / max) * plotH;
                const y = padT + plotH - acc - h;
                acc += h;
                return v > 0 ? <rect key={s.name} x={cx - barW / 2} y={y} width={barW} height={h} fill={s.color} rx={2} /> : null;
              })}
              <text x={cx} y={height - 10} textAnchor="middle" className="fill-slate-400" fontSize={11}>{lb}</text>
            </g>
          );
        })}
      </svg>
      <div className="mt-2 flex flex-wrap gap-4">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5 text-xs text-slate-500">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} />{s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- 配置区小节 ---------- */
function CfgRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-t border-slate-100 py-3 first:border-t-0">
      <div className="w-20 shrink-0 pt-2 text-sm font-medium text-slate-500">{label}</div>
      <div className="flex-1 space-y-2">{children}</div>
    </div>
  );
}

const CHART_TYPES: { value: EaChartType; label: string; icon: IconName }[] = [
  { value: 'line', label: '折线图', icon: 'trend' },
  { value: 'bar', label: '柱状图', icon: 'bars' },
  { value: 'stack', label: '堆叠图', icon: 'stack' },
  { value: 'donut', label: '环形图', icon: 'pie' },
];

export default function EventAnalysis() {
  const cfg = useEaConfig();
  const saveStatus = useEaSaveStatus();

  // 已查询快照：点「查询」才把编辑中的配置提交为生效配置。
  // null 表示「尚未改动过」，此时直接跟随 cfg，避免 bootstrap 落盘配置与图表不一致。
  const [snap, setSnap] = useState<EaConfig | null>(null);
  const applied = snap ?? cfg;
  const [dirty, setDirty] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [compare, setCompare] = useState(false);
  const [layered, setLayered] = useState(true);
  const [showMetric, setShowMetric] = useState(''); // '' = 全部指标
  const [filterDrawer, setFilterDrawer] = useState<EaEventItem | null>(null);

  const patch = (fn: (c: EaConfig) => EaConfig) => {
    if (!snap) setSnap(cfg); // 首次改动先固化当前快照，改动才不会立刻影响结果区
    updateEaConfig(fn);
    setDirty(true);
  };
  const runQuery = () => {
    setSnap(cfg);
    setDirty(false);
  };

  /* ---------- 生效配置派生 ---------- */
  const labels = EA_LABELS[applied.granularity] ?? EA_LABELS.week;
  const shownEvents = applied.events.filter((e) => !showMetric || e.id === showMetric);
  const primaryId = applied.events[0]?.id ?? 'A';

  // 按主指标合计降序排列，取前 N 项
  const ranked = useMemo(() => {
    const list = [...SEED_EA_ROWS].sort((a, b) => (b.totals[primaryId] ?? 0) - (a.totals[primaryId] ?? 0));
    return list.slice(0, applied.topN);
  }, [primaryId, applied.topN]);

  const groupName = (r: (typeof SEED_EA_ROWS)[number]) => `${r.country}，${r.ip}`;

  // 图表序列：图例=分组，数值=选中指标（默认主指标）
  const metricForChart = showMetric || primaryId;
  const chartSeries = ranked.map((r, i) => ({
    name: groupName(r),
    color: PALETTE[i % PALETTE.length],
    data: (r.series[applied.granularity]?.[metricForChart] ?? []) as number[],
  }));
  const donutData = ranked.map((r, i) => ({
    label: groupName(r),
    value: r.totals[metricForChart] ?? 0,
    color: PALETTE[i % PALETTE.length],
  }));
  const donutTotal = donutData.reduce((a, d) => a + d.value, 0);

  /* ---------- 明细表 ---------- */
  const columns: Column[] = useMemo(() => {
    const base: Column[] = [
      { key: 'country', label: '国家', width: '110px' },
      { key: 'ip', label: 'IP', width: '150px' },
      { key: 'metric', label: '指标', width: '220px' },
      { key: 'total', label: '总和', align: 'right', width: '100px' },
    ];
    labels.forEach((lb, i) => base.push({ key: `t${i}`, label: lb, align: 'right', width: '110px' }));
    if (compare) base.push({ key: 'chain', label: '环比', align: 'right', width: '90px',  hint: '(末点 − 首点) ÷ 首点，由当前粒度序列实时计算' });
    return base;
  }, [labels, compare]);

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    ranked.forEach((r) => {
      shownEvents.forEach((ev, ei) => {
        const pts = (r.series[applied.granularity]?.[ev.id] ?? []) as number[];
        const first = pts[0] ?? 0;
        const last = pts[pts.length - 1] ?? 0;
        const chain = first === 0 ? '—' : `${(((last - first) / first) * 100).toFixed(1)}%`;
        const row: Row = {
          id: `${r.id}-${ev.id}`,
          country: layered && ei > 0 ? '' : r.country,
          ip: layered && ei > 0 ? '' : r.ip,
          metric: `${ev.id} ${eventLabel(ev)}`,
          total: fmt(r.totals[ev.id] ?? 0),
        };
        labels.forEach((_, i) => { row[`t${i}`] = fmt(pts[i] ?? 0); });
        if (compare) row.chain = chain;
        out.push(row);
      });
    });
    return out;
  }, [ranked, shownEvents, applied.granularity, labels, layered, compare]);

  /* ---------- 导出 ---------- */
  const download = (name: string, content: string, mime: string) => {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement('a');
    a.href = url; a.download = name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const exportCsv = () => {
    const head = columns.map((c) => c.label).join(',');
    const body = rows.map((r) => columns.map((c) => `"${String(r[c.key] ?? '')}"`).join(',')).join('\n');
    download(`事件分析_${applied.granularity}.csv`, '\ufeff' + head + '\n' + body, 'text/csv;charset=utf-8');
  };
  const exportSvg = () => {
    const svg = document.querySelector('#ea-chart svg');
    if (svg) download('事件分析图表.svg', new XMLSerializer().serializeToString(svg), 'image/svg+xml');
  };

  /* ---------- 配置区渲染 ---------- */
  const summaryBar = (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <span className="text-slate-500">分析主体: <b className="text-slate-700">{cfg.subject}</b></span>
      <span className="text-slate-500">时区: <b className="text-slate-700">{cfg.timezone}</b></span>
      <span className="text-slate-500">汇总配置: <b className="text-slate-700">{cfg.summaryCfg}</b></span>
      <span className="text-slate-500">事件选择: {cfg.events.map((e) => (
        <b key={e.id} className="ml-1 text-slate-700">{e.id} {eventLabel(e)}</b>
      ))}</span>
      <span className="text-slate-500">分组选择: <b className="text-slate-700">共 {cfg.groups.length} 个分组</b></span>
    </div>
  );

  return (
    <div className={CONFIG_CONTAINER}>
      <PageShell
        title="事件分析"
        subtitle={`数据更新时间: ${EA_UPDATED_AT}`}
        crumb={crumb('管理中心', '事件分析')}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={runQuery}>刷新</Button>
            <Button variant="ghost" size="sm">预警</Button>
            <Button variant="ghost" size="sm">添加到</Button>
            <Button variant="secondary" size="sm" onClick={exportCsv}>下载</Button>
          </div>
        }
      />

      {/* ===== 分析条件配置 ===== */}
      <Panel
        title="分析条件配置"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCollapsed((c) => !c)}>
              {collapsed ? '展开配置区' : '收起配置区'}
            </Button>
          </div>
        }
      >
        {collapsed ? summaryBar : (
          <div className="space-y-1">
            {/* 主体 / 时区 / 汇总 */}
            <div className="flex flex-wrap items-center gap-3 pb-3">
              <SingleSelect label="分析主体" options={opts(OPT_EA_SUBJECT)} value={cfg.subject}
                onChange={(v) => patch((c) => ({ ...c, subject: v }))} />
              <SingleSelect label="时区" options={opts(OPT_EA_TIMEZONE)} value={cfg.timezone}
                onChange={(v) => patch((c) => ({ ...c, timezone: v }))} />
              <SingleSelect label="汇总配置" options={opts(OPT_EA_SUMMARY)} value={cfg.summaryCfg}
                onChange={(v) => patch((c) => ({ ...c, summaryCfg: v }))} />
              <Button variant="ghost" size="sm" onClick={() => { resetEaConfig(); setDirty(true); }}>重置</Button>
            </div>

            {/* 事件选择 */}
            <CfgRow label="事件选择">
              {cfg.events.map((e) => (
                <div key={e.id} className="flex flex-wrap items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">{e.id}</span>
                  <SingleSelect label="事件" options={opts(OPT_EA_EVENT)} value={e.event}
                    onChange={(v) => patch((c) => ({ ...c, events: c.events.map((x) => x.id === e.id ? { ...x, event: v } : x) }))} />
                  <span className="text-sm text-slate-400">的</span>
                  <SingleSelect label="指标" options={opts(OPT_EA_METRIC)} value={e.metric}
                    onChange={(v) => patch((c) => ({ ...c, events: c.events.map((x) => x.id === e.id ? { ...x, metric: v } : x) }))} />
                  {e.filterHint && <Badge kind="blue">{e.filterHint}</Badge>}
                  <Button variant="ghost" size="sm" onClick={() => setFilterDrawer(e)}>筛选</Button>
                  <Button variant="ghost" size="sm" onClick={() => patch((c) => {
                    const id = String.fromCharCode(65 + c.events.length);
                    return { ...c, events: [...c.events, { ...e, id }] };
                  })}>复制</Button>
                  <Button variant="ghost" size="sm" onClick={() => patch((c) => ({ ...c, events: c.events.filter((x) => x.id !== e.id) }))}>删除</Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => patch((c) => ({
                ...c,
                events: [...c.events, { id: String.fromCharCode(65 + c.events.length), event: OPT_EA_EVENT[0], metric: '总次数', color: PALETTE[c.events.length % PALETTE.length] }],
              }))}>+ 添加事件</Button>
            </CfgRow>

            {/* 全局筛选 */}
            <CfgRow label="全局筛选">
              <div className="flex items-center gap-2">
                <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
                  {(['且', '或'] as const).map((r) => (
                    <button key={r} type="button" onClick={() => patch((c) => ({ ...c, filterRel: r }))}
                      className={`px-3 py-1 text-xs transition ${cfg.filterRel === r ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>{r}</button>
                  ))}
                </div>
                <span className="text-xs text-slate-400">并且满足以下条件</span>
              </div>
              {cfg.filters.map((f) => (
                <div key={f.id} className="flex flex-wrap items-center gap-2">
                  <SingleSelect label="属性" options={opts(OPT_EA_PROP)} value={f.prop}
                    onChange={(v) => patch((c) => ({ ...c, filters: c.filters.map((x) => x.id === f.id ? { ...x, prop: v } : x) }))} />
                  <SingleSelect label="运算符" options={opts(OPT_EA_OP)} value={f.op}
                    onChange={(v) => patch((c) => ({ ...c, filters: c.filters.map((x) => x.id === f.id ? { ...x, op: v } : x) }))} />
                  <div className="flex flex-wrap items-center gap-1">
                    {f.values.map((v) => (
                      <span key={v} className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">
                        {v}
                        <button type="button" className="text-slate-400 hover:text-rose-500"
                          onClick={() => patch((c) => ({ ...c, filters: c.filters.map((x) => x.id === f.id ? { ...x, values: x.values.filter((y) => y !== v) } : x) }))}>×</button>
                      </span>
                    ))}
                    <SingleSelect label="+ 值" options={opts(OPT_EA_VALUE.filter((v) => !f.values.includes(v)))} value=""
                      onChange={(v) => v && patch((c) => ({ ...c, filters: c.filters.map((x) => x.id === f.id ? { ...x, values: [...x.values, v] } : x) }))} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => patch((c) => ({ ...c, filters: c.filters.filter((x) => x.id !== f.id) }))}>删除</Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => patch((c) => ({
                ...c, filters: [...c.filters, { id: eaNewId('f'), prop: OPT_EA_PROP[0], op: '等于', values: [] } as EaFilterCond],
              }))}>+ 添加筛选</Button>
            </CfgRow>

            {/* 分组选择 */}
            <CfgRow label="分组选择">
              {cfg.groups.map((g) => (
                <div key={g.id} className="flex items-center gap-2">
                  <SingleSelect label="分组属性" options={opts(OPT_EA_GROUP_PROP)} value={g.prop}
                    onChange={(v) => patch((c) => ({ ...c, groups: c.groups.map((x) => x.id === g.id ? { ...x, prop: v } : x) }))} />
                  <Button variant="ghost" size="sm" onClick={() => patch((c) => ({ ...c, groups: c.groups.filter((x) => x.id !== g.id) }))}>删除</Button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => patch((c) => ({
                ...c, groups: [...c.groups, { id: eaNewId('gp'), prop: OPT_EA_GROUP_PROP[0] }],
              }))}>+ 添加</Button>
            </CfgRow>

            {/* 时间选择 */}
            <CfgRow label="时间选择">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
                  {EA_GRANULARITY.map((g) => (
                    <button key={g.value} type="button" onClick={() => patch((c) => ({ ...c, granularity: g.value }))}
                      className={`px-3 py-1.5 text-xs transition ${cfg.granularity === g.value ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>{g.label}</button>
                  ))}
                </div>
                <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
                  <input type="checkbox" checked={compare} onChange={(e) => setCompare(e.target.checked)} className="accent-brand-600" />
                  对比时间
                </label>
                <span className="text-xs text-slate-400">事件发生的时间范围：{labels[0]} ~ {labels[labels.length - 1]}</span>
              </div>
            </CfgRow>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <Button variant="primary" onClick={runQuery}>查 询</Button>
              {dirty && <span className="text-xs text-amber-600">配置已修改，点击「查询」后生效</span>}
            </div>
          </div>
        )}
      </Panel>

      {/* ===== 图形展示 ===== */}
      <Panel
        title="图形展示"
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
              {CHART_TYPES.map((t) => (
                <button key={t.value} type="button" title={t.label}
                  onClick={() => patch((c) => ({ ...c, chartType: t.value }))}
                  className={`px-2.5 py-1.5 transition ${cfg.chartType === t.value ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>
                  <MenuIcon name={t.icon} className="h-4 w-4" />
                </button>
              ))}
            </div>
            <SingleSelect label="展示指标" options={applied.events.map((e) => ({ value: e.id, label: `${e.id} ${eventLabel(e)}` }))}
              value={showMetric} onChange={setShowMetric} clearable />
            <SingleSelect label="前 N 项" options={opts(OPT_EA_TOPN).map((o) => ({ ...o, label: `前 ${o.label} 项` }))}
              value={String(cfg.topN)} onChange={(v) => patch((c) => ({ ...c, topN: Number(v) }))} />
            <Button variant="secondary" size="sm" onClick={exportSvg}>导出图片</Button>
          </div>
        }
      >
        <div id="ea-chart">
          {cfg.chartType === 'line' && <LineChart labels={labels} series={chartSeries} height={280} />}
          {cfg.chartType === 'bar' && <BarChart labels={labels} series={chartSeries} height={280} />}
          {cfg.chartType === 'stack' && <StackBar labels={labels} series={chartSeries} height={280} />}
          {cfg.chartType === 'donut' && (
            <DonutChart data={donutData} centerLabel="合计" centerValue={fmt(donutTotal)} height={260} />
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          按当前查询条件，展示以 「{applied.events.find((e) => e.id === metricForChart)?.event ?? ''}的
          {applied.events.find((e) => e.id === metricForChart)?.metric ?? ''}」 合计值 降序排列后的前 {applied.topN} 个分组数据
          （共 {ranked.length} 项）
        </p>
      </Panel>

      {/* ===== 表格展示 ===== */}
      <Panel
        title="表格展示"
        actions={
          <div className="flex items-center gap-2">
            <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
              {([['分层', true], ['平铺', false]] as const).map(([lb, v]) => (
                <button key={lb} type="button" onClick={() => setLayered(v)}
                  className={`px-3 py-1 text-xs transition ${layered === v ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}>{lb}</button>
              ))}
            </div>
            <Button variant="secondary" size="sm" onClick={exportCsv}>导出 Excel</Button>
          </div>
        }
      >
        <DataTable columns={columns} rows={rows} empty="暂无数据" />
        <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
          <span>共 <b className="text-slate-600">{rows.length}</b> 条</span>
          <span>本页显示第 1-{rows.length} 条</span>
        </div>
      </Panel>

      {/* ===== 事件级筛选抽屉 ===== */}
      <Drawer open={!!filterDrawer} onClose={() => setFilterDrawer(null)}
        title={filterDrawer ? `${filterDrawer.id} ${eventLabel(filterDrawer)} · 筛选` : ''} width="max-w-xl">
        {filterDrawer && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">为该事件单独设置筛选条件，仅影响此指标的计算结果。</p>
            <div className="flex flex-wrap items-center gap-2">
              <SingleSelect label="属性" options={opts(OPT_EA_PROP)} value="" onChange={() => {}} />
              <SingleSelect label="运算符" options={opts(OPT_EA_OP)} value="" onChange={() => {}} />
              <SingleSelect label="值" options={opts(OPT_EA_VALUE)} value="" onChange={() => {}} />
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="primary" size="sm" onClick={() => {
                patch((c) => ({ ...c, events: c.events.map((x) => x.id === filterDrawer.id ? { ...x, filterHint: '已设置筛选' } : x) }));
                setFilterDrawer(null);
              }}>确定</Button>
              <Button variant="secondary" size="sm" onClick={() => {
                patch((c) => ({ ...c, events: c.events.map((x) => x.id === filterDrawer.id ? { ...x, filterHint: undefined } : x) }));
                setFilterDrawer(null);
              }}>清空</Button>
            </div>
          </div>
        )}
      </Drawer>

      <MidSaveToast status={saveStatus} />
    </div>
  );
}
