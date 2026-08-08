// 评分产品子系统数据层 —— 样例数据落本地 scoringData.json（橘 Sam，用户运行时创建）
// 持久化复用 /api/load-mid /api/save-mid 端点；首启动 SEED 自动落盘。
// 三个产品：智察分(欺诈0-100) / 智信分(违约300-900) / 智融分(综合300-900)。

export type ScoreProd = 'zhicha' | 'zhixin' | 'zhirong';

export interface ScoreMeta {
  name: string; range: [number, number]; color: string; hint: string; unit: string;
  score: number; factors: { name: string; detail: string; contribution: number; level: '高' | '中' | '低' }[];
  suggestion: { v: string; kind: 'red' | 'green' | 'violet' | 'amber' };
}

export interface BatchTask { id: string; name: string; cnt: number; avg: number; high: number; status: string; }
export interface DistPoint { label: string; value: number; }
export interface EvalMetric { label: string; value: string; trend: string; ok: boolean; }
export interface TuneItem { id: string; title: string; desc: string; pri: string; }
export interface BillRow { id: string; date: string; type: string; cnt: number; amt: number; status: string; }
export interface SceneRule { id: string; name: string; cond: string; action: string; enabled: boolean; }

/* v2 新增：融合构成 / 场景评分 / 360 矩阵 / 客户分层 / 场景效果 / API / 监控 */
export interface FusionPart { name: string; source: string; contribution: number; desc: string; }
export interface SceneScore { scene: string; score: number; level: string; }
export interface MatrixCell { name: string; risk: '低' | '中' | '高'; value: '低' | '中' | '高'; desc: string; }
export interface TierItem { name: string; count: number; pct: number; action: string; }
export interface SceneEffect { scene: string; conv: number; hit: number; usage: number; trend: string; }
export interface ApiEp { id: string; ep: string; method: string; qps: number; sla: string; status: string; }
export interface MonitorRow { id: string; model: string; freq: string; last: string; status: string; }

export interface ScoringData {
  meta: Record<ScoreProd, ScoreMeta>;
  batch: Record<ScoreProd, BatchTask[]>;
  dist: Record<ScoreProd, { title: string; labels: string[]; data: number[] }>;
  eval: Record<ScoreProd, EvalMetric[]>;
  tune: Record<ScoreProd, TuneItem[]>;
  billQuery: Record<ScoreProd, BillRow[]>;
  billHit: Record<ScoreProd, BillRow[]>;
  bill: Record<ScoreProd, { balance: number; recharge: number[]; rows: BillRow[] }>;
  scenes: Record<string, SceneRule[]>;
  fusion: Record<ScoreProd, FusionPart[]>;       // 融合构成（智融分显式展示）
  sceneScores: Record<ScoreProd, SceneScore[]>;  // 三场景评分对比
  matrix: MatrixCell[];                           // 360 风险×价值四象限
  tiers: TierItem[];                              // 客户分层
  sceneEffects: SceneEffect[];                    // 场景效果监控
  apis: ApiEp[];                                  // API 对接
  monitors: MonitorRow[];                         // 监控告警中心
}

export const SEED_SCORING: ScoringData = {
  meta: {
    zhicha: {
      name: '智察分', range: [0, 100], color: '#ef4444', hint: '越高欺诈风险越高', unit: '欺诈分', score: 78,
      factors: [
        { name: '近30天申贷平台数', detail: '7 家（行业 P95=5）', contribution: 28, level: '高' },
        { name: '设备环境风险', detail: '模拟器特征命中', contribution: 22, level: '高' },
        { name: '命中黑灰名单', detail: '命中外部灰名单', contribution: 20, level: '高' },
        { name: '同设备关联账号', detail: '3 个关联账号', contribution: 18, level: '中' },
        { name: '负债收入比', detail: '82%（阈值 70%）', contribution: 12, level: '中' },
      ],
      suggestion: { v: '建议拒绝 / 转人工复核', kind: 'red' },
    },
    zhixin: {
      name: '智信分', range: [300, 900], color: '#22c55e', hint: '越高违约概率越低', unit: '信用分', score: 712,
      factors: [
        { name: '历史逾期记录', detail: '近2年 M3+ 1 次', contribution: 26, level: '中' },
        { name: '负债收入比', detail: '58%（阈值 70%）', contribution: 22, level: '中' },
        { name: '征信查询频次', detail: '近6月 8 次', contribution: 18, level: '高' },
        { name: '收入稳定性', detail: '连续 14 月稳定', contribution: 20, level: '低' },
        { name: '授信使用率', detail: '43%', contribution: 14, level: '低' },
      ],
      suggestion: { v: '建议准入（标准额度）', kind: 'green' },
    },
    zhirong: {
      name: '智融分', range: [300, 900], color: '#8b5cf6', hint: '综合评分，全面刻画风险与价值', unit: '综合分', score: 655,
      factors: [
        { name: '违约维度（智信分）', detail: '信用分 712', contribution: 34, level: '低' },
        { name: '借贷兴趣（活跃度）', detail: '近30天活跃 18 天', contribution: 24, level: '中' },
        { name: '转化意愿', detail: '活动响应 2 次', contribution: 18, level: '中' },
        { name: '资产状况', detail: '房产+理财持仓', contribution: 24, level: '低' },
      ],
      suggestion: { v: '建议准入并提额（高价值）', kind: 'violet' },
    },
  },
  batch: {
    zhicha: [
      { id: 'B-2607-01', name: '20260717_申贷批量.csv', cnt: 125000, avg: 21, high: 10125, status: '完成' },
      { id: 'B-2607-02', name: '20260718_早批.csv', cnt: 64200, avg: 20, high: 5203, status: '完成' },
      { id: 'B-2607-03', name: '渠道A_导流.csv', cnt: 30000, avg: 35, high: 6120, status: '计算中' },
    ],
    zhixin: [
      { id: 'B-2607-11', name: '20260717_信用卡.csv', cnt: 98000, avg: 701, high: 12150, status: '完成' },
      { id: 'B-2607-12', name: '20260718_消费贷.csv', cnt: 54000, avg: 688, high: 6700, status: '完成' },
    ],
    zhirong: [
      { id: 'B-2607-21', name: '20260718_综合评测.csv', cnt: 42000, avg: 655, high: 4200, status: '完成' },
      { id: 'B-2607-22', name: '授信转化样本.csv', cnt: 18000, avg: 672, high: 990, status: '计算中' },
    ],
  },
  dist: {
    zhicha: { title: '智察分评分分布', labels: ['0-20', '21-40', '41-60', '61-80', '81-100'], data: [12, 28, 35, 18, 7] },
    zhixin: { title: '智信分评分分布', labels: ['300-420', '421-540', '541-660', '661-780', '781-900'], data: [5, 14, 30, 34, 17] },
    zhirong: { title: '智融分评分分布', labels: ['300-420', '421-540', '541-660', '661-780', '781-900'], data: [8, 18, 32, 29, 13] },
  },
  eval: {
    zhicha: [
      { label: 'KS', value: '0.42', trend: '↑0.03', ok: true },
      { label: 'AUC', value: '0.86', trend: '↑0.01', ok: true },
      { label: 'Lift@10%', value: '3.2', trend: '持平', ok: true },
      { label: 'PSI', value: '0.11', trend: '稳定', ok: true },
    ],
    zhixin: [
      { label: 'KS', value: '0.38', trend: '↑0.02', ok: true },
      { label: 'AUC', value: '0.83', trend: '持平', ok: true },
      { label: 'Lift@10%', value: '2.9', trend: '持平', ok: true },
      { label: 'PSI', value: '0.24', trend: '临界', ok: false },
    ],
    zhirong: [
      { label: 'KS', value: '0.35', trend: '↑0.04', ok: true },
      { label: 'AUC', value: '0.81', trend: '↑0.02', ok: true },
      { label: 'Lift@10%', value: '2.7', trend: '持平', ok: true },
      { label: 'PSI', value: '0.31', trend: '偏移', ok: false },
    ],
  },
  tune: {
    zhicha: [
      { id: 'T-1', title: '设备环境分切点回退', desc: '近 7 日设备风险特征 PSI 0.31，建议将切点 0.8 回退至 0.75 以降低误杀', pri: '高' },
      { id: 'T-2', title: '新增特征：多头借贷强度', desc: '多头借贷平台数 × 申请频次的交叉特征贡献度提升明显，建议入模', pri: '中' },
    ],
    zhixin: [
      { id: 'T-1', title: '负债收入比权重上调', desc: '近期负债特征区分度上升，建议权重 22→26', pri: '中' },
      { id: 'T-2', title: '拒绝阈值观察', desc: '580 阈值下拒绝率上升 0.8pp，建议观察一周再定', pri: '低' },
    ],
    zhirong: [
      { id: 'T-1', title: '借贷兴趣场景权重校准', desc: '转化场景样本偏移，建议重新校准兴趣权重', pri: '高' },
    ],
  },
  billQuery: {
    zhicha: [
      { id: 'Q-0701', date: '2026-07-18', type: '按次计费', cnt: 1642, amt: 16420, status: '已出账' },
      { id: 'Q-0702', date: '2026-07-17', type: '按次计费', cnt: 1520, amt: 15200, status: '已出账' },
    ],
    zhixin: [
      { id: 'Q-0711', date: '2026-07-18', type: '按次计费', cnt: 1480, amt: 14800, status: '已出账' },
    ],
    zhirong: [
      { id: 'Q-0721', date: '2026-07-18', type: '按次计费', cnt: 720, amt: 10800, status: '已出账' },
    ],
  },
  billHit: {
    zhicha: [
      { id: 'H-0701', date: '2026-07-18', type: '查得计费', cnt: 1321, amt: 13210, status: '已出账' },
    ],
    zhixin: [
      { id: 'H-0711', date: '2026-07-18', type: '查得计费', cnt: 1205, amt: 12050, status: '已出账' },
    ],
    zhirong: [
      { id: 'H-0721', date: '2026-07-18', type: '查得计费', cnt: 610, amt: 9150, status: '已出账' },
    ],
  },
  bill: {
    zhicha: { balance: 56200, recharge: [20000, 50000, 100000], rows: [
      { id: 'B-0701', date: '2026-07-01', type: '充值', cnt: 0, amt: 50000, status: '成功' },
      { id: 'B-0702', date: '2026-07-31', type: '消费', cnt: 1642, amt: 16420, status: '已出账' },
    ] },
    zhixin: { balance: 12800, recharge: [30000], rows: [
      { id: 'B-0711', date: '2026-07-05', type: '充值', cnt: 0, amt: 30000, status: '成功' },
    ] },
    zhirong: { balance: 8900, recharge: [10000, 20000], rows: [
      { id: 'B-0721', date: '2026-07-10', type: '充值', cnt: 0, amt: 20000, status: '成功' },
    ] },
  },
  scenes: {
    default: [
      { id: 's1', name: '违约高风险拦截', cond: '智信分 ≤ 580 或智察分 ≥ 70', action: '自动拒绝', enabled: true },
      { id: 's2', name: '审慎放款', cond: '智信分 581-650 且负债比 > 60%', action: '人工复核', enabled: true },
    ],
    credit: [
      { id: 'c1', name: '提额候选', cond: '智信分 ≥ 720 且行为分稳定', action: '授信提升 20%', enabled: true },
      { id: 'c2', name: '降额预警', cond: '智融分 ≤ 600 且近期查询激增', action: '降额 30%', enabled: false },
    ],
    interest: [
      { id: 'i1', name: '高兴趣客群', cond: '借贷兴趣评分 ≥ 680', action: '优先营销触达', enabled: true },
      { id: 'i2', name: '沉睡唤醒', cond: '近90天无借款但活跃', action: '推送提额权益', enabled: false },
    ],
  },
  /* v2：融合构成（智融分融合性核心：引用智信违约 + 引用智察欺诈 + 自有价值） */
  fusion: {
    zhicha: [],
    zhixin: [],
    zhirong: [
      { name: '违约维度', source: '引用 · 智信分', contribution: 34, desc: '信用分 712，违约概率 4.3%，等级 A' },
      { name: '欺诈维度', source: '引用 · 智察分', contribution: 28, desc: '欺诈分 78，命中「多头借贷强度」等 3 条规则' },
      { name: '价值维度', source: '自有 · 借贷兴趣', contribution: 24, desc: '近30天活跃 18 天，转化意愿 2 次响应' },
      { name: '资产维度', source: '自有 · 资产画像', contribution: 14, desc: '房产 + 理财持仓，收入稳定 14 个月' },
    ],
  },
  /* v2：三场景评分对比（同一智融分模型 × 不同场景规则） */
  sceneScores: {
    zhicha: [],
    zhixin: [],
    zhirong: [
      { scene: '违约风险审核', score: 655, level: '审慎放款' },
      { scene: '授信申请转化', score: 688, level: '提额候选' },
      { scene: '借贷兴趣', score: 702, level: '高兴趣客群' },
    ],
  },
  /* v2：360 风险×价值四象限 */
  matrix: [
    { name: '高价值 · 低风险', risk: '低', value: '高', desc: '优质客户：全额准入 + 提额，优先经营' },
    { name: '高价值 · 高风险', risk: '高', value: '高', desc: '高风险高收益：审慎放款 + 强监控' },
    { name: '低价值 · 低风险', risk: '低', value: '低', desc: '保守客户：标准额度，常规触达' },
    { name: '低价值 · 高风险', risk: '高', value: '低', desc: '风险客户：拒绝或仅营销低风险产品' },
  ],
  /* v2：客户分层 */
  tiers: [
    { name: '高价值客户', count: 12840, pct: 12.4, action: '提额 + 优先经营' },
    { name: '活跃客户', count: 35200, pct: 34.0, action: '常规触达' },
    { name: '沉睡客户', count: 42100, pct: 40.7, action: '唤醒营销' },
    { name: '高风险客户', count: 13360, pct: 12.9, action: '审慎放款 / 拒绝' },
  ],
  /* v2：场景效果监控 */
  sceneEffects: [
    { scene: '违约风险审核', conv: 62.4, hit: 8.1, usage: 45, trend: '↑1.2pp' },
    { scene: '授信申请转化', conv: 31.5, hit: 12.4, usage: 32, trend: '↑0.8pp' },
    { scene: '借贷兴趣', conv: 22.8, hit: 18.6, usage: 23, trend: '↓0.5pp' },
  ],
  /* v2：API 对接（一次对接三产品） */
  apis: [
    { id: 'a1', ep: 'POST /v3/score', method: 'POST', qps: 2944, sla: '99.98%', status: '正常' },
    { id: 'a2', ep: 'POST /v3/score/batch', method: 'POST', qps: 96, sla: '99.95%', status: '正常' },
    { id: 'a3', ep: 'POST /v3/score/profile', method: 'POST', qps: 180, sla: '99.97%', status: '正常' },
  ],
  /* v2：监控告警中心（三产品统一） */
  monitors: [
    { id: 'M-智察分-准实时', model: '智察分', freq: '准实时', last: '2026-08-08 10:30', status: '正常' },
    { id: 'M-智信分-日报', model: '智信分', freq: '日报', last: '2026-08-08 02:00', status: '正常' },
    { id: 'M-智融分-周报', model: '智融分', freq: '周报', last: '2026-08-07 03:00', status: 'PSI偏移' },
  ],
};

/* ---- 轻量 store（与 midStore/collectionData 同构） ---- */
import { useSyncExternalStore } from 'react';

const FILE = 'scoringData.json';
let data: ScoringData = JSON.parse(JSON.stringify(SEED_SCORING));
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
  const saved = await loadOne(FILE);
  if (saved && typeof saved === 'object' && (saved as ScoringData).meta) {
    data = saved as ScoringData;
  } else {
    saveOne(FILE, data);
  }
  emit();
}
void bootstrap();

function useSnap<T>(sel: () => T): T { useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => version); return sel(); }

export function useScoring(): ScoringData { return useSnap(() => data); }
export function useScoringSaveStatus(): 'ok' | 'error' | null {
  useSyncExternalStore((l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; }, () => saveStatus);
  return saveStatus;
}
export function updateScoring(fn: (d: ScoringData) => ScoringData) {
  data = fn(data);
  emit();
  saveOne(FILE, data);
}

export const SCORE_PROD_LABEL: Record<ScoreProd, string> = { zhicha: '智察分', zhixin: '智信分', zhirong: '智融分' };
export const SCENE_LABEL: Record<string, string> = { default: '违约风险', credit: '授信转化', interest: '借贷兴趣' };
