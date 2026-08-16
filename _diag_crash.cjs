const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on('pageerror', (err) => errors.push('PAGEERROR: ' + err.message));
  page.on('console', (msg) => { if (msg.type() === 'error' && !msg.text().includes('validateDOMNesting')) errors.push('CONSOLE: ' + msg.text()); });

  try { await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' }); } catch (e) {}
  await page.evaluate(() => localStorage.setItem('zdrk_user', JSON.stringify({ username: 'admin', name: '系统管理员', role: '风控管理员', org: '风控部' })));
  await page.waitForTimeout(300);

  try {
    await page.goto('http://localhost:5174/console/de/flow-edit?mid=M-001&fid=DF-1', { waitUntil: 'networkidle', timeout: 20000 });
  } catch (e) { errors.push('GOTO: ' + e.message); }
  await page.waitForTimeout(2500);
  console.log('=== 编辑页加载后 errors ===');
  errors.splice(0).forEach((e) => console.log('  ' + e));

  // 1. 点第一个节点（画布内），看属性面板
  try {
    const node = page.locator('div[style*="grab"]').first();
    const cnt = await node.count();
    console.log('=== 画布节点数 ===', cnt);
    if (cnt > 0) {
      await node.first().click({ force: true });
      await page.waitForTimeout(1200);
      console.log('=== 点击节点后 BODY 前200 ===');
      console.log((await page.evaluate(() => document.body.innerText.slice(0, 200))).replace(/\n/g, ' | '));
      console.log('=== 点击节点后 errors ===');
      errors.splice(0).forEach((e) => console.log('  ' + e));
    }
  } catch (e) { errors.push('CLICK NODE: ' + e.message); }

  // 2. 连线模式
  try {
    await page.getByRole('button', { name: '连线模式' }).first().click({ force: true });
    await page.waitForTimeout(800);
    console.log('=== 点击连线模式后 errors ===');
    errors.splice(0).forEach((e) => console.log('  ' + e));
  } catch (e) { errors.push('CLICK LINKMODE: ' + e.message); }

  // 3. 截图
  try { await page.screenshot({ path: '_diag_shot.png' }); console.log('=== 截图 _diag_shot.png ==='); } catch (e) {}
  await browser.close();
})();
