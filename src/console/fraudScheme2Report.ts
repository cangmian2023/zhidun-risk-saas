// 欺诈识别报告（方案2）· 数据模型与示例数据
// 框架与信息核验(infoVerifyReport.ts)完全对齐：复用同一套类型与结构；
// 对标同盾反欺诈能力：双分数（自研欺诈汇总分 0-100 + 智察分同盾原生）、
// 5 个多源欺诈单项、5 大欺诈维度、8 步欺诈链路，移除证件照模块。
import type {
  InfoVerifyReport,
  Conclusion,
  BasicField,
  EnvCapture,
  SingleResult,
  OpLog,
  VerifyThread,
  AtomicResult,
  ItemAction,
  RiskTag,
  RiskLevel,
} from './infoVerifyReport'

// 复用信息核验同一套类型，转发导出，供详情页按方案内模块统一引用
export type {
  InfoVerifyReport,
  Conclusion,
  BasicField,
  EnvCapture,
  ImageWithOcr,
  SingleResult,
  OpLog,
  VerifyThread,
  AtomicResult,
  VerifyConflict,
  ScoreComponent,
  CrossCheck,
  ItemAction,
  RiskTag,
  RiskLevel,
  RulePromptType,
} from './infoVerifyReport'

// 方案2 扩展：在信息核验报告基础上追加「智察分（同盾原生）」双分数字段
export interface FraudS2Report extends InfoVerifyReport {
  zhicha: number // 智察分（同盾原生），分值越高欺诈风险越高
  zhichaBand: RiskLevel
}

/* ───────────────────── 反欺诈链路（8 步，结论随风险等级上色） ───────────────────── */
const mkThread = (
  id: string,
  name: string,
  icon: VerifyThread['icon'],
  conclusion: Conclusion,
  result: string,
): VerifyThread => ({
  id,
  name,
  icon,
  status: conclusion === 'reject' ? 'fail' : 'done',
  start: '2026-07-18 14:22:01.000',
  end: '2026-07-18 14:22:02.000',
  result,
  conclusion,
})

// 8 步：用户发起申请 → 设备指纹采集 → IP&环境风险采集 → 黑名单检索 → 团伙关联图谱查询 → 欺诈特征交叉碰撞 → 模型计算(智察分) → 欺诈报告生成
function buildThreads(variant: 'pass' | 'warning' | 'reject'): VerifyThread[] {
  const base = [
    mkThread('t1', '用户发起申请', 'operator', 'pass', '资料完整提交'),
    mkThread('t2', '设备指纹采集', 'device', 'pass', '设备环境正常'),
    mkThread('t3', 'IP&环境风险采集', 'network', 'pass', '网络环境正常'),
    mkThread('t4', '黑名单检索', 'police', 'pass', '未命中黑名单'),
    mkThread('t5', '团伙关联图谱查询', 'network', 'pass', '关联图谱干净'),
    mkThread('t6', '欺诈特征交叉碰撞', 'rule', 'pass', '无交叉异常'),
    mkThread('t7', '模型计算（智察分）', 'network', 'pass', '智察分低风险'),
    mkThread('t8', '欺诈报告生成', 'rule', 'pass', '低风险通过'),
  ]
  if (variant === 'pass') return base
  if (variant === 'warning') {
    return base.map((t) =>
      ['t2', 't3', 't5', 't7'].includes(t.id)
        ? {
            ...t,
            conclusion: 'warning' as Conclusion,
            result: t.result
              .replace('设备环境正常', '设备存疑（疑似模拟器）')
              .replace('网络环境正常', 'IP 归属频繁跳跃')
              .replace('关联图谱干净', '关联轻度异常')
              .replace('智察分低风险', '智察分中风险'),
          }
        : t,
    )
  }
  // reject（确认欺诈）
  return base.map((t) =>
    ['t2', 't3', 't4', 't5', 't7', 't8'].includes(t.id)
      ? {
          ...t,
          conclusion: 'reject' as Conclusion,
          result: t.result
            .replace('设备环境正常', '虚拟机+群控命中')
            .replace('网络环境正常', '代理/机房 IP 命中')
            .replace('未命中黑名单', '命中欺诈黑名单')
            .replace('关联图谱干净', '团伙群控活跃')
            .replace('智察分低风险', '智察分极高风险')
            .replace('低风险通过', '确认欺诈拦截'),
        }
      : t,
  )
}

/* ───────────────────── 申请人基础字段（只读，不新增录入项） ───────────────────── */
function baseBasic(): BasicField[] {
  return [
    { key: 'name', label: '姓名', value: '张*伟', valid: true },
    { key: 'idNo', label: '身份证号', value: '110***********0314', valid: true },
    { key: 'phone', label: '手机号', value: '138****1234', valid: true },
    { key: 'gender', label: '性别', value: '男', valid: true },
    { key: 'age', label: '年龄', value: '36', valid: true },
    { key: 'address', label: '居住地址', value: '北京市朝阳区建国路 88 号', valid: true },
  ]
}

// 欺诈环境采集信息（重点扩展：设备、IP、定位、渠道、图谱编号）
function baseEnv(): EnvCapture[] {
  return [
    { key: 'deviceId', label: '设备指纹 ID', value: 'DV-9F2A-77C1' },
    { key: 'os', label: '系统版本', value: 'Android 13 (SDK 33)' },
    { key: 'emulator', label: '模拟器识别', value: '非模拟器' },
    { key: 'ipLoc', label: 'IP 归属地', value: '北京市朝阳区' },
    { key: 'ipType', label: 'IP 类型', value: '家庭宽带（公网）' },
    { key: 'gps', label: 'GPS 定位', value: '北京市朝阳区 (39.908, 116.447)' },
    { key: 'gpsMatch', label: '定位与身份证属地匹配度', value: '高（同城）' },
    { key: 'channel', label: '进件渠道', value: 'App (Android 13)' },
    { key: 'appVer', label: 'APP 版本', value: '5.2.1' },
    { key: 'applyTime', label: '申请时段', value: '14:22（工作时段）' },
    { key: 'opDuration', label: '操作行为时长', value: '4 分 12 秒（正常）' },
    { key: 'graphNo', label: '同盾设备关联图谱编号', value: 'TG-GRAPH-77C1-0011' },
  ]
}

/* ───────────────────── 5 张多源欺诈单项核验卡（三态按风险替换 conclusion） ───────────────────── */
// 顺序：黑名单风险 / 设备风险指纹 / IP&网络环境风险 / 团伙关联图谱 / 申请行为特征
function baseSingle(): SingleResult[] {
  return [
    {
      source: 'blacklist',
      name: '黑名单风险核验',
      icon: 'police',
      callStatus: 'success',
      costMs: 210,
      conclusion: 'pass',
      reason: '欺诈黑名单、失信、逃废债、涉案名单均未命中。',
      items: [
        { label: '欺诈黑名单', value: '未命中', status: 'ok' },
        { label: '法院失信', value: '未命中', status: 'ok' },
        { label: '逃废债名单', value: '未命中', status: 'ok' },
        { label: '涉案名单', value: '未命中', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320089',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
    {
      source: 'device',
      name: '设备风险指纹核验',
      icon: 'device',
      callStatus: 'success',
      costMs: 180,
      conclusion: 'pass',
      reason: '设备指纹正常，未命中模拟器/ROOT/多开/群控库，无设备复用。',
      items: [
        { label: '模拟器检测', value: '否', status: 'ok' },
        { label: 'ROOT/越狱', value: '否', status: 'ok' },
        { label: '多开/分身', value: '否', status: 'ok' },
        { label: '设备复用', value: '未命中', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320111',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
    {
      source: 'network',
      name: 'IP&网络环境风险核验',
      icon: 'network',
      callStatus: 'success',
      costMs: 150,
      conclusion: 'pass',
      reason: 'IP 为家庭宽带，归属地与 GPS 一致，未命中代理/机房/跨境网络。',
      items: [
        { label: '代理 IP', value: '未命中', status: 'ok' },
        { label: '机房 IP', value: '否', status: 'ok' },
        { label: '异地异常登录', value: '否', status: 'ok' },
        { label: '跨境网络', value: '否', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320133',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
    {
      source: 'graph',
      name: '团伙关联图谱交叉核验',
      icon: 'network',
      callStatus: 'success',
      costMs: 380,
      conclusion: 'pass',
      reason: '手机号/设备/地址未关联历史欺诈申请人，无共债团伙信号。',
      items: [
        { label: '关联欺诈申请人', value: '0 个', status: 'ok' },
        { label: '共债团伙', value: '未命中', status: 'ok' },
        { label: '关联设备', value: '无异常', status: 'ok' },
        { label: '关联地址', value: '无异常', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320145',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
    {
      source: 'behavior',
      name: '申请行为特征核验',
      icon: 'operator',
      callStatus: 'success',
      costMs: 260,
      conclusion: 'pass',
      reason: '短时间申请频次正常，无批量进件、无脚本薅贷行为特征。',
      items: [
        { label: '短时多次申请', value: '否', status: 'ok' },
        { label: '批量进件', value: '未命中', status: 'ok' },
        { label: '操作行为异常', value: '否', status: 'ok' },
        { label: '脚本/自动化', value: '未检出', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320166',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
  ]
}

/* ───────────────────── 5 大欺诈维度 ───────────────────── */
// 申请人基础可信度 / 网络环境安全性 / 设备风险等级 / 申请行为合理性 / 团伙关联风险
function baseAtomic(): AtomicResult[] {
  return [
    { key: 'a1', label: '申请人基础可信度', value: '可信', status: 'ok', tooltip: '实名信息一致、黑名单未命中，申请人基础可信。', conflictIds: [] },
    { key: 'a2', label: '网络环境安全性', value: '安全', status: 'ok', tooltip: 'IP 家庭宽带、归属地一致、无代理/机房，网络环境安全。', conflictIds: [] },
    { key: 'a3', label: '设备风险等级', value: '低', status: 'ok', tooltip: '设备指纹正常，未命中模拟器/群控库，设备风险低。', conflictIds: [] },
    { key: 'a4', label: '申请行为合理性', value: '合理', status: 'ok', tooltip: '申请频次、操作时长正常，无批量/脚本薅贷特征。', conflictIds: [] },
    { key: 'a5', label: '团伙关联风险', value: '无', status: 'ok', tooltip: '未命中团伙图谱，无共债团伙协同信号。', conflictIds: [] },
  ]
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T
}

/* ───────────────────── 三态报告构建（智察分 + 自研欺诈汇总分 0-100） ───────────────────── */
// 依据样例 id 返回对应状态：含 FRAUD → 确认欺诈(红)；含 SUSPECT/WARNING → 可疑(黄)；缺省 → 无风险(绿)
export function buildFraudScheme2Report(id?: string): FraudS2Report {
  const status: 'pass' | 'reject' | 'warning' = id
    ? id.includes('FRAUD')
      ? 'reject'
      : id.includes('SUSPECT') || id.includes('WARNING')
        ? 'warning'
        : 'pass'
    : 'pass'

  // ====== 确认欺诈（reject）基础数据 ======
  const r: FraudS2Report = {
    appId: 'J20260718F0001',
    name: '张*伟',
    idNo: '110***********0314',
    zhicha: 91,
    zhichaBand: 'high',
    decision: 'reject',
    decisionText: '确认欺诈',
    summary:
      '申请人命中欺诈黑名单，设备指纹命中虚拟机+群控库，IP 为机房代理，团伙图谱关联 3 个已确认欺诈申请人。综合判定：确认欺诈。',
    basic: baseBasic(),
    env: baseEnv(),
    images: [],
    struct: [],
    single: baseSingle(),
    threads: buildThreads('reject'),
    cross: {
      finalConclusion: 'reject',
      finalReason:
        '黑名单命中 + 设备群控 + 机房代理 IP + 团伙图谱关联 3 个确认欺诈申请人，多项核心欺诈规则叠加触发，综合判定确认欺诈。',
      overallRisk: 'high',
      riskScore: 88,
      scoreCap: 100,
      riskTags: [
        { label: '黑名单命中', kind: 'red' as RiskTag['kind'] },
        { label: '设备群控', kind: 'red' as RiskTag['kind'] },
        { label: '代理IP', kind: 'red' as RiskTag['kind'] },
        { label: '团伙关联', kind: 'amber' as RiskTag['kind'] },
      ],
      conflicts: [
        {
          id: 'c1',
          level: 'high',
          desc: '欺诈黑名单命中，同时设备指纹命中虚拟机+群控库，属高危欺诈组合。',
          items: [
            { side: '黑名单风险核验', value: '欺诈黑名单命中', source: 'blacklist', tone: 'fail' },
            { side: '设备风险指纹核验', value: '虚拟机+群控命中', source: 'device', tone: 'fail' },
          ],
          resolution: '黑名单 + 设备群控组合直接触发核心欺诈规则，标记为确认欺诈。',
          isCoreFactor: true,
          relatedAtomicKeys: ['a1', 'a3'],
        },
        {
          id: 'c2',
          level: 'high',
          desc: 'IP 命中机房/代理，且定位与身份证属地不一致，疑似伪造网络环境。',
          items: [
            { side: 'IP&网络环境风险核验', value: '机房/代理 IP', source: 'network', tone: 'fail' },
            { side: '欺诈环境采集', value: '定位属地不一致', source: 'network', tone: 'warn' },
          ],
          resolution: '网络环境伪造信号叠加，作为核心欺诈因子留存。',
          isCoreFactor: true,
          relatedAtomicKeys: ['a2'],
        },
        {
          id: 'c3',
          level: 'medium',
          desc: '团伙关联图谱发现 3 个关联人已被标记为确认欺诈，存在团伙协同申贷特征。',
          items: [
            { side: '团伙关联图谱交叉核验', value: '3 个关联人确认欺诈', source: 'graph', tone: 'fail' },
            { side: '申请行为特征核验', value: '短时批量进件', source: 'behavior', tone: 'warn' },
          ],
          resolution: '团伙协同信号，图谱标记活跃，建议强制加入黑名单。',
          isCoreFactor: false,
          relatedAtomicKeys: ['a4', 'a5'],
        },
      ],
      atomic: [
        { key: 'a1', label: '申请人基础可信度', value: '不可信', status: 'fail', tooltip: '命中欺诈黑名单，申请人基础可信度极低。', conflictIds: ['c1'] },
        { key: 'a2', label: '网络环境安全性', value: '高危', status: 'fail', tooltip: 'IP 命中机房/代理，定位属地不一致，网络环境疑似伪造。', conflictIds: ['c2'] },
        { key: 'a3', label: '设备风险等级', value: '极高', status: 'fail', tooltip: '设备指纹命中虚拟机+群控库，存在设备农场嫌疑。', conflictIds: ['c1'] },
        { key: 'a4', label: '申请行为合理性', value: '异常', status: 'warn', tooltip: '短时批量进件，疑似脚本/团伙协同申请。', conflictIds: ['c3'] },
        { key: 'a5', label: '团伙关联风险', value: '活跃', status: 'fail', tooltip: '团伙图谱关联 3 个确认欺诈申请人，团伙协同风险高。', conflictIds: ['c3'] },
      ],
      ruleBasis: '判定规则：单一极高欺诈风险直接拦截；叠加 2 项以上核心欺诈规则，欺诈总分 ≥ 80 自动拒绝。',
      auditTime: '2026-07-21 15:00:22',
      ruleVersion: 'V2.6 反欺诈策略集',
      reportId: 'FRD20260721001',
      scoreComponents: [
        { name: '黑名单欺诈名单命中', situation: '命中欺诈黑名单', score: 38, weight: 43, level: 'high', traceTo: 'c1', core: true },
        { name: '设备团伙群控', situation: '设备 7 日内关联多申请人、群控命中', score: 30, weight: 34, level: 'high', traceTo: 'c1', core: true },
        { name: '代理/机房 IP', situation: 'IP 代理/VPN/机房环境', score: 12, weight: 14, level: 'medium', traceTo: 'c2' },
        { name: '跨平台代办特征', situation: '团伙协同、短时批量进件', score: 8, weight: 9, level: 'medium', traceTo: 'c3' },
      ],
    },
    itemActions: [
      {
        id: 'ia1',
        target: '黑名单风险核验',
        targetKind: 'reject',
        action: '确认欺诈结论',
        actionKind: 'reject',
        operator: '李审核',
        time: '2026-07-18 14:35',
        before: '系统判定：确认欺诈',
        after: '人工确认：确认欺诈',
        reason: '黑名单命中 + 设备群控，证据充分，维持确认欺诈结论。',
      },
    ] as ItemAction[],
    reportActions: [
      {
        id: 'ra1',
        action: '整体报告确认',
        actionKind: 'reject',
        operator: '李审核',
        time: '2026-07-18 14:40',
        before: '系统决策：确认欺诈',
        after: '最终决策：确认欺诈',
        reason: '综合黑名单、设备与团伙关联，维持确认欺诈，提交至黑名单处置。',
      },
    ],
    opLogs: [
      {
        id: 'log1',
        target: '设备风险指纹核验',
        actionType: '重新核验',
        operator: '李审核',
        time: '2026-07-18 14:30',
        remark: '首次核验命中群控，二次调用同盾设备指纹接口，核验流水号：FR2026072114320200',
      },
      {
        id: 'log2',
        target: '团伙关联图谱交叉核验',
        actionType: '关联电核',
        operator: '李审核',
        time: '2026-07-18 14:38',
        remark: '关联电核台账编号 EC20260718038，关联 3 个确认欺诈申请人。',
      },
    ] as OpLog[],
  }

  if (status === 'reject') return r

  if (status === 'pass') {
    // 无风险（绿）
    r.decision = 'pass'
    r.decisionText = '无风险'
    r.zhicha = 15
    r.zhichaBand = 'low'
    r.threads = buildThreads('pass')
    r.summary = '黑名单/设备指纹/IP网络/团伙图谱/申请行为五项欺诈核验全部通过，关联图谱干净，无团伙信号。综合判定：无风险。'
    r.cross.finalConclusion = 'pass'
    r.cross.finalReason = '全部单项核验通过，设备无异常、网络安全、团伙图谱干净，综合判定无风险。'
    r.cross.overallRisk = 'low'
    r.cross.riskScore = 8
    r.cross.ruleBasis = '判定规则：欺诈总分 < 40，未命中任何核心欺诈规则，自动判无风险。'
    r.cross.riskTags = [
      { label: '黑名单干净', kind: 'blue' as RiskTag['kind'] },
      { label: '设备真实', kind: 'blue' as RiskTag['kind'] },
      { label: '图谱无风险', kind: 'blue' as RiskTag['kind'] },
    ]
    r.cross.conflicts = []
    r.cross.atomic = baseAtomic()
    r.cross.scoreComponents = [
      { name: '无风险证据', situation: '全部单项核验通过，未累计到风险证据', score: 0, weight: 0, level: 'low' },
    ]
    r.single = r.single.map((s) => ({ ...s, conclusion: 'pass' as Conclusion, rulePromptType: 'pass' as const }))
    return r
  }

  // 可疑（黄）：在确认欺诈基础上弱化因子为「可疑」，保留 2 条中风险冲突
  const w = clone(r)
  w.decision = 'warning'
  w.decisionText = '可疑'
  w.zhicha = 58
  w.zhichaBand = 'medium'
  w.threads = buildThreads('warning')
  w.summary = '设备指纹疑似模拟器、IP 归属地频繁跳跃，团伙图谱出现 1 个轻度关联人命中多头，触发 2 条中风险规则。综合判定：可疑。'
  w.cross.finalConclusion = 'warning'
  w.cross.finalReason = '设备风险存疑 + 网络归属跳跃 + 关联轻度异常，需人工复核后判定。'
  w.cross.overallRisk = 'medium'
  w.cross.riskScore = 52
  w.cross.ruleBasis = '判定规则：欺诈总分 40-80，命中 2 条中风险规则（设备存疑 + 关联轻度异常），转人工复核。'
  w.cross.riskTags = [
    { label: '设备存疑', kind: 'amber' as RiskTag['kind'] },
    { label: '归属跳跃', kind: 'amber' as RiskTag['kind'] },
    { label: '关联轻度异常', kind: 'amber' as RiskTag['kind'] },
    { label: '黑名单干净', kind: 'blue' as RiskTag['kind'] },
  ]
  w.cross.conflicts = [
    {
      id: 'c1',
      level: 'medium',
      desc: '设备指纹命中模拟器特征，疑似云手机/群控环境，需人工确认是否为本人真实设备。',
      items: [
        { side: '设备风险指纹核验', value: '疑似模拟器', source: 'device', tone: 'warn' },
        { side: '团伙关联图谱交叉核验', value: '关联 1 个异常', source: 'graph', tone: 'warn' },
      ],
      resolution: '疑似模拟器但未确认欺诈，标记可疑，建议人工电核设备真实性。',
      isCoreFactor: false,
      relatedAtomicKeys: ['a3', 'a5'],
    },
    {
      id: 'c3',
      level: 'medium',
      desc: 'IP 归属地近 7 天频繁跳跃，且团伙图谱出现 1 个轻度关联人命中多头。',
      items: [
        { side: 'IP&网络环境风险核验', value: '归属地频繁跳跃', source: 'network', tone: 'warn' },
        { side: '团伙关联图谱交叉核验', value: '1 个关联人命中多头', source: 'graph', tone: 'warn' },
      ],
      resolution: '网络归属跳跃 + 关联轻度异常，建议人工核实后决定是否豁免。',
      isCoreFactor: false,
      relatedAtomicKeys: ['a2', 'a5'],
    },
  ]
  w.cross.atomic = [
    { key: 'a1', label: '申请人基础可信度', value: '可信', status: 'ok', tooltip: '实名信息一致、黑名单未命中，申请人基础可信。', conflictIds: [] },
    { key: 'a2', label: '网络环境安全性', value: '存疑', status: 'warn', tooltip: 'IP 归属地近 7 天频繁跳跃，网络环境存疑。', conflictIds: ['c3'] },
    { key: 'a3', label: '设备风险等级', value: '中', status: 'warn', tooltip: '设备指纹疑似模拟器特征，需人工确认真实性。', conflictIds: ['c1'] },
    { key: 'a4', label: '申请行为合理性', value: '合理', status: 'ok', tooltip: '申请频次、操作时长正常，无批量/脚本薅贷特征。', conflictIds: [] },
    { key: 'a5', label: '团伙关联风险', value: '轻度', status: 'warn', tooltip: '团伙图谱出现 1 个轻度关联人命中多头。', conflictIds: ['c1', 'c3'] },
  ]
  w.cross.scoreComponents = [
    { name: '疑似模拟器设备', situation: '设备指纹疑似模拟器特征', score: 24, weight: 46, level: 'medium', traceTo: 'c1' },
    { name: 'IP 归属跳跃', situation: '近 7 天 IP 归属地频繁跳跃', score: 16, weight: 31, level: 'medium', traceTo: 'c3' },
    { name: '关联轻度异常', situation: '关联人命中多头', score: 12, weight: 23, level: 'medium', traceTo: 'c3' },
  ]
  w.single = w.single.map((s) => {
    if (s.source === 'device') return { ...s, conclusion: 'warning' as Conclusion, reason: '设备指纹疑似模拟器特征，需人工确认真实性。', rulePromptType: 'warning' as const }
    if (s.source === 'network') return { ...s, conclusion: 'warning' as Conclusion, reason: 'IP 归属地近 7 天频繁跳跃，网络环境存疑。', rulePromptType: 'warning' as const }
    if (s.source === 'graph') return { ...s, conclusion: 'warning' as Conclusion, reason: '团伙图谱出现 1 个轻度关联人命中多头。', rulePromptType: 'warning' as const }
    return s
  })
  return w
}
