// 六大能力缺口 · 补齐数据层（需求17 第三节：非模型 / 非策略，现有页面可直接落地）
// 覆盖四块业务数据：
//   ① 跨行业联防联控（多头共债 / 跨机构名单网络）
//   ② 设备维度（设备档案 / 设备风险规则命中明细）
//   ③ 周期性监测引擎（扫描任务运行态）
//   ④ 分群运营深化（运营名单跟踪）
// 数据定位：使用域样例数据（橘 Sam）——存本地 midGap.json，复用 /api/load-mid /api/save-mid 端点，
//          首次启动 SEED 自动落盘；未命中样例的客户由 deriveXxx 按 custId 确定性派生（实时计算 灰 Cal）。
import { useSyncExternalStore } from 'react';

/* ============================ 类型 ============================ */

export type GapLevel = '高' | '中' | '低';

/** 共债机构（多头借贷中的单家机构） */
export interface CoDebtOrg {
  org: string;            // 机构名称
  orgType: string;        // 机构类型：银行 / 消金 / 小贷 / 网贷 / 担保
  balance: number;        // 在贷余额（元）
  applyCnt30d: number;    // 近 30 天申请次数
  status: string;         // 正常 / 关注 / 逾期
  sameDevice: boolean;    // 是否与本客户同设备申请
  listHit?: string;       // 命中的名单类型（黑名单 / 灰名单 / 关注名单 / 空）
}

/** 客户多头共债画像 */
export interface CoDebtProfile {
  custId: string;
  custName: string;
  orgCnt30d: number;      // 近 30 天申请机构数
  applyCnt30d: number;    // 近 30 天申请总次数
  totalBalance: number;   // 多头在贷总余额
  sameDeviceApply: number;// 同设备申请次数
  level: GapLevel;        // 共债风险等级
  chain: string[];        // 共债链条：本人 → 机构 → 关联人
  orgs: CoDebtOrg[];      // 共债机构清单
}

/** 跨机构 × 名单类型 命中矩阵单元 */
export interface CrossOrgCell {
  org: string;            // 机构
  listType: string;       // 名单类型
  hit: number;            // 命中数
  scan: number;           // 送检数
}

/** 设备档案（设备与欺诈维度） */
export interface DeviceProfile {
  custId: string;
  deviceId: string;       // 设备号（IMEI / IDFA）
  model: string;          // 机型
  os: string;             // 系统
  envScore: number;       // 环境风险分（0-100，越高越危险）
  fingerprintMatch: number; // 指纹一致性（%）
  emulator: boolean;      // 是否模拟器
  rooted: boolean;        // 是否越狱 / root
  groupControl: boolean;  // 是否命中群控
  ipCity: string;         // IP 归属地
  gpsCity: string;        // GPS 定位城市
  risk: GapLevel;
  accounts: { custId: string; name: string; lastUse: string; status: string }[]; // 同设备多账号
}

/** 设备风险规则命中明细 */
export interface DeviceHit {
  id: string;
  ruleName: string;       // 命中规则（对应规则合集「设备风险」规则组）
  deviceId: string;
  custName: string;
  feature: string;        // 触发特征
  hitAt: string;
  level: GapLevel;
}

/** 周期监测扫描任务运行态 */
export interface EngineTask {
  id: string;
  name: string;
  cron: string;           // 周期（每日 02:00 / 每周一 / 每月 1 日）
  scope: string;          // 扫描范围
  lastRun: string;        // 上次扫描
  nextRun: string;        // 下次扫描
  scanned: number;        // 扫描客户数
  hits: number;           // 命中数
  successRate: number;    // 成功率（%）
  costSec: number;        // 耗时（秒）
  status: '运行中' | '待运行' | '已暂停' | '异常';
  alertOnHit: boolean;    // 命中即告警（自动生成预警 + 处置工单）
}

/** 运营名单跟踪项 */
export type OpsEvalStatus = '候选' | '评估中' | '已提额' | '已促活' | '已放弃';
export interface OpsListItem {
  id: string;
  custId: string;
  custName: string;
  tier: string;           // 分层：核心优质 / 成长潜力 / 沉睡唤醒 / 风险观察
  action: string;         // 运营动作：提额 / 促活 / 二次营销 / 降额观察
  evalStatus: OpsEvalStatus;
  lastEval: string;       // 最近评估日
  nextEval: string;       // 下次评估日（按月/季自动复评）
  cycle: '月度' | '季度';
  amount: number;         // 提额 / 用信金额（元）
  converted: boolean;     // 是否已转化
  owner: string;
}

export interface GapData {
  coDebts: CoDebtProfile[];
  crossOrg: CrossOrgCell[];
  devices: DeviceProfile[];
  deviceHits: DeviceHit[];
  engineTasks: EngineTask[];
  opsList: OpsListItem[];
}

/* ============================ SEED ============================ */

const day = (offset: number) => {
  const d = new Date('2026-08-09');
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

export const SEED_GAP: GapData = {
  coDebts: [
    {
      custId: 'C0001', custName: '张*明', orgCnt30d: 6, applyCnt30d: 11, totalBalance: 386000, sameDeviceApply: 3, level: '高',
      chain: ['张*明', '同设备 IMEI-8601234', '李*华（共债人）', '××消费金融'],
      orgs: [
        { org: '××消费金融', orgType: '消金', balance: 128000, applyCnt30d: 3, status: '关注', sameDevice: true, listHit: '灰名单' },
        { org: '××网络小贷', orgType: '小贷', balance: 96000, applyCnt30d: 2, status: '正常', sameDevice: true },
        { org: '××城商行', orgType: '银行', balance: 82000, applyCnt30d: 1, status: '正常', sameDevice: false },
        { org: '××助贷平台', orgType: '网贷', balance: 45000, applyCnt30d: 3, status: '逾期', sameDevice: true, listHit: '黑名单' },
        { org: '××融资担保', orgType: '担保', balance: 25000, applyCnt30d: 1, status: '正常', sameDevice: false },
        { org: '××股份行信用卡', orgType: '银行', balance: 10000, applyCnt30d: 1, status: '正常', sameDevice: false },
      ],
    },
    {
      custId: 'C0002', custName: '李*华', orgCnt30d: 4, applyCnt30d: 6, totalBalance: 152000, sameDeviceApply: 2, level: '中',
      chain: ['李*华', '同设备 IMEI-8601234', '张*明（共债人）'],
      orgs: [
        { org: '××消费金融', orgType: '消金', balance: 62000, applyCnt30d: 2, status: '正常', sameDevice: true, listHit: '关注名单' },
        { org: '××网络小贷', orgType: '小贷', balance: 48000, applyCnt30d: 1, status: '正常', sameDevice: true },
        { org: '××城商行', orgType: '银行', balance: 30000, applyCnt30d: 2, status: '正常', sameDevice: false },
        { org: '××助贷平台', orgType: '网贷', balance: 12000, applyCnt30d: 1, status: '关注', sameDevice: false },
      ],
    },
    {
      custId: 'C0003', custName: '王*芳', orgCnt30d: 2, applyCnt30d: 2, totalBalance: 46000, sameDeviceApply: 0, level: '低',
      chain: ['王*芳', '××城商行'],
      orgs: [
        { org: '××城商行', orgType: '银行', balance: 36000, applyCnt30d: 1, status: '正常', sameDevice: false },
        { org: '××消费金融', orgType: '消金', balance: 10000, applyCnt30d: 1, status: '正常', sameDevice: false },
      ],
    },
    {
      custId: 'C0004', custName: '赵*强', orgCnt30d: 7, applyCnt30d: 14, totalBalance: 620000, sameDeviceApply: 5, level: '高',
      chain: ['赵*强', '××实业有限公司（关联企业）', '同设备 IMEI-8604567', '钱*华（老赖名单）'],
      orgs: [
        { org: '××股份行', orgType: '银行', balance: 260000, applyCnt30d: 2, status: '逾期', sameDevice: false, listHit: '黑名单' },
        { org: '××融资担保', orgType: '担保', balance: 150000, applyCnt30d: 3, status: '关注', sameDevice: true, listHit: '灰名单' },
        { org: '××网络小贷', orgType: '小贷', balance: 88000, applyCnt30d: 4, status: '关注', sameDevice: true },
        { org: '××助贷平台', orgType: '网贷', balance: 62000, applyCnt30d: 3, status: '逾期', sameDevice: true, listHit: '黑名单' },
        { org: '××消费金融', orgType: '消金', balance: 40000, applyCnt30d: 1, status: '正常', sameDevice: false },
        { org: '××典当行', orgType: '小贷', balance: 15000, applyCnt30d: 1, status: '正常', sameDevice: true },
        { org: '××汽车金融', orgType: '消金', balance: 5000, applyCnt30d: 0, status: '正常', sameDevice: false },
      ],
    },
    {
      custId: 'C0005', custName: '陈*敏', orgCnt30d: 3, applyCnt30d: 4, totalBalance: 98000, sameDeviceApply: 1, level: '中',
      chain: ['陈*敏', '××助贷平台', '同设备 IMEI-8607890'],
      orgs: [
        { org: '××助贷平台', orgType: '网贷', balance: 52000, applyCnt30d: 2, status: '关注', sameDevice: true, listHit: '关注名单' },
        { org: '××消费金融', orgType: '消金', balance: 32000, applyCnt30d: 1, status: '正常', sameDevice: false },
        { org: '××城商行', orgType: '银行', balance: 14000, applyCnt30d: 1, status: '正常', sameDevice: false },
      ],
    },
  ],
  crossOrg: (() => {
    const orgs = ['××消费金融', '××网络小贷', '××城商行', '××助贷平台', '××股份行', '××融资担保'];
    const lists = ['黑名单', '灰名单', '关注名单', '老赖名单', '欺诈团伙名单'];
    const base = [[38, 22, 45, 12, 8], [51, 30, 40, 18, 14], [12, 9, 26, 4, 2], [64, 41, 52, 26, 22], [18, 11, 30, 6, 3], [27, 16, 24, 9, 7]];
    const scans = [[820, 820, 820, 820, 820], [760, 760, 760, 760, 760], [1240, 1240, 1240, 1240, 1240], [690, 690, 690, 690, 690], [1030, 1030, 1030, 1030, 1030], [540, 540, 540, 540, 540]];
    const cells: CrossOrgCell[] = [];
    orgs.forEach((org, i) => lists.forEach((listType, j) => cells.push({ org, listType, hit: base[i][j], scan: scans[i][j] })));
    return cells;
  })(),
  devices: [
    {
      custId: 'C0001', deviceId: 'IMEI-8601234', model: 'iPhone 14', os: 'iOS 17.4', envScore: 72, fingerprintMatch: 63,
      emulator: false, rooted: false, groupControl: true, ipCity: '杭州', gpsCity: '温州', risk: '高',
      accounts: [
        { custId: 'C0001', name: '张*明', lastUse: day(-1), status: '在贷' },
        { custId: 'C0002', name: '李*华', lastUse: day(-3), status: '在贷' },
        { custId: 'C9001', name: '孙*磊', lastUse: day(-12), status: '已拒绝' },
      ],
    },
    {
      custId: 'C0002', deviceId: 'IMEI-8601234', model: 'iPhone 14', os: 'iOS 17.4', envScore: 68, fingerprintMatch: 71,
      emulator: false, rooted: false, groupControl: true, ipCity: '杭州', gpsCity: '杭州', risk: '中',
      accounts: [
        { custId: 'C0002', name: '李*华', lastUse: day(-3), status: '在贷' },
        { custId: 'C0001', name: '张*明', lastUse: day(-1), status: '在贷' },
      ],
    },
    {
      custId: 'C0003', deviceId: 'IMEI-8609012', model: '华为 Mate60', os: 'HarmonyOS 4', envScore: 18, fingerprintMatch: 97,
      emulator: false, rooted: false, groupControl: false, ipCity: '宁波', gpsCity: '宁波', risk: '低',
      accounts: [{ custId: 'C0003', name: '王*芳', lastUse: day(-2), status: '在贷' }],
    },
    {
      custId: 'C0004', deviceId: 'IMEI-8604567', model: '小米 14（疑似模拟器）', os: 'Android 14', envScore: 91, fingerprintMatch: 42,
      emulator: true, rooted: true, groupControl: true, ipCity: '深圳', gpsCity: '杭州', risk: '高',
      accounts: [
        { custId: 'C0004', name: '赵*强', lastUse: day(0), status: '逾期' },
        { custId: 'C9002', name: '钱*华', lastUse: day(-5), status: '核销' },
        { custId: 'C9003', name: '冯*军', lastUse: day(-9), status: '逾期' },
        { custId: 'C9004', name: '吴*静', lastUse: day(-15), status: '已拒绝' },
      ],
    },
    {
      custId: 'C0005', deviceId: 'IMEI-8607890', model: 'OPPO Reno', os: 'Android 13', envScore: 44, fingerprintMatch: 88,
      emulator: false, rooted: false, groupControl: false, ipCity: '绍兴', gpsCity: '绍兴', risk: '中',
      accounts: [
        { custId: 'C0005', name: '陈*敏', lastUse: day(-1), status: '在贷' },
        { custId: 'C9005', name: '周*涛', lastUse: day(-20), status: '结清' },
      ],
    },
  ],
  deviceHits: [
    { id: 'DH-001', ruleName: '设备命中群控集群', deviceId: 'IMEI-8604567', custName: '赵*强', feature: '同设备 4 个账号 / 24h 内 3 次申请', hitAt: day(0) + ' 09:12', level: '高' },
    { id: 'DH-002', ruleName: '模拟器环境识别', deviceId: 'IMEI-8604567', custName: '赵*强', feature: '虚拟机特征 + 传感器缺失', hitAt: day(0) + ' 09:12', level: '高' },
    { id: 'DH-003', ruleName: '设备指纹一致性异常', deviceId: 'IMEI-8601234', custName: '张*明', feature: '指纹一致性 63% < 80% 阈值', hitAt: day(-1) + ' 20:41', level: '中' },
    { id: 'DH-004', ruleName: 'IP 与 GPS 归属不一致', deviceId: 'IMEI-8601234', custName: '张*明', feature: 'IP 杭州 / GPS 温州', hitAt: day(-1) + ' 20:41', level: '中' },
    { id: 'DH-005', ruleName: '同设备多账号申请', deviceId: 'IMEI-8601234', custName: '李*华', feature: '同设备 3 个账号 30 天内申请', hitAt: day(-3) + ' 11:05', level: '中' },
    { id: 'DH-006', ruleName: 'root / 越狱设备', deviceId: 'IMEI-8604567', custName: '赵*强', feature: 'su 权限检测命中', hitAt: day(-2) + ' 15:33', level: '高' },
    { id: 'DH-007', ruleName: '设备频繁更换', deviceId: 'IMEI-8607890', custName: '陈*敏', feature: '30 天内更换设备 2 次', hitAt: day(-4) + ' 08:20', level: '低' },
  ],
  engineTasks: [
    { id: 'ET-01', name: '存量客户征信复扫', cron: '每月 1 日 02:00', scope: '全量在贷客户', lastRun: day(-8) + ' 02:00', nextRun: day(23) + ' 02:00', scanned: 12840, hits: 326, successRate: 99.2, costSec: 1860, status: '待运行', alertOnHit: true },
    { id: 'ET-02', name: '多头借贷周度监测', cron: '每周一 03:00', scope: '信用贷 + 消费贷', lastRun: day(-2) + ' 03:00', nextRun: day(5) + ' 03:00', scanned: 8620, hits: 214, successRate: 98.7, costSec: 940, status: '运行中', alertOnHit: true },
    { id: 'ET-03', name: '司法涉诉每日扫描', cron: '每日 02:30', scope: '经营贷客户 + 担保人', lastRun: day(0) + ' 02:30', nextRun: day(1) + ' 02:30', scanned: 3210, hits: 47, successRate: 99.8, costSec: 420, status: '运行中', alertOnHit: true },
    { id: 'ET-04', name: '设备风险日扫', cron: '每日 04:00', scope: '近 90 天活跃设备', lastRun: day(0) + ' 04:00', nextRun: day(1) + ' 04:00', scanned: 15630, hits: 132, successRate: 97.4, costSec: 660, status: '运行中', alertOnHit: false },
    { id: 'ET-05', name: '负债激增监测', cron: '每日 05:00', scope: '全量在贷客户', lastRun: day(-1) + ' 05:00', nextRun: day(1) + ' 05:00', scanned: 12840, hits: 88, successRate: 92.1, costSec: 1120, status: '异常', alertOnHit: true },
    { id: 'ET-06', name: '存量客群提额复评', cron: '每季度首日 06:00', scope: '优质客群名单', lastRun: day(-40) + ' 06:00', nextRun: day(52) + ' 06:00', scanned: 4260, hits: 512, successRate: 99.5, costSec: 520, status: '已暂停', alertOnHit: false },
  ],
  opsList: [
    { id: 'OP-001', custId: 'C0003', custName: '王*芳', tier: '核心优质', action: '提额', evalStatus: '已提额', lastEval: day(-12), nextEval: day(18), cycle: '月度', amount: 50000, converted: true, owner: '运营一组' },
    { id: 'OP-002', custId: 'C0002', custName: '李*华', tier: '成长潜力', action: '提额', evalStatus: '评估中', lastEval: day(-5), nextEval: day(25), cycle: '月度', amount: 20000, converted: false, owner: '运营一组' },
    { id: 'OP-003', custId: 'C0005', custName: '陈*敏', tier: '沉睡唤醒', action: '促活', evalStatus: '已促活', lastEval: day(-9), nextEval: day(21), cycle: '月度', amount: 8000, converted: true, owner: '运营二组' },
    { id: 'OP-004', custId: 'C0001', custName: '张*明', tier: '风险观察', action: '降额观察', evalStatus: '已放弃', lastEval: day(-3), nextEval: day(87), cycle: '季度', amount: 0, converted: false, owner: '风险运营岗' },
    { id: 'OP-005', custId: 'C0004', custName: '赵*强', tier: '风险观察', action: '二次营销', evalStatus: '已放弃', lastEval: day(-2), nextEval: day(88), cycle: '季度', amount: 0, converted: false, owner: '风险运营岗' },
    { id: 'OP-006', custId: 'C0006', custName: '刘*梅', tier: '成长潜力', action: '促活', evalStatus: '候选', lastEval: day(-1), nextEval: day(29), cycle: '月度', amount: 5000, converted: false, owner: '运营二组' },
    { id: 'OP-007', custId: 'C0007', custName: '孙*磊', tier: '核心优质', action: '提额', evalStatus: '候选', lastEval: day(-1), nextEval: day(29), cycle: '月度', amount: 30000, converted: false, owner: '运营一组' },
    { id: 'OP-008', custId: 'C0008', custName: '吴*静', tier: '沉睡唤醒', action: '二次营销', evalStatus: '评估中', lastEval: day(-6), nextEval: day(24), cycle: '月度', amount: 12000, converted: false, owner: '运营二组' },
    { id: 'OP-009', custId: 'C0009', custName: '钱*华', tier: '风险观察', action: '降额观察', evalStatus: '已放弃', lastEval: day(-15), nextEval: day(75), cycle: '季度', amount: 0, converted: false, owner: '风险运营岗' },
    { id: 'OP-010', custId: 'C0010', custName: '冯*军', tier: '成长潜力', action: '提额', evalStatus: '候选', lastEval: day(-4), nextEval: day(26), cycle: '月度', amount: 15000, converted: false, owner: '运营一组' },
  ],
};

/* ============================ store（与 collectionData 同构） ============================ */

const FILE = 'midGap.json';
let data: GapData = JSON.parse(JSON.stringify(SEED_GAP));
let version = 0;
const listeners = new Set<() => void>();
function emit() { version++; listeners.forEach((fn) => fn()); }

async function loadOne(file: string): Promise<unknown> {
  try {
    const r = await fetch(`/api/load-mid?file=${encodeURIComponent(file)}`);
    return r.ok ? await r.json() : null;
  } catch { return null; }
}
function saveOne(file: string, body: unknown) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  }).catch(() => {});
}
async function bootstrap() {
  const saved = await loadOne(FILE);
  if (saved && typeof saved === 'object' && Array.isArray((saved as GapData).coDebts)) data = saved as GapData;
  else saveOne(FILE, data);
  emit();
}
void bootstrap();

export function useGap(): GapData {
  useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => version);
  return data;
}
export function updateGap(fn: (d: GapData) => GapData) {
  data = fn(data);
  emit();
  saveOne(FILE, data);
}

/* ============================ 派生 / 兜底（实时计算 灰 Cal） ============================ */

function hashOf(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return h;
}
const ORG_POOL = ['××消费金融', '××网络小贷', '××城商行', '××助贷平台', '××股份行', '××融资担保', '××汽车金融'];
const ORG_TYPE: Record<string, string> = {
  '××消费金融': '消金', '××网络小贷': '小贷', '××城商行': '银行', '××助贷平台': '网贷',
  '××股份行': '银行', '××融资担保': '担保', '××汽车金融': '消金',
};

/** 多头共债画像：优先取样例，未命中按 key 确定性派生 */
export function coDebtOf(d: GapData, custId: string, custName = ''): CoDebtProfile {
  const hit = d.coDebts.find((x) => x.custId === custId || (custName && x.custName === custName));
  if (hit) return hit;
  const h = hashOf(custId || custName || 'anon');
  const cnt = 2 + (h % 5);
  const orgs: CoDebtOrg[] = Array.from({ length: cnt }, (_, i) => {
    const org = ORG_POOL[(h + i * 3) % ORG_POOL.length];
    return {
      org, orgType: ORG_TYPE[org] ?? '网贷',
      balance: 8000 + ((h >> (i + 1)) % 90) * 1000,
      applyCnt30d: 1 + ((h >> i) % 3),
      status: ((h >> i) % 7 === 0) ? '逾期' : ((h >> i) % 3 === 0) ? '关注' : '正常',
      sameDevice: (h >> (i + 2)) % 3 === 0,
      listHit: (h >> (i + 4)) % 9 === 0 ? '灰名单' : undefined,
    };
  });
  const applyCnt30d = orgs.reduce((s, o) => s + o.applyCnt30d, 0);
  const totalBalance = orgs.reduce((s, o) => s + o.balance, 0);
  const sameDeviceApply = orgs.filter((o) => o.sameDevice).reduce((s, o) => s + o.applyCnt30d, 0);
  return {
    custId, custName: custName || custId,
    orgCnt30d: cnt, applyCnt30d, totalBalance, sameDeviceApply,
    level: cnt >= 6 ? '高' : cnt >= 4 ? '中' : '低',
    chain: [custName || custId, orgs[0]?.org ?? '—', sameDeviceApply > 0 ? '同设备关联申请' : '无同设备关联'],
    orgs,
  };
}

/** 设备档案：优先取样例，未命中按 key 确定性派生 */
export function deviceOf(d: GapData, custId: string, custName = ''): DeviceProfile {
  const hit = d.devices.find((x) => x.custId === custId);
  if (hit) return hit;
  const h = hashOf(custId || custName || 'anon');
  const env = 10 + (h % 90);
  const cities = ['杭州', '宁波', '温州', '绍兴', '深圳', '成都'];
  return {
    custId,
    deviceId: 'IMEI-86' + String(10000 + (h % 89999)),
    model: ['iPhone 14', '华为 Mate60', '小米 14', 'OPPO Reno', 'vivo X100'][h % 5],
    os: ['iOS 17.4', 'HarmonyOS 4', 'Android 14', 'Android 13'][h % 4],
    envScore: env,
    fingerprintMatch: 100 - (h % 45),
    emulator: h % 11 === 0,
    rooted: h % 7 === 0,
    groupControl: h % 5 === 0,
    ipCity: cities[h % cities.length],
    gpsCity: cities[(h + 2) % cities.length],
    risk: env >= 70 ? '高' : env >= 40 ? '中' : '低',
    accounts: [{ custId, name: custName || custId, lastUse: day(-(h % 5)), status: '在贷' }],
  };
}

/** 客户运营动作记录（运营名单跟踪按客户过滤） */
export function opsOf(d: GapData, custId: string): OpsListItem[] {
  return d.opsList.filter((x) => x.custId === custId);
}

/** 共债网络 TOP：按共债机构数 / 同设备申请聚合排序（大盘排行榜用） */
export function coDebtTop(d: GapData, limit = 8): CoDebtProfile[] {
  return [...d.coDebts].sort((a, b) => (b.orgCnt30d - a.orgCnt30d) || (b.totalBalance - a.totalBalance)).slice(0, limit);
}

/** 高危设备清单（大盘看板用） */
export function riskyDevices(d: GapData): DeviceProfile[] {
  return d.devices.filter((x) => x.risk === '高' || x.emulator || x.groupControl);
}

/** 引擎运行汇总（大盘「引擎运行态势」卡片用） */
export function engineSummary(d: GapData) {
  const running = d.engineTasks.filter((t) => t.status === '运行中').length;
  const todayScan = d.engineTasks.filter((t) => t.status === '运行中').reduce((s, t) => s + t.scanned, 0);
  const todayHit = d.engineTasks.filter((t) => t.status === '运行中').reduce((s, t) => s + t.hits, 0);
  const abnormal = d.engineTasks.filter((t) => t.status === '异常').length;
  const avgSuccess = d.engineTasks.length
    ? d.engineTasks.reduce((s, t) => s + t.successRate, 0) / d.engineTasks.length
    : 0;
  return { running, todayScan, todayHit, abnormal, avgSuccess };
}

/** 运营效果汇总（td5「促活/提额效果看板」用） */
export function opsSummary(d: GapData) {
  const total = d.opsList.length;
  const candidate = d.opsList.filter((x) => x.evalStatus === '候选').length;
  const evaluating = d.opsList.filter((x) => x.evalStatus === '评估中').length;
  const done = d.opsList.filter((x) => x.evalStatus === '已提额' || x.evalStatus === '已促活').length;
  const amount = d.opsList.filter((x) => x.converted).reduce((s, x) => s + x.amount, 0);
  const convRate = total ? (done / total) * 100 : 0;
  return { total, candidate, evaluating, done, amount, convRate };
}

/** 跨机构名单网络：矩阵行列 + 命中率 */
export function crossOrgMatrix(d: GapData) {
  const orgs = Array.from(new Set(d.crossOrg.map((c) => c.org)));
  const lists = Array.from(new Set(d.crossOrg.map((c) => c.listType)));
  const at = (org: string, listType: string) => d.crossOrg.find((c) => c.org === org && c.listType === listType);
  return { orgs, lists, at };
}

/** 试运行：按任务确定性模拟一次扫描，返回命中预览（不落盘） */
export function dryRunTask(t: EngineTask, d: GapData) {
  const h = hashOf(t.id + t.name);
  const scanned = Math.max(50, Math.round(t.scanned / 20));
  const hits = Math.max(1, Math.round(t.hits / 20) + (h % 3));
  const pool = [...d.coDebts.map((c) => ({ custId: c.custId, custName: c.custName, reason: `多头机构数 ${c.orgCnt30d} 家` })),
    ...d.devices.map((v) => ({ custId: v.custId, custName: v.custId, reason: `设备环境分 ${v.envScore}` }))];
  const rows = Array.from({ length: Math.min(hits, pool.length) }, (_, i) => pool[(h + i * 3) % pool.length]);
  return { scanned, hits, costSec: Math.max(3, Math.round(t.costSec / 20)), rows };
}

export const GAP_LEVEL_KIND: Record<GapLevel, 'red' | 'amber' | 'green'> = { 高: 'red', 中: 'amber', 低: 'green' };
