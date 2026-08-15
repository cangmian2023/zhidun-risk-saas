const { chromium } = require('playwright')
const BASE = 'http://127.0.0.1:5174'
const USER = { username: 'admin', name: '系统管理员', role: '风控管理员', org: '信贷风控云服务 · 消费金融企业客户' }
const initScript = `localStorage.setItem('zdrk_user', ${JSON.stringify(JSON.stringify(USER))});`

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 } })
  await ctx.addInitScript(initScript)
  const page = await ctx.newPage()
  const logs = []
  page.on('pageerror', (e) => logs.push(`[pageerror] ${e.message}`))
  page.on('console', (m) => { if (m.type() === 'error') logs.push(`[console] ${m.text()}`) })

  // 批量决策列表 → 详情
  await page.goto(BASE + '/console/de/batch-decision', { waitUntil: 'load' })
  await page.waitForTimeout(700)
  let t = await page.evaluate(() => document.body.innerText)
  console.log('[批量列表]', JSON.stringify({ flowCol: t.includes('流程状态'), hasTask: t.includes('8月客群批量跑分') }))
  await page.evaluate(() => { const el = Array.from(document.querySelectorAll('span')).find((x) => x.textContent?.trim() === '8月客群批量跑分'); el?.click() })
  await page.waitForTimeout(700)
  t = await page.evaluate(() => document.body.innerText)
  console.log('[批量详情]', JSON.stringify({ url: page.url().includes('batch-detail'), back: t.includes('返回列表') && t.includes('批量任务详情'), info: t.includes('任务信息') && t.includes('任务进度') && t.includes('8月客群批量跑分') }))

  // 决策回放列表 → 结果
  await page.goto(BASE + '/console/de/decision-replay', { waitUntil: 'load' })
  await page.waitForTimeout(700)
  t = await page.evaluate(() => document.body.innerText)
  console.log('[回放列表]', JSON.stringify({ flowCol: t.includes('流程状态'), hasTask: t.includes('灰度对比回放') }))
  await page.evaluate(() => { const el = Array.from(document.querySelectorAll('span')).find((x) => x.textContent?.trim() === '灰度对比回放'); el?.click() })
  await page.waitForTimeout(700)
  console.log('[回放结果URL]', page.url().includes('replay-result'))

  // 名单库列表
  await page.goto(BASE + '/console/de/list-lib', { waitUntil: 'load' })
  await page.waitForTimeout(700)
  t = await page.evaluate(() => document.body.innerText)
  console.log('[名单列表]', JSON.stringify({ flowCol: t.includes('流程状态'), hasList: t.includes('中介号码名单') }))

  // 特征库列表
  await page.goto(BASE + '/console/de/feature-lib', { waitUntil: 'load' })
  await page.waitForTimeout(700)
  t = await page.evaluate(() => document.body.innerText)
  console.log('[特征库列表]', JSON.stringify({ flowCol: t.includes('流程状态'), hasFeat: t.includes('账号注册小时数') }))

  console.log('ERRORS:', logs.length ? JSON.stringify(logs) : 'none')
  await browser.close()
  console.log('DONE')
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
