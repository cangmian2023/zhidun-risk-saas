const fs = require('fs');
const d = 'd:/yuexin/project/risk/saas/record/qixin';

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
const mainCss = scanCssDir(d+'/营销 - 科创金融_files');
console.log('MAIN css length:', mainCss.length);

const dump = fs.readFileSync(d+'/营销 - 科创金融 - 科创企业库','utf8');
const cls = new Set();
for (const m of dump.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach(c => c && cls.add(c));
const arr = [...cls];

// key classes to check
const check = ['company-name-link','app-name-link','qxb-multilevel','qxb-multilevel__tab','name-span','name-wrapper','tech-innovate-layout','tech-innovate-layout-header','content-wrp','content-table-wrp','card-list-wrp','el-tabs__item','el-button','el-cascader'];
check.forEach(c => console.log(c, '->', mainCss.includes('.' + c)));
const missing = arr.filter(c => !mainCss.includes('.' + c));
console.log('\nMISSING in main css:', missing.length);
console.log(missing.slice(0, 60).join('\n'));
