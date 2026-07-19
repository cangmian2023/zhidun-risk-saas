import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Logo from '../components/Logo'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState('')

  function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const r = login(username, password)
    if (!r.ok) {
      setErr(r.msg ?? '登录失败')
      return
    }
    setErr('')
    nav('/console/cr/overview', { replace: true })
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink-900 px-4">
      <div className="absolute inset-0 bg-grid-line [background-size:32px_32px] opacity-10" />
      <div className="absolute -top-32 left-1/2 h-96 w-[44rem] -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo className="[&_span:last-child]:text-white" />
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-glow backdrop-blur">
          <h1 className="text-center text-xl font-bold text-white">登录控制台</h1>
          <p className="mt-1 text-center text-sm text-slate-400">信贷风控云服务 · 金融风险管理平台</p>

          <form onSubmit={onSubmit} className="mt-7 space-y-4">
            <label className="block">
              <span className="text-sm text-slate-300">用户名</span>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
              />
            </label>
            <label className="block">
              <span className="text-sm text-slate-300">密码</span>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="mt-1.5 w-full rounded-lg border border-white/15 bg-white/5 px-3.5 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 focus:border-brand-400 focus:ring-2 focus:ring-brand-500/30"
              />
            </label>

            {err && (
              <p className="rounded-lg bg-rose-500/15 px-3 py-2 text-sm text-rose-300">{err}</p>
            )}

            <button type="submit" className="btn-primary w-full !py-3">
              登录
            </button>
          </form>

          <p className="mt-5 rounded-lg bg-white/5 px-3 py-2.5 text-center text-xs text-slate-400">
            演示账号：<span className="font-mono text-slate-300">admin</span> / 任意≥4位密码（如 123456）
          </p>

          <p className="mt-4 text-center text-xs text-slate-500">
            返回 <Link to="/" className="text-brand-300 hover:underline">营销首页</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
