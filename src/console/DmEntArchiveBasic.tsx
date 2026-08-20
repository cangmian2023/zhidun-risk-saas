import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sam, Cal } from './SourceTag'
import EntChainGraph from './EntChainGraph'
import EntOperatingRisk from './EntOperatingRisk'
import EntOperatingInfo from './EntOperatingInfo'
import EntHistoryInfo from './EntHistoryInfo'
import EntLegalRisk from './EntLegalRisk'
import EntListingInfo from './EntListingInfo'
import EntNewsSentiment from './EntNewsSentiment'
import EntIntellectualProperty from './EntIntellectualProperty'

/* 数字营销 · 企业档案 · 新版1:1复刻
 * 头部：企业摘要六段式（比亚迪样例）
 * Tab：主Tab栏悬停展开多列大面板（企查查/企信宝风格），点击子项锚点滚动
 * 基本信息Tab：16个模块真实数据落地（工商信息/股东/间接股东/主要人员/对外投资/变更记录/年报/分支/关键人员/实控企业/间接持股/合作持股/疑似关系/同业分析/全球关联/所属集团）
 */

// ============ 企业摘要数据（比亚迪样例） ============
const TAG_LINKS: { text: string; link?: boolean; badge?: string; dropdown?: boolean }[] = [
  { text: '曾用名', link: true },
  { text: '启信分：840分' },
  { text: '比亚迪 (002594.SZ)', link: true },
  { text: '比亚迪股份 (01211.HK)', link: true, badge: '港' },
  { text: '发票抬头', link: true },
  { text: '集团', link: true },
  { text: '规模以上企业(官方)', dropdown: true },
  { text: '发债', link: true },
  { text: '港澳台投资', link: true },
  { text: '港澳台与大陆合资', link: true },
  { text: '全部标签(65)', dropdown: true },
]
const BIZ_KEYWORDS = [
  '#汽车销售', '#汽车制造', '#IT零部件', '#轨道交通', '#汽车传感器', '#电池',
  '#新能源', '#新能源汽车', '#汽车、汽车相关产品及其他产品', '#手机部件、组装及其他产品'
]
const IC_ROWS: { k: string; v: string; links?: string[]; tag?: string; dropdown?: boolean }[][] = [
  [
    { k: '统一社会信用代码', v: '91440300192317458F' },
    { k: '电话', v: '18620330087', links: ['更多3', '同电话99+', '全部'], tag: 'AI触达' },
    { k: '所处行业', v: '新能源车整车制造', dropdown: true },
  ],
  [
    { k: '法定代表人', v: '王传福', links: ['35'] },
    { k: '邮箱', v: 'bydpo@byd.com', links: ['更多3', '同邮箱99+'] },
    { k: '所处产业', v: '储能 183', dropdown: true },
  ],
  [
    { k: '企业类型', v: '股份有限公司（台港澳与境内合资，上市）' },
    { k: '注册资本', v: '911,719.7565 万人民币' },
    { k: '官网', v: 'www.byd.com', links: ['更多10'] },
  ],
  [
    { k: '员工人数', v: '869622人' },
    { k: '成立日期', v: '1995-02-10' },
    { k: '地址', v: '深圳市大鹏新区葵涌街道延安路…', links: ['附近999+', '全部'] },
  ],
]
const BIZ_SCOPE = '一般经营项目：无。许可经营项目：锂离子电池以及其他电池、充电器、电子产品、仪器仪表、柔性线路板、五金制品、液晶显示器、手机零配件、模具、塑胶制品及其相…'
const ENT_INTRO = '比亚迪股份有限公司（股票代码：1211.HK），创立于1995年，2002年7月31日在中国香港主板发行上市，公司总部位于中国广东深圳，是一家拥有IT、汽车及新能源三大产业群的新技术民营企业。比亚迪在广东、北京、陕西、上海、天津等地共建有九大生产基地，总面积将近700万平方米，并在美国、欧洲、日本、韩国、印度等国和中国台湾、中国香港地区设有分公司或办事处。公司IT产业主要包括二次充电电池、充电器、电声产品、连接器、液晶显示屏模组、塑胶机构件、金属零部件、五金电子产品、手机按键、键盘、柔性电路板、微电子产品、LED产品、光电子产品等以及手机装饰、手机设计、手机组装业务等。主要客户包括诺基亚、三星等国际通讯业顶端客户群体。'
const FUNC_CARDS = [
  { icon: 'BYD', title: '集团信息 比亚迪股份…', desc: '成员1879 对外投资100' },
  { icon: '❄', title: '企业链图', desc: '股东高管17 疑似关联37' },
  { icon: '香', title: '股东信息 香港中央结…', desc: '持股… 股东数量12' },
  { icon: '⇶', title: '股权穿透图', desc: '疑似实控… 持股…' },
  { icon: '⛓', title: '财产线索', desc: '财产线索数量17255' },
]

// ============ 完整Tab配置 ============
const TABS = [
  {
    key: 'basic', label: '基本信息', count: '492',
    children: [
      { key: 'qixin-map', label: '启信图谱' },
      { key: 'ic-info', label: '工商信息' },
      { key: 'shareholder', label: '股东信息', count: '12', history: true },
      { key: 'indirect-shareholder', label: '间接股东', count: '44' },
      { key: 'main-person', label: '主要人员', count: '16', history: true },
      { key: 'out-invest', label: '对外投资', count: '99', history: true },
      { key: 'change-record', label: '变更记录', count: '31', history: true },
      { key: 'parent-company', label: '总公司' },
      { key: 'annual-report', label: '企业年报', count: '13' },
      { key: 'branch', label: '分支机构', count: '8' },
      { key: 'key-person', label: '关键人员' },
      { key: 'actual-control', label: '实控企业', count: '209' },
      { key: 'indirect-hold', label: '间接持股企业', count: '999+' },
      { key: 'coop-shareholder', label: '合作持股股东', count: '97' },
      { key: 'suspect-relation', label: '疑似关系', count: '64' },
      { key: 'industry-analysis', label: '同业分析' },
      { key: 'global-relation', label: '全球关联企业', count: '6' },
      { key: 'group', label: '所属集团' },
    ]
  },
  {
    key: 'listing-info', label: '上市信息', count: '999+',
    children: [
      { key: 'stock-info', label: '股票信息' },
      { key: 'listing-profile', label: '企业概况' },
      { key: 'listing-issue', label: '发行股票' },
      { key: 'listing-announcement', label: '企业公告', count: '2397' },
      { key: 'listing-shareholder', label: '主要股东' },
      { key: 'listing-capital', label: '股本信息' },
      { key: 'listing-executive', label: '企业高管' },
      { key: 'listing-staff', label: '员工构成' },
      { key: 'listing-finance', label: '财务数据' },
      { key: 'listing-dividend', label: '分红情况' },
      { key: 'listing-increase', label: '增发情况' },
      { key: 'listing-guarantee', label: '对外担保' }
    ]
  },
  {
    key: 'graph', label: '企业图谱', count: '8',
    children: [
      { key: 'company-chain', label: '企业链图' },
      { key: 'equity-penetrate', label: '股权穿透' },
      { key: 'equity-structure', label: '股权结构' },
      { key: 'controller-relation', label: '控制人关系' },
      { key: 'beneficial-owner', label: '受益所有人' },
      { key: 'company-relation', label: '企业关系' },
      { key: 'related-party', label: '关联方认定' },
      { key: 'top-beneficiary', label: '十大受益人' },
    ]
  },
  {
    key: 'judicial-risk', label: '司法风险', count: '999+',
    children: [
      { key: 'judicial-case', label: '司法案件', count: '999+' },
      { key: 'dishonest', label: '失信被执行人', warn: true },
      { key: 'executed', label: '被执行人', warn: true },
      { key: 'high-consume', label: '限制高消费', warn: true },
      { key: 'end-case', label: '终本案件', warn: true },
      { key: 'judgment-doc', label: '裁判文书', count: '999+' },
      { key: 'filing-info', label: '立案信息', count: '999+' },
      { key: 'court-notice', label: '开庭公告', count: '999+', history: true },
      { key: 'court-announce', label: '法院公告', count: '238' },
      { key: 'service-notice', label: '送达公告', count: '635' },
      { key: 'equity-freeze', label: '股权冻结' },
      { key: 'judicial-auction', label: '司法拍卖', count: '2' },
      { key: 'inquiry-eval', label: '询价评估' },
      { key: 'pre-litigation', label: '诉前调解' },
      { key: 'exit-limit', label: '限制出境' },
      { key: 'bid-limit', label: '限制招投标' },
      { key: 'judicial-assist', label: '司法协助' },
    ]
  },
  {
    key: 'operation-risk', label: '经营风险', count: '14',
    children: [
      { key: 'debt-analysis', label: '债务分析', count: '4' },
      { key: 'risk-overview', label: '经营风险概览' },
      { key: 'admin-penalty', label: '行政处罚', warn: true },
      { key: 'abnormal-operation', label: '经营异常', warn: true },
      { key: 'serious-illegal', label: '严重违法失信', warn: true },
      { key: 'env-penalty', label: '环保处罚', warn: true },
      { key: 'abnormal-tax', label: '非正常户', warn: true },
      { key: 'tax-owed', label: '欠税信息', warn: true },
      { key: 'major-tax-illegal', label: '重大税收违法', warn: true },
      { key: 'bond-default', label: '债券违约', warn: true },
      { key: 'equity-pledge', label: '股权出质', count: '13' },
      { key: 'equity-mortgage', label: '股权质押', count: '11' },
      { key: 'chattel-mortgage', label: '动产抵押' },
      { key: 'receivable-pledge', label: '应收账款质押' },
      { key: 'receivable-transfer', label: '应收账款转让' },
      { key: 'finance-lease', label: '融资租赁' },
      { key: 'other-chattel', label: '其他动产融资', count: '119', history: true },
      { key: 'land-mortgage', label: '土地抵押' },
      { key: 'simple-cancel', label: '简易注销' },
    ]
  },
  {
    key: 'operation-info', label: '经营信息', count: '999+',
    children: [
      { key: 'tender', label: '招投标', count: '999+' },
      { key: 'financing', label: '融资信息', count: '3' },
      { key: 'qualification', label: '资质认证', count: '999+', history: true },
      { key: 'credit-rating', label: '信用评级' },
      { key: 'competitor', label: '竞争对手', count: '431' },
      { key: 'recruit', label: '招聘信息', count: '999+' },
      { key: 'import-export', label: '进出口信用' },
      { key: 'land-info', label: '土地信息', count: '17' },
      { key: 'admin-license', label: '行政许可', count: '824', history: true },
      { key: 'spot-check', label: '抽查信息', count: '2', history: true },
      { key: 'supplier', label: '供应商', count: '99' },
      { key: 'customer', label: '客户', count: '999+' },
      { key: 'industry-fund', label: '产业引导基金', count: '1' },
      { key: 'biz-coop', label: '商业合作', count: '999+' },
      { key: 'env-credit', label: '环境信用' },
      { key: 'credit-limit', label: '授信额度', count: '6' },
      { key: 'bond-info', label: '债券信息', count: '24' },
      { key: 'guarantee-info', label: '担保信息', count: '183' },
      { key: 'industry-rank', label: '行业排名' },
    ]
  },
  {
    key: 'ip', label: '知识产权', count: '999+',
    children: [
      { key: 'ip-overview', label: '统计概览' },
      { key: 'research-team', label: '科研团队', count: '999+' },
      { key: 'patent', label: '专利信息', count: '999+' },
      { key: 'trademark', label: '商标信息', count: '999+' },
      { key: 'trademark-doc', label: '商标文书', count: '999+' },
      { key: 'copyright', label: '著作权信息', count: '206' },
      { key: 'software-copyright', label: '软件著作权信息', count: '105' },
      { key: 'domain', label: '域名信息', count: '5', history: true },
      { key: 'standard', label: '标准制定', count: '735' },
      { key: 'gov-reward', label: '政府奖励项目', count: '2' },
      { key: 'ic-layout', label: '集成电路布图' },
    ]
  },
  {
    key: 'news', label: '新闻舆情', count: '999+',
    children: [
      { key: 'news-overview', label: '舆情概览' },
      { key: 'news-dynamic', label: '舆情动态', count: '999+' },
    ]
  },
  {
    key: 'history', label: '历史信息', count: '461',
    children: [
      { key: 'history-shareholder', label: '股东信息', count: '17' },
      { key: 'history-invest', label: '对外投资', count: '8' },
      { key: 'history-person', label: '主要人员', count: '57' },
      { key: 'history-change', label: '变更记录', count: '3' },
      { key: 'capital-reduce', label: '减资公告' },
      { key: 'history-filing', label: '立案信息', warn: true },
      { key: 'history-court', label: '开庭公告', count: '626' },
      { key: 'history-court-announce', label: '法院公告' },
      { key: 'history-service', label: '送达公告' },
      { key: 'history-judgment', label: '裁判文书' },
      { key: 'history-executed', label: '被执行人', warn: true },
      { key: 'history-dishonest', label: '失信被执行人', warn: true },
      { key: 'history-freeze', label: '股权冻结' },
      { key: 'history-high-consume', label: '限制高消费', warn: true },
      { key: 'history-bid-limit', label: '限制招投标' },
      { key: 'history-end-case', label: '终本案件', warn: true },
      { key: 'history-judicial-assist', label: '司法协助' },
      { key: 'history-abnormal', label: '经营异常', warn: true },
      { key: 'history-serious-illegal', label: '严重违法失信', warn: true },
    ]
  }
]

// ============ 基本信息 16 模块数据 ============
const IC_FORM: { k: string; v: string; note?: string }[] = [
  { k: '统一社会信用代码', v: '91440300192317458F' },
  { k: '企业名称', v: '比亚迪股份有限公司', note: '曾用名：深圳市比亚迪实业有限公司（至2002-06-11）' },
  { k: '法定代表人', v: '王传福', note: '关联35家企业' },
  { k: '登记状态', v: '存续（在营、开业、在册）', note: '成立日期：1995-02-10' },
  { k: '组织机构代码', v: '192317458', note: '工商注册号：440301501127941' },
  { k: '注册资本', v: '911,719.7565万人民币', note: '实缴资本：911,719.7565万人民币' },
  { k: '企业类型', v: '股份有限公司（台港澳与境内合资，上市）', note: '营业期限：1995-02-10 ~ 2053-02-08' },
  { k: '人员规模', v: '2000-2998人', note: '参保人数：2279人（2025年监管）' },
  { k: '所属地区', v: '广东省深圳市龙岗区', note: '登记机关：深圳市市场监督管理局' },
  { k: '国际行业', v: '新能源整车制造', note: '英文名称：Byd Company Limited' },
  { k: '行业代码', v: 'C3612', note: '地址：深圳市大鹏新区葵涌街道延安路一号' },
  { k: '通信地址', v: '深圳市大鹏新区葵涌街道延安路一号' },
]
const IC_SCOPE_FULL = '一般经营项目：无。许可经营项目：锂离子电池以及其他电池、充电器、电子产品、仪器仪表、柔性线路板、五金制品、液晶显示器、手机零配件、模具、塑胶制品及其相关零部件的制造；经营进出口业务（按深贸管登记2001第070号文执行）；普通货运；3D眼镜、GPS导航产品的研发、生产及销售；从事货物、技术进出口业务（不含分销、国家专营专控商品）；汽车零部件、金属制品、塑胶制品、模具、电机电控、储能设备、充电桩、逆变器、光伏设备及零部件、储能电池及零部件的研发、生产、销售；轨道交通设备（含轨道交通车辆、动车组、各类机车、电子设备及零部件、新能源车及零部件、轨道交通设施及上述零部件的提供售后服务；电池管理系统、轨道交通、运输/租赁等业务；不涉及国家限制管理商品，涉及许可管理的凭许可证经营，并可管理及配套；建筑机电安装工程专业承包；广告设计、制作、代理及发布；信息技术与技术服务、技术服务。'

const SHAREHOLDERS = [
  { name: '香港中央结算（代理人）有限公司', type: '其它', shareType: '流通H股', ratio: '40.38%', count: '3,681,473,217', benefit: '40.38%' },
  { name: '王传福', type: '个人', shareType: '流通A股,限售流通A股', ratio: '16.90%', count: '1,540,871,550', benefit: '16.9%' },
  { name: '吕向阳', type: '个人', shareType: '流通A股,限售流通A股', ratio: '7.87%', count: '717,685,860', benefit: '12.4435%' },
  { name: '融捷投资控股集团有限公司', type: '投资公司', shareType: '流通A股', ratio: '5.11%', count: '465,448,806', benefit: '5.11%' },
  { name: '夏佐全', type: '个人', shareType: '流通A股,限售流通A股', ratio: '2.72%', count: '247,906,821', benefit: '2.72%' },
]
const INDIRECT_SHAREHOLDERS = [
  { name: '张长虹', type: '自然人', level: '2层', ratio: '0.53655%', path: '张长虹→融捷投资控股集团有限公司→比亚迪股份有限公司' },
]
const MAIN_PERSONS = [
  { name: '王传福', sex: '男', edu: '硕士', post: '执行董事,主席,薪酬委员会成员,授权代表,提名委员会成员,战略委员会主席', salary: '8,139.000', shares: '1,540,871,550', ratio: '16.9%', benefit: '16.9%' },
  { name: '吕向阳', sex: '男', edu: '大专', post: '非执行董事,副主席,提名委员会成员,战略委员会成员', salary: '300,000', shares: '717,685,860', ratio: '7.87%', benefit: '12.4435%' },
  { name: '夏佐全', sex: '男', edu: '硕士', post: '非执行董事,薪酬委员会成员,审核委员会成员,战略委员会成员', salary: '300,000', shares: '247,906,821', ratio: '2.72%', benefit: '2.72%' },
  { name: '蔡平平', sex: '男', edu: '本科', post: '独立非执行董事,薪酬委员会主席,审核委员会成员,提名委员会成员,战略委员会成员', salary: '300,000', shares: '-', ratio: '-', benefit: '-' },
  { name: '张敏', sex: '男', edu: '博士', post: '独立非执行董事,薪酬委员会成员,审核委员会主席,提名委员会成员,战略委员会成员', salary: '300,000', shares: '-', ratio: '-', benefit: '-' },
]
const OUT_INVEST = [
  { name: '芜湖亚为建设工程有限公司', status: '存续', legal: '吴应杰', capital: '10,800万元人民币', invest: '10,800万元人民币', ratio: '100.00%', date: '2025-01-24', industry: '住宅房屋建筑', region: '安徽芜湖市' },
  { name: '上海致远新创科技有限公司', status: '存续', legal: '邓春华', capital: '156,908.4万元人民币', invest: '20万元人民币', ratio: '12.75%', date: '2024-03-12', industry: '其他科技推广服务业', region: '上海浦东新区' },
  { name: '智元创新（上海）科技有限公司', status: '存续', legal: '邓春华', capital: '9,195.8736万元人民币', invest: '191.497万元人民币', ratio: '2.32%', date: '2023-02-27', industry: '其他未列明专业技术服务业', region: '上海浦东新区' },
  { name: '杭州弗思创新材料有限公司', status: '存续', legal: '袁骏', capital: '707,965758万元', invest: '50万元人民币', ratio: '7.06%', date: '2022-11-21', industry: '工程和技术研究和试验发展', region: '浙江杭州市' },
  { name: '深圳芯源新材料有限公司', status: '存续', legal: '姜亮', capital: '545万元人民币', invest: '46.3465万元人民币', ratio: '8.50%', date: '2022-04-12', industry: '专用材料制造', region: '广东深圳市宝安区' },
]
const CHANGE_RECORDS = [
  { date: '2025-12-19', item: '董事长或执行董事成员', before: '姓名：吕向阳\n职务：副董事长\n姓名：谢龄', after: '姓名：吕向阳\n职务：副董事长\n姓名：谢龄' },
  { date: '2025-12-19', item: '监事信息', before: '姓名：吕向阳\n职务：副董事长\n姓名：谢龄', after: '姓名：吕向阳\n职务：副董事长\n姓名：谢龄' },
  { date: '2025-12-19', item: '高级管理人员备案（董事、监事、经理等）', before: '姓名：唐梅【退出】\n职务：职工监事\n姓名：朱凌云【退出】', after: '-' },
  { date: '2025-12-19', item: '指定联系人', before: '姓名：蔡羽【退出】', after: '姓名：陈凤【新增】' },
  { date: '2025-12-19', item: '章程备案', before: '2025-08-01', after: '2025-12-05' },
]
const ANNUAL_YEARS = ['2025年度报告', '2024年度报告', '2023年度报告', '2022年度报告', '2021年度报告', '2020年度报告', '2019年度报告', '2018年度报告']
// 企业年报 · 模拟数据：每年度报告的工商公示信息
const ANNUAL_REPORTS: Record<string, { publish: string; rows: string[][] }> = {
  '2025年度报告': { publish: '2026-06-30', rows: [
    ['股东及出资信息', '注册资本认缴', '500,000万人民币', '实缴', '500,000万人民币'],
    ['股东及出资信息', '王传福', '认缴 154,087.155万股', '实缴 154,087.155万股', '占比 16.90%'],
    ['对外投资', '比亚迪汽车工业有限公司', '持股比例 100%', '存续', '-'],
    ['对外投资', '比亚迪半导体股份有限公司', '持股比例 5%', '存续', '-'],
    ['变更信息', '注册资本变更', '100亿 → 150亿', '2026-05-20', '-'],
    ['变更信息', '经营范围变更', '增加电池回收业务', '2025-11-10', '-'],
    ['资产状况', '资产总额', '8,000亿', '负债总额', '5,000亿'],
    ['资产状况', '营业收入', '5,000亿', '净利润', '650亿']
  ] },
  '2024年度报告': { publish: '2025-06-30', rows: [
    ['股东及出资信息', '注册资本认缴', '500,000万人民币', '实缴', '500,000万人民币'],
    ['对外投资', '比亚迪汽车工业有限公司', '持股比例 100%', '存续', '-'],
    ['变更信息', '经营范围变更', '增加新能源业务', '2024-12-01', '-'],
    ['资产状况', '资产总额', '6,800亿', '负债总额', '4,200亿'],
    ['资产状况', '营业收入', '4,000亿', '净利润', '560亿']
  ] },
  '2023年度报告': { publish: '2024-06-30', rows: [
    ['股东及出资信息', '注册资本认缴', '500,000万人民币', '实缴', '500,000万人民币'],
    ['对外投资', '比亚迪半导体股份有限公司', '持股比例 5%', '存续', '-'],
    ['资产状况', '资产总额', '6,000亿', '负债总额', '3,800亿'],
    ['资产状况', '营业收入', '3,500亿', '净利润', '500亿']
  ] },
  '2022年度报告': { publish: '2023-06-30', rows: [
    ['股东及出资信息', '注册资本认缴', '500,000万人民币', '实缴', '500,000万人民币'],
    ['资产状况', '资产总额', '5,000亿', '负债总额', '3,200亿'],
    ['资产状况', '营业收入', '3,000亿', '净利润', '420亿']
  ] }
}
const BRANCHES = [
  { name: '比亚迪股份有限公司杭州分公司', manager: '张金涛', status: '注销', region: '浙江省杭州市西湖区', date: '2003-12-09' },
  { name: '比亚迪股份有限公司青岛分公司', manager: '-', status: '注销', region: '山东省青岛市崂山区', date: '2004-09-20' },
]
const TOP_BENEFICIARY = [
  { name: '王传福', benefit: '16.9%', post: '法定代表人、董事长、股东', chain: '路径1：(持股比例:16.9%)比亚迪股份有限公司' },
  { name: '吕向阳', benefit: '12.4434%', post: '副董事长、非执行董事、股东', chain: '路径1：(持股比例:7.87%)比亚迪股份有限公司；路径2：(持股比例:4.5734%)融捷投资控股集团有限公司→比亚迪股份有限公司' },
  { name: '夏佐全', benefit: '2.72%', post: '董事、非执行董事、股东', chain: '路径1：(持股比例:2.72%)比亚迪股份有限公司' },
  { name: '王念强', benefit: '0.6%', post: '历史监事、股东', chain: '路径1：(持股比例:0.6%)比亚迪股份有限公司' },
  { name: '张炜', benefit: '0.6%', post: '股东', chain: '路径1：(持股比例:0.6%)比亚迪股份有限公司' },
]
const ACTUAL_CONTROL = [
  { name: '长春吉远比亚迪新源汽车销售有限公司', status: '存续', legal: '王忠岐', date: '2026-08-06', capital: '100万人民币', region: '吉林', industry: '汽车新车零售' },
  { name: '哈尔滨吉动汽车销售有限公司', status: '存续', legal: '邓希希', date: '2026-07-17', capital: '100万人民币', region: '黑龙江', industry: '汽车新车零售' },
  { name: '兴义吉源汽车销售有限公司', status: '存续', legal: '邓希希', date: '2026-07-13', capital: '100万人民币', region: '贵州', industry: '零售业' },
  { name: '六盘水吉源汽车销售有限公司', status: '存续', legal: '邓希希', date: '2026-07-13', capital: '100万人民币', region: '贵州', industry: '零售业' },
  { name: '徐州国势之皇汽车销售有限公司', status: '存续', legal: '尹秋全', date: '2026-06-24', capital: '100万人民币', region: '江苏', industry: '零售业' },
]
const INDIRECT_HOLD = [
  { name: '济南卓卓新能源开发有限公司', status: '存续', legal: '杨潇', date: '2026-08-17', capital: '100万人民币', region: '山东', industry: '研究和试验发展' },
  { name: '擎天象（嘉兴）科技有限公司', status: '存续', legal: '姜青松', date: '2026-08-14', capital: '100万人民币', region: '浙江', industry: '租赁业' },
  { name: '广东鑫皓铝材有限公司', status: '存续', legal: '李广生', date: '2026-08-14', capital: '3,000万人民币', region: '广东', industry: '通用设备制造业' },
]
const COOP_SHAREHOLDER = [
  { name: '嘉兴市创开盈创业投资合伙企业（有限合伙）', count: '38', detail: '比亚迪股份有限公司、长春吉远比亚迪新源汽车销售有限公司、哈尔滨吉动汽车销售有限公司…', more: true },
  { name: '深圳市鹏诚投资有限公司', count: '9', detail: '比亚迪股份有限公司、深圳比亚迪电动汽车投资有限公司…', more: true },
  { name: '宁波梅山保税港区起兴创业投资合伙企业（有限合伙）', count: '6', detail: '比亚迪股份有限公司、杭州比亚迪汽车有限公司…', more: false },
  { name: 'BYD (H.K.) CO.,LIMITED', count: '5', detail: '比亚迪股份有限公司、金菱环球有限公司…', more: false },
  { name: '宜宾央能股权投资合伙企业（有限合伙）', count: '5', detail: '比亚迪股份有限公司、宜宾比亚迪汽车有限公司…', more: false },
]
const SUSPECT_RELATION = [
  { name: '深圳迪创科技有限公司', legal: '司马超', capital: '260,000万元', date: '2016-06-05', type: '相同专利、相同软件著作', detail: '共同拥有12份专利' },
  { name: '国网湖北省电力有限公司', legal: '张玮华', capital: '180,000万元', date: '2010-07-26', type: '相同专利', detail: '共同拥有2份专利' },
]
const GLOBAL_RELATION = [
  { name: '金菱环球有限公司', relation: '上市公司的子公司', capital: '-', ratio: '65.676%', amount: '-', date: '2017-12-31' },
  { name: '比亚迪（香港）有限公司', relation: '上市公司的子公司', capital: '32,500.00(CNY)', ratio: '100%', amount: '-', date: '2017-12-31' },
]
const GROUP_INFO = [
  { name: '比亚迪集团', company: '比亚迪股份有限公司', members: '1879', capital: '12,698,485.7675万元人民币', ratio: '100%' },
]

// ============ 通用组件 ============
const thStyle = (extra?: any): any => ({
  padding: '11px 14px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: '#4e5969',
  background: '#f7f8fa', borderBottom: '1px solid #e5e6eb', whiteSpace: 'nowrap', ...extra
})
const tdStyle = (extra?: any): any => ({
  padding: '11px 14px', fontSize: 13, color: '#333', borderBottom: '1px solid #f2f3f5', verticalAlign: 'top', ...extra
})

function BlueLink({ children, ml }: { children: React.ReactNode; ml?: number }) {
  return <a style={{ color: '#0066cc', cursor: 'pointer', fontSize: 13, marginLeft: ml }}>{children}</a>
}

function DownloadBtn() {
  return (
    <button style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid #d9d9d9', background: '#fff', color: '#666', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      下载数据
    </button>
  )
}

function ModuleTitle({ title, count, subTabs, activeSub, onSub, right }: {
  title: string; count?: string; subTabs?: string[]; activeSub?: string; onSub?: (s: string) => void; right?: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: '#1d2129', margin: 0 }}>{title}{count && <span style={{ fontSize: 14, color: '#f53f3f', fontWeight: 400, marginLeft: 4 }}>{count}</span>}</h3>
        {subTabs && subTabs.map(t => (
          <button key={t} onClick={() => onSub && onSub(t)} style={{
            padding: '4px 12px', borderRadius: 4, fontSize: 13, cursor: 'pointer',
            border: activeSub === t ? '1px solid #165dff' : '1px solid #e5e6eb',
            background: activeSub === t ? '#eaf2ff' : '#fff',
            color: activeSub === t ? '#165dff' : '#4e5969'
          }}>{t}</button>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>{right || <DownloadBtn />}</div>
    </div>
  )
}

function FilterBar({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>{children}</div>
}
function Select({ placeholder, width = 140 }: { placeholder: string; width?: number }) {
  return (
    <select style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13, color: '#666', background: '#fff', minWidth: width, cursor: 'pointer' }}>
      <option>{placeholder}</option>
    </select>
  )
}
function SearchInput({ placeholder, width = 200 }: { placeholder: string; width?: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d9d9d9', borderRadius: 4, padding: '0 8px', background: '#fff' }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#999" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
      <input placeholder={placeholder} style={{ border: 'none', outline: 'none', padding: '6px 6px', fontSize: 13, width }} />
    </div>
  )
}

// 折叠页码：首页 + 当前页±1 + 末页，中间用省略号，避免列出全部页码
function pageNums(totalPages: number, current: number): (number | '…')[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
  const set = new Set<number>([1, totalPages, current, current - 1, current + 1])
  const sorted = [...set].filter(n => n >= 1 && n <= totalPages).sort((a, b) => a - b)
  const out: (number | '…')[] = []
  let prev = 0
  for (const n of sorted) {
    if (n - prev > 1) out.push('…')
    out.push(n)
    prev = n
  }
  return out
}

function Pagination({ total, pageSize = 5 }: { total: number; pageSize?: number }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [jump, setJump] = useState('')
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 14, fontSize: 13, color: '#666', flexWrap: 'wrap' }}>
      <span>共 {total} 条</span>
      <span>每页 {pageSize} 条</span>
      <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: '4px 10px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#ccc' : '#333' }}>上一页</button>
      {/* 页码：过多时折叠为省略号，避免列出全部 */}
      {pageNums(totalPages, page).map((n, i) => (
        n === '…'
          ? <span key={`e${i}`} style={{ color: '#999' }}>…</span>
          : <button key={n} onClick={() => setPage(n)} style={{ padding: '4px 10px', border: n === page ? '1px solid #165dff' : '1px solid #d9d9d9', borderRadius: 4, background: n === page ? '#eaf2ff' : '#fff', color: n === page ? '#165dff' : '#333', cursor: 'pointer', minWidth: 32 }}>{n}</button>
      ))}
      <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} style={{ padding: '4px 10px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', color: page >= totalPages ? '#ccc' : '#333' }}>下一页</button>
      <span>前往</span>
      <input value={jump} onChange={e => setJump(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { const n = parseInt(jump); if (n >= 1 && n <= totalPages) setPage(n) } }} style={{ width: 44, padding: '4px 6px', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, textAlign: 'center' }} />
      <span>页</span>
    </div>
  )
}

function TableShell({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #e5e6eb', borderRadius: 8, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{headers.map((h, i) => <th key={i} style={thStyle(i === 0 ? { width: 56 } : undefined)}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

// ============ 模块1：工商基础信息表单 ============
function M0QixinMap() {
  const rows = [
    ['公司名称', '比亚迪股份有限公司', '统一社会信用代码', '91440300192317458F'],
    ['法定代表人', '王传福', '登记机关', '深圳市市场监督管理局'],
    ['成立日期', '1995-02-10', '注册资本', '500,000万人民币'],
    ['企业状态', '存续', '所属行业', '汽车制造业'],
    ['图谱节点', '核心主体', '关联企业数', '999+'],
  ]
  return (
    <div style={{ marginBottom: 40 }} id="section-qixin-map">
      <ModuleTitle title="启信图谱" right={<span style={{ fontSize: 12, color: '#999' }}>企业关系图谱 · 数据来源：公开数据</span>} />
      <TableShell headers={['信息项', '内容', '信息项', '内容']}>
        {rows.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle()}>{r[0]}</td>
            <td style={tdStyle()}>{r[1]}</td>
            <td style={tdStyle()}>{r[2]}</td>
            <td style={tdStyle()}>{r[3]}</td>
          </tr>
        ))}
      </TableShell>
      <div style={{ marginTop: 12, padding: 16, border: '1px solid #e8ebf0', borderRadius: 8, background: '#fff', textAlign: 'center', color: '#86909c', fontSize: 13 }}>
        🕸️ 企业关联关系图谱可视化区域（此处可接入企业链图/股权穿透等图谱）
      </div>
    </div>
  )
}

function M1IcForm() {
  const [scopeExpanded, setScopeExpanded] = useState(false)
  return (
    <div style={{ marginBottom: 40 }} id="section-ic-info">
      <ModuleTitle title="工商基础信息" right={
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid #d9d9d9', background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>企业概况<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
          <button style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid #d9d9d9', background: '#fff', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>企业工商网快照<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
          <DownloadBtn />
        </div>
      } />
      <div style={{ border: '1px solid #e5e6eb', borderRadius: 8, overflow: 'hidden' }}>
        <div style={{ borderBottom: '1px solid #f0f0f0' }}>
          {IC_FORM.reduce((rows: any[], item, i) => {
            if (i % 2 === 0) rows.push([item])
            else rows[rows.length - 1].push(item)
            return rows
          }, []).map((pair: any[], ri: number) => (
            <div key={ri} style={{ display: 'grid', gridTemplateColumns: pair.length === 2 ? '1fr 1fr' : '1fr', borderBottom: ri < IC_FORM.length / 2 - 0.5 ? '1px solid #f0f0f0' : 'none' }}>
              {pair.map((cell, ci) => (
                <div key={ci} style={{ display: 'flex', gap: 6, padding: '11px 16px', borderRight: ci === 0 && pair.length === 2 ? '1px solid #f0f0f0' : 'none', fontSize: 13 }}>
                  <span style={{ color: '#666', flexShrink: 0 }}>{cell.k}：</span>
                  <span style={{ color: '#333' }}>{cell.v}</span>
                  {cell.note && <span style={{ color: '#999', fontSize: 12 }}>({cell.note})</span>}
                </div>
              ))}
            </div>
          ))}
        </div>
        {/* 经营范围 整宽 */}
        <div style={{ padding: '11px 16px', borderTop: '1px solid #f0f0f0', fontSize: 13 }}>
          <span style={{ color: '#666' }}>经营范围：</span>
          <span style={{ color: '#333', display: scopeExpanded ? 'inline' : 'inline', whiteSpace: 'pre-wrap' }}>{scopeExpanded ? IC_SCOPE_FULL : IC_SCOPE_FULL.slice(0, 120) + '…'}</span>
          <BlueLink ml={6} onClick={() => setScopeExpanded(!scopeExpanded)}>{scopeExpanded ? '收起' : '展开'}</BlueLink>
        </div>
      </div>
    </div>
  )
}

// ============ 模块2：股东信息 ============
function M2Shareholder() {
  const [sub, setSub] = useState('最新公示股东12')
  return (
    <div style={{ marginBottom: 40 }} id="section-shareholder">
      <ModuleTitle title="股东信息" subTabs={['最新公示股东12', '工商登记2', '历史公示股东14', '历史工商股东1']} activeSub={sub} onSub={setSub} />
      <FilterBar>
        <Select placeholder="股东类型" />
        <input placeholder="持股比例" style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13, width: 120 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>最新公示计算日期<input defaultValue="2026-08-04" style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13, width: 130 }} /></div>
      </FilterBar>
      <TableShell headers={['序号', '股东名称', '股东类型', '股份类型', '持股比例', '持股数量', '最终受益股份', '操作']}>
        {SHAREHOLDERS.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.type}</td>
            <td style={tdStyle()}>{r.shareType}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.count}</td>
            <td style={tdStyle()}>{r.benefit}</td>
            <td style={tdStyle()}><BlueLink>详情</BlueLink></td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={12} />
    </div>
  )
}

// ============ 模块3：间接股东 ============
function M3IndirectShareholder() {
  const [sub, setSub] = useState('全部1')
  return (
    <div style={{ marginBottom: 40 }} id="section-indirect-shareholder">
      <ModuleTitle title="间接股东" subTabs={['全部1', '企业0', '自然人1']} activeSub={sub} onSub={setSub} />
      <TableShell headers={['序号', '间接股东名称', '股东类型', '间接持股层级', '间接持股比例', '持股路径']}>
        {INDIRECT_SHAREHOLDERS.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.type}</td>
            <td style={tdStyle()}>{r.level}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.path}</td>
          </tr>
        ))}
      </TableShell>
    </div>
  )
}

// ============ 模块4：主要人员 ============
function M4MainPerson() {
  const [sub, setSub] = useState('最新公示20')
  return (
    <div style={{ marginBottom: 40 }} id="section-main-person">
      <ModuleTitle title="主要人员" subTabs={['最新公示20', '工商公示6', '历史公示主要人员35', '历史工商主要人员30']} activeSub={sub} onSub={setSub} />
      <TableShell headers={['序号', '姓名', '性别', '学历', '职务', '薪酬(税前万元)', '持股数', '持股比例', '最终受益股份']}>
        {MAIN_PERSONS.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.sex}</td>
            <td style={tdStyle()}>{r.edu}</td>
            <td style={tdStyle()}>{r.post}</td>
            <td style={tdStyle()}>{r.salary}</td>
            <td style={tdStyle()}>{r.shares}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.benefit}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={20} />
    </div>
  )
}

// ============ 模块5：对外投资 ============
function M5OutInvest() {
  const [sub, setSub] = useState('对外投资110')
  return (
    <div style={{ marginBottom: 40 }} id="section-out-invest">
      <ModuleTitle title="对外投资" subTabs={['对外投资110', '历史对外投资21']} activeSub={sub} onSub={setSub} />
      <FilterBar>
        <SearchInput placeholder="搜索企业" />
        <Select placeholder="登记状态" />
        <Select placeholder="所属地区" />
        <Select placeholder="所属行业" />
      </FilterBar>
      <TableShell headers={['序号', '被投资企业名称', '状态', '法定代表人', '注册资本', '认缴出资额/持股数', '投资比例', '成立日期', '行业', '地区']}>
        {OUT_INVEST.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.status}</td>
            <td style={tdStyle()}>{r.legal}</td>
            <td style={tdStyle()}>{r.capital}</td>
            <td style={tdStyle()}>{r.invest}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.industry}</td>
            <td style={tdStyle()}>{r.region}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={110} />
    </div>
  )
}

// ============ 模块6：变更记录 ============
function M6ChangeRecord() {
  const [sub, setSub] = useState('变更记录203')
  const [expanded, setExpanded] = useState<number | null>(null)
  return (
    <div style={{ marginBottom: 40 }} id="section-change-record">
      <ModuleTitle title="变更记录" subTabs={['变更记录203', '历史变更记录16']} activeSub={sub} onSub={setSub} />
      <FilterBar>
        <Select placeholder="变更类型" />
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#666' }}>变更时间<input style={{ padding: '6px 10px', borderRadius: 4, border: '1px solid #d9d9d9', fontSize: 13, width: 150 }} /></div>
      </FilterBar>
      <TableShell headers={['序号', '变更日期', '变更事项', '变更前', '变更后', '操作']}>
        {CHANGE_RECORDS.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.item}</td>
            <td style={{ ...tdStyle(), whiteSpace: 'pre-wrap', fontSize: 12 }}>{r.before}</td>
            <td style={{ ...tdStyle(), whiteSpace: 'pre-wrap', fontSize: 12 }}>{r.after}</td>
            <td style={tdStyle()}>
              <button onClick={() => setExpanded(expanded === i ? null : i)} style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 2 }}>
                展开<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: expanded === i ? 'rotate(180deg)' : 'none' }}><polyline points="6 9 12 15 18 9"></polyline></svg>
              </button>
            </td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={203} />
    </div>
  )
}

// ============ 模块7：企业年报 ============
function M7AnnualReport() {
  const [active, setActive] = useState(ANNUAL_YEARS[0])
  const report = ANNUAL_REPORTS[active] || ANNUAL_REPORTS[ANNUAL_YEARS[0]]
  const download = () => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `企业年报-${active}.json`
    a.click()
    URL.revokeObjectURL(url)
  }
  return (
    <div style={{ marginBottom: 40 }} id="section-annual-report">
      <ModuleTitle title="企业年报" />
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid #f0f0f0', paddingBottom: 4 }}>
        <button style={{ padding: '6px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><polyline points="15 18 9 12 15 6"></polyline></svg></button>
        {ANNUAL_YEARS.map(y => (
          <button key={y} onClick={() => setActive(y)} style={{ padding: '6px 10px', border: 'none', borderBottom: active === y ? '2px solid #165dff' : '2px solid transparent', background: 'none', color: active === y ? '#165dff' : '#4e5969', fontSize: 13, cursor: 'pointer', fontWeight: active === y ? 600 : 400 }}>{y}</button>
        ))}
        <button style={{ padding: '6px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer' }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2"><polyline points="9 18 15 12 9 6"></polyline></svg></button>
        <button onClick={download} style={{ marginLeft: 'auto', padding: '6px 14px', border: '1px solid #d9d9d9', borderRadius: 6, background: '#fff', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          下载数据
        </button>
      </div>
      <div style={{ fontSize: 12, color: '#999', padding: '8px 2px' }}>年度报告公示时间：{report.publish} · 数据来源：国家企业信用信息公示系统</div>
      <TableShell headers={['信息类型', '项目', '内容', '备注', '时间']}>
        {report.rows.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle()}><span style={{ color: '#1677ff' }}>{r[0]}</span></td>
            <td style={tdStyle()}>{r[1]}</td>
            <td style={tdStyle()}>{r[2]}</td>
            <td style={tdStyle()}>{r[3]}</td>
            <td style={tdStyle()}>{r[4] || '-'}</td>
          </tr>
        ))}
      </TableShell>
    </div>
  )
}

// ============ 模块8：分支机构 ============
function M8Branch() {
  return (
    <div style={{ marginBottom: 40 }} id="section-branch">
      <ModuleTitle title="分支机构" />
      <TableShell headers={['序号', '企业名称', '负责人', '状态', '地区', '成立日期']}>
        {BRANCHES.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.manager}</td>
            <td style={tdStyle()}><span style={{ color: '#999' }}>{r.status}</span></td>
            <td style={tdStyle()}>{r.region}</td>
            <td style={tdStyle()}>{r.date}</td>
          </tr>
        ))}
      </TableShell>
    </div>
  )
}

// ============ 模块9：关键人员 ============
function M9KeyPerson() {
  return (
    <div style={{ marginBottom: 40 }} id="section-key-person">
      <ModuleTitle title="关键人员" />
      {/* 9-1 法人 */}
      <SubPanel title="法人">
        <TableShell headers={['序号', '法人名称', '持股比例', '职位']}>
          <tr><td style={tdStyle({ width: 56 })}>1</td><td style={tdStyle()}><BlueLink>王传福</BlueLink></td><td style={tdStyle()}>16.9%</td><td style={tdStyle()}>法定代表人、董事长、股东</td></tr>
        </TableShell>
      </SubPanel>
      {/* 9-2 实控人 */}
      <SubPanel title="实控人">
        <TableShell headers={['序号', '实控人名称', '持股比例', '持股路径数量', '股权链']}>
          <tr><td style={tdStyle({ width: 56 })}>1</td><td style={tdStyle()}><BlueLink>王传福</BlueLink></td><td style={tdStyle()}>16.9%</td><td style={tdStyle()}>1</td><td style={tdStyle()}>路径1：(持股比例:16.9%)比亚迪股份有限公司</td></tr>
        </TableShell>
      </SubPanel>
      {/* 9-3 最终受益人 */}
      <SubPanel title="最终受益人">
        <TableShell headers={['序号', '最终受益人名称', '最终受益股份', '任职类型', '判定理由']}>
          <tr><td style={tdStyle({ width: 56 })}>1</td><td style={tdStyle()}><BlueLink>王传福</BlueLink></td><td style={tdStyle()}>16.9%</td><td style={tdStyle()}>法定代表人、董事、股东</td><td style={tdStyle()}>银发【2017】235号文件—（三）第1条:无直接或间接持有超过25%公司股权或者表决权的自然人，默认认定公司的实际控制人为受益所有人</td></tr>
        </TableShell>
      </SubPanel>
      {/* 9-4 十大受益人 */}
      <SubPanel title="十大受益人">
        <TableShell headers={['序号', '受益人名称', '最终受益股份', '任职类型', '股权链']}>
          {TOP_BENEFICIARY.map((r, i) => (
            <tr key={i}>
              <td style={tdStyle({ width: 56 })}>{i + 1}</td>
              <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
              <td style={tdStyle()}>{r.benefit}</td>
              <td style={tdStyle()}>{r.post}</td>
              <td style={tdStyle()}>{r.chain}</td>
            </tr>
          ))}
        </TableShell>
        <Pagination total={9} />
      </SubPanel>
      {/* 9-5 受益所有人 */}
      <SubPanel title="受益所有人1" titleRight={<DownloadBtn />}>
        <FilterBar>
          <Select placeholder="主体类型" />
          <span style={{ fontSize: 12, color: '#bbb' }}>数据更新时间：2026-08-04</span>
        </FilterBar>
        <TableShell headers={['序号', '受益所有人', '受益类型', '任职类型', '持股类型', '持股比例', '受益所有权形成日期', '判定原因']}>
          <tr>
            <td style={tdStyle({ width: 56 })}>1</td>
            <td style={tdStyle()}><BlueLink>王传福</BlueLink></td>
            <td style={tdStyle()}>单独或者联合实际控制</td>
            <td style={tdStyle()}>法定代表人</td>
            <td style={tdStyle()}>直接持股</td>
            <td style={tdStyle()}>16.9%</td>
            <td style={tdStyle()}>1995-04-08</td>
            <td style={tdStyle()}>单独或者联合实际控制的自然人</td>
          </tr>
        </TableShell>
      </SubPanel>
    </div>
  )
}
function SubPanel({ title, titleRight, children }: { title: string; titleRight?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 24, border: '1px solid #e5e6eb', borderRadius: 8, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', background: '#fafbfc', borderBottom: '1px solid #e5e6eb' }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1d2129' }}>{title}</span>
        {titleRight}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  )
}

// ============ 模块10：实控企业 ============
function M10ActualControl() {
  return (
    <div style={{ marginBottom: 40 }} id="section-actual-control">
      <ModuleTitle title="实控企业" count="860" right={
        <div style={{ display: 'flex', gap: 8 }}>
          <button style={{ padding: '5px 12px', borderRadius: 4, border: '1px solid #d9d9d9', background: '#fff', fontSize: 13, cursor: 'pointer' }}>批量查询列表内的企业</button>
          <DownloadBtn />
        </div>
      } />
      <FilterBar>
        <Select placeholder="投资比例" />
        <Select placeholder="登记状态" />
        <Select placeholder="所属地区" />
        <Select placeholder="所属行业" />
      </FilterBar>
      <TableShell headers={['序号', '企业名称', '状态', '法定代表人/负责人', '成立日期', '注册资本', '所属地区', '所属行业']}>
        {ACTUAL_CONTROL.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.status}</td>
            <td style={tdStyle()}>{r.legal}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.capital}</td>
            <td style={tdStyle()}>{r.region}</td>
            <td style={tdStyle()}>{r.industry}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={860} />
    </div>
  )
}

// ============ 模块11：间接持股企业 ============
function M11IndirectHold() {
  return (
    <div style={{ marginBottom: 40 }} id="section-indirect-hold">
      <ModuleTitle title="间接持股企业" count="4650" />
      <FilterBar>
        <Select placeholder="间接持股比例" />
        <Select placeholder="登记状态" />
        <Select placeholder="所属地区" />
        <Select placeholder="所属行业" />
      </FilterBar>
      <TableShell headers={['序号', '间接持股企业名称', '状态', '法定代表人', '成立日期', '注册资本', '所属地区', '所属行业']}>
        {INDIRECT_HOLD.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.status}</td>
            <td style={tdStyle()}>{r.legal}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.capital}</td>
            <td style={tdStyle()}>{r.region}</td>
            <td style={tdStyle()}>{r.industry}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={4650} />
    </div>
  )
}

// ============ 模块12：合作持股股东 ============
function M12CoopShareholder() {
  const [expand, setExpand] = useState<number | null>(null)
  return (
    <div style={{ marginBottom: 40 }} id="section-coop-shareholder">
      <ModuleTitle title="合作持股股东" count="1403" right={<><SearchInput placeholder="搜索合作持股股东" width={180} /><DownloadBtn /></>} />
      <TableShell headers={['序号', '合作持股股东', '共同持股企业数量', '共同持股企业详情']}>
        {COOP_SHAREHOLDER.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.count}</td>
            <td style={tdStyle()}>
              <div style={{ fontSize: 12, color: '#666', lineHeight: 1.8 }}>{expand === i ? r.detail : r.detail.slice(0, 30) + (r.detail.length > 30 ? '…' : '')}</div>
              {r.more && <BlueLink onClick={() => setExpand(expand === i ? null : i)}>{expand === i ? '收起' : '查看更多'}</BlueLink>}
            </td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={1403} />
    </div>
  )
}

// ============ 模块13：疑似关系 ============
function M13SuspectRelation() {
  const [sub, setSub] = useState('全部')
  return (
    <div style={{ marginBottom: 40 }} id="section-suspect-relation">
      <ModuleTitle title="疑似关系" count="37" right={
        <div style={{ display: 'flex', gap: 8 }}>
          <Select placeholder="全部/部分关系" />
          <DownloadBtn />
        </div>
      } />
      <TableShell headers={['序号', '企业名称', '法定代表人/负责人', '注册资本', '成立日期', '疑似关联类型', '疑似关联详情']}>
        {SUSPECT_RELATION.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.legal}</td>
            <td style={tdStyle()}>{r.capital}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.type}</td>
            <td style={tdStyle()}>{r.detail}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={37} />
    </div>
  )
}

// ============ 模块14：同业分析（图表） ============
function M14IndustryAnalysis() {
  return (
    <div style={{ marginBottom: 40 }} id="section-industry-analysis">
      <ModuleTitle title="同业分析" right={<Select placeholder="全国" />} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {/* 环形仪表盘：全国评价 */}
        <ChartCard title="企业在全国范围评价">
          <svg width="100%" height="150" viewBox="0 0 240 150">
            <path d="M30 130 A100 100 0 0 1 210 130" fill="none" stroke="#eee" strokeWidth="14" strokeLinecap="round" />
            <path d="M30 130 A100 100 0 0 1 100 40" fill="none" stroke="#f5a623" strokeWidth="14" strokeLinecap="round" />
            <path d="M100 40 A100 100 0 0 1 170 52" fill="none" stroke="#165dff" strokeWidth="14" strokeLinecap="round" />
            <text x="120" y="120" textAnchor="middle" fontSize="15" fontWeight="700" fill="#165dff">优秀</text>
          </svg>
          <Legend items={[['偏低', '#eee'], ['中等', '#f5a623'], ['优秀', '#165dff']]} />
        </ChartCard>
        {/* 环形饼图：注册资本区间分布 */}
        <ChartCard title="注册资本区间分布">
          <svg width="100%" height="150" viewBox="0 0 240 150">
            <circle cx="80" cy="75" r="50" fill="none" stroke="#165dff" strokeWidth="22" strokeDasharray="160 154" />
            <circle cx="80" cy="75" r="50" fill="none" stroke="#00b42a" strokeWidth="22" strokeDasharray="90 224" strokeDashoffset="-160" />
            <circle cx="80" cy="75" r="50" fill="none" stroke="#ff7d00" strokeWidth="22" strokeDasharray="60 254" strokeDashoffset="-250" />
            <text x="80" y="80" textAnchor="middle" fontSize="13" fontWeight="700" fill="#333">1000万+</text>
          </svg>
          <Legend items={[['1000万以上', '#165dff'], ['100-1000万', '#00b42a'], ['100万以下', '#ff7d00']]} />
        </ChartCard>
        {/* 折线图：成立时间分布 */}
        <ChartCard title="企业成立时间分布">
          <svg width="100%" height="160" viewBox="0 0 320 160">
            <polyline points="20,130 70,90 120,100 170,50 220,70 270,30" fill="none" stroke="#165dff" strokeWidth="2" />
            {[[20,130],[70,90],[120,100],[170,50],[220,70],[270,30]].map((p,i)=><circle key={i} cx={p[0]} cy={p[1]} r="3" fill="#165dff" />)}
            {['2010','2014','2018','2020','2022','2025'].map((y,i)=><text key={i} x={[20,70,120,170,220,270][i]} y="150" textAnchor="middle" fontSize="10" fill="#999">{y}</text>)}
          </svg>
        </ChartCard>
        {/* 横向柱状图：地域分布 */}
        <ChartCard title="同业企业地域分布">
          <BarH data={[['广东', 86], ['江苏', 72], ['浙江', 64], ['山东', 58], ['上海', 41]]} />
        </ChartCard>
        {/* 横向柱状图：资本分布 */}
        <ChartCard title="同业企业资本分布">
          <BarH data={[['1000万+', 78], ['100-1000万', 65], ['5000万+', 38], ['1亿+', 22]]} />
        </ChartCard>
      </div>
      <div style={{ marginTop: 12, fontSize: 13, color: '#666', lineHeight: 1.8 }}>结论：比亚迪在全国新能源车整车制造行业中综合评分优秀，注册资本规模处于行业前列，同业企业主要分布在广东、江苏、浙江等沿海省份，成立时间近年呈快速上升趋势。</div>
    </div>
  )
}
function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid #e5e6eb', borderRadius: 8, padding: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 600, color: '#1d2129', marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  )
}
function Legend({ items }: { items: [string, string][] }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 8, flexWrap: 'wrap' }}>
      {items.map(([t, c]) => (
        <span key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#666' }}>
          <span style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />{t}
        </span>
      ))}
    </div>
  )
}
function BarH({ data }: { data: [string, number][] }) {
  const max = Math.max(...data.map(d => d[1]))
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 6 }}>
      {data.map(([name, val]) => (
        <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#666', width: 80, flexShrink: 0 }}>{name}</span>
          <div style={{ flex: 1, background: '#f2f3f5', borderRadius: 4, height: 16, overflow: 'hidden' }}>
            <div style={{ width: `${(val / max) * 100}%`, height: '100%', background: 'linear-gradient(90deg,#4080ff,#165dff)', borderRadius: 4 }} />
          </div>
          <span style={{ fontSize: 12, color: '#333', width: 32, textAlign: 'right' }}>{val}</span>
        </div>
      ))}
    </div>
  )
}

// ============ 模块15：全球关联企业 ============
function M15GlobalRelation() {
  return (
    <div style={{ marginBottom: 40 }} id="section-global-relation">
      <ModuleTitle title="全球关联企业" count="11" />
      <TableShell headers={['序号', '参股企业', '参控关系', '注册资本', '持股比例', '投资额度', '最新统计日期', '详情']}>
        {GLOBAL_RELATION.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.relation}</td>
            <td style={tdStyle()}>{r.capital}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.amount}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}><BlueLink>详情</BlueLink></td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={11} />
    </div>
  )
}

// ============ 模块16：所属集团 ============
function M16Group() {
  return (
    <div style={{ marginBottom: 40 }} id="section-group">
      <ModuleTitle title="所属集团" />
      <TableShell headers={['序号', '集团名称', '集团公司', '集团成员', '集团注册资本', '持股比例', '详情']}>
        {GROUP_INFO.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.company}</td>
            <td style={tdStyle()}>{r.members}</td>
            <td style={tdStyle()}>{r.capital}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}><BlueLink>详情</BlueLink></td>
          </tr>
        ))}
      </TableShell>
    </div>
  )
}

function BasicModules() {
  // 模块 → 锚点 id（供顶部二级 Tab 滚动定位）
  const sec = (id: string, node: React.ReactNode) => <div key={id} id={`section-${id}`} style={{ scrollMarginTop: 140 }}>{node}</div>
  return (
    <>
      {sec('qixin-map', <M0QixinMap />)}
      {sec('ic-info', <M1IcForm />)}
      {sec('shareholder', <M2Shareholder />)}
      {sec('indirect-shareholder', <M3IndirectShareholder />)}
      {sec('main-person', <M4MainPerson />)}
      {sec('out-invest', <M5OutInvest />)}
      {sec('change-record', <M6ChangeRecord />)}
      {sec('annual-report', <M7AnnualReport />)}
      {sec('branch', <M8Branch />)}
      {sec('key-person', <M9KeyPerson />)}
      {sec('actual-control', <M10ActualControl />)}
      {sec('indirect-hold', <M11IndirectHold />)}
      {sec('coop-shareholder', <M12CoopShareholder />)}
      {sec('suspect-relation', <M13SuspectRelation />)}
      {sec('industry-analysis', <M14IndustryAnalysis />)}
      {sec('global-relation', <M15GlobalRelation />)}
      {sec('group', <M16Group />)}
    </>
  )
}

// 图谱/概览类 Key（其他Tab占位类型）
const GRAPH_KEYS = ['qixin-map', 'company-chain', 'equity-penetrate', 'equity-structure', 'controller-relation', 'beneficial-owner', 'company-relation', 'related-party', 'top-beneficiary']
const OVERVIEW_KEYS = ['ip-overview', 'news-overview', 'risk-overview', 'debt-analysis']

function PlaceholderBlock({ child }: { child: { key: string; label: string; count?: string; history?: boolean; warn?: boolean } }) {
  const isGraph = GRAPH_KEYS.includes(child.key)
  const isOverview = OVERVIEW_KEYS.includes(child.key)
  return (
    <div id={`section-${child.key}`} style={{ marginBottom: 40, scrollMarginTop: 140 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1d2129', margin: '0 0 20px 0', paddingBottom: 12, borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', gap: 8 }}>
        {child.warn && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f53f3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
        {child.label}
        {child.history && <span style={{ fontSize: 12, color: '#86909c', fontWeight: 400 }}>历史&gt;</span>}
        {child.count && <span style={{ fontSize: 14, color: '#f53f3f', fontWeight: 400 }}>{child.count}</span>}
      </h3>
      {isGraph && <div style={{ height: 400, border: '1px dashed #c9cdd4', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86909c', fontSize: 14, background: '#fafbfc' }}><div style={{ fontSize: 48, marginBottom: 12 }}>🕸️</div><div>企业图谱可视化区域占位</div></div>}
      {isOverview && <div style={{ minHeight: 200, border: '1px dashed #c9cdd4', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86909c', fontSize: 14, background: '#fafbfc' }}><div style={{ fontSize: 48, marginBottom: 12 }}>📈</div><div>统计概览/分析类模块占位</div></div>}
      {!isGraph && !isOverview && <div style={{ border: '1px solid #e5e6eb', borderRadius: 8, overflow: 'hidden' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}><tbody><tr><td style={{ padding: '60px 16px', textAlign: 'center', color: '#86909c', fontSize: 14 }}>📊 暂无数据，待后续补充</td></tr></tbody></table></div>}
    </div>
  )
}

export default function DmEntArchiveBasic() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const companyName = params.get('name') || '比亚迪股份有限公司'
  const [activeTab, setActiveTab] = useState('basic')
  const [activeSubTab, setActiveSubTab] = useState('ic-info')
  // 企业图谱：8 个主题切换显示（当前选中主题）
  const [graphActiveSub, setGraphActiveSub] = useState('企业链图')
  // 基本信息：顶部二级 Tab 选中态（滑动定位）
  const [basicActiveSub, setBasicActiveSub] = useState('ic-info')
  const basicTab = TABS.find(t => t.key === 'basic')
  const scrollToBasic = (key: string) => {
    setBasicActiveSub(key)
    const el = document.getElementById(`section-${key}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  // 图谱主题 key → 标题 label（用于主 Tab 下拉子项切换到对应图谱主题）
  const GRAPH_SUB_MAP: Record<string, string> = {
    'company-chain': '企业链图',
    'equity-penetrate': '股权穿透',
    'equity-structure': '股权结构',
    'controller-relation': '控制人关系',
    'beneficial-owner': '受益所有人',
    'company-relation': '企业关系',
    'related-party': '关联方认定',
    'top-beneficiary': '十大受益人',
  }
  const [introExpanded, setIntroExpanded] = useState(false)
  // 多列菜单面板：默认收起，鼠标悬停展开；列内全展开、顶部对齐、无单列滚动
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  // 一级 Tab 面板：改为「点击展开」，鼠标悬停/二级 tab 操作不触发面板，避免误弹
  // 一级 Tab 面板：鼠标悬停 2s 后自动展开，无需点击
  const openPanel = (key: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => { setHoveredTab(key); setPanelOpen(true) }, 2000)
  }
  const closePanel = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHoveredTab(null); setPanelOpen(false)
  }
  const handleTabClick = (mainKey: string) => {
    const tab = TABS.find(t => t.key === mainKey)
    setActiveTab(mainKey)
    if (tab && tab.children.length > 0) {
      setActiveSubTab(tab.children[0].key)
      // 企业图谱：默认切到第一个主题
      if (mainKey === 'graph') setGraphActiveSub(GRAPH_SUB_MAP[tab.children[0].key] || '企业链图')
      setTimeout(() => {
        if (mainKey === 'graph') {
          const el = document.getElementById('ent-graph-section')
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        } else {
          const el = document.getElementById(`section-${tab.children[0].key}`)
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
      }, 80)
    } else {
      setActiveSubTab('')
    }
  }
  const handleSubClick = (mainKey: string, subKey: string) => {
    setActiveTab(mainKey); setActiveSubTab(subKey)
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHoveredTab(null); setPanelOpen(false)
    // 企业图谱：切换 8 个主题显示，滚动到图谱容器
    if (mainKey === 'graph') {
      if (GRAPH_SUB_MAP[subKey]) setGraphActiveSub(GRAPH_SUB_MAP[subKey])
      setTimeout(() => {
        const el = document.getElementById('ent-graph-section')
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
      return
    }
    setTimeout(() => {
      const el = document.getElementById(`section-${subKey}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  useEffect(() => {
    const onScroll = () => {
      const currentTab = TABS.find(t => t.key === activeTab)
      if (!currentTab) return
      for (let i = currentTab.children.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${currentTab.children[i].key}`)
        if (el && el.getBoundingClientRect().top <= 140) { setActiveSubTab(currentTab.children[i].key); break }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [activeTab])

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: '#f5f7fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' }}>
      <div style={{ width: '100%', minWidth: 0, padding: '20px 32px 40px' }}>
        {/* 返回 */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#4e5969', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>返回
          </button>
        </div>

        {/* ============ 企业摘要卡片 ============ */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '16px 24px 20px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {/* 一、顶部操作区 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 16 }}>
            <button style={{ padding: '6px 14px', borderRadius: 4, background: '#fff', border: '1px solid #d9d9d9', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>开始营销<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            <button style={{ padding: '6px 14px', borderRadius: 4, background: '#fff', border: '1px solid #d9d9d9', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>+ 添加至<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            <button style={{ padding: '6px 16px', borderRadius: 4, background: '#ff9900', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>下载报告</button>
          </div>
          {/* 二、标题栏 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{ width: 56, height: 56, borderRadius: 8, background: '#d42a2a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 700, letterSpacing: 1, flexShrink: 0 }}>BYD</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#333', margin: 0 }}>{companyName}</h1>
            <span style={{ padding: '2px 10px', borderRadius: 4, background: '#87d068', color: '#fff', fontSize: 12 }}>存续</span>
          </div>
          {/* 三、标签&证券代码栏 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 16px', marginBottom: 10 }}>
            {TAG_LINKS.map((tag, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                {tag.link ? <a style={{ color: '#0066cc', fontSize: 13, cursor: 'pointer' }}>{tag.text}</a> : <span style={{ color: '#666', fontSize: 13 }}>{tag.text}</span>}
                {tag.badge && <span style={{ fontSize: 10, color: '#0066cc', background: '#e8f1ff', border: '1px solid #bcd8ff', borderRadius: 2, padding: '0 3px', marginLeft: 2 }}>{tag.badge}</span>}
                {tag.dropdown && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#999' }}><polyline points="6 9 12 15 18 9"></polyline></svg>}
              </span>
            ))}
          </div>
          {/* 业务关键词 + 右侧辅助 */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 16 }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {BIZ_KEYWORDS.map(kw => <span key={kw} style={{ color: '#999', fontSize: 12, background: '#f5f5f5', borderRadius: 4, padding: '2px 8px' }}>{kw}</span>)}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
              <a style={{ color: '#0066cc', fontSize: 13, cursor: 'pointer' }}>PK 企业对比</a>
              <a style={{ color: '#0066cc', fontSize: 13, cursor: 'pointer' }}>⊕ 找关系(0)</a>
              <span style={{ color: '#999', fontSize: 12 }}>2026-08-18更新</span>
              <span style={{ color: '#0066cc', fontSize: 12, fontWeight: 600 }}>最近30天更新</span>
            </div>
          </div>
          {/* 四、核心工商信息区 */}
          <div style={{ borderTop: '1px solid #f0f0f0' }}>
            {IC_ROWS.map((row, rIdx) => (
              <div key={rIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0 24px', padding: '11px 0', borderBottom: '1px solid #f0f0f0' }}>
                {row.map((cell, cIdx) => (
                  <div key={cIdx} style={{ display: 'flex', alignItems: 'baseline', gap: 6, fontSize: 13, minWidth: 0 }}>
                    <span style={{ color: '#666', flexShrink: 0 }}>{cell.k}：</span>
                    <span style={{ color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{cell.v}</span>
                    {cell.dropdown && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#999', flexShrink: 0 }}><polyline points="6 9 12 15 18 9"></polyline></svg>}
                    {cell.tag && <span style={{ fontSize: 11, color: '#0066cc', background: '#e8f1ff', border: '1px solid #bcd8ff', borderRadius: 3, padding: '0 4px', flexShrink: 0 }}>{cell.tag}</span>}
                    {cell.links && cell.links.map(l => <a key={l} style={{ color: '#0066cc', fontSize: 12, cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap' }}>{l}</a>)}
                  </div>
                ))}
              </div>
            ))}
          </div>
          {/* 五、经营范围 & 简介 */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 13, lineHeight: 1.9, color: '#333' }}><span style={{ color: '#666' }}>经营范围：</span>{BIZ_SCOPE}</div>
            <div style={{ fontSize: 13, lineHeight: 1.9, color: '#333', marginTop: 6 }}>
              <span style={{ color: '#666' }}>企业简介：</span>
              <span style={{ display: '-webkit-box', WebkitLineClamp: introExpanded ? 'unset' as any : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ENT_INTRO}</span>
              <a style={{ color: '#0066cc', fontSize: 12, cursor: 'pointer', marginLeft: 8 }} onClick={() => setIntroExpanded(!introExpanded)}>{introExpanded ? '收起' : '展开'}</a>
              <a style={{ color: '#0066cc', fontSize: 12, cursor: 'pointer', marginLeft: 8 }}>复制</a>
            </div>
          </div>
          {/* 六、底部快捷卡片 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, paddingTop: 16 }}>
            {FUNC_CARDS.map(card => (
              <div key={card.title} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '12px', borderRadius: 8, border: '1px solid #f0f0f0', cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#0066cc'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,102,204,0.12)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#f0f0f0'; e.currentTarget.style.boxShadow = 'none' }}>
                <div style={{ width: 38, height: 38, borderRadius: 8, background: '#e8f1ff', color: '#0066cc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>{card.icon}</div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#333', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>{card.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============ Tab导航（默认收起；悬停展开多列菜单面板；列内全展开 / 顶部对齐） ============ */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>
          <style>{`.fk-tabs::-webkit-scrollbar{height:0;width:0}`}</style>
          {/* relative 包裹：Tab 栏常驻 + 悬停下拉面板 */}
          <div style={{ position: 'relative' }} onMouseLeave={closePanel}>
            {/* 顶层 Tab 栏：始终可见 */}
            <div className="fk-tabs" style={{ display: 'flex', padding: '0 16px', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', borderRadius: panelOpen ? '12px 12px 0 0' : '12px' }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.key
                const panelActive = panelOpen && hoveredTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onClick={() => handleTabClick(tab.key)}
                    onMouseEnter={() => openPanel(tab.key)}
                    aria-haspopup="true"
                    aria-expanded={panelActive}
                    style={{
                      padding: '14px 18px', border: 'none', background: 'none', fontSize: 15,
                      fontWeight: isActive ? 600 : 400,
                      color: isActive ? '#165dff' : '#4e5969',
                      borderBottom: isActive ? '2px solid #165dff' : '2px solid transparent',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap', transition: 'all 0.15s'
                    }}
                  >
                    {tab.label}
                    {tab.count && <span style={{ fontSize: 12, color: isActive ? '#165dff' : '#86909c', fontWeight: 400 }}>{tab.count}</span>}
                  </button>
                )
              })}
            </div>
            {/* 悬停展开的多列菜单面板（列内全展开、顶部对齐、无单列滚动） */}
            {panelOpen && hoveredTab && (
              <div
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: -1, background: '#fff', boxShadow: '0 12px 32px rgba(0,0,0,0.14)', borderRadius: '0 0 12px 12px', padding: '16px 0', zIndex: 101 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', minWidth: 0, overflowX: 'auto' }}>
                  {TABS.map((tab, idx) => {
                    const isHoverCol = hoveredTab === tab.key
                    const isLast = idx === TABS.length - 1
                    return (
                      <div key={tab.key} onMouseEnter={() => setHoveredTab(tab.key)} style={{ flex: '0 0 auto', minWidth: 140, maxWidth: 220, padding: '0 16px', borderRight: isLast ? 'none' : '1px solid #f2f3f5', background: isHoverCol ? '#fafbff' : '#fff', transition: 'background 0.15s' }}>
                        {/* 统一高度面板头部 */}
                        <div
                          onClick={() => handleTabClick(tab.key)}
                          style={{
                            height: 40, lineHeight: '40px', padding: '0 4px', boxSizing: 'border-box',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6,
                            fontSize: 14, fontWeight: activeTab === tab.key ? 700 : 600,
                            color: activeTab === tab.key ? '#165dff' : '#1d2129',
                            borderBottom: activeTab === tab.key ? '2px solid #165dff' : '2px solid transparent',
                            cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s'
                          }}
                        >
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{tab.label}</span>
                          {tab.count && <span style={{ fontSize: 12, color: activeTab === tab.key ? '#165dff' : '#86909c', fontWeight: 400, flexShrink: 0 }}>{tab.count}</span>}
                        </div>
                        {/* 菜单列表：自适应高度，无内嵌滚动 */}
                        <div style={{ padding: '8px 4px' }}>
                          {tab.children.length === 0 && (
                            <div style={{ padding: '10px 0', fontSize: 13, color: '#c9cdd4' }}>建设中</div>
                          )}
                          {tab.children.map(child => {
                            const active = activeSubTab === child.key && activeTab === tab.key
                            const disabled = child.state === 'noauth'
                            return (
                              <div
                                key={child.key}
                                onClick={() => !disabled && handleSubClick(tab.key, child.key)}
                                style={{
                                  padding: '6px 0', fontSize: 13, lineHeight: '20px', cursor: disabled ? 'not-allowed' : 'pointer',
                                  color: active ? '#165dff' : (child.state === 'empty' || disabled ? '#c9cdd4' : '#4e5969'),
                                  background: active ? '#eaf2ff' : 'transparent',
                                  borderRadius: 4, transition: 'background 0.15s', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', overflow: 'hidden'
                                }}
                                onMouseEnter={e => { if (!active && !disabled) e.currentTarget.style.background = '#f2f3f5' }}
                                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}
                              >
                                {child.warn && (
                                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f53f3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 4, verticalAlign: 'middle' }} role="img" aria-label="存在风险信息"><title>存在风险信息</title><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                )}
                                <span style={{ color: active ? '#165dff' : (child.state === 'empty' || disabled ? '#c9cdd4' : '#4e5969') }}>{child.label}</span>
                                {child.history && <span style={{ fontSize: 11, color: '#86909c', marginLeft: 4 }}>历史&gt;</span>}
                                {child.state === 'loading' && <span style={{ fontSize: 11, color: '#86909c', marginLeft: 4 }}>加载中…</span>}
                                {child.count && <span style={{ fontSize: 12, color: '#165dff', marginLeft: 4 }}>{child.count}</span>}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ============ Tab内容区 ============ */}
        <div onClick={closePanel} style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {activeTab === 'graph' ? (
            /* 企业图谱：8 个主题切换显示，每次只显示一个 */
            <div id="ent-graph-section" style={{ scrollMarginTop: 140 }}>
              <EntChainGraph companyName={companyName} activeSub={graphActiveSub} onSubChange={setGraphActiveSub} />
            </div>
          ) : activeTab === 'operation-risk' ? (
            <EntOperatingRisk companyName={companyName} menu={TABS.find(t => t.key === 'operation-risk')?.children || []} />
          ) : activeTab === 'operation-info' ? (
            <EntOperatingInfo companyName={companyName} menu={TABS.find(t => t.key === 'operation-info')?.children || []} />
          ) : activeTab === 'history' ? (
            <EntHistoryInfo companyName={companyName} menu={TABS.find(t => t.key === 'history')?.children || []} />
          ) : activeTab === 'judicial-risk' ? (
            <EntLegalRisk companyName={companyName} menu={TABS.find(t => t.key === 'judicial-risk')?.children || []} />
          ) : activeTab === 'listing-info' ? (
            <EntListingInfo companyName={companyName} />
          ) : activeTab === 'news' ? (
            <EntNewsSentiment companyName={companyName} />
          ) : activeTab === 'ip' ? (
            <EntIntellectualProperty companyName={companyName} />
          ) : activeTab === 'basic' ? (
            <div>
              {/* 基本信息 · 顶部二级 Tab（横向自动换行，点击滑动定位） */}
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '4px 2px 12px', marginBottom: 16, borderBottom: '1px solid #edf0f5' }}>
                {(basicTab?.children || []).map(c => (
                  <button
                    key={c.key}
                    onClick={() => scrollToBasic(c.key)}
                    style={{
                      padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer', whiteSpace: 'nowrap',
                      border: basicActiveSub === c.key ? '1px solid #1677ff' : '1px solid #e0e3ea',
                      background: basicActiveSub === c.key ? '#eaf2ff' : '#fff',
                      color: basicActiveSub === c.key ? '#1677ff' : '#666',
                      fontWeight: basicActiveSub === c.key ? 600 : 400,
                    }}
                  >
                    {c.label}{c.count ? ` ${c.count}` : ''}
                  </button>
                ))}
              </div>
              <BasicModules />
            </div>
          ) : (
            TABS.filter(tab => tab.key === activeTab).map(tab => (
              <div key={tab.key}>
                {tab.children.length === 0 ? (
                  <div style={{ padding: '80px 0', textAlign: 'center', color: '#86909c', fontSize: 14 }}><div style={{ fontSize: 48, marginBottom: 12 }}>🧩</div>自定义页模块建设中，后续可在此添加自定义数据模块</div>
                ) : tab.children.map(child => <PlaceholderBlock key={child.key} child={child} />)}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
