import type { Column, Row } from '../components/ui'
import type { ReactNode } from 'react'

/* ============ 门户子系统 ============ */
export const portalSubsystems = [
  { key: 'cr', name: '零售信贷风控', desc: '贷前审核 · 贷中监控 · 策略中心 · 数据/报表/设置', color: 'from-brand-500 to-brand-700', open: true },
  { key: 'sc', name: '评分产品', desc: '智察分 / 智信分 / 智融分 · 模型与监控', color: 'from-cyan-500 to-blue-600', open: true },
  { key: 'ep', name: '企业风控', desc: '企业信贷与供应链风控（规划中）', color: 'from-slate-400 to-slate-500', open: false },
  { key: 'dm', name: '数字营销', desc: '精准获客与反作弊（规划中）', color: 'from-violet-400 to-indigo-500', open: false },
]

/* ============ 菜单（左侧） ============ */
export interface MenuItem { label: string; key: string }
export interface MenuGroup { group: string; items: MenuItem[] }

export const creditRiskMenu: MenuGroup[] = [
  { group: '工作台', items: [{ label: '概览看板', key: 'cr:overview' }] },
  {
    group: '贷前审核',
    items: [
      { label: '申贷审核', key: 'cr:pre-application' },
      { label: '信息核验', key: 'cr:pre-verify' },
      { label: '信用风控', key: 'cr:pre-credit' },
      { label: '欺诈识别', key: 'cr:pre-fraud' },
      { label: '欺诈识别·方案1', key: 'cr:fraud-s1' },
      { label: '欺诈识别·方案2', key: 'cr:fraud-s2' },
      { label: '欺诈识别·方案3', key: 'cr:fraud-s3' },
      { label: '决策报告', key: 'cr:pre-report' },
      { label: '存疑进件', key: 'cr:pre-manual' },
    ],
  },
  {
    group: '贷中监控',
    items: [
      { label: '监控驾驶舱', key: 'cr:mid-cockpit' },
      { label: '监测任务配置', key: 'cr:mid-task' },
      { label: '红黄灯预警', key: 'cr:mid-alert' },
      { label: '预警信号明细', key: 'cr:mid-alert-detail' },
      { label: '存量客群运营', key: 'cr:mid-ops' },
      { label: '结果订阅与输出', key: 'cr:mid-output' },
    ],
  },
  {
    group: '策略中心',
    items: [
      { label: '指标管理', key: 'cr:st-indicators' },
      { label: '规则管理', key: 'cr:st-rules' },
      { label: '决策流管理', key: 'cr:st-flow' },
      { label: '模型管理', key: 'cr:st-models' },
      { label: '名单管理', key: 'cr:st-lists' },
      { label: '外部数据管理', key: 'cr:st-external' },
    ],
  },
  {
    group: '数据管理',
    items: [
      { label: '数据源管理', key: 'cr:data-source' },
      { label: '字段管理', key: 'cr:data-field' },
      { label: '接口服务配置', key: 'cr:data-api' },
    ],
  },
  {
    group: '统计报表',
    items: [
      { label: '运行大盘', key: 'cr:stat-overview' },
      { label: '命中规则统计', key: 'cr:stat-rules' },
      { label: '决策结果分布', key: 'cr:stat-decision' },
    ],
  },
  {
    group: '系统设置',
    items: [
      { label: '用户与角色', key: 'cr:set-users' },
      { label: '渠道 / 产品管理', key: 'cr:set-channel' },
      { label: '操作日志', key: 'cr:set-log' },
    ],
  },
]

export const scoringMenu: MenuGroup[] = [
  { group: '工作台', items: [{ label: '概览看板', key: 'sc:overview' }] },
  {
    group: '评分产品',
    items: [
      { label: '智察分 · 评分查询', key: 'sc:zhicha-query' },
      { label: '智察分 · 批量评分', key: 'sc:zhicha-batch' },
      { label: '智察分 · API 调用', key: 'sc:zhicha-api' },
      { label: '智信分 · 评分查询', key: 'sc:zhixin-query' },
      { label: '智信分 · 批量评分', key: 'sc:zhixin-batch' },
      { label: '智信分 · API 调用', key: 'sc:zhixin-api' },
      { label: '智融分 · 评分查询', key: 'sc:zhirong-query' },
      { label: '智融分 · 批量评分', key: 'sc:zhirong-batch' },
      { label: '智融分 · API 调用', key: 'sc:zhirong-api' },
    ],
  },
  {
    group: '评分模型管理',
    items: [
      { label: '模型列表', key: 'sc:model-list' },
      { label: '模型配置', key: 'sc:model-config' },
      { label: '评分卡管理', key: 'sc:scorecard' },
      { label: '特征 / 变量管理', key: 'sc:variable' },
    ],
  },
  {
    group: '监控中心',
    items: [
      { label: '自动化监控', key: 'sc:mon-auto' },
      { label: '稳定性监控（PSI/CSI）', key: 'sc:mon-stability' },
      { label: '区分力监控', key: 'sc:mon-disc' },
      { label: '预警规则与通知', key: 'sc:mon-alert' },
      { label: '监控报表', key: 'sc:mon-report' },
    ],
  },
  {
    group: '数据管理',
    items: [
      { label: '数据源管理', key: 'sc:data-source' },
      { label: '名单管理', key: 'sc:data-list' },
      { label: '接口服务配置', key: 'sc:data-api' },
    ],
  },
  {
    group: '报表中心',
    items: [
      { label: '评分分布分析', key: 'sc:report-dist' },
      { label: '拒绝原因分析', key: 'sc:report-reject' },
      { label: 'Vintage 分析', key: 'sc:report-vintage' },
      { label: '额度 / 批准率分析', key: 'sc:report-approve' },
    ],
  },
  {
    group: '系统设置',
    items: [
      { label: '用户与角色', key: 'sc:set-users' },
      { label: '操作日志', key: 'sc:set-log' },
    ],
  },
]

/* ============ 模块规格（页面内容） ============ */
export interface ChartSpec {
  type: 'line' | 'bar' | 'donut'
  title?: string
  labels?: string[]
  series?: { name: string; color: string; data: number[] }[]
  donut?: { label: string; value: number; color: string }[]
  centerLabel?: string
  centerValue?: string
  unit?: string
}
export interface ModuleSpec {
  title: string
  crumb: string
  subtitle?: string
  stats?: { label: string; value: string; delta?: string; deltaType?: 'up' | 'down' | 'flat'; accent?: string }[]
  charts?: ChartSpec[]
  columns?: Column[]
  rows?: Row[]
  note?: string
  custom?: ReactNode
  searchable?: boolean
  reportKey?: string
  /** 查看按钮跳转的详情页路由 key；设置后：隐藏「导出」按钮，「查看」改为跳转该详情页 */
  viewNavigate?: string
  /** 列表区 Panel 标题；留空则隐藏标题标签（仅隐藏文字，保留列表） */
  listTitle?: string
  batchImport?: boolean
  historySearch?: boolean
}
