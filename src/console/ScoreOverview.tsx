import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useScore, SCORE_PROD_LABEL, updateScore, type ScoreProd, type ScoreRecord } from './scoreData'
import { PageShell } from './PageShell'
import { Panel, StatCard, Button, Badge, Modal } from '../components/ui'
import { Sam, Cal } from './SourceTag'
import { LineChart } from '../components/charts'

const PSI_KIND: Record<'稳定' | '临界' | '偏移', 'green' | 'amber' | 'red'> = {
  稳定: 'green',
  临界: 'amber',
  偏移: 'red',
}

/* ---------- 风险率半圆仪表盘（内联 SVG，无外部依赖） ---------- */
function RiskGauge({ rate }: { rate: number }) {
  const f = Math.min(1, Math.max(0, rate / 20)) // 0-20% 映射到 0-1
  const color = rate > 8 ? '#ef4444' : '#22c55e'
  const r = 80
  const cx = 100
  const cy = 100
  const theta = Math.PI * (1 - f)
  const ex = cx + r * Math.cos(theta)
  const ey = cy - r * Math.sin(theta)
  const valueArc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${ex} ${ey}`
  return (
    <div className="flex flex-col items-center">
      <svg width="200" height="112" viewBox="0 0 200 112">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="#e2e8f0" strokeWidth="12" strokeLinecap="round" />
        <path d={valueArc} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" />
        <line x1={cx} y1={cy} x2={ex} y2={ey} stroke={color} strokeWidth="3" />
        <circle cx={cx} cy={cy} r="5" fill={color} />
        <text x={cx} y={cy - 22} textAnchor="middle" className="fill-ink-900" style={{ fontSize: 26, fontWeight: 700 }}>
          {rate.toFixed(1)}%
        </text>
      </svg>
      <p className="mt-1 text-xs text-slate-400">当前风险率（阈值 8%，超过转红）</p>
    </div>
  )
}

export default function ScoreOverviewPage() {
  const data = useScore()
  const nav = useNavigate()
  const [search, setSearch] = useState('')
  const [importOpen, setImportOpen] = useState(false)
  const [csv, setCsv] = useState('')

  const onSearch = () => {
    const v = search.trim()
    if (v) nav('/console/cr/mid-cust-score?cust=' + encodeURIComponent(v) + '&prod=zhixin')
  }
  const openImport = () => setImportOpen(true)
  const confirmImport = () => {
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ')
    const recs: ScoreRecord[] = [
      { id: `R-IMP-${Date.now()}`, time: now, custId: 'CUST-IMPORT', custName: '导入客户', model: 'zhixin', score: 650, level: 'B', source: '批量', status: 'success' },
      { id: `R-IMP-${Date.now() + 1}`, time: now, custId: 'CUST-IMPORT', custName: '导入客户', model: 'zhirong', score: 720, level: 'A', source: '批量', status: 'success' },
    ]
    updateScore((d) => ({ ...d, records: [...recs, ...d.records] }))
    setImportOpen(false)
    setCsv('')
  }

  const actions = (
    <div className="flex items-center gap-2">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onSearch()}
        placeholder="搜索客户号/姓名查分数"
        className="h-9 w-56 rounded-lg border border-slate-200 bg-white px-3 text-sm text-ink-900 outline-none focus:border-brand-400"
      />
      <Button size="sm" variant="secondary" onClick={onSearch}>查询</Button>
      <Button size="sm" variant="primary" onClick={openImport}>导入批量评分</Button>
    </div>
  )

  return (
    <>
      <PageShell title="评分总览" crumb="评分产品 / 工作台" actions={actions} />
      <div className="space-y-4">
        {/* 模型健康度 —— 系统能力指标（无客户上下文），替代原"三模型得分总览" */}
        <Panel
          title="模型健康度"
          desc="各评分产品的覆盖率、准确率、及时率、PSI 与本月调用（系统能力概览）"
          actions={<Sam value="scoreData.json" />}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {data.models.map((m) => {
              const o = data.ops.find((x) => x.prod === m.prod)!
              return (
                <div key={m.prod} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-ink-900">{SCORE_PROD_LABEL[m.prod]}</span>
                    <Badge kind={m.enabled ? 'green' : 'gray'}>{m.enabled ? '已启用' : '未启用'}</Badge>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">版本 {m.version} · 更新于 {m.updatedAt}</div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-slate-500">覆盖率</div>
                      <div className="text-xl font-bold tabular-nums">{o.coverage}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">预警准确率</div>
                      <div className="text-xl font-bold tabular-nums">{o.accuracy}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">处置及时率</div>
                      <div className="text-xl font-bold tabular-nums">{o.timely}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-500">本月调用</div>
                      <div className="text-xl font-bold tabular-nums">{o.calls.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-xs text-slate-500">
                      PSI {o.psi} <Badge kind={PSI_KIND[o.psiStatus]}>{o.psiStatus}</Badge>
                    </span>
                    <Button size="sm" variant="ghost" onClick={() => nav('/console/sc/model-effect')}>查看效果</Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Panel>

        {/* 调用量趋势 + 风险率 + 本月次数 */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Panel title="调用量趋势" className="lg:col-span-2" actions={<Sam value="scoreData.json" />}>
            <LineChart
              labels={data.callTrend.map((t) => t.month)}
              series={[
                { name: '智察分', color: '#ef4444', data: data.callTrend.map((t) => t.zhicha) },
                { name: '智信分', color: '#22c55e', data: data.callTrend.map((t) => t.zhixin) },
                { name: '智融分', color: '#8b5cf6', data: data.callTrend.map((t) => t.zhirong) },
              ]}
              height={260}
            />
          </Panel>
          <Panel title="风险率" actions={<Cal />}>
            <RiskGauge rate={data.riskRate} />
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="本月评分次数"
            value={data.monthlyCount.toLocaleString()}
            accent="brand"
            hint={<Cal />}
          />
          <StatCard label="在跑模型数" value={String(data.models.filter((m) => m.enabled).length)} accent="violet" />
          <StatCard label="评分记录总数" value={data.records.length.toLocaleString()} accent="emerald" />
        </div>
      </div>

      <Modal open={importOpen} onClose={() => setImportOpen(false)} title="批量评分导入">
        <p className="mb-3 text-xs text-slate-500">支持粘贴 CSV（客户号,模型,分数），确认后追加为评分记录。</p>
        <textarea
          value={csv}
          onChange={(e) => setCsv(e.target.value)}
          placeholder="粘贴 CSV（客户号,模型,分数）"
          className="h-40 w-full resize-none rounded-lg border border-slate-200 p-3 text-sm text-ink-900 outline-none focus:border-brand-400"
        />
        <p className="mt-2 text-[11px] text-slate-400">
          <Sam value="scoreData.json" /> 将生成示例记录（智信分/智融分）
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button size="sm" variant="ghost" onClick={() => setImportOpen(false)}>取消</Button>
          <Button size="sm" variant="primary" onClick={confirmImport}>确认导入</Button>
        </div>
      </Modal>
    </>
  )
}
