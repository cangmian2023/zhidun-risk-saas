import type { ModuleSpec } from './menus'
import { applications, alerts, monitorTasks, rules, models } from './data'

const appCols = [
  { key: 'id', label: '进件号', width: '140px' },
  { key: 'name', label: '申请人', type: 'mask-name' as const, width: '90px' },
  { key: 'product', label: '产品', width: '100px' },
  { key: 'channel', label: '渠道', width: '96px' },
  { key: 'amount', label: '申请额度', type: 'money' as const, align: 'right' as const, width: '110px' },
  { key: 'fraudScore', label: '欺诈分', type: 'score' as const, align: 'right' as const, width: '86px' },
  { key: 'creditScore', label: '信用分', type: 'score' as const, align: 'right' as const, width: '86px' },
  { key: 'decision', label: '决策结果', type: 'badge' as const, width: '104px' },
  { key: 'applyTime', label: '申请时间', type: 'datetime' as const, width: '160px' },
]

const alertCols = [
  { key: 'id', label: '预警号', width: '140px' },
  { key: 'name', label: '客户', type: 'mask-name' as const, width: '90px' },
  { key: 'level', label: '等级', type: 'badge' as const, width: '80px' },
  { key: 'trigger', label: '触发信号', width: '130px' },
  { key: 'product', label: '产品', width: '100px' },
  { key: 'suggestion', label: '处置建议', type: 'badge' as const, width: '104px' },
  { key: 'monitorTime', label: '监测时间', type: 'datetime' as const, width: '160px' },
]

export const crSpecs: Record<string, ModuleSpec> = {
  'cr:overview': {
    title: '概览看板',
    crumb: '零售信贷风控',
    subtitle: '零售信贷风控整体运行态势与待办提醒。',
    stats: [
      { label: '今日进件量', value: '12,847', delta: '+6.2% 环比', deltaType: 'up', accent: 'brand' },
      { label: '自动通过率', value: '63.2%', delta: '+1.1pp', deltaType: 'up', accent: 'emerald' },
      { label: '当前预警客户数', value: '1,284', delta: '红灯 213', deltaType: 'down', accent: 'rose' },
      { label: '监测覆盖客群', value: '234.0万', delta: '+3.4万', deltaType: 'up', accent: 'cyan' },
    ],
    charts: [
      {
        type: 'line',
        title: '近 7 日进件量与预警数',
        labels: ['07-12', '07-13', '07-14', '07-15', '07-16', '07-17', '07-18'],
        series: [
          { name: '进件量', color: '#3366ff', data: [10820, 11240, 12110, 11980, 12630, 12099, 12847] },
          { name: '预警数', color: '#ef4444', data: [920, 1010, 1088, 1055, 1132, 1201, 1284] },
        ],
      },
      {
        type: 'donut',
        title: '今日决策结果分布',
        centerLabel: '今日进件',
        centerValue: '12,847',
        donut: [
          { label: '自动通过', value: 8122, color: '#22c55e' },
          { label: '自动拒绝', value: 2762, color: '#ef4444' },
          { label: '转人工', value: 1320, color: '#f59e0b' },
          { label: '人工通过', value: 643, color: '#3366ff' },
        ],
      },
    ],
    columns: [
      { key: 'todo', label: '待办事项', width: '260px' },
      { key: 'cnt', label: '数量', align: 'right' as const, width: '90px' },
      { key: 'level', label: '优先级', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 't1', todo: '存疑进件待人工复核', cnt: 132, level: { v: '高', kind: 'red' } },
      { id: 't2', todo: '红灯预警待处置', cnt: 213, level: { v: '紧急', kind: 'orange' } },
      { id: 't3', todo: '黄灯预警持续关注', cnt: 871, level: { v: '中', kind: 'amber' } },
      { id: 't4', todo: '监测任务异常待排查', cnt: 2, level: { v: '低', kind: 'gray' } },
    ],
    note: '快捷入口：发起审核、查看决策报告、配置监测任务。',
  },

  'cr:pre-application': {
    title: '申贷审核',
    crumb: '零售信贷风控 / 贷前审核',
    subtitle: '录入 / 导入申贷信息，调用决策引擎实时跑决策流，输出欺诈、关联、共债风险评估。',
    stats: [
      { label: '今日已审', value: '12,847', delta: '+6.2%', deltaType: 'up', accent: 'brand' },
      { label: '平均决策耗时', value: '86 ms', delta: '-12ms', deltaType: 'up', accent: 'cyan' },
      { label: '转人工率', value: '10.3%', delta: '-0.8pp', deltaType: 'up', accent: 'violet' },
      { label: '批量任务', value: '7 个', delta: '进行中 2', deltaType: 'flat', accent: 'amber' },
    ],
    columns: appCols,
    rows: applications,
    searchable: true,
    reportKey: 'id',
    batchImport: true,
    historySearch: true,
    note: '点击进件号可查看单笔风险评估报告（欺诈 / 关联 / 共债三维）。支持文件导入批量决策与历史进件检索。',
  },

  'cr:pre-verify': {
    title: '信息核验',
    crumb: '零售信贷风控 / 贷前审核',
    listTitle: '',
    subtitle: '基本信息格式校验、三/四要素核验、人脸比对与活体检测，识别填写不一致与逻辑矛盾。',
    columns: [
      { key: 'id', label: '进件号', width: '140px' },
      { key: 'name', label: '申请人', type: 'mask-name' as const, width: '90px' },
      { key: 'idNo', label: '身份证', type: 'mask-id' as const, width: '170px' },
      { key: 'phone', label: '手机号', type: 'mask-phone' as const, width: '130px' },
      { key: 'fmt', label: '格式校验', type: 'badge' as const, badgeKind: 'green', width: '96px' },
      { key: 'three', label: '三要素', type: 'badge' as const, width: '96px' },
      { key: 'face', label: '人脸/活体', type: 'badge' as const, width: '110px' },
      { key: 'warn', label: '异常预警', type: 'badge' as const, width: '120px' },
    ],
    rows: applications.slice(0, 12).map((r, i) => ({
      ...r,
      fmt: { v: i % 6 === 0 ? '异常' : '通过', kind: i % 6 === 0 ? 'red' : 'green' },
      three: { v: i % 5 === 0 ? '不一致' : '一致', kind: i % 5 === 0 ? 'red' : 'green' },
      face: { v: i % 7 === 0 ? '失败' : '通过', kind: i % 7 === 0 ? 'orange' : 'green' },
      warn: { v: i % 4 === 0 ? '逻辑矛盾' : '无', kind: i % 4 === 0 ? 'amber' : 'gray' },
    })),
    viewNavigate: 'pre-verify-detail',
  },

  'cr:pre-credit': {
    title: '信用风控（联防联控）',
    crumb: '零售信贷风控 / 贷前审核',
    subtitle: '基于跨行业联防联控机制，识别多头借贷、共债风险与黑灰产情报网络。',
    stats: [
      { label: '多头借贷命中', value: '1,038', delta: '+14.6%', deltaType: 'down', accent: 'rose' },
      { label: '共债高风险', value: '412', delta: '+8.2%', deltaType: 'down', accent: 'amber' },
      { label: '跨平台机构(均值)', value: '4.7 家', delta: '+0.3', deltaType: 'down', accent: 'orange' },
      { label: '黑灰产情报', value: '27 条', delta: '新增 5', deltaType: 'flat', accent: 'violet' },
    ],
    charts: [
      {
        type: 'bar',
        title: '近 7 日多头借贷检测命中',
        labels: ['07-12', '07-13', '07-14', '07-15', '07-16', '07-17', '07-18'],
        series: [{ name: '命中人数', color: '#ef4444', data: [812, 901, 978, 955, 1002, 1088, 1038] }],
      },
    ],
    columns: [
      { key: 'id', label: '进件号', width: '140px' },
      { key: 'name', label: '申请人', type: 'mask-name' as const, width: '90px' },
      { key: 'plat', label: '近30天申贷平台数', align: 'right' as const, width: '150px' },
      { key: 'org', label: '涉及机构数', align: 'right' as const, width: '120px' },
      { key: 'debt', label: '负债收入比', type: 'percent' as const, align: 'right' as const, width: '120px' },
      { key: 'concl', label: '信用结论', type: 'badge' as const, width: '120px' },
    ],
    rows: applications.slice(0, 12).map((r, i) => ({
      id: r.id,
      name: r.name,
      plat: 2 + (i % 7),
      org: 1 + (i % 6),
      debt: 35 + (i * 6) % 60,
      concl: { v: i % 3 === 0 ? '高风险' : i % 3 === 1 ? '关注' : '正常', kind: i % 3 === 0 ? 'red' : i % 3 === 1 ? 'amber' : 'green' },
    })),
  },

  'cr:pre-fraud': {
    title: '欺诈识别',
    crumb: '零售信贷风控 / 贷前审核',
    subtitle: '设备指纹、动态欺诈模型与异常行为检测，识别骗贷风险团伙。',
    stats: [
      { label: '设备风险命中', value: '596', delta: '+9.1%', deltaType: 'down', accent: 'rose' },
      { label: '群控/模拟器', value: '183', delta: '+22', deltaType: 'down', accent: 'orange' },
      { label: '异常行为', value: '741', delta: '+5.4%', deltaType: 'down', accent: 'amber' },
      { label: '欺诈团伙', value: '14 个', delta: '新增 3', deltaType: 'flat', accent: 'violet' },
    ],
    charts: [
      {
        type: 'donut',
        title: '欺诈识别信号构成',
        centerLabel: '欺诈信号',
        centerValue: '1,520',
        donut: [
          { label: '设备环境异常', value: 596, color: '#ef4444' },
          { label: '群控/模拟器', value: 183, color: '#f59e0b' },
          { label: '异常行为', value: 741, color: '#8b5cf6' },
        ],
      },
    ],
    columns: [
      { key: 'id', label: '进件号', width: '140px' },
      { key: 'name', label: '申请人', type: 'mask-name' as const, width: '90px' },
      { key: 'device', label: '设备环境', type: 'badge' as const, width: '110px' },
      { key: 'simu', label: '群控/模拟器', type: 'badge' as const, width: '120px' },
      { key: 'beh', label: '异常行为', type: 'badge' as const, width: '110px' },
      { key: 'gang', label: '团伙', type: 'badge' as const, width: '90px' },
    ],
    rows: applications.slice(0, 12).map((r, i) => ({
      id: r.id,
      name: r.name,
      device: { v: i % 4 === 0 ? '高风险' : '正常', kind: i % 4 === 0 ? 'red' : 'green' },
      simu: { v: i % 6 === 0 ? '疑似' : '否', kind: i % 6 === 0 ? 'orange' : 'gray' },
      beh: { v: i % 5 === 0 ? '异地高频' : '正常', kind: i % 5 === 0 ? 'amber' : 'green' },
      gang: { v: i % 8 === 0 ? 'G-014' : '—', kind: i % 8 === 0 ? 'violet' : 'gray' },
    })),
  },

  'cr:pre-report': {
    title: '决策报告',
    crumb: '零售信贷风控 / 贷前审核',
    subtitle: '基于专家经验与前沿建模技术生成的科学、直观、可解释报告，支持在线查看与 PDF 导出。',
    columns: [
      { key: 'id', label: '进件号', width: '140px' },
      { key: 'name', label: '申请人', type: 'mask-name' as const, width: '90px' },
      { key: 'layer', label: '风险分层', type: 'badge' as const, width: '100px' },
      { key: 'rules', label: '命中规则', align: 'right' as const, width: '100px' },
      { key: 'suggest', label: '决策建议', type: 'badge' as const, width: '110px' },
      { key: 'gen', label: '生成时间', type: 'datetime' as const, width: '160px' },
    ],
    rows: applications.slice(0, 12).map((r, i) => ({
      id: r.id,
      name: r.name,
      layer: { v: i % 3 === 0 ? '高风险' : i % 3 === 1 ? '中风险' : '低风险', kind: i % 3 === 0 ? 'red' : i % 3 === 1 ? 'amber' : 'green' },
      rules: 0 + (i % 5),
      suggest: { v: i % 4 === 0 ? '拒绝' : i % 4 === 1 ? '转人工' : '准入', kind: i % 4 === 0 ? 'red' : i % 4 === 1 ? 'amber' : 'green' },
      gen: r.applyTime,
    })),
    note: '报告内容：风险分层、命中规则、决策建议（准入 / 拒绝 / 转人工）。支持按信贷产品定制模板（报告模板配置）。',
  },

  'cr:pre-manual': {
    title: '存疑进件人工复核',
    crumb: '零售信贷风控 / 贷前审核',
    subtitle: '转人工复核的进件并排展示本次信息与历史关联进件，辅助判断；复核结论：通过 / 拒绝 / 挂起。',
    columns: [
      { key: 'id', label: '进件号', width: '140px' },
      { key: 'name', label: '申请人', type: 'mask-name' as const, width: '90px' },
      { key: 'reason', label: '转人工原因', width: '150px' },
      { key: 'rel', label: '历史关联进件', align: 'right' as const, width: '130px' },
      { key: 'status', label: '复核状态', type: 'badge' as const, width: '100px' },
      { key: 'result', label: '复核结论', type: 'badge' as const, width: '100px' },
    ],
    rows: applications.slice(0, 10).map((r, i) => ({
      id: r.id,
      name: r.name,
      reason: ['欺诈分偏高', '多头借贷', '信息不一致', '设备异常'][i % 4],
      rel: i % 3,
      status: { v: i % 2 === 0 ? '待复核' : '已复核', kind: i % 2 === 0 ? 'amber' : 'green' },
      result: { v: i % 3 === 0 ? '挂起' : i % 3 === 1 ? '通过' : '拒绝', kind: i % 3 === 0 ? 'gray' : i % 3 === 1 ? 'blue' : 'red' },
    })),
  },

  'cr:mid-cockpit': {
    title: '监控驾驶舱',
    crumb: '零售信贷风控 / 贷中监控',
    subtitle: '客群风险总览、实时预警流与业务动作建议统计，支持多维度下钻。',
    stats: [
      { label: '监测客群规模', value: '234.0万', delta: '+3.4万', deltaType: 'up', accent: 'brand' },
      { label: '红灯客户', value: '213', delta: '+18', deltaType: 'down', accent: 'rose' },
      { label: '黄灯客户', value: '871', delta: '+42', deltaType: 'down', accent: 'amber' },
      { label: '建议预催/降额', value: '386', delta: '+5.1%', deltaType: 'down', accent: 'orange' },
    ],
    charts: [
      {
        type: 'donut',
        title: '客群风险等级分布',
        centerLabel: '监测客群',
        centerValue: '234万',
        donut: [
          { label: '低风险', value: 1680000, color: '#22c55e' },
          { label: '中风险', value: 432000, color: '#f59e0b' },
          { label: '高风险', value: 128400, color: '#ef4444' },
        ],
      },
    ],
    columns: alertCols,
    rows: alerts.slice(0, 10),
    note: '实时预警流：新产生的红/黄灯信号；业务动作建议：预催 / 降额 / 促活 / 提额。',
  },

  'cr:mid-task': {
    title: '监测任务配置',
    crumb: '零售信贷风控 / 贷中监控',
    subtitle: '配置扫描频次、分场景分产品策略、监测指标与模块化组装，满足特定业务需求。',
    columns: [
      { key: 'id', label: '任务号', width: '110px' },
      { key: 'name', label: '任务名称', width: '170px' },
      { key: 'scene', label: '场景', width: '110px' },
      { key: 'product', label: '产品线', width: '100px' },
      { key: 'freq', label: '扫描频次', width: '90px' },
      { key: 'indicators', label: '监测指标数', align: 'right' as const, width: '120px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
      { key: 'lastRun', label: '上次运行', type: 'datetime' as const, width: '160px' },
    ],
    rows: monitorTasks,
    note: '支持日/周/实时等多种扫描频次；按产品线、业务场景分客群配置策略；自由挑选指标/规则/评分模块组装。',
  },

  'cr:mid-alert': {
    title: '红黄灯预警',
    crumb: '零售信贷风控 / 贷中监控',
    subtitle: '面向需要决策建议的客户输出红黄灯预警信号，并给出处置建议。',
    stats: [
      { label: '红灯客户', value: '213', delta: '建议降额/预催', deltaType: 'down', accent: 'rose' },
      { label: '黄灯客户', value: '871', delta: '持续关注', deltaType: 'flat', accent: 'amber' },
      { label: '今日新增', value: '60', delta: '+8 红灯', deltaType: 'down', accent: 'orange' },
      { label: '已处置', value: '1,012', delta: '处置率 92%', deltaType: 'up', accent: 'emerald' },
    ],
    columns: alertCols,
    rows: alerts,
    note: '红灯：高风险，建议降额/预催；黄灯：关注。处置建议：预催、降额、关注、挽留。',
  },

  'cr:mid-alert-detail': {
    title: '预警信号明细',
    crumb: '零售信贷风控 / 贷中监控',
    subtitle: '单客户预警详情，还原触发规则/指标/评分明细与规则血缘，支持时间切片对比。',
    columns: [
      { key: 'id', label: '预警号', width: '140px' },
      { key: 'name', label: '客户', type: 'mask-name' as const, width: '90px' },
      { key: 'rule', label: '触发规则', width: '160px' },
      { key: 'metric', label: '指标', width: '140px' },
      { key: 'score', label: '评分', type: 'score' as const, align: 'right' as const, width: '90px' },
      { key: 'trend', label: '近3期趋势', width: '140px' },
    ],
    rows: alerts.slice(0, 10).map((r, i) => ({
      id: r.id,
      name: r.name,
      rule: ['R-2003 三要素不一致', 'R-2001 申贷平台数≥5', 'R-2008 共债机构≥4', 'R-2006 活体失败'][i % 4],
      metric: ['负债收入比', '近30天申贷平台数', '共债机构数', '信用分'][i % 4],
      score: 60 + (i * 11) % 39,
      trend: ['↑恶化', '↑上升', '→持平', '↓改善'][i % 4],
    })),
    note: '规则溯源：信号 → 规则 → 指标血缘关系；时间切片对比连续监测结果动态变化。',
  },

  'cr:mid-ops': {
    title: '存量客群运营',
    crumb: '零售信贷风控 / 贷中监控',
    subtitle: '按风险+价值分层，输出促活、提额、二次营销名单，跟踪周期性评估与运营效果。',
    columns: [
      { key: 'seg', label: '客群分层', width: '140px' },
      { key: 'cnt', label: '客户数', align: 'right' as const, width: '110px' },
      { key: 'value', label: '价值', type: 'badge' as const, width: '100px' },
      { key: 'risk', label: '风险', type: 'badge' as const, width: '100px' },
      { key: 'action', label: '运营策略', width: '130px' },
    ],
    rows: [
      { id: 's1', seg: '高价值-低风险', cnt: 184200, value: { v: '高', kind: 'green' }, risk: { v: '低', kind: 'green' }, action: '提额 / 促活' },
      { id: 's2', seg: '高价值-中风险', cnt: 96200, value: { v: '高', kind: 'green' }, risk: { v: '中', kind: 'amber' }, action: '二次营销' },
      { id: 's3', seg: '低价值-低风险', cnt: 1210000, value: { v: '低', kind: 'gray' }, risk: { v: '低', kind: 'green' }, action: '促活' },
      { id: 's4', seg: '高价值-高风险', cnt: 38600, value: { v: '高', kind: 'green' }, risk: { v: '高', kind: 'red' }, action: '降额 / 预催' },
    ],
    note: '周期性评估客户资产状况、资金需求与行为习惯，辅助促活、提额、二次客户经营。',
  },

  'cr:mid-output': {
    title: '结果订阅与输出',
    crumb: '零售信贷风控 / 贷中监控',
    subtitle: '支持 API 接口、URL 回调、文件交换（SFTP/批量）、网页下载等多种结果获取形式。',
    columns: [
      { key: 'id', label: '订阅号', width: '120px' },
      { key: 'type', label: '输出方式', width: '130px' },
      { key: 'target', label: '接收方', width: '180px' },
      { key: 'freq', label: '频率', width: '90px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'O-001', type: 'API 接口推送', target: '核心风控系统', freq: '实时', status: { v: '启用', kind: 'green' } },
      { id: 'O-002', type: 'URL 回调', target: '贷后管理系统', freq: '实时', status: { v: '启用', kind: 'green' } },
      { id: 'O-003', type: '文件交换(SFTP)', target: '数据仓', freq: 'T+1', status: { v: '启用', kind: 'green' } },
      { id: 'O-004', type: '网页下载', target: '风控运营', freq: '手动', status: { v: '启用', kind: 'green' } },
      { id: 'O-005', type: '邮件/企微/短信', target: '业务人员', freq: '日报', status: { v: '停用', kind: 'gray' } },
    ],
    note: '订阅与通知配置支持邮件 / 企微 / 短信触达业务人员。',
  },

  'cr:st-indicators': {
    title: '指标管理',
    crumb: '零售信贷风控 / 策略中心',
    subtitle: '指标维护（新增/编辑/上下线）、单条与批量测试，支持实时/离线指标与按名称/分类/数据源检索。',
    columns: [
      { key: 'id', label: '指标编号', width: '120px' },
      { key: 'name', label: '指标名称', width: '180px' },
      { key: 'cat', label: '分类', width: '110px' },
      { key: 'type', label: '类型', width: '100px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'I-001', name: '近30天申贷平台数', cat: '信贷行为', type: '实时', status: { v: '已上线', kind: 'green' } },
      { id: 'I-002', name: '负债收入比', cat: '偿债能力', type: '实时', status: { v: '已上线', kind: 'green' } },
      { id: 'I-003', name: '设备环境风险分', cat: '设备指纹', type: '实时', status: { v: '已上线', kind: 'green' } },
      { id: 'I-004', name: '共债机构数', cat: '关联网络', type: '离线', status: { v: '已上线', kind: 'green' } },
      { id: 'I-005', name: '近90天逾期次数', cat: '信用历史', type: '离线', status: { v: '待测试', kind: 'amber' } },
    ],
  },

  'cr:st-rules': {
    title: '规则管理',
    crumb: '零售信贷风控 / 策略中心',
    subtitle: '页面式（拖拽）/脚本式规则配置，规则集批量启停，规则表/决策树/决策矩阵，规则回溯分析。',
    columns: [
      { key: 'id', label: '规则编号', width: '110px' },
      { key: 'name', label: '规则名称', width: '200px' },
      { key: 'type', label: '类型', width: '100px' },
      { key: 'hit', label: '累计命中', align: 'right' as const, width: '110px' },
      { key: 'passRate', label: '通过率', type: 'percent' as const, align: 'right' as const, width: '100px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
      { key: 'updated', label: '更新时间', type: 'datetime' as const, width: '160px' },
    ],
    rows: rules,
  },

  'cr:st-flow': {
    title: '决策流管理',
    crumb: '零售信贷风控 / 策略中心',
    subtitle: '拖拉拽编排决策流节点（规则/评分卡/模型），支持分流、回测、冠军挑战者与 A-B Test，版本预发布/正式/回退。',
    columns: [
      { key: 'id', label: '决策流编号', width: '130px' },
      { key: 'name', label: '决策流名称', width: '180px' },
      { key: 'nodes', label: '节点数', align: 'right' as const, width: '100px' },
      { key: 'ver', label: '版本', width: '90px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'F-001', name: '消费分期准入决策流', nodes: 12, ver: 'v2.3', status: { v: '正式发布', kind: 'green' } },
      { id: 'F-002', name: '现金贷反欺诈决策流', nodes: 15, ver: 'v1.8', status: { v: '正式发布', kind: 'green' } },
      { id: 'F-003', name: '信用卡贷中监控流', nodes: 9, ver: 'v0.9', status: { v: '回测中', kind: 'amber' } },
    ],
  },

  'cr:st-models': {
    title: '模型管理',
    crumb: '零售信贷风控 / 策略中心',
    subtitle: '模型上传（PMML/Python/评分卡）、在线编辑与版本管理，模型监控指标与阈值、超阈值告警、调用配置。',
    columns: [
      { key: 'id', label: '模型编号', width: '130px' },
      { key: 'name', label: '模型名称', width: '160px' },
      { key: 'type', label: '类型', width: '110px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
      { key: 'auc', label: 'AUC', align: 'right' as const, width: '90px' },
      { key: 'ks', label: 'KS', align: 'right' as const, width: '90px' },
      { key: 'lastTrain', label: '最近训练', width: '120px' },
    ],
    rows: models,
  },

  'cr:st-lists': {
    title: '名单管理',
    crumb: '零售信贷风控 / 策略中心',
    subtitle: '黑/白/灰名单维护，名单上传、来源查看、禁用与修改记录，沉淀外部名单。',
    columns: [
      { key: 'id', label: '名单编号', width: '120px' },
      { key: 'name', label: '名单名称', width: '160px' },
      { key: 'kind', label: '类型', type: 'badge' as const, width: '100px' },
      { key: 'cnt', label: '记录数', align: 'right' as const, width: '110px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'L-001', name: '外部黑灰名单', kind: { v: '黑名单', kind: 'red' }, cnt: 128400, status: { v: '生效', kind: 'green' } },
      { id: 'L-002', name: '内部白名单', kind: { v: '白名单', kind: 'green' }, cnt: 58210, status: { v: '生效', kind: 'green' } },
      { id: 'L-003', name: '疑似欺诈灰名单', kind: { v: '灰名单', kind: 'amber' }, cnt: 33120, status: { v: '生效', kind: 'green' } },
    ],
  },

  'cr:st-external': {
    title: '外部数据管理',
    crumb: '零售信贷风控 / 策略中心',
    subtitle: '外部数据源接入（接口对接、报文解析）、指标加工计算，页面化配置无需编码。',
    columns: [
      { key: 'id', label: '数据源编号', width: '130px' },
      { key: 'name', label: '数据源', width: '180px' },
      { key: 'type', label: '接入方式', width: '110px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'E-001', name: '央行征信', type: 'API', status: { v: '正常', kind: 'green' } },
      { id: 'E-002', name: '运营商三要素', type: 'API', status: { v: '正常', kind: 'green' } },
      { id: 'E-003', name: '多头借贷情报', type: 'API', status: { v: '正常', kind: 'green' } },
      { id: 'E-004', name: '设备指纹库', type: '文件', status: { v: '异常', kind: 'red' } },
    ],
  },

  'cr:data-source': {
    title: '数据源管理',
    crumb: '零售信贷风控 / 数据管理',
    subtitle: '数据库 / API 多源异构接入，统一管理与监控。',
    columns: [
      { key: 'id', label: '源编号', width: '120px' },
      { key: 'name', label: '数据源', width: '180px' },
      { key: 'type', label: '类型', width: '110px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'DS-01', name: '核心业务库', type: 'MySQL', status: { v: '正常', kind: 'green' } },
      { id: 'DS-02', name: '征信网关', type: 'API', status: { v: '正常', kind: 'green' } },
      { id: 'DS-03', name: '特征平台', type: 'Hive', status: { v: '正常', kind: 'green' } },
    ],
  },

  'cr:data-field': {
    title: '字段管理',
    crumb: '零售信贷风控 / 数据管理',
    subtitle: '入参/出参标准化定义、衍生字段管理。',
    columns: [
      { key: 'id', label: '字段编号', width: '120px' },
      { key: 'name', label: '字段名', width: '180px' },
      { key: 'io', label: '方向', width: '90px' },
      { key: 'type', label: '类型', width: '100px' },
    ],
    rows: [
      { id: 'F-001', name: 'apply_amount', io: '入参', type: 'number' },
      { id: 'F-002', name: 'id_no', io: '入参', type: 'string' },
      { id: 'F-003', name: 'fraud_score', io: '出参', type: 'number' },
      { id: 'F-004', name: 'credit_score', io: '出参', type: 'number' },
    ],
  },

  'cr:data-api': {
    title: '接口服务配置',
    crumb: '零售信贷风控 / 数据管理',
    subtitle: '服务入参出参映射、调用节点控制。',
    columns: [
      { key: 'id', label: '服务编号', width: '120px' },
      { key: 'name', label: '服务名', width: '180px' },
      { key: 'method', label: '方法', width: '90px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'API-01', name: 'creditApplyDecision', method: 'POST', status: { v: '已发布', kind: 'green' } },
      { id: 'API-02', name: 'midloanMonitorQuery', method: 'GET', status: { v: '已发布', kind: 'green' } },
    ],
  },

  'cr:stat-overview': {
    title: '运行大盘',
    crumb: '零售信贷风控 / 统计报表',
    subtitle: '进件量、TPS、平均耗时等运行状态总览。',
    stats: [
      { label: '今日进件量', value: '12,847', delta: '+6.2%', deltaType: 'up', accent: 'brand' },
      { label: '峰值 TPS', value: '1,284', delta: '+5.1%', deltaType: 'up', accent: 'cyan' },
      { label: '平均耗时', value: '86 ms', delta: '-12ms', deltaType: 'up', accent: 'emerald' },
      { label: '可用性', value: '99.98%', delta: 'SLA 达标', deltaType: 'up', accent: 'violet' },
    ],
    charts: [
      {
        type: 'line',
        title: '今日按小时进件量(TPS)',
        labels: ['09', '10', '11', '12', '13', '14', '15', '16'],
        series: [{ name: 'TPS', color: '#3366ff', data: [620, 880, 1040, 760, 980, 1120, 1284, 1010] }],
      },
    ],
  },

  'cr:stat-rules': {
    title: '命中规则统计',
    crumb: '零售信贷风控 / 统计报表',
    subtitle: '规则命中排行与趋势。',
    charts: [
      {
        type: 'bar',
        title: 'Top 命中规则',
        labels: ['R-2001', 'R-2003', 'R-2008', 'R-2004', 'R-2006'],
        series: [{ name: '命中次数', color: '#3366ff', data: [1288, 1024, 876, 642, 531] }],
      },
    ],
    columns: [
      { key: 'name', label: '规则名称', width: '220px' },
      { key: 'hit', label: '累计命中', type: 'number' as const, align: 'right' as const, width: '110px' },
    ],
    rows: rules.slice(0, 6).map((r) => ({ id: r.id, name: r.name, hit: r.hit })),
  },

  'cr:stat-decision': {
    title: '决策结果分布',
    crumb: '零售信贷风控 / 统计报表',
    subtitle: '通过/拒绝/人工占比趋势。',
    charts: [
      {
        type: 'line',
        title: '近 7 日决策结果占比(%)',
        labels: ['07-12', '07-13', '07-14', '07-15', '07-16', '07-17', '07-18'],
        series: [
          { name: '自动通过', color: '#22c55e', data: [62.1, 62.8, 63.0, 62.4, 63.1, 62.9, 63.2] },
          { name: '自动拒绝', color: '#ef4444', data: [21.2, 21.0, 20.8, 21.5, 20.9, 21.3, 21.5] },
          { name: '人工占比', color: '#f59e0b', data: [16.7, 16.2, 16.2, 16.1, 16.0, 15.8, 15.3] },
        ],
        unit: '%',
      },
    ],
  },

  'cr:set-users': {
    title: '用户与角色',
    crumb: '零售信贷风控 / 系统设置',
    subtitle: '基于 RBAC 的用户/角色/资源权限管理。',
    columns: [
      { key: 'id', label: '账号', width: '140px' },
      { key: 'name', label: '姓名', width: '110px' },
      { key: 'role', label: '角色', type: 'badge' as const, width: '120px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'admin', name: '系统管理员', role: { v: '风控管理员', kind: 'violet' }, status: { v: '启用', kind: 'green' } },
      { id: 'risk01', name: '风控审核员', role: { v: '风控审核', kind: 'blue' }, status: { v: '启用', kind: 'green' } },
      { id: 'op01', name: '运营专员', role: { v: '客群运营', kind: 'cyan' }, status: { v: '启用', kind: 'green' } },
    ],
  },

  'cr:set-channel': {
    title: '渠道 / 产品管理',
    crumb: '零售信贷风控 / 系统设置',
    subtitle: '渠道、产品、事件管理。',
    columns: [
      { key: 'id', label: '编号', width: '120px' },
      { key: 'name', label: '名称', width: '160px' },
      { key: 'type', label: '类型', width: '110px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'C-01', name: '自有APP', type: '渠道', status: { v: '启用', kind: 'green' } },
      { id: 'P-01', name: '消费分期', type: '产品', status: { v: '启用', kind: 'green' } },
      { id: 'P-02', name: '现金贷', type: '产品', status: { v: '启用', kind: 'green' } },
    ],
  },

  'cr:set-log': {
    title: '操作日志',
    crumb: '零售信贷风控 / 系统设置',
    subtitle: '操作日志与审计。',
    columns: [
      { key: 'id', label: '日志号', width: '130px' },
      { key: 'user', label: '操作人', width: '130px' },
      { key: 'action', label: '操作', width: '200px' },
      { key: 'time', label: '时间', type: 'datetime' as const, width: '160px' },
    ],
    rows: [
      { id: 'LG-001', user: 'admin', action: '发布决策流 F-001 v2.3', time: '2026-07-18 08:30' },
      { id: 'LG-002', user: 'risk01', action: '复核进件 J2026071800007', time: '2026-07-18 09:12' },
      { id: 'LG-003', user: 'op01', action: '导出监测报表', time: '2026-07-18 10:05' },
    ],
  },
}
