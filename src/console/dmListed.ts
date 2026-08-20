// 企业档案 · 上市信息 Tab 数据层（useSyncExternalStore + 本地 JSON 落盘）
// 数据流向（严格按 AGENTS 铁律：功能与数据分离）：
//   样例 JSON（橘，使用域作者维护）: dmListed.json —— 比亚迪（002594）上市信息样例数据，
//     前端只读该文件渲染页面；后台按此契约实现接口并更新该文件。
// 启动：/api/load-mid?file=dmListed.json 加载；文件不存在则用代码 SEED 并立即落盘。
// 本数据层不实现接口对接，仅读取本地样例 JSON；后台接入后由后台更新该 JSON 文件。

import { useSyncExternalStore } from 'react';

/* ============================================================
 * 类型定义（接口契约 · 后台按此实现）
 * ========================================================== */

/** 模块1：股票信息 */
export interface LdStock {
  /** 股票代码 / 名称 */
  code: string;
  name: string;
  exchange: string;
  currency: string;
  /** 昨收 */
  prevClose: string;
  /** 今开 */
  open: string;
  /** 最高 */
  high: string;
  /** 最低 */
  low: string;
  /** 成交量（手） */
  volume: string;
  /** 成交额（亿） */
  amount: string;
  /** 涨跌幅（元） */
  change: string;
  /** 涨跌幅（%） */
  changePct: string;
  /** 换手率 */
  turnover: string;
  /** 总市值 */
  totalMarketCap: string;
  /** 流通市值 */
  floatMarketCap: string;
  /** 更新时间 */
  updatedAt: string;
  /** 历史行情数据（K线） */
  kline?: { date: string; close: number; volume: number }[];
}

/** 模块2：企业概况 */
export interface LdCompanyProfile {
  /** 基础信息表单 */
  basic: { key: string; value: string; note?: string }[];
  /** 公司简介长文本 */
  intro: string;
  /** 联系方式表单 */
  contact: { key: string; value: string; link?: boolean }[];
}

/** 模块3：发行股票 */
export interface LdIssueStock {
  rows: { key: string; value: string }[];
}

/** 模块4：企业公告 */
export interface LdAnnouncement {
  title: string;
  date: string;
  type?: string;
}

/** 模块5：主要股东 */
export interface LdShareholderCountRow {
  date: string;
  count: string;
  change: string;
  perFloatShare: string;
  perFloatChange: string;
  topTenRatio: string;
  topTenFloatRatio: string;
}
export interface LdHolderRow {
  seq: number;
  name: string;
  nature: string;
  shareType: string;
  shares: string;
  ratio: string;
  change: string;
  changeRatio: string;
}

/** 模块6：股本信息 */
export interface LdEquityStructureRow {
  type: string;
  value: string;
  ratio: string;
  children?: LdEquityStructureRow[];
}
export interface LdEquityChangeRow {
  date: string;
  reason: string;
  total: string;
  floatA: string;
  floatH: string;
  float: string;
}
export interface LdEquityChangeChart {
  year: string;
  floatA: number;
  total: number;
}

/** 模块7：企业高管 */
export interface LdExecutiveRow {
  seq: number;
  name: string;
  age: number;
  edu: string;
  salary: string;
  post: string;
  startDate: string;
}
export interface LdHolderPositionRow {
  seq: number;
  changer: string;
  before: string;
  after: string;
  changedShares: string;
  amount: string;
  changeRatio: string;
  avgPrice: string;
  shareType: string;
  executive: string;
  post: string;
  relation: string;
  reason: string;
}

/** 模块8：员工构成 */
export interface LdEduChartRow { name: string; values: { year: string; value: number }[] }
export interface LdSpecialChartRow { name: string; values: { year: string; value: number }[] }
export interface LdEmployeeYearRow {
  year: string;
  production: string;
  sales: string;
  tech: string;
  finance: string;
  admin: string;
  retired: string;
}

/** 模块9：财务数据 */
export interface LdFinanceIndicatorRow {
  period: string;
  eps: string;
  dilutedEps: string;
  navPerShare: string;
  capitalReservePerShare: string;
  undistributedPerShare: string;
  opCashflowPerShare: string;
  cashflowPerShare: string;
  grossMargin: string;
  netProfit: string;
}
export interface LdIncomeRow {
  period: string; totalRevenue: string; revenue: string; cost: string; rd: string;
  financeExp: string; adminExp: string; salesExp: string; taxSurcharge: string;
  investIncome: string; opProfit: string; profitTotal: string; incomeTax: string;
  netProfit: string; parentNetProfit: string; eps: string; otherIncome: string; minorityOtherIncome: string;
}
export interface LdBalanceRow {
  period: string; currentAssets: string; cash: string; receivable: string; inventory: string;
  fixedAssets: string; intangible: string; currentLiab: string; payable: string; shortBorrow: string;
  longBorrow: string; totalLiab: string; ownerEquity: string; paidCapital: string; capitalReserve: string; undistributed: string;
}
export interface LdCashflowRow {
  period: string; opNet: string; salesCash: string; investNet: string; financeNet: string; periodEndCash: string;
}

/** 模块10：分红情况 */
export interface LdDividendRow {
  announceDate: string;
  plan: string;
  implementDate: string;
  recordDate: string;
  exDate: string;
  payDate: string;
  progress: string;
}

/** 模块11：增发情况 */
export interface LdIssueMoreRow {
  issueDate: string;
  qty: string;
  totalRaise: string;
  netRaise: string;
  price: string;
  listDate: string;
  fundDate: string;
  recordDate: string;
  method: string;
}

/** 模块12：对外担保 */
export interface LdGuaranteeRow {
  announceDate: string;
  guaranteedParty: string;
  guarantor: string;
  amount: string;
  startDate: string;
  endDate: string;
  handler: string;
  handleAmount: string;
}

/** 上市信息整体数据结构 */
export interface LdListedData {
  stock: LdStock;
  companyProfile: LdCompanyProfile;
  issueStock: LdIssueStock;
  announcements: LdAnnouncement[];
  /** 公告类型筛选下拉候选 */
  announceTypes: string[];
  /** 主要股东 */
  shareholderCounts: LdShareholderCountRow[];
  floatHolderDates: string[];
  floatHolders: LdHolderRow[];
  topHolderDates: string[];
  topHolders: LdHolderRow[];
  /** 股本 */
  equityStructure: LdEquityStructureRow[];
  equityChangeChart: LdEquityChangeChart[];
  equityChanges: LdEquityChangeRow[];
  /** 高管 */
  executives: LdExecutiveRow[];
  holderPositions: LdHolderPositionRow[];
  /** 员工构成 */
  eduChart: LdEduChartRow[];
  specialChart: LdSpecialChartRow[];
  employeeYears: LdEmployeeYearRow[];
  /** 财务 */
  financeIndicators: LdFinanceIndicatorRow[];
  income: LdIncomeRow[];
  balance: LdBalanceRow[];
  cashflow: LdCashflowRow[];
  /** 分红 */
  dividends: LdDividendRow[];
  /** 增发 */
  issueMores: LdIssueMoreRow[];
  /** 对外担保 */
  guarantees: LdGuaranteeRow[];
  /** 数据更新时间 */
  updatedAt: string;
}

/* ============================================================
 * SEED 样例数据（比亚迪 002594）
 * ========================================================== */
export const SEED_LISTED: LdListedData = {
  stock: {
    code: '002594',
    name: '比亚迪',
    exchange: '深交所',
    currency: 'CNY',
    prevClose: '89.25',
    open: '89.53',
    high: '89.53',
    low: '88.62',
    volume: '29.6万手',
    amount: '26.350亿',
    change: '-0.28',
    changePct: '-0.31%',
    turnover: '3.56%',
    totalMarketCap: '8137.1亿',
    floatMarketCap: '3111.8亿',
    updatedAt: '2026-08-19 10:49',
    kline: [
      { date: '2026-08-13', close: 90.12, volume: 30 },
      { date: '2026-08-14', close: 89.86, volume: 27 },
      { date: '2026-08-15', close: 90.34, volume: 33 },
      { date: '2026-08-16', close: 89.53, volume: 26 },
      { date: '2026-08-17', close: 89.25, volume: 29 },
      { date: '2026-08-18', close: 89.53, volume: 31 },
      { date: '2026-08-19', close: 88.97, volume: 28 },
    ],
  },
  companyProfile: {
    basic: [
      { key: '公司名称', value: '比亚迪股份有限公司', note: '公司简称：比亚迪' },
      { key: '英文名称', value: 'BYD Company Limited', note: '英文简称：BYD' },
      { key: '董事长', value: '王传福', note: '法人代表：王传福' },
      { key: '总经理', value: '王传福', note: '董秘：李黔' },
      { key: '上市日期', value: '2011-06-30', note: '证券类别：深交所主板A股' },
      { key: '注册会计师', value: '大华会计师事务所（特殊普通合伙）', note: '高管人数：66' },
      { key: '法律顾问', value: '北京市中伦（深圳）律师事务所', note: '员工人数：89212' },
    ],
    intro: '比亚迪股份有限公司总部位于广东省深圳市，是在香港和深圳两地上市的世界500强企业，业务涵盖汽车、电子、新能源、轨道交通四大产业，从能源的获取、存储，再到应用，全方位构建零排放的新能源整体解决方案，致力于用技术创新满足人们对美好生活的向往，助力实现碳中和。',
    contact: [
      { key: '公司网址', value: 'www.bydauto.com.cn', link: true },
      { key: '电子邮箱', value: 'db@byd.com', link: true },
      { key: '联系电话', value: '0755-84202222' },
      { key: '传真', value: '0755-84202222' },
      { key: '邮编', value: '518118' },
      { key: '办公地址', value: '深圳市坪山区比亚迪路3009号 葵涌新大埔白石角科学园1号核心大厦1号5楼505-510' },
    ],
  },
  issueStock: {
    rows: [
      { key: '发行方式', value: '网下询价配售' },
      { key: '网上申购日期', value: '2011-06-21' },
      { key: '发行价格（元）', value: '18.00' },
      { key: '发行面值（元）', value: '1' },
      { key: '发行股数（股）', value: '142,000.00万' },
      { key: '募集资金净额（元）', value: '1,353,835,865' },
    ],
  },
  announceTypes: ['全部', '定期报告', '临时公告', '业绩预告', '重大事项', '股权变动'],
  announcements: [
    { title: '比亚迪股份有限公司《2026年半年度报告》', date: '2026-08-14', type: '定期报告' },
    { title: '比亚迪股份有限公司关于《上市公司第十九条之上市的香港预托证券发行人的证券变动月报表》', date: '2026-08-04', type: '临时公告' },
    { title: '比亚迪2026年7月产销快报', date: '2026-08-03', type: '业绩预告' },
    { title: '比亚迪股份有限公司2026年半年度业绩预告', date: '2026-07-15', type: '业绩预告' },
    { title: '比亚迪股份有限公司关于回购股份的进展公告', date: '2026-07-02', type: '重大事项' },
    { title: '比亚迪股份有限公司2025年度权益分派实施公告', date: '2026-06-20', type: '股权变动' },
  ],
  shareholderCounts: [
    { date: '2025-03-31', count: '110,000', change: '-2,500', perFloatShare: '8,200', perFloatChange: '+0.5%', topTenRatio: '38.20%', topTenFloatRatio: '42.10%' },
    { date: '2025-02-28', count: '112,500', change: '-1,800', perFloatShare: '8,150', perFloatChange: '+0.3%', topTenRatio: '38.00%', topTenFloatRatio: '41.90%' },
    { date: '2025-01-31', count: '114,300', change: '-2,200', perFloatShare: '8,100', perFloatChange: '+0.4%', topTenRatio: '37.80%', topTenFloatRatio: '41.70%' },
    { date: '2025-10-31', count: '116,500', change: '-1,500', perFloatShare: '8,050', perFloatChange: '+0.2%', topTenRatio: '37.60%', topTenFloatRatio: '41.50%' },
    { date: '2025-09-30', count: '118,000', change: '-2,000', perFloatShare: '8,000', perFloatChange: '+0.6%', topTenRatio: '37.40%', topTenFloatRatio: '41.30%' },
  ],
  floatHolderDates: ['2026-03-31', '2025-12-31', '2025-09-30'],
  floatHolders: [
    { seq: 1, name: '香港中央结算（代理人）有限公司', nature: '其他', shareType: '流通H股', shares: '3,681,473,217', ratio: '40.38%', change: '0', changeRatio: '0.00%' },
    { seq: 2, name: '王传福', nature: '个人', shareType: '流通A股', shares: '1,540,871,550', ratio: '16.90%', change: '0', changeRatio: '0.00%' },
    { seq: 3, name: '吕向阳', nature: '个人', shareType: '流通A股', shares: '717,685,860', ratio: '7.87%', change: '0', changeRatio: '0.00%' },
    { seq: 4, name: '融捷投资控股集团有限公司', nature: '投资公司', shareType: '流通A股', shares: '465,448,806', ratio: '5.11%', change: '-1,200,000', changeRatio: '-0.26%' },
    { seq: 5, name: '夏佐全', nature: '个人', shareType: '流通A股', shares: '247,906,821', ratio: '2.72%', change: '0', changeRatio: '0.00%' },
    { seq: 6, name: '香港中央结算有限公司', nature: '其他', shareType: '流通A股', shares: '120,548,200', ratio: '1.32%', change: '+2,100,000', changeRatio: '+1.78%' },
    { seq: 7, name: '王念强', nature: '个人', shareType: '流通A股', shares: '54,704,300', ratio: '0.60%', change: '0', changeRatio: '0.00%' },
    { seq: 8, name: '中央汇金资产管理有限责任公司', nature: '基金', shareType: '流通A股', shares: '42,158,000', ratio: '0.46%', change: '-800,000', changeRatio: '-1.86%' },
    { seq: 9, name: '全国社保基金一一七组合', nature: '社保', shareType: '流通A股', shares: '38,600,000', ratio: '0.42%', change: '+1,500,000', changeRatio: '+4.04%' },
    { seq: 10, name: '张炜', nature: '个人', shareType: '流通A股', shares: '30,250,000', ratio: '0.33%', change: '0', changeRatio: '0.00%' },
  ],
  topHolderDates: ['2026-03-31', '2025-12-31', '2025-09-30'],
  topHolders: [
    { seq: 1, name: '香港中央结算（代理人）有限公司', nature: '其他', shareType: '流通H股', shares: '3,681,473,217', ratio: '40.38%', change: '0', changeRatio: '0.00%' },
    { seq: 2, name: '王传福', nature: '个人', shareType: '限售流通A股', shares: '1,540,871,550', ratio: '16.90%', change: '0', changeRatio: '0.00%' },
    { seq: 3, name: '吕向阳', nature: '个人', shareType: '限售流通A股', shares: '717,685,860', ratio: '7.87%', change: '0', changeRatio: '0.00%' },
    { seq: 4, name: '融捷投资控股集团有限公司', nature: '投资公司', shareType: '流通A股', shares: '465,448,806', ratio: '5.11%', change: '-1,200,000', changeRatio: '-0.26%' },
    { seq: 5, name: '夏佐全', nature: '个人', shareType: '限售流通A股', shares: '247,906,821', ratio: '2.72%', change: '0', changeRatio: '0.00%' },
    { seq: 6, name: '香港中央结算有限公司', nature: '其他', shareType: '流通A股', shares: '120,548,200', ratio: '1.32%', change: '+2,100,000', changeRatio: '+1.78%' },
    { seq: 7, name: '王念强', nature: '个人', shareType: '流通A股', shares: '54,704,300', ratio: '0.60%', change: '0', changeRatio: '0.00%' },
    { seq: 8, name: '中央汇金资产管理有限责任公司', nature: '基金', shareType: '流通A股', shares: '42,158,000', ratio: '0.46%', change: '-800,000', changeRatio: '-1.86%' },
    { seq: 9, name: '全国社保基金一一七组合', nature: '社保', shareType: '流通A股', shares: '38,600,000', ratio: '0.42%', change: '+1,500,000', changeRatio: '+4.04%' },
    { seq: 10, name: '张炜', nature: '个人', shareType: '流通A股', shares: '30,250,000', ratio: '0.33%', change: '0', changeRatio: '0.00%' },
  ],
  equityStructure: [
    { type: '未流通股份', value: '218,520.00', ratio: '24.0%' },
    {
      type: '流通股份', value: '693,199.76', ratio: '76.0%',
      children: [
        { type: '已上市流通A股', value: '290,746.92', ratio: '31.9%' },
        { type: '已上市流通H股', value: '368,147.32', ratio: '40.4%' },
        { type: '其他流通股份', value: '34,305.52', ratio: '3.8%' },
      ],
    },
    { type: '总股本', value: '911,719.76', ratio: '100%' },
  ],
  equityChangeChart: [
    { year: '2023', floatA: 286000, total: 900000 },
    { year: '2024', floatA: 288000, total: 905000 },
    { year: '2025', floatA: 291000, total: 911720 },
  ],
  equityChanges: [
    { date: '2025-06-30', reason: '资本公积转增股本', total: '911,719.76', floatA: '290,746.92', floatH: '368,147.32', float: '693,199.76' },
    { date: '2024-12-31', reason: '公开发行H股', total: '905,000.00', floatA: '288,500.00', floatH: '365,000.00', float: '688,200.00' },
    { date: '2023-12-31', reason: '限制性股票解除限售', total: '900,000.00', floatA: '286,000.00', floatH: '360,000.00', float: '680,000.00' },
    { date: '2022-12-31', reason: '员工股权激励', total: '890,000.00', floatA: '282,000.00', floatH: '355,000.00', float: '670,000.00' },
  ],
  executives: [
    { seq: 1, name: '王传福', age: 60, edu: '硕士', salary: '8,139.000', post: '董事长、执行董事、总经理', startDate: '2011-06-30' },
    { seq: 2, name: '吕向阳', age: 64, edu: '大专', salary: '300,000', post: '副董事长、非执行董事', startDate: '2011-06-30' },
    { seq: 3, name: '夏佐全', age: 58, edu: '硕士', salary: '300,000', post: '非执行董事', startDate: '2011-06-30' },
    { seq: 4, name: '李黔', age: 48, edu: '硕士', salary: '1,850,000', post: '董事会秘书、副总裁', startDate: '2015-04-15' },
    { seq: 5, name: '蔡平平', age: 52, edu: '本科', salary: '300,000', post: '独立非执行董事', startDate: '2020-06-18' },
    { seq: 6, name: '张敏', age: 55, edu: '博士', salary: '300,000', post: '独立非执行董事', startDate: '2020-06-18' },
    { seq: 7, name: '罗红', age: 49, edu: '硕士', salary: '1,650,000', post: '副总裁', startDate: '2018-08-01' },
    { seq: 8, name: '何龙', age: 50, edu: '硕士', salary: '1,550,000', post: '副总裁', startDate: '2019-01-10' },
  ],
  holderPositions: [
    { seq: 1, changer: '王传福', before: '1,500,000,000', after: '1,540,871,550', changedShares: '+40,871,550', amount: '36.5', changeRatio: '+2.72%', avgPrice: '89.31', shareType: '流通A股', executive: '王传福', post: '董事长', relation: '本人', reason: '二级市场买入' },
    { seq: 2, changer: '夏佐全', before: '247,000,000', after: '247,906,821', changedShares: '+906,821', amount: '0.8', changeRatio: '+0.37%', avgPrice: '88.90', shareType: '流通A股', executive: '夏佐全', post: '董事', relation: '本人', reason: '二级市场买入' },
    { seq: 3, changer: '李黔', before: '120,000', after: '150,000', changedShares: '+30,000', amount: '0.03', changeRatio: '+25.00%', avgPrice: '90.00', shareType: '流通A股', executive: '李黔', post: '董秘', relation: '本人', reason: '股权激励行权' },
    { seq: 4, changer: '融捷投资', before: '466,648,806', after: '465,448,806', changedShares: '-1,200,000', amount: '-1.1', changeRatio: '-0.26%', avgPrice: '89.50', shareType: '流通A股', executive: '吕向阳', post: '副董事长', relation: '关联方', reason: '大宗交易减持' },
    { seq: 5, changer: '香港中央结算', before: '118,448,200', after: '120,548,200', changedShares: '+2,100,000', amount: '1.9', changeRatio: '+1.78%', avgPrice: '90.10', shareType: '流通A股', executive: '-', post: '-', relation: '非关联', reason: '二级市场买入' },
  ],
  eduChart: [
    { name: '博士', values: [{ year: '2023', value: 850 }, { year: '2024', value: 1050 }, { year: '2025', value: 1280 }] },
    { name: '硕士', values: [{ year: '2023', value: 6800 }, { year: '2024', value: 8200 }, { year: '2025', value: 9600 }] },
    { name: '本科', values: [{ year: '2023', value: 32000 }, { year: '2024', value: 36500 }, { year: '2025', value: 41000 }] },
    { name: '大专', values: [{ year: '2023', value: 18000 }, { year: '2024', value: 17200 }, { year: '2025', value: 16500 }] },
    { name: '中专及以下', values: [{ year: '2023', value: 22000 }, { year: '2024', value: 21800 }, { year: '2025', value: 20832 }] },
  ],
  specialChart: [
    { name: '生产人员', values: [{ year: '2023', value: 42000 }, { year: '2024', value: 45500 }, { year: '2025', value: 47000 }] },
    { name: '销售人员', values: [{ year: '2023', value: 8000 }, { year: '2024', value: 9500 }, { year: '2025', value: 11000 }] },
    { name: '技术人员', values: [{ year: '2023', value: 15000 }, { year: '2024', value: 18000 }, { year: '2025', value: 21000 }] },
    { name: '财务人员', values: [{ year: '2023', value: 1800 }, { year: '2024', value: 2000 }, { year: '2025', value: 2200 }] },
    { name: '行政管理人员', values: [{ year: '2023', value: 6200 }, { year: '2024', value: 6900 }, { year: '2025', value: 7600 }] },
    { name: '离退休人员', values: [{ year: '2023', value: 1200 }, { year: '2024', value: 1300 }, { year: '2025', value: 1412 }] },
  ],
  employeeYears: [
    { year: '2025', production: '47,000', sales: '11,000', tech: '21,000', finance: '2,200', admin: '7,600', retired: '1,412' },
    { year: '2024', production: '45,500', sales: '9,500', tech: '18,000', finance: '2,000', admin: '6,900', retired: '1,300' },
    { year: '2023', production: '42,000', sales: '8,000', tech: '15,000', finance: '1,800', admin: '6,200', retired: '1,200' },
  ],
  financeIndicators: [
    { period: '2025年报', eps: '3.82', dilutedEps: '3.80', navPerShare: '18.52', capitalReservePerShare: '8.10', undistributedPerShare: '8.35', opCashflowPerShare: '4.52', cashflowPerShare: '5.60', grossMargin: '21.60%', netProfit: '111.5' },
    { period: '2024年报', eps: '3.28', dilutedEps: '3.26', navPerShare: '16.80', capitalReservePerShare: '7.50', undistributedPerShare: '7.10', opCashflowPerShare: '3.90', cashflowPerShare: '4.85', grossMargin: '20.10%', netProfit: '95.6' },
    { period: '2023年报', eps: '2.78', dilutedEps: '2.76', navPerShare: '14.90', capitalReservePerShare: '6.80', undistributedPerShare: '5.90', opCashflowPerShare: '3.20', cashflowPerShare: '4.10', grossMargin: '18.50%', netProfit: '80.9' },
    { period: '2022年报', eps: '1.65', dilutedEps: '1.63', navPerShare: '12.20', capitalReservePerShare: '5.90', undistributedPerShare: '3.80', opCashflowPerShare: '2.40', cashflowPerShare: '3.20', grossMargin: '16.00%', netProfit: '48.1' },
    { period: '2021年报', eps: '0.68', dilutedEps: '0.67', navPerShare: '9.50', capitalReservePerShare: '4.80', undistributedPerShare: '1.90', opCashflowPerShare: '1.80', cashflowPerShare: '2.30', grossMargin: '13.00%', netProfit: '19.8' },
  ],
  income: [
    { period: '2025年报', totalRevenue: '3,860.50', revenue: '3,850.20', cost: '3,020.30', rd: '520.00', financeExp: '35.60', adminExp: '160.00', salesExp: '190.00', taxSurcharge: '22.00', investIncome: '30.50', opProfit: '140.20', profitTotal: '142.80', incomeTax: '18.50', netProfit: '124.30', parentNetProfit: '111.50', eps: '3.82', otherIncome: '-2.10', minorityOtherIncome: '0.80' },
    { period: '2024年报', totalRevenue: '3,150.00', revenue: '3,140.00', cost: '2,510.00', rd: '460.00', financeExp: '28.00', adminExp: '135.00', salesExp: '160.00', taxSurcharge: '19.00', investIncome: '25.00', opProfit: '120.00', profitTotal: '122.00', incomeTax: '16.00', netProfit: '106.00', parentNetProfit: '95.60', eps: '3.28', otherIncome: '-1.50', minorityOtherIncome: '0.60' },
    { period: '2023年报', totalRevenue: '2,620.00', revenue: '2,610.00', cost: '2,130.00', rd: '390.00', financeExp: '22.00', adminExp: '115.00', salesExp: '135.00', taxSurcharge: '16.00', investIncome: '20.00', opProfit: '98.00', profitTotal: '100.00', incomeTax: '13.00', netProfit: '87.00', parentNetProfit: '80.90', eps: '2.78', otherIncome: '-1.20', minorityOtherIncome: '0.50' },
  ],
  balance: [
    { period: '2025年报', currentAssets: '1,850.00', cash: '620.00', receivable: '480.00', inventory: '520.00', fixedAssets: '1,050.00', intangible: '180.00', currentLiab: '1,380.00', payable: '690.00', shortBorrow: '180.00', longBorrow: '220.00', totalLiab: '1,920.00', ownerEquity: '1,690.00', paidCapital: '911.72', capitalReserve: '738.00', undistributed: '761.00' },
    { period: '2024年报', currentAssets: '1,620.00', cash: '540.00', receivable: '420.00', inventory: '450.00', fixedAssets: '920.00', intangible: '160.00', currentLiab: '1,200.00', payable: '600.00', shortBorrow: '150.00', longBorrow: '190.00', totalLiab: '1,670.00', ownerEquity: '1,530.00', paidCapital: '905.00', capitalReserve: '678.00', undistributed: '642.00' },
    { period: '2023年报', currentAssets: '1,400.00', cash: '460.00', receivable: '370.00', inventory: '390.00', fixedAssets: '800.00', intangible: '140.00', currentLiab: '1,030.00', payable: '520.00', shortBorrow: '130.00', longBorrow: '160.00', totalLiab: '1,440.00', ownerEquity: '1,350.00', paidCapital: '900.00', capitalReserve: '612.00', undistributed: '531.00' },
  ],
  cashflow: [
    { period: '2025年报', opNet: '131.80', salesCash: '3,920.00', investNet: '-280.00', financeNet: '120.00', periodEndCash: '620.00' },
    { period: '2024年报', opNet: '113.00', salesCash: '3,200.00', investNet: '-240.00', financeNet: '90.00', periodEndCash: '540.00' },
    { period: '2023年报', opNet: '92.00', salesCash: '2,660.00', investNet: '-200.00', financeNet: '70.00', periodEndCash: '460.00' },
  ],
  dividends: [
    { announceDate: '2026-04-20', plan: '每10股派发现金红利3.50元（含税）', implementDate: '2026-05-25', recordDate: '2026-05-20', exDate: '2026-05-21', payDate: '2026-05-25', progress: '已实施' },
    { announceDate: '2025-08-20', plan: '每10股派发现金红利3.20元（含税）', implementDate: '2025-09-25', recordDate: '2025-09-19', exDate: '2025-09-22', payDate: '2025-09-25', progress: '已实施' },
    { announceDate: '2025-04-18', plan: '每10股派发现金红利2.80元（含税）', implementDate: '2025-05-23', recordDate: '2025-05-18', exDate: '2025-05-19', payDate: '2025-05-23', progress: '已实施' },
    { announceDate: '2024-08-20', plan: '每10股派发现金红利2.50元（含税）', implementDate: '2024-09-24', recordDate: '2024-09-18', exDate: '2024-09-19', payDate: '2024-09-24', progress: '已实施' },
  ],
  issueMores: [
    { issueDate: '2021-11-08', qty: '2,950,000.00', totalRaise: '1,369,000.00', netRaise: '1,355,000.00', price: '18.00', listDate: '2021-11-18', fundDate: '2021-11-10', recordDate: '2021-11-05', method: '网下询价配售' },
    { issueDate: '2016-07-20', qty: '200,000.00', totalRaise: '98,000.00', netRaise: '96,500.00', price: '15.00', listDate: '2016-07-28', fundDate: '2016-07-22', recordDate: '2016-07-18', method: '定向增发' },
  ],
  guarantees: [
    { announceDate: '2026-07-15', guaranteedParty: '比亚迪汽车工业有限公司', guarantor: '比亚迪股份有限公司', amount: '100,000.00', startDate: '2026-07-15', endDate: '2027-07-15', handler: '王传福', handleAmount: '100,000.00' },
    { announceDate: '2026-05-20', guaranteedParty: '比亚迪电子（国际）有限公司', guarantor: '比亚迪股份有限公司', amount: '50,000.00', startDate: '2026-05-20', endDate: '2027-05-20', handler: '王传福', handleAmount: '50,000.00' },
    { announceDate: '2026-03-10', guaranteedParty: '深圳市比亚迪供应链管理有限公司', guarantor: '比亚迪股份有限公司', amount: '80,000.00', startDate: '2026-03-10', endDate: '2027-03-10', handler: '李黔', handleAmount: '80,000.00' },
  ],
  updatedAt: '2026-08-20',
};

/* ============================================================
 * 轻量 store（复用 decisionData / scoreData 模式）
 * ========================================================== */
const FILE = 'dmListed.json';
let data: LdListedData = JSON.parse(JSON.stringify(SEED_LISTED));
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
  const hasNewShape = saved && typeof saved === 'object' &&
    (saved as LdListedData).stock &&
    (saved as LdListedData).companyProfile &&
    Array.isArray((saved as LdListedData).announcements);
  if (hasNewShape) {
    data = saved as LdListedData;
  } else {
    data = JSON.parse(JSON.stringify(SEED_LISTED));
    saveOne(FILE, data);
  }
  emit();
}
void bootstrap();

function useSnap<T>(sel: () => T): T {
  useSyncExternalStore(
    (l) => { listeners.add(l); return () => { listeners.delete(l); }; },
    () => version,
  );
  return sel();
}

export function useListed(): LdListedData { return useSnap(() => data); }
export function useListedSaveStatus(): 'ok' | 'error' | null {
  useSyncExternalStore(
    (l) => { statusListeners.add(l); return () => { statusListeners.delete(l); }; },
    () => saveStatus,
  );
  return saveStatus;
}
