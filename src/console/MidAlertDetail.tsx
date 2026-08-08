// 预警详情（使用域）— 需求9/10 重构：
//  ① 与其他页面同一套架构：顶部 FlowActionBar（流程状态条 + 操作按钮，按 flowKey/flowState 关联 bizFlows 预警处置流程）
//  ② 数据读 midAlerts.json 橘（样例）+ midCustomers.json（客户摘要）；策略样例 橘
//  ③ 单客视图入口：从预警详情点「查看单客视图」进入客户 360 档案（以客户为中心看全局）
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, Badge, DetailHeader } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidAlerts, useMidCustomers, useMidDisposeTasks, updateAlerts } from './midStore';
import { LEVEL_META, type MidAlert } from './midData';
import FlowActionBar from './FlowActionBar';

export default function MidAlertDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const alerts = useMidAlerts();
  const customers = useMidCustomers();
  const disposeTasks = useMidDisposeTasks();
  const nav = useNavigate();

  const a = useMemo(() => alerts.find((x) => x.alert_id === id) ?? null, [alerts, id]);

  if (!a) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell header={<DetailHeader title="预警详情" crumb="贷中监控 / 预警处置" backLabel="返回队列" onBack={() => nav('/console/cr/mid-alert-workbench')} />} />
        <div style={{ padding: 24, color: '#94A3B8', fontSize: 13 }}>未找到该预警（{id}）。</div>
      </div>
    );
  }

  const cust = customers.find((c) => c.cust_id === a.cust_id);
  const linkedTasks = disposeTasks.filter((t) => t.alertId === a.alert_id);

  return (
    <div style={{ padding: 24, maxWidth: 1080 }}>
      <PageShell header={<DetailHeader title={`预警详情 · ${a.alert_id}`} crumb="贷中监控 / 预警处置" subtitle={`${a.cust_name} · ${a.alert_type}`}
        backLabel="返回队列" onBack={() => nav('/console/cr/mid-alert-workbench')}
        actions={<>
          <Sam label="预警样例" value="midAlerts.json" />
          <Sam label="客户样例" value="midCustomers.json" />
          <Cal label="实时统计" />
        </>} />} />

      {/* 业务流程操作条（需求9：与监控任务/页面配置同一套 FlowActionBar） */}
      <FlowActionBar
        flowId={a.flowKey}
        state={a.flowState}
        onStateChange={(s) => updateAlerts((list) => list.map((x) => x.alert_id === a.alert_id
          ? { ...x, flowState: s, flowStateAt: new Date().toISOString().slice(0, 19).replace('T', ' ') }
          : x))}
      />

      {/* 预警信息 */}
      <Panel title="预警信息" desc={<>触发场景：<b>{a.scene}</b> · <Cal label="实时" /> 指标值 {a.metric_value} / 阈值 {a.threshold}</>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 16px', fontSize: 13 }}>
          {([
            ['预警ID', a.alert_id],
            ['客户', a.cust_name],
            ['预警类型', a.alert_type ?? '—'],
            ['等级', LEVEL_META[a.level].label],
            ['预警时间', a.alert_date],
            ['命中规则', a.rule_name],
            ['指标值 / 阈值', `${a.metric_value} / ${a.threshold}`],
            ['流程状态', a.flowState ?? '—'],
          ] as [string, string][]).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
              <span style={{ color: '#94A3B8' }}>{k}</span>
              <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Badge kind={LEVEL_META[a.level].badge}>{LEVEL_META[a.level].label}</Badge>
          <Button size="sm" variant="ghost" onClick={() => nav(`/console/cr/mid-cust-detail?cust=${a.cust_id}`)}>查看单客视图 →</Button>
        </div>
      </Panel>

      {/* 客户摘要（单客视图入口的上下文） */}
      <Panel title="客户摘要" desc={cust ? `以客户为中心看全局 · ${cust.product} · ${cust.riskLevel}` : '该客户暂无档案'}>
        {cust ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '6px 16px', fontSize: 13 }}>
            {([
              ['客户', `${cust.name}（${cust.idCard}）`],
              ['产品', cust.product],
              ['授信额度', cust.creditLine ? `¥${cust.creditLine.toLocaleString()}` : '—'],
              ['在贷余额', cust.loanBalance ? `¥${cust.loanBalance.toLocaleString()}` : '—'],
              ['贷款状态', cust.loanStatus],
              ['风险等级', cust.riskLevel],
              ['关联预警', `${cust.alerts?.length ?? 0} 条`],
              ['关联工单', `${cust.disposes?.length ?? 0} 条`],
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

      {/* 关联处置工单 */}
      <Panel title="处置工单" desc={<span><Sam label="读取" value="midDisposeTasks.json" /> 该预警派生的处置动作</span>}>
        {linkedTasks.length ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {linkedTasks.map((t) => (
              <button key={t.id} type="button" onClick={() => nav('/console/cr/mid-dispose-detail?id=' + t.id)}
                style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid #DBEAFE', background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, cursor: 'pointer' }}>
                {t.id} · {t.action} · {t.status} →
              </button>
            ))}
          </div>
        ) : (
          <span style={{ fontSize: 12, color: '#94A3B8' }}>尚未生成处置工单——在流程推进到处置节点后自动派生（见处置策略配置）。</span>
        )}
      </Panel>
    </div>
  );
}
