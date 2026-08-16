const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('console', (msg) => { console.log('[CONSOLE.' + msg.type() + '] ' + msg.text()); });
  page.on('pageerror', (err) => console.log('[PAGEERROR] ' + err.message));

  try { await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' }); } catch (e) {}
  await page.evaluate(() => localStorage.setItem('zdrk_user', JSON.stringify({ username: 'admin', name: '系统管理员', role: '风控管理员', org: '风控部' })));
  await page.waitForTimeout(300);

  try {
    await page.goto('http://localhost:5174/console/de/flow-edit?mid=M-001&fid=DF-1', { waitUntil: 'networkidle', timeout: 20000 });
  } catch (e) {}
  await page.waitForTimeout(2500);
  console.log('=== 页面加载完成，开始操作 ===');

  // 点击连线模式按钮
  const btn = page.getByRole('button', { name: /连线模式/ }).first();
  console.log('连线模式按钮 count=', await btn.count());
  await btn.click({ force: true });
  await page.waitForTimeout(500);
  const btnText = await btn.textContent();
  console.log('点击后按钮文字=', btnText);

  // 点击 名单匹配
  const n1 = page.locator('text=名单匹配').first();
  console.log('n1 count=', await n1.count());
  if (await n1.count() > 0) { await n1.click({ force: true }); console.log('已点击 名单匹配'); }
  await page.waitForTimeout(600);

  // 点击 账号质量策略
  const n2 = page.locator('text=账号质量策略').first();
  console.log('n2 count=', await n2.count());
  if (await n2.count() > 0) { await n2.click({ force: true }); console.log('已点击 账号质量策略'); }
  await page.waitForTimeout(600);

  const linkPanel = await page.locator('text=连线属性').count();
  console.log('=== 连线属性面板数量 ===', linkPanel);
  await browser.close();
})();
