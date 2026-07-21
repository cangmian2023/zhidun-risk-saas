// 信息核验报告 - 数据模型与示例数据
// 依据 doc/信息核验报告功能设计.md 与 doc/信息核验报告-示例数据.json 构建

export type Conclusion = 'pass' | 'reject' | 'warning' | 'pending'

export type RiskLevel = 'high' | 'medium' | 'low'

export interface SubItem {
  label: string
  value: string
  status: 'ok' | 'fail' | 'warn' | 'info'
}

export interface BasicField {
  key: string
  label: string
  value: string
  valid: boolean
  reason?: string
}

export interface EnvCapture {
  key: string
  label: string
  value: string
}

export interface ImageWithOcr {
  key: string
  label: string
  kind: 'image' | 'video'
  url: string
  ocr: string
}

export interface StructField {
  key: string
  label: string
  raw: string
  parsed: string
  source: string
  match: 'ok' | 'warn' | 'fail'
  diff: string
}

export type RulePromptType = 'pass' | 'warning' | 'reject'

export interface SingleResult {
  source: string
  name: string
  icon: 'police' | 'operator' | 'unionpay' | 'device' | 'network'
  callStatus: 'success' | 'fail' | 'partial'
  costMs: number
  conclusion: Conclusion
  reason: string
  items: SubItem[]
  verifyNo: string
  verifyTime: string
  channel: string
  rulePromptType: RulePromptType
}

export type OpActionType = '重新核验' | '录入备注' | '标记豁免' | '查看回执' | '关联电核' | '全局备注' | '提交复核' | '强制放行'

export interface OpLog {
  id: string
  target: string
  actionType: OpActionType
  operator: string
  time: string
  remark: string
  reviewStatus?: '待复核' | '已复核'
  reviewer?: string
  reviewTime?: string
  attachments?: string[]
}

export interface VerifyThread {
  id: string
  name: string
  icon: 'police' | 'operator' | 'unionpay' | 'device' | 'network' | 'rule'
  status: 'done' | 'fail' | 'running'
  start: string
  end: string
  result: string
}

export interface AtomicResult {
  key: string
  label: string
  value: string
  status: 'ok' | 'fail' | 'warn' | 'info'
  tooltip?: string
  conflictIds: string[]
}

export interface VerifyConflict {
  id: string
  level: RiskLevel
  desc: string
  items: { side: string; value: string; source: string; tone?: 'ok' | 'warn' | 'fail' }[]
  resolution: string
  isCoreFactor: boolean
  relatedAtomicKeys: string[]
}

export interface RiskTag {
  label: string
  kind: 'red' | 'amber' | 'blue' | 'gray'
}

export interface CrossCheck {
  finalConclusion: Conclusion
  finalReason: string
  overallRisk: RiskLevel
  riskScore: number
  scoreCap: number
  riskTags: RiskTag[]
  conflicts: VerifyConflict[]
  atomic: AtomicResult[]
  ruleBasis: string
  auditTime: string
  ruleVersion: string
  reportId: string
}

export interface ItemAction {
  id: string
  target: string
  targetKind: Conclusion
  action: string
  actionKind: 'reject' | 'pass' | 'warning' | 'neutral'
  operator: string
  time: string
  before: string
  after: string
  reason: string
}

export interface ReportAction {
  id: string
  action: string
  actionKind: 'reject' | 'pass' | 'warning' | 'neutral'
  operator: string
  time: string
  before: string
  after: string
  reason: string
}

export interface InfoVerifyReport {
  appId: string
  name: string
  idNo: string
  decision: Conclusion
  decisionText: string
  summary: string
  basic: BasicField[]
  env: EnvCapture[]
  images: ImageWithOcr[]
  struct: StructField[]
  single: SingleResult[]
  threads: VerifyThread[]
  cross: CrossCheck
  itemActions: ItemAction[]
  reportActions: ReportAction[]
  opLogs: OpLog[]
}

export function buildBaseInfoVerifyReport(): InfoVerifyReport {
  return {
    appId: 'J20260718X0001',
    name: '张*伟',
    idNo: '110***********0314',
    decision: 'reject',
    decisionText: '拒绝',
    summary:
      '申请人身份信息在公安、银联、运营商、设备、关联库 5 个数据源完成单项核验，并在交叉比对环节发现 2 项冲突。综合判定：拒绝。',
    basic: [
      { key: 'name', label: '姓名', value: '张伟', valid: true },
      { key: 'idNo', label: '身份证号', value: '110101199003050314', valid: true },
      { key: 'phone', label: '手机号', value: '138****1234', valid: true },
      { key: 'bankNo', label: '银行卡号', value: '6217 0032 0000 1234 567', valid: true },
      { key: 'bankName', label: '开户行', value: '中国工商银行', valid: true },
      { key: 'age', label: '年龄', value: '36', valid: true },
      { key: 'edu', label: '学历', value: '本科', valid: true },
      { key: 'employer', label: '工作单位', value: '北京某某科技有限公司', valid: true },
      { key: 'income', label: '月收入', value: '25,000 元', valid: true },
      { key: 'address', label: '居住地址', value: '北京市朝阳区建国路 88 号', valid: true },
      { key: 'marriage', label: '婚姻', value: '已婚', valid: true },
    ],
    env: [
      { key: 'deviceId', label: '设备指纹', value: 'DV-9F2A-77C1' },
      { key: 'ip', label: 'IP 地址', value: '223.104.36.18' },
      { key: 'gps', label: 'GPS 定位', value: '北京市朝阳区 (39.908, 116.447)' },
      { key: 'channel', label: '进件渠道', value: 'App (Android 13)' },
      { key: 'appVer', label: 'APP 版本', value: '5.2.1' },
    ],
    images: [
      {
        key: 'idcard_front',
        label: '身份证人像面',
        kind: 'image',
        url: '/sample/idcard_front.jpg',
        ocr: '姓名: 张伟  性别: 男  民族: 汉  出生: 1990-03-05  住址: 北京市朝阳区建国路 88 号  公民身份号码: 110101199003050314',
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
        ocr: '卡号: 6217003200001234567  发卡行: 中国工商银行  卡类型: 储蓄卡',
      },
    ],
    struct: [
      {
        key: 'name',
        label: '姓名',
        raw: '张伟（OCR 识别，含空格：张 伟）',
        parsed: '张伟',
        source: '身份证人像面 OCR',
        match: 'ok',
        diff: '已去空格归一化',
      },
      {
        key: 'idNo',
        label: '身份证号',
        raw: '110101199003050314',
        parsed: '110101199003050314',
        source: '身份证人像面 OCR',
        match: 'ok',
        diff: '一致',
      },
      {
        key: 'bankNo',
        label: '银行卡号',
        raw: '6217 0032 0000 1234 567',
        parsed: '6217003200001234567',
        source: '银行卡 OCR',
        match: 'ok',
        diff: '已去空格',
      },
      {
        key: 'phone',
        label: '手机号',
        raw: '138****1234',
        parsed: '138****1234',
        source: '用户填写',
        match: 'ok',
        diff: '一致',
      },
      {
        key: 'bankName',
        label: '开户行',
        raw: '工商银行',
        parsed: '中国工商银行',
        source: '银联卡 Bin 查询',
        match: 'warn',
        diff: '已补全为标准名称',
      },
    ],
    single: [
      {
        source: 'police',
        name: '公安实名身份核验',
        icon: 'police',
        callStatus: 'success',
        costMs: 320,
        conclusion: 'pass',
        reason: '姓名 + 身份证号 + 人脸三要素一致，身份真实有效。',
        items: [
          { label: '姓名', value: '张伟', status: 'ok' },
          { label: '身份证号', value: '110101199003050314', status: 'ok' },
          { label: '人脸比对', value: '相似度 98.6%', status: 'ok' },
          { label: '活体检测', value: '通过（动作：眨眼/张嘴）', status: 'ok' },
        ],
        verifyNo: 'PS202607211432001',
        verifyTime: '2026-07-21 14:32:18',
        channel: '同盾多源并行核验 API V2.0',
        rulePromptType: 'pass',
      },
      {
        source: 'unionpay',
        name: '银行卡四要素核验',
        icon: 'unionpay',
        callStatus: 'success',
        costMs: 410,
        conclusion: 'pass',
        reason: '卡号、姓名、身份证、手机号四要素一致，银行卡为持卡人本人所有。',
        items: [
          { label: '卡号', value: '6217003200001234567', status: 'ok' },
          { label: '姓名', value: '张伟', status: 'ok' },
          { label: '身份证号', value: '110101199003050314', status: 'ok' },
          { label: '预留手机号', value: '138****1234', status: 'ok' },
        ],
        verifyNo: 'UP202607211432012',
        verifyTime: '2026-07-21 14:32:18',
        channel: '同盾多源并行核验 API V2.0',
        rulePromptType: 'pass',
      },
      {
        source: 'operator',
        name: '运营商手机号实名核验',
        icon: 'operator',
        callStatus: 'success',
        costMs: 550,
        conclusion: 'warning',
        reason: '手机号实名信息与申请人姓名一致，但入网时长不足 30 天，疑似新办卡。',
        items: [
          { label: '手机号', value: '138****1234', status: 'ok' },
          { label: '实名姓名', value: '张伟', status: 'ok' },
          { label: '入网时长', value: '21 天', status: 'warn' },
          { label: '在网状态', value: '正常', status: 'ok' },
        ],
        verifyNo: 'TD2026072114320056',
        verifyTime: '2026-07-21 14:32:18',
        channel: '同盾多源并行核验 API V2.0',
        rulePromptType: 'warning',
      },
      {
        source: 'device',
        name: '终端设备风险库核验',
        icon: 'device',
        callStatus: 'success',
        costMs: 180,
        conclusion: 'reject',
        reason: '该设备在近 7 日内关联 3 个以上不同身份申请，存在设备农场/群控风险。',
        items: [
          { label: '设备指纹', value: 'DV-9F2A-77C1', status: 'fail' },
          { label: '关联身份数', value: '3（7 日内）', status: 'fail' },
          { label: 'Root/越狱', value: '否', status: 'ok' },
          { label: '模拟器', value: '否', status: 'ok' },
        ],
        verifyNo: 'TD2026072114320089',
        verifyTime: '2026-07-21 14:32:18',
        channel: '同盾多源并行核验 API V2.0',
        rulePromptType: 'reject',
      },
      {
        source: 'network',
        name: '跨行业联防联控交叉核验',
        icon: 'network',
        callStatus: 'success',
        costMs: 260,
        conclusion: 'warning',
        reason: '手机号命中跨行业联防联控库中 1 条历史逾期记录（非本人，疑似号码共用）。',
        items: [
          { label: '手机号黑名单', value: '命中 1 条', status: 'warn' },
          { label: '身份证黑名单', value: '未命中', status: 'ok' },
          { label: '关联逾期', value: '1 条历史', status: 'warn' },
          { label: '共债网络', value: '未发现', status: 'ok' },
        ],
        verifyNo: 'TD2026072114320145',
        verifyTime: '2026-07-21 14:32:18',
        channel: '同盾多源并行核验 API V2.0',
        rulePromptType: 'warning',
      },
    ],
    threads: [
      {
        id: 't1',
        name: '公安人口库核验',
        icon: 'police',
        status: 'done',
        start: '2026-07-18 14:22:01.102',
        end: '2026-07-18 14:22:01.422',
        result: '三要素一致',
      },
      {
        id: 't2',
        name: '银联持卡人核验',
        icon: 'unionpay',
        status: 'done',
        start: '2026-07-18 14:22:01.110',
        end: '2026-07-18 14:22:01.520',
        result: '四要素一致',
      },
      {
        id: 't3',
        name: '运营商实名核验',
        icon: 'operator',
        status: 'done',
        start: '2026-07-18 14:22:01.115',
        end: '2026-07-18 14:22:01.665',
        result: '实名一致 / 入网 21 天',
      },
      {
        id: 't4',
        name: '设备风险核验',
        icon: 'device',
        status: 'done',
        start: '2026-07-18 14:22:01.120',
        end: '2026-07-18 14:22:01.300',
        result: '设备关联 3 身份',
      },
      {
        id: 't5',
        name: '关联库交叉核验',
        icon: 'network',
        status: 'done',
        start: '2026-07-18 14:22:01.130',
        end: '2026-07-18 14:22:01.390',
        result: '命中 1 条历史逾期',
      },
      {
        id: 't6',
        name: '逻辑规则引擎',
        icon: 'rule',
        status: 'done',
        start: '2026-07-18 14:22:01.400',
        end: '2026-07-18 14:22:01.880',
        result: '生成 2 项冲突',
      },
    ],
    cross: {
      finalConclusion: 'reject',
      finalReason:
        '设备风险核验拒绝（设备关联多个身份）+ 运营商入网时长不足 + 关联库命中历史逾期，三项风险叠加，综合判定拒绝。',
      overallRisk: 'high',
      riskScore: 82,
      scoreCap: 100,
      ruleBasis: '判定规则：单一项高风险（设备群控）直接触发系统拦截，叠加2项中风险，综合风险分≥80分自动拒绝',
      auditTime: '2026-07-21 15:00:22',
      ruleVersion: 'V2.6风控策略集',
      reportId: 'CR20260721001',
      riskTags: [
        { label: '设备群控', kind: 'red' },
        { label: '入网时长短', kind: 'amber' },
        { label: '关联逾期', kind: 'amber' },
        { label: '身份真实', kind: 'blue' },
      ],
      conflicts: [
        {
          id: 'c1',
          level: 'high',
          desc: '同一设备指纹在 7 日内关联多个不同身份申请，存在设备农场/群控风险。',
          items: [
            { side: '终端设备风险库核验', value: '关联 3 个身份', source: 'device', tone: 'fail' },
            { side: '公安/银联', value: '单身份三/四要素一致', source: 'police', tone: 'ok' },
          ],
          resolution: '要素一致但设备异常 → 以设备风险为准，标记高风险。',
          isCoreFactor: true,
          relatedAtomicKeys: ['a3'],
        },
        {
          id: 'c2',
          level: 'medium',
          desc: '手机号实名一致，但跨行业联防联控库命中历史逾期记录，疑似号码共用。',
          items: [
            { side: '运营商手机号实名核验', value: '实名=张伟', source: 'operator', tone: 'ok' },
            { side: '跨行业联防联控交叉核验', value: '命中历史逾期', source: 'network', tone: 'warn' },
          ],
          resolution: '非本人逾期概率高，作为辅助风险标签保留，不单独拒贷。',
          isCoreFactor: false,
          relatedAtomicKeys: ['a4', 'a5'],
        },
        {
          id: 'c3',
          level: 'medium',
          desc: '手机号入网仅 21 天（不足 30 天），结合关联逾期记录，新办号码的撸贷风险叠加。',
          items: [
            { side: '运营商手机号实名核验', value: '入网 21 天', source: 'operator', tone: 'warn' },
            { side: '跨行业联防联控交叉核验', value: '关联逾期 1 条', source: 'network', tone: 'warn' },
          ],
          resolution: '新号 + 关联逾期双重预警叠加，建议人工电核确认号码归属后决定是否豁免。',
          isCoreFactor: false,
          relatedAtomicKeys: ['a4', 'a5'],
        },
      ],
      atomic: [
        { key: 'a1', label: '身份真实性', value: '真实', status: 'ok', tooltip: '公安三要素核验一致，人脸活体通过，身份真实无异常。', conflictIds: [] },
        { key: 'a2', label: '银行卡归属', value: '本人', status: 'ok', tooltip: '银行卡四要素核验一致，确认为持卡人本人所有。', conflictIds: [] },
        { key: 'a3', label: '设备安全性', value: '高危', status: 'fail', tooltip: '设备指纹在7日内关联3个不同身份，存在群控/设备农场嫌疑，直接触发系统拦截。', conflictIds: ['c1'] },
        { key: 'a4', label: '入网稳定性', value: '偏低', status: 'warn', tooltip: '手机号入网仅21天，新办号码存在撸贷风险。', conflictIds: ['c2', 'c3'] },
        { key: 'a5', label: '关联风险', value: '轻度', status: 'warn', tooltip: '手机号命中跨行业联防联控库1条历史逾期（非本人），需人工核实确认为号码共用。', conflictIds: ['c2', 'c3'] },
      ],
    },
    itemActions: [
      {
        id: 'ia1',
        target: '终端设备风险库核验',
        targetKind: 'reject',
        action: '确认拒绝结论',
        actionKind: 'reject',
        operator: '李审核',
        time: '2026-07-18 14:35',
        before: '系统判定：拒绝',
        after: '人工确认：拒绝',
        reason: '设备关联多身份证据充分，维持系统拒贷结论。',
      },
      {
        id: 'ia2',
        target: '运营商手机号实名核验',
        targetKind: 'warning',
        action: '降级为通过',
        actionKind: 'pass',
        operator: '李审核',
        time: '2026-07-18 14:36',
        before: '系统判定：预警（入网21天）',
        after: '人工判定：通过',
        reason: '新办卡但实名一致，不单独构成拒贷依据，降级处理。',
      },
    ],
    reportActions: [
      {
        id: 'ra1',
        action: '整体报告确认',
        actionKind: 'reject',
        operator: '李审核',
        time: '2026-07-18 14:40',
        before: '系统决策：拒绝',
        after: '最终决策：拒绝',
        reason: '综合设备风险与关联逾期，维持拒绝，提交至贷前终审。',
      },
    ],
    opLogs: [
      {
        id: 'log1',
        target: '终端设备风险库核验',
        actionType: '重新核验',
        operator: '李审核',
        time: '2026-07-18 14:30',
        remark: '首次核验结果异常，二次调用同盾设备指纹接口，核验流水号：TD2026072114320200',
      },
      {
        id: 'log2',
        target: '运营商手机号实名核验',
        actionType: '录入备注',
        operator: '李审核',
        time: '2026-07-18 14:33',
        remark: '客户来电说明为新办手机号，已上传通话录音佐证。',
        attachments: ['通话录音_20260718_1430.mp3'],
      },
      {
        id: 'log3',
        target: '运营商手机号实名核验',
        actionType: '标记豁免',
        operator: '李审核',
        time: '2026-07-18 14:36',
        remark: '入网时长不足30天，经电话核实确认为本人新办卡，风险无实质影响，申请豁免。',
        reviewStatus: '已复核',
        reviewer: '王主管',
        reviewTime: '2026-07-18 15:10',
      },
      {
        id: 'log4',
        target: '跨行业联防联控交叉核验',
        actionType: '关联电核',
        operator: '李审核',
        time: '2026-07-18 14:38',
        remark: '关联电核台账编号 EC20260718038，已绑定至本核验项。',
      },
    ],
  }
}

function clone<T>(o: T): T {
  return JSON.parse(JSON.stringify(o)) as T
}

// 依据样例 id 返回对应状态：含 MANUAL→人工审核，含 REJECT→拒绝，含 PASS→通过，缺省→拒绝
export function buildInfoVerifyReport(id?: string): InfoVerifyReport {
  const status: 'pass' | 'reject' | 'manual' = id
    ? id.includes('MANUAL')
      ? 'manual'
      : id.includes('REJECT')
        ? 'reject'
        : 'pass'
    : 'pass'
  if (status === 'reject') return buildBaseInfoVerifyReport()

  const r = clone(buildBaseInfoVerifyReport())
  if (status === 'pass') {
    r.decision = 'pass'
    r.decisionText = '通过'
    r.summary = '申请人身份信息在公安、银联、运营商、设备、关联库 5 个数据源完成单项核验，全部一致，无风险冲突。综合判定：通过。'
    r.cross.finalConclusion = 'pass'
    r.cross.finalReason = '全部单项核验通过，设备无异常、无关联逾期，综合判定通过。'
    r.cross.overallRisk = 'low'
    r.cross.riskScore = 24
    r.cross.riskTags = [
      { label: '身份真实', kind: 'blue' },
      { label: '设备正常', kind: 'blue' },
      { label: '关联无风险', kind: 'blue' },
    ]
    r.cross.conflicts = []
    r.cross.atomic = r.cross.atomic.map((a) => ({ ...a, status: 'ok' as const, conflictIds: [] }))
    r.single = r.single.map((s) => ({ ...s, conclusion: 'pass' as const, rulePromptType: 'pass' as const }))
    return r
  }

  // manual：人工审核（待定）
  r.decision = 'warning'
  r.decisionText = '人工审核'
  r.summary = '申请人身份信息核验基本通过，但运营商入网时长不足且关联库命中历史逾期，需人工电核后判定。综合判定：人工审核（待定）。'
  r.cross.finalConclusion = 'warning'
  r.cross.finalReason = '身份真实、银行卡本人，但入网时长不足叠加关联逾期预警，需人工核实后判定。'
  r.cross.overallRisk = 'medium'
  r.cross.riskScore = 58
  r.cross.riskTags = [
    { label: '入网时长短', kind: 'amber' },
    { label: '关联逾期', kind: 'amber' },
    { label: '身份真实', kind: 'blue' },
  ]
  r.cross.conflicts = r.cross.conflicts.filter((c) => c.level === 'medium')
  r.cross.atomic = r.cross.atomic.map((a) => (a.status === 'fail' ? { ...a, status: 'warn' as const } : a))
  r.single = r.single.map((s) => (s.conclusion === 'reject' ? { ...s, conclusion: 'warning' as const, rulePromptType: 'warning' as const } : s))
  return r
}
