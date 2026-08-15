const { chromium } = require('playwright')
const BASE = 'http://127.0.0.1:5174'
const USER = { username: 'admin', name: '系统管理员', role: '风控管理员', org: '信贷风控云服务 · 消费金融企业客户' }
const initScript = `localStorage.setItem('zdrk_user', ${JSON.stringify(JSON.stringify(USER))});`

const urls = [
  '/console/de/overview',
  '/console/de/model-manage',
  '/console/de/feature-lib',
  '/console/de/feature-monitor',
  '/console/de/list-lib',
  '/console/de/template-market',
  '/console/de/template-detail?id=9006',
  '/console/de/version-manage',
  '/console/de/traffic-split',
  '/console/de/decision-replay',
  '/console/de/batch-decision',
  '/console/de/approval-manage',
  '/console/de/alert-manage',
  '/console/de/decision-log',
  '/console/de/model-detail?mid=M-001',
  '/console/de/approval-detail?id=AP-1',
  '/console/de/log-detail?id=1',
  '/console/de/alert-detail?id=AL-1001',
  '/console/de/batch-detail?id=B-1001',
]

;(async () => {
  const browser = await chromium.launch({ channel: 'chrome' })
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 900 } })
  await ctx.addInitScript(initScript)
  const page = await ctx.newPage()
  let fail = 0
  for (const u of urls) {
    const logs = []
    const onErr = (e) => logs.push(e.message)
    const onConsole = (m) => { if (m.type() === 'error') logs.push(m.text()) }
    page.on('pageerror', onErr)
    page.on('console', onConsole)
    await page.goto(BASE + u, { waitUntil: 'load' })
    await page.waitForTimeout(600)
    const len = await page.evaluate(() => document.body.innerText.length)
    const err = logs.length
    if (!len || err) fail++
    console.log(`[${err ? 'ERR' : len ? 'OK ' : 'EMPTY'}] ${u} len=${len}${err ? ' ' + JSON.stringify(logs) : ''}`)
    page.off('pageerror', onErr)
    page.off('console', onConsole)
  }
  await browser.close()
  console.log(fail ? `DONE (${fail} 有问题)` : 'DONE 全部通过')
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
