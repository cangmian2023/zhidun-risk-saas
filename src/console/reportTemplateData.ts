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
/* 分段自动审核结果：总分落入该分段时系统自动给出的结论（在「评分方案」Tab 配置，「审核操作」Tab 继承） */
export type AutoResult = '通过' | '拒绝' | '转人工'
export const AUTO_RESULT_LIST: AutoResult[] = ['通过', '转人工', '拒绝']
export const AUTO_RESULT_COLOR: Record<AutoResult, string> = { 通过: '#10B981', 转人工: '#F59E0B', 拒绝: '#EF4444' }
/* 审核角色池（审核操作 Tab 各流程环节的经办人角色） */
export type ReviewRole = '初审员' | '复审员' | '风控主管' | '风控经理' | '风控总监'
export const REVIEW_ROLES: ReviewRole[] = ['初审员', '复审员', '风控主管', '风控经理', '风控总监']

/* 分段来源类型：每块来源单一（与用户首填/接口调用/规则集碰撞一一对应） */
export type SectionSource = 'data_source' | 'api' | 'rule_set' | 'tpl_copy'
export const SECTION_SOURCE_LABEL: Record<SectionSource, string> = {
  data_source: '数据源',
  api: '接口调用',
  rule_set: '规则集',
  tpl_copy: '模板复制',
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

/* 字段名/说明 -> 推断接口字段类型（让「类型」列与实际数据相符，避免全为 string） */
export function inferFieldType(name: string, desc: string): ApiFieldType {
  const t = `${name} ${desc}`
  if (/图片|影像|照片|证照|头像|面|活体/i.test(t)) return 'image'
  if (/视频|录像|mp4/i.test(t)) return 'video'
  if (/文件|附件|pdf|文档|合同/i.test(t)) return 'file'
  if (/时间|日期|date|出生|到期|创建|更新|申请时间/i.test(t)) return 'date'
  if (/是否|通过|拒绝|命中|成功|失败|一致|异常|校验|核验|有|无|bool/i.test(t)) return 'boolean'
  if (/年龄|岁|月收入|收入|额度|金额|分数|分|利率|期数|笔数|次数|数量|余额|负债|比例|评分|分值/i.test(t)) return 'number'
  if (/状态|等级|类型|渠道|来源|原因|行业|职业|婚姻|学历|性别|证件|关系|标签/i.test(t)) return 'enum'
  if (/维度|明细|列表|结构|json|详情|记录|图谱|项/i.test(t)) return 'json'
  return 'string'
}
/* 字段名 -> 推断数据库列类型（让数据源「类型」列与实际库表相符，避免全为 varchar） */
export function inferDbType(name: string): string {
  if (/金额|收入|额度|利率|余额|负债|比例/.test(name)) return 'decimal(18,2)'
  if (/年龄|岁|月收入|笔数|次数|数量|期数|分|分数|评分|分值/i.test(name)) return 'int'
  if (/时间|日期|date|出生|到期|创建|更新|申请时间/i.test(name)) return 'datetime'
  if (/是否|通过|命中|校验|核验|一致|异常|有|无/i.test(name)) return 'tinyint'
  return 'varchar(64)'
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
  displayLabel?: string   // 报告展示标签（默认 = name；数据源取 DbField.label / 接口取 ApiOutput.label）
  group?: string          // 所属内部分组 id（数据源/接口合集可内部分组并命名；缺省归入首个分组）
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
  /* 计分（每条展示项参与本卡总分，方向由所属分段 cardScoreMode 决定） */
  scorePoints?: number             // 加 / 扣 的分值
  condType?: FieldCondType        // 计分条件：规则=命中/非命中；字段=空/非空/大于/小于/等于/正则
  condValue?: string              // 条件值（gt/lt/eq/regex 使用；empty/notEmpty/hit 不用）
  exempt?: boolean                 // 豁免：可以（true）/ 不可以（false，默认）
  conditions?: FieldCondition[]   // 多条件组合（替代单一 condType/condValue；为空回落到 condType/condValue）
  options?: string[]       // 可选枚举值：配置条件时该字段的值以下拉选择（如 已实名/未实名），为空则自由输入
}
/* 展示项计分条件类型 */
export type FieldCondType = 'hit' | 'miss' | 'empty' | 'notEmpty' | 'gt' | 'lt' | 'eq' | 'regex'
/* 多条件组合：一个展示项可配置多条条件，按 logic 串联（最后一条 logic 忽略）。
   field 默认本项；可填其他字段名以组合跨字段条件。 */
export interface FieldCondition {
  id: string
  field: string          // 参与条件的字段名（默认本项；可填其他字段组合跨字段条件）
  op: FieldCondType      // 运算符
  value?: string         // 条件值（empty/notEmpty/hit/miss 时不使用）
  logic: 'and' | 'or'    // 与下一条条件的连接关系（最后一条忽略）
}
export const FIELD_COND_LABEL: Record<FieldCondType, string> = {
  hit: '命中', miss: '非命中', empty: '为空', notEmpty: '非空', gt: '大于', lt: '小于', eq: '等于', regex: '正则',
}

/* 分段（卡片）级计分方向：达标加分 / 命中扣分 / 命中即拒（默认按 sourceType 推导：数据源/接口=达标加分，规则集=命中扣分） */
export type CardScoreMode = 'add' | 'deduct' | 'reject'
export const CARD_SCORE_MODE_LABEL: Record<CardScoreMode, string> = {
  add: '达标加分', deduct: '命中扣分', reject: '命中即拒',
}

/* 数据源（用户首填）连接配置：配真实库连接，字段从表里"读出来"只能显隐 */
/* 读取表结构后得到的字段：列名 + DB 列类型 + 是否展示 + 报告显示名(可选) + 显示方式(可选) + 脱敏规则(可选) */
export interface DbField {
  name: string
  type: string           // DB 列类型，读取表结构时填充（varchar/int/datetime/decimal…）
  visible: boolean
  label?: string         // 报告中显示名（默认 = name）
  container?: RenderContainer  // 报告中如何呈现（默认按列类型推荐，可改）
  group?: string         // 所属内部分组 id（数据源合集可内部分组并命名）
  maskRule?: MaskRule    // 脱敏规则（默认按字段名自动识别）
  remark?: string        // 字段说明/备注（可选）
  /* 计分（数据字段可按条件参与本卡总分；方向由所属分段 cardScoreMode 决定） */
  scorePoints?: number
  condType?: FieldCondType
  condValue?: string
  exempt?: boolean       // 豁免：可以（true）/ 不可以（false，默认）
  conditions?: FieldCondition[]   // 多条件组合（替代单一 condType/condValue）
  options?: string[]       // 可选枚举值：配置条件时该字段的值以下拉选择
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
  remark?: string       // 字段说明/备注（可选）
  /* 计分（接口输出字段可按条件参与本卡总分；方向由所属分段 cardScoreMode 决定） */
  scorePoints?: number
  condType?: FieldCondType
  condValue?: string
  exempt?: boolean       // 豁免：可以（true）/ 不可以（false，默认）
  conditions?: FieldCondition[]   // 多条件组合（替代单一 condType/condValue）
  group?: string         // 所属内部分组 id（接口合集可内部分组并命名）
  options?: string[]       // 可选枚举值：配置条件时该字段的值以下拉选择
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

/** 按分段（卡片）级计分方向，汇总本卡总分（条件满足/命中时的理想计分，用于展示本卡满分与构成；命中即拒项不计入）。
 *  - add：启用且非「命中即拒」项 → +scorePoints（整卡满分 = 启用项×分值）
 *  - deduct：启用且非「命中即拒」项 → −scorePoints
 *  - reject：本卡为命中即拒触发器，不参与加减分（由命中即拒项直接拒贷） */
export function computeSectionScore(s: SectionConfig): { total: number; addCount: number; deductCount: number; mode: CardScoreMode } {
  const mode: CardScoreMode = s.cardScoreMode ?? (s.sourceType === 'rule_set' ? 'deduct' : 'add')
  if (s.scoreable === false) return { total: 0, addCount: 0, deductCount: 0, mode }
  // 计分字段取「权威来源」：数据源读 tableFields、接口读 outputs、规则集读 fields；
  // 避免配置页改了「分值」列却没同步到 s.fields，导致本卡总分（如用户基本信息）恒为 0。
  const raw = s.sourceType === 'data_source' ? s.ds?.tableFields
    : s.sourceType === 'api' ? s.api?.outputs
    : s.fields
  const fields: any[] = (raw ?? s.fields) as any[]
  let total = 0, addCount = 0, deductCount = 0
  for (const f of fields) {
    if (!f || f.visible === false || f.hitReject) continue
    const pts = f.scorePoints ?? 0
    if (mode === 'add') { total += pts; addCount++ }
    else if (mode === 'deduct') { total -= pts; deductCount++ }
  }
  return { total, addCount, deductCount, mode }
}

/* ---------- 评分维度分布（报告首卡列表）----------
 * 报告内容配置里的每一个来源卡片（集合）＝ 列表里的一行：
 *   维度 = 集合名 / 得分 = 本卡汇总得分 / 权重 = 本卡权重占比 / 等级 = 按下方三档区间派生 / 说明 = 每行可填
 * 三档区间与档位说明在「报告内容配置」Tab 可配，开关同「显示分段总分」复选框。*/
export type DimLevel = '低' | '中' | '高'
export interface DimLevelBand {
  level: DimLevel
  min: number      // 区间下限（含）——按本卡得分绝对值匹配
  max: number      // 区间上限（含）
  note: string     // 该档说明：行内「说明」为空时作为兜底文案
}
export const DEFAULT_DIM_BANDS: DimLevelBand[] = [
  { level: '低', min: 0, max: 20, note: '该维度表现正常，无明显风险' },
  { level: '中', min: 21, max: 50, note: '该维度存在一定异常，建议关注' },
  { level: '高', min: 51, max: 100, note: '该维度风险突出，需重点核查' },
]
export function matchDimBand(score: number, bands: DimLevelBand[]): DimLevelBand | undefined {
  const v = Math.abs(score)
  return bands.find((b) => v >= b.min && v <= b.max)
}
/** 评分维度分布三档默认区间：随本维度实际得分（绝对值）等比切分，
 * 使「低/中/高」与「得分」列量程一致（如得分 25 → 0-9 / 10-18 / 19-25），而非固定 0-100。 */
export function defaultDimBandsForScore(score: number): DimLevelBand[] {
  const max = Math.max(1, Math.ceil(Math.abs(score)))
  const t = Math.max(1, Math.ceil(max / 3))
  return [
    { level: '低', min: 0, max: t, note: '该维度表现正常，无明显风险' },
    { level: '中', min: t + 1, max: t * 2, note: '该维度存在一定异常，建议关注' },
    { level: '高', min: Math.min(t * 2 + 1, max), max, note: '该维度风险突出，需重点核查' },
  ]
}
export interface DimRow {
  id: string
  name: string
  score: number        // 本卡汇总得分（含正负）
  weight: number       // 本卡权重原值
  weightPct: number    // 权重占比（%）
  level?: DimLevel
  note: string
}
/* 由模板「报告内容配置」的来源卡片生成维度分布行（所有 content Tab 可见段均参与，tpl_copy 取复制源段计分） */
export function buildDimRows(tpl: ReportTemplate): DimRow[] {
  const secs = tpl.sections.filter((s) => (s.homeTab ?? 'content') === 'content' && s.visible)
  const sumW = secs.reduce((a, s) => a + (s.weight ?? 1), 0) || 1
  return secs.map((s) => {
    const scoreSec = s.sourceType === 'tpl_copy' && s.copyFromId
      ? (tpl.sections.find((x) => x.id === s.copyFromId) ?? s)
      : s
    const total = computeSectionScore(scoreSec).total
    const w = s.weight ?? 1
    const bands = s.dimBands ?? tpl.dimBands ?? defaultDimBandsForScore(total)
    const band = matchDimBand(total, bands)
    return {
      id: s.id, name: s.name, score: total, weight: w,
      weightPct: Math.round((w / sumW) * 100),
      level: band?.level,
      note: (s.dimNote ?? '').trim() || band?.note || '',
    }
  })
}

export interface SectionConfig {
  id: string
  name: string
  desc: string
  order: number
  visible: boolean
  sourceType: SectionSource
  dimNote?: string         // 评分维度分布列表里该行的「说明」（留空则取所属等级档位的说明）
  dimBands?: DimLevelBand[]  // 评分维度分布：本维度独立的三档（低/中/高）区间与说明；缺省套用模板级 dimBands（逐维度配置，不再全局共用一套）
  /** 演示/备用报告：本卡示例得分（异常值口径，越高风险越高）；模板驱动的报告详情读取并展示 */
  demoScore?: number
  /** 演示/备用报告：本卡内各展示项的示例值与状态（key=fieldId）；模板驱动的报告详情读取并展示 */
  demoValues?: Record<string, { name?: string; value: string; status: 'pass' | 'warn' | 'reject' }>
  cardScoreMode?: CardScoreMode  // 本卡计分方向（达标加分 / 命中扣分 / 命中即拒）；缺省按 sourceType 推导
  weight?: number          // 本卡权重：报告总分 = 基础分 + Σ(各卡计分 × 权重)；缺省 1
  homeTab?: 'content' | 'score' | 'flow' | 'log'  // 该段归属的编辑 Tab：'content'=报告内容配置；'score'=评分方案（如得分计算）；'flow'=审核操作（如结论与终审）；'log'=操作日志，由模板 showOpLog 开关控制，不在任何 Tab 编辑
  sourceName?: string   // 数据源名 / 接口名 / 规则集名
  ds?: DataSourceConfig      // sourceType === 'data_source'
  api?: ApiConfig            // sourceType === 'api'
  ruleSetId?: string        // sourceType === 'rule_set'，选中的规则合集 id
  /* sourceType === 'tpl_copy'：复制现有模板的全量「报告内容配置」——一个卡片、多个只读列表，配置不可修改（fields 留空，不参与本模板计分） */
  copyFromId?: string       // 来源模板 id
  copyFromName?: string     // 来源模板名
  copySections?: SectionConfig[]  // 复制时的全量快照（只读展示）
  copyScoreRange?: { min: number; max: number; base: number } // 复制时来源模板的总分区间（基础分±加扣分）快照
  fields: FieldConfig[]     // 展示项：数据源=表字段 / 接口=输出字段 / 规则集=规则项（用/不用）
  /** 报告详情页本卡显示方式：列表 / 小卡片；从第三个卡片（各集合/维度卡片）起可在详情页切换，缺省 'list' */
  displayMode?: CardDisplayMode
  /** 是否计入评分：false 表示该分段为「仅展示」型（如用户基本信息），不配置分值、不计入本卡总分与报告总分 */
  scoreable?: boolean
  /* 数据源 / 接口合集的内部分组（可命名）：报告详情里分段卡片内部按组展示；缺省空=不分组（平铺） */
  fieldGroups?: FieldGroup[]
}

/* 分段内部分组（数据源/接口合集可把一个合集再拆成多个命名子组，如「基础资料」「环境采集」） */
export interface FieldGroup {
  id: string
  name: string
}

/* ---------- 报告详情页卡片显示方式（从第三个卡片起可在详情页切换） ---------- */
export type CardDisplayMode = 'list' | 'card'
export const CARD_DISPLAY_MODE_LABEL: Record<CardDisplayMode, string> = {
  list: '列表', card: '小卡片',
}
/** 分段「显示方式」对应的字段网格 class：列表=单列行式；小卡片=多列卡片网格 */
export function fieldGridClass(mode: CardDisplayMode = 'list'): string {
  return mode === 'card'
    ? 'grid grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2 lg:grid-cols-3'
    : 'grid grid-cols-1 gap-y-2'
}

/* ============================================================================
 * 报告名称独立生成规则
 * 报告名称与「模板名称」相互独立：模板只决定展示哪些分段/字段，
 * 报告名称在「生成报告」时按 模块(路由) + 产品 + 报告类型 + 生成时间 综合生成。
 *  - display：可读长名，用于详情页标题
 *  - compact：紧凑码，用于列表/导出文件名等窄场景
 * ========================================================================== */
export const REPORT_TYPE_LABEL: Record<ReportType, string> = {
  info_verify: '信息核验',
  credit: '信用风控',
  fraud: '欺诈识别',
  decision: '决策',
}
/** 按路由 pathname 推导报告所属模块：cr:mid-* 系列为贷中监控，其余（cr:pre-*）为贷前审核 */
export function getModuleByRoute(pathname: string): string {
  if (pathname.includes('mid-') || pathname.includes('/mid/')) return '贷中监控'
  return '贷前审核'
}
/** 把 '2026-07-21 15:00:22' 之类时间规整为 compact 用的 YYYYMMDD_HHmm */
function compactTime(reportTime: string): string {
  const m = reportTime.match(/(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/)
  if (!m) return reportTime.replace(/\W+/g, '').slice(0, 12)
  const [, y, mo, d, h, mi] = m
  return `${y}${mo}${d}_${h}${mi}`
}
export interface ReportNameInput {
  reportType: ReportType
  product: string
  reportTime: string
  module: string
}
export interface ReportName {
  display: string
  compact: string
}
export function buildReportName({ reportType, product, reportTime, module }: ReportNameInput): ReportName {
  const typeLabel = REPORT_TYPE_LABEL[reportType]
  const display = `${module} · ${product} · ${typeLabel}报告 · ${reportTime}`
  const compact = `${typeLabel}_${product}_${compactTime(reportTime)}`
  return { display, compact }
}
export interface ScoreGrade {
  grade: string
  label: string
  minScore: number
  maxScore: number
  riskLevel: RiskLevel
  color: string          // 标签配色：报告中该分段标签的颜色
  autoResult: AutoResult // 总分落入本分段时的自动审核结果（通过/转人工/拒绝）
  description: string
  /** 该分段对应的风险标签（空格分隔），为报告详情「风险标签」的唯一来源；如「设备环境异常 关联风险偏高」 */
  tags?: string
}
/* 分值语义：决定报告详情页「大数字 + 阈值刻度条」的读数方向。
 *  - 'risk'   异常值：直接展示总分，越高越危险，刻度条与 grades 同向（左低右高）
 *  - 'credit' 信用值：展示「满分 − 总分」，越高越安全，刻度条整条左右翻转
 * 分段边界 / 配色 / 结论一律取 grades，本开关只管「这个数怎么读」，不改评分模型本身。
 */
export type ScoreSemantic = 'risk' | 'credit'
export const SCORE_SEMANTIC_LABEL: Record<ScoreSemantic, string> = {
  risk: '异常值 · 越高越危险',
  credit: '信用值 · 越高越安全',
}
export interface ScoreDisplayConfig {
  displayComponent: DisplayComponent
  showDescription: boolean
  showThresholdBar: boolean
  showRiskTags: boolean
  baseScore: number      // 基础分：总分 = 基础分 + Σ各卡加分 − Σ各卡扣分（避免纯扣分卡把总分扣成负数）
  title?: string        // 自动审核配置-标题*：报告结论卡上的模型名称（如「信息核验综合信用模型」），空则详情页用兜底名
  scoreSemantic?: ScoreSemantic  // 分值语义（缺省 'risk'）：详情页大数字与刻度条按此方向渲染
  grades: ScoreGrade[]
}

/* ---------- 阈值刻度条：由 grades + 分值语义推导（报告详情页读同一套算法） ---------- */
export interface ScoreBarSeg {
  grade: ScoreGrade
  left: number    // 展示坐标左端（%）
  width: number   // 段宽（%）
}
/** 把模板分段铺成刻度条；'credit' 语义下整条左右翻转。bounds 为展示坐标下的边界刻度值 */
export function buildScoreBar(grades: ScoreGrade[], semantic: ScoreSemantic = 'risk') {
  const gs = [...grades].sort((a, b) => a.minScore - b.minScore)
  const min = gs[0]?.minScore ?? 0
  const max = gs[gs.length - 1]?.maxScore ?? 100
  const range = Math.max(1, max - min)
  const segs: ScoreBarSeg[] = gs
    .map((g) => {
      const lo = semantic === 'credit' ? min + max - g.maxScore : g.minScore
      const hi = semantic === 'credit' ? min + max - g.minScore : g.maxScore
      return { grade: g, left: ((lo - min) / range) * 100, width: ((hi - lo) / range) * 100 }
    })
    .sort((a, b) => a.left - b.left)
  const bounds = [min, ...segs.slice(0, -1).map((s) => Math.round(min + ((s.left + s.width) / 100) * range)), max]
  return { segs, bounds, min, max }
}
/** 模型原始总分 → 详情页展示值 */
export function toDisplayScore(raw: number, semantic: ScoreSemantic = 'risk', grades: ScoreGrade[] = []): number {
  if (semantic !== 'credit') return raw
  const gs = [...grades].sort((a, b) => a.minScore - b.minScore)
  const min = gs[0]?.minScore ?? 0
  const max = gs[gs.length - 1]?.maxScore ?? 100
  return min + max - raw
}
/** 模型原始总分落在哪个分段 */
export function matchGrade(raw: number, grades: ScoreGrade[]): ScoreGrade | undefined {
  return grades.find((g) => raw >= g.minScore && raw <= g.maxScore)
}

/* ---------- 信息核验列表「得分」生成（按模板分段生成真实数据） ----------
 * 按行的自动审核结果从模板 grades 分段内动态取分（分数恒在模板 min~max 内）：
 *   - 通过 → 命中 autoResult='通过' 的分段，取段内偏高值
 *   - 拒绝 → 命中 autoResult='拒绝' 的分段，取段内偏低值
 *   - 预警/转人工 → 命中 autoResult='转人工' 的分段，取段内中值
 *   - 处理中 → 尚未出分，返回 null（列表得分列显示 —）
 * 列表自动审核列 = matchGrade(score).autoResult，与详情页总分落段口径一致。 */
export function scoreForVerifySys(sys: string, grades: ScoreGrade[]): number | null {
  if (sys === '处理中') return null
  const target: AutoResult = sys === '通过' ? '通过' : sys === '拒绝' ? '拒绝' : '转人工'
  const g = grades.find((x) => x.autoResult === target)
  if (!g) return null
  const mid = (g.minScore + g.maxScore) / 2
  if (target === '通过') return Math.round(mid + (g.maxScore - mid) * 0.6)
  if (target === '拒绝') return Math.round(mid - (mid - g.minScore) * 0.6)
  return Math.round(mid)
}

/* ---------- 模板驱动的报告总分（列表得分与详情总分共用同一算法，杜绝两边不一致） ----------
 * 输入模板 + 一份样例数据（按 section.id 取），输出：
 *   - scoreById：各 content 分段的总分（数据源按 fieldGroups 分组名取数，其余数组直接求和）
 *   - total：综合总分 = 模板 scoreFormula（变量 = 各分段总分）实时求值；公式不可用时退化为各段相加
 * 列表页「得分」列与详情页「评分卡」都调用它，保证同一进件两边数字一致。 */
export function computeReportTotal(tpl: ReportTemplate, sampleData: Record<string, any>): { total: number; scoreById: Record<string, number> } {
  const sumScores = (arr: any[] | undefined): number => (arr ?? []).reduce((a: number, x: any) => a + (typeof x.score === 'number' ? x.score : 0), 0)
  const contentSecs = tpl.sections.filter((s) => (s.homeTab ?? 'content') === 'content' && s.visible)
  const scoreById: Record<string, number> = {}
  for (const s of contentSecs) {
    const raw = (sampleData ?? {})[s.id]
    if (!raw) { scoreById[s.id] = 0; continue }
    if (s.sourceType === 'data_source' && (s.fieldGroups?.length ?? 0) > 0) {
      scoreById[s.id] = (s.fieldGroups ?? []).reduce((a: number, g: any) => a + sumScores(raw[g.name]), 0)
    } else if (Array.isArray(raw)) {
      scoreById[s.id] = sumScores(raw)
    } else {
      scoreById[s.id] = 0
    }
  }
  const formula = tpl.scoreFormula ?? buildDefaultScoreFormula(tpl.sections)
  const sv: Record<string, number> = {}
  for (const s of contentSecs) sv['sec_' + s.id] = scoreById[s.id] ?? 0
  for (const t of formula.terms) if (t.varId && !(t.varId in sv)) sv[t.varId] = 0
  const total = evaluateFormula(formula, sv) ?? contentSecs.reduce((a, s) => a + (scoreById[s.id] ?? 0), 0)
  return { total, scoreById }
}

/* ---------- 特殊命中规则（自动审核 Tab · 分值分段之下） ----------
 * 场景：某条规则一旦命中，不论总分多少都直接定结论（如「黑名单命中 → 拒绝」）。
 * 规则项从「报告内容配置」里已选的展示项（规则集/数据源/接口项）中挑选。
 *   - trigger   命中 / 未命中 时触发
 *   - autoResult 触发后对应的自动审核结果
 *   - priority  决定规则：直接定结论，不再看分数；预警规则：只重点提示，结论仍看分数
 */
export type SpecialRuleTrigger = 'hit' | 'miss'
export const SPECIAL_TRIGGER_LABEL: Record<SpecialRuleTrigger, string> = { hit: '命中', miss: '未命中' }
export type SpecialRulePriority = 'decisive' | 'warning'
export const SPECIAL_PRIORITY_LABEL: Record<SpecialRulePriority, string> = { decisive: '决定规则', warning: '预警规则' }
export const SPECIAL_PRIORITY_HINT: Record<SpecialRulePriority, string> = {
  decisive: '触发后直接定结论，不再参考总分',
  warning: '触发后重点提示，结论仍以总分为准',
}
export interface SpecialRule {
  id: string
  sectionId: string            // 来源分段（报告内容配置里的集合）
  fieldId: string              // 来源展示项 id
  sectionName: string          // 快照：分段名（展示用）
  ruleName: string             // 快照：规则/展示项名（同时用于报告详情按名匹配）
  trigger: SpecialRuleTrigger
  autoResult: AutoResult
  priority: SpecialRulePriority
  note?: string
  /* 评分构成（构成项分解表由特殊命中规则驱动时取用）：单条规则得分与权重 */
  score?: number               // 该规则命中对异常值的贡献分（越高风险越高）
  weight?: number              // 该规则所属分段的权重（百分比），缺省取来源分段 weight
}

export interface SpecialRuleVerdict {
  decisive: SpecialRule[]      // 已触发的决定规则
  warnings: SpecialRule[]      // 已触发的预警规则
  finalResult?: AutoResult     // 决定规则给出的结论（多条时取最严：拒绝 > 转人工 > 通过）
}
const AUTO_RESULT_SEVERITY: Record<AutoResult, number> = { 通过: 0, 转人工: 1, 拒绝: 2 }
/** 报告详情侧：按「已命中规则名列表」评估特殊命中规则，得出是否直接定结论 */
export function evalSpecialRules(rules: SpecialRule[] | undefined, hitNames: string[]): SpecialRuleVerdict {
  const norm = (s: string) => s.replace(/[\s·、，,。.（）()]/g, '')
  const hits = hitNames.map(norm)
  const isHit = (name: string) => {
    const n = norm(name)
    return hits.some((h) => h === n || h.includes(n) || n.includes(h))
  }
  const triggered = (rules ?? []).filter((r) => (r.trigger === 'hit' ? isHit(r.ruleName) : !isHit(r.ruleName)))
  const decisive = triggered.filter((r) => r.priority === 'decisive')
  const warnings = triggered.filter((r) => r.priority === 'warning')
  const finalResult = decisive.length
    ? decisive.reduce((a, b) => (AUTO_RESULT_SEVERITY[b.autoResult] > AUTO_RESULT_SEVERITY[a.autoResult] ? b : a)).autoResult
    : undefined
  return { decisive, warnings, finalResult }
}

/* 审核操作 · 业务流程（每行对应「评分方案」的一个分段，字段按该分段 autoResult 取用）：
 *  - 通过：passNeedConfirm（需人工确认？）→ passConfirmRole（确认人）
 *  - 拒绝：rejectAllowRecheck（允许复审？）→ recheckSubmitRole（复审发起人）+ recheckApproveRole（复审审核人）
 *  - 转人工：manualSuggestRole（建议提交人）→ manualApproveRole（建议审核人） */
export interface BusinessFlowConfig {
  gradeId: string
  suggestionText: string
  passNeedConfirm: boolean
  passConfirmRole: ReviewRole
  rejectAllowRecheck: boolean
  recheckSubmitRole: ReviewRole
  recheckApproveRole: ReviewRole
  manualSuggestRole: ReviewRole
  manualApproveRole: ReviewRole
  /* 自由画布流程图（运行时审批弹窗使用，可选）；在「审核操作配置」Tab 的弹窗画布中编辑。
     一个评分分段可配多条业务流程，每条对应一个画布图，列表列逐条展示并可编辑/删除 */
  flowGraphs?: FlowGraph[]
}

/* ============================================================================
 * 审核操作 · 自由画布流程图（每个评分分段一张图，在弹窗画布中编辑）
 * - 节点：开始 / 人工审核 / 自动处理 / 抄送通知 / 结束，坐标为画布内绝对位置
 * - 连线：from → to（可带标签，如「通过」「拒绝」）
 * ========================================================================= */
/* 节点类型收敛为三类：开始节点（流程入口）/ 普通节点（任一人工操作步）/ 结束节点（终态） */
export type FlowNodeType = 'start' | 'normal' | 'end'
export const FLOW_NODE_TYPE_LABEL: Record<FlowNodeType, string> = {
  start: '开始节点', normal: '普通节点', end: '结束节点',
}
export const FLOW_NODE_TYPE_COLOR: Record<FlowNodeType, { bg: string; border: string; text: string }> = {
  start: { bg: '#ECFDF5', border: '#10B981', text: '#065F46' },
  normal: { bg: '#EFF6FF', border: '#3B82F6', text: '#1E40AF' },
  end: { bg: '#F8FAFC', border: '#94A3B8', text: '#475569' },
}
/* （自动处置/条件分支类型已移除：节点类型收敛为 开始/普通/结束 三类） */

/* —— 人工审核节点：审核事项 / 审批结果 / 审批意见 / 审批表单（参考成形 OA 的审批单配置）—— */
export const REVIEW_CHECK_ITEMS = [
  '身份真实性核验', '资料完整性检查', '收入与负债评估', '征信报告复核', '反欺诈规则复核', '额度与利率合理性',
] as const
// 审批结果：固定三选一，驱动流程走向（不可自定义；「驳回」已按需求改为「转人工」）
export type ReviewResult = '通过' | '转人工' | '拒绝'
export const REVIEW_RESULTS: ReviewResult[] = ['通过', '转人工', '拒绝']
// 审批意见：按审批结果分组的预设选项（默认空，配置端添加后才有标签；运行时另允许手输）
export const DEFAULT_OPINIONS: Record<ReviewResult, string[]> = {
  '通过': ['调整利率', '调整借贷金额'],
  '转人工': ['信息存疑，请人工复核'],
  '拒绝': ['风控评分不足', '反欺诈规则命中'],
}
// 深拷贝默认审批意见预设（避免共用同一数组引用）
export function defaultOpinionPresets(): Record<ReviewResult, string[]> {
  return { '通过': [...DEFAULT_OPINIONS['通过']], '转人工': [...DEFAULT_OPINIONS['转人工']], '拒绝': [...DEFAULT_OPINIONS['拒绝']] }
}
/** 兼容旧数据：审批结果里的「驳回」统一归一化为「转人工」（含意见预设键迁移，旧持久化模板仍可运行） */
export function normalizeReviewResults(
  results: string[] | undefined,
  opinionPresets?: Partial<Record<string, string[]>>,
): { results: ReviewResult[]; opinionPresets: Record<ReviewResult, string[]> } {
  const norm = (r: string) => (r === '驳回' ? '转人工' : r)
  const rs = (results ?? REVIEW_RESULTS).map(norm)
  const uniq = [...new Set(rs)].filter((r): r is ReviewResult => (REVIEW_RESULTS as string[]).includes(r))
  const merged: ReviewResult[] = uniq.length ? uniq : [...REVIEW_RESULTS]
  const presets = { '通过': [], '转人工': [], '拒绝': [] } as Record<ReviewResult, string[]>
  if (opinionPresets) {
    for (const k of ['通过', '转人工', '拒绝', '驳回'] as const) {
      const arr = opinionPresets[k] ?? []
      if (arr.length) presets[norm(k) as ReviewResult] = [...(presets[norm(k) as ReviewResult] ?? []), ...arr]
    }
  }
  return { results: merged, opinionPresets: presets }
}
/* （超时处理类型已移除：节点类型收敛为 开始/普通/结束 三类） */

export interface FlowGraphNode {
  id: string
  type: FlowNodeType
  label: string          // 节点标题（画布上显示的名称）
  buttonName?: string    // 按钮名称（运行时操作按钮上显示的文案；缺省回退到 label）
  x: number              // 画布坐标（左上角）
  y: number
  role?: ReviewRole      // 经办角色（谁操作本节点）
  checkItems?: string[]  // 弹出内容·审核事项（审核什么，可自定义）
  results?: ReviewResult[]  // 弹出内容·审批结果（通过/驳回/拒绝），可多选
  opinionPresets?: Record<ReviewResult, string[]> // 弹出内容·审批意见预设（按结果分组，可自定义增删）
  resultStates?: Partial<Record<ReviewResult, string>> // 决策节点（有审批结果）：每结果 → 操作后状态（取自「状态枚举类」），运行时据此驱动状态列
  postState?: string     // 动作节点（无审批结果）：操作后的固定状态（取自「状态枚举类」）
  showButton?: boolean   // 结束节点：是否在结束状态显示按钮
  note?: string          // 附注
}
export interface FlowGraphEdge {
  id: string
  from: string
  to: string
  label?: string         // 连线语义（如 通过/拒绝/退回）
}
export interface FlowGraph {
  name?: string          // 流程名称（运行时操作按钮的标识；如「确认通过」「转人工审核」）
  nodes: FlowGraphNode[]
  edges: FlowGraphEdge[]
}

/* 自动结果 → 默认触发按钮文案（运行时操作栏按此渲染按钮；可在「审核操作配置」里逐流程改名） */
export function defaultButtonName(autoResult: AutoResult): string {
  return autoResult === '通过' ? '确认通过' : autoResult === '拒绝' ? '确认拒绝' : '转人工审核'
}

/* 由分段的旧式勾选配置生成默认画布图（首次打开画布时兜底）；起点节点即运行时触发按钮 */
export function buildDefaultFlowGraph(flow: BusinessFlowConfig, autoResult: AutoResult, buttonName?: string): FlowGraph {
  const startLabel = buttonName ?? defaultButtonName(autoResult)
  const nodes: FlowGraphNode[] = [{ id: 'n_start', type: 'start', label: startLabel, buttonName: startLabel, x: 40, y: 120 }]
  const edges: FlowGraphEdge[] = []
  let prev = 'n_start'
  const link = (to: string, label?: string) => { edges.push({ id: `e_${prev}_${to}`, from: prev, to, label }); prev = to }
  if (autoResult === '通过') {
    nodes.push({ id: 'n_audit', type: 'normal', label: '人工确认', x: 320, y: 120, role: flow.passConfirmRole, checkItems: ['资料完整性检查'], results: ['通过', '转人工'], opinionPresets: defaultOpinionPresets(), postState: '通过' })
    link('n_audit')
  } else if (autoResult === '拒绝') {
    if (flow.rejectAllowRecheck) {
      nodes.push({ id: 'n_resubmit', type: 'normal', label: '复审发起', x: 320, y: 60, role: flow.recheckSubmitRole, checkItems: ['资料完整性检查', '征信报告复核'], results: ['通过', '转人工', '拒绝'], opinionPresets: defaultOpinionPresets(), postState: '待复审' })
      nodes.push({ id: 'n_reapprove', type: 'normal', label: '复审审核', x: 600, y: 60, role: flow.recheckApproveRole, checkItems: ['征信报告复核', '反欺诈规则复核'], results: ['通过', '转人工', '拒绝'], opinionPresets: defaultOpinionPresets(), postState: '已复审' })
      edges.push({ id: 'e_start_resubmit', from: 'n_start', to: 'n_resubmit', label: '申请复审' })
      edges.push({ id: 'e_resubmit_reapprove', from: 'n_resubmit', to: 'n_reapprove' })
      prev = 'n_reapprove'
    } else {
      nodes.push({ id: 'n_reject', type: 'normal', label: '拒绝办结', x: 320, y: 120, role: flow.recheckApproveRole, checkItems: ['反欺诈规则复核'], results: ['拒绝'], opinionPresets: defaultOpinionPresets(), postState: '已拒绝' })
      link('n_reject')
    }
  } else {
    nodes.push({ id: 'n_suggest', type: 'normal', label: '提交建议', x: 320, y: 120, role: flow.manualSuggestRole, checkItems: ['身份真实性核验', '收入与负债评估'], results: ['通过', '转人工', '拒绝'], opinionPresets: defaultOpinionPresets(), postState: '待人工' })
    link('n_suggest')
    nodes.push({ id: 'n_approve', type: 'normal', label: '审核建议', x: 600, y: 120, role: flow.manualApproveRole, checkItems: ['征信报告复核', '额度与利率合理性'], results: ['通过', '转人工', '拒绝'], opinionPresets: defaultOpinionPresets(), postState: '已审核' })
    link('n_approve')
  }
  const ex = prev === 'n_approve' || prev === 'n_reapprove'
  nodes.push({ id: 'n_end', type: 'end', label: '结束', x: ex ? 860 : 600, y: prev === 'n_resubmit' ? 60 : 120, showButton: true })
  link('n_end')
  return { name: startLabel, nodes, edges }
}

/* 画布图 → 缩写摘要（回显在分段表「业务流程配置」列，如：评分完成 → 自动通过 → 人工确认(风控主管) → 结束） */
export function summarizeFlowGraph(g: FlowGraph): string {
  if (!g.nodes.length) return '（空流程）'
  const nodeMap = new Map(g.nodes.map((n) => [n.id, n]))
  const outMap = new Map<string, FlowGraphEdge[]>()
  g.edges.forEach((e) => { const a = outMap.get(e.from) ?? []; a.push(e); outMap.set(e.from, a) })
  const start = g.nodes.find((n) => n.type === 'start') ?? g.nodes[0]
  const parts: string[] = []
  const seen = new Set<string>()
  let cur: FlowGraphNode | undefined = start
  while (cur && !seen.has(cur.id) && parts.length < 8) {
    seen.add(cur.id)
    const disp = cur.buttonName ?? cur.label
    parts.push(cur.role ? `${disp}(${cur.role})` : disp)
    const outs: FlowGraphEdge[] = outMap.get(cur.id) ?? []
    cur = outs.length ? nodeMap.get(outs[0].to) : undefined
  }
  const branchCount = g.edges.length - (parts.length - 1)
  return parts.join(' → ') + (branchCount > 0 ? `（+${branchCount} 条分支线）` : '')
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

/* ---------- 综合总分可视化公式（决策报告：把三大报告分数按可配置公式聚合） ---------- */
export type FormulaOp = '+' | '-'
export interface FormulaTerm {
  id: string
  op: FormulaOp          // 该 term 前的运算符（首项的 ± 也由此决定，支持"有的地方加、有的地方减"）
  kind: 'var' | 'const'
  varId?: string        // kind==='var'：引用 DECISION_SCORE_VARS 中的变量
  constVal?: number     // kind==='const'：常数
  factor: number        // 系数（变量/常数前的乘数，默认 1）
}
export interface ScoreFormula {
  terms: FormulaTerm[]
  updatedAt?: string
}
/** 公式可用变量（来自三大报告的关键分数；dir 仅作方向提示，符号由公式运算符决定） */
export interface FormulaVar {
  id: string
  label: string
  dir: 'up-good' | 'up-bad'
  sample: number        // 配置页实时预览用的样例值
  rangeHint?: string    // 变量取值范围提示，如 "0～80"
}
export const DECISION_SCORE_VARS: FormulaVar[] = [
  { id: 'credit_score', label: '信用评分', dir: 'up-good', sample: 720 },
  { id: 'info_score', label: '信息核验得分', dir: 'up-bad', sample: 20 },
  { id: 'fraud_score', label: '欺诈评分', dir: 'up-bad', sample: 30 },
]
/** 决策报告默认综合公式：信用评分×0.4 − 欺诈评分×0.3 − 信息核验得分×0.3（仅示例，可改） */
export const DEFAULT_DECISION_FORMULA: ScoreFormula = {
  terms: [
    { id: 't1', op: '+', kind: 'var', varId: 'credit_score', factor: 0.4 },
    { id: 't2', op: '-', kind: 'var', varId: 'fraud_score', factor: 0.3 },
    { id: 't3', op: '-', kind: 'var', varId: 'info_score', factor: 0.3 },
  ],
}
/** 按变量值求值综合总分；无公式返回 null */
export function evaluateFormula(f: ScoreFormula | undefined, values: Record<string, number>): number | null {
  if (!f || f.terms.length === 0) return null
  let sum = 0
  for (const t of f.terms) {
    const base = t.kind === 'var' ? (values[t.varId ?? ''] ?? 0) : (t.constVal ?? 0)
    sum += (t.op === '-' ? -1 : 1) * t.factor * base
  }
  return sum
}
/** 由各数据块（section）按权重自动排好的「综合总分」默认公式：
 * 仅取「报告内容配置」Tab 下的数据块（homeTab === 'content'）作为变量，系数取该块权重（缺省 1）；
 * 方向与该块计分方向一致（命中扣分 deduct 取减，其余取加）。
 * 这样在「报告内容配置」里给的权重 / 最大最小，到综合公式这边即可直接加权求和。 */
export function buildDefaultScoreFormula(sections: SectionConfig[]): ScoreFormula {
  const scored = sections.filter((s) => (s.homeTab ?? 'content') === 'content')
  return {
    terms: scored.map((s, i) => ({
      id: 't' + (i + 1),
      op: s.cardScoreMode === 'deduct' ? '-' : '+',
      kind: 'var',
      varId: 'sec_' + s.id,
      factor: s.weight ?? 1,
    })),
  }
}

/** 生成可读公式文本，如 "信用评分×0.4 − 欺诈评分×0.3" */
export function formulaText(f: ScoreFormula | undefined, vars: FormulaVar[]): string {
  if (!f || f.terms.length === 0) return '未配置公式'
  const varOf = (id?: string) => vars.find((v) => v.id === id)
  return f.terms.map((t, i) => {
    const sign = t.op === '-' ? '− ' : (i === 0 ? '' : '+ ')
    const v = t.kind === 'var' ? varOf(t.varId) : undefined
    const base = t.kind === 'var' ? (v?.label ?? t.varId ?? '?') + (v?.rangeHint ? `(${v.rangeHint})` : '') : `常数(${t.constVal ?? 0})`
    const fac = Math.abs(t.factor) === 1 ? '' : `×${Number(t.factor)}`
    return `${sign}${base}${fac}`
  }).join(' ')
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
  scoreBlock: { show: boolean; title: string; min: number; max: number; rejectCount: number }   // 评分方案 Tab → 报告内「得分计算」卡片：是否显示 + 标题 + 分值预测（可配置，不再计算）
  flowBlock: { show: boolean; title: string; statusEnum: string[] }   // 审核操作 Tab → 报告内「结论与终审」卡片：是否显示 + 报告内卡片标题 + 状态枚举类
  showOpLog: boolean        // 报告中是否显示操作日志（'log' 类分段的总开关）
  showSectionTotals: boolean // 「报告内容配置」Tab 开关：各集合展示汇总得分 + 报告详情首卡展示「评分维度分布」列表
  dimBands?: DimLevelBand[]   // 评分维度分布：模板级三档区间（高/中/低）兜底；缺省时按各维度实际得分等比切分（见 defaultDimBandsForScore）
  /** 演示/备用报告：申请人示例信息（key=字段名，value=值），由模板驱动的报告详情读取并展示 */
  demoApplicant?: Record<string, string>
  scoreDisplay: ScoreDisplayConfig
  scoreFormula?: ScoreFormula  // 决策报告：综合总分可视化公式（由 FormulaEditor 编辑，详情页 evaluateFormula 求值展示）
  specialRules: SpecialRule[]   // 自动审核 Tab → 特殊命中规则：命中即定结论（决定规则）/ 重点提示（预警规则）
  businessFlow: BusinessFlowConfig[]
  theme: ThemeConfig
  export: ExportConfig
  changeLogs: TemplateChangeLog[]
}

/* ---------- 报告类型元信息 ---------- */
export const REPORT_META: Record<ReportType, { icon: string; label: string; color: 'blue' | 'cyan' | 'violet' | 'green'; hint: string }> = {
  info_verify: { icon: '📋', label: '信息核验', color: 'blue', hint: '核验申请人身份、资料与设备真实性，输出异常值' },
  credit: { icon: '📊', label: '信用风控', color: 'cyan', hint: '基于六维数据评估信用评分，给出授信建议' },
  fraud: { icon: '🛡️', label: '欺诈识别', color: 'violet', hint: '识别身份/设备/行为/团伙欺诈，输出欺诈分' },
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


/* ---------- 分段与字段清单（含业务说明） ---------- */
export const SECTION_CATALOG: Record<ReportType, { id: string; name: string; desc: string; groups?: FieldGroup[]; fields: { id: string; name: string; desc: string; group?: string }[] }[]> = {
  info_verify: [
    {
      id: 'score_model', name: '得分计算', desc: '报告顶部的总风险值卡片：分数越大代表风险越高（0-100，≥80 为高危）。属于「自动审核」Tab，由已配置的数据源/规则集算得，不在「报告内容」里配来源。',
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
      id: 'conclusion_process', name: '结论与终审', desc: '系统自动结论 + 人工审核结果 + 终审操作入口，以及核验过程时间线。属于「人工审核」Tab，由已配置的数据源/规则集算得，不在「报告内容」里配来源。',
      fields: [
        { id: 'cp_system', name: '自动审核', desc: '机器自动给出的处置结论（通过/预警/拒绝），由分数计算后判定' },
        { id: 'cp_manual', name: '人工审核', desc: '人工操作后的工单状态（待确认/确认通过/确认拒绝/提交复核/复核通过/复核拒绝/关闭）' },
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
      groups: [
        { id: 'g_base', name: '基础资料' },
        { id: 'g_env', name: '环境采集' },
      ],
      fields: [
        { id: 'bi_name', name: '姓名', desc: '申请人姓名', group: 'g_base' },
        { id: 'bi_id', name: '身份证号', desc: '脱敏后的证件号', group: 'g_base' },
        { id: 'bi_phone', name: '手机号', desc: '申请所用手机号', group: 'g_base' },
        { id: 'bi_bank', name: '银行卡号', desc: '收款/绑定银行卡', group: 'g_base' },
        { id: 'bi_bank_branch', name: '开户行', desc: '银行卡归属支行', group: 'g_base' },
        { id: 'bi_age', name: '年龄', desc: '申请人年龄', group: 'g_base' },
        { id: 'bi_edu', name: '学历', desc: '最高学历', group: 'g_base' },
        { id: 'bi_company', name: '工作单位', desc: '任职单位', group: 'g_base' },
        { id: 'bi_income', name: '月收入', desc: '申报月收入', group: 'g_base' },
        { id: 'bi_address', name: '居住地址', desc: '常住地址', group: 'g_base' },
        { id: 'bi_marriage', name: '婚姻', desc: '婚姻状况', group: 'g_base' },
        { id: 'bi_fp', name: '设备指纹', desc: '本机设备指纹标识', group: 'g_env' },
        { id: 'bi_ip', name: 'IP地址', desc: '申请时 IP', group: 'g_env' },
        { id: 'bi_gps', name: 'GPS定位', desc: '申请时定位', group: 'g_env' },
        { id: 'bi_channel', name: '进件渠道', desc: '来自哪个渠道', group: 'g_env' },
        { id: 'bi_appver', name: 'APP版本', desc: '申请所用 App 版本', group: 'g_env' },
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
        { id: 'sv_operator', name: '运营商实名（可独立隐藏）', desc: '运营商实名核验', options: ['已实名', '未实名', '未核验'] },
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
      id: 'credit_overview', name: '信用评分总览', desc: '顶部环形图：信用评分 + 风险等级 Badge + 行业平均对比 + 六大维度评分条（含权重）。',
      fields: [
        { id: 'co_ring', name: '信用评分环形图', desc: '总评分环形图（DisplayComponent=环形图，模型已支持）' },
        { id: 'co_level', name: '风险等级 Badge', desc: 'A/B/C/D 等级彩色标签' },
        { id: 'co_industry', name: '行业平均对比', desc: '与行业平均分的对比标注' },
        { id: 'co_dims', name: '六大维度评分条', desc: '身份/还款/信用历史/行为/设备/关联 六维 ProgressBar（标注权重）' },
        { id: 'co_tags', name: '风险标签', desc: '命中的风险标签' },
      ],
    },
    {
      id: 'credit_factors', name: '风险因子分析', desc: '六维风险因子卡片：每维含得分/权重/等级/逻辑/来源。',
      fields: [
        { id: 'cf_dim_card', name: '六维因子卡片', desc: '身份/还款/信用历史/行为/设备/关联 各一张卡片' },
        { id: 'cf_dim_score', name: '维度得分', desc: '该维得分' },
        { id: 'cf_dim_weight', name: '维度权重', desc: '该维权重' },
        { id: 'cf_dim_level', name: '维度等级', desc: '该维风险等级' },
        { id: 'cf_dim_logic', name: '维度逻辑', desc: '该维判定逻辑' },
        { id: 'cf_dim_source', name: '维度来源', desc: '该维数据来源' },
        { id: 'cf_table', name: '维度说明表', desc: '六维 权重/逻辑/来源 汇总表' },
      ],
    },
    {
      id: 'credit_trend', name: '信用评分趋势', desc: '用户近 7 月信用评分 vs 行业平均的趋势折线图。',
      fields: [
        { id: 'ct_line', name: '趋势折线图', desc: '⚠️ DisplayComponent 无折线/趋势图类型，需模型扩展（GAP）' },
        { id: 'ct_user', name: '用户评分曲线', desc: '用户每月评分' },
        { id: 'ct_industry', name: '行业平均曲线', desc: '行业每月平均' },
      ],
    },
    {
      id: 'credit_radar', name: '风险维度雷达图', desc: '当前六维 vs 行业平均的雷达图。',
      fields: [
        { id: 'cr_radar', name: '雷达图', desc: '⚠️ DisplayComponent 无雷达图类型，需模型扩展（GAP）' },
        { id: 'cr_cur', name: '当前维度值', desc: '当前六维值' },
        { id: 'cr_avg', name: '行业平均维度值', desc: '行业平均六维值' },
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
        { id: 'bf_cmp', name: '与正常用户对比', desc: '与正常用户行为基线的偏离度' },
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
      id: 'applicant_info', name: '用户基本信息', desc: '申请人身份与基础资料。',
      fields: [
        { id: 'ai_name', name: '姓名', desc: '申请人姓名' },
        { id: 'ai_id', name: '身份证号', desc: '脱敏证件号' },
        { id: 'ai_phone', name: '手机号', desc: '手机号' },
        { id: 'ai_bank', name: '银行卡号', desc: '银行卡号' },
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
    { grade: '安全', label: '风险可控', minScore: 0, maxScore: 20, riskLevel: '低', color: '#10B981', autoResult: '通过', description: '异常值处于低位，风险可控，建议正常通过' },
    { grade: '关注', label: '中等风险', minScore: 21, maxScore: 50, riskLevel: '中', color: '#F59E0B', autoResult: '转人工', description: '异常值中等，建议关注个别风险项' },
    { grade: '警示', label: '较高风险', minScore: 51, maxScore: 80, riskLevel: '高', color: '#F97316', autoResult: '转人工', description: '异常值较高，建议人工复核' },
    { grade: '高危', label: '极高风险', minScore: 81, maxScore: 100, riskLevel: '极高', color: '#EF4444', autoResult: '拒绝', description: '异常值极高，强烈建议预警处置' },
  ],
  /* 信用风控：信用评分，越高越好 */
  credit: [
    { grade: 'A', label: '优秀', minScore: 75, maxScore: 100, riskLevel: '低', color: '#10B981', autoResult: '通过', description: '信用优秀，建议正常授信' },
    { grade: 'B', label: '良好', minScore: 60, maxScore: 74, riskLevel: '中', color: '#F59E0B', autoResult: '通过', description: '信用良好，建议正常授信' },
    { grade: 'C', label: '一般', minScore: 45, maxScore: 59, riskLevel: '高', color: '#F97316', autoResult: '转人工', description: '信用一般，建议人工复核' },
    { grade: 'D', label: '较差', minScore: 0, maxScore: 44, riskLevel: '高', color: '#EF4444', autoResult: '拒绝', description: '信用较差，建议拒绝授信' },
  ],
  /* 欺诈识别：欺诈分，越高越危险 */
  fraud: [
    { grade: '极低', label: '极低风险', minScore: 0, maxScore: 19, riskLevel: '低', color: '#10B981', autoResult: '通过', description: '极低风险，可正常通过' },
    { grade: '低', label: '低风险', minScore: 20, maxScore: 39, riskLevel: '低', color: '#10B981', autoResult: '通过', description: '低风险，建议正常通过' },
    { grade: '中', label: '中风险', minScore: 40, maxScore: 59, riskLevel: '中', color: '#F59E0B', autoResult: '转人工', description: '中风险，建议人工复核' },
    { grade: '高', label: '高风险', minScore: 60, maxScore: 79, riskLevel: '高', color: '#F97316', autoResult: '拒绝', description: '高风险，建议拒绝授信' },
    { grade: '极高', label: '极高风险', minScore: 80, maxScore: 100, riskLevel: '极高', color: '#EF4444', autoResult: '拒绝', description: '极高风险，强烈建议拒绝并加入黑名单' },
  ],
  /* 决策报告：综合分，越高越好 */
  decision: [
    { grade: '优先通过', label: '优先通过', minScore: 80, maxScore: 100, riskLevel: '低', color: '#10B981', autoResult: '通过', description: '综合风险极低，建议优先授信' },
    { grade: '通过', label: '通过', minScore: 60, maxScore: 79, riskLevel: '低', color: '#10B981', autoResult: '通过', description: '综合风险低，建议正常授信' },
    { grade: '限制额度', label: '限制额度', minScore: 40, maxScore: 59, riskLevel: '中', color: '#F59E0B', autoResult: '转人工', description: '综合风险中等，建议限制额度' },
    { grade: '严格限制', label: '严格限制', minScore: 20, maxScore: 39, riskLevel: '高', color: '#F97316', autoResult: '拒绝', description: '综合风险较高，建议严格限制' },
    { grade: '拒绝', label: '拒绝', minScore: 0, maxScore: 19, riskLevel: '高', color: '#EF4444', autoResult: '拒绝', description: '综合风险高，建议拒绝授信' },
  ],
}

/**
 * 新建模板的默认分段：统一三段 A/B/C（用户约定「新创建的默认都是 abc」）。
 * 区间方向随分值语义对齐显示效果——保证「好档」始终出现在刻度条右侧：
 *   - 'credit'（信息核验/欺诈，展示翻转：越高越安全）→ 好档在原始低分（翻转后到右侧）
 *   - 'risk'（信用/决策，越高越好）→ 好档在原始高分（右侧）
 * 区间始终连续铺满 [0,100]，不重叠无缝隙。
 * 注意：仅用于 createNew，已存在的 4 类种子模板仍保留各自语义档（安全/关注/警示/高危、A/B/C/D、5 档等）。
 */
export function defaultABCGrades(semantic: ScoreSemantic = 'risk'): ScoreGrade[] {
  if (semantic === 'credit') {
    return [
      { grade: 'A', label: '优秀', minScore: 0, maxScore: 40, riskLevel: '低', color: '#10B981', autoResult: '通过', description: '综合评分优秀，建议正常通过' },
      { grade: 'B', label: '良好', minScore: 40, maxScore: 75, riskLevel: '中', color: '#F59E0B', autoResult: '转人工', description: '综合评分中等，建议人工复核' },
      { grade: 'C', label: '较差', minScore: 75, maxScore: 100, riskLevel: '高', color: '#EF4444', autoResult: '拒绝', description: '综合评分较差，建议拒绝授信' },
    ]
  }
  return [
    { grade: 'A', label: '优秀', minScore: 75, maxScore: 100, riskLevel: '低', color: '#10B981', autoResult: '通过', description: '综合评分优秀，建议正常通过' },
    { grade: 'B', label: '良好', minScore: 40, maxScore: 74, riskLevel: '中', color: '#F59E0B', autoResult: '转人工', description: '综合评分中等，建议人工复核' },
    { grade: 'C', label: '较差', minScore: 0, maxScore: 39, riskLevel: '高', color: '#EF4444', autoResult: '拒绝', description: '综合评分较差，建议拒绝授信' },
  ]
}

/** 根据实际分值预测范围 [min, max] 自动生成 N 段均匀分段（默认 3 段 A/B/C）。
 *  区间无缝铺满，不重叠无缝隙。好档始终在刻度条右侧。 */
export function buildDefaultGradesForRange(
  min: number,
  max: number,
  count = 3,
  semantic: ScoreSemantic = 'risk',
): ScoreGrade[] {
  if (max <= min) max = min + 1
  const span = max - min
  const seg = Math.ceil(span / count)
  const colors = ['#10B981', '#F59E0B', '#F97316', '#EF4444', '#7C3AED']
  const labels = ['A', 'B', 'C', 'D', 'E']
  const results: ScoreGrade[] = []
  for (let i = 0; i < count; i++) {
    const lo = min + i * seg
    const hi = i === count - 1 ? max : Math.min(max, lo + seg - 1)
    // credit 语义（异常值：低分=安全→好档在低分段）；risk 语义（信用值：高分=安全→好档在高分段）
    const idx = semantic === 'credit' ? i : count - 1 - i
    const g = labels[idx] ?? labels[labels.length - 1]
    results.push({
      grade: g,
      label: g,
      minScore: lo,
      maxScore: hi,
      riskLevel: idx === 0 ? '低' : idx === 1 ? '中' : '高',
      color: colors[idx % colors.length],
      autoResult: idx === 0 ? '通过' : idx === count - 1 ? '拒绝' : '转人工',
      description: `分段 ${g}`,
    })
  }
  return results
}

/* ---------- 业务流程默认映射（index 与 grades 对齐） ---------- */
/* 默认流程行：通过=需初审员确认；拒绝=允许复审（复审员发起、风控主管审核）；转人工=初审员提建议、风控主管审建议 */
export function defaultFlowRow(gradeId: string, suggestionText: string): BusinessFlowConfig {
  return {
    gradeId, suggestionText,
    passNeedConfirm: true, passConfirmRole: '初审员',
    rejectAllowRecheck: true, recheckSubmitRole: '复审员', recheckApproveRole: '风控主管',
    manualSuggestRole: '初审员', manualApproveRole: '风控主管',
    flowGraphs: [],
  }
}
/* 第 0 行固定为"计算中"占位，其后每一行对应 grades[i]（流程细节按分段 autoResult 在 UI 中取用对应字段） */

/* 由业务流程配置生成一张「终审审核」流程图：审核事项 / 审批结果 / 审批意见预设全部来自配置，
 * 使 getAuditFlow 能取出报告专属、按档位区分的审核内容（不再走通用兜底）。 */
function mkAuditGraph(
  autoResult: AutoResult,
  content: { checkItems: string[]; results: ReviewResult[]; opinion?: Partial<Record<ReviewResult, string[]>> },
  buttonName?: string,
): FlowGraph {
  const opin: Record<ReviewResult, string[]> = {
    '通过': content.opinion?.['通过'] ?? ['正常通过'],
    '转人工': content.opinion?.['转人工'] ?? (content.opinion as any)?.['驳回'] ?? ['信息存疑，请复核'],
    '拒绝': content.opinion?.['拒绝'] ?? ['风险过高，建议拒绝'],
  }
  const post: string = autoResult === '通过' ? '已通过' : autoResult === '拒绝' ? '已拒绝' : '已审核'
  const startLabel = buttonName ?? defaultButtonName(autoResult)
  return {
    name: startLabel,
    nodes: [
      { id: 'n_start', type: 'start', label: startLabel, buttonName: startLabel, x: 40, y: 140 },
      { id: 'n_audit', type: 'normal', label: '终审审核', x: 360, y: 140, role: '风控主管', checkItems: content.checkItems, results: content.results, opinionPresets: opin, postState: post },
      { id: 'n_end', type: 'end', label: '结束', x: 640, y: 140, showButton: true },
    ],
    edges: [
      { id: 'e1', from: 'n_start', to: 'n_audit' },
      { id: 'e2', from: 'n_audit', to: 'n_end' },
    ],
  }
}
function mkFlow(
  gradeId: string,
  suggestionText: string,
  autoResult: AutoResult,
  content: { checkItems: string[]; results: ReviewResult[]; opinion?: Partial<Record<ReviewResult, string[]>> },
): BusinessFlowConfig {
  return { ...defaultFlowRow(gradeId, suggestionText), flowGraphs: [mkAuditGraph(autoResult, content)] }
}

export const FLOW_PRESETS: Record<ReportType, BusinessFlowConfig[]> = {
  /* 信息核验：异常值，越高越危险（安全/关注/警示/高危） */
  info_verify: [
    defaultFlowRow('—', '系统正在计算异常值，请稍候…'),
    mkFlow('安全', GRADE_PRESETS.info_verify[0].description, '通过', {
      checkItems: ['身份真实性核验', '资料完整性检查'],
      results: ['通过', '转人工'],
      opinion: { '通过': ['异常值低位，正常通过'], '转人工': ['信息存疑，退回补充'] },
    }),
    mkFlow('关注', GRADE_PRESETS.info_verify[1].description, '转人工', {
      checkItems: ['异常项人工复核', '收入与负债评估'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '通过': ['风险可控，予以通过'], '拒绝': ['存在关注项，谨慎拒绝'] },
    }),
    mkFlow('警示', GRADE_PRESETS.info_verify[2].description, '转人工', {
      checkItems: ['设备群控核查', '黑名单命中复核', '公安/运营商联防复核'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['异常值较高，建议拒绝'] },
    }),
    mkFlow('高危', GRADE_PRESETS.info_verify[3].description, '拒绝', {
      checkItems: ['设备群控核查', '黑名单命中复核', '公安/运营商联防复核'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['异常值极高，建议拒绝处置', '命中黑名单，强制拦截'] },
    }),
  ],
  /* 信用风控：信用评分，越高越好（A/B/C/D） */
  credit: [
    defaultFlowRow('—', '系统正在计算评分…'),
    mkFlow('A', GRADE_PRESETS.credit[0].description, '通过', {
      checkItems: ['征信报告复核', '额度与利率合理性'],
      results: ['通过', '转人工'],
      opinion: { '通过': ['信用优秀，正常授信'] },
    }),
    mkFlow('B', GRADE_PRESETS.credit[1].description, '通过', {
      checkItems: ['征信报告复核', '额度与利率合理性'],
      results: ['通过', '转人工'],
      opinion: { '通过': ['信用良好，正常授信'] },
    }),
    mkFlow('C', GRADE_PRESETS.credit[2].description, '转人工', {
      checkItems: ['信用历史核查', '负债率评估'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['信用一般，谨慎授信'] },
    }),
    mkFlow('D', GRADE_PRESETS.credit[3].description, '拒绝', {
      checkItems: ['征信报告复核', '偿债能力评估'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['信用较差，建议拒绝授信'] },
    }),
  ],
  /* 欺诈识别：欺诈分，越高越危险（极低/低/中/高/极高） */
  fraud: [
    defaultFlowRow('—', '系统正在计算评分，请稍候…'),
    mkFlow('极低', GRADE_PRESETS.fraud[0].description, '通过', {
      checkItems: ['反欺诈规则复核'],
      results: ['通过', '转人工'],
      opinion: { '通过': ['极低风险，正常通过'] },
    }),
    mkFlow('低', GRADE_PRESETS.fraud[1].description, '通过', {
      checkItems: ['反欺诈规则复核'],
      results: ['通过', '转人工'],
      opinion: { '通过': ['低风险，正常通过'] },
    }),
    mkFlow('中', GRADE_PRESETS.fraud[2].description, '转人工', {
      checkItems: ['团伙欺诈核查', '设备关联图谱复核'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['中风险，建议人工研判'] },
    }),
    mkFlow('高', GRADE_PRESETS.fraud[3].description, '拒绝', {
      checkItems: ['团伙欺诈核查', '黑名单命中复核'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['高风险，建议拒绝授信'] },
    }),
    mkFlow('极高', GRADE_PRESETS.fraud[4].description, '拒绝', {
      checkItems: ['团伙欺诈核查', '黑名单命中复核', '设备群控核查'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['欺诈分极高，建议拒绝并加入黑名单'] },
    }),
  ],
  /* 决策报告：综合分，越高越好（优先通过/通过/限制额度/严格限制/拒绝） */
  decision: [
    defaultFlowRow('—', '系统正在生成综合决策，请稍候…'),
    mkFlow('优先通过', GRADE_PRESETS.decision[0].description, '通过', {
      checkItems: ['三项子报告一致性核对', '额度与利率合理性'],
      results: ['通过', '转人工'],
      opinion: { '通过': ['综合风险极低，优先授信'] },
    }),
    mkFlow('通过', GRADE_PRESETS.decision[1].description, '通过', {
      checkItems: ['三项子报告一致性核对'],
      results: ['通过', '转人工'],
      opinion: { '通过': ['综合风险低，正常授信'] },
    }),
    mkFlow('限制额度', GRADE_PRESETS.decision[2].description, '转人工', {
      checkItems: ['信用与欺诈综合研判'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['综合风险中等，限制额度'] },
    }),
    mkFlow('严格限制', GRADE_PRESETS.decision[3].description, '拒绝', {
      checkItems: ['信用与欺诈综合研判'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['综合风险较高，严格限制'] },
    }),
    mkFlow('拒绝', GRADE_PRESETS.decision[4].description, '拒绝', {
      checkItems: ['欺诈分主导研判', '信用复核'],
      results: ['通过', '转人工', '拒绝'],
      opinion: { '拒绝': ['综合风险高，建议拒绝授信'] },
    }),
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
      applicant_info: { ai_name: '李*', ai_id: '4401**********21', ai_phone: '139****2233', ai_age: '29', ai_edu: '硕士', ai_company: '**软件', ai_income: '3 万', ai_marriage: '未婚' },
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

/** 评分方案 · 得分来源汇总：把「报告内容配置」各卡片的得分汇总为总分。
 *  总分 = 基础分 + Σ各加分卡满分 − Σ各扣分卡最大扣分；命中即拒项不参与分值，单独计数。
 *  只统计归属「报告内容」Tab 且启用的分段。 */
export interface ScoreSourceRow {
  id: string
  name: string
  sourceType: SectionSource
  mode: CardScoreMode
  countedItems: number   // 参与计分的展示项数
  points: number         // 分值贡献（已乘权重）：add 卡为正（满分×权重）、deduct 卡为负（最大扣分×权重）
  weight: number         // 本卡权重
  rejectItems: number    // 命中即拒项数（命中直接拒贷，不走分段）
  visible: boolean
}
export interface ScoreSummary {
  rows: ScoreSourceRow[]
  baseScore: number
  addMax: number       // Σ加分卡满分
  deductMax: number    // Σ扣分卡最大扣分（正数表示）
  min: number          // 总分下限 = 基础分 − 最大扣分
  max: number          // 总分上限 = 基础分 + 加分满分
  rejectTotal: number  // 全部命中即拒项合计
}
export function computeScoreSummary(t: ReportTemplate): ScoreSummary {
  const rows: ScoreSourceRow[] = t.sections
    .filter((s) => (s.homeTab ?? 'content') === 'content')
    .sort((a, b) => a.order - b.order)
    .map((s) => {
      const r = computeSectionScore(s)
      const w = s.weight ?? 1
      const rejectItems = r.mode === 'reject'
        ? s.fields.filter((f) => f.visible).length
        : s.fields.filter((f) => f.visible && f.hitReject).length
      return {
        id: s.id, name: s.sourceName || s.name, sourceType: s.sourceType, mode: r.mode,
        countedItems: r.mode === 'add' ? r.addCount : r.deductCount,
        points: r.total * w, weight: w, rejectItems, visible: s.visible,
      }
    })
  const enabled = rows.filter((r) => r.visible)
  const addMax = enabled.reduce((sum, r) => sum + (r.mode === 'add' ? r.points : 0), 0)
  const deductMax = enabled.reduce((sum, r) => sum + (r.mode === 'deduct' ? -r.points : 0), 0)
  const baseScore = t.scoreDisplay.baseScore ?? 0

  // ===== 使用编辑综合总分公式评估分值预测范围 =====
  const formula = t.scoreFormula ?? buildDefaultScoreFormula(t.sections)
  // 构建各卡片的绝对总分映射（公式变量取绝对值，符号由公式项的 op 负责）
  const rawTotals: Record<string, number> = {}
  for (const s of t.sections.filter(s => (s.homeTab ?? 'content') === 'content')) {
    const r = computeSectionScore(s)
    rawTotals[s.id] = Math.abs(r.total)
  }
  // 分别代入使公式最大 / 最小的变量值
  const maxVals: Record<string, number> = {}
  const minVals: Record<string, number> = {}
  for (const term of formula.terms) {
    if (term.kind === 'var' && term.varId) {
      const secId = term.varId.replace('sec_', '')
      const raw = rawTotals[secId] ?? 0
      // + 项：取 raw 使总分最大，取 0 使总分最小
      // - 项：取 0 使总分最大，取 raw 使总分最小
      maxVals[term.varId] = term.op === '+' ? raw : 0
      minVals[term.varId] = term.op === '-' ? raw : 0
    }
  }
  const formulaMax = evaluateFormula(formula, maxVals) ?? 0
  const formulaMin = evaluateFormula(formula, minVals) ?? 0

  const specialRejectCount = (t.specialRules ?? []).filter((r) => r.autoResult === '拒绝').length
  return {
    rows, baseScore, addMax, deductMax,
    min: baseScore + formulaMin,
    max: baseScore + formulaMax,
    // 9.5.1 命中即拒 = 特殊命中规则中「命中-拒绝」的条目总数（用户定义；不再累加字段级命中即拒项）
    rejectTotal: specialRejectCount,
  }
}

/** 分段区间校验：应完整覆盖实际总分范围 [min, max]，且无重叠、无缝隙（按整数分值判断） */
export function validateGrades(grades: ScoreGrade[], min: number, max: number): string[] {
  const errs: string[] = []
  if (!grades.length) return ['尚未配置任何分段']
  const sorted = [...grades].sort((a, b) => a.minScore - b.minScore)
  for (const g of sorted) if (g.minScore > g.maxScore) errs.push(`「${g.grade}」区间下限大于上限（${g.minScore}~${g.maxScore}）`)
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1], cur = sorted[i]
    if (cur.minScore <= prev.maxScore) errs.push(`「${prev.grade}」与「${cur.grade}」区间重叠`)
    else if (cur.minScore > prev.maxScore + 1) errs.push(`「${prev.grade}」与「${cur.grade}」之间有缝隙（${prev.maxScore + 1}~${cur.minScore - 1} 无归属）`)
  }
  if (sorted[0].minScore > min) errs.push(`总分下限 ${min} 未覆盖（最低分段从 ${sorted[0].minScore} 起）`)
  if (sorted[sorted.length - 1].maxScore < max) errs.push(`总分上限 ${max} 未覆盖（最高分段到 ${sorted[sorted.length - 1].maxScore} 止）`)
  return errs
}

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
  const calc = flow[0] ?? defaultFlowRow('—', '系统正在计算评分，请稍候…')
  const per = grades.map((g, i) => {
    const prev = flow[i + 1]
    return prev
      ? { ...prev, gradeId: g.grade }
      : defaultFlowRow(g.grade, `${g.label}，请配置处置策略`)
  })
  return [calc, ...per]
}

/* 分段来源默认映射（seed 用；UI 中可改） */
export const SECTION_SOURCE: Record<string, SectionSource> = {
  // 信息核验
  score_model: 'api', conclusion_process: 'api', basic_info: 'data_source', id_images: 'api',
  single_verify: 'rule_set', cross_fusion: 'tpl_copy', op_logs: 'api',
  // 信用风控
  applicant_info: 'data_source',
      credit_suggestion: 'api',
  history_records: 'data_source', credit_logs: 'api',
  // 欺诈识别
  fraud_score_model: 'api', disposal_bar: 'api', identity_fraud: 'rule_set', info_forgery: 'rule_set',
  // 设备/行为/团伙/黑名单/历史 这五段在报告详情里是「字段明细」而非规则表，来源按数据源建模，
  // 展示项即字段本身（设备指纹、填写速度…），这样详情页每个 item 才能取到自己的分值。
  device_fraud: 'data_source', behavior_fraud: 'data_source', gang_fraud: 'data_source', blacklist_hit: 'data_source',
  history_fraud: 'data_source', fraud_logs: 'api',
  // 决策报告
  decision_overview: 'api', verify_summary: 'api', credit_summary: 'api', fraud_summary: 'api',
  decision_suggestion: 'api', decision_logs: 'api',
}
/* 分段计分方向覆盖表：默认「规则集=扣分 / 其余=加分」，此处显式指定的以此为准。
 * 欺诈识别的设备/行为/团伙/黑名单/历史五段虽按数据源建模，但业务上是命中即扣分。 */
export const SECTION_SCORE_MODE: Record<string, CardScoreMode> = {
  device_fraud: 'deduct', behavior_fraud: 'deduct', gang_fraud: 'deduct',
  blacklist_hit: 'deduct', history_fraud: 'deduct',
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
  identity_fraud: 'rs_identity',
  info_forgery: 'rs_identity', device_fraud: 'rs_device', behavior_fraud: 'rs_behavior',
  gang_fraud: 'rs_device', blacklist_hit: 'rs_device', history_fraud: 'rs_all',
}
/* 模板复制类分段 → 复制来源分段 id（复用既有内容合集，如「数据交叉融合」复用「多源并行核验」） */
export const SECTION_COPY_FROM: Record<string, string> = {
  cross_fusion: 'single_verify',
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
const SCORE_SECTION: Partial<Record<ReportType, string>> = {
  info_verify: 'score_model',
  fraud: 'fraud_score_model',
  decision: 'decision_overview',
}
const FLOW_SECTION: Partial<Record<ReportType, string>> = {
  info_verify: 'conclusion_process',
  fraud: 'disposal_bar',
  decision: 'decision_suggestion',
}
function buildSections(type: ReportType): SectionConfig[] {
  // built 用于 tpl_copy 段引用同模板内已建好的来源段（如「数据交叉融合」复用「多源并行核验」）
  const built: Record<string, SectionConfig> = {}
  return SECTION_CATALOG[type].map((s, i) => {
    const sType = SECTION_SOURCE[s.id] ?? 'data_source'
    let ds: DataSourceConfig | undefined
    let api: ApiConfig | undefined
    let ruleSetId: string | undefined
    let copyFromId: string | undefined
    let copyFromName: string | undefined
    let copySections: SectionConfig[] | undefined
    let copyScoreRange: { min: number; max: number; base: number } | undefined
    let fields: FieldConfig[]

    if (sType === 'data_source') {
      // 数据源：初始用 seed 字段名作为表字段占位（type 默认 varchar）；用户配连接后可"读取表字段"覆盖
      const tableFields = s.fields.map((f) => ({ name: f.name, type: inferDbType(f.name), visible: true, scorePoints: 5, condType: 'eq' as FieldCondType, group: f.group }))
      ds = { dbType: 'MySQL', ip: '', port: '3306', username: '', password: '', database: '', table: '', tableFields }
      fields = ds.tableFields.map((tf, k) => ({ id: s.fields[k].id, name: tf.name, desc: s.fields[k].desc, visible: true, sourceRef: tf.name, mask: /身份证|手机|银行卡|证件|姓名/.test(tf.name), maskRule: autoMaskRule(tf.name), scorePoints: 5, condType: 'eq' as FieldCondType, group: tf.group }))
    } else if (sType === 'api') {
      const inputs: ApiParam[] = s.id === 'id_images'
        ? [{ key: 'applicantId', from: '进件表单.申请人ID', required: true }, { key: 'idCard', from: '进件表单.身份证号', required: true }]
        : s.id === 'score_model' ? [{ key: 'applicantId', from: '进件表单.申请人ID', required: true }, { key: 'deviceFp', from: '设备SDK.指纹', required: false }]
        : s.id === 'fraud_score_model' ? [{ key: 'deviceFp', from: '设备SDK.指纹', required: true }, { key: 'ip', from: '请求上下文.IP', required: false }]
        : s.id === 'decision_overview' ? [{ key: 'verifyScore', from: '信息核验.异常值', required: true }, { key: 'creditScore', from: '信用风控.信用分', required: true }, { key: 'fraudScore', from: '欺诈识别.欺诈分', required: true }]
        : []
      // 证件照类合集：输出几乎都是影像（OCR 识别文本例外为纯文本）
      const containerOf = (name: string): RenderContainer => (/ocr|文本|文字/i.test(name) ? 'text' : 'image')
      const outputs: ApiOutput[] = s.fields.map((f) => ({ key: f.id, label: f.name, type: inferFieldType(f.name, f.desc), container: s.id === 'id_images' ? containerOf(f.name) : inferApiContainer(f.name, f.desc), visible: true, scorePoints: 5, condType: 'eq' as FieldCondType }))
      api = { url: '', method: 'POST', headers: [], inputs, bodyType: 'none', bodyText: '', outputs }
      fields = api.outputs.map((o, k) => ({ id: s.fields[k].id, name: o.label, desc: s.fields[k].desc, visible: true, sourceRef: o.key, scorePoints: 5, condType: 'eq' as FieldCondType }))
    } else if (sType === 'tpl_copy') {
      // 模板复制：集成来源段的只读快照，本模板不可改、不计分
      const fromId = SECTION_COPY_FROM[s.id] ?? ''
      const fromSec = built[fromId]
      copyFromId = fromId
      copyFromName = fromSec?.name
      copySections = fromSec ? [fromSec] : undefined
      copyScoreRange = fromSec ? { min: 0, max: fromSec.fields.reduce((a, f) => a + (f.scorePoints ?? 0), 0), base: 0 } : undefined
      fields = []
    } else {
      // 规则集：默认选中一个系统规则合集，展开后的规则项即合集内的规则
      const rsId = SECTION_RULESET[s.id] ?? RULE_SETS[0].id
      ruleSetId = rsId
      const rs = RULE_SETS.find((r) => r.id === rsId)!
      fields = rs.rules.map((r) => ({ id: r.id, name: r.name, desc: r.desc, visible: true, sourceRef: r.id, hitText: '命中', missText: '未命中', severity: 'mid' as Severity, hitReject: false, scorePoints: 5, condType: 'hit' as FieldCondType }))
    }

    const sec: SectionConfig = {
      id: s.id,
      name: s.name,
      desc: s.desc,
      order: i + 1,
      visible: true,
      sourceType: sType,
      // 模板复制段为「仅展示」型：不参与风险计分；用户基本信息现在按普通集合参与计分
      scoreable: sType === 'tpl_copy' ? false : undefined,
      cardScoreMode: SECTION_SCORE_MODE[s.id] ?? (sType === 'rule_set' ? 'deduct' : 'add'),
      homeTab: s.id === SCORE_SECTION[type] ? 'score' : s.id === FLOW_SECTION[type] ? 'flow' : /logs?$/i.test(s.id) ? 'log' : 'content',
      sourceName: s.name,
      ds, api, ruleSetId, copyFromId, copyFromName, copySections, copyScoreRange,
      fieldGroups: s.groups ? s.groups.map((g) => ({ ...g })) : undefined,
      fields,
    }
    built[s.id] = sec
    return sec
  })
}

/* 特殊命中规则种子：仅给「规则集」类分段配几条典型的决定/预警规则，其余报告默认为空由用户自配 */
function defaultSpecialRules(type: ReportType): SpecialRule[] {
  const mk = (
    sectionId: string, fieldId: string, sectionName: string, ruleName: string,
    autoResult: AutoResult, priority: SpecialRulePriority, note: string,
    score?: number, weight?: number,
  ): SpecialRule => ({ id: `sr_${sectionId}_${fieldId}`, sectionId, fieldId, sectionName, ruleName, trigger: 'hit', autoResult, priority, note, score, weight })
  if (type === 'fraud') {
    return [
      mk('blacklist_hit', 'bh_type', '黑名单命中详情', '黑名单命中', '拒绝', 'decisive', '命中黑名单一律拒绝，不看总分', 30, 25),
      mk('identity_fraud', 'R1', '身份欺诈详情', '公安实名', '拒绝', 'decisive', '公安实名核验不通过直接拒绝', 25, 20),
      mk('device_fraud', 'df_fp', '设备欺诈详情', '设备群控', '转人工', 'warning', '疑似群控，重点提示，仍看总分', 18, 15),
    ]
  }
  if (type === 'info_verify') {
    return [
      mk('cross_fusion', 'R6', '数据交叉融合', '设备群控', '拒绝', 'decisive', '识别到群控/设备农场，直接拒绝', 35, 30),
      mk('cross_fusion', 'R5', '数据交叉融合', '联防联控', '转人工', 'warning', '跨机构联防联控命中，重点提示', 18, 15),
    ]
  }
  return []
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

const STATUS_ENUM_PRESETS: Record<ReportType, string[]> = {
  info_verify: ['待确认', '通过', '拒绝', '挂起', '已办结', '转人工'],
  credit: ['待审核', '通过', '拒绝', '复核中', '已办结', '转人工'],
  fraud: ['待确认', '通过', '拒绝', '加入黑名单', '已办结', '转人工'],
  decision: ['待审批', '通过', '拒绝', '退回', '已办结', '转人工'],
}

export function buildTemplate(type: ReportType, o: BuildOpts): ReportTemplate {
  const sections = buildSections(type)
  const tpl: ReportTemplate = {
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
    sections,
    scoreBlock: { show: true, title: '', min: 0, max: 100, rejectCount: 0 },
    flowBlock: { show: true, title: '', statusEnum: STATUS_ENUM_PRESETS[type] },
    showOpLog: true,
    showSectionTotals: true,
    scoreDisplay: {
      displayComponent: '大数字',
      showDescription: true,
      showThresholdBar: true,
      showRiskTags: true,
      baseScore: 0,
      title: type === 'info_verify' ? '信息核验综合信用模型' : '',
      // 信息核验/欺诈的 grades 是异常值语义，但报告详情页习惯给客户看「信用值」→ 默认翻转；信用/决策本身就是越高越好，直读
      scoreSemantic: type === 'info_verify' || type === 'fraud' ? 'credit' : 'risk',
      grades: GRADE_PRESETS[type].map((g) => ({ ...g })),
    },
    scoreFormula: type === 'decision' ? { ...DEFAULT_DECISION_FORMULA, terms: DEFAULT_DECISION_FORMULA.terms.map((t) => ({ ...t })) } : buildDefaultScoreFormula(sections),
    specialRules: defaultSpecialRules(type),
    businessFlow: syncFlowToGrades(FLOW_PRESETS[type], GRADE_PRESETS[type]),
    theme: defaultTheme(),
    export: defaultExport(),
    changeLogs: [
      { version: o.version ?? 'V1.0', action: '创建', operator: o.lastEditor ?? 'admin', timestamp: o.lastEditTime ?? '刚刚', summary: `创建「${o.name}」` },
    ],
  }
  // 分值预测默认值取当前模板计算结果；首次生成时按实际分值范围自动分三段
  const summary = computeScoreSummary(tpl)
  tpl.scoreBlock.min = summary.min
  tpl.scoreBlock.max = summary.max
  tpl.scoreBlock.rejectCount = summary.rejectTotal
  tpl.scoreDisplay.grades = buildDefaultGradesForRange(summary.min, summary.max, 3, tpl.scoreDisplay.scoreSemantic)
  return tpl
}

/* ---------- 备用：权威信息核验报告模板（演示用，不替换现有功能） ----------
 * 维度依据行业权威身份核验能力设计：身份证二/四要素、人像比对、活体检测、证件 OCR、
 * 银行卡二/三/四要素、运营商三要素与在网、反欺诈黑名单与联防联控、设备与行为、多头借贷。
 * 每个「集合」带 demoScore（异常值口径，越高风险越高）与 demoValues（展示项示例），
 * 使「模板驱动的报告详情（BackupReportDetail）」可直接据此渲染，并随模板编辑实时更新。 */
type DemoStatus = 'pass' | 'warn' | 'reject'

/* 数据项规格：统一描述一个字段的 绑定引用(ref) / 计分 / 演示值，供三类分段复用以生成 FieldConfig */
interface AuthFieldSpec {
  id: string
  name: string      // 报告展示名
  ref: string       // 数据源列名 / API 输出 key / 规则 id
  desc: string
  scorePoints: number
  condType: FieldCondType
  condValue?: string
  // 规则集类专用
  severity?: Severity
  hitReject?: boolean
  hitText?: string
  missText?: string
  demo: { value: string; status: DemoStatus }
}

/* 数据源分段：配 MySQL 表 + 字段（列名/类型），字段绑定列名、按关键字自动脱敏 */
function mkDsSection(id: string, name: string, desc: string, weight: number, mode: CardScoreMode, demoScore: number, table: string, fields: AuthFieldSpec[]): SectionConfig {
  const ds: DataSourceConfig = {
    dbType: 'MySQL', ip: '', port: '3306', username: '', password: '', database: 'risk_iv', table,
    tableFields: fields.map((f) => ({ name: f.ref, label: f.name, type: inferDbType(f.ref), visible: true, scorePoints: f.scorePoints, condType: f.condType, condValue: f.condValue })),
  }
  return {
    id, name, desc, order: 0, visible: true,
    sourceType: 'data_source', sourceName: name,
    cardScoreMode: mode, homeTab: 'content',
    weight, dimNote: '',
    ds,
    fields: fields.map((f) => ({
      id: f.id, name: f.name, desc: f.desc, visible: true,
      sourceRef: f.ref, maskRule: autoMaskRule(f.ref),
      scorePoints: f.scorePoints, condType: f.condType, condValue: f.condValue,
    })),
    demoScore,
    demoValues: Object.fromEntries(fields.map((f) => [f.id, { name: f.name, value: f.demo.value, status: f.demo.status }])),
  }
}

/* 接口分段：配 API 地址 + 入参 + 输出字段 */
function mkApiSection(id: string, name: string, desc: string, weight: number, mode: CardScoreMode, demoScore: number, url: string, inputs: ApiParam[], fields: AuthFieldSpec[]): SectionConfig {
  const api: ApiConfig = {
    url, method: 'POST', headers: [], inputs, bodyType: 'json', bodyText: '',
    outputs: fields.map((f) => ({
      key: f.ref, label: f.name, type: inferFieldType(f.name, f.desc),
      container: inferApiContainer(f.name, f.desc), visible: true,
      scorePoints: f.scorePoints, condType: f.condType, condValue: f.condValue,
    })),
  }
  return {
    id, name, desc, order: 0, visible: true,
    sourceType: 'api', sourceName: name,
    cardScoreMode: mode, homeTab: 'content',
    weight, dimNote: '',
    api,
    fields: fields.map((f) => ({
      id: f.id, name: f.name, desc: f.desc, visible: true,
      sourceRef: f.ref, scorePoints: f.scorePoints, condType: f.condType, condValue: f.condValue,
    })),
    demoScore,
    demoValues: Object.fromEntries(fields.map((f) => [f.id, { name: f.name, value: f.demo.value, status: f.demo.status }])),
  }
}

/* 规则集分段：绑定规则集，字段即规则项 */
function mkRuleSection(id: string, name: string, desc: string, weight: number, mode: CardScoreMode, demoScore: number, ruleSetId: string, fields: AuthFieldSpec[]): SectionConfig {
  return {
    id, name, desc, order: 0, visible: true,
    sourceType: 'rule_set', sourceName: name,
    cardScoreMode: mode, homeTab: 'content',
    weight, dimNote: '',
    ruleSetId,
    fields: fields.map((f) => ({
      id: f.id, name: f.name, desc: f.desc, visible: true,
      sourceRef: f.ref, hitText: f.hitText ?? '命中', missText: f.missText ?? '未命中',
      severity: (f.severity ?? 'mid') as Severity, hitReject: f.hitReject ?? false,
      scorePoints: f.scorePoints, condType: f.condType, condValue: f.condValue,
    })),
    demoScore,
    demoValues: Object.fromEntries(fields.map((f) => [f.id, { name: f.name, value: f.demo.value, status: f.demo.status }])),
  }
}

export function buildAuthorityInfoTemplate(): ReportTemplate {
  const sections: SectionConfig[] = [
    mkDsSection('sec_identity', '身份实名核验', '身份证要素与公安库一致性，确认「本人+真实身份」', 15, 'deduct', 10, 't_identity_verify', [
      { id: 'iv_no', name: '身份证号格式校验', ref: 'id_no', desc: '18 位结构/校验位', scorePoints: 8, condType: 'regex', condValue: '^\\d{17}[\\dX]$', demo: { value: '格式正确', status: 'pass' } },
      { id: 'iv_2e', name: '姓名+证件二要素', ref: 'id_2elem', desc: '与公安库姓名证件号比对', scorePoints: 15, condType: 'eq', condValue: '一致', demo: { value: '一致', status: 'pass' } },
      { id: 'iv_exp', name: '证件有效期', ref: 'id_expire', desc: '是否在有效期内', scorePoints: 8, condType: 'eq', condValue: '有效期内', demo: { value: '有效期内', status: 'pass' } },
      { id: 'iv_lost', name: '证件挂失/冒用', ref: 'id_lost', desc: '公安库挂失冒用状态', scorePoints: 12, condType: 'eq', condValue: '正常', demo: { value: '正常', status: 'pass' } },
      { id: 'iv_photo', name: '公安库人像一致性', ref: 'id_photo', desc: '证件照与公安留存照比对', scorePoints: 10, condType: 'eq', condValue: '一致', demo: { value: '一致', status: 'pass' } },
    ]),
    mkApiSection('sec_liveness', '活体检测与人像比对', '活体检测 + 1:1 人像比对，防照片/视频/面具攻击', 12, 'deduct', 8, '/api/face/verify', [
      { key: 'applicantId', from: '进件表单.申请人ID', required: true },
      { key: 'liveImage', from: '采集SDK.活体照', required: true },
    ], [
      { id: 'lv_live', name: '活体检测', ref: 'live_result', desc: '动作配合/防翻拍', scorePoints: 15, condType: 'eq', condValue: '通过', demo: { value: '通过', status: 'pass' } },
      { id: 'lv_face', name: '1:1 人像比对', ref: 'face_similarity', desc: '与证件照相似度', scorePoints: 15, condType: 'gt', condValue: '90', demo: { value: '98.2%', status: 'pass' } },
      { id: 'lv_spoof', name: '翻拍/面具攻击', ref: 'spoof_result', desc: '攻击检测', scorePoints: 12, condType: 'eq', condValue: '未命中', demo: { value: '未命中', status: 'pass' } },
    ]),
    mkApiSection('sec_ocr', '证件 OCR 识别', '身份证/银行卡影像文字识别', 8, 'deduct', 6, '/api/ocr/idcard', [
      { key: 'imageId', from: '影像资料.身份证影像', required: true },
    ], [
      { id: 'oc_id', name: '身份证 OCR', ref: 'ocr_id', desc: '正反面文字识别', scorePoints: 8, condType: 'eq', condValue: '识别成功', demo: { value: '识别成功', status: 'pass' } },
      { id: 'oc_bank', name: '银行卡 OCR', ref: 'ocr_bank', desc: '卡号识别', scorePoints: 6, condType: 'eq', condValue: '识别成功', demo: { value: '识别成功', status: 'pass' } },
    ]),
    mkDsSection('sec_bank', '银行卡核验', '银行卡二/三/四要素与银行开户预留一致性', 12, 'deduct', 12, 't_bank_verify', [
      { id: 'bk_3e', name: '银行卡三要素', ref: 'bank_3elem', desc: '姓名+证件+卡号', scorePoints: 12, condType: 'eq', condValue: '一致', demo: { value: '一致', status: 'pass' } },
      { id: 'bk_4e', name: '银行卡四要素', ref: 'bank_4elem', desc: '+预留手机号', scorePoints: 12, condType: 'eq', condValue: '一致', demo: { value: '一致', status: 'pass' } },
      { id: 'bk_stat', name: '卡状态', ref: 'bank_status', desc: '是否止付/冻结', scorePoints: 6, condType: 'eq', condValue: '正常', demo: { value: '正常', status: 'pass' } },
      { id: 'bk_type', name: '卡类型', ref: 'bank_type', desc: '借记/贷记', scorePoints: 4, condType: 'eq', condValue: '借记卡', demo: { value: '借记卡', status: 'pass' } },
    ]),
    mkDsSection('sec_operator', '运营商核验与在网', '运营商三要素一致性、在网时长与状态', 15, 'deduct', 15, 't_citynet_verify', [
      { id: 'op_3e', name: '运营商三要素', ref: 'op_3elem', desc: '姓名+证件+手机号', scorePoints: 12, condType: 'eq', condValue: '一致', demo: { value: '一致', status: 'pass' } },
      { id: 'op_dur', name: '在网时长', ref: 'op_duration', desc: '入网月数', scorePoints: 8, condType: 'gt', condValue: '12', demo: { value: '36 个月', status: 'pass' } },
      { id: 'op_stat', name: '在网状态', ref: 'op_status', desc: '正常/停机', scorePoints: 8, condType: 'eq', condValue: '正常', demo: { value: '正常', status: 'pass' } },
      { id: 'op_prov', name: '归属地一致性', ref: 'op_province', desc: '与申请地比对', scorePoints: 4, condType: 'eq', condValue: '一致', demo: { value: '一致', status: 'pass' } },
    ]),
    mkRuleSection('sec_blacklist', '反欺诈黑名单与联防联控', '黑名单/公安重点人员/跨机构联防联控命中核查', 18, 'deduct', 5, 'rs_all', [
      { id: 'bl_ovd', name: '信贷逾期黑名单', ref: 'rule_bl_overdue', desc: '近 X 月信贷逾期黑名单', scorePoints: 15, condType: 'hit', severity: 'high', hitReject: true, demo: { value: '未命中', status: 'pass' } },
      { id: 'bl_sx', name: '失信被执行人', ref: 'rule_bl_sx', desc: '法院失信名单', scorePoints: 15, condType: 'hit', severity: 'high', hitReject: true, demo: { value: '未命中', status: 'pass' } },
      { id: 'bl_pol', name: '公安重点人员', ref: 'rule_bl_police', desc: '公安重点人员库', scorePoints: 15, condType: 'hit', severity: 'high', hitReject: true, demo: { value: '未命中', status: 'pass' } },
      { id: 'bl_link', name: '跨机构联防联控', ref: 'rule_bl_link', desc: '多头联防联控命中', scorePoints: 10, condType: 'hit', severity: 'mid', demo: { value: '未命中', status: 'pass' } },
    ]),
    mkRuleSection('sec_device', '设备与行为风险', '设备群控/异常、行为轨迹、地理位置跳动', 12, 'deduct', 58, 'rs_device', [
      { id: 'dv_farm', name: '设备群控/农场', ref: 'rule_dv_farm', desc: '群控/设备农场识别', scorePoints: 12, condType: 'hit', severity: 'high', demo: { value: '未命中', status: 'pass' } },
      { id: 'dv_abn', name: '设备异常', ref: 'rule_dv_abn', desc: '一设备多申请关联', scorePoints: 8, condType: 'hit', severity: 'mid', demo: { value: '命中（关联 3 个申请）', status: 'warn' } },
      { id: 'dv_geo', name: '地理位置跳动', ref: 'rule_dv_geo', desc: '短时发生地跳跃', scorePoints: 8, condType: 'hit', severity: 'mid', demo: { value: '命中（2 省）', status: 'warn' } },
      { id: 'dv_root', name: '模拟器/越狱', ref: 'rule_dv_root', desc: '运行环境风险', scorePoints: 6, condType: 'hit', severity: 'mid', demo: { value: '未命中', status: 'pass' } },
    ]),
    mkDsSection('sec_multi', '多头借贷与信贷申请', '近周期信贷申请机构数、查询次数、逾期记录', 8, 'deduct', 62, 't_multi_loan', [
      { id: 'ml_org', name: '近 30 天申请机构数', ref: 'ml_org_30d', desc: '信贷申请机构数', scorePoints: 8, condType: 'lt', condValue: '10', demo: { value: '6 家', status: 'warn' } },
      { id: 'ml_qry', name: '近 30 天审批查询', ref: 'ml_query_30d', desc: '征信审批查询次数', scorePoints: 8, condType: 'lt', condValue: '15', demo: { value: '9 次', status: 'warn' } },
      { id: 'ml_ovd', name: '历史逾期记录', ref: 'ml_overdue', desc: '历史逾期笔数', scorePoints: 10, condType: 'eq', condValue: '无', demo: { value: '无', status: 'pass' } },
      { id: 'ml_cur', name: '当前在贷笔数', ref: 'ml_current', desc: '当前未结清笔数', scorePoints: 6, condType: 'lt', condValue: '5', demo: { value: '2 笔', status: 'pass' } },
    ]),
  ]
  sections.forEach((s, i) => (s.order = i + 1))
  const tpl = buildTemplate('info_verify', {
    id: 'tpl-info-authority',
    name: '权威信息核验报告模板（备用）',
    status: '草稿',
    scope: ['全产品'],
    isDefault: false,
    version: 'V1.0',
    lastEditor: 'admin',
    lastEditTime: '今天',
    description: '依据行业权威身份核验能力设计的备用演示模板：8 个集合均已配置具体数据项（数据源绑定/脱敏/计分条件），覆盖身份证要素、人像比对、活体、OCR、银行卡、运营商、黑名单、设备、多头。用于验证「模板驱动报告」链路，不替换现有标准模板。',
  })
  tpl.sections = sections
  tpl.showSectionTotals = true
  tpl.specialRules = [] // 备用模板暂无决定/预警规则（维度已含风险标记）
  tpl.demoApplicant = {
    申请人: '张*明',
    证件号: '3301**********1234',
    手机号: '138****6688',
    银行卡: '6222********1234',
    申请产品: '工薪贷',
    申请额度: '¥80,000',
  }
  return tpl
}

/* ============================================================================
 * 方案222 备用模板（按 0802 映射关系新建 + 样例数据）
 * - 完全独立于标准模板 tpl-info-standard 与旧测试 tpl-info-authority，不替换任何现有功能
 * - 分段结构遵循信息核验报告：用户基本信息(双分组) / 用户证件照(api) / 多源并行核验(规则集) /
 *   数据交叉融合(规则集) / 操作日志；并携带 sample 级 demoScore / demoValues / specialRules，
 *   使 BackupReportDetail222 可直接据此还原一份「及格」的报告内容。
 * ========================================================================= */
export function buildBackup222Template(): ReportTemplate {
  const t = buildTemplate('info_verify', {
    id: 'tpl-info-backup222',
    name: '综合信用模型（方案222备用）',
    status: '草稿',
    scope: ['全产品'],
    isDefault: false,
    version: 'V2.6风控策略集',
    lastEditor: 'admin',
    lastEditTime: '2026-07-21',
    description: '方案222 备用：按 0802 映射关系新建的模板 + 样例数据，用于验证「模板驱动还原报告」。不替换现有信息核验标准模板。',
  })
  const sec = (id: string) => t.sections.find((s) => s.id === id)!

  /* 一、用户基本信息（双分组：基础资料 g_base / 环境采集 g_env）样例 */
  const basic = sec('basic_info')
  basic.demoScore = 6
  basic.demoValues = {
    bi_name: { name: '姓名', value: '张*明', status: 'pass' },
    bi_id: { name: '身份证号', value: '3301**********1234', status: 'pass' },
    bi_phone: { name: '手机号', value: '138****6688', status: 'pass' },
    bi_bank: { name: '银行卡号', value: '6222********1234', status: 'pass' },
    bi_bank_branch: { name: '开户行', value: '工商银行杭州分行', status: 'pass' },
    bi_age: { name: '年龄', value: '32', status: 'pass' },
    bi_edu: { name: '学历', value: '本科', status: 'pass' },
    bi_company: { name: '工作单位', value: '杭州某科技有限公司', status: 'pass' },
    bi_income: { name: '月收入', value: '¥15,000', status: 'pass' },
    bi_address: { name: '居住地址', value: '杭州市西湖区', status: 'pass' },
    bi_marriage: { name: '婚姻', value: '已婚', status: 'pass' },
    bi_fp: { name: '设备指纹', value: 'FP-9A2B7C…', status: 'pass' },
    bi_ip: { name: 'IP地址', value: '223.104.xx.xx', status: 'pass' },
    bi_gps: { name: 'GPS定位', value: '杭州·西湖区', status: 'pass' },
    bi_channel: { name: '进件渠道', value: 'APP', status: 'pass' },
    bi_appver: { name: 'APP版本', value: 'v3.2.1', status: 'pass' },
  }

  /* 二、用户证件照（接口集）样例 */
  const images = sec('id_images')
  images.demoScore = 2
  images.demoValues = {
    ii_front: { name: '身份证人像面', value: '已采集', status: 'pass' },
    ii_back: { name: '身份证国徽面', value: '已采集', status: 'pass' },
    ii_live: { name: '活体人脸', value: '活体通过', status: 'pass' },
    ii_bank: { name: '银行卡', value: '已采集', status: 'pass' },
    ii_ocr: { name: 'OCR识别文本', value: '姓名/证件号一致', status: 'pass' },
  }

  /* 三、多源并行核验单项报告（规则集）样例 */
  const single = sec('single_verify')
  single.demoScore = 9
  single.demoValues = {
    sv_police: { name: '公安实名', value: '一致', status: 'pass' },
    sv_bank4: { name: '银行卡四要素', value: '一致', status: 'pass' },
    sv_operator: { name: '运营商实名', value: '已实名', status: 'pass' },
    sv_device: { name: '终端设备', value: '真实设备', status: 'warn' },
    sv_link: { name: '联防联控', value: '无异常', status: 'pass' },
    sv_serial: { name: '核验流水号', value: 'OPR-20260721-143218', status: 'pass' },
    sv_time: { name: '核验时间', value: '2026-07-21 15:00:12', status: 'pass' },
  }

  /* 五、数据交叉融合综合报告（规则集：与「多源并行核验」同属 rule_set，详情页用同一组件渲染，显示效果一致）样例 */
  const cross = sec('cross_fusion')
  // 由模板复制(tpl_copy)重写为规则集(rule_set)：与 single_verify 同结构、详情页渲染效果一致；不再复制、可独立计分
  cross.sourceType = 'rule_set'
  cross.scoreable = true
  cross.copyFromId = undefined
  cross.copyFromName = undefined
  cross.copySections = undefined
  cross.copyScoreRange = undefined
  cross.ruleSetId = 'rs_device'
  const crossRs = RULE_SETS.find((r) => r.id === 'rs_device')!
  cross.fields = crossRs.rules.map((r) => ({
    id: r.id, name: r.name, desc: r.desc, visible: true, sourceRef: r.id,
    hitText: '命中', missText: '未命中', severity: 'mid' as Severity, hitReject: false,
    scorePoints: 5, condType: 'hit' as FieldCondType,
  }))
  cross.demoScore = 18
  cross.demoValues = {
    R4: { name: '设备真实性', value: '异常', status: 'warn' },
    R5: { name: '联防联控', value: '命中 2 项', status: 'warn' },
    R6: { name: '设备群控', value: '命中', status: 'warn' },
    R7: { name: '团伙关联', value: '未命中', status: 'pass' },
    R8: { name: '黑名单命中', value: '命中', status: 'reject' },
  }

  /* 操作日志（仅展示，不计分） */
  sec('op_logs').demoScore = 0

  // 重新计算分值预测并同步分段和业务流程
  t.scoreDisplay.scoreSemantic = 'risk'
  const s2 = computeScoreSummary(t)
  t.scoreBlock = { show: true, title: '得分计算', min: s2.min, max: s2.max, rejectCount: s2.rejectTotal }
  t.scoreDisplay.grades = buildDefaultGradesForRange(s2.min, s2.max, 3, 'risk')
  t.businessFlow = syncFlowToGrades(t.businessFlow, t.scoreDisplay.grades)
  t.scoreFormula = buildDefaultScoreFormula(t.sections)
  t.showSectionTotals = true
  t.showOpLog = true
  t.specialRules = [
    { id: 'sr1', sectionId: 'single_verify', fieldId: 'sv_device', sectionName: '多源并行核验单项报告', ruleName: '设备群控', trigger: 'hit', autoResult: '转人工', priority: 'warning', score: 18, weight: 20, note: '命中设备群控特征' },
    { id: 'sr2', sectionId: 'cross_fusion', fieldId: 'R8', sectionName: '数据交叉融合综合报告', ruleName: '黑名单命中', trigger: 'hit', autoResult: '拒绝', priority: 'decisive', score: 50, weight: 30, note: '命中风控黑名单' },
    { id: 'sr3', sectionId: 'basic_info', fieldId: 'bi_id', sectionName: '用户基本信息', ruleName: '证件号格式异常', trigger: 'hit', autoResult: '转人工', priority: 'warning', score: 10, weight: 15, note: '证件号与姓名一致性待核' },
    { id: 'sr4', sectionId: 'id_images', fieldId: 'ii_live', sectionName: '用户证件照', ruleName: '活体比对失败', trigger: 'hit', autoResult: '拒绝', priority: 'decisive', score: 40, weight: 25, note: '活体检测分数偏低' },
  ]
  t.demoApplicant = {
    申请人: '张*明',
    证件号: '3301**********1234',
    手机号: '138****6688',
    银行卡: '6222********1234',
    申请产品: '工薪贷',
    申请额度: '¥80,000',
    报告ID: 'CR20260721001',
    计算时间: '2026-07-21 15:00:22',
  }
  return t
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
  buildAuthorityInfoTemplate(),
  buildBackup222Template(),
]

// 加载 templateNull.json（空骨架模板，供用户对照补全字段）
import templateNullJson from './templateNull.json'
if (!seedReportTemplates.find((t) => t.id === (templateNullJson as any).id)) {
  seedReportTemplates.push(templateNullJson as any as ReportTemplate)
}

/* ---------- 决策报告运行态：审批弹窗所需的流程配置 ---------- */
/* 依据报告 suggestion 映射到对应分段（grade），取其流程图中「结果选项最多」的审批节点，
   返回该节点的审核事项 / 审批结果 / 审批意见预设，使弹窗与报告模板的审核流程配置保持一致。
   注：当前读取种子模板配置（无跨页共享 store）；后续报告实例绑定模板 id 后可改读实际模板。 */
/** 审批弹窗所需的流程配置（与报告模板的审核流程对齐）：审核事项 / 审批结果 / 审批意见预设 */
export interface AuditFlow {
  nodeLabel: string
  checkItems: string[]
  results: ReviewResult[]
  opinionPresets: Record<ReviewResult, string[]>
  /** 决策节点结果 → 状态 映射；运行时据此将审批结果落地为工单状态（缺省时用各报告内置兜底） */
  resultStates?: Partial<Record<ReviewResult, string>>
}

/**
 * 按报告类型 + 报告结论（grade）取对应业务流程节点的人工审核配置。
 * 各报告类型共用：依据 suggestion 定位 GRADE_PRESETS 分段 → 取该分段 flowGraph 的最终人工节点。
 * 无模板 / 无人工节点时回退到通用默认。
 */
export function getAuditFlow(type: ReportType, suggestion: string, graphIndex = 0): AuditFlow {
  const fallback: AuditFlow = {
    nodeLabel: '审核建议',
    checkItems: ['资料完整性检查', '收入与负债评估'],
    results: [...REVIEW_RESULTS] as ReviewResult[],
    opinionPresets: defaultOpinionPresets(),
  }
  const tpl = seedReportTemplates.find((t) => t.reportType === type)
  if (!tpl) return fallback
  const gi = GRADE_PRESETS[type].findIndex((g) => g.grade === suggestion)
  const grade = gi >= 0 ? GRADE_PRESETS[type][gi] : undefined
  const flow = gi >= 0 ? tpl.businessFlow[gi + 1] : tpl.businessFlow[1]
  const autoResult: AutoResult = grade ? grade.autoResult : '转人工'
  const g = flow?.flowGraphs?.[graphIndex] ?? flow?.flowGraphs?.[0] ?? buildDefaultFlowGraph(flow ?? defaultFlowRow('—', ''), autoResult)
  const manual = g.nodes.filter((n) => n.results && n.results.length)
  if (!manual.length) return fallback
  const node = manual.reduce((a, b) => ((b.results?.length ?? 0) > (a.results?.length ?? 0) ? b : a))
  const { results, opinionPresets } = normalizeReviewResults(node.results as string[] | undefined, node.opinionPresets)
  return {
    nodeLabel: node.buttonName ?? node.label,
    checkItems: node.checkItems ?? [],
    results,
    opinionPresets,
    resultStates: node.resultStates,
  }
}

export function getDecisionAuditFlow(suggestion: string): AuditFlow {
  return getAuditFlow('decision', suggestion)
}

/** 按模板分段名（gradeId，如 A/B/C）取审批弹窗配置——直接定位 businessFlow 行，不走 GRADE_PRESETS。
 * 供模板动态分段（buildDefaultGradesForRange 生成 A/B/C 等）的报告详情页使用；
 * graphIndex 对应该分段 flowGraphs 数组下标（一个分段多条业务 = 多个按钮）。 */
export function getAuditFlowByGrade(tpl: ReportTemplate | undefined, gradeId: string, graphIndex = 0, nodeIndex = 0): AuditFlow {
  const fallback: AuditFlow = {
    nodeLabel: '审核建议',
    checkItems: [],
    results: [...REVIEW_RESULTS] as ReviewResult[],
    opinionPresets: defaultOpinionPresets(),
  }
  if (!tpl) return fallback
  const bf = (tpl.businessFlow ?? []).find((x) => x.gradeId === gradeId)
  const autoResult: AutoResult = tpl.scoreDisplay.grades.find((g) => g.grade === gradeId)?.autoResult ?? '转人工'
  const g = bf?.flowGraphs?.[graphIndex] ?? bf?.flowGraphs?.[0] ?? buildDefaultFlowGraph(bf ?? defaultFlowRow(gradeId, ''), autoResult)
  const manual = g.nodes.filter((n) => n.results && n.results.length)
  const node = manual[nodeIndex] ?? manual[manual.length - 1]
  if (!node) return fallback
  const { results, opinionPresets } = normalizeReviewResults(node.results as string[] | undefined, node.opinionPresets)
  return {
    nodeLabel: node.buttonName ?? node.label,
    checkItems: node.checkItems ?? [],
    results,
    opinionPresets,
    resultStates: node.resultStates,
  }
}

/**
 * 运行时「按分段渲染多按钮」：返回当前评分/结论分段对应的全部触发按钮。
 * 设计：每个评分分段有 N 条业务流程（businessFlow[i].flowGraphs）= N 个操作按钮，
 * 按钮文案取自该流程 start 节点的 buttonName；无流程时回退到自动结果默认按钮。
 */
/** 从模板的 demoValues 生成「预览格式」样例数据（{ scoreLabel, sections: { sectionId: { fieldId: value } } }），
 * 供预览页/详情页使用；页面新建/复制模板时调用并落本地（samples/sample-{id}.json）。 */
export function buildTemplateSample(tpl: ReportTemplate): { scoreLabel: string; sections: Record<string, Record<string, string>> } {
  const sections: Record<string, Record<string, string>> = {}
  for (const s of tpl.sections ?? []) {
    const dv = s.demoValues ?? {}
    const map: Record<string, string> = {}
    for (const [k, v] of Object.entries(dv)) map[k] = (v as any)?.value != null ? String((v as any).value) : String(v)
    if (Object.keys(map).length) sections[s.id] = map
  }
  return { scoreLabel: tpl.reportType === 'info_verify' || tpl.reportType === 'fraud' ? '异常值' : '综合分', sections }
}

export function getSegmentButtons(type: ReportType, suggestion: string): { idx: number; label: string }[] {
  const tpl = seedReportTemplates.find((t) => t.reportType === type)
  if (!tpl) return [{ idx: 0, label: '审批' }]
  const gi = GRADE_PRESETS[type].findIndex((g) => g.grade === suggestion)
  const grade = gi >= 0 ? GRADE_PRESETS[type][gi] : undefined
  const flow = gi >= 0 ? tpl.businessFlow[gi + 1] : tpl.businessFlow[1]
  const autoResult: AutoResult = grade ? grade.autoResult : '转人工'
  const graphs = flow?.flowGraphs ?? []
  if (!graphs.length) return [{ idx: 0, label: defaultButtonName(autoResult) }]
  return graphs.map((g, idx) => {
    const start = g.nodes.find((n) => n.type === 'start')
    return { idx, label: start?.buttonName ?? start?.label ?? defaultButtonName(autoResult) }
  })
}

/* ============================================================================
 * 审核状态机（报告模板可配置层）
 * - 用"状态机配置"表达四报告的审核流转：状态(由行数据派生) → 该状态下可见操作 → 操作打开的弹窗 / 跳转的下一状态
 * - resolveActions() 统一查表，替换各报告硬编码的 opsFor 类函数
 * - 详情页用 context:'detail'，列表页用 context:'list'（守住"列表先不动"）
 * ========================================================================= */
export type FlowActionContext = 'list' | 'detail'
export type FlowActionOpens = 'approval' | 'custom' | 'none'
export type FlowAuditGradeFrom = 'riskScore' | 'scoreBand' | 'creditScore' | 'suggestion' | 'sysResult'

export interface FlowActionDef {
  key: string
  label: string
  variant?: 'primary' | 'secondary' | 'ghost'
  opens: FlowActionOpens
  /** opens='approval' 时，取哪个字段推算 grade 喂给 getAuditFlow */
  auditGradeFrom?: FlowAuditGradeFrom
  role?: ReviewRole
  /** 点击后流转到的状态 id（单一事实源，供画布/执行参考） */
  next: string
  /** 不写=列表与详情都显示；写则仅指定上下文显示 */
  contexts?: FlowActionContext[]
}

export interface FlowStateDef {
  id: string
  label: string
  actions: FlowActionDef[]
  /** 该状态下"查看"置灰（如计算中） */
  lockedView?: boolean
}

export interface FlowStateMachine {
  reportType: ReportType
  /** 由行现有字段（sysResult×workStatus 等）算出当前状态 id */
  derive: (row: any) => string
  states: FlowStateDef[]
}

export interface ResolveOpts {
  context?: FlowActionContext
  role?: ReviewRole
}

/** 统一查表：返回当前状态在该上下文/角色下可见的操作定义 */
export function resolveActions(m: FlowStateMachine, row: any, opts: ResolveOpts = {}): FlowActionDef[] {
  const state = m.states.find((s) => s.id === m.derive(row))
  if (!state) return []
  const ctx = opts.context ?? 'list'
  return state.actions.filter((a) => {
    const acts = a.contexts ?? ['list', 'detail']
    if (!acts.includes(ctx)) return false
    if (a.role && opts.role && a.role !== opts.role) return false
    return true
  })
}

/* —— 四报告状态机配置（内容来自各自既有 opsFor 矩阵，原样搬入可配置结构）—— */

// 信息核验：sysResult × workStatus
const IV_A = {
  view: { key: 'view', label: '查看', opens: 'none' as const, next: 'pass_done' },
  audit: { key: 'audit', label: '审批', variant: 'primary' as const, opens: 'approval' as const, auditGradeFrom: 'riskScore' as const, contexts: ['detail' as const], next: 'pass_done' },
  reportConfirm: { key: 'reportConfirm', label: '报告确认', opens: 'custom' as const, contexts: ['list' as const], next: 'pass_done' },
  forceRecheck: { key: 'forceRecheck', label: '强制复审', opens: 'custom' as const, next: 'reject_closed' },
  submitDual: { key: 'submitDual', label: '提交双人复核', opens: 'custom' as const, next: 'warn_dual' },
  confirmPass: { key: 'confirmPass', label: '确认放行', opens: 'custom' as const, contexts: ['list' as const], next: 'warn_done' },
  confirmReject: { key: 'confirmReject', label: '确认拒绝', opens: 'custom' as const, contexts: ['list' as const], next: 'warn_done' },
}
export const VERIFY_MACHINE: FlowStateMachine = {
  reportType: 'info_verify',
  derive: (r: any) =>
    r.workStatus === '核验计算中' ? 'calculating'
    : r.sysResult === '通过' ? (r.workStatus === '待确认' ? 'pass_pending' : 'pass_done')
    : r.sysResult === '拒绝' ? (r.workStatus === '待确认' ? 'reject_pending' : 'reject_closed')
    : r.workStatus === '待审核' ? 'warn_review'
    : r.workStatus === '提交复核' ? 'warn_dual' : 'warn_done',
  states: [
    { id: 'calculating', label: '核验计算中', actions: [IV_A.view] },
    { id: 'pass_pending', label: '通过-待确认', actions: [IV_A.view, IV_A.audit, IV_A.reportConfirm] },
    { id: 'pass_done', label: '通过-已办结', actions: [IV_A.view] },
    { id: 'reject_pending', label: '拒绝-待确认', actions: [IV_A.view, IV_A.audit, IV_A.forceRecheck, IV_A.reportConfirm] },
    { id: 'reject_closed', label: '拒绝-已办结', actions: [IV_A.view] },
    { id: 'warn_review', label: '预警-待审核', actions: [IV_A.view, IV_A.submitDual] },
    { id: 'warn_dual', label: '预警-提交复核', actions: [IV_A.view, IV_A.audit, IV_A.confirmPass, IV_A.confirmReject] },
    { id: 'warn_done', label: '预警-已办结', actions: [IV_A.view] },
  ],
}

// 欺诈识别方案4：workStatus × scoreBand
const FRAUD_A = {
  view: { key: 'view', label: '查看', opens: 'none' as const, next: 'closed' },
  audit: { key: 'audit', label: '审批', variant: 'primary' as const, opens: 'approval' as const, auditGradeFrom: 'scoreBand' as const, contexts: ['detail' as const], next: 'closed' },
  reportConfirm: { key: 'reportConfirm', label: '报告确认', opens: 'custom' as const, contexts: ['list' as const], next: 'closed' },
  forceReview: { key: 'forceReview', label: '强制复审', opens: 'custom' as const, next: 'closed' },
  addBlacklist: { key: 'addBlacklist', label: '加入黑名单', opens: 'custom' as const, next: 'closed' },
  submitReview: { key: 'submitReview', label: '提交双人复核', opens: 'custom' as const, next: 'dual' },
  note: { key: 'note', label: '录入备注', opens: 'custom' as const, next: 'dual' },
  confirmPass: { key: 'confirmPass', label: '确认放行', opens: 'custom' as const, contexts: ['list' as const], next: 'done' },
  confirmReject: { key: 'confirmReject', label: '确认拒绝', opens: 'custom' as const, contexts: ['list' as const], next: 'done' },
}
export const FRAUD_MACHINE: FlowStateMachine = {
  reportType: 'fraud',
  derive: (r: any) =>
    r.workStatus === '核验计算中' ? 'calc'
    : r.workStatus === '待确认' ? (r.scoreBand === '极高' ? 'pending_black' : r.scoreBand === '高' ? 'pending_force' : 'pending_confirm')
    : ['已确认', '初审拒贷', '强制放行', '加入黑名单'].includes(r.workStatus) ? 'closed'
    : r.workStatus === '待审核' ? 'review'
    : r.workStatus === '提交复核' ? 'dual' : 'done',
  states: [
    { id: 'calc', label: '核验计算中', actions: [FRAUD_A.view] },
    { id: 'pending_confirm', label: '待确认-极低/低', actions: [FRAUD_A.view, FRAUD_A.audit, FRAUD_A.reportConfirm] },
    { id: 'pending_force', label: '待确认-高', actions: [FRAUD_A.view, FRAUD_A.audit, FRAUD_A.forceReview, FRAUD_A.reportConfirm] },
    { id: 'pending_black', label: '待确认-极高', actions: [FRAUD_A.view, FRAUD_A.audit, FRAUD_A.addBlacklist, FRAUD_A.reportConfirm] },
    { id: 'closed', label: '已办结', actions: [FRAUD_A.view] },
    { id: 'review', label: '待审核', actions: [FRAUD_A.view, FRAUD_A.submitReview, FRAUD_A.note] },
    { id: 'dual', label: '提交复核', actions: [FRAUD_A.view, FRAUD_A.audit, FRAUD_A.note, FRAUD_A.confirmPass, FRAUD_A.confirmReject] },
    { id: 'done', label: '复核已办结', actions: [FRAUD_A.view] },
  ],
}

// 信用风控（真实页 CreditKimi）：sysResult × workStatus；详情页提交复核态收敛为"审批"
const CREDIT_A = {
  view: { key: 'view', label: '查看', opens: 'none' as const, next: 'done' },
  audit: { key: 'audit', label: '审批', variant: 'primary' as const, opens: 'approval' as const, auditGradeFrom: 'creditScore' as const, contexts: ['detail' as const], next: 'done' },
  submitReview: { key: 'submitReview', label: '提交复核', opens: 'custom' as const, next: 'dual' },
  confirmPass: { key: 'confirmPass', label: '确认放行', opens: 'custom' as const, contexts: ['list' as const], next: 'done' },
  confirmReject: { key: 'confirmReject', label: '确认拒绝', opens: 'custom' as const, contexts: ['list' as const], next: 'done' },
  note: { key: 'note', label: '录入备注', opens: 'custom' as const, next: 'dual' },
}
export const CREDIT_MACHINE: FlowStateMachine = {
  reportType: 'credit',
  derive: (r: any) =>
    r.sysResult === '处理中' ? 'calc'
    : (r.sysResult === '通过' || r.sysResult === '拒绝') ? 'auto_done'
    : r.workStatus === '待审核' ? 'review'
    : r.workStatus === '提交复核' ? 'dual' : 'done',
  states: [
    { id: 'calc', label: '处理中', actions: [CREDIT_A.view] },
    { id: 'auto_done', label: '自动通过/拒绝', actions: [CREDIT_A.view] },
    { id: 'review', label: '待审核', actions: [CREDIT_A.view, CREDIT_A.submitReview, CREDIT_A.note] },
    { id: 'dual', label: '提交复核', actions: [CREDIT_A.view, CREDIT_A.audit, CREDIT_A.confirmPass, CREDIT_A.confirmReject, CREDIT_A.note] },
    { id: 'done', label: '复核已办结', actions: [CREDIT_A.view] },
  ],
}

// 决策报告：双层状态机
// (A) 综合决策审批（DecisionActionKey），audit 在列表与详情一致（历史已收敛）
const DEC_A = {
  view: { key: 'view', label: '查看', opens: 'none' as const, next: 'done' },
  audit: { key: 'audit', label: '审批', variant: 'primary' as const, opens: 'approval' as const, auditGradeFrom: 'suggestion' as const, next: 'pending' },
  submitReview: { key: 'submitReview', label: '提交复核', opens: 'custom' as const, next: 'dual' },
  return: { key: 'return', label: '退回补充材料', opens: 'custom' as const, next: 'done' },
  note: { key: 'note', label: '录入备注', opens: 'custom' as const, next: 'pending' },
}
export const DECISION_APPROVAL_MACHINE: FlowStateMachine = {
  reportType: 'decision',
  derive: (r: any) =>
    ['已通过', '已拒绝', '已退回'].includes(r.approvalStatus) ? 'done'
    : r.approvalStatus === '已提交双人复核' ? 'dual'
    : 'pending',
  states: [
    { id: 'done', label: '已办结', actions: [DEC_A.view] },
    { id: 'dual', label: '双人复核中', actions: [DEC_A.view] },
    { id: 'pending', label: '待审批', actions: [DEC_A.view, DEC_A.audit] },
  ],
}

// (B) 子报告人工审核（ReviewOpKey），无 audit，沿用原 reportConfirm/放行/拒绝 等
const DEC_R = {
  view: { key: 'view', label: '查看', opens: 'none' as const, next: 'closed' },
  reportConfirm: { key: 'reportConfirm', label: '报告确认', opens: 'custom' as const, next: 'closed' },
  forceRecheck: { key: 'forceRecheck', label: '强制复审', opens: 'custom' as const, next: 'closed' },
  blacklist: { key: 'blacklist', label: '加入黑名单', opens: 'custom' as const, next: 'closed' },
  submitDual: { key: 'submitDual', label: '提交双人复核', opens: 'custom' as const, next: 'dual' },
  note: { key: 'note', label: '录入备注', opens: 'custom' as const, next: 'dual' },
  confirmPass: { key: 'confirmPass', label: '确认放行', opens: 'custom' as const, next: 'done' },
  confirmReject: { key: 'confirmReject', label: '确认拒绝', opens: 'custom' as const, next: 'done' },
}
export const DECISION_REVIEW_MACHINE: FlowStateMachine = {
  reportType: 'decision',
  derive: (r: any) =>
    r.manualReview === '核验计算中' ? 'calc'
    : r.manualReview === '待确认' ? (r.suggestion === '通过' ? 'pending_pass' : r.suggestion === '严格限制' ? 'pending_force' : 'pending_black')
    : ['已确认', '初审拒贷', '强制放行', '复核通过', '复核拒绝', '加入黑名单'].includes(r.manualReview) ? 'closed'
    : r.manualReview === '待审核' ? 'review'
    : r.manualReview === '提交复核' ? 'dual' : 'done',
  states: [
    { id: 'calc', label: '核验计算中', actions: [DEC_R.view] },
    { id: 'pending_pass', label: '待确认-通过', actions: [DEC_R.view, DEC_R.reportConfirm] },
    { id: 'pending_force', label: '待确认-严格限制', actions: [DEC_R.view, DEC_R.reportConfirm, DEC_R.forceRecheck] },
    { id: 'pending_black', label: '待确认-拒绝', actions: [DEC_R.view, DEC_R.reportConfirm, DEC_R.blacklist] },
    { id: 'closed', label: '已办结', actions: [DEC_R.view] },
    { id: 'review', label: '待审核', actions: [DEC_R.view, DEC_R.submitDual, DEC_R.note] },
    { id: 'dual', label: '提交复核', actions: [DEC_R.view, DEC_R.confirmPass, DEC_R.confirmReject, DEC_R.note] },
    { id: 'done', label: '已办结', actions: [DEC_R.view] },
  ],
}

/** 把状态机转换为画布流程图（节点=状态，连线=操作跳转），供 FlowCanvasEditor 可视化 */
export function machineToFlowGraph(m: FlowStateMachine): FlowGraph {
  const nodes: FlowGraphNode[] = m.states.map((s, i) => ({
    id: s.id,
    type: s.lockedView ? 'start' : 'normal',
    label: s.label,
    x: 60 + (i % 4) * 220,
    y: 60 + Math.floor(i / 4) * 170,
  }))
  const edges: FlowGraphEdge[] = []
  m.states.forEach((s) => {
    s.actions.forEach((a) => {
      if (a.key === 'view') return
      edges.push({ id: `e_${s.id}_${a.key}`, from: s.id, to: a.next, label: a.label })
    })
  })
  return { nodes, edges }
}

/** 按报告类型取对应的状态机配置（决策报告默认取综合决策审批机） */
export const MACHINE_BY_TYPE: Partial<Record<ReportType, FlowStateMachine>> = {
  info_verify: VERIFY_MACHINE,
  credit: CREDIT_MACHINE,
  fraud: FRAUD_MACHINE,
  decision: DECISION_APPROVAL_MACHINE,
}

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
