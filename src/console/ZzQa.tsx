// 催贷管理 · 模块6 智能AI质检
import { useState, useEffect, useRef, useMemo } from 'react'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzDrawer, ZzTabs, ZzTable, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea, ZzBadge, ZzStat, BLUE } from './zzUi'
import { ZZ_QA_RECORDS, ZZ_SENSITIVE_WORDS, ZZ_SENSITIVE_CATS, ZZ_QA_ALERTS, ZZ_QA_TASKS, ZZ_QA_SCORE_TPL, ZZ_QA_REPORTS } from './zzData'

const GREEN = '#16A34A'; const RED = '#DC2626'; const AMBER = '#D97706'; const GRAY = '#9CA3AF'
// 风险等级统一样式 🔴高 🟡中 🟢低
function levelBadge(l: string) {
  return l === '高' ? <ZzBadge color={RED}>🔴 高</ZzBadge> : l === '中' ? <ZzBadge color={AMBER}>🟡 中</ZzBadge> : <ZzBadge color={GREEN}>🟢 低</ZzBadge>
}

export function ZzQaModule({ pageKey }: { pageKey: string }) {
  if (pageKey === 'zz:qa-words') return <ZzQaWords />
  if (pageKey === 'zz:qa-alert') return <ZzQaAlert />
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

/* 模拟播放器 + 转写高亮 + 敏感词跳转（通话录音查询 / 事后抽样质检 复用） */
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
function ZzQaRecord() {
  const [rows] = useState(ZZ_QA_RECORDS)
  const [page, setPage] = useState(1)
  const [play, setPlay] = useState<any | null>(null)
  return (
    <ZzPage title="通话录音查询" crumb="催贷管理 / 智能AI质检" subtitle="查询全部催收通话录音，支持语音播放、文本转写、AI质检结果查看">
      <ZzFilterBar>
        <ZzField label="时间范围"><ZzInput type="date" /></ZzField>
        <ZzField label="坐席"><ZzInput placeholder="姓名/工号" /></ZzField>
        <ZzField label="债务人"><ZzInput placeholder="姓名/脱敏手机号" /></ZzField>
        <ZzField label="AI告警状态"><ZzSelect defaultValue=""><option value="">全部</option><option>命中告警</option><option>正常</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn>重置</ZzBtn>
        <ZzBtn onClick={() => alert('已导出录音查询报表')}>导出</ZzBtn>
      </ZzFilterBar>
      <ZzCard title="录音列表" extra={<ZzBtn sm onClick={() => alert('已导出')}>导出</ZzBtn>}>
        <ZzTable stickyAction head={['通话时间', '债务人', '通话时长', '坐席', 'AI质检告警', '命中敏感词', '操作']} rows={rows.map((r) => [
          r.time, `${r.target} ${r.phone}`, r.duration, r.agent,
          r.alertStatus === '命中告警' ? <ZzBadge color={RED}>🔴 命中告警</ZzBadge> : <ZzBadge color={GREEN}>🟢 正常</ZzBadge>,
          r.hitWords.length ? <span className="text-red-600">{r.hitWords.join('、')}</span> : <span className="text-gray-400">-</span>,
          <ZzBtn sm primary onClick={() => setPlay(r)}>查看</ZzBtn>,
        ])} />
        <ZzPager total={rows.length} page={page} onChange={setPage} />
      </ZzCard>
      {play && <RecordDrawer rec={play} onClose={() => setPlay(null)} />}
    </ZzPage>
  )
}

/* ============================ 页面2：敏感词库管理 ============================ */
function ZzQaWords() {
  const [rows, setRows] = useState(ZZ_SENSITIVE_WORDS)
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
        footer={<><ZzBtn onClick={() => setEditing(null)}>取消</ZzBtn><ZzBtn primary onClick={() => { setRows((rs) => { const i = rs.indexOf(editing); return i >= 0 ? rs.map((x) => x === editing ? editing : x) : [...rs, editing] })(); setEditing(null) }}>保存</ZzBtn></>}>
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

/* ============================ 页面3：实时告警处理 ============================ */
function ZzQaAlert() {
  const [rows, setRows] = useState(ZZ_QA_ALERTS)
  const [review, setReview] = useState<any | null>(null)
  const today = rows.length
  const pending = rows.filter((r) => r.status === '待复核').length
  const handled = rows.filter((r) => r.status === '已处理').length
  const wrong = rows.filter((r) => r.status === '误判').length
  return (
    <ZzPage title="实时告警处理" crumb="催贷管理 / 智能AI质检" subtitle="通话过程中AI实时识别违规敏感词，完成告警复核、判定处理">
      <div className="mb-4 flex flex-wrap gap-3">
        <ZzStat label="今日告警总数" value={today} accent={RED} />
        <ZzStat label="待复核" value={pending} accent={AMBER} />
        <ZzStat label="已处理" value={handled} accent={GREEN} />
        <ZzStat label="标记误判" value={wrong} />
      </div>
      <ZzFilterBar>
        <ZzField label="告警时间"><ZzInput type="date" /></ZzField>
        <ZzField label="坐席"><ZzInput placeholder="姓名/工号" /></ZzField>
        <ZzField label="风险等级"><ZzSelect defaultValue=""><option value="">全部</option><option>高</option><option>中</option><option>低</option></ZzSelect></ZzField>
        <ZzField label="处理状态"><ZzSelect defaultValue=""><option value="">全部</option><option>待复核</option><option>已处理</option><option>误判</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn>重置</ZzBtn>
        <ZzBtn onClick={() => alert('已导出告警处理记录')}>导出</ZzBtn>
      </ZzFilterBar>
      <ZzCard title="告警列表" extra={<ZzBtn sm onClick={() => alert('已导出')}>导出</ZzBtn>}>
        <ZzTable stickyAction head={['告警ID', '告警时间', '坐席', '债务人', '录音编号', '命中敏感词', '风险等级', '处理状态', '操作']} rows={rows.map((a) => [
          a.id, a.time, a.agent, a.debtor, a.call, <span className="text-red-600">{a.word}</span>, levelBadge(a.level),
          a.status === '待复核' ? <ZzBadge color={AMBER}>待复核</ZzBadge> : a.status === '已处理' ? <ZzBadge color={GREEN}>已处理</ZzBadge> : <ZzBadge color={GRAY}>误判</ZzBadge>,
          <ZzBtn sm primary onClick={() => setReview(a)}>{a.status === '待复核' ? '复核' : '查看'}</ZzBtn>,
        ])} />
      </ZzCard>
      {review && <ReviewModal a={review} onClose={() => setReview(null)} onSave={(na) => { setRows((rs) => rs.map((x) => x.id === na.id ? na : x)); setReview(null) }} />}
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

/* ============================ 页面4：事后抽样质检 ============================ */
function ZzQaTask() {
  const [tasks, setTasks] = useState(ZZ_QA_TASKS)
  const [create, setCreate] = useState(false)
  const [work, setWork] = useState<any | null>(null)
  const [tab, setTab] = useState('质检任务')
  const [report, setReport] = useState<any | null>(null)
  return (
    <ZzPage title="事后抽样质检" crumb="催贷管理 / 智能AI质检" subtitle="创建抽样任务，对历史催收通话做事后人工复核，完成质检打分">
      <ZzTabs tabs={['质检任务', '质检报告']} active={tab} onChange={setTab} />
      {tab === '质检任务' ? (
        <>
          <ZzFilterBar>
            <ZzBtn primary onClick={() => setCreate(true)}>新建质检任务</ZzBtn>
            <ZzBtn onClick={() => alert('已导出质检任务')}>导出</ZzBtn>
          </ZzFilterBar>
          <ZzCard title="质检任务列表" extra={<ZzBtn sm onClick={() => alert('已导出')}>导出</ZzBtn>}>
            <ZzTable stickyAction head={['任务名称', '任务时间范围', '抽样规则', '抽样总数/已完成', '负责人', '操作']} rows={tasks.map((t) => [
              t.name, t.range, t.dim, `${t.done}/${t.total}`, t.owner,
              <ZzBtn sm primary onClick={() => setWork(t)}>开始复核</ZzBtn>,
            ])} />
          </ZzCard>
        </>
      ) : (
        <ZzCard title="质检报告列表" extra={<ZzBtn sm onClick={() => alert('已导出')}>导出</ZzBtn>}>
          <ZzTable stickyAction head={['报告ID', '所属任务', '录音编号', '坐席', '债务人', '质检日期', '总分', '违规点', '操作']} rows={ZZ_QA_REPORTS.map((r) => [
            r.id, r.task, r.callId, r.agent, r.target, r.date,
            <span className={r.score < 80 ? 'font-semibold text-red-600' : 'font-semibold text-green-600'}>{r.score} / {r.total}</span>,
            r.violations.length ? <span className="text-red-600">{r.violations.join('、')}</span> : <span className="text-gray-400">无</span>,
            <ZzBtn sm primary onClick={() => setReport(r)}>详情</ZzBtn>,
          ])} />
        </ZzCard>
      )}
      {create && <CreateTaskModal onClose={() => setCreate(false)} onOk={(nt) => { setTasks((ts) => [...ts, nt]); setCreate(false) }} />}
      {work && <ReviewWorkbench task={work} onClose={() => setWork(null)} />}
      {report && <ReportDrawer r={report} onClose={() => setReport(null)} />}
    </ZzPage>
  )
}

/* 质检报告详情（右侧抽屉）：评分项/扣分/总分/违规点 + 录音回放 */
function ReportDrawer({ r, onClose }: { r: any; onClose: () => void }) {
  const rec = ZZ_QA_RECORDS.find((x) => x.id === r.callId)
  return (
    <ZzDrawer open title={`质检报告 · ${r.id}`} onClose={onClose} width={600}
      footer={<ZzBtn primary onClick={onClose}>关闭</ZzBtn>}>
      <div className="space-y-3 text-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">坐席</div><div className="font-medium">{r.agent}</div></div>
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">债务人</div><div className="font-medium">{r.target}</div></div>
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">录音编号</div><div className="font-medium">{r.callId}</div></div>
          <div className="rounded border px-3 py-2"><div className="text-xs text-gray-400">质检日期</div><div className="font-medium">{r.date}</div></div>
        </div>
        <ZzCard title="质检评分">
          <div className="space-y-2">
            {r.items.map((it: any) => (
              <div key={it.item} className="grid grid-cols-3 items-center gap-2">
                <div><span className="font-medium">{it.item}</span><span className="ml-1 text-gray-400">（{it.max}分）</span></div>
                <div className={it.deduct ? 'font-medium text-red-600' : 'text-gray-600'}>扣分 {it.deduct} · 得 {it.score}</div>
                <div className="text-gray-500">{it.note}</div>
              </div>
            ))}
            <div className="text-right font-semibold">总分：{r.score} / {r.total}</div>
          </div>
        </ZzCard>
        <div className="text-sm">违规点：{r.violations.length ? <span className="text-red-600">{r.violations.join('、')}</span> : '无'}</div>
        {rec && (<><div className="text-xs text-gray-500">录音回放</div><QaPlayer rec={rec} /></>)}
      </div>
    </ZzDrawer>
  )
}

function CreateTaskModal({ onClose, onOk }: { onClose: () => void; onOk: (t: any) => void }) {
  const [name, setName] = useState('9月坐席抽样质检')
  return (
    <ZzModal open title="新建质检任务" onClose={onClose} width={560}
      footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => onOk({ id: 'QT-' + Math.floor(Math.random() * 100), name, range: '2026-09-01~2026-09-30', dim: '按坐席 10% 抽样', tpl: '催收质检标准打分表', total: 100, done: 0, owner: '质检组', records: ZZ_QA_RECORDS.map((r) => r.id) })}>创建</ZzBtn></>}>
      <div className="space-y-3">
        <ZzField label="任务名称"><ZzInput value={name} onChange={(e) => setName(e.target.value)} /></ZzField>
        <ZzField label="通话时间范围"><ZzInput defaultValue="2026-09-01 ~ 2026-09-30" /></ZzField>
        <div className="grid grid-cols-2 gap-3">
          <ZzField label="抽样维度"><ZzSelect defaultValue="按坐席"><option>按坐席</option><option>按客户</option><option>按告警记录</option></ZzSelect></ZzField>
          <ZzField label="抽样比例/条数"><ZzInput type="number" defaultValue={10} /></ZzField>
        </div>
        <ZzField label="质检打分模板"><ZzSelect defaultValue="催收质检标准打分表"><option>催收质检标准打分表</option><option>合规专项打分表</option></ZzSelect></ZzField>
        <ZzField label="负责人"><ZzInput defaultValue="质检组" /></ZzField>
      </div>
    </ZzModal>
  )
}

/* 复核工作台：每条录音播放转写 + 质检打分表单 */
function ReviewWorkbench({ task, onClose }: { task: any; onClose: () => void }) {
  const recs = ZZ_QA_RECORDS.filter((r) => task.records.includes(r.id))
  const [cur, setCur] = useState(recs[0])
  const [scores, setScores] = useState<any>({})
  const [comment, setComment] = useState('')
  const totalScore = ZZ_QA_SCORE_TPL.reduce((s, it) => s + (Number(scores[it.item]) || 0), 0)
  return (
    <ZzModal open title={`复核工作台 · ${task.name}`} onClose={onClose} width={820}
      footer={<><ZzBtn onClick={() => alert(`已保存打分，总分 ${totalScore}；剩余 ${task.total - task.done - 1} 条`)}>保存并提交</ZzBtn><ZzBtn primary onClick={onClose}>关闭</ZzBtn></>}>
      <div className="max-h-[78vh] space-y-3 overflow-auto pr-1">
        <div className="flex items-center gap-2 text-sm">
          <ZzBtn sm onClick={() => setCur(recs[(recs.indexOf(cur) - 1 + recs.length) % recs.length])}>上一条</ZzBtn>
          <ZzBtn sm onClick={() => setCur(recs[(recs.indexOf(cur) + 1) % recs.length])}>下一条</ZzBtn>
          <span className="text-gray-500">当前：{cur.target}（{cur.id}）</span>
        </div>
        <QaPlayer rec={cur} />
        <ZzCard title="质检打分表">
          <div className="space-y-2">
            {ZZ_QA_SCORE_TPL.map((it) => (
              <div key={it.item} className="grid grid-cols-3 items-center gap-2 text-sm">
                <div><span className="font-medium">{it.item}</span><span className="text-gray-400">（{it.desc}）</span></div>
                <div className="text-gray-400">满分 {it.max}</div>
                <ZzInput type="number" max={it.max} value={scores[it.item] ?? it.max} onChange={(e) => setScores({ ...scores, [it.item]: Math.min(Number(e.target.value), it.max) })} />
              </div>
            ))}
            <div className="text-right font-semibold">总分：{totalScore} / 100</div>
            <ZzField label="质检评语"><ZzTextarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="填写质检评语与改进建议" /></ZzField>
          </div>
        </ZzCard>
      </div>
    </ZzModal>
  )
}
