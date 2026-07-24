import type { Column, Row } from '../components/ui'
import type { ReactNode } from 'react'

/* ============ 门户子系统 ============ */
export const portalSubsystems = [
  { key: 'cr', name: '零售信贷风控', desc: '覆盖消费金融、现金贷、小微经营贷等业务的贷前审核与贷中监控。', color: 'from-rose-500 to-orange-500', open: true },
  { key: 'sc', name: '评分产品', desc: '智察分、智信分、智融分三类评分模型产品。', color: 'from-violet-500 to-fuchsia-500', open: true },
  { key: 'ep', name: '企业风控', desc: '面向企业客户的贷前核验、信用评估与关联图谱。', color: 'from-sky-500 to-cyan-500', open: false },
  { key: 'dm', name: '数字营销', desc: '猎客雷达、猎客信使、RTA 服务等营销获客工具。', color: 'from-emerald-500 to-teal-500', open: false },
  { key: 'cm', name: '公共模块', desc: '跨子系统共用的用户、配置、看板与帮助能力。', color: 'from-slate-500 to-slate-700', open: true },
]

/* ============ 菜单（左侧） ============ */
export interface MenuItem {
  label: string
  key: string
  desc?: string // 业务描述（用于「功能规划中」占位页）
  keep?: boolean // true 表示「保持不变」页，不生成占位 spec
}
export interface MenuGroup {
  group: string
  items: MenuItem[]
}

/* ============================================================
 * 一、零售信贷风控
 * ========================================================== */
export const creditRiskMenu: MenuGroup[] = [
  { group: '工作台', items: [{ label: '概览看板', key: 'cr:overview', desc: '展示零售信贷风控核心指标的实时概览看板', keep: true }] },
  { group: '申贷审核', items: [{ label: '申贷审核列表页', key: 'cr:pre-application', desc: '展示所有申贷申请进件，支持按渠道、产品、状态筛选与审核' }] },
  {
    group: '信息核验',
    items: [
      { label: '信息核验列表页', key: 'cr:pre-verify', desc: '展示信息核验的进件列表，支持核验结果查询' },
      { label: '核验规则配置页', key: 'cr:pre-verify-config', desc: '配置信息核验的校验规则、阈值、开关' },
    ],
  },
  {
    group: '信用风控',
    items: [
      { label: '信用风控列表页', key: 'cr:credit-kimi', desc: '展示信用风控审核进件列表，支持按风险等级、自动审批结果筛选' },
      { label: '信用模型配置页', key: 'cr:credit-kimi-config', desc: '配置六大维度的权重、评分规则、叠加惩罚机制' },
    ],
  },
  {
    group: '欺诈识别',
    items: [
      { label: '欺诈识别列表页', key: 'cr:pre-fraud', desc: '展示欺诈识别进件列表，支持按风险评分、命中规则筛选' },
      { label: '反欺诈规则库', key: 'cr:fraud-rules', desc: '管理反欺诈规则，配置规则权重、命中条件、处置建议' },
      { label: '黑名单管理', key: 'cr:fraud-blacklist', desc: '管理手机号、设备指纹、身份证号、银行卡黑名单' },
      { label: '团伙库管理', key: 'cr:fraud-gang', desc: '管理已知欺诈团伙信息、团伙成员、团伙特征' },
    ],
  },
  {
    group: '决策报告',
    items: [
      { label: '决策报告列表页', key: 'cr:pre-report', desc: '展示所有生成的决策报告，支持按报告类型、决策建议筛选' },
      { label: '报告模板配置页', key: 'cr:pre-report-template', desc: '配置决策报告的展示模板、字段、样式' },
    ],
  },
  {
    group: '监控任务管理',
    items: [
      { label: '监控任务列表页', key: 'cr:mid-task', desc: '展示所有监控任务，支持按产品、场景、频次筛选' },
      { label: '监控任务配置页', key: 'cr:mid-task-config', desc: '创建/编辑监控任务，配置扫描频次、客群范围、预警规则' },
      { label: '监控任务执行日志', key: 'cr:mid-task-log', desc: '展示监控任务的执行历史、耗时、扫描客群数' },
    ],
  },
  {
    group: '红黄灯预警',
    items: [
      { label: '预警列表页', key: 'cr:mid-alert', desc: '展示所有红黄灯预警记录，支持按预警等级、监控场景筛选' },
      { label: '预警规则配置页', key: 'cr:mid-alert-config', desc: '配置红灯/黄灯预警的触发条件、阈值、通知方式' },
    ],
  },
  {
    group: '客群风险看板',
    items: [
      { label: '客群风险总览页', key: 'cr:mid-crowd', desc: '展示各客群的实时风险分布、趋势变化' },
      { label: '单客风险追踪页', key: 'cr:mid-crowd-single', desc: '追踪单个客户的风险评分变化历史、预警记录' },
      { label: '风险趋势分析页', key: 'cr:mid-crowd-trend', desc: '展示客群风险评分的趋势变化、同比环比分析' },
    ],
  },
  {
    group: '处置管理',
    items: [
      { label: '处置任务列表页', key: 'cr:mid-dispose', desc: '展示待处置的预警任务，支持分配、转派、批量处置' },
      { label: '处置记录页', key: 'cr:mid-dispose-record', desc: '展示所有处置历史，含处置人、处置时间、处置结果' },
      { label: '处置策略配置页', key: 'cr:mid-dispose-strategy', desc: '配置自动处置策略（如自动降额、自动冻结）' },
    ],
  },
  {
    group: '结果输出',
    items: [
      { label: 'API接口管理页', key: 'cr:mid-output-api', desc: '管理 API 接口的调用权限、限流、计费' },
      { label: '推送配置页', key: 'cr:mid-output-push', desc: '配置 URL 推送、文件交换的接收地址、格式、频次' },
      { label: '下载中心', key: 'cr:mid-output-download', desc: '支持按时间范围、客群范围下载监控结果文件' },
    ],
  },
]

/* ============================================================
 * 二、评分产品
 * ========================================================== */
export const scoringMenu: MenuGroup[] = [
  { group: '工作台', items: [{ label: '概览看板', key: 'sc:overview', desc: '展示评分产品的核心指标与调用概览看板', keep: true }] },
  {
    group: '智察分',
    items: [
      { label: '评分查询列表页', key: 'sc:zhicha-query', desc: '展示所有智察分查询记录，支持按评分区间、查询时间筛选' },
      { label: '批量查询页', key: 'sc:zhicha-batch', desc: '支持批量上传文件进行智察分批量查询' },
      { label: '评分分布监控页', key: 'sc:zhicha-dist', desc: '展示智察分的整体分布变化、异常波动预警' },
      { label: '模型效果评估页', key: 'sc:zhicha-eval', desc: '展示智察分的 KS 值、AUC 值、lift 曲线等模型效果指标' },
      { label: '模型调优建议页', key: 'sc:zhicha-tune', desc: '基于监控数据给出智察分模型调优建议' },
      { label: '查询计费明细页', key: 'sc:zhicha-bill-query', desc: '展示按查询次数的智察分计费明细' },
      { label: '查得计费明细页', key: 'sc:zhicha-bill-hit', desc: '展示按查得次数的智察分计费明细' },
      { label: '账单管理页', key: 'sc:zhicha-bill', desc: '展示智察分月度账单、充值记录、余额查询' },
    ],
  },
  {
    group: '智信分',
    items: [
      { label: '评分查询列表页', key: 'sc:zhixin-query', desc: '展示所有智信分查询记录，支持按评分区间(300-900)、查询时间筛选' },
      { label: '批量查询页', key: 'sc:zhixin-batch', desc: '支持批量上传文件进行智信分批量查询' },
      { label: '评分分布监控页', key: 'sc:zhixin-dist', desc: '展示智信分的整体分布变化、异常波动预警' },
      { label: '模型效果评估页', key: 'sc:zhixin-eval', desc: '展示智信分的 KS 值、AUC 值、lift 曲线等模型效果指标' },
      { label: '模型调优建议页', key: 'sc:zhixin-tune', desc: '基于监控数据给出智信分模型调优建议' },
      { label: '查询计费明细页', key: 'sc:zhixin-bill-query', desc: '展示按查询次数的智信分计费明细' },
      { label: '查得计费明细页', key: 'sc:zhixin-bill-hit', desc: '展示按查得次数的智信分计费明细' },
      { label: '账单管理页', key: 'sc:zhixin-bill', desc: '展示智信分月度账单、充值记录、余额查询' },
    ],
  },
  {
    group: '智融分',
    items: [
      { label: '评分查询列表页', key: 'sc:zhirong-query', desc: '展示所有智融分查询记录，支持按场景(违约/授信/借贷兴趣)筛选' },
      { label: '批量查询页', key: 'sc:zhirong-batch', desc: '支持批量上传文件进行智融分批量查询' },
      { label: '评分分布监控页', key: 'sc:zhirong-dist', desc: '展示智融分的整体分布变化、异常波动预警' },
      { label: '模型效果评估页', key: 'sc:zhirong-eval', desc: '展示智融分的 KS 值、AUC 值、lift 曲线等模型效果指标' },
      { label: '模型调优建议页', key: 'sc:zhirong-tune', desc: '基于监控数据给出智融分模型调优建议' },
      { label: '违约风险场景配置页', key: 'sc:zhirong-sc-default', desc: '配置违约风险审核场景的评分规则' },
      { label: '授信转化场景配置页', key: 'sc:zhirong-sc-credit', desc: '配置授信申请转化场景的评分规则' },
      { label: '借贷兴趣场景配置页', key: 'sc:zhirong-sc-interest', desc: '配置借贷兴趣场景的评分规则' },
      { label: '查询计费明细页', key: 'sc:zhirong-bill-query', desc: '展示按查询次数的智融分计费明细' },
      { label: '查得计费明细页', key: 'sc:zhirong-bill-hit', desc: '展示按查得次数的智融分计费明细' },
      { label: '账单管理页', key: 'sc:zhirong-bill', desc: '展示智融分月度账单、充值记录、余额查询' },
    ],
  },
]

/* ============================================================
 * 三、企业风控（规划中）
 * ========================================================== */
export const entMenu: MenuGroup[] = [
  { group: '工作台', items: [{ label: '概览看板', key: 'ep:overview', desc: '展示企业风控核心指标的实时概览看板' }] },
  {
    group: '企业信息核验',
    items: [
      { label: '企业信息核验列表页', key: 'ep:ent-verify', desc: '展示企业客户的核验记录' },
      { label: '企业核验规则配置页', key: 'ep:ent-verify-config', desc: '配置企业核验的规则、阈值' },
    ],
  },
  {
    group: '企业信用评估',
    items: [
      { label: '企业信用评分列表页', key: 'ep:ent-credit', desc: '展示企业客户的信用评分记录' },
      { label: '企业评分模型配置页', key: 'ep:ent-credit-config', desc: '配置企业信用评分的权重、规则' },
    ],
  },
  {
    group: '企业关联图谱',
    items: [
      { label: '企业关联图谱列表页', key: 'ep:ent-graph', desc: '展示企业关联关系分析记录' },
      { label: '企业团伙检测页', key: 'ep:ent-graph-gang', desc: '识别企业欺诈团伙、空壳公司集群' },
    ],
  },
  {
    group: '企业贷中监控',
    items: [
      { label: '企业监控任务列表页', key: 'ep:ent-mid-task', desc: '展示企业客户的监控任务' },
      { label: '企业预警列表页', key: 'ep:ent-mid-alert', desc: '展示企业经营异常、司法风险、舆情风险等预警' },
      { label: '企业风险看板页', key: 'ep:ent-mid-board', desc: '展示企业客群的实时风险分布' },
    ],
  },
]

/* ============================================================
 * 四、数字营销
 * ========================================================== */
export const dmMenu: MenuGroup[] = [
  { group: '工作台', items: [{ label: '概览看板', key: 'dm:overview', desc: '展示数字营销核心指标的实时概览看板' }] },
  {
    group: '猎客雷达',
    items: [
      { label: '响应分查询列表页', key: 'dm:radar-query', desc: '展示所有猎客雷达查询记录，支持按业务场景、响应分区间筛选' },
      { label: '批量查询页', key: 'dm:radar-batch', desc: '支持 WEB 页面批量上传、API 批量查询' },
      { label: '标准模型列表页', key: 'dm:radar-model', desc: '展示系统预置的标准响应模型' },
      { label: '定制模型管理页', key: 'dm:radar-model-custom', desc: '管理客户定制的响应模型（注册未申请、授信未支用、结清未复贷等）' },
      { label: '模型效果评估页', key: 'dm:radar-eval', desc: '展示各模型的响应率、转化率、lift 曲线' },
      { label: '策略标签列表页', key: 'dm:radar-tag', desc: '展示系统生成的策略标签（高响应、中响应、低响应、高风险、低风险）' },
      { label: '标签规则配置页', key: 'dm:radar-tag-config', desc: '配置策略标签的生成规则、阈值' },
      { label: '查询计费明细页', key: 'dm:radar-bill-query', desc: '展示按查询次数的猎客雷达计费明细' },
      { label: '查得计费明细页', key: 'dm:radar-bill-hit', desc: '展示按查得次数的猎客雷达计费明细' },
      { label: '账单管理页', key: 'dm:radar-bill', desc: '展示猎客雷达月度账单、充值记录' },
    ],
  },
  {
    group: '猎客信使',
    items: [
      { label: '触达任务列表页', key: 'dm:herald-task', desc: '展示所有触达任务，支持按触达方式、任务状态筛选' },
      { label: '触达任务创建页', key: 'dm:herald-task-create', desc: '创建触达任务，选择目标客群、触达方式、发送时间' },
      { label: '客群筛选页', key: 'dm:herald-crowd', desc: '基于模型和标签组合筛选目标客群' },
      { label: '客群预览页', key: 'dm:herald-crowd-preview', desc: '预览筛选后的客群规模、特征分布' },
      { label: '客群保存页', key: 'dm:herald-crowd-save', desc: '保存常用客群配置，支持复用' },
      { label: '短信通道配置页', key: 'dm:herald-sms', desc: '配置短信通道、签名、模板、发送策略' },
      { label: 'AI外呼配置页', key: 'dm:herald-aicall', desc: '配置 AI 外呼话术、语音、挂机短信、拨打策略' },
      { label: '投诉黑名单管理页', key: 'dm:herald-complaint', desc: '管理投诉黑名单、号码归属地剔除规则' },
      { label: '触达效果总览页', key: 'dm:herald-effect', desc: '展示触达成功率、转化率、ROI 等指标' },
      { label: '转化漏斗分析页', key: 'dm:herald-funnel', desc: '展示从触达到转化的完整漏斗' },
      { label: 'A/B测试分析页', key: 'dm:herald-ab', desc: '对比不同话术/模板/时段的触达效果' },
    ],
  },
  {
    group: 'RTA服务',
    items: [
      { label: 'RTA请求列表页', key: 'dm:rta-query', desc: '展示所有 RTA 请求记录，支持按媒体渠道、业务场景、响应分筛选' },
      { label: '媒体渠道配置页', key: 'dm:rta-media', desc: '配置广点通、巨量引擎等媒体的对接参数' },
      { label: '媒体直联测试页', key: 'dm:rta-media-test', desc: '测试媒体直联的连通性、响应速度' },
      { label: '高并发配置页', key: 'dm:rta-concurrency', desc: '配置 RTA 服务的并发限制、熔断策略' },
      { label: '标准模型列表页', key: 'dm:rta-model', desc: '展示系统预置的标准响应模型' },
      { label: '定制模型管理页', key: 'dm:rta-model-custom', desc: '管理客户定制的 RTA 模型（点击未注册、注册未申请、申请未授信等）' },
      { label: '模型效果评估页', key: 'dm:rta-eval', desc: '展示各模型的响应率、转化率、lift 曲线' },
      { label: '查询计费明细页', key: 'dm:rta-bill-query', desc: '展示按查询次数的 RTA 计费明细' },
      { label: '包年计费管理页', key: 'dm:rta-bill-year', desc: '管理 RTA 包年计费合同、到期提醒' },
      { label: '账单管理页', key: 'dm:rta-bill', desc: '展示 RTA 月度账单、充值记录' },
      { label: '投放策略配置页', key: 'dm:rta-strategy', desc: '配置不同响应分区间的投放策略（投放/不投放/溢价）' },
      { label: '策略效果分析页', key: 'dm:rta-strategy-effect', desc: '分析不同投放策略的转化效果、成本' },
      { label: '策略优化建议页', key: 'dm:rta-strategy-tune', desc: '基于数据给出 RTA 投放策略优化建议' },
    ],
  },
]

/* ============================================================
 * 五、公共模块（跨子系统共用）
 * ========================================================== */
export const cmMenu: MenuGroup[] = [
  { group: '工作台', items: [{ label: '概览看板', key: 'cm:overview', desc: '展示公共模块的整体运行概览' }] },
  {
    group: '用户中心',
    items: [
      { label: '用户列表页', key: 'cm:user-list', desc: '管理系统用户，支持按角色、部门筛选' },
      { label: '角色权限配置页', key: 'cm:user-role', desc: '配置角色（系统管理员、风控专员、风控主管、数据分析师等）的权限' },
      { label: '个人中心页', key: 'cm:user-profile', desc: '展示个人信息、修改密码、操作日志' },
    ],
  },
  {
    group: '系统配置',
    items: [
      { label: '数据源配置页', key: 'cm:sys-datasource', desc: '配置外部数据源的接入参数（公安库、运营商、征信等）' },
      { label: '规则引擎配置页', key: 'cm:sys-rule-engine', desc: '配置决策引擎的规则、策略、流程' },
      { label: '通知配置页', key: 'cm:sys-notify', desc: '配置邮件、短信、钉钉等通知渠道' },
      { label: '日志审计页', key: 'cm:sys-audit', desc: '展示系统操作日志、安全审计日志' },
    ],
  },
  {
    group: '数据看板',
    items: [
      { label: '业务总览看板', key: 'cm:dash-biz', desc: '展示各子系统的核心业务指标' },
      { label: '实时监控看板', key: 'cm:dash-realtime', desc: '展示系统实时 QPS、响应耗时、错误率' },
      { label: '数据报表页', key: 'cm:dash-report', desc: '支持自定义报表、定时发送、导出下载' },
    ],
  },
  {
    group: '帮助中心',
    items: [
      { label: '产品文档页', key: 'cm:help-doc', desc: '展示各产品的使用文档、API 文档' },
      { label: '常见问题页', key: 'cm:help-faq', desc: '展示 FAQ、操作指南' },
      { label: '在线客服页', key: 'cm:help-service', desc: '接入在线客服系统' },
    ],
  },
]

/* ============================================================
 * 子系统元信息 & 菜单汇总
 * ========================================================== */
export const subNames: Record<string, string> = {
  cr: '零售信贷风控',
  sc: '评分产品',
  ep: '企业风控',
  dm: '数字营销',
  cm: '公共模块',
}

export const MENU_BY_SUB: Record<string, MenuGroup[]> = {
  cr: creditRiskMenu,
  sc: scoringMenu,
  ep: entMenu,
  dm: dmMenu,
  cm: cmMenu,
}

// 详情页（不挂左侧菜单，但需可路由到「功能规划中」占位）
export interface PlannedExtra {
  key: string
  sub: string
  group: string
  label: string
  desc: string
}
export const plannedExtras: PlannedExtra[] = [
  { key: 'cr:pre-report-detail', sub: 'cr', group: '决策报告', label: '决策报告详情页', desc: '整合信息核验+信用风控+欺诈识别的综合报告，输出最终决策建议' },
  { key: 'sc:zhicha-detail', sub: 'sc', group: '智察分', label: '智察分评分详情页', desc: '展示单次查询的智察分结果、评分分布、风险标签' },
  { key: 'sc:zhixin-detail', sub: 'sc', group: '智信分', label: '智信分评分详情页', desc: '展示单次查询的智信分结果、风险等级、违约概率预测' },
  { key: 'sc:zhirong-detail', sub: 'sc', group: '智融分', label: '智融分评分详情页', desc: '展示单次查询的智融分结果、场景评分、价值标签' },
  { key: 'ep:ent-verify-detail', sub: 'ep', group: '企业信息核验', label: '企业核验报告详情页', desc: '展示企业工商、司法、经营、舆情等核验结果' },
  { key: 'ep:ent-credit-detail', sub: 'ep', group: '企业信用评估', label: '企业信用报告详情页', desc: '展示企业的信用评分、风险维度、授信建议' },
  { key: 'ep:ent-graph-detail', sub: 'ep', group: '企业关联图谱', label: '企业关联图谱详情页', desc: '展示企业间的股权关系、担保关系、关联交易等' },
  { key: 'dm:herald-task-detail', sub: 'dm', group: '猎客信使', label: '触达任务详情页', desc: '展示任务的执行进度、触达明细、转化效果' },
  { key: 'dm:rta-detail', sub: 'dm', group: 'RTA服务', label: 'RTA请求详情页', desc: '展示单次 RTA 请求的响应分、策略建议、响应耗时' },
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
