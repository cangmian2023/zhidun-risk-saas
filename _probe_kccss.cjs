const fs = require('fs');
const d = 'd:/yuexin/project/risk/saas/record/qixin';

// The no-suffix dump for 科创企业库 - it has 0 <link>/<style>/<script> per earlier probe.
// That means ALL styling comes from the .html CSS source.
// Let me check what classes the no-suffix dump uses and whether the .html CSS covers them.

const dump = fs.readFileSync(d+'/营销 - 科创金融 - 科创企业库','utf8');
const cls = new Set();
for (const m of dump.matchAll(/class="([^"]+)"/g)) {
  m[1].split(/\s+/).forEach(c => c && cls.add(c));
}
const arr = [...cls].sort();
console.log('DUMP total distinct classes:', arr.length);

// Collect all CSS from the .html + _files
function scanCssDir(dir){
  let txt = '';
  const files = fs.readdirSync(dir);
  for (const f of files){
    const p = dir + '/' + f;
    if (fs.statSync(p).isDirectory()) txt += scanCssDir(p);
    else if (f.endsWith('.css')) { try { txt += fs.readFileSync(p,'utf8'); } catch(e){} }
  }
  return txt;
}
const html = fs.readFileSync(d+'/营销 - 科创金融 - 科创企业库.html','utf8');
// extract inline <style> from html
let inline = '';
for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) inline += m[1];
const cssDir = d+'/营销 - 科创金融 - 科创企业库_files';
let fileCss = '';
if (fs.existsSync(cssDir)) fileCss = scanCssDir(cssDir);
const allCss = inline + fileCss;
console.log('CSS total length:', allCss.length, '(inline '+inline.length+', dir '+fileCss.length+')');

// Check which dump classes are NOT covered by any CSS rule
const missing = arr.filter(c => !allCss.includes('.' + c));
console.log('\nClasses with NO css rule (missing):', missing.length);
console.log(missing.slice(0, 80).join('\n'));
