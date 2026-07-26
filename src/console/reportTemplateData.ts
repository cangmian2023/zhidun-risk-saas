/* ============================================================================
 * 报告模板配置 · 数据模型与种子数据
 * 对应文档：SaaS/doc/报告模板配置页功能设计.md
 * 统一管理「信息核验 / 信用风控 / 欺诈识别 / 决策报告」四大报告的展示模板。
 * ========================================================================== */

/* ---------- 基础类型 ---------- */
export type ReportType = 'info_verify' | 'credit' | 'fraud' | 'decision'
export type TplStatus = '草稿' | '已启用' | '已停用'
export type RiskLevel = '低' | '中' | '高' | '极高'
export type DisplayComponent = '大数字' | '环形图' | '进度条' | '仪表盘'
export type AutoDecision = '通过' | '预警' | '拒绝' | '处理中'
export type ManualStatus = '—' | '待确认' | '待审核' | '核验计算中'
export type ReviewLevel = '单人复核' | '双人复核' | '初审+终审两级'

export interface FieldConfig {
  id: string
  name: string
  visible: boolean
}
export interface SectionConfig {
  id: string
  name: string
  order: number
  visible: boolean
  fields: FieldConfig[]
}
export interface ScoreGrade {
  grade: string
  label: string
  minScore: number
  maxScore: number
  riskLevel: RiskLevel
  color: string
  description: string
}
export interface ScoreDisplayConfig {
  displayComponent: DisplayComponent
  showDescription: boolean
  showThresholdBar: boolean
  showComponents: boolean
  showRiskTags: boolean
  grades: ScoreGrade[]
}
export interface BusinessFlowConfig {
  gradeId: string
  autoDecision: AutoDecision
  manualStatus: ManualStatus
  suggestionText: string
  creditLimitRatio: number
  needManualReview: boolean
  reviewLevel: ReviewLevel
  allowedActions: string[]
}
export interface ThemeConfig {
  preset: '标准蓝' | '专业灰' | '政务红' | '极简白'
  primaryColor: string
  passColor: string
  warningColor: string
  rejectColor: string
  spacing: '紧凑' | '标准' | '宽松'
  fontSize: '小' | '标准' | '大'
  tableStyle: '线框表' | '斑马纹' | '无边框'
  borderRadius: '直角' | '小圆角' | '大圆角'
  headerStyle: '简洁' | '标准' | '完整'
}
export interface ExportConfig {
  formats: ('PDF' | 'Word' | 'Excel')[]
  defaultFormat: string
  pdfHeader: string
  pdfFooter: string
  watermark: { enabled: boolean; text: string; opacity: number }
  wordStyle: '与页面一致' | '独立样式'
  excelSplitSheet: boolean
  exportScope: '完整报告' | '仅当前可见分段' | '自定义范围'
  includeOpLogs: boolean
  includeSignature: boolean
  signatureTemplate?: string
}
export interface TemplateChangeLog {
  version: string
  action: '创建' | '编辑' | '启用' | '停用' | '复制' | '删除'
  operator: string
  timestamp: string
  summary: string
}
export interface ReportTemplate {
  id: string
  name: string
  reportType: ReportType
  scope: string[]
  status: TplStatus
  isDefault: boolean
  description: string
  version: string
  lastEditor: string
  lastEditTime: string
  sections: SectionConfig[]
  scoreDisplay: ScoreDisplayConfig
  businessFlow: BusinessFlowConfig[]
  theme: ThemeConfig
  export: ExportConfig
  changeLogs: TemplateChangeLog[]
}

/* ---------- 报告类型元信息 ---------- */
export const REPORT_META: Record<ReportType, { icon: string; label: string; color: 'blue' | 'cyan' | 'violet' | 'green' }> = {
  info_verify: { icon: '📋', label: '信息核验', color: 'blue' },
  credit: { icon: '📊', label: '信用风控', color: 'cyan' },
  fraud: { icon: '🛡️', label: '欺诈识别', color: 'violet' },
  decision: { icon: '📋', label: '决策报告', color: 'green' },
}

export const PRODUCTS = ['全产品', '信用贷', '抵押贷', '经营贷']

/* ---------- 可执行操作清单（8.3） ---------- */
export const ACTION_CATALOG: Record<string, string> = {
  view: '查看',
  report_confirm: '报告确认',
  force_review: '强制复审',
  add_blacklist: '加入黑名单',
  submit_dual_review: '提交双人复核',
  add_note: '录入备注',
  confirm_pass: '确认放行',
  confirm_reject: '确认拒绝',
  approve: '审核通过',
  reject_credit: '拒绝授信',
  return_material: '退回补充材料',
  manual_review: '提交人工复核',
}
export const ACTION_BY_TYPE: Record<ReportType, string[]> = {
  info_verify: ['view', 'report_confirm', 'force_review', 'submit_dual_review', 'add_note', 'add_blacklist'],
  credit: ['view', 'approve', 'reject_credit', 'return_material', 'manual_review'],
  fraud: ['view', 'report_confirm', 'force_review', 'add_blacklist', 'submit_dual_review', 'add_note', 'confirm_pass', 'confirm_reject'],
  decision: ['view', 'report_confirm', 'force_review', 'add_blacklist', 'submit_dual_review', 'add_note', 'approve', 'reject_credit', 'return_material', 'manual_review'],
}

/* ---------- 分段与字段清单（6.3） ---------- */
export const SECTION_CATALOG: Record<ReportType, { id: string; name: string; fields: { id: string; name: string }[] }[]> = {
  info_verify: [
    { id: 'score_model', name: '信用值模型卡', fields: [
      { id: 'sv_big', name: '信用值大数字' }, { id: 'sv_denom', name: '满分分母' }, { id: 'sv_level', name: '信用值等级标签' },
      { id: 'sv_threshold', name: '阈值刻度条' }, { id: 'sv_breakdown', name: '构成项分解表' }, { id: 'sv_total', name: '合计行' },
      { id: 'sv_rule', name: '判定规则文本' }, { id: 'sv_audit', name: '审计栏' }, { id: 'sv_weight', name: '查看打分权重明细按钮' },
    ] },
    { id: 'conclusion_process', name: '结论与终审操作卡 + 核验过程', fields: [
      { id: 'cp_system', name: '系统结果' }, { id: 'cp_manual', name: '人工审核' }, { id: 'cp_operator', name: '操作人员' },
      { id: 'cp_advice', name: '授信建议' }, { id: 'cp_reason', name: '建议理由' }, { id: 'cp_pos', name: '正向因素' },
      { id: 'cp_risk', name: '风险因素' }, { id: 'cp_amount', name: '参考授信额度' }, { id: 'cp_ops', name: '操作按钮组' },
      { id: 'cp_timeline', name: '核验过程时间线' }, { id: 'cp_step_icon', name: '步骤图标' }, { id: 'cp_step_status', name: '步骤状态色' }, { id: 'cp_step_cost', name: '步骤耗时' },
    ] },
    { id: 'basic_info', name: '用户基本信息', fields: [
      { id: 'bi_name', name: '姓名' }, { id: 'bi_id', name: '身份证号' }, { id: 'bi_phone', name: '手机号' }, { id: 'bi_bank', name: '银行卡号' },
      { id: 'bi_bank_branch', name: '开户行' }, { id: 'bi_age', name: '年龄' }, { id: 'bi_edu', name: '学历' }, { id: 'bi_company', name: '工作单位' },
      { id: 'bi_income', name: '月收入' }, { id: 'bi_address', name: '居住地址' }, { id: 'bi_marriage', name: '婚姻' },
      { id: 'bi_fp', name: '设备指纹' }, { id: 'bi_ip', name: 'IP地址' }, { id: 'bi_gps', name: 'GPS定位' }, { id: 'bi_channel', name: '进件渠道' }, { id: 'bi_appver', name: 'APP版本' },
    ] },
    { id: 'id_images', name: '用户证件照', fields: [
      { id: 'ii_front', name: '身份证人像面' }, { id: 'ii_back', name: '身份证国徽面' }, { id: 'ii_live', name: '活体人脸（视频）' }, { id: 'ii_bank', name: '银行卡' }, { id: 'ii_ocr', name: 'OCR识别文本' },
    ] },
    { id: 'single_verify', name: '多源并行核验单项报告', fields: [
      { id: 'sv_police', name: '公安实名（可独立隐藏）' }, { id: 'sv_bank4', name: '银行卡四要素（可独立隐藏）' }, { id: 'sv_operator', name: '运营商实名（可独立隐藏）' },
      { id: 'sv_device', name: '终端设备（可独立隐藏）' }, { id: 'sv_link', name: '联防联控（可独立隐藏）' }, { id: 'sv_head', name: '卡片头部' },
      { id: 'sv_concl', name: '整体结论' }, { id: 'sv_cause', name: '结论原因' }, { id: 'sv_subfields', name: '子字段列表' }, { id: 'sv_serial', name: '核验流水号' },
      { id: 'sv_time', name: '核验时间' }, { id: 'sv_channel', name: '调用渠道' }, { id: 'sv_cost', name: '调用耗时' },
    ] },
    { id: 'cross_fusion', name: '数据交叉融合综合报告', fields: [
      { id: 'cf_head', name: '综合风险头部栏' }, { id: 'cf_atom', name: '5项原子结论卡' }, { id: 'cf_doubt', name: '多源风险交叉疑点明细' }, { id: 'cf_abnormal', name: '异常值构成项分解' },
      { id: 'cf_tags', name: '风险标签' }, { id: 'cf_rule', name: '判定规则文本' }, { id: 'cf_audit', name: '审计信息' }, { id: 'cf_weight', name: '查看打分权重明细弹窗入口' },
    ] },
    { id: 'op_logs', name: '单项核验全量操作日志', fields: [
      { id: 'ol_single', name: '单项操作记录' }, { id: 'ol_report', name: '报告级操作记录' }, { id: 'ol_timeline', name: '操作日志时间线' }, { id: 'ol_attach', name: '附件列' }, { id: 'ol_review', name: '复核状态列' },
    ] },
  ],
  credit: [
    { id: 'credit_score_overview', name: '信用评分总览', fields: [
      { id: 'cso_ring', name: '环形评分图' }, { id: 'cso_level', name: '信用等级（A/B/C/D）' }, { id: 'cso_six', name: '六维评分条' }, { id: 'cso_tags', name: '风险标签' }, { id: 'cso_export', name: '导出报告按钮' },
    ] },
    { id: 'credit_conclusion', name: '结论与终审操作卡', fields: [
      { id: 'cc_system', name: '系统结果' }, { id: 'cc_manual', name: '人工审核' }, { id: 'cc_operator', name: '操作人员' }, { id: 'cc_advice', name: '授信建议' },
      { id: 'cc_reason', name: '建议理由' }, { id: 'cc_pos', name: '正向因素' }, { id: 'cc_risk', name: '风险因素' }, { id: 'cc_amount', name: '参考授信额度' }, { id: 'cc_ops', name: '操作按钮组' },
    ] },
    { id: 'applicant_info', name: '用户基本信息', fields: [
      { id: 'ai_name', name: '姓名' }, { id: 'ai_id', name: '身份证号' }, { id: 'ai_phone', name: '手机号' }, { id: 'ai_bank', name: '银行卡号' }, { id: 'ai_bank_branch', name: '开户行' },
      { id: 'ai_age', name: '年龄' }, { id: 'ai_edu', name: '学历' }, { id: 'ai_company', name: '工作单位' }, { id: 'ai_income', name: '月收入' }, { id: 'ai_address', name: '居住地址' }, { id: 'ai_marriage', name: '婚姻' },
      { id: 'ai_fp', name: '设备指纹' }, { id: 'ai_ip', name: 'IP地址' }, { id: 'ai_gps', name: 'GPS定位' }, { id: 'ai_channel', name: '进件渠道' }, { id: 'ai_appver', name: 'APP版本' },
    ] },
    { id: 'risk_factors', name: '风险因子分析', fields: [
      { id: 'rf_cards', name: '6维评分卡片（身份/还款/信用历史/行为/设备/关联）' }, { id: 'rf_table', name: '维度说明表（权重/逻辑/来源）' },
    ] },
    { id: 'score_trend', name: '信用评分趋势', fields: [
      { id: 'st_svg', name: 'SVG折线图（用户vs行业 近7月）' }, { id: 'st_text', name: '趋势分析文案' },
    ] },
    { id: 'risk_radar', name: '风险维度雷达图', fields: [
      { id: 'rr_svg', name: 'SVG雷达图（当前vs行业平均）' }, { id: 'rr_text', name: '雷达图分析文案' },
    ] },
    { id: 'credit_suggestion', name: '风控决策建议', fields: [
      { id: 'cs_text', name: '系统建议文案' }, { id: 'cs_pos', name: '正向因素列表' }, { id: 'cs_risk', name: '风险因素列表' }, { id: 'cs_ops', name: '4决策按钮（审核通过/拒绝授信/提交人工复核/退回补充材料）' },
    ] },
    { id: 'history_records', name: '历史授信记录', fields: [
      { id: 'hr_table', name: '历史授信记录表（授信时间/额度/期限/状态/逾期情况）' },
    ] },
    { id: 'credit_logs', name: '风控操作日志', fields: [
      { id: 'cl_timeline', name: '时间线日志（操作人/操作/时间/结果/备注）' },
    ] },
  ],
  fraud: [
    { id: 'fraud_score_model', name: '欺诈风险评分模型卡', fields: [
      { id: 'fsm_big', name: '欺诈分大数字' }, { id: 'fsm_level', name: '风险等级标签（极低/低/中/高/极高）' }, { id: 'fsm_threshold', name: '阈值刻度条' },
      { id: 'fsm_hit', name: '命中规则统计（X/Y条，占比Z%）' }, { id: 'fsm_tags', name: '风险标签（设备群控/团伙欺诈/黑名单命中）' }, { id: 'fsm_version', name: '规则版本' },
    ] },
    { id: 'disposal_bar', name: '处置建议与操作栏', fields: [
      { id: 'db_level', name: '风险等级' }, { id: 'db_auto', name: '自动审核' }, { id: 'db_status', name: '处置状态' }, { id: 'db_operator', name: '处置人' },
      { id: 'db_ops', name: '处置按钮组（查看/报告确认/强制复审/加入黑名单/提交双人复核/录入备注/确认放行/确认拒绝）' }, { id: 'db_advice', name: '处置建议文案' },
    ] },
    { id: 'basic_info', name: '用户基本信息', fields: [
      { id: 'fbi_name', name: '姓名' }, { id: 'fbi_id', name: '身份证号' }, { id: 'fbi_phone', name: '手机号' }, { id: 'fbi_bank', name: '银行卡号' }, { id: 'fbi_age', name: '年龄' }, { id: 'fbi_channel', name: '进件渠道' },
    ] },
    { id: 'identity_fraud', name: '身份欺诈详情', fields: [
      { id: 'if_table', name: 'RuleTable（规则名称/命中条件/权重/信息核验联动/状态/操作）' }, { id: 'if_detail', name: '查看详情' }, { id: 'if_exempt', name: '标记豁免' },
    ] },
    { id: 'info_forgery', name: '信息伪造详情', fields: [
      { id: 'inf_table', name: 'RuleTable（同身份欺诈，不同数据源）' }, { id: 'inf_detail', name: '查看详情' }, { id: 'inf_exempt', name: '标记豁免' },
    ] },
    { id: 'device_fraud', name: '设备欺诈详情', fields: [
      { id: 'df_fp', name: '设备指纹' }, { id: 'df_type', name: '设备类型' }, { id: 'df_root', name: 'Root/越狱状态' }, { id: 'df_emulator', name: '模拟器检测' }, { id: 'df_proxy', name: '代理/VPN检测' },
      { id: 'df_rel_id', name: '设备关联身份数' }, { id: 'df_rel_app', name: '设备关联申请数' }, { id: 'df_first', name: '首次出现时间' }, { id: 'df_graph', name: '设备关联图谱' },
    ] },
    { id: 'behavior_fraud', name: '行为欺诈详情', fields: [
      { id: 'bf_cost', name: '申请耗时' }, { id: 'bf_speed', name: '填写速度' }, { id: 'bf_stay', name: '页面停留' }, { id: 'bf_track', name: '操作轨迹' }, { id: 'bf_gps', name: 'GPS定位' }, { id: 'bf_path', name: '操作路径' }, { id: 'bf_timeline', name: '行为轨迹时间线' },
    ] },
    { id: 'gang_fraud', name: '团伙欺诈详情', fields: [
      { id: 'gf_tag', name: '团伙标签' }, { id: 'gf_score', name: '关联度评分' }, { id: 'gf_dim', name: '关联维度' }, { id: 'gf_nodes', name: '关联节点数' }, { id: 'gf_scale', name: '团伙规模' }, { id: 'gf_case', name: '历史案件' }, { id: 'gf_graph', name: '关联图谱可视化' }, { id: 'gf_list', name: '关联列表' },
    ] },
    { id: 'blacklist_hit', name: '黑名单命中详情', fields: [
      { id: 'bh_type', name: '黑名单类型' }, { id: 'bh_field', name: '命中字段' }, { id: 'bh_source', name: '来源' }, { id: 'bh_reason', name: '原因' }, { id: 'bh_time', name: '命中时间' }, { id: 'bh_level', name: '等级' }, { id: 'bh_table', name: '命中记录表' },
    ] },
    { id: 'history_fraud', name: '历史欺诈记录', fields: [
      { id: 'hf_table', name: '历史欺诈记录表（时间/类型/等级/处理结果）' },
    ] },
    { id: 'fraud_logs', name: '操作日志', fields: [
      { id: 'fl_table', name: 'MergedOpTable（单项操作+报告级操作+时间线）' },
    ] },
  ],
  decision: [
    { id: 'decision_overview', name: '综合决策总览', fields: [
      { id: 'do_three', name: '三大报告评分汇总（信用值/信用评分/欺诈分）' }, { id: 'do_level', name: '综合风险等级' }, { id: 'do_advice', name: '最终决策建议' }, { id: 'do_basis', name: '决策依据摘要' },
    ] },
    { id: 'verify_summary', name: '信息核验摘要', fields: [
      { id: 'vs_concl', name: '信息核验结论摘要' }, { id: 'vs_risk', name: '关键风险点' }, { id: 'vs_jump', name: '展开查看完整信息核验报告入口' },
    ] },
    { id: 'credit_summary', name: '信用风控摘要', fields: [
      { id: 'cs2_concl', name: '信用风控结论摘要' }, { id: 'cs2_risk', name: '关键风险点' }, { id: 'cs2_jump', name: '展开查看完整信用风控报告入口' },
    ] },
    { id: 'fraud_summary', name: '欺诈识别摘要', fields: [
      { id: 'fs_concl', name: '欺诈识别结论摘要' }, { id: 'fs_risk', name: '关键风险点' }, { id: 'fs_jump', name: '展开查看完整欺诈识别报告入口' },
    ] },
    { id: 'decision_suggestion', name: '最终决策建议', fields: [
      { id: 'ds_text', name: '综合建议文案' }, { id: 'ds_pos', name: '正向因素汇总' }, { id: 'ds_risk', name: '风险因素汇总' }, { id: 'ds_ops', name: '决策按钮组' }, { id: 'ds_amount', name: '授信额度建议' },
    ] },
    { id: 'decision_logs', name: '综合操作日志', fields: [
      { id: 'dl_timeline', name: '三大报告操作日志汇总时间线' },
    ] },
  ],
}

/* ---------- 评分等级默认配置（7.3） ---------- */
export const GRADE_PRESETS: Record<ReportType, ScoreGrade[]> = {
  info_verify: [
    { grade: '优', label: '信用良好', minScore: 80, maxScore: 100, riskLevel: '低', color: '#10B981', description: '信用良好，违约风险较低' },
    { grade: '良', label: '信用一般', minScore: 60, maxScore: 79, riskLevel: '中', color: '#F59E0B', description: '信用一般，需关注个别项' },
    { grade: '差', label: '信用较差', minScore: 0, maxScore: 59, riskLevel: '高', color: '#EF4444', description: '信用较差，违约风险较高' },
  ],
  credit: [
    { grade: 'A', label: '优秀', minScore: 75, maxScore: 100, riskLevel: '低', color: '#10B981', description: '信用优秀，建议正常授信' },
    { grade: 'B', label: '良好', minScore: 60, maxScore: 74, riskLevel: '中', color: '#F59E0B', description: '信用良好，建议正常授信' },
    { grade: 'C', label: '一般', minScore: 45, maxScore: 59, riskLevel: '高', color: '#F97316', description: '信用一般，建议人工复核' },
    { grade: 'D', label: '较差', minScore: 0, maxScore: 44, riskLevel: '高', color: '#EF4444', description: '信用较差，建议拒绝授信' },
  ],
  fraud: [
    { grade: '极低', label: '极低风险', minScore: 0, maxScore: 19, riskLevel: '低', color: '#10B981', description: '极低风险，可正常通过' },
    { grade: '低', label: '低风险', minScore: 20, maxScore: 39, riskLevel: '低', color: '#10B981', description: '低风险，建议正常通过' },
    { grade: '中', label: '中风险', minScore: 40, maxScore: 59, riskLevel: '中', color: '#F59E0B', description: '中风险，建议人工复核' },
    { grade: '高', label: '高风险', minScore: 60, maxScore: 79, riskLevel: '高', color: '#F97316', description: '高风险，建议拒绝授信' },
    { grade: '极高', label: '极高风险', minScore: 80, maxScore: 100, riskLevel: '极高', color: '#EF4444', description: '极高风险，强烈建议拒绝并加入黑名单' },
  ],
  decision: [
    { grade: '优先通过', label: '优先通过', minScore: 80, maxScore: 100, riskLevel: '低', color: '#10B981', description: '综合风险极低，建议优先授信' },
    { grade: '通过', label: '通过', minScore: 60, maxScore: 79, riskLevel: '低', color: '#10B981', description: '综合风险低，建议正常授信' },
    { grade: '限制额度', label: '限制额度', minScore: 40, maxScore: 59, riskLevel: '中', color: '#F59E0B', description: '综合风险中等，建议限制额度' },
    { grade: '严格限制', label: '严格限制', minScore: 20, maxScore: 39, riskLevel: '高', color: '#F97316', description: '综合风险较高，建议严格限制' },
    { grade: '拒绝', label: '拒绝', minScore: 0, maxScore: 19, riskLevel: '高', color: '#EF4444', description: '综合风险高，建议拒绝授信' },
  ],
}

/* ---------- 业务流程默认映射（8.4 / 8.5 + 同构推导） ---------- */
export const FLOW_PRESETS: Record<ReportType, BusinessFlowConfig[]> = {
  fraud: [
    { gradeId: '—', autoDecision: '处理中', manualStatus: '核验计算中', suggestionText: '系统正在计算评分，请稍候…', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: '极低', autoDecision: '通过', manualStatus: '待确认', suggestionText: '极低风险，建议正常通过', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm'] },
    { gradeId: '低', autoDecision: '通过', manualStatus: '待确认', suggestionText: '低风险，建议正常通过', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm'] },
    { gradeId: '中', autoDecision: '预警', manualStatus: '待审核', suggestionText: '中风险，建议人工复核后决策', creditLimitRatio: 70, needManualReview: true, reviewLevel: '双人复核', allowedActions: ['view', 'submit_dual_review', 'add_note'] },
    { gradeId: '高', autoDecision: '拒绝', manualStatus: '待确认', suggestionText: '高风险，建议拒绝授信', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm', 'force_review'] },
    { gradeId: '极高', autoDecision: '拒绝', manualStatus: '待确认', suggestionText: '极高风险，强烈建议拒绝并加入黑名单', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm', 'add_blacklist'] },
  ],
  credit: [
    { gradeId: '—', autoDecision: '处理中', manualStatus: '—', suggestionText: '系统正在计算评分…', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: 'A', autoDecision: '通过', manualStatus: '—', suggestionText: '信用优秀，建议正常授信', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: 'B', autoDecision: '通过', manualStatus: '—', suggestionText: '信用良好，建议正常授信', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: 'C', autoDecision: '预警', manualStatus: '待审核', suggestionText: '信用一般，建议人工复核', creditLimitRatio: 70, needManualReview: true, reviewLevel: '双人复核', allowedActions: ['view', 'manual_review', 'return_material'] },
    { gradeId: 'D', autoDecision: '拒绝', manualStatus: '—', suggestionText: '信用较差，建议拒绝授信', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
  ],
  info_verify: [
    { gradeId: '—', autoDecision: '处理中', manualStatus: '核验计算中', suggestionText: '系统正在计算信用值，请稍候…', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: '优', autoDecision: '通过', manualStatus: '待确认', suggestionText: '信用良好，建议正常授信', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm'] },
    { gradeId: '良', autoDecision: '预警', manualStatus: '待审核', suggestionText: '信用一般，建议人工复核后决策', creditLimitRatio: 70, needManualReview: true, reviewLevel: '双人复核', allowedActions: ['view', 'submit_dual_review', 'add_note'] },
    { gradeId: '差', autoDecision: '拒绝', manualStatus: '待确认', suggestionText: '信用较差，建议拒绝授信', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm', 'force_review'] },
  ],
  decision: [
    { gradeId: '—', autoDecision: '处理中', manualStatus: '核验计算中', suggestionText: '系统正在生成综合决策，请稍候…', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: '优先通过', autoDecision: '通过', manualStatus: '待确认', suggestionText: '综合风险极低，建议优先授信', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm'] },
    { gradeId: '通过', autoDecision: '通过', manualStatus: '待确认', suggestionText: '综合风险低，建议正常授信', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm'] },
    { gradeId: '限制额度', autoDecision: '预警', manualStatus: '待审核', suggestionText: '综合风险中等，建议限制额度并人工复核', creditLimitRatio: 60, needManualReview: true, reviewLevel: '双人复核', allowedActions: ['view', 'submit_dual_review', 'add_note'] },
    { gradeId: '严格限制', autoDecision: '拒绝', manualStatus: '待确认', suggestionText: '综合风险较高，建议严格限制并拒绝授信', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm', 'force_review'] },
    { gradeId: '拒绝', autoDecision: '拒绝', manualStatus: '待确认', suggestionText: '综合风险高，建议拒绝授信', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm', 'add_blacklist'] },
  ],
}

/* ---------- 主题预设（9.2） ---------- */
export const THEME_PRESETS: Record<'标准蓝' | '专业灰' | '政务红' | '极简白', { primaryColor: string; passColor: string; warningColor: string; rejectColor: string }> = {
  标准蓝: { primaryColor: '#3B82F6', passColor: '#10B981', warningColor: '#F59E0B', rejectColor: '#EF4444' },
  专业灰: { primaryColor: '#64748B', passColor: '#059669', warningColor: '#D97706', rejectColor: '#DC2626' },
  政务红: { primaryColor: '#DC2626', passColor: '#16A34A', warningColor: '#CA8A04', rejectColor: '#B91C1C' },
  极简白: { primaryColor: '#0F172A', passColor: '#10B981', warningColor: '#F59E0B', rejectColor: '#EF4444' },
}
export const THEME_LIST = ['标准蓝', '专业灰', '政务红', '极简白'] as const

/* ---------- 预览样例状态（11.2） ---------- */
export const PREVIEW_STATES: Record<ReportType, { key: string; label: string; score: number }[]> = {
  info_verify: [
    { key: 'pass', label: '通过', score: 88 },
    { key: 'warning', label: '预警', score: 66 },
    { key: 'reject', label: '拒绝', score: 40 },
  ],
  credit: [
    { key: 'A', label: 'A级', score: 88 },
    { key: 'B', label: 'B级', score: 70 },
    { key: 'C', label: 'C级', score: 50 },
    { key: 'D', label: 'D级', score: 30 },
  ],
  fraud: [
    { key: '1', label: '极低', score: 10 },
    { key: '2', label: '低', score: 30 },
    { key: '3', label: '中', score: 50 },
    { key: '4', label: '高', score: 70 },
    { key: '5', label: '极高', score: 90 },
  ],
  decision: [
    { key: '1', label: '优先通过', score: 90 },
    { key: '2', label: '通过', score: 70 },
    { key: '3', label: '限制额度', score: 50 },
    { key: '4', label: '严格限制', score: 30 },
    { key: '5', label: '拒绝', score: 10 },
  ],
}

/* ---------- 工具函数 ---------- */
export function gradeForScore(t: ReportTemplate, score: number): ScoreGrade {
  const g = t.scoreDisplay.grades.find((x) => score >= x.minScore && score <= x.maxScore)
  return g ?? t.scoreDisplay.grades[t.scoreDisplay.grades.length - 1]
}

function buildSections(type: ReportType): SectionConfig[] {
  return SECTION_CATALOG[type].map((s, i) => ({
    id: s.id,
    name: s.name,
    order: i + 1,
    visible: true,
    fields: s.fields.map((f) => ({ id: f.id, name: f.name, visible: true })),
  }))
}

function defaultTheme(): ThemeConfig {
  return {
    preset: '标准蓝',
    primaryColor: '#3B82F6',
    passColor: '#10B981',
    warningColor: '#F59E0B',
    rejectColor: '#EF4444',
    spacing: '标准',
    fontSize: '标准',
    tableStyle: '线框表',
    borderRadius: '小圆角',
    headerStyle: '标准',
  }
}

function defaultExport(): ExportConfig {
  return {
    formats: ['PDF', 'Word'],
    defaultFormat: 'PDF',
    pdfHeader: '{模板名称}',
    pdfFooter: '第 {page} 页 / 共 {total} 页',
    watermark: { enabled: false, text: '内部机密', opacity: 10 },
    wordStyle: '与页面一致',
    excelSplitSheet: true,
    exportScope: '完整报告',
    includeOpLogs: true,
    includeSignature: false,
    signatureTemplate: undefined,
  }
}

export interface BuildOpts {
  id: string
  name: string
  status: TplStatus
  scope: string[]
  isDefault?: boolean
  description?: string
  version?: string
  lastEditor?: string
  lastEditTime?: string
}

export function buildTemplate(type: ReportType, o: BuildOpts): ReportTemplate {
  return {
    id: o.id,
    name: o.name,
    reportType: type,
    scope: o.scope,
    status: o.status,
    isDefault: o.isDefault ?? false,
    description: o.description ?? '',
    version: o.version ?? 'V1.0',
    lastEditor: o.lastEditor ?? 'admin',
    lastEditTime: o.lastEditTime ?? '刚刚',
    sections: buildSections(type),
    scoreDisplay: {
      displayComponent: '大数字',
      showDescription: true,
      showThresholdBar: true,
      showComponents: true,
      showRiskTags: true,
      grades: GRADE_PRESETS[type].map((g) => ({ ...g })),
    },
    businessFlow: FLOW_PRESETS[type].map((f) => ({ ...f, allowedActions: [...f.allowedActions] })),
    theme: defaultTheme(),
    export: defaultExport(),
    changeLogs: [
      { version: o.version ?? 'V1.0', action: '创建', operator: o.lastEditor ?? 'admin', timestamp: o.lastEditTime ?? '刚刚', summary: `创建「${o.name}」` },
    ],
  }
}

/* ---------- 种子数据（对应文档卡片示例） ---------- */
export const seedReportTemplates: ReportTemplate[] = [
  buildTemplate('info_verify', {
    id: 'tpl-info-standard', name: '标准信息核验报告模板', status: '已启用', scope: ['全产品'],
    isDefault: true, version: 'V2.1', lastEditor: 'admin', lastEditTime: '今天', description: '信息核验报告标准展示模板，覆盖全部 7 个分段。',
  }),
  buildTemplate('credit', {
    id: 'tpl-credit-loan', name: '信用贷信用风控报告模板', status: '已启用', scope: ['信用贷'],
    version: 'V1.3', lastEditor: '主管', lastEditTime: '3天前', description: '面向信用贷客群的信用风控报告模板。',
  }),
  buildTemplate('fraud', {
    id: 'tpl-fraud-standard', name: '欺诈识别标准模板', status: '草稿', scope: ['全产品'],
    version: 'V1.0', lastEditor: 'admin', lastEditTime: '刚刚', description: '欺诈识别报告草稿模板，待配置后启用。',
  }),
  buildTemplate('decision', {
    id: 'tpl-decision-standard', name: '决策报告综合模板', status: '已停用', scope: ['全产品'],
    version: 'V1.2', lastEditor: 'admin', lastEditTime: '1周前', description: '整合三大报告的综合决策报告模板，当前已停用。',
  }),
]
