// 管理中心 · 规则合集数据层（需求20：规则集合成一个统一页面）—— 样例数据落本地 ruleHub.json（橘 Sam）
// 统一规则模型：所有类型共用一套属性（类型专属属性谁有谁填），状态不单独存，由关联业务流程 flowState 推导。
// 持久化复用 /api/load-mid /api/save-mid 端点（直接读写 src/console/ruleHub.json）；首启动 SEED 自动落盘。

export type RuleType =
  | '信息核验' | '反欺诈' | '黑名单' | '团伙识别'
  | '设备风险' | '跨机构名单' | '评分模型'
  | '行为监控' | '额度授信' | '合规监管';

export type RiskLevel = '高' | '中' | '低';

export interface CrossInstHit {
  inst: string;
  listType: string;
  hitCount: number;
  hitRate: number;
}

export interface RuleItem {
  id: string;
  name: string;
  ruleType: RuleType;
  riskLevel: RiskLevel;
  hitCond: string;        // 命中条件（大白话；P0-02：conditions 为空时回退显示/编辑此文本）
  conditions?: RuleCondGroup[];  // P0-02：结构化命中条件（字段+算子+阈值+时间窗口，组间可且/或）
  action: string;         // 处置动作
  weight: number;         // 权重（%）
  scope: string;          // 适用范围（产品/场景）
  owner: string;          // 负责人
  updatedAt: string;      // 更新时间
  flowRef: string;        // 关联业务流程 id（指向 bizFlows.json 的「上线下线审核流程」f-online-approve）
  flowState: string;      // 规则自身审核状态（per-object，存 ruleHub.json，与 f-online-approve 状态机对应：待上线/初审中/复审中/已上线/已下线）
  note?: string;
  // 类型专属属性（谁有谁填）
  listType?: string;      // 黑名单：名单类型
  listValue?: string;     // 黑名单：名单值
  reason?: string;        // 黑名单：加入原因
  memberCount?: number;   // 团伙：成员数
  deviceCount?: number;   // 团伙：设备数
  gangFeature?: string;   // 团伙：特征
  modelName?: string;     // 设备风险：模型名
  hitScore?: number;      // 设备风险：命中分
  triggerFeatures?: string[]; // 设备风险：触发特征
  scene?: string;         // 评分：场景
  scoreThreshold?: string;// 评分：阈值
  verifyItems?: { item: string; cond: string; action: string; actionRef?: string }[]; // 信息核验：核验项（P0-03：actionRef=动作库 id）
  hitMode?: 'any' | 'all';   // 信息核验：命中口径（any=任一不通过即命中 / all=全部不通过才命中）
  crossInst?: CrossInstHit[]; // 跨机构名单：机构×名单命中
  // P1：命中统计（模拟，按风险等级+ID 派生）
  stats?: RuleStats;
  // P2：版本历史（保存自动生成，可回滚）
  versions?: RuleVersion[];
  // P2：归属规则集
  ruleSet?: string;
}

/* ---------- P1 命中统计 ---------- */
export interface RuleStats {
  hits30d: number;       // 近30天命中次数
  hitRate: number;       // 命中率 %
  falsePositive: number; // 误报率 %
}
export function deriveStats(id: string, riskLevel: RiskLevel): RuleStats {
  let h = 2166136261 >>> 0;
  const s = id + riskLevel;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  const base = riskLevel === '高' ? 480 : riskLevel === '中' ? 180 : 40;
  const hits30d = Math.max(3, Math.round(base * (0.6 + (h % 50) / 100)));
  const hitRate = Math.min(98, Math.round((h % 40) + (riskLevel === '高' ? 30 : 18)));
  const falsePositive = Math.min(40, Math.round((h % 25) + (riskLevel === '高' ? 12 : 5)));
  return { hits30d, hitRate, falsePositive };
}

/* ---------- P2 版本历史 ---------- */
export interface RuleVersion {
  version: number;       // 版本号（1,2,3…）
  at: string;            // 修改时间
  by: string;            // 修改人
  summary: string;       // 变更摘要
  snapshot: RuleItem;    // 快照（回滚用）
}
export function pushVersion(rule: RuleItem, by: string, summary: string): RuleItem {
  const versions = rule.versions ?? [];
  const v: RuleVersion = {
    version: versions.length ? versions[versions.length - 1].version + 1 : 1,
    at: new Date().toISOString().slice(0, 19).replace('T', ' '),
    by, summary,
    snapshot: JSON.parse(JSON.stringify(rule)) as RuleItem,
  };
  return { ...rule, versions: [...versions, v] };
}

/* ---------- P2 规则集 ---------- */
export interface RuleSetDef { id: string; name: string; desc: string }

/* ---------- P0-01 核验项库：核验项完整定义（来源/数据源/供应商/计费/状态，可维护） ---------- */
export interface VerifyItemDef {
  id: string;
  name: string;
  cat: string;          // 渠道：身份核验/银行卡核验/运营商核验/生物识别/设备核验/风险名单
  source: string;       // 数据源（查什么库）
  vendor: string;       // 供应商
  price: number;        // 计费（元/次）
  status: '启用' | '停用'; // 停用后规则编辑下拉不再可选
  desc?: string;
  // 接口接入信息（2026-08-09 补充）：调用该核验项的 API 接入配置
  api?: string;         // 接口地址/服务名
  timeout?: number;     // 超时（毫秒）
  qps?: number;         // 并发限制（次/秒）
  doc?: string;         // 对接文档链接
  // 对接参数（需求31 补充）：协议/认证 + 请求入参 + 返回出参（决定「用什么数据去碰撞」）
  protocol?: string;    // 对接协议（HTTP POST JSON / HTTP GET / SDK）
  auth?: string;        // 认证方式（Token / AK-SK / 无）
  requestParams?: { name: string; label: string; required: boolean; source: string }[];  // 入参：参数名 / 含义 / 是否必填 / 数据来源（从申请人字段取）
  responseParams?: { name: string; label: string; desc: string }[];                     // 出参：参数名 / 含义 / 说明
}

/* ---------- 需求32 基础：申请进件数据字段字典（核验项入参的数据来源） ---------- */
export const APPLY_FIELD_OPTIONS = [
  '客户姓名', '证件号', '手机号', '银行卡号', '设备号', 'IP地址',
  '身份证人像', '申请人照片', 'APP版本', 'GPS位置', '紧急联系人', '工作单位',
];

/* ---------- P0-03 动作库：处置动作模板（参数化，可维护） ---------- */
export interface ActionItem {
  id: string;
  name: string;         // 动作名（规则编辑下拉显示）
  target: string;       // 目标系统
  notifyTo: string;     // 通知人/通知对象
  needApprove: boolean; // 是否需审批
  extra: string;        // 补充动作/说明（如加入灰名单、发短信模板）
  desc?: string;
}

/* ---------- P0-02 结构化条件：字段+算子+阈值+时间窗口，组内 AND/OR ---------- */
export interface RuleCondRow {
  field: string;   // 数据字段
  op: string;      // 比较算子
  value: string;   // 阈值
  window?: string; // 时间窗口（如：近30天）
}
export interface RuleCondGroup {
  logic: 'AND' | 'OR';  // 组内行逻辑
  rows: RuleCondRow[];
}

export interface RuleHub {
  rules: RuleItem[];
  verifyCatalog: VerifyItemDef[];  // P0-01：核验项库（规则编辑下拉来源）
  actionLib: ActionItem[];         // P0-03：动作库（规则处置动作来源）
  condLib?: CondLibItem[];         // 需求35：核验触发条件库（信息核验项「触发条件」下拉来源，可维护）
  ruleSets?: RuleSetDef[];         // P2：规则集（组合规则，列表可按规则集筛选）
}

/* ---------- 需求35：核验触发条件库（信息核验项「触发条件」下拉来源，可维护） ---------- */
export interface CondLibItem { id: string; name: string; desc?: string }

/* ---------- P2 规则集 SEED ---------- */
export const SEED_RULE_SETS: RuleSetDef[] = [
  { id: 'RS1', name: '贷前反欺诈集', desc: '申请进件阶段的反欺诈规则组合（设备/黑名单/团伙）' },
  { id: 'RS2', name: '信息核验集', desc: '身份/银行卡/运营商/生物识别等核验规则' },
  { id: 'RS3', name: '贷中监控集', desc: '贷中行为/负债/额度使用监控规则' },
  { id: 'RS4', name: '黑名单管控集', desc: '黑名单查询与跨机构名单规则' },
  { id: 'RS5', name: '评分模型集', desc: '评分卡/模型阈值类规则' },
  { id: 'RS6', name: '合规监管集', desc: '监管合规类规则（利率/收费/催收）' },
];

// SEED 兜底（运行时以 src/console/ruleHub.json 为准；该文件缺失或结构不符时回退至此）
// 注意：ruleHub.json 顶层即 { rules: [...] }，seedRules 已是该形状，勿再包一层 rules，否则 rules 变对象导致 .filter 崩溃。
import seedRules from './ruleHub.json';
export const SEED_RULE_HUB: RuleHub = seedRules as unknown as RuleHub;

export const RULE_TYPES: RuleType[] = [
  '信息核验', '反欺诈', '黑名单', '团伙识别', '设备风险',
  '跨机构名单', '评分模型', '行为监控', '额度授信', '合规监管',
];

/* ---------- P0-01 核验项库 SEED：完整定义（来源/数据源/供应商/计费/状态/接口接入/对接参数，可维护） ---------- */
export const SEED_VERIFY_CATALOG: VerifyItemDef[] = [
  { id: 'V1', name: '公安实名核验', cat: '身份核验', source: '公安部 NCIIC', vendor: '公安三所', price: 0.5, status: '启用', desc: '姓名+证件号与公安库比对', api: 'nciic.realname.v1', timeout: 1000, qps: 100, doc: '/docs/verify/realname', protocol: 'HTTP POST JSON', auth: 'Token',
    requestParams: [{ name: 'name', label: '姓名', required: true, source: '客户姓名' }, { name: 'idCard', label: '证件号', required: true, source: '证件号' }],
    responseParams: [{ name: 'result', label: '核验结果', desc: 'PASS/FAIL/ERROR' }, { name: 'match', label: '是否一致', desc: '姓名与证件号是否匹配' }] },
  { id: 'V2', name: '身份证二要素', cat: '身份核验', source: '公安部 NCIIC', vendor: '银联数据', price: 0.3, status: '启用', desc: '姓名+证件号一致性校验', api: 'nciic.id2.v1', timeout: 800, qps: 200, doc: '/docs/verify/id2', protocol: 'HTTP POST JSON', auth: 'Token',
    requestParams: [{ name: 'name', label: '姓名', required: true, source: '客户姓名' }, { name: 'idCard', label: '证件号', required: true, source: '证件号' }],
    responseParams: [{ name: 'result', label: '核验结果', desc: 'PASS/FAIL/ERROR' }, { name: 'match', label: '是否一致', desc: '二要素是否匹配' }] },
  { id: 'V3', name: '身份证三要素', cat: '身份核验', source: '公安部 NCIIC', vendor: '同盾', price: 0.4, status: '启用', desc: '姓名+证件号+人像校验', api: 'nciic.id3.v1', timeout: 1000, qps: 150, doc: '/docs/verify/id3', protocol: 'HTTP POST JSON', auth: 'Token',
    requestParams: [{ name: 'name', label: '姓名', required: true, source: '客户姓名' }, { name: 'idCard', label: '证件号', required: true, source: '证件号' }, { name: 'photo', label: '人像照', required: true, source: '身份证人像' }],
    responseParams: [{ name: 'result', label: '核验结果', desc: 'PASS/FAIL/ERROR' }, { name: 'match', label: '是否一致', desc: '人像与证件照比对' }, { name: 'similarity', label: '相似度', desc: '0-100' }] },
  { id: 'V4', name: '银行卡三要素', cat: '银行卡核验', source: '银联', vendor: '银联数据', price: 0.6, status: '启用', desc: '姓名+卡号+证件号校验', api: 'unionpay.bank3.v1', timeout: 1200, qps: 100, doc: '/docs/verify/bank3', protocol: 'HTTP POST JSON', auth: 'AK-SK',
    requestParams: [{ name: 'name', label: '姓名', required: true, source: '客户姓名' }, { name: 'bankCard', label: '银行卡号', required: true, source: '银行卡号' }, { name: 'idCard', label: '证件号', required: true, source: '证件号' }],
    responseParams: [{ name: 'result', label: '核验结果', desc: 'PASS/FAIL/ERROR' }, { name: 'bankName', label: '发卡行', desc: '卡归属银行' }] },
  { id: 'V5', name: '银行卡四要素', cat: '银行卡核验', source: '银联', vendor: '银联数据', price: 0.8, status: '启用', desc: '姓名+卡号+证件号+手机号校验', api: 'unionpay.bank4.v1', timeout: 1200, qps: 100, doc: '/docs/verify/bank4', protocol: 'HTTP POST JSON', auth: 'AK-SK',
    requestParams: [{ name: 'name', label: '姓名', required: true, source: '客户姓名' }, { name: 'bankCard', label: '银行卡号', required: true, source: '银行卡号' }, { name: 'idCard', label: '证件号', required: true, source: '证件号' }, { name: 'phone', label: '手机号', required: true, source: '手机号' }],
    responseParams: [{ name: 'result', label: '核验结果', desc: 'PASS/FAIL/ERROR' }, { name: 'bankName', label: '发卡行', desc: '卡归属银行' }] },
  { id: 'V6', name: '银行卡鉴权', cat: '银行卡核验', source: '银联', vendor: '通联支付', price: 1.0, status: '启用', desc: '小额打款/协议支付鉴权', api: 'unionpay.auth.v1', timeout: 3000, qps: 50, doc: '/docs/verify/bank-auth', protocol: 'HTTP POST JSON', auth: 'AK-SK',
    requestParams: [{ name: 'bankCard', label: '银行卡号', required: true, source: '银行卡号' }, { name: 'amount', label: '打款金额', required: true, source: '系统生成' }],
    responseParams: [{ name: 'result', label: '鉴权结果', desc: 'SUCCESS/FAIL' }, { name: 'trace', label: '交易流水号', desc: '对账用' }] },
  { id: 'V7', name: '运营商实名核验', cat: '运营商核验', source: '三大运营商', vendor: '聚信立', price: 0.5, status: '启用', desc: '手机号实名一致性', api: 'op.realname.v1', timeout: 1500, qps: 80, doc: '/docs/verify/op-realname', protocol: 'HTTP POST JSON', auth: 'Token',
    requestParams: [{ name: 'phone', label: '手机号', required: true, source: '手机号' }, { name: 'name', label: '姓名', required: true, source: '客户姓名' }, { name: 'idCard', label: '证件号', required: true, source: '证件号' }],
    responseParams: [{ name: 'result', label: '核验结果', desc: 'PASS/FAIL' }, { name: 'operator', label: '运营商', desc: '移动/联通/电信' }] },
  { id: 'V8', name: '在网状态核验', cat: '运营商核验', source: '三大运营商', vendor: '聚信立', price: 0.4, status: '启用', desc: '号码当前在网/停机/销户', api: 'op.status.v1', timeout: 1500, qps: 80, doc: '/docs/verify/op-status', protocol: 'HTTP POST JSON', auth: 'Token',
    requestParams: [{ name: 'phone', label: '手机号', required: true, source: '手机号' }],
    responseParams: [{ name: 'result', label: '核验结果', desc: 'NORMAL/STOPPED/CANCELED' }, { name: 'status', label: '在网状态', desc: '在网/停机/销户' }] },
  { id: 'V9', name: '在网时长核验', cat: '运营商核验', source: '三大运营商', vendor: '聚信立', price: 0.4, status: '启用', desc: '号码入网时长（≥3个月为佳）', api: 'op.tenure.v1', timeout: 1500, qps: 80, doc: '/docs/verify/op-tenure', protocol: 'HTTP POST JSON', auth: 'Token',
    requestParams: [{ name: 'phone', label: '手机号', required: true, source: '手机号' }],
    responseParams: [{ name: 'result', label: '核验结果', desc: 'PASS/FAIL' }, { name: 'tenure', label: '入网时长', desc: '月数' }] },
  { id: 'V10', name: '活体检测', cat: '生物识别', source: '自建（SDK）', vendor: '旷视', price: 0.2, status: '启用', desc: '眨眼/张嘴/转头等活体动作', api: 'bio.liveness.sdk', timeout: 5000, qps: 200, doc: '/docs/verify/liveness', protocol: 'SDK', auth: '无',
    requestParams: [{ name: 'video', label: '活体视频', required: true, source: '申请人照片' }],
    responseParams: [{ name: 'result', label: '活体结果', desc: 'PASS/FAIL' }, { name: 'liveness', label: '活体分', desc: '0-100' }] },
  { id: 'V11', name: '人脸识别比对', cat: '生物识别', source: '自建（SDK）', vendor: '旷视', price: 0.2, status: '启用', desc: '自拍照与证件照 1:N 比对', api: 'bio.face-match.v1', timeout: 3000, qps: 120, doc: '/docs/verify/face-match', protocol: 'HTTP POST JSON', auth: 'Token',
    requestParams: [{ name: 'photo', label: '自拍照', required: true, source: '申请人照片' }, { name: 'idCardPhoto', label: '证件照', required: true, source: '身份证人像' }],
    responseParams: [{ name: 'result', label: '比对结果', desc: 'PASS/FAIL' }, { name: 'similarity', label: '相似度', desc: '0-100' }] },
  { id: 'V12', name: '设备指纹核验', cat: '设备核验', source: '自建设备指纹库', vendor: '自研', price: 0, status: '启用', desc: '设备唯一标识与历史设备比对', api: 'dev.fp-query.v1', timeout: 500, qps: 500, doc: '/docs/verify/device-fp', protocol: 'HTTP POST JSON', auth: '无',
    requestParams: [{ name: 'deviceId', label: '设备号', required: true, source: '设备号' }, { name: 'ip', label: 'IP地址', required: false, source: 'IP地址' }],
    responseParams: [{ name: 'result', label: '核验结果', desc: 'KNOWN/NEW' }, { name: 'isKnown', label: '是否历史设备', desc: 'true/false' }, { name: 'deviceRisk', label: '设备风险', desc: '高/中/低' }] },
  { id: 'V13', name: '黑名单查询', cat: '风险名单', source: '内部名单库', vendor: '自研', price: 0, status: '启用', desc: '身份证/手机号/设备命中黑名单', api: 'risk.blk-query.v1', timeout: 500, qps: 500, doc: '/docs/verify/blacklist', protocol: 'HTTP POST JSON', auth: '无',
    requestParams: [{ name: 'idCard', label: '证件号', required: false, source: '证件号' }, { name: 'phone', label: '手机号', required: false, source: '手机号' }, { name: 'deviceId', label: '设备号', required: false, source: '设备号' }],
    responseParams: [{ name: 'result', label: '查询结果', desc: 'HIT/MISS' }, { name: 'hitList', label: '命中名单', desc: '名单名称列表' }, { name: 'level', label: '风险等级', desc: '高/中/低' }] },
  { id: 'V14', name: '多头借贷查询', cat: '风险名单', source: '征信/联盟数据', vendor: '百行征信', price: 0.8, status: '启用', desc: '近期在贷平台数与查询次数', api: 'credit.multi-loan.v1', timeout: 2000, qps: 60, doc: '/docs/verify/multi-loan', protocol: 'HTTP POST JSON', auth: 'Token',
    requestParams: [{ name: 'idCard', label: '证件号', required: true, source: '证件号' }],
    responseParams: [{ name: 'result', label: '查询结果', desc: 'PASS/FAIL' }, { name: 'loanCount', label: '在贷平台数', desc: '数字' }, { name: 'queryCount', label: '近7天查询次数', desc: '数字' }] },
];
/* 兼容导出：仅名称+渠道（旧代码用） */
export const VERIFY_ITEM_CATALOG: { name: string; cat: string }[] = SEED_VERIFY_CATALOG.map((v) => ({ name: v.name, cat: v.cat }));

/* ---------- P0-03 动作库 SEED：处置动作模板（参数化） ---------- */
export const SEED_ACTION_LIB: ActionItem[] = [
  { id: 'A1', name: '拒绝', target: '信贷系统', notifyTo: '申请渠道', needApprove: false, extra: '拒绝授信并返回原因码', desc: '硬拒绝，无审批' },
  { id: 'A2', name: '转人工复核', target: '工单中心', notifyTo: '风控专员-张三', needApprove: false, extra: '生成复核工单，24h 内处理', desc: '命中不明时转人工' },
  { id: 'A3', name: '告警提示', target: '预警平台', notifyTo: '风控主管-王芳', needApprove: false, extra: '推送告警消息并留痕', desc: '低危事件仅提示' },
  { id: 'A4', name: '加入灰名单', target: '名单中心', notifyTo: '风控组', needApprove: true, extra: '写入灰名单，观察期 90 天', desc: '需要主管审批' },
  { id: 'A5', name: '加入黑名单', target: '名单中心', notifyTo: '风控主管-王芳', needApprove: true, extra: '写入黑名单，全渠道拦截', desc: '强风险，需审批' },
  { id: 'A6', name: '自动降额', target: '信贷系统', notifyTo: '客户经理', needApprove: true, extra: '额度下调 50%，短信通知客户', desc: '贷中降额处置' },
  { id: 'A7', name: '短信提醒', target: '短信平台', notifyTo: '客户本人', needApprove: false, extra: '发送还款/异常提醒模板', desc: '客户触达' },
  { id: 'A8', name: '冻结授信', target: '信贷系统', notifyTo: '风控主管-王芳', needApprove: true, extra: '冻结可用额度，待复核解冻', desc: '高风险冻结' },
];

/* 触发条件 / 处置动作 均为可选，留空即「不限制 / 不设置」 */
/* 需求35：触发条件下拉来源 = 可维护的「核验条件库」（condLib），VERIFY_COND_OPTIONS 仅为兼容导出 */
export const SEED_COND_LIB: CondLibItem[] = [
  { id: 'C1', name: '核验不通过', desc: '核验结果明确不通过（如二要素不一致）' },
  { id: 'C2', name: '核验结果异常', desc: '返回异常或数据缺失（如公安库无记录）' },
  { id: 'C3', name: '核验超时', desc: '调用超时或供应商无响应' },
  { id: 'C4', name: '与录入信息不一致', desc: '核验结果与客户录入信息存在差异' },
  { id: 'C5', name: '命中风险名单', desc: '核验对象命中黑名单/灰名单/观察名单' },
];
export const VERIFY_COND_OPTIONS = SEED_COND_LIB.map((c) => c.name);
export const VERIFY_ACTION_OPTIONS = SEED_ACTION_LIB.map((a) => a.name);

/* ---------- P0-02 条件编辑器候选库 ---------- */
export const COND_FIELD_OPTIONS = [
  '近30天申请机构数', '近7天征信查询次数', '近30天征信查询次数', '7日内设备更换次数',
  '月供/月收入比', '同时在贷平台数', '行为评分', '行为分单日降幅', '额度使用率',
  '命中黑名单次数', '关联企业数', '新增被执行记录数', '关联开庭公告数', '回访失联次数',
  '担保企业逾期数', '夜间交易占比',
];
export const COND_OP_OPTIONS = ['≥', '≤', '>', '<', '=', '≠', '包含', '命中', '不为空'];
export const COND_WINDOW_OPTIONS = ['不限', '近7天', '近30天', '近90天', '近180天', '近1年'];

/* 把结构化条件组汇总为「大白话」命中条件（列表页/详情展示兼容） */
export function summarizeCond(groups?: RuleCondGroup[]): string {
  if (!groups || groups.length === 0) return '';
  return groups.map((g, i) => {
    const inner = g.rows.map((r) => {
      // 字段名本身带「近X天」前缀时不再重复窗口
      const w = r.window && r.window !== '不限' && !r.field.startsWith('近') ? r.window + ' ' : '';
      return [w, r.field, r.op, r.value].filter(Boolean).join(' ');
    }).join(` ${g.logic} `);
    return groups.length > 1 ? `（${inner}）` : inner;
  }).join(' 且 ');
}

/* ---------- 状态推导：规则有效状态 = 关联业务流程的审核状态 ---------- */
export function deriveRuleStatus(flowState?: string): { v: string; kind: 'green' | 'gray' | 'amber' } {
  if (!flowState) return { v: '—', kind: 'gray' };
  if (flowState.includes('已上线')) return { v: '已生效', kind: 'green' };
  if (flowState.includes('已下线')) return { v: '已下线', kind: 'gray' };
  return { v: '草稿待上线', kind: 'amber' };
}

/* ---- 轻量 store（与 midStore/collectionData/scoringData 同构） ---- */
import { useSyncExternalStore } from 'react';

const FILE = 'ruleHub.json';
let data: RuleHub = {
  rules: (SEED_RULE_HUB.rules ?? []).map((r) => ({ ...r })),
  verifyCatalog: [...SEED_VERIFY_CATALOG],
  actionLib: [...SEED_ACTION_LIB],
  condLib: [...SEED_COND_LIB],
  ruleSets: [...SEED_RULE_SETS],
};
let version = 0;
let saveStatus: 'ok' | 'error' | null = null;
const listeners = new Set<() => void>();
const statusListeners = new Set<() => void>();

function emit() { version++; listeners.forEach((fn) => fn()); }
function emitStatus() { statusListeners.forEach((fn) => fn()); }

async function loadOne(file: string): Promise<unknown> {
  try {
    const r = await fetch(`/api/load-mid?file=${encodeURIComponent(file)}`);
    if (r.ok) return await r.json();
    return null;
  } catch { return null; }
}
function saveOne(file: string, body: unknown) {
  fetch(`/api/save-mid?file=${encodeURIComponent(file)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then((r) => { saveStatus = r.ok ? 'ok' : 'error'; emitStatus(); })
    .catch(() => { saveStatus = 'error'; emitStatus(); });
}

async function bootstrap() {
  const saved = await loadOne(FILE);
  // 守卫：仅当返回对象含 rules 数组（新结构）才采用；旧结构（verifySets 等）一律重落盘，避免缺字段崩溃
  if (saved && typeof saved === 'object' && Array.isArray((saved as RuleHub).rules)) {
    const s = saved as Partial<RuleHub>;
    // P0-01/03：merge 核验项库/动作库（用户已维护的保留，缺失时用 SEED 兜底）；需求35：merge 条件库；P2：merge 规则集
    data = {
      rules: s.rules as RuleItem[],
      verifyCatalog: Array.isArray(s.verifyCatalog) && s.verifyCatalog.length ? s.verifyCatalog as VerifyItemDef[] : [...SEED_VERIFY_CATALOG],
      actionLib: Array.isArray(s.actionLib) && s.actionLib.length ? s.actionLib as ActionItem[] : [...SEED_ACTION_LIB],
      condLib: Array.isArray(s.condLib) && s.condLib.length ? s.condLib as CondLibItem[] : [...SEED_COND_LIB],
      ruleSets: Array.isArray(s.ruleSets) && s.ruleSets.length ? s.ruleSets as RuleSetDef[] : [...SEED_RULE_SETS],
    };
  } else {
    data = {
      rules: (SEED_RULE_HUB.rules ?? []).map((r) => ({ ...r })),
      verifyCatalog: [...SEED_VERIFY_CATALOG],
      actionLib: [...SEED_ACTION_LIB],
      condLib: [...SEED_COND_LIB],
      ruleSets: [...SEED_RULE_SETS],
    };
    saveOne(FILE, data);
  }
  emit();
}
void bootstrap();

function useSnap<T>(sel: () => T): T { useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => version); return sel(); }

export function useRuleHub(): RuleHub { return useSnap(() => data); }
export function updateRuleHub(fn: (d: RuleHub) => RuleHub) {
  data = fn(data);
  emit();
  saveOne(FILE, data);
}
