/* 一次性迁移：把旧扁平 templateSeed.json 转成四块分组格式（逻辑与 templateStore.convertToDisk 一致） */
const fs = require('fs')
const FILE = '/Users/mandy/work/project/risk/SaaS/src/console/templateSeed.json'

function convertToDisk(t) {
  const tab = (v) => t.sections.filter((s) => (s.homeTab ?? 'content') === v)
  return {
    id: t.id,
    basic: {
      name: t.name, reportType: t.reportType, scope: t.scope, status: t.status, isDefault: t.isDefault,
      description: t.description, version: t.version, lastEditor: t.lastEditor, lastEditTime: t.lastEditTime,
      showOpLog: t.showOpLog, showSectionTotals: t.showSectionTotals,
    },
    content: { sections: t.sections.filter((s) => { const h = s.homeTab ?? 'content'; return h !== 'score' && h !== 'flow' }) },
    autoReview: {
      sections: tab('score'),
      scoreBlock: t.scoreBlock, scoreDisplay: t.scoreDisplay, scoreFormula: t.scoreFormula, specialRules: t.specialRules,
    },
    manualReview: {
      sections: tab('flow'),
      flowBlock: t.flowBlock, businessFlow: t.businessFlow,
    },
    theme: t.theme, export: t.export, changeLogs: t.changeLogs, demoApplicant: t.demoApplicant,
  }
}

const data = JSON.parse(fs.readFileSync(FILE, 'utf-8'))
const out = data.map(convertToDisk)
fs.writeFileSync(FILE, JSON.stringify(out, null, 2), 'utf-8')
console.log('OK 迁移完成，模板数:', out.length)
// 校验
const back = JSON.parse(fs.readFileSync(FILE, 'utf-8'))
const x = back.find(v => v.id === 'tpl-info-backup222')
console.log('示例模板字段:', Object.keys(x).join(', '))
console.log('content.sections:', (x.content?.sections ?? []).map(s => s.id).join(', '))
console.log('autoReview.sections:', (x.autoReview?.sections ?? []).map(s => s.id).join(', '))
console.log('manualReview.sections:', (x.manualReview?.sections ?? []).map(s => s.id).join(', '))
