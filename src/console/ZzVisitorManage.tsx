// 外访人员管理：人员档案 / 任务负载 / 区域分布
import { useMemo, useState } from 'react'
import { ZzPage, ZzCard, ZzTable, ZzBadge, ZzBtn, ZzModal, ZzTabs, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzStat } from './zzUi'
import { ZZ_VISITOR_LIST, ZZ_VISITOR_STATUS, ZZ_VISITOR_SKILLS, ZZ_VISIT_REGIONS, ZZ_VISIT_BASE_DATE, ZZ_VISITOR_LEAVES, ZZ_VISITOR_PLAN, ZZ_VISITOR_PERF } from './zzData'
import { useZzList, updateZzList, ZZ_FILE } from './zzStore'

const statusColor: any = { 在岗: '#16A34A', 休假: '#D97706', 停用: '#94A3B8' }
const DAILY_CAP = 5 // 单日任务上限，用于判断「排满」

function addDays(base: string, n: number) {
  const d = new Date(base + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d.toISOString().slice(0, 10)
}
function mondayOf(base: string) {
  const d = new Date(base + 'T00:00:00')
  const day = (d.getDay() + 6) % 7 // 周一=0
  return addDays(base, -day)
}
function genDates(mode: string, cusStart: string, cusEnd: string) {
  const start = mode.trim() === '本周' ? mondayOf(ZZ_VISIT_BASE_DATE) : mode.trim() === '本月' ? ZZ_VISIT_BASE_DATE.slice(0, 7) + '-01' : cusStart
  const end = mode.trim() === '本月' ? ZZ_VISIT_BASE_DATE.slice(0, 7) + '-31' : (mode.trim() === '自定义' ? cusEnd : addDays(mondayOf(ZZ_VISIT_BASE_DATE), 6))
  const out: string[] = []
  let cur = new Date(start + 'T00:00:00')
  const stop = new Date(end + 'T00:00:00')
  while (cur <= stop) { out.push(cur.toISOString().slice(0, 10)); cur.setDate(cur.getDate() + 1) }
  return out
}
function cellInfo(v: any, date: string) {
  if (v.status === '停用') return { kind: '停用', count: 0, tasks: [] }
  const leave = (ZZ_VISITOR_LEAVES[v.id] || []).find((l: any) => l.date === date)
  if (leave) return { kind: leave.type, count: 0, tasks: [] }
  const tasks = (ZZ_VISITOR_PLAN[v.id] || []).filter((t: any) => t.date === date)
  return { kind: '在岗', count: tasks.length, tasks }
}

export function ZzVisitorManage() {
  // 外访人员走共享数据层：新建/停用后，外访任务分配下拉即时生效
  const list = useZzList<any>(ZZ_FILE.visitors, ZZ_VISITOR_LIST)
  const setList = (v: any[] | ((rs: any[]) => any[])) => updateZzList<any>(ZZ_FILE.visitors, (rs) => (typeof v === 'function' ? v(rs) : v))
  const [tab, setTab] = useState('人员列表')
  const [kw, setKw] = useState('')
  const [fRegion, setFRegion] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [edit, setEdit] = useState<any | null>(null)
  // 任务负载子视图
  const [subTab, setSubTab] = useState('表格视图')
  const [rangeMode, setRangeMode] = useState('本月')
  const [cusStart, setCusStart] = useState('2026-08-18')
  const [cusEnd, setCusEnd] = useState('2026-08-25')
  const [calRegion, setCalRegion] = useState('')
  const [onlyActive, setOnlyActive] = useState(false)
  const [quick, setQuick] = useState<{ vid: string; date: string } | null>(null)
  const [drag, setDrag] = useState<{ vid: string; caseId: string; fromDate: string } | null>(null)

  const filtered = useMemo(() => list.filter((v) =>
    (!kw || (v.name + v.id + v.agency).toLowerCase().includes(kw.toLowerCase())) &&
    (!fRegion || v.region === fRegion) &&
    (!fStatus || v.status === fStatus)
  ), [list, kw, fRegion, fStatus])

  const regionStat = useMemo(() => ZZ_VISIT_REGIONS.map((r) => {
    const subs = list.filter((v) => v.region === r)
    return { region: r, total: subs.length, active: subs.filter((v) => v.status === '在岗').length, tasks: subs.reduce((a, v) => a + (v.tasks || 0), 0) }
  }), [list])

  const dates = useMemo(() => genDates(rangeMode, cusStart, cusEnd), [rangeMode, cusStart, cusEnd])

  const calVisitors = useMemo(() => list.filter((v) => (!calRegion || v.region === calRegion) && (!onlyActive || v.status === '在岗')), [list, calRegion, onlyActive])

  const perfStats = useMemo(() => {
    const rows = ZZ_VISITOR_PERF.filter((r) => r.date >= dates[0] && r.date <= dates[dates.length - 1])
    return list.map((v) => {
      const recs = rows.filter((r) => r.visitorId === v.id)
      const received = recs.length
      const success = recs.filter((r) => r.result === '成功').length
      const failed = recs.filter((r) => r.result === '失联' || r.result === '未找到人').length
      const avg = recs.length ? Math.round(recs.reduce((a, r) => a + r.durationMin, 0) / recs.length) : 0
      const rate = received ? Math.round((success / received) * 100) : 0
      return { ...v, received, success, failed, avg, successRate: rate }
    })
  }, [list, dates])

  const save = () => {
    if (!edit) return
    setList((l) => { const i = l.findIndex((x) => x.id === edit.id); return i >= 0 ? l.map((x) => x.id === edit.id ? edit : x) : [...l, edit] })
    setEdit(null)
  }

  const quickTasksSaved = () => {
    if (!quick) return
    const t = { date: quick.date, caseId: 'CO-NEW-' + Math.floor(Math.random() * 9000 + 1000), addr: '待补充地址', status: '待外访' }
    ZZ_VISITOR_PLAN[quick.vid] = [...(ZZ_VISITOR_PLAN[quick.vid] || []), t]
    setList((l) => l.map((x) => x.id === quick.vid ? { ...x, tasks: (x.tasks || 0) + 1 } : x))
    setQuick(null)
  }

  // 拖拽改派：将某外访任务从源日期移动到目标人员+目标日期
  const moveTask = (src: { vid: string; caseId: string; fromDate: string }, dstVid: string, dstDate: string) => {
    const srcList: any[] = ZZ_VISITOR_PLAN[src.vid] || []
    const idx = srcList.findIndex((t: any) => t.caseId === src.caseId && t.date === src.fromDate)
    if (idx < 0) return
    const [task] = srcList.splice(idx, 1)
    const moved = { ...task, date: dstDate }
    ZZ_VISITOR_PLAN[dstVid] = [...(ZZ_VISITOR_PLAN[dstVid] || []), moved]
    setList((l) => l.map((x) => {
      if (x.id === src.vid) return { ...x, tasks: Math.max(0, (x.tasks || 0) - 1) }
      if (x.id === dstVid) return { ...x, tasks: (x.tasks || 0) + 1 }
      return x
    }))
  }

  return (
    <ZzPage title="外访人员管理" crumb="外访管理 / 外访人员管理" subtitle="外访人员档案、任务负载与区域分布（样例数据）"
      actions={<ZzBtn primary onClick={() => setEdit({ id: 'V-' + (String(100 + list.length).padStart(3, '0')), name: '', phone: '', agency: '', region: ZZ_VISIT_REGIONS[0], skills: [], status: '在岗', rating: 5.0, tasks: 0, done: 0 })}>＋ 新建人员</ZzBtn>}>
      <ZzTabs tabs={['人员列表', '人员日历']} active={tab} onChange={setTab} />

      {tab === '人员列表' && (
        <>
          <ZzFilterBar>
            <ZzField label="搜索"><ZzInput placeholder="姓名/工号/机构" value={kw} onChange={(e) => setKw(e.target.value)} /></ZzField>
            <ZzField label="区域"><ZzSelect value={fRegion} onChange={(e) => setFRegion(e.target.value)}><option value="">全部</option>{ZZ_VISIT_REGIONS.map((r) => <option key={r}>{r}</option>)}</ZzSelect></ZzField>
            <ZzField label="状态"><ZzSelect value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">全部</option>{ZZ_VISITOR_STATUS.map((s) => <option key={s}>{s}</option>)}</ZzSelect></ZzField>
            <ZzBtn onClick={() => { setKw(''); setFRegion(''); setFStatus('') }}>重置</ZzBtn>
          </ZzFilterBar>
          <ZzCard title={`人员列表（${filtered.length}）`}>
            <ZzTable stickyAction head={['工号', '姓名', '手机号', '所属机构', '区域', '技能', '状态', '评分', '在途任务', '累计完成', '操作']} rows={filtered.map((v) => [
              v.id, <span className="font-medium">{v.name}</span>, v.phone, v.agency, v.region,
              <div className="flex flex-wrap gap-1">{(v.skills || []).map((k: string) => <ZzBadge key={k}>{k}</ZzBadge>)}</div>,
              <ZzBadge color={statusColor[v.status]}>{v.status}</ZzBadge>, v.rating, v.tasks, v.done,
              <div className="flex gap-2"><ZzBtn sm onClick={() => setEdit({ ...v })}>编辑</ZzBtn>
                <ZzBtn sm danger={v.status !== '停用'} onClick={() => setList((l) => l.map((x) => x.id === v.id ? { ...x, status: x.status === '停用' ? '在岗' : '停用' } : x))}>{v.status === '停用' ? '启用' : '停用'}</ZzBtn></div>,
            ])} />
          </ZzCard>
        </>
      )}

      {tab === '人员日历' && (
        <div className="space-y-3">
          {/* 筛选条件 */}
          <ZzFilterBar>
            <ZzField label="范围">
              <ZzSelect value={rangeMode} onChange={(e) => setRangeMode(e.target.value)}>
                <option>本周</option><option>本月</option><option>自定义</option>
              </ZzSelect>
            </ZzField>
            {rangeMode === '自定义' && (
              <>
                <ZzField label="开始日期"><ZzInput type="date" value={cusStart} onChange={(e) => setCusStart(e.target.value)} /></ZzField>
                <ZzField label="结束日期"><ZzInput type="date" value={cusEnd} onChange={(e) => setCusEnd(e.target.value)} /></ZzField>
              </>
            )}
            <ZzField label="区域"><ZzSelect value={calRegion} onChange={(e) => setCalRegion(e.target.value)}><option value="">全部</option>{ZZ_VISIT_REGIONS.map((r) => <option key={r}>{r}</option>)}</ZzSelect></ZzField>
            <label className="inline-flex items-end gap-1 pb-2 text-sm"><input type="checkbox" checked={onlyActive} onChange={(e) => setOnlyActive(e.target.checked)} />仅看在岗</label>
            <ZzBtn onClick={() => { setRangeMode('本月'); setCalRegion(''); setOnlyActive(false) }}>重置</ZzBtn>
          </ZzFilterBar>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-[#16A34A]" />在岗可派</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-[#FDE68A]" />休假/请假</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-[#94A3B8]" />停用</span>
            <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-[#1d4ed8]" />任务越多越深</span>
            <span>拖拽任务卡片可改派日期；点击空白格快捷新建外访任务</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-xs text-gray-500">
                  <th className="sticky left-0 z-10 bg-white p-2 text-left">人员 / 日期</th>
                  {dates.map((d) => (
                    <th key={d} className="min-w-[92px] p-2 text-center font-medium">{d.slice(5)}<div className="text-[10px] text-gray-400">{['日', '一', '二', '三', '四', '五', '六'][new Date(d + 'T00:00:00').getDay()]}</div></th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {calVisitors.map((v) => (
                  <tr key={v.id} className="border-t">
                    <td className="sticky left-0 z-10 bg-white p-2">
                      <div className="cursor-pointer text-[#1677ff] underline" onClick={() => setEdit({ ...v })}>{v.name}</div>
                      <div className="text-xs text-gray-400">{v.region} · {v.id}</div>
                    </td>
                    {dates.map((d) => {
                      const info = cellInfo(v, d)
                      const bg = info.kind === '停用' ? '#F1F5F9'
                        : (info.kind === '休假' || info.kind === '请假') ? '#FDE68A'
                          : info.count === 0 ? '#F0FDF4'
                            : `rgba(29,78,216,${Math.min(0.85, 0.3 + info.count * 0.18)})`
                      const busy = info.count >= DAILY_CAP
                      return (
                        <td key={d} className="p-1">
                          <div
                            title={info.tasks.length ? info.tasks.map((t: any) => `${t.caseId} ${t.addr}`).join('\n') : (info.kind === '在岗' ? '可派单' : info.kind)}
                            onClick={() => { if (info.kind === '在岗') setQuick({ vid: v.id, date: d }) }}
                            onDragOver={info.kind === '在岗' ? (e) => e.preventDefault() : undefined}
                            onDrop={info.kind === '在岗' ? (e) => { e.preventDefault(); if (drag) { moveTask(drag, v.id, d); setDrag(null) } } : undefined}
                            className={`min-h-[48px] cursor-pointer rounded border border-white/40 p-1 text-center text-xs ${info.kind !== '在岗' ? 'cursor-not-allowed' : 'hover:ring-2 hover:ring-[#1677ff]'}`}
                            style={{ background: bg, color: info.kind === '在岗' && info.count ? '#fff' : '#334155' }}
                          >
                            {info.kind === '在岗' ? (
                              info.tasks.length ? (
                                <div className="space-y-0.5">
                                  {info.tasks.map((t: any) => (
                                    <div key={t.caseId}
                                      draggable
                                      onDragStart={(e) => { setDrag({ vid: v.id, caseId: t.caseId, fromDate: d }); e.dataTransfer.effectAllowed = 'move' }}
                                      onClick={(e) => e.stopPropagation()}
                                      className="cursor-grab truncate rounded bg-white/85 px-1 text-[10px] text-slate-700 ring-1 ring-white/60 active:cursor-grabbing"
                                      title={`${t.caseId} ${t.addr}（拖拽改派日期）`}
                                    >{t.caseId}</div>
                                  ))}
                                </div>
                              ) : <div className="font-medium">空闲</div>
                            ) : <div className="font-medium">{info.kind}</div>}
                            {busy && <div className="text-[10px] text-red-200">已满</div>}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {edit && (
        <ZzModal open title={edit.id && ZZ_VISITOR_LIST.find((x) => x.id === edit.id) ? `编辑人员 · ${edit.id}` : '新建人员'} onClose={() => setEdit(null)} width={640}
          footer={<><ZzBtn onClick={() => setEdit(null)}>取消</ZzBtn><ZzBtn primary onClick={save}>保存</ZzBtn></>}>
          <div className="grid grid-cols-2 gap-3">
            <ZzField label="姓名"><ZzInput value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></ZzField>
            <ZzField label="工号"><ZzInput value={edit.id} disabled /></ZzField>
            <ZzField label="手机号"><ZzInput value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></ZzField>
            <ZzField label="所属机构"><ZzInput value={edit.agency} onChange={(e) => setEdit({ ...edit, agency: e.target.value })} /></ZzField>
            <ZzField label="区域"><ZzSelect value={edit.region} onChange={(e) => setEdit({ ...edit, region: e.target.value })}>{ZZ_VISIT_REGIONS.map((r) => <option key={r}>{r}</option>)}</ZzSelect></ZzField>
            <ZzField label="状态"><ZzSelect value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{ZZ_VISITOR_STATUS.map((s) => <option key={s}>{s}</option>)}</ZzSelect></ZzField>
          </div>
          <ZzField label="技能标签（多选）">
            <div className="flex flex-wrap gap-2">
              {ZZ_VISITOR_SKILLS.map((k) => {
                const on = (edit.skills || []).includes(k)
                return <button key={k} onClick={() => setEdit({ ...edit, skills: on ? (edit.skills || []).filter((x: string) => x !== k) : [...(edit.skills || []), k] })} className={`rounded-full border px-3 py-1 text-xs ${on ? 'border-[#1677ff] bg-[#1677ff] text-white' : 'border-slate-300 text-gray-600'}`}>{k}</button>
              })}
            </div>
          </ZzField>
          <ZzField label="排班 / 绩效（只读）">
            <div className="rounded border p-2 text-sm text-gray-600">
              当前状态：{edit.status}；累计完成 {edit.done} 单。排班与历史任务请在「任务负载-人员日历视图」查看；休假/排班维护在此处调整状态。
            </div>
          </ZzField>
        </ZzModal>
      )}

      {quick && (
        <ZzModal open title={`新建外访任务 · ${quick.date}`} onClose={() => setQuick(null)} width={480}
          footer={<><ZzBtn onClick={() => setQuick(null)}>取消</ZzBtn><ZzBtn primary onClick={quickTasksSaved}>创建</ZzBtn></>}>
          <div className="mb-2 text-sm text-gray-500">已带入人员：{(list.find((v) => v.id === quick.vid) || {}).name}（{quick.vid}） · 日期：{quick.date}</div>
          <ZzField label="案件号"><ZzInput placeholder="如 CO-202608-099" value="" /></ZzField>
          <ZzField label="外访地址"><ZzInput placeholder="如 杭州市西湖区…" value="" /></ZzField>
          <ZzField label="优先级"><ZzSelect value="普通"><option>普通</option><option>紧急</option></ZzSelect></ZzField>
          {(ZZ_VISITOR_PLAN[quick.vid] || []).filter((t: any) => t.date === quick.date).length > 0 && (
            <div className="mt-2 text-xs text-gray-500">当日已分配：{ (ZZ_VISITOR_PLAN[quick.vid] || []).filter((t: any) => t.date === quick.date).map((t: any) => `${t.caseId}`).join('、') }</div>
          )}
        </ZzModal>
      )}
    </ZzPage>
  )
}
