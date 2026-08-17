import { useState } from 'react'
import { PageShell } from './PageShell'
import { Panel, DataTable } from '../components/ui'

// 数据直接取自源快照 `营销 - 营销看板` 自带样例数据（用户确认源文件本身含样例，可直接用），
// 不做「功能/数据分离」（不抽本地 JSON、不走 load/save 端点）。0 是真值，原样保留。

// KPI：源真实结构为启信宝 `theme-status-board-container` 四步状态看板（线索→待营销→营销中→营销结束），
// 每步顶部大数字带专属配色、底部挂 2~3 个细分指标，步间用箭头连接。非"4 组 × 3 卡片"。
const STEPS = [
  { title: '总线索', value: '20', unit: '条', color: '#00000a', items: [{ t: '未分配', v: '19', c: '#ffa753' }, { t: '已分配', v: '1' }] },
  { title: '待营销', value: '0', unit: '条', color: '#1c6920', items: [{ t: '30天未跟进', v: '0' }, { t: '近7日新增', v: '0' }] },
  { title: '营销中', value: '1', unit: '条', color: '#1a53ff', items: [{ t: '有跟进记录', v: '0' }, { t: '无跟进记录', v: '1' }] },
  { title: '营销结束', value: '0', unit: '条', color: '#0d2eb7', items: [{ t: '成功', v: '0' }, { t: '失败', v: '0' }, { t: '无需营销', v: '0' }] },
]

const SCOPE_OPTIONS = ['全部', '本人', '本人及下属部门', '本部门', '本部门及下属部门']
const NAME_TAGS = ['乡村振兴']

// 部门营销数据：列头与样例行均取自源 DOM（序号自动、活跃次数仅普惠部=4、公司部=暂无数据，其余为 -）。
const DEPT_COLUMNS = [
  { key: 'idx', label: '序号', width: '60px' },
  { key: 'dept', label: '部门', fixed: 'left' },
  { key: 'wait', label: '待营销' },
  { key: 'ing', label: '营销中' },
  { key: 'follow', label: '有跟进' },
  { key: 'succ', label: '营销成功' },
  { key: 'fc', label: '跟进次数' },
  { key: 'active', label: '活跃次数' },
]

const DEPT_ROWS = [
  { idx: '1', dept: '授信部', wait: '-', ing: '-', follow: '-', succ: '-', fc: '-', active: '-' },
  { idx: '2', dept: '风险部', wait: '-', ing: '-', follow: '-', succ: '-', fc: '-', active: '-' },
  { idx: '3', dept: '普惠部', wait: '-', ing: '-', follow: '-', succ: '-', fc: '-', active: '4' },
  { idx: '4', dept: '公司部', wait: '-', ing: '-', follow: '-', succ: '-', fc: '-', active: '暂无数据' },
]

// 个人排行榜：列头取自源 DOM（无"成功率"列），样例行取自源（19156027703 / 广州粤信科技有限公司，姓名列带操作下拉）。
const PERSON_COLUMNS = [
  { key: 'idx', label: '序号', width: '60px' },
  { key: 'name', label: '姓名', fixed: 'left' },
  { key: 'dept', label: '部门' },
  { key: 'wait', label: '待营销' },
  { key: 'ing', label: '营销中' },
  { key: 'follow', label: '有跟进' },
  { key: 'succ', label: '营销成功' },
  { key: 'fc', label: '跟进次数' },
  { key: 'active', label: '活跃次数' },
]

const PERSON_ROWS = [
  { idx: '1', name: '19156027703', dept: '广州粤信科技有限公司', wait: '-', ing: '1', follow: '5.00%', succ: '1', fc: '5.00%', active: '-' },
]

export default function DmMarketBoard() {
  const [scope, setScope] = useState('全部')
  const [tags, setTags] = useState<string[]>(NAME_TAGS)

  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell title="营销看板" crumb="数字营销 / 营销管理" subtitle="营销核心指标实时看板：触达、转化与 ROI" />

      {/* 筛选条：线索筛选(下拉) / 名单筛选(标签) / 更新日期(区间) / 创建日期(区间) / 更多 */}
      <div className="mb-5 flex flex-wrap items-center gap-x-4 gap-y-3 rounded-lg border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">线索筛选</span>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-brand-300"
          >
            {SCOPE_OPTIONS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">名单筛选</span>
          <div className="flex items-center gap-1">
            {tags.map((tg) => (
              <span
                key={tg}
                className="inline-flex items-center gap-1 rounded-md border border-brand-200 bg-brand-50 px-2 py-1 text-xs text-brand-700"
              >
                {tg}
                <button
                  className="text-brand-400 hover:text-brand-700"
                  onClick={() => setTags(tags.filter((x) => x !== tg))}
                >
                  ×
                </button>
              </span>
            ))}
            <span className="cursor-pointer text-xs text-slate-400">+ 添加</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">更新日期</span>
          <input type="date" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-brand-300" />
          <span className="text-xs text-slate-400">至</span>
          <input type="date" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-brand-300" />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-500">创建日期</span>
          <input type="date" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-brand-300" />
          <span className="text-xs text-slate-400">至</span>
          <input type="date" className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-brand-300" />
        </div>

        <button className="ml-auto rounded-md border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 hover:border-brand-300">更多</button>
      </div>

      {/* KPI：四步状态看板（线索→待营销→营销中→营销结束），步间箭头连接 */}
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {STEPS.map((st, idx) => (
          <div key={st.title} className="flex flex-1 items-center gap-3">
            <div className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="text-xs text-slate-500">{st.title}</div>
              <div className="mt-1 flex items-baseline gap-1">
                <span className="text-3xl font-bold leading-none" style={{ color: st.color }}>{st.value}</span>
                <span className="text-xs text-slate-400">{st.unit}</span>
              </div>
              <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-2">
                {st.items.map((it) => (
                  <div key={it.t} className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">{it.t}</span>
                    <span className="font-medium" style={{ color: it.c || '#334155' }}>{it.v}</span>
                  </div>
                ))}
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <span className="hidden text-2xl font-light text-slate-300 lg:inline">→</span>
            )}
          </div>
        ))}
      </div>

      {/* 数据表：源自带样例数据，直接渲染真实行 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Panel
          title="部门营销数据"
          desc={<span className="text-xs text-slate-400">图表分析</span>}
          actions={<button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300">导出营销成功企业</button>}
        >
          <DataTable pager pageSizeOptions={[10, 20]} columns={DEPT_COLUMNS} rows={DEPT_ROWS} />
          <p className="mt-2 text-xs text-slate-400">统计口径：全部名单及线索，其中包含了个人可见的名单及线索。</p>
        </Panel>
        <Panel
          title="个人排行榜"
          actions={<button className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-600 hover:border-brand-300">导出营销成功企业</button>}
        >
          <DataTable pager pageSizeOptions={[10, 20]} columns={PERSON_COLUMNS} rows={PERSON_ROWS} />
        </Panel>
      </div>
    </div>
  )
}
