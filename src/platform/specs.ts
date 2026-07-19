import type { PlatformSpecs } from './menus'
import { specsA } from './specs_a'
import { specsB } from './specs_b'
import { specsC } from './specs_c'

export const platformSpecs: PlatformSpecs = {
  ...specsA,
  ...specsB,
  ...specsC,
}
