/* 一次性脚本：为 信用风控/欺诈识别/进件审核 三个模块生成
 *  {key}VerifyData.json（列表 12 行）+ {key}VerifySample.json（默认样例）+ {key}VerifyDetailData.json（A/B/C 样例池）
 *  dataBlocks 的 id 与模板 tpl-*-222 的 content sections 对齐；得分按各模块分段区间设计，
 *  使 A 池总分落 A 段（通过）、B 池落 B 段（转人工）、C 池落 C 段（拒绝）。 */
import fs from 'node:fs'
import path from 'node:path'

const DIR = '/Users/mandy/work/project/risk/SaaS/src/console'
const disk = JSON.parse(fs.readFileSync(path.join(DIR, 'templateSeed.json'), 'utf-8'))

/* 字段名（name）从模板 fields 读取，保证与配置一致 */
const tplFields = (tplId, secId) => {
  const t = disk.find((x) => x.id === tplId)
  const sec = [...(t.content?.sections ?? [])].find((s) => s.id === secId)
  return (sec?.fields ?? []).filter((f) => f.visible !== false).map((f) => f.name)
}

const M = {
  credit: {
    tplId: 'tpl-credit-222', idPrefix: 'CR-20260801', status0: '待审核', prod: ['信用贷', '抵押贷', '经营贷'],
    plan: {
      A: { applicant_info: 12, credit_overview: 5, credit_factors: 5, credit_trend: 3, credit_radar: 3, credit_suggestion: 2, history_records: 1 },
      B: { applicant_info: 8, credit_overview: 3, credit_factors: 4, credit_trend: 2, credit_radar: 1, credit_suggestion: 1, history_records: 0 },
      C: { applicant_info: 4, credit_overview: 1, credit_factors: 2, credit_trend: 0, credit_radar: 0, credit_suggestion: 1, history_records: 0 },
    },
  },
  fraud: {
    tplId: 'tpl-fraud-222', idPrefix: 'FR-20260801', status0: '待确认', prod: ['信用贷', '抵押贷', '经营贷'],
    plan: {
      A: { basic_info: 6, identity_fraud: 0, info_forgery: 0, device_fraud: 1, behavior_fraud: 0, gang_fraud: 0, blacklist_hit: 0, history_fraud: 0 },
      B: { basic_info: 6, identity_fraud: 3, info_forgery: 3, device_fraud: 5, behavior_fraud: 4, gang_fraud: 3, blacklist_hit: 2, history_fraud: 1 },
      C: { basic_info: 6, identity_fraud: 5, info_forgery: 5, device_fraud: 9, behavior_fraud: 8, gang_fraud: 8, blacklist_hit: 7, history_fraud: 1 },
    },
  },
  decision: {
    tplId: 'tpl-decision-222', idPrefix: 'DC-20260801', status0: '待审批', prod: ['信用贷', '抵押贷', '经营贷'],
    plan: {
      A: { applicant_info: 12, verify_summary: 3, credit_summary: 3, fraud_summary: 3 },
      B: { applicant_info: 6, verify_summary: 3, credit_summary: 2, fraud_summary: 1 },
      C: { applicant_info: 3, verify_summary: 1, credit_summary: 0, fraud_summary: 0 },
    },
  },
}

/* data_source 段 → groups 单组（基础资料） */
function dsBlock(id, name, fields, hitCount, scoreEach = 5) {
  const items = fields.map((f, i) => ({ field: f, value: '—', valid: i < hitCount, score: i < hitCount ? scoreEach : 0 }))
  return { id, type: 'data_source', name, groups: [{ name: '基础资料', items }] }
}
/* api 段 → items（name/type/value/valid/score） */
function apiBlock(id, name, fields, hitCount, valueOf = (f) => '—') {
  const items = fields.map((f, i) => ({ name: f, type: 'text', value: valueOf(f), valid: i < hitCount, score: i < hitCount ? 5 : 0 }))
  return { id, type: 'api', name, items }
}
/* rule_set 段 → items（name/conclusion/score/callStatus/...） */
function rsBlock(id, name, fields, hitCount) {
  const items = fields.map((f, i) => {
    const hit = i < hitCount
    return {
      name: f, conclusion: hit ? '拒绝' : '通过', score: hit ? 5 : 0, callStatus: 'success',
      costMs: 120 + i * 23, verifyTime: '2026-08-02 15:00:12', channel: 'api-v3',
      items: [{ label: '核验项', value: hit ? '命中' : '未命中', status: hit ? 'fail' : 'pass' }],
    }
  })
  return { id, type: 'rule_set', name, items }
}

function makeSample(mod, grade) {
  const tplId = mod.tplId
  const plan = mod.plan[grade]
  const blocks = []
  for (const [secId, hit] of Object.entries(plan)) {
    const fields = tplFields(tplId, secId)
    const secName = fields.length ? secId : secId // name 由渲染层从模板取，JSON 里留 secId 名
    if (secId === 'identity_fraud' || secId === 'info_forgery') blocks.push(rsBlock(secId, secName, fields, hit))
    else if (secId === 'verify_summary' || secId === 'credit_summary' || secId === 'fraud_summary' || secId === 'credit_suggestion') {
      blocks.push(apiBlock(secId, secName, fields, hit, (f) => (f.includes('结论') ? (hit > 0 ? '通过' : '未通过') : f.includes('建议') ? '同意' : '—')))
    }
    else blocks.push(dsBlock(secId, secName, fields, hit))
  }
  const n = { A: '张伟', B: '李娜', C: '王强' }[grade]
  const pid = { A: '3301**********1234', B: '3301**********5678', C: '3301**********9012' }[grade]
  const phone = { A: '138****6688', B: '139****2345', C: '137****6789' }[grade]
  return {
    reportId: `${mod.idPrefix}-${grade}`,
    computedAt: '2026-08-02 15:00:22',
    applicant: { 姓名: n, 证件号: pid, 手机号: phone, 银行卡: '6222********1234', 申请产品: '信用贷', 申请额度: 80000 },
    dataBlocks: blocks,
    opLogs: [
      { time: '2026-08-02 15:00:22', actor: '系统', action: '生成报告', detail: '风控策略集 V2.6 自动生成' },
      { time: '2026-08-02 15:00:31', actor: '系统', action: '自动审核', detail: `结论 ${grade}` },
    ],
    specialRules: [],
  }
}

/* 列表 12 行：处理中 1 / 通过 3 / 转人工 5 / 拒绝 3 */
const NAMES = ['张伟', '李娜', '王强', '赵敏', '陈杰', '刘洋', '周静', '吴磊', '郑爽', '孙浩', '钱芳', '马超']
function makeList(mod) {
  const sys = ['处理中', '通过', '通过', '通过', '转人工', '转人工', '转人工', '转人工', '转人工', '拒绝', '拒绝', '拒绝']
  return NAMES.map((n, i) => ({
    id: `${mod.idPrefix}-${String(i + 1).padStart(3, '0')}`,
    name: n,
    product: mod.prod[i % 3],
    channel: ['APP', 'H5', '小程序', '线下'][i % 4],
    amount: [50000, 80000, 120000, 150000, 300000, 60000, 90000, 180000, 100000, 70000, 200000, 250000][i],
    fraudScore: 8 + (i % 5),
    creditScore: 600 + (i % 5) * 40,
    sysResult: sys[i],
    workStatus: sys[i] === '处理中' ? null : mod.status0,
    operator: null,
    auditTime: `2026-08-01 ${String(9 + i).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
  }))
}

for (const [key, mod] of Object.entries(M)) {
  fs.writeFileSync(path.join(DIR, `${key}VerifyData.json`), JSON.stringify(makeList(mod), null, 2) + '\n', 'utf-8')
  fs.writeFileSync(path.join(DIR, `${key}VerifySample.json`), JSON.stringify(makeSample(mod, 'A'), null, 2) + '\n', 'utf-8')
  const pool = {}
  for (const g of ['A', 'B', 'C']) pool[g] = makeSample(mod, g)
  fs.writeFileSync(path.join(DIR, `${key}VerifyDetailData.json`), JSON.stringify(pool, null, 2) + '\n', 'utf-8')
  console.log(`✅ ${key}: 列表 ${makeList(mod).length} 行 / 默认样例 + A/B/C 池`)
}

/* 校验：A/B/C 池总分落段 */
const sum = (arr) => (arr ?? []).reduce((a, x) => a + (typeof x.score === 'number' ? x.score : 0), 0)
for (const [key, mod] of Object.entries(M)) {
  const t = disk.find((x) => x.id === mod.tplId)
  const grades = t.autoReview.scoreDisplay.grades
  const formula = t.autoReview.scoreFormula
  const pool = JSON.parse(fs.readFileSync(path.join(DIR, `${key}VerifyDetailData.json`), 'utf-8'))
  for (const g of ['A', 'B', 'C']) {
    const blocks = pool[g].dataBlocks
    const sv = {}
    for (const b of blocks) {
      sv['sec_' + b.id] = b.groups ? b.groups.reduce((a, grp) => a + sum(grp.items), 0) : sum(b.items)
    }
    let total = 0
    for (const term of formula?.terms ?? []) {
      const base = term.kind === 'var' ? (sv[term.varId] ?? 0) : (term.constVal ?? 0)
      total += (term.op === '-' ? -1 : 1) * term.factor * base
    }
    const seg = grades.find((x) => total >= x.minScore && total <= x.maxScore)
    console.log(`  ${key} ${g} 池 总分=${Math.round(total)} → ${seg ? seg.grade + '(' + seg.autoResult + ')' : '❌ 无分段'}（段 ${seg ? seg.minScore + '~' + seg.maxScore : '-'}）`)
  }
}
