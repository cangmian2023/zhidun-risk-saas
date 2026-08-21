import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Sam, Cal } from './SourceTag'
import { useSample } from './enterprise/epCommon'
import PersonGraph from './PersonGraph'

/* 数字营销 · 个人档案 · 新版 1:1 复刻（与 DmEntArchiveBasic 保持完全一致的视觉语言）
 * 头部：个人摘要六段式（丁磊样例）
 * Tab：主Tab栏悬停展开多列大面板（企查查/企信宝风格），点击子项锚点滚动
 * 基本信息 Tab：5 个核心模块（合作伙伴 / 担任法定代表人的企业 / 担任股东的企业 / 担任高管的企业 / 持股企业）
 * 风险信息 Tab：5 个维度（失信被执行人 / 被执行人 / 限制高消费 / 股权冻结 / 股权出质）
 * 专利信息 Tab：专利信息概览 / 专利信息列表 / 关联企业风险
 * 关联企业风险 Tab：单独维度
 * 个人图谱 Tab：交互式横向树状关系图谱
 * 历史信息 Tab：合作伙伴 / 4 类任职 / 5 类风险历史
 */

// ============ 个人摘要数据（丁磊样例） ============
const PERSON_TAGS: { text: string; link?: boolean; dropdown?: boolean }[] = [
  { text: '股权出质', link: true, dropdown: true },
  { text: '杭州网易妙得科技集团', link: true, dropdown: true },
]

const RISK_ROW: { label: string; value: number | string; warn?: boolean }[] = [
  { label: '启信风险', value: 22 },
  { label: '失信被执行人', value: 0, warn: true },
  { label: '被执行人', value: 0, warn: true },
  { label: '限制高消费', value: 0, warn: true },
  { label: '股权冻结', value: 0, warn: true },
  { label: '股权出质', value: 22 },
]
const REL_RISK_ROW: { label: string; value: number | string }[] = [
  { label: '关联风险', value: 637 },
  { label: '关联企业', value: 68 },
]

const PERSON_INTRO = '丁磊，1997年6月创立网易公司，2000年3月，丁磊辞去网易公司首席执行官，出任网易公司联合首席技术执行官，2001年3月，担任首席架构设计师，专注于公司远景战略的设计与规划。在创立网易公司之前，丁磊曾是中国电信的一名技术工程师。'

const IC_FORM: { k: string; v: string; note?: string }[] = [
  { k: '姓名', v: '丁磊', note: '曾用名：无' },
  { k: '性别', v: '男', note: '民族：汉族' },
  { k: '出生日期', v: '1971-10-01' },
  { k: '身份证号', v: '33020619711001001X', note: '户籍地区：浙江省宁波市' },
  { k: '政治面貌', v: '群众', note: '学历：大专' },
  { k: '毕业院校', v: '电子科技大学', note: '所学专业：通信工程' },
  { k: '手机号', v: '186****6823', note: '邮箱：dingle@corp.netease.com' },
  { k: '所属地区', v: '浙江省杭州市滨江区', note: '更新时间：2026-08-04' },
]

const FUNC_CARDS = [
  { icon: '丁', title: '个人图谱', desc: '关联企业 280 任职高管 17' },
  { icon: '合', title: '合作伙伴', desc: '合作伙伴 11 历史9' },
  { icon: '企', title: '担任法定代表人的企业', desc: '现21 历史11 共32' },
  { icon: '股', title: '担任股东的企业', desc: '现25 历史3 共28' },
  { icon: '高', title: '担任高管的企业', desc: '现16 历史17 共33' },
]

// ============ 完整 Tab 配置（6 个主 Tab + 每个 Tab 的子模块） ============
const TABS = [
  {
    key: 'basic', label: '基本信息', count: '779',
    children: [
      { key: 'partner', label: '合作伙伴', count: '11', history: true },
      { key: 'legal-rep', label: '担任法定代表人的企业', count: '21' },
      { key: 'shareholder', label: '担任股东的企业', count: '25' },
      { key: 'executive', label: '担任高管的企业', count: '16' },
      { key: 'holding', label: '持股企业', count: '280' },
    ]
  },
  {
    key: 'risk', label: '风险信息', count: '13',
    children: [
      { key: 'dishonest', label: '失信被执行人', warn: true, state: 'empty' },
      { key: 'executed', label: '被执行人', warn: true, state: 'empty' },
      { key: 'high-consume', label: '限制高消费', warn: true, state: 'empty' },
      { key: 'equity-freeze', label: '股权冻结', warn: true, state: 'empty' },
      { key: 'equity-pledge', label: '股权出质', count: '13' },
    ]
  },
  {
    key: 'patent', label: '专利信息', count: '46',
    children: [
      { key: 'patent-overview', label: '专利信息概览' },
      { key: 'patent-list', label: '专利信息', count: '46' },
      { key: 'patent-related', label: '关联企业风险' },
    ]
  },
  {
    key: 'related-risk', label: '关联企业风险', count: '68',
    children: [
      { key: 'related-overview', label: '关联企业风险概览' },
      { key: 'related-list', label: '关联企业风险', count: '68' },
    ]
  },
  { key: 'graph', label: '个人图谱', children: [] },
  {
    key: 'history', label: '历史信息', count: '49',
    children: [
      { key: 'history-partner', label: '合作伙伴', count: '9', history: true },
      { key: 'history-legal', label: '担任法定代表人的企业', count: '11', history: true },
      { key: 'history-shareholder', label: '担任股东的企业', count: '3', history: true },
      { key: 'history-executive', label: '担任高管的企业', count: '17', history: true },
      { key: 'history-dishonest', label: '失信被执行人', warn: true, history: true },
      { key: 'history-executed', label: '被执行人', warn: true, history: true },
      { key: 'history-high-consume', label: '限制高消费', warn: true, history: true },
      { key: 'history-freeze', label: '股权冻结', warn: true, history: true },
      { key: 'history-pledge', label: '股权出质', count: '9', history: true },
    ]
  },
]

// ============ 基本信息 5 模块数据 ============
const PARTNERS = [
  { name: '王巍', type: '合作伙伴', role: '网易(杭州)网络有限公司 · 联合创始人', tag: '核心团队', ratio: '—', post: '—', date: '1997-06-01' },
  { name: '张磊', type: '合作伙伴', role: '高瓴资本集团 · 创始人', tag: '投资伙伴', ratio: '—', post: '—', date: '2005-03-12' },
  { name: '陈天桥', type: '合作伙伴', role: '盛大集团 · 创始人', tag: '行业战友', ratio: '—', post: '—', date: '2003-08-22' },
  { name: '李学凌', type: '合作伙伴', role: '多牛传媒 · 创始人', tag: '内容合作', ratio: '—', post: '—', date: '2004-11-09' },
  { name: '马化腾', type: '合作伙伴', role: '腾讯科技(深圳)有限公司 · 创始人', tag: '战略合作', ratio: '—', post: '—', date: '2010-06-18' },
  { name: '刘强东', type: '合作伙伴', role: '北京京东世纪贸易有限公司 · 创始人', tag: '电商合作', ratio: '—', post: '—', date: '2014-07-04' },
  { name: '任宇昕', type: '合作伙伴', role: '腾讯科技 · 首席运营官', tag: '产品合作', ratio: '—', post: '—', date: '2016-09-15' },
  { name: '林斌', type: '合作伙伴', role: '小米科技 · 总裁', tag: '硬件合作', ratio: '—', post: '—', date: '2018-04-22' },
  { name: '周鸿祎', type: '合作伙伴', role: '360集团 · 创始人', tag: '安全合作', ratio: '—', post: '—', date: '2012-03-12' },
  { name: '吴亚军', type: '合作伙伴', role: '龙湖集团 · 董事长', tag: '地产合作', ratio: '—', post: '—', date: '2017-12-08' },
  { name: '王小川', type: '合作伙伴', role: '百川智能 · 创始人', tag: 'AI合作', ratio: '—', post: '—', date: '2023-04-26' },
]
const LEGAL_REP_COMPANIES = [
  { name: '网易(杭州)网络有限公司', status: '存续', capital: '26,800万美元', ratio: '—', date: '2006-06-08', industry: '互联网信息服务', region: '浙江' },
  { name: '杭州网易严选贸易有限公司', status: '存续', capital: '10,000万人民币', ratio: '—', date: '2016-04-11', industry: '零售业', region: '浙江' },
  { name: '网易传媒(北京)有限公司', status: '存续', capital: '5,000万人民币', ratio: '—', date: '2010-09-15', industry: '互联网信息服务', region: '北京' },
  { name: '北京网易传媒有限公司', status: '存续', capital: '8,000万人民币', ratio: '—', date: '2008-12-26', industry: '互联网信息服务', region: '北京' },
  { name: '网易有道信息技术(北京)有限公司', status: '存续', capital: '1,200万人民币', ratio: '—', date: '2006-04-28', industry: '教育', region: '北京' },
]
const SHAREHOLDER_COMPANIES = [
  { name: '网易(杭州)网络有限公司', type: '有限责任公司', ratio: '99.00%', capital: '26,800万美元', role: '董事长', date: '2006-06-08' },
  { name: '杭州网易严选贸易有限公司', type: '有限责任公司', ratio: '92.00%', capital: '10,000万人民币', role: '执行董事', date: '2016-04-11' },
  { name: '网易传媒(北京)有限公司', type: '有限责任公司', ratio: '85.00%', capital: '5,000万人民币', role: '董事长', date: '2010-09-15' },
  { name: '网易有道信息技术(北京)有限公司', type: '有限责任公司', ratio: '51.30%', capital: '1,200万人民币', role: '董事', date: '2006-04-28' },
  { name: '网易(香港)有限公司', type: '其他', ratio: '100.00%', capital: '1,000万港元', role: '董事', date: '2001-03-22' },
]
const EXEC_COMPANIES = [
  { name: '网易(杭州)网络有限公司', post: '董事长', ratio: '99.00%', salary: '180万人民币/年', date: '2006-06-08', industry: '互联网信息服务', region: '浙江' },
  { name: '网易传媒(北京)有限公司', post: '董事长', ratio: '85.00%', salary: '150万人民币/年', date: '2010-09-15', industry: '互联网信息服务', region: '北京' },
  { name: '北京网易传媒有限公司', post: '董事', ratio: '—', salary: '120万人民币/年', date: '2008-12-26', industry: '互联网信息服务', region: '北京' },
  { name: '网易有道信息技术(北京)有限公司', post: '董事', ratio: '51.30%', salary: '60万人民币/年', date: '2006-04-28', industry: '教育', region: '北京' },
  { name: '浙江网易数问智能科技有限公司', post: '董事长', ratio: '60.00%', salary: '90万人民币/年', date: '2018-08-22', industry: '软件开发', region: '浙江' },
]
const HOLDING_COMPANIES = [
  { name: '网易(香港)有限公司', ratio: '100.00%', level: '直接持股', capital: '1,000万港元', industry: '投资管理', date: '2001-03-22' },
  { name: '网易(杭州)网络有限公司', ratio: '99.00%', level: '直接持股', capital: '26,800万美元', industry: '互联网信息服务', date: '2006-06-08' },
  { name: '网易传媒(北京)有限公司', ratio: '85.00%', level: '直接持股', capital: '5,000万人民币', industry: '互联网信息服务', date: '2010-09-15' },
  { name: '北京有道计算机系统有限公司', ratio: '21.00%', level: '间接持股', capital: '5,000万人民币', industry: '教育', date: '2019-04-18' },
  { name: '网易音乐(杭州)有限公司', ratio: '70.00%', level: '直接持股', capital: '8,000万人民币', industry: '文化娱乐', date: '2013-07-25' },
]
const HISTORY_PARTNERS = [
  { name: '张朝阳', role: '搜狐公司 · 创始人', tag: '行业前辈', date: '1998-06-12' },
  { name: '王志东', role: '新浪网 · 创始人', tag: '门户战友', date: '1998-10-08' },
  { name: '丁健', role: '亚信集团 · 联合创始人', tag: '技术顾问', date: '1997-09-25' },
  { name: '田溯宁', role: '中国网通 · 创始人', tag: '运营商合作', date: '1999-11-12' },
  { name: '邓中翰', role: '中星微电子 · 创始人', tag: '芯片合作', date: '2001-04-18' },
  { name: '李国庆', role: '当当网 · 创始人', tag: '电商前辈', date: '2000-08-03' },
  { name: '沈南鹏', role: '红杉资本 · 创始人', tag: '投资伙伴', date: '2006-05-22' },
  { name: '徐小平', role: '真格基金 · 创始人', tag: '投资合作', date: '2011-09-15' },
  { name: '包凡', role: '华兴资本 · 创始人', tag: '融资顾问', date: '2013-03-08' },
]
const HISTORY_LEGAL = [
  { name: '上海网易网络有限公司', status: '注销', ratio: '—', date: '2002-04-15', reason: '业务整合' },
  { name: '广州网易计算机系统有限公司', status: '注销', ratio: '—', date: '2005-09-22', reason: '业务调整' },
  { name: '成都网易信息技术有限公司', status: '注销', ratio: '—', date: '2009-06-18', reason: '战略转型' },
  { name: '网易保险(杭州)有限公司', status: '注销', ratio: '—', date: '2018-11-30', reason: '出售重组' },
  { name: '网易云音乐早期主体', status: '注销', ratio: '—', date: '2019-08-12', reason: '主体变更' },
]
const HISTORY_SHAREHOLDER = [
  { name: '网易(广州)计算机系统有限公司', ratio: '70.00%', date: '2001-08-22', type: '退出' },
  { name: '杭州雷火科技有限公司', ratio: '40.00%', date: '2008-04-19', type: '减持' },
  { name: '上海网之易信息技术有限公司', ratio: '55.00%', date: '2014-09-12', type: '退出' },
]
const HISTORY_EXEC = [
  { name: '网易(广州)计算机系统有限公司', post: '首席执行官', date: '1999-06-12' },
  { name: '网易游戏事业部', post: '事业部总裁', date: '2002-11-05' },
  { name: '网易泡泡社区', post: '项目总指挥', date: '2004-08-19' },
  { name: '网易杭州研究院', post: '名誉院长', date: '2013-04-25' },
  { name: '网易影业(北京)有限公司', post: '董事长', date: '2016-12-08' },
]

// ============ 股权出质数据 ============
const EQUITY_PLEDGES = [
  { pledgor: '丁磊', pledgee: '中国工商银行股份有限公司杭州分行', equity: '网易(杭州)网络有限公司', ratio: '15.00%', amount: '4,020万美元', date: '2024-08-15', status: '有效' },
  { pledgor: '丁磊', pledgee: '中国建设银行股份有限公司浙江省分行', equity: '杭州网易严选贸易有限公司', ratio: '20.00%', amount: '2,000万人民币', date: '2024-12-09', status: '有效' },
  { pledgor: '丁磊', pledgee: '招商银行股份有限公司杭州分行', equity: '网易传媒(北京)有限公司', ratio: '8.00%', amount: '400万人民币', date: '2025-03-22', status: '有效' },
  { pledgor: '丁磊', pledgee: '中国银行股份有限公司浙江省分行', equity: '网易音乐(杭州)有限公司', ratio: '12.00%', amount: '960万人民币', date: '2025-05-18', status: '有效' },
  { pledgor: '丁磊', pledgee: '中信银行股份有限公司杭州分行', equity: '浙江网易数问智能科技有限公司', ratio: '10.00%', amount: '300万人民币', date: '2025-07-09', status: '有效' },
  { pledgor: '丁磊', pledgee: '交通银行股份有限公司浙江省分行', equity: '北京网易传媒有限公司', ratio: '5.00%', amount: '400万人民币', date: '2025-09-25', status: '有效' },
  { pledgor: '丁磊', pledgee: '平安银行股份有限公司杭州分行', equity: '杭州网易严选贸易有限公司', ratio: '8.00%', amount: '800万人民币', date: '2025-11-18', status: '有效' },
  { pledgor: '丁磊', pledgee: '上海浦东发展银行杭州分行', equity: '网易有道信息技术(北京)有限公司', ratio: '6.00%', amount: '72万人民币', date: '2026-01-15', status: '有效' },
  { pledgor: '丁磊', pledgee: '兴业银行股份有限公司杭州分行', equity: '网易(杭州)网络有限公司', ratio: '3.00%', amount: '804万美元', date: '2026-02-28', status: '有效' },
  { pledgor: '丁磊', pledgee: '中国民生银行股份有限公司杭州分行', equity: '网易音乐(杭州)有限公司', ratio: '5.00%', amount: '400万人民币', date: '2026-04-12', status: '有效' },
  { pledgor: '丁磊', pledgee: '北京银行股份有限公司杭州分行', equity: '杭州网易严选贸易有限公司', ratio: '4.00%', amount: '400万人民币', date: '2026-05-22', status: '有效' },
  { pledgor: '丁磊', pledgee: '杭州银行股份有限公司滨江支行', equity: '浙江网易数问智能科技有限公司', ratio: '3.00%', amount: '90万人民币', date: '2026-06-30', status: '有效' },
  { pledgor: '丁磊', pledgee: '宁波银行股份有限公司杭州分行', equity: '网易传媒(北京)有限公司', ratio: '4.00%', amount: '200万人民币', date: '2026-07-18', status: '有效' },
]

// ============ 专利数据 ============
const PATENT_OVERVIEW = {
  total: 46,
  invention: 32,
  utility: 8,
  design: 6,
  byYear: [
    { y: '2018', v: 3 }, { y: '2019', v: 4 }, { y: '2020', v: 5 },
    { y: '2021', v: 6 }, { y: '2022', v: 7 }, { y: '2023', v: 9 },
    { y: '2024', v: 8 }, { y: '2025', v: 4 },
  ],
}
const PATENTS = [
  { name: '一种基于深度学习的内容推荐方法及系统', no: 'CN202310123456.7', type: '发明', status: '已授权', date: '2023-04-18', value: '¥120万', industry: '互联网信息服务' },
  { name: '云游戏渲染资源调度方法及装置', no: 'CN202210987654.3', type: '发明', status: '已授权', date: '2022-09-15', value: '¥85万', industry: '云游戏' },
  { name: '基于区块链的数字版权保护方法', no: 'CN202311234567.8', type: '发明', status: '实质审查', date: '2023-08-22', value: '—', industry: '区块链' },
  { name: '智能客服的多轮对话管理方法', no: 'CN202210456789.1', type: '发明', status: '已授权', date: '2022-05-12', value: '¥60万', industry: '人工智能' },
  { name: '教育内容自适应推送方法及系统', no: 'CN202410012345.6', type: '发明', status: '已授权', date: '2024-01-09', value: '¥95万', industry: '在线教育' },
  { name: '音乐版权识别与比对方法', no: 'CN202310456789.0', type: '发明', status: '已授权', date: '2023-06-08', value: '¥70万', industry: '音乐版权' },
  { name: '一种服务器集群负载均衡方法', no: 'CN202110234567.2', type: '发明', status: '已授权', date: '2021-03-18', value: '¥45万', industry: '云计算' },
  { name: '基于AI的新闻摘要生成方法', no: 'CN202310789012.4', type: '发明', status: '实质审查', date: '2023-11-22', value: '—', industry: 'AI' },
]
const PATENT_RELATED = [
  { company: '网易(杭州)网络有限公司', risk: '低', patent: 312, group: '网易集团' },
  { company: '网易传媒(北京)有限公司', risk: '低', patent: 156, group: '网易集团' },
  { company: '网易有道信息技术(北京)有限公司', risk: '极低', patent: 89, group: '网易集团' },
  { company: '杭州网易严选贸易有限公司', risk: '低', patent: 67, group: '网易集团' },
  { company: '网易音乐(杭州)有限公司', risk: '低', patent: 45, group: '网易集团' },
  { company: '北京网易传媒有限公司', risk: '极低', patent: 28, group: '网易集团' },
  { company: '浙江网易数问智能科技有限公司', risk: '中', patent: 22, group: '网易集团' },
]

// ============ 关联企业风险数据 ============
const RELATED_RISK_LIST = [
  { company: '浙江某网络科技公司', industry: '互联网信息服务', risk: '高', score: 84, tag: '裁判文书 3', region: '浙江', date: '2026-07-12' },
  { company: '杭州某娱乐有限公司', industry: '文化娱乐', risk: '高', score: 78, tag: '被执行人 1', region: '浙江', date: '2026-06-25' },
  { company: '上海某信息技术公司', industry: '软件开发', risk: '中', score: 65, tag: '裁判文书 1', region: '上海', date: '2026-05-18' },
  { company: '深圳某电子商务公司', industry: '电商', risk: '中', score: 60, tag: '失信被执行人 1', region: '广东', date: '2026-04-30' },
  { company: '北京某教育科技公司', industry: '教育', risk: '低', score: 42, tag: '裁判文书 1', region: '北京', date: '2026-03-15' },
  { company: '广州某贸易有限公司', industry: '零售', risk: '中', score: 58, tag: '被执行人 1', region: '广东', date: '2026-02-28' },
  { company: '成都某科技有限公司', industry: '软件开发', risk: '低', score: 38, tag: '裁判文书 2', region: '四川', date: '2026-01-20' },
  { company: '武汉某网络科技公司', industry: '互联网信息服务', risk: '高', score: 82, tag: '失信被执行人 2', region: '湖北', date: '2025-12-15' },
]

// ============ 通用工具组件（与 DmEntArchiveBasic 完全一致的视觉语言） ============
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

function Pagination({ total, pageSize = 5 }: { total: number; pageSize?: number }) {
  const [page, setPage] = useState(1)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const [jump, setJump] = useState('')
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, marginTop: 14, fontSize: 13, color: '#666', flexWrap: 'wrap' }}>
      <span>共 {total} 条</span>
      <span>每页 {pageSize} 条</span>
      <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))} style={{ padding: '4px 10px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', color: page <= 1 ? '#ccc' : '#333' }}>上一页</button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
        <button key={p} onClick={() => setPage(p)} style={{ padding: '4px 10px', border: p === page ? '1px solid #165dff' : '1px solid #d9d9d9', borderRadius: 4, background: p === page ? '#eaf2ff' : '#fff', color: p === page ? '#165dff' : '#333', cursor: 'pointer', minWidth: 32 }}>{p}</button>
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
      <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{headers.map((h, i) => <th key={i} style={thStyle(i === 0 ? { width: 56 } : undefined)}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table></div>
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

// ============ 模块1：合作伙伴 ============
function M1Partner() {
  return (
    <div style={{ marginBottom: 40 }} id="section-partner">
      <ModuleTitle title="合作伙伴" count="11" />
      <FilterBar>
        <SearchInput placeholder="搜索合作伙伴" />
        <Select placeholder="合作类型" />
        <Select placeholder="合作开始时间" />
      </FilterBar>
      <TableShell headers={['序号', '合作伙伴', '类别', '关联企业/职务', '标签', '持股比例', '职位', '合作开始日期']}>
        {PARTNERS.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.type}</td>
            <td style={tdStyle()}>{r.role}</td>
            <td style={tdStyle()}><span style={{ padding: '2px 8px', background: '#f0f5ff', color: '#0066cc', borderRadius: 4, fontSize: 12 }}>{r.tag}</span></td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.post}</td>
            <td style={tdStyle()}>{r.date}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={11} />
    </div>
  )
}

// ============ 模块2：担任法定代表人的企业 ============
function M2LegalRep() {
  return (
    <div style={{ marginBottom: 40 }} id="section-legal-rep">
      <ModuleTitle title="担任法定代表人的企业" count="21" />
      <FilterBar>
        <SearchInput placeholder="搜索企业" />
        <Select placeholder="登记状态" />
        <Select placeholder="所属行业" />
        <Select placeholder="所属地区" />
      </FilterBar>
      <TableShell headers={['序号', '企业名称', '状态', '注册资本', '持股比例', '成立日期', '所属行业', '所属地区']}>
        {LEGAL_REP_COMPANIES.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}><span style={{ color: '#00b42a' }}>{r.status}</span></td>
            <td style={tdStyle()}>{r.capital}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.industry}</td>
            <td style={tdStyle()}>{r.region}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={21} />
    </div>
  )
}

// ============ 模块3：担任股东的企业 ============
function M3Shareholder() {
  const [sub, setSub] = useState('现股东25')
  return (
    <div style={{ marginBottom: 40 }} id="section-shareholder">
      <ModuleTitle title="担任股东的企业" subTabs={['现股东25', '历史股东3']} activeSub={sub} onSub={setSub} count="25" />
      <FilterBar>
        <Select placeholder="持股比例" />
        <Select placeholder="企业类型" />
        <Select placeholder="投资日期" />
      </FilterBar>
      <TableShell headers={['序号', '企业名称', '企业类型', '持股比例', '注册资本', '任职类型', '起始日期']}>
        {SHAREHOLDER_COMPANIES.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.type}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.capital}</td>
            <td style={tdStyle()}>{r.role}</td>
            <td style={tdStyle()}>{r.date}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={25} />
    </div>
  )
}

// ============ 模块4：担任高管的企业 ============
function M4Executive() {
  return (
    <div style={{ marginBottom: 40 }} id="section-executive">
      <ModuleTitle title="担任高管的企业" count="16" />
      <FilterBar>
        <SearchInput placeholder="搜索企业" />
        <Select placeholder="职位类型" />
        <Select placeholder="持股比例" />
        <Select placeholder="所属行业" />
        <Select placeholder="所属地区" />
      </FilterBar>
      <TableShell headers={['序号', '企业名称', '职位', '持股比例', '薪酬', '成立日期', '所属行业', '所属地区']}>
        {EXEC_COMPANIES.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.post}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.salary}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.industry}</td>
            <td style={tdStyle()}>{r.region}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={16} />
    </div>
  )
}

// ============ 模块5：持股企业 ============
function M5Holding() {
  const [sub, setSub] = useState('直接持股')
  return (
    <div style={{ marginBottom: 40 }} id="section-holding">
      <ModuleTitle title="持股企业" subTabs={['直接持股 178', '间接持股 102', '合计 280']} activeSub={sub} onSub={setSub} count="280" />
      <FilterBar>
        <SearchInput placeholder="搜索企业" />
        <Select placeholder="持股比例" />
        <Select placeholder="所属行业" />
      </FilterBar>
      <TableShell headers={['序号', '企业名称', '持股比例', '持股层级', '注册资本', '所属行业', '起始日期']}>
        {HOLDING_COMPANIES.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.level}</td>
            <td style={tdStyle()}>{r.capital}</td>
            <td style={tdStyle()}>{r.industry}</td>
            <td style={tdStyle()}>{r.date}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={280} />
    </div>
  )
}

function BasicModules() {
  return (
    <>
      <M1Partner />
      <M2LegalRep />
      <M3Shareholder />
      <M4Executive />
      <M5Holding />
    </>
  )
}

// ============ 风险信息 Tab 模块（5 个） ============
function RiskEmptyBlock({ id, title, count, desc }: { id: string; title: string; count?: string; desc: string }) {
  return (
    <div id={`section-${id}`} style={{ marginBottom: 40, scrollMarginTop: 140 }}>
      <ModuleTitle title={title} count={count} />
      <div style={{ minHeight: 200, border: '1px dashed #c9cdd4', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86909c', fontSize: 14, background: '#fafbfc' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>✓</div>
        <div>{desc}</div>
        <div style={{ fontSize: 12, color: '#c9cdd4', marginTop: 6 }}>暂未发现相关风险记录</div>
      </div>
    </div>
  )
}

function RiskPledgeModule() {
  return (
    <div style={{ marginBottom: 40 }} id="section-equity-pledge">
      <ModuleTitle title="股权出质" count="13" right={
        <div style={{ display: 'flex', gap: 8 }}>
          <Select placeholder="出质状态" />
          <Select placeholder="出质人类型" />
          <Select placeholder="质权人类型" />
          <DownloadBtn />
        </div>
      } />
      <FilterBar>
        <SearchInput placeholder="搜索质权人/企业名称" />
        <Select placeholder="出质日期" />
      </FilterBar>
      <TableShell headers={['序号', '出质人', '质权人', '出质股权所在企业', '出质股权数额/比例', '出质金额', '出质日期', '状态']}>
        {EQUITY_PLEDGES.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.pledgor}</BlueLink></td>
            <td style={tdStyle()}>{r.pledgee}</td>
            <td style={tdStyle()}><BlueLink>{r.equity}</BlueLink></td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.amount}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}><span style={{ color: '#00b42a' }}>{r.status}</span></td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={13} />
    </div>
  )
}

function RiskModules() {
  return (
    <>
      <RiskEmptyBlock id="dishonest" title="失信被执行人" desc="当前数据中无失信被执行记录" />
      <RiskEmptyBlock id="executed" title="被执行人" desc="当前数据中无被执行人记录" />
      <RiskEmptyBlock id="high-consume" title="限制高消费" desc="当前数据中无限制高消费记录" />
      <RiskEmptyBlock id="equity-freeze" title="股权冻结" desc="当前数据中无股权冻结记录" />
      <RiskPledgeModule />
    </>
  )
}

// ============ 专利信息 Tab 模块 ============
function PatentOverview() {
  const maxV = Math.max(...PATENT_OVERVIEW.byYear.map(p => p.v))
  return (
    <div style={{ marginBottom: 40 }} id="section-patent-overview">
      <ModuleTitle title="专利信息概览" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { k: '专利总数', v: PATENT_OVERVIEW.total, color: '#165dff' },
          { k: '发明专利', v: PATENT_OVERVIEW.invention, color: '#00b42a' },
          { k: '实用新型', v: PATENT_OVERVIEW.utility, color: '#ff7d00' },
          { k: '外观设计', v: PATENT_OVERVIEW.design, color: '#9c27b0' },
        ].map(s => (
          <div key={s.k} style={{ border: '1px solid #e5e6eb', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#86909c', marginBottom: 6 }}>{s.k}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: s.color }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="专利申请年度分布">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, height: 150, padding: '8px 4px 0' }}>
            {PATENT_OVERVIEW.byYear.map(p => (
              <div key={p.y} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#666', marginBottom: 4 }}>{p.v}</div>
                <div style={{ width: '100%', background: 'linear-gradient(180deg,#4080ff,#165dff)', borderRadius: '4px 4px 0 0', height: `${(p.v / maxV) * 110}px` }} />
                <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>{p.y}</div>
              </div>
            ))}
          </div>
        </ChartCard>
        <ChartCard title="专利类型分布">
          <svg width="100%" height="150" viewBox="0 0 240 150">
            <circle cx="80" cy="75" r="50" fill="none" stroke="#165dff" strokeWidth="22" strokeDasharray="220 314" />
            <circle cx="80" cy="75" r="50" fill="none" stroke="#00b42a" strokeWidth="22" strokeDasharray="60 314" strokeDashoffset="-220" />
            <circle cx="80" cy="75" r="50" fill="none" stroke="#ff7d00" strokeWidth="22" strokeDasharray="40 314" strokeDashoffset="-280" />
            <text x="80" y="80" textAnchor="middle" fontSize="13" fontWeight="700" fill="#333">{PATENT_OVERVIEW.total}</text>
          </svg>
          <Legend items={[['发明', '#165dff'], ['实用新型', '#00b42a'], ['外观设计', '#ff7d00']]} />
        </ChartCard>
      </div>
    </div>
  )
}

function PatentList() {
  return (
    <div style={{ marginBottom: 40 }} id="section-patent-list">
      <ModuleTitle title="专利信息" count="46" right={
        <div style={{ display: 'flex', gap: 8 }}>
          <SearchInput placeholder="搜索专利名称" />
          <Select placeholder="专利类型" />
          <Select placeholder="法律状态" />
          <DownloadBtn />
        </div>
      } />
      <TableShell headers={['序号', '专利名称', '申请号/专利号', '专利类型', '法律状态', '申请日期', '价值评估', '所属行业']}>
        {PATENTS.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.no}</td>
            <td style={tdStyle()}>{r.type}</td>
            <td style={tdStyle()}><span style={{ padding: '2px 6px', background: r.status === '已授权' ? '#d3f3d3' : '#fff3e6', color: r.status === '已授权' ? '#00b42a' : '#ff7d00', borderRadius: 3, fontSize: 11 }}>{r.status}</span></td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.value}</td>
            <td style={tdStyle()}>{r.industry}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={46} />
    </div>
  )
}

function PatentRelatedModule() {
  return (
    <div style={{ marginBottom: 40 }} id="section-patent-related">
      <ModuleTitle title="关联企业风险" count="68" />
      <FilterBar>
        <Select placeholder="风险等级" />
        <Select placeholder="行业" />
        <Select placeholder="所属集团" />
      </FilterBar>
      <TableShell headers={['序号', '关联企业', '所属行业', '风险等级', '风险评分', '风险标签', '所属集团']}>
        {PATENT_RELATED.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.company}</BlueLink></td>
            <td style={tdStyle()}>{r.industry}</td>
            <td style={tdStyle()}><span style={{ padding: '2px 8px', borderRadius: 3, background: r.risk === '高' ? '#ffe7e7' : r.risk === '中' ? '#fff7e6' : '#e7f7e7', color: r.risk === '高' ? '#f53f3f' : r.risk === '中' ? '#ff7d00' : '#00b42a', fontSize: 12, fontWeight: 500 }}>{r.risk}</span></td>
            <td style={tdStyle()}>{r.score}</td>
            <td style={tdStyle()}>{r.tag}</td>
            <td style={tdStyle()}>{r.group}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={68} />
    </div>
  )
}

function PatentModules() {
  return (
    <>
      <PatentOverview />
      <PatentList />
      <PatentRelatedModule />
    </>
  )
}

// ============ 关联企业风险 Tab 模块 ============
function RelatedRiskOverview() {
  return (
    <div style={{ marginBottom: 40 }} id="section-related-overview">
      <ModuleTitle title="关联企业风险概览" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 16 }}>
        {[
          { k: '关联风险总数', v: '637' },
          { k: '关联企业数', v: '68' },
          { k: '高风险企业', v: '8' },
          { k: '中风险企业', v: '23' },
        ].map(s => (
          <div key={s.k} style={{ border: '1px solid #e5e6eb', borderRadius: 8, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#86909c', marginBottom: 6 }}>{s.k}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: '#f53f3f' }}>{s.v}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <ChartCard title="风险等级分布">
          <BarH data={[['高风险', 8], ['中风险', 23], ['低风险', 32], ['极低风险', 5]]} />
        </ChartCard>
        <ChartCard title="风险类型分布">
          <BarH data={[['裁判文书', 28], ['被执行人', 16], ['失信被执行人', 9], ['股权出质', 22], ['其他', 12]]} />
        </ChartCard>
      </div>
    </div>
  )
}

function RelatedRiskList() {
  return (
    <div style={{ marginBottom: 40 }} id="section-related-list">
      <ModuleTitle title="关联企业风险列表" count="68" right={
        <div style={{ display: 'flex', gap: 8 }}>
          <SearchInput placeholder="搜索企业" />
          <Select placeholder="风险等级" />
          <Select placeholder="所属行业" />
          <Select placeholder="所属地区" />
          <DownloadBtn />
        </div>
      } />
      <TableShell headers={['序号', '企业名称', '所属行业', '风险等级', '风险评分', '风险标签', '所属地区', '最近事件日期']}>
        {RELATED_RISK_LIST.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.company}</BlueLink></td>
            <td style={tdStyle()}>{r.industry}</td>
            <td style={tdStyle()}><span style={{ padding: '2px 8px', borderRadius: 3, background: r.risk === '高' ? '#ffe7e7' : r.risk === '中' ? '#fff7e6' : '#e7f7e7', color: r.risk === '高' ? '#f53f3f' : r.risk === '中' ? '#ff7d00' : '#00b42a', fontSize: 12, fontWeight: 500 }}>{r.risk}</span></td>
            <td style={tdStyle()}>{r.score}</td>
            <td style={tdStyle()}>{r.tag}</td>
            <td style={tdStyle()}>{r.region}</td>
            <td style={tdStyle()}>{r.date}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={68} />
    </div>
  )
}

function RelatedRiskModules() {
  return (
    <>
      <RelatedRiskOverview />
      <RelatedRiskList />
    </>
  )
}

// ============ 个人图谱（交互式横向树状关系图） ============
const PERSON_GRAPH_SEED = {
  subject: '王传福',
  queryTime: '2026-08-20 10:24:08',
  relations: [] as any[],
}

function PersonGraphPlaceholder({ name }: { name?: string }) {
  const [data, , ] = useSample('personGraph.json', PERSON_GRAPH_SEED)
  const graph = { ...data, subject: name || data.subject }
  return (
    <div id="section-person-graph" style={{ marginBottom: 40, scrollMarginTop: 140 }}>
      <PersonGraph data={graph as any} />
    </div>
  )
}

// ============ 历史信息 Tab 模块 ============
function HistoryPartner() {
  return (
    <div style={{ marginBottom: 40 }} id="section-history-partner">
      <ModuleTitle title="历史合作伙伴" count="9" />
      <TableShell headers={['序号', '合作伙伴', '关联职务', '标签', '合作开始日期']}>
        {HISTORY_PARTNERS.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.role}</td>
            <td style={tdStyle()}><span style={{ padding: '2px 8px', background: '#f5f5f5', color: '#666', borderRadius: 4, fontSize: 12 }}>{r.tag}</span></td>
            <td style={tdStyle()}>{r.date}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={9} />
    </div>
  )
}

function HistoryLegal() {
  return (
    <div style={{ marginBottom: 40 }} id="section-history-legal">
      <ModuleTitle title="历史法定代表人的企业" count="11" />
      <TableShell headers={['序号', '企业名称', '注销状态', '注销时间', '注销原因']}>
        {HISTORY_LEGAL.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}><span style={{ color: '#999' }}>{r.status}</span></td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.reason}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={11} />
    </div>
  )
}

function HistoryShareholder() {
  return (
    <div style={{ marginBottom: 40 }} id="section-history-shareholder">
      <ModuleTitle title="历史股东的企业" count="3" />
      <TableShell headers={['序号', '企业名称', '历史持股比例', '退出/减持日期', '变更类型']}>
        {HISTORY_SHAREHOLDER.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}>{r.type}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={3} />
    </div>
  )
}

function HistoryExecutive() {
  return (
    <div style={{ marginBottom: 40 }} id="section-history-executive">
      <ModuleTitle title="历史高管的企业" count="17" />
      <TableShell headers={['序号', '企业名称', '历史职位', '任职起止日期']}>
        {HISTORY_EXEC.map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}><BlueLink>{r.name}</BlueLink></td>
            <td style={tdStyle()}>{r.post}</td>
            <td style={tdStyle()}>{r.date}</td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={17} />
    </div>
  )
}

function HistoryRiskEmpty({ id, title }: { id: string; title: string }) {
  return (
    <div id={`section-${id}`} style={{ marginBottom: 40, scrollMarginTop: 140 }}>
      <ModuleTitle title={`历史${title}`} />
      <div style={{ minHeight: 160, border: '1px dashed #c9cdd4', borderRadius: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#86909c', fontSize: 14, background: '#fafbfc' }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>✓</div>
        <div>历史数据中无相关{title}记录</div>
      </div>
    </div>
  )
}

function HistoryEquityPledge() {
  return (
    <div style={{ marginBottom: 40 }} id="section-history-pledge">
      <ModuleTitle title="历史股权出质" count="9" />
      <TableShell headers={['序号', '质权人', '出质股权所在企业', '出质股权数额/比例', '出质金额', '出质日期', '当前状态']}>
        {EQUITY_PLEDGES.slice(0, 9).map((r, i) => (
          <tr key={i}>
            <td style={tdStyle({ width: 56 })}>{i + 1}</td>
            <td style={tdStyle()}>{r.pledgee}</td>
            <td style={tdStyle()}>{r.equity}</td>
            <td style={tdStyle()}>{r.ratio}</td>
            <td style={tdStyle()}>{r.amount}</td>
            <td style={tdStyle()}>{r.date}</td>
            <td style={tdStyle()}><span style={{ color: '#999' }}>已解除</span></td>
          </tr>
        ))}
      </TableShell>
      <Pagination total={9} />
    </div>
  )
}

function HistoryModules() {
  return (
    <>
      <HistoryPartner />
      <HistoryLegal />
      <HistoryShareholder />
      <HistoryExecutive />
      <HistoryRiskEmpty id="history-dishonest" title="失信被执行人" />
      <HistoryRiskEmpty id="history-executed" title="被执行人" />
      <HistoryRiskEmpty id="history-high-consume" title="限制高消费" />
      <HistoryRiskEmpty id="history-freeze" title="股权冻结" />
      <HistoryEquityPledge />
    </>
  )
}

// ============ 占位子项（无内容的子 Tab） ============
function PlaceholderBlock({ child }: { child: { key: string; label: string; count?: string; history?: boolean; warn?: boolean } }) {
  return (
    <div id={`section-${child.key}`} style={{ marginBottom: 40, scrollMarginTop: 140 }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, color: '#1d2129', margin: '0 0 20px 0', paddingBottom: 12, borderBottom: '1px solid #f2f3f5', display: 'flex', alignItems: 'center', gap: 8 }}>
        {child.warn && <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f53f3f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>}
        {child.label}
        {child.history && <span style={{ fontSize: 12, color: '#86909c', fontWeight: 400 }}>历史&gt;</span>}
        {child.count && <span style={{ fontSize: 14, color: '#f53f3f', fontWeight: 400 }}>{child.count}</span>}
      </h3>
      <div style={{ border: '1px solid #e5e6eb', borderRadius: 8, overflow: 'hidden' }}>
        <div className="overflow-x-auto"><table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr>
              <td style={{ padding: '60px 16px', textAlign: 'center', color: '#86909c', fontSize: 14 }}>
                📊 暂无数据，待后续补充
              </td>
            </tr>
          </tbody>
        </table></div>
      </div>
    </div>
  )
}

// ============ 主组件：个人档案 basic ============
export default function DmPersonArchiveBasic() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const personName = params.get('name') || '丁磊'

  const [activeTab, setActiveTab] = useState('basic')
  const [activeSubTab, setActiveSubTab] = useState('partner')
  const [introExpanded, setIntroExpanded] = useState(false)

  // 多列菜单面板：默认收起，鼠标悬停展开（与 DmEntArchiveBasic 完全一致的交互）
  const [hoveredTab, setHoveredTab] = useState<string | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const openPanel = (key: string) => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => { setHoveredTab(key); setPanelOpen(true) }, 120)
  }
  const closePanel = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = setTimeout(() => { setHoveredTab(null); setPanelOpen(false) }, 180)
  }

  const handleTabClick = (mainKey: string) => {
    const tab = TABS.find(t => t.key === mainKey)
    setActiveTab(mainKey)
    if (tab && tab.children.length > 0) {
      setActiveSubTab(tab.children[0].key)
      setTimeout(() => {
        const el = document.getElementById(`section-${tab.children[0].key}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 80)
    } else {
      setActiveSubTab('')
    }
  }

  const handleSubClick = (mainKey: string, subKey: string) => {
    setActiveTab(mainKey); setActiveSubTab(subKey)
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setHoveredTab(null); setPanelOpen(false)
    setTimeout(() => {
      const el = document.getElementById(`section-${subKey}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  // 滚动监听：自动激活当前可视的子模块
  useEffect(() => {
    const onScroll = () => {
      const currentTab = TABS.find(t => t.key === activeTab)
      if (!currentTab) return
      for (let i = currentTab.children.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${currentTab.children[i].key}`)
        if (el && el.getBoundingClientRect().top <= 140) {
          setActiveSubTab(currentTab.children[i].key)
          break
        }
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [activeTab])

  // 渲染对应 Tab 内容
  const renderContent = () => {
    const tab = TABS.find(t => t.key === activeTab)
    if (!tab) return null
    // 已有专门模块的主 Tab：直接渲染特定模块组（覆盖整个 Tab 内容区）
    if (activeTab === 'basic') return <BasicModules />
    if (activeTab === 'risk') return <RiskModules />
    if (activeTab === 'patent') return <PatentModules />
    if (activeTab === 'related-risk') return <RelatedRiskModules />
    if (activeTab === 'graph') return <PersonGraphPlaceholder />
    if (activeTab === 'history') return <HistoryModules />
    // 兜底：渲染该 Tab 的子项（每个子项独立 section 模块）
    return (
      <>
        {tab.children.length === 0 ? (
          <div style={{ padding: '80px 0', textAlign: 'center', color: '#86909c', fontSize: 14 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🧩</div>
            自定义页模块建设中，后续可在此添加自定义数据模块
          </div>
        ) : tab.children.map(child => <PlaceholderBlock key={child.key} child={child} />)}
      </>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 48px)', background: '#f5f7fa', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif' }}>
      <div style={{ width: '100%', minWidth: 0, padding: '20px 32px 40px' }}>
        {/* 返回 */}
        <div style={{ marginBottom: 16 }}>
          <button onClick={() => nav(-1)} style={{ background: 'none', border: 'none', color: '#4e5969', fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>返回
          </button>
        </div>

        {/* ============ 个人摘要卡片 ============ */}
        <div style={{ background: '#fff', borderRadius: 12, padding: '20px 24px 22px', marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {/* 一、顶部操作区 */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 16 }}>
            <button style={{ padding: '6px 14px', borderRadius: 4, background: '#fff', border: '1px solid #d9d9d9', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>开始营销<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            <button style={{ padding: '6px 14px', borderRadius: 4, background: '#fff', border: '1px solid #d9d9d9', color: '#333', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>+ 添加至<svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></button>
            <button style={{ padding: '6px 16px', borderRadius: 4, background: '#ff9900', border: 'none', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>下载报告</button>
          </div>
          {/* 二、标题栏：头像 + 姓名 + 状态 + 标签 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#ff9a6c,#ff6a88)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 22, fontWeight: 700, flexShrink: 0, boxShadow: '0 2px 8px rgba(255,106,136,.25)' }}>丁磊</div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#333', margin: 0 }}>{personName}</h1>
            <span style={{ padding: '2px 10px', borderRadius: 4, background: '#87d068', color: '#fff', fontSize: 12 }}>优秀</span>
          </div>
          {/* 三、标签&关联集团栏 */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '6px 16px', marginBottom: 14 }}>
            {PERSON_TAGS.map((tag, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {tag.link ? <a style={{ color: '#0066cc', fontSize: 13, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 2 }}>
                  {tag.text} <svg width="10" height="10" viewBox="0 0 24 24" fill="#0066cc"><path d="M8 5v14l11-7z"/></svg>
                </a> : <span style={{ color: '#666', fontSize: 13 }}>{tag.text}</span>}
                {tag.dropdown && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#0066cc' }}><polyline points="6 9 12 15 18 9"></polyline></svg>}
              </span>
            ))}
          </div>
          {/* 四、风险统计栏 */}
          <div style={{ background: '#fff7f5', border: '1px solid #ffe2dc', borderRadius: 8, padding: '12px 18px', marginBottom: 16, fontSize: 13 }}>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '2px 8px', borderRadius: 4, background: '#ff9900', color: '#fff', fontSize: 12, fontWeight: 600 }}>启信风险</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#ff9900' }}>{RISK_ROW[0].value}</span>
              </span>
              {RISK_ROW.slice(1).map(r => (
                <span key={r.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#666' }}>{r.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: r.warn && r.value === 0 ? '#00b42a' : '#f53f3f' }}>{r.value}</span>
                </span>
              ))}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginTop: 10, paddingTop: 10, borderTop: '1px dashed #ffd6c8' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ padding: '2px 8px', borderRadius: 4, background: '#f53f3f', color: '#fff', fontSize: 12, fontWeight: 600 }}>关联风险</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#f53f3f' }}>{REL_RISK_ROW[0].value}</span>
              </span>
              {REL_RISK_ROW.slice(1).map(r => (
                <span key={r.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: '#666' }}>{r.label}</span>
                  <span style={{ fontSize: 16, fontWeight: 600, color: '#f53f3f' }}>{r.value}</span>
                </span>
              ))}
            </div>
          </div>
          {/* 五、核心工商信息区 */}
          <div style={{ borderTop: '1px solid #f0f0f0' }}>
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
          {/* 六、个人简介 */}
          <div style={{ padding: '14px 0', borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ fontSize: 13, lineHeight: 1.9, color: '#333' }}>
              <span style={{ color: '#666' }}>个人简介：</span>
              <span style={{ display: '-webkit-box', WebkitLineClamp: introExpanded ? ('unset' as any) : 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{PERSON_INTRO}</span>
              <a style={{ color: '#0066cc', fontSize: 12, cursor: 'pointer', marginLeft: 8 }} onClick={() => setIntroExpanded(!introExpanded)}>{introExpanded ? '收起' : '展开'}</a>
              <a style={{ color: '#0066cc', fontSize: 12, cursor: 'pointer', marginLeft: 8 }}>复制</a>
            </div>
          </div>
          {/* 七、底部快捷卡片 */}
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

        {/* ============ Tab 导航（默认收起；悬停展开多列菜单面板；列内全展开 / 顶部对齐） ============ */}
        <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>
          <style>{`.per-tabs::-webkit-scrollbar{height:0;width:0}`}</style>
          {/* relative 包裹：Tab 栏常驻 + 悬停下拉面板 */}
          <div style={{ position: 'relative' }} onMouseLeave={closePanel}>
            {/* 顶层 Tab 栏：始终可见 */}
            <div className="per-tabs" style={{ display: 'flex', padding: '0 16px', gap: 0, overflowX: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', borderRadius: panelOpen ? '12px 12px 0 0' : '12px' }}>
              {TABS.map(tab => {
                const isActive = activeTab === tab.key
                const panelActive = panelOpen && hoveredTab === tab.key
                return (
                  <button
                    key={tab.key}
                    onMouseEnter={() => openPanel(tab.key)}
                    onClick={() => handleTabClick(tab.key)}
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
            {/* 悬停展开的多列菜单面板 */}
            {panelOpen && hoveredTab && (
              <div
                onMouseEnter={() => openPanel(hoveredTab)}
                style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: -1, background: '#fff', boxShadow: '0 12px 32px rgba(0,0,0,0.14)', borderRadius: '0 0 12px 12px', padding: '16px 0', zIndex: 101 }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', width: '100%', minWidth: 0, overflowX: 'auto' }}>
                  {TABS.map((tab, idx) => {
                    const isHoverCol = hoveredTab === tab.key
                    const isLast = idx === TABS.length - 1
                    return (
                      <div key={tab.key} onMouseEnter={() => openPanel(tab.key)} style={{ flex: '0 0 auto', minWidth: 140, maxWidth: 220, padding: '0 16px', borderRight: isLast ? 'none' : '1px solid #f2f3f5', background: isHoverCol ? '#fafbff' : '#fff', transition: 'background 0.15s' }}>
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
                        <div style={{ padding: '8px 4px' }}>
                          {tab.children.length === 0 && (
                            <div style={{ padding: '10px 0', fontSize: 13, color: '#4e5969' }}>关系图谱可视化，点击上方进入查看</div>
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
                                  borderRadius: 4, transition: 'background 0.15s'
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

        {/* ============ Tab 内容区 ============ */}
        <div style={{ background: '#fff', borderRadius: '0 0 12px 12px', padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
