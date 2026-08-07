// 事件分析 · 查询配置持久化 Store（沿用 midStore / metaStore 的「useSyncExternalStore + 防抖落盘」模式）
// 规则②：配置落 src/console/eventAnalysis.json，通过 /api/load-mid?file= 与 /api/save-mid?file= 读写
// 说明：只持久化「查询配置」；分组明细数据来自 eventAnalysisData 的 SEED（只读样例）。
import { useSyncExternalStore } from 'react';
import {
  SEED_EA_EVENTS, SEED_EA_FILTERS, SEED_EA_FILTER_REL, SEED_EA_GROUPS,
  EA_SUBJECT, EA_TIMEZONE, EA_SUMMARY_CFG,
} from './eventAnalysisData';
import type { EaEventItem, EaFilterCond, EaGroupItem, EaGranularity } from './eventAnalysisData';

/* ---------- 文件名（需同步登记到 vite.config.js 的 ALLOWED_FILES） ---------- */
const FILE = 'eventAnalysis.json';

export type EaChartType = 'line' | 'bar' | 'donut' | 'stack';

export interface EaConfig {
  subject: string;
  timezone: string;
  summaryCfg: string;
  events: EaEventItem[];
  filterRel: '且' | '或';
  filters: EaFilterCond[];
  groups: EaGroupItem[];
  granularity: EaGranularity;
  topN: number;
  chartType: EaChartType;
}

/* ---------- 默认配置（= 静态页打开时的状态） ---------- */
export const EA_DEFAULT: EaConfig = {
  subject: EA_SUBJECT,
  timezone: EA_TIMEZONE,
  summaryCfg: EA_SUMMARY_CFG,
  events: SEED_EA_EVENTS.map((e) => ({ ...e })),
  filterRel: SEED_EA_FILTER_REL,
  filters: SEED_EA_FILTERS.map((f) => ({ ...f, values: [...f.values] })),
  groups: SEED_EA_GROUPS.map((g) => ({ ...g })),
  granularity: 'week',
  topN: 10,
  chartType: 'line',
};

/* ---------- 保存状态（复用 SourceTag 的 MidSaveToast 展示） ---------- */
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
let saveStatus: SaveStatus = 'idle';
function setSaveStatus(s: SaveStatus) {
  saveStatus = s;
  notify();
  if (s === 'saved' || s === 'error') {
    setTimeout(() => {
      if (saveStatus === s) {
        saveStatus = 'idle';
        notify();
      }
    }, 2000);
  }
}

/* ---------- 读写原语 ---------- */
function loadOne(file: string): Promise<unknown | null> {
  return fetch(`/api/load-mid?file=${encodeURIComponent(file)}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
}
function saveOne(file: string, data: unknown) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data, null, 1),
  })
    .then((r) => setSaveStatus(r.ok ? 'saved' : 'error'))
    .catch(() => setSaveStatus('error'));
}

/* ---------- 模块级状态 ---------- */
let config: EaConfig = { ...EA_DEFAULT };

let version = 0;
const listeners = new Set<() => void>();
function notify() {
  version += 1;
  listeners.forEach((l) => l());
}
function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}
function getVersion() {
  return version;
}
function useSnap<T>(sel: () => T): T {
  useSyncExternalStore(subscribe, getVersion);
  return sel();
}

/* ---------- 防抖落盘 ---------- */
let timer: ReturnType<typeof setTimeout> | undefined;
function scheduleSave(data: unknown) {
  if (timer) clearTimeout(timer);
  setSaveStatus('saving');
  timer = setTimeout(() => saveOne(FILE, data), 350);
}

/* ---------- 启动：有盘用盘，无盘落默认配置 ---------- */
async function bootstrap() {
  const c = await loadOne(FILE);
  if (c && typeof c === 'object' && Array.isArray((c as EaConfig).events)) {
    config = { ...EA_DEFAULT, ...(c as EaConfig) };
  } else {
    saveOne(FILE, config);
  }
  notify();
}
void bootstrap();

/* ---------- 读取 hooks ---------- */
export function useEaSaveStatus(): SaveStatus {
  return useSnap(() => saveStatus);
}
export function useEaConfig(): EaConfig {
  return useSnap(() => config);
}

/* ---------- 更新入口 ---------- */
export function updateEaConfig(fn: (c: EaConfig) => EaConfig) {
  config = fn(config);
  notify();
  scheduleSave(config);
}
export function resetEaConfig() {
  config = {
    ...EA_DEFAULT,
    events: EA_DEFAULT.events.map((e) => ({ ...e })),
    filters: EA_DEFAULT.filters.map((f) => ({ ...f, values: [...f.values] })),
    groups: EA_DEFAULT.groups.map((g) => ({ ...g })),
  };
  notify();
  scheduleSave(config);
}

/* ---------- 工具 ---------- */
export function eaNewId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}
