// 欺诈识别报告（方案1）· 数据模型与示例数据
// 框架与信息核验(infoVerifyReport.ts)完全对齐：复用同一套类型与结构，
// 内容围绕「反欺诈评分 / 欺诈网络 / 关联黑名单 / 设备环境」展开，评分量级 0-1000。
import type {
  InfoVerifyReport,
  Conclusion,
  BasicField,
  EnvCapture,
  ImageWithOcr,
  SingleResult,
  OpLog,
  VerifyThread,
  AtomicResult,
  ItemAction,
  RiskTag,
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

/* ───────────────────── 反欺诈过程步骤（9步，结论随风险等级上色） ───────────────────── */
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

function buildThreads(variant: 'pass' | 'warning' | 'reject'): VerifyThread[] {
  const base = [
    mkThread('t1', '用户填报资料提交申请', 'police', 'pass', '资料完整提交'),
    mkThread('t2', '活体检测', 'police', 'pass', '活体通过 · 人脸一致'),
    mkThread('t3', '设备环境采集', 'device', 'pass', '环境正常'),
    mkThread('t4', '信息格式校验', 'rule', 'pass', '格式校验通过'),
    mkThread('t5', 'OCR 反欺诈识别', 'operator', 'pass', 'OCR 识别一致'),
    mkThread('t6', '多源反欺诈单项策略核验', 'network', 'pass', '单项核验通过'),
    mkThread('t7', '关联网络分析', 'network', 'pass', '关联网络正常'),
    mkThread('t8', '团伙欺诈模型', 'rule', 'pass', '未命中团伙规则'),
    mkThread('t9', '反欺诈评分', 'network', 'pass', '低风险通过'),
  ]
  if (variant === 'pass') return base
  if (variant === 'warning') {
    return base.map((t) =>
      t.id === 't3' || t.id === 't6' || t.id === 't7' || t.id === 't8' || t.id === 't9'
        ? { ...t, conclusion: 'warning' as Conclusion, result: t.result.replace('正常', '存疑').replace('通过', '疑似风险').replace('未命中团伙规则', '疑似团伙关联') }
        : t,
    )
  }
  // reject（确认欺诈）
  return base.map((t) =>
    ['t3', 't6', 't7', 't8', 't9'].includes(t.id)
      ? { ...t, conclusion: 'reject' as Conclusion, result: t.result.replace('正常', '高危').replace('通过', '拒绝').replace('未命中团伙规则', '命中团伙规则') }
      : t,
  )
}

/* ───────────────────── 公共基础信息（三态共用同一申请人） ───────────────────── */
function baseBasic(): BasicField[] {
  return [
    { key: 'name', label: '姓名', value: '张*伟', valid: true },
    { key: 'idNo', label: '身份证号', value: '110***********0314', valid: true },
    { key: 'phone', label: '手机号', value: '138****1234', valid: true },
    { key: 'bankNo', label: '银行卡号', value: '6217 **** **** 567', valid: true },
    { key: 'bankName', label: '开户行', value: '中国工商银行', valid: true },
    { key: 'age', label: '年龄', value: '36', valid: true },
    { key: 'edu', label: '学历', value: '本科', valid: true },
    { key: 'employer', label: '工作单位', value: '北京某某科技有限公司', valid: true },
    { key: 'income', label: '月收入', value: '25,000 元', valid: true },
    { key: 'address', label: '居住地址', value: '北京市朝阳区建国路 88 号', valid: true },
    { key: 'marriage', label: '婚姻', value: '已婚', valid: true },
  ]
}
function baseEnv(): EnvCapture[] {
  return [
    { key: 'deviceId', label: '设备指纹', value: 'DV-9F2A-77C1' },
    { key: 'ip', label: 'IP 地址', value: '223.104.36.18' },
    { key: 'gps', label: 'GPS 定位', value: '北京市朝阳区 (39.908, 116.447)' },
    { key: 'channel', label: '进件渠道', value: 'App (Android 13)' },
    { key: 'appVer', label: 'APP 版本', value: '5.2.1' },
    { key: 'timeCalib', label: '设备时间校准', value: '正常' },
  ]
}
function baseImages(): ImageWithOcr[] {
  return [
    {
      key: 'idcard_front',
      label: '身份证人像面',
      kind: 'image',
      url: '/sample/idcard_front.jpg',
      ocr: '姓名: 张*伟  性别: 男  民族: 汉  出生: 1990-03-05  住址: 北京市朝阳区建国路 88 号  公民身份号码: 110***********0314',
    },
    {
      key: 'idcard_back',
      label: '身份证国徽面',
      kind: 'image',
      url: '/sample/idcard_back.jpg',
      ocr: '签发机关: 北京市公安局朝阳分局  有效期限: 2015.01 - 2035.01',
    },
    {
      key: 'live',
      label: '活体人脸',
      kind: 'video',
      url: '/sample/live.jpg',
      ocr: '活体检测: 通过  动作: 眨眼/张嘴  质量分: 92  人脸相似度: 98.6%',
    },
    {
      key: 'bankcard',
      label: '银行卡',
      kind: 'image',
      url: '/sample/bankcard.jpg',
      ocr: '卡号: 6217 **** **** 567  发卡行: 中国工商银行  卡类型: 储蓄卡',
    },
  ]
}

/* ───────────────────── 6 张反欺诈单项核验卡（三态按风险替换 conclusion） ───────────────────── */
// 顺序：设备指纹 / 手机号风险 / IP地址风险 / 关联欺诈名单 / 多头借贷与逾期 / 关联网络分析
function baseSingle(): SingleResult[] {
  return [
    {
      source: 'device',
      name: '设备指纹核验',
      icon: 'device',
      callStatus: 'success',
      costMs: 180,
      conclusion: 'pass',
      reason: '设备指纹正常，未命中模拟器/群控库，ROOT/越狱检测为否。',
      items: [
        { label: '设备指纹', value: 'DV-9F2A-77C1', status: 'ok' },
        { label: '模拟器检测', value: '否', status: 'ok' },
        { label: 'Root/越狱', value: '否', status: 'ok' },
        { label: '群控库命中', value: '未命中', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320089',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
    {
      source: 'operator',
      name: '手机号风险核验',
      icon: 'operator',
      callStatus: 'success',
      costMs: 320,
      conclusion: 'pass',
      reason: '手机号实名信息与申请人一致，在网时长充足，非虚拟运营商号。',
      items: [
        { label: '手机号', value: '138****1234', status: 'ok' },
        { label: '实名姓名', value: '张*伟', status: 'ok' },
        { label: '在网时长', value: '62 个月', status: 'ok' },
        { label: '虚拟运营商', value: '否', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320056',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
    {
      source: 'network',
      name: 'IP 地址风险核验',
      icon: 'network',
      callStatus: 'success',
      costMs: 150,
      conclusion: 'pass',
      reason: 'IP 为家庭宽带，归属地与 GPS 一致，未命中代理/VPN/数据中心库。',
      items: [
        { label: 'IP 类型', value: '家庭宽带', status: 'ok' },
        { label: '代理/VPN', value: '未命中', status: 'ok' },
        { label: '数据中心', value: '否', status: 'ok' },
        { label: '归属地一致性', value: '一致', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320111',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
    {
      source: 'police',
      name: '关联欺诈名单核验',
      icon: 'police',
      callStatus: 'success',
      costMs: 260,
      conclusion: 'pass',
      reason: '内部黑名单、行业共享黑名单、法院失信名单均未命中。',
      items: [
        { label: '内部黑名单', value: '未命中', status: 'ok' },
        { label: '行业共享黑名单', value: '未命中', status: 'ok' },
        { label: '法院失信', value: '未命中', status: 'ok' },
        { label: '信贷逾期名单', value: '未命中', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320133',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
    {
      source: 'unionpay',
      name: '多头借贷与逾期核验',
      icon: 'unionpay',
      callStatus: 'success',
      costMs: 410,
      conclusion: 'pass',
      reason: '近 30 天申贷平台数 1 家，当前无逾期，负债收入比正常。',
      items: [
        { label: '近30天申贷平台', value: '1 家', status: 'ok' },
        { label: '当前逾期', value: '无', status: 'ok' },
        { label: '涉及机构数', value: '1 家', status: 'ok' },
        { label: '负债收入比', value: '28%', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320145',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
    {
      source: 'network',
      name: '关联网络分析',
      icon: 'network',
      callStatus: 'success',
      costMs: 380,
      conclusion: 'pass',
      reason: '关联人、关联设备、关联手机号均正常，未发现团伙信号。',
      items: [
        { label: '关联人', value: '0 个异常', status: 'ok' },
        { label: '关联设备', value: '无异常', status: 'ok' },
        { label: '关联手机号', value: '无异常', status: 'ok' },
        { label: '团伙识别', value: '未命中', status: 'ok' },
      ],
      verifyNo: 'FR2026072114320166',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: 'pass',
    },
  ]
}

/* ───────────────────── 5 个原子维度（设备真实性/身份关联性/网络行为/社交图谱/团伙风险） ───────────────────── */
function baseAtomic(): AtomicResult[] {
  return [
    { key: 'a1', label: '设备真实性', value: '真实', status: 'ok', tooltip: '设备指纹正常，未命中模拟器/群控库，ROOT 检测为否。', conflictIds: [] },
    { key: 'a2', label: '身份关联性', value: '一致', status: 'ok', tooltip: '实名、人脸、银行卡四要素一致，身份关联无异常。', conflictIds: [] },
    { key: 'a3', label: '网络行为', value: '正常', status: 'ok', tooltip: 'IP 家庭宽带、归属地一致、无代理/VPN，网络行为正常。', conflictIds: [] },
    { key: 'a4', label: '社交图谱', value: '正常', status: 'ok', tooltip: '关联人/手机号/设备无异常，社交图谱正常。', conflictIds: [] },
    { key: 'a5', label: '团伙风险', value: '无', status: 'ok', tooltip: '未命中行业团伙模型，无共谋申贷信号。', conflictIds: [] },
  ]
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T
}

/* ───────────────────── 三态报告构建 ───────────────────── */
// 依据样例 id 返回对应状态：含 FRAUD → 确认欺诈(红)；含 SUSPECT/WARNING → 可疑(黄)；缺省 → 无风险(绿)
export function buildFraudScheme1Report(id?: string): InfoVerifyReport {
  const status: 'pass' | 'reject' | 'warning' = id
    ? id.includes('FRAUD')
      ? 'reject'
      : id.includes('SUSPECT') || id.includes('WARNING')
        ? 'warning'
        : 'pass'
    : 'pass'

  // ====== 确认欺诈（reject）基础数据 ======
  const r: InfoVerifyReport = {
    appId: 'J20260718F0001',
    name: '张*伟',
    idNo: '110***********0314',
    decision: 'reject',
    decisionText: '确认欺诈',
    summary:
      '申请人反欺诈单项核验中，设备指纹命中虚拟机+代理IP+虚拟运营商组合规则，关联网络发现 3 个已确认欺诈关联人，团伙标记活跃。综合判定：确认欺诈。',
    basic: baseBasic(),
    env: baseEnv(),
    images: baseImages(),
    struct: [],
    single: baseSingle(),
    threads: buildThreads('reject'),
    cross: {
      finalConclusion: 'reject',
      finalReason:
        '设备虚拟机 + 代理IP + 虚拟运营商三项组合触发核心欺诈规则，关联网络发现 3 个已确认欺诈关联人、团伙标记活跃，综合判定确认欺诈。',
      overallRisk: 'high',
      riskScore: 870,
      scoreCap: 1000,
      riskTags: [
        { label: '团伙欺诈', kind: 'red' as RiskTag['kind'] },
        { label: '虚拟设备', kind: 'red' as RiskTag['kind'] },
        { label: '黑名单关联', kind: 'red' as RiskTag['kind'] },
        { label: '多头异常', kind: 'amber' as RiskTag['kind'] },
      ],
      conflicts: [
        {
          id: 'c1',
          level: 'high',
          desc: '设备指纹命中虚拟机特征，且同一设备关联 3 个以上不同身份申请，存在设备农场/群控风险。',
          items: [
            { side: '设备指纹核验', value: '虚拟机特征命中', source: 'device', tone: 'fail' },
            { side: '关联网络分析', value: '关联 3 个身份', source: 'network', tone: 'fail' },
          ],
          resolution: '设备异常 + 多身份关联 → 直接触发核心欺诈规则，标记为确认欺诈。',
          isCoreFactor: true,
          relatedAtomicKeys: ['a1', 'a4'],
        },
        {
          id: 'c2',
          level: 'high',
          desc: 'IP 命中数据中心/代理，且手机号归属地与 GPS 不一致，疑似伪造网络环境。',
          items: [
            { side: 'IP 地址风险核验', value: '数据中心 IP', source: 'network', tone: 'fail' },
            { side: '手机号风险核验', value: '归属地不一致', source: 'operator', tone: 'warn' },
          ],
          resolution: '网络环境伪造信号叠加，作为核心欺诈因子留存。',
          isCoreFactor: true,
          relatedAtomicKeys: ['a3'],
        },
        {
          id: 'c3',
          level: 'medium',
          desc: '关联网络分析发现 3 个关联人已被标记为确认欺诈，存在团伙协同申贷特征。',
          items: [
            { side: '关联网络分析', value: '3 个关联人确认欺诈', source: 'network', tone: 'fail' },
            { side: '关联欺诈名单', value: '行业共享黑名单命中 1', source: 'police', tone: 'warn' },
          ],
          resolution: '团伙协同信号，团伙模型标记活跃，建议强制加入黑名单。',
          isCoreFactor: false,
          relatedAtomicKeys: ['a4', 'a5'],
        },
        {
          id: 'c4',
          level: 'medium',
          desc: '近 30 天申贷平台 9 家、当前逾期 1 笔，多头借贷与逾期风险叠加。',
          items: [
            { side: '多头借贷与逾期核验', value: '申贷平台 9 家', source: 'unionpay', tone: 'warn' },
            { side: '多头借贷与逾期核验', value: '当前逾期 1 笔', source: 'unionpay', tone: 'warn' },
          ],
          resolution: '多头异常叠加，作为辅助风险标签保留。',
          isCoreFactor: false,
          relatedAtomicKeys: ['a5'],
        },
      ],
      atomic: [
        { key: 'a1', label: '设备真实性', value: '高危', status: 'fail', tooltip: '设备指纹命中虚拟机特征且关联多个身份，存在群控/设备农场嫌疑，直接触发核心欺诈规则。', conflictIds: ['c1'] },
        { key: 'a2', label: '身份关联性', value: '一致', status: 'ok', tooltip: '实名、人脸、银行卡四要素一致，身份关联无异常。', conflictIds: [] },
        { key: 'a3', label: '网络行为', value: '高危', status: 'fail', tooltip: 'IP 命中数据中心/代理，手机号归属地与 GPS 不一致，网络环境疑似伪造。', conflictIds: ['c2'] },
        { key: 'a4', label: '社交图谱', value: '高风险', status: 'fail', tooltip: '关联网络发现 3 个已确认欺诈关联人，存在团伙协同申贷特征。', conflictIds: ['c3'] },
        { key: 'a5', label: '团伙风险', value: '活跃', status: 'fail', tooltip: '团伙模型标记活跃，多关联人确认欺诈，团伙协同风险高。', conflictIds: ['c3', 'c4'] },
      ],
      ruleBasis: '判定规则：欺诈评分>700 且命中团伙欺诈核心规则 → 确认欺诈；虚拟机+代理IP+虚拟运营商组合规则直接触发。',
      auditTime: '2026-07-21 15:00:22',
      ruleVersion: 'V3.0 反欺诈策略集',
      reportId: 'FR20260721001',
      scoreComponents: [
        { name: '虚拟设备', situation: '设备指纹命中虚拟机特征，关联 3 个身份', score: 420, weight: 42, level: 'high', traceTo: 'c1', core: true },
        { name: '伪造网络环境', situation: '数据中心IP + 归属地不一致', score: 260, weight: 26, level: 'high', traceTo: 'c2', core: true },
        { name: '团伙协同', situation: '关联 3 个确认欺诈关联人', score: 150, weight: 15, level: 'high', traceTo: 'c3' },
        { name: '多头异常', situation: '申贷平台 9 家、当前逾期 1 笔', score: 40, weight: 4, level: 'medium', traceTo: 'c4' },
      ],
    },
    itemActions: [
      {
        id: 'ia1',
        target: '设备指纹核验',
        targetKind: 'reject',
        action: '确认欺诈结论',
        actionKind: 'reject',
        operator: '李审核',
        time: '2026-07-18 14:35',
        before: '系统判定：确认欺诈',
        after: '人工确认：确认欺诈',
        reason: '设备关联多身份 + 虚拟机特征，证据充分，维持确认欺诈结论。',
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
        reason: '综合设备风险与团伙关联，维持确认欺诈，提交至黑名单处置。',
      },
    ],
    opLogs: [
      {
        id: 'log1',
        target: '设备指纹核验',
        actionType: '重新核验',
        operator: '李审核',
        time: '2026-07-18 14:30',
        remark: '首次核验命中虚拟机特征，二次调用同盾设备指纹接口，核验流水号：FR2026072114320200',
      },
      {
        id: 'log2',
        target: '关联网络分析',
        actionType: '关联电核',
        operator: '李审核',
        time: '2026-07-18 14:38',
        remark: '关联电核台账编号 EC20260718038，关联 3 个确认欺诈关联人。',
      },
    ] as OpLog[],
  }

  if (status === 'reject') return r

  if (status === 'pass') {
    // 无风险（绿）
    r.decision = 'pass'
    r.decisionText = '无风险'
    r.threads = buildThreads('pass')
    r.summary = '申请人反欺诈单项核验（设备/手机号/IP/黑名单/多头/关联网络）全部通过，关联网络干净，无团伙信号。综合判定：无风险。'
    r.cross.finalConclusion = 'pass'
    r.cross.finalReason = '全部单项核验通过，设备无异常、关联网络干净，综合判定无风险。'
    r.cross.overallRisk = 'low'
    r.cross.riskScore = 95
    r.cross.ruleBasis = '判定规则：欺诈评分 <400，未命中任何核心欺诈规则，自动判无风险。'
    r.cross.riskTags = [
      { label: '设备真实', kind: 'blue' as RiskTag['kind'] },
      { label: '身份一致', kind: 'blue' as RiskTag['kind'] },
      { label: '关联无风险', kind: 'blue' as RiskTag['kind'] },
    ]
    r.cross.conflicts = []
    r.cross.atomic = baseAtomic()
    r.cross.scoreComponents = [
      { name: '无风险证据', situation: '全部单项核验通过，未累计到风险证据', score: 0, weight: 0, level: 'low' },
    ]
    r.single = r.single.map((s) => ({ ...s, conclusion: 'pass' as Conclusion, rulePromptType: 'pass' as const }))
    return r
  }

  // 可疑（黄）：在确认欺诈基础上，弱化部分因子为"可疑"，保留 2 条中风险冲突
  const w = clone(r)
  w.decision = 'warning'
  w.decisionText = '可疑'
  w.threads = buildThreads('warning')
  w.summary = '申请人设备指纹命中模拟器、手机号在网<3个月、IP归属地频繁跳跃，关联网络出现 1 个轻度关联人命中多头黑名单，触发 2 条中风险规则。综合判定：可疑。'
  w.cross.finalConclusion = 'warning'
  w.cross.finalReason = '设备风险存疑 + 新办手机号 + 关联网络轻度异常，需人工复核后判定。'
  w.cross.overallRisk = 'medium'
  w.cross.riskScore = 520
  w.cross.ruleBasis = '判定规则：欺诈评分 400-700，命中 2 条中风险规则（设备存疑 + 关联轻度异常），转人工复核。'
  w.cross.riskTags = [
    { label: '设备存疑', kind: 'amber' as RiskTag['kind'] },
    { label: '新办手机号', kind: 'amber' as RiskTag['kind'] },
    { label: '关联轻度异常', kind: 'amber' as RiskTag['kind'] },
    { label: '身份一致', kind: 'blue' as RiskTag['kind'] },
  ]
  w.cross.conflicts = [
    {
      id: 'c1',
      level: 'medium',
      desc: '设备指纹命中模拟器特征，疑似云手机/群控环境，需人工确认是否为本人真实设备。',
      items: [
        { side: '设备指纹核验', value: '疑似模拟器', source: 'device', tone: 'warn' },
        { side: '关联网络分析', value: '关联 1 个异常', source: 'network', tone: 'warn' },
      ],
      resolution: '疑似模拟器但未确认欺诈，标记可疑，建议人工电核设备真实性。',
      isCoreFactor: false,
      relatedAtomicKeys: ['a1', 'a4'],
    },
    {
      id: 'c4',
      level: 'medium',
      desc: '手机号在网时长不足 3 个月，且关联网络出现 1 个轻度关联人命中多头黑名单。',
      items: [
        { side: '手机号风险核验', value: '在网 <3 个月', source: 'operator', tone: 'warn' },
        { side: '关联网络分析', value: '1 个关联人命中多头', source: 'network', tone: 'warn' },
      ],
      resolution: '新办号 + 关联轻度异常，建议人工核实后决定是否豁免。',
      isCoreFactor: false,
      relatedAtomicKeys: ['a4', 'a5'],
    },
  ]
  w.cross.atomic = [
    { key: 'a1', label: '设备真实性', value: '存疑', status: 'warn', tooltip: '设备指纹疑似模拟器特征，需人工确认真实性。', conflictIds: ['c1'] },
    { key: 'a2', label: '身份关联性', value: '一致', status: 'ok', tooltip: '实名、人脸、银行卡四要素一致，身份关联无异常。', conflictIds: [] },
    { key: 'a3', label: '网络行为', value: '正常', status: 'ok', tooltip: 'IP 家庭宽带、归属地一致、无代理/VPN，网络行为正常。', conflictIds: [] },
    { key: 'a4', label: '社交图谱', value: '轻度异常', status: 'warn', tooltip: '关联网络出现 1 个轻度关联人命中多头黑名单。', conflictIds: ['c4'] },
    { key: 'a5', label: '团伙风险', value: '无', status: 'ok', tooltip: '未命中行业团伙模型，无共谋申贷信号。', conflictIds: [] },
  ]
  w.cross.scoreComponents = [
    { name: '疑似模拟器', situation: '设备指纹疑似模拟器特征', score: 240, weight: 24, level: 'medium', traceTo: 'c1' },
    { name: '新办手机号', situation: '在网 <3 个月', score: 150, weight: 15, level: 'medium', traceTo: 'c4' },
    { name: '关联轻度异常', situation: '关联人命中多头黑名单', score: 130, weight: 13, level: 'medium', traceTo: 'c4' },
  ]
  w.single = w.single.map((s) => {
    if (s.source === 'device') return { ...s, conclusion: 'warning' as Conclusion, reason: '设备指纹疑似模拟器特征，需人工确认真实性。', rulePromptType: 'warning' as const }
    if (s.source === 'operator') return { ...s, conclusion: 'warning' as Conclusion, reason: '手机号在网时长不足 3 个月，疑似新办卡。', rulePromptType: 'warning' as const }
    if (s.source === 'network' && s.name === '关联网络分析') return { ...s, conclusion: 'warning' as Conclusion, reason: '关联网络出现 1 个轻度关联人命中多头黑名单。', rulePromptType: 'warning' as const }
    return s
  })
  return w
}
