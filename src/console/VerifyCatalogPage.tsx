/* 管理中心 · 规则组件库（三库合一：核验项库 / 触发条件库 / 动作库，需求35 + P0-03）—— 独立二级页面（cm:rule-hub-items）
 * 三个 Tab：
 *  - 核验项库：渠道/数据源/供应商/计费/可用状态 + 接口接入 + 对接参数（入参/出参）；
 *  - 触发条件库：规则合集「信息核验项 → 触发条件」下拉的来源（可新增/编辑/删除）；
 *  - 动作库：处置动作模板（目标系统/通知人/是否审批/补充动作），规则合集「处置动作」从此选择。
 * 数据存 ruleHub.json.verifyCatalog / condLib / actionLib（样例橘 Sam）。
 */
import { useState } from 'react';
import { Button, SingleSelect, type Column, type Row } from '../components/ui';
import { ConfigListPage } from './ConfigTemplate';
import { useRuleHub, updateRuleHub, type VerifyItemDef, type CondLibItem, type ActionItem, type VerifyNormalizer, NORM_OP_OPTIONS, APPLY_FIELD_OPTIONS, COND_CATS, COND_CAT_KIND } from './ruleHubData';

const CATS = ['身份核验', '银行卡核验', '运营商核验', '生物识别', '设备核验', '风险名单'];
const CAT_KIND: Record<string, 'blue' | 'violet' | 'cyan' | 'green' | 'orange' | 'red' | 'gray'> = {
  身份核验: 'blue', 银行卡核验: 'violet', 运营商核验: 'cyan', 生物识别: 'green', 设备核验: 'orange', 风险名单: 'red',
};
const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <div className="mb-1.5 text-xs font-medium text-slate-500">{label}</div>
    {children}
  </div>
);
const Toggle = ({ v, onChange }: { v: boolean; onChange: (n: boolean) => void }) => (
  <button type="button" onClick={() => onChange(!v)}
    style={{
      width: 34, height: 20, borderRadius: 999, border: 'none', cursor: 'pointer',
      background: v ? '#2563EB' : '#CBD5E1', position: 'relative', transition: 'background .15s',
    }}>
    <span style={{
      position: 'absolute', top: 2, left: v ? 16 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s',
    }} />
  </button>
);

export default function VerifyCatalogPage() {
  const d = useRuleHub();
  const list = d.verifyCatalog ?? [];
  const conds = d.condLib ?? [];
  const actions = d.actionLib ?? [];
  const [tab, setTab] = useState<'items' | 'conds' | 'actions'>('items');

  // 核验项编辑态
  const [edit, setEdit] = useState<VerifyItemDef | null>(null);
  const [isNew, setIsNew] = useState(false);
  // 条件编辑态
  const [editCond, setEditCond] = useState<CondLibItem | null>(null);
  const [isNewCond, setIsNewCond] = useState(false);
  // 动作编辑态
  const [editAction, setEditAction] = useState<ActionItem | null>(null);
  const [isNewAction, setIsNewAction] = useState(false);

  /* ---- 核验项操作 ---- */
  const openNewItem = () => { setIsNew(true); setEdit({ id: '', name: '', cat: CATS[0], source: '', vendor: '', price: 0, status: '启用', desc: '', api: '', timeout: 800, qps: 100, doc: '', protocol: 'HTTP POST JSON', auth: 'Token', requestParams: [], responseParams: [], normalizers: [] }); };
  const openEditItem = (v: VerifyItemDef) => { setIsNew(false); setEdit({ ...v }); };
  const saveItem = () => {
    if (!edit) return;
    if (isNew) {
      const id = 'V' + Date.now().toString(36).toUpperCase();
      updateRuleHub((dd) => ({ ...dd, verifyCatalog: [...(dd.verifyCatalog ?? []), { ...edit, id }] }));
    } else {
      updateRuleHub((dd) => ({ ...dd, verifyCatalog: (dd.verifyCatalog ?? []).map((x) => (x.id === edit.id ? edit : x)) }));
    }
    setEdit(null);
  };
  const toggleStatus = (v: VerifyItemDef) =>
    updateRuleHub((dd) => ({ ...dd, verifyCatalog: (dd.verifyCatalog ?? []).map((x) => (x.id === v.id ? { ...x, status: x.status === '启用' ? '停用' : '启用' } : x)) }));

  /* ---- 触发条件操作 ---- */
  const openNewCond = () => { setIsNewCond(true); setEditCond({ id: '', name: '', cat: '', desc: '' }); };
  const openEditCond = (c: CondLibItem) => { setIsNewCond(false); setEditCond({ ...c }); };
  const saveCond = () => {
    if (!editCond) return;
    if (isNewCond) {
      const id = 'C' + Date.now().toString(36).toUpperCase();
      updateRuleHub((dd) => ({ ...dd, condLib: [...(dd.condLib ?? []), { ...editCond, id }] }));
    } else {
      updateRuleHub((dd) => ({ ...dd, condLib: (dd.condLib ?? []).map((x) => (x.id === editCond.id ? editCond : x)) }));
    }
    setEditCond(null);
  };
  const removeCond = (c: CondLibItem) => {
    if (!window.confirm(`确认删除条件「${c.name}」？已引用该条件的规则仍保留原文本。`)) return;
    updateRuleHub((dd) => ({ ...dd, condLib: (dd.condLib ?? []).filter((x) => x.id !== c.id) }));
  };
  // 条件被哪些规则引用
  const usedCondCount = (name: string) => (d.rules ?? []).filter((r) => (r.verifyItems ?? []).some((i) => i.cond === name)).length;
  // 动作被哪些规则引用
  const usedActionCount = (name: string) => (d.rules ?? []).filter((r) => (r.verifyItems ?? []).some((i) => i.action === name)).length;

  /* ---- 处置动作操作 ---- */
  const openNewAction = () => { setIsNewAction(true); setEditAction({ id: '', name: '', target: '', notifyTo: '', needApprove: false, extra: '', desc: '' }); };
  const openEditAction = (v: ActionItem) => { setIsNewAction(false); setEditAction({ ...v }); };
  const saveAction = () => {
    if (!editAction) return;
    if (isNewAction) {
      const id = 'A' + Date.now().toString(36).toUpperCase();
      updateRuleHub((dd) => ({ ...dd, actionLib: [...(dd.actionLib ?? []), { ...editAction, id }] }));
    } else {
      updateRuleHub((dd) => ({ ...dd, actionLib: (dd.actionLib ?? []).map((x) => (x.id === editAction.id ? editAction : x)) }));
    }
    setEditAction(null);
  };
  const removeAction = (v: ActionItem) => {
    if (!window.confirm(`确认删除动作「${v.name}」？已引用该动作的规则仍保留原动作文本。`)) return;
    updateRuleHub((dd) => ({ ...dd, actionLib: (dd.actionLib ?? []).filter((x) => x.id !== v.id) }));
  };

  /* ---- 核验项列表 ---- */
  const itemRows: Row[] = list.map((v) => ({
    id: v.id,
    name: v.name,
    cat: { v: v.cat, kind: CAT_KIND[v.cat] ?? 'gray' },
    source: v.source,
    vendor: v.vendor,
    api: v.api ?? '—',
    price: v.price === 0 ? '免费' : `¥${v.price}/次`,
    status: { v: v.status, kind: v.status === '启用' ? 'green' : 'gray' },
  }));
  const itemCols: Column[] = [
    { key: 'name', label: '核验项', type: 'text' },
    { key: 'cat', label: '渠道', type: 'badge', badgeKind: 'blue', width: '110px' },
    { key: 'source', label: '数据源', type: 'text', width: '140px' },
    { key: 'vendor', label: '供应商', type: 'text', width: '100px' },
    { key: 'api', label: '接口', type: 'text', width: '170px' },
    { key: 'price', label: '计费', type: 'text', width: '80px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'green', width: '80px' },
  ];

  /* ---- 触发条件列表 ---- */
  const condRows: Row[] = conds.map((c) => ({
    id: c.id,
    name: c.name,
    cat: { v: c.cat ?? '通用', kind: COND_CAT_KIND[c.cat ?? '通用'] ?? 'gray' },
    desc: c.desc ?? '—',
    used: `${usedCondCount(c.name)} 条规则`,
  }));
  const condCols: Column[] = [
    { key: 'name', label: '触发条件', type: 'text' },
    { key: 'cat', label: '分类', type: 'badge', badgeKind: 'blue', width: '110px' },
    { key: 'desc', label: '说明', type: 'text' },
    { key: 'used', label: '被引用', type: 'text', width: '100px' },
  ];

  /* ---- 处置动作列表 ---- */
  const actionRows: Row[] = actions.map((a) => ({
    id: a.id,
    name: a.name,
    target: a.target,
    notifyTo: a.notifyTo,
    approve: { v: a.needApprove ? '需审批' : '免审批', kind: a.needApprove ? 'amber' : 'green' },
    extra: a.extra,
    used: `${usedActionCount(a.name)} 条规则`,
  }));
  const actionCols: Column[] = [
    { key: 'name', label: '动作名称', type: 'text' },
    { key: 'target', label: '目标系统', type: 'text', width: '110px' },
    { key: 'notifyTo', label: '通知人', type: 'text', width: '150px' },
    { key: 'approve', label: '审批', type: 'badge', badgeKind: 'amber', width: '80px' },
    { key: 'extra', label: '补充动作', type: 'text', width: '240px' },
    { key: 'used', label: '被引用', type: 'text', width: '100px' },
  ];

  const isItems = tab === 'items';
  const isConds = tab === 'conds';
  const isActions = tab === 'actions';

  return (
    <>
      <ConfigListPage
        title="规则组件库"
        crumbPath="规则集合 / 规则组件库"
        subtitle="统一维护规则引擎的三套基础组件：核验项（第三方接口接入与返回值归一化映射）、触发条件（标准枚举、命中判定）、处置动作（命中后的处置模板）。"
        stats={
          <div className="flex gap-1 border-b border-slate-200">
            {([
              ['items', `核验项库（${list.length}）`],
              ['conds', `触发条件库（${conds.length}）`],
              ['actions', `动作库（${actions.length}）`],
            ] as ['items' | 'conds' | 'actions', string][]).map(([k, label]) => (
              <button key={k} type="button" onClick={() => { setTab(k); setEdit(null); setEditCond(null); setEditAction(null); }}
                className={`px-4 py-2 text-sm font-medium ${tab === k ? 'border-b-2 border-brand-600 text-brand-600' : 'border-b-2 border-transparent text-slate-500 hover:text-slate-700'}`}>
                {label}
              </button>
            ))}
          </div>
        }
        panelTitle={isItems ? '核验项列表' : isConds ? '触发条件列表' : '动作列表'}
        panelDesc={isItems
          ? '「停用」后规则编辑的下拉中不再出现该核验项，已引用规则不受影响。'
          : isConds
            ? '新增的条件会立即出现在规则合集「信息核验项 → 触发条件」下拉中；删除仅移除选项，已引用规则保留原文本。'
            : '规则命中后的处置动作模板。参数在动作库集中维护，规则编辑时只选择动作名；「删除」仅移除模板，已引用规则保留原动作文本。'}
        panelActions={
          <Button size="sm" onClick={isItems ? openNewItem : isConds ? openNewCond : openNewAction}>
            {isItems ? '新建核验项' : isConds ? '新建触发条件' : '新建动作'}
          </Button>
        }
        columns={isItems ? itemCols : isConds ? condCols : actionCols}
        rows={isItems ? itemRows : isConds ? condRows : actionRows}
        onView={(r) => {
          if (isItems) { const f = list.find((x) => x.id === String(r.id)); if (f) openEditItem(f); }
          else if (isConds) { const c = conds.find((x) => x.id === String(r.id)); if (c) openEditCond(c); }
          else { const a = actions.find((x) => x.id === String(r.id)); if (a) openEditAction(a); }
        }}
        rowActions={(r) => {
          if (isItems) {
            const v = list.find((x) => x.id === String(r.id));
            return v ? (
              <span style={{ display: 'inline-flex', gap: 6 }}>
                <Button size="sm" variant="ghost" onClick={() => openEditItem(v)}>编辑</Button>
                <Button size="sm" variant="ghost" onClick={() => toggleStatus(v)}
                  style={{ color: v.status === '启用' ? '#DC2626' : '#059669' }}>{v.status === '启用' ? '停用' : '启用'}</Button>
              </span>
            ) : null;
          }
          if (isConds) {
            const c = conds.find((x) => x.id === String(r.id));
            return c ? (
              <span style={{ display: 'inline-flex', gap: 6 }}>
                <Button size="sm" variant="ghost" onClick={() => openEditCond(c)}>编辑</Button>
                <Button size="sm" variant="ghost" onClick={() => removeCond(c)} style={{ color: '#DC2626' }}>删除</Button>
              </span>
            ) : null;
          }
          const a = actions.find((x) => x.id === String(r.id));
          return a ? (
            <span style={{ display: 'inline-flex', gap: 6 }}>
              <Button size="sm" variant="ghost" onClick={() => openEditAction(a)}>编辑</Button>
              <Button size="sm" variant="ghost" onClick={() => removeAction(a)} style={{ color: '#DC2626' }}>删除</Button>
            </span>
          ) : null;
        }}
        editOpen={edit != null || editCond != null || editAction != null}
        editTitle={isItems
          ? (isNew ? '新建核验项' : `编辑核验项 · ${edit?.name ?? ''}`)
          : isConds
            ? (isNewCond ? '新建触发条件' : `编辑触发条件 · ${editCond?.name ?? ''}`)
            : (isNewAction ? '新建动作' : `编辑动作 · ${editAction?.name ?? ''}`)}
        onCloseEdit={() => { setEdit(null); setEditCond(null); setEditAction(null); }}
        onSave={isItems ? saveItem : isConds ? saveCond : saveAction}
        modalWidth="max-w-2xl"
      >
        {/* ---- 核验项表单 ---- */}
        {isItems && edit && (
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="核验项名称 *"><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="如：运营商在网时长核验" /></F>
            <F label="渠道">
              <SingleSelect label="渠道" fullWidth options={CATS.map((c) => ({ value: c, label: c }))} value={edit.cat} onChange={(v) => setEdit({ ...edit, cat: v })} />
            </F>
            <F label="数据源"><input className={inputCls} value={edit.source} onChange={(e) => setEdit({ ...edit, source: e.target.value })} placeholder="如：公安部 NCIIC / 银联 / 三大运营商" /></F>
            <F label="供应商"><input className={inputCls} value={edit.vendor} onChange={(e) => setEdit({ ...edit, vendor: e.target.value })} placeholder="如：银联数据 / 同盾 / 聚信立" /></F>
            <F label="计费（元/次）">
              <input type="number" min={0} step={0.1} className={inputCls} value={edit.price} onChange={(e) => setEdit({ ...edit, price: Number(e.target.value) || 0 })} />
            </F>
            <F label="状态">
              <SingleSelect label="状态" fullWidth options={[{ value: '启用', label: '启用' }, { value: '停用', label: '停用' }]} value={edit.status} onChange={(v) => setEdit({ ...edit, status: v as VerifyItemDef['status'] })} />
            </F>
            <div className="sm:col-span-2">
              <F label="说明"><textarea className={inputCls + ' min-h-[60px] resize-y'} value={edit.desc ?? ''} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} placeholder="该核验项核验什么、判定口径" /></F>
            </div>
            {/* 接口接入信息 */}
            <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span style={{ width: 3, height: 12, borderRadius: 2, background: '#2563EB', display: 'inline-block' }} />
                接口接入信息（API 调用配置）
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-3">
                  <F label="接口地址 / 服务名"><input className={inputCls} value={edit.api ?? ''} onChange={(e) => setEdit({ ...edit, api: e.target.value })} placeholder="如：nciic.realname.v1" /></F>
                </div>
                <F label="超时（毫秒）">
                  <input type="number" min={100} step={100} className={inputCls} value={edit.timeout ?? ''} onChange={(e) => setEdit({ ...edit, timeout: Number(e.target.value) || 0 })} />
                </F>
                <F label="并发 QPS（次/秒）">
                  <input type="number" min={1} className={inputCls} value={edit.qps ?? ''} onChange={(e) => setEdit({ ...edit, qps: Number(e.target.value) || 0 })} />
                </F>
                <F label="对接文档链接">
                  <input className={inputCls} value={edit.doc ?? ''} onChange={(e) => setEdit({ ...edit, doc: e.target.value })} placeholder="如：/docs/verify/realname" />
                </F>
              </div>
            </div>
            {/* 对接参数 */}
            <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span style={{ width: 3, height: 12, borderRadius: 2, background: '#2563EB', display: 'inline-block' }} />
                对接参数（请求入参 / 返回出参）
              </div>
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <F label="对接协议">
                  <SingleSelect label="协议" fullWidth clearable
                    options={['HTTP POST JSON', 'HTTP GET', 'SDK'].map((p) => ({ value: p, label: p }))}
                    value={edit.protocol ?? ''} onChange={(v) => setEdit({ ...edit, protocol: v })} />
                </F>
                <F label="认证方式">
                  <SingleSelect label="认证" fullWidth clearable
                    options={['Token', 'AK-SK', '无'].map((a) => ({ value: a, label: a }))}
                    value={edit.auth ?? ''} onChange={(v) => setEdit({ ...edit, auth: v })} />
                </F>
              </div>
              {/* 请求入参 */}
              <div className="mb-3">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="text-xs font-medium text-slate-500">请求入参（「数据来源」= 从申请人哪个字段取）</span>
                  <Button size="sm" variant="secondary" onClick={() => setEdit({ ...edit, requestParams: [...(edit.requestParams ?? []), { name: '', label: '', required: true, source: '' }] })}>+ 加入参</Button>
                </div>
                {(edit.requestParams ?? []).length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-3 text-center text-xs text-slate-400">暂无入参</div>
                )}
                {(edit.requestParams ?? []).map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    <input className={inputCls} style={{ width: 120 }} value={p.name} onChange={(e) => setEdit({ ...edit, requestParams: (edit.requestParams ?? []).map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })} placeholder="参数名" />
                    <input className={inputCls} style={{ width: 110 }} value={p.label} onChange={(e) => setEdit({ ...edit, requestParams: (edit.requestParams ?? []).map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} placeholder="含义" />
                    <SingleSelect label="" fullWidth clearable
                      options={APPLY_FIELD_OPTIONS.map((s) => ({ value: s, label: s }))}
                      value={p.source} onChange={(v) => setEdit({ ...edit, requestParams: (edit.requestParams ?? []).map((x, k) => (k === i ? { ...x, source: v } : x)) })} />
                    <button type="button" onClick={() => { const r = (edit.requestParams ?? []).map((x, k) => (k === i ? { ...x, required: !x.required } : x)); setEdit({ ...edit, requestParams: r }); }}
                      style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0', cursor: 'pointer', background: p.required ? '#EFF6FF' : '#fff', color: p.required ? '#1D4ED8' : '#94A3B8', whiteSpace: 'nowrap' }}>
                      {p.required ? '必填' : '选填'}
                    </button>
                    <button type="button" onClick={() => setEdit({ ...edit, requestParams: (edit.requestParams ?? []).filter((_, k) => k !== i) })} className="shrink-0 text-slate-300 hover:text-rose-500">×</button>
                  </div>
                ))}
              </div>
              {/* 返回出参 */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span className="text-xs font-medium text-slate-500">返回出参（接口返回什么字段）</span>
                  <Button size="sm" variant="secondary" onClick={() => setEdit({ ...edit, responseParams: [...(edit.responseParams ?? []), { name: '', label: '', desc: '' }] })}>+ 加出参</Button>
                </div>
                {(edit.responseParams ?? []).length === 0 && (
                  <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-3 text-center text-xs text-slate-400">暂无出参</div>
                )}
                {(edit.responseParams ?? []).map((p, i) => (
                  <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                    <input className={inputCls} style={{ width: 120 }} value={p.name} onChange={(e) => setEdit({ ...edit, responseParams: (edit.responseParams ?? []).map((x, k) => (k === i ? { ...x, name: e.target.value } : x)) })} placeholder="参数名" />
                    <input className={inputCls} style={{ width: 110 }} value={p.label} onChange={(e) => setEdit({ ...edit, responseParams: (edit.responseParams ?? []).map((x, k) => (k === i ? { ...x, label: e.target.value } : x)) })} placeholder="含义" />
                    <input className={inputCls} style={{ flex: 1 }} value={p.desc ?? ''} onChange={(e) => setEdit({ ...edit, responseParams: (edit.responseParams ?? []).map((x, k) => (k === i ? { ...x, desc: e.target.value } : x)) })} placeholder="取值说明" />
                    <button type="button" onClick={() => setEdit({ ...edit, responseParams: (edit.responseParams ?? []).filter((_, k) => k !== i) })} className="shrink-0 text-slate-300 hover:text-rose-500">×</button>
                  </div>
                ))}
              </div>
            </div>
            {/* 返回值归一化映射 */}
            <div className="sm:col-span-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-slate-600">
                <span style={{ width: 3, height: 12, borderRadius: 2, background: '#2563EB', display: 'inline-block' }} />
                返回值归一化映射（第三方原始值 → 标准触发条件）
              </div>
              <div className="mb-3 text-xs text-slate-500">把各服务商的「方言」翻译成统一触发条件：支持等于 / 不等于 / 包含 / ≥ / ≤，以及「其它(兜底)」——可对任意返回字段配置，规则才能据此启用处置动作。</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span className="text-xs font-medium text-slate-500">映射规则（匹配方式 · 返回字段 · 原始值 → 触发条件）</span>
                <Button size="sm" variant="secondary" onClick={() => setEdit({ ...edit, normalizers: [...(edit.normalizers ?? []), { field: edit.responseParams?.[0]?.name ?? '', op: 'eq', raw: '', cond: '' } as VerifyNormalizer] })}>+ 加映射</Button>
              </div>
              {(edit.normalizers ?? []).length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-3 text-center text-xs text-slate-400">暂未配置映射，第三方返回值将无法匹配触发条件</div>
              )}
              {(edit.normalizers ?? []).map((n, i) => (
                <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6 }}>
                  <SingleSelect label="" fullWidth clearable
                    options={NORM_OP_OPTIONS}
                    value={n.op ?? 'eq'} onChange={(v) => setEdit({ ...edit, normalizers: (edit.normalizers ?? []).map((x, k) => (k === i ? { ...x, op: v as VerifyNormalizer['op'] } : x)) })} />
                  <SingleSelect label="" fullWidth clearable
                    options={(edit.responseParams ?? []).map((p) => ({ value: p.name, label: p.name }))}
                    value={n.field} onChange={(v) => setEdit({ ...edit, normalizers: (edit.normalizers ?? []).map((x, k) => (k === i ? { ...x, field: v } : x)) })} />
                  {n.op === 'default'
                    ? <span className="text-xs text-slate-400" style={{ width: 104, display: 'inline-block' }}>其它未匹配值</span>
                    : <input className={inputCls} style={{ width: 104 }} value={n.raw} onChange={(e) => setEdit({ ...edit, normalizers: (edit.normalizers ?? []).map((x, k) => (k === i ? { ...x, raw: e.target.value } : x)) })} placeholder="原始值" />}
                  <span className="text-slate-400 text-xs">→</span>
                  <SingleSelect label="" fullWidth clearable
                    options={[{ value: '', label: '通过 / 不触发' }, ...conds.map((c) => ({ value: c.name, label: c.name }))]}
                    value={n.cond} onChange={(v) => setEdit({ ...edit, normalizers: (edit.normalizers ?? []).map((x, k) => (k === i ? { ...x, cond: v } : x)) })} />
                  <button type="button" onClick={() => setEdit({ ...edit, normalizers: (edit.normalizers ?? []).filter((_, k) => k !== i) })} className="shrink-0 text-slate-300 hover:text-rose-500">×</button>
                </div>
              ))}
            </div>
          </div>
        )}
        {/* ---- 触发条件表单 ---- */}
        {isConds && editCond && (
          <div className="grid gap-4 sm:grid-cols-1">
            <F label="条件名称 *"><input className={inputCls} value={editCond.name} onChange={(e) => setEditCond({ ...editCond, name: e.target.value })} placeholder="如：核验不通过 / 核验超时" /></F>
            <F label="分类">
              <SingleSelect label="分类" fullWidth clearable
                options={COND_CATS.map((c) => ({ value: c, label: c }))}
                value={editCond.cat ?? ''} onChange={(v) => setEditCond({ ...editCond, cat: v })} />
            </F>
            <F label="说明"><textarea className={inputCls + ' min-h-[60px] resize-y'} value={editCond.desc ?? ''} onChange={(e) => setEditCond({ ...editCond, desc: e.target.value })} placeholder="该条件表示什么场景（如：核验结果明确不通过）" /></F>
          </div>
        )}
        {/* ---- 处置动作表单 ---- */}
        {isActions && editAction && (
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="动作名称 *"><input className={inputCls} value={editAction.name} onChange={(e) => setEditAction({ ...editAction, name: e.target.value })} placeholder="如：拒绝 / 转人工复核 / 自动降额" /></F>
            <F label="目标系统"><input className={inputCls} value={editAction.target} onChange={(e) => setEditAction({ ...editAction, target: e.target.value })} placeholder="如：信贷系统 / 名单中心 / 短信平台" /></F>
            <F label="通知人"><input className={inputCls} value={editAction.notifyTo} onChange={(e) => setEditAction({ ...editAction, notifyTo: e.target.value })} placeholder="如：风控主管-王芳 / 客户本人" /></F>
            <F label="是否需审批">
              <div className="flex items-center gap-2 py-1">
                <Toggle v={editAction.needApprove} onChange={(n) => setEditAction({ ...editAction, needApprove: n })} />
                <span className="text-sm text-slate-600">{editAction.needApprove ? '需要审批' : '免审批'}</span>
              </div>
            </F>
            <div className="sm:col-span-2">
              <F label="补充动作"><textarea className={inputCls + ' min-h-[60px] resize-y'} value={editAction.extra} onChange={(e) => setEditAction({ ...editAction, extra: e.target.value })} placeholder="如：加入灰名单观察 90 天 / 发送短信模板" /></F>
            </div>
            <div className="sm:col-span-2">
              <F label="说明"><textarea className={inputCls + ' min-h-[50px] resize-y'} value={editAction.desc ?? ''} onChange={(e) => setEditAction({ ...editAction, desc: e.target.value })} placeholder="动作适用场景/备注" /></F>
            </div>
          </div>
        )}
      </ConfigListPage>
    </>
  );
}
