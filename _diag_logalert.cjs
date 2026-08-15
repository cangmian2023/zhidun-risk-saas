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

  // 决策日志列表 → 详情
  await page.goto(BASE + '/console/de/decision-log', { waitUntil: 'load' })
  await page.waitForTimeout(800)
  let t = await page.evaluate(() => document.body.innerText)
  console.log('[日志列表]', JSON.stringify({ flowCol: t.includes('流程状态'), hasReq: t.includes('REQ-202608140001') }))
  await page.evaluate(() => { const el = Array.from(document.querySelectorAll('code')).find((x) => x.textContent?.trim() === 'REQ-202608140001'); el?.click() })
  await page.waitForTimeout(700)
  t = await page.evaluate(() => document.body.innerText)
  console.log('[日志详情]', JSON.stringify({
    url: page.url().includes('log-detail'), back: t.includes('返回列表') && t.includes('决策日志详情'),
    info: t.includes('日志信息') && t.includes('请求 ID') && t.includes('决策结果') && t.includes('REQ-202608140001'),
    origin: t.includes('原始入参与命中详情'),
  }))

  // 告警列表 → 详情
  await page.goto(BASE + '/console/de/alert-manage', { waitUntil: 'load' })
  await page.waitForTimeout(800)
  await page.evaluate(() => { const b = Array.from(document.querySelectorAll('button')).find((x) => x.textContent?.trim() === '查看'); b?.click() })
  await page.waitForTimeout(700)
  t = await page.evaluate(() => document.body.innerText)
  console.log('[告警详情]', JSON.stringify({
    url: page.url().includes('alert-detail'), back: t.includes('返回列表') && t.includes('告警详情'),
    info: t.includes('告警信息') && t.includes('严重程度') && t.includes('告警描述'),
    trace: t.includes('处置记录') && t.includes('触发告警'),
  }))

  console.log('ERRORS:', logs.length ? JSON.stringify(logs) : 'none')
  await browser.close()
  console.log('DONE')
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
