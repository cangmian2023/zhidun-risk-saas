// 风控中心 · 账户年检（fk-account-yearly）· 1:1 复刻「风控 - 账户年检」
import { useState } from 'react'
import { EpPage, EpBtn, DataTable, useSample, Sam } from '../../epCommon'
import type { Row, Column } from '../../../../components/ui'
import seedJson from '../../../fkYearly.json'

// 角标：通过(绿√) / 不通过(红✕)
function markStyle(ok: boolean): React.CSSProperties {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 16, height: 16, borderRadius: '50%', fontSize: 11, lineHeight: 1,
    color: '#fff', background: ok ? '#16A34A' : '#DC2626',
  }
}
const failMark = <span style={markStyle(false)}>✕</span>
const passMark = <span style={markStyle(true)}>✓</span>
const cellWrap: React.CSSProperties = { display: 'inline-block', maxWidth: 200, lineHeight: 1.6, wordBreak: 'break-all' }
const inpStyle: React.CSSProperties = { padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', minWidth: 130 }
const dropStyle: React.CSSProperties = { padding: '7px 12px', border: '1px solid #CBD5E1', borderRadius: 8, fontSize: 13, outline: 'none', background: '#fff', minWidth: 120 }

export default function FkAccountYearly({ params }: { params: URLSearchParams }) {
  const [data] = useSample('fkYearly.json', seedJson)
  const [filterTab, setFilterTab] = useState('全部')

  const rows = (data.rows as unknown as Row[]).filter(
    (r) => filterTab === '全部' || String((r as any).result) === filterTab,
  )

  const columns: Column[] = [
    { key: 'name', label: '企业名称', width: '250px', align: 'left' },
    {
      key: 'result',
      label: '年检结果',
      width: '90px',
      align: 'center',
      render: (r: Row) =>
        String((r as any).result) === '不通过' ? (
          <span style={{ color: '#DC2626', fontWeight: 600 }}>不通过</span>
        ) : (
          <span style={{ color: '#16A34A', fontWeight: 600 }}>通过</span>
        ),
    },
    {
      key: 'enterprise',
      label: '企业名称',
      width: '100px',
      align: 'center',
      render: (r: Row) => {
        const dr = (r as any).dimResult as Record<string, string>
        return dr?.['企业名称'] === '通过' ? passMark : failMark
      },
    },
    {
      key: 'status',
      label: '经营状态',
      width: '90px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).status)}</span>,
    },
    {
      key: 'term',
      label: '经营期限',
      width: '90px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).term)}</span>,
    },
    {
      key: 'capital',
      label: '注册资本',
      width: '90px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).capital)}</span>,
    },
    {
      key: 'scope',
      label: '经营范围',
      width: '90px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).scope)}</span>,
    },
    {
      key: 'address',
      label: '经营地址',
      width: '90px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).address)}</span>,
    },
    {
      key: 'phone',
      label: '联系电话',
      width: '90px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).phone)}</span>,
    },
    {
      key: 'legal',
      label: '法定代表人',
      width: '100px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).legal)}</span>,
    },
    {
      key: 'shareholder',
      label: '股东',
      width: '76px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).shareholder)}</span>,
    },
    {
      key: 'staff',
      label: '主要人员',
      width: '90px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).staff)}</span>,
    },
    {
      key: 'abnormal',
      label: '经营异常',
      width: '90px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).abnormal)}</span>,
    },
    {
      key: 'illegal',
      label: '严重违法失信',
      width: '110px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).illegal)}</span>,
    },
    {
      key: 'punish',
      label: '行政处罚',
      width: '90px',
      align: 'center',
      render: (r: Row) => <span style={cellWrap}>{String((r as any).punish)}</span>,
    },
    {
      key: 'op',
      label: '操作',
      width: '80px',
      align: 'center',
      render: (r: Row) => <a style={{ color: '#2563EB', cursor: 'pointer' }}>详情</a>,
    },
  ]

  const resultTab = (t: string) => (
    <span
      onClick={() => setFilterTab(t)}
      style={{
        cursor: 'pointer', padding: '6px 14px', borderRadius: 8, fontSize: 13,
        border: `1px solid ${filterTab === t ? '#2563EB' : '#E2E8F0'}`,
        color: filterTab === t ? '#2563EB' : '#475569',
        background: filterTab === t ? '#EFF6FF' : '#fff',
      }}
    >{t}</span>
  )

  return (
    <EpPage title="账户年检">
      <Sam />
      {/* 查询条 */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <span style={{ fontSize: 13, color: '#475569' }}>目标客群</span>
        <select style={dropStyle} defaultValue={data.group}>
          <option>{data.group}</option>
        </select>
        <EpBtn variant="ghost" onClick={() => {}}>+ 上传企业</EpBtn>
        <span style={{ fontSize: 13, color: '#475569' }}>开始日期</span>
        <input style={inpStyle} type="text" defaultValue={data.startDate} />
        <EpBtn variant="primary" onClick={() => {}}>开始查询</EpBtn>
      </div>

      {/* 统计行 */}
      <div style={{ fontSize: 13, color: '#475569', marginBottom: 12 }}>
        共计年检 <b style={{ color: '#0F172A' }}>{data.total}</b> 家，其中{' '}
        <b style={{ color: '#DC2626' }}>{data.failed}</b> 家年检不通过（年检周期：{data.cycle}）
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {resultTab('全部')}
          {resultTab('不通过')}
          {resultTab('通过')}
        </div>
        <EpBtn variant="ghost" onClick={() => {}}>下载</EpBtn>
      </div>

      <DataTable columns={columns} rows={rows} rowKey="id" />
    </EpPage>
  )
}
