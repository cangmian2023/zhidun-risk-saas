// ⑧ 处置工单（使用域 · 列表）— 读 midDisposeTasks.json 橘；实时统计 灰
// 行点击跳转工单详情页（cr:mid-dispose-detail），处置回填与流转在详情页完成
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidDisposeTasks, useMidSaveStatus } from './midStore';
import type { MidDisposeTask } from './midData';

type Status = MidDisposeTask['status'];
const STATUS_KIND: Record<Status, 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gray'> = {
  待处置: 'red', 核实中: 'amber', 处置中: 'blue', 已解除: 'green', 已升级: 'violet', 误报: 'gray',
};

export default function MidDisposeWorkbench() {
  const tasks = useMidDisposeTasks();
  const saveStatus = useMidSaveStatus();
  const nav = useNavigate();

  const [status, setStatus] = useState<string>('');
  const [assign, setAssign] = useState<string>('');

  const assigns = useMemo(() => Array.from(new Set(tasks.map((t) => t.assignTo))), [tasks]);
  const filtered = tasks.filter((t) => (!status || t.status === status) && (!assign || t.assignTo === assign));

  const counts = useMemo(() => {
    const c: Record<string, number> = { 待处置: 0, 核实中: 0, 处置中: 0, 已解除: 0, 已升级: 0, 误报: 0 };
    tasks.forEach((t) => { c[t.status] = (c[t.status] ?? 0) + 1; });
    return c;
  }, [tasks]);

  const cols: Column[] = [
    { key: 'id', label: '工单号', type: 'text', width: '150px' },
    { key: 'custName', label: '客户', type: 'text', width: '90px' },
    { key: 'action', label: '建议动作', type: 'text', width: '100px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
    { key: 'updatedAt', label: '更新时间', type: 'text', width: '150px' },
  ];
  const rows: Row[] = filtered.map((t) => ({
    id: t.id,
    custName: t.custName,
    action: t.action,
    status: { v: t.status, kind: STATUS_KIND[t.status] },
    updatedAt: t.updatedAt,
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="处置工单" crumb="零售信贷风控 / 贷中监控 / 处置闭环" subtitle="工单队列 · 点击任意一条查看详情并回填处置"
        actions={<><Sam label="工单样例" value={`${tasks.length} 条`} /><Cal label="实时统计" /></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        {(['待处置', '核实中', '处置中', '已解除', '已升级', '误报'] as Status[]).map((s) => (
          <StatCard key={s} label={s} value={String(counts[s])} accent={s === '待处置' ? 'rose' : s === '已解除' ? 'emerald' : 'brand'} />
        ))}
      </div>

      <Panel title="工单队列" desc={<span>筛选后共 <b>{filtered.length}</b> 条 <Cal label="实时过滤" /></span>}
        actions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Sel value={status} onChange={setStatus} opts={[{ v: '', l: '全部状态' }, ...(['待处置', '核实中', '处置中', '已解除', '已升级', '误报'] as Status[]).map((x) => ({ v: x, l: x }))]} />
            <Sel value={assign} onChange={setAssign} opts={[{ v: '', l: '全部分派' }, ...assigns.map((x) => ({ v: x, l: x }))]} />
          </div>
        }>
        <DataTable columns={cols} rows={rows} empty="无匹配工单"
          clickableKey="id"
          onCellClick={(r) => nav('/console/cr:mid-dispose-detail?id=' + String(r.id))} />
      </Panel>

      <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8' }}>
        <Cal label="实时" /> 当前工单总数 {tasks.length}；工单状态流转：待处置 → 核实中 → 处置中 → 已解除 / 已升级 / 误报
      </div>

      {saveStatus === 'error' && (
        <div style={{ position: 'fixed', right: 24, top: 72, zIndex: 999, padding: '6px 12px', borderRadius: 6, fontSize: 12, background: '#FEF2F2', color: '#B91C1C', border: '1px solid #FCA5A5' }}>
          保存失败，请检查本地 JSON 写入
        </div>
      )}
    </div>
  );
}

function Sel({ value, onChange, opts }: { value: string; onChange: (v: string) => void; opts: { v: string; l: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' }}>
      {opts.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  );
}
