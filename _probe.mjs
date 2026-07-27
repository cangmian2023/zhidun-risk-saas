import { chromium } from 'playwright';

const EXE = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const url = 'http://localhost:5173/console/cr/report-template';
const logs = [];
const browser = await chromium.launch({ executablePath: EXE, args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push('[' + m.type() + '] ' + m.text()); });
page.on('pageerror', (e) => logs.push('[pageerror] ' + e.message));

await page.addInitScript(() => {
  localStorage.setItem('zdrk_user', JSON.stringify({ username: 'admin', name: '系统管理员', role: '风控管理员', org: '测试' }));
});

async function shot(name) { await page.screenshot({ path: '/tmp/shot_' + name + '.png', fullPage: false }); }
async function snap(label) {
  const txt = await page.evaluate(() => document.body.innerText.slice(0, 900)).catch(() => '(err)');
  console.log('--- SNAP ' + label + ' ---\n' + txt);
}
async function safe(label, fn) { try { await fn(); } catch (e) { logs.push('[' + label + '] ' + e.message); } }
async function clickText(t, exact = true) {
  const el = page.getByText(t, { exact }).first();
  await el.click();
}

await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
await page.waitForTimeout(1200);
console.log('=== FINAL URL === ' + page.url());
await snap('list');
await shot('list');

// 列表筛选：选报告类型后看筛选条是否横向排列
await safe('filter-type', async () => {
  await page.getByText('全部报告类型', { exact: true }).first().click();
  await page.waitForTimeout(200);
  await page.getByText('信用风控', { exact: true }).first().click();
  await page.waitForTimeout(400);
  await shot('list_filtered');
});
// 复位筛选
await safe('filter-reset', async () => {
  await page.getByText('信用风控', { exact: true }).first().click();
  await page.waitForTimeout(150);
  await page.getByText('全部报告类型', { exact: true }).first().click();
  await page.waitForTimeout(300);
});

await safe('enter-detail', async () => {
  await page.getByRole('button', { name: '配置' }).first().click();
  await page.waitForTimeout(800);
});
await snap('detail');
await shot('detail');

// 各 Tab
for (const tab of ['报告内容', '评分方案', '业务流程', '样式主题', '导出模板']) {
  await safe('tab-' + tab, async () => {
    await clickText(tab, true);
    await page.waitForTimeout(500);
    await shot('tab_' + tab);
  });
}

// 报告内容 Tab：展开字段 + 取消一个字段，看预览是否联动
await safe('toggle-field', async () => {
  await clickText('报告内容', true);
  await page.waitForTimeout(300);
  const exp = page.getByText('展开字段').first();
  if (await exp.count()) { await exp.click(); await page.waitForTimeout(300); }
  await shot('section_expanded');
});

// 实时预览：切换角色 + 切换预览状态
await safe('preview-role', async () => {
  await page.getByText('风控专员', { exact: true }).first().click();
  await page.waitForTimeout(200);
  await page.getByText('系统管理员', { exact: true }).first().click();
  await page.waitForTimeout(300);
  await shot('preview_role_admin');
});
await safe('preview-state', async () => {
  const st = page.getByRole('button', { name: '高危' }).first();
  if (await st.count()) { await st.click(); await page.waitForTimeout(400); }
  await shot('preview_high');
});

// 新建模板弹窗
await safe('new-modal', async () => {
  await page.getByRole('button', { name: '＋ 新建模板' }).first().click();
  await page.waitForTimeout(400);
  await shot('new_modal');
});

console.log('=== CONSOLE ERRORS/WARNINGS ===');
console.log(logs.join('\n---\n') || '(none)');
await browser.close();
