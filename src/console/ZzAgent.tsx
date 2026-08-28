import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ZzPage, ZzCard, ZzTable, ZzTabs, ZzBtn, ZzField, ZzSelect, ZzInput, ZzTextarea, ZzBadge, ZzStat, ZzModal, ZzFilterBar } from './zzUi'
import { ZZ_AGENT_STAT, ZZ_AGENT_POOL, zzDetailOf, ZZ_CASES, zzAiLogOf, zzFlowOf, zzTranscriptOf, zzCallObjective, zzScriptRef, ZZ_AGENT_PTP, ZZ_AGENT_NEGO } from './zzData'
import type { ZzAgentCase, AgentPtp, AgentNego } from './zzData'
type PtpRow = AgentPtp
type NegoRow = AgentNego

/* 合规管控：与策略画布「合规管控配置」保持一致 —— 22:00-08:00 禁止外呼；单客户每日最大呼叫次数 */
const CALL_WINDOW = '08:00-22:00'
const BAN_WINDOW = '22:00-08:00'
const MAX_CALL = 2

const AGENT_PAGES = [
  { key: 'zz:agent-pool', label: '我的案件池', render: () => <ZzAgentPool /> },
]

export function ZzAgentModule({ pageKey }: { pageKey: string }) {
  const active = AGENT_PAGES.find((p) => p.key === pageKey) ?? AGENT_PAGES[0]
  return (
    <div>
      <div className="mb-4 flex gap-2 border-b border-slate-200">
        {AGENT_PAGES.map((p) => (
          <div key={p.key} className={`px-3 pb-2 text-sm ${p.key === active.key ? 'border-b-2 border-[#1677ff] font-medium text-[#1677ff]' : 'text-gray-500'}`}>{p.label}</div>
        ))}
      </div>
      {active.render()}
    </div>
  )
}

/* ============================ 我的案件池 ============================ */
function ZzAgentPool() {
  const [pool, setPool] = useState(ZZ_AGENT_POOL)
  const nav = useNavigate()
  const [drawer, setDrawer] = useState<{ id: string; tab: string } | null>(null)
  const [sms, setSms] = useState<ZzAgentCase | null>(null)
  const [fStatus, setFStatus] = useState('')
  const [fStage, setFStage] = useState('')
  const [fDue, setFDue] = useState('')
  const [fScope, setFScope] = useState<'全部' | '今日待办'>('全部')

  const TODAY = '2026-08-27'
  const isTodayTodo = (p: ZzAgentCase) =>
    p.status === '待跟进' || p.status === '承诺到期' || (p.promiseDue && p.promiseDue <= TODAY && p.promiseDue !== '-')
  const list = pool.filter((p) =>
    (!fStatus || p.status === fStatus) &&
    (!fStage || p.stage === fStage) &&
    (!fDue || p.promiseDue === fDue) &&
    (fScope === '全部' || isTodayTodo(p))
  )

  const openCase = (c: ZzAgentCase, tab = '📋案件概览') => setDrawer({ id: c.id, tab })

  // 承诺保存后，刷新表格行的承诺还款时间 + 标签 + 状态
  const onPromise = (id: string, date: string) => {
    setPool((ps) => ps.map((p) => p.id === id
      ? { ...p, promise: date, promiseDue: date, status: '待回款', tags: p.tags.includes('📝有还款承诺') ? p.tags : [...p.tags, '📝有还款承诺'] }
      : p))
  }

  return (
    <ZzPage title="我的案件池" crumb="催贷管理 / 坐席工作台" subtitle="坐席名下案件：点击整行或「打开案件」唤起右侧常驻抽屉；在「通话&处置工作台」单页完成通话→写催记→登记承诺，无需切换 Tab（替散弹窗）">
      <ZzFilterBar>
        <ZzField label="案件状态">
          <ZzSelect value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
            <option value="">全部</option>
            <option>待跟进</option>
            <option>承诺到期</option>
            <option>协商中</option>
            <option>待回款</option>
          </ZzSelect>
        </ZzField>
        <ZzField label="账龄">
          <ZzSelect value={fStage} onChange={(e) => setFStage(e.target.value)}>
            <option value="">全部</option>
            <option>M1</option>
            <option>M2</option>
            <option>M3+</option>
          </ZzSelect>
        </ZzField>
        <ZzField label="承诺到期日">
          <ZzInput type="date" value={fDue} onChange={(e) => setFDue(e.target.value)} />
        </ZzField>
        <ZzBtn onClick={() => { setFStatus(''); setFStage(''); setFDue(''); setFScope('全部') }}>重置</ZzBtn>
      </ZzFilterBar>

      <div className="mb-3 flex items-center gap-3">
        <span className="text-sm text-gray-500">范围：</span>
        <div className="inline-flex overflow-hidden rounded border border-slate-300">
          {(['全部', '今日待办'] as const).map((s, i) => (
            <button key={s} onClick={() => setFScope(s)} className={`px-4 py-1.5 text-sm ${i > 0 ? 'border-l border-slate-300' : ''} ${fScope === s ? 'bg-[#1677ff] text-white' : 'bg-white text-gray-600 hover:bg-slate-50'}`}>{s}</button>
          ))}
        </div>
      </div>

      <ZzCard title={`案件池（${list.length}）`}>
        <ZzTable
          stickyAction
          head={['案件', '客户', '逾期金额', '账龄', '承诺还款时间', '上次催记', '案件标签', '操作']}
          rowKey={(i) => list[i].id}
          onRow={(i) => openCase(list[i])}
          rows={list.map((p) => [
            <button className="font-mono text-left text-[#1677ff] hover:underline" onClick={(e) => { e.stopPropagation(); nav('/console/zz/case-detail?id=' + p.id) }}>{p.id}</button>,
            <span className="font-medium">{p.name}</span>,
            <span className="font-semibold text-red-600">{money(p.total)}</span>,
            <ZzBadge color={p.stage === 'M3+' ? '#DC2626' : p.stage === 'M2' ? '#EA580C' : '#1677ff'}>{p.stage}</ZzBadge>,
            p.promise === '-' ? <span className="text-gray-400">—</span> : <span className="font-medium">{p.promise}</span>,
            <span className="block max-w-[150px] truncate" title={p.lastNote}>{p.lastNote}</span>,
            <div className="flex flex-nowrap gap-1">{p.tags.map((t) => <TagBadge key={t} tag={t} />)}</div>,
            <div className="flex flex-nowrap gap-1 items-center" onClick={(e) => e.stopPropagation()}>
              <ZzBtn sm primary onClick={() => openCase(p)}>查看详情</ZzBtn>
              {!p.archived && (<>
                <ZzBtn sm onClick={() => openCase(p, '💬通话&处置工作台')}>一键外呼</ZzBtn>
                <ZzBtn sm onClick={() => setSms(p)}>短信</ZzBtn>
              </>)}
            </div>,
          ])}
        />
      </ZzCard>

      {drawer && (
        <CaseDrawer
          key={drawer.id}
          caseId={drawer.id}
          initTab={drawer.tab}
          onClose={() => setDrawer(null)}
          onPromise={onPromise}
        />
      )}
      {sms && <SmsModal cs={sms} onClose={() => setSms(null)} />}
    </ZzPage>
  )
}

/* ============================ 案件标签 / 状态色 ============================ */
const CASE_TAG_COLOR: Record<string, string> = {
  '🔔待跟进': '#64748B',
  '📝有还款承诺': '#D97706',
  '🤝已协商方案': '#2563EB',
  '🤖AI已外呼': '#7C3AED',
  '❌多次未接通': '#EA580C',
  '失联': '#DC2626',
  '📦已归档': '#6B7280',
}
function TagBadge({ tag }: { tag: string }) {
  const c = CASE_TAG_COLOR[tag] ?? '#64748B'
  return <span className="whitespace-nowrap rounded px-1.5 py-0.5 text-xs font-medium" style={{ background: c + '1A', color: c, border: '1px solid ' + c + '40' }}>{tag}</span>
}
const STATUS_COLOR: Record<string, string> = { '待跟进': '#64748B', '承诺到期': '#DC2626', '协商中': '#2563EB', '待回款': '#16A34A' }

function money(n: number) { return '¥' + n.toLocaleString('zh-CN') }
function fmtTime(s: number) { return [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((v) => String(v).padStart(2, '0')).join(':') }

/* 生成可播放的 WAV 录音（16bit PCM，模拟通话波形），支持进度条拖拽 */
function genRecWav(seed: string): string {
  const sr = 8000
  const sec = 6
  const n = sr * sec
  const buf = new ArrayBuffer(44 + n * 2)
  const dv = new DataView(buf)
  const ws = (o: number, s: string) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)) }
  ws(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); ws(8, 'WAVE')
  ws(12, 'fmt '); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true)
  dv.setUint32(24, sr, true); dv.setUint32(28, sr * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true)
  ws(36, 'data'); dv.setUint32(40, n * 2, true)
  let sv = 0
  for (let i = 0; i < seed.length; i++) sv += seed.charCodeAt(i)
  const f1 = 420 + (sv % 80)
  const f2 = 640 + (sv % 120)
  for (let i = 0; i < n; i++) {
    const t = i / sr
    const seg = Math.floor(t * 1.4) % 2
    const f = seg === 0 ? f1 : f2
    const amp = seg === 0 ? 0.32 : 0.22
    dv.setInt16(44 + i * 2, Math.round(Math.sin(2 * Math.PI * f * t) * amp * 32767), true)
  }
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }))
}

/* 录音播放器 */
function RecPlayer({ url, label = '▶ 播放录音' }: { url: string; label?: string }) {
  const [show, setShow] = useState(false)
  if (!show) return <button className="text-xs font-medium text-[#1677ff] hover:underline" onClick={() => setShow(true)}>{label}</button>
  return (
    <span className="inline-flex items-center gap-2">
      <audio controls src={url} className="h-8 w-44" />
      <a href={url} download="recording.wav" className="text-xs text-[#1677ff] hover:underline">下载</a>
    </span>
  )
}

/* ============================ 右侧常驻抽屉 ============================ */
const TABS = ['📋案件概览', '💬通话&处置工作台', '📜历史记录']

type CallState = 'idle' | 'dialing' | 'ringing' | 'connected' | 'missed' | 'rejected' | 'ended'

function CaseDrawer({ caseId, initTab, onClose, onPromise }: { caseId: string; initTab: string; onClose: () => void; onPromise: (id: string, date: string) => void }) {
  const nav = useNavigate()
  const cs = useMemo(() => ZZ_AGENT_POOL.find((p) => p.id === caseId)!, [caseId])
  const detail = useMemo(() => zzDetailOf(caseId), [caseId])
  const aiLog = useMemo(() => zzAiLogOf(caseId), [caseId])
  const flow = useMemo(() => zzFlowOf(caseId), [caseId])
  const transcriptLines = useMemo(() => zzTranscriptOf(caseId), [caseId])
  const recUrl = useMemo(() => genRecWav(caseId), [caseId])

  // 打开案件详情页：关闭抽屉并跳转，保证与「案件详情页」共享 PTP/协商方案数据
  const openDetail = () => { onClose(); nav('/console/zz/case-detail?id=' + encodeURIComponent(caseId)) }

  const [tab, setTab] = useState(initTab)
  const [notes, setNotes] = useState(detail.actions)
  // 初始化：共享存储（坐席录入）+ 案件详情页样例，保持单一数据源
  const [ptps, setPtps] = useState<PtpRow[]>(() => [
    ...(ZZ_AGENT_PTP[caseId] ?? []),
    ...detail.ptpOral.map((p) => ({ id: p.id, date: p.promiseTime, amt: p.promiseAmt, type: '部分', status: p.status === '已失约' ? '已失信' : (p.status as any), note: p.note })),
  ])
  const [negos, setNegos] = useState<NegoRow[]>(() => [
    ...(ZZ_AGENT_NEGO[caseId] ?? []),
    ...detail.ptpAgreement.map((a) => ({ id: a.id, type: '二次分期', terms: 6, perAmt: Math.round(a.amt / 6), firstDue: a.promiseTime, status: a.status === '已作废' ? '已失效' : a.status === '生效中' ? '已生效' : '待确认', note: a.note })),
  ])
  const [contacts, setContacts] = useState(detail.contacts)
  const [savedRecUrl, setSavedRecUrl] = useState('')

  // —— 通话状态机 ——
  const [call, setCall] = useState<CallState>('idle')
  const [secs, setSecs] = useState(0)
  const [muted, setMuted] = useState(false)
  const [transfer, setTransfer] = useState('')
  const [intent, setIntent] = useState('')
  const [contactSel, setContactSel] = useState('本人')
  const [transcript, setTranscript] = useState('')
  const [todayCalls, setTodayCalls] = useState(0)
  const [compliance, setCompliance] = useState('')
  const [pendingNote, setPendingNote] = useState(false)
  const [liveCall, setLiveCall] = useState(false)
  const [callId, setCallId] = useState('')
  const timers = useRef<number[]>([])
  const clearTimers = () => { timers.current.forEach((t) => { clearTimeout(t); clearInterval(t) }); timers.current = [] }
  useEffect(() => () => clearTimers(), [])

  const hour = new Date().getHours()
  const winBlocked = compliance ? compliance.includes('时段') : (hour >= 22 || hour < 8)
  const callBlocked = winBlocked || todayCalls >= MAX_CALL

  const startCall = () => {
    if (winBlocked) { setCompliance('当前时段禁止外呼（' + BAN_WINDOW + '）'); return }
    if (todayCalls >= MAX_CALL) { setCompliance(`今日呼叫次数已达上限（${MAX_CALL} 次）`); return }
    setCompliance('')
    setCallId('CALL-' + Date.now())
    setTodayCalls((c) => c + 1)
    setCall('dialing'); setLiveCall(true); setSecs(0); setTransfer(''); setMuted(false); setTranscript('')
    timers.current.push(window.setTimeout(() => setCall('ringing'), 1600))
    timers.current.push(window.setTimeout(() => {
      if (cs.tags.includes('失联') || cs.tags.includes('❌多次未接通')) {
        setCall('missed'); setLiveCall(false)
      } else {
        setCall('connected')
        timers.current.push(window.setInterval(() => setSecs((s) => s + 1), 1000))
        let i = 0
        timers.current.push(window.setInterval(() => {
          if (i < transcriptLines.length) {
            const line = transcriptLines[i] || ''
            setTranscript((t) => (t ? t + '\n' : '') + line)
            i++
          } else clearTimers()
        }, 2200))
      }
    }, 3200))
  }

  const hangup = () => {
    clearTimers()
    setCall('ended'); setLiveCall(false)
    setSavedRecUrl(recUrl)
    setPendingNote(true)
  }

  const tryClose = () => {
    if (liveCall) { alert('通话进行中，请先挂断通话后再关闭抽屉'); return }
    if (pendingNote) { alert('挂断通话后需先填写本次催记，请在本页「处置录入」区保存后再关闭'); return }
    onClose()
  }

  const addNote = (rec: string, content: string, attitude: string, followTxt: string, next: string, cid: string, transcript: string, intent: string, ptp: PtpRow | null, nego: NegoRow | null, objective: string) => {
    const now = new Date()
    const t = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setNotes((l) => [{ id: 'ACT-' + Date.now(), rec: content + (attitude ? `（态度：${attitude}）` : '') + (followTxt ? `｜后续：${followTxt}` : '') + (next ? `｜下次跟进：${next}` : ''), who: '李娜（我）', time: t, channel: '外呼', recording: !!rec, ptpId: '', callId: cid, transcript: transcript || '', intent, attitude, follow: followTxt, next, ptp, nego, objective }, ...l])
    setPendingNote(false)
  }
  const saveNote = (rec: string, content: string, attitude: string, follow: string, next: string, cid: string, transcript: string, intent: string, ptp: PtpRow | null, nego: NegoRow | null, objective: string) => addNote(rec, content, attitude, follow, next, cid, transcript, intent, ptp, nego, objective)
  const savePtp = (row: PtpRow) => {
    ZZ_AGENT_PTP[cs.id] = [row, ...(ZZ_AGENT_PTP[cs.id] ?? [])]
    setPtps((l) => [row, ...l]); onPromise(cs.id, row.date)
  }
  const saveNego = (row: NegoRow) => {
    ZZ_AGENT_NEGO[cs.id] = [row, ...(ZZ_AGENT_NEGO[cs.id] ?? [])]
    setNegos((l) => [row, ...l])
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={tryClose} />
      <div className="relative flex h-full w-[860px] max-w-[95vw] flex-col bg-white shadow-2xl">
        <style>{`@keyframes zzDrawerIn { from { transform: translateX(60px); opacity: .3 } to { transform: translateX(0); opacity: 1 } }`}</style>
        {/* 抽屉头 */}
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <div className="text-base font-bold">{cs.id}｜{cs.name}｜逾期 {money(cs.total)} 元</div>
            <div className="mt-0.5 text-xs text-gray-500">账龄 {cs.stage} · 逾期 {cs.overdueDays} 天 · 合同 {cs.contract}</div>
          </div>
          <div className="flex items-center gap-2">
            {pendingNote && <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600">⚠ 本次通话未记录</span>}
            <button className="rounded p-1 text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={tryClose}>✕</button>
          </div>
        </div>

        <ZzTabs tabs={TABS} active={tab} onChange={setTab} />

        <div className="flex-1 overflow-y-auto p-4">
          {tab === '📋案件概览' && (
            <OverviewTab cs={cs} detail={detail} notes={notes} ptps={ptps} negos={negos} contacts={contacts} setContacts={setContacts} recUrl={recUrl} onOpenDetail={openDetail} />
          )}
          {tab === '💬通话&处置工作台' && (
            <WorkbenchTab
              cs={cs} call={call} secs={secs} muted={muted} transfer={transfer} intent={intent} contactSel={contactSel}
              transcript={transcript} todayCalls={todayCalls} callBlocked={callBlocked} winBlocked={winBlocked} compliance={compliance}
              recUrl={recUrl} savedRecUrl={savedRecUrl} liveCall={liveCall} pendingNote={pendingNote} callId={callId}
              notes={notes} ptps={ptps} negos={negos} disabled={!!cs.archived} contacts={contacts}
              onIntent={setIntent} onContact={setContactSel} onMute={() => setMuted((m) => !m)} onTransfer={(name) => setTransfer(name)}
              onStart={startCall} onHangup={hangup}
              onSaveNote={saveNote} onSavePtp={savePtp} onSaveNego={saveNego}
            />
          )}
          {tab === '📜历史记录' && (
            <HistoryTab notes={notes} ptps={ptps} negos={negos} recUrl={recUrl} aiLog={aiLog} flow={flow} />
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================ 从实时转录智能提取还款承诺（防 undefined） ============================ */
function extractPromise(text: string, total: number) {
  let amt: number | null = null
  const amts = [...text.matchAll(/(\d+(?:\.\d+)?)\s*万/g)]
  if (amts.length) amt = Math.round(parseFloat(amts[amts.length - 1][1]) * 10000)
  if (amt == null) {
    const m2 = [...text.matchAll(/(\d{3,7})\s*元/g)]
    if (m2.length) amt = parseInt(m2[m2.length - 1][1], 10)
  }
  let date: string | null = null
  const dm = [...text.matchAll(/(\d{4})-(\d{2})-(\d{2})/g)]
  if (dm.length) date = dm[dm.length - 1][0]
  else {
    const d = [...text.matchAll(/(\d{1,2})\s*月\s*(\d{1,2})\s*号?/g)]
    if (d.length) { const mon = d[d.length - 1][1].padStart(2, '0'); const day = d[d.length - 1][2].padStart(2, '0'); date = `2026-${mon}-${day}` }
    else {
      const d2 = [...text.matchAll(/(\d{1,2})\s*号/g)]
      if (d2.length) {
        const day = parseInt(d2[d2.length - 1][1], 10)
        const now = new Date()
        let mon = now.getMonth() + 1
        let yr = now.getFullYear()
        if (day < now.getDate()) { mon++; if (mon > 12) { mon = 1; yr++ } }
        date = `${yr}-${String(mon).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      }
    }
  }
  return { amt, date, type: amt != null && amt < total ? '部分' : '全额' }
}

/* ============================ 通话&处置工作台（单页整合） ============================ */
const SCRIPT: Record<string, string> = {
  '': '先共情 → 确认还款意愿 → 给出分期 / 延期方案 → 引导登记承诺',
  '承诺还款': '确认金额与日期 → 在本页下方「还款承诺」登记',
  '无力偿还': '表达理解 → 主动提供二次分期 / 延期方案 → 评估可负担金额',
  '拒绝还款': '合规告知逾期后果（不得威胁 / 上门）→ 记录态度 → 安排下次跟进',
  '情绪对抗': '先安抚情绪 → 避免正面冲突 → 必要时结束通话并记录',
}

/* ============================ 话术参考：右侧抽屉（大模型依据当前通话需求生成） ============================ */
function ScriptDrawer({ open, onClose, cs, objective, intent }: any) {
  const [gen, setGen] = useState(false)
  const [built, setBuilt] = useState<any[]>([])
  useEffect(() => {
    if (!open) return
    setGen(true); setBuilt([])
    const t = setTimeout(() => {
      setBuilt(zzScriptRef(objective))
      setGen(false)
    }, 700)
    return () => clearTimeout(t)
  }, [open, objective, intent])
  if (!open) return null
  const fill = (s: string) => s.replace(/\{客户\}/g, cs.name).replace(/\{金额\}/g, money(cs.total)).replace(/\{承诺日\}/g, cs.promiseDue || '—').replace(/\{期数\}/g, '6').replace(/\{每期金额\}/g, money(600)).replace(/\{首期日\}/g, '—').replace(/\{工号\}/g, 'A1024')
  return (
    <div className="fixed inset-0 z-[1100]">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute right-0 top-0 flex h-full w-[480px] max-w-[92vw] flex-col bg-white shadow-2xl" style={{ animation: 'zzDrawerIn .2s ease' }}>
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="text-sm font-semibold">💡 话术参考（大模型生成）</div>
          <button className="text-xl leading-none text-gray-400 hover:text-gray-600" onClick={onClose}>✕</button>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="rounded bg-[#1677ff]/5 px-3 py-2 text-xs text-gray-600">
            通话目标：{objective.title}（来源：{objective.source} · 优先级 {objective.level === 'high' ? '高' : objective.level === 'mid' ? '中' : '低'}）
            {intent ? ` ｜ 当前客户意图：${intent}` : ''}
          </div>
          {gen ? (
            <div className="py-10 text-center text-sm text-gray-400">🤖 大模型正在依据当前通话需求生成话术…</div>
          ) : (
            <>
              {built.map((sc: any, i: number) => (
                <div key={i} className="rounded border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-1 text-xs font-semibold text-[#1677ff]">{sc.scenario}</div>
                  <ul className="list-decimal space-y-1 pl-4 text-xs leading-relaxed text-gray-700">
                    {sc.lines.map((ln: string, j: number) => <li key={j}>{fill(ln)}</li>)}
                  </ul>
                </div>
              ))}
              <div className="text-[11px] text-gray-400">※ 话术由大模型依据当前通话目标与意图实时生成，模板变量已按案件填充；请严格遵守合规红线，不得威胁 / 骚扰第三方。</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function WorkbenchTab(props: any) {
  const { cs, call, secs, muted, transfer, intent, contactSel, transcript, todayCalls, callBlocked, winBlocked, compliance, recUrl, savedRecUrl, liveCall, pendingNote, callId,
    notes, ptps, negos, disabled, contacts,
    onIntent, onContact, onMute, onTransfer, onStart, onHangup,
    onSaveNote, onSavePtp, onSaveNego } = props

  const emergency = cs.tags.includes('失联') ? '137****2211（紧急联系人）' : null
  const hasNote = notes.length > 0
  const ex = extractPromise(transcript, cs.total)
  // 本次通话目标：多源自动推导（承诺到期/失联/协商/状态/阶段策略），坐席可手动调整
  const objective = useMemo(() => zzCallObjective(cs, ptps), [cs, ptps])
  const [tTitle, setTTitle] = useState('')
  const [tNote, setTNote] = useState('')
  const [showScriptDrawer, setShowScriptDrawer] = useState(false)
  const [showObjective, setShowObjective] = useState(false)
  const scripts = useMemo(() => zzScriptRef(objective), [objective])
  const objTitle = tTitle || objective.title
  // 从实时转录重新提取并回填 PTP 表单；未识别到则提示手动填写（保证「一键填充」始终可点）
  const fillFromTranscript = () => {
    const r = extractPromise(transcript, cs.total)
    if (r.date) setPDate(r.date)
    if (r.amt != null) setPAmt(r.amt)
    setPType(r.amt != null ? r.type : '部分')
    // 依据转录内容自动选择「后续跟进动作」
    const t = transcript || ''
    if (t.includes('分期') || t.includes('方案')) setFollow('预约上门')
    else if (t.includes('函件') || t.includes('信')) setFollow('寄送催收函件')
    else if (t.includes('短信') || t.includes('消息')) setFollow('短信提醒')
    else if (r.amt != null || r.date != null) setFollow('电话复访')
    else if (intent === '未接通') setFollow('短信提醒')
    if (r.amt == null && r.date == null) alert('AI 暂未从本次通话识别到明确的还款金额/日期，请手动填写下方表单，或点「引用转录」把对话带入催记。')
  }

  // 未接通/拒接的通话，自动把客户意图标记为「未接通」（仅在用户尚未手动选择意图时）
  useEffect(() => { if ((call === 'missed' || call === 'rejected') && !intent) onIntent('未接通') }, [call, intent])

  // 左栏录入状态
  const [content, setContent] = useState('')
  const [attitude, setAttitude] = useState('配合')
  const [follow, setFollow] = useState('')
  const [next, setNext] = useState('')
  const [pDate, setPDate] = useState('')
  const [pAmt, setPAmt] = useState(20000)
  const [pType, setPType] = useState('部分')
  const [pNote, setPNote] = useState('')
  const [nType, setNType] = useState('二次分期')
  const [terms, setTerms] = useState(6)
  const [perAmt, setPerAmt] = useState(600)
  const [firstDue, setFirstDue] = useState('')
  const [preview, setPreview] = useState('')
  const [okAll, setOkAll] = useState(false)

  const statusBar = () => {
    const bar = (cls: string, html: string) => <div className={`rounded p-3 text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: html }} />
    switch (call) {
      case 'idle': return bar('bg-slate-100 text-slate-500', '待机 · 点击下方「发起外呼」开始呼叫')
      case 'dialing': return bar('bg-blue-50 text-blue-600', '拨号中… <span class="animate-pulse">●●●</span>')
      case 'ringing': return bar('bg-blue-50 text-blue-600', '振铃中 📞 <span class="animate-pulse">等待接听…</span>')
      case 'connected': return (
        <div className="rounded p-3 text-sm font-medium text-white" style={{ background: '#16A34A' }}>
          ✅ 已接通 ｜ 录音进行中 <span className="ml-1 inline-block h-2.5 w-2.5 rounded-full bg-red-300 align-middle animate-pulse" /> ｜ 通话计时 {fmtTime(secs)}
          {muted && ' ｜ 🔇已静音'}{transfer && ` ｜ 已转接 ${transfer}`}
        </div>
      )
      case 'missed': return bar('bg-red-50 text-red-600', '❌ 无人接听（通话 ' + secs + 's）')
      case 'rejected': return bar('bg-red-50 text-red-600', '❌ 客户拒接')
      case 'ended': return bar('bg-slate-100 text-slate-600', `通话已结束（${fmtTime(secs)}）｜ 可播放本次录音`)
    }
  }

  const saveAll = () => {
    if (disabled) return
    if (!content.trim()) { alert('请先填写催记内容摘要'); return }
    const cid = callId || ('CALL-' + Date.now())
    const tLine = `🎯目标：${objTitle}${tNote ? '（' + tNote + '）' : ''}｜`
    const savedPtp: PtpRow | null = pDate ? { id: 'PTP-' + Date.now(), date: pDate, amt: pAmt, type: pType, status: '待履约', note: pNote, callId: cid } : null
    const savedNego: NegoRow | null = firstDue ? { id: 'NEG-' + Date.now(), type: nType, terms, perAmt, firstDue, status: '待确认', note: '', callId: cid } : null
    // 本次通话目标 + 快速录入结构化字段 + 关联的承诺/方案，一并写入历史催记（避免历史单薄）
    onSaveNote(pendingNote ? savedRecUrl : '', tLine + content, attitude, follow, next, cid, transcript, intent, savedPtp, savedNego, objTitle)
    if (savedPtp) onSavePtp(savedPtp)
    if (savedNego) onSaveNego(savedNego)
    setContent(''); setFollow(''); setNext('')
    if (savedPtp) { setPDate(''); setPNote('') }
    if (savedNego) {
      setPreview(`《协商还款协议（系统预览）》\n案件：${cs.id}　客户：${cs.name}　欠款：${money(cs.total)}\n方案：${nType}　共 ${terms} 期　每期 ${money(perAmt)}　首期 ${firstDue}\n合计应还 ${money(terms * perAmt)}。客户确认后正式生效，逾期将转交法务处理。`)
    }
    setOkAll(true); setTimeout(() => setOkAll(false), 2500)
  }

  return (
    <div className="space-y-4">
      {/* ===== 本次通话目标（多源自动推导，原因/建议动作常驻可见，目标类型可展开调整） ===== */}
      <div className="rounded border-l-4 border-[#1677ff] bg-[#1677ff]/5 p-3">
        <div className="flex cursor-pointer items-center justify-between" onClick={() => setShowObjective((v) => !v)}>
          <span className="text-sm font-semibold text-[#1677ff]">🎯 本次通话目标（{showObjective ? '收起调整' : '展开调整'}）</span>
          <div className="flex items-center gap-2">
            <span className="rounded bg-white/70 px-2 py-0.5 text-xs text-gray-500">来源：{objective.source}</span>
            <span className="text-xs text-gray-400">{showObjective ? '▲' : '▼'}</span>
          </div>
        </div>
        <div className="mt-1 text-sm font-medium text-gray-800">{objTitle}</div>
        <div className="mt-0.5 text-xs text-gray-500">原因：{objective.reason}</div>
        <div className="mt-0.5 text-xs text-gray-500">建议动作：{objective.action}</div>

        {showObjective && !disabled && (
          <div className="mt-2 space-y-2 border-t border-[#1677ff]/10 pt-2">
            <ZzField label="目标类型（可调整）">
              <ZzSelect value={tTitle || '__auto'} onChange={(e) => setTTitle(e.target.value === '__auto' ? '' : e.target.value)}>
                <option value="__auto">自动（{objective.title}）</option>
                <option>核实承诺到账</option>
                <option>确认分期/协商方案生效</option>
                <option>建立联系推动首次承诺</option>
                <option>失联修复触达</option>
                <option>施压催收/预警法诉</option>
                <option>其他（见下方说明）</option>
              </ZzSelect>
            </ZzField>
            <ZzField label="目标补充说明（可选）">
              <ZzInput placeholder="如：重点核实工资到账后还款" value={tNote} onChange={(e) => setTNote(e.target.value)} />
            </ZzField>
          </div>
        )}
      </div>

      {/* ===== 上半区：通话控制区 ===== */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 bg-white p-2.5 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-500">外呼窗口 {CALL_WINDOW}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-500">今日已呼 {todayCalls}/{MAX_CALL}</span>
            {callBlocked
              ? <ZzBadge color="#DC2626">⚠ 触发合规限制</ZzBadge>
              : <ZzBadge color="#16A34A">✓ 合规通过</ZzBadge>}
            {callId && <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-gray-500">通话ID {callId}</span>}
          </div>
        </div>
        {compliance && <div className="rounded bg-red-50 p-2.5 text-xs text-red-600">{compliance}。按钮已置灰，无法发起呼叫。</div>}

        {statusBar()}

        <div className="rounded border border-slate-200 bg-white p-3">
          <ZzField label="通话联系人">
            <ZzSelect value={contactSel} onChange={onContact} disabled={disabled}>
              <option value="本人">本人（手机 {cs.phone}）</option>
              {contacts.filter((c: any) => c.rel !== '本人').map((c: any, i: number) => (
                <option key={i} value={`${c.rel}/${c.name}`}>{c.rel} {c.name}（{c.type} {c.tel}）</option>
              ))}
            </ZzSelect>
          </ZzField>
        </div>

        <div className="flex flex-wrap gap-2">
          {(call === 'idle' || call === 'ended' || call === 'missed' || call === 'rejected') && (
            <>
              <ZzBtn primary onClick={onStart} disabled={callBlocked || disabled}>{call === 'idle' ? '📞 发起外呼' : '🔁 重拨'}</ZzBtn>
              <ZzBtn onClick={() => setShowScriptDrawer(true)}>💡 话术参考</ZzBtn>
            </>
          )}
          {(call === 'dialing' || call === 'ringing') && <ZzBtn danger onClick={onHangup}>取消</ZzBtn>}
          {call === 'connected' && (
            <>
              <ZzBtn danger onClick={onHangup}>挂断</ZzBtn>
              <ZzBtn onClick={onMute}>{muted ? '🔇 取消静音' : '🎙 静音'}</ZzBtn>
              <ZzBtn onClick={() => { if (!emergency) { alert('该案件暂无紧急联系人'); return } onTransfer('紧急联系人') }}>{transfer ? '已转接 ✔' : '↪ 转接紧急联系人'}</ZzBtn>
            </>
          )}
        </div>

        {/* 话术参考：右侧抽屉（大模型依据当前通话目标/意图生成） */}
        <ScriptDrawer open={showScriptDrawer} onClose={() => setShowScriptDrawer(false)} cs={cs} objective={objective} intent={intent} />

        <div className="rounded border border-slate-200 bg-white p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium">实时转录（录音转文字，通话中持续输出）</span>
            <button className="text-xs text-[#1677ff] disabled:opacity-40" disabled={!transcript || disabled} onClick={() => navigator.clipboard?.writeText(transcript).catch(() => {})}>复制全文</button>
          </div>
          <ZzTextarea rows={6} readOnly value={transcript || (call === 'connected' ? '正在识别语音…' : '通话接通后开始实时转写')} className="w-full resize-none" />
        </div>

        {call === 'ended' && (
          <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">本次通话录音</span>
              <RecPlayer url={recUrl} label="▶ 播放录音" />
            </div>
            <div className="rounded bg-amber-50 p-2.5 text-xs text-amber-700">⚠ 已挂断：请在下方「处置录入」区填写本次催记{pendingNote ? '（必填，否则无法关闭抽屉）' : '（已记录）'}。</div>
          </div>
        )}
        {call === 'missed' && (
          <div className="rounded bg-slate-50 p-2.5 text-xs text-gray-500">未接通：可点「重拨」再次外呼，或前往下方录入区登记本次未接通。</div>
        )}
      </div>

      {/* ===== 下半区：本次通话处置录入（历史已移至「📜历史记录」Tab） ===== */}
      <div className="space-y-3">
        {disabled && <div className="rounded bg-gray-100 p-2.5 text-xs text-gray-500">该案件已归档，仅可查看「📜历史记录」Tab，不可录入。</div>}

        {/* AI 智能提取（非归档即显示，保证「一键填充」始终可见可点） */}
        {!disabled && (
          <div className="rounded border border-purple-200 bg-purple-50 p-3">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-sm font-medium text-purple-700">🤖 AI 智能提取</span>
              <ZzBtn sm onClick={fillFromTranscript}>一键填充表单</ZzBtn>
            </div>
            {!transcript ? (
              <div className="text-xs text-purple-800">发起通话后，AI 将实时识别客户说出的还款金额 / 日期，并支持一键回填下方 PTP 表单。</div>
            ) : ex.amt != null || ex.date != null ? (
              <div className="text-xs text-purple-800">提取金额：{ex.amt != null ? money(ex.amt) : '待补'} ｜ 承诺日期：{ex.date ?? '待补'} ｜ 类型：{ex.amt != null ? ex.type : '部分'}（点击右侧按钮回填下方 PTP 表单）</div>
            ) : (
              <div className="text-xs text-purple-800">AI 暂未从本次通话识别到明确的还款金额/日期，您可手动填写下方表单，或点「引用转录」把对话内容带入催记。</div>
            )}
          </div>
        )}

        {/* ① 快速催记录入 */}
        <ZzCard title={pendingNote ? '本次通话快速录入（必填）' : '本次通话快速录入'}>
          {pendingNote && <div className="mb-2 rounded bg-amber-50 p-2 text-xs text-amber-700">⚠ 本次通话未记录，请填写后保存，否则无法关闭抽屉。</div>}
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <ZzField label="客户意图"><ZzSelect value={intent} onChange={onIntent} disabled={disabled}>
                <option value="">标记意图</option>
                <option>承诺还款</option>
                <option>无力偿还</option>
                <option>拒绝还款</option>
                <option>情绪对抗</option>
                <option>未接通</option>
              </ZzSelect></ZzField>
              <ZzField label="客户态度"><ZzSelect value={attitude} onChange={(e) => setAttitude(e.target.value)} disabled={disabled}><option>配合</option><option>敷衍</option><option>抗拒</option><option>失联</option></ZzSelect></ZzField>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400">通话内容摘要</span>
              <button className="text-xs text-[#1677ff] disabled:opacity-40" disabled={!transcript || disabled} onClick={() => setContent(transcript.trim())}>引用转录</button>
            </div>
            <ZzTextarea rows={3} placeholder="通话内容摘要…" value={content} onChange={(e) => setContent(e.target.value)} disabled={disabled} className="w-full" />
            <div className="grid grid-cols-2 gap-2">
              <ZzField label="下次跟进时间"><ZzInput type="date" value={next} onChange={(e) => setNext(e.target.value)} disabled={disabled} /></ZzField>
              <ZzField label="后续跟进动作"><ZzSelect value={follow} onChange={(e) => setFollow(e.target.value)} disabled={disabled}>
                <option value="">请选择</option>
                <option>电话复访</option>
                <option>寄送催收函件</option>
                <option>短信提醒</option>
                <option>转交委外</option>
                <option>升级法务</option>
                <option>预约上门</option>
                <option>其他</option>
              </ZzSelect></ZzField>
            </div>
          </div>
        </ZzCard>

        {/* ② 还款承诺 & 协商方案 */}
        <ZzCard title="还款承诺 & 协商方案">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <ZzField label="承诺日期"><ZzInput type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} disabled={disabled} /></ZzField>
              <ZzField label="承诺金额"><ZzInput type="number" value={String(pAmt)} onChange={(e) => setPAmt(Number(e.target.value))} disabled={disabled} /></ZzField>
              <ZzField label="承诺类型"><ZzSelect value={pType} onChange={(e) => setPType(e.target.value)} disabled={disabled}><option>部分</option><option>全额</option></ZzSelect></ZzField>
              <ZzField label="备注"><ZzInput placeholder="如：先还 2 万，剩余分期" value={pNote} onChange={(e) => setPNote(e.target.value)} disabled={disabled} /></ZzField>
            </div>
          </div>
          <div className="my-3 border-t border-slate-100" />
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <ZzField label="方案类型"><ZzSelect value={nType} onChange={(e) => setNType(e.target.value)} disabled={disabled}><option>二次分期</option><option>延期还款</option><option>减免方案</option></ZzSelect></ZzField>
              <ZzField label="期数"><ZzInput type="number" value={String(terms)} onChange={(e) => setTerms(Number(e.target.value))} disabled={disabled} /></ZzField>
              <ZzField label="每期金额"><ZzInput type="number" value={String(perAmt)} onChange={(e) => setPerAmt(Number(e.target.value))} disabled={disabled} /></ZzField>
              <ZzField label="首期还款日"><ZzInput type="date" value={firstDue} onChange={(e) => setFirstDue(e.target.value)} disabled={disabled} /></ZzField>
            </div>
            {preview && <div className="mt-2 rounded border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 whitespace-pre-wrap">{preview}</div>}
          </div>
        </ZzCard>
      </div>

      {/* 吸底操作栏：保存处置固定不随滚动条滑动 */}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-5 py-3">
        <div className="text-xs text-gray-400">一次操作同时生成「催记记录」+「还款承诺」+「协商方案」（如已填写），均绑定同一通话ID便于审计溯源。</div>
        <div className="flex items-center gap-2">
          {okAll && <span className="text-xs text-green-600">✓ 已全部保存</span>}
          <ZzBtn primary onClick={saveAll} disabled={disabled}>✨ 保存处置</ZzBtn>
        </div>
      </div>
    </div>
  )
}

/* ============================ Tab3 历史记录（只读查阅） ============================ */
function HistoryTab({ notes, ptps, negos, recUrl, aiLog, flow }: any) {
  return (
    <div className="space-y-4">
      <ZzCard title={`历史催记（${notes.length}）`}>
        <div className="space-y-2">
          {notes.map((n: any) => {
            // 剥掉 saveAll 写入的「🎯目标：…｜」前缀，避免与下方结构化「本次通话目标」字段重复
            const recBody = (n.rec || '').replace(/^🎯目标：.*?｜/, '').trim()
            // 若「通话内容摘要」已包含完整转录（点过「引用转录」），则不再重复渲染转录块
            const showTranscript = n.transcript && n.transcript.trim() && !recBody.includes(n.transcript.trim())
            return (
            <div key={n.id} className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{n.time} · {n.who} · {n.channel}{n.callId ? ` · ${n.callId}` : ''}</span>
                {n.recording && <RecPlayer url={recUrl} />}
              </div>
              <div className="mt-1 text-sm">{recBody || '—'}</div>

              {/* 本次通话结构化字段（快速录入 + 关联承诺/方案），避免历史催记单薄 */}
              <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-200 pt-2 md:grid-cols-3">
                <Field label="本次通话目标" value={<span className="whitespace-normal text-xs">{n.objective || '—'}</span>} />
                <Field label="客户意图" value={n.intent || '—'} />
                <Field label="客户态度" value={n.attitude || '—'} />
                <Field label="后续动作" value={<span className="whitespace-normal">{n.follow || '—'}</span>} />
                <Field label="下次跟进" value={n.next || '—'} />
                <Field label="关联还款承诺" value={n.ptp ? <span className="text-xs">{n.ptp.date} {money(n.ptp.amt)}（{n.ptp.type}）· {n.ptp.status}</span> : <span className="text-xs">本次未登记</span>} />
                <Field label="关联网协方案" value={n.nego ? <span className="text-xs">{n.nego.type} {n.nego.terms}期 × {money(n.nego.perAmt)} · {n.nego.status}</span> : <span className="text-xs">本次未登记</span>} />
              </div>

              {showTranscript && (
                <div className="mt-2 rounded bg-white px-2.5 py-2">
                  <div className="mb-1 text-xs font-medium text-gray-500">📝 通话转录（完整内容）</div>
                  <div className="max-h-[240px] overflow-y-auto whitespace-pre-wrap text-xs leading-relaxed text-gray-700">{n.transcript}</div>
                </div>
              )}
            </div>
            )
          })}
          {!notes.length && <div className="text-xs text-gray-400">暂无历史催记</div>}
        </div>
      </ZzCard>
      <ZzCard title={`历史还款承诺（${ptps.length}）`}>
        <div className="flex flex-wrap gap-1.5">
          {ptps.length ? ptps.map((p: any) => <ZzBadge key={p.id} color={p.status === '已履约' ? '#16A34A' : p.status === '已失信' ? '#DC2626' : '#D97706'}>{p.date} {money(p.amt)}（{p.type}）· {p.status}</ZzBadge>) : <span className="text-xs text-gray-400">暂无</span>}
        </div>
      </ZzCard>
      <ZzCard title={`历史协商方案（${negos.length}）`}>
        <div className="flex flex-wrap gap-1.5">
          {negos.length ? negos.map((n: any) => <ZzBadge key={n.id} color={n.status === '已生效' ? '#16A34A' : n.status === '已失效' ? '#9CA3AF' : '#2563EB'}>{n.type} {n.terms}期 · {n.status}</ZzBadge>) : <span className="text-xs text-gray-400">暂无</span>}
        </div>
      </ZzCard>

      <ZzCard title="历史流转">
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-gray-500"><tr><th className="px-3 py-2 text-left">时间</th><th className="px-3 py-2 text-left">节点</th><th className="px-3 py-2 text-left">说明</th></tr></thead>
            <tbody>{flow.map((f: any, i: number) => (<tr key={i} className="border-t border-slate-100"><td className="px-3 py-2 whitespace-nowrap">{f.time}</td><td className="px-3 py-2 font-medium">{f.node}</td><td className="px-3 py-2">{f.detail}</td></tr>))}</tbody>
          </table>
        </div>
      </ZzCard>

      <ZzCard title="本案件自动策略执行日志（AI）">
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-purple-50 text-gray-500"><tr><th className="px-3 py-2 text-left">时间</th><th className="px-3 py-2 text-left">动作</th><th className="px-3 py-2 text-left">结果</th><th className="px-3 py-2 text-left">录音</th></tr></thead>
            <tbody>
              {aiLog.map((a: any, i: number) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2 whitespace-nowrap">{a.time}</td>
                  <td className="px-3 py-2"><ZzBadge color="#7C3AED">{a.action}</ZzBadge></td>
                  <td className="px-3 py-2">{a.result}</td>
                  <td className="px-3 py-2">{a.recording ? <RecPlayer url={recUrl} /> : <span className="text-gray-300">—</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 text-xs text-gray-400">AI 机器人 / 短信由策略画布自动执行，坐席工作台仅查看结果，不可修改话术与频次。</div>
      </ZzCard>
    </div>
  )
}

/* ============================ Tab1 案件概览 ============================ */
function Field({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
      <div className="text-xs text-gray-400">{label}</div>
      <div className="mt-0.5 text-sm font-medium text-gray-800">{value}</div>
    </div>
  )
}

function OverviewTab({ cs, detail, contacts, setContacts, onOpenDetail }: any) {
  const [rel, setRel] = useState('紧急联系人')
  const [nm, setNm] = useState('')
  const [tel, setTel] = useState('')
  const addContact = () => {
    if (!nm || !tel) { alert('请填写姓名和电话'); return }
    const newC = { rel, name: nm, type: '手机', tel, status: '有效', isNew: true }
    setContacts((l: any[]) => [...l, newC])
    if (detail && Array.isArray(detail.contacts)) detail.contacts = [...detail.contacts, newC] // 与案件详情页实时同步
    setNm(''); setTel('')
  }
  const stage = ZZ_CASES.find((c) => c.id === cs.id)
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <ZzBtn sm onClick={onOpenDetail}>查看详情</ZzBtn>
      </div>

      <ZzCard title="基础信息">
        <div className="grid grid-cols-3 gap-2">
          <Field label="客户" value={cs.name} />
          <Field label="身份证" value={cs.idno} />
          <Field label="手机号" value={cs.phone} />
          <Field label="合同号" value={cs.contract} />
          <Field label="账龄" value={cs.stage} />
          <Field label="逾期天数" value={cs.overdueDays + ' 天'} />
          <Field label="逾期本金" value={money(cs.principal)} />
          <Field label="逾期利息" value={money(cs.interest)} />
          <Field label="逾期罚息" value={money(cs.penalty)} />
          <Field label="逾期金额合计" value={<span className="text-red-600">{money(cs.total)}</span>} />
          <Field label="承诺还款时间" value={cs.promise === '-' ? '—' : cs.promise} />
          <Field label="原始借据" value={stage ? `${stage.contract}（本金 ${money(stage.principal)}, 罚息 ${money(stage.penalty)}）` : cs.contract} />
        </div>
      </ZzCard>

      <ZzCard title="联系人卡片">
        <div className="overflow-hidden rounded border border-slate-200">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-gray-500"><tr><th className="px-3 py-2 text-left">关系</th><th className="px-3 py-2 text-left">姓名</th><th className="px-3 py-2 text-left">电话</th><th className="px-3 py-2 text-left">状态</th></tr></thead>
            <tbody>
              {contacts.map((c: any, i: number) => (
                <tr key={i} className="border-t border-slate-100">
                  <td className="px-3 py-2">{c.rel}</td><td className="px-3 py-2">{c.name}</td><td className="px-3 py-2 font-mono">{c.tel}</td>
                  <td className="px-3 py-2"><ZzBadge color={c.status === '有效' ? '#16A34A' : '#DC2626'}>{c.status}</ZzBadge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <ZzSelect value={rel} onChange={(e) => setRel(e.target.value)} className="w-28"><option>紧急联系人</option><option>单位电话</option><option>其他</option></ZzSelect>
          <ZzInput placeholder="姓名" value={nm} onChange={(e) => setNm(e.target.value)} className="w-28" />
          <ZzInput placeholder="电话" value={tel} onChange={(e) => setTel(e.target.value)} className="w-36" />
          <ZzBtn sm primary onClick={addContact}>新增联系人</ZzBtn>
        </div>
      </ZzCard>
    </div>
  )
}

/* ============================ 短信快速发送 ============================ */
function SmsModal({ cs, onClose }: { cs: ZzAgentCase; onClose: () => void }) {
  const TPL: Record<string, string> = {
    T1: `【XX金融】尊敬的${cs.name}，您逾期款项${money(cs.total)}已到期，请尽快安排还款。如有疑问请致电客服。退订回T`,
    T2: `【XX金融】温馨提醒：${cs.name}您于${cs.promise === '-' ? '近期' : cs.promise}前承诺的还款即将到期，请按时履约，避免影响征信。`,
    T3: `【XX金融】${cs.name}您好，我们多次联系未果，请看到短信后回拨客服电话，协商您的还款安排。`,
  }
  const [tpl, setTpl] = useState('T1')
  const [content, setContent] = useState(TPL.T1)
  const [sent, setSent] = useState(false)
  return (
    <ZzModal open onClose={onClose} title={`发送催收短信 · ${cs.id}`}>
      <div className="space-y-3">
        <ZzField label="短信模板">
          <ZzSelect value={tpl} onChange={(e) => { setTpl(e.target.value); setContent(TPL[e.target.value]) }}>
            <option value="T1">还款提醒</option>
            <option value="T2">承诺到期提醒</option>
            <option value="T3">联系本人提醒</option>
          </ZzSelect>
        </ZzField>
        <ZzField label="短信内容"><ZzTextarea rows={5} value={content} onChange={(e) => setContent(e.target.value)} className="w-full" /></ZzField>
        <ZzField label="接收号码"><div className="text-sm font-mono">{cs.phone}</div></ZzField>
        <div className="flex justify-end gap-2">
          <ZzBtn onClick={onClose}>取消</ZzBtn>
          {!sent
            ? <ZzBtn primary onClick={() => setSent(true)}>发送短信</ZzBtn>
            : <span className="self-center text-sm text-green-600">✓ 已发送（计入案件催记）</span>}
        </div>
      </div>
    </ZzModal>
  )
}
