// 催贷管理子系统 · 数据层（与 collectionData / midStore 同构）
// 样例数据存本地 dunData.json（橘 Sam，用户运行时创建/编辑落本地）；实时统计 灰 Cal。
// 持久化复用 /api/load-mid /api/save-mid 端点（与贷中监控一致）；首启动 SEED 自动落盘。

export interface DunAgency {
  id: string;
  name: string;            // 机构名
  tenant: string;          // 租户（数据逻辑隔离）
  cases: number;           // 在派案件数
  connectRate: number;     // 接通率 %
  recoveryRate: number;    // 回款率 %
  complaint: number;       // 投诉数
  commission: number;      // 待结算佣金（元）
  status: '正常' | '预警' | '暂停';
  violations: string[];    // 违规预警
}

export interface DunChannel {
  id: string;
  name: string;            // 云呼叫中心 / AI 协催机器人 / 合规短信 / 安米外勤 App / 催收工作手机
  type: '呼叫' | '机器人' | '短信' | '外勤' | '硬件';
  enabled: boolean;
  volume: number;          // 本期用量（通 / 条 / 次）
  callWindow: string;      // 合规呼叫时段
  maxPerDay: number;       // 每日最大联系频次
  noThirdParty: boolean;   // 禁止骚扰第三方联系人
}

export interface DunQaWord {
  id: string;
  category: '威胁恐吓' | '骚扰辱骂' | '联系第三方' | '虚假不实';
  word: string;
  enabled: boolean;
}

export interface DunQaRecord {
  id: string;
  caseId: string;
  agent: string;           // 坐席
  duration: number;        // 通话时长（秒）
  asrText: string;         // ASR 实时转写
  violations: string[];    // 命中违规词
  score: number;           // 质检分
  result: '合格' | '违规' | '复核中';
}

export interface DunRepayment {
  id: string;
  caseId: string;
  custName: string;
  amount: number;          // 回款金额（元）
  method: '一次性' | '分期';
  date: string;
  matched: boolean;        // 自动匹配案件
}

export interface DunWaiver {
  id: string;
  caseId: string;
  custName: string;
  amount: number;          // 减免金额（元）
  reason: string;
  approver: string;
  status: '审批中' | '已通过' | '已驳回';
  level: string;           // 审批级别
}

export interface DunAssignment {
  id: string;
  name: string;
  condStage: string;       // 账龄条件
  condRisk: string;        // 风险等级条件
  route: '内催' | '委外' | '调解' | '诉讼';
  dynamic: string;         // 动态调案（画像 / 产能）
  recycle: string;         // 超时回收 / 二次分配
  enabled: boolean;
}

export interface DunImport {
  id: string;
  source: 'API 自动对接' | 'Excel 手动导案';
  time: string;
  count: number;
  mode: '批量' | '增量';
}

export interface DunData {
  agencies: DunAgency[];
  channels: DunChannel[];
  qaWords: DunQaWord[];
  qaRecords: DunQaRecord[];
  repayments: DunRepayment[];
  waivers: DunWaiver[];
  assignments: DunAssignment[];
  imports: DunImport[];
}

const d0 = (days: number) => {
  const d = new Date('2026-08-08');
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
};

export const SEED_DUN: DunData = {
  agencies: [
    { id: 'AG-01', name: '华信资产管理有限公司', tenant: '租户A', cases: 320, connectRate: 78, recoveryRate: 42, complaint: 2, commission: 186000, status: '正常', violations: [] },
    { id: 'AG-02', name: '鼎力催收服务', tenant: '租户B', cases: 256, connectRate: 71, recoveryRate: 38, complaint: 5, commission: 142000, status: '预警', violations: ['单日联系频次超限', '疑似联系第三方'] },
    { id: 'AG-03', name: '正和调解中心', tenant: '租户C', cases: 188, connectRate: 83, recoveryRate: 51, complaint: 0, commission: 98000, status: '正常', violations: [] },
    { id: 'AG-04', name: '法证律师事务所', tenant: '租户D', cases: 96, connectRate: 65, recoveryRate: 33, complaint: 1, commission: 76000, status: '正常', violations: [] },
    { id: 'AG-05', name: '锐进商务咨询', tenant: '租户E', cases: 142, connectRate: 69, recoveryRate: 29, complaint: 9, commission: 54000, status: '暂停', violations: ['违规承诺减免', '投诉集中'] },
    { id: 'AG-06', name: '安融资产处置', tenant: '租户F', cases: 210, connectRate: 74, recoveryRate: 45, complaint: 3, commission: 121000, status: '正常', violations: [] },
    { id: 'AG-07', name: '中诚调解事务所', tenant: '租户G', cases: 134, connectRate: 80, recoveryRate: 47, complaint: 1, commission: 67000, status: '正常', violations: [] },
    { id: 'AG-08', name: '恒利催收外包', tenant: '租户H', cases: 178, connectRate: 72, recoveryRate: 36, complaint: 4, commission: 89000, status: '预警', violations: ['录音缺失'] },
  ],
  channels: [
    { id: 'CH-01', name: '云呼叫中心', type: '呼叫', enabled: true, volume: 12480, callWindow: '08:00-20:00', maxPerDay: 3, noThirdParty: true },
    { id: 'CH-02', name: 'AI 智能协催机器人', type: '机器人', enabled: true, volume: 8600, callWindow: '09:00-19:00', maxPerDay: 2, noThirdParty: true },
    { id: 'CH-03', name: '合规短信通道', type: '短信', enabled: true, volume: 21500, callWindow: '08:00-21:00', maxPerDay: 1, noThirdParty: true },
    { id: 'CH-04', name: '安米外勤 App', type: '外勤', enabled: true, volume: 1240, callWindow: '08:00-20:00', maxPerDay: 1, noThirdParty: true },
    { id: 'CH-05', name: '催收工作手机（硬件）', type: '硬件', enabled: false, volume: 0, callWindow: '08:00-20:00', maxPerDay: 3, noThirdParty: true },
  ],
  qaWords: [
    { id: 'QW-01', category: '威胁恐吓', word: '不还钱就上门', enabled: true },
    { id: 'QW-02', category: '威胁恐吓', word: '报警抓你', enabled: true },
    { id: 'QW-03', category: '骚扰辱骂', word: '你怎么这么无赖', enabled: true },
    { id: 'QW-04', category: '骚扰辱骂', word: '不要脸', enabled: true },
    { id: 'QW-05', category: '联系第三方', word: '我打给你家人', enabled: true },
    { id: 'QW-06', category: '联系第三方', word: '通知你单位', enabled: true },
    { id: 'QW-07', category: '虚假不实', word: '银行内部有人', enabled: true },
    { id: 'QW-08', category: '虚假不实', word: '利息可以全免', enabled: true },
    { id: 'QW-09', category: '威胁恐吓', word: '起诉你子女', enabled: false },
    { id: 'QW-10', category: '联系第三方', word: '发朋友圈曝光', enabled: true },
  ],
  qaRecords: [
    { id: 'QA-202608-01', caseId: 'CO-202608-001', agent: '王雷', duration: 186, asrText: '客户表示资金紧张，坐席说“再不还钱我们就上门找你”。', violations: ['威胁恐吓'], score: 62, result: '违规' },
    { id: 'QA-202608-02', caseId: 'CO-202608-002', agent: '李娜', duration: 142, asrText: '坐席告知还款通道，客户承诺 8 月 10 日还款，沟通礼貌。', violations: [], score: 96, result: '合格' },
    { id: 'QA-202608-03', caseId: 'CO-202608-004', agent: '郑浩', duration: 98, asrText: '坐席说“我打给你家人问问看”，违反禁止联系第三方规定。', violations: ['联系第三方'], score: 55, result: '违规' },
    { id: 'QA-202608-04', caseId: 'CO-202608-007', agent: '李娜', duration: 211, asrText: '客户情绪激动，坐席安抚并说明减免政策，未发现违规话术。', violations: [], score: 91, result: '合格' },
    { id: 'QA-202608-05', caseId: 'CO-202608-003', agent: '周敏', duration: 76, asrText: '坐席提醒还款日，简短告知，未越界。', violations: [], score: 94, result: '合格' },
    { id: 'QA-202608-06', caseId: 'CO-202608-001', agent: '王雷', duration: 233, asrText: '坐席称“银行内部有人可以帮你销账”，属虚假不实话术。', violations: ['虚假不实'], score: 48, result: '违规' },
    { id: 'QA-202608-07', caseId: 'CO-202608-006', agent: '系统', duration: 0, asrText: '（外呼未接通，无转写）', violations: [], score: 0, result: '复核中' },
    { id: 'QA-202608-08', caseId: 'CO-202608-002', agent: '李娜', duration: 156, asrText: '坐席二次回访确认还款意愿，客户再次确认。', violations: [], score: 93, result: '合格' },
    { id: 'QA-202608-09', caseId: 'CO-202608-004', agent: '郑浩', duration: 121, asrText: '坐席说“你这么无赖，迟早出事”，存在辱骂。', violations: ['骚扰辱骂'], score: 58, result: '违规' },
    { id: 'QA-202608-10', caseId: 'CO-202608-007', agent: '李娜', duration: 88, asrText: '坐席告知逾期影响并约定下次联系时间。', violations: [], score: 90, result: '合格' },
    { id: 'QA-202608-11', caseId: 'CO-202608-003', agent: '周敏', duration: 64, asrText: 'AI 机器人外呼提醒，标准话术，无违规。', violations: [], score: 98, result: '合格' },
    { id: 'QA-202608-12', caseId: 'CO-202608-005', agent: '系统', duration: 0, asrText: '（M0 提醒短信已发，无通话）', violations: [], score: 0, result: '复核中' },
  ],
  repayments: [
    { id: 'RP-01', caseId: 'CO-202608-002', custName: '张*明', amount: 20000, method: '分期', date: d0(2), matched: true },
    { id: 'RP-02', caseId: 'CO-202608-003', custName: '刘*梅', amount: 6800, method: '一次性', date: d0(1), matched: true },
    { id: 'RP-03', caseId: 'CO-202608-004', custName: '孙*磊', amount: 3500, method: '一次性', date: d0(3), matched: true },
    { id: 'RP-04', caseId: 'CO-202608-007', custName: '冯*军', amount: 8000, method: '分期', date: d0(5), matched: true },
    { id: 'RP-05', caseId: 'CO-202608-001', custName: '赵*强', amount: 12000, method: '分期', date: d0(8), matched: true },
    { id: 'RP-06', caseId: 'CO-202608-002', custName: '张*明', amount: 10000, method: '分期', date: d0(10), matched: true },
    { id: 'RP-07', caseId: 'CO-202608-009', custName: '陈*东', amount: 15000, method: '一次性', date: d0(12), matched: false },
    { id: 'RP-08', caseId: 'CO-202608-010', custName: '杨*丽', amount: 5200, method: '一次性', date: d0(15), matched: true },
    { id: 'RP-09', caseId: 'CO-202608-011', custName: '黄*伟', amount: 23000, method: '分期', date: d0(18), matched: true },
    { id: 'RP-10', caseId: 'CO-202608-012', custName: '林*芳', amount: 9000, method: '分期', date: d0(20), matched: false },
    { id: 'RP-11', caseId: 'CO-202608-013', custName: '何*强', amount: 4300, method: '一次性', date: d0(22), matched: true },
    { id: 'RP-12', caseId: 'CO-202608-014', custName: '罗*军', amount: 17500, method: '分期', date: d0(25), matched: true },
    { id: 'RP-13', caseId: 'CO-202608-015', custName: '高*梅', amount: 6100, method: '一次性', date: d0(28), matched: true },
    { id: 'RP-14', caseId: 'CO-202608-016', custName: '马*华', amount: 11000, method: '分期', date: d0(30), matched: true },
    { id: 'RP-15', caseId: 'CO-202608-017', custName: '宋*磊', amount: 7400, method: '一次性', date: d0(33), matched: true },
  ],
  waivers: [
    { id: 'WV-01', caseId: 'CO-202608-001', custName: '赵*强', amount: 8000, reason: '重大疾病，提供病历证明', approver: '委外管理岗', status: '已通过', level: '二级' },
    { id: 'WV-02', caseId: 'CO-202608-006', custName: '钱*华', amount: 15000, reason: '长期失联，本金回收困难', approver: '风控总监', status: '已通过', level: '三级' },
    { id: 'WV-03', caseId: 'CO-202608-007', custName: '冯*军', amount: 3000, reason: '一次性结清申请减免', approver: '催收二组', status: '审批中', level: '一级' },
    { id: 'WV-04', caseId: 'CO-202608-009', custName: '陈*东', amount: 5000, reason: '疫情影响收入', approver: '催收一组', status: '已驳回', level: '一级' },
    { id: 'WV-05', caseId: 'CO-202608-011', custName: '黄*伟', amount: 6000, reason: '协商分期首期减免', approver: '委外管理岗', status: '审批中', level: '二级' },
    { id: 'WV-06', caseId: 'CO-202608-014', custName: '罗*军', amount: 4000, reason: '困难客户帮扶', approver: '风控总监', status: '已通过', level: '三级' },
    { id: 'WV-07', caseId: 'CO-202608-013', custName: '何*强', amount: 1200, reason: '小额减免快速结案', approver: '催收一组', status: '已通过', level: '一级' },
    { id: 'WV-08', caseId: 'CO-202608-017', custName: '宋*磊', amount: 2200, reason: '投诉协商减免', approver: '催收二组', status: '审批中', level: '一级' },
  ],
  assignments: [
    { id: 'AS-01', name: 'M1 低风险内催', condStage: 'M1', condRisk: '低', route: '内催', dynamic: '按催员当日剩余产能均衡分配', recycle: '48h 无触达自动回收二次分配', enabled: true },
    { id: 'AS-02', name: 'M2 中风险内催', condStage: 'M2', condRisk: '中', route: '内催', dynamic: '优先分配给历史回款率高催员', recycle: '72h 无进展回收', enabled: true },
    { id: 'AS-03', name: 'M3+ 大额委外', condStage: 'M3+', condRisk: '高', route: '委外', dynamic: '按机构专长（大额/诉讼）匹配租户', recycle: '超时未接派自动回流', enabled: true },
    { id: 'AS-04', name: '调解优先分流', condStage: 'M2,M3+', condRisk: '中', route: '调解', dynamic: '有调解意愿客户分流至调解中心', recycle: '调解失败回流内催', enabled: true },
    { id: 'AS-05', name: '诉讼前置筛查', condStage: 'M3+', condRisk: '高', route: '诉讼', dynamic: '本金 ≥ 5 万且失联转法务', recycle: '诉讼撤回回流委外', enabled: true },
    { id: 'AS-06', name: 'M0 智能提醒', condStage: 'M0', condRisk: '低', route: '内催', dynamic: 'AI 机器人自动外呼/短信', recycle: '还款后自动结案', enabled: true },
  ],
  imports: [
    { id: 'IMP-01', source: 'API 自动对接', time: d0(1), count: 128, mode: '增量' },
    { id: 'IMP-02', source: 'API 自动对接', time: d0(8), count: 142, mode: '增量' },
    { id: 'IMP-03', source: 'Excel 手动导案', time: d0(15), count: 860, mode: '批量' },
    { id: 'IMP-04', source: 'API 自动对接', time: d0(22), count: 156, mode: '增量' },
    { id: 'IMP-05', source: 'Excel 手动导案', time: d0(30), count: 540, mode: '批量' },
  ],
};

/* ---- 轻量 store（与 collectionData 同构：useSyncExternalStore + 落盘） ---- */
import { useSyncExternalStore } from 'react';

const FILES = { dun: 'dunData.json' };
let data: DunData = JSON.parse(JSON.stringify(SEED_DUN));
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
  const saved = await loadOne(FILES.dun);
  if (saved && typeof saved === 'object' && Array.isArray((saved as DunData).agencies)) {
    data = saved as DunData;
  } else {
    saveOne(FILES.dun, data);
  }
  emit();
}
void bootstrap();

function useSnap<T>(sel: () => T): T { useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => version); return sel(); }

export function useDunData(): DunData { return useSnap(() => data); }
export function useDunSaveStatus(): 'ok' | 'error' | null {
  useSyncExternalStore((l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; }, () => saveStatus);
  return saveStatus;
}
export function updateDunData(fn: (d: DunData) => DunData) {
  data = fn(data);
  emit();
  saveOne(FILES.dun, data);
}
export function dunNewId(p: string) { return `${p}-${Date.now().toString(36)}`; }
