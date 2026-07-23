// 欺诈识别报告（方案3 · 修正版）· 数据模型与示例数据
// 框架与信息核验(infoVerifyReport.ts)完全对齐：复用同一套类型与结构；
// 对标同盾反欺诈能力：双分数（自研欺诈汇总分 0-100 + 智察分同盾原生）、
// 4 张多源欺诈单项卡片（六核心收敛为四宫格）、5 大欺诈维度（设备/网络/行为/黑名单/团伙）、
// 8 步欺诈运算链路，移除证件照与一切信息核验重复内容，仅保留姓名/身份证/手机号三项只读对账字段。
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

// 方案3 扩展：在信息核验报告基础上追加「智察分（同盾原生）」双分数字段
export interface FraudS3Report extends InfoVerifyReport {
  zhicha: number // 智察分（同盾原生），分值越高欺诈风险越高
  zhichaBand: RiskLevel
}

/* ───────────────────── 反欺诈运算链路（8 步，结论随风险等级上色） ───────────────────── */
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

// 8 步（方案3 修正版）：设备环境采集 → 黑名单库检索 → 设备指纹解析 → 申请行为采集分析 → 关联图谱计算 → 反欺诈规则引擎碰撞 → 智察分模型运算 → 欺诈报告生成
function buildThreads(variant: 'pass' | 'warning' | 'reject'): VerifyThread[] {
  const base = [
    mkThread('t1', '设备环境采集', 'device', 'pass', '采集设备指纹与网络环境'),
    mkThread('t2', '黑名单库检索', 'police', 'pass', '未命中各类欺诈黑名单'),
    mkThread('t3', '设备指纹解析', 'device', 'pass', '设备指纹正常'),
    mkThread('t4', '申请行为采集分析', 'operator', 'pass', '申请行为正常'),
    mkThread('t5', '关联图谱计算', 'network', 'pass', '关联图谱干净'),
    mkThread('t6', '反欺诈规则引擎碰撞', 'rule', 'pass', '规则引擎无命中'),
    mkThread('t7', '智察分模型运算', 'network', 'pass', '智察分低风险'),
    mkThread('t8', '欺诈报告生成', 'rule', 'pass', '低风险通过'),
  ]
  if (variant === 'pass') return base
  if (variant === 'warning') {
    return base.map((t) =>
      ['t1', 't2', 't4', 't5', 't7'].includes(t.id)
        ? {
            ...t,
            conclusion: 'warning' as Conclusion,
            result: t.result
              .replace('采集设备指纹与网络环境', '设备疑似模拟器、网络归属跳跃')
              .replace('未命中各类欺诈黑名单', '命中行业共享灰名单')
              .replace('申请行为正常', '表单秒填、点击频率异常')
              .replace('关联图谱干净', '关联 1 个轻度异常人')
              .replace('智察分低风险', '智察分中风险'),
          }
        : t,
    )
  }
  // reject（确认欺诈）
  return base.map((t) =>
    ['t1', 't2', 't3', 't4', 't5', 't6', 't7', 't8'].includes(t.id)
      ? {
          ...t,
          conclusion: 'reject' as Conclusion,
          result: t.result
            .replace('采集设备指纹与网络环境', '设备 Root+多开模拟器、机房代理 IP 命中')
            .replace('未命中各类欺诈黑名单', '命中互联网欺诈黑名单')
            .replace('设备指纹正常', '虚拟机+群控命中')
            .replace('申请行为正常', '脚本秒填、短时批量进件')
            .replace('关联图谱干净', '关联 3 个确认欺诈申请人')
            .replace('规则引擎无命中', '命中 6 条核心反欺诈规则')
            .replace('智察分低风险', '智察分极高风险')
            .replace('低风险通过', '确认欺诈拦截'),
        }
      : t,
  )
}

/* ───────────────────── 申请人基础字段（仅 3 项只读对账字段，不展示任何核验结果） ───────────────────── */
function baseBasic(): BasicField[] {
  return [
    { key: 'name', label: '姓名', value: '张*伟', valid: true },
    { key: 'idNo', label: '身份证号', value: '110***********0314', valid: true },
    { key: 'phone', label: '手机号', value: '138****1234', valid: true },
  ]
}

// 欺诈环境采集信息（方案3 修正版：仅保留反欺诈相关的原始采集，剔除人证/银行卡/人脸等核验字段）
function baseEnv(variant: 'pass' | 'warning' | 'reject'): EnvCapture[] {
  if (variant === 'pass') {
    return [
      { key: 'deviceId', label: '设备指纹 ID', value: 'DV-9F2A-77C1' },
      { key: 'os', label: '手机系统', value: 'Android 13 (SDK 33)' },
      { key: 'root', label: 'ROOT/越狱状态', value: '未 ROOT / 未越狱' },
      { key: 'ip', label: 'IP 地址', value: '北京市朝阳区（归属地）' },
      { key: 'ipType', label: 'IP 类型', value: '家庭宽带（公网）' },
      { key: 'gps', label: 'GPS 经纬度 & 定位属地', value: '北京市朝阳区 (39.908, 116.447)' },
      { key: 'appVer', label: 'APP 版本', value: '5.2.1' },
      { key: 'applyTime', label: '申请时间段', value: '14:22（工作时段）' },
      { key: 'track', label: '页面操作全量埋点原始数据', value: '表单填写 4 分 12 秒、点击频率正常、验证码获取 1 次' },
    ]
  }
  if (variant === 'warning') {
    return [
      { key: 'deviceId', label: '设备指纹 ID', value: 'DV-9F2A-77C1' },
      { key: 'os', label: '手机系统', value: 'Android 13 (SDK 33)' },
      { key: 'root', label: 'ROOT/越狱状态', value: '未 ROOT（疑似云手机）' },
      { key: 'ip', label: 'IP 地址', value: '归属地近 7 天频繁跳跃' },
      { key: 'ipType', label: 'IP 类型', value: '公共 Wi-Fi（公网）' },
      { key: 'gps', label: 'GPS 经纬度 & 定位属地', value: '北京市朝阳区 (39.908, 116.447)' },
      { key: 'appVer', label: 'APP 版本', value: '5.2.1' },
      { key: 'applyTime', label: '申请时间段', value: '21:40（非工作时段）' },
      { key: 'track', label: '页面操作全量埋点原始数据', value: '表单填写 38 秒、点击频率偏高、验证码获取 3 次' },
    ]
  }
  return [
    { key: 'deviceId', label: '设备指纹 ID', value: 'DV-7B3E-22A9' },
    { key: 'os', label: '手机系统', value: 'Android 9 (模拟器特征)' },
    { key: 'root', label: 'ROOT/越狱状态', value: '已 ROOT（存在篡改风险）' },
    { key: 'ip', label: 'IP 地址', value: '广东省深圳市（归属地）' },
    { key: 'ipType', label: 'IP 类型', value: '机房 / 代理 IP' },
    { key: 'gps', label: 'GPS 经纬度 & 定位属地', value: '广东省深圳市 (22.54, 114.06)（与身份证户籍地一致）' },
    { key: 'appVer', label: 'APP 版本', value: '5.2.1（非官方渠道包）' },
    { key: 'applyTime', label: '申请时间段', value: '03:14（凌晨非工作时段）' },
    { key: 'track', label: '页面操作全量埋点原始数据', value: '表单填写 1.2 秒、点击频率 18 次/秒、验证码 3 秒内重复获取 5 次' },
  ]
}

/* ───────────────────── 4 张多源欺诈单项核验卡（六核心收敛为四宫格） ───────────────────── */
// 顺序：黑名单风险 / 设备指纹深度分析 / 申请行为轨迹分析 / 网络&地理位置+团伙关联图谱
function baseSingle(variant: 'pass' | 'warning' | 'reject'): SingleResult[] {
  const c = (v: Conclusion) => v
  return [
    {
      source: 'blacklist',
      name: '黑名单风险核验',
      icon: 'police',
      callStatus: 'success',
      costMs: 210,
      conclusion: c(variant === 'reject' ? 'reject' : variant === 'warning' ? 'warning' : 'pass'),
      reason:
        variant === 'reject'
          ? '申请人命中互联网欺诈黑名单与涉案名单，命中行业共享灰名单。'
          : variant === 'warning'
            ? '未命中欺诈黑名单，但命中行业共享灰名单，需人工核实。'
            : '欺诈黑名单、失信、逃废债、涉案、行业共享灰名单均未命中。',
      items: [
        { label: '欺诈黑名单', value: variant === 'pass' ? '未命中' : '命中', status: variant === 'pass' ? 'ok' : 'fail' },
        { label: '涉案名单', value: variant === 'pass' ? '未命中' : '命中', status: variant === 'pass' ? 'ok' : 'fail' },
        { label: '逃废债名单', value: '未命中', status: 'ok' },
        { label: '行业共享灰名单', value: variant === 'reject' ? '命中' : variant === 'warning' ? '命中' : '未命中', status: variant === 'pass' ? 'ok' : 'warn' },
      ],
      verifyNo: 'FR2026072114320089',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: variant === 'reject' ? 'reject' : variant === 'warning' ? 'warning' : 'pass',
    },
    {
      source: 'device',
      name: '设备指纹深度分析',
      icon: 'device',
      callStatus: 'success',
      costMs: 180,
      conclusion: c(variant === 'reject' ? 'reject' : variant === 'warning' ? 'warning' : 'pass'),
      reason:
        variant === 'reject'
          ? '设备已 ROOT，命中虚拟机+群控库，应用多开，设备 7 日内关联 5 个不同身份进件。'
          : variant === 'warning'
            ? '设备指纹疑似模拟器/云手机特征，需人工确认真实性。'
            : '设备指纹正常，未命中模拟器/ROOT/多开/群控库，无设备复用。',
      items: [
        { label: '模拟器检测', value: variant === 'pass' ? '否' : '是', status: variant === 'pass' ? 'ok' : 'fail' },
        { label: 'ROOT/越狱', value: variant === 'pass' ? '否' : '是', status: variant === 'pass' ? 'ok' : 'fail' },
        { label: '应用多开', value: variant === 'pass' ? '否' : '是', status: variant === 'pass' ? 'ok' : 'fail' },
        { label: '设备群控关联账号', value: variant === 'reject' ? '5 个' : variant === 'warning' ? '1 个' : '0 个', status: variant === 'pass' ? 'ok' : 'fail' },
      ],
      verifyNo: 'FR2026072114320111',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: variant === 'reject' ? 'reject' : variant === 'warning' ? 'warning' : 'pass',
    },
    {
      source: 'behavior',
      name: '申请行为轨迹分析',
      icon: 'operator',
      callStatus: 'success',
      costMs: 260,
      conclusion: c(variant === 'reject' ? 'reject' : variant === 'warning' ? 'warning' : 'pass'),
      reason:
        variant === 'reject'
          ? '表单秒填、短时间内重复申请、脚本自动化操作特征明显。'
          : variant === 'warning'
            ? '表单填写过快、点击频率偏高，存在异常操作迹象。'
            : '短时申请频次正常，无批量进件、无脚本薅贷行为特征。',
      items: [
        { label: '表单填写时长', value: variant === 'reject' ? '1.2 秒' : variant === 'warning' ? '38 秒' : '4 分 12 秒', status: variant === 'pass' ? 'ok' : 'fail' },
        { label: '点击频率', value: variant === 'reject' ? '18 次/秒' : variant === 'warning' ? '偏高' : '正常', status: variant === 'pass' ? 'ok' : 'warn' },
        { label: '验证码获取频次', value: variant === 'reject' ? '3 秒 5 次' : variant === 'warning' ? '3 次' : '1 次', status: variant === 'pass' ? 'ok' : 'warn' },
        { label: '脚本/自动化', value: variant === 'reject' ? '检出' : '未检出', status: variant === 'reject' ? 'fail' : 'ok' },
      ],
      verifyNo: 'FR2026072114320166',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: variant === 'reject' ? 'reject' : variant === 'warning' ? 'warning' : 'pass',
    },
    {
      source: 'network',
      name: '网络&地理位置 + 团伙关联图谱',
      icon: 'network',
      callStatus: 'success',
      costMs: 380,
      conclusion: c(variant === 'reject' ? 'reject' : variant === 'warning' ? 'warning' : 'pass'),
      reason:
        variant === 'reject'
          ? '机房/代理 IP，GPS 定位与身份证户籍地一致但申请地与户籍地严重不符，关联 3 个确认欺诈申请人。'
          : variant === 'warning'
            ? 'IP 归属地频繁跳跃，团伙图谱出现 1 个轻度关联人命中多头。'
            : 'IP 为家庭宽带，归属地与 GPS 一致，未命中代理/机房，关联图谱干净。',
      items: [
        { label: '代理/机房 IP', value: variant === 'pass' ? '未命中' : '命中', status: variant === 'pass' ? 'ok' : 'fail' },
        { label: 'GPS 定位篡改', value: variant === 'pass' ? '否' : '疑似', status: variant === 'pass' ? 'ok' : 'warn' },
        { label: '申请地与户籍地不符', value: variant === 'reject' ? '严重不符' : '否', status: variant === 'reject' ? 'fail' : 'ok' },
        { label: '关联欺诈申请人', value: variant === 'reject' ? '3 个' : variant === 'warning' ? '1 个' : '0 个', status: variant === 'pass' ? 'ok' : 'fail' },
      ],
      verifyNo: 'FR2026072114320145',
      verifyTime: '2026-07-21 14:32:18',
      channel: '同盾反欺诈 API V3.0',
      rulePromptType: variant === 'reject' ? 'reject' : variant === 'warning' ? 'warning' : 'pass',
    },
  ]
}

/* ───────────────────── 5 大欺诈维度（方案3 修正版） ───────────────────── */
// 设备环境可信度 / 网络地理位置安全性 / 申请行为合规性 / 黑名单风险等级 / 团伙关联传染风险
function baseAtomic(variant: 'pass' | 'warning' | 'reject'): AtomicResult[] {
  if (variant === 'pass') {
    return [
      { key: 'a1', label: '设备环境可信度', value: '可信', status: 'ok', tooltip: '设备指纹正常，未命中模拟器/群控库，设备环境可信。', conflictIds: [] },
      { key: 'a2', label: '网络地理位置安全性', value: '安全', status: 'ok', tooltip: 'IP 家庭宽带、归属地一致、无代理/机房，网络环境安全。', conflictIds: [] },
      { key: 'a3', label: '申请行为合规性', value: '合规', status: 'ok', tooltip: '申请频次、操作时长正常，无批量/脚本薅贷特征。', conflictIds: [] },
      { key: 'a4', label: '黑名单风险等级', value: '低风险', status: 'ok', tooltip: '各类欺诈黑名单、灰名单均未命中。', conflictIds: [] },
      { key: 'a5', label: '团伙关联传染风险', value: '无', status: 'ok', tooltip: '未命中团伙图谱，无共债团伙协同信号。', conflictIds: [] },
    ]
  }
  if (variant === 'warning') {
    return [
      { key: 'a1', label: '设备环境可信度', value: '存疑', status: 'warn', tooltip: '设备指纹疑似模拟器/云手机特征，需人工确认真实性。', conflictIds: ['c1'] },
      { key: 'a2', label: '网络地理位置安全性', value: '存疑', status: 'warn', tooltip: 'IP 归属地近 7 天频繁跳跃，网络环境存疑。', conflictIds: ['c3'] },
      { key: 'a3', label: '申请行为合规性', value: '存疑', status: 'warn', tooltip: '表单填写过快、点击频率偏高，存在异常操作迹象。', conflictIds: ['c2'] },
      { key: 'a4', label: '黑名单风险等级', value: '中风险', status: 'warn', tooltip: '命中行业共享灰名单，需人工核实。', conflictIds: ['c1'] },
      { key: 'a5', label: '团伙关联传染风险', value: '轻度', status: 'warn', tooltip: '团伙图谱出现 1 个轻度关联人命中多头。', conflictIds: ['c3'] },
    ]
  }
  return [
    { key: 'a1', label: '设备环境可信度', value: '不可信', status: 'fail', tooltip: '设备已 ROOT、命中虚拟机+群控库，设备环境极度不可信。', conflictIds: ['c1'] },
    { key: 'a2', label: '网络地理位置安全性', value: '高危', status: 'fail', tooltip: '机房/代理 IP，申请地与户籍地严重不符，网络环境伪造。', conflictIds: ['c2'] },
    { key: 'a3', label: '申请行为合规性', value: '异常', status: 'fail', tooltip: '表单秒填、脚本自动化、短时批量进件，行为严重异常。', conflictIds: ['c3'] },
    { key: 'a4', label: '黑名单风险等级', value: '极高', status: 'fail', tooltip: '命中互联网欺诈黑名单与涉案名单，黑名单风险极高。', conflictIds: ['c1'] },
    { key: 'a5', label: '团伙关联传染风险', value: '活跃', status: 'fail', tooltip: '团伙图谱关联 3 个确认欺诈申请人，团伙协同风险高。', conflictIds: ['c3'] },
  ]
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T
}

/* ───────────────────── 三态报告构建（智察分 + 自研欺诈汇总分 0-100） ───────────────────── */
export function buildFraudScheme3Report(id?: string): FraudS3Report {
  const status: 'pass' | 'reject' | 'warning' = id
    ? id.includes('FRAUD')
      ? 'reject'
      : id.includes('SUSPECT') || id.includes('WARNING')
        ? 'warning'
        : 'pass'
    : 'pass'

  // ====== 确认欺诈（reject）基础数据 ======
  const r: FraudS3Report = {
    appId: 'J20260718F0001',
    name: '张*伟',
    idNo: '110***********0314',
    zhicha: 91,
    zhichaBand: 'high',
    decision: 'reject',
    decisionText: '确认欺诈',
    summary:
      '申请人命中欺诈黑名单，设备指纹命中 Root+多开模拟器+群控库，IP 为机房代理，团伙图谱关联 3 个已确认欺诈申请人。综合判定：确认欺诈。',
    basic: baseBasic(),
    env: baseEnv('reject'),
    images: [],
    struct: [],
    single: baseSingle('reject'),
    threads: buildThreads('reject'),
    cross: {
      finalConclusion: 'reject',
      finalReason:
        '黑名单命中 + 设备群控 + 机房代理 IP + 团伙图谱关联 3 个确认欺诈申请人，6 条核心反欺诈规则叠加触发，综合判定确认欺诈。',
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
          desc: '欺诈黑名单命中，同时设备指纹命中 Root+多开模拟器+群控库，属高危欺诈组合。',
          items: [
            { side: '黑名单风险核验', value: '欺诈黑名单命中', source: 'blacklist', tone: 'fail' },
            { side: '设备指纹深度分析', value: 'Root+多开模拟器+群控', source: 'device', tone: 'fail' },
          ],
          resolution: '黑名单 + 设备群控组合直接触发核心欺诈规则，标记为确认欺诈。',
          isCoreFactor: true,
          relatedAtomicKeys: ['a1', 'a4'],
        },
        {
          id: 'c2',
          level: 'high',
          desc: 'IP 命中机房/代理，且申请地与身份证户籍地严重不符，疑似伪造网络环境。',
          items: [
            { side: '网络&地理位置', value: '机房/代理 IP', source: 'network', tone: 'fail' },
            { side: '欺诈环境采集', value: '申请地与户籍地严重不符', source: 'network', tone: 'warn' },
          ],
          resolution: '网络环境伪造信号叠加，作为核心欺诈因子留存。',
          isCoreFactor: true,
          relatedAtomicKeys: ['a2'],
        },
        {
          id: 'c3',
          level: 'high',
          desc: '团伙关联图谱发现 3 个关联人已被标记为确认欺诈，存在团伙协同申贷特征；申请行为脚本秒填。',
          items: [
            { side: '网络&地理位置+团伙关联图谱', value: '3 个关联人确认欺诈', source: 'network', tone: 'fail' },
            { side: '申请行为轨迹分析', value: '表单秒填、脚本自动化', source: 'behavior', tone: 'fail' },
          ],
          resolution: '团伙协同 + 脚本行为信号，图谱标记活跃，建议强制加入黑名单。',
          isCoreFactor: true,
          relatedAtomicKeys: ['a3', 'a5'],
        },
      ],
      atomic: baseAtomic('reject'),
      ruleBasis: '判定规则：单一极高欺诈风险直接拦截；叠加 2 项以上核心欺诈规则，欺诈总分 ≥ 80 自动拒绝。',
      auditTime: '2026-07-21 15:00:22',
      ruleVersion: 'V2.6 反欺诈策略集',
      reportId: 'FRD20260721001',
      scoreComponents: [
        { name: '设备 Root+多开模拟器特征', situation: '设备已 ROOT、疑似云手机、应用多开', score: 32, weight: 28, level: 'high', traceTo: 'c1', core: true },
        { name: '7 天设备关联 5 笔不同身份进件（群控特征）', situation: '设备群控关联账号 5 个', score: 28, weight: 28, level: 'high', traceTo: 'c1', core: true },
        { name: '设备关联历史欺诈逾期团伙图谱', situation: '关联 3 个确认欺诈申请人', score: 16, weight: 16, level: 'medium', traceTo: 'c3' },
        { name: '申请操作速度过快、表单秒填（脚本行为）', situation: '表单 1.2 秒、点击 18 次/秒', score: 14, weight: 14, level: 'medium', traceTo: 'c3' },
        { name: '申请人命中互联网欺诈黑名单', situation: '命中欺诈黑名单 + 涉案名单', score: 10, weight: 10, level: 'low', traceTo: 'c1' },
        { name: 'GPS 定位与 IP 属地跨省异地偏差过大', situation: '申请地与户籍地严重不符', score: 8, weight: 8, level: 'low', traceTo: 'c2' },
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
        target: '设备指纹分析',
        actionType: '重新核验',
        operator: '李审核',
        time: '2026-07-18 14:30',
        remark: '首次核验命中群控，二次调用同盾设备指纹接口，核验流水号：FR2026072114320200',
      },
      {
        id: 'log2',
        target: '关联图谱核验',
        actionType: '关联电核',
        operator: '李审核',
        time: '2026-07-18 14:38',
        remark: '关联电核台账编号 EC20260718038，关联 3 个确认欺诈申请人。',
      },
    ] as OpLog[],
  }

  if (status === 'reject') return r

  if (status === 'pass') {
    r.decision = 'pass'
    r.decisionText = '无风险'
    r.zhicha = 15
    r.zhichaBand = 'low'
    r.threads = buildThreads('pass')
    r.basic = baseBasic()
    r.env = baseEnv('pass')
    r.summary = '黑名单/设备指纹/申请行为/网络&地理位置&团伙图谱四项欺诈核验全部通过，关联图谱干净，无团伙信号。综合判定：无风险。'
    r.single = baseSingle('pass')
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
    r.cross.atomic = baseAtomic('pass')
    r.cross.scoreComponents = [
      { name: '无风险证据', situation: '全部单项核验通过，未累计到风险证据', score: 0, weight: 0, level: 'low' },
    ]
    r.opLogs = [
      {
        id: 'log1',
        target: '黑名单核验',
        actionType: '重新核验',
        operator: '系统',
        time: '2026-07-18 10:02',
        remark: '同盾反欺诈 API 返回：未命中任何黑名单。',
      },
    ] as OpLog[]
    return r
  }

  // 可疑（warning）：在确认欺诈基础上弱化因子为「可疑」，保留 3 条中风险冲突
  const w = clone(r)
  w.decision = 'warning'
  w.decisionText = '可疑'
  w.zhicha = 58
  w.zhichaBand = 'medium'
  w.threads = buildThreads('warning')
  w.basic = baseBasic()
  w.env = baseEnv('warning')
  w.summary = '设备指纹疑似模拟器、IP 归属地频繁跳跃、命中行业共享灰名单，触发 3 条中风险规则。综合判定：可疑。'
  w.single = baseSingle('warning')
  w.cross.finalConclusion = 'warning'
  w.cross.finalReason = '设备风险存疑 + 网络归属跳跃 + 关联轻度异常，需人工复核后判定。'
  w.cross.overallRisk = 'medium'
  w.cross.riskScore = 52
  w.cross.ruleBasis = '判定规则：欺诈总分 40-80，命中 2 条以上中风险规则（设备存疑 + 关联轻度异常），转人工复核。'
  w.cross.riskTags = [
    { label: '设备存疑', kind: 'amber' as RiskTag['kind'] },
    { label: '归属跳跃', kind: 'amber' as RiskTag['kind'] },
    { label: '关联轻度异常', kind: 'amber' as RiskTag['kind'] },
    { label: '灰名单命中', kind: 'amber' as RiskTag['kind'] },
  ]
  w.cross.conflicts = [
    {
      id: 'c1',
      level: 'medium',
      desc: '设备指纹命中模拟器/云手机特征，疑似非本人真实设备，需人工确认。',
      items: [
        { side: '设备指纹深度分析', value: '疑似模拟器/云手机', source: 'device', tone: 'warn' },
        { side: '黑名单风险核验', value: '命中行业共享灰名单', source: 'blacklist', tone: 'warn' },
      ],
      resolution: '疑似模拟器但未确认欺诈，标记可疑，建议人工电核设备真实性。',
      isCoreFactor: false,
      relatedAtomicKeys: ['a1', 'a4'],
    },
    {
      id: 'c2',
      level: 'medium',
      desc: '表单填写过快、点击频率偏高，存在异常操作迹象，疑似脚本辅助。',
      items: [
        { side: '申请行为轨迹分析', value: '表单 38 秒、点击频率偏高', source: 'behavior', tone: 'warn' },
      ],
      resolution: '行为异常但不构成确认欺诈，建议人工核实后决定是否豁免。',
      isCoreFactor: false,
      relatedAtomicKeys: ['a3'],
    },
    {
      id: 'c3',
      level: 'medium',
      desc: 'IP 归属地近 7 天频繁跳跃，且团伙图谱出现 1 个轻度关联人命中多头。',
      items: [
        { side: '网络&地理位置', value: '归属地频繁跳跃', source: 'network', tone: 'warn' },
        { side: '团伙关联图谱', value: '1 个关联人命中多头', source: 'network', tone: 'warn' },
      ],
      resolution: '网络归属跳跃 + 关联轻度异常，建议人工核实后决定是否豁免。',
      isCoreFactor: false,
      relatedAtomicKeys: ['a2', 'a5'],
    },
  ]
  w.cross.atomic = baseAtomic('warning')
  w.cross.scoreComponents = [
    { name: '疑似模拟器/云手机设备', situation: '设备指纹疑似模拟器特征', score: 24, weight: 46, level: 'medium', traceTo: 'c1' },
    { name: 'IP 归属跳跃', situation: '近 7 天 IP 归属地频繁跳跃', score: 16, weight: 31, level: 'medium', traceTo: 'c3' },
    { name: '命中行业共享灰名单', situation: '灰名单命中度较高', score: 8, weight: 15, level: 'medium', traceTo: 'c1' },
    { name: '异常申请行为', situation: '表单过快、点击频率偏高', score: 4, weight: 8, level: 'medium', traceTo: 'c2' },
  ]
  w.opLogs = [
    {
      id: 'log1',
      target: '行为轨迹核验',
      actionType: '提交复核',
      operator: '系统',
      time: '2026-07-18 11:20',
      remark: '行为埋点异常，触发中风险预警。',
    },
    {
      id: 'log2',
      target: '地理位置核验',
      actionType: '提交复核',
      operator: '李审核',
      time: '2026-07-18 11:35',
      remark: 'IP 归属地跳跃，转人工复核。',
    },
  ] as OpLog[]
  return w
}
