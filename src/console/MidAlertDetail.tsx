// 预警详情（使用域）— 需求9/10 重构 + 需求17/18/23 增强：
//  ① 与其他页面同一套架构：顶部 FlowActionBar（流程状态条 + 操作按钮，按 flowKey/flowState 关联 bizFlows 预警处置流程）
//  ② 数据读 midAlerts.json 橘（样例）+ midCustomers.json（客户摘要 需求17：按 custId 匹配，按钮移入摘要区块）；策略样例 橘
//  ③ 处置记录（需求18）：读 midDisposeTasks.json 关联工单 + 流程按钮点击写操作日志（谁/何时/做了什么/状态变化）
//  ④ 需求23：预警信息下方新增「原始数据与规则详情」区块（命中规则、指标口径、原始数据明细）
//  ⑤ 单客视图入口：从预警详情点「查看单客视图」进入客户 360 档案（以客户为中心看全局）
import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, Badge, DetailHeader } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidAlerts, useMidCustomers, useMidDisposeTasks, updateAlerts, updateDisposeTasks } from './midStore';
import { LEVEL_META, type MidAlert } from './midData';
import { matchFlowGraph, useFlows, flowStepOf } from './flowStore';
import FlowActionBar from './FlowActionBar';

export default function MidAlertDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const alerts = useMidAlerts();
  const customers = useMidCustomers();
  const disposeTasks = useMidDisposeTasks();
  const flows = useFlows();
  const nav = useNavigate();
  const [, setLogTick] = useState(0); // 操作日志写入后强制刷新

  const a = useMemo(() => alerts.find((x) => x.alert_id === id) ?? null, [alerts, id]);

  if (!a) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell header={<DetailHeader title="预警详情" crumb="贷中监控 / 预警处置" backLabel="返回队列" onBack={() => nav('/console/cr/mid-alert-workbench')} />} />
        <div style={{ padding: 24, color: '#94A3B8', fontSize: 13 }}>未找到该预警（{id}）。</div>
      </div>
    );
  }

  // 需求17：客户档案按 custId 匹配（MidCustomer.custId），不再用错误的 cust_id 字段
  const cust = customers.find((c) => c.custId === a.cust_id);
  // 需求18：关联处置记录（工单）——按 custId + alertId 关联
  const linkedTasks = disposeTasks.filter((t) => t.alertId === a.alert_id);
  // 需求18：操作日志（本预警的流程操作记录，写在 midDisposeTasks 对应工单 logs 或本预警派生记录）
  const alertLogs = linkedTasks.flatMap((t) => (t.logs ?? []).map((l) => ({ ...l, taskId: t.id, action: t.action })));

  // 需求18：流程按钮点击 → 记录操作日志（谁/何时/做了什么/状态变化）
  const recordLog = (from: string, to: string) => {
    const who = '系统管理员';
    const now = new Date().toISOString().slice(0, 16).replace('T', ' ');
    updateAlerts((list) => list.map((x) => x.alert_id === a.alert_id
      ? { ...x, flowState: to, flowStateAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
      : x));
    // 找到该预警关联的第一个工单写日志；无工单则新建一条处置记录
    const task = disposeTasks.find((t) => t.alertId === a.alert_id);
    const log = { time: now, who, what: `流程状态流转：${from} → ${to}` };
    if (task) {
      updateDisposeTasks((list) => list.map((t) => t.id === task.id
        ? { ...t, status: to === '已结案' ? '已解除' : '处置中', updatedAt: now, logs: [...(t.logs ?? []), log] }
        : t));
    } else {
      updateDisposeTasks((list) => [...list, {
        id: `DP${a.alert_id}`, alertId: a.alert_id, custId: a.cust_id, custName: a.cust_name,
        action: to, targetSystem: '预警处置', needApprove: false, assignTo: '风控专员',
        status: to === '已结案' ? '已解除' : '处置中', operator: who, updatedAt: now, logs: [log],
      }]);
    }
    setLogTick((x) => x + 1);
  };

  // 需求16：匹配到的具体流程名（展示用；节点时限标签已下沉到 FlowActionBar 流程卡片末尾）
  const { name: flowName } = matchFlowGraph(
    flows.find((x) => x.id === a.flowKey), { level: a.level, alert_type: a.alert_type ?? '', scene: a.scene ?? '' },
  );

  return (
    <div style={{ padding: 24, maxWidth: 1120 }}>
      <PageShell header={<DetailHeader title={`预警详情 · ${a.alert_id}`} crumb="贷中监控 / 预警处置" subtitle={`${a.cust_name} · ${a.alert_type}`}
        backLabel="返回队列" onBack={() => nav('/console/cr/mid-alert-workbench')}
        actions={<>
          <Sam label="预警样例" value="midAlerts.json" />
          <Sam label="客户样例" value="midCustomers.json" />
          <Cal label="实时统计" />
        </>} />} />

      {/* 业务流程操作条（需求9/16：按类型+等级匹配具体流程；需求18：点击写操作日志） */}
      <div style={{ marginBottom: 16 }}>
        <FlowActionBar
          flowId={a.flowKey}
          state={a.flowState}
          matchObj={{ level: a.level, alert_type: a.alert_type ?? '', scene: a.scene ?? '' }}
          onStateChange={(s) => recordLog(a.flowState ?? '', s)}
        />
      </div>

      {/* 需求17：客户摘要（按 custId 匹配；「查看单客视图」按钮移入本区块）——第一位 */}
      <Panel className="mb-4" title="客户摘要" desc={cust ? <span>以客户为中心看全局 · <Sam label="样例" /> 客户号 {cust.custId}</span> : '该客户暂无档案（midCustomers.json）'}
        actions={cust ? <Button size="sm" variant="ghost" onClick={() => nav(`/console/cr/mid-cust-detail?cust=${cust.custId}&id=${a.alert_id}`)}>查看单客视图 →</Button> : undefined}>
        {cust ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '6px 16px', fontSize: 13 }}>
            {([
              ['客户', `${cust.name}（${cust.idCard}）`],
              ['产品', cust.product],
              ['授信额度', cust.creditLine ? `¥${cust.creditLine.toLocaleString()}` : '—'],
              ['在贷余额', cust.loanBalance ? `¥${cust.loanBalance.toLocaleString()}` : '—'],
              ['贷款状态', cust.loanStatus],
              ['风险等级', cust.riskLevel],
              ['历史预警', `${cust.alerts?.length ?? 0} 条`],
              ['历史处置', `${cust.disposes?.length ?? 0} 条`],
            ] as [string, string][]).map(([k, v]) => (
              <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ color: '#94A3B8', fontSize: 11 }}>{k}</span>
                <span style={{ color: '#334155', fontWeight: 600, fontSize: 13 }}>{v}</span>
              </div>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: '#94A3B8' }}>无客户档案（midCustomers.json）</span>
        )}
      </Panel>

      {/* 预警信息（需求23：仅基本信息，原始数据/规则详情在下方独立区块） */}
      <Panel className="mb-4" title="预警信息" desc={<>触发场景：<b>{a.scene}</b> · <Cal label="实时" /> 指标值 {a.metric_value} / 阈值 {a.threshold}</>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: '6px 16px', fontSize: 13 }}>
          {([
            ['预警ID', a.alert_id],
            ['客户', a.cust_name],
            ['预警类型', a.alert_type ?? '—'],
            ['等级', LEVEL_META[a.level].label],
            ['预警时间', a.alert_date],
            ['命中规则', a.rule_name],
            ['指标值 / 阈值', `${a.metric_value} / ${a.threshold}`],
            ['流程状态', a.flowState ?? '—'],
            ['匹配流程', flowName || '—'],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
              <span style={{ color: '#94A3B8' }}>{k}</span>
              <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge kind={LEVEL_META[a.level].badge}>{LEVEL_META[a.level].label}</Badge>
        </div>
      </Panel>

      {/* 需求23：原始数据与规则详情（导致预警的原始数据 + 命中规则详情） */}
      <RawDataPanel a={a} />

      {/* 需求18：处置记录（原「处置工单」改名；含流程操作日志） */}
      <Panel className="mb-4" title="处置记录" desc={<span><Sam label="读取" value="midDisposeTasks.json" /> 流程按钮操作 + 关联处置工单</span>}>
        {alertLogs.length || linkedTasks.length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {/* 操作日志时间线 */}
            {alertLogs.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {alertLogs.slice().reverse().map((l, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px' }}>
                    <span style={{ color: '#1D4ED8', fontWeight: 600, whiteSpace: 'nowrap' }}>{l.who}</span>
                    <span style={{ color: '#334155', flex: 1 }}>{l.what}</span>
                    <span style={{ color: '#94A3B8', whiteSpace: 'nowrap' }}>{l.time}</span>
                  </div>
                ))}
              </div>
            )}
            {/* 关联处置工单 */}
            {linkedTasks.map((t) => (
              <button key={t.id} type="button" onClick={() => nav('/console/cr/mid-dispose-detail?id=' + t.id)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #DBEAFE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer', textAlign: 'left' }}>
                工单 {t.id} · {t.action} · {t.status} · 分派 {t.assignTo} →
              </button>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: '#94A3B8' }}>尚无处置记录——在流程操作条点击操作按钮后自动记录（谁/何时/状态变化）。</span>
        )}
      </Panel>
    </div>
  );
}

/* 需求23：原始数据与规则详情——展示导致预警的原始数据明细 + 命中规则 */
function RawDataPanel({ a }: { a: MidAlert }) {
  // 命中规则详情（按预警类型映射到规则库口径，样例）
  const ruleDetail = ruleDetailOf(a);
  // 原始数据明细（根据规则构造触发的原始记录样例）
  const rawRows = rawRowsOf(a);
  return (
    <Panel className="mb-4" title="原始数据与规则详情" desc={<span><Cal label="派生展示" /> 导致本次预警的原始数据与命中规则</span>}>
      {/* 规则详情 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 16px', fontSize: 13, marginBottom: 12 }}>
        {([
          ['规则名称', a.rule_name],
          ['规则类型', ruleDetail.kind],
          ['触发条件', ruleDetail.cond],
          ['统计口径', ruleDetail.calc],
          ['判定结果', `${a.metric_value} ${ruleDetail.op} ${a.threshold} → 命中`],
          ['适用产品', ruleDetail.scope],
        ] as [string, string][]).map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
            <span style={{ color: '#94A3B8' }}>{k}</span>
            <span style={{ color: '#334155', fontWeight: 500, textAlign: 'right', maxWidth: '70%' }}>{v}</span>
          </div>
        ))}
      </div>
      {/* 原始数据明细表 */}
      <div style={{ fontSize: 12, fontWeight: 600, color: '#374151', marginBottom: 6 }}>原始数据明细（{rawRows.length} 条）</div>
      {rawRows.length > 0 && (
        <div style={{ overflowX: 'auto', border: '1px solid #E2E8F0', borderRadius: 8 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead><tr style={{ background: '#F8FAFC' }}>
              {Object.keys(rawRows[0]).map((h) => <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#64748B', borderBottom: '1px solid #E2E8F0', whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {rawRows.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  {Object.values(r).map((v, j) => <td key={j} style={{ padding: '6px 10px', color: '#334155', whiteSpace: 'nowrap' }}>{String(v)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panel>
  );
}

/* 按预警类型返回规则详情（口径/条件/运算符，样例映射） */
function ruleDetailOf(a: MidAlert): { kind: string; cond: string; calc: string; op: string; scope: string } {
  const M: Record<string, { kind: string; cond: string; calc: string; op: string; scope: string }> = {
    负债激增: { kind: '负债类', cond: '近30天新增贷款笔数 ≥ 阈值', calc: 'sum(近30天放款笔数) 按客户汇总', op: '≥', scope: '信用贷/消费贷' },
    多头借贷: { kind: '多头类', cond: '近7天征信查询次数 ≥ 阈值', calc: 'count(征信查询记录) 近7天', op: '≥', scope: '全部' },
    逾期预警: { kind: '还款类', cond: '还款日临近且还款账户余额不足', calc: '还款账户余额 - 应还金额 < 0', op: '=', scope: '全部' },
    司法涉诉: { kind: '司法类', cond: '新增被执行/开庭记录', calc: 'count(司法记录) 近90天', op: '>', scope: '经营贷/抵押贷' },
    关联企业风险: { kind: '关联类', cond: '关联企业经营异常/担保逾期', calc: 'max(关联企业风险标记)', op: '=', scope: '经营贷' },
    设备异常: { kind: '欺诈类', cond: '7日内更换设备次数 ≥ 阈值', calc: 'count(设备ID变更) 近7天', op: '≥', scope: '全部' },
    反欺诈命中: { kind: '欺诈类', cond: '命中黑名单手机号/身份证', calc: '黑名单匹配标记', op: '=', scope: '全部' },
    行为评分下降: { kind: '行为类', cond: '行为分单日降幅 ≥ 阈值', calc: '(昨日分 - 今日分) / 昨日分', op: '≥', scope: '全部' },
    还款能力不足: { kind: '还款类', cond: '月供/月收入 ≥ 阈值', calc: '月供金额 / 月收入', op: '≥', scope: '信用贷' },
    回访失联: { kind: '催收类', cond: '回访失联次数 ≥ 阈值', calc: 'count(回访失败记录) 近30天', op: '≥', scope: '全部' },
    舆情负面: { kind: '舆情类', cond: '涉借贷纠纷负面舆情条数 ≥ 阈值', calc: 'count(舆情命中) 近30天', op: '≥', scope: '全部' },
    提额机会: { kind: '机会类', cond: '额度使用率>80% 且履约良好', calc: '在贷余额 / 授信额度', op: '>', scope: '信用贷' },
    需求上升: { kind: '机会类', cond: '近期借款需求/活跃度上升', calc: '借款申请量环比', op: '>', scope: '存量客群' },
  };
  return M[a.alert_type] ?? { kind: '通用', cond: '指标值达到阈值', calc: '实时计算', op: '≥', scope: '全部' };
}

/* 按预警类型构造触发预警的原始数据明细（样例） */
function rawRowsOf(a: MidAlert): Record<string, string | number>[] {
  const t = a.alert_type;
  const rows: Record<string, string | number>[] = [];
  if (t === '负债激增' || t === '多头借贷') {
    for (let i = 1; i <= Math.min(a.metric_value, 5); i++) {
      rows.push({ 序号: i, 放款日期: `2026-07-${String(10 + i).padStart(2, '0')}`, 贷款机构: ['A银行', 'B消费金融', 'C小贷', 'D平台贷', 'E消金'][i - 1], '金额(元)': (5000 + i * 3000).toLocaleString(), 征信查询: '人行征信' });
    }
  } else if (t === '逾期预警' || t === '还款能力不足') {
    rows.push({ 应还日期: '2026-08-10', '应还金额(元)': '6,800', '账户余额(元)': '1,200', '缺口(元)': '5,600', '月收入(元)': '9,500', '月供(元)': '6,800', '月供/收入': '72%' });
  } else if (t === '司法涉诉') {
    rows.push({ 类型: '被执行记录', 案号: `（2026）浙0102执${1000 + a.metric_value}号`, '执行标的(元)': '85,000', 立案日期: '2026-08-05', 法院: '杭州市西湖区法院' });
  } else if (t === '设备异常' || t === '反欺诈命中') {
    rows.push({ 设备ID: 'IMEI-86' + String(10000000 + a.metric_value), 设备变化: '新增设备', 登录时间: '2026-08-08 23:41', IP: '223.104.' + a.metric_value + '.18', 命中标记: a.alert_type === '反欺诈命中' ? '黑名单手机号' : '深夜异常' });
  } else if (t === '行为评分下降') {
    rows.push({ 日期: '2026-08-07', 行为分: '38', 前日分: '56', 降幅: '32%', 触发因子: '夜间登录+大额转账' });
  } else if (t === '回访失联') {
    for (let i = 1; i <= Math.min(a.metric_value, 4); i++) rows.push({ 回访日期: `2026-08-0${i}`, 方式: '电话', 结果: '未接通', 联系人: a.cust_name, 备注: '第' + i + '次失联' });
  } else if (t === '关联企业风险') {
    rows.push({ 企业名称: '杭州' + a.cust_name.slice(0, 1) + '商贸有限公司', 关联关系: '法人', 异常类型: '经营异常', 风险等级: '高危', 更新日期: '2026-08-06' });
  } else if (t === '舆情负面') {
    rows.push({ 来源: '企查查/裁判文书', 舆情内容: '涉民间借贷纠纷', 条数: a.metric_value, 日期: '2026-08-06', 风险等级: '中' });
  } else if (t === '提额机会' || t === '需求上升') {
    rows.push({ '授信额度(元)': '80,000', '当前余额(元)': '42,000', 额度使用率: '53%', 近90天还款: '正常', 活跃度: '提升' });
  } else {
    rows.push({ 指标: a.rule_name, 当前值: a.metric_value, 阈值: a.threshold, 数据来源: '实时计算' });
  }
  return rows;
}
