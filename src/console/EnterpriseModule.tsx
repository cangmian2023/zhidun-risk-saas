/* 企业风控子系统（v3 重建）· 路由中心
 * 前缀分发：fk-* → 风控中心 / jd-* → 尽调中心 / arc-* → 企业档案
 * 各中心内部再按文件名懒加载页面（见 enterprise/{fengkong,jindiao,archive}/XxxModule.tsx）
 */
import { FkModule } from './enterprise/fengkong/FkModule'
import { JdModule } from './enterprise/jindiao/JdModule'
import { ArchiveModule } from './enterprise/archive/ArchiveModule'

export default function EnterpriseModule({ pageKey }: { pageKey: string }) {
  const rest = pageKey.split(':')[1] ?? 'overview'
  const base = rest.split('?')[0]
  const params = new URLSearchParams(rest.split('?')[1] ?? '')
  if (base.startsWith('fk-')) return <FkModule base={base} params={params} />
  if (base.startsWith('jd-')) return <JdModule base={base} params={params} />
  if (base.startsWith('arc-')) return <ArchiveModule base={base} params={params} />
  return (
    <div style={{ padding: 40, color: '#94A3B8' }}>企业风控 · 未知页面：{pageKey}</div>
  )
}
