/* 管理中心 · 规则合集（需求20 统一页面 + 需求21 框架对齐 + 业务流程联动 + 需求22 新建/编辑/保存）
 * 框架对齐「页面配置同类页面」：列表用 ConfigListPage，详情用 ConfigDetailPage；
 * 业务流程复用「上线下线审核流程」样例 JSON（bizFlows.json · f-online-approve）。
 * 需求22：详情页进入即编辑态（表单化）、底部「保存」按钮落盘；新建规则按钮可用（?new=1 进入空白表单）。
 * 需求26-29：详情页交互与 UI 美化；核验项/条件/动作可选（来源=标准核验项库）；保存按钮移至底部；
 *   删除顶部 4 张信息卡（规则类型/风险等级/有效状态/关联业务流程）与「状态与流程联动」冗余面板。
 * 功能/数据分离：数据读 ruleHub.json（样例橘 Sam）；流程状态机读 bizFlows.json。
 */
import { useState, useMemo, type ReactNode } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Panel, Button, SingleSelect, StatCard, type Column, type Row } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { ConfigListPage, ConfigDetailPage } from './ConfigTemplate';
import {
  useRuleHub, updateRuleHub, RULE_TYPES,
  type RuleItem, type RuleType, type RiskLevel, type RuleCondGroup, type RuleCondRow,
  COND_FIELD_OPTIONS, COND_OP_OPTIONS, COND_WINDOW_OPTIONS, summarizeCond,
  deriveStats, pushVersion,
} from './ruleHubData';
import FlowActionBar from './FlowActionBar';
import FlowStateCell from './FlowStateCell';
const TYPE_COLOR: Record<RuleType, 'blue' | 'violet' | 'red' | 'orange' | 'cyan' | 'amber' | 'green' | 'gray'> = {
  信息核验: 'blue', 反欺诈: 'violet', 黑名单: 'red', 团伙识别: 'orange',
  设备风险: 'cyan', 跨机构名单: 'amber', 评分模型: 'green', 行为监控: 'gray',
  额度授信: 'blue', 合规监管: 'red',
};
const LEVEL_KIND: Record<RiskLevel, 'red' | 'amber' | 'green'> = { 高: 'red', 中: 'amber', 低: 'green' };

const setRuleFlow = (id: string, next: string) =>
  updateRuleHub((d) => ({ ...d, rules: d.rules.map((x) => (x.id === id ? { ...x, flowState: next } : x)) }));

const BLANK_RULE: RuleItem = {
  id: '', name: '', ruleType: '反欺诈', riskLevel: '中', hitCond: '', action: '',
  conditions: [], weight: 50, scope: '', owner: '', updatedAt: new Date().toISOString().slice(0, 10),
  flowRef: 'f-online-approve', flowState: '待上线', note: '',
};

export default function RuleHub() {
  const d = useRuleHub();
  const rules = d.rules;
  const [params] = useSearchParams();
  const nav = useNavigate();
  const id = params.get('id');
  const isNew = params.get('new') === '1';
  const detail = id ? rules.find((r) => r.id === id) ?? null : (isNew ? BLANK_RULE : null);

  const [ftype, setFtype] = useState('全部');
  const [flevel, setFlevel] = useState('全部');
  const [fset, setFset] = useState('全部');  // P2：规则集筛选

  const filtered = useMemo(
    () =>
      rules.filter(
        (r) => (ftype === '全部' || r.ruleType === ftype)
          && (flevel === '全部' || r.riskLevel === flevel)
          && (fset === '全部' || r.ruleSet === fset),
      ),
    [rules, ftype, flevel, fset],
  );

  if (detail) {
    return (
      <RuleForm
        initial={detail}
        isNew={isNew}
        onBack={() => nav('/console/cm/rule-hub')}
        onSaved={(c) => nav('/console/cm/rule-hub?id=' + c.id)}
      />
    );
  }

  const rows: Row[] = filtered.map((r) => {
    const st = r.stats ?? deriveStats(r.id, r.riskLevel);  // P1：命中统计（老数据派生兜底）
    return {
      id: r.id,
      name: r.name,
      ruleType: { v: r.ruleType, kind: TYPE_COLOR[r.ruleType] },
      riskLevel: { v: r.riskLevel, kind: LEVEL_KIND[r.riskLevel] },
      hitCond: r.hitCond,
      hits: `${st.hits30d}次 · 命中率${st.hitRate}%`,
      flowKey: r.flowRef,
      flowState: r.flowState,
    };
  });

  // P1：删除规则
  const removeRule = (rid: string) => {
    if (!window.confirm('确认删除该规则？删除后不可恢复。')) return;
    updateRuleHub((dd) => ({ ...dd, rules: dd.rules.filter((x) => x.id !== rid) }));
  };

  // P1：顶部统计卡（总 / 已生效 / 草稿 / 高风险）
  const total = rules.length;
  const eff = rules.filter((r) => (r.flowState ?? '').includes('已上线')).length;
  const off = rules.filter((r) => (r.flowState ?? '').includes('已下线')).length;
  const hi = rules.filter((r) => r.riskLevel === '高').length;

  const cols: Column[] = [
    { key: 'name', label: '规则名称', type: 'text', tag: { kind: 'sample', value: 'ruleHub.json' } },
    { key: 'ruleType', label: '规则类型', type: 'badge', badgeKind: 'blue', width: '110px' },
    { key: 'riskLevel', label: '风险等级', type: 'badge', badgeKind: 'red', width: '90px' },
    { key: 'hitCond', label: '命中条件', type: 'text', width: '240px' },
    { key: 'hits', label: '近30天命中', type: 'text', width: '130px', tag: { kind: 'calc' } },
    {
      key: 'flowState',
      label: '流程状态（上线下线审核）',
      fixed: 'right',
      width: '210px',
      tag: { kind: 'sample', value: 'ruleHub.json.flowState' },
      render: (r: Row) => (
        <FlowStateCell
          flowId={String(r.flowKey ?? '')}
          state={String(r.flowState ?? '')}
          onChange={(s) => setRuleFlow(String(r.id), s)}
        />
      ),
    },
  ];

  const typeOpts = [{ value: '全部', label: '全部类型' }, ...RULE_TYPES.map((t) => ({ value: t, label: t }))];
  const levelOpts = [{ value: '全部', label: '全部等级' }, { value: '高', label: '高' }, { value: '中', label: '中' }, { value: '低', label: '低' }];
  const setOpts = [{ value: '全部', label: '全部规则集' }, ...(d.ruleSets ?? []).map((s) => ({ value: s.id, label: s.name }))];

  /* ===== 需求17 缺口1/2 的跨机构名单网络 / 设备风险命中明细 已移除：跨机构信息已并入「跨机构名单」规则类型，设备风险命中见单客详情 / 进件审核 / 贷中监控大盘 ===== */

  return (
    <ConfigListPage
      title="规则合集"
      crumbPath="规则合集"
      subtitle="全类型规则统一管理（信息核验 / 反欺诈 / 黑名单 / 团伙 / 设备风险 / 跨机构 / 评分 / 行为 / 额度 / 合规）· 上线/下线状态复用「上线下线审核流程」配置"
      addLabel="新建规则"
      onAdd={() => nav('/console/cm/rule-hub?new=1')}
      actions={
        <>
          <Sam value="ruleHub.json" />
          <Sam value="bizFlows.json" />
        </>
      }
      panelTitle="统一规则列表"
      panelDesc="「统一规则」点击任意行进入详情（进入即编辑态），流程状态列联动上线下线审核。"
      stats={
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12 }}>
          <StatCard label="规则总数" value={String(total)} accent="brand" />
          <StatCard label="已生效" value={String(eff)} accent="emerald" />
          <StatCard label="草稿待上线" value={String(total - eff - off)} accent="amber" />
          <StatCard label="高风险规则" value={String(hi)} accent="rose" />
        </div>
      }
      panelActions={
        <div className="flex flex-wrap items-center gap-2">
          <SingleSelect label="规则类型" options={typeOpts} value={ftype} onChange={setFtype} />
          <SingleSelect label="风险等级" options={levelOpts} value={flevel} onChange={setFlevel} />
          <SingleSelect label="规则集" options={setOpts} value={fset} onChange={setFset} />
        </div>
      }
      tabs={[
        { key: 'rules', label: '统一规则', count: rows.length, columns: cols, rows },
      ]}
      onView={(r) => nav('/console/cm/rule-hub?id=' + String(r.id))}
      rowActions={(r) => (
        <span style={{ display: 'inline-flex', gap: 6 }}>
          <Button size="sm" variant="ghost" onClick={() => nav('/console/cm/rule-hub?id=' + String(r.id))}>
            查看
          </Button>
          <Button size="sm" variant="ghost" onClick={() => removeRule(String(r.id))} style={{ color: '#DC2626' }}>
            删除
          </Button>
        </span>
      )}
      editOpen={false}
      editTitle=""
      onCloseEdit={() => {}}
      onSave={() => {}}
    >
      {null}
    </ConfigListPage>
  );
}

/* ---------------- 规则编辑页（详情/新建共用：进入即编辑态，保存与流程按钮同栏） ---------------- */
function RuleForm({ initial, isNew, onBack, onSaved }: {
  initial: RuleItem; isNew: boolean;
  onBack: () => void; onSaved: (c: RuleItem) => void;
}) {
  const hub = useRuleHub();  // P0-01/03：动态读核验项库 / 动作库（新增/停用实时生效）
  const [form, setForm] = useState<RuleItem>({ ...initial });
  const set = (patch: Partial<RuleItem>) => setForm((f) => ({ ...f, ...patch }));
  const [testOpen, setTestOpen] = useState(false);  // P1：模拟测试弹窗

  const handleSave = () => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const base: RuleItem = { ...form, updatedAt: now.slice(0, 10) };
    const by = base.owner || '风控管理员';
    if (isNew) {
      const newId = 'N-' + Date.now().toString(36).toUpperCase();
      const created: RuleItem = pushVersion(
        { ...base, id: newId, flowRef: form.flowRef || 'f-online-approve', flowState: form.flowState || '待上线' },
        by, '初始创建',
      );
      updateRuleHub((dd) => ({ ...dd, rules: [...dd.rules, created] }));
      onSaved(created);
    } else {
      const changed: RuleItem = pushVersion(base, by, '修改保存');  // P2：每次保存生成新版本
      updateRuleHub((dd) => ({ ...dd, rules: dd.rules.map((x) => (x.id === initial.id ? changed : x)) }));
    }
  };

  return (
    <ConfigDetailPage
      title={isNew ? '新建规则' : form.name}
      crumbParts={['规则合集']}
      subtitle={isNew ? '填写规则属性后点「保存」创建' : `规则编号 ${form.id} · 负责人 ${form.owner} · 更新于 ${form.updatedAt}`}
      backLabel="← 返回规则合集"
      onBack={onBack}
      source={
        <>
          <Sam value="ruleHub.json" />
          <span>（规则属性，样例JSON，编辑后保存落盘）</span>
          <Sam value="bizFlows.json" />
          <span>（上线下线审核流程状态机）</span>
        </>
      }
      infoCells={null}
      flowBar={
        <>
          <FlowActionBar
            flowId={form.flowRef}
            state={form.flowState}
            onStateChange={(s) => set({ flowState: s })}
            onSave={handleSave}
          />
          {!isNew && (
            <Button size="sm" variant="secondary" onClick={() => setTestOpen(true)}>模拟测试</Button>
          )}
        </>
      }
    >
      <Panel title="基本信息">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="规则名称" required>
            <Txt value={form.name} onChange={(v) => set({ name: v })} placeholder="如：反欺诈-设备指纹命中" />
          </Field>
          <Field label="规则类型">
            <SingleSelect label="选择类型" fullWidth
              options={RULE_TYPES.map((t) => ({ value: t, label: t }))}
              value={form.ruleType} onChange={(v) => set({ ruleType: v as RuleType })} />
          </Field>
          <Field label="适用范围">
            <Txt value={form.scope} onChange={(v) => set({ scope: v })} placeholder="如：线上消费贷" />
          </Field>
          <Field label="负责人">
            <Txt value={form.owner} onChange={(v) => set({ owner: v })} placeholder="如：风控组" />
          </Field>
          <Field label="归属规则集">
            <SingleSelect label="选择规则集" fullWidth clearable
              options={(hub.ruleSets ?? []).map((s) => ({ value: s.id, label: s.name }))}
              value={form.ruleSet ?? ''} onChange={(v) => set({ ruleSet: v })} />
          </Field>
          <Field label="更新时间">
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-500">{form.updatedAt}</div>
          </Field>
        </div>
      </Panel>

      <Panel title="规则逻辑" desc={form.ruleType === '信息核验'
        ? '这是规则的「总判定」，由下方具体核验项汇总而成。'
        : '一条规则的「判断条件 → 处置动作」，命中后如何处置一目了然。'}>
        {/* 风险等级 · 始终位于「规则逻辑」区块第一行（所有类型通用） */}
        <div className="mb-4 flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
          <span className="shrink-0 text-sm font-medium text-slate-600">风险等级</span>
          <RiskSeg value={form.riskLevel} onChange={(v) => set({ riskLevel: v })} />
        </div>
        {form.ruleType === '信息核验' ? (
          <div className="space-y-4">
            {/* 命中口径 · 汇总判定（信息核验类型专属） */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-brand-50/70 to-white p-4">
              <span className="absolute inset-y-0 left-0 w-1 bg-brand-500" />
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-brand-700">
                <span className="grid h-5 w-12 place-items-center rounded bg-brand-500 text-[10px] font-bold tracking-wider text-white">口径</span>
                命中口径
                <span className="text-[11px] font-normal text-slate-400">· 由下方「信息核验项」汇总判定</span>
              </div>
              <HitModeSeg value={form.hitMode ?? 'any'} onChange={(v) => set({ hitMode: v })} />
              <p className="mt-2 text-xs leading-relaxed text-slate-400">本规则由下方「信息核验项」的各项核验结果，按此口径汇总判断是否命中；具体检查项在下方填写。</p>
            </div>

            {/* 附加命中条件（P0-02：核验项之外的额外结构化条件，可选；所有规则类型均支持） */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-brand-50/70 to-white p-4">
              <span className="absolute inset-y-0 left-0 w-1 bg-brand-500" />
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-brand-700">
                <span className="grid h-5 w-8 place-items-center rounded bg-brand-500 text-[10px] font-bold tracking-wider text-white">IF</span>
                附加命中条件
                <span className="text-[11px] font-normal text-slate-400">· 可选：核验项汇总之外的额外结构化条件（字段+算子+阈值+时间窗口）</span>
              </div>
              <CondGroupEditor
                groups={form.conditions ?? []}
                onChange={(g) => set({ conditions: g, hitCond: summarizeCond(g) })}
              />
              {form.hitCond && (
                <p className="mt-2 text-xs text-slate-400">大白话：<span className="text-slate-600">{form.hitCond}</span></p>
              )}
            </div>

            {/* THEN · 整体处置动作（可选） */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-rose-50/70 to-white p-4">
              <span className="absolute inset-y-0 left-0 w-1 bg-rose-400" />
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-rose-700">
                <span className="grid h-5 w-10 place-items-center rounded bg-rose-400 text-[10px] font-bold tracking-wider text-white">THEN</span>
                整体处置动作（可选）
                <span className="text-[11px] font-normal text-slate-400">· 规则命中后整体执行；留空则按下方各核验项自己的处置动作分别处理</span>
              </div>
              <Txt area value={form.action} onChange={(v) => set({ action: v })} placeholder="如：拒绝并加入灰名单（可留空）" />
            </div>

          </div>
        ) : (
          <div className="space-y-4">
            {/* IF · 命中条件（P0-02：结构化条件编辑器，字段+算子+阈值+时间窗口+且/或） */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-brand-50/70 to-white p-4">
              <span className="absolute inset-y-0 left-0 w-1 bg-brand-500" />
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-brand-700">
                <span className="grid h-5 w-8 place-items-center rounded bg-brand-500 text-[10px] font-bold tracking-wider text-white">IF</span>
                命中条件
                <span className="text-[11px] font-normal text-slate-400">· 结构化配置：选字段 → 比较算子 → 阈值 → 时间窗口；组内可且/或</span>
              </div>
              <CondGroupEditor
                groups={form.conditions ?? []}
                onChange={(g) => set({ conditions: g, hitCond: summarizeCond(g) })}
              />
              {form.hitCond && (
                <p className="mt-2 text-xs text-slate-400">大白话：<span className="text-slate-600">{form.hitCond}</span></p>
              )}
            </div>

            {/* THEN · 处置动作 */}
            <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-r from-rose-50/70 to-white p-4">
              <span className="absolute inset-y-0 left-0 w-1 bg-rose-400" />
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-semibold text-rose-700">
                <span className="grid h-5 w-10 place-items-center rounded bg-rose-400 text-[10px] font-bold tracking-wider text-white">THEN</span>
                处置动作
                <span className="text-[11px] font-normal text-slate-400">· 命中后执行</span>
              </div>
              <Txt area value={form.action} onChange={(v) => set({ action: v })} placeholder="如：拒绝并加入灰名单" />
            </div>

          </div>
        )}
      </Panel>

      <TypeSpecificForm rule={form} set={set} />

      {/* P2：版本历史（保存自动生成，可回滚） */}
      <Panel title="版本历史" desc={<span><Cal label="自动记录" /> 每次「保存」生成新版本，可一键回滚</span>}>
        {(form.versions ?? []).length ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(form.versions ?? []).slice().reverse().map((v, i) => (
              <div key={v.version} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', border: '1px solid #E2E8F0', borderRadius: 8, background: '#fff' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#1D4ED8', background: '#EFF6FF', borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>V{v.version}</span>
                <span style={{ fontSize: 12, color: '#475569', flex: 1 }}>{v.summary}</span>
                <span style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap' }}>{v.at} · {v.by}</span>
                {i !== 0 && (
                  <Button size="sm" variant="ghost" onClick={() => {
                    if (window.confirm(`回滚到 V${v.version}？当前未保存的修改将丢失。`)) {
                      setForm({ ...JSON.parse(JSON.stringify(v.snapshot)) });
                    }
                  }}>回滚</Button>
                )}
              </div>
            ))}
          </div>
        ) : <div style={{ fontSize: 12, color: '#94A3B8' }}>暂无版本历史，保存后自动生成。</div>}
      </Panel>

      {/* P1：模拟测试弹窗 */}
      {testOpen && <TestModal rule={form} onClose={() => setTestOpen(false)} />}
    </ConfigDetailPage>
  );
}

/* 类型专属（可编辑） */
function TypeSpecificForm({ rule, set }: { rule: RuleItem; set: (p: Partial<RuleItem>) => void }) {
  const hub = useRuleHub();  // P0-01/03：动态读核验项库 / 动作库（hook 必须在 switch 前，保持调用顺序稳定）
  switch (rule.ruleType) {
    case '黑名单':
      return (
        <Panel title="类型专属 · 黑名单">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="名单类型"><Txt value={rule.listType ?? ''} onChange={(v) => set({ listType: v })} placeholder="如：信贷黑名单" /></Field>
            <Field label="名单值"><Txt value={rule.listValue ?? ''} onChange={(v) => set({ listValue: v })} placeholder="如：身份证 3301***" /></Field>
            <Field label="加入原因" className="sm:col-span-2"><Txt area value={rule.reason ?? ''} onChange={(v) => set({ reason: v })} placeholder="命中原因说明" /></Field>
          </div>
        </Panel>
      );
    case '团伙识别':
      return (
        <Panel title="类型专属 · 团伙识别">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="成员数"><Num value={rule.memberCount ?? 0} onChange={(v) => set({ memberCount: v })} /></Field>
            <Field label="设备数"><Num value={rule.deviceCount ?? 0} onChange={(v) => set({ deviceCount: v })} /></Field>
            <Field label="团伙特征" className="sm:col-span-2"><Txt area value={rule.gangFeature ?? ''} onChange={(v) => set({ gangFeature: v })} placeholder="如：同设备多账号、集中时段申请" /></Field>
          </div>
        </Panel>
      );
    case '设备风险':
      return (
        <Panel title="类型专属 · 设备风险（动态模型命中明细）">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="模型名"><Txt value={rule.modelName ?? ''} onChange={(v) => set({ modelName: v })} placeholder="如：设备指纹风控模型" /></Field>
            <Field label="命中分"><Num value={rule.hitScore ?? 0} onChange={(v) => set({ hitScore: v })} /></Field>
            <Field label="触发特征（逗号分隔）" className="sm:col-span-2">
              <Txt value={(rule.triggerFeatures ?? []).join('，')} onChange={(v) => set({ triggerFeatures: v.split(/[,，]/).map((s) => s.trim()).filter(Boolean) })} placeholder="如：模拟器，群控，越狱" />
            </Field>
          </div>
        </Panel>
      );
    case '跨机构名单': {
      const up = (i: number, k: keyof RuleItem, v: string | number) =>
        set({ crossInst: (rule.crossInst ?? []).map((x, j) => (j === i ? { ...x, [k]: v } as RuleItem['crossInst'] extends (infer T)[] ? T : never : x)) });
      const rm = (i: number) => set({ crossInst: (rule.crossInst ?? []).filter((_, j) => j !== i) });
      const add = () => set({ crossInst: [...(rule.crossInst ?? []), { inst: '', listType: '', hitCount: 0, hitRate: 0 }] });
      return (
        <Panel title="类型专属 · 跨机构名单（机构 × 名单类型 命中）"
          actions={<Button size="sm" variant="secondary" onClick={add}>+ 添加机构命中</Button>}>
          {(rule.crossInst ?? []).length === 0 && (
            <div className="mb-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-6 text-center text-sm text-slate-400">暂无机构命中数据</div>
          )}
          <div className="space-y-3">
            {(rule.crossInst ?? []).map((c, i) => (
              <div key={i} className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-3 sm:grid-cols-4">
                <Txt value={c.inst} onChange={(v) => up(i, 'inst', v)} placeholder="机构" />
                <Txt value={c.listType} onChange={(v) => up(i, 'listType', v)} placeholder="名单类型" />
                <Num value={c.hitCount} onChange={(v) => up(i, 'hitCount', v)} />
                <div className="flex items-center gap-2">
                  <Num value={c.hitRate} onChange={(v) => up(i, 'hitRate', v)} />
                  <button type="button" onClick={() => rm(i)} className="shrink-0 px-1 text-rose-500 hover:text-rose-700">×</button>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      );
    }
    case '评分模型':
      return (
        <Panel title="类型专属 · 评分模型">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="业务场景"><Txt value={rule.scene ?? ''} onChange={(v) => set({ scene: v })} placeholder="如：贷中行为评分" /></Field>
            <Field label="评分阈值"><Txt value={rule.scoreThreshold ?? ''} onChange={(v) => set({ scoreThreshold: v })} placeholder="如：< 600" /></Field>
          </div>
        </Panel>
      );
    case '信息核验': {
      const cur = rule.verifyItems ?? [];
      const lib = hub.actionLib ?? [];
      // P0-01：核验项下拉 = 核验项库中「启用」项（停用项不再可选）；需求35：触发条件下拉 = 可维护的「核验条件库」；P0-03：动作下拉 = 动作库
      const itemOpts = mergeOpts((hub.verifyCatalog ?? []).filter((v) => v.status === '启用').map((v) => v.name), cur.map((i) => i.item));
      const condOpts = mergeOpts((hub.condLib ?? []).map((c) => c.name), cur.map((i) => i.cond));
      const actionOpts = mergeOpts(lib.map((a) => a.name), cur.map((i) => i.action));
      const up = (i: number, k: 'item' | 'cond' | 'action', v: string) => {
        if (k === 'action') {
          const ref = lib.find((a) => a.name === v);
          set({ verifyItems: cur.map((x, j) => (j === i ? { ...x, action: v, actionRef: ref?.id ?? x.actionRef } : x)) });
        } else {
          set({ verifyItems: cur.map((x, j) => (j === i ? { ...x, [k]: v } : x)) });
        }
      };
      const rm = (i: number) => set({ verifyItems: cur.filter((_, j) => j !== i) });
      const add = () => set({ verifyItems: [...cur, { item: '', cond: '', action: '', actionRef: undefined }] });
      return (
        <Panel
          title="类型专属 · 信息核验项"
          desc="构成该规则的具体核验明细（身份 / 银行卡 / 运营商 / 生物识别 / 设备 / 风险名单）。每项各自不通过时按本项处置动作处理，并计入上方「命中口径」汇总判定。"
          actions={<Button size="sm" variant="secondary" onClick={add}>+ 添加核验项</Button>}
        >
          {/* 结构说明：让三列不"不明不白"地出现 */}
          <div className="mb-3 rounded-xl border border-brand-100 bg-brand-50/40 px-4 py-3 text-xs leading-relaxed text-slate-500">
            每一行 = <span className="font-medium text-slate-700">一个具体核验</span>：先选「核验项」（来自信息核验产品的标准核验项库），再（可选）设定它在什么「触发条件」下算<span className="text-rose-600">不通过</span>，以及不通过时执行什么「处置动作」。所有核验项按上方「命中口径」汇总判定本规则是否命中。
          </div>
          {(rule.verifyItems ?? []).length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center text-sm text-slate-400">
              暂无核验项，点击右上角「+ 添加核验项」即可开始配置（下面三列各代表什么，见上方说明）
            </div>
          )}
          {/* 列头（仅宽屏显示，与每行三列对齐，带副说明避免歧义） */}
          <div className="hidden items-start gap-3 px-1 sm:flex">
            <span className="w-6 shrink-0" />
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-400">核验项</div>
              <div className="text-[10px] leading-tight text-slate-300">从标准核验项库选一项</div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-400">触发条件（可选）</div>
              <div className="text-[10px] leading-tight text-slate-300">从「核验条件库」选择 · 来源可在核验项库页维护</div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-medium text-slate-400">处置动作（可选）</div>
              <div className="text-[10px] leading-tight text-slate-300">从「动作库」选择</div>
            </div>
            <span className="w-7 shrink-0" />
          </div>
          <div className="space-y-2.5">
            {(rule.verifyItems ?? []).map((it, i) => (
              <div key={i} className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3 transition hover:border-brand-200 hover:shadow-sm">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-50 text-xs font-semibold text-brand-600">{i + 1}</span>
                <div className="grid flex-1 gap-3 sm:grid-cols-3">
                  <SingleSelect label="选择核验项" fullWidth clearable
                    options={itemOpts} value={it.item} onChange={(v) => up(i, 'item', v)} />
                  <SingleSelect label="选择条件（条件库）" fullWidth clearable
                    options={condOpts} value={it.cond} onChange={(v) => up(i, 'cond', v)} />
                  <div>
                    <SingleSelect label="选择动作（动作库）" fullWidth clearable
                      options={actionOpts} value={it.action} onChange={(v) => up(i, 'action', v)} />
                    {it.action && (() => {
                      const a = lib.find((x) => x.name === it.action);
                      return a ? (
                        <div className="mt-1 text-[10px] leading-tight text-slate-400">
                          目标 {a.target} · 通知 {a.notifyTo} · {a.needApprove ? '需审批' : '免审批'}
                          <span className="text-slate-300">（参数在「动作库」维护）</span>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
                <button type="button" onClick={() => rm(i)} title="删除该核验项"
                  className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg text-slate-300 transition hover:bg-rose-50 hover:text-rose-500">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
                </button>
              </div>
            ))}
          </div>
        </Panel>
      );
    }
    default:
      return (
        <Panel title="类型专属信息">
          <div className="text-sm text-slate-400">该规则类型无额外专属属性，逻辑见「规则逻辑」块。</div>
        </Panel>
      );
  }
}

/* ---------------- 表单输入小部件（继承项目 Panel / Input 观感） ---------------- */
/* 标准候选 + 当前规则已填值 合并去重：保证历史自由文本数据仍能正确回显，同时提供标准候选 */
function mergeOpts(base: string[], extra: string[]): { value: string; label: string }[] {
  const seen = new Set<string>();
  const out: { value: string; label: string }[] = [];
  for (const s of [...base, ...extra]) {
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push({ value: s, label: s });
  }
  return out;
}
const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
function Field({ label, required, className = '', children }: { label: string; required?: boolean; className?: string; children: ReactNode }) {
  return (
    <div className={className}>
      <div className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-500">
        {label}
        {required && <span className="text-rose-500">*</span>}
      </div>
      {children}
    </div>
  );
}
function Txt({ value, onChange, placeholder, area }: { value: string; onChange: (v: string) => void; placeholder?: string; area?: boolean }) {
  if (area) return <textarea value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls + ' min-h-[64px] resize-y'} />;
  return <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />;
}
function Num({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} className={inputCls} />;
}

/* 风险等级 · 分段选择器（高/中/低，语义配色） */
function RiskSeg({ value, onChange }: { value: RiskLevel; onChange: (v: RiskLevel) => void }) {
  const map: { v: RiskLevel; activeCls: string; dotCls: string }[] = [
    { v: '高', activeCls: 'bg-rose-500 text-white border-rose-500', dotCls: 'bg-rose-500' },
    { v: '中', activeCls: 'bg-amber-500 text-white border-amber-500', dotCls: 'bg-amber-500' },
    { v: '低', activeCls: 'bg-emerald-500 text-white border-emerald-500', dotCls: 'bg-emerald-500' },
  ];
  return (
    <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {map.map((m) => {
        const active = value === m.v;
        return (
            <button key={m.v} type="button" onClick={() => onChange(m.v)}
            className={`flex items-center gap-1.5 rounded-md border border-transparent px-5 py-1.5 text-sm font-medium transition ${active ? m.activeCls : 'text-slate-500 hover:bg-white'}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-white' : m.dotCls}`} />
            {m.v}
          </button>
        );
      })}
    </div>
  );
}

/* 命中口径 · 分段选择器（信息核验类型：任一不通过 / 全部不通过） */
function HitModeSeg({ value, onChange }: { value: 'any' | 'all'; onChange: (v: 'any' | 'all') => void }) {
  const map: { v: 'any' | 'all'; label: string }[] = [
    { v: 'any', label: '任一核验项不通过即命中' },
    { v: 'all', label: '全部核验项都不通过才命中' },
  ];
  return (
    <div className="inline-flex flex-wrap rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {map.map((m) => {
        const active = value === m.v;
        return (
          <button key={m.v} type="button" onClick={() => onChange(m.v)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${active ? 'bg-brand-600 text-white shadow-sm' : 'text-slate-500 hover:bg-white'}`}>
            {m.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- P0-02 结构化条件编辑器：字段 + 算子 + 阈值 + 时间窗口；组内且/或，组间「且」 ---------- */
function CondGroupEditor({ groups, onChange }: { groups: RuleCondGroup[]; onChange: (g: RuleCondGroup[]) => void }) {
  const set = (arr: RuleCondGroup[]) => onChange(arr);
  const addGroup = () => set([...groups, { logic: 'AND', rows: [{ field: '', op: '≥', value: '', window: '不限' }] }]);
  const patchGroup = (i: number, g: RuleCondGroup) => set(groups.map((x, k) => (k === i ? g : x)));
  const patchRow = (i: number, j: number, p: Partial<RuleCondRow>) =>
    patchGroup(i, { ...groups[i], rows: groups[i].rows.map((r, k) => (k === j ? { ...r, ...p } : r)) });
  const addRow = (i: number) => patchGroup(i, { ...groups[i], rows: [...groups[i].rows, { field: '', op: '≥', value: '', window: '不限' }] });
  const delRow = (i: number, j: number) => patchGroup(i, { ...groups[i], rows: groups[i].rows.filter((_, k) => k !== j) });

  if (groups.length === 0) {
    return (
      <div>
        <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-4 py-4 text-center text-sm text-slate-400">
          暂无结构化条件 —— 点击下方「＋ 添加条件组」开始配置
        </div>
        <button type="button" onClick={addGroup} className="mt-2 rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50">
          ＋ 添加条件组
        </button>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {groups.map((g, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">条件组 {i + 1}</span>
              <span className="text-[11px] text-slate-300">组内逻辑</span>
              <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                {(['AND', 'OR'] as const).map((l) => (
                  <button key={l} type="button" onClick={() => patchGroup(i, { ...g, logic: l })}
                    className={`rounded-md px-2.5 py-0.5 text-[11px] font-medium transition ${g.logic === l ? 'bg-brand-600 text-white' : 'text-slate-500 hover:bg-white'}`}>
                    {l === 'AND' ? '且' : '或'}
                  </button>
                ))}
              </div>
            </div>
            <button type="button" onClick={() => set(groups.filter((_, k) => k !== i))} className="text-xs text-rose-500 hover:text-rose-700">删除组</button>
          </div>
          <div className="space-y-1.5">
            {g.rows.map((r, j) => (
              <div key={j} className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <SingleSelect label="" fullWidth clearable options={mergeOpts(COND_FIELD_OPTIONS, [r.field])} value={r.field}
                    onChange={(v) => patchRow(i, j, { field: v })} />
                </div>
                <div className="w-16 shrink-0">
                  <SingleSelect label="" fullWidth options={COND_OP_OPTIONS.map((o) => ({ value: o, label: o }))} value={r.op}
                    onChange={(v) => patchRow(i, j, { op: v })} />
                </div>
                <input value={r.value} onChange={(e) => patchRow(i, j, { value: e.target.value })} placeholder="阈值"
                  className={inputCls} style={{ maxWidth: 110 }} />
                <div className="w-24 shrink-0">
                  <SingleSelect label="" fullWidth options={COND_WINDOW_OPTIONS.map((o) => ({ value: o, label: o }))} value={r.window ?? '不限'}
                    onChange={(v) => patchRow(i, j, { window: v })} />
                </div>
                <button type="button" onClick={() => delRow(i, j)} className="shrink-0 text-slate-300 hover:text-rose-500">×</button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => addRow(i)} className="mt-1.5 text-xs text-brand-600 hover:text-brand-700">＋ 添加条件行</button>
        </div>
      ))}
      <button type="button" onClick={addGroup} className="rounded-lg border border-brand-300 bg-white px-3 py-1.5 text-xs font-medium text-brand-600 hover:bg-brand-50">
        ＋ 添加条件组
      </button>
    </div>
  );
}

/* ---------- P1 模拟测试：输入测试样本 → 判定规则是否命中 + 命中链路明细 ---------- */
function TestModal({ rule, onClose }: { rule: RuleItem; onClose: () => void }) {
  const groups = rule.conditions ?? [];
  const vItems = rule.verifyItems ?? [];
  const [vals, setVals] = useState<Record<string, string>>({});
  const [itemPass, setItemPass] = useState<Record<number, boolean>>({});
  const [res, setRes] = useState<null | { hit: boolean; rows: { text: string; ok: boolean }[] }>(null);

  const run = () => {
    const rows: { text: string; ok: boolean }[] = [];
    let condHit = true;
    if (groups.length) {
      groups.forEach((g, gi) => {
        const rowOks = g.rows.map((r, ri) => {
          const input = String(vals[gi + ':' + ri] ?? '');
          const n = Number(input); const tn = Number(r.value);
          let ok = false;
          switch (r.op) {
            case '≥': ok = n >= tn; break; case '≤': ok = n <= tn; break;
            case '>': ok = n > tn; break; case '<': ok = n < tn; break;
            case '=': ok = n === tn; break; case '≠': ok = n !== tn; break;
            case '包含': ok = input.includes(r.value); break;
            case '命中': ok = input === r.value; break;
            case '不为空': ok = input !== ''; break;
            default: ok = true;
          }
          rows.push({ text: `【组${gi + 1}】${r.field} ${r.op} ${r.value} → 输入「${input || '—'}」`, ok });
          return ok;
        });
        const gOk = g.logic === 'AND' ? rowOks.every(Boolean) : rowOks.some(Boolean);
        if (!gOk) condHit = false;
      });
    }
    let itemHit = true;
    if (vItems.length) {
      const fails = vItems.map((_, i) => !(itemPass[i] ?? true)).filter(Boolean).length;
      itemHit = rule.hitMode === 'all' ? fails === vItems.length : fails > 0;
      rows.push({
        text: `信息核验（${rule.hitMode === 'all' ? '全部不通过才命中' : '任一不通过即命中'}）→ ${fails} 项不通过`,
        ok: itemHit,
      });
      if (!itemHit) condHit = false;
    }
    const nothing = !groups.length && !vItems.length;
    if (nothing) condHit = false;
    setRes({ hit: !nothing && condHit && itemHit, rows });
  };

  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.4)', zIndex: 60 }} />
      <div style={{ position: 'fixed', top: '6%', left: '50%', transform: 'translateX(-50%)', width: 620, maxWidth: '94vw', maxHeight: '86vh', overflowY: 'auto', background: '#fff', borderRadius: 14, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', zIndex: 61, padding: 22 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1E293B' }}>规则模拟测试</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{rule.name}（{rule.id}）· 输入样本后点「执行测试」看是否命中</div>
          </div>
          <span onClick={onClose} style={{ cursor: 'pointer', fontSize: 20, color: '#94A3B8', lineHeight: 1 }}>×</span>
        </div>

        {groups.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>结构化命中条件（输入测试值）</div>
            {groups.map((g, gi) => (
              <div key={gi} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 10, marginBottom: 8 }}>
                <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>条件组 {gi + 1}（组内 {g.logic === 'AND' ? '且' : '或'}）</div>
                {g.rows.map((r, ri) => (
                  <div key={ri} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, color: '#475569', flex: 1 }}>{r.field} {r.op} {r.value}</span>
                    <input
                      value={vals[gi + ':' + ri] ?? ''}
                      onChange={(e) => setVals((v) => ({ ...v, [gi + ':' + ri]: e.target.value }))}
                      placeholder="输入测试值"
                      style={{ width: 150, border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 10px', fontSize: 12, outline: 'none' }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {vItems.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 8 }}>信息核验项（切换每项是否通过）</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {vItems.map((it, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, border: '1px solid #F1F5F9', borderRadius: 8, padding: '6px 10px' }}>
                  <span style={{ fontSize: 12, color: '#334155', flex: 1 }}>{it.item} <span style={{ color: '#94A3B8' }}>（{it.cond || '无条件'}）</span></span>
                  <button type="button" onClick={() => setItemPass((m) => ({ ...m, [i]: !(m[i] ?? true) }))}
                    style={{ fontSize: 11, padding: '2px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: (itemPass[i] ?? true) ? '#DC2626' : '#059669', color: '#fff' }}>
                    {(itemPass[i] ?? true) ? '通过' : '不通过'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!groups.length && !vItems.length && (
          <div style={{ fontSize: 12, color: '#D97706', background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 8, padding: '8px 12px', marginBottom: 12 }}>
            该规则尚未配置结构化条件或核验项，无法测试。
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button type="button" onClick={run}
            style={{ padding: '6px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', background: '#2563EB', color: '#fff', fontSize: 13, fontWeight: 600 }}>
            执行测试
          </button>
          <button type="button" onClick={() => { setRes(null); setVals({}); setItemPass({}); }}
            style={{ padding: '6px 16px', borderRadius: 8, border: '1px solid #E2E8F0', cursor: 'pointer', background: '#fff', color: '#64748B', fontSize: 13 }}>
            重置
          </button>
        </div>

        {res && (
          <div style={{ border: '1px solid ' + (res.hit ? '#FECACA' : '#BBF7D0'), borderRadius: 10, background: res.hit ? '#FEF2F2' : '#F0FDF4', padding: 12 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: res.hit ? '#DC2626' : '#059669', marginBottom: 8 }}>
              {res.hit ? '✓ 规则命中 —— 将执行处置动作：' + (rule.action || '—') : '✗ 规则未命中'}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {res.rows.map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                  <span style={{ color: r.ok ? '#059669' : '#DC2626', fontWeight: 700, width: 14 }}>{r.ok ? '✓' : '✗'}</span>
                  <span style={{ color: r.ok ? '#166534' : '#991B1B' }}>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
