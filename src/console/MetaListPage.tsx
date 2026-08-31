// 元数据管理 · 通用列表页骨架（8 个子页面共用）
// 结构对齐 sensors/ 静态页：页头 → 筛选栏（下拉 + 关键字）→ 列表（首列可点）→ 底部条数/分页 → 右侧详情抽屉
// 复用优先（规则④）：PageShell / Panel / DataTable / Drawer / SingleSelect 全部取自既有实现
import { useMemo, useState, type ReactNode } from 'react';
import { Panel, DataTable, Drawer, SingleSelect } from '../components/ui';
import type { Column, Row, BadgeVal } from '../components/ui';
import { PageShell } from './PageShell';
import { MidSaveToast } from './SourceTag';
import { crumb, CONFIG_CONTAINER } from './ConfigTemplate';
import { useMetaSaveStatus } from './metaStore';

/* ---------- 单元格取文本（兼容 { v, kind } 徽标对象） ---------- */
export function cellText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'object' && v !== null && 'v' in (v as BadgeVal)) return String((v as BadgeVal).v);
  if (typeof v === 'string' || typeof v === 'number') return String(v);
  return '';
}

/* ---------- 筛选项声明 ---------- */
export interface MetaFilter {
  key: string; // 对应 Row 的字段名
  label: string; // 下拉占位文案
  options: string[]; // 选项列表（第一项通常为「全部」）
  defaultValue?: string; // 默认选中（如「可见」）
}

const PAGE_SIZE = 20;

export interface MetaListPageProps {
  title: string;
  crumbPath: string;
  subtitle?: string;
  jsonFile: string; // 样例 JSON 文件名，用于来源标签
  headerActions?: ReactNode; // 页头右侧
  filters?: MetaFilter[];
  searchPlaceholder?: string;
  searchKeys?: string[]; // 参与关键字匹配的字段；缺省匹配全部字段
  panelTitle: string;
  panelDesc?: string;
  panelActions?: ReactNode;
  columns: Column[];
  rows: Row[];
  clickableKey: string; // 第一列字段名 —— 点击弹出详情
  onRowClick: (row: Row) => void;
  rowActions?: (row: Row) => ReactNode;
  emptyText?: string;
  // 抽屉
  drawerOpen: boolean;
  drawerTitle: string;
  drawerWidth?: string;
  onCloseDrawer: () => void;
  children?: ReactNode; // 抽屉内容
}

export function MetaListPage(p: MetaListPageProps) {
  const saveStatus = useMetaSaveStatus();
  const [kw, setKw] = useState('');
  const [page, setPage] = useState(1);
  const [filt, setFilt] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    (p.filters ?? []).forEach((f) => {
      init[f.key] = f.defaultValue ?? '';
    });
    return init;
  });

  const filtered = useMemo(() => {
    const q = kw.trim().toLowerCase();
    return p.rows.filter((r) => {
      for (const [k, v] of Object.entries(filt)) {
        if (!v || v === '全部') continue;
        if (cellText(r[k]) !== v) return false;
      }
      if (!q) return true;
      const pool = p.searchKeys?.length
        ? p.searchKeys.map((k) => cellText(r[k]))
        : Object.values(r).map((x) => cellText(x));
      return pool.some((s) => s.toLowerCase().includes(q));
    });
  }, [p.rows, p.searchKeys, filt, kw]);

  const totalPage = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const curPage = Math.min(page, totalPage);
  const paged = filtered.slice((curPage - 1) * PAGE_SIZE, curPage * PAGE_SIZE);

  const reset = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div className={CONFIG_CONTAINER}>
      <MidSaveToast status={saveStatus} />
      <PageShell
        title={p.title}
        crumb={crumb('元数据管理', p.crumbPath)}
        subtitle={p.subtitle}
        actions={
          <>
            {p.headerActions}
          </>
        }
      />

      <Panel title={p.panelTitle} desc={p.panelDesc} actions={p.panelActions}>
        {/* 筛选栏 */}
        {(p.filters?.length || p.searchPlaceholder) && (
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {(p.filters ?? []).map((f) => (
              <SingleSelect
                key={f.key}
                label={f.label}
                options={f.options.map((o) => ({ label: o, value: o }))}
                value={filt[f.key] ?? ''}
                onChange={(v) => reset(() => setFilt((s) => ({ ...s, [f.key]: v })))}
                clearable
              />
            ))}
            {p.searchPlaceholder && (
              <div className="relative ml-auto">
                <input
                  value={kw}
                  onChange={(e) => reset(() => setKw(e.target.value))}
                  placeholder={p.searchPlaceholder}
                  className="h-9 w-64 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-brand-300"
                />
                <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                  🔍
                </span>
              </div>
            )}
          </div>
        )}

        <DataTable
          columns={p.columns}
          rows={paged}
          empty={p.emptyText ?? '暂无数据'}
          clickableKey={p.clickableKey}
          onCellClick={p.onRowClick}
          actions={p.rowActions}
        />

        {/* 底部：条数 + 分页 */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-400">
          <span>共 {filtered.length} 条</span>
          {totalPage > 1 && (
            <div className="flex items-center gap-1">
              <PageBtn disabled={curPage === 1} onClick={() => setPage(curPage - 1)}>
                上一页
              </PageBtn>
              {Array.from({ length: totalPage }, (_, i) => i + 1)
                .filter((n) => n === 1 || n === totalPage || Math.abs(n - curPage) <= 2)
                .map((n, i, arr) => (
                  <span key={n} className="flex items-center gap-1">
                    {i > 0 && arr[i - 1] !== n - 1 && <span className="px-1">•••</span>}
                    <button
                      type="button"
                      onClick={() => setPage(n)}
                      className={`min-w-[26px] rounded-md px-1.5 py-1 transition ${
                        n === curPage ? 'bg-brand-50 font-medium text-brand-700' : 'hover:bg-slate-100'
                      }`}
                    >
                      {n}
                    </button>
                  </span>
                ))}
              <PageBtn disabled={curPage === totalPage} onClick={() => setPage(curPage + 1)}>
                下一页
              </PageBtn>
              <span className="ml-2">20 条/页</span>
            </div>
          )}
        </div>
      </Panel>

      <Drawer
        open={p.drawerOpen}
        onClose={p.onCloseDrawer}
        title={p.drawerTitle}
        width={p.drawerWidth ?? 'max-w-2xl'}
      >
        {p.children}
      </Drawer>
    </div>
  );
}

function PageBtn({ disabled, onClick, children }: { disabled?: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-md px-2 py-1 transition enabled:hover:bg-slate-100 disabled:opacity-40"
    >
      {children}
    </button>
  );
}

/* ============================================================
 * 详情抽屉内的展示原子组件（8 个页面共用）
 * ========================================================== */

/** 详情字段行：左标签右值 */
export function MetaField({ label, value, tag }: { label: string; value?: ReactNode; tag?: ReactNode }) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-50 py-2.5 last:border-0">
      <span className="w-40 shrink-0 text-xs text-slate-400">{label}</span>
      <span className="flex-1 break-all text-sm text-slate-700">
        {value === undefined || value === null || value === '' ? '-' : value}
        {tag}
      </span>
    </div>
  );
}

/** 抽屉内小节 */
export function MetaSection({ title, desc, children }: { title: string; desc?: string; children: ReactNode }) {
  return (
    <section className="mt-5 first:mt-0">
      <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
      {desc && <p className="mt-0.5 text-xs text-slate-400">{desc}</p>}
      <div className="mt-2">{children}</div>
    </section>
  );
}

/** 抽屉内嵌明细表（如「关联此属性的事件明细」） */
export function MiniTable({ head, rows, empty = '暂无数据' }: { head: string[]; rows: (ReactNode[])[]; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-100">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs font-medium text-slate-400">
            {head.map((h) => (
              <th key={h} className="whitespace-nowrap px-3 py-2">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={head.length} className="px-3 py-6 text-center text-xs text-slate-400">
                {empty}
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0">
                {r.map((c, j) => (
                  <td key={j} className="whitespace-nowrap px-3 py-2 text-slate-600">
                    {c}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/** 徽标：显示状态 / 上报数据等 */
export function metaBadge(v: string): BadgeVal {
  const green = ['可见', '有数据', '允许', '有', '是'];
  const red = ['隐藏', '停止', '无数据'];
  const kind = green.includes(v) ? 'green' : red.includes(v) ? 'red' : 'gray';
  return { v: v || '-', kind };
}
