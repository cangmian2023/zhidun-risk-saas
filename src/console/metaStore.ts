// 元数据管理 · 本地 JSON 持久化 Store（沿用 midStore 的「分文件 + useSyncExternalStore」模式）
// 规则②：样例数据落 src/console/meta*.json，通过 /api/load-mid?file= 与 /api/save-mid?file= 读写
// 首次启动若磁盘无文件，自动用 SEED 落盘。
import { useSyncExternalStore } from 'react';
import {
  SEED_META_EVENTS, SEED_EVENT_PROPS, SEED_USER_PROPS, SEED_DIM_TABLES,
  SEED_ITEM_PROPS, SEED_VIRTUAL_PROPS, SEED_VIRTUAL_EVENTS, SEED_AUTO_TRACK_EVENTS,
} from './metaData';
import type {
  MetaEvent, MetaProp, MetaDimTable, MetaItemProp,
  MetaVirtualProp, MetaVirtualEvent, MetaAutoTrackEvent,
} from './metaData';

/* ---------- 文件名映射（需同步登记到 vite.config.js 的 ALLOWED_FILES） ---------- */
const FILES = {
  events: 'metaEvents.json',
  eventProps: 'metaEventProps.json',
  userProps: 'metaUserProps.json',
  dimTables: 'metaDimTables.json',
  itemProps: 'metaItemProps.json',
  virtualProps: 'metaVirtualProps.json',
  virtualEvents: 'metaVirtualEvents.json',
  autoTrackEvents: 'metaAutoTrackEvents.json',
} as const;
type FileKey = keyof typeof FILES;

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
let events: MetaEvent[] = [...SEED_META_EVENTS];
let eventProps: MetaProp[] = [...SEED_EVENT_PROPS];
let userProps: MetaProp[] = [...SEED_USER_PROPS];
let dimTables: MetaDimTable[] = [...SEED_DIM_TABLES];
let itemProps: MetaItemProp[] = [...SEED_ITEM_PROPS];
let virtualProps: MetaVirtualProp[] = [...SEED_VIRTUAL_PROPS];
let virtualEvents: MetaVirtualEvent[] = [...SEED_VIRTUAL_EVENTS];
let autoTrackEvents: MetaAutoTrackEvent[] = [...SEED_AUTO_TRACK_EVENTS];

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
const timers: Partial<Record<FileKey, ReturnType<typeof setTimeout>>> = {};
function scheduleSave(key: FileKey, data: unknown) {
  const t = timers[key];
  if (t) clearTimeout(t);
  setSaveStatus('saving');
  timers[key] = setTimeout(() => saveOne(FILES[key], data), 350);
}

/* ---------- 启动：有盘用盘，无盘落 SEED ---------- */
async function bootstrap() {
  const [ev, ep, up, dt, ip, vp, ve, at] = await Promise.all([
    loadOne(FILES.events), loadOne(FILES.eventProps), loadOne(FILES.userProps), loadOne(FILES.dimTables),
    loadOne(FILES.itemProps), loadOne(FILES.virtualProps), loadOne(FILES.virtualEvents), loadOne(FILES.autoTrackEvents),
  ]);
  if (Array.isArray(ev) && ev.length) events = ev as MetaEvent[];
  else saveOne(FILES.events, events);
  if (Array.isArray(ep) && ep.length) eventProps = ep as MetaProp[];
  else saveOne(FILES.eventProps, eventProps);
  if (Array.isArray(up) && up.length) userProps = up as MetaProp[];
  else saveOne(FILES.userProps, userProps);
  if (Array.isArray(dt) && dt.length) dimTables = dt as MetaDimTable[];
  else saveOne(FILES.dimTables, dimTables);
  if (Array.isArray(ip) && ip.length) itemProps = ip as MetaItemProp[];
  else saveOne(FILES.itemProps, itemProps);
  if (Array.isArray(vp) && vp.length) virtualProps = vp as MetaVirtualProp[];
  else saveOne(FILES.virtualProps, virtualProps);
  if (Array.isArray(ve) && ve.length) virtualEvents = ve as MetaVirtualEvent[];
  else saveOne(FILES.virtualEvents, virtualEvents);
  if (Array.isArray(at) && at.length) autoTrackEvents = at as MetaAutoTrackEvent[];
  else saveOne(FILES.autoTrackEvents, autoTrackEvents);
  notify();
}
void bootstrap();

/* ---------- 读取 hooks ---------- */
export function useMetaSaveStatus(): SaveStatus {
  return useSnap(() => saveStatus);
}
export function useMetaEvents(): MetaEvent[] {
  return useSnap(() => events);
}
export function useMetaEventProps(): MetaProp[] {
  return useSnap(() => eventProps);
}
export function useMetaUserProps(): MetaProp[] {
  return useSnap(() => userProps);
}
export function useMetaDimTables(): MetaDimTable[] {
  return useSnap(() => dimTables);
}
export function useMetaItemProps(): MetaItemProp[] {
  return useSnap(() => itemProps);
}
export function useMetaVirtualProps(): MetaVirtualProp[] {
  return useSnap(() => virtualProps);
}
export function useMetaVirtualEvents(): MetaVirtualEvent[] {
  return useSnap(() => virtualEvents);
}
export function useMetaAutoTrackEvents(): MetaAutoTrackEvent[] {
  return useSnap(() => autoTrackEvents);
}

/* ---------- 更新入口 ---------- */
export function updateMetaEvents(fn: (l: MetaEvent[]) => MetaEvent[]) {
  events = fn(events);
  notify();
  scheduleSave('events', events);
}
export function updateMetaEventProps(fn: (l: MetaProp[]) => MetaProp[]) {
  eventProps = fn(eventProps);
  notify();
  scheduleSave('eventProps', eventProps);
}
export function updateMetaUserProps(fn: (l: MetaProp[]) => MetaProp[]) {
  userProps = fn(userProps);
  notify();
  scheduleSave('userProps', userProps);
}
export function updateMetaDimTables(fn: (l: MetaDimTable[]) => MetaDimTable[]) {
  dimTables = fn(dimTables);
  notify();
  scheduleSave('dimTables', dimTables);
}
export function updateMetaItemProps(fn: (l: MetaItemProp[]) => MetaItemProp[]) {
  itemProps = fn(itemProps);
  notify();
  scheduleSave('itemProps', itemProps);
}
export function updateMetaVirtualProps(fn: (l: MetaVirtualProp[]) => MetaVirtualProp[]) {
  virtualProps = fn(virtualProps);
  notify();
  scheduleSave('virtualProps', virtualProps);
}
export function updateMetaVirtualEvents(fn: (l: MetaVirtualEvent[]) => MetaVirtualEvent[]) {
  virtualEvents = fn(virtualEvents);
  notify();
  scheduleSave('virtualEvents', virtualEvents);
}
export function updateMetaAutoTrackEvents(fn: (l: MetaAutoTrackEvent[]) => MetaAutoTrackEvent[]) {
  autoTrackEvents = fn(autoTrackEvents);
  notify();
  scheduleSave('autoTrackEvents', autoTrackEvents);
}

/* ---------- 工具 ---------- */
export function metaNewId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4).toString(36)}`;
}
