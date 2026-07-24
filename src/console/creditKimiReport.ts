// 信用风控报告 - 数据模型与示例数据
// 依据 doc/信息风控报告详情-kimi版.md（V2.0，2026-07-24）构建
// 页面结构与「信息核验」(PreVerifyDetail) 保持一致，本模型聚焦信用风控自有字段，不继承信息核验类型

export type CreditLevel = '低' | '中' | '高' | '极高' // 维度子项风险等级（沿用）
// 整体信用等级：分数越高信用越好（300-900 分区间）
export type CreditGrade = '差' | '一般' | '良好' | '优秀'
export type CreditSysResult = '处理中' | '通过' | '拒绝' | '预警'
export type CreditWorkStatus =
  | '—'
  | '待审核'
  | '提交复核'
  | '复核放行'
  | '复核拒绝'

// 评分区间 → 信用等级（300-900，越高越好）
export function gradeFromScore(score: number): CreditGrade {
  if (score >= 801) return '优秀'
  if (score >= 651) return '良好'
  if (score >= 501) return '一般'
  return '差'
}
// 信用等级 → 系统自动审核结果
export function autoDecisionFromGrade(grade: CreditGrade): CreditSysResult {
  if (grade === '优秀' || grade === '良好') return '通过'
  if (grade === '一般') return '预警'
  return '拒绝'
}

export interface CreditItem {
  name: string
  result: string
  score: number
  weight: number // 百分比数值（如 20 表示 20%）
}
export interface CreditDimension {
  key: string
  name: string
  score: number // 维度得分 0-100
  weight: number // 维度权重（百分比数值）
  level: CreditLevel
  items: CreditItem[]
  note?: string
}
export interface CreditImageItem {
  key: string
  label: string
  kind: 'image' | 'video'
  url: string
  ocr: string
}
export interface CreditLimitRow {
  scoreRange: string
  level: string
  limit: string
  rate: string
}
export interface CreditRecommendation {
  advice: string
  reason: string
  positive: string
  risk: string
  creditLimit: string
  limitTable: CreditLimitRow[]
}
export interface CreditPenalty {
  condition: string
  add: number
  hit: boolean
}
export interface CreditOpLog {
  id: string
  type: string
  content: string
  operator: string
  time: string
  result?: string
  remark?: string
}

export interface CreditKimiReport {
  appId: string
  name: string
  idNo: string // 脱敏身份证号
  reportTime: string
  creditScore: number // 信用评分 300-900，分数越高信用越好
  grade: CreditGrade // 信用等级（差/一般/良好/优秀）
  autoDecision: CreditSysResult // 自动审核结果
  creditAdvice: string // 授信建议
  dimensions: CreditDimension[] // 六大维度
  baseScore: number // 基础加权得分
  penalty: CreditPenalty[] // 叠加惩罚机制
  finalComputed: number // 基础分 + 叠加惩罚分
  images: CreditImageItem[] // 影像资料（复用信息核验证件照展示）
  recommendation: CreditRecommendation
  opLogs: CreditOpLog[]
  // 列表联动字段
  product: string
  channel: string
  amount: number
  workStatus: CreditWorkStatus
  operator: string
}

// ========================= 配色映射 =========================
// 维度子项风险等级（低绿/中黄/高橙/极高红，沿用）
export const CREDIT_LEVEL_KIND: Record<CreditLevel, 'green' | 'amber' | 'orange' | 'red'> = {
  低: 'green',
  中: 'amber',
  高: 'orange',
  极高: 'red',
}
// 整体信用等级徽标配色：差红/一般黄/良好青/优秀绿
export const CREDIT_GRADE_KIND: Record<CreditGrade, 'red' | 'amber' | 'cyan' | 'green'> = {
  差: 'red',
  一般: 'amber',
  良好: 'cyan',
  优秀: 'green',
}
// 整体信用等级文字色（与徽标配色一致，用于分数值上色）
export const CREDIT_GRADE_TEXT: Record<CreditGrade, string> = {
  差: 'text-rose-600',
  一般: 'text-amber-600',
  良好: 'text-cyan-600',
  优秀: 'text-emerald-600',
}
export const CREDIT_SYS_KIND: Record<CreditSysResult, 'gray' | 'green' | 'red' | 'amber'> = {
  处理中: 'gray',
  通过: 'green',
  拒绝: 'red',
  预警: 'amber',
}
export const CREDIT_WORK_KIND: Record<CreditWorkStatus, 'gray' | 'blue' | 'green' | 'amber' | 'red'> = {
  '—': 'gray',
  待审核: 'amber',
  提交复核: 'blue',
  复核放行: 'green',
  复核拒绝: 'red',
}

// ========================= 基础样本（王强 · 极高风险/拒绝，文档主样例） =========================
function buildBaseCreditReport(): CreditKimiReport {
  return {
    appId: 'PA-20260618-003',
    name: '王强',
    idNo: '110101********0314',
    reportTime: '2026-07-21 15:00:22',
    creditScore: 430,
    grade: '差',
    autoDecision: '拒绝',
    creditAdvice: '建议拒绝：信用极差，违约概率极高',
    dimensions: [
      {
        key: 'identity',
        name: '身份真实性',
        score: 92,
        weight: 20,
        level: '低',
        note: '公安实名、银行卡四要素、活体检测均通过',
        items: [
          { name: '公安实名核验', result: '通过，三要素一致', score: 100, weight: 40 },
          { name: '银行卡四要素核验', result: '通过，四要素一致', score: 100, weight: 30 },
          { name: '活体检测', result: '通过，人脸相似度 98.6%', score: 95, weight: 20 },
          { name: '运营商手机号实名核验', result: '通过，实名一致', score: 80, weight: 10 },
        ],
      },
      {
        key: 'repay',
        name: '还款能力',
        score: 65,
        weight: 25,
        level: '中',
        note: '月收入 25,000 元，负债率约 35%',
        items: [
          { name: '月收入', result: '25,000 元', score: 80, weight: 30 },
          { name: '负债率', result: '约 35%', score: 60, weight: 25 },
          { name: '工作稳定性', result: '入职 2 年，单位正常经营', score: 70, weight: 20 },
          { name: '学历水平', result: '本科', score: 60, weight: 15 },
          { name: '资产情况', result: '无房产/车辆登记', score: 40, weight: 10 },
        ],
      },
      {
        key: 'history',
        name: '信用历史',
        score: 38,
        weight: 25,
        level: '低',
        note: '跨行业联防联控库命中 1 条历史逾期',
        items: [
          { name: '征信查询次数', result: '近 3 个月查询 8 次', score: 50, weight: 20 },
          { name: '历史逾期记录', result: '跨行业联防联控库命中 1 条逾期', score: 20, weight: 30 },
          { name: '历史授信记录', result: '1 次通过，1 次拒绝', score: 40, weight: 20 },
          { name: '多头借贷情况', result: '当前有 2 笔未结清贷款', score: 30, weight: 20 },
          { name: '信用账户年龄', result: '首张信用卡开户 3 年', score: 60, weight: 10 },
        ],
      },
      {
        key: 'behavior',
        name: '行为稳定性',
        score: 55,
        weight: 10,
        level: '中',
        note: '手机号入网仅 21 天，不足 30 天',
        items: [
          { name: '手机号入网时长', result: '入网 21 天，不足 30 天', score: 30, weight: 30 },
          { name: '设备使用时长', result: '设备首次出现 7 天', score: 40, weight: 25 },
          { name: '申请频率', result: '近 30 天首次申请', score: 80, weight: 20 },
          { name: '居住稳定性', result: '居住地址 1 年内未变更', score: 70, weight: 15 },
          { name: '职业稳定性', result: '当前单位工作 2 年', score: 70, weight: 10 },
        ],
      },
      {
        key: 'device',
        name: '设备安全性',
        score: 28,
        weight: 10,
        level: '低',
        note: '设备存在 Root/越狱，关联多身份',
        items: [
          { name: 'Root/越狱状态', result: '已 Root', score: 10, weight: 30 },
          { name: '模拟器检测', result: '未检测到模拟器', score: 80, weight: 20 },
          { name: '设备关联身份数', result: '近 7 日关联 3 个身份', score: 20, weight: 25 },
          { name: '设备关联申请数', result: '近 30 日 12 次申请', score: 15, weight: 15 },
          { name: 'VPN/代理检测', result: '检测到 VPN', score: 40, weight: 10 },
        ],
      },
      {
        key: 'assoc',
        name: '关联风险',
        score: 48,
        weight: 10,
        level: '中',
        note: '关联设备存在风险，疑似号码共用',
        items: [
          { name: '设备关联风险', result: '设备关联 3 个身份，存在群控嫌疑', score: 30, weight: 30 },
          { name: '手机号关联风险', result: '手机号命中联防联控逾期记录', score: 40, weight: 25 },
          { name: 'IP 关联风险', result: 'IP 归属地与 GPS 偏差 >500km', score: 50, weight: 20 },
          { name: '银行卡关联风险', result: '银行卡未关联其他身份', score: 80, weight: 15 },
          { name: '团伙关联风险', result: '未命中已知团伙', score: 70, weight: 10 },
        ],
      },
    ],
    baseScore: 57.25,
    penalty: [
      { condition: '信用历史得分 < 40（存在逾期）', add: 10, hit: true },
      { condition: '设备安全性得分 < 40（设备异常）', add: 10, hit: true },
      { condition: '关联风险得分 < 50（关联风险）', add: 5, hit: true },
      { condition: '行为稳定性得分 < 60（行为异常）', add: 5, hit: true },
      { condition: '三个及以上维度得分 < 60', add: 5, hit: true },
    ],
    finalComputed: 92.25,
    images: [
      {
        key: 'idcard_front',
        label: '身份证人像面',
        kind: 'image',
        url: '/sample/idcard_front.jpg',
        ocr: '姓名: 王强  性别: 男  民族: 汉  出生: 1990-03-05  住址: 北京市朝阳区建国路 88 号  公民身份号码: 110101199003050314',
      },
      {
        key: 'idcard_back',
        label: '身份证国徽面',
        kind: 'image',
        url: '/sample/idcard_back.jpg',
        ocr: '签发机关: 北京市公安局朝阳分局  有效期限: 2015.01 - 2035.01',
      },
      {
        key: 'live',
        label: '活体人脸',
        kind: 'video',
        url: '/sample/live.jpg',
        ocr: '活体检测: 通过  动作: 眨眼/张嘴  质量分: 92  人脸相似度: 98.6%',
      },
      {
        key: 'bankcard',
        label: '银行卡',
        kind: 'image',
        url: '/sample/bankcard.jpg',
        ocr: '卡号: 6217003200001234567  发卡行: 中国工商银行  卡类型: 储蓄卡',
      },
    ],
    recommendation: {
      advice: '建议拒绝：信用极差，违约概率极高',
      reason: '信用历史差（命中逾期）+ 设备安全性低（Root+群控）+ 行为稳定性不足（新手机号）',
      positive: '身份真实性良好（92 分），还款能力尚可（65 分）',
      risk: '信用历史 38 分（命中逾期）、设备安全性 28 分（Root+群控）、行为稳定性 55 分（新手机号）',
      creditLimit: '——（信用评分 430 分 / 差，违约概率极高，不予授信）',
      limitTable: [
        { scoreRange: '801-900', level: '优秀', limit: '申请额度 100%，可提额', rate: '基准利率' },
        { scoreRange: '651-800', level: '良好', limit: '申请额度 100%', rate: '基准利率' },
        { scoreRange: '501-650', level: '一般', limit: '申请额度 30%', rate: '基准利率 +10%' },
        { scoreRange: '300-500', level: '差', limit: '拒绝', rate: '—' },
      ],
    },
    opLogs: [
      { id: 'ck1', type: '信用报告生成', content: '系统自动生成信用风控报告', operator: '系统', time: '2026-07-21 15:00:22', remark: '信用评分 430 分，信用等级：差' },
      { id: 'ck2', type: '关联风险检测', content: '设备关联 3 个身份，存在群控嫌疑', operator: '系统', time: '2026-07-21 14:58:30', result: '命中', remark: '关联身份：李某、张某、王某' },
      { id: 'ck3', type: '设备安全检测', content: '设备存在 Root/越狱', operator: '系统', time: '2026-07-21 14:57:45', result: '命中', remark: '设备指纹：DV-9F2A-77C1' },
      { id: 'ck4', type: '信用历史检测', content: '跨行业联防联控库命中 1 条逾期', operator: '系统', time: '2026-07-21 14:56:50', result: '命中', remark: '疑似号码共用' },
      { id: 'ck5', type: '行为稳定性检测', content: '手机号入网仅 21 天', operator: '系统', time: '2026-07-21 14:55:33', result: '命中', remark: '不足 30 天' },
      { id: 'ck6', type: '还款能力评估', content: '月收入 25,000 元，负债率 35%', operator: '系统', time: '2026-07-21 14:54:10', result: '通过', remark: '还款能力一般' },
      { id: 'ck7', type: '身份真实性核验', content: '公安实名、银行卡四要素通过', operator: '系统', time: '2026-07-21 14:52:00', result: '通过', remark: '身份真实有效' },
      { id: 'ck8', type: '申请提交', content: '用户提交申请', operator: '系统', time: '2026-07-21 14:50:00', remark: '申请额度 ¥30,000' },
    ],
    product: '信用贷',
    channel: 'H5',
    amount: 30000,
    workStatus: '—',
    operator: '--',
  }
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T
}

// 依据样例 id 返回对应状态：含 REJECT → 差/拒绝；含 WARNING → 一般/预警；含 PASS → 良好/通过；缺省 → 差样例
export function buildCreditKimiReport(id?: string): CreditKimiReport {
  const status: 'high' | 'warning' | 'pass' =
    id
      ? id.includes('REJECT')
        ? 'high'
        : id.includes('WARNING')
          ? 'warning'
          : id.includes('PASS')
            ? 'pass'
            : 'high'
      : 'high'

  if (status === 'high') return buildBaseCreditReport()

  const r = clone(buildBaseCreditReport())

  if (status === 'warning') {
    // 中风险 / 预警：降低各维度风险，基础分≈52，叠加惩罚 0，最终 52
    r.appId = 'PA-20260618-004'
    r.name = '赵*敏'
    r.idNo = '320***********2628'
    r.reportTime = '2026-07-21 15:00:22'
    r.creditScore = 580
    r.grade = '一般'
    r.autoDecision = '预警'
    r.creditAdvice = '建议限制额度：信用一般，存在一定违约风险'
    r.product = '经营贷'
    r.channel = 'APP'
    r.amount = 200000
    r.workStatus = '待审核'
    r.operator = '--'
    r.dimensions = [
      dim('identity', '身份真实性', 88, 20, '低', '公安实名、银行卡四要素一致', [
        it('公安实名核验', '通过，三要素一致', 100, 40),
        it('银行卡四要素核验', '通过，四要素一致', 100, 30),
        it('活体检测', '通过，人脸相似度 98.2%', 95, 20),
        it('运营商手机号实名核验', '通过，实名一致', 85, 10),
      ]),
      dim('repay', '还款能力', 60, 25, '中', '月收入 18,000 元，负债率约 28%', [
        it('月收入', '18,000 元', 70, 30),
        it('负债率', '约 28%', 65, 25),
        it('工作稳定性', '入职 1 年', 60, 20),
        it('学历水平', '大专', 55, 15),
        it('资产情况', '无房产', 45, 10),
      ]),
      dim('history', '信用历史', 55, 25, '低', '征信查询适中，无历史逾期', [
        it('征信查询次数', '近 3 个月查询 4 次', 60, 20),
        it('历史逾期记录', '未命中', 80, 30),
        it('历史授信记录', '2 次通过', 65, 20),
        it('多头借贷情况', '当前 1 笔未结清', 55, 20),
        it('信用账户年龄', '首卡开户 2 年', 60, 10),
      ]),
      dim('behavior', '行为稳定性', 58, 10, '中', '手机号入网 8 个月，行为正常', [
        it('手机号入网时长', '入网 8 个月', 70, 30),
        it('设备使用时长', '设备使用 200 天', 75, 25),
        it('申请频率', '近 30 天首次申请', 80, 20),
        it('居住稳定性', '居住地址稳定', 70, 15),
        it('职业稳定性', '当前单位工作 1 年', 60, 10),
      ]),
      dim('device', '设备安全性', 72, 10, '低', '设备未 Root，无异常', [
        it('Root/越狱状态', '未 Root', 90, 30),
        it('模拟器检测', '未检测到模拟器', 85, 20),
        it('设备关联身份数', '关联 1 个身份', 80, 25),
        it('设备关联申请数', '近 30 日 1 次申请', 80, 15),
        it('VPN/代理检测', '未检测到', 75, 10),
      ]),
      dim('assoc', '关联风险', 66, 10, '中', '关联设备轻微风险', [
        it('设备关联风险', '关联 1 个身份', 80, 30),
        it('手机号关联风险', '未命中逾期', 80, 25),
        it('IP 关联风险', 'IP 与 GPS 一致', 75, 20),
        it('银行卡关联风险', '未关联其他身份', 80, 15),
        it('团伙关联风险', '未命中已知团伙', 72, 10),
      ]),
    ]
    r.baseScore = 52
    r.penalty = [
      { condition: '信用历史得分 < 40（存在逾期）', add: 10, hit: false },
      { condition: '设备安全性得分 < 40（设备异常）', add: 10, hit: false },
      { condition: '关联风险得分 < 50（关联风险）', add: 5, hit: false },
      { condition: '行为稳定性得分 < 60（行为异常）', add: 5, hit: false },
      { condition: '三个及以上维度得分 < 60', add: 5, hit: false },
    ]
    r.finalComputed = 52
    r.recommendation = {
      advice: '建议限制额度：信用一般，存在一定违约风险',
      reason: '综合评分 580 分（一般），无显著高风险项，但还款能力与资产偏弱',
      positive: '身份真实性良好（88 分）、设备安全性正常（72 分）、无历史逾期',
      risk: '还款能力中等（60 分）、资产情况较弱（无房产）',
      creditLimit: '建议限制额度：申请额度的 30%（约 ¥60,000）',
      limitTable: buildBaseCreditReport().recommendation.limitTable,
    }
    r.opLogs = [
      { id: 'ckw1', type: '信用报告生成', content: '系统自动生成信用风控报告', operator: '系统', time: '2026-07-21 15:00:22', remark: '信用评分 580 分，信用等级：一般' },
      { id: 'ckw2', type: '还款能力评估', content: '月收入 18,000 元，负债率 28%', operator: '系统', time: '2026-07-21 14:54:10', result: '通过', remark: '还款能力中等' },
      { id: 'ckw3', type: '身份真实性核验', content: '公安实名、银行卡四要素通过', operator: '系统', time: '2026-07-21 14:52:00', result: '通过', remark: '身份真实有效' },
      { id: 'ckw4', type: '申请提交', content: '用户提交申请', operator: '系统', time: '2026-07-21 14:50:00', remark: '申请额度 ¥200,000' },
    ]
    return r
  }

  // pass：低风险 / 通过
  r.appId = 'PA-20260618-002'
  r.name = '张*伟'
  r.idNo = '510***********1234'
  r.reportTime = '2026-07-21 15:00:22'
  r.creditScore = 760
  r.grade = '良好'
  r.autoDecision = '通过'
  r.creditAdvice = '正常通过：信用良好，违约风险较低'
  r.product = '信用贷'
  r.channel = 'APP'
  r.amount = 80000
  r.workStatus = '—'
  r.operator = '--'
  r.dimensions = [
    dim('identity', '身份真实性', 96, 20, '低', '公安实名、银行卡四要素一致', [
      it('公安实名核验', '通过，三要素一致', 100, 40),
      it('银行卡四要素核验', '通过，四要素一致', 100, 30),
      it('活体检测', '通过，人脸相似度 99.1%', 98, 20),
      it('运营商手机号实名核验', '通过，实名一致', 90, 10),
    ]),
    dim('repay', '还款能力', 82, 25, '低', '月收入 30,000 元，负债率约 20%', [
      it('月收入', '30,000 元', 90, 30),
      it('负债率', '约 20%', 85, 25),
      it('工作稳定性', '入职 5 年，单位稳定', 85, 20),
      it('学历水平', '本科', 70, 15),
      it('资产情况', '有房产', 80, 10),
    ]),
    dim('history', '信用历史', 78, 25, '低', '征信良好，无历史逾期', [
      it('征信查询次数', '近 3 个月查询 2 次', 85, 20),
      it('历史逾期记录', '未命中', 90, 30),
      it('历史授信记录', '3 次通过', 85, 20),
      it('多头借贷情况', '无未结清贷款', 90, 20),
      it('信用账户年龄', '首卡开户 6 年', 85, 10),
    ]),
    dim('behavior', '行为稳定性', 80, 10, '低', '手机号入网 3 年，行为正常', [
      it('手机号入网时长', '入网 3 年', 90, 30),
      it('设备使用时长', '设备使用 400 天', 90, 25),
      it('申请频率', '近 30 天首次申请', 85, 20),
      it('居住稳定性', '居住地址稳定', 85, 15),
      it('职业稳定性', '当前单位工作 5 年', 85, 10),
    ]),
    dim('device', '设备安全性', 88, 10, '低', '设备未 Root，无异常', [
      it('Root/越狱状态', '未 Root', 95, 30),
      it('模拟器检测', '未检测到模拟器', 90, 20),
      it('设备关联身份数', '关联 1 个身份', 90, 25),
      it('设备关联申请数', '近 30 日 1 次申请', 90, 15),
      it('VPN/代理检测', '未检测到', 85, 10),
    ]),
    dim('assoc', '关联风险', 84, 10, '低', '无关联风险', [
      it('设备关联风险', '关联 1 个身份', 90, 30),
      it('手机号关联风险', '未命中逾期', 90, 25),
      it('IP 关联风险', 'IP 与 GPS 一致', 85, 20),
      it('银行卡关联风险', '未关联其他身份', 90, 15),
      it('团伙关联风险', '未命中已知团伙', 85, 10),
    ]),
  ]
  r.baseScore = 15
  r.penalty = [
    { condition: '信用历史得分 < 40（存在逾期）', add: 10, hit: false },
    { condition: '设备安全性得分 < 40（设备异常）', add: 10, hit: false },
    { condition: '关联风险得分 < 50（关联风险）', add: 5, hit: false },
    { condition: '行为稳定性得分 < 60（行为异常）', add: 5, hit: false },
    { condition: '三个及以上维度得分 < 60', add: 5, hit: false },
  ]
  r.finalComputed = 15
  r.recommendation = {
    advice: '正常通过：信用良好，违约风险较低',
    reason: '综合评分 760 分（良好），身份、还款、信用、行为、设备、关联六维全部良好',
    positive: '各维度均≥78 分，无风险项',
    risk: '无明显风险因素',
    creditLimit: '建议授信额度：申请额度的 100%（¥80,000）',
    limitTable: buildBaseCreditReport().recommendation.limitTable,
  }
  r.opLogs = [
    { id: 'ckp1', type: '信用报告生成', content: '系统自动生成信用风控报告', operator: '系统', time: '2026-07-21 15:00:22', remark: '信用评分 760 分，信用等级：良好' },
    { id: 'ckp2', type: '还款能力评估', content: '月收入 30,000 元，负债率 20%', operator: '系统', time: '2026-07-21 14:54:10', result: '通过', remark: '还款能力强' },
    { id: 'ckp3', type: '身份真实性核验', content: '公安实名、银行卡四要素通过', operator: '系统', time: '2026-07-21 14:52:00', result: '通过', remark: '身份真实有效' },
    { id: 'ckp4', type: '申请提交', content: '用户提交申请', operator: '系统', time: '2026-07-21 14:50:00', remark: '申请额度 ¥80,000' },
  ]
  return r
}

function dim(
  key: string,
  name: string,
  score: number,
  weight: number,
  level: CreditLevel,
  note: string,
  items: CreditItem[],
): CreditDimension {
  return { key, name, score, weight, level, note, items }
}
function it(name: string, result: string, score: number, weight: number): CreditItem {
  return { name, result, score, weight }
}
