/* 催贷管理子系统 · 新增页面（6 大模块重新规划）
 * 模块：①智能分案(zz:assignment) ②案件导入(zz:import) ③多渠道合规触达(zz:channels)
 *       ④委外机构监管(zz:agencies) ⑤智能AI质检(zz:qa) ⑥协商减免与回款(zz:repayment)
 * 数据：dunData.ts（dunData.json 样例橘 Sam；实时统计 灰 Cal）
 * 样式：复用 PageShell / Panel / DataTable / StatCard / charts + 来源三色标签
 */
import { useMemo, useState } from 'react';
import { Panel, StatCard, DataTable, Button, Badge, SingleSelect } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { DonutChart } from '../components/charts';
import { Sam, Cal } from './SourceTag';
import { PageShell } from './PageShell';
import { useDunData, updateDunData, dunNewId, type DunAgency, type DunWaiver } from './dunData';
import FlowStateCell from './FlowStateCell';

const CRUMB = '零售信贷风控 / 催贷管理';
const money = (n: number) => `¥${n.toLocaleString()}`;
const inp: React.CSSProperties = { padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' };

/* ============ ① 智能分案引擎 ============ */
const ROUTE_KIND: Record<string, 'blue' | 'violet' | 'cyan' | 'orange'> = { 内催: 'blue', 委外: 'violet', 调解: 'cyan', 诉讼: 'orange' };
export function DunAssignment() {
  const d = useDunData();
  const rules = d.assignments;
  const routeDist = useMemo(() => {
    const m: Record<string, number> = {};
    rules.filter((r) => r.enabled).forEach((r) => (m[r.route] = (m[r.route] ?? 0) + 1));
    return m;
  }, [rules]);
  const toggle = (id: string) => updateDunData((dd) => ({ ...dd, assignments: dd.assignments.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r) }));
  const add = () => updateDunData((dd) => ({ ...dd, assignments: [...dd.assignments, { id: dunNewId('AS'), name: '新分案规则', condStage: 'M1', condRisk: '低', route: '内催', dynamic: '', recycle: '', enabled: true }] }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="智能分案" crumb={`${CRUMB} / 智能分案`} subtitle="系统核心：内催/委外/调解/诉讼规则自定义分配，按债务人画像与催员产能动态调案，任务循环/超时回收/二次分配"
        actions={<><Sam label="分案样例" value="dunData.json.assignments" /><Button size="sm" onClick={add}>＋ 新建规则</Button></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="分案规则" value={String(rules.length)} accent="brand" hint={<Cal label="实时统计" />} />
        <StatCard label="内催 / 委外" value={`${routeDist['内催'] ?? 0} / ${routeDist['委外'] ?? 0}`} accent="cyan" hint="启用路由分布" />
        <StatCard label="调解 / 诉讼" value={`${routeDist['调解'] ?? 0} / ${routeDist['诉讼'] ?? 0}`} accent="cyan" hint="启用路由分布" />
        <StatCard label="已启用" value={String(rules.filter((r) => r.enabled).length)} accent="emerald" hint="规则生效中" />
      </div>

      <Panel title="分案规则" desc={<span>规则自定义分配 · <Cal label="实时计算" /></span>}>
        <div style={{ display: 'grid', gap: 10 }}>
          {rules.map((r) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid #E2E8F0', borderRadius: 10, padding: '10px 14px', background: '#fff' }}>
              <Badge kind={ROUTE_KIND[r.route]}>{r.route}</Badge>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{r.name} <Sam value="dunData.json" /></div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>账龄 {r.condStage} · 风险 {r.condRisk}　·　动态调案：{r.dynamic || '—'}　·　回收：{r.recycle || '—'}</div>
              </div>
              <Button size="sm" variant={r.enabled ? 'secondary' : 'primary'} onClick={() => toggle(r.id)}>{r.enabled ? '停用' : '启用'}</Button>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ============ ② 案件导入 ============ */
export function DunImport() {
  const d = useDunData();
  const [source, setSource] = useState<'API 自动对接' | 'Excel 手动导案'>('API 自动对接');
  const [mode, setMode] = useState<'批量' | '增量'>('增量');
  const run = () => {
    const cnt = mode === '批量' ? 600 + Math.floor(Math.random() * 400) : 100 + Math.floor(Math.random() * 80);
    updateDunData((dd) => ({ ...dd, imports: [{ id: dunNewId('IMP'), source, time: new Date().toISOString().slice(0, 10), count: cnt, mode }, ...dd.imports] }));
  };
  const cols: Column[] = [
    { key: 'source', label: '来源', type: 'text', width: '160px' },
    { key: 'mode', label: '模式', type: 'badge', badgeKind: 'blue', width: '90px' },
    { key: 'count', label: '导入案件数', type: 'number', width: '120px' },
    { key: 'time', label: '导入时间', type: 'text', width: '120px' },
  ];
  const rows: Row[] = d.imports.map((i) => ({ id: i.id, source: i.source, mode: { v: i.mode, kind: 'blue' }, count: i.count, time: i.time }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="案件导入" crumb={`${CRUMB} / 案件导入`} subtitle="API 自动对接信贷核心系统 / Excel 手动导案，支持批量与增量同步"
        actions={<><Sam label="导入样例" value="dunData.json.imports" /><Cal label="实时统计" /></>} />

      <Panel title="新建导入任务" desc="选择数据源与同步模式后执行导入（演示环境为模拟导入，写入导入日志）">
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <SingleSelect label="选择数据源" value={source} onChange={(v) => setSource(v as 'API 自动对接' | 'Excel 手动导案')}
            options={[{ value: 'API 自动对接', label: 'API 自动对接' }, { value: 'Excel 手动导案', label: 'Excel 手动导案' }]} />
          <SingleSelect label="选择同步模式" value={mode} onChange={(v) => setMode(v as '批量' | '增量')}
            options={[{ value: '增量', label: '增量同步' }, { value: '批量', label: '批量导入' }]} />
          <Button size="sm" onClick={run}>执行导入</Button>
          <span style={{ fontSize: 12, color: '#94A3B8' }}>对接：信贷核心系统 API · 字段映射（客户号/产品/应还日/逾期天数/逾期金额）</span>
        </div>
      </Panel>

      <Panel title="导入日志" desc={<span>共 <b>{d.imports.length}</b> 条 <Cal label="实时汇总" /></span>}>
        <DataTable columns={cols} rows={rows} empty="暂无导入记录" pager defaultPageSize={10} />
      </Panel>
    </div>
  );
}

/* ============ ③ 多渠道合规触达 ============ */
export function DunChannels() {
  const d = useDunData();
  const toggle = (id: string) => updateDunData((dd) => ({ ...dd, channels: dd.channels.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c) }));
  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="触达渠道" crumb={`${CRUMB} / 触达渠道`} subtitle="多渠道合规触达组件（可选购）：云呼叫中心 / AI 协催机器人 / 合规短信 / 安米外勤 App / 催收工作手机"
        actions={<><Sam label="渠道样例" value="dunData.json.channels" /><Cal label="实时统计" /></>} />

      <Panel title="合规硬限制（全局）" desc="所有触达内置合规硬限制，可配置">
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Badge kind="blue">可配置呼叫时段</Badge>
          <Badge kind="amber">每日最大联系频次</Badge>
          <Badge kind="red">禁止骚扰第三方联系人</Badge>
        </div>
      </Panel>

      <Panel title="触达渠道" desc={<span>本期用量 · <Cal label="实时统计" /></span>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
          {d.channels.map((c) => (
            <div key={c.id} style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 14, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{c.name} <Sam value="dunData.json" /></div>
                <Badge kind={c.enabled ? 'green' : 'gray'}>{c.enabled ? '已启用' : '未启用'}</Badge>
              </div>
              <div style={{ fontSize: 12, color: '#64748B', margin: '6px 0' }}>类型：{c.type}　·　本期用量：{c.volume.toLocaleString()}</div>
              <div style={{ fontSize: 12, color: '#334155', lineHeight: 1.7 }}>
                呼叫时段：<b>{c.callWindow}</b><br />
                每日最大频次：<b>{c.maxPerDay} 次</b><br />
                禁止骚扰第三方：<b style={{ color: c.noThirdParty ? '#16A34A' : '#DC2626' }}>{c.noThirdParty ? '已开启' : '未开启'}</b>
              </div>
              <div style={{ marginTop: 10 }}>
                <Button size="sm" variant={c.enabled ? 'secondary' : 'primary'} onClick={() => toggle(c.id)}>{c.enabled ? '停用' : '启用'}</Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

/* ============ ④ 委外机构监管 ============ */
const AG_STATUS_KIND: Record<DunAgency['status'], 'green' | 'amber' | 'red'> = { 正常: 'green', 预警: 'amber', 暂停: 'red' };
export function DunAgencies() {
  const d = useDunData();
  const [viewId, setViewId] = useState<string | null>(null);
  const ags = d.agencies;
  const view = viewId ? ags.find((a) => a.id === viewId) : undefined;
  const totalCases = ags.reduce((a, x) => a + x.cases, 0);
  const avgConn = Math.round(ags.reduce((a, x) => a + x.connectRate, 0) / ags.length);
  const avgRec = Math.round(ags.reduce((a, x) => a + x.recoveryRate, 0) / ags.length);
  const complaints = ags.reduce((a, x) => a + x.complaint, 0);

  const cols: Column[] = [
    { key: 'name', label: '机构', type: 'text', fixed: 'left', width: '200px' },
    { key: 'tenant', label: '租户', type: 'text', width: '90px' },
    { key: 'cases', label: '在派案件', type: 'number', width: '100px' },
    { key: 'connectRate', label: '接通率', type: 'percent', width: '90px' },
    { key: 'recoveryRate', label: '回款率', type: 'percent', width: '90px' },
    { key: 'complaint', label: '投诉', type: 'number', width: '70px' },
    { key: 'commission', label: '待结算佣金', type: 'money', width: '120px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px', fixed: 'right' },
  ];
  const rows: Row[] = ags.map((a) => ({
    id: a.id, name: a.name, tenant: a.tenant, cases: a.cases, connectRate: a.connectRate, recoveryRate: a.recoveryRate,
    complaint: a.complaint, commission: a.commission, status: { v: a.status, kind: AG_STATUS_KIND[a.status] },
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="委外机构" crumb={`${CRUMB} / 委外机构`} subtitle="委外机构监管（金融机构版最大特色）：多租户数据隔离、任务下发、进度实时监控、产能/接通率/回款率/投诉统计、佣金自动结算与违规预警"
        actions={<><Sam label="机构样例" value="dunData.json.agencies" /><Cal label="实时统计" /></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="委外机构" value={String(ags.length)} accent="brand" hint={<Cal label="实时统计" />} />
        <StatCard label="在派案件" value={String(totalCases)} accent="amber" hint={<Cal label="实时统计" />} />
        <StatCard label="平均接通率" value={`${avgConn}%`} accent="cyan" hint={<Cal label="实时统计" />} />
        <StatCard label="平均回款率" value={`${avgRec}%`} accent="emerald" hint={<Cal label="实时统计" />} />
        <StatCard label="投诉总数" value={String(complaints)} accent="rose" hint={<Cal label="实时统计" />} />
      </div>

      <Panel title="委外机构列表" desc={<span>多租户独立隔离 · <Cal label="实时汇总" /></span>}
        actions={<Button size="sm" variant="ghost" onClick={() => setViewId(null)}>返回列表</Button>}>
        {view ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{view.name} <Sam value="dunData.json" /></div>
              <Badge kind={AG_STATUS_KIND[view.status]}>{view.status}</Badge>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>租户 {view.tenant}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: '6px 16px', fontSize: 13, marginBottom: 14 }}>
              {([
                ['在派案件', String(view.cases)],
                ['接通率', `${view.connectRate}%`],
                ['回款率', `${view.recoveryRate}%`],
                ['投诉数', String(view.complaint)],
                ['待结算佣金', money(view.commission)],
                ['违规预警', String(view.violations.length)],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #F1F5F9', paddingBottom: 4 }}>
                  <span style={{ color: '#94A3B8' }}>{k}</span><span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>任务下发 / 进度监控 / 产能 / 佣金结算</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
              {(['任务下发实时', '进度回传监控', '佣金自动结算对账']).map((t) => (
                <div key={t} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: '#334155' }}>✓ {t}</div>
              ))}
            </div>
            {view.violations.length ? (
              <div>
                <div style={{ fontSize: 12, color: '#DC2626', marginBottom: 4 }}>违规行为预警（可暂停案件派发）</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {view.violations.map((v) => <Badge key={v} kind="red">{v}</Badge>)}
                </div>
              </div>
            ) : <div style={{ fontSize: 12, color: '#16A34A' }}>无违规预警</div>}
          </div>
        ) : (
          <DataTable columns={cols} rows={rows} empty="暂无机构" clickableKey="name" onCellClick={(r) => setViewId(String(r.id))}
            actions={(r) => <Button size="sm" variant="ghost" onClick={() => setViewId(String(r.id))}>查看</Button>} pager defaultPageSize={10} />
        )}
      </Panel>
    </div>
  );
}

/* ============ ⑤ 智能 AI 质检 ============ */
const QA_RESULT_KIND: Record<string, 'green' | 'red' | 'gray'> = { 合格: 'green', 违规: 'red', 复核中: 'gray' };
const QA_PALETTE = ['#DC2626', '#EA580C', '#D97706', '#2563EB'];
export function DunQa() {
  const d = useDunData();
  const recs = d.qaRecords;
  const violationCount = recs.filter((r) => r.result === '违规').length;
  const passRate = Math.round((recs.filter((r) => r.result === '合格').length / recs.filter((r) => r.duration > 0).length) * 100) || 0;
  const vioDist = useMemo(() => {
    const m: Record<string, number> = {};
    recs.forEach((r) => r.violations.forEach((v) => (m[v] = (m[v] ?? 0) + 1)));
    return Object.entries(m).map(([label, value], i) => ({ label, value, color: QA_PALETTE[i % QA_PALETTE.length] }));
  }, [recs]);

  const qaCols: Column[] = [
    { key: 'caseId', label: '案件', type: 'text', width: '140px' },
    { key: 'agent', label: '坐席', type: 'text', width: '80px' },
    { key: 'duration', label: '时长', type: 'text', width: '80px' },
    { key: 'asrText', label: 'ASR 转写', type: 'text' },
    { key: 'violations', label: '命中违规', type: 'text', width: '160px' },
    { key: 'score', label: '质检分', type: 'score', width: '90px' },
    { key: 'result', label: '结果', type: 'badge', badgeKind: 'gray', width: '90px' },
  ];
  const qaRows: Row[] = recs.map((r) => ({
    id: r.id, caseId: r.caseId, agent: r.agent, duration: r.duration > 0 ? `${Math.round(r.duration / 60)}′${r.duration % 60}″` : '—',
    asrText: r.asrText, violations: r.violations.join('、') || '—', score: r.score, result: { v: r.result, kind: QA_RESULT_KIND[r.result] },
  }));
  const wordCols: Column[] = [
    { key: 'category', label: '类别', type: 'badge', badgeKind: 'red', width: '110px' },
    { key: 'word', label: '违规词', type: 'text' },
    { key: 'enabled', label: '启用', type: 'badge', badgeKind: 'gray', width: '90px' },
  ];
  const wordRows: Row[] = d.qaWords.map((w) => ({ id: w.id, category: { v: w.category, kind: 'red' }, word: w.word, enabled: { v: w.enabled ? '已启用' : '未启用', kind: w.enabled ? 'green' : 'gray' } }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="智能质检" crumb={`${CRUMB} / 智能质检`} subtitle="智能 AI 质检平台：ASR 实时转写 + NLP 语义识别、自定义违规词库、实时通话预警、录音长期存证、自动质检报告与违规工单"
        actions={<><Sam label="质检样例" value="dunData.json" /><Cal label="实时统计" /></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="质检通话" value={String(recs.filter((r) => r.duration > 0).length)} accent="brand" hint={<Cal label="实时统计" />} />
        <StatCard label="违规通话" value={String(violationCount)} accent="rose" hint={<Cal label="实时统计" />} />
        <StatCard label="合格率" value={`${passRate}%`} accent="emerald" hint={<Cal label="实时统计" />} />
        <StatCard label="违规词库" value={String(d.qaWords.filter((w) => w.enabled).length)} accent="amber" hint="启用词数" />
      </div>

      <Panel title="违规类型分布" desc={<span><Cal label="实时计算" /></span>}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'center' }}>
          <DonutChart data={vioDist.length ? vioDist : [{ label: '无违规', value: 1, color: '#16A34A' }]} centerLabel="违规类型" centerValue={String(violationCount)} height={220} />
          <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.9 }}>
            违规词库分类：威胁恐吓 / 骚扰辱骂 / 联系第三方 / 虚假不实。<br />
            实时通话预警支持主管监听、三方插话、紧急强制挂断；录音长期存证，支持监管调阅与纠纷举证；自动生成质检报告、违规工单与考核台账。
          </div>
        </div>
      </Panel>

      <Panel title="违规词库" desc={<span>自定义违规词库 · <Sam value="dunData.json.qaWords" /></span>}>
        <DataTable columns={wordCols} rows={wordRows} empty="暂无" pager defaultPageSize={10} />
      </Panel>

      <Panel title="通话质检记录" desc={<span>ASR 转写 + 违规命中 · <Cal label="实时汇总" /></span>}>
        <DataTable columns={qaCols} rows={qaRows} empty="暂无" pager defaultPageSize={10} />
      </Panel>
    </div>
  );
}

/* ============ ⑥ 协商减免与回款 ============ */
const WV_STATUS_KIND: Record<string, 'amber' | 'green' | 'red'> = { 审批中: 'amber', 已通过: 'green', 已驳回: 'red' };
export function DunRepayment() {
  const d = useDunData();
  const totalRepay = d.repayments.reduce((a, r) => a + r.amount, 0);
  const totalWaiver = d.waivers.filter((w) => w.status === '已通过').reduce((a, w) => a + w.amount, 0);
  const pendingWaiver = d.waivers.filter((w) => w.status === '审批中').length;
  /* 减免审批流转：操作按钮由管理中心业务流程「减免审批流程」(f-dun-waiver) 配置驱动 */
  const setWaiverFlow = (id: string, next: string) => updateDunData((dd) => ({ ...dd, waivers: dd.waivers.map((w) => w.id === id ? { ...w, status: next as DunWaiver['status'] } : w) }));

  const rpCols: Column[] = [
    { key: 'caseId', label: '案件', type: 'text', width: '140px' },
    { key: 'custName', label: '客户', type: 'text', width: '90px' },
    { key: 'amount', label: '回款金额', type: 'money', width: '120px' },
    { key: 'method', label: '方式', type: 'badge', badgeKind: 'blue', width: '90px' },
    { key: 'date', label: '日期', type: 'text', width: '120px' },
    { key: 'matched', label: '自动匹配', type: 'badge', badgeKind: 'gray', width: '100px' },
  ];
  const rpRows: Row[] = d.repayments.map((r) => ({ id: r.id, caseId: r.caseId, custName: r.custName, amount: r.amount, method: { v: r.method, kind: 'blue' }, date: r.date, matched: { v: r.matched ? '已匹配' : '待匹配', kind: r.matched ? 'green' : 'amber' } }));

  const wvCols: Column[] = [
    { key: 'caseId', label: '案件', type: 'text', width: '140px' },
    { key: 'custName', label: '客户', type: 'text', width: '90px' },
    { key: 'amount', label: '减免金额', type: 'money', width: '110px' },
    { key: 'reason', label: '原因', type: 'text' },
    { key: 'approver', label: '审批人', type: 'text', width: '100px' },
    { key: 'level', label: '级别', type: 'text', width: '80px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
  ];
  const wvRows: Row[] = d.waivers.map((w) => ({
    id: w.id, caseId: w.caseId, custName: w.custName, amount: w.amount, reason: w.reason, approver: w.approver, level: w.level,
    status: { v: w.status, kind: WV_STATUS_KIND[w.status] },
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1360 }}>
      <PageShell title="协商减免与回款" crumb={`${CRUMB} / 协商减免与回款`} subtitle="协商分期方案登记、减免审批流（多级）、还款流水录入自动匹配、逾期复催跟踪、回款台账与佣金计算"
        actions={<><Sam label="回款样例" value="dunData.json" /><Cal label="实时统计" /></>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0,1fr))', gap: 12, margin: '4px 0 16px' }}>
        <StatCard label="回款总额" value={money(totalRepay)} accent="emerald" hint={<Cal label="实时统计" />} />
        <StatCard label="减免总额(通过)" value={money(totalWaiver)} accent="amber" hint={<Cal label="实时统计" />} />
        <StatCard label="回款笔数" value={String(d.repayments.length)} accent="brand" hint={<Cal label="实时统计" />} />
        <StatCard label="待审批减免" value={String(pendingWaiver)} accent="rose" hint="减免审批流" />
      </div>

      <Panel title="回款台账" desc={<span>还款流水自动匹配案件 · <Cal label="实时汇总" /></span>}>
        <DataTable columns={rpCols} rows={rpRows} empty="暂无回款" pager defaultPageSize={10} />
      </Panel>

      <Panel title="减免审批" desc={<span>审批流由管理中心业务流程配置驱动 · <Sam value="dunData.json.waivers" /></span>}>
        <DataTable columns={wvCols} rows={wvRows} empty="暂无减免" pager defaultPageSize={10}
          actions={(r) => {
            const w = d.waivers.find((x) => x.id === r.id);
            if (!w) return <span style={{ fontSize: 12, color: '#94A3B8' }}>—</span>;
            return <FlowStateCell flowId="f-dun-waiver" state={w.status} buttonOnly onChange={(next) => setWaiverFlow(w.id, next)} />;
          }} />
      </Panel>
    </div>
  );
}
