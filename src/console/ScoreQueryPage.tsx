import { useState } from 'react'
import { PageHeader, Panel, ProgressBar, Badge } from '../components/ui'
import ScoreGauge from '../components/ScoreGauge'
import { maskId, maskPhone } from './data'

type Prod = 'zhicha' | 'zhixin' | 'zhirong'

interface Factor {
  name: string
  detail: string
  contribution: number
  level: '高' | '中' | '低'
}
interface Meta {
  name: string
  range: [number, number]
  color: string
  hint: string
  unit: string
  score: number
  factors: Factor[]
  suggestion: { v: string; kind: string }
}

const META: Record<Prod, Meta> = {
  zhicha: {
    name: '智察分',
    range: [0, 100],
    color: '#ef4444',
    hint: '越高欺诈风险越高',
    unit: '欺诈分',
    score: 78,
    factors: [
      { name: '近30天申贷平台数', detail: '7 家（行业 P95=5）', contribution: 28, level: '高' },
      { name: '设备环境风险', detail: '模拟器特征命中', contribution: 22, level: '高' },
      { name: '命中黑灰名单', detail: '命中外部灰名单', contribution: 20, level: '高' },
      { name: '同设备关联账号', detail: '3 个关联账号', contribution: 18, level: '中' },
      { name: '负债收入比', detail: '82%（阈值 70%）', contribution: 12, level: '中' },
    ],
    suggestion: { v: '建议拒绝 / 转人工复核', kind: 'red' },
  },
  zhixin: {
    name: '智信分',
    range: [300, 900],
    color: '#22c55e',
    hint: '越高违约概率越低',
    unit: '信用/违约分',
    score: 712,
    factors: [
      { name: '历史逾期记录', detail: '近2年 M3+ 1 次', contribution: 26, level: '中' },
      { name: '负债收入比', detail: '58%（阈值 70%）', contribution: 22, level: '中' },
      { name: '征信查询频次', detail: '近6月 8 次', contribution: 18, level: '高' },
      { name: '收入稳定性', detail: '连续 14 月稳定', contribution: 20, level: '低' },
      { name: '授信使用率', detail: '43%', contribution: 14, level: '低' },
    ],
    suggestion: { v: '建议准入（标准额度）', kind: 'green' },
  },
  zhirong: {
    name: '智融分',
    range: [300, 900],
    color: '#8b5cf6',
    hint: '综合评分，全面刻画风险与价值',
    unit: '综合分',
    score: 655,
    factors: [
      { name: '违约维度（智信分）', detail: '信用分 712', contribution: 34, level: '低' },
      { name: '借贷兴趣（活跃度）', detail: '近30天活跃 18 天', contribution: 24, level: '中' },
      { name: '转化意愿', detail: '活动响应 2 次', contribution: 18, level: '中' },
      { name: '资产状况', detail: '房产+理财持仓', contribution: 24, level: '低' },
    ],
    suggestion: { v: '建议准入并提额（高价值）', kind: 'violet' },
  },
}

const levelColor: Record<string, string> = {
  高: 'bg-rose-500',
  中: 'bg-amber-500',
  低: 'bg-emerald-500',
}
const levelKind: Record<string, 'red' | 'amber' | 'green'> = { 高: 'red', 中: 'amber', 低: 'green' }

export default function ScoreQueryPage({ product }: { product: Prod }) {
  const m = META[product]
  const [id, setId] = useState('3201**********1234')
  const [phone, setPhone] = useState('138****5678')
  const [queried, setQueried] = useState(false)

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${m.name} · 评分查询`}
        crumb="评分产品"
        subtitle="输入个人标识查询风险评分，输出分数、风险因子明细与决策建议（样例数据）。"
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* 查询面板 */}
        <Panel title="查询条件" desc="支持身份证号 / 手机号">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-sm text-slate-500">身份证号</span>
              <input
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-500">手机号</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100"
              />
            </label>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button className="btn-primary !py-2.5" onClick={() => setQueried(true)}>
              查询评分
            </button>
            <span className="text-xs text-slate-400">
              适用客群：除小额短期现金贷外的金融全行业，尤其消费金融。
            </span>
          </div>

          {queried && (
            <div className="mt-5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="text-slate-500">查询对象</p>
              <p className="mt-1 font-mono text-ink-900">
                {maskId(id)} · {maskPhone(phone)}
              </p>
              <p className="mt-3 text-slate-500">决策建议</p>
              <p className="mt-1">
                <Badge kind={m.suggestion.kind as 'red'}>{m.suggestion.v}</Badge>
              </p>
            </div>
          )}
        </Panel>

        {/* 评分仪表 */}
        <Panel title="风险评估结果">
          <div className="flex flex-col items-center">
            <ScoreGauge
              value={m.score}
              min={m.range[0]}
              max={m.range[1]}
              label={`${m.name}（${m.unit}）`}
              color={m.color}
              hint={m.hint}
            />
            {queried && (
              <p className="mt-2 text-xs text-slate-400">查询时间：2026-07-18 15:20 · 模型版本 {product === 'zhicha' ? 'V3.2' : product === 'zhixin' ? 'V4.0' : 'V2.1'}</p>
            )}
          </div>
        </Panel>
      </div>

      {/* 因子明细 */}
      <Panel title="风险因子明细" desc="各因子对评分的贡献度（示例）">
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
                <ProgressBar value={f.contribution * 2} color={levelColor[f.level]} />
                <span className="w-40 text-xs text-slate-400">{f.detail}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}
