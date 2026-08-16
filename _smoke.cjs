const esbuild = require('esbuild');
const fs = require('fs');
const files = ['src/console/scoreData.ts', 'src/console/CustScoreDetail.tsx'];
for (const f of files) {
  try {
    esbuild.transformSync(fs.readFileSync(f, 'utf-8'), { loader: f.endsWith('.tsx') ? 'tsx' : 'ts' });
    console.log('SYNTAX_OK', f);
  } catch (e) {
    console.log('SYNTAX_ERR', f, String(e.message).split('\n')[0]);
  }
}
