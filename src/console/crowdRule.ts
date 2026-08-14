/* 客户分组规则（评分产品 · 客户洞察）
 * 分组规则 = VisualCond 条件列表（复用指标库/可视化SQL编辑器的条件结构）+ 顶层且/或。
 * 成员由规则对 midCustomers 实时求值得出（count 为冗余展示值，编辑保存时写回）。
 */
import type { MidCustomer, VisualCond } from './midData';
import { VISUAL_OP_LABEL } from './midData';

/* ---- 分组可选字段（来自客户主档 + 三模型分 + 派生额度使用率）。
 *   注：风险等级已从规则编辑器移除 —— 规则公式编辑器（VisualSqlEditor）按风险等级/分档配置，
 *       分组侧不再重复暴露该字段，改用三模型分等可量化字段表达同样的分层意图。 ---- */
export const CROWD_FIELDS: { ref: string; label: string; group: string }[] = [
  { ref: 'product', label: '产品', group: '客户属性' },
  { ref: 'loanStatus', label: '贷款状态', group: '客户属性' },
  { ref: 'creditLine', label: '授信额度（元）', group: '客户属性' },
  { ref: 'loanBalance', label: '在贷余额（元）', group: '客户属性' },
  { ref: 'utilization', label: '额度使用率（%）', group: '派生' },
  { ref: 'score.zhicha', label: '智察分（欺诈）', group: '模型分' },
  { ref: 'score.zhixin', label: '智信分（信用）', group: '模型分' },
  { ref: 'score.zhirong', label: '智融分（综合）', group: '模型分' },
];
export const CROWD_FIELD_GROUPS = ['客户属性', '派生', '模型分'];

/* ---- 字段取值（统一入口；数值字段返回 number，文本返回 string） ---- */
function fallbackScore(c: MidCustomer, prod: 'zhicha' | 'zhixin' | 'zhirong'): number | null {
  const W: Record<string, number> = { 欺诈: 0.3, 多头: 0.25, 行为: 0.2, 司法: 0.15, 负债: 0.1, 舆情: 0.05 };
  const used = (c.riskDims ?? []).filter((d) => W[d.dim] != null);
  if (!used.length) return null;
  const wsum = used.reduce((s, d) => s + W[d.dim], 0);
  const riskAvg = used.reduce((s, d) => s + d.score * W[d.dim], 0) / wsum;
  if (prod === 'zhicha') return Math.round(riskAvg);
  if (prod === 'zhixin') return Math.max(300, Math.min(900, Math.round(900 - riskAvg * 3.4)));
  return Math.max(300, Math.min(900, Math.round(900 - riskAvg * 3.8)));
}

export function crowdFieldValue(c: MidCustomer, ref: string): string | number {
  switch (ref) {
    case 'riskLevel': return (c.riskLevel ?? '') || '—';
    case 'product': return c.product ?? '';
    case 'loanStatus': return c.loanStatus ?? '';
    case 'creditLine': return c.creditLine ?? 0;
    case 'loanBalance': return c.loanBalance ?? 0;
    case 'utilization': {
      const l = c.loanBalance ?? 0;
      const cl = c.creditLine ?? 0;
      return cl > 0 ? Math.round((l / cl) * 1000) / 10 : 0;
    }
    default: {
      if (ref.startsWith('score.')) {
        const p = ref.slice(6) as 'zhicha' | 'zhixin' | 'zhirong';
        const s = c.scores?.[p]?.score;
        if (s != null) return s;
        return fallbackScore(c, p) ?? -1;
      }
      return '';
    }
  }
}

/* ---- 单条条件匹配 ---- */
export function matchCond(cond: VisualCond, c: MidCustomer): boolean {
  if (!cond.field) return false;
  const v = crowdFieldValue(c, cond.field);
  const empty = v === '' || v === '—' || v == null;
  if (cond.op === 'empty') return empty;
  if (cond.op === 'has') return !empty;
  if (empty) return false;
  const num = typeof v === 'number';
  const n = (s?: string) => Number(String(s ?? '').trim());
  switch (cond.op) {
    case 'eq': return String(v) === String(cond.value ?? '').trim();
    case 'neq': return String(v) !== String(cond.value ?? '').trim();
    case 'lt': return num ? v < n(cond.value) : false;
    case 'gt': return num ? v > n(cond.value) : false;
    case 'range': return num ? v >= n(cond.value) && v <= n(cond.rangeMax) : false;
    case 'in': return (cond.values ?? []).includes(String(v));
    default: return false;
  }
}

/* ---- 整条规则匹配（顶层且/或） ---- */
export function matchCrowd(c: MidCustomer, conds: VisualCond[] | undefined, logic: 'and' | 'or' = 'and'): boolean {
  const list = (conds ?? []).filter((x) => x.field);
  if (!list.length) return false;
  return logic === 'or' ? list.some((x) => matchCond(x, c)) : list.every((x) => matchCond(x, c));
}

/* ---- 命中成员列表（预览 20 条 / 列表页全量） ---- */
export function crowdMembers(g: { conds?: VisualCond[]; logic?: 'and' | 'or' }, customers: MidCustomer[]): MidCustomer[] {
  return customers.filter((c) => matchCrowd(c, g.conds, g.logic));
}

/* ---- 规则可读文本（展示与回写 group.rule） ---- */
export function crowdRuleText(conds: VisualCond[] | undefined, logic: 'and' | 'or' = 'and'): string {
  const list = (conds ?? []).filter((x) => x.field);
  if (!list.length) return '—';
  const parts = list.map((c) => {
    const f = CROWD_FIELDS.find((x) => x.ref === c.field);
    const fn = f?.label ?? c.field;
    const opn = VISUAL_OP_LABEL[c.op] ?? c.op;
    if (c.op === 'has') return `${fn} 有值`;
    if (c.op === 'empty') return `${fn} 没值`;
    if (c.op === 'in') return `${fn} 包含 ${(c.values ?? []).join('、')}`;
    if (c.op === 'range') return `${fn} 区间 ${c.value ?? ''}~${c.rangeMax ?? ''}`;
    return `${fn} ${opn} ${c.value ?? ''}`;
  });
  return parts.join(logic === 'or' ? ' 或 ' : ' 且 ');
}

/* 判断规则是否有效（至少一条完整条件） */
export function crowdRuleValid(conds: VisualCond[] | undefined): boolean {
  return (conds ?? []).some((c) => c.field && String(c.value ?? '') !== '');
}
