// 处置工单详情（使用域）— 读 midDisposeTasks.json 橘；实时统计 灰
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Panel, Button, StatusTag, DetailHeader } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { usePageNav } from './pageNav';
import { useMidDisposeTasks, updateDisposeTasks } from './midStore';
import type { MidDisposeTask } from './midData';

type Status = MidDisposeTask['status'];
const STATUS_FLOW: Record<string, Status[]> = {
  待处置: ['核实中'], 核实中: ['处置中', '误报'], 处置中: ['已解除', '已升级'],
};
const STATUS_KIND: Record<Status, 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gray'> = {
  待处置: 'red', 核实中: 'amber', 处置中: 'blue', 已解除: 'green', 已升级: 'violet', 误报: 'gray',
};
function now(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function MidDisposeDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const tasks = useMidDisposeTasks();
  const { goDetail } = usePageNav();
  const [note, setNote] = useState('');
  const [operator, setOperator] = useState('风控专员-当前');

  const t = tasks.find((x) => x.id === id) ?? null;

  if (!t) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell header={<DetailHeader title="工单详情" crumb="贷中监控 / 处置闭环" backLabel="返回队列" />} />
        <div style={{ padding: 24, color: '#94A3B8', fontSize: 13 }}>未找到该工单（{id}）。</div>
      </div>
    );
  }

  const advance = (to: Status) => {
    const who = operator || '风控专员-当前';
    const what = note
      ? (to === '处置中' ? `执行处置：${note}` : to === '误报' ? `标记误报：${note}` : to === '已解除' ? `解除：${note}` : to === '已升级' ? `升级：${note}` : `核实：${note}`)
      : (to === '核实中' ? '开始核实' : to === '处置中' ? '执行处置' : to === '误报' ? '标记误报' : to === '已解除' ? '解除预警，工单关闭' : '升级工单');
    updateDisposeTasks((list) => list.map((x) => x.id === t.id
      ? { ...x, status: to, operator: who, updatedAt: now(), logs: [...x.logs, { time: now(), who, what }] }
      : x));
    setNote('');
  };

  return (
    <div style={{ padding: 24, maxWidth: 1080 }}>
      <PageShell header={<DetailHeader title={`工单详情 · ${t.id}`} crumb="贷中监控 / 处置闭环" subtitle={t.custName}
        backLabel="返回队列"
        actions={<>
          <Sam label="工单样例" value={`${tasks.length} 条`} />
          <Cal label="实时统计" />
        </>} />} />

      <Panel title="工单信息" desc="处置工单基础信息">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 16px', fontSize: 13, marginBottom: 12 }}>
          {([
            ['客户', t.custName], ['预警号', t.alertId], ['建议动作', t.action],
            ['对接系统', t.targetSystem], ['需审批', t.needApprove ? '是' : '否'], ['分派', t.assignTo],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
              <span style={{ color: '#94A3B8' }}>{k}</span>
              <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div style={{ gridColumn: 'span 2' }}><StatusTag kind={STATUS_KIND[t.status]}>{t.status}</StatusTag></div>
        </div>
        <Button size="sm" variant="ghost" onClick={() => goDetail(`/console/dm/person-archive-basic?name=${encodeURIComponent(t.custName || t.custId)}`)}>查看客户详情 →</Button>
        <Button size="sm" variant="ghost" onClick={() => goDetail(`/console/cr/mid-alert-detail?id=${t.alertId}`)}>查看关联预警 →</Button>
      </Panel>

      <Panel title="处置回填" desc="按状态流转推进闭环">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="操作人" style={{ width: 150, padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12 }} />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="处置回填备注" style={{ flex: 1, minWidth: 160, padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12 }} />
          {STATUS_FLOW[t.status]?.map((to) => (
            <Button key={to} size="sm" variant={to === '误报' || to === '已升级' ? 'secondary' : 'primary'} onClick={() => advance(to)}>
              {t.status === '待处置' && to === '核实中' ? '开始核实' : to === '处置中' ? '执行处置' : to === '误报' ? '标记误报' : to === '已解除' ? '解除闭环' : to === '已升级' ? '升级工单' : to}
            </Button>
          ))}
          {!STATUS_FLOW[t.status] && <span style={{ fontSize: 12, color: '#16A34A' }}>✓ 工单已闭环（{t.status}）</span>}
        </div>
      </Panel>

      <Panel title="操作日志" desc={<span><Sam label="样例" /> 工单状态变更与处置记录</span>}>
        <div style={{ position: 'relative', paddingLeft: 18 }}>
          <div style={{ position: 'absolute', left: 5, top: 4, bottom: 4, width: 2, background: '#E2E8F0' }} />
          {t.logs.map((l, i) => (
            <div key={i} style={{ position: 'relative', paddingBottom: 12 }}>
              <span style={{ position: 'absolute', left: -16, top: 4, width: 10, height: 10, borderRadius: '50%', background: '#2563EB', border: '2px solid #fff', boxShadow: '0 0 0 1px #E2E8F0' }} />
              <div style={{ fontSize: 13, color: '#334155' }}>{l.what}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{l.who} · {l.time}</div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
