// 管理中心配置模块 · 共享模板
// 目的：让 数据源 / 指标 / 策略 / 页面 四个配置模块共用同一套页面骨架、面包屑、来源标签与文案映射，
// 改一处即可全局生效，满足「所有页面用同一个模板，修改方便」。
import { useState, type ReactNode } from 'react';
import { PageShell } from './PageShell';
import { Panel, DataTable, Modal, Button, DetailHeader } from '../components/ui';
import type { Column, Row } from '../components/ui';
import type { MidRule, MidTask, MonitorGranularity, RuleLogic } from './midData';
import { WEEK_DAYS } from './midData';

// ---- 面包屑 / 容器（统一） ----
export const CONFIG_CRUMB = '零售信贷风控 / 管理中心';
export function crumb(...parts: string[]) {
  return [CONFIG_CRUMB, ...parts].join(' / ');
}
export const CONFIG_CONTAINER = 'mx-auto max-w-6xl space-y-5 px-4 py-6 lg:px-8';

// ---- 共享文案映射（集中维护，4 模块一致） ----
export const SRC_TYPE_LABEL: Record<string, string> = { sql: '数据库' };
export const METRIC_TYPE_LABEL: Record<string, string> = { base: '基础指标', derived: '派生指标' };
export const GRAN_LABEL: Record<MonitorGranularity, string> = { realtime: '实时', minute: '按分钟', hour: '按小时', day: '按天', week: '按周', month: '按月' };
export const LOGIC_LABEL: Record<RuleLogic, string> = { and: '且', or: '或' };
export const OUTPUT_LABEL: Record<string, string> = { api: 'API 推送', url: '页面 URL', file: '文件导出', web: '监控看板' };
export const OP_LABEL: Record<string, string> = { gt: '>', gte: '≥', lt: '<', lte: '≤', eq: '=', neq: '≠', exists: '有值', contains: '包含' };
export const COMPARE_LABEL: Record<string, string> = { lt: '低于', gt: '高于', eq: '等于' };
export const BASELINE_LABEL: Record<string, string> = { yesterday: '昨天同期', lastWeek: '上周同期', lastMonth: '上月同期' };
export const WTYPE_LABEL: Record<string, string> = { metric: '指标卡', line: '折线', bar: '柱状', donut: '环形', table: '明细表', productMetrics: '评分产品指标卡' };

// ---- 数值格式化（指标预览 / 详情共用） ----
export function fmt(v: number | string | undefined | null, precision = 0, unit = '') {
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'number' ? v : Number(v);
  if (Number.isNaN(n)) return String(v);
  const s = precision > 0 ? n.toFixed(precision) : String(Math.round(n));
  return unit ? `${s}${unit}` : s;
}

// 预警规则摘要（多条件 + 且/或）——用于列表行与卡片一句话展示
export function ruleSummary(r: MidRule, nameOf: (id: string) => string): string {
  const parts = r.conds.map((c) => {
    const op = OP_LABEL[c.op] ?? c.op;
    if (c.op === 'exists') return `「${nameOf(c.metricId)}」有值`;
    return `「${nameOf(c.metricId)}」${op} ${c.value}`;
  });
  return parts.join(r.logic === 'and' ? ' 且 ' : ' 或 ');
}

// 监控粒度 + 监控时段 → 一句话展示（对齐文件「监控粒度 / 监控时段」）
export function granText(t: MidTask): string {
  const g = GRAN_LABEL[t.granularity];
  const p = t.period;
  if (t.granularity === 'realtime' || t.granularity === 'minute' || t.granularity === 'hour') return g;
  const parts: string[] = [];
  if (t.granularity === 'week' && p?.days?.length) {
    parts.push(p.days.map((d) => WEEK_DAYS.find((w) => w.key === d)?.label ?? d).join('/'));
  }
  if (p?.hours?.length) parts.push(p.hours.map((h) => `${h}:00`).join('、'));
  return [g, ...parts].join(' · ') || g;
}

// ---- 列表页骨架（PageShell + Panel + DataTable 粘性首尾列 + 新建 + 编辑器弹窗） ----
export interface ListTab {
  key: string;
  label: string;
  count: number;
  columns: Column[];
  rows: Row[];
}
export interface ConfigListPageProps {
  title: string;
  crumbPath: string; // 面包屑末级（不含 CONFIG_CRUMB 前缀）
  subtitle?: string;
  addLabel?: string;
  onAdd?: () => void;
  actions?: ReactNode;
  panelActions?: ReactNode; // 列表面板头部的自定义按钮（如分表「新建」）
  stats?: ReactNode; // 列表面板上方的统计卡区（可选，如规则合集的命中统计）
  panelTitle: string;
  panelDesc?: string;
  // 单表模式
  columns?: Column[];
  rows?: Row[];
  // 多表（分页签）模式，如策略配置
  tabs?: ListTab[];
  onView: (r: Row, tabKey?: string) => void;
  rowActions?: (r: Row, tabKey?: string) => ReactNode; // 操作列自定义（默认「查看」）；用于追加业务流程操作按钮
  editOpen: boolean;
  editTitle: string;
  onCloseEdit: () => void;
  onSave: () => void;
  children: ReactNode; // 编辑器弹窗内容
  emptyText?: string;
  modalWidth?: string;
}
export function ConfigListPage(p: ConfigListPageProps) {
  const [tab, setTab] = useState<string>(p.tabs?.[0]?.key ?? '');
  const active = p.tabs?.find((t) => t.key === tab) ?? null;
  const columns = active ? active.columns : p.columns ?? [];
  const rows = active ? active.rows : p.rows ?? [];
  const onView = (r: Row) => p.onView(r, active?.key);
  return (
    <div className={CONFIG_CONTAINER}>
      <PageShell title={p.title} crumb={crumb(p.crumbPath)} subtitle={p.subtitle}
        actions={<><>{p.actions}</>{p.addLabel && <Button size="sm" onClick={p.onAdd}>{p.addLabel}</Button>}</>} />

      {p.tabs && (
        <div className="flex gap-1 border-b border-slate-200">
          {p.tabs.map((t) => (
            <button key={t.key} type="button" onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium ${tab === t.key ? 'border-b-2 border-brand-600 text-brand-600' : 'border-b-2 border-transparent text-slate-500'}`}>
              {t.label} <span className="text-xs opacity-60">({t.count})</span>
            </button>
          ))}
        </div>
      )}

      {p.stats && <div className="mb-4">{p.stats}</div>}

      <Panel title={p.panelTitle} desc={p.panelDesc}
        actions={<>{p.panelActions}</>}>
        <DataTable columns={columns} rows={rows}
          actions={(r) => p.rowActions
            ? p.rowActions(r, active?.key)
            : (
              <Button size="sm" variant="ghost" onClick={() => onView(r)}>查看</Button>
            )} empty={p.emptyText} pager defaultPageSize={20} />
      </Panel>

      <Modal open={p.editOpen} onClose={p.onCloseEdit} title={p.editTitle} width={p.modalWidth ?? 'max-w-2xl'}
        footer={<><Button onClick={p.onSave}>保存</Button><Button variant="secondary" onClick={p.onCloseEdit}>取消</Button></>}>
        {p.children}
      </Modal>
    </div>
  );
}

// ---- 详情页骨架（PageShell + InfoCell 头条 + 任意分区） ----
export interface ConfigDetailPageProps {
  title: string;
  crumbParts: string[]; // 面包屑末级片段（不含 CONFIG_CRUMB 前缀）
  subtitle?: string;
  actions?: ReactNode;
  infoCells: ReactNode; // 顶部 InfoCell 网格
  children: ReactNode; // Panels
  backLabel?: string;   // 顶部左侧返回按钮文案（与报告模板详情页一致）
  onBack?: () => void;  // 顶部左侧返回按钮动作（显式优先）
  backTo?: string;      // 统一框架兜底：未传 onBack 时，返回优先读 ?back=，否则回退到此路径
  flowBar?: ReactNode;  // 需求21：流程操作行（面包屑下方，保存/流程按钮/状态标签）
}
export function ConfigDetailPage(p: ConfigDetailPageProps) {
  const header = p.onBack || p.backTo ? (
    <DetailHeader
      title={p.title}
      crumb={crumb(...p.crumbParts)}
      subtitle={p.subtitle}
      backLabel={p.backLabel ?? '返回列表'}
      onBack={p.onBack}
      backTo={p.backTo}
      actions={p.actions}
      flowBar={p.flowBar}
    />
  ) : undefined;
  return (
    <div className={CONFIG_CONTAINER}>
      <PageShell title={p.title} crumb={crumb(...p.crumbParts)} subtitle={p.subtitle} actions={p.actions} header={header} />
      {p.infoCells}
      {p.children}
    </div>
  );
}
