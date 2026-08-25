// 催贷管理 · 模块8 法务处置（单页聚合 + 一体化详情）
import { useState } from 'react'
import { ZzPage, ZzCard, ZzBtn, ZzModal, ZzTable, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea, ZzBadge, ZzTabs, BLUE } from './zzUi'
import { ZZ_LEGAL_CASES, ZZ_LEGAL_STAGES, money } from './zzData'

const GREEN = '#16A34A'; const RED = '#DC2626'; const AMBER = '#D97706'; const GRAY = '#9CA3AF'
const STAGE_COLOR: any = { '待诉讼评估': GRAY, '证据待整理': BLUE, '已立案': AMBER, '调解中': '#9333EA', '执行中': '#0EA5E9', '已归档': GREEN }

// 阶段顺序用于依赖校验
const ORDER = ['待诉讼评估', '证据待整理', '已立案', '调解中', '执行中', '已归档']
function stageIdx(s: string) { return ORDER.indexOf(s) }

export function ZzLegalModule({ pageKey }: { pageKey: string }) {
  return <ZzLegalOverview />
}

/* ============================ 主页面：法务案件总览 ============================ */
function ZzLegalOverview() {
  const [cases, setCases] = useState<any[]>(ZZ_LEGAL_CASES)
  const [tab, setTab] = useState('全部案件')
  const [detail, setDetail] = useState<any | null>(null)
  const [start, setStart] = useState<any | null>(null)
  const tabs = ['全部案件', ...ZZ_LEGAL_STAGES]
  const visible = tab === '全部案件' ? cases : cases.filter((c) => c.stage === tab)
  const startFlow = (c: any) => { setCases((cs) => cs.map((x) => x.id === c.id ? { ...x, stage: '证据待整理', logs: [...x.logs, { at: '2026-08-25 09:00', op: '启动法务流程', by: '张法务' }] } : x)); setStart(null) }

  return (
    <ZzPage title="法务案件总览" crumb="催贷管理 / 法务处置" subtitle="单页聚合：评估→证据→立案→调解→执行→归档，全部在详情页闭环">
      <ZzFilterBar>
        <ZzField label="案件编号"><ZzInput placeholder="LS- / CO-" /></ZzField>
        <ZzField label="客户姓名"><ZzInput placeholder="姓名关键词" /></ZzField>
        <ZzField label="身份证"><ZzInput placeholder="身份证片段" /></ZzField>
        <ZzField label="涉案本金≥"><ZzInput type="number" placeholder="如 50000" /></ZzField>
        <ZzField label="承办法务"><ZzSelect defaultValue=""><option value="">全部</option><option>张法务</option><option>李法务</option><option>王法务</option></ZzSelect></ZzField>
        <ZzField label="受理时间"><ZzSelect defaultValue="近90天"><option>今日</option><option>近30天</option><option>近90天</option><option>全部</option></ZzSelect></ZzField>
        <ZzBtn primary>查询</ZzBtn>
      </ZzFilterBar>
      <ZzTabs tabs={tabs} active={tab} onChange={setTab} />
      <ZzCard title={`${tab}（${visible.length}）`}>
        <ZzTable head={['案件ID', '关联催收案件', '客户', '涉案本金', '诉讼阶段', '承办人', '立案时间', '当前状态', '操作']} rows={visible.map((c) => [
          c.id, c.caseId, c.name, money(c.principal), <ZzBadge color={STAGE_COLOR[c.stage]}>{c.stage}</ZzBadge>, c.handler, c.filing?.time || '-',
          <ZzBadge color={c.archived ? GRAY : STAGE_COLOR[c.stage]}>{c.archived ? '已归档' : c.stage}</ZzBadge>,
          <div className="flex gap-1">
            <ZzBtn sm onClick={() => setDetail(c)}>查看详情</ZzBtn>
            {c.stage === '待诉讼评估' && <ZzBtn sm primary onClick={() => setStart(c)}>启动法务流程</ZzBtn>}
          </div>,
        ])} />
      </ZzCard>
      {detail && <ZzLegalDetail c={detail} cases={cases} setCases={setCases} onClose={() => setDetail(null)} onArchived={() => setDetail(null)} />}
      {start && <ZzModal open title={`启动法务流程 · ${start.id}`} onClose={() => setStart(null)} footer={<><ZzBtn onClick={() => setStart(null)}>取消</ZzBtn><ZzBtn primary onClick={() => startFlow(start)}>确认启动</ZzBtn></>}>
        <p className="text-sm text-gray-600">确认将案件 {start.id}（{start.name}）从「待诉讼评估」推进到「证据待整理」，开始准备诉讼证据材料。</p>
      </ZzModal>}
    </ZzPage>
  )
}

/* ============================ 一体化法务案件详情页 ============================ */
function ZzLegalDetail({ c, cases, setCases, onClose, onArchived }: { c: any; cases: any[]; setCases: (f: (p: any[]) => any[]) => void; onClose: () => void; onArchived: () => void }) {
  const update = (id: string, patch: any, log?: any) => setCases((cs) => cs.map((x) => x.id === id ? { ...x, ...patch, logs: log ? [...x.logs, log] : x.logs } : x))
  const locked = c.archived

  // 阶段依赖：当前阶段 idx
  const idx = stageIdx(c.stage)
  const canEvidence = idx >= 1        // 评估完成
  const canFiling = canEvidence && (c.evidence?.length ?? 0) > 0
  const canMediate = canFiling && !!c.filing
  const canExec = canMediate
  const canArchive = canExec && !!c.exec

  return (
    <ZzModal open title={`法务案件详情 · ${c.id}`} onClose={onClose} width={960}
      footer={<>
        <ZzBtn onClick={() => alert('已导出本案件全部案卷（证据+文书+记录）打包')}>导出全部案卷</ZzBtn>
        <ZzBtn onClick={() => alert('关键节点已回写上游贷后催收案件 ' + c.caseId)}>回写催收案件</ZzBtn>
        <ZzBtn primary onClick={onClose}>关闭</ZzBtn>
      </>}>
      <div className="max-h-[78vh] space-y-4 overflow-auto pr-1">
        {/* 头部：基础信息（固定顶部样式） */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2"><span className="text-lg font-semibold">{c.id}</span><span className="text-gray-500">关联催收 {c.caseId}</span></div>
            <ZzBadge color={c.archived ? GRAY : STAGE_COLOR[c.stage]}>{c.archived ? '已归档（锁定）' : c.stage}</ZzBadge>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
            {[['客户', c.name], ['身份证', c.idcard], ['电话', c.phone], ['地址', c.addr], ['涉案本金', money(c.principal)], ['利息', money(c.interest)], ['罚息', money(c.penalty)], ['诉讼标的', money(c.subject)], ['承办法务', c.handler], ['委托律师', c.lawyer], ['接收时间', c.receivedAt], ['状态', c.archived ? '已归档' : c.stage]].map(([k, v]) => (
              <div key={k}><span className="text-gray-400">{k}：</span><span className="font-medium">{v}</span></div>
            ))}
          </div>
        </div>

        {/* 模块1：待诉讼评估 */}
        <ZzCard title="① 待诉讼评估" extra={!locked && idx === 0 && <div className="flex gap-1"><ZzBtn sm primary disabled={false} onClick={() => { const litigable = confirm('是否具备起诉条件？确认=是'); update(c.id, { evaluate: { litigable: litigable ? '是' : '否', conclusion: litigable ? '证据充分' : '证据缺失', note: '', at: '2026-08-25 09:30', by: '张法务' }, stage: '证据待整理' }, { at: '2026-08-25 09:30', op: '完成诉讼评估，启动诉讼流程', by: '张法务' }) }}>确认启动诉讼流程</ZzBtn><ZzBtn sm danger onClick={() => { if (confirm('确认退回催收？')) update(c.id, { stage: '待诉讼评估', returned: true }, { at: '2026-08-25 09:30', op: '驳回退回催收，退出法务流程', by: '张法务' }) }}>驳回退回催收</ZzBtn></div>}>
          {c.evaluate ? (
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-400">是否可诉讼：</span>{c.evaluate.litigable}　<span className="text-gray-400">评估结论：</span><ZzBadge color={c.evaluate.conclusion === '证据充分' ? GREEN : RED}>{c.evaluate.conclusion}</ZzBadge></div>
              <div><span className="text-gray-400">评估备注：</span>{c.evaluate.note || '—'}</div>
            </div>
          ) : <div className="text-sm text-amber-600">请评估是否具备起诉条件；确认后将流转至「证据待整理」。</div>}
        </ZzCard>

        {/* 模块2：证据材料 */}
        <ZzCard title="② 证据材料" extra={!locked && <ZzBtn sm primary disabled={!canEvidence} onClick={() => alert('上传证据材料（支持 PDF/图片/录音批量上传）')}>上传证据材料</ZzBtn>}>
          {!canEvidence && <div className="mb-2 text-xs text-gray-400">需先完成诉讼评估才能整理证据。</div>}
          <ZzTable head={['证据类型', '文件名称', '上传时间', '上传人', '操作']} rows={(c.evidence ?? []).map((e: any) => [
            e.type, e.file, e.uploaded, e.by, <div className="flex gap-1"><ZzBtn sm>预览</ZzBtn><ZzBtn sm>下载</ZzBtn>{!locked && <ZzBtn sm danger onClick={() => update(c.id, { evidence: c.evidence.filter((x: any) => x !== e) })}>删除</ZzBtn>}</div>,
          ])} />
          {(c.evidence?.length ?? 0) === 0 && <div className="mt-2 text-sm text-amber-600">⚠️ 请上传完整证据材料（借款合同、放款流水、催收记录等），完成后才能登记立案。</div>}
          {(c.evidence?.length ?? 0) > 0 && <div className="mt-2 text-sm text-green-600">✅ 证据齐全</div>}
        </ZzCard>

        {/* 模块3：立案登记 */}
        <ZzCard title="③ 立案登记" extra={!locked && <ZzBtn sm primary disabled={!canFiling} onClick={() => { if (confirm('登记立案信息？')) update(c.id, { filing: { court: 'XX区法院', time: '2026-08-25', no: '(2026)XX民初' + c.id.slice(-3) + '号', fee: 1500, judge: '—', openTime: '', receipt: '受理通知书.pdf', at: '2026-08-25 10:00', by: '张法务' }, stage: '已立案' }, { at: '2026-08-25 10:00', op: '完成立案登记', by: '张法务' }) }}>登记立案信息</ZzBtn>}>
          {!canFiling && <div className="mb-2 text-xs text-gray-400">需完成证据整理后才能登记立案。</div>}
          {c.filing ? (
            <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
              {[['受理法院', c.filing.court], ['立案时间', c.filing.time], ['案号', c.filing.no], ['诉讼费', money(c.filing.fee)], ['承办法官', c.filing.judge], ['开庭时间', c.filing.openTime || '—'], ['受理回执', c.filing.receipt], ['登记人', c.filing.by]].map(([k, v]) => (
                <div key={k} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{k}</div><div className="mt-0.5 font-medium">{v}</div></div>
              ))}
            </div>
          ) : <div className="text-sm text-gray-400">尚未登记立案信息。</div>}
        </ZzCard>

        {/* 模块4：调解记录 */}
        <ZzCard title="④ 调解记录" extra={!locked && <ZzBtn sm primary disabled={!canMediate} onClick={() => { const type = confirm('诉前调解请确定；取消=诉中调解') ? '诉前调解' : '诉中调解'; update(c.id, { mediates: [...(c.mediates ?? []), { time: '2026-08-25', type, org: 'XX调解中心', content: '沟通还款方案', result: '达成调解协议', doc: '调解书.pdf', at: '2026-08-25 11:00', by: '张法务' }], stage: '调解中' }, { at: '2026-08-25 11:00', op: '新增' + type + '记录', by: '张法务' }) }}>新增调解记录</ZzBtn>}>
          {!canMediate && <div className="mb-2 text-xs text-gray-400">需先完成立案登记才能录入调解记录。</div>}
          <ZzTable head={['调解时间', '调解类型', '调解机构/法官', '沟通内容', '调解结果', '附件', '操作']} rows={(c.mediates ?? []).map((m: any) => [
            m.time, m.type, m.org, m.content, <ZzBadge color={m.result.includes('成功') || m.result.includes('结案') ? GREEN : RED}>{m.result}</ZzBadge>, m.doc || '—', <ZzBtn sm>预览</ZzBtn>,
          ])} />
          {(c.mediates?.length ?? 0) === 0 && <div className="mt-2 text-sm text-gray-400">暂无调解记录。</div>}
          {!locked && canMediate && (c.mediates?.length ?? 0) > 0 && <div className="mt-2"><ZzBtn sm onClick={() => update(c.id, { stage: '执行中' }, { at: '2026-08-25 12:00', op: '调解失败，流转开庭审理/执行', by: '张法务' })}>调解失败→进入执行</ZzBtn></div>}
        </ZzCard>

        {/* 模块5：执行跟进 */}
        <ZzCard title="⑤ 执行跟进" extra={!locked && <ZzBtn sm primary disabled={!canExec} onClick={() => { if (confirm('登记执行信息？')) update(c.id, { exec: { no: '(2026)XX执' + c.id.slice(-3) + '号', court: 'XX区法院', applyTime: '2026-08-25', property: '查控中', recovery: 0, result: '执行中', at: '2026-08-25 13:00', by: '张法务' }, stage: '执行中' }, { at: '2026-08-25 13:00', op: '申请执行', by: '张法务' }) }}>新增执行跟进</ZzBtn>}>
          {!canExec && <div className="mb-2 text-xs text-gray-400">需先完成立案/调解后才能申请执行。</div>}
          {c.exec ? (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm md:grid-cols-4">
                {[['执行案号', c.exec.no], ['执行法院', c.exec.court], ['申请执行时间', c.exec.applyTime], ['执行进展', c.exec.result]].map(([k, v]) => (
                  <div key={k} className="rounded border px-3 py-2"><div className="text-xs text-gray-400">{k}</div><div className="mt-0.5 font-medium">{v}</div></div>
                ))}
              </div>
              <div className="text-sm"><span className="text-gray-400">财产查控：</span>{c.exec.property}</div>
              <div className="text-sm"><span className="text-gray-400">执行回款：</span><span className="text-green-600">{money(c.exec.recovery)}</span></div>
              {!locked && <div className="flex gap-2">
                <ZzBtn sm onClick={() => update(c.id, { exec: { ...c.exec, recovery: (c.exec.recovery || 0) + 5000, property: c.exec.property + '；扣划 5000' }, stage: '执行中' }, { at: '2026-08-25 14:00', op: '新增执行跟进记录，回款 5000', by: '张法务' })}>登记回款 +5000</ZzBtn>
                <ZzBtn sm danger onClick={() => update(c.id, { exec: { ...c.exec, result: '终结本次执行' } })}>终本</ZzBtn>
                <ZzBtn sm primary onClick={() => update(c.id, { exec: { ...c.exec, result: '执行完毕' } })}>执行完毕</ZzBtn>
              </div>}
            </div>
          ) : <div className="text-sm text-gray-400">尚未申请执行。</div>}
        </ZzCard>

        {/* 模块6：诉讼归档 */}
        <ZzCard title="⑥ 诉讼归档" extra={!locked && canArchive && <ZzBtn sm primary onClick={() => { const t = prompt('结案类型（调解结案/判决结案/执行完毕/终结本次执行/撤诉）', '调解结案') ?? '调解结案'; update(c.id, { archive: { closeType: t, closeDate: '2026-08-25', summary: '案件闭环', files: ['判决书.pdf', '调解书.pdf'], at: '2026-08-25 15:00', by: '张法务' }, stage: '已归档', archived: true }, { at: '2026-08-25 15:00', op: '执行案件归档，' + t, by: '张法务' }); onArchived() }}>执行案件归档</ZzBtn>}>
          {!canArchive && <div className="mb-2 text-xs text-gray-400">需完成执行跟进后才能归档。</div>}
          {c.archive ? (
            <div className="space-y-1 text-sm">
              <div><span className="text-gray-400">结案类型：</span><ZzBadge color={GRAY}>{c.archive.closeType}</ZzBadge>　<span className="text-gray-400">结案日期：</span>{c.archive.closeDate}</div>
              <div><span className="text-gray-400">结案总结：</span>{c.archive.summary}</div>
              <div><span className="text-gray-400">归档附件：</span>{c.archive.files.map((f: string) => <ZzBadge key={f} color={BLUE}>{f}</ZzBadge>)}</div>
            </div>
          ) : <div className="text-sm text-gray-400">案件尚未结案归档。</div>}
          {c.archived && <div className="mt-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500">🔒 案件已归档锁定，关键信息不可修改，仅保留查看权限。</div>}
        </ZzCard>

        {/* 模块7：流转时间轴 */}
        <ZzCard title="⑦ 案件流转日志（全流程时间轴）">
          <div className="space-y-2">
            {c.logs.map((l: any, i: number) => (
              <div key={i} className="flex gap-3 border-l-2 border-blue-200 pl-3">
                <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                <div className="text-sm"><span className="text-gray-400">{l.at}</span> · <span className="font-medium">{l.op}</span> · <span className="text-gray-500">{l.by}</span></div>
              </div>
            ))}
          </div>
        </ZzCard>
      </div>
    </ZzModal>
  )
}
