import { useState, useMemo, useRef, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageShell } from './PageShell'
import { usePageNav } from './pageNav'

/* ===================== 类型 ===================== */
type Lead = {
  id: string
  name: string
  status: '未分配' | '营销中' | '待营销' | '营销成功' | '营销失败' | '无需营销'
  owner: string // 手机号脱敏展示，未分配为 '—'
  dept: string // 归属部门，未分配为 '—'
  visit: '需走访' | '已走访'
  joined: string // 加入名单时间 yyyy-MM-dd
  score: number // 启信分
  occur: string // 发生日期，无数据 '-'
  biz: string // 最新商机内容
}

type DeptRow = {
  dept: string
  pending: number
  marketing: number
  limited: number
  success: number
  follows: number
  acts: number
}

type UserRow = {
  phone: string
  name: string
  dept: string
  pending: number
  marketing: number
  limited: number
  success: number
  follows: number
  acts: number
}

/* ===================== 样例数据（本地内置，未接接口） ===================== */
const LEADS: Lead[] = [
  { id: 'l1', name: '广州粤信科技有限公司', status: '营销中', owner: '19156027703', dept: '普惠部', visit: '需走访', joined: '2026-08-17', score: 865, occur: '2026-08-18', biz: '申请普惠信用贷款500万，用于采购原材料及设备更新' },
  { id: 'l2', name: '无锡万盛橡塑制品有限责任公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-16', score: 742, occur: '-', biz: '橡胶制品加工企业，近期扩产意向明显' },
  { id: 'l3', name: '世泰仕塑料有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-16', score: 698, occur: '-', biz: '汽车塑料零部件供应商，配套主机厂' },
  { id: 'l4', name: '江阴华昌食品添加剂有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-15', score: 712, occur: '-', biz: '食品添加剂生产，下游覆盖烘焙与饮料行业' },
  { id: 'l5', name: '苏州纳微科技股份有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-14', score: 901, occur: '-', biz: '高性能微球材料，国产替代逻辑清晰' },
  { id: 'l6', name: '深圳某某电子有限公司', status: '未分配', owner: '—', dept: '—', visit: '已走访', joined: '2026-08-12', score: 655, occur: '-', biz: '消费电子代工，外需订单回暖' },
  { id: 'l7', name: '佛山陶瓷建材有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-11', score: 623, occur: '-', biz: '建陶制造，绿色改造资金需求' },
  { id: 'l8', name: '东莞智能装备股份有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-10', score: 788, occur: '-', biz: '工业机器人集成，设备更新贷款潜力' },
  { id: 'l9', name: '宁波模具制造有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-09', score: 671, occur: '-', biz: '精密模具，配套汽车零部件' },
  { id: 'l10', name: '成都农产品供应链有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-08', score: 609, occur: '-', biz: '涉农供应链，乡村振兴客群' },
  { id: 'l11', name: '武汉光电子科技有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-07', score: 833, occur: '-', biz: '光模块器件，AI算力配套' },
  { id: 'l12', name: '西安航空航天零部件有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-06', score: 856, occur: '-', biz: '军工配套，订单稳定' },
  { id: 'l13', name: '青岛海洋生物科技有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-05', score: 690, occur: '-', biz: '海洋蛋白提取，高附加值' },
  { id: 'l14', name: '长沙工程机械租赁有限公司', status: '未分配', owner: '—', dept: '—', visit: '已走访', joined: '2026-08-04', score: 640, occur: '-', biz: '工程机械租赁，周期景气回升' },
  { id: 'l15', name: '合肥新能源汽车配件有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-03', score: 812, occur: '-', biz: '新能源三电结构件，产业链景气' },
  { id: 'l16', name: '郑州冷链物流有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-02', score: 618, occur: '-', biz: '冷链仓储，生鲜上行通道' },
  { id: 'l17', name: '厦门跨境电商服务有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-08-01', score: 705, occur: '-', biz: '跨境电商综合服务，外贸回暖' },
  { id: 'l18', name: '昆明高原特色农业有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-07-31', score: 588, occur: '-', biz: '高原特色农产品，惠农金融客群' },
  { id: 'l19', name: '沈阳装备制造有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-07-30', score: 732, occur: '-', biz: '重型装备制造，技改贷款需求' },
  { id: 'l20', name: '南宁糖业加工有限公司', status: '未分配', owner: '—', dept: '—', visit: '需走访', joined: '2026-07-29', score: 601, occur: '-', biz: '制糖加工，涉农产业链' },
]

const DEPT_ROWS: DeptRow[] = [
  { dept: '普惠部', pending: 0, marketing: 1, limited: 0, success: 0, follows: 3, acts: 2 },
  { dept: '公司部', pending: 0, marketing: 0, limited: 0, success: 0, follows: 1, acts: 1 },
  { dept: '零售部', pending: 0, marketing: 0, limited: 0, success: 0, follows: 0, acts: 0 },
  { dept: '投行部', pending: 0, marketing: 0, limited: 0, success: 0, follows: 0, acts: 0 },
]

const USER_ROWS: UserRow[] = [
  { phone: '19156027703', name: '张伟', dept: '普惠部', pending: 0, marketing: 1, limited: 0, success: 0, follows: 3, acts: 2 },
  { phone: '13800138000', name: '李娜', dept: '公司部', pending: 0, marketing: 0, limited: 0, success: 0, follows: 1, acts: 1 },
  { phone: '13912345678', name: '王芳', dept: '零售部', pending: 0, marketing: 0, limited: 0, success: 0, follows: 0, acts: 0 },
  { phone: '13700137000', name: '刘强', dept: '投行部', pending: 0, marketing: 0, limited: 0, success: 0, follows: 0, acts: 0 },
]

const SCOPES = ['全部', '本人', '本人及下属部门', '本部门', '本部门及下属部门']
const STATUSES = ['未分配', '营销中', '待营销']
const OWNERS = ['19156027703']
const DEPTS = ['普惠部', '公司部', '零售部', '投行部']
const PAGE_SIZES = [10, 20, 50, 100]
const CANDIDATE_COMPANIES = [
  '浙江义乌小商品供应链有限公司',
  '重庆火锅食材加工有限公司',
  '天津港集装箱服务有限公司',
  '海南热带水果种植合作社',
  '山西焦煤运销有限公司',
]

/* 展示字段（9 列可配置，操作列固定） */
const COLUMNS: { key: string; label: string }[] = [
  { key: 'name', label: '企业名称' },
  { key: 'status', label: '线索状态' },
  { key: 'joined', label: '加入名单时间' },
  { key: 'dept', label: '线索归属部门' },
  { key: 'owner', label: '线索归属人员' },
  { key: 'visit', label: '走访状态' },
  { key: 'score', label: '启信分' },
  { key: 'occur', label: '发生日期' },
  { key: 'biz', label: '最新商机内容' },
]

/* ===================== 配色（PRD：主按钮黄色 #ffc53d） ===================== */
const Y = '#ffc53d'
const Y_HOVER = '#f0a500'

/* ===================== 小图标 ===================== */
const PlusIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 3v10M3 8h10" stroke="#333" strokeWidth="2" strokeLinecap="round" /></svg>)
const DownloadIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0L5 7m3 3 3-3M3 13h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>)
const SearchIcon = () => (<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#94a3b8" strokeWidth="1.6" /><path d="m11 11 3 3" stroke="#94a3b8" strokeWidth="1.6" strokeLinecap="round" /></svg>)
const CloseIcon = () => (<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>)
const TrashIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M6 4V2.5h4V4M5 4l.6 9h4.8L11 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>)
const CopyIcon = () => (<svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M3 11V4a1 1 0 0 1 1-1h7" stroke="currentColor" strokeWidth="1.4" /></svg>)
const MapIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M8 1.5c3 0 5 2 5 5 0 3.5-5 8-5 8s-5-4.5-5-8c0-3 2-5 5-5Z" stroke="currentColor" strokeWidth="1.4" /><circle cx="8" cy="6.5" r="1.8" stroke="currentColor" strokeWidth="1.4" /></svg>)
const MoreIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="3.5" cy="8" r="1.4" fill="currentColor" /><circle cx="8" cy="8" r="1.4" fill="currentColor" /><circle cx="12.5" cy="8" r="1.4" fill="currentColor" /></svg>)
const ChartIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 14h12M4 14V8M8 14V4M12 14v-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>)
const FilterIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>)
const ColIcon = () => (<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="6.5" y="3" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" /><rect x="11" y="3" width="3" height="10" rx="1" stroke="currentColor" strokeWidth="1.3" /></svg>)

/* ===================== 工具：CSV 导出 ===================== */
function csvCell(v: unknown) {
  const s = v == null ? '' : String(v)
  return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s
}
function downloadCsv(filename: string, head: string[], rows: string[][]) {
  const csv = '﻿' + [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  a.click()
  URL.revokeObjectURL(a.href)
}
const todayStr = () => new Date().toISOString().slice(0, 10)
const maskPhone = (p: string) => (p === '—' ? '—' : p.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2'))

/* 状态色（营销中蓝色 / 未分配米色 / 走访提示橙色） */
function statusTone(s: string) {
  return s === '营销中' ? 'bg-sky-50 text-sky-600 ring-sky-200'
    : s === '待营销' ? 'bg-orange-50 text-orange-600 ring-orange-200'
      : s === '营销成功' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200'
        : s === '营销失败' ? 'bg-rose-50 text-rose-600 ring-rose-200'
          : s === '无需营销' ? 'bg-slate-100 text-slate-500 ring-slate-200'
            : 'bg-amber-50 text-amber-700 ring-amber-200' // 未分配
}
function visitTone(v: string) {
  return v === '已走访' ? 'bg-emerald-50 text-emerald-600 ring-emerald-200' : 'bg-orange-50 text-orange-600 ring-orange-200'
}
const rankColor = (i: number) => (i === 0 ? '#ef4444' : i === 1 ? '#22c55e' : i === 2 ? '#3b82f6' : '#cbd5e1')

/* ===================== 主页面 ===================== */
export default function DmMarketListDetail() {
  const [params] = useSearchParams()
  const { back } = usePageNav()
  const id = params.get('id') || 'rural'
  const name = params.get('name') || '乡村振兴'
  const backUrl = params.get('back') || '/console/dm/market-list'

  /* 全量线索（可变，支持移出/新增） */
  const [leads, setLeads] = useState<Lead[]>(LEADS)

  /* Tab */
  const [tab, setTab] = useState<'all' | 'board'>('all')

  /* 线索范围（权限快速筛选） */
  const [scope, setScope] = useState('全部')

  /* 高级筛选 */
  const [showFilter, setShowFilter] = useState(true)
  const [filters, setFilters] = useState({ status: '', owner: '', dept: '', from: '', to: '' })
  const [kwInput, setKwInput] = useState('')
  const [keyword, setKeyword] = useState('')
  /* 指标卡片点击联动筛选 */
  const [quick, setQuick] = useState('')

  /* 排序 */
  const [sortDir, setSortDir] = useState<'asc' | 'desc' | null>(null)

  /* 表格选择 / 分页 */
  const [selected, setSelected] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  /* 展示字段 */
  const [cols, setCols] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mktListCols')
      if (saved) {
        const arr = JSON.parse(saved)
        if (Array.isArray(arr)) return COLUMNS.map((c) => c.key).filter((k) => arr.includes(k))
      }
    } catch { /* ignore */ }
    return COLUMNS.map((c) => c.key)
  })

  /* 状态：加载 / 错误 / 空 */
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const loadTimer = useRef<number | null>(null)
  const simulateLoad = () => {
    setLoading(true); setError(false)
    if (loadTimer.current) window.clearTimeout(loadTimer.current)
    loadTimer.current = window.setTimeout(() => setLoading(false), 350)
  }
  useEffect(() => () => { if (loadTimer.current) window.clearTimeout(loadTimer.current) }, [])

  /* 弹窗 */
  const [showAdd, setShowAdd] = useState(false)
  const [addPicked, setAddPicked] = useState<string[]>([])
  const [showAssign, setShowAssign] = useState<Lead | null>(null)
  const [assignForm, setAssignForm] = useState({ owner: OWNERS[0], dept: DEPTS[0] })
  const [showFollow, setShowFollow] = useState<Lead | null>(null)
  const [followText, setFollowText] = useState('')
  const [showMore, setShowMore] = useState<Lead | null>(null)
  const [showRemove, setShowRemove] = useState<Lead | null>(null)
  const [showExport, setShowExport] = useState(false)
  const [exportCols, setExportCols] = useState<string[]>(COLUMNS.map((c) => c.key))
  const [exportSelectedOnly, setExportSelectedOnly] = useState(false)
  const [showCol, setShowCol] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [showAI, setShowAI] = useState<Lead | null>(null)
  const [moreFilter, setMoreFilter] = useState<null | { title: string; items: string[] }>(null)
  const [toast, setToast] = useState('')
  const flash = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 2000) }

  /* 看板筛选 */
  const [boardFrom, setBoardFrom] = useState('')
  const [boardTo, setBoardTo] = useState('')
  const [deptChart, setDeptChart] = useState(false)
  const [userChart, setUserChart] = useState(false)
  const [userDept, setUserDept] = useState('')

  /* 切换 Tab 保留筛选，重置内部表格到第 1 页 */
  const switchTab = (t: 'all' | 'board') => { setTab(t); setPage(1) }

  /* 统计指标 */
  const stats = useMemo(() => {
    const unassigned = leads.filter((l) => l.owner === '—' || l.status === '未分配').length
    return {
      total: leads.length,
      unassigned,
      assigned: leads.length - unassigned,
      pending: leads.filter((l) => l.status === '待营销').length,
      pending30: 0,
      pending7: 0,
      marketing: leads.filter((l) => l.status === '营销中').length,
      mLimited: 0,
      mNoFollow: leads.filter((l) => l.status === '营销中').length,
      ended: leads.filter((l) => ['营销成功', '营销失败', '无需营销'].includes(l.status)).length,
      endSuccess: leads.filter((l) => l.status === '营销成功').length,
      endFail: leads.filter((l) => l.status === '营销失败').length,
      endNoNeed: leads.filter((l) => l.status === '无需营销').length,
    }
  }, [leads])

  /* 筛选 + 排序 */
  const filtered = useMemo(() => {
    let list = leads.filter((l) => {
      if (keyword && !l.name.includes(keyword)) return false
      if (filters.status && l.status !== filters.status) return false
      if (filters.owner && l.owner !== filters.owner) return false
      if (filters.dept && l.dept !== filters.dept) return false
      if (filters.from && l.joined < filters.from) return false
      if (filters.to && l.joined > filters.to) return false
      if (quick === 'unassigned' && !(l.owner === '—' || l.status === '未分配')) return false
      if (quick === 'assigned' && l.owner === '—') return false
      if (quick === 'pending' && l.status !== '待营销') return false
      if (quick === 'marketing' && l.status !== '营销中') return false
      if (quick === 'ended' && !['营销成功', '营销失败', '无需营销'].includes(l.status)) return false
      return true
    })
    if (sortDir) list = [...list].sort((a, b) => (sortDir === 'asc' ? a.score - b.score : b.score - a.score))
    return list
  }, [leads, keyword, filters, quick, sortDir])

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const curPage = Math.min(page, totalPages)
  const view = filtered.slice((curPage - 1) * pageSize, curPage * pageSize)

  const pageIds = view.map((l) => l.id)
  const allOn = pageIds.length > 0 && pageIds.every((i) => selected.includes(i))
  const toggleAll = () => setSelected(allOn ? selected.filter((i) => !pageIds.includes(i)) : Array.from(new Set([...selected, ...pageIds])))
  const toggleOne = (i: string) => setSelected(selected.includes(i) ? selected.filter((x) => x !== i) : [...selected, i])

  /* 交互 */
  const doSearch = () => { setKeyword(kwInput.trim()); setPage(1); setQuick(''); simulateLoad() }
  const onFilter = (patch: Partial<typeof filters>) => { setFilters((f) => ({ ...f, ...patch })); setPage(1); setQuick(''); simulateLoad() }
  const onScope = (v: string) => { setScope(v); setPage(1); simulateLoad() }
  const onQuick = (q: string) => { setQuick(quick === q ? '' : q); setPage(1); simulateLoad() }
  const onSort = () => { setSortDir(sortDir === null ? 'asc' : sortDir === 'asc' ? 'desc' : null); simulateLoad() }
  const resetFilters = () => {
    setKwInput(''); setKeyword(''); setFilters({ status: '', owner: '', dept: '', from: '', to: '' })
    setScope('全部'); setQuick(''); setSortDir(null); setPage(1); setSelected([]); simulateLoad()
  }

  const changeStatus = (l: Lead, s: Lead['status']) => { setLeads((ls) => ls.map((x) => x.id === l.id ? { ...x, status: s } : x)); flash(`已将「${l.name}」状态改为${s}`) }
  const changeVisit = (l: Lead, v: Lead['visit']) => { setLeads((ls) => ls.map((x) => x.id === l.id ? { ...x, visit: v } : x)) }

  const openAssign = (l: Lead) => { setAssignForm({ owner: l.owner === '—' ? OWNERS[0] : l.owner, dept: l.dept === '—' ? DEPTS[0] : l.dept }); setShowAssign(l) }
  const submitAssign = () => {
    if (showAssign) setLeads((ls) => ls.map((x) => x.id === showAssign.id ? { ...x, owner: assignForm.owner, dept: assignForm.dept, status: x.status === '未分配' ? '待营销' : x.status } : x))
    setShowAssign(null); flash('已分配线索')
  }
  const submitFollow = () => {
    if (!followText.trim()) { flash('请填写跟进内容'); return }
    if (showFollow) setLeads((ls) => ls.map((x) => x.id === showFollow.id ? { ...x, status: x.status === '未分配' ? '营销中' : x.status, occur: todayStr() } : x))
    setShowFollow(null); setFollowText(''); flash('已新建跟进记录')
  }
  const confirmRemove = () => {
    if (showRemove) setLeads((ls) => ls.filter((x) => x.id !== showRemove.id))
    setShowRemove(null); flash('已将线索移出名单')
  }
  const submitAdd = () => {
    if (addPicked.length === 0) { flash('请选择要添加的企业'); return }
    const max = leads.reduce((m, l) => Math.max(m, Number(l.id.replace(/\D/g, '')) || 0), 0)
    const added: Lead[] = addPicked.map((n, i) => ({
      id: 'n' + (max + i + 1), name: n, status: '未分配', owner: '—', dept: '—', visit: '需走访',
      joined: todayStr(), score: 600 + Math.floor(Math.random() * 200), occur: '-', biz: '新加入名单，待分配营销人员',
    }))
    setLeads((ls) => [...added, ...ls]); setShowAdd(false); setAddPicked([]); flash(`已新增 ${added.length} 家企业`)
  }
  const exportRows = () => {
    const src = exportSelectedOnly && selected.length ? filtered.filter((l) => selected.includes(l.id)) : filtered
    const keys = COLUMNS.map((c) => c.key).filter((k) => exportCols.includes(k))
    const head = keys.map((k) => COLUMNS.find((c) => c.key === k)!.label)
    const lines = src.map((l) => keys.map((k) => (k === 'owner' ? maskPhone(l.owner) : (l as unknown as Record<string, unknown>)[k] as string)))
    downloadCsv(`营销名单_${name}_线索_${todayStr()}.csv`, head, lines)
    setShowExport(false); flash(`已导出 ${src.length} 条线索`)
  }
  const saveCols = () => { localStorage.setItem('mktListCols', JSON.stringify(cols)); setShowCol(false); flash('已保存展示字段') }

  /* ===================== 渲染 ===================== */
  return (
    <div style={{ padding: 24, maxWidth: 1360, margin: '0 auto' }}>
      <PageShell
        legend={false}
        header={(
          <div className="sticky top-14 z-30 -mx-4 border-b border-slate-100 bg-slate-50 px-4 pb-4 pt-1 lg:-mx-8 lg:px-8">
            {/* 面包屑：营销名单可点击返回列表 */}
            <div className="text-xs text-slate-400">
              <button onClick={() => back(backUrl)} className="text-brand-600 hover:underline">营销名单</button>
              <span className="mx-1 text-slate-300">/</span>
              <span>{name} 主题详情</span>
            </div>
            {/* 标题 + Tab + 主操作 */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-5">
                <h1 className="text-2xl font-bold tracking-tight text-slate-800">{name} 主题详情</h1>
                <div className="flex items-center gap-1">
                  <TabBtn active={tab === 'all'} onClick={() => switchTab('all')}>全部线索</TabBtn>
                  <TabBtn active={tab === 'board'} onClick={() => switchTab('board')}>数据看板</TabBtn>
                </div>
              </div>
              <button onClick={() => setShowAdd(true)}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: Y, color: '#333', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
                onMouseEnter={(e) => (e.currentTarget.style.background = Y_HOVER)}
                onMouseLeave={(e) => (e.currentTarget.style.background = Y)}>
                <PlusIcon /> 添加企业
              </button>
            </div>
          </div>
        )}
      />

      {toast && (<div className="mb-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{toast}</div>)}

      {/* 看板筛选栏（仅数据看板 Tab） */}
      {tab === 'board' && (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
          <span className="text-sm text-slate-500">线索筛选：</span>
          <DateRange from={boardFrom} to={boardTo} onFrom={setBoardFrom} onTo={setBoardTo} />
          <span className="ml-1 text-xs text-slate-400">更新日期 / 创建日期 区间内刷新下方全部数据</span>
        </div>
      )}

      {/* 指标汇总卡片区（两 Tab 共用，数据同源联动） */}
      <StatCards stats={stats} quick={quick} onQuick={onQuick} />

      {tab === 'all' ? (
        <>
          {/* 线索范围（权限快速筛选） */}
          <div className="mb-3 mt-4 flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-500">线索范围：</span>
            {SCOPES.map((s) => (
              <button key={s} onClick={() => onScope(s)}
                className={`rounded-full px-3 py-1 text-sm ${scope === s ? 'bg-brand-600 text-white' : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'}`}>
                {s}
              </button>
            ))}
          </div>

          {/* 高级筛选区 */}
          <div className="mb-3 rounded-lg border border-slate-200 bg-white">
            <div className="flex items-center justify-between px-3 py-2.5">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-600"><FilterIcon /> 高级筛选</div>
              <button onClick={() => setShowFilter((v) => !v)} className="text-sm text-brand-600 hover:underline">
                {showFilter ? '收起筛选' : '展开筛选'}
              </button>
            </div>
            {showFilter && (
              <div className="border-t border-slate-100 px-3 py-3">
                {/* 分组1：线索筛选 */}
                <FilterGroup title="线索筛选">
                  <SelectCell label="线索状态" value={filters.status} onChange={(v) => onFilter({ status: v })} options={['', ...STATUSES]} />
                  <SelectCell label="归属人员" value={filters.owner} onChange={(v) => onFilter({ owner: v })} options={['', ...OWNERS.map(maskPhone)]} raw={['', ...OWNERS]} />
                  <SelectCell label="归属部门" value={filters.dept} onChange={(v) => onFilter({ dept: v })} options={['', ...DEPTS]} />
                  <SelectCell label="走访状态" value={''} onChange={() => {}} options={['', '需走访', '已走访']} />
                  <DateRange from={filters.from} to={filters.to} onFrom={(v) => onFilter({ from: v })} onTo={(v) => onFilter({ to: v })} label="加入名单时间" />
                </FilterGroup>
                {/* 分组2：基本筛选 */}
                <FilterGroup title="基本筛选">
                  <SelectCell label="省份地区" value={''} onChange={() => {}} options={['', '广东', '江苏', '浙江', '山东']} />
                  <SelectCell label="所在行业" value={''} onChange={() => {}} options={['', '制造业', '农林牧渔', '批发零售', '信息技术']} />
                  <SelectCell label="成立年限" value={''} onChange={() => {}} options={['', '1年内', '1-3年', '3-5年', '5年以上']} />
                  <SelectCell label="经营状态" value={''} onChange={() => {}} options={['', '存续', '在业', '吊销', '注销']} />
                  <SelectCell label="企业类型" value={''} onChange={() => {}} options={['', '有限责任公司', '股份有限公司', '个体工商户']} />
                  <button onClick={() => setMoreFilter({ title: '基本筛选 · 更多', items: ['组织类型', '参保人数', '启信分', '税务资质', '进出口信息', '融资信息', '专利信息', '商标信息', '著作权'] })}
                    className="self-end rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300">更多</button>
                </FilterGroup>
                {/* 分组3：概念标签 */}
                <FilterGroup title="概念标签">
                  <SelectCell label="业务概念" value={''} onChange={() => {}} options={['', '乡村振兴', '先进制造', '新能源']} />
                  <SelectCell label="企业特点" value={''} onChange={() => {}} options={['', '高成长', '稳经营', '强研发']} />
                  <button onClick={() => setMoreFilter({ title: '概念标签 · 更多', items: ['榜单企业', '企业组织机构类型', '企业规模', '区域类型', '技术领先', '金融机构', '供应商企业', '司法涉诉', '风险特征', '自贸区', '资金扩张', '业务扩张', '人员扩张'] })}
                    className="self-end rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300">更多</button>
                </FilterGroup>
                {/* 分组4：科技认定 */}
                <FilterGroup title="科技认定">
                  <SelectCell label="专精特新" value={''} onChange={() => {}} options={['', '是', '否']} />
                  <SelectCell label="高新企业" value={''} onChange={() => {}} options={['', '是', '否']} />
                  <button onClick={() => setMoreFilter({ title: '科技认定 · 更多', items: ['专精特新小巨人', '科技小巨人', '科技型企业', '科技型中小企业', '独角兽企业', '种子独角兽企业', '未来独角兽企业', '民营科技企业', '企业技术中心', '技术创新示范企业', '科改示范企业'] })}
                    className="self-end rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300">更多</button>
                </FilterGroup>
                {/* 分组5：风险信息 */}
                <FilterGroup title="风险信息">
                  <SelectCell label="失信被执行人" value={''} onChange={() => {}} options={['', '有', '无']} />
                  <SelectCell label="被执行人" value={''} onChange={() => {}} options={['', '有', '无']} />
                  <SelectCell label="终本案件" value={''} onChange={() => {}} options={['', '有', '无']} />
                  <SelectCell label="动产抵押" value={''} onChange={() => {}} options={['', '有', '无']} />
                  <SelectCell label="限制高消费" value={''} onChange={() => {}} options={['', '有', '无']} />
                </FilterGroup>
                {/* 分组6：联系方式 */}
                <FilterGroup title="联系方式" last>
                  <SelectCell label="手机号码" value={''} onChange={() => {}} options={['', '有', '无']} />
                  <SelectCell label="座机号码" value={''} onChange={() => {}} options={['', '有', '无']} />
                  <SelectCell label="空号过滤" value={''} onChange={() => {}} options={['', '过滤空号', '不过滤']} />
                  <SelectCell label="邮箱地址" value={''} onChange={() => {}} options={['', '有', '无']} />
                  <SelectCell label="企业地址" value={''} onChange={() => {}} options={['', '有', '无']} />
                  <SelectCell label="企业网址" value={''} onChange={() => {}} options={['', '有', '无']} />
                </FilterGroup>
              </div>
            )}
          </div>

          {/* 表格操作工具栏 */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">找到 <span className="font-semibold text-slate-800">{total}</span> 条结果</span>
              <div className="relative">
                <BatchMenu disabled={selected.length === 0} onExport={() => { setExportSelectedOnly(true); setShowExport(true) }} onRemove={() => { if (selected.length) { setLeads((ls) => ls.filter((l) => !selected.includes(l.id))); flash(`已批量移出 ${selected.length} 条`); setSelected([]) } }} />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-md border border-slate-200 bg-white" style={{ height: 36 }}>
                <span className="pl-2.5"><SearchIcon /></span>
                <input value={kwInput} onChange={(e) => setKwInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && doSearch()} placeholder="请输入企业名称"
                  className="h-full w-52 bg-transparent px-2 text-sm text-slate-600 outline-none placeholder:text-slate-400" />
                <button onClick={doSearch} className="h-full rounded-r-md bg-slate-100 px-3 text-sm text-slate-600 hover:bg-slate-200">搜索</button>
              </div>
              <button onClick={() => setShowMap(true)} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:border-slate-300" style={{ height: 36 }}><MapIcon /> 地图派单</button>
              <button onClick={() => { setExportSelectedOnly(false); setShowExport(true) }} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:border-slate-300" style={{ height: 36 }}><DownloadIcon /> 导出</button>
              <button onClick={() => setShowCol(true)} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-600 hover:border-slate-300" style={{ height: 36 }}><ColIcon /> 展示字段({cols.length}/{COLUMNS.length})</button>
            </div>
          </div>

          {/* 核心数据表格 */}
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
                <div className="text-sm text-slate-400">暂无符合条件的线索</div>
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
                      {COLUMNS.map((c) => (
                        <th key={c.key} className="whitespace-nowrap px-3 py-3" style={{ display: cols.includes(c.key) ? '' : 'none' }}>
                          {c.key === 'score' ? (
                            <button onClick={onSort} className="flex items-center gap-1 hover:text-slate-700">
                              {c.label}
                              <SortArrow active={sortDir !== null} dir={sortDir} />
                            </button>
                          ) : c.label}
                        </th>
                      ))}
                      <th className="whitespace-nowrap px-3 py-3 text-right">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {view.map((l) => (
                      <tr key={l.id} className="group border-b border-slate-50 transition hover:bg-slate-50/60">
                        <td className="sticky left-0 z-10 bg-white px-3 py-3 group-hover:bg-slate-50/60">
                          <input type="checkbox" checked={selected.includes(l.id)} onChange={() => toggleOne(l.id)} className="accent-blue-600" />
                        </td>
                        {cols.includes('name') && (
                          <td className="px-3 py-3">
                            <button onClick={() => flash('跳转企业详情页（演示）')} className="font-semibold text-brand-600 hover:underline text-left">{l.name}</button>
                          </td>
                        )}
                        {cols.includes('status') && (
                          <td className="whitespace-nowrap px-3 py-3">
                            <select value={l.status} onChange={(e) => changeStatus(l, e.target.value as Lead['status'])}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset outline-none ${statusTone(l.status)}`}>
                              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </td>
                        )}
                        {cols.includes('joined') && <td className="whitespace-nowrap px-3 py-3 text-slate-500">{l.joined}</td>}
                        {cols.includes('dept') && <td className="whitespace-nowrap px-3 py-3 text-slate-600">{l.dept === '—' ? '-' : l.dept}</td>}
                        {cols.includes('owner') && (
                          <td className="whitespace-nowrap px-3 py-3 text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              {l.owner === '—' ? '-' : maskPhone(l.owner)}
                              {l.owner !== '—' && <button onClick={() => flash('已复制 ' + l.owner)} className="text-slate-400 hover:text-brand-600"><CopyIcon /></button>}
                            </span>
                          </td>
                        )}
                        {cols.includes('visit') && (
                          <td className="whitespace-nowrap px-3 py-3">
                            <select value={l.visit} onChange={(e) => changeVisit(l, e.target.value as Lead['visit'])}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset outline-none ${visitTone(l.visit)}`}>
                              <option value="需走访">需走访</option>
                              <option value="已走访">已走访</option>
                            </select>
                          </td>
                        )}
                        {cols.includes('score') && <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-700">{l.score}</td>}
                        {cols.includes('occur') && <td className="whitespace-nowrap px-3 py-3 text-slate-500">{l.occur}</td>}
                        {cols.includes('biz') && (
                          <td className="max-w-[220px] truncate px-3 py-3 text-slate-600" title={l.biz}>{l.biz}</td>
                        )}
                        <td className="whitespace-nowrap px-3 py-3 text-right">
                          <div className="flex flex-wrap justify-end gap-2 text-xs">
                            <OpBtn onClick={() => setShowAI(l)}>AI+</OpBtn>
                            <OpBtn onClick={() => openAssign(l)}>分配</OpBtn>
                            <OpBtn onClick={() => setShowFollow(l)}>跟进</OpBtn>
                            <div className="relative">
                              <OpBtn onClick={() => setShowMore(showMore?.id === l.id ? null : l)} danger={false}>更多 <MoreIcon /></OpBtn>
                              {showMore?.id === l.id && (
                                <div className="absolute right-0 z-30 mt-1 w-32 rounded-md border border-slate-200 bg-white py-1 text-left shadow-lg">
                                  <MoreItem onClick={() => { setShowMore(null); setShowRemove(l) }}>移出名单</MoreItem>
                                  <MoreItem onClick={() => { setShowMore(null); flash('查看跟进记录（演示）') }}>查看记录</MoreItem>
                                  <MoreItem onClick={() => { setShowMore(null); openAssign(l) }}>编辑</MoreItem>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* 分页 */}
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
        </>
      ) : (
        /* ============ 数据看板 Tab ============ */
        <BoardTab
          stats={stats}
          deptChart={deptChart}
          setDeptChart={setDeptChart}
          userChart={userChart}
          setUserChart={setUserChart}
          userDept={userDept}
          setUserDept={setUserDept}
        />
      )}

      {/* ============ 添加企业弹窗 ============ */}
      {showAdd && (
        <Modal title="添加企业" onClose={() => { setShowAdd(false); setAddPicked([]) }}>
          <p className="mb-3 text-sm text-slate-500">勾选企业，向当前营销名单批量新增线索：</p>
          <div className="max-h-72 space-y-2 overflow-auto">
            {CANDIDATE_COMPANIES.map((c) => (
              <label key={c} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700">
                <input type="checkbox" checked={addPicked.includes(c)} onChange={(e) => setAddPicked((s) => e.target.checked ? Array.from(new Set([...s, c])) : s.filter((x) => x !== c))} className="accent-blue-600" />
                {c}
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => { setShowAdd(false); setAddPicked([]) }} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">取消</button>
            <button onClick={submitAdd} style={{ background: Y, color: '#333', border: 'none', borderRadius: 8, padding: '7px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = Y_HOVER)} onMouseLeave={(e) => (e.currentTarget.style.background = Y)}>确认添加</button>
          </div>
        </Modal>
      )}

      {/* ============ 分配弹窗 ============ */}
      {showAssign && (
        <Modal title="分配线索" onClose={() => setShowAssign(null)}>
          <div className="space-y-4">
            <Field label="企业名称"><div className="text-sm text-slate-700">{showAssign.name}</div></Field>
            <Field label="归属人员（手机号）">
              <select value={assignForm.owner} onChange={(e) => setAssignForm({ ...assignForm, owner: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-300 bg-white">
                {OWNERS.map((o) => <option key={o} value={o}>{maskPhone(o)}</option>)}
              </select>
            </Field>
            <Field label="归属部门">
              <select value={assignForm.dept} onChange={(e) => setAssignForm({ ...assignForm, dept: e.target.value })}
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-300 bg-white">
                {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setShowAssign(null)} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">取消</button>
            <button onClick={submitAssign} className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700">确认分配</button>
          </div>
        </Modal>
      )}

      {/* ============ 跟进弹窗 ============ */}
      {showFollow && (
        <Modal title="新建跟进记录" onClose={() => { setShowFollow(null); setFollowText('') }}>
          <Field label="企业名称"><div className="text-sm text-slate-700">{showFollow.name}</div></Field>
          <Field label="跟进内容">
            <textarea value={followText} onChange={(e) => setFollowText(e.target.value)} rows={4} placeholder="请输入本次跟进情况"
              className="w-full resize-none rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-brand-300" />
          </Field>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => { setShowFollow(null); setFollowText('') }} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">取消</button>
            <button onClick={submitFollow} className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700">提交跟进</button>
          </div>
        </Modal>
      )}

      {/* ============ 移出名单二次确认 ============ */}
      {showRemove && (
        <Modal title="移出名单" onClose={() => setShowRemove(null)}>
          <p className="text-sm text-slate-600">确认将「{showRemove.name}」移出当前营销名单？移出后该线索回到候选池。</p>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setShowRemove(null)} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">取消</button>
            <button onClick={confirmRemove} className="rounded-md bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-700">确认移出</button>
          </div>
        </Modal>
      )}

      {/* ============ 导出弹窗 ============ */}
      {showExport && (
        <Modal title="导出线索" onClose={() => setShowExport(false)}>
          <div className="space-y-3">
            {selected.length > 0 && (
              <label className="flex items-center gap-2 text-sm text-slate-600">
                <input type="checkbox" checked={exportSelectedOnly} onChange={(e) => setExportSelectedOnly(e.target.checked)} className="accent-blue-600" />
                仅导出已选中的 {selected.length} 条线索
              </label>
            )}
            <div className="text-xs font-medium text-slate-500">导出字段</div>
            <div className="grid grid-cols-2 gap-2">
              {COLUMNS.map((c) => (
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

      {/* ============ 展示字段弹窗 ============ */}
      {showCol && (
        <Modal title="展示字段" onClose={() => setShowCol(false)}>
          <div className="grid grid-cols-2 gap-2">
            {COLUMNS.map((c) => (
              <label key={c.key} className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600">
                <input type="checkbox" checked={cols.includes(c.key)} onChange={(e) => setCols((s) => e.target.checked ? Array.from(new Set([...s, c.key])) : s.filter((x) => x !== c.key))} className="accent-blue-600" />
                {c.label}
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setShowCol(false)} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">取消</button>
            <button onClick={saveCols} className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700">保存</button>
          </div>
        </Modal>
      )}

      {/* ============ 地图派单弹窗 ============ */}
      {showMap && (
        <Modal title="地图派单" onClose={() => setShowMap(false)}>
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
            地图视图（演示占位）：按地理分布展示线索、分配营销人员
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setShowMap(false)} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">关闭</button>
          </div>
        </Modal>
      )}

      {/* ============ AI 分析弹窗 ============ */}
      {showAI && (
        <Modal title="企业 AI 分析" onClose={() => setShowAI(null)}>
          <div className="space-y-3 text-sm text-slate-600">
            <div className="rounded-md bg-slate-50 px-3 py-2">企业：<span className="font-medium text-slate-800">{showAI.name}</span></div>
            <div className="rounded-md bg-slate-50 px-3 py-2">启信分：<span className="font-medium text-slate-800">{showAI.score}</span>　线索状态：{showAI.status}　走访：{showAI.visit}</div>
            <p className="text-slate-500">AI 分析结论（演示）：该企业所属客群与名单主题高度匹配，建议优先分配营销人员跟进，重点关注其融资与设备更新需求。</p>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setShowAI(null)} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">关闭</button>
          </div>
        </Modal>
      )}

      {/* ============ 高级筛选「更多」弹窗 ============ */}
      {moreFilter && (
        <Modal title={moreFilter.title} onClose={() => setMoreFilter(null)}>
          <div className="grid grid-cols-2 gap-2">
            {moreFilter.items.map((it) => (
              <label key={it} className="flex items-center gap-2 rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-600">
                <input type="checkbox" className="accent-blue-600" />{it}
              </label>
            ))}
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button onClick={() => setMoreFilter(null)} className="rounded-md border border-slate-200 bg-white px-4 py-1.5 text-sm text-slate-600 hover:border-slate-300">取消</button>
            <button onClick={() => { setMoreFilter(null); flash('已应用筛选（演示）') }} className="rounded-md bg-brand-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-brand-700">确认</button>
          </div>
        </Modal>
      )}
    </div>
  )
}

/* ===================== 数据看板 Tab ===================== */
function BoardTab({ stats, deptChart, setDeptChart, userChart, setUserChart, userDept, setUserDept }: {
  stats: any
  deptChart: boolean; setDeptChart: (v: boolean) => void
  userChart: boolean; setUserChart: (v: boolean) => void
  userDept: string; setUserDept: (v: string) => void
}) {
  const deptData = useMemo(() => DEPT_ROWS.map((d) => ({ label: d.dept, pending: d.pending, marketing: d.marketing, limited: d.limited, success: d.success, follows: d.follows, acts: d.acts })), [])
  const userData = useMemo(() => USER_ROWS.filter((u) => !userDept || u.dept === userDept).map((u) => ({ ...u })), [userDept])

  const sortTable = (rows: any[], key: string, set: (r: any[]) => void, cur: any[]) => {
    const arr = [...cur]
    arr.sort((a, b) => (a[key] - b[key]))
    set(arr)
  }
  const [deptRows, setDeptRows] = useState(deptData)
  const [userRows, setUserRows] = useState(userData)
  useEffect(() => setDeptRows(deptData), [deptData])
  useEffect(() => setUserRows(userData), [userData])

  const deptCols = ['pending', 'marketing', 'limited', 'success', 'follows', 'acts']
  const deptHead = ['待营销', '营销中', '有限进', '营销成功', '跟进次数', '活跃次数']
  const userCols = ['pending', 'marketing', 'limited', 'success', 'follows', 'acts']
  const userHead = ['待营销', '营销中', '有限进', '营销成功', '跟进次数', '活跃次数']

  return (
    <div className="mt-4 space-y-4">
      {/* 模块1：部门营销数据 */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-800">部门营销数据</h3>
            <button onClick={() => setDeptChart((v) => !v)} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:border-slate-300"><ChartIcon /> 图表分析</button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">统计口径: 全部名单及线索, 其中包含了个人可见的名单及线索。</span>
            <button onClick={() => flash('导出部门营销数据（演示）')} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:border-slate-300"><DownloadIcon /> 导出</button>
          </div>
        </div>
        <div className="px-4 py-3">
          {deptChart ? (
            <BarChart data={deptRows.map((d) => ({ label: d.dept, value: d.marketing + d.pending + d.success }))} unit=" 条" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                    <th className="px-3 py-2.5">序号</th>
                    <th className="whitespace-nowrap px-3 py-2.5">部门</th>
                    {deptCols.map((k, i) => (
                      <th key={k} className="whitespace-nowrap px-3 py-2.5">
                        <button onClick={() => sortTable(deptRows, k, setDeptRows, deptRows)} className="flex items-center gap-1 hover:text-slate-700">{deptHead[i]} <SortArrow active={false} dir={null} /></button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptRows.map((d, i) => (
                    <tr key={d.dept} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-3 py-2.5"><span className="inline-block h-4 w-4 rounded text-center text-[11px] font-semibold text-white" style={{ background: rankColor(i) }}>{i + 1}</span></td>
                      <td className="whitespace-nowrap px-3 py-2.5"><button onClick={() => flash('跳转该部门线索明细（演示）')} className="text-brand-600 hover:underline">{d.dept}</button></td>
                      {deptCols.map((k) => <td key={k} className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-700">{d[k]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* 模块2：个人排行榜 */}
      <section className="rounded-lg border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-semibold text-slate-800">个人排行榜</h3>
            <button onClick={() => setUserChart((v) => !v)} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:border-slate-300"><ChartIcon /> 图表分析</button>
          </div>
          <div className="flex items-center gap-3">
            <select value={userDept} onChange={(e) => setUserDept(e.target.value)}
              className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-600 outline-none bg-white">
              <option value="">全部部门</option>
              {DEPTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className="text-xs text-slate-400">统计口径: 全部名单及线索, 其中包含了个人可见的名单及线索。</span>
            <button onClick={() => flash('导出个人排行榜（演示）')} className="flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-600 hover:border-slate-300"><DownloadIcon /> 导出</button>
          </div>
        </div>
        <div className="px-4 py-3">
          {userChart ? (
            <BarChart data={userRows.map((u) => ({ label: maskPhone(u.phone), value: u.marketing + u.pending + u.success }))} unit=" 条" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-xs font-medium text-slate-500">
                    <th className="px-3 py-2.5">序号</th>
                    <th className="whitespace-nowrap px-3 py-2.5">姓名</th>
                    <th className="whitespace-nowrap px-3 py-2.5">部门</th>
                    {userCols.map((k, i) => (
                      <th key={k} className="whitespace-nowrap px-3 py-2.5">
                        <button onClick={() => sortTable(userRows, k, setUserRows, userRows)} className="flex items-center gap-1 hover:text-slate-700">{userHead[i]} <SortArrow active={false} dir={null} /></button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {userRows.map((u, i) => (
                    <tr key={u.phone} className="border-b border-slate-50 hover:bg-slate-50/60">
                      <td className="px-3 py-2.5"><span className="inline-block h-4 w-4 rounded text-center text-[11px] font-semibold text-white" style={{ background: rankColor(i) }}>{i + 1}</span></td>
                      <td className="whitespace-nowrap px-3 py-2.5"><span className="text-slate-700" title={u.phone}>{maskPhone(u.phone)}</span></td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-slate-600">{u.dept}</td>
                      {userCols.map((k) => <td key={k} className="whitespace-nowrap px-3 py-2.5 tabular-nums text-slate-700">{u[k]}{k === 'acts' && u[k] > 0 ? ' 100%' : ''}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

/* ===================== 指标卡片 ===================== */
function StatCards({ stats, quick, onQuick }: { stats: any; quick: string; onQuick: (q: string) => void }) {
  const cards = [
    {
      title: '总线索', main: stats.total, mainUnit: '条',
      sub: [
        { label: '未分配', val: stats.unassigned, q: 'unassigned' },
        { label: '已分配', val: stats.assigned, q: 'assigned' },
      ],
    },
    {
      title: '待营销', main: stats.pending, mainUnit: '条',
      sub: [
        { label: '30天未跟进', val: stats.pending30, q: '' },
        { label: '近7日新增', val: stats.pending7, q: '' },
      ],
    },
    {
      title: '营销中', main: stats.marketing, mainUnit: '条',
      sub: [
        { label: '有限进记录', val: stats.mLimited, q: '' },
        { label: '无跟进记录', val: stats.mNoFollow, q: '' },
      ],
    },
    {
      title: '营销结束', main: stats.ended, mainUnit: '条',
      sub: [
        { label: '成功', val: stats.endSuccess, q: 'ended' },
        { label: '失败', val: stats.endFail, q: '' },
        { label: '无需营销', val: stats.endNoNeed, q: '' },
      ],
    },
  ]
  return (
    <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <div key={c.title} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
          <div className="text-xs text-slate-400">{c.title}</div>
          <div className="mt-1 text-2xl font-bold text-slate-800">{c.main}<span className="ml-1 text-sm font-normal text-slate-400">{c.mainUnit}</span></div>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
            {c.sub.map((s) => (
              <button key={s.label} onClick={() => s.q && onQuick(s.q)}
                className={`text-xs ${s.q ? 'text-slate-500 hover:text-brand-600' : 'text-slate-400'} ${quick === s.q && s.q ? 'font-semibold text-brand-600' : ''}`}>
                {s.label} <span className="font-semibold text-slate-700">{s.val}</span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ===================== 局部小组件 ===================== */
function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick}
      className={`relative px-1 pb-2 text-sm font-medium ${active ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}>
      {children}
      {active && <span className="absolute -bottom-[1px] left-0 right-0 h-0.5 rounded bg-brand-600" />}
    </button>
  )
}

function FilterGroup({ title, children, last }: { title: string; children: ReactNode; last?: boolean }) {
  return (
    <div className={`flex flex-wrap items-start gap-x-4 gap-y-3 ${last ? '' : 'border-b border-slate-100 pb-3 mb-3'}`}>
      <div className="w-20 shrink-0 pt-1.5 text-sm font-medium text-slate-500">{title}</div>
      <div className="flex flex-wrap items-end gap-3">{children}</div>
    </div>
  )
}

function SelectCell({ label, value, onChange, options, raw }: { label: string; value: string; onChange: (v: string) => void; options: string[]; raw?: string[] }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label}
      <select value={value} onChange={(e) => { const idx = options.indexOf(e.target.value); onChange(raw ? raw[idx] : e.target.value) }}
        className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-600 outline-none focus:border-brand-300">
        {options.map((o, i) => <option key={i} value={o}>{o === '' ? '全部' : o}</option>)}
      </select>
    </label>
  )
}

function DateRange({ from, to, onFrom, onTo, label }: { from: string; to: string; onFrom: (v: string) => void; onTo: (v: string) => void; label?: string }) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-400">
      {label ?? '时间区间'}
      <span className="flex items-center gap-1">
        <input type="date" value={from} onChange={(e) => onFrom(e.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-600 outline-none" />
        <span className="text-slate-300">—</span>
        <input type="date" value={to} onChange={(e) => onTo(e.target.value)} className="h-9 rounded-md border border-slate-200 bg-white px-2 text-sm text-slate-600 outline-none" />
      </span>
    </label>
  )
}

function BatchMenu({ disabled, onExport, onRemove }: { disabled: boolean; onExport: () => void; onRemove: () => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button disabled={disabled} onClick={() => setOpen((v) => !v)} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50">批量操作 ▾</button>
      {open && !disabled && (
        <div className="absolute left-0 z-30 mt-1 w-32 rounded-md border border-slate-200 bg-white py-1 text-left shadow-lg">
          <MoreItem onClick={() => { setOpen(false); onExport() }}>批量导出</MoreItem>
          <MoreItem onClick={() => { setOpen(false); onRemove() }}>批量移出名单</MoreItem>
        </div>
      )}
    </div>
  )
}

function MoreItem({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="block w-full px-3 py-1.5 text-left text-sm text-slate-600 hover:bg-slate-50">{children}</button>
}

function SortArrow({ active, dir }: { active: boolean; dir: 'asc' | 'desc' | null }) {
  return (
    <span className={`flex flex-col leading-none ${active ? 'text-slate-900' : 'text-slate-300'}`}>
      <span style={{ fontSize: 9, lineHeight: 1 }}>▲</span>
      <span style={{ fontSize: 9, lineHeight: 1 }}>▼</span>
    </span>
  )
}

function OpBtn({ children, onClick, danger }: { children: ReactNode; onClick: () => void; danger?: boolean }) {
  return <button onClick={onClick} className={`whitespace-nowrap rounded px-1.5 py-0.5 hover:underline ${danger ? 'text-rose-600' : 'text-brand-600'}`}>{children}</button>
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
  return (<div><div className="mb-1.5 text-sm font-medium text-slate-600">{label}</div>{children}</div>)
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

function BarChart({ data, unit }: { data: { label: string; value: number }[]; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="space-y-2">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3 text-sm">
          <div className="w-24 shrink-0 truncate text-slate-600" title={d.label}>{d.label}</div>
          <div className="h-5 flex-1 rounded bg-slate-100">
            <div className="h-5 rounded bg-brand-500" style={{ width: `${(d.value / max) * 100}%`, minWidth: d.value > 0 ? 8 : 0 }} />
          </div>
          <div className="w-14 text-right tabular-nums text-slate-700">{d.value}{unit}</div>
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
