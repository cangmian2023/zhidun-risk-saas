// 监控任务（管理中心）— 单列表页；点行打开右侧抽屉（参考神策「新建预警」详情）
// 抽屉内分区：基本信息 + 预警规则（该任务关联指标的预警规则）+ 监控状态
// ① 任务/规则引用指标库（样例 JSON 橘）；实时定级说明 灰
import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Panel, DataTable, Drawer, SingleSelect, SearchSelect } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam } from './SourceTag';
import FlowStateCell from './FlowStateCell';
import { useMidStrategy, updateStrategy, useMidMetrics, midNewId } from './midStore';
import {
  type MidTask, type MidRule, type MonitorGranularity, type AlertLevel,
  type RuleCompare, type RuleBaseline,
  WEEK_DAYS, HOUR_SLOTS,
} from './midData';
import { PageShell } from './PageShell';
import { CONFIG_CONTAINER, crumb, GRAN_LABEL } from './ConfigTemplate';

const fi = 'h-8 px-2.5 rounded-md border border-slate-200 text-sm text-ink-900 w-full bg-white outline-none focus:border-blue-500';
const fiWide = 'h-8 px-2.5 rounded-md border border-slate-200 text-sm text-ink-900 w-full bg-white outline-none focus:border-blue-500';
const GROUP_VALUE_OPTS = [{ key: '总体', label: '总体' }];
/* 业务场景（标准化枚举）：预警记录的 scene 由任务继承 */
const SCENE_OPTS = ['贷中风控', '存量运营', '贷后催收', '反欺诈监测'];
/* 预警类型（标准化枚举）：预警记录的 alert_type 由规则继承 */
const ALERT_TYPE_OPTS = ['负债激增', '多头借贷', '逾期预警', '司法涉诉', '关联企业风险', '设备异常', '反欺诈命中', '行为评分下降', '还款能力不足', '回访失联', '舆情负面', '提额机会'];
/* 业务场景配色 */
const SCENE_COLOR: Record<string, string> = { 贷中风控: '#2563EB', 存量运营: '#059669', 贷后催收: '#D97706', 反欺诈监测: '#DC2626' };

export default function MidMonitorConfig() {
  const strategy = useMidStrategy();
  const metrics = useMidMetrics();
  const [params] = useSearchParams();
  const [drawer, setDrawer] = useState<null | { task: MidTask; rules: MidRule[]; newRule: MidRule | null }>(null);
  const openedRef = useRef<string | null>(null);

  useEffect(() => {
    const eid = params.get('edit');
    if (eid && openedRef.current !== eid) {
      const t = strategy.tasks.find((x) => x.id === eid);
      if (t) { openedRef.current = eid; openDrawer(t); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, strategy]);

  const metricName = (id: string) => metrics.find((m) => m.id === id)?.name ?? id;

  // 任务关联规则：条件直接引用任务指标，或属于同一数据源（如事件分析任务 + 事件属性规则）
  const relatedRules = (t: MidTask): MidRule[] => {
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
  };

  const openDrawer = (t?: MidTask) => {
    if (t) {
      const rel = relatedRules(t).map((r) => JSON.parse(JSON.stringify(r)));
      setDrawer({ task: JSON.parse(JSON.stringify(t)), rules: rel, newRule: null });
    } else {
      setDrawer({ task: { id: midNewId('t'), name: '', crowd: '', granularity: 'day', period: { hours: ['02'] }, metricIds: [], output: 'web', enabled: true, desc: '' }, rules: [], newRule: null });
    }
  };
  const close = () => setDrawer(null);

  const setTask = (p: Partial<MidTask>) => setDrawer((d) => d ? { ...d, task: { ...d.task, ...p } } : d);
  const setRule = (id: string, p: Partial<MidRule>) => setDrawer((d) => d ? { ...d, rules: d.rules.map((r) => (r.id === id ? { ...r, ...p } : r)) } : d);
  const delRule = (id: string) => setDrawer((d) => d ? { ...d, rules: d.rules.filter((r) => r.id !== id) } : d);
  const startNewRule = () => setDrawer((d) => d ? { ...d, newRule: { id: midNewId('r'), name: '', logic: 'and', conds: [], level: 'GREEN', groupValue: ['总体'], triggerMode: 'int', compare: 'lt', baseline: 'yesterday', threshold: 0, desc: '' } } : d);
  const commitNewRule = () => setDrawer((d) => {
    if (!d || !d.newRule || !d.newRule.name) return d;
    return { ...d, rules: [...d.rules, d.newRule], newRule: null };
  });

  const save = () => {
    if (!drawer) return;
    const { task, rules } = drawer;
    updateStrategy((s) => {
      const i = s.tasks.findIndex((x) => x.id === task.id);
      const tasks = i < 0 ? [...s.tasks, task] : s.tasks.map((x) => (x.id === task.id ? task : x));
      const ids = new Set(rules.map((r) => r.id));
      const kept = s.rules.filter((r) => !ids.has(r.id));
      return { ...s, tasks, rules: [...kept, ...rules] };
    });
    close();
  };

  return (
    <div className={CONFIG_CONTAINER}>
      <PageShell title="监控任务" crumb={crumb('监控任务')}
        subtitle="配置监控任务（对谁、何时、算哪些指标）；预警规则与处置策略见同级菜单"
        actions={<><Sam label="读指标库" value="midMetrics.json" /><Sam value="midStrategy.json" /></>} />

      <Panel title="监控任务" desc="对谁、何时、算哪些指标（预警规则在任务详情中配置）"
        actions={<Button size="sm" variant="secondary" onClick={() => openDrawer()}>新建任务</Button>}>
        <DataTable columns={taskCols()} rows={strategy.tasks.map(taskRow)}
          actions={(r) => (
            <div style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
              <Button size="sm" variant="ghost" onClick={() => openDrawer(strategy.tasks.find((t) => t.id === String(r.id)))}>查看</Button>
            </div>
          )}
          pager defaultPageSize={20} />
      </Panel>

      <Drawer open={!!drawer} onClose={close} title={drawer?.task.name || '新建监控任务'} width="max-w-2xl">
        {drawer && (
          <div>
            {/* 基本信息 */}
            <Section title="基本信息" desc="监控任务身份与调度">
              <FormRow label="任务名称" required><input className={fiWide} value={drawer.task.name} onChange={(e) => setTask({ name: e.target.value })} placeholder="如 全量客群日扫" /></FormRow>
              <FormRow label="描述" required><input className={fiWide} value={drawer.task.crowd} onChange={(e) => setTask({ crowd: e.target.value })} placeholder="如 在贷全量客户" /></FormRow>
              <FormRow label="业务场景" required help="任务归属的业务场景，产生预警时继承到预警记录的「触发场景」">
                <SingleSelect label="选择场景" fullWidth value={drawer.task.scene ?? '贷中风控'} onChange={(v) => setTask({ scene: v })}
                  options={SCENE_OPTS.map((s) => ({ value: s, label: s }))} />
              </FormRow>
              <FormRow label="监控粒度" required>
                <SingleSelect label="选择粒度" fullWidth value={drawer.task.granularity} onChange={(v) => setTask({ granularity: v as MonitorGranularity })}
                  options={(Object.keys(GRAN_LABEL) as MonitorGranularity[]).map((g) => ({ value: g, label: GRAN_LABEL[g] }))} />
              </FormRow>
              {(drawer.task.granularity === 'week' || drawer.task.granularity === 'hour') && (
                <FormRow label="监控时段·星期">
                  <MultiSelect options={WEEK_DAYS.map((d) => ({ key: d.key, label: d.label }))}
                    value={drawer.task.period?.days ?? []}
                    onChange={(v) => setTask({ period: { ...drawer.task.period, days: v } })} />
                </FormRow>
              )}
              {(drawer.task.granularity === 'day' || drawer.task.granularity === 'week' || drawer.task.granularity === 'month' || drawer.task.granularity === 'hour') && (
                <FormRow label="监控时段·小时">
                  <MultiSelect options={HOUR_SLOTS.map((h) => ({ key: h, label: `${h}:00` }))}
                    value={drawer.task.period?.hours ?? []}
                    onChange={(v) => setTask({ period: { ...drawer.task.period, hours: v } })} />
                </FormRow>
              )}
              <FormRow label="关联指标" required>
                <MetricPicker metrics={metrics} value={drawer.task.metricIds ?? []} onChange={(v) => setTask({ metricIds: v })} />
              </FormRow>
              <FormRow label="说明"><input className={fiWide} value={drawer.task.desc ?? ''} onChange={(e) => setTask({ desc: e.target.value })} placeholder="任务口径说明" /></FormRow>
            </Section>

            {/* 预警规则（该任务关联指标的规则；无需标题） */}
            <Section>
              {drawer.rules.length === 0 && !drawer.newRule && (
                <div className="text-xs text-slate-400 mb-3">该任务暂未配置预警规则。先勾选上方「关联指标」，再点击下方添加。</div>
              )}
              {drawer.rules.map((r) => (
                <RuleCard key={r.id} rule={r} onChange={(nr) => setRule(r.id, nr)} onRemove={() => delRule(r.id)} />
              ))}

              {drawer.newRule && (
                <RuleCard rule={drawer.newRule}
                  onChange={(nr) => setDrawer((d) => d ? { ...d, newRule: nr } : d)}
                  onRemove={() => setDrawer((d) => d ? { ...d, newRule: null } : d)}
                  footer={
                    <div className="flex gap-2">
                      <Button size="sm" variant="primary" onClick={commitNewRule}>确认添加</Button>
                      <Button size="sm" variant="secondary" onClick={() => setDrawer((d) => d ? { ...d, newRule: null } : d)}>取消</Button>
                    </div>
                  } />
              )}
              <Button size="sm" variant="secondary" onClick={startNewRule} disabled={!drawer.task.metricIds.length}>+ 添加预警规则</Button>
            </Section>

            {/* 监控状态 */}
            <Section title="监控状态">
              <Switch on={!!drawer.task.enabled} onChange={(v) => setTask({ enabled: v })} label={drawer.task.enabled ? '已开启' : '已关闭'} />
            </Section>

            <div className="sticky bottom-0 -mx-6 -mb-5 mt-6 px-6 py-4 border-t border-slate-100 bg-white flex justify-end gap-2">
              <Button onClick={save}>保存</Button>
              <Button variant="secondary" onClick={close}>取消</Button>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );

  function taskRow(t: MidTask): Row {
    return {
      id: t.id, name: t.name, scene: t.scene ?? '', crowd: t.crowd,
      freq: granText(t),
      metrics: t.metricIds.map(metricName).join('、') || '-',
      flowKey: t.flowKey ?? '',
      flowState: t.flowState ?? '',
    } as unknown as Row;
  }
}

function granText(t: MidTask): string {
  const g = GRAN_LABEL[t.granularity];
  const p = t.period;
  if (t.granularity === 'realtime' || t.granularity === 'minute') return g;
  const parts: string[] = [];
  if ((t.granularity === 'week' || t.granularity === 'hour') && p?.days?.length) {
    parts.push(p.days.map((d) => WEEK_DAYS.find((w) => w.key === d)?.label ?? d).join('/'));
  }
  if ((t.granularity === 'day' || t.granularity === 'week' || t.granularity === 'month' || t.granularity === 'hour') && p?.hours?.length) {
    parts.push(p.hours.map((h) => `${h}:00`).join('、'));
  }
  return [g, ...parts].join(' · ') || g;
}

function taskCols(): Column[] {
  return [
    { key: 'name', label: '任务名称', tag: { kind: 'sample', value: 'midStrategy.json.tasks.name' } },
    { key: 'scene', label: '业务场景', tag: { kind: 'sample', value: 'midStrategy.json.tasks.scene' }, render: (r: Row) => (
      <span style={{ color: SCENE_COLOR[r.scene as string] ?? '#475569' }}>{String(r.scene ?? '—')}</span>
    ) },
    { key: 'crowd', label: '客群', tag: { kind: 'sample', value: 'midStrategy.json.tasks.crowd' } },
    { key: 'freq', label: '监控频率', tag: { kind: 'sample', value: 'midStrategy.json.tasks.granularity+period' } },
    { key: 'metrics', label: '关联指标', tag: { kind: 'sample', value: 'midMetrics.json' } },
    { key: 'flowState', label: '流程状态', fixed: 'right', tag: { kind: 'sample', value: 'midStrategy.json.tasks.flowState' }, render: (r: Row) => (
      <FlowStateCell flowId={String(r.flowKey ?? '')} state={String(r.flowState ?? '')}
        onChange={(s) => updateStrategy((st) => ({ ...st, tasks: st.tasks.map((t) => t.id === String(r.id) ? { ...t, flowState: s } : t) }))} />
    ) },
  ];
}

/* ---------- 抽屉内分区视觉（参考神策「新建预警」） ---------- */
function Section({ title, desc, children }: { title?: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      {title && (
        <div className="flex items-center gap-2 mb-4">
          <span className="w-[3px] h-3.5 bg-green-500 rounded" />
          <span className="text-sm font-semibold text-ink-900">{title}</span>
          {desc && <span className="text-xs text-slate-400 font-normal">{desc}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
function FormRow({ label, required, help, className, children }: { label: string; required?: boolean; help?: string; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex items-start mb-4 ${className ?? ''}`}>
      <div className="w-[88px] shrink-0 text-right pr-3 pt-1.5 text-sm text-slate-500">
        {required && <span className="text-red-500 mr-0.5">*</span>}{label}
        {help && <span title={help} className="ml-1 text-slate-300 cursor-help">?</span>}
      </div>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
function Switch({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!on)} className="flex items-center gap-2">
      <span className={`relative w-10 h-[22px] rounded-full transition ${on ? 'bg-green-500' : 'bg-slate-300'}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${on ? 'left-5' : 'left-0.5'}`} />
      </span>
      <span className="text-sm text-slate-600">{label}</span>
    </button>
  );
}

/* 指标多选：已选显示在上方可删除；下拉统一走 SearchSelect（搜索 + 分组分类） */
export function MetricPicker({ metrics, value, onChange }: {
  metrics: { id: string; name: string; group?: string }[];
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const toggle = (id: string) => onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
  const options = metrics.map((m) => ({ value: m.id, label: m.name, group: m.group ?? '未分类' }));
  const groups = [...new Set(metrics.map((m) => m.group ?? '未分类'))].map((g) => ({ key: g, label: g }));
  return (
    <div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((id) => {
            const m = metrics.find((x) => x.id === id);
            return (
              <span key={id} className="inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs text-blue-700">
                {m?.name ?? id}
                <button type="button" className="text-blue-400 hover:text-red-500" onClick={() => toggle(id)}>×</button>
              </span>
            );
          })}
        </div>
      )}
      <SearchSelect multiple options={options} groups={groups} value={value} onChange={onChange}
        placeholder="请选择指标" searchPlaceholder="搜索指标…" fullWidth />
    </div>
  );
}

/* 下拉多选（监控时段·星期 / 监控时段·小时 / 分组值 共用）：统一走 SearchSelect（可筛选） */
function MultiSelect<T extends string>({ options, value, onChange, placeholder }: {
  options: { key: T; label: string }[];
  value: T[];
  onChange: (v: T[]) => void;
  placeholder?: string;
}) {
  const sopts = options.map((o) => ({ value: o.key, label: o.label }))
  return (
    <SearchSelect multiple options={sopts} value={value} onChange={(v) => onChange(v as T[])}
      placeholder={placeholder ?? '请选择'} searchPlaceholder="搜索…" fullWidth />
  )
}

function RuleCard({ rule, onChange, onRemove, footer }: {
  rule: MidRule;
  onChange: (r: MidRule) => void;
  onRemove: () => void;
  footer?: React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-lg p-3 bg-slate-50 mb-3">
      {/* 规则名称 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-[88px] shrink-0 text-right pr-3 text-sm text-slate-500">规则名称</span>
        <div className="flex-1">
          <input className="h-7 w-full px-2 rounded border border-slate-200 text-xs" value={rule.name}
            onChange={(e) => onChange({ ...rule, name: e.target.value })} placeholder="如 近30天新增贷款≥3笔" />
        </div>
      </div>

      {/* 预警类型 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-[88px] shrink-0 text-right pr-3 text-sm text-slate-500">预警类型</span>
        <div className="flex-1">
          <SingleSelect label="请选择预警类型" clearable fullWidth value={rule.alertType ?? ''} onChange={(v) => onChange({ ...rule, alertType: v })}
            options={[{ value: '', label: '请选择预警类型' }, ...ALERT_TYPE_OPTS.map((a) => ({ value: a, label: a }))]} />
        </div>
      </div>

      {/* 分组值 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-[88px] shrink-0 text-right pr-3 text-sm text-slate-500">分组值</span>
        <div className="flex-1">
          <MultiSelect options={GROUP_VALUE_OPTS} value={rule.groupValue ?? ['总体']}
            onChange={(v) => onChange({ ...rule, groupValue: v })} placeholder="请选择分组值" />
        </div>
      </div>

      {/* 触发方式 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-[88px] shrink-0 text-right pr-3 text-sm text-slate-500">触发方式</span>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1 text-sm text-slate-600 cursor-pointer">
            <input type="radio" className="accent-blue-600" checked={rule.triggerMode !== 'ratio'} onChange={() => onChange({ ...rule, triggerMode: 'int' })} />
            绝对值变化
          </label>
          <label className="flex items-center gap-1 text-sm text-slate-600 cursor-pointer">
            <input type="radio" className="accent-blue-600" checked={rule.triggerMode === 'ratio'} onChange={() => onChange({ ...rule, triggerMode: 'ratio' })} />
            百分比变化
          </label>
        </div>
      </div>

      {/* 触发规则 */}
      <div className="flex items-center gap-2 mb-2">
        <span className="w-[88px] shrink-0 text-right pr-3 text-sm text-slate-500">触发规则</span>
        <SingleSelect label="比较" width={110} value={rule.compare ?? 'lt'} onChange={(v) => onChange({ ...rule, compare: v as RuleCompare })}
          options={[{ value: 'lt', label: '低于' }, { value: 'gt', label: '高于' }, { value: 'eq', label: '等于' }]} />
        <SingleSelect label="基线" width={130} value={rule.baseline ?? 'yesterday'} onChange={(v) => onChange({ ...rule, baseline: v as RuleBaseline })}
          options={[{ value: 'yesterday', label: '昨天同期' }, { value: 'lastWeek', label: '上周同期' }, { value: 'lastMonth', label: '上月同期' }]} />
        <input type="number" className="h-7 w-24 px-1.5 rounded border border-slate-200 text-xs" value={rule.threshold ?? 0}
          onChange={(e) => onChange({ ...rule, threshold: Number(e.target.value) })} placeholder="请输入" />
      </div>

      {/* 等级 */}
      <div className="flex items-center gap-2">
        <span className="w-[88px] shrink-0 text-right pr-3 text-sm text-slate-500">等级</span>
        <SingleSelect label="等级" width={110} value={rule.level} onChange={(v) => onChange({ ...rule, level: v as AlertLevel })}
          options={[{ value: 'GREEN', label: '绿灯' }, { value: 'YELLOW', label: '黄灯' }, { value: 'RED', label: '红灯' }]} />
      </div>

      {/* 底部操作：删除 + 确认添加 / 取消 */}
      <div className="mt-2 flex items-center justify-end gap-2">
        {footer}
        <button className="text-sm text-red-500 hover:underline" onClick={onRemove}>删除</button>
      </div>
    </div>
  );
}
