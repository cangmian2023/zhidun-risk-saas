// ⑦ 个体详情页（使用域）— 读客户样例 midCustomers.json 橘；打分/额度使用率实时计算 灰
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DetailHeader, Panel, StatCard, Badge, StatusTag, Button } from '../components/ui';
import { LineChart } from '../components/charts';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidCustomers, useMidAlerts, useMidDisposeTasks } from './midStore';
import { LEVEL_META, type MidCustomer } from './midData';

const STATUS_KIND: Record<string, 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gray'> = {
  待处置: 'red', 核实中: 'amber', 处置中: 'blue', 已解除: 'green', 已升级: 'violet', 误报: 'gray',
};

export default function MidCustDetail() {
  const [params] = useSearchParams();
  const custId = params.get('cust') ?? '';
  const customers = useMidCustomers();
  const alerts = useMidAlerts();
  const tasks = useMidDisposeTasks();
  const nav = useNavigate();

  const cust: MidCustomer | undefined = useMemo(
    () => customers.find((c) => c.custId === custId) ?? customers[0],
    [customers, custId],
  );

  // 实时计算（灰）：额度使用率
  const usage = cust ? (cust.creditLine ? (cust.loanBalance / cust.creditLine) * 100 : 0) : 0;

  const custAlerts = cust ? alerts.filter((a) => a.cust_id === cust.custId) : [];
  const custTasks = cust ? tasks.filter((t) => t.custId === cust.custId) : [];

  if (!cust) {
    return <div style={{ padding: 24 }}><PageShell header={<DetailHeader title="个体详情" crumb="零售信贷风控 / 贷中监控" backLabel="← 返回" onBack={() => nav(-1)} />} /></div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1100 }}>
      <PageShell header={<DetailHeader
        title={<span>{cust.name} <Sam label="客户样例" value="midCustomers.json" /></span>}
        crumb="零售信贷风控 / 贷中监控 / 个体详情"
        subtitle={`客户号 ${cust.custId} ｜ 产品 ${cust.product}`}
        backLabel="← 返回"
        onBack={() => nav(-1)}
        actions={<Button variant="secondary" size="sm" onClick={() => nav('/console/cr/mid-alert-workbench')}>前往预警工作台</Button>}
      />} />

      {/* 画像 + 关键指标 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="授信额度" value={`¥${cust.creditLine.toLocaleString()}`} accent="brand" />
        <StatCard label="在贷余额" value={`¥${cust.loanBalance.toLocaleString()}`} accent="violet" />
        <StatCard label="额度使用率" value={`${usage.toFixed(1)}%`} accent={usage > 80 ? 'rose' : 'emerald'} hint={<Cal label="实时计算" />} />
        <StatCard label="风险等级" value={cust.riskLevel} accent={cust.riskLevel === '高风险' ? 'rose' : cust.riskLevel === '中风险' ? 'amber' : 'emerald'} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Panel title="基础画像" desc={<span><Sam label="样例字段" /></span>}>
          <Profile c={cust} />
        </Panel>

        <Panel title="行为分趋势" desc={<span>近 6 个月行为分 vs 同客群均值 <Sam label="样例" /></span>}>
          {cust.scoreHistory.length ? (
            <LineChart
              labels={cust.scoreHistory.map((s) => s.month)}
              series={[
                { name: '行为分', color: '#2563EB', data: cust.scoreHistory.map((s) => s.score) },
                { name: '同客群均值', color: '#94A3B8', data: cust.scoreHistory.map((s) => s.cohortAvg) },
              ]}
              unit="分"
              height={240}
            />
          ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无评分历史</div>}
        </Panel>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Panel title={`预警时间线 (${custAlerts.length})`} desc={<span>该客户历史预警事件 <Sam label="样例" /></span>}>
          {custAlerts.length ? (
            <Timeline items={custAlerts.map((a) => ({
              time: a.alert_date, color: LEVEL_META[a.level].fill,
              title: `${LEVEL_META[a.level].label} · ${a.scene}`,
              sub: `命中「${a.rule_name}」 指标值 ${a.metric_value}/阈值 ${a.threshold}`,
              tag: <StatusTag kind={STATUS_KIND[a.status]}>{a.status}</StatusTag>,
            }))} />
          ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无预警记录</div>}
        </Panel>

        <Panel title={`处置记录 (${custTasks.length})`} desc={<span>关联处置工单 <Sam label="样例" /></span>}>
          {custTasks.length ? (
            <Timeline items={custTasks.map((t) => ({
              time: t.updatedAt, color: '#2563EB',
              title: `工单 ${t.id} · ${t.action}`,
              sub: `状态：${t.status} ｜ 分派 ${t.assignTo}`,
              tag: <StatusTag kind={STATUS_KIND[t.status]}>{t.status}</StatusTag>,
            }))} />
          ) : cust.disposes.length ? (
            <Timeline items={cust.disposes.map((d) => ({
              time: d.time, color: '#2563EB',
              title: `${d.action} · ${d.result}`,
              sub: d.note ? `备注：${d.note}` : `操作人：${d.operator}`,
              tag: <Badge kind="blue">{d.operator}</Badge>,
            }))} />
          ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无处置记录</div>}
        </Panel>
      </div>
    </div>
  );
}

function Profile({ c }: { c: MidCustomer }) {
  const m: [string, string][] = [
    ['客户号', c.custId], ['姓名', c.name], ['证件号', c.idCard],
    ['产品', c.product], ['贷款状态', c.loanStatus], ['风险等级', c.riskLevel],
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 16px', fontSize: 13 }}>
      {m.map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
          <span style={{ color: '#94A3B8' }}>{k}</span>
          <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

function Timeline({ items }: { items: { time: string; color: string; title: string; sub: string; tag: React.ReactNode }[] }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 18 }}>
      <div style={{ position: 'absolute', left: 5, top: 4, bottom: 4, width: 2, background: '#E2E8F0' }} />
      {items.map((it, i) => (
        <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
          <span style={{ position: 'absolute', left: -16, top: 4, width: 10, height: 10, borderRadius: '50%', background: it.color, border: '2px solid #fff', boxShadow: '0 0 0 1px #E2E8F0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{it.title}</span>
            {it.tag}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{it.sub}</div>
          <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 1 }}>{it.time}</div>
        </div>
      ))}
    </div>
  );
}
