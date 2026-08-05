// 预警详情（使用域）— 读 midAlerts.json 橘；策略配置 midStrategy.json 蓝；实时统计 灰
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, Badge, StatusTag } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidStrategy, useMidAlerts, useMidDisposeTasks, updateAlerts, updateDisposeTasks, midNewId } from './midStore';
import { LEVEL_META, type MidAlert } from './midData';

type Status = MidAlert['status'];
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

export default function MidAlertDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const strategy = useMidStrategy();
  const alerts = useMidAlerts();
  const disposeTasks = useMidDisposeTasks();
  const nav = useNavigate();
  const [note, setNote] = useState('');

  const a = useMemo(() => alerts.find((x) => x.alert_id === id) ?? null, [alerts, id]);

  if (!a) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell title="预警详情" crumb="贷中监控 / 预警处置" actions={<Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>} />
        <div style={{ padding: 24, color: '#94A3B8', fontSize: 13 }}>未找到该预警（{id}）。</div>
      </div>
    );
  }

  const disposes = strategy.disposes.filter((d) => d.triggerLevel === a.level);
  const linkedTask = disposeTasks.find((t) => t.alertId === a.alert_id);

  const advance = (to: Status, extra?: string) => {
    const who = '风控专员-当前';
    updateAlerts((list) => list.map((x) => (x.alert_id === a.alert_id ? { ...x, status: to } : x)));
    if (to === '处置中') {
      const disp = strategy.disposes.find((d) => d.triggerLevel === a.level);
      updateDisposeTasks((list) => list.some((t) => t.alertId === a.alert_id)
        ? list
        : [...list, {
            id: midNewId('DP'), alertId: a.alert_id, custId: a.cust_id, custName: a.cust_name,
            action: disp?.action ?? '关注', targetSystem: disp?.targetSystem ?? '工单系统',
            needApprove: disp?.needApprove ?? false, assignTo: disp?.assignTo ?? '客户经理',
            status: '待处置', operator: who, updatedAt: now(),
            logs: [{ time: now(), who, what: extra ? `发起处置：${extra}` : `按处置策略「${disp?.name ?? '默认'}」发起处置` }],
          }]);
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 1080 }}>
      <PageShell title={`预警详情 · ${a.alert_id}`} crumb="贷中监控 / 预警处置"
        subtitle={a.cust_name}
        actions={<>
          <Cfg label="策略配置" value="midStrategy.json" />
          <Sam label="预警样例" value={`${alerts.length} 条`} />
          <Cal label="实时统计" />
          <Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回队列</Button>
        </>} />

      <Panel title="预警信息" desc={a.scene}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 16px', fontSize: 13 }}>
          {([
            ['客户', a.cust_name], ['场景', a.scene], ['等级', LEVEL_META[a.level].label],
            ['日期', a.alert_date], ['命中规则', a.rule_name], ['指标值', String(a.metric_value)],
            ['阈值', String(a.threshold)], ['状态', a.status],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
              <span style={{ color: '#94A3B8' }}>{k}</span>
              <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
          <div style={{ gridColumn: 'span 2' }}>
            <Badge kind={LEVEL_META[a.level].badge}>{LEVEL_META[a.level].label}</Badge>{' '}
            <StatusTag kind={STATUS_KIND[a.status]}>{a.status}</StatusTag>
          </div>
        </div>
        <div style={{ marginTop: 10 }}>
          <Button size="sm" variant="ghost" onClick={() => nav(`/console/cr/mid-cust-detail?cust=${a.cust_id}`)}>查看个体详情 →</Button>
        </div>
      </Panel>

      <Panel title="建议处置策略" desc={<span><Cfg label="读取" value="midStrategy.json" /> 按命中等级匹配</span>}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {disposes.length ? disposes.map((d) => (
            <span key={d.id} className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600">
              {d.action} · 派 {d.assignTo}{d.needApprove ? ' · 需审批' : ''}
            </span>
          )) : <span style={{ fontSize: 12, color: '#94A3B8' }}>无匹配处置策略</span>}
        </div>
      </Panel>

      <Panel title="处置操作" desc="按状态流转推进闭环">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="处置备注（可选）" style={{ flex: 1, minWidth: 160, padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12 }} />
          {STATUS_FLOW[a.status]?.map((to) => (
            <Button key={to} size="sm" variant={to === '误报' ? 'secondary' : 'primary'} onClick={() => { advance(to, note); setNote(''); }}>
              {a.status === '待处置' && to === '核实中' ? '开始核实' : to === '处置中' ? '发起处置' : to === '误报' ? '标记误报' : to === '已解除' ? '解除预警' : to === '已升级' ? '升级工单' : to}
            </Button>
          ))}
          {!STATUS_FLOW[a.status] && <span style={{ fontSize: 12, color: '#16A34A' }}>✓ 该预警已闭环（{a.status}）</span>}
        </div>
        <div style={{ marginTop: 10, fontSize: 11, color: '#94A3B8' }}>
          <Cal label="实时" /> 指标值 {a.metric_value} / 阈值 {a.threshold}
          {linkedTask && ' ｜ 已生成处置工单 ' + linkedTask.id}
        </div>
        {linkedTask && (
          <div style={{ marginTop: 8 }}>
            <Button size="sm" variant="ghost" onClick={() => nav('/console/cr/mid-dispose-detail?id=' + linkedTask.id)}>查看关联工单 →</Button>
          </div>
        )}
      </Panel>
    </div>
  );
}
