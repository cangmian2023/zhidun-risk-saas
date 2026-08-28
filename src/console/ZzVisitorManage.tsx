// 外访人员管理：人员档案 / 任务负载 / 区域分布
import { useMemo, useState } from 'react'
import { ZzPage, ZzCard, ZzTable, ZzBadge, ZzBtn, ZzModal, ZzTabs, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzStat } from './zzUi'
import { ZZ_VISITOR_LIST, ZZ_VISITOR_STATUS, ZZ_VISITOR_SKILLS, ZZ_VISIT_REGIONS } from './zzData'

const statusColor: any = { 在岗: '#16A34A', 休假: '#D97706', 停用: '#94A3B8' }

export function ZzVisitorManage() {
  const [list, setList] = useState<any[]>(() => ZZ_VISITOR_LIST.map((v) => ({ ...v })))
  const [tab, setTab] = useState('人员列表')
  const [kw, setKw] = useState('')
  const [fRegion, setFRegion] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [edit, setEdit] = useState<any | null>(null)

  const filtered = useMemo(() => list.filter((v) =>
    (!kw || (v.name + v.id + v.agency).toLowerCase().includes(kw.toLowerCase())) &&
    (!fRegion || v.region === fRegion) &&
    (!fStatus || v.status === fStatus)
  ), [list, kw, fRegion, fStatus])

  const regionStat = useMemo(() => ZZ_VISIT_REGIONS.map((r) => {
    const subs = list.filter((v) => v.region === r)
    return { region: r, total: subs.length, active: subs.filter((v) => v.status === '在岗').length, tasks: subs.reduce((a, v) => a + (v.tasks || 0), 0) }
  }), [list])

  const save = () => {
    if (!edit) return
    setList((l) => { const i = l.findIndex((x) => x.id === edit.id); return i >= 0 ? l.map((x) => x.id === edit.id ? edit : x) : [...l, edit] })
    setEdit(null)
  }

  return (
    <ZzPage title="外访人员管理" crumb="外访管理 / 外访人员管理" subtitle="外访人员档案、任务负载与区域分布（样例数据）"
      actions={<ZzBtn primary onClick={() => setEdit({ id: 'V-' + (String(100 + list.length).padStart(3, '0')), name: '', phone: '', agency: '', region: ZZ_VISIT_REGIONS[0], skills: [], status: '在岗', rating: 5.0, tasks: 0, done: 0 })}>＋ 新建人员</ZzBtn>}>
      <ZzTabs tabs={['人员列表', '任务负载', '区域分布']} active={tab} onChange={setTab} />

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

      {tab === '任务负载' && (
        <ZzCard title="任务负载视图">
          <ZzTable head={['工号', '姓名', '区域', '状态', '在途任务', '累计完成', '负载率']} rows={list.map((v) => {
            const cap = 10
            const rate = Math.min(100, Math.round(((v.tasks || 0) / cap) * 100))
            return [v.id, v.name, v.region, <ZzBadge color={statusColor[v.status]}>{v.status}</ZzBadge>, v.tasks, v.done,
              <div className="flex items-center gap-2"><div className="h-2 w-24 rounded bg-slate-100"><div className="h-2 rounded" style={{ width: rate + '%', background: rate > 80 ? '#DC2626' : '#1677ff' }} /></div><span className="text-xs">{rate}%</span></div>]
          })} />
        </ZzCard>
      )}

      {tab === '区域分布' && (
        <div className="grid grid-cols-3 gap-4">
          {regionStat.map((r) => (
            <ZzStat key={r.region} label={`${r.region}区域`} value={r.total} sub={`在岗 ${r.active} 人 ｜ 在途任务 ${r.tasks}`} accent="#1677ff" />
          ))}
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
        </ZzModal>
      )}
    </ZzPage>
  )
}
