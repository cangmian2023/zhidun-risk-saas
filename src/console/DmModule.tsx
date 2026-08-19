/* 数字营销子系统（dm）· 路由中心
 * 所有 dm:* 页面在此分发；未实现的页面统一回落到 moduleSpecs 的「功能规划中」占位，
 * 保证整套菜单可导航、不白屏。组件随批次逐步接入（见 record/营销子系统-实施计划与批次规划.md）。
 * 注意：每接入一个页面，在上方 import 并在 switch 中加 case；未接入的键一律走 default 占位。
 */
import ModulePage from './ModulePage'
import { moduleSpecs } from './specs'
import { subNames } from './menus'

import DmAiMarketing, { DmAiMarketingResult } from './DmAiMarketing'
import DmGridMarketing from './DmGridMarketing'
import DmRuralRevive from './DmRuralRevive'
import DmGroupAccount from './DmGroupAccount'
import DmGroupAccountDetail from './DmGroupAccountDetail'
import DmIndustryReport from './DmIndustryReport'
import DmRating from './DmRating'
import DmFullSearch from './DmFullSearch'
import DmRegionalBiz from './DmRegionalBiz'
import DmMapProspect from './DmMapProspect'
import DmCompanyLib from './DmCompanyLib'
import DmSupplyChain from './DmSupplyChain'
import DmTender from './DmTender'
import DmTechFin from './DmTechFin'
import DmTechFinDetail from './DmTechFinDetail'
import DmIndustryFin from './DmIndustryFin'
import DmIndustryFinDetail from './DmIndustryFinDetail'
import DmParkFin from './DmParkFin'
import DmGreenFin from './DmGreenFin'
import DmMarketList from './DmMarketList'
import DmMarketLead from './DmMarketLead'
import DmMarketBoard from './DmMarketBoard'
import DmExistBiz from './DmExistBiz'
import DmCrowdAnalysis from './DmCrowdAnalysis'
import DmEntArchive from './DmEntArchive'
import DmPersonArchive from './DmPersonArchive'

function emptySpec(crumb: string) {
  return {
    title: '模块建设中',
    crumb,
    subtitle: '该模块示例数据正在补充，当前菜单与框架已就绪。',
    columns: [],
    rows: [],
  }
}

export default function DmModule({ pageKey }: { pageKey: string }) {
  const cur = pageKey.split(':')[1] ?? 'ai-marketing'
  switch (cur) {
    case 'ai-marketing':
      return <DmAiMarketing />
    case 'ai-marketing-result':
      return <DmAiMarketingResult />
    case 'grid-marketing':
      return <DmGridMarketing />
    case 'rural-revive':
      return <DmRuralRevive />
    case 'group-account':
      return <DmGroupAccount />
    case 'group-account-detail':
      return <DmGroupAccountDetail />
    case 'industry-report':
      return <DmIndustryReport />
    case 'rating':
      return <DmRating />
    case 'full-search':
      return <DmFullSearch />
    case 'regional-biz':
      return <DmRegionalBiz />
    case 'map-prospect':
      return <DmMapProspect />
    case 'company-lib':
      return <DmCompanyLib />
    case 'supply-chain':
      return <DmSupplyChain />
    case 'tender':
      return <DmTender />
    case 'techfin':
      return <DmTechFin />
    case 'techfin-detail':
      return <DmTechFinDetail />
    case 'industry-fin':
      return <DmIndustryFin />
    case 'industry-fin-detail':
      return <DmIndustryFinDetail />
    case 'park-fin':
      return <DmParkFin />
    case 'green-fin':
      return <DmGreenFin />
    case 'market-list':
      return <DmMarketList />
    case 'market-lead':
      return <DmMarketLead />
    case 'market-board':
      return <DmMarketBoard />
    case 'exist-biz':
      return <DmExistBiz />
    case 'crowd-analysis':
      return <DmCrowdAnalysis />
    case 'ent-archive':
      return <DmEntArchive />
    case 'person-archive':
      return <DmPersonArchive />
    default:
      return <ModulePage spec={moduleSpecs[pageKey] ?? emptySpec(subNames['dm'] ?? '数字营销')} />
  }
}
