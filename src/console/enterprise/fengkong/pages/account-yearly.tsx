// 风控中心 · 账户年检（fk-account-yearly）· 1:1 复刻「风控 - 账户年检」
// 子快照「风控 - 账户年检 - 详情」→ 抽屉；抽屉内股东 tabs：最新公示股东/工商登记股东/历史公示股东/历史工商股东
// 主要人员 tabs：工商公示/历史工商主要人员
// 数据：本地样例 fkYearly.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpStat, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'
import seedJson from '../../../fkYearly.json'

type ShareTab = keyof typeof seedJson.detail.shareholders
type StaffTab = keyof typeof seedJson.detail.staff

export default function FkAccountYearly({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkYearly.json', seedJson)
  const [group, setGroup] = useState('全部')
  const [resultTab, setResultTab] = useState('全部')
  const [detailOpen, setDetailOpen] = useState(false)
  const [curName, setCurName] = useState(params.get('name') || '')
  const [shareTab, setShareTab] = useState<ShareTab>('最新公示股东')
  const [staffTab, setStaffTab] = useState<StaffTab>('工商公示')

  const rows = data.rows.filter((r) => resultTab === '全部' || r.result === resultTab)

  const check = <span style={{ color: '#16A34A', fontWeight: 700 }}>✓</span>
  const cross = <span style={{ color: '#DC2626', fontWeight: 700 }}>✕</span>

  const columns: Column[] = [
    { key: 'name', label: '企业名称', width: '190px', fixed: 'left' },
    { key: 'result', label: '年检结果', align: 'center', render: (r: Row) => (String(r.result) === '通过' ? check : cross) },
    ...data.dims.map((d) => ({
      key: `dim_${d}`,
      label: d,
      align: 'center' as const,
      render: (r: Row) => {
        const dr = (r as unknown as (typeof seedJson.rows)[number]).dimResult as Record<string, string>
        return dr?.[d] === '通过' ? check : cross
      },
    })),
    {
      key: 'op',
      label: '操作',
      fixed: 'right',
      render: (r: Row) => (
        <a style={lk} onClick={() => { setCurName(String(r.name)); setDetailOpen(true) }}>详情</a>
      ),
    },
  ]

  const shareCols: Column[] = [
    { key: 'no', label: '序号', width: '60px', align: 'center' },
    { key: 'name', label: '股东名称', width: '210px' },
    { key: 'type', label: '股东类型', width: '170px' },
    { key: 'ratio', label: '持股比例' },
    { key: 'subscribe', label: '认缴出资' },
    { key: 'paid', label: '实缴出资' },
    { key: 'benefit', label: '最终受益股份' },
  ]

  const staffCols: Column[] = [
    { key: 'no', label: '序号', width: '60px', align: 'center' },
    { key: 'name', label: '姓名', width: '110px', render: (r: Row) => (
      <span>
        {String(r.name)}
        {String(r.tags) !== '-' && <span style={{ marginLeft: 6, fontSize: 11, color: '#64748B' }}>{String(r.tags)}</span>}
      </span>
    ) },
    { key: 'title', label: '职位', width: '130px' },
    { key: 'ratio', label: '持股比例' },
    { key: 'benefit', label: '最终受益股份' },
    { key: 'intro', label: '个人简介', render: (r: Row) => (String(r.intro) === '详情' ? <a style={lk}>详情</a> : <span style={{ color: '#CBD5E1' }}>-</span>) },
  ]

  return (
    <EpPage
      title="账户年检"
      subtitle="按年检周期核验企业工商与风险维度是否通过"
      crumb="风控中心 / 账户年检"
      actions={
        <span style={{ display: 'inline-flex', gap: 8 }}>
          <EpBtn variant="default">单个添加</EpBtn>
          <EpBtn variant="default">批量添加</EpBtn>
          <EpBtn variant="primary">上传企业</EpBtn>
        </span>
      }
    >
      {/* 查询条 */}
      <EpCard pad={false}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', flexWrap: 'wrap', fontSize: 13 }}>
          <span style={{ color: '#475569' }}>目标客群</span>
          {['全部', '未分组', '长时间未联系', '重点维护'].map((g) => (
            <span key={g} onClick={() => setGroup(g)} style={chip(group === g)}>{g}</span>
          ))}
          <select style={{ ...inp, width: 140 }}><option>请选择分组</option></select>
          <span style={{ color: '#475569', marginLeft: 8 }}>开始日期</span>
          <input placeholder="请选择开始日期" defaultValue="2026-08-01" style={{ ...inp, width: 140 }} />
          <EpBtn variant="primary" size="sm">开始查询</EpBtn>
        </div>
      </EpCard>

      {/* 统计条 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, margin: '14px 0' }}>
        <EpStat label="共计年检" value={`${data.total} 家`} sub={`年检周期：${data.cycle}`} accent="#2563EB" />
        <EpStat label="年检不通过" value={`${data.failed} 家`} accent="#DC2626" />
        <EpStat label="年检通过" value={`${data.total - data.failed} 家`} accent="#0F766E" />
      </div>

      <EpCard
        title="年检结果"
        desc={<Sam value="fkYearly.json" />}
        actions={
          <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
            {['全部', '通过', '不通过'].map((t) => (
              <span key={t} onClick={() => setResultTab(t)} style={chip(resultTab === t)}>{t}</span>
            ))}
            <EpBtn variant="default" size="sm">下载</EpBtn>
          </span>
        }
      >
        <DataTable columns={columns} rows={rows as unknown as Row[]} pager empty="暂无数据" />
      </EpCard>

      {/* 年检详情（快照：风控 - 账户年检 - 详情） */}
      <EpDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={curName ? `${curName}年检详情` : data.detail.title}
        width={800}
      >
        <div style={{ marginBottom: 12 }}>
          <EpTag color="#0F766E" bg="#CCFBF1">{data.detail.summary}</EpTag>
        </div>

        {/* 逐项结果 */}
        <EpCard title="年检项" pad={false}>
          {data.detail.items.map((it) => (
            <div key={it.k} style={{ display: 'flex', gap: 12, padding: '10px 16px', borderBottom: '1px solid #F1F5F9', fontSize: 13 }}>
              <span style={{ width: 96, color: '#94A3B8', flexShrink: 0 }}>{it.k}</span>
              <span style={{ width: 52, flexShrink: 0 }}>
                <EpTag color={it.r === '通过' ? '#15803D' : '#B91C1C'} bg={it.r === '通过' ? '#DCFCE7' : '#FEE2E2'}>{it.r}</EpTag>
              </span>
              <span style={{ color: '#0F172A', lineHeight: 1.8 }}>{it.v}</span>
            </div>
          ))}
        </EpCard>

        {/* 股东 */}
        <EpCard
          title="股东"
          desc={data.detail.shareDate}
          actions={<EpBtn variant="ghost" size="sm">下载数据</EpBtn>}
          className="mt-3.5"
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {data.detail.shareTabs.map((t) => (
              <span key={t.key} onClick={() => setShareTab(t.key as ShareTab)} style={tab(shareTab === t.key)}>
                {t.key} <span style={{ color: '#94A3B8' }}>{t.count}</span>
              </span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap', fontSize: 12 }}>
            <select style={{ ...inp, width: 120 }}><option>股东类型</option><option>法人</option><option>自然人</option></select>
            <select style={{ ...inp, width: 120 }}>
              <option>认缴出资</option>
              {['100万以内', '100-200万', '200-500万', '500-1000万', '1000-5000万', '5000万以上', '1亿以上'].map((o) => <option key={o}>{o}</option>)}
            </select>
            <select style={{ ...inp, width: 120 }}>
              <option>持股比例</option>
              {['66.66%以上', '50%以上', '33.33%以上', '25%以上', '5%以上', '不到5%'].map((o) => <option key={o}>{o}</option>)}
            </select>
          </div>
          <DataTable columns={shareCols} rows={data.detail.shareholders[shareTab] as unknown as Row[]} empty="暂无数据" />
        </EpCard>

        {/* 主要人员 */}
        <EpCard
          title="主要人员"
          actions={<EpBtn variant="ghost" size="sm">下载数据</EpBtn>}
          className="mt-3.5"
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
            {data.detail.staffTabs.map((t) => (
              <span key={t.key} onClick={() => setStaffTab(t.key as StaffTab)} style={tab(staffTab === t.key)}>
                {t.key} <span style={{ color: '#94A3B8' }}>{t.count}</span>
              </span>
            ))}
          </div>
          <DataTable columns={staffCols} rows={data.detail.staff[staffTab] as unknown as Row[]} empty="暂无数据" />
        </EpCard>

        {/* 经营异常 / 严重违法失信 / 行政处罚 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 14 }}>
          {['经营异常', '严重违法失信', '行政处罚'].map((k) => (
            <EpCard key={k} title={k}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                <EpTag color="#15803D" bg="#DCFCE7">通过</EpTag>
                <span style={{ color: '#94A3B8' }}>暂无数据</span>
              </div>
            </EpCard>
          ))}
        </div>
      </EpDrawer>
    </EpPage>
  )
}

const chip = (on: boolean): React.CSSProperties => ({
  cursor: 'pointer', padding: '3px 12px', borderRadius: 14, fontSize: 12,
  border: `1px solid ${on ? '#2563EB' : '#E2E8F0'}`,
  background: on ? '#EFF6FF' : '#fff',
  color: on ? '#2563EB' : '#64748B',
})

const tab = (on: boolean): React.CSSProperties => ({
  cursor: 'pointer', padding: '5px 12px', fontSize: 13,
  borderBottom: `2px solid ${on ? '#2563EB' : 'transparent'}`,
  color: on ? '#2563EB' : '#64748B',
  fontWeight: on ? 600 : 400,
})

const lk: React.CSSProperties = { color: '#2563EB', cursor: 'pointer' }
const inp: React.CSSProperties = { padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none' }
