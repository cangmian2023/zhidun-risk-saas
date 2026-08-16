const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const page = await browser.newPage({ viewport: { width: 1500, height: 950 } });
  page.on('pageerror', (e) => console.log('[PAGEERROR] ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('[CONSOLE.error] ' + m.text()); });
  try { await page.goto('http://localhost:5174/login', { waitUntil: 'domcontentloaded' }); } catch (e) {}
  await page.evaluate(() => localStorage.setItem('zdrk_user', JSON.stringify({ username: 'admin', name: '系统管理员', role: '风控管理员', org: '风控部' })));
  await page.waitForTimeout(300);

  // 策略详情 - 活动风险分级表
  await page.goto('http://localhost:5174/console/de/policy-edit?mid=M-001&pid=P-101', { waitUntil: 'networkidle', timeout: 20000 });
  await page.waitForTimeout(1800);
  console.log('=== 页面 BODY 前200 ===');
  console.log((await page.evaluate(() => document.body.innerText.slice(0, 200))).replace(/\n/g, ' | '));

  // 检查特征库下拉是否存在（「从特征库选择」placeholder）
  const fieldSel = await page.locator('select').count();
  console.log('=== select 数量 ===', fieldSel);
  // 检查是否出现特征名下拉选项（优惠券面值）
  const bodyText = await page.evaluate(() => document.body.innerText);
  console.log('=== 含「优惠券面值」字段选项 ===', bodyText.includes('优惠券面值'));
  console.log('=== 含标准化表达式显示 ===', bodyText.includes('coupon_value >= 100'));

  // 截图
  await page.screenshot({ path: '_diag_policy.png' });
  await browser.close();
})();
