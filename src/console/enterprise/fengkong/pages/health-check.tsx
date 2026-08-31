// 风控中心 · 定期体检（fk-health-check）· 1:1 复刻「风控 - 定期体检」
// 体检事项弹窗：严重 / 异常 / 一般 三组，支持多选（快照「风控 - 定期体检 - 体检事项弹窗」）
// 数据：本地样例 fkHealth.json（橘 Sam）
import { useState } from 'react';
import { EpPage, EpCard, EpStat, EpTag, EpBtn, EpDrawer, DataTable, useSample } from '../../epCommon';
import type { Row, Column } from '../../../../components/ui';
import seedJson from '../../../fkHealth.json'

const LEVEL: Record<string, { c: string; b: string }> = {
  严重: { c: '#B91C1C', b: '#FEE2E2' },
  异常: { c: '#C2410C', b: '#FFEDD5' },
  一般: { c: '#1D4ED8', b: '#EFF6FF' },
}

const RISK_TYPES = ['不限', '变更风险', '涉诉风险', '经营风险', '舆情风险']
const CHANGES = ['不限', '是', '否']
const LEVELS = ['不限', '严重', '异常', '一般']

const SETTING_GROUPS = ['严重事件', '异常事件', '一般事件'] as const

export default function FkHealthCheck({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkHealth.json', seedJson)
  const [target, setTarget] = useState(params.get('name') || data.company.name)
  const [riskType, setRiskType] = useState('不限')
  const [changed, setChanged] = useState('不限')
  const [level, setLevel] = useState('不限')
  const [started, setStarted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cfgOpen, setCfgOpen] = useState(false)
  const [scopeOpen, setScopeOpen] = useState(false)
  // 已选体检事项（默认全选）
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(Object.values(data.settings).flatMap((arr: string[]) => arr)),
  )

  const toggle = (it: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(it)) next.delete(it)
      else next.add(it)
      return next
    })
  }

  const onStart = () => {
    setLoading(true)
    // 模拟加载查询
    window.setTimeout(() => {
      setStarted(true)
      setLoading(false)
    }, 600)
  }

  const rows = data.rows
    .filter((r) => selected.has(r.dim))
    .filter((r) => {
      if (riskType !== '不限' && r.riskType !== riskType) return false
      if (changed !== '不限' && r.changed !== changed) return false
      if (level !== '不限' && r.level !== level) return false
      return true
    })

  const columns: Column[] = [
    { key: 'no', label: '序号', width: '60px', align: 'center' },
    { key: 'riskType', label: '风险类型', width: '100px' },
    { key: 'dim', label: '体检维度', width: '250px' },
    { key: 'base', label: `对比日(${data.period.base})`, width: '190px' },
    { key: 'check', label: `体检日(${data.period.check})`, width: '190px' },
    { key: 'changed', label: '是否变化', align: 'center', render: (r: Row) => (
      String(r.changed) === '是' ? <EpTag color="#B91C1C" bg="#FEE2E2">是</EpTag> : <span style={{ color: '#94A3B8' }}>否</span>
    ) },
    { key: 'result', label: '体检结果', width: '120px' },
    { key: 'level', label: '事件等级', align: 'center', render: (r: Row) => {
      const l = String(r.level)
      return l === '-' ? <span style={{ color: '#CBD5E1' }}>-</span> : <EpTag color={LEVEL[l]?.c} bg={LEVEL[l]?.b}>{l}</EpTag>
    } },
  ]

  return (
    <EpPage
      title="定期体检"
      subtitle="按对比日与体检日比对企业各风险维度变化"
      crumb="风控中心 / 定期体检"
    >
      {/* 查询条：初始化只显示此控件 */}
      <EpCard pad={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', flexWrap: 'wrap', fontSize: 13 }}>
          <span style={{ color: '#475569' }}>目标企业</span>
          <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="请输入目标企业" style={{ ...inp, width: 260 }} />
          <span style={{ color: '#475569' }}>体检周期</span>
          <input defaultValue={data.period.base} placeholder="开始日期" style={{ ...inp, width: 140 }} />
          <span style={{ color: '#94A3B8' }}>-</span>
          <input defaultValue={data.period.check} placeholder="结束日期" style={{ ...inp, width: 140 }} />
          <EpBtn variant="default" size="sm" onClick={() => setCfgOpen(true)}>体检事项</EpBtn>
          <EpBtn variant="primary" size="sm" onClick={onStart} disabled={loading}>
            {loading ? '查询中…' : '开始体检'}
          </EpBtn>
        </div>
      </EpCard>

      {/* 加载 / 报告内容 */}
      {!started ? (
        <EpCard style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '28px 8px' }}>
            <span style={{ fontSize: 28, lineHeight: 1 }}>🩺</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>尚未生成体检报告</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
                请在上方输入目标企业并点击「开始体检」，系统将比对企业各风险维度的变化并生成报告。
              </div>
            </div>
            <EpBtn variant="primary" size="sm" onClick={onStart} disabled={loading} style={{ flexShrink: 0 }}>
              {loading ? '查询中…' : '开始体检'}
            </EpBtn>
          </div>
        </EpCard>
      ) : (
        <>
          {/* 企业信息 */}
          <div style={{ marginTop: 14 }}>
            <EpCard title={data.company.name} >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px 20px', fontSize: 13 }}>
                {[
                  ['法定代表人:', data.company.legal],
                  ['成立日期:', data.company.found],
                  ['注册资本:', data.company.capital],
                  ['企业类型:', data.company.type],
                  ['所处行业:', data.company.industry],
                  ['地址:', data.company.address],
                ].map(([k, v]) => (
                  <div key={k}>
                    <span style={{ color: '#94A3B8', marginRight: 6 }}>{k}</span>
                    <span style={{ color: '#0F172A' }}>{v}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, fontSize: 12, color: '#64748B', lineHeight: 1.8 }}>
                <span style={{ color: '#94A3B8' }}>经营范围：</span>
                {scopeOpen ? data.company.scope : (data.company.scope.length > 120 ? data.company.scope.slice(0, 120) + '...' : data.company.scope)}
                {data.company.scope.length > 120 && (
                  <a style={{ ...lk, marginLeft: 6 }} onClick={() => setScopeOpen(!scopeOpen)}>{scopeOpen ? '收起' : '更多'}</a>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12 }}>
                <HintStat
                  label="企业健康度 · 信用等级"
                  value={data.company.score}
                  sub={data.company.scoreRank}
                  accent="#0F766E"
                  hint="综合工商、司法、经营等维度计算的企业整体健康评分，分数越高信用风险越低，并对应信用等级。"
                />
                <HintStat
                  label="空壳指数"
                  value={`${data.company.shell}（${data.company.shellLevel}）`}
                  sub="空壳风险 / 空壳等级"
                  hint="基于社保人数、注册地址、经营活动等信号评估企业是否为“空壳公司”的风险指数，指数越高空壳嫌疑越大。"
                />
                <HintStat
                  label="合同违约指数"
                  value={data.company.default}
                  sub={`合同诉讼：${data.company.defaultAmount}`}
                  hint="根据企业涉诉、被执行及历史违约记录综合测算的合同违约风险指数，用于预判合作与授信风险。"
                />
              </div>
            </EpCard>
          </div>

          {/* 体检结果摘要 */}
          <div style={{ marginTop: 14 }}>
            <EpCard
              title="体检结果"
              desc={`体检周期 ${data.period.cycle}`}
              actions={
                <span style={{ display: 'inline-flex', gap: 8 }}>
                  <EpBtn variant="default" size="sm">导出报告</EpBtn>
                </span>
              }
            >
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                <SumBox title="严重事项" color="#B91C1C" bg="#FEF2F2" count={data.summary.serious.count} items={data.summary.serious.items} />
                <SumBox title="异常事项" color="#C2410C" bg="#FFF7ED" count={data.summary.abnormal.count} items={data.summary.abnormal.items} />
                <SumBox title="一般事项" color="#1D4ED8" bg="#EFF6FF" count={data.summary.normal.count} items={data.summary.normal.items} />
              </div>
            </EpCard>
          </div>

          {/* 体检事项筛选 + 明细表 */}
          <div style={{ marginTop: 14 }}>
            <EpCard
              title="体检事项"
              actions={<EpBtn variant="default" size="sm">下载列表</EpBtn>}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13, marginBottom: 12 }}>
                <FRow label="风险类型" opts={RISK_TYPES} value={riskType} onChange={setRiskType} />
                <FRow label="风险变化" opts={CHANGES} value={changed} onChange={setChanged} />
                <FRow label="事件等级" opts={LEVELS} value={level} onChange={setLevel} />
              </div>
              <DataTable columns={columns} rows={rows as unknown as Row[]} pager defaultPageSize={20} exportable exportName="定期体检" empty="暂无数据" />
            </EpCard>
          </div>
        </>
      )}

      {/* 体检事项弹窗：分组多选 */}
      <EpDrawer open={cfgOpen} onClose={() => setCfgOpen(false)} title="体检事项" width={560}>
        <div style={{ marginBottom: 14, fontSize: 12, color: '#64748B' }}>
          勾选需要参与体检的事项（多选），确定后报告仅展示所选事项。
        </div>
        {SETTING_GROUPS.map((g) => (
          <div key={g} style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
              {g} <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>（共 {(data.settings[g] as string[]).length} 项）</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(data.settings[g] as string[]).map((it) => {
                const on = selected.has(it)
                return (
                  <label
                    key={it}
                    onClick={() => toggle(it)}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                      padding: '5px 10px', borderRadius: 8, fontSize: 12,
                      border: `1px solid ${on ? '#2563EB' : '#E2E8F0'}`,
                      background: on ? '#EFF6FF' : '#fff', color: on ? '#2563EB' : '#334155',
                    }}
                  >
                    <input type="checkbox" readOnly checked={on} style={{ margin: 0 }} />
                    {it}
                  </label>
                )
              })}
            </div>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <EpBtn variant="default" onClick={() => setCfgOpen(false)}>取 消</EpBtn>
          <EpBtn variant="primary" onClick={() => setCfgOpen(false)}>确 定</EpBtn>
        </div>
      </EpDrawer>
    </EpPage>
  )
}

function HintStat({ label, value, sub, accent, hint }: { label: string; value: React.ReactNode; sub?: React.ReactNode; accent?: string; hint: string }) {
  return (
    <div style={{ borderRadius: 12, border: '1px solid #E2E8F0', padding: '14px 16px', background: '#fff' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 13, color: '#475569' }}>{label}</span>
        <span
          title={hint}
          style={{
            width: 15, height: 15, borderRadius: '50%', border: '1px solid #CBD5E1', color: '#94A3B8',
            fontSize: 10, lineHeight: '13px', textAlign: 'center', cursor: 'help', flexShrink: 0,
          }}
        >?</span>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || '#0F172A', marginTop: 6 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{sub}</div>}
    </div>
  )
}

function SumBox({ title, color, bg, count, items }: { title: string; color: string; bg: string; count: number; items: string[] }) {
  return (
    <div style={{ border: `1px solid ${color}22`, background: bg, borderRadius: 12, padding: '12px 14px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ fontSize: 22, fontWeight: 700, color }}>{count}</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{title}</span>
      </div>
      <ul style={{ margin: '8px 0 0', paddingLeft: 16, fontSize: 12, color: '#475569', lineHeight: 1.9 }}>
        {items.map((i) => <li key={i}>{i}</li>)}
      </ul>
    </div>
  )
}

function FRow({ label, opts, value, onChange }: { label: string; opts: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ color: '#475569', width: 68 }}>{label}</span>
      {opts.map((o) => (
        <span
          key={o}
          onClick={() => onChange(o)}
          style={{
            cursor: 'pointer', padding: '3px 12px', borderRadius: 14, fontSize: 12,
            border: `1px solid ${value === o ? '#2563EB' : '#E2E8F0'}`,
            background: value === o ? '#EFF6FF' : '#fff',
            color: value === o ? '#2563EB' : '#64748B',
          }}
        >
          {o}
        </span>
      ))}
    </div>
  )
}

const lk: React.CSSProperties = { color: '#2563EB', cursor: 'pointer' }
const inp: React.CSSProperties = { padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none' }
