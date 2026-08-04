/* 一次性迁移：给 templateSeed.json 所有 sections.fields 补全缺失字段
 * 数据源/接口：displayLabel/type/container/exempt/condValue
 * 规则集：weight/exempt/condValue
 * 不丢原值：仅在字段缺失/undefined 时补默认
 */
const fs = require('fs')
const FILE = '/Users/mandy/work/project/risk/SaaS/src/console/templateSeed.json'
const disk = JSON.parse(fs.readFileSync(FILE, 'utf-8'))

function fillFields(fields, sourceType) {
  if (!Array.isArray(fields)) return fields
  return fields.map((f) => {
    const out = { ...f }
    if (sourceType === 'data_source' || sourceType === 'api') {
      if (out.displayLabel == null) out.displayLabel = out.name
      if (out.type == null) out.type = sourceType === 'data_source' ? 'varchar' : 'string'
      if (out.container == null) out.container = /img|image|照片|影像|照/i.test(out.name ?? '') ? 'image' : 'text'
      if (out.exempt == null) out.exempt = false
      if (out.condValue == null) out.condValue = ''
      if (sourceType === 'data_source' && out.maskRule == null) out.maskRule = 'none'
    } else if (sourceType === 'rule_set') {
      if (out.weight == null) out.weight = 1
      if (out.exempt == null) out.exempt = false
      if (out.condValue == null) out.condValue = ''
    }
    return out
  })
}

function fillSections(sections) {
  if (!Array.isArray(sections)) return sections
  return sections.map((s) => ({ ...s, fields: fillFields(s.fields, s.sourceType) }))
}

let cnt = 0
const out = disk.map((t) => {
  const c = t.content ? { ...t.content, sections: fillSections(t.content.sections) } : t.content
  const ar = t.autoReview ? { ...t.autoReview, sections: fillSections(t.autoReview.sections) } : t.autoReview
  const mr = t.manualReview ? { ...t.manualReview, sections: fillSections(t.manualReview.sections) } : t.manualReview
  // 统计补了多少字段
  ;[c, ar, mr].forEach((g) => (g?.sections ?? []).forEach((s) => (s.fields ?? []).forEach((f) => {
    if (f.displayLabel || f.type || f.container || f.exempt === false || f.condValue === '' || f.weight === 1 || f.maskRule) cnt++
  })))
  return { ...t, content: c, autoReview: ar, manualReview: mr }
})

fs.writeFileSync(FILE, JSON.stringify(out, null, 2) + '\n', 'utf-8')
console.log('✅ 迁移完成，检查到补全字段的条目:', cnt)
// 抽查
const back = JSON.parse(fs.readFileSync(FILE, 'utf-8'))
const x = back.find(v => v.id === 'tpl-info-backup222')
const ds = x.content.sections.find(s => s.id === 'basic_info')
const api = x.content.sections.find(s => s.id === 'id_images')
const rs = x.content.sections.find(s => s.id === 'cross_fusion')
console.log('数据源字段:', JSON.stringify(ds.fields[0]))
console.log('接口字段:', JSON.stringify(api.fields[0]))
console.log('规则集字段:', JSON.stringify(rs.fields[0]))
