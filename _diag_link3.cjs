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
  } catch (e) {}
  await page.waitForTimeout(2500);

  const initialPaths = await page.locator('svg path[marker-end]').count();
  console.log('=== 初始连线数 ===', initialPaths);

  // 通过圆点 title 定位：「从此节点开始连线」
  const linkPoints = await page.locator('[title="从此节点开始连线"]').count();
  console.log('=== 圆点数量（hover前，被隐藏不可见） ===', linkPoints);

  // 选一个节点 hover，强制显示圆点
  const mergeNode = page.locator('text=合并汇流').first();
  const box = await mergeNode.boundingBox();
  console.log('merge 节点 bbox=', box);
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.waitForTimeout(500);
  }
  // 现在点击 merge 节点的右侧圆点
  const linkPoint = page.locator('[title="从此节点开始连线"]').nth(2); // 假设 merge 是第3个节点
  console.log('linkPoint count=', await page.locator('[title="从此节点开始连线"]').count());
  // 简化：直接用第3个圆点（mg1 在第9个节点左右，索引约 8）
  await page.locator('[title="从此节点开始连线"]').nth(8).click({ force: true });
  await page.waitForTimeout(800);
  console.log('=== 点完圆点后 toolbar ===');
  const toolbarText = await page.locator('text=连线中').count();
  console.log('「连线中」出现:', toolbarText > 0);

  // 移动鼠标 + 点另一个节点
  const endNode = page.locator('text=结束').first();
  const eb = await endNode.boundingBox();
  if (eb) {
    await page.mouse.move(eb.x + eb.width / 2, eb.y + eb.height / 2);
    await page.waitForTimeout(400);
  }
  await endNode.click({ force: true });
  await page.waitForTimeout(800);

  const afterPaths = await page.locator('svg path[marker-end]').count();
  console.log('=== 连线后 svg marker-end path 数 ===', afterPaths);
  console.log('=== 是否新增连线 ===', afterPaths > initialPaths);

  try { await page.screenshot({ path: '_diag_link_after.png' }); } catch (e) {}
  await browser.close();
})();
