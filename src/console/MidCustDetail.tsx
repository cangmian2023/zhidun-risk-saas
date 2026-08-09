// ⑦ 个体详情页（使用域 · 需求19/20 重构）— 读客户样例 midCustomers.json 橘；打分/额度使用率实时计算 灰
// 需求19：返回按钮回「预警详情」来源页（URL 带 from=alert&id= 时回预警详情，否则回预警队列）；删除「前往预警工作台」按钮
// 需求20：单客 360 档案——画像 / 关键指标 / 行为分趋势 / 关联图谱 / 风险维度雷达 / 预警时间线 / 处置记录
// 优化：单列分块——第一行统计概要，其下板块顺序：预警明细与指标 → 基本信息 → 行为 → 关系图谱 → 处置与操作日志
//   关系图谱：左侧关系列表+点击抽屉、主题切换(关系类型/风险等级)、节点预警标记(需求6.1/6.2/6.3)
//   基本信息：补充信贷信息、环境信息(需求5)；行为区块补全行为指标(需求6 行为)
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DetailHeader, Panel, StatCard, Badge, StatusTag } from '../components/ui';
import { LineChart } from '../components/charts';
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
const RISK_COLOR: Record<'高' | '中' | '低', string> = { 高: '#DC2626', 中: '#D97706', 低: '#059669' };

export default function MidCustDetail() {
  const [params] = useSearchParams();
  const custId = params.get('cust') ?? '';
  const fromAlertId = params.get('id') ?? '';   // 需求19：来源预警 ID
  const customers = useMidCustomers();
  const alerts = useMidAlerts();
  const tasks = useMidDisposeTasks();
  const nav = useNavigate();
  const [selRel, setSelRel] = useState<CustRelationNode | null>(null);
  const [graphTheme, setGraphTheme] = useState<'type' | 'risk'>('type');

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

  // 统一预警明细：合并 store 预警 + 客户内旧结构 alerts，按时间倒序
  const alertList = useMemo(() => {
    if (!cust) return [];
    const fromStore = custAlerts.map((a) => ({
      id: a.alert_id, level: a.level, scene: a.scene, rule: a.rule_name,
      metric: a.metric_value, threshold: a.threshold,
      status: a.status ?? a.flowState ?? '待处置', time: a.alert_date,
    }));
    const fromCust = cust.alerts.map((a) => ({
      id: '', level: a.level, scene: a.scene, rule: a.ruleName,
      metric: a.metricValue, threshold: a.threshold, status: a.status, time: a.time,
    }));
    return [...fromStore, ...fromCust].sort((x, y) => (y.time || '').localeCompare(x.time || ''));
  }, [cust, custAlerts]);

  // 处置与操作日志：合并处置工单 + 历史处置，按时间倒序
  const logEntries = useMemo(() => {
    if (!cust) return [] as { time: string; title: string; sub: string; status?: string; kind: 'task' | 'dispose' }[];
    const arr: { time: string; title: string; sub: string; status?: string; kind: 'task' | 'dispose' }[] = [];
    custTasks.forEach((t) => arr.push({
      time: t.updatedAt, kind: 'task',
      title: `${t.action} · ${t.targetSystem}`,
      sub: `工单 ${t.id} ｜ ${t.operator}`, status: t.status,
    }));
    cust.disposes.forEach((d) => arr.push({
      time: d.time, kind: 'dispose',
      title: `${d.action} · ${d.result}`,
      sub: `操作人 ${d.operator}${d.note ? ` ｜ ${d.note}` : ''}`,
    }));
    return arr.sort((a, b) => b.time.localeCompare(a.time));
  }, [cust, custTasks]);

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

      {/* 第一行：统计概要 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="授信额度" value={`¥${cust.creditLine.toLocaleString()}`} accent="brand" />
        <StatCard label="在贷余额" value={`¥${cust.loanBalance.toLocaleString()}`} accent="violet" />
        <StatCard label="额度使用率" value={`${usage.toFixed(1)}%`} accent={usage > 80 ? 'rose' : 'emerald'} hint={<Cal label="实时计算" />} />
        <StatCard label="贷款状态" value={cust.loanStatus} accent={cust.loanStatus === '在贷' ? 'blue' : 'gray'} />
      </div>

      {/* 板块一：预警明细与指标 */}
      <Panel
        title="预警明细与指标"
        desc={<span>该客户关键风险指标可视化 <Sam label="样例" /> 与全部预警事件明细</span>}
        className="mb-4"
      >
        <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 3, height: 12, borderRadius: 2, background: '#2563EB', display: 'inline-block' }} />
          预警指标可视化
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>行为分趋势（近 6 个月 vs 同客群均值） <Sam label="样例" /></div>
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
          </div>
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 6 }}>风险维度画像（0-100，越高越危险） <Cal label="样例+实时" /></div>
            <RiskDims dims={cust.riskDims ?? []} />
          </div>
        </div>
        <div style={{ marginTop: 18, marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#475569', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 3, height: 12, borderRadius: 2, background: '#2563EB', display: 'inline-block' }} />
          预警明细
        </div>
        <AlertTable rows={alertList} />
      </Panel>

      {/* 板块二：基本信息（个人档案，含信贷/环境） */}
      <Panel
        title="基本信息"
        desc={<span>客户身份与授信档案 <Sam label="样例字段" /> 含信贷信息与环境信息</span>}
        className="mb-4"
      >
        <ProfileCard c={cust} usage={usage} />
      </Panel>

      {/* 板块三：行为（关系图谱上方） */}
      <Panel
        title="行为"
        desc={<span>近 30 天行为特征与近期行为事件 <Sam label="样例" /></span>}
        className="mb-4"
      >
        <BehaviorBlock b={cust.behavior} />
      </Panel>

      {/* 板块四：关系图谱（左列表+抽屉 / 主题切换 / 预警标记） */}
      <Panel
        title="关系图谱"
        desc={<span>客户为中心的关系网络 <Sam label="样例" /> 实体风险标记与关联预警</span>}
        className="mb-4"
      >
        {cust.relations && cust.relations.length > 0 ? (
          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
            {/* 左：关系列表 */}
            <div style={{ width: 280, flexShrink: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>关系列表（{cust.relations.length}）</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {cust.relations.map((r) => (
                  <div
                    key={r.id}
                    onClick={() => setSelRel(r)}
                    style={{
                      border: '1px solid ' + (selRel?.id === r.id ? '#2563EB' : '#E2E8F0'),
                      background: selRel?.id === r.id ? '#EFF6FF' : '#fff',
                      borderRadius: 10, padding: '10px 12px', cursor: 'pointer', transition: 'all .15s',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{r.name}</span>
                      <span style={{ fontSize: 11, color: '#fff', background: REL_COLOR[r.type], borderRadius: 999, padding: '1px 7px' }}>{REL_LABEL[r.type]}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: REL_COLOR[r.type] }}>{r.rel}</span>
                      {r.riskLevel && <Badge kind={r.riskLevel === '高' ? 'red' : r.riskLevel === '中' ? 'amber' : 'green'}>{r.riskLevel}风险</Badge>}
                      {!!r.openAlerts && <span style={{ fontSize: 11, color: '#DC2626', fontWeight: 600 }}>⚠ {r.openAlerts} 预警</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* 右：图谱 + 主题切换 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
                <div style={{ display: 'inline-flex', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden' }}>
                  {(['type', 'risk'] as const).map((t) => (
                    <span
                      key={t}
                      onClick={() => setGraphTheme(t)}
                      style={{
                        fontSize: 12, padding: '4px 12px', cursor: 'pointer',
                        background: graphTheme === t ? '#2563EB' : '#fff', color: graphTheme === t ? '#fff' : '#475569',
                      }}
                    >{t === 'type' ? '按关系类型' : '按风险等级'}</span>
                  ))}
                </div>
              </div>
              <RelationGraph cust={cust} colorBy={graphTheme} />
            </div>
          </div>
        ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无关联实体</div>}
      </Panel>

      {/* 板块五：处置与操作日志 */}
      <Panel
        title="处置与操作日志"
        desc={<span>处置工单 + 历史操作记录 <Sam label="样例" /></span>}
        className="mb-4"
      >
        {logEntries.length ? (
          <Timeline items={logEntries.map((e) => ({
            time: e.time,
            color: e.kind === 'task' ? '#2563EB' : '#7C3AED',
            title: e.title,
            sub: e.sub,
            tag: e.status ? <StatusTag kind={STATUS_KIND[e.status] ?? 'gray'}>{e.status}</StatusTag> : undefined,
          }))} />
        ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无处置与操作记录</div>}
      </Panel>

      {/* 关系人抽屉 */}
      {selRel && <RelationDrawer r={selRel} custName={cust.name} onClose={() => setSelRel(null)} />}
    </div>
  );
}

function AlertTable({ rows }: {
  rows: { id: string; level: string; scene: string; rule: string; metric: number; threshold: number; status: string; time: string }[];
}) {
  if (!rows.length) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无预警记录</div>;
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: 12, borderBottom: '1px solid #E2E8F0' }}>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>级别</th>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>场景</th>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>触发规则</th>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>指标 / 阈值</th>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>状态</th>
            <th style={{ padding: '8px 10px', fontWeight: 500 }}>时间</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || i} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                <Badge kind={LEVEL_META[r.level]?.badge ?? 'gray'}>{LEVEL_META[r.level]?.label ?? r.level}</Badge>
              </td>
              <td style={{ padding: '10px', color: '#334155' }}>{r.scene}</td>
              <td style={{ padding: '10px', color: '#334155' }}>{r.rule}</td>
              <td style={{ padding: '10px', color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{r.metric} / {r.threshold}</td>
              <td style={{ padding: '10px', whiteSpace: 'nowrap' }}>
                <StatusTag kind={STATUS_KIND[r.status] ?? 'gray'}>{r.status}</StatusTag>
              </td>
              <td style={{ padding: '10px', color: '#94A3B8', whiteSpace: 'nowrap' }}>{r.time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProfileCard({ c, usage }: { c: MidCustomer; usage: number }) {
  const initial = c.name?.[0] ?? '客';
  const riskBadge: 'red' | 'amber' | 'green' =
    c.riskLevel === '高风险' ? 'red' : c.riskLevel === '中风险' ? 'amber' : 'green';
  const cr = c.credit, ev = c.env;
  const groups: { title: string; items: { label: string; value: React.ReactNode }[] }[] = [
    {
      title: '身份标识',
      items: [
        { label: '姓名', value: c.name },
        { label: '客户号', value: c.custId },
        { label: '证件号', value: c.idCard },
      ],
    },
    {
      title: '授信与风险',
      items: [
        { label: '产品', value: c.product },
        { label: '授信额度', value: `¥${c.creditLine.toLocaleString()}` },
        { label: '在贷余额', value: `¥${c.loanBalance.toLocaleString()}` },
        { label: '额度使用率', value: <span>{usage.toFixed(1)}% <Cal label="实时" /></span> },
        { label: '贷款状态', value: <StatusTag kind={c.loanStatus === '在贷' ? 'blue' : 'gray'}>{c.loanStatus}</StatusTag> },
        { label: '风险等级', value: <Badge kind={riskBadge}>{c.riskLevel}</Badge> },
      ],
    },
    {
      title: '信贷信息',
      items: cr ? [
        { label: '贷款期限', value: `${cr.term} 期` },
        { label: '年利率', value: `${cr.rate}%` },
        { label: '还款方式', value: cr.repayMethod },
        { label: '开户机构', value: cr.branch },
        { label: '放款日期', value: cr.loanDate },
        { label: '最近还款日', value: cr.lastRepay },
        { label: '历史逾期', value: <span>{cr.overdue} 次</span> },
        { label: '当期应还', value: <span>¥{cr.curDue.toLocaleString()}</span> },
      ] : [{ label: '信贷信息', value: '—' }],
    },
    {
      title: '环境信息',
      items: ev ? [
        { label: '常用设备', value: ev.device },
        { label: '登录地区', value: ev.region },
        { label: '网络环境', value: ev.network },
        { label: '最近登录', value: ev.lastLogin },
        { label: '定位城市', value: ev.city },
      ] : [{ label: '环境信息', value: '—' }],
    },
  ];
  return (
    <div>
      {/* 档案头部 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #F1F5F9', marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
          {initial}
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>{c.name}</span>
            <Badge kind={riskBadge}>{c.riskLevel}</Badge>
            <StatusTag kind={c.loanStatus === '在贷' ? 'blue' : 'gray'}>{c.loanStatus}</StatusTag>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
            客户号 {c.custId} ｜ {c.product} <Sam label="客户样例" />
          </div>
        </div>
      </div>
      {/* 字段分组 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 20 }}>
        {groups.map((g) => (
          <div key={g.title}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', letterSpacing: '0.04em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 3, height: 12, borderRadius: 2, background: '#2563EB', display: 'inline-block' }} />
              {g.title}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {g.items.map((it) => (
                <div key={it.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: '1px dashed #F1F5F9' }}>
                  <span style={{ fontSize: 13, color: '#94A3B8' }}>{it.label}</span>
                  <span style={{ fontSize: 13, color: '#334155', fontWeight: 600 }}>{it.value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BehaviorBlock({ b }: { b?: MidCustomer['behavior'] }) {
  if (!b) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无行为数据</div>;
  const metrics = [
    { label: '近30天登录', value: `${b.login30d} 次` },
    { label: '设备更换', value: `${b.deviceChange} 次` },
    { label: '活跃天数', value: `${b.activeDays} 天` },
    { label: '还款及时率', value: `${b.repayOnTime}%` },
    { label: '夜间交易占比', value: `${b.nightTxnRatio}%` },
  ];
  const colorFor = (v: number) => (v >= 70 ? '#DC2626' : v >= 45 ? '#D97706' : '#059669');
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        {metrics.map((m) => {
          const num = parseInt(String(m.value).replace(/\D/g, ''), 10) || 0;
          const danger = m.label === '设备更换' ? num > 1 : m.label === '还款及时率' ? num < 85 : num >= 12;
          return (
            <div key={m.label} style={{ border: '1px solid #F1F5F9', borderRadius: 12, padding: '12px 14px' }}>
              <div style={{ fontSize: 12, color: '#64748B' }}>{m.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: danger ? colorFor(num) : '#1E293B', marginTop: 4 }}>{m.value}</div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 3, height: 12, borderRadius: 2, background: '#2563EB', display: 'inline-block' }} />
        近期行为事件
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {b.recentEvents.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px dashed #F1F5F9' }}>
            <span style={{ fontSize: 11, color: '#fff', background: e.type === '登录' ? '#2563EB' : e.type === '交易' ? '#7C3AED' : '#059669', borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>{e.type}</span>
            <span style={{ fontSize: 12, color: '#94A3B8', width: 130, flexShrink: 0 }}>{e.time}</span>
            <span style={{ fontSize: 13, color: '#334155' }}>{e.detail}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 关联图谱（SVG 手绘——客户居中，关联实体环绕，按主题着色，高危实体红框，预警数角标） */
function RelationGraph({ cust, colorBy }: { cust: MidCustomer; colorBy: 'type' | 'risk' }) {
  const rels = cust.relations ?? [];
  const W = 560, H = 260, CX = W / 2, CY = H / 2;
  const R = 92;
  if (!rels.length) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无关联实体</div>;
  const pts = rels.map((r, i) => {
    const ang = (Math.PI * 2 * i) / rels.length - Math.PI / 2;
    return { r, x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang) };
  });
  const nodeColor = (r: CustRelationNode) =>
    colorBy === 'risk' ? (r.riskLevel ? RISK_COLOR[r.riskLevel] : '#94A3B8') : REL_COLOR[r.type];
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
          const c = nodeColor(r);
          const isHi = r.risk === '高危';
          return (
            <g key={r.id}>
              <circle cx={x} cy={y} r={r.type === 'company' ? 24 : 19} fill={c} fillOpacity={r.risk ? 0.16 : 0.1} stroke={isHi ? '#DC2626' : c} strokeWidth={isHi ? 2 : 1.4} />
              <text x={x} y={y + (r.type === 'company' ? -2 : 3)} textAnchor="middle" fontSize={r.type === 'company' ? 11 : 10} fontWeight="600" fill={c}>
                {r.name.length > 6 ? r.name.slice(0, 5) + '…' : r.name}
              </text>
              <text x={x} y={y + (r.type === 'company' ? 14 : 16)} textAnchor="middle" fontSize="9" fill="#64748B">{r.rel}</text>
              {isHi && <text x={x} y={y - (r.type === 'company' ? 30 : 26)} textAnchor="middle" fontSize="10" fontWeight="700" fill="#DC2626">{r.risk}</text>}
              {/* 关联预警数角标 */}
              {!!r.openAlerts && (
                <g>
                  <circle cx={x + (r.type === 'company' ? 22 : 17)} cy={y - (r.type === 'company' ? 22 : 17)} r={9} fill="#DC2626" stroke="#fff" strokeWidth={1.5} />
                  <text x={x + (r.type === 'company' ? 22 : 17)} y={y - (r.type === 'company' ? 22 : 17) + 3.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#fff">{r.openAlerts}</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748B', marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {colorBy === 'type' ? (
          <>
            {(Object.keys(REL_COLOR) as CustRelationNode['type'][]).map((t) => (
              <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: REL_COLOR[t], display: 'inline-block' }} />{REL_LABEL[t]}
              </span>
            ))}
          </>
        ) : (
          <>
            {(['高', '中', '低'] as const).map((k) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLOR[k], display: 'inline-block' }} />{k}风险
              </span>
            ))}
          </>
        )}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', border: '2px solid #DC2626', display: 'inline-block' }} />高危
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#DC2626', color: '#fff', fontSize: 10, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>n</span>关联预警数
        </span>
      </div>
    </div>
  );
}

/* 关系人抽屉：右侧滑出，展示该关系人基本信息 */
function RelationDrawer({ r, custName, onClose }: { r: CustRelationNode; custName: string; onClose: () => void }) {
  const fields: { label: string; value: React.ReactNode }[] = [
    { label: '关系', value: r.rel },
    { label: '类型', value: REL_LABEL[r.type] },
    { label: '风险等级', value: r.riskLevel ? <Badge kind={r.riskLevel === '高' ? 'red' : r.riskLevel === '中' ? 'amber' : 'green'}>{r.riskLevel}风险</Badge> : '—' },
    { label: '关联预警', value: <span style={{ color: '#DC2626', fontWeight: 600 }}>{r.openAlerts ?? 0} 条</span> },
    { label: '证件号', value: r.idCard ?? '—' },
    { label: '手机号', value: r.phone ?? '—' },
    { label: '注册资本', value: r.regCapital ?? '—' },
    { label: '法定代表人', value: r.legalPerson ?? '—' },
    { label: '接入渠道', value: r.channel ?? '—' },
    { label: '备注', value: r.note ?? '—' },
  ];
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.35)', zIndex: 50 }} />
      <div style={{ position: 'fixed', top: 0, right: 0, height: '100vh', width: 380, maxWidth: '90vw', background: '#fff', boxShadow: '-8px 0 24px rgba(0,0,0,0.12)', zIndex: 51, padding: 24, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ width: 36, height: 36, borderRadius: '50%', background: REL_COLOR[r.type], color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>{r.name[0]}</span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{r.name}</div>
              <div style={{ fontSize: 12, color: '#94A3B8' }}>{r.rel} · 与 {custName} 关联</div>
            </div>
          </div>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 20, color: '#94A3B8', lineHeight: 1 }}>×</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {fields.map((f) => (
            <div key={f.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #F1F5F9' }}>
              <span style={{ fontSize: 13, color: '#94A3B8', flexShrink: 0 }}>{f.label}</span>
              <span style={{ fontSize: 13, color: '#334155', fontWeight: 600, textAlign: 'right' }}>{f.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

/* 风险维度画像——横向条形（0-100，越高越危险，红/橙/绿三档） */
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
