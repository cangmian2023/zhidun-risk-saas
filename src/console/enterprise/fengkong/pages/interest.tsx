// 风控中心 · 利益排查（fk-interest）· 1:1 复刻「风控 - 利益排查」
// 数据：本地样例 fkInterest.json（橘 Sam）
import { useState } from 'react';
import { EpPage, EpCard, EpBtn, DataTable, useSample } from '../../epCommon';
import type { Row } from '../../../../components/ui';

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
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1677ff" strokeWidth="1.8">
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" strokeLinecap="round" />
    </svg>
  )
}
function BuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1677ff" strokeWidth="1.8">
      <rect x="5" y="4" width="14" height="16" rx="1.5" />
      <path d="M9 8h2M13 8h2M9 12h2M13 12h2M9 16h2M13 16h2" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1677ff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function UploadIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  )
}

function UploadCard({
  card,
  icon,
  file,
  uploading,
  onUpload,
  onRemove,
  count,
}: {
  card: Card
  icon: React.ReactNode
  file: string | null
  uploading: boolean
  onUpload: () => void
  onRemove: () => void
  count: number
}) {
  const isEmpl = card.name.includes('员工')
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
        boxShadow: '0 2px 8px rgba(15,23,42,.05)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
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
        <a
          onClick={() => alert('下载 ' + card.name + ' 样例模板（姓名/编号/企业名称）')}
          style={{ fontSize: 13, color: '#1677ff', cursor: 'pointer', whiteSpace: 'nowrap', textDecoration: 'none' }}
        >
          查看样例
        </a>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        {card.limit.split('，').map((t) => (
          <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#94A3B8' }}>
            <CheckIcon />
            {t}
          </span>
        ))}
      </div>

      {file ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: '#F8FAFC',
            borderRadius: 8,
            padding: '10px 14px',
            border: '1px solid #E2E8F0',
          }}
        >
          <DocIcon />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 13, color: '#1677ff', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file}</div>
            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>
              已识别 {count} {isEmpl ? '人' : '家'}数据
            </div>
          </div>
          <button
            onClick={onRemove}
            title="删除文件"
            style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#94A3B8', display: 'inline-flex', padding: 4 }}
          >
            <CloseIcon />
          </button>
        </div>
      ) : (
        <EpBtn
          variant="default"
          style={{ alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6 }}
          onClick={onUpload}
          disabled={uploading}
        >
          <UploadIcon />
          {uploading ? '上传中…' : card.btn}
        </EpBtn>
      )}

      {file && (
        <button
          onClick={onUpload}
          style={{
            alignSelf: 'flex-start',
            border: 'none',
            background: 'transparent',
            color: '#1677ff',
            fontSize: 12.5,
            cursor: 'pointer',
            padding: 0,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <UploadIcon />
          重新上传
        </button>
      )}
    </div>
  )
}

export default function FkInterest({ params }: { params: URLSearchParams }) {
  const [data] = useSample<Data>('fkInterest.json', seed)
  const [emplFile, setEmplFile] = useState<string | null>(null)
  const [partnerFile, setPartnerFile] = useState<string | null>(null)
  const [emplUploading, setEmplUploading] = useState(false)
  const [partnerUploading, setPartnerUploading] = useState(false)
  const [banner, setBanner] = useState(data.banner)
  const [showTable, setShowTable] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [kw, setKw] = useState('')
  const [detailRow, setDetailRow] = useState<TableRow | null>(null)
  const [checkHint, setCheckHint] = useState('')
  const [ruleOpen, setRuleOpen] = useState(false)
  const [emplCount, setEmplCount] = useState(0)
  const [partnerCountRows, setPartnerCountRows] = useState(0)

  const uploadFile = (which: 'empl' | 'partner') => {
    const setUploading = which === 'empl' ? setEmplUploading : setPartnerUploading
    const setFile = which === 'empl' ? setEmplFile : setPartnerFile
    const setCount = which === 'empl' ? setEmplCount : setPartnerCountRows
    setUploading(true)
    window.setTimeout(() => {
      setUploading(false)
      setFile(which === 'empl' ? '员工名单_20260818.xlsx' : '合作方名单_20260818.xlsx')
      setCount(which === 'empl' ? 128 : 36)
    }, 800)
  }

  const bothUploaded = !!emplFile && !!partnerFile

  const onCheck = () => {
    if (!bothUploaded) {
      setCheckHint('请先上传「员工名单」与「合作方名单」两份文件后再开始排查')
      return
    }
    setCheckHint('')
    const now = new Date()
    const pad = (n: number) => String(n).padStart(2, '0')
    const time = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
    setBanner({ ...data.banner, time, count: data.banner.count || 1 })
    setShowTable(true)
    setCollapsed(true)
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

  const STEPS = [
    { n: 1, label: '上传员工名单', done: !!emplFile },
    { n: 2, label: '上传合作方名单', done: !!partnerFile },
    { n: 3, label: '发起利益冲突排查', done: showTable },
  ]

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
          <a style={{ color: '#1677ff', fontSize: 12, cursor: 'pointer' }}>更多</a>
        </div>
      ),
    },
    { key: 'reason', label: '原因', width: 180 },
    {
      key: 'op',
      label: '操作',
      width: 70,
      render: (r: Row) => (
        <a style={{ color: '#1677ff', cursor: 'pointer' }} onClick={() => setDetailRow(r as unknown as TableRow)}>
          详情
        </a>
      ),
    },
  ]

  return (
    <EpPage title="利益排查" crumb="风控中心 / 利益排查">
      {/* 收起态：一行横幅，点击展开 */}
      {collapsed && (
        <div
          onClick={() => setCollapsed(false)}
          style={{
            marginTop: 18,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            borderRadius: 10,
            border: '1px solid #E2E8F0',
            background: '#F8FAFC',
            cursor: 'pointer',
            fontSize: 13,
            color: '#475569',
          }}
        >
          <span>名单配置已收起（已上传 {emplCount} 名员工、{partnerCountRows} 家合作伙伴）</span>
          <span style={{ color: '#1677ff', fontWeight: 500 }}>▾ 展开配置</span>
        </div>
      )}

      {!collapsed && (
        <>
          {/* 顶部流程步骤导航 */}
          <div
            style={{
              marginTop: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 0,
              marginBottom: 22,
            }}
          >
            {STEPS.map((s, i) => (
              <div key={s.n} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      color: s.done ? '#fff' : '#64748B',
                      background: s.done ? '#1677ff' : '#E2E8F0',
                    }}
                  >
                    {s.done ? '✓' : s.n}
                  </span>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: s.done ? 600 : 400,
                      color: s.done ? '#0F172A' : '#64748B',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <span
                    style={{
                      width: 120,
                      height: 2,
                      background: s.done ? '#1677ff' : '#CBD5E1',
                      margin: '0 14px',
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* 左右双上传卡片 + 右上收起配置 */}
          <div style={{ position: 'relative' }}>
            <div
              onClick={() => setCollapsed(true)}
              style={{
                position: 'absolute',
                top: -2,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 13,
                color: '#1677ff',
                cursor: 'pointer',
                userSelect: 'none',
              }}
            >
              收起配置 ▴
            </div>
            <div style={{ display: 'flex', gap: 20, alignItems: 'stretch', flexWrap: 'wrap' }}>
              <UploadCard
                card={data.emplCard}
                icon={<PersonIcon />}
                file={emplFile}
                uploading={emplUploading}
                onUpload={() => uploadFile('empl')}
                onRemove={() => {
                  setEmplFile(null)
                  setEmplCount(0)
                }}
                count={emplCount}
              />
              <UploadCard
                card={data.partnerCard}
                icon={<BuildingIcon />}
                file={partnerFile}
                uploading={partnerUploading}
                onUpload={() => uploadFile('partner')}
                onRemove={() => {
                  setPartnerFile(null)
                  setPartnerCountRows(0)
                }}
                count={partnerCountRows}
              />
            </div>
          </div>

          {/* 底部居中排查按钮 */}
          <div style={{ marginTop: 26, textAlign: 'center' }}>
            {!bothUploaded && (
              <div style={{ marginBottom: 12, fontSize: 13, color: '#64748B' }}>
                已上传：员工名单 <b style={{ color: emplFile ? '#1677ff' : '#94A3B8' }}>{emplFile ? `${emplCount} 人` : '0 人'}</b> ／ 合作方名单{' '}
                <b style={{ color: partnerFile ? '#1677ff' : '#94A3B8' }}>{partnerFile ? `${partnerCountRows} 家` : '0 家'}</b>
              </div>
            )}
            <div style={{ display: 'inline-block', position: 'relative' }}>
              <EpBtn
                variant="primary"
                onClick={onCheck}
                disabled={!bothUploaded}
                title={bothUploaded ? '' : '请先上传「员工名单」与「合作方名单」两份文件后再开始排查'}
                style={{
                  background: bothUploaded ? '#1677ff' : '#CBD5E1',
                  borderColor: bothUploaded ? '#1677ff' : '#CBD5E1',
                  color: '#fff',
                  fontWeight: 600,
                  padding: '9px 32px',
                  fontSize: 14,
                  cursor: bothUploaded ? 'pointer' : 'not-allowed',
                }}
              >
                {data.checkBtn}
              </EpBtn>
            </div>
            {checkHint && (
              <div style={{ marginTop: 10, fontSize: 13, color: '#DC2626' }}>{checkHint}</div>
            )}
          </div>

          {/* 排查规则说明（折叠面板） */}
          <div style={{ marginTop: 18, maxWidth: 760, marginLeft: 'auto', marginRight: 'auto' }}>
            <div
              onClick={() => setRuleOpen((v) => !v)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                cursor: 'pointer',
                fontSize: 13,
                color: '#64748B',
                userSelect: 'none',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <line x1="12" y1="11" x2="12" y2="16" />
                <line x1="12" y1="8" x2="12" y2="8" />
              </svg>
              本次排查规则
              <span style={{ color: '#94A3B8', fontSize: 12 }}>{ruleOpen ? '⌃' : '⌄'}</span>
            </div>
            {ruleOpen && (
              <div
                style={{
                  marginTop: 8,
                  padding: '12px 16px',
                  borderRadius: 10,
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 8,
                }}
              >
                {data.flow.map((f, i) => (
                  <span
                    key={f}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 12,
                      color: '#475569',
                      background: '#fff',
                      border: '1px dashed #CBD5E1',
                      borderRadius: 999,
                      padding: '3px 10px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {i < data.flow.length - 1 && <span style={{ color: '#94A3B8', fontSize: 11 }}>{i + 1}.</span>}
                    {f}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}

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
                <EpBtn variant="primary" style={{ background: '#1677ff', borderColor: '#1677ff', color: '#fff' }}>
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

      {/* 说明区：提示内容 */}
      <div
        style={{
          marginTop: 22,
          display: 'flex',
          gap: 12,
          padding: '14px 16px',
          borderRadius: 12,
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          color: '#1E40AF',
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        <span style={{ flexShrink: 0, fontSize: 16, lineHeight: 1.4 }}>ℹ️</span>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 6, color: '#1E3A8A' }}>{data.intro.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.intro.items.map((it) => (
              <div key={it.label} style={{ display: 'flex', gap: 8 }}>
                <span style={{ color: '#1677ff', flexShrink: 0 }}>·</span>
                <span>
                  <b style={{ fontWeight: 600, color: '#1E3A8A' }}>{it.label}：</b>
                  {it.text}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 2 }}>
            </div>
          </div>
        </div>
      </div>

      {detailRow && (
        <DetailModal
          row={detailRow}
          labels={data.detailLabels}
          onClose={() => setDetailRow(null)}
        />
      )}

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

        {/* 列表内容 */}
        <div style={{ padding: 16, overflow: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {row.detail.map((item, i) => (
            <div
              key={i}
              style={{
                border: '1px solid #E2E8F0',
                borderRadius: 10,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#F8FAFC',
                  borderBottom: '1px solid #E2E8F0',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: '#1677ff',
                      color: '#fff',
                      fontSize: 12,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {i + 1}
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{item.company}</span>
                </div>
                <span style={{ fontSize: 12, color: '#64748B' }}>{labels.company}</span>
              </div>
              <ul
                style={{
                  margin: 0,
                  padding: '10px 14px 12px 30px',
                  listStyle: 'disc',
                  fontSize: 13,
                  color: '#475569',
                  lineHeight: 1.8,
                }}
              >
                {String(item.content).split('\n').filter(Boolean).map((line, j) => (
                  <li key={j}>{line}</li>
                ))}
              </ul>
            </div>
          ))}
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
            style={{ background: '#1677ff', borderColor: '#1677ff', color: '#fff', fontWeight: 600 }}
          >
            {labels.download}
          </EpBtn>
        </div>
      </div>
    </div>
  )
}
