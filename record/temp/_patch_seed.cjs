const fs=require('fs');
const f='src/console/midData.ts';
let s=fs.readFileSync(f,'utf8');
const start=s.indexOf('export const SEED_DASHBOARDS:');
if(start<0){console.error('SEED_DASHBOARDS not found');process.exit(1);}
// 找到 start 之后的第一个 '];' 作为结束
const end=s.indexOf('\n];', start);
if(end<0){console.error('end not found');process.exit(1);}
const before=s.slice(0,start);
const after=s.slice(end+3);
const repl="export { SEED_DASHBOARDS } from './midDashboardSeed';\n";
fs.writeFileSync(f, before+repl+after);
console.log('replaced inline SEED_DASHBOARDS with re-export; before.len',start,'after.len',after.length);
