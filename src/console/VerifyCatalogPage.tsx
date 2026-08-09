/* 管理中心 · 核验项库（P0-01 / 需求35 扩展）——独立二级页面（cm:rule-hub-items）
 * 双 Tab：
 *  - 核验项库：渠道/数据源/供应商/计费/可用状态 + 接口接入 + 对接参数（入参/出参）；
 *  - 触发条件库：规则合集「信息核验项 → 触发条件」下拉的来源（可新增/编辑/删除，来源透明可维护）。
 * 数据存 ruleHub.json.verifyCatalog / condLib（样例橘 Sam）。
 */
import { useState } from 'react';
import { Button, SingleSelect, type Column, type Row } from '../components/ui';
import { Sam } from './SourceTag';
import { ConfigListPage } from './ConfigTemplate';
import { useRuleHub, updateRuleHub, type VerifyItemDef, type CondLibItem, APPLY_FIELD_OPTIONS } from './ruleHubData';

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

export default function VerifyCatalogPage() {
  const d = useRuleHub();
  const list = d.verifyCatalog ?? [];
  const conds = d.condLib ?? [];
  const [tab, setTab] = useState<'items' | 'conds'>('items');

  // 核验项编辑态
  const [edit, setEdit] = useState<VerifyItemDef | null>(null);
  const [isNew, setIsNew] = useState(false);
  // 条件编辑态
  const [editCond, setEditCond] = useState<CondLibItem | null>(null);
  const [isNewCond, setIsNewCond] = useState(false);

  /* ---- 核验项操作 ---- */
  const openNewItem = () => { setIsNew(true); setEdit({ id: '', name: '', cat: CATS[0], source: '', vendor: '', price: 0, status: '启用', desc: '', api: '', timeout: 800, qps: 100, doc: '', protocol: 'HTTP POST JSON', auth: 'Token', requestParams: [], responseParams: [] }); };
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
  const openNewCond = () => { setIsNewCond(true); setEditCond({ id: '', name: '', desc: '' }); };
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
  const usedCount = (name: string) => (d.rules ?? []).filter((r) => (r.verifyItems ?? []).some((i) => i.cond === name)).length;

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
    { key: 'name', label: '核验项', type: 'text', tag: { kind: 'sample', value: 'ruleHub.json.verifyCatalog' } },
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
    desc: c.desc ?? '—',
    used: `${usedCount(c.name)} 条规则`,
  }));
  const condCols: Column[] = [
    { key: 'name', label: '触发条件', type: 'text', tag: { kind: 'sample', value: 'ruleHub.json.condLib' } },
    { key: 'desc', label: '说明', type: 'text' },
    { key: 'used', label: '被引用', type: 'text', width: '100px' },
  ];

  const isItems = tab === 'items';

  return (
    <>
      {/* 顶部 Tab：核验项库 / 触发条件库 */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid #E2E8F0', marginBottom: 14 }}>
        {([['items', `核验项库（${list.length}）`], ['conds', `触发条件库（${conds.length}）`]] as ['items' | 'conds', string][]).map(([k, label]) => (
          <button key={k} type="button" onClick={() => { setTab(k); setEdit(null); setEditCond(null); }}
            style={{
              padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', border: 'none', background: 'none',
              borderBottom: tab === k ? '2px solid #2563EB' : '2px solid transparent', color: tab === k ? '#2563EB' : '#64748B',
            }}>
            {label}
          </button>
        ))}
      </div>

      <ConfigListPage
        title={isItems ? '核验项库' : '触发条件库'}
        crumbPath={'规则集合 / ' + (isItems ? '核验项库' : '触发条件库')}
        subtitle={isItems
          ? '管理核验项来源：渠道 / 数据源 / 供应商 / 计费 / 可用状态 + 接口接入 + 对接参数；规则合集的「信息核验项」下拉从这里选择'
          : '规则合集「信息核验项 → 触发条件」下拉的来源，可新增 / 编辑 / 删除——选项来源透明可维护'}
        addLabel={isItems ? '新建核验项' : '新建触发条件'}
        onAdd={isItems ? openNewItem : openNewCond}
        actions={isItems ? <Sam value="ruleHub.json.verifyCatalog" /> : <Sam value="ruleHub.json.condLib" />}
        panelTitle={isItems ? '核验项列表' : '触发条件列表'}
        panelDesc={isItems
          ? '「停用」后规则编辑的下拉中不再出现该核验项，已引用规则不受影响。'
          : '新增的条件会立即出现在规则合集「信息核验项 → 触发条件」下拉中；删除仅移除选项，已引用规则保留原文本。'}
        columns={isItems ? itemCols : condCols}
        rows={isItems ? itemRows : condRows}
        onView={(r) => {
          if (isItems) { const f = list.find((x) => x.id === String(r.id)); if (f) openEditItem(f); }
          else { const c = conds.find((x) => x.id === String(r.id)); if (c) openEditCond(c); }
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
          const c = conds.find((x) => x.id === String(r.id));
          return c ? (
            <span style={{ display: 'inline-flex', gap: 6 }}>
              <Button size="sm" variant="ghost" onClick={() => openEditCond(c)}>编辑</Button>
              <Button size="sm" variant="ghost" onClick={() => removeCond(c)} style={{ color: '#DC2626' }}>删除</Button>
            </span>
          ) : null;
        }}
        editOpen={edit != null || editCond != null}
        editTitle={isItems
          ? (isNew ? '新建核验项' : `编辑核验项 · ${edit?.name ?? ''}`)
          : (isNewCond ? '新建触发条件' : `编辑触发条件 · ${editCond?.name ?? ''}`)}
        onCloseEdit={() => { setEdit(null); setEditCond(null); }}
        onSave={isItems ? saveItem : saveCond}
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
          </div>
        )}
        {/* ---- 触发条件表单 ---- */}
        {!isItems && editCond && (
          <div className="grid gap-4 sm:grid-cols-1">
            <F label="条件名称 *"><input className={inputCls} value={editCond.name} onChange={(e) => setEditCond({ ...editCond, name: e.target.value })} placeholder="如：核验不通过 / 核验超时" /></F>
            <F label="说明"><textarea className={inputCls + ' min-h-[60px] resize-y'} value={editCond.desc ?? ''} onChange={(e) => setEditCond({ ...editCond, desc: e.target.value })} placeholder="该条件表示什么场景（如：核验结果明确不通过）" /></F>
          </div>
        )}
      </ConfigListPage>
    </>
  );
}
