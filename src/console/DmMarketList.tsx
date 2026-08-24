import { useState, useMemo, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { PageShell } from './PageShell'
import { usePageNav } from './pageNav'

/* ===================== 类型 ===================== */
type MktRow = {
  id: string
  name: string
  sample: boolean
  remark: string
  leads: number
  marketing: number
  ended: number
  creator: string
  created: string
  scope: string
}

type Lead = {
  name: string
  status: string
  owner: string
  dept: string
  visit: string
  joined: string
}

/* ===================== 样例数据（本地内置，未接接口） ===================== */
const LISTS: MktRow[] = [
  { id: 'rural', name: '乡村振兴', sample: true, remark: '面向县域及乡村地区普惠客群，覆盖种植、养殖、加工产业链', leads: 20, marketing: 1, ended: 0, creator: '-广州粤信科技有限公司', created: '2026-08-17', scope: '全行可见' },
  { id: 'tech-sme', name: '科技型中小企业', sample: false, remark: '国家级高新技术企业及科技型中小企业池', leads: 156, marketing: 32, ended: 12, creator: '张三', created: '2026-08-15', scope: '部门可见' },
  { id: 'gzmfg', name: '广深制造业扩产', sample: false, remark: '珠三角制造业扩产及设备更新客群', leads: 89, marketing: 18, ended: 5, creator: '李四', created: '2026-08-12', scope: '全行可见' },
  { id: 'little-giant', name: '专精特新小巨人', sample: true, remark: "国家级专精特新'小巨人'企业名单", leads: 64, marketing: 9, ended: 3, creator: '王五', created: '2026-08-10', scope: '仅自己可见' },
  { id: 'travel', name: '文旅消费复苏', sample: false, remark: '文旅、酒店、餐饮消费复苏客群', leads: 42, marketing: 7, ended: 1, creator: '张三', created: '2026-08-08', scope: '全行可见' },
  { id: 'green', name: '绿色金融试点', sample: false, remark: '绿色信贷与碳减排支持工具试点企业', leads: 38, marketing: 5, ended: 2, creator: '赵六', created: '2026-08-05', scope: '部门可见' },
  { id: 'export', name: '外贸出口型企业', sample: false, remark: '有进出口实绩且近期订单回暖企业', leads: 77, marketing: 14, ended: 6, creator: '李四', created: '2026-08-03', scope: '全行可见' },
  { id: 'self-emp', name: '个体工商户活跃', sample: true, remark: '近90天有经营流水活跃个体工商户', leads: 203, marketing: 41, ended: 18, creator: '孙七', created: '2026-07-30', scope: '全行可见' },
  { id: 'supply', name: '上市公司供应链', sample: false, remark: 'A股上市公司一级、二级供应商', leads: 51, marketing: 8, ended: 2, creator: '王五', created: '2026-07-28', scope: '部门可见' },
  { id: 'new-citizen', name: '新市民创业', sample: false, remark: '新市民创业担保贷款潜力客群', leads: 29, marketing: 4, ended: 0, creator: '周八', created: '2026-07-25', scope: '仅自己可见' },
  { id: 'park', name: '园区规上企业', sample: false, remark: '省级以上产业园区规模以上工业企业', leads: 112, marketing: 22, ended: 9, creator: '赵六', created: '2026-07-20', scope: '全行可见' },
  { id: 'pharma', name: '医药流通', sample: false, remark: '药品及医疗器械流通与零售企业', leads: 33, marketing: 6, ended: 1, creator: '张三', created: '2026-07-15', scope: '部门可见' },
  { id: 'agri', name: '乡村振兴-农资', sample: true, remark: '农资生产、经销及农机服务客群', leads: 47, marketing: 11, ended: 4, creator: '孙七', created: '2026-07-10', scope: '全行可见' },
]

const LEADS: Lead[] = [
  { name: '广州粤信科技有限公司', status: '营销成功', owner: '19156027703', dept: '普惠部', visit: '已走访', joined: '2026-08-17' },
  { name: '无锡万盛橡塑制品有限责任公司', status: '待营销', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-16' },
  { name: '世泰仕塑料有限公司', status: '待营销', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-16' },
  { name: '江阴华昌食品添加剂有限公司', status: '营销中', owner: '19156027703', dept: '普惠部', visit: '需走访', joined: '2026-08-15' },
  { name: '苏州纳微科技股份有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-14' },
  { name: '深圳某某电子有限公司', status: '营销失败', owner: '19156027703', dept: '公司部', visit: '已走访', joined: '2026-08-12' },
]

const CREATORS = ['-广州粤信科技有限公司', '张三', '李四', '王五', '赵六', '孙七', '周八']
const SCOPES = ['全行可见', '部门可见', '仅自己可见']
const PAGE_SIZES = [10, 20, 50, 100]

/* ===================== 配色（主按钮系统主色 #1677ff） ===================== */
const Y = '#1677ff'
const Y_HOVER = '#0958d9'

/* ===================== 小图标 ===================== */
const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#333" strokeWidth="2" strokeLinecap="round" /></svg>
)
const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
)
const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#94a3b8" strokeWidth="1.6" /><path d="m11 11 3 3" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" /></svg>
)
const CloseIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
)
const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V2.5h4V4M5 4l.6 9h4.8L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
)

/* ===================== 工具：CSV 导出 ===================== */
function csvCell(v: unknown) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
function downloadCsv(filename: string, head: string[], rows: string[][]) {
  const csv = '\ufeff' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}

const todayStr = () => new Date().toISOString().slice(0, 10)

/* ===================== 主页面 ===================== */
export default function DmMarketList() {
  const { goDetail } = usePageNav()
  const [rows, setRows] = useState<MktRow[]>(LISTS)

  const [kwInput, setKwInput] = useState('')
  const [keyword, setKeyword] = useState('')
  const [creator, setCreator] = useState('')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [sortField, setSortField] = useState<'' | 'leads' | 'marketing' | 'ended' | 'created'>('')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selected, setSelected] = useState<string[]>([])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const [showNew, setShowNew] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', remark: '', scope: SCOPES[0] })

  const [showDel, setShowDel] = useState(false)
  const [delId, setDelId] = useState<string | null>(null)

  const [showExport, setShowExport] = useState(false)
  const [exportCols, setExportCols] = useState<string[]>(['name', 'leads', 'marketing', 'ended', 'creator', 'created', 'scope'])
  const [exportSelectedOnly, setExportSelectedOnly] = useState(false)

  const [toast, setToast] = useState('')

  const loadTimer = useRef<number | null>(null)
  const simulateLoad = () => {
    setLoading(true)
    setError(false)
    if (loadTimer.current) window.clearTimeout(loadTimer.current)
    loadTimer.current = window.setTimeout(() => setLoading(false), 350)
  }

  useEffect(() => () => { if (loadTimer.current) window.clearTimeout(loadTimer.current) }, [])

  const flash = (msg: string) => {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2000)
  }

  /* 筛选 + 排序 */
  const filtered = useMemo(() => {
    let list = rows.filter((r) => {
      if (keyword && !r.name.includes(keyword)) return false
      if (creator && r.creator !== creator) return false
      if (from && r.created < from) return false
      if (to && r.created > to) return false
      return true
    })
    if (sortField) {
      list = [...list].sort((a, b) => {
        let r = 0
        if (sortField === 'created') r = a.created.localeCompare(b.created)
        else r = (a[sortField] as number) - (b[sortField] as number)
        return sortDir === 'asc' ? r : -r
      })
    }
    return list
  }, [rows, keyword, creator, from, to, sortField, sortDir])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const curPage = Math.min(page, totalPages)
  const view = filtered.slice((curPage - 1) * pageSize, curPage * pageSize)

  const pageIds = view.map((r) => r.id)
  const allOn = pageIds.length > 0 && pageIds.every((id) => selected.includes(id))
  const toggleAll = () =>
    setSelected(allOn ? selected.filter((id) => !pageIds.includes(id)) : Array.from(new Set([...selected, ...pageIds])))
  const toggleOne = (id: string) =>
    setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])

  /* 交互 */
  const doSearch = () => { setKeyword(kwInput.trim()); setPage(1); simulateLoad() }
  const onCreator = (v: string) => { setCreator(v); setPage(1); simulateLoad() }
  const onFrom = (v: string) => { setFrom(v); setPage(1); simulateLoad() }
  const onTo = (v: string) => { setTo(v); setPage(1); simulateLoad() }
  const onSort = (f: 'leads' | 'marketing' | 'ended' | 'created') => {
    if (sortField !== f) { setSortField(f); setSortDir('asc') }
    else if (sortDir === 'asc') setSortDir('desc')
    else { setSortField(''); setSortDir('asc') }
    simulateLoad()
  }

  const resetFilters = () => {
    setKwInput(''); setKeyword(''); setCreator(''); setFrom(''); setTo('')
    setSortField(''); setSortDir('asc'); setPage(1); setSelected([]); simulateLoad()
  }

  const openNew = () => { setForm({ name: '', remark: '', scope: SCOPES[0] }); setShowNew(true) }
  const openEdit = (r: MktRow) => { setEditId(r.id); setForm({ name: r.name, remark: r.remark, scope: r.scope }); setShowEdit(true) }
  const submitForm = () => {
    if (!form.name.trim()) { flash('请填写名单名称'); return }
    if (editId) {
      setRows((rs) => rs.map((r) => r.id === editId ? { ...r, name: form.name.trim(), remark: form.remark, scope: form.scope } : r))
    } else {
      setRows((rs) => [{ id: 'n' + Date.now(), name: form.name.trim(), sample: false, remark: form.remark, leads: 0, marketing: 0, ended: 0, creator: '样例', created: todayStr(), scope: form.scope }, ...rs])
    }
    setShowNew(false); setShowEdit(false); setEditId(null); flash(editId ? '已保存名单' : '已新建名单')
  }
  const copyRow = (r: MktRow) => {
    setRows((rs) => [{ ...r, id: 'c' + Date.now(), name: r.name + ' (副本)', sample: false, leads: 0, marketing: 0, ended: 0, creator: '样例', created: todayStr() }, ...rs])
    flash('已复制名单')
  }
  const askDel = (r: MktRow) => { setDelId(r.id); setShowDel(true) }
  const confirmDel = () => {
    if (delId) setRows((rs) => rs.filter((r) => r.id !== delId))
    setShowDel(false); setDelId(null); setSelected([]); flash('已删除名单')
  }
  const batchDel = () => {
    setRows((rs) => rs.filter((r) => !selected.includes(r.id)))
    flash(`已批量删除 ${selected.length} 个名单`); setSelected([])
  }

  const exportRows = () => {
    const src = exportSelectedOnly && selected.length ? filtered.filter((r) => selected.includes(r.id)) : filtered
    const cols = EXPORT_COLS.filter((c) => exportCols.includes(c.key))
    const head = cols.map((c) => c.label)
    const lines = src.map((r) => cols.map((c) => (c.key === 'sample' ? (r.sample ? '样例' : '') : (r as unknown as Record<string, unknown>)[c.key] as string)))
    downloadCsv(`营销名单_导出_${todayStr()}.csv`, head, lines)
    setShowExport(false)
    flash(`已导出 ${src.length} 个名单`)
  }

  /* ===================== 渲染 ===================== */
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        title="营销名单"
        crumb="数字营销 / 营销管理"
        subtitle="营销目标名单管理：名单生成、分发与转化追踪"
        legend={false}
        actions={
          <button onClick={openNew}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: Y, color: '#333', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = Y_HOVER)}
            onMouseLeave={(e) => (e.currentTarget.style.background = Y)}>
            <PlusIcon /> 新建名单
          </button>
        }
      />

      {toast && (
        <div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</div>
      )}

      {/* ============ 区域2：筛选操作栏 ============ */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500">共 <span className="font-semibold text-slate-800">{total}</span> 个名单</span>
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-2 overflow-x-auto">
        <div className="flex items-center rounded-md border border-slate-200 bg-white" style={{ height: 36 }}>
          <span className="pl-2.5"><SearchIcon /></span>
          <input
            value={kwInput}
            onChange={(e) => setKwInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && doSearch()}
            placeholder="请输入名单名称"
            className="h-full w-56 bg-transparent px-2 text-sm text-slate-600 outline-none placeholder:text-slate-400"
          />
          <button onClick={doSearch} className="h-full rounded-r-md bg-slate-100 px-3 text-sm text-slate-600 hover:bg-slate-200">搜索</button>
        </div>

        <select value={creator} onChange={(e) => onCreator(e.target.value)}
          style={{ height: 36, borderRadius: 6, border: '1px solid #E2E8F0', padding: '0 10px', fontSize: 13, color: creator ? '#334155' : '#94A3B8', background: '#fff', cursor: 'pointer', outline: 'none' }}>
          <option value="">请输入创建人</option>
          {CREATORS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="flex items-center gap-1 text-sm text-slate-500">
          <input type="date" value={from} onChange={(e) => onFrom(e.target.value)}
            style={{ height: 36, borderRadius: 6, border: '1px solid #E2E8F0', padding: '0 8px', fontSize: 13, color: from ? '#334155' : '#94A3B8', background: '#fff', outline: 'none' }} />
          <span>—</span>
          <input type="date" value={to} onChange={(e) => onTo(e.target.value)}
            style={{ height: 36, borderRadius: 6, border: '1px solid #E2E8F0', padding: '0 8px', fontSize: 13, color: to ? '#334155' : '#94A3B8', background: '#fff', outline: 'none' }} />
        </div>

        <button onClick={() => { setExportSelectedOnly(selected.length > 0); setShowExport(true) }}
          className="ml-auto flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:border-slate-300"
          style={{ height: 36 }}>
          <DownloadIcon /> 导出
        </button>
      </div>

      {/* ============ 批量操作栏 ============ */}
      {selected.length > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-md border border-brand-200 bg-brand-50 px-3 py-2 text-sm">
          <span className="text-brand-700">已选 {selected.length} 项</span>
          <button onClick={() => { setExportSelectedOnly(true); setShowExport(true) }} className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-slate-600 hover:border-slate-300">批量导出</button>
          <button onClick={batchDel} className="flex items-center gap-1 rounded-md border border-rose-200 bg-white px-2.5 py-1 text-rose-600 hover:bg-rose-50"><TrashIcon /> 批量删除</button>
          <button onClick={() => setSelected([])} className="ml-auto text-slate-400 hover:text-slate-600">取消选择</button>
        </div>
      )}

      {/* ============ 区域3：数据表格 ============ */}
      <div className="rounded-lg border border-slate-200 bg-white">
        {error ? (
          <div className="px-3 py-16 text-center">
            <div className="text-sm text-slate-500">数据加载失败，请稍后重试</div>
            <button onClick={simulateLoad} className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300">重试</button>
          </div>
        ) : loading ? (
          <SkeletonTable />
        ) : total === 0 ? (
          <div className="px-3 py-16 text-center">
            <div className="text-sm text-slate-400">暂无符合条件的营销名单</div>
            <button onClick={resetFilters} className="mt-3 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300">重置筛选条件</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                  <th className="sticky left-0 z-20 bg-white px-3 py-3" style={{ width: 40 }}>
                    <input type="checkbox" checked={allOn} onChange={toggleAll} className="accent-blue-600" />
                  </th>
                  <th className="whitespace-nowrap px-3 py-3">名单名称</th>
                  {SORT_COLS.map((c) => (
                    <th key={c.key} className="whitespace-nowrap px-3 py-3">
                      <button onClick={() => onSort(c.key as 'leads')} className="flex items-center gap-1 hover:text-slate-700">
                        {c.label}
                        <SortArrow active={sortField === c.key} dir={sortField === c.key ? sortDir : null} />
                      </button>
                    </th>
                  ))}
                  <th className="whitespace-nowrap px-3 py-3">创建人</th>
                  <th className="whitespace-nowrap px-3 py-3">
                    <button onClick={() => onSort('created')} className="flex items-center gap-1 hover:text-slate-700">
                      创建时间 <SortArrow active={sortField === 'created'} dir={sortField === 'created' ? sortDir : null} />
                    </button>
                  </th>
                  <th className="whitespace-nowrap px-3 py-3">名单可见范围</th>
                  <th className="whitespace-nowrap px-3 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {view.map((r) => (
                  <tr key={r.id} className="group border-b border-slate-50 transition hover:bg-slate-50/60">
                    <td className="sticky left-0 z-10 bg-white px-3 py-3 group-hover:bg-slate-50/60">
                      <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)} className="accent-blue-600" />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => goDetail('/console/dm/market-list-detail', { id: r.id, name: r.name })} className="font-semibold text-brand-600 hover:underline text-left">{r.name}</button>
                        {r.sample && <span className="inline-flex items-center rounded bg-rose-600 px-1.5 py-0.5 text-[11px] font-medium text-white">样例</span>}
                      </div>
                      <div className="mt-0.5 max-w-[260px] truncate text-xs text-slate-400" title={r.remark}>{r.remark}</div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">{r.leads}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">{r.marketing}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right tabular-nums text-slate-700">{r.ended}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{r.creator}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">{r.created}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-600">{r.scope}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2 text-xs">
                        <OpBtn onClick={() => goDetail('/console/dm/market-list-detail', { id: r.id, name: r.name })}>查看详情</OpBtn>
                        <OpBtn onClick={() => openEdit(r)}>编辑名单</OpBtn>
                        <OpBtn onClick={() => copyRow(r)}>复制名单</OpBtn>
                        <OpBtn danger onClick={() => askDel(r)}>删除名单</OpBtn>
                        <OpBtn onClick={() => goDetail('/console/dm/market-list-detail', { id: r.id, name: r.name })}>名单线索管理</OpBtn>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============ 区域4：分页 ============ */}
        {!error && !loading && total > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-3 py-3 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>每页显示</span>
              <select value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1) }}
                style={{ height: 28, borderRadius: 6, border: '1px solid #E2E8F0', padding: '0 6px', fontSize: 12, color: '#334155', background: '#fff', cursor: 'pointer', outline: 'none' }}>
                {PAGE_SIZES.map((o) => <option key={o} value={o}>{o} 条</option>)}
              </select>
              <span>共 {total} 条</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PageBtn disabled={curPage <= 1} onClick={() => setPage(curPage - 1)}>上一页</PageBtn>
              {pageNumbers(curPage, totalPages).map((p, i) =>
                p === '...' ? <span key={i} className="px-1 text-slate-400">…</span>
                  : <button key={i} onClick={() => setPage(p as number)}
                    style={{ minWidth: 28, height: 28, borderRadius: 6, border: '1px solid ' + (p === curPage ? '#C7D2FE' : '#E2E8F0'), background: p === curPage ? '#EFF6FF' : '#fff', color: p === curPage ? '#1D4ED8' : '#334155', cursor: 'pointer' }}>
                    {p}
                  </button>
              )}
              <PageBtn disabled={curPage >= totalPages} onClick={() => setPage(curPage + 1)}>下一页</PageBtn>
              <span className="ml-2">前往</span>
              <input type="number" min={1} max={totalPages} defaultValue={curPage}
                onKeyDown={(e) => { if (e.key === 'Enter') { const v = Number((e.target as HTMLInputElement).value); if (v >= 1 && v <= totalPages) setPage(v) } }}
                style={{ width: 48, height: 28, borderRadius: 6, border: '1px solid #E2E8F0', padding: '0 6px', fontSize: 12, color: '#334155', background: '#fff', outline: 'none' }} />
              <span>页</span>
            </div>
          </div>
        )}
      </div>

      {/* ============ 新建 / 编辑弹窗 ============ */}
      {(showNew || showEdit) && (
        <Modal title={editId ? '编辑名单' : '新建名单'} onClose={() => { setShowNew(false); setShowEdit(false); setEditId(null) }}>
          <div className="space-y-4">
            <Field label="名单名称">
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="请输入名单名称"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-300" />
            </Field>
            <Field label="备注">
              <textarea value={form.remark} onChange={(e) => setForm({ ...form, remark: e.target.value })} rows={3} placeholder="请输入备注"
                className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-300" />
            </Field>
            <Field label="名单可见范围">
              <select value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-300 bg-white">
                {SCOPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => { setShowNew(false); setShowEdit(false); setEditId(null) }} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">取消</button>
            <button onClick={submitForm}
              style={{ background: Y, color: '#333', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = Y_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = Y)}>
              保存
            </button>
          </div>
        </Modal>
      )}

      {/* ============ 删除二次确认 ============ */}
      {showDel && (
        <Modal title="删除名单" onClose={() => { setShowDel(false); setDelId(null) }}>
          <p className="text-sm text-slate-600">确认删除该营销名单？删除后名单及其线索关联将无法恢复。</p>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => { setShowDel(false); setDelId(null) }} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">取消</button>
            <button onClick={confirmDel} className="rounded-md bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700">确认删除</button>
          </div>
        </Modal>
      )}

      {/* ============ 导出弹窗 ============ */}
      {showExport && (
        <Modal title="导出营销名单" onClose={() => setShowExport(false)}>
          <div className="space-y-3">
            {selected.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={exportSelectedOnly} onChange={(e) => setExportSelectedOnly(e.target.checked)} className="accent-blue-600" />
                仅导出已选中的 {selected.length} 个名单
              </label>
            )}
            <div className="text-xs font-medium text-slate-500">导出字段</div>
            <div className="grid grid-cols-2 gap-2">
              {EXPORT_COLS.map((c) => (
                <label key={c.key} className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600">
                  <input type="checkbox" checked={exportCols.includes(c.key)} onChange={(e) => setExportCols((s) => e.target.checked ? Array.from(new Set([...s, c.key])) : s.filter((x) => x !== c.key))} className="accent-blue-600" />
                  {c.label}
                </label>
              ))}
            </div>
            <div className="text-xs font-medium text-slate-500">文件格式</div>
            <div className="flex gap-3 text-sm text-slate-600">
              <label className="flex items-center gap-1.5"><input type="radio" name="fmt" defaultChecked className="accent-blue-600" /> Excel (.csv)</label>
              <label className="flex items-center gap-1.5"><input type="radio" name="fmt" className="accent-blue-600" /> CSV</label>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setShowExport(false)} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">取消</button>
            <button onClick={exportRows} className="flex items-center gap-1.5 rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700"><DownloadIcon /> 导出</button>
          </div>
        </Modal>
      )}

    </div>
  )
}

/* ===================== 局部小组件 ===================== */
const SORT_COLS = [
  { key: 'leads', label: '线索数' },
  { key: 'marketing', label: '营销中' },
  { key: 'ended', label: '营销结束' },
] as const

const EXPORT_COLS = [
  { key: 'name', label: '名单名称' },
  { key: 'sample', label: '是否样例' },
  { key: 'leads', label: '线索数' },
  { key: 'marketing', label: '营销中' },
  { key: 'ended', label: '营销结束' },
  { key: 'creator', label: '创建人' },
  { key: 'created', label: '创建时间' },
  { key: 'scope', label: '名单可见范围' },
  { key: 'remark', label: '备注' },
]

function SortArrow({ active, dir }: { active: boolean; dir: 'asc' | 'desc' | null }) {
  return (
    <span className={`flex flex-col leading-none ${active ? 'text-slate-900' : 'text-slate-300'}`}>
      <span style={{ fontSize: 9, lineHeight: 1 }}>▲</span>
      <span style={{ fontSize: 9, lineHeight: 1 }}>▼</span>
      {active && <span className="sr-only">{dir === 'asc' ? '升序' : '降序'}</span>}
    </span>
  )
}

function OpBtn({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return (
    <button onClick={onClick}
      className={`whitespace-nowrap rounded px-1.5 py-0.5 hover:underline ${danger ? 'text-rose-600' : 'text-brand-600'}`}>
      {children}
    </button>
  )
}

function PageBtn({ children, disabled, onClick }: { children: ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button disabled={disabled} onClick={onClick}
      style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #E2E8F0', background: disabled ? '#F1F5F9' : '#fff', color: disabled ? '#94A3B8' : '#334155', cursor: disabled ? 'not-allowed' : 'pointer' }}>
      {children}
    </button>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 text-sm font-medium text-slate-600">{label}</div>
      {children}
    </div>
  )
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative z-10 w-[460px] max-w-[92vw] rounded-xl bg-white p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><CloseIcon /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

function SkeletonTable() {
  return (
    <div className="p-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 border-b border-slate-50 py-3">
          <div className="h-4 w-4 rounded bg-slate-100" />
          <div className="h-4 w-40 rounded bg-slate-100" />
          <div className="h-4 w-16 rounded bg-slate-100" />
          <div className="h-4 w-16 rounded bg-slate-100" />
          <div className="h-4 w-16 rounded bg-slate-100" />
          <div className="h-4 w-28 rounded bg-slate-100" />
          <div className="ml-auto h-4 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  )
}

function pageNumbers(cur: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const out: (number | '...')[] = [1]
  const s = Math.max(2, cur - 1)
  const e = Math.min(total - 1, cur + 1)
  if (s > 2) out.push('...')
  for (let i = s; i <= e; i++) out.push(i)
  if (e < total - 1) out.push('...')
  out.push(total)
  return out
}
