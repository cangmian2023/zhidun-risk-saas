import { NavLink, useParams, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import Logo from '../components/Logo'
import UserMenu from '../components/UserMenu'
import ModulePage from '../console/ModulePage'
import { platformModules, platformMenus, type PlatformSpecs } from './menus'
import { platformSpecs } from './specs'

const subsystems = [
  { key: 'cr', name: '零售信贷风控' },
  { key: 'sc', name: '评分产品' },
  { key: 'ep', name: '企业风控' },
  { key: 'dm', name: '数字营销' },
]

function emptySpec(crumb: string) {
  return { title: '模块建设中', crumb, subtitle: '该页面示例数据正在补充，框架已就绪。', columns: [], rows: [] }
}

export default function Platform() {
  const { logout } = useAuth()
  const { module = 'profile', page } = useParams()
  const loc = useLocation()
  const nav = useNavigate()

  const mod = platformMenus[module] ?? platformMenus.profile
  const modMeta = platformModules.find((m) => m.key === module) ?? platformModules[0]
  const cur = page ?? mod[0].items[0].key.split(':')[1]
  const key = `${module}:${cur}`
  const spec = (platformSpecs as PlatformSpecs)[key] ?? emptySpec(modMeta.name)

  function switchSub(k: string) {
    nav(`/console/${k}/overview`)
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Logo />
          <span className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div className="flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 p-1">
            {subsystems.map((s) => {
              const active = loc.pathname.startsWith(`/console/${s.key}`)
              return (
                <button
                  key={s.key}
                  onClick={() => switchSub(s.key)}
                  className={`whitespace-nowrap rounded-lg px-3.5 py-1.5 text-sm font-medium transition ${
                    active
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-500 hover:bg-white/60 hover:text-slate-900'
                  }`}
                >
                  {s.name}
                </button>
              )
            })}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <UserMenu onLogout={() => { logout(); nav('/login') }} />
        </div>
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white py-4 md:block">
          <p className="px-5 text-sm font-semibold text-ink-900">{modMeta.name}</p>
          <p className="mt-0.5 px-5 text-xs text-slate-400">基础用户功能</p>
          {mod.map((g) => (
            <div key={g.group} className="mb-4 mt-4">
              <p className="px-5 text-xs font-semibold uppercase tracking-wide text-slate-400">{g.group}</p>
              <nav className="mt-1">
                {g.items.map((it) => {
                  const to = `/platform/${module}/${it.key.split(':')[1]}`
                  const active = it.key.split(':')[1] === cur
                  return (
                    <NavLink
                      key={it.key}
                      to={to}
                      className={`block px-5 py-2 text-sm transition ${
                        active
                          ? 'border-r-2 border-brand-600 bg-brand-50 font-medium text-brand-700'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-brand-700'
                      }`}
                    >
                      {it.label}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          ))}
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1180px]">
            <ModulePage spec={spec} />
          </div>
        </main>
      </div>
    </div>
  )
}
