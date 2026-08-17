import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

const toggleCls =
  'rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300'

type Row = {
  企业名称: string
  信息来源: string
  最新营销商机: string
  地区: string
  行业: string
  注册资本: string
  成立时间: string
}

const rows: Row[] = [
  {
    企业名称: '无锡市万盛橡塑制品有限责任公司',
    信息来源: '2026-08-10',
    最新营销商机: '2026年无锡市拟认定企业技术中心名单公示（拟）',
    地区: '无锡市',
    行业: '橡胶和塑料制品业',
    注册资本: '1,000万元人民币',
    成立时间: '2003-05-23',
  },
  {
    企业名称: '世泰仕塑料有限公司',
    信息来源: '—',
    最新营销商机: '—',
    地区: '—',
    行业: '—',
    注册资本: '2,000万美元',
    成立时间: '2006-03-10',
  },
  {
    企业名称: '江阴华昌食品添加剂有限公司',
    信息来源: '2025-10-21',
    最新营销商机: '江阴临港经济开发区2025年9月环评质量评分情况公示表',
    地区: '江阴市',
    行业: '食品制造业',
    注册资本: '3,100万元人民币',
    成立时间: '2007-09-28',
  },
  {
    企业名称: '苏州纳微科技股份有限公司',
    信息来源: '2025-11-02',
    最新营销商机: '2025年苏州市拟认定企业技术中心名单公示（拟）',
    地区: '苏州市',
    行业: '化学原料和化学制品制造业',
    注册资本: '40,040万元人民币',
    成立时间: '2007-10-22',
  },
  {
    企业名称: '深圳市某某电子科技有限公司',
    信息来源: '2026-01-15',
    最新营销商机: '2026年深圳市专精特新中小企业名单公示',
    地区: '深圳市',
    行业: '计算机、通信和其他电子设备制造业',
    注册资本: '5,000万元人民币',
    成立时间: '2014-06-18',
  },
  {
    企业名称: '杭州某某生物制药有限公司',
    信息来源: '2025-12-08',
    最新营销商机: '杭州医药港2025年重点建设项目环评公示',
    地区: '杭州市',
    行业: '医药制造业',
    注册资本: '8,000万元人民币',
    成立时间: '2012-03-05',
  },
  {
    企业名称: '成都某某智能科技有限公司',
    信息来源: '2026-02-20',
    最新营销商机: '2026年成都市瞪羚企业认定名单公示',
    地区: '成都市',
    行业: '软件和信息技术服务业',
    注册资本: '6,500万元人民币',
    成立时间: '2016-09-12',
  },
  {
    企业名称: '武汉某某光电技术股份有限公司',
    信息来源: '2025-09-30',
    最新营销商机: '武汉东湖高新区2025年重大科技专项拟立项公示',
    地区: '武汉市',
    行业: '计算机、通信和其他电子设备制造业',
    注册资本: '12,000万元人民币',
    成立时间: '2009-11-26',
  },
]

const columns = [
  { key: '企业名称', label: '企业名称', fixed: 'left' as const, width: 240 },
  { key: '信息来源', label: '信息来源', width: 120 },
  { key: '最新营销商机', label: '最新营销商机', width: 320 },
  { key: '地区', label: '地区', width: 110 },
  { key: '行业', label: '行业', width: 200 },
  { key: '注册资本', label: '注册资本', width: 140 },
  { key: '成立时间', label: '成立时间', width: 120 },
]

export default function DmCompanyLib() {
  const [认证日期至, set认证日期至] = useState('')
  const [moreOpen, setMoreOpen] = useState(false)
  const [sel, setSel] = useState<Record<string, string[]>>({})

  const toggle = (group: string, val: string) => {
    setSel((p) => {
      const cur = p[group] ?? []
      const next = cur.includes(val) ? cur.filter((v) => v !== val) : [...cur, val]
      return { ...p, [group]: next }
    })
  }

  const renderGroup = (group: string, opts: string[]) => (
    <div className="mb-4">
      <div className="mb-2 text-sm font-medium text-ink-900">{group}</div>
      <div className="flex flex-wrap gap-2">
        {opts.map((o) => {
          const active = (sel[group] ?? []).includes(o)
          return (
            <button
              key={o}
              className={toggleCls + (active ? ' border-brand-300 text-ink-900' : '')}
              onClick={() => toggle(group, o)}
            >
              {o}
            </button>
          )
        })}
      </div>
    </div>
  )

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="企业库"
        crumb="数字营销 / 潜客挖掘"
        subtitle="全量企业名录库：多维筛选、企业详情与批量收藏"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <Panel title="认证筛选" desc={<Sam label="样例企业" value={30000} />}>
          <div className="mb-4">
            <div className="mb-2 text-sm font-medium text-ink-900">认证日期</div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500">至</span>
              <input
                type="date"
                value={认证日期至}
                onChange={(e) => set认证日期至(e.target.value)}
                className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-600"
              />
              <button className={toggleCls} onClick={() => set认证日期至('')}>
                确定
              </button>
              <button className={toggleCls} onClick={() => set认证日期至('')}>
                取消
              </button>
            </div>
          </div>

          {renderGroup('认证状态', ['有效', '过期', '撤销', '未知'])}
          {renderGroup('认证级别', ['国家级', '省级', '市级', '县区级'])}
          {renderGroup('认证年份', [
            '2026年',
            '2025年',
            '2024年',
            '2023年',
            '2022年',
            '2021年',
            '2020年',
            '2019年',
            '2018年',
            '2017年',
            '…',
          ])}

          <button
            className={toggleCls + ' mt-2'}
            onClick={() => setMoreOpen((v) => !v)}
          >
            {moreOpen ? '收起更多筛选' : '更多筛选'}
          </button>

          {moreOpen && (
            <div className="mt-4 border-t border-slate-200 pt-4">
              {renderGroup('省份地区', [
                '北京市',
                '天津市',
                '河北省',
                '山西省',
                '内蒙古自治区',
                '辽宁省',
                '吉林省',
                '黑龙江省',
                '上海市',
                '江苏省',
                '浙江省',
                '安徽省',
                '福建省',
                '江西省',
                '山东省',
                '河南省',
                '湖北省',
                '湖南省',
                '广东省',
                '广西壮族自治区',
                '海南省',
                '重庆市',
                '四川省',
                '贵州省',
                '云南省',
                '西藏自治区',
                '陕西省',
                '甘肃省',
                '青海省',
                '宁夏回族自治区',
                '新疆维吾尔自治区',
              ])}
              {renderGroup('所在行业', [
                '农、林、牧、渔业',
                '采矿业',
                '制造业',
                '电力、热力、燃气及水生产和供应业',
                '建筑业',
                '批发和零售业',
                '交通运输、仓储和邮政业',
                '住宿和餐饮业',
                '信息传输、软件和信息技术服务业',
                '金融业',
                '房地产业',
                '租赁和商务服务业',
                '科学研究和技术服务业',
                '水利、环境和公共设施管理业',
                '居民服务、修理和其他服务业',
                '教育',
                '卫生和社会工作',
                '文化、体育和娱乐业',
                '公共管理、社会保障和社会组织',
                '国际组织',
              ])}
              {renderGroup('企业背景', [
                '外商投资',
                '中外合资',
                '港澳台投资',
                '民营企业',
                '国有企业',
                '央企',
                '事业单位',
              ])}
              {renderGroup('企业规模', [
                '小微企业',
                '中型企业',
                '大型企业',
                '规模以上企业',
                '规模以上服务业企业',
                '规模以上工业企业',
              ])}
              {renderGroup('资质标签', [
                '专精特新',
                '专精特新小巨人',
                '科技小巨人',
                '高新企业',
                '独角兽企业',
                '瞪羚企业',
                '隐形冠军',
                '制造业单项冠军',
              ])}
              {renderGroup('上市信息', [
                'A股上市',
                '新三板',
                '上交所',
                '深交所',
                '科创板',
                '创业版',
                '中概股',
              ])}
              {renderGroup('参保人数', [
                '少于50人',
                '50-99人',
                '100-499人',
                '500-999人',
                '1000-4999人',
                '5000-9999人',
                '多于10000人',
              ])}
              {renderGroup('注册资本', [
                '0万 - 100万',
                '100万 - 200万',
                '200万 - 500万',
                '500万 - 1000万',
                '1000万以上',
              ])}
              {renderGroup('成立时间', ['—'])}
            </div>
          )}
        </Panel>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">
              找到 <span className="font-semibold text-ink-900">30,000</span> 条结果
            </span>
            <div className="ml-auto flex flex-wrap gap-2">
              <button className={toggleCls}>加入所选</button>
              <button className={toggleCls}>加入前3万条</button>
              <button className={toggleCls}>导出</button>
              <button className={toggleCls}>导出前30000条</button>
              <button className={toggleCls}>推送数据</button>
            </div>
          </div>

          <Panel title="企业列表" desc={<Sam label="样例企业" value="30000" />}>
            <DataTable
              columns={columns}
              rows={rows}
              pager
              pageSizeOptions={[10, 20]}
              exportable
              exportName="企业库"
            />
          </Panel>
        </div>
      </div>
    </div>
  )
}
