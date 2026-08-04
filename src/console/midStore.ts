// 贷中监控 · 数据层（useSyncExternalStore + 本地 JSON 分文件持久化）
// 数据流向（严格按需求细则）：
//   配置 JSON（蓝，管理中心作者）: midDataSources / midMetrics / midStrategy / midDashboards
//   样例 JSON（橘，使用域作者）: midAlerts / midCustomers / midDisposeTasks
// 启动：逐个 /api/load-mid?file= 加载；文件不存在则用代码 SEED 并立即落盘（创建样例 JSON）。
import { useSyncExternalStore } from 'react';
import {
  SEED_DATA_SOURCES, SEED_METRICS, SEED_STRATEGY, SEED_DASHBOARDS,
  SEED_ALERTS, SEED_CUSTOMERS, SEED_DISPOSE_TASKS,
} from './midData';
import type {
  MidDataSource, MidMetric, MidStrategy, MidDashboardPage,
  MidAlert, MidCustomer, MidDisposeTask,
} from './midData';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const FILES = {
  dataSources: 'midDataSources.json',
  metrics: 'midMetrics.json',
  strategy: 'midStrategy.json',
  dashboards: 'midDashboards.json',
  alerts: 'midAlerts.json',
  customers: 'midCustomers.json',
  disposeTasks: 'midDisposeTasks.json',
} as const;

function loadOne(file: string): Promise<unknown | null> {
  return fetch(`/api/load-mid?file=${encodeURIComponent(file)}`)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
}
function saveOne(file: string, data: unknown) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }).then((r) => setSaveStatus(r.ok ? 'saved' : 'error')).catch(() => setSaveStatus('error'));
}

let dataSources: MidDataSource[] = [...SEED_DATA_SOURCES];
let metrics: MidMetric[] = [...SEED_METRICS];
let strategy: MidStrategy = {
  tasks: [...SEED_STRATEGY.tasks],
  rules: [...SEED_STRATEGY.rules],
  disposes: [...SEED_STRATEGY.disposes],
};
let dashboards: MidDashboardPage[] = [...SEED_DASHBOARDS];
let alerts: MidAlert[] = [...SEED_ALERTS];
let customers: MidCustomer[] = [...SEED_CUSTOMERS];
let disposeTasks: MidDisposeTask[] = [...SEED_DISPOSE_TASKS];

let version = 0;
const listeners = new Set<() => void>();
let saveStatus: SaveStatus = 'idle';
const statusListeners = new Set<(s: SaveStatus) => void>();
const timers: Partial<Record<keyof typeof FILES, ReturnType<typeof setTimeout>>> = {};

function notify() {
  version += 1;
  listeners.forEach((l) => l());
}
function setSaveStatus(s: SaveStatus) {
  saveStatus = s;
  statusListeners.forEach((l) => l(s));
}

function scheduleSave(file: keyof typeof FILES, data: unknown) {
  if (timers[file]) clearTimeout(timers[file]);
  setSaveStatus('saving');
  timers[file] = setTimeout(() => saveOne(FILES[file], data), 350);
}

// 启动加载：文件存在则用磁盘数据；不存在则用 SEED 并立即落盘（创建本地 JSON）
async function bootstrap() {
  const [ds, mt, st, db, al, cu, dp] = await Promise.all([
    loadOne(FILES.dataSources),
    loadOne(FILES.metrics),
    loadOne(FILES.strategy),
    loadOne(FILES.dashboards),
    loadOne(FILES.alerts),
    loadOne(FILES.customers),
    loadOne(FILES.disposeTasks),
  ]);
  // dev 期形态校验（仅告警，不改行为）：样例/配置 JSON 结构与预期不符时提示
  if (import.meta.env.DEV) {
    for (const [file, data, arr] of [
      ['midDataSources.json', ds, true],
      ['midMetrics.json', mt, true],
      ['midStrategy.json', st, false],
      ['midDashboards.json', db, true],
      ['midAlerts.json', al, true],
      ['midCustomers.json', cu, true],
      ['midDisposeTasks.json', dp, true],
    ] as [string, unknown, boolean][]) {
      if (data == null) console.warn(`[mid][dev] ${file} 缺失，已用 SEED 落盘`);
      else if (arr && !Array.isArray(data)) console.warn(`[mid][dev] ${file} 期望数组，实际为 ${typeof data}`);
      else if (!arr && (typeof data !== 'object' || Array.isArray(data))) console.warn(`[mid][dev] ${file} 期望对象`);
    }
  }
  if (Array.isArray(ds) && ds.length) dataSources = ds as MidDataSource[]; else saveOne(FILES.dataSources, dataSources);
  if (Array.isArray(mt) && mt.length) metrics = mt as MidMetric[]; else saveOne(FILES.metrics, metrics);
  if (st && Array.isArray((st as MidStrategy).tasks)) strategy = st as MidStrategy; else saveOne(FILES.strategy, strategy);
  if (Array.isArray(db) && db.length) dashboards = db as MidDashboardPage[]; else saveOne(FILES.dashboards, dashboards);
  if (Array.isArray(al) && al.length) alerts = al as MidAlert[]; else saveOne(FILES.alerts, alerts);
  if (Array.isArray(cu) && cu.length) customers = cu as MidCustomer[]; else saveOne(FILES.customers, customers);
  if (Array.isArray(dp) && dp.length) disposeTasks = dp as MidDisposeTask[]; else saveOne(FILES.disposeTasks, disposeTasks);
  notify();
}
void bootstrap();

function subscribe(l: () => void) { listeners.add(l); return () => { listeners.delete(l); }; }
function getVersion() { return version; }
function useSnap<T>(sel: () => T): T { useSyncExternalStore(subscribe, getVersion); return sel(); }

export function useMidDataSources(): MidDataSource[] { return useSnap(() => dataSources); }
export function useMidMetrics(): MidMetric[] { return useSnap(() => metrics); }
export function useMidStrategy(): MidStrategy { return useSnap(() => strategy); }
export function useMidDashboards(): MidDashboardPage[] { return useSnap(() => dashboards); }
export function useMidAlerts(): MidAlert[] { return useSnap(() => alerts); }
export function useMidCustomers(): MidCustomer[] { return useSnap(() => customers); }
export function useMidDisposeTasks(): MidDisposeTask[] { return useSnap(() => disposeTasks); }

export function useMidSaveStatus(): SaveStatus {
  useSyncExternalStore(
    (l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; },
    () => saveStatus,
  );
  return saveStatus;
}

// ---- 更新入口（编辑后 notify + 仅保存对应文件）----
export function updateDataSources(fn: (list: MidDataSource[]) => MidDataSource[]) {
  dataSources = fn(dataSources); notify(); scheduleSave('dataSources', dataSources);
}
export function updateMetrics(fn: (list: MidMetric[]) => MidMetric[]) {
  metrics = fn(metrics); notify(); scheduleSave('metrics', metrics);
}
export function updateStrategy(fn: (s: MidStrategy) => MidStrategy) {
  strategy = fn(strategy); notify(); scheduleSave('strategy', strategy);
}
export function updateDashboards(fn: (list: MidDashboardPage[]) => MidDashboardPage[]) {
  dashboards = fn(dashboards); notify(); scheduleSave('dashboards', dashboards);
}
export function updateAlerts(fn: (list: MidAlert[]) => MidAlert[]) {
  alerts = fn(alerts); notify(); scheduleSave('alerts', alerts);
}
export function updateCustomers(fn: (list: MidCustomer[]) => MidCustomer[]) {
  customers = fn(customers); notify(); scheduleSave('customers', customers);
}
export function updateDisposeTasks(fn: (list: MidDisposeTask[]) => MidDisposeTask[]) {
  disposeTasks = fn(disposeTasks); notify(); scheduleSave('disposeTasks', disposeTasks);
}

export function midNewId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}
