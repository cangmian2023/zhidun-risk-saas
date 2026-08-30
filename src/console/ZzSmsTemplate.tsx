// 短信模板管理：模板库 + 合规校验 + 预览 + 审核
import { useMemo, useState } from 'react'
import { ZzPage, ZzCard, ZzTable, ZzBadge, ZzBtn, ZzDrawer, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea } from './zzUi'
import { ZZ_SMS_TEMPLATES, ZZ_SMS_TYPES, ZZ_SMS_CHANNELS, ZZ_SMS_STATUSES } from './zzData'
import { useZzList, updateZzList, ZZ_FILE } from './zzStore'

// 合规红线词：命中即不允许保存/启用（与敏感词库共同生效）
const BAN_WORDS = ['上门', '后果', '报警', '坐牢', '公安', '冒充', '曝光', '让你好看', '找你家人']

function smsRiskHits(text: string, words: any[]) {
  const t = text || ''
  const hits = [
    ...BAN_WORDS.filter((w) => t.includes(w)),
    ...words.filter((w: any) => w.enabled !== false && t.includes(w.word)).map((w: any) => w.word),
  ]
  return [...new Set(hits)]
}

const statusColor: any = { 启用: '#16A34A', 停用: '#94A3B8', 草稿: '#D97706' }

export function ZzSmsTemplate() {
  // 短信模板走共享数据层：审核状态与启用状态变更即时生效、刷新不丢
  const list = useZzList<any>(ZZ_FILE.sms, ZZ_SMS_TEMPLATES)
  const setList = (v: any[] | ((rs: any[]) => any[])) => updateZzList<any>(ZZ_FILE.sms, (rs) => (typeof v === 'function' ? v(rs) : v))
  // 敏感词库（共享）：与内置红线词一起参与合规校验
  const words = useZzList<any>(ZZ_FILE.words, [])
  const [kw, setKw] = useState('')
  const [fType, setFType] = useState('')
  const [fChannel, setFChannel] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [edit, setEdit] = useState<any | null>(null)
  const [preview, setPreview] = useState<any | null>(null)

  const filtered = useMemo(() => list.filter((s) =>
    (!kw || (s.name + s.code + s.content).toLowerCase().includes(kw.toLowerCase())) &&
    (!fType || s.type === fType) &&
    (!fChannel || s.channel === fChannel) &&
    (!fStatus || s.status === fStatus)
  ), [list, kw, fType, fChannel, fStatus])

  const renderPreview = (s: any) => {
    const map: any = { 客户: '张*明', 金额: '12,800', 日期: '2026-08-30', 天数: '45', 期数: '6', 每期金额: '2,133', 首期日: '2026-09-05', 工号: '8821' }
    const body = (s.content || '').replace(/\{(\w+)\}/g, (_: string, k: string) => map[k] ?? '{' + k + '}')
    return (s.sign ? s.sign : '') + body
  }

  const save = () => {
    if (!edit) return
    // 合规校验：命中红线词或敏感词库，直接拦截不允许保存
    const hits = smsRiskHits(edit.content, words)
    if (hits.length) { alert('内容含违规表述，不允许保存：' + hits.join('、')); return }
    // 内容变更后审核状态重置为「待审核」，防止改了内容还挂着已审核
    const rec = { ...edit, updatedAt: new Date().toISOString().slice(0, 10), audit: '待审核' }
    setList((l) => { const i = l.findIndex((x) => x.id === rec.id); return i >= 0 ? l.map((x) => x.id === rec.id ? rec : x) : [...l, rec] })
    setEdit(null)
  }

  const toggle = (s: any) => {
    // 未通过审核的模板不允许启用（此前可绕过审核直接启用）
    if (s.status !== '启用' && s.audit !== '已审核') { alert('该模板尚未通过合规审核，请先提交审核并通过后再启用'); return }
    const next = s.status === '启用' ? '停用' : '启用'
    setList((l) => l.map((x) => x.id === s.id ? { ...x, status: next } : x))
  }

  const submitAudit = (s: any) => {
    const hits = smsRiskHits(s.content, words)
    if (hits.length) { alert('内容含违规表述，不允许提交审核：' + hits.join('、')); return }
    setList((l) => l.map((x) => x.id === s.id ? { ...x, audit: '审核中' } : x))
    alert('已提交合规审核，等待审核结果')
  }

  const review = (s: any, pass: boolean) => {
    setList((l) => l.map((x) => x.id === s.id ? { ...x, audit: pass ? '已审核' : '已驳回' } : x))
    alert(pass ? '审核通过，该模板现在可以启用' : '已驳回，请修改内容后重新提交审核')
  }

  return (
    <ZzPage title="短信模板管理" crumb="催贷管理 / 短信模板" subtitle="短信 / 企微 / 5G 消息模板：合规校验、预览、审核状态（样例数据）"
      actions={<ZzBtn primary onClick={() => setEdit({ id: 'SM-' + (2007 + list.length), code: '', name: '', type: ZZ_SMS_TYPES[0], channel: ZZ_SMS_CHANNELS[0], status: '草稿', sign: '【XX金融】', content: '', variables: [], audit: '待审核', send: 0 })}>＋ 新建模板</ZzBtn>}>
      <ZzFilterBar>
        <ZzField label="搜索"><ZzInput placeholder="名称/模板编码/内容" value={kw} onChange={(e) => setKw(e.target.value)} /></ZzField>
        <ZzField label="类型"><ZzSelect value={fType} onChange={(e) => setFType(e.target.value)}><option value="">全部</option>{ZZ_SMS_TYPES.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
        <ZzField label="渠道"><ZzSelect value={fChannel} onChange={(e) => setFChannel(e.target.value)}><option value="">全部</option>{ZZ_SMS_CHANNELS.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
        <ZzField label="状态"><ZzSelect value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">全部</option>{ZZ_SMS_STATUSES.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
        <ZzBtn onClick={() => { setKw(''); setFType(''); setFChannel(''); setFStatus('') }}>重置</ZzBtn>
      </ZzFilterBar>

      <ZzCard title={`模板列表（${filtered.length}）`}>
        <ZzTable stickyAction head={['模板编码', '名称', '类型', '渠道', '状态', '审核', '累计发送', '更新时间', '操作']} rows={filtered.map((s) => [
          s.code, <span className="font-medium">{s.name}</span>, s.type, s.channel,
          <ZzBadge color={statusColor[s.status]}>{s.status}</ZzBadge>, <ZzBadge color={s.audit === '已审核' ? '#16A34A' : '#D97706'}>{s.audit}</ZzBadge>,
          s.send?.toLocaleString?.() ?? s.send, s.updatedAt,
          <div className="flex gap-2">
            <ZzBtn sm onClick={() => setPreview(s)}>预览</ZzBtn>
            <ZzBtn sm onClick={() => setEdit({ ...s })}>编辑</ZzBtn>
            {(s.audit !== '已审核' && s.audit !== '审核中') && <ZzBtn sm onClick={() => submitAudit(s)}>提交审核</ZzBtn>}
            {s.audit === '审核中' && <><ZzBtn sm primary onClick={() => review(s, true)}>通过</ZzBtn><ZzBtn sm danger onClick={() => review(s, false)}>驳回</ZzBtn></>}
            <ZzBtn sm onClick={() => toggle(s)}>{s.status === '启用' ? '停用' : '启用'}</ZzBtn>
          </div>,
        ])} />
      </ZzCard>

      {preview && (
        <ZzDrawer open title={`模板预览 · ${preview.name}`} onClose={() => setPreview(null)} width={620}
          footer={<ZzBtn primary onClick={() => setPreview(null)}>关闭</ZzBtn>}>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2"><ZzBadge>{preview.type}</ZzBadge><ZzBadge>{preview.channel}</ZzBadge><ZzBadge color={statusColor[preview.status]}>{preview.status}</ZzBadge><ZzBadge color={preview.audit === '已审核' ? '#16A34A' : '#D97706'}>{preview.audit}</ZzBadge></div>
            <div className="rounded border bg-slate-50 p-3 leading-relaxed">{renderPreview(preview)}</div>
            <div className="text-xs text-gray-500">签名：{preview.sign || '未设置'} ｜ 变量：{(preview.variables || []).map((v: string) => '{' + v + '}').join(' ') || '无'}</div>
          </div>
        </ZzDrawer>
      )}

      {edit && (
        <ZzDrawer open title={edit.id && ZZ_SMS_TEMPLATES.find((x) => x.id === edit.id) ? `编辑模板 · ${edit.id}` : '新建模板'} onClose={() => setEdit(null)} width={720}
          footer={<><ZzBtn onClick={() => setEdit(null)}>取消</ZzBtn><ZzBtn primary onClick={save}>保存</ZzBtn></>}>
          <div className="grid grid-cols-2 gap-3">
            <ZzField label="模板名称"><ZzInput value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></ZzField>
            <ZzField label="模板编码"><ZzInput value={edit.code} onChange={(e) => setEdit({ ...edit, code: e.target.value })} /></ZzField>
            <ZzField label="类型"><ZzSelect value={edit.type} onChange={(e) => setEdit({ ...edit, type: e.target.value })}>{ZZ_SMS_TYPES.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
            <ZzField label="渠道"><ZzSelect value={edit.channel} onChange={(e) => setEdit({ ...edit, channel: e.target.value })}>{ZZ_SMS_CHANNELS.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
            <ZzField label="状态"><ZzSelect value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{ZZ_SMS_STATUSES.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
            <ZzField label="签名"><ZzInput value={edit.sign} onChange={(e) => setEdit({ ...edit, sign: e.target.value })} placeholder="【XX金融】" /></ZzField>
          </div>
          <ZzField label="模板内容（{变量} 占位）"><ZzTextarea rows={4} className="w-full resize-y" value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} /></ZzField>
          <div className="mt-3 text-xs text-gray-500">合规要求：须含退订方式提示、真实签名；不得含威胁/恐吓/冒充公检法表述；变量请按实际替换。</div>
        </ZzDrawer>
      )}
    </ZzPage>
  )
}
