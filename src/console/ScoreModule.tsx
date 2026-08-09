/* 评分产品子系统 · v3 重整版
 * 三个产品：智察分 / 智信分 / 智融分
 * 页面：overview / query / monitor / vintage / tier / api / batch / bill
 */
import { useState, Fragment } from 'react'
import { PageHeader, Panel, StatCard, DataTable, Badge, Button } from '../components/ui'
import type { Column, Row } from '../components/ui'
import { BarChart, LineChart, DonutChart } from '../components/charts'
import ScoreGauge from '../components/ScoreGauge'
import { Sam, Cal } from './SourceTag'
import { maskId, maskPhone } from './data'
import { useScoring, SCORE_PROD_LABEL, type ScoreProd, type ScoringData } from './scoringData'

const P: Record<string, ScoreProd> = { zhicha: 'zhicha', zhixin: 'zhixin', zhirong: 'zhirong' }
const prodOf = (key: string): ScoreProd => P[key.split(':')[1]?.split('-')[0] ?? ''] ?? 'zhicha'
const pageKind = (key: string): string => {
  const rest = key.split(':')[1] ?? ''
  const i = rest.indexOf('-')
  return i < 0 ? rest : rest.slice(i + 1)
}

const statusKind: Record<string, 'gray' | 'blue' | 'amber' | 'green' | 'violet' | 'red'> = {
  正常: 'green', 偏移: 'red', 临界: 'amber', 完成: 'green', 计算中: 'amber',
  已出账: 'green', 成功: 'green', PSI偏移: 'red',
}

export default function ScoreModule({ pageKey }: { pageKey: string }) {
  const d = useScoring()
  const prod = prodOf(pageKey)
  const kind = pageKind(pageKey)

  const title = (() => {
    if (kind === '') return '评分体系总览'
    if (kind === 'monitor') return prod === 'zhicha' ? '欺诈监控' : '场景效果监控'
    const map: Record<string, string> = {
      query: '评分查询', vintage: '客群分布与逾期表现', tier: '客户分层',
      api: 'API 对接', batch: '批量评分', bill: '计费与账单',
    }
    return map[kind] ?? '评分体系'
  })()
  const desc = (() => {
    const map: Record<string, string> = {
      '': '三产品能力对比、目标用户拆解、对象评分档案与体系总览',
      query: '输入个人标识查询评分，结果页展示分数、等级、概率、决策建议与因子解释',
      monitor: prod === 'zhicha' ? '新客欺诈率、通道欺诈率、命中 TOP 规则趋势与模型监控指标' : '各场景转化率/命中率/用信情况',
      vintage: '分档通过率、Vintage 逾期曲线、评分分布',
      tier: '高价值/高风险/沉睡/活跃客群分组与占比',
      api: '一次对接三产品：接口文档、鉴权、调用日志',
      batch: '文件上传 → 任务队列 → 结果下载',
      bill: '三产品统一账本、充值、余额、月度账单',
    }
    return map[kind] ?? ''
  })()

  return (
    <div className="space-y-6">
      <PageHeader title={title} crumb="评分产品" subtitle={desc}
        actions={<><Sam label="样例数据" value="scoringData.json" /><Cal label="实时统计" /></>} />
      {(kind === '' || kind === 'overview') && <OverviewPage d={d} />}
      {kind === 'query' && <QueryPage d={d} prod={prod} />}
      {kind === 'monitor' && prod === 'zhicha' && <ZhichaMonitor d={d} />}
      {kind === 'monitor' && prod === 'zhirong' && <SceneEffectPage d={d} />}
      {kind === 'vintage' && <VintagePage d={d} prod={prod} />}
      {kind === 'tier' && <TierPage d={d} />}
      {kind === 'api' && <ApiPage d={d} />}
      {kind === 'batch' && <BatchPage d={d} prod={prod} />}
      {kind === 'bill' && <BillPage d={d} prod={prod} />}
    </div>
  )
}

/* ============ 评分体系总览 ============ */
function OverviewPage({ d }: { d: ScoringData }) {
  const prods: ScoreProd[] = ['zhicha', 'zhixin', 'zhirong']
  const [id, setId] = useState('3201**********1234')
  const [phone, setPhone] = useState('138****5678')
  const [queried, setQueried] = useState(false)
  const callTotal = 1642 + 1480 + 720

  return (
    <>
      <Panel title="评分产品 · 模型即服务" desc="面向银行、保险、消费金融、互联网金融等机构的标准化评分产品，覆盖贷前反欺诈、贷前违约评估与客群经营三大场景">
        <div className="grid gap-4 lg:grid-cols-3">
          {prods.map((p) => {
            const m = d.meta[p]
            return (
              <div key={p} className="flex flex-col rounded-xl border border-slate-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="text-base font-semibold text-slate-800">{m.name}</div>
                  <Badge kind="violet">{m.range[0]}~{m.range[1]}</Badge>
                </div>
                <div className="mt-1 text-xs text-slate-500">{m.hint}</div>
                <div className="mt-3 text-xs leading-relaxed text-slate-500"><span className="font-medium text-slate-600">分数空间：</span>{m.range[0]}~{m.range[1]} · {m.hint}</div>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel title="对象评分档案" desc="输入一个申请人，同时查看三份评分">
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <label className="block">
            <span className="text-sm text-slate-500">身份证号</span>
            <input value={id} onChange={(e) => setId(e.target.value)} className="mt-1 w-64 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <label className="block">
            <span className="text-sm text-slate-500">手机号</span>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-48 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
          </label>
          <button className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700" onClick={() => setQueried(true)}>查看评分档案</button>
        </div>
        {queried && <div className="mb-3 text-xs text-slate-400">查询对象：{maskId(id)} · {maskPhone(phone)}　查询时间：2026-08-08 10:30</div>}
        <div className="grid gap-4 md:grid-cols-3">
          {prods.map((p) => {
            const m = d.meta[p]
            return (
              <div key={p} className="flex flex-col items-center rounded-xl border border-slate-200 p-4">
                <div className="mb-2 text-sm font-medium text-slate-600">{m.name}</div>
                <ScoreGauge value={m.score} min={m.range[0]} max={m.range[1]} label={`${m.unit}`} color={m.color} hint={m.hint} />
                <Badge kind={m.suggestion.kind as 'red'}>{m.suggestion.v}</Badge>
              </div>
            )
          })}
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="今日调用总量" value={`${callTotal.toLocaleString()}万`} delta="+4.7%" deltaType="up" accent="brand" hint={<Cal label="实时统计" />} />
        <StatCard label="智察分命中高风险" value="8.1%" delta="+0.6pp" deltaType="down" accent="rose" hint={<Sam label="样例" />} />
        <StatCard label="智信分拒绝占比" value="12.4%" delta="-0.5pp" deltaType="up" accent="emerald" hint={<Sam label="样例" />} />
        <StatCard label="监控异常" value="1 项" delta="智融分PSI偏移" deltaType="flat" accent="amber" hint={<Sam label="样例" />} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="三产品今日调用量（万）" desc={<span><Cal label="实时统计" /></span>}>
          <BarChart labels={['智察分', '智信分', '智融分']} series={[{ name: '调用量', color: '#3366ff', data: [1642, 1480, 720] }]} unit="万" height={220} />
        </Panel>
        <Panel title="场景使用分布" desc="智融分三场景调用占比">
          <DonutChart data={[
            { label: '违约风险审核', value: 45, color: '#D4537E' },
            { label: '授信申请转化', value: 32, color: '#378ADD' },
            { label: '借贷兴趣', value: 23, color: '#1D9E75' },
          ]} centerLabel="调用占比" centerValue="100%" height={210} />
        </Panel>
      </div>

      <Panel title="业务闭环 · 从单次决策到持续经营" desc="单次查询 → 批量评分 → API 对接 → 自动化监控 → 计费账单，形成完整产品闭环">
        <div className="flex flex-wrap items-stretch gap-2">
          {[{ step: '单次查询', desc: '贷前决策：输入标识即得三产品分数与决策建议', page: '各产品评分查询' },
            { step: '批量评分', desc: '全量客群打分，支撑策略与分层经营', page: '批量评分' },
            { step: 'API 对接', desc: '嵌入业务系统，一次对接三产品', page: 'API 对接' },
            { step: '自动化监控', desc: '高频监控 KS/AUC/PSI，发现漂移即调优', page: '各产品监控' },
            { step: '计费与账单', desc: '按调用/查得计费，统一账本对账', page: '计费与账单' }].map((c, i, arr) => (
            <Fragment key={c.step}>
              <div className="flex-1 min-w-[160px] rounded-xl border border-slate-200 p-3">
                <div className="text-sm font-medium text-slate-700">{c.step}</div>
                <div className="mt-1 text-xs leading-relaxed text-slate-500">{c.desc}</div>
                <div className="mt-2"><Badge kind="gray">{c.page}</Badge></div>
              </div>
              {i < arr.length - 1 && <div className="grid place-items-center px-1 text-lg text-slate-300">→</div>}
            </Fragment>
          ))}
        </div>
      </Panel>
    </>
  )
}

/* ============ 评分查询（按产品下钻） ============ */
function QueryPage({ d, prod }: { d: ScoringData; prod: ScoreProd }) {
  const m = d.meta[prod]
  const [id, setId] = useState('3201**********1234')
  const [phone, setPhone] = useState('138****5678')
  const [queried, setQueried] = useState(false)
  const levelColor: Record<string, string> = { 高: '#DC2626', 中: '#D97706', 低: '#16A34A' }
  const levelKind: Record<string, 'red' | 'amber' | 'green'> = { 高: 'red', 中: 'amber', 低: 'green' }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel title="查询条件" desc="支持身份证号 / 手机号">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-500">身份证号</span>
              <input value={id} onChange={(e) => setId(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-500">手机号</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-700" onClick={() => setQueried(true)}>查询评分</button>
            <span className="text-xs text-slate-400">适用客群：除小额短期现金贷外的金融全行业，尤其消费金融。</span>
          </div>
          {queried && (
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="text-slate-500">查询对象</p>
              <p className="mt-1 font-mono text-ink-900">{maskId(id)} · {maskPhone(phone)}</p>
              <p className="mt-3 text-slate-500">决策建议</p>
              <p className="mt-1"><Badge kind={m.suggestion.kind as 'red'}>{m.suggestion.v}</Badge></p>
            </div>
          )}
        </Panel>

        <Panel title="风险评估结果">
          <div className="flex flex-col items-center">
            <ScoreGauge value={m.score} min={m.range[0]} max={m.range[1]} label={`${m.name}（${m.unit}）`} color={m.color} hint={m.hint} />
            {queried && <p className="mt-2 text-xs text-slate-400">查询时间：2026-08-08 10:30 · 模型版本 {prod === 'zhicha' ? 'V3.2' : prod === 'zhixin' ? 'V4.0' : 'V2.1'}</p>}
          </div>
        </Panel>
      </div>

      <Panel title="风险因子明细" desc="各因子对评分的贡献度">
        <div className="space-y-4">
          {m.factors.map((f) => (
            <div key={f.name}>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-700">{f.name}</span>
                <span className="flex items-center gap-2">
                  <Badge kind={levelKind[f.level]}>{f.level}风险</Badge>
                  <span className="w-12 text-right font-medium tabular-nums text-ink-900">{f.contribution}%</span>
                </span>
              </div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full rounded-full" style={{ width: `${f.contribution * 2}%`, background: levelColor[f.level] }} />
                </div>
                <span className="w-40 text-xs text-slate-400">{f.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      {prod === 'zhicha' && queried && <ZhichaDrill />}
      {prod === 'zhixin' && queried && <ZhixinDrill />}
      {prod === 'zhirong' && queried && <ZhirongDrill d={d} />}
    </>
  )
}

function ZhichaDrill() {
  const rules = [
    { name: '多头借贷强度', value: '近30天申贷 7 家（阈值≥5）', weight: 28, hit: true },
    { name: '设备环境风险', value: '模拟器特征命中', weight: 22, hit: true },
    { name: '命中灰名单', value: '外部灰名单 ID#88231', weight: 20, hit: true },
    { name: '同设备关联账号', value: '3 个关联账号', weight: 18, hit: false },
  ]
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="规则命中明细" desc="还原每条命中规则，解释为什么判可疑">
        <div className="space-y-3">
          {rules.map((r) => (
            <div key={r.name} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
              <Badge kind={r.hit ? 'red' : 'gray'}>{r.hit ? '命中' : '未命中'}</Badge>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-ink-900">{r.name}</div>
                <div className="text-xs text-slate-500">{r.value}</div>
              </div>
              <span className="text-xs text-slate-400">权重 {r.weight}%</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="黑名单与团伙" desc="命中名单与关联团伙">
        <div className="space-y-3">
          <div className="flex items-center gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3">
            <Badge kind="red">黑名单</Badge>
            <span className="text-sm">手机号 138****0001 · 欺诈团伙成员</span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
            <Badge kind="amber">团伙</Badge>
            <span className="text-sm">设备群控团伙A · 成员 12 人 · 设备 8 台</span>
          </div>
          <div className="text-xs text-slate-400">黑名单/团伙管理见管理中心「规则合集」→ 黑名单管理、团伙库管理</div>
        </div>
      </Panel>
    </div>
  )
}

function ZhixinDrill() {
  const scorecard = [
    { name: '历史逾期记录', value: '近2年 M3+ 1 次', score: 26 },
    { name: '负债收入比', value: '58%（阈值 70%）', score: 22 },
    { name: '征信查询频次', value: '近6月 8 次', score: 18 },
    { name: '收入稳定性', value: '连续 14 月稳定', score: 20 },
    { name: '授信使用率', value: '43%', score: 14 },
  ]
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="评分卡解释" desc="拆解各评分项对分数的贡献">
        <div className="space-y-3">
          {scorecard.map((s) => (
            <div key={s.name} className="flex items-center gap-3">
              <span className="w-28 text-sm text-slate-700">{s.name}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-green-500" style={{ width: `${s.score * 2}%` }} />
              </div>
              <span className="w-24 text-xs text-slate-500">{s.value}</span>
              <span className="w-8 text-right text-sm font-medium tabular-nums text-ink-900">{s.score}</span>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="额度与拒绝建议" desc="准入决策出口">
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <span className="text-sm">建议额度档</span><b className="text-emerald-700">标准额度（最高 20 万）</b>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <span className="text-sm">拒绝阈值</span><b>≤ 580 拒绝</b>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <span className="text-sm">利率档</span><b>L3（基准）</b>
          </div>
          <div className="text-xs text-slate-400">拒绝原因示例：历史逾期 M3+ / 负债比超阈值 / 查询频次过高</div>
        </div>
      </Panel>
    </div>
  )
}

function ZhirongDrill({ d }: { d: ScoringData }) {
  const parts = d.fusion.zhirong
  const scenes = d.sceneScores.zhirong
  return (
    <>
      <Panel title="融合构成" desc="智融分由什么融合而来">
        <div className="space-y-3">
          {parts.map((p) => (
            <div key={p.name} className="flex items-center gap-3">
              <span className="w-24 text-sm font-medium text-slate-700">{p.name}</span>
              <Badge kind={p.source.startsWith('引用') ? 'blue' : 'violet'}>{p.source}</Badge>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-violet-500" style={{ width: `${p.contribution * 2}%` }} />
              </div>
              <span className="w-44 text-xs text-slate-500">{p.desc}</span>
              <span className="w-8 text-right text-sm font-medium tabular-nums text-ink-900">{p.contribution}%</span>
            </div>
          ))}
        </div>
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="场景评分对比" desc="同一申请人 · 三个场景分">
          <div className="space-y-3">
            {scenes.map((s) => (
              <div key={s.scene} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <span className="text-sm text-slate-700">{s.scene}</span>
                <div className="flex items-center gap-3">
                  <Badge kind={s.score >= 680 ? 'green' : s.score >= 650 ? 'amber' : 'red'}>{s.level}</Badge>
                  <b className="w-10 text-right text-lg tabular-nums">{s.score}</b>
                </div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="360 风险评估" desc="风险 × 价值 四象限">
          <div className="grid grid-cols-2 gap-3">
            {d.matrix.map((c) => (
              <div key={c.name} className={`rounded-lg border p-3 ${c.risk === '高' ? 'border-rose-200 bg-rose-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <div className="text-sm font-medium text-ink-900">{c.name}</div>
                <div className="mt-1 text-xs text-slate-500">{c.desc}</div>
                <div className="mt-2 flex gap-1">
                  <Badge kind={c.risk === '高' ? 'red' : 'green'}>风险 {c.risk}</Badge>
                  <Badge kind={c.value === '高' ? 'violet' : 'gray'}>价值 {c.value}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </>
  )
}

/* ============ 欺诈监控 ============ */
function ZhichaMonitor({ d }: { d: ScoringData }) {
  const metricCols: Column[] = [
    { key: 'label', label: '指标', width: '120px' },
    { key: 'value', label: '数值', width: '100px' },
    { key: 'trend', label: '趋势', width: '120px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '100px' },
  ]
  const metricRows: Row[] = d.monitor.zhicha.map((m) => ({
    id: m.label, label: m.label, value: m.value, trend: m.trend,
    status: { v: m.ok ? '正常' : '异常', kind: m.ok ? 'green' : 'red' },
  }))
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="新客欺诈率" value="6.8%" delta="+0.4pp" deltaType="down" accent="rose" hint={<Cal label="实时统计" />} />
        <StatCard label="通道欺诈率" value="3.2%" delta="-0.1pp" deltaType="up" accent="emerald" hint={<Sam label="样例" />} />
        <StatCard label="命中规则拦截" value="8,412 笔" delta="+2.1%" deltaType="down" accent="amber" hint={<Sam label="样例" />} />
        <StatCard label="规则命中 TOP" value="多头借贷" delta="28% 权重" deltaType="flat" accent="brand" hint={<Sam label="样例" />} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="模型监控指标" desc="KS / AUC / Lift / PSI">
          <DataTable columns={metricCols} rows={metricRows} empty="暂无数据" pager={false} />
        </Panel>
        <Panel title="近 7 日新客欺诈率（%）" desc={<span><Cal label="实时统计" /></span>}>
          <LineChart labels={['08-02', '08-03', '08-04', '08-05', '08-06', '08-07', '08-08']}
            series={[{ name: '新客欺诈率', color: '#ef4444', data: [6.2, 6.5, 6.9, 6.6, 7.0, 7.3, 6.8] }]} unit="%" height={220} />
        </Panel>
      </div>
      <Panel title="命中 TOP 规则" desc="规则命中次数排行">
        <BarChart labels={['多头借贷', '设备风险', '灰名单', '同设备关联']}
          series={[{ name: '命中次数(万)', color: '#ff8800', data: [3.2, 2.4, 1.8, 1.1] }]} unit="万" height={200} />
      </Panel>
    </div>
  )
}

/* ============ 客群分布与逾期表现 ============ */
function VintagePage({ d, prod }: { d: ScoringData; prod: ScoreProd }) {
  const dist = d.dist[prod]
  return (
    <div className="space-y-6">
      <Panel title={`${SCORE_PROD_LABEL[prod]} · 评分分布`} desc="分档占比">
        <BarChart labels={dist.labels} series={[{ name: '占比', color: '#3366ff', data: dist.data }]} unit="%" height={230} />
      </Panel>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="分档通过率" desc="按信用等级 A-E 的通过率">
          <BarChart labels={['A', 'B', 'C', 'D', 'E']} series={[{ name: '通过率', color: '#16a34a', data: [96, 88, 72, 45, 18] }]} unit="%" height={200} />
        </Panel>
        <Panel title="Vintage 逾期曲线" desc="放款后各月 M3+ 逾期率">
          <LineChart labels={['M1', 'M2', 'M3', 'M4', 'M5', 'M6']}
            series={[{ name: '2026Q1 放款', color: '#3366ff', data: [0.4, 0.9, 1.6, 2.1, 2.4, 2.6] }, { name: '2025Q4 放款', color: '#888780', data: [0.6, 1.2, 2.0, 2.6, 2.9, 3.1] }]} unit="%" height={200} />
        </Panel>
      </div>
    </div>
  )
}

/* ============ 客户分层 ============ */
function TierPage({ d }: { d: ScoringData }) {
  const tiers = d.tiers
  const total = tiers.reduce((a, t) => a + t.count, 0)
  const cols: Column[] = [
    { key: 'name', label: '客群', width: '140px' },
    { key: 'count', label: '客户数', type: 'text', width: '120px' },
    { key: 'pct', label: '占比', type: 'text', width: '100px' },
    { key: 'action', label: '经营动作', width: '200px' },
  ]
  const rows: Row[] = tiers.map((t) => ({ id: t.name, name: t.name, count: t.count.toLocaleString(), pct: `${t.pct}%`, action: t.action }))
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="总客户数" value={total.toLocaleString()} accent="brand" hint={<Cal label="实时统计" />} />
        <StatCard label="高价值客户" value={tiers[0].count.toLocaleString()} delta={`${tiers[0].pct}%`} deltaType="up" accent="violet" hint={<Sam label="样例" />} />
        <StatCard label="沉睡客户" value={tiers[2].count.toLocaleString()} delta={`${tiers[2].pct}%`} deltaType="flat" accent="amber" hint={<Sam label="样例" />} />
        <StatCard label="高风险客户" value={tiers[3].count.toLocaleString()} delta={`${tiers[3].pct}%`} deltaType="down" accent="rose" hint={<Sam label="样例" />} />
      </div>
      <Panel title="客群分层" desc="智融分经营视角客群分组">
        <DataTable columns={cols} rows={rows} empty="暂无分层" pager defaultPageSize={10} />
      </Panel>
    </div>
  )
}

/* ============ 场景效果监控 ============ */
function SceneEffectPage({ d }: { d: ScoringData }) {
  const cols: Column[] = [
    { key: 'scene', label: '场景', width: '150px' },
    { key: 'conv', label: '转化率', type: 'text', width: '100px' },
    { key: 'hit', label: '命中率', type: 'text', width: '100px' },
    { key: 'usage', label: '调用占比', type: 'text', width: '100px' },
    { key: 'trend', label: '趋势', type: 'badge', badgeKind: 'green', width: '100px' },
  ]
  const rows: Row[] = d.sceneEffects.map((s, i) => ({
    id: String(i), scene: s.scene, conv: `${s.conv}%`, hit: `${s.hit}%`, usage: `${s.usage}%`,
    trend: { v: s.trend, kind: s.trend.startsWith('↓') ? 'red' : 'green' },
  }))
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {d.sceneEffects.map((s, i) => (
          <Panel key={i} title={s.scene}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">转化率</span><span>{s.conv}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">命中率</span><span>{s.hit}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">调用占比</span><span>{s.usage}%</span></div>
              <div className="flex justify-between"><span className="text-slate-500">趋势</span><Badge kind={s.trend.startsWith('↓') ? 'red' : 'green'}>{s.trend}</Badge></div>
            </div>
          </Panel>
        ))}
      </div>
      <Panel title="场景效果监控" desc="智融分三场景转化/命中/用信">
        <DataTable columns={cols} rows={rows} empty="暂无数据" pager defaultPageSize={10} />
      </Panel>
    </div>
  )
}

/* ============ API 对接 ============ */
function ApiPage({ d }: { d: ScoringData }) {
  const cols: Column[] = [
    { key: 'ep', label: '接口', width: '220px' },
    { key: 'method', label: '方法', width: '90px' },
    { key: 'qps', label: '峰值 QPS', type: 'text', width: '110px' },
    { key: 'sla', label: 'SLA', width: '100px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
  ]
  const rows: Row[] = d.apis.map((a) => ({
    id: a.id, ep: a.ep, method: a.method, qps: a.qps.toLocaleString(), sla: a.sla,
    status: { v: a.status, kind: statusKind[a.status] ?? 'gray' },
  }))
  return (
    <div className="space-y-6">
      <Panel title="接口列表" desc="一次对接三产品（单接口按需返回分数组合）">
        <DataTable columns={cols} rows={rows} empty="暂无接口" pager defaultPageSize={10} />
      </Panel>
      <Panel title="请求示例" desc="返回三产品分数组合">
        <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-emerald-300">{`POST /v3/score
{ "id_no": "3201**********1234", "mobile": "138****5678", "products": ["zhicha","zhixin","zhirong"] }

→ {
  "zhicha": { "score": 78, "risk_level": "高", "suggest": "建议拒绝/转人工" },
  "zhixin": { "score": 712, "default_prob": 0.043, "grade": "A" },
  "zhirong": { "score": 655, "scenes": { "default": 655, "credit": 688, "interest": 702 } }
}`}</pre>
      </Panel>
    </div>
  )
}

/* ============ 批量评分 ============ */
function BatchPage({ d, prod }: { d: ScoringData; prod: ScoreProd }) {
  const cols: Column[] = [
    { key: 'id', label: '任务号', width: '130px' },
    { key: 'name', label: '文件名', width: '200px' },
    { key: 'cnt', label: '记录数', type: 'text', width: '110px' },
    { key: 'avg', label: '平均分', type: 'text', width: '90px' },
    { key: 'high', label: '高风险数', type: 'text', width: '110px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '100px' },
  ]
  const rows: Row[] = d.batch[prod].map((r) => ({
    id: r.id, name: r.name, cnt: r.cnt.toLocaleString(), avg: String(r.avg),
    high: r.high.toLocaleString(), status: { v: r.status, kind: statusKind[r.status] ?? 'gray' },
  }))
  return (
    <Panel title={`${SCORE_PROD_LABEL[prod]} · 批量任务`} desc="文件批量评分"
      actions={<Button size="sm">＋ 上传文件</Button>}>
      <DataTable columns={cols} rows={rows} empty="暂无任务" pager defaultPageSize={10} />
    </Panel>
  )
}

/* ============ 计费与账单 ============ */
function BillPage({ d, prod }: { d: ScoringData; prod: ScoreProd }) {
  const bill = d.bill[prod]
  const qrows = d.billQuery[prod]
  const hrows = d.billHit[prod]
  const all = [...qrows.map((r) => ({ ...r, kind: '查询' })), ...hrows.map((r) => ({ ...r, kind: '查得' })), ...bill.rows.map((r) => ({ ...r, kind: r.type }))]
  const cols: Column[] = [
    { key: 'id', label: '单号', width: '120px' },
    { key: 'date', label: '日期', width: '120px' },
    { key: 'kind', label: '类型', width: '90px' },
    { key: 'cnt', label: '数量', type: 'text', width: '90px' },
    { key: 'amt', label: '金额(元)', type: 'text', width: '110px' },
    { key: 'status', label: '状态', type: 'badge', badgeKind: 'gray', width: '90px' },
  ]
  const rows: Row[] = all.map((r, i) => ({
    id: String(i), date: r.date, kind: r.kind, cnt: r.cnt.toLocaleString(), amt: r.amt.toLocaleString(),
    status: { v: r.status, kind: statusKind[r.status] ?? 'gray' },
  }))
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="账户余额" value={`¥${bill.balance.toLocaleString()}`} accent="brand" hint={<Sam label="样例" />} />
        <StatCard label="本月消费" value={`¥${all.filter((r) => r.kind === '消费').reduce((a, r) => a + r.amt, 0).toLocaleString()}`} accent="rose" hint={<Cal label="实时计算" />} />
        <StatCard label="充值记录" value={bill.recharge.map((r) => `¥${r.toLocaleString()}`).join(' / ')} accent="emerald" hint="样例" />
      </div>
      <Panel title={`${SCORE_PROD_LABEL[prod]} · 账单流水`} desc="查询 / 查得 / 充值 / 消费 统一流水">
        <DataTable columns={cols} rows={rows} empty="暂无流水" pager defaultPageSize={10} />
      </Panel>
    </div>
  )
}
