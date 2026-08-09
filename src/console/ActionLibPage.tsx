/* 管理中心 · 动作库（P0-03 需求）——独立二级页面（cm:rule-hub-actions）
 * 维护处置动作模板：目标系统 / 通知人 / 是否审批 / 补充动作；
 * 规则合集的「处置动作」从此选择，参数在动作库集中维护（改一处全规则生效）。
 * 数据存 ruleHub.json.actionLib（样例橘 Sam）。
 */
import { useState } from 'react';
import { Button, type Column, type Row } from '../components/ui';
import { Sam } from './SourceTag';
import { ConfigListPage } from './ConfigTemplate';
import { useRuleHub, updateRuleHub, type ActionItem } from './ruleHubData';

const inputCls = 'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-ink-900 outline-none transition placeholder:text-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100';
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

export default function ActionLibPage() {
  const d = useRuleHub();
  const list = d.actionLib ?? [];
  const [edit, setEdit] = useState<ActionItem | null>(null);
  const [isNew, setIsNew] = useState(false);

  const openNew = () => { setIsNew(true); setEdit({ id: '', name: '', target: '', notifyTo: '', needApprove: false, extra: '', desc: '' }); };
  const openEdit = (v: ActionItem) => { setIsNew(false); setEdit({ ...v }); };
  const doSave = () => {
    if (!edit) return;
    if (isNew) {
      const id = 'A' + Date.now().toString(36).toUpperCase();
      updateRuleHub((dd) => ({ ...dd, actionLib: [...(dd.actionLib ?? []), { ...edit, id }] }));
    } else {
      updateRuleHub((dd) => ({ ...dd, actionLib: (dd.actionLib ?? []).map((x) => (x.id === edit.id ? edit : x)) }));
    }
    setEdit(null);
  };
  const remove = (v: ActionItem) => {
    if (!window.confirm(`确认删除动作「${v.name}」？已引用该动作的规则仍保留原动作文本。`)) return;
    updateRuleHub((dd) => ({ ...dd, actionLib: (dd.actionLib ?? []).filter((x) => x.id !== v.id) }));
  };

  const rows: Row[] = list.map((a) => ({
    id: a.id,
    name: a.name,
    target: a.target,
    notifyTo: a.notifyTo,
    approve: { v: a.needApprove ? '需审批' : '免审批', kind: a.needApprove ? 'amber' : 'green' },
    extra: a.extra,
  }));

  const cols: Column[] = [
    { key: 'name', label: '动作名称', type: 'text', tag: { kind: 'sample', value: 'ruleHub.json.actionLib' } },
    { key: 'target', label: '目标系统', type: 'text', width: '110px' },
    { key: 'notifyTo', label: '通知人', type: 'text', width: '150px' },
    { key: 'approve', label: '审批', type: 'badge', badgeKind: 'amber', width: '80px' },
    { key: 'extra', label: '补充动作', type: 'text', width: '260px' },
  ];

  const F = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div>
      <div className="mb-1.5 text-xs font-medium text-slate-500">{label}</div>
      {children}
    </div>
  );

  return (
    <ConfigListPage
      title="动作库"
      crumbPath="规则集合 / 动作库"
      subtitle="维护处置动作模板（目标系统 / 通知人 / 是否审批 / 补充动作）；规则合集的「处置动作」从这里选择，参数集中维护、改一处全规则生效"
      addLabel="新建动作"
      onAdd={openNew}
      actions={<Sam value="ruleHub.json.actionLib" />}
      panelTitle="动作列表"
      panelDesc="规则命中后的处置动作模板。参数在动作库集中维护，规则编辑时只选择动作名；「删除」仅移除模板，已引用规则保留原动作文本。"
      columns={cols}
      rows={rows}
      onView={(r) => { const f = list.find((x) => x.id === String(r.id)); if (f) openEdit(f); }}
      rowActions={(r) => {
        const v = list.find((x) => x.id === String(r.id));
        return v ? (
          <span style={{ display: 'inline-flex', gap: 6 }}>
            <Button size="sm" variant="ghost" onClick={() => openEdit(v)}>编辑</Button>
            <Button size="sm" variant="ghost" onClick={() => remove(v)} style={{ color: '#DC2626' }}>删除</Button>
          </span>
        ) : null;
      }}
      editOpen={edit != null}
      editTitle={isNew ? '新建动作' : `编辑动作 · ${edit?.name ?? ''}`}
      onCloseEdit={() => setEdit(null)}
      onSave={doSave}
      modalWidth="max-w-2xl"
    >
      {edit && (
        <div className="grid gap-4 sm:grid-cols-2">
          <F label="动作名称 *"><input className={inputCls} value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} placeholder="如：拒绝 / 转人工复核 / 自动降额" /></F>
          <F label="目标系统"><input className={inputCls} value={edit.target} onChange={(e) => setEdit({ ...edit, target: e.target.value })} placeholder="如：信贷系统 / 名单中心 / 短信平台" /></F>
          <F label="通知人"><input className={inputCls} value={edit.notifyTo} onChange={(e) => setEdit({ ...edit, notifyTo: e.target.value })} placeholder="如：风控主管-王芳 / 客户本人" /></F>
          <F label="是否需审批">
            <div className="flex items-center gap-2 py-1">
              <Toggle v={edit.needApprove} onChange={(n) => setEdit({ ...edit, needApprove: n })} />
              <span className="text-sm text-slate-600">{edit.needApprove ? '需要审批' : '免审批'}</span>
            </div>
          </F>
          <div className="sm:col-span-2">
            <F label="补充动作"><textarea className={inputCls + ' min-h-[60px] resize-y'} value={edit.extra} onChange={(e) => setEdit({ ...edit, extra: e.target.value })} placeholder="如：加入灰名单观察 90 天 / 发送短信模板" /></F>
          </div>
          <div className="sm:col-span-2">
            <F label="说明"><textarea className={inputCls + ' min-h-[50px] resize-y'} value={edit.desc ?? ''} onChange={(e) => setEdit({ ...edit, desc: e.target.value })} placeholder="动作适用场景/备注" /></F>
          </div>
        </div>
      )}
    </ConfigListPage>
  );
}
