import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable, StatCard } from '../components/ui'
import { Sam } from './SourceTag'

type Row = {
  name: string
  link: string
  park: string
  biz: string
  risk: string
  score: string
  region: string
  status: string
  group: string
  tag: string
  dept: string
  owner: string
  addBy: string
  addDate: string
  note: string
}

const ROWS: Row[] = [
  {
    name: '抖音有限公司', link: '-', park: '中关村科技园区海淀园',
    biz: '2025-11-20 发生新获融资', risk: '2026-08-17 新增开庭公告',
    score: '650', region: '北京市海淀区', status: '存续', group: '抖音集团',
    tag: '—', dept: '—', owner: '广州粤信科技有限公司', addBy: '2026-08-17', addDate: '0', note: '操作',
  },
  {
    name: '抖音视界有限公司', link: '中关村科技园区石景山园、西山汇(中关村科技园石景山园)',
    park: '2026-05-22 发生新增中标', biz: '', risk: '',
    score: '726', region: '北京市石景山区', status: '存续', group: '北京字跳网络技术集团',
    tag: '暂无数据', dept: '—', owner: '—', addBy: '—', addDate: '—', note: '操作',
  },
]

const SIDEBAR_GROUPS: { title: string; items: string[] }[] = [
  { title: '客商数据范围', items: ['全部', '本人', '本人及下属部门', '本部门', '本部门及下属部门'] },
  { title: '有无备注', items: ['有备注', '无备注'] },
]

const TAG_GROUPS = ['未分组', '长时间未联系', '重点维护']

function StatPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Panel title={title} className="bg-white">
      <div className="space-y-2 text-sm">{children}</div>
    </Panel>
  )
}

export default function DmExistBiz() {
  const [tab, setTab] = useState<'biz' | 'list'>('biz')
  const [activeTag, setActiveTag] = useState('重点维护')

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="存客商机"
        crumb="数字营销 / 存客管理"
        subtitle="存量客户交叉销售与向上销售商机挖掘：客商筛选、合同到期提醒与重点跟进"
      />

      {/* 顶部分析导航 */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {['合同到期提醒', '存客分析', '存客商机', '存客风险', '存客画像'].map((m, i) => (
          <span
            key={m}
            className={`rounded-md border px-2.5 py-1 text-xs ${
              m === '存客商机' ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600'
            }`}
          >
            {m}
          </span>
        ))}
        <div className="ml-auto flex gap-2">
          <button className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-brand-300">单个添加</button>
          <button className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-brand-300">批量添加</button>
        </div>
      </div>

      {/* 双 Tab */}
      <div className="mb-4 flex gap-1 border-b border-slate-200">
        {([['biz', '存客商机'], ['list', '存客列表']] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium transition ${
              tab === k ? 'border-brand-500 text-brand-700' : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
        {/* 左侧筛选 */}
        <div className="space-y-4">
          <Panel title="部门人员" className="bg-white">
            <div className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-2 text-sm">
              <span className="text-slate-600">19156027703</span>
              <span className="text-xs text-slate-400">click 激活</span>
            </div>
          </Panel>

          <Panel title="客商标签" className="bg-white" actions={<span className="cursor-pointer text-xs text-brand-600">编辑标签</span>}>
            <div className="flex flex-wrap gap-1.5">
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">默认分组</span>
            </div>
          </Panel>

          <Panel title="客商分组" className="bg-white" actions={<span className="cursor-pointer text-xs text-brand-600">管理分组</span>}>
            <div className="flex flex-col gap-1">
              {TAG_GROUPS.map((g) => (
                <button
                  key={g}
                  onClick={() => setActiveTag(g)}
                  className={`rounded-md border px-3 py-1.5 text-left text-xs transition ${
                    activeTag === g ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:border-brand-300'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </Panel>

          {SIDEBAR_GROUPS.map((g) => (
            <StatPanel key={g.title} title={g.title}>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((it) => (
                  <button key={it} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 transition hover:border-brand-300">
                    {it}
                  </button>
                ))}
              </div>
            </StatPanel>
          ))}

          <Panel title="时间筛选" className="bg-white">
            <div className="space-y-2 text-sm text-slate-600">
              {['添加时间', '合同开始时间', '合同到期时间', '付款日期'].map((t) => (
                <div key={t} className="flex items-center justify-between rounded-md border border-slate-200 px-3 py-1.5">
                  <span>{t}</span>
                  <span className="text-xs text-slate-400">至 …</span>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300">更多</button>
                <button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300">高级筛选</button>
              </div>
            </div>
          </Panel>
        </div>

        {/* 右侧结果 */}
        <div className="space-y-4">
          {tab === 'biz' ? (
            <>
              <div className="flex flex-wrap items-center gap-3">
                <StatCard label="重点客商" value="2" accent="brand" hint="本分组客商" />
                <StatCard label="合同将到期" value="0" accent="amber" hint="近 30 天" />
                <StatCard label="高风险客商" value="1" accent="rose" hint="开庭公告/违约" />
              </div>

              <Panel
                title="合同到期提醒"
                desc={<Sam label="样例客商" value={2} />}
                actions={
                  <div className="flex flex-wrap gap-1.5 text-xs">
                    {['设置标签', '变更标签', '增加标签', '删除标签', '变更负责人', '变更分组', '删除', '导出'].map((a) => (
                      <button key={a} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:border-brand-300">
                        {a}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="mb-3 flex items-center gap-2 text-sm text-slate-600">
                  <span>找到 <b className="text-ink-900">2</b> 条结果</span>
                  <span className="text-xs text-slate-400">展示字段 (15/26)</span>
                </div>
                <DataTable
                  pager
                  pageSizeOptions={[10, 20]}
                  columns={[
                    { key: 'name', label: '企业名称', width: '180px', fixed: 'left' },
                    { key: 'link', label: '产业环节' },
                    { key: 'park', label: '所在园区' },
                    { key: 'biz', label: '最新商机' },
                    { key: 'risk', label: '最新风险' },
                    { key: 'score', label: '启信分', align: 'right' },
                    { key: 'region', label: '地区' },
                    { key: 'status', label: '企业状态', render: (r) => (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">{(r.status as string) || '—'}</span>
                    ) },
                    { key: 'group', label: '所属集团' },
                    { key: 'tag', label: '标签' },
                    { key: 'dept', label: '部门' },
                    { key: 'owner', label: '负责人' },
                    { key: 'addBy', label: '添加人' },
                    { key: 'addDate', label: '添加时间' },
                    { key: 'note', label: '备注' },
                    { key: 'op', label: '操作', render: () => <span className="cursor-pointer text-brand-600 hover:underline">查看</span> },
                  ]}
                  rows={ROWS as unknown as Record<string, unknown>[]}
                />
              </Panel>
            </>
          ) : (
            <Panel title="存客列表" desc={<Sam label="样例客商" value={2} />} actions={<span className="text-xs text-slate-400">导出前 2 条</span>}>
              <DataTable
                pager
                pageSizeOptions={[10, 20]}
                columns={[
                  { key: 'name', label: '企业名称', width: '180px', fixed: 'left' },
                  { key: 'region', label: '地区' },
                  { key: 'status', label: '企业状态' },
                  { key: 'group', label: '所属集团' },
                  { key: 'op', label: '操作', render: () => <span className="cursor-pointer text-brand-600 hover:underline">查看</span> },
                ]}
                rows={ROWS as unknown as Record<string, unknown>[]}
              />
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
