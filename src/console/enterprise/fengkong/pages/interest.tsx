// 风控中心 · 利益排查（fk-interest）· 1:1 复刻「风控 - 利益排查」
// 数据：本地样例 fkInterest.json（橘 Sam）
import { useState } from 'react'
import { EpPage, EpCard, EpBtn, DataTable, useSample, Sam } from '../../epCommon'
import type { Row } from '../../../../components/ui'

type Card = { name: string; desc: string; limit: string; btn: string }
type DetailItem = { company: string; content: string }
type TableRow = {
  id: number
  name: string
  no: string
  tag: string
  note: string
  conflictCount: number
  conflictName: string
  more: string[]
  reason: string
  detail: DetailItem[]
}
type Data = {
  emplCard: Card
  partnerCard: Card
  flow: string[]
  checkBtn: string
  banner: { time: string; count: number; verb: string; unit: string }
  table: {
    summary: string
    searchPlaceholder: string
    exportBtn: string
    rows: TableRow[]
  }
  detailLabels: {
    title: string
    seq: string
    company: string
    detail: string
    close: string
    download: string
  }
  intro: { title: string; items: { label: string; text: string }[] }
}

const seed: Data = {
  emplCard: { name: '员工名单', desc: '上传企业内部员工名单', limit: '单次最多支持 ≤2000人', btn: '添加员工名单' },
  partnerCard: { name: '合作方名单', desc: '上传合作方企业名单', limit: '单次最多支持 ≤2000家', btn: '添加企业名单' },
  flow: ['董监高法', '姓名重名', '电话关联企业', '持股/任职/控制'],
  checkBtn: '排查利益冲突',
  banner: { time: '2026-08-18 20:52:13', count: 1, verb: '排查出了', unit: '条利益关系' },
  table: {
    summary: '已查出 {emp} 名员工 {partner} 家合作伙伴有疑似利益关系',
    searchPlaceholder: '搜索关联企业或人员',
    exportBtn: '导出结果',
    rows: [
      {
        id: 1,
        name: '刘延峰',
        no: '00001',
        tag: '-',
        note: '-',
        conflictCount: 1,
        conflictName: '乐视网信息技术（北京）股份有限公司',
        more: ['乐视网信息技术（北京）股份有限公司'],
        reason: '持股任职、电话关联',
        detail: [
          {
            company: '乐视网信息技术（北京）股份有限公司',
            content: '任职：员工在2019-05-24开始任职“董事长,董事会秘书,董事,法定代表人,总经理,财务负责人”；员工电话15810302070关联该企业；',
          },
        ],
      },
    ],
  },
  detailLabels: {
    title: '员工姓名：{name}',
    seq: '序号',
    company: '受影响企业',
    detail: '疑似利益冲突详情',
    close: '关闭',
    download: '下载风险信息',
  },
  intro: {
    title: '排查员工与合作方潜在利益关联，辅助内控合规',
    items: [
      { label: '排查对象', text: '员工、供应商、经销商、客户等' },
      { label: '排查内容', text: '姓名重名、电话号码关联企业、持股任职' },
      { label: '结果导出', text: '排查结果支持导出，高效完成合规管理' },
    ],
  },
}

function PersonIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" strokeLinecap="round" />
    </svg>
  )
}
function BuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="1.8">
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" strokeLinecap="round" />
    </svg>
  )
}

function UploadCard({ card, icon, onAdd }: { card: Card; icon: React.ReactNode; onAdd: () => void }) {
  return (
    <div
      style={{
        flex: '1 1 320px',
        minWidth: 300,
        border: '1px solid #E2E8F0',
        borderRadius: 14,
        padding: 22,
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: '#EFF6FF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </span>
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>{card.name}</div>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{card.desc}</div>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#94A3B8' }}>{card.limit}</div>
      <EpBtn variant="default" style={{ alignSelf: 'flex-start' }} onClick={onAdd}>
        {card.btn}
      </EpBtn>
    </div>
  )
}

export default function FkInterest({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('fkInterest.json', seed)
  const [emplOpen, setEmplOpen] = useState(false)
  const [partnerOpen, setPartnerOpen] = useState(false)
  const [banner, setBanner] = useState(data.banner)
  const [showTable, setShowTable] = useState(false)
  const [kw, setKw] = useState('')
  const [detailRow, setDetailRow] = useState<TableRow | null>(null)

  const onCheck = () => {
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    setBanner({ ...data.banner, time, count: data.banner.count || 1 })
    setShowTable(true)
  }

  const filteredRows = data.table.rows.filter(
    (r) =>
      !kw ||
      r.name.includes(kw) ||
      r.conflictName.includes(kw) ||
      r.no.includes(kw) ||
      r.reason.includes(kw)
  )

  const empCount = data.table.rows.length
  const partnerCount = data.table.rows.reduce((s, r) => s + r.conflictCount, 0)

  const columns = [
    {
      key: 'idx',
      label: '序号',
      width: 56,
      render: (_r: Row, i: number) => i + 1,
    },
    {
      key: 'name',
      label: '员工姓名',
      width: 130,
      render: (r: Row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.8">
            <circle cx="12" cy="8" r="3" />
            <path d="M6 19c0-3 2.7-5 6-5s6 2 6 5" strokeLinecap="round" />
          </svg>
          {String(r.name)}
        </div>
      ),
    },
    { key: 'no', label: '员工编号', width: 100 },
    { key: 'tag', label: '员工标签', width: 120 },
    { key: 'note', label: '备注', width: 100 },
    {
      key: 'conflictCount',
      label: '疑似冲突企业数',
      width: 120,
      render: (r: Row) => <b style={{ color: '#DC2626' }}>{r.conflictCount}</b>,
    },
    {
      key: 'conflictName',
      label: '疑似冲突企业名称',
      width: 260,
      render: (r: Row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          {String(r.conflictName)}
          <a style={{ color: '#2563EB', fontSize: 12, cursor: 'pointer' }}>更多</a>
        </div>
      ),
    },
    { key: 'reason', label: '原因', width: 180 },
    {
      key: 'op',
      label: '操作',
      width: 70,
      render: (r: Row) => (
        <a style={{ color: '#2563EB', cursor: 'pointer' }} onClick={() => setDetailRow(r as unknown as TableRow)}>
          详情
        </a>
      ),
    },
  ]

  return (
    <EpPage title="利益排查" crumb="风控中心 / 利益排查">
      {/* 结果提示条 */}
      <div
        style={{
          background: '#F0FDF4',
          border: '1px solid #BBF7D0',
          borderRadius: 10,
          padding: '12px 16px',
          fontSize: 13,
          color: '#15803D',
          display: 'flex',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <span style={{ color: '#16A34A', fontSize: 15 }}>✓</span>
        <span>
          您 <b>{banner.time}</b> {banner.verb} <b>{banner.count}</b> {banner.unit}
        </span>
        <a style={{ color: '#2563EB', cursor: 'pointer', marginLeft: 4, fontWeight: 500 }}>点击查看</a>
      </div>

      {/* 两张名单卡片 + 中间排查逻辑虚线 */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'stretch', marginTop: 18, flexWrap: 'wrap' }}>
        <UploadCard card={data.emplCard} icon={<PersonIcon />} onAdd={() => setEmplOpen(true)} />

        {/* 中间排查逻辑 */}
        <div
          style={{
            flex: '1 1 220px',
            minWidth: 200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: 6,
            padding: '10px 0',
          }}
        >
          {data.flow.map((f, i) => (
            <span key={f} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span
                style={{
                  fontSize: 12,
                  color: '#475569',
                  background: '#F1F5F9',
                  border: '1px dashed #CBD5E1',
                  borderRadius: 999,
                  padding: '3px 10px',
                  whiteSpace: 'nowrap',
                }}
              >
                {f}
              </span>
              {i < data.flow.length - 1 && (
                <span style={{ color: '#CBD5E1', fontSize: 16, lineHeight: 1 }}>—›</span>
              )}
            </span>
          ))}
        </div>

        <UploadCard card={data.partnerCard} icon={<BuildingIcon />} onAdd={() => setPartnerOpen(true)} />
      </div>

      {/* 排查按钮 */}
      <div style={{ marginTop: 22, textAlign: 'center' }}>
        <EpBtn
          variant="primary"
          onClick={onCheck}
          style={{
            background: '#2563EB',
            borderColor: '#2563EB',
            color: '#fff',
            fontWeight: 600,
            padding: '8px 28px',
            fontSize: 14,
          }}
        >
          {data.checkBtn}
        </EpBtn>
      </div>

      {/* 排查结果表格 */}
      {showTable && (
        <div style={{ marginTop: 22 }}>
          <EpCard
            title={
              <span>
                已查出 <b style={{ color: '#DC2626' }}>{empCount}</b> 名员工 <b style={{ color: '#DC2626' }}>{partnerCount}</b> 家合作伙伴有疑似利益关系
              </span>
            }
            actions={
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <input
                  value={kw}
                  onChange={(e) => setKw(e.target.value)}
                  placeholder={data.table.searchPlaceholder}
                  style={{
                    width: 220,
                    padding: '7px 12px',
                    border: '1px solid #CBD5E1',
                    borderRadius: 8,
                    fontSize: 13,
                    outline: 'none',
                  }}
                />
                <EpBtn variant="primary" style={{ background: '#2563EB', borderColor: '#2563EB', color: '#fff' }}>
                  {data.table.exportBtn}
                </EpBtn>
              </div>
            }
          >
            <DataTable
              columns={columns}
              rows={filteredRows as unknown as Row[]}
              selectable
              pager
              pageSize={10}
              empty="暂无数据"
            />
          </EpCard>
        </div>
      )}

      {/* 说明区 */}
      <div style={{ marginTop: 22 }}>
        <EpCard title="功能说明" desc={<Sam value="fkInterest.json" />}>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>{data.intro.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.intro.items.map((it) => (
              <div key={it.label} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#475569' }}>
                <span style={{ color: '#2563EB', flexShrink: 0 }}>·</span>
                <span>
                  <b style={{ color: '#1E293B', fontWeight: 600 }}>{it.label}：</b>
                  {it.text}
                </span>
              </div>
            ))}
          </div>
        </EpCard>
      </div>

      {detailRow && (
        <DetailModal
          row={detailRow}
          labels={data.detailLabels}
          onClose={() => setDetailRow(null)}
        />
      )}

      <UploadDrawer open={emplOpen} title={`添加${data.emplCard.name}`} onClose={() => setEmplOpen(false)} />
      <UploadDrawer open={partnerOpen} title={`添加${data.partnerCard.name}`} onClose={() => setPartnerOpen(false)} />
    </EpPage>
  )
}

function DetailModal({ row, labels, onClose }: { row: TableRow; labels: Data['detailLabels']; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 60, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)' }} onClick={onClose} />
      <div
        style={{
          position: 'relative',
          background: '#fff',
          borderRadius: 12,
          width: 760,
          maxWidth: '92vw',
          maxHeight: '86vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 50px rgba(0,0,0,.18)',
        }}
      >
        {/* 头部 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
            {labels.title.replace('{name}', row.name)}
          </div>
          <button
            onClick={onClose}
            style={{ border: 'none', background: 'transparent', fontSize: 22, cursor: 'pointer', color: '#94A3B8', lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* 表格 */}
        <div style={{ padding: 16, overflow: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, border: '1px solid #E2E8F0' }}>
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th
                  style={{
                    width: 56,
                    padding: '12px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#334155',
                    borderBottom: '1px solid #E2E8F0',
                    borderRight: '1px solid #E2E8F0',
                  }}
                >
                  {labels.seq}
                </th>
                <th
                  style={{
                    width: 240,
                    padding: '12px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#334155',
                    borderBottom: '1px solid #E2E8F0',
                    borderRight: '1px solid #E2E8F0',
                  }}
                >
                  {labels.company}
                </th>
                <th
                  style={{
                    padding: '12px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: '#334155',
                    borderBottom: '1px solid #E2E8F0',
                  }}
                >
                  {labels.detail}
                </th>
              </tr>
            </thead>
            <tbody>
              {row.detail.map((item, i) => (
                <tr key={i}>
                  <td
                    style={{
                      padding: '14px',
                      color: '#334155',
                      borderBottom: '1px solid #F1F5F9',
                      borderRight: '1px solid #E2E8F0',
                      verticalAlign: 'top',
                    }}
                  >
                    {i + 1}
                  </td>
                  <td
                    style={{
                      padding: '14px',
                      color: '#0F172A',
                      fontWeight: 600,
                      borderBottom: '1px solid #F1F5F9',
                      borderRight: '1px solid #E2E8F0',
                      verticalAlign: 'top',
                    }}
                  >
                    {item.company}
                  </td>
                  <td
                    style={{
                      padding: '14px',
                      color: '#475569',
                      lineHeight: 1.7,
                      borderBottom: '1px solid #F1F5F9',
                      verticalAlign: 'top',
                    }}
                  >
                    {item.content}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 底部按钮 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 10,
            padding: '14px 20px',
            borderTop: '1px solid #F1F5F9',
          }}
        >
          <EpBtn variant="default" onClick={onClose}>
            {labels.close}
          </EpBtn>
          <EpBtn
            variant="primary"
            style={{ background: '#2563EB', borderColor: '#2563EB', color: '#fff', fontWeight: 600 }}
          >
            {labels.download}
          </EpBtn>
        </div>
      </div>
    </div>
  )
}

function UploadDrawer({ open, title, onClose }: { open: boolean; title: string; onClose: () => void }) {
  if (!open) return null
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,.35)' }} onClick={onClose} />
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: 480,
          maxWidth: '92vw',
          background: '#fff',
          boxShadow: '-8px 0 30px rgba(0,0,0,.12)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #F1F5F9' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>{title}</div>
          <button onClick={onClose} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: '#94A3B8' }}>×</button>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: 18 }}>
          <div
            style={{
              border: '1.5px dashed #CBD5E1',
              borderRadius: 12,
              padding: '36px 18px',
              textAlign: 'center',
              color: '#64748B',
              fontSize: 13,
            }}
          >
            <div style={{ marginBottom: 8 }}>点击或拖拽 Excel 文件到此处上传</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>仅支持 xls / xlsx 格式</div>
            <div style={{ marginTop: 14 }}>
              <EpBtn variant="primary">选择文件</EpBtn>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
