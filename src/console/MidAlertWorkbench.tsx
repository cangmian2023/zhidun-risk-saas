// ⑥ 预警工作台（使用域）— 读 midAlerts.json 橘（样例）；关联策略样例 橘；实时统计 灰
// 行点击跳转预警详情页（cr:mid-alert-detail），处置动作在详情页完成
// domain: 'cr' | 'sc' 读零售信贷 midStore；'ep' 复用同一页面，数据切到企业风控 enterpriseData
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable, Modal, SingleSelect } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { PageShell } from './PageShell';
import { useMidAlerts, useMidSaveStatus, updateAlerts } from './midStore';
import { useEnterpriseData, updateEnterpriseData } from './enterpriseData';
import { LEVEL_META } from './midData';
import { useFlows } from './flowStore';
import FlowStateCell from './FlowStateCell';
import { usePageNav } from './pageNav';

type Domain = 'cr' | 'sc' | 'ep';

export default function MidAlertWorkbench({ domain = 'cr' }: { domain?: Domain }) {
  const midAlerts = useMidAlerts();
  const ent = useEnterpriseData();
  const alerts = domain === 'ep' ? ent.alerts : midAlerts;
  const saveStatus = useMidSaveStatus();
  useFlows(); // 订阅流程配置变更
  const nav = useNavigate();
  const { sub, goDetail } = usePageNav();

  const [lvl, setLvl] = useState<string>('');
  const [scene, setScene] = useState<string>('');
  const [type, setType] = useState<string>('');

  // 归一化：企业预警(EntAlert) ↔ 零售预警(midAlert) 字段对齐
  const norm = useMemo(() => alerts.map((a: any) => domain === 'ep'
    ? { id: a.id, name: a.entName, type: a.category, scene: '—', level: a.level, rule: a.ruleName, metric: '—', date: a.alert_date, flowKey: a.flowKey ?? '', flowState: a.flowState ?? '', flowStateAt: a.flowStateAt ?? '' }
    : { id: a.alert_id, name: a.cust_name, type: a.alert_type, scene: a.scene, level: a.level, rule: a.rule_name, metric: `${a.metric_value} / ${a.threshold}`, date: a.alert_date, flowKey: a.flowKey ?? '', flowState: a.flowState ?? '', flowStateAt: a.flowStateAt ?? '' }), [alerts, domain]);

  const scenes = useMemo(() => Array.from(new Set(norm.map((a) => a.scene))), [norm]);
  const types = useMemo(() => Array.from(new Set(norm.map((a) => a.type))), [norm]);
  const filtered = norm.filter((a) =>
    (!lvl || a.level === lvl) && (!scene || a.scene === scene) && (!type || a.type === type),
  );

  // 等级统计（红/黄/机会）
  const levelCounts = useMemo(() => {
    const c: Record<string, number> = { RED: 0, YELLOW: 0, OPPORTUNITY: 0 };
    norm.forEach((a) => { c[a.level] = (c[a.level] ?? 0) + 1; });
    return c;
  }, [norm]);

  // 预警类型分布统计
  const typeCounts = useMemo(() => {
    const c: Record<string, number> = {};
    norm.forEach((a) => { c[a.type] = (c[a.type] ?? 0) + 1; });
    return c;
  }, [norm]);

  const TYPE_KIND: Record<string, 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gray'> = {
    负债激增: 'red', 多头借贷: 'red', 逾期预警: 'red', 司法涉诉: 'red', 关联企业风险: 'red',
    设备异常: 'amber', 反欺诈命中: 'amber', 行为评分下降: 'amber', 还款能力不足: 'blue',
    回访失联: 'blue', 舆情负面: 'violet', 提额机会: 'green',
    经营异常: 'amber', 财务恶化: 'rose', 关联风险: 'red',
  };
  const cols: Column[] = [
    { key: 'alert_id', label: '预警ID', type: 'text', width: '130px' },
    { key: 'cust_name', label: domain === 'ep' ? '企业' : '客户', type: 'text', width: '90px' },
    { key: 'alert_type', label: '预警类型', type: 'badge', badgeKind: 'violet', width: '110px' },
    { key: 'scene', label: '触发场景', type: 'text', width: '110px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'red', width: '80px' },
    { key: 'rule_name', label: '命中规则', type: 'text', width: '200px' },
    { key: 'metric', label: '指标值/阈值', type: 'text', width: '100px' },
    { key: 'alert_date', label: '预警时间', type: 'text', width: '100px' },
    { key: 'flowState', label: '流程状态', fixed: 'right',  render: (r: Row) => (
      <FlowStateCell flowId={String(r.flowKey ?? '')} state={String(r.flowState ?? '')}
        matchObj={{ level: r.levelRaw ?? '', alert_type: r.alertTypeRaw ?? '', scene: r.scene ?? '' }}
        onChange={(s) => {
          if (domain === 'ep') {
            updateEnterpriseData((d) => ({ ...d, alerts: d.alerts.map((x) => x.id === String(r.id)
              ? { ...x, flowState: s, flowStateAt: new Date().toISOString().slice(0, 19).replace('T', ' ') } : x) }));
          } else {
            updateAlerts((list) => list.map((a) => a.alert_id === String(r.id)
              ? { ...a, flowState: s, flowStateAt: new Date().toISOString().slice(0, 19).replace('T', ' ') } : a));
          }
        }} />
    ) },
  ];
  const rows: Row[] = filtered.map((a) => ({
    id: a.id,
    alert_id: a.id,
    cust_name: a.name,
    alert_type: { v: a.type, kind: TYPE_KIND[a.type] ?? 'gray' },
    scene: a.scene,
    level: { v: LEVEL_META[a.level].label, kind: LEVEL_META[a.level].badge },
    levelRaw: a.level,        // 需求16：原始字段值（供匹配具体流程）
    alertTypeRaw: a.type,
    rule_name: a.rule,
    metric: a.metric,
    alert_date: a.date,
    flowKey: a.flowKey,
    flowState: a.flowState,
    flowStateAt: a.flowStateAt,
  }));

  const crumb = domain === 'ep'
    ? '企业风控 / 风险预警中心 / 预警处置工作台'
    : (sub === 'sc' ? '评分产品 / 工作台 / 预警工作台' : '零售信贷风控 / 贷中监控 / 预警工作台');
  const detailBase = domain === 'ep' ? '/console/ep/alert-workbench' : '/console/cr/mid-alert-detail';

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="预警工作台" crumb={crumb} subtitle="预警队列 · 点击任意一条查看详情并处置"
        actions={<></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="预警总数" value={String(alerts.length)} accent="brand" />
        <StatCard label="红灯预警" value={String(levelCounts.RED)} accent="rose" />
        <StatCard label="黄灯预警" value={String(levelCounts.YELLOW)} accent="amber" />
        <StatCard label="机会预警" value={String(levelCounts.OPPORTUNITY)} accent="emerald" />
      </div>

      <Panel title="预警队列" desc={<span>筛选后共 <b>{filtered.length}</b> 条 · </span>}
        actions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Sel value={lvl} onChange={setLvl} opts={[{ v: '', l: '全部等级' }, ...['RED', 'YELLOW', 'OPPORTUNITY'].map((x) => ({ v: x, l: LEVEL_META[x].label }))]} />
            <Sel value={type} onChange={setType} opts={[{ v: '', l: '全部类型' }, ...types.map((x) => ({ v: x, l: `${x}（${typeCounts[x] ?? 0}）` }))]} />
            <Sel value={scene} onChange={setScene} opts={[{ v: '', l: '全部场景' }, ...scenes.map((x) => ({ v: x, l: x }))]} />
          </div>
        }>
        <DataTable columns={cols} rows={rows} empty="无匹配预警"
          clickableKey={domain === 'ep' ? undefined : 'alert_id'}
          onCellClick={domain === 'ep' ? undefined : (r) => goDetail(detailBase + '?id=' + String(r.id))}
          actions={(r) => (
            <button type="button" onClick={() => goDetail(detailBase + '?id=' + String(r.id))}
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
    <SingleSelect label="选择" value={value} onChange={onChange} options={opts.map((o) => ({ value: o.v, label: o.l }))} />
  );
}
