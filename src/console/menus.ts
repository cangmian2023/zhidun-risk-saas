import type { Column, Row } from '../components/ui'
import type { ReactNode } from 'react'

/* ============ 门户子系统 ============ */
export const portalSubsystems = [
  { key: 'cr', name: '零售信贷风控', desc: '覆盖消费金融、现金贷、小微经营贷等业务的贷前审核与贷中监控。', color: 'from-rose-500 to-orange-500', open: true },
  { key: 'sc', name: '评分产品', desc: '智察分、智信分、智融分三类评分模型产品。', color: 'from-violet-500 to-fuchsia-500', open: true },
  { key: 'ep', name: '企业风控', desc: '面向企业客户的贷前核验、信用评估与关联图谱。', color: 'from-sky-500 to-cyan-500', open: false },
  { key: 'dm', name: '数字营销', desc: '猎客雷达、猎客信使、RTA 服务等营销获客工具。', color: 'from-emerald-500 to-teal-500', open: false },
  { key: 'cm', name: '管理中心', desc: '跨子系统共用的用户、配置、看板与帮助能力。', color: 'from-slate-500 to-slate-700', open: true },
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
  section?: string // 可选分区标题（用于左侧菜单分组标签）
  items: MenuItem[]
}

/* ============================================================
 * 一、零售信贷风控
 * ========================================================== */
export const creditRiskMenu: MenuGroup[] = [
  { group: '概览看板', section: '工作台', items: [{ label: '概览看板', key: 'cr:overview', desc: '展示零售信贷风控核心指标的实时概览看板', keep: true }] },
  // 贷前审核（业务作业 · 对外）
  { group: '进件审核', section: '贷前审核', items: [{ label: '进件审核', key: 'cr:pre-report', desc: '模板驱动的进件审核报告（整合三大报告，数据从本地 JSON 读取）' }] },
  { group: '信息核验', section: '贷前审核', items: [{ label: '信息核验', key: 'cr:pre-verify', desc: '模板驱动的信息核验报告（数据从本地 JSON 读取）' }] },
  { group: '信用风控', section: '贷前审核', items: [{ label: '信用风控', key: 'cr:credit-kimi', desc: '模板驱动的信用风控报告（数据从本地 JSON 读取）' }] },
  { group: '欺诈识别', section: '贷前审核', items: [{ label: '欺诈识别', key: 'cr:pre-fraud', desc: '模板驱动的欺诈识别报告（数据从本地 JSON 读取）' }] },
  // 贷中监控（业务作业 · 对外）—— v3 规划：看板由监控页面配置驱动，工作台/工单/单客视图为作业页
  {
    group: '监控看板',
    section: '贷中监控',
    items: [
      { label: '监控大盘', key: 'cr:mid-overview', keep: true, desc: '全局总览：预警量、红黄灯分布、逾期率、处置效率（页面来自监控页面配置）' },
      { label: '红黄灯预警', key: 'cr:mid-alert', keep: true, desc: '红黄灯预警明细与等级分布（页面来自监控页面配置）' },
      { label: '客群风险', key: 'cr:mid-crowd', keep: true, desc: '在贷余额、逾期率与行为分趋势（页面来自监控页面配置）' },
    ],
  },
  {
    group: '预警处置',
    section: '贷中监控',
    items: [
      { label: '预警工作台', key: 'cr:mid-alert-workbench', keep: true, desc: '红黄灯预警任务队列：逐条查看、核实、发起处置' },
      { label: '处置工单', key: 'cr:mid-dispose-workbench', keep: true, desc: '工单跟进、处置回填、审批流转' },
      { label: '单客视图', key: 'cr:mid-cust-detail', keep: true, desc: '个体详情：规则还原、画像、评分历史、处置' },
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
      { label: '评分查询', key: 'sc:zhicha-query', desc: '展示所有智察分查询记录，支持按评分区间、查询时间筛选' },
      { label: '批量', key: 'sc:zhicha-batch', desc: '支持批量上传文件进行智察分批量查询' },
      { label: '评分分布', key: 'sc:zhicha-dist', desc: '展示智察分的整体分布变化、异常波动预警' },
      { label: '模型效果评估', key: 'sc:zhicha-eval', desc: '展示智察分的 KS 值、AUC 值、lift 曲线等模型效果指标' },
      { label: '模型调优', key: 'sc:zhicha-tune', desc: '基于监控数据给出智察分模型调优建议' },
      { label: '查询计费', key: 'sc:zhicha-bill-query', desc: '展示按查询次数的智察分计费明细' },
      { label: '查得计费', key: 'sc:zhicha-bill-hit', desc: '展示按查得次数的智察分计费明细' },
      { label: '账单', key: 'sc:zhicha-bill', desc: '展示智察分月度账单、充值记录、余额查询' },
    ],
  },
  {
    group: '智信分',
    items: [
      { label: '评分查询', key: 'sc:zhixin-query', desc: '展示所有智信分查询记录，支持按评分区间(300-900)、查询时间筛选' },
      { label: '批量', key: 'sc:zhixin-batch', desc: '支持批量上传文件进行智信分批量查询' },
      { label: '评分分布', key: 'sc:zhixin-dist', desc: '展示智信分的整体分布变化、异常波动预警' },
      { label: '模型效果评估', key: 'sc:zhixin-eval', desc: '展示智信分的 KS 值、AUC 值、lift 曲线等模型效果指标' },
      { label: '模型调优', key: 'sc:zhixin-tune', desc: '基于监控数据给出智信分模型调优建议' },
      { label: '查询计费', key: 'sc:zhixin-bill-query', desc: '展示按查询次数的智信分计费明细' },
      { label: '查得计费', key: 'sc:zhixin-bill-hit', desc: '展示按查得次数的智信分计费明细' },
      { label: '账单', key: 'sc:zhixin-bill', desc: '展示智信分月度账单、充值记录、余额查询' },
    ],
  },
  {
    group: '智融分',
    items: [
      { label: '评分查询', key: 'sc:zhirong-query', desc: '展示所有智融分查询记录，支持按场景(违约/授信/借贷兴趣)筛选' },
      { label: '批量', key: 'sc:zhirong-batch', desc: '支持批量上传文件进行智融分批量查询' },
      { label: '评分分布', key: 'sc:zhirong-dist', desc: '展示智融分的整体分布变化、异常波动预警' },
      { label: '模型效果评估', key: 'sc:zhirong-eval', desc: '展示智融分的 KS 值、AUC 值、lift 曲线等模型效果指标' },
      { label: '模型调优', key: 'sc:zhirong-tune', desc: '基于监控数据给出智融分模型调优建议' },
      { label: '违约风险', key: 'sc:zhirong-sc-default', desc: '配置违约风险审核场景的评分规则' },
      { label: '授信转化', key: 'sc:zhirong-sc-credit', desc: '配置授信申请转化场景的评分规则' },
      { label: '借贷兴趣', key: 'sc:zhirong-sc-interest', desc: '配置借贷兴趣场景的评分规则' },
      { label: '查询计费', key: 'sc:zhirong-bill-query', desc: '展示按查询次数的智融分计费明细' },
      { label: '查得计费', key: 'sc:zhirong-bill-hit', desc: '展示按查得次数的智融分计费明细' },
      { label: '账单', key: 'sc:zhirong-bill', desc: '展示智融分月度账单、充值记录、余额查询' },
    ],
  },
]

/* ============================================================
 * 三、企业风控（规划中）
 * ========================================================== */
export const entMenu: MenuGroup[] = [
  { group: '概览看板', section: '工作台', items: [{ label: '概览看板', key: 'ep:overview', desc: '展示企业风控核心指标的实时概览看板' }] },
  {
    group: '企业信息核验',
    items: [
      { label: '企业信息核验', key: 'ep:ent-verify', desc: '展示企业客户的核验记录' },
      { label: '企业核验规则', key: 'ep:ent-verify-config', desc: '配置企业核验的规则、阈值' },
    ],
  },
  {
    group: '企业信用评估',
    items: [
      { label: '企业信用评分', key: 'ep:ent-credit', desc: '展示企业客户的信用评分记录' },
      { label: '企业评分模型', key: 'ep:ent-credit-config', desc: '配置企业信用评分的权重、规则' },
    ],
  },
  {
    group: '企业关联图谱',
    items: [
      { label: '企业关联图谱', key: 'ep:ent-graph', desc: '展示企业关联关系分析记录' },
      { label: '企业团伙', key: 'ep:ent-graph-gang', desc: '识别企业欺诈团伙、空壳公司集群' },
    ],
  },
  {
    group: '企业贷中监控',
    items: [
      { label: '企业监控任务', key: 'ep:ent-mid-task', desc: '展示企业客户的监控任务' },
      { label: '企业预警', key: 'ep:ent-mid-alert', desc: '展示企业经营异常、司法风险、舆情风险等预警' },
      { label: '企业风险', key: 'ep:ent-mid-board', desc: '展示企业客群的实时风险分布' },
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
      { label: '响应分查询', key: 'dm:radar-query', desc: '展示所有猎客雷达查询记录，支持按业务场景、响应分区间筛选' },
      { label: '批量', key: 'dm:radar-batch', desc: '支持 WEB 页面批量上传、API 批量查询' },
      { label: '标准模型', key: 'dm:radar-model', desc: '展示系统预置的标准响应模型' },
      { label: '定制模型', key: 'dm:radar-model-custom', desc: '管理客户定制的响应模型（注册未申请、授信未支用、结清未复贷等）' },
      { label: '模型效果评估', key: 'dm:radar-eval', desc: '展示各模型的响应率、转化率、lift 曲线' },
      { label: '策略标签', key: 'dm:radar-tag', desc: '展示系统生成的策略标签（高响应、中响应、低响应、高风险、低风险）' },
      { label: '标签规则', key: 'dm:radar-tag-config', desc: '配置策略标签的生成规则、阈值' },
      { label: '查询计费', key: 'dm:radar-bill-query', desc: '展示按查询次数的猎客雷达计费明细' },
      { label: '查得计费', key: 'dm:radar-bill-hit', desc: '展示按查得次数的猎客雷达计费明细' },
      { label: '账单', key: 'dm:radar-bill', desc: '展示猎客雷达月度账单、充值记录' },
    ],
  },
  {
    group: '猎客信使',
    items: [
      { label: '触达任务', key: 'dm:herald-task', desc: '展示所有触达任务，支持按触达方式、任务状态筛选' },
      { label: '触达任务管理', key: 'dm:herald-task-create', desc: '创建触达任务，选择目标客群、触达方式、发送时间' },
      { label: '客群', key: 'dm:herald-crowd', desc: '基于模型和标签组合筛选目标客群' },
      { label: '客群', key: 'dm:herald-crowd-preview', desc: '预览筛选后的客群规模、特征分布' },
      { label: '客群保存页', key: 'dm:herald-crowd-save', desc: '保存常用客群配置，支持复用' },
      { label: '短信通道', key: 'dm:herald-sms', desc: '配置短信通道、签名、模板、发送策略' },
      { label: 'AI外呼', key: 'dm:herald-aicall', desc: '配置 AI 外呼话术、语音、挂机短信、拨打策略' },
      { label: '投诉黑名单', key: 'dm:herald-complaint', desc: '管理投诉黑名单、号码归属地剔除规则' },
      { label: '触达效果', key: 'dm:herald-effect', desc: '展示触达成功率、转化率、ROI 等指标' },
      { label: '转化漏斗', key: 'dm:herald-funnel', desc: '展示从触达到转化的完整漏斗' },
      { label: 'A/B测试', key: 'dm:herald-ab', desc: '对比不同话术/模板/时段的触达效果' },
    ],
  },
  {
    group: 'RTA服务',
    items: [
      { label: 'RTA请求', key: 'dm:rta-query', desc: '展示所有 RTA 请求记录，支持按媒体渠道、业务场景、响应分筛选' },
      { label: '媒体渠道', key: 'dm:rta-media', desc: '配置广点通、巨量引擎等媒体的对接参数' },
      { label: '媒体直联测试', key: 'dm:rta-media-test', desc: '测试媒体直联的连通性、响应速度' },
      { label: '高并发', key: 'dm:rta-concurrency', desc: '配置 RTA 服务的并发限制、熔断策略' },
      { label: '标准模型', key: 'dm:rta-model', desc: '展示系统预置的标准响应模型' },
      { label: '定制模型', key: 'dm:rta-model-custom', desc: '管理客户定制的 RTA 模型（点击未注册、注册未申请、申请未授信等）' },
      { label: '模型效果评估', key: 'dm:rta-eval', desc: '展示各模型的响应率、转化率、lift 曲线' },
      { label: '查询计费', key: 'dm:rta-bill-query', desc: '展示按查询次数的 RTA 计费明细' },
      { label: '包年计费', key: 'dm:rta-bill-year', desc: '管理 RTA 包年计费合同、到期提醒' },
      { label: '账单', key: 'dm:rta-bill', desc: '展示 RTA 月度账单、充值记录' },
      { label: '投放策略', key: 'dm:rta-strategy', desc: '配置不同响应分区间的投放策略（投放/不投放/溢价）' },
      { label: '策略效果', key: 'dm:rta-strategy-effect', desc: '分析不同投放策略的转化效果、成本' },
      { label: '策略优化', key: 'dm:rta-strategy-tune', desc: '基于数据给出 RTA 投放策略优化建议' },
    ],
  },
]

/* ============================================================
 * 五、管理中心（跨子系统共用，原公共模块）
 * ========================================================== */
export const cmMenu: MenuGroup[] = [
  {
    group: '行为分析',
    items: [
      { label: '事件分析', key: 'cm:event-analysis', keep: true, desc: '按事件指标、全局筛选与分组维度查询行为数据，支持折线/柱状/堆叠/环形图与明细表导出' },
    ],
  },
  {
    group: '元数据管理',
    items: [
      { label: '元事件', key: 'cm:meta-event', keep: true, desc: '管理已采集事件的元定义：显示名、显示状态、是否接收、埋点平台与触发时机' },
      { label: '事件属性', key: 'cm:meta-event-prop', keep: true, desc: '管理事件上报时携带的属性字段：数据类型、字典、显示状态与关联事件' },
      { label: '用户属性', key: 'cm:meta-user-prop', keep: true, desc: '管理用户维度的属性字段：数据类型、字典、显示状态与取值说明' },
      { label: '维度表', key: 'cm:meta-dim-table', keep: true, desc: '管理用于关联分析的维度表及其字段结构' },
      { label: '物品属性', key: 'cm:meta-item-prop', keep: true, desc: '管理物品维度的属性字段：物品类型、数据类型与显示状态' },
      { label: '虚拟属性', key: 'cm:meta-virtual-prop', keep: true, desc: '基于 SQL 表达式派生的属性，查询时实时计算' },
      { label: '虚拟事件', key: 'cm:meta-virtual-event', keep: true, desc: '组合多个事件与筛选条件形成的复合事件' },
      { label: '可视化全埋点事件', key: 'cm:meta-auto-track', keep: true, desc: '通过可视化圈选生成的埋点事件及其匹配规则' },
    ],
  },
  {
    group: '规则集合',
    items: [
      { label: '核验规则', key: 'cm:pre-verify-config', keep: true },
      { label: '反欺诈规则库', key: 'cm:fraud-rules', desc: '管理反欺诈规则，配置规则权重、命中条件、处置建议' },
      { label: '黑名单管理', key: 'cm:fraud-blacklist', desc: '管理手机号、设备指纹、身份证号、银行卡黑名单' },
      { label: '团伙库管理', key: 'cm:fraud-gang', desc: '管理已知欺诈团伙信息、团伙成员、团伙特征' },
    ],
  },
  { group: '报告模板', items: [{ label: '报告模板', key: 'cm:report-template', desc: '统一管理信息核验 / 信用风控 / 欺诈识别 / 决策报告四类报告的展示模板、评分等级、结论与导出样式' }] },
  { group: '数据源管理', items: [{ label: '数据源管理', key: 'cm:mid-data-source', keep: true, desc: '对接多种数据源，为指标库提供字段与样例数据' }] },
  { group: '指标库', items: [{ label: '指标库', key: 'cm:mid-metric', keep: true, desc: '定义可复用指标（基础 + 派生公式），被监控策略、看板组件引用' }] },
  { group: '策略配置', items: [
    { label: '监控任务', key: 'cm:mid-strategy', keep: true, desc: '配置监控任务（对谁、何时、算哪些指标）；预警规则在任务详情中配置' },
    { label: '处置策略', key: 'cm:mid-dispose-strategy', keep: true, desc: '配置自动处置策略（如自动降额、自动冻结），按预警等级路由' },
  ] },
  { group: '页面配置', items: [{ label: '页面配置', key: 'cm:mid-dashboard-config', keep: true, desc: '配置监控看板页面与可视化组件，保存后由监控看板渲染' }] },
  { group: '业务流程', items: [{ label: '业务流程配置', key: 'cm:biz-flow', keep: true, desc: '按业务域配置审核操作流程（画布编辑节点与流转），实时生效于对应审核页操作按钮' }] },
]
/* ============================================================
 * 子系统元信息 & 菜单汇总
 * ========================================================== */
export const subNames: Record<string, string> = {
  cr: '零售信贷风控',
  sc: '评分产品',
  ep: '企业风控',
  dm: '数字营销',
  cm: '管理中心',
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
  { key: 'cr:pre-report-detail', sub: 'cr', group: '进件审核', label: '进件审核详情页', desc: '整合信息核验+信用风控+欺诈识别的综合报告，输出最终决策建议' },
  { key: 'sc:zhicha-detail', sub: 'sc', group: '智察分', label: '智察分评分详情页', desc: '展示单次查询的智察分结果、评分分布、风险标签' },
  { key: 'sc:zhixin-detail', sub: 'sc', group: '智信分', label: '智信分评分详情页', desc: '展示单次查询的智信分结果、风险等级、违约概率预测' },
  { key: 'sc:zhirong-detail', sub: 'sc', group: '智融分', label: '智融分评分详情页', desc: '展示单次查询的智融分结果、场景评分、价值标签' },
  { key: 'ep:ent-verify-detail', sub: 'ep', group: '企业信息核验', label: '企业核验报告详情页', desc: '展示企业工商、司法、经营、舆情等核验结果' },
  { key: 'ep:ent-credit-detail', sub: 'ep', group: '企业信用评估', label: '企业信用报告详情页', desc: '展示企业的信用评分、风险维度、授信建议' },
  { key: 'ep:ent-graph-detail', sub: 'ep', group: '企业关联图谱', label: '企业关联图谱详情页', desc: '展示企业间的股权关系、担保关系、关联交易等' },
  { key: 'dm:herald-task-detail', sub: 'dm', group: '猎客信使', label: '触达任务详情页', desc: '展示任务的执行进度、触达明细、转化效果' },
  { key: 'dm:rta-detail', sub: 'dm', group: 'RTA服务', label: 'RTA请求详情页', desc: '展示单次 RTA 请求的响应分、策略建议、响应耗时' },
  { key: 'cm:mid-data-source-detail', sub: 'cm', group: '数据源管理', label: '数据源详情页', desc: '查看数据源字段口径、样例数据与被指标库引用情况' },
  { key: 'cm:mid-metric-detail', sub: 'cm', group: '指标库', label: '指标详情页', desc: '查看指标口径、实时计算预览与引用关系' },
  { key: 'cm:mid-strategy-detail', sub: 'cm', group: '策略配置', label: '策略详情页', desc: '查看监控任务/预警规则/处置策略配置与联动预警' },
  { key: 'cm:mid-dashboard-detail', sub: 'cm', group: '页面配置', label: '页面配置详情页', desc: '查看看板页面组件配置与实时渲染入口' },
  { key: 'cr:mid-alert-detail', sub: 'cr', group: '预警处置', label: '预警详情页', desc: '查看预警信息、建议处置策略并推进状态流转' },
  { key: 'cr:mid-dispose-detail', sub: 'cr', group: '处置闭环', label: '处置工单详情页', desc: '查看工单信息、回填处置与操作日志' },
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
