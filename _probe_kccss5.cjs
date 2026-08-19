const fs = require('fs');
const d = 'd:/yuexin/project/risk/saas/record/qixin';

function scanCssDir(dir){
  let txt = '';
  for (const f of fs.readdirSync(dir)) {
    const p = dir + '/' + f;
    if (fs.statSync(p).isDirectory()) txt += scanCssDir(p);
    else if (f.endsWith('.css')) { try { txt += fs.readFileSync(p,'utf8'); } catch(e){} }
  }
  return txt;
}
function linksOf(htmlFile){
  const h = fs.readFileSync(d+'/'+htmlFile,'utf8');
  return [...h.matchAll(/<link[^>]+href="([^"]+\.css)"/g)].map(m=>m[1]);
}

const dump = fs.readFileSync(d+'/营销 - 科创金融 - 科创企业库','utf8');
const cls = new Set();
for (const m of dump.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach(c => c && cls.add(c));
const arr = [...cls];
// priority missing layout classes
const must = ['tech-innovate-search-layout-wrp','search-wrapper','content-wrp','content-table-wrp','card-list-wrp','company-name-link','name-span','tech-innovate-layout-header','tech-search-result-block-wrp','list-header-wrp'];

const candidates = ['营销 - 科创金融 - 科创企业库 - 企业概览.html','营销 - 科创金融 - 科创企业库 - 科创力分析.html','营销 - 科创金融 - 科创企业库 - 科创成果分析.html'];
for (const c of candidates) {
  const dir = d + '/' + c.replace('.html','_files');
  let css = '';
  if (fs.existsSync(dir)) css = scanCssDir(dir);
  else {
    // try inline
    const h = fs.readFileSync(d+'/'+c,'utf8');
    for (const m of h.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) css += m[1];
  }
  const covered = must.filter(k => css.includes('.' + k));
  const miss = arr.filter(x => !css.includes('.' + x));
  console.log(c, 'cssLen', css.length, 'MUST covered', covered.length+'/'+must.length, covered.join(','));
  console.log('   total missing of dump:', miss.length);
}
