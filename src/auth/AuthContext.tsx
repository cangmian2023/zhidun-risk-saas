import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  username: string
  name: string
  role: string
  org: string
}

interface AuthCtx {
  user: User | null
  login: (username: string, password: string) => { ok: boolean; msg?: string }
  logout: () => void
}

const Ctx = createContext<AuthCtx | null>(null)

const STORAGE_KEY = 'zdrk_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
    else localStorage.removeItem(STORAGE_KEY)
  }, [user])

  // 演示用：任意非空用户名 + 密码即可登录；预置 admin / 123456 提示
  function login(username: string, password: string) {
    const u = (username || '').trim()
    const p = password || ''
    if (!u) return { ok: false, msg: '请输入用户名' }
    if (!p) return { ok: false, msg: '请输入密码' }
    if (p.length < 4) return { ok: false, msg: '密码长度至少 4 位' }

    const roleMap: Record<string, { name: string; role: string }> = {
      admin: { name: '系统管理员', role: '风控管理员' },
      risk: { name: '风控审核员', role: '风控审核' },
      op: { name: '运营专员', role: '客群运营' },
    }
    const info = roleMap[u.toLowerCase()] ?? { name: u, role: '风控审核' }
    setUser({ username: u, name: info.name, role: info.role, org: '信贷风控云服务 · 消费金融企业客户' })
    return { ok: true }
  }

  function logout() {
    setUser(null)
  }

  return <Ctx.Provider value={{ user, login, logout }}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}
