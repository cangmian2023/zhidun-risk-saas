// 分组选择器（页面配置 / 看板通用）：统一走 SearchSelect（可搜索 + 新建分组）
import { useState } from 'react'
import { SearchSelect } from '../components/ui'

export default function GroupSelect({ value, groups, onChange, width = 200 }: {
  value: string
  groups: string[]            // 现有分组（去重后传入即可）
  onChange: (g: string) => void
  width?: number
}) {
  const [creating, setCreating] = useState(false)
  const [custom, setCustom] = useState('')
  const opts = Array.from(new Set([...(groups ?? []), value])).filter(Boolean)
  const commit = (g: string) => { if (g.trim()) onChange(g.trim()) }
  const allOpts = [
    { value: '', label: '未分组' },
    ...opts.map((g) => ({ value: g, label: g })),
    { value: '__new__', label: '＋ 新建分组…' },
  ]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <SearchSelect
        width={width}
        options={allOpts}
        value={value}
        onChange={(v) => {
          const s = v as string
          if (s === '__new__') { setCreating(true); return }
          commit(s)
        }}
        placeholder="选择分组"
        searchPlaceholder="搜索分组…"
      />
      {creating && (
        <input autoFocus placeholder="新分组名" value={custom} onChange={(e) => setCustom(e.target.value)}
          onBlur={() => { if (custom.trim()) commit(custom); setCustom(''); setCreating(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && custom.trim()) { commit(custom); setCustom(''); setCreating(false) } }}
          style={{ padding: '4px 6px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff', width: 120 }} />
      )}
    </span>
  )
}
