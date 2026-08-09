/* 催收子系统主要页面（需求41）
 * 页面：①催收总览（统计卡+阶段漏斗）②催收案件（队列：筛选+状态流转+记录）③催收策略（阶段策略配置）④催收记录（全量明细）
 * 数据：collectionData.json 样例橘 Sam（用户运行时创建/编辑落本地）；实时统计 灰 Cal。
 */
import { useMemo, useState } from 'react';
import { Panel, StatCard, DataTable, Button, Badge, StatusTag, DetailHeader } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { LineChart, BarChart, DonutChart } from '../components/charts';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useCollection, updateCollection, collectionNewId, STAGE_META, type CollectCase } from './collectionData';
import { useDunData } from './dunData';

const PALETTE = ['#2563EB', '#0891B2', '#7C3AED', '#DB2777', '#EA580C', '#16A34A', '#CA8A04', '#475569'];
const STATUS_KIND: Record<string, 'gray' | 'blue' | 'amber' | 'green' | 'violet' | 'red'> = {
  待分案: 'gray', 催收中: 'blue', 承诺还款: 'amber', 已结清: 'green', 委外: 'violet', 核销: 'red',
};
const STAGE_ORDER = ['M0', 'M1', 'M2', 'M3+'] as const;
const LIFECYCLE = ['催收', '协商分期', '调解', '立案诉讼', '强制执行', '回款/减免/结案'];
const REACHED: Record<string, number> = { 待分案: 0, 催收中: 1, 承诺还款: 2, 委外: 1, 已结清: 6, 核销: 6 };
const inp: React.CSSProperties = { padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' };

/* ============ ① 催收总览（BI 看板） ============ */
export function CollectionOverview() {
  const d = useCollection();
  const dun = useDunData();
  const cases = d.cases;
  const totalAmt = cases.reduce((a, c) => a + c.overdueAmt, 0);
  const m1 = cases.filter((c) => c.stage === 'M1').length;
  const m2 = cases.filter((c) => c.stage === 'M2').length;
  const m3 = cases.filter((c) => c.stage === 'M3+').length;
  const closed = cases.filter((c) => ['已结清', '核销'].includes(c.status)).length;

  const stageData = STAGE_ORDER.map((s) => ({ label: STAGE_META[s].label, value: cases.filter((c) => c.stage === s).length, color: STAGE_META[s].fill }));
  const statusData = Object.keys(STATUS_KIND).map((s) => ({ label: s, value: cases.filter((c) => c.status === s).length, color: PALETTE[Object.keys(STATUS_KIND).indexOf(s) % PALETTE.length] }));
  const trendLabels = ['第1周', '第2周', '第3周', '第4周', '第5周', '第6周'];
  const trend = [320, 305, 288, 262, 241, 218];

  // 委外绩效 / 质检违规 / 投诉统计（取自 dunData）
  const agencies = dun.agencies;
  const topAgencies = [...agencies].sort((a, b) => b.recoveryRate - a.recoveryRate).slice(0, 6);
  const agencyBar = {
    labels: topAgencies.map((a) => a.name.slice(0, 4)),
    series: [
      { name: '回款率%', color: '#16A34A', data: topAgencies.map((a) => a.recoveryRate) },
      { name: '接通率%', color: '#2563EB', data: topAgencies.map((a) => a.connectRate) },
    ],
  };
  const qaRecs = dun.qaRecords;
  const violationCount = qaRecs.filter((r) => r.result === '违规').length;
  const complaintTotal = agencies.reduce((a, x) => a + x.complaint, 0);
  const vioDist = (() => {
    const m: Record<string, number> = {};
    qaRecs.forEach((r) => r.violations.forEach((v) => (m[v] = (m[v] ?? 0) + 1)));
    return Object.entries(m).map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));
  })();

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="催收总览" crumb="零售信贷风控 / 催贷管理 / 催收总览" subtitle="逾期案件 + 委外绩效 + 质检违规 + 投诉统计 实时 BI 总览 · 报表支持定时导出、API 推送"
        actions={<><Sam label="催收样例" value="collectionData.json" /><Sam label="催贷样例" value="dunData.json" /><Cal label="实时统计" /></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="在催案件" value={String(cases.length)} accent="brand" hint={<Cal label="实时统计" />} />
        <StatCard label="在催金额" value={`¥${totalAmt.toLocaleString()}`} accent="rose" hint={<Cal label="实时统计" />} />
        <StatCard label="M1/M2/M3+" value={`${m1}/${m2}/${m3}`} accent="amber" hint="逾期阶段分布" />
        <StatCard label="已结清+核销" value={String(closed)} accent="emerald" hint="历史已了结" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'stretch', marginBottom: 16 }}>
        <Panel title="逾期阶段分布" desc={<span><Cal label="实时计算" /></span>}>
          <DonutChart data={stageData} centerLabel="在催案件" centerValue={String(cases.length)} height={210} />
        </Panel>
        <Panel title="案件状态分布" desc={<span><Cal label="实时计算" /></span>}>
          <DonutChart data={statusData} centerLabel="案件状态" centerValue={String(cases.length)} height={210} />
        </Panel>
        <Panel title="回款金额趋势（近 6 周 · 万元）" desc={<span>样例数据 <Sam value="collectionData.json" /></span>}>
          <LineChart labels={trendLabels} series={[{ name: '回款金额', color: '#16A34A', data: trend }]} unit="万" height={210} />
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'stretch', marginBottom: 16 }}>
        <Panel title="委外绩效（回款率 / 接通率 · Top6）" desc={<span>取自委外机构 <Sam value="dunData.json.agencies" /></span>}>
          <BarChart labels={agencyBar.labels} series={agencyBar.series} unit="%" height={230} />
        </Panel>
        <Panel title="质检违规类型分布" desc={<span>取自质检记录 <Sam value="dunData.json.qaRecords" /></span>}>
          <DonutChart data={vioDist.length ? vioDist : [{ label: '无违规', value: 1, color: '#16A34A' }]} centerLabel="违规数" centerValue={String(violationCount)} height={230} />
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        <StatCard label="委外机构" value={String(agencies.length)} accent="brand" hint={<Cal label="实时统计" />} />
        <StatCard label="质检违规通话" value={String(violationCount)} accent="rose" hint={<Cal label="实时统计" />} />
        <StatCard label="投诉总数" value={String(complaintTotal)} accent="amber" hint={<Cal label="实时统计" />} />
      </div>

      <Panel title="报表与数据服务" desc="BI 数据看板与报表 · 多维分析与导出">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Badge kind="blue">账龄分布</Badge>
          <Badge kind="cyan">接通率 / 转化率</Badge>
          <Badge kind="emerald">回款率</Badge>
          <Badge kind="violet">委外绩效</Badge>
          <Badge kind="amber">投诉统计</Badge>
          <Badge kind="red">质检违规统计</Badge>
          <span style={{ fontSize: 12, color: '#64748B', marginLeft: 4 }}>报表支持定时导出、API 推送</span>
        </div>
      </Panel>
    </div>
  );
}

/* ============ ② 催收案件（队列） ============ */
export function CollectionCases() {
  const d = useCollection();
  const [stage, setStage] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [owner, setOwner] = useState<string>('');
  const [viewId, setViewId] = useState<string | null>(null);
  const [note, setNote] = useState('');

  const owners = useMemo(() => Array.from(new Set(d.cases.map((c) => c.owner))), [d.cases]);
  const filtered = d.cases.filter((c) => (!stage || c.stage === stage) && (!status || c.status === status) && (!owner || c.owner === owner));
  const view = viewId ? d.cases.find((c) => c.id === viewId) : undefined;

  const advance = (c: CollectCase, to: string) => {
    updateCollection((dd) => ({
      ...dd,
      cases: dd.cases.map((x) => x.id === c.id ? { ...x, status: to, lastTouch: now(), notes: note ? [...x.notes, { time: now(), who: '当前催收员', what: note }] : x.notes } : x),
    }));
    setNote('');
  };

  const cols: Column[] = [
    { key: 'id', label: '案件号', type: 'text', width: '130px' },
    { key: 'custName', label: '客户', type: 'text', width: '80px' },
    { key: 'stage', label: '阶段', type: 'badge', badgeKind: 'gray', width: '120px' },
    { key: 'overdueAmt', label: '逾期金额', type: 'text', width: '110px' },
    { key: 'overdueDays', label: '逾期天数', type: 'text', width: '90px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
    { key: 'owner', label: '催收员', type: 'text', width: '80px' },
    { key: 'lastTouch', label: '最近触达', type: 'text', width: '110px' },
  ];
  const rows: Row[] = filtered.map((c) => ({
    id: c.id, custName: c.custName, stage: { v: STAGE_META[c.stage].label, kind: STAGE_META[c.stage].badge },
    overdueAmt: `¥${c.overdueAmt.toLocaleString()}`, overdueDays: String(c.overdueDays),
    status: { v: c.status, kind: STATUS_KIND[c.status] }, owner: c.owner, lastTouch: c.lastTouch,
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="催收案件" crumb="零售信贷风控 / 催贷管理 / 催收案件" subtitle="逾期案件队列 · 按阶段/状态/催收员筛选，行点击查看详情并记录触达"
        actions={<><Sam label="催收样例" value="collectionData.json" /><Cal label="实时统计" /></>} />

      <Panel title="案件队列" desc={<span>筛选后共 <b>{filtered.length}</b> 条 · <Cal label="实时过滤" /></span>}
        actions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <select style={inp} value={stage} onChange={(e) => setStage(e.target.value)}>
              <option value="">全部阶段</option>
              {STAGE_ORDER.map((s) => <option key={s} value={s}>{STAGE_META[s].label}</option>)}
            </select>
            <select style={inp} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">全部状态</option>
              {Object.keys(STATUS_KIND).map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select style={inp} value={owner} onChange={(e) => setOwner(e.target.value)}>
              <option value="">全部催收员</option>
              {owners.map((o) => <option key={o} value={o}>{o}</option>)}
            </select>
          </div>
        }>
        <DataTable columns={cols} rows={rows} empty="无匹配案件" clickableKey="id"
          onCellClick={(r) => setViewId(String(r.id))}
          actions={(r) => <Button size="sm" variant="ghost" onClick={() => setViewId(String(r.id))}>查看</Button>} pager defaultPageSize={15} />
      </Panel>

      {view && (
        <Panel title={`案件详情 · ${view.id}`} desc={<span>{view.custName} · {STAGE_META[view.stage].label} · 应还日 {view.dueDate} <Sam label="案件样例" value="collectionData.json" /></span>}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 16px', fontSize: 13, marginBottom: 12 }}>
            {([
              ['客户', view.custName], ['产品', view.product], ['逾期金额', `¥${view.overdueAmt.toLocaleString()}`],
              ['逾期天数', `${view.overdueDays} 天`], ['状态', view.status], ['催收员', view.owner],
              ['拨打次数', String(view.calls)], ['短信次数', String(view.sms)],
              ['承诺还款日', view.promiseDate ?? '—'],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                <span style={{ color: '#94A3B8' }}>{k}</span>
                <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* 处置闭环生命周期 */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>处置闭环生命周期（催收 → 协商分期 → 调解 → 立案诉讼 → 强制执行 → 回款/减免/结案/核销）</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              {LIFECYCLE.map((st, i) => {
                const reached = REACHED[view.status] ?? 0;
                const state = i < reached ? 'done' : i === reached ? 'current' : 'todo';
                const color = state === 'done' ? '#16A34A' : state === 'current' ? '#D97706' : '#CBD5E1';
                return (
                  <span key={st} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 12, color, fontWeight: state === 'todo' ? 400 : 600 }}>{st}</span>
                    {i < LIFECYCLE.length - 1 && <span style={{ color: '#CBD5E1' }}>→</span>}
                  </span>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
            <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="本次触达记录（可选）" style={{ flex: 1, minWidth: 180, padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12 }} />
            {view.status === '待分案' && <Button size="sm" onClick={() => advance(view, '催收中')}>开始催收</Button>}
            {view.status === '催收中' && <Button size="sm" onClick={() => advance(view, '承诺还款')}>标记承诺还款</Button>}
            {(view.status === '承诺还款' || view.status === '催收中') && <Button size="sm" variant="secondary" onClick={() => advance(view, '已结清')}>标记已结清</Button>}
            {view.stage === 'M3+' && view.status === '催收中' && <Button size="sm" variant="secondary" onClick={() => advance(view, '委外')}>转委外</Button>}
            {view.status === '委外' && <Button size="sm" variant="secondary" onClick={() => advance(view, '核销')}>核销</Button>}
          </div>

          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 6 }}>催收记录（{view.notes.length}）</div>
          {view.notes.length ? view.notes.map((n, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, padding: '4px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{n.time}</span>
              <span style={{ color: '#64748B', whiteSpace: 'nowrap' }}>{n.who}</span>
              <span style={{ color: '#334155' }}>{n.what}</span>
            </div>
          )) : <div style={{ fontSize: 12, color: '#94A3B8' }}>暂无催收记录</div>}
        </Panel>
      )}
    </div>
  );
}

/* ============ ③ 催收策略 ============ */
export function CollectionStrategy() {
  const d = useCollection();
  const toggle = (id: string) => updateCollection((dd) => ({ ...dd, tasks: dd.tasks.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t) }));
  const addTask = () => updateCollection((dd) => ({
    ...dd,
    tasks: [...dd.tasks, { id: collectionNewId('ct'), stage: 'M1', name: '新催收策略', autoAction: '', rules: [], owner: '催收一组', enabled: true }],
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="催收策略" crumb="零售信贷风控 / 催贷管理 / 催收策略" subtitle="按逾期阶段配置催收策略（M0 提醒 → M3+ 委外）· 数据保存到本地样例 JSON"
        actions={<><Sam label="策略样例" value="collectionData.json" /><Button size="sm" onClick={addTask}>＋ 新建策略</Button></>} />

      <div style={{ display: 'grid', gap: 12 }}>
        {d.tasks.map((t) => (
          <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', background: '#fff' }}>
            <StatusTag kind={STAGE_META[t.stage].badge}>{STAGE_META[t.stage].label}</StatusTag>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{t.name} <Sam value="collectionData.json.tasks.name" /></div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{t.autoAction}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>触发规则：{t.rules.join('；') || '—'}　·　负责：{t.owner}</div>
            </div>
            <Button size="sm" variant={t.enabled ? 'secondary' : 'primary'} onClick={() => toggle(t.id)}>{t.enabled ? '停用' : '启用'}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============ ④ 催收记录（全量明细） ============ */
export function CollectionRecords() {
  const d = useCollection();
  const recs = d.cases.flatMap((c) => c.notes.map((n) => ({ ...n, caseId: c.id, cust: c.custName, stage: c.stage, amt: c.overdueAmt })));
  const cols: Column[] = [
    { key: 'time', label: '时间', type: 'text', width: '120px' },
    { key: 'caseId', label: '案件号', type: 'text', width: '130px' },
    { key: 'cust', label: '客户', type: 'text', width: '80px' },
    { key: 'stage', label: '阶段', type: 'badge', badgeKind: 'gray', width: '110px' },
    { key: 'who', label: '催收员', type: 'text', width: '90px' },
    { key: 'what', label: '催收内容', type: 'text' },
  ];
  const rows: Row[] = recs.map((r, i) => ({
    id: String(i), time: r.time, caseId: r.caseId, cust: r.cust,
    stage: { v: STAGE_META[r.stage].label, kind: STAGE_META[r.stage].badge }, who: r.who, what: r.what,
  }));
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="催收记录" crumb="零售信贷风控 / 催贷管理 / 催收记录" subtitle="全量催收触达记录 · 数据来自本地样例 JSON"
        actions={<><Sam label="催收样例" value="collectionData.json" /><Cal label="实时统计" /></>} />
      <Panel title="触达记录" desc={<span>共 <b>{recs.length}</b> 条 · <Cal label="实时汇总" /></span>}>
        <DataTable columns={cols} rows={rows} empty="暂无催收记录" pager defaultPageSize={15} />
      </Panel>
    </div>
  );
}

function now() { return new Date().toISOString().slice(0, 10); }
