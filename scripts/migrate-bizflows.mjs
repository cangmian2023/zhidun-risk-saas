/* 一次性脚本：把四个 222 模板的 businessFlow 提取到 bizFlows.json（方案A 流程库），
 * 并为模板 flowBlock 设置 flowRefId（业务域）。幂等（bizFlows.json 已有数据则跳过迁移）。 */
import fs from 'node:fs'
import path from 'node:path'

const DIR = '/Users/mandy/work/project/risk/SaaS/src/console'
const SEED = path.join(DIR, 'templateSeed.json')
const FLOWS_FILE = path.join(DIR, 'bizFlows.json')

const disk = JSON.parse(fs.readFileSync(SEED, 'utf-8'))
const DOMAINS = [
  { tplId: 'tpl-info-backup222', domain: 'info_verify' },
  { tplId: 'tpl-credit-222', domain: 'credit' },
  { tplId: 'tpl-fraud-222', domain: 'fraud' },
  { tplId: 'tpl-decision-222', domain: 'decision' },
]

/* 1) 迁移 flows */
let flows = []
if (fs.existsSync(FLOWS_FILE)) {
  flows = JSON.parse(fs.readFileSync(FLOWS_FILE, 'utf-8')).flows ?? []
}
const have = flows.length > 0
if (!have) {
  for (const { tplId, domain } of DOMAINS) {
    const t = disk.find((x) => x.id === tplId)
    for (const bf of t?.manualReview?.businessFlow ?? []) {
      if (bf.gradeId === '—') continue // 计算中占位行跳过
      flows.push({
        id: `f-${domain}-${bf.gradeId}`,
        domain,
        gradeId: bf.gradeId,
        name: `${bf.gradeId}档`,
        suggestionText: bf.suggestionText ?? '',
        passNeedConfirm: bf.passNeedConfirm, passConfirmRole: bf.passConfirmRole,
        rejectAllowRecheck: bf.rejectAllowRecheck, recheckSubmitRole: bf.recheckSubmitRole, recheckApproveRole: bf.recheckApproveRole,
        manualSuggestRole: bf.manualSuggestRole, manualApproveRole: bf.manualApproveRole,
        flowGraphs: bf.flowGraphs ?? [],
      })
    }
  }
  fs.writeFileSync(FLOWS_FILE, JSON.stringify({ flows }, null, 2) + '\n', 'utf-8')
  console.log('✅ 已迁移流程库:', flows.length, '条')
} else {
  console.log('bizFlows.json 已有数据，跳过迁移（', flows.length, '条）')
}

/* 2) 模板 flowRefId */
let n = 0
for (const { tplId, domain } of DOMAINS) {
  const t = disk.find((x) => x.id === tplId)
  if (t && !t.manualReview?.flowBlock?.flowRefId) {
    t.manualReview.flowBlock.flowRefId = domain
    n++
  }
}
if (n) {
  fs.writeFileSync(SEED, JSON.stringify(disk, null, 2) + '\n', 'utf-8')
  console.log('✅ 已为', n, '个模板设置 flowBlock.flowRefId')
} else {
  console.log('flowRefId 已设置或模板缺失，跳过')
}

/* 3) 校验 */
const back = JSON.parse(fs.readFileSync(FLOWS_FILE, 'utf-8'))
back.flows.forEach((f) => console.log(' -', f.id, '|', f.domain, '|', f.gradeId, '|', (f.flowGraphs ?? []).length, '图'))
