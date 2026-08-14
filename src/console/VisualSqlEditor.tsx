/* 可视化 SQL 编辑器（需求42 + 08081 严格按神策 BI 样例重写 + 3.x 扩展）
 * 结构（从上到下）：字段选择 → 全局筛选(嵌套且/或) → 分组选择 → 时间选择 → SQL 预览
 * 3.1 聚合方式：神策口径（总次数/用户数/人均次数/过去7天/过去30天/当月/合计）
 * 3.2 字段级筛选：每个字段选完聚合后，字段下一行缩进显示该字段的筛选条件（复用嵌套且/或）
 * 3.3 字段计算：formula 表达式引用 A/B/C（如 (A + B) * C - 100）
 * 3.3(全局) 全局筛选操作符：等于/不等于/小于/大于(单框)、区间(双框)、有值/没值(无框)、包含(下拉多选)
 * 3.4 首行可删除（去掉"首行不可删除"标签）
 * 3.5 时间选择：按小时/按分钟/按天/按周/按月 + 时间范围(动态/静态) + 对比(上一段时间/去年同期/自定义)
 * 生成的 SQL 同步写入 value.sql。
 */
import { useState, useMemo } from 'react';
import { Sam, Cal } from './SourceTag';
import {
  type MidMetric, type MidDataSource,
  type VisualAggOp, type VisualFilterOp, type VisualCond,
  VISUAL_AGG_LABEL, VISUAL_AGG_TO_SQL, VISUAL_OP_LABEL,
} from './midData';
import { CondBuilder, type VFilter, type VGroup } from './CondBuilder';

const inp: React.CSSProperties = { padding: '6px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, width: '100%', background: '#fff' };
const inpSm: React.CSSProperties = { padding: '4px 6px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' };
const lbl: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 4, fontSize: 12, color: '#475569', minWidth: 140 };

/* ---- 常量（与神策样例对齐） ---- */
const TIMEGRAN_OPTS = ['按小时', '按分钟', '按天', '按周', '按月'];
const DYNAMIC_OPTS = ['近 7 天', '近 30 天', '近 90 天', '本月', '上月'];
const COMPARE_OPTS = [
  { value: 'none', label: '不对比' },
  { value: 'prev', label: '上一段时间' },
  { value: 'yoy', label: '去年同期' },
  { value: 'custom', label: '自定义' },
];
const EVENT_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const letterBadge: React.CSSProperties = { display: 'inline-flex', width: 18, height: 18, borderRadius: 4, background: '#2563EB', color: '#fff', fontSize: 11, fontWeight: 700, alignItems: 'center', justifyContent: 'center', flexShrink: 0 };

/* 全局筛选类型（3.12：可先添加未分组条件 loose，添加分组时自动归入第 1 组）—— 类型定义已迁至 CondBuilder.tsx */

/* 字段引用统一为 "sourceId:fieldKey"，选项显示（数据源名）字段名 */
function fieldRef(src: MidDataSource, f: { key: string; label?: string }) {
  return `${src.id}:${f.key}`;
}
function fieldLabel(src: MidDataSource, f: { key: string; label?: string }) {
  return `（${src.name}）${f.label ?? f.key}`;
}
function parseFieldRef(ref: string, sources: MidDataSource[]): { src?: MidDataSource; key: string } {
  const i = ref.indexOf(':');
  if (i < 0) return { src: undefined, key: ref };
  const sid = ref.slice(0, i);
  return { src: sources.find((s) => s.id === sid), key: ref.slice(i + 1) };
}
function fieldSql(ref: string, sources: MidDataSource[]): string {
  const { src, key } = parseFieldRef(ref, sources);
  const table = src?.conn?.database || src?.name || '';
  return table ? `${table}.${key}` : key;
}

/* 单条筛选条件 → SQL 片段（按操作符类型） */
function condSql(c: VisualCond, sources: MidDataSource[]): string {
  const f = fieldSql(c.field, sources);
  const q = (s: string) => (/^\d+(\.\d+)?$/.test(s) ? s : `'${s}'`);
  switch (c.op) {
    case 'eq': return `${f} = ${q(c.value ?? '')}`;
    case 'neq': return `${f} != ${q(c.value ?? '')}`;
    case 'lt': return `${f} < ${q(c.value ?? '')}`;
    case 'gt': return `${f} > ${q(c.value ?? '')}`;
    case 'range': return `${f} BETWEEN ${q(c.value ?? '')} AND ${q(c.rangeMax ?? '')}`;
    case 'has': return `${f} IS NOT NULL`;
    case 'empty': return `${f} IS NULL`;
    case 'in': return `${f} IN (${(c.values ?? []).map(q).join(', ')})`;
    default: return '';
  }
}
/* 嵌套筛选组 → SQL（3.12：未分组 loose 条件直接连接；有分组时按组生成，组间用顶层 logic） */
function groupsSql(vf: VFilter | undefined, sources: MidDataSource[]): string {
  if (!vf) return '';
  const valid = (c: VisualCond) => c.field && (c.op === 'has' || c.op === 'empty' || c.op === 'in' ? (c.op === 'in' ? (c.values ?? []).length > 0 : true) : String(c.value) !== '');
  // 未分组条件（loose）：直接按顶层 logic 连接
  if ((vf.groups ?? []).length === 0 && (vf.loose ?? []).some(valid)) {
    const items = (vf.loose ?? []).filter(valid).map((c) => condSql(c, sources));
    return `(${items.join(` ${vf.logic === 'or' ? 'OR' : 'AND'} `)})`;
  }
  const gs = (vf.groups ?? [])
    .map((g) => {
      const conds = (g.conds ?? []).filter(valid);
      const items = conds.map((c) => condSql(c, sources));
      if (!items.length) return '';
      return `(${items.join(` ${g.logic === 'or' ? 'OR' : 'AND'} `)})`;
    })
    .filter(Boolean);
  return gs.join(` ${vf.logic === 'or' ? 'OR' : 'AND'} `);
}

/* 由可视化配置生成 SQL */
function buildVisualSql(v: MidMetric, sources: MidDataSource[]): string {
  const vs = v.visualSql ?? {};
  const main = sources.find((s) => s.id === v.dataSourceId);
  const from = main?.conn?.database || main?.name || 'table';
  const subject = vs.subject ?? main?.fields.find((f) => f.kind === 'dim')?.key ?? 'cust_id';
  const allFields = sources.flatMap((s) => s.fields.map((f) => fieldRef(s, f)));

  // 字段选择（事件选择）
  const events = vs.events?.length ? vs.events : [{ name: '', field: allFields[0] ?? '', agg: 'total' as VisualAggOp }];

  // 每个事件的聚合表达式 + 字段级筛选
  const eventSqls = events.map((e, i) => {
    const aggSql = VISUAL_AGG_TO_SQL[e.agg ?? 'total']?.(subject) ?? 'COUNT(*)';
    const letter = EVENT_LETTERS[i] ?? `M${i + 1}`;
    const fSql = groupsSql(e.filters, sources);
    return { letter, aggSql, fSql, label: `m${i + 1}` };
  });

  // 字段计算：customExpr 流式单元（3.14）优先 → formula 引用 A/B/C 兜底
  let selectBody: string;
  if (vs.calcMode === 'custom' && (vs.customExpr?.length)) {
    const parts = (vs.customExpr as any[])
      .filter((u) => !(u.t === 'field' && !u.field))   // 跳过未选字段的空单元
      .map((u) => {
        if (u.t === 'field') return VISUAL_AGG_TO_SQL[u.agg ?? 'total']?.(subject) ?? 'COUNT(*)';
        if (u.t === 'op') return u.op;
        return u.value || '1';
      });
    selectBody = `  ${parts.join(' ')} AS val`;
  } else if (vs.formula?.trim()) {
    let expr = vs.formula;
    eventSqls.forEach((e, i) => {
      const letter = EVENT_LETTERS[i] ?? `M${i + 1}`;
      expr = expr.replace(new RegExp(`\\b${letter}\\b`, 'g'), `(${e.aggSql})`);
    });
    selectBody = `  ${expr} AS val`;
  } else {
    selectBody = eventSqls.map((e) => `  ${e.aggSql} AS ${e.label}`).join(',\n');
  }

  // WHERE：字段级筛选（各自条件）+ 全局筛选
  const fieldWhere = eventSqls
    .map((e, i) => ({ fSql: e.fSql, label: `字段 ${EVENT_LETTERS[i] ?? i + 1}` }))
    .filter((x) => x.fSql);
  const gSql = groupsSql(vs.globalFilters, sources);
  const whereParts: string[] = [];
  if (fieldWhere.length) whereParts.push(fieldWhere.map((x) => `(${x.fSql})`).join(' AND '));
  if (gSql) whereParts.push(`(${gSql})`);
  const whereSql = whereParts.length ? `\nWHERE ${whereParts.join('\n  AND ')}` : '';

  // 分组
  const groupBys = (vs.groupBy ?? []).map((ref) => fieldSql(ref, sources));
  const gsql = groupBys.length ? `\nGROUP BY ${groupBys.join(', ')}` : '';

  // 时间范围 + 对比（注释层）
  const tr = vs.timeRange;
  const timeNotes: string[] = [];
  if (tr) {
    if (tr.mode === 'dynamic') timeNotes.push(`时间范围：${tr.dynamic ?? '近 7 天'}（动态）`);
    else timeNotes.push(`时间范围：${tr.start ?? ''} ~ ${tr.end ?? ''}（静态）`);
    if (tr.compare?.enabled && tr.compare.mode !== 'none') {
      const cm = tr.compare;
      const desc = cm.mode === 'prev' ? '上一段时间' : cm.mode === 'yoy' ? '去年同期' : `自定义 ${cm.start ?? ''} ~ ${cm.end ?? ''}`;
      timeNotes.push(`对比：${desc}`);
    }
  }
  const timeSel = timeNotes.length ? `\n-- ${timeNotes.join('；')}` : '';

  return `SELECT\n${selectBody}\nFROM ${from}${whereSql}${gsql}${timeSel}`;
}

/* 数值格式（3.14：无名字的下拉，百分比两位小数 / 百分比三位小数 / 取整） */
const FORMAT_OPTS = [
  { value: 'pct2', label: '百分比两位小数' },
  { value: 'pct3', label: '百分比三位小数' },
  { value: 'int', label: '取整' },
] as const;

/* 自定义指标流式表达式单元（3.14 神策样例） */
type CustomUnit =
  | { t: 'field'; field: string; agg: VisualAggOp; format?: 'pct2' | 'pct3' | 'int' }
  | { t: 'op'; op: string }
  | { t: 'num'; value: string };

const DEFAULT_UNITS: CustomUnit[] = [
  { t: 'field', field: '', agg: 'total' },
];

/* 自定义指标编辑器（3.14 严格按神策样例）：
 * 流式表达式：单元序列 = [字段.聚合 | 运算符]，单元间可插数字输入（手动）
 * 底部：添加指标 / 添加运算符 / 数值显示方式(无名字下拉) / 按分子属性查看
 * 编辑完成后可收起为公式文本（3.14 补充） */
function CustomMetricEditor({ units, allFields, labelOf, format, molecular, onChange }: {
  units: CustomUnit[]; allFields: { ref: string; label: string }[];
  labelOf: (ref: string) => string;
  format: 'pct2' | 'pct3' | 'int';
  molecular: boolean;
  onChange: (u: CustomUnit[], fmt: 'pct2' | 'pct3' | 'int', mol: boolean) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const setUnits = (u: CustomUnit[]) => onChange(u, format, molecular);
  const setFmt = (f: 'pct2' | 'pct3' | 'int') => onChange(units, f, molecular);
  const setMol = (m: boolean) => onChange(units, format, m);

  // 表达式是否合法：字段单元必须选了字段
  const hasEmptyField = units.some((u) => u.t === 'field' && !u.field);
  const valid = units.some((u) => u.t === 'field' && u.field) && !hasEmptyField;

  // 公式文本（收起时显示）：字段.聚合 / 运算符 / 数字
  const formulaText = units.map((u) => {
    if (u.t === 'field') return `${labelOf(u.field) || '字段'}.${VISUAL_AGG_LABEL[u.agg ?? 'total']}`;
    if (u.t === 'op') return u.op;
    return u.value || '';
  }).join(' ').replace(/\s+/g, ' ').trim() || '（空公式）';

  if (collapsed) {
    return (
      <div style={{ marginTop: 12, background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: '10px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#1D4ED8', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>自定义指标</span>
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 12, color: '#475569', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '3px 8px' }}>{formulaText}</span>
          <button type="button" onClick={() => setCollapsed(false)}
            style={{ marginLeft: 'auto', border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>✎ 编辑</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 12, background: '#F0F7FF', border: '1px solid #BFDBFE', borderRadius: 10, padding: 12 }}>
      {/* 头部：收起按钮 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13, fontWeight: 600, color: '#0F172A' }}>
        自定义指标编辑
        <button type="button" onClick={() => setCollapsed(true)}
          style={{ marginLeft: 'auto', border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer' }}>✓ 完成收起</button>
      </div>
      {/* 流式表达式编辑器（神策 unit-wrapper 结构） */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 4, padding: '10px 12px', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, minHeight: 44 }}>
        {units.map((u, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {u.t === 'field' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, border: '1px solid #DBEAFE', background: '#EFF6FF', borderRadius: 6, padding: '3px 6px' }}>
                <select style={{ border: 'none', background: 'transparent', fontSize: 12, color: '#1D4ED8', outline: 'none', cursor: 'pointer', maxWidth: 150 }}
                  value={u.field} onChange={(e) => setUnits(units.map((x, k) => k === i ? { ...x, field: e.target.value } : x))}>
                  <option value="">选择字段</option>
                  {allFields.map((f) => <option key={f.ref} value={f.ref}>{f.label}</option>)}
                </select>
                <span style={{ color: '#93C5FD' }}>.</span>
                <select style={{ border: 'none', background: 'transparent', fontSize: 12, color: '#1D4ED8', outline: 'none', cursor: 'pointer', maxWidth: 120 }}
                  value={u.agg} onChange={(e) => setUnits(units.map((x, k) => k === i ? { ...x, agg: e.target.value as VisualAggOp } : x))}>
                  {(Object.keys(VISUAL_AGG_LABEL) as VisualAggOp[]).map((a) => <option key={a} value={a}>{VISUAL_AGG_LABEL[a]}</option>)}
                </select>
                <span title="字段筛选" style={{ display: 'inline-flex', color: '#93C5FD', cursor: 'pointer' }}>
                  <svg viewBox="0 0 1024 1024" width="12" height="12" fill="currentColor" aria-hidden="true"><path d="M128 128.6c0-35.68 28.65-64.6 64-64.6h640c35.35 0 64 28.92 64 64.6v78.24a64.96 64.96 0 0 1-15.14 41.73L661.33 510.44v427.5c0 57.55-68.93 86.37-109.25 45.68L381.4 811.35a64.9 64.9 0 0 1-18.74-45.68V510.44L143.14 248.57A64.96 64.96 0 0 1 128 206.84V128.6Z" fill-rule="evenodd" /></svg>
                </span>
                <span style={{ cursor: 'pointer', color: '#DC2626', fontSize: 12, fontWeight: 700, padding: '0 2px' }}
                  onClick={() => setUnits(units.filter((_, k) => k !== i))}>×</span>
              </span>
            ) : u.t === 'op' ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #E2E8F0', borderRadius: 6, padding: '3px 8px', background: '#fff' }}>
                <select style={{ border: 'none', background: 'transparent', fontSize: 13, color: '#475569', outline: 'none', cursor: 'pointer', fontFamily: 'ui-monospace, monospace' }}
                  value={u.op} onChange={(e) => setUnits(units.map((x, k) => k === i ? { ...x, op: e.target.value } : x))}>
                  {['+', '-', '*', '/', '(', ')'].map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
                <span style={{ cursor: 'pointer', color: '#DC2626', fontSize: 12, fontWeight: 700, padding: '0 2px' }}
                  onClick={() => setUnits(units.filter((_, k) => k !== i))}>×</span>
              </span>
            ) : (
              <input style={{ width: 64, border: '1px solid #E2E8F0', borderRadius: 6, padding: '3px 6px', fontSize: 12, outline: 'none', background: '#FAFAFB' }}
                placeholder="数字" value={u.value}
                onChange={(e) => setUnits(units.map((x, k) => k === i ? { ...x, value: e.target.value } : x))} />
            )}
          </span>
        ))}
      </div>

      {/* actions 操作区（神策：添加指标 / 添加运算符 / 数值显示方式 / 按分子属性查看） */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 10 }}>
        <button type="button"
          onClick={() => setUnits([...units, { t: 'field', field: allFields[0]?.ref ?? '', agg: 'total' as VisualAggOp }])}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
          <svg viewBox="0 0 1024 1024" width="12" height="12" fill="currentColor"><path d="M512 85.33A42.67 42.67 0 0 1 554.67 128v341.33H896a42.67 42.67 0 1 1 0 85.34H554.67V896a42.67 42.67 0 1 1-85.33 0V554.67H128a42.67 42.67 0 1 1 0-85.33h341.34V128A42.67 42.67 0 0 1 512 85.33Z" /></svg>
          添加指标
        </button>
        <button type="button"
          onClick={() => setUnits([...units, { t: 'op', op: '/' }])}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 4, border: '1px solid #BFDBFE', background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
          <svg viewBox="0 0 1024 1024" width="12" height="12" fill="currentColor"><path d="M512 85.33A42.67 42.67 0 0 1 554.67 128v341.33H896a42.67 42.67 0 1 1 0 85.34H554.67V896a42.67 42.67 0 1 1-85.33 0V554.67H128a42.67 42.67 0 1 1 0-85.33h341.34V128A42.67 42.67 0 0 1 512 85.33Z" /></svg>
          添加运算符
        </button>
        <span style={{ color: '#94A3B8', fontSize: 12 }} title="表达式帮助">?</span>
        <span style={{ width: 1, height: 16, background: '#E2E8F0' }} />
        {/* 数值显示方式：无名字下拉（3.14） */}
        <select style={{ ...inpSm, width: 130 }} value={format} onChange={(e) => setFmt(e.target.value as any)}>
          {FORMAT_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <span style={{ width: 1, height: 16, background: '#E2E8F0' }} />
        {/* 按分子属性查看 */}
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#475569', cursor: 'pointer' }}>
          <input type="checkbox" checked={molecular} onChange={(e) => setMol(e.target.checked)} style={{ cursor: 'pointer' }} />
          按分子属性查看
        </label>
      </div>

      {/* 错误提示（神策 error-tips） */}
      {!valid && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 8, color: '#DC2626', fontSize: 12 }}>
          <svg viewBox="0 0 1024 1024" width="13" height="13" fill="currentColor"><path d="M577.94 65.94a93.25 93.25 0 0 0-131.88 0l-381 381a93.25 93.25 0 0 0 0 131.88l381 381.01a93.25 93.25 0 0 0 131.88 0l381.01-381a93.25 93.25 0 0 0 0-131.89l-381-381ZM512 277.33a41.17 41.17 0 0 0-41.14 42.64l8 224.05a33.16 33.16 0 0 0 66.29 0l8-224.05A41.17 41.17 0 0 0 512 277.33Zm0 469.33A53.33 53.33 0 1 0 512 640a53.33 53.33 0 0 0 0 106.66Z" fill-rule="evenodd" /></svg>
          表达式不完整或不合法
        </div>
      )}
    </div>
  );
}

export function VisualSqlEditor({ value, sources, onChange }: {
  value: MidMetric; sources: MidDataSource[]; onChange: (v: MidMetric) => void;
}) {  const vs = value.visualSql ?? {};
  const selIds = (value.dataSourceIds && value.dataSourceIds.length) ? value.dataSourceIds : (value.dataSourceId ? [value.dataSourceId] : []);
  const selSources = sources.filter((s) => selIds.includes(s.id));
  // 字段选择：全部已选数据源的全部字段
  const allFields = selSources.flatMap((s) => s.fields.map((f) => ({ ref: fieldRef(s, f), label: fieldLabel(s, f), src: s, f })));
  const set = (p: Partial<NonNullable<MidMetric['visualSql']>>) => {
    const nv = { ...vs, ...p };
    // 08081 3.6：删除「应用到 SQL」按钮后，SQL 自动同步写入 value.sql
    onChange({ ...value, visualSql: nv, sql: buildVisualSql({ ...value, visualSql: nv }, sources) });
  };

  const labelOf = (ref: string) => allFields.find((x) => x.ref === ref)?.label ?? ref;

  const sql = useMemo(() => buildVisualSql(value, sources), [value, sources]);

  // 字段选择（事件选择）
  const events = vs.events?.length ? vs.events : [{ name: '', field: allFields[0]?.ref ?? '', agg: 'total' as VisualAggOp }];
  const setEvents = (evs: typeof events) => set({ events: evs });
  // 字段筛选展开状态（08081 3.x：点「筛选」按钮才显示字段级筛选）
  const [fieldFltsOpen, setFieldFltsOpen] = useState<Record<number, boolean>>({});

  // 分组选择：可搜索多选下拉
  const [gbOpen, setGbOpen] = useState(false);
  const [gbKw, setGbKw] = useState('');
  const gbFiltered = gbKw.trim()
    ? allFields.filter((x) => `${x.label} ${x.f.key} ${x.src.name}`.toLowerCase().includes(gbKw.trim().toLowerCase()))
    : allFields;

  // 时间范围
  const tr = vs.timeRange ?? { mode: 'dynamic' as const, dynamic: '近 7 天', compare: { enabled: false, mode: 'none' as const } };
  const setTr = (p: Partial<NonNullable<MidMetric['visualSql']>['timeRange']>) => set({ timeRange: { ...tr, ...p } as any });

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {/* ── 字段选择（3.13：指标/自定义指标 = 字段选择本身的两种模式） ── */}
      <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 10, flexWrap: 'wrap' }}>
          字段选择 <Sam value="midMetrics.json.visualSql.events" />
          {/* 指标 / 自定义指标 切换 */}
          <span style={{ display: 'inline-flex', border: '1px solid #E2E8F0', borderRadius: 6, overflow: 'hidden', marginLeft: 8 }}>
            {([['metric', '指标'], ['custom', '自定义指标']] as const).map(([m, l]) => (
              <button key={m} type="button" onClick={() => set({ calcMode: m })}
                style={{ padding: '3px 12px', fontSize: 12, cursor: 'pointer', border: 'none', background: (vs.calcMode ?? 'metric') === m ? '#2563EB' : '#fff', color: (vs.calcMode ?? 'metric') === m ? '#fff' : '#64748B', fontWeight: (vs.calcMode ?? 'metric') === m ? 600 : 400 }}>
                {l}
              </button>
            ))}
          </span>
          <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8' }}>
            {(vs.calcMode ?? 'metric') === 'metric' ? '选择多个字段，各输出一列聚合结果' : '字段选择即计算：选字段后直接编写公式，输出单列结果'}
          </span>
        </div>

        {/* 指标模式：字段行（A/B/C 字段 + 聚合 + 筛选）；自定义指标模式不显示（3.14） */}
        {(vs.calcMode ?? 'metric') === 'metric' && (
          <>
            {events.map((e, i) => (
              <div key={i}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', marginBottom: 8, flexWrap: 'wrap', background: '#F8FAFF', border: '1px solid #DBEAFE', borderRadius: 8, padding: '8px 10px' }}>
                  <span style={letterBadge}>{EVENT_LETTERS[i] ?? i + 1}</span>
                  <label style={{ ...lbl, minWidth: 240, flex: 1 }}>字段
                    <select style={inpSm} value={e.field} onChange={(ev) => setEvents(events.map((x, k) => k === i ? { ...x, field: ev.target.value } : x))}>
                      {allFields.map((x) => <option key={x.ref} value={x.ref}>{x.label}</option>)}
                    </select>
                  </label>
                  <label style={{ ...lbl, minWidth: 160 }}>聚合方式
                    <select style={inpSm} value={e.agg} onChange={(ev) => setEvents(events.map((x, k) => k === i ? { ...x, agg: ev.target.value as VisualAggOp } : x))}>
                      {(Object.keys(VISUAL_AGG_LABEL) as VisualAggOp[]).map((a) => <option key={a} value={a}>{VISUAL_AGG_LABEL[a]}</option>)}
                    </select>
                  </label>
                  <button type="button" onClick={() => setFieldFltsOpen((o) => ({ ...o, [i]: !o[i] }))}
                    style={{ border: `1px solid ${fieldFltsOpen[i] ? '#93C5FD' : '#E2E8F0'}`, background: fieldFltsOpen[i] ? '#DBEAFE' : '#fff', color: fieldFltsOpen[i] ? '#1D4ED8' : '#64748B', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer' }}>
                    筛选 {fieldFltsOpen[i] ? '▴' : '▾'}
                  </button>
                  <button type="button" onClick={() => setEvents(events.filter((_, k) => k !== i))}
                    style={{ border: '1px solid #FECACA', background: '#fff', color: '#DC2626', borderRadius: 6, padding: '4px 8px', fontSize: 12, cursor: 'pointer' }}>删除</button>
                </div>
                {fieldFltsOpen[i] && (
                  <div style={{ marginBottom: 8, marginLeft: 8 }}>
                    <CondBuilder
                      title={`字段 ${EVENT_LETTERS[i] ?? i + 1} 筛选`}
                      sourceTag={<Sam value="midMetrics.json.visualSql.events[].filters" />}
                      value={e.filters}
                      fields={allFields}
                      onChange={(f) => setEvents(events.map((x, k) => k === i ? { ...x, filters: f } : x))} />
                  </div>
                )}
              </div>
            ))}
            <button type="button" onClick={() => setEvents([...events, { name: '', field: allFields[0]?.ref ?? '', agg: 'total' as VisualAggOp }])}
              style={{ border: '1px dashed #93C5FD', background: '#EFF6FF', color: '#2563EB', borderRadius: 6, padding: '5px 12px', fontSize: 12, cursor: 'pointer' }}>＋ 添加字段</button>
          </>
        )}

        {/* 自定义指标模式（3.14）：神策流式表达式编辑器（字段.聚合单元 + 运算符 + 数字输入） */}
        {(vs.calcMode ?? 'metric') === 'custom' && (
          <CustomMetricEditor
            units={(vs.customExpr?.length ? vs.customExpr : DEFAULT_UNITS) as CustomUnit[]}
            allFields={allFields}
            labelOf={labelOf}
            format={vs.customFormat ?? 'pct2'}
            molecular={!!vs.customMolecular}
            onChange={(u, fmt, mol) => set({ customExpr: u, customFormat: fmt, customMolecular: mol })} />
        )}
      </div>

      {/* ── 全局筛选（嵌套且/或 + 新操作符） ── */}
      <CondBuilder
        title="全局筛选"
        sourceTag={<Sam value="midMetrics.json.visualSql.globalFilters" />}
        value={vs.globalFilters}
        fields={allFields}
        onChange={(f) => set({ globalFilters: f })} />

      {/* ── 分组选择 ── */}
      <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
          分组选择 <Sam value="midMetrics.json.visualSql.groupBy" />
          <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8', marginLeft: 8 }}>按字段分组（如：省份 / 产品 / 风险等级）</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
          {(vs.groupBy ?? []).map((ref) => (
            <span key={ref} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, padding: '2px 8px', borderRadius: 14, background: '#DBEAFE', color: '#1D4ED8' }}>
              {labelOf(ref)}
              <span onClick={() => set({ groupBy: (vs.groupBy ?? []).filter((k) => k !== ref) })}
                style={{ cursor: 'pointer', color: '#93C5FD', fontWeight: 700 }}>✕</span>
            </span>
          ))}
          {(vs.groupBy ?? []).length === 0 && <span style={{ fontSize: 12, color: '#94A3B8' }}>尚未选择分组字段</span>}
        </div>
        <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
          <input style={{ ...inp, width: '100%' }} placeholder="🔍 搜索字段添加分组…" value={gbKw}
            onFocus={() => setGbOpen(true)}
            onChange={(e) => { setGbKw(e.target.value); setGbOpen(true); }} />
          {gbOpen && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 40 }} onClick={() => setGbOpen(false)} />
              <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50, maxHeight: 220, overflowY: 'auto', background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, boxShadow: '0 8px 24px rgba(15,23,42,.12)', padding: 4 }}>
                {gbFiltered.length === 0 && <div style={{ fontSize: 12, color: '#94A3B8', padding: '8px 8px' }}>无匹配字段</div>}
                {gbFiltered.map((x) => {
                  const on = (vs.groupBy ?? []).includes(x.ref);
                  return (
                    <div key={x.ref} onClick={() => { set({ groupBy: on ? (vs.groupBy ?? []).filter((k) => k !== x.ref) : [...(vs.groupBy ?? []), x.ref] }); setGbKw(''); }}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 8px', borderRadius: 6, cursor: 'pointer', background: on ? '#EFF6FF' : 'transparent' }}>
                      <span style={{ width: 14, height: 14, borderRadius: 3, border: `1px solid ${on ? '#2563EB' : '#CBD5E1'}`, background: on ? '#2563EB' : '#fff', color: '#fff', fontSize: 9, lineHeight: '12px', textAlign: 'center' }}>{on ? '✓' : ''}</span>
                      <span style={{ fontSize: 12, color: '#0F172A' }}>{x.label}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 10, color: '#94A3B8', fontFamily: 'monospace' }}>{x.src.name}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
        <div style={{ marginTop: 6, fontSize: 12, color: '#64748B' }}>
          已选分组：{(vs.groupBy ?? []).map((k) => labelOf(k)).join(' / ') || '—'} <Cal label="实时配置" />
        </div>
      </div>

      {/* ── 时间选择（3.5）：粒度 + 时间范围（动态/静态）+ 对比 ── */}
      <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 10 }}>
          时间选择<Sam value="midMetrics.json.visualSql.timeGran" /><span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8', marginLeft: 8 }}>时间粒度 + 时间范围 + 对比</span>
        </div>
        <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <label style={{ ...lbl, minWidth: 110 }}>粒度
            <select style={inpSm} value={vs.timeGran ?? '按天'} onChange={(e) => set({ timeGran: e.target.value })}>
              {TIMEGRAN_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label style={{ ...lbl, minWidth: 110 }}>范围类型
            <select style={inpSm} value={tr.mode} onChange={(e) => setTr({ mode: e.target.value as 'dynamic' | 'static' })}>
              <option value="dynamic">动态时间</option>
              <option value="static">静态时间</option>
            </select>
          </label>
          {tr.mode === 'dynamic' ? (
            <label style={{ ...lbl, minWidth: 130 }}>动态范围
              <select style={inpSm} value={tr.dynamic ?? '近 7 天'} onChange={(e) => setTr({ dynamic: e.target.value })}>
                {DYNAMIC_OPTS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
          ) : (
            <label style={{ ...lbl, minWidth: 300 }}>静态起止
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <input type="date" style={inpSm} value={tr.start ?? ''} onChange={(e) => setTr({ start: e.target.value })} />
                <span style={{ color: '#94A3B8', fontSize: 11 }}>~</span>
                <input type="date" style={inpSm} value={tr.end ?? ''} onChange={(e) => setTr({ end: e.target.value })} />
              </div>
            </label>
          )}
        </div>
        {/* 对比 */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 10 }}>
          <span style={{ fontSize: 12, color: '#475569' }}>对比：</span>
          <select style={inpSm} value={tr.compare?.enabled ? (tr.compare.mode ?? 'prev') : 'none'}
            onChange={(e) => {
              const m = e.target.value;
              setTr({ compare: { enabled: m !== 'none', mode: m as any, start: tr.compare?.start, end: tr.compare?.end } });
            }}>
            {COMPARE_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
          {tr.compare?.enabled && tr.compare.mode === 'custom' && (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input type="date" style={inpSm} value={tr.compare?.start ?? ''} onChange={(e) => setTr({ compare: { ...tr.compare!, start: e.target.value } })} />
              <span style={{ color: '#94A3B8', fontSize: 11 }}>~</span>
              <input type="date" style={inpSm} value={tr.compare?.end ?? ''} onChange={(e) => setTr({ compare: { ...tr.compare!, end: e.target.value } })} />
            </div>
          )}
          {tr.compare?.enabled && tr.compare.mode !== 'custom' && (
            <span style={{ fontSize: 11, color: '#94A3B8' }}>
              {tr.compare.mode === 'prev' ? '自动取当前范围的前一段等长时间' : '自动取去年同期范围'}
            </span>
          )}
        </div>
      </div>

      {/* ── SQL 预览 ── */}
      <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, background: '#FAFAFB' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
          生成的 SQL <Cal label="实时生成" />
          <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8' }}>保存时自动写入 value.sql（08081 3.6：已移除「应用到 SQL」按钮）</span>
        </div>
        <pre style={{ margin: 0, padding: 10, background: '#0F172A', color: '#A5F3FC', borderRadius: 8, fontSize: 12, lineHeight: 1.6, overflowX: 'auto', fontFamily: 'ui-monospace, monospace', whiteSpace: 'pre' }}>{sql}</pre>
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 6 }}>
          SELECT 结果需返回各事件列（或单列 <code>val</code>），保存后由调度任务执行。
        </div>
      </div>
    </div>
  );
}
