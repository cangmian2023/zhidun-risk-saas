// ⑦ 个体详情页（使用域 · 需求19/20 重构）— 读客户样例 midCustomers.json 橘；打分/额度使用率实时计算 灰
// 需求19：返回按钮回「预警详情」来源页（URL 带 from=alert&id= 时回预警详情，否则回预警队列）；删除「前往预警工作台」按钮
// 需求20：单客 360 档案——画像 / 关键指标 / 行为分趋势 / 关联图谱 / 风险维度雷达 / 预警时间线 / 处置记录
// 优化：单列分块——第一行统计概要，其下板块顺序：预警明细与指标 → 基本信息 → 行为 → 关系图谱 → 处置与操作日志
//   关系图谱：左侧关系列表+点击抽屉、主题切换(关系类型/风险等级)、节点预警标记(需求6.1/6.2/6.3)
//   基本信息：补充信贷信息、环境信息(需求5)；行为区块补全行为指标(需求6 行为)
import { useMemo, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DetailHeader, Panel, StatCard, Badge, StatusTag, DataTable, type Column, type Row } from '../components/ui';
import { LineChart } from '../components/charts';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import FlowStateCell from './FlowStateCell';
import { useMidCustomers, useMidAlerts, useMidDisposeTasks, updateAlerts } from './midStore';
import { useFlows, type FlowItem, matchFlowGraph, flowStepOf, nodeTimeLimitOf } from './flowStore';
import { useCollection } from './collectionData';
import {
  LEVEL_META,
  type MidCustomer, type CustRelationNode,
  type CustModelScore, type CustExternalCheck,
} from './midData';
// 需求17-缺口1/2/6：多头共债、设备与欺诈维度、运营动作跟踪
import {
  useGap, coDebtOf, deviceOf, GAP_LEVEL_KIND,
  type CoDebtProfile, type DeviceProfile,
} from './gapData';

const STATUS_KIND: Record<string, 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gray'> = {
  待处置: 'red', 核实中: 'amber', 处置中: 'blue', 已解除: 'green', 已升级: 'violet', 误报: 'gray',
};
// 预警类型 → 徽标配色（与预警工作台保持一致）
const TYPE_KIND: Record<string, 'red' | 'amber' | 'blue' | 'green' | 'violet' | 'gray'> = {
  负债激增: 'red', 多头借贷: 'red', 逾期预警: 'red', 司法涉诉: 'red', 关联企业风险: 'red',
  设备异常: 'amber', 反欺诈命中: 'amber', 行为评分下降: 'amber', 还款能力不足: 'blue',
  回访失联: 'blue', 舆情负面: 'violet', 提额机会: 'green', 需求上升: 'green',
};
const REL_COLOR: Record<CustRelationNode['type'], string> = {
  company: '#2563EB', person: '#D97706', device: '#7C3AED', contact: '#059669',
};
const REL_LABEL: Record<CustRelationNode['type'], string> = {
  company: '企业', person: '个人', device: '设备', contact: '联系人',
};
const RISK_COLOR: Record<'高' | '中' | '低', string> = { 高: '#DC2626', 中: '#D97706', 低: '#059669' };
const RING_PALETTE = ['#DC2626', '#0891B2', '#7C3AED', '#D97706', '#0D9488'];
const THEME_LABEL: Record<'type' | 'risk' | 'ring' | 'list', string> = { type: '关系网络', risk: '风险分布', ring: '团伙识别', list: '名单网络' };

// 右侧导航窗条条目（复用报告详情页的「页面导航」模式：状态色点 + 滚动锚点）
const NAV_ITEMS: { id: string; label: string }[] = [
  { id: 'sec-summary', label: '统计概要' },
  { id: 'sec-alert', label: '预警信息' },
  { id: 'sec-base', label: '基本信息' },
  { id: 'sec-score', label: '模型评分' },
  { id: 'sec-decision', label: '审核决策' },
  { id: 'sec-income', label: '收入负债' },
  { id: 'sec-credit', label: '征信' },
  { id: 'sec-behavior', label: '行为' },
  { id: 'sec-device', label: '设备与欺诈' },
  { id: 'sec-external', label: '外部数据核验' },
  { id: 'sec-collateral', label: '担保与经营' },
  { id: 'sec-relation', label: '关系图谱' },
  { id: 'sec-codebt', label: '多头共债' },
  { id: 'sec-collection', label: '催收案件' },
  { id: 'sec-postrisk', label: '贷后风险' },
  { id: 'sec-log', label: '处置与操作日志' },
];

export default function MidCustDetail() {
  const [params] = useSearchParams();
  const custId = params.get('cust') ?? '';
  const fromAlertId = params.get('id') ?? '';   // 需求19：来源预警 ID
  const customers = useMidCustomers();
  const alerts = useMidAlerts();
  const tasks = useMidDisposeTasks();
  const nav = useNavigate();
  const collection = useCollection();
  const flows = useFlows();
  const cust: MidCustomer | undefined = useMemo(
    () => customers.find((c) => c.custId === custId) ?? customers[0],
    [customers, custId],
  );
  // 需求15：预警明细列表沿用预警工作台结构（同款 DataTable 列）；时限倒计时每分钟刷新
  const [, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((x) => x + 1), 60000); return () => clearInterval(t); }, []);
  const [selRel, setSelRel] = useState<CustRelationNode | null>(null);
  const [graphTheme, setGraphTheme] = useState<'type' | 'risk' | 'ring' | 'list'>('type');
  // 需求17-缺口1/2/6：多头共债 / 设备档案 / 运营动作（样例 midGap.json，未命中样例按客户号确定性派生）
  const gap = useGap();
  const coDebt: CoDebtProfile | null = cust ? coDebtOf(gap, cust.custId, cust.name) : null;
  const devProfile: DeviceProfile | null = cust ? deviceOf(gap, cust.custId, cust.name) : null;
  const env = cust?.env;
  // 右侧导航高亮跟随（scrollspy）：滚动时高亮当前所处板块
  const [activeNav, setActiveNav] = useState<string>(NAV_ITEMS[0]?.id ?? '');
  useEffect(() => {
    const onScroll = () => {
      const offset = 140; // 视口顶部判定阈值
      let cur = NAV_ITEMS[0]?.id ?? '';
      for (const it of NAV_ITEMS) {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= offset) cur = it.id;
      }
      setActiveNav(cur);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [cust]);

  const custCases = cust ? (collection.cases ?? []).filter((x) => x.custId === cust.custId) : [];

  // 团伙汇总（关系图谱·团伙识别主题用）
  const ringsSummary = useMemo(() => {
    const map = new Map<number, { name: string; risk: string; count: number }>();
    (cust?.relations ?? []).forEach((r) => {
      if (!r.ringId) return;
      const cur = map.get(r.ringId) ?? { name: r.ringName ?? '关联团伙' + r.ringId, risk: r.ringRisk ?? '中', count: 0 };
      cur.count += 1;
      map.set(r.ringId, cur);
    });
    return [...map.entries()].map(([id, m]) => ({ id, ...m }));
  }, [cust]);

  // 需求19：返回按钮——从预警详情进入则回预警详情，否则回预警队列
  const backTo = () => {
    if (fromAlertId) nav('/console/cr/mid-alert-detail?id=' + fromAlertId);
    else nav('/console/cr/mid-alert-workbench');
  };

  // 实时计算（灰）：额度使用率
  const usage = cust ? (cust.creditLine ? (cust.loanBalance / cust.creditLine) * 100 : 0) : 0;

  const custAlerts = cust ? alerts.filter((a) => a.cust_id === cust.custId) : [];
  const custTasks = cust ? tasks.filter((t) => t.custId === cust.custId) : [];

  // 需求15：单客预警明细列表沿用预警工作台（MidAlertWorkbench）同款结构 ——
  // 合并 store 预警 + 客户内旧结构 alerts，产出 DataTable 的 Row[]（含 flowKey/flowState 供"关联业务流程/流程状态/时限倒计时"列渲染），按时间倒序
  const alertList = useMemo(() => {
    if (!cust) return [] as Row[];
    const fromStore: Row[] = custAlerts.map((a) => ({
      id: a.alert_id,
      alert_id: a.alert_id,
      alert_type: { v: a.alert_type, kind: TYPE_KIND[a.alert_type] ?? 'gray' },
      scene: a.scene,
      level: { v: LEVEL_META[a.level].label, kind: LEVEL_META[a.level].badge },
      levelRaw: a.level,
      alertTypeRaw: a.alert_type,
      rule_name: a.rule_name,
      metric: `${a.metric_value} / ${a.threshold}`,
      alert_date: a.alert_date,
      flowKey: a.flowKey ?? '',
      flowState: a.flowState ?? '',
      flowStateAt: a.flowStateAt ?? '',
      status: a.status ?? a.flowState ?? '待处置',
    }));
    const fromCust: Row[] = cust.alerts.map((a, i) => {
      const lv = LEVEL_META[a.level as 'RED' | 'YELLOW' | 'OPPORTUNITY'];
      return {
        id: `cust-${i}`,
        alert_id: '—',
        alert_type: { v: a.scene, kind: 'gray' },
        scene: a.scene,
        level: { v: lv?.label ?? a.level, kind: lv?.badge ?? 'gray' },
        levelRaw: a.level,
        alertTypeRaw: a.scene,
        rule_name: a.ruleName,
        metric: `${a.metricValue} / ${a.threshold}`,
        alert_date: a.time,
        flowKey: '',
        flowState: '',
        flowStateAt: '',
        status: a.status,
      };
    });
    return [...fromStore, ...fromCust].sort((x, y) => String(y.alert_date).localeCompare(String(x.alert_date)));
  }, [cust, custAlerts]);

  // 处置与操作日志：合并处置工单 + 历史处置，按时间倒序（需求11：task 带 id 可点击跳工单）
  const logEntries = useMemo(() => {
    if (!cust) return [] as { time: string; title: string; sub: string; status?: string; kind: 'task' | 'dispose'; id?: string }[];
    const arr: { time: string; title: string; sub: string; status?: string; kind: 'task' | 'dispose'; id?: string }[] = [];
    custTasks.forEach((t) => arr.push({
      time: t.updatedAt, kind: 'task', id: t.id,
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

      {/* 主内容 + 右侧导航两列布局 */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', marginTop: 16 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
      {/* 第一行：统计概要 */}
      <div id="sec-summary" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="授信额度" value={`¥${cust.creditLine.toLocaleString()}`} accent="brand" />
        <StatCard label="在贷余额" value={`¥${cust.loanBalance.toLocaleString()}`} accent="violet" />
        <StatCard label="额度使用率" value={`${usage.toFixed(1)}%`} accent={usage > 80 ? 'rose' : 'emerald'} hint={<Cal label="实时计算" />} />
        <StatCard label="贷款状态" value={cust.loanStatus} accent={cust.loanStatus === '在贷' ? 'blue' : 'gray'} />
      </div>

      {/* 板块一：预警信息 */}
      <Panel
        id="sec-alert"
        title="预警信息"
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
        <AlertTable rows={alertList} flows={flows} onOpen={(id) => nav('/console/cr/mid-alert-detail?id=' + id)} />
      </Panel>

      {/* 板块二：基本信息（个人档案，含信贷/环境） */}
      <Panel
        id="sec-base"
        title="基本信息"
        desc={<span>客户身份档案与影像资料 <Sam label="样例" /></span>}
        className="mb-4"
      >
        <ProfileCard c={cust} />
      </Panel>

      {/* 需求11审核：模型评分快照（极轻提示，详细评分见下方决策建议与详情页） */}
      <div id="sec-score" style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>
        <span>模型评分快照</span>
        {cust.scores ? (
          <>
            <span style={{ color: '#64748B' }}>
              智察 <b style={{ color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{cust.scores.zhicha.score}</b>
              {' · '}智信 <b style={{ color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{cust.scores.zhixin.score}</b>
              {' · '}智融 <b style={{ color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{cust.scores.zhirong.score}</b>
            </span>
            <span style={{ color: '#2563EB', cursor: 'pointer', marginLeft: 'auto' }}
              onClick={() => nav('/console/cr/mid-cust-score?cust=' + cust.custId + '&prod=zhicha' + (fromAlertId ? '&id=' + fromAlertId : ''))}>
              查看模型评分详情 →
            </span>
          </>
        ) : <span>暂无模型评分数据</span>}
      </div>

      {/* 综合审核决策建议（跨三模型+预警+收入负债+征信，给建议与需核实红旗，并做同客群对标） */}
      <Panel
        id="sec-decision"
        title="综合审核决策建议"
        desc={<span>跨三模型评分 + 预警 + 收入负债 + 征信的合成决策视图 <Sam label="样例" /></span>}
        className="mb-4"
      >
        {cust.scores ? <DecisionPanel cust={cust} custAlerts={custAlerts} /> : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无评分数据，无法合成决策</div>}
      </Panel>

      {/* 需求11：收入负债（还款能力核心，基本信息后立即展示） */}
      <Panel
        id="sec-income"
        title="收入负债"
        desc={<span>还款能力判读 <Sam label="样例" /> 月收入 / 月供 / 收入负债比 DTI / 资产负债率</span>}
        className="mb-4"
      >
        <IncomePanel c={cust} />
      </Panel>

      {/* 需求11：征信（查询记录 + 账户明细 + 逾期/担保） */}
      <Panel
        id="sec-credit"
        title="征信"
        desc={<span>人行征信主题 <Sam label="样例" /> 近 6 月查询 / 信贷账户明细 / 逾期与对外担保</span>}
        className="mb-4"
      >
        <CreditPanel c={cust} />
      </Panel>

      {/* 板块三：行为（关系图谱上方） */}
      <Panel
        id="sec-behavior"
        title="行为"
        desc={<span>近 30 天行为特征与近期行为事件 <Sam label="样例" /></span>}
        className="mb-4"
      >
        <BehaviorBlock b={cust.behavior} />
      </Panel>

      {/* 需求17-缺口2：设备与欺诈维度（设备号/机型/系统/环境风险分/模拟器 + 同设备多账号） */}
      <Panel
        id="sec-device"
        title="设备与欺诈维度"
        desc={<span>设备指纹与运行环境 <Sam label="样例" value="midGap.json" /> 环境风险分越高越危险；同设备多账号是团伙欺诈的关键信号</span>}
        className="mb-4"
      >
        {devProfile ? (
          <DevicePanel d={devProfile} env={env} onOpenCust={(cid) => nav('/console/cr/mid-cust-detail?cust=' + cid)} />
        ) : env ? (
          <div style={{ fontSize: 13, color: '#475569' }}>
            <div style={{ fontWeight: 600, marginBottom: 8 }}>登录与环境</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 8 }}>
              <div>常用设备：{env.device || '—'}</div>
              <div>登录地区：{env.region || '—'}</div>
              <div>网络环境：{env.network || '—'}</div>
              <div>最近登录：{env.lastLogin || '—'}</div>
              <div>定位城市：{env.city || '—'}</div>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无设备数据</div>
        )}
      </Panel>

      {/* 需求11审核：外部数据核验（工商/司法/税务/社保） */}
      <Panel
        id="sec-external"
        title="外部数据核验"
        desc={<span>跨源外部数据核验 <Sam label="样例" /> 工商 / 司法涉诉 / 税务 / 社保公积金</span>}
        className="mb-4"
      >
        {cust.externalChecks && cust.externalChecks.length ? (
          <ExternalCheckPanel rows={cust.externalChecks} />
        ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无外部核验数据</div>}
      </Panel>

      {/* 需求11：担保抵押 + 企业经营（经营贷/抵押贷还款来源） */}
      <Panel
        id="sec-collateral"
        title="担保与经营"
        desc={<span>担保抵押物与经营实体 <Sam label="样例" /> 经营贷/抵押贷客户展示</span>}
        className="mb-4"
      >
        <CollateralBizPanel c={cust} />
      </Panel>

      {/* 板块四：关系图谱（左列表+抽屉 / 主题切换 / 预警标记） */}
      <Panel
        id="sec-relation"
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, gap: 12 }}>
                {graphTheme === 'ring' ? (
                  <div style={{ fontSize: 12, color: '#64748B' }}>
                    检测到 <b style={{ color: '#DC2626' }}>{ringsSummary.length}</b> 个团伙：
                    {ringsSummary.map((rg) => (
                      <span key={rg.id} style={{ marginLeft: 8, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: RING_PALETTE[(rg.id - 1) % RING_PALETTE.length], display: 'inline-block' }} />
                        {rg.name}（{rg.count} 实体，{rg.risk}风险）
                      </span>
                    ))}
                  </div>
                ) : <span />}
                <div style={{ display: 'inline-flex', border: '1px solid #E2E8F0', borderRadius: 8, overflow: 'hidden', flexShrink: 0 }}>
                  {(['type', 'risk', 'ring', 'list'] as const).map((t) => (
                    <span
                      key={t}
                      onClick={() => setGraphTheme(t)}
                      style={{
                        fontSize: 12, padding: '4px 12px', cursor: 'pointer',
                        background: graphTheme === t ? '#2563EB' : '#fff', color: graphTheme === t ? '#fff' : '#475569',
                      }}
                    >{THEME_LABEL[t]}</span>
                  ))}
                </div>
              </div>
              {graphTheme === 'list'
                ? <ListNetworkGraph cust={cust} co={coDebt} dev={devProfile} />
                : <RelationGraph cust={cust} colorBy={graphTheme} rings={ringsSummary} />}
            </div>
          </div>
        ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无关联实体</div>}
      </Panel>

      {/* 需求17-缺口1：多头共债（近 30 天在几家机构申请 / 跟谁共债 / 同设备申请几次） */}
      <Panel
        id="sec-codebt"
        title="多头共债"
        desc={<span>跨机构联防联控视角 <Sam label="样例" value="midGap.json" /> 近 30 天多头申请、共债机构清单与共债链条</span>}
        className="mb-4"
      >
        {coDebt ? <CoDebtPanel c={coDebt} /> : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无多头共债数据</div>}
      </Panel>

      {/* 需求11审核：催收案件（继承催收子系统，按 custId 关联） */}
      <Panel
        id="sec-collection"
        title="催收案件"
        desc={<span>该客户名下催收案件 <Sam label="样例" /> 来源 collectionData.json（催收子系统）</span>}
        className="mb-4"
      >
        {custCases.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {custCases.map((cs) => (
              <div key={cs.id} style={{ border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{cs.id}</span>
                  <StatusTag kind={cs.stage === 'M3+' ? 'red' : cs.stage === 'M2' ? 'amber' : cs.stage === 'M1' ? 'blue' : 'green'}>{cs.stage}</StatusTag>
                  <span style={{ fontSize: 12, color: '#64748B' }}>{cs.product}</span>
                  <StatusTag kind={cs.status === '委外' || cs.status === '核销' ? 'red' : cs.status === '承诺还款' ? 'green' : 'blue'}>{cs.status}</StatusTag>
                  <span style={{ fontSize: 12, color: '#94A3B8', marginLeft: 'auto' }}>催收员 {cs.owner} ｜ 最近触达 {cs.lastTouch}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 10 }}>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>逾期金额</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#DC2626' }}>¥{cs.overdueAmt.toLocaleString()}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>逾期天数</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{cs.overdueDays} 天</div>
                  </div>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>应还日</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{cs.dueDate}</div>
                  </div>
                  <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>触达</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>{cs.calls} 呼 / {cs.sms} 信</div>
                  </div>
                </div>
                {cs.notes.length ? (
                  <div style={{ borderTop: '1px dashed #E2E8F0', paddingTop: 8 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 4 }}>催收记录</div>
                    {cs.notes.slice(0, 3).map((n, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, padding: '3px 0', color: '#334155' }}>
                        <span style={{ color: '#94A3B8', flexShrink: 0 }}>{n.time}</span>
                        <span style={{ color: '#64748B', flexShrink: 0 }}>{n.who}</span>
                        <span>{n.what}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>该客户当前无催收案件</div>}
      </Panel>

      {/* 需求11：贷后风险（资金流向 + 黑名单反欺诈） */}
      <Panel
        id="sec-postrisk"
        title="贷后风险"
        desc={<span>资金流向监控与黑名单反欺诈 <Sam label="样例" /> 贷后预警关注点</span>}
        className="mb-4"
      >
        <RiskPanel c={cust} />
      </Panel>

      {/* 板块五：处置与操作日志 */}
      <Panel
        id="sec-log"
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
            onClick: e.kind === 'task' && e.id ? () => nav('/console/cr/mid-dispose-detail?id=' + e.id) : undefined,
          }))} />
        ) : <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无处置与操作记录</div>}
      </Panel>
        </div>{/* /左列 */}
        {/* 右侧导航窗条（复用报告详情页「页面导航」样式：sticky 上移到 nav 才能整页粘住 + 滚动高亮跟随） */}
        <nav className="hidden self-start lg:block" style={{ position: 'sticky', top: 128, width: 116, flexShrink: 0 }}>
          <div className="flex flex-col gap-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">页面导航</p>
            {NAV_ITEMS.map((it) => {
              const on = activeNav === it.id;
              return (
                <button
                  key={it.id}
                  type="button"
                  onClick={() => document.getElementById(it.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={`whitespace-nowrap rounded-lg px-2.5 py-1.5 text-left text-xs transition ${on ? 'bg-blue-50 font-semibold text-brand-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'}`}
                  style={on ? { borderLeft: '2px solid #2563EB', paddingLeft: 7 } : undefined}
                >
                  {it.label}
                </button>
              );
            })}
          </div>
        </nav>
      </div>{/* /flex 两列 */}

      {/* 关系人抽屉 */}
      {selRel && <RelationDrawer r={selRel} custName={cust.name} onClose={() => setSelRel(null)} />}

      {/* 返回顶部浮动按钮（复用报告详情页样式） */}
      <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} title="返回顶部"
        className="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5M5 12l7-7 7 7" /></svg>
      </button>
    </div>
  );
}

// 需求15：单客预警明细列表 —— 沿用预警工作台（MidAlertWorkbench）的同款 DataTable 列结构，
// 并新增「关联业务流程」列（由 flowKey 解析业务流程名称）；流程状态列复用 FlowStateCell（与工作台一致）。
function AlertTable({ rows, flows, onOpen }: { rows: Row[]; flows: FlowItem[]; onOpen?: (id: string) => void }) {
  // 节点时限倒计时（分钟）：无时限 / 终态 / 未记录进入时间 → '—'（复刻预警工作台）
  const countdownOf = (r: Row) => {
    const f = String(r.flowKey ?? '') ? flows.find((x) => x.id === String(r.flowKey)) : undefined;
    const { graph, steps } = matchFlowGraph(f, { level: r.levelRaw ?? '', alert_type: r.alertTypeRaw ?? '' });
    if (!f || !steps.length || !r.flowStateAt) return <span style={{ color: '#94A3B8' }}>—</span>;
    const { step } = flowStepOf({ flowSteps: steps, flowState: String(r.flowState ?? '') });
    if (!step?.next) return <span style={{ color: '#94A3B8' }}>—</span>;
    const tl = nodeTimeLimitOf(graph, String(r.flowState ?? ''));
    if (!tl) return <span style={{ color: '#94A3B8' }}>—</span>;
    const remain = new Date(String(r.flowStateAt)).getTime() + tl * 60000 - Date.now();
    if (remain <= 0) return <span style={{ color: '#DC2626', fontWeight: 600 }}>已超时</span>;
    const h = Math.floor(remain / 3600000);
    const m = Math.floor((remain % 3600000) / 60000);
    const color = remain < 30 * 60000 ? '#DC2626' : remain < 120 * 60000 ? '#D97706' : '#475569';
    return <span style={{ color, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{h > 0 ? `${h}小时${m}分` : `${m}分钟`}</span>;
  };

  const cols: Column[] = [
    { key: 'alert_id', label: '预警ID', type: 'text', width: '130px' },
    { key: 'alert_type', label: '预警类型', type: 'badge', badgeKind: 'violet', width: '110px' },
    { key: 'scene', label: '触发场景', type: 'text', width: '110px' },
    { key: 'level', label: '等级', type: 'badge', badgeKind: 'red', width: '80px' },
    { key: 'rule_name', label: '命中规则', type: 'text', width: '200px' },
    { key: 'metric', label: '指标值/阈值', type: 'text', width: '100px' },
    {
      key: 'bizFlow', label: '关联业务流程', width: '150px',
      render: (r) => {
        const fk = String(r.flowKey ?? '');
        if (!fk) return <span style={{ color: '#94A3B8' }}>—</span>;
        const f = flows.find((x) => x.id === fk);
        return <span style={{ color: '#1D4ED8', fontWeight: 500 }}>{f?.name ?? fk}</span>;
      },
    },
    { key: 'countdown', label: '时限倒计时', render: (r) => countdownOf(r) },
    { key: 'alert_date', label: '预警时间', type: 'text', width: '100px' },
    {
      key: 'flowState', label: '流程状态', fixed: 'right',
      render: (r) => (
        <FlowStateCell flowId={String(r.flowKey ?? '')} state={String(r.flowState ?? '')}
          matchObj={{ level: r.levelRaw ?? '', alert_type: r.alertTypeRaw ?? '', scene: r.scene ?? '' }}
          onChange={(s) => updateAlerts((list) => list.map((a) => String(a.alert_id) === String(r.id)
            ? { ...a, flowState: s, flowStateAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
            : a))} />
      ),
    },
  ];

  return (
    <DataTable columns={cols} rows={rows} empty="暂无预警记录"
      clickableKey="alert_id"
      onCellClick={(r) => { if (String(r.alert_id) !== '—') onOpen?.(String(r.id)); }}
      actions={(r) => String(r.alert_id) !== '—' ? (
        <button type="button" onClick={() => onOpen?.(String(r.id))}
          style={{ padding: '3px 12px', borderRadius: 6, border: '1px solid #C7D2FE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>查看</button>
      ) : null} />
  );
}

function PhotoBox({ label, src }: { label: string; src?: string }) {
  return (
    <div>
      <div style={{ width: 120, height: 120, borderRadius: 10, border: '1px solid #E5E7EB', overflow: 'hidden', background: '#F8FAFC' }}>
        {src ? (
          <img src={src} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#94A3B8' }}>{label}</div>
        )}
      </div>
      <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, textAlign: 'center' }}>{label}</div>
    </div>
  );
}

function PhotoRow({ c }: { c: MidCustomer }) {
  const items: { label: string; src?: string }[] = [
    { label: '用户照片', src: c.photos?.user },
    { label: '身份证照片', src: c.photos?.idCard },
    { label: '最新照片', src: c.photos?.latest },
  ];
  return (
    <div style={{ display: 'flex', gap: 20, marginBottom: 18 }}>
      {items.map((it) => <PhotoBox key={it.label} label={it.label} src={it.src} />)}
    </div>
  );
}

function ProfileCard({ c }: { c: MidCustomer }) {
  const initial = c.name?.[0] ?? '客';
  const riskBadge: 'red' | 'amber' | 'green' =
    c.riskLevel === '高风险' ? 'red' : c.riskLevel === '中风险' ? 'amber' : 'green';
  return (
    <div>
      {/* 档案头部：身份标识 + 风险/贷款状态（授信/信贷/环境明细见下方专项板块，避免重复展示） */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingBottom: 16, borderBottom: '1px solid #F1F5F9', marginBottom: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: '#1E293B' }}>{c.name}</span>
            <Badge kind={riskBadge}>{c.riskLevel}</Badge>
            <StatusTag kind={c.loanStatus === '在贷' ? 'blue' : 'gray'}>{c.loanStatus}</StatusTag>
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <span>客户号 <b style={{ color: '#475569', fontWeight: 600 }}>{c.custId}</b></span>
            <span>证件号 <b style={{ color: '#475569', fontWeight: 600 }}>{c.idCard}</b></span>
            <span>产品 <b style={{ color: '#475569', fontWeight: 600 }}>{c.product}</b> <Sam label="客户样例" /></span>
          </div>
        </div>
      </div>
      {/* 影像资料（用户/身份证/最新，内联展示，无需点击预览） */}
      <PhotoRow c={c} />
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
function RelationGraph({ cust, colorBy, rings }: { cust: MidCustomer; colorBy: 'type' | 'risk' | 'ring'; rings: { id: number; name: string; risk: string; count: number }[] }) {
  const rels = cust.relations ?? [];
  const W = 560, H = 260, CX = W / 2, CY = H / 2;
  const R = 92;
  if (!rels.length) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无关联实体</div>;
  const pts = rels.map((r, i) => {
    const ang = (Math.PI * 2 * i) / rels.length - Math.PI / 2;
    return { r, x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang) };
  });
  const ringColor = (r: CustRelationNode) =>
    r.ringId ? RING_PALETTE[(r.ringId - 1) % RING_PALETTE.length] : '#94A3B8';
  const nodeColor = (r: CustRelationNode) =>
    colorBy === 'risk' ? (r.riskLevel ? RISK_COLOR[r.riskLevel] : '#94A3B8')
      : colorBy === 'ring' ? ringColor(r)
        : REL_COLOR[r.type];
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
        ) : colorBy === 'risk' ? (
          <>
            {(['高', '中', '低'] as const).map((k) => (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: RISK_COLOR[k], display: 'inline-block' }} />{k}风险
              </span>
            ))}
          </>
        ) : (
          <>
            {rings.map((rg) => (
              <span key={rg.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: RING_PALETTE[(rg.id - 1) % RING_PALETTE.length], display: 'inline-block' }} />{rg.name}
              </span>
            ))}
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#94A3B8', display: 'inline-block' }} />无团伙
            </span>
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

function Timeline({ items }: { items: { time: string; color: string; title: string; sub: string; tag: React.ReactNode; onClick?: () => void }[] }) {
  return (
    <div style={{ position: 'relative', paddingLeft: 18 }}>
      <div style={{ position: 'absolute', left: 5, top: 4, bottom: 4, width: 2, background: '#E2E8F0' }} />
      {items.map((it, i) => (
        <div key={i} style={{ position: 'relative', paddingBottom: 14 }}>
          <span style={{ position: 'absolute', left: -16, top: 4, width: 10, height: 10, borderRadius: '50%', background: it.color, border: '2px solid #fff', boxShadow: '0 0 0 1px #E2E8F0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
            <span
              onClick={it.onClick}
              style={{
                fontSize: 13, fontWeight: 600, color: '#334155',
                cursor: it.onClick ? 'pointer' : 'default',
                ...(it.onClick ? { color: '#1D4ED8', textDecoration: 'underline', textDecorationColor: '#BFDBFE' } : {}),
              }}
            >{it.title}{it.onClick ? ' →' : ''}</span>
            {it.tag}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{it.sub}</div>
          <div style={{ fontSize: 11, color: '#CBD5E1', marginTop: 1 }}>{it.time}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------- 需求11：新增主题区块 ---------- */

/* 收入负债：月收入/月供/DTI/资产负债率（还款能力核心） */
function IncomePanel({ c }: { c: MidCustomer }) {
  const inc = c.income;
  if (!inc) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无收入负债数据</div>;
  const dtiColor = inc.dti >= 60 ? '#DC2626' : inc.dti >= 45 ? '#D97706' : '#059669';
  const lrColor = inc.liabilityRatio >= 60 ? '#DC2626' : inc.liabilityRatio >= 45 ? '#D97706' : '#059669';
  const cards = [
    { label: '月收入', value: `¥${inc.monthIncome.toLocaleString()}`, color: '#1E293B' },
    { label: '月供', value: `¥${inc.monthRepay.toLocaleString()}`, color: '#1E293B' },
    { label: '收入负债比 DTI', value: `${inc.dti}%`, color: dtiColor, hint: inc.dti >= 60 ? '超警戒' : inc.dti >= 45 ? '偏高' : '正常' },
    { label: '资产负债率', value: `${inc.liabilityRatio}%`, color: lrColor, hint: inc.liabilityRatio >= 60 ? '超警戒' : inc.liabilityRatio >= 45 ? '偏高' : '正常' },
  ];
  const verdict = inc.dti >= 60
    ? `月供占月收入 ${inc.dti}%（≥60% 警戒线），叠加总负债 ¥${inc.debtTotal.toLocaleString()}，还款压力大，建议降额/预催。`
    : inc.dti >= 45
      ? `月供占月收入 ${inc.dti}%，负债可控但需关注，建议维持现状并观察。`
      : `月供占月收入 ${inc.dti}%，资产负债率 ${inc.liabilityRatio}%，还款能力良好。`;
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
        {cards.map((crd) => (
          <div key={crd.label} style={{ border: '1px solid #F1F5F9', borderRadius: 12, padding: '12px 14px' }}>
            <div style={{ fontSize: 12, color: '#64748B' }}>{crd.label}</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: crd.color, marginTop: 4 }}>
              {crd.value}
              {crd.hint && <span style={{ fontSize: 11, fontWeight: 500, color: crd.color, marginLeft: 6 }}>{crd.hint}</span>}
            </div>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: '#475569', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 12px', lineHeight: 1.6 }}>
        <b>负债判读：</b>{verdict}
        <span style={{ color: '#94A3B8' }}>（总负债 ¥{inc.debtTotal.toLocaleString()} / 总资产 ¥{inc.assetTotal.toLocaleString()}）</span>
      </div>
    </div>
  );
}

/* 征信：近6月查询 + 信贷账户明细 + 逾期/对外担保 */
function CreditPanel({ c }: { c: MidCustomer }) {
  const cr = c.creditReport;
  if (!cr) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无征信数据</div>;
  const maxQ = Math.max(1, ...cr.queries.map((q) => q.count));
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '260px minmax(0,1fr)', gap: 16 }}>
      {/* 左：近6月征信查询 */}
      <div style={{ border: '1px solid #F1F5F9', borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 10 }}>近 6 月征信查询</div>
        {cr.queries.map((q) => (
          <div key={q.month} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#64748B', width: 52, flexShrink: 0 }}>{q.month}</span>
            <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${(q.count / maxQ) * 100}%`, height: '100%', background: q.count >= 5 ? '#DC2626' : q.count >= 3 ? '#D97706' : '#2563EB', borderRadius: 999 }} />
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, width: 16, textAlign: 'right', color: q.count >= 5 ? '#DC2626' : q.count >= 3 ? '#D97706' : '#2563EB' }}>{q.count}</span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6, lineHeight: 1.6 }}>
          近 6 月合计 <b style={{ color: '#334155' }}>{cr.queries.reduce((s, q) => s + q.count, 0)}</b> 次查询
          {cr.queries.some((q) => q.count >= 5) && <span style={{ color: '#DC2626' }}> · 短期查询频繁，存在多头借贷特征</span>}
        </div>
      </div>
      {/* 右：信贷账户明细 */}
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>信贷账户明细（含本行）</div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#94A3B8', borderBottom: '1px solid #E2E8F0' }}>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>机构</th>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>类型</th>
              <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>授信/额度</th>
              <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>余额</th>
              <th style={{ padding: '6px 8px', fontWeight: 500 }}>状态</th>
            </tr>
          </thead>
          <tbody>
            {cr.accounts.map((a, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '7px 8px', color: '#334155', fontWeight: 600 }}>{a.institution}</td>
                <td style={{ padding: '7px 8px', color: '#334155' }}>{a.type}</td>
                <td style={{ padding: '7px 8px', color: '#334155', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>¥{a.limit.toLocaleString()}</td>
                <td style={{ padding: '7px 8px', color: '#334155', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>¥{a.balance.toLocaleString()}</td>
                <td style={{ padding: '7px 8px' }}>
                  <StatusTag kind={a.status === '逾期' ? 'red' : 'green'}>{a.status}</StatusTag>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* 逾期 + 对外担保 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 12, marginTop: 10 }}>
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>
              逾期记录 {cr.overdues.length ? <span style={{ color: '#DC2626' }}>· {cr.overdues.length} 条</span> : <span style={{ color: '#059669' }}>· 无</span>}
            </div>
            {cr.overdues.length ? cr.overdues.map((o, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px dashed #F1F5F9' }}>
                <span style={{ color: '#334155' }}>{o.date} · {o.institution}</span>
                <span style={{ color: '#DC2626', fontWeight: 600 }}>逾期{o.days}天 ¥{o.amount.toLocaleString()}</span>
              </div>
            )) : <span style={{ fontSize: 12, color: '#94A3B8' }}>近 2 年无逾期记录</span>}
          </div>
          <div style={{ border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 12px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>对外担保 {cr.guaranties.length ? <span style={{ color: '#D97706' }}>· {cr.guaranties.length} 笔</span> : <span>· 无</span>}</div>
            {cr.guaranties.length ? cr.guaranties.map((g, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '4px 0', borderBottom: '1px dashed #F1F5F9' }}>
                <span style={{ color: '#334155' }}>{g.org}</span>
                <span style={{ color: '#475569', fontWeight: 600 }}>担保¥{g.amount.toLocaleString()} / 余额¥{g.remain.toLocaleString()}</span>
              </div>
            )) : <span style={{ fontSize: 12, color: '#94A3B8' }}>无对外担保</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

/* 担保抵押 + 企业经营（经营贷/抵押贷） */
function CollateralBizPanel({ c }: { c: MidCustomer }) {
  const col = c.collaterals ?? [], gua = c.guarantors ?? [], biz = c.business;
  const isEmpty = !col.length && !gua.length && !biz;
  if (isEmpty) return <div style={{ fontSize: 13, color: '#94A3B8' }}>该客户为非经营类产品（{c.product}），无担保抵押与企业经营信息。</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
      <div>
        <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>
          担保抵押 {col.length ? <span style={{ color: '#D97706' }}>· {col.length} 项</span> : '· 无'}
        </div>
        {col.length ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#94A3B8', borderBottom: '1px solid #E2E8F0' }}>
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>类型</th>
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>抵押物</th>
                <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>估值</th>
                <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>抵押率</th>
                <th style={{ padding: '6px 8px', fontWeight: 500 }}>状态</th>
              </tr>
            </thead>
            <tbody>
              {col.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '7px 8px', color: '#334155', fontWeight: 600 }}>{m.type}</td>
                  <td style={{ padding: '7px 8px', color: '#334155' }}>{m.name}</td>
                  <td style={{ padding: '7px 8px', textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>¥{m.valuation.toLocaleString()}</td>
                  <td style={{ padding: '7px 8px', textAlign: 'right', color: m.ratio > 70 ? '#DC2626' : '#059669', fontWeight: 700 }}>{m.ratio}%</td>
                  <td style={{ padding: '7px 8px' }}><StatusTag kind={m.status === '足值' ? 'green' : 'amber'}>{m.status}</StatusTag></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <span style={{ fontSize: 12, color: '#94A3B8' }}>无抵押物</span>}
        {gua.length > 0 && (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', margin: '10px 0 6px' }}>担保人</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {gua.map((g, i) => (
                <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 999, padding: '3px 10px' }}>
                  <span style={{ fontWeight: 600, color: '#334155' }}>{g.name}</span>
                  <span style={{ color: '#94A3B8' }}>{g.relation}</span>
                  <span style={{ color: g.credit.includes('逾期') ? '#DC2626' : '#059669' }}>{g.credit}</span>
                </span>
              ))}
            </div>
          </>
        )}
      </div>
      <div>
        {biz ? (
          <>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#64748B', marginBottom: 8 }}>企业经营信息</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {([
                ['企业名称', biz.companyName],
                ['所属行业', biz.industry],
                ['月营业收入', `¥${biz.monthRevenue.toLocaleString()}`],
                ['月纳税额', `¥${biz.taxMonthly.toLocaleString()}`],
                ['年开票额', `¥${biz.invoiceYear.toLocaleString()}`],
                ['员工人数', `${biz.employees} 人`],
                ['经营年限', `${biz.operateYears} 年`],
                ['对公账户余额', `¥${biz.accountBalance.toLocaleString()}`],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #F1F5F9', fontSize: 12 }}>
                  <span style={{ color: '#94A3B8' }}>{k}</span>
                  <span style={{ color: '#334155', fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 8, fontSize: 11, color: '#94A3B8' }}>月营收与月供比 {Math.round(biz.monthRevenue / Math.max(1, c.income?.monthRepay ?? 1))}x，经营现金流可覆盖月供。</div>
          </>
        ) : <span style={{ fontSize: 12, color: '#94A3B8' }}>无企业经营数据</span>}
      </div>
    </div>
  );
}

/* 贷后风险：资金流向 + 黑名单反欺诈 */
function RiskPanel({ c }: { c: MidCustomer }) {
  const ff = c.fundFlow, bl = c.blacklist;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16 }}>
      <div style={{ border: '1px solid #F1F5F9', borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>资金流向（用途：{ff?.purpose ?? '—'}）</span>
          {ff && (
            <StatusTag kind={ff.riskFlag === '疑似回流' ? 'red' : 'green'}>{ff.riskFlag}</StatusTag>
          )}
        </div>
        {ff && ff.flows.length ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {ff.flows.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px dashed #F1F5F9', fontSize: 12 }}>
                <span style={{ color: '#94A3B8', width: 80, flexShrink: 0 }}>{f.date}</span>
                <span style={{ color: '#334155', flex: 1, fontWeight: 600 }}>{f.to}</span>
                <span style={{ color: '#475569', fontVariantNumeric: 'tabular-nums' }}>¥{f.amount.toLocaleString()}</span>
                <StatusTag kind={f.risk === '疑似回流' ? 'red' : f.risk === '关注' ? 'amber' : 'green'}>{f.risk}</StatusTag>
              </div>
            ))}
          </div>
        ) : <span style={{ fontSize: 12, color: '#94A3B8' }}>暂无资金流向数据</span>}
        <div style={{ marginTop: 8, fontSize: 11, color: '#94A3B8' }}>监控放款资金去向与回流情况，疑似回流将触发贷后预警。</div>
      </div>
      <div style={{ border: '1px solid #F1F5F9', borderRadius: 12, padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>黑名单与反欺诈</span>
          {bl && <span style={{ fontSize: 12, fontWeight: 700, color: bl.riskScore >= 70 ? '#DC2626' : bl.riskScore >= 40 ? '#D97706' : '#059669' }}>欺诈风险分 {bl.riskScore}</span>}
        </div>
        {bl && bl.hits.length ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {bl.hits.map((hd, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px dashed #F1F5F9', fontSize: 12 }}>
                <Badge kind="red">{hd.list}</Badge>
                <span style={{ color: '#334155', flex: 1 }}>{hd.matched}</span>
                <span style={{ color: '#94A3B8' }}>{hd.date}</span>
                <span style={{ color: '#DC2626', fontWeight: 700 }}>{hd.score}</span>
              </div>
            ))}
          </div>
        ) : <span style={{ fontSize: 12, color: '#059669' }}>未命中任何黑名单</span>}
        {bl && bl.fraudTags.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {bl.fraudTags.map((t, i) => (
              <span key={i} style={{ fontSize: 11, color: '#B45309', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 999, padding: '2px 8px' }}>{t}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* 综合审核决策建议：跨三模型 + 预警 + 收入负债 + 征信，合成建议 + 需核实红旗 + 同客群对标 */
function DecisionChip({ label, v, c }: { label: string; v: string; c: string }) {
  return (
    <div style={{ background: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '8px 12px', minWidth: 120 }}>
      <div style={{ fontSize: 11, color: '#94A3B8' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: c, marginTop: 2 }}>{v}</div>
    </div>
  );
}
function DecisionBasis({ label, v, danger }: { label: string; v: string; danger?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', padding: '8px 0', fontSize: 13 }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <b style={{ color: danger ? '#DC2626' : '#1E293B' }}>{v}</b>
    </div>
  );
}
function DecisionPanel({ cust, custAlerts }: { cust: MidCustomer; custAlerts: Row[] }) {
  const s = cust.scores!;
  const zc = s.zhicha.score, zx = s.zhixin.score, zr = s.zhirong.score;
  const band = (sc: number, danger: boolean) => {
    if (danger) return sc >= 70 ? '高' : sc >= 40 ? '中' : '低';
    if (sc >= 780) return 'A'; if (sc >= 660) return 'B'; if (sc >= 580) return 'C'; return 'D';
  };
  const fraudBand = band(zc, true), creditBand = band(zx, false), compBand = band(zr, false);
  const storeRed = custAlerts.filter((r) => (r as any).levelRaw === 'RED' && !['已解除', '误报'].includes(String((r as any).status))).length;
  const storeYellow = custAlerts.filter((r) => (r as any).levelRaw === 'YELLOW' && !['已解除', '误报'].includes(String((r as any).status))).length;
  const custRed = cust.alerts.filter((a) => a.level === 'RED' && !['已解除', '误报'].includes(a.status)).length;
  const custYellow = cust.alerts.filter((a) => a.level === 'YELLOW' && !['已解除', '误报'].includes(a.status)).length;
  const openRed = storeRed + custRed, openYellow = storeYellow + custYellow;
  const dti = cust.income?.dti ?? 0;
  const overdues = cust.creditReport?.overdues?.length ?? 0;
  const fraudHigh = fraudBand === '高', creditD = creditBand === 'D', compC = compBand === 'C';
  let advice: { t: string; c: string };
  if (fraudHigh || creditD || openRed > 0) advice = { t: '建议拒绝 / 转人工核查（高危）', c: '#DC2626' };
  else if (compC || openYellow > 0 || dti > 50) advice = { t: '建议审慎授信并加强监测', c: '#D97706' };
  else advice = { t: '建议正常准入', c: '#16A34A' };
  const flags: { t: string; on: boolean }[] = [
    { t: `欺诈分高危：智察分 ${zc}（≥70）`, on: fraudHigh },
    { t: `信用分落入 D 档：智信分 ${zx}`, on: creditD },
    { t: `未解除 RED 预警 ${openRed} 条`, on: openRed > 0 },
    { t: `收入负债比 DTI ${dti}%（>50 偏高）`, on: dti > 50 },
    { t: `征信逾期 ${overdues} 次`, on: overdues > 0 },
  ];
  const last = cust.scoreHistory[cust.scoreHistory.length - 1];
  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', background: advice.c + '14', border: '1px solid ' + advice.c + '44', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>综合审核建议</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: advice.c }}>{advice.t}</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <DecisionChip label="智察分" v={`${zc}（${fraudBand}）`} c={fraudHigh ? '#DC2626' : '#059669'} />
          <DecisionChip label="智信分" v={`${zx}（${creditBand}）`} c={creditD ? '#DC2626' : creditBand === 'C' ? '#D97706' : '#16A34A'} />
          <DecisionChip label="智融分" v={`${zr}（${compBand}）`} c={creditD ? '#DC2626' : compC ? '#D97706' : '#16A34A'} />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>决策依据</div>
          <div className="space-y-0">
            <DecisionBasis label="三模型评级" v={`欺诈 ${fraudBand} · 信用 ${creditBand} · 综合 ${compBand}`} />
            <DecisionBasis label="预警情况" v={`未解除 RED ${openRed} 条 / YELLOW ${openYellow} 条`} danger={openRed > 0} />
            <DecisionBasis label="收入负债比 DTI" v={`${dti}%`} danger={dti > 50} />
            <DecisionBasis label="征信逾期" v={`${overdues} 次`} danger={overdues > 0} />
            <DecisionBasis label="建议额度" v={`¥${(s.limit ?? 0).toLocaleString()}`} />
          </div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>需重点核实（红旗）</div>
          <div className="space-y-2">
            {flags.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: f.on ? '#DC2626' : '#CBD5E1', flexShrink: 0 }} />
                <span style={{ color: f.on ? '#DC2626' : '#64748B' }}>{f.on ? f.t : f.t + '（未触发）'}</span>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 10, lineHeight: 1.7 }}>
            同客群对标：本客智融分 {zr}，同客群近 6 月均值约 720；行为分 {last?.score ?? '—'} vs 客群 {last?.cohortAvg ?? '—'}。
          </div>
        </div>
      </div>
    </div>
  );
}

/* 需求11审核：外部数据核验（工商/司法/税务/社保） */
function ExternalCheckPanel({ rows }: { rows: CustExternalCheck[] }) {
  const STAT_COLOR: Record<string, 'red' | 'amber' | 'green'> = { 异常: 'red', 关注: 'amber', 正常: 'green' };
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
      <thead>
        <tr style={{ textAlign: 'left', color: '#94A3B8', fontSize: 12, borderBottom: '1px solid #E2E8F0' }}>
          <th style={{ padding: '8px 10px', fontWeight: 500 }}>核验源</th>
          <th style={{ padding: '8px 10px', fontWeight: 500 }}>核验项</th>
          <th style={{ padding: '8px 10px', fontWeight: 500 }}>核验结果</th>
          <th style={{ padding: '8px 10px', fontWeight: 500 }}>状态</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
            <td style={{ padding: '10px', fontWeight: 600, color: '#334155' }}>{r.category}</td>
            <td style={{ padding: '10px', color: '#334155' }}>{r.item}</td>
            <td style={{ padding: '10px', color: '#334155' }}>{r.result}</td>
            <td style={{ padding: '10px' }}><StatusTag kind={STAT_COLOR[r.status] ?? 'gray'}>{r.status}</StatusTag></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/* ============ 需求17-缺口2：设备与欺诈维度 ============ */
function DevicePanel({ d, env, onOpenCust }: { d: DeviceProfile; env?: { device?: string; region?: string; network?: string; lastLogin?: string; city?: string }; onOpenCust: (custId: string) => void }) {
  const cell = (label: string, value: React.ReactNode, danger = false) => (
    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 11, color: '#94A3B8' }}>{label}</div>
      <div style={{ fontSize: 14, fontWeight: 700, color: danger ? '#DC2626' : '#1E293B', marginTop: 2 }}>{value}</div>
    </div>
  );
  const flag = (on: boolean, yes: string, no: string) => (on ? <span style={{ color: '#DC2626' }}>{yes}</span> : <span style={{ color: '#059669' }}>{no}</span>);
  const others = d.accounts.filter((a) => a.custId !== d.custId);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: '#1E293B' }}>{d.deviceId}</span>
        <Badge kind={GAP_LEVEL_KIND[d.risk]}>{d.risk}风险设备</Badge>
        <span style={{ fontSize: 12, color: '#64748B' }}>{d.model} ｜ {d.os}</span>
      </div>
      {env && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 10 }}>
          {cell('常用设备', env.device || '—')}
          {cell('登录地区', env.region || '—')}
          {cell('网络环境', env.network || '—')}
          {cell('最近登录', env.lastLogin || '—')}
          {cell('定位城市', env.city || '—')}
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 10 }}>
        {cell('环境风险分', `${d.envScore} / 100`, d.envScore >= 70)}
        {cell('指纹一致性', `${d.fingerprintMatch}%`, d.fingerprintMatch < 80)}
        {cell('模拟器', flag(d.emulator, '是（高危）', '否'))}
        {cell('越狱 / root', flag(d.rooted, '是（高危）', '否'))}
        {cell('群控识别', flag(d.groupControl, '命中群控', '未命中'))}
        {cell('IP 归属地', d.ipCity)}
        {cell('GPS 定位', d.gpsCity, d.ipCity !== d.gpsCity)}
        {cell('同设备账号', `${d.accounts.length} 个`, d.accounts.length > 1)}
      </div>
      {d.ipCity !== d.gpsCity && (
        <div style={{ fontSize: 12, color: '#B45309', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 10px', marginBottom: 10 }}>
          ⚠ IP 归属（{d.ipCity}）与 GPS 定位（{d.gpsCity}）不一致，存在代操作 / 位置伪造嫌疑。
        </div>
      )}
      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>同设备多账号（{d.accounts.length}）</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#94A3B8', borderBottom: '1px solid #E2E8F0' }}>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>客户号</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>姓名</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>最近使用</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>账户状态</th>
          </tr>
        </thead>
        <tbody>
          {d.accounts.map((a) => (
            <tr key={a.custId} style={{ borderBottom: '1px solid #F1F5F9', background: a.custId === d.custId ? '#EFF6FF' : undefined }}>
              <td style={{ padding: '7px 8px', color: '#1D4ED8', cursor: 'pointer' }} onClick={() => onOpenCust(a.custId)}>{a.custId}</td>
              <td style={{ padding: '7px 8px', color: '#334155' }}>{a.name}{a.custId === d.custId ? '（本人）' : ''}</td>
              <td style={{ padding: '7px 8px', color: '#64748B' }}>{a.lastUse}</td>
              <td style={{ padding: '7px 8px' }}>
                <StatusTag kind={a.status === '逾期' || a.status === '核销' ? 'red' : a.status === '已拒绝' ? 'gray' : 'green'}>{a.status}</StatusTag>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {others.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: '#B91C1C' }}>
          该设备除本人外还关联 <b>{others.length}</b> 个账号，建议核实是否为代办 / 团伙申请。
        </div>
      )}
    </div>
  );
}

/* ============ 需求17-缺口1：多头共债 ============ */
function CoDebtPanel({ c }: { c: CoDebtProfile }) {
  const cell = (label: string, value: React.ReactNode, danger = false) => (
    <div style={{ background: '#F8FAFC', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 11, color: '#94A3B8' }}>{label}</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: danger ? '#DC2626' : '#1E293B', marginTop: 2 }}>{value}</div>
    </div>
  );
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <Badge kind={GAP_LEVEL_KIND[c.level]}>{c.level}共债风险</Badge>
        <span style={{ fontSize: 12, color: '#64748B' }}>数据口径：近 30 天跨机构申请与在贷</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 10, marginBottom: 12 }}>
        {cell('申请机构数', `${c.orgCnt30d} 家`, c.orgCnt30d >= 5)}
        {cell('申请次数', `${c.applyCnt30d} 次`, c.applyCnt30d >= 8)}
        {cell('多头在贷余额', `¥${c.totalBalance.toLocaleString()}`, c.totalBalance >= 300000)}
        {cell('同设备申请', `${c.sameDeviceApply} 次`, c.sameDeviceApply > 0)}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>共债链条</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6, marginBottom: 12 }}>
        {c.chain.map((n, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, padding: '4px 10px', borderRadius: 8, background: i === 0 ? '#2563EB' : '#EEF2FF', color: i === 0 ? '#fff' : '#3730A3', fontWeight: 600 }}>{n}</span>
            {i < c.chain.length - 1 && <span style={{ color: '#CBD5E1' }}>→</span>}
          </span>
        ))}
      </div>

      <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 }}>共债机构清单（{c.orgs.length}）</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ textAlign: 'left', color: '#94A3B8', borderBottom: '1px solid #E2E8F0' }}>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>机构</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>类型</th>
            <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>在贷余额</th>
            <th style={{ padding: '6px 8px', fontWeight: 500, textAlign: 'right' }}>近30天申请</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>同设备</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>名单命中</th>
            <th style={{ padding: '6px 8px', fontWeight: 500 }}>状态</th>
          </tr>
        </thead>
        <tbody>
          {c.orgs.map((o) => (
            <tr key={o.org} style={{ borderBottom: '1px solid #F1F5F9' }}>
              <td style={{ padding: '7px 8px', fontWeight: 600, color: '#334155' }}>{o.org}</td>
              <td style={{ padding: '7px 8px', color: '#64748B' }}>{o.orgType}</td>
              <td style={{ padding: '7px 8px', textAlign: 'right', color: '#334155', fontVariantNumeric: 'tabular-nums' }}>¥{o.balance.toLocaleString()}</td>
              <td style={{ padding: '7px 8px', textAlign: 'right', color: '#334155' }}>{o.applyCnt30d}</td>
              <td style={{ padding: '7px 8px', color: o.sameDevice ? '#DC2626' : '#94A3B8' }}>{o.sameDevice ? '是' : '—'}</td>
              <td style={{ padding: '7px 8px' }}>{o.listHit ? <Badge kind={o.listHit === '黑名单' ? 'red' : o.listHit === '灰名单' ? 'amber' : 'blue'}>{o.listHit}</Badge> : <span style={{ color: '#94A3B8' }}>—</span>}</td>
              <td style={{ padding: '7px 8px' }}><StatusTag kind={o.status === '逾期' ? 'red' : o.status === '关注' ? 'amber' : 'green'}>{o.status}</StatusTag></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ============ 需求17-缺口1：名单网络视图（客户 · 借款机构 · 名单库 连成网） ============ */
function ListNetworkGraph({ cust, co, dev }: { cust: MidCustomer; co: CoDebtProfile | null; dev: DeviceProfile | null }) {
  if (!co) return <div style={{ fontSize: 13, color: '#94A3B8' }}>暂无跨机构名单数据</div>;
  const W = 560, H = 300, CX = W / 2, CY = H / 2, R = 105;
  const orgs = co.orgs.slice(0, 8);
  const pts = orgs.map((o, i) => {
    const ang = (Math.PI * 2 * i) / orgs.length - Math.PI / 2;
    return { o, x: CX + R * Math.cos(ang), y: CY + R * Math.sin(ang) };
  });
  // 常一起出现的机构（同设备申请 or 命中同一名单库）自动高亮
  const hi = new Set(orgs.filter((o) => o.sameDevice || o.listHit).map((o) => o.org));
  const listColor = (t?: string) => (t === '黑名单' ? '#DC2626' : t === '灰名单' ? '#D97706' : t === '关注名单' ? '#2563EB' : '#94A3B8');
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: W }}>
        {pts.map(({ o, x, y }) => (
          <line key={'l' + o.org} x1={CX} y1={CY} x2={x} y2={y}
            stroke={hi.has(o.org) ? listColor(o.listHit) : '#CBD5E1'}
            strokeWidth={hi.has(o.org) ? 2 : 1}
            strokeDasharray={o.sameDevice ? '5 3' : undefined} />
        ))}
        <circle cx={CX} cy={CY} r={36} fill="#2563EB" />
        <text x={CX} y={CY - 3} textAnchor="middle" fontSize="13" fontWeight="700" fill="#fff">{cust.name}</text>
        <text x={CX} y={CY + 13} textAnchor="middle" fontSize="10" fill="#DBEAFE">{co.orgCnt30d} 家机构</text>
        {pts.map(({ o, x, y }) => {
          const c = listColor(o.listHit);
          const on = hi.has(o.org);
          return (
            <g key={o.org}>
              <circle cx={x} cy={y} r={26} fill={c} fillOpacity={on ? 0.14 : 0.06} stroke={on ? c : '#CBD5E1'} strokeWidth={on ? 2 : 1.2} />
              <text x={x} y={y - 1} textAnchor="middle" fontSize="10" fontWeight="600" fill={on ? c : '#64748B'}>
                {o.org.replace('××', '').slice(0, 5)}
              </text>
              <text x={x} y={y + 12} textAnchor="middle" fontSize="9" fill="#94A3B8">{o.orgType}</text>
              {o.listHit && (
                <g>
                  <circle cx={x + 22} cy={y - 22} r={9} fill={c} stroke="#fff" strokeWidth={1.5} />
                  <text x={x + 22} y={y - 18.5} textAnchor="middle" fontSize="9" fontWeight="700" fill="#fff">名</text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#64748B', marginTop: 4, flexWrap: 'wrap', justifyContent: 'center' }}>
        {['黑名单', '灰名单', '关注名单'].map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: listColor(t), display: 'inline-block' }} />{t}命中
          </span>
        ))}
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 16, height: 0, borderTop: '2px dashed #94A3B8', display: 'inline-block' }} />同设备申请
        </span>
        {dev && <span>设备 {dev.deviceId} ｜ 同设备账号 {dev.accounts.length} 个</span>}
      </div>
    </div>
  );
}
