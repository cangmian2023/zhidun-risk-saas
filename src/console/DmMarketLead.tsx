import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

const PROVINCES = ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区']
const INDUSTRIES = ['农、林、牧、渔业', '采矿业', '制造业', '电力、热力、燃气及水生产和供应业', '建筑业', '批发和零售业', '交通运输、仓储和邮政业', '住宿和餐饮业', '信息传输、软件和信息技术服务业', '金融业', '房地产业', '租赁和商务服务业', '科学研究和技术服务业', '水利、环境和公共设施管理业', '居民服务、修理和其他服务业', '教育', '卫生和社会工作', '文化、体育和娱乐业', '公共管理、社会保障和社会组织', '国际组织']
const REG_CAPS = ['0万 - 100万', '100万 - 200万', '200万 - 500万', '500万 - 1000万', '1000万以上']
const STATUS_OPTS = ['存续', '注销', '吊销', '撤销', '迁出', '设立中', '清算中', '停业', '其他']
const ENT_TYPES = ['国有企业', '集体企业', '股份合作企业', '联营企业', '有限责任公司', '股份有限公司', '私营企业', '港、澳、台商投资企业', '外商投资企业', '个体工商户', '其他企业']
const ORG_TYPES = ['企业', '社会组织', '新三板', '上市公司', '律所', '投资机构', '机关', '事业单位', '台湾', '香港', '澳门', '司法鉴定机构', '仲裁委员会', '社会团体', '基金会', '村民委员会', '居民委员会', '基层工会', '民办非企业单位']
const INSURED = ['少于50人', '50-99人', '100-499人', '500-999人', '1000-4999人', '5000-9999人', '多于10000人']
const QX_SCORES = ['200 - 400分', '401 - 500分', '501 - 600分', '601 - 700分', '700分以上']
const CONCEPTS = ['生物医药', '人工智能', '互联网', '生物科技', '医疗美容', '素质教育', '电子商务', '网约车服务', '视频/直播']

const SCOPES = ['全部', '本人', '本人及下属部门', '本部门', '本部门及下属部门']

const LEADS = [
  { name: '广州粤信科技有限公司', status: '营销成功', owner: '19156027703', dept: '普惠部', visit: '已走访', joined: '2026-08-17', op: '跟进' },
  { name: '无锡万盛橡塑制品有限责任公司', status: '待营销', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-16', op: '分配' },
  { name: '世泰仕塑料有限公司', status: '待营销', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-16', op: '分配' },
  { name: '江阴华昌食品添加剂有限公司', status: '营销中', owner: '19156027703', dept: '普惠部', visit: '需走访', joined: '2026-08-15', op: '跟进' },
  { name: '苏州纳微科技股份有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-14', op: '分配' },
  { name: '深圳某某电子有限公司', status: '营销失败', owner: '19156027703', dept: '公司部', visit: '已走访', joined: '2026-08-12', op: '跟进' },
]

function StatChip({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'slate' | 'emerald' | 'amber' | 'rose' | 'brand' }) {
  const toneCls = { slate: 'bg-slate-50 text-slate-600', emerald: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', rose: 'bg-rose-50 text-rose-600', brand: 'bg-brand-50 text-brand-700' }[tone]
  return (
    <div className={`flex flex-col gap-1 rounded-lg border border-slate-200 px-3 py-2 ${toneCls}`}>
      <span className="text-[11px] opacity-80">{label}</span>
      <span className="text-lg font-semibold leading-none">{value}</span>
    </div>
  )
}

function ToggleGroup({ items, cols = 'flex flex-wrap gap-1.5' }: { items: string[]; cols?: string }) {
  const [sel, setSel] = useState<string[]>([])
  return (
    <div className={cols}>
      {items.map((it) => {
        const on = sel.includes(it)
        return (
          <button key={it} onClick={() => setSel((s) => (s.includes(it) ? s.filter((x) => x !== it) : [...s, it]))} className={`rounded-md border px-2.5 py-1 text-xs transition ${on ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'}`}>{it}</button>
        )
      })}
    </div>
  )
}

export default function DmMarketLead() {
  const [scope, setScope] = useState('全部')
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="营销线索" crumb="数字营销 / 营销管理" subtitle="营销线索池：线索采集、打分与分配跟进" />
      {/* 指标条 */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        <StatChip label="总线索" value="20" tone="brand" />
        <StatChip label="未分配" value="19" tone="amber" />
        <StatChip label="已分配" value="1" tone="emerald" />
        <StatChip label="待营销" value="0" />
        <StatChip label="30天未跟进" value="0" tone="rose" />
        <StatChip label="近7日新增" value="0" />
        <StatChip label="营销中" value="0" />
        <StatChip label="有跟进记录" value="1" tone="emerald" />
        <StatChip label="无跟进记录" value="19" tone="amber" />
        <StatChip label="营销结束" value="0" />
        <StatChip label="成功" value="1" tone="emerald" />
        <StatChip label="失败" value="0" tone="rose" />
        <StatChip label="无需营销" value="0" />
      </div>

      {/* 线索范围 + 线索筛选 */}
      <Panel title="线索筛选" desc={<Sam label="样例线索" value={20} />}>
        <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-medium">线索范围：</span>
          {SCOPES.map((s) => (
            <button key={s} onClick={() => setScope(s)} className={`rounded-md border px-2.5 py-1 transition ${scope === s ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'}`}>{s}</button>
          ))}
          <span className="ml-3 font-medium">名单筛选：</span>
          <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 hover:border-brand-300">乡村振兴</button>
          <span className="ml-3 font-medium">线索状态：</span>
          <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 hover:border-brand-300">营销成功</button>
          <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 hover:border-brand-300">营销失败</button>
          <span className="ml-3 font-medium">归属人员：</span><span className="text-slate-400">广州粤信科技有限公司</span>
          <span className="ml-3 font-medium">归属部门：</span><span className="text-slate-400">—</span>
          <span className="ml-3 font-medium">走访状态：</span>
          <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 hover:border-brand-300">需走访</button>
          <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 hover:border-brand-300">已走访</button>
          <span className="ml-3 font-medium">加入名单时间：</span><span className="text-slate-400">至 …</span>
          <button className="ml-1 rounded-md border border-slate-200 bg-white px-2 py-1 hover:border-brand-300">更多</button>
        </div>
      </Panel>

      <Panel title="基本筛选" className="mt-6">
        <div className="space-y-3">
          <div><div className="mb-1.5 text-xs font-medium text-slate-500">省份地区</div><ToggleGroup items={PROVINCES} /></div>
          <div><div className="mb-1.5 text-xs font-medium text-slate-500">所在行业</div><ToggleGroup items={INDUSTRIES} /></div>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div><div className="mb-1.5 text-xs font-medium text-slate-500">注册资本（万）</div><ToggleGroup items={REG_CAPS} /></div>
            <div><div className="mb-1.5 text-xs font-medium text-slate-500">经营状态</div><ToggleGroup items={STATUS_OPTS} /></div>
            <div><div className="mb-1.5 text-xs font-medium text-slate-500">企业类型</div><ToggleGroup items={ENT_TYPES} /></div>
            <div><div className="mb-1.5 text-xs font-medium text-slate-500">组织类型</div><ToggleGroup items={ORG_TYPES} /></div>
            <div><div className="mb-1.5 text-xs font-medium text-slate-500">参保人数</div><ToggleGroup items={INSURED} /></div>
            <div><div className="mb-1.5 text-xs font-medium text-slate-500">启信分</div><ToggleGroup items={QX_SCORES} /></div>
          </div>
          <div><div className="mb-1.5 text-xs font-medium text-slate-500">税务资质 / 进出口 / 融资 / 专利 / 商标 / 著作权</div><ToggleGroup items={['一般纳税人', '信用A级', '有进出口信息', '有融资信息', '有专利信息', '有商标信息', '有著作权']} /></div>
          <div><div className="mb-1.5 text-xs font-medium text-slate-500">概念标签 · 业务概念</div><ToggleGroup items={CONCEPTS} /></div>
        </div>
      </Panel>

      <Panel title="线索池" className="mt-6" desc={<span className="text-xs text-slate-400">共 20 条线索</span>} actions={<button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300">加入名单</button>}>
        <DataTable
          columns={[
            { key: 'name', label: '企业名称', width: '280px', fixed: 'left' },
            { key: 'status', label: '线索状态', render: (row) => {
              const r = row as unknown as (typeof LEADS)[number]
              const tone = r.status === '营销成功' ? 'bg-emerald-50 text-emerald-600' : r.status === '营销失败' ? 'bg-rose-50 text-rose-600' : r.status === '营销中' ? 'bg-brand-50 text-brand-700' : r.status === '未分配' ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-600'
              return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{r.status}</span>
            } },
            { key: 'owner', label: '归属人员' },
            { key: 'dept', label: '归属部门' },
            { key: 'visit', label: '走访状态' },
            { key: 'joined', label: '加入名单时间' },
            { key: 'op', label: '操作', render: (row) => <span className="cursor-pointer text-brand-600 hover:underline">{(row as unknown as (typeof LEADS)[number]).op}</span> },
          ]}
          rows={LEADS}
          pager
          pageSizeOptions={[10, 20]}
          exportable
          exportName="营销线索"
        />
      </Panel>
    </div>
  )
}
