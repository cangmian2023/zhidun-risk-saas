const { chromium } = require('playwright')
const fs = require('fs')

const BASE = 'http://localhost:5174'
const OUT = '/Users/mandy/work/project/risk/SaaS/screenshots'
fs.mkdirSync(OUT, { recursive: true })

const USER = {
  username: 'admin',
  name: '系统管理员',
  role: '风控管理员',
  org: '信贷风控云服务 · 消费金融企业客户',
}
// 在每个页面加载前注入登录态，绕过 RequireAuth 守卫
const initScript = `localStorage.setItem('zdrk_user', ${JSON.stringify(JSON.stringify(USER))});`

const shots = [
  { name: 'list-1-viewport', url: BASE + '/console/cr/pre-verify', full: false },
  { name: 'list-2-fullpage', url: BASE + '/console/cr/pre-verify', full: true },
  { name: 'detail-1-reject', url: BASE + '/console/cr/pre-verify-detail?id=REJECT', full: false },
  { name: 'detail-2-manual', url: BASE + '/console/cr/pre-verify-detail?id=MANUAL', full: false },
]

;(async () => {
  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  })
  await ctx.addInitScript(initScript)
  const page = await ctx.newPage()

  for (const s of shots) {
    await page.goto(s.url, { waitUntil: 'load' })
    await page.waitForTimeout(1500)
    await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full })
    console.log('shot done:', s.name)
  }
  await browser.close()
  console.log('ALL DONE')
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
