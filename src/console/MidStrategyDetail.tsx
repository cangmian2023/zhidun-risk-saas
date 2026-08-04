// 监控策略详情（管理中心 · 配置域）— 读 midStrategy.json 橘；监控内容来自指标库 蓝；实时说明 灰
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, Badge } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidStrategy, useMidMetrics, useMidAlerts } from './midStore';
import { LEVEL_META, type AlertLevel, type RuleOp, type TaskFrequency, type OutputWay, type MidTask, type MidRule, type MidDispose } from './midData';

const FREQ_LABEL: Record<TaskFrequency, string> = { daily: '每日', weekly: '每周', monthly: '每月' };
const OUTPUT_LABEL: Record<OutputWay, string> = { api: 'API 推送', url: '页面 URL', file: '文件导出', web: '监控看板' };
const OP_LABEL: Record<RuleOp, string> = { gt: '>', gte: '≥', lt: '<', lte: '≤', eq: '=', neq: '≠' };

export default function MidStrategyDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const kind = (params.get('kind') ?? 'task') as 'task' | 'rule' | 'dispose';
  const strategy = useMidStrategy();
  const metrics = useMidMetrics();
  const alerts = useMidAlerts();
  const nav = useNavigate();

  const item: MidTask | MidRule | MidDispose | undefined =
    kind === 'task' ? strategy.tasks.find((t) => t.id === id)
    : kind === 'rule' ? strategy.rules.find((r) => r.id === id)
    : strategy.disposes.find((d) => d.id === id);

  if (!item) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell title="策略详情" crumb="管理中心 / 贷中监控配置 / 监控策略" actions={<Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>} />
        <div style={{ padding: 24, color: '#94A3B8', fontSize: 13 }}>未找到该策略项（{kind} / {id}）。</div>
      </div>
    );
  }

  const metricName = (mid: string) => metrics.find((m) => m.id === mid)?.name ?? mid;
  const kindLabel = kind === 'task' ? '监控任务' : kind === 'rule' ? '预警规则' : '处置策略';

  const linkedAlerts = alerts.filter((a) =>
    kind === 'rule' ? (item as MidRule).level === a.level
    : kind === 'dispose' ? (item as MidDispose).triggerLevel === a.level
    : false,
  );

  return (
    <div style={{ padding: 24, maxWidth: 1180 }}>
      <PageShell title={(item as any).name} crumb={`管理中心 / 贷中监控配置 / 监控策略 / ${kindLabel}`}
        actions={<>
          <Cfg label="读指标库" value="midMetrics.json" />
          <Sam label="策略配置JSON" value="midStrategy.json" />
          <Button size="sm" onClick={() => nav(`/console/cm:mid-strategy?edit=${id}&kind=${kind}`)}>编辑</Button>
          <Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>
        </>} />

      {kind === 'task' && <TaskView t={item as MidTask} metricName={metricName} />}
      {kind === 'rule' && <RuleView r={item as MidRule} metricName={metricName} />}
      {kind === 'dispose' && <DisposeView d={item as MidDispose} />}

      <Panel title="联动预警" desc={<span><Sam label="实时" value={`${linkedAlerts.length} 条`} /> 当前已有预警命中该{ kind === 'rule' ? '规则定级' : '处置触发等级' }</span>}>
        {linkedAlerts.length ? (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {linkedAlerts.slice(0, 12).map((a) => (
              <Button key={a.alert_id} size="sm" variant="ghost" onClick={() => nav('/console/cr:mid-alert-detail?id=' + a.alert_id)}>{a.alert_id} · {a.cust_name}</Button>
            ))}
          </div>
        ) : <div style={{ color: '#94A3B8', fontSize: 12 }}>暂无命中预警</div>}
        <div style={{ marginTop: 10 }}>
          <Button size="sm" variant="secondary" onClick={() => nav('/console/cr:mid-alert-workbench')}>前往预警工作台 →</Button>
        </div>
      </Panel>
    </div>
  );

  function TaskView({ t, metricName }: { t: MidTask; metricName: (id: string) => string }) {
    const rows = [
      ['客群', t.crowd], ['频率', FREQ_LABEL[t.frequency]], ['输出方式', OUTPUT_LABEL[t.output]],
      ['状态', t.enabled ? '启用' : '停用'], ['说明', t.desc || '-'],
    ];
    return (
      <Panel title="任务配置" desc="按客群周期扫描，关联指标并输出">
        <Meta rows={rows} />
        <div style={{ marginTop: 10, fontSize: 13, fontWeight: 500 }}>关联指标 <Cfg label="读指标库" value="midMetrics.json" /></div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
          {t.metricIds.map((mid) => (
            <Button key={mid} size="sm" variant="ghost" onClick={() => nav('/console/cm:mid-metric-detail?id=' + mid)}>{metricName(mid)}</Button>
          ))}
          {t.metricIds.length === 0 && <span style={{ color: '#94A3B8', fontSize: 12 }}>未关联指标</span>}
        </div>
      </Panel>
    );
  }

  function RuleView({ r, metricName }: { r: MidRule; metricName: (id: string) => string }) {
    return (
      <Panel title="规则配置" desc="命中即定级红/黄灯">
        <Meta rows={[['监控指标', metricName(r.metricId)], ['触发条件', `${OP_LABEL[r.op]} ${r.value}`], ['命中定级', LEVEL_META[r.level].label], ['说明', r.desc || '-']]} />
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#F3F4F6', borderRadius: 8, fontSize: 12, color: '#6B7280' }}>
          <Cal label="实时计算" /> 当「{metricName(r.metricId)}」{OP_LABEL[r.op as RuleOp]} {r.value} 时，自动定级为 <Badge kind={LEVEL_META[r.level].badge}>{LEVEL_META[r.level].label}</Badge>
        </div>
        <div style={{ marginTop: 8 }}>
          <Button size="sm" variant="ghost" onClick={() => nav('/console/cm:mid-metric-detail?id=' + r.metricId)}>查看指标：{metricName(r.metricId)} →</Button>
        </div>
      </Panel>
    );
  }

  function DisposeView({ d }: { d: MidDispose }) {
    return (
      <Panel title="处置策略配置" desc="按预警等级匹配动作，对接外部系统">
        <Meta rows={[
          ['触发等级', LEVEL_META[d.triggerLevel].label], ['动作', d.action], ['对接系统', d.targetSystem || '-'],
          ['分派角色', d.assignTo || '-'], ['需审批', d.needApprove ? '是' : '否'], ['需触达客户', d.needNotify ? '是' : '否'], ['说明', d.desc || '-'],
        ]} />
      </Panel>
    );
  }

  function Meta({ rows }: { rows: [string, string][] }) {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: '6px 16px', fontSize: 13 }}>
        {rows.map(([k, v]) => (
          <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
            <span style={{ color: '#94A3B8' }}>{k}</span>
            <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
          </div>
        ))}
      </div>
    );
  }
}
