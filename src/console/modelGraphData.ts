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

export type GNodeType = 'source' | 'transform' | 'model' | 'ruleset' | 'collision' | 'decision' | 'output' | 'graph' | 'block' | 'alert'

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
  color?: string
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
  graph: { label: '图谱计算', color: '#0D9488' },
  block: { label: '强拦截', color: '#B91C1C' },
  alert: { label: '并行预警支线', color: '#0891B2' },
}

export const MODEL_DECISION_GRAPH: Partial<Record<ScoreProd, GGraph>> = {
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
      { id: 'r1', type: 'ruleset', title: '主线风险规则修正引擎', subtitle: 'score_adjust_rule · 4 条', badge: '4 规则', x: 516, y: 336,
        meta: ['Rule-001: 同设备短期多次申请 → +12', 'Rule-002: 申请IP风险画像 → +10', 'Rule-003: 紧急联系人命中风险名单 → +15', 'Rule-004: 手机号入网<3月 → +8', 'final = min(base+adjust, 100)'] },
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

  /* 智信分标准模型已移除（用户要求）：现以「授信流水线 V1.0」为准，见下方 PIPELINE_GRAPHS.zhixin_credit_v1 */
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
      { id: 'r1', type: 'ruleset', title: '主线信用规则修正引擎', subtitle: 'score_adjust_rule · 6 条', badge: '6 规则', x: 540, y: 432,
        meta: ['Rule-001: 当前逾期 → −60', 'Rule-002: 近24月逾期≥3 → −40', 'Rule-003: 授信使用率>85% → −35', 'Rule-004: 负债收入比>0.8 → −30', 'Rule-005: 征信查询>12 → −25', 'Rule-006: 征信优质负债健康 → +20', 'final = clip(base+adjust, 350-950)'] },
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

/* ============================================================================
 * 智信分授信风控流水线 V1.0（来自 record/mmm.md · 风控建模首席专家设计）
 * 设计态 · 100% 透明：所有运算规则完整枚举，无隐藏节点、无隐性逻辑。
 * 严格区分【主线串行链路】与【支线并行预警链路】（虚线 = 并行，不阻塞、不改分）。
 * 节点只画：字段名 / 原始算法 / 规则枚举 / 结果区间，不画任何具体客户值。
 * ========================================================================= */
export const PIPELINE_GRAPHS: Record<string, GGraph> = {
  zhixin_credit_v1: {
    width: 1460,
    height: 720,
    nodes: [
      { id: 's1', type: 'source', title: '进件 & 征信原始字段', subtitle: '13 个标准化采集字段', badge: '13 字段', x: 24, y: 180,
        meta: ['客户姓名 / 身份证号 / 手机号', '手机号入网日期', '近24月逾期次数 overdue_24m_cnt', '信用卡总额度 / 已用额度', '定向贷款余额 / 总信贷余额', '月税后收入 / 月信贷月供', '近6月硬查询次数 query_hard_6m', '是否失信被执行人 is_dishonest'] },
      { id: 'g1', type: 'graph', title: '关联图谱计算节点', subtitle: 'graph_mining · 社群发现', badge: '图计算', x: 264, y: 40,
        meta: ['输入: 身份证号, 手机号', '算法: 连通子图社群发现', '输出: 团伙欺诈关联标记 group_fraud_tag', '0 = 否 / 1 = 是（实时计算，非进件字段）'] },
      { id: 'f1', type: 'transform', title: '特征工程节点', subtitle: 'feature_transform · 衍生指标', badge: '衍生', x: 264, y: 300,
        meta: ['缺失值填充 / 单位归一化', 'util_ratio = 已用额度 / 总额度', 'dir_ratio = 定向余额 / 总余额', 'dti_ratio = 月供 / 月收入', 'mobile_age = 当前月 − 入网月', 'query_6m = 近6月硬查询(透传)'] },
      { id: 'b1', type: 'block', title: 'Block 前置强拦截', subtitle: 'rule_filter · 可终止', badge: '可终止', x: 504, y: 300,
        meta: ['仅 1 条生效规则（连续编号，无预留空ID）', 'Block-001: 是否失信被执行人 = 是', '→ 流水线终止 · 直接拒绝授信', '命中则拦截，不进入评分'] },
      { id: 'm1', type: 'model', title: '逻辑回归智信分模型', subtitle: 'logistic_regression_scorecard', badge: '评分卡', x: 504, y: 40,
        meta: ['BaseScore=600 · Odds₀=1:19 · PDO=50', '输入: util / dir / dti / mobile_age / query_6m / overdue', '输出: base_score（初始智信分）', '系数由训练拟合（β·WOE），非业务拍给'] },
      { id: 'r1', type: 'ruleset', title: '主线 Rule 扣分引擎', subtitle: 'rule_calculate · 4 条', badge: '4 规则', x: 744, y: 40,
        meta: ['Rule-001: dir_ratio > 70% → −50', 'Rule-002: dti_ratio > 80% → −50', 'Rule-003: query_6m > 15 → −50', 'Rule-004: util_ratio > 70% → −50', 'final_score = base_score − total_deduct（逐条判定·累加）'] },
      { id: 'w1', type: 'ruleset', title: '主线衍生预警判定', subtitle: 'condition_judge', badge: '主线预警', x: 744, y: 300,
        meta: ['输入: 命中主线Rule数量 hit_rule_cnt', 'hit_rule_cnt ≥ 3 → 主线衍生-二级高风险预警', '否则 main_alert_tag = 空', '输出: main_alert_tag'] },
      { id: 'k1', type: 'decision', title: '审批结论决策', subtitle: 'approval_decision · 全枚举', badge: '审批结论', x: 984, y: 180,
        meta: ['输入: final_score / main_alert_tag / parallel_alert_list / block_result',
          '① block_result=拦截(失信) → 直接拒绝(流水线已终止)',
          '② 并行 L1 一级紧急(团伙欺诈) → 直接拒绝',
          '③ 主线二级高风险(命中≥3) → 人工复核',
          '④ 并行 L3 三级关注(新号<6月) → 人工复核',
          '⑤ 其余无预警 → 自动通行',
          '输出: pipeline_result(通行/复核/拒绝)'] },
      { id: 'a1', type: 'alert', title: '支线 Alert 独立预警引擎', subtitle: 'parallel_alert · 并行', badge: '并行支线', x: 504, y: 560,
        meta: ['与评分卡同步执行 · 不阻塞主线', '不修改智信分 · 仅风险提示', 'Alert-L1-001: 团伙欺诈标记=1 → 一级紧急', 'Alert-L3-001: mobile_age<6 → 三级关注', 'L2/L4 框架预留 · 当前无生效规则'] },
      { id: 'o1', type: 'output', title: '流水线最终输出', subtitle: 'final_output', badge: '输出', x: 1224, y: 180,
        meta: ['final_score 最终智信分', 'main_alert_tag 主线衍生预警', 'parallel_alert_list 支线并行预警数组', 'pipeline_result 审批结论(由「审批结论决策」节点计算)'] },
    ],
    edges: [
      { from: 's1', to: 'g1' },
      { from: 's1', to: 'f1' },
      { from: 'g1', to: 'f1' },
      { from: 'f1', to: 'b1' },
      { from: 'b1', to: 'm1' },
      { from: 'm1', to: 'r1' },
      { from: 'r1', to: 'w1' },
      { from: 'w1', to: 'k1' },
      { from: 'a1', to: 'k1', dashed: true, color: '#0891B2' },
      { from: 'k1', to: 'o1' },
      { from: 'f1', to: 'a1', dashed: true, color: '#0891B2' },
      { from: 'g1', to: 'a1', dashed: true, color: '#0891B2' },
    ],
  },
}
