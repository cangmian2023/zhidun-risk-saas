// 话术管理：话术库（分类 / 版本管理 / 预览 / 关联策略）
import { useMemo, useState } from 'react'
import { ZzPage, ZzCard, ZzTable, ZzBadge, ZzBtn, ZzDrawer, ZzTabs, ZzFilterBar, ZzField, ZzInput, ZzSelect, ZzTextarea } from './zzUi'
import { ZZ_SCRIPTS, ZZ_SCRIPT_CATEGORIES, ZZ_SCRIPT_CHANNELS, ZZ_SCRIPT_STATUSES } from './zzData'

const statusColor: any = { 生效中: '#16A34A', 草稿: '#D97706', 已下线: '#94A3B8' }

export function ZzScriptLib() {
  const [list, setList] = useState<any[]>(() => ZZ_SCRIPTS.map((s) => ({ ...s })))
  const [kw, setKw] = useState('')
  const [fCat, setFCat] = useState('')
  const [fChannel, setFChannel] = useState('')
  const [fStatus, setFStatus] = useState('')
  const [edit, setEdit] = useState<any | null>(null)
  const [preview, setPreview] = useState<any | null>(null)

  const filtered = useMemo(() => list.filter((s) =>
    (!kw || (s.name + s.id + s.content).toLowerCase().includes(kw.toLowerCase())) &&
    (!fCat || s.category === fCat) &&
    (!fChannel || s.channel === fChannel) &&
    (!fStatus || s.status === fStatus)
  ), [list, kw, fCat, fChannel, fStatus])

  const renderPreview = (s: any) => {
    const map: any = { 客户: '张*明', 机构: 'XX金融', 工号: '8821', 金额: '12,800', 日期: '2026-08-30', 天数: '45', 期数: '6', 每期金额: '2,133', 首期日: '2026-09-05' }
    return (s.content || '').replace(/\{(\w+)\}/g, (_: string, k: string) => map[k] ?? '{' + k + '}')
  }

  const save = () => {
    if (!edit) return
    const rec = { ...edit, versions: edit.versions ?? [], updatedAt: '2026-08-27' }
    setList((l) => { const i = l.findIndex((x) => x.id === rec.id); return i >= 0 ? l.map((x) => x.id === rec.id ? rec : x) : [...l, rec] })
    setEdit(null)
  }

  return (
    <ZzPage title="话术管理" crumb="AI协催 / 话术管理" subtitle="话术库：分类管理、版本控制、效果预览、关联策略（样例数据）"
      actions={<ZzBtn primary onClick={() => setEdit({ id: 'S-' + (1007 + list.length), name: '', category: ZZ_SCRIPT_CATEGORIES[0], channel: ZZ_SCRIPT_CHANNELS[0], status: '草稿', version: 'v0.1.0', content: '', variables: [], strategies: [], versions: [] })}>＋ 新建话术</ZzBtn>}>
      <ZzFilterBar>
        <ZzField label="搜索"><ZzInput placeholder="名称/编号/内容" value={kw} onChange={(e) => setKw(e.target.value)} /></ZzField>
        <ZzField label="分类"><ZzSelect value={fCat} onChange={(e) => setFCat(e.target.value)}><option value="">全部</option>{ZZ_SCRIPT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
        <ZzField label="渠道"><ZzSelect value={fChannel} onChange={(e) => setFChannel(e.target.value)}><option value="">全部</option>{ZZ_SCRIPT_CHANNELS.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
        <ZzField label="状态"><ZzSelect value={fStatus} onChange={(e) => setFStatus(e.target.value)}><option value="">全部</option>{ZZ_SCRIPT_STATUSES.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
        <ZzBtn onClick={() => { setKw(''); setFCat(''); setFChannel(''); setFStatus('') }}>重置</ZzBtn>
      </ZzFilterBar>

      <ZzCard title={`话术列表（${filtered.length}）`}>
        <ZzTable stickyAction head={['编号', '名称', '分类', '渠道', '状态', '版本', '关联策略', '更新时间', '操作']} rows={filtered.map((s) => [
          s.id, <span className="font-medium">{s.name}</span>, s.category, s.channel,
          <ZzBadge color={statusColor[s.status]}>{s.status}</ZzBadge>, s.version, (s.strategies || []).join('、') || '—', s.updatedAt,
          <div className="flex gap-2">
            <ZzBtn sm onClick={() => setPreview(s)}>预览</ZzBtn>
            <ZzBtn sm onClick={() => setEdit({ ...s })}>编辑</ZzBtn>
          </div>,
        ])} />
      </ZzCard>

      {preview && (
        <ZzDrawer open title={`话术预览 · ${preview.name}`} onClose={() => setPreview(null)} width={640}
          footer={<ZzBtn primary onClick={() => setPreview(null)}>关闭</ZzBtn>}>
          <div className="space-y-3 text-sm">
            <div className="flex flex-wrap gap-2"><ZzBadge>{preview.category}</ZzBadge><ZzBadge>{preview.channel}</ZzBadge><ZzBadge color={statusColor[preview.status]}>{preview.status}</ZzBadge><ZzBadge>{preview.version}</ZzBadge></div>
            <div className="rounded border bg-slate-50 p-3 leading-relaxed">{renderPreview(preview)}</div>
            <div className="text-xs text-gray-500">变量：{(preview.variables || []).map((v: string) => '{' + v + '}').join(' ') || '无'}</div>
          </div>
        </ZzDrawer>
      )}

      {edit && (
        <ZzDrawer open title={edit.id && ZZ_SCRIPTS.find((x) => x.id === edit.id) ? `编辑话术 · ${edit.id}` : '新建话术'} onClose={() => setEdit(null)} width={720}
          footer={<><ZzBtn onClick={() => setEdit(null)}>取消</ZzBtn><ZzBtn primary onClick={save}>保存</ZzBtn></>}>
          <div className="grid grid-cols-2 gap-3">
            <ZzField label="话术名称"><ZzInput value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></ZzField>
            <ZzField label="编号"><ZzInput value={edit.id} disabled /></ZzField>
            <ZzField label="分类"><ZzSelect value={edit.category} onChange={(e) => setEdit({ ...edit, category: e.target.value })}>{ZZ_SCRIPT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
            <ZzField label="渠道"><ZzSelect value={edit.channel} onChange={(e) => setEdit({ ...edit, channel: e.target.value })}>{ZZ_SCRIPT_CHANNELS.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
            <ZzField label="状态"><ZzSelect value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>{ZZ_SCRIPT_STATUSES.map((c) => <option key={c}>{c}</option>)}</ZzSelect></ZzField>
            <ZzField label="版本号"><ZzInput value={edit.version} onChange={(e) => setEdit({ ...edit, version: e.target.value })} /></ZzField>
          </div>
          <ZzField label="话术内容（{变量} 占位）"><ZzTextarea rows={4} className="w-full resize-y" value={edit.content} onChange={(e) => setEdit({ ...edit, content: e.target.value })} /></ZzField>
          <div className="mt-3 text-xs text-gray-500">合规红线：不得冒充公检法、不得威胁恐吓、不得向无关第三方泄露债务信息；变量请按实际替换。</div>
        </ZzDrawer>
      )}
    </ZzPage>
  )
}
