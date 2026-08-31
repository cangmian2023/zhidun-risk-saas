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
import RuleHub from './RuleHub'
import VerifyCatalogPage from './VerifyCatalogPage'
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
import { CustProfile } from './CustProfile'
import CustScoreDetail from './CustScoreDetail'
import MidDataSourceDetail from './MidDataSourceDetail'
import MidMetricDetail from './MidMetricDetail'
import MidStrategyDetail from './MidStrategyDetail'
import MidDashboardDetail from './MidDashboardDetail'
import MidBizFlowConfig from './MidBizFlowConfig'
import CmAlertConfig from './CmAlertConfig'
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
import { ZzCaseModule } from './ZzCase'
import { ZzStrategyModule } from './ZzStrategy'
import { ZzAgentModule } from './ZzAgent'
import { ZzAgencyModule } from './ZzAgency'
import { ZzVisitModule } from './ZzVisit'
import { ZzQaModule } from './ZzQa'
import { ZzAiModule } from './ZzAi'
import { ZzAiTaskDetail } from './ZzAiTaskDetail'
import { ZzSmsTemplate } from './ZzSmsTemplate'
import { ZzVisitorManage } from './ZzVisitorManage'
import { ZzLegalModule } from './ZzLegal'
import { ZzBiModule } from './ZzBi'
import EnterpriseModule from './EnterpriseModule'
import EnterpriseDashboard from './EnterpriseDashboard'
import ScoreModule from './ScoreModule'
import DecisionModule from './DecisionModule'
import DmModule from './DmModule'
import DmEntArchiveBasic from './DmEntArchiveBasic'
import DmPersonArchiveBasic from './DmPersonArchiveBasic'
import { getDashboardByKey } from './dashboardData'

// AI 营销现回归系统框架内渲染（保留顶部导航与左侧菜单），不再需要全屏沉浸式模式
const AI_MARKETING_FULLSCREEN_PAGES = new Set<string>([])
// 企业档案类页面需要内容区全宽自适应（不再受 max-w-[1320px] 约束），保留顶部导航与侧边栏
const WIDE_CONTENT_PAGES = new Set(['ent-archive-basic', 'ent-archive', 'person-archive', 'person-archive-basic'])
import { creditRiskMenu, scoringMenu, entMenu, dmMenu, dataGovernanceMenu, cmMenu, collectionMenu, decisionEngineMenu, type MenuGroup } from './menus'
import SidebarMenu from './SidebarMenu'
import { MenuIcon, type IconName } from '../components/icons'
import { moduleSpecs } from './specs'

const subName: Record<string, string> = {
  cr: '零售信贷风控',
  sc: '评分产品',
  ep: '企业风控',
  dm: '数字营销',
  dg: '数据治理',
  zz: '催收管理',
  de: '决策引擎',
  cm: '管理中心',
}

// 子系统（可在 banner 中一键切换）
const subsystems = [
  { key: 'cr', name: '零售信贷风控', open: true },
  { key: 'sc', name: '评分产品', open: true },
  { key: 'ep', name: '企业风控', open: true },
  { key: 'dm', name: '数字营销', open: true },
  { key: 'dg', name: '数据治理', open: true },
  { key: 'zz', name: '催贷管理', open: true },
  { key: 'de', name: '决策引擎', open: true },
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
  // 外壳子系统：侧边栏/顶部子系统条跟随「入口子系统」(from)，而非 URL 的 sub。
  // 这样跨子系统复用详情页（如 sc 进 cr:mid-cust-score）时，外壳保持入口子系统不变。
  const shellSub = new URLSearchParams(loc.search).get('from') || sub

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
    // 贷中监控 5 个看板页（需求19：补全图标，避免全部回退 dashboard 造成重复）
    'cr:mid-td1': 'grid',
    'cr:mid-td2': 'monitor',
    'cr:mid-td3': 'bell',
    'cr:mid-td4': 'trend',
    'cr:mid-td5': 'flag',
    // 评分产品（v3 新 IA：工作台/在线评分/客户洞察/数据分析/模型管理/策略配置）
    'sc:overview': 'dashboard',
    'sc:alert-workbench': 'bell',
    'sc:score-records': 'list',
    'sc:crowd-groups': 'users',
    'sc:customer-list': 'id',
    'sc:score-dist': 'pie',
    'sc:hit-analysis': 'filter',
    'sc:model-manage': 'model',
    'sc:model-effect': 'analytics',
    'sc:dispose-flow': 'work_flow',
    'cr:mid-alert-detail': 'alert',
    'cr:mid-dispose-detail': 'inbox',
    'cm:mid-data-source-detail': 'database',
    'cm:mid-metric-detail': 'trend',
    'cm:mid-strategy-detail': 'code',
    'cm:mid-dashboard-detail': 'monitor',
    // 企业风控（v3 重建：菜单 1:1 来自原产品「风控子系统目录」「尽调目录」）
    // 风险监控
    'ep:fk-risk-warning': 'bell',
    'ep:fk-monitor-list': 'monitor',
    'ep:fk-stats': 'dashboard',
    'ep:fk-map': 'zoom',
    'ep:fk-monitor-manage': 'work_flow',
    // 风险管理
    'ep:fk-health-check': 'gauge',
    'ep:fk-account-yearly': 'clock',
    'ep:fk-property': 'cube',
    'ep:fk-blacklist': 'flag',
    // 内控合规
    'ep:fk-interest': 'share',
    'ep:fk-employee': 'users',
    'ep:fk-regulatory': 'shield',
    // 企业尽调
    'ep:jd-company': 'search',
    'ep:jd-company-result': 'search',
    'ep:jd-batch': 'stack',
    'ep:jd-batch-result': 'stack',
    'ep:jd-relation': 'link',
    'ep:jd-relation-result': 'search',
    'ep:jd-person': 'id',
    // 尽调报告
    'ep:jd-report': 'report',
    'ep:jd-report-custom': 'file',
    // 受益所有人
    'ep:jd-beneficiary': 'layers',
    'ep:jd-beneficiary-result': 'search',
    // 企业信贷审批（顺位第一 · 由零售信贷贷前四页整体迁入）
    'ep:ent-pre-report': 'report',
    'ep:ent-pre-report-detail': 'eye',
    'ep:ent-pre-verify': 'verify',
    'ep:ent-pre-verify-detail': 'eye',
    'ep:ent-credit-kimi': 'shield',
    'ep:ent-credit-kimi-detail': 'eye',
    'ep:ent-pre-fraud': 'alert',
    'ep:ent-pre-fraud-detail': 'eye',
    'ep:jd-equity-penetrate': 'share',
    // 企业档案（详情内页，不在左侧菜单）
    'ep:archive': 'database',
    // 数字营销（新 IA：潜客挖掘 / 专题营销 / 营销管理 / 存客管理 / 金融工具）
    'dm:ai-marketing': 'pulse',
    'dm:full-search': 'search',
    'dm:regional-biz': 'zoom',
    'dm:regional-ai': 'pulse',
    'dm:regional-company': 'stack',
    'dm:regional-relate': 'share',
    'dm:map-prospect': 'zoom',
    'dm:grid-marketing': 'grid',
    'dm:company-lib': 'database',
    'dm:company-lib-list': 'list',
    'dm:group-account': 'layers',
    'dm:group-soe': 'flag',
    'dm:group-foreign': 'cloud',
    'dm:group-central': 'flag',
    'dm:group-actual': 'id',
    'dm:group-inst': 'layers',
    'dm:group-private': 'cube',
    'dm:group-detail': 'id',
    'dm:tender': 'report',
    'dm:supply-chain': 'link',
    'dm:techfin': 'model',
    'dm:techfin-lib': 'database',
    'dm:industry-fin': 'cube',
    'dm:park-fin': 'layers',
    'dm:park-list': 'list',
    'dm:park-portrait': 'pie',
    'dm:park-detail': 'eye',
    'dm:park-clue': 'zoom',
    'dm:market-list': 'list',
    'dm:market-list-detail': 'eye',
    'dm:market-list-board': 'dashboard',
    'dm:market-lead': 'bell',
    'dm:market-board': 'dashboard',
    'dm:exist-biz': 'cube',
    'dm:crowd-analysis': 'users',
    'dm:pevc': 'stack',
    'dm:pevc-event': 'trend',
    'dm:pevc-org': 'database',
    'dm:pevc-fund': 'stack',
    'dm:pevc-history-share': 'clock',
    'dm:pevc-invest-out': 'share',
    'dm:pevc-shareholder': 'id',
    'dm:listing': 'chart',
    'dm:bond': 'bars',
    'dm:rating': 'tag',
    'dm:rating-history': 'clock',
    'dm:peer-analysis': 'share',
    'dm:peer-detail': 'eye',
    'dm:industry-report': 'report',
    'dm:fin-law': 'audit',
    // 企业档案（共享详情）
    'dm:ent-basic': 'id',
    'dm:ent-operate': 'cube',
    'dm:ent-legal': 'shield',
    'dm:ent-history': 'clock',
    'dm:ent-news': 'bell',
    'dm:ent-operate-risk': 'alert',
    'dm:ent-property': 'layers',
    'dm:ent-group': 'layers',
    'dm:ent-graph': 'share',
    // 档案备份页（qixin 快照 1:1 原样复刻）
    'dm:ent-archive': 'id',
    'dm:person-archive': 'user',
    // 档案 basic 版（数据复刻 · 6 个主 Tab 1:1 仿企业档案 basic）
    'dm:ent-archive-basic': 'id',
    'dm:person-archive-basic': 'user',
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
    'cm:fraud-rules': 'layers',
    'cm:rule-hub': 'layers',
    'cm:rule-hub-items': 'plug',
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
    'cr:mid-single-cust': 'id',
    'cr:mid-single-cust-2': 'id',
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
    // 决策引擎
    'de:overview': 'dashboard',
    'de:model-manage': 'model',
    'de:feature-lib': 'database',
    'de:feature-monitor': 'pulse',
    'de:list-lib': 'layers',
    'de:template-market': 'grid',
    'de:version-manage': 'clock',
    'de:traffic-split': 'share',
    'de:decision-replay': 'eye',
    'de:batch-decision': 'inbox',
    'de:monitor-board': 'monitor',
    'de:alert-manage': 'bell',
    'de:decision-analysis': 'analytics',
    'de:rule-hit': 'filter',
    'de:decision-log': 'list',
    'de:approval-manage': 'check',
  }
  const menuIcon = (key: string): IconName => MENU_ICON[key] ?? 'dashboard'

  // 各子系统默认首页：评分产品=评分记录｜催贷管理=案件管理｜数据治理=元事件｜管理中心=规则合集｜企业风控=风险预警｜数字营销=AI营销
  const subHome = (key: string) =>
    key === 'sc' ? 'score-records' :
    key === 'zz' ? 'cases' :
    key === 'dg' ? 'meta-event' :
    key === 'cm' ? 'rule-hub' : key === 'ep' ? 'fk-risk-warning' : key === 'dm' ? 'ai-marketing' : 'overview'

  const menu: MenuGroup[] =
    shellSub === 'cr' ? creditRiskMenu :
    shellSub === 'sc' ? scoringMenu :
    shellSub === 'ep' ? entMenu :
    shellSub === 'dm' ? dmMenu :
    shellSub === 'dg' ? dataGovernanceMenu :
    shellSub === 'zz' ? collectionMenu :
    shellSub === 'de' ? decisionEngineMenu :
    shellSub === 'cm' ? cmMenu : []
  const cur = (loc.pathname.split('/')[3] as string) || subHome(sub)
  const key = `${sub}:${cur}`

  // 详情页高亮回退：详情路由段（如 model-detail / mid-cust-score）不在菜单里，
  // 用 back 参数（入口列表页完整 URL）取出其路由段作为高亮项，
  // 这样「列表 → 详情」左侧菜单选中态不丢失。列表页自身命中则直接用 cur。
  const backParamUrl = new URLSearchParams(loc.search).get('back') || ''
  const backCur = backParamUrl ? (backParamUrl.split('?')[0].split('/')[3] || '') : ''
  const menuLeafKeys = menu.flatMap((g) => g.items).map((i) => i.key.split(':')[1])
  const activeCur = menuLeafKeys.includes(cur) ? cur : (backCur && menuLeafKeys.includes(backCur) ? backCur : cur)

  const isAiMarketingFullScreen = sub === 'dm' && AI_MARKETING_FULLSCREEN_PAGES.has(cur)
  const isWideContent = sub === 'dm' && WIDE_CONTENT_PAGES.has(cur)

  const isQuery = cur.endsWith('-query')
  const prod = cur.split('-')[0]
  const queryProd =
    prod === 'zhicha' || prod === 'zhixin' || prod === 'zhirong'
      ? (prod as 'zhicha' | 'zhixin' | 'zhirong')
      : null

  const supported = sub === 'cr' || sub === 'sc' || sub === 'ep' || sub === 'dm' || sub === 'dg' || sub === 'cm' || sub === 'zz' || sub === 'de'

  function onLogout() {
    logout()
    nav('/login')
  }
  function switchSub(key: string) {
    nav(`/console/${key}/${subHome(key)}`)
  }

  // 旧 overview 入口（书签/旧链接）重定向到各子系统新首页
  useEffect(() => {
    if (sub === 'cm' && cur === 'overview') {
      nav('/console/cm/rule-hub', { replace: true })
    } else if (sub === 'ep' && cur === 'overview') {
      nav('/console/ep/fk-risk-warning', { replace: true })
    } else if (sub === 'dm' && cur === 'overview') {
      nav('/console/dm/ai-marketing', { replace: true })
    }
  }, [sub, cur, nav])

  return (
    <div className="min-h-screen bg-slate-50">
      {!isAiMarketingFullScreen && (
        <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
          {/* 左：Logo + 子系统切换（直接跟系列按钮，无标签、无子系统名） */}
          <div className="flex min-w-0 items-center gap-3">
            <Logo />
            <span className="hidden h-5 w-px bg-slate-200 sm:block" />
            <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1">
              {subsystems.map((s) => {
                const active = s.key === shellSub
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
      )}

      <div className="flex">
        {!isAiMarketingFullScreen && (
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
                <span title={`${subName[shellSub]}（规划中）`} className="text-slate-300">
                  <MenuIcon name="lock" className="h-5 w-5" />
                </span>
              </div>
            ) : (
              <div className="px-5 py-8 text-sm text-slate-400">
                <p className="font-medium text-slate-500">{subName[shellSub]}（规划中）</p>
                <p className="mt-2 leading-relaxed">
                  该子系统功能正在规划与接入中，敬请期待。您可点击顶部的子系统按钮切换至已开通的子系统。
                </p>
              </div>
            )
          ) : collapsed ? (
            <nav className="flex flex-col items-center gap-1 px-2">
              {menu.flatMap((g) => g.items).map((it) => {
                const to = `/console/${shellSub}/${it.key.split(':')[1]}`
                const active = it.key.split(':')[1] === activeCur
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
            <SidebarMenu menu={menu} sub={shellSub} cur={activeCur} menuIcon={menuIcon} nav={nav} />
          )}
          </aside>
        )}

        {!isAiMarketingFullScreen && !collapsed && (
          <div
            onMouseDown={onDragDown}
            title="拖拽调整菜单宽度"
            className="w-1.5 shrink-0 cursor-col-resize bg-slate-200 transition hover:bg-brand-400"
          />
        )}

        <main
          className={`${isAiMarketingFullScreen || isWideContent ? 'min-w-0 flex-1' : 'min-w-0 flex-1 px-4 py-6 lg:px-8'} ${sub === 'ep' || sub === 'dm' ? 'ep-dm-tables' : ''}`}
        >
          {isAiMarketingFullScreen || isWideContent ? (
            <DmModule pageKey={key} />
          ) : (
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
            ) : key === 'cm:rule-hub' ? (
              <RuleHub />
            ) : key === 'cm:rule-hub-items' ? (
              <VerifyCatalogPage />
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
            ) : key === 'cm:alert-config' ? (
              <CmAlertConfig />
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
            ) : key.startsWith('zz:case') ? (
              <ZzCaseModule pageKey={key} />
            ) : key.startsWith('zz:strategy') ? (
              <ZzStrategyModule pageKey={key} />
            ) : key.startsWith('zz:agent') ? (
              <ZzAgentModule pageKey={key} />
            ) : key.startsWith('zz:agency') ? (
              <ZzAgencyModule pageKey={key} />
            ) : key.startsWith('zz:visitor') ? (
              <ZzVisitorManage />
            ) : key.startsWith('zz:visit') ? (
              <ZzVisitModule pageKey={key} />
            ) : key.startsWith('zz:qa') ? (
              <ZzQaModule pageKey={key} />
            ) : key.startsWith('zz:ai-task-detail') ? (
              <ZzAiTaskDetail />
            ) : key.startsWith('zz:ai') ? (
              <ZzAiModule pageKey={key} />
            ) : key.startsWith('zz:sms') ? (
              <ZzSmsTemplate />
            ) : key.startsWith('zz:legal') ? (
              <ZzLegalModule pageKey={key} />
            ) : key.startsWith('zz:bi') ? (
              <ZzBiModule pageKey={key} />
            ) : key === 'ep:overview' || key === 'ep:overview-realtime' ? (
              <EnterpriseDashboard key={key} pageKey={key} />
            ) : key.startsWith('ep:') ? (
              <EnterpriseModule pageKey={key} />
            ) : key === 'cr:overview' ? (
              <RetailCreditHome />
            ) : key.startsWith('cr:mid-td') || key === 'cr:mid-overview' || key === 'cr:mid-alert' || key === 'cr:mid-crowd' ? (
              <MidDashboardPage pageKey={key} />
            ) : key === 'cr:mid-alert-workbench' ? (
              <MidAlertWorkbench />
            ) : key === 'cr:mid-cust-score' ? (
              <CustScoreDetail />
            ) : key === 'cr:mid-single-cust' ? (
              <CustProfile custId={new URLSearchParams(loc.search).get('cust') ?? undefined} />
            ) : key === 'cr:mid-single-cust-2' ? (
              <CustProfile custId="CUST-100891" title="单客详情2（高风险）" />
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
              <ScoreModule pageKey={key} search={loc.search} />
            ) : key.startsWith('de:') ? (
              <DecisionModule pageKey={key} search={loc.search} />
            ) : key === 'cm:ent-archive-basic' ? (
              <DmEntArchiveBasic />
            ) : key === 'cm:person-archive-basic' ? (
              <DmPersonArchiveBasic />
            ) : key === 'cm:cust-archive-legacy' ? (
              <CustProfile custId="CUST-100891" title="个人档案（旧版 · 零售信贷）" />
            ) : key === 'cm:cust-score-legacy' ? (
              <CustScoreDetail defaultCust="CUST-100891" defaultProd="zhicha" />
            ) : key.startsWith('dm:') ? (
              <DmModule pageKey={key} />
            ) : (
              <ModulePage spec={moduleSpecs[key] ?? emptySpec(subName[sub] ?? '控制台')} />
            )}
          </div>
          )}
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
