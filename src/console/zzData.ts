// 催贷管理子系统 · 样例数据（橘 Sam，内嵌常量；演示原型，不接真库）
// 客户名与既有 collectionData 保持一致，便于跨页联动观感一致。

export const money = (n: number) => '¥' + n.toLocaleString('zh-CN')
export const pct = (n: number, d = 1) => (n * 100).toFixed(d) + '%'

/* ============================ 模块1 案件管理 ============================ */
export interface ZzCase {
  id: string; name: string; idno: string; contract: string
  principal: number; penalty: number; total: number          // 原始逾期金额
  remainPrincipal: number; remainPenalty: number; remainTotal: number // 当前待还金额（区分原始逾期）
  stage: 'M0' | 'M1' | 'M2' | 'M3+'; overdueRange: string; status: string
  owner: string; lost: boolean; outsource: boolean; litigation: boolean
  lastTouch: string; phone: string; contacts: number
  overdueDays: number; nextFollow: string; paused: boolean; waiverPending: boolean // 列表增强：逾期天数/下次跟进/暂停/减免在审
}
export const ZZ_CASES: ZzCase[] = [
  { id: 'CO-202608-001', name: '赵*强', idno: '3301**********1234', contract: 'HT-2025-0812', principal: 150000, penalty: 6000, total: 156000, remainPrincipal: 148000, remainPenalty: 6000, remainTotal: 154000, stage: 'M3+', overdueRange: '>90天', status: '委外', owner: '王雷', lost: false, outsource: true, litigation: true, lastTouch: '2026-08-24', phone: '138****2211', contacts: 3, overdueDays: 95, nextFollow: '2026-08-30', paused: false, waiverPending: false },
  { id: 'CO-202608-002', name: '张*明', idno: '4401**********5678', contract: 'HT-2025-0923', principal: 40000, penalty: 2000, total: 42000, remainPrincipal: 40000, remainPenalty: 2000, remainTotal: 42000, stage: 'M2', overdueRange: '31-90天', status: '催收中', owner: '李娜', lost: false, outsource: false, litigation: false, lastTouch: '2026-08-24', phone: '139****3344', contacts: 2, overdueDays: 60, nextFollow: '2026-08-28', paused: false, waiverPending: true },
  { id: 'CO-202608-003', name: '刘*梅', idno: '5101**********9012', contract: 'HT-2026-0115', principal: 6500, penalty: 300, total: 6800, remainPrincipal: 6500, remainPenalty: 300, remainTotal: 6800, stage: 'M1', overdueRange: '1-30天', status: '承诺还款', owner: '周敏', lost: false, outsource: false, litigation: false, lastTouch: '2026-08-24', phone: '137****5566', contacts: 1, overdueDays: 20, nextFollow: '2026-08-27', paused: false, waiverPending: false },
  { id: 'CO-202608-004', name: '孙*磊', idno: '3201**********3456', contract: 'HT-2026-0208', principal: 3400, penalty: 100, total: 3500, remainPrincipal: 3400, remainPenalty: 100, remainTotal: 3500, stage: 'M1', overdueRange: '1-30天', status: '催收中', owner: '郑浩', lost: false, outsource: false, litigation: false, lastTouch: '2026-08-24', phone: '135****7788', contacts: 1, overdueDays: 15, nextFollow: '2026-08-26', paused: false, waiverPending: false },
  { id: 'CO-202608-005', name: '吴*静', idno: '6101**********7890', contract: 'HT-2026-0301', principal: 0, penalty: 0, total: 0, remainPrincipal: 0, remainPenalty: 0, remainTotal: 0, stage: 'M0', overdueRange: '未逾期', status: '待分案', owner: '系统', lost: false, outsource: false, litigation: false, lastTouch: '2026-08-25', phone: '136****9900', contacts: 0, overdueDays: 0, nextFollow: '—', paused: false, waiverPending: false },
  { id: 'CO-202608-006', name: '钱*华', idno: '4201**********1122', contract: 'HT-2025-0518', principal: 86000, penalty: 3000, total: 89000, remainPrincipal: 86000, remainPenalty: 3000, remainTotal: 89000, stage: 'M3+', overdueRange: '>90天', status: '核销', owner: '王雷', lost: true, outsource: false, litigation: true, lastTouch: '2026-08-15', phone: '138****1234', contacts: 4, overdueDays: 110, nextFollow: '—', paused: false, waiverPending: false },
  { id: 'CO-202608-007', name: '冯*军', idno: '3701**********3344', contract: 'HT-2025-1102', principal: 14500, penalty: 500, total: 15000, remainPrincipal: 14500, remainPenalty: 500, remainTotal: 15000, stage: 'M2', overdueRange: '31-90天', status: '催收中', owner: '李娜', lost: false, outsource: false, litigation: false, lastTouch: '2026-08-23', phone: '139****5566', contacts: 2, overdueDays: 65, nextFollow: '2026-08-29', paused: true, waiverPending: false },
  { id: 'CO-202608-008', name: '王*芳', idno: '5001**********5566', contract: 'HT-2026-0405', principal: 0, penalty: 0, total: 0, remainPrincipal: 0, remainPenalty: 0, remainTotal: 0, stage: 'M0', overdueRange: '未逾期', status: '待分案', owner: '系统', lost: false, outsource: false, litigation: false, lastTouch: '2026-08-25', phone: '137****7788', contacts: 0, overdueDays: 0, nextFollow: '—', paused: false, waiverPending: false },
  // 已结清案件：自动归档，不出现在逾期列表（见历史案件菜单）
  { id: 'CO-202608-000', name: '郑*国', idno: '1101**********3344', contract: 'HT-2025-0721', principal: 22000, penalty: 800, total: 22800, remainPrincipal: 0, remainPenalty: 0, remainTotal: 0, stage: 'M1', overdueRange: '1-30天', status: '已结清', owner: '周敏', lost: false, outsource: false, litigation: false, lastTouch: '2026-08-21', phone: '136****1122', contacts: 2, overdueDays: 28, nextFollow: '—', paused: false, waiverPending: false },
]

/* —— 权限助手：线下还款登记等资金操作仅对管理/审核角色开放，普通催收坐席隐藏 —— */
export function zzCurrentRole(): string {
  try {
    const raw = localStorage.getItem('zdrk_user')
    if (!raw) return '风控管理员'
    const u = JSON.parse(raw) as { role?: string }
    return u.role || '风控管理员'
  } catch { return '风控管理员' }
}
// 可对案件做「线下还款登记」的角色（普通催收坐席被排除）
export const ZZ_OFFLINE_REPAY_ROLES = ['风控管理员', '风控审核', '客群运营']
export const canOfflineRepay = (role: string) => ZZ_OFFLINE_REPAY_ROLES.includes(role)
export const ZZ_CASE_NOTES: Record<string, { time: string; who: string; what: string }[]> = {
  'CO-202608-001': [{ time: '2026-08-24 10:12', who: '王雷', what: '外呼接通，客户表示资金紧张，申请减免部分利息' }],
  'CO-202608-002': [{ time: '2026-08-24 14:30', who: '李娜', what: '客户承诺 8 月 28 日前还款 2 万，已记录承诺' }],
}
export const ZZ_HISTORY_CASES = [
  { id: 'CO-202601-017', name: '陈*东', idCard: '3301**********1234', total: 23000, recovered: 23000, closeType: '已结清', closeTime: '2026-03-12', archiveTime: '2026-03-13 09:10', disposal: ['坐席催收', 'AI协催'] },
  { id: 'CO-202602-009', name: '黄*丽', idCard: '4401**********5678', total: 56000, recovered: 0, closeType: '核销', closeTime: '2026-05-20', archiveTime: '2026-05-21 14:30', disposal: ['坐席催收', '委外'] },
  { id: 'CO-202603-004', name: '林*生', idCard: '5101**********9012', total: 41000, recovered: 38000, closeType: '诉讼结案', closeTime: '2026-06-30', archiveTime: '2026-07-01 10:05', disposal: ['坐席催收', '法务诉讼'] },
  { id: 'CO-202608-000', name: '郑*国', idCard: '3201**********3456', total: 22800, recovered: 22800, closeType: '已结清', closeTime: '2026-08-21', archiveTime: '2026-08-22 08:40', disposal: ['AI协催', '坐席催收'] },
  { id: 'CO-202604-021', name: '王*芳', idCard: '3701**********7890', total: 88000, recovered: 12000, closeType: '核销', closeTime: '2026-07-18', archiveTime: '2026-07-19 16:20', disposal: ['坐席催收', '委外', '法务诉讼'] },
  { id: 'CO-202605-013', name: '赵*强', idCard: '3301**********2345', total: 32000, recovered: 32000, closeType: '已结清', closeTime: '2026-08-15', archiveTime: '2026-08-16 11:00', disposal: ['AI协催', '坐席催收', '委外'] },
]

/* —— 案件详情页结构化数据 —— */
export interface ZzRepay {
  id: string; amt: number; principalPart: number; penaltyPart: number
  time: string; operator: string; source: '线下登记' | '系统自动代扣' | '脚本导入'
  ptpId?: string; kp: boolean
}
export interface ZzPtpOral {
  id: string; promiseTime: string; dueTime: string; promiseAmt: number
  status: '待履约' | '已履约' | '已失约'; result: 'KP' | 'BP' | '-'
  creator: string; actualTime: string; note: string; actionId?: string
}
export interface ZzPtpAgreement {
  id: string; signTime: string; promiseTime: string; dueTime: string; amt: number
  status: '生效中' | '已履约' | '已作废'; result: string; creator: string; actualTime: string; note: string; actionId?: string
}
export interface ZzAction {
  id: string; rec: string; who: string; time: string
  channel: '外呼' | '短信' | '微信' | '上门'; recording: boolean; ptpId?: string; callId?: string
}
export interface ZzContact {
  rel: string; name: string; type: string; tel: string; status: string; isNew: boolean
}
export interface ZzCaseDetailData {
  repays: ZzRepay[]; ptpOral: ZzPtpOral[]; ptpAgreement: ZzPtpAgreement[]
  actions: ZzAction[]; contacts: ZzContact[]
}
const ZZ_DETAIL_DEF: ZzCaseDetailData = {
  repays: [{ id: 'R-DEF', amt: 0, principalPart: 0, penaltyPart: 0, time: '—', operator: '—', source: '脚本导入', kp: false }],
  ptpOral: [], ptpAgreement: [], actions: [], contacts: [],
}
export const ZZ_CASE_DETAIL: Record<string, ZzCaseDetailData> = {
  'CO-202608-002': {
    repays: [
      { id: 'R-201', amt: 20000, principalPart: 19500, penaltyPart: 500, time: '2026-08-20', operator: '李娜', source: '系统自动代扣', ptpId: 'PTP-001', kp: true },
      { id: 'R-202', amt: 5000, principalPart: 4800, penaltyPart: 200, time: '2026-08-14', operator: '李娜', source: '线下登记', kp: false },
      { id: 'R-203', amt: 1000, principalPart: 1000, penaltyPart: 0, time: '2026-08-13', operator: 'admin', source: '脚本导入', kp: false },
    ],
    ptpOral: [
      { id: 'PTP-001', promiseTime: '2026-08-28', dueTime: '2026-08-31', promiseAmt: 20000, status: '待履约', result: '-', creator: '李娜', actualTime: '', note: '客户承诺工资到账后还款（多笔分期首笔）', actionId: 'ACT-001' },
      { id: 'PTP-002', promiseTime: '2026-08-10', dueTime: '2026-08-12', promiseAmt: 5000, status: '已失约', result: 'BP', creator: '李娜', actualTime: '', note: '未履约，已转人工跟进', actionId: 'ACT-002' },
    ],
    ptpAgreement: [
      { id: 'AGP-001', signTime: '2026-08-05', promiseTime: '2026-08-28', dueTime: '2026-09-28', amt: 20000, status: '生效中', result: 'KP', creator: '周敏', actualTime: '', note: '签署分期还款协议，分 3 期', actionId: '' },
    ],
    actions: [
      { id: 'ACT-001', rec: '客户承诺 8 月 28 日前还款 2 万', who: '李娜', time: '2026-08-24 14:30', channel: '外呼', recording: true, ptpId: 'PTP-001' },
      { id: 'ACT-002', rec: '提醒还款，客户未明确表态', who: '李娜', time: '2026-08-12 10:00', channel: '外呼', recording: true, ptpId: 'PTP-002' },
      { id: 'ACT-003', rec: '发送还款提醒短信', who: '系统', time: '2026-08-22 09:00', channel: '短信', recording: false, ptpId: '' },
      { id: 'ACT-004', rec: '微信沟通分期方案', who: '李娜', time: '2026-08-19 20:10', channel: '微信', recording: false, ptpId: '' },
    ],
    contacts: [
      { rel: '本人', name: '张*明', type: '手机', tel: '139****3344', status: '有效', isNew: false },
      { rel: '紧急联系人', name: '张*国', type: '手机', tel: '137****2211', status: '有效', isNew: false },
      { rel: '单位电话', name: '—', type: '单位电话', tel: '020****5566', status: '有效', isNew: true },
    ],
  },
  'CO-202608-001': {
    repays: [{ id: 'R-101', amt: 8000, principalPart: 7800, penaltyPart: 200, time: '2026-08-01', operator: '王雷', source: '线下登记', kp: false }],
    ptpOral: [{ id: 'PTP-101', promiseTime: '2026-08-15', dueTime: '2026-08-18', promiseAmt: 8000, status: '已履约', result: 'KP', creator: '王雷', actualTime: '2026-08-16', note: '已部分还款', actionId: 'ACT-101' }],
    ptpAgreement: [],
    actions: [
      { id: 'ACT-101', rec: '外呼接通，客户承诺部分还款', who: '王雷', time: '2026-08-15 10:12', channel: '外呼', recording: true, ptpId: 'PTP-101' },
      { id: 'ACT-102', rec: '委外机构回传催收记录', who: 'AG-01', time: '2026-08-20 15:00', channel: '外呼', recording: false, ptpId: '' },
    ],
    contacts: [
      { rel: '本人', name: '赵*强', type: '手机', tel: '138****2211', status: '有效', isNew: false },
      { rel: '紧急联系人', name: '赵*母', type: '手机', tel: '135****6688', status: '有效', isNew: false },
      { rel: '工作单位', name: '—', type: '单位电话', tel: '0571****1024', status: '有效', isNew: true },
    ],
  },
  'CO-202608-003': {
    repays: [{ id: 'R-301', amt: 3000, principalPart: 3000, penaltyPart: 0, time: '2026-08-18', operator: '周敏', source: '系统自动代扣', kp: false }],
    ptpOral: [{ id: 'PTP-301', promiseTime: '2026-08-27', dueTime: '2026-08-30', promiseAmt: 3800, status: '待履约', result: '-', creator: '周敏', actualTime: '', note: '月底发工资后还清', actionId: 'ACT-301' }],
    ptpAgreement: [],
    actions: [{ id: 'ACT-301', rec: '客户承诺月底还清', who: '周敏', time: '2026-08-24 11:20', channel: '外呼', recording: true, ptpId: 'PTP-301' }],
    contacts: [{ rel: '本人', name: '刘*梅', type: '手机', tel: '137****5566', status: '有效', isNew: false }],
  },
  'CO-202608-004': {
    repays: [{ id: 'R-401', amt: 1000, principalPart: 1000, penaltyPart: 0, time: '2026-08-16', operator: '郑浩', source: '系统自动代扣', kp: false }],
    ptpOral: [],
    ptpAgreement: [{ id: 'AGP-401', signTime: '2026-08-24', promiseTime: '2026-08-30', dueTime: '2026-10-30', amt: 3500, status: '生效中', result: 'KP', creator: '郑浩', actualTime: '', note: '二次分期 6 期，每期约 600 元', actionId: 'ACT-401' }],
    actions: [
      { id: 'ACT-401', rec: 'AI 外呼接通，客户同意分期方案，等待坐席确认', who: 'AI机器人', time: '2026-08-22 11:02', channel: '外呼', recording: true, ptpId: '' },
      { id: 'ACT-402', rec: '坐席确认分期方案并录入系统', who: '郑浩', time: '2026-08-24 15:30', channel: '外呼', recording: true, ptpId: '' },
    ],
    contacts: [{ rel: '本人', name: '孙*磊', type: '手机', tel: '135****7788', status: '有效', isNew: false }],
  },
}
export const zzDetailOf = (id: string): ZzCaseDetailData => ZZ_CASE_DETAIL[id] ?? ZZ_DETAIL_DEF

/* —— 列表页：计算某案件当前生效 PTP —— */
export function zzActivePtp(id: string): { kind: 'pending' | 'broken' | 'none'; text: string } {
  const d = zzDetailOf(id)
  const pend: { dueTime: string; amt: number }[] = [
    ...d.ptpOral.filter((p) => p.status === '待履约').map((p) => ({ dueTime: p.dueTime, amt: p.promiseAmt })),
    ...d.ptpAgreement.filter((p) => p.status === '生效中').map((p) => ({ dueTime: p.dueTime, amt: p.amt })),
  ]
  if (pend.length) {
    pend.sort((a, b) => a.dueTime.localeCompare(b.dueTime))
    const p = pend[0]
    return { kind: 'pending', text: (p.dueTime || '').slice(5) + ' 待还' + money(p.amt) }
  }
  if (d.ptpOral.some((p) => p.status === '已失约')) return { kind: 'broken', text: 'BP破约' }
  return { kind: 'none', text: '—' }
}

/* —— 案件按钮权限：返回每个按钮的显示/可用状态 —— */
export type ZzBtnState = 'show' | 'disabled' | 'hide'
export function zzCaseButtons(status: string, role: string): Record<string, ZzBtnState> {
  const mgmt = canOfflineRepay(role) // 资金/结案类操作需管理权限
  const closed = ['已结清', '核销', '诉讼结案'].includes(status)
  const inCollect = ['催收中', '承诺还款', '待分案', '委外'].includes(status)
  const base: Record<string, ZzBtnState> = {
    还款登记: closed ? 'disabled' : mgmt ? 'show' : 'hide',
    减免申请: (closed || !mgmt) ? 'disabled' : 'show',
    案件转移: closed ? 'disabled' : 'show',
    暂停恢复: closed ? 'disabled' : 'show',
    转外包核销: (closed || !mgmt) ? 'disabled' : 'show',
    登记PTP: closed ? 'hide' : 'show',
    导出: 'show',
    操作日志: 'show',
    查看结案快照: closed ? 'show' : 'hide',
  }
  return base
}

/* ============================ 模块2 策略引擎 ============================ */
export interface ZzStrategy { id: string; name: string; stageRange: string; enabled: boolean; version: string; created: string }
export interface ZzStrategy { id: string; group: ZzStrategyGroup; name: string; stageRange: string; enabled: boolean; version: string; created: string; flow: { id: string; title: string; desc: string; condition?: string; next?: string }[] }
export const ZZ_STRATEGIES: ZzStrategy[] = [
  // —— 分案策略 ——
  { id: 'st-alloc-1', group: '分案策略', name: '新案智能分案', stageRange: '所有', enabled: true, version: 'v2.0', created: '2026-07-10', flow: [
    { id: 'n1', title: '导入案件', desc: '每日 02:00 从核心系统同步新逾期案件', next: 'n2' },
    { id: 'n2', title: '额度/产品识别', desc: '按产品线与逾期金额分段', condition: '信用卡≤5万 / 个贷5-50万 / 大额≥50万', next: 'n3' },
    { id: 'n3', title: '画像匹配', desc: '匹配客户风险标签与历史还款行为', next: 'n4' },
    { id: 'n4', title: '分配队列', desc: '自动分配至对应催收组（AI/短信/人工）', condition: '低风险→AI外呼；中风险→人工；高风险→重点组', next: 'n5' },
    { id: 'n5', title: '进入催收流程', desc: '按 M 阶段触发对应策略', next: 'n6' },
    { id: 'n6', title: '合规校验', desc: '命中禁呼时段/敏感客户则挂起', condition: '22:00–08:00 禁呼；投诉客户转人工' },
  ]},
  { id: 'st-alloc-2', group: '分案策略', name: '续案/回退分案', stageRange: '所有', enabled: true, version: 'v1.8', created: '2026-06-01', flow: [
    { id: 'n1', title: 'PTP 到期检测', desc: 'T+1 检测承诺还款是否到账', condition: '未到账→失约复催', next: 'n2' },
    { id: 'n2', title: '失约复催', desc: '回升级为一催或二催队列', next: 'n3' },
    { id: 'n3', title: '回退分流', desc: '多次失约→委外候选池', condition: '失约≥2 次' },
  ]},
  // —— AI 外呼 ——
  { id: 'st-m0', group: 'AI外呼', name: 'M0 还款提醒策略', stageRange: 'M0', enabled: true, version: 'v3.2', created: '2026-07-01', flow: [
    { id: 'n1', title: '触发条件', desc: '逾期 1–3 天、无有效还款', condition: 'T+1 自动发起', next: 'n2' },
    { id: 'n2', title: 'AI 外呼', desc: '播放还款提醒 + 智能问答', condition: '接通且确认还款→记录', next: 'n3' },
    { id: 'n3', title: '意向识别', desc: 'NLP 识别还款意向/金额/日期', next: 'n4' },
    { id: 'n4', title: '生成 PTP', desc: '自动回填承诺还款计划', condition: '有意向→生成PTP；无意向→转人工', next: 'n5' },
    { id: 'n5', title: '合规校验', desc: '22:00–08:00 禁呼、敏感词拦截', condition: '命中→挂起次日再呼' },
  ]},
  { id: 'st-m1', group: 'AI外呼', name: 'M1 短信+外呼策略', stageRange: 'M1', enabled: true, version: 'v2.8', created: '2026-06-18', flow: [
    { id: 'n1', title: '先发短信', desc: '逾期 4–30 天发送还款提醒短信', next: 'n2' },
    { id: 'n2', title: 'AI 外呼跟进', desc: '短信未响应则 24h 后外呼', condition: '每客户≤2次/日', next: 'n3' },
    { id: 'n3', title: '接通判别', desc: '接通→意向识别；未接→重呼间隔4h', condition: '接通后不再重呼', next: 'n4' },
    { id:  'n4', title: '重催/转人工', desc: '无意向→转人工重点跟进', condition: '拒绝/失联→升级' },
  ]},
  { id: 'st-m2', group: 'AI外呼', name: 'M2 外呼+函件策略', stageRange: 'M2', enabled: true, version: 'v4.1', created: '2026-07-22', flow: [
    { id: 'n1', title: '外呼触达', desc: '逾期 31–90 天高频催收', condition: '≤2次/日，间隔≥4h', next: 'n2' },
    { id: 'n2', title: '纸质函件', desc: '同步寄送《逾期催收函》', next: 'n3' },
    { id: 'n3', title: '协商方案', desc: '提供分期/减免方案建议', next: 'n4' },
    { id: 'n4', title: '升级判定', desc: '仍失联→委外候选；有恶意→诉讼候选', condition: '失联≥3次 或 疑似欺诈' },
  ]},
  // —— 委外 ——
  { id: 'st-outs-1', group: '委外', name: '委外移交流程', stageRange: 'M3+', enabled: true, version: 'v2.2', created: '2026-04-15', flow: [
    { id: 'n1', title: '委外条件', desc: '逾期≥90天、自主催收无效', condition: '失约≥2或恶意拖欠', next: 'n2' },
    { id: 'n2', title: '匹配机构', desc: '按区域/金额匹配委外机构', next: 'n3' },
    { id: 'n3', title: '数据脱敏移交', desc: '仅移交必要催收字段', next: 'n4' },
    { id: 'n4', title: '回传监控', desc: '机构每日回传催收结果', condition: '回款→分账；长期无果→诉讼候选' },
  ]},
  { id: 'st-outs-2', group: '委外', name: '委外回款分账', stageRange: '委外', enabled: true, version: 'v1.0', created: '2026-05-01', flow: [
    { id: 'n1', title: '回传接收', desc: '解析机构回传 CSV/接口', next: 'n2' },
    { id: 'n2', title: '对账校验', desc: '金额与案件匹配校验', next: 'n3' },
    { id: 'n3', title: '佣金结算', desc: '按约定比例自动分账' },
  ]},
  // —— 诉讼 ——
  { id: 'st-legal-1', group: '诉讼', name: '诉讼立案策略', stageRange: 'M3+', enabled: false, version: 'v1.5', created: '2026-05-09', flow: [
    { id: 'n1', title: '诉讼条件', desc: '大额/恶意拖欠、委外无效', condition: '本金≥5万 或 失联≥60天', next: 'n2' },
    { id: 'n2', title: '证据打包', desc: '合同+通话+催收记录归档', next: 'n3' },
    { id: 'n3', title: '批量立案', desc: '对接法院批量立案通道', next: 'n4' },
    { id: 'n4', title: '判决跟进', desc: '判决后进入执行/冻结', condition: '胜诉→执行；败诉→核销候选' },
  ]},
  { id: 'st-legal-2', group: '诉讼', name: '核销处置策略', stageRange: '执行后', enabled: false, version: 'v1.0', created: '2026-03-20', flow: [
    { id: 'n1', title: '核销条件', desc: '执行无财产且超账龄', next: 'n2' },
    { id: 'n2', title: '内部审批', desc: '三级审批后核销', condition: '合规留存证据链' },
  ]},
  // —— 图谱分流 ——
  { id: 'st-graph-1', group: '图谱分流', name: '失联修复分流', stageRange: '所有', enabled: true, version: 'v1.3', created: '2026-06-25', flow: [
    { id: 'n1', title: '构建图谱', desc:  '聚合联系人/同址/同设备关系', next: 'n2' },
    { id: 'n2', title: '可达性评分', desc: '计算联系人可达概率', condition: '高→优先外呼联系人', next: 'n3' },
    { id: 'n3', title: '团伙识别', desc: '识别逾期团伙网络', condition: '核心成员→重点催收' },
  ]},
  { id: 'st-graph-2', group: '图谱分流', name: '欺诈识别分流', stageRange: '所有', enabled: true, version: 'v1.1', created: '2026-07-05', flow: [
    { id: 'n1', title: '异常检测', desc: '多头借贷/设备聚集检测', next: 'n2' },
    { id: 'n2', title: '风险标记', desc: '标记欺诈嫌疑案件', condition: '高→转法务/公安联动' },
  ]},
]
export interface ZzStrategyVersion { id: string; version: string; editor: string; time: string; note: string; summary: string }
// 版本归属某一条策略（id 过滤）；summary 用于版本对比弹窗展示画布配置概要
export const ZZ_STRATEGY_VERSIONS: ZzStrategyVersion[] = [
  { id: 'st-m0', version: 'v3.2', editor: '周敏', time: '2026-07-01', note: '优化还款提醒话术', summary: '节点 5 · 分支 1 · 合规:22点禁呼' },
  { id: 'st-m0', version: 'v3.1', editor: '李娜', time: '2026-05-20', note: '灰度发布', summary: '节点 5 · 分支 1 · 合规:22点禁呼' },
  { id: 'st-m1', version: 'v2.8', editor: '周敏', time: '2026-06-18', note: '调整短信模板', summary: '节点 6 · 分支 2 · 合规:22点禁呼' },
  { id: 'st-m1', version: 'v2.6', editor: '李娜', time: '2026-04-10', note: '新增外呼节点', summary: '节点 5 · 分支 2 · 合规:22点禁呼' },
  { id: 'st-m2', version: 'v4.1', editor: '周敏', time: '2026-07-22', note: '调整 M2 外呼频次上限至 2 次/日', summary: '节点 7 · 分支 2 · 合规:22点禁呼' },
  { id: 'st-m2', version: 'v4.0', editor: '周敏', time: '2026-06-30', note: '新增函件节点', summary: '节点 6 · 分支 2 · 合规:22点禁呼' },
  { id: 'st-m2', version: 'v3.6', editor: '李娜', time: '2026-05-15', note: '灰度发布', summary: '节点 6 · 分支 2 · 合规:22点禁呼' },
  { id: 'st-m3', version: 'v1.5', editor: '陈强', time: '2026-05-09', note: '接入法诉节点', summary: '节点 8 · 分支 3 · 合规:22点禁呼' },
  { id: 'st-m3', version: 'v1.4', editor: '陈强', time: '2026-03-02', note: '委外节点上线', summary: '节点 7 · 分支 3 · 合规:22点禁呼' },
]
// 策略分组（覆盖催收全部策略类型，不只 AI 外呼）
export const ZZ_STRATEGY_GROUPS = ['分案策略', 'AI外呼', '短信', '委外', '诉讼', '图谱分流'] as const
export type ZzStrategyGroup = (typeof ZZ_STRATEGY_GROUPS)[number]

// 分流执行明细：每条策略分支实际跑出的业务结果（覆盖全策略类型）
// allocate：实际分配去向；ptp 达成数；repay 回款金额(元)；lostRate 失联占比(%)
export interface ZzExecRow {
  sid: string
  branch: string          // 策略分支名称
  group: ZzStrategyGroup  // 所属策略分组
  inflow: number          // 流入案件数
  allocate: ('AI外呼' | '短信' | '人工' | '委外' | '诉讼' | '直接拦截')[]
  ptp: number             // PTP 达成数
  repay: number           // 回款金额(元)
  lostRate: number        // 失联占比(%)
}
export const ZZ_STRATEGY_EXEC: ZzExecRow[] = [
  { sid: 'st-m0', branch: '账龄 M0 · 智能分案', group: '分案策略', inflow: 1024, allocate: ['短信', 'AI外呼'], ptp: 218, repay: 184500, lostRate: 11 },
  { sid: 'st-m1', branch: '账龄 M1 · 智能分案', group: '分案策略', inflow: 528, allocate: ['AI外呼', '人工'], ptp: 132, repay: 386200, lostRate: 17 },
  { sid: 'st-m2', branch: '金额≥5万 · 外呼分支', group: 'AI外呼', inflow: 96, allocate: ['AI外呼'], ptp: 41, repay: 521000, lostRate: 9 },
  { sid: 'st-m2', branch: '标签-失联 · 外呼分支', group: 'AI外呼', inflow: 41, allocate: ['AI外呼'], ptp: 8, repay: 32000, lostRate: 38 },
  { sid: 'st-m2', branch: '账龄 M2 · 函件分支', group: '短信', inflow: 312, allocate: ['短信'], ptp: 60, repay: 78000, lostRate: 13 },
  { sid: 'st-m3', branch: '账龄 M3+ · 委外分支', group: '委外', inflow: 73, allocate: ['委外'], ptp: 12, repay: 156000, lostRate: 22 },
  { sid: 'st-m3', branch: '金额≥20万 · 诉讼分支', group: '诉讼', inflow: 29, allocate: ['诉讼'], ptp: 5, repay: 280000, lostRate: 8 },
  { sid: 'st-m2', branch: '图谱-核心成员 · 升级分支', group: '图谱分流', inflow: 37, allocate: ['人工', '委外'], ptp: 15, repay: 94000, lostRate: 6 },
]

export interface ZzStrategyException { time: string; sid: string; strategy: string; type: string; affected: number; msg: string }
export const ZZ_STRATEGY_EXCEPTIONS: ZzStrategyException[] = [
  { time: '2026-08-24 09:12', sid: 'st-m2', strategy: 'M2 外呼+函件策略', type: '产能不足', affected: 3, msg: '坐席组 催收二组 产能不足，3 件超时回收' },
  { time: '2026-08-24 11:40', sid: 'st-m1', strategy: 'M1 短信+外呼策略', type: '接口延迟', affected: 26, msg: '短信网关延迟 12s，部分批次延后发送' },
  { time: '2026-08-23 22:05', sid: 'st-m3', strategy: 'M3+ 委外+法诉策略', type: '接口超时', affected: 1, msg: '法诉节点调用司法接口超时 1 次' },
  { time: '2026-08-22 14:30', sid: 'st-m0', strategy: 'M0 还款提醒策略', type: '数据缺失', affected: 58, msg: '139 件案件缺失联系人号码，无法触达' },
  { time: '2026-08-21 10:08', sid: 'st-m2', strategy: 'M2 外呼+函件策略', type: '规则跳过', affected: 14, msg: '命中黑名单规则，14 件被直接拦截跳过' },
]

// 图谱因子实际运行结果：命中案件分布与实际分流去向
export interface ZzGraphRun { tag: string; desc: string; hit: number; toFlow: string; color: string }
export const ZZ_GRAPH_RUNS: ZzGraphRun[] = [
  { tag: '关联逾期密度', desc: '客户周边逾期关联人越多，风险越高', hit: 642, toFlow: '密度高 → 提前拦截、重点跟进', color: '#DC2626' },
  { tag: '关联联系人数量', desc: '合法可触达关联线索数量', hit: 1180, toFlow: '线索多 → 优先人工精准催收', color: '#1677ff' },
  { tag: '团伙成员等级', desc: '在逾期团伙网络中的角色（核心/普通）', hit: 215, toFlow: '核心成员 → 升级法务 / 重点催收', color: '#D97706' },
  { tag: '失联修复概率', desc: '图谱计算的可达性得分', hit: 326, toFlow: '概率低 → 自动 AI 外呼 + 委外', color: '#16A34A' },
]

/* ============================ 模块3 坐席工作台 ============================ */
export const ZZ_AGENT_STAT = { todo: 18, doneToday: 12, connected: 34, promised: 7, follow: 5 }

/* —— 我的案件池：案件列表行（坐席名下） —— */
export type ZzCaseStatus = '待跟进' | '承诺到期' | '协商中' | '待回款'
export interface ZzAgentCase {
  id: string; name: string; idno: string; phone: string; contract: string
  total: number; stage: string; overdueDays: number
  principal: number; interest: number; penalty: number
  promise: string; promiseDue: string; lastNote: string
  tags: string[]; status: ZzCaseStatus; aiCalled: boolean; archived?: boolean
}
export const ZZ_AGENT_POOL: ZzAgentCase[] = [
  { id: 'CO-202608-002', name: '张*明', idno: '4401**********5678', phone: '139****3344', contract: 'HT-2025-0923', total: 42000, stage: 'M2', overdueDays: 60, principal: 40000, interest: 1260, penalty: 2000, promise: '2026-08-28', promiseDue: '2026-08-28', lastNote: '承诺还款 2 万', tags: ['📝有还款承诺', '🤖AI已外呼'], status: '承诺到期', aiCalled: true },
  { id: 'CO-202608-003', name: '刘*梅', idno: '5101**********9012', phone: '137****5566', contract: 'HT-2026-0115', total: 6800, stage: 'M1', overdueDays: 20, principal: 6500, interest: 130, penalty: 300, promise: '2026-08-27', promiseDue: '2026-08-27', lastNote: '月底发工资后还款', tags: ['📝有还款承诺', '🤖AI已外呼'], status: '待回款', aiCalled: true },
  { id: 'CO-202608-004', name: '孙*磊', idno: '3201**********3456', phone: '135****7788', contract: 'HT-2026-0208', total: 3500, stage: 'M1', overdueDays: 15, principal: 3400, interest: 60, penalty: 100, promise: '-', promiseDue: '', lastNote: '已确认分期方案', tags: ['🤝已协商方案', '🤖AI已外呼'], status: '协商中', aiCalled: true },
  { id: 'CO-202608-007', name: '冯*军', idno: '3701**********3344', phone: '139****5566', contract: 'HT-2025-1102', total: 15000, stage: 'M2', overdueDays: 65, principal: 14500, interest: 320, penalty: 500, promise: '-', promiseDue: '', lastNote: '多次外呼未接通', tags: ['❌多次未接通', '失联'], status: '待跟进', aiCalled: true },
  { id: 'CO-202608-001', name: '王*芳', idno: '4201**********7788', phone: '138****9900', contract: 'HT-2025-0612', total: 12000, stage: 'M1', overdueDays: 42, principal: 11500, interest: 280, penalty: 420, promise: '2026-07-30', promiseDue: '2026-07-30', lastNote: '已全额结清并归档', tags: ['📦已归档'], status: '已归档', aiCalled: true, archived: true },
]

/* —— 自动策略执行日志：策略画布产出（AI机器人/短信/分配人工），坐席工作台只读查看 —— */
export interface ZzAiLog { time: string; action: 'AI外呼' | '催收短信' | '分配人工'; result: string; recording: boolean }
export const ZZ_AGENT_AI_LOG: Record<string, ZzAiLog[]> = {
  'CO-202608-001': [
    { time: '2026-07-20 10:00', action: 'AI外呼', result: '接通 · 客户确认 7 月底全额结清', recording: true },
    { time: '2026-07-20 10:05', action: '催收短信', result: '已发送结清提醒短信', recording: false },
    { time: '2026-07-30 18:00', action: 'AI外呼', result: '接通 · 确认已还款 12000 元，案件结案', recording: true },
  ],
  'CO-202608-002': [
    { time: '2026-08-22 09:00', action: 'AI外呼', result: '接通 · 客户表示资金紧张，需要时间筹款', recording: true },
    { time: '2026-08-22 09:05', action: '催收短信', result: '已发送还款提醒短信', recording: false },
    { time: '2026-08-22 09:10', action: '分配人工', result: '分配至 坐席 李娜（催收二组）', recording: false },
  ],
  'CO-202608-003': [
    { time: '2026-08-22 10:00', action: 'AI外呼', result: '接通 · 客户承诺月底发工资后还款', recording: true },
    { time: '2026-08-22 10:02', action: '催收短信', result: '已发送还款提醒短信', recording: false },
    { time: '2026-08-22 10:05', action: '分配人工', result: '分配至 坐席 周敏（催收一组）', recording: false },
  ],
  'CO-202608-004': [
    { time: '2026-08-22 11:00', action: 'AI外呼', result: '接通 · 客户提出分期还款意愿', recording: true },
    { time: '2026-08-22 11:02', action: '催收短信', result: '已发送还款提醒短信', recording: false },
    { time: '2026-08-22 11:05', action: '分配人工', result: '分配至 坐席 郑浩（催收一组）', recording: false },
  ],
  'CO-202608-007': [
    { time: '2026-08-22 14:00', action: 'AI外呼', result: '未接通（无人接听）', recording: false },
    { time: '2026-08-22 15:00', action: 'AI外呼', result: '未接通（被拒接）', recording: false },
    { time: '2026-08-22 15:05', action: '催收短信', result: '已发送还款提醒短信', recording: false },
    { time: '2026-08-22 15:10', action: '分配人工', result: '分配至 坐席 李娜（催收二组）', recording: false },
  ],
}
export const zzAiLogOf = (id: string): ZzAiLog[] => ZZ_AGENT_AI_LOG[id] ?? []

/* —— 案件历史流转：策略画布 → AI 节点 → 分配人工 → 案件池 —— */
export interface ZzFlow { time: string; node: string; detail: string }
export const ZZ_AGENT_FLOW: Record<string, ZzFlow[]> = {
  'CO-202608-002': [
    { time: '2026-08-22 08:50', node: '策略触发', detail: '「M2 外呼+函件策略」命中逾期 60 天规则' },
    { time: '2026-08-22 09:00', node: 'AI外呼节点', detail: 'AI 机器人拨打 2 次（接通 1 次）' },
    { time: '2026-08-22 09:05', node: '短信节点', detail: '发送催收提醒短信' },
    { time: '2026-08-22 09:10', node: '分配人工', detail: '自动流转至 坐席 李娜（催收二组）' },
    { time: '2026-08-23 09:00', node: '进入案件池', detail: '流入坐席工作台「我的案件池」' },
  ],
  'CO-202608-003': [
    { time: '2026-08-22 09:40', node: '策略触发', detail: '「M1 短信+外呼策略」命中逾期 20 天规则' },
    { time: '2026-08-22 10:00', node: 'AI外呼节点', detail: 'AI 机器人拨打 1 次（接通）' },
    { time: '2026-08-22 10:02', node: '短信节点', detail: '发送还款提醒短信' },
    { time: '2026-08-22 10:05', node: '分配人工', detail: '自动流转至 坐席 周敏（催收一组）' },
    { time: '2026-08-23 09:00', node: '进入案件池', detail: '流入坐席工作台「我的案件池」' },
  ],
  'CO-202608-004': [
    { time: '2026-08-22 10:40', node: '策略触发', detail: '「M1 短信+外呼策略」命中逾期 15 天规则' },
    { time: '2026-08-22 11:00', node: 'AI外呼节点', detail: 'AI 机器人拨打 1 次（接通，意向分期）' },
    { time: '2026-08-22 11:02', node: '短信节点', detail: '发送还款提醒短信' },
    { time: '2026-08-22 11:05', node: '分配人工', detail: '自动流转至 坐席 郑浩（催收一组）' },
    { time: '2026-08-23 09:00', node: '进入案件池', detail: '流入坐席工作台「我的案件池」' },
  ],
  'CO-202608-007': [
    { time: '2026-08-22 13:40', node: '策略触发', detail: '「M2 外呼+函件策略」命中逾期 65 天规则' },
    { time: '2026-08-22 14:00', node: 'AI外呼节点', detail: 'AI 机器人拨打 2 次（均未接通）' },
    { time: '2026-08-22 15:05', node: '短信节点', detail: '发送催收提醒短信' },
    { time: '2026-08-22 15:10', node: '分配人工', detail: '自动流转至 坐席 李娜（催收二组）' },
    { time: '2026-08-23 09:00', node: '进入案件池', detail: '流入坐席工作台「我的案件池」' },
  ],
}
export const zzFlowOf = (id: string): ZzFlow[] => ZZ_AGENT_FLOW[id] ?? []

/* —— 本次通话实时转录（模拟流式输出） —— */
export const ZZ_AGENT_TRANSCRIPT: Record<string, string[]> = {
  'CO-202608-002': [
    '坐席：张先生您好，我是 XX 金融的催收专员，方便讲话吗？',
    '客户：您好，方便，我最近确实资金比较紧张。',
    '坐席：理解，您看今天之前承诺的 2 万元什么时候能到账？',
    '客户：要等到 28 号工资到账，我可以先转 1 万。',
    '坐席：好的，那我们先确认 28 号前至少还 1 万，剩余部分再安排分期？',
    '客户：可以，我尽量 28 号一起还清。',
  ],
  'CO-202608-003': [
    '坐席：刘女士您好，XX 金融催收，您的账单已逾期 20 天。',
    '客户：我知道，月底发工资我就还。',
    '坐席：月底是哪一天？需要我帮您登记一个具体日期吗？',
    '客户：8 月 27 号发工资，当天就还。',
  ],
  'CO-202608-004': [
    '坐席：孙先生您好，您之前申请的二次分期方案确认了吗？',
    '客户：确认了，6 期每期 600 元可以接受。',
    '坐席：好的，那我帮您把方案提交生效，首期在 8 月 30 日前还款。',
  ],
  'CO-202608-007': [
    '坐席：冯先生您好，XX 金融催收专员，关于您逾期账单……',
    '（无人应答）',
    '坐席：喂？冯先生？……（持续呼叫 15 秒）',
  ],
}
export const zzTranscriptOf = (id: string): string[] => ZZ_AGENT_TRANSCRIPT[id] ?? []

/* —— 本次通话目标：按优先级从多源推导（承诺到期/失联/协商/状态/阶段策略） ——
   行业对应：催收/呼叫中心「通话目的 / Call Objective」——外呼任务的目标前置推导。
   来源优先级：①还款承诺到期核验 ②联系状态(失联) ③协商方案 ④案件状态 ⑤阶段策略(账龄) */
export type ZzObjective = { title: string; source: string; reason: string; action: string; level: 'high' | 'mid' | 'low' }
export function zzCallObjective(cs: ZzAgentCase, ptps: { date: string; status: string }[]): ZzObjective {
  const today = new Date().toISOString().slice(0, 10)
  // 来源1：还款承诺（最优先，到期/逾期需核实到账）
  if (cs.promise !== '-' && cs.promiseDue) {
    if (cs.promiseDue < today) return { title: '核实承诺还款是否到账，未到账按失约复催', source: '还款承诺 · 已逾期', reason: `客户曾承诺于 ${cs.promiseDue} 还款，该承诺日已逾期，需核实是否到账`, action: '查询到账记录；未到账则重申违约后果并安排二次承诺/转人工', level: 'high' }
    if (cs.promiseDue === today) return { title: '确认今日承诺还款是否按时到账', source: '还款承诺 · 今日到期', reason: `客户承诺于今日（${cs.promiseDue}）还款，需确认是否按时到账`, action: '优先查询到账；已还则登记履约，未还则当日跟进提醒', level: 'high' }
    return { title: '跟进承诺还款，确认资金安排与到账计划', source: '还款承诺 · 未到期', reason: `客户承诺于 ${cs.promiseDue} 还款，尚未到期，提前确认资金安排`, action: '核实资金安排，强化履约预期，必要时预登记', level: 'mid' }
  }
  // 来源2：联系状态（失联/多次未接通）
  if (cs.tags.includes('失联') || cs.tags.includes('❌多次未接通')) return { title: '失联修复：更换时段/紧急联系人/函件触达', source: '联系状态 · 失联', reason: cs.tags.includes('❌多次未接通') ? 'AI 多次外呼未接通，常规号码不可达' : '标记为失联，常规号码不可达', action: '更换拨打时段；联系紧急联系人/单位电话；发送函件并记录可达性', level: 'high' }
  // 来源3：协商方案
  if (cs.status === '协商中' || cs.tags.includes('🤝已协商方案')) return { title: '确认分期/延期方案，引导客户签字生效', source: '协商方案', reason: '已达成方案意向，待客户确认生效', action: '复述方案条款；确认首期与期数；提交生效', level: 'mid' }
  // 来源4：案件状态
  if (cs.status === '承诺到期') return { title: '催收本次承诺，确认到账或重申承诺', source: '案件状态 · 承诺到期', reason: '案件处于承诺到期阶段', action: '查询到账；未到账则重申承诺并登记', level: 'mid' }
  if (cs.status === '待回款') return { title: '跟进回款，确认还款到账', source: '案件状态 · 待回款', reason: '已有承诺/方案，等待资金到账', action: '确认到账记录；未到账则催办', level: 'mid' }
  // 来源5：阶段策略（账龄驱动，默认/待跟进）
  const stageGoal: Record<string, string> = { 'M1': '温和提醒，确认还款意愿，推动首次承诺', 'M2': '施压+提供分期方案，确认可负担金额', 'M3+': '预警委外/法诉，确认还款或协商兜底' }
  return { title: '建立联系，确认还款意愿与可负担金额', source: `阶段策略 · ${cs.stage}`, reason: `账龄 ${cs.stage}，逾期 ${cs.overdueDays} 天，待跟进`, action: stageGoal[cs.stage] ?? '建立联系，了解还款能力与意向', level: 'low' }
}

/* —— 话术参考：依据本次通话目标来源/层级，给出坐席可参考的催收脚本 ——
   对应行业「话术库 / 合规话术」实践：分场景（承诺到期/失联/协商/账龄分层）提供开场、核实、引导、施压模板。 */
export type ZzScript = { scenario: string; lines: string[] }
export function zzScriptRef(obj: ZzObjective): ZzScript[] {
  const s = obj.source
  const high = obj.level === 'high'
  const base: ZzScript[] = [
    { scenario: '开场白（通用）', lines: [
      '您好，请问是 {客户} 先生/女士吗？我是 XX 金融的贷后客服专员，工号 {工号}，来电与您核对一下账户还款事宜，方便讲话吗？',
      '本次通话会全程录音，用于核实还款安排与留存凭证，请您知悉。',
    ] },
  ]
  let specific: ZzScript[] = []
  if (s.includes('今日到期') || s.includes('已逾期') || s.includes('承诺到期')) {
    specific = [
      { scenario: '核实承诺到账', lines: [
        '您此前承诺于 {承诺日} 还款 {金额}，今天我来帮您确认一下是否已经到账。',
        '若已还款请您提供转账凭证/交易流水，我同步为您登记履约；若尚未到账，我们确认一下具体到账时间。',
      ] },
      { scenario: '未到账·复催', lines: [
        '承诺未到账会影响您的信用记录，并产生相应违约金，建议今天优先安排处理。',
        '确认一下：今天能先还多少？剩余部分我们重新约定一个具体日期，我为您登记。',
      ] },
    ]
  } else if (s.includes('未到期')) {
    specific = [
      { scenario: '跟进承诺安排', lines: [
        '您承诺于 {承诺日} 还款 {金额}，我提前跟您确认下资金安排是否就绪。',
        '若临时有变动请尽早告诉我，我们一起调整方案，避免走到违约环节。',
      ] },
    ]
  } else if (s.includes('失联')) {
    specific = [
      { scenario: '失联修复触达', lines: [
        '本次多次拨打未接通，为不耽误您的还款安排，我尝试联系您预留的紧急联系人/单位电话。',
        '若号码变更，请通过官方 APP/客服热线更新，确保后续通知可送达。',
        '您也可主动回拨官方客服热线，说明当前情况并约定还款时间。',
      ] },
    ]
  } else if (s.includes('协商')) {
    specific = [
      { scenario: '协商方案引导', lines: [
        '您此前申请的 {方案} 我们已为您保留，今天确认一下条款：共 {期数} 期，每期 {每期金额}，首期 {首期日}。',
        '确认无误我为您提交生效；生效后请务必按约还款，再次逾期将按协议转交处理。',
      ] },
    ]
  } else if (s.includes('待回款')) {
    specific = [
      { scenario: '跟进回款', lines: [
        '您的还款方案已在执行中，我帮您确认本期是否已到账。',
        '到账后系统会自动更新状态；若遇延迟，请保留凭证，我为您备注。',
      ] },
    ]
  } else if (s.includes('M1')) {
    specific = [
      { scenario: 'M1 温和提醒', lines: [
        '温馨提示，您的账单已逾期 {天数} 天，金额 {金额}，建议尽快处理以免影响征信。',
        '目前还在早期阶段，您看今天方便先还一部分或全额结清吗？',
      ] },
    ]
  } else if (s.includes('M2')) {
    specific = [
      { scenario: 'M2 施压+分期', lines: [
        '逾期已进入第 2 阶段，持续拖欠会产生更多违约金并影响征信。',
        '如果一次性还款有压力，我可以为您申请分期方案，您看每月可承受多少？',
      ] },
    ]
  } else if (s.includes('M3')) {
    specific = [
      { scenario: 'M3+ 法诉预警', lines: [
        '逾期已超过 90 天，按合同约定后续可能移交委外或启动司法程序。',
        '这是最后协商窗口，今天确认还款或分期方案可避免进一步流程。',
      ] },
    ]
  }
  const scripts = [...base, ...specific]
  if (high) {
    scripts.push({ scenario: '⚠ 合规红线（高优先级案件必读）', lines: [
      '严禁使用威胁、侮辱、骚扰第三方等违规话术；每日外呼不超过合规上限。',
      '仅与本人或经授权的联系人沟通，不得向无关第三方透露债务细节。',
      '不得承诺减免/豁免超出权限的方案，所有约定以系统登记为准。',
    ] })
  }
  return scripts
}

/* ============================ 坐席录入的还款承诺 / 协商方案（与「案件详情页」共享、双向同步） ============================
   统一数据结构：坐席工作台 Tab2 录入与案件详情页 PTP 记录使用同一份内存存储，避免两处结构不一致、互不同步。
   字段对齐案件详情页：口头PTP（promiseTime/dueTime/promiseAmt/status/creator）→ 这里用 date=承诺&到期日, amt, status, note；
   正式协议（signTime/promiseTime/dueTime/amt/status）→ 这里用 type/terms/perAmt/firstDue/status。 */
export type AgentPtp = { id: string; date: string; amt: number; type: string; status: '待履约' | '已履约' | '已失信'; note: string; callId?: string }
export type AgentNego = { id: string; type: string; terms: number; perAmt: number; firstDue: string; status: '待确认' | '已生效' | '已失效'; note: string; callId?: string }
export const ZZ_AGENT_PTP: Record<string, AgentPtp[]> = {}
export const ZZ_AGENT_NEGO: Record<string, AgentNego[]> = {}

/* ============================ 模块4 委外机构 ============================ */
export interface ZzAgency {
  id: string; name: string; contact: string; phone: string
  status: '正常' | '暂停'; score: number
  license: string; licenseNo: string; scope: string; region: string
  qualified: '已备案' | '待复审' | '异常'
}
export const ZZ_AGENCIES: ZzAgency[] = [
  { id: 'AG-01', name: '华信资产管理有限公司', contact: '吴经理', phone: '021-6688****', status: '正常', score: 92, license: '经营催收业务备案', licenseNo: 'JY2023-0981', scope: '个人信贷不良委外', region: '华东', qualified: '已备案' },
  { id: 'AG-02', name: '鼎力金融服务外包', contact: '郑主任', phone: '0755-8822****', status: '正常', score: 86, license: '经营催收业务备案', licenseNo: 'JY2023-1124', scope: '个人/小微不良委外', region: '华南', qualified: '已备案' },
  { id: 'AG-03', name: '中诚催收事务中心', contact: '孙主管', phone: '010-5520****', status: '暂停', score: 71, license: '经营催收业务备案', licenseNo: 'JY2022-0456', scope: '个人信贷不良委外', region: '华北', qualified: '待复审' },
]

/* 机构子账号（数据权限隔离） */
export interface ZzAgencyAccount { agency: string; account: string; role: string; dataScope: string; menu: string; status: '启用' | '禁用' }
export const ZZ_AGENCY_ACCOUNTS: ZzAgencyAccount[] = [
  { agency: 'AG-01', account: 'huaxin_op1', role: '催员', dataScope: '仅 AG-01 案件', menu: '案件查看/催记录入', status: '启用' },
  { agency: 'AG-01', account: 'huaxin_sup', role: '督导', dataScope: '仅 AG-01 案件', menu: '全部', status: '启用' },
  { agency: 'AG-02', account: 'dingli_op2', role: '催员', dataScope: '仅 AG-02 案件', menu: '案件查看/催记录入', status: '启用' },
  { agency: 'AG-03', account: 'zhongcheng_op3', role: '催员', dataScope: '仅 AG-03 案件', menu: '案件查看/催记录入', status: '禁用' },
]

/* 待委托 / 在委案件（委托管理 + 监控共用） */
export interface ZzEntrust { id: string; name: string; total: number; to: string; due: string; entrustTime: string; status: '委外中' | '已召回' | '待委托' }
export const ZZ_ENTRUSTS: ZzEntrust[] = [
  { id: 'CO-202608-001', name: '赵*强', total: 156000, to: 'AG-01', due: '2026-11-30', entrustTime: '2026-08-20', status: '委外中' },
  { id: 'CO-202608-006', name: '钱*华', total: 89000, to: 'AG-02', due: '2026-11-15', entrustTime: '2026-08-18', status: '已召回' },
  { id: 'CO-202608-011', name: '何*东', total: 64000, to: 'AG-01', due: '2026-12-05', entrustTime: '2026-08-23', status: '委外中' },
  { id: 'CO-202608-009', name: '黄*丽', total: 52000, to: 'AG-02', due: '2026-11-20', entrustTime: '2026-08-21', status: '委外中' },
]

/* 在委案件监控 */
export const ZZ_AGENCY_MONITOR: { id: string; name: string; agency: string; entrustTime: string; due: string; status: string; feedback: string }[] = [
  { id: 'CO-202608-001', name: '赵*强', agency: 'AG-01', entrustTime: '2026-08-20', due: '2026-11-30', status: '催收中', feedback: '已外呼 3 次，客户承诺部分还款' },
  { id: 'CO-202608-011', name: '何*东', agency: 'AG-01', entrustTime: '2026-08-23', due: '2026-12-05', status: '催收中', feedback: '首次上门未遇，已短信提醒' },
  { id: 'CO-202608-009', name: '黄*丽', agency: 'AG-02', entrustTime: '2026-08-21', due: '2026-11-20', status: '协商中', feedback: '客户达成二次分期意向' },
  { id: 'CO-202608-006', name: '钱*华', agency: 'AG-02', entrustTime: '2026-08-18', due: '2026-11-15', status: '已召回', feedback: '多次无果，已召回转回内部' },
]

/* 催收回传流水（结果回传 + 案件委外详情共用） */
export interface ZzAgencyCallback {
  time: string
  caseId: string
  agency: string
  client: string
  feedback: string
  result: '有效' | '无效'
  auditBy?: string
  auditTime?: string
  auditRemark?: string
  contactStatus?: string
  workType?: string
  ptp?: '是' | '否'
  ptpTime?: string
  ptpAmount?: string
  attitude?: string
  riskTag?: string
  attachments?: { name: string; type: '录音' | '照片' | '凭证' }[]
  updatedFields?: string[]
}
export const ZZ_AGENCY_CALLBACKS: ZzAgencyCallback[] = [
  {
    time: '2026-08-24 15:00', caseId: 'CO-202608-001', agency: 'AG-01', client: '赵*强',
    feedback: '客户态度较好，表示近期资金周转后可还款，已确认分期方案。',
    result: '有效', auditBy: '审核员-李娜', auditTime: '2026-08-24 17:20',
    auditRemark: '客户提供可核实的还款计划，外访照片与通话录音一致，判定有效。',
    contactStatus: '已接通', workType: '电话催收', ptp: '是', ptpTime: '2026-08-28 前', ptpAmount: '6 万',
    attitude: '愿意协商', riskTag: '无风险',
    attachments: [{ name: '通话录音_0824.mp3', type: '录音' }, { name: '还款计划书.jpg', type: '凭证' }],
    updatedFields: ['案件状态：协商中', '新增 PTP 记录 PT-202608-088'],
  },
  {
    time: '2026-08-23 10:30', caseId: 'CO-202608-006', agency: 'AG-02', client: '钱*华',
    feedback: '多次联系无果，预留号码已停机，无法触达本人。',
    result: '无效', auditBy: '审核员-王强', auditTime: '2026-08-23 14:10',
    auditRemark: '连续 3 次回传均无有效联络，依规则判定无效，建议转内部失联修复。',
    contactStatus: '空号', workType: '电话催收', ptp: '否',
    attitude: '抗拒沟通', riskTag: '失联风险',
    attachments: [{ name: '外访照片_0823.jpg', type: '照片' }],
    updatedFields: ['失联标记：是'],
  },
  {
    time: '2026-08-24 09:15', caseId: 'CO-202608-011', agency: 'AG-01', client: '何*东',
    feedback: '首次上门未遇，已在门口留言并短信提醒。',
    result: '有效', auditBy: '审核员-李娜', auditTime: '2026-08-24 11:00',
    auditRemark: '外访照片留存完整，地址与登记一致，判定有效作业。',
    contactStatus: '外访未见到本人', workType: '上门外访', ptp: '否',
    attitude: '其他', riskTag: '无风险',
    attachments: [{ name: '外访现场_0824.jpg', type: '照片' }],
    updatedFields: ['外访记录：已外访 1 次'],
  },
  {
    time: '2026-08-24 16:40', caseId: 'CO-202608-009', agency: 'AG-02', client: '黄*丽',
    feedback: '客户达成二次分期意向，待确认协议。',
    result: '有效', auditBy: '审核员-王强', auditTime: '2026-08-24 18:05',
    auditRemark: '客户确认可分 3 期，待签署电子协议后生效。',
    contactStatus: '已接通', workType: '电话催收', ptp: '是', ptpTime: '2026-09-10 前', ptpAmount: '3 万',
    attitude: '愿意协商', riskTag: '家庭风险',
    attachments: [{ name: '沟通记录_0824.mp3', type: '录音' }],
    updatedFields: ['协商方案：分期 3 期', '新增 PTP 记录 PT-202608-091'],
  },
]

/* 机构 KPI 考核 */
export const ZZ_AGENCY_KPI = [
  { agency: 'AG-01', recoveryRate: 0.41, handled: 126, complaints: 1, violations: 0, score: 92 },
  { agency: 'AG-02', recoveryRate: 0.33, handled: 98, complaints: 3, violations: 1, score: 86 },
  { agency: 'AG-03', recoveryRate: 0.18, handled: 54, complaints: 6, violations: 4, score: 71 },
]

/* 佣金对账结算 */
export const ZZ_AGENCY_SETTLE = [
  { agency: 'AG-01', recovery: 642000, rate: 0.08, commission: 51360, status: '待确认' },
  { agency: 'AG-02', recovery: 398000, rate: 0.08, commission: 31840, status: '已结算' },
  { agency: 'AG-03', recovery: 96000, rate: 0.08, commission: 7680, status: '待确认' },
]

/* 机构人员（外催人员档案，机构人员管理 tab 使用） */
export interface ZzAgencyStaff { agency: string; name: string; role: string; cases: number; recovery: number; status: '在岗' | '休假' }
export const ZZ_AGENCY_STAFF: ZzAgencyStaff[] = [
  { agency: 'AG-01', name: '王立(华信催员)', role: '催员', cases: 42, recovery: 286000, status: '在岗' },
  { agency: 'AG-01', name: '李娜(华信督导)', role: '督导', cases: 18, recovery: 132000, status: '在岗' },
  { agency: 'AG-02', name: '陈强(众和催员)', role: '催员', cases: 35, recovery: 198000, status: '在岗' },
  { agency: 'AG-02', name: '赵敏(众和催员)', role: '催员', cases: 11, recovery: 54000, status: '休假' },
  { agency: 'AG-03', name: '周涛(鼎力催员)', role: '催员', cases: 9, recovery: 96000, status: '在岗' },
]

/* 便捷查询辅助 */
export const zzAgencyName = (id: string) => ZZ_AGENCIES.find((a) => a.id === id)?.name ?? id
export const zzAgencyCases = (id: string) => ZZ_AGENCY_MONITOR.filter((m) => m.agency === id)
export const zzAgencyAccounts = (id: string) => ZZ_AGENCY_ACCOUNTS.filter((a) => a.agency === id)
export const zzAgencyCallback = (id: string) => ZZ_AGENCY_CALLBACKS.filter((c) => c.agency === id)
export const zzAgencyKpi = (id: string) => ZZ_AGENCY_KPI.find((k) => k.agency === id)
export const zzAgencySettle = (id: string) => ZZ_AGENCY_SETTLE.find((s) => s.agency === id)

/* ============================ 模块5 外访 ============================ */
// 状态全集：待分配 / 待外访 / 外访进行中 / 待审核 / 已完成 / 已驳回 / 已取消
export const ZZ_VISIT_STATUSES = ['待分配', '待外访', '外访进行中', '待审核', '已完成', '已驳回', '已取消']
export const ZZ_VISITORS = ['外访员A（华南）', '外访员B（华南）', '外访员C（华东）', '外访员D（华北）']
export const ZZ_VISIT_REGIONS = ['华南', '华东', '华北']

/* ============================ 话术库（话术管理） ============================ */
export const ZZ_SCRIPT_CATEGORIES = ['首催提醒', '逾期催收', '委外前催收', '法诉前催告', '协商分期', '失联修复', '节假日关怀']
export const ZZ_SCRIPT_CHANNELS = ['语音', '短信', '企微']
export const ZZ_SCRIPT_STATUSES = ['生效中', '草稿', '已下线']

export const ZZ_SCRIPTS: any[] = [
  {
    id: 'S-1001', name: '首催温和提醒（M1）', category: '首催提醒', channel: '语音', status: '生效中',
    version: 'v1.2.0', content: '您好{客户}，我是{机构}的催收专员{工号}。提醒您本期应还{金额}元已于{日期}到期，请尽快通过官方渠道还款，避免影响征信。如有疑问可回拨。',
    variables: ['客户', '机构', '工号', '金额', '日期'], strategies: ['首催-标准', 'M1温和'], updatedAt: '2026-08-20', author: '话术管理员',
    versions: [
      { version: 'v1.2.0', status: '生效中', updatedAt: '2026-08-20', note: '补充征信提示话术' },
      { version: 'v1.1.0', status: '已下线', updatedAt: '2026-06-11', note: '初版' },
    ],
  },
  {
    id: 'S-1002', name: '逾期施压（M2-M3）', category: '逾期催收', channel: '语音', status: '生效中',
    version: 'v2.0.1', content: '您好{客户}，您的贷款已逾期{天数}天，欠款{金额}元。请于{日期}前处理，长期逾期将影响征信并可能产生额外费用。请尽快安排还款或联系我们协商。',
    variables: ['客户', '天数', '金额', '日期'], strategies: ['逾期-标准', 'M2施压'], updatedAt: '2026-08-18', author: '话术管理员',
    versions: [
      { version: 'v2.0.1', status: '生效中', updatedAt: '2026-08-18', note: '合规复核通过' },
      { version: 'v2.0.0', status: '已下线', updatedAt: '2026-05-30', note: '初版' },
    ],
  },
  {
    id: 'S-1003', name: '失联修复触达', category: '失联修复', channel: '语音', status: '生效中',
    version: 'v1.0.0', content: '您好，这里是{机构}。我们多次联系{客户}未果，如您是预留联系人请协助转告其尽快处理逾期欠款{金额}元，或回拨{工号}。感谢配合，请勿转告无关第三方。',
    variables: ['机构', '客户', '金额', '工号'], strategies: ['失联-修复'], updatedAt: '2026-08-12', author: '话术管理员',
    versions: [{ version: 'v1.0.0', status: '生效中', updatedAt: '2026-08-12', note: '初版' }],
  },
  {
    id: 'S-1004', name: '协商分期方案引导', category: '协商分期', channel: '语音', status: '草稿',
    version: 'v0.3.0', content: '您好{客户}，了解到您当前还款有困难。我们可提供分期方案：分{期数}期，每期{每期金额}元，首期{首期日}。确认后我为您登记，请保持电话畅通。',
    variables: ['客户', '期数', '每期金额', '首期日'], strategies: ['协商-分期'], updatedAt: '2026-08-25', author: '王经理',
    versions: [{ version: 'v0.3.0', status: '草稿', updatedAt: '2026-08-25', note: '待合规审核' }],
  },
  {
    id: 'S-1005', name: '法诉前催告（短信）', category: '法诉前催告', channel: '短信', status: '生效中',
    version: 'v1.1.0', content: '【{机构}】{客户}：您在我司贷款已严重逾期{金额}元，请在{日期}前处理，否则将依法诉前催告。回拨{工号}。',
    variables: ['机构', '客户', '金额', '日期', '工号'], strategies: ['法诉-催告'], updatedAt: '2026-08-15', author: '话术管理员',
    versions: [
      { version: 'v1.1.0', status: '生效中', updatedAt: '2026-08-15', note: '补充诉前催告表述' },
      { version: 'v1.0.0', status: '已下线', updatedAt: '2026-04-02', note: '初版' },
    ],
  },
  {
    id: 'S-1006', name: '节假日关怀提醒', category: '节假日关怀', channel: '企微', status: '已下线',
    version: 'v1.0.0', content: '尊敬的{客户}，佳节将至，祝您安康。您账户应还{金额}元，可在节后方便时处理，如需协商请回复。',
    variables: ['客户', '金额'], strategies: [], updatedAt: '2026-02-01', author: '话术管理员',
    versions: [{ version: 'v1.0.0', status: '已下线', updatedAt: '2026-02-01', note: '节日活动结束' }],
  },
]

/* ============================ 短信模板管理 ============================ */
export const ZZ_SMS_TYPES = ['还款提醒', '逾期催告', '法诉告知', '协商方案', '还款成功']
export const ZZ_SMS_CHANNELS = ['短信', '企微', '5G消息']
export const ZZ_SMS_STATUSES = ['启用', '停用', '草稿']

export const ZZ_SMS_TEMPLATES: any[] = [
  { id: 'SM-2001', code: 'SMS_M1_REMIND', name: 'M1还款提醒', type: '还款提醒', channel: '短信', status: '启用', sign: '【XX金融】', content: '{客户}您好，您本期应还{金额}元将于{日期}到期，请通过官方APP还款，详情回拨{工号}。', variables: ['客户', '金额', '日期', '工号'], updatedAt: '2026-08-20', audit: '已审核', send: 12840 },
  { id: 'SM-2002', code: 'SMS_M2_URGE', name: 'M2逾期催告', type: '逾期催告', channel: '短信', status: '启用', sign: '【XX金融】', content: '{客户}您好，您已逾期{天数}天，欠款{金额}元，请于{日期}前还款，否则将影响征信。回拨{工号}。', variables: ['客户', '天数', '金额', '日期', '工号'], updatedAt: '2026-08-18', audit: '已审核', send: 9312 },
  { id: 'SM-2003', code: 'SMS_LEGAL', name: '诉前告知', type: '法诉告知', channel: '短信', status: '启用', sign: '【XX金融】', content: '{客户}您好，您欠款{金额}元已严重逾期，我司将于{日期}依法诉前催告，请尽快处理或回拨{工号}协商。', variables: ['客户', '金额', '日期', '工号'], updatedAt: '2026-08-15', audit: '已审核', send: 2045 },
  { id: 'SM-2004', code: 'SMS_PLAN', name: '协商方案通知', type: '协商方案', channel: '企微', status: '启用', sign: '【XX金融】', content: '{客户}您好，您申请的分{期数}期方案已生效，每期{每期金额}元，首期{首期日}。请按时还款。', variables: ['客户', '期数', '每期金额', '首期日'], updatedAt: '2026-08-22', audit: '已审核', send: 612 },
  { id: 'SM-2005', code: 'SMS_PAID', name: '还款成功通知', type: '还款成功', channel: '5G消息', status: '停用', sign: '【XX金融】', content: '{客户}您好，您于{日期}还款{金额}元已到账，当前账单结清，感谢配合。', variables: ['客户', '日期', '金额'], updatedAt: '2026-07-30', audit: '已审核', send: 0 },
  { id: 'SM-2006', code: 'SMS_M3_URGE', name: 'M3强化催告', type: '逾期催告', channel: '短信', status: '草稿', sign: '【XX金融】', content: '{客户}您好，您已逾期{天数}天，欠款{金额}元，多次联系未果，请于{日期}前处理。', variables: ['客户', '天数', '金额', '日期'], updatedAt: '2026-08-25', audit: '待审核', send: 0 },
  { id: 'SM-2007', code: 'SMS_M0_REMIND', name: 'M0还款提醒', type: '还款提醒', channel: '短信', status: '启用', sign: '【XX金融】', content: '{客户}您好，您本期应还{金额}元将于{日期}到期，请提前通过官方APP还款，避免逾期影响征信。回拨{工号}。', variables: ['客户', '金额', '日期', '工号'], updatedAt: '2026-08-26', audit: '已审核', send: 20145 },
  { id: 'SM-2008', code: 'SMS_LOSTFIX', name: '失联修复短信', type: '失联修复', channel: '短信', status: '启用', sign: '【XX金融】', content: '{客户}您好，多次联系未果，请点击链接在线还款或回拨{工号}更新联系方式，以免影响您信用记录。', variables: ['客户', '工号'], updatedAt: '2026-08-24', audit: '已审核', send: 5680 },
]

/* ============================ 外访人员管理 ============================ */
export const ZZ_VISITOR_STATUS = ['在岗', '休假', '停用']
export const ZZ_VISITOR_SKILLS = ['常规外访', '夜间外访', '现场取证', '协商谈判', '高风险处置']

export const ZZ_VISITOR_LIST: any[] = [
  { id: 'V-001', name: '外访员A', phone: '138****0001', agency: '华南外访一组', region: '华南', skills: ['常规外访', '现场取证'], status: '在岗', rating: 4.8, tasks: 6, done: 132 },
  { id: 'V-002', name: '外访员B', phone: '138****0002', agency: '华南外访一组', region: '华南', skills: ['常规外访', '协商谈判'], status: '在岗', rating: 4.5, tasks: 4, done: 98 },
  { id: 'V-003', name: '外访员C', phone: '139****0003', agency: '华东外访二组', region: '华东', skills: ['夜间外访', '高风险处置'], status: '休假', rating: 4.2, tasks: 0, done: 75 },
  { id: 'V-004', name: '外访员D', phone: '137****0004', agency: '华北外访三组', region: '华北', skills: ['常规外访', '现场取证', '协商谈判'], status: '在岗', rating: 4.9, tasks: 8, done: 156 },
  { id: 'V-005', name: '外访员E', phone: '136****0005', agency: '华北外访三组', region: '华北', skills: ['常规外访'], status: '停用', rating: 3.6, tasks: 0, done: 41 },
]

/* 外访排班 / 日历（样例）
 * 默认全部「在岗」，休假/请假通过 leaves 覆盖；plan 为某日已分配的外访任务（案件号 + 地址） */
export const ZZ_VISIT_BASE_DATE = '2026-08-25'

export const ZZ_VISITOR_LEAVES: Record<string, { date: string; type: '休假' | '请假' }[]> = {
  'V-002': [{ date: '2026-08-27', type: '请假' }, { date: '2026-08-28', type: '请假' }],
  'V-003': [
    { date: '2026-08-25', type: '休假' }, { date: '2026-08-26', type: '休假' },
    { date: '2026-08-27', type: '休假' }, { date: '2026-08-28', type: '休假' }, { date: '2026-08-29', type: '休假' },
  ],
  'V-005': [{ date: '2026-08-30', type: '请假' }],
}

export const ZZ_VISITOR_PLAN: Record<string, { date: string; caseId: string; addr: string; status: string }[]> = {
  'V-001': [
    { date: '2026-08-25', caseId: 'CO-202608-001', addr: '杭州市西湖区文三路100号', status: '已完成' },
    { date: '2026-08-25', caseId: 'CO-202608-012', addr: '杭州市滨江区江南大道88号', status: '已完成' },
    { date: '2026-08-26', caseId: 'CO-202608-020', addr: '杭州市上城区延安路200号', status: '待外访' },
    { date: '2026-08-26', caseId: 'CO-202608-021', addr: '杭州市拱墅区莫干山路12号', status: '待外访' },
    { date: '2026-08-29', caseId: 'CO-202608-033', addr: '宁波市鄞州区天童北路', status: '待外访' },
  ],
  'V-002': [
    { date: '2026-08-25', caseId: 'CO-202608-007', addr: '成都市武侯区天府大道88号', status: '已完成' },
    { date: '2026-08-26', caseId: 'CO-202608-015', addr: '成都市锦江区东大街', status: '待外访' },
    { date: '2026-08-29', caseId: 'CO-202608-024', addr: '广州市天河区珠江新城', status: '待外访' },
  ],
  'V-004': [
    { date: '2026-08-25', caseId: 'CO-202608-002', addr: '北京市朝阳区建国路9号', status: '已完成' },
    { date: '2026-08-25', caseId: 'CO-202608-009', addr: '北京市海淀区中关村大街', status: '已完成' },
    { date: '2026-08-25', caseId: 'CO-202608-018', addr: '天津市和平区南京路', status: '待外访' },
    { date: '2026-08-26', caseId: 'CO-202608-022', addr: '石家庄市长安区中山东路', status: '待外访' },
    { date: '2026-08-29', caseId: 'CO-202608-035', addr: '北京市大兴区亦庄', status: '待外访' },
  ],
}

/* 外访绩效明细（样例）：用于周期内聚合统计，支持自定义时间范围真实过滤 */
export const ZZ_VISITOR_PERF: any[] = (() => {
  const out: any[] = []
  const plan: Record<string, { success: number; lost: number; notFound: number; avg: number }> = {
    'V-001': { success: 12, lost: 2, notFound: 3, avg: 42 },
    'V-002': { success: 9, lost: 1, notFound: 2, avg: 38 },
    'V-003': { success: 7, lost: 1, notFound: 1, avg: 51 },
    'V-004': { success: 15, lost: 3, notFound: 2, avg: 36 },
    'V-005': { success: 3, lost: 1, notFound: 1, avg: 45 },
  }
  const dates = ['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-21', '2026-08-22', '2026-08-23', '2026-08-24', '2026-08-25']
  Object.entries(plan).forEach(([vid, m]) => {
    const arr: string[] = [
      ...Array(m.success).fill('成功'),
      ...Array(m.lost).fill('失联'),
      ...Array(m.notFound).fill('未找到人'),
    ]
    arr.forEach((r, i) => {
      const date = dates[(i * 3 + vid.charCodeAt(2)) % dates.length]
      out.push({ visitorId: vid, date, result: r, durationMin: m.avg + ((i * 5) % 20) - 8 })
    })
  })
  return out
})()

export const ZZ_VISITS: any[] = [
  {
    id: 'VS-001', caseId: 'CO-202608-001', name: '赵*强', phone: '138****6601', addr: '杭州市西湖区文三路 100 号', backupAddr: '杭州市西湖区文三路 102 号',
    priority: '普通', status: '待分配', assignee: '-', creator: '主管-王经理', createdAt: '2026-08-20 09:12', assignedAt: '', dueDate: '2026-08-25',
    overdueAmount: 86000, age: 'M2',
    punch: { time: '2026-08-22 09:30', lng: 120.150, lat: 30.280, actualAddr: '杭州市西湖区文三路 100 号', inRadius: true, device: 'iPhone 14', offline: false },
    report: { result: '见到家属/同住人', talk: '家属表示会转告客户本人尽快处理', statusDesc: '家庭住址已核实，同住家属配合', agree: '否', planTime: '', planAmount: 0, risk: '无', photos: ['门牌号.jpg'], audio: '', summary: '初步外访，待进一步联系本人还款' },
    rejectReason: '',
    finishedAt: '2026-08-22 10:30',
    resultSummary: '见到家属，待联系本人',
    logs: [{ op: '创建任务', by: '主管-王经理', at: '2026-08-20 09:12', note: '由案件 CO-202608-001 推送创建' }],
  },
  {
    id: 'VS-002', caseId: 'CO-202608-007', name: '冯*军', phone: '159****2288', addr: '成都市武侯区天府大道 88 号', backupAddr: '成都市武侯区天府大道 90 号',
    priority: '紧急', status: '待外访', assignee: '外访员A', creator: '主管-王经理', createdAt: '2026-08-21 10:30', assignedAt: '2026-08-21 11:00', dueDate: '2026-08-24',
    overdueAmount: 124000, age: 'M3+',
    punch: { time: '2026-08-23 09:10', lng: 104.070, lat: 30.570, actualAddr: '成都市武侯区天府大道 88 号', inRadius: true, device: 'iPhone 14', offline: false },
    report: { result: '见到本人客户', talk: '客户承认欠款，承诺周内处理', statusDesc: '个体经营，短期资金困难', agree: '是', planTime: '2026-08-30', planAmount: 30000, risk: '无', photos: ['门牌号.jpg', '房屋现场.jpg'], audio: '现场录音.mp3', summary: '已现场沟通，达成部分还款意向' },
    rejectReason: '',
    finishedAt: '2026-08-23 10:00',
    resultSummary: '见到本人，承诺还款',
    logs: [
      { op: '创建任务', by: '主管-王经理', at: '2026-08-21 10:30', note: '逾期M3+，紧急外访' },
      { op: '分配人员', by: '主管-王经理', at: '2026-08-21 11:00', note: '分配给 外访员A' },
    ],
  },
  {
    id: 'VS-003', caseId: 'CO-202608-002', name: '张*明', phone: '137****4412', addr: '广州市天河区天河路 200 号', backupAddr: '',
    priority: '普通', status: '已完成', assignee: '外访员B', creator: '主管-李经理', createdAt: '2026-08-18 14:00', assignedAt: '2026-08-18 15:00', dueDate: '2026-08-22',
    overdueAmount: 42000, age: 'M1',
    punch: { time: '2026-08-20 10:15', lng: 113.330, lat: 23.140, actualAddr: '广州市天河区天河路 200 号', inRadius: true, device: 'iPhone 14', offline: false },
    report: {
      result: '见到本人客户', talk: '客户承认欠款，态度配合，承诺本月内先还 2 万', statusDesc: '在工厂上班，家庭稳定，短期资金周转困难',
      agree: '是', planTime: '2026-08-31', planAmount: 20000, risk: '无', photos: ['门牌号.jpg', '房屋现场.jpg'], audio: '现场录音.mp3', summary: '现场沟通顺利，达成部分还款计划',
    },
    rejectReason: '',
    finishedAt: '2026-08-20 11:30',
    resultSummary: '见到本人，达成 2 万还款计划',
    logs: [
      { op: '分配人员', by: '主管-李经理', at: '2026-08-18 15:00', note: '分配给 外访员B' },
      { op: '现场打卡', by: '外访员B', at: '2026-08-20 10:15', note: '定位正常（半径内）' },
      { op: '提交报告', by: '外访员B', at: '2026-08-20 10:50', note: '现场见到本人' },
      { op: '审核通过', by: '主管-李经理', at: '2026-08-20 11:30', note: '报告合规，任务闭环' },
    ],
  },
  {
    id: 'VS-004', caseId: 'CO-202608-009', name: '孙*浩', phone: '186****7733', addr: '武汉市江汉区解放大道 50 号', backupAddr: '',
    priority: '普通', status: '外访进行中', assignee: '外访员C', creator: '主管-李经理', createdAt: '2026-08-22 09:00', assignedAt: '2026-08-22 09:30', dueDate: '2026-08-26',
    overdueAmount: 56000, age: 'M2',
    punch: { time: '2026-08-23 14:20', lng: 114.270, lat: 30.590, actualAddr: '武汉市江汉区解放大道 60 号（偏移 320m）', inRadius: false, device: 'HUAWEI Mate60', offline: true },
    report: { result: '无人在家，敲门无人应答', talk: '多次敲门无人应答，邻居称白天多不在家', statusDesc: '疑似白天外出务工', agree: '否', planTime: '', planAmount: 0, risk: '无', photos: ['门牌号.jpg'], audio: '', summary: '现场已打卡（偏移 320m，离线），报告待补' },
    rejectReason: '',
    finishedAt: '2026-08-23 15:00',
    resultSummary: '已打卡，待补报告',
    logs: [
      { op: '分配人员', by: '主管-李经理', at: '2026-08-22 09:30', note: '分配给 外访员C' },
      { op: '现场打卡', by: '外访员C', at: '2026-08-23 14:20', note: '⚠️位置偏移 320m（离线打卡，已标记风险）' },
    ],
  },
  {
    id: 'VS-005', caseId: 'CO-202608-011', name: '周*敏', phone: '133****9056', addr: '南京市鼓楼区中山路 30 号', backupAddr: '',
    priority: '紧急', status: '待审核', assignee: '外访员A', creator: '主管-王经理', createdAt: '2026-08-19 11:00', assignedAt: '2026-08-19 11:30', dueDate: '2026-08-23',
    overdueAmount: 98000, age: 'M3+',
    punch: { time: '2026-08-21 09:40', lng: 118.780, lat: 32.060, actualAddr: '南京市鼓楼区中山路 30 号', inRadius: true, device: 'iPhone 13', offline: false },
    report: {
      result: '拒绝沟通、拒不开门', talk: '多次敲门无人应答，邻居称已搬离', statusDesc: '疑似失联',
      agree: '否', planTime: '', planAmount: 0, risk: '客户投诉倾向', photos: ['门牌号.jpg'], audio: '', summary: '无人应答，建议转为委外或司法',
    },
    rejectReason: '',
    logs: [
      { op: '分配人员', by: '主管-王经理', at: '2026-08-19 11:30', note: '分配给 外访员A' },
      { op: '现场打卡', by: '外访员A', at: '2026-08-21 09:40', note: '定位正常' },
      { op: '提交报告', by: '外访员A', at: '2026-08-21 10:20', note: '拒不开门，标记投诉倾向' },
    ],
  },
  {
    id: 'VS-006', caseId: 'CO-202608-013', name: '吴*磊', phone: '152****3344', addr: '西安市雁塔区高新路 12 号', backupAddr: '',
    priority: '普通', status: '已驳回', assignee: '外访员B', creator: '主管-李经理', createdAt: '2026-08-17 13:00', assignedAt: '2026-08-17 13:30', dueDate: '2026-08-21',
    overdueAmount: 33000, age: 'M1',
    punch: { time: '2026-08-19 16:10', lng: 108.950, lat: 34.230, actualAddr: '西安市雁塔区高新路 12 号', inRadius: true, device: 'iPhone 14', offline: false },
    report: {
      result: '见到家属/同住人', talk: '家属称会转告，敷衍', statusDesc: '家属态度冷淡',
      agree: '否', planTime: '', planAmount: 0, risk: '无', photos: [], audio: '', summary: '家属敷衍，报告过于简单被驳回',
    },
    rejectReason: '报告内容过于简单，缺少沟通细节与现场照片，请补全后重提',
    logs: [
      { op: '提交报告', by: '外访员B', at: '2026-08-19 16:40', note: '见到家属' },
      { op: '驳回报告', by: '主管-李经理', at: '2026-08-19 18:00', note: '报告过于简单，退回修改' },
    ],
  },
]
export const ZZ_VISIT_MINE = [
  { id: 'VS-002', caseId: 'CO-202608-007', name: '冯*军', phone: '159****2288', addr: '成都市武侯区天府大道 88 号', status: '待外访', priority: '紧急', dueDate: '2026-08-24' },
  { id: 'VS-004', caseId: 'CO-202608-009', name: '孙*浩', phone: '186****7733', addr: '武汉市江汉区解放大道 50 号', status: '外访进行中', priority: '普通', dueDate: '2026-08-26' },
  { id: 'VS-005', caseId: 'CO-202608-011', name: '周*敏', phone: '133****9056', addr: '南京市鼓楼区中山路 30 号', status: '待审核', priority: '紧急', dueDate: '2026-08-23' },
  { id: 'VS-003', caseId: 'CO-202608-002', name: '张*明', phone: '137****4412', addr: '广州市天河区天河路 200 号', status: '已完成', priority: '普通', dueDate: '2026-08-22' },
  { id: 'VS-006', caseId: 'CO-202608-013', name: '吴*磊', phone: '152****3344', addr: '西安市雁塔区高新路 12 号', status: '已驳回', priority: '普通', dueDate: '2026-08-21' },
]

/* 外访报表（数据分析） */
export const ZZ_BI_VISIT = {
  total: 6, assigned: 5, unassigned: 1,
  punchRate: 0.83, onTimeRate: 0.78, pendingReview: 1, rejectRate: 0.17,
  seeCustomerRate: 0.40, planDeal: 2, recoveryFromVisit: 20000,
  // 人员维度
  visitors: [
    { name: '外访员A', tasks: 2, punchRate: 1.0, finishRate: 1.0, effectiveRate: 0.5 },
    { name: '外访员B', tasks: 2, punchRate: 1.0, finishRate: 1.0, effectiveRate: 0.5 },
    { name: '外访员C', tasks: 1, punchRate: 1.0, finishRate: 0.0, effectiveRate: 0.0 },
  ],
  // 近30日每日任务下达趋势
  days: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
  dailyTrend: [0, 1, 1, 0, 1, 2, 0, 1, 1, 1, 0, 1, 2, 1, 0, 1, 1, 0, 1, 1, 2, 0, 1, 1, 1, 0, 1, 1, 0, 1],
  // 明细
  detail: [
    { id: 'VS-003', visitor: '外访员B', punch: '已打卡', finish: '已完成', effective: '有效', recovery: 20000 },
    { id: 'VS-005', visitor: '外访员A', punch: '已打卡', finish: '待审核', effective: '无效', recovery: 0 },
    { id: 'VS-006', visitor: '外访员B', punch: '已打卡', finish: '已驳回', effective: '无效', recovery: 0 },
    { id: 'VS-004', visitor: '外访员C', punch: '已打卡', finish: '进行中', effective: '—', recovery: 0 },
    { id: 'VS-002', visitor: '外访员A', punch: '未打卡', finish: '待外访', effective: '—', recovery: 0 },
  ],
}

/* ============================ 模块6 智能质检 ============================ */
// 录音记录（债务人脱敏手机、坐席工号、AI告警状态、命中敏感词、ASR转写+敏感词高亮）
export const ZZ_QA_RECORDS: any[] = [
  { id: 'CALL-9001', time: '2026-08-24 10:12', target: '赵*强', phone: '138****6601', duration: '04:32', agent: '王雷(0012)', alertStatus: '命中告警', status: '待复核', hitWords: ['不还钱就上门'],
    asr: [['坐席', '您这笔已经逾期了，请尽快处理。'], ['债务人', '我现在没钱。'], ['坐席', '不还钱就上门找你。'], ['债务人', '你们不能这样。']] },
  { id: 'CALL-9002', time: '2026-08-24 14:30', target: '张*明', phone: '137****4412', duration: '02:10', agent: '李娜(0015)', alertStatus: '正常', status: '已处理', hitWords: [],
    asr: [['坐席', '您好，关于您的还款提醒。'], ['债务人', '我知道了，下周还。']] },
  { id: 'CALL-9003', time: '2026-08-23 09:48', target: '冯*军', phone: '159****2288', duration: '01:55', agent: '李娜(0015)', alertStatus: '命中告警', status: '待复核', hitWords: ['明天再不还要后果'],
    asr: [['坐席', '请尽快还款。'], ['债务人', '再宽限几天。'], ['坐席', '明天再不还要后果自负。']] },
]
// 敏感词库（分类、风险等级高/中/低、启用/禁用状态、分类管理、批量导入）
export const ZZ_SENSITIVE_CATS = ['威胁恐吓类', '债务泄露类', '违规承诺类', '辱骂骚扰类']
export const ZZ_SENSITIVE_WORDS: any[] = [
  { word: '不还钱就上门', cat: '威胁恐吓类', level: '高', enabled: true },
  { word: '告诉你的家人朋友', cat: '债务泄露类', level: '高', enabled: true },
  { word: '保证减免全部利息', cat: '违规承诺类', level: '中', enabled: true },
  { word: '明天再不还要后果', cat: '威胁恐吓类', level: '高', enabled: true },
]
// 事后质检任务（时间范围、抽样维度、打分模板、负责人、复核工作台打分）
// 每条抽样录音带 aiStatus：AI识别状态；aiHit：AI命中敏感词；aiScore：AI预打分（非最终结果）
export const ZZ_QA_TASKS: any[] = [
  {
    id: 'QT-01', name: '8月坐席抽样质检', range: '2026-08-01~2026-08-31', dim: '按坐席 10% 抽样', tpl: '催收质检标准打分表',
    owner: '质检组', total: 3, done: 2, pool: 1280, sampled: 128,
    records: [
      { id: 'CALL-9001', aiStatus: 'pending', aiHit: ['不还钱就上门'], aiScore: 70, humanStatus: '已复核', humanHit: ['不还钱就上门'], humanScore: 70, violations: ['不还钱就上门'], note: '确认违规，已约谈坐席' },
      { id: 'CALL-9002', aiStatus: 'clean', aiHit: [], aiScore: 100, humanStatus: '已复核', humanHit: [], humanScore: 100, violations: [], note: '' },
      { id: 'CALL-9003', aiStatus: 'pending', aiHit: ['明天再不还要后果'], aiScore: 75, humanStatus: '待复核', humanHit: [], humanScore: 75, violations: [], note: '' },
    ],
  },
]
// 质检打分模板：合规扣分维度
export const ZZ_QA_SCORE_TPL = [
  { item: '文明用语', desc: '无辱骂、无威胁恐吓', max: 25 },
  { item: '合规承诺', desc: '不违规承诺减免/延期', max: 25 },
  { item: '信息保密', desc: '不泄露债务给第三方', max: 25 },
  { item: '流程规范', desc: '身份核验、还款提醒完整', max: 25 },
]
// 质检报告（由抽样任务复核产出，含评分项/扣分/违规点，可关联录音回放）
export const ZZ_QA_REPORTS: any[] = [
  { id: 'RPT-01', task: '8月坐席抽样质检', callId: 'CALL-9001', agent: '王雷(0012)', target: '赵*强', date: '2026-08-25', total: 100, score: 70, violations: ['不还钱就上门'],
    items: [
      { item: '文明用语', max: 25, deduct: 15, score: 10, note: '出现威胁恐吓话术' },
      { item: '合规承诺', max: 25, deduct: 0, score: 25, note: '无违规承诺' },
      { item: '信息保密', max: 25, deduct: 0, score: 25, note: '未泄露债务' },
      { item: '流程规范', max: 25, deduct: 10, score: 15, note: '未完整身份核验' },
    ] },
  { id: 'RPT-02', task: '8月坐席抽样质检', callId: 'CALL-9003', agent: '李娜(0015)', target: '冯*军', date: '2026-08-25', total: 100, score: 75, violations: ['明天再不还要后果'],
    items: [
      { item: '文明用语', max: 25, deduct: 10, score: 15, note: '存在后果恐吓' },
      { item: '合规承诺', max: 25, deduct: 0, score: 25, note: '—' },
      { item: '信息保密', max: 25, deduct: 0, score: 25, note: '—' },
      { item: '流程规范', max: 25, deduct: 10, score: 15, note: '提醒流程不完整' },
    ] },
  { id: 'RPT-03', task: '8月坐席抽样质检', callId: 'CALL-9002', agent: '李娜(0015)', target: '张*明', date: '2026-08-25', total: 100, score: 100, violations: [],
    items: [
      { item: '文明用语', max: 25, deduct: 0, score: 25, note: '规范' },
      { item: '合规承诺', max: 25, deduct: 0, score: 25, note: '—' },
      { item: '信息保密', max: 25, deduct: 0, score: 25, note: '—' },
      { item: '流程规范', max: 25, deduct: 0, score: 25, note: '完整' },
    ] },
]

/* ============================ 模块7 AI协催机器人 ============================ */
// 单条通话（含 ASR/NLP/标签回写/后续建议）
export const ZZ_AI_CALLS: any[] = [
  { id: 'AIC-501', taskId: 'AI-01', time: '2026-08-24 11:00', target: '孙*磊', caseId: 'CO-202608-009', duration: '00:48', result: '接通', intent: '拒绝还款', tag: '已回写', suggest: '客户强烈拒绝，建议停止 AI，转入人工跟进',
    asr: [['AI', '您好，提醒您贷款已逾期，请尽快处理。'], ['客户', '我现在没钱，别打了。'], ['AI', '理解您的情况，是否可以延期？'], ['客户', '不用了，你们烦不烦。']], nlp: { promise: '否', expectDate: '', transfer: '是' } },
  { id: 'AIC-502', taskId: 'AI-01', time: '2026-08-24 11:05', target: '刘*梅', caseId: 'CO-202608-002', duration: '01:12', result: '接通', intent: '承诺还款', tag: '已回写', suggest: '客户承诺还款，建议人工跟进确认',
    asr: [['AI', '您好，关于您的逾期账单。'], ['客户', '我想先还一部分。'], ['AI', '好的，您计划何时还款？'], ['客户', '下个月10号还3000。'], ['AI', '已为您记录还款承诺。']], nlp: { promise: '是', expectDate: '2026-09-10', transfer: '否' } },
  { id: 'AIC-503', taskId: 'AI-01', time: '2026-08-24 11:10', target: '钱*华', caseId: 'CO-202608-006', duration: '00:32', result: '无人接听', intent: '—', tag: '—', suggest: '—', asr: [], nlp: {} },
  { id: 'AIC-504', taskId: 'AI-02', time: '2026-08-23 15:20', target: '周*敏', caseId: 'CO-202608-011', duration: '01:40', result: '接通', intent: '要求延期', tag: '已回写', suggest: '采集到延期期望，回写案件并安排后续',
    asr: [['AI', '您好，关于您的还款。'], ['客户', '我想延期两个月。'], ['AI', '已记录，将为您反馈。']], nlp: { promise: '否', expectDate: '2026-10-23', transfer: '否' } },
]
// 对话模板（含多轮节点/分支/动作 + 模拟可跑）
export const ZZ_AI_TEMPLATES: any[] = [
  {
    id: 'T-01', name: '标准开场白', scenario: 'M1/M2 催收提醒', enabled: true, nodeCount: 5,
    nodes: [
      { id: 'n1', role: 'AI', text: '您好，提醒您贷款已逾期，请尽快处理。', branch: [
        { answer: '客户说没钱', next: 'n2', action: '' },
        { answer: '要延期', next: 'n3', action: '' },
        { answer: '辱骂/拒绝', next: 'n9', action: '终止通话+标记拒绝还款' },
      ] },
      { id: 'n2', role: 'AI', text: '理解您，我们可以协商分期方案。', branch: [
        { answer: '同意分期', next: 'n5', action: '记录还款承诺' },
        { answer: '拒绝', next: 'n6', action: '标记转人工' },
      ] },
      { id: 'n3', role: 'AI', text: '好的，您期望延期到什么时候？', branch: [{ answer: '输入日期', next: 'n4', action: '记录延期期望' }] },
      { id: 'n4', role: 'AI', text: '已为您记录延期申请。', branch: [] },
      { id: 'n5', role: 'AI', text: '好的，已记录您的还款承诺，感谢配合。', branch: [] },
      { id: 'n6', role: 'AI', text: '为您转接人工客服，请稍候。', branch: [] },
      { id: 'n9', role: 'AI', text: '抱歉打扰，祝您生活愉快，再见。', branch: [] },
    ],
  },
  {
    id: 'T-02', name: '承诺还款跟进', scenario: '已承诺客户回访', enabled: true, nodeCount: 4,
    nodes: [
      { id: 'm1', role: 'AI', text: '您好，关于您之前承诺的还款。', branch: [
        { answer: '确认还款', next: 'm2', action: '记录确认' },
        { answer: '要求改期', next: 'm3', action: '记录改期' },
        { answer: '拒绝', next: 'm4', action: '转人工' },
      ] },
      { id: 'm2', role: 'AI', text: '感谢您的履约。', branch: [] },
      { id: 'm3', role: 'AI', text: '已记录改期申请。', branch: [] },
      { id: 'm4', role: 'AI', text: '为您转接人工客服。', branch: [] },
    ],
  },
]
// 外呼任务（手动临时 / 自动周期）
export const ZZ_AI_TASKS: any[] = [
  {
    id: 'AI-01', name: 'M1提醒外呼', type: '自动周期', template: '标准开场白', status: '运行中',
    schedule: '每日 09:00-12:00，14:00-18:00 自动执行', nextRun: '2026-08-25 09:00',
    filter: '逾期阶段 M1；逾期 1-30 天；排除已人工跟进/已承诺/禁止AI协催/已转法务',
    strategy: '每客户最大呼叫 2 次；失败重呼间隔 4h；接通后不再重呼；夜间禁止外呼',
    kpi: { pending: 1200, called: 480, connected: 210, connectRate: 0.4375, noAnswer: 180, busy: 90, promise: 23, toHuman: 12 },
    fail: { 关机: 60, 空号: 18, 拒接: 102, 号码错误: 12 },
    calls: ['AIC-501', 'AIC-502', 'AIC-503'],
  },
  {
    id: 'AI-02', name: 'M2协催临时批次', type: '手动临时', template: '承诺还款跟进', status: '已暂停',
    schedule: '2026-08-20 ~ 2026-08-26 一次性', nextRun: '-',
    filter: '导入客户池 220 户（M2 逾期）',
    strategy: '每客户最大呼叫 3 次；失败重呼间隔 6h',
    kpi: { pending: 0, called: 220, connected: 88, connectRate: 0.40, noAnswer: 80, busy: 52, promise: 9, toHuman: 5 },
    fail: { 关机: 30, 空号: 8, 拒接: 42, 号码错误: 6 },
    calls: ['AIC-504'],
  },
]
export const ZZ_AI_BOARD = { total: 700, connected: 298, effective: 0.43, toHuman: 56, abnormal: 1 }

/* ============================ AI 外呼任务详情（独立详情页样例数据） ============================ */
// 任务配置快照（创建时完整留存，规则修改后仍可追溯历史执行逻辑）
export const ZZ_AI_TASK_CONFIG: Record<string, any> = {
  'AI-01': {
    filterSnapshot: {
      逾期阶段: 'M1', 逾期天数区间: '1-30 天', 案件状态: '在催（未结案）', 客户类型: '个人消费贷',
      排除规则: '已人工跟进 / 已外访 / 已转法务 / 禁呼名单 / 已承诺还款(PTP) 客户',
    },
    compliance: { 允许外呼时段: '09:00-12:00，14:00-18:00', 夜间禁呼拦截: '开启', 节假日拦截: '开启' },
    callStrategy: { 单客户最大呼叫次数: 2, 呼叫失败重呼间隔: '4h', 无人接听重试次数: 1, 接通后不再重呼: '是' },
    intercept: { 屏蔽失联客户: '否', 已PTP客户: '是', 已协商客户: '是', 投诉风险客户: '是' },
  },
  'AI-02': {
    filterSnapshot: { 逾期阶段: 'M2', 逾期天数区间: '31-60 天', 案件状态: '在催（未结案）', 客户类型: '个人消费贷', 排除规则: '导入客户池 220 户（M2 逾期），已排除法诉案件' },
    compliance: { 允许外呼时段: '09:00-12:00，14:00-18:00', 夜间禁呼拦截: '开启', 节假日拦截: '关闭' },
    callStrategy: { 单客户最大呼叫次数: 3, 呼叫失败重呼间隔: '6h', 无人接听重试次数: 2, 接通后不再重呼: '是' },
    intercept: { 屏蔽失联客户: '否', 已PTP客户: '是', 已协商客户: '是', 投诉风险客户: '是' },
  },
}

// 通话明细（样例，按 taskId 区分；无数据字段统一以 '-' 展示由页面处理）
export const ZZ_AI_CALL_DETAILS: Record<string, any[]> = {
  'AI-01': [
    { callId: 'AIC-501', cust: '张*明', caseNo: 'CO-202608-001', time: '2026-08-24 09:12', duration: 86, result: '接通', intent: '有还款意愿', ptp: true, recording: true, asr: true },
    { callId: 'AIC-502', cust: '李*华', caseNo: 'CO-202608-002', time: '2026-08-24 09:31', duration: 42, result: '拒接', intent: '-', ptp: false, recording: false, asr: false },
    { callId: 'AIC-503', cust: '王*芳', caseNo: 'CO-202608-003', time: '2026-08-24 10:05', duration: 0, result: '关机', intent: '-', ptp: false, recording: false, asr: false },
    { callId: 'AIC-504', cust: '陈*强', caseNo: 'CO-202608-004', time: '2026-08-24 10:22', duration: 0, result: '空号', intent: '-', ptp: false, recording: false, asr: false },
    { callId: 'AIC-505', cust: '刘*东', caseNo: 'CO-202608-005', time: '2026-08-24 10:48', duration: 121, result: '接通', intent: '需协商分期', ptp: false, recording: true, asr: true },
    { callId: 'AIC-506', cust: '赵*军', caseNo: 'CO-202608-006', time: '2026-08-24 11:10', duration: 0, result: '运营商拦截', intent: '-', ptp: false, recording: false, asr: false },
    { callId: 'AIC-507', cust: '孙*丽', caseNo: 'CO-202608-007', time: '2026-08-24 11:35', duration: 38, result: '接通', intent: '无还款意愿', ptp: false, recording: true, asr: true },
    { callId: 'AIC-508', cust: '周*敏', caseNo: 'CO-202608-008', time: '2026-08-24 14:03', duration: 0, result: '无人接听', intent: '-', ptp: false, recording: false, asr: false },
    { callId: 'AIC-509', cust: '吴*斌', caseNo: 'CO-202608-009', time: '2026-08-24 14:28', duration: 95, result: '接通', intent: '情绪激动', ptp: false, recording: true, asr: true, risk: true },
    { callId: 'AIC-510', cust: '郑*伟', caseNo: 'CO-202608-010', time: '2026-08-24 14:55', duration: 73, result: '接通', intent: '有还款意愿', ptp: true, recording: true, asr: true },
  ],
  'AI-02': [
    { callId: 'AIC-601', cust: '冯*涛', caseNo: 'CO-202608-101', time: '2026-08-20 09:20', duration: 110, result: '接通', intent: '需协商分期', ptp: false, recording: true, asr: true },
    { callId: 'AIC-602', cust: '蒋*磊', caseNo: 'CO-202608-102', time: '2026-08-20 09:41', duration: 0, result: '拒接', intent: '-', ptp: false, recording: false, asr: false },
    { callId: 'AIC-603', cust: '韩*宇', caseNo: 'CO-202608-103', time: '2026-08-20 10:12', duration: 0, result: '关机', intent: '-', ptp: false, recording: false, asr: false },
    { callId: 'AIC-604', cust: '杨*静', caseNo: 'CO-202608-104', time: '2026-08-20 10:39', duration: 64, result: '接通', intent: '有还款意愿', ptp: true, recording: true, asr: true },
    { callId: 'AIC-605', cust: '朱*浩', caseNo: 'CO-202608-105', time: '2026-08-20 11:02', duration: 0, result: '空号', intent: '-', ptp: false, recording: false, asr: false },
    { callId: 'AIC-606', cust: '秦*峰', caseNo: 'CO-202608-106', time: '2026-08-20 11:30', duration: 88, result: '接通', intent: '无还款意愿', ptp: false, recording: true, asr: true },
  ],
}

// 自动周期任务：历史执行批次（多批次对比复盘）
export const ZZ_AI_BATCHES: Record<string, any[]> = {
  'AI-01': [
    { batch: 'B20260824', time: '2026-08-24 09:00', fetched: 1200, called: 480, connectRate: '43.75%', promise: 23, status: '已完成' },
    { batch: 'B20260823', time: '2026-08-23 09:00', fetched: 1180, called: 462, connectRate: '41.10%', promise: 19, status: '已完成' },
    { batch: 'B20260822', time: '2026-08-22 09:00', fetched: 1195, called: 474, connectRate: '44.20%', promise: 25, status: '已完成' },
    { batch: 'B20260821', time: '2026-08-21 09:00', fetched: 1150, called: 451, connectRate: '39.80%', promise: 17, status: '已完成' },
  ],
}

// 全生命周期操作日志（样例，按 taskId）
export const ZZ_AI_OPLOG: Record<string, any[]> = {
  'AI-01': [
    { time: '2026-08-24 09:00', operator: '系统(自动)', action: '周期任务自动执行批次 B20260824', ip: '10.0.0.12' },
    { time: '2026-08-23 09:00', operator: '系统(自动)', action: '周期任务自动执行批次 B20260823', ip: '10.0.0.12' },
    { time: '2026-08-20 18:30', operator: '王经理(8821)', action: '暂停任务（外呼时段调整）', ip: '192.168.1.44' },
    { time: '2026-08-20 14:10', operator: '王经理(8821)', action: '修改呼叫策略：单客户最大呼叫次数 2→2（生效）', ip: '192.168.1.44' },
    { time: '2026-08-19 10:00', operator: '话术管理员(7703)', action: '创建周期任务，绑定话术模板「标准开场白」', ip: '192.168.1.30' },
  ],
  'AI-02': [
    { time: '2026-08-20 18:30', operator: '王经理(8821)', action: '手动暂停任务', ip: '192.168.1.44' },
    { time: '2026-08-20 09:00', operator: '王经理(8821)', action: '创建手动临时任务，导入客户池 220 户', ip: '192.168.1.44' },
  ],
}

/* AI协催报表（数据分析） */
export const ZZ_BI_AI = {
  totalCalls: 700, connected: 298, connectRate: 0.426, promiseRate: 0.18, toHumanRate: 0.08,
  byTemplate: [
    { name: '标准开场白', calls: 480, connectRate: 0.4375, promiseRate: 0.21 },
    { name: '承诺还款跟进', calls: 220, connectRate: 0.40, promiseRate: 0.14 },
  ],
  days: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
  trend: [20, 30, 25, 35, 28, 40, 22, 31, 26, 38, 30, 42, 24, 33, 29, 41, 27, 36, 31, 44, 25, 34, 28, 39, 30, 43, 26, 35, 29, 40],
  detail: [
    { id: 'AI-01', type: '自动周期', template: '标准开场白', status: '运行中', calls: 480, connectRate: '43.75%', promise: 23, toHuman: 12 },
    { id: 'AI-02', type: '手动临时', template: '承诺还款跟进', status: '已暂停', calls: 220, connectRate: '40.00%', promise: 9, toHuman: 5 },
  ],
}

/* ============================ 模块10 知识图谱增强（零侵入嵌入现有页面） ============================
   合规边界：仅使用系统已授权的内部数据（本人/紧急联系人/共借人/担保人/同址同设备逾期客户/历史关联案件），
   不直接外呼陌生关联人，仅作为风险研判与线索参考。 */
export type ZzGraphTag = '关联团伙逾期' | '疑似虚假资料' | '有稳定关联人' | '孤立高风险客户'
// 每个欠款客户的图谱画像（key = 案件ID）
export const ZZ_GRAPH_PROFILES: Record<string, any> = {
  'CO-202608-001': {
    center: '赵*强', phone: '138****2211', device: 'IMEI-A8821', addr: '杭州市西湖区文三路 100 号',
    tags: ['关联团伙逾期', '有稳定关联人', '疑似多头共债'] as ZzGraphTag[],
    gang: { inGang: true, gangId: 'G-03', gangSize: 6, level: '核心成员', risk: '高风险逃废债' },
    contacts: [
      { rel: '预留紧急联系人(合法可呼)', name: '赵*父', phone: '139****0001', reachable: true, risk: '正常' },
      { rel: '共同借款人', name: '赵*妻', phone: '137****0002', reachable: true, risk: '正常' },
      { rel: '单位同事', name: '吴*强', phone: '135****3344', reachable: true, risk: '关注' },
      { rel: '预留紧急联系人2', name: '赵*母', phone: '138****7788', reachable: false, risk: '正常' },
      { rel: '关联担保人', name: '孙*国', phone: '136****2211', reachable: true, risk: '关注' },
      { rel: '同单位上级', name: '周*经理', phone: '137****6611', reachable: true, risk: '正常' },
    ],
    sameAddr: ['孙*磊(CO-202608-004)', '刘*梅(CO-202608-003)', '王*芳(CO-202608-011)', '李*勇(CO-202608-012)'],
    sameDevice: ['孙*磊(CO-202608-004)', '刘*梅(CO-202608-003)'],
    history: ['CO-202601-014(已结清)', 'CO-202509-008(已结清)', 'CO-202506-021(已核销)'],
    lostRepair: { score: 82, reachable: true, hint: '优先联系预留紧急联系人赵*父，接通率高，可转告还款安排' },
    ability: '有关联人且有历史还款记录，疑似资金周转困难而非恶意逃废，委外+诉讼并行',
  },
  'CO-202608-004': {
    center: '孙*磊', phone: '135****7788', device: 'IMEI-A8821', addr: '杭州市西湖区文三路 100 号',
    tags: ['关联团伙逾期', '有稳定关联人'] as ZzGraphTag[],
    gang: { inGang: true, gangId: 'G-03', gangSize: 6, level: '普通成员', risk: '中风险' },
    contacts: [
      { rel: '预留紧急联系人(合法可呼)', name: '孙*母', phone: '135****0099', reachable: true, risk: '正常' },
      { rel: '同址关联人', name: '孙*弟', phone: '135****0100', reachable: true, risk: '关注' },
      { rel: '单位同事', name: '吴*强', phone: '135****3344', reachable: true, risk: '关注' },
    ],
    sameAddr: ['赵*强(CO-202608-001)', '刘*梅(CO-202608-003)', '王*芳(CO-202608-011)'],
    sameDevice: ['赵*强(CO-202608-001)'],
    history: ['CO-202602-009(已结清)'],
    lostRepair: { score: 70, reachable: true, hint: '同址关联人孙*母可触达，配合短信 + 关联人转告修复失联' },
    ability: '同址团伙成员但保留有效联系人，已提出分期意愿，可协商分期非恶意逃废',
  },
  'CO-202608-003': {
    center: '刘*梅', phone: '137****5566', device: 'IMEI-A8822', addr: '杭州市西湖区文三路 100 号',
    tags: ['关联团伙逾期'] as ZzGraphTag[],
    gang: { inGang: true, gangId: 'G-03', gangSize: 6, level: '普通成员', risk: '中风险' },
    contacts: [
      { rel: '预留紧急联系人(合法可呼)', name: '刘*姐', phone: '136****0066', reachable: true, risk: '正常' },
      { rel: '同址关联人', name: '刘*兄', phone: '136****0077', reachable: true, risk: '关注' },
      { rel: '单位同事', name: '吴*强', phone: '135****3344', reachable: true, risk: '关注' },
    ],
    sameAddr: ['赵*强(CO-202608-001)', '孙*磊(CO-202608-004)', '王*芳(CO-202608-011)'],
    sameDevice: ['赵*强(CO-202608-001)'],
    history: ['CO-202602-008(已结清)'],
    lostRepair: { score: 65, reachable: true, hint: '同址关联人刘*姐可触达，已承诺月底发工资后还款' },
    ability: '同址团伙成员但保留有效联系人，已口头承诺还款，建议坐席确认并绑定 PTP',
  },
  'CO-202608-002': {
    center: '张*明', phone: '139****3344', device: 'IMEI-C5501', addr: '杭州市滨江区江南大道 50 号',
    tags: ['有稳定关联人'] as ZzGraphTag[],
    gang: { inGang: false, gangId: '-', gangSize: 0, level: '-', risk: '低' },
    contacts: [
      { rel: '预留紧急联系人(合法可呼)', name: '张*国', phone: '137****2211', reachable: true, risk: '正常' },
      { rel: '单位电话', name: '单位', phone: '020****5566', reachable: true, risk: '正常' },
      { rel: '亲属', name: '张*妹', phone: '137****3322', reachable: true, risk: '正常' },
    ],
    sameAddr: ['陈*东(CO-202608-021)'],
    sameDevice: ['陈*东(CO-202608-021)'],
    history: ['CO-202512-031(已结清)', 'CO-202503-012(已结清)'],
    lostRepair: { score: 88, reachable: true, hint: '本人与单位电话均可达，承诺 8/28 还款 2 万，优先坐席跟进' },
    ability: '有稳定单位与紧急联系人，已承诺部分还款，还款意愿明确，重点确认履约',
  },
  'CO-202608-007': {
    center: '冯*军', phone: '139****5566', device: 'IMEI-B2207', addr: '成都市武侯区天府大道 88 号',
    tags: ['疑似虚假资料', '关联团伙逾期'] as ZzGraphTag[],
    gang: { inGang: true, gangId: 'G-07', gangSize: 3, level: '普通成员', risk: '中风险' },
    contacts: [
      { rel: '预留紧急联系人(合法可呼)', name: '冯*友', phone: '135****7788', reachable: false, risk: '关注' },
      { rel: '同址关联人', name: '冯*弟', phone: '135****7799', reachable: false, risk: '关注' },
    ],
    sameAddr: ['王*芳(CO-202608-008)', '何*平(CO-202608-009)'],
    sameDevice: ['王*芳(CO-202608-008)'],
    history: ['CO-202504-017(已结清)'],
    lostRepair: { score: 28, reachable: false, hint: '多次外呼未接通，同址同设备多人逾期疑似资料异常，建议转人工核实' },
    ability: '多次未接通且关联人不可达，疑似虚假资料，建议重点核查并升级委外',
  },
  'CO-202608-006': {
    center: '钱*华', phone: '138****1234', device: 'IMEI-D3309', addr: '成都市武侯区天府大道 88 号',
    tags: ['孤立高风险客户'] as ZzGraphTag[],
    gang: { inGang: false, gangId: '-', gangSize: 0, level: '-', risk: '低' },
    contacts: [
      { rel: '预留紧急联系人(合法可呼)', name: '钱*妻', phone: '138****1245', reachable: false, risk: '关注' },
    ],
    sameAddr: ['冯*军(CO-202608-007)'],
    sameDevice: [],
    history: ['CO-202508-030(已核销)'],
    lostRepair: { score: 8, reachable: false, hint: '无任何关联线索且已失联，已核销，建议直接委外/法务处置' },
    ability: '无关联人、失联，还款能力无法研判，已核销出表，不再主动催收',
  },
}
// 图谱风险标签颜色
export const ZZ_GRAPH_TAG_COLOR: Record<ZzGraphTag, string> = {
  '关联团伙逾期': '#DC2626', '疑似虚假资料': '#D97706', '有稳定关联人': '#16A34A', '孤立高风险客户': '#6B7280',
}
// 历史案件关联关系图谱样例（已结案/核销/诉讼结案客户的归档画像）
export const ZZ_HISTORY_GRAPH_SAMPLE: Record<string, any> = {
  center: '陈*伟', phone: '136****8833', device: 'IMEI-H1240', addr: '深圳市南山区科技园南路 12 号',
  tags: ['关联团伙逾期', '有稳定关联人'] as ZzGraphTag[],
  gang: { inGang: true, gangId: 'G-12', gangSize: 4, level: '核心成员', risk: '高风险逃废债' },
  contacts: [
    { rel: '预留紧急联系人(合法可呼)', name: '陈*母', phone: '138****1010', reachable: true },
    { rel: '共同借款人', name: '陈*弟', phone: '139****2020', reachable: true },
  ],
  sameAddr: ['周*丽(CO-202601-021)', '吴*强(CO-202603-009)'],
  sameDevice: ['周*丽(CO-202601-021)'],
  history: ['CO-202501-007(已结清)', 'CO-202509-018(已结清)'],
  lostRepair: { score: 75, reachable: true, hint: '结案前已通过紧急联系人陈*母修复触达，最终分期结清' },
  ability: '团伙核心成员但保留有效联系人与历史还款记录，已通过协商分期完成结案',
}
// 逾期团伙网络（社区发现聚类结果）
export const ZZ_GRAPH_GANGS = [
  { gangId: 'G-03', size: 3, members: ['赵*强(CO-202608-001)', '孙*磊(CO-202608-004)', '刘*梅(CO-202608-003)'], risk: '高', core: '赵*强', action: '建议提前拦截、重点跟进、升级法务，同址文三路100号多人逾期' },
  { gangId: 'G-07', size: 2, members: ['冯*军(CO-202608-007)', '王*芳(CO-202608-008)'], risk: '中', core: '冯*军', action: '同址天府大道88号疑似资料异常，监控关联动向并转人工核实' },
]
// 失联修复潜力排行（按可达性得分）
export const ZZ_GRAPH_REPAIR = [
  { caseId: 'CO-202608-001', name: '赵*强', score: 82, hit: '有合法预留联系人' },
  { caseId: 'CO-202608-011', name: '周*敏', score: 64, hit: '同址关联人可触达' },
  { caseId: 'CO-202608-009', name: '孙*磊', score: 35, hit: '仅1个暂不可达联系人' },
  { caseId: 'CO-202608-006', name: '钱*华', score: 8, hit: '无关联线索' },
]
// 高风险关联客户 TOP 榜
export const ZZ_GRAPH_TOP = [
  { caseId: 'CO-202608-001', name: '赵*强', reason: '团伙核心 + 关联 2 名逾期', score: 96 },
  { caseId: 'CO-202608-009', name: '孙*磊', reason: '同址同设备多逾期', score: 88 },
  { caseId: 'CO-202608-011', name: '周*敏', reason: '团伙普通成员', score: 71 },
  { caseId: 'CO-202608-006', name: '钱*华', reason: '孤立高危失联', score: 55 },
]
// 委外机构图谱维度 KPI（线索利用率 / 团伙处置率 / 失联修复成功率）
export const ZZ_GRAPH_AGENCY_KPI: Record<string, any> = {
  'AG-01': { clueRate: 0.78, gangRate: 0.65, repairRate: 0.42, note: '线索利用率高，建议续聘' },
  'AG-02': { clueRate: 0.45, gangRate: 0.30, repairRate: 0.18, note: '线索利用率偏低，存在浪费案件质量，建议约谈调价' },
  'AG-03': { clueRate: 0.62, gangRate: 0.50, repairRate: 0.30, note: '中等，维持观察' },
}

/* ============================ 模块8 法务处置（单页聚合） ============================
   一个案件聚合全生命周期：评估 → 证据 → 立案 → 调解 → 执行 → 归档
   stage: 待诉讼评估 / 证据待整理 / 已立案 / 调解中 / 执行中 / 已归档
*/
export type ZzLegalStage = '待诉讼评估' | '证据待整理' | '已立案' | '调解中' | '执行中' | '已归档'
export const ZZ_LEGAL_STAGES: ZzLegalStage[] = ['待诉讼评估', '证据待整理', '已立案', '调解中', '执行中', '已归档']
export const ZZ_LEGAL_CASES: any[] = [
  {
    id: 'LS-001', caseId: 'CO-202608-001', name: '赵*强', idcard: '3301**********1234', phone: '138****6601',
    addr: '杭州市西湖区文三路 100 号', principal: 125000, interest: 18000, penalty: 13000, subject: 156000,
    stage: '待诉讼评估', lawyer: '浙江XX律师事务所·王律师', handler: '张法务', receivedAt: '2026-08-01', archived: false,
    evaluate: null,
    evidence: [],
    filing: null,
    mediates: [],
    exec: null,
    archive: null,
    logs: [{ at: '2026-08-01 09:00', op: '案件转入法务处置', by: '系统' }],
  },
  {
    id: 'LS-002', caseId: 'CO-202608-006', name: '钱*华', idcard: '5101**********5678', phone: '159****2288',
    addr: '成都市武侯区天府大道 88 号', principal: 76000, interest: 9000, penalty: 4000, subject: 89000,
    stage: '证据待整理', lawyer: '四川XX律师事务所·李律师', handler: '张法务', receivedAt: '2026-08-03', archived: false,
    evaluate: { litigable: '是', conclusion: '证据充分', note: '客户失联，有完整借款合同与放款流水，建议起诉', at: '2026-08-03 10:00', by: '张法务' },
    evidence: [
      { type: '借款合同', file: '借款合同.pdf', uploaded: '2026-08-05', by: '张法务' },
      { type: '放款流水', file: '放款凭证.pdf', uploaded: '2026-08-05', by: '张法务' },
      { type: '催收记录', file: '催收通话记录.pdf', uploaded: '2026-08-06', by: '张法务' },
    ],
    filing: null, mediates: [], exec: null, archive: null,
    logs: [
      { at: '2026-08-03 10:00', op: '完成诉讼评估，启动诉讼流程', by: '张法务' },
      { at: '2026-08-05 14:00', op: '上传证据材料：借款合同、放款凭证', by: '张法务' },
    ],
  },
  {
    id: 'LS-003', caseId: 'CO-202608-011', name: '周*敏', idcard: '3201**********3456', phone: '133****9056',
    addr: '南京市鼓楼区中山路 30 号', principal: 82000, interest: 11000, penalty: 5000, subject: 98000,
    stage: '已立案', lawyer: '江苏XX律师事务所·陈律师', handler: '李法务', receivedAt: '2026-08-04', archived: false,
    evaluate: { litigable: '是', conclusion: '证据充分', note: '客户有房产线索', at: '2026-08-04 09:30', by: '李法务' },
    evidence: [
      { type: '借款合同', file: '借款合同.pdf', uploaded: '2026-08-06', by: '李法务' },
      { type: '外访报告', file: '外访报告.pdf', uploaded: '2026-08-07', by: '李法务' },
    ],
    filing: { court: '南京市鼓楼区法院', time: '2026-08-10', no: '(2026)苏0106民初5678号', fee: 2300, judge: '吴法官', openTime: '2026-09-15', receipt: '受理通知书.pdf', at: '2026-08-10 11:00', by: '李法务' },
    mediates: [], exec: null, archive: null,
    logs: [
      { at: '2026-08-04 09:30', op: '完成诉讼评估，启动诉讼流程', by: '李法务' },
      { at: '2026-08-06 10:00', op: '上传证据材料', by: '李法务' },
      { at: '2026-08-10 11:00', op: '完成立案登记，案号(2026)苏0106民初5678号', by: '李法务' },
    ],
  },
  {
    id: 'LS-004', caseId: 'CO-202608-002', name: '张*明', idcard: '4401**********7890', phone: '137****4412',
    addr: '广州市天河区天河路 200 号', principal: 36000, interest: 4000, penalty: 2000, subject: 42000,
    stage: '调解中', lawyer: '广东XX律师事务所·黄律师', handler: '李法务', receivedAt: '2026-08-05', archived: false,
    evaluate: { litigable: '是', conclusion: '证据充分', note: '小额，优先调解', at: '2026-08-05 09:00', by: '李法务' },
    evidence: [{ type: '借款合同', file: '借款合同.pdf', uploaded: '2026-08-07', by: '李法务' }],
    filing: { court: '广州市天河区法院', time: '2026-08-12', no: '(2026)粤0106民初9012号', fee: 950, judge: '林法官', openTime: '2026-08-20', receipt: '受理通知书.pdf', at: '2026-08-12 10:00', by: '李法务' },
    mediates: [
      { time: '2026-08-18', type: '诉前调解', org: 'XX调解中心', content: '客户希望分期 6 期', result: '达成调解协议', doc: '调解书.pdf', at: '2026-08-18 15:00', by: '李法务' },
    ],
    exec: null, archive: null,
    logs: [
      { at: '2026-08-05 09:00', op: '完成诉讼评估，启动诉讼流程', by: '李法务' },
      { at: '2026-08-12 10:00', op: '完成立案登记', by: '李法务' },
      { at: '2026-08-18 15:00', op: '新增诉前调解记录，达成分期调解', by: '李法务' },
    ],
  },
  {
    id: 'LS-005', caseId: 'CO-202607-013', name: '孙*浩', idcard: '4201**********1122', phone: '186****7733',
    addr: '武汉市江汉区解放大道 50 号', principal: 50000, interest: 6000, penalty: 3000, subject: 59000,
    stage: '执行中', lawyer: '湖北XX律师事务所·周律师', handler: '王法务', receivedAt: '2026-07-20', archived: false,
    evaluate: { litigable: '是', conclusion: '证据充分', note: '已判决', at: '2026-07-20 09:00', by: '王法务' },
    evidence: [{ type: '借款合同', file: '借款合同.pdf', uploaded: '2026-07-22', by: '王法务' }],
    filing: { court: '武汉市江汉区法院', time: '2026-07-25', no: '(2026)鄂0103民初3456号', fee: 1280, judge: '郑法官', openTime: '2026-08-10', receipt: '受理通知书.pdf', at: '2026-07-25 10:00', by: '王法务' },
    mediates: [{ time: '2026-08-12', type: '诉中调解', org: '承办法官', content: '调解失败，客户拒不到庭', result: '调解失败', doc: '', at: '2026-08-12 16:00', by: '王法务' }],
    exec: { no: '(2026)鄂0103执2345号', court: '武汉市江汉区法院', applyTime: '2026-08-15', property: '冻结银行账户，查封车辆', recovery: 8000, result: '执行中', at: '2026-08-15 09:30', by: '王法务' },
    archive: null,
    logs: [
      { at: '2026-07-20 09:00', op: '完成诉讼评估，启动诉讼流程', by: '王法务' },
      { at: '2026-07-25 10:00', op: '完成立案登记', by: '王法务' },
      { at: '2026-08-12 16:00', op: '调解失败，流转开庭审理', by: '王法务' },
      { at: '2026-08-15 09:30', op: '申请执行，执行案号(2026)鄂0103执2345号', by: '王法务' },
    ],
  },
  {
    id: 'LS-006', caseId: 'CO-202603-004', name: '林*生', idcard: '3501**********3344', phone: '152****3344',
    addr: '福州市鼓楼区五四路 9 号', principal: 64000, interest: 9000, penalty: 4000, subject: 77000,
    stage: '已归档', lawyer: '福建XX律师事务所·吴律师', handler: '王法务', receivedAt: '2026-03-10', archived: true,
    evaluate: { litigable: '是', conclusion: '证据充分', note: '调解结案', at: '2026-03-10 09:00', by: '王法务' },
    evidence: [{ type: '借款合同', file: '借款合同.pdf', uploaded: '2026-03-12', by: '王法务' }],
    filing: { court: '福州市鼓楼区法院', time: '2026-03-15', no: '(2026)闽0102民初5678号', fee: 1100, judge: '何法官', openTime: '2026-03-28', receipt: '受理通知书.pdf', at: '2026-03-15 10:00', by: '王法务' },
    mediates: [{ time: '2026-03-20', type: '诉前调解', org: 'XX调解中心', content: '一次性还款 5 万结清', result: '调解结案', doc: '调解书.pdf', at: '2026-03-20 15:00', by: '王法务' }],
    exec: null,
    archive: { closeType: '调解结案', closeDate: '2026-03-25', summary: '调解一次性结清，案件闭环', files: ['判决书.pdf', '调解书.pdf'], at: '2026-03-25 17:00', by: '王法务' },
    logs: [
      { at: '2026-03-10 09:00', op: '完成诉讼评估，启动诉讼流程', by: '王法务' },
      { at: '2026-03-15 10:00', op: '完成立案登记', by: '王法务' },
      { at: '2026-03-20 15:00', op: '诉前调解结案', by: '王法务' },
      { at: '2026-03-25 17:00', op: '执行归档，调解结案', by: '王法务' },
    ],
  },
]

/* 法务处置报表（数据分析） */
export const ZZ_BI_LEGAL = {
  pendingEval: 1, filed: 3, mediateSuccess: 1, execApplied: 1, execRecovery: 8000, endRate: 0.0, closed: 2,
  stages: [
    { stage: '待诉讼评估', count: 1 }, { stage: '证据待整理', count: 1 }, { stage: '已立案', count: 1 },
    { stage: '调解中', count: 1 }, { stage: '执行中', count: 1 }, { stage: '已归档', count: 1 },
  ],
  // 近30日立案趋势
  days: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
  filingTrend: [0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1],
  detail: [
    { id: 'LS-001', client: '赵*强', eval: '未评估', evidence: '缺', filed: '未立案', mediate: '-', exec: '-', closed: '-' },
    { id: 'LS-002', client: '钱*华', eval: '证据充分', evidence: '齐', filed: '未立案', mediate: '-', exec: '-', closed: '-' },
    { id: 'LS-003', client: '周*敏', eval: '证据充分', evidence: '齐', filed: '已立案', mediate: '-', exec: '-', closed: '-' },
    { id: 'LS-004', client: '张*明', eval: '证据充分', evidence: '齐', filed: '已立案', mediate: '调解成功', exec: '-', closed: '-' },
    { id: 'LS-005', client: '孙*浩', eval: '证据充分', evidence: '齐', filed: '已立案', mediate: '失败', exec: '执行中', closed: '-' },
    { id: 'LS-006', client: '林*生', eval: '证据充分', evidence: '齐', filed: '已立案', mediate: '结案', exec: '-', closed: '调解结案' },
  ],
}

/* ============================ 模块9 BI ============================ */
export const ZZ_BI = {
  // ---- 一、总览驾驶舱 ----
  overview: {
    // 业务规模
    intakeCustomers: 1240, intakeAmount: 18600000, inCollect: 386, balance: 52300000,
    // 回款效果
    recovery: 1680000, recoveryCustomers: 268, recoveryRate: 0.37,
    recoveryRate7: 0.41, recoveryRate30: 0.52,
    // 运营效率
    calls: 48200, connects: 27100, connectRate: 0.562, agentsOnline: 42,
    // 委外板块
    outsourceCustomers: 412, outsourceRatio: 0.34, outsourceRecovery: 398000,
    // 质量风险
    qaTickets: 860, violationRate: 0.046, pendingTickets: 37,
    // 同比/环比（正负表示增减，用于箭头与告警）+ 阈值告警
    mom: {
      intakeCustomers: 0.08, intakeAmount: 0.11, inCollect: 0.03, balance: -0.02,
      recovery: 0.12, recoveryCustomers: 0.09, recoveryRate: 0.04,
      recoveryRate7: 0.02, recoveryRate30: 0.06,
      calls: 0.05, connects: 0.07, connectRate: 0.03, agentsOnline: 0.0,
      outsourceCustomers: 0.04, outsourceRatio: -0.01, outsourceRecovery: 0.10,
      qaTickets: 0.15, violationRate: 0.06, pendingTickets: 0.21,
    },
    // 近30日双轴趋势（入催金额/回款金额，单位万）
    trendDays: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
    intakeAmountTrend: [62, 58, 71, 66, 74, 80, 69, 73, 77, 82, 79, 85, 88, 76, 84, 90, 86, 92, 81, 88, 95, 91, 87, 99, 94, 102, 89, 96, 103, 108],
    recoveryAmountTrend: [40, 44, 47, 43, 51, 55, 48, 52, 56, 60, 57, 62, 66, 58, 64, 69, 63, 71, 60, 67, 73, 70, 66, 78, 74, 81, 70, 76, 83, 88],
    // 逾期账龄分布（户）
    ageDist: [520, 152, 141, 93],
    // 催收渠道占比（内部坐席/委外）
    channelDist: [{ name: '内部坐席', value: 828 }, { name: '委外机构', value: 412 }],
    // 各团队回款率 / 接通率排行
    teams: [
      { name: '华东一组', recoveryRate: 0.46, connectRate: 0.61 },
      { name: '华东二组', recoveryRate: 0.43, connectRate: 0.58 },
      { name: '华南组', recoveryRate: 0.39, connectRate: 0.55 },
      { name: '华北组', recoveryRate: 0.34, connectRate: 0.49 },
      { name: '委外中心', recoveryRate: 0.38, connectRate: 0.52 },
    ],
    // 风险告警面板（异常指标，高亮红标，可跳转）
    alerts: [
      { level: 'red', text: '逾期增量突增：今日入催环比 +8.2%', to: 'zz:bi-intake' },
      { level: 'red', text: '回款大幅下滑：近7日回款率较30日 -11%', to: 'zz:bi-repayment' },
      { level: 'yellow', text: '接通率暴跌：华北组接通率 49%（低于阈值 55%）', to: 'zz:bi-connect' },
      { level: 'red', text: '委外机构异常：AG-03 近3日回款为 0', to: 'zz:bi-agency' },
      { level: 'yellow', text: '质检违规飙升：待整改工单 +21%', to: 'zz:bi-qa' },
    ],
  },

  // ---- 二、入催报表 ----
  intake: {
    customers: 1240, principal: 18600000, count: 1310, unassigned: 86,
    highRiskRatio: 0.18, lostRatio: 0.22,
    // 近30日每日入催户数/金额（万）
    dailyDays: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
    dailyCustomers: [41, 38, 47, 44, 49, 52, 45, 48, 51, 55, 53, 57, 59, 51, 56, 60, 58, 62, 54, 59, 64, 61, 58, 67, 63, 69, 60, 65, 70, 73],
    dailyAmount: [62, 58, 71, 66, 74, 80, 69, 73, 77, 82, 79, 85, 88, 76, 84, 90, 86, 92, 81, 88, 95, 91, 87, 99, 94, 102, 89, 96, 103, 108],
    // 账龄分布（堆叠）
    ageStack: [
      { name: 'M0', data: [12, 14, 15, 13, 16, 18, 14, 17, 19, 20, 18, 21] },
      { name: 'M1', data: [18, 16, 20, 19, 22, 21, 19, 23, 24, 22, 25, 27] },
      { name: 'M2', data: [9, 8, 11, 10, 12, 13, 11, 14, 15, 13, 16, 17] },
      { name: 'M3+', data: [5, 4, 6, 5, 7, 8, 6, 9, 10, 8, 11, 12] },
    ],
    ageMonths: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
    // 产品 / 风险等级占比
    productDist: [{ name: '现金贷', value: 540 }, { name: '消费分期', value: 420 }, { name: '信用贷', value: 200 }, { name: '车抵贷', value: 80 }],
    riskDist: [{ name: '高', value: 223 }, { name: '中', value: 642 }, { name: '低', value: 375 }],
    // 明细列表
    detail: [
      { id: 'CO-202608-101', cust: '张*明', age: 'M2', amount: 42000, status: '已分配' },
      { id: 'CO-202608-102', cust: '李*华', age: 'M1', amount: 18600, status: '待分配' },
      { id: 'CO-202608-103', cust: '王*强', age: 'M3+', amount: 98000, status: '已分配' },
      { id: 'CO-202608-104', cust: '赵*丽', age: 'M1', amount: 12300, status: '退回' },
      { id: 'CO-202608-105', cust: '陈*东', age: 'M2', amount: 56700, status: '搁置' },
      { id: 'CO-202608-106', cust: '刘*洋', age: 'M0', amount: 8900, status: '已分配' },
    ],
  },

  // ---- 三、回款报表 ----
  repayment: {
    customers: 268, amount: 1680000, principal: 1320000, interest: 360000,
    amountRate: 0.37, custRate: 0.41, partial: 142, full: 126,
    // 口径：当日/7日/30日
    caliber: {
      '当日': { customers: 12, amount: 86000, amountRate: 0.34, custRate: 0.39 },
      '7日': { customers: 76, amount: 480000, amountRate: 0.41, custRate: 0.45 },
      '30日': { customers: 268, amount: 1680000, amountRate: 0.52, custRate: 0.61 },
    },
    // 近30日每日回款金额(万) & 回款率
    dailyDays: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
    dailyAmount: [40, 44, 47, 43, 51, 55, 48, 52, 56, 60, 57, 62, 66, 58, 64, 69, 63, 71, 60, 67, 73, 70, 66, 78, 74, 81, 70, 76, 83, 88],
    dailyRate: [0.30, 0.32, 0.33, 0.31, 0.35, 0.37, 0.34, 0.36, 0.39, 0.41, 0.38, 0.42, 0.44, 0.39, 0.43, 0.46, 0.42, 0.47, 0.40, 0.45, 0.48, 0.46, 0.43, 0.50, 0.47, 0.52, 0.45, 0.49, 0.53, 0.56],
    // 分组柱状：各团队/坐席回款率排行（取团队维度）
    rank: [
      { name: '华东一组', rate: 0.46 }, { name: '华东二组', rate: 0.43 }, { name: '华南组', rate: 0.39 },
      { name: '委外中心', rate: 0.38 }, { name: '华北组', rate: 0.34 }, { name: 'AG-01', rate: 0.41 }, { name: 'AG-02', rate: 0.33 },
    ],
    // 堆叠：全额结清 / 部分还款 占比
    settleDist: [{ name: '全额结清', value: 126 }, { name: '部分还款', value: 142 }],
    // 明细
    detail: [
      { id: 'CO-202608-103', cust: '王*强', should: 98000, actual: 98000, time: '2026-08-24', owner: '王雷' },
      { id: 'CO-202608-101', cust: '张*明', should: 42000, actual: 20000, time: '2026-08-24', owner: '李娜' },
      { id: 'CO-202608-102', cust: '李*华', should: 18600, actual: 18600, time: '2026-08-23', owner: 'AG-01' },
      { id: 'CO-202608-105', cust: '陈*东', should: 56700, actual: 30000, time: '2026-08-23', owner: '赵敏' },
      { id: 'CO-202608-106', cust: '刘*洋', should: 8900, actual: 8900, time: '2026-08-22', owner: 'AG-01' },
    ],
  },

  // ---- 四、接通率报表 ----
  connect: {
    totalCalls: 48200, validCalls: 36100, connected: 27100, connectRate: 0.562,
    // 呼叫结果分布
    resultDist: [
      { name: '接通', value: 27100 }, { name: '无人接听', value: 11200 }, { name: '关机', value: 4200 },
      { name: '空号', value: 2800 }, { name: '拒接', value: 1900 }, { name: '黑名单', value: 1000 },
    ],
    // 各坐席/团队接通率排行
    rank: [
      { name: '王雷', rate: 0.68 }, { name: '李娜', rate: 0.65 }, { name: '赵敏', rate: 0.61 },
      { name: '华东一组', rate: 0.61 }, { name: '华南组', rate: 0.55 }, { name: '华北组', rate: 0.49, abnormal: true },
      { name: '孙浩', rate: 0.38, abnormal: true },
    ],
    // 24小时分时段接通率
    hours: Array.from({ length: 24 }, (_, i) => `${i}:00`),
    hourlyRate: [0.21, 0.18, 0.15, 0.12, 0.10, 0.13, 0.22, 0.35, 0.48, 0.57, 0.63, 0.66, 0.64, 0.61, 0.59, 0.62, 0.65, 0.67, 0.63, 0.58, 0.54, 0.47, 0.39, 0.28],
    // 坐席明细
    detail: [
      { agent: '王雷', calls: 820, connected: 558, rate: 0.68, invalid: 60 },
      { agent: '李娜', calls: 760, connected: 494, rate: 0.65, invalid: 80 },
      { agent: '赵敏', calls: 710, connected: 433, rate: 0.61, invalid: 110 },
      { agent: '孙浩', calls: 690, connected: 262, rate: 0.38, invalid: 320 },
      { agent: '华北组', calls: 1500, connected: 735, rate: 0.49, invalid: 510 },
    ],
  },

  // ---- 五、委外报表 ----
  agency: {
    customers: 412, balance: 21500000,
    recoveryCustomers: 158, recoveryAmount: 398000, recoveryRate: 0.385,
    commission: 51360, commissionRatio: 0.129,
    // 各机构
    agencies: [
      { name: 'AG-01', cases: 126, balance: 6800000, recovery: 280000, rate: 0.41, commission: 36400, complaints: 1, violation: 0, trend: [9, 11, 12, 14, 15, 16] },
      { name: 'AG-02', cases: 98, balance: 5200000, recovery: 118000, rate: 0.33, commission: 14960, complaints: 3, violation: 1, trend: [7, 6, 8, 7, 8, 9] },
      { name: 'AG-03', cases: 110, balance: 5600000, recovery: 0, rate: 0.0, commission: 0, complaints: 5, violation: 2, trend: [10, 9, 8, 5, 2, 0], abnormal: true },
      { name: 'AG-04', cases: 78, balance: 3900000, recovery: 96000, rate: 0.39, commission: 12480, complaints: 0, violation: 0, trend: [5, 6, 7, 8, 9, 11] },
    ],
    months: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6'],
  },

  // ---- 六、质检报表 ----
  qa: {
    total: 860, sampled: 860, coverage: 1.0,
    pass: 821, fail: 39, passRate: 0.955,
    // 违规类型分布
    violationDist: [
      { name: '威胁恐吓', value: 8 }, { name: '骚扰', value: 11 }, { name: '辱骂', value: 6 },
      { name: '诱导承诺', value: 9 }, { name: '泄露信息', value: 5 },
    ],
    // 各团队/坐席违规排行
    rank: [
      { name: '王雷', count: 2 }, { name: '孙浩', count: 3, abnormal: true }, { name: '华北组', count: 5, abnormal: true },
      { name: '华东一组', count: 1 }, { name: '华南组', count: 2 },
    ],
    // 每日质检通过率趋势
    days: Array.from({ length: 30 }, (_, i) => `D${i + 1}`),
    passRateTrend: [0.94, 0.95, 0.95, 0.93, 0.96, 0.95, 0.94, 0.95, 0.96, 0.95, 0.94, 0.95, 0.96, 0.95, 0.94, 0.93, 0.92, 0.94, 0.95, 0.96, 0.95, 0.94, 0.93, 0.95, 0.96, 0.95, 0.94, 0.93, 0.92, 0.91],
    // 工单明细（可跳转录音回放）
    tickets: [
      { id: 'QA-2601', agent: '孙浩', type: '威胁恐吓', status: '待整改', time: '2026-08-24' },
      { id: 'QA-2602', agent: '王雷', type: '诱导承诺', status: '已完成', time: '2026-08-24' },
      { id: 'QA-2603', agent: '华北组', type: '辱骂', status: '待整改', time: '2026-08-23' },
      { id: 'QA-2604', agent: '李娜', type: '骚扰', status: '已整改', time: '2026-08-23' },
      { id: 'QA-2605', agent: '孙浩', type: '泄露信息', status: '驳回整改', time: '2026-08-22' },
    ],
    statusColor: { '待整改': '#DC2626', '已整改': '#16A34A', '驳回整改': '#DC2626', '待质检': '#9CA3AF', '已完成': '#1677ff' },
  },
}
