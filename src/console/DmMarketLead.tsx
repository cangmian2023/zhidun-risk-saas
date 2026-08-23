import { useState } from 'react'
import { PageShell } from './PageShell'
import { RightDrawer } from '../components/ui'
import { usePageNav } from './pageNav'

/* ============ 图标（系统未引入 FontAwesome，按 HTML 视觉等价替换为内联 SVG） ============ */
const ChevronDown = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-0.5">
    <path d="M2.5 4.5 6 8l3.5-3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ChevronUp = () => (
  <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="inline align-middle ml-0.5">
    <path d="M2.5 7.5 6 4l3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const CogsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="2.2" stroke="currentColor" strokeWidth="1.2" />
    <path d="M8 1.8v2.2M8 12v2.2M1.8 8h2.2M12 8h2.2M3.5 3.5l1.6 1.6M10.9 10.9l1.6 1.6M12.5 3.5l-1.6 1.6M5.1 10.9l-1.6 1.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
)
const MapIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M8 1.5c3 0 5 2 5 5 0 3.5-5 8-5 8s-5-4.5-5-8c0-3 2-5 5-5Z" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="8" cy="6.5" r="1.6" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)
const DownloadIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)
const ColumnsIcon = () => (
  <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2.5" width="4.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
    <rect x="9.5" y="2.5" width="4.5" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)
const CopyIcon = () => (
  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="inline align-middle ml-1 cursor-pointer text-slate-400">
    <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
    <path d="M3 11V4a1 1 0 0 1 1-1h7" stroke="currentColor" strokeWidth="1.3" />
  </svg>
)
const SortIcon = () => (
  <svg width="10" height="12" viewBox="0 0 10 12" fill="none" className="inline align-middle ml-0.5">
    <path d="M2 4 5 1l3 3" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M2 8 5 11l3-3" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

/* ============ 筛选项（等价 HTML .filter-item / 收起） ============ */
const FilterItem = ({ label, collapse }: { label: string; collapse?: boolean }) => (
  <span className={`mr-3 inline-block cursor-pointer text-sm ${collapse ? 'text-blue-500' : 'text-gray-600 hover:text-blue-500'}`}>
    {label} {collapse ? <ChevronUp /> : <ChevronDown />}
  </span>
)
const FilterTitle = ({ children }: { children?: React.ReactNode }) => (
  <span className="mr-2 inline-block w-20 font-medium text-gray-700">{children}</span>
)

/* ============ 指标卡（等价 HTML .card-item） ============ */
function StatCard({ children }: { children: React.ReactNode }) {
  return <div className="flex-1 min-w-[240px] border-r border-slate-200 bg-white px-4 py-3 last:border-r-0">{children}</div>
}

/* ============ 表格数据（与 HTML 样例逐行一致） ============ */
type LeadRow = {
  name: string
  tags?: string[]
  listName: string
  status: string
  statusTone: 'blue' | 'amber'
  joined: string
  dept: string
  owner: string
  visit: string
  qx: string
  occur: string
  latest: string
  ops: { label: string; caret?: boolean }[]
}

const LEADS: LeadRow[] = [
  {
    name: '上海数臻信息科技有限公司',
    listName: '乡村振兴',
    status: '营销中', statusTone: 'blue',
    joined: '2026-08-17', dept: '-', owner: '1915602...', visit: '需走访',
    qx: '0', occur: '-', latest: '-',
    ops: [{ label: 'AI+', caret: true }, { label: '分配' }, { label: '记录' }, { label: '更多', caret: true }],
  },
  {
    name: '上海坤元数智技术有限公司',
    tags: ['民营企业', '有软著', '有商标'],
    listName: '乡村振兴',
    status: '未分配', statusTone: 'amber',
    joined: '2026-08-17', dept: '-', owner: '1915602...', visit: '需走访',
    qx: '676', occur: '-', latest: '-',
    ops: [{ label: 'AI+', caret: true }, { label: '分配' }, { label: '跟进' }, { label: '更多', caret: true }],
  },
]

const SCOPES = ['全部', '本人', '本人及下属部门', '本部门', '本部门及下属部门']

function statusBadge(tone: 'blue' | 'amber') {
  return tone === 'blue' ? 'bg-blue-100 text-blue-600' : 'bg-amber-50 text-amber-700'
}

export default function DmMarketLead() {
  const { goDetail } = usePageNav()
  const [scope, setScope] = useState('全部')
  const [fName, setFName] = useState('')
  const [fList, setFList] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [fDept, setFDept] = useState('')
  const [fHealth, setFHealth] = useState('')
  const [drawer, setDrawer] = useState<{ type: 'market' | 'touch'; name: string } | null>(null)

  const listOpts = Array.from(new Set(LEADS.map((l) => l.listName)))
  const statusOpts = Array.from(new Set(LEADS.map((l) => l.status)))
  const deptOpts = Array.from(new Set(LEADS.map((l) => l.dept)))
  const filtered = LEADS.filter((l) => {
    if (fName && !l.name.includes(fName)) return false
    if (fList && l.listName !== fList) return false
    if (fStatus && l.status !== fStatus) return false
    if (fDept && l.dept !== fDept) return false
    if (fHealth && Number(l.qx) < Number(fHealth)) return false
    return true
  })
  return (
    <div style={{ padding: 24, maxWidth: 2200, margin: '0 auto' }}>
      <PageShell title="营销线索" crumb="数字营销 / 营销管理" subtitle="营销线索池：线索采集、打分与分配跟进" legend={false} />

      {/* 顶部指标卡片 */}
      <div className="mb-4 flex overflow-x-auto rounded border bg-white">
        <StatCard>
          <div className="font-semibold">总线索 <span className="text-lg">20</span> 条</div>
          <div className="mt-1 text-sm text-gray-500">未分配 19 &nbsp;|&nbsp; 已分配 1</div>
        </StatCard>
        <StatCard>
          <div className="font-semibold">待营销 <span className="text-lg">0</span> 条</div>
          <div className="mt-1 text-sm text-gray-500">30天未跟进 0 &nbsp;|&nbsp; 近7日新增 0</div>
        </StatCard>
        <StatCard>
          <div className="font-semibold">营销中 <span className="text-lg">1</span> 条</div>
          <div className="mt-1 text-sm text-gray-500">有限进记录 0 &nbsp;|&nbsp; 无跟进记录 1</div>
        </StatCard>
        <StatCard>
          <div className="font-semibold">营销结束 <span className="text-lg">0</span> 条</div>
          <div className="mt-1 text-sm text-gray-500">成功 0 &nbsp;|&nbsp; 失败 0 &nbsp;|&nbsp; 无需营销 0</div>
        </StatCard>
      </div>

      {/* 线索范围标签 */}
      <div className="mb-4 rounded border bg-white px-4 py-3">
        <span className="mr-3 text-gray-600">线索范围：</span>
        {SCOPES.map((s) => {
          const on = scope === s
          return (
            <span
              key={s}
              onClick={() => setScope(s)}
              className={`mr-2 cursor-pointer rounded px-2 py-1 text-sm ${on ? 'bg-[#1f47f5] text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
            >
              {s}
            </span>
          )
        })}
      </div>

      {/* 高级筛选区域 */}
      <div className="mb-4 rounded border bg-white px-4 py-3">
        <div className="mb-2 flex flex-wrap items-center">
          <FilterTitle>线索筛选</FilterTitle>
          <select value={fList} onChange={(e) => setFList(e.target.value)} className="mr-3 rounded border px-2 py-1 text-sm text-gray-600 outline-none">
            <option value="">名单筛选（全部）</option>
            {listOpts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={fStatus} onChange={(e) => setFStatus(e.target.value)} className="mr-3 rounded border px-2 py-1 text-sm text-gray-600 outline-none">
            <option value="">线索状态（全部）</option>
            {statusOpts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={fDept} onChange={(e) => setFDept(e.target.value)} className="mr-3 rounded border px-2 py-1 text-sm text-gray-600 outline-none">
            <option value="">归属部门（全部）</option>
            {deptOpts.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
          <select value={fHealth} onChange={(e) => setFHealth(e.target.value)} className="mr-3 rounded border px-2 py-1 text-sm text-gray-600 outline-none">
            <option value="">企业健康度（不限）</option>
            <option value="600">≥600</option>
            <option value="700">≥700</option>
            <option value="800">≥800</option>
          </select>
        </div>

        <div className="mb-2">
          <FilterTitle>基本筛选</FilterTitle>
          <FilterItem label="省份地区" />
          <FilterItem label="所在行业" />
          <FilterItem label="成立年限" />
          <FilterItem label="注册资本" />
          <FilterItem label="实缴资本" />
          <FilterItem label="经营状态" />
          <FilterItem label="企业类型" />
          <FilterItem label="组织类型" />
          <FilterItem label="参保人数" />
          <FilterItem label="企业健康度" />
          <FilterItem label="税务资质" />
          <FilterItem label="进出口信息" />
          <FilterItem label="融资信息" />
          <FilterItem label="专利信息" />
          <FilterItem label="商标信息" />
          <FilterItem label="收起" collapse />
          <br />
          <FilterItem label="著作权" />
        </div>

        <div className="mb-2">
          <FilterTitle>概念标签</FilterTitle>
          <FilterItem label="业务概念" />
          <FilterItem label="企业特点" />
          <FilterItem label="榜单企业" />
          <FilterItem label="企业组织机构类型" />
          <FilterItem label="企业规模" />
          <FilterItem label="区域类型" />
          <FilterItem label="技术领先" />
          <FilterItem label="金融机构" />
          <FilterItem label="供应商企业" />
          <FilterItem label="司法涉诉" />
          <FilterItem label="风险特征" />
          <FilterItem label="自贸区" />
          <FilterItem label="资金扩张" />
          <FilterItem label="业务扩张" />
          <FilterItem label="人员扩张" />
          <FilterItem label="收起" collapse />
        </div>

        <div className="mb-2">
          <FilterTitle>科技认定</FilterTitle>
          <FilterItem label="专精特新" />
          <FilterItem label="专精特新小巨人" />
          <FilterItem label="科技小巨人" />
          <FilterItem label="科技型企业" />
          <FilterItem label="科技型中小企业" />
          <FilterItem label="高新企业" />
          <FilterItem label="独角兽企业" />
          <FilterItem label="种子独角兽" />
          <FilterItem label="未来独角兽" />
          <FilterItem label="民营科技企业" />
          <FilterItem label="收起" collapse />
        </div>

        <div className="mb-2">
          <FilterTitle>风险信息</FilterTitle>
          <FilterItem label="失信被执行人" />
          <FilterItem label="被执行人" />
          <FilterItem label="终本案件" />
          <FilterItem label="动产抵押" />
          <FilterItem label="限制高消费" />
        </div>

        <div className="mb-2">
          <FilterTitle>联系方式</FilterTitle>
          <FilterItem label="手机号码" />
          <FilterItem label="座机号码" />
          <FilterItem label="空号过滤" />
          <FilterItem label="邮箱地址" />
          <FilterItem label="企业地址" />
          <FilterItem label="企业网址" />
        </div>

        <div className="mt-3 text-center">
          <span className="cursor-pointer text-blue-500">收起筛选 <ChevronUp /></span>
        </div>
      </div>

      {/* 工具栏 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded border bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="text-gray-600">找到 20 条结果</span>
          <button className="flex items-center gap-1 rounded border px-3 py-1 text-sm">
            <CogsIcon /> 批量操作
          </button>
        </div>
        <div className="flex items-center gap-3">
          <input value={fName} onChange={(e) => setFName(e.target.value)} className="w-56 rounded border px-3 py-1 text-sm" placeholder="请输入企业名称" />
          <button className="flex items-center gap-1 rounded border px-3 py-1 text-sm">
            <MapIcon /> 地图派单
          </button>
          <button className="flex items-center gap-1 rounded border px-3 py-1 text-sm">
            <DownloadIcon /> 导出
          </button>
          <button className="flex items-center gap-1 rounded border px-3 py-1 text-sm">
            <ColumnsIcon /> 展示字段(10/10)
          </button>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="overflow-x-auto rounded border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="w-8 border px-3 py-2 text-left"><input type="checkbox" /></th>
              <th className="min-w-[200px] border px-3 py-2 text-left">企业名称</th>
              <th className="min-w-[120px] border px-3 py-2 text-left">名单名称</th>
              <th className="min-w-[100px] border px-3 py-2 text-left">线索状态</th>
              <th className="min-w-[120px] border px-3 py-2 text-left">加入名单时间</th>
              <th className="min-w-[140px] border px-3 py-2 text-left">线索归属部门</th>
              <th className="min-w-[140px] border px-3 py-2 text-left">线索归属人员</th>
              <th className="min-w-[100px] border px-3 py-2 text-left">走访状态</th>
              <th className="min-w-[80px] border px-3 py-2 text-left">企业健康度 <SortIcon /></th>
              <th className="min-w-[100px] border px-3 py-2 text-left">发生日期</th>
              <th className="min-w-[140px] border px-3 py-2 text-left">最新商机内容</th>
              <th className="min-w-[220px] border px-3 py-2 text-left">操作</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l, i) => (
              <tr key={i} className="hover:bg-gray-50">
                <td className="border px-3 py-2"><input type="checkbox" /></td>
                <td className="border px-3 py-2">
                  <button onClick={() => goDetail('/console/dm/ent-archive-basic', { name: l.name })} className="cursor-pointer text-blue-500 text-left">{l.name}</button>
                  {l.tags && (
                    <div className="mt-1">
                      {l.tags.map((t) => (
                        <span key={t} className="mr-1 rounded bg-gray-100 px-1 text-xs">{t}</span>
                      ))}
                      <span className="text-xs text-gray-400">...</span>
                    </div>
                  )}
                </td>
                <td className="border px-3 py-2">{l.listName}</td>
                <td className="border px-3 py-2">
                  <span className={`rounded px-2 py-0.5 text-xs ${statusBadge(l.statusTone)}`}>{l.status}</span>
                </td>
                <td className="border px-3 py-2">{l.joined}</td>
                <td className="border px-3 py-2">{l.dept}</td>
                <td className="border px-3 py-2">
                  <span>{l.owner}</span><CopyIcon />
                </td>
                <td className="border px-3 py-2">
                  <span className="rounded bg-orange-100 px-2 py-0.5 text-xs text-orange-600">{l.visit}</span>
                </td>
                <td className="border px-3 py-2">{l.qx}</td>
                <td className="border px-3 py-2">{l.occur}</td>
                <td className="border px-3 py-2">{l.latest}</td>
                <td className="border px-3 py-2">
                  <button onClick={() => setDrawer({ type: 'market', name: l.name })} className="mr-2 text-sm text-blue-500 hover:underline">营销</button>
                  <button onClick={() => setDrawer({ type: 'touch', name: l.name })} className="mr-2 text-sm text-blue-500 hover:underline">触达</button>
                  <button className="mr-2 text-sm text-blue-500 hover:underline">分配</button>
                  <button className="text-sm text-blue-500 hover:underline">记录</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页区域（预留） */}
      <div className="mt-3 flex justify-end">
        <div className="rounded border px-3 py-2 text-sm text-gray-500">分页组件区域</div>
      </div>

      <RightDrawer open={!!drawer} onClose={() => setDrawer(null)} title={drawer?.type === 'market' ? '营销' : '触达'} width={480}>
        {drawer && (drawer.type === 'market' ? (
          <div className="space-y-4 text-sm">
            <div className="rounded-md bg-slate-50 px-3 py-2">企业：<span className="font-medium">{drawer.name}</span></div>
            <div>
              <div className="mb-1 font-medium text-slate-600">关联营销产品</div>
              <div className="space-y-1">
                {['普惠信用贷', '设备更新贷', '供应链金融'].map((p) => (
                  <label key={p} className="flex items-center gap-2 rounded border border-slate-200 px-3 py-2 text-slate-600">
                    <input type="checkbox" className="accent-blue-600" />{p}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <div className="mb-1 font-medium text-slate-600">营销话术</div>
              <textarea rows={3} placeholder="请输入本次营销沟通要点" className="w-full resize-none rounded border border-slate-200 px-3 py-2 text-slate-700 outline-none" />
            </div>
            <button className="w-full rounded-md bg-[#1f47f5] py-2 text-white">发起营销</button>
          </div>
        ) : (
          <div className="space-y-4 text-sm">
            <div className="rounded-md bg-slate-50 px-3 py-2">企业：<span className="font-medium">{drawer.name}</span></div>
            <div className="space-y-2">
              {[
                { k: '手机号', v: '19156027703' },
                { k: '座机', v: '021-5888 6666' },
                { k: '邮箱', v: 'contact@example.com' },
                { k: '地址', v: '上海市浦东新区张江高科技园区博云路2号' },
              ].map((c) => (
                <div key={c.k} className="flex items-center justify-between rounded border border-slate-200 px-3 py-2">
                  <span className="text-slate-500">{c.k}</span>
                  <span className="flex items-center gap-2"><span className="font-medium">{c.v}</span><button className="text-blue-500">复制</button></span>
                </div>
              ))}
            </div>
            <button className="w-full rounded-md bg-[#1f47f5] py-2 text-white">发送触达</button>
          </div>
        ))}
      </RightDrawer>
    </div>
  )
}
