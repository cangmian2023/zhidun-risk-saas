/* 单客得分详情页（cr:mid-cust-score?cust=&prod=&id=）
 * 三模型为三个独立页面（prod 参数区分，URL 即页面）：智察分 / 智信分 / 智融分
 * 顶部继承单客详情基础信息（客户名 + 标签 + 右侧模型快捷入口互跳 + 额度建议），Tab 吸顶（top 56 跟随全局标题）：
 *   Tab1 模型分     —— 模型分概览（含维度拆解，三模型各自维度）+ 模型分趋势（环比/趋势）
 *   Tab2 预警处置 —— 分值阈值预警 + 处置流程（动态读 bizFlows.json f-alert-dispose，一行节点 + 状态行 + 处置按钮）+ 规则命中预警（只显示与当前模型相关的，三页面各看各的；其余预警归对应模型页）+ 操作日志（统一时间线，由 Tab1 迁入）
 *   Tab4 用户数据   —— 数据明细（原始数据 · 点击行展开逐笔表格 · 标注供哪个特征使用）+ 数据来源
 *   Tab5 模型信息   —— 基本信息（含版本历史）/ 结果含义 / 运营效果 / 算法解释
 * 原则：不堆装饰性提示；处置动作跳真实页面（预警/处置工作台）；旧数据按 riskDims+alerts 运行时兜底派生。
 */
import { useMemo, useState, type ReactNode } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DetailHeader, Panel, Badge } from '../components/ui';
import ScoreGauge from '../components/ScoreGauge';
import { LineChart } from '../components/charts';
import { PageShell } from './PageShell';
import { usePageNav } from './pageNav';
import { useMidCustomers, useMidAlerts, updateAlerts } from './midStore';
import FlowActionBar from './FlowActionBar';
import { useFlows } from './flowStore';
import { models } from './data';
import { useScore, computeZhixin, ZHIXIN_SCORECARD, resolveRiskByModel, fusionByLevel, type ScoreProd, type ModelMeta } from './scoreData';
import ModelDecisionGraph from './ModelDecisionGraph';
import { PIPELINE_GRAPHS } from './modelGraphData';
import type { MidCustomer, ModelScoreItem, CustRiskDim, CustRelationNode } from './midData';

type ProdKey = 'zhicha' | 'zhixin' | 'zhirong';
const PROD_KEYS: ProdKey[] = ['zhicha', 'zhixin', 'zhirong'];
const PROD_META: Record<ProdKey, { label: string; sub: string; color: string; danger: boolean }> = {
  zhicha: { label: '智察分', sub: '反欺诈', color: '#ef4444', danger: true },
  zhixin: { label: '智信分', sub: '信用', color: '#16a34a', danger: false },
  zhirong: { label: '智融分', sub: '综合', color: '#8b5cf6', danger: false },
};
const LEVEL_COLOR: Record<string, string> = { 高: '#DC2626', 中: '#D97706', 低: '#16A34A' };
const TAG_KIND: Record<string, 'red' | 'amber' | 'blue' | 'violet' | 'gray'> = {
  命中: 'red', 关注: 'amber', 评分项: 'blue', 融合来源: 'violet',
};

/* 样例数据下「客户预警 → 模型风险标签」匹配关键字（本模型预警信号命中即计入对应标签）。
 * 模型 riskLabels.tagCode 与命中联动，确保本页「本客户命中的风险标签」与模具同源。 */
const TAG_KEYWORDS: Record<ProdKey, Record<string, string[]>> = {
  zhicha: {
    TAG_FRD_001: ['黑灰名单', '黑名单', '灰名单'],
    TAG_FRD_002: ['设备', '群控', '模拟器'],
    TAG_FRD_003: ['团伙', '欺诈', '关联'],
    TAG_MON_001: ['异地', '新手机号', '入网'],
  },
  zhixin: {
    TAG_CRD_001: ['制裁', 'PEP', '名单'],
    TAG_CRD_002: ['地址', '聚集', '中介'],
    TAG_CRD_003: ['中介', '号码'],
  },
  zhirong: {
    TAG_VAL_001: ['代理IP', '代理', '灰名单'],
    TAG_VAL_002: ['设备风险', '设备'],
    TAG_VAL_003: ['黑灰名单', '黑名单', '灰名单'],
  },
};
function hitTagCodesOf(prod: ProdKey, cust: MidCustomer | undefined): string[] {
  const alertTexts = (cust?.alerts ?? [])
    .filter((a) => alertModelOf(a.alert_type) === prod)
    .flatMap((a) => [a.alert_type, a.scene, a.ruleName])
  const hits: string[] = []
  for (const [code, kws] of Object.entries(TAG_KEYWORDS[prod] ?? {})) {
    if (kws.some((kw) => alertTexts.some((t) => (t ?? '').includes(kw)))) hits.push(code)
  }
  return hits
}

/* ---- 旧数据兜底：缺 scores 时按 riskDims + alerts 派生（运行时，不落盘） ---- */
const DIM_WEIGHT: Record<string, number> = { 欺诈: 0.3, 多头: 0.25, 行为: 0.2, 司法: 0.15, 负债: 0.1, 舆情: 0.05 };

function deriveFallback(cust: MidCustomer, prod: ProdKey): ModelScoreItem | null {
  const dims = cust.riskDims ?? [];
  const used = dims.filter((d) => DIM_WEIGHT[d.dim] != null);
  if (!used.length) return null;
  const wsum = used.reduce((s, d) => s + DIM_WEIGHT[d.dim], 0);
  const riskAvg = used.reduce((s, d) => s + d.score * DIM_WEIGHT[d.dim], 0) / wsum;
  let score: number, range: [number, number], unit: string, hint: string;
  if (prod === 'zhicha') {
    score = Math.round(riskAvg); range = [0, 100]; unit = '欺诈分';
    hint = '欺诈风险评分，分数越高欺诈风险越大';
  } else if (prod === 'zhixin') {
    score = Math.round(900 - riskAvg * 3.4); range = [300, 900]; unit = '信用分';
    hint = '信用评分，分数越高信用越好';
  } else {
    score = Math.round(900 - riskAvg * 3.8); range = [300, 900]; unit = '综合分';
    hint = '综合风险与价值评分，分数越高综合表现越好';
  }
  score = Math.max(range[0], Math.min(range[1], score));
  return { score, range, unit, hint };
}

/* ---- 等级 / 风险结论：单一数据源，直接读模型 Tab4 的「风险等级映射表」。
 *   模型把等级扩成 4/5 段，本页自动同步（模具改了产品跟着变）。 ---- */
const LV_CODE_COLOR: Record<string, string> = {
  VLOW: '#16A34A', LOW: '#16A34A', MID: '#D97706', HIGH: '#DC2626', VHIGH: '#DC2626',
};
function riskBand(prod: ProdKey, score: number) {
  const r = resolveRiskByModel(prod, score) ?? { level: '—', code: '', meaning: '', action: '', range: '—' };
  return { level: r.level, code: r.code, meaning: r.meaning, action: r.action, range: r.range, grade: r.level, label: r.level, color: LV_CODE_COLOR[r.code] ?? '#64748B' };
}
const GRADE_LABEL: Record<string, string> = { A: '优质', B: '良好', C: '一般', D: '较差', 高风险: '高风险', 中风险: '中风险', 低风险: '低风险' };

function enrich(item: ModelScoreItem, prod: ProdKey): ModelScoreItem {
  const band = riskBand(prod, item.score);
  const isFraud = prod === 'zhicha';
  const probability = item.probability ?? (() => {
    const c = band.code || '';
    if (isFraud) return c === 'MID' ? '38.2%' : (c === 'HIGH' || c === 'VHIGH') ? '72.5%' : '9.6%';
    return c === 'VLOW' || c === 'LOW' ? '3.1%' : c === 'MID' ? '6.8%' : c === 'HIGH' ? '14.2%' : '26.5%';
  })();
  const grade = item.grade ?? band.level;
  const gradeLabel = item.gradeLabel ?? '';
  const modelVersion = item.modelVersion ?? (prod === 'zhicha' ? '智察V3.2' : prod === 'zhixin' ? '智信V4.0' : '智融V2.1');
  const calcedAt = item.calcedAt ?? '2026-08-08 10:30:12';
  return { ...item, probability, grade, gradeLabel, modelVersion, calcedAt };
}

const PROD_TO_MODEL: Record<ProdKey, string> = { zhicha: 'M-智察分', zhixin: 'M-智信分', zhirong: 'M-智融分' };
const MODEL_CAPA: Record<ProdKey, {
  method: string; owner: string; applicable: string; psi: number; monitor: string;
  lineage: { stage: string; detail: string }[];
  versions: { version: string; date: string; note: string }[];
}> = {
  zhicha: {
    method: 'XGBoost + 规则引擎融合：基于 2019–2025 年历史欺诈样本训练，叠加反欺诈专家规则与人工复核干预',
    owner: '反欺诈模型组 · 周明', applicable: '全产品贷前/贷中反欺诈筛查', psi: 0.08,
    monitor: '日级 PSI 监控，阈值 0.25 触发告警复核',
    lineage: [
      { stage: '数据接入', detail: '设备指纹 / 多头借贷 / 黑灰名单 / 申请行为（输入数据版本 2026Q2）' },
      { stage: '特征工程', detail: '36 个反欺诈特征（聚集度、申请频次、环境风险…）' },
      { stage: '模型计算', detail: '智察分 V3.2（XGBoost）输出 0–100 欺诈分' },
      { stage: '专家规则', detail: '叠加专家规则与人工复核，形成最终欺诈分' },
    ],
    versions: [
      { version: 'V3.2', date: '2026-04-18', note: '新增设备聚集特征，提升模拟器识别准确率；多头阈值由 ≥6 调整为 ≥5，降低漏报' },
      { version: 'V3.1', date: '2025-11-02', note: '调整申请频次权重，减少旺季误报；补充灰名单关联规则' },
      { version: 'V3.0', date: '2025-06-15', note: '基线版本（XGBoost + 规则引擎融合），36 个反欺诈特征' },
    ],
  },
  zhixin: {
    method: 'LightGBM 评分卡：基于近 5 年信贷表现样本训练，叠加信用专家规则与人工复核干预',
    owner: '信用模型组 · 李航', applicable: '信用贷/消费贷授信与定价', psi: 0.06,
    monitor: '周级 PSI 监控，阈值 0.20 触发告警复核',
    lineage: [
      { stage: '数据接入', detail: '人行征信 / 负债结构 / 收入流水 / 历史还款（输入数据版本 2026Q2）' },
      { stage: '特征工程', detail: '42 个信用特征（逾期历史、负债比、稳定性…）' },
      { stage: '模型计算', detail: '智信分 V4.0（LightGBM）输出 300–900 信用分' },
      { stage: '专家规则', detail: '叠加专家规则与人工复核，形成最终信用分' },
    ],
    versions: [
      { version: 'V4.0', date: '2026-03-10', note: '引入收入流水特征（12 个月），特征扩至 42 个；重新校准违约概率输出' },
      { version: 'V3.9', date: '2025-10-21', note: '负债收入比阈值由 75% 收紧至 70%；修复低分段概率偏移' },
      { version: 'V3.8', date: '2025-05-08', note: '基线版本（LightGBM 评分卡），38 个信用特征' },
    ],
  },
  zhirong: {
    method: '融合模型：引用智信分(信用) + 智察分(欺诈) + 价值/资产自有特征，逻辑回归融合',
    owner: '综合模型组 · 陈璐', applicable: '综合授信与额度核定', psi: 0.10,
    monitor: '日级 PSI 监控，阈值 0.25 触发告警复核',
    lineage: [
      { stage: '数据接入', detail: '智信分 / 智察分 / 价值与资产特征（输入数据版本 2026Q2）' },
      { stage: '特征工程', detail: '违约维度 + 欺诈维度 + 价值维度 + 资产维度' },
      { stage: '模型计算', detail: '智融分 V2.1（融合逻辑回归）输出 300–900 综合分' },
      { stage: '专家规则', detail: '叠加专家规则与人工复核，形成最终综合分' },
    ],
    versions: [
      { version: 'V2.1', date: '2026-02-06', note: '调整智信分/智察分融合权重（信用 0.55 / 欺诈 0.45）；加入借贷兴趣价值特征' },
      { version: 'V2.0', date: '2025-12-01', note: '基线融合版本（逻辑回归融合智信分 + 智察分 + 价值/资产特征）' },
    ],
  },
};

/* ============ 运营效果（业务可理解指标，替代 AUC/KS/PSI） ============ */
const MODEL_OPS: Record<ProdKey, {
  metrics: { label: string; value: string; sub: string; color: string }[];
  trend: { month: string; coverage: number; accuracy: number; timely: number }[];
}> = {
  zhicha: {
    metrics: [
      { label: '评分覆盖率', value: '98.5%', sub: '有评分客户 / 总客户', color: '#2563EB' },
      { label: '预警准确率', value: '86.2%', sub: '预警后核实为真实欺诈', color: '#16A34A' },
      { label: '处置及时率', value: '92.0%', sub: '规定时限内完成处置', color: '#7C3AED' },
      { label: '本月调用', value: '12,480 次', sub: '模型评分调用总量', color: '#D97706' },
    ],
    trend: [
      { month: '03月', coverage: 97.2, accuracy: 82.1, timely: 88.5 },
      { month: '04月', coverage: 97.8, accuracy: 83.5, timely: 89.2 },
      { month: '05月', coverage: 98.1, accuracy: 84.2, timely: 90.1 },
      { month: '06月', coverage: 98.3, accuracy: 85.0, timely: 91.0 },
      { month: '07月', coverage: 98.4, accuracy: 85.8, timely: 91.6 },
      { month: '08月', coverage: 98.5, accuracy: 86.2, timely: 92.0 },
    ],
  },
  zhixin: {
    metrics: [
      { label: '评分覆盖率', value: '99.1%', sub: '有评分客户 / 总客户', color: '#2563EB' },
      { label: '预警准确率', value: '88.5%', sub: '预警后核实为真实风险', color: '#16A34A' },
      { label: '处置及时率', value: '94.3%', sub: '规定时限内完成处置', color: '#7C3AED' },
      { label: '本月调用', value: '18,620 次', sub: '模型评分调用总量', color: '#D97706' },
    ],
    trend: [
      { month: '03月', coverage: 98.5, accuracy: 85.0, timely: 91.2 },
      { month: '04月', coverage: 98.7, accuracy: 86.1, timely: 92.0 },
      { month: '05月', coverage: 98.9, accuracy: 87.0, timely: 92.8 },
      { month: '06月', coverage: 99.0, accuracy: 87.8, timely: 93.5 },
      { month: '07月', coverage: 99.0, accuracy: 88.2, timely: 94.0 },
      { month: '08月', coverage: 99.1, accuracy: 88.5, timely: 94.3 },
    ],
  },
  zhirong: {
    metrics: [
      { label: '评分覆盖率', value: '95.8%', sub: '有评分客户 / 总客户', color: '#2563EB' },
      { label: '预警准确率', value: '83.6%', sub: '预警后核实为真实风险', color: '#16A34A' },
      { label: '处置及时率', value: '90.1%', sub: '规定时限内完成处置', color: '#7C3AED' },
      { label: '本月调用', value: '8,360 次', sub: '模型评分调用总量', color: '#D97706' },
    ],
    trend: [
      { month: '03月', coverage: 94.2, accuracy: 79.5, timely: 86.8 },
      { month: '04月', coverage: 94.8, accuracy: 80.8, timely: 87.5 },
      { month: '05月', coverage: 95.2, accuracy: 81.9, timely: 88.3 },
      { month: '06月', coverage: 95.5, accuracy: 82.8, timely: 89.2 },
      { month: '07月', coverage: 95.7, accuracy: 83.3, timely: 89.7 },
      { month: '08月', coverage: 95.8, accuracy: 83.6, timely: 90.1 },
    ],
  },
};

/* ============ 维度拆解：维度定义单一数据源（模型自身 gModel.dims） ============
 * 维度名 / 权重直接从模型 ModelMeta.dims 读取，与「模型信息 / 算法编辑图」同源，改模型即改拆解；
 * 客户维度得分从 cust.riskDims 映射（from = 风险维度来源），未命中用 fb 兜底。 */
const DIM_SOURCE: Record<string, { from?: string; fb: number }> = {
  '多头借贷强度': { from: '欺诈', fb: 72 },
  '设备环境风险': { from: '行为', fb: 55 },
  '黑灰名单命中': { from: '司法', fb: 50 },
  '同设备关联': { from: '多头', fb: 45 },
  '历史逾期记录': { from: '行为', fb: 60 },
  '负债收入比': { from: '负债', fb: 62 },
  '征信查询频次': { from: '多头', fb: 45 },
  '收入稳定性': { from: '行为', fb: 50 },
  '授信使用率': { fb: 40 },
  '违约维度（智信分）': { from: '负债', fb: 60 },
  '欺诈维度': { from: '欺诈', fb: 65 },
  '借贷兴趣': { from: '行为', fb: 45 },
  '转化意愿': { fb: 40 },
  '资产状况': { fb: 40 },
};
function dimsOf(modelDims: { name: string; weight: number }[], riskDims: CustRiskDim[]): { dim: string; score: number; lvl: '高' | '中' | '低'; importance: number; src: '实测' | '兜底' }[] {
  return modelDims.map((g) => {
    const cfg = DIM_SOURCE[g.name] ?? { fb: 55 };
    const hit = cfg.from ? riskDims.find((d) => d.dim === cfg.from) : undefined;
    const score = (cfg.from && hit?.score) ?? cfg.fb;
    return { dim: g.name, score, lvl: score >= 75 ? '高' : score >= 55 ? '中' : '低', importance: g.weight, src: hit ? '实测' : '兜底' };
  });
}

function CapCell({ label, value, danger }: { label: string; value: string; danger?: boolean }) {
  return (
    <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ fontSize: 11, color: '#94A3B8' }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: danger ? '#DC2626' : '#1E293B', marginTop: 2 }}>{value}</div>
    </div>
  );
}

/* 数据明细展开区的字段行（字段名 | 字段值，一个一个字段展示） */
function FieldRow({ k, v, strong }: { k: string; v: string; strong?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, padding: '4px 0', borderBottom: '1px dashed #E8EEF5' }}>
      <span style={{ flexShrink: 0, width: 90, fontSize: 12, color: '#94A3B8' }}>{k}</span>
      <span style={{ flex: 1, minWidth: 0, fontSize: 12.5, color: strong ? '#0F172A' : '#334155', fontWeight: strong ? 700 : 400 }}>{v}</span>
    </div>
  );
}

/* 数据明细（用户数据 Tab）：计算模型使用的原始数据，每行可展开逐笔明细（表格）；feat = 供哪个模型特征使用 */
type InputDetail = {
  name: string; source: string; window: string; value: string; status: '触发' | '关注' | '正常';
  feat: string;                 // 对应模型特征（原始数据 → 特征 的映射）
  detailTitle: string;
  cols: string[];               // 明细表列头
  rows: string[][];             // 明细表行（真实逐笔记录）
};
const INPUT_DETAILS: Record<ProdKey, InputDetail[]> = {
  zhicha: [
    {
      name: '近30天申贷笔数', source: '多头借贷数据', window: '2026-07-10 ~ 08-08', value: '7 笔（阈值 ≥5）', status: '触发', feat: '多头聚集',
      detailTitle: '申贷记录（近 30 天 · 逐笔）',
      cols: ['申请日期', '机构', '产品', '状态'],
      rows: [
        ['07-12', '某银行', '消费贷', '已放款'],
        ['07-15', '某消费金融', '现金贷', '已放款'],
        ['07-18', '某网贷平台', '小额贷', '拒绝'],
        ['07-23', '某银行', '信用贷', '审批中'],
        ['07-27', '某消金', '循环额度', '已放款'],
        ['08-02', '某平台', '现金分期', '审批中'],
        ['08-06', '某银行', '消费分期', '申请'],
      ],
    },
    {
      name: '同时在贷平台数', source: '多头借贷数据', window: '当前时点', value: '5 家（阈值 ≥4）', status: '触发', feat: '多头聚集',
      detailTitle: '在贷平台（当前）',
      cols: ['平台', '在贷余额', '状态'],
      rows: [
        ['平台A', '¥12,000', '正常'],
        ['平台B', '¥8,500', '正常'],
        ['平台C', '¥15,000', '关注（近30天有申请）'],
        ['平台D', '¥6,000', '正常'],
        ['平台E', '¥20,000', '正常'],
      ],
    },
    {
      name: '设备环境', source: '设备指纹', window: '申请时点', value: '模拟器特征命中', status: '触发', feat: '设备环境',
      detailTitle: '设备指纹（申请时点采集）',
      cols: ['检测项', '结果'],
      rows: [
        ['设备指纹', 'DEV-A3F8-9C21（近30天 3 台关联设备）'],
        ['环境特征', '模拟器特征命中（置信度 0.92）'],
        ['IP 归属', '202.xx.xx.16 · 异地（与常驻地不符）'],
      ],
    },
    {
      name: '黑名单命中', source: '黑灰名单库', window: '当前', value: '外部灰名单 ID#88231', status: '触发', feat: '黑产关联',
      detailTitle: '名单命中（黑灰名单库记录）',
      cols: ['项', '内容'],
      rows: [
        ['名单类型', '外部灰名单（互金协会共享）'],
        ['名单编号', 'ID#88231'],
        ['入名单原因', '2025-11 疑似组团申贷'],
        ['命中时点', '2026-08-08 10:30:12'],
      ],
    },
    {
      name: '同设备关联账号', source: '账号关系图谱', window: '当前', value: '3 个（阈值 ≥5 触发）', status: '关注', feat: '网络关联',
      detailTitle: '同设备账号（设备维度关联）',
      cols: ['账号', '关系', '风险'],
      rows: [
        ['张*明', '本人', '正常'],
        ['王*芳', '同设备登录 2 次', '关注'],
        ['李*华', '同设备登录 1 次', '关注'],
      ],
    },
    {
      name: '征信查询次数', source: '人行征信', window: '近 6 月', value: '8 次（阈值 ≥10）', status: '正常', feat: '申请行为',
      detailTitle: '征信查询记录（近 6 月 · 逐笔）',
      cols: ['查询日期', '查询机构', '查询类型'],
      rows: [
        ['03-02', '某银行', '贷前审批（信用卡）'],
        ['03-15', '某消费金融', '贷前审批'],
        ['04-11', '某银行', '贷前审批（贷款）'],
        ['05-06', '某消金', '贷前审批'],
        ['06-20', '本人', '本人查询'],
        ['07-08', '某网贷平台', '贷前审批'],
        ['07-22', '某银行', '贷后管理'],
        ['08-02', '某消费金融', '贷后管理'],
      ],
    },
    {
      name: '收入流水稳定性', source: '银行流水', window: '近 12 月', value: '连续 14 月稳定', status: '正常', feat: '—',
      detailTitle: '收入流水（近 12 月汇总）',
      cols: ['项', '值'],
      rows: [
        ['月均入账', '¥18,000（代发工资）'],
        ['连续入账月数', '14 个月'],
        ['大额异动', '无'],
      ],
    },
    {
      name: '司法涉诉', source: '司法数据', window: '近 2 年', value: '无记录', status: '正常', feat: '司法涉诉',
      detailTitle: '涉诉记录（近 2 年）',
      cols: ['类型', '结果'],
      rows: [
        ['被执行', '无记录'],
        ['失信名单', '无记录'],
        ['开庭公告', '无记录'],
      ],
    },
  ],
  zhixin: [
    {
      name: '历史逾期记录', source: '人行征信', window: '近 2 年', value: 'M3+ 逾期 1 次', status: '触发', feat: '还款记录',
      detailTitle: '逾期记录（近 2 年 · 逐笔）',
      cols: ['日期', '账户', '明细'],
      rows: [
        ['2024-09', '某银行信用卡', '逾期 95 天（M3+）'],
        ['2024-12', '某消金', '逾期 12 天（M1）已结清'],
        ['2025-06', '某平台', '逾期 5 天（已结清）'],
      ],
    },
    {
      name: '负债收入比', source: '征信 + 收入流水', window: '当前', value: '58%（阈值 70%）', status: '关注', feat: '负债结构',
      detailTitle: '负债构成（当前）',
      cols: ['项', '值'],
      rows: [
        ['月收入', '¥18,000'],
        ['月还款额', '¥10,440'],
        ['负债收入比', '58%'],
        ['在贷余额合计', '¥61,500'],
      ],
    },
    {
      name: '征信查询频次', source: '人行征信', window: '近 6 月', value: '8 次（阈值 ≥10）', status: '正常', feat: '征信行为',
      detailTitle: '征信查询记录（近 6 月 · 逐笔）',
      cols: ['查询日期', '查询机构', '查询类型'],
      rows: [
        ['03-02', '某银行', '贷前审批（信用卡）'],
        ['03-15', '某消费金融', '贷前审批'],
        ['04-11', '某银行', '贷前审批（贷款）'],
        ['05-06', '某消金', '贷前审批'],
        ['06-20', '本人', '本人查询'],
        ['07-08', '某网贷平台', '贷前审批'],
        ['07-22', '某银行', '贷后管理'],
        ['08-02', '某消费金融', '贷后管理'],
      ],
    },
    {
      name: '收入稳定性', source: '银行流水', window: '近 12 月', value: '连续 14 月稳定', status: '正常', feat: '收入稳定',
      detailTitle: '收入流水（近 12 月汇总）',
      cols: ['项', '值'],
      rows: [
        ['月均入账', '¥18,000（代发工资）'],
        ['连续入账月数', '14 个月'],
        ['大额异动', '无'],
      ],
    },
    {
      name: '职业属性', source: '申请信息', window: '当前', value: '制造业 · 在职', status: '正常', feat: '职业稳定',
      detailTitle: '职业信息（申请时点）',
      cols: ['项', '值'],
      rows: [
        ['单位', '某制造集团（在职 4 年）'],
        ['岗位', '生产管理'],
        ['社保缴纳', '连续 36 个月'],
      ],
    },
    {
      name: '司法涉诉', source: '司法数据', window: '近 2 年', value: '无记录', status: '正常', feat: '司法涉诉',
      detailTitle: '涉诉记录（近 2 年）',
      cols: ['类型', '结果'],
      rows: [
        ['被执行', '无记录'],
        ['失信名单', '无记录'],
      ],
    },
  ],
  zhirong: [
    {
      name: '欺诈维度（引用智察分）', source: '智察分', window: '本次评分', value: '欺诈分 78', status: '触发', feat: '欺诈风险',
      detailTitle: '智察分引用（本次评分）',
      cols: ['项', '值'],
      rows: [
        ['欺诈分', '78（高风险档）'],
        ['主要触发', '多头借贷强度 28% · 设备环境风险 22%'],
      ],
    },
    {
      name: '违约维度（引用智信分）', source: '智信分', window: '本次评分', value: '信用分 688', status: '关注', feat: '信用风险',
      detailTitle: '智信分引用（本次评分）',
      cols: ['项', '值'],
      rows: [
        ['信用分', '688（C 档 · 一般）'],
        ['主要扣分项', '历史逾期 M3+ 1 次 · 负债收入比 58%'],
      ],
    },
    {
      name: '价值维度（借贷兴趣）', source: '行为数据', window: '近 30 天', value: '活跃 18 天', status: '正常', feat: '价值潜力',
      detailTitle: '行为活跃（近 30 天）',
      cols: ['项', '值'],
      rows: [
        ['活跃天数', '18 / 30 天'],
        ['偏好产品', '消费分期 · 现金分期'],
      ],
    },
    {
      name: '资产维度', source: '资产画像', window: '当前', value: '房产 + 理财持仓', status: '正常', feat: '资产实力',
      detailTitle: '资产（当前）',
      cols: ['项', '值'],
      rows: [
        ['房产', '自有住房（按揭中）'],
        ['理财持仓', '¥80,000（货币基金）'],
      ],
    },
  ],
};

/* 规则命中预警 → 相关模型：预警是客户级事件（贷中监控触发），但不同模型关注不同预警类——
 * 反欺诈（智察）看欺诈信号（设备/黑产/多头/行为异常）、信用（智信）看还款能力与意愿（负债/逾期/司法/失联）、
 * 综合（智融）看价值与机会（提额/需求）。本页规则命中预警按此映射只展示与当前模型相关的条目。 */
const ALERT_MODEL: Record<string, ProdKey> = {
  设备异常: 'zhicha', 反欺诈命中: 'zhicha', 多头借贷: 'zhicha', 行为评分下降: 'zhicha', 舆情负面: 'zhicha',
  负债激增: 'zhixin', 逾期预警: 'zhixin', 司法涉诉: 'zhixin', 还款能力不足: 'zhixin', 回访失联: 'zhixin', 关联企业风险: 'zhixin',
  提额机会: 'zhirong', 需求上升: 'zhirong',
};
function alertModelOf(type?: string): ProdKey | null {
  return type ? ALERT_MODEL[type] ?? null : null;
}

type FlowEvent = { time: string; tag: string; text: string; kind: 'red' | 'amber' | 'blue' | 'cyan' | 'green' };
/* 统一操作日志时间线：自动事件（评分/重评/预警/核验）+ 人工事件（处置/审批）按时间倒序，标注对模型的影响 */
function buildEvents(cust: MidCustomer, calcedAt: string, prod: ProdKey): FlowEvent[] {
  const ev: FlowEvent[] = [];
  // 评分/重评：每次模型计算都留痕（初始评分 + 贷中重评，来自月度快照 modelScoreHistory）
  (cust.modelScoreHistory ?? []).forEach((p) => {
    const v = (p as any)[prod];
    if (v != null) ev.push({
      time: p.month, tag: '评分',
      text: `${PROD_META[prod].label}评分：${v} 分（月度快照）`,
      kind: 'cyan',
    });
  });
  (cust.alerts ?? []).forEach((a) => ev.push({
    time: a.time, tag: a.level === 'RED' ? '预警' : a.level === 'OPPORTUNITY' ? '机会' : '预警',
    text: `${a.scene}（${a.ruleName}）触发 · 当前${a.status}`,
    kind: a.level === 'RED' ? 'red' : a.level === 'YELLOW' ? 'amber' : 'green',
  }));
  (cust.disposes ?? []).forEach((d) => ev.push({
    time: d.time, tag: '处置', text: `${d.action}：${d.result}${d.note ? `（${d.note}）` : ''}`, kind: 'blue',
  }));
  (cust.approvalRecords ?? []).forEach((r) => ev.push({
    time: r.time, tag: '审批',
    text: `${r.kind} · ${r.result}（${r.opinion}）· ${r.operator}`, kind: 'green',
  }));
  (cust.externalChecks ?? []).forEach((c) => ev.push({
    time: calcedAt, tag: '核验',
    text: `外部核验 · ${c.category}·${c.item} → ${c.result}（${c.status}）`, kind: 'amber',
  }));
  return ev.sort((a, b) => b.time.localeCompare(a.time));
}

function EventLine({ ev }: { ev: FlowEvent }) {
  const tagColor: Record<string, string> = { red: '#DC2626', amber: '#D97706', blue: '#185FA5', cyan: '#0891B2', green: '#16A34A' };
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: '1px dashed #F1F5F9' }}>
      <span style={{ fontSize: 11, color: '#fff', background: tagColor[ev.kind], borderRadius: 6, padding: '2px 8px', flexShrink: 0 }}>{ev.tag}</span>
      <span style={{ fontSize: 12, color: '#94A3B8', width: 90, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{ev.time}</span>
      <span style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.6 }}>{ev.text}</span>
    </div>
  );
}

type TabKey = 'score' | 'alert' | 'data' | 'model';
const TABS: { key: TabKey; label: string }[] = [
  { key: 'score', label: '模型分' },
  { key: 'alert', label: '预警处置' },
  { key: 'data', label: '用户数据' },
  { key: 'model', label: '模型信息' },
];

export default function CustScoreDetail({ defaultCust, defaultProd }: { defaultCust?: string; defaultProd?: ProdKey } = {}) {
  const [params] = useSearchParams();
  const custId = params.get('cust') ?? defaultCust ?? '';
  const prodParam = (params.get('prod') ?? defaultProd ?? 'zhicha') as ProdKey;
  const prod: ProdKey = PROD_KEYS.includes(prodParam) ? prodParam : 'zhicha';
  const fromAlertId = params.get('id') ?? '';
  // 返回地址：入口跳转带 back 参数（如客户分组/客户列表/评分总览搜索），缺省回退单客详情
  const backParam = params.get('back');
  const backTarget = backParam ? decodeURIComponent(backParam) : null;
  // 来源感知：从「评分产品」子系统进入时带 source=sc，返回链与面包屑跟随评分产品语境
  const source = params.get('source') ?? undefined;
  const { goDetail, back } = usePageNav();
  const customers = useMidCustomers();
  const globalAlerts = useMidAlerts();
  const [tab, setTab] = useState<TabKey>('score');
  const [openInput, setOpenInput] = useState<Record<number, boolean>>({});

  const cust: MidCustomer | undefined = useMemo(
    () => customers.find((c) => c.custId === custId) ?? customers[0],
    [customers, custId],
  );
  const meta = PROD_META[prod];
  const item = useMemo<ModelScoreItem | null>(() => {
    if (!cust) return null;
    const raw = cust.scores?.[prod] ?? deriveFallback(cust, prod);
    return raw ? enrich(raw, prod) : null;
  }, [cust, prod]);
  const backTo = () => back(source ? '/console/sc/score-records' : ('/console/cr/mid-single-cust?cust=' + custId + (fromAlertId ? '&id=' + fromAlertId : '') + (source ? '&source=sc' : '')));
  const backLabel = backParam?.includes('score-records') ? '← 返回评分记录' : backParam?.includes('mid-single-cust') ? '← 返回单客详情' : (source ? '← 返回评分产品' : '← 返回');

  const reg: any = models.find((m) => m.id === PROD_TO_MODEL[prod]) ?? {};
  const capa = MODEL_CAPA[prod];
  const history = cust?.modelScoreHistory ?? [];
  const isFraud = prod === 'zhicha';
  const data = useScore();
  const gModel: ModelMeta = data.models.find((x) => x.prod === prod) ?? data.models[0];
  const flows = useFlows();

  /* 节点明细「结果」列：本客户在流水线各节点的实际值（key = 图节点 id，按 prod 定制）
   * 数据源节点 → 预期阈值 vs 用户实际值（与用户数据 Tab 的 INPUT_DETAILS 同源）；
   * 模型/规则节点 → 中间计算结果；输出节点 → 最终分。 */
  const nodeResults = useMemo<Record<string, string>>(() => {
    if (!cust || !item) return {};
    const alerts = cust.alerts ?? [];
    const rels = cust.relations ?? [];
    const dims = cust.riskDims ?? [];
    const nonOpp = alerts.filter((a) => a.level !== 'OPPORTUNITY');
    const opp = alerts.filter((a) => a.level === 'OPPORTUNITY');
    // 从数据明细取「用户实际值（阈值）」：与用户数据 Tab 完全同源
    const detailVal = (name: string) => {
      const d = INPUT_DETAILS[prod].find((x) => x.name === name);
      return d ? `${d.value}${d.status !== '正常' ? ' · ' + d.status : ''}` : null;
    };
    const r: Record<string, string> = {};
    if (prod === 'zhixin') {
      r.s1 = '进件 13 字段已采集 · 征信已调取';
      r.g1 = `关联实体 ${rels.length} 个${rels.some((x) => x.ringId) ? ' · 团伙识别命中' : ' · 未入团伙'}`;
      r.f1 = `util ${detailVal('信用卡已用/总额度') ?? '43%'} · dti ${detailVal('月供/月收入') ?? '58%'}`;
      r.b1 = cust.alerts?.some((a) => a.scene.includes('失信')) ? '命中失信名单 → 拦截' : '未命中失信 → 放行';
      r.m1 = `基础分 600 + 因子加分 = ${item.score}`;
      r.r1 = nonOpp.length ? `命中主线规则 ${nonOpp.length} 条 → 扣分` : '未命中扣分规则 → 维持';
      r.w1 = nonOpp.length ? `主线衍生预警 ${nonOpp.length} 条` : '主线预警未触发';
      r.k1 = `${item.grade ?? '—'}${item.gradeLabel ? ' · ' + item.gradeLabel : ''}`;
      r.a1 = opp.length ? `并行预警 ${opp.length} 条` : '并行预警未触发';
      r.o1 = `智信分 ${item.score} → ${item.grade ?? '—'}`;
    } else if (prod === 'zhicha') {
      r.s1 = detailVal('近30天申贷笔数') ?? '—';
      r.s2 = detailVal('设备环境') ?? '—';
      r.s3 = detailVal('黑名单命中') ?? '—';
      r.s4 = detailVal('同时在贷平台数') ?? '—';
      r.m1 = `XGBoost 欺诈概率 ${item.probability ?? '—'}`;
      r.r1 = nonOpp.length ? `命中 ${nonOpp.length} 条反欺诈规则 → 修正后 ${item.score} 分` : `未命中反欺诈规则 → 模型输出 ${item.score} 分`;
      r.r2 = detailVal('同设备关联账号') ?? '—';
      r.c1 = nonOpp.length
        ? `冲突裁决 → 生成「${(nonOpp.find((a) => a.level === 'RED') ?? nonOpp[0]).scene}」${nonOpp.length > 1 ? `等 ${nonOpp.length} 条` : ''}预警`
        : '无规则冲突';
      r.d1 = `落入 ${riskBand('zhicha', item.score).range} 档`;
      r.o1 = `智察分 ${item.score} → ${item.grade ?? '—'}`;
    } else {
      r.s1 = `信用子分 ${cust.scores?.zhixin?.score ?? item.score}`;
      r.s2 = detailVal('近30天活跃天数') ?? '—';
      r.s3 = detailVal('活动响应次数') ?? '—';
      r.s4 = detailVal('理财持仓') ?? '—';
      r.s5 = `欺诈子分 ${cust.scores?.zhicha?.score ?? '—'}`;
      r.m1 = `0.34 × 信用子分 = ${((cust.scores?.zhixin?.score ?? 700) / 1000 * 0.34).toFixed(3)}`;
      r.m2 = '0.24/0.18/0.24 加权';
      r.f1 = `加权融合 → ${item.score}`;
      r.r1 = nonOpp.length ? `命中信用规则 ${nonOpp.length} 条 → 扣分` : '未命中扣分规则 → 维持';
      r.c1 = opp.length ? `跨模型碰撞 → ${opp[0].scene}` : '无冲突裁决';
      r.d1 = `落入 ${riskBand('zhirong', item.score).range} 档`;
      r.o1 = `智融分 ${item.score} → ${item.grade ?? '—'}`;
    }
    return r;
  }, [cust, item, prod]);

  if (!cust || !item) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell header={<DetailHeader title="得分详情" crumb={(source ? '评分产品' : '贷中监控') + ' / 单客详情 / 得分详情'} backLabel={backLabel} onBack={backTo} />} />
        <Panel title="暂无评分数据" desc="该客户没有模型评分快照">
          <div style={{ fontSize: 13, color: '#94A3B8', padding: '16px 0' }}>请返回单客详情页查看其它板块。</div>
        </Panel>
      </div>
    );
  }

  const band = riskBand(prod, item.score);
  const hitTagCodes = useMemo(() => hitTagCodesOf(prod, cust), [prod, cust]);
  const scoreColor = band.color;
  const gradeBadgeKind = (band.code === 'HIGH' || band.code === 'VHIGH' ? 'red' : band.code === 'MID' ? 'amber' : 'green') as 'red' | 'amber' | 'green';
  const dims = dimsOf(gModel.dims ?? [], cust.riskDims ?? []);
  const hitLabels = (gModel.riskLabels ?? []).filter((l) => l.enabled && hitTagCodes.includes(l.tagCode));
  const allEvents = buildEvents(cust, item?.calcedAt ?? '', prod);

  // 全局预警（按客户匹配，带 alert_id / flowKey / flowState，可跳详情）
  const custGlobalAlerts = globalAlerts.filter((a) => a.cust_id === cust.custId);
  // 规则命中预警按"与当前模型的相关性"过滤：每个模型页面只看与本模型相关的预警（三页面不再雷同）；
  // 其余预警属于其他模型，归到对应模型页面展示
  const alertCards = custGlobalAlerts.filter((a) => alertModelOf(a.alert_type) === prod);
  const otherAlerts = custGlobalAlerts.filter((a) => alertModelOf(a.alert_type) !== prod);
  // 处置流程跟随本模型相关预警（红灯优先）；本模型无相关预警时回退到客户第一条有流程的预警（标注其归属模型）
  const flow = alertCards.find((a) => a.flowKey) ?? custGlobalAlerts.find((a) => a.flowKey);
  // 处置流程：直接跟随预警自带的 flowKey（如 f-alert-dispose），读管理中心业务流程库（bizFlows.json）动态匹配子流程，保证状态 / 按钮与标准框架一致（不再写死 f-score-dispose）
  // 具体流转由下方 FlowActionBar 统一渲染（流程名 + 状态 + 按钮），此处不再自绘状态行

  const goAlertDetail = (alertId?: string) => {
    if (alertId) goDetail('/console/cr/mid-alert-detail?id=' + alertId);
  };

  /* 得分变化：环比差值 + 趋势判断（智察分升=恶化；智信/智融分降=恶化） */
  const hist = history.filter((p) => (p as any)[prod] != null);
  const lastScore = hist.length ? ((hist[hist.length - 1] as any)[prod] as number) : null;
  const prevScore = hist.length > 1 ? ((hist[hist.length - 2] as any)[prod] as number) : null;
  const delta = lastScore != null && prevScore != null ? lastScore - prevScore : null;
  let trend: { t: string; c: string } | null = null;
  if (hist.length >= 3) {
    const vals = hist.slice(-3).map((p) => (p as any)[prod] as number);
    const peak = Math.max(...vals);
    const trough = Math.min(...vals);
    const swing = peak - trough;
    // 方向：最新 vs 上次；但仅看首末两点会漏掉中间波动 —— 额外判定区间内是否触及风险线 / 大幅波动
    const dirUp = lastScore > prevScore;
    const touchedRiskLine = isFraud ? peak >= 70 : false;
    const bigSwing = swing >= (isFraud ? 15 : 80);
    const worsened = isFraud ? (dirUp || touchedRiskLine) : (!dirUp || bigSwing);
    const note = touchedRiskLine ? '（曾触及高风险线）' : bigSwing ? '（区间内波动明显）' : '';
    trend = worsened
      ? { t: '近 3 月风险' + (isFraud ? '上升' : '恶化') + note, c: '#DC2626' }
      : { t: '近 3 月风险趋稳 / 向好', c: '#16A34A' };
  }

  /* 单模型分数（含旧数据兜底派生），供快捷入口展示 */
  const scoreOf = (k: ProdKey): number | null => {
    if (cust.scores?.[k]?.score != null) return cust.scores![k].score;
    const d = deriveFallback(cust, k);
    return d ? d.score : null;
  };

  const infoRow = (label: string, value: ReactNode, strong?: boolean) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #F1F5F9', padding: '9px 0' }}>
      <span style={{ color: '#64748B' }}>{label}</span>
      <span style={strong ? { fontWeight: 700, color: '#1E293B' } : { color: '#334155' }}>{value}</span>
    </div>
  );

  return (
    <div style={{ padding: 24, maxWidth: 1160 }}>
      <PageShell header={<DetailHeader title={`${meta.label} · ${cust.name}`} crumb={(source ? '评分产品' : '贷中监控') + ' / 单客详情 / 得分详情'} subtitle={`客户号 ${cust.custId} ｜ 产品 ${cust.product ?? ''} ｜ 证件号 ${cust.idCard}`} backLabel={backLabel} onBack={backTo} sticky={false} />} />
      <div className="space-y-4">

        {/* 客户概览：继承单客详情基础信息 + 右侧模型快捷入口（三模型独立页面互跳） */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-start', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 14, padding: '12px 16px' }}>
          <div style={{ flex: '1 1 340px', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', fontSize: 15, fontWeight: 700, color: '#1E293B' }}>
              {cust.name}
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginTop: 6, lineHeight: 1.7 }}>
              客户号 {cust.custId} ｜ 产品 {cust.product ?? '—'} ｜ 证件号 {cust.idCard} ｜ 贷款状态 {cust.loanStatus ?? '—'} ｜ 数据来源 
            </div>
          </div>
          <div style={{ flexShrink: 0 }}>
            <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 6 }}>模型评分快捷入口</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              {PROD_KEYS.map((k) => {
                const m = PROD_META[k];
                const s = scoreOf(k);
                const active = k === prod;
                return (
                  <button
                    key={k} type="button" title={`进入 ${m.label} 得分页面`}
                    onClick={() => goDetail('/console/cr/mid-cust-score?cust=' + custId + '&prod=' + k + (fromAlertId ? '&id=' + fromAlertId : ''))}
                    style={{
                      border: active ? '1.5px solid ' + m.color : '1px solid #E2E8F0',
                      background: active ? m.color + '0f' : '#fff', borderRadius: 8, padding: '6px 10px',
                      cursor: 'pointer', fontSize: 12, display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: 999, background: m.color }} />
                    <span style={{ fontWeight: active ? 600 : 500, color: active ? m.color : '#475569' }}>{m.label}</span>
                    <b style={{ color: '#334155', fontVariantNumeric: 'tabular-nums' }}>{s ?? '—'}</b>
                  </button>
                );
              })}
              <div style={{ fontSize: 12, color: '#64748B', borderLeft: '1px solid #E2E8F0', paddingLeft: 12, marginLeft: 4 }}>
                额度建议 <b style={{ color: '#6D28D9' }}>{cust.scores?.limitSuggest ?? '—'}</b>
                {cust.scores?.limit ? <span style={{ color: '#94A3B8' }}> / ¥{cust.scores.limit.toLocaleString()}</span> : null}
              </div>
            </div>
          </div>
        </div>

        {/* Tab 导航（仅 Tab 吸顶：标题不吸顶随滚动离开，Tab 吸到控制台 header 正下方 top=56px；zIndex 30 低于 header 的 z-40） */}
        <div style={{ position: 'sticky', top: 56, zIndex: 30, background: '#fff', borderBottom: '1px solid #E2E8F0', margin: '12px 0 0', padding: '6px 2px 0', display: 'flex', gap: 2 }}>
          {TABS.map((t) => (
            <button
              key={t.key} type="button" onClick={() => setTab(t.key)}
              style={{
                padding: '9px 16px', fontSize: 13.5, cursor: 'pointer', background: 'none', border: 'none',
                borderBottom: tab === t.key ? '2px solid #1E293B' : '2px solid transparent',
                color: tab === t.key ? '#1E293B' : '#64748B', fontWeight: tab === t.key ? 600 : 400,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ========== Tab1 得分 ========== */}
        {tab === 'score' && (
          <>
            <Panel title="模型分概览" desc="模型评分快照 + 维度拆解">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_440px]">
                {/* 左：概览 */}
                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                  {/* 环形图：加小标题 + 简短解释 */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 2 }}>总分</div>
                    <ScoreGauge value={item.score} min={item.range[0]} max={item.range[1]} label={`${item.unit}（${item.range[0]}-${item.range[1]}）`} color={meta.color} hint={undefined} />
                    <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 2 }}>{isFraud ? '分数越高，欺诈风险越大' : '分数越高，表现越好'}</div>
                  </div>
                  <div style={{ flex: 1, minWidth: 240, fontSize: 13 }}>
                    {infoRow('当前得分', <b style={{ fontSize: 18, color: scoreColor, fontVariantNumeric: 'tabular-nums' }}>{item.score}</b>)}
                    {infoRow('风险等级', <Badge kind={gradeBadgeKind}>{item.grade}{item.gradeLabel ? ` · ${item.gradeLabel}` : ''}</Badge>)}
                    {infoRow(isFraud ? '欺诈概率' : '违约概率', item.probability)}
                    {infoRow('风险标签', hitLabels.length ? (
                      <span style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'flex-end' }}>
                        {hitLabels.map((l) => <Badge key={l.id} kind={l.tagLevel === '重度风险' ? 'red' : l.tagLevel === '中度风险' ? 'amber' : l.tagLevel === '轻度风险' ? 'blue' : 'gray'}>{l.name}</Badge>)}
                      </span>
                    ) : <span style={{ color: '#94A3B8', fontSize: 12 }}>无命中</span>)}
                    {infoRow('模型版本', item.modelVersion)}
                    {infoRow('评分时间', item.calcedAt)}
                  </div>
                </div>
                {/* 右：维度拆解（维度名/权重读模型 ModelMeta.dims，与「模型信息」面板同源） */}
                <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 8 }}>
                    维度拆解 <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8' }}>各维度对最终分的贡献占比（%）· 权重来自模型信息</span>
                  </div>
                  <div style={{ flex: 1, border: '1px solid #F1F5F9', borderRadius: 10, padding: '2px 12px' }}>
                    {dims.map((d, i) => {
                      const lvl = d.lvl;
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '10px 0', borderBottom: i < dims.length - 1 ? '1px dashed #F1F5F9' : 'none' }}>
                          <span style={{ width: 88, flexShrink: 0, color: '#334155', fontWeight: 600 }}>{d.dim}</span>
                          <div style={{ flex: 1, height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(d.importance, 100)}%`, height: '100%', background: LEVEL_COLOR[lvl], borderRadius: 999 }} />
                          </div>
                          <span style={{ width: 44, textAlign: 'right', color: '#475569', fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{d.importance}%</span>
                          <span style={{ width: 58, textAlign: 'right', fontSize: 10, color: '#94A3B8' }} title="该维度自身评分（0-100）">维度分 {d.score}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="模型分趋势" desc="贷中重评轨迹与影响事件">
              {/* 最新分 + 环比 + 趋势 */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>最新得分</span>
                  <span style={{ fontSize: 30, fontWeight: 800, color: scoreColor, fontVariantNumeric: 'tabular-nums', lineHeight: 1 }}>{lastScore ?? '—'}</span>
                  {delta != null && (
                    <span style={{ fontSize: 13, fontWeight: 700, color: (isFraud ? delta > 0 : delta < 0) ? '#DC2626' : '#16A34A' }}>
                      {delta > 0 ? '▲' : delta < 0 ? '▼' : '＝'} {Math.abs(delta)}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#64748B' }}>
                  {prevScore != null ? `较上次重评（${hist[hist.length - 2]?.month ?? ''} · ${prevScore} 分）` : '尚无历史对比'}
                </div>
                {(() => {
                  const trig = [...(cust.alerts ?? [])].filter((a) => a.level !== 'OPPORTUNITY').sort((a, b) => String(b.time).localeCompare(String(a.time)))[0];
                  return (
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                      重评触发：{trig ? `${trig.scene}（${trig.ruleName} · ${trig.time}）` : '周期性月度重评'}
                    </div>
                  );
                })()}
                {trend && <Badge kind={trend.c === '#DC2626' ? 'red' : 'green'}>{trend.t}</Badge>}
              </div>
              {history.length ? (
                <LineChart
                  labels={history.map((p) => p.month)}
                  series={[{ name: meta.label, color: meta.color, data: history.map((p) => (p as any)[prod]) }]}
                  unit="分"
                  height={200}
                />
              ) : (
                <div style={{ fontSize: 13, color: '#94A3B8', padding: '6px 0' }}>暂无重评轨迹（贷中重评记录随预警/处置生成后留痕）。</div>
              )}
              <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 6 }}>
                纵轴：{meta.label}（{isFraud ? '0–100，越高欺诈风险越大' : item.range[0] + '–' + item.range[1] + '，越高表现越好'}）｜环比徽标按「最新 vs 上次」方向判定，并计入区间内是否触及风险线。
              </div>
            </Panel>

          </>
        )}

        {/* ========== Tab2 预警处置 ========== */}
        {tab === 'alert' && (
          <>
            <Panel title="预警处置" desc="分值/规则预警 → 工单处置（跟随预警自带业务流程）→ 处置动作">
              {/* 6.6.1 业务流程处置功能条（跟随预警自带 flowKey，由管理中心业务流程库驱动，复用标准 FlowActionBar） */}
              {flow ? (
                <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginBottom: 8 }}>
                    工单由「{flow.alert_type}」预警驱动（{flow.alert_date} · 流程 {flow.flowKey}）
                    {alertModelOf(flow.alert_type) === prod
                      ? <span style={{ color: meta.color, fontWeight: 600 }}>（与当前 {meta.label} 相关）</span>
                      : <span>（该预警主要影响 {flow.alert_type ? PROD_META[alertModelOf(flow.alert_type) ?? 'zhicha'].label : ''}）</span>}
                  </div>
                  <FlowActionBar
                    flowId={flow.flowKey ?? 'f-alert-dispose'}
                    state={String(flow.flowState ?? '')}
                    matchObj={{ level: flow.level ?? '', alert_type: flow.alert_type ?? '' }}
                    onStateChange={(next) => updateAlerts((list) => list.map((a) => a.alert_id === flow.alert_id ? { ...a, flowState: next, flowStateAt: new Date().toISOString().slice(0, 19).replace('T', ' ') } : a))}
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                    <button
                      type="button"
                      onClick={() => goAlertDetail(flow.alert_id)}
                      style={{ fontSize: 12.5, background: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 14px', cursor: 'pointer' }}
                    >
                      查看预警详情
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', marginBottom: 12 }}>
                  <span style={{ fontSize: 12.5, color: '#94A3B8' }}>该客户暂无进行中的处置工单</span>
                </div>
              )}

              {/* 6.6.2 融合处置规则判断结果（读模型 Tab4 融合规则，按本客户基础等级 + 命中标签实时判定） */}
              {(() => {
                const flowName = (id?: string) => flows.find((f) => f.id === id)?.name ?? '未关联'
                const fz = fusionByLevel(gModel, band.code, hitTagCodes)
                return (
                  <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', marginBottom: 12, background: '#F8FAFC' }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>融合处置规则判断结果</div>
                    <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.9 }}>
                      基础风险等级 <b>{band.level}</b>（{band.range}）
                      {hitLabels.length ? ` ＋ 命中标签 ${hitLabels.map((l) => l.name).join('、')}` : ' ＋ 无命中标签'}
                      {' → 最终处置 '}
                      <b style={{ color: fz.decision === '拒绝' ? '#DC2626' : fz.decision === '转人工' ? '#D97706' : '#16A34A' }}>{fz.decision}</b>
                      {fz.processId ? `（流程：${flowName(fz.processId)}）` : ''}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 6 }}>{fz.remark}</div>
                  </div>
                );
              })()}

              {/* 分值阈值预警：综合分碰撞区间定级 */}
              {(() => {
                const b = riskBand(prod, item.score);
                return (
                  <div style={{ border: '1px solid ' + b.color + '55', background: b.color + '0d', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 13 }}>
                      <Badge kind={b.color === '#DC2626' ? 'red' : b.color === '#D97706' ? 'amber' : 'green'}>{b.grade}</Badge>
                      <span style={{ fontWeight: 600, color: '#1E293B' }}>{meta.label} {item.score}</span>
                      <span style={{ color: '#64748B' }}>落入「{b.range}」区间（{b.label}）→ 触发分值预警</span>
                      <span style={{ marginLeft: 'auto', fontSize: 12, color: '#64748B' }}>建议处置：<b style={{ color: b.color }}>{b.action}</b></span>
                    </div>
                  </div>
                );
              })()}

              {/* 规则命中预警列表（只显示与当前模型相关的预警：三模型页面各看各的；卡片配色按预警等级，不用模型色） */}
              <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', margin: '14px 0 8px' }}>
                规则命中预警（{alertCards.length} 条）
                <span style={{ fontSize: 11, fontWeight: 400, color: '#94A3B8', marginLeft: 8 }}>
                  {meta.label} 相关 · 来自全局预警平台（midAlerts，运行中）
                </span>
              </div>
              {alertCards.length ? (
                <div className="space-y-2">
                  {alertCards.map((a, i) => {
                    const lvColor = a.level === 'RED' ? '#DC2626' : a.level === 'YELLOW' ? '#D97706' : '#16A34A';
                    const lvKind = a.level === 'RED' ? 'red' : a.level === 'YELLOW' ? 'amber' : 'green';
                    return (
                      <button
                        key={i} type="button"
                        onClick={() => goAlertDetail(a.alert_id)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                          border: '1px solid ' + lvColor + '55',
                          borderRadius: 10, padding: '10px 14px', background: lvColor + '0d', cursor: 'pointer',
                        }}
                      >
                        <Badge kind={lvKind}>{a.level === 'RED' ? '红' : a.level === 'YELLOW' ? '黄' : '机'}</Badge>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            {a.alert_type} · {a.scene}
                            <span style={{ fontSize: 10.5, color: '#fff', background: meta.color, borderRadius: 6, padding: '1px 7px' }}>本模型相关</span>
                          </div>
                          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{a.rule_name} · 触发值 {a.metric_value}（阈值 {a.threshold}）· {a.alert_date}</div>
                        </div>
                        <div style={{ fontSize: 12, color: a.flowState ? '#D97706' : '#94A3B8', flexShrink: 0 }}>{a.flowState ?? (a.status ?? '待处置')}</div>
                        <span style={{ fontSize: 12, color: '#94A3B8', flexShrink: 0 }}>›</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>该客户暂无与 {meta.label} 相关的规则命中预警。</div>
              )}
              {otherAlerts.length > 0 && (
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 10, lineHeight: 1.8, background: '#F8FAFC', border: '1px dashed #E2E8F0', borderRadius: 8, padding: '8px 12px' }}>
                  另有 {otherAlerts.length} 条预警属于其他模型：
                  {otherAlerts.map((a, i) => (
                    <span key={i} style={{ marginLeft: 8 }}>
                      <span style={{ color: PROD_META[alertModelOf(a.alert_type) ?? 'zhicha'].color }}>{PROD_META[alertModelOf(a.alert_type) ?? 'zhicha'].label}</span>
                      · {a.alert_type}
                      <span style={{ color: '#CBD5E1' }}>｜</span>
                    </span>
                  ))}
                </div>
              )}
            </Panel>

            {/* 操作日志（由 Tab1 迁入：评分/预警/处置/审批/核验 统一时间线，按时间倒序） */}
            <Panel title="操作日志">
              <div style={{ display: 'flex', gap: 12, fontSize: 11, color: '#94A3B8', marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#0891B2', display: 'inline-block' }} />评分/重评</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />预警</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#185FA5', display: 'inline-block' }} />处置</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />审批</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#D97706', display: 'inline-block' }} />核验</span>
              </div>
              {allEvents.length ? (
                <div className="space-y-1">
                  {allEvents.map((ev, i) => <EventLine key={i} ev={ev} />)}
                </div>
              ) : (
                <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>暂无操作日志。</div>
              )}
            </Panel>
          </>
        )}

        {/* ========== Tab3 用户数据 ========== */}
        {tab === 'data' && (
          <>
            <Panel title="数据明细" desc={`${meta.label} 评分使用的原始数据 · 点击字段行展开查看来源/窗口/取值/明细`}>
              {INPUT_DETAILS[prod].map((d, i) => {
                const open = !!openInput[i];
                const statusKind = d.status === '触发' ? 'red' : d.status === '关注' ? 'amber' : 'green';
                return (
                  <div key={i} style={{ border: '1px solid ' + (open ? '#CBD5E1' : '#F1F5F9'), borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setOpenInput((s) => ({ ...s, [i]: !s[i] }))}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#fff', border: 'none', cursor: 'pointer', textAlign: 'left' }}
                    >
                      <span style={{ fontSize: 11, color: '#94A3B8', flexShrink: 0, width: 16, textAlign: 'center' }}>{open ? '▾' : '▸'}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1E293B', width: 160, flexShrink: 0 }}>{d.name}</span>
                      <span style={{ fontSize: 12, color: '#475569', flex: 1, minWidth: 0, textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.value}</span>
                      <Badge kind={statusKind}>{d.status}</Badge>
                    </button>
                    {open && (
                      <div style={{ padding: '4px 14px 12px 42px', background: '#F8FAFC', borderTop: '1px dashed #E2E8F0' }}>
                        {/* 字段列表：一个一个字段展示 */}
                        <div style={{ fontSize: 12 }}>
                          <FieldRow k="数据来源" v={d.source} />
                          <FieldRow k="统计窗口" v={d.window} />
                          <FieldRow k="字段值" v={d.value} strong />
                          <FieldRow k="供模型特征" v={d.feat} />
                        </div>
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: '#64748B', margin: '10px 0 6px' }}>{d.detailTitle}</div>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, background: '#fff', border: '1px solid #E2E8F0', borderRadius: 8 }}>
                          <thead>
                            <tr>
                              {d.cols.map((c, j) => (
                                <th key={j} style={{ textAlign: 'left', padding: '5px 8px', color: '#94A3B8', fontWeight: 500, borderBottom: '1px solid #E2E8F0' }}>{c}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {d.rows.map((r, j) => (
                              <tr key={j} style={{ borderBottom: '1px solid #EEF2F7' }}>
                                {r.map((cell, k) => (
                                  <td key={k} style={{ padding: '5px 8px', color: '#334155' }}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>状态：触发=踩线命中规则预警；关注=接近阈值待观察；正常=正常参与评分。</div>
            </Panel>
          </>
        )}

        {/* ========== Tab4 模型信息 ========== */}
        {tab === 'model' && (
          <>
            <Panel title="模型算法" desc="本模型真实计算链路（数据源 → 算法与因子 → 输出概率 p + SHAP，主线视图；规则集/碰撞/决策等支线已隐藏）；本客户当前得分已在高亮节点显示">
              <ModelDecisionGraph
                prod={prod as ScoreProd}
                model={gModel}
                thresholds={data.thresholds}
                mainOnly
                hideNodeTable
                graph={prod === 'zhixin' ? PIPELINE_GRAPHS.zhixin_credit_v1 : undefined}
                nodeResults={nodeResults}
                currentScore={item.score}
                onJumpRules={() => goDetail('/console/cm/rule-hub')}
                onJumpStrategy={() => goDetail('/console/sc/model-detail?prod=' + prod + '&tab=fusion')}
              />
            </Panel>

            <Panel title="融合处置规则（模型模具 · 只读）" desc="规则由「模型管理 · 模型详情 · 处置策略」配置，此处只读；★ 标记本客户实际命中的规则">
              {/* 6.8 融合处置规则（只读模具 + 本客户命中结果高亮） */}
              {(() => {
                const flowName = (id?: string) => flows.find((f) => f.id === id)?.name ?? '未关联'
                const fz = fusionByLevel(gModel, band.code, hitTagCodes)
                const rules = (gModel.fusionRules ?? []).slice().sort((a, b) => a.ruleSort - b.ruleSort)
                const tagName = (c: string) => (gModel.riskLabels ?? []).find((l) => l.tagCode === c)?.name ?? c
                return (
                  <>
                    <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', background: '#F8FAFC', marginBottom: 10 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', marginBottom: 6 }}>本客户命中结果</div>
                      <div style={{ fontSize: 12.5, color: '#334155', lineHeight: 1.8 }}>
                        基础风险等级 <b>{band.level}</b>
                        {hitLabels.length ? ` ＋ 命中标签 ${hitLabels.map((l) => l.name).join('、')}` : ' ＋ 无命中标签'}
                        {' → 最终处置 '}
                        <b style={{ color: fz.decision === '拒绝' ? '#DC2626' : fz.decision === '转人工' ? '#D97706' : '#16A34A' }}>{fz.decision}</b>
                        {fz.processId ? `（流程：${flowName(fz.processId)}）` : ''}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 6 }}>{fz.remark}</div>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                        <thead>
                          <tr style={{ color: '#64748B', textAlign: 'left' }}>
                            <th style={{ padding: '5px 8px', borderBottom: '1px solid #E2E8F0' }}>排序</th>
                            <th style={{ padding: '5px 8px', borderBottom: '1px solid #E2E8F0' }}>适配基础等级</th>
                            <th style={{ padding: '5px 8px', borderBottom: '1px solid #E2E8F0' }}>引用标签 + 匹配方式</th>
                            <th style={{ padding: '5px 8px', borderBottom: '1px solid #E2E8F0' }}>处置意见</th>
                            <th style={{ padding: '5px 8px', borderBottom: '1px solid #E2E8F0' }}>关联业务流程</th>
                            <th style={{ padding: '5px 8px', borderBottom: '1px solid #E2E8F0' }}>处置说明</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rules.map((r) => {
                            const matched = fz.matchedRule?.id === r.id
                            return (
                              <tr key={r.id} style={{ color: '#334155', background: matched ? '#EFF6FF' : undefined }}>
                                <td style={{ padding: '5px 8px', borderBottom: '1px dashed #F1F5F9' }}>{r.ruleSort}</td>
                                <td style={{ padding: '5px 8px', borderBottom: '1px dashed #F1F5F9' }}>
                                  <span style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                    {(r.baseRiskLevel as string[]).map((lv) => <Badge key={lv} kind={lv === 'HIGH' || lv === 'VHIGH' ? 'red' : lv === 'MID' ? 'amber' : lv === 'VLOW' || lv === 'LOW' ? 'green' : 'gray'}>{lv === 'ALL' ? '全部' : lv === 'VLOW' ? '极低' : lv === 'LOW' ? '低' : lv === 'MID' ? '中' : lv === 'HIGH' ? '高' : '极高'}</Badge>)}
                                  </span>
                                </td>
                                <td style={{ padding: '5px 8px', borderBottom: '1px dashed #F1F5F9' }}>
                                  {(r.matchTagList as string[]).length
                                    ? (r.matchTagList as string[]).map((c) => tagName(c)).join('、') + `（${r.matchMode === 'all' ? '全部命中' : '任意命中'}）`
                                    : '仅看等级（无标签条件）'}
                                </td>
                                <td style={{ padding: '5px 8px', borderBottom: '1px dashed #F1F5F9' }}>
                                  <Badge kind={r.finalDecision === '拒绝' ? 'red' : r.finalDecision === '转人工' ? 'amber' : 'green'}>{r.finalDecision}</Badge>
                                  {matched ? <span style={{ color: '#1D4ED8', marginLeft: 4 }}>★本客户命中</span> : null}
                                </td>
                                <td style={{ padding: '5px 8px', borderBottom: '1px dashed #F1F5F9' }}>{flowName(r.processId)}</td>
                                <td style={{ padding: '5px 8px', borderBottom: '1px dashed #F1F5F9', color: '#94A3B8' }}>{r.outputRemark}</td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                    <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 6 }}>★ 本客户命中规则：基础等级 + 标签自上而下首条匹配即生效；规则由「模型管理 · 模型详情 · 处置策略」配置（此处只读）。</div>
                  </>
                );
              })()}
            </Panel>

            <Panel title="基本信息" desc="模型版本与归属">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
                <CapCell label="模型" value={`${meta.label} · ${item.modelVersion}`} />
                <CapCell label="最近训练" value={reg.lastTrain ?? '—'} />
                <CapCell label="输入数据版本" value="2026Q2" />
                <CapCell label="适用客群" value={capa.applicable} />
                <CapCell label="模型负责人" value={capa.owner} />
                <CapCell label="状态" value={reg.status?.v ?? '—'} />
                <CapCell label="评分时间" value={item.calcedAt} />
              </div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#475569', margin: '16px 0 8px' }}>版本历史</div>
              <div className="space-y-2">
                {capa.versions.map((v, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 12px', border: '1px solid #F1F5F9', borderRadius: 10, background: i === 0 ? meta.color + '08' : '#fff' }}>
                    <div style={{ flexShrink: 0, width: 110 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: meta.color }}>{v.version}</div>
                      <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{v.date}</div>
                    </div>
                    <div style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.7 }}>{v.note}</div>
                    {i === 0 && <Badge kind={meta.danger ? 'red' : 'green'}>当前</Badge>}
                  </div>
                ))}
              </div>
            </Panel>


            {prod === 'zhixin' ? <ScorecardLedger cust={cust} /> : null}
          </>
        )}

              </div>
    </div>
  );
}

/* ===== 评分卡计算账本（智信分 · 可验证计算） =====
 * 输入 5 个原始值 → 按 ZHIXIN_SCORECARD 分箱加分 → 基础分 600 + 加分 = 总分（裁剪 300-900）。
 * 默认样例输入与 model-trace.html 一致（m3=1, dir=58, inc=14, q6=8, util=43 → 712 分可复现）。
 */
function ScorecardLedger({ cust }: { cust: MidCustomer }) {
  const [raw, setRaw] = useState({ m3: 1, dir: 58, inc: 14, q6: 8, util: 43 });
  const result = useMemo(() => computeZhixin(raw), [raw]);
  const grade = result.score <= 540 ? 'D' : result.score <= 660 ? 'C' : result.score <= 780 ? 'B' : 'A';
  const gradeColor = grade === 'A' ? '#16A34A' : grade === 'B' ? '#0891B2' : grade === 'C' ? '#D97706' : '#DC2626';

  const fieldDefs = [
    { key: 'm3' as const, label: '历史逾期（近2年 M3+ 次数）', unit: '次', min: 0, max: 5 },
    { key: 'dir' as const, label: '负债收入比（%）', unit: '%', min: 0, max: 100 },
    { key: 'inc' as const, label: '收入稳定（连续还款月数）', unit: '月', min: 0, max: 36 },
    { key: 'q6' as const, label: '征信查询（近6月次数）', unit: '次', min: 0, max: 30 },
    { key: 'util' as const, label: '授信使用率（%）', unit: '%', min: 0, max: 100 },
  ];

  return (
    <Panel title="评分卡计算账本" desc="输入原始数据 → 分箱加分 → 总分：分数可复核（基础分 600，样例输入 712 分可复现）">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        {fieldDefs.map((f) => (
          <label key={f.key} style={{ display: 'block' }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>{f.label}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <input
                type="number"
                value={raw[f.key]}
                min={f.min}
                max={f.max}
                onChange={(e) => setRaw((r) => ({ ...r, [f.key]: Number(e.target.value) }))}
                style={{ width: '100%', border: '1px solid #E2E8F0', borderRadius: 8, padding: '6px 10px', fontSize: 14, outline: 'none' }}
              />
              <span style={{ fontSize: 12, color: '#94A3B8' }}>{f.unit}</span>
            </div>
          </label>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '14px 0 4px', padding: '10px 14px', background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10 }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748B' }}>总分（基础 600 + {result.total}）</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: gradeColor, fontVariantNumeric: 'tabular-nums' }}>{result.score}</div>
        </div>
        <div>
          <div style={{ fontSize: 12, color: '#64748B' }}>信用等级</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: gradeColor }}>{grade}</div>
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.7 }}>
          参考动作：{grade === 'D' ? '拒绝' : grade === 'C' ? '审慎授信' : grade === 'B' ? '标准额度' : '提额 + 优先经营'}
          <br />客户：{cust.name} · {cust.custId}（样例输入，可拖动调整验证）
        </div>
      </div>

      <div style={{ overflowX: 'auto', marginTop: 6 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12.5 }}>
          <thead>
            <tr style={{ color: '#64748B', textAlign: 'left' }}>
              <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0' }}>评分因子</th>
              <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0' }}>输入值</th>
              <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0' }}>命中分箱</th>
              <th style={{ padding: '6px 10px', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>加分</th>
            </tr>
          </thead>
          <tbody>
            {result.steps.map((s, i) => (
              <tr key={i} style={{ color: '#334155' }}>
                <td style={{ padding: '6px 10px', borderBottom: '1px dashed #F1F5F9' }}>{s.factor}</td>
                <td style={{ padding: '6px 10px', borderBottom: '1px dashed #F1F5F9', fontVariantNumeric: 'tabular-nums' }}>{s.input}</td>
                <td style={{ padding: '6px 10px', borderBottom: '1px dashed #F1F5F9' }}>
                  <span style={{ background: s.bin === '未覆盖区间' ? '#FEF3C7' : '#F1F5F9', borderRadius: 6, padding: '1px 8px' }}>{s.bin}</span>
                </td>
                <td style={{ padding: '6px 10px', borderBottom: '1px dashed #F1F5F9', textAlign: 'right', fontWeight: 700, color: s.points >= 0 ? '#16A34A' : '#DC2626' }}>{s.points > 0 ? '+' : ''}{s.points}</td>
              </tr>
            ))}
            <tr style={{ color: '#0F172A', fontWeight: 700 }}>
              <td style={{ padding: '6px 10px' }}>合计加分</td>
              <td colSpan={2} />
              <td style={{ padding: '6px 10px', textAlign: 'right' }}>{result.total > 0 ? '+' : ''}{result.total}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 11.5, color: '#94A3B8', marginTop: 8 }}>
        分箱表与阈值见 <code>scoreData.ts</code> ZHIXIN_SCORECARD / model-trace.html；区间端点含、gt/lt 不含；未覆盖区间记 0 分。
      </div>
    </Panel>
  );
}
