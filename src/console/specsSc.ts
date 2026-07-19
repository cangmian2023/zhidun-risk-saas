import type { ModuleSpec } from './menus'
import { models } from './data'

export const scSpecs: Record<string, ModuleSpec> = {
  'sc:overview': {
    title: '概览看板',
    crumb: '评分产品',
    subtitle: '各评分产品调用量、命中高风险占比、评分分布趋势与监控异常提醒。',
    stats: [
      { label: '今日调用量', value: '3,842万', delta: '+4.7%', deltaType: 'up', accent: 'brand' },
      { label: '智察分命中高风险', value: '8.1%', delta: '+0.6pp', deltaType: 'down', accent: 'rose' },
      { label: '智信分拒绝占比', value: '12.4%', delta: '-0.5pp', deltaType: 'up', accent: 'emerald' },
      { label: '监控异常', value: '2 项', delta: 'PSI偏移', deltaType: 'flat', accent: 'amber' },
    ],
    charts: [
      {
        type: 'bar',
        title: '各评分产品今日调用量(万)',
        labels: ['智察分', '智信分', '智融分'],
        series: [{ name: '调用量', color: '#3366ff', data: [1642, 1480, 720] }],
      },
      {
        type: 'line',
        title: '近 7 日智察分高风险占比(%)',
        labels: ['07-12', '07-13', '07-14', '07-15', '07-16', '07-17', '07-18'],
        series: [{ name: '高风险占比', color: '#ef4444', data: [7.2, 7.5, 7.9, 7.6, 8.0, 8.3, 8.1] }],
        unit: '%',
      },
    ],
    columns: [
      { key: 'name', label: '评分产品', width: '140px' },
      { key: 'call', label: '今日调用', align: 'right' as const, width: '120px' },
      { key: 'high', label: '高风险占比', type: 'percent' as const, align: 'right' as const, width: '130px' },
      { key: 'status', label: '监控', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'p1', name: '智察分(欺诈)', call: '1642万', high: 8.1, status: { v: '正常', kind: 'green' } },
      { id: 'p2', name: '智信分(违约)', call: '1480万', high: 12.4, status: { v: '正常', kind: 'green' } },
      { id: 'p3', name: '智融分(综合)', call: '720万', high: 9.6, status: { v: 'PSI偏移', kind: 'amber' } },
    ],
    note: '监控异常：智融分近 7 日 PSI 偏移超阈值，建议复核特征稳定性。',
  },

  'sc:zhicha-batch': {
    title: '智察分 · 批量评分',
    crumb: '评分产品 / 智察分',
    subtitle: '文件批量计算欺诈分（0~100，越高风险越高），支持结果下载与订阅。',
    columns: [
      { key: 'id', label: '任务号', width: '130px' },
      { key: 'name', label: '文件名', width: '180px' },
      { key: 'cnt', label: '记录数', align: 'right' as const, width: '110px' },
      { key: 'avg', label: '平均分', align: 'right' as const, width: '100px' },
      { key: 'high', label: '高风险数', align: 'right' as const, width: '110px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'B-2607-01', name: '20260717_申贷批量.csv', cnt: 125000, avg: 21.4, high: 10125, status: { v: '完成', kind: 'green' } },
      { id: 'B-2607-02', name: '20260718_早批.csv', cnt: 64200, avg: 19.8, high: 5203, status: { v: '完成', kind: 'green' } },
      { id: 'B-2607-03', name: '渠道A_导流.csv', cnt: 30000, avg: 34.6, high: 6120, status: { v: '计算中', kind: 'amber' } },
    ],
  },

  'sc:zhicha-api': {
    title: '智察分 · API 调用',
    crumb: '评分产品 / 智察分',
    subtitle: '实时接口对接，输入个人标识获取欺诈风险分（0~100）。',
    columns: [
      { key: 'ep', label: '接口', width: '220px' },
      { key: 'method', label: '方法', width: '90px' },
      { key: 'qps', label: '峰值 QPS', align: 'right' as const, width: '120px' },
      { key: 'sla', label: 'SLA', width: '100px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'a1', ep: 'POST /v3/zhicha/score', method: 'POST', qps: 1284, sla: '99.98%', status: { v: '正常', kind: 'green' } },
      { id: 'a2', ep: 'POST /v3/zhicha/batch', method: 'POST', qps: 96, sla: '99.95%', status: { v: '正常', kind: 'green' } },
    ],
    note: '请求示例：{"id_no":"3201**********1234","mobile":"138****5678"} → 返回 fraud_score: 78, risk_level: "高"。',
  },

  'sc:zhixin-batch': {
    title: '智信分 · 批量评分',
    crumb: '评分产品 / 智信分',
    subtitle: '文件批量计算违约评分（300~900，越高违约概率越低）。',
    columns: [
      { key: 'id', label: '任务号', width: '130px' },
      { key: 'name', label: '文件名', width: '180px' },
      { key: 'cnt', label: '记录数', align: 'right' as const, width: '110px' },
      { key: 'avg', label: '平均分', align: 'right' as const, width: '100px' },
      { key: 'reject', label: '建议拒绝', align: 'right' as const, width: '120px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'B-2607-11', name: '20260717_信用卡.csv', cnt: 98000, avg: 701, reject: 12150, status: { v: '完成', kind: 'green' } },
      { id: 'B-2607-12', name: '20260718_消费贷.csv', cnt: 54000, avg: 688, reject: 6700, status: { v: '完成', kind: 'green' } },
    ],
  },

  'sc:zhixin-api': {
    title: '智信分 · API 调用',
    crumb: '评分产品 / 智信分',
    subtitle: '实时接口对接，输入个人标识获取违约风险分（300~900）。',
    columns: [
      { key: 'ep', label: '接口', width: '220px' },
      { key: 'method', label: '方法', width: '90px' },
      { key: 'qps', label: '峰值 QPS', align: 'right' as const, width: '120px' },
      { key: 'sla', label: 'SLA', width: '100px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'a1', ep: 'POST /v3/zhixin/score', method: 'POST', qps: 1120, sla: '99.97%', status: { v: '正常', kind: 'green' } },
    ],
    note: '请求示例：{"id_no":"...","apply_product":"消费分期"} → 返回 credit_score: 712, default_prob: 0.043。',
  },

  'sc:zhirong-batch': {
    title: '智融分 · 批量评分',
    crumb: '评分产品 / 智融分',
    subtitle: '融合多方面信息的综合评分批量计算，覆盖违约风险审核、授信转化与借贷兴趣场景。',
    columns: [
      { key: 'id', label: '任务号', width: '130px' },
      { key: 'name', label: '文件名', width: '180px' },
      { key: 'cnt', label: '记录数', align: 'right' as const, width: '110px' },
      { key: 'avg', label: '平均分', align: 'right' as const, width: '100px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'B-2607-21', name: '20260718_综合评测.csv', cnt: 42000, avg: 655, status: { v: '完成', kind: 'green' } },
      { id: 'B-2607-22', name: '授信转化样本.csv', cnt: 18000, avg: 672, status: { v: '计算中', kind: 'amber' } },
    ],
  },

  'sc:zhirong-api': {
    title: '智融分 · API 调用',
    crumb: '评分产品 / 智融分',
    subtitle: '实时接口对接，输出综合评分与风险/价值双维评估。',
    columns: [
      { key: 'ep', label: '接口', width: '220px' },
      { key: 'method', label: '方法', width: '90px' },
      { key: 'qps', label: '峰值 QPS', align: 'right' as const, width: '120px' },
      { key: 'sla', label: 'SLA', width: '100px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'a1', ep: 'POST /v3/zhirong/score', method: 'POST', qps: 540, sla: '99.96%', status: { v: '正常', kind: 'green' } },
    ],
  },

  'sc:model-list': {
    title: '模型列表',
    crumb: '评分产品 / 评分模型管理',
    subtitle: '智察/智信/智融及其版本，模型状态与性能指标。',
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

  'sc:model-config': {
    title: '模型配置',
    crumb: '评分产品 / 评分模型管理',
    subtitle: '模型参数、好坏客户定义（不同产品“坏”定义不同）、阈值与风险分层配置。',
    columns: [
      { key: 'id', label: '模型', width: '140px' },
      { key: 'bad', label: '坏定义', width: '200px' },
      { key: 'th', label: '拒绝阈值', align: 'right' as const, width: '120px' },
      { key: 'layer', label: '风险分层', width: '160px' },
    ],
    rows: [
      { id: '智察分', bad: '欺诈确认/疑似欺诈', th: '≥70(欺诈)', layer: '低/中/高 三档' },
      { id: '智信分', bad: '放款后 90 天 M3+', th: '≤580(拒绝)', layer: 'A/B/C/D/E 五档' },
      { id: '智融分', bad: '违约 or 低转化', th: '≤600(审慎)', layer: '价值×风险 九宫格' },
    ],
  },

  'sc:scorecard': {
    title: '评分卡管理',
    crumb: '评分产品 / 评分模型管理',
    subtitle: '标准/专家评分卡查看与编辑，评分项权重配置与测试。',
    columns: [
      { key: 'id', label: '评分卡', width: '160px' },
      { key: 'vars', label: '评分项', align: 'right' as const, width: '100px' },
      { key: 'w', label: '权重合计', type: 'progress' as const, progressColor: 'bg-brand-500', width: '200px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: '智信分_标准评分卡', vars: 28, w: 100, status: { v: '已发布', kind: 'green' } },
      { id: '智信分_专家评分卡', vars: 16, w: 100, status: { v: '评审中', kind: 'amber' } },
      { id: '智融分_融合评分卡', vars: 34, w: 100, status: { v: '已发布', kind: 'green' } },
    ],
  },

  'sc:variable': {
    title: '特征 / 变量管理',
    crumb: '评分产品 / 评分模型管理',
    subtitle: '特征列表与衍生，单特征稳定性观测（CSI，特征偏移分析）。',
    columns: [
      { key: 'id', label: '变量编号', width: '130px' },
      { key: 'name', label: '变量名', width: '200px' },
      { key: 'csi', label: 'CSI', align: 'right' as const, width: '100px' },
      { key: 'stable', label: '稳定性', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'V-001', name: '近30天申贷平台数', csi: 0.08, stable: { v: '稳定', kind: 'green' } },
      { id: 'V-002', name: '负债收入比', csi: 0.12, stable: { v: '稳定', kind: 'green' } },
      { id: 'V-003', name: '设备环境风险分', csi: 0.31, stable: { v: '偏移', kind: 'amber' } },
      { id: 'V-004', name: '共债机构数', csi: 0.19, stable: { v: '关注', kind: 'amber' } },
    ],
  },

  'sc:mon-auto': {
    title: '自动化监控',
    crumb: '评分产品 / 监控中心',
    subtitle: '高频自动监控评分分布与异常，异常时触发模型调优提示；监控任务管理（准实时/日报/周报）。',
    stats: [
      { label: '监控任务', value: '9 个', delta: '运行中 8', deltaType: 'up', accent: 'brand' },
      { label: '今日异常', value: '2 项', delta: 'PSI/CSI', deltaType: 'flat', accent: 'amber' },
      { label: '平均分布漂移', value: '0.06', delta: '-0.01', deltaType: 'up', accent: 'emerald' },
      { label: '调优触发', value: '1 次', delta: '智融分', deltaType: 'flat', accent: 'violet' },
    ],
    charts: [
      {
        type: 'line',
        title: '智信分评分分布均值(近7日)',
        labels: ['07-12', '07-13', '07-14', '07-15', '07-16', '07-17', '07-18'],
        series: [{ name: '平均分', color: '#3366ff', data: [698, 700, 699, 701, 700, 702, 701] }],
      },
    ],
    columns: [
      { key: 'id', label: '任务', width: '160px' },
      { key: 'model', label: '模型', width: '120px' },
      { key: 'freq', label: '频率', width: '100px' },
      { key: 'last', label: '上次运行', type: 'datetime' as const, width: '160px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'M-智信分-日报', model: '智信分', freq: '日报', last: '2026-07-18 02:00', status: { v: '正常', kind: 'green' } },
      { id: 'M-智察分-准实时', model: '智察分', freq: '准实时', last: '2026-07-18 15:10', status: { v: '正常', kind: 'green' } },
      { id: 'M-智融分-周报', model: '智融分', freq: '周报', last: '2026-07-14 03:00', status: { v: 'PSI偏移', kind: 'amber' } },
    ],
  },

  'sc:mon-stability': {
    title: '稳定性监控（PSI / CSI）',
    crumb: '评分产品 / 监控中心',
    subtitle: 'PSI 群体稳定性（评分分布偏移，超阈值预警）；CSI 特征稳定性（单特征分布变化及影响）。',
    charts: [
      {
        type: 'line',
        title: '智信分 PSI（阈值 0.25）',
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
        series: [{ name: 'PSI', color: '#8b5cf6', data: [0.08, 0.11, 0.14, 0.12, 0.17, 0.21, 0.19] }],
      },
    ],
    columns: [
      { key: 'id', label: '模型', width: '140px' },
      { key: 'psi', label: 'PSI', align: 'right' as const, width: '100px' },
      { key: 'csi', label: 'CSI(均值)', align: 'right' as const, width: '120px' },
      { key: 'base', label: '基线偏差', type: 'badge' as const, width: '110px' },
    ],
    rows: [
      { id: '智察分', psi: 0.16, csi: 0.14, base: { v: '正常', kind: 'green' } },
      { id: '智信分', psi: 0.19, csi: 0.12, base: { v: '正常', kind: 'green' } },
      { id: '智融分', psi: 0.31, csi: 0.27, base: { v: '超阈值', kind: 'red' } },
    ],
    note: '智融分 PSI=0.31 超 0.25 阈值，已触发预警，建议复核特征 V-003 设备环境风险分。',
  },

  'sc:mon-disc': {
    title: '区分力监控',
    crumb: '评分产品 / 监控中心',
    subtitle: 'KS / AUC 等区分能力指标监控，支持坏定义灵活配置下的区分力观测。',
    charts: [
      {
        type: 'line',
        title: '智信分 KS（近 7 周）',
        labels: ['W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'],
        series: [{ name: 'KS', color: '#22c55e', data: [0.43, 0.44, 0.42, 0.43, 0.41, 0.42, 0.41] }],
      },
    ],
    columns: [
      { key: 'id', label: '模型', width: '140px' },
      { key: 'auc', label: 'AUC', align: 'right' as const, width: '100px' },
      { key: 'ks', label: 'KS', align: 'right' as const, width: '100px' },
      { key: 'trend', label: '趋势', width: '100px' },
    ],
    rows: [
      { id: '智察分', auc: 0.92, ks: 0.45, trend: '平稳' },
      { id: '智信分', auc: 0.88, ks: 0.41, trend: '略降' },
      { id: '智融分', auc: 0.85, ks: 0.38, trend: '略降' },
    ],
  },

  'sc:mon-alert': {
    title: '预警规则与通知',
    crumb: '评分产品 / 监控中心',
    subtitle: '预警规则配置（阈值、监控周期），通知渠道邮件/企微/短信触达业务人员。',
    columns: [
      { key: 'id', label: '规则', width: '200px' },
      { key: 'cond', label: '条件', width: '180px' },
      { key: 'channel', label: '通知渠道', width: '160px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'R-PSI', name: 'PSI 超阈值', cond: 'PSI>0.25', channel: '企微+短信', status: { v: '启用', kind: 'green' } },
      { id: 'R-CSI', name: '单特征 CSI 偏移', cond: 'CSI>0.25', channel: '邮件', status: { v: '启用', kind: 'green' } },
      { id: 'R-KS', name: '区分力下降', cond: 'KS 周降幅>0.03', channel: '企微', status: { v: '停用', kind: 'gray' } },
    ].map((r) => ({ id: r.id, name: r.name, cond: r.cond, channel: r.channel, status: r.status })),
  },

  'sc:mon-report': {
    title: '监控报表',
    crumb: '评分产品 / 监控中心',
    subtitle: '自动生成监控报表，变量稳定性、评分稳定性、区分力报表整合展示。',
    columns: [
      { key: 'id', label: '报表', width: '200px' },
      { key: 'cycle', label: '周期', width: '100px' },
      { key: 'range', label: '覆盖', width: '160px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: '稳定性周报', cycle: '周报', range: '全模型', status: { v: '已生成', kind: 'green' } },
      { id: '区分力月报', cycle: '月报', range: '全模型', status: { v: '待生成', kind: 'amber' } },
    ],
  },

  'sc:data-source': {
    title: '数据源管理',
    crumb: '评分产品 / 数据管理',
    subtitle: '评分所需数据源接入与管理（与零售信贷风控共享底座）。',
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

  'sc:data-list': {
    title: '名单管理',
    crumb: '评分产品 / 数据管理',
    subtitle: '评分相关黑/白/灰名单维护。',
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
    ],
  },

  'sc:data-api': {
    title: '接口服务配置',
    crumb: '评分产品 / 数据管理',
    subtitle: '评分服务入参出参映射与调用节点控制。',
    columns: [
      { key: 'id', label: '服务编号', width: '120px' },
      { key: 'name', label: '服务名', width: '180px' },
      { key: 'method', label: '方法', width: '90px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'API-01', name: 'zhichaScore', method: 'POST', status: { v: '已发布', kind: 'green' } },
      { id: 'API-02', name: 'zhixinScore', method: 'POST', status: { v: '已发布', kind: 'green' } },
      { id: 'API-03', name: 'zhirongScore', method: 'POST', status: { v: '已发布', kind: 'green' } },
    ],
  },

  'sc:report-dist': {
    title: '评分分布分析',
    crumb: '评分产品 / 报表中心',
    subtitle: '各分段客户数分布。',
    charts: [
      {
        type: 'bar',
        title: '智信分分段客户数',
        labels: ['300-500', '500-600', '600-700', '700-800', '800-900'],
        series: [{ name: '客户数(万)', color: '#3366ff', data: [12.4, 28.6, 86.2, 74.1, 32.7] }],
      },
    ],
  },

  'sc:report-reject': {
    title: '拒绝原因分析',
    crumb: '评分产品 / 报表中心',
    subtitle: '拒绝客户命中因素归因。',
    charts: [
      {
        type: 'donut',
        title: '拒绝原因构成',
        centerLabel: '拒绝客户',
        centerValue: '1,842',
        donut: [
          { label: '智信分过低', value: 920, color: '#ef4444' },
          { label: '智察分过高', value: 510, color: '#f59e0b' },
          { label: '规则命中', value: 290, color: '#8b5cf6' },
          { label: '名单命中', value: 122, color: '#22c55e' },
        ],
      },
    ],
  },

  'sc:report-vintage': {
    title: 'Vintage 分析',
    crumb: '评分产品 / 报表中心',
    subtitle: '账龄/成熟度分析，观测不同入催账龄的违约演变。',
    charts: [
      {
        type: 'line',
        title: '各月入催账龄 M3+ 逾期率(%)',
        labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
        series: [
          { name: '2026-01 账期', color: '#3366ff', data: [0.4, 1.1, 2.0, 2.6, 2.9, 3.0] },
          { name: '2026-03 账期', color: '#8b5cf6', data: [0.3, 0.9, 1.6, 2.1, 2.4, 2.5] },
        ],
        unit: '%',
      },
    ],
  },

  'sc:report-approve': {
    title: '额度 / 批准率分析',
    crumb: '评分产品 / 报表中心',
    subtitle: '额度监控与批准率分析。',
    charts: [
      {
        type: 'bar',
        title: '各风险分层批准率(%)',
        labels: ['A', 'B', 'C', 'D', 'E'],
        series: [{ name: '批准率', color: '#22c55e', data: [98, 92, 78, 54, 21] }],
      },
    ],
  },

  'sc:set-users': {
    title: '用户与角色',
    crumb: '评分产品 / 系统设置',
    subtitle: '基于 RBAC 的权限管理。',
    columns: [
      { key: 'id', label: '账号', width: '140px' },
      { key: 'name', label: '姓名', width: '110px' },
      { key: 'role', label: '角色', type: 'badge' as const, width: '120px' },
      { key: 'status', label: '状态', type: 'badge' as const, width: '100px' },
    ],
    rows: [
      { id: 'admin', name: '系统管理员', role: { v: '风控管理员', kind: 'violet' }, status: { v: '启用', kind: 'green' } },
      { id: 'risk01', name: '风控审核员', role: { v: '风控审核', kind: 'blue' }, status: { v: '启用', kind: 'green' } },
    ],
  },

  'sc:set-log': {
    title: '操作日志',
    crumb: '评分产品 / 系统设置',
    subtitle: '评分产品操作日志与审计。',
    columns: [
      { key: 'id', label: '日志号', width: '130px' },
      { key: 'user', label: '操作人', width: '130px' },
      { key: 'action', label: '操作', width: '200px' },
      { key: 'time', label: '时间', type: 'datetime' as const, width: '160px' },
    ],
    rows: [
      { id: 'SL-001', user: 'admin', action: '发布智信分 V4.0', time: '2026-05-18 10:00' },
      { id: 'SL-002', user: 'risk01', action: '查询智察分批量任务', time: '2026-07-18 09:30' },
    ],
  },
}
