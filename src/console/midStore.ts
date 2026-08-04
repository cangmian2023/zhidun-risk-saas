// 贷中监控 · 配置 store（useSyncExternalStore + 本地 JSON 持久化）
// 模式参照 templateStore：启动 fetch /api/load-*，命中则用磁盘数据；编辑后 debounce 保存到本地 JSON
import { useSyncExternalStore } from 'react';
import {
  SEED_DATA_SOURCES, SEED_METRICS, SEED_STRATEGY, SEED_DASHBOARDS,
  SEED_CUSTOMERS, SEED_DISPOSE_TASKS,
} from './midData';
import type { MidDataSource, MidMetric, MidStrategy, MidDashboardPage, MidCustomer, MidDisposeTask } from './midData';

let dataSources: MidDataSource[] = [...SEED_DATA_SOURCES];
let metrics: MidMetric[] = [...SEED_METRICS];
let strategy: MidStrategy = {
  tasks: [...SEED_STRATEGY.tasks],
  rules: [...SEED_STRATEGY.rules],
  disposes: [...SEED_STRATEGY.disposes],
};
let dashboards: MidDashboardPage[] = [...SEED_DASHBOARDS];
let customers: MidCustomer[] = [...SEED_CUSTOMERS];
let disposeTasks: MidDisposeTask[] = [...SEED_DISPOSE_TASKS];

let version = 0;
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | undefined;
let saveStatus: 'idle' | 'saving' | 'saved' | 'error' = 'idle';
const statusListeners = new Set<(s: typeof saveStatus) => void>();

function notify() {
  version += 1;
  listeners.forEach((l) => l());
}

function setSaveStatus(s: typeof saveStatus) {
  saveStatus = s;
  statusListeners.forEach((l) => l(s));
}

function post(path: string, body: unknown) {
  return fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  setSaveStatus('saving');
  saveTimer = setTimeout(() => {
    Promise.all([
      post('/api/save-mid-datasources', dataSources),
      post('/api/save-mid-metrics', metrics),
      post('/api/save-mid-strategies', strategy),
      post('/api/save-mid-dashboards', dashboards),
      post('/api/save-mid-customers', customers),
      post('/api/save-mid-dispose-tasks', disposeTasks),
    ])
      .then(() => setSaveStatus('saved'))
      .catch(() => setSaveStatus('error'));
  }, 400);
}

async function loadAll() {
  const [ds, mt, st, db, cu, dp] = await Promise.all([
    fetch('/api/load-mid-datasources').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch('/api/load-mid-metrics').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch('/api/load-mid-strategies').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch('/api/load-mid-dashboards').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch('/api/load-mid-customers').then((r) => (r.ok ? r.json() : null)).catch(() => null),
    fetch('/api/load-mid-dispose-tasks').then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);
  if (Array.isArray(ds) && ds.length) dataSources = ds as MidDataSource[];
  if (Array.isArray(mt) && mt.length) metrics = mt as MidMetric[];
  if (st && Array.isArray(st.tasks)) strategy = st as MidStrategy;
  if (Array.isArray(db) && db.length) dashboards = db as MidDashboardPage[];
  if (Array.isArray(cu) && cu.length) customers = cu as MidCustomer[];
  if (Array.isArray(dp) && dp.length) disposeTasks = dp as MidDisposeTask[];
  notify();
}

void loadAll();

function subscribe(l: () => void) {
  listeners.add(l);
  return () => { listeners.delete(l); };
}
function getVersion() { return version; }

export function useMidDataSources(): MidDataSource[] {
  useSyncExternalStore(subscribe, getVersion);
  return dataSources;
}
export function useMidMetrics(): MidMetric[] {
  useSyncExternalStore(subscribe, getVersion);
  return metrics;
}
export function useMidStrategy(): MidStrategy {
  useSyncExternalStore(subscribe, getVersion);
  return strategy;
}
export function useMidDashboards(): MidDashboardPage[] {
  useSyncExternalStore(subscribe, getVersion);
  return dashboards;
}
export function useMidCustomers(): MidCustomer[] {
  useSyncExternalStore(subscribe, getVersion);
  return customers;
}
export function useMidDisposeTasks(): MidDisposeTask[] {
  useSyncExternalStore(subscribe, getVersion);
  return disposeTasks;
}

export function useMidSaveStatus() {
  useSyncExternalStore(
    (l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; },
    () => saveStatus,
  );
  return saveStatus;
}

// ---- 更新入口（页面编辑后调用，自动 notify + 保存）----
export function updateDataSources(fn: (list: MidDataSource[]) => MidDataSource[]) {
  dataSources = fn(dataSources);
  notify();
  scheduleSave();
}
export function updateMetrics(fn: (list: MidMetric[]) => MidMetric[]) {
  metrics = fn(metrics);
  notify();
  scheduleSave();
}
export function updateStrategy(fn: (s: MidStrategy) => MidStrategy) {
  strategy = fn(strategy);
  notify();
  scheduleSave();
}
export function updateDashboards(fn: (list: MidDashboardPage[]) => MidDashboardPage[]) {
  dashboards = fn(dashboards);
  notify();
  scheduleSave();
}
export function updateCustomers(fn: (list: MidCustomer[]) => MidCustomer[]) {
  customers = fn(customers);
  notify();
  scheduleSave();
}
export function updateDisposeTasks(fn: (list: MidDisposeTask[]) => MidDisposeTask[]) {
  disposeTasks = fn(disposeTasks);
  notify();
  scheduleSave();
}

export function midNewId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}
