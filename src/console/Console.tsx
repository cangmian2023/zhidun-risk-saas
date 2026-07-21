import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { NavLink, useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Logo from '../components/Logo'
import ModulePage from './ModulePage'
import PreApplication from './PreApplication'
import PreVerifyDetail from './PreVerifyDetail'
import CreditReportDetail from './CreditReportDetail'
import FraudReportDetail from './FraudReportDetail'
import ScoreQueryPage from './ScoreQueryPage'
import { creditRiskMenu, scoringMenu, type MenuGroup } from './menus'
import { MenuIcon, type IconName } from '../components/icons'
import { moduleSpecs } from './specs'

const subName: Record<string, string> = {
  cr: '零售信贷风控',
  sc: '评分产品',
  ep: '企业风控',
  dm: '数字营销',
}

// 4 个子系统（可在 banner 中一键切换）
const subsystems = [
  { key: 'cr', name: '零售信贷风控', open: true },
  { key: 'sc', name: '评分产品', open: true },
  { key: 'ep', name: '企业风控', open: false },
  { key: 'dm', name: '数字营销', open: false },
]

// 用户名下拉：SaaS 服务应用到基础用户功能
const saasServices = [
  { label: '个人中心', desc: '账户资料、安全设置', to: '/platform/profile' },
  { label: '消息通知', desc: '预警 / 系统消息中心', to: '/platform/notify' },
  { label: '工单与支持', desc: '提交问题、查看处理进度', to: '/platform/ticket' },
  { label: 'API 文档', desc: '接口鉴权与调用说明', to: '/platform/apidoc' },
  { label: '帮助中心', desc: '产品手册与常见问题', to: '/platform/help' },
  { label: '企业设置', desc: '组织、渠道与权限管理', to: '/platform/ent' },
]

export default function Console() {
  const { logout } = useAuth()
  const { sub = 'cr' } = useParams()
  const loc = useLocation()
  const nav = useNavigate()

  // 侧边栏：响应式收起 / 手动切换 / 拖拽调宽
  const COLLAPSE_BP = 1520 // 此宽度以下，展开态下列表会出现横向滚动，自动收起为图标栏
  const [autoCollapsed, setAutoCollapsed] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth < COLLAPSE_BP,
  )
  const [userCollapsed, setUserCollapsed] = useState<boolean | null>(null) // null=跟随自动
  const [width, setWidth] = useState(256)
  const dragging = useRef(false)
  const startX = useRef(0)
  const startW = useRef(0)

  useEffect(() => {
    const onResize = () => {
      setAutoCollapsed(window.innerWidth < COLLAPSE_BP)
      setUserCollapsed(null) // 窗口尺寸变化后回到自动跟随
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const w = Math.min(520, Math.max(200, startW.current + (e.clientX - startX.current)))
      setWidth(w)
    }
    const onUp = () => {
      if (dragging.current) {
        dragging.current = false
        document.body.style.userSelect = ''
        document.body.style.cursor = ''
      }
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const collapsed = userCollapsed !== null ? userCollapsed : autoCollapsed
  const toggle = () => setUserCollapsed(!collapsed)
  const [tip, setTip] = useState<{ label: string; top: number; left: number } | null>(null)
  const onDragDown = (e: ReactMouseEvent) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startW.current = width
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  }

  // 每个菜单 key 映射唯一图标，杜绝重复（同一子系统内互不重复）
  const MENU_ICON: Record<string, IconName> = {
    // 零售信贷风控
    'cr:overview': 'dashboard',
    'cr:pre-application': 'audit',
    'cr:pre-verify': 'verify',
    'cr:pre-credit': 'shield',
    'cr:pre-fraud': 'alert',
    'cr:pre-report': 'report',
    'cr:pre-manual': 'check',
    'cr:mid-cockpit': 'gauge',
    'cr:mid-task': 'cube',
    'cr:mid-alert': 'bell',
    'cr:mid-alert-detail': 'flag',
    'cr:mid-ops': 'users',
    'cr:mid-output': 'inbox',
    'cr:st-indicators': 'chart',
    'cr:st-rules': 'filter',
    'cr:st-flow': 'work_flow',
    'cr:st-models': 'model',
    'cr:st-lists': 'tag',
    'cr:st-external': 'plug',
    'cr:data-source': 'database',
    'cr:data-field': 'sliders',
    'cr:data-api': 'link',
    'cr:stat-overview': 'pie',
    'cr:stat-rules': 'bars',
    'cr:stat-decision': 'analytics',
    'cr:set-users': 'id',
    'cr:set-channel': 'settings',
    'cr:set-log': 'clock',
    // 评分产品
    'sc:overview': 'dashboard',
    'sc:zhicha-query': 'search',
    'sc:zhicha-batch': 'stack',
    'sc:zhicha-api': 'plug',
    'sc:zhixin-query': 'zoom',
    'sc:zhixin-batch': 'layers',
    'sc:zhixin-api': 'cloud',
    'sc:zhirong-query': 'eye',
    'sc:zhirong-batch': 'grid',
    'sc:zhirong-api': 'code',
    'sc:model-list': 'model',
    'sc:model-config': 'wrench',
    'sc:mon-auto': 'monitor',
    'sc:scorecard': 'sliders',
    'sc:variable': 'braces',
    'sc:mon-auto': 'monitor',
    'sc:mon-stability': 'gauge',
    'sc:mon-disc': 'pulse',
    'sc:mon-alert': 'bell',
    'sc:mon-report': 'bars',
    'sc:data-source': 'database',
    'sc:data-list': 'tag',
    'sc:data-api': 'link',
    'sc:report-dist': 'pie',
    'sc:report-reject': 'analytics',
    'sc:report-vintage': 'trend',
    'sc:report-approve': 'check',
    'sc:set-users': 'id',
    'sc:set-log': 'clock',
  }
  const menuIcon = (key: string): IconName => MENU_ICON[key] ?? 'dashboard'

  const menu: MenuGroup[] =
    sub === 'cr' ? creditRiskMenu : sub === 'sc' ? scoringMenu : []
  const cur = (loc.pathname.split('/')[3] as string) || 'overview'
  const key = `${sub}:${cur}`

  const isQuery = cur.endsWith('-query')
  const prod = cur.split('-')[0]
  const queryProd =
    prod === 'zhicha' || prod === 'zhixin' || prod === 'zhirong'
      ? (prod as 'zhicha' | 'zhixin' | 'zhirong')
      : null

  const supported = sub === 'cr' || sub === 'sc'

  function onLogout() {
    logout()
    nav('/login')
  }
  function switchSub(key: string) {
    nav(`/console/${key}/overview`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
        {/* 左：Logo + 子系统切换（直接跟系列按钮，无标签、无子系统名） */}
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1">
            {subsystems.map((s) => {
              const active = s.key === sub
              return (
                <button
                  key={s.key}
                  onClick={() => switchSub(s.key)}
                  title={s.open ? s.name : `${s.name}（规划中）`}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  {s.name}
                  {!s.open && (
                    <span className="ml-1.5 rounded bg-slate-200/70 px-1 py-0.5 text-[10px] font-normal text-slate-500">
                      规划中
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* 右：点击用户名弹出 SaaS 基础用户功能 */}
        <div className="flex shrink-0 items-center gap-3">
          <UserDropdown onLogout={onLogout} />
        </div>
      </header>

      <div className="flex">
        <aside
          className={`sticky top-14 z-30 h-[calc(100vh-3.5rem)] shrink-0 overflow-y-auto border-r border-slate-200 bg-white py-4 ${collapsed ? 'w-16' : ''}`}
          style={collapsed ? undefined : { width }}
        >
          <div className={collapsed ? 'flex justify-center pb-3' : 'flex justify-end px-3 pb-3'}>
            <button
              onClick={toggle}
              title={collapsed ? '展开菜单' : '收起菜单'}
              aria-label={collapsed ? '展开菜单' : '收起菜单'}
              className={
                collapsed
                  ? 'grid h-10 w-10 place-items-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-1 ring-brand-700/20 transition hover:bg-brand-700 hover:shadow-brand-600/40'
                  : 'grid h-8 w-8 place-items-center rounded-lg border border-brand-200 bg-brand-50 text-brand-700 transition hover:bg-brand-100 hover:border-brand-300'
              }
            >
              {collapsed ? (
                <MenuIcon name="menu" className="h-5 w-5" />
              ) : (
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              )}
            </button>
          </div>

          {!supported ? (
            collapsed ? (
              <div className="flex justify-center pt-1">
                <span title={`${subName[sub]}（规划中）`} className="text-slate-300">
                  <MenuIcon name="lock" className="h-5 w-5" />
                </span>
              </div>
            ) : (
              <div className="px-5 py-8 text-sm text-slate-400">
                <p className="font-medium text-slate-500">{subName[sub]}（规划中）</p>
                <p className="mt-2 leading-relaxed">
                  该子系统功能正在规划与接入中，敬请期待。您可点击顶部的子系统按钮切换至已开通的子系统。
                </p>
              </div>
            )
          ) : collapsed ? (
            <nav className="flex flex-col items-center gap-1 px-2">
              {menu.flatMap((g) => g.items).map((it) => {
                const to = `/console/${sub}/${it.key.split(':')[1]}`
                const active = it.key.split(':')[1] === cur
                return (
                  <NavLink
                    key={it.key}
                    to={to}
                    onMouseEnter={(e) => {
                      const r = e.currentTarget.getBoundingClientRect()
                      setTip({ label: it.label, top: r.top + r.height / 2, left: r.right + 10 })
                    }}
                    onMouseLeave={() => setTip(null)}
                    className={`grid h-10 w-10 place-items-center rounded-xl transition ${
                      active ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50 hover:text-brand-700'
                    }`}
                  >
                    <MenuIcon name={menuIcon(it.key)} className="h-5 w-5" />
                  </NavLink>
                )
              })}
            </nav>
          ) : (
            menu.map((g) => (
              <div key={g.group} className="mb-4">
                <p className="px-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{g.group}</p>
                <nav className="mt-1">
                  {g.items.map((it) => {
                    const to = `/console/${sub}/${it.key.split(':')[1]}`
                    const active = it.key.split(':')[1] === cur
                    return (
                      <NavLink
                        key={it.key}
                        to={to}
                        className={`flex items-center gap-2.5 px-5 py-2 text-sm transition ${
                          active
                            ? 'border-r-2 border-brand-600 bg-brand-50 font-medium text-brand-700'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-brand-700'
                        }`}
                      >
                        <MenuIcon name={menuIcon(it.key)} className="h-4 w-4 shrink-0" />
                        <span className="truncate">{it.label}</span>
                      </NavLink>
                    )
                  })}
                </nav>
              </div>
            ))
          )}
        </aside>

        {!collapsed && (
          <div
            onMouseDown={onDragDown}
            title="拖拽调整菜单宽度"
            className="w-1.5 shrink-0 cursor-col-resize bg-slate-200 transition hover:bg-brand-400"
          />
        )}

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1320px]">
            {!supported ? (
              <PlannedPlaceholder name={subName[sub] ?? '该子系统'} />
            ) : key === 'cr:pre-application' ? (
              <PreApplication />
            ) : key === 'cr:pre-verify-detail' ? (
              <PreVerifyDetail />
            ) : key === 'cr:credit-report-detail' ? (
              <CreditReportDetail />
            ) : key === 'cr:pre-fraud-detail' ? (
              <FraudReportDetail />
            ) : isQuery && queryProd ? (
              <ScoreQueryPage product={queryProd} />
            ) : (
              <ModulePage spec={moduleSpecs[key] ?? emptySpec(subName[sub] ?? '控制台')} />
            )}
          </div>
        </main>
      </div>

      {/* 收起态：图标悬停提示（fixed 定位，避免被侧边栏 overflow 裁剪） */}
      {tip && (
        <div
          className="pointer-events-none fixed z-50 -translate-y-1/2 rounded-lg bg-ink-900 px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-white shadow-lg"
          style={{ top: tip.top, left: tip.left }}
        >
          {tip.label}
        </div>
      )}
    </div>
  )
}

/* 用户名下拉：SaaS 服务 · 基础用户功能 */
function UserDropdown({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-100"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {user?.name?.[0] ?? 'U'}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium text-ink-900">{user?.name}</span>
          <span className="block text-xs text-slate-400">{user?.role}</span>
        </span>
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 text-slate-400 transition ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {user?.name?.[0] ?? 'U'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.org}</p>
            </div>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-xs font-semibold text-slate-400">SaaS 服务 · 基础用户功能</p>
          </div>
          <div className="grid grid-cols-1 gap-1 px-2 pb-2">
            {saasServices.map((s) => (
              <button
                key={s.label}
                onClick={() => { nav(s.to); setOpen(false) }}
                className="flex items-start gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-50"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3l8 4v6c0 4-3.5 6.5-8 8-4.5-1.5-8-4-8-8V7l8-4z" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink-900">{s.label}</span>
                  <span className="block truncate text-xs text-slate-400">{s.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 p-2">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 12H4m0 0l3-3m-3 3l3 3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PlannedPlaceholder({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 8v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-ink-900">{name} · 规划中</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
        该子系统正在规划与建设阶段，暂未开放功能页面。您可点击顶部的子系统按钮切换至已开通的「零售信贷风控」或「评分产品」子系统。
      </p>
    </div>
  )
}

function emptySpec(crumb: string) {
  return {
    title: '模块建设中',
    crumb,
    subtitle: '该模块示例数据正在补充，当前菜单与框架已就绪。',
    columns: [],
    rows: [],
  }
}
