// 催贷管理 · 模块9 BI报表中心（数据分析）
import { useState } from 'react'
import { ZzPage, ZzCard, ZzBtn, ZzTable, ZzFilterBar, ZzField, ZzSelect, ZzBadge, ZzStat, EChart, BLUE } from './zzUi'
import { ZZ_BI, ZZ_BI_VISIT, ZZ_BI_LEGAL, ZZ_BI_AI, ZZ_GRAPH_GANGS, ZZ_GRAPH_REPAIR, ZZ_GRAPH_TOP, money, pct } from './zzData'
import type { EChartsOption } from 'echarts'

type PageKey = string
const GREEN = '#16A34A'
const RED = '#DC2626'
const GRAY = '#9CA3AF'
const AMBER = '#D97706'
function vStatusColor(s: string) {
  return s === '已完成' ? GREEN : s === '已驳回' || s === '已取消' ? RED : s === '待外访' || s === '待分配' ? BLUE : s === '外访进行中' || s === '待审核' ? '#D97706' : '#6B7280'
}

/* 时间筛选器（全局统一） */
const TIME_OPTS = ['今日', '昨日', '近7天', '近30天', '自定义区间']
function TimeFilter({ onJump }: { onJump?: (k: string) => void }) {
  const [t, setT] = useState('近30天')
  return (
    <ZzFilterBar>
      <ZzField label="时间"><ZzSelect value={t} onChange={(e) => setT(e.target.value)}>{TIME_OPTS.map((o) => <option key={o}>{o}</option>)}</ZzSelect></ZzField>
      <ZzField label="账龄"><ZzSelect defaultValue="全部"><option>全部</option><option>M0</option><option>M1</option><option>M2</option><option>M3+</option></ZzSelect></ZzField>
      <ZzField label="产品"><ZzSelect defaultValue="全部"><option>全部</option><option>现金贷</option><option>消费分期</option><option>信用贷</option><option>车抵贷</option></ZzSelect></ZzField>
      <ZzField label="业务线"><ZzSelect defaultValue="全部"><option>全部</option><option>委外</option><option>内部</option></ZzSelect></ZzField>
      <ZzBtn primary>查询</ZzBtn>
      <ZzBtn onClick={() => alert('已导出 Excel')}>导出Excel</ZzBtn>
      {onJump && <ZzBtn onClick={() => alert('已订阅定时报表邮件')}>报表订阅</ZzBtn>}
    </ZzFilterBar>
  )
}

/* KPI 卡片：大号数字 + 环比箭头 + 告警色 */
function Kpi({ label, value, mom, good, danger }: { label: string; value: string; mom?: number; good?: boolean; danger?: boolean }) {
  const color = danger ? RED : good ? GREEN : BLUE
  const arrow = mom === undefined ? null : mom >= 0
    ? <span style={{ color: GREEN }}>▲ {pct(Math.abs(mom), 0)}</span>
    : <span style={{ color: RED }}>▼ {pct(Math.abs(mom), 0)}</span>
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-2xl font-bold" style={{ color }}>{value}</div>
      <div className="mt-1 text-xs">{arrow ?? <span className="text-gray-300">—</span>}</div>
    </div>
  )
}

function useJump() {
  const [k, setK] = useState<string | null>(null)
  return { k, jump: (key: string) => { setK(key); alert('跳转到：' + key) } }
}

export function ZzBiModule({ pageKey }: { pageKey: PageKey }) {
  if (pageKey === 'zz:bi-intake') return <ZzBiIntake />
  if (pageKey === 'zz:bi-repayment') return <ZzBiRepayment />
  if (pageKey === 'zz:bi-connect') return <ZzBiConnect />
  if (pageKey === 'zz:bi-agency') return <ZzBiAgency />
  if (pageKey === 'zz:bi-qa') return <ZzBiQa />
  if (pageKey === 'zz:bi-visit') return <ZzBiVisit />
  if (pageKey === 'zz:bi-legal') return <ZzBiLegal />
  if (pageKey === 'zz:bi-ai') return <ZzBiAi />
  return <ZzBiOverview />
}

/* ============================ 一、总览驾驶舱 ============================ */
function ZzBiOverview() {
  const o = ZZ_BI.overview
  const j = useJump()
  const dualAxis: EChartsOption = {
    tooltip: { trigger: 'axis' }, legend: { data: ['入催金额(万)', '回款金额(万)'] },
    xAxis: { type: 'category', data: o.trendDays }, yAxis: [
      { type: 'value', name: '入催' }, { type: 'value', name: '回款' },
    ],
    series: [
      { name: '入催金额(万)', type: 'line', smooth: true, data: o.intakeAmountTrend, itemStyle: { color: BLUE } },
      { name: '回款金额(万)', type: 'line', smooth: true, yAxisIndex: 1, data: o.recoveryAmountTrend, itemStyle: { color: GREEN } },
    ],
  }
  const agePie: EChartsOption = {
    tooltip: {}, legend: { bottom: 0 },
    series: [{ type: 'pie', radius: ['40%', '65%'], data: [
      { name: 'M0', value: o.ageDist[0], itemStyle: { color: BLUE } },
      { name: 'M1', value: o.ageDist[1], itemStyle: { color: '#36CFC9' } },
      { name: 'M2', value: o.ageDist[2], itemStyle: { color: '#FFC53D' } },
      { name: 'M3+', value: o.ageDist[3], itemStyle: { color: RED } },
    ] }],
  }
  const channelPie: EChartsOption = {
    tooltip: {}, legend: { bottom: 0 },
    series: [{ type: 'pie', radius: ['40%', '65%'], data: o.channelDist.map((d, i) => ({ ...d, itemStyle: { color: i ? '#FF9C6E' : BLUE } })) }],
  }
  const teamBar: EChartsOption = {
    tooltip: {}, legend: { data: ['回款率', '接通率'] },
    xAxis: { type: 'category', data: o.teams.map((t) => t.name) }, yAxis: { type: 'value', max: 1 },
    series: [
      { name: '回款率', type: 'bar', data: o.teams.map((t) => t.recoveryRate), itemStyle: { color: BLUE } },
      { name: '接通率', type: 'bar', data: o.teams.map((t) => t.connectRate), itemStyle: { color: GREEN } },
    ],
  }
  return (
    <ZzPage title="总览驾驶舱" crumb="催贷管理 / BI报表中心" subtitle="催收核心指标实时总览（管理层大盘）">
      <TimeFilter onJump={j.jump} />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="总入催户数" value={String(o.intakeCustomers)} mom={o.mom.intakeCustomers} />
        <Kpi label="入催金额" value={money(o.intakeAmount)} mom={o.mom.intakeAmount} />
        <Kpi label="在催户数" value={String(o.inCollect)} mom={o.mom.inCollect} />
        <Kpi label="待回收总余额" value={money(o.balance)} mom={o.mom.balance} danger={o.mom.balance < 0} />
        <Kpi label="总回款金额" value={money(o.recovery)} mom={o.mom.recovery} good />
        <Kpi label="整体回款率" value={pct(o.recoveryRate)} mom={o.mom.recoveryRate} good />
        <Kpi label="总回户数" value={String(o.recoveryCustomers)} mom={o.mom.recoveryCustomers} good />
        <Kpi label="7日回款率" value={pct(o.recoveryRate7)} mom={o.mom.recoveryRate7} good />
        <Kpi label="30日回款率" value={pct(o.recoveryRate30)} mom={o.mom.recoveryRate30} good />
        <Kpi label="总拨打量" value={o.calls.toLocaleString()} mom={o.mom.calls} />
        <Kpi label="接通量" value={o.connects.toLocaleString()} mom={o.mom.connects} />
        <Kpi label="整体接通率" value={pct(o.connectRate)} mom={o.mom.connectRate} good />
        <Kpi label="坐席在线" value={String(o.agentsOnline)} mom={o.mom.agentsOnline} />
        <Kpi label="委外户数" value={String(o.outsourceCustomers)} mom={o.mom.outsourceCustomers} />
        <Kpi label="委外占比" value={pct(o.outsourceRatio)} mom={o.mom.outsourceRatio} />
        <Kpi label="委外回款金额" value={money(o.outsourceRecovery)} mom={o.mom.outsourceRecovery} good />
        <Kpi label="质检工单总数" value={String(o.qaTickets)} mom={o.mom.qaTickets} danger={o.mom.qaTickets > 0.1} />
        <Kpi label="违规率" value={pct(o.violationRate)} mom={o.mom.violationRate} danger={o.mom.violationRate > 0.05} />
        <Kpi label="待整改工单" value={String(o.pendingTickets)} mom={o.mom.pendingTickets} danger={o.mom.pendingTickets > 0.15} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZzCard title="近30日入催金额 / 回款金额趋势" onTitleClick={() => j.jump('zz:bi-intake')}><EChart option={dualAxis} height={280} /></ZzCard>
        <ZzCard title="逾期账龄分布"><EChart option={agePie} height={280} /></ZzCard>
        <ZzCard title="催收渠道占比（内部坐席 / 委外）"><EChart option={channelPie} height={280} /></ZzCard>
        <ZzCard title="各团队回款率 / 接通率排行" onTitleClick={() => j.jump('zz:bi-repayment')}><EChart option={teamBar} height={280} /></ZzCard>
      </div>
      <ZzCard title="风险告警面板">
        <div className="space-y-2">
          {o.alerts.map((a, i) => (
            <div key={i} className="flex items-center justify-between rounded border px-3 py-2"
              style={{ borderColor: a.level === 'red' ? RED : '#FFC53D', background: a.level === 'red' ? '#FEF2F2' : '#FFFBEB' }}>
              <span className="text-sm" style={{ color: a.level === 'red' ? RED : '#D48806' }}>{a.level === 'red' ? '🔴' : '🟡'} {a.text}</span>
              <ZzBtn sm onClick={() => j.jump(a.to)}>查看 →</ZzBtn>
            </div>
          ))}
        </div>
      </ZzCard>

      {/* 图谱风险分析看板（知识图谱：网络级风险视角） */}
      <ZzCard title="图谱风险分析看板（逾期网络级视角）">
        <div className="mb-2 rounded bg-[#eef4ff] p-2 text-xs text-[#1677ff]">知识图谱将逾期数据从「单案件」上升到「关系网络」视角，识别团伙逃废债、失联修复潜力与高风险关联客户，辅助分层处置与资源调度。</div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <ZzCard title="逾期团伙分布" bodyClass="">
            <div className="space-y-2 p-3 text-sm">
              {ZZ_GRAPH_GANGS.map((g) => (
                <div key={g.gangId} className="rounded border p-2">
                  <div className="flex items-center justify-between"><span className="font-medium">{g.gangId}（{g.size}人）</span><ZzBadge color={g.risk === '高' ? RED : AMBER}>{g.risk}风险</ZzBadge></div>
                  <div className="mt-1 text-xs text-gray-500">核心成员：{g.core}</div>
                  <div className="text-xs text-gray-500">成员：{g.members.join('、')}</div>
                  <div className="mt-1 text-xs text-amber-600">处置：{g.action}</div>
                </div>
              ))}
            </div>
          </ZzCard>
          <ZzCard title="失联修复潜力排行" bodyClass="">
            <div className="p-3">
              <EChart option={{ tooltip: { trigger: 'axis' }, xAxis: { type: 'category', data: ZZ_GRAPH_REPAIR.map((r) => r.name) }, yAxis: { type: 'value', max: 100 }, series: [{ type: 'bar', data: ZZ_GRAPH_REPAIR.map((r) => r.score), itemStyle: { color: BLUE } }] }} height={260} />
            </div>
          </ZzCard>
          <ZzCard title="高风险关联客户 TOP 榜" bodyClass="">
            <div className="space-y-1 p-3 text-sm">
              {ZZ_GRAPH_TOP.map((t, i) => (
                <div key={t.caseId} className="flex items-center justify-between rounded border px-3 py-2">
                  <span><span className="mr-1 text-gray-400">{i + 1}.</span>{t.name}<span className="ml-2 text-xs text-gray-400">{t.reason}</span></span>
                  <ZzBadge color={t.score >= 85 ? RED : AMBER}>{t.score}</ZzBadge>
                </div>
              ))}
            </div>
          </ZzCard>
        </div>
      </ZzCard>
    </ZzPage>
  )
}

/* ============================ 二、入催报表 ============================ */
function ZzBiIntake() {
  const d = ZZ_BI.intake
  const dailyBar: EChartsOption = {
    tooltip: { trigger: 'axis' }, legend: { data: ['入催户数', '入催金额(万)'] },
    xAxis: { type: 'category', data: d.dailyDays }, yAxis: [{ type: 'value' }, { type: 'value' }],
    series: [
      { name: '入催户数', type: 'bar', data: d.dailyCustomers, itemStyle: { color: BLUE } },
      { name: '入催金额(万)', type: 'line', yAxisIndex: 1, data: d.dailyAmount, itemStyle: { color: GREEN } },
    ],
  }
  const ageStack: EChartsOption = {
    tooltip: {}, legend: { data: d.ageStack.map((a) => a.name) },
    xAxis: { type: 'category', data: d.ageMonths }, yAxis: { type: 'value' },
    series: d.ageStack.map((a, i) => ({ name: a.name, type: 'bar', stack: 'age', data: a.data, itemStyle: { color: [BLUE, '#36CFC9', '#FFC53D', RED][i] } })),
  }
  const productPie: EChartsOption = {
    tooltip: {}, legend: { bottom: 0 },
    series: [{ type: 'pie', radius: '60%', data: d.productDist, itemStyle: { color: BLUE } }],
  }
  const riskPie: EChartsOption = {
    tooltip: {}, legend: { bottom: 0 },
    series: [{ type: 'pie', radius: '60%', data: d.riskDist.map((r, i) => ({ ...r, itemStyle: { color: [RED, '#FFC53D', GREEN][i] } })) }],
  }
  return (
    <ZzPage title="入催报表" crumb="催贷管理 / BI报表中心" subtitle="逾期案件流入分析">
      <TimeFilter />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="入催户数" value={String(d.customers)} />
        <Kpi label="入催本金" value={money(d.principal)} />
        <Kpi label="入催笔数" value={String(d.count)} />
        <Kpi label="待分配案件" value={String(d.unassigned)} danger={d.unassigned > 50} />
        <Kpi label="高风险入催占比" value={pct(d.highRiskRatio)} danger />
        <Kpi label="失联客户占比" value={pct(d.lostRatio)} danger />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZzCard title="每日入催户数 / 金额趋势"><EChart option={dailyBar} height={280} /></ZzCard>
        <ZzCard title="账龄维度入催分布（堆叠）"><EChart option={ageStack} height={280} /></ZzCard>
        <ZzCard title="产品类型入催占比"><EChart option={productPie} height={280} /></ZzCard>
        <ZzCard title="风险等级入催占比"><EChart option={riskPie} height={280} /></ZzCard>
      </div>
      <ZzCard title="入催明细列表">
        <ZzTable head={['案件ID', '客户', '账龄', '金额', '分配状态']} rows={d.detail.map((r) => [
          r.id, r.cust, r.age, money(r.amount),
          <ZzBadge color={r.status === '已分配' ? GREEN : r.status === '退回' ? RED : GRAY}>{r.status}</ZzBadge>,
        ])} />
        <div className="mt-3"><ZzBtn sm primary onClick={() => alert('下钻单批入催案件明细')}>下钻明细</ZzBtn><ZzBtn sm onClick={() => alert('导出 Excel 明细')}>导出Excel</ZzBtn></div>
      </ZzCard>
    </ZzPage>
  )
}

/* ============================ 三、回款报表 ============================ */
function ZzBiRepayment() {
  const d = ZZ_BI.repayment
  const [cal, setCal] = useState<'当日' | '7日' | '30日'>('30日')
  const c = d.caliber[cal]
  const trendLine: EChartsOption = {
    tooltip: { trigger: 'axis' }, legend: { data: ['回款金额(万)', '回款率'] },
    xAxis: { type: 'category', data: d.dailyDays }, yAxis: [{ type: 'value' }, { type: 'value', max: 1 }],
    series: [
      { name: '回款金额(万)', type: 'line', smooth: true, data: d.dailyAmount, itemStyle: { color: BLUE } },
      { name: '回款率', type: 'line', smooth: true, yAxisIndex: 1, data: d.dailyRate, itemStyle: { color: GREEN } },
    ],
  }
  const rankBar: EChartsOption = {
    tooltip: {}, xAxis: { type: 'value', max: 1 }, yAxis: { type: 'category', data: d.rank.map((r) => r.name).reverse() },
    series: [{ type: 'bar', data: d.rank.map((r) => r.rate).reverse(), itemStyle: { color: BLUE } }],
  }
  const settlePie: EChartsOption = {
    tooltip: {}, legend: { bottom: 0 },
    series: [{ type: 'pie', radius: ['40%', '65%'], data: d.settleDist.map((s, i) => ({ ...s, itemStyle: { color: [GREEN, '#FFC53D'][i] } })) }],
  }
  return (
    <ZzPage title="回款报表" crumb="催贷管理 / BI报表中心" subtitle="催收核心业务结果">
      <ZzFilterBar>
        <ZzField label="时间口径">
          <ZzSelect value={cal} onChange={(e) => setCal(e.target.value as '当日' | '7日' | '30日')}>
            <option>当日</option><option>7日</option><option>30日</option>
          </ZzSelect>
        </ZzField>
        <ZzField label="账龄"><ZzSelect defaultValue="全部"><option>全部</option><option>M0</option><option>M1</option><option>M2</option><option>M3+</option></ZzSelect></ZzField>
        <ZzField label="团队/坐席/机构"><ZzSelect defaultValue="全部"><option>全部</option><option>华东一组</option><option>AG-01</option></ZzSelect></ZzField>
        <ZzField label="产品"><ZzSelect defaultValue="全部"><option>全部</option><option>现金贷</option><option>消费分期</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn onClick={() => alert('导出考核数据')}>导出</ZzBtn>
      </ZzFilterBar>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="回款户数" value={String(c.customers)} good />
        <Kpi label="回款金额" value={money(c.amount)} good />
        <Kpi label="金额回款率" value={pct(c.amountRate)} good />
        <Kpi label="户数回款率" value={pct(c.custRate)} good />
        <Kpi label="本金回款" value={money(d.principal)} />
        <Kpi label="利息罚息回款" value={money(d.interest)} />
        <Kpi label="部分还款户数" value={String(d.partial)} />
        <Kpi label="全额结清户数" value={String(d.full)} good />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZzCard title="每日回款金额 & 回款率趋势"><EChart option={trendLine} height={280} /></ZzCard>
        <ZzCard title="各团队/坐席回款率排行"><EChart option={rankBar} height={280} /></ZzCard>
        <ZzCard title="全额结清 / 部分还款 占比"><EChart option={settlePie} height={280} /></ZzCard>
        <ZzCard title="回款明细（口径：{cal}）"><EChart option={{ tooltip: {}, series: [{ type: 'pie', radius: '60%', data: [{ name: '本金', value: d.principal }, { name: '利息罚息', value: d.interest }], itemStyle: { color: BLUE } }] }} height={280} /></ZzCard>
      </div>
      <ZzCard title="回款明细列表">
        <ZzTable head={['案件', '客户', '应还', '实还', '还款时间', '负责坐席/机构']} rows={d.detail.map((r) => [
          r.id, r.cust, money(r.should), <span className="text-green-600">{money(r.actual)}</span>, r.time, r.owner,
        ])} />
        <div className="mt-3"><ZzBtn sm primary onClick={() => alert('下钻单客户还款记录')}>下钻</ZzBtn><ZzBtn sm onClick={() => alert('批量导出')}>导出Excel</ZzBtn></div>
      </ZzCard>
    </ZzPage>
  )
}

/* ============================ 四、接通率报表 ============================ */
function ZzBiConnect() {
  const d = ZZ_BI.connect
  const resultPie: EChartsOption = {
    tooltip: {}, legend: { bottom: 0 },
    series: [{ type: 'pie', radius: '60%', data: d.resultDist.map((r, i) => ({ ...r, itemStyle: { color: [GREEN, '#FFC53D', '#FF9C6E', RED, '#9254DE', GRAY][i] } })) }],
  }
  const rankBar: EChartsOption = {
    tooltip: {}, xAxis: { type: 'value', max: 1 }, yAxis: { type: 'category', data: d.rank.map((r) => r.name).reverse() },
    series: [{ type: 'bar', data: d.rank.map((r) => r.rate).reverse(), itemStyle: { color: (p: any) => d.rank[p.dataIndex]?.abnormal ? RED : BLUE } }],
  }
  const hourlyLine: EChartsOption = {
    tooltip: {}, xAxis: { type: 'category', data: d.hours }, yAxis: { type: 'value', max: 1 },
    series: [{ type: 'line', smooth: true, data: d.hourlyRate, itemStyle: { color: GREEN }, areaStyle: { color: 'rgba(22,163,74,0.1)' } }],
  }
  return (
    <ZzPage title="接通率报表" crumb="催贷管理 / BI报表中心" subtitle="催收触达效率">
      <TimeFilter />
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="总拨打次数" value={d.totalCalls.toLocaleString()} />
        <Kpi label="有效拨打" value={d.validCalls.toLocaleString()} />
        <Kpi label="接通次数" value={d.connected.toLocaleString()} />
        <Kpi label="整体接通率" value={pct(d.connectRate)} good />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZzCard title="呼叫结果分布占比"><EChart option={resultPie} height={280} /></ZzCard>
        <ZzCard title="各坐席/团队接通率对比排行（红=异常）"><EChart option={rankBar} height={280} /></ZzCard>
        <ZzCard title="24小时分时段接通率（找最佳拨打时段）"><EChart option={hourlyLine} height={280} /></ZzCard>
        <ZzCard title="坐席KPI考核表">
          <ZzTable head={['坐席', '拨打总量', '接通数', '接通率', '无效拨打']} rows={d.detail.map((r) => [
            r.agent, r.calls, r.connected,
            <span style={{ color: r.rate < 0.5 ? RED : GREEN }}>{pct(r.rate)}</span>,
            <span style={{ color: r.invalid > 200 ? RED : undefined }}>{r.invalid}</span>,
          ])} />
        </ZzCard>
      </div>
      <div className="mt-3"><ZzBtn sm primary onClick={() => alert('导出坐席KPI考核表')}>导出KPI表</ZzBtn><ZzBtn sm onClick={() => alert('导出通话明细记录')}>导出通话明细</ZzBtn></div>
    </ZzPage>
  )
}

/* ============================ 五、委外报表 ============================ */
function ZzBiAgency() {
  const d = ZZ_BI.agency
  const [sel, setSel] = useState('全部机构')
  const rateBar: EChartsOption = {
    tooltip: {}, xAxis: { type: 'value', max: 1 }, yAxis: { type: 'category', data: d.agencies.map((a) => a.name).reverse() },
    series: [{ type: 'bar', data: d.agencies.map((a) => a.rate).reverse(), itemStyle: { color: (p: any) => d.agencies[p.dataIndex]?.abnormal ? RED : BLUE } }],
  }
  const balBar: EChartsOption = {
    tooltip: { trigger: 'axis' }, legend: { data: ['委外余额(万)', '回款金额(万)'] },
    xAxis: { type: 'category', data: d.agencies.map((a) => a.name) }, yAxis: { type: 'value' },
    series: [
      { name: '委外余额(万)', type: 'bar', data: d.agencies.map((a) => Math.round(a.balance / 10000)), itemStyle: { color: BLUE } },
      { name: '回款金额(万)', type: 'bar', data: d.agencies.map((a) => Math.round(a.recovery / 10000)), itemStyle: { color: GREEN } },
    ],
  }
  const trendLine: EChartsOption = {
    tooltip: { trigger: 'axis' }, legend: { data: d.agencies.map((a) => a.name) },
    xAxis: { type: 'category', data: d.months }, yAxis: { type: 'value' },
    series: d.agencies.map((a, i) => ({ name: a.name, type: 'line', data: a.trend, itemStyle: { color: [BLUE, '#36CFC9', RED, GREEN][i] } })),
  }
  const rows = sel === '全部机构' ? d.agencies : d.agencies.filter((a) => a.name === sel)
  return (
    <ZzPage title="委外报表" crumb="催贷管理 / BI报表中心" subtitle="外包催收机构管理">
      <ZzFilterBar>
        <ZzField label="机构"><ZzSelect value={sel} onChange={(e) => setSel(e.target.value)}><option>全部机构</option>{d.agencies.map((a) => <option key={a.name}>{a.name}</option>)}</ZzSelect></ZzField>
        <ZzField label="账龄"><ZzSelect defaultValue="全部"><option>全部</option><option>M1</option><option>M2</option><option>M3+</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn onClick={() => alert('导出委外结算报表')}>导出结算报表</ZzBtn>
      </ZzFilterBar>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="委外户数" value={String(d.customers)} />
        <Kpi label="委外本金余额" value={money(d.balance)} />
        <Kpi label="委外回款金额" value={money(d.recoveryAmount)} good />
        <Kpi label="委外回款率" value={pct(d.recoveryRate)} good />
        <Kpi label="佣金金额" value={money(d.commission)} />
        <Kpi label="平均佣金率" value={pct(d.commissionRatio)} />
        <Kpi label="委外回款户数" value={String(d.recoveryCustomers)} good />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZzCard title="各外包机构回款率对比排行"><EChart option={rateBar} height={280} /></ZzCard>
        <ZzCard title="各机构委外余额 & 回款金额对比"><EChart option={balBar} height={280} /></ZzCard>
        <ZzCard title="各机构近6周回款趋势对比" className="lg:col-span-2"><EChart option={trendLine} height={280} /></ZzCard>
      </div>
      <ZzCard title="机构维度汇总（标红=风险）">
        <ZzTable head={['机构', '案件量', '回款率', '佣金', '投诉', '违规', '状态']} rows={rows.map((a) => [
          <button className="font-mono text-[#1677ff] hover:underline" onClick={() => alert('下钻 ' + a.name + ' 案件明细')}>{a.name}</button>,
          a.cases, <span style={{ color: a.abnormal ? RED : undefined }}>{pct(a.rate)}</span>, money(a.commission),
          <ZzBadge color={a.complaints > 3 ? RED : GRAY}>{a.complaints}</ZzBadge>,
          <ZzBadge color={a.violation > 0 ? RED : GREEN}>{a.violation}</ZzBadge>,
          <ZzBadge color={a.abnormal ? RED : GREEN}>{a.abnormal ? '异常' : '正常'}</ZzBadge>,
        ])} />
        <div className="mt-3"><ZzBtn sm primary onClick={() => alert('佣金计算预览（结算）')}>佣金预览</ZzBtn></div>
      </ZzCard>
    </ZzPage>
  )
}

/* ============================ 六、质检报表 ============================ */
function ZzBiQa() {
  const d = ZZ_BI.qa
  const [status, setStatus] = useState('全部')
  const pie: EChartsOption = {
    tooltip: {}, legend: { bottom: 0 },
    series: [{ type: 'pie', radius: '60%', data: d.violationDist.map((v, i) => ({ ...v, itemStyle: { color: [RED, '#FFC53D', '#FF9C6E', '#9254DE', '#36CFC9'][i] } })) }],
  }
  const rankBar: EChartsOption = {
    tooltip: {}, xAxis: { type: 'category', data: d.rank.map((r) => r.name) }, yAxis: { type: 'value' },
    series: [{ type: 'bar', data: d.rank.map((r) => r.count), itemStyle: { color: (p: any) => d.rank[p.dataIndex]?.abnormal ? RED : BLUE } }],
  }
  const trend: EChartsOption = {
    tooltip: {}, xAxis: { type: 'category', data: d.days }, yAxis: { type: 'value', max: 1 },
    series: [{ type: 'line', smooth: true, data: d.passRateTrend, itemStyle: { color: GREEN }, areaStyle: { color: 'rgba(22,163,74,0.1)' } }],
  }
  const tickets = status === '全部' ? d.tickets : d.tickets.filter((t) => t.status === status)
  return (
    <ZzPage title="质检报表" crumb="催贷管理 / BI报表中心" subtitle="催收合规质量监控">
      <ZzFilterBar>
        <ZzField label="时间"><ZzSelect defaultValue="近30天"><option>今日</option><option>近7天</option><option>近30天</option></ZzSelect></ZzField>
        <ZzField label="团队/坐席"><ZzSelect defaultValue="全部"><option>全部</option><option>华东一组</option><option>华北组</option></ZzSelect></ZzField>
        <ZzField label="违规类型"><ZzSelect defaultValue="全部"><option>全部</option>{d.violationDist.map((v) => <option key={v.name}>{v.name}</option>)}</ZzSelect></ZzField>
        <ZzField label="工单状态"><ZzSelect value={status} onChange={(e) => setStatus(e.target.value)}><option>全部</option><option>待质检</option><option>待整改</option><option>已整改</option><option>已完成</option><option>驳回整改</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn onClick={() => alert('导出质检考核报告')}>导出报告</ZzBtn>
      </ZzFilterBar>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="抽检总量" value={String(d.sampled)} />
        <Kpi label="抽检覆盖率" value={pct(d.coverage, 0)} good />
        <Kpi label="合规通过率" value={pct(d.passRate)} good />
        <Kpi label="待整改工单" value={String(d.fail)} danger />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZzCard title="违规类型分布占比"><EChart option={pie} height={280} /></ZzCard>
        <ZzCard title="各团队/坐席违规数量排行（红=高频）"><EChart option={rankBar} height={280} /></ZzCard>
        <ZzCard title="每日质检通过率变化" className="lg:col-span-2"><EChart option={trend} height={260} /></ZzCard>
      </div>
      <ZzCard title="质检工单（点击跳转录音回放）">
        <ZzTable head={['工单号', '坐席', '违规类型', '状态', '时间', '操作']} rows={tickets.map((t) => [
          t.id, <span style={{ color: d.rank.find((r) => r.name === t.agent)?.abnormal ? RED : undefined }}>{t.agent}</span>,
          t.type, <ZzBadge color={d.statusColor[t.status] ?? GRAY}>{t.status}</ZzBadge>, t.time,
          <ZzBtn sm onClick={() => alert('跳转录音回放：' + t.id)}>录音回放</ZzBtn>,
        ])} />
      </ZzCard>
    </ZzPage>
  )
}

/* ============================ 七、外访报表（数据分析） ============================ */
function ZzBiVisit() {
  const d = ZZ_BI_VISIT
  const rankBar: EChartsOption = {
    tooltip: {}, legend: { data: ['任务量', '完成率', '外访有效率'] },
    xAxis: { type: 'category', data: d.visitors.map((v) => v.name) }, yAxis: [{ type: 'value' }, { type: 'value', max: 1 }],
    series: [
      { name: '任务量', type: 'bar', data: d.visitors.map((v) => v.tasks), itemStyle: { color: BLUE } },
      { name: '完成率', type: 'line', yAxisIndex: 1, data: d.visitors.map((v) => v.finishRate), itemStyle: { color: GREEN } },
      { name: '外访有效率', type: 'line', yAxisIndex: 1, data: d.visitors.map((v) => v.effectiveRate), itemStyle: { color: '#FFC53D' } },
    ],
  }
  const trendLine: EChartsOption = {
    tooltip: {}, xAxis: { type: 'category', data: d.days }, yAxis: { type: 'value' },
    series: [{ type: 'bar', data: d.dailyTrend, itemStyle: { color: BLUE } }],
  }
  return (
    <ZzPage title="外访报表" crumb="催贷管理 / BI报表中心" subtitle="外访任务统计与人员绩效考核">
      <ZzFilterBar>
        <ZzField label="外访员"><ZzSelect defaultValue="全部"><option>全部</option>{d.visitors.map((v) => <option key={v.name}>{v.name}</option>)}</ZzSelect></ZzField>
        <ZzField label="时间"><ZzSelect defaultValue="近30天"><option>今日</option><option>近7天</option><option>近30天</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn onClick={() => alert('导出外访员绩效考核数据')}>导出</ZzBtn>
      </ZzFilterBar>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="下达任务数" value={String(d.total)} />
        <Kpi label="已分配" value={String(d.assigned)} />
        <Kpi label="待分配" value={String(d.unassigned)} danger={d.unassigned > 0} />
        <Kpi label="打卡率" value={pct(d.punchRate)} good />
        <Kpi label="按时完成率" value={pct(d.onTimeRate)} good />
        <Kpi label="报告待审核" value={String(d.pendingReview)} danger />
        <Kpi label="驳回率" value={pct(d.rejectRate)} danger={d.rejectRate > 0.15} />
        <Kpi label="实地见客户占比" value={pct(d.seeCustomerRate)} good />
        <Kpi label="达成还款计划" value={String(d.planDeal) + ' 户'} good />
        <Kpi label="外访带来回款" value={money(d.recoveryFromVisit)} good />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZzCard title="人员排行：任务量 / 完成率 / 外访有效率"><EChart option={rankBar} height={300} /></ZzCard>
        <ZzCard title="近30日每日任务趋势"><EChart option={trendLine} height={300} /></ZzCard>
      </div>
      <ZzCard title="外访明细">
        <ZzTable head={['任务ID', '外访员', '打卡', '完成状态', '外访有效', '带来回款']} rows={d.detail.map((r) => [
          r.id, r.visitor, <ZzBadge color={r.punch === '已打卡' ? GREEN : GRAY}>{r.punch}</ZzBadge>,
          <ZzBadge color={vStatusColor(r.finish)}>{r.finish}</ZzBadge>,
          <ZzBadge color={r.effective === '有效' ? GREEN : r.effective === '无效' ? RED : GRAY}>{r.effective}</ZzBadge>,
          <span className="text-green-600">{r.recovery ? money(r.recovery) : '—'}</span>,
        ])} />
      </ZzCard>
    </ZzPage>
  )
}

/* ============================ 八、法务处置报表（数据分析） ============================ */
function ZzBiLegal() {
  const d = ZZ_BI_LEGAL
  const trendLine: EChartsOption = {
    tooltip: {}, xAxis: { type: 'category', data: d.days }, yAxis: { type: 'value' },
    series: [{ type: 'bar', data: d.filingTrend, itemStyle: { color: '#9333EA' } }],
  }
  const stagePie: EChartsOption = {
    tooltip: {}, legend: { bottom: 0 }, series: [{ type: 'pie', radius: ['40%', '70%'], data: d.stages.map((s) => ({ name: s.stage, value: s.count })) }],
  }
  return (
    <ZzPage title="法务处置报表" crumb="催贷管理 / BI报表中心" subtitle="法务处置全流程监控与结案分析">
      <ZzFilterBar>
        <ZzField label="时间"><ZzSelect defaultValue="近90天"><option>今日</option><option>近30天</option><option>近90天</option><option>全部</option></ZzSelect></ZzField>
        <ZzField label="承办法务"><ZzSelect defaultValue=""><option value="">全部</option><option>张法务</option><option>李法务</option><option>王法务</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn onClick={() => alert('导出法务处置报表')}>导出</ZzBtn>
      </ZzFilterBar>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="待诉讼评估量" value={String(d.pendingEval)} />
        <Kpi label="立案数量" value={String(d.filed)} good />
        <Kpi label="调解成功" value={String(d.mediateSuccess)} good />
        <Kpi label="执行申请数" value={String(d.execApplied)} />
        <Kpi label="执行回款金额" value={money(d.execRecovery)} good />
        <Kpi label="终本率" value={pct(d.endRate)} danger />
        <Kpi label="诉讼结案数量" value={String(d.closed)} good />
        <Kpi label="在办案件" value={String(d.stages.filter((s) => s.stage !== '已归档').reduce((a, b) => a + b.count, 0))} />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZzCard title="各阶段案件分布"><EChart option={stagePie} height={300} /></ZzCard>
        <ZzCard title="近30日立案趋势"><EChart option={trendLine} height={300} /></ZzCard>
      </div>
      <ZzCard title="法务处置明细">
        <ZzTable head={['案件', '客户', '评估', '证据', '立案', '调解', '执行', '结案']} rows={d.detail.map((r) => [
          r.id, r.client, r.eval, <ZzBadge color={r.evidence === '齐' ? GREEN : RED}>{r.evidence}</ZzBadge>, r.filed, r.mediate, r.exec,           <ZzBadge color={r.closed !== '-' ? GRAY : BLUE}>{r.closed}</ZzBadge>,
        ])} />
      </ZzCard>
    </ZzPage>
  )
}

/* ============================ 九、AI协催报表（数据分析） ============================ */
function ZzBiAi() {
  const d = ZZ_BI_AI
  const trendLine: EChartsOption = {
    tooltip: {}, xAxis: { type: 'category', data: d.days }, yAxis: { type: 'value' },
    series: [{ type: 'line', data: d.trend, areaStyle: {}, itemStyle: { color: BLUE } }],
  }
  const tplBar: EChartsOption = {
    tooltip: {}, legend: { data: ['呼叫量', '接通率', '承诺还款率'] },
    xAxis: { type: 'category', data: d.byTemplate.map((t) => t.name) }, yAxis: [{ type: 'value' }, { type: 'value', max: 1 }],
    series: [
      { name: '呼叫量', type: 'bar', data: d.byTemplate.map((t) => t.calls), itemStyle: { color: BLUE } },
      { name: '接通率', type: 'line', yAxisIndex: 1, data: d.byTemplate.map((t) => t.connectRate), itemStyle: { color: GREEN } },
      { name: '承诺还款率', type: 'line', yAxisIndex: 1, data: d.byTemplate.map((t) => t.promiseRate), itemStyle: { color: '#FFC53D' } },
    ],
  }
  return (
    <ZzPage title="AI协催报表" crumb="催贷管理 / BI报表中心" subtitle="AI 外呼效果与模板对比分析">
      <ZzFilterBar>
        <ZzField label="时间"><ZzSelect defaultValue="近30天"><option>今日</option><option>近7天</option><option>近30天</option></ZzSelect></ZzField>
        <ZzField label="对话模板"><ZzSelect defaultValue="全部"><option>全部</option>{d.byTemplate.map((t) => <option key={t.name}>{t.name}</option>)}</ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn onClick={() => alert('导出 AI 协催报表')}>导出</ZzBtn>
      </ZzFilterBar>
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="AI总呼叫量" value={String(d.totalCalls)} />
        <Kpi label="接通率" value={pct(d.connectRate)} good />
        <Kpi label="承诺还款率" value={pct(d.promiseRate)} good />
        <Kpi label="转人工占比" value={pct(d.toHumanRate)} danger />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ZzCard title="近30日呼叫趋势"><EChart option={trendLine} height={300} /></ZzCard>
        <ZzCard title="不同模板效果对比"><EChart option={tplBar} height={300} /></ZzCard>
      </div>
      <ZzCard title="任务明细">
        <ZzTable head={['任务', '类型', '模板', '状态', '呼叫量', '接通率', '承诺还款', '转人工']} rows={d.detail.map((r) => [
          r.id, <ZzBadge color={r.type === '自动周期' ? BLUE : AMBER}>{r.type}</ZzBadge>, r.template, <ZzBadge color={r.status === '运行中' ? GREEN : GRAY}>{r.status}</ZzBadge>, r.calls, r.connectRate, r.promise, r.toHuman,
        ])} />
      </ZzCard>
    </ZzPage>
  )
}
