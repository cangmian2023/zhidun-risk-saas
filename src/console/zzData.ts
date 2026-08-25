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
  { id: 'CO-202601-017', name: '陈*东', total: 23000, closeType: '已结清', closeTime: '2026-03-12' },
  { id: 'CO-202602-009', name: '黄*丽', total: 56000, closeType: '核销', closeTime: '2026-05-20' },
  { id: 'CO-202603-004', name: '林*生', total: 41000, closeType: '诉讼结案', closeTime: '2026-06-30' },
  { id: 'CO-202608-000', name: '郑*国', total: 22800, closeType: '已结清', closeTime: '2026-08-21' },
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
  channel: '外呼' | '短信' | '微信' | '上门'; recording: boolean; ptpId?: string
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
export const ZZ_STRATEGIES: ZzStrategy[] = [
  { id: 'st-m0', name: 'M0 还款提醒策略', stageRange: 'M0', enabled: true, version: 'v3.2', created: '2026-07-01' },
  { id: 'st-m1', name: 'M1 短信+外呼策略', stageRange: 'M1', enabled: true, version: 'v2.8', created: '2026-06-18' },
  { id: 'st-m2', name: 'M2 外呼+函件策略', stageRange: 'M2', enabled: true, version: 'v4.1', created: '2026-07-22' },
  { id: 'st-m3', name: 'M3+ 委外+法诉策略', stageRange: 'M3+', enabled: false, version: 'v1.5', created: '2026-05-09' },
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
// 分流统计：sid 关联所属策略，支持监控页按策略筛选
export const ZZ_STRATEGY_EXEC = [
  { sid: 'st-m2', branch: '账龄 M2', inflow: 312, ai: 80, sms: 120, human: 112 },
  { sid: 'st-m2', branch: '金额≥5万', inflow: 96, ai: 20, sms: 30, human: 46 },
  { sid: 'st-m2', branch: '标签-失联', inflow: 41, ai: 5, sms: 12, human: 24 },
  { sid: 'st-m1', branch: '账龄 M1', inflow: 528, ai: 180, sms: 260, human: 88 },
  { sid: 'st-m0', branch: '账龄 M0', inflow: 1024, ai: 600, sms: 424, human: 0 },
  { sid: 'st-m3', branch: '账龄 M3+', inflow: 73, ai: 0, sms: 18, human: 55 },
]
export interface ZzStrategyException { time: string; sid: string; strategy: string; msg: string }
export const ZZ_STRATEGY_EXCEPTIONS: ZzStrategyException[] = [
  { time: '2026-08-24 09:12', sid: 'st-m2', strategy: 'M2 外呼+函件策略', msg: '坐席组 催收二组 产能不足，3 件超时回收' },
  { time: '2026-08-24 11:40', sid: 'st-m1', strategy: 'M1 短信+外呼策略', msg: '短信网关延迟 12s' },
  { time: '2026-08-23 22:05', sid: 'st-m3', strategy: 'M3+ 委外+法诉策略', msg: '法诉节点调用司法接口超时 1 次' },
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
  tags: string[]; status: ZzCaseStatus; aiCalled: boolean
}
export const ZZ_AGENT_POOL: ZzAgentCase[] = [
  { id: 'CO-202608-002', name: '张*明', idno: '4401**********5678', phone: '139****3344', contract: 'HT-2025-0923', total: 42000, stage: 'M2', overdueDays: 60, principal: 40000, interest: 1260, penalty: 2000, promise: '2026-08-28', promiseDue: '2026-08-28', lastNote: '承诺还款 2 万', tags: ['📝有还款承诺', '🤖AI已外呼'], status: '承诺到期', aiCalled: true },
  { id: 'CO-202608-003', name: '刘*梅', idno: '5101**********9012', phone: '137****5566', contract: 'HT-2026-0115', total: 6800, stage: 'M1', overdueDays: 20, principal: 6500, interest: 130, penalty: 300, promise: '2026-08-27', promiseDue: '2026-08-27', lastNote: '月底发工资后还款', tags: ['📝有还款承诺', '🤖AI已外呼'], status: '待回款', aiCalled: true },
  { id: 'CO-202608-004', name: '孙*磊', idno: '3201**********3456', phone: '135****7788', contract: 'HT-2026-0208', total: 3500, stage: 'M1', overdueDays: 15, principal: 3400, interest: 60, penalty: 100, promise: '-', promiseDue: '', lastNote: '已确认分期方案', tags: ['🤝已协商方案', '🤖AI已外呼'], status: '协商中', aiCalled: true },
  { id: 'CO-202608-007', name: '冯*军', idno: '3701**********3344', phone: '139****5566', contract: 'HT-2025-1102', total: 15000, stage: 'M2', overdueDays: 65, principal: 14500, interest: 320, penalty: 500, promise: '-', promiseDue: '', lastNote: '多次外呼未接通', tags: ['❌多次未接通', '失联'], status: '待跟进', aiCalled: true },
]

/* —— 自动策略执行日志：策略画布产出（AI机器人/短信/分配人工），坐席工作台只读查看 —— */
export interface ZzAiLog { time: string; action: 'AI外呼' | '催收短信' | '分配人工'; result: string; recording: boolean }
export const ZZ_AGENT_AI_LOG: Record<string, ZzAiLog[]> = {
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
export interface ZzAgencyCallback { time: string; caseId: string; agency: string; client: string; feedback: string; result: '有效' | '无效' }
export const ZZ_AGENCY_CALLBACKS: ZzAgencyCallback[] = [
  { time: '2026-08-24 15:00', caseId: 'CO-202608-001', agency: 'AG-01', client: '赵*强', feedback: '客户承诺 8/28 前部分还款 6 万', result: '有效' },
  { time: '2026-08-23 10:30', caseId: 'CO-202608-006', agency: 'AG-02', client: '钱*华', feedback: '多次联系无果，预留号码已停机', result: '无效' },
  { time: '2026-08-24 09:15', caseId: 'CO-202608-011', agency: 'AG-01', client: '何*东', feedback: '首次上门未遇，已留言并短信提醒', result: '有效' },
  { time: '2026-08-24 16:40', caseId: 'CO-202608-009', agency: 'AG-02', client: '黄*丽', feedback: '客户达成二次分期意向，待确认协议', result: '有效' },
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
export const ZZ_VISITORS = ['外访员A', '外访员B', '外访员C']

export const ZZ_VISITS: any[] = [
  {
    id: 'VS-001', caseId: 'CO-202608-001', name: '赵*强', phone: '138****6601', addr: '杭州市西湖区文三路 100 号', backupAddr: '杭州市西湖区文三路 102 号',
    priority: '普通', status: '待分配', assignee: '-', creator: '主管-王经理', createdAt: '2026-08-20 09:12', assignedAt: '', dueDate: '2026-08-25',
    overdueAmount: 86000, age: 'M2',
    punch: null,
    report: null,
    rejectReason: '',
    logs: [{ op: '创建任务', by: '主管-王经理', at: '2026-08-20 09:12', note: '由案件 CO-202608-001 推送创建' }],
  },
  {
    id: 'VS-002', caseId: 'CO-202608-007', name: '冯*军', phone: '159****2288', addr: '成都市武侯区天府大道 88 号', backupAddr: '成都市武侯区天府大道 90 号',
    priority: '紧急', status: '待外访', assignee: '外访员A', creator: '主管-王经理', createdAt: '2026-08-21 10:30', assignedAt: '2026-08-21 11:00', dueDate: '2026-08-24',
    overdueAmount: 124000, age: 'M3+',
    punch: null,
    report: null,
    rejectReason: '',
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
    report: null,
    rejectReason: '',
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
  { id: 'CALL-9001', time: '2026-08-24 10:12', target: '赵*强', phone: '138****6601', duration: '04:32', agent: '王雷(0012)', alertStatus: '命中告警', hitWords: ['不还钱就上门'],
    asr: [['坐席', '您这笔已经逾期了，请尽快处理。'], ['债务人', '我现在没钱。'], ['坐席', '不还钱就上门找你。'], ['债务人', '你们不能这样。']] },
  { id: 'CALL-9002', time: '2026-08-24 14:30', target: '张*明', phone: '137****4412', duration: '02:10', agent: '李娜(0015)', alertStatus: '正常', hitWords: [],
    asr: [['坐席', '您好，关于您的还款提醒。'], ['债务人', '我知道了，下周还。']] },
  { id: 'CALL-9003', time: '2026-08-23 09:48', target: '冯*军', phone: '159****2288', duration: '01:55', agent: '李娜(0015)', alertStatus: '命中告警', hitWords: ['明天再不还要后果'],
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
// 实时告警（债务人、误判状态、复核意见）
export const ZZ_QA_ALERTS: any[] = [
  { id: 'AL-01', time: '2026-08-24 10:13', agent: '王雷(0012)', debtor: '赵*强', call: 'CALL-9001', word: '不还钱就上门', level: '高', status: '待复核', note: '' },
  { id: 'AL-02', time: '2026-08-23 09:49', agent: '李娜(0015)', debtor: '冯*军', call: 'CALL-9003', word: '明天再不还要后果', level: '高', status: '已处理', note: '确认违规，已约谈坐席' },
  { id: 'AL-03', time: '2026-08-22 16:20', agent: '王雷(0012)', debtor: '孙*浩', call: 'CALL-9088', word: '保证三天内到账', level: '中', status: '误判', note: '客户主动承诺，非坐席违规承诺' },
]
// 事后质检任务（时间范围、抽样维度、打分模板、负责人、复核工作台打分）
export const ZZ_QA_TASKS: any[] = [
  { id: 'QT-01', name: '8月坐席抽样质检', range: '2026-08-01~2026-08-31', dim: '按坐席 10% 抽样', tpl: '催收质检标准打分表', total: 120, done: 60, owner: '质检组', records: ['CALL-9001', 'CALL-9002', 'CALL-9003'] },
]
// 质检打分模板：合规扣分维度
export const ZZ_QA_SCORE_TPL = [
  { item: '文明用语', desc: '无辱骂、无威胁恐吓', max: 25 },
  { item: '合规承诺', desc: '不违规承诺减免/延期', max: 25 },
  { item: '信息保密', desc: '不泄露债务给第三方', max: 25 },
  { item: '流程规范', desc: '身份核验、还款提醒完整', max: 25 },
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
    center: '赵*强', phone: '138****6601', device: 'IMEI-A8821', addr: '杭州市西湖区文三路 100 号',
    tags: ['关联团伙逾期', '有稳定关联人'] as ZzGraphTag[],
    gang: { inGang: true, gangId: 'G-03', gangSize: 6, level: '核心成员', risk: '高风险逃废债' },
    contacts: [
      { rel: '预留紧急联系人(合法可呼)', name: '赵*父', phone: '139****0001', reachable: true },
      { rel: '共同借款人', name: '赵*妻', phone: '137****0002', reachable: true },
    ],
    sameAddr: ['孙*磊(CO-202608-009)', '周*敏(CO-202608-011)'],
    sameDevice: ['孙*磊(CO-202608-009)'],
    history: ['CO-202601-014(已结清)'],
    lostRepair: { score: 82, reachable: true, hint: '优先联系预留紧急联系人赵*父，接通率高' },
    ability: '有关联人且有历史还款记录，疑似资金周转困难而非恶意逃废',
  },
  'CO-202608-009': {
    center: '孙*磊', phone: '138****6688', device: 'IMEI-A8821', addr: '杭州市西湖区文三路 100 号',
    tags: ['关联团伙逾期', '疑似虚假资料'] as ZzGraphTag[],
    gang: { inGang: true, gangId: 'G-03', gangSize: 6, level: '普通成员', risk: '中风险' },
    contacts: [{ rel: '预留紧急联系人(合法可呼)', name: '孙*母', phone: '135****0099', reachable: false }],
    sameAddr: ['赵*强(CO-202608-001)', '周*敏(CO-202608-011)'],
    sameDevice: ['赵*强(CO-202608-001)'],
    history: [],
    lostRepair: { score: 35, reachable: false, hint: '同址同设备多人逾期，疑似资料异常，建议转人工核实' },
    ability: '多客户共用地址与设备，疑似虚假资料，建议重点核查',
  },
  'CO-202608-006': {
    center: '钱*华', phone: '159****2288', device: 'IMEI-B2207', addr: '成都市武侯区天府大道 88 号',
    tags: ['孤立高风险客户'] as ZzGraphTag[],
    gang: { inGang: false, gangId: '-', gangSize: 0, level: '-', risk: '低' },
    contacts: [],
    sameAddr: [], sameDevice: [], history: [],
    lostRepair: { score: 8, reachable: false, hint: '无任何关联线索，建议直接走 AI 外呼 + 委外' },
    ability: '无关联人、失联，还款能力无法研判，建议委外跟进',
  },
}
// 图谱风险标签颜色
export const ZZ_GRAPH_TAG_COLOR: Record<ZzGraphTag, string> = {
  '关联团伙逾期': '#DC2626', '疑似虚假资料': '#D97706', '有稳定关联人': '#16A34A', '孤立高风险客户': '#6B7280',
}
// 逾期团伙网络（社区发现聚类结果）
export const ZZ_GRAPH_GANGS = [
  { gangId: 'G-03', size: 6, members: ['赵*强', '孙*磊', '周*敏', '刘*梅', '钱*华', '冯*军'], risk: '高', core: '赵*强', action: '建议提前拦截、重点跟进、升级法务' },
  { gangId: 'G-07', size: 3, members: ['张*明', '李*芳', '王*强'], risk: '中', core: '张*明', action: '集中话术施压、监控关联动向' },
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
