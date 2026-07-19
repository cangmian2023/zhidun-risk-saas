import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

const saasServices = [
  { label: '个人中心', desc: '账户资料、安全设置', to: '/platform/profile' },
  { label: '消息通知', desc: '预警 / 系统消息中心', to: '/platform/notify' },
  { label: '工单与支持', desc: '提交问题、查看处理进度', to: '/platform/ticket' },
  { label: 'API 文档', desc: '接口鉴权与调用说明', to: '/platform/apidoc' },
  { label: '帮助中心', desc: '产品手册与常见问题', to: '/platform/help' },
  { label: '企业设置', desc: '组织、渠道与权限管理', to: '/platform/ent' },
]

export default function UserMenu({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg px-2 py-1 transition hover:bg-slate-100"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {user?.name?.[0] ?? 'U'}
        </span>
        <span className="hidden text-left leading-tight sm:block">
          <span className="block text-sm font-medium text-ink-900">{user?.name}</span>
          <span className="block text-xs text-slate-400">{user?.role}</span>
        </span>
        <svg viewBox="0 0 24 24" className={`h-3.5 w-3.5 text-slate-400 transition ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
              {user?.name?.[0] ?? 'U'}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink-900">{user?.name}</p>
              <p className="truncate text-xs text-slate-400">{user?.org}</p>
            </div>
          </div>
          <div className="px-4 py-2.5">
            <p className="text-xs font-semibold text-slate-400">SaaS 服务 · 基础用户功能</p>
          </div>
          <div className="grid grid-cols-1 gap-1 px-2 pb-2">
            {saasServices.map((s) => (
              <button
                key={s.label}
                onClick={() => { nav(s.to); setOpen(false) }}
                className="flex items-start gap-3 rounded-lg px-3 py-2 text-left transition hover:bg-slate-50"
              >
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3l8 4v6c0 4-3.5 6.5-8 8-4.5-1.5-8-4-8-8V7l8-4z" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink-900">{s.label}</span>
                  <span className="block truncate text-xs text-slate-400">{s.desc}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="border-t border-slate-100 p-2">
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-rose-600 transition hover:bg-rose-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 12H4m0 0l3-3m-3 3l3 3M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              退出登录
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
