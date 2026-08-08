// 分组选择器（页面配置 / 看板通用）：下拉选现有分组 + 「＋ 新建分组」动态输入
import { useState } from 'react'

const inpSm: React.CSSProperties = { padding: '4px 6px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, background: '#fff' }

export default function GroupSelect({ value, groups, onChange, width = 160 }: {
  value: string
  groups: string[]            // 现有分组（去重后传入即可）
  onChange: (g: string) => void
  width?: number
}) {
  const [creating, setCreating] = useState(false)
  const [custom, setCustom] = useState('')
  const opts = Array.from(new Set([...(groups ?? []), value])).filter(Boolean)
  const commit = (g: string) => { if (g.trim()) onChange(g.trim()) }
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <select value={value} onChange={(e) => {
        if (e.target.value === '__new__') setCreating(true)
        else { setCreating(false); commit(e.target.value) }
      }} style={{ ...inpSm, width }}>
        <option value="">未分组</option>
        {opts.map((g) => <option key={g} value={g}>{g}</option>)}
        <option value="__new__">＋ 新建分组…</option>
      </select>
      {creating && (
        <input autoFocus placeholder="新分组名" value={custom} onChange={(e) => setCustom(e.target.value)}
          onBlur={() => { if (custom.trim()) commit(custom); setCustom(''); setCreating(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter' && custom.trim()) { commit(custom); setCustom(''); setCreating(false) } }}
          style={{ ...inpSm, width: 120 }} />
      )}
    </span>
  )
}
