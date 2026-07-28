/* ============================================================================
 * 报告模板配置 · 数据模型与种子数据（可用性重构版）
 * 对应文档：SaaS/doc/报告模板配置页功能设计.md
 * 统一管理「信息核验 / 信用风控 / 欺诈识别 / 决策报告」四大报告的展示模板。
 *
 * 本次重构要点：
 *  1. 分段 / 字段增加业务说明（desc），让配置者看得懂"在配什么、勾掉会怎样"。
 *  2. 信息核验评分改为"危险度"语义（越高越危险），颜色方向翻正。
 *  3. 业务流程（businessFlow）与评分等级（grades）按 index 显式联动：
 *     第 0 行固定为"计算中"，其后每一行对应 grades[i]，改名/增删等级自动跟随。
 *  4. 新增 PREVIEW_SAMPLE 样例数据字典，供右侧"实时预览"真实渲染报告长相。
 * ========================================================================== */

/* ---------- 基础类型 ---------- */
export type ReportType = 'info_verify' | 'credit' | 'fraud' | 'decision'
export type TplStatus = '草稿' | '已启用' | '已停用'
export type RiskLevel = '低' | '中' | '高' | '极高'
export type DisplayComponent = '大数字' | '环形图' | '进度条' | '仪表盘'
export type AutoDecision = '通过' | '预警' | '拒绝' | '处理中'
export type ManualStatus = '—' | '待确认' | '待审核' | '核验计算中'
export type ReviewLevel = '单人复核' | '双人复核' | '初审+终审两级'

/* 分段来源类型：每块来源单一（与用户首填/接口调用/规则集碰撞一一对应） */
export type SectionSource = 'data_source' | 'api' | 'rule_set'
export const SECTION_SOURCE_LABEL: Record<SectionSource, string> = {
  data_source: '数据源',
  api: '接口调用',
  rule_set: '规则集',
}

/* ============================================================================
 * 字段「呈现容器」与「接口字段类型」
 * - RenderContainer：决定前端用哪种对象/组件渲染该字段值（文本/图片/文件/标签组/链接/表格）
 * - ApiFieldType：接口返回字段的数据域类型（比 DB 列类型更偏业务/前端），含 image/file 等
 * 这两项都需在前端「配置来源」弹窗里配置：标签(显示名) + 容器。
 * ========================================================================== */
export type RenderContainer = 'text' | 'image' | 'file' | 'tags' | 'link' | 'table' | 'video'
export const RENDER_CONTAINER_LABEL: Record<RenderContainer, string> = {
  text: '文本', image: '图片', file: '文件', tags: '标签组', link: '链接', table: '表格', video: '视频',
}
export type ApiFieldType = 'string' | 'number' | 'enum' | 'boolean' | 'date' | 'image' | 'file' | 'json' | 'video'
export const API_FIELD_TYPE_LABEL: Record<ApiFieldType, string> = {
  string: '文本 string', number: '数值 number', enum: '枚举 enum', boolean: '布尔 boolean',
  date: '日期 date', image: '图片 image', file: '文件 file', json: '结构 json', video: '视频 video',
}
/* 接口字段类型 → 默认显示方式（推荐值，可被显式配置覆盖） */
export function defaultContainer(t: ApiFieldType): RenderContainer {
  if (t === 'image') return 'image'
  if (t === 'file') return 'file'
  if (t === 'video') return 'video'
  if (t === 'json') return 'table'
  if (t === 'enum' || t === 'boolean') return 'tags'
  return 'text'
}
/* 接口输出字段容器推断（按字段名/说明语义）：视频/活体→视频，影像/图片→图片，文本/OCR→文本，其余交默认 */
export function inferApiContainer(name: string, desc: string): RenderContainer | undefined {
  const t = `${name} ${desc}`
  if (/文本|文字|ocr/i.test(t)) return undefined
  if (/视频|活体|录像|mp4/i.test(t)) return 'video'
  if (/影像|图片|照片|证照|头像|面/i.test(t)) return 'image'
  return undefined
}
/* DB 列类型 → 推荐显示方式（用户可改） */
export function recommendDbContainer(dbType: string): RenderContainer {
  if (/image|img|pic|头像|照片|证照|影像/.test(dbType)) return 'image'
  if (/file|附件|pdf|影像|文档/.test(dbType)) return 'file'
  if (/json|clob|longtext|text\(/.test(dbType)) return 'table'
  return 'text'
}

/* 脱敏规则：决定该字段在报告里以何种方式脱敏 */
export type MaskRule = 'none' | 'phone' | 'idcard' | 'bank' | 'name'
export const MASK_RULE_LABEL: Record<MaskRule, string> = {
  none: '不脱敏', phone: '手机号', idcard: '身份证', bank: '银行卡', name: '姓名',
}
export function autoMaskRule(name: string): MaskRule {
  if (/身份证|证件/.test(name)) return 'idcard'
  if (/手机/.test(name)) return 'phone'
  if (/银行卡|卡号/.test(name)) return 'bank'
  if (/姓名/.test(name)) return 'name'
  return 'none'
}

/* 风险等级（规则集字段用） */
export type Severity = 'low' | 'mid' | 'high' | 'critical'
export const SEVERITY_LABEL: Record<Severity, string> = {
  low: '低', mid: '中', high: '高', critical: '极高',
}
/* 数值对齐方式（接口数值字段用） */
export type Align = 'left' | 'center' | 'right'
export const ALIGN_LABEL: Record<Align, string> = { left: '左对齐', center: '居中', right: '右对齐' }

export interface FieldConfig {
  id: string
  name: string
  desc: string
  visible: boolean
  /* —— 来源相关配置（按所属分段的 sourceType 解释） —— */
  sourceRef?: string    // 数据源：绑定的表字段名 / 接口：输出字段 key / 规则集：规则 id
  mask?: boolean         // 数据源类：是否脱敏（兼容旧值；优先看 maskRule）
  maskRule?: MaskRule    // 数据源类：脱敏规则（不脱敏/手机号/身份证/银行卡/姓名）
  weight?: number        // 规则集类：权重（影响风险累计）
  severity?: Severity    // 规则集类：风险等级
  hitText?: string      // 规则集类：命中时显示
  missText?: string     // 规则集类：未命中显示
  hitReject?: boolean   // 规则集类：命中即拒（该条规则命中即整笔申请拒绝）
  /* 计分（每条展示项可独立参与本卡总分） */
  scoreMode?: 'add' | 'deduct'   // 加分 / 扣分（默认 deduct：规则命中即扣分）
  scorePoints?: number             // 加 / 扣 的分值
  condType?: FieldCondType        // 计分条件：规则=命中；字段=空/非空/大于/小于/等于/正则
  condValue?: string              // 条件值（gt/lt/eq/regex 使用；empty/notEmpty/hit 不用）
}
/* 展示项计分条件类型 */
export type FieldCondType = 'hit' | 'empty' | 'notEmpty' | 'gt' | 'lt' | 'eq' | 'regex'
export const FIELD_COND_LABEL: Record<FieldCondType, string> = {
  hit: '命中', empty: '为空', notEmpty: '非空', gt: '大于', lt: '小于', eq: '等于', regex: '正则',
}

/* 数据源（用户首填）连接配置：配真实库连接，字段从表里"读出来"只能显隐 */
/* 读取表结构后得到的字段：列名 + DB 列类型 + 是否展示 + 报告显示名(可选) + 显示方式(可选) + 脱敏规则(可选) */
export interface DbField {
  name: string
  type: string           // DB 列类型，读取表结构时填充（varchar/int/datetime/decimal…）
  visible: boolean
  label?: string         // 报告中显示名（默认 = name）
  container?: RenderContainer  // 报告中如何呈现（默认按列类型推荐，可改）
  maskRule?: MaskRule    // 脱敏规则（默认按字段名自动识别）
  remark?: string        // 字段说明/备注（可选）
  /* 计分（数据字段可按条件参与本卡总分） */
  scoreMode?: 'add' | 'deduct'
  scorePoints?: number
  condType?: FieldCondType
  condValue?: string
}
export interface DataSourceConfig {
  dbType: string        // MySQL / PostgreSQL / Oracle
  ip: string
  port: string
  username: string
  password: string
  database: string
  table: string
  /* 读取表结构后得到的字段（列名 + 类型 + 是否展示 + 配置项）；字段来自表，不可凭空新增 */
  tableFields: DbField[]
}
/* 接口（模型/API 调用）配置：配 API 地址 + 访问的用户信息（输入）+ 返回值（输出） */
export interface ApiParam {
  key: string          // 参数名（Param key）
  from: string         // 数据来自（如：进件表单.申请人ID）
  required: boolean    // 是否必填
}
export interface ApiHeader {
  key: string          // 请求头名（如 Authorization / Content-Type）
  value: string        // 请求头值
}
export interface ApiOutput {
  key: string          // 输出字段 key
  label: string        // 报告中的显示名（标签）
  type: ApiFieldType   // 数据域类型（string/number/enum/boolean/date/image/file/json）
  visible?: boolean     // 是否在报告中展示
  container?: RenderContainer  // 报告中显示方式（默认按 type 推荐，可改）
  unit?: string         // 单位/后缀（如 元 / % / 分）
  precision?: number    // 小数位（number 类型用）
  align?: Align         // 数值对齐方式（默认 右对齐）
  /* 计分（接口输出字段可按条件参与本卡总分） */
  scoreMode?: 'add' | 'deduct'
  scorePoints?: number
  condType?: FieldCondType
  condValue?: string
}
/* 接口（API 调用）配置：参考 Postman 的请求结构 ——
   方法 + 地址 + 请求头 + 参数 + 请求体；并支持直接粘贴「统一代码」（cURL / 类 HTTP 请求）一键解析填充 */
export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
export type ApiBodyType = 'none' | 'json' | 'form' | 'urlencoded'
export interface ApiConfig {
  url: string
  method: ApiMethod
  headers: ApiHeader[]      // 请求头（Headers）
  inputs: ApiParam[]        // Params（访问的用户基本信息 / 查询参数）
  bodyType: ApiBodyType     // 请求体类型
  bodyText: string          // 请求体原始内容（json 模板 / form 键值 / urlencoded）
  outputs: ApiOutput[]      // 返回值（输出）
}
/* 解析「统一代码」（cURL / 类 HTTP 请求串）为接口配置片段，
   让用户既可逐项手填、也可直接粘贴代码一键填充 */
export function parseCurl(code: string): Partial<ApiConfig> {
  const out: Partial<ApiConfig> = {}
  const txt = code.trim().replace(/\r/g, ' ')
  // 切词：保留被引号包裹的整体（含空格），其余按空白切
  const tokens = txt.replace(/^curl\b/i, '').match(/(['"])(?:\\.|[^'"\\])*\1|\S+/g) ?? []
  const cleaned: string[] = []
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (t.startsWith('-')) {
      const nxt = tokens[i + 1]
      if (nxt && !nxt.startsWith('-')) i++ // 跳过 flag 跟随的值
      continue
    }
    cleaned.push(t)
  }
  const urlTok = cleaned[0]
  if (urlTok) out.url = urlTok.replace(/^(['"])([\s\S]*)\1$/, '$2')
  // 方法：-X POST / --request PUT
  const xm = /(?:-X|--request)\s+(\w+)/i.exec(txt)
  if (xm) out.method = xm[1].toUpperCase() as ApiMethod
  // 请求头：-H 'K: V' / --header 'K: V'
  const headers: ApiHeader[] = []
  const hRe = /(?:-H|--header)\s+(['"]?)([^\n'"]+?)\1/g
  let hm: RegExpExecArray | null
  while ((hm = hRe.exec(txt))) {
    const kv = hm[2].split(/:\s*/)
    if (kv.length >= 2) headers.push({ key: kv[0].trim(), value: kv.slice(1).join(':').trim() })
  }
  if (headers.length) out.headers = headers
  // 请求体：-d / --data / --data-raw / --data-urlencode
  const dM = /(?:--data-raw|--data-urlencode|--data|-d)\s+(['"]?)([\s\S]*?)\1(?=\s+-|$)/.exec(txt)
  if (dM) {
    const body = dM[2].trim()
    out.bodyText = body
    out.bodyType = /^[\[{]/.test(body) ? 'json' : 'urlencoded'
    if (!xm) out.method = 'POST'
  }
  if (!out.method) out.method = 'GET'
  return out
}
/* 由当前接口配置生成可复制的 cURL 代码（「代码」Tab 的预览 / 导出） */
export function buildCurl(api?: ApiConfig): string {
  if (!api) return ''
  const lines: string[] = [`curl -X ${api.method} '${api.url}'`]
  for (const h of api.headers ?? []) lines.push(`  -H '${h.key}: ${h.value}'`)
  if (api.bodyType !== 'none' && api.bodyText.trim()) {
    const escaped = api.bodyText.trim().replace(/'/g, "'\\''")
    lines.push(`  -d '${escaped}'`)
  }
  return lines.join(' \\\n')
}

/* 规则集（系统内已配置的规则合集）：选合集后对其规则项"用/不用" */
export interface RuleSetItem { id: string; name: string; desc: string }
export interface RuleSet { id: string; name: string; rules: RuleSetItem[] }

/** 按各展示项计分配置，汇总本卡总分（假设条件满足时的计分；命中即拒项不计入）。 */
export function computeSectionScore(s: SectionConfig): { total: number; addCount: number; deductCount: number } {
  let total = 0, addCount = 0, deductCount = 0
  for (const f of s.fields) {
    if (!f.visible || f.hitReject) continue
    const pts = f.scorePoints ?? 0
    if ((f.scoreMode ?? 'deduct') === 'add') { total += pts; addCount++ } else { total -= pts; deductCount++ }
  }
  return { total, addCount, deductCount }
}

export interface SectionConfig {
  id: string
  name: string
  desc: string
  order: number
  visible: boolean
  sourceType: SectionSource
  homeTab?: 'content' | 'score' | 'flow' | 'log'  // 该段归属的编辑 Tab：'content'=报告内容配置；'score'=评分方案（如得分计算）；'flow'=审核操作（如结论与终审）；'log'=操作日志，由模板 showOpLog 开关控制，不在任何 Tab 编辑
  sourceName?: string   // 数据源名 / 接口名 / 规则集名
  ds?: DataSourceConfig      // sourceType === 'data_source'
  api?: ApiConfig            // sourceType === 'api'
  ruleSetId?: string        // sourceType === 'rule_set'，选中的规则合集 id
  fields: FieldConfig[]     // 展示项：数据源=表字段 / 接口=输出字段 / 规则集=规则项（用/不用）
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
export interface ScoreComponent {
  name: string      // 构成项名称（如 设备群控 / 黑名单命中 / 身份）
  weight: number    // 权重（0-100），所有项合计应为 100
}
export interface ScoreDisplayConfig {
  displayComponent: DisplayComponent
  showDescription: boolean
  showThresholdBar: boolean
  showComponents: boolean
  showRiskTags: boolean
  grades: ScoreGrade[]
  components: ScoreComponent[]   // 总分计算方式：各构成项权重（加权求和得总分），合计应为 100
}

/* 总分计算方式（加权构成）默认权重预设：各项加权求和得到报告顶部总分 */
export const SCORE_COMPONENTS_PRESETS: Record<ReportType, ScoreComponent[]> = {
  info_verify: [
    { name: '设备群控', weight: 35 },
    { name: '黑名单命中', weight: 30 },
    { name: '资料异常', weight: 20 },
    { name: '行为异常', weight: 15 },
  ],
  credit: [
    { name: '身份', weight: 20 },
    { name: '还款', weight: 25 },
    { name: '信用历史', weight: 25 },
    { name: '行为', weight: 10 },
    { name: '设备', weight: 10 },
    { name: '关联', weight: 10 },
  ],
  fraud: [
    { name: '设备关联', weight: 30 },
    { name: '团伙欺诈', weight: 25 },
    { name: '黑名单', weight: 25 },
    { name: '资料造假', weight: 20 },
  ],
  decision: [
    { name: '信息核验异常值', weight: 34 },
    { name: '信用评分', weight: 33 },
    { name: '欺诈评分', weight: 33 },
  ],
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
  action: '创建' | '编辑' | '启用' | '停用' | '复制' | '删除' | '发布'
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
  scoreBlock: { show: boolean; title: string }   // 评分方案 Tab → 报告内「得分计算」卡片：是否显示 + 报告内卡片标题
  flowBlock: { show: boolean; title: string }   // 审核操作 Tab → 报告内「结论与终审」卡片：是否显示 + 报告内卡片标题
  showOpLog: boolean        // 报告中是否显示操作日志（'log' 类分段的总开关）
  scoreDisplay: ScoreDisplayConfig
  businessFlow: BusinessFlowConfig[]
  theme: ThemeConfig
  export: ExportConfig
  changeLogs: TemplateChangeLog[]
}

/* ---------- 报告类型元信息 ---------- */
export const REPORT_META: Record<ReportType, { icon: string; label: string; color: 'blue' | 'cyan' | 'violet' | 'green'; hint: string }> = {
  info_verify: { icon: '📋', label: '信息核验', color: 'blue', hint: '核验申请人身份、资料与设备真实性，输出异常值（越高越危险）' },
  credit: { icon: '📊', label: '信用风控', color: 'cyan', hint: '基于六维数据评估信用评分（越高越好），给出授信建议' },
  fraud: { icon: '🛡️', label: '欺诈识别', color: 'violet', hint: '识别身份/设备/行为/团伙欺诈，输出欺诈分（越高越危险）' },
  decision: { icon: '🧭', label: '决策报告', color: 'green', hint: '融合三大报告给出综合决策建议' },
}

/* ---------- 适用产品：大平台产品很多，分两级类目（类目 → 具体产品） ---------- */
export const PRODUCT_ALL = '全产品'

export interface ProductNode {
  id: string
  name: string
  children: { id: string; name: string }[]
}
export const PRODUCT_TREE: ProductNode[] = [
  {
    id: 'credit', name: '信用贷', children: [
      { id: 'credit-salary', name: '工薪贷' },
      { id: 'credit-fund', name: '公积金贷' },
      { id: 'credit-social', name: '社保贷' },
      { id: 'credit-edu', name: '学历贷' },
      { id: 'credit-merchant', name: '商户贷' },
    ],
  },
  {
    id: 'mortgage', name: '抵押贷', children: [
      { id: 'mortgage-house', name: '房产抵押贷' },
      { id: 'mortgage-car', name: '车辆抵押贷' },
      { id: 'mortgage-device', name: '设备抵押贷' },
    ],
  },
  {
    id: 'biz', name: '经营贷', children: [
      { id: 'biz-micro', name: '小微经营贷' },
      { id: 'biz-individual', name: '个体工商户贷' },
      { id: 'biz-supply', name: '供应链贷' },
    ],
  },
  {
    id: 'consume', name: '消费贷', children: [
      { id: 'consume-goods', name: '商品分期贷' },
      { id: 'consume-education', name: '教育分期贷' },
      { id: 'consume-medical', name: '医美分期贷' },
      { id: 'consume-travel', name: '旅游分期贷' },
    ],
  },
  {
    id: 'card', name: '信用卡', children: [
      { id: 'card-standard', name: '标准信用卡' },
      { id: 'card-gold', name: '金卡' },
      { id: 'card-platinum', name: '白金卡' },
    ],
  },
  {
    id: 'other', name: '其他', children: [
      { id: 'other-assist', name: '助农贷' },
      { id: 'other-policy', name: '保单贷' },
      { id: 'other-lease', name: '租赁贷' },
    ],
  },
]
/* 扁平叶子（带类目信息），供搜索下拉使用 */
export const PRODUCT_LEAVES: { id: string; name: string; catId: string; cat: string }[] = PRODUCT_TREE.flatMap((c) =>
  c.children.map((ch) => ({ id: ch.id, name: ch.name, catId: c.id, cat: c.name })),
)
/* scope 展示文案：全产品 / 单类 / 前 N 个 + 等 M 个 */
export function scopeLabel(scope: string[]): string {
  if (!scope || scope.length === 0) return '未设置'
  if (scope.includes(PRODUCT_ALL)) return PRODUCT_ALL
  if (scope.length === 1) return scope[0]
  if (scope.length <= 3) return scope.join('、')
  return scope.slice(0, 3).join('、') + ` 等${scope.length}个`
}


/* ---------- 可执行操作清单（业务中文） ---------- */
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

/* ---------- 分段与字段清单（含业务说明） ---------- */
export const SECTION_CATALOG: Record<ReportType, { id: string; name: string; desc: string; fields: { id: string; name: string; desc: string }[] }[]> = {
  info_verify: [
    {
      id: 'score_model', name: '得分计算', desc: '报告顶部的总风险值卡片：分数越大代表风险越高（0-100，≥80 为高危）。属于「评分方案」Tab，由已配置的数据源/规则集算得，不在「报告内容」里配来源。',
      fields: [
        { id: 'sv_big', name: '异常值大数字', desc: '顶部核心分数，如 82 分。勾掉则只保留等级标签' },
        { id: 'sv_denom', name: '满分分母', desc: '异常值的计算满分基准（固定 100）' },
        { id: 'sv_level', name: '风险档标签', desc: '如「高危」的彩色标签，颜色随档位变化' },
        { id: 'sv_threshold', name: '阈值刻度条', desc: '标注 安全/关注/警示/高危 四段的刻度条，指针指向当前分' },
        { id: 'sv_breakdown', name: '构成项分解表', desc: '异常值由哪些风险项累计构成（含权重与方向）' },
        { id: 'sv_total', name: '合计行', desc: '各构成项加权后的合计分' },
        { id: 'sv_rule', name: '判定规则文本', desc: '当前异常值对应的判定规则说明' },
        { id: 'sv_audit', name: '审计栏', desc: '模型版本、计算时间等可追溯信息' },
        { id: 'sv_weight', name: '查看权重明细按钮', desc: '打开弹窗查看各风险项打分权重' },
      ],
    },
    {
      id: 'conclusion_process', name: '结论与终审', desc: '系统自动结论 + 人工审核结果 + 终审操作入口，以及核验过程时间线。属于「审核操作」Tab，由已配置的数据源/规则集算得，不在「报告内容」里配来源。',
      fields: [
        { id: 'cp_system', name: '系统结果', desc: '机器自动给出的处置结论（通过/预警/拒绝）' },
        { id: 'cp_manual', name: '人工审核', desc: '当前人工审核状态（待确认/已确认等）' },
        { id: 'cp_operator', name: '操作人员', desc: '当前处理该件的审核员' },
        { id: 'cp_advice', name: '授信建议', desc: '系统给出的授信额度/利率建议' },
        { id: 'cp_reason', name: '建议理由', desc: '给出该建议的依据摘要' },
        { id: 'cp_pos', name: '正向因素', desc: '支持通过的有利点' },
        { id: 'cp_risk', name: '风险因素', desc: '导致预警/拒绝的风险点' },
        { id: 'cp_amount', name: '参考授信额度', desc: '建议可授予的额度上限' },
        { id: 'cp_ops', name: '操作按钮组', desc: '该状态下可执行的操作（如报告确认/强制复审）' },
        { id: 'cp_timeline', name: '核验过程时间线', desc: '从进件到当前的各步处理记录' },
        { id: 'cp_step_icon', name: '步骤图标', desc: '时间线每步的状态图标' },
        { id: 'cp_step_status', name: '步骤状态色', desc: '步骤通过/异常的颜色标识' },
        { id: 'cp_step_cost', name: '步骤耗时', desc: '每步处理花费的时间' },
      ],
    },
    {
      id: 'basic_info', name: '用户基本信息', desc: '申请人身份、联系方式与设备环境等基础资料。',
      fields: [
        { id: 'bi_name', name: '姓名', desc: '申请人姓名' },
        { id: 'bi_id', name: '身份证号', desc: '脱敏后的证件号' },
        { id: 'bi_phone', name: '手机号', desc: '申请所用手机号' },
        { id: 'bi_bank', name: '银行卡号', desc: '收款/绑定银行卡' },
        { id: 'bi_bank_branch', name: '开户行', desc: '银行卡归属支行' },
        { id: 'bi_age', name: '年龄', desc: '申请人年龄' },
        { id: 'bi_edu', name: '学历', desc: '最高学历' },
        { id: 'bi_company', name: '工作单位', desc: '任职单位' },
        { id: 'bi_income', name: '月收入', desc: '申报月收入' },
        { id: 'bi_address', name: '居住地址', desc: '常住地址' },
        { id: 'bi_marriage', name: '婚姻', desc: '婚姻状况' },
        { id: 'bi_fp', name: '设备指纹', desc: '本机设备指纹标识' },
        { id: 'bi_ip', name: 'IP地址', desc: '申请时 IP' },
        { id: 'bi_gps', name: 'GPS定位', desc: '申请时定位' },
        { id: 'bi_channel', name: '进件渠道', desc: '来自哪个渠道' },
        { id: 'bi_appver', name: 'APP版本', desc: '申请所用 App 版本' },
      ],
    },
    {
      id: 'id_images', name: '用户证件照', desc: '身份证、活体与银行卡等凭证影像及 OCR 文本。',
      fields: [
        { id: 'ii_front', name: '身份证人像面', desc: '身份证正面影像' },
        { id: 'ii_back', name: '身份证国徽面', desc: '身份证背面影像' },
        { id: 'ii_live', name: '活体人脸（视频）', desc: '活体检测采集' },
        { id: 'ii_bank', name: '银行卡', desc: '银行卡影像' },
        { id: 'ii_ocr', name: 'OCR识别文本', desc: '影像识别出的文字' },
      ],
    },
    {
      id: 'single_verify', name: '多源并行核验单项报告', desc: '公安、银行卡、运营商、设备、联防联控等各数据源的独立核验结果。',
      fields: [
        { id: 'sv_police', name: '公安实名（可独立隐藏）', desc: '公安身份实名核验结果' },
        { id: 'sv_bank4', name: '银行卡四要素（可独立隐藏）', desc: '姓名/卡号/证件/手机 四要素' },
        { id: 'sv_operator', name: '运营商实名（可独立隐藏）', desc: '运营商实名核验' },
        { id: 'sv_device', name: '终端设备（可独立隐藏）', desc: '设备真实性核验' },
        { id: 'sv_link', name: '联防联控（可独立隐藏）', desc: '跨机构联防结果' },
        { id: 'sv_head', name: '卡片头部', desc: '单项卡片标题区' },
        { id: 'sv_concl', name: '整体结论', desc: '该数据源整体结论' },
        { id: 'sv_cause', name: '结论原因', desc: '结论成因' },
        { id: 'sv_subfields', name: '子字段列表', desc: '该数据源返回的明细字段' },
        { id: 'sv_serial', name: '核验流水号', desc: '本次核验流水号' },
        { id: 'sv_time', name: '核验时间', desc: '核验发生时间' },
        { id: 'sv_channel', name: '调用渠道', desc: '调用该数据源的渠道' },
        { id: 'sv_cost', name: '调用耗时', desc: '接口耗时' },
      ],
    },
    {
      id: 'cross_fusion', name: '数据交叉融合综合报告', desc: '多源数据交叉比对后的综合风险结论与疑点明细。',
      fields: [
        { id: 'cf_head', name: '综合风险头部栏', desc: '交叉融合结论的头部区' },
        { id: 'cf_atom', name: '5项原子结论卡', desc: '各维度原子级结论' },
        { id: 'cf_doubt', name: '多源风险交叉疑点明细', desc: '跨源冲突/疑点清单' },
        { id: 'cf_abnormal', name: '异常值构成项分解', desc: '异常值的各项构成' },
        { id: 'cf_tags', name: '风险标签', desc: '命中风险标签' },
        { id: 'cf_rule', name: '判定规则文本', desc: '判定规则说明' },
        { id: 'cf_audit', name: '审计信息', desc: '溯源信息' },
        { id: 'cf_weight', name: '查看打分权重明细弹窗入口', desc: '打开权重弹窗' },
      ],
    },
    {
      id: 'op_logs', name: '单项核验全量操作日志', desc: '所有单项核验与报告级操作的时间线记录。',
      fields: [
        { id: 'ol_single', name: '单项操作记录', desc: '各数据源单项操作' },
        { id: 'ol_report', name: '报告级操作记录', desc: '报告整体操作' },
        { id: 'ol_timeline', name: '操作日志时间线', desc: '操作时间线' },
        { id: 'ol_attach', name: '附件列', desc: '操作附件' },
        { id: 'ol_review', name: '复核状态列', desc: '复核状态' },
      ],
    },
  ],
  credit: [
    {
      id: 'credit_score_overview', name: '信用评分总览', desc: '报告顶部的信用评分卡片：分数越高信用越好（0-100，A 为最优）。',
      fields: [
        { id: 'cso_ring', name: '环形评分图', desc: '以环形图展示 0-100 信用分' },
        { id: 'cso_level', name: '信用等级（A/B/C/D）', desc: '评级标签' },
        { id: 'cso_six', name: '六维评分条', desc: '身份/还款/信用历史/行为/设备/关联 六维条形' },
        { id: 'cso_tags', name: '风险标签', desc: '命中风险标签' },
        { id: 'cso_export', name: '导出报告按钮', desc: '导出入口' },
      ],
    },
    {
      id: 'credit_conclusion', name: '结论与终审操作卡', desc: '系统信用结论 + 人工审核 + 终审操作入口。',
      fields: [
        { id: 'cc_system', name: '系统结果', desc: '机器自动结论' },
        { id: 'cc_manual', name: '人工审核', desc: '人工审核状态' },
        { id: 'cc_operator', name: '操作人员', desc: '处理人' },
        { id: 'cc_advice', name: '授信建议', desc: '授信建议' },
        { id: 'cc_reason', name: '建议理由', desc: '建议依据' },
        { id: 'cc_pos', name: '正向因素', desc: '有利因素' },
        { id: 'cc_risk', name: '风险因素', desc: '风险点' },
        { id: 'cc_amount', name: '参考授信额度', desc: '建议额度' },
        { id: 'cc_ops', name: '操作按钮组', desc: '可执行操作' },
      ],
    },
    {
      id: 'applicant_info', name: '用户基本信息', desc: '申请人身份与基础资料。',
      fields: [
        { id: 'ai_name', name: '姓名', desc: '申请人姓名' },
        { id: 'ai_id', name: '身份证号', desc: '脱敏证件号' },
        { id: 'ai_phone', name: '手机号', desc: '手机号' },
        { id: 'ai_bank', name: '银行卡号', desc: '银行卡号' },
        { id: 'ai_bank_branch', name: '开户行', desc: '开户行' },
        { id: 'ai_age', name: '年龄', desc: '年龄' },
        { id: 'ai_edu', name: '学历', desc: '学历' },
        { id: 'ai_company', name: '工作单位', desc: '工作单位' },
        { id: 'ai_income', name: '月收入', desc: '月收入' },
        { id: 'ai_address', name: '居住地址', desc: '居住地址' },
        { id: 'ai_marriage', name: '婚姻', desc: '婚姻' },
        { id: 'ai_fp', name: '设备指纹', desc: '设备指纹' },
        { id: 'ai_ip', name: 'IP地址', desc: 'IP' },
        { id: 'ai_gps', name: 'GPS定位', desc: 'GPS' },
        { id: 'ai_channel', name: '进件渠道', desc: '渠道' },
        { id: 'ai_appver', name: 'APP版本', desc: 'App 版本' },
      ],
    },
    {
      id: 'risk_factors', name: '风险因子分析', desc: '六维评分卡片 + 维度说明（权重/逻辑/来源）。',
      fields: [
        { id: 'rf_cards', name: '6维评分卡片', desc: '身份/还款/信用历史/行为/设备/关联 六张卡片' },
        { id: 'rf_table', name: '维度说明表', desc: '各维度权重/逻辑/数据来源说明' },
      ],
    },
    {
      id: 'score_trend', name: '信用评分趋势', desc: '用户信用分近 7 月变化 vs 行业平均。',
      fields: [
        { id: 'st_svg', name: 'SVG折线图', desc: '用户 vs 行业 折线' },
        { id: 'st_text', name: '趋势分析文案', desc: '趋势解读文字' },
      ],
    },
    {
      id: 'risk_radar', name: '风险维度雷达图', desc: '当前六维风险 vs 行业平均雷达对比。',
      fields: [
        { id: 'rr_svg', name: 'SVG雷达图', desc: '当前 vs 行业 雷达' },
        { id: 'rr_text', name: '雷达图分析文案', desc: '雷达解读文字' },
      ],
    },
    {
      id: 'credit_suggestion', name: '风控决策建议', desc: '系统建议 + 正向/风险因素 + 决策按钮。',
      fields: [
        { id: 'cs_text', name: '系统建议文案', desc: '决策建议文字' },
        { id: 'cs_pos', name: '正向因素列表', desc: '有利因素' },
        { id: 'cs_risk', name: '风险因素列表', desc: '风险点' },
        { id: 'cs_ops', name: '4决策按钮', desc: '审核通过/拒绝授信/提交人工复核/退回补充材料' },
      ],
    },
    {
      id: 'history_records', name: '历史授信记录', desc: '该客户历史授信与逾期情况。',
      fields: [
        { id: 'hr_table', name: '历史授信记录表', desc: '时间/额度/期限/状态/逾期' },
      ],
    },
    {
      id: 'credit_logs', name: '风控操作日志', desc: '信用风控相关操作时间线。',
      fields: [
        { id: 'cl_timeline', name: '时间线日志', desc: '操作人/操作/时间/结果/备注' },
      ],
    },
  ],
  fraud: [
    {
      id: 'fraud_score_model', name: '欺诈风险评分模型卡', desc: '报告顶部的欺诈分卡片：分数越大欺诈风险越高（0-100，≥80 为极高）。',
      fields: [
        { id: 'fsm_big', name: '欺诈分大数字', desc: '核心欺诈分，如 88 分' },
        { id: 'fsm_level', name: '风险等级标签', desc: '极低/低/中/高/极高 标签' },
        { id: 'fsm_threshold', name: '阈值刻度条', desc: '五档刻度条，指针指向当前分' },
        { id: 'fsm_hit', name: '命中规则统计', desc: '命中 X/Y 条规则，占比 Z%' },
        { id: 'fsm_tags', name: '风险标签', desc: '设备群控/团伙欺诈/黑名单命中' },
        { id: 'fsm_version', name: '规则版本', desc: '当前反欺诈规则版本号' },
      ],
    },
    {
      id: 'disposal_bar', name: '处置建议与操作栏', desc: '风险等级 + 自动/人工处置结论 + 处置操作入口。',
      fields: [
        { id: 'db_level', name: '风险等级', desc: '欺诈风险等级' },
        { id: 'db_auto', name: '自动审核', desc: '机器自动审核结论' },
        { id: 'db_status', name: '处置状态', desc: '当前处置状态' },
        { id: 'db_operator', name: '处置人', desc: '处理人' },
        { id: 'db_ops', name: '处置按钮组', desc: '查看/报告确认/强制复审/加入黑名单等' },
        { id: 'db_advice', name: '处置建议文案', desc: '处置建议文字' },
      ],
    },
    {
      id: 'basic_info', name: '用户基本信息', desc: '申请人基础资料。',
      fields: [
        { id: 'fbi_name', name: '姓名', desc: '姓名' },
        { id: 'fbi_id', name: '身份证号', desc: '脱敏证件号' },
        { id: 'fbi_phone', name: '手机号', desc: '手机号' },
        { id: 'fbi_bank', name: '银行卡号', desc: '银行卡号' },
        { id: 'fbi_age', name: '年龄', desc: '年龄' },
        { id: 'fbi_channel', name: '进件渠道', desc: '渠道' },
      ],
    },
    {
      id: 'identity_fraud', name: '身份欺诈详情', desc: '冒用他人身份、证件伪造等命中规则明细。',
      fields: [
        { id: 'if_table', name: 'RuleTable', desc: '规则名称/命中条件/权重/状态/操作' },
        { id: 'if_detail', name: '查看详情', desc: '打开明细' },
        { id: 'if_exempt', name: '标记豁免', desc: '对该规则标记豁免' },
      ],
    },
    {
      id: 'info_forgery', name: '信息伪造详情', desc: '资料造假类命中规则（与身份欺诈不同数据源）。',
      fields: [
        { id: 'inf_table', name: 'RuleTable', desc: '同身份欺诈，不同数据源' },
        { id: 'inf_detail', name: '查看详情', desc: '打开明细' },
        { id: 'inf_exempt', name: '标记豁免', desc: '标记豁免' },
      ],
    },
    {
      id: 'device_fraud', name: '设备欺诈详情', desc: '群控、模拟器、Root/越狱等设备风险。',
      fields: [
        { id: 'df_fp', name: '设备指纹', desc: '设备指纹' },
        { id: 'df_type', name: '设备类型', desc: '机型' },
        { id: 'df_root', name: 'Root/越狱状态', desc: '是否 Root/越狱' },
        { id: 'df_emulator', name: '模拟器检测', desc: '是否模拟器' },
        { id: 'df_proxy', name: '代理/VPN检测', desc: '是否代理' },
        { id: 'df_rel_id', name: '设备关联身份数', desc: '该设备关联多少身份' },
        { id: 'df_rel_app', name: '设备关联申请数', desc: '该设备关联多少申请' },
        { id: 'df_first', name: '首次出现时间', desc: '首次出现' },
        { id: 'df_graph', name: '设备关联图谱', desc: '设备关联图谱' },
      ],
    },
    {
      id: 'behavior_fraud', name: '行为欺诈详情', desc: '填写速度、停留、操作轨迹等异常行为。',
      fields: [
        { id: 'bf_cost', name: '申请耗时', desc: '总耗时' },
        { id: 'bf_speed', name: '填写速度', desc: '填写快慢' },
        { id: 'bf_stay', name: '页面停留', desc: '停留时长' },
        { id: 'bf_track', name: '操作轨迹', desc: '操作轨迹' },
        { id: 'bf_gps', name: 'GPS定位', desc: 'GPS' },
        { id: 'bf_path', name: '操作路径', desc: '操作路径' },
        { id: 'bf_timeline', name: '行为轨迹时间线', desc: '行为时间线' },
      ],
    },
    {
      id: 'gang_fraud', name: '团伙欺诈详情', desc: '关联度、团伙规模与关联图谱。',
      fields: [
        { id: 'gf_tag', name: '团伙标签', desc: '团伙标签' },
        { id: 'gf_score', name: '关联度评分', desc: '关联度' },
        { id: 'gf_dim', name: '关联维度', desc: '关联维度' },
        { id: 'gf_nodes', name: '关联节点数', desc: '节点数' },
        { id: 'gf_scale', name: '团伙规模', desc: '规模' },
        { id: 'gf_case', name: '历史案件', desc: '历史案件' },
        { id: 'gf_graph', name: '关联图谱可视化', desc: '关联图谱' },
        { id: 'gf_list', name: '关联列表', desc: '关联列表' },
      ],
    },
    {
      id: 'blacklist_hit', name: '黑名单命中详情', desc: '命中内部/外部黑名单的明细。',
      fields: [
        { id: 'bh_type', name: '黑名单类型', desc: '黑类型' },
        { id: 'bh_field', name: '命中字段', desc: '命中字段' },
        { id: 'bh_source', name: '来源', desc: '来源' },
        { id: 'bh_reason', name: '原因', desc: '原因' },
        { id: 'bh_time', name: '命中时间', desc: '命中时间' },
        { id: 'bh_level', name: '等级', desc: '等级' },
        { id: 'bh_table', name: '命中记录表', desc: '命中记录' },
      ],
    },
    {
      id: 'history_fraud', name: '历史欺诈记录', desc: '该客户历史欺诈处置记录。',
      fields: [
        { id: 'hf_table', name: '历史欺诈记录表', desc: '时间/类型/等级/处理结果' },
      ],
    },
    {
      id: 'fraud_logs', name: '操作日志', desc: '欺诈识别操作时间线。',
      fields: [
        { id: 'fl_table', name: 'MergedOpTable', desc: '单项+报告级+时间线合并' },
      ],
    },
  ],
  decision: [
    {
      id: 'decision_overview', name: '综合决策总览', desc: '融合三大报告评分，给出综合风险等级与最终决策建议。',
      fields: [
        { id: 'do_three', name: '三大报告评分汇总', desc: '信用值/信用评分/欺诈分 汇总' },
        { id: 'do_level', name: '综合风险等级', desc: '综合等级' },
        { id: 'do_advice', name: '最终决策建议', desc: '最终建议' },
        { id: 'do_basis', name: '决策依据摘要', desc: '依据摘要' },
      ],
    },
    {
      id: 'verify_summary', name: '信息核验摘要', desc: '从信息核验报告摘录的关键结论。',
      fields: [
        { id: 'vs_concl', name: '信息核验结论摘要', desc: '结论摘要' },
        { id: 'vs_risk', name: '关键风险点', desc: '关键风险' },
        { id: 'vs_jump', name: '展开查看完整信息核验报告入口', desc: '跳转入口' },
      ],
    },
    {
      id: 'credit_summary', name: '信用风控摘要', desc: '从信用风控报告摘录的关键结论。',
      fields: [
        { id: 'cs2_concl', name: '信用风控结论摘要', desc: '结论摘要' },
        { id: 'cs2_risk', name: '关键风险点', desc: '关键风险' },
        { id: 'cs2_jump', name: '展开查看完整信用风控报告入口', desc: '跳转入口' },
      ],
    },
    {
      id: 'fraud_summary', name: '欺诈识别摘要', desc: '从欺诈识别报告摘录的关键结论。',
      fields: [
        { id: 'fs_concl', name: '欺诈识别结论摘要', desc: '结论摘要' },
        { id: 'fs_risk', name: '关键风险点', desc: '关键风险' },
        { id: 'fs_jump', name: '展开查看完整欺诈识别报告入口', desc: '跳转入口' },
      ],
    },
    {
      id: 'decision_suggestion', name: '最终决策建议', desc: '综合建议 + 因素汇总 + 决策按钮。',
      fields: [
        { id: 'ds_text', name: '综合建议文案', desc: '建议文字' },
        { id: 'ds_pos', name: '正向因素汇总', desc: '有利因素' },
        { id: 'ds_risk', name: '风险因素汇总', desc: '风险点' },
        { id: 'ds_ops', name: '决策按钮组', desc: '决策按钮' },
        { id: 'ds_amount', name: '授信额度建议', desc: '额度建议' },
      ],
    },
    {
      id: 'decision_logs', name: '综合操作日志', desc: '三大报告操作日志汇总时间线。',
      fields: [
        { id: 'dl_timeline', name: '三大报告操作日志汇总时间线', desc: '综合时间线' },
      ],
    },
  ],
}

/* ---------- 评分等级默认配置（方向语义已统一） ---------- */
export const GRADE_PRESETS: Record<ReportType, ScoreGrade[]> = {
  /* 信息核验：异常值，越高越危险 → 危险度语义 */
  info_verify: [
    { grade: '安全', label: '风险可控', minScore: 0, maxScore: 20, riskLevel: '低', color: '#10B981', description: '异常值处于低位，风险可控，建议正常通过' },
    { grade: '关注', label: '中等风险', minScore: 21, maxScore: 50, riskLevel: '中', color: '#F59E0B', description: '异常值中等，建议关注个别风险项' },
    { grade: '警示', label: '较高风险', minScore: 51, maxScore: 80, riskLevel: '高', color: '#F97316', description: '异常值较高，建议人工复核' },
    { grade: '高危', label: '极高风险', minScore: 81, maxScore: 100, riskLevel: '极高', color: '#EF4444', description: '异常值极高，强烈建议预警处置' },
  ],
  /* 信用风控：信用评分，越高越好 */
  credit: [
    { grade: 'A', label: '优秀', minScore: 75, maxScore: 100, riskLevel: '低', color: '#10B981', description: '信用优秀，建议正常授信' },
    { grade: 'B', label: '良好', minScore: 60, maxScore: 74, riskLevel: '中', color: '#F59E0B', description: '信用良好，建议正常授信' },
    { grade: 'C', label: '一般', minScore: 45, maxScore: 59, riskLevel: '高', color: '#F97316', description: '信用一般，建议人工复核' },
    { grade: 'D', label: '较差', minScore: 0, maxScore: 44, riskLevel: '高', color: '#EF4444', description: '信用较差，建议拒绝授信' },
  ],
  /* 欺诈识别：欺诈分，越高越危险 */
  fraud: [
    { grade: '极低', label: '极低风险', minScore: 0, maxScore: 19, riskLevel: '低', color: '#10B981', description: '极低风险，可正常通过' },
    { grade: '低', label: '低风险', minScore: 20, maxScore: 39, riskLevel: '低', color: '#10B981', description: '低风险，建议正常通过' },
    { grade: '中', label: '中风险', minScore: 40, maxScore: 59, riskLevel: '中', color: '#F59E0B', description: '中风险，建议人工复核' },
    { grade: '高', label: '高风险', minScore: 60, maxScore: 79, riskLevel: '高', color: '#F97316', description: '高风险，建议拒绝授信' },
    { grade: '极高', label: '极高风险', minScore: 80, maxScore: 100, riskLevel: '极高', color: '#EF4444', description: '极高风险，强烈建议拒绝并加入黑名单' },
  ],
  /* 决策报告：综合分，越高越好 */
  decision: [
    { grade: '优先通过', label: '优先通过', minScore: 80, maxScore: 100, riskLevel: '低', color: '#10B981', description: '综合风险极低，建议优先授信' },
    { grade: '通过', label: '通过', minScore: 60, maxScore: 79, riskLevel: '低', color: '#10B981', description: '综合风险低，建议正常授信' },
    { grade: '限制额度', label: '限制额度', minScore: 40, maxScore: 59, riskLevel: '中', color: '#F59E0B', description: '综合风险中等，建议限制额度' },
    { grade: '严格限制', label: '严格限制', minScore: 20, maxScore: 39, riskLevel: '高', color: '#F97316', description: '综合风险较高，建议严格限制' },
    { grade: '拒绝', label: '拒绝', minScore: 0, maxScore: 19, riskLevel: '高', color: '#EF4444', description: '综合风险高，建议拒绝授信' },
  ],
}

/* ---------- 业务流程默认映射（index 与 grades 对齐） ---------- */
export const FLOW_PRESETS: Record<ReportType, BusinessFlowConfig[]> = {
  /* 第 0 行固定为"计算中"，其后每一行对应 grades[i] */
  info_verify: [
    { gradeId: '—', autoDecision: '处理中', manualStatus: '核验计算中', suggestionText: '系统正在计算异常值，请稍候…', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: '安全', autoDecision: '通过', manualStatus: '待确认', suggestionText: '异常值低，建议正常通过', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm'] },
    { gradeId: '关注', autoDecision: '预警', manualStatus: '待审核', suggestionText: '异常值中等，建议人工复核后决策', creditLimitRatio: 70, needManualReview: true, reviewLevel: '双人复核', allowedActions: ['view', 'submit_dual_review', 'add_note'] },
    { gradeId: '警示', autoDecision: '预警', manualStatus: '待确认', suggestionText: '异常值较高，建议谨慎授信并人工复核', creditLimitRatio: 40, needManualReview: true, reviewLevel: '双人复核', allowedActions: ['view', 'report_confirm', 'force_review'] },
    { gradeId: '高危', autoDecision: '拒绝', manualStatus: '待确认', suggestionText: '异常值极高，强烈建议拒绝', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm', 'force_review'] },
  ],
  credit: [
    { gradeId: '—', autoDecision: '处理中', manualStatus: '—', suggestionText: '系统正在计算评分…', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: 'A', autoDecision: '通过', manualStatus: '—', suggestionText: '信用优秀，建议正常授信', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: 'B', autoDecision: '通过', manualStatus: '—', suggestionText: '信用良好，建议正常授信', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: 'C', autoDecision: '预警', manualStatus: '待审核', suggestionText: '信用一般，建议人工复核', creditLimitRatio: 70, needManualReview: true, reviewLevel: '双人复核', allowedActions: ['view', 'manual_review', 'return_material'] },
    { gradeId: 'D', autoDecision: '拒绝', manualStatus: '—', suggestionText: '信用较差，建议拒绝授信', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
  ],
  fraud: [
    { gradeId: '—', autoDecision: '处理中', manualStatus: '核验计算中', suggestionText: '系统正在计算评分，请稍候…', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view'] },
    { gradeId: '极低', autoDecision: '通过', manualStatus: '待确认', suggestionText: '极低风险，建议正常通过', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm'] },
    { gradeId: '低', autoDecision: '通过', manualStatus: '待确认', suggestionText: '低风险，建议正常通过', creditLimitRatio: 100, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm'] },
    { gradeId: '中', autoDecision: '预警', manualStatus: '待审核', suggestionText: '中风险，建议人工复核后决策', creditLimitRatio: 70, needManualReview: true, reviewLevel: '双人复核', allowedActions: ['view', 'submit_dual_review', 'add_note'] },
    { gradeId: '高', autoDecision: '拒绝', manualStatus: '待确认', suggestionText: '高风险，建议拒绝授信', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm', 'force_review'] },
    { gradeId: '极高', autoDecision: '拒绝', manualStatus: '待确认', suggestionText: '极高风险，强烈建议拒绝并加入黑名单', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核', allowedActions: ['view', 'report_confirm', 'add_blacklist'] },
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

/* ---------- 主题预设 ---------- */
export const THEME_PRESETS: Record<'标准蓝' | '专业灰' | '政务红' | '极简白', { primaryColor: string; passColor: string; warningColor: string; rejectColor: string }> = {
  标准蓝: { primaryColor: '#3B82F6', passColor: '#10B981', warningColor: '#F59E0B', rejectColor: '#EF4444' },
  专业灰: { primaryColor: '#64748B', passColor: '#059669', warningColor: '#D97706', rejectColor: '#DC2626' },
  政务红: { primaryColor: '#DC2626', passColor: '#16A34A', warningColor: '#CA8A04', rejectColor: '#B91C1C' },
  极简白: { primaryColor: '#0F172A', passColor: '#10B981', warningColor: '#F59E0B', rejectColor: '#EF4444' },
}
export const THEME_LIST = ['标准蓝', '专业灰', '政务红', '极简白'] as const

/* ---------- 预览样例状态（对应各报告真实档位） ---------- */
export const PREVIEW_STATES: Record<ReportType, { key: string; label: string; score: number }[]> = {
  info_verify: [
    { key: 'safe', label: '安全', score: 12 },
    { key: 'watch', label: '关注', score: 40 },
    { key: 'warn', label: '警示', score: 65 },
    { key: 'high', label: '高危', score: 90 },
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

/* ---------- 预览样例数据（让"实时预览"呈现报告真实长相） ---------- */
export const PREVIEW_SAMPLE: Record<ReportType, { scoreLabel: string; sections: Record<string, Record<string, string>> }> = {
  info_verify: {
    scoreLabel: '异常值',
    sections: {
      score_model: { sv_big: '82', sv_denom: '100', sv_level: '高危', sv_threshold: '≥80 高危', sv_breakdown: '设备群控 +35 / 黑名单命中 +30 / 资料异常 +17', sv_total: '82', sv_rule: '命中规则 ≥3 条且异常值 ≥80 判定高危', sv_audit: '模型 v2.1 · 2026-07-27 计算', sv_weight: '查看' },
      conclusion_process: { cp_system: '拒绝', cp_manual: '待确认', cp_operator: '初审：审核员 1', cp_advice: '拒绝授信', cp_reason: '异常值高危且命中黑名单', cp_pos: '无', cp_risk: '设备群控、黑名单命中', cp_amount: '0', cp_ops: '报告确认 / 强制复审', cp_timeline: '进件→多源核验→异常值计算', cp_step_icon: '⚠', cp_step_status: '异常', cp_step_cost: '1.2s' },
      basic_info: { bi_name: '张*', bi_id: '3201**********33', bi_phone: '138****6677', bi_bank: '6222********1234', bi_age: '34', bi_edu: '本科', bi_company: '**科技', bi_income: '2.5万', bi_marriage: '已婚' },
      id_images: { ii_front: '已采集', ii_back: '已采集', ii_live: '已采集', ii_bank: '已采集', ii_ocr: '姓名/证件号一致' },
      single_verify: { sv_police: '通过', sv_bank4: '通过', sv_operator: '通过', sv_device: '异常', sv_link: '命中 2 项', sv_head: '公安/银行卡/运营商/设备/联防', sv_concl: '设备异常', sv_cause: '设备关联多个申请', sv_subfields: '指纹/机型/关联数', sv_serial: 'V2026...', sv_time: '2026-07-27 14:02', sv_channel: 'API', sv_cost: '320ms' },
      cross_fusion: { cf_head: '综合风险：高危', cf_atom: '身份✓ 设备✗ 黑名单✗', cf_doubt: '同设备 3 笔申请', cf_abnormal: '设备群控 +35', cf_tags: '设备群控、黑名单命中', cf_rule: '交叉命中规则 R7', cf_audit: '融合 v1.4', cf_weight: '查看' },
      op_logs: { ol_single: '设备核验异常', ol_report: '生成报告', ol_timeline: '14:02 进件', ol_attach: '—', ol_review: '待复核' },
    },
  },
  credit: {
    scoreLabel: '信用评分',
    sections: {
      credit_score_overview: { cso_ring: 'B 70', cso_level: 'B', cso_six: '身份 82 / 还款 65 / 信用历史 70 / 行为 60 / 设备 75 / 关联 68', cso_tags: '稳定收入', cso_export: '导出' },
      credit_conclusion: { cc_system: '通过', cc_manual: '—', cc_operator: '初审：审核员 2', cc_advice: '授信 5 万', cc_reason: '信用良好', cc_pos: '收入稳定', cc_risk: '负债略高', cc_amount: '5 万', cc_ops: '审核通过' },
      applicant_info: { ai_name: '李*', ai_id: '4401**********21', ai_phone: '139****2233', ai_age: '29', ai_edu: '硕士', ai_company: '**软件', ai_income: '3 万', ai_marriage: '未婚' },
      risk_factors: { rf_cards: '六维卡片', rf_table: '身份20%/还款25%/信用历史25%/行为10%/设备10%/关联10%' },
      score_trend: { st_svg: '近 7 月：68→70→72→70→69→71→70', st_text: '平稳略升' },
      risk_radar: { rr_svg: '当前 vs 行业', rr_text: '还款维度低于行业' },
      credit_suggestion: { cs_text: '建议正常授信', cs_pos: '收入稳定、历史良好', cs_risk: '负债略高', cs_ops: '审核通过 / 拒绝授信 / 提交人工复核 / 退回补充材料' },
      history_records: { hr_table: '2024 授信 3 万 正常结清' },
      credit_logs: { cl_timeline: '14:10 初审通过' },
    },
  },
  fraud: {
    scoreLabel: '欺诈分',
    sections: {
      fraud_score_model: { fsm_big: '88', fsm_level: '极高', fsm_threshold: '≥80 极高', fsm_hit: '命中 8/15 条，占比 53%', fsm_tags: '设备群控、团伙欺诈、黑名单命中', fsm_version: '反欺诈规则 v3.2' },
      disposal_bar: { db_level: '极高', db_auto: '拒绝', db_status: '待确认', db_operator: '初审：审核员 1', db_ops: '报告确认 / 加入黑名单', db_advice: '强烈建议拒绝' },
      basic_info: { fbi_name: '王*', fbi_id: '5101**********44', fbi_phone: '137****8899', fbi_age: '41', fbi_channel: '渠道C' },
      identity_fraud: { if_table: '规则 R1 命中：证件号多人共用', if_detail: '查看', if_exempt: '标记豁免' },
      info_forgery: { inf_table: '规则 R4 命中：收入证明造假', inf_detail: '查看', inf_exempt: '标记豁免' },
      device_fraud: { df_fp: 'fp_9a2c', df_type: '安卓', df_root: '已 Root', df_emulator: '模拟器', df_proxy: '代理', df_rel_id: '关联 12 个身份', df_rel_app: '关联 30 笔申请', df_first: '2026-07-20', df_graph: '关联图谱' },
      behavior_fraud: { bf_cost: '38s', bf_speed: '极快', bf_stay: '短', bf_track: '异常', bf_gps: '多地跳动', bf_path: '直奔提交', bf_timeline: '行为轨迹' },
      gang_fraud: { gf_tag: '团伙 T-07', gf_score: '92', gf_dim: '设备/手机号', gf_nodes: '18', gf_scale: '中', gf_case: '历史 2 起', gf_graph: '关联图谱', gf_list: '关联列表' },
      blacklist_hit: { bh_type: '内部黑名单', bh_field: '手机号', bh_source: '联防联控', bh_reason: '命中欺诈名单', bh_time: '2026-07-27', bh_level: '高', bh_table: '命中记录' },
      history_fraud: { hf_table: '2025 欺诈拒贷 1 次' },
      fraud_logs: { fl_table: '单项+报告级合并' },
    },
  },
  decision: {
    scoreLabel: '综合分',
    sections: {
      decision_overview: { do_three: '信用值 82 / 信用评分 70 / 欺诈分 88', do_level: '高危', do_advice: '拒绝授信', do_basis: '欺诈分极高主导' },
      verify_summary: { vs_concl: '异常值高危', vs_risk: '设备群控', vs_jump: '查看完整报告' },
      credit_summary: { cs2_concl: '信用良好', cs2_risk: '负债略高', cs2_jump: '查看完整报告' },
      fraud_summary: { fs_concl: '欺诈极高', fs_risk: '团伙欺诈', fs_jump: '查看完整报告' },
      decision_suggestion: { ds_text: '强烈建议拒绝', ds_pos: '信用良好', ds_risk: '欺诈极高', ds_ops: '决策按钮', ds_amount: '0' },
      decision_logs: { dl_timeline: '综合时间线' },
    },
  },
}

/* ---------- 工具函数 ---------- */
export function gradeForScore(t: ReportTemplate, score: number): ScoreGrade {
  const g = t.scoreDisplay.grades.find((x) => score >= x.minScore && score <= x.maxScore)
  return g ?? t.scoreDisplay.grades[t.scoreDisplay.grades.length - 1]
}

/**
 * 业务流程（businessFlow）与评分等级（grades）按 index 显式联动：
 *   - 第 0 行固定为"计算中"（gradeId='—'）；
 *   - 其后每一行对应 grades[i]，改名/增删等级时自动跟随，已配置项尽量保留。
 */
export function syncFlowToGrades(flow: BusinessFlowConfig[], grades: ScoreGrade[]): BusinessFlowConfig[] {
  const calc = flow[0] ?? { gradeId: '—', autoDecision: '处理中', manualStatus: '核验计算中', suggestionText: '系统正在计算评分，请稍候…', creditLimitRatio: 0, needManualReview: false, reviewLevel: '单人复核' as ReviewLevel, allowedActions: ['view'] }
  const per = grades.map((g, i) => {
    const prev = flow[i + 1]
    return prev
      ? { ...prev, gradeId: g.grade }
      : { gradeId: g.grade, autoDecision: '预警' as AutoDecision, manualStatus: '待审核' as ManualStatus, suggestionText: `${g.label}，请配置处置策略`, creditLimitRatio: 60, needManualReview: true, reviewLevel: '双人复核' as ReviewLevel, allowedActions: ['view', 'submit_dual_review', 'add_note'] }
  })
  return [calc, ...per]
}

/* 分段来源默认映射（seed 用；UI 中可改） */
export const SECTION_SOURCE: Record<string, SectionSource> = {
  // 信息核验
  score_model: 'api', conclusion_process: 'api', basic_info: 'data_source', id_images: 'api',
  single_verify: 'rule_set', cross_fusion: 'rule_set', op_logs: 'api',
  // 信用风控
  credit_score_overview: 'api', credit_conclusion: 'api', applicant_info: 'data_source',
  risk_factors: 'api', score_trend: 'api', risk_radar: 'api', credit_suggestion: 'api',
  history_records: 'data_source', credit_logs: 'api',
  // 欺诈识别
  fraud_score_model: 'api', disposal_bar: 'api', identity_fraud: 'rule_set', info_forgery: 'rule_set',
  device_fraud: 'rule_set', behavior_fraud: 'rule_set', gang_fraud: 'rule_set', blacklist_hit: 'rule_set',
  history_fraud: 'rule_set', fraud_logs: 'api',
  // 决策报告
  decision_overview: 'api', verify_summary: 'api', credit_summary: 'api', fraud_summary: 'api',
  decision_suggestion: 'api', decision_logs: 'api',
}
/* 数据源字段池（data_source 类字段下拉可选） */
export const DATA_SOURCE_FIELDS = ['申请人姓名', '身份证号', '手机号', '银行卡号', '开户行', '年龄', '学历', '工作单位', '月收入', '居住地址', '婚姻状况', '设备指纹', 'IP地址', 'GPS定位', '进件渠道', 'APP版本']
/* 规则集规则池（rule_set 类字段下拉可选） */
export const RULE_POOL = ['R1 公安实名', 'R2 银行卡四要素', 'R3 运营商实名', 'R4 设备真实性', 'R5 联防联控', 'R6 设备群控', 'R7 团伙关联', 'R8 黑名单命中', 'R9 资料一致性', 'R10 行为异常']
/* 接口输入参数池（api 类输入参数 key 下拉可选） */
export const API_INPUT_POOL = ['applicantId', 'idCard', 'mobile', 'deviceFp', 'ip', 'channel', 'bizType']
/* 数据库类型池（data_source 段连接配置用） */
export const DB_TYPES = ['MySQL', 'PostgreSQL', 'Oracle']
/* 系统内已配置的规则合集（rule_set 段从中选择，再勾选用/不用的规则项） */
export const RULE_SETS: RuleSet[] = [
  {
    id: 'rs_identity', name: '身份真实性规则集', rules: [
      { id: 'R1', name: '公安实名', desc: '比对公安身份信息是否一致' },
      { id: 'R2', name: '银行卡四要素', desc: '姓名+身份证+卡号+手机号四要素核验' },
      { id: 'R3', name: '运营商实名', desc: '手机号运营商实名核验' },
      { id: 'R4', name: '设备真实性', desc: '设备指纹真实性校验' },
      { id: 'R9', name: '资料一致性', desc: '多源资料交叉一致性' },
    ],
  },
  {
    id: 'rs_device', name: '设备与团伙规则集', rules: [
      { id: 'R4', name: '设备真实性', desc: '设备指纹真实性校验' },
      { id: 'R5', name: '联防联控', desc: '跨机构联防联控命中' },
      { id: 'R6', name: '设备群控', desc: '群控设备特征识别' },
      { id: 'R7', name: '团伙关联', desc: '团伙关系网络关联' },
      { id: 'R8', name: '黑名单命中', desc: '黑名单库命中' },
    ],
  },
  {
    id: 'rs_behavior', name: '行为异常规则集', rules: [
      { id: 'R10', name: '行为异常', desc: '申请行为异常模式' },
      { id: 'R6', name: '设备群控', desc: '群控设备特征识别' },
      { id: 'R7', name: '团伙关联', desc: '团伙关系网络关联' },
    ],
  },
  {
    id: 'rs_all', name: '全量核验规则集', rules: [
      { id: 'R1', name: '公安实名', desc: '比对公安身份信息' },
      { id: 'R2', name: '银行卡四要素', desc: '四要素核验' },
      { id: 'R3', name: '运营商实名', desc: '运营商实名' },
      { id: 'R4', name: '设备真实性', desc: '设备指纹真实' },
      { id: 'R5', name: '联防联控', desc: '联防联控' },
      { id: 'R6', name: '设备群控', desc: '群控识别' },
      { id: 'R7', name: '团伙关联', desc: '团伙关联' },
      { id: 'R8', name: '黑名单命中', desc: '黑名单' },
      { id: 'R9', name: '资料一致性', desc: '一致性' },
      { id: 'R10', name: '行为异常', desc: '行为异常' },
    ],
  },
]
/* 分段 → 默认选中的规则合集（seed 用） */
export const SECTION_RULESET: Record<string, string> = {
  identity_fraud: 'rs_identity', cross_fusion: 'rs_all',
  info_forgery: 'rs_identity', device_fraud: 'rs_device', behavior_fraud: 'rs_behavior',
  gang_fraud: 'rs_device', blacklist_hit: 'rs_device', history_fraud: 'rs_all',
}

/* 模拟读取数据库表结构：根据表名给出示例列（仅用于演示，真实场景由后端返回）。
 * 返回 {name, type}，type 为推断出的 DB 列类型（varchar/int/datetime/decimal…）。 */
export function mockTableColumns(table: string): { name: string; type: string }[] {
  const infer = (n: string): string => {
    if (/时间|date|time|创建|更新|进件|birth|生日/i.test(n)) return 'datetime'
    if (/年龄|收入|额度|金额|分数|score|数量|count|num|学历|婚姻|版本/i.test(n)) return 'decimal'
    if (/_id$|编号|id$|序号/i.test(n)) return 'bigint'
    if (/手机|证件|卡号|身份证|地址|姓名|单位|渠道|机型|系统|指纹|定位|原因|来源|支行|开户行|状态/i.test(n)) return 'varchar'
    return 'varchar'
  }
  const base = ['id', '申请人姓名', '身份证号', '手机号', '创建时间']
  let names: string[]
  if (/user|applicant|basic|info/i.test(table)) names = ['applicant_id', '申请人姓名', '身份证号', '手机号', '年龄', '学历', '工作单位', '月收入', '居住地址', '婚姻状况', '设备指纹', 'IP地址', 'GPS定位', '进件渠道', 'APP版本']
  else if (/bank|card|account/i.test(table)) names = ['account_id', '申请人姓名', '银行卡号', '开户行', '开户支行', '账户状态', '授信额度', '可用额度']
  else if (/device|equip/i.test(table)) names = ['device_id', '设备指纹', '机型', '操作系统', 'MAC地址', 'IMSI', '是否越狱', '是否模拟器']
  else names = base
  return names.map((n) => ({ name: n, type: infer(n) }))
}
/* 数据源连接有效性校验（IP / 端口 / 必填项） */
function validateDs(d: DataSourceConfig): string[] {
  const errs: string[] = []
  if (!d.ip.trim()) errs.push('IP 地址不能为空')
  else if (!/^((\d{1,3}\.){3}\d{1,3}|localhost|[\w.-]+)$/.test(d.ip.trim())) errs.push('IP 地址格式不合法（应为 IPv4 / localhost / 域名）')
  if (!d.port.trim()) errs.push('端口不能为空')
  else if (!/^\d{2,5}$/.test(d.port.trim()) || +d.port < 1 || +d.port > 65535) errs.push('端口应在 1–65535 之间')
  if (!d.username.trim()) errs.push('用户名不能为空')
  if (!d.password.trim()) errs.push('密码不能为空')
  if (!d.database.trim()) errs.push('数据库名不能为空')
  if (!d.table.trim()) errs.push('表名不能为空')
  return errs
}
/* 接口有效性校验（地址 / 输出字段 / 必填输入映射） */
function validateApi(a: ApiConfig): string[] {
  const errs: string[] = []
  if (!a.url.trim()) errs.push('API 地址不能为空')
  else if (!/^https?:\/\/.+/.test(a.url.trim())) errs.push('API 地址须以 http:// 或 https:// 开头')
  if (a.outputs.length === 0) errs.push('至少配置 1 个输出字段')
  else a.outputs.forEach((o, i) => { if (!o.key.trim()) errs.push(`第 ${i + 1} 个输出字段的 key 为空`); if (!o.label.trim()) errs.push(`第 ${i + 1} 个输出字段的显示名为空`) })
  a.inputs.forEach((p, i) => { if (p.key.trim() && !p.from.trim()) errs.push(`第 ${i + 1} 个输入参数「${p.key}」未填写数据来源`) })
  if (a.bodyType !== 'none' && !a.bodyText.trim()) errs.push(`请求体类型已选「${a.bodyType}」，但请求体内容为空`)
  return errs
}
/* 规则集有效性校验（已选合集 / 至少启用 1 条规则） */
function validateRuleSet(s: SectionConfig): string[] {
  const errs: string[] = []
  if (!s.ruleSetId) errs.push('尚未选择规则合集')
  const used = s.fields.filter((f) => f.visible).length
  if (used === 0) errs.push('至少需启用 1 条规则（报告中无可展示项）')
  return errs
}
/**
 * 来源配置『测试』：校验当前来源配置是否可用（模拟，无真实网络）。
 * 返回结构化结果，供配置弹窗展示「通过 / 失败 + 明细 + 耗时」。
 */
export interface SourceTestResult {
  ok: boolean
  title: string
  lines: string[]
  durationMs: number
}
export function testSourceConfig(s: SectionConfig): SourceTestResult {
  const durationMs = 80 + Math.floor(Math.random() * 320)
  if (s.sourceType === 'data_source') {
    const d = s.ds
    if (!d) return { ok: false, title: '配置不完整', lines: ['数据源连接信息缺失'], durationMs }
    const errs = validateDs(d)
    if (errs.length) return { ok: false, title: '连接测试未通过', lines: errs, durationMs }
    if (d.tableFields.length === 0) return { ok: false, title: '连接成功，但表字段未读取', lines: ['连接配置有效，但请先点「读取表字段」再保存展示项'], durationMs }
    return { ok: true, title: '数据库连接成功', lines: [`${d.dbType} · ${d.ip}:${d.port}`, `数据库 ${d.database} / 表 ${d.table}`, `读取到 ${d.tableFields.length} 个字段`], durationMs }
  }
  if (s.sourceType === 'api') {
    const a = s.api
    if (!a) return { ok: false, title: '配置不完整', lines: ['接口配置信息缺失'], durationMs }
    const errs = validateApi(a)
    if (errs.length) return { ok: false, title: '接口测试未通过', lines: errs, durationMs }
    const missed = a.inputs.filter((p) => p.required && !p.from.trim()).length
    return { ok: true, title: '接口调用成功', lines: [`${a.method} ${a.url}`, `输入参数 ${a.inputs.length} 个${missed ? `（${missed} 个必填未映射）` : ''}`, `返回输出字段 ${a.outputs.length} 个`], durationMs }
  }
  // rule_set
  const errs = validateRuleSet(s)
  if (errs.length) return { ok: false, title: '规则集测试未通过', lines: errs, durationMs }
  const rs = RULE_SETS.find((r) => r.id === s.ruleSetId)
  const used = s.fields.filter((f) => f.visible).length
  return { ok: true, title: '规则集加载成功', lines: [`规则合集：${rs?.name ?? s.ruleSetId}`, `启用 ${used} / 共 ${s.fields.length} 条规则`, `命中显示「${s.fields.find((f) => f.visible)?.hitText ?? '命中'}」`], durationMs }
}

/* 每个报告类型：首段（评分总览 / 模型卡）→ 评分方案 Tab；第二段（结论 / 处置建议）→ 审核操作 Tab。
   与信息核验一致：这两段作为全局「得分计算 / 结论与终审」卡片的来源，不出现在「报告内容配置」里。
   注：决策报告的「结论」卡是 decision_suggestion（最终决策建议），而非目录第 2 条 verify_summary（信息核验摘要，属内容）。 */
const SCORE_SECTION: Record<ReportType, string> = {
  info_verify: 'score_model',
  credit: 'credit_score_overview',
  fraud: 'fraud_score_model',
  decision: 'decision_overview',
}
const FLOW_SECTION: Record<ReportType, string> = {
  info_verify: 'conclusion_process',
  credit: 'credit_conclusion',
  fraud: 'disposal_bar',
  decision: 'decision_suggestion',
}
function buildSections(type: ReportType): SectionConfig[] {
  return SECTION_CATALOG[type].map((s, i) => {
    const sType = SECTION_SOURCE[s.id] ?? 'data_source'
    let ds: DataSourceConfig | undefined
    let api: ApiConfig | undefined
    let ruleSetId: string | undefined
    let fields: FieldConfig[]

    if (sType === 'data_source') {
      // 数据源：初始用 seed 字段名作为表字段占位（type 默认 varchar）；用户配连接后可"读取表字段"覆盖
      const tableFields = s.fields.map((f) => ({ name: f.name, type: 'varchar', visible: true }))
      ds = { dbType: 'MySQL', ip: '', port: '3306', username: '', password: '', database: '', table: '', tableFields }
      fields = ds.tableFields.map((tf, k) => ({ id: s.fields[k].id, name: tf.name, desc: s.fields[k].desc, visible: true, sourceRef: tf.name, mask: /身份证|手机|银行卡|证件|姓名/.test(tf.name), maskRule: autoMaskRule(tf.name), scoreMode: 'deduct', scorePoints: 10, condType: 'empty' as FieldCondType }))
    } else if (sType === 'api') {
      const inputs: ApiParam[] = s.id === 'score_model' ? [{ key: 'applicantId', from: '进件表单.申请人ID', required: true }, { key: 'deviceFp', from: '设备SDK.指纹', required: false }]
        : s.id === 'fraud_score_model' ? [{ key: 'deviceFp', from: '设备SDK.指纹', required: true }, { key: 'ip', from: '请求上下文.IP', required: false }]
        : s.id === 'decision_overview' ? [{ key: 'verifyScore', from: '信息核验.异常值', required: true }, { key: 'creditScore', from: '信用风控.信用分', required: true }, { key: 'fraudScore', from: '欺诈识别.欺诈分', required: true }]
        : []
      const outputs: ApiOutput[] = s.fields.map((f) => ({ key: f.id, label: f.name, type: 'string', container: inferApiContainer(f.name, f.desc), visible: true }))
      api = { url: '', method: 'POST', headers: [], inputs, bodyType: 'none', bodyText: '', outputs }
      fields = api.outputs.map((o, k) => ({ id: s.fields[k].id, name: o.label, desc: s.fields[k].desc, visible: true, sourceRef: o.key, scoreMode: 'deduct', scorePoints: 10, condType: 'empty' as FieldCondType }))
    } else {
      // 规则集：默认选中一个系统规则合集，展开后的规则项即合集内的规则
      const rsId = SECTION_RULESET[s.id] ?? RULE_SETS[0].id
      ruleSetId = rsId
      const rs = RULE_SETS.find((r) => r.id === rsId)!
      fields = rs.rules.map((r) => ({ id: r.id, name: r.name, desc: r.desc, visible: true, sourceRef: r.id, hitText: '命中', missText: '未命中', severity: 'mid' as Severity, hitReject: false, scoreMode: 'deduct', scorePoints: 10, condType: 'hit' as FieldCondType }))
    }

    return {
      id: s.id,
      name: s.name,
      desc: s.desc,
      order: i + 1,
      visible: true,
      sourceType: sType,
      homeTab: s.id === SCORE_SECTION[type] ? 'score' : s.id === FLOW_SECTION[type] ? 'flow' : /logs?$/i.test(s.id) ? 'log' : 'content',
      sourceName: s.name,
      ds, api, ruleSetId,
      fields,
    }
  })
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
    scoreBlock: { show: true, title: '' },
    flowBlock: { show: true, title: '' },
    showOpLog: true,
    scoreDisplay: {
      displayComponent: '大数字',
      showDescription: true,
      showThresholdBar: true,
      showComponents: true,
      showRiskTags: true,
      grades: GRADE_PRESETS[type].map((g) => ({ ...g })),
      components: SCORE_COMPONENTS_PRESETS[type].map((c) => ({ ...c })),
    },
    businessFlow: syncFlowToGrades(FLOW_PRESETS[type], GRADE_PRESETS[type]),
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
    isDefault: true, version: 'V2.1', lastEditor: 'admin', lastEditTime: '今天', description: '信息核验报告标准展示模板，覆盖全部 7 个分段。异常值越高风险越高。',
  }),
  buildTemplate('credit', {
    id: 'tpl-credit-loan', name: '信用贷信用风控报告模板', status: '已启用', scope: ['工薪贷', '公积金贷', '社保贷', '学历贷', '商户贷'],
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

/* ---------- 角色与权限（详情页与预览子页共用） ---------- */
export type Role = '系统管理员' | '风控主管' | '风控策略岗' | '风控专员' | '数据分析师'
export const ROLES: Role[] = ['系统管理员', '风控主管', '风控策略岗', '风控专员', '数据分析师']
export const ROLE_PERM: Record<Role, { edit: boolean; enable: boolean; setDefault: boolean; del: boolean }> = {
  系统管理员: { edit: true, enable: true, setDefault: true, del: true },
  风控主管: { edit: true, enable: true, setDefault: true, del: false },
  风控策略岗: { edit: true, enable: false, setDefault: false, del: false },
  风控专员: { edit: false, enable: false, setDefault: false, del: false },
  数据分析师: { edit: false, enable: false, setDefault: false, del: false },
}
export const ROLE_HINT: Record<Role, string> = {
  系统管理员: '可编辑、启用/停用、设默认、删除全部模板',
  风控主管: '可编辑、启用/停用、设默认，不可删除',
  风控策略岗: '可编辑配置，但不可启用/停用与设默认',
  风控专员: '仅可查看与切换模板，无编辑权限',
  数据分析师: '仅可查看，不可修改任何配置',
}
