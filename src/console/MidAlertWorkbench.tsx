// ⑥ 预警工作台（使用域 · 列表）— 读 midAlerts.json 橘；策略 midStrategy.json 蓝；实时统计 灰
// 行点击跳转预警详情页（cr:mid-alert-detail），处置动作在详情页完成
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, StatCard, DataTable } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidAlerts, useMidSaveStatus } from './midStore';
import { LEVEL_META, type MidAlert } from './midData';

type Status = MidAlert['status'];
const STATUS_KIND: Record<Status, 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gray'> = {
  待处置: 'red', 核实中: 'amber', 处置中: 'blue', 已解除: 'green', 已升级: 'violet', 误报: 'gray',
};

export default function MidAlertWorkbench() {
  const alerts = useMidAlerts();
  const saveStatus = useMidSaveStatus();
  const nav = useNavigate();

  const [lvl, setLvl] = useState<string>('');
  const [status, setStatus] = useState<string>('');
  const [scene, setScene] = useState<string>('');

  const scenes = useMemo(() => Array.from(new Set(alerts.map((a) => a.scene))), [alerts]);
  const filtered = alerts.filter((a) =>
    (!lvl || a.level === lvl) && (!status || a.status === status) && (!scene || a.scene === scene),
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { 待处置: 0, 核实中: 0, 处置中: 0, 已解除: 0, 已升级: 0, 误报: 0 };
    alerts.forEach((a) => { c[a.status] = (c[a.status] ?? 0) + 1; });
    return c;
  }, [alerts]);

  const cols: Column[] = [
    { key: 'alert_id', label: '预警ID', type: 'text', width: '140px' },
    { key: 'cust_name', label: '客户', type: 'text', width: '90px' },
    { key: 'scene', label: '场景', type: 'text', width: '120px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'red', width: '80px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
  ];
  const rows: Row[] = filtered.map((a) => ({
    id: a.alert_id,
    alert_id: a.alert_id,
    cust_name: a.cust_name,
    scene: a.scene,
    level: { v: LEVEL_META[a.level].label, kind: LEVEL_META[a.level].badge },
    status: { v: a.status, kind: STATUS_KIND[a.status] },
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="预警工作台" crumb="零售信贷风控 / 贷中监控 / 预警处置" subtitle="预警队列 · 点击任意一条查看详情并处置"
        actions={<><Cfg label="策略配置" value="midStrategy.json" /><Sam label="预警样例" value={`${alerts.length} 条`} /><Cal label="实时统计" /></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        {(['待处置', '核实中', '处置中', '已解除', '已升级', '误报'] as Status[]).map((s) => (
          <StatCard key={s} label={s} value={String(counts[s])} accent={s === '待处置' ? 'rose' : s === '已解除' ? 'emerald' : 'brand'} />
        ))}
      </div>

      <Panel title="预警队列" desc={<span>筛选后共 <b>{filtered.length}</b> 条 · <Cal label="实时过滤" /></span>}
        actions={
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <Sel value={lvl} onChange={setLvl} opts={[{ v: '', l: '全部等级' }, ...['RED', 'YELLOW', 'OPPORTUNITY'].map((x) => ({ v: x, l: LEVEL_META[x].label }))]} />
            <Sel value={status} onChange={setStatus} opts={[{ v: '', l: '全部状态' }, ...(['待处置', '核实中', '处置中', '已解除', '已升级', '误报'] as Status[]).map((x) => ({ v: x, l: x }))]} />
            <Sel value={scene} onChange={setScene} opts={[{ v: '', l: '全部场景' }, ...scenes.map((x) => ({ v: x, l: x }))]} />
          </div>
        }>
        <DataTable columns={cols} rows={rows} empty="无匹配预警"
          clickableKey="alert_id"
          onCellClick={(r) => nav('/console/cr/mid-alert-detail?id=' + String(r.id))} />
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
