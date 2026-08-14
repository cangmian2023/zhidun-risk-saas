/* 公共条件构造器（从 VisualSqlEditor 提取，供指标库 / 客户分组规则等复用）
 * 能力：选字段 + 操作符 + 值（单框/双框/无框/多选），支持「＋添加条件」与「＋添加条件组」（嵌套且/或）。
 * 结构：顶层且/或（组间）+ 未分组条件(loose) 或 条件组(groups)；生成括号化逻辑由调用方消费。
 */
import type { ReactNode } from 'react';
import type { VisualCond, VisualFilterOp } from './midData';
import { VISUAL_OP_LABEL } from './midData';

const inpSm: React.CSSProperties = { padding: '4px 6px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' };

/* 筛选结构（顶层且/或 + 条件组；loose = 未分组条件） */
export type VGroup = { logic: 'and' | 'or'; conds: VisualCond[] };
export type VFilter = { logic: 'and' | 'or'; groups: VGroup[]; loose?: VisualCond[] };

export function emptyFilter(): VFilter {
  return { logic: 'and', groups: [], loose: [] };
}

/* 且/或 双态切换 */
export function LogicSwitch({ value, onChange }: { value: 'and' | 'or'; onChange: (v: 'and' | 'or') => void }) {
  const seg: React.CSSProperties = { display: 'inline-flex', border: '1px solid #E2E8F0', borderRadius: 6, overflow: 'hidden' };
  const opt = (v: 'and' | 'or', label: string): React.CSSProperties => ({
    padding: '2px 10px', fontSize: 11, cursor: 'pointer', userSelect: 'none',
    background: value === v ? '#2563EB' : '#fff', color: value === v ? '#fff' : '#64748B', fontWeight: value === v ? 600 : 400,
  });
  return (
    <div style={seg}>
      <div style={opt('and', '且')} onClick={() => onChange('and')}>且</div>
      <div style={opt('or', '或')} onClick={() => onChange('or')}>或</div>
    </div>
  );
}

/* 单条筛选条件行 */
function CondRow({ cond, fields, onPatch, onRemove, indent }: {
  cond: VisualCond; fields: { ref: string; label: string }[];
  onPatch: (c: VisualCond) => void; onRemove: () => void; indent?: boolean;
}) {
  const inputWrap: React.CSSProperties = { display: 'flex', gap: 4, alignItems: 'center' };
  const hasVal = cond.op === 'eq' || cond.op === 'neq' || cond.op === 'lt' || cond.op === 'gt';
  const isRange = cond.op === 'range';
  const noVal = cond.op === 'has' || cond.op === 'empty';
  const isIn = cond.op === 'in';
  const inCandidates = ['中国', '美国', '日本', '韩国', '其他'];
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 6, flexWrap: 'wrap', paddingLeft: indent ? 16 : 0 }}>
      <select style={inpSm} value={cond.field} onChange={(e) => onPatch({ ...cond, field: e.target.value })}>
        <option value="">选择字段</option>
        {fields.map((x) => <option key={x.ref} value={x.ref}>{x.label}</option>)}
      </select>
      <select style={inpSm} value={cond.op} onChange={(e) => onPatch({ ...cond, op: e.target.value as VisualFilterOp })}>
        {(Object.keys(VISUAL_OP_LABEL) as VisualFilterOp[]).map((op) => <option key={op} value={op}>{VISUAL_OP_LABEL[op]}</option>)}
      </select>
      {hasVal && (
        <input style={{ ...inpSm, width: 160 }} value={cond.value ?? ''} placeholder="输入值"
          onChange={(e) => onPatch({ ...cond, value: e.target.value })} />
      )}
      {isRange && (
        <div style={inputWrap}>
          <input style={{ ...inpSm, width: 110 }} value={cond.value ?? ''} placeholder="最小值"
            onChange={(e) => onPatch({ ...cond, value: e.target.value })} />
          <span style={{ color: '#94A3B8', fontSize: 11 }}>~</span>
          <input style={{ ...inpSm, width: 110 }} value={cond.rangeMax ?? ''} placeholder="最大值"
            onChange={(e) => onPatch({ ...cond, rangeMax: e.target.value })} />
        </div>
      )}
      {isIn && (
        <div style={{ ...inpSm, display: 'inline-flex', gap: 4, flexWrap: 'wrap', alignItems: 'center', padding: '3px 6px', minWidth: 220 }}>
          {(cond.values ?? []).map((v) => (
            <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11, padding: '1px 6px', borderRadius: 10, background: '#DBEAFE', color: '#1D4ED8' }}>
              {v}
              <span style={{ cursor: 'pointer', fontWeight: 700 }} onClick={() => onPatch({ ...cond, values: (cond.values ?? []).filter((x) => x !== v) })}>✕</span>
            </span>
          ))}
          <select style={{ border: 'none', background: 'transparent', fontSize: 11, color: '#2563EB', outline: 'none', cursor: 'pointer' }}
            value="" onChange={(e) => { if (e.target.value) onPatch({ ...cond, values: [...(cond.values ?? []), e.target.value] }); }}>
            <option value="">+ 多选值</option>
            {inCandidates.filter((c) => !(cond.values ?? []).includes(c)).map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      )}
      {noVal && <span style={{ fontSize: 11, color: '#94A3B8' }}>（无需输入值）</span>}
      <button type="button" onClick={onRemove}
        style={{ border: '1px solid #FECACA', background: '#fff', color: '#DC2626', borderRadius: 6, padding: '3px 8px', fontSize: 12, cursor: 'pointer' }}>删除</button>
    </div>
  );
}

/* 条件构造器（全局筛选 / 字段级筛选 / 分组规则共用） */
export function CondBuilder({ value, fields, onChange, title, sourceTag, showLogicHint = true }: {
  value: VFilter | undefined; fields: { ref: string; label: string }[];
  onChange: (f: VFilter) => void; title: string; sourceTag?: ReactNode; showLogicHint?: boolean;
}) {
  const vf: VFilter = value ?? { logic: 'and', groups: [], loose: [] };
  const setFilter = (f: VFilter) => onChange(f);
  const groups = vf.groups ?? [];
  const loose = vf.loose ?? [];
  const hasGroups = groups.length > 0;
  const addCond = () => {
    if (!hasGroups) {
      setFilter({ ...vf, loose: [...loose, { field: '', op: 'eq' as VisualFilterOp, value: '' }] });
    } else {
      const gi = groups.length - 1;
      setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, conds: [...(x.conds ?? []), { field: '', op: 'eq' as VisualFilterOp, value: '' }] } : x) });
    }
  };
  const addGroup = () => {
    if (loose.length) {
      setFilter({ ...vf, loose: [], groups: [{ logic: vf.logic, conds: loose }, ...groups] });
    } else {
      setFilter({ ...vf, groups: [...groups, { logic: 'and', conds: [{ field: '', op: 'eq' as VisualFilterOp, value: '' }] }] });
    }
  };
  return (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, background: '#FCFDFE' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8, flexWrap: 'wrap' }}>
        {title} {sourceTag}
        <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8' }}>
          {hasGroups ? `共 ${groups.length} 个条件组` : (loose.length ? `${loose.length} 个条件` : '尚未添加条件')}
        </span>
      </div>
      {hasGroups && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, padding: '6px 10px', background: '#F1F5F9', borderRadius: 8 }}>
          <span style={{ fontSize: 12, color: '#64748B' }}>组间关系：</span>
          <LogicSwitch value={vf.logic} onChange={(logic) => setFilter({ ...vf, logic })} />
          <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 4 }}>条件组之间用此关系连接</span>
        </div>
      )}
      {!hasGroups && loose.map((c, ci) => (
        <CondRow key={ci} cond={c} fields={fields}
          onPatch={(nc) => setFilter({ ...vf, loose: loose.map((y, j) => j === ci ? nc : y) })}
          onRemove={() => setFilter({ ...vf, loose: loose.filter((_, j) => j !== ci) })} />
      ))}
      {!hasGroups && showLogicHint && (
        <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>
          提示：直接添加筛选条件即可；需要嵌套关系时可「＋ 添加条件组」，已有条件会自动归入第 1 组。
        </div>
      )}
      {groups.map((g, gi) => (
        <div key={gi} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginBottom: 8, background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#475569', marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ color: '#64748B' }}>第 {gi + 1} 组</span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>组内 <LogicSwitch value={g.logic} onChange={(logic) => setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, logic } : x) })} /></span>
            <span style={{ fontSize: 11, color: '#94A3B8' }}>{g.conds?.length ?? 0} 个条件</span>
            <span style={{ marginLeft: 'auto' }}>
              <button type="button" onClick={() => setFilter({ ...vf, groups: groups.filter((_, k) => k !== gi) })}
                style={{ border: '1px solid #FECACA', background: '#fff', color: '#DC2626', borderRadius: 6, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}>删除组</button>
            </span>
          </div>
          {(g.conds ?? []).map((c, ci) => (
            <CondRow key={ci} cond={c} fields={fields} indent
              onPatch={(nc) => setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, conds: x.conds.map((y, j) => j === ci ? nc : y) } : x) })}
              onRemove={() => setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, conds: x.conds.filter((_, j) => j !== ci) } : x) })} />
          ))}
          <button type="button" onClick={() => setFilter({ ...vf, groups: groups.map((x, k) => k === gi ? { ...x, conds: [...(x.conds ?? []), { field: '', op: 'eq' as VisualFilterOp, value: '' }] } : x) })}
            style={{ border: '1px dashed #93C5FD', background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>＋ 组内添加条件</button>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" onClick={addCond}
          style={{ border: '1px dashed #93C5FD', background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>＋ 添加条件</button>
        <button type="button" onClick={addGroup}
          style={{ border: '1px dashed #93C5FD', background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>＋ 添加条件组</button>
      </div>
      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>条件之间用「且/或」连接，条件组之间也可设置「且/或」，生成逻辑自动加括号。</div>
    </div>
  );
}
