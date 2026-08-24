import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { usePageNav } from './pageNav';
import { PageShell } from './PageShell';
import { Panel, DataTable, Modal } from '../components/ui';
import type { Column, Row } from '../components/ui';

/* 集团户 · 详情 · React 重写（原 qixinRuntime 快照已移除）
 * 两个 tab：
 *   集团信息     ← 营销 - 集团户 - 详情
 *   商机信息     ← 营销 - 集团户 - 详情 - 商机信息
 *   公司商机弹窗 ← 营销 - 集团户 - 详情 - tab商机信息 - 公司商机弹窗
 * 进入来源：集团户列表卡片点击 / 企业档案·集团信息（集团名链接）
 *   URL: /console/dm/group-account-detail?name=xxx&from=dm
 */

/* ============ 工具：星级 ============ */
function Stars({ n }: { n: number }) {
  return (
    <span className="text-[#4080FF] tracking-wider">
      {Array.from({ length: 5 }).map((_, i) => (i < n ? '★' : '☆')).join('')}
    </span>
  )
}

/* ============ 集团信息 · 企业列表样例数据（设计稿 1:1） ============ */
interface GroupRow extends Row {
  company: string
  status: string
  regCap: string
  establish: string
  level: string
  industry: string
  region: string
  ratio: string
  revenue: string
  assets: string
  profit: string
}

const groupRows: GroupRow[] = [
  { id: '1', company: '国家能源投资集团有限责任公司', status: '存续', regCap: '13,209,466.11498万元人民币', establish: '1995-10-23', level: '0级', industry: '商务服务业', region: '北京东城', ratio: '100.00%', revenue: '7,068.64亿', assets: '23,621.12亿', profit: '964.87亿' },
  { id: '2', company: '国能国源电力（北京）有限公司', status: '存续', regCap: '4,726,135.91158万元人民币', establish: '2008-04-29', level: '2级', industry: '电力、热力生产和供应业', region: '北京西城', ratio: '69.97%', revenue: '258.44亿', assets: '615.62亿', profit: '34.25亿' },
  { id: '3', company: '中国神华煤制油化工有限公司', status: '存续', regCap: '3,616,431.585277万元人民币', establish: '2003-06-12', level: '2级', industry: '其他制造业', region: '北京东城', ratio: '69.97%', revenue: '264.29亿', assets: '370.34亿', profit: '12.6亿' },
  { id: '4', company: '国能（乌海）能源有限公司', status: '存续', regCap: '2,692,703万元人民币', establish: '2002-04-11', level: '2级', industry: '煤炭开采和洗选业', region: '内蒙古乌海海勃湾', ratio: '69.97%', revenue: '97.7亿', assets: '224.98亿', profit: '13.11亿' },
  { id: '5', company: '国家能源集团资本控股有限公司', status: '存续', regCap: '2,284,100万元人民币', establish: '2009-11-17', level: '1级', industry: '商务服务业', region: '北京西城', ratio: '100.00%', revenue: '25.66亿', assets: '1,534.75亿', profit: '15.69亿' },
  { id: '6', company: '国家能源集团宁夏煤业有限责任公司', status: '存续', regCap: '2,111,146.64万元人民币', establish: '2002-12-28', level: '1级', industry: '石油、煤炭及其他燃料加工业', region: '宁夏银川金凤', ratio: '51.00%', revenue: '539.48亿', assets: '1,180.97亿', profit: '48.25亿' },
  { id: '7', company: '中国神华能源股份有限公司', status: '存续', regCap: '1,986,851.9955万元人民币', establish: '2004-11-08', level: '1级', industry: '煤炭开采和洗选业', region: '北京东城', ratio: '69.97%', revenue: '2,949.16亿', assets: '6,277.61亿', profit: '627.83亿' },
  { id: '8', company: '国能大渡河流域水电开发有限公司', status: '存续', regCap: '1,962,208.882222万元人民币', establish: '2000-11-16', level: '2级', industry: '电力、热力生产和供应业', region: '四川成都武侯', ratio: '41.06%', revenue: '95.85亿', assets: '1,375.86亿', profit: '16.9亿' },
  { id: '9', company: '国电电力发展股份有限公司', status: '存续', regCap: '1,783,561.9082万元人民币', establish: '1992-12-31', level: '1级', industry: '电力、热力生产和供应业', region: '辽宁大连金州', ratio: '51.32%', revenue: '1,702.44亿', assets: '5,201.52亿', profit: '137.27亿' },
  { id: '10', company: '国家能源集团财务有限公司', status: '存续', regCap: '1,750,000万元人民币', establish: '2000-11-27', level: '1级', industry: '货币金融服务', region: '北京西城', ratio: '87.99%', revenue: '31.31亿', assets: '1,182.51亿', profit: '10.77亿' },
]

/* ============ 商机信息 · 商机列表样例数据（设计稿 1:1） ============ */
interface BizRow extends Row {
  company: string
  date: string
  bizType: string
  bizTypeKind: 'orange' | 'gray'
  stars: number
  content: string
  companyBizCount: number
}

const bizRows: BizRow[] = [
  { id: '1', company: '国能新疆能源化工有限公司', date: '2026-08-20', bizType: '新增供应商/项目', bizTypeKind: 'orange', stars: 5, content: '2026-08-20,国能新疆能源化工有限公司新增供应商扬州瀚智新能源装备有限公...', companyBizCount: 938 },
  { id: '2', company: '国电电力发展股份有限公司', date: '2026-08-20', bizType: '拟收购资产', bizTypeKind: 'gray', stars: 4, content: '2026-08-20新增收购资产/计划收购资产事件,事件标题为【能源早报 | 国电电...', companyBizCount: 53 },
  { id: '3', company: '国家能源集团宁夏煤业有限责任公司', date: '2026-08-20', bizType: '国/央企工程类项目招标', bizTypeKind: 'orange', stars: 5, content: '2026-08-20,国家能源集团宁夏煤业有限责任公司发布了工程类项目招标【宁夏...', companyBizCount: 3474 },
  { id: '4', company: '国能神福（石狮）发电有限公司', date: '2026-08-20', bizType: '新增供应商/项目', bizTypeKind: 'orange', stars: 5, content: '2026-08-20,国能神福（石狮）发电有限公司新增供应商泉州天星气体有限公司...', companyBizCount: 168 },
  { id: '5', company: '国能经济技术研究院有限责任公司', date: '2026-08-20', bizType: '新增供应商/项目', bizTypeKind: 'orange', stars: 5, content: '2026-08-20,国能经济技术研究院有限责任公司新增供应商国能大渡河大数据服...', companyBizCount: 16 },
  { id: '6', company: '国能包头能源有限责任公司', date: '2026-08-20', bizType: '新增供应商/项目', bizTypeKind: 'orange', stars: 5, content: '2026-08-20,国能包头能源有限责任公司新增供应商内蒙古中古商贸有限公司,...', companyBizCount: 183 },
  { id: '7', company: '国能（柘荣）水电有限公司', date: '2026-08-20', bizType: '新增供应商/项目', bizTypeKind: 'orange', stars: 5, content: '2026-08-20,国能（柘荣）水电有限公司新增供应商福建省陆禹建设有限公司,...', companyBizCount: 16 },
  { id: '8', company: '国能水务环保有限公司', date: '2026-08-20', bizType: '新增供应商/项目', bizTypeKind: 'orange', stars: 5, content: '2026-08-20,国能水务环保有限公司新增供应商上海蒙致工业自动化工程有限公...', companyBizCount: 243 },
]

/* ============ 公司商机弹窗 · 商机样例数据（设计稿 1:1） ============ */
interface CompanyBizItem {
  title: string
  date: string
  tag: string
  stars: number
  fields: { label: string; value: string }[]
  link?: boolean
}

const companyBizItems: CompanyBizItem[] = [
  {
    title: '福建公司石狮电厂2026年7月二氧化碳等（有附件）询价采购',
    date: '2026-08-20',
    tag: '新增供应商/项目',
    stars: 5,
    link: true,
    fields: [
      { label: '招标方', value: '国能神福（石狮）发电有限公司' },
      { label: '供应商', value: '泉州天星气体有限公司' },
      { label: '合作项目', value: '福建公司石狮电厂2026年7月二氧...' },
      { label: '项目发布时间', value: '2026-08-20' },
      { label: '项目中标金额', value: '-' },
      { label: '合作次数', value: '1' },
    ],
  },
  {
    title: '福建公司石狮电厂2026年7月可编程控制器PLC系统配件（有附件）询价采购',
    date: '2026-08-20',
    tag: '新增供应商/项目',
    stars: 5,
    link: true,
    fields: [
      { label: '招标方', value: '国能神福（石狮）发电有限公司' },
      { label: '供应商', value: '浙江赛弗德能源发展有限公司' },
      { label: '合作项目', value: '福建公司石狮电厂2026年7月可编...' },
      { label: '项目发布时间', value: '2026-08-20' },
      { label: '项目中标金额', value: '-' },
      { label: '合作次数', value: '3' },
    ],
  },
  {
    title: '福建公司石狮电厂2026年7月对讲机及配件（有附件）询价采购',
    date: '2026-08-20',
    tag: '新增供应商/项目',
    stars: 5,
    link: true,
    fields: [
      { label: '招标方', value: '国能神福（石狮）发电有限公司' },
      { label: '供应商', value: '四川盛皓信达科技有限公司' },
      { label: '合作项目', value: '福建公司石狮电厂2026年7月对讲...' },
      { label: '项目发布时间', value: '2026-08-20' },
      { label: '项目中标金额', value: '-' },
      { label: '合作次数', value: '1' },
    ],
  },
  {
    title: '福建公司石狮电厂2026年7月漏氢检测仪配件等（有附件）询价采购',
    date: '2026-08-20',
    tag: '新增供应商/项目',
    stars: 5,
    link: false,
    fields: [
      { label: '招标方', value: '国能神福（石狮）发电有限公司' },
      { label: '供应商', value: '厦门市贝时特机电设备有限公司' },
      { label: '合作项目', value: '福建公司石狮电厂2026年7月漏氢...' },
      { label: '项目发布时间', value: '2026-08-20' },
      { label: '项目中标金额', value: '-' },
      { label: '合作次数', value: '22' },
    ],
  },
]

/* ============ 主组件 ============ */
export default function DmGroupAccountDetail() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const name = params.get('name') || '集团详情';
  const backUrl = params.get('back') || `/console/${params.get('from') || 'dm'}/group-account`;

  const { goDetail } = usePageNav()
  const [tab, setTab] = useState<string>('集团信息');
  const [bizOpen, setBizOpen] = useState(false);
  const [bizFilters, setBizFilters] = useState<Record<string, string>>({});

  const groupColumns: Column[] = [
    { key: 'company', label: '公司名称', render: (r: Row) => (r as GroupRow).company },
    { key: 'status', label: '经营状态', render: (r: Row) => <span className="bg-green-100 text-[#36c66d] px-1 rounded">{(r as GroupRow).status}</span> },
    { key: 'regCap', label: '注册资本↕', render: (r: Row) => (r as GroupRow).regCap },
    { key: 'establish', label: '成立时间↕', render: (r: Row) => (r as GroupRow).establish },
    { key: 'level', label: '成员级别(实控人)', render: (r: Row) => (r as GroupRow).level },
    { key: 'industry', label: '行业', render: (r: Row) => (r as GroupRow).industry },
    { key: 'region', label: '地区', render: (r: Row) => (r as GroupRow).region },
    { key: 'ratio', label: '实控人控股比例↕', render: (r: Row) => (r as GroupRow).ratio },
    { key: 'revenue', label: '营业收入↕', render: (r: Row) => (r as GroupRow).revenue },
    { key: 'assets', label: '资产总额↕', render: (r: Row) => (r as GroupRow).assets },
    { key: 'profit', label: '净利润↕', render: (r: Row) => (r as GroupRow).profit },
  ]

  /* 商机列表筛选配置：按需求补充的筛选项与下拉内容 */
  const BIZ_FILTER_OPTIONS: { key: string; label: string; options: string[] }[] = [
    { key: 'bizSel', label: '选择商机', options: ['全部商机', '授信商机', '融资商机', '担保商机'] },
    { key: 'date', label: '发生日期', options: ['不限', '今天', '近7天', '近30天', '近3个月', '近1年'] },
    { key: 'value', label: '商机价值', options: ['不限', '1星', '2星', '3星', '4星', '5星'] },
    { key: 'chance', label: '业务机会', options: ['不限', '信贷', '供应链金融', '投资并购'] },
    { key: 'type', label: '商机类型', options: ['不限', '授信', '融资', '担保', '其他'] },
    { key: 'province', label: '省份地区', options: ['不限', '北京市', '上海市', '广东省', '江苏省', '浙江省', '四川省'] },
    { key: 'industry', label: '所在行业', options: ['不限', '制造业', '建筑业', '金融业', '信息技术', '批发零售'] },
    { key: 'bg', label: '企业背景', options: ['不限', '国企', '民营', '外资', '上市公司'] },
    { key: 'etype', label: '企业类型', options: ['不限', '有限责任公司', '股份有限公司', '国有企业'] },
    { key: 'org', label: '其他组织', options: ['不限', '事业单位', '社会团体', '民办非企业'] },
    { key: 'qual', label: '资质标签', options: ['不限', '高新企业', '科技型中小企业', '专精特新'] },
    { key: 'list', label: '上市信息', options: ['不限', '已上市', '未上市', '新三板'] },
    { key: 'scale', label: '企业规模', options: ['不限', '大型', '中型', '小型', '微型'] },
    { key: 'insured', label: '参保人数', options: ['不限', '0-50', '50-200', '200-500', '500以上'] },
    { key: 'regcap', label: '注册资本', options: ['不限', '0-100万', '100-1000万', '1000万-1亿', '1亿以上'] },
    { key: 'found', label: '成立时间', options: ['不限', '1年内', '1-3年', '3-5年', '5年以上'] },
    { key: 'health', label: '企业健康度', options: ['不限', '优秀', '良好', '一般', '预警'] },
    { key: 'sx', label: '失信被执行人', options: ['不限', '是', '否'] },
    { key: 'zx', label: '被执行人', options: ['不限', '是', '否'] },
    { key: 'zb', label: '终本案件', options: ['不限', '是', '否'] },
    { key: 'dy', label: '动产抵押', options: ['不限', '是', '否'] },
  ]

  const bizColumns: Column[] = [
    { key: 'company', label: '企业名称', render: (r: Row) => (
      <span
        className="text-[#165DFF] cursor-pointer hover:underline"
        onClick={() => goDetail('/console/dm/ent-archive-basic', { name: (r as BizRow).company })}
      >
        {(r as BizRow).company}
      </span>
    ) },
    { key: 'date', label: '发生日期', render: (r: Row) => (r as BizRow).date },
    {
      key: 'bizType',
      label: '商机类型',
      render: (r: Row) => {
        const row = r as BizRow
        const cls = row.bizTypeKind === 'orange' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-600'
        return <span className={`${cls} px-1 rounded`}>{row.bizType}</span>
      },
    },
    { key: 'stars', label: '商机价值', render: (r: Row) => <Stars n={(r as BizRow).stars} /> },
    {
      key: 'content',
      label: '商机内容',
      render: (r: Row) => {
        const row = r as BizRow
        return (
          <div className="max-w-md">
            {row.content} <span className="text-[#165DFF] cursor-pointer">授信</span>
          </div>
        )
      },
    },
    {
      key: 'op',
      label: '操作',
      render: (r: Row) => (
        <span className="text-[#165DFF] cursor-pointer hover:underline" onClick={() => setBizOpen(true)}>
          公司商机 {(r as BizRow).companyBizCount}
        </span>
      ),
    },
  ]

  return (
    <div className="font-sans text-[14px] text-gray-800">
      <PageShell title={name} crumb="数字营销 / 潜客挖掘 / 集团户" legend={false} onBack={() => nav(backUrl)} />

      <div className="px-6 py-4 max-w-[1440px] mx-auto">
        {/* ========== 集团头部信息（两 tab 共用） ========== */}
        <Panel
          actions={
            <button className="bg-[#1f47f5] text-white px-3 py-1 rounded text-xs font-medium flex items-center gap-1">
              <span>+</span> 关注
            </button>
          }
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-600 text-white flex items-center justify-center text-sm shrink-0">🔥</div>
            <h1 className="text-lg font-bold">{name}</h1>
            <span className="text-xs">主体企业：<a className="text-[#165DFF] cursor-pointer">国家能源投资集团有限责任公司</a></span>
            <span className="text-xs">全部企业(5,448)</span>
            <span className="text-xs">核心企业(157)</span>
          </div>
          <p className="text-xs text-gray-600 mt-1 max-w-5xl">
            国家能源投资集团有限责任公司是经党中央、国务院批准,由中国国电集团公司和神华集团有限责任公司两家世界500强企业合并重组而成,于2017年11月28日正式挂牌成立,是中央直管国有重要骨干企业、国有资本投资公司改革试点企业,2018年世界500强排名第101位。国家 ...
            <a className="text-[#165DFF] cursor-pointer">更多∨</a>
          </p>
        </Panel>

        {/* ========== Tab 栏 ========== */}
        <div className="sticky top-[140px] z-20 bg-white flex border-b border-gray-200 mt-4 mb-3">
          <div
            className={`px-3 py-2 cursor-pointer ${tab === '集团信息' ? 'border-b-2 border-[#2762e8] text-[#2762e8] font-medium' : 'text-gray-600'}`}
            onClick={() => setTab('集团信息')}
          >
            集团信息
          </div>
          <div
            className={`px-3 py-2 cursor-pointer ${tab === '商机信息' ? 'border-b-2 border-[#2762e8] text-[#2762e8] font-medium' : 'text-gray-600'}`}
            onClick={() => setTab('商机信息')}
          >
            商机信息 66,891
          </div>
        </div>

        {/* ========== Tab1：集团信息 ========== */}
        {tab === '集团信息' && (
          <Panel title="全部企业">
            {/* 筛选栏 */}
            <div className="flex flex-wrap gap-2 mb-3 text-xs">
              <span>企业筛选</span>
              {['集团筛选', '经营状态', '所在行业', '总部地区', '成员地区', '注册资本', '成立时间', '集团内级别', '控股等级'].map((f) => (
                <span key={f} className="text-[#165DFF] cursor-pointer hover:opacity-80">{f} ∨</span>
              ))}
            </div>
            {/* 已选筛选标签 */}
            <div className="flex items-center gap-2 mb-3 text-xs">
              <span>已选</span>
              <span className="bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                实控人控制等级 <span className="cursor-pointer">×</span>
              </span>
              <span className="ml-auto text-[#165DFF] cursor-pointer">清空</span>
            </div>
            {/* 结果操作栏 */}
            <div className="flex justify-between items-center mb-3 text-xs">
              <span>找到 5,448 条结果</span>
              <div className="flex gap-2">
                <input type="text" placeholder="请输入公司名称" className="border border-gray-200 rounded px-2 py-1 w-48" />
                <button className="border border-gray-300 rounded px-3 py-1 flex items-center gap-1">⬇ 导出</button>
                <button className="border border-gray-300 rounded px-3 py-1 flex items-center gap-1">营销 ∨</button>
              </div>
            </div>
            <DataTable columns={groupColumns} rows={groupRows} selectable pager defaultPageSize={10} />
          </Panel>
        )}

        {/* ========== Tab2：商机信息 ========== */}
        {tab === '商机信息' && (
          <Panel title="商机列表">
            {/* 筛选栏：统一下拉筛选 */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {BIZ_FILTER_OPTIONS.map((f) => (
                <select
                  key={f.key}
                  value={bizFilters[f.key] || f.options[0]}
                  onChange={(e) => setBizFilters((s) => ({ ...s, [f.key]: e.target.value }))}
                  className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700 outline-none hover:border-[#1a53ff] focus:border-[#1a53ff]"
                >
                  <option value={f.options[0]}>{f.label}</option>
                  {f.options.slice(1).map((o) => (
                    <option key={o} value={o}>{o}</option>
                  ))}
                </select>
              ))}
            </div>
            {/* 已选筛选标签 + 清空 */}
            <div className="flex items-center gap-2 mb-3 text-xs">
              <span className="text-[#76788b]">已选</span>
              {Object.entries(bizFilters).filter(([, v]) => v && v !== '不限' && v !== '全部商机').map(([k, v]) => {
                const label = BIZ_FILTER_OPTIONS.find((x) => x.key === k)?.label ?? k
                return (
                  <span key={k} className="bg-gray-100 px-2 py-0.5 rounded flex items-center gap-1">
                    {label}：{v}
                    <span
                      className="cursor-pointer"
                      onClick={() => setBizFilters((s) => ({ ...s, [k]: '' }))}
                    >×</span>
                  </span>
                )
              })}
              <span
                className="ml-auto text-[#165DFF] cursor-pointer hover:underline"
                onClick={() => setBizFilters({})}
              >清空</span>
            </div>
            {/* 结果操作栏 */}
            <div className="flex justify-between items-center mb-3 text-xs">
              <span>找到 30,000 条结果</span>
              <div className="flex gap-2">
                <input type="text" placeholder="输入企业或集团关键字" className="border border-gray-200 rounded px-2 py-1 w-56" />
                <button className="border border-gray-300 rounded px-3 py-1 flex items-center gap-1">营销 ∨</button>
                <button className="border border-gray-300 rounded px-3 py-1 flex items-center gap-1">⬇ 导出</button>
              </div>
            </div>
            <DataTable columns={bizColumns} rows={bizRows} selectable pager defaultPageSize={10} />
          </Panel>
        )}
      </div>

      {/* ========== 弹窗：公司商机（来自 公司商机弹窗.HTML） ========== */}
      <Modal open={bizOpen} onClose={() => setBizOpen(false)} title="国能神福（石狮）发电有限公司 - 公司商机" width="max-w-4xl">
        {/* 头部企业信息 */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 text-white flex flex-col items-center justify-center text-xs font-bold shrink-0">国能<br />神福</div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold">国能神福（石狮）发电有限公司</h1>
                <span className="bg-[#cce0ff] px-2 py-0.5 rounded text-xs">中型企业</span>
                <span className="bg-[#e5e6eb] px-2 py-0.5 rounded text-xs">国有企业</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">259299.92505万元人民币 | 2012-09-03 | 电力、热力生产和供应业</p>
            </div>
          </div>
          <div className="flex gap-3 items-center">
            <span className="text-[#165DFF] text-xs cursor-pointer">↗ 分享</span>
            <span className="cursor-pointer text-gray-400 text-lg leading-none" onClick={() => setBizOpen(false)}>×</span>
          </div>
        </div>

        {/* 筛选栏 */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-3 text-xs text-gray-700">
            <span className="cursor-pointer hover:text-[#165DFF]">业务机会 ∨</span>
            <span className="cursor-pointer hover:text-[#165DFF]">商机类型 ∨</span>
            <span className="cursor-pointer hover:text-[#165DFF]">商机价值 ∨</span>
          </div>
          <button className="border border-[#165DFF] text-[#165DFF] rounded px-3 py-1 text-xs flex items-center gap-1">⬇ 导出前1千条</button>
        </div>

        {/* 商机列表 */}
        <div className="border border-gray-200 rounded">
          {companyBizItems.map((b, i) => (
            <div key={i} className="border-b border-gray-200 py-3 px-2 last:border-b-0">
              <div className="flex justify-between mb-2">
                <h2 className="font-medium">{b.title}</h2>
                <span className="text-xs text-gray-500 whitespace-nowrap ml-2">{b.date}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-xs">{b.tag}</span>
                <span className="text-[#165DFF] text-xs cursor-pointer">授信</span>
                <Stars n={b.stars} />
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                {b.fields.map((f, j) => (
                  <div key={j}>{f.label}：{f.value}</div>
                ))}
                {b.link && <div className="text-[#165DFF] text-xs cursor-pointer">🔗 项目公告地址：查看链接</div>}
              </div>
            </div>
          ))}
        </div>

        {/* 分页 */}
        <div className="flex justify-center items-center mt-4 gap-2 text-xs">
          <span>共 168 条</span>
          <button className="px-2 py-1 border border-gray-200 rounded">‹</button>
          <button className="px-2 py-1 border border-[#165DFF] bg-[#165DFF] text-white rounded">1</button>
          <button className="px-2 py-1 border border-gray-200 rounded">2</button>
          <button className="px-2 py-1 border border-gray-200 rounded">3</button>
          <button className="px-2 py-1 border border-gray-200 rounded">4</button>
          <span>…</span>
          <button className="px-2 py-1 border border-gray-200 rounded">34</button>
          <button className="px-2 py-1 border border-gray-200 rounded">›</button>
          <div className="flex items-center gap-1 ml-2">
            <span>前往</span>
            <input type="text" defaultValue="1" className="w-8 border border-gray-200 rounded px-1 py-1 text-center" />
            <span>页</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}
