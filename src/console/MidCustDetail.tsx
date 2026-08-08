// ⑦ 个体详情页（使用域 · 需求19/20 重构）— 读客户样例 midCustomers.json 橘；打分/额度使用率实时计算 灰
// 需求19：返回按钮回「预警详情」来源页（URL 带 from=alert&id= 时回预警详情，否则回预警队列）；删除「前往预警工作台」按钮
// 需求20：单客 360 档案——画像 / 关键指标 / 行为分趋势 / 关联图谱 / 风险维度雷达 / 预警时间线 / 处置记录
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DetailHeader, Panel, StatCard, Badge, StatusTag } from '../components/ui';
import { LineChart, BarChart, DonutChart } from '../components/charts';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidCustomers, useMidAlerts, useMidDisposeTasks } from './midStore';
import { LEVEL_META, type MidCustomer, type CustRelationNode } from './midData';

const STATUS_KIND: Record<string, 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gray'> = {
  待处置: 'red', 核实中: 'amber', 处置中: 'blue', 已解除: 'green', 已升级: 'violet', 误报: 'gray',
};
const REL_COLOR: Record<CustRelationNode['type'], string> = {
  company: '#2563EB', person: '#D97706', device: '#7C3AED', contact: '#059669',
};
const REL_LABEL: Record<CustRelationNode['type'], string> = {
  company: '企业', person: '个人', device: '设备', contact: '联系人',
};

export default function MidCustDetail() {
  const [params] = useSearchParams();
  const custId = params.get('cust') ?? '';
  const fromAlertId = params.get('id') ?? '';   // 需求19：来源预警 ID
  const customers = useMidCustomers();
  const alerts = useMidAlerts();
  const tasks = useMidDisposeTasks();
  const nav = useNavigate();

  const cust: MidCustomer | undefined = useMemo(
    () => customers.find((c) => c.custId === custId) ?? customers[0],
    [customers, custId],
  );

  // 需求19：返回按钮——从预警详情进入则回预警详情，否则回预警队列
  const backTo = () => {
    if (fromAlertId) nav('/console/cr/mid-alert-detail?id=' + fromAlertId);
    else nav('/console/cr/mid-alert-workbench');
  };

  // 实时计算（灰）：额度使用率
  const usage = cust ? (cust.creditLine ? (cust.loanBalance / cust.creditLine) * 100 : 0) : 0;

  const custAlerts = cust ? alerts.filter((a) => a.cust_id === cust.custId) : [];
  const custTasks = cust ? tasks.filter((t) => t.custId === cust.custId) : [];

  if (!cust) {
    return <div style={{ padding: 24 }}><PageShell header={<DetailHeader title="个体详情" crumb="零售信贷风控 / 贷中监控" backLabel="← 返回" onBack={backTo} />} /></div>;
  }

  return (
    <div style={{ padding: 24, maxWidth: 1160 }}>
      <PageShell header={<DetailHeader
        title={<span>{cust.name} <Sam label="客户样例" value="midCustomers.json" /></span>}
        crumb="零售信贷风控 / 贷中监控 / 单客视图"
        subtitle={`客户号 ${cust.custId} ｜ 产品 ${cust.product} ｜ ${cust.riskLevel}`}
        backLabel="← 返回"
        onBack={backTo}
        actions={<>
          <Badge kind={cust.riskLevel === '高风险' ? 'red' : cust.riskLevel === '中风险' ? 'amber' : 'green'}>{cust.riskLevel}</Badge>
          <Cal label="实时统计" />
        </>}
      />} />

      {/* 画像 + 关键指标 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="授信额度" value={`¥${cust.creditLine.toLocaleString()}`} accent="brand" />
        <StatCard label="在贷余额" value={`¥${cust.loanBalance.toLocaleString()}`} accent="violet" />
        <StatCard label="额度使用率" value={`${usage.toFixed(1)}%`} accent={usage > 80 ? 'rose' : 'emerald'} hint={<Cal label="实时计算" />} />
        <StatCard label="贷款状态" value={cust.loanStatus} accent={cust.loanStatus === '在贷' ? 'blue' : 'gray'} />
      </div>

      {/* 第一行：基础画像 + 行为分趋势 */}
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
              height={220}
            />
          ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无评分历史</div>}
        </Panel>
      </div>

      {/* 需求20：第二行——关联图谱 + 风险维度 */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Panel title="关联图谱" desc={<span>客户为中心的关系网络 <Sam label="样例" /> 实体风险标记</span>}>
          <RelationGraph cust={cust} />
        </Panel>

        <Panel title="风险维度画像" desc={<span>六维风险评分（0-100，越高越危险）<Cal label="样例+实时" /></span>}>
          <RiskDims dims={cust.riskDims ?? []} />
        </Panel>
      </div>

      {/* 第三行：预警时间线 + 处置记录 */}
      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
        <Panel title={`预警时间线 (${custAlerts.length})`} desc={<span>该客户历史预警事件 <Sam label="样例" /></span>}>
          {custAlerts.length ? (
            <Timeline items={custAlerts.map((a) => ({
              time: a.alert_date, color: LEVEL_META[a.level].fill,
              title: `${LEVEL_META[a.level].label} · ${a.scene}`,
              sub: `命中「${a.rule_name}」 指标值 ${a.metric_value}/阈值 ${a.threshold}`,
              tag: <StatusTag kind={STATUS_KIND[a.status]}>{a.status}</StatusTag>,
            }))} />
          ) : cust.alerts.length ? (
            <Timeline items={cust.alerts.map((a) => ({
              time: a.time, color: LEVEL_META[a.level]?.fill ?? '#94A3B8',
              title: `${LEVEL_META[a.level]?.label ?? a.level} · ${a.scene}`,
              sub: `命中「${a.ruleName}」 指标值 ${a.metricValue}/阈值 ${a.threshold}`,
              tag: <StatusTag kind={STATUS_KIND[a.status]}>{a.status}</StatusTag>,
            }))} />
          ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无预警记录</div>}
        </Panel>

        <Panel title={`处置记录 (${custTasks.length + cust.disposes.length})`} desc={<span>处置工单 + 历史处置 <Sam label="样例" /></span>}>
          {custTasks.length || cust.disposes.length ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {custTasks.map((t) => (
                <div key={t.id} style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', background: '#F8FAFC' }}>
                  <span style={{ fontWeight: 600, color: '#1D4ED8' }}>{t.id}</span>
                  <span style={{ color: '#334155', flex: 1 }}>{t.action} · {t.targetSystem}</span>
                  <StatusTag kind={STATUS_KIND[t.status]}>{t.status}</StatusTag>
                </div>
              ))}
              {cust.disposes.map((d, i) => (
                <div key={'d' + i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px' }}>
                  <span style={{ fontWeight: 600, color: '#7C3AED', whiteSpace: 'nowrap' }}>{d.time}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ color: '#334155' }}>{d.action} · {d.result}</div>
                    <div style={{ color: '#94A3B8', marginTop: 2 }}>操作人：{d.operator}{d.note ? ` ｜ ${d.note}` : ''}</div>
                  </div>
                </div>
              ))}
            </div>
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
    ['授信额度', `¥${c.creditLine.toLocaleString()}`], ['在贷余额', `¥${c.loanBalance.toLocaleString()}`],
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

/* 需求20：关联图谱（SVG 手绘——客户居中，关联实体环绕，连线标关系，高危实体红框） */
function RelationGraph({ cust }: { cust: MidCustomer }) {
  const rels = cust.relations ?? [];
  const W = 560, H = 260, CX = W / 2, CY = H / 2;
  const R = 92;
  if (!rels.length) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无关联实体</div>;
  const pts = rels.map((r, i) => {
    const ang = (Math.PI * 2 * i) / rels.length - Math.PI / 2;
    return { r, x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang) };
  });
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }}>
        {pts.map(({ r, x, y }) => (
          <g key={r.id}>
            <line x1={CX} y1={CY} x2={x} y2={y} stroke={r.risk === '高危' ? '#DC2626' : '#CBD5E1'} strokeWidth={r.risk ? 1.6 : 1} strokeDasharray={r.risk ? '4 2' : undefined} />
          </g>
        ))}
        {/* 客户中心节点 */}
        <circle cx={CX} cy={CY} r={34} fill="#2563EB" />
        <text x={CX} y={CY - 4} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{cust.name}</text>
        <text x={CX} y={CY + 12} textAnchor="middle" fontSize="10" fill="#DBEAFE">本人</text>
        {/* 关联实体 */}
        {pts.map(({ r, x, y }) => {
          const c = REL_COLOR[r.type];
          return (
            <g key={r.id}>
              <circle cx={x} cy={y} r={r.type === 'company' ? 24 : 19} fill={c} fillOpacity={r.risk ? 0.16 : 0.1} stroke={r.risk === '高危' ? '#DC2626' : c} strokeWidth={r.risk ? 2 : 1.4} />
              <text x={x} y={y + (r.type === 'company' ? -2 : 3)} textAnchor="middle" fontSize={r.type === 'company' ? 11 : 10} fontWeight="600" fill={c}>
                {r.name.length > 6 ? r.name.slice(0, 5) + '…' : r.name}
              </text>
              <text x={x} y={y + (r.type === 'company' ? 14 : 16)} textAnchor="middle" fontSize="9" fill="#64748B">{r.rel}</text>
              {r.risk && <text x={x} y={y - (r.type === 'company' ? 30 : 26)} textAnchor="middle" fontSize="10" fontWeight="700" fill="#DC2626">{r.risk}</text>}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748B', marginTop: 4 }}>
        {(Object.keys(REL_COLOR) as CustRelationNode['type'][]).map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: REL_COLOR[t], display: 'inline-block' }} />{REL_LABEL[t]}
          </span>
        ))}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #DC2626', display: 'inline-block' }} />高危
        </span>
      </div>
    </div>
  );
}

/* 需求20：风险维度画像——横向条形（0-100，越高越危险，红/橙/绿三档） */
function RiskDims({ dims }: { dims: { dim: string; score: number }[] }) {
  if (!dims.length) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无风险维度数据</div>;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {dims.map((d) => {
        const color = d.score >= 70 ? '#DC2626' : d.score >= 45 ? '#D97706' : '#059669';
        return (
          <div key={d.dim} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 34, fontSize: 12, color: '#475569', fontWeight: 500 }}>{d.dim}</span>
            <div style={{ flex: 1, height: 10, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${d.score}%`, height: '100%', background: color, borderRadius: 999 }} />
            </div>
            <span style={{ width: 36, fontSize: 12, fontWeight: 700, color, textAlign: 'right' }}>{d.score}</span>
          </div>
        );
      })}
      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>维度分越高风险越大（≥70 红 / 45-69 橙 / &lt;45 绿）</div>
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
