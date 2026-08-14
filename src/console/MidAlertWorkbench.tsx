// ⑥ 预警工作台（使用域）— 读 midAlerts.json 橘（样例）；关联策略样例 橘；实时统计 灰
// 行点击跳转预警详情页（cr:mid-alert-detail），处置动作在详情页完成
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable, Modal } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidAlerts, useMidSaveStatus, updateAlerts } from './midStore';
import { LEVEL_META } from './midData';
import { useFlows } from './flowStore';
import FlowStateCell from './FlowStateCell';
// 统一流程绑定层：与贷前四页（进件审核/信息核验/信用风控/欺诈识别）共用同一套实现
import { useMinuteTick, renderCountdown, matchObjOf, flowIdOfRow, nowStamp, usePageFlow } from './flowBinding';
import { usePageNav } from './pageNav';

/* 本页流程匹配字段（需求16）：{ 流程配置字段名: 行数据键名 } */
const ALERT_MATCH_FIELDS = { level: 'levelRaw', alert_type: 'alertTypeRaw', scene: 'scene' };

export default function MidAlertWorkbench() {
  const alerts = useMidAlerts();
  const saveStatus = useMidSaveStatus();
  useFlows(); // 订阅流程配置变更
  const pageFlow = usePageFlow('/console/cr/mid-alert-workbench'); // 未配 flowKey 的行回落本页关联流程（键须与 bizFlows.pageRoutes 一致）
  const nav = useNavigate();
  const { sub, goDetail } = usePageNav();

  useMinuteTick(); // 需求14：时限倒计时每分钟刷新

  // 节点时限倒计时：统一实现（与贷前四页完全一致）
  const countdownOf = (r: Row): React.ReactNode =>
    renderCountdown({
      flowId: flowIdOfRow(r as any, pageFlow),
      flowState: String(r.flowState ?? ''),
      flowStateAt: String(r.flowStateAt ?? ''),
      matchObj: matchObjOf(r as any, ALERT_MATCH_FIELDS),
    });

  const [lvl, setLvl] = useState<string>('');
  const [scene, setScene] = useState<string>('');
  const [type, setType] = useState<string>('');

  const scenes = useMemo(() => Array.from(new Set(alerts.map((a) => a.scene))), [alerts]);
  const types = useMemo(() => Array.from(new Set(alerts.map((a) => a.alert_type))), [alerts]);
  const filtered = alerts.filter((a) =>
    (!lvl || a.level === lvl) && (!scene || a.scene === scene) && (!type || a.alert_type === type),
  );

  // 等级统计（红/黄/机会）
  const levelCounts = useMemo(() => {
    const c: Record<string, number> = { RED: 0, YELLOW: 0, OPPORTUNITY: 0 };
    alerts.forEach((a) => { c[a.level] = (c[a.level] ?? 0) + 1; });
    return c;
  }, [alerts]);

  // 预警类型分布统计
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    alerts.forEach((a) => { c[a.alert_type] = (c[a.alert_type] ?? 0) + 1; });
    return c;
  }, [alerts]);

  const cols: Column[] = [
    { key: 'alert_id', label: '预警ID', type: 'text', width: '130px' },
    { key: 'cust_name', label: '客户', type: 'text', width: '90px' },
    { key: 'alert_type', label: '预警类型', type: 'badge', badgeKind: 'violet', width: '110px' },
    { key: 'scene', label: '触发场景', type: 'text', width: '110px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'red', width: '80px' },
    { key: 'rule_name', label: '命中规则', type: 'text', width: '200px' },
    { key: 'metric', label: '指标值/阈值', type: 'text', width: '100px' },
    { key: 'alert_date', label: '预警时间', type: 'text', width: '100px' },
    { key: 'countdown', label: '时限倒计时', render: (r: Row) => countdownOf(r) },
    { key: 'flowState', label: '流程状态', fixed: 'right', tag: { kind: 'sample', value: 'midAlerts.json.flowState' }, render: (r: Row) => (
      <FlowStateCell flowId={String(r.flowKey ?? '')} state={String(r.flowState ?? '')}
        matchObj={{ level: r.levelRaw ?? '', alert_type: r.alertTypeRaw ?? '', scene: r.scene ?? '' }}
        onChange={(s) => updateAlerts((list) => list.map((a) => a.alert_id === String(r.id)
          ? { ...a, flowState: s, flowStateAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
          : a))} />
    ) },
  ];
  const TYPE_KIND: Record<string, 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gray'> = {
    负债激增: 'red', 多头借贷: 'red', 逾期预警: 'red', 司法涉诉: 'red', 关联企业风险: 'red',
    设备异常: 'amber', 反欺诈命中: 'amber', 行为评分下降: 'amber', 还款能力不足: 'blue',
    回访失联: 'blue', 舆情负面: 'violet', 提额机会: 'green',
  };
  const rows: Row[] = filtered.map((a) => ({
    id: a.alert_id,
    alert_id: a.alert_id,
    cust_name: a.cust_name,
    alert_type: { v: a.alert_type, kind: TYPE_KIND[a.alert_type] ?? 'gray' },
    scene: a.scene,
    level: { v: LEVEL_META[a.level].label, kind: LEVEL_META[a.level].badge },
    levelRaw: a.level,        // 需求16：原始字段值（供匹配具体流程）
    alertTypeRaw: a.alert_type,
    rule_name: a.rule_name,
    metric: `${a.metric_value} / ${a.threshold}`,
    alert_date: a.alert_date,
    flowKey: a.flowKey ?? '',
    flowState: a.flowState ?? '',
    flowStateAt: a.flowStateAt ?? '',
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="预警工作台" crumb={sub === 'sc' ? '评分产品 / 工作台 / 预警工作台' : '零售信贷风控 / 贷中监控 / 预警工作台'} subtitle="预警队列 · 点击任意一条查看详情并处置"
        actions={<><Sam label="策略配置" value="midStrategy.json" /><Sam label="预警样例" value={`${alerts.length} 条`} /><Cal label="实时统计" /></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="预警总数" value={String(alerts.length)} accent="brand" />
        <StatCard label="红灯预警" value={String(levelCounts.RED)} accent="rose" />
        <StatCard label="黄灯预警" value={String(levelCounts.YELLOW)} accent="amber" />
        <StatCard label="机会预警" value={String(levelCounts.OPPORTUNITY)} accent="emerald" />
      </div>

      <Panel title="预警队列" desc={<span>筛选后共 <b>{filtered.length}</b> 条 · <Cal label="实时过滤" /></span>}
        actions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Sel value={lvl} onChange={setLvl} opts={[{ v: '', l: '全部等级' }, ...['RED', 'YELLOW', 'OPPORTUNITY'].map((x) => ({ v: x, l: LEVEL_META[x].label }))]} />
            <Sel value={type} onChange={setType} opts={[{ v: '', l: '全部类型' }, ...types.map((x) => ({ v: x, l: `${x}（${typeCounts[x] ?? 0}）` }))]} />
            <Sel value={scene} onChange={setScene} opts={[{ v: '', l: '全部场景' }, ...scenes.map((x) => ({ v: x, l: x }))]} />
          </div>
        }>
        <DataTable columns={cols} rows={rows} empty="无匹配预警"
          clickableKey="alert_id"
          onCellClick={(r) => goDetail('/console/cr/mid-alert-detail?id=' + String(r.id))}
          actions={(r) => (
            <button type="button" onClick={() => goDetail('/console/cr/mid-alert-detail?id=' + String(r.id))}
              style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看</button>
          )} />
      </Panel>

      <Modal open={saveStatus === 'error'} onClose={() => {}} title="保存提示">
        <p style={{ fontSize: 13, color: '#B91C1C' }}>本地 JSON 写入失败，请检查 /api/save-mid 端点与文件权限。</p>
      </Modal>
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

