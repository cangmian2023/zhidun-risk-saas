import { useNavigate, useLocation } from 'react-router-dom'

/* ============================================================
 * 统一页面导航框架（列表页 → 详情页 → 返回）
 * ------------------------------------------------------------
 * 解决痛点：系统里大量详情页被多个子系统（cr/sc/ep）复用，
 * 之前每个页面各自手写返回路径，跨子系统进入时返回会落错子系统。
 *
 * 约定（全项目唯一来源）：
 *  - 列表进详情：一律用 goDetail(path)，自动带上
 *      back = 当前完整 URL（含 query）
 *      from = 当前子系统（cr/sc/ep/cm）
 *  - 详情返回：一律用 back(fallback?)，优先 ?back=，否则 nav(-1)
 *      （DetailHeader 在未收到 onBack 时会自动调用 back(backTo)）
 *
 * 这样「从哪个子系统进来，就返回哪个子系统」由 URL 参数保证，
 * 与详情页注册在哪个 sub 下无关，复用详情页不再写死返回路径。
 * ============================================================ */
export function usePageNav() {
  const nav = useNavigate()
  const loc = useLocation()
  const sub = loc.pathname.split('/')[2] || ''
  const currentPath = loc.pathname + loc.search
  const backParam = new URLSearchParams(loc.search).get('back')

  /**
   * 进入详情页：自动注入 back=当前URL 与 from=入口子系统。
   * 入口锁定：同子系统内跳转（targetSub===sub）保留原 ?from 入口链不漂，
   * 跨子系统跳转才用当前 sub 作为新入口。这样左侧菜单永远跟随「从哪个子系统点进来」，
   * 进任何下级页（含跨子系统复用的详情页）都不应切换外壳子系统。
   */
  function goDetail(path: string, extra?: Record<string, string>) {
    const [p, q] = path.split('?')
    const targetSub = p.split('/')[2] || ''
    const merged = new URLSearchParams(q || '')
    if (!merged.has('back')) merged.set('back', currentPath)
    if (!merged.has('from')) {
      const curFrom = new URLSearchParams(loc.search).get('from')
      merged.set('from', targetSub === sub ? (curFrom || sub) : sub)
    }
    if (extra) Object.entries(extra).forEach(([k, v]) => merged.set(k, v))
    nav(`${p}?${merged.toString()}`)
  }

  /** 详情页返回：优先 ?back=，防闭环（back 指向自身时改用 fallback），否则回退路径，最后浏览器后退 */
  function back(fallback?: string) {
    if (backParam && backParam !== currentPath) {
      nav(backParam)
      return
    }
    if (fallback) {
      nav(fallback)
      return
    }
    nav(-1)
  }

  return { nav, sub, currentPath, backParam, goDetail, back }
}
