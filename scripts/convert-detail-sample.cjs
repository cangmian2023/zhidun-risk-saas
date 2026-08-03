/* 一次性迁移：信息核验222 详情样例 JSON 旧结构 → dataBlocks 新结构
 * 旧: { reportId, computedAt, applicant, basic_info:{组名:[items]}, id_images:[], single_verify:[], cross_fusion:[], op_logs:[], specialRules:[] }
 * 新: { reportId, computedAt, applicant, dataBlocks:[{id,type,name,groups?|items}], opLogs:[], specialRules:[] }
 * 无损：只重组结构 + 补统一字段默认值（cross_fusion 补 callStatus/verifyTime/channel），不丢原值
 */
const fs = require('fs')
const DIR = '/Users/mandy/work/project/risk/SaaS/src/console'

const BLOCK_META = {
  basic_info:   { type: 'data_source', name: '用户基本信息' },
  id_images:    { type: 'api',         name: '用户证件照' },
  single_verify:{ type: 'rule_set',    name: '多源并行核验单项报告' },
  cross_fusion: { type: 'rule_set',    name: '数据交叉融合综合报告' },
}

function convertDoc(d) {
  const blocks = []
  for (const [id, meta] of Object.entries(BLOCK_META)) {
    const raw = d[id]
    if (raw == null) continue
    if (meta.type === 'data_source') {
      blocks.push({
        id, type: meta.type, name: meta.name,
        groups: Object.entries(raw).map(([gname, items]) => ({ name: gname, items: items ?? [] })),
      })
    } else if (meta.type === 'rule_set') {
      blocks.push({
        id, type: meta.type, name: meta.name,
        items: (raw ?? []).map((r) => ({
          ...r,
          // 统一字段：cross_fusion 旧数据缺 callStatus/verifyTime/channel，补齐默认值
          callStatus: r.callStatus ?? 'success',
          verifyTime: r.verifyTime ?? '',
          channel: r.channel ?? '',
          items: r.items ?? [],
        })),
      })
    } else {
      blocks.push({ id, type: meta.type, name: meta.name, items: raw ?? [] })
    }
  }
  return {
    reportId: d.reportId,
    computedAt: d.computedAt,
    applicant: d.applicant,
    dataBlocks: blocks,
    opLogs: d.op_logs ?? [],
    specialRules: d.specialRules ?? [],
  }
}

// 迁移默认样例
const sample = JSON.parse(fs.readFileSync(DIR + '/infoVerify222Sample.json', 'utf-8'))
fs.writeFileSync(DIR + '/infoVerify222Sample.json', JSON.stringify(convertDoc(sample), null, 2) + '\n', 'utf-8')

// 迁移 A/B/C 样例池
const pool = JSON.parse(fs.readFileSync(DIR + '/infoVerify222DetailData.json', 'utf-8'))
const out = {}
for (const k of Object.keys(pool)) out[k] = convertDoc(pool[k])
fs.writeFileSync(DIR + '/infoVerify222DetailData.json', JSON.stringify(out, null, 2) + '\n', 'utf-8')

console.log('✅ 迁移完成')
// 打印示例
const s2 = JSON.parse(fs.readFileSync(DIR + '/infoVerify222Sample.json', 'utf-8'))
console.log('新结构顶层:', Object.keys(s2).join(', '))
console.log('dataBlocks:', s2.dataBlocks.map(b => b.id + '(' + b.type + (b.groups ? ' groups:' + b.groups.map(g => g.name + ':' + g.items.length) : ' items:' + (b.items?.length ?? 0)) + ')').join(' | '))
