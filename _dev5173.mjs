import { spawn } from 'node:child_process';
import process from 'node:process';

// 切换到 saas 目录，确保 vite 以正确 root 解析 node_modules
process.chdir('D:/yuexin/project/risk/saas');

const child = spawn(
  'C:/Users/admin/.workbuddy/binaries/node/versions/22.22.2/node.exe',
  ['D:/yuexin/project/risk/saas/node_modules/vite/bin/vite.js', '--port', '5173', '--host'],
  { stdio: 'inherit', env: process.env }
);

child.on('exit', (code) => {
  console.log('[dev5173] vite exited with code', code);
  process.exit(code ?? 0);
});
