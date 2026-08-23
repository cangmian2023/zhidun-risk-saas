// 企业档案 · 财产信息（arc-property）· 1:1 复刻「企业档案 - 财产信息 也是 风控子系统的 财产线索」
// 与风控子系统「财产线索」同源：线索信息 / 扩大主体 / 资产状况 三页签
// 数据：本地样例 arcProperty.json（橘 Sam）
import { useState, type ReactNode } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'

const seed = {
  title: '财产线索',
  company: '抖音有限公司',
  profile: {
    name: '抖音有限公司', status: '存续', revokeTime: '-', revokeReason: '-',
    formerName: '字节跳动有限公司(- 至 2022-05-07)', qixinScore: '650', taxNo: '91110105MA005AEF36',
    group: '抖音集团', scale: '大型企业', nature: '民营企业', micro: '',
  },
  tabs: [{ key: 'clue', label: '线索信息', count: 396 }, { key: 'expand', label: '扩大主体', count: 2 }, { key: 'asset', label: '资产状况', count: 1925 }],
  flowFilters: [] as string[],
  timeFilters: [] as string[],
  assetTypes: [] as string[],
  difficulty: [] as string[],
  clues: [] as any[],
  expand: [] as any[],
  assets: [] as any[],
}

const clueCols: Column[] = [
  { key: 'time', label: '发生时间', width: 110 },
  { key: 'event', label: '事件类型', width: 110, render: (r: Row) => <EpTag color="#7C3AED" bg="#F5F3FF">{String(r.event)}</EpTag> },
  { key: 'type', label: '资产类型', width: 100 },
  { key: 'diff', label: '执行难度', width: 90, render: (r: Row) => {
    const m: Record<string, string> = { 高: '#DC2626', 中: '#D97706', 低: '#0F766E' }
    return <span style={{ color: m[String(r.diff)] ?? '#475569', fontWeight: 600 }}>{String(r.diff)}</span>
  } },
  { key: 'content', label: '线索内容解析', render: (r: Row) => (
    <div>
      <div style={{ fontSize: 13, color: '#0F172A' }}>{String(r.content)}</div>
      <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>解析：{String(r.parse)}</div>
    </div>
  ) },
  { key: 'op', label: '操作', width: 80, render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('查看线索详情')}>详情</a> },
]
const expandCols: Column[] = [
  { key: 'id', label: '序号', width: 60, render: (r: Row) => r.id },
  { key: 'name', label: '企业名称' },
  { key: 'rel', label: '关联关系' },
  { key: 'note', label: '备注' },
]
const assetCols: Column[] = [
  { key: 'id', label: '序号', width: 60, render: (r: Row) => r.id },
  { key: 'park', label: '园区名称' },
  { key: 'level', label: '园区等级' },
  { key: 'basis', label: '认定依据' },
  { key: 'addr', label: '企业地址' },
  { key: 'op', label: '操作', width: 80, render: () => <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => alert('查看园区详情')}>查看</a> },
]

export default function ArcProperty({ params }: { params: URLSearchParams }) {
  const [data, save] = useSample('arcProperty.json', seed)
  const [tab, setTab] = useState<'clue' | 'expand' | 'asset'>('clue')
  const [flow, setFlow] = useState('不限')
  const [time, setTime] = useState('')
  const [diff, setDiff] = useState('')
  const [assets, setAssets] = useState<string[]>([])

  const tabs = data.tabs
  const toggleAsset = (a: string) => setAssets((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]))

  const clueRows = data.clues.filter((c) => flow === '不限' || c.flow === flow || (flow === '流向未知' && !c.flow) || true)
  const rowsMap = {
    clue: clueRows as unknown as Row[],
    expand: data.expand as unknown as Row[],
    asset: data.assets as unknown as Row[],
  }
  const colMap = { clue: clueCols, expand: expandCols, asset: assetCols }

  return (
    <EpPage
      title="财产线索"
      subtitle={`企业档案 · 财产信息（与风控子系统「财产线索」同源）`}
      crumb="企业档案 / 财产信息"
      actions={<EpBtn variant="default" onClick={() => alert('导出财产线索')}>导出</EpBtn>}
    >
      {/* 企业抬头 */}
      <EpCard>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{data.profile.name}</div>
          <EpTag color="#0F766E" bg="#ECFDF5">{data.profile.status}</EpTag>
          <EpBtn variant="ghost" size="sm" onClick={() => alert('复制企业名称')}>复制</EpBtn>
          <span style={{ fontSize: 12, color: '#64748B' }}>吊销时间：{data.profile.revokeTime} · 吊销原因：{data.profile.revokeReason}</span>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: '#334155', lineHeight: 1.9 }}>
          <span>简介：{data.profile.formerName}</span> · <span>曾用名</span> ·{' '}
          <span>企业健康度：<b>{data.profile.qixinScore}</b> 分</span> ·{' '}
          <span>税号：{data.profile.taxNo}</span> · <span>集团：{data.profile.group}</span> ·{' '}
          <span>{data.profile.scale}</span> · <span>{data.profile.nature}</span>
        </div>
      </EpCard>

      {/* Tab */}
      <div style={{ display: 'flex', gap: 8, margin: '16px 0' }}>
        {tabs.map((t) => (
          <div
            key={t.key}
            onClick={() => setTab(t.key as any)}
            style={{ cursor: 'pointer', padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, color: tab === t.key ? '#fff' : '#475569', background: tab === t.key ? '#2563EB' : '#F1F5F9' }}
          >
            {t.label}（{t.count}）
          </div>
        ))}
      </div>

      {/* 筛选区（仅线索信息） */}
      {tab === 'clue' && (
        <EpCard title="筛选" desc={<Sam value="arcProperty.json" />}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#475569' }}>资金流向：</span>
            {data.flowFilters.map((f) => (
              <Chip key={f} active={flow === f} onClick={() => setFlow(f)}>{f}</Chip>
            ))}
            <Chip key="more" active={false} onClick={() => alert('更多筛选')}>更多</Chip>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#475569' }}>发生时间：</span>
            {data.timeFilters.map((t) => (
              <Chip key={t} active={time === t} onClick={() => setTime(time === t ? '' : t)}>{t}</Chip>
            ))}
            <input placeholder="开始日期" style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 12, width: 120 }} />
            <span style={{ color: '#94A3B8' }}>-</span>
            <input placeholder="结束日期" style={{ padding: '6px 10px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 12, width: 120 }} />
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, color: '#475569' }}>资产类型：</span>
            {data.assetTypes.map((a) => (
              <Chip key={a} active={assets.includes(a)} onClick={() => toggleAsset(a)}>{a}</Chip>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#475569' }}>执行难度：</span>
            {data.difficulty.map((d) => (
              <Chip key={d} active={diff === d} onClick={() => setDiff(diff === d ? '' : d)}>{d}</Chip>
            ))}
            <EpBtn variant="primary" size="sm" style={{ marginLeft: 'auto' }} onClick={() => alert('开始查询')}>开始查询</EpBtn>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: '#94A3B8' }}>为保证线索时效性，仅展示近 3 年的线索信息</div>
        </EpCard>
      )}

      {/* 结果表 */}
      <div style={{ marginTop: 14 }}>
        <EpCard title={tabs.find((t) => t.key === tab)!.label} desc={<Sam value="arcProperty.json" />}>
          <DataTable columns={colMap[tab]} rows={rowsMap[tab]} pager exportable exportName={tabs.find((t) => t.key === tab)!.label} empty="暂无数据" />
        </EpCard>
      </div>
    </EpPage>
  )
}

function Chip({ children, active, onClick }: { children: ReactNode; active: boolean; onClick: () => void }) {
  return (
    <span
      onClick={onClick}
      style={{
        cursor: 'pointer', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
        color: active ? '#fff' : '#475569', background: active ? '#2563EB' : '#F1F5F9',
      }}
    >
      {children}
    </span>
  )
}
