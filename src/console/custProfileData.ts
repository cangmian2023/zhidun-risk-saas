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

export interface CustContact {
  id: string
  name: string
  relation: string // 关系：配偶 / 紧急联系人 / 关联账户
  phone: string // 脱敏手机号
  coDebt?: boolean // 是否共债
}

export interface CustBehaviorItem {
  name: string // 行为子项
  count: number // 次数 / 数值
  danger?: boolean // 风险类（红）
}

/* ---- 模型评分（智察 / 智信 / 智融 三评分卡 + 额度建议） ---- */
export interface CustFactor {
  name: string
  impact: '正面' | '负面' | '中性'
  detail: string
}
export interface CustScoreCard {
  name: string // 智察(反欺诈) / 智信(信用) / 智融(综合)
  score: number // 评分（模型各自量纲）
  level: string // 等级：优 / 良 / 中 / 差
  factors: CustFactor[]
}
export interface CustScores {
  zhiCha: CustScoreCard
  zhiXin: CustScoreCard
  zhiRong: CustScoreCard
  limitSuggest: { suggested: number; current: number; note: string }
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
export interface CustCredit {
  recentQueries: CustCreditQuery[] // 近 6 月查询
  accounts: CustCreditAccount[] // 信贷账户明细
  summary: CustCreditSummary // 信息概要（账户数汇总）
  overdue: { count: number; amount: number }
  guarantee: CustGuarantee[] // 对外担保
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
}

/* ---- 担保与经营 ---- */
export interface CustCollateral {
  name: string
  type: string
  value: number
  status: string
}
export interface CustBizEntity {
  name: string
  role: string
  status: string
}
export interface CustCollateralBiz {
  collateral: CustCollateral[]
  business: CustBizEntity[]
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
}
export interface CustRelationGraph {
  nodes: CustGraphNode[]
  edges: CustGraphEdge[]
  themes: GraphTheme[] // 可切换的主题
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

/* ---- 处置与操作日志 ---- */
export interface CustLogEntry {
  time: string
  kind: 'task' | 'op'
  title: string
  sub: string
  status?: string
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
  channel: string // 进件渠道
  region: string // 所在地
  occupation: string // 职业
  employer: string // 工作单位
  income: number // 月收入（元）
  incomeProof: string // 收入证明方式
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
  annualRate: number // 额度年化 %
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
  // 联系人 / 关系
  contacts: CustContact[]
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
  // 处置与操作日志
  disposeLog: CustLogEntry[]
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
      channel: 'APP 自主进件',
      region: '浙江省杭州市',
      occupation: '软件工程师',
      employer: '杭州云算科技有限公司',
      income: 28000,
      incomeProof: '社保 + 个税 app 截屏',
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
      annualRate: 11.8,
      totalDebt: 86000,
      monthlyPay: 2680,
      overdueDays: 0,
      overdueAmt: 0,
      loans: [
        { id: 'LN-88231', product: '随借随还·消费贷', principal: 100000, balance: 56000, rate: 11.8, term: 36, monthly: 0, status: '正常' },
        { id: 'LN-90115', product: '现金分期·教育', principal: 50000, balance: 30000, rate: 12.6, term: 24, monthly: 2680, status: '正常' },
      ],
      behavior: [
        { name: '用信笔数', count: 42 },
        { name: '提前还款', count: 3 },
        { name: '正常还款', count: 39 },
        { name: '逾期还款', count: 0, danger: true },
        { name: '机构查询', count: 6 },
        { name: '多头借贷', count: 1, danger: true },
        { name: '夜间用信', count: 8 },
        { name: '额度使用率', count: 43 },
      ],
      alerts: [
        { id: 'AL-2026-0312', rule: '额度使用率超 40% 持续 60 天', level: '蓝', date: '2026-07-28', desc: '客户额度使用率长期偏高，关注再融资倾向', status: '已闭环' },
        { id: 'AL-2026-0288', rule: '近 90 天机构查询 ≥ 5', level: '黄', date: '2026-06-15', desc: '查询次数偏多，存在多头申请迹象', status: '处置中' },
      ],
      contacts: [
        { id: 'CT-01', name: '李芸', relation: '配偶', phone: '139****2048', coDebt: true },
        { id: 'CT-02', name: '张建国', relation: '紧急联系人', phone: '137****7711' },
        { id: 'CT-03', name: '关联账户·微信', relation: '关联账户', phone: 'wxid_****m9k2' },
      ],
      scores: {
        zhiCha: {
          name: '智察（反欺诈）',
          score: 892,
          level: '优',
          factors: [
            { name: '设备环境', impact: '正面', detail: '常用设备一致，无模拟器' },
            { name: '申请行为', impact: '正面', detail: '无异常高频申请' },
            { name: '黑灰名单', impact: '正面', detail: '无命中' },
          ],
        },
        zhiXin: {
          name: '智信（信用）',
          score: 768,
          level: '良',
          factors: [
            { name: '历史还款', impact: '正面', detail: '历史 39 次正常还款' },
            { name: '负债比', impact: '中性', detail: 'DTI 处于中等水平' },
            { name: '查询密度', impact: '负面', detail: '近 90 天查询 6 次偏多' },
          ],
        },
        zhiRong: {
          name: '智融（综合）',
          score: 815,
          level: '良',
          factors: [
            { name: '收入稳定性', impact: '正面', detail: '在职稳定，社保连续' },
            { name: '额度使用率', impact: '负面', detail: '使用率 43% 长期偏高' },
            { name: '综合稳定性', impact: '正面', detail: '无逾期记录' },
          ],
        },
        limitSuggest: { suggested: 200000, current: 200000, note: '维持当前授信，关注额度使用率趋势' },
      },
      credit: {
        recentQueries: [
          { org: '本行', date: '2026-07-12', type: '贷后管理' },
          { org: '招商银行', date: '2026-06-15', type: '信用卡审批' },
          { org: '蚂蚁消金', date: '2026-05-20', type: '贷款审批' },
        ],
        accounts: [
          { type: '住房贷款', bank: '工商银行', openDate: '2019-03-12', dueDate: '2049-03-11', creditLimit: 1800000, balance: 1200000, currency: '人民币', guarantee: '抵押', overdueMonths: 0, overdueAmt: 0, status: '正常' },
          { type: '信用卡', bank: '招商银行', openDate: '2021-06-01', dueDate: '--', creditLimit: 50000, balance: 18000, currency: '人民币', guarantee: '信用', overdueMonths: 0, overdueAmt: 0, status: '正常' },
          { type: '消费贷', bank: '本行', openDate: '2024-11-08', dueDate: '2027-11-07', creditLimit: 200000, balance: 86000, currency: '人民币', guarantee: '信用', overdueMonths: 0, overdueAmt: 0, status: '正常' },
        ],
        summary: { creditCards: 1, loans: 2, overdueAccounts: 0, overdue90Plus: 0, guaranteeCount: 0, relatedRepay: 0 },
        overdue: { count: 0, amount: 0 },
        guarantee: [],
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
        { source: '公安', item: '证件核验', result: '证件号与姓名一致', status: '一致', field: 'maskedId' },
        { source: '运营商', item: '手机号实名', result: '实名认证一致', status: '一致', field: 'phone' },
        { source: '邮箱服务', item: '邮箱有效性', result: '可送达、无退信', status: '一致', field: 'email' },
        { source: '工商', item: '名下企业', result: '无关联企业', status: '一致' },
        { source: '司法', item: '涉诉查询', result: '无未结案件', status: '一致' },
        { source: '税务', item: '个税缴纳', result: '连续缴纳 36 个月', status: '一致', field: 'income' },
        { source: '社保公积金', item: '社保状态', result: '在缴、基数正常', status: '一致', field: 'income' },
      ],
      collateralBiz: { collateral: [], business: [] },
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
          { source: 'self', target: 'spouse', rel: '配偶', theme: '家族' },
          { source: 'self', target: 'father', rel: '父子', theme: '家族' },
          { source: 'self', target: 'mother', rel: '母子', theme: '家族' },
          { source: 'self', target: 'brother', rel: '兄弟', theme: '家族' },
          { source: 'spouse', target: 'father_in_law', rel: '翁婿', theme: '家族' },
          // 社交
          { source: 'self', target: 'colleague', rel: '同事', theme: '社交' },
          { source: 'self', target: 'friend1', rel: '朋友', theme: '社交' },
          { source: 'self', target: 'friend2', rel: '同学', theme: '社交' },
          { source: 'self', target: 'ec', rel: '紧急联系人', theme: '社交' },
          { source: 'friend1', target: 'co2', rel: '社交交集', theme: '社交' },
          // 资金
          { source: 'self', target: 'acc_bank', rel: '本行账户', theme: '资金' },
          { source: 'self', target: 'acc_wx', rel: '微信', theme: '资金' },
          { source: 'self', target: 'acc_zfb', rel: '支付宝', theme: '资金' },
          { source: 'self', target: 'acc_other', rel: '他行账户', theme: '资金' },
          { source: 'emp', target: 'self', rel: '工资入账', theme: '资金' },
          { source: 'self', target: 'biz', rel: '经营收款', theme: '资金' },
          // 经营
          { source: 'self', target: 'emp', rel: '任职', theme: '经营' },
          { source: 'self', target: 'biz', rel: '经营', theme: '经营' },
          { source: 'biz', target: 'supplier', rel: '供应链', theme: '经营' },
          { source: 'emp', target: 'biz', rel: '关联', theme: '经营' },
          // 共债
          { source: 'self', target: 'co1', rel: '共债', theme: '共债', danger: true },
          { source: 'self', target: 'co2', rel: '共债', theme: '共债', danger: true },
          { source: 'self', target: 'co3', rel: '共债/同设备', theme: '共债', danger: true },
          { source: 'self', target: 'org_a', rel: '共债机构', theme: '共债', danger: true },
          { source: 'self', target: 'org_b', rel: '共债机构', theme: '共债', danger: true },
          { source: 'self', target: 'org_c', rel: '共债机构', theme: '共债', danger: true },
          { source: 'co1', target: 'co2', rel: '共债链条', theme: '共债', danger: true },
          { source: 'co1', target: 'co3', rel: '同设备', theme: '共债', danger: true },
          { source: 'org_a', target: 'org_b', rel: '多头', theme: '共债', danger: true },
          // 担保
          { source: 'self', target: 'spouse', rel: '担保（配偶）', theme: '担保' },
          { source: 'self', target: 'guar_biz', rel: '担保（经营实体）', theme: '担保' },
          { source: 'guar_biz', target: 'org_a', rel: '担保代偿', theme: '担保' },
          // 设备
          { source: 'self', target: 'dev1', rel: '常用设备', theme: '设备' },
          { source: 'self', target: 'dev2', rel: '共享设备', theme: '设备', danger: true },
          { source: 'co3', target: 'dev2', rel: '同设备', theme: '设备', danger: true },
        ],
        themes: ['综合', '家族', '社交', '资金', '经营', '共债', '担保', '设备'],
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
      channel: '合作渠道·H5',
      region: '广东省深圳市',
      occupation: '自由职业',
      employer: '个体经营（电商）',
      income: 15000,
      incomeProof: '流水 + 经营证明',
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
      annualRate: 15.4,
      totalDebt: 118000,
      monthlyPay: 6120,
      overdueDays: 23,
      overdueAmt: 6120,
      loans: [
        { id: 'LN-77320', product: '大额分期·经营', principal: 80000, balance: 71000, rate: 15.4, term: 24, monthly: 4120, status: '逾期', dueDays: 23 },
        { id: 'LN-79002', product: '随借随还·消费贷', principal: 60000, balance: 47000, rate: 16.8, term: 12, monthly: 2000, status: '逾期', dueDays: 11 },
      ],
      behavior: [
        { name: '用信笔数', count: 71 },
        { name: '提前还款', count: 0 },
        { name: '正常还款', count: 14 },
        { name: '逾期还款', count: 9, danger: true },
        { name: '机构查询', count: 19 },
        { name: '多头借贷', count: 6, danger: true },
        { name: '夜间用信', count: 33, danger: true },
        { name: '额度使用率', count: 98, danger: true },
      ],
      alerts: [
        { id: 'AL-2026-0401', rule: '连续逾期 ≥ 20 天', level: '红', date: '2026-08-02', desc: '主借产品逾期超 20 天，触发红灯预警', status: '待处置' },
        { id: 'AL-2026-0388', rule: '多头借贷 ≥ 5 家机构', level: '红', date: '2026-07-22', desc: '跨机构借贷集中，共债风险高', status: '处置中' },
        { id: 'AL-2026-0355', rule: '额度使用率 ≥ 95%', level: '黄', date: '2026-07-05', desc: '额度近乎用满，再融资空间极低', status: '已闭环' },
      ],
      contacts: [
        { id: 'CT-01', name: '王浩', relation: '紧急联系人', phone: '186****9920' },
        { id: 'CT-02', name: '关联账户·支付宝', relation: '关联账户', phone: '2088****3321' },
        { id: 'CT-03', name: '周敏', relation: '共债关联', phone: '150****6644', coDebt: true },
        { id: 'CT-04', name: '刘洋', relation: '共债关联', phone: '133****1187', coDebt: true },
      ],
      scores: {
        zhiCha: {
          name: '智察（反欺诈）',
          score: 412,
          level: '差',
          factors: [
            { name: '设备环境', impact: '负面', detail: '检测到模拟器运行' },
            { name: '同设备多账号', impact: '负面', detail: '同设备关联 3 个借贷账号' },
            { name: '黑灰名单', impact: '负面', detail: '命中灰名单' },
          ],
        },
        zhiXin: {
          name: '智信（信用）',
          score: 388,
          level: '差',
          factors: [
            { name: '历史还款', impact: '负面', detail: '近 6 月逾期 9 次' },
            { name: '负债比', impact: '负面', detail: 'DTI 超 100%' },
            { name: '查询密度', impact: '负面', detail: '近 90 天查询 19 次' },
          ],
        },
        zhiRong: {
          name: '智融（综合）',
          score: 351,
          level: '差',
          factors: [
            { name: '收入稳定性', impact: '负面', detail: '自由职业、流水波动大' },
            { name: '额度使用率', impact: '负面', detail: '使用率 98%' },
            { name: '共债集中', impact: '负面', detail: '跨 6 家机构共债' },
          ],
        },
        limitSuggest: { suggested: 0, current: 120000, note: '建议冻结新增授信，启动贷中处置' },
      },
      credit: {
        recentQueries: [
          { org: '本行', date: '2026-07-22', type: '贷后管理' },
          { org: '马上消金', date: '2026-07-18', type: '贷款审批' },
          { org: '360 借条', date: '2026-07-10', type: '贷款审批' },
          { org: '京东金条', date: '2026-06-29', type: '贷款审批' },
          { org: '微粒贷', date: '2026-06-21', type: '贷款审批' },
        ],
        accounts: [
          { type: '消费贷', bank: '本行', openDate: '2025-02-20', dueDate: '2027-02-19', creditLimit: 200000, balance: 118000, currency: '人民币', guarantee: '信用', overdueMonths: 2, overdueAmt: 3900, status: '逾期' },
          { type: '消费贷', bank: '马上消金', openDate: '2025-05-11', dueDate: '2026-05-10', creditLimit: 60000, balance: 42000, currency: '人民币', guarantee: '信用', overdueMonths: 1, overdueAmt: 2220, status: '逾期' },
          { type: '现金贷', bank: '360 借条', openDate: '2025-09-03', dueDate: '2026-09-02', creditLimit: 30000, balance: 28000, currency: '人民币', guarantee: '信用', overdueMonths: 0, overdueAmt: 0, status: '正常' },
          { type: '信用卡', bank: '广发银行', openDate: '2023-08-15', dueDate: '--', creditLimit: 40000, balance: 35000, currency: '人民币', guarantee: '信用', overdueMonths: 0, overdueAmt: 0, status: '关注' },
        ],
        summary: { creditCards: 1, loans: 3, overdueAccounts: 2, overdue90Plus: 0, guaranteeCount: 1, relatedRepay: 0 },
        overdue: { count: 2, amount: 6120 },
        guarantee: [{ name: '为周敏担保', amount: 50000, status: '关注' }],
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
        { source: '公安', item: '证件核验', result: '证件号与姓名一致', status: '一致', field: 'maskedId' },
        { source: '运营商', item: '手机号实名', result: '实名认证一致', status: '一致', field: 'phone' },
        { source: '邮箱服务', item: '邮箱有效性', result: '退信、疑似失效', status: '异常', field: 'email' },
        { source: '工商', item: '名下企业', result: '个体户·电商（存续）', status: '一致' },
        { source: '司法', item: '涉诉查询', result: '民间借贷纠纷 1 起', status: '异常' },
        { source: '税务', item: '个税缴纳', result: '近 6 月无申报', status: '异常', field: 'income' },
        { source: '社保公积金', item: '社保状态', result: '断缴超 12 个月', status: '异常', field: 'income' },
      ],
      collateralBiz: {
        collateral: [{ name: '电商店铺经营权', type: '经营权质押', value: 60000, status: '评估中' }],
        business: [{ name: '深圳市某电商商行', role: '经营者', status: '存续' }],
      },
      relationGraph: {
        nodes: [
          { id: 'self', name: '陈晓楠', type: 'self', rel: '本人', risk: '高危', openAlerts: 3 },
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
          { source: 'self', target: 'zhou', rel: '共债', theme: '共债', danger: true },
          { source: 'self', target: 'liu', rel: '共债', theme: '共债', danger: true },
          { source: 'self', target: 'lin', rel: '同设备', theme: '共债', danger: true },
          { source: 'self', target: 'org_a', rel: '共债机构', theme: '共债', danger: true },
          { source: 'self', target: 'org_b', rel: '共债机构', theme: '共债', danger: true },
          { source: 'self', target: 'org_c', rel: '共债机构', theme: '共债', danger: true },
          { source: 'zhou', target: 'liu', rel: '共债链条', theme: '共债', danger: true },
          { source: 'zhou', target: 'lin', rel: '同设备', theme: '共债', danger: true },
          { source: 'self', target: 'shop', rel: '经营', theme: '经营' },
          { source: 'self', target: 'wang', rel: '亲属', theme: '家族' },
          { source: 'self', target: 'acc_wx', rel: '微信', theme: '资金' },
          { source: 'self', target: 'acc_zfb', rel: '支付宝', theme: '资金' },
          { source: 'self', target: 'dev1', rel: '常用设备', theme: '设备' },
          { source: 'self', target: 'dev2', rel: '共享设备', theme: '设备', danger: true },
          { source: 'lin', target: 'dev2', rel: '同设备', theme: '设备', danger: true },
        ],
        themes: ['综合', '家族', '社交', '资金', '经营', '共债', '担保', '设备'],
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
