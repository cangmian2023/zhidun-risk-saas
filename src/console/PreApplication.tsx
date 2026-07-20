import { useMemo, useRef, useState, useEffect, Fragment } from 'react'
import { PageHeader, DetailHeader, Panel, Badge, DecisionTag, StatusTag, Drawer, Modal, Button, StatCard, SingleSelect, type SelectOption, type BadgeVal } from '../components/ui'
import {
  getPreApps,
  getDetail,
  getReport,
  getDeviceApps,
  getRelatedApps,
  auditStatusMeta,
  decisionGroupMeta,
  productOptions,
  channelOptions,
  rowDecisionGroup,
  reviewerInfo,
  reviewerText,
  buildInfoVerify,
  buildCreditRisk,
  buildFraudRisk,
  type AppRow,
  type AuditStatus,
  type DecisionGroup,
  type ReviewEntry,
  type InfoVerifyVM,
  type CreditRiskVM,
  type FraudRiskVM,
} from './preApp'

type Kind = 'red' | 'orange' | 'amber' | 'green' | 'blue' | 'cyan' | 'violet' | 'gray'
const VALID_KINDS = new Set<string>(['red', 'orange', 'amber', 'green', 'blue', 'cyan', 'violet', 'gray'])
function toKind(k: string): Kind {
  return (VALID_KINDS.has(k) ? k : 'gray') as Kind
}
/** 风险等级 → 颜色语义（绿=安全/优 · 黄=中/预警 · 红=高/弱/命中） */
function lvlKind(s: string): 'red' | 'amber' | 'green' {
  if (s.includes('未命中') || s.includes('正常') || s.includes('优') || s.includes('通过') || s.includes('低风险') || s === '低') return 'green'
  if (s.includes('高') || s === '弱' || s.includes('偏弱') || s.includes('命中')) return 'red'
  return 'amber'
}
/** 进度条颜色：kind → 填充/刻度色 */
const barFill: Record<'red' | 'amber' | 'green', string> = {
  red: 'bg-rose-400',
  amber: 'bg-amber-400',
  green: 'bg-emerald-400',
}
const markColor: Record<'red' | 'amber' | 'green', string> = {
  red: 'bg-rose-500',
  amber: 'bg-amber-500',
  green: 'bg-emerald-500',
}
/** 带阈值刻度线的分数进度条 */
function ScoreBar({ value, floor, max, kind, marks }: {
  value: number
  floor: number
  max: number
  kind: 'red' | 'amber' | 'green'
  marks: { at: number; label: string; color: 'red' | 'amber' | 'green' }[]
}) {
  const span = Math.max(1, max - floor)
  const pct = (n: number) => Math.max(0, Math.min(100, ((n - floor) / span) * 100))
  return (
    <div className="mt-2">
      <div className="relative h-2 rounded-full bg-slate-100">
        <div className={`absolute inset-y-0 left-0 rounded-full ${barFill[kind]}`} style={{ width: `${pct(value)}%` }} />
        {marks.map((m) => (
          <div key={m.at} className={`absolute top-[-2px] h-3 w-0.5 ${markColor[m.color]}`} style={{ left: `${pct(m.at)}%` }} />
        ))}
      </div>
      <div className="relative mt-1 h-3 text-[10px] text-slate-400">
        {marks.map((m) => (
          <span key={m.at} className="absolute -translate-x-1/2 whitespace-nowrap" style={{ left: `${pct(m.at)}%` }}>{m.at} {m.label}</span>
        ))}
      </div>
    </div>
  )
}
/** 生成内联 SVG 数据 URI，用于证件 / 活体等图片与视频封面的真实预览 */
function svgDataUri(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
/** 根据文件名生成对应的材料预览图（身份证正/反面、活体抓拍等） */
function materialPreviewSvg(name: string): string {
  const W = 640
  const H = 400
  let inner = ''
  if (name.includes('身份证正面')) {
    inner = `
      <rect x="40" y="40" width="560" height="320" rx="16" fill="#e8eef7" stroke="#c2d0e6"/>
      <rect x="70" y="80" width="150" height="190" rx="8" fill="#cdd9ec"/>
      <circle cx="145" cy="150" r="42" fill="#9fb3d4"/>
      <path d="M110 240 q35 -30 70 0 v30 h-70 z" fill="#9fb3d4"/>
      <text x="260" y="120" font-size="22" fill="#1f3b66" font-family="sans-serif">姓名 张三</text>
      <text x="260" y="160" font-size="16" fill="#3a5680" font-family="sans-serif">性别 男　民族 汉</text>
      <text x="260" y="195" font-size="16" fill="#3a5680" font-family="sans-serif">出生 1990.05.12</text>
      <text x="260" y="240" font-size="15" fill="#3a5680" font-family="sans-serif">住址 北京市朝阳区xx路xx号</text>
      <text x="260" y="300" font-size="16" fill="#1f3b66" font-family="sans-serif" letter-spacing="2">110105199005120012</text>`
  } else if (name.includes('身份证反面')) {
    inner = `
      <rect x="40" y="40" width="560" height="320" rx="16" fill="#f0ead8" stroke="#d8cda0"/>
      <circle cx="320" cy="150" r="46" fill="none" stroke="#b03a2e" stroke-width="3"/>
      <text x="320" y="162" font-size="34" fill="#b03a2e" text-anchor="middle" font-family="sans-serif">★</text>
      <text x="320" y="240" font-size="20" fill="#7a5c12" text-anchor="middle" font-family="sans-serif">中华人民共和国</text>
      <text x="320" y="275" font-size="20" fill="#7a5c12" text-anchor="middle" font-family="sans-serif">居民身份证</text>
      <text x="320" y="320" font-size="14" fill="#9a7d2e" text-anchor="middle" font-family="sans-serif">签发机关 xx公安局　有效期限 2020.01-2040.01</text>`
  } else if (name.includes('活体')) {
    inner = `
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#6366f1"/><stop offset="1" stop-color="#0ea5e9"/></linearGradient></defs>
      <rect width="640" height="400" fill="url(#g)"/>
      <circle cx="320" cy="175" r="78" fill="#fde7d3"/>
      <circle cx="320" cy="148" r="38" fill="#f6c9a8"/>
      <path d="M272 222 q48 46 96 0" stroke="#c98b66" stroke-width="4" fill="none"/>
      <text x="320" y="328" font-size="18" fill="#fff" text-anchor="middle" font-family="sans-serif">活体检测抓拍</text>`
  } else {
    inner = `
      <rect width="640" height="400" fill="#f1f5f9"/>
      <rect x="220" y="110" width="200" height="170" rx="10" fill="#cbd5e1"/>
      <text x="320" y="330" font-size="18" fill="#64748b" text-anchor="middle" font-family="sans-serif">${name}</text>`
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${inner}</svg>`
}
const MATERIAL_VIDEO_SRC = 'https://www.w3schools.com/html/mov_bbb.mp4'

function RuleSection({ title, text, items }: { title: string; text?: string; items?: string[] }) {
  return (
    <div>
      <p className="font-medium text-slate-700">{title}</p>
      {text ? <p className="mt-1">{text}</p> : null}
      {items ? (
        <ul className="mt-1 list-disc space-y-0.5 pl-5">
          {items.map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}
function yuan(n: number): string {
  return '¥' + n.toLocaleString('zh-CN')
}

/* 系统建议：最终额度、建议利率（审核人可修改） */
function suggestFor(row: AppRow): { amount: string; rate: string } {
  const amt = Number(String(row.amount).replace(/[^\d]/g, '')) || 50000
  const credit = Number(String(row.credit).replace(/[^\d]/g, '')) || 650
  const rate = (credit >= 750 ? 6.0 : credit >= 700 ? 6.8 : credit >= 650 ? 7.6 : 8.8).toFixed(1)
  return { amount: `¥${amt.toLocaleString('zh-CN')}`, rate: `${rate}%` }
}

/* 审核状态覆盖（人工操作写回审核状态，决策结果由状态推导，会话内生效） */
interface Override {
  status: AuditStatus
}
type Overrides = Record<string, Override>

export default function PreApplication() {
  const baseRows = useMemo(() => getPreApps(), [])
  const [overrides, setOverrides] = useState<Overrides>({})
  const [view, setView] = useState<'list' | 'detail'>('list')
  const [detailId, setDetailId] = useState<string>('')

  /* 筛选状态 */
  const [kw, setKw] = useState('')
  const [products, setProducts] = useState<Set<string>>(new Set())
  const [channels, setChannels] = useState<Set<string>>(new Set())
  const [decisions, setDecisions] = useState<Set<DecisionGroup>>(new Set())
  const [statuses, setStatuses] = useState<Set<AuditStatus>>(new Set())
  const [fraudQuick, setFraudQuick] = useState('')
  const [creditQuick, setCreditQuick] = useState('')
  const [amountQuick, setAmountQuick] = useState('')
  const [timeRange, setTimeRange] = useState<'all' | 'today' | '7' | '30'>('all')

  /* 批量选择 / 分页 */
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [toast, setToast] = useState('')

  /* 抽屉 / 弹窗 */
  const [reportFor, setReportFor] = useState<AppRow | null>(null)
  const [reviewFor, setReviewFor] = useState<AppRow | null>(null)
  const [reviewRecordFor, setReviewRecordFor] = useState<AppRow | null>(null)
  const [relatedFor, setRelatedFor] = useState<AppRow | null>(null)
  const [addedReviews, setAddedReviews] = useState<Record<string, ReviewEntry[]>>({})

  const rows = useMemo(
    () =>
      baseRows.map((r) => {
        const ov = overrides[r.id]
        if (!ov) return r
        return { ...r, auditStatus: ov.status }
      }),
    [baseRows, overrides],
  )

  function flash(msg: string) {
    setToast(msg)
    window.setTimeout(() => setToast(''), 2200)
  }

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (kw && !`${r.id}${r.name}${r.phone}`.includes(kw)) return false
      if (products.size && !products.has(r.product)) return false
      if (channels.size && !channels.has(r.channel)) return false
      if (decisions.size && !decisions.has(rowDecisionGroup(r))) return false
      if (statuses.size && !statuses.has(r.auditStatus)) return false
      if (fraudQuick) {
        const ok = fraudQuick === '低' ? r.fraudScore < 30 : fraudQuick === '中' ? r.fraudScore >= 30 && r.fraudScore <= 60 : r.fraudScore > 60
        if (!ok) return false
      }
      if (creditQuick) {
        const ok = creditQuick === '低' ? r.creditScore < 580 : creditQuick === '中' ? r.creditScore >= 580 && r.creditScore <= 720 : r.creditScore > 720
        if (!ok) return false
      }
      if (amountQuick) {
        const ok =
          amountQuick === '0-1万'
            ? r.amount < 10000
            : amountQuick === '1-5万'
            ? r.amount >= 10000 && r.amount < 50000
            : amountQuick === '5-20万'
            ? r.amount >= 50000 && r.amount < 200000
            : r.amount >= 200000
        if (!ok) return false
      }
      if (timeRange !== 'all') {
        const day = (r.applyTime as string).slice(5, 10)
        const ok = timeRange === 'today' ? day === '07-19' : timeRange === '7' ? day >= '07-13' : day >= '06-19'
        if (!ok) return false
      }
      return true
    })
  }, [rows, kw, products, channels, decisions, statuses, fraudQuick, creditQuick, amountQuick, timeRange])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(page, pageCount)
  const pageRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const pendingCount = rows.filter((r) => r.auditStatus === '待人工复核').length

  function resetFilters() {
    setKw('')
    setProducts(new Set())
    setChannels(new Set())
    setDecisions(new Set())
    setStatuses(new Set())
    setFraudQuick('')
    setCreditQuick('')
    setAmountQuick('')
    setTimeRange('all')
  }

  function applyStatus(ids: string[], status: AuditStatus) {
    setOverrides((prev) => {
      const next = { ...prev }
      ids.forEach((id) => {
        next[id] = { status }
      })
      return next
    })
  }

  function openDetail(id: string) {
    setDetailId(id)
    setView('detail')
  }

  const detailRow = rows.find((r) => r.id === detailId) ?? null

  /* ============ 列表视图 ============ */
  const showList = view === 'list' || !detailRow
  const listView = showList ? (
    <div className="space-y-6">
      <PageHeader
        crumb="零售信贷风控 / 贷前审核"
        title="申贷审核"
        subtitle="处理一笔贷款申请的总入口：接收各渠道申贷信息，调用决策引擎跑决策流，输出决策建议，并承载人工复核与自动报告生成。"
        actions={null}
      />

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard label="今日已审" value="12,847" hint="较昨日 +3.2%" />
          <StatCard label="平均决策耗时" value="86ms" hint="P99 < 200ms" />
          <StatCard label="转人工率" value="10.3%" hint="行业基准 12%" accent="amber" />
          <StatCard label="待我复核" value={String(pendingCount)} hint="仅待人工复核" accent="brand" />
        </div>

        <FilterBar
          kw={kw}
          setKw={setKw}
          products={products}
          setProducts={setProducts}
          channels={channels}
          setChannels={setChannels}
          decisions={decisions}
          setDecisions={setDecisions}
          statuses={statuses}
          setStatuses={setStatuses}
          fraudQuick={fraudQuick}
          setFraudQuick={setFraudQuick}
          creditQuick={creditQuick}
          setCreditQuick={setCreditQuick}
          amountQuick={amountQuick}
          setAmountQuick={setAmountQuick}
          timeRange={timeRange}
          setTimeRange={setTimeRange}
          onReset={resetFilters}
          total={filtered.length}
        />

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-sm">
            <span className="font-medium text-brand-700">已选 {selected.size} 笔</span>
            <Button variant="secondary" onClick={() => { applyStatus([...selected], '已关闭'); flash('已批量关闭'); setSelected(new Set()) }}>
              批量关闭
            </Button>
            <Button variant="secondary" onClick={() => { flash('已批量查看报告'); setSelected(new Set()) }}>
              批量查看报告
            </Button>
            <button onClick={() => setSelected(new Set())} className="ml-auto text-slate-400 hover:text-slate-600">
              取消选择
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm">
          <table className="table-fixed min-w-[1550px] text-sm">
            <thead>
              <tr className="sticky top-0 z-30 border-b border-slate-100 bg-slate-50 text-left text-xs font-semibold text-slate-500">
                <th className="sticky left-0 z-30 w-12 bg-slate-50 px-4 py-3">
                  <input
                    type="checkbox"
                    className="accent-brand-600"
                    checked={pageRows.length > 0 && pageRows.every((r) => selected.has(r.id))}
                    onChange={(e) => {
                      const s = new Set(selected)
                      pageRows.forEach((r) => (e.target.checked ? s.add(r.id) : s.delete(r.id)))
                      setSelected(s)
                    }}
                  />
                </th>
                <th className="sticky left-12 z-30 w-[140px] bg-slate-50 px-3 py-3">申请编号</th>
                <th className="sticky left-[188px] z-30 w-[132px] bg-slate-50 px-3 py-3">申请人</th>
                <th className="w-[110px] px-3 py-3">产品</th>
                <th className="w-[110px] px-3 py-3">渠道</th>
                <th className="w-[130px] px-3 py-3 text-right">申请额度</th>
                <th className="w-[100px] px-3 py-3 text-right">欺诈分</th>
                <th className="w-[100px] px-3 py-3 text-right">信用分</th>
                <th className="w-[120px] px-3 py-3 text-center">决策结果</th>
                <th className="w-[120px] px-3 py-3 text-center">审核状态</th>
                <th className="w-[140px] px-3 py-3 text-center">审核人</th>
                <th className="w-[160px] px-3 py-3">申请时间</th>
                <th className="sticky right-0 z-30 w-[140px] bg-slate-50 px-3 py-3 pr-[22px] text-right">操作</th>
              </tr>
            </thead>
            <tbody>
                {pageRows.map((r) => {
                  const g = rowDecisionGroup(r)
                  const rev = reviewerInfo(r)
                return (
                  <tr key={r.id} className="group border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                    <td className="sticky left-0 z-10 bg-white px-4 py-3 group-hover:bg-slate-50/60">
                      <input type="checkbox" className="accent-brand-600" checked={selected.has(r.id)} onChange={(e) => { const s = new Set(selected); e.target.checked ? s.add(r.id) : s.delete(r.id); setSelected(s) }} />
                    </td>
                    <td className="sticky left-12 z-10 bg-white px-3 py-3 group-hover:bg-slate-50/60">
                      <button onClick={() => openDetail(r.id)} className="font-medium text-brand-600 hover:underline">
                        {r.id}
                      </button>
                    </td>
                    <td className="sticky left-[188px] z-10 bg-white px-3 py-3 group-hover:bg-slate-50/60">
                      <div className="flex items-center gap-2">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-semibold text-brand-700">
                          {String(r.name).slice(0, 1)}
                        </span>
                        <span className="text-slate-700">{maskName(r.name)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{r.product}</td>
                    <td className="px-3 py-3 text-slate-600">{r.channel}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-slate-700">{yuan(r.amount)}</td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <ScorePill value={r.fraudScore} high={60} low={30} />
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums">
                      <ScorePill value={r.creditScore} high={720} low={580} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <DecisionTag kind={toKind(decisionGroupMeta[g].kind)} soft={g === '处理中' || g === '人工复核'}>{g}</DecisionTag>
                    </td>
                    <td className="px-3 py-3 text-center">
                      {g === '准入' || g === '拒绝' ? (
                        <span className="text-slate-300">--</span>
                      ) : (
                        <StatusTag kind={auditStatusMeta[r.auditStatus].kind}>{r.auditStatus === '待人工复核' ? '待复核' : r.auditStatus}</StatusTag>
                      )}
                    </td>
                    <td className="w-[140px] px-3 py-3 text-center text-slate-600">
                      {rev.kind === 'pending' ? (
                        <span className="text-slate-300">--</span>
                      ) : rev.kind === 'system' ? (
                        <span className="text-slate-400">系统审核</span>
                      ) : (
                        <span>{rev.name}</span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-slate-500">{r.applyTime as string}</td>
                    <td className="sticky right-0 z-10 bg-white px-3 py-3 pr-[22px] text-right group-hover:bg-slate-50/60">
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button onClick={() => openDetail(r.id)} className="text-brand-600 hover:underline">查看</button>
                        {r.auditStatus === '待人工复核' && (
                          <button onClick={() => setReviewFor(r)} className="text-slate-600 hover:underline">复核</button>
                        )}
                        {(r.auditStatus === '已通过' || r.auditStatus === '已拒绝') && (
                          <button onClick={() => setReportFor(r)} className="text-slate-600 hover:underline">查看报告</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={13} className="px-4 py-12 text-center text-sm text-slate-400">
                    无符合条件的申请
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <SingleSelect
              label="每页"
              options={[10, 20, 50].map((n) => ({ value: String(n), label: `${n} 条` }))}
              value={String(pageSize)}
              onChange={(v) => { setPageSize(Number(v)); setPage(1) }}
            />
            条 · 共 {filtered.length} 笔
          </div>
          <div className="flex items-center gap-1">
            <button disabled={safePage <= 1} onClick={() => setPage(safePage - 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50">上一页</button>
            <span className="px-2">{safePage} / {pageCount}</span>
            <button disabled={safePage >= pageCount} onClick={() => setPage(safePage + 1)} className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-40 hover:bg-slate-50">下一页</button>
          </div>
        </div>

        {toast && (
          <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm text-white shadow-lg">
            {toast}
          </div>
        )}
      </div>
    ) : null

  /* ============ 详情视图 ============ */
  const detailView = !showList ? (
    <DetailView
      row={detailRow}
      onBack={() => setView('list')}
      onReview={() => setReviewFor(detailRow)}
      onRelated={() => setRelatedFor(detailRow)}
      onAddReview={() => setReviewRecordFor(detailRow)}
      onReport={() => setReportFor(detailRow)}
      extraReviews={addedReviews[detailRow.id] ?? []}
      flash={flash}
    />
  ) : null

  return (
    <>
      {listView}
      {detailView}
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink-900 px-4 py-2.5 text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
      <ReportDrawer row={reportFor} onClose={() => setReportFor(null)} />
      <ReviewModal
        row={reviewFor}
        onClose={() => setReviewFor(null)}
        onSubmit={(v) => {
          const id = reviewFor!.id
          // 通过→已通过，拒绝→已拒绝，挂起→保持当前审核状态（不向下流转）
          const map: Record<string, Override> = {
            通过: { status: '已通过' },
            拒绝: { status: '已拒绝' },
            挂起: { status: reviewFor!.auditStatus },
          }
          applyStatus([id], map[v.conclusion].status)
          flash(`已提交复核结论：${v.conclusion}（最终额度 ${v.finalAmount} · 建议利率 ${v.finalRate}，理由已留痕）`)
          setReviewFor(null)
        }}
      />
      <ReviewRecordModal
        row={reviewRecordFor}
        onClose={() => setReviewRecordFor(null)}
        onSubmit={(v) => {
          const id = reviewRecordFor!.id
          const entry: ReviewEntry = {
            time: new Date().toLocaleString('zh-CN', { hour12: false }),
            party: v.party,
            action: v.action,
            content: v.content,
            attachment: v.attachment || undefined,
            fromStatus: reviewRecordFor!.auditStatus,
            toStatus: reviewRecordFor!.auditStatus,
            internal: v.internal,
          }
          setAddedReviews((prev) => ({ ...prev, [id]: [entry, ...(prev[id] ?? [])] }))
          flash(`复核记录已添加（最终额度 ${v.finalAmount} · 建议利率 ${v.finalRate}，已留痕）`)
          setReviewRecordFor(null)
        }}
      />
      <RelatedModal row={relatedFor} onClose={() => setRelatedFor(null)} onPick={(id) => { setRelatedFor(null); openDetail(id) }} />
    </>
  )
}

/* ============ 列表筛选栏 ============ */

function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: {
  label: string
  options: string[]
  selected: Set<string>
  onChange: (s: Set<string>) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    function h(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])
  function toggle(o: string) {
    const s = new Set(selected)
    s.has(o) ? s.delete(o) : s.add(o)
    onChange(s)
  }
  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm transition ${
          selected.size ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
        }`}
      >
        {label}
        {selected.size > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{selected.size}</span>}
        <span className="text-slate-400">▾</span>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 max-h-64 w-48 overflow-auto rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
          {options.map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
              <input type="checkbox" className="accent-brand-600" checked={selected.has(o)} onChange={() => toggle(o)} />
              <span className="text-slate-600">{o}</span>
            </label>
          ))}
          {selected.size > 0 && (
            <button onClick={() => onChange(new Set())} className="mt-1 w-full rounded-lg bg-slate-50 px-2 py-1 text-xs text-slate-500 hover:bg-slate-100">
              清空
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function FilterBar(props: {
  kw: string
  setKw: (v: string) => void
  products: Set<string>
  setProducts: (s: Set<string>) => void
  channels: Set<string>
  setChannels: (s: Set<string>) => void
  decisions: Set<DecisionGroup>
  setDecisions: (s: Set<DecisionGroup>) => void
  statuses: Set<AuditStatus>
  setStatuses: (s: Set<AuditStatus>) => void
  fraudQuick: string
  setFraudQuick: (v: string) => void
  creditQuick: string
  setCreditQuick: (v: string) => void
  amountQuick: string
  setAmountQuick: (v: string) => void
  timeRange: 'all' | 'today' | '7' | '30'
  setTimeRange: (v: 'all' | 'today' | '7' | '30') => void
  onReset: () => void
  total: number
}) {
  const {
    kw, setKw, products, setProducts, channels, setChannels, decisions, setDecisions, statuses, setStatuses,
    fraudQuick, setFraudQuick, creditQuick, setCreditQuick, amountQuick, setAmountQuick, timeRange, setTimeRange, onReset, total,
  } = props
  const decisionOpts: DecisionGroup[] = ['处理中', '准入', '拒绝', '人工复核']

const fraudOpts: SelectOption[] = [
  { value: '低', label: '低 (<30)' },
  { value: '中', label: '中 (30-60)' },
  { value: '高', label: '高 (>60)' },
]
const creditOpts: SelectOption[] = [
  { value: '低', label: '低 (<580)' },
  { value: '中', label: '中 (580-720)' },
  { value: '高', label: '高 (>720)' },
]
const amountOpts: SelectOption[] = [
  { value: '0-1万', label: '0-1万' },
  { value: '1-5万', label: '1-5万' },
  { value: '5-20万', label: '5-20万' },
  { value: '20万以上', label: '20万以上' },
]
  const statusOpts: AuditStatus[] = ['待审核', '审核中', '待人工复核', '已通过', '已拒绝', '已关闭']
  function toggleDecision(d: DecisionGroup) {
    const s = new Set(decisions)
    s.has(d) ? s.delete(d) : s.add(d)
    setDecisions(s)
  }
  function toggleStatus(s0: AuditStatus) {
    const s = new Set(statuses)
    s.has(s0) ? s.delete(s0) : s.add(s0)
    setStatuses(s)
  }
  return (
    <div className="space-y-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <input
          value={kw}
          onChange={(e) => setKw(e.target.value)}
          placeholder="申请编号 / 申请人 / 手机号"
          className="w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
        />
        <MultiSelect label="产品" options={productOptions} selected={products} onChange={setProducts} />
        <MultiSelect label="渠道" options={channelOptions} selected={channels} onChange={setChannels} />
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              const el = (e.currentTarget.nextElementSibling as HTMLElement)
              el.classList.toggle('hidden')
            }}
            className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${decisions.size ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            决策结果{decisions.size > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{decisions.size}</span>}<span className="text-slate-400">▾</span>
          </button>
          <div className="hidden absolute z-50 mt-1 w-40 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            {decisionOpts.map((d) => (
              <label key={d} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                <input type="checkbox" className="accent-brand-600" checked={decisions.has(d)} onChange={() => toggleDecision(d)} />
                <span className="text-slate-600">{d}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="relative">
          <button
            type="button"
            onClick={(e) => (e.currentTarget.nextElementSibling as HTMLElement).classList.toggle('hidden')}
            className={`flex items-center gap-1 rounded-lg border px-3 py-2 text-sm ${statuses.size ? 'border-brand-200 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'}`}
          >
            审核状态{statuses.size > 0 && <span className="rounded-full bg-brand-600 px-1.5 text-xs text-white">{statuses.size}</span>}<span className="text-slate-400">▾</span>
          </button>
          <div className="hidden absolute z-50 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
            {statusOpts.map((s) => (
              <label key={s} className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-slate-50">
                <input type="checkbox" className="accent-brand-600" checked={statuses.has(s)} onChange={() => toggleStatus(s)} />
                <span className="text-slate-600">{s}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 text-sm text-slate-500">
          共 <span className="font-semibold text-slate-700">{total}</span> 笔
          <button onClick={onReset} className="rounded-lg px-3 py-2 text-brand-600 hover:bg-brand-50">重置</button>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 border-t border-dashed border-slate-100 pt-3">
        <span className="text-xs text-slate-400">快捷筛选：</span>
        <SingleSelect label="欺诈分" options={fraudOpts} value={fraudQuick} onChange={setFraudQuick} />
        <SingleSelect label="信用分" options={creditOpts} value={creditQuick} onChange={setCreditQuick} />
        <SingleSelect label="申请额度" options={amountOpts} value={amountQuick} onChange={setAmountQuick} />
        <div className="flex items-center gap-1">
          {([['all', '全部'], ['today', '今天'], ['7', '近7天'], ['30', '近30天']] as const).map(([v, t]) => (
            <button
              key={v}
              onClick={() => setTimeRange(v)}
              className={`rounded-lg px-2.5 py-1.5 text-xs ${timeRange === v ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ============ 详情视图 ============ */

function DetailView({
  row,
  onBack,
  onReview,
  onRelated,
  onAddReview,
  onReport,
  extraReviews,
  flash,
}: {
  row: AppRow
  onBack: () => void
  onReview: () => void
  onRelated: () => void
  onAddReview: () => void
  onReport: () => void
  extraReviews: ReviewEntry[]
  flash: (msg: string) => void
}) {
  const [showReviews, setShowReviews] = useState(false)
  const [expandedScores, setExpandedScores] = useState<Set<string>>(new Set())
  const toggleScore = (n: string) =>
    setExpandedScores((prev) => {
      const next = new Set(prev)
      if (next.has(n)) next.delete(n)
      else next.add(n)
      return next
    })
  const [expandedRules, setExpandedRules] = useState<Set<number>>(new Set())
  const toggleRule = (i: number) =>
    setExpandedRules((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  const [deviceRiskOpen, setDeviceRiskOpen] = useState<string | null>(null)
  const deviceApps = getDeviceApps(row)

  type MaterialFile = { name: string; type: 'image' | 'pdf' | 'word' | 'excel' | 'video' }
  const materials: { name: string; status: 'pass' | 'fail' | 'missing'; submitted: string; result: string; files: MaterialFile[] }[] = [
    { name: '身份证正面', status: 'pass', submitted: '已上传 · 2026-07-18 10:22', result: 'OCR 识别一致，证件在有效期内，比对通过。', files: [{ name: '身份证正面.jpg', type: 'image' }] },
    { name: '身份证反面', status: 'pass', submitted: '已上传 · 2026-07-18 10:22', result: '证件信息完整清晰，比对通过。', files: [{ name: '身份证反面.jpg', type: 'image' }, { name: '身份证复印件.docx', type: 'word' }] },
    { name: '活体检测', status: 'pass', submitted: '已完成 · 2026-07-18 10:23', result: '人脸活体与身份证照片相似度 98.7%，比对通过。', files: [{ name: '活体检测.jpg', type: 'image' }, { name: '活体检测录像.mp4', type: 'video' }] },
    { name: '银行卡', status: 'fail', submitted: '已上传 · 2026-07-18 10:24', result: '银行卡预留手机号与申请手机号不一致，比对不通过。', files: [{ name: '银行卡照片.jpg', type: 'image' }, { name: '绑定授权书.pdf', type: 'pdf' }, { name: '银行流水.xlsx', type: 'excel' }] },
    { name: '收入证明', status: 'missing', submitted: '未提交', result: '缺少收入证明材料，无法核验收入水平。', files: [] },
  ]
  const materialMeta = {
    pass: { icon: '✓', box: 'bg-emerald-50 text-emerald-600 ring-emerald-200', panel: 'bg-emerald-50/60' },
    fail: { icon: '✕', box: 'bg-rose-50 text-rose-600 ring-rose-200', panel: 'bg-rose-50/60' },
    missing: { icon: '—', box: 'bg-slate-100 text-slate-400 ring-slate-200', panel: 'bg-slate-50' },
  } as const
  const [docTab, setDocTab] = useState(0)
  const [preview, setPreview] = useState<MaterialFile | null>(null)
  const activeDoc = materials[docTab]
  const activeMeta = materialMeta[activeDoc.status]
  const fileMeta: Record<MaterialFile['type'], { icon: string; label: string; color: string }> = {
    image: { icon: '🖼', label: '图片', color: 'text-sky-600 bg-sky-50' },
    pdf: { icon: '📄', label: 'PDF', color: 'text-rose-600 bg-rose-50' },
    word: { icon: '📝', label: 'Word', color: 'text-blue-600 bg-blue-50' },
    excel: { icon: '📊', label: 'Excel', color: 'text-emerald-600 bg-emerald-50' },
    video: { icon: '🎬', label: '视频', color: 'text-violet-600 bg-violet-50' },
  }
  const idx = Number(row.id.replace(/\D/g, '')) || 0
  const detail = useMemo(() => getDetail(row, idx), [row, idx])
  // 命中规则默认展开、未命中默认折叠
  useEffect(() => {
    setExpandedRules(new Set(detail.rules.map((r, i) => (r.hit ? i : -1)).filter((i) => i >= 0)))
  }, [detail])
  const allScoresOpen = expandedScores.size === detail.scores.length
  const g = rowDecisionGroup(row)
  const meta = decisionGroupMeta[g]

  const reviewCount = detail.reviews.length
  const reviewBtn = reviewCount > 0 ? (
    <button
      type="button"
      onClick={() => setShowReviews(true)}
      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-50"
    >
      人工复核记录（{reviewCount}）
    </button>
  ) : (
    <button
      type="button"
      disabled
      title="暂无复核记录"
      className="inline-flex cursor-not-allowed items-center gap-1 rounded-lg border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm text-slate-300"
    >
      人工复核记录（0）
    </button>
  )

  const cards: { id: string; label: string; alert: boolean }[] = [
    { id: 'conclusion', label: '决策结论', alert: detail.conclusion.result === '拒绝' },
    { id: 'decision', label: '决策说明', alert: false },
    { id: 'next', label: '下一步操作', alert: false },
    { id: 'base', label: '基础信息', alert: false },
    { id: 'score', label: '风险评分', alert: detail.scores.some((s) => s.kind === 'red') },
    { id: 'rule', label: '命中规则与模型', alert: detail.rules.some((r) => r.level === 'red') },
    { id: 'material', label: '证件与材料', alert: materials.some((m) => m.status === 'fail') },
    { id: 'device', label: '设备与环境', alert: detail.deviceRisk.some((t) => !t.includes('未见明显异常')) },
  ]

  return (
    <div className="space-y-6">
      <DetailHeader
        title={`申请编号 · ${row.id}`}
        backLabel="← 返回列表"
        onBack={onBack}
      />

      <div className="lg:flex lg:gap-6">
        <div className="min-w-0 flex-1 space-y-6">
          {/* ===== 决策结论 + 决策流路径（合并卡片，核心，最前） ===== */}
      <Panel id="conclusion" title="智能决策结论与复核结果" actions={reviewBtn}>
     
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
          {[
            { l: '决策结果', tag: <DecisionTag kind={toKind(decisionGroupMeta[g].kind)} soft={g === '处理中' || g === '人工复核'}>{g}</DecisionTag> },
            (g === '准入' || g === '拒绝')
              ? { l: '审核状态', v: '--' }
              : { l: '审核状态', tag: <StatusTag kind={auditStatusMeta[row.auditStatus].kind}>{row.auditStatus === '待人工复核' ? '待复核' : row.auditStatus}</StatusTag> },
            { l: '审核人', v: reviewerText(row) },
            { l: '审核时间', v: detail.conclusion.time },
            { l: '最终额度', v: detail.conclusion.finalAmount },
            { l: '建议利率', v: detail.conclusion.finalRate },
          ].map((f) => (
            <div key={f.l} className="rounded-xl bg-slate-50 px-3 py-2">
              <p className="text-xs text-slate-400">{f.l}</p>
              <p className="mt-0.5 font-semibold text-slate-700">{f.v}</p>
              {f.tag && <div className="mt-1">{f.tag}</div>}
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-400">决策流路径</p>
        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
          {detail.flow.map((n, i) => {
            const tone =
              n.state === 'done'
                ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
                : n.state === 'active'
                ? 'border-2 border-amber-400 bg-amber-50 text-amber-800 shadow-sm'
                : n.state === 'disabled'
                ? 'border border-dashed border-slate-200 bg-slate-50 text-slate-300 opacity-70'
                : 'border border-transparent bg-slate-100 text-slate-400'
            const mark =
              n.state === 'active' ? (
                <span className="ml-1 rounded bg-amber-400 px-1 text-[10px] font-medium text-white">当前</span>
              ) : n.state === 'disabled' ? (
                <span className="ml-1" title="自动处理阶段，不涉及人工复核">🔒</span>
              ) : null
            return (
              <span key={n.name} className="flex items-center gap-1.5">
                <span className={`inline-flex items-center rounded-lg px-2 py-1 ${tone}`}>
                  {n.name}{n.note ? `（${n.note}）` : ''}{mark}
                </span>
                {i < detail.flow.length - 1 && <span className="text-slate-300">→</span>}
              </span>
            )
          })}
        </div>
      </Panel>

      {/* ===== 审核方式 / 人工复核（按决策结果区分展示） ===== */}
      {(() => {
        // 系统审核：由引擎直接完成准入 / 拒绝决策，未进入人工复核
        if (g === '准入' || g === '拒绝') {
          return (
            <Panel id="decision" title="决策说明">
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                <p className="font-medium text-slate-700">系统审核 · 未进入人工复核</p>
                <p className="mt-1">该申请由自动审核引擎直接完成准入 / 拒绝决策（反欺诈 → 信用评估 → 决策输出），不触发人工复核流程，无复核员介入，亦无人工复核留痕。</p>
                <p className="mt-1 text-xs text-slate-400">决策流路径与结论见上方「智能决策结论与复核结果」。</p>
              </div>
            </Panel>
          )
        }
        // 处理中（待审核 / 审核中）：尚未形成结论，无复核留痕
        if (g === '处理中') {
          return (
            <Panel id="decision" title="决策说明">
              <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                <p className="font-medium text-slate-700">处理中 · 尚未形成结论</p>
                <p className="mt-1">该申请由自动审核引擎处理中（反欺诈 → 信用评估 → 决策输出），暂未形成最终结论，审核人显示为「--」，亦未进入人工复核。</p>
                <p className="mt-1 text-xs text-slate-400">决策流路径与结论见上方「智能决策结论与复核结果」。</p>
              </div>
            </Panel>
          )
        }
        // 人工复核（待复核 / 已通过 / 已拒绝 / 已关闭）：多轮复核记录改为卡片右上角按钮入口
        return null
      })()}

      {/* ===== 下一步操作 ===== */}
      <Panel id="next" title="下一步操作" desc={`当前决策结果：${g}（${meta.desc}）`}>
        <NextStepPanel group={g} row={row} onReport={onReport} onReview={onReview} onRelated={onRelated} onAddReview={onAddReview} />
      </Panel>

      {/* ===== 基础信息（含关联信息） ===== */}
      <Panel id="base" title="基础信息">
        <dl className="grid grid-cols-2 gap-y-3 text-sm md:grid-cols-4">
          {detail.base.map((b) => (
            <div key={b.label}>
              <dt className="text-xs text-slate-400">{b.label}</dt>
              <dd className="mt-0.5 text-slate-700">{b.value}</dd>
            </div>
          ))}
        </dl>
        <div className="my-4 h-px bg-slate-100" />
        <p className="mb-2 text-xs font-medium text-slate-400">关联信息</p>
        <dl className="grid grid-cols-3 gap-y-3 text-sm">
          {detail.association.map((a) => (
            <div key={a.label}>
              <dt className="text-xs text-slate-400">{a.label}</dt>
              <dd className="mt-0.5 font-medium text-slate-700">{a.value}</dd>
            </div>
          ))}
        </dl>
        <button onClick={onRelated} className="mt-3 text-xs text-brand-600 hover:underline">查看关联进件 / 同设备历史 →</button>
      </Panel>

      {/* ===== 风险评分 ===== */}
      <Panel
        id="score"
        title="风险评分"
        desc="统一风险指数 + 欺诈分 / 信用分 / 综合分（绿=安全 · 黄=预警 · 红=高风险）"
        actions={
          <button
            type="button"
            onClick={() => setExpandedScores(allScoresOpen ? new Set() : new Set(detail.scores.map((s) => s.name)))}
            className="text-xs text-brand-600 hover:underline"
          >
            {allScoresOpen ? '全部收起' : '全部展开'}
          </button>
        }
      >
        {/* 统一风险指数 RiskRaw */}
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400">统一风险指数 · RiskRaw</p>
              <div className="mt-0.5 flex items-baseline gap-2">
                <span className={`text-3xl font-bold ${detail.riskIndex.kind === 'red' ? 'text-rose-600' : detail.riskIndex.kind === 'amber' ? 'text-amber-600' : 'text-emerald-600'}`}>{detail.riskIndex.value}</span>
                <span className="text-xs text-slate-400">/ 100</span>
                <Badge kind={detail.riskIndex.kind}>{detail.riskIndex.level}风险</Badge>
              </div>
            </div>
            <span className="text-xs font-medium text-rose-500">↑ 越高越危险</span>
          </div>
          <ScoreBar
            value={detail.riskIndex.value}
            floor={0}
            max={100}
            kind={detail.riskIndex.kind}
            marks={[{ at: 30, label: '预警', color: 'amber' }, { at: 60, label: '决策', color: 'red' }]}
          />
          <p className="mt-3 text-xs text-slate-400">由欺诈分与命中规则加权融合，用于统一衡量本次申请的整体风险水平。</p>
        </div>

        {/* 三张分数卡 */}
        <div className="mt-3 space-y-3">
          {detail.scores.map((s) => {
            const open = expandedScores.has(s.name)
            return (
              <div key={s.name} className="rounded-xl border border-slate-200 p-3">
                <div className="flex flex-wrap items-center justify-between gap-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm font-medium text-slate-700">{s.name}</span>
                    <span className="text-xs text-slate-400">{s.code}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-lg font-semibold ${s.kind === 'red' ? 'text-rose-600' : s.kind === 'amber' ? 'text-amber-600' : 'text-emerald-600'}`}>{s.value}</span>
                    <Badge kind={s.kind}>{s.level}</Badge>
                    <span className={`text-xs font-medium ${s.dirKind === 'red' ? 'text-rose-500' : 'text-emerald-600'}`}>{s.direction}</span>
                    <button
                      type="button"
                      onClick={() => toggleScore(s.name)}
                      className="rounded-md px-1.5 py-0.5 text-xs text-brand-600 ring-1 ring-inset ring-brand-200 transition hover:bg-brand-50"
                    >
                      {open ? '收起 ▴' : '详情 ▾'}
                    </button>
                  </div>
                </div>
                <ScoreBar value={s.value} floor={s.floor} max={s.max} kind={s.kind} marks={s.marks} />
                <p className="mt-1 text-xs text-slate-400">区间 {s.floor} ~ {s.max} · 阈值 {s.threshold}</p>
                {open && (
                  <div className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3 text-sm">
                    <p className="text-slate-600">{s.summary}</p>
                    {s.factors && (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-slate-400">
                            <th className="py-1 pr-2 font-normal">评估项</th>
                            <th className="py-1 pr-2 font-normal">用户情况</th>
                            <th className="py-1 pr-2 font-normal">得分</th>
                            <th className="py-1 pr-2 font-normal">评分标准</th>
                            <th className="py-1 text-right font-normal">风险等级</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.factors.map((f) => (
                            <tr key={f.name} className="border-t border-slate-200 align-top">
                              <td className="py-1 pr-2 text-slate-700">{f.name}</td>
                              <td className="py-1 pr-2 text-slate-600">{f.userValue}</td>
                              <td className="py-1 pr-2 text-slate-600">{f.score}</td>
                              <td className="py-1 pr-2 text-slate-400">{f.standard}</td>
                              <td className="py-1 text-right"><Badge kind={lvlKind(f.level)}>{f.level}</Badge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    {s.components && (
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-left text-slate-400">
                            <th className="py-1 pr-2 font-normal">构成项</th>
                            <th className="py-1 pr-2 font-normal">用户情况</th>
                            <th className="py-1 pr-2 font-normal">贡献值</th>
                            <th className="py-1 pr-2 font-normal">说明</th>
                            <th className="py-1 text-right font-normal">方向</th>
                          </tr>
                        </thead>
                        <tbody>
                          {s.components.map((c) => (
                            <tr key={c.name} className="border-t border-slate-200 align-top">
                              <td className="py-1 pr-2 text-slate-700">{c.name}</td>
                              <td className="py-1 pr-2 text-slate-600">{c.userValue}</td>
                              <td className="py-1 pr-2 text-slate-600">{c.value}（{c.weight}）</td>
                              <td className="py-1 pr-2 text-slate-400">{c.standard}</td>
                              <td className={`py-1 text-right ${c.direction.includes('拉低') ? 'text-rose-500' : c.direction.includes('拉高') ? 'text-emerald-600' : 'text-slate-400'}`}>{c.direction}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                    <p className="text-right text-[11px] text-slate-400">{s.model} · {s.calcTime}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Panel>

      {/* ===== 命中规则与模型 ===== */}
      <Panel id="rule" title="命中规则与模型" desc="命中规则默认展开、未命中默认折叠；高权重命中项以红色强调">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="py-1.5 pr-2">规则 / 模型</th>
                <th className="py-1.5 pr-2">命中状态</th>
                <th className="py-1.5 pr-2">用户情况</th>
                <th className="py-1.5 pr-2">阈值标准</th>
                <th className="py-1.5 pr-2">权重</th>
                <th className="py-1.5 pr-2">对决策影响</th>
                <th className="py-1.5 text-center">操作</th>
              </tr>
            </thead>
            <tbody>
              {detail.rules.map((r, i) => {
                const open = expandedRules.has(i)
                const strong = r.hit && r.weight === '高'
                return (
                  <Fragment key={r.name}>
                    <tr className={`border-t border-slate-100 align-top ${strong ? 'bg-rose-50/50' : ''}`}>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-1.5">
                          {strong && <span className="inline-block h-3.5 w-0.5 rounded bg-rose-500" />}
                          <span className="text-slate-700">{r.name}</span>
                          {r.weight === '高' && <span className="rounded bg-rose-100 px-1 text-[10px] leading-4 text-rose-600">高权重</span>}
                        </div>
                      </td>
                      <td className="py-2 pr-2"><Badge kind={r.level}>{r.hitText}</Badge></td>
                      <td className="py-2 pr-2 text-slate-600">{r.userValue}</td>
                      <td className="py-2 pr-2 text-slate-400">{r.threshold}</td>
                      <td className="py-2 pr-2 text-slate-500">{r.weight}</td>
                      <td className={`py-2 pr-2 ${r.hit ? (r.weight === '高' ? 'font-medium text-rose-600' : 'text-amber-600') : 'text-slate-400'}`}>{r.impact}</td>
                      <td className="py-2 text-right">
                        <button
                          type="button"
                          onClick={() => toggleRule(i)}
                          className="rounded-md px-2 py-0.5 text-xs text-brand-600 ring-1 ring-inset ring-brand-200 transition hover:bg-brand-50"
                        >
                          {open ? '收起' : '详情'}
                        </button>
                      </td>
                    </tr>
                    {open && (
                      <tr className="border-t border-slate-50 bg-slate-50/60">
                        <td colSpan={7} className="px-1.5 py-3">
                          <div className="space-y-2 rounded-xl bg-white p-3 text-xs leading-relaxed text-slate-600 ring-1 ring-inset ring-slate-100">
                            <RuleSection title="规则说明" text={r.desc} />
                            <RuleSection title="数据来源" text={r.dataSource} />
                            <RuleSection title="风险含义" text={r.risk} />
                            <RuleSection title="复核建议" text={r.advice} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* ===== 证件与材料 ===== */}
      <Panel id="material" title="证件与材料">
        {/* Tab 头：保持标签样式，✓通过绿 / ✕不通过红 / —缺少灰 */}
        <div className="flex flex-wrap gap-2 text-xs">
          {materials.map((m, i) => {
            const meta = materialMeta[m.status]
            return (
              <button
                key={m.name}
                type="button"
                onClick={() => setDocTab(i)}
                className={`rounded-lg px-2.5 py-1 ring-1 ring-inset transition ${meta.box} ${
                  docTab === i ? 'ring-2 font-medium' : 'opacity-80 hover:opacity-100'
                }`}
              >
                {meta.icon} {m.name}
              </button>
            )
          })}
        </div>
        {/* Tab 内容：提交的资料 + 结果 + 材料预览 */}
        <div className={`mt-3 rounded-xl p-3 text-sm ${activeMeta.panel}`}>
          <div className="flex items-center justify-between">
            <span className="font-medium text-slate-700">{activeDoc.name}</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ring-inset ${activeMeta.box}`}>
              {activeMeta.icon} {activeDoc.status === 'pass' ? '比对通过' : activeDoc.status === 'fail' ? '比对不通过' : '缺少资料'}
            </span>
          </div>
          <dl className="mt-2 space-y-1.5">
            <div className="flex gap-2">
              <dt className="shrink-0 text-slate-400">提交的资料</dt>
              <dd className="text-slate-600">{activeDoc.submitted}</dd>
            </div>
            <div className="flex gap-2">
              <dt className="shrink-0 text-slate-400">比对结果</dt>
              <dd className="text-slate-600">{activeDoc.result}</dd>
            </div>
          </dl>
          {/* 证明材料预览：图片 / 视频直接显示，其它文档点击预览 */}
          <div className="mt-3 border-t border-slate-200/70 pt-3">
            <p className="mb-2 text-xs text-slate-400">证明材料（图片、视频可直接查看，其余文档点击预览）</p>
            {activeDoc.files.length === 0 ? (
              <p className="text-xs text-slate-400">缺少资料，暂无可预览的证明材料。</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {activeDoc.files.map((f) => {
                  if (f.type === 'image') {
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => setPreview(f)}
                        title={f.name}
                        className="group w-36 overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:border-brand-300 hover:shadow-sm"
                      >
                        <img src={svgDataUri(materialPreviewSvg(f.name))} alt={f.name} className="h-24 w-full object-cover" />
                        <span className="block truncate px-2 py-1.5 text-xs text-slate-600 group-hover:text-brand-600">{f.name}</span>
                      </button>
                    )
                  }
                  if (f.type === 'video') {
                    return (
                      <button
                        key={f.name}
                        type="button"
                        onClick={() => setPreview(f)}
                        title={f.name}
                        className="group relative w-36 overflow-hidden rounded-xl border border-slate-200 bg-black text-left transition hover:border-brand-300 hover:shadow-sm"
                      >
                        <img src={svgDataUri(materialPreviewSvg(f.name))} alt={f.name} className="h-24 w-full object-cover opacity-90" />
                        <span className="absolute inset-0 grid place-items-center">
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-white/25 backdrop-blur">
                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-white" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
                          </span>
                        </span>
                        <span className="block truncate bg-white px-2 py-1.5 text-xs text-slate-600 group-hover:text-brand-600">{f.name}</span>
                      </button>
                    )
                  }
                  const fm = fileMeta[f.type]
                  return (
                    <button
                      key={f.name}
                      type="button"
                      onClick={() => setPreview(f)}
                      className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left text-xs transition hover:border-brand-200 hover:bg-brand-50"
                    >
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-md ${fm.color}`}>{fm.icon}</span>
                      <span className="max-w-[140px] truncate text-slate-600">{f.name}</span>
                      <span className="text-brand-600">预览</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* 材料预览弹窗：图片 / 视频直接渲染，其它文档走在线预览 */}
        <Modal open={!!preview} onClose={() => setPreview(null)} title={preview ? `材料预览 · ${preview.name}` : '材料预览'}>
          {preview && preview.type === 'image' ? (
            <img
              src={svgDataUri(materialPreviewSvg(preview.name))}
              alt={preview.name}
              className="w-full rounded-xl border border-slate-100"
            />
          ) : preview && preview.type === 'video' ? (
            <video
              className="w-full rounded-xl bg-black"
              controls
              poster={svgDataUri(materialPreviewSvg(preview.name))}
              src={MATERIAL_VIDEO_SRC}
            >
              您的浏览器不支持视频播放。
            </video>
          ) : (
            <div className="rounded-xl border border-slate-100 p-8 text-center">
              <div className="text-6xl">{preview ? fileMeta[preview.type].icon : '📄'}</div>
              <p className="mt-3 text-sm font-medium text-slate-700">{preview?.name}</p>
              <p className="mt-1 text-xs text-slate-400">{preview ? fileMeta[preview.type].label : ''} 文档 · 涉密内容仅支持在线预览，不支持下载</p>
              <div className="mt-5 flex justify-center gap-2">
                <Button variant="primary" onClick={() => flash('已开始在线预览')}>在线预览</Button>
              </div>
            </div>
          )}
        </Modal>
      </Panel>

      {/* ===== 设备与环境 ===== */}
      <Panel id="device" title="设备与环境">
        <dl className="space-y-2 text-sm">
          {detail.device.map((d) => (
            <div key={d.label} className="flex justify-between">
              <dt className="text-slate-400">{d.label}</dt>
              <dd className="text-slate-700">{d.value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-3 space-y-1">
          {/* 同设备近 30 天申请：红色状态、可展开、条数=按钮数字、列表非空 */}
          <button
            type="button"
            onClick={() => setDeviceRiskOpen(deviceRiskOpen === 'same-device' ? null : 'same-device')}
            className="flex items-center gap-1 text-left text-xs font-medium text-rose-600 underline-offset-2 hover:underline"
          >
            ● 同设备近 30 天申请 {deviceApps.length} 笔{' '}
            <span className="text-rose-400">{deviceRiskOpen === 'same-device' ? '▴' : '▾'}</span>
          </button>
          {deviceRiskOpen === 'same-device' && (
            <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="mb-2 text-xs font-medium text-slate-500">同设备近 30 天申请（{deviceApps.length} 笔）</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left text-slate-400">
                      <th className="py-1.5">进件编号</th>
                      <th className="py-1.5">产品</th>
                      <th className="py-1.5">渠道</th>
                      <th className="py-1.5">决策结果</th>
                      <th className="py-1.5">审核状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deviceApps.map((a) => (
                      <tr key={a.id} className="border-t border-slate-100">
                        <td className="py-1.5 font-mono text-slate-600">{a.id}</td>
                        <td className="py-1.5 text-slate-600">{a.product}</td>
                        <td className="py-1.5 text-slate-600">{a.channel}</td>
                        <td className="py-1.5"><Badge kind={(a.decision as BadgeVal).kind}>{a.decision.v}</Badge></td>
                        <td className="py-1.5"><StatusTag kind={auditStatusMeta[a.auditStatus].kind}>{a.auditStatus}</StatusTag></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 其余设备风险项（设备命中群控 / IP 归属不一致 / 环境正常） */}
          {detail.deviceRisk
            .filter((t) => !t.includes('同设备近 30 天申请'))
            .map((t, i) => (
              <p key={i} className={`text-xs ${t.includes('未见') ? 'text-emerald-600' : 'text-rose-600'}`}>● {t}</p>
            ))}
        </div>
      </Panel>

      {/* 返回顶部 */}
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        title="返回顶部"
        className="fixed bottom-6 right-6 z-30 grid h-11 w-11 place-items-center rounded-full bg-brand-600 text-white shadow-lg transition hover:bg-brand-700"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>

      {showReviews && (
        <ReviewRecordsDrawer row={row} reviews={[...extraReviews, ...detail.reviews]} onClose={() => setShowReviews(false)} />
      )}
        </div>

        {/* 右侧卡片导航：存在异常提示的卡片以红点标识（随页面滚动，置顶后固定） */}
        <nav className="hidden lg:block lg:w-44 lg:shrink-0">
          <div className="sticky top-32 flex flex-col gap-1">
            <p className="px-2 pb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400">页面导航</p>
            {cards.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  const el = document.getElementById(c.id)
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition ${
                  c.alert ? 'bg-rose-50 font-medium text-rose-600' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-700'
                }`}
              >
                {c.alert && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" />}
                <span className={c.alert ? '' : 'pl-3.5'}>{c.label}</span>
              </button>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

/* 人工复核记录抽屉（多轮） */
function ReviewRecordsDrawer({ row, reviews, onClose }: { row: AppRow; reviews: ReviewEntry[]; onClose: () => void }) {
  return (
    <Drawer open title={`人工复核记录 · ${row.id}`} onClose={onClose}>
      <p className="mb-4 text-xs text-slate-400">当前审核状态：{row.auditStatus}{row.auditStatus === '待人工复核' ? ' · 复核中（SLA 4h）' : ''}</p>
      <ol className="relative space-y-4 border-l border-slate-200 pl-5">
        {reviews.map((e, i) => (
          <li key={i} className="relative">
            <span className={`absolute -left-[1.42rem] top-1 h-3 w-3 rounded-full ring-2 ring-white ${e.fromStatus !== e.toStatus ? 'bg-brand-600' : e.internal ? 'bg-slate-400' : 'bg-emerald-500'}`} />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700">{e.party}</span>
              <span className={`rounded-md px-1.5 py-0.5 text-xs ${e.internal ? 'bg-slate-100 text-slate-500' : 'bg-emerald-50 text-emerald-600'}`}>{e.action}</span>
              <span className="text-xs text-slate-400">{e.time}</span>
              {e.fromStatus !== e.toStatus && (
                <span className="text-xs text-slate-400">{e.fromStatus} → {e.toStatus}</span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-600">{e.content}</p>
            {e.attachment && (
              <span className="mt-1 inline-block rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-500">📎 {e.attachment}</span>
            )}
          </li>
        ))}
        {row.auditStatus === '待人工复核' && (
          <li className="relative">
            <span className="absolute -left-[1.42rem] top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />
            <p className="text-sm text-amber-600">● 等待复核员提交最终结论（退回补充 / 挂起均保持本态）</p>
          </li>
        )}
      </ol>
    </Drawer>
  )
}

/* 下一步操作面板（按决策结果） */
function NextStepPanel({ group, row, onReport, onReview, onRelated, onAddReview }: { group: DecisionGroup; row: AppRow; onReport: () => void; onReview: () => void; onRelated: () => void; onAddReview: () => void }) {
  if (group === '处理中') {
    return (
      <div className="space-y-3 text-sm">
        <div className="rounded-xl bg-blue-50 p-3">
          <p className="font-medium text-blue-700">决策引擎处理中</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-600">
            <li>反欺诈识别 → 信用评估 → 决策输出，预计 86ms 内完成</li>
            <li>若综合评分临界，引擎将自动路由「转人工复核」</li>
          </ul>
        </div>
        <div className="flex gap-2">
          <button onClick={onRelated} className="text-xs text-brand-600 hover:underline self-center">查看关联进件 →</button>
        </div>
      </div>
    )
  }
  if (row.auditStatus === '待人工复核') {
    return (
      <div className="space-y-3 text-sm">
        <div className="rounded-xl bg-amber-50 p-3">
          <p className="font-medium text-amber-700">转人工复核</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-600">
            <li>复核员查看申请 + 审核详情，给出通过 / 拒绝 / 挂起结论并填理由</li>
            <li>系统分配复核员、启动复核 SLA 计时，结果回流决策引擎</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="primary" onClick={onAddReview}>添加复核记录</Button>
          <Button variant="primary" onClick={onReview}>复核</Button>
        </div>
      </div>
    )
  }
  if (row.auditStatus === '已通过') {
    return (
      <div className="space-y-3 text-sm">
        <div className="rounded-xl bg-brand-50/60 p-3">
          <p className="font-medium text-brand-700">面向客户</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-600">
            <li>查看授信通知，确认额度 / 利率</li>
            <li>签署电子合同，触发放款前置</li>
          </ul>
          <button onClick={onReport} className="mt-2 text-xs text-brand-600 hover:underline">查看授信合同 →</button>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="font-medium text-slate-700">面向风控 / 运营</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-5 text-slate-600">
            <li>监控首笔用信，配置额度生效</li>
            <li>写入额度系统，加入贷中监控名单</li>
          </ul>
        </div>
      </div>
    )
  }
  if (row.auditStatus === '已拒绝') {
    return (
      <div className="space-y-3 text-sm">
        <div className="rounded-xl bg-rose-50 p-3">
          <p className="font-medium text-rose-700">拒绝原因（合规须告知）</p>
          <p className="mt-1 text-slate-600">原因码 <span className="font-mono">{row.reasonCode}</span>：反欺诈评分超阈 / 多头借贷机构数偏高，综合评估未达准入标准。</p>
          <p className="mt-1 text-xs text-slate-400">对客话术预览：很抱歉，本次申请暂未通过，建议 30 天后补充资质重新申请。</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onReport}>查看拒绝报告</Button>
          <button onClick={onRelated} className="text-xs text-brand-600 hover:underline self-center">查看关联进件 →</button>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-3 text-sm">
      <div className="rounded-xl bg-slate-100 p-3">
        <p className="font-medium text-slate-700">已关闭 / 归档</p>
        <p className="mt-1 text-slate-600">该申请已关闭（过期 / 撤单 / 客户放弃），归档且不可再操作。如需继续，请重新发起申请。</p>
      </div>
    </div>
  )
}

/* ============ 报告抽屉 ============ */
function ReportDrawer({ row, onClose, forceOpen }: { row: AppRow | null; onClose: () => void; forceOpen?: boolean }) {
  if (!row && !forceOpen) return null
  const idx = row ? Number(row.id.replace(/\D/g, '')) || 0 : 0
  const detail = row ? getDetail(row, idx) : null
  const report = row && detail ? getReport(row, detail) : null
  return (
    <Drawer open={!!row || !!forceOpen} onClose={onClose} title={row ? `自动审核报告 · ${row.id}` : '自动审核报告'} width="max-w-2xl">
      {row && report && (
        <div className="space-y-5">
          <div className="rounded-xl bg-slate-50 p-3 text-sm">
            <p className="text-slate-500">报告版本 v2.3 · 生成时间 2026-07-19 · 产品 <span className="font-medium text-slate-700">{row.product}</span></p>
            <p className="mt-1 text-xs text-brand-600">差异化侧重：{report.emphasis}</p>
          </div>
          {report.modules.map((m) => (
            <div key={m.title}>
              <h3 className="mb-1.5 text-sm font-semibold text-ink-900">{m.title}</h3>
              <ul className="space-y-1 text-sm text-slate-600">
                {m.items.map((it, i) => (
                  <li key={i} className="flex gap-2"><span className="text-slate-300">·</span><span>{it}</span></li>
                ))}
              </ul>
            </div>
          ))}
          <div className="rounded-xl bg-brand-50/60 p-3 text-sm">
            <p className="font-medium text-brand-700">决策建议</p>
            <p className="mt-1 text-slate-600">{report.advice}</p>
          </div>
        </div>
      )}
    </Drawer>
  )
}

/* ============ 复核弹窗（与列表页一致） ============ */
function ReviewModal({
  row,
  onClose,
  onSubmit,
}: {
  row: AppRow | null
  onClose: () => void
  onSubmit: (v: { conclusion: '通过' | '拒绝' | '挂起'; reason: string; finalAmount: string; finalRate: string }) => void
}) {
  const [conclusion, setConclusion] = useState<'通过' | '拒绝' | '挂起'>('通过')
  const [reason, setReason] = useState('')
  const [finalAmount, setFinalAmount] = useState('')
  const [finalRate, setFinalRate] = useState('')
  useEffect(() => {
    if (!row) return
    const s = suggestFor(row)
    setConclusion('通过')
    setReason('')
    setFinalAmount(s.amount)
    setFinalRate(s.rate)
  }, [row])
  if (!row) return null
  return (
    <Modal open={!!row} onClose={onClose} title={`人工复核 · ${row.id}`} footer={<>
      <Button variant="ghost" onClick={onClose}>取消</Button>
      <Button variant="primary" disabled={!reason.trim()} onClick={() => onSubmit({ conclusion, reason, finalAmount, finalRate })}>提交结论</Button>
    </>}>
      <div className="space-y-4 text-sm">
        <div>
          <p className="mb-2 text-xs text-slate-400">复核结论（必选）</p>
          <div className="flex gap-2">
            {(['通过', '拒绝', '挂起'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setConclusion(c)}
                className={`rounded-lg border px-4 py-2 ${conclusion === c ? 'border-brand-300 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-2 text-xs text-slate-400">最终额度（系统建议，可修改）</p>
            <input
              value={finalAmount}
              onChange={(e) => setFinalAmount(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
            />
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-400">建议利率（系统建议，可修改）</p>
            <input
              value={finalRate}
              onChange={(e) => setFinalRate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
            />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-400">复核理由（必填，留痕审计）</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="请填写本次复核的依据与结论说明…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
      </div>
    </Modal>
  )
}

/* ============ 添加复核记录弹窗 ============ */
function ReviewRecordModal({
  row,
  onClose,
  onSubmit,
}: {
  row: AppRow | null
  onClose: () => void
  onSubmit: (v: { party: string; action: string; content: string; attachment: string; internal: boolean; finalAmount: string; finalRate: string }) => void
}) {
  const [party, setParty] = useState('复核员')
  const [action, setAction] = useState('补充材料请求')
  const [content, setContent] = useState('')
  const [attachment, setAttachment] = useState('')
  const [internal, setInternal] = useState(true)
  const [finalAmount, setFinalAmount] = useState('')
  const [finalRate, setFinalRate] = useState('')
  useEffect(() => {
    if (!row) return
    const s = suggestFor(row)
    setParty('复核员')
    setAction('补充材料请求')
    setContent('')
    setAttachment('')
    setInternal(true)
    setFinalAmount(s.amount)
    setFinalRate(s.rate)
  }, [row])
  if (!row) return null
  return (
    <Modal open={!!row} onClose={onClose} title={`添加复核记录 · ${row.id}`} footer={<>
      <Button variant="ghost" onClick={onClose}>取消</Button>
      <Button variant="primary" disabled={!content.trim()} onClick={() => onSubmit({ party, action, content, attachment, internal, finalAmount, finalRate })}>提交记录</Button>
    </>}>
      <div className="space-y-4 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="mb-2 text-xs text-slate-400">复核人员</p>
            <input
              value={party}
              onChange={(e) => setParty(e.target.value)}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
            />
          </div>
          <div>
            <p className="mb-2 text-xs text-slate-400">动作类型</p>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-brand-300"
            >
              <option>补充材料请求</option>
              <option>材料提交</option>
              <option>电话核实</option>
              <option>提交结论</option>
              <option>转主管</option>
              <option>备注</option>
            </select>
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-slate-400">复核内容（必填，留痕审计）</p>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="请填写本次复核记录的内容说明…"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-300"
          />
        </div>
        
        <div>
          <p className="mb-2 text-xs text-slate-400">附件上传（涉密系统仅留痕，不支持下载）</p>
          <input
            type="file"
            onChange={(e) => setAttachment(e.target.files?.[0]?.name ?? '')}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-500 outline-none focus:border-brand-300"
          />
          {attachment && <p className="mt-1 text-xs text-slate-400">已选附件：{attachment}</p>}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500">
          <input type="checkbox" checked={internal} onChange={(e) => setInternal(e.target.checked)} />
          仅风控内部可见（不对客）
        </label>
      </div>
    </Modal>
  )
}

/* ============ 关联进件 / 同设备历史 弹窗（Tab 切换） ============ */
function RelatedModal({ row, onClose, onPick }: { row: AppRow | null; onClose: () => void; onPick: (id: string) => void }) {
  const [tab, setTab] = useState<'rel' | 'device'>('rel')
  const related = useMemo(() => (row ? getRelatedApps(row) : []), [row])
  const deviceHist = useMemo(() => (row ? getDeviceApps(row) : []), [row])
  if (!row) return null
  const list = tab === 'rel' ? related : deviceHist
  return (
    <Modal open={!!row} onClose={onClose} title={`关联进件 / 同设备历史 · ${row.name}`} footer={<Button variant="ghost" onClick={onClose}>关闭</Button>}>
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setTab('rel')}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${tab === 'rel' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          关联进件（{related.length}）
        </button>
        <button
          type="button"
          onClick={() => setTab('device')}
          className={`rounded-lg px-3 py-1.5 text-sm transition ${tab === 'device' ? 'bg-brand-50 text-brand-700' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          同设备历史（{deviceHist.length}）
        </button>
      </div>
      <p className="mb-3 text-xs text-slate-400">同设备 / 同定位（{row.city}）的历史申请，点击可跳转查看。</p>
      <div className="space-y-2">
        {list.map((r) => (
          <button key={r.id} onClick={() => onPick(r.id)} className="flex w-full items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50">
            <span className="font-medium text-brand-600">{r.id}</span>
            <span className="text-slate-500">{r.product} · {r.channel}</span>
            <StatusTag kind={auditStatusMeta[r.auditStatus].kind}>{r.auditStatus}</StatusTag>
          </button>
        ))}
        {list.length === 0 && <p className="py-4 text-center text-sm text-slate-400">暂无数据</p>}
      </div>
    </Modal>
  )
}

/* ============ 小组件 ============ */
function ScorePill({ value, high, low }: { value: number; high: number; low: number }) {
  const level = value >= high ? 'text-rose-600' : value >= low ? 'text-amber-600' : 'text-emerald-600'
  return <span className={`font-semibold ${level}`}>{value}</span>
}
function maskName(name: string): string {
  if (!name) return '-'
  return name.length <= 1 ? name : name[0] + '*' + name.slice(-1)
}
