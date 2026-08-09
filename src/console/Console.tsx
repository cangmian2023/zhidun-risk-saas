import { useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { NavLink, useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Logo from '../components/Logo'
import ModulePage from './ModulePage'
import PreApplication from './PreApplication'
import InfoVerify222 from './InfoVerify222'
import InfoVerify222Detail from './InfoVerify222Detail'
import CreditVerify222 from './CreditVerify222'
import CreditVerify222Detail from './CreditVerify222Detail'
import FraudVerify222 from './FraudVerify222'
import FraudVerify222Detail from './FraudVerify222Detail'
import DecisionVerify222 from './DecisionVerify222'
import DecisionVerify222Detail from './DecisionVerify222Detail'
import ScoreQueryPage from './ScoreQueryPage'
import VerifyRuleList from './VerifyRuleList'
import RuleHub from './RuleHub'
import VerifyRuleConfig from './VerifyRuleConfig'
import ReportTemplate from './ReportTemplate'
import ReportTemplatePreview from './ReportTemplatePreview'
import MidDashboardPage from './MidDashboardPage'
import DashboardConfig from './DashboardConfig'
import MidDataSourceConfig from './MidDataSourceConfig'
import MidMetricConfig from './MidMetricConfig'
import MidMonitorConfig from './MidMonitorConfig'
import MidDisposeConfig from './MidDisposeConfig'
import MidDashboardConfig from './MidDashboardConfig'
import MidAlertWorkbench from './MidAlertWorkbench'
import MidCustDetail from './MidCustDetail'
import MidDisposeWorkbench from './MidDisposeWorkbench'
import MidDataSourceDetail from './MidDataSourceDetail'
import MidMetricDetail from './MidMetricDetail'
import MidStrategyDetail from './MidStrategyDetail'
import MidDashboardDetail from './MidDashboardDetail'
import MidBizFlowConfig from './MidBizFlowConfig'
import MidAlertDetail from './MidAlertDetail'
import MidDisposeDetail from './MidDisposeDetail'
import RetailCreditHome from './RetailCreditHome'
import MetaEventConfig from './MetaEventConfig'
import MetaEventPropConfig from './MetaEventPropConfig'
import MetaUserPropConfig from './MetaUserPropConfig'
import MetaDimTableConfig from './MetaDimTableConfig'
import MetaItemPropConfig from './MetaItemPropConfig'
import MetaVirtualPropConfig from './MetaVirtualPropConfig'
import MetaVirtualEventConfig from './MetaVirtualEventConfig'
import MetaAutoTrackConfig from './MetaAutoTrackConfig'
import EventAnalysis from './EventAnalysis'
import { CollectionOverview, CollectionCases, CollectionStrategy, CollectionRecords } from './CollectionPages'
import { DunAssignment, DunImport, DunChannels, DunAgencies, DunQa, DunRepayment } from './DunPages'
import ScoreModule from './ScoreModule'
import { getDashboardByKey } from './dashboardData'
import { creditRiskMenu, scoringMenu, entMenu, dmMenu, dataGovernanceMenu, cmMenu, collectionMenu, type MenuGroup } from './menus'
import SidebarMenu from './SidebarMenu'
import { MenuIcon, type IconName } from '../components/icons'
import { moduleSpecs } from './specs'

const subName: Record<string, string> = {
  cr: '零售信贷风控',
  sc: '评分产品',
  ep: '企业风控',
  dm: '数字营销',
  dg: '数据治理',
  cm: '管理中心',
  zz: '催收管理',
}

// 子系统（可在 banner 中一键切换）
const subsystems = [
  { key: 'cr', name: '零售信贷风控', open: true },
  { key: 'sc', name: '评分产品', open: true },
  { key: 'ep', name: '企业风控', open: false },
  { key: 'dm', name: '数字营销', open: false },
  { key: 'dg', name: '数据治理', open: true },
  { key: 'zz', name: '催贷管理', open: true },
  { key: 'cm', name: '管理中心', open: true },
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

  // 每个菜单 key 映射图标（沿用既有合法图标名，未命中的回退 dashboard）
  const MENU_ICON: Record<string, IconName> = {
    // 零售信贷风控
    'cr:overview': 'dashboard',
    // 零售信贷风控
    'cr:pre-application': 'audit',
    'cr:pre-verify': 'verify',
    'cr:pre-verify-config': 'filter',
    'cr:credit-kimi': 'shield',
    'cr:credit-kimi-config': 'sliders',
    'cr:pre-fraud': 'alert',
    'cr:fraud-rules': 'layers',
    'cr:fraud-blacklist': 'plug',
    'cr:fraud-gang': 'link',
    'cr:pre-report': 'report',
    'cr:pre-report-template': 'stack',
    'cr:pre-report-detail': 'eye',
    'cr:mid-task': 'cube',
    'cr:mid-task-config': 'settings',
    'cr:mid-task-log': 'clock',
    'cr:mid-alert': 'bell',
    'cr:mid-crowd': 'chart',
    'cr:mid-crowd-single': 'flag',
    'cr:mid-crowd-trend': 'trend',
    'cr:mid-dispose': 'gauge',
    'cr:mid-dispose-record': 'inbox',
    'cr:mid-dispose-strategy': 'work_flow',
    'cr:mid-output-api': 'cloud',
    'cr:mid-output-push': 'link',
    'cr:mid-output-download': 'grid',
    // 评分产品
    'sc:zhicha-query': 'search',
    'sc:zhicha-batch': 'stack',
    'sc:zhicha-dist': 'pie',
    'sc:zhicha-eval': 'analytics',
    'sc:zhicha-tune': 'wrench',
    'sc:zhicha-bill-query': 'bars',
    'sc:zhicha-bill-hit': 'tag',
    'sc:zhicha-bill': 'id',
    'sc:zhicha-detail': 'eye',
    'sc:zhixin-query': 'zoom',
    'sc:zhixin-batch': 'layers',
    'sc:zhixin-dist': 'chart',
    'sc:zhixin-eval': 'trend',
    'sc:zhixin-tune': 'code',
    'sc:zhixin-bill-query': 'filter',
    'sc:zhixin-bill-hit': 'grid',
    'sc:zhixin-bill': 'plug',
    'sc:zhixin-detail': 'cloud',
    'sc:zhirong-query': 'search',
    'sc:zhirong-batch': 'stack',
    'sc:zhirong-dist': 'pie',
    'sc:zhirong-eval': 'analytics',
    'sc:zhirong-tune': 'wrench',
    'sc:zhirong-sc-default': 'sliders',
    'sc:zhirong-sc-credit': 'settings',
    'sc:zhirong-sc-interest': 'work_flow',
    'sc:zhirong-bill-query': 'bars',
    'sc:zhirong-bill-hit': 'tag',
    'sc:zhirong-bill': 'id',
    'sc:zhirong-detail': 'eye',
    // 企业风控
    'ep:overview': 'dashboard',
    'ep:ent-verify': 'verify',
    'ep:ent-verify-config': 'filter',
    'ep:ent-credit': 'shield',
    'ep:ent-credit-config': 'sliders',
    'ep:ent-graph': 'link',
    'ep:ent-graph-gang': 'plug',
    'ep:ent-mid-task': 'cube',
    'ep:ent-mid-alert': 'bell',
    'ep:ent-mid-board': 'chart',
    'ep:ent-verify-detail': 'eye',
    'ep:ent-credit-detail': 'cloud',
    'ep:ent-graph-detail': 'link',
    // 数字营销
    'dm:overview': 'dashboard',
    'dm:radar-query': 'search',
    'dm:radar-batch': 'stack',
    'dm:radar-model': 'model',
    'dm:radar-model-custom': 'model',
    'dm:radar-eval': 'analytics',
    'dm:radar-tag': 'tag',
    'dm:radar-tag-config': 'filter',
    'dm:radar-bill-query': 'bars',
    'dm:radar-bill-hit': 'grid',
    'dm:radar-bill': 'id',
    'dm:herald-task': 'plug',
    'dm:herald-task-create': 'flag',
    'dm:herald-crowd': 'users',
    'dm:herald-crowd-preview': 'eye',
    'dm:herald-crowd-save': 'cloud',
    'dm:herald-sms': 'link',
    'dm:herald-aicall': 'braces',
    'dm:herald-complaint': 'plug',
    'dm:herald-effect': 'chart',
    'dm:herald-funnel': 'filter',
    'dm:herald-ab': 'check',
    'dm:rta-query': 'cloud',
    'dm:rta-media': 'link',
    'dm:rta-media-test': 'zoom',
    'dm:rta-concurrency': 'gauge',
    'dm:rta-model': 'model',
    'dm:rta-model-custom': 'model',
    'dm:rta-eval': 'analytics',
    'dm:rta-bill-query': 'bars',
    'dm:rta-bill-year': 'id',
    'dm:rta-bill': 'plug',
    'dm:rta-strategy': 'sliders',
    'dm:rta-strategy-effect': 'chart',
    'dm:rta-strategy-tune': 'wrench',
    'dm:herald-task-detail': 'eye',
    'dm:rta-detail': 'cloud',
    // 管理中心（原公共模块）
    'cm:overview': 'dashboard',
    'cm:user-list': 'users',
    'cm:user-role': 'id',
    'cm:user-profile': 'users',
    'cm:sys-datasource': 'database',
    'cm:sys-rule-engine': 'filter',
    'cm:sys-notify': 'bell',
    'cm:sys-audit': 'clock',
    'cm:dash-biz': 'chart',
    'cm:dash-realtime': 'monitor',
    'cm:dash-report': 'report',
    'cm:help-doc': 'report',
    'cm:help-faq': 'flag',
    'cm:help-service': 'bell',
    // 行为分析
    'cm:event-analysis': 'analytics',
    // 元数据管理（数据治理子系统 · 对齐神策元数据管理）
    'dg:meta-event': 'pulse',
    'dg:meta-event-prop': 'braces',
    'dg:meta-user-prop': 'id',
    'dg:meta-dim-table': 'database',
    'dg:meta-item-prop': 'cube',
    'dg:meta-virtual-prop': 'code',
    'dg:meta-virtual-event': 'layers',
    'dg:meta-auto-track': 'eye',
    // 管理中心（原公共模块）：由零售信贷风控迁入的「公共配置」
    'cm:pre-application': 'audit',
    'cm:pre-verify-config': 'filter',
    'cm:fraud-rules': 'layers',
    'cm:rule-hub': 'layers',
    'cm:fraud-blacklist': 'plug',
    'cm:fraud-gang': 'link',
    'cm:mid-dispose-strategy': 'work_flow',
    'cm:credit-kimi-config': 'sliders',
    'cm:report-template': 'stack',
    'cm:dashboard-config': 'grid',
    'cm:mid-task-config': 'settings',
    'cm:mid-task-log': 'clock',
    'cm:mid-output-api': 'cloud',
    'cm:mid-output-push': 'link',
    'cm:mid-output-download': 'grid',
    // 贷中监控配置（v3 规划）
    'cm:mid-data-source': 'database',
    'cm:mid-metric': 'sliders',
    'cm:mid-strategy': 'work_flow',
    'cm:mid-dashboard-config': 'grid',
    'cm:biz-flow': 'work_flow',
    // 贷中监控使用域（v3）
    'cr:mid-overview': 'chart',
    'cr:mid-alert-workbench': 'zoom',
    'cr:mid-dispose-workbench': 'work_flow',
    'cr:mid-cust-detail': 'monitor',
    // 催贷管理（6 大模块重新规划）
    'zz:overview': 'chart',
    'zz:cases': 'work_flow',
    'zz:records': 'inbox',
    'zz:strategy': 'sliders',
    'zz:assignment': 'share',
    'zz:import': 'cloud',
    'zz:channels': 'plug',
    'zz:agencies': 'users',
    'zz:qa': 'shield',
    'zz:repayment': 'check',
  }
  const menuIcon = (key: string): IconName => MENU_ICON[key] ?? 'dashboard'

  const menu: MenuGroup[] =
    sub === 'cr' ? creditRiskMenu :
    sub === 'sc' ? scoringMenu :
    sub === 'ep' ? entMenu :
    sub === 'dm' ? dmMenu :
    sub === 'dg' ? dataGovernanceMenu :
    sub === 'cm' ? cmMenu :
    sub === 'zz' ? collectionMenu : []
  const cur = (loc.pathname.split('/')[3] as string) || 'overview'
  const key = `${sub}:${cur}`

  const isQuery = cur.endsWith('-query')
  const prod = cur.split('-')[0]
  const queryProd =
    prod === 'zhicha' || prod === 'zhixin' || prod === 'zhirong'
      ? (prod as 'zhicha' | 'zhixin' | 'zhirong')
      : null

  const supported = sub === 'cr' || sub === 'sc' || sub === 'ep' || sub === 'dm' || sub === 'dg' || sub === 'cm' || sub === 'zz'

  function onLogout() {
    logout()
    nav('/login')
  }
  function switchSub(key: string) {
    // 管理中心默认落到「核验规则」（原 overview 入口已随菜单下架）
    nav(`/console/${key}/${key === 'cm' ? 'pre-verify-config' : 'overview'}`)
  }

  // 管理中心：访问 /console/cm/overview（旧入口/书签）时重定向到第一个有效菜单「核验规则」
  useEffect(() => {
    if (sub === 'cm' && cur === 'overview') {
      nav('/console/cm/pre-verify-config', { replace: true })
    }
  }, [sub, cur, nav])

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
            <SidebarMenu menu={menu} sub={sub} cur={cur} menuIcon={menuIcon} nav={nav} />
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
            ) : key === 'cm:pre-application' ? (
              <PreApplication />
            ) : key === 'cr:pre-verify' ? (
              <InfoVerify222 />
            ) : key === 'cr:pre-verify-detail' ? (
              <InfoVerify222Detail />
            ) : key === 'cr:credit-kimi' ? (
              <CreditVerify222 />
            ) : key === 'cr:credit-kimi-detail' ? (
              <CreditVerify222Detail />
            ) : key === 'cr:pre-fraud' ? (
              <FraudVerify222 />
            ) : key === 'cr:pre-fraud-detail' ? (
              <FraudVerify222Detail />
            ) : key === 'cr:pre-report' ? (
              <DecisionVerify222 />
            ) : key === 'cr:pre-report-detail' ? (
              <DecisionVerify222Detail />
            ) : key === 'cr:pre-verify-config' ? (
              <VerifyRuleList />
            ) : key === 'cr:pre-verify-config-detail' ? (
              <VerifyRuleConfig />
            ) : key === 'cm:pre-verify-config' ? (
              <VerifyRuleList />
            ) : key === 'cm:pre-verify-config-detail' ? (
              <VerifyRuleConfig />
            ) : key === 'cm:rule-hub' ? (
              <RuleHub />
            ) : key === 'cm:report-template' ? (
              <ReportTemplate />
            ) : key === 'cm:report-template-preview' ? (
              <ReportTemplatePreview />
            ) : key === 'cm:dashboard-config' ? (
              <DashboardConfig />
            ) : key === 'cm:mid-data-source' ? (
              <MidDataSourceConfig />
            ) : key === 'cm:mid-metric' ? (
              <MidMetricConfig />
            ) : key === 'cm:mid-strategy' ? (
              <MidMonitorConfig />
            ) : key === 'cm:mid-dashboard-config' ? (
              <MidDashboardConfig />
            ) : key === 'cm:biz-flow' ? (
              <MidBizFlowConfig />
            ) : key === 'cm:mid-dispose-strategy' ? (
              <MidDisposeConfig />
            ) : key === 'cm:event-analysis' ? (
              <EventAnalysis />
            ) : key === 'dg:meta-event' ? (
              <MetaEventConfig />
            ) : key === 'dg:meta-event-prop' ? (
              <MetaEventPropConfig />
            ) : key === 'dg:meta-user-prop' ? (
              <MetaUserPropConfig />
            ) : key === 'dg:meta-dim-table' ? (
              <MetaDimTableConfig />
            ) : key === 'dg:meta-item-prop' ? (
              <MetaItemPropConfig />
            ) : key === 'dg:meta-virtual-prop' ? (
              <MetaVirtualPropConfig />
            ) : key === 'dg:meta-virtual-event' ? (
              <MetaVirtualEventConfig />
            ) : key === 'dg:meta-auto-track' ? (
              <MetaAutoTrackConfig />
            ) : key === 'zz:overview' ? (
              <CollectionOverview />
            ) : key === 'zz:cases' ? (
              <CollectionCases />
            ) : key === 'zz:records' ? (
              <CollectionRecords />
            ) : key === 'zz:strategy' ? (
              <CollectionStrategy />
            ) : key === 'zz:assignment' ? (
              <DunAssignment />
            ) : key === 'zz:import' ? (
              <DunImport />
            ) : key === 'zz:channels' ? (
              <DunChannels />
            ) : key === 'zz:agencies' ? (
              <DunAgencies />
            ) : key === 'zz:qa' ? (
              <DunQa />
            ) : key === 'zz:repayment' ? (
              <DunRepayment />
            ) : key === 'cr:overview' ? (
              <RetailCreditHome />
            ) : key.startsWith('cr:mid-td') || key === 'cr:mid-overview' || key === 'cr:mid-alert' || key === 'cr:mid-crowd' ? (
              <MidDashboardPage pageKey={key} />
            ) : key === 'cr:mid-alert-workbench' ? (
              <MidAlertWorkbench />
            ) : key === 'cr:mid-dispose-workbench' ? (
              <MidDisposeWorkbench />
            ) : key === 'cr:mid-cust-detail' ? (
              <MidCustDetail />
            ) : key === 'cm:mid-data-source-detail' ? (
              <MidDataSourceDetail />
            ) : key === 'cm:mid-metric-detail' ? (
              <MidMetricDetail />
            ) : key === 'cm:mid-strategy-detail' ? (
              <MidStrategyDetail />
            ) : key === 'cm:mid-dashboard-detail' ? (
              <MidDashboardDetail />
            ) : key === 'cr:mid-alert-detail' ? (
              <MidAlertDetail />
            ) : key === 'cr:mid-dispose-detail' ? (
              <MidDisposeDetail />
            ) : getDashboardByKey(key) ? (
              <MidDashboardPage pageKey={key} />
            ) : key.startsWith('sc:') ? (
              // 评分产品子系统（v2）：评分体系总览/三产品查询(下钻明细)/监控/分层/场景效果/API/批量/账单
              <ScoreModule pageKey={key} />
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
