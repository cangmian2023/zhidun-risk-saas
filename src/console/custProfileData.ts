// 单客详情（零售信贷 · 贷中监控）· 数据层
// ───────────────────────────────────────────────────────────────────────────
// 顶层设计：功能 / 数据分离
//   · 本文件（custProfileData.ts）= 纯数据：类型定义 + 样例数据 + 轻量 store。
//     不引入任何 UI 组件，不写任何 JSX。
//   · 视图层（CustProfile.tsx）= 纯功能：从本文件读取数据，用通用 UI 原语渲染。
//   数据来源：本地样例 JSON（橘 Sam）。实时计算（灰 Cal）由视图层按数据聚合得出。
// 模型参考：零售信贷单客 360° 画像，对标企业档案（qiye-profile）的单客版本，
//           并补齐 MidCustDetail（贷中客户详情）的重度风控维度（模型评分 / 征信 /
//           设备与欺诈 / 外部核验 / 担保与经营 / 关系图谱 / 多头共债 / 催收 / 贷后 /
//           处置日志），做到内容对等、实现独立。
// ───────────────────────────────────────────────────────────────────────────

/* ---------- 类型定义 ---------- */
export interface CustLoan {
  id: string
  product: string // 贷款产品
  principal: number // 合同本金（元）
  balance: number // 当前余额（元）
  rate: number // 年化利率 %
  term: number // 期限（月）
  monthly: number // 月供（元）
  status: '正常' | '逾期' | '结清'
  dueDays?: number // 逾期天数
}

export interface CustAlert {
  id: string
  rule: string // 命中规则
  level: '红' | '黄' | '蓝' // 预警等级
  date: string // 触发日期
  desc: string // 规则说明
  status: '待处置' | '处置中' | '已闭环' // 处置状态
}

export interface CustBehaviorItem {
  name: string // 行为子项
  count: number // 次数 / 数值
  danger?: boolean // 风险类（红）
  category?: '用信' | '还款' | '查询' | '风险' // 行为分组
  desc?: string // 指标说明
}

/* ---- 模型评分（智察 / 智信 / 智融 三评分卡 + 额度建议） ---- */
export interface CustScoreCard {
  name: string // 智察(反欺诈) / 智信(信用) / 智融(综合)
  score: number // 评分（模型各自量纲）
  level: string // 等级：优 / 良 / 中 / 差
}
export interface CustScores {
  zhiCha: CustScoreCard
  zhiXin: CustScoreCard
  zhiRong: CustScoreCard
  limitSuggest: { suggested: number; current: number }
}

/* ---- 征信（人行征信主题） ---- */
export interface CustCreditQuery {
  org: string
  date: string
  type: string
}
export interface CustCreditAccount {
  type: string // 账户类型：住房贷款 / 信用卡 / 消费贷 / 现金贷 ...
  bank: string // 管理机构
  openDate: string // 开立日期
  dueDate: string // 到期日（信用卡 / 随借随还可为 '--'）
  creditLimit: number // 授信额度 / 合同金额
  balance: number // 余额 / 已用额度
  currency: string // 币种
  guarantee: string // 担保方式：信用 / 抵押 / 质押 / 保证
  overdueMonths: number // 当前逾期期数
  overdueAmt: number // 当前逾期金额
  status: string // 账户状态：正常 / 关注 / 逾期 / 呆账 / 冻结 / 止付 / 销户 / 未激活
}
export interface CustGuarantee {
  name: string
  amount: number
  status: string
}
export interface CustCreditSummary {
  creditCards: number // 信用卡账户数
  loans: number // 贷款笔数（非循环 + 循环）
  overdueAccounts: number // 发生过逾期的账户数
  overdue90Plus: number // 90 天以上逾期账户数
  guaranteeCount: number // 对外担保笔数
  relatedRepay: number // 相关还款责任账户数（共同借款）
}
// 信息概要 · 金额维度（未结清账户授信与余额、逾期极值）
export interface CustCreditSummaryAmount {
  firstBizYear: number // 首笔业务年份
  openCreditLimit: number // 未结清账户授信总额（元）
  usedBalance: number // 未结清账户余额（元）
  maxMonthlyOverdue: number // 单月最高逾期总额（元）
  longestOverdueMonths: number // 最长逾期月数
}
// 报告头（报告编号 / 查询时间 / 被查询者）
export interface CustCreditHeader {
  reportNo: string
  queryTime: string
  queriedBy: string // 被查询者姓名
  idNo: string // 证件号（脱敏）
}
// 授信协议信息（循环额度共享协议）
export interface CustCreditAgreement {
  id: string
  org: string // 管理机构
  limit: number // 授信额度（元）
  currency: string // 币种
  shareAccounts: number // 协议下账户数
  effectiveDate: string // 生效日期
  expireDate: string // 到期日期
  status: string // 状态：正常 / 关注 / 终止
}
// 相关还款责任（共同借款）明细
export interface CustRelatedRepay {
  name: string // 责任人 / 共同借款人
  relation: string // 关系
  org: string // 管理机构
  product: string // 业务品种
  amount: number // 相关还款责任金额（元）
  status: string // 状态
}
// 公共记录明细（欠税 / 民事判决 / 强制执行 / 行政处罚 / 公积金缴存）
export interface CustPublicRecord {
  type: string
  org: string // 记录机构
  date: string // 发生日期
  content: string // 记录内容 / 金额
  status: string // 状态
}
// 本人查询（区别于机构查询）
export interface CustSelfQuery {
  date: string
  type: string // 查询原因（本人查询）
}
// 标注及声明信息（本人声明 / 异议标注）
export interface CustCreditAnnotation {
  type: string
  content: string
  date: string
}
export interface CustCredit {
  header: CustCreditHeader // 报告头
  recentQueries: CustCreditQuery[] // 近 6 月机构查询
  selfQueries: CustSelfQuery[] // 本人查询
  accounts: CustCreditAccount[] // 信贷账户明细
  agreements: CustCreditAgreement[] // 授信协议信息
  summary: CustCreditSummary // 信息概要（账户数汇总）
  summaryAmount: CustCreditSummaryAmount // 信息概要（金额维度）
  relatedRepayList: CustRelatedRepay[] // 相关还款责任明细
  publicRecords: CustPublicRecord[] // 公共记录明细
  overdue: { count: number; amount: number }
  guarantee: CustGuarantee[] // 对外担保
  annotations: CustCreditAnnotation[] // 标注及声明信息
}

/* ---- 设备与欺诈维度 ---- */
export interface CustDevice {
  device: string
  model: string
  os: string
  envRiskScore: number // 环境风险分（0~100，越高越危险）
  simulator: boolean // 是否模拟器
  sameDeviceAccounts: { custId: string; name: string }[] // 同设备多账号
  loginRegion: string
  lastLogin: string
}

/* ---- 外部数据核验 ---- */
export interface CustExternalCheck {
  source: string // 工商 / 司法 / 税务 / 社保公积金
  item: string
  result: string
  status: '一致' | '异常' | '待核'
  field?: string // 对应的基本信息字段 key（用于字段后打核验标记；缺省则归入「其他外部核验」列表）
  verifyOrg?: string // 第三方核验单位（数据源）
  verifyTime?: string // 核验时间
  cost?: number // 单次核验花费（元）
}

/* ---- 担保与经营 ---- */
export interface CustCollateral {
  name: string
  type: string
  value: number
  status: string
  verifyOrg?: string // 第三方核验单位（如不动产登记中心）
  verifyTime?: string // 核验时间
  verified?: boolean // 是否通过第三方核验
}
export interface CustBizEntity {
  name: string
  role: string
  status: string // 存续 / 注销 / 吊销
  // 主体基本信息
  creditCode?: string // 统一社会信用代码
  legalRep?: string // 法定代表人 / 负责人
  regCapital?: number // 注册资本（万元）
  regDate?: string // 成立日期
  industry?: string // 所属行业
  // 风控维度：经营主体的风险信息
  risk?: '正常' | '关注' | '高风险'
  riskTags?: string[] // 经营异常 / 行政处罚 / 司法涉诉 / 欠税 等
  riskItems?: { type: string; date: string; reason: string }[] // 风险明细列表（经营异常 / 行政处罚 / 欠税 等逐条）
  healthScore?: number // 经营健康度评分（0~100），主体维度
  litigationCount?: number // 涉诉案件数
  penaltyCount?: number // 行政处罚数
  verifyOrg?: string
  verifyTime?: string
  verified?: boolean
}
export interface CustCollateralBiz {
  collateral: CustCollateral[]
  business: CustBizEntity[]
  guaranteeAlert?: { level: '红' | '黄'; rule: string; desc: string } // 担保维度预警（抵押物/经营实体风险）
  bizHealth?: {
    years: number // 持续经营年限
    monthlyRevenue: number // 近 3 月月均营收（元）
    stability: '稳定' | '波动' | '下滑' // 经营稳定性
    score: number // 经营健康度评分（0~100）
  }
}

/* ---- 关系图谱 ---- */
export type GraphNodeType = 'self' | 'person' | 'company' | 'account' | 'device' | 'product' | 'org'
export type GraphTheme = '综合' | '家族' | '社交' | '资金' | '共债' | '担保' | '经营' | '设备'
export interface CustGraphNode {
  id: string
  name: string
  type: GraphNodeType
  rel: string // 关系标签
  risk?: '高危' | '关注' | '正常'
  openAlerts?: number // 关联预警数（高危角标）
  phone?: string // 脱敏联系方式
  detail?: string // 抽屉/清单附加描述
}
export interface CustGraphEdge {
  source: string
  target: string
  rel: string
  theme: GraphTheme // 所属主题，用于主题切换
  danger?: boolean // 红色高亮（共债 / 共享设备等）
  since?: string // 关系最近活跃时间（YYYY-MM-DD），用于时间段筛选（默认全部）
}
export interface CustRelationGraph {
  nodes: CustGraphNode[]
  edges: CustGraphEdge[]
  themes: GraphTheme[] // 可切换的主题
  collectedAt: string // 图谱数据采集时间
  source: string // 数据来源说明
}

/* ---- 多头共债 ---- */
export interface CustCoDebtOrg {
  org: string
  product: string
  balance: number
  status: string
}
export interface CustCoDebt {
  applications30d: number // 近 30 天多头申请次数
  orgs: CustCoDebtOrg[] // 共债机构清单
  chain: string[] // 共债链条
}

/* ---- 催收案件 ---- */
export interface CustCollectionNote {
  time: string
  who: string
  what: string
}
export interface CustCollection {
  id: string
  stage: 'M1' | 'M2' | 'M3+'
  product: string
  status: string
  owner: string
  lastTouch: string
  overdueAmt: number
  overdueDays: number
  dueDate: string
  calls: number
  sms: number
  notes: CustCollectionNote[]
}

/* ---- 贷后风险（资金流向 + 黑名单反欺诈） ---- */
export interface CustFundFlow {
  date: string
  direction: string
  counterparty: string
  amount: number
  flag: string
}
export interface CustBlacklistHit {
  list: string
  hit: string
  status: string
}
export interface CustPostRisk {
  fundFlow: CustFundFlow[]
  blacklist: CustBlacklistHit[]
}

/* ---- 司法涉诉（法律诉讼 / 执行信息） ---- */
export interface CustLitigation {
  type: string // 裁判文书 / 被执行人 / 失信被执行人 / 开庭公告 / 立案信息
  caseNo: string // 案号
  court: string // 审理法院
  filingDate: string // 立案 / 裁判日期
  role: string // 原告 / 被告 / 被执行人 / 申请人
  amount: number // 涉诉金额（元）
  status: string // 未结 / 执行中 / 已结 / 已履行
  desc?: string
}

/* ---- 处置与操作日志 ---- */
export interface CustLogEntry {
  time: string
  kind: 'task' | 'op' | 'verify' | 'credit' // 处置工单 / 历史操作 / 自动核验 / 央行征信调取
  title: string
  sub: string
  status?: string // 工单：待处置/处置中/已闭环；核验：通过/异常/待核
}

export interface CustProfile {
  custId: string // 客户唯一标识
  name: string
  maskedId: string // 脱敏证件号
  status: '正常' | '关注' | '逾期' | '冻结'
  tags: string[] // 标签：优质客户 / 共债嫌疑 等
  avatarText: string // 头像文字（姓名首字）
  // 基本信息
  gender: string
  age: number
  region: string // 所在地
  occupation: string // 职业
  employer: string // 工作单位
  income: number // 月收入（元）
  education: string // 学历
  marital: string // 婚姻状况
  phone: string // 脱敏手机号
  phones: { number: string; verified: boolean }[] // 多个手机号（脱敏）+ 各自核验状态
  email: string // 邮箱
  addresses: { type: string; value: string }[] // 户籍 / 居住 / 公司地址
  // 授信与额度
  creditLimit: number // 授信额度（元）
  usedLimit: number // 已用额度（元）
  availLimit: number // 可用额度（元）
  // 负债与逾期
  totalDebt: number // 在贷总余额（元）
  monthlyPay: number // 月供合计（元）
  overdueDays: number // 当前最大逾期天数
  overdueAmt: number // 当前逾期金额（元）
  loans: CustLoan[]
  // 行为画像（用信 / 还款 / 查询）
  behavior: CustBehaviorItem[]
  // 风险预警
  alerts: CustAlert[]
  // 模型评分（替代原风险评分）
  scores: CustScores
  // 征信
  credit: CustCredit
  // 设备与欺诈维度
  device: CustDevice
  // 外部数据核验
  externalChecks: CustExternalCheck[]
  // 担保与经营
  collateralBiz: CustCollateralBiz
  // 关系图谱
  relationGraph: CustRelationGraph
  // 多头共债
  coDebt: CustCoDebt
  // 催收案件
  collections: CustCollection[]
  // 贷后风险
  postRisk: CustPostRisk
  // 司法涉诉
  litigation: CustLitigation[]
  // 处置与操作日志
  disposeLog: CustLogEntry[]
  creditReportLog: CustLogEntry[] // 央行征信调取日志（进件硬查询 + 贷中软查询复拉）
  followed: boolean // 是否已关注
}

export interface CustData {
  customers: CustProfile[]
}

/* ---------- 样例数据（橘 Sam · 本地样例 JSON） ---------- */
export const SEED_CUST: CustData = {
  customers: [
    {
      custId: 'CUST-100237',
      name: '张明远',
      maskedId: '3301**********1234',
      status: '正常',
      tags: ['优质客户', '额度内用信'],
      avatarText: '张',
      gender: '男',
      age: 34,
      region: '浙江省杭州市',
      occupation: '软件工程师',
      employer: '杭州云算科技有限公司',
      income: 28000,
      education: '本科',
      marital: '已婚',
      phone: '138****6621',
      phones: [
        { number: '138****6621', verified: true },
        { number: '139****8800', verified: true },
      ],
      email: 'mingyuan.z@cloudcalc.com',
      addresses: [
        { type: '户籍地址', value: '浙江省杭州市西湖区文三路 100 号' },
        { type: '居住地址', value: '浙江省杭州市余杭区未来科技城 8 栋 1502' },
        { type: '公司地址', value: '浙江省杭州市滨江区网商路 599 号' },
      ],
      creditLimit: 200000,
      usedLimit: 86000,
      availLimit: 114000,
      totalDebt: 86000,
      monthlyPay: 2680,
      overdueDays: 0,
      overdueAmt: 0,
      loans: [
        { id: 'LN-88231', product: '随借随还·消费贷', principal: 100000, balance: 56000, rate: 11.8, term: 36, monthly: 0, status: '正常' },
        { id: 'LN-90115', product: '现金分期·教育', principal: 50000, balance: 30000, rate: 12.6, term: 24, monthly: 2680, status: '正常' },
      ],
      behavior: [
        { name: '用信笔数', count: 42, category: '用信', desc: '累计借款支用次数' },
        { name: '提前还款', count: 3, category: '还款', desc: '提前结清笔数' },
        { name: '正常还款', count: 39, category: '还款', desc: '按期还款笔数' },
        { name: '逾期还款', count: 0, danger: true, category: '还款', desc: '发生逾期的笔数' },
        { name: '机构查询', count: 6, category: '查询', desc: '近 90 天机构征信查询次数' },
        { name: '多头借贷', count: 1, danger: true, category: '查询', desc: '同时在贷机构数' },
        { name: '夜间用信', count: 8, category: '用信', desc: '23:00-05:00 用信笔数' },
        { name: '额度使用率', count: 43, category: '用信', desc: '已用 / 授信（%）' },
      ],
      alerts: [
        { id: 'AL-2026-0312', rule: '额度使用率超 40% 持续 60 天', level: '蓝', date: '2026-07-28', desc: '客户额度使用率长期偏高，关注再融资倾向', status: '已闭环' },
        { id: 'AL-2026-0288', rule: '近 90 天机构查询 ≥ 5', level: '黄', date: '2026-06-15', desc: '查询次数偏多，存在多头申请迹象', status: '处置中' },
      ],
      scores: {
        zhiCha: {
          name: '智察（反欺诈）',
          score: 892,
          level: '优',
        },
        zhiXin: {
          name: '智信（信用）',
          score: 768,
          level: '良',
        },
        zhiRong: {
          name: '智融（综合）',
          score: 815,
          level: '良',
        },
        limitSuggest: { suggested: 200000, current: 200000 },
      },
      credit: {
        header: { reportNo: 'PBOC-2026-0812-0007', queryTime: '2026-08-12 09:30:15', queriedBy: '张伟', idNo: '3301**********1234' },
        recentQueries: [
          { org: '本行', date: '2026-07-12', type: '贷后管理' },
          { org: '招商银行', date: '2026-06-15', type: '信用卡审批' },
          { org: '蚂蚁消金', date: '2026-05-20', type: '贷款审批' },
        ],
        selfQueries: [
          { date: '2026-07-01', type: '本人查询（自助查询机）' },
        ],
        accounts: [
          { type: '住房贷款', bank: '工商银行', openDate: '2019-03-12', dueDate: '2049-03-11', creditLimit: 1800000, balance: 1200000, currency: '人民币', guarantee: '抵押', overdueMonths: 0, overdueAmt: 0, status: '正常' },
          { type: '信用卡', bank: '招商银行', openDate: '2021-06-01', dueDate: '--', creditLimit: 50000, balance: 18000, currency: '人民币', guarantee: '信用', overdueMonths: 0, overdueAmt: 0, status: '正常' },
          { type: '消费贷', bank: '本行', openDate: '2024-11-08', dueDate: '2027-11-07', creditLimit: 200000, balance: 86000, currency: '人民币', guarantee: '信用', overdueMonths: 0, overdueAmt: 0, status: '正常' },
        ],
        agreements: [
          { id: 'AG-ICBC-001', org: '工商银行', limit: 1800000, currency: '人民币', shareAccounts: 1, effectiveDate: '2019-03-12', expireDate: '2049-03-11', status: '正常' },
          { id: 'AG-CMB-002', org: '招商银行', limit: 50000, currency: '人民币', shareAccounts: 1, effectiveDate: '2021-06-01', expireDate: '长期', status: '正常' },
          { id: 'AG-BANK-003', org: '本行', limit: 200000, currency: '人民币', shareAccounts: 1, effectiveDate: '2024-11-08', expireDate: '2027-11-07', status: '正常' },
        ],
        summary: { creditCards: 1, loans: 2, overdueAccounts: 0, overdue90Plus: 0, guaranteeCount: 0, relatedRepay: 0 },
        summaryAmount: { firstBizYear: 2019, openCreditLimit: 2030000, usedBalance: 1298000, maxMonthlyOverdue: 0, longestOverdueMonths: 0 },
        relatedRepayList: [],
        publicRecords: [],
        overdue: { count: 0, amount: 0 },
        guarantee: [],
        annotations: [],
      },
      device: {
        device: 'iPhone 15 Pro',
        model: 'iPhone15,3',
        os: 'iOS 17.4',
        envRiskScore: 8,
        simulator: false,
        sameDeviceAccounts: [],
        loginRegion: '浙江省杭州市',
        lastLogin: '2026-08-09 21:34',
      },
      externalChecks: [
        { source: '公安', item: '证件核验', result: '证件号与姓名一致', status: '一致', field: 'maskedId', verifyOrg: '公安部公民身份信息库', verifyTime: '2026-08-09 10:02', cost: 0 },
        { source: '运营商', item: '手机号实名', result: '实名认证一致', status: '一致', field: 'phone', verifyOrg: '中国移动实名库', verifyTime: '2026-08-09 10:03', cost: 0.2 },
        { source: '邮箱服务', item: '邮箱有效性', result: '可送达、无退信', status: '一致', field: 'email', verifyOrg: '邮箱服务商', verifyTime: '2026-08-09 10:03', cost: 0 },
        { source: '工商', item: '名下企业', result: '无关联企业', status: '一致', verifyOrg: '国家企业信用信息公示系统', verifyTime: '2026-08-09 10:05', cost: 0.5 },
        { source: '司法', item: '涉诉查询', result: '无未结案件', status: '一致', verifyOrg: '中国执行信息公开网', verifyTime: '2026-08-09 10:06', cost: 0.5 },
        { source: '税务', item: '个税缴纳', result: '连续缴纳 36 个月', status: '一致', field: 'income', verifyOrg: '自然人电子税务局', verifyTime: '2026-08-09 10:07', cost: 0.3 },
        { source: '社保公积金', item: '社保状态', result: '在缴、基数正常', status: '一致', field: 'income', verifyOrg: '人社 / 公积金中心', verifyTime: '2026-08-09 10:08', cost: 0.3 },
      ],
      collateralBiz: {
        collateral: [],
        business: [
          { name: '明远网络工作室', role: '经营者（个体工商户）', status: '存续', creditCode: '92330106MA2G8XK21', legalRep: '张明远', regCapital: 10, regDate: '2021-03-15', industry: '软件和信息技术服务业', risk: '正常', riskTags: [], healthScore: 88, verifyOrg: '国家企业信用信息公示系统', verifyTime: '2026-08-09 10:05', verified: true },
        ],
        bizHealth: { years: 5, monthlyRevenue: 46000, stability: '稳定', score: 88 },
      },
      relationGraph: {
        nodes: [
          { id: 'self', name: '张明远', type: 'self', rel: '本人' },
          // 家族
          { id: 'spouse', name: '李芸', type: 'person', rel: '配偶', risk: '正常', phone: '139****2048', detail: '共同居住 · 紧急联系人 · 连带担保' },
          { id: 'father', name: '张建国', type: 'person', rel: '父亲', phone: '137****7711', detail: '退休 · 紧急联系人' },
          { id: 'mother', name: '王秀英', type: 'person', rel: '母亲', detail: '退休' },
          { id: 'brother', name: '张明杰', type: 'person', rel: '弟弟', risk: '关注', detail: '自由职业 · 近期查询偏多' },
          { id: 'father_in_law', name: '李国强', type: 'person', rel: '岳父', detail: '异地' },
          // 社交
          { id: 'colleague', name: '赵磊', type: 'person', rel: '同事', detail: '同部门' },
          { id: 'friend1', name: '王涛', type: 'person', rel: '朋友', risk: '关注', detail: '有共债交集' },
          { id: 'friend2', name: '陈静', type: 'person', rel: '同学', detail: '异地' },
          { id: 'ec', name: '刘梅', type: 'person', rel: '紧急联系人', phone: '135****6620', detail: '亲属之外备用联系人' },
          // 账户
          { id: 'acc_bank', name: '本行储蓄卡', type: 'account', rel: '结算账户', detail: '6217****8821' },
          { id: 'acc_wx', name: '微信支付', type: 'account', rel: '关联账户', detail: 'wxid_****m9k2' },
          { id: 'acc_zfb', name: '支付宝', type: 'account', rel: '关联账户', detail: '2088****3391' },
          { id: 'acc_other', name: '招行借记卡', type: 'account', rel: '他行账户', detail: '6225****1109' },
          // 经营 / 企业
          { id: 'emp', name: '杭州云算科技', type: 'company', rel: '任职单位', detail: '软件工程师 · 工资发放方' },
          { id: 'biz', name: '明远网络工作室', type: 'company', rel: '经营主体', detail: '个体工商户 · 本人经营' },
          { id: 'supplier', name: '晟达供应链', type: 'company', rel: '合作方', risk: '关注', detail: '经营往来' },
          // 共债
          { id: 'co1', name: '周敏', type: 'person', rel: '共债关联', risk: '高危', openAlerts: 2, detail: '同共债圈' },
          { id: 'co2', name: '刘洋', type: 'person', rel: '共债关联', risk: '高危', openAlerts: 1, detail: '同共债圈' },
          { id: 'co3', name: '林晓', type: 'person', rel: '同设备账号', risk: '高危', openAlerts: 1, detail: '共享设备' },
          { id: 'org_a', name: '花呗', type: 'org', rel: '共债机构', detail: '消费信贷' },
          { id: 'org_b', name: '借呗', type: 'org', rel: '共债机构', detail: '消费信贷' },
          { id: 'org_c', name: '某消费金融', type: 'org', rel: '共债机构', risk: '关注', detail: '持牌机构' },
          // 担保
          { id: 'guar_biz', name: '明远工作室担保', type: 'company', rel: '担保主体', detail: '经营实体担保' },
          // 设备
          { id: 'dev1', name: 'iPhone 14', type: 'device', rel: '常用设备', detail: '常用登录' },
          { id: 'dev2', name: '共享设备·OPPO', type: 'device', rel: '共享设备', risk: '高危', detail: '多人共用' },
        ],
        edges: [
          // 家族
          { source: 'self', target: 'spouse', rel: '配偶', theme: '家族', since: '2026-08-08' },
          { source: 'self', target: 'father', rel: '父子', theme: '家族', since: '2026-08-01' },
          { source: 'self', target: 'mother', rel: '母子', theme: '家族', since: '2026-07-20' },
          { source: 'self', target: 'brother', rel: '兄弟', theme: '家族', since: '2026-07-25' },
          { source: 'spouse', target: 'father_in_law', rel: '翁婿', theme: '家族', since: '2026-06-15' },
          // 社交
          { source: 'self', target: 'colleague', rel: '同事', theme: '社交', since: '2026-08-07' },
          { source: 'self', target: 'friend1', rel: '朋友', theme: '社交', since: '2026-08-05' },
          { source: 'self', target: 'friend2', rel: '同学', theme: '社交', since: '2026-03-01' },
          { source: 'self', target: 'ec', rel: '紧急联系人', theme: '社交', since: '2026-07-10' },
          { source: 'friend1', target: 'co2', rel: '社交交集', theme: '社交', since: '2026-07-03' },
          // 资金
          { source: 'self', target: 'acc_bank', rel: '本行账户', theme: '资金', since: '2026-08-09' },
          { source: 'self', target: 'acc_wx', rel: '微信', theme: '资金', since: '2026-08-09' },
          { source: 'self', target: 'acc_zfb', rel: '支付宝', theme: '资金', since: '2026-08-09' },
          { source: 'self', target: 'acc_other', rel: '他行账户', theme: '资金', since: '2026-08-02' },
          { source: 'emp', target: 'self', rel: '工资入账', theme: '资金', since: '2026-08-05' },
          { source: 'self', target: 'biz', rel: '经营收款', theme: '资金', since: '2026-08-06' },
          // 经营
          { source: 'self', target: 'emp', rel: '任职', theme: '经营', since: '2026-08-05' },
          { source: 'self', target: 'biz', rel: '经营', theme: '经营', since: '2026-08-06' },
          { source: 'biz', target: 'supplier', rel: '供应链', theme: '经营', since: '2026-07-28' },
          { source: 'emp', target: 'biz', rel: '关联', theme: '经营', since: '2026-08-06' },
          // 共债
          { source: 'self', target: 'co1', rel: '共债', theme: '共债', danger: true, since: '2026-06-20' },
          { source: 'self', target: 'co2', rel: '共债', theme: '共债', danger: true, since: '2026-07-03' },
          { source: 'self', target: 'co3', rel: '共债/同设备', theme: '共债', danger: true, since: '2026-07-15' },
          { source: 'self', target: 'org_a', rel: '共债机构', theme: '共债', danger: true, since: '2026-05-12' },
          { source: 'self', target: 'org_b', rel: '共债机构', theme: '共债', danger: true, since: '2026-05-12' },
          { source: 'self', target: 'org_c', rel: '共债机构', theme: '共债', danger: true, since: '2026-06-08' },
          { source: 'co1', target: 'co2', rel: '共债链条', theme: '共债', danger: true, since: '2026-07-03' },
          { source: 'co1', target: 'co3', rel: '同设备', theme: '共债', danger: true, since: '2026-07-15' },
          { source: 'org_a', target: 'org_b', rel: '多头', theme: '共债', danger: true, since: '2026-05-12' },
          // 担保
          { source: 'self', target: 'spouse', rel: '担保（配偶）', theme: '担保', since: '2026-08-08' },
          { source: 'self', target: 'guar_biz', rel: '担保（经营实体）', theme: '担保', since: '2026-08-06' },
          { source: 'guar_biz', target: 'org_a', rel: '担保代偿', theme: '担保', since: '2026-05-12' },
          // 设备
          { source: 'self', target: 'dev1', rel: '常用设备', theme: '设备', since: '2026-08-09' },
          { source: 'self', target: 'dev2', rel: '共享设备', theme: '设备', danger: true, since: '2026-07-28' },
          { source: 'co3', target: 'dev2', rel: '同设备', theme: '设备', danger: true, since: '2026-07-28' },
        ],
        themes: ['综合', '家族', '社交', '资金', '经营', '共债', '担保', '设备'],
        collectedAt: '2026-08-10 02:15（T+1 批跑）',
        source: '关系挖掘引擎 · 融合申请 / 设备 / 征信 / 共债',
      },
      coDebt: {
        applications30d: 1,
        orgs: [{ org: '本行', product: '消费贷', balance: 86000, status: '在贷' }],
        chain: ['本行消费贷 → 本行教育分期（同一客户）'],
      },
      collections: [],
      postRisk: {
        fundFlow: [
          { date: '2026-08-05', direction: '出', counterparty: '杭州云算科技', amount: 28000, flag: '工资入账' },
          { date: '2026-08-06', direction: '出', counterparty: '房贷扣款', amount: 6800, flag: '正常还款' },
        ],
        blacklist: [{ list: '本行黑名单', hit: '未命中', status: '正常' }],
      },
      disposeLog: [
        { time: '2026-07-28 10:12', kind: 'op', title: '额度使用率预警闭环', sub: '系统自动复核后关闭' },
        { time: '2026-06-15 14:30', kind: 'task', title: '查询偏多核查', sub: '已核查为正常信贷需求', status: '已闭环' },
      ],
      creditReportLog: [
        { time: '2026-08-09 10:09', kind: 'credit', title: '央行征信调取（进件授权硬查询）', sub: '客户授权后拉取 · 报告编号 PBOC-2026-0809-100237 · 机构数 3' },
        { time: '2026-08-10 02:15', kind: 'credit', title: '央行征信复拉（贷中夜间软查询）', sub: '增量批跑刷新监控特征 · 无新增硬查询' },
      ],
      litigation: [],
      followed: false,
    },
    {
      custId: 'CUST-100891',
      name: '陈晓楠',
      maskedId: '4401**********5566',
      status: '逾期',
      tags: ['共债嫌疑', '贷中预警'],
      avatarText: '陈',
      gender: '女',
      age: 29,
      region: '广东省深圳市',
      occupation: '自由职业',
      employer: '个体经营（电商）',
      income: 15000,
      education: '大专',
      marital: '未婚',
      phone: '159****3380',
      phones: [
        { number: '159****3380', verified: true },
        { number: '158****7712', verified: false },
      ],
      email: 'chen.xn@shop.com',
      addresses: [
        { type: '户籍地址', value: '广东省深圳市福田区华强北路 12 号' },
        { type: '居住地址', value: '广东省深圳市龙华区民治街道 33 栋' },
        { type: '公司地址', value: '广东省深圳市龙岗区华南城电商大厦 5F' },
      ],
      creditLimit: 120000,
      usedLimit: 118000,
      availLimit: 2000,
      totalDebt: 118000,
      monthlyPay: 6120,
      overdueDays: 23,
      overdueAmt: 6120,
      loans: [
        { id: 'LN-77320', product: '大额分期·经营', principal: 80000, balance: 71000, rate: 15.4, term: 24, monthly: 4120, status: '逾期', dueDays: 23 },
        { id: 'LN-79002', product: '随借随还·消费贷', principal: 60000, balance: 47000, rate: 16.8, term: 12, monthly: 2000, status: '逾期', dueDays: 11 },
      ],
      behavior: [
        { name: '用信笔数', count: 71, category: '用信', desc: '累计借款支用次数' },
        { name: '提前还款', count: 0, category: '还款', desc: '提前结清笔数' },
        { name: '正常还款', count: 14, category: '还款', desc: '按期还款笔数' },
        { name: '逾期还款', count: 9, danger: true, category: '还款', desc: '发生逾期的笔数' },
        { name: '机构查询', count: 19, category: '查询', desc: '近 90 天机构征信查询次数' },
        { name: '多头借贷', count: 6, danger: true, category: '查询', desc: '同时在贷机构数' },
        { name: '夜间用信', count: 33, danger: true, category: '用信', desc: '23:00-05:00 用信笔数' },
        { name: '额度使用率', count: 98, danger: true, category: '用信', desc: '已用 / 授信（%）' },
      ],
      alerts: [
        { id: 'AL-2026-0401', rule: '连续逾期 ≥ 20 天', level: '红', date: '2026-08-02', desc: '主借产品逾期超 20 天，触发红灯预警', status: '待处置' },
        { id: 'AL-2026-0388', rule: '多头借贷 ≥ 5 家机构', level: '红', date: '2026-07-22', desc: '跨机构借贷集中，共债风险高', status: '处置中' },
        { id: 'AL-2026-0410', rule: '设备环境风险 ≥ 80', level: '红', date: '2026-08-09', desc: '模拟器 + 同设备多账号，疑似团伙欺诈', status: '待处置' },
        { id: 'AL-2026-0399', rule: '关联账户资金回流', level: '黄', date: '2026-08-03', desc: '贷后资金流向共债关联人，疑似以贷养贷', status: '处置中' },
        { id: 'AL-2026-0355', rule: '额度使用率 ≥ 95%', level: '黄', date: '2026-07-05', desc: '额度近乎用满，再融资空间极低', status: '已闭环' },
      ],
      scores: {
        zhiCha: {
          name: '智察（反欺诈）',
          score: 412,
          level: '差',
        },
        zhiXin: {
          name: '智信（信用）',
          score: 388,
          level: '差',
        },
        zhiRong: {
          name: '智融（综合）',
          score: 351,
          level: '差',
        },
        limitSuggest: { suggested: 0, current: 120000 },
      },
      credit: {
        header: { reportNo: 'PBOC-2026-0812-0023', queryTime: '2026-08-12 14:05:40', queriedBy: '李强', idNo: '4401**********5678' },
        recentQueries: [
          { org: '本行', date: '2026-07-22', type: '贷后管理' },
          { org: '马上消金', date: '2026-07-18', type: '贷款审批' },
          { org: '360 借条', date: '2026-07-10', type: '贷款审批' },
          { org: '京东金条', date: '2026-06-29', type: '贷款审批' },
          { org: '微粒贷', date: '2026-06-21', type: '贷款审批' },
        ],
        selfQueries: [
          { date: '2026-06-10', type: '本人查询（商业银行网上银行）' },
        ],
        accounts: [
          { type: '消费贷', bank: '本行', openDate: '2025-02-20', dueDate: '2027-02-19', creditLimit: 200000, balance: 118000, currency: '人民币', guarantee: '信用', overdueMonths: 2, overdueAmt: 3900, status: '逾期' },
          { type: '消费贷', bank: '马上消金', openDate: '2025-05-11', dueDate: '2026-05-10', creditLimit: 60000, balance: 42000, currency: '人民币', guarantee: '信用', overdueMonths: 1, overdueAmt: 2220, status: '逾期' },
          { type: '现金贷', bank: '360 借条', openDate: '2025-09-03', dueDate: '2026-09-02', creditLimit: 30000, balance: 28000, currency: '人民币', guarantee: '信用', overdueMonths: 0, overdueAmt: 0, status: '正常' },
          { type: '信用卡', bank: '广发银行', openDate: '2023-08-15', dueDate: '--', creditLimit: 40000, balance: 35000, currency: '人民币', guarantee: '信用', overdueMonths: 0, overdueAmt: 0, status: '关注' },
        ],
        agreements: [
          { id: 'AG-BANK-101', org: '本行', limit: 200000, currency: '人民币', shareAccounts: 1, effectiveDate: '2025-02-20', expireDate: '2027-02-19', status: '正常' },
          { id: 'AG-MASHANG-102', org: '马上消金', limit: 60000, currency: '人民币', shareAccounts: 1, effectiveDate: '2025-05-11', expireDate: '2026-05-10', status: '正常' },
          { id: 'AG-360-103', org: '360 借条', limit: 30000, currency: '人民币', shareAccounts: 1, effectiveDate: '2025-09-03', expireDate: '2026-09-02', status: '正常' },
        ],
        summary: { creditCards: 1, loans: 3, overdueAccounts: 2, overdue90Plus: 0, guaranteeCount: 1, relatedRepay: 1 },
        summaryAmount: { firstBizYear: 2023, openCreditLimit: 330000, usedBalance: 223000, maxMonthlyOverdue: 3900, longestOverdueMonths: 2 },
        relatedRepayList: [
          { name: '王芳', relation: '配偶', org: '本行', product: '消费贷', amount: 118000, status: '正常' },
        ],
        publicRecords: [
          { type: '强制执行', org: '杭州市西湖区人民法院', date: '2026-05-12', content: '金融借款合同纠纷，执行标的 ¥38,000', status: '未履行' },
        ],
        overdue: { count: 2, amount: 6120 },
        guarantee: [{ name: '为周敏担保', amount: 50000, status: '关注' }],
        annotations: [
          { type: '异议标注', content: '客户对「马上消金」一笔逾期记录提出异议，经办机构核查中', date: '2026-07-15' },
        ],
      },
      device: {
        device: '未知 Android',
        model: 'Pixel_Emulator',
        os: 'Android 13 (模拟器)',
        envRiskScore: 86,
        simulator: true,
        sameDeviceAccounts: [
          { custId: 'CUST-100891', name: '陈晓楠' },
          { custId: 'CUST-100902', name: '林晓' },
          { custId: 'CUST-100915', name: '赵蕾' },
        ],
        loginRegion: '广东省东莞市',
        lastLogin: '2026-08-09 02:11',
      },
      externalChecks: [
        { source: '公安', item: '证件核验', result: '证件号与姓名一致', status: '一致', field: 'maskedId', verifyOrg: '公安部公民身份信息库', verifyTime: '2026-08-09 09:58', cost: 0 },
        { source: '运营商', item: '手机号实名', result: '实名认证一致', status: '一致', field: 'phone', verifyOrg: '中国移动实名库', verifyTime: '2026-08-09 09:59', cost: 0.2 },
        { source: '邮箱服务', item: '邮箱有效性', result: '退信、疑似失效', status: '异常', field: 'email', verifyOrg: '邮箱服务商', verifyTime: '2026-08-09 09:59', cost: 0 },
        { source: '工商', item: '名下企业', result: '个体户·电商（存续）', status: '一致', verifyOrg: '国家企业信用信息公示系统', verifyTime: '2026-08-09 10:01', cost: 0.5 },
        { source: '司法', item: '涉诉查询', result: '民间借贷纠纷 1 起', status: '异常', verifyOrg: '中国执行信息公开网', verifyTime: '2026-08-09 10:02', cost: 0.5 },
        { source: '税务', item: '个税缴纳', result: '近 6 月无申报', status: '异常', field: 'income', verifyOrg: '自然人电子税务局', verifyTime: '2026-08-09 10:03', cost: 0.3 },
        { source: '社保公积金', item: '社保状态', result: '断缴超 12 个月', status: '异常', field: 'income', verifyOrg: '人社 / 公积金中心', verifyTime: '2026-08-09 10:04', cost: 0.3 },
      ],
      collateralBiz: {
        collateral: [{ name: '电商店铺经营权', type: '经营权质押', value: 60000, status: '评估中', verifyOrg: '经营权登记平台', verifyTime: '2026-08-09 11:20', verified: false }],
        business: [{ name: '深圳市某电商商行', role: '经营者（个体工商户）', status: '存续', creditCode: '92440300MA5F3XK88', legalRep: '陈晓楠', regCapital: 20, regDate: '2024-07-22', industry: '零售业', risk: '关注', riskTags: ['经营异常 1 次', '司法涉诉 1 起'], riskItems: [{ type: '经营异常', date: '2026-03-10', reason: '通过登记的住所或者经营场所无法联系，被列入经营异常名录' }, { type: '司法涉诉', date: '2026-05-18', reason: '民间借贷纠纷（被告），案号 (2026)粤0305民初1234，深圳市南山区人民法院' }], litigationCount: 1, penaltyCount: 0, healthScore: 45, verifyOrg: '国家企业信用信息公示系统', verifyTime: '2026-08-09 10:01', verified: true }],
        guaranteeAlert: { level: '黄', rule: '抵押物评估未完成', desc: '电商店铺经营权质押评估中，担保能力存疑，建议补充第二顺位担保' },
        bizHealth: { years: 2, monthlyRevenue: 22000, stability: '波动', score: 52 },
      },
      relationGraph: {
        nodes: [
          { id: 'self', name: '陈晓楠', type: 'self', rel: '本人', risk: '高危', openAlerts: 5 },
          { id: 'zhou', name: '周敏', type: 'person', rel: '共债关联', risk: '高危', openAlerts: 2 },
          { id: 'liu', name: '刘洋', type: 'person', rel: '共债关联', risk: '高危', openAlerts: 1 },
          { id: 'lin', name: '林晓', type: 'person', rel: '同设备账号', risk: '高危', openAlerts: 1 },
          { id: 'wang', name: '王芳', type: 'person', rel: '亲属' },
          { id: 'shop', name: '深圳某电商商行', type: 'company', rel: '经营主体', detail: '经营者' },
          { id: 'acc_wx', name: '微信支付', type: 'account', rel: '关联账户', detail: 'wxid_****x3k' },
          { id: 'acc_zfb', name: '支付宝', type: 'account', rel: '关联账户', detail: '2088****7712' },
          { id: 'org_a', name: '花呗', type: 'org', rel: '共债机构' },
          { id: 'org_b', name: '借呗', type: 'org', rel: '共债机构' },
          { id: 'org_c', name: '某消费金融', type: 'org', rel: '共债机构' },
          { id: 'dev1', name: '常用设备·华为', type: 'device', rel: '常用设备' },
          { id: 'dev2', name: '共享设备·OPPO', type: 'device', rel: '共享设备', risk: '高危' },
        ],
        edges: [
          { source: 'self', target: 'zhou', rel: '共债', theme: '共债', danger: true, since: '2026-07-20' },
          { source: 'self', target: 'liu', rel: '共债', theme: '共债', danger: true, since: '2026-07-25' },
          { source: 'self', target: 'lin', rel: '同设备', theme: '共债', danger: true, since: '2026-07-22' },
          { source: 'self', target: 'org_a', rel: '共债机构', theme: '共债', danger: true, since: '2026-06-30' },
          { source: 'self', target: 'org_b', rel: '共债机构', theme: '共债', danger: true, since: '2026-06-30' },
          { source: 'self', target: 'org_c', rel: '共债机构', theme: '共债', danger: true, since: '2026-07-10' },
          { source: 'zhou', target: 'liu', rel: '共债链条', theme: '共债', danger: true, since: '2026-07-25' },
          { source: 'zhou', target: 'lin', rel: '同设备', theme: '共债', danger: true, since: '2026-07-22' },
          { source: 'self', target: 'shop', rel: '经营', theme: '经营', since: '2026-07-15' },
          { source: 'self', target: 'wang', rel: '亲属', theme: '家族', since: '2026-07-05' },
          { source: 'self', target: 'acc_wx', rel: '微信', theme: '资金', since: '2026-08-08' },
          { source: 'self', target: 'acc_zfb', rel: '支付宝', theme: '资金', since: '2026-08-08' },
          { source: 'self', target: 'dev1', rel: '常用设备', theme: '设备', since: '2026-08-09' },
          { source: 'self', target: 'dev2', rel: '共享设备', theme: '设备', danger: true, since: '2026-07-28' },
          { source: 'lin', target: 'dev2', rel: '同设备', theme: '设备', danger: true, since: '2026-07-28' },
        ],
        themes: ['综合', '家族', '社交', '资金', '经营', '共债', '担保', '设备'],
        collectedAt: '2026-08-10 02:15（T+1 批跑）',
        source: '关系挖掘引擎 · 融合申请 / 设备 / 征信 / 共债',
      },
      coDebt: {
        applications30d: 6,
        orgs: [
          { org: '本行', product: '经营贷', balance: 71000, status: '逾期' },
          { org: '马上消金', product: '消费贷', balance: 42000, status: '逾期' },
          { org: '360 借条', product: '现金贷', balance: 28000, status: '正常' },
          { org: '微粒贷', product: '消费贷', balance: 19000, status: '关注' },
          { org: '京东金条', product: '消费贷', balance: 23000, status: '正常' },
          { org: '分期乐', product: '消费贷', balance: 15000, status: '逾期' },
        ],
        chain: ['陈晓楠 → 周敏 → 刘洋（同一资金中介共债链条）', '陈晓楠 ↔ 林晓（同设备多账号）'],
      },
      collections: [
        {
          id: 'COL-2026-00771',
          stage: 'M3+',
          product: '大额分期·经营',
          status: '委外',
          owner: '催收员·吴敏',
          lastTouch: '2026-08-08',
          overdueAmt: 71000,
          overdueDays: 23,
          dueDate: '2026-07-16',
          calls: 18,
          sms: 32,
          notes: [
            { time: '2026-08-08 10:02', who: '吴敏', what: '第 3 次电话，接通后承诺本周还款 5000' },
            { time: '2026-08-05 19:30', who: '系统', what: '自动 SMS 提醒已发送' },
            { time: '2026-08-01 09:15', who: '吴敏', what: '联系紧急联系人王浩，转告逾期情况' },
          ],
        },
        {
          id: 'COL-2026-00772',
          stage: 'M2',
          product: '随借随还·消费贷',
          status: '承诺还款',
          owner: '催收员·吴敏',
          lastTouch: '2026-08-07',
          overdueAmt: 47000,
          overdueDays: 11,
          dueDate: '2026-07-28',
          calls: 9,
          sms: 21,
          notes: [{ time: '2026-08-07 14:20', who: '吴敏', what: '客户表示资金周转中，承诺 8 月底前结清' }],
        },
      ],
      postRisk: {
        fundFlow: [
          { date: '2026-08-03', direction: '出', counterparty: '周敏', amount: 12000, flag: '疑似资金回流' },
          { date: '2026-08-01', direction: '入', counterparty: '未知个人账户', amount: 30000, flag: '来源不明' },
          { date: '2026-07-28', direction: '出', counterparty: '分期乐', amount: 8000, flag: '拆借还款' },
        ],
        blacklist: [
          { list: '本行黑名单', hit: '命中（贷后）', status: '高风险' },
          { list: '互金协会灰名单', hit: '命中', status: '关注' },
        ],
      },
      disposeLog: [
        { time: '2026-08-02 09:00', kind: 'task', title: '连续逾期红灯处置', sub: '派发处置工单 D-2026-0401', status: '待处置' },
        { time: '2026-07-22 16:40', kind: 'task', title: '多头共债核查', sub: '派发核查工单 D-2026-0388', status: '处置中' },
        { time: '2026-07-05 11:20', kind: 'op', title: '额度使用率预警闭环', sub: '系统自动复核后关闭' },
      ],
      creditReportLog: [
        { time: '2026-08-09 10:05', kind: 'credit', title: '央行征信调取（进件授权硬查询）', sub: '客户授权后拉取 · 报告编号 PBOC-2026-0809-100891 · 机构数 7', status: '异常' },
        { time: '2026-08-03 09:30', kind: 'credit', title: '央行征信复拉（逾期触发软查询）', sub: '逾期事件触发复拉 · 近1月查询+4 次', status: '异常' },
      ],
      litigation: [
        { type: '裁判文书', caseNo: '(2026)粤0305民初1234号', court: '深圳市南山区人民法院', filingDate: '2026-06-18', role: '被告', amount: 85000, status: '未结', desc: '民间借贷纠纷：原告主张偿还借款本金及利息，尚在审理中' },
      ],
      followed: false,
    },
  ],
}

/* ---------- 轻量 store（useSyncExternalStore，纯内存；样例数据不落盘） ---------- */
import { useSyncExternalStore } from 'react'

let data: CustData = JSON.parse(JSON.stringify(SEED_CUST))
let version = 0
const listeners = new Set<() => void>()

function emit() {
  version++
  listeners.forEach((fn) => fn())
}

function useSnap<T>(sel: () => T): T {
  useSyncExternalStore(
    (l) => {
      listeners.add(l)
      return () => {
        listeners.delete(l)
      }
    },
    () => version,
  )
  return sel()
}

export function useCustData(): CustData {
  return useSnap(() => data)
}

export function toggleFollowCust(custId: string) {
  data = {
    ...data,
    customers: data.customers.map((c) => (c.custId === custId ? { ...c, followed: !c.followed } : c)),
  }
  emit()
}
