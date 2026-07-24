import { crSpecs } from './specsCr'
import { scSpecs } from './specsSc'
import { MENU_BY_SUB, plannedExtras, subNames, type ModuleSpec } from './menus'

// 根据菜单定义自动生成「功能规划中」占位规格
function planned(sub: string, group: string, label: string, desc: string): ModuleSpec {
  return {
    title: label,
    crumb: `${subNames[sub]} / ${group}`,
    subtitle: `功能规划中，业务描述：${desc}`,
    columns: [],
    rows: [],
  }
}

const plannedSpecs: Record<string, ModuleSpec> = {}

for (const [sub, groups] of Object.entries(MENU_BY_SUB)) {
  for (const g of groups) {
    for (const it of g.items) {
      if (it.desc && !it.keep) {
        plannedSpecs[it.key] = planned(sub, g.group, it.label, it.desc)
      }
    }
  }
}

for (const e of plannedExtras) {
  plannedSpecs[e.key] = planned(e.sub, e.group, e.label, e.desc)
}

// 已「保持不变」的概览看板沿用既有详细规格；其余页面均为「功能规划中」
export const moduleSpecs: Record<string, ModuleSpec> = {
  'cr:overview': crSpecs['cr:overview'],
  'sc:overview': scSpecs['sc:overview'],
  ...plannedSpecs,
}
