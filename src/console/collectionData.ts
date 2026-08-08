// 催收子系统数据层 —— 样例数据存本地 collectionData.json（橘 Sam，用户运行时创建）
// 持久化复用 /api/load-mid /api/save-mid 端点（与贷中监控一致）；首启动 SEED 自动落盘。
// 业务域：M0 未逾期（预警）→ M1 逾期1-30天 → M2 31-90天 → M3+ 90天以上，分阶段催收策略。

export type CollectStage = 'M0' | 'M1' | 'M2' | 'M3+';

export interface CollectCase {
  id: string;               // 案件号
  custId: string;           // 客户号
  custName: string;         // 客户姓名
  product: string;          // 产品
  stage: CollectStage;      // 催收阶段（M0/M1/M2/M3+）
  overdueAmt: number;       // 逾期金额（元）
  overdueDays: number;      // 逾期天数
  dueDate: string;          // 应还日
  owner: string;            // 催收员
  status: string;           // 待分案 / 催收中 / 承诺还款 / 已结清 / 委外 / 核销
  lastTouch: string;        // 最近触达时间
  promiseDate?: string;     // 承诺还款日
  calls: number;            // 拨打次数
  sms: number;              // 短信次数
  notes: { time: string; who: string; what: string }[]; // 催收记录
}

export interface CollectTask {
  id: string;
  stage: CollectStage;
  name: string;             // 策略名（M0 提醒 / M1 短信+外呼 / M2 外呼+函件 / M3+ 委外+法诉）
  autoAction: string;       // 自动动作
  rules: string[];          // 触发规则
  owner: string;
  enabled: boolean;
}

export interface CollectionData {
  cases: CollectCase[];
  tasks: CollectTask[];
}

const n = (id: string, days: number) => {
  const d = new Date('2026-08-07');
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

export const SEED_COLLECTION: CollectionData = {
  cases: [
    { id: 'CO-202608-001', custId: 'C0004', custName: '赵*强', product: '经营贷', stage: 'M3+', overdueAmt: 156000, overdueDays: 126, dueDate: '2026-04-03', owner: '王雷', status: '委外', lastTouch: n('x', 1), calls: 12, sms: 30, notes: [{ time: n('x', 3), who: '王雷', what: '外呼接通，客户表示资金紧张，申请减免部分利息' }] },
    { id: 'CO-202608-002', custId: 'C0001', custName: '张*明', product: '信用贷', stage: 'M2', overdueAmt: 42000, overdueDays: 58, dueDate: '2026-06-10', owner: '李娜', status: '催收中', lastTouch: n('x', 1), promiseDate: '2026-08-10', calls: 8, sms: 15, notes: [{ time: n('x', 2), who: '李娜', what: '客户承诺 8 月 10 日前还款 2 万，已记录承诺' }] },
    { id: 'CO-202608-003', custId: 'C0006', custName: '刘*梅', product: '消费贷', stage: 'M1', overdueAmt: 6800, overdueDays: 12, dueDate: '2026-07-26', owner: '周敏', status: '承诺还款', lastTouch: n('x', 1), promiseDate: '2026-08-09', calls: 4, sms: 6, notes: [{ time: n('x', 1), who: '周敏', what: '客户表示月底发工资后还款' }] },
    { id: 'CO-202608-004', custId: 'C0007', custName: '孙*磊', product: '信用贷', stage: 'M1', overdueAmt: 3500, overdueDays: 8, dueDate: '2026-07-30', owner: '郑浩', status: '催收中', lastTouch: n('x', 1), calls: 2, sms: 4, notes: [] },
    { id: 'CO-202608-005', custId: 'C0008', custName: '吴*静', product: '消费贷', stage: 'M0', overdueAmt: 0, overdueDays: 0, dueDate: '2026-08-08', owner: '系统', status: '待分案', lastTouch: n('x', 0), calls: 0, sms: 1, notes: [] },
    { id: 'CO-202608-006', custId: 'C0009', custName: '钱*华', product: '经营贷', stage: 'M3+', overdueAmt: 89000, overdueDays: 145, dueDate: '2026-03-15', owner: '王雷', status: '核销', lastTouch: n('x', 10), calls: 20, sms: 45, notes: [{ time: n('x', 12), who: '王雷', what: '多次联系无果，已提交核销申请' }] },
    { id: 'CO-202608-007', custId: 'C0010', custName: '冯*军', product: '信用贷', stage: 'M2', overdueAmt: 15000, overdueDays: 45, dueDate: '2026-06-23', owner: '李娜', status: '催收中', lastTouch: n('x', 2), calls: 6, sms: 10, notes: [] },
    { id: 'CO-202608-008', custId: 'C0003', custName: '王*芳', product: '信用贷', stage: 'M0', overdueAmt: 0, overdueDays: 0, dueDate: '2026-08-10', owner: '系统', status: '待分案', lastTouch: n('x', 0), calls: 0, sms: 1, notes: [] },
  ],
  tasks: [
    { id: 'ct-m0', stage: 'M0', name: 'M0 还款提醒', autoAction: '还款日前 3 天自动发送短信提醒', rules: ['应还日前 3 天', '余额不足时触发'], owner: '系统', enabled: true },
    { id: 'ct-m1', stage: 'M1', name: 'M1 短信+外呼催收', autoAction: '逾期即发短信，第 3 天起人工外呼', rules: ['逾期 1-30 天', '金额 < 2 万'], owner: '催收一组', enabled: true },
    { id: 'ct-m2', stage: 'M2', name: 'M2 外呼+函件催收', autoAction: '每日外呼 + 发送催收函，承诺还款跟踪', rules: ['逾期 31-90 天', '外呼频次 ≥ 2 次/日'], owner: '催收二组', enabled: true },
    { id: 'ct-m3', stage: 'M3+', name: 'M3+ 委外+法诉', autoAction: '委外机构跟进，符合条件转法务诉讼', rules: ['逾期 > 90 天', '金额 ≥ 5 万'], owner: '委外管理岗', enabled: true },
  ],
};

/* ---- 轻量 store（与 midStore 同构：useSyncExternalStore + 落盘） ---- */
import { useSyncExternalStore } from 'react';

const FILES = { collection: 'collectionData.json' };
let data: CollectionData = JSON.parse(JSON.stringify(SEED_COLLECTION));
let version = 0;
let saveStatus: 'ok' | 'error' | null = null;
const listeners = new Set<() => void>();
const statusListeners = new Set<() => void>();

function emit() { version++; listeners.forEach((fn) => fn()); }
function emitStatus() { statusListeners.forEach((fn) => fn()); }

async function loadOne(file: string): Promise<unknown> {
  try {
    const r = await fetch(`/api/load-mid?file=${encodeURIComponent(file)}`);
    if (r.ok) return await r.json();
    return null;
  } catch { return null; }
}
function saveOne(file: string, body: unknown) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => { saveStatus = r.ok ? 'ok' : 'error'; emitStatus(); })
    .catch(() => { saveStatus = 'error'; emitStatus(); });
}

async function bootstrap() {
  const saved = await loadOne(FILES.collection);
  if (saved && typeof saved === 'object' && Array.isArray((saved as CollectionData).cases)) {
    data = saved as CollectionData;
  } else {
    saveOne(FILES.collection, data);
  }
  emit();
}
void bootstrap();

function useSnap<T>(sel: () => T): T { useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => version); return sel(); }

export function useCollection(): CollectionData { return useSnap(() => data); }
export function useCollectionSaveStatus(): 'ok' | 'error' | null {
  useSyncExternalStore((l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; }, () => saveStatus);
  return saveStatus;
}
export function updateCollection(fn: (d: CollectionData) => CollectionData) {
  data = fn(data);
  emit();
  saveOne(FILES.collection, data);
}
export function collectionNewId(p: string) { return `${p}-${Date.now().toString(36)}`; }

export const STAGE_META: Record<CollectStage, { label: string; badge: 'green' | 'amber' | 'orange' | 'red'; fill: string }> = {
  M0: { label: 'M0 未逾期', badge: 'green', fill: '#16A34A' },
  M1: { label: 'M1 逾期1-30天', badge: 'amber', fill: '#D97706' },
  M2: { label: 'M2 逾期31-90天', badge: 'orange', fill: '#EA580C' },
  'M3+': { label: 'M3+ 逾期90天+', badge: 'red', fill: '#DC2626' },
};
