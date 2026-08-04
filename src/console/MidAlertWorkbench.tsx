// ⑩ 预警工作台（贷中监控 · 使用域）— 红黄灯预警任务队列
// 预警数据=样例 JSON（橘）｜ 处置建议/规则=读监控策略配置（蓝）｜ 统计/推送模拟=实时（灰）
import { useState } from 'react';
import { PageHeader, Panel, DataTable, Button, Modal } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { useMidDataSources, useMidStrategy, useMidDisposeTasks } from './midStore';
import { Cfg, Sam, Cal } from './SourceTag';
import type { AlertLevel } from './midData';

export default function MidAlertWorkbench() {
  const dataSources = useMidDataSources();
  const strategy = useMidStrategy();
  const disposeTasks = useMidDisposeTasks();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [showPush, setShowPush] = useState(false);
  const [pushed, setPushed] = useState<string | null>(null);

  const ds = dataSources.find((d) => d.id === 'ds_alert');
  const alerts = ds?.rows ?? [];

  const filtered = alerts.filter((r) => {
    if (levelFilter && r.level !== levelFilter) return false;
    if (statusFilter) {
      const t = disposeTasks.find((x) => x.alertId === r.alert_id);
      if ((t?.status ?? '待处置') !== statusFilter) return false;
    }
    return true;
  });

  const redCnt = alerts.filter((r) => r.level === 'RED').length;
  const yellowCnt = alerts.filter((r) => r.level === 'YELLOW').length;
  const pendingCnt = alerts.filter((r) => !disposeTasks.some((t) => t.alertId === r.alert_id) || disposeTasks.some((t) => t.alertId === r.alert_id && (t.status === '待处置' || t.status === '核实中' || t.status === '处置中'))).length;

  const suggestAction = (level: unknown): string => {
    const d = strategy.disposes.find((x) => x.triggerLevel === (level as AlertLevel));
    return d ? `${d.action} → ${d.targetSystem}${d.needApprove ? '（需审批）' : ''}` : '—';
  };

  const cols: Column[] = [
    { key: 'alert_id', label: '预警ID' },
    { key: 'cust_name', label: '客户' },
    { key: 'level', label: '等级', type: 'badge' },
    { key: 'scene', label: '场景' },
    { key: 'rule_name', label: '命中规则' },
    { key: 'metric_value', label: '指标值/阈值' },
    { key: 'alert_date', label: '预警时间' },
    { key: 'suggest', label: '建议处置' },
    { key: 'status', label: '工单状态', type: 'badge' },
  ];
  const rows: Row[] = filtered.map((r, i) => {
    const t = disposeTasks.find((x) => x.alertId === r.alert_id);
    return {
      id: String(r.alert_id ?? `a${i}`),
      alert_id: String(r.alert_id),
      cust_name: String(r.cust_name),
      level: String(r.level),
      scene: String(r.scene),
      rule_name: String(r.rule_name),
      metric_value: `${r.metric_value} / ${r.threshold}`,
      alert_date: String(r.alert_date),
      suggest: suggestAction(r.level),
      status: t?.status ?? '待处置',
    };
  });

  const exportCsv = () => {
    const head = '预警ID,客户,等级,场景,命中规则,指标值/阈值,预警时间\n';
    const body = filtered.map((r) => [r.alert_id, r.cust_name, r.level, r.scene, r.rule_name, `${r.metric_value}/${r.threshold}`, r.alert_date].join(',')).join('\n');
    const blob = new Blob([head + body], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `预警清单_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div style={{ padding: 24, maxWidth: 1280 }}>
      <PageHeader
        title="预警工作台"
        crumb="零售信贷风控 / 贷中监控 / 预警工作台"
        subtitle="红黄灯预警任务队列：逐条查看、核实、发起处置（预警数据来自本地样例 JSON）"
        actions={<>
          <Button variant="secondary" size="sm" onClick={() => setShowPush(true)}>推送模拟</Button>
          <Button size="sm" onClick={exportCsv}>导出 CSV</Button>
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginTop: 14 }}>
        <div style={{ border: '1px solid #FEE2E2', borderRadius: 10, background: '#FEF2F2', padding: '10px 14px' }}>
          <div style={{ fontSize: 12, color: '#991B1B' }}>今日红灯 <Cal label="实时统计" /></div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#DC2626' }}>{redCnt}</div>
        </div>
        <div style={{ border: '1px solid #FEF3C7', borderRadius: 10, background: '#FFFBEB', padding: '10px 14px' }}>
          <div style={{ fontSize: 12, color: '#92400E' }}>今日黄灯 <Cal label="实时统计" /></div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#D97706' }}>{yellowCnt}</div>
        </div>
        <div style={{ border: '1px solid #DBEAFE', borderRadius: 10, background: '#EFF6FF', padding: '10px 14px' }}>
          <div style={{ fontSize: 12, color: '#1E40AF' }}>待处置预警 <Cal label="实时统计" /></div>
          <div style={{ fontSize: 22, fontWeight: 600, color: '#2563EB' }}>{pendingCnt}</div>
        </div>
      </div>

      <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
        <select value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)} style={sel}>
          <option value="">全部等级</option>
          <option value="RED">红灯</option><option value="YELLOW">黄灯</option><option value="OPPORTUNITY">机会信号</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={sel}>
          <option value="">全部工单状态</option>
          <option value="待处置">待处置</option><option value="核实中">核实中</option><option value="处置中">处置中</option>
          <option value="已解除">已解除</option><option value="已升级">已升级</option><option value="误报">误报</option>
        </select>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>
          <Sam label="预警样例数据" /> <Cfg label="处置策略" value={`${strategy.disposes.length} 条`} />
        </span>
      </div>

      <Panel
        title="预警列表"
        desc="点击行进入个体详情查看规则还原与处置；「建议处置」来自监控策略配置"
        note="命中规则明细随预警事件快照保存（样例），可在个体详情页还原"
      >
        <DataTable
          columns={cols}
          rows={rows}
          clickableKey="alert_id"
          onCellClick={(r) => {
            const custId = String((alerts.find((a) => String(a.alert_id) === r.alert_id) ?? {}).cust_id ?? '');
            if (custId) window.location.href = `/console/cr/mid-cust-detail?custId=${custId}&from=${encodeURIComponent('预警工作台/' + r.scene)}`;
          }}
        />
      </Panel>

      <Modal open={showPush} onClose={() => setShowPush(false)} title="推送模拟（多方式获取结果）" footer={<Button onClick={() => setShowPush(false)}>关闭</Button>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 13, color: '#475569' }}>
            按监控任务配置的输出方式模拟推送 <Cfg label="任务输出配置" />
          </div>
          {strategy.tasks.map((t) => (
            <div key={t.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px' }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{t.name} <Cfg label="输出方式" value={t.output} /></div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>
                客群：{t.crowd} · 频次：{t.frequency} · 关联指标：{t.metricIds.length} 个
              </div>
              <Button size="sm" variant="secondary" style={{ marginTop: 8 }} onClick={() => setPushed(`${t.name} · ${new Date().toLocaleTimeString()} 推送成功（模拟）`)}>
                模拟推送
              </Button>
              {pushed && pushed.startsWith(t.name) && <div style={{ marginTop: 6, fontSize: 12 }}><Cal label="推送结果" value={pushed.replace(t.name + ' · ', '')} /></div>}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}

const sel: React.CSSProperties = {
  padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff', color: '#0F172A',
};
