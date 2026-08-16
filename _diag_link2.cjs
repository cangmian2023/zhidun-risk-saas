const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (err) => console.log('[PAGEERROR] ' + err.message));
  page.on('console', (msg) => { if (msg.type() === 'error') console.log('[CONSOLE.error] ' + msg.text()); });

  try { await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' }); } catch (e) {}
  await page.evaluate(() => localStorage.setItem('zdrk_user', JSON.stringify({ username: 'admin', name: '系统管理员', role: '风控管理员', org: '风控部' })));
  await page.waitForTimeout(300);

  try {
    await page.goto('http://localhost:5174/console/de/flow-edit?mid=M-001&fid=DF-1', { waitUntil: 'networkidle', timeout: 20000 });
  } catch (e) { console.log('GOTO err: ' + e.message); }
  await page.waitForTimeout(2500);

  // 记录初始连线数（通过 SVG path 数量推断）
  const initialPaths = await page.locator('svg path[marker-end]').count();
  console.log('=== 初始 svg marker-end path 数(连线数) ===', initialPaths);

  // hover 一个节点（merge 合并网关），让其圆点显示
  const target = page.locator('text=合并汇流').first();
  console.log('merge 节点 count=', await target.count());
  if (await target.count() > 0) {
    await target.hover({ force: true });
    await page.waitForTimeout(400);
  }
  try { await page.screenshot({ path: '_diag_link2.png' }); console.log('截图 _diag_link2.png'); } catch (e) {}
  await browser.close();
})();
