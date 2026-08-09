/* 单客得分详情页（cr:mid-cust-score?cust=&prod=&id=）
 * 从单客详情「模型评分」板块三卡片点击进入：看维度 → 证据明细（可解释性）
 * 满足审核人员：为什么是这个分 / 证据明细 / 决策建议 / 审批历史
 * 满足监管：模型版本 / 评分时间 / 等级阈值 / 评分依据说明 / 合规留痕
 * 旧数据（midCustomers.json 缺新字段）按分数 + 产品运行时兜底派生，不依赖重落盘
 */
import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { DetailHeader, Panel, Badge, DataTable, type Column, type Row } from '../components/ui';
import ScoreGauge from '../components/ScoreGauge';
import { Sam } from './SourceTag';
import { PageShell } from './PageShell';
import { useMidCustomers } from './midStore';
import type { MidCustomer, ModelScoreItem, ScoreEvidenceItem } from './midData';

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

/* ---- 旧数据兜底：缺可解释字段时按分数 + 产品派生 ---- */
function bandOf(item: ModelScoreItem): string {
  const s = item.score;
  const hi = item.range[1] > 100; // 300-900 区间：信用/综合；0-100：欺诈
  if (hi) {
    if (s >= 780) return 'A';
    if (s >= 660) return 'B';
    if (s >= 580) return 'C';
    return 'D';
  }
  if (s >= 70) return '高';
  if (s >= 40) return '中';
  return '低';
}
const GRADE_LABEL: Record<string, string> = { A: '优质', B: '良好', C: '一般', D: '较差', 高: '高风险', 中: '中风险', 低: '低风险' };

function enrich(item: ModelScoreItem, prod: ProdKey): ModelScoreItem {
  const band = bandOf(item);
  const score = item.score;
  const isFraud = prod === 'zhicha';
  const probability = item.probability ?? (isFraud
    ? (score >= 70 ? '72.5%' : score >= 40 ? '38.2%' : '9.6%')
    : (band === 'A' ? '3.1%' : band === 'B' ? '6.8%' : band === 'C' ? '14.2%' : '26.5%'));
  const grade = item.grade ?? band;
  const gradeLabel = item.gradeLabel ?? GRADE_LABEL[band] ?? '';
  const suggestion = item.suggestion ?? (isFraud
    ? (score >= 70 ? '建议拒绝 / 转人工复核' : score >= 40 ? '建议人工复核' : '通过（继续准入评估）')
    : (band === 'A' ? '建议准入（标准额度）' : band === 'B' ? '建议准入（审慎授信）' : band === 'C' ? '建议降额 / 加强监测' : '建议拒绝'));
  const modelVersion = item.modelVersion ?? (prod === 'zhicha' ? '智察V3.2' : prod === 'zhixin' ? '智信V4.0' : '智融V2.1');
  const calcedAt = item.calcedAt ?? '2026-08-08 10:30:12';
  const evidence: ScoreEvidenceItem[] = item.evidence && item.evidence.length ? item.evidence : (
    prod === 'zhicha' ? [
      { name: '多头借贷强度', value: '近30天申贷 7 家（阈值≥5）', weight: 28, tag: '命中' },
      { name: '设备环境风险', value: '模拟器特征命中', weight: 22, tag: '命中' },
      { name: '命中灰名单', value: '外部灰名单 ID#88231', weight: 20, tag: '命中' },
      { name: '同设备关联账号', value: '3 个关联账号', weight: 18, tag: '关注' },
    ] : prod === 'zhixin' ? [
      { name: '历史逾期记录', value: '近2年 M3+ 1 次', weight: 26, tag: '评分项' },
      { name: '负债收入比', value: '58%（阈值 70%）', weight: 22, tag: '评分项' },
      { name: '征信查询频次', value: '近6月 8 次', weight: 18, tag: '评分项' },
      { name: '收入稳定性', value: '连续 14 月稳定', weight: 20, tag: '评分项' },
    ] : [
      { name: '违约维度', value: '引用 · 智信分（信用分 712）', weight: 34, tag: '融合来源' },
      { name: '欺诈维度', value: '引用 · 智察分（欺诈分 78）', weight: 28, tag: '融合来源' },
      { name: '价值维度', value: '自有 · 借贷兴趣（近30天活跃 18 天）', weight: 24, tag: '融合来源' },
      { name: '资产维度', value: '自有 · 资产画像（房产 + 理财持仓）', weight: 14, tag: '融合来源' },
    ]
  );
  return { ...item, probability, grade, gradeLabel, suggestion, modelVersion, calcedAt, evidence };
}

/* 等级阈值表（监管可解释：分数区间 → 等级含义） */
const THRESHOLDS: Record<ProdKey, { range: string; grade: string; label: string; color: string }[]> = {
  zhicha: [
    { range: '0 - 39', grade: '低风险', label: '无明显欺诈特征', color: '#16A34A' },
    { range: '40 - 69', grade: '中风险', label: '存在部分风险信号', color: '#D97706' },
    { range: '70 - 100', grade: '高风险', label: '欺诈特征显著', color: '#DC2626' },
  ],
  zhixin: [
    { range: '780 - 900', grade: 'A · 优质', label: '违约概率低', color: '#16A34A' },
    { range: '660 - 779', grade: 'B · 良好', label: '违约概率较低', color: '#65A30D' },
    { range: '580 - 659', grade: 'C · 一般', label: '违约概率中等', color: '#D97706' },
    { range: '300 - 579', grade: 'D · 较差', label: '违约概率高', color: '#DC2626' },
  ],
  zhirong: [
    { range: '780 - 900', grade: 'A · 优质', label: '综合风险低、价值高', color: '#16A34A' },
    { range: '660 - 779', grade: 'B · 良好', label: '综合表现良好', color: '#65A30D' },
    { range: '580 - 659', grade: 'C · 一般', label: '综合表现一般', color: '#D97706' },
    { range: '300 - 579', grade: 'D · 较差', label: '综合风险高', color: '#DC2626' },
  ],
};

export default function CustScoreDetail() {
  const [params] = useSearchParams();
  const custId = params.get('cust') ?? '';
  const prodParam = (params.get('prod') ?? 'zhicha') as ProdKey;
  const prod: ProdKey = PROD_KEYS.includes(prodParam) ? prodParam : 'zhicha';
  const fromAlertId = params.get('id') ?? '';
  const nav = useNavigate();
  const customers = useMidCustomers();
  const cust: MidCustomer | undefined = useMemo(
    () => customers.find((c) => c.custId === custId) ?? customers[0],
    [customers, custId],
  );
  const meta = PROD_META[prod];
  const item = useMemo<ModelScoreItem | null>(() => (cust?.scores?.[prod] ? enrich(cust.scores[prod], prod) : null), [cust, prod]);
  const backTo = () => nav('/console/cr/mid-cust-detail?cust=' + custId + (fromAlertId ? '&id=' + fromAlertId : ''));

  if (!cust || !item) {
    return (
      <div style={{ padding: 24 }}>
        <PageShell header={<DetailHeader title="得分详情" crumb="贷中监控 / 单客详情 / 得分详情" backLabel="← 返回单客详情" onBack={backTo} />} />
        <Panel title="暂无评分数据" desc="该客户没有模型评分快照">
          <div style={{ fontSize: 13, color: '#94A3B8', padding: '16px 0' }}>请返回单客详情页查看其它板块。</div>
        </Panel>
      </div>
    );
  }

  const scoreColor = meta.danger
    ? (item.score >= 70 ? '#DC2626' : item.score >= 40 ? '#D97706' : '#16A34A')
    : (item.score >= 660 ? '#16A34A' : item.score >= 580 ? '#D97706' : '#DC2626');
  const approvalCols: Column[] = [
    { key: 'time', label: '时间', width: '140px' },
    { key: 'kind', label: '类型', width: '100px' },
    { key: 'result', label: '结论', type: 'badge', badgeKind: 'gray', width: '90px' },
    { key: 'opinion', label: '审批意见' },
    { key: 'operator', label: '经办人', width: '100px' },
  ];
  const approvalRows: Row[] = (cust.approvalRecords ?? []).map((r, i) => ({
    id: String(i), time: r.time, kind: r.kind,
    result: { v: r.result, kind: r.result === '通过' ? 'green' : r.result === '拒绝' ? 'red' : 'amber' },
    opinion: r.opinion, operator: r.operator,
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1160 }}>
      <PageShell header={<DetailHeader title={`${meta.label} · ${cust.name}`} crumb="贷中监控 / 单客详情 / 得分详情" subtitle={`客户号 ${cust.custId} ｜ 产品 ${cust.product ?? ''} ｜ 证件号 ${cust.idCard}`} backLabel="← 返回单客详情" onBack={backTo} />} />
      <div className="space-y-6">
          {/* 三产品切换 */}
          <div style={{ display: 'flex', gap: 8 }}>
            {PROD_KEYS.map((k) => {
              const m = PROD_META[k];
              const active = k === prod;
              return (
                <button key={k} type="button"
                  onClick={() => nav('/console/cr/mid-cust-score?cust=' + custId + '&prod=' + k + (fromAlertId ? '&id=' + fromAlertId : ''))}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
                    border: active ? '1px solid ' + m.color : '1px solid #E2E8F0',
                    background: active ? (m.color + '14') : '#fff', fontSize: 13,
                  }}>
                  <span style={{ width: 8, height: 8, borderRadius: 999, background: m.color }} />
                  <span style={{ fontWeight: active ? 600 : 500, color: active ? m.color : '#475569' }}>{m.label}</span>
                  <span style={{ fontSize: 11, color: '#94A3B8' }}>{m.sub}</span>
                  <span style={{ fontWeight: 800, color: active ? m.color : '#334155', fontVariantNumeric: 'tabular-nums' }}>{cust.scores?.[k]?.score ?? '—'}</span>
                </button>
              );
            })}
            <span style={{ marginLeft: 'auto', alignSelf: 'center', fontSize: 12, color: '#94A3B8' }}>数据来源 <Sam label="样例" value="midCustomers.json.scores" /></span>
          </div>

          {/* 得分概览 + 决策建议 */}
          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <Panel title="得分概览" desc="模型输出 + 可解释结论">
              <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                <div style={{ minWidth: 240, flex: '0 0 auto' }}>
                  <ScoreGauge value={item.score} min={item.range[0]} max={item.range[1]} label={`${item.unit}（${item.range[0]}-${item.range[1]}）`} color={meta.color} hint={item.hint} />
                </div>
                <div style={{ flex: 1, minWidth: 240, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', padding: '8px 0' }}>
                    <span style={{ color: '#64748B' }}>当前得分</span>
                    <b style={{ fontSize: 18, color: scoreColor, fontVariantNumeric: 'tabular-nums' }}>{item.score}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', padding: '8px 0' }}>
                    <span style={{ color: '#64748B' }}>{prod === 'zhicha' ? '欺诈概率' : '违约概率'}</span>
                    <b>{item.probability}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', padding: '8px 0' }}>
                    <span style={{ color: '#64748B' }}>风险等级</span>
                    <span><Badge kind={meta.danger ? (item.grade === '高' ? 'red' : item.grade === '中' ? 'amber' : 'green') : (item.grade === 'A' ? 'green' : item.grade === 'B' ? 'green' : item.grade === 'C' ? 'amber' : 'red')}>{item.grade}{item.gradeLabel ? ` · ${item.gradeLabel}` : ''}</Badge></span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', padding: '8px 0' }}>
                    <span style={{ color: '#64748B' }}>模型版本</span>
                    <b>{item.modelVersion}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                    <span style={{ color: '#64748B' }}>评分时间</span>
                    <b>{item.calcedAt}</b>
                  </div>
                </div>
              </div>
            </Panel>

            <Panel title="决策建议" desc="审核出口">
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
                <div style={{ background: (meta.color + '14'), border: '1px solid ' + meta.color + '44', borderRadius: 10, padding: '12px 14px' }}>
                  <div style={{ color: '#64748B', fontSize: 12, marginBottom: 4 }}>模型决策建议</div>
                  <div style={{ fontWeight: 700, color: '#1E293B' }}>{item.suggestion}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #F1F5F9', padding: '8px 0' }}>
                  <span style={{ color: '#64748B' }}>额度建议</span>
                  <b>{cust.scores?.limitSuggest ?? '—'}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: '#64748B' }}>建议额度</span>
                  <b style={{ fontSize: 16, color: '#1E293B' }}>¥{(cust.scores?.limit ?? 0).toLocaleString()}</b>
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.7 }}>
                  本页评分与建议仅供审核参考，最终决策需结合人工复核确认并留痕；拒绝 / 降额需在审批意见中注明理由。
                </div>
              </div>
            </Panel>
          </div>

          {/* 评分依据与模型说明（监管可解释） */}
          <Panel title="评分依据与模型说明" desc="分数含义 · 等级阈值 · 合规说明">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.9, marginBottom: 12 }}>
                  <b>{meta.label}（{meta.sub}）</b>：{item.hint}。分数由「{item.factors.map((f) => f.name).join('、')}」等维度综合计算得出，
                  各维度贡献见下方「风险因子维度」。模型版本 {item.modelVersion}，评分时间 {item.calcedAt}。
                </div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.9, background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px' }}>
                  <b style={{ color: '#475569' }}>合规说明：</b>本评分由系统模型自动计算，评分结果及因子明细完整留痕，可回溯、可复核；
                  模型输出仅作辅助决策，不替代人工审核；对评分结果有异议可发起复核并记录审批意见。
                </div>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#475569', marginBottom: 8 }}>等级阈值</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ color: '#94A3B8', fontSize: 12, textAlign: 'left', borderBottom: '1px solid #E2E8F0' }}>
                      <th style={{ padding: '8px 10px', fontWeight: 500 }}>分数区间</th>
                      <th style={{ padding: '8px 10px', fontWeight: 500 }}>等级</th>
                      <th style={{ padding: '8px 10px', fontWeight: 500 }}>含义</th>
                    </tr>
                  </thead>
                  <tbody>
                    {THRESHOLDS[prod].map((t, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                        <td style={{ padding: '8px 10px', fontVariantNumeric: 'tabular-nums', color: '#334155' }}>{t.range}</td>
                        <td style={{ padding: '8px 10px', fontWeight: 600, color: t.color }}>{t.grade}</td>
                        <td style={{ padding: '8px 10px', color: '#64748B' }}>{t.label}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 8 }}>当前得分 {item.score} 落在「{item.grade}」档位。</div>
              </div>
            </div>
          </Panel>

          {/* 风险因子维度 */}
          <Panel title="风险因子维度" desc="各因子对评分的贡献度（权重合计约 100%）">
            <div className="space-y-4">
              {item.factors.map((f, i) => (
                <div key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13 }}>
                    <span style={{ color: '#334155' }}>{f.name}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Badge kind={f.level === '高' ? 'red' : f.level === '中' ? 'amber' : 'green'}>{f.level}风险</Badge>
                      <b style={{ fontVariantNumeric: 'tabular-nums' }}>{f.contribution}%</b>
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
                    <div style={{ flex: 1, height: 8, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(f.contribution * 2.4, 100)}%`, height: '100%', background: LEVEL_COLOR[f.level], borderRadius: 999 }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 证据明细 */}
          <Panel title="证据明细" desc={prod === 'zhicha' ? '规则命中明细：解释为什么判可疑' : prod === 'zhixin' ? '评分卡项明细：解释各评分项贡献' : '融合构成明细：解释综合分由什么融合而来'}>
            <div className="space-y-3">
              {item.evidence.map((e, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #F1F5F9', borderRadius: 10, padding: '10px 14px' }}>
                  <Badge kind={TAG_KIND[e.tag ?? '评分项'] ?? 'gray'}>{e.tag ?? '证据'}</Badge>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1E293B' }}>{e.name}</div>
                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{e.value}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                    <div style={{ width: 90, height: 6, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(e.weight * 2.4, 100)}%`, height: '100%', background: '#64748B', borderRadius: 999 }} />
                    </div>
                    <span style={{ fontSize: 12, color: '#64748B', width: 40, textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>{e.weight}%</span>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          {/* 审批历史（审核留痕） */}
          <Panel title="审批历史" desc="该客户历史审批决策记录（留痕可溯）">
            {approvalRows.length ? (
              <DataTable columns={approvalCols} rows={approvalRows} empty="暂无审批记录" pager={false} />
            ) : (
              <div style={{ fontSize: 13, color: '#94A3B8', padding: '12px 0' }}>暂无审批记录</div>
            )}
          </Panel>
      </div>
    </div>
  );
}
