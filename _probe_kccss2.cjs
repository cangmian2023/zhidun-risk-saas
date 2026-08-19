const fs = require('fs');
const d = 'd:/yuexin/project/risk/saas/record/qixin';
const html = fs.readFileSync(d+'/营销 - 科创金融 - 科创企业库.html','utf8');
console.log('HTML len:', html.length);
const links = [...html.matchAll(/<link[^>]*>/g)].map(m=>m[0]);
console.log('LINK tags:', links.length);
links.slice(0, 20).forEach(l => console.log('  ', l.slice(0, 200)));
console.log('\nstyles:', (html.match(/<style/g)||[]).length);
// Does _files exist?
const dir = d+'/营销 - 科创金融 - 科创企业库_files';
console.log('_files exists:', fs.existsSync(dir));
if (fs.existsSync(dir)) {
  console.log('  entries:', fs.readdirSync(dir).slice(0,15).join(' | '));
}
// How does extractCss in qixinRuntime parse links? Let me check the link href format
const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]).filter(h=>h.endsWith('.css'));
console.log('\ncss hrefs:', hrefs.length);
hrefs.slice(0,10).forEach(h=>console.log('  ', h));
