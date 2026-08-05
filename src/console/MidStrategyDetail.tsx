// 监控策略详情（管理中心 · 配置域）— 读 midStrategy.json 蓝；监控内容来自指标库 蓝；实时说明 灰
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Button, Badge, InfoCell } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Cfg, Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidStrategy, useMidMetrics, useMidAlerts, updateStrategy } from './midStore';
import { LEVEL_META, type AlertLevel, type RuleOp, type TaskFrequency, type MidTask, type MidRule, type MidDispose } from './midData';
import { ConfigDetailPage, crumb, FREQ_LABEL, OUTPUT_LABEL, OP_LABEL } from './ConfigTemplate';

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
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageShell title="策略详情" crumb={crumb('策略配置')} actions={<Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>} />
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">未找到该策略项（{kind} / {id}）。</div>
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

  const toggleEnabled = () => {
    if (kind !== 'task') return;
    updateStrategy((s) => ({ ...s, tasks: s.tasks.map((t) => t.id === id ? { ...t, enabled: !t.enabled } : t) }));
  };

  const confCols: Column[] = [
    { key: 'k', label: '项目', tag: { kind: 'cfg', value: 'midStrategy.json' } },
    { key: 'v', label: '内容', tag: { kind: 'cfg', value: 'midStrategy.json' } },
  ];
  const confRows: Row[] =
    kind === 'task' ? ([
      { id: '1', k: '客群', v: (item as MidTask).crowd },
      { id: '2', k: '频率', v: FREQ_LABEL[(item as MidTask).frequency] },
      { id: '3', k: '输出方式', v: OUTPUT_LABEL[(item as MidTask).output] },
      { id: '4', k: '状态', v: (item as MidTask).enabled ? '启用' : '停用' },
      { id: '5', k: '说明', v: (item as MidTask).desc || '-' },
    ] as unknown as Row[])
    : kind === 'rule' ? ([
      { id: '1', k: '监控指标', v: metricName((item as MidRule).metricId) },
      { id: '2', k: '触发条件', v: `${OP_LABEL[(item as MidRule).op]} ${(item as MidRule).value}` },
      { id: '3', k: '命中定级', v: LEVEL_META[(item as MidRule).level].label },
      { id: '4', k: '说明', v: (item as MidRule).desc || '-' },
    ] as unknown as Row[])
    : ([
      { id: '1', k: '触发等级', v: LEVEL_META[(item as MidDispose).triggerLevel].label },
      { id: '2', k: '动作', v: (item as MidDispose).action },
      { id: '3', k: '对接系统', v: (item as MidDispose).targetSystem || '-' },
      { id: '4', k: '分派角色', v: (item as MidDispose).assignTo || '-' },
      { id: '5', k: '需审批', v: (item as MidDispose).needApprove ? '是' : '否' },
      { id: '6', k: '需触达客户', v: (item as MidDispose).needNotify ? '是' : '否' },
      { id: '7', k: '说明', v: (item as MidDispose).desc || '-' },
    ] as unknown as Row[]);

  const metricIds = kind === 'task' ? (item as MidTask).metricIds : kind === 'rule' ? [(item as MidRule).metricId] : [];

  return (
    <ConfigDetailPage
      title={(item as any).name}
      crumbParts={['策略配置', kindLabel]}
      actions={<>
        <Cfg value="midMetrics.json" />
        <Cfg value="midStrategy.json" />
        <Button size="sm" onClick={() => nav(`/console/cm/mid-strategy?edit=${id}&kind=${kind}`)}>编辑</Button>
        {kind === 'task' && (
          <Button size="sm" variant={(item as MidTask).enabled ? 'secondary' : 'primary'} onClick={toggleEnabled}>
            {(item as MidTask).enabled ? '停用' : '启用'}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => nav(-1)}>返回</Button>
      </>}
      infoCells={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kind === 'task' ? (
            <>
              <InfoCell label="类型" value="监控任务" />
              <InfoCell label="状态" value={<Badge kind={(item as MidTask).enabled ? 'green' : 'red'}>{(item as MidTask).enabled ? '启用' : '停用'}</Badge>} />
              <InfoCell label="客群" value={(item as MidTask).crowd} />
              <InfoCell label="频率" value={FREQ_LABEL[(item as MidTask).frequency]} />
              <InfoCell label="输出" value={OUTPUT_LABEL[(item as MidTask).output]} />
            </>
          ) : kind === 'rule' ? (
            <>
              <InfoCell label="类型" value="预警规则" />
              <InfoCell label="命中定级" value={<Badge kind={LEVEL_META[(item as MidRule).level].badge}>{LEVEL_META[(item as MidRule).level].label}</Badge>} />
              <InfoCell label="监控指标" value={metricName((item as MidRule).metricId)} />
              <InfoCell label="触发条件" value={`${OP_LABEL[(item as MidRule).op]} ${(item as MidRule).value}`} />
            </>
          ) : (
            <>
              <InfoCell label="类型" value="处置策略" />
              <InfoCell label="触发等级" value={<Badge kind={LEVEL_META[(item as MidDispose).triggerLevel].badge}>{LEVEL_META[(item as MidDispose).triggerLevel].label}</Badge>} />
              <InfoCell label="动作" value={(item as MidDispose).action} />
              <InfoCell label="对接系统" value={(item as MidDispose).targetSystem || '-'} />
              <InfoCell label="分派角色" value={(item as MidDispose).assignTo || '-'} />
            </>
          )}
        </div>
      }
    >
      <Panel title="配置详情" desc={<Cfg value="midStrategy.json" />}>
        <DataTable columns={confCols} rows={confRows} />
      </Panel>

      {metricIds.length > 0 && (
        <Panel title="关联指标" desc={<>监控内容来自指标库 <Cfg value="midMetrics.json" /></>}>
          <div className="flex flex-wrap gap-2">
            {metricIds.map((mid) => (
              <Button key={mid} size="sm" variant="ghost" onClick={() => nav('/console/cm/mid-metric-detail?id=' + mid)}>{metricName(mid)}</Button>
            ))}
          </div>
        </Panel>
      )}

      {kind === 'rule' && (
        <Panel title="实时口径" desc={<span><Cal /></span>}>
          <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2.5 text-xs text-slate-500">
            当「{metricName((item as MidRule).metricId)}」{OP_LABEL[(item as MidRule).op]} {(item as MidRule).value} 时，自动定级为 <Badge kind={LEVEL_META[(item as MidRule).level].badge}>{LEVEL_META[(item as MidRule).level].label}</Badge>
          </div>
        </Panel>
      )}

      <Panel title="联动预警" desc={<span><Sam value={`${linkedAlerts.length} 条`} /> 当前已有预警命中该{ kind === 'rule' ? '规则定级' : '处置触发等级' }</span>}>
        {linkedAlerts.length ? (
          <div className="flex flex-wrap gap-2">
            {linkedAlerts.slice(0, 12).map((a) => (
              <Button key={a.alert_id} size="sm" variant="ghost" onClick={() => nav('/console/cr/mid-alert-detail?id=' + a.alert_id)}>{a.alert_id} · {a.cust_name}</Button>
            ))}
          </div>
        ) : <div className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm text-slate-400">暂无命中预警</div>}
        <div className="mt-3">
          <Button size="sm" variant="secondary" onClick={() => nav('/console/cr/mid-alert-workbench')}>前往预警工作台 →</Button>
        </div>
      </Panel>
    </ConfigDetailPage>
  );
}
