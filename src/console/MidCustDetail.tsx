// ⑪ 个体详情页（贷中监控 · 使用域）— 规则还原 + 画像 + 评分历史 + 预警/处置 + 处置操作（模拟对接）
// 样例数据=橘（midCustomers.json）｜ 处置策略/规则配置=蓝（midStrategies.json）｜ 模拟执行=灰（实时）
import { useState } from 'react';
import { PageHeader, Panel, DataTable, Button, Modal } from '../components/ui';
import type { Column, Row } from '../components/ui';
import { LineChart } from '../components/charts';
import { useMidCustomers, updateCustomers, useMidStrategy, useMidDisposeTasks } from './midStore';
import { Cfg, Sam, Cal } from './SourceTag';
import type { MidDispose } from './midData';

const LEVEL_COLOR: Record<string, string> = { RED: '#DC2626', YELLOW: '#D97706', OPPORTUNITY: '#2563EB' };
const LEVEL_LABEL: Record<string, string> = { RED: '红灯', YELLOW: '黄灯', OPPORTUNITY: '机会信号' };

export default function MidCustDetail() {
  const customers = useMidCustomers();
  const strategy = useMidStrategy();
  const disposeTasks = useMidDisposeTasks();
  const [exec, setExec] = useState<{ action: string; steps: string[]; done: boolean } | null>(null);

  const qs = new URLSearchParams(window.location.search);
  const custId = qs.get('custId') ?? 'C0001';
  const from = qs.get('from') ?? '';
  const cust = customers.find((c) => c.custId === custId) ?? customers[0];
  if (!cust) return <div style={{ padding: 24, color: '#94A3B8' }}>未找到客户 {custId}</div>;

  const latestAlert = cust.alerts[cust.alerts.length - 1];
  const level = (latestAlert?.level ?? 'YELLOW') as keyof typeof LEVEL_LABEL;

  // 与当前风险等级匹配的处置动作（读策略配置，蓝）
  const matchedDisposes = strategy.disposes.filter((d) => d.triggerLevel === level);

  const doDispose = (d: MidDispose) => {
    const steps: string[] = [`下发处置指令：${d.action} → ${d.targetSystem}`];
    if (d.needApprove) steps.push('提交风控主管审批… 审批通过');
    if (d.needNotify) steps.push('触达客户通知（短信/APP Push）');
    const ok = Math.random() > 0.25;
    steps.push(ok ? `模拟执行：${d.targetSystem} 执行成功` : '模拟执行：目标系统返回异常，已回滚');
    setExec({ action: d.action, steps, done: true });
  };

  const confirmDispose = () => {
    if (!exec || !exec.done) return;
    updateCustomers((list) => list.map((c) => {
      if (c.custId !== cust.custId) return c;
      const note = exec.steps[exec.steps.length - 1].startsWith('模拟执行') && exec.steps[exec.steps.length - 1].includes('成功')
        ? '处置已执行' : '执行异常，待重试';
      return {
        ...c,
        disposes: [...c.disposes, { time: new Date().toISOString().slice(0, 10), operator: '风控专员（演示）', action: exec.action, result: note }],
      };
    }));
    setExec(null);
  };

  const alertCols: Column[] = [
    { key: 'time', label: '时间' }, { key: 'level', label: '等级', type: 'badge' },
    { key: 'scene', label: '场景' }, { key: 'rule', label: '命中规则' },
    { key: 'v', label: '指标值/阈值' }, { key: 'status', label: '状态', type: 'badge' },
  ];
  const alertRows: Row[] = [...cust.alerts].reverse().map((a) => ({
    id: a.time + a.scene, time: a.time, level: LEVEL_LABEL[a.level] ?? a.level,
    scene: a.scene, rule: a.ruleName, v: `${a.metricValue} / ${a.threshold}`, status: a.status,
  }));

  const disposeCols: Column[] = [
    { key: 'time', label: '时间' }, { key: 'operator', label: '处置人' },
    { key: 'action', label: '动作' }, { key: 'result', label: '结果' }, { key: 'note', label: '备注' },
  ];
  const disposeRows: Row[] = [...cust.disposes].reverse().map((d, i) => ({
    id: `d${i}`, time: d.time, operator: d.operator, action: d.action, result: d.result, note: d.note ?? '',
  }));

  return (
    <div style={{ padding: 24, maxWidth: 1280 }}>
      <PageHeader
        title={`个体详情 · ${cust.name}`}
        crumb="零售信贷风控 / 贷中监控 / 个体详情"
        subtitle={from ? `来自：${from}` : '单客风险全视图'}
        actions={<>
          <Sam label="客户样例 JSON" value={cust.custId} />
          <Cfg label="处置策略" value={`${matchedDisposes.length} 条匹配`} />
        </>}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14, marginTop: 14 }}>
        {/* 画像卡 */}
        <Panel title="客户画像" desc="样例数据" note="身份信息已脱敏">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 13 }}>
            <div style={{ color: '#64748B' }}>姓名</div><div><b>{cust.name}</b></div>
            <div style={{ color: '#64748B' }}>证件</div><div>{cust.idCard}</div>
            <div style={{ color: '#64748B' }}>产品</div><div>{cust.product}</div>
            <div style={{ color: '#64748B' }}>授信额度</div><div>{cust.creditLine.toLocaleString()} 元</div>
            <div style={{ color: '#64748B' }}>在贷余额</div><div>{cust.loanBalance.toLocaleString()} 元</div>
            <div style={{ color: '#64748B' }}>在贷状态</div><div>{cust.loanStatus}</div>
            <div style={{ color: '#64748B' }}>风险等级</div>
            <div><span style={{ color: LEVEL_COLOR[cust.riskLevel === '高风险' ? 'RED' : cust.riskLevel === '中风险' ? 'YELLOW' : 'GREEN'] || '#334155', fontWeight: 600 }}>{cust.riskLevel}</span></div>
          </div>
        </Panel>

        {/* 规则还原 */}
        <Panel
          title="预警规则还原"
          desc="为什么预警 · 命中规则明细快照"
          note="规则明细随预警事件保存（样例），定级逻辑来自监控策略配置"
          actions={<Cfg label="规则定级配置" value={`${strategy.rules.length} 条规则`} />}
        >
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ border: '1px solid #FEE2E2', borderRadius: 8, background: '#FEF2F2', padding: '10px 12px' }}>
              <div style={{ fontSize: 12, color: '#991B1B' }}>
                最新预警：<b>{LEVEL_LABEL[level]} · {latestAlert?.scene}</b>（{latestAlert?.time}）
              </div>
              <div style={{ fontSize: 13, marginTop: 6, color: '#1E293B' }}>
                命中规则：<b>{latestAlert?.ruleName}</b> <Cal label="指标值" value={latestAlert?.metricValue} /> <Cal label="阈值" value={latestAlert?.threshold} />
              </div>
            </div>
            <DataTable columns={alertCols} rows={alertRows.slice(0, 6)} />
          </div>
        </Panel>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginTop: 14 }}>
        {/* 评分历史 */}
        <Panel title="行为评分历史" desc="近 6 个月 vs 客群均值" actions={<Sam label="评分历史样例" />}>
          <LineChart
            labels={cust.scoreHistory.map((s) => s.month)}
            series={[
              { name: '该客户', data: cust.scoreHistory.map((s) => s.score), color: '#DC2626' },
              { name: '客群均值', data: cust.scoreHistory.map((s) => s.cohortAvg), color: '#94A3B8' },
            ]}
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginTop: 8, fontSize: 12, textAlign: 'center' }}>
            {cust.scoreHistory.map((s) => (
              <div key={s.month} style={{ background: '#F8FAFC', borderRadius: 6, padding: '6px 4px' }}>
                <div style={{ color: '#94A3B8' }}>{s.month}</div>
                <div style={{ fontWeight: 600, color: '#DC2626' }}>{s.score}</div>
                <div style={{ color: '#94A3B8' }}>客群 {s.cohortAvg}</div>
              </div>
            ))}
          </div>
        </Panel>

        {/* 处置操作 */}
        <Panel
          title="处置操作"
          desc="按钮来自监控策略配置（匹配当前风险等级）"
          actions={<Cfg label="处置策略配置" />}
        >
          <div style={{ display: 'grid', gap: 8 }}>
            {matchedDisposes.map((d) => (
              <div key={d.id} style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px' }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{d.action} <Cfg label="对接" value={d.targetSystem} /></div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  {d.needApprove ? '需主管审批 · ' : ''}{d.needNotify ? '需触达客户 · ' : ''}分派 {d.assignTo}
                </div>
                <Button size="sm" style={{ marginTop: 6 }} onClick={() => doDispose(d)}>执行处置</Button>
              </div>
            ))}
            {matchedDisposes.length === 0 && <div style={{ fontSize: 12, color: '#94A3B8' }}>当前等级无匹配处置策略</div>}
          </div>
          <div style={{ marginTop: 10, borderTop: '1px solid #F1F5F9', paddingTop: 8 }}>
            <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>处置记录 <Sam label="样例数据" /></div>
            <DataTable columns={disposeCols} rows={disposeRows.slice(0, 4)} />
          </div>
        </Panel>
      </div>

      <div style={{ marginTop: 14 }}>
        <Panel title="关联处置工单" desc="该客户的处置任务（样例）">
          {(() => {
            const tasks = disposeTasks.filter((t) => t.custId === cust.custId);
            return tasks.length ? (
              <DataTable
                columns={[
                  { key: 'id', label: '工单ID' }, { key: 'action', label: '动作' },
                  { key: 'targetSystem', label: '对接系统' }, { key: 'status', label: '状态', type: 'badge' }, { key: 'updatedAt', label: '更新时间' },
                ]}
                rows={tasks.map((t) => ({ id: t.id, action: t.action, targetSystem: t.targetSystem, status: t.status, updatedAt: t.updatedAt }))}
                clickableKey="id"
                onCellClick={() => { window.location.href = '/console/cr/mid-dispose-workbench'; }}
              />
            ) : <div style={{ color: '#94A3B8', fontSize: 13, padding: 10 }}>暂无关联工单</div>;
          })()}
        </Panel>
      </div>

      {/* 模拟对接执行弹层 */}
      <Modal open={!!exec} onClose={() => setExec(null)} title={`处置执行 · ${exec?.action ?? ''}`} footer={<>
        <Button variant="secondary" onClick={() => setExec(null)}>取消</Button>
        <Button onClick={confirmDispose}>确认并回填</Button>
      </>}>
        <div style={{ display: 'grid', gap: 8 }}>
          <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 4 }}>模拟对接执行轨迹 <Cal label="实时模拟" /></div>
          {exec?.steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#334155' }}>
              <span style={{ width: 18, height: 18, borderRadius: 9, background: i === exec.steps.length - 1 ? '#DCFCE7' : '#EFF6FF', color: i === exec.steps.length - 1 ? '#15803D' : '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>{i + 1}</span>
              {s}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
