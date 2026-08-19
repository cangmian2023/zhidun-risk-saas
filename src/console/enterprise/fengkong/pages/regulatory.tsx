// 风控中心 · 监管合规（fk-regulatory）· 1:1 复刻「监管合规」
// 数据：本地样例 fkRegulatory.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpTag, EpBtn, EpDrawer, DataTable, useSample, Sam } from '../../epCommon'
import type { Row } from '../../../../components/ui'

type Tag = { label: string; color: string; bg: string }
type RowItem = {
  id: number
  name: string
  tags: Tag[]
  date: string
  amount: string
  authority: string
  decision: string
  description: string
  detail: {
    companyName: string
    creditCode: string
    dataSource: string
    content: string
  }
}
type Data = {
  scope: string
  searchPlaceholder: string
  searchBtn: string
  violationTypes: string[]
  otherFilters: string[]
  totalText: string
  viewToggle: { card: string; table: string }
  exportBtn: string
  detailTitle: string
  rows: RowItem[]
  pagination: { total: number; pageSize: number; current: number }
}

const seed: Data = {
  scope: '全部范围',
  searchPlaceholder: '请输入主体名称、判决机构等关键词，非必填',
  searchBtn: '查询',
  violationTypes: ['不限', '商业贿赂', '市场垄断', '违规推广', '质量问题', '围标串标', '非法集资', '非法经营', '安全疏忽', '信息泄露', '不正当竞争'],
  otherFilters: ['涉案/处罚金额', '披露日期', '数据来源', '行业分类', '省份地区', '注册资本'],
  totalText: '找到 {total} 条结果',
  viewToggle: { card: '卡片', table: '表格' },
  exportBtn: '导出数据',
  rows: [
    {
      id: 1,
      name: '广西平果和泰科技有限公司',
      tags: [
        { label: '安全疏忽', color: '#B45309', bg: '#FEF3C7' },
        { label: '安全事故IPE', color: '#1D4ED8', bg: '#EFF6FF' },
      ],
      date: '2050-07-10',
      amount: '-',
      authority: '平果市人民政府',
      decision: '-',
      description: '生产安全事故，涉及1人，损失财产132.726400万元',
    },
    {
      id: 2,
      name: '广东湛江雷州牧原农牧有限公司',
      tags: [
        { label: '安全疏忽', color: '#B45309', bg: '#FEF3C7' },
        { label: '安全事故IPE', color: '#1D4ED8', bg: '#EFF6FF' },
      ],
      date: '2050-04-19',
      amount: '-',
      authority: '雷州市应急管理局',
      decision: '-',
      description: '生产安全事故，涉及1人，损失财产148.000000万元',
    },
    {
      id: 3,
      name: '揭阳市榕城区合发货物运输代理服务部',
      tags: [
        { label: '安全疏忽', color: '#B45309', bg: '#FEF3C7' },
        { label: '安全事故IPE', color: '#1D4ED8', bg: '#EFF6FF' },
      ],
      date: '2040-07-05',
      amount: '-',
      authority: '丰顺县人民政府',
      decision: '-',
      description: '生产安全事故，涉及1人，损失财产若干万元',
    },
    {
      id: 4,
      name: '广州美诚食品有限公司',
      tags: [
        { label: '信息泄露', color: '#B45309', bg: '#FEF3C7' },
        { label: '不正当竞争', color: '#1D4ED8', bg: '#EFF6FF' },
      ],
      date: '2026-08-10',
      amount: '50.00',
      authority: '广州市市场监督管理局',
      decision: '罚款并责令整改',
      description: '虚假宣传，误导消费者，涉及不正当竞争行为',
    },
    {
      id: 5,
      name: '上海某某数据科技有限公司',
      tags: [
        { label: '信息泄露', color: '#B45309', bg: '#FEF3C7' },
        { label: '违规推广', color: '#1D4ED8', bg: '#EFF6FF' },
      ],
      date: '2026-07-22',
      amount: '-',
      authority: '上海市网信办',
      decision: '-',
      description: '未履行个人信息保护义务，导致用户数据泄露',
    },
  ],
  pagination: { total: 20000, pageSize: 10, current: 1 },
}

export default function FkRegulatory({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('fkRegulatory.json', seed)
  const [kw, setKw] = useState('')
  const [activeType, setActiveType] = useState('不限')
  const [view, setView] = useState<'card' | 'table'>('card')
  const [selected, setSelected] = useState<number[]>([])
  const [detailRow, setDetailRow] = useState<RowItem | null>(null)

  const filtered = data.rows.filter(
    (r) =>
      !kw ||
      r.name.includes(kw) ||
      r.authority.includes(kw) ||
      r.description.includes(kw)
  )

  const toggleSelect = (id: number) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const columns = [
    {
      key: 'name',
      label: '主体名称',
      width: 260,
      render: (r: Row) => (
        <b
          onClick={() => setDetailRow(r as RowItem)}
          style={{ color: '#2563EB', cursor: 'pointer' }}
        >
          {String(r.name)}
        </b>
      ),
    },
    {
      key: 'tags',
      label: '违规类型',
      width: 180,
      render: (r: Row) => (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(r.tags as Tag[]).map((t) => (
            <EpTag key={t.label} color={t.color} bg={t.bg}>
              {t.label}
            </EpTag>
          ))}
        </div>
      ),
    },
    { key: 'date', label: '披露日期', width: 120 },
    { key: 'amount', label: '涉案/处罚金额(万)', width: 130 },
    { key: 'authority', label: '判决机构', width: 180 },
    { key: 'decision', label: '处罚/判决内容', width: 160 },
    { key: 'description', label: '违规行为描述', width: 320 },
  ]

  return (
    <EpPage title="监管合规" crumb="风控中心 / 监管合规">
      {/* 搜索栏 */}
      <div
        style={{
          display: 'flex',
          gap: 10,
          background: '#F8FAFC',
          padding: '12px 14px',
          borderRadius: 10,
          alignItems: 'center',
        }}
      >
        <ScopeBtn label={data.scope} />
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder={data.searchPlaceholder}
          style={{
            flex: 1,
            padding: '8px 12px',
            border: '1px solid #CBD5E1',
            borderRadius: 8,
            fontSize: 13,
            background: '#fff',
          }}
        />
        <EpBtn variant="primary" style={{ background: '#F5B400', borderColor: '#F5B400', color: '#3A2A00', fontWeight: 600 }}>
          {data.searchBtn}
        </EpBtn>
      </div>

      {/* 违规类型 */}
      <div style={{ display: 'flex', gap: 10, marginTop: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>违规类型</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {data.violationTypes.map((t) => {
            const active = activeType === t
            return (
              <button
                key={t}
                onClick={() => setActiveType(t)}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: 'none',
                  fontSize: 13,
                  cursor: 'pointer',
                  color: active ? '#2563EB' : '#64748B',
                  background: active ? '#EFF6FF' : 'transparent',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>

      {/* 其它筛选 */}
      <div style={{ display: 'flex', gap: 10, marginTop: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', whiteSpace: 'nowrap' }}>其它筛选</span>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {data.otherFilters.map((f) => (
            <FilterBtn key={f} label={f} />
          ))}
        </div>
      </div>

      {/* 结果工具栏 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 20,
          marginBottom: 12,
        }}
      >
        <div style={{ fontSize: 14, color: '#64748B' }}>
          {data.totalText.replace('{total}', data.pagination.total.toLocaleString())}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ViewToggle view={view} onChange={setView} labels={data.viewToggle} />
          <EpBtn variant="primary" style={{ background: '#F5B400', borderColor: '#F5B400', color: '#3A2A00', fontWeight: 600 }}>
            {data.exportBtn}
          </EpBtn>
        </div>
      </div>

      {/* 卡片视图 */}
      {view === 'card' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map((r) => (
            <EpCard key={r.id} pad={false}>
              <div style={{ display: 'flex', padding: '16px 18px', gap: 14 }}>
                <input
                  type="checkbox"
                  checked={selected.includes(r.id)}
                  onChange={() => toggleSelect(r.id)}
                  style={{ marginTop: 2, cursor: 'pointer' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span
                      onClick={() => setDetailRow(r)}
                      style={{ fontSize: 15, fontWeight: 700, color: '#2563EB', cursor: 'pointer' }}
                    >
                      {r.name}
                    </span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {r.tags.map((t) => (
                        <EpTag key={t.label} color={t.color} bg={t.bg}>
                          {t.label}
                        </EpTag>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 40, marginTop: 10, flexWrap: 'wrap', fontSize: 13, color: '#475569' }}>
                    <span>
                      <span style={{ color: '#94A3B8' }}>披露日期：</span>
                      {r.date}
                    </span>
                    <span>
                      <span style={{ color: '#94A3B8' }}>涉案/处罚金额(万)：</span>
                      {r.amount}
                    </span>
                    <span>
                      <span style={{ color: '#94A3B8' }}>判决机构：</span>
                      {r.authority}
                    </span>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: '#475569' }}>
                    <span style={{ color: '#94A3B8' }}>处罚/判决内容：</span>
                    {r.decision}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, color: '#475569' }}>
                    <span style={{ color: '#94A3B8' }}>违规行为描述：</span>
                    {r.description}
                  </div>
                </div>
              </div>
            </EpCard>
          ))}
        </div>
      )}

      {/* 表格视图 */}
      {view === 'table' && (
        <EpCard>
          <DataTable columns={columns} rows={filtered as unknown as Row[]} selectable pager pageSize={10} empty="暂无数据" />
        </EpCard>
      )}

      {/* 详情抽屉 */}
      <DetailDrawer
        title={data.detailTitle}
        row={detailRow}
        onClose={() => setDetailRow(null)}
      />

      <div style={{ marginTop: 12 }}>
        <Sam value="fkRegulatory.json" />
      </div>
    </EpPage>
  )
}

function DetailDrawer({
  title,
  row,
  onClose,
}: {
  title: string
  row: RowItem | null
  onClose: () => void
}) {
  if (!row) return null
  const items = [
    { label: '企业名称', value: row.detail.companyName, full: false },
    { label: '统一社会信用代码', value: row.detail.creditCode, full: false },
    { label: '披露日期', value: row.date, full: false },
    { label: '数据来源', value: row.detail.dataSource, full: false },
    { label: '判决机构', value: row.authority, full: false },
    { label: '涉案/处罚金额(万)', value: row.amount, full: false },
    { label: '处罚/判决内容', value: row.detail.content, full: true },
    { label: '违规行为描述', value: row.description, full: true },
  ]
  return (
    <EpDrawer open={!!row} onClose={onClose} title={title} width={680}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {items.map((it, idx) => (
          <div
            key={it.label}
            style={{
              display: 'flex',
              borderBottom: idx === items.length - 1 ? 'none' : '1px solid #E2E8F0',
              minHeight: 46,
            }}
          >
            <div
              style={{
                width: 150,
                flexShrink: 0,
                background: '#F8FAFC',
                padding: '12px 16px',
                fontSize: 14,
                color: '#475569',
                fontWeight: 500,
              }}
            >
              {it.label}
            </div>
            <div
              style={{
                flex: 1,
                padding: '12px 16px',
                fontSize: 14,
                color: '#0F172A',
                lineHeight: 1.6,
                wordBreak: 'break-all',
              }}
            >
              {it.value}
            </div>
          </div>
        ))}
      </div>
    </EpDrawer>
  )
}

function ScopeBtn({ label }: { label: string }) {
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 12px',
        border: '1px solid #CBD5E1',
        borderRadius: 8,
        background: '#fff',
        fontSize: 13,
        color: '#334155',
        cursor: 'pointer',
      }}
    >
      {label}
      <span style={{ fontSize: 10, color: '#94A3B8' }}>▼</span>
    </button>
  )
}

function FilterBtn({ label }: { label: string }) {
  return (
    <button
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '5px 10px',
        border: '1px solid #E2E8F0',
        borderRadius: 6,
        background: '#fff',
        fontSize: 13,
        color: '#475569',
        cursor: 'pointer',
      }}
    >
      {label}
      <span style={{ fontSize: 10, color: '#94A3B8' }}>▼</span>
    </button>
  )
}

function ViewToggle({
  view,
  onChange,
  labels,
}: {
  view: 'card' | 'table'
  onChange: (v: 'card' | 'table') => void
  labels: { card: string; table: string }
}) {
  return (
    <div
      style={{
        display: 'flex',
        border: '1px solid #CBD5E1',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <button
        onClick={() => onChange('card')}
        style={{
          padding: '6px 14px',
          border: 'none',
          fontSize: 13,
          cursor: 'pointer',
          color: view === 'card' ? '#2563EB' : '#64748B',
          background: view === 'card' ? '#EFF6FF' : '#fff',
          fontWeight: view === 'card' ? 600 : 400,
        }}
      >
        {labels.card}
      </button>
      <button
        onClick={() => onChange('table')}
        style={{
          padding: '6px 14px',
          border: 'none',
          borderLeft: '1px solid #CBD5E1',
          fontSize: 13,
          cursor: 'pointer',
          color: view === 'table' ? '#2563EB' : '#64748B',
          background: view === 'table' ? '#EFF6FF' : '#fff',
          fontWeight: view === 'table' ? 600 : 400,
        }}
      >
        {labels.table}
      </button>
    </div>
  )
}
