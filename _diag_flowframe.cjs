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

  // 审批列表页
  await page.goto(BASE + '/console/de/approval-manage', { waitUntil: 'load' })
  await page.waitForTimeout(800)
  let t = await page.evaluate(() => document.body.innerText)
  console.log('[审批列表]', JSON.stringify({
    hasFlowCol: t.includes('流程状态'),
    hasStat: t.includes('待审批') && t.includes('本月通过率'),
    hasDetailBtn: t.includes('详情'),
  }))

  // 点行进入详情页（点目标名称）
  await page.evaluate(() => { const el = Array.from(document.querySelectorAll('span')).find((x) => x.textContent?.trim() === '电商薅羊毛风控'); el?.click() })
  await page.waitForTimeout(700)
  t = await page.evaluate(() => document.body.innerText)
  const url = page.url()
  console.log('[审批详情]', JSON.stringify({
    url: url.includes('approval-detail'),
    hasBack: t.includes('返回列表') && t.includes('审批详情'),
    hasInfo: t.includes('审批信息') && t.includes('目标名称') && t.includes('申请人') && t.includes('电商薅羊毛风控'),
    hasTrace: t.includes('审批记录') && t.includes('提交发布申请'),
    flowHidden: !t.includes('节点时限'),  // 未配置流程 → FlowActionBar 隐藏
  }))

  console.log('ERRORS:', logs.length ? JSON.stringify(logs) : 'none')
  await browser.close()
  console.log('DONE')
})().catch((e) => { console.error('FATAL', e.message); process.exit(1) })
