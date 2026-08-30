// 催贷管理 · 模块6 智能AI质检
import { useState, useEffect, useRef, useMemo } from 'react'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzDrawer, ZzTabs, ZzTable, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea, ZzBadge, ZzStat, BLUE } from './zzUi'
import { ZZ_QA_RECORDS, ZZ_SENSITIVE_WORDS, ZZ_SENSITIVE_CATS, ZZ_QA_TASKS, ZZ_QA_SCORE_TPL, ZZ_QA_REPORTS } from './zzData'
import { useZzList, updateZzList, ZZ_FILE } from './zzStore'

const GREEN = '#16A34A'; const RED = '#DC2626'; const AMBER = '#D97706'; const GRAY = '#9CA3AF'
// 风险等级统一样式 🔴高 🟡中 🟢低
function levelBadge(l: string) {
  return l === '高' ? <ZzBadge color={RED}>🔴 高</ZzBadge> : l === '中' ? <ZzBadge color={AMBER}>🟡 中</ZzBadge> : <ZzBadge color={GREEN}>🟢 低</ZzBadge>
}

export function ZzQaModule({ pageKey }: { pageKey: string }) {
  if (pageKey === 'zz:qa-words') return <ZzQaWords />
  if (pageKey === 'zz:qa-task') return <ZzQaTask />
  return <ZzQaRecord />
}

/* 通用分页组件 */
function ZzPager({ total, pageSize = 10, page, onChange }: { total: number; pageSize?: number; page: number; onChange: (p: number) => void }) {
  const pages = Math.max(1, Math.ceil(total / pageSize))
  return (
    <div className="mt-3 flex items-center justify-end gap-2 text-sm">
      <span className="text-gray-400">共 {total} 条</span>
      <ZzBtn sm disabled={page <= 1} onClick={() => onChange(page - 1)}>上一页</ZzBtn>
      <span className="px-2">{page} / {pages}</span>
      <ZzBtn sm disabled={page >= pages} onClick={() => onChange(page + 1)}>下一页</ZzBtn>
    </div>
  )
}

/* 模拟播放器 + 转写高亮 + 敏感词跳转（通话录音查询 / 抽样质检 复用） */
function parseDur(s: string) { const m = (s || '').split(':').map(Number); return (m[0] || 0) * 60 + (m[1] || 0) }
function fmtTime(s: number) {
  const mm = Math.floor(s / 60), ss = s % 60
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
}
function QaPlayer({ rec, hitWords }: { rec: any; hitWords?: string[] }) {
  const dur = parseDur(rec.duration)
  const hits = hitWords ?? (rec.hitWords ?? [])
  const segs = useMemo(() => {
    const lines = rec.asr || []
    const n = Math.max(1, lines.length)
    const step = dur / n
    return lines.map((l: any[], i: number) => ({ spk: l[0], text: l[1], start: Math.round(i * step), end: Math.round((i + 1) * step) }))
  }, [rec, dur])
  const [t, setT] = useState(0)
  const [playing, setPlaying] = useState(false)
  const timer = useRef<number | null>(null)
  useEffect(() => {
    if (playing) {
      timer.current = window.setInterval(() => {
        setT((p) => { if (p >= dur) { setPlaying(false); return dur } return Math.min(p + 1, dur) })
      }, 1000)
    }
    return () => { if (timer.current) window.clearInterval(timer.current) }
  }, [playing, dur])
  useEffect(() => () => { if (timer.current) window.clearInterval(timer.current) }, [])
  const activeIdx = segs.findIndex((s) => t >= s.start && t < s.end)
  const toggle = () => { if (t >= dur) setT(0); setPlaying((p) => !p) }
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    setT(Math.max(0, Math.min(dur, Math.round(((e.clientX - r.left) / r.width) * dur))))
  }
  const jumpSeg = (i: number) => { setT(segs[i].start); setPlaying(true) }
  const renderText = (text: string, segIdx: number) => {
    if (!hits.length) return text
    const re = new RegExp(`(${hits.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g')
    return text.split(re).map((seg, k) =>
      hits.includes(seg)
        ? <span key={k} className="cursor-pointer rounded bg-red-100 px-0.5 font-semibold text-red-600 hover:bg-red-200" title="点击跳转到该片段" onClick={() => jumpSeg(segIdx)}>{seg}</span>
        : <span key={k}>{seg}</span>
    )
  }
  return (
    <div className="space-y-3">
      <div className="rounded bg-slate-50 p-3">
        <div className="flex items-center gap-3">
          <button onClick={toggle} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white" style={{ background: BLUE }}>{playing ? '⏸' : (t >= dur ? '↻' : '▶')}</button>
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-xs text-gray-500"><span>{fmtTime(t)}</span><span>{rec.duration}</span></div>
            <div className="h-2 w-full cursor-pointer rounded bg-blue-100" onClick={seek}><div className="h-2 rounded" style={{ width: `${dur ? (t / dur) * 100 : 0}%`, background: BLUE }} /></div>
          </div>
        </div>
      </div>
      <div className="rounded border p-3 text-sm">
        <div className="mb-1 text-xs text-gray-500">ASR 对话转写（命中敏感词已标红，点击敏感词/片段跳转播放）</div>
        <div className="space-y-1">
          {segs.map((s, i) => (
            <div key={i} className={`cursor-pointer rounded px-2 py-1 ${i === activeIdx ? 'bg-blue-50 ring-1 ring-blue-300' : 'hover:bg-slate-50'}`} onClick={() => jumpSeg(i)}>
              <span className={s.spk === '坐席' ? 'font-medium text-blue-700' : 'font-medium text-gray-800'}>{s.spk}：</span>{renderText(s.text, i)}
              <span className="ml-1 text-[10px] text-gray-400">{fmtTime(s.start)}</span>
            </div>
          ))}
        </div>
      </div>
      {(hits.length) > 0 && <div className="text-sm text-red-600">⚠️ 命中敏感词：{hits.join('、')}</div>}
    </div>
  )
}

/* 右侧抽屉：录音播放 + 转写（替代原居中弹窗） */
function RecordDrawer({ rec, onClose }: { rec: any; onClose: () => void }) {
  return (
    <ZzDrawer open title={`通话录音 · ${rec.target}（${rec.id}）`} onClose={onClose} width={560}
      footer={<ZzBtn primary onClick={onClose}>关闭</ZzBtn>}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">债务人</div><div className="font-medium">{rec.target} {rec.phone}</div></div>
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">坐席</div><div className="font-medium">{rec.agent}</div></div>
        </div>
        <QaPlayer rec={rec} />
      </div>
    </ZzDrawer>
  )
}

/* ============================ 页面1：通话录音查询 ============================ */
function ZZ_QA_LEVEL_OF(word: string) {
  const w = ZZ_SENSITIVE_WORDS.find((x: any) => x.word === word)
  return w ? w.level : '中'
}

// 质检处理状态徽章（含整改流转：待整改 → 整改中 → 已整改）
function qaStatusBadge(s: string) {
  if (s === '已整改') return <ZzBadge color={GREEN}>✅ 已整改</ZzBadge>
  if (s === '整改中') return <ZzBadge color={BLUE}>整改中 · 待复检</ZzBadge>
  if (s === '待整改') return <ZzBadge color={AMBER}>⚠️ 待整改</ZzBadge>
  if (s === '误判') return <ZzBadge color={GRAY}>误判</ZzBadge>
  if (s === '已处理') return <ZzBadge color={GREEN}>✅ 已处理</ZzBadge>
  return <ZzBadge color={AMBER}>⏳ 待复核</ZzBadge>
}

function ZzQaRecord() {
  // 质检记录统一走共享数据层：复核/整改结果即时生效，且刷新不丢
  const rows = useZzList<any>(ZZ_FILE.qa, ZZ_QA_RECORDS)
  const setQaRows = (fn: (rs: any[]) => any[]) => updateZzList<any>(ZZ_FILE.qa, fn)
  const [rectify, setRectify] = useState<any | null>(null)
  // 敏感词库（共享数据层）：词库新增/禁用后，下面的命中判定即时生效
  const words = useZzList<any>(ZZ_FILE.words, ZZ_SENSITIVE_WORDS)
  const levelOf = (w: string) => (words.find((x: any) => x.word === w)?.level ?? '中')
  // 命中结果按「当前词库」实时匹配通话转写，不再读写死的命中词
  const rowsWithHit = rows.map((r) => {
    const text = (r.asr ?? []).map((l: any[]) => String(l[1] ?? '')).join(' ')
    const hit = words.filter((w: any) => w.enabled !== false && text.includes(w.word)).map((w: any) => w.word)
    return { ...r, hitWords: hit, alertStatus: hit.length ? '命中告警' : r.alertStatus }
  })
  const [page, setPage] = useState(1)
  const [tab, setTab] = useState<'全部' | '预警'>('全部')
  const [lvl, setLvl] = useState('')
  const [st, setSt] = useState('')
  const [play, setPlay] = useState<any | null>(null)
  const [review, setReview] = useState<any | null>(null)
  const list = rowsWithHit.filter((r) =>
    (tab === '全部' || r.alertStatus === '命中告警') &&
    (!lvl || (r.hitWords.length ? levelOf(r.hitWords[0]) : '低') === lvl) &&
    (!st || r.status === st))
  // 整改复检：通过则整改闭环，驳回到「待整改」重新整改
  const recheck = (r: any, pass: boolean) => {
    setQaRows((rs) => rs.map((x) => (x.id === r.id ? { ...x, status: pass ? '已整改' : '待整改', rectifyResult: pass ? '复检通过' : '复检驳回' } : x)))
    alert(pass ? '复检通过，整改完成' : '复检驳回，已退回重新整改')
  }
  return (
    <ZzPage title="通话录音质检" crumb="催贷管理 / 智能AI质检" subtitle="查询全部催收通话录音，支持语音播放、文本转写、AI质检结果查看；预警通话可发起复核">
      <div className="mb-3 inline-flex overflow-hidden rounded border border-slate-300">
        {(['全部', '预警'] as const).map((t) => (
          <button key={t} onClick={() => { setTab(t); setPage(1) }}
            className={`px-4 py-1.5 text-sm ${tab === t ? 'bg-[#1677ff] text-white' : 'bg-white text-gray-600 hover:bg-slate-50'}`}>
            {t}{t === '预警' ? `（${rowsWithHit.filter((r) => r.alertStatus === '命中告警').length}）` : ''}
          </button>
        ))}
      </div>
      <ZzFilterBar>
        <ZzField label="时间范围"><ZzInput type="date" /></ZzField>
        <ZzField label="坐席"><ZzInput placeholder="姓名/工号" /></ZzField>
        <ZzField label="债务人"><ZzInput placeholder="姓名/脱敏手机号" /></ZzField>
        <ZzField label="风险等级"><ZzSelect value={lvl} onChange={(e) => setLvl(e.target.value)}><option value="">全部</option><option>高</option><option>中</option><option>低</option></ZzSelect></ZzField>
        <ZzField label="处理状态"><ZzSelect value={st} onChange={(e) => setSt(e.target.value)}><option value="">全部</option><option>待复核</option><option>待整改</option><option>整改中</option><option>已整改</option><option>已处理</option><option>误判</option></ZzSelect></ZzField>
        <ZzBtn primary onClick={() => setPage(1)}>查询</ZzBtn>
        <ZzBtn onClick={() => { setLvl(''); setSt(''); setPage(1) }}>重置</ZzBtn>
        <ZzBtn onClick={() => alert('已导出录音查询报表')}>导出</ZzBtn>
      </ZzFilterBar>
      <ZzCard title={`录音列表（${list.length}）`} extra={<ZzBtn sm onClick={() => alert('已导出')}>导出</ZzBtn>}>
        <ZzTable stickyAction head={['通话时间', '债务人', '通话时长', '坐席', 'AI质检告警', '风险等级', '处理状态', '整改责任人', '命中敏感词', '操作']} rows={list.map((r) => [
          r.time, `${r.target} ${r.phone}`, r.duration, r.agent,
          r.alertStatus === '命中告警' ? <ZzBadge color={RED}>🔴 命中告警</ZzBadge> : <ZzBadge color={GREEN}>🟢 正常</ZzBadge>,
          r.hitWords.length ? levelBadge(levelOf(r.hitWords[0])) : <span className="text-gray-400">-</span>,
          qaStatusBadge(r.status),
          r.rectifyBy ? <span className="text-gray-600">{r.rectifyBy}</span> : <span className="text-gray-400">-</span>,
          r.hitWords.length ? <span className="text-red-600">{r.hitWords.join('、')}</span> : <span className="text-gray-400">-</span>,
          r.status === '待整改'
            ? <ZzBtn sm primary onClick={() => setRectify(r)}>提交整改</ZzBtn>
            : r.status === '整改中'
              ? <div className="flex gap-1"><ZzBtn sm primary onClick={() => recheck(r, true)}>复检通过</ZzBtn><ZzBtn sm danger onClick={() => recheck(r, false)}>驳回</ZzBtn></div>
              : (r.hitWords.length
                ? <ZzBtn sm primary onClick={() => setReview({ id: r.id, call: r.id, word: r.hitWords[0], level: levelOf(r.hitWords[0]), status: '待复核', note: '', time: r.time, agent: r.agent, debtor: r.target })}>复核</ZzBtn>
                : <ZzBtn sm onClick={() => setPlay(r)}>查看</ZzBtn>),
        ])} />
        <ZzPager total={list.length} page={page} onChange={setPage} />
      </ZzCard>
      {play && <RecordDrawer rec={play} onClose={() => setPlay(null)} />}
      {review && <ReviewModal a={review} onClose={() => setReview(null)} onSave={(v: any) => {
        const nextStatus = v.status === '误判' ? '误判' : '待整改'
        setQaRows((rs) => rs.map((x) => (x.id === v.call ? { ...x, status: nextStatus, qaNote: v.note, rectifyBy: v.status === '误判' ? '' : (x.agent || ''), rectifyResult: '' } : x)))
        setReview(null)
        alert(v.status === '误判' ? '已标记为误判' : '已确认违规，已生成整改任务（状态：待整改）')
      }} />}
      {rectify && <RectifyModal rec={rectify} onClose={() => setRectify(null)} onSave={(note: string, owner: string) => {
        setQaRows((rs) => rs.map((x) => (x.id === rectify.id ? { ...x, status: '整改中', rectifyNote: note, rectifyBy: owner, rectifyTime: new Date().toLocaleString('zh-CN') } : x)))
        setRectify(null)
        alert('整改已提交，等待复检')
      }} />}
    </ZzPage>
  )
}

/* ============================ 页面2：敏感词库管理 ============================ */
function ZzQaWords() {
  // 敏感词库走共享数据层：新增/禁用/改等级后，质检命中判定即时生效
  const rows = useZzList<any>(ZZ_FILE.words, ZZ_SENSITIVE_WORDS)
  const setRows = (v: any[] | ((rs: any[]) => any[])) => updateZzList<any>(ZZ_FILE.words, (rs) => (typeof v === 'function' ? v(rs) : v))
  const [cat, setCat] = useState(false)
  const [importing, setImporting] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)
  return (
    <ZzPage title="敏感词库管理" crumb="催贷管理 / 智能AI质检" subtitle="维护催收违规敏感词，配置违规分类、告警风险等级，用于通话实时&事后AI质检">
      <ZzFilterBar>
        <ZzField label="分类"><ZzSelect defaultValue=""><option value="">全部</option>{ZZ_SENSITIVE_CATS.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
        <ZzField label="风险等级"><ZzSelect defaultValue=""><option value="">全部</option><option>高</option><option>中</option><option>低</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn>重置</ZzBtn>
        <ZzBtn primary onClick={() => setEditing({ word: '', cat: ZZ_SENSITIVE_CATS[0], level: '中', enabled: true })}>新增敏感词</ZzBtn>
        <ZzBtn onClick={() => setImporting(true)}>批量导入</ZzBtn>
        <ZzBtn onClick={() => setCat(true)}>分类管理</ZzBtn>
      </ZzFilterBar>
      <ZzCard title="敏感词库" extra={<ZzBtn sm onClick={() => alert('已导出词库')}>导出</ZzBtn>}>
        <ZzTable stickyAction head={['敏感词', '违规分类', '告警等级', '状态', '操作']} rows={rows.map((w) => [
          w.word, w.cat, levelBadge(w.level),
          w.enabled ? <ZzBadge color={GREEN}>✅ 已启用</ZzBadge> : <ZzBadge color={GRAY}>⛔ 已禁用</ZzBadge>,
          <div className="flex flex-nowrap gap-1"><ZzBtn sm onClick={() => setEditing(w)}>编辑</ZzBtn><ZzBtn sm danger={w.enabled} onClick={() => setRows((rs) => rs.map((x) => x === w ? { ...x, enabled: !x.enabled } : x))}>{w.enabled ? '禁用' : '启用'}</ZzBtn></div>,
        ])} />
      </ZzCard>
      {editing && <ZzModal open title={editing.cat && !ZZ_SENSITIVE_WORDS.includes(editing) ? '新增敏感词' : '编辑敏感词'} onClose={() => setEditing(null)} width={520}
        footer={<><ZzBtn onClick={() => setEditing(null)}>取消</ZzBtn><ZzBtn primary onClick={() => { setRows((rs) => { const i = rs.indexOf(editing); return i >= 0 ? rs.map((x) => (x === editing ? editing : x)) : [...rs, editing] }); setEditing(null) }}>保存</ZzBtn></>}>
        <div className="space-y-3">
          <ZzField label="敏感词"><ZzInput value={editing.word} onChange={(e) => setEditing({ ...editing, word: e.target.value })} /></ZzField>
          <div className="grid grid-cols-2 gap-3">
            <ZzField label="违规分类"><ZzSelect value={editing.cat} onChange={(e) => setEditing({ ...editing, cat: e.target.value })}>{ZZ_SENSITIVE_CATS.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
            <ZzField label="风险等级"><ZzSelect value={editing.level} onChange={(e) => setEditing({ ...editing, level: e.target.value })}><option>高</option><option>中</option><option>低</option></ZzSelect></ZzField>
          </div>
        </div>
      </ZzModal>}
      {cat && <ZzModal open title="分类管理" onClose={() => setCat(false)} footer={<ZzBtn primary onClick={() => setCat(false)}>关闭</ZzBtn>}>
        <div className="space-y-1 text-sm">
          {ZZ_SENSITIVE_CATS.map((c) => <div key={c} className="rounded border px-3 py-2">{c}</div>)}
          <div className="text-xs text-gray-400">可在系统配置中心维护分类（此处只读展示，新增/编辑入口下同分类字典）。</div>
        </div>
      </ZzModal>}
      {importing && <ZzModal open title="批量导入敏感词" onClose={() => setImporting(false)} footer={<><ZzBtn onClick={() => setImporting(false)}>取消</ZzBtn><ZzBtn primary onClick={() => { setImporting(false); alert('已导入敏感词') }}>上传并导入</ZzBtn></>}>
        <div className="space-y-2 text-sm">
          <ZzBtn sm onClick={() => alert('已下载 Excel 导入模板')}>下载导入模板</ZzBtn>
          <input type="file" accept=".xlsx,.csv" className="block" />
          <div className="text-xs text-gray-400">支持一次导入几十至上百条敏感词；禁用状态词不参与 AI 质检匹配。</div>
        </div>
      </ZzModal>}
    </ZzPage>
  )
}

function ReviewModal({ a, onClose, onSave }: { a: any; onClose: () => void; onSave: (a: any) => void }) {
  const [decision, setDecision] = useState<'确认违规' | '标记误判'>('确认违规')
  const [note, setNote] = useState(a.note || '')
  const rec = ZZ_QA_RECORDS.find((r) => r.id === a.call)
  return (
    <ZzModal open title={`告警复核 · ${a.id}`} onClose={onClose} width={640}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => onSave({ ...a, status: decision === '确认违规' ? '已处理' : '误判', note })}>保存</ZzBtn></>}>
      <div className="space-y-3">
        <div className="flex items-center gap-3 rounded bg-slate-50 p-3 text-sm">
          <span className="text-2xl text-blue-600">▶</span>
          <div className="h-2 flex-1 rounded bg-blue-100"><div className="h-2 w-1/3 rounded bg-blue-500" /></div>
          <span className="text-gray-400">{rec?.duration ?? ''}</span>
        </div>
        <div className="rounded border p-3 text-sm">
          <div className="mb-1 text-xs text-gray-500">ASR 对话转写（命中词高亮）</div>
          <div className="space-y-1">
            {rec?.asr.map((line: any[], i: number) => (
              <div key={i} className={line[0] === '坐席' ? 'text-blue-700' : 'text-gray-800'}>{line[0]}：{line[1].includes(a.word) ? <span className="rounded bg-red-100 font-semibold text-red-600">{a.word}</span> : line[1]}</div>
            ))}
          </div>
        </div>
        <div className="text-sm text-red-600">命中敏感词：{a.word}（风险等级 {a.level}）</div>
        <ZzField label="复核判定">
          <div className="flex gap-2">
            <ZzBtn sm primary={decision === '确认违规'} onClick={() => setDecision('确认违规')}>确认违规</ZzBtn>
            <ZzBtn sm primary={decision === '标记误判'} onClick={() => setDecision('标记误判')}>标记误判</ZzBtn>
          </div>
        </ZzField>
        <ZzField label="处理备注"><ZzTextarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="填写复核处理意见" /></ZzField>
      </div>
    </ZzModal>
  )
}

/* ---------------- 整改提交弹窗（确认违规后由责任人提交整改措施，等待复检） ---------------- */
function RectifyModal({ rec, onClose, onSave }: { rec: any; onClose: () => void; onSave: (note: string, owner: string) => void }) {
  const [owner, setOwner] = useState(rec.agent || '')
  const [note, setNote] = useState('')
  const [err, setErr] = useState('')
  return (
    <ZzModal open title={`提交整改 · ${rec.id}`} onClose={onClose} width={540}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => { if (!note.trim()) { setErr('请填写整改措施'); return } onSave(note.trim(), owner) }}>提交整改</ZzBtn></>}>
      <div className="mb-3 rounded bg-slate-50 p-3 text-sm text-gray-600">
        违规录音：{rec.time} · 坐席 {rec.agent} · 命中敏感词「{(rec.hitWords || []).join('、')}」
      </div>
      <div className="space-y-3">
        <ZzField label="整改责任人"><ZzInput value={owner} onChange={(e) => setOwner(e.target.value)} placeholder="默认违规坐席本人" /></ZzField>
        <ZzField label="整改措施（必填）"><ZzTextarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="如：已完成话术规范培训、已向客户致歉并取得谅解、已提交书面检讨" /></ZzField>
      </div>
      {err && <div className="mt-2 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{err}</div>}
      <div className="mt-3 rounded bg-slate-50 p-3 text-xs text-gray-600">提交后状态变为「整改中」，由质检员复检：通过则整改闭环，驳回则退回重新整改。</div>
    </ZzModal>
  )
}

/* ============================ 页面4：抽样质检 ============================ */
function aiStatusBadge(s: string) {
  if (s === 'clean') return <ZzBadge color={GREEN}>AI识别无违规</ZzBadge>
  if (s === 'pending') return <ZzBadge color={AMBER}>AI疑似违规·待复核</ZzBadge>
  return <ZzBadge color="#1677ff">已人工复核</ZzBadge>
}

function ZzQaTask() {
  const [tasks, setTasks] = useState<any[]>(() => ZZ_QA_TASKS.map((t) => ({ ...t, records: [...t.records] })))
  const [create, setCreate] = useState(false)
  const [active, setActive] = useState<any | null>(null)
  const [review, setReview] = useState<any | null>(null)
  const [detail, setDetail] = useState<any | null>(null)

  const openTask = (t: any) => {
    const recs = ZZ_QA_RECORDS.filter((r) => t.records.map((x: any) => x.id).includes(r.id))
    setActive({ ...t, recs })
  }

  return (
    <ZzPage title="抽样质检" crumb="催贷管理 / 智能AI质检" subtitle="创建抽样任务，后台批量AI识别，人工仅复核疑似违规录音">
      <ZzFilterBar>
        <ZzBtn primary onClick={() => setCreate(true)}>新建质检任务</ZzBtn>
        <ZzBtn onClick={() => alert('已导出质检任务')}>导出</ZzBtn>
      </ZzFilterBar>
      <ZzCard title="质检任务列表" extra={<ZzBtn sm onClick={() => alert('已导出')}>导出</ZzBtn>}>
        <ZzTable stickyAction head={['任务名称', '时间范围', '抽样规则', '通话池/抽样', '复核进度', '负责人', '操作']} rows={tasks.map((t) => {
          const pending = t.records.filter((r: any) => r.aiStatus === 'pending' && r.humanStatus !== '已复核').length
          return [
            t.name, t.range, t.dim, `${t.pool} / ${t.records.length}`,
            `${t.records.filter((r: any) => r.humanStatus === '已复核').length}/${t.records.length}（待复核 ${pending}）`,
            t.owner,
            <div className="flex gap-2">
              <ZzBtn sm onClick={() => openTask(t)}>查看报告</ZzBtn>
              {pending > 0 && <ZzBtn sm primary onClick={() => setReview(t)}>进入复核（{pending}）</ZzBtn>}
            </div>,
          ]
        })} />
      </ZzCard>

      {create && <CreateTaskModal onClose={() => setCreate(false)} onOk={(nt) => { setTasks((ts) => [...ts, nt]); setCreate(false) }} />}
      {active && <TaskReportView task={active} onClose={() => setActive(null)} onDetail={(rec) => setDetail(rec)} onReview={() => setReview(active)} />}
      {review && <ReviewWorkbench task={review} onClose={() => setReview(null)} onSaved={(recs) => {
        setTasks((ts) => ts.map((t) => t.id === review.id ? { ...t, records: recs } : t))
        setReview(null)
        setActive((a) => (a && a.id === review.id ? { ...a, records: recs } : a))
      }} />}
      {detail && <RecordDetailDrawer rec={detail} onClose={() => setDetail(null)} />}
    </ZzPage>
  )
}

/* 任务级汇总报告（核心页面）：大盘 + 抽样录音清单，点击行下钻单条详情 */
function TaskReportView({ task, onClose, onDetail, onReview }: { task: any; onClose: () => void; onDetail: (r: any) => void; onReview: () => void }) {
  const recs: any[] = task.records
  const total = recs.length
  const reviewed = recs.filter((r) => r.humanStatus === '已复核').length
  const pending = recs.filter((r) => r.aiStatus === 'pending' && r.humanStatus !== '已复核').length
  const clean = recs.filter((r) => r.aiStatus === 'clean').length
  const violationCnt = recs.filter((r) => r.humanStatus === '已复核' && (r.humanHit || []).length).length
  const violationRate = total ? Math.round((violationCnt / total) * 100) : 0
  const byAgent: Record<string, { hit: number; total: number }> = {}
  recs.forEach((r) => {
    const hits = r.humanStatus === '已复核' ? (r.humanHit || []) : (r.aiHit || [])
    const key = (ZZ_QA_RECORDS.find((x) => x.id === r.id) || {}).agent || '-'
    byAgent[key] = byAgent[key] || { hit: 0, total: 0 }
    byAgent[key].total++
    byAgent[key].hit += hits.length
  })
  const wordMap: Record<string, number> = {}
  recs.forEach((r) => { (r.humanStatus === '已复核' ? (r.humanHit || []) : (r.aiHit || [])).forEach((w: string) => { wordMap[w] = (wordMap[w] || 0) + 1 }) })
  const topWords = Object.entries(wordMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  return (
    <ZzModal open title={`质检汇总报告 · ${task.name}`} onClose={onClose} width={900}
      footer={<><ZzBtn onClick={onReview} disabled={pending === 0}>进入复核（{pending}）</ZzBtn><ZzBtn primary onClick={onClose}>关闭</ZzBtn></>}>
      <div className="max-h-[80vh] space-y-3 overflow-auto pr-1">
        <ZzCard title="任务基础信息">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">抽样范围</div><div className="font-medium">{task.range}</div></div>
            <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">抽样规则</div><div className="font-medium">{task.dim}</div></div>
            <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">负责人</div><div className="font-medium">{task.owner}</div></div>
          </div>
        </ZzCard>
        <div className="grid grid-cols-4 gap-3">
          <ZzStat label="抽样总条数" value={total} accent="#1677ff" />
          <ZzStat label="复核完成率" value={total ? Math.round((reviewed / total) * 100) + '%' : '-'} accent={GREEN} />
          <ZzStat label="整体违规率" value={violationRate + '%'} accent={RED} />
          <ZzStat label="AI无违规/待复核" value={`${clean} / ${pending}`} accent={AMBER} />
        </div>
        <ZzCard title="各坐席违规情况">
          <ZzTable head={['坐席', '抽样数', '命中违规数']} rows={Object.entries(byAgent).map(([k, v]) => [k, v.total, <span className={v.hit ? 'text-red-600' : ''}>{v.hit}</span>])} />
        </ZzCard>
        <ZzCard title="高频命中敏感词 TOP5">
          {topWords.length ? <div className="flex flex-wrap gap-2">{topWords.map(([w, n]) => <span key={w} className="rounded bg-red-50 px-2 py-1 text-sm text-red-600">{w} · {n}</span>)}</div> : <span className="text-gray-400">暂无</span>}
        </ZzCard>
        <ZzCard title="抽样录音清单（点击「详情」查看单条录音详情）">
          <ZzTable stickyAction head={['录音编号', '债务人', '坐席', 'AI状态', 'AI预打分', '人工复核', '人工分', '违规点', '操作']} rows={recs.map((r) => {
            const rec = ZZ_QA_RECORDS.find((x) => x.id === r.id) || {}
            const hit = r.humanStatus === '已复核' ? (r.humanHit || []) : (r.aiHit || [])
            return [
              r.id, rec.target || '-', rec.agent || '-', aiStatusBadge(r.aiStatus),
              <span>{r.aiScore}</span>,
              r.humanStatus === '已复核' ? <ZzBadge color="#1677ff">已复核</ZzBadge> : <span className="text-gray-400">未复核</span>,
              <span className={r.humanScore < 80 ? 'font-semibold text-red-600' : ''}>{r.humanScore}</span>,
              hit.length ? <span className="text-red-600">{hit.join('、')}</span> : <span className="text-gray-400">无</span>,
              <ZzBtn sm primary onClick={() => onDetail(r)}>详情</ZzBtn>,
            ]
          })} />
        </ZzCard>
      </div>
    </ZzModal>
  )
}

/* 单录音详情（详情抽屉，非独立报告）：播放器 + AI预识别 + 人工复核 */
function RecordDetailDrawer({ rec, onClose }: { rec: any; onClose: () => void }) {
  const data = ZZ_QA_RECORDS.find((x) => x.id === rec.id) || {}
  const hit = rec.humanStatus === '已复核' ? (rec.humanHit || []) : (rec.aiHit || [])
  return (
    <ZzDrawer open title={`单录音详情 · ${rec.id}`} onClose={onClose} width={600}
      footer={<ZzBtn primary onClick={onClose}>关闭</ZzBtn>}>
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">坐席</div><div className="font-medium">{data.agent || '-'}</div></div>
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">债务人</div><div className="font-medium">{data.target || '-'}</div></div>
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">AI状态</div><div className="font-medium">{aiStatusBadge(rec.aiStatus)}</div></div>
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">人工复核</div><div className="font-medium">{rec.humanStatus === '已复核' ? `已复核（${rec.humanScore}分）` : '未复核'}</div></div>
        </div>
        <div className="rounded border p-2">
          <div className="mb-1 text-xs text-gray-500">命中敏感词（AI / 人工复核）</div>
          {hit.length ? <span className="text-red-600">{hit.join('、')}</span> : <span className="text-gray-400">无</span>}
        </div>
        <div className="text-sm">复核意见：{rec.note || <span className="text-gray-400">未填写</span>}</div>
        {data.asr && (<><div className="text-xs text-gray-500">录音回放</div><QaPlayer rec={data} hitWords={rec.aiHit} /></>)}
      </div>
    </ZzDrawer>
  )
}

/* 新建任务弹窗：实时抽样预估 */
function CreateTaskModal({ onClose, onOk }: { onClose: () => void; onOk: (t: any) => void }) {
  const [name, setName] = useState('9月坐席抽样质检')
  const [range, setRange] = useState('2026-09-01 ~ 2026-09-30')
  const [dim, setDim] = useState('按坐席')
  const [rate, setRate] = useState(10)
  const [owner, setOwner] = useState('质检组')

  const pool = ZZ_QA_RECORDS.length * 100
  const sampled = Math.max(0, Math.round(pool * (Number(rate) || 0) / 100))
  const tooFew = sampled < 5

  return (
    <ZzModal open title="新建质检任务" onClose={onClose} width={560}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn>
        <ZzBtn primary disabled={tooFew} onClick={() => onOk({
          id: 'QT-' + Math.floor(Math.random() * 900 + 100), name, range, dim: `${dim} ${rate}% 抽样`, owner,
          pool, sampled, total: sampled, done: 0,
          records: ZZ_QA_RECORDS.map((r) => ({
            id: r.id, aiStatus: r.hitWords.length ? 'pending' : 'clean', aiHit: r.hitWords,
            aiScore: r.hitWords.length ? Math.max(60, 100 - r.hitWords.length * 15) : 100,
            humanStatus: '待复核', humanHit: r.hitWords.length ? r.hitWords : [], humanScore: r.hitWords.length ? Math.max(60, 100 - r.hitWords.length * 15) : 100, violations: r.hitWords, note: '',
          })),
        })}>{tooFew ? '样本不足' : '创建并启动AI识别'}</ZzBtn></>}>
      <div className="space-y-3">
        <ZzField label="任务名称"><ZzInput value={name} onChange={(e) => setName(e.target.value)} /></ZzField>
        <ZzField label="通话时间范围"><ZzInput value={range} onChange={(e) => setRange(e.target.value)} /></ZzField>
        <div className="grid grid-cols-2 gap-3">
          <ZzField label="抽样维度"><ZzSelect value={dim} onChange={(e) => setDim(e.target.value)}><option>按坐席</option><option>按客户</option><option>按告警记录</option></ZzSelect></ZzField>
          <ZzField label="抽样比例(%)"><ZzInput type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} /></ZzField>
        </div>
        <ZzField label="质检打分模板"><ZzSelect defaultValue="催收质检标准打分表"><option>催收质检标准打分表</option><option>合规专项打分表</option></ZzSelect></ZzField>
        <ZzField label="负责人"><ZzInput value={owner} onChange={(e) => setOwner(e.target.value)} /></ZzField>

        <div className="rounded bg-slate-50 p-3 text-sm">
          <div className="mb-1 text-xs text-gray-500">抽样预估（实时）</div>
          <div className="flex justify-between"><span>符合条件总通话条数</span><span className="font-medium">{pool}</span></div>
          <div className="flex justify-between"><span>设置抽样比例后预计抽取</span><span className="font-medium text-[#1677ff]">{sampled} 条</span></div>
          {tooFew
            ? <div className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-700">⚠️ 可抽样本不足（少于 5 条），请调大抽样比例或放宽时间范围后再创建。</div>
            : <div className="mt-2 text-xs text-gray-400">后台将自动对抽出的全部录音进行ASR转写、敏感词识别与预打分，无需逐条手工处理。</div>}
        </div>
      </div>
    </ZzModal>
  )
}

/* 复核工作台：只处理 AI 疑似违规的录音，预填AI命中/预打分，可编辑 */
function ReviewWorkbench({ task, onClose, onSaved }: { task: any; onClose: () => void; onSaved: (recs: any[]) => void }) {
  // 队列在「进入工作台时」固定成快照：否则提交一条队列就缩短一条，会跳条并误判全部完成
  const queue = useMemo(() => {
    const all = task.records ?? []
    const pend = all.filter((r: any) => r.aiStatus === 'pending' && r.humanStatus !== '已复核')
    // 按比例抽查 AI 判「无违规」的录音，用于发现漏报（此前漏报永远查不到）
    const clean = all.filter((r: any) => r.aiStatus === 'clean' && r.humanStatus !== '已复核')
    const spotN = Math.max(1, Math.round(clean.length * 0.2))
    return [...pend, ...clean.slice(0, spotN)]
  }, [task.id])
  const [idx, setIdx] = useState(0)
  const cur = queue[idx]
  const rec = ZZ_QA_RECORDS.find((r) => r.id === cur?.id)
  const [decision, setDecision] = useState<'确认违规' | '标记误报'>('确认违规')
  const [score, setScore] = useState<number>(cur ? cur.aiScore : 100)
  const [note, setNote] = useState('')
  if (!cur) {
    return (<ZzModal open title={`复核工作台 · ${task.name}`} onClose={onClose} width={820}
      footer={<ZzBtn primary onClick={onClose}>完成</ZzBtn>}>
      <div className="py-6 text-center text-gray-500">本轮复核队列已全部处理完成 ✅</div>
    </ZzModal>)
  }
  // 前进到下一条并重置表单（分数用它自己的 AI 预打分）
  const goNext = () => {
    const nxt = queue[idx + 1]
    setDecision('确认违规')
    setScore(nxt ? nxt.aiScore : 100)
    setNote('')
    setIdx((i) => i + 1)
  }
  const submit = () => {
    const updated = (task.records ?? []).map((r: any) => r.id === cur.id ? {
      ...r, humanStatus: '已复核',
      humanHit: decision === '确认违规' ? (r.aiHit || []) : [],
      humanScore: decision === '确认违规' ? score : 100,
      violations: decision === '确认违规' ? (r.aiHit || []) : [],
      note,
    } : r)
    onSaved(updated)
    goNext()
  }
  return (
    <ZzModal open title={`复核工作台 · ${task.name}（${idx + 1}/${queue.length}）${cur.aiStatus === 'clean' ? ' · 抽检查漏' : ''}`} onClose={onClose} width={820}
      footer={<><ZzBtn onClick={submit}>提交并下一条</ZzBtn><ZzBtn onClick={goNext}>跳过本条</ZzBtn><ZzBtn primary onClick={onClose}>暂存并退出</ZzBtn></>}>
      <div className="max-h-[78vh] space-y-3 overflow-auto pr-1">
        <div className="text-sm text-gray-500">当前：{rec?.target}（{cur.id}）{cur.aiStatus === 'clean' ? '｜来源：AI判无违规·抽检查漏' : '｜来源：AI判疑似违规'}｜ 本轮剩余 {queue.length - idx - 1} 条</div>
        {rec && <QaPlayer rec={rec} hitWords={cur.aiHit} />}
        <div className="rounded border p-2 text-sm">
          <div className="text-xs text-gray-500">AI 预识别命中（仅供参考，可修改）</div>
          <div className="text-red-600">{cur.aiHit.length ? cur.aiHit.join('、') : '无'}</div>
        </div>
        <ZzCard title="人工复核">
          <div className="space-y-2">
            <ZzField label="复核判定">
              <div className="flex gap-2">
                <ZzBtn sm primary={decision === '确认违规'} onClick={() => setDecision('确认违规')}>确认违规</ZzBtn>
                <ZzBtn sm primary={decision === '标记误报'} onClick={() => setDecision('标记误报')}>标记AI误报</ZzBtn>
              </div>
            </ZzField>
            <ZzField label={`人工打分（AI预打分 ${cur.aiScore}）`}>
              <ZzInput type="number" max={100} value={score} onChange={(e) => setScore(Number(e.target.value))} />
            </ZzField>
            <ZzField label="复核意见"><ZzTextarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="填写复核意见（可选）" /></ZzField>
            <ZzBtn sm onClick={goNext}>跳过本条</ZzBtn>
          </div>
        </ZzCard>
      </div>
    </ZzModal>
  )
}
