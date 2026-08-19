const fs = require('fs');
const d = 'd:/yuexin/project/risk/saas/record/qixin';

// What is 营销 - 科创金融 - 科创企业库.html actually?
const f = fs.readFileSync(d+'/营销 - 科创金融 - 科创企业库.html','utf8');
console.log('=== 科创企业库.html ===');
console.log('len', f.length, 'links', (f.match(/<link/g)||[]).length, 'styles', (f.match(/<style/g)||[]).length, 'scripts', (f.match(/<script/g)||[]).length);
console.log('first 600:', f.slice(0,600));
console.log('has <html', f.includes('<html'), 'has <body', f.includes('<body'), 'has <head', f.includes('<head'));
// maybe it has inline style attributes
console.log('style= attrs:', (f.match(/style="/g)||[]).length);

// Check main html's _files for 企业库-specific classes
const mainHtml = fs.readFileSync(d+'/营销 - 科创金融.html','utf8');
const mainLinks = [...mainHtml.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>m[1]);
console.log('\n=== MAIN html css links:', mainLinks.length, '===');
mainLinks.slice(0,10).forEach(l=>console.log('  ', l));
// Does main _files dir exist?
const mainDir = d+'/营销 - 科创金融_files';
console.log('main _files exists:', fs.existsSync(mainDir));
if (fs.existsSync(mainDir)) console.log('  ', fs.readdirSync(mainDir).slice(0,10).join(' | '));
