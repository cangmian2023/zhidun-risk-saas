// 催贷管理 · 模块1 案件管理
// 页面：案件管理(列表) / 案件导入(分步向导弹窗) / 历史案件 / 案件详情页(复刻 HTML)
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzTabs, ZzTable, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea, ZzBadge, ZzStat, BLUE } from './zzUi'
import { ZZ_CASES, ZZ_CASE_NOTES, ZZ_HISTORY_CASES, money, zzCurrentRole, canOfflineRepay, zzDetailOf, zzCaseButtons, zzActivePtp, ZZ_GRAPH_PROFILES, ZZ_GRAPH_TAG_COLOR, type ZzCase } from './zzData'

type PageKey = string

const STAGE_LABEL: Record<string, string> = { M0: 'M0 未逾期', M1: 'M1 1-30天', M2: 'M2 31-90天', 'M3+': 'M3+ 90天+' }
const statusColor = (s: string) => s === '已结清' ? '#16A34A' : s === '委外' ? '#D97706' : s === '核销' ? '#9CA3AF' : s === '承诺还款' ? BLUE : '#DC2626'

interface LogEntry { time: string; operator: string; content: string }
const nowStr = () => new Date().toISOString().slice(0, 16).replace('T', ' ')

export function ZzCaseModule({ pageKey }: { pageKey: PageKey }) {
  if (pageKey === 'zz:cases-history') return <ZzCaseHistory />
  if (pageKey === 'zz:case-detail') return <ZzCaseDetailPage />
  return <ZzCaseList />
}

/* ===================== 自定义列定义 ===================== */
// def=true 为默认展示列；def=false 为自定义列（默认隐藏，按需开启）
const COLS = [
  { key: 'id', label: '案件ID', def: true },
  { key: 'name', label: '客户', def: true },
  { key: 'phone', label: '联系电话', def: true },
  { key: 'risk', label: '风险标签', def: true },
  { key: 'stage', label: '账龄', def: true },
  { key: 'total', label: '原始逾期总额', def: true },
  { key: 'remainTotal', label: '剩余待还总额', def: true },
  { key: 'owner', label: '处理人', def: true },
  { key: 'ptp', label: '生效PTP', def: true },
  { key: 'nextFollow', label: '下次跟进', def: true },
  { key: 'lastTouch', label: '最后催收', def: true },
  { key: 'principal', label: '逾期本金', def: false },
  { key: 'penalty', label: '逾期罚息', def: false },
  { key: 'remainPrincipal', label: '剩余本金', def: false },
  { key: 'remainPenalty', label: '剩余罚息', def: false },
] as const
type ColKey = typeof COLS[number]['key']
const STAGE_SHORT: Record<string, string> = { M0: 'M0', M1: 'M1', M2: 'M2', 'M3+': 'M3+' }
const STAGE_RANK: Record<string, number> = { 'M3+': 3, M2: 2, M1: 1, M0: 0 }
const CLOSED = new Set(['已结清', '核销', '诉讼结案'])

// 单元格：自定义列（本金/罚息/总额类）
function moneyCell(r: ZzCase, k: ColKey): any {
  if (['principal', 'penalty', 'total', 'remainPrincipal', 'remainPenalty', 'remainTotal'].includes(k as string))
    return money((r as any)[k] as number)
  return (r as any)[k]
}

// 风险标签组合（合并原 status/lost/outsource/litigation/paused/waiver）+ 图谱自动标签
function RiskTags({ c }: { c: ZzCase }) {
  const tags: { t: string; color: string }[] = []
  if (c.status === '委外') tags.push({ t: '委外', color: '#D97706' })
  else if (c.status === '催收中' || c.status === '承诺还款' || c.status === '待分案')
    tags.push({ t: c.status, color: c.status === '承诺还款' ? BLUE : '#DC2626' })
  if (c.paused) tags.push({ t: '暂停', color: '#6B7280' })
  if (c.litigation) tags.push({ t: '诉讼', color: '#DC2626' })
  if (c.lost) tags.push({ t: '失联', color: '#DC2626' })
  if (c.waiverPending) tags.push({ t: '减免中', color: '#D97706' })
  // 图谱自动打标（无需人工，零侵入注入列表）
  const gt = ZZ_GRAPH_PROFILES[c.id]?.tags
  if (gt) gt.forEach((t: any) => tags.push({ t, color: ZZ_GRAPH_TAG_COLOR[t] }))
  if (!tags.length) tags.push({ t: c.status, color: '#6B7280' })
  return <div className="flex flex-wrap gap-1">{tags.map((x, i) => <ZzBadge key={i} color={x.color}>{x.t}</ZzBadge>)}</div>
}

/* ---------------- 案件列表（在催逾期案件队列） ---------------- */
function ZzCaseList() {
  const nav = useNavigate()
  const role = zzCurrentRole()
  const showRepay = canOfflineRepay(role)

  const [q, setQ] = useState('')
  const [stage, setStage] = useState('')
  const [statuses, setStatuses] = useState<string[]>([])
  const [owner, setOwner] = useState('')
  const [ptpFilter, setPtpFilter] = useState('')
  const [remainMin, setRemainMin] = useState('')
  const [remainMax, setRemainMax] = useState('')
  const [quick, setQuick] = useState('全部')
  const [sort, setSort] = useState('stageDesc')
  const [rows, setRows] = useState<ZzCase[]>(ZZ_CASES)
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [repay, setRepay] = useState<ZzCase | null>(null)
  const [waiver, setWaiver] = useState<ZzCase | null>(null)
  const [ptpQuick, setPtpQuick] = useState<ZzCase | null>(null)
  const [batch, setBatch] = useState<{ action: string } | null>(null)
  const [logOpen, setLogOpen] = useState(false)
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [hidden, setHidden] = useState<Set<ColKey>>(new Set(COLS.filter((c) => !c.def).map((c) => c.key)))
  const [colPop, setColPop] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  const addLog = (content: string) => setLogs((l) => [{ time: nowStr(), operator: role + '（' + (JSON.parse(localStorage.getItem('zdrk_user') || '{}').name || '') + '）', content }, ...l])

  // 在催逾期队列：剔除已结案/核销/诉讼结案（统一进历史案件）
  const base = rows.filter((r) => !CLOSED.has(r.status))
  const statusMatch = (r: ZzCase) => {
    if (statuses.length === 0) return true
    for (const s of statuses) {
      if (s === '暂停' && r.paused) return true
      if (s === '诉讼' && r.litigation) return true
      if (s === '委外' && (r.status === '委外' || r.outsource)) return true
      if (s === r.status) return true
    }
    return false
  }
  const quickMatch = (r: ZzCase) =>
    quick === '全部' || (quick === '失联' ? r.lost : quick === '委外' ? (r.outsource || r.status === '委外') : quick === '诉讼' ? r.litigation : r.stage === quick)

  const filtered = base.filter((r) =>
    (!q || r.name.includes(q) || r.id.includes(q)) &&
    (!stage || r.stage === stage) &&
    statusMatch(r) &&
    (!owner || r.owner === owner) &&
    (ptpFilter === '' || (ptpFilter === 'active' ? zzActivePtp(r.id).kind === 'pending' : zzActivePtp(r.id).kind === 'none')) &&
    (remainMin === '' || r.remainTotal >= Number(remainMin)) &&
    (remainMax === '' || r.remainTotal <= Number(remainMax)) &&
    quickMatch(r))

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'remain') return b.remainTotal - a.remainTotal
    if (sort === 'lastTouch') return b.lastTouch.localeCompare(a.lastTouch)
    if (sort === 'stageAsc') return STAGE_RANK[a.stage] - STAGE_RANK[b.stage]
    return STAGE_RANK[b.stage] - STAGE_RANK[a.stage] // 默认账龄降序
  })

  const toggle = (id: string) => setSel((s) => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n })
  const visibleCols = COLS.filter((c) => !hidden.has(c.key))

  // 顶部统计卡片（仅统计在催未结案）
  const statOrig = base.reduce((s, r) => s + r.total, 0)
  const statRemain = base.reduce((s, r) => s + r.remainTotal, 0)
  const statLost = base.filter((r) => r.lost).length
  const statOut = base.filter((r) => r.outsource || r.status === '委外').length
  const statLit = base.filter((r) => r.litigation).length
  const statPtp = base.filter((r) => zzActivePtp(r.id).kind === 'pending').length

  const owners = Array.from(new Set(rows.map((r) => r.owner)))
  const quickTags = ['全部', 'M1', 'M2', 'M3+', '失联', '委外', '诉讼']

  // 批量按钮可用性
  const selRows = rows.filter((r) => sel.has(r.id))
  const unsupported = (pred: (r: ZzCase) => boolean) => selRows.filter((r) => !pred(r)).length
  const batchInfo = (action: string): { disabled: boolean; tip: string } => {
    if (sel.size === 0) return { disabled: true, tip: '请先勾选案件' }
    switch (action) {
      case '批量转移': {
        const bad = unsupported((r) => !CLOSED.has(r.status) && !r.outsource && !r.litigation && (r.status === '催收中' || r.status === '承诺还款' || r.paused))
        return bad ? { disabled: true, tip: `共勾选 ${sel.size} 条，其中 ${bad} 条（委外/诉讼/已结案）不可转移` } : { disabled: false, tip: '' }
      }
      case '批量暂停': {
        const bad = unsupported((r) => !CLOSED.has(r.status) && !r.litigation && (r.status === '催收中' || r.outsource))
        return bad ? { disabled: true, tip: `共勾选 ${sel.size} 条，其中 ${bad} 条（诉讼/已结案）不可暂停` } : { disabled: false, tip: '' }
      }
      case '批量恢复': {
        const ok = selRows.filter((r) => r.paused).length
        return ok ? { disabled: false, tip: '' } : { disabled: true, tip: `未勾选暂停中案件（共勾选 ${sel.size} 条）` }
      }
      case '批量分配': {
        const bad = unsupported((r) => !CLOSED.has(r.status) && !r.outsource && !r.litigation && r.status === '催收中')
        return bad ? { disabled: true, tip: `共勾选 ${sel.size} 条，其中 ${bad} 条（委外/诉讼/已结案）不可分配` } : { disabled: false, tip: '' }
      }
      default: return { disabled: false, tip: '' }
    }
  }
  const importDisabled = !showRepay
  const exportDisabled = sel.size === 0

  const reset = () => { setQ(''); setStage(''); setStatuses([]); setOwner(''); setPtpFilter(''); setRemainMin(''); setRemainMax(''); setQuick('全部'); setRows(ZZ_CASES); setSel(new Set()) }

  return (
    <ZzPage title="案件管理" crumb="催贷管理 / 案件管理" subtitle="在催逾期案件队列：检索、批量作业与大盘统计；已结案/核销/诉讼结案统一进入「历史案件」">
      {/* 顶部统计卡片（7 张） */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
        <ZzStat label="案件总数（不含已结清）" value={base.length} sub={`当前待处置 · 已选 ${sel.size} 笔`} tip="统计范围：未结案的在催逾期案件（不含已结清/核销/诉讼结案），数字随筛选联动" />
        <ZzStat label="原始逾期总额" value={money(statOrig)} accent="#6B7280" sub="立案时逾期本息（原始）" tip="原始逾期总额 = 立案时点逾期本金+罚息总和，不随还款变动" />
        <ZzStat label="当前待还总额" value={money(statRemain)} accent="#D97706" sub="扣除已还后剩余（重点）" tip="当前待还总额 = 原始总额 - 已还款，是坐席当前真正的催收目标" />
        <ZzStat label="失联案件" value={statLost} accent="#D97706" sub="无法触达借款人" tip="失联案件：近 N 次触达均未联系上本人及联系人的案件" />
        <ZzStat label="委外案件" value={statOut} accent="#D97706" sub="已委托第三方" tip="委外案件：已发起委外委托、由第三方机构承接催收" />
        <ZzStat label="诉讼案件" value={statLit} accent="#D97706" sub="已进入诉讼流程" tip="诉讼案件：已立案/进入诉讼流程的在催案件，列表中以浅红底色标识" />
        <ZzStat label="PTP待履约" value={statPtp} accent="#D97706" sub="存在未到期承诺" tip="PTP待履约：客户已口头承诺或签署协议、承诺还款日未到的案件数" />
      </div>

      <ZzFilterBar>
        <ZzField label="案件编号/客户"><ZzInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="输入编号或姓名" /></ZzField>
        <ZzField label="账龄"><ZzSelect value={stage} onChange={(e) => setStage(e.target.value)}><option value="">全部</option>{Object.keys(STAGE_LABEL).map((k) => <option key={k} value={k}>{STAGE_LABEL[k]}</option>)}</ZzSelect></ZzField>
        <ZzField label="处理人"><ZzSelect value={owner} onChange={(e) => setOwner(e.target.value)}><option value="">全部</option>{owners.map((o) => <option key={o} value={o}>{o}</option>)}</ZzSelect></ZzField>
        <ZzField label="案件状态（可多选）">
          <div className="flex flex-wrap gap-1">
            {['催收中', '承诺还款', '委外', '诉讼', '暂停'].map((s) => (
              <button key={s} onClick={() => setStatuses((x) => x.includes(s) ? x.filter((y) => y !== s) : [...x, s])}
                className={`rounded border px-2 py-0.5 text-xs ${statuses.includes(s) ? 'border-[#1677ff] bg-[#1677ff] text-white' : 'border-slate-300 text-gray-600 hover:border-[#1677ff]'}`}>{s}</button>
            ))}
          </div>
        </ZzField>
        <ZzField label="PTP状态"><ZzSelect value={ptpFilter} onChange={(e) => setPtpFilter(e.target.value)}><option value="">全部</option><option value="active">存在待履约PTP</option><option value="none">无有效PTP</option></ZzSelect></ZzField>
        <ZzField label="剩余待还(元)"><div className="flex items-center gap-1"><ZzInput style={{ width: 86 }} value={remainMin} onChange={(e) => setRemainMin(e.target.value)} placeholder="最小" /><span className="text-gray-400">~</span><ZzInput style={{ width: 86 }} value={remainMax} onChange={(e) => setRemainMax(e.target.value)} placeholder="最大" /></div></ZzField>
        <ZzBtn primary onClick={() => setRows([...rows])}>查询</ZzBtn>
        <ZzBtn onClick={reset}>重置</ZzBtn>
      </ZzFilterBar>

      {/* 快捷筛选标签（移除已结清 → 历史案件） */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-400">快捷筛选：</span>
        {quickTags.map((t) => (
          <button key={t} onClick={() => setQuick(t)} className={`rounded-full border px-3 py-1 text-xs ${quick === t ? 'border-[#1677ff] bg-[#1677ff] text-white' : 'border-slate-300 text-gray-600 hover:border-[#1677ff]'}`}>{t}</button>
        ))}
        <span className="ml-1 text-xs text-gray-400">已结清/核销/诉讼结案请到 →</span>
        <ZzBtn sm onClick={() => nav('/console/zz/cases-history')}>历史案件</ZzBtn>
      </div>

      <ZzCard title={<span>在催逾期案件（{sorted.length}）</span>}
        extra={<div className="flex flex-wrap items-center gap-2">
          <ZzBtn sm primary title={importDisabled ? '无导入权限（需管理/审核角色）' : ''} disabled={importDisabled} onClick={() => setImportOpen(true)}>案件导入</ZzBtn>
          <ZzBtn sm title={exportDisabled ? '请先勾选案件' : ''} disabled={exportDisabled} onClick={() => { alert(`已导出选中 ${sel.size} 笔案件明细`); addLog(`导出案件 ${sel.size} 笔`) }}>导出案件</ZzBtn>
          <ZzBtn sm title={batchInfo('批量转移').tip} disabled={batchInfo('批量转移').disabled} onClick={() => setBatch({ action: '批量转移' })}>批量转移</ZzBtn>
          <ZzBtn sm title={batchInfo('批量暂停').tip} disabled={batchInfo('批量暂停').disabled} onClick={() => setBatch({ action: '批量暂停' })}>批量暂停</ZzBtn>
          <ZzBtn sm title={batchInfo('批量恢复').tip} disabled={batchInfo('批量恢复').disabled} onClick={() => setBatch({ action: '批量恢复' })}>批量恢复</ZzBtn>
          <ZzBtn sm title={batchInfo('批量分配').tip} disabled={batchInfo('批量分配').disabled} onClick={() => setBatch({ action: '批量分配' })}>批量分配</ZzBtn>
          <ZzBtn sm title={exportDisabled ? '请先勾选案件' : ''} disabled={exportDisabled} onClick={() => { alert(`已导出 ${sel.size} 笔案件的催收台账（案件+PTP+最近催收记录）`); addLog(`批量导出催收台账 ${sel.size} 笔`) }}>批量导出催收台账</ZzBtn>
          <ZzBtn sm onClick={() => setLogOpen(true)}>操作日志</ZzBtn>
          <ZzBtn sm onClick={reset}>刷新</ZzBtn>
          <div className="relative">
            <ZzBtn sm onClick={() => setColPop((v) => !v)}>自定义列</ZzBtn>
            {colPop && (
              <div className="absolute right-0 z-20 mt-1 w-48 rounded border bg-white p-2 shadow-lg">
                {COLS.map((c) => (
                  <label key={c.key} className="flex items-center gap-2 py-1 text-sm hover:bg-slate-50">
                    <input type="checkbox" checked={!hidden.has(c.key)} onChange={() => setHidden((s) => { const n = new Set(s); n.has(c.key) ? n.delete(c.key) : n.add(c.key); return n })} />
                    {c.label}{c.def ? '' : <span className="text-xs text-gray-400">（默认隐藏）</span>}
                  </label>
                ))}
              </div>
            )}
          </div>
        </div>}>
        {/* 排序工具栏 */}
        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>排序：</span>
          {[['stageDesc', '账龄（M3+优先）'], ['stageAsc', '账龄（M0优先）'], ['remain', '剩余待还金额↓'], ['lastTouch', '最后催收时间↓']].map(([k, label]) => (
            <button key={k} onClick={() => setSort(k)} className={`rounded border px-2 py-0.5 ${sort === k ? 'border-[#1677ff] text-[#1677ff]' : 'border-slate-300 text-gray-600'}`}>{label}</button>
          ))}
        </div>
        {/* 表格 */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#f7f8fc]">
              <tr>
                <th className="border px-3 py-2 text-left font-medium text-gray-600"><input type="checkbox" checked={sel.size > 0 && sorted.every((r) => sel.has(r.id))} onChange={(e) => { if (e.target.checked) setSel(new Set(sorted.map((r) => r.id))); else setSel(new Set()) }} /></th>
                {visibleCols.map((c) => <th key={c.key} className="border px-3 py-2 text-left font-medium text-gray-600 whitespace-nowrap">{c.label}</th>)}
                <th className="border px-3 py-2 text-left font-medium text-gray-600">操作</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const ptp = zzActivePtp(r.id)
                const warn = r.outsource || r.status === '委外' || r.litigation
                return (
                  <tr key={r.id} className={`hover:bg-slate-50 ${warn ? 'bg-[#fff7ed]' : ''}`}>
                    <td className="border px-3 py-2"><input type="checkbox" checked={sel.has(r.id)} onChange={() => toggle(r.id)} /></td>
                    {visibleCols.map((c) => {
                      let v: any
                      switch (c.key) {
                        case 'id': v = r.id; break
                        case 'name': v = r.name; break
                        case 'phone': v = <span className="font-mono text-xs">{r.phone}</span>; break
                        case 'risk': v = <RiskTags c={r} />; break
                        case 'stage': v = <span className="font-medium">{STAGE_SHORT[r.stage]} <span className="text-xs text-gray-400">· {r.overdueDays}天</span></span>; break
                        case 'total': v = <span className="text-gray-500">{money(r.total)}</span>; break
                        case 'remainTotal': v = <span className="font-semibold text-[#D97706]">{money(r.remainTotal)}</span>; break
                        case 'owner': v = r.owner; break
                        case 'ptp': v = ptp.kind === 'pending' ? <ZzBadge color={BLUE}>{ptp.text}</ZzBadge> : ptp.kind === 'broken' ? <ZzBadge color="#DC2626">{ptp.text}</ZzBadge> : <span className="text-gray-300">—</span>; break
                        case 'nextFollow': v = r.nextFollow === '—' ? <span className="text-gray-300">—</span> : <span className="text-[#1677ff]">{r.nextFollow}</span>; break
                        case 'lastTouch': v = r.lastTouch; break
                        default: v = moneyCell(r, c.key)
                      }
                      return <td key={c.key} className="border px-3 py-2 align-top whitespace-nowrap">{v}</td>
                    })}
                    <td className="border px-3 py-2 align-top">
                      <ZzRowMenu c={r} role={role} showRepay={showRepay}
                        onDetail={() => nav('/console/zz/case-detail?id=' + r.id)}
                        onRepay={() => setRepay(r)} onWaiver={() => setWaiver(r)} onPtp={() => setPtpQuick(r)} />
                    </td>
                  </tr>
                )
              })}
              {sorted.length === 0 && <tr><td colSpan={visibleCols.length + 2} className="border px-3 py-8 text-center text-sm text-gray-400">无符合条件的在催案件</td></tr>}
            </tbody>
          </table>
        </div>
      </ZzCard>

      {repay && <ZzRepayModal case={repay} role={role} onClose={() => setRepay(null)} onSave={(amt, note) => {
        setRows((rs) => rs.map((x) => {
          if (x.id !== repay!.id) return x
          const remainPrincipal = Math.max(0, x.remainPrincipal - amt)
          const paidFull = remainPrincipal === 0
          return { ...x, remainPrincipal, remainTotal: Math.max(0, x.remainTotal - amt), status: paidFull ? '已结清' : x.status }
        }))
        addLog(`线下还款登记 案件 ${repay!.id}（${repay!.name}）金额 ${money(amt)}，备注：${note}`)
        alert(`已登记线下还款 ${money(amt)}，操作日志已留存${amt >= repay!.remainTotal ? '；账户已结清并自动归档' : ''}`)
        setRepay(null)
      }} />}
      {waiver && <ZzWaiverModal case={waiver} role={role} onClose={() => setWaiver(null)} onApply={(content) => addLog(content)} />}
      {ptpQuick && <ZzPtpRegisterModal caseId={ptpQuick.id} role={role} defaultKind="口头PTP" onClose={() => setPtpQuick(null)} onSave={() => { addLog(`快速登记PTP 案件 ${ptpQuick.id}（${ptpQuick.name}）`); alert('PTP 已登记（详情页可查看明细）'); setPtpQuick(null) }} />}
      {batch && <ZzBatchModal action={batch.action} ids={[...sel]} onClose={() => setBatch(null)} onConfirm={(reason) => {
        addLog(`${batch.action} ${sel.size} 笔案件，原因：${reason}`)
        alert(`${batch.action} 已提交，操作日志已留存（${sel.size} 笔）`)
        setBatch(null)
      }} />}
      {logOpen && (
        <ZzModal open title="操作日志" onClose={() => setLogOpen(false)} width={680}
          footer={<ZzBtn primary onClick={() => setLogOpen(false)}>关闭</ZzBtn>}>
          <ZzTable head={['时间', '操作人', '操作内容']} rows={logs.length ? logs.map((l) => [l.time, l.operator, l.content]) : [['—', '—', '暂无操作记录']]} />
        </ZzModal>
      )}
      {importOpen && <ZzImportModal role={role} onClose={() => setImportOpen(false)} onDone={(msg) => addLog(msg)} />}
    </ZzPage>
  )
}

/* ---------------- 行操作下拉菜单（按状态动态渲染 + 权限置灰） ---------------- */
function ZzRowMenu({ c, role, showRepay, onDetail, onRepay, onWaiver, onPtp }: {
  c: ZzCase; role: string; showRepay: boolean
  onDetail: () => void; onRepay: () => void; onWaiver: () => void; onPtp: () => void
}) {
  const [open, setOpen] = useState(false)
  const closed = CLOSED.has(c.status)
  const isOut = c.outsource || c.status === '委外'
  const isLit = c.litigation
  const inCollect = c.status === '催收中' || c.paused
  const repayOk = showRepay && inCollect && !isOut && !isLit && !closed
  const waiverOk = inCollect && !isOut && !isLit && !closed && showRepay
  const ptpOk = inCollect && !closed && !isOut && !isLit
  const items = [
    { label: '查看详情', onClick: onDetail, disabled: false, hint: '' },
    { label: '线下还款登记', onClick: onRepay, disabled: !repayOk, hint: (!showRepay ? '无权限' : isOut || isLit ? '委外/诉讼案件不可操作' : closed ? '已结案' : '仅催收中可操作') },
    { label: '减免申请', onClick: onWaiver, disabled: !waiverOk, hint: isOut || isLit ? '委外/诉讼案件不可操作' : closed ? '已结案' : '仅催收中可操作' },
    { label: '快速登记PTP', onClick: onPtp, disabled: !ptpOk, hint: isOut || isLit ? '委外/诉讼案件不可操作' : closed ? '已结案' : '仅催收中可操作' },
  ]
  return (
    <div className="relative inline-block">
      <ZzBtn sm onClick={() => setOpen((v) => !v)}>操作 ▾</ZzBtn>
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-40 mt-1 w-48 rounded border bg-white py-1 shadow-lg">
            {items.map((it) => (
              <button key={it.label} disabled={it.disabled} title={it.disabled ? it.hint : ''}
                onClick={() => { if (it.disabled) return; setOpen(false); it.onClick() }}
                className={`block w-full px-3 py-1.5 text-left text-sm ${it.disabled ? 'cursor-not-allowed text-gray-300' : 'text-gray-700 hover:bg-slate-50'}`}>
                {it.label}{it.disabled && it.hint ? <span className="ml-1 text-xs text-gray-300">·{it.hint}</span> : ''}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

/* ---------------- 线下还款登记（必填备注 + 强制凭证 + 操作日志） ---------------- */
function ZzRepayModal({ case: c, role, onClose, onSave }: { case: ZzCase; role: string; onClose: () => void; onSave: (amt: number, note: string) => void }) {
  const [type, setType] = useState<'部分还款' | '全额结清'>('部分还款')
  const [amt, setAmt] = useState(c.remainTotal || c.total)
  const [time, setTime] = useState('2026-08-25')
  const [ch, setCh] = useState('银行代扣')
  const [note, setNote] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [err, setErr] = useState('')

  const submit = () => {
    if (!note.trim()) { setErr('备注为必填项，需说明还款来源/核实情况'); return }
    if (!proof) { setErr('必须留存凭证（上传回单/截图），否则无法登记'); return }
    if (Number(amt) <= 0) { setErr('还款金额必须大于 0'); return }
    setErr('')
    onSave(Number(amt), note.trim())
  }
  return (
    <ZzModal open title="线下还款登记" onClose={onClose} width={560}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={submit}>保存</ZzBtn></>}>
      <div className="grid grid-cols-2 gap-3">
        <ZzField label="还款类型"><ZzSelect value={type} onChange={(e) => setType(e.target.value as any)}><option>部分还款</option><option>全额结清</option></ZzSelect></ZzField>
        <ZzField label={`还款金额（剩余待还 ${money(c.remainTotal)}）`}><ZzInput type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} /></ZzField>
        <ZzField label="还款时间"><ZzInput type="date" value={time} onChange={(e) => setTime(e.target.value)} /></ZzField>
        <ZzField label="还款渠道"><ZzSelect value={ch} onChange={(e) => setCh(e.target.value)}><option>银行代扣</option><option>柜台</option><option>转账</option><option>现金</option></ZzSelect></ZzField>
        <ZzField label="备注（必填）"><ZzInput value={note} onChange={(e) => setNote(e.target.value)} placeholder="说明还款来源与核实情况" /></ZzField>
        <ZzField label="凭证（强制留存·必传）"><input type="file" onChange={(e) => setProof(e.target.files?.[0] ?? null)} className="text-sm" /></ZzField>
      </div>
      {err && <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-gray-600">当前操作人：{role}。登记将写入完整操作日志（操作人 / 时间 / 内容），全额结清后案件自动归档至历史案件。</div>
    </ZzModal>
  )
}

/* ---------------- 减免审批（走审批流，不一键生效） ---------------- */
interface WaiverAppr { id: string; caseId: string; name: string; type: string; amt: number; reason: string; status: '待审批' | '已通过' | '已驳回'; time: string }
function ZzWaiverModal({ case: c, role, onClose, onApply }: { case: ZzCase; role: string; onClose: () => void; onApply: (content: string) => void }) {
  const [wt, setWt] = useState<'罚息减免' | '利息减免'>('罚息减免')
  const [amt, setAmt] = useState(6000)
  const [reason, setReason] = useState('')
  const [proof, setProof] = useState<File | null>(null)
  const [err, setErr] = useState('')
  const [apps, setApps] = useState<WaiverAppr[]>([])

  const submit = () => {
    if (!reason.trim()) { setErr('申请理由必填'); return }
    if (!proof) { setErr('必须上传佐证材料'); return }
    setErr('')
    const app: WaiverAppr = { id: 'WA-' + Date.now(), caseId: c.id, name: c.name, type: wt, amt, reason: reason.trim(), status: '待审批', time: nowStr() }
    setApps((a) => [app, ...a])
    onApply(`发起减免审批 案件 ${c.id}（${c.name}）${wt} ${money(amt)}，状态：待审批`)
    setReason(''); setProof(null)
  }
  const decide = (id: string, st: '已通过' | '已驳回') => {
    setApps((a) => a.map((x) => x.id === id ? { ...x, status: st } : x))
    onApply(`减免审批 ${id} 处理：${st}`)
  }
  return (
    <ZzModal open title="减免审批 · 发起" onClose={onClose} width={600}
      footer={<><ZzBtn onClick={onClose}>关闭</ZzBtn></>}>
      <div className="grid grid-cols-2 gap-3">
        <ZzField label="减免类型"><ZzSelect value={wt} onChange={(e) => setWt(e.target.value as any)}><option>罚息减免</option><option>利息减免</option></ZzSelect></ZzField>
        <ZzField label="减免金额"><ZzInput type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} /></ZzField>
        <ZzField label="申请理由（必填）"><ZzTextarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="说明减免原因" /></ZzField>
        <ZzField label="佐证材料（必传）"><input type="file" onChange={(e) => setProof(e.target.files?.[0] ?? null)} className="text-sm" /></ZzField>
      </div>
      {err && <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="mt-3"><ZzBtn primary onClick={submit}>提交审批流</ZzBtn></div>
      <div className="mt-4 rounded bg-slate-50 p-3 text-sm text-gray-600">减免不一键生效，须经上级审批后入账；提交后进入「待审批」，此处可跟踪我发起的审批。</div>

      {apps.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-medium">我发起的减免审批</div>
          <ZzTable head={['审批单', '类型/金额', '状态', '审批']} rows={apps.map((a) => [
            a.id + ' · ' + a.name, `${a.type} ${money(a.amt)}`,
            <ZzBadge color={a.status === '待审批' ? BLUE : a.status === '已通过' ? '#16A34A' : '#DC2626'}>{a.status}</ZzBadge>,
            a.status === '待审批' ? <div className="flex gap-1"><ZzBtn sm primary onClick={() => decide(a.id, '已通过')}>通过</ZzBtn><ZzBtn sm danger onClick={() => decide(a.id, '已驳回')}>驳回</ZzBtn></div> : '-',
          ])} />
        </div>
      )}
    </ZzModal>
  )
}

/* ---------------- 批量操作（带原因输入框 + 操作日志） ---------------- */
function ZzBatchModal({ action, ids, onClose, onConfirm }: { action: string; ids: string[]; onClose: () => void; onConfirm: (reason: string) => void }) {
  const [reason, setReason] = useState('')
  const [err, setErr] = useState('')
  if (ids.length === 0) {
    return (
      <ZzModal open title={action} onClose={onClose} width={480} footer={<ZzBtn primary onClick={onClose}>关闭</ZzBtn>}>
        <div className="py-6 text-center text-sm text-gray-400">请先在列表勾选案件，再执行「{action}」。</div>
      </ZzModal>
    )
  }
  return (
    <ZzModal open title={action} onClose={onClose} width={520}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => { if (!reason.trim()) { setErr('需填写操作原因'); return } onConfirm(reason.trim()) }}>确认执行</ZzBtn></>}>
      <div className="mb-2 text-sm text-gray-600">已选 <b>{ids.length}</b> 笔案件：{ids.slice(0, 6).join('、')}{ids.length > 6 ? '…' : ''}</div>
      <ZzField label="操作原因（必填，写入操作日志）"><ZzTextarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="说明本次批量操作的原因" /></ZzField>
      {err && <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
    </ZzModal>
  )
}

/* ---------------- 案件导入（分步向导弹窗） ---------------- */
interface ImpRow { id: string; name: string; total: number; stage: string; err: string }
const IMP_TARGETS = ['案件编号', '客户姓名', '身份证号', '合同号', '逾期本金', '逾期罚息', '账龄', '案件状态']
const IMP_SOURCES = ['case_id', 'cust_name', 'idno', 'contract_no', 'principal', 'penalty', 'stage', 'status', 'phone', 'owner']
const IMP_DEFAULT: Record<string, string> = {
  案件编号: 'case_id', 客户姓名: 'cust_name', 身份证号: 'idno', 合同号: 'contract_no',
  逾期本金: 'principal', 逾期罚息: 'penalty', 账龄: 'stage', 案件状态: 'status',
}

function ZzImportModal({ role, onClose, onDone }: { role: string; onClose: () => void; onDone: (msg: string) => void }) {
  const STEPS = ['上传文件', '字段映射', '数据校验', '接口同步', '上传成功']
  const [step, setStep] = useState(1)
  const [file, setFile] = useState<File | null>(null)
  const [mapping, setMapping] = useState<Record<string, string>>({ ...IMP_DEFAULT })
  const [preview, setPreview] = useState<ImpRow[]>([])
  const [checked, setChecked] = useState(false)
  const [syncMode, setSyncMode] = useState<'full' | 'inc'>('full')
  const [syncing, setSyncing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [syncDone, setSyncDone] = useState(false)
  const [finishInfo, setFinishInfo] = useState<{ ok: number; fail: number; ids: string[] }>({ ok: 0, fail: 0, ids: [] })

  const doCheck = () => {
    const rows: ImpRow[] = [
      { id: 'CO-202608-011', name: '周*伟', total: 12000, stage: 'M1', err: '' },
      { id: 'CO-202608-012', name: '吴*芳', total: 8000, stage: 'M0', err: '' },
      { id: 'CO-202608-013', name: '郑*强', total: 15600, stage: 'M3+', err: '身份证号缺失' },
      { id: 'CO-202608-014', name: '孙*磊', total: 3500, stage: 'M1', err: '' },
    ]
    setPreview(rows); setChecked(true)
  }
  const validRows = preview.filter((r) => !r.err)

  const startSync = () => {
    setSyncing(true); setProgress(0); setSyncDone(false)
    let p = 0
    const t = setInterval(() => {
      p += 20
      setProgress(p)
      if (p >= 100) {
        clearInterval(t)
        setSyncing(false); setSyncDone(true)
        setFinishInfo({ ok: validRows.length, fail: preview.length - validRows.length, ids: validRows.map((r) => r.id) })
        setStep(5)
      }
    }, 240)
  }
  const finish = () => { onDone(`案件导入：向导导入成功 ${finishInfo.ok} 条，跳过 ${finishInfo.fail} 条（校验失败）`); onClose() }

  const stepCls = (i: number) => `flex flex-col items-center ${i === step ? 'text-[#1677ff]' : i < step ? 'text-[#16A34A]' : 'text-gray-400'}`
  return (
    <ZzModal open title="案件导入向导" onClose={onClose} width={780}
      footer={<>
        <ZzBtn onClick={onClose}>取消</ZzBtn>
        {step > 1 && <ZzBtn onClick={() => setStep((s) => s - 1)}>上一步</ZzBtn>}
        {step < 4 && <ZzBtn primary onClick={() => setStep((s) => s + 1)}>下一步</ZzBtn>}
        {step === 4 && <ZzBtn primary disabled={syncing} onClick={startSync}>{syncing ? '同步中…' : syncDone ? '重新同步' : '开始同步'}</ZzBtn>}
        {step === 5 && <ZzBtn primary onClick={finish}>完成</ZzBtn>}
      </>}>
      {/* 步骤条 */}
      <div className="mb-5 flex items-center justify-between px-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex flex-1 items-center">
            <div className={stepCls(i + 1)}>
              <div className={`flex h-7 w-7 items-center justify-center rounded-full border text-sm font-semibold ${i + 1 === step ? 'border-[#1677ff] bg-[#1677ff] text-white' : i + 1 < step ? 'border-[#16A34A] bg-[#16A34A] text-white' : 'border-slate-300'}`}>{i + 1 < step ? '✓' : i + 1}</div>
              <div className="mt-1 text-xs">{s}</div>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-1 h-px flex-1 ${i + 1 < step ? 'bg-[#16A34A]' : 'bg-slate-200'}`} />}
          </div>
        ))}
      </div>

      {/* 步骤1：上传文件 / 下载模板 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="rounded border border-dashed border-slate-300 p-5 text-center">
            <input type="file" accept=".xlsx,.xls,.csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="mx-auto block text-sm" />
            <div className="mt-2 text-xs text-gray-400">支持 .xlsx / .xls / .csv，单文件不超过 10MB</div>
            {file && <div className="mt-2 text-sm text-[#16A34A]">已选择：{file.name}（{(file.size / 1024).toFixed(1)} KB）</div>}
          </div>
          <div className="flex items-center gap-3">
            <ZzBtn onClick={() => alert('模板已下载：案件导入模板.xlsx（含字段说明与示例行）')}>下载导入模板</ZzBtn>
            <span className="text-xs text-gray-400">若未上传文件，可继续预览样例数据完成向导演示</span>
          </div>
        </div>
      )}

      {/* 步骤2：字段映射 */}
      {step === 2 && (
        <div>
          <div className="mb-2 text-sm text-gray-600">系统已基于模板列名智能匹配，可按需调整「文件列」映射关系。</div>
          <ZzTable head={['系统字段', '文件列', '状态']} rows={IMP_TARGETS.map((t) => [
            t,
            <ZzSelect value={mapping[t]} onChange={(e) => setMapping((m) => ({ ...m, [t]: e.target.value }))}>
              {IMP_SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
            </ZzSelect>,
            <ZzBadge color={mapping[t] ? BLUE : '#DC2626'}>{mapping[t] ? '已映射' : '未映射'}</ZzBadge>,
          ])} />
        </div>
      )}

      {/* 步骤3：数据校验预览 */}
      {step === 3 && (
        <div>
          <div className="mb-3 flex items-center gap-3">
            <ZzBtn primary onClick={doCheck}>{checked ? '重新校验' : '开始校验'}</ZzBtn>
            {checked && <span className="text-sm">共 {preview.length} 条，<span className="text-[#16A34A]">通过 {validRows.length}</span> / <span className="text-[#DC2626]">失败 {preview.length - validRows.length}</span></span>}
            {checked && preview.length - validRows.length > 0 && <ZzBtn sm onClick={() => alert('已导出错误数据.xlsx')}>下载错误数据</ZzBtn>}
          </div>
          {checked ? (
            <ZzTable head={['案件ID', '客户', '总额', '账龄', '校验结果', '操作']} rows={preview.map((p) => [
              p.id, p.name, money(p.total), p.stage,
              p.err ? <ZzBadge color="#DC2626">失败：{p.err}</ZzBadge> : <ZzBadge color="#16A34A">通过</ZzBadge>,
              <ZzBtn sm disabled={!!p.err} onClick={() => alert('已跳过错误行 ' + p.id)}>{p.err ? '不可导入' : '可导入'}</ZzBtn>,
            ])} />
          ) : <div className="py-8 text-center text-sm text-gray-400">点击「开始校验」解析映射后的数据并校验必填项与格式</div>}
        </div>
      )}

      {/* 步骤4：接口同步 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">案件数据可经 API 自动对接信贷核心，或沿用已上传文件导入。</div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm"><input type="radio" checked={syncMode === 'full'} onChange={() => setSyncMode('full')} /> 全量同步（覆盖历史）</label>
            <label className="flex items-center gap-2 text-sm"><input type="radio" checked={syncMode === 'inc'} onChange={() => setSyncMode('inc')} /> 增量同步（仅更新变更）</label>
          </div>
          {syncing && <div className="h-2 w-full overflow-hidden rounded bg-slate-100"><div className="h-full bg-[#1677ff] transition-all" style={{ width: progress + '%' }} /></div>}
          {syncDone && <div className="rounded bg-[#f0fdf4] p-3 text-sm text-[#16A34A]">同步完成：成功 {validRows.length} 条，跳过 {preview.length - validRows.length} 条（校验失败）。</div>}
          {!checked && <div className="text-xs text-gray-400">提示：可先返回「数据校验」步骤生成校验数据再同步。</div>}
        </div>
      )}

      {/* 步骤5：上传成功 */}
      {step === 5 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded bg-[#f0fdf4] p-4 text-[#16A34A]">
            <span className="text-2xl">✓</span>
            <div>
              <div className="font-semibold">案件导入成功</div>
              <div className="text-sm">成功 {finishInfo.ok} 条，跳过 {finishInfo.fail} 条（校验失败）。操作人：{role}</div>
            </div>
          </div>
          {finishInfo.ids.length > 0 && (
            <div className="rounded border p-3 text-sm">
              <div className="mb-1 text-gray-500">已导入案件编号：</div>
              <div className="flex flex-wrap gap-2">{finishInfo.ids.map((id) => <span key={id} className="rounded bg-slate-50 px-2 py-1 text-xs">{id}</span>)}</div>
            </div>
          )}
        </div>
      )}
    </ZzModal>
  )
}

/* ---------------- 历史案件 ---------------- */
function ZzCaseHistory() {
  const nav = useNavigate()
  return (
    <ZzPage title="历史案件" crumb="催贷管理 / 案件管理" subtitle="已结清 / 核销 / 诉讼结案案件的归档查询（只读）">
      <ZzCard title="历史案件列表">
        <ZzFilterBar>
          <ZzField label="原案件编号"><ZzInput placeholder="CO-..." /></ZzField>
          <ZzField label="结案类型"><ZzSelect defaultValue=""><option value="">全部</option><option>已结清</option><option>核销</option><option>诉讼结案</option></ZzSelect></ZzField>
          <ZzField label="结案时间"><ZzInput type="date" /></ZzField>
          <ZzBtn primary>查询</ZzBtn>
        </ZzFilterBar>
        <ZzTable head={['案件ID', '客户', '原逾期金额', '结案方式', '结案时间', '操作']} rows={ZZ_HISTORY_CASES.map((h) => [
          h.id, h.name, money(h.total), <ZzBadge color={h.closeType === '已结清' ? '#16A34A' : '#9CA3AF'}>{h.closeType}</ZzBadge>, h.closeTime,
          <ZzBtn sm onClick={() => nav('/console/zz/case-detail?id=' + h.id)}>查看详情</ZzBtn>,
        ])} />
      </ZzCard>
    </ZzPage>
  )
}

/* ===================== 案件详情页（依据截图问题清单重构） ===================== */
const STATUS_COLOR: Record<string, string> = {
  '催收中': BLUE, '承诺还款': BLUE, '待分案': '#6B7280', '委外': '#D97706',
  '已结清': '#16A34A', '核销': '#9CA3AF', '诉讼结案': '#DC2626',
}
const CHANNEL_COLOR: Record<string, string> = { 外呼: BLUE, 短信: '#16A34A', 微信: '#7C3AED', 上门: '#D97706' }
const SOURCE_COLOR: Record<string, string> = { 线下登记: BLUE, 系统自动代扣: '#16A34A', 脚本导入: '#9CA3AF' }

function ZzCaseDetailPage() {
  const loc = useLocation()
  const nav = useNavigate()
  const role = zzCurrentRole()
  const id = new URLSearchParams(loc.search).get('id') || ''
  const inActive = ZZ_CASES.find((c) => c.id === id)
  const inHist = ZZ_HISTORY_CASES.find((h) => h.id === id)
  const readOnly = !inActive && !!inHist
  const c = inActive || (inHist ? { id: inHist.id, name: inHist.name, idno: '—', contract: '—', principal: inHist.total, penalty: 0, total: inHist.total, remainPrincipal: 0, remainPenalty: 0, remainTotal: 0, stage: 'M1' as const, overdueRange: '—', status: inHist.closeType, owner: '—', lost: false, outsource: false, litigation: false, lastTouch: inHist.closeTime, phone: '—', contacts: 0 } : null)
  const notes = ZZ_CASE_NOTES[id] ?? []
  const d = zzDetailOf(id)
  const btns = zzCaseButtons(c ? c.status : '', role)
  const today = new Date().toISOString().slice(0, 10)

  const [repay, setRepay] = useState<ZzCase | null>(null)
  const [waiver, setWaiver] = useState<ZzCase | null>(null)
  const [logOpen, setLogOpen] = useState(false)
  const [snapOpen, setSnapOpen] = useState(false)
  const [ptpOpen, setPtpOpen] = useState(false)
  const [focusPtp, setFocusPtp] = useState('')
  const [focusAct, setFocusAct] = useState('')
  const [actions, setActions] = useState(d.actions)
  const [actionOpen, setActionOpen] = useState(false)
  const [ptpKind, setPtpKind] = useState<'口头PTP' | '正式协议'>('口头PTP')
  const goto = (sec: string, focus?: string, setFocus?: (s: string) => void) => {
    document.getElementById(sec)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    if (focus && setFocus) setFocus(focus)
  }

  if (!c) return <ZzPage title="案件详情" crumb="催贷管理 / 案件详情"><ZzCard><div className="py-10 text-center text-sm text-gray-400">未找到案件 {id}</div></ZzCard></ZzPage>

  // 当前生效 PTP（待履约 / 生效中 且未到期）
  const activePtp = [...d.ptpOral.filter((p) => p.status === '待履约' && p.dueTime >= today), ...d.ptpAgreement.filter((p) => p.status === '生效中' && p.dueTime >= today)]
  const ptpBroken = d.ptpOral.filter((p) => p.result === 'BP' || p.status === '已失约').length
  const repaidTotal = d.repays.reduce((s, r) => s + r.amt, 0)

  const panel = 'mb-3 rounded border border-[#e5e7eb] bg-white'
  const phead = 'flex items-center justify-between border-b border-[#e5e7eb] px-4 py-2 font-semibold text-gray-700'
  const pbody = 'p-4 text-sm'
  const flabel = 'text-gray-500 mr-1'
  const fitem = 'min-w-[200px]'
  const row = 'mb-2 flex flex-wrap gap-x-6 gap-y-2'

  // 按钮渲染：业务操作按权限 show/disabled/hide；操作日志突出显示
  const BizBtn = ({ name, onClick, danger }: { name: string; onClick?: () => void; danger?: boolean }) => {
    const st = btns[name]
    if (st === 'hide') return null
    if (st === 'disabled') return <ZzBtn sm disabled>{name}</ZzBtn>
    return <ZzBtn sm danger={danger} onClick={onClick}>{name}</ZzBtn>
  }

  const MODULES = [['sec-debtor', '债务人信息'], ['sec-overdue', '逾期信息'], ['sec-repay', '还款记录'], ['sec-ptp', 'PTP记录'], ['sec-action', '行动记录'], ['sec-contact', '联系信息'], ['sec-extra', '补充信息'], ['sec-graph', '关联关系图谱']]

  return (
    <ZzPage title="案件详情" crumb="催贷管理 / 案件详情" subtitle={`内部档案 · ${c.id}`} actions={<ZzBtn sm onClick={() => nav(-1)}>返回</ZzBtn>}>
      {/* 顶部状态标签栏 */}
      <div className={panel}>
        <div className={`${phead} bg-slate-50`}>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="font-semibold text-gray-800">案件编号 {c.id}</span>
            <span className="text-gray-400">｜</span>
            <span>当前状态：<ZzBadge color={STATUS_COLOR[c.status] || '#6B7280'}>{c.status}</ZzBadge></span>
            <span className="text-gray-400">｜</span>
            {activePtp.length > 0 ? (
              <span className="rounded bg-[#fff7e6] px-2 py-0.5 text-[#d97706] font-medium">⏳ 当前生效PTP待履约，到期 {activePtp[0].dueTime}</span>
            ) : <span className="text-gray-400">无待履约PTP</span>}
            {readOnly && <span className="rounded bg-gray-100 px-1 text-xs text-gray-500">只读归档（结案快照）</span>}
          </div>
        </div>
      </div>

      {/* 汇总卡片：案件总览 */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <ZzStat label="当前剩余本金" value={money(c.remainPrincipal)} accent={BLUE} sub={`原始逾期 ${money(c.principal)}`} />
        <ZzStat label="历史PTP次数" value={d.ptpOral.length + d.ptpAgreement.length} sub={`口头 ${d.ptpOral.length} / 协议 ${d.ptpAgreement.length}`} />
        <ZzStat label="PTP失约次数" value={ptpBroken} accent={ptpBroken ? '#DC2626' : '#16A34A'} />
        <ZzStat label="催收次数" value={d.actions.length} sub={`累计已还 ${money(repaidTotal)}`} />
      </div>

      {/* 结案归档提示 */}
      {readOnly && (
        <div className="mb-3 flex items-center justify-between rounded border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-700">
          <span>⚠ 本案件已结案归档，原详情页业务操作已禁用，建议查看【结案快照】。</span>
          <button onClick={() => setSnapOpen(true)} className="rounded bg-amber-500 px-3 py-1 text-white">查看结案快照</button>
        </div>
      )}

      {/* 顶部操作按钮区：业务左 / 辅助右；操作日志突出 */}
      <div className={panel}>
        <div className={phead}>
          <div className="flex flex-wrap items-center gap-2">
            {readOnly ? null : (<>
              <BizBtn name="还款登记" onClick={() => setRepay(c)} danger />
              <BizBtn name="减免申请" onClick={() => setWaiver(c)} />
              <BizBtn name="案件转移" onClick={() => alert('打开案件转移')} />
              <BizBtn name="暂停/恢复" onClick={() => alert('暂停/恢复催收')} />
              <BizBtn name="转外包/核销" onClick={() => alert('打开转外包/核销审批')} danger />
            </>)}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {!readOnly && <BizBtn name="登记PTP" onClick={() => { setPtpKind('口头PTP'); setPtpOpen(true) }} />}
            <button onClick={() => alert('导出案件全部资料（含结案快照）')} className="rounded border border-slate-300 px-2 py-1 text-sm text-gray-700">导出</button>
            <button onClick={() => setLogOpen(true)} className="rounded border border-[#1677ff] bg-[#e6f0ff] px-2 py-1 text-sm font-medium text-[#1677ff]">📋 操作日志</button>
            {btns['查看结案快照'] === 'show' && <button onClick={() => setSnapOpen(true)} className="rounded border border-slate-300 px-2 py-1 text-sm text-gray-700">查看结案快照</button>}
          </div>
        </div>
      </div>

      {/* 悬浮模块导航 */}
      <div style={{ position: 'sticky', top: 112, zIndex: 20, background: '#fff' }} className="mb-3 flex flex-wrap gap-2 border-b pb-2">
        {MODULES.map(([sid, label]) => (
          <button key={sid} onClick={() => goto(sid as string)} className="rounded-full border border-slate-300 px-3 py-1 text-xs text-gray-600 hover:border-[#1677ff] hover:text-[#1677ff]">{label}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 债务人信息 */}
        <div id="sec-debtor" className={panel}><div className={phead}><span>债务人信息</span><span className="rounded bg-slate-100 px-1 text-xs text-gray-400">建档快照</span></div>
          <div className={pbody}>
            <div className={row}><div className={fitem}><span className={flabel}>出生年月：</span><span>(1992‑03‑14) 男</span></div><div className={fitem}><span className={flabel}>年龄：</span><span>27</span></div><div className={fitem}><span className={flabel}>证件号：</span><span>{c.idno}</span></div><div className={fitem}><span className={flabel}>出生地：</span><span>广东***</span></div></div>
            <div className={row}><div className={fitem}><span className={flabel}>户籍地址：</span><span>深圳市南山区沙河西路白沙产业园</span></div><div className={fitem}><span className={flabel}>手机：</span><span>{c.phone} <span className="cursor-pointer text-[#1677ff]">☎</span></span></div></div>
            <div className={row}><div className={fitem}><span className={flabel}>单位名称：</span><span>深****有限公司</span></div><div className={fitem}><span className={flabel}>家庭电话：</span><span>44555655adas</span></div></div>
            <div className={row}><div className={fitem}><span className={flabel}>电子邮箱：</span><span>13338192287@164.com</span></div><div className={fitem}><span className={flabel}>城市：</span><span>深圳</span></div></div>
          </div>
        </div>

        {/* 逾期信息 */}
        <div id="sec-overdue" className={panel}><div className={phead}><span>逾期信息</span><span className="rounded bg-[#fff7e6] px-1 text-xs text-[#d97706]">实时（信贷核心同步）</span></div>
          <div className={pbody}>
            {(c.outsource || c.litigation) && (
              <div className="mb-3 flex flex-wrap gap-2">
                {c.outsource && <ZzBadge color="#D97706">● 委外中</ZzBadge>}
                {c.litigation && <ZzBadge color="#DC2626">● 诉讼中</ZzBadge>}
              </div>
            )}
            <div className="mb-3 rounded border border-yellow-300 bg-yellow-100 p-3">
              <div className="mb-2 font-semibold text-[#f53f3f]">逾期天数强提示：{c.overdueRange}（账龄 {c.stage}）</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded bg-white/70 p-2">
                  <div className="mb-1 text-xs text-gray-500">原委案金额</div>
                  <div className="text-sm">委案本金 <b>{money(c.principal)}</b></div>
                  <div className="text-sm">委案总额 <b>{money(c.total)}</b></div>
                  <div className="text-xs text-gray-400">委案日期 2018‑11‑01 · 期数 10</div>
                </div>
                <div className="rounded bg-white/70 p-2">
                  <div className="mb-1 text-xs text-gray-500">当前待还（实时）</div>
                  <div className="text-sm">剩余本金 <b className="text-[#f53f3f]">{money(c.remainPrincipal)}</b></div>
                  <div className="text-sm">剩余罚息 <b className="text-[#f53f3f]">{money(c.remainPenalty)}</b></div>
                  <div className="text-sm">剩余总额 <b className="text-[#f53f3f]">{money(c.remainTotal)}</b></div>
                </div>
              </div>
            </div>
            <div className={row}><div className={fitem}><span className={flabel}>银行：</span><span>***银行</span></div><div className={fitem}><span className={flabel}>账户：</span><span>622689****</span></div><div className={fitem}><span className={flabel}>开卡日：</span><span>2018‑02‑01</span></div></div>
            <div className="mt-3 border-t pt-3">
              <div className="mb-2 font-medium">案件元数据</div>
              <div className={row}>
                <div className={fitem}><span className={flabel}>案件状态：</span><span><ZzBadge color={STATUS_COLOR[c.status] || '#6B7280'}>{c.status}</ZzBadge></span></div>
                <div className={fitem}><span className={flabel}>账龄M：</span><span>{c.stage}</span></div>
                <div className={fitem}><span className={flabel}>风险标签：</span><span className="rounded bg-orange-100 px-1">无</span></div>
                <div className={fitem}><span className={flabel}>委外状态：</span><span className={c.outsource ? 'font-semibold text-[#d97706]' : ''}>{c.outsource ? '已委外' : '未委外'}</span></div>
                <div className={fitem}><span className={flabel}>诉讼状态：</span><span className={c.litigation ? 'font-semibold text-[#DC2626]' : ''}>{c.litigation ? '已诉讼' : '未诉讼'}</span></div>
                <div className={fitem}><span className={flabel}>承案人：</span><span>{c.owner}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 还款记录（增强：来源/抵扣/KP/汇总） */}
      <div id="sec-repay" className={panel}><div className={phead}><span>还款记录</span><span className="text-xs text-gray-400">累计已还 {money(repaidTotal)}</span></div>
        <div className={pbody}>
          <ZzTable head={['还款金额', '抵扣本金', '抵扣罚息', '时间', '录入人', '来源', 'PTP履约', '备注']} rows={d.repays.map((r) => [
            money(r.amt), money(r.principalPart), money(r.penaltyPart), r.time, r.operator,
            <ZzBadge color={SOURCE_COLOR[r.source]}>{r.source}</ZzBadge>,
            r.kp ? <ZzBadge color="#16A34A">KP履约</ZzBadge> : <span className="text-gray-400">-</span>,
            r.ptpId ? <button onClick={() => goto('sec-ptp', r.ptpId, setFocusPtp)} className="text-[#1677ff]">关联{r.ptpId}</button> : (r.note || '-'),
          ])} />
        </div>
      </div>

      {/* PTP 记录：口头PTP + 正式还款协议 两张表（上移、高亮生效） */}
      <div id="sec-ptp" className={panel}><div className={phead}><span>PTP 记录（口头承诺 / 正式协议）</span>{activePtp.length > 0 && <span className="rounded bg-[#fff7e6] px-1 text-xs text-[#d97706]">生效中 {activePtp.length} 条</span>}</div>
        <div className={pbody}>
          <div className="mb-1 flex items-center justify-between"><span className="font-medium text-gray-700">① 口头 PTP（客户承诺）</span>{!readOnly && <button onClick={() => { setPtpKind('口头PTP'); setPtpOpen(true) }} className="rounded border border-[#1677ff] px-2 py-0.5 text-xs text-[#1677ff]">＋ 登记口头PTP</button>}</div>
          <ZzTable head={['承诺时间', '到期时间', '承诺金额', '状态', '结果', '创建人', '实际还款', '备注', '来源催收']} rows={d.ptpOral.length ? d.ptpOral.map((p) => [
            p.promiseTime, p.dueTime, money(p.promiseAmt),
            <span className={p.status === '待履约' ? 'font-semibold text-[#d97706]' : p.status === '已失约' ? 'text-[#DC2626]' : 'text-[#16A34A]'}>{p.status}</span>,
            p.result === 'BP' ? <ZzBadge color="#DC2626">BP失约</ZzBadge> : p.result === 'KP' ? <ZzBadge color="#16A34A">KP履约</ZzBadge> : '-',
            p.creator, p.actualTime || '-', p.note,
            p.actionId ? <button onClick={() => goto('sec-action', p.actionId, setFocusAct)} className="text-[#1677ff]">来源催收</button> : '-',
          ]) : [['—', '—', '—', '—', '—', '—', '—', '暂无口头PTP', '—']]} />
          <div className="mt-4 mb-1 flex items-center justify-between"><span className="font-medium text-gray-700">② 正式还款协议（已签署）</span>{!readOnly && <button onClick={() => { setPtpKind('正式协议'); setPtpOpen(true) }} className="rounded border border-[#1677ff] px-2 py-0.5 text-xs text-[#1677ff]">＋ 签订还款协议</button>}</div>
          <ZzTable head={['签署时间', '承诺时间', '到期时间', '金额', '状态', '结果', '创建人', '实际还款', '备注']} rows={d.ptpAgreement.length ? d.ptpAgreement.map((p) => [
            p.signTime, p.promiseTime, p.dueTime, money(p.amt),
            <span className={p.status === '生效中' ? 'font-semibold text-[#d97706]' : p.status === '已作废' ? 'text-[#DC2626]' : 'text-[#16A34A]'}>{p.status}</span>,
            p.result || '-', p.creator, p.actualTime || '-', p.note,
          ]) : [['—', '—', '—', '—', '—', '—', '—', '—', '暂无正式还款协议']]} />
        </div>
      </div>

      {/* 行动记录（渠道/录音/PTP关联） */}
      <div id="sec-action" className={panel}><div className={phead}><span>行动记录（催收记录）</span>{!readOnly && <button onClick={() => setActionOpen(true)} className="rounded border border-[#1677ff] px-2 py-0.5 text-xs text-[#1677ff]">＋ 新增催收记录</button>}</div>
        <div className={pbody}>
          <ZzTable head={['渠道', '催收记录', '催收员', '时间', '录音', '关联PTP']} rows={actions.map((a) => [
            <ZzBadge color={CHANNEL_COLOR[a.channel]}>{a.channel}</ZzBadge>,
            <span className={focusAct === a.id ? 'rounded bg-yellow-100 px-1' : ''}>{a.rec}</span>,
            a.who, a.time,
            a.recording ? <a href="#" className="text-[#1677ff]">▶ 播放录音</a> : <span className="text-gray-400">—</span>,
            a.ptpId ? <button onClick={() => goto('sec-ptp', a.ptpId, setFocusPtp)} className="text-[#1677ff]">产生PTP ↗</button> : <span className="text-gray-400">-</span>,
          ])} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* 联系信息 */}
        <div id="sec-contact" className={panel}><div className={phead}><span>联系信息</span></div>
          <div className={pbody}>
            <ZzTable head={['关系', '姓名', '号码类型', '电话号码', '状态', '本次新获取']} rows={d.contacts.map((ct) => [
              ct.rel, ct.name, ct.type, ct.tel, ct.status,
              ct.isNew ? <ZzBadge color={BLUE}>本次新获取</ZzBadge> : <span className="text-gray-400">-</span>,
            ])} />
          </div>
        </div>

        {/* 补充信息（建档快照） */}
        <div id="sec-extra" className={panel}><div className={phead}><span>补充信息</span><span className="rounded bg-slate-100 px-1 text-xs text-gray-400">建档快照（非实时）</span></div>
          <div className={pbody}>
            <div className={row}><div className={fitem}><span className={flabel}>信用额度：</span><span>17000.00</span></div><div className={fitem}><span className={flabel}>客户类别：</span><span>普通</span></div><div className={fitem}><span className={flabel}>主副卡：</span><span>主卡</span></div></div>
            <div className={row}><div className={fitem}><span className={flabel}>省份：</span><span>广东省</span></div><div className={fitem}><span className={flabel}>城市：</span><span>佛山</span></div><div className={fitem}><span className={flabel}>持卡人职务：</span><span>技术员</span></div></div>
            <div className="mt-3 border-t pt-3"><div className="mb-2 font-medium">合同放款信息</div>
              <div className={row}><div className={fitem}><span className={flabel}>合同编号：</span><span>HT20181101001</span></div><div className={fitem}><span className={flabel}>放款金额：</span><span>50000.00</span></div><div className={fitem}><span className={flabel}>放款日期：</span><span>2018‑02‑01</span></div><div className={fitem}><span className={flabel}>到期日：</span><span>2019‑02‑01</span></div></div>
            </div>
            <div className="mt-3 border-t pt-3"><div className="mb-2 font-medium">减免历史</div><div className="text-gray-500">{notes.length ? notes.map((n) => <div key={n.time}>· {n.time} {n.who}：{n.what}</div>) : '暂无减免记录'}</div></div>
          </div>
        </div>
      </div>

      {repay && <ZzRepayModal case={repay} role={role} onClose={() => setRepay(null)} onSave={(amt, note) => { alert(`已登记线下还款 ${money(amt)}，备注：${note}`); setRepay(null) }} />}
      {waiver && <ZzWaiverModal case={waiver} role={role} onClose={() => setWaiver(null)} onApply={() => {}} />}
      {ptpOpen && <ZzPtpRegisterModal caseId={c.id} role={role} defaultKind={ptpKind} onClose={() => setPtpOpen(false)} onSave={() => setPtpOpen(false)} />}
      {actionOpen && <ZzActionAddModal caseId={c.id} role={role} ptpOptions={[...d.ptpOral, ...d.ptpAgreement].map((p) => p.id)} onClose={() => setActionOpen(false)} onSave={(rec) => { setActions((s) => [...s, rec]); setActionOpen(false) }} />}
      {snapOpen && <ZzSnapshotModal c={c} onClose={() => setSnapOpen(false)} />}
      {logOpen && (
        <ZzModal open title="操作日志" onClose={() => setLogOpen(false)} width={680} footer={<ZzBtn primary onClick={() => setLogOpen(false)}>关闭</ZzBtn>}>
          <div className="text-sm text-gray-600">操作日志（审计轨迹）示例：</div>
          <ZzTable head={['时间', '操作人', '操作内容']} rows={[
            ['2026-08-25 09:12', role, `查看案件 ${c.id} 详情`],
            ['2026-08-24 14:30', '李娜', '登记 PTP 承诺（PTP-001）'],
            ['2026-08-20 10:00', '李娜', '线下还款登记 20000 元'],
          ]} />
        </ZzModal>
      )}

      {/* 关联关系图谱（知识图谱嵌入：合规内部授权数据，仅作风险研判与线索参考） */}
      {(() => {
        const g = ZZ_GRAPH_PROFILES[c.id]
        return (
          <div id="sec-graph" className="mt-2">
            <div className={panel}>
              <div className={phead}>
                <span>关联关系图谱</span>
                <span className="rounded bg-[#eef4ff] px-1 text-xs text-[#1677ff]">图谱增强 · 仅内部授权数据</span>
              </div>
              <div className={pbody}>
                {!g ? (
                  <div className="py-6 text-center text-sm text-gray-400">本案件暂未纳入图谱关系网络（无同址/同设备/关联人线索）。</div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    {/* 左：关系网络可视化 */}
                    <div className="lg:col-span-2">
                      <div className="rounded border bg-slate-50 p-3">
                        <div className="mb-2 text-xs text-gray-500">以欠款客户为中心（1度合规关系）</div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded bg-[#1677ff] px-2 py-1 text-xs font-medium text-white">★ {g.center}（本人）</span>
                          <span className="text-gray-400">—</span>
                          {g.contacts.map((ct: any, i: number) => (
                            <span key={i} className="rounded border border-green-300 bg-green-50 px-2 py-1 text-xs text-green-700">{ct.rel}：{ct.name}{ct.reachable ? ' ✅可呼' : ' ⛔暂不可达'}</span>
                          ))}
                          {g.sameAddr.map((s: string, i: number) => <span key={'a' + i} className="rounded border border-red-300 bg-red-50 px-2 py-1 text-xs text-red-600">同址逾期：{s}</span>)}
                          {g.sameDevice.map((s: string, i: number) => <span key={'d' + i} className="rounded border border-amber-300 bg-amber-50 px-2 py-1 text-xs text-amber-700">同设备逾期：{s}</span>)}
                          {g.history.map((s: string, i: number) => <span key={'h' + i} className="rounded border border-gray-300 bg-gray-50 px-2 py-1 text-xs text-gray-500">历史关联：{s}</span>)}
                        </div>
                        {g.tags.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1">
                            {g.tags.map((t: any, i: number) => <ZzBadge key={i} color={ZZ_GRAPH_TAG_COLOR[t]}>{t}</ZzBadge>)}
                          </div>
                        )}
                      </div>
                    </div>
                    {/* 右：三大辅助研判 */}
                    <div className="space-y-3">
                      <div className="rounded border p-2">
                        <div className="mb-1 text-xs text-gray-500">① 失联修复线索（合规）</div>
                        <div className="text-sm">可达性得分：<b className="text-[#1677ff]">{g.lostRepair.score}</b></div>
                        <div className="text-xs text-gray-600">{g.lostRepair.hint}</div>
                      </div>
                      <div className="rounded border p-2">
                        <div className="mb-1 text-xs text-gray-500">② 团伙风险提示</div>
                        {g.gang.inGang
                          ? <div className="text-sm text-red-600">处于逾期团伙 {g.gang.gangId}（{g.gang.gangSize}人）· {g.gang.level} · {g.gang.risk}</div>
                          : <div className="text-sm text-green-600">未命中逾期团伙网络</div>}
                      </div>
                      <div className="rounded border p-2">
                        <div className="mb-1 text-xs text-gray-500">③ 还款能力/意愿辅助</div>
                        <div className="text-xs text-gray-600">{g.ability}</div>
                      </div>
                    </div>
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-400">合规说明：图谱仅使用系统已授权内部数据（本人/紧急联系人/共借人/担保人/同址同设备逾期客户/历史关联案件），不直接外呼陌生关联人，仅作风险研判与线索参考。</div>
              </div>
            </div>
          </div>
        )
      })()}

    </ZzPage>
  )
}

/* ---------------- 结案快照弹窗 ---------------- */
function ZzSnapshotModal({ c, onClose }: { c: ZzCase; onClose: () => void }) {
  return (
    <ZzModal open title="结案快照" onClose={onClose} width={560} footer={<ZzBtn primary onClick={onClose}>关闭</ZzBtn>}>
      <div className="space-y-3 text-sm">
        <div className="rounded bg-amber-50 p-3 text-amber-700">本快照为案件结案时定格的客户与处置信息，仅作审计留档，不可编辑。</div>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded border p-3"><div className="text-xs text-gray-400">结案方式</div><div className="font-semibold">{c.status}</div></div>
          <div className="rounded border p-3"><div className="text-xs text-gray-400">结案时间</div><div className="font-semibold">{c.lastTouch}</div></div>
          <div className="rounded border p-3"><div className="text-xs text-gray-400">原始逾期总额</div><div className="font-semibold">{money(c.total)}</div></div>
          <div className="rounded border p-3"><div className="text-xs text-gray-400">结案剩余</div><div className="font-semibold">{money(c.remainTotal)}</div></div>
        </div>
        <div className="rounded border p-3 text-xs text-gray-500">快照包含：客户建档信息、委案金额、全部还款/催收/PTP 记录、审批与操作日志，导出时一并打包。</div>
      </div>
    </ZzModal>
  )
}

/* ---------------- 登记 PTP 弹窗 ---------------- */
function ZzPtpRegisterModal({ caseId, role, defaultKind = '口头PTP', onClose, onSave }: { caseId: string; role: string; defaultKind?: '口头PTP' | '正式协议'; onClose: () => void; onSave: () => void }) {
  const [promiseTime, setPromiseTime] = useState('2026-08-28')
  const [dueTime, setDueTime] = useState('2026-08-31')
  const [amt, setAmt] = useState(20000)
  const [kind, setKind] = useState<'口头PTP' | '正式协议'>(defaultKind)
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  const submit = () => {
    if (!note.trim()) { setErr('需填写承诺说明'); return }
    if (new Date(dueTime) < new Date(promiseTime)) { setErr('到期时间不能早于承诺时间'); return }
    setErr('')
    alert(`已登记${kind}：${caseId}，承诺 ${money(amt)}，到期 ${dueTime}`)
    onSave()
  }
  return (
    <ZzModal open title="登记 PTP" onClose={onClose} width={560} footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={submit}>保存</ZzBtn></>}>
      <div className="grid grid-cols-2 gap-3">
        <ZzField label="PTP类型"><ZzSelect value={kind} onChange={(e) => setKind(e.target.value as any)}><option>口头PTP</option><option>正式协议</option></ZzSelect></ZzField>
        <ZzField label="承诺金额"><ZzInput type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} /></ZzField>
        <ZzField label="承诺还款时间"><ZzInput type="date" value={promiseTime} onChange={(e) => setPromiseTime(e.target.value)} /></ZzField>
        <ZzField label="到期时间"><ZzInput type="date" value={dueTime} onChange={(e) => setDueTime(e.target.value)} /></ZzField>
        <ZzField label="承诺说明（必填）"><ZzTextarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="说明承诺来源与核实情况" /></ZzField>
      </div>
      {err && <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-gray-600">当前操作人：{role}。登记后将计入 PTP 记录并关联本次催收行动，到期未履约自动标记为 BP 失约。</div>
    </ZzModal>
  )
}

/* ---------------- 新增催收记录（行动记录）弹窗 ---------------- */
function ZzActionAddModal({ caseId, role, ptpOptions, onClose, onSave }: { caseId: string; role: string; ptpOptions: string[]; onClose: () => void; onSave: (rec: any) => void }) {
  const today = new Date().toISOString().slice(0, 10)
  const [channel, setChannel] = useState<'外呼' | '短信' | '微信' | '上门'>('外呼')
  const [rec, setRec] = useState('')
  const [who, setWho] = useState(role)
  const [time, setTime] = useState(today)
  const [recUrl, setRecUrl] = useState('')
  const [ptpId, setPtpId] = useState('')
  const [err, setErr] = useState('')
  const submit = () => {
    if (!rec.trim()) { setErr('催收内容必填'); return }
    setErr('')
    onSave({ id: 'ACT-' + Date.now(), channel, rec: rec.trim(), who, time, recording: !!recUrl.trim(), ptpId: ptpId || '' })
  }
  return (
    <ZzModal open title="新增催收记录" onClose={onClose} width={560} footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={submit}>保存</ZzBtn></>}>
      <div className="grid grid-cols-2 gap-3">
        <ZzField label="渠道类型"><ZzSelect value={channel} onChange={(e) => setChannel(e.target.value as any)}><option>外呼</option><option>短信</option><option>微信</option><option>上门</option></ZzSelect></ZzField>
        <ZzField label="催收员"><ZzInput value={who} onChange={(e) => setWho(e.target.value)} /></ZzField>
        <ZzField label="记录时间"><ZzInput type="date" value={time} onChange={(e) => setTime(e.target.value)} /></ZzField>
        <ZzField label="关联PTP（选填）"><ZzSelect value={ptpId} onChange={(e) => setPtpId(e.target.value)}><option value="">不关联</option>{ptpOptions.map((p) => <option key={p} value={p}>{p}</option>)}</ZzSelect></ZzField>
        <ZzField label="录音文件（选填）"><ZzInput value={recUrl} onChange={(e) => setRecUrl(e.target.value)} placeholder="录音URL或文件名" /></ZzField>
        <ZzField label="催收内容（必填）"><ZzTextarea value={rec} onChange={(e) => setRec(e.target.value)} placeholder="登记本次催收沟通要点" /></ZzField>
      </div>
      {err && <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-gray-600">当前操作人：{role}。保存后该记录将出现在下方「行动记录」表格；若关联了 PTP，对应 PTP 记录会显示「来源催收」回跳。</div>
    </ZzModal>
  )
}
