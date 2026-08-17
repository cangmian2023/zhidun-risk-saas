import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'
import { Sam } from './SourceTag'

type MarketList = {
  id: string
  name: string
  leads: number
  marketing: number
  ended: number
  creator: string
  created: string
  scope: string
}

const LISTS: MarketList[] = [
  { id: 'rural', name: '乡村振兴', leads: 20, marketing: 0, ended: 0, creator: '样例', created: '2026-08-17', scope: '全行可见' },
]

const PROVINCES = ['北京市', '天津市', '河北省', '山西省', '内蒙古自治区', '辽宁省', '吉林省', '黑龙江省', '上海市', '江苏省', '浙江省', '安徽省', '福建省', '江西省', '山东省', '河南省', '湖北省', '湖南省', '广东省', '广西壮族自治区', '海南省', '重庆市', '四川省', '贵州省', '云南省', '西藏自治区', '陕西省', '甘肃省', '青海省', '宁夏回族自治区', '新疆维吾尔自治区']
const INDUSTRIES = ['农、林、牧、渔业', '采矿业', '制造业', '电力、热力、燃气及水生产和供应业', '建筑业', '批发和零售业', '交通运输、仓储和邮政业', '住宿和餐饮业', '信息传输、软件和信息技术服务业', '金融业', '房地产业', '租赁和商务服务业', '科学研究和技术服务业', '水利、环境和公共设施管理业', '居民服务、修理和其他服务业', '教育', '卫生和社会工作', '文化、体育和娱乐业', '公共管理、社会保障和社会组织', '国际组织']
const STATUS_OPTS = ['存续', '注销', '吊销', '撤销', '迁出', '设立中', '清算中', '停业', '其他']
const ENT_TYPES = ['国有企业', '集体企业', '有限责任公司', '股份有限公司', '私营企业', '港、澳、台商投资企业', '外商投资企业', '个体工商户', '其他企业']
const CONCEPTS = ['生物医药', '人工智能', '互联网', '生物科技', '医疗美容', '素质教育', '电子商务', '网约车服务', '视频/直播']

const LEADS = [
  { name: '广州粤信科技有限公司', status: '营销成功', owner: '19156027703', dept: '普惠部', visit: '已走访', joined: '2026-08-17', op: '跟进' },
  { name: '无锡万盛橡塑制品有限责任公司', status: '待营销', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-16', op: '分配' },
  { name: '世泰仕塑料有限公司', status: '待营销', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-16', op: '分配' },
  { name: '江阴华昌食品添加剂有限公司', status: '营销中', owner: '19156027703', dept: '普惠部', visit: '需走访', joined: '2026-08-15', op: '跟进' },
  { name: '苏州纳微科技股份有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-14', op: '分配' },
  { name: '深圳某某电子有限公司', status: '营销失败', owner: '19156027703', dept: '公司部', visit: '已走访', joined: '2026-08-12', op: '跟进' },
]

function StatChip({ label, value, tone = 'slate' }: { label: string; value: string; tone?: 'slate' | 'emerald' | 'amber' | 'rose' | 'brand' }) {
  const toneCls = {
    slate: 'bg-slate-50 text-slate-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    brand: 'bg-brand-50 text-brand-700',
  }[tone]
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
          <button
            key={it}
            onClick={() => setSel((s) => (s.includes(it) ? s.filter((x) => x !== it) : [...s, it]))}
            className={`rounded-md border px-2.5 py-1 text-xs transition ${on ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'}`}
          >
            {it}
          </button>
        )
      })}
    </div>
  )
}

function DetailPanel() {
  const [tab, setTab] = useState<'all' | 'board'>('all')
  const [uploadTab, setUploadTab] = useState('本地Excel上传')
  const uploadTabs = ['本地Excel上传', '从全维搜索添加', '从区域商机添加', '从企业库添加', '从集团户添加', '从产业链添加', '从供应链添加', '从地图拓客添加', '从标讯信息添加']
  return (
    <Panel
      title="主题详情 · 乡村振兴"
      desc={<Sam label="样例线索" value={20} />}
      actions={<span className="text-xs text-slate-400">线索范围：全部 · 名单筛选：乡村振兴</span>}
    >
      {/* 输入上传 */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {uploadTabs.map((t) => (
          <button
            key={t}
            onClick={() => setUploadTab(t)}
            className={`rounded-md border px-2.5 py-1 text-xs transition ${uploadTab === t ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300'}`}
          >
            {t}
          </button>
        ))}
        <button className="ml-1 rounded-md bg-brand-600 px-3 py-1 text-xs font-medium text-white">添加企业</button>
        <span className="ml-1 self-center text-xs text-slate-400">失败列表 0</span>
      </div>

      {/* 指标条 */}
      <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
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

      {/* 双 Tab */}
      <div className="mb-3 flex gap-1.5 border-b border-slate-200 pb-2">
        <button onClick={() => setTab('all')} className={`rounded-md px-3 py-1 text-sm ${tab === 'all' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>全部线索</button>
        <button onClick={() => setTab('board')} className={`rounded-md px-3 py-1 text-sm ${tab === 'board' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:text-slate-700'}`}>数据看板</button>
      </div>

      {tab === 'all' ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>线索状态：</span>
            <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 hover:border-brand-300">营销成功</button>
            <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 hover:border-brand-300">营销失败</button>
            <span className="ml-3">归属人员：</span><span className="text-slate-400">广州粤信科技有限公司</span>
            <span className="ml-3">走访状态：</span>
            <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 hover:border-brand-300">需走访</button>
            <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 hover:border-brand-300">已走访</button>
            <span className="ml-3">加入名单时间：</span><span className="text-slate-400">至 …</span>
          </div>
          <div className="space-y-3">
            <div>
              <div className="mb-1.5 text-xs font-medium text-slate-500">省份地区</div>
              <ToggleGroup items={PROVINCES} />
            </div>
            <div>
              <div className="mb-1.5 text-xs font-medium text-slate-500">所在行业</div>
              <ToggleGroup items={INDUSTRIES} />
            </div>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              <div><div className="mb-1.5 text-xs font-medium text-slate-500">经营状态</div><ToggleGroup items={STATUS_OPTS} /></div>
              <div><div className="mb-1.5 text-xs font-medium text-slate-500">企业类型</div><ToggleGroup items={ENT_TYPES} /></div>
              <div><div className="mb-1.5 text-xs font-medium text-slate-500">概念标签 · 业务概念</div><ToggleGroup items={CONCEPTS} /></div>
            </div>
          </div>
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
            exportName="乡村振兴线索"
          />
        </div>
      ) : (
        <div className="space-y-4">
          <Panel title="部门营销数据" desc={<span className="text-xs text-slate-400">统计口径：全部名单及线索，含个人可见名单及线索</span>} actions={<button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300">导出营销成功企业</button>}>
            <DataTable
              columns={[
                { key: 'idx', label: '序号', width: '60px' },
                { key: 'dept', label: '部门', fixed: 'left' },
                { key: 'follow', label: '有跟进' },
                { key: 'succ', label: '营销成功' },
                { key: 'fc', label: '跟进次数' },
                { key: 'active', label: '活跃次数' },
              ]}
              rows={[
                { idx: '1', dept: '授信部', follow: '-', succ: '-', fc: '-', active: '-' },
                { idx: '2', dept: '风险部', follow: '-', succ: '-', fc: '-', active: '-' },
                { idx: '3', dept: '普惠部', follow: '4', succ: '-', fc: '-', active: '-' },
                { idx: '4', dept: '公司部', follow: '暂无数据', succ: '-', fc: '-', active: '-' },
              ]}
              pager
              pageSizeOptions={[10, 20]}
              exportable
              exportName="部门营销数据"
            />
          </Panel>
          <Panel title="个人排行榜">
            <DataTable
              columns={[
                { key: 'name', label: '姓名', fixed: 'left' },
                { key: 'phone', label: '工号/账号' },
                { key: 'org', label: '归属机构' },
                { key: 'rate', label: '成功率', align: 'right' },
              ]}
              rows={[{ name: '19156027703', phone: '19156027703', org: '广州粤信科技有限公司', rate: '5.00%' }]}
              pager
              pageSizeOptions={[10, 20]}
              exportable
              exportName="个人排行榜"
            />
          </Panel>
        </div>
      )}
    </Panel>
  )
}

export default function DmMarketList() {
  const [selected, setSelected] = useState<string | null>(null)
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="营销名单" crumb="数字营销 / 营销管理" subtitle="营销目标名单管理：名单生成、分发与转化追踪" />
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white">新建名单</button>
          <span className="text-sm text-slate-500">共 {LISTS.length} 个名单</span>
        </div>
        <input placeholder="搜索名单名称" className="w-64 rounded-md border border-slate-200 px-3 py-1.5 text-sm text-slate-600 outline-none focus:border-brand-300" />
      </div>
      <Panel title="营销名单" desc={<Sam label="样例名单" value={LISTS.length} />}>
        <DataTable
          columns={[
            { key: 'name', label: '名单名称', width: '200px', fixed: 'left', render: (row) => <span className="cursor-pointer text-brand-600 hover:underline" onClick={() => setSelected((row as unknown as MarketList).id)}>{(row as unknown as MarketList).name}</span> },
            { key: 'leads', label: '线索数', align: 'right' },
            { key: 'marketing', label: '营销中', align: 'right' },
            { key: 'ended', label: '营销结束', align: 'right' },
            { key: 'creator', label: '创建人' },
            { key: 'created', label: '创建时间' },
            { key: 'scope', label: '名单可见范围' },
            { key: 'op', label: '操作', render: () => <span className="cursor-pointer text-brand-600 hover:underline">暂无数据</span> },
          ]}
          rows={LISTS}
          pager
          pageSizeOptions={[10, 20]}
          exportable
          exportName="营销名单"
        />
      </Panel>
      {selected && <div className="mt-6"><DetailPanel /></div>}
    </div>
  )
}
