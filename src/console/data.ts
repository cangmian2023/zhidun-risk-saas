import type { Row } from '../components/ui'

/* ============ 格式化 / 脱敏工具 ============ */
export const fmt = {
  money: (n: number) => '¥' + n.toLocaleString('zh-CN'),
  pct: (n: number) => n.toFixed(1) + '%',
}
export function maskName(name: string) {
  return name.length <= 1 ? name : name[0] + '*'.repeat(name.length - 1)
}
export function maskId(id: string) {
  return id.slice(0, 4) + '**********' + id.slice(-4)
}
export function maskPhone(p: string) {
  return p.slice(0, 3) + '****' + p.slice(-4)
}

/* ============ 基础样本数据集 ============ */
const names = ['张伟', '王芳', '李娜', '刘强', '陈静', '杨洋', '赵磊', '黄敏', '周杰', '吴婷', '徐勇', '孙丽', '马超', '朱琳', '胡军', '郭涛', '林峰', '何静', '高翔', '罗刚']
const products = ['消费分期', '现金贷', '信用卡', '汽车金融', '经营贷', '助学贷']
const channels = ['自有APP', '合作渠道A', '线下门店', '微信小程序', '第三方导流']
const decisions: { v: string; kind: string }[] = [
  { v: '自动通过', kind: 'green' },
  { v: '自动拒绝', kind: 'red' },
  { v: '转人工', kind: 'amber' },
  { v: '人工通过', kind: 'blue' },
  { v: '人工拒绝', kind: 'red' },
]
const times = ['2026-07-18 09:12', '2026-07-18 10:03', '2026-07-18 11:21', '2026-07-18 13:45', '2026-07-18 14:30', '2026-07-18 15:08', '2026-07-17 16:22', '2026-07-17 18:40']

export const applications: Row[] = names.slice(0, 18).map((nm, i) => {
  const d = decisions[i % decisions.length]
  const fraud = 8 + ((i * 7) % 88)
  const credit = 420 + ((i * 53) % 470)
  return {
    id: 'J' + (2026071800001 + i),
    name: maskName(nm),
    idNo: maskId('3201' + (199000000000 + i * 137) + '1234'),
    phone: maskPhone('138' + (10000000 + i * 911111)),
    product: products[i % products.length],
    channel: channels[i % channels.length],
    amount: [5000, 12000, 30000, 80000, 150000, 5000][i % 6],
    applyTime: times[i % times.length],
    fraudScore: fraud,
    creditScore: credit,
    decision: { v: d.v, kind: d.kind },
    operator: i % 4 === 0 ? '系统自动' : '审核员' + ((i % 6) + 1),
  }
})

const alertLevels: { v: string; kind: string }[] = [
  { v: '红灯', kind: 'red' },
  { v: '黄灯', kind: 'amber' },
]
const triggers = ['多头借贷激增', '设备环境异常', '共债攀升', '信用评分恶化', '活跃度骤降', '同设备多账号', '异地高频申请']
const suggestions: { v: string; kind: string }[] = [
  { v: '建议降额', kind: 'red' },
  { v: '建议预催', kind: 'orange' },
  { v: '持续关注', kind: 'amber' },
  { v: '建议挽留', kind: 'blue' },
]
export const alerts: Row[] = names.slice(2, 17).map((nm, i) => {
  const lv = alertLevels[i % 2]
  const sg = suggestions[i % suggestions.length]
  return {
    id: 'A' + (2026071800001 + i),
    name: maskName(nm),
    level: { v: lv.v, kind: lv.kind },
    trigger: triggers[i % triggers.length],
    product: products[i % products.length],
    suggestion: { v: sg.v, kind: sg.kind },
    monitorTime: times[(i + 1) % times.length],
  }
})

const scenes = ['贷中风控', '存量客群运营', '贷前准入', '预授信']
const freqs = ['日频', '周频', '实时', 'T+1']
export const monitorTasks: Row[] = scenes.map((s, i) => ({
  id: 'T' + (1001 + i),
  name: s + '监测任务' + (i + 1),
  scene: s,
  product: products[i % products.length],
  freq: freqs[i % freqs.length],
  indicators: 6 + (i % 9),
  status: i % 3 === 0 ? { v: '已暂停', kind: 'gray' } : { v: '运行中', kind: 'green' },
  lastRun: times[i % times.length],
  coverage: (12 + i * 7) + '万',
}))

const ruleTypes = ['规则表', '决策树', '决策矩阵']
export const rules: Row[] = [
  '近30天申贷平台数≥5',
  '同设备关联账号≥3',
  '身份证三要素不一致',
  '命中外部黑灰名单',
  '负债收入比>70%',
  '活体检测失败',
  '异地登录且高频申请',
  '共债机构数≥4',
].map((nm, i) => ({
  id: 'R' + (2001 + i),
  name: nm,
  type: ruleTypes[i % ruleTypes.length],
  hit: 120 + i * 37,
  passRate: (38 + (i * 5) % 50),
  status: i % 5 === 0 ? { v: '停用', kind: 'gray' } : { v: '启用', kind: 'green' },
  updated: times[i % times.length],
}))

export const models: Row[] = [
  { id: 'M-智察分', name: '智察分 V3.2', type: '欺诈评分', status: { v: '上线', kind: 'green' }, auc: 0.92, ks: 0.45, lastTrain: '2026-06-20' },
  { id: 'M-智信分', name: '智信分 V4.0', type: '违约评分', status: { v: '上线', kind: 'green' }, auc: 0.88, ks: 0.41, lastTrain: '2026-05-18' },
  { id: 'M-智融分', name: '智融分 V2.1', type: '综合评分', status: { v: '上线', kind: 'green' }, auc: 0.85, ks: 0.38, lastTrain: '2026-04-30' },
  { id: 'M-设备分', name: '设备风险分 V1.4', type: '设备指纹', status: { v: '验证', kind: 'amber' }, auc: 0.79, ks: 0.33, lastTrain: '2026-07-02' },
  { id: 'M-共债', name: '共债预警模型 V1.0', type: '关系网络', status: { v: '训练', kind: 'blue' }, auc: 0.81, ks: 0.36, lastTrain: '2026-07-10' },
]
