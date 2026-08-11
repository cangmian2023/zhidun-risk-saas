/* ============================================================================
 * 评分模型 · 决策图（真实结构，用于「算法编辑 · 可视化」只读画板）
 *
 * 这是每个模型真实的【决策图 / 策略树】，不是示意：
 *   - 多数据源并行接入
 *   - 多个子分模型 / 特征变换并行运算（如智融融合智察+智信+兴趣+资产）
 *   - 多套规则集（黑灰名单 / 设备行为 / 信用 / 综合），每套是具体规则
 *   - 「规则碰撞 · 冲突裁决」节点：当多条规则同时命中产生冲突时，如何裁决、
 *     并由此生成什么预警 —— 这正是模型配置阶段必须表达、却常被画成单线漏掉的部分
 *   - 阈值分支决策 → 输出分数
 *
 * 所有节点里的因子权重、规则名与命中次数、阈值动作，均来自 scoreData.json /
 * ruleHub.json 的真实配置（与模型详情、命中分析、评分阈值页同源）。
 * ========================================================================= */
import type { ScoreProd } from './scoreData'

export type GNodeType = 'source' | 'transform' | 'model' | 'ruleset' | 'collision' | 'decision' | 'output'

export interface GNode {
  id: string
  type: GNodeType
  title: string
  subtitle?: string
  meta?: string[]
  badge?: string
  x: number
  y: number
}

export interface GEdge {
  from: string
  to: string
  label?: string
  dashed?: boolean
}

export interface GGraph {
  width: number
  height: number
  nodes: GNode[]
  edges: GEdge[]
}

export const NODE_W = 212
export const NODE_H = 116

export const GNODE_META: Record<GNodeType, { label: string; color: string }> = {
  source: { label: '数据源', color: '#0EA5E9' },
  transform: { label: '特征变换', color: '#8B5CF6' },
  model: { label: '模型 / 子分', color: '#334155' },
  ruleset: { label: '规则集', color: '#F59E0B' },
  collision: { label: '规则碰撞 · 冲突裁决', color: '#E11D48' },
  decision: { label: '阈值决策', color: '#475569' },
  output: { label: '评分输出', color: '#16A34A' },
}

export const MODEL_DECISION_GRAPH: Record<ScoreProd, GGraph> = {
  /* ============ 智察分（反欺诈：XGBoost + 黑灰名单硬拦截 + 设备行为规则） ============ */
  zhicha: {
    width: 1250,
    height: 640,
    nodes: [
      { id: 's1', type: 'source', title: '百行多头借贷查询', subtitle: '标准化输入', meta: ['近30天申贷平台数'], x: 24, y: 36 },
      { id: 's2', type: 'source', title: '设备指纹库', subtitle: '标准化输入', meta: ['设备环境风险'], x: 24, y: 168 },
      { id: 's3', type: 'source', title: '内部黑灰名单', subtitle: '硬拦截源', meta: ['命中黑灰名单'], x: 24, y: 300 },
      { id: 's4', type: 'source', title: '央行征信 · 负债', subtitle: '标准化输入', meta: ['负债收入比'], x: 24, y: 432 },
      { id: 't1', type: 'transform', title: '特征工程 · 标准化', subtitle: '缺失值 / 编码 / 归一', x: 276, y: 234, meta: ['5 维特征 → 模型输入'] },
      { id: 'm1', type: 'model', title: 'XGBoost 反欺诈模型', subtitle: '梯度提升树', badge: '5 因子', x: 516, y: 96,
        meta: ['近30天申贷平台数 0.28', '设备环境风险 0.22', '命中黑灰名单 0.20', '同设备关联账号 0.18', '负债收入比 0.12'] },
      { id: 'r1', type: 'ruleset', title: '黑灰名单规则集', subtitle: '硬拦截', badge: '封顶拒绝', x: 516, y: 336,
        meta: ['命中外部黑灰名单 → 分数封顶 95（拒绝）'] },
      { id: 'r2', type: 'ruleset', title: '设备行为规则集', subtitle: '风险加权', badge: '2 规则', x: 516, y: 472,
        meta: ['设备模拟器特征命中', '近30天申贷平台数≥5'] },
      { id: 'c1', type: 'collision', title: '规则碰撞 · 冲突裁决', subtitle: '逐条规则 · 满足条件即触发', badge: '3 条规则', x: 776, y: 250,
        meta: ['【za-1】黑灰名单命中 → 强制拒绝（覆盖分数）', '【za-2】XGB中风险(40-69)∩设备模拟器命中 → 升级高风险预警', '【za-3】结果冲突 → 生成「欺诈覆盖」预警', '可能裁决类型：拦截优先 / 分数优先 / 转人工'] },
      { id: 'd1', type: 'decision', title: '阈值决策', subtitle: '三段分级', badge: '3 档', x: 1004, y: 200,
        meta: ['0-39 自动通过', '40-69 转人工复核', '70-100 拒绝 / 强化核验'] },
      { id: 'o1', type: 'output', title: '智察分输出', subtitle: '0 – 100', badge: '0-100', x: 1004, y: 392, meta: ['最终输出：0–100 分，三段授信决策（见阈值决策）'] },
    ],
    edges: [
      { from: 's1', to: 't1' }, { from: 's2', to: 't1' }, { from: 's4', to: 't1' },
      { from: 's3', to: 'r1' },
      { from: 't1', to: 'm1' },
      { from: 'm1', to: 'c1' }, { from: 'r1', to: 'c1' }, { from: 'r2', to: 'c1' },
      { from: 'c1', to: 'd1' }, { from: 'd1', to: 'o1' },
    ],
  },

  /* ============ 智信分（信用评分卡：分箱&WOE → 逻辑回归 → 信用规则集） ============ */
  zhixin: {
    width: 1250,
    height: 720,
    nodes: [
      { id: 's1', type: 'source', title: '历史逾期记录', subtitle: '央行征信报告', meta: ['近2年 M3+ 次数'], x: 24, y: 36 },
      { id: 's2', type: 'source', title: '负债收入比', subtitle: '收入与负债材料', meta: ['负债收入比（%）'], x: 24, y: 168 },
      { id: 's3', type: 'source', title: '收入稳定性', subtitle: '收入与负债材料', meta: ['连续按时还款月数'], x: 24, y: 300 },
      { id: 's4', type: 'source', title: '征信查询频次', subtitle: '信贷查询记录', meta: ['近6月查询次数'], x: 24, y: 432 },
      { id: 's5', type: 'source', title: '授信使用率', subtitle: '信用卡授信账户', meta: ['授信使用率（%）'], x: 24, y: 564 },
      { id: 't1', type: 'transform', title: '分箱 & WOE 编码', subtitle: '特征分箱 · 证据权重', x: 276, y: 252, meta: ['连续特征 → 分箱（切区间）', '每个箱算 WOE（证据权重）', 'WOE × 回归系数 → m1 的加分'] },
      { id: 'm1', type: 'model', title: '逻辑回归评分卡', subtitle: '基础分 600 + 各因子查表加分', badge: '基础分600', x: 516, y: 144,
        meta: ['基础分 600 + 各因子查表加分（与 model-trace.html 推演同源）',
          '历史逾期: 0次+48 / 1次+30 / 2次0 / ≥3次−48',
          '负债比: ≤40 +44 / 41-60 +26 / 61-70 −10 / >70 −44',
          '收入稳定: ≥24月+40 / 12-23月+28 / 6-11月−5 / <6月−40',
          '征信查询: ≤4次+40 / 5-9次+16 / 10-15次−22 / >15次−40',
          '授信使用: ≤30% +36 / 31-50% +12 / 51-70% −14 / >70% −36',
          '合计 = 600 + Σ加分，裁剪 [300,900]'] },
      { id: 'r1', type: 'ruleset', title: '信用规则集', subtitle: '硬规则', badge: '3 规则', x: 516, y: 372,
        meta: ['历史 M3+ 逾期≥2 → 拒绝', '负债收入比≥70% → 审慎', '征信月查询≥10 → 关注'] },
      { id: 'c1', type: 'collision', title: '规则碰撞 · 冲突裁决', subtitle: '逐条规则 · 满足条件即触发', badge: '2 条规则', x: 776, y: 250,
        meta: ['【zx-1】提额意图 ∩ 历史 M3+ 逾期≥2 → 拒绝优先·转人工', '【zx-2】负债≥70% ∩ 标准额度 → 降审慎授信', '可能裁决类型：拦截优先 / 分数优先 / 转人工'] },
      { id: 'd1', type: 'decision', title: '阈值决策', subtitle: '四段分级', badge: '4 档', x: 1004, y: 220,
        meta: ['300-540 拒绝', '541-660 审慎授信', '661-780 标准额度', '781-900 提额 + 优先经营'] },
      { id: 'o1', type: 'output', title: '智信分输出', subtitle: '300 – 900', badge: '300-900', x: 1004, y: 412, meta: ['最终输出：300–900 分，四档授信决策（见阈值决策）'] },
    ],
    edges: [
      { from: 's1', to: 't1' }, { from: 's2', to: 't1' }, { from: 's3', to: 't1' }, { from: 's4', to: 't1' }, { from: 's5', to: 't1' },
      { from: 't1', to: 'm1' },
      { from: 'm1', to: 'c1' }, { from: 'r1', to: 'c1' },
      { from: 'c1', to: 'd1' }, { from: 'd1', to: 'o1' },
    ],
  },

  /* ============ 智融分（综合：违约维度+兴趣+转化+资产 加权融合 + 跨模型碰撞） ============ */
  zhirong: {
    width: 1280,
    height: 800,
    nodes: [
      { id: 's1', type: 'source', title: '智信分输出（信用子分）', subtitle: '违约维度', meta: ['信用分（子分输入）'], x: 24, y: 60 },
      { id: 's2', type: 'source', title: 'App 行为时序', subtitle: '兴趣维度', meta: ['近30天活跃天数'], x: 24, y: 192 },
      { id: 's3', type: 'source', title: '营销活动响应', subtitle: '转化维度', meta: ['活动响应次数'], x: 24, y: 324 },
      { id: 's4', type: 'source', title: '资产 / 理财持仓', subtitle: '资产维度', meta: ['资产类别 / 理财持仓'], x: 24, y: 456 },
      { id: 's5', type: 'source', title: '智察分输出（欺诈子分）', subtitle: '跨模型输入', meta: ['欺诈子分（0-100）'], x: 24, y: 600 },
      { id: 'm1', type: 'model', title: '违约维度 · 智信分', subtitle: '权重 0.34', x: 280, y: 60, meta: ['信用分归一化 × 0.34'] },
      { id: 'm2', type: 'model', title: '兴趣 / 转化 / 资产', subtitle: '权重 0.24/0.18/0.24', x: 280, y: 300,
        meta: ['借贷兴趣 0.24', '转化意愿 0.18', '资产状况 0.24'] },
      { id: 'f1', type: 'model', title: '加权融合', subtitle: '多模型集成', badge: '融合', x: 540, y: 176,
        meta: ['0.34×智信 + 0.24×兴趣', '+ 0.18×转化 + 0.24×资产', '→ 映射 300-900'] },
      { id: 'r1', type: 'ruleset', title: '综合规则集', subtitle: '价值规则', badge: '2 规则', x: 540, y: 432,
        meta: ['多头借贷强度高 → 关注', '转化意愿低且资产缺失 → 降级'] },
      { id: 'c1', type: 'collision', title: '规则碰撞 · 冲突裁决', subtitle: '逐条规则 · 满足条件即触发', badge: '2 条规则', x: 800, y: 268,
        meta: ['【zr-1】智察(欺诈高风险) ∩ 智融(高价值) → 欺诈优先拒绝', '【zr-2】兴趣 ∩ 资产 冲突 → 取保守策略', '可能裁决类型：拦截优先 / 分数优先 / 转人工'] },
      { id: 'd1', type: 'decision', title: '阈值决策', subtitle: '四段分级', badge: '4 档', x: 1028, y: 236,
        meta: ['300-540 拒绝 / 营销低险', '541-660 标准策略', '661-780 常规经营', '781-900 提额 + 优先经营'] },
      { id: 'o1', type: 'output', title: '智融分输出', subtitle: '300 – 900', badge: '300-900', x: 1028, y: 428, meta: ['最终输出：300–900 分，四档经营策略（见阈值决策）'] },
    ],
    edges: [
      { from: 's1', to: 'm1' }, { from: 's2', to: 'm2' }, { from: 's3', to: 'm2' }, { from: 's4', to: 'm2' },
      { from: 's5', to: 'c1', dashed: true },
      { from: 'm1', to: 'f1' }, { from: 'm2', to: 'f1' },
      { from: 'f1', to: 'c1' }, { from: 'r1', to: 'c1' },
      { from: 'c1', to: 'd1' }, { from: 'd1', to: 'o1' },
    ],
  },
}
