import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { ZzPage, ZzCard, ZzTable, ZzTabs, ZzBtn, ZzField, ZzSelect, ZzInput, ZzTextarea, ZzBadge, ZzStat, ZzModal, ZzFilterBar } from './zzUi'
import { ZZ_AGENT_STAT, ZZ_AGENT_POOL, zzDetailOf, ZZ_CASES, zzAiLogOf, zzFlowOf, zzTranscriptOf } from './zzData'
import type { ZzAgentCase } from './zzData'

/* 合规管控：与策略画布「合规管控配置」保持一致 —— 22:00-08:00 禁止外呼；单客户每日最大呼叫次数 */
const CALL_WINDOW = '08:00-22:00'
const BAN_WINDOW = '22:00-08:00'
const MAX_CALL = 2

const AGENT_PAGES = [
  { key: 'zz:agent-pool', label: '我的案件池', render: () => <ZzAgentPool /> },
  { key: 'zz:agent-home', label: '今日待办', render: () => <ZzAgentHome /> },
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

function ZzAgentHome() {
  const s = ZZ_AGENT_STAT
  return (
    <ZzPage title="今日待办" crumb="催贷管理 / 坐席工作台" subtitle="坐席当日催收概览（样例数据）">
      <div className="mb-4 grid grid-cols-5 gap-3">
        <ZzStat label="待处理案件" value={s.todo} color="#1677ff" />
        <ZzStat label="今日已处理" value={s.doneToday} color="#16A34A" />
        <ZzStat label="接通通话" value={s.connected} color="#7C3AED" />
        <ZzStat label="新增承诺" value={s.promised} color="#D97706" />
        <ZzStat label="待跟进" value={s.follow} color="#EA580C" />
      </div>
      <ZzCard title="催收提示">
        <ul className="list-disc space-y-1 pl-5 text-sm text-gray-600">
          <li>承诺到期案件优先处理：张*明（CO-202608-002）承诺 8/28 还款 2 万。</li>
          <li>失联案件：冯*军（CO-202608-007）AI 外呼 2 次未接通，建议改派联系人或函件。</li>
          <li>协商中案件：孙*磊（CO-202608-004）分期方案待本人确认。</li>
        </ul>
      </ZzCard>
    </ZzPage>
  )
}

/* ============================ 我的案件池 ============================ */
function ZzAgentPool() {
  const [pool, setPool] = useState(ZZ_AGENT_POOL)
  const [drawer, setDrawer] = useState<{ id: string; tab: string } | null>(null)
  const [sms, setSms] = useState<ZzAgentCase | null>(null)
  const [fStatus, setFStatus] = useState('')
  const [fStage, setFStage] = useState('')
  const [fDue, setFDue] = useState('')

  const list = pool.filter((p) =>
    (!fStatus || p.status === fStatus) &&
    (!fStage || p.stage === fStage) &&
    (!fDue || p.promiseDue === fDue)
  )

  const openCase = (c: ZzAgentCase, tab = '📋案件概览') => setDrawer({ id: c.id, tab })

  // 承诺保存后，刷新表格行的承诺还款时间 + 标签 + 状态
  const onPromise = (id: string, date: string) => {
    setPool((ps) => ps.map((p) => p.id === id
      ? { ...p, promise: date, promiseDue: date, status: '待回款', tags: p.tags.includes('📝有还款承诺') ? p.tags : [...p.tags, '📝有还款承诺'] }
      : p))
  }

  return (
    <ZzPage title="我的案件池" crumb="催贷管理 / 坐席工作台" subtitle="坐席名下案件：点击整行或「打开案件」唤起右侧常驻抽屉，所有外呼 / 催记 / 承诺 / 协商在一个抽屉内完成（替散弹窗）">
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
        <ZzBtn onClick={() => { setFStatus(''); setFStage(''); setFDue('') }}>重置</ZzBtn>
      </ZzFilterBar>

      <ZzCard title={`案件池（${list.length}）`}>
        <ZzTable
          head={['案件', '客户', '逾期金额', '账龄', '承诺还款时间', '上次催记', '案件标签', '操作']}
          rowKey={(i) => list[i].id}
          onRow={(i) => openCase(list[i])}
          rows={list.map((p) => [
            <span className="font-mono">{p.id}</span>,
            <span className="font-medium">{p.name}</span>,
            <span className="font-semibold text-red-600">{money(p.total)}</span>,
            <ZzBadge color={p.stage === 'M3+' ? '#DC2626' : p.stage === 'M2' ? '#EA580C' : '#1677ff'}>{p.stage}</ZzBadge>,
            p.promise === '-' ? <span className="text-gray-400">—</span> : <span className="font-medium">{p.promise}</span>,
            <span className="block max-w-[150px] truncate" title={p.lastNote}>{p.lastNote}</span>,
            <div className="flex flex-wrap gap-1">{p.tags.map((t) => <TagBadge key={t} tag={t} />)}</div>,
            <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
              <ZzBtn sm primary onClick={() => openCase(p)}>打开案件</ZzBtn>
              <ZzBtn sm onClick={() => openCase(p, '📞通话中心')}>一键外呼</ZzBtn>
              <ZzBtn sm onClick={() => setSms(p)}>短信</ZzBtn>
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
const TABS = ['📋案件概览', '📞通话中心', '✍跟进记录', '🤝承诺&协商']

type CallState = 'idle' | 'dialing' | 'ringing' | 'connected' | 'missed' | 'rejected' | 'ended'
type PtpRow = { id: string; date: string; amt: number; type: string; status: '待履约' | '已履约' | '已失信'; note: string }
type NegoRow = { id: string; type: string; terms: number; perAmt: number; firstDue: string; status: '待确认' | '已生效' | '已失效'; note: string }

function CaseDrawer({ caseId, initTab, onClose, onPromise }: { caseId: string; initTab: string; onClose: () => void; onPromise: (id: string, date: string) => void }) {
  const cs = useMemo(() => ZZ_AGENT_POOL.find((p) => p.id === caseId)!, [caseId])
  const detail = useMemo(() => zzDetailOf(caseId), [caseId])
  const aiLog = useMemo(() => zzAiLogOf(caseId), [caseId])
  const flow = useMemo(() => zzFlowOf(caseId), [caseId])
  const transcriptLines = useMemo(() => zzTranscriptOf(caseId), [caseId])
  const recUrl = useMemo(() => genRecWav(caseId), [caseId])

  const [tab, setTab] = useState(initTab)
  const [notes, setNotes] = useState(detail.actions)
  const [ptps, setPtps] = useState<PtpRow[]>(detail.ptpOral.map((p) => ({ id: p.id, date: p.promiseTime, amt: p.promiseAmt, type: '部分', status: p.status === '已失约' ? '已失信' : (p.status as any), note: p.note })))
  const [negos, setNegos] = useState<NegoRow[]>(detail.ptpAgreement.map((a) => ({ id: a.id, type: '二次分期', terms: 6, perAmt: Math.round(a.amt / 6), firstDue: a.promiseTime, status: a.status === '已作废' ? '已失效' : a.status === '生效中' ? '已生效' : '待确认', note: a.note })))
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
          if (i < transcriptLines.length) { setTranscript((t) => (t ? t + '\n' : '') + transcriptLines[i]); i++ } else clearTimers()
        }, 2200))
      }
    }, 3200))
  }

  const hangup = () => {
    clearTimers()
    setCall('ended'); setLiveCall(false)
    setSavedRecUrl(recUrl)
    setPendingNote(true)
    setTab('✍跟进记录')
  }

  const tryClose = () => {
    if (liveCall) { alert('通话进行中，请先挂断通话后再关闭抽屉'); return }
    if (pendingNote) { alert('挂断通话后需先填写本次催记，请前往「跟进记录」保存后再关闭'); return }
    onClose()
  }

  const addNote = (rec: string, content: string, attitude: string, followTxt: string, next: string) => {
    const now = new Date()
    const t = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
    setNotes((l) => [{ id: 'ACT-' + Date.now(), rec: content + (attitude ? `（态度：${attitude}）` : '') + (followTxt ? `｜后续：${followTxt}` : '') + (next ? `｜下次跟进：${next}` : ''), who: '李娜（我）', time: t, channel: '外呼', recording: !!rec, ptpId: '' }, ...l])
    setPendingNote(false)
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
            <OverviewTab cs={cs} detail={detail} notes={notes} ptps={ptps} negos={negos} contacts={contacts} setContacts={setContacts} aiLog={aiLog} flow={flow} recUrl={recUrl} />
          )}
          {tab === '📞通话中心' && (
            <CallCenter
              cs={cs} call={call} secs={secs} muted={muted} transfer={transfer} intent={intent} contactSel={contactSel}
              transcript={transcript} todayCalls={todayCalls} callBlocked={callBlocked} winBlocked={winBlocked} compliance={compliance}
              transcriptLines={transcriptLines} recUrl={recUrl} pendingNote={pendingNote}
              onIntent={setIntent} onContact={setContactSel} onMute={() => setMuted((m) => !m)} onTransfer={(name) => setTransfer(name)}
              onStart={startCall} onHangup={hangup} onTab={setTab}
            />
          )}
          {tab === '✍跟进记录' && (
            <NotesTab notes={notes} recUrl={recUrl} pendingNote={pendingNote} onSave={(rec, c, a, f, n) => { addNote(rec, c, a, f, n); setTab('🤝承诺&协商') }} onSaved={() => setPendingNote(false)} />
          )}
          {tab === '🤝承诺&协商' && (
            <PromiseNegoTab
              cs={cs} ptps={ptps} negos={negos} hasNote={notes.length > 0}
              onPtp={(row) => { setPtps((l) => [row, ...l]); onPromise(cs.id, row.date) }}
              onNego={(row) => setNegos((l) => [row, ...l])}
            />
          )}
        </div>
      </div>
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

function OverviewTab({ cs, detail, notes, ptps, negos, contacts, setContacts, aiLog, flow, recUrl }: any) {
  const [rel, setRel] = useState('紧急联系人')
  const [nm, setNm] = useState('')
  const [tel, setTel] = useState('')
  const addContact = () => {
    if (!nm || !tel) { alert('请填写姓名和电话'); return }
    setContacts((l: any[]) => [...l, { rel, name: nm, type: '手机', tel, status: '有效', isNew: true }])
    setNm(''); setTel('')
  }
  const stage = ZZ_CASES.find((c) => c.id === cs.id)
  return (
    <div className="space-y-4">
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

      <ZzCard title="历史催收摘要">
        <div className="mb-2 text-xs font-medium text-gray-500">最近催记（{notes.length}）</div>
        <div className="space-y-1">
          {notes.slice(0, 5).map((n: any) => (
            <div key={n.id} className="rounded border border-slate-100 bg-slate-50 px-2.5 py-1.5 text-sm">
              <span className="text-xs text-gray-400">{n.time} · {n.who} · {n.channel}{n.recording ? ' · 含录音' : ''}</span>
              <div className="mt-0.5">{n.rec}</div>
            </div>
          ))}
        </div>
        <div className="mb-2 mt-3 text-xs font-medium text-gray-500">历史承诺（{ptps.length}）</div>
        <div className="flex flex-wrap gap-1.5">
          {ptps.map((p: any) => <ZzBadge key={p.id} color={p.status === '已履约' ? '#16A34A' : p.status === '已失信' ? '#DC2626' : '#D97706'}>{p.date} {money(p.amt)} · {p.status}</ZzBadge>)}
        </div>
        <div className="mb-2 mt-3 text-xs font-medium text-gray-500">历史协商方案（{negos.length}）</div>
        <div className="flex flex-wrap gap-1.5">
          {negos.map((n: any) => <ZzBadge key={n.id} color={n.status === '已生效' ? '#16A34A' : n.status === '已失效' ? '#9CA3AF' : '#2563EB'}>{n.type} {n.terms}期 · {n.status}</ZzBadge>)}
        </div>
      </ZzCard>
    </div>
  )
}

/* ============================ Tab2 通话中心 ============================ */
const SCRIPT: Record<string, string> = {
  '': '先共情 → 确认还款意愿 → 给出分期 / 延期方案 → 引导至 Tab4 登记承诺',
  '承诺还款': '确认金额与日期 → 提示在「承诺&协商」Tab 登记还款承诺',
  '无力偿还': '表达理解 → 主动提供二次分期 / 延期方案 → 评估可负担金额',
  '拒绝还款': '合规告知逾期后果（不得威胁 / 上门）→ 记录态度 → 安排下次跟进',
  '情绪对抗': '先安抚情绪 → 避免正面冲突 → 必要时结束通话并记录',
}

function CallCenter(props: any) {
  const { cs, call, secs, muted, transfer, intent, contactSel, transcript, todayCalls, callBlocked, winBlocked, compliance, recUrl, pendingNote,
    onIntent, onContact, onMute, onTransfer, onStart, onHangup, onTab } = props
  const emergency = cs.tags.includes('失联') ? '137****2211（紧急联系人）' : null

  const statusBar = () => {
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
      case 'missed': return bar('bg-red-50 text-red-600', '❌ 无人接听（通话 {secs}s）'.replace('{secs}', String(secs)))
      case 'rejected': return bar('bg-red-50 text-red-600', '❌ 客户拒接')
      case 'ended': return bar('bg-slate-100 text-slate-600', `通话已结束（${fmtTime(secs)}）｜ 可播放本次录音`)
    }
  }
  const bar = (cls: string, html: string) => <div className={`rounded p-3 text-sm ${cls}`} dangerouslySetInnerHTML={{ __html: html }} />

  return (
    <div className="space-y-3">
      {/* 合规状态条 */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 bg-white p-2.5 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">外呼窗口 {CALL_WINDOW}</span>
          <span className="text-gray-300">|</span>
          <span className="text-gray-500">今日已呼 {todayCalls}/{MAX_CALL}</span>
          {callBlocked
            ? <ZzBadge color="#DC2626">⚠ 触发合规限制</ZzBadge>
            : <ZzBadge color="#16A34A">✓ 合规通过</ZzBadge>}
        </div>
      </div>
      {compliance && <div className="rounded bg-red-50 p-2.5 text-xs text-red-600">{compliance}。按钮已置灰，无法发起呼叫。</div>}

      {statusBar()}

      {/* 参数 */}
      <div className="grid grid-cols-2 gap-3 rounded border border-slate-200 bg-white p-3">
        <ZzField label="客户意图"><ZzSelect value={intent} onChange={(e) => onIntent(e.target.value)}><option value="">标记意图</option><option>承诺还款</option><option>无力偿还</option><option>拒绝还款</option><option>情绪对抗</option></ZzSelect></ZzField>
        <ZzField label="通话联系人"><ZzSelect value={contactSel} onChange={(e) => onContact(e.target.value)}><option>本人</option><option>紧急联系人（{emergency ? '137****2211' : '无'}）</option></ZzSelect></ZzField>
      </div>

      {/* 话术提示 */}
      <div className="rounded border-l-4 border-blue-400 bg-blue-50 p-3 text-sm text-blue-800">💡 智能话术提示：{SCRIPT[intent] ?? SCRIPT['']}</div>

      {/* 操作按钮 */}
      <div className="flex flex-wrap gap-2">
        {(call === 'idle' || call === 'ended' || call === 'missed' || call === 'rejected') && (
          <ZzBtn primary onClick={onStart} disabled={callBlocked}>{call === 'idle' ? '📞 发起外呼' : '🔁 重拨'}</ZzBtn>
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

      {/* 实时转录 */}
      <div className="rounded border border-slate-200 bg-white p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium">实时转录（录音转文字，通话中持续输出）</span>
          <button className="text-xs text-[#1677ff] disabled:opacity-40" disabled={!transcript} onClick={() => navigator.clipboard?.writeText(transcript).catch(() => {})}>复制全文</button>
        </div>
        <ZzTextarea rows={6} readOnly value={transcript || (call === 'connected' ? '正在识别语音…' : '通话接通后开始实时转写')} className="w-full resize-none" />
      </div>

      {/* 挂断后录音回放 + 强制催记 */}
      {call === 'ended' && (
        <div className="space-y-2 rounded border border-slate-200 bg-white p-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">本次通话录音</span>
            <RecPlayer url={recUrl} label="▶ 播放录音" />
          </div>
          <div className="rounded bg-amber-50 p-2.5 text-xs text-amber-700">
            ⚠ 已挂断：请前往「跟进记录」填写本次催记后再关闭抽屉{pendingNote ? '' : '（已记录）'}。
            <button className="ml-2 font-medium text-[#D97706] underline" onClick={() => onTab('✍跟进记录')}>去填写 →</button>
          </div>
        </div>
      )}
      {call === 'missed' && (
        <div className="rounded bg-slate-50 p-2.5 text-xs text-gray-500">未接通：可点「重拨」再次外呼，或前往「跟进记录」登记本次未接通。</div>
      )}
    </div>
  )
}

/* ============================ Tab3 跟进记录 ============================ */
function NotesTab({ notes, recUrl, pendingNote, onSave, onSaved }: { notes: any[]; recUrl: string; pendingNote: boolean; onSave: (rec: string, c: string, a: string, f: string, n: string) => void; onSaved: () => void }) {
  const [content, setContent] = useState('')
  const [attitude, setAttitude] = useState('配合')
  const [follow, setFollow] = useState('')
  const [next, setNext] = useState('')
  const [ok, setOk] = useState(false)
  const fromTranscript = () => { if (pendingNote && !content) setContent('（参考实时转录）客户通话内容已记录。') }
  const save = () => {
    if (!content.trim()) { alert('通话内容摘要必填'); return }
    onSave(pendingNote ? recUrl : '', content, attitude, follow, next)
    setContent(''); setFollow(''); setNext(''); setOk(true); onSaved(); setTimeout(() => setOk(false), 2500)
  }
  return (
    <div className="space-y-4">
      <ZzCard title={pendingNote ? '本次通话快速录入（必填）' : '本次通话快速录入'}>
        {pendingNote && <div className="mb-2 rounded bg-amber-50 p-2 text-xs text-amber-700">⚠ 本次通话未记录，请填写后保存，否则无法关闭抽屉。</div>}
        <div className="space-y-2">
          <ZzTextarea rows={3} placeholder="通话内容摘要（可点「套用转录」快速带入）…" value={content} onChange={(e) => setContent(e.target.value)} className="w-full" />
          {pendingNote && <button className="text-xs text-[#1677ff]" onClick={fromTranscript}>套用转录摘要</button>}
          <div className="grid grid-cols-2 gap-2">
            <ZzField label="客户态度"><ZzSelect value={attitude} onChange={(e) => setAttitude(e.target.value)}><option>配合</option><option>敷衍</option><option>抗拒</option></ZzSelect></ZzField>
            <ZzField label="下次跟进时间"><ZzInput type="date" value={next} onChange={(e) => setNext(e.target.value)} /></ZzField>
          </div>
          <ZzField label="后续跟进动作"><ZzInput placeholder="如：3 日后电话复访、寄送函件…" value={follow} onChange={(e) => setFollow(e.target.value)} /></ZzField>
          <div className="flex items-center gap-2">
            <ZzBtn primary onClick={save}>保存催记</ZzBtn>
            {ok && <span className="text-xs text-green-600">✓ 已保存</span>}
          </div>
        </div>
      </ZzCard>

      <ZzCard title={`历史催记（${notes.length}）`}>
        <div className="space-y-2">
          {notes.map((n: any) => (
            <div key={n.id} className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>{n.time} · {n.who} · {n.channel}</span>
                {n.recording && <RecPlayer url={recUrl} />}
              </div>
              <div className="mt-1 text-sm">{n.rec}</div>
            </div>
          ))}
        </div>
      </ZzCard>
    </div>
  )
}

/* ============================ Tab4 承诺&协商 ============================ */
function PromiseNegoTab({ cs, ptps, negos, hasNote, onPtp, onNego }: { cs: ZzAgentCase; ptps: PtpRow[]; negos: NegoRow[]; hasNote: boolean; onPtp: (r: PtpRow) => void; onNego: (r: NegoRow) => void }) {
  // 子面板 A：还款承诺
  const [pDate, setPDate] = useState('')
  const [pAmt, setPAmt] = useState(20000)
  const [pType, setPType] = useState('部分')
  const [pNote, setPNote] = useState('')
  // 子面板 B：协商方案
  const [nType, setNType] = useState('二次分期')
  const [terms, setTerms] = useState(6)
  const [perAmt, setPerAmt] = useState(600)
  const [firstDue, setFirstDue] = useState('')
  const [preview, setPreview] = useState('')

  const savePtp = () => {
    if (!hasNote) { alert('请先完成通话催记（可在「跟进记录」录入），再登记承诺'); return }
    if (!pDate) { alert('请填写承诺日期'); return }
    onPtp({ id: 'PTP-' + Date.now(), date: pDate, amt: pAmt, type: pType, status: '待履约', note: pNote })
    setPDate(''); setPNote(''); alert('承诺已登记，表格「承诺还款时间」已刷新')
  }
  const saveNego = () => {
    if (!hasNote) { alert('填写协商方案前，需要先有通话催记记录'); return }
    if (!firstDue) { alert('请填写首期还款日'); return }
    onNego({ id: 'NEG-' + Date.now(), type: nType, terms, perAmt, firstDue, status: '待确认', note: '' })
    setPreview(`《协商还款协议（系统预览）》\n案件：${cs.id}　客户：${cs.name}　欠款：${money(cs.total)}\n方案：${nType}　共 ${terms} 期　每期 ${money(perAmt)}　首期 ${firstDue}\n合计应还 ${money(terms * perAmt)}。客户确认后正式生效，逾期将转交法务处理。`)
  }

  return (
    <div className="space-y-4">
      {/* 子面板 A */}
      <ZzCard title="还款承诺">
        <div className="grid grid-cols-2 gap-2">
          <ZzField label="承诺日期"><ZzInput type="date" value={pDate} onChange={(e) => setPDate(e.target.value)} /></ZzField>
          <ZzField label="承诺金额"><ZzInput type="number" value={String(pAmt)} onChange={(e) => setPAmt(Number(e.target.value))} /></ZzField>
          <ZzField label="承诺类型"><ZzSelect value={pType} onChange={(e) => setPType(e.target.value)}><option>部分</option><option>全额</option></ZzSelect></ZzField>
          <ZzField label="备注"><ZzInput placeholder="如：先还 2 万，剩余分期" value={pNote} onChange={(e) => setPNote(e.target.value)} /></ZzField>
        </div>
        <div className="mt-2"><ZzBtn primary onClick={savePtp} disabled={!hasNote}>登记承诺</ZzBtn></div>
        {!hasNote && <div className="mt-1 text-xs text-red-500">⚠ 需先有通话 / 催记记录</div>}
        <div className="mb-2 mt-3 text-xs font-medium text-gray-500">历史承诺记录（{ptps.length}）</div>
        <div className="flex flex-wrap gap-1.5">
          {ptps.map((p) => <ZzBadge key={p.id} color={p.status === '已履约' ? '#16A34A' : p.status === '已失信' ? '#DC2626' : '#D97706'}>{p.date} {money(p.amt)}（{p.type}）· {p.status}</ZzBadge>)}
        </div>
      </ZzCard>

      {/* 子面板 B */}
      <ZzCard title="协商方案（延期 / 分期）">
        <div className="grid grid-cols-2 gap-2">
          <ZzField label="方案类型"><ZzSelect value={nType} onChange={(e) => setNType(e.target.value)}><option>二次分期</option><option>延期还款</option><option>减免方案</option></ZzSelect></ZzField>
          <ZzField label="期数"><ZzInput type="number" value={String(terms)} onChange={(e) => setTerms(Number(e.target.value))} /></ZzField>
          <ZzField label="每期金额"><ZzInput type="number" value={String(perAmt)} onChange={(e) => setPerAmt(Number(e.target.value))} /></ZzField>
          <ZzField label="首期还款日"><ZzInput type="date" value={firstDue} onChange={(e) => setFirstDue(e.target.value)} /></ZzField>
        </div>
        <div className="mt-2"><ZzBtn primary onClick={saveNego} disabled={!hasNote}>生成并保存方案</ZzBtn></div>
        {!hasNote && <div className="mt-1 text-xs text-red-500">⚠ 需先有通话 / 催记记录，不允许空记录保存协商</div>}
        {preview && (
          <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3 text-xs leading-relaxed text-blue-900 whitespace-pre-wrap">{preview}</div>
        )}
        <div className="mb-2 mt-3 text-xs font-medium text-gray-500">历史协商方案（{negos.length}）</div>
        <div className="flex flex-wrap gap-1.5">
          {negos.map((n) => <ZzBadge key={n.id} color={n.status === '已生效' ? '#16A34A' : n.status === '已失效' ? '#9CA3AF' : '#2563EB'}>{n.type} {n.terms}期 · {n.status}</ZzBadge>)}
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
