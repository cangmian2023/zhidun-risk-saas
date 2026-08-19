const fs = require('fs');
const d = 'd:/yuexin/project/risk/saas/record/qixin';
function scanCssDir(dir){
  let txt='';
  for(const f of fs.readdirSync(dir)){const p=dir+'/'+f;if(fs.statSync(p).isDirectory())txt+=scanCssDir(p);else if(f.endsWith('.css')){try{txt+=fs.readFileSync(p,'utf8')}catch(e){}}}
  return txt;
}
const mainCss = scanCssDir(d+'/营销 - 科创金融_files');
// Element-UI + shared chrome classes used by 企业库 dump
const shared = ['el-tabs__item','el-button','el-button--primary','el-input__inner','el-cascader','el-checkbox__inner','el-date-editor','qxb-multilevel','qxb-multilevel__tab','el-dropdown','el-select','el-radio-button','el-table','el-pagination','el-tag'];
console.log('Main css coverage of shared chrome used by 企业库:');
shared.forEach(c=>console.log('  ', c, mainCss.includes('.'+c)));
