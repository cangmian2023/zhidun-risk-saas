// 短信模板管理：模板库 + 合规校验 + 预览 + 审核
import { useMemo, useState } from 'react'
import { ZzPage, ZzCard, ZzTable, ZzBadge, ZzBtn, ZzDrawer, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea } from './zzUi'
import { ZZ_SMS_TEMPLATES, ZZ_SMS_TYPES, ZZ_SMS_CHANNELS, ZZ_SMS_STATUSES } from './zzData'

const statusColor: any = { 启用: '#16A34A', 停用: '#94A3B8', 草稿: '#D97706' }

export function ZzSmsTemplate() {
  const [list, setList] = useState<any[]>(() => ZZ_SMS_TEMPLATES.map((s) => ({ ...s })))
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
    const rec = { ...edit, updatedAt: '2026-08-27' }
    setList((l) => { const i = l.findIndex((x) => x.id === rec.id); return i >= 0 ? l.map((x) => x.id === rec.id ? rec : x) : [...l, rec] })
    setEdit(null)
  }

  const toggle = (s: any) => {
    const next = s.status === '启用' ? '停用' : '启用'
    setList((l) => l.map((x) => x.id === s.id ? { ...x, status: next } : x))
  }

  return (
    <ZzPage title="短信模板管理" crumb="AI协催 / 短信模板管理" subtitle="短信 / 企微 / 5G 消息模板：合规校验、预览、审核状态（样例数据）"
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
