/* 一次性迁移：给 templateSeed.json 所有 content 分段补默认 dimBands（按本卡总分等比三等分，逻辑与 buildSections 一致） */
const fs = require('fs')
const FILE = '/Users/mandy/work/project/risk/SaaS/src/console/templateSeed.json'
const disk = JSON.parse(fs.readFileSync(FILE, 'utf-8'))

function computeSectionScore(s) {
  const mode = s.cardScoreMode ?? (s.sourceType === 'rule_set' ? 'deduct' : 'add')
  if (s.scoreable === false) return 0
  const raw = s.sourceType === 'data_source' ? s.ds?.tableFields : s.sourceType === 'api' ? s.api?.outputs : s.fields
  const fields = raw ?? s.fields ?? []
  let total = 0
  for (const f of fields) {
    if (!f || f.visible === false || f.hitReject) continue
    const pts = f.scorePoints ?? 0
    total += mode === 'add' ? pts : -pts
  }
  return total
}
function defaultDimBandsForScore(score) {
  const max = Math.max(1, Math.ceil(Math.abs(score)))
  const t = Math.max(1, Math.ceil(max / 3))
  return [
    { level: '低', min: 0, max: t, note: '该维度表现正常，无明显风险' },
    { level: '中', min: t + 1, max: t * 2, note: '该维度存在一定异常，建议关注' },
    { level: '高', min: Math.min(t * 2 + 1, max), max, note: '该维度风险突出，需重点核查' },
  ]
}
function fillSecs(sections) {
  if (!Array.isArray(sections)) return sections
  return sections.map((s) => {
    if ((s.homeTab ?? 'content') === 'content' && s.sourceType !== 'tpl_copy' && !s.dimBands) {
      return { ...s, dimBands: defaultDimBandsForScore(computeSectionScore(s)) }
    }
    return s
  })
}
let n = 0
const out = disk.map((t) => {
  const c = t.content ? { ...t.content, sections: fillSecs(t.content.sections) } : t.content
  const ar = t.autoReview ? { ...t.autoReview, sections: fillSecs(t.autoReview.sections) } : t.autoReview
  const mr = t.manualReview ? { ...t.manualReview, sections: fillSecs(t.manualReview.sections) } : t.manualReview
  ;[c, ar, mr].forEach((g) => (g?.sections ?? []).forEach((s) => { if (s.dimBands) n++ }))
  return { ...t, content: c, autoReview: ar, manualReview: mr }
})
fs.writeFileSync(FILE, JSON.stringify(out, null, 2) + '\n', 'utf-8')
console.log('✅ 迁移完成，带 dimBands 的分段:', n)
const back = JSON.parse(fs.readFileSync(FILE, 'utf-8'))
const x = back.find((v) => v.id === 'tpl-info-backup222')
x.content.sections.forEach((s) => console.log(' -', s.id, '| dimBands:', JSON.stringify(s.dimBands)))
