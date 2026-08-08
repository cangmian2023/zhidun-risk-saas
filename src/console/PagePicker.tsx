// 页面选择器（关联页面专用）：左侧分组按钮 + 右侧页面列表（多选），顶部支持模糊搜索
// 2026-08-07 两版需求：①分组放左边成按钮，点左分组→右筛选该组页面；②包装为下拉浮层（点击弹出、选完收起）
import { useMemo, useState } from 'react'
import type { SearchSelectOption, SearchSelectGroup } from '../components/ui'

const inpSm: React.CSSProperties = { padding: '5px 8px', borderRadius: 6, border: '1px solid #E2E8F0', fontSize: 12, outline: 'none', width: '100%', background: '#fff' }

export default function PagePicker({ options, groups, value, onChange, placeholder = '选择关联页面…', dropdown = true }: {
  options: SearchSelectOption[]
  groups: SearchSelectGroup[]
  value: string[]
  onChange: (v: string[]) => void
  placeholder?: string
  dropdown?: boolean // true=下拉浮层（点击弹出/选完收起）；false=常驻面板
}) {
  const [activeGroup, setActiveGroup] = useState(groups[0]?.key ?? '')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ql = q.trim().toLowerCase()

  const pages = useMemo(() => {
    if (ql) return options.filter((o) => o.label.toLowerCase().includes(ql) || o.value.toLowerCase().includes(ql))
    return options.filter((o) => o.group === activeGroup)
  }, [options, activeGroup, ql])

  const toggle = (v: string) => onChange(value.includes(v) ? value.filter((x) => x !== v) : [...value, v])
  const labelOf = (v: string) => options.find((o) => o.value === v)?.label ?? v

  const body = (
    <>
      {/* 顶部：搜索 */}
      <div style={{ padding: 8, borderBottom: '1px solid #E2E8F0', background: '#F8FAFC' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} style={inpSm} />
      </div>
      <div style={{ display: 'flex', minHeight: 220 }}>
        {/* 左侧：分组按钮 */}
        <div style={{ width: 112, borderRight: '1px solid #E2E8F0', flexShrink: 0, background: '#FAFBFC', padding: '4px 0' }}>
          {groups.map((g) => {
            const cnt = options.filter((o) => o.group === g.key).length
            const on = !ql && activeGroup === g.key
            return (
              <button key={g.key} type="button" onClick={() => { setActiveGroup(g.key); setQ('') }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '7px 10px', fontSize: 12, cursor: 'pointer', border: 'none', borderLeft: on ? '3px solid #2563EB' : '3px solid transparent', background: on ? '#DBEAFE' : 'transparent', color: on ? '#1D4ED8' : '#475569', fontWeight: on ? 600 : 400 }}>
                {g.label}
                <span style={{ color: '#94A3B8', marginLeft: 4, fontSize: 11 }}>{cnt}</span>
              </button>
            )
          })}
        </div>
        {/* 右侧：当前分组页面列表（多选） */}
        <div style={{ flex: 1, maxHeight: 260, overflowY: 'auto', padding: 6 }}>
          {pages.length === 0 && <div style={{ padding: 14, fontSize: 12, color: '#94A3B8' }}>无匹配页面</div>}
          {pages.map((o) => {
            const on = value.includes(o.value)
            return (
              <label key={o.value} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 8px', borderRadius: 6, cursor: 'pointer', background: on ? '#EFF6FF' : 'transparent' }}>
                <input type="checkbox" checked={on} onChange={() => toggle(o.value)} />
                <span style={{ fontSize: 12, color: '#1F2937' }}>{o.label}</span>
                <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', marginLeft: 'auto', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 160 }}>{o.value.replace('/console/', '')}</span>
              </label>
            )
          })}
        </div>
      </div>
      {/* 底部：已选页面（可取消） */}
      {value.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: 8, borderTop: '1px solid #E2E8F0', background: '#FAFAFB' }}>
          {value.map((v) => (
            <span key={v} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, background: '#DBEAFE', color: '#1D4ED8', borderRadius: 12, padding: '2px 8px' }}>
              {labelOf(v)}
              <button type="button" onClick={() => toggle(v)} style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#1D4ED8', fontSize: 12, padding: 0, lineHeight: 1 }}>×</button>
            </span>
          ))}
        </div>
      )}
    </>
  )

  // 下拉模式：触发按钮 + 浮层
  if (dropdown) {
    return (
      <div style={{ position: 'relative' }}>
        <button type="button" onClick={() => setOpen(!open)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, padding: '7px 10px', borderRadius: 8, border: '1px solid #E2E8F0', background: '#fff', fontSize: 12, color: value.length ? '#1F2937' : '#94A3B8', width: '100%', cursor: 'pointer' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {value.length ? `已选 ${value.length} 个：${value.slice(0, 3).map(labelOf).join('、')}${value.length > 3 ? '…' : ''}` : placeholder}
          </span>
          <span style={{ color: '#64748B', fontSize: 10, flexShrink: 0 }}>{open ? '▴' : '▾'}</span>
        </button>
        {open && (
          <>
            {/* 遮罩：点击外部收起 */}
            <div style={{ position: 'fixed', inset: 0, zIndex: 95 }} onClick={() => setOpen(false)} />
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 96, width: 540, maxWidth: 'calc(100vw - 32px)', border: '1px solid #E2E8F0', borderRadius: 10, background: '#fff', boxShadow: '0 10px 30px rgba(15,23,42,.12)', overflow: 'hidden' }}>
              {body}
            </div>
          </>
        )}
      </div>
    )
  }

  // 常驻模式（原面板）
  return <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>{body}</div>
}
