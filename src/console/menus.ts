import type { Column, Row } from '../components/ui'
import type { ReactNode } from 'react'

/* ============ 门户子系统 ============ */
export const portalSubsystems = [
  { key: 'cr', name: '零售信贷风控', desc: '覆盖消费金融、现金贷、小微经营贷等业务的贷前审核与贷中监控。', color: 'from-rose-500 to-orange-500', open: true },
  { key: 'sc', name: '评分产品', desc: '智察分、智信分、智融分三类评分模型产品。', color: 'from-violet-500 to-fuchsia-500', open: true },
  { key: 'ep', name: '企业风控', desc: '面向企业客户的贷前核验、信用评估与关联图谱。', color: 'from-sky-500 to-cyan-500', open: false },
  { key: 'dm', name: '数字营销', desc: '猎客雷达、猎客信使、RTA 服务等营销获客工具。', color: 'from-emerald-500 to-teal-500', open: false },
  { key: 'dg', name: '数据治理', desc: '数据底座与元数据治理：元事件、属性、维度表、虚拟属性/事件与埋点定义。', color: 'from-indigo-500 to-blue-500', open: true },
  { key: 'zz', name: '催贷管理', desc: '智能催收（催贷）子系统：案件资产全生命周期、合规触达、委外监管、AI 质检、协商回款与催收 BI 看板。', color: 'from-amber-500 to-red-500', open: true },
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
  // 贷中监控（业务作业 · 对外）—— v3 升级：取消「监控看板 / 预警处置」两个子分组，6 个页面扁平直列；
  // 处置工单、单客视图下线（能力并入预警工作台 / 客户360；单客视图改由首页搜索与预警详情直达）
  { group: '预警工作台', section: '贷中监控', items: [{ label: '预警工作台', key: 'cr:mid-alert-workbench', keep: true, desc: '红黄灯预警任务队列：逐条查看、核实、发起处置（升级版）' }] },
  { group: '贷中监控大盘', section: '贷中监控', items: [{ label: '贷中监控大盘', key: 'cr:mid-td1', desc: '红黄灯综合预警信号总览：预警总量 / 红黄灯结构 / 场景分布 / 规则还原' }] },
  { group: '风险监测', section: '贷中监控', items: [{ label: '风险监测', key: 'cr:mid-td2', desc: '分场景分产品监测（风险视角），支持按产品线筛选' }] },
  { group: '红黄灯预警中心', section: '贷中监控', items: [{ label: '红黄灯预警中心', key: 'cr:mid-td3', desc: '红黄灯预警信号作业台：按等级筛选 / 命中规则 TOP / 规则明细还原' }] },
  { group: '持续性周期监测', section: '贷中监控', items: [{ label: '持续性周期监测', key: 'cr:mid-td4', desc: '持续性周期监测评估：行为分 / 逾期 / 新增贷款按月趋势' }] },
  { group: '存量客群运营', section: '贷中监控', items: [{ label: '存量客群运营', key: 'cr:mid-td5', desc: '存量客群运营场景：授信 / 余额 / 逾期 + 产品结构 + 贷款台账' }] },
  // 单客 360° 画像（v3 新增）：企业档案（ep:qiye-profile）的单客版本，功能数据分离独立实现
  { group: '单客视图', section: '贷中监控', items: [
    { label: '单客详情', key: 'cr:mid-single-cust', keep: true, desc: '零售信贷单客 360° 画像：身份与职业收入、授信额度、负债逾期、行为画像、风险预警与联系人关系' },
    { label: '单客详情2（高风险）', key: 'cr:mid-single-cust-2', desc: '同一单客画像页复用不同客户数据（CUST-100891）：预警密集、各模块均带风险标记的样例客户' },
  ] },
]

/* ============================================================
 * 二、评分产品
 * ========================================================== */
/* ============================================================
 * 二、评分产品（v3 新 IA：按用户工作流重组，不再按模型分拆）
 *   工作台 / 在线评分 / 客户洞察 / 数据分析 / 模型管理 / 策略配置
 *   复用：评分总览(ScoreModule)、预警处置(MidAlertWorkbench)、
 *        客户详情(CustProfile)、处置流程(FlowCanvasEditor)
 * ========================================================== */
export const scoringMenu: MenuGroup[] = [
  {
    group: '工作台',
    section: '工作台',
    items: [
      { label: '评分总览', key: 'sc:overview', keep: true, desc: '三产品评分总览与对象评分档案：并排展示智察分/智信分/智融分，支持单客分数检索与批量评分入口' },
      { label: '预警处置', key: 'sc:alert-workbench', keep: true, desc: '复用零售信贷预警工作台：红黄灯预警任务队列，逐条核实、发起处置' },
    ],
  },
  {
    group: '在线评分',
    section: '在线评分',
    items: [
      { label: '评分记录', key: 'sc:score-records', desc: '三产品评分流水记录，支持单客分数检索与批量评分导入' },
    ],
  },
  {
    group: '客户洞察',
    section: '客户洞察',
    items: [
      { label: '客群分组', key: 'sc:crowd-groups', desc: '按风险/价值/行为等维度定义客群分组，支撑分层经营' },
      { label: '客户列表', key: 'sc:customer-list', desc: '客群分组下的客户清单，点击进入客户详情' },
      { label: '客户详情', key: 'sc:customer-detail', keep: true, desc: '单客 360° 画像（复用零售信贷单客视图）：身份、授信、负债、行为、风险预警与关系' },
    ],
  },
  {
    group: '数据分析',
    section: '数据分析',
    items: [
      { label: '评分分布', key: 'sc:score-dist', desc: '各产品评分分段分布、客群占比与分布漂移观测' },
      { label: '命中分析', key: 'sc:hit-analysis', desc: '规则命中与名单命中分析：命中 TOP 规则、命中客群特征与趋势' },
    ],
  },
  {
    group: '模型管理',
    section: '模型管理',
    items: [
      { label: '模型管理', key: 'sc:model-manage', desc: '智察分/智信分/智融分及其版本的管理：状态、训练信息、发布' },
      { label: '模型监控', key: 'sc:model-monitor', desc: '模型稳定性与区分力监控：PSI / CSI / KS / AUC 漂移预警' },
      { label: '模型效果', key: 'sc:model-effect', desc: '模型效果评估：区分力、lift 曲线、各客群表现与坏账回溯' },
      { label: '版本管理', key: 'sc:model-version', desc: '模型版本迭代记录、回滚与灰度发布管理' },
    ],
  },
  {
    group: '策略配置',
    section: '策略配置',
    items: [
      { label: '评分阈值', key: 'sc:score-threshold', desc: '配置各产品评分阈值、风险分层与决策建议映射' },
      { label: '预警规则', key: 'sc:alert-rule', desc: '配置分值阈值预警与规则命中预警的触发条件与通知渠道' },
      { label: '处置流程', key: 'sc:dispose-flow', keep: true, desc: '处置流程画布配置（复用 FlowCanvasEditor）：预警处置节点与流转' },
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
  {
    group: '企业档案',
    items: [
      { label: '企业档案检索', key: 'ep:qiye-search', desc: '按企业名称 / 行业 / 法定代表人 / 唯一标识检索企业工商档案，查看全维度画像', keep: true },
      { label: '企业档案', key: 'ep:qiye-profile', desc: '工商信息 / 股东与主要人员 / 对外投资与分支 / 司法与经营风险 / 经营信息 / 企业发展 / 知识产权 全维度档案', keep: true },
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
 * 五、数据治理（数据底座与元数据定义）
 * ========================================================== */
export const dataGovernanceMenu: MenuGroup[] = [
  {
    group: '元数据管理',
    items: [
      { label: '元事件', key: 'dg:meta-event', keep: true, desc: '管理已采集事件的元定义：显示名、显示状态、是否接收、埋点平台与触发时机' },
      { label: '事件属性', key: 'dg:meta-event-prop', keep: true, desc: '管理事件上报时携带的属性字段：数据类型、字典、显示状态与关联事件' },
      { label: '用户属性', key: 'dg:meta-user-prop', keep: true, desc: '管理用户维度的属性字段：数据类型、字典、显示状态与取值说明' },
      { label: '维度表', key: 'dg:meta-dim-table', keep: true, desc: '管理用于关联分析的维度表及其字段结构' },
      { label: '物品属性', key: 'dg:meta-item-prop', keep: true, desc: '管理物品维度的属性字段：物品类型、数据类型与显示状态' },
      { label: '虚拟属性', key: 'dg:meta-virtual-prop', keep: true, desc: '基于 SQL 表达式派生的属性，查询时实时计算' },
      { label: '虚拟事件', key: 'dg:meta-virtual-event', keep: true, desc: '组合多个事件与筛选条件形成的复合事件' },
      { label: '可视化全埋点事件', key: 'dg:meta-auto-track', keep: true, desc: '通过可视化圈选生成的埋点事件及其匹配规则' },
    ],
  },
]

/* ============================================================
 * 六、管理中心（跨子系统共用，原公共模块）
 * ========================================================== */
export const cmMenu: MenuGroup[] = [
  {
    group: '规则集合',
    items: [
      { label: '规则合集', key: 'cm:rule-hub', keep: true, desc: '统一管理核验规则集、反欺诈规则库、黑名单、团伙库与评分场景规则' },
      { label: '规则组件库', key: 'cm:rule-hub-items', keep: true, desc: '三库合一：核验项库（渠道/数据源/供应商/计费/接口接入/返回值归一化映射）、触发条件库（标准枚举，规则「触发条件」下拉来源）、动作库（处置动作模板，规则「处置动作」从此选择）' },
    ],
  },
  { group: '报告模板', items: [{ label: '报告模板', key: 'cm:report-template', desc: '统一管理信息核验 / 信用风控 / 欺诈识别 / 决策报告四类报告的展示模板、评分等级、结论与导出样式' }] },
  { group: '数据源管理', items: [{ label: '数据源管理', key: 'cm:mid-data-source', keep: true, desc: '对接多种数据源，为指标库提供字段与样例数据' }] },
  { group: '指标库', items: [{ label: '指标库', key: 'cm:mid-metric', keep: true, desc: '定义可复用指标（基础 + 派生公式），被监控策略、看板组件引用' }] },
  { group: '监控任务', items: [{ label: '监控任务', key: 'cm:mid-strategy', keep: true, desc: '配置监控任务（对谁、何时、算哪些指标）；预警规则在任务详情中配置' }] },
  { group: '处置策略', items: [{ label: '处置策略', key: 'cm:mid-dispose-strategy', keep: true, desc: '配置自动处置策略（如自动降额、自动冻结），按预警等级路由' }] },
  { group: '页面配置', items: [{ label: '页面配置', key: 'cm:mid-dashboard-config', keep: true, desc: '配置监控看板页面与可视化组件，保存为 midDashboards.json 配置文件后，由贷中监测按配置加载渲染对应组件' }] },
  { group: '业务流程', items: [{ label: '业务流程配置', key: 'cm:biz-flow', keep: true, desc: '按业务域配置审核操作流程（画布编辑节点与流转），实时生效于对应审核页操作按钮' }] },
]
/* ============================================================
 * 七、催贷管理（智能催收子系统 · 6 大模块重新规划）
 * ========================================================== */
export const collectionMenu: MenuGroup[] = [
  { group: '催收总览', section: '工作台', items: [{ label: '催收总览', key: 'zz:overview', desc: '逾期案件分阶段催收 + 委外绩效 + 质检违规 + 投诉统计的实时 BI 总览；报表支持定时导出、API 推送', keep: true }] },
  {
    group: '案件管理', section: '案件资产全生命周期', items: [
      { label: '催收案件', key: 'zz:cases', desc: '逾期案件队列：按账龄/状态/催收员筛选，查看详情与处置闭环生命周期，推进承诺还款/结清/委外/核销/债权转让', keep: true },
      { label: '智能分案', key: 'zz:assignment', desc: '智能分案引擎：内催/委外/调解/诉讼规则自定义分配，按债务人画像与催员产能动态调案，任务循环/超时回收/二次分配' },
      { label: '案件导入', key: 'zz:import', desc: '案件导入：API 自动对接信贷核心 / Excel 手动导案，支持批量与增量同步' },
    ],
  },
  {
    group: '合规触达', section: '多渠道合规触达', items: [
      { label: '触达渠道', key: 'zz:channels', desc: '多渠道合规触达组件：云呼叫中心 / AI 协催机器人 / 合规短信 / 安米外勤 App / 催收工作手机，内置合规硬限制（呼叫时段、每日最大频次、禁止骚扰第三方）' },
      { label: '触达记录', key: 'zz:records', desc: '全量催收触达记录明细', keep: true },
    ],
  },
  { group: '委外监管', section: '委外机构监管', items: [{ label: '委外机构', key: 'zz:agencies', desc: '委外机构监管（金融机构版最大特色）：多租户数据隔离、任务下发、进度实时监控、产能/接通率/回款率/投诉统计、佣金自动结算与违规预警' }] },
  { group: 'AI 质检', section: '智能 AI 质检', items: [{ label: '智能质检', key: 'zz:qa', desc: '智能 AI 质检平台：ASR 转写 + NLP 语义识别、自定义违规词库、实时通话预警、录音存证、自动质检报告与违规工单' }] },
  { group: '协商回款', section: '协商、减免与回款', items: [{ label: '协商减免与回款', key: 'zz:repayment', desc: '协商分期方案登记、减免审批流（多级）、还款流水录入自动匹配、逾期复催跟踪、回款台账与佣金计算' }] },
  { group: '策略配置', section: '策略配置', items: [{ label: '催收策略', key: 'zz:strategy', desc: '按逾期阶段（M0 提醒/M1 短信+外呼/M2 外呼+函件/M3+ 委外+法诉）配置催收策略与触发规则', keep: true }] },
]

/* ============================================================
 * 子系统元信息 & 菜单汇总
 * ========================================================== */
export const subNames: Record<string, string> = {
  cr: '零售信贷风控',
  sc: '评分产品',
  ep: '企业风控',
  dm: '数字营销',
  dg: '数据治理',
  cm: '管理中心',
  zz: '催贷管理',
}

export const MENU_BY_SUB: Record<string, MenuGroup[]> = {
  cr: creditRiskMenu,
  sc: scoringMenu,
  ep: entMenu,
  dm: dmMenu,
  dg: dataGovernanceMenu,
  cm: cmMenu,
  zz: collectionMenu,
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
  { key: 'ep:ent-verify-detail', sub: 'ep', group: '企业信息核验', label: '企业核验报告详情页', desc: '展示企业工商、司法、经营、舆情等核验结果' },
  { key: 'ep:ent-credit-detail', sub: 'ep', group: '企业信用评估', label: '企业信用报告详情页', desc: '展示企业的信用评分、风险维度、授信建议' },
  { key: 'ep:ent-graph-detail', sub: 'ep', group: '企业关联图谱', label: '企业关联图谱详情页', desc: '展示企业间的股权关系、担保关系、关联交易等' },
  { key: 'dm:herald-task-detail', sub: 'dm', group: '猎客信使', label: '触达任务详情页', desc: '展示任务的执行进度、触达明细、转化效果' },
  { key: 'dm:rta-detail', sub: 'dm', group: 'RTA服务', label: 'RTA请求详情页', desc: '展示单次 RTA 请求的响应分、策略建议、响应耗时' },
  { key: 'cm:mid-data-source-detail', sub: 'cm', group: '数据源管理', label: '数据源详情页', desc: '查看数据源字段口径、样例数据与被指标库引用情况' },
  { key: 'cm:mid-metric-detail', sub: 'cm', group: '指标库', label: '指标详情页', desc: '查看指标口径、实时计算预览与引用关系' },
  { key: 'cm:mid-strategy-detail', sub: 'cm', group: '策略配置', label: '策略详情页', desc: '查看监控任务/预警规则/处置策略配置与联动预警' },
  { key: 'cm:mid-dashboard-detail', sub: 'cm', group: '页面配置', label: '页面配置详情页', desc: '查看看板页面组件配置与实时渲染入口' },
  { key: 'cr:mid-alert-detail', sub: 'cr', group: '贷中监控', label: '预警详情页', desc: '查看预警信息、建议处置策略并推进状态流转' },
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
