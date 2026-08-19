const fs = require('fs');
const d = 'd:/yuexin/project/risk/saas/record/qixin';
const dir = d+'/营销 - 科创金融_files';
let all = '';
for (const f of fs.readdirSync(dir)) {
  const p = dir + '/' + f;
  if (fs.statSync(p).isDirectory()) continue;
  if (f.endsWith('.css')) all += fs.readFileSync(p,'utf8') + '\n';
}
// search patterns (maybe minified to .company-name-link or with suffix)
['company-name-link','tech-innovate-search','tech-innovate-layout','content-table-wrp','card-list-wrp','search-wrapper','tech-search-result'].forEach(k=>{
  console.log(k, '=', all.includes(k));
});
// also check the home page dump itself - does home dump use these classes? maybe 企业库 css only loads on that tab
const homeDump = fs.readFileSync(d+'/营销 - 科创金融','utf8');
console.log('\nHOME dump uses tech-innovate-search:', homeDump.includes('tech-innovate-search'));
console.log('HOME dump uses company-name-link:', homeDump.includes('company-name-link'));
// Maybe the css is in a DIFFERENT _files not under main - check 科创企业库_files nonexistent. 
// Check if there's a combined css elsewhere: grep all _files across qixin for tech-innovate-search-layout-wrp
console.log('\n--- scan ALL qixin _files for tech-innovate-search-layout-wrp ---');
const root = d;
let found = [];
for (const sub of fs.readdirSync(root)) {
  if (sub.endsWith('_files')) {
    const sd = root + '/' + sub;
    const files = fs.readdirSync(sd).filter(x=>x.endsWith('.css'));
    for (const cf of files) {
      const c = fs.readFileSync(sd+'/'+cf,'utf8');
      if (c.includes('tech-innovate-search-layout-wrp') || c.includes('company-name-link')) found.push(sub+'/'+cf);
    }
  }
}
console.log('files containing 企业库 css:', found.join('\n'));
