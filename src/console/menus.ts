import type { Column, Row } from '../components/ui'
import type { ReactNode } from 'react'

/* ============ 门户子系统 ============ */
export const portalSubsystems = [
  { key: 'cr', name: '零售信贷风控', desc: '覆盖消费金融、现金贷、小微经营贷等业务的贷前审核与贷中监控。', color: 'from-rose-500 to-orange-500', open: true },
  { key: 'sc', name: '评分产品', desc: '智察分、智信分、智融分三类评分模型产品。', color: 'from-violet-500 to-fuchsia-500', open: true },
  { key: 'ep', name: '企业风控', desc: '面向企业客户的贷前核验、信用评估与关联图谱。', color: 'from-sky-500 to-cyan-500', open: false },
  { key: 'dm', name: '数字营销', desc: '潜客挖掘、专题营销、营销管理、存客管理与金融工具，覆盖对公客群洞察与商机转化。', color: 'from-emerald-500 to-teal-500', open: true },
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
  // 单客 360° 画像：由原独立菜单入口改为经首页搜索 / 预警详情 / 看板下钻直达（cr:mid-single-cust），故此处不再单列菜单项
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
      { label: '客户洞察', key: 'sc:crowd-insight', desc: '评分客户全景洞察看板（配置驱动）：风险/价值/客群/机会与趋势 KPI，客户明细列表（点击行看完整属性），辅助决定先盯哪类客群' },
      { label: '客户分组', key: 'sc:crowd-groups', desc: '按风险/价值/行为等维度定义客群分组；点击分组进入客户列表（新页面）' },
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
      { label: '模型管理', key: 'sc:model-manage', desc: '智察分/智信分/智融分管理：点击卡片进入模型详情（基本信息、算法编辑、模型效果、评分阈值、版本管理）' },
      { label: '模型效果', key: 'sc:model-effect', desc: '模型效果评估：覆盖率、准确率、及时率、调用量与趋势（三模型铺开对比）' },
    ],
  },
]

/* ============================================================
 * 三、企业风控
 * ========================================================== */
/* 企业风控子系统（v3 重建）
 * 菜单结构 1:1 来自 record/qixin 的两份原产品目录快照：
 *   ①「风控子系统目录」→ 风险监控 / 风险管理 / 内控合规（共 12 项）
 *   ②「尽调目录」      → 企业尽调 / 尽调报告 / 受益所有人（共 6 项）
 * 分区名、菜单名、排列顺序均与原产品一致，未增删。
 * 「企业档案」系列页面在原产品中属于尽调结果的详情内页，不出现在左侧菜单，故不挂。
 */
export const entMenu: MenuGroup[] = [
  /* ============ 企业信贷审批（顺位第一 · 由零售信贷贷前四页整体迁入） ============ */
  {
    group: '企业信贷审批',
    section: '企业信贷审批',
    items: [
      { label: '企业信贷审批', key: 'ep:ent-pre-report', desc: '企业信贷进件审核报告：整合信息核验+信用风控+欺诈识别，输出最终授信决策建议' },
      { label: '企业信息核验', key: 'ep:ent-pre-verify', desc: '企业信息核验报告（数据从本地 JSON 读取）' },
      { label: '企业信用风控', key: 'ep:ent-credit-kimi', desc: '企业信用风控报告（数据从本地 JSON 读取）' },
      { label: '企业欺诈识别', key: 'ep:ent-pre-fraud', desc: '企业欺诈识别报告（数据从本地 JSON 读取）' },
    ],
  },
  /* ============ 来源：风控子系统目录 ============ */
  {
    group: '风险监控',
    section: '风险监控',
    items: [
      { label: '风险预警', key: 'ep:fk-risk-warning', desc: '企业风险预警：已同步企业 3 个月监控动态、剩余额度，预警列表含添加监控 / 解读 / 风险详情 / 案件串联', keep: true },
      { label: '监控列表', key: 'ep:fk-monitor-list', desc: '存量企业监控名单：名单内企业持续监控，风险变化即预警', keep: true },
      { label: '统计看板', key: 'ep:fk-stats', desc: '风控统计看板：风险报告 / 企业风险排名 / 企业风险动态 / 其他统计多维图表', keep: true },
      { label: '风险地图', key: 'ep:fk-map', desc: '风险地图：按时间维度展示企业风险地理分布', keep: true },
      { label: '监控管理', key: 'ep:fk-monitor-manage', desc: '监控规则与订阅管理：国内 / 境外企业、外部供应链、关键词、微信公众号等监控规则', keep: true },
    ],
  },
  {
    group: '风险管理',
    section: '风险管理',
    items: [
      { label: '定期体检', key: 'ep:fk-health-check', desc: '目标企业定期体检：按风险类型 / 维度对比体检日与对比日变化，可设置体检项', keep: true },
      { label: '账户年检', key: 'ep:fk-account-yearly', desc: '账户年检：目标客群年检，查看股东 / 工商登记 / 历史股东等公示信息通过情况', keep: true },
      { label: '财产线索', key: 'ep:fk-property', desc: '财产线索：查企业线索信息、扩大主体、资产状况（股权 / 涉诉 / 动产 / 不动产 / 无形资产）', keep: true },
      { label: '黑名单', key: 'ep:fk-blacklist', desc: '黑名单排查 / 内部黑名单 / 历史黑名单：企业黑名单来源说明与排查', keep: true },
    ],
  },
  /* ============ 来源：尽调目录 ============ */
  {
    group: '企业尽调',
    section: '企业尽调',
    items: [
      { label: '企业尽调', key: 'ep:jd-company', desc: '企业尽调：智能分析合作方资质风险，常规 / 批量筛查与筛查设置', keep: true },
      { label: '批量尽调', key: 'ep:jd-batch', desc: '批量尽调：查企业 / 查人员 / 选择指标 / 模板，批量企业画像分析', keep: true },
      { label: '关系尽调', key: 'ep:jd-relation', desc: '关系尽调：集中排查 AI / 组与组排查 / 关联方识别（含识别结果）', keep: true },
      { label: '人员尽调', key: 'ep:jd-person', desc: '人员尽调：查人员风险，进入人员详情（基本信息 / 历史 / 风险 / 专利 / 关联企业 / 个人图谱）', keep: true },
    ],
  },
  {
    group: '内控合规',
    section: '内控合规',
    items: [
      { label: '利益排查', key: 'ep:fk-interest', desc: '合作方利益排查：上传员工 / 企业名单，识别疑似利益冲突企业与人员', keep: true },
      { label: '员工列表', key: 'ep:fk-employee', desc: '员工信息管理：维护员工电话、关联企业，用于合作方利益排查（上限 2000 名）', keep: true },
      { label: '监管合规', key: 'ep:fk-regulatory', desc: '监管合规：按范围 / 主体 / 判决机构 / 违规类型查询企业合规情况', keep: true },
    ],
  },
  {
    group: '尽调报告',
    section: '尽调报告',
    items: [
      { label: '报告中心', key: 'ep:jd-report', desc: '尽调报告中心：获取尽调报告、报告记录、自定义报告与模板选择', keep: true },
    ],
  },
  {
    group: '受益所有人',
    section: '受益所有人',
    items: [
      { label: '受益所有人', key: 'ep:jd-beneficiary', desc: '受益所有人识别：企业受益所有人穿透、认定依据与十大受益人', keep: true },
    ],
  },
]

/* ============================================================
 * 四、数字营销
 * ========================================================== */
export const dmMenu: MenuGroup[] = [
  {
    group: '潜客挖掘',
    section: '潜客挖掘',
    items: [
      { label: 'AI营销', key: 'dm:ai-marketing', keep: true, desc: 'AI 驱动的一站式智能营销工作台：营销洞察、智能推荐与一键触达' },
      { label: '全维搜索', key: 'dm:full-search', desc: '企业/人物/商标/专利/舆情等全维度一站式检索，支持组合筛选与导出' },
      { label: '区域商机', key: 'dm:regional-biz', desc: '按行政区划挖掘区域企业商机，含 AI 触达、公司商机与关联营销' },
      { label: '地图拓客', key: 'dm:map-prospect', desc: '基于地图的地理化拓客：圈选区域、周边企业批量获取与画像' },
      { label: '网格营销', key: 'dm:grid-marketing', keep: true, desc: '网格化责任片区管理：片区客户分布、商机跟进与业绩看板' },
      { label: '企业库', key: 'dm:company-lib', desc: '全量企业名录库：多维筛选、企业详情与批量收藏' },
      { label: '集团户', key: 'dm:group-account', keep: true, desc: '集团客户管理：国企/央企/民营/外资/机构集团及实际控制人视图' },
      { label: '招投标', key: 'dm:tender', desc: '招投标信息检索与商机挖掘（我的标讯/全部标讯/中标企业库/产品词库）' },
      { label: '供应链', key: 'dm:supply-chain', desc: '产业链上下游企业挖掘与供应链金融商机识别' },
    ],
  },
  {
    group: '专题营销',
    section: '专题营销',
    items: [
      { label: '科创金融', key: 'dm:techfin', desc: '科创企业专属金融服务：科创企业库与资质画像' },
    ],
  },
  {
    group: '营销管理',
    section: '营销管理',
    items: [
      { label: '营销名单', key: 'dm:market-list', desc: '营销目标名单管理：名单生成、分发与转化追踪' },
      { label: '营销线索', key: 'dm:market-lead', desc: '营销线索池：线索采集、打分与分配跟进' },
      { label: '营销看板', key: 'dm:market-board', desc: '营销核心指标实时看板：触达、转化与 ROI' },
    ],
  },
  {
    group: '存客管理',
    section: '存客管理',
    items: [
      { label: '存客商机', key: 'dm:exist-biz', desc: '存量客户交叉销售与向上销售商机挖掘' },
      { label: '客群分析', key: 'dm:crowd-analysis', desc: '存量客群分层与价值/流失/潜力分析' },
    ],
  },
  {
    group: '金融工具',
    section: '金融工具',
    items: [
      { label: 'PE/VC', key: 'dm:pevc', desc: '私募股权与创投：投融资事件、投资机构与基金路径' },
      { label: '上市数据', key: 'dm:listing', desc: '上市公司财务、股东与资本运作数据' },
      { label: '债券数据', key: 'dm:bond', desc: '债券发行、存续期与违约风险数据' },
      { label: '主体评级', key: 'dm:rating', desc: '企业主体信用评级与评级迁移' },
      { label: '同业分析', key: 'dm:peer-analysis', desc: '同业机构对标与竞争格局分析' },
      { label: '行业研报', key: 'dm:industry-report', keep: true, desc: '行业研究报告库：检索、订阅与解读' },
      { label: '金融法规', key: 'dm:fin-law', desc: '金融法律法规与监管文件库（内容待核对）' },
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
  { group: '预警配置', items: [{ label: '统一预警配置', key: 'cm:alert-config', keep: true, desc: '跨子系统统一配置预警规则：企业风控 / 评分产品 / 零售信贷 / 数字营销' }] },
  { group: '页面配置', items: [{ label: '页面配置', key: 'cm:mid-dashboard-config', keep: true, desc: '配置监控看板页面与可视化组件，保存为 midDashboards.json 配置文件后，由贷中监测按配置加载渲染对应组件' }] },
  { group: '业务流程', items: [{ label: '业务流程配置', key: 'cm:biz-flow', keep: true, desc: '按业务域配置审核操作流程（画布编辑节点与流转），实时生效于对应审核页操作按钮' }] },
  {
    group: '档案备份',
    section: '档案备份',
    items: [
      { label: '企业档案（数字营销）', key: 'cm:ent-archive-basic', keep: true, desc: '数字营销子系统 · 企业档案（数据复刻版）备份入口，直接在管理中心内嵌展示' },
      { label: '个人档案（数字营销）', key: 'cm:person-archive-basic', keep: true, desc: '数字营销子系统 · 个人档案（数据复刻版）备份入口，直接在管理中心内嵌展示' },
      { label: '个人档案（旧版 · 零售信贷）', key: 'cm:cust-archive-legacy', keep: true, desc: '零售信贷 / 评分产品原个人档案（单客 360° 画像），已在业务入口统一切至数字营销，此处保留旧版备份' },
      { label: '得分详情（旧版 · 零售信贷）', key: 'cm:cust-score-legacy', keep: true, desc: '零售信贷 / 评分产品原单客得分详情页，已从业务入口链路移除，此处保留旧版备份' },
    ],
  },
]
/* ============================================================
 * 七、催贷管理（智能催收子系统 · 9 大模块，依据 record/催贷系统模块.md 重建）
 * ========================================================== */
export const collectionMenu: MenuGroup[] = [
  {
    group: '案件管理', section: '催贷管理', items: [
      { label: '案件管理', key: 'zz:cases', desc: '逾期案件队列：筛选、批量处置与处置闭环生命周期；行操查看详情/线下还款登记/减免审批；支持分步向导导入案件' },
      { label: '历史案件', key: 'zz:cases-history', desc: '已结清/核销/诉讼结案案件归档查询（只读）' },
    ],
  },
  {
    // 智能策略引擎：4 个平级菜单收拢为唯一入口。画布/版本不再占侧边导航，
    // 改为「策略列表行编辑 → 画布页 → 版本管理子Tab」；监控作为页面内全局 Tab。
    group: '智能策略引擎', section: '策略编排', items: [
      { label: '智能策略引擎', key: 'zz:strategy', desc: '催收策略总入口：策略列表（新建/复制/启停/灰度），画布编辑与版本管理在下钻页内' },
      { label: '策略执行监控', key: 'zz:strategy-monitor', desc: '策略全局执行监控：分流统计、图谱因子与异常日志' },
    ],
  },
  {
    group: '坐席工作台', section: '坐席作业', items: [
      { label: '我的案件池', key: 'zz:agent-pool', desc: '坐席名下案件：一键外呼、催记录入、还款承诺、协商方案、联系人管理（含全部案件/今日待办筛选）' },
    ],
  },
  {
    group: '委外机构管理', section: '委外监管', items: [
      { label: '委外机构管理', key: 'zz:agency-list', desc: '机构档案（机构详情抽屉）+ 机构账号权限，两个子 Tab 合并管理' },
      { label: '委外案件监控', key: 'zz:agency-monitor', desc: '委托案件进度实时监控，机构名/案件号可点开详情抽屉' },
      { label: '催收回传记录', key: 'zz:agency-callback', desc: '委外机构催收回传流水记录，支持按机构/结果筛选（机构名/案件号可点开详情抽屉）' },
      { label: '绩效与结算', key: 'zz:agency-kpi', desc: '机构 KPI 考核 + 佣金对账结算两个子 Tab，机构名可点开详情抽屉' },
    ],
  },
  {
    group: '外访管理', section: '外访作业', items: [
      { label: '外访任务', key: 'zz:visit-list', desc: '外访任务分配、详情、打卡与报告' },
      { label: '我的外访', key: 'zz:visit-mine', desc: '外访人员视图：待办、打卡与报告' },
      { label: '外访历史', key: 'zz:visit-history', desc: '历史全部外访任务归档查询' },
      { label: '外访人员管理', key: 'zz:visitor-manage', desc: '外访人员档案、技能标签、任务负载与区域分布' },
    ],
  },
  {
    group: '智能质检', section: '智能 AI 质检', items: [
      { label: '通话录音查询', key: 'zz:qa-record', desc: '查询全部催收通话录音，支持语音播放、文本转写与AI质检结果查看' },
      { label: '敏感词库管理', key: 'zz:qa-words', desc: '维护催收违规敏感词，配置违规分类、告警风险等级与启用状态' },
      { label: '实时告警处理', key: 'zz:qa-alert', desc: '通话中AI实时识别违规敏感词，完成告警复核、判定处理与误判标记' },
      { label: '事后抽样质检', key: 'zz:qa-task', desc: '创建抽样任务，对历史催收通话做事后人工复核打分' },

    ],
  },
  {
    group: '智能化', section: 'AI 协催', items: [
      { label: '外呼任务总览', key: 'zz:ai-task', desc: '手动临时 + 自动周期任务（系统按策略自动外呼）；任务详情含通话明细与异常统计' },
      { label: '对话模板管理', key: 'zz:ai-template', desc: '多轮对话话术模板、分支流程可视化与模拟测试' },
      { label: '话术管理', key: 'zz:script-lib', desc: '话术库：分类、版本管理、效果预览、关联催回策略' },
      { label: '短信模板管理', key: 'zz:sms-template', desc: '短信/企微/5G 消息模板：合规校验、预览、审核状态' },
    ],
  },
  {
    group: '诉讼调解', section: '法务处置', items: [
      { label: '法务案件总览', key: 'zz:legal-overview', desc: '单页聚合：评估→证据→立案→调解→执行→归档，全部在一体化详情页闭环' },
    ],
  },
  {
    group: 'BI报表中心', section: '数据分析', items: [
      { label: '总览驾驶舱', key: 'zz:bi-overview', desc: '催收核心指标实时总览：入催/在催/回款/投诉' },
      { label: '入催报表', key: 'zz:bi-intake', desc: '按日/周/月统计入催量，可导出台账' },
      { label: '回款报表', key: 'zz:bi-repayment', desc: '按账龄/处理人/机构统计回款并可下钻' },
      { label: '接通率报表', key: 'zz:bi-connect', desc: 'AI 机器人与坐席通话接通率' },
      { label: '委外报表', key: 'zz:bi-agency', desc: '各委外机构案件量、回款率、KPI与佣金' },
      { label: '质检报表', key: 'zz:bi-qa', desc: '质检告警、违规坐席与覆盖率' },
      { label: '外访报表', key: 'zz:bi-visit', desc: '外访任务统计、人员绩效与回款效果' },
      { label: '法务处置报表', key: 'zz:bi-legal', desc: '待诉评估量、立案、调解成功率、执行回款与结案' },
      { label: 'AI协催报表', key: 'zz:bi-ai', desc: 'AI呼叫量、接通率、承诺还款率、转人工占比与模板效果对比' },
    ],
  },
]

/* ============================================================
 * 八、决策引擎（规则 + 模型双引擎 · 可视化决策编排与运行）
 *   工作台 / 决策建模 / 运行管理 / 监控分析 / 审批管理
 * ========================================================== */
export const decisionEngineMenu: MenuGroup[] = [
  {
    group: '工作台',
    section: '工作台',
    items: [
      { label: '决策引擎工作台', key: 'de:overview', desc: '决策引擎概览：在策决策、运行状态、调用量与近况一览，规则与模型双引擎统一入口' },
    ],
  },
  {
    group: '决策建模',
    section: '决策建模',
    items: [
      { label: '模型管理', key: 'de:model-manage', desc: '决策模型全生命周期管理：模型上传、版本、发布与下线' },
      { label: '特征库', key: 'de:feature-lib', desc: '决策特征资产管理：特征定义、加工逻辑、口径与血缘，供规则与模型引用' },
      { label: '特征监控', key: 'de:feature-monitor', desc: '特征质量与稳定性监控：覆盖率、空值率、波动与分布漂移' },
      { label: '名单库', key: 'de:list-lib', desc: '黑白灰名单管理：名单接入、版本生效、命中测试与导出' },
      { label: '模板市场', key: 'de:template-market', desc: '决策策略模板市场：行业最佳实践模板，一键引用与二次编辑' },
    ],
  },
  {
    group: '运行管理',
    section: '运行管理',
    items: [
      { label: '版本管理', key: 'de:version-manage', desc: '策略与模型版本管理：版本留痕、回滚与灰度上线' },
      { label: '流量分配', key: 'de:traffic-split', desc: '决策流量分拨：按比例在版本/模型间分配线上流量做 A/B 与灰度' },
      { label: '决策回放', key: 'de:decision-replay', desc: '历史决策回放：按批次/客户重放决策过程，定位策略差异与问题' },
      { label: '批量决策', key: 'de:batch-decision', desc: '批量决策任务：名单上传、批量跑分、结果下载与失败重跑' },
    ],
  },
  {
    group: '监控分析',
    section: '监控分析',
    items: [
      { label: '监控大盘', key: 'de:monitor-board', desc: '决策运行监控大盘：调用量、耗时、拦截率与趋势总览' },
      { label: '告警管理', key: 'de:alert-manage', desc: '决策链路告警管理：阈值告警规则配置与告警消息处理' },
      { label: '决策分析', key: 'de:decision-analysis', desc: '决策效果分析：通过/拒绝结构、指标贡献与客群画像' },
      { label: '规则命中', key: 'de:rule-hit', desc: '规则命中分析：命中 TOP 规则、命中分布与规则贡献' },
      { label: '决策日志', key: 'de:decision-log', desc: '全量决策日志明细：入参、特征、规则/模型结果与最终结论' },
    ],
  },
  {
    group: '审批管理',
    section: '审批管理',
    items: [
      { label: '审批管理', key: 'de:approval-manage', desc: '策略与模型上线审批流：提交、审核、发布与操作留痕' },
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
  dg: '数据治理',
  zz: '催贷管理',
  de: '决策引擎',
  cm: '管理中心',
}

export const MENU_BY_SUB: Record<string, MenuGroup[]> = {
  cr: creditRiskMenu,
  sc: scoringMenu,
  ep: entMenu,
  dm: dmMenu,
  dg: dataGovernanceMenu,
  zz: collectionMenu,
  de: decisionEngineMenu,
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
