/* 企业风控 · P2 报告与图谱页
 * ①企业关联图谱 ep:ent-graph-detail  ②企业信用报告 ep:ent-credit-detail  ③企业核验报告 ep:ent-verify-detail
 * 数据：qiyeData.json（工商档案 Sam）+ enterpriseData.json（模型/名单/预警 Sam）+ 实时派生（Cal）
 * 入口：企业画像页头部按钮 / 检索页；无预选企业时直达搜索。
 */
import { useState } from 'react';
import { Panel, StatCard, DataTable, Button, Badge } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useQiyeData, type QiyeProfile } from './qiyeData';
import { useEnterpriseData } from './enterpriseData';
import { qiyeSelectedName, qiyeSelectedKeyNo, setQiyeSelected } from './QiyePages';

const CRUMB = '企业风控';

/* 企业选择（预选 + 直达搜索） */
function useProfileSel() {
  const d = useQiyeData();
  const init =
    (qiyeSelectedName ? d.enterprises.find((e) => e.name === qiyeSelectedName) : undefined) ??
    (qiyeSelectedKeyNo ? d.enterprises.find((e) => e.keyNo === qiyeSelectedKeyNo) : undefined);
  const [cur, setCur] = useState<QiyeProfile | undefined>(init);
  const [q, setQ] = useState('');
  const pick = (e: QiyeProfile) => { setQiyeSelected(e.name, e.keyNo); setCur(e); };
  const ql = q.trim().toLowerCase();
  const hits = ql ? d.enterprises.filter((e) => e.name.toLowerCase().includes(ql) || e.creditCode.includes(ql) || e.keyNo.includes(ql)) : [];
  return { d, cur, pick, q, setQ, hits };
}

/* 无预选企业时的直达搜索面板 */
function PickPanel({ title, crumb, q, setQ, hits, pick }: {
  title: string; crumb: string; q: string; setQ: (v: string) => void;
  hits: QiyeProfile[]; pick: (e: QiyeProfile) => void;
}) {
  return (
    <div style={{ padding: 24 }}>
      <PageShell title={title} crumb={crumb} subtitle="输入企业名称 / 统一社会信用代码直达" />
      <Panel title="直达企业画像" desc={<span>输入关键字检索在档企业 · <Cal label="实时汇总" /></span>}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="输入企业名称 / 统一社会信用代码 / 唯一标识"
          style={{ width: '100%', padding: '9px 12px', borderRadius: 8, border: '1px solid #E2E8F0', fontSize: 13, outline: 'none' }} />
      </Panel>
      {hits.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 12, marginTop: 16 }}>
          {hits.map((e) => (
            <button key={e.keyNo} type="button" onClick={() => pick(e)}
              style={{ textAlign: 'left', border: '1px solid #E2E8F0', borderRadius: 12, padding: 14, background: '#fff', cursor: 'pointer' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>{e.name}</div>
              <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>行业：{e.industry} · 法定代表人：{e.legalPerson}</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>统一社会信用代码：{e.creditCode}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* 风险等级 / 综合等级（由监控名单派生） */
const riskLevelOf = (ent: ReturnType<typeof useEnterpriseData>, name: string) =>
  ent.monitorList.find((m) => m.name === name)?.riskLevel ?? '低';
const gradeOfRisk = (lv: string) => lv === '高' ? { grade: '谨慎关注', kind: 'red' as const, advice: '建议暂缓授信 / 加强担保，人工尽调后决策' }
  : lv === '中' ? { grade: '一般', kind: 'amber' as const, advice: '建议审慎授信，补充财务与担保尽调' }
  : { grade: '良好', kind: 'green' as const, advice: '建议标准授信，按常规流程办理' };

/* ============================================================
 * ① 企业关联图谱
 * ========================================================== */
export function EntGraphDetail() {
  const ent = useEnterpriseData();
  const { d, cur, pick, q, setQ, hits } = useProfileSel();
  const crumb = `${CRUMB} / 企业关联图谱`;
  if (!cur) return <PickPanel title="企业关联图谱" crumb={crumb} q={q} setQ={setQ} hits={hits} pick={pick} />;

  // 一级关联：股东 / 对外投资 / 关联企业（同法定代表人）
  const holders = cur.shareholders.map((s) => ({ kind: '股东' as const, name: s.name, detail: `${s.type} · 持股 ${(s.ratio * 100).toFixed(0)}%`, risk: '低' }));
  const invs = cur.invests.map((i) => ({ kind: '对外投资' as const, name: i.name, detail: `持股 ${(i.ratio * 100).toFixed(0)}% · ${i.status}`, risk: i.status === '吊销' || i.status === '注销' ? '高' : '低' }));
  const rels = d.enterprises.filter((e) => e.keyNo !== cur.keyNo && e.legalPerson === cur.legalPerson)
    .map((e) => ({ kind: '关联企业（同法人）' as const, name: e.name, detail: `法定代表人 ${e.legalPerson}`, risk: riskLevelOf(ent, e.name) }));
  const nodes = [...holders, ...invs, ...rels];
  const riskHigh = nodes.filter((n) => n.risk === '高').length;

  const rows: Row[] = nodes.map((n, i) => ({
    id: String(i), rel: { v: n.kind, kind: n.kind === '股东' ? 'blue' : n.kind === '对外投资' ? 'violet' : 'gray' },
    name: n.name, detail: n.detail,
    risk: { v: n.risk === '高' ? '高风险' : n.risk === '中' ? '中风险' : '低风险', kind: n.risk === '高' ? 'red' : n.risk === '中' ? 'amber' : 'green' },
  }));
  const cols: Column[] = [
    { key: 'rel', label: '关系', type: 'badge', badgeKind: 'blue', width: '150px' },
    { key: 'name', label: '关联方', type: 'text', width: '280px' },
    { key: 'detail', label: '关联说明' },
    { key: 'risk', label: '风险等级', type: 'badge', badgeKind: 'gray', width: '100px' },
  ];

  // 图谱坐标：中心 (340,170)；股东左侧、对外投资右侧、关联下侧
  const pos = (i: number, n: number, cx: number, cy: number, r: number, start = -90) => {
    const a = (start + (i * 360) / n) * Math.PI / 180;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };
  const nodeColor = (kind: string, risk: string) => risk === '高' ? '#DC2626' : kind === '股东' ? '#2563EB' : kind === '对外投资' ? '#7C3AED' : '#0EA5E9';
  const group = (kind: string) => kind === '股东' ? 0 : kind === '对外投资' ? 1 : 2;
  const gSize = [holders.length, invs.length, rels.length];
  const gStart: Record<number, number> = { 0: -120, 1: -60, 2: 40 };

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="企业关联图谱" crumb={`${CRUMB} / 企业关联图谱 / ${cur.name}`}
        subtitle="股权、投资与关联网络（一级），关联方风险传导提示"
        actions={<><Sam value="qiyeData.json" /><Cal label="实时计算" /></>} />
      <Panel title={`${cur.name} · 关联网络`} desc={<span>一级关联 {nodes.length} 家 · 高风险关联 {riskHigh} 家</span>}>
        <svg viewBox="0 0 680 360" style={{ width: '100%', height: 340, background: '#FAFBFC', borderRadius: 10 }}>
          {/* 连线 */}
          {nodes.map((n, i) => {
            const g = group(n.kind);
            const offset = gSize[g] > 0 ? gSize.slice(0, g).reduce((a, b) => a + b, 0) : 0;
            const p = pos(offset + i - offset, gSize[g], 340, 170, g === 2 ? 120 : 150, gStart[g]);
            return <line key={'l' + i} x1={340} y1={170} x2={p.x} y2={p.y} stroke="#CBD5E1" strokeWidth={1.5} />;
          })}
          {/* 中心 */}
          <circle cx={340} cy={170} r={46} fill="#0EA5E9" />
          <text x={340} y={164} textAnchor="middle" fill="#fff" fontSize={13} fontWeight={700}>{cur.name.slice(0, 6)}</text>
          <text x={340} y={182} textAnchor="middle" fill="#E0F2FE" fontSize={10}>{cur.name.length > 6 ? '…' : ''} {riskLevelOf(ent, cur.name)}风险</text>
          {/* 关联节点 */}
          {nodes.map((n, i) => {
            const g = group(n.kind);
            const offset = gSize[g] > 0 ? gSize.slice(0, g).reduce((a, b) => a + b, 0) : 0;
            const p = pos(i - offset, gSize[g], 340, 170, g === 2 ? 120 : 150, gStart[g]);
            const c = nodeColor(n.kind, n.risk);
            return (
              <g key={'n' + i}>
                <circle cx={p.x} cy={p.y} r={22} fill={c} opacity={0.92} />
                <text x={p.x} y={p.y + 4} textAnchor="middle" fill="#fff" fontSize={9} fontWeight={600}>{n.name.slice(0, 5)}</text>
                <text x={p.x} y={p.y + 40} textAnchor="middle" fill="#64748B" fontSize={10}>{n.detail.slice(0, 12)}{n.detail.length > 12 ? '…' : ''}</text>
              </g>
            );
          })}
        </svg>
        <div style={{ display: 'flex', gap: 12, marginTop: 8, fontSize: 11, color: '#64748B' }}>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 99, background: '#2563EB', marginRight: 4 }} />股东</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 99, background: '#7C3AED', marginRight: 4 }} />对外投资</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 99, background: '#0EA5E9', marginRight: 4 }} />关联企业（同法人）</span>
          <span><span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 99, background: '#DC2626', marginRight: 4 }} />高风险关联</span>
        </div>
      </Panel>
      {riskHigh > 0 && (
        <div style={{ marginBottom: 12, padding: '8px 14px', borderRadius: 8, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 12, color: '#B91C1C' }}>
          ⚠ 存在 <b>{riskHigh}</b> 家高风险关联方，风险可能向本企业传导（担保 / 投资 / 同人关系），建议关联尽调。
        </div>
      )}
      <Panel title="关联关系明细" desc={<span>可跳转查看关联企业档案 · <Sam value="enterpriseData.json.monitorList" /></span>}>
        <DataTable columns={cols} rows={rows} empty="暂无关联系" pager defaultPageSize={10} exportable exportName="企业关联图谱"
          actions={(r) => <Button size="sm" variant="ghost" onClick={() => { const e = d.enterprises.find((x) => x.name === String(r.name)); if (e) pick(e); }}>查看档案</Button>} />
      </Panel>
    </div>
  );
}

/* ============================================================
 * ② 企业信用报告
 * ========================================================== */
export function EntCreditReport() {
  const ent = useEnterpriseData();
  const { d, cur, pick, q, setQ, hits } = useProfileSel();
  const crumb = `${CRUMB} / 企业信用报告`;
  if (!cur) return <PickPanel title="企业信用报告" crumb={crumb} q={q} setQ={setQ} hits={hits} pick={pick} />;

  const lv = riskLevelOf(ent, cur.name);
  const g = gradeOfRisk(lv);
  const alertOf = ent.alerts.filter((a) => a.entName === cur.name);
  const riskHit = cur.riskCounts.filter((r) => r.danger && r.count > 0);
  const dims: [string, string, 'green' | 'amber' | 'red'][] = [
    ['工商信息', cur.status === '吊销' || cur.status === '注销' ? '异常' : '正常', cur.status === '吊销' || cur.status === '注销' ? 'red' : 'green'],
    ['司法涉诉', cur.legalCases.length > 0 ? '异常' : '正常', cur.legalCases.length > 0 ? 'red' : 'green'],
    ['经营风险', riskHit.length > 0 ? '关注' : '正常', riskHit.length > 0 ? 'amber' : 'green'],
    ['税务信用', cur.riskCounts.find((r) => r.name === '欠税公告')?.count ? '关注' : '正常', cur.riskCounts.find((r) => r.name === '欠税公告')?.count ? 'amber' : 'green'],
    ['舆情', alertOf.some((a) => a.category === '舆情负面') ? '关注' : '正常', alertOf.some((a) => a.category === '舆情负面') ? 'amber' : 'green'],
    ['关联风险', ent.monitorList.find((m) => m.name === cur.name)?.alerts ?? 0 >= 3 ? '关注' : '正常', ent.monitorList.find((m) => m.name === cur.name)?.alerts ?? 0 >= 3 ? 'amber' : 'green'],
  ];
  const now = new Date().toLocaleString('zh-CN', { hour12: false });
  const modelScore = (mid: string): number => lv === '高' ? (mid === 'ent-credit' ? 498 : 82) : lv === '中' ? (mid === 'ent-credit' ? 648 : 58) : (mid === 'ent-credit' ? 792 : 32);

  return (
    <div style={{ padding: 24, maxWidth: 1120 }}>
      <PageShell title="企业信用报告" crumb={`${CRUMB} / 企业信用报告 / ${cur.name}`} subtitle="整合工商、司法、经营、模型与预警的全维度信用评估"
        actions={<><Sam value="enterpriseData.json" /><Cal label="实时计算" /><Button size="sm" variant="secondary" onClick={() => window.print()}>🖨 打印报告</Button></>} />
      <Panel title="报告摘要">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 13 }}>
            <div><b>企业名称：</b>{cur.name}</div>
            <div style={{ marginTop: 4 }}><b>统一社会信用代码：</b>{cur.creditCode} · <b>法定代表人：</b>{cur.legalPerson}</div>
            <div style={{ marginTop: 4, color: '#64748B' }}>报告编号：CR-{cur.keyNo.toUpperCase()}-{now.replace(/[^\d]/g, '').slice(0, 12)} · 生成时间：{now}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748B' }}>综合信用等级</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: g.kind === 'red' ? '#DC2626' : g.kind === 'amber' ? '#B45309' : '#059669' }}>{g.grade}</div>
          </div>
        </div>
      </Panel>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, marginBottom: 16 }}>
        {ent.models.map((m) => (
          <StatCard key={m.id} label={m.name} value={String(modelScore(m.id))} accent="brand" hint={`区间 ${m.range[0]}–${m.range[1]}`} />
        ))}
        <StatCard label="司法涉诉" value={String(cur.legalCases.length)} accent={cur.legalCases.length ? 'rose' : 'green'} hint="裁判文书+立案" />
      </div>
      <Panel className="mb-4" title="风险维度核验" desc="各维度正常 / 关注 / 异常">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 8 }}>
          {dims.map(([k, v, kind]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #F1F5F9', borderRadius: 8, padding: '8px 12px', fontSize: 13 }}>
              <span style={{ color: '#475569' }}>{k}</span>
              <span style={{ fontWeight: 600, color: kind === 'red' ? '#DC2626' : kind === 'amber' ? '#B45309' : '#059669' }}>{v === '正常' ? '✓ ' : ''}{v}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel className="mb-4" title="授信建议" desc={`综合等级：${g.grade}`}>
        <div style={{ padding: '10px 14px', borderRadius: 8, background: g.kind === 'red' ? '#FEF2F2' : g.kind === 'amber' ? '#FFFBEB' : '#ECFDF5', border: `1px solid ${g.kind === 'red' ? '#FECACA' : g.kind === 'amber' ? '#FDE68A' : '#A7F3D0'}`, fontSize: 13, color: g.kind === 'red' ? '#B91C1C' : g.kind === 'amber' ? '#92400E' : '#065F46' }}>
          {g.advice}。命中风险项 {riskHit.length} 项 · 累计预警 {ent.monitorList.find((m) => m.name === cur.name)?.alerts ?? 0} 条。
        </div>
        <div style={{ marginTop: 10, fontSize: 12, color: '#94A3B8' }}>注：本报告为演示环境自动生成，仅供系统演示；实际授信以人工审批为准。</div>
      </Panel>
      <Panel title="预警记录" desc="近期待处置预警">
        <DataTable columns={[
          { key: 'time', label: '预警时间', width: '150px' },
          { key: 'rule', label: '命中规则', width: '180px' },
          { key: 'lv', label: '等级', width: '90px' },
          { key: 'detail', label: '预警内容' },
        ]} rows={alertOf.map((a, i) => ({ id: String(i), time: a.alert_date, rule: a.ruleName, lv: a.level === 'RED' ? '红灯' : a.level === 'YELLOW' ? '黄灯' : '机会', detail: a.detail }))} empty="无预警" pager defaultPageSize={5} />
      </Panel>
    </div>
  );
}

/* ============================================================
 * ③ 企业核验报告
 * ========================================================== */
export function EntVerifyReport() {
  const ent = useEnterpriseData();
  const { d, cur, pick, q, setQ, hits } = useProfileSel();
  const crumb = `${CRUMB} / 企业核验报告`;
  if (!cur) return <PickPanel title="企业核验报告" crumb={crumb} q={q} setQ={setQ} hits={hits} pick={pick} />;

  const riskHit = cur.riskCounts.filter((r) => r.danger && r.count > 0);
  const alertOf = ent.alerts.filter((a) => a.entName === cur.name);
  const diffCount = (cur.legalCases.length > 0 ? 1 : 0) + riskHit.length;
  const conclusion = diffCount === 0 ? { t: '核验一致', kind: 'green' as const, note: '基本信息与风险项均未发现异常' }
    : { t: '存在差异', kind: 'amber' as const, note: `发现 ${diffCount} 项风险差异，建议人工复核` };
  const base: [string, string, boolean][] = [
    ['企业名称', cur.name, true],
    ['统一社会信用代码', cur.creditCode, true],
    ['法定代表人', cur.legalPerson, true],
    ['注册地址', cur.regAddr, true],
    ['经营状态', cur.status, cur.status !== '吊销' && cur.status !== '注销'],
    ['经营范围', cur.bizScope.slice(0, 24) + (cur.bizScope.length > 24 ? '…' : ''), true],
  ];
  const riskChecks: [string, string, 'green' | 'amber' | 'red'][] = [
    ['司法涉诉', cur.legalCases.length ? `命中 ${cur.legalCases.length} 条（${cur.legalCases.map((c) => c.type).slice(0, 3).join('、')}）` : '无', cur.legalCases.length ? 'red' : 'green'],
    ['经营异常', riskHit.filter((r) => r.name.includes('异常') || r.name.includes('处罚') || r.name.includes('仲裁')).length ? `命中 ${riskHit.filter((r) => r.name.includes('异常') || r.name.includes('处罚') || r.name.includes('仲裁')).length} 项` : '无', riskHit.length ? 'amber' : 'green'],
    ['舆情', alertOf.some((a) => a.category === '舆情负面') ? '存在负面舆情' : '无', alertOf.some((a) => a.category === '舆情负面') ? 'amber' : 'green'],
    ['关联风险', ent.monitorList.find((m) => m.name === cur.name)?.riskLevel === '高' ? '关联网络高风险' : '正常', ent.monitorList.find((m) => m.name === cur.name)?.riskLevel === '高' ? 'red' : 'green'],
  ];
  const now = new Date().toLocaleString('zh-CN', { hour12: false });
  const repNo = `VR-${cur.keyNo.toUpperCase()}-${now.replace(/[^\d]/g, '').slice(0, 12)}`;

  return (
    <div style={{ padding: 24, maxWidth: 1120 }}>
      <PageShell title="企业核验报告" crumb={`${CRUMB} / 企业核验报告 / ${cur.name}`} subtitle="工商档案一致性核验 + 风险项核验结论（标准化核验报告）"
        actions={<><Sam value="qiyeData.json" /><Cal label="实时计算" /><Button size="sm" variant="secondary" onClick={() => window.print()}>🖨 打印报告</Button></>} />
      <Panel title="核验结论">
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontSize: 13 }}>
            <div><b>企业名称：</b>{cur.name} · <b>信用代码：</b>{cur.creditCode}</div>
            <div style={{ marginTop: 4, color: '#64748B' }}>核验编号：{repNo} · 核验时间：{now}</div>
            <div style={{ marginTop: 4 }}>核验结论：<Badge kind={conclusion.kind}>{conclusion.t}</Badge> <span style={{ color: '#64748B' }}>{conclusion.note}</span></div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, color: '#64748B' }}>风险命中项</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: diffCount ? '#B45309' : '#059669' }}>{diffCount}</div>
          </div>
        </div>
      </Panel>
      <Panel className="mb-4" title="基本信息核验" desc="与工商登记档案比对">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 24px', fontSize: 13 }}>
          {base.map(([k, v, ok]) => (
            <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
              <span style={{ color: '#94A3B8' }}>{k}</span>
              <span style={{ color: '#334155', fontWeight: 500 }}>{v} <span style={{ color: ok ? '#059669' : '#DC2626' }}>{ok ? '✓' : '✗'}</span></span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="风险核验" desc="司法 / 经营 / 舆情 / 关联">
        <DataTable columns={[
          { key: 'item', label: '核验项', width: '120px' },
          { key: 'res', label: '核验结果' },
          { key: 'status', label: '结论', width: '100px' },
        ]} rows={riskChecks.map(([item, res, kind], i) => ({ id: String(i), item, res, status: { v: kind === 'red' ? '异常' : kind === 'amber' ? '关注' : '正常', kind } }))} empty="无" pager defaultPageSize={10} />
        <div style={{ marginTop: 10, fontSize: 12, color: '#94A3B8' }}>核验依据：工商档案（qiyeData.json）与模型/名单/预警（enterpriseData.json）实时比对，本报告供系统演示。</div>
      </Panel>
    </div>
  );
}
