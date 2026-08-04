// ⑫ 处置工单页（贷中监控 · 使用域）— 工单跟进 / 回填 / 审批 / 状态机
// 工单数据=样例 JSON（橘）｜ 处置动作/对接=读监控策略配置（蓝）｜ 状态流转=实时（灰）
import { useState } from 'react';
import { PageHeader, Panel, DataTable, Button } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { useMidDisposeTasks, updateDisposeTasks, useMidStrategy } from './midStore';
import { Cfg, Sam, Cal } from './SourceTag';
import type { MidDisposeTask } from './midData';

const STATUS_COLOR: Record<string, string> = {
  待处置: '#D97706', 核实中: '#2563EB', 处置中: '#7C3AED', 已解除: '#16A34A', 已升级: '#DC2626', 误报: '#64748B',
};

export default function MidDisposeWorkbench() {
  const tasks = useMidDisposeTasks();
  const strategy = useMidStrategy();
  const [filter, setFilter] = useState<string>('');
  const [detail, setDetail] = useState<MidDisposeTask | null>(null);
  const [note, setNote] = useState('');
  const [approve, setApprove] = useState<'approve' | 'reject' | null>(null);

  const patch = (t: MidDisposeTask, p: Partial<MidDisposeTask>) => {
    updateDisposeTasks((l) => l.map((x) => (x.id === t.id ? { ...x, ...p, updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16) } : x)));
  };
  const addLog = (t: MidDisposeTask, who: string, what: string) => {
    updateDisposeTasks((l) => l.map((x) => x.id === t.id
      ? { ...x, logs: [...x.logs, { time: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16), who, what }] }
      : x));
  };

  const statusFlow = (t: MidDisposeTask): { label: string; run: () => void }[] => {
    const actions: { label: string; run: () => void }[] = [];
    if (t.status === '待处置') actions.push({ label: '开始处理', run: () => { patch(t, { status: '核实中' }); addLog(t, '风控专员（演示）', '开始处理，进入核实'); } });
    if (t.status === '核实中') {
      actions.push({
        label: t.needApprove ? '核实完成·提交审批' : '核实完成·执行处置',
        run: () => {
          patch(t, { status: '处置中' });
          addLog(t, '风控专员（演示）', t.needApprove ? '核实完成，提交审批' : '核实完成，直接执行处置');
        },
      });
      actions.push({ label: '标记误报', run: () => { patch(t, { status: '误报' }); addLog(t, '风控专员（演示）', '核实为误报，工单关闭'); } });
    }
    if (t.status === '处置中') {
      actions.push({
        label: '回填结果·解除',
        run: () => { patch(t, { status: '已解除' }); addLog(t, '处置人（演示）', '处置完成，预警解除'); },
      });
      actions.push({
        label: '风险恶化·升级',
        run: () => { patch(t, { status: '已升级' }); addLog(t, '系统', '风险持续恶化，工单升级'); },
      });
    }
    return actions;
  };

  const cols: Column[] = [
    { key: 'id', label: '工单ID' }, { key: 'custName', label: '客户' },
    { key: 'action', label: '处置动作' }, { key: 'targetSystem', label: '对接系统' },
    { key: 'approve', label: '审批' }, { key: 'assignTo', label: '分派' },
    { key: 'status', label: '状态', type: 'badge' }, { key: 'updatedAt', label: '更新时间' },
  ];
  const rows: Row[] = tasks
    .filter((t) => !filter || t.status === filter)
    .map((t) => ({
      id: t.id, custName: t.custName, action: t.action, targetSystem: t.targetSystem,
      approve: t.needApprove ? '需审批' : '—', assignTo: t.assignTo, status: t.status, updatedAt: t.updatedAt,
    }));

  const openDetail = (id: string) => {
    const t = tasks.find((x) => x.id === id);
    if (t) { setDetail(t); setNote(''); setApprove(null); }
  };

  const strategyOf = (t: MidDisposeTask) => strategy.disposes.find((d) => d.action === t.action);

  return (
    <div style={{ padding: 24, maxWidth: 1280 }}>
      <PageHeader
        title="处置工单"
        crumb="零售信贷风控 / 贷中监控 / 处置工单"
        subtitle="工单跟进、处置回填、审批流转（工单数据来自本地样例 JSON，动作/对接来自监控策略配置）"
        actions={<>
          <Sam label="工单样例 JSON" value={`${tasks.length} 单`} />
          <Cfg label="处置策略" value={`${strategy.disposes.length} 条`} />
        </>}
      />

      <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={sel}>
          <option value="">全部状态</option>
          {Object.keys(STATUS_COLOR).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>
          状态机：待处置 → 核实中 → 处置中 → 已解除 / 已升级 / 误报 <Cal label="实时流转" />
        </span>
      </div>

      <Panel title="工单列表" desc="点击行打开工单处理" note="处置动作与对接系统来自「监控策略配置 · 处置策略」">
        <DataTable columns={cols} rows={rows} clickableKey="id" onCellClick={(r) => openDetail(String(r.id))} />
      </Panel>

      {detail && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,.35)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setDetail(null)}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 20, width: 640, maxHeight: '85vh', overflow: 'auto', boxShadow: '0 8px 30px rgba(0,0,0,.15)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>
                工单 {detail.id} <span style={{ color: STATUS_COLOR[detail.status], fontWeight: 600 }}>{detail.status}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDetail(null)}>关闭</Button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13, background: '#F8FAFC', borderRadius: 8, padding: '10px 12px', marginBottom: 12 }}>
              <div><span style={{ color: '#64748B' }}>客户：</span><b>{detail.custName}</b>（<a href={`/console/cr/mid-cust-detail?custId=${detail.custId}&from=${encodeURIComponent('处置工单/' + detail.id)}`} style={{ color: '#2563EB' }}>查看个体详情</a>）</div>
              <div><span style={{ color: '#64748B' }}>预警：</span>{detail.alertId}</div>
              <div><span style={{ color: '#64748B' }}>处置动作：</span><b>{detail.action}</b> <Cfg label="对接" value={detail.targetSystem} /></div>
              <div><span style={{ color: '#64748B' }}>分派：</span>{detail.assignTo} · {detail.operator}</div>
              <div><span style={{ color: '#64748B' }}>审批：</span>{detail.needApprove ? '需主管审批' : '无需审批'}</div>
              <div><span style={{ color: '#64748B' }}>更新时间：</span>{detail.updatedAt}</div>
            </div>

            {strategyOf(detail) && (
              <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>
                策略配置：{strategyOf(detail)!.name}（触发 {strategyOf(detail)!.triggerLevel}）{strategyOf(detail)!.needNotify ? '· 需触达客户' : ''}
              </div>
            )}

            {/* 状态流转操作 */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {statusFlow(detail).map((a) => (
                <Button key={a.label} size="sm" variant={a.label.includes('误报') || a.label.includes('升级') ? 'secondary' : 'primary'} onClick={() => a.run()}>
                  {a.label}
                </Button>
              ))}
              {detail.needApprove && detail.status === '处置中' && approve === null && (
                <>
                  <Button size="sm" onClick={() => setApprove('approve')}>主管审批·通过</Button>
                  <Button size="sm" variant="secondary" onClick={() => setApprove('reject')}>主管审批·驳回</Button>
                </>
              )}
            </div>

            {approve && (
              <div style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginBottom: 12, fontSize: 13 }}>
                <div style={{ marginBottom: 6 }}><Cal label="模拟审批" value={approve === 'approve' ? '通过 → 对接核心信贷系统执行成功' : '驳回 → 退回处置中'} /></div>
                {approve === 'approve' ? (
                  <Button size="sm" onClick={() => { addLog(detail, '风控主管（演示）', '审批通过，对接' + detail.targetSystem + '执行成功'); patch(detail, { status: '已解除' }); setApprove(null); }}>确认执行</Button>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => { addLog(detail, '风控主管（演示）', '审批驳回，退回'); setApprove(null); }}>确认驳回</Button>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="处置结果 / 备注（回填）" style={{ ...inp, flex: 1 }} />
              <Button size="sm" variant="secondary" onClick={() => {
                if (!note.trim()) { alert('请填写备注'); return; }
                addLog(detail, '处置人（演示）', '回填：' + note);
                setNote('');
              }}>回填备注</Button>
            </div>

            <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>操作日志 <Sam label="样例 + 本次操作" /></div>
            <div style={{ display: 'grid', gap: 6 }}>
              {detail.logs.map((l, i) => (
                <div key={i} style={{ fontSize: 12, color: '#475569', background: '#F8FAFC', borderRadius: 6, padding: '6px 10px' }}>
                  <span style={{ color: '#94A3B8', fontFamily: 'monospace' }}>{l.time}</span> · <b>{l.who}</b>：{l.what}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const sel: React.CSSProperties = {
  padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff', color: '#0F172A',
};
const inp: React.CSSProperties = {
  padding: '7px 10px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 13,
  outline: 'none', color: '#0F172A', background: '#fff', boxSizing: 'border-box',
};
