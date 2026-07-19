import type { ModuleSpec } from './menus'
import { crSpecs } from './specsCr'
import { scSpecs } from './specsSc'

export const moduleSpecs: Record<string, ModuleSpec> = {
  ...crSpecs,
  ...scSpecs,
}
