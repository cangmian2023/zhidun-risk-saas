// 风控中心 · 定期体检（fk-health-check）· 1:1 复刻「风控 - 定期体检」
// 子快照「风控 - 定期体检 - 体检设置」→ 设置抽屉（严重/异常/一般/未启用 四组，可拖动排序）
// 数据：本地样例 fkHealth.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'
import seedJson from '../../../fkHealth.json'

const LEVEL: Record<string, { c: string; b: string }> = {
  严重: { c: '#B91C1C', b: '#FEE2E2' },
  异常: { c: '#C2410C', b: '#FFEDD5' },
  一般: { c: '#1D4ED8', b: '#EFF6FF' },
}

const RISK_TYPES = ['不限', '变更风险', '涉诉风险', '经营风险', '舆情风险']
const CHANGES = ['不限', '是', '否']
const LEVELS = ['不限', '严重', '异常', '一般']

export default function FkHealthCheck({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkHealth.json', seedJson)
  const [target, setTarget] = useState(params.get('name') || data.company.name)
  const [riskType, setRiskType] = useState('不限')
  const [changed, setChanged] = useState('不限')
  const [level, setLevel] = useState('不限')
  const [cfgOpen, setCfgOpen] = useState(false)

  const rows = data.rows.filter((r) => {
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
      actions={
        <span style={{ display: 'inline-flex', gap: 8 }}>
          <EpBtn variant="default" onClick={() => setCfgOpen(true)}>体检设置</EpBtn>
          <EpBtn variant="primary">开始体检</EpBtn>
        </span>
      }
    >
      {/* 查询条 */}
      <EpCard pad={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', flexWrap: 'wrap', fontSize: 13 }}>
          <span style={{ color: '#475569' }}>目标企业</span>
          <input value={target} onChange={(e) => setTarget(e.target.value)} placeholder="请输入目标企业" style={{ ...inp, width: 260 }} />
          <span style={{ color: '#475569' }}>体检周期</span>
          <input defaultValue={data.period.base} placeholder="开始日期" style={{ ...inp, width: 140 }} />
          <span style={{ color: '#94A3B8' }}>-</span>
          <input defaultValue={data.period.check} placeholder="结束日期" style={{ ...inp, width: 140 }} />
          <EpBtn variant="primary" size="sm">开始体检</EpBtn>
        </div>
      </EpCard>

      {/* 企业信息 */}
      <div style={{ marginTop: 14 }}>
        <EpCard title={data.company.name} desc={<Sam value="fkHealth.json" />}>
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
            {data.company.scope}
            <a style={{ ...lk, marginLeft: 6 }}>更多</a>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginTop: 12 }}>
            <EpStat label="企业健康度 · 信用等级" value={data.company.score} sub={data.company.scoreRank} accent="#0F766E" />
            <EpStat label="空壳指数" value={`${data.company.shell}（${data.company.shellLevel}）`} sub="空壳风险 / 空壳等级" />
            <EpStat label="合同违约指数" value={data.company.default} sub={`合同诉讼：${data.company.defaultAmount}`} />
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
              <EpBtn variant="default" size="sm" onClick={() => setCfgOpen(true)}>体检设置</EpBtn>
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
          desc={<Sam value="fkHealth.json" />}
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

      {/* 体检设置（快照：风控 - 定期体检 - 体检设置） */}
      <EpDrawer open={cfgOpen} onClose={() => setCfgOpen(false)} title="体检设置" width={560}>
        {(['严重事件', '异常事件', '一般事件', '未启用'] as const).map((g) => (
          <div key={g} style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>
              {g} <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 400 }}>（拖动可以排序）</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(data.settings[g] as string[]).length === 0 ? (
                <span style={{ fontSize: 12, color: '#CBD5E1' }}>暂无</span>
              ) : (
                (data.settings[g] as string[]).map((it) => (
                  <span key={it} style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#F8FAFC', fontSize: 12, color: '#334155', cursor: 'move' }}>
                    ⠿ {it}
                  </span>
                ))
              )}
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
