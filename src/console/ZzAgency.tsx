// 催贷管理 · 模块4 委外监管（重构：菜单分组 + 详情抽屉打通关联数据）
import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzTable, ZzTabs, ZzField, ZzInput, ZzSelect, ZzBadge, ZzStat, ZzDrawer, BLUE } from './zzUi'
import {
  ZZ_AGENCIES, ZZ_AGENCY_ACCOUNTS, ZZ_ENTRUSTS, ZZ_AGENCY_MONITOR, ZZ_AGENCY_CALLBACKS,
  ZZ_AGENCY_KPI, ZZ_AGENCY_SETTLE, ZZ_AGENCY_STAFF, zzAgencyName, zzAgencyCases, zzAgencyAccounts,
  zzAgencyKpi, zzAgencySettle, pct, money, type ZzAgency,
} from './zzData'
import { useZzList, updateZzList, ZZ_FILE } from './zzStore'

/* 可点击机构名 —— 全局打开机构详情抽屉 */
function AgencyName({ id, onOpen }: { id: string; onOpen: (id: string) => void }) {
  return (
    <button className="font-medium text-[#1677ff] hover:underline" onClick={(e) => { e.stopPropagation(); onOpen(id) }}>
      {zzAgencyName(id)}
    </button>
  )
}
/* 可点击案件号 —— 全局打开案件委外详情抽屉 */
function CaseId({ id, onOpen }: { id: string; onOpen: (id: string, tab?: string) => void }) {
  return (
    <button className="font-mono text-[#1677ff] hover:underline" onClick={(e) => { e.stopPropagation(); onOpen(id, 'info') }}>
      {id}
    </button>
  )
}

/* ============================ 模块容器 ============================ */
export function ZzAgencyModule({ pageKey }: { pageKey: string }) {
  // 抽屉共享状态提升到模块层，任意子页机构名/案件号均可唤起
  const nav = useNavigate()
  const [agency, setAgency] = useState<string | null>(null)
  const [caseId, setCaseId] = useState<{ id: string; tab?: 'info' | 'callback' } | null>(null)
  const [jump, setJump] = useState(pageKey)
  // 左侧菜单切换 pageKey 时同步内部跳转状态，避免每次需强制刷新才切换
  useEffect(() => { setJump(pageKey) }, [pageKey])
  // 委外案件监控 / 催收回传：点击案件直接进入案件详情页
  const openCase = (id: string) => nav('/console/zz/case-detail?id=' + id)
  // 「查看回传」→ 进入催退回传记录页，并筛选出该案件的委外机构回传记录
  const viewCallback = (caseId: string) => nav('/console/zz/agency-callback?case=' + caseId)

  const render = () => {
    switch (jump) {
      case 'zz:agency-list':
      case 'zz:agency-account': return <AgencyManage onAgency={(id) => setAgency(id)} onCase={(id) => setCaseId({ id })} />
      case 'zz:agency-monitor': return <MonitorPage onAgency={(id) => setAgency(id)} onCase={(id) => openCase(id)} onViewCallback={viewCallback} />
      case 'zz:agency-callback': return <CallbackPage onAgency={(id) => setAgency(id)} onCase={(id) => openCase(id)} />
      case 'zz:agency-kpi':
      case 'zz:agency-settle': return <PerfSettle onAgency={(id) => setAgency(id)} onCase={(id) => setCaseId({ id })} />
      default: return <AgencyManage onAgency={(id) => setAgency(id)} onCase={(id) => setCaseId({ id })} />
    }
  }

  return (
    <div>
      {render()}
      {agency && <AgencyDrawer id={agency} onClose={() => setAgency(null)} onCase={(id) => setCaseId({ id })} onRecallTip={(cid) => { setAgency(null); setCaseId({ id: cid }) }} />}
      {caseId && <CaseDrawer id={caseId.id} defaultTab={caseId.tab} onClose={() => setCaseId(null)} onAgency={(id) => { setCaseId(null); setAgency(id) }} />}
    </div>
  )
}

/* ============================ 1 委外机构管理 ============================ */
function AgencyManage({ onAgency, onCase }: { onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  const [tab, setTab] = useState('机构档案')
  const TABS = ['机构档案', '机构人员管理', '机构账号权限']
  return (
    <ZzPage title="委外机构管理" crumb="催贷管理 / 委外监管" subtitle="委外机构档案、资质、人员与账号权限与启用/暂停监管（机构名可点开详情抽屉）">
      <ZzTabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-3">
        {tab === '机构档案' ? <AgencyList onAgency={onAgency} />
          : tab === '机构人员管理' ? <AgencyStaffTab onAgency={onAgency} onCase={onCase} />
          : <AgencyAccountTab onAgency={onAgency} onCase={onCase} />}
      </div>
    </ZzPage>
  )
}

/* 机构人员管理：按机构展示外催人员（岗位 / 在委案件 / 当月回款 / 状态） */
function AgencyStaffTab({ onAgency, onCase }: { onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  const [agency, setAgency] = useState('')
  const list = ZZ_AGENCY_STAFF.filter((s) => !agency || s.agency === agency)
  return (
    <>
      <ZzCard title="机构人员管理" extra={
        <ZzSelect value={agency} onChange={(e) => setAgency(e.target.value)}><option value="">全部机构</option>{ZZ_AGENCIES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</ZzSelect>
      }>
        <ZzTable stickyAction head={['机构', '人员', '岗位', '在委案件', '当月回款', '状态', '操作']} rows={list.map((s) => [
          <AgencyName id={s.agency} onOpen={onAgency} />, <span className="font-mono">{s.name}</span>, s.role,
          <span className="font-medium">{s.cases}</span>,
          <span className="text-right tabular-nums">{money(s.recovery)}</span>,
          s.status === '在岗' ? <ZzBadge color="#16A34A">在岗</ZzBadge> : <ZzBadge color="#9CA3AF">休假</ZzBadge>,
          <div className="flex gap-1"><ZzBtn sm onClick={() => onAgency(s.agency)}>所属机构</ZzBtn><ZzBtn sm onClick={() => alert('查看 ' + s.name + ' 的催收轨迹（样例）')}>轨迹</ZzBtn></div>,
        ])} />
      </ZzCard>
    </>
  )
}

function AgencyList({ onAgency }: { onAgency: (id: string) => void }) {
  const [rows, setRows] = useState(ZZ_AGENCIES)
  const [edit, setEdit] = useState<ZzAgency | null>(null)
  const [add, setAdd] = useState(false)
  return (
    <ZzCard title="机构列表" extra={<ZzBtn sm primary onClick={() => setAdd(true)}>新增机构</ZzBtn>}>
      <ZzTable stickyAction head={['机构名称', '联系人', '电话', '状态', '考核得分', '操作']} rows={rows.map((a) => [
        <button className="text-left font-medium text-[#1677ff] hover:underline" onClick={() => onAgency(a.id)}>{a.name}</button>,
        a.contact, a.phone,
        a.status === '正常' ? <ZzBadge color="#16A34A">正常</ZzBadge> : <ZzBadge color="#D97706">暂停</ZzBadge>,
        <span className="font-medium" style={{ color: a.score >= 90 ? '#16A34A' : a.score >= 80 ? BLUE : '#DC2626' }}>{a.score}</span>,
        <div className="flex flex-nowrap gap-1">
          <ZzBtn sm onClick={() => onAgency(a.id)}>机构详情</ZzBtn>
          <ZzBtn sm onClick={() => setEdit(a)}>编辑</ZzBtn>
          <ZzBtn sm onClick={() => alert('资质：' + a.license + '（' + a.licenseNo + '）')}>资质</ZzBtn>
          <ZzBtn sm onClick={() => setRows((r) => r.map((x) => x.id === a.id ? { ...x, status: x.status === '正常' ? '暂停' : '正常' } : x))}>{a.status === '正常' ? '暂停' : '启用'}</ZzBtn>
        </div>,
      ])} />
      {edit && <ZzModal open title="编辑机构" onClose={() => setEdit(null)} width={520}
        footer={<><ZzBtn onClick={() => setEdit(null)}>取消</ZzBtn><ZzBtn primary onClick={() => setEdit(null)}>保存</ZzBtn></>}>
        <div className="grid gap-3">
          <ZzField label="机构名称"><ZzInput defaultValue={edit.name} /></ZzField>
          <ZzField label="联系人"><ZzInput defaultValue={edit.contact} /></ZzField>
          <ZzField label="电话"><ZzInput defaultValue={edit.phone} /></ZzField>
          <ZzField label="状态"><ZzSelect defaultValue={edit.status}><option>正常</option><option>暂停</option></ZzSelect></ZzField>
        </div>
      </ZzModal>}
      {add && <ZzModal open title="新增机构" onClose={() => setAdd(false)} width={520}
        footer={<><ZzBtn onClick={() => setAdd(false)}>取消</ZzBtn><ZzBtn primary onClick={() => setAdd(false)}>保存</ZzBtn></>}>
        <div className="grid gap-3">
          <ZzField label="机构名称"><ZzInput placeholder="请输入机构名称" /></ZzField>
          <ZzField label="联系人"><ZzInput placeholder="联系人" /></ZzField>
          <ZzField label="电话"><ZzInput placeholder="联系电话" /></ZzField>
        </div>
      </ZzModal>}
    </ZzCard>
  )
}

function AgencyAccountTab({ onAgency, onCase }: { onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  const [rows, setRows] = useState(ZZ_AGENCY_ACCOUNTS)
  const [add, setAdd] = useState(false)
  const [accAgency, setAccAgency] = useState('AG-01')
  const [accName, setAccName] = useState('')
  const [accRole, setAccRole] = useState('催员')
  return (
    <>
      <ZzCard title="数据权限隔离说明"><div className="rounded bg-amber-50 p-3 text-sm text-amber-700">委外机构仅能查看分配给自己机构的案件；菜单权限按角色下发。总览/详情已标注数据隔离范围。</div></ZzCard>
      <ZzCard title="子账号列表" extra={<ZzBtn sm primary onClick={() => setAdd(true)}>新增账号</ZzBtn>}>
        <ZzTable stickyAction head={['机构', '子账号', '角色', '数据权限', '菜单权限', '状态', '操作']} rows={rows.map((a) => [
          <AgencyName id={a.agency} onOpen={onAgency} />,
          <span className="font-mono">{a.account}</span>, a.role,
          <ZzBadge color="#D97706">{a.dataScope}</ZzBadge>, a.menu,
          a.status === '启用' ? <ZzBadge color="#16A34A">启用</ZzBadge> : <ZzBadge color="#DC2626">禁用</ZzBadge>,
          <div className="flex gap-1">
            <ZzBtn sm onClick={() => setRows((r) => r.map((x) => x.account === a.account ? { ...x, status: x.status === '启用' ? '禁用' : '启用' } : x))}>{a.status === '启用' ? '禁用' : '启用'}</ZzBtn>
          </div>,
        ])} />
      </ZzCard>
      {add && <ZzModal open title="新增子账号" onClose={() => setAdd(false)} width={520}
        footer={<><ZzBtn onClick={() => setAdd(false)}>取消</ZzBtn><ZzBtn primary onClick={() => { if (!accName) { alert('请填写子账号'); return } setRows((r) => [...r, { agency: accAgency, account: accName, role: accRole, dataScope: '仅 ' + accAgency + ' 案件', menu: '案件查看/催记录入', status: '启用' }]); setAdd(false) }}>保存</ZzBtn></>}>
        <div className="grid gap-3">
          <ZzField label="所属机构"><ZzSelect value={accAgency} onChange={(e) => setAccAgency(e.target.value)}>{ZZ_AGENCIES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</ZzSelect></ZzField>
          <ZzField label="子账号"><ZzInput value={accName} onChange={(e) => setAccName(e.target.value)} placeholder="如 huaxin_op1" /></ZzField>
          <ZzField label="角色"><ZzSelect value={accRole} onChange={(e) => setAccRole(e.target.value)}><option>催员</option><option>督导</option></ZzSelect></ZzField>
        </div>
      </ZzModal>}
    </>
  )
}

/* ============================ 2 委外案件监控 ============================ */
function MonitorPage({ onAgency, onCase }: { onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  return (
    <ZzPage title="委外案件监控" crumb="催贷管理 / 委外监管" subtitle="委托案件进度实时监控（机构名/案件号可点开详情抽屉）">
      <MonitorTab onAgency={onAgency} onCase={onCase} />
    </ZzPage>
  )
}

function MonitorTab({ onAgency, onCase }: { onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  const nav = useNavigate()
  const [status, setStatus] = useState('')
  // 委外监控 = 样例在委案件 + 案件管理页新发起的委托（读共享数据层，实时同步）
  const entrusts = useZzList<any>(ZZ_FILE.entrusts, ZZ_ENTRUSTS)
  const monitorRows = (() => {
    const base: any[] = ZZ_AGENCY_MONITOR.map((m) => ({ ...m }))
    entrusts.forEach((e) => {
      const i = base.findIndex((m) => m.id === e.id)
      if (i >= 0) {
        base[i] = { ...base[i], agency: e.to, entrustTime: e.entrustTime, due: e.due, status: e.status === '已召回' ? '已召回' : base[i].status }
      } else if (e.status === '委外中') {
        base.unshift({ id: e.id, name: e.name, agency: e.to, entrustTime: e.entrustTime, due: e.due, status: '催收中', feedback: '已委托，等待机构首次回传' })
      }
    })
    return base
  })()
  const recall = (id: string) => {
    updateZzList<any>(ZZ_FILE.entrusts, (es) => es.map((x) => (x.id === id ? { ...x, status: '已召回' } : x)))
    updateZzList<any>(ZZ_FILE.cases, (rs) => rs.map((r) => (r.id === id ? { ...r, status: '催收中', outsource: false } : r)))
    alert('已召回 ' + id + '，案件已转回内部催收队列')
  }
  const list = monitorRows.filter((m) => !status || m.status === status)
  const total = monitorRows.length
  const inProgress = monitorRows.filter((m) => m.status === '催收中').length
  const recalled = monitorRows.filter((m) => m.status === '已召回').length
  const validCb = ZZ_AGENCY_CALLBACKS.filter((c) => c.result === '有效').length
  return (
    <>
      {/* 顶部 4 指标概览卡 */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        <ZzStat label="委外案件总数" value={total} tip="当前委托外部机构处置的全部案件数" />
        <ZzStat label="催收中" value={inProgress} accent={BLUE} tip="机构正在催收中的案件" />
        <ZzStat label="已召回" value={recalled} accent="#9CA3AF" tip="已从机构召回的案件" />
        <ZzStat label="有效回传" value={validCb} accent="#16A34A" tip="判定为有效的机构回传条数" />
      </div>
      <ZzCard title={`监控列表（${list.length}）`} extra={
        <ZzField label="案件状态"><ZzSelect value={status} onChange={(e) => setStatus(e.target.value)}><option value="">全部</option><option>催收中</option><option>协商中</option><option>已召回</option></ZzSelect></ZzField>
      }>
        <ZzTable stickyAction head={['案件', '客户', '委外机构', '委托时间', '委托到期', '状态', '最新回传摘要', '操作']} rows={list.map((m) => [
          <CaseId id={m.id} onOpen={onCase} />, m.name, <AgencyName id={m.agency} onOpen={onAgency} />, m.entrustTime, m.due,
          <ZzBadge color={ (m.status === '已召回' ? '#9CA3AF' : BLUE)}>{m.status}</ZzBadge>,
          <span className="block max-w-[200px] truncate" title={m.feedback}>{m.feedback}</span>,
          <div className="flex flex-nowrap gap-1"><ZzBtn sm primary onClick={() => nav('/console/zz/agency-callback?case=' + m.id)}>查看回传</ZzBtn><ZzBtn sm onClick={() => recall(m.id)}>召回</ZzBtn></div>,
        ])} />
      </ZzCard>
    </>
  )
}

/* ============================ 3 催收回传记录（独立页面） ============================ */
function CallbackPage({ onAgency, onCase }: { onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  const loc = useLocation()
  const caseFilter = new URLSearchParams(loc.search).get('case') || ''
  const [agency, setAgency] = useState('')
  const [result, setResult] = useState('')
  const [detail, setDetail] = useState<any>(null)
  const list = ZZ_AGENCY_CALLBACKS.filter((c) =>
    (!agency || c.agency === agency) &&
    (!result || c.result === result) &&
    (!caseFilter || c.caseId === caseFilter)
  )
  const nav = useNavigate()
  const caseRec = caseFilter ? ZZ_AGENCY_MONITOR.find((m) => m.id === caseFilter) : null
  return (
    <ZzPage title="委外回传记录" crumb="催贷管理 / 委外监管" subtitle="委外机构催收回传流水记录，支持按机构 / 结果筛选（机构名/案件号可点开详情抽屉）">
      <ZzCard title={`催收回传流水（${list.length}）`} extra={
        <div className="flex gap-2">
          <ZzSelect value={agency} onChange={(e) => setAgency(e.target.value)}><option value="">全部机构</option>{ZZ_AGENCIES.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</ZzSelect>
          <ZzSelect value={result} onChange={(e) => setResult(e.target.value)}><option value="">全部结果</option><option>有效</option><option>无效</option></ZzSelect>
        </div>
      }>
        {caseFilter && (
          <div className="mb-3 flex items-center justify-between rounded bg-blue-50 px-3 py-2 text-sm text-blue-700">
            <span>已按案件 <b className="font-mono">{caseFilter}</b> 过滤回传记录（{list.length} 条）{caseRec ? ` · 客户 ${caseRec.name}` : ''}</span>
            <ZzBtn sm onClick={() => (window.history.length > 1 ? window.history.back() : nav('/console/zz/agency-monitor'))}>返回监控</ZzBtn>
          </div>
        )}
        <ZzTable stickyAction head={['时间', '案件', '委外机构', '委外作业反馈', '结果', '操作']} rows={list.map((c) => [
          c.time, <CaseId id={c.caseId} onOpen={onCase} />, <AgencyName id={c.agency} onOpen={onAgency} />, c.feedback,
          <ZzBadge color={c.result === '有效' ? '#16A34A' : '#DC2626'}>{c.result}</ZzBadge>,
          <ZzBtn sm onClick={() => setDetail(c)}>详情</ZzBtn>,
        ])} />
      </ZzCard>
      {detail && <CallbackDetail rec={detail} onClose={() => setDetail(null)} onAgency={onAgency} onCase={onCase} />}
    </ZzPage>
  )
}

/* 回传记录详情抽屉：委外作业反馈结构化展示 + 历史轮回传切换 */
function CallbackDetail({ rec, onClose, onAgency, onCase }: { rec: any; onClose: () => void; onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  const sameCase = ZZ_AGENCY_CALLBACKS.filter((c) => c.caseId === rec.caseId)
  const [view, setView] = useState<any>(rec)
  // 切换历史回合
  const switchRec = (c: any) => setView(c)

  return (
    <ZzDrawer open title="回传记录详情" onClose={onClose} width={620}>
      {/* ① 基础信息区 */}
      <div className="grid gap-3 rounded bg-slate-50 p-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <Field label="案件号（点击跳转详情）" value={<span className="cursor-pointer text-[#1677ff] underline" onClick={() => onCase(view.caseId, 'info')}>{view.caseId}</span>} />
          <Field label="客户" value={view.client} />
          <Field label="委外机构" value={<AgencyName id={view.agency} onOpen={onAgency} />} />
          <Field label="回传时间" value={view.time} />
          <Field label="回传判定结果" value={<ZzBadge color={view.result === '有效' ? '#16A34A' : '#DC2626'}>{view.result}</ZzBadge>} />
        </div>
        <div className="grid grid-cols-2 gap-3 border-t border-slate-200 pt-2">
          <Field label="平台审核人" value={view.auditBy || '-'} />
          <Field label="审核时间" value={view.auditTime || '-'} />
        </div>
        {view.auditRemark && (
          <div className="border-t border-slate-200 pt-2">
            <div className="text-xs text-gray-400">审核备注（判定依据）</div>
            <div className="mt-0.5 leading-relaxed">{view.auditRemark}</div>
          </div>
        )}
      </div>

      {/* ② 委外结构化作业反馈 */}
      <div className="mt-4">
        <div className="mb-2 text-sm font-semibold">委外作业反馈</div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <Field label="客户联系状态" value={view.contactStatus || '-'} />
          <Field label="作业类型" value={view.workType || '-'} />
          <Field label="是否产生 PTP" value={view.ptp || '-'} />
          {view.ptp === '是' && (
            <Field label="承诺还款" value={`${view.ptpTime || '-'} · ${view.ptpAmount || ''}`} />
          )}
          <Field label="客户态度" value={view.attitude || '-'} />
          <Field label="风险标记" value={<span className="text-[#D97706]">{view.riskTag || '-'}</span>} />
        </div>
        <div className="mt-3">
          <div className="mb-1 text-xs font-medium text-gray-500">委外补充备注</div>
          <div className="rounded border p-3 text-sm leading-relaxed">{view.feedback}</div>
        </div>
      </div>

      {/* ③ 回传附件区域 */}
      {view.attachments && view.attachments.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold">回传附件</div>
          <div className="flex flex-wrap gap-2">
            {view.attachments.map((a: any, i: number) => (
              <div key={i} className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
                <span className="text-base">{a.type === '录音' ? '🎙️' : a.type === '照片' ? '🖼️' : '📄'}</span>
                <span>{a.name}</span>
                <span className="cursor-pointer text-[#1677ff] underline">预览</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ④ 本轮回传衍生业务记录 */}
      {view.updatedFields && view.updatedFields.length > 0 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold">本轮回传衍生业务记录</div>
          <div className="rounded border p-3 text-sm">
            <div className="mb-2 text-xs text-gray-500">该条回传已同步更新案件以下字段：</div>
            <ul className="space-y-1">
              {view.updatedFields.map((f: string, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-[#1677ff]">●</span>
                  <span>{f}</span>
                  {f.includes('PTP') && (
                    <span className="cursor-pointer text-[#1677ff] underline" onClick={() => onCase(view.caseId, 'info')}>查看 PTP 记录快照</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* ⑤ 历史回传记录小列表 */}
      {sameCase.length > 1 && (
        <div className="mt-4">
          <div className="mb-2 text-sm font-semibold">历史回传记录（同一案件 {sameCase.length} 轮回传）</div>
          <div className="space-y-2">
            {sameCase.map((c: any, i: number) => (
              <div key={i} className={`cursor-pointer rounded border p-2 text-sm ${c === view ? 'border-[#1677ff] bg-blue-50' : ''}`} onClick={() => switchRec(c)}>
                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                  <span>{c.time} · <AgencyName id={c.agency} onOpen={onAgency} /></span>
                  <ZzBadge color={c.result === '有效' ? '#16A34A' : '#DC2626'}>{c.result}</ZzBadge>
                </div>
                <div className="leading-relaxed truncate">{c.feedback}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </ZzDrawer>
  )
}

const Field = ({ label, value }: { label: string; value: ReactNode }) => (
  <div><div className="text-xs text-gray-400">{label}</div><div className="mt-0.5">{value}</div></div>
)

/* ============================ 4 绩效与结算 ============================ */
function PerfSettle({ onAgency, onCase }: { onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  const [tab, setTab] = useState('机构KPI考核')
  const TABS = ['机构KPI考核', '佣金对账结算']
  return (
    <ZzPage title="绩效与结算" crumb="催贷管理 / 委外监管" subtitle="委外机构 KPI 考核与佣金对账结算（机构名可点开详情抽屉）">
      <ZzTabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="mt-3">{tab === '机构KPI考核' ? <KpiTab onAgency={onAgency} onCase={onCase} /> : <SettleTab onAgency={onAgency} onCase={onCase} />}</div>
    </ZzPage>
  )
}

function KpiTab({ onAgency }: { onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  // KPI 权重走共享配置：改动后得分即时重算（此前权重写死、得分是样例值）
  const policyRows = useZzList<any>(ZZ_FILE.policy, [])
  const policy = policyRows[0] ?? {}
  const wRecovery = Number(policy.kpiWeightRecovery ?? 40)
  const wHandled = Number(policy.kpiWeightHandled ?? 20)
  const setWeight = (patch: any) => updateZzList<any>(ZZ_FILE.policy, (rows) => [{ ...(rows[0] ?? {}), ...patch }])
  // 得分 = 回款率与处理量按权重加权（归一化到 100）− 投诉/违规扣减
  const calcScore = (k: any) => {
    const sum = wRecovery + wHandled || 1
    const handledScore = Math.min(100, (k.handled ?? 0) * 2)
    const base = ((k.recoveryRate ?? 0) * 100 * wRecovery + handledScore * wHandled) / sum
    return Math.max(0, Math.round(base - (k.complaints ?? 0) * 2 - (k.violations ?? 0) * 5))
  }
  const startReview = (k: any) => {
    const score = calcScore(k)
    updateZzList<any>(ZZ_FILE.logs, (l) => [{
      time: new Date().toLocaleString('zh-CN'), operator: '运营-当前',
      content: `发起督导复盘：机构 ${k.agency} 得分 ${score}（低于 80），需提交整改与复盘记录`,
    }, ...l])
    alert(`已对机构 ${k.agency}（得分 ${score}）发起督导复盘，已记入操作日志`)
  }
  return (
    <>
      <ZzCard title="KPI报表">
        <div className="mb-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="rounded bg-slate-100 px-2 py-1">满分 100，按权重加权后扣减投诉/违规；得分低于 80 可发起督导复盘。</span>
          <span className="flex items-center gap-1">回款率权重
            <ZzInput className="w-14" type="number" value={wRecovery} onChange={(e) => setWeight({ kpiWeightRecovery: Number(e.target.value) })} />%
          </span>
          <span className="flex items-center gap-1">处理量权重
            <ZzInput className="w-14" type="number" value={wHandled} onChange={(e) => setWeight({ kpiWeightHandled: Number(e.target.value) })} />%
          </span>
        </div>
        <ZzTable head={['机构', '回款率', '处理量', '投诉量', '违规次数', '得分', '操作']} rows={ZZ_AGENCY_KPI.map((k) => {
          const score = calcScore(k)
          return [
            <AgencyName id={k.agency} onOpen={onAgency} />, pct(k.recoveryRate), k.handled, k.complaints,
            <ZzBadge color={k.violations > 2 ? '#DC2626' : '#16A34A'}>{k.violations}</ZzBadge>,
            <span className="font-medium" style={{ color: score >= 90 ? '#16A34A' : score >= 80 ? BLUE : '#DC2626' }}>{score}</span>,
            score < 80 ? <ZzBtn sm danger onClick={() => startReview(k)}>发起督导复盘</ZzBtn> : <span className="text-gray-400">-</span>,
          ]
        })} />
      </ZzCard>
    </>
  )
}

function SettleTab({ onAgency }: { onAgency: (id: string) => void; onCase: (id: string, tab?: string) => void }) {
  const [rate, setRate] = useState('8')
  // 结算账单走共享数据层：确认结算与费率调整即时生效，刷新不丢
  const settles = useZzList<any>(ZZ_FILE.settle, ZZ_AGENCY_SETTLE)
  const setSettles = (v: any[] | ((rs: any[]) => any[])) => updateZzList<any>(ZZ_FILE.settle, (rs) => (typeof v === 'function' ? v(rs) : v))
  const applyRate = () => {
    const r = Number(rate)
    if (!r || r <= 0 || r > 100) { alert('请输入 1-100 之间的费率'); return }
    // 费率改动真正应用到所有「待确认」账单并重算佣金（此前只弹提示，费率恒为样例值）
    setSettles((rs) => rs.map((s) => (s.status === '已结算'
      ? s
      : { ...s, rate: r / 100, commission: Math.round((s.recovery ?? 0) * r / 100) })))
    alert(`佣金费率已更新为 ${r}%，并已应用到 ${settles.filter((s) => s.status !== '已结算').length} 笔待确认账单`)
  }
  const confirmSettle = (s: any) => {
    if (s.status === '已结算') { alert('该账单已于 ' + (s.settledAt ?? '-') + ' 结算完成'); return }
    setSettles((rs) => rs.map((x) => (x.id === s.id ? { ...x, status: '已结算', settledAt: new Date().toISOString().slice(0, 10) } : x)))
    alert(`账单 ${s.id} 已确认结算，佣金 ${money(s.commission)}`)
  }
  return (
    <>
      <ZzCard title="佣金规则">
        <div className="flex flex-wrap items-center gap-3 text-sm">按回款金额比例结算，当前费率
          <ZzInput className="w-16" value={rate} onChange={(e) => setRate(e.target.value)} />%
          <ZzBtn sm onClick={applyRate}>应用费率</ZzBtn>
        </div>
        <div className="mt-2 text-xs text-gray-500">应用后所有「待确认」账单按新费率重算佣金，已结算账单不受影响。</div>
      </ZzCard>
      <ZzCard title="对账账单">
        <ZzTable stickyAction head={['机构', '回款金额', '费率', '佣金', '状态', '操作']} rows={settles.map((s) => [
          <AgencyName id={s.agency} onOpen={onAgency} />, money(s.recovery), pct(s.rate, 0), money(s.commission),
          s.status === '已结算' ? <ZzBadge color="#16A34A">已结算</ZzBadge> : <ZzBadge color="#D97706">待确认</ZzBadge>,
          <ZzBtn sm primary={s.status !== '已结算'} onClick={() => confirmSettle(s)}>{s.status === '已结算' ? '查看' : '确认结算'}</ZzBtn>,
        ])} />
      </ZzCard>
    </>
  )
}

/* ============================ 机构详情抽屉 ============================ */
function AgencyDrawer({ id, onClose, onCase, onRecallTip }: { id: string; onClose: () => void; onCase: (id: string, tab?: string) => void; onRecallTip: (cid: string) => void }) {
  const a = ZZ_AGENCIES.find((x) => x.id === id)!
  const cases = zzAgencyCases(id)
  const accounts = zzAgencyAccounts(id)
  const kpi = zzAgencyKpi(id)
  const settle = zzAgencySettle(id)
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-[820px] max-w-[95vw] flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <div className="text-base font-bold">{a.name}</div>
            <div className="mt-0.5 text-xs text-gray-500">{a.id} · {a.region} · {a.status === '正常' ? '正常' : '已暂停'}</div>
          </div>
          <button className="rounded p-1 text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={onClose}>✕</button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <ZzCard title="基础信息">
            <div className="grid grid-cols-3 gap-2">
              <F label="资质" v={a.qualified} />
              <F label="备案" v={a.license} />
              <F label="备案号" v={a.licenseNo} />
              <F label="联系人" v={a.contact} />
              <F label="电话" v={a.phone} />
              <F label="业务范围" v={a.scope} />
            </div>
          </ZzCard>

          <ZzCard title="KPI 指标卡片">
            {kpi ? <div className="grid grid-cols-4 gap-2">
              <ZzStat label="回款率" value={pct(kpi.recoveryRate)} color={BLUE} />
              <ZzStat label="处理量" value={String(kpi.handled)} color="#7C3AED" />
              <ZzStat label="投诉量" value={String(kpi.complaints)} color="#EA580C" />
              <ZzStat label="考核得分" value={String(kpi.score)} color={kpi.score >= 90 ? '#16A34A' : '#DC2626'} />
            </div> : <div className="text-sm text-gray-400">暂无 KPI 数据</div>}
          </ZzCard>

          <ZzCard title={`当前委外案件（${cases.length}）`}>
            {cases.length ? <ZzTable stickyAction head={['案件', '客户', '委托时间', '到期', '状态', '操作']} rows={cases.map((m) => [
              <CaseId id={m.id} onOpen={onCase} />, m.name, m.entrustTime, m.due,
              <ZzBadge color={m.status === '已召回' ? '#9CA3AF' : BLUE}>{m.status}</ZzBadge>,
              m.status !== '已召回' && <ZzBtn sm onClick={() => { if (confirm('确认召回 ' + m.id + '？召回后将转回内部处理')) onRecallTip(m.id) }}>召回</ZzBtn>,
            ])} /> : <div className="text-sm text-gray-400">当前无在委案件</div>}
          </ZzCard>

          <ZzCard title={`关联子账号（${accounts.length}）`}>
            <ZzTable head={['子账号', '角色', '数据权限', '菜单权限', '状态']} rows={accounts.map((x) => [
              <span className="font-mono">{x.account}</span>, x.role, <ZzBadge color="#D97706">{x.dataScope}</ZzBadge>, x.menu,
              x.status === '启用' ? <ZzBadge color="#16A34A">启用</ZzBadge> : <ZzBadge color="#DC2626">禁用</ZzBadge>,
            ])} />
          </ZzCard>

          <ZzCard title="佣金账单">
            {settle ? <div className="flex items-center justify-between text-sm">
              <span>回款 {money(settle.recovery)} · 费率 {pct(settle.rate, 0)} · 佣金 <span className="font-semibold text-[#1677ff]">{money(settle.commission)}</span></span>
              <ZzBadge color={settle.status === '已结算' ? '#16A34A' : '#D97706'}>{settle.status}</ZzBadge>
            </div> : <div className="text-sm text-gray-400">暂无佣金账单</div>}
          </ZzCard>
        </div>
      </div>
    </div>
  )
}

/* ============================ 案件委外详情抽屉 ============================ */
function CaseDrawer({ id, onClose, onAgency, defaultTab = 'info' }: { id: string; onClose: () => void; onAgency: (id: string) => void; defaultTab?: 'info' | 'callback' }) {
  const m = ZZ_AGENCY_MONITOR.find((x) => x.id === id)
  const ent = ZZ_ENTRUSTS.find((x) => x.id === id)
  const callbacks = ZZ_AGENCY_CALLBACKS.filter((c) => c.caseId === id)
  // 委外状态：在委监控中且未召回，或委托列表中处于委外中
  const outsourced = (m && m.status !== '已召回') || ent?.status === '委外中'
  const [tab, setTab] = useState(defaultTab as string)
  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative flex h-full w-[760px] max-w-[95vw] flex-col bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-3">
          <div>
            <div className="text-base font-bold">{id}</div>
            <div className="mt-0.5 text-xs text-gray-500">{m?.name ?? ent?.name ?? ''} · {(m?.status ?? ent?.status ?? '')}</div>
          </div>
          <button className="rounded p-1 text-xl leading-none text-gray-400 hover:bg-gray-100 hover:text-gray-600" onClick={onClose}>✕</button>
        </div>
        <ZzTabs tabs={['案件信息', '催退回传记录']} active={tab === 'callback' ? '催退回传记录' : '案件信息'} onChange={(t) => setTab(t === '催退回传记录' ? 'callback' : 'info')} />
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {tab === 'info' ? (
            <>
          <ZzCard title="案件基础金额">
            <div className="grid grid-cols-2 gap-2">
              <F label="委外客户" v={m?.name ?? ent?.name ?? '-'} />
              <F label="逾期总额" v={<span className="text-red-600 font-medium">{money(ent?.total ?? 0)}</span>} />
              <F label="委托机构" v={<button className="font-medium text-[#1677ff] hover:underline" onClick={() => { const ag = m?.agency ?? ent?.to; if (ag) onAgency(ag) }}>{zzAgencyName(m?.agency ?? ent?.to ?? '')}</button>} />
              <F label="委托到期" v={m?.due ?? ent?.due ?? '-'} />
            </div>
          </ZzCard>

          <ZzCard title="委托信息">
            <div className="grid grid-cols-2 gap-2">
              <F label="委托时间" v={m?.entrustTime ?? ent?.entrustTime ?? '-'} />
              <F label="委托状态" v={m?.status ?? ent?.status ?? '-'} />
            </div>
          </ZzCard>

          <div className="flex justify-end">
            <ZzBtn danger onClick={() => { if (confirm('确认召回 ' + id + '？召回后将转回内部处理')) { alert('已召回 ' + id); onClose() } }}>召回案件</ZzBtn>
          </div>
          </>

          ) : (

            outsourced ? (
            <ZzCard title={`委外回传记录（${callbacks.length}）`}>
              {callbacks.length ? <ZzTable head={['时间', '机构', '委外作业反馈', '结果']} rows={callbacks.map((c) => [
                c.time, <AgencyName id={c.agency} onOpen={onAgency} />, c.feedback,
                <ZzBadge color={c.result === '有效' ? '#16A34A' : '#DC2626'}>{c.result}</ZzBadge>,
              ])} /> : <div className="text-sm text-gray-400">暂无回传记录</div>}
            </ZzCard>
          ) : (
            <ZzCard title="委外回传记录">
              <div className="text-sm text-gray-400">当前案件非委外状态，暂无委外机构催收回传记录。</div>
            </ZzCard>
          ))}
        </div>
      </div>
    </div>
  )
}

/* 小字段 */
function F({ label, v }: { label: string; v: React.ReactNode }) {
  return <div className="rounded border border-slate-100 bg-slate-50 px-3 py-2"><div className="text-xs text-gray-400">{label}</div><div className="mt-0.5 text-sm font-medium text-gray-800">{v}</div></div>
}
