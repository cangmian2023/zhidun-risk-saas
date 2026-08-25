// 催贷管理 · 模块5 外访管理
import { useState } from 'react'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzTable, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea, ZzBadge, ZzTabs, BLUE } from './zzUi'
import { ZZ_VISITS, ZZ_VISIT_MINE, ZZ_VISIT_STATUSES, ZZ_VISITORS, ZZ_BI_VISIT } from './zzData'

const GREEN = '#16A34A'
const RED = '#DC2626'
const AMBER = '#D97706'

function statusColor(s: string) {
  return s === '已完成' ? GREEN : s === '已驳回' || s === '已取消' ? RED : s === '待外访' || s === '待分配' ? BLUE : s === '外访进行中' || s === '待审核' ? AMBER : '#6B7280'
}

export function ZzVisitModule({ pageKey }: { pageKey: string }) {
  if (pageKey === 'zz:visit-mine') return <ZzVisitMine />
  if (pageKey === 'zz:visit-history') return <ZzVisitHistory />
  return <ZzVisitList />
}

/* ============================ 页面3：任务管理（主管/管理员） ============================ */
function ZzVisitList() {
  const [visits, setVisits] = useState<any[]>(ZZ_VISITS)
  const [detail, setDetail] = useState<any | null>(null)
  const [create, setCreate] = useState(false)
  const [assign, setAssign] = useState<any | null>(null)

  const addLog = (id: string, log: any) => setVisits((vs) => vs.map((v) => v.id === id ? { ...v, logs: [...v.logs, log] } : v))

  // 新建任务
  const [form, setForm] = useState({ caseId: 'CO-202608-015', name: '钱*伟', addr: '深圳市南山区科技路 8 号', backupAddr: '', dueDate: '2026-08-28', priority: '普通' })
  const submitCreate = () => {
    const id = 'VS-' + String(visits.length + 1).padStart(3, '0')
    setVisits((vs) => [...vs, { ...form, id, phone: '188****0000', status: '待分配', assignee: '-', creator: '主管-当前', createdAt: '2026-08-25 09:00', assignedAt: '', overdueAmount: 45000, age: 'M2', punch: null, report: null, rejectReason: '', logs: [{ op: '创建任务', by: '主管-当前', at: '2026-08-25 09:00', note: '手动创建' }] }])
    setCreate(false)
  }
  // 分配
  const doAssign = (visitor: string) => {
    if (!assign) return
    setVisits((vs) => vs.map((v) => v.id === assign.id ? { ...v, assignee: visitor, status: '待外访', assignedAt: '2026-08-25 10:00' } : v))
    addLog(assign.id, { op: '分配人员', by: '主管-当前', at: '2026-08-25 10:00', note: '分配给 ' + visitor })
    setAssign(null)
  }
  // 审核通过/驳回
  const approve = (v: any) => { setVisits((vs) => vs.map((x) => x.id === v.id ? { ...x, status: '已完成', finishedAt: '2026-08-25 11:00', resultSummary: (x.report?.result ?? '') } : x)); addLog(v.id, { op: '审核通过', by: '主管-当前', at: '2026-08-25 11:00', note: '报告合规，任务闭环' }); setDetail(null) }
  const reject = (v: any) => { const r = prompt('填写驳回意见') ?? ''; if (!r) return; setVisits((vs) => vs.map((x) => x.id === v.id ? { ...x, status: '已驳回', rejectReason: r } : x)); addLog(v.id, { op: '驳回报告', by: '主管-当前', at: '2026-08-25 11:00', note: r }); setDetail(null) }
  const cancel = (v: any) => { setVisits((vs) => vs.map((x) => x.id === v.id ? { ...x, status: '已取消' } : x)); addLog(v.id, { op: '取消任务', by: '主管-当前', at: '2026-08-25 11:30', note: '案件结清/终止' }); setDetail(null) }

  return (
    <ZzPage title="外访任务管理" crumb="催贷管理 / 外访管理" subtitle="任务创建、分配、审核与进度管理（主管/管理员）">
      <ZzFilterBar>
        <ZzField label="任务状态"><ZzSelect defaultValue=""><option value="">全部</option>{ZZ_VISIT_STATUSES.map((s) => <option key={s}>{s}</option>)}</ZzSelect></ZzField>
        <ZzField label="外访员"><ZzSelect defaultValue=""><option value="">全部</option>{ZZ_VISITORS.map((a) => <option key={a}>{a}</option>)}</ZzSelect></ZzField>
        <ZzField label="案件"><ZzInput placeholder="案件编号" /></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn onClick={() => setCreate(true)}>新建外访任务</ZzBtn>
        <ZzBtn onClick={() => alert('已导出任务与报告 Excel')}>批量导出</ZzBtn>
      </ZzFilterBar>
      <ZzCard title="全部任务列表">
        <ZzTable head={['任务ID', '案件', '客户', '外访地址', '优先级', '状态', '外访员', '操作']} rows={visits.map((v) => [
          v.id, v.caseId, v.name, v.addr, <ZzBadge color={v.priority === '紧急' ? RED : '#6B7280'}>{v.priority}</ZzBadge>,
          <ZzBadge color={statusColor(v.status)}>{v.status}</ZzBadge>, v.assignee,
          <div className="flex flex-wrap gap-1">
            <ZzBtn sm onClick={() => setDetail(v)}>详情</ZzBtn>
            {v.status === '待分配' && <ZzBtn sm primary onClick={() => setAssign(v)}>分配</ZzBtn>}
            {v.status === '待审核' && <ZzBtn sm primary onClick={() => setDetail(v)}>审核</ZzBtn>}
            {['待外访', '外访进行中', '待审核', '已驳回'].includes(v.status) && <ZzBtn sm danger onClick={() => cancel(v)}>取消</ZzBtn>}
          </div>,
        ])} />
      </ZzCard>

      {detail && <ZzVisitDetail v={detail} visits={visits} setVisits={setVisits} onClose={() => setDetail(null)} onApprove={approve} onReject={reject} onCancel={cancel} admin />}
      {create && <ZzModal open title="新建外访任务" onClose={() => setCreate(false)} footer={<><ZzBtn onClick={() => setCreate(false)}>取消</ZzBtn><ZzBtn primary onClick={submitCreate}>创建</ZzBtn></>}>
        <div className="grid grid-cols-2 gap-3">
          <ZzField label="关联案件"><ZzInput value={form.caseId} onChange={(e) => setForm({ ...form, caseId: e.target.value })} /></ZzField>
          <ZzField label="客户姓名"><ZzInput value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></ZzField>
          <ZzField label="外访地址" className="col-span-2"><ZzInput value={form.addr} onChange={(e) => setForm({ ...form, addr: e.target.value })} /></ZzField>
          <ZzField label="备选地址"><ZzInput value={form.backupAddr} onChange={(e) => setForm({ ...form, backupAddr: e.target.value })} /></ZzField>
          <ZzField label="要求完成日期"><ZzInput type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} /></ZzField>
          <ZzField label="优先级"><ZzSelect value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>普通</option><option>紧急</option></ZzSelect></ZzField>
        </div>
      </ZzModal>}
      {assign && <ZzModal open title={`分配任务 · ${assign.id}`} onClose={() => setAssign(null)} footer={<><ZzBtn onClick={() => setAssign(null)}>取消</ZzBtn><ZzBtn primary onClick={() => doAssign(ZZ_VISITORS[0])}>确认分配给 {ZZ_VISITORS[0]}</ZzBtn></>}>
        <ZzField label="选择外访员"><ZzSelect defaultValue={ZZ_VISITORS[0]}>{ZZ_VISITORS.map((a) => <option key={a}>{a}</option>)}</ZzSelect></ZzField>
        <div className="mt-3 flex gap-2">{ZZ_VISITORS.map((a) => <ZzBtn key={a} sm onClick={() => doAssign(a)}>{a}</ZzBtn>)}</div>
      </ZzModal>}
    </ZzPage>
  )
}

/* ============================ 页面2：我的外访任务（外访员） ============================ */
function ZzVisitMine() {
  const [list, setList] = useState<any[]>(ZZ_VISIT_MINE)
  const [tab, setTab] = useState('待外访')
  const [detail, setDetail] = useState<any | null>(null)
  const [report, setReport] = useState<any | null>(null)
  const tabs = ['待外访', '进行中', '待审核', '已完成', '已驳回']
  const visible = list.filter((v) => (tab === '进行中' ? v.status === '外访进行中' : v.status === tab))

  const doPunch = (v: any) => {
    const inR = Math.random() > 0.3
    const ok = inR || confirm('当前位置偏离目标地址，是否强制打卡（将标记风险）？')
    if (!ok) return
    setList((ls) => ls.map((x) => x.id === v.id ? { ...x, status: '外访进行中', punch: { time: '2026-08-25 09:30', lng: 120.15, lat: 30.28, actualAddr: v.addr, inRadius: inR, device: 'iPhone 14', offline: false } } : x))
    alert(inR ? '打卡成功，状态：外访进行中' : '已强制打卡，位置偏移已标记风险')
  }
  const submitReport = (v: any, r: any) => { setList((ls) => ls.map((x) => x.id === v.id ? { ...x, status: '待审核', report: r } : x)); setReport(null); alert('报告已提交，待主管审核') }

  return (
    <ZzPage title="我的外访任务" crumb="催贷管理 / 外访管理" subtitle="外访人员视图：待办、现场打卡与报告填报">
      <ZzTabs tabs={tabs} active={tab} onChange={setTab} />
      <ZzFilterBar>
        <ZzField label="客户姓名"><ZzInput placeholder="姓名关键词" /></ZzField>
        <ZzField label="案件编号"><ZzInput placeholder="案件编号" /></ZzField>
        <ZzField label="任务ID"><ZzInput placeholder="VS-xxx" /></ZzField>
        <ZzField label="状态"><ZzSelect defaultValue={tab}><option>{tab}</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
      </ZzFilterBar>
      <ZzCard title={`${tab}（${visible.length}）`}>
        <ZzTable head={['任务ID', '案件', '客户', '电话', '外访地址', '优先级', '要求完成', '状态', '操作']} rows={visible.map((v) => [
          v.id, v.caseId, v.name, v.phone, v.addr, <ZzBadge color={v.priority === '紧急' ? RED : '#6B7280'}>{v.priority}</ZzBadge>, v.dueDate,
          <ZzBadge color={statusColor(v.status)}>{v.status}</ZzBadge>,
          <div className="flex flex-wrap gap-1">
            {v.status === '待外访' && <ZzBtn sm primary onClick={() => doPunch(v)}>打卡</ZzBtn>}
            {v.status === '外访进行中' && <ZzBtn sm primary onClick={() => setReport(v)}>填报告</ZzBtn>}
            {v.status === '待审核' && <ZzBtn sm onClick={() => setDetail(v)}>查看报告</ZzBtn>}
            {v.status === '已驳回' && <ZzBtn sm primary onClick={() => setReport(v)}>修改报告</ZzBtn>}
            {(v.status === '已完成' || v.status === '已取消' || v.status === '待外访') && <ZzBtn sm onClick={() => setDetail(v)}>详情</ZzBtn>}
            {v.status === '外访进行中' && <ZzBtn sm onClick={() => setDetail(v)}>详情</ZzBtn>}
          </div>,
        ])} />
      </ZzCard>
      {detail && <ZzVisitDetail v={detail} visits={list} setVisits={setList} onClose={() => setDetail(null)} />}
      {report && <ReportForm v={report} onClose={() => setReport(null)} onSubmit={submitReport} />}
    </ZzPage>
  )
}

/* ============================ 外访报告表单（填报告/修改报告） ============================ */
function ReportForm({ v, onClose, onSubmit }: { v: any; onClose: () => void; onSubmit: (v: any, r: any) => void }) {
  const [r, setR] = useState<any>(v.report ?? { result: '见到本人客户', talk: '', statusDesc: '', agree: '是', planTime: '', planAmount: '', risk: '无', photos: [] as string[], audio: '', summary: '' })
  const set = (k: string, val: any) => setR({ ...r, [k]: val })
  return (
    <ZzModal open title={`外访报告 · ${v.id}`} onClose={onClose} width={680} footer={<><ZzBtn onClick={onClose}>取消</ZzBtn><ZzBtn primary onClick={() => onSubmit(v, r)}>提交报告</ZzBtn></>}>
      <div className="space-y-3">
        <ZzField label="现场走访结果">
          <ZzSelect value={r.result} onChange={(e) => set('result', e.target.value)}>
            <option>见到本人客户</option><option>见到家属/同住人</option><option>无人在家，敲门无人应答</option><option>地址错误，查无此人</option><option>拒绝沟通、拒不开门</option>
          </ZzSelect>
        </ZzField>
        <ZzField label="沟通情况（客户态度、还款意愿、口头承诺）"><ZzTextarea rows={3} value={r.talk} onChange={(e) => set('talk', e.target.value)} /></ZzField>
        <ZzField label="客户现状（工作/家庭/经济困难）"><ZzTextarea rows={2} value={r.statusDesc} onChange={(e) => set('statusDesc', e.target.value)} /></ZzField>
        <div className="grid grid-cols-3 gap-3">
          <ZzField label="是否达成还款协议"><ZzSelect value={r.agree} onChange={(e) => set('agree', e.target.value)}><option>是</option><option>否</option></ZzSelect></ZzField>
          <ZzField label="计划还款时间"><ZzInput value={r.planTime} onChange={(e) => set('planTime', e.target.value)} placeholder="2026-08-31" /></ZzField>
          <ZzField label="计划还款金额"><ZzInput value={r.planAmount} onChange={(e) => set('planAmount', e.target.value)} placeholder="20000" /></ZzField>
        </div>
        <ZzField label="风险标记"><ZzSelect value={r.risk} onChange={(e) => set('risk', e.target.value)}><option>无</option><option>存在冲突</option><option>客户投诉倾向</option></ZzSelect></ZzField>
        <ZzField label="现场照片（门牌号、房屋现场，禁止偷拍隐私人像）"><input type="file" multiple accept="image/*" className="block text-sm" onChange={(e) => set('photos', Array.from(e.target.files ?? []).map((f) => f.name))} /></ZzField>
        <ZzField label="录音文件（如有）"><input type="file" accept="audio/*" className="block text-sm" onChange={(e) => set('audio', e.target.value as any)} /></ZzField>
        <ZzField label="外访员总结备注"><ZzTextarea rows={2} value={r.summary} onChange={(e) => set('summary', e.target.value)} /></ZzField>
      </div>
    </ZzModal>
  )
}

/* ============================ 页面2：外访任务详情页（4卡片） ============================ */
function ZzVisitDetail({ v, visits, setVisits, onClose, onApprove, onReject, onCancel, admin }: {
  v: any; visits: any[]; setVisits: (f: (p: any[]) => any[]) => void; onClose: () => void; onApprove?: (v: any) => void; onReject?: (v: any) => void; onCancel?: (v: any) => void; admin?: boolean
}) {
  return (
    <ZzModal open title={`外访任务详情 · ${v.id}`} onClose={onClose} width={820}
      footer={<><ZzBtn onClick={onClose}>关闭</ZzBtn>{admin && v.status === '待审核' && <><ZzBtn danger onClick={() => onReject?.(v)}>驳回</ZzBtn><ZzBtn primary onClick={() => onApprove?.(v)}>审核通过</ZzBtn></>}{admin && onCancel && ['待外访', '外访进行中', '待审核', '已驳回'].includes(v.status) && <ZzBtn danger onClick={() => onCancel(v)}>取消任务</ZzBtn>}</>}>
      <div className="space-y-4">
        <ZzCard title="① 任务基础信息">
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-3">
            {[['任务ID', v.id], ['关联案件', v.caseId], ['客户', v.name], ['手机', v.phone], ['外访地址', v.addr], ['备选地址', v.backupAddr || '—'], ['任务来源', v.creator], ['创建时间', v.createdAt], ['分配外访员', v.assignee], ['分配时间', v.assignedAt || '—'], ['要求完成', v.dueDate], ['优先级', <ZzBadge color={v.priority === '紧急' ? RED : '#6B7280'}>{v.priority}</ZzBadge>], ['当前状态', <ZzBadge color={statusColor(v.status)}>{v.status}</ZzBadge>], ['逾期金额', v.overdueAmount?.toLocaleString()], ['账龄', v.age]].map(([k, val]) => (
              <div key={k} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{k}</div><div className="mt-0.5 font-medium">{val}</div></div>
            ))}
          </div>
        </ZzCard>
        <ZzCard title="② 打卡记录">
          {v.punch ? (
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              {[['打卡时间', v.punch.time], ['经纬度', `${v.punch.lng}, ${v.punch.lat}`], ['实际定位', v.punch.actualAddr], ['设备', v.punch.device]].map(([k, val]) => (
                <div key={k} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{k}</div><div className="mt-0.5 font-medium">{val}</div></div>
              ))}
              <div className="col-span-2 rounded border px-3 py-2"><div className="text-xs text-gray-400">半径校验</div><div className="mt-0.5 font-medium" style={{ color: v.punch.inRadius ? GREEN : RED }}>{v.punch.inRadius ? '✅ 正常（目标地址半径内）' : '⚠️ 位置偏移（风险标记）'}{v.punch.offline ? ' · 离线同步' : ''}</div></div>
            </div>
          ) : <div className="text-sm text-gray-400">尚未现场打卡</div>}
        </ZzCard>
        <ZzCard title="③ 外访报告 & 证据附件">
          {v.report ? (
            <div className="space-y-2 text-sm">
              {[['走访结果', v.report.result], ['沟通情况', v.report.talk], ['客户现状', v.report.statusDesc], ['协商结果', `${v.report.agree} ${v.report.planTime ? '计划 ' + v.report.planTime + ' 还 ' + v.report.planAmount : ''}`], ['风险标记', v.report.risk], ['总结', v.report.summary]].map(([k, val]) => (
                <div key={k}><span className="text-gray-400">{k}：</span>{val || '—'}</div>
              ))}
              <div><span className="text-gray-400">证据附件：</span>{(v.report.photos?.length ? v.report.photos : []).map((p: string) => <ZzBadge key={p} color={BLUE}>{p}</ZzBadge>)}{v.report.audio && <ZzBadge color={AMBER}>{v.report.audio}</ZzBadge>}{(!v.report.photos?.length && !v.report.audio) && '无'}</div>
              {v.status === '已驳回' && <div className="rounded border border-red-200 bg-red-50 px-3 py-2 text-red-600">驳回意见：{v.rejectReason}</div>}
            </div>
          ) : <div className="text-sm text-gray-400">尚未提交外访报告</div>}
        </ZzCard>
        <ZzCard title="④ 操作日志">
          <div className="space-y-1 text-sm">
            {v.logs.map((l: any, i: number) => (
              <div key={i} className="flex gap-2 border-b pb-1"><span className="text-gray-400">{l.at}</span><span className="font-medium">{l.op}</span><span className="text-gray-500">（{l.by}）</span><span className="text-gray-400">{l.note}</span></div>
            ))}
          </div>
        </ZzCard>
      </div>
    </ZzModal>
  )
}

/* ============================ 页面4：外访历史（增强） ============================ */
function ZzVisitHistory() {
  const [visits, setVisits] = useState<any[]>(ZZ_VISITS)
  const [detail, setDetail] = useState<any | null>(null)
  return (
    <ZzPage title="外访历史记录" crumb="催贷管理 / 外访管理" subtitle="历史全部外访任务归档查询与报告查看">
      <ZzFilterBar>
        <ZzField label="时间范围"><ZzSelect defaultValue="近30天"><option>今日</option><option>近7天</option><option>近30天</option><option>全部</option></ZzSelect></ZzField>
        <ZzField label="外访员"><ZzSelect defaultValue=""><option value="">全部</option>{ZZ_VISITORS.map((a) => <option key={a}>{a}</option>)}</ZzSelect></ZzField>
        <ZzField label="状态"><ZzSelect defaultValue=""><option value="">全部</option>{ZZ_VISIT_STATUSES.map((s) => <option key={s}>{s}</option>)}</ZzSelect></ZzField>
        <ZzField label="案件"><ZzInput placeholder="案件编号" /></ZzField>
        <ZzBtn primary>查询</ZzBtn>
        <ZzBtn onClick={() => alert('已批量导出全部历史外访报告档案')}>批量导出</ZzBtn>
      </ZzFilterBar>
      <ZzCard title="历史记录">
        <ZzTable head={['任务ID', '案件', '客户', '外访地址', '外访员', '优先级', '完成时间', '外访结果摘要', '状态', '操作']} rows={visits.map((v) => [
          v.id, v.caseId, v.name, v.addr, v.assignee, <ZzBadge color={v.priority === '紧急' ? RED : '#6B7280'}>{v.priority}</ZzBadge>,
          v.finishedAt || '—', v.resultSummary || '—', <ZzBadge color={statusColor(v.status)}>{v.status}</ZzBadge>,
          <ZzBtn sm onClick={() => setDetail(v)}>查看详情</ZzBtn>,
        ])} />
      </ZzCard>
      {detail && <ZzVisitDetail v={detail} visits={visits} setVisits={setVisits} onClose={() => setDetail(null)} />}
    </ZzPage>
  )
}
