// 尽调中心 · 批量尽调结果页（jd-batch-result）· 查企业 / 查人员 Tab
// 数据：本地样例 jdBatchResult.json（橘 Sam）
import { useEffect, useState } from 'react'
import { EpPage, EpCard, EpBtn, DataTable, useSample, Sam } from '../../epCommon'
import { Modal } from '../../../../components/ui'
import { usePageNav } from '../../../pageNav'

type TreeItem = { key: string; label: string; checked: boolean }
type FilterGroup = {
  key: string
  title: string
  options: string[]
  dropdowns?: boolean
}
type Data = {
  pageTitle: string
  tabs: { key: string; label: string }[]
  activeTab: string
  left: {
    tabs: string[]
    active: string
    searchPlaceholder: string
    selectAll: string
    total: number
    settings: string
    saveTemplate: string
    tree: TreeItem[]
    collapse: string
  }
  filters: {
    title: string
    common: { title: string; items: { label: string; type: string }[] }
    groups: FilterGroup[]
    collapse: string
  }
  toolbar: {
    selectedText: string
    delete: string
    edit: string
    portrait: string
    market: string
    distribute: string
    addToCustomer: string
    exportAll: string
    exportCount: number
  }
  table: {
    columns: { key: string; label: string }[]
    rows: Record<string, string | number>[]
  }
  footer: { selectedIndicator: string; selectedEnterprise: string; fullscreen: string }
  uploadModal: {
    title: string
    steps: string[]
    step1: { title: string; desc: string }
    step2: { title: string; desc: string }
    step3: { title: string; desc: string }
    downloadTemplate: string
    uploadFile: string
    start: string
    next: string
    prev: string
  }
}

// 查企业：编造模拟尽调结果数据（样例，贴合真实业务语义）
const BATCH_ENT_ROWS: Record<string, string | number>[] = [
  { seq: 1, name: '广州博鳌纵横网络科技有限公司', regCapital: '5651.14万', paidCapital: '5651.14万', orgType: '其他有限责任公司', status: '存续', insuredCount: '43', industry1: '软件和信息技术服务业', industry2: '互联网信息服务', province: '广东', city: '广州', district: '黄埔区', establishDate: '2012-04-11', capitalBackground: '民营企业', scale: '中型', techCert: '高新技术企业', listing: '未上市', park: '广州科学城', group: '博鳌系', emergingIndustry: '数字创意', qixinScore: '362', shellIndex: '21', contractDefault: '低', techScore: '78', judicialDocs: '3', executed: '0', dishonest: '0', equityFreeze: '1', consumptionLimit: '1', finalCases: '2', abnormal: '0', seriousIllegal: '0', adminPenalty: '1', envPenalty: '0', equityPledge: '0', taxIllegal: '0', abnormalTax: '0', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '42', trademarks: '42', copyrights: '120', softwareCopyrights: '210' },
  { seq: 2, name: '深圳前海微众银行股份有限公司', regCapital: '300000万', paidCapital: '300000万', orgType: '股份有限公司', status: '存续', insuredCount: '2860', industry1: '货币金融服务', industry2: '银行', province: '广东', city: '深圳', district: '前海', establishDate: '2014-12-16', capitalBackground: '民间资本', scale: '大型', techCert: '高新技术企业', listing: '未上市', park: '前海深港合作区', group: '微众系', emergingIndustry: '金融科技', qixinScore: '891', shellIndex: '8', contractDefault: '低', techScore: '92', judicialDocs: '6', executed: '0', dishonest: '0', equityFreeze: '0', consumptionLimit: '0', finalCases: '0', abnormal: '0', seriousIllegal: '0', adminPenalty: '0', envPenalty: '0', equityPledge: '0', taxIllegal: '0', abnormalTax: '0', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '88', trademarks: '56', copyrights: '30', softwareCopyrights: '320' },
  { seq: 3, name: '杭州蚂蚁智信信息技术有限公司', regCapital: '5000万', paidCapital: '5000万', orgType: '有限责任公司', status: '存续', insuredCount: '652', industry1: '软件和信息技术服务业', industry2: '金融科技', province: '浙江', city: '杭州', district: '西湖区', establishDate: '2015-06-19', capitalBackground: '民营控股', scale: '中型', techCert: '高新技术企业', listing: '未上市', park: '杭州未来科技城', group: '蚂蚁系', emergingIndustry: '金融科技', qixinScore: '876', shellIndex: '12', contractDefault: '低', techScore: '90', judicialDocs: '11', executed: '0', dishonest: '0', equityFreeze: '0', consumptionLimit: '0', finalCases: '0', abnormal: '0', seriousIllegal: '0', adminPenalty: '1', envPenalty: '0', equityPledge: '0', taxIllegal: '0', abnormalTax: '0', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '60', trademarks: '48', copyrights: '40', softwareCopyrights: '280' },
  { seq: 4, name: '苏泊尔集团有限公司', regCapital: '10000万', paidCapital: '10000万', orgType: '有限责任公司', status: '存续', insuredCount: '3200', industry1: '电气机械和器材制造业', industry2: '小家电', province: '浙江', city: '杭州', district: '滨江区', establishDate: '1994-08-25', capitalBackground: '民营控股', scale: '大型', techCert: '高新技术企业', listing: 'A股上市', park: '滨江高新产业园', group: '苏泊尔系', emergingIndustry: '智能制造', qixinScore: '812', shellIndex: '15', contractDefault: '低', techScore: '74', judicialDocs: '4', executed: '0', dishonest: '0', equityFreeze: '0', consumptionLimit: '0', finalCases: '0', abnormal: '0', seriousIllegal: '0', adminPenalty: '0', envPenalty: '1', equityPledge: '0', taxIllegal: '0', abnormalTax: '0', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '320', trademarks: '120', copyrights: '0', softwareCopyrights: '0' },
  { seq: 5, name: '北京字节跳动科技有限公司', regCapital: '10000万', paidCapital: '10000万', orgType: '其他有限责任公司', status: '存续', insuredCount: '38000', industry1: '互联网和相关服务', industry2: '内容平台', province: '北京', city: '北京', district: '海淀区', establishDate: '2012-03-09', capitalBackground: '民营控股', scale: '大型', techCert: '高新技术企业', listing: '未上市', park: '中关村软件园', group: '字节系', emergingIndustry: '数字创意', qixinScore: '905', shellIndex: '9', contractDefault: '低', techScore: '95', judicialDocs: '88', executed: '3', dishonest: '0', equityFreeze: '2', consumptionLimit: '4', finalCases: '5', abnormal: '0', seriousIllegal: '0', adminPenalty: '2', envPenalty: '0', equityPledge: '1', taxIllegal: '0', abnormalTax: '0', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '210', trademarks: '320', copyrights: '180', softwareCopyrights: '560' },
  { seq: 6, name: '上海寻梦信息技术有限公司', regCapital: '1000万', paidCapital: '1000万', orgType: '有限责任公司', status: '存续', insuredCount: '5600', industry1: '互联网和相关服务', industry2: '电商', province: '上海', city: '上海', district: '长宁区', establishDate: '2014-01-09', capitalBackground: '民营控股', scale: '大型', techCert: '高新技术企业', listing: '未上市', park: '虹桥临空经济园', group: '拼多多系', emergingIndustry: '数字商务', qixinScore: '868', shellIndex: '11', contractDefault: '低', techScore: '88', judicialDocs: '62', executed: '1', dishonest: '0', equityFreeze: '0', consumptionLimit: '2', finalCases: '3', abnormal: '0', seriousIllegal: '0', adminPenalty: '1', envPenalty: '0', equityPledge: '0', taxIllegal: '0', abnormalTax: '0', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '96', trademarks: '120', copyrights: '40', softwareCopyrights: '640' },
  { seq: 7, name: '广州唯品会电子商务有限公司', regCapital: '10000万', paidCapital: '10000万', orgType: '有限责任公司', status: '存续', insuredCount: '4200', industry1: '互联网和相关服务', industry2: '电商', province: '广东', city: '广州', district: '海珠区', establishDate: '2008-08-15', capitalBackground: '民营控股', scale: '大型', techCert: '高新技术企业', listing: 'NYSE上市', park: '琶洲互联网集聚区', group: '唯品会系', emergingIndustry: '数字商务', qixinScore: '835', shellIndex: '14', contractDefault: '低', techScore: '80', judicialDocs: '39', executed: '0', dishonest: '0', equityFreeze: '0', consumptionLimit: '1', finalCases: '2', abnormal: '0', seriousIllegal: '0', adminPenalty: '0', envPenalty: '0', equityPledge: '0', taxIllegal: '0', abnormalTax: '0', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '70', trademarks: '160', copyrights: '20', softwareCopyrights: '300' },
  { seq: 8, name: '成都某科技有限公司', regCapital: '500万', paidCapital: '200万', orgType: '有限责任公司', status: '存续', insuredCount: '28', industry1: '软件和信息技术服务业', industry2: '软件开发', province: '四川', city: '成都', district: '高新区', establishDate: '2019-11-22', capitalBackground: '民营控股', scale: '小型', techCert: '科技型中小企业', listing: '未上市', park: '天府软件园', group: '—', emergingIndustry: '人工智能', qixinScore: '612', shellIndex: '33', contractDefault: '中', techScore: '58', judicialDocs: '2', executed: '0', dishonest: '0', equityFreeze: '0', consumptionLimit: '0', finalCases: '0', abnormal: '1', seriousIllegal: '0', adminPenalty: '0', envPenalty: '0', equityPledge: '0', taxIllegal: '0', abnormalTax: '1', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '8', trademarks: '4', copyrights: '0', softwareCopyrights: '22' },
  { seq: 9, name: '武汉斗鱼鱼乐网络科技有限公司', regCapital: '1000万', paidCapital: '1000万', orgType: '其他有限责任公司', status: '存续', insuredCount: '1200', industry1: '互联网和相关服务', industry2: '直播', province: '湖北', city: '武汉', district: '东湖新区', establishDate: '2014-04-28', capitalBackground: '民营控股', scale: '中型', techCert: '高新技术企业', listing: 'NASDAQ上市', park: '光谷软件园', group: '斗鱼系', emergingIndustry: '数字创意', qixinScore: '720', shellIndex: '19', contractDefault: '低', techScore: '71', judicialDocs: '45', executed: '2', dishonest: '1', equityFreeze: '0', consumptionLimit: '3', finalCases: '4', abnormal: '1', seriousIllegal: '0', adminPenalty: '1', envPenalty: '0', equityPledge: '1', taxIllegal: '0', abnormalTax: '0', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '36', trademarks: '28', copyrights: '60', softwareCopyrights: '180' },
  { seq: 10, name: '西安迈科金属国际集团有限公司', regCapital: '50000万', paidCapital: '50000万', orgType: '有限责任公司', status: '存续', insuredCount: '880', industry1: '批发业', industry2: '金属矿产', province: '陕西', city: '西安', district: '高新区', establishDate: '2001-03-06', capitalBackground: '民营控股', scale: '大型', techCert: '—', listing: '未上市', park: '西安高新区', group: '迈科系', emergingIndustry: '大宗商品', qixinScore: '690', shellIndex: '22', contractDefault: '中', techScore: '52', judicialDocs: '21', executed: '4', dishonest: '1', equityFreeze: '3', consumptionLimit: '2', finalCases: '6', abnormal: '0', seriousIllegal: '0', adminPenalty: '2', envPenalty: '1', equityPledge: '5', taxIllegal: '0', abnormalTax: '0', simpleCancel: '2', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '12', trademarks: '8', copyrights: '0', softwareCopyrights: '0' },
  { seq: 11, name: '重庆小康工业集团股份有限公司', regCapital: '140000万', paidCapital: '140000万', orgType: '股份有限公司', status: '存续', insuredCount: '12000', industry1: '汽车制造业', industry2: '整车制造', province: '重庆', city: '重庆', district: '沙坪坝区', establishDate: '2007-05-18', capitalBackground: '民营控股', scale: '大型', techCert: '高新技术企业', listing: 'A股上市', park: '小康产业园', group: '小康系', emergingIndustry: '新能源汽车', qixinScore: '805', shellIndex: '17', contractDefault: '低', techScore: '76', judicialDocs: '18', executed: '1', dishonest: '0', equityFreeze: '0', consumptionLimit: '1', finalCases: '2', abnormal: '0', seriousIllegal: '0', adminPenalty: '1', envPenalty: '2', equityPledge: '2', taxIllegal: '0', abnormalTax: '0', simpleCancel: '0', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '480', trademarks: '210', copyrights: '0', softwareCopyrights: '60' },
  { seq: 12, name: '沈阳机床（集团）有限责任公司', regCapital: '120000万', paidCapital: '120000万', orgType: '有限责任公司', status: '存续', insuredCount: '6500', industry1: '通用设备制造业', industry2: '机床制造', province: '辽宁', city: '沈阳', district: '铁西区', establishDate: '1995-12-18', capitalBackground: '国有控股', scale: '大型', techCert: '高新技术企业', listing: 'A股上市', park: '沈阳机床城', group: '通用技术系', emergingIndustry: '高端装备', qixinScore: '688', shellIndex: '24', contractDefault: '中', techScore: '63', judicialDocs: '52', executed: '6', dishonest: '2', equityFreeze: '4', consumptionLimit: '3', finalCases: '8', abnormal: '1', seriousIllegal: '1', adminPenalty: '3', envPenalty: '2', equityPledge: '3', taxIllegal: '1', abnormalTax: '1', simpleCancel: '1', cancelRecord: '0', equityMortgage: '0', blacklist: '0', patents: '620', trademarks: '90', copyrights: '0', softwareCopyrights: '40' },
]

// 查人员：样例数据（编造，贴合真实业务语义）
const PERSON_ROWS = [
  { id: 'p1', name: '吴孟', partners: ['赵凯', '贾跃亭', '邓伟', '刘秋萍'], legalRep: ['乐视控股（北京）有限公司', '乐视汽车（北京）有限公司'], shareholder: ['北京东方车云信息技术有限公司'], executive: ['乐视网信息技术（北京）股份有限公司'] },
  { id: 'p2', name: '雷军', partners: ['刘德', '王川', '孙谦', '邹涛', '洪锋'], legalRep: ['小米科技有限责任公司', '天津金星创业投资有限公司'], shareholder: ['小米科技有限责任公司', '广州华多网络科技有限公司'], executive: ['小米科技有限责任公司', '拉卡拉支付股份有限公司'] },
  { id: 'p3', name: '张一鸣', partners: ['张利东', '陈林', '梁汝波'], legalRep: ['北京字节跳动科技有限公司', '抖音视界（上海）有限公司'], shareholder: ['字节跳动有限公司'], executive: ['北京字节跳动科技有限公司'] },
  { id: 'p4', name: '马化腾', partners: ['刘炽平', '任宇昕', '许晨晔'], legalRep: ['腾讯科技（深圳）有限公司', '深圳市世纪凯旋科技有限公司'], shareholder: ['腾讯控股有限公司'], executive: ['腾讯科技（深圳）有限公司'] },
  { id: 'p5', name: '马云', partners: ['蔡崇信', '彭蕾', '张勇'], legalRep: ['阿里巴巴（中国）有限公司', '淘宝（中国）软件有限公司'], shareholder: ['阿里巴巴集团控股有限公司'], executive: ['阿里巴巴（中国）有限公司'] },
  { id: 'p6', name: '王兴', partners: ['穆荣均', '王慧文', '陈亮'], legalRep: ['北京三快在线科技有限公司', '美团科技有限公司'], shareholder: ['美团点评科技（深圳）有限公司'], executive: ['北京三快在线科技有限公司'] },
]

const seed: Data = {
  pageTitle: '批量尽调结果',
  tabs: [
    { key: 'enterprise', label: '查企业' },
    { key: 'person', label: '查人员' },
  ],
  activeTab: 'enterprise',
  left: {
    tabs: ['选择指标', '我的模板', '精选模板'],
    active: '选择指标',
    searchPlaceholder: '请输入指标名称',
    selectAll: '全选',
    total: 203,
    settings: '设置',
    saveTemplate: '存为模板',
    tree: [
      { key: 'business', label: '工商信息', checked: true },
      { key: 'qixin', label: '企业健康度', checked: false },
      { key: 'relation', label: '企业关系', checked: false },
      { key: 'judicial', label: '司法风险', checked: false },
      { key: 'operation', label: '经营风险', checked: false },
      { key: 'operInfo', label: '经营信息', checked: false },
      { key: 'ip', label: '知识产权', checked: false },
      { key: 'history', label: '历史信息', checked: false },
    ],
    collapse: '收起',
  },
  filters: {
    title: '高级筛选',
    common: { title: '常用筛选', items: [{ label: '省份地区', type: 'select' }, { label: '所在行业', type: 'select' }] },
    groups: [
      { key: 'establish', title: '成立年限', options: ['不限', '1-5年', '5-10年', '10-15年', '1年以上', '3年以上', '5年以上', '10年以上', '15年以上', '自定义'] },
      { key: 'regCapital', title: '注册资本', options: ['不限', '0万-100万', '100万-200万', '200万-500万', '500万-1000万', '1000万以上', '自定义'] },
      { key: 'status', title: '经营状态', options: ['不限', '存续', '注销', '吊销', '撤销', '迁出', '设立中', '清算中', '停业', '其他'] },
      { key: 'concept', title: '概念标签', options: ['资本背景', '企业规模', '机构类型'], dropdowns: true },
      { key: 'risk', title: '风险信息', options: ['经营异常', '股权出质', '招投标', '债券违约', '应收账款质押', '应收账款转让', '融资租赁', '其他动产融资', '简易注销', '减资公告', '开庭公告', '裁判文书', '被执行人', '失信被执行人', '限制高消费', '终本案件', '司法拍卖', '司法协助', '环保处罚', '非正常户', '股权质押'], dropdowns: true },
      { key: 'relation', title: '企业关系', options: ['受益所有人', '实控企业', '间接持股企业', '合作持股股东', '对外投资', '工商股东', '最新公示股东', '间接股东', '主要人员', '供应商', '客户'], dropdowns: true },
      { key: 'operInfo', title: '经营信息', options: ['参保人数', '企业健康度', '官方认证', '税务资质', '进出口信息', '融资信息', '债券信息', '域名信息', '资质证书', '专利信息', '商标信息', '新闻舆情'], dropdowns: true },
      { key: 'history', title: '历史信息', options: ['工商变更', '主要人员', '减资公告', '对外投资', '工商股东', '最新公示股东', '立案信息', '开庭公告'], dropdowns: true },
    ],
    collapse: '收起筛选',
  },
  toolbar: {
    selectedText: '深圳市腾讯... 等2个企业',
    delete: '删除',
    edit: '编辑',
    portrait: '企业画像',
    market: '营销',
    distribute: '分发',
    addToCustomer: '加入客户列表',
    exportAll: '导出全部',
    exportCount: 2,
  },
  table: {
    columns: [
      { key: 'seq', label: '序号' },
      { key: 'name', label: '企业名称' },
      { key: 'regCapital', label: '注册资本' },
      { key: 'paidCapital', label: '实缴资本' },
      { key: 'orgType', label: '机构类型' },
      { key: 'status', label: '经营状态' },
      { key: 'insuredCount', label: '参保人数' },
      { key: 'industry1', label: '一级行业' },
      { key: 'industry2', label: '二级行业' },
      { key: 'province', label: '省份' },
      { key: 'city', label: '市' },
      { key: 'district', label: '区域' },
      { key: 'establishDate', label: '成立日期' },
      { key: 'capitalBackground', label: '资本背景' },
      { key: 'scale', label: '企业规模' },
      { key: 'techCert', label: '科技认定' },
      { key: 'listing', label: '上市信息' },
      { key: 'park', label: '园区名称' },
      { key: 'group', label: '所属集团' },
      { key: 'emergingIndustry', label: '新兴产业' },
      { key: 'qixinScore', label: '企业健康度' },
      { key: 'shellIndex', label: '空壳指数' },
      { key: 'contractDefault', label: '合同违约指数' },
      { key: 'techScore', label: '科创评分' },
      { key: 'judicialDocs', label: '裁判文书' },
      { key: 'executed', label: '被执行人' },
      { key: 'dishonest', label: '失信被执行人' },
      { key: 'equityFreeze', label: '股权冻结' },
      { key: 'consumptionLimit', label: '限制高消费' },
      { key: 'finalCases', label: '终本案件' },
      { key: 'abnormal', label: '经营异常' },
      { key: 'seriousIllegal', label: '严重违法失信' },
      { key: 'adminPenalty', label: '行政处罚' },
      { key: 'envPenalty', label: '环保处罚' },
      { key: 'equityPledge', label: '股权出质' },
      { key: 'taxIllegal', label: '重大税收违法' },
      { key: 'abnormalTax', label: '非正常户' },
      { key: 'simpleCancel', label: '简易注销' },
      { key: 'cancelRecord', label: '注销备案' },
      { key: 'equityMortgage', label: '股权质押' },
      { key: 'blacklist', label: '黑名单' },
      { key: 'patents', label: '专利信息' },
      { key: 'trademarks', label: '商标信息' },
      { key: 'copyrights', label: '著作权' },
      { key: 'softwareCopyrights', label: '软件著作权' },
    ],
    rows: BATCH_ENT_ROWS,
  },
  footer: { selectedIndicator: '已选指标: 44/203', selectedEnterprise: '已选企业 0/2', fullscreen: '全屏显示' },
  uploadModal: {
    title: '上传企业名单',
    steps: ['下载模板', '上传文件', '开始尽调'],
    step1: { title: '下载批量尽调模板', desc: '请下载 Excel 模板，按要求填写企业名称或统一社会信用代码，单次最多支持 2000 家企业。' },
    step2: { title: '上传企业名单', desc: '支持拖拽或点击上传 .xlsx / .xls 文件，文件大小不超过 20MB。' },
    step3: { title: '开始批量尽调', desc: '确认上传无误后，点击开始尽调，系统将自动对名单企业进行多维风险扫描。' },
    downloadTemplate: '下载模板',
    uploadFile: '点击或拖拽上传',
    start: '开始尽调',
    next: '下一步',
    prev: '上一步',
  },
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="7" cy="7" r="5" stroke="#94A3B8" strokeWidth="1.5" />
      <path d="M11 11l3 3" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M5 3l4 4-4 4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ChevronDown({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M3 5l4 4 4-4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0, marginLeft: 2 }}>
      <path d="M1 2.5h5M8 2.5h3M1 6h3M6 6h5M1 9.5h5M8 9.5h3" stroke="#94A3B8" strokeWidth="1" strokeLinecap="round" />
      <circle cx="6.5" cy="2.5" r="1" fill="#94A3B8" />
      <circle cx="4.5" cy="6" r="1" fill="#94A3B8" />
      <circle cx="6.5" cy="9.5" r="1" fill="#94A3B8" />
    </svg>
  )
}

function CustomCheckbox({ checked, onChange }: { checked: boolean; onChange?: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 14,
        height: 14,
        border: `1px solid ${checked ? '#1677ff' : '#CBD5E1'}`,
        borderRadius: 2,
        background: checked ? '#1677ff' : '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
      }}
    >
      {checked && (
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 5l2 2 4-4.5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  )
}

function IndicatorSidebar({ data }: { data: Data['left'] }) {
  const [kw, setKw] = useState('')
  const [checked, setChecked] = useState<Set<string>>(() => new Set(data.tree.filter((t) => t.checked).map((t) => t.key)))
  const [collapsed, setCollapsed] = useState(false)
  const filtered = data.tree.filter((t) => t.label.includes(kw.trim()))

  const toggleOne = (key: string) => {
    const next = new Set(checked)
    if (next.has(key)) next.delete(key)
    else next.add(key)
    setChecked(next)
  }

  const toggleAll = () => {
    if (checked.size === data.tree.length) setChecked(new Set())
    else setChecked(new Set(data.tree.map((t) => t.key)))
  }

  return (
    <div
      style={{
        width: 260,
        flexShrink: 0,
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #E2E8F0',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '12px 14px', borderBottom: '1px solid #E2E8F0', fontSize: 14, fontWeight: 600, color: '#0F172A' }}>
        {data.active}
      </div>

      {!collapsed && (
        <div style={{ padding: 14 }}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              value={kw}
              onChange={(e) => setKw(e.target.value)}
              placeholder={data.searchPlaceholder}
              style={{
                width: '100%',
                padding: '7px 28px 7px 10px',
                borderRadius: 6,
                border: '1px solid #E2E8F0',
                fontSize: 13,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
            <div style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}>
              <SearchIcon />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <button
              onClick={toggleAll}
              style={{ display: 'flex', alignItems: 'center', gap: 6, border: 'none', background: 'transparent', cursor: 'pointer', fontSize: 13, color: '#0F172A' }}
            >
              <CustomCheckbox checked={checked.size === data.tree.length && data.tree.length > 0} />
              <span>
                {data.selectAll}({data.total})
              </span>
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <EpBtn variant="ghost" size="sm">{data.settings}</EpBtn>
              <EpBtn variant="primary" size="sm">{data.saveTemplate}</EpBtn>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {filtered.map((item) => (
              <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                <ChevronRight />
                <CustomCheckbox checked={checked.has(item.key)} onChange={() => toggleOne(item.key)} />
                <span style={{ fontSize: 13, color: '#0F172A' }}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 'auto', padding: 12, borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'center' }}>
        <button
          onClick={() => setCollapsed((o) => !o)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            padding: '4px 12px',
            borderRadius: 12,
            border: '1px solid #E2E8F0',
            background: '#F8FAFC',
            fontSize: 12,
            color: '#475569',
            cursor: 'pointer',
          }}
        >
          {collapsed ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          {collapsed ? '展开' : data.collapse}
        </button>
      </div>
    </div>
  )
}

export default function JdBatchResult({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('jdBatchResult.json', seed)
  const { goDetail } = usePageNav()
  const [tab, setTab] = useState(data.activeTab)
  const [selected, setSelected] = useState<string[]>([])
  const [personKw, setPersonKw] = useState('')
  const [appliedKw, setAppliedKw] = useState('')
  const [uploadOpen, setUploadOpen] = useState(params.get('upload') === '1')
  const [step, setStep] = useState(1)
  // 筛选条件默认收起（点搜索/展开可打开）
  const [filterOpen, setFilterOpen] = useState(false)
  // 左侧指标栏可收起
  const [leftCollapsed, setLeftCollapsed] = useState(false)

  // 关闭上传弹窗后重置到第一步
  useEffect(() => {
    if (!uploadOpen) setStep(1)
  }, [uploadOpen])

  // 默认高亮：带"不限"的筛选组选中"不限"
  const initialFilter = () => {
    const map: Record<string, string> = {}
    data.filters.groups.forEach((g) => {
      if (g.options.includes('不限')) map[g.key] = '不限'
    })
    return map
  }
  const [activeFilter, setActiveFilter] = useState<Record<string, string>>(initialFilter)

  const columns = data.table.columns.map((c) => ({
    key: c.key,
    label: c.label,
    width: c.key === 'name' ? 260 : c.key === 'seq' ? 70 : 138,
    align: 'left' as const,
  }))

  const rows = data.table.rows.map((r) => ({ ...r, id: String(r.id ?? r.seq) }))

  const nextStep = () => {
    if (step < 3) setStep(step + 1)
    else setUploadOpen(false)
  }

  return (
    <EpPage title={data.pageTitle} actions={<Sam value="jdBatchResult.json" />}>
      {/* 顶部 Tab */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', marginBottom: 16 }}>
        {data.tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: '10px 0',
              marginRight: 28,
              border: 'none',
              borderBottom: `2px solid ${tab === t.key ? '#1677ff' : 'transparent'}`,
              background: 'transparent',
              color: tab === t.key ? '#1677ff' : '#475569',
              fontSize: 15,
              fontWeight: tab === t.key ? 600 : 400,
              cursor: 'pointer',
              marginBottom: -1,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'person' ? (
        <>
          {/* 查人员：搜索工具条 */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: 520 }}>
              <input
                value={personKw}
                onChange={(e) => setPersonKw(e.target.value)}
                placeholder="请输入人员姓名进行查询"
                style={{ width: '100%', padding: '9px 28px 9px 12px', borderRadius: 8, border: '1px solid #CBD5E1', fontSize: 13, outline: 'none', boxSizing: 'border-box' }}
              />
              <div style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(- 50%)' }}><SearchIcon /></div>
            </div>
            <EpBtn variant="primary" size="sm" onClick={() => setAppliedKw(personKw.trim())}>查询</EpBtn>
            {appliedKw && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '0 12px', borderRadius: 8, background: '#EFF6FF', color: '#1677ff', fontSize: 13 }}>
                关键词：{appliedKw}
                <span style={{ cursor: 'pointer', color: '#94A3B8' }} onClick={() => { setAppliedKw(''); setPersonKw('') }}>×</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {PERSON_ROWS.filter((r) => !appliedKw || r.name.includes(appliedKw)).map((r) => (
              <div key={r.id} style={{ display: 'flex', gap: 16, background: '#fff', borderRadius: 10, border: '1px solid #E2E8F0', padding: '18px 20px' }}>
                <div style={{ width: 64, height: 64, borderRadius: 6, background: '#334155', color: '#fff', fontSize: 26, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{r.name.slice(0, 1)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#1677ff', cursor: 'pointer' }} onClick={() => goDetail('/console/dm/person-archive-basic?name=' + encodeURIComponent(r.name))}>{r.name}</div>
                  <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.7, color: '#334155' }}>
                    <span style={{ color: '#64748B' }}>合作伙伴：</span>
                    {r.partners.map((v, i) => (<span key={v}>{i > 0 && <span style={{ color: '#CBD5E1' }}>、</span>}<span style={{ color: '#1677ff', cursor: 'pointer' }}>{v}</span></span>))}
                  </div>
                  <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.7, color: '#334155' }}>
                    <span style={{ color: '#64748B' }}>担任法定代表人的企业：</span>
                    {r.legalRep.map((v, i) => (<span key={v}>{i > 0 && <span style={{ color: '#CBD5E1' }}>、</span>}<span style={{ color: '#1677ff' }}>{v}</span></span>))}
                  </div>
                </div>
              </div>
            ))}
            {PERSON_ROWS.filter((r) => !appliedKw || r.name.includes(appliedKw)).length === 0 && (
              <div style={{ padding: 40, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>未查询到相关人员</div>
            )}
          </div>
        </>
      ) : (
        <div style={{ display: 'flex', gap: 16 }}>
          <IndicatorSidebar data={data.left} />

          <div style={{ flex: 1, minWidth: 0 }}>
            {/* 高级筛选 */}
            <EpCard
              title={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{data.filters.title}</span>
                  <button
                    onClick={() => setFilterOpen((o) => !o)}
                    style={{ border: `1px solid #1677ff`, color: '#1677ff', background: '#fff', borderRadius: 4, padding: '3px 12px', fontSize: 13, cursor: 'pointer' }}
                  >
                    {filterOpen ? '收起筛选 ▲' : '展开筛选 ▼'}
                  </button>
                </div>
              }
              pad
            >
              {filterOpen && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* 常用筛选 */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', width: 70 }}>{data.filters.common.title}</span>
                    {data.filters.common.items.map((item) => (
                      <button
                        key={item.label}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 3,
                          padding: '4px 10px',
                          borderRadius: 4,
                          border: '1px solid #E2E8F0',
                          background: '#fff',
                          fontSize: 13,
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        {item.label}
                        <ChevronDown size={12} />
                      </button>
                    ))}
                  </div>

                  {/* 分组筛选 */}
                  {data.filters.groups.map((g) => (
                    <div key={g.key} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', width: 70, flexShrink: 0 }}>{g.title}</span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, flex: 1 }}>
                        {g.options.map((opt) => {
                          const active = activeFilter[g.key] === opt
                          return (
                            <button
                              key={opt}
                              onClick={() => setActiveFilter({ ...activeFilter, [g.key]: opt })}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 2,
                                padding: '3px 10px',
                                borderRadius: 4,
                                border: `1px solid ${active ? '#1677ff' : '#E2E8F0'}`,
                                background: active ? '#EFF6FF' : '#fff',
                                fontSize: 13,
                                color: active ? '#1677ff' : '#475569',
                                cursor: 'pointer',
                              }}
                            >
                              {opt}
                              {g.dropdowns && <FilterIcon />}
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </EpCard>

            {/* 工具栏 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                marginTop: 16,
                marginBottom: 12,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14, color: '#0F172A' }}>{data.toolbar.selectedText}</span>
                <EpBtn variant="ghost" size="sm">
                  {data.toolbar.delete}
                </EpBtn>
                <EpBtn variant="ghost" size="sm">
                  {data.toolbar.edit}
                </EpBtn>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <EpBtn variant="default" size="sm">
                  {data.toolbar.portrait}
                </EpBtn>
                <EpBtn variant="default" size="sm">
                  {data.toolbar.market}
                </EpBtn>
                <EpBtn variant="default" size="sm">
                  {data.toolbar.distribute}
                </EpBtn>
                <EpBtn variant="default" size="sm">
                  {data.toolbar.addToCustomer}
                </EpBtn>
                <EpBtn variant="primary" size="sm">
                  {data.toolbar.exportAll}({data.toolbar.exportCount}家)
                </EpBtn>
              </div>
            </div>

            {/* 表格 */}
            <EpCard pad>
              <DataTable
                columns={columns}
                rows={rows}
                selectable
                selected={selected}
                onSelectChange={setSelected}
                pager
                defaultPageSize={10}
                pageSizeOptions={[10, 20, 50]}
              />
            </EpCard>

            {/* 底部状态 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginTop: 12,
                fontSize: 13,
                color: '#64748B',
              }}
            >
              <div style={{ display: 'flex', gap: 16 }}>
                <span>{data.footer.selectedIndicator}</span>
                <span>{data.footer.selectedEnterprise}</span>
              </div>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  border: 'none',
                  background: 'transparent',
                  color: '#64748B',
                  cursor: 'pointer',
                  fontSize: 13,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="2" y="2" width="10" height="10" rx="2" stroke="#94A3B8" strokeWidth="1.5" />
                  <path d="M5 7h4" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                {data.footer.fullscreen}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 上传弹窗（三步） */}
      <Modal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        title={data.uploadModal.title}
        width="max-w-2xl"
        footer={
          <>
            {step > 1 && (
              <EpBtn variant="default" size="sm" onClick={() => setStep(step - 1)}>
                {data.uploadModal.prev}
              </EpBtn>
            )}
            <EpBtn variant="primary" size="sm" onClick={nextStep}>
              {step === 3 ? data.uploadModal.start : data.uploadModal.next}
            </EpBtn>
          </>
        }
      >
        {/* 步骤条 */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
          {data.uploadModal.steps.map((s, idx) => {
            const num = idx + 1
            const active = num === step
            const done = num < step
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 600,
                      color: active || done ? '#fff' : '#64748B',
                      background: active ? '#1677ff' : done ? '#10B981' : '#E2E8F0',
                    }}
                  >
                    {done ? '✓' : num}
                  </div>
                  <span style={{ fontSize: 13, color: active ? '#1677ff' : done ? '#10B981' : '#64748B', fontWeight: active ? 600 : 400 }}>{s}</span>
                </div>
                {idx < data.uploadModal.steps.length - 1 && (
                  <div style={{ flex: 1, height: 1, background: done ? '#10B981' : '#E2E8F0', margin: '0 12px' }} />
                )}
              </div>
            )
          })}
        </div>

        {step === 1 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>{data.uploadModal.step1.title}</div>
            <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, marginBottom: 20 }}>{data.uploadModal.step1.desc}</div>
            <EpBtn variant="primary" size="md">
              {data.uploadModal.downloadTemplate}
            </EpBtn>
          </div>
        )}

        {step === 2 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>{data.uploadModal.step2.title}</div>
            <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7, marginBottom: 16 }}>{data.uploadModal.step2.desc}</div>
            <div
              style={{
                border: '2px dashed #CBD5E1',
                borderRadius: 12,
                padding: 40,
                textAlign: 'center',
                color: '#64748B',
                fontSize: 13,
                background: '#F8FAFC',
              }}
            >
              {data.uploadModal.uploadFile}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>{data.uploadModal.step3.title}</div>
            <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>{data.uploadModal.step3.desc}</div>
          </div>
        )}
      </Modal>
    </EpPage>
  )
}
