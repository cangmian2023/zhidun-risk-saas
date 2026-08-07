// 监控策略详情（管理中心）— 读 midStrategy.json 橘（样例）；关联指标库（样例） 橘；实时说明 灰
// 处置策略：详情页打开直接可编辑（保存即写回本地 JSON）
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, DataTable, Button, Badge, InfoCell } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidStrategy, useMidMetrics, useMidAlerts, updateStrategy } from './midStore';
import { LEVEL_META, EVENT_ANALYSIS_CONFIG, type MidTask, type MidRule, type MidDispose } from './midData';
import { ConfigDetailPage, crumb, GRAN_LABEL, OUTPUT_LABEL, COMPARE_LABEL, BASELINE_LABEL, granText } from './ConfigTemplate';
import { Editor as DisposeEditor } from './MidDisposeConfig';

export default function MidStrategyDetail() {
  const [params] = useSearchParams();
  const id = params.get('id') ?? '';
  const kind = (params.get('kind') ?? 'task') as 'task' | 'rule' | 'dispose';
  const strategy = useMidStrategy();
  const metrics = useMidMetrics();
  const alerts = useMidAlerts();
  const nav = useNavigate();
  const listRoute = kind === 'dispose' ? '/console/cm/mid-dispose-strategy' : '/console/cm/mid-strategy';

  const item: MidTask | MidRule | MidDispose | undefined =
    kind === 'task' ? strategy.tasks.find((t) => t.id === id)
    : kind === 'rule' ? strategy.rules.find((r) => r.id === id)
    : strategy.disposes.find((d) => d.id === id);

  // 处置策略：详情页直接可编辑（不用弹窗），保存写回本地 JSON
  const [editing, setEditing] = useState<MidDispose | null>(null);
  useEffect(() => {
    if (kind === 'dispose' && item) {
      setEditing(JSON.parse(JSON.stringify(item)));
    } else {
      setEditing(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, id, strategy]);

  const saveDispose = () => {
    if (!editing) return;
    updateStrategy((s) => {
      const i = s.disposes.findIndex((x) => x.id === editing.id);
      return { ...s, disposes: i < 0 ? [...s.disposes, editing] : s.disposes.map((x) => (x.id === editing.id ? editing : x)) };
    });
  };
  const removeDispose = () => {
    if (!editing) return;
    updateStrategy((s) => ({ ...s, disposes: s.disposes.filter((x) => x.id !== editing.id) }));
    nav(listRoute);
  };

  if (!item) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageShell title="策略详情" crumb={crumb('策略配置')} actions={<Button size="sm" variant="secondary" onClick={() => nav(listRoute)}>返回列表</Button>} />
        <div className="mt-6 rounded-xl bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">未找到该策略项（{kind} / {id}）。</div>
      </div>
    );
  }

  const metricName = (mid: string) => metrics.find((m) => m.id === mid)?.name ?? mid;
  const kindLabel = kind === 'task' ? '监控任务' : kind === 'rule' ? '预警规则' : '处置策略';
  // 触发规则文本：低于 昨天同期 阈值
  const ruleTriggerText = (r: MidRule) => `${COMPARE_LABEL[r.compare ?? 'lt']} ${BASELINE_LABEL[r.baseline ?? 'yesterday']} ${r.threshold ?? 0}`;
  const triggerModeText = (r: MidRule) => (r.triggerMode === 'ratio' ? '百分比变化' : '绝对值变化');

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
    { key: 'k', label: '项目', tag: { kind: 'sample', value: 'midStrategy.json' } },
    { key: 'v', label: '内容', tag: { kind: 'sample', value: 'midStrategy.json' } },
  ];
  const confRows: Row[] =
    kind === 'task' ? ([
      { id: '1', k: '客群', v: (item as MidTask).crowd },
      { id: '2', k: '监控粒度', v: GRAN_LABEL[(item as MidTask).granularity] },
      { id: '3', k: '监控时段', v: granText(item as MidTask) },
      { id: '4', k: '输出方式', v: OUTPUT_LABEL[(item as MidTask).output] },
      { id: '5', k: '状态', v: (item as MidTask).enabled ? '启用' : '停用' },
      { id: '6', k: '说明', v: (item as MidTask).desc || '-' },
    ] as unknown as Row[])
    : kind === 'rule' ? ([
      { id: '1', k: '分组值', v: ((item as MidRule).groupValue ?? []).join('、') || '-' },
      { id: '2', k: '触发方式', v: triggerModeText(item as MidRule) },
      { id: '3', k: '触发规则', v: ruleTriggerText(item as MidRule) },
      { id: '4', k: '等级', v: LEVEL_META[(item as MidRule).level].label },
      { id: '5', k: '说明', v: (item as MidRule).desc || '-' },
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

  const metricIds = kind === 'task' ? (item as MidTask).metricIds : kind === 'rule' ? (item as MidRule).conds.map((c) => c.metricId) : [];

  // 预警规则（自定义规则）：条件直接引用任务指标，或与任务指标同数据源（事件任务 + 事件属性规则自动关联）
  const relatedRules: MidRule[] =
    kind === 'task'
      ? (() => {
          const t = item as MidTask;
          const dsSet = new Set(
            t.metricIds.map((id) => metrics.find((m) => m.id === id)?.dataSourceId).filter(Boolean) as string[],
          );
          return strategy.rules.filter((r) =>
            r.conds.some((c) => {
              if (t.metricIds.includes(c.metricId)) return true;
              const ds = metrics.find((m) => m.id === c.metricId)?.dataSourceId;
              return !!ds && dsSet.has(ds);
            }),
          );
        })()
      : [];

  return (
    <ConfigDetailPage
      title={kind === 'dispose' ? (editing?.name || '处置策略') : (item as any).name}
      crumbParts={kind === 'dispose' ? ['处置策略'] : ['策略配置', kindLabel]}
      actions={<>
        <Sam value="midMetrics.json" />
        <Sam value="midStrategy.json" />
        {kind !== 'dispose' && (
          <Button size="sm" onClick={() => nav(`/console/cm/mid-strategy?edit=${id}&kind=${kind}`)}>编辑</Button>
        )}
        {kind === 'task' && (
          <Button size="sm" variant={(item as MidTask).enabled ? 'secondary' : 'primary'} onClick={toggleEnabled}>
            {(item as MidTask).enabled ? '停用' : '启用'}
          </Button>
        )}
        <Button size="sm" variant="secondary" onClick={() => nav(listRoute)}>返回列表</Button>
      </>}
      source={<>
        <Sam label="详情数据" value="midStrategy.json" />
        {kind === 'task' && <Sam label="关联指标" value="midMetrics.json" />}
      </>}
      infoCells={
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {kind === 'task' ? (
            <>
              <InfoCell label="类型" value="监控任务" />
              <InfoCell label="状态" value={<Badge kind={(item as MidTask).enabled ? 'green' : 'red'}>{(item as MidTask).enabled ? '启用' : '停用'}</Badge>} />
              <InfoCell label="客群" value={(item as MidTask).crowd} />
              <InfoCell label="监控粒度" value={GRAN_LABEL[(item as MidTask).granularity]} />
              <InfoCell label="输出" value={OUTPUT_LABEL[(item as MidTask).output]} />
            </>
          ) : kind === 'rule' ? (
            <>
              <InfoCell label="类型" value="预警规则" />
              <InfoCell label="等级" value={<Badge kind={LEVEL_META[(item as MidRule).level].badge}>{LEVEL_META[(item as MidRule).level].label}</Badge>} />
              <InfoCell label="分组值" value={((item as MidRule).groupValue ?? []).join('、') || '-'} />
              <InfoCell label="触发方式" value={triggerModeText(item as MidRule)} />
              <InfoCell label="触发规则" value={ruleTriggerText(item as MidRule)} />
            </>
          ) : (
            <>
              <InfoCell label="类型" value="处置策略" />
              <InfoCell label="触发等级" value={<Badge kind={LEVEL_META[(editing ?? item as MidDispose).triggerLevel].badge}>{LEVEL_META[(editing ?? item as MidDispose).triggerLevel].label}</Badge>} />
              <InfoCell label="动作" value={(editing ?? item as MidDispose).action} />
              <InfoCell label="对接系统" value={(editing ?? item as MidDispose).targetSystem || '-'} />
              <InfoCell label="分派角色" value={(editing ?? item as MidDispose).assignTo || '-'} />
            </>
          )}
        </div>
      }
    >
      {kind === 'dispose' ? (
        <Panel title="策略编辑" desc={<>详情页直接编辑，保存即写回本地 JSON <Sam value="midStrategy.json" /></>}>
          {editing && <DisposeEditor value={editing} onChange={setEditing} onRemove={removeDispose} />}
          <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
            <Button onClick={saveDispose}>保存</Button>
            <Button variant="secondary" onClick={() => nav(listRoute)}>返回列表</Button>
          </div>
        </Panel>
      ) : (
        <Panel title="配置详情" desc={<Sam value="midStrategy.json" />}>
          <DataTable columns={confCols} rows={confRows} />
        </Panel>
      )}

      {kind === 'task' && (
        <Panel title="事件分析配置" desc={<Sam value="record/temp/event" />}>
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-3 gap-3">
              <InfoCell label="分析主体" value={EVENT_ANALYSIS_CONFIG.subject} />
              <InfoCell label="时区" value={EVENT_ANALYSIS_CONFIG.timezone} />
              <InfoCell label="汇总配置" value={EVENT_ANALYSIS_CONFIG.summary} />
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-slate-500">事件选择</div>
              <div className="space-y-2">
                {EVENT_ANALYSIS_CONFIG.events.map((e) => (
                  <div key={e.id} className="rounded-lg border border-slate-200 px-3 py-2">
                    <div className="font-medium text-slate-800">{e.id} · {e.name}</div>
                    <div className="mt-0.5 text-xs text-slate-500">
                      事件：{e.event} · 指标：{e.metric}{e.formula ? ` · ${e.formula}` : ''}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-slate-500">
                全局筛选（共 {EVENT_ANALYSIS_CONFIG.filters.length} 个，关系「{EVENT_ANALYSIS_CONFIG.filterRel}」）
              </div>
              <div className="space-y-2">
                {EVENT_ANALYSIS_CONFIG.filters.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2">
                    <span className="text-slate-700">{f.prop}</span>
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs text-slate-600">{f.op}</span>
                    <span className="text-slate-500">{f.values.length ? f.values.join('、') : ''}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <InfoCell label="分组选择" value={EVENT_ANALYSIS_CONFIG.group} />
              <InfoCell label="时间选择" value={EVENT_ANALYSIS_CONFIG.time} />
              <InfoCell label="监控频率" value={`${EVENT_ANALYSIS_CONFIG.monitor.granularity} · ${EVENT_ANALYSIS_CONFIG.monitor.period}`} />
            </div>
          </div>
        </Panel>
      )}

      {kind === 'task' && relatedRules.length > 0 && (
        <Panel title="预警规则（自定义规则）" desc={<>来自 event 全局筛选条件，替换原占位规则 <Sam value="midStrategy.json" /></>}>
          <div className="space-y-2">
            {relatedRules.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 px-3 py-2">
                <Badge kind={LEVEL_META[r.level].badge}>{LEVEL_META[r.level].label}</Badge>
                <span className="font-medium text-slate-800">{r.name}</span>
                <span className="text-xs text-slate-500">触发规则：{ruleTriggerText(r)} · 等级「{LEVEL_META[r.level].label}」</span>
                <Button size="sm" variant="ghost" onClick={() => nav(`/console/cm/mid-strategy-detail?id=${r.id}&kind=rule`)}>查看</Button>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {metricIds.length > 0 && (
        <Panel title="关联指标" desc={<>监控内容来自指标库 <Sam value="midMetrics.json" /></>}>
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
            当 {ruleTriggerText(item as MidRule)} 时，自动定级为 <Badge kind={LEVEL_META[(item as MidRule).level].badge}>{LEVEL_META[(item as MidRule).level].label}</Badge>
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
