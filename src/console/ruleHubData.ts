// 管理中心 · 规则合集数据层（需求：规则集合成一个页面）—— 样例数据落本地 ruleHub.json（橘 Sam）
// 五类规则：核验规则集 / 反欺诈规则 / 黑名单 / 团伙库 / 评分场景规则（智融分三场景）
// 持久化复用 /api/load-mid /api/save-mid 端点；首启动 SEED 自动落盘。

export interface RuleBase {
  id: string;
  name: string;
  status: '草稿' | '已生效' | '已下线' | '启用' | '停用';
  desc?: string;
  updatedAt: string;
  owner: string;
}
export interface VerifyRuleSet extends RuleBase {
  version: string; scope: string[]; ruleCount: number; items: { name: string; cond: string; action: string }[];
}
export interface FraudRule extends RuleBase {
  weight: number; hitCond: string; suggest: string; riskLevel: '高' | '中' | '低';
}
export interface BlackItem extends RuleBase {
  type: '手机号' | '设备指纹' | '身份证号' | '银行卡'; value: string; reason: string;
}
export interface GangItem extends RuleBase {
  members: number; feature: string; devices: number;
}
export interface SceneRule extends RuleBase {
  scene: '违约风险' | '授信转化' | '借贷兴趣'; cond: string; action: string;
}

export interface RuleHub {
  verifySets: VerifyRuleSet[];
  fraudRules: FraudRule[];
  blacklist: BlackItem[];
  gangs: GangItem[];
  sceneRules: SceneRule[];
}

export const SEED_RULE_HUB: RuleHub = {
  verifySets: [
    { id: 'RS-20260701-001', name: '信用贷-信息核验规则配置', version: 'V2.6', status: '已生效', scope: ['信用贷'], ruleCount: 23, owner: '风控主管-王芳', updatedAt: '2026-07-21 14:30', items: [
      { name: '实名一致性', cond: '姓名/证件号与公安库一致', action: '通过→继续' },
      { name: '身份证有效性', cond: '证件号格式+校验位合法', action: '异常→拒绝' },
      { name: '手机号实名', cond: '手机号实名≥3个月', action: '不符→转人工' },
    ] },
    { id: 'RS-20260701-002', name: '经营贷-信息核验规则配置', version: 'V1.8', status: '草稿', scope: ['经营贷'], ruleCount: 18, owner: '风控审核-李强', updatedAt: '2026-07-22 09:10', items: [
      { name: '营业执照核验', cond: '工商库匹配且存续', action: '通过→继续' },
      { name: '法人一致性', cond: '法人姓名/证件一致', action: '不符→拒绝' },
    ] },
  ],
  fraudRules: [
    { id: 'FR-001', name: '多头借贷强度', status: '启用', weight: 28, hitCond: '近30天申贷平台≥7家', suggest: '拒绝/人工复核', riskLevel: '高', owner: '风控策略-张', updatedAt: '2026-07-18' },
    { id: 'FR-002', name: '设备环境风险', status: '启用', weight: 22, hitCond: '模拟器/虚拟机特征命中', suggest: '拒绝', riskLevel: '高', owner: '风控策略-张', updatedAt: '2026-07-18' },
    { id: 'FR-003', name: '同设备关联账号', status: '启用', weight: 18, hitCond: '同设备关联≥3个账号', suggest: '转人工', riskLevel: '中', owner: '风控策略-李', updatedAt: '2026-07-16' },
    { id: 'FR-004', name: 'IP 异常聚集', status: '停用', weight: 12, hitCond: '同IP 24h内申请≥10笔', suggest: '转人工', riskLevel: '中', owner: '风控策略-李', updatedAt: '2026-07-10' },
  ],
  blacklist: [
    { id: 'BL-001', type: '手机号', value: '138****0001', status: '启用', reason: '欺诈团伙成员', owner: '风控-王', updatedAt: '2026-07-15' },
    { id: 'BL-002', type: '设备指纹', value: 'D-9F3A...B2C1', status: '启用', reason: '模拟器批量注册', owner: '风控-王', updatedAt: '2026-07-15' },
    { id: 'BL-003', type: '身份证号', value: '3201**********5678', status: '启用', reason: '历史欺诈确认', owner: '风控-李', updatedAt: '2026-07-12' },
    { id: 'BL-004', type: '银行卡', value: '6222******4321', status: '停用', reason: '误判已申诉', owner: '风控-张', updatedAt: '2026-07-08' },
  ],
  gangs: [
    { id: 'G-001', name: '设备群控团伙A', status: '启用', members: 12, feature: '同批设备+同IP批量申请', devices: 8, owner: '风控-王', updatedAt: '2026-07-14' },
    { id: 'G-002', name: '资料伪造团伙B', status: '启用', members: 6, feature: '共用收入证明模板+相似通讯录', devices: 4, owner: '风控-王', updatedAt: '2026-07-11' },
  ],
  sceneRules: [
    { id: 'SR-001', scene: '违约风险', name: '违约高风险拦截', status: '启用', cond: '智信分≤580 或 智察分≥70', action: '自动拒绝', owner: '策略岗-赵', updatedAt: '2026-07-20' },
    { id: 'SR-002', scene: '授信转化', name: '提额候选', status: '启用', cond: '智信分≥720 且行为分稳定', action: '授信提升20%', owner: '策略岗-赵', updatedAt: '2026-07-20' },
    { id: 'SR-003', scene: '借贷兴趣', name: '高兴趣客群', status: '启用', cond: '借贷兴趣评分≥680', action: '优先营销触达', owner: '策略岗-钱', updatedAt: '2026-07-19' },
    { id: 'SR-004', scene: '违约风险', name: '审慎放款', status: '停用', cond: '智信分581-650 且负债比>60%', action: '人工复核', owner: '策略岗-赵', updatedAt: '2026-07-18' },
  ],
};

/* ---- 轻量 store（与 midStore/collectionData/scoringData 同构） ---- */
import { useSyncExternalStore } from 'react';

const FILE = 'ruleHub.json';
let data: RuleHub = JSON.parse(JSON.stringify(SEED_RULE_HUB));
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
  if (saved && typeof saved === 'object' && (saved as RuleHub).verifySets) {
    data = saved as RuleHub;
  } else {
    saveOne(FILE, data);
  }
  emit();
}
void bootstrap();

function useSnap<T>(sel: () => T): T { useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => version); return sel(); }

export function useRuleHub(): RuleHub { return useSnap(() => data); }
export function updateRuleHub(fn: (d: RuleHub) => RuleHub) {
  data = fn(data);
  emit();
  saveOne(FILE, data);
}
