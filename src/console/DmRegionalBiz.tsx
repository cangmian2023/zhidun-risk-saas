import React, { useEffect, useRef, useState, useMemo, Fragment } from 'react'
import * as echarts from 'echarts'
import { PageHeader, Panel, Modal, RightDrawer, DataTable, Button } from '../components/ui'
import type { Column, Row } from '../components/ui'

/* ============ 工具：星级 ============ */
function Stars({ n }: { n: number }) {
  return (
    <span className="text-[#4080FF] tracking-wider">
      {Array.from({ length: 5 }).map((_, i) => (i < n ? '★' : '☆')).join('')}
    </span>
  )
}
/* ============ 工具：商机类型标签 ============ */
function BizTypeTag({ text, kind }: { text: string; kind: 'red' | 'blue' }) {
  const cls = kind === 'red' ? 'bg-rose-200 text-rose-800' : 'bg-blue-200 text-blue-800'
  return <span className={`${cls} px-1.5 py-0.5 rounded text-xs whitespace-nowrap`}>{text}</span>
}
/* ============ 工具：企业标记图标 ============ */
function CompanyMark({ kind, letter }: { kind: 'red' | 'gray' | 'blue' | 'green' | 'link'; letter?: string }) {
  if (letter) return <span className="bg-blue-500 text-white px-1 rounded text-xs mr-1">{letter}</span>
  const map: Record<string, React.ReactNode> = {
    red: <i className="fa fa-building text-red-500 mr-1" />,
    gray: <i className="fa fa-square text-gray-800 mr-1" />,
    green: <i className="fa fa-leaf text-green-600 mr-1" />,
    link: <i className="fa fa-link text-red-500 mr-1" />,
  }
  return <>{map[kind]}</>
}

/* ============ 筛选下拉（带标签） ============ */
const FILTER_LABEL: Record<string, string> = {
  date: '发生日期', value: '商机价值', bizOpp: '业务机会', bizType: '商机类型',
  province: '省份地区', industry: '所在行业', capital: '资本背景', entType: '企业类型', org: '其他组织',
  cert: '资质标签', listed: '上市信息', scale: '企业规模', insured: '参保人数', regCapital: '注册资本',
  founded: '成立时间', qixin: '企业健康度', dishonest: '失信被执行人', executed: '被执行人', zhongben: '终本案件',
}
function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="inline-flex items-center gap-1 border border-gray-300 rounded px-2 py-1 text-xs bg-white hover:border-brand-500 cursor-pointer">
      <span className="text-gray-500">{label}</span>
      <select
        className="bg-transparent outline-none cursor-pointer text-slate-700"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (<option key={o} value={o}>{o}</option>))}
      </select>
    </label>
  )
}

/* ============ 行政区下拉（省级行政单位） ============ */
const regionOptions = [
  { label: '北京市', value: 'beijing' },
  { label: '天津市', value: 'tianjin' },
  { label: '河北省', value: 'hebei' },
  { label: '山西省', value: 'shanxi' },
  { label: '内蒙古自治区', value: 'neimenggu' },
  { label: '辽宁省', value: 'liaoning' },
  { label: '吉林省', value: 'jilin' },
  { label: '黑龙江省', value: 'heilongjiang' },
  { label: '上海市', value: 'shanghai' },
  { label: '江苏省', value: 'jiangsu' },
  { label: '浙江省', value: 'zhejiang' },
  { label: '安徽省', value: 'anhui' },
  { label: '福建省', value: 'fujian' },
  { label: '江西省', value: 'jiangxi' },
  { label: '山东省', value: 'shandong' },
  { label: '河南省', value: 'henan' },
  { label: '湖北省', value: 'hubei' },
  { label: '湖南省', value: 'hunan' },
  { label: '广东省', value: 'guangdong' },
  { label: '广西壮族自治区', value: 'guangxi' },
  { label: '海南省', value: 'hainan' },
  { label: '重庆市', value: 'chongqing' },
  { label: '四川省', value: 'sichuan' },
  { label: '贵州省', value: 'guizhou' },
  { label: '云南省', value: 'yunnan' },
  { label: '西藏自治区', value: 'xizang' },
  { label: '陕西省', value: 'shanxi2' },
  { label: '甘肃省', value: 'gansu' },
  { label: '青海省', value: 'qinghai' },
  { label: '宁夏回族自治区', value: 'ningxia' },
  { label: '新疆维吾尔自治区', value: 'xinjiang' },
  { label: '香港特别行政区', value: 'xianggang' },
  { label: '澳门特别行政区', value: 'aomen' },
  { label: '台湾省', value: 'taiwan' },
]

/* ============ 商机列表筛选条件选项 ============ */
const DATE_OPTIONS = ['不限', '最近1个月', '最近3个月', '最近6个月', '最近1年']
const VALUE_OPTIONS = ['不限', '1星', '2星', '3星', '4星', '5星']
const BIZ_OPP_OPTIONS = ['不限', '开户', '存款', '授信', '其他']
const BIZ_VALUE_OPTIONS = ['不限', '1星', '2星', '3星', '4星', '5星']
const BIZ_TYPE_TREE: { group: string; children: string[] }[] = [
  { group: '新增项目', children: ['政府项目', '招投标项目', '工程项目', '研发项目'] },
  { group: '新增机构', children: ['分支机构', '子公司', '办事处'] },
  { group: '投融资并购', children: ['股权融资', '债权融资', '并购重组', '增资扩股'] },
  { group: '融资担保到期', children: ['应收账款融资到期', '借款担保到期', '保函到期', '信用证到期'] },
  { group: '公私联动', children: ['代发工资', '企业年金', '员工信用卡'] },
  { group: '政策规划', children: ['产业扶持', '专项补贴', '园区政策'] },
  { group: '经营扩张', children: ['新设网点', '产能扩张', '区域拓展'] },
  { group: '短期变现', children: ['应收账款转让', '存货质押', '票据贴现'] },
  { group: '新获资质/荣誉', children: ['高新技术企业', '专精特新', '驰名商标'] },
  { group: '其他', children: [] },
]
const BIZ_TYPE_GROUP_OF: Record<string, string> = {}
BIZ_TYPE_TREE.forEach((t) => t.children.forEach((c) => { BIZ_TYPE_GROUP_OF[c] = t.group }))
const BIZ_TYPE_OPTIONS = ['不限', '新增项目', '新增机构', '投融资并购', '融资担保到期', '公私联动', '政策规划', '经营扩张', '短期变现', '新获资质/荣誉', '其他']
const PROVINCE_OPTIONS = ['不限', '北京市', '广东省', '山东省', '江苏省', '浙江省', '湖北省', '四川省']
const INDUSTRY_OPTIONS = ['不限', '建筑业', '批发和零售业', '科技推广和应用服务业', '制造业', '金融业', '房地产业', '信息传输、软件和信息技术服务业']
const CAPITAL_OPTIONS = ['不限', '国有控股', '民营控股', '港澳台投资', '外商投资', '集体控股']
const ENT_TYPE_OPTIONS = ['不限', '有限责任公司', '股份有限公司', '国有企业', '合伙企业', '个体工商户']
const ORG_OPTIONS = ['不限', '无', '事业单位', '社会团体', '基金会', '民办非企业']
const CERT_OPTIONS = ['不限', '无', '高新技术企业', '科技型中小企业', '专精特新', '消防资质', '风景园林资质', 'ISO体系认证']
const LISTED_OPTIONS = ['不限', '非上市', 'A股', '港股', '新三板', '创业板', '科创板']
const SCALE_OPTIONS = ['不限', '大型企业', '中型企业', '小微企业', '规模以上企业']
const INSURED_OPTIONS = ['不限', '0-50人', '51-100人', '101-300人', '301-1000人', '1000人以上']
const REG_CAPITAL_OPTIONS = ['不限', '0-1000万', '1000万-5000万', '5000万-1亿', '1亿-5亿', '5亿以上']
const FOUNDED_OPTIONS = ['不限', '2020年以后', '2010-2019年', '2000-2009年', '2000年以前']
const QIXIN_OPTIONS = ['不限', '600以下', '600-700', '700-800', '800-900', '900以上']
const DISHONEST_OPTIONS = ['不限', '是', '否']
const EXECUTED_OPTIONS = ['不限', '0条', '1-3条', '4-10条', '10条以上']
const ZHONGBEN_OPTIONS = ['不限', '0条', '1-3条', '4条以上']

/* 数值区间解析工具 */
function inRange(v: number, opt: string): boolean {
  if (opt === '不限') return true
  const map: Record<string, [number, number]> = {
    '0-50人': [0, 50], '51-100人': [51, 100], '101-300人': [101, 300], '301-1000人': [301, 1000], '1000人以上': [1001, Infinity],
    '0-1000万': [0, 1000], '1000万-5000万': [1000, 5000], '5000万-1亿': [5000, 10000], '1亿-5亿': [10000, 50000], '5亿以上': [50000, Infinity],
    '600以下': [0, 600], '600-700': [600, 700], '700-800': [700, 800], '800-900': [800, 900], '900以上': [900, Infinity],
  }
  const r = map[opt]
  if (!r) return true
  return v >= r[0] && v <= r[1]
}

/* ============ 地图圈选搜索 · 筛选字段配置 ============
   control: select=下拉选择 / number=数字输入 / date=日期选择 */
interface MapFilterField {
  key: string
  label: string
  control: 'select' | 'number' | 'date'
  options?: string[]
  placeholder?: string
  unit?: string
}
const MAP_FILTER_FIELDS: MapFilterField[] = [
  { key: 'founded', label: '成立时间', control: 'date', placeholder: '选择成立年份/日期' },
  { key: 'industry', label: '所在行业', control: 'select', options: ['不限', '建筑业', '批发和零售业', '科技推广和应用服务业', '制造业', '金融业', '房地产业', '信息传输、软件和信息技术服务业'] },
  { key: 'regCapital', label: '注册资本', control: 'number', placeholder: '输入金额', unit: '万元' },
  { key: 'status', label: '经营状态', control: 'select', options: ['不限', '存续（在营、开业、在册）', '存续', '吊销', '注销', '迁出'] },
  { key: 'qixin', label: '企业健康度', control: 'number', placeholder: '输入分数', unit: '分' },
  { key: 'scale', label: '企业规模', control: 'select', options: ['不限', '大型企业', '中型企业', '小微企业', '规模以上企业'] },
  { key: 'cert', label: '资质标签', control: 'select', options: ['不限', '高新技术企业', '科技型中小企业', '专精特新', '消防资质', '风景园林资质', 'ISO体系认证'] },
  { key: 'entType', label: '企业类型', control: 'select', options: ['不限', '有限责任公司', '股份有限公司', '国有企业', '合伙企业', '个体工商户'] },
  { key: 'listed', label: '上市信息', control: 'select', options: ['不限', '非上市', 'A股', '港股', '新三板', '创业板', '科创板'] },
  { key: 'insured', label: '参保人数', control: 'number', placeholder: '输入人数', unit: '人' },
  { key: 'mobile', label: '手机号码', control: 'select', options: ['不限', '有', '无'] },
  { key: 'phone', label: '座机号码', control: 'select', options: ['不限', '有', '无'] },
  { key: 'emptyFilter', label: '空号过滤', control: 'select', options: ['不限', '仅有效号码', '过滤空号'] },
  { key: 'importExport', label: '进出口信息', control: 'select', options: ['不限', '有进出口资质', '无进出口资质'] },
  { key: 'distance', label: '距离范围', control: 'number', placeholder: '输入半径', unit: 'km' },
]

/* ============ 商机列表样例数据（设计稿 1:1） ============ */
interface BizRow extends Row {
  company: string
  mark: 'red' | 'gray' | 'blue' | 'green' | 'link'
  letter?: string
  companyTags: string[]
  date: string
  bizType: string
  bizTypeKind: 'red' | 'blue'
  value: number
  content: string
  bizTags: string[]
  companyBizCount: number
  detailFields?: { label: string; value: string }[]
  contacts?: { seq: number; contact: string; type: string; source: string; empty: string }[]
  companyBizList?: { content: string; date: string; tags: string[]; stars: number; fields: { label: string; value: string }[]; desc?: string }[]
}

/* 企业画像（用于省份地区/所在行业/资本背景/企业类型/其他组织/资质标签/上市信息/
   企业规模/参保人数/注册资本/成立时间/企业健康度/失信被执行人/被执行人/终本案件 等筛选） */
interface CompanyProfile {
  province: string
  industry: string
  capital: string
  entType: string
  org: string
  cert: string
  listed: string
  scale: string
  insured: number
  regCapital: number // 万元
  founded: string
  qixinScore: number
  dishonest: number
  executed: number
  zhongben: number
}

const bizRows: BizRow[] = [
  {
    id: '1',
    company: '北京科安达消防工程有限公司',
    mark: 'red',
    companyTags: ['中型企业', '民营企业'],
    date: '2026-08-21',
    bizType: '应收账款转让（保理）',
    bizTypeKind: 'red',
    value: 3,
    content:
      '将于2026-08-21发生应收账款转让（保理）到期事件，出让人为北京科安达消防工程有限公司，受让人为中国建设银行股份有限公司天津海益国际中心支行，该笔质押的金额为921516.46元，对应财产价值为921516.46元，登记类型为初始登记，',
    bizTags: ['授信'],
    companyBizCount: 65,
    detailFields: [
      { label: '出让人名称', value: '北京科安达消防工程有限公司' },
      { label: '受让人名称', value: '中国建设银行股份有限公司天津海益国际中心支行' },
      { label: '主合同金额', value: '921516.46元' },
      { label: '登记种类', value: '初始登记' },
      { label: '登记期限', value: '1.00年' },
      { label: '登记时间', value: '2025-08-22' },
      { label: '登记到期日', value: '2026-08-21' },
      {
        label: '转让财产描述',
        value:
          '中国电建市政建设集团有限公司基于与北京科安达消防工程有限公司签订的编号为SZJT-ZSD-DXDKXM-[2024]-006的合同项下玖拾贰万壹仟伍佰壹拾陆元肆角陆分的应收账款,在建信融通服务平台签发编号为ZGDJSZ-20250821-008-000000的融信(电子债权凭证),金额为玖拾贰万壹仟伍佰壹拾陆元肆角陆分,付款日为2026年8月21日。现北京科安达消防工程有限公司已将其持有融信及其对应的玖拾贰万壹仟伍佰壹拾陆元肆角陆分应收账款全部转让给中国建设银行股份有限公司天津西青支行。该笔应收账款对应的发票号码为25112000000121393232,共1张。',
      },
    ],
    contacts: [
      { seq: 1, contact: '北京市通州区经济开发区东区靓丽三街9号-215', type: '地址', source: '注册地址', empty: '无需检测' },
      { seq: 2, contact: '亦庄开发区同济中路狮岛索龙大厦106室', type: '地址', source: '2013、2014、2015年报', empty: '无需检测' },
      { seq: 3, contact: '北京市东城区珠市口东大街3号119室', type: '地址', source: '注册地址、招投标知识数据...', empty: '无需检测' },
      { seq: 4, contact: '北京市亦庄开发区同济中路狮岛索龙大厦302室', type: '地址', source: '2017年报', empty: '无需检测' },
      { seq: 5, contact: '大兴区亦庄开发区同济中路2号狮岛索龙大厦302', type: '地址', source: '2018年报', empty: '无需检测' },
      { seq: 6, contact: '北京市大兴区亦庄开发区同济中路2号狮岛索龙大厦302室', type: '地址', source: '2019、2020、2021、2022...', empty: '无需检测' },
      { seq: 7, contact: '67866751', type: '座机、电话', source: '招投标大数据、招投标知识...', empty: '未检测' },
      { seq: 8, contact: '67866754', type: '座机', source: '2013、2014、2015、2018...', empty: '未检测' },
      { seq: 9, contact: '010-67866754', type: '座机、电话', source: '招投标大数据、招投标知识...', empty: '未检测' },
      { seq: 10, contact: 'kadxfgs@126.com', type: '邮箱', source: '2013、2014、2016...', empty: '无需检测' },
    ],
  },
  {
    id: '2',
    company: '北京丽都嘉业装饰工程有限公司',
    mark: 'gray',
    companyTags: ['民营企业'],
    date: '2026-08-21',
    bizType: '应收账款转让（保理）',
    bizTypeKind: 'red',
    value: 3,
    content:
      '将于2026-08-21发生应收账款转让（保理）到期事件，出让人为北京丽都嘉业装饰工程有限公司，受让人为保利商业保理有限公司，该笔质押的金额为0元，对应财产价值为28012899.27元，登记类型为初始登记，期限为1.083333333333333年',
    bizTags: ['授信'],
    companyBizCount: 6,
    detailFields: [
      { label: '商机类型', value: '应收账款转让（保理）' },
      { label: '商机价值', value: '★★★☆☆' },
      { label: '商机内容', value: '将于2026-08-21发生应收账款转让（保理）到期事件，出让人为北京丽都嘉业装饰工程有限公司，受让人为保利商业保理有限公司，该笔质押的金额为0元，对应财产价值为28012899.27元，登记类型为初始登记，期限为1.083333333333333年' },
    ],
  },
  {
    id: '3',
    company: '北京粤十机器人科技有限公司',
    mark: 'blue',
    letter: '北',
    companyTags: ['民营企业', '港澳台投资', '小微企业'],
    date: '2026-08-21',
    bizType: '筹划融资（私募）',
    bizTypeKind: 'blue',
    value: 5,
    content:
      '北京粤十机器人科技有限公司距上次投融资已超过10个月，预计将筹划新一轮创投融资，上次融资时间为2025-10-25，融资轮次为股权投资，融资金额为--万元，投资人为湖北夏创星火创业投资基金合伙企业（有限合伙）。',
    bizTags: ['存款', '授信'],
    companyBizCount: 5,
    companyBizList: [
      {
        content:
          '北京粤十机器人科技有限公司距上次投融资已超过10个月，预计将筹划新一轮创投融资，上次融资时间为2025-10-25，融资轮次为股权投资，融资金额为--万元，投资人为湖北夏创星火创业投资基金合伙企业（有限合伙）。',
        date: '2026-08-21',
        tags: ['筹划融资（私募）', '存款', '授信'],
        stars: 5,
        fields: [
          { label: '融资方名称', value: '北京粤十机器人科技有限公司' },
          { label: '最新融资时间', value: '2025-10-25' },
          { label: '最新融资轮次', value: '股权投资' },
          { label: '最新融资金额（万元）', value: '-' },
          { label: '最新融资币种', value: '人民币' },
          { label: '最新融资投资人', value: '湖北夏创星火创业投资基金合伙企业（有限合...' },
          { label: '来源地址', value: '-' },
        ],
      },
      {
        content:
          '2025-10-25新增了一笔股权融资，融资方为北京粤十机器人科技有限公司,投资企业为湖北夏创星火创业投资基金合伙企业（有限合伙）,持股比例为2.64%',
        date: '2025-10-25',
        tags: ['股权融资', '存款', '授信'],
        stars: 3,
        fields: [
          { label: '融资时间', value: '2025-10-25' },
          { label: '投资方名称', value: '湖北夏创星火创业投资基金合伙企业（有限合伙）' },
          { label: '股份比例', value: '2.64%' },
          { label: '认缴资本', value: '40.716万元' },
          { label: '实缴资本', value: '40.716万元' },
        ],
      },
      {
        content:
          '2025-10-25发生了一笔股权融资,轮次为股权投资,金额: --,币种: 人民币,投资方: 湖北夏创星火创业投资基金合伙企业（有限合伙）',
        date: '2025-10-25',
        tags: ['新获融资', '存款', '授信'],
        stars: 5,
        fields: [
          { label: '融资轮次', value: '股权投资' },
          { label: '投资方', value: '湖北夏创星火创业投资基金合伙企业（有限合伙）' },
          { label: '融资金额', value: '未披露' },
          { label: '币种', value: '人民币' },
          { label: '融资日期', value: '2025-10-25' },
        ],
      },
      {
        content: '2025-10-22发生注册资本变更,原注册资本: 1628.64万元,新注册资本: 1669.36万元',
        date: '2025-10-22',
        tags: ['注册资本增加', '存款', '授信'],
        stars: 3,
        fields: [
          { label: '原注册资本', value: '1628.64万元' },
          { label: '新注册资本', value: '1669.36万元' },
          { label: '变更日期', value: '2025-10-22' },
        ],
      },
      {
        content:
          '2025-10-15新增了一笔股权融资，融资方为北京粤十机器人科技有限公司,投资企业为AEF GBA Mainland Limited,持股比例为7.21%',
        date: '2025-10-15',
        tags: ['股权融资', '存款', '授信'],
        stars: 3,
        fields: [
          { label: '融资时间', value: '2025-10-15' },
          { label: '投资方名称', value: 'AEF GBA Mainland Limited' },
          { label: '股份比例', value: '7.21%' },
          { label: '认缴资本', value: '111.1111万元' },
        ],
      },
    ],
  },
  {
    id: '4',
    company: '北京中铁建工物资有限公司',
    mark: 'link',
    companyTags: ['大型企业', '国有企业'],
    date: '2026-08-21',
    bizType: '应收账款融资到期',
    bizTypeKind: 'red',
    value: 4,
    content:
      '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为交通银行股份有限公司武汉东湖新技术开发区支行,该笔融资的融资额为0万,财产价值为4690520.97元,类型为应收账款转让（保理）,起始日为2025-11-20,截止日为2026-11-19,期限为1.',
    bizTags: ['授信'],
    companyBizCount: 1797,
    detailFields: [
      { label: '商机类型', value: '应收账款融资到期' },
      { label: '商机价值', value: '★★★★☆' },
      { label: '商机内容', value: '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为交通银行股份有限公司武汉东湖新技术开发区支行,该笔融资的融资额为0万,财产价值为4690520.97元,类型为应收账款转让（保理）,起始日为2025-11-20,截止日为2026-11-19,期限为1.' },
    ],
    companyBizList: [
      {
        content: '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为交通银行股份有限公司武汉东湖新技术开发区支行,该笔融资的融资额为0万,财产价值为4690520.97元,类型为应收账款转让（保理）,起始日为2025-11-20,截止日为2026-11-19,期限为1.0年',
        date: '2026-08-21',
        tags: ['应收账款融资到期', '授信'],
        stars: 4,
        fields: [
          { label: '融资额', value: '0万元' },
          { label: '币种', value: '-' },
          { label: '财产价值', value: '4690520.97元' },
          { label: '期限', value: '1.0年' },
          { label: '起始日', value: '2025-11-20' },
          { label: '截止日', value: '2026-11-19' },
          { label: '披露日期', value: '-' },
          { label: '融资类型', value: '应收账款转让（保理）' },
        ],
        desc: '根据北京中铁建工物资有限公司(下称卖方)与中建三局集团有限公司(下称买方)于2024年1月签订的合同编号为"cscec-ht2-2024010808027"的《国家矿产资源综合利用技术创新基地项目钢筋物资采购(执行)合同》,卖方将该合同项下产生的应收账款人民币4,690,520.97元(发票号码25112000000137512733,共计1张)转让给我行,用于北京中铁建工物资有限公司在我行办理人民币4,690,520.97元国内保理业务。',
      },
      {
        content: '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为中国建设银行股份有限公司武汉省直支行,该笔融资的融资额为1021.053678万,财产价值为10210536.78元,类型为应收账款转让（保理）,起始日为2025-11-20,截止日为2026-11-19,期限为1.0年',
        date: '2026-08-21',
        tags: ['应收账款融资到期', '授信'],
        stars: 5,
        fields: [
          { label: '融资额', value: '1021.053678万元' },
          { label: '币种', value: '-' },
          { label: '财产价值', value: '10210536.78元' },
          { label: '期限', value: '1.0年' },
          { label: '起始日', value: '2025-11-20' },
          { label: '截止日', value: '2026-11-19' },
          { label: '披露日期', value: '-' },
          { label: '融资类型', value: '应收账款转让（保理）' },
        ],
        desc: '北京中铁建工物资有限公司将对中建三局云采科技有限公司享有的双方签订的编号为cscec-ht2-2025082504061的合同项下壹仟零贰拾壹万零伍佰叁拾陆元柒角捌分的应收账款,通过建信融通服务平台全部转让给建行武汉省直支行。该笔应收账款对应的发票号码为25112000000247299342,共1张。',
      },
      {
        content: '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为上海银行股份有限公司北京分行,该笔融资的融资额为119.78018万,财产价值为1197801.8元,类型为应收账款转让（保理）,起始日为2025-10-23,截止日为2026-11-19,期限为1.08333333',
        date: '2026-08-21',
        tags: ['应收账款融资到期', '授信'],
        stars: 3,
        fields: [
          { label: '融资额', value: '119.78018万元' },
          { label: '币种', value: '-' },
          { label: '财产价值', value: '1197801.8元' },
          { label: '期限', value: '1.0833333333333333年' },
          { label: '起始日', value: '2025-10-23' },
          { label: '截止日', value: '2026-11-19' },
          { label: '披露日期', value: '-' },
          { label: '融资类型', value: '应收账款转让（保理）' },
        ],
        desc: '本次财产登记为债权人[北京中铁建工物资有限公司]与债务人[中国建筑第二工程局有限公司]间合计人民币[1,197,801.8]元的债权。基于债务人与[上海银行股份有限公司北京分行]签订',
      },
    ],
  },
  {
    id: '5',
    company: '北京鸿佳建筑工程有限公司',
    mark: 'blue',
    letter: '北',
    companyTags: ['民营企业', '小微企业'],
    date: '2026-08-21',
    bizType: '应收账款融资到期',
    bizTypeKind: 'red',
    value: 4,
    content:
      '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为中国农业银行股份有限公司北京海淀区支行,该笔融资的融资额为2.2103645万,人民币,财产价值为0元,类型为应收账款转让（保理）,起始日为2022-12-20,截止日为2026-11-19,期限为3.',
    bizTags: ['授信'],
    companyBizCount: 7,
    detailFields: [
      { label: '商机类型', value: '应收账款融资到期' },
      { label: '商机价值', value: '★★★★☆' },
      { label: '商机内容', value: '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为中国农业银行股份有限公司北京海淀区支行,该笔融资的融资额为2.2103645万,人民币,财产价值为0元,类型为应收账款转让（保理）,起始日为2022-12-20,截止日为2026-11-19,期限为3.' },
    ],
  },
  {
    id: '6',
    company: '北京艺苑风景园林工程有限公司',
    mark: 'green',
    companyTags: ['民营企业', '小微企业'],
    date: '2026-08-21',
    bizType: '应收账款转让（保理）',
    bizTypeKind: 'red',
    value: 3,
    content:
      '将于2026-08-21发生应收账款转让（保理）到期事件，出让人为北京艺苑风景园林工程有限公司，受让人为保利商业保理有限公司，该笔质押的金额为0元，对应财产价值为27910107.62元，登记类型为初始登记，期限为1.083333333333333年',
    bizTags: [],
    companyBizCount: 11,
    detailFields: [
      { label: '商机类型', value: '应收账款转让（保理）' },
      { label: '商机价值', value: '★★★☆☆' },
      { label: '商机内容', value: '将于2026-08-21发生应收账款转让（保理）到期事件，出让人为北京艺苑风景园林工程有限公司，受让人为保利商业保理有限公司，该笔质押的金额为0元，对应财产价值为27910107.62元，登记类型为初始登记，期限为1.083333333333333年' },
    ],
  },
  {
    id: '7',
    company: '鑫方盛数智科技股份有限公司',
    mark: 'red',
    companyTags: ['民营企业'],
    date: '2026-08-21',
    bizType: '应收账款转让（保理）',
    bizTypeKind: 'red',
    value: 3,
    content:
      '将于2026-08-21发生应收账款转让（保理）到期事件，出让人为鑫方盛数智科技股份有限公司，受让人为浙商银行股份有限公司武汉分行，主合同金额11383.53元，登记种类为初始登记，登记期限为0.83年',
    bizTags: [],
    companyBizCount: 9,
    detailFields: [
      { label: '出让人名称', value: '鑫方盛数智科技股份有限公司' },
      { label: '受让人名称', value: '浙商银行股份有限公司武汉分行' },
      { label: '主合同金额', value: '11383.53元' },
      { label: '登记种类', value: '初始登记' },
      { label: '登记期限', value: '0.83年' },
      { label: '登记时间', value: '2025-10-22' },
      { label: '登记到期日', value: '2026-08-21' },
      {
        label: '转让财产描述',
        value:
          '鑫方盛数智科技股份有限公司在中建三局金融通平台持有的编号为2025101700071电子债权凭证(原始债务人中建三局云采供应链有限公司,原始债权人鑫方盛数智科技股份有限公司,原始凭证编号2025101700071,原始凭证金额11383.53元,对应合同编号(cscec3b-yczy2024107),对应发票号(25112000000219704312))凭证金额为11383.53元已办理相应转让业务,相关权利主体对该电子债权凭证享有所有权。',
      },
    ],
  },
]

/* 各企业画像（演示用，覆盖筛选维度） */
const PROFILE_MAP: Record<string, CompanyProfile> = {
  '1': { province: '北京市', industry: '建筑安装业', capital: '民营控股', entType: '有限责任公司', org: '无', cert: '消防资质', listed: '非上市', scale: '中型企业', insured: 86, regCapital: 6008, founded: '1998-04-15', qixinScore: 882, dishonest: 0, executed: 2, zhongben: 0 },
  '2': { province: '北京市', industry: '建筑装饰业', capital: '民营控股', entType: '有限责任公司', org: '无', cert: '无', listed: '非上市', scale: '小微企业', insured: 42, regCapital: 3000, founded: '2015-06-10', qixinScore: 791, dishonest: 0, executed: 0, zhongben: 1 },
  '3': { province: '北京市', industry: '科技推广和应用服务业', capital: '港澳台投资', entType: '有限责任公司', org: '无', cert: '高新技术企业', listed: '非上市', scale: '小微企业', insured: 28, regCapital: 1669, founded: '2022-11-22', qixinScore: 905, dishonest: 0, executed: 0, zhongben: 0 },
  '4': { province: '北京市', industry: '批发业', capital: '国有控股', entType: '有限责任公司', org: '无', cert: '无', listed: '非上市', scale: '大型企业', insured: 320, regCapital: 50000, founded: '2008-03-18', qixinScore: 935, dishonest: 0, executed: 5, zhongben: 0 },
  '5': { province: '北京市', industry: '房屋建筑业', capital: '民营控股', entType: '有限责任公司', org: '无', cert: '无', listed: '非上市', scale: '小微企业', insured: 53, regCapital: 12000, founded: '2010-09-02', qixinScore: 768, dishonest: 1, executed: 3, zhongben: 2 },
  '6': { province: '北京市', industry: '土木工程建筑业', capital: '民营控股', entType: '有限责任公司', org: '无', cert: '风景园林资质', listed: '非上市', scale: '小微企业', insured: 61, regCapital: 8000, founded: '2012-04-25', qixinScore: 802, dishonest: 0, executed: 1, zhongben: 0 },
  '7': { province: '北京市', industry: '零售业', capital: '民营控股', entType: '股份有限公司', org: '无', cert: '无', listed: '非上市', scale: '中型企业', insured: 140, regCapital: 35000, founded: '2014-07-30', qixinScore: 870, dishonest: 0, executed: 2, zhongben: 0 },
}

const bizRowsWithProfile: BizRow[] = bizRows.map((r) => ({ ...r, profile: PROFILE_MAP[r.id] }))

/* ============ 全公司共享的商机列表（演示用，统一一份） ============ */
interface CompanyBizItem {
  content: string
  date: string
  tags: string[]
  stars: number
  bizType: string
  bizGroup: string
  bizOpp: string
  fields: { label: string; value: string }[]
  desc?: string
}

const SHARED_COMPANY_BIZ: CompanyBizItem[] = [
  {
    content: '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为交通银行股份有限公司武汉东湖新技术开发区支行,该笔融资的融资额为0万,财产价值为4690520.97元,类型为应收账款转让（保理）,起始日为2025-11-20,截止日为2026-11-19,期限为1.0年',
    date: '2026-08-21',
    tags: ['应收账款融资到期', '授信'],
    stars: 4,
    bizType: '应收账款融资到期',
    bizGroup: '融资担保到期',
    bizOpp: '授信',
    fields: [
      { label: '融资额', value: '0万元' },
      { label: '币种', value: '-' },
      { label: '财产价值', value: '4690520.97元' },
      { label: '期限', value: '1.0年' },
      { label: '起始日', value: '2025-11-20' },
      { label: '截止日', value: '2026-11-19' },
      { label: '披露日期', value: '-' },
      { label: '融资类型', value: '应收账款转让（保理）' },
    ],
    desc: '根据北京中铁建工物资有限公司(下称卖方)与中建三局集团有限公司(下称买方)于2024年1月签订的合同编号为"cscec-ht2-2024010808027"的《国家矿产资源综合利用技术创新基地项目钢筋物资采购(执行)合同》,卖方将该合同项下产生的应收账款人民币4,690,520.97元(发票号码25112000000137512733,共计1张)转让给我行,用于北京中铁建工物资有限公司在我行办理人民币4,690,520.97元国内保理业务。',
  },
  {
    content: '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为中国建设银行股份有限公司武汉省直支行,该笔融资的融资额为1021.053678万,财产价值为10210536.78元,类型为应收账款转让（保理）,起始日为2025-11-20,截止日为2026-11-19,期限为1.0年',
    date: '2026-08-21',
    tags: ['应收账款融资到期', '授信'],
    stars: 5,
    bizType: '应收账款融资到期',
    bizGroup: '融资担保到期',
    bizOpp: '授信',
    fields: [
      { label: '融资额', value: '1021.053678万元' },
      { label: '币种', value: '-' },
      { label: '财产价值', value: '10210536.78元' },
      { label: '期限', value: '1.0年' },
      { label: '起始日', value: '2025-11-20' },
      { label: '截止日', value: '2026-11-19' },
      { label: '披露日期', value: '-' },
      { label: '融资类型', value: '应收账款转让（保理）' },
    ],
    desc: '北京中铁建工物资有限公司将对中建三局云采科技有限公司享有的双方签订的编号为cscec-ht2-2025082504061的合同项下壹仟零贰拾壹万零伍佰叁拾陆元柒角捌分的应收账款,通过建信融通服务平台全部转让给建行武汉省直支行。该笔应收账款对应的发票号码为25112000000247299342,共1张。',
  },
  {
    content: '将于2026-11-19发生应收账款融资到期事件,质权人/受让人为上海银行股份有限公司北京分行,该笔融资的融资额为119.78018万,财产价值为1197801.8元,类型为应收账款转让（保理）,起始日为2025-10-23,截止日为2026-11-19,期限为1.08333333',
    date: '2026-08-21',
    tags: ['应收账款融资到期', '授信'],
    stars: 3,
    bizType: '应收账款融资到期',
    bizGroup: '融资担保到期',
    bizOpp: '授信',
    fields: [
      { label: '融资额', value: '119.78018万元' },
      { label: '币种', value: '-' },
      { label: '财产价值', value: '1197801.8元' },
      { label: '期限', value: '1.0833333333333333年' },
      { label: '起始日', value: '2025-10-23' },
      { label: '截止日', value: '2026-11-19' },
      { label: '披露日期', value: '-' },
      { label: '融资类型', value: '应收账款转让（保理）' },
    ],
    desc: '本次财产登记为债权人[北京中铁建工物资有限公司]与债务人[中国建筑第二工程局有限公司]间合计人民币[1,197,801.8]元的债权。基于债务人与[上海银行股份有限公司北京分行]签订',
  },
]

/* ============ 关联营销抽屉（来自 区域商机 - 列表 - 关联营销弹窗.html） ============ */
function RelationBizDrawer({ row, onClose }: { row: BizRow | null; onClose: () => void }) {
  const [cat, setCat] = useState('全部')
  const tabs = [
    { key: '全部', n: 242 }, { key: '董监高法', n: 3 }, { key: '个人股东', n: 0 },
    { key: '法人股东', n: 1 }, { key: '投资企业', n: 3 }, { key: '供应链企业', n: 234 },
    { key: '担保企业', n: 0 }, { key: '共同知识产权', n: 1 },
  ]
  const showCat = (k: string) => cat === '全部' || cat === k
  const th = 'bg-[#F7F8FA] text-[#4E5969] font-semibold text-[13px] text-left px-3 py-2 border-b border-[#E5E6EB] whitespace-nowrap'
  const td = 'px-3 py-2 border-b border-[#F2F3F5] text-[13px] text-[#1D2129] align-middle'
  const link = 'text-[#165DFF]'
  return (
    <RightDrawer open={!!row} title={row ? `${row.company} - 关联营销` : ''} width={860} level={2} onClose={onClose}>
      {row && (
        <div>
          {/* 企业头部 */}
          <div className="flex items-center gap-3 pb-4 border-b border-[#E5E6EB]">
            <div className="w-14 h-14 rounded-full border-2 border-[#C8161D] flex items-center justify-center text-[#C8161D] font-bold text-xs">CRCC</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[22px] font-bold text-[#1D2129]">{row.company}</span>
                <span className="px-2 py-0.5 border border-[#00B42A] text-[#00B42A] text-[13px] rounded">存续</span>
              </div>
              <div className="flex items-center gap-6 text-[#4E5969] text-[15px] mt-1">
                <span>法人：张加宾</span>
                <span>注册资本：50000万元人民币</span>
                <span>成立时间：1993-12-31</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="h-10 px-5 border border-[#C9CDD4] rounded text-[15px] bg-white">查看工商详情</button>
              <button className="h-10 px-5 bg-[#F7BA1E] text-[#1D2129] font-semibold rounded">下载商机/风险信息</button>
            </div>
          </div>

          {/* 营销统计卡片 */}
          <div className="grid grid-cols-4 gap-4 py-4">
            {[['关联营销', 242], ['集团营销', 74369], ['相似营销', 1], ['位置营销', 6689]].map(([t, n]) => (
              <div key={t as string} className="border border-[#E5E6EB] rounded-lg p-4 cursor-pointer hover:border-[#165DFF]">
                <div className="text-[17px] font-semibold text-[#1D2129]">{t}</div>
                <div className="text-[34px] font-bold text-[#165DFF] leading-tight">{n}<span className="text-[16px] font-normal text-[#4E5969] ml-1">条</span></div>
              </div>
            ))}
          </div>

          {/* 关联营销 */}
          <div className="flex items-center gap-3 mt-2 mb-3">
            <span className="w-1 h-5 bg-[#F7BA1E] rounded" />
            <span className="text-[18px] font-bold text-[#1D2129]">关联营销</span>
            <span className="text-[15px] text-[#86909C]">找到 <span className="text-[#FF7D00] font-semibold">242</span> 条结果</span>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {tabs.map((t) => (
              <span key={t.key} onClick={() => setCat(t.key)}
                className={`px-3 py-1.5 border rounded text-[14px] cursor-pointer ${cat === t.key ? 'text-[#165DFF] font-semibold bg-transparent border-transparent' : 'text-[#4E5969] border-[#E5E6EB]'}`}>
                {t.key}{t.n}
              </span>
            ))}
          </div>

          {showCat('董监高法') && (
            <>
              <div className="text-[17px] font-semibold text-[#1D2129] py-3">董监高法 3</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[640px]">
                  <thead><tr>
                    <th className={th}>姓名</th><th className={th}>当前任职</th><th className={th}>持股比例</th><th className={th}>关联企业</th><th className={th}>关联企业最新商机</th>
                  </tr></thead>
                  <tbody>
                    <tr><td className={td}>裴吉星</td><td className={td}>经理</td><td className={td}>－</td><td className={td}>4</td><td className={td}>"裴吉星"任职"经理"的企业"中铁建设集团北京工程有限公司"，于2026-08-20发生国/央企工程类项目招标</td></tr>
                    <tr><td className={td}>吴金纺</td><td className={td}>财务负责人</td><td className={td}>－</td><td className={td}>2</td><td className={td}>"吴金纺"任职"财务负责人"的企业"中铁建设集团供应链管理（青岛）有限公司"，暂无最新商机</td></tr>
                    <tr><td className={td}>张加宾</td><td className={td}>法定代表人、董事</td><td className={td}>－</td><td className={td}>3</td><td className={td}>"张加宾"任职"董事长"的企业"中铁建设集团供应链管理（青岛）有限公司"，暂无最新商机</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {showCat('法人股东') && (
            <>
              <div className="text-[17px] font-semibold text-[#1D2129] py-3">法人股东 1</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[760px]">
                  <thead><tr><th className={th}>股东名称</th><th className={th}>持股比例</th><th className={th}>成立日期</th><th className={th}>注册资本</th><th className={th}>所在区域</th><th className={th}>最新商机</th></tr></thead>
                  <tbody>
                    <tr><td className={`${td} ${link}`}>中铁建设集团有限公司</td><td className={td}>100%</td><td className={td}>1979-08-01</td><td className={td}>420297.09万元人民币</td><td className={td}>北京市石景山区</td><td className={`${td} ${link}`}>2026-08-20发生中标政府项目</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {showCat('投资企业') && (
            <>
              <div className="text-[17px] font-semibold text-[#1D2129] py-3">投资企业 3</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[760px]">
                  <thead><tr><th className={th}>企业名称</th><th className={th}>投资比例</th><th className={th}>成立日期</th><th className={th}>注册资本</th><th className={th}>所在区域</th><th className={th}>最新商机</th></tr></thead>
                  <tbody>
                    <tr><td className={`${td} ${link}`}>中铁建设集团供应链管理（青岛）有限公司</td><td className={td}>65.00%</td><td className={td}>2023-02-27</td><td className={td}>5000万元人民币</td><td className={td}>山东青岛市城阳区</td><td className={td}>－</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {showCat('供应链企业') && (
            <>
              <div className="text-[17px] font-semibold text-[#1D2129] py-3">供应链企业 234</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[760px]">
                  <thead><tr><th className={th}>企业名称</th><th className={th}>类型</th><th className={th}>成立日期</th><th className={th}>注册资本</th><th className={th}>所在区域</th><th className={th}>最新商机</th></tr></thead>
                  <tbody>
                    {[
                      ['中交三航局第六工程（厦门）有限公司', '采购方', '2015-05-04', '30000万元人民币', '福建厦门市湖里区', '2026-08-14发生国/央企工程类项目招标'],
                      ['中交二航局第二工程有限公司', '采购方', '2005-09-23', '38010万元人民币', '重庆市渝中区', '2026-08-18发生国/央企工程类项目招标'],
                      ['河南奥克斯智能电气有限公司', '采购方', '2018-12-06', '60000万元人民币', '河南郑州市上街区', '2026-08-11发生新拟建项目'],
                      ['中铁十五局集团有限公司', '采购方', '2001-04-02', '303480万元人民币', '上海市静安区', '2026-08-19发生新增中标'],
                      ['水发建设集团有限公司', '采购方', '2018-11-07', '100000万元人民币', '山东济南市历城区', '2025-11-05发生对外投资'],
                    ].map((r, i) => (
                      <tr key={i}><td className={`${td} ${link}`}>{r[0]}</td><td className={td}>{r[1]}</td><td className={td}>{r[2]}</td><td className={td}>{r[3]}</td><td className={td}>{r[4]}</td><td className={`${td} ${link}`}>{r[5]}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-2 py-3 text-[13px] text-[#4E5969]">
                <span>共 234 条</span>
                <button className="px-2 py-1 border border-[#E5E6EB] rounded bg-white">5条/页</button>
                <span className="px-2 py-1 border border-[#E5E6EB] rounded">{'<'}</span>
                <span className="px-2 py-1 border border-[#F7BA1E] bg-[#F7BA1E] text-[#1D2129] rounded">1</span>
                <span className="px-2 py-1 border border-[#E5E6EB] rounded">2</span>
                <span className="px-2 py-1 border border-[#E5E6EB] rounded">3</span>
                <span className="px-2 py-1 border border-[#E5E6EB] rounded">4</span>
                <span>···</span>
                <span className="px-2 py-1 border border-[#E5E6EB] rounded">47</span>
                <span className="px-2 py-1 border border-[#E5E6EB] rounded">{'>'}</span>
              </div>
            </>
          )}

          {showCat('共同知识产权') && (
            <>
              <div className="text-[17px] font-semibold text-[#1D2129] py-3">共同知识产权 1</div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-[760px]">
                  <thead><tr><th className={th}>企业名称</th><th className={th}>类型</th><th className={th}>成立日期</th><th className={th}>注册资本</th><th className={th}>所在区域</th><th className={th}>最新商机</th></tr></thead>
                  <tbody>
                    <tr><td className={`${td} ${link}`}>中铁建设集团有限公司</td><td className={td}>共同专利权人</td><td className={td}>1979-08-01</td><td className={td}>420297.09万元人民币</td><td className={td}>北京市石景山区</td><td className={`${td} ${link}`}>2026-08-20发生中标政府项目</td></tr>
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* 集团营销 */}
          <div className="flex items-center gap-3 mt-4 mb-3">
            <span className="w-1 h-5 bg-[#F7BA1E] rounded" />
            <span className="text-[18px] font-bold text-[#1D2129]">集团营销</span>
            <span className="text-[15px] text-[#86909C]">找到 <span className="text-[#FF7D00] font-semibold">74369</span> 条结果</span>
          </div>
          <div className="flex flex-wrap gap-10 bg-[#F0F7FF] rounded-md px-5 py-3 text-[15px]">
            <span>所在集团：<span className={link}>中国铁道建筑集团</span></span>
            <span>集团成员数：<span className="text-[#165DFF] font-semibold">8252</span></span>
            <span>集团主体企业：中国铁道建筑集团有限公司</span>
          </div>
          <div className="text-[17px] font-semibold text-[#1D2129] py-3">集团成员</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[760px]">
              <thead><tr><th className={th}>公司名称</th><th className={th}>经营状态</th><th className={th}>注册资本</th><th className={th}>成立时间</th><th className={th}>成员级别(实控人)</th><th className={th}>行业</th></tr></thead>
              <tbody>
                {[
                  ['中国铁建股份有限公司', '2007-11-05', '1,357,954.15万元人民币', '1级', '土木工程建筑业'],
                  ['中国铁建投资集团有限公司', '2011-05-04', '1,206,708.61万元人民币', '2级', '商务服务业'],
                  ['中国铁道建筑集团有限公司', '1990-08-28', '904,629.64万元人民币', '0级', '土木工程建筑业'],
                  ['中国铁建财务有限公司', '1988-04-08', '900,000万元人民币', '1级', '货币金融服务'],
                  ['中国铁建房地产集团有限公司', '2007-04-20', '700,000万元人民币', '2级', '房地产业'],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className={`${td} ${link}`}>{r[0]}</td>
                    <td className={td}><span className="px-2 py-0.5 border border-[#00B42A] text-[#00B42A] text-[13px] rounded">存续</span></td>
                    <td className={td}>{r[2]}</td><td className={td}>{r[1]}</td><td className={td}>{r[3]}</td><td className={td}>{r[4]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="text-[17px] font-semibold text-[#1D2129] py-3">集团营销</div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[760px]">
              <thead><tr><th className={th}>企业名称</th><th className={th}>发生日期</th><th className={th}>商机类型</th><th className={th}>商机价值</th><th className={th}>商机内容</th><th className={th}>操作</th></tr></thead>
              <tbody>
                <tr>
                  <td className={`${td} ${link}`}>北京中铁建工物资有限公司</td>
                  <td className={td}>2026-08-21</td>
                  <td className={td}><span className="px-2 py-0.5 bg-[#E8F3FF] text-[#165DFF] text-[13px] rounded">应收账款融资到期</span></td>
                  <td className={td}>★★★★★</td>
                  <td className={td}>将于2026-11-19发生应收账...</td>
                  <td className={td}><span className={link}>授信</span>　<span className={link}>公司商机 1,795</span></td>
                </tr>
                <tr>
                  <td className={`${td} ${link}`}>中铁二十三局集团第四工程有限公司</td>
                  <td className={td}>2026-08-21</td>
                  <td className={td}><span className="px-2 py-0.5 bg-[#E8F3FF] text-[#165DFF] text-[13px] rounded">应收账款融资到期</span></td>
                  <td className={td}>★★★★★</td>
                  <td className={td}>将于2026-11-19发生应收账...</td>
                  <td className={td}><span className={link}>授信</span>　<span className={link}>公司商机 164</span></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 位置营销 */}
          <div className="flex items-center gap-3 mt-4 mb-3">
            <span className="w-1 h-5 bg-[#F7BA1E] rounded" />
            <span className="text-[18px] font-bold text-[#1D2129]">位置营销</span>
            <span className="text-[15px] text-[#86909C]">找到 <span className="text-[#FF7D00] font-semibold">6689</span> 条结果</span>
          </div>
          <div className="flex flex-wrap gap-10 bg-[#F0F7FF] rounded-md px-5 py-3 text-[15px]">
            <span>所在位置：北京市石景山区苹果园路28号院2号楼17层1701至1707室</span>
            <span>周边范围：1km</span>
          </div>
          <div className="overflow-x-auto mt-3">
            <table className="w-full border-collapse min-w-[900px]">
              <thead><tr><th className={th}>企业名称</th><th className={th}>法定代表人</th><th className={th}>成立时间</th><th className={th}>所在行业</th><th className={th}>注册资本</th><th className={th}>经营状态</th><th className={th}>企业健康度</th></tr></thead>
              <tbody>
                {[
                  ['北京中铁建工物资有限公司', '张加宾', '1993-12-31', '批发业', '50000 万人民币', '存续（在营、开业、在册）', '56'],
                  ['北京卡宾滑雪体育发展集团股份有限公司', '张鸿俊', '2010-07-20', '体育', '7235.3883 万人民币', '存续（在营、开业、在册）', '416'],
                  ['北京有信怡家科技有限公司', '吴相晓', '2015-12-15', '科技推广和应用服务业', '5000 万人民币', '吊销', '－'],
                  ['北京银建小额贷款股份有限公司', '杨华', '2016-04-18', '货币金融服务', '20000 万人民币', '存续（在营、开业、在册）', '47'],
                  ['中招国信（北京）招标有限公司', '陈绪光', '2009-11-09', '专业技术服务业', '400 万人民币', '存续（在营、开业、在册）', '47'],
                ].map((r, i) => (
                  <tr key={i}>
                    <td className={`${td} ${r[5].startsWith('存续') ? '' : 'text-[#F53F3F]'}`}>{r[0]}</td>
                    <td className={td}>{r[1]}</td><td className={td}>{r[2]}</td><td className={td}>{r[3]}</td><td className={td}>{r[4]}</td>
                    <td className={td}>{r[5]}</td><td className={td}>{r[6]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </RightDrawer>
  )
}

/* ============ 主组件 ============ */
export default function DmRegionalBiz() {
  const [selectedRegion, setSelectedRegion] = useState('beijing')
  const [activeTab, setActiveTab] = useState<'ai' | 'model' | 'manage'>('model')
  const [detail, setDetail] = useState<BizRow | null>(null)
  const [contact, setContact] = useState<BizRow | null>(null)
  const [companyBiz, setCompanyBiz] = useState<BizRow | null>(null)
  const [relationBiz, setRelationBiz] = useState<BizRow | null>(null)
  const [bizOpp, setBizOpp] = useState('不限')
  const [bizType, setBizType] = useState('')
  const [bizValue, setBizValue] = useState('不限')
  const [filters, setFilters] = useState<Record<string, string>>({
    date: '不限', value: '不限', bizOpp: '不限', bizType: '不限',
    province: '不限', industry: '不限', capital: '不限', entType: '不限', org: '不限',
    cert: '不限', listed: '不限', scale: '不限', insured: '不限', regCapital: '不限',
    founded: '不限', qixin: '不限', dishonest: '不限', executed: '不限', zhongben: '不限',
  })
  const setFilter = (k: string, v: string) => setFilters((s) => ({ ...s, [k]: v }))
  const clearFilters = () =>
    setFilters({ date: '不限', value: '不限', bizOpp: '不限', bizType: '不限', province: '不限', industry: '不限', capital: '不限', entType: '不限', org: '不限', cert: '不限', listed: '不限', scale: '不限', insured: '不限', regCapital: '不限', founded: '不限', qixin: '不限', dishonest: '不限', executed: '不限', zhongben: '不限' })
  const filteredBizRows = useMemo(() => {
    return bizRowsWithProfile.filter((r) => {
      const p = r.profile!
      if (filters.date !== '不限') {
        const days = { '最近1个月': 30, '最近3个月': 90, '最近6个月': 180, '最近1年': 365 }[filters.date] ?? 0
        const d = (new Date('2026-08-21').getTime() - new Date(r.date).getTime()) / 86400000
        if (d > days) return false
      }
      if (filters.value !== '不限' && r.value !== parseInt(filters.value)) return false
      if (filters.bizOpp !== '不限' && !r.bizTags.includes(filters.bizOpp) && filters.bizOpp !== '其他') return false
      if (filters.bizType !== '不限' && r.bizType !== filters.bizType) return false
      if (filters.province !== '不限' && p.province !== filters.province) return false
      if (filters.industry !== '不限' && p.industry !== filters.industry) return false
      if (filters.capital !== '不限' && p.capital !== filters.capital) return false
      if (filters.entType !== '不限' && p.entType !== filters.entType) return false
      if (filters.org !== '不限' && p.org !== filters.org) return false
      if (filters.cert !== '不限' && p.cert !== filters.cert) return false
      if (filters.listed !== '不限' && p.listed !== filters.listed) return false
      if (filters.scale !== '不限' && p.scale !== filters.scale) return false
      if (!inRange(p.insured, filters.insured)) return false
      if (!inRange(p.regCapital, filters.regCapital)) return false
      if (filters.founded !== '不限') {
        const y = parseInt(p.founded.slice(0, 4))
        if (filters.founded === '2020年以后' && y <= 2020) return false
        if (filters.founded === '2010-2019年' && (y < 2010 || y > 2019)) return false
        if (filters.founded === '2000-2009年' && (y < 2000 || y > 2009)) return false
        if (filters.founded === '2000年以前' && y >= 2000) return false
      }
      if (!inRange(p.qixinScore, filters.qixin)) return false
      if (filters.dishonest !== '不限') {
        const isD = p.dishonest > 0
        if (filters.dishonest === '是' && !isD) return false
        if (filters.dishonest === '否' && isD) return false
      }
      if (!inRange(p.executed, filters.executed)) return false
      if (!inRange(p.zhongben, filters.zhongben)) return false
      return true
    })
  }, [filters])
  const filteredCompanyBiz = useMemo(() => {
    return SHARED_COMPANY_BIZ.filter((b) => {
      if (bizOpp !== '不限' && b.bizOpp !== bizOpp) return false
      if (bizValue !== '不限' && b.stars !== parseInt(bizValue)) return false
      if (bizType) {
        if (BIZ_TYPE_GROUP_OF[bizType]) {
          if (b.bizType !== bizType) return false
        } else if (b.bizGroup !== bizType) return false
      }
      return true
    })
  }, [bizOpp, bizType, bizValue])
  const [cunke, setCunke] = useState(false)
  const [mapSearchOpen, setMapSearchOpen] = useState(false)
  const [mapFilters, setMapFilters] = useState<Record<string, string>>(
    Object.fromEntries(MAP_FILTER_FIELDS.map((f) => [f.key, f.control === 'select' ? (f.options?.[0] ?? '不限') : '']))
  )
  const setMapFilter = (k: string, v: string) => setMapFilters((s) => ({ ...s, [k]: v }))
  const resetMapFilters = () => setMapFilters(Object.fromEntries(MAP_FILTER_FIELDS.map((f) => [f.key, f.control === 'select' ? (f.options?.[0] ?? '不限') : ''])))

  const barRef = useRef<HTMLDivElement>(null)
  const horizontalBarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let inst: echarts.ECharts | null = null
    if (barRef.current) {
      inst = echarts.init(barRef.current)
      inst.setOption({
        xAxis: { type: 'category', data: ['海淀区', '朝阳区', '丰台区', '大兴区', '通州区'] },
        yAxis: { type: 'value', max: 50000 },
        tooltip: { trigger: 'axis' },
        series: [{ type: 'bar', data: [47124, 26010, 24548, 23616, 18694], itemStyle: { color: '#8b5cf6' } }],
      })
      const resize = () => inst?.resize()
      window.addEventListener('resize', resize)
      return () => { inst?.dispose(); window.removeEventListener('resize', resize) }
    }
  }, [])
  useEffect(() => {
    let inst: echarts.ECharts | null = null
    if (horizontalBarRef.current) {
      inst = echarts.init(horizontalBarRef.current)
      inst.setOption({
        tooltip: {},
        grid: { left: 80 },
        xAxis: { type: 'value' },
        yAxis: { type: 'category', data: ['民营', '小微企业', '科技企业', '国企', '事业单位', '上市公司'] },
        series: [{
          type: 'bar',
          data: [
            { value: 36, label: { formatter: '128,896家 36%' } },
            { value: 23, label: { formatter: '83,629家 23%' } },
            { value: 18, label: { formatter: '64,475家 18%' } },
            { value: 16, label: { formatter: '59,164家 16%' } },
            { value: 5, label: { formatter: '16,710家 5%' } },
            { value: 2, label: { formatter: '6,127家 2%' } },
          ],
          itemStyle: { color: '#6096ff' },
          label: { show: true, position: 'right' },
        }],
      })
      const resize = () => inst?.resize()
      window.addEventListener('resize', resize)
      return () => { inst?.dispose(); window.removeEventListener('resize', resize) }
    }
  }, [])

  const columns: Column[] = [
    {
      key: 'company',
      label: '企业名称',
      render: (r: Row) => {
        const row = r as BizRow
        return (
          <div>
            <div className="flex items-center cursor-pointer hover:text-brand-600" onClick={() => setCompanyBiz(row)}>
              <CompanyMark kind={row.mark} letter={row.letter} />
              {row.company}
            </div>
            <div className="text-xs mt-1 text-blue-600">{row.companyTags.join('  ')}</div>
          </div>
        )
      },
    },
    { key: 'date', label: '发生日期', render: (r: Row) => (r as BizRow).date },
    {
      key: 'bizType',
      label: '商机类型',
      render: (r: Row) => {
        const row = r as BizRow
        return <BizTypeTag text={row.bizType} kind={row.bizTypeKind} />
      },
    },
    { key: 'value', label: '商机价值', render: (r: Row) => <Stars n={(r as BizRow).value} /> },
    {
      key: 'content',
      label: '商机内容',
      render: (r: Row) => {
        const row = r as BizRow
        return (
          <div
            className="text-xs text-slate-600 cursor-pointer hover:text-brand-600"
            onClick={() => setDetail(row)}
            title="点击查看商机详情"
          >
            {row.content}
            {row.bizTags.length > 0 && <span className="text-brand-600 ml-1">{row.bizTags.join(' ')}</span>}
          </div>
        )
      },
    },
    {
      key: 'op',
      label: '操作 AI',
      render: (r: Row) => {
        const row = r as BizRow
        return (
          <div className="text-xs text-brand-600 space-x-2 whitespace-nowrap">
            <span className="cursor-pointer hover:underline" onClick={() => setCompanyBiz(row)}>公司商机{row.companyBizCount}</span>
            <span className="cursor-pointer hover:underline" onClick={() => setRelationBiz(row)}>关联营销</span>
            <span className="cursor-pointer hover:underline" onClick={() => setContact(row)}>AI触达</span>
          </div>
        )
      },
    },
  ]

  return (
    <div className="font-sans text-[14px] text-[#333]">
      <PageHeader
        title="区域商机"
        crumb="数字营销 / 区域商机"
      />

      {/* ========== 区域商机概览（保留已有统计/地图/图表） ========== */}
      <div className="mt-4 px-6">
        <div className="flex items-center gap-3 mb-2">
          <select
            className="border border-gray-300 rounded px-2 py-1.5 text-sm"
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
          >
            {regionOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <p className="text-base">
            北京有商机的企业<span className="text-[#0066cc]">1,013,478</span>家；有效商机<span className="text-[#0066cc]">7,376,451</span>条
          </p>
        </div>
        <p className="text-sm mt-1 text-slate-500">北京有商机企业占本市全部在营企业的41.1%；商机数占全国商机数的3.2%</p>
        <div className="border-b border-dashed border-[#b8d8ff] my-2"></div>
        <p className="text-sm mt-2 text-slate-500">
          • 全国近三年商机数：230,736,322；近一年商机数：118,709,353；其中大型企业135,648家、中型企业269,696家、小微企业26,925,206家、规模以上企业1,447,344家
        </p>
        <p className="text-sm mt-1 text-slate-500">
          • 全国商机分布TOP10的地区：1 广东省 13.1%、2 山东省 7.2%、3 江苏省 6.3%、4 新疆维吾尔自治区 5.5%、5 浙江省 5.2%、6 湖北省 5.0%、7 湖南省 4.6%、8 四川省 4.4%、9 安徽省 3.8%、10 重庆市 3.6%
        </p>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-5">
            <div style={{ width: '100%', height: '400px', border: '1px solid #eee', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', fontSize: '16px', background: '#fafafa' }}>
              北京地图
              <button
                className="absolute top-3 right-3 bg-[#165DFF] text-white text-sm rounded px-3 py-1.5 shadow hover:bg-[#0E42D2]"
                onClick={() => setMapSearchOpen(true)}
              >
                <i className="fa fa-map-marker mr-1" /> 圈选搜索
              </button>
            </div>
          </div>
          <div className="col-span-7">
            <div className="font-medium mb-2">|区域商机统计</div>
            {/* 日期查询 + 翻页 */}
            <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">日期</span>
                <input type="date" className="border border-gray-300 rounded px-2 py-1 text-xs" />
                <span className="text-xs text-slate-400">至</span>
                <input type="date" className="border border-gray-300 rounded px-2 py-1 text-xs" />
                <button className="border border-gray-300 rounded px-2 py-1 text-xs bg-white hover:border-brand-500 cursor-pointer">查询</button>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <button className="border border-gray-300 rounded px-2 py-0.5 hover:border-brand-500 cursor-pointer">&lt;</button>
                <button className="bg-brand-600 text-white border border-brand-600 rounded px-2 py-0.5">1</button>
                <button className="border border-gray-300 rounded px-2 py-0.5 hover:border-brand-500 cursor-pointer">2</button>
                <button className="border border-gray-300 rounded px-2 py-0.5 hover:border-brand-500 cursor-pointer">3</button>
                <button className="border border-gray-300 rounded px-2 py-0.5 hover:border-brand-500 cursor-pointer">&gt;</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['北京', '全部商机', '国企', '事业单位', '民营', '上市公司', '科技企业', '小微企业'].map((h) => (
                      <th key={h} className="border border-gray-200 bg-gray-50 px-2 py-1 text-center">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['海淀区', '47,124条', '13,639条', '6,185条', '24,355条', '2,135条', '21,983条', '14,273条'],
                    ['朝阳区', '26,010条', '6,015条', '2,770条', '13,353条', '563条', '5,696条', '9,880条'],
                    ['丰台区', '24,548条', '8,477条', '588条', '13,706条', '990条', '6,785条', '8,896条'],
                    ['大兴区', '23,616条', '5,009条', '506条', '15,757条', '158条', '6,294条', '8,020条'],
                    ['通州区', '18,694条', '1,852条', '678条', '13,301条', '96条', '2,990条', '7,769条'],
                  ].map((tr, i) => (
                    <tr key={i}>
                      {tr.map((td, j) => (
                        <td key={j} className="border border-gray-200 px-2 py-1 text-center">{td}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4 mt-4">
          <div className="col-span-6">
            <div className="font-medium mb-2">|商机最多的地区</div>
            <div ref={barRef} style={{ width: '100%', height: '300px' }}></div>
          </div>
          <div className="col-span-6">
            <div className="font-medium mb-2">|有商机的企业画像</div>
            <div ref={horizontalBarRef} style={{ width: '100%', height: '300px' }}></div>
          </div>
        </div>
      </div>

      {/* ========== 我的产品模型 · 商机列表（设计稿 1:1） ========== */}
      <Panel className="mt-6" title="我的产品模型 · 商机列表">
        {/* 顶部 Tab */}
        <div className="flex items-center border-b border-gray-200 -mx-5 -mt-1 px-5 mb-4">
          <div className={`px-4 py-3 cursor-pointer ${activeTab === 'ai' ? '' : ''}`} onClick={() => setActiveTab('ai')}>AI推荐</div>
          <div className={`px-4 py-3 cursor-pointer border-b-2 border-[#1f47f5] font-medium ${activeTab === 'model' ? '' : ''}`} onClick={() => setActiveTab('model')}>我的产品模型</div>
          <div className="ml-auto px-4 py-3 text-brand-600 cursor-pointer" onClick={() => setActiveTab('manage')}>管理产品模型</div>
        </div>

        {/* 样例模型卡片 */}
        <div className="mb-4">
          <div className="border border-gray-200 rounded p-3 inline-block max-w-xs">
            <div className="flex justify-between items-center">
              <span className="font-medium">样例模型</span>
              <span className="text-gray-500">商机:615</span>
            </div>
            <div className="text-xs text-gray-500 mt-1">中标政府项目、新增拿地公告、新增中标...</div>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="px-4 py-3 border-y border-gray-200 -mx-5 mb-4">
          <div className="flex flex-wrap gap-x-3 gap-y-2 items-center mb-3">
            <span className="text-gray-500 shrink-0">选择商机</span>
            <FilterSelect label="发生日期" value={filters.date} options={DATE_OPTIONS} onChange={(v) => setFilter('date', v)} />
            <FilterSelect label="商机价值" value={filters.value} options={VALUE_OPTIONS} onChange={(v) => setFilter('value', v)} />
            <FilterSelect label="业务机会" value={filters.bizOpp} options={BIZ_OPP_OPTIONS} onChange={(v) => setFilter('bizOpp', v)} />
            <FilterSelect label="商机类型" value={filters.bizType} options={BIZ_TYPE_OPTIONS} onChange={(v) => setFilter('bizType', v)} />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2 items-center mb-3">
            <span className="text-gray-500 shrink-0">更多筛选</span>
            <FilterSelect label="省份地区" value={filters.province} options={PROVINCE_OPTIONS} onChange={(v) => setFilter('province', v)} />
            <FilterSelect label="所在行业" value={filters.industry} options={INDUSTRY_OPTIONS} onChange={(v) => setFilter('industry', v)} />
            <FilterSelect label="资本背景" value={filters.capital} options={CAPITAL_OPTIONS} onChange={(v) => setFilter('capital', v)} />
            <FilterSelect label="企业类型" value={filters.entType} options={ENT_TYPE_OPTIONS} onChange={(v) => setFilter('entType', v)} />
            <FilterSelect label="其他组织" value={filters.org} options={ORG_OPTIONS} onChange={(v) => setFilter('org', v)} />
            <FilterSelect label="资质标签" value={filters.cert} options={CERT_OPTIONS} onChange={(v) => setFilter('cert', v)} />
            <FilterSelect label="上市信息" value={filters.listed} options={LISTED_OPTIONS} onChange={(v) => setFilter('listed', v)} />
            <FilterSelect label="企业规模" value={filters.scale} options={SCALE_OPTIONS} onChange={(v) => setFilter('scale', v)} />
            <FilterSelect label="参保人数" value={filters.insured} options={INSURED_OPTIONS} onChange={(v) => setFilter('insured', v)} />
            <FilterSelect label="注册资本" value={filters.regCapital} options={REG_CAPITAL_OPTIONS} onChange={(v) => setFilter('regCapital', v)} />
            <FilterSelect label="成立时间" value={filters.founded} options={FOUNDED_OPTIONS} onChange={(v) => setFilter('founded', v)} />
            <FilterSelect label="企业健康度" value={filters.qixin} options={QIXIN_OPTIONS} onChange={(v) => setFilter('qixin', v)} />
            <FilterSelect label="失信被执行人" value={filters.dishonest} options={DISHONEST_OPTIONS} onChange={(v) => setFilter('dishonest', v)} />
            <FilterSelect label="被执行人" value={filters.executed} options={EXECUTED_OPTIONS} onChange={(v) => setFilter('executed', v)} />
            <FilterSelect label="终本案件" value={filters.zhongben} options={ZHONGBEN_OPTIONS} onChange={(v) => setFilter('zhongben', v)} />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-gray-500">已选</span>
            {Object.entries(filters).filter(([, v]) => v !== '不限').map(([k, v]) => (
              <span key={k} className="bg-gray-100 rounded px-2 py-0.5 text-xs flex items-center gap-1">
                {FILTER_LABEL[k]}: {v}
                <i className="fa fa-times cursor-pointer" onClick={() => setFilter(k, '不限')} />
              </span>
            ))}
            {Object.values(filters).every((v) => v === '不限') && <span className="text-xs text-gray-400">无</span>}
            <span className="ml-auto text-brand-600 cursor-pointer flex items-center gap-1" onClick={clearFilters}><i className="fa fa-refresh" />清空</span>
          </div>
        </div>

        {/* 工具栏 */}
        <div className="flex justify-between items-center mb-3">
          <span>找到 <b>{filteredBizRows.length}</b> 条结果</span>
          <div className="flex gap-3 items-center">
            <div className="relative">
              <i className="fa fa-search absolute left-2 top-1.5 text-gray-400" />
              <input type="text" placeholder="输入企业名称" className="border border-gray-300 rounded pl-8 pr-2 py-1.5 w-56" />
            </div>
            <button className="border border-gray-300 rounded px-3 py-1.5 flex items-center gap-1">AI分析商机 ▾</button>
            <button className="border border-gray-300 rounded px-3 py-1.5 flex items-center gap-1">营销 ▾</button>
          </div>
        </div>

        {/* 表格 */}
        <DataTable columns={columns} rows={filteredBizRows} pager defaultPageSize={10} />
      </Panel>

      {/* ========== 抽屉：商机详情 ========== */}
      <RightDrawer open={!!detail} onClose={() => setDetail(null)} title={detail ? `商机详情：${detail.bizType}` : ''} width={620} level={2}>
        {detail && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-lg font-medium">
                <Stars n={detail.value} />
              </div>
              <button
                className="border border-slate-300 rounded px-3 py-1 text-xs flex items-center gap-1 text-slate-600 hover:bg-slate-50"
                onClick={() => { /* 分享：占位，演示用 */ }}
              >
                <i className="fa fa-share-square-o" /> 分享
              </button>
            </div>
            <table className="w-full border-collapse border border-gray-200">
              <tbody>
                {detail.detailFields!.map((f, i) => (
                  <tr key={i}>
                    <td className="bg-slate-50 font-medium p-3 border border-gray-200 align-top w-[160px] whitespace-nowrap">{f.label}</td>
                    <td className="p-3 border border-gray-200 align-top">{f.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </RightDrawer>

      {/* ========== 弹窗：全部联系方式（AI触达） ========== */}
      <RightDrawer open={!!contact} onClose={() => setContact(null)} title={contact ? `${contact.company} - 全部联系方式` : ''} width={820} level={2}>
        {contact && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold"><i className="fa fa-wifi" /></div>
              <div>
                <span className="font-bold text-base">{contact.company}</span>
                <span className="bg-green-100 text-green-700 text-xs px-1.5 py-0.5 rounded ml-1">存续</span>
                <div className="text-xs text-gray-500 mt-1">6,008 万人民币 | 1998-04-15 | 建筑安装业</div>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-3">
                <div className="font-medium text-base">全部联系方式</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">AI 分析</Button>
                  <Button size="sm" variant="secondary"><i className="fa fa-download" /> 下载</Button>
                </div>
              </div>
              <div className="space-y-2 mb-4 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span>联系类型</span>
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked /> 不限</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 座机(3)</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 电话(14)</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 地址(8)</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 邮箱(2)</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 域名(2)</label>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span>空号筛选</span>
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked /> 不限</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 未检测(14)</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 无需检测(12)</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 检测实号(1)</label>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span>数据来源</span>
                  <label className="flex items-center gap-1"><input type="checkbox" defaultChecked /> 不限</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 招投标大数据(...)</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 注册地址(2)</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 工商(1)</label>
                  <label className="flex items-center gap-1"><input type="checkbox" /> 年报电话(3)</label>
                </div>
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="bg-gray-50 text-left p-2 border border-gray-200 text-xs w-10">序号</th>
                    <th className="bg-gray-50 text-left p-2 border border-gray-200 text-xs">联系方式</th>
                    <th className="bg-gray-50 text-left p-2 border border-gray-200 text-xs w-20">类型</th>
                    <th className="bg-gray-50 text-left p-2 border border-gray-200 text-xs">来源</th>
                    <th className="bg-gray-50 text-left p-2 border border-gray-200 text-xs w-24">空号筛选</th>
                  </tr>
                </thead>
                <tbody>
                  {(contact.contacts ?? []).map((c) => (
                    <tr key={c.seq}>
                      <td className="p-2 border border-gray-200 text-xs">{c.seq}</td>
                      <td className="p-2 border border-gray-200 text-xs">{c.contact}</td>
                      <td className="p-2 border border-gray-200 text-xs">{c.type}</td>
                      <td className="p-2 border border-gray-200 text-xs">{c.source}</td>
                      <td className="p-2 border border-gray-200 text-xs">{c.empty}</td>
                    </tr>
                  ))}
                  {(contact.contacts ?? []).length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-gray-400 text-xs">暂无联系方式示例数据</td></tr>
                  )}
                </tbody>
              </table>
              <div className="flex justify-end items-center mt-3 text-xs gap-2">
                <span>共 {contact.contacts?.length ?? 0} 条</span>
                <button className="border border-gray-200 rounded px-2 py-0.5">&lt;</button>
                <button className="bg-brand-600 text-white border border-brand-600 rounded px-2 py-0.5">1</button>
                <button className="border border-gray-200 rounded px-2 py-0.5">2</button>
                <button className="border border-gray-200 rounded px-2 py-0.5">3</button>
                <button className="border border-gray-200 rounded px-2 py-0.5">&gt;</button>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <div className="font-medium text-base">存客触达</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary"><i className="fa fa-exchange" /> 关系类型</Button>
                  <Button size="sm" variant="secondary">AI 分析</Button>
                  <Button size="sm" variant="secondary"><i className="fa fa-download" /> 下载</Button>
                </div>
              </div>
              <div className="text-xs text-gray-700">
                您的存客中暂未发现与该企业的关联关系。可<span className="text-brand-600 cursor-pointer" onClick={() => setCunke(true)}>上传更多存客名单</span>，查看更多触达路径（上传后，第二天凌晨生效）
              </div>
            </div>
          </div>
        )}
      </RightDrawer>

      {/* ========== 抽屉：公司商机 ========== */}
      <RightDrawer open={!!companyBiz} onClose={() => setCompanyBiz(null)} title={companyBiz ? `${companyBiz.company} - 公司商机` : ''} width={820} level={2}>
        {companyBiz && (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start gap-2">
                <div className="bg-brand-600 text-white px-2 py-1 rounded text-xs font-bold">{companyBiz.company.slice(0, 2)}<br />{companyBiz.company.slice(2, 4)}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base">{companyBiz.company}</span>
                    {companyBiz.companyTags.map((t) => (<span key={t} className="bg-slate-100 rounded px-1.5 py-0.5 text-xs text-gray-600">{t}</span>))}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">1669.3559万元人民币 | 2022-11-22 | 科技推广和应用服务业</div>
                </div>
              </div>
              <div className="flex gap-4 text-brand-600">
                <span className="cursor-pointer" onClick={() => setContact(companyBiz)}>AI触达</span>
                <span className="cursor-pointer flex items-center gap-1"><i className="fa fa-share-square-o" /> 分享</span>
              </div>
            </div>

            <div className="flex justify-between items-center mb-3">
              <div className="flex gap-3 text-gray-700 text-xs">
                <select value={bizOpp} onChange={(e) => setBizOpp(e.target.value)} className="border border-gray-300 rounded px-2 py-1 bg-white">
                  {BIZ_OPP_OPTIONS.map((o) => (<option key={o} value={o}>{o === '不限' ? '业务机会：不限' : o}</option>))}
                </select>
                <select value={bizType} onChange={(e) => setBizType(e.target.value)} className="border border-gray-300 rounded px-2 py-1 bg-white">
                  <option value="">商机类型：不限</option>
                  {BIZ_TYPE_TREE.map((t) => (
                    <Fragment key={t.group}>
                      <option value={t.group}>{t.group}</option>
                      {t.children.map((c) => (<option key={c} value={c}>　· {c}</option>))}
                    </Fragment>
                  ))}
                </select>
                <select value={bizValue} onChange={(e) => setBizValue(e.target.value)} className="border border-gray-300 rounded px-2 py-1 bg-white">
                  {BIZ_VALUE_OPTIONS.map((o) => (<option key={o} value={o}>{o === '不限' ? '商业价值：不限' : o}</option>))}
                </select>
              </div>
              <button className="border border-gray-300 rounded px-3 py-1 text-xs flex items-center gap-1"><i className="fa fa-download" /> 导出前1千条</button>
            </div>

            <div className="space-y-4">
              {filteredCompanyBiz.map((b, i) => (
                <div key={i} className="border border-gray-200 rounded p-3">
                  <div className="flex justify-between">
                    <div className="text-sm">{b.content}</div>
                    <div className="text-xs text-gray-500 ml-4 whitespace-nowrap">{b.date}</div>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    {b.tags.map((t) => (<span key={t} className="bg-slate-100 rounded px-1.5 py-0.5 text-xs text-gray-600">{t}</span>))}
                    <Stars n={b.stars} />
                  </div>
                  <div className="border-b border-dashed border-gray-200 my-3"></div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    {b.fields.map((f, j) => (
                      <div key={j}>{f.label}: {f.value}</div>
                    ))}
                  </div>
                  {b.desc && (
                    <>
                      <div className="border-b border-dashed border-gray-200 my-3"></div>
                      <div className="text-xs text-slate-600 leading-relaxed">
                        <span className="text-slate-400 mr-1">相关描述：</span>{b.desc}
                      </div>
                    </>
                  )}
                </div>
              ))}
              {filteredCompanyBiz.length === 0 && (
                <div className="border border-gray-200 rounded p-3 text-sm text-slate-600">当前筛选条件下暂无匹配的商机</div>
              )}
            </div>
          </div>
        )}
      </RightDrawer>

      <RelationBizDrawer row={relationBiz} onClose={() => setRelationBiz(null)} />

      {/* ========== 弹窗：存客触达页面（触达弹窗-2） ========== */}
      <Modal open={cunke} onClose={() => setCunke(false)} title="存客触达页面" width="max-w-2xl" zIndex={80}>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="text-base font-medium flex items-center gap-1"><span className="w-1 h-4 bg-brand-600 inline-block" />存客触达</div>
              <div className="flex gap-2">
                <button className="border border-gray-200 rounded px-3 py-1 text-xs flex items-center gap-1"><i className="fa fa-filter" /> 关系类型</button>
                <button className="border border-brand-600 text-brand-600 rounded px-3 py-1 text-xs flex items-center gap-1">AI 分析</button>
                <button className="border border-gray-200 rounded px-3 py-1 text-xs flex items-center gap-1"><i className="fa fa-download" /> 下载</button>
              </div>
            </div>
            <div className="text-xs text-gray-600">您的存客中暂未发现与该企业的关联关系。可<span className="text-brand-600">上传更多存客名单</span>，查看更多触达路径（上传后，第二天凌晨生效）</div>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <div className="font-medium mb-3">企业商机(0)</div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-4 text-xs">
                {['业务机会', '商机类型', '商机价值'].map((f) => (<span key={f} className="flex items-center gap-1">{f}<i className="fa fa-angle-down text-gray-400" /></span>))}
              </div>
              <button className="border border-gray-200 rounded px-3 py-1 text-xs flex items-center gap-1"><i className="fa fa-download" /> 导出前1万条</button>
            </div>
            <div className="py-10 text-center">
              <i className="fa fa-server text-5xl text-gray-300" />
              <div className="mt-2 text-xs text-gray-500">暂无数据</div>
            </div>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <div className="font-medium flex items-center gap-2">跟进记录(0)<span className="px-2 py-0.5 rounded text-xs bg-rose-50 text-rose-600">需走访</span></div>
          </div>
          <div className="border border-gray-200 rounded p-4">
            <div className="font-medium mb-3">操作记录(1)</div>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span className="w-2 h-2 rounded-full bg-brand-600" />
              2026年08月17日 14:25  19156027703  创建线索
            </div>
          </div>
        </div>
      </Modal>

      {/* ========== 弹窗：地图圈选搜索 ========== */}
      <Modal open={mapSearchOpen} onClose={() => setMapSearchOpen(false)} title="地图圈选搜索" width="max-w-3xl" zIndex={70}>
        <div className="mb-4 text-sm text-slate-500">请在地图上框选/点选区域后，按条件筛选周边企业。</div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {MAP_FILTER_FIELDS.map((f) => (
            <div key={f.key} className="flex items-center gap-3">
              <span className="w-24 shrink-0 text-right text-sm text-slate-600">{f.label}</span>
              {f.control === 'select' ? (
                <select
                  className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-[#165DFF]"
                  value={mapFilters[f.key]}
                  onChange={(e) => setMapFilter(f.key, e.target.value)}
                >
                  {f.options!.map((o) => (<option key={o} value={o}>{o}</option>))}
                </select>
              ) : f.control === 'number' ? (
                <div className="flex-1 flex items-center border border-gray-300 rounded px-2 focus-within:border-[#165DFF]">
                  <input
                    type="number"
                    className="flex-1 py-1.5 text-sm outline-none"
                    placeholder={f.placeholder}
                    value={mapFilters[f.key]}
                    onChange={(e) => setMapFilter(f.key, e.target.value)}
                  />
                  {f.unit && <span className="text-xs text-slate-400 ml-1">{f.unit}</span>}
                </div>
              ) : (
                <input
                  type="date"
                  className="flex-1 border border-gray-300 rounded px-2 py-1.5 text-sm outline-none focus:border-[#165DFF]"
                  value={mapFilters[f.key]}
                  onChange={(e) => setMapFilter(f.key, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button className="border border-gray-300 rounded px-4 py-1.5 text-sm" onClick={resetMapFilters}>重置</button>
          <button className="bg-[#165DFF] text-white rounded px-4 py-1.5 text-sm hover:bg-[#0E42D2]" onClick={() => setMapSearchOpen(false)}>开始搜索</button>
        </div>
      </Modal>
    </div>
  )
}
