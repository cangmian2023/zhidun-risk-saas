import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

// 本地 JSON 持久化：所有配置与样例数据保存到 src/console/ 下的 JSON 文件
// 报告模板沿用 templateSeed.json；贷中监控新增 4 个文件
const CFG_DIR = path.resolve(__dirname, 'src/console');
const FILES = {
  templates: 'templateSeed.json',
  'mid-datasources': 'midDataSources.json',
  'mid-metrics': 'midMetrics.json',
  'mid-strategies': 'midStrategies.json',
  'mid-dashboards': 'midDashboards.json',
  'mid-customers': 'midCustomers.json',
  'mid-dispose-tasks': 'midDisposeTasks.json',
  'source-tag': 'sourceTag.json',
};

function persistPlugin() {
  return {
    name: 'persist-json',
    configureServer(server) {
      // 通用端点：midStore 使用 /api/load-mid?file= 与 /api/save-mid?file= 形式（?file= 参数）
      // 白名单限定可访问的本地 JSON 文件；精确匹配 pathname，不干扰下方的 /api/load-<name> 固定路由
      const ALLOWED_FILES = new Set([
        'midDataSources.json', 'midMetrics.json', 'midStrategy.json', 'midDashboards.json',
        'midAlerts.json', 'midCustomers.json', 'midDisposeTasks.json', 'sourceTag.json',
        'midVizSamples.json',
        // 元数据管理（管理中心 · 8 个页面）
        'metaEvents.json', 'metaEventProps.json', 'metaUserProps.json', 'metaDimTables.json',
        'metaItemProps.json', 'metaVirtualProps.json', 'metaVirtualEvents.json', 'metaAutoTrackEvents.json',
        // 行为分析（管理中心 · 事件分析）
        'eventAnalysis.json',
        // 催贷管理子系统（zz）
        'collectionData.json', 'dunData.json',
        // 催贷统一数据层（zzStore：跨页面共享 + 落盘，漏加会 400 导致改动不生效）
        'zzCases.json', 'zzPtp.json', 'zzWaivers.json', 'zzLogs.json', 'zzQa.json',
        'zzEntrusts.json', 'zzVisits.json', 'zzLegal.json', 'zzAiTasks.json', 'zzPolicy.json',
        'zzWords.json', 'zzVisitors.json', 'zzSms.json', 'zzSettle.json',
        'zzFlows.json', 'zzStrategyVer.json', 'zzExec.json',
        // 企业档案子系统（qy）
        'qiyeData.json',
        // 企业档案 · 上市信息 Tab（dm 数字营销，比亚迪样例）
        'dmListed.json',
        // 评分产品 / 规则合集（全局，漏加会 400）
        'scoringData.json', 'ruleHub.json', 'scoreData.json',
        // 个人档案子系统（gr）· 个人图谱样例数据
        'personGraph.json',
        // 企业风控子系统（fk）· 全部样例 JSON（漏加会让 useSample 返回 400，页面渲染出错）
        'fkYearly.json', 'fkRisk.json', 'fkHealth.json', 'fkEmployee.json', 'fkMap.json',
        'fkMonitorDetail.json', 'fkMonManage.json', 'fkMonRuleCreate.json',
        'fkBlacklist.json', 'fkInterest.json', 'fkProperty.json', 'fkRegulatory.json',
        'fkMonitor.json', 'fkStats.json',
      ]);
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? '', 'http://localhost');
        const isLoad = url.pathname === '/api/load-mid';
        const isSave = url.pathname === '/api/save-mid';
        if (!isLoad && !isSave) return next();
        const file = url.searchParams.get('file');
        if (!file || !ALLOWED_FILES.has(file)) { res.statusCode = 400; res.end('invalid file'); return; }
        const p = path.join(CFG_DIR, file);
        if (isLoad) {
          if (fs.existsSync(p)) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(fs.readFileSync(p, 'utf-8'));
          } else { res.statusCode = 404; res.end('null'); }
          return;
        }
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
        let body = '';
        req.on('data', (c) => { body += c; });
        req.on('end', () => {
          try { fs.writeFileSync(p, body, 'utf-8'); res.statusCode = 200; res.end('ok'); }
          catch (e) { res.statusCode = 500; res.end(String(e)); }
        });
      });
      for (const [name, file] of Object.entries(FILES)) {
        const p = path.join(CFG_DIR, file);
        // GET /api/load-<name> 加载
        server.middlewares.use(`/api/load-${name}`, (_req, res) => {
          if (fs.existsSync(p)) {
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(fs.readFileSync(p, 'utf-8'));
          } else {
            res.statusCode = 404;
            res.end('null');
          }
        });
        // POST /api/save-<name> 保存（写整个对象）
        server.middlewares.use(`/api/save-${name}`, (req, res) => {
          if (req.method !== 'POST') { res.statusCode = 405; res.end(); return; }
          let body = '';
          req.on('data', (c) => { body += c; });
          req.on('end', () => {
            try {
              fs.writeFileSync(p, body, 'utf-8');
              res.statusCode = 200;
              res.end('ok');
            } catch (e) {
              res.statusCode = 500;
              res.end(String(e));
            }
          });
        });
      }
    },
  };
}

// 原样（raw）服务 record/qixin 下的「另存为完整网页」快照，供档案页 iframe 1:1 复刻。
// 不走 Vite 转译管线（否则 .css 里的 @import partial 会因相对路径解析失败而 500），
// 直接按真实 MIME 返回，保证原站 CSS/图片正常加载。仅 dev 用。
function qixinRawPlugin() {
  const QIXIN_DIR = path.resolve(__dirname, 'record/qixin');
  const MIME = {
    '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject', '.map': 'application/json',
    '.txt': 'text/plain; charset=utf-8',
  };
  return {
    name: 'qixin-raw',
    configureServer(server) {
      server.middlewares.use('/qixin-raw', (req, res, next) => {
        try {
          const rel = decodeURIComponent((req.url || '').split('?')[0]).replace(/^\/+/, '');
          const target = path.resolve(QIXIN_DIR, rel);
          if (!target.startsWith(QIXIN_DIR) || target === QIXIN_DIR) return next();
          fs.stat(target, (err, st) => {
            if (err || !st.isFile()) return next();
            // Chrome「另存为」会给下载的 JS 加 .下载 后缀（如 index.xxx.js.下载），剥掉后按真实扩展名取 MIME，否则浏览器以 text/html 拒执行脚本
            let base = path.basename(target);
            const eff = base.endsWith('.下载') ? base.slice(0, -3) : base;
            const ext = path.extname(eff).toLowerCase();
            // 默认按网页渲染：qixin 快照里有无后缀的「网页快照」文件（如 风险信息），须当 HTML 显示
            res.setHeader('Content-Type', MIME[ext] || 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            fs.createReadStream(target).pipe(res);
          });
        } catch (e) { next(); }
      });
    },
  };
}

// 原样（raw）服务 record/功能分解 下的「功能分解快照」（综合得分 / 企业指数 / 空壳指数 / 科创分 / 合同违约指数 / 司法风险 等），
// 供企业尽调报告弹窗 iframe 1:1 复刻。与 qixin-raw 同理，单文件快照走真实 MIME 返回。
function featureRawPlugin() {
  const FEATURE_DIR = path.resolve(__dirname, 'record/功能分解');
  const MIME = {
    '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.svg': 'image/svg+xml', '.webp': 'image/webp', '.ico': 'image/x-icon',
    '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf',
    '.eot': 'application/vnd.ms-fontobject', '.map': 'application/json',
    '.txt': 'text/plain; charset=utf-8',
  };
  return {
    name: 'feature-raw',
    configureServer(server) {
      server.middlewares.use('/feature-raw', (req, res, next) => {
        try {
          const rel = decodeURIComponent((req.url || '').split('?')[0]).replace(/^\/+/, '');
          const target = path.resolve(FEATURE_DIR, rel);
          if (!target.startsWith(FEATURE_DIR) || target === FEATURE_DIR) return next();
          fs.stat(target, (err, st) => {
            if (err || !st.isFile()) return next();
            let base = path.basename(target);
            const eff = base.endsWith('.下载') ? base.slice(0, -3) : base;
            const ext = path.extname(eff).toLowerCase();
            res.setHeader('Content-Type', MIME[ext] || 'text/html; charset=utf-8');
            res.setHeader('Cache-Control', 'no-cache');
            fs.createReadStream(target).pipe(res);
          });
        } catch (e) { next(); }
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), persistPlugin(), qixinRawPlugin(), featureRawPlugin()],
  server: { host: true, port: 5173 },
});
