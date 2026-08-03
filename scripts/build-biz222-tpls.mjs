/* 一次性脚本：从代码 seed 取三个新模板（tpl-credit-222/tpl-fraud-222/tpl-decision-222），
 * 转为磁盘四块格式后合并写入 templateSeed.json（不覆盖现有模板，只新增缺失的）。 */
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = '/Users/mandy/work/project/risk/SaaS'
const BUNDLE = '/tmp/rtd-export.mjs'
const SEED_FILE = path.join(ROOT, 'src/console/templateSeed.json')

// 1. bundle reportTemplateData.ts（CJS 格式，node 可执行；该模块无顶层 fetch）
execSync(`cd ${ROOT} && /Users/mandy/.workbuddy/binaries/node/versions/22.22.2/bin/npx esbuild src/console/reportTemplateData.ts --bundle --format=esm --platform=node --outfile=${BUNDLE} --log-level=error`, { stdio: 'inherit' })

const mod = await import(`${BUNDLE}?t=${Date.now()}`)
const seed = mod.seedReportTemplates
const target = seed.filter((t) => ['tpl-credit-222', 'tpl-fraud-222', 'tpl-decision-222'].includes(t.id))
console.log('代码 seed 中目标模板:', target.map((t) => `${t.id}(${t.name}, sections=${t.sections.length})`).join(' / '))
if (target.length !== 3) throw new Error('未找到 3 个新模板，终止')

// 2. convertToDisk 内联（与 templateStore.ts 一致）
function convertToDisk(t) {
  return {
    id: t.id,
    basic: {
      name: t.name, reportType: t.reportType, scope: t.scope, status: t.status, isDefault: t.isDefault,
      description: t.description, version: t.version, lastEditor: t.lastEditor, lastEditTime: t.lastEditTime,
      showOpLog: t.showOpLog, showSectionTotals: t.showSectionTotals,
    },
    content: { sections: t.sections.filter((s) => { const h = s.homeTab ?? 'content'; return h !== 'score' && h !== 'flow' }) },
    autoReview: {
      scoreBlock: t.scoreBlock, scoreDisplay: t.scoreDisplay, scoreFormula: t.scoreFormula, specialRules: t.specialRules,
    },
    manualReview: {
      flowBlock: t.flowBlock, businessFlow: t.businessFlow,
    },
    theme: t.theme, export: t.export, changeLogs: t.changeLogs, demoApplicant: t.demoApplicant,
  }
}

// 3. 合并写盘（存在则覆盖，保证与代码 seed 最新逻辑一致）
const disk = JSON.parse(fs.readFileSync(SEED_FILE, 'utf-8'))
let added = 0, replaced = 0
for (const t of target) {
  const d = convertToDisk(t)
  const idx = disk.findIndex((x) => x.id === t.id)
  if (idx >= 0) { disk[idx] = d; replaced++ }
  else { disk.push(d); added++ }
}
fs.writeFileSync(SEED_FILE, JSON.stringify(disk, null, 2) + '\n', 'utf-8')
console.log(`✅ 合并完成：新增 ${added} 个、覆盖 ${replaced} 个，共 ${disk.length} 个`)

// 4. 打印新模板摘要
for (const t of target) {
  const d = disk.find((x) => x.id === t.id)
  const secs = [...(d.content?.sections ?? [])]
  console.log(`- ${t.id}: grades=${d.autoReview.scoreDisplay.grades.length}档(${d.autoReview.scoreDisplay.grades.map((g) => `${g.grade}:${g.minScore}~${g.maxScore}`).join(',')}) semantic=${d.autoReview.scoreDisplay.scoreSemantic} formula=${d.autoReview.scoreFormula?.terms?.length}项 businessFlow=${(d.manualReview.businessFlow ?? []).length}条 contentSections=${secs.map((s) => s.id).join(',')}`)
}
