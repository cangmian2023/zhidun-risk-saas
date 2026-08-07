// vite.config.js
import { defineConfig } from "file:///D:/yuexin/project/risk/saas/node_modules/vite/dist/node/index.js";
import react from "file:///D:/yuexin/project/risk/saas/node_modules/@vitejs/plugin-react/dist/index.js";
import fs from "fs";
import path from "path";
var __vite_injected_original_dirname = "D:\\yuexin\\project\\risk\\saas";
var CFG_DIR = path.resolve(__vite_injected_original_dirname, "src/console");
var FILES = {
  templates: "templateSeed.json",
  "mid-datasources": "midDataSources.json",
  "mid-metrics": "midMetrics.json",
  "mid-strategies": "midStrategies.json",
  "mid-dashboards": "midDashboards.json",
  "mid-customers": "midCustomers.json",
  "mid-dispose-tasks": "midDisposeTasks.json",
  "source-tag": "sourceTag.json"
};
function persistPlugin() {
  return {
    name: "persist-json",
    configureServer(server) {
      const ALLOWED_FILES = /* @__PURE__ */ new Set([
        "midDataSources.json",
        "midMetrics.json",
        "midStrategy.json",
        "midDashboards.json",
        "midAlerts.json",
        "midCustomers.json",
        "midDisposeTasks.json",
        "sourceTag.json",
        "midVizSamples.json",
        // 元数据管理（管理中心 · 8 个页面）
        "metaEvents.json",
        "metaEventProps.json",
        "metaUserProps.json",
        "metaDimTables.json",
        "metaItemProps.json",
        "metaVirtualProps.json",
        "metaVirtualEvents.json",
        "metaAutoTrackEvents.json",
        // 行为分析（管理中心 · 事件分析）
        "eventAnalysis.json"
      ]);
      server.middlewares.use((req, res, next) => {
        const url = new URL(req.url ?? "", "http://localhost");
        const isLoad = url.pathname === "/api/load-mid";
        const isSave = url.pathname === "/api/save-mid";
        if (!isLoad && !isSave) return next();
        const file = url.searchParams.get("file");
        if (!file || !ALLOWED_FILES.has(file)) {
          res.statusCode = 400;
          res.end("invalid file");
          return;
        }
        const p = path.join(CFG_DIR, file);
        if (isLoad) {
          if (fs.existsSync(p)) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(fs.readFileSync(p, "utf-8"));
          } else {
            res.statusCode = 404;
            res.end("null");
          }
          return;
        }
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }
        let body = "";
        req.on("data", (c) => {
          body += c;
        });
        req.on("end", () => {
          try {
            fs.writeFileSync(p, body, "utf-8");
            res.statusCode = 200;
            res.end("ok");
          } catch (e) {
            res.statusCode = 500;
            res.end(String(e));
          }
        });
      });
      for (const [name, file] of Object.entries(FILES)) {
        const p = path.join(CFG_DIR, file);
        server.middlewares.use(`/api/load-${name}`, (_req, res) => {
          if (fs.existsSync(p)) {
            res.setHeader("Content-Type", "application/json; charset=utf-8");
            res.end(fs.readFileSync(p, "utf-8"));
          } else {
            res.statusCode = 404;
            res.end("null");
          }
        });
        server.middlewares.use(`/api/save-${name}`, (req, res) => {
          if (req.method !== "POST") {
            res.statusCode = 405;
            res.end();
            return;
          }
          let body = "";
          req.on("data", (c) => {
            body += c;
          });
          req.on("end", () => {
            try {
              fs.writeFileSync(p, body, "utf-8");
              res.statusCode = 200;
              res.end("ok");
            } catch (e) {
              res.statusCode = 500;
              res.end(String(e));
            }
          });
        });
      }
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [react(), persistPlugin()],
  server: { host: true, port: 5173 }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx5dWV4aW5cXFxccHJvamVjdFxcXFxyaXNrXFxcXHNhYXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHl1ZXhpblxcXFxwcm9qZWN0XFxcXHJpc2tcXFxcc2Fhc1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDoveXVleGluL3Byb2plY3Qvcmlzay9zYWFzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBcdTY3MkNcdTU3MzAgSlNPTiBcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMUFcdTYyNDBcdTY3MDlcdTkxNERcdTdGNkVcdTRFMEVcdTY4MzdcdTRGOEJcdTY1NzBcdTYzNkVcdTRGRERcdTVCNThcdTUyMzAgc3JjL2NvbnNvbGUvIFx1NEUwQlx1NzY4NCBKU09OIFx1NjU4N1x1NEVGNlxuLy8gXHU2MkE1XHU1NDRBXHU2QTIxXHU2NzdGXHU2Q0JGXHU3NTI4IHRlbXBsYXRlU2VlZC5qc29uXHVGRjFCXHU4RDM3XHU0RTJEXHU3NkQxXHU2M0E3XHU2NUIwXHU1ODlFIDQgXHU0RTJBXHU2NTg3XHU0RUY2XG5jb25zdCBDRkdfRElSID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb25zb2xlJyk7XG5jb25zdCBGSUxFUyA9IHtcbiAgdGVtcGxhdGVzOiAndGVtcGxhdGVTZWVkLmpzb24nLFxuICAnbWlkLWRhdGFzb3VyY2VzJzogJ21pZERhdGFTb3VyY2VzLmpzb24nLFxuICAnbWlkLW1ldHJpY3MnOiAnbWlkTWV0cmljcy5qc29uJyxcbiAgJ21pZC1zdHJhdGVnaWVzJzogJ21pZFN0cmF0ZWdpZXMuanNvbicsXG4gICdtaWQtZGFzaGJvYXJkcyc6ICdtaWREYXNoYm9hcmRzLmpzb24nLFxuICAnbWlkLWN1c3RvbWVycyc6ICdtaWRDdXN0b21lcnMuanNvbicsXG4gICdtaWQtZGlzcG9zZS10YXNrcyc6ICdtaWREaXNwb3NlVGFza3MuanNvbicsXG4gICdzb3VyY2UtdGFnJzogJ3NvdXJjZVRhZy5qc29uJyxcbn07XG5cbmZ1bmN0aW9uIHBlcnNpc3RQbHVnaW4oKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3BlcnNpc3QtanNvbicsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgLy8gXHU5MDFBXHU3NTI4XHU3QUVGXHU3MEI5XHVGRjFBbWlkU3RvcmUgXHU0RjdGXHU3NTI4IC9hcGkvbG9hZC1taWQ/ZmlsZT0gXHU0RTBFIC9hcGkvc2F2ZS1taWQ/ZmlsZT0gXHU1RjYyXHU1RjBGXHVGRjA4P2ZpbGU9IFx1NTNDMlx1NjU3MFx1RkYwOVxuICAgICAgLy8gXHU3NjdEXHU1NDBEXHU1MzU1XHU5NjUwXHU1QjlBXHU1M0VGXHU4QkJGXHU5NUVFXHU3Njg0XHU2NzJDXHU1NzMwIEpTT04gXHU2NTg3XHU0RUY2XHVGRjFCXHU3Q0JFXHU3ODZFXHU1MzM5XHU5MTREIHBhdGhuYW1lXHVGRjBDXHU0RTBEXHU1RTcyXHU2MjcwXHU0RTBCXHU2NUI5XHU3Njg0IC9hcGkvbG9hZC08bmFtZT4gXHU1NkZBXHU1QjlBXHU4REVGXHU3NTMxXG4gICAgICBjb25zdCBBTExPV0VEX0ZJTEVTID0gbmV3IFNldChbXG4gICAgICAgICdtaWREYXRhU291cmNlcy5qc29uJywgJ21pZE1ldHJpY3MuanNvbicsICdtaWRTdHJhdGVneS5qc29uJywgJ21pZERhc2hib2FyZHMuanNvbicsXG4gICAgICAgICdtaWRBbGVydHMuanNvbicsICdtaWRDdXN0b21lcnMuanNvbicsICdtaWREaXNwb3NlVGFza3MuanNvbicsICdzb3VyY2VUYWcuanNvbicsXG4gICAgICAgICdtaWRWaXpTYW1wbGVzLmpzb24nLFxuICAgICAgICAvLyBcdTUxNDNcdTY1NzBcdTYzNkVcdTdCQTFcdTc0MDZcdUZGMDhcdTdCQTFcdTc0MDZcdTRFMkRcdTVGQzMgXHUwMEI3IDggXHU0RTJBXHU5ODc1XHU5NzYyXHVGRjA5XG4gICAgICAgICdtZXRhRXZlbnRzLmpzb24nLCAnbWV0YUV2ZW50UHJvcHMuanNvbicsICdtZXRhVXNlclByb3BzLmpzb24nLCAnbWV0YURpbVRhYmxlcy5qc29uJyxcbiAgICAgICAgJ21ldGFJdGVtUHJvcHMuanNvbicsICdtZXRhVmlydHVhbFByb3BzLmpzb24nLCAnbWV0YVZpcnR1YWxFdmVudHMuanNvbicsICdtZXRhQXV0b1RyYWNrRXZlbnRzLmpzb24nLFxuICAgICAgICAvLyBcdTg4NENcdTRFM0FcdTUyMDZcdTY3OTBcdUZGMDhcdTdCQTFcdTc0MDZcdTRFMkRcdTVGQzMgXHUwMEI3IFx1NEU4Qlx1NEVGNlx1NTIwNlx1Njc5MFx1RkYwOVxuICAgICAgICAnZXZlbnRBbmFseXNpcy5qc29uJyxcbiAgICAgIF0pO1xuICAgICAgc2VydmVyLm1pZGRsZXdhcmVzLnVzZSgocmVxLCByZXMsIG5leHQpID0+IHtcbiAgICAgICAgY29uc3QgdXJsID0gbmV3IFVSTChyZXEudXJsID8/ICcnLCAnaHR0cDovL2xvY2FsaG9zdCcpO1xuICAgICAgICBjb25zdCBpc0xvYWQgPSB1cmwucGF0aG5hbWUgPT09ICcvYXBpL2xvYWQtbWlkJztcbiAgICAgICAgY29uc3QgaXNTYXZlID0gdXJsLnBhdGhuYW1lID09PSAnL2FwaS9zYXZlLW1pZCc7XG4gICAgICAgIGlmICghaXNMb2FkICYmICFpc1NhdmUpIHJldHVybiBuZXh0KCk7XG4gICAgICAgIGNvbnN0IGZpbGUgPSB1cmwuc2VhcmNoUGFyYW1zLmdldCgnZmlsZScpO1xuICAgICAgICBpZiAoIWZpbGUgfHwgIUFMTE9XRURfRklMRVMuaGFzKGZpbGUpKSB7IHJlcy5zdGF0dXNDb2RlID0gNDAwOyByZXMuZW5kKCdpbnZhbGlkIGZpbGUnKTsgcmV0dXJuOyB9XG4gICAgICAgIGNvbnN0IHAgPSBwYXRoLmpvaW4oQ0ZHX0RJUiwgZmlsZSk7XG4gICAgICAgIGlmIChpc0xvYWQpIHtcbiAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwKSkge1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnKTtcbiAgICAgICAgICAgIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKHAsICd1dGYtOCcpKTtcbiAgICAgICAgICB9IGVsc2UgeyByZXMuc3RhdHVzQ29kZSA9IDQwNDsgcmVzLmVuZCgnbnVsbCcpOyB9XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHsgcmVzLnN0YXR1c0NvZGUgPSA0MDU7IHJlcy5lbmQoKTsgcmV0dXJuOyB9XG4gICAgICAgIGxldCBib2R5ID0gJyc7XG4gICAgICAgIHJlcS5vbignZGF0YScsIChjKSA9PiB7IGJvZHkgKz0gYzsgfSk7XG4gICAgICAgIHJlcS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgIHRyeSB7IGZzLndyaXRlRmlsZVN5bmMocCwgYm9keSwgJ3V0Zi04Jyk7IHJlcy5zdGF0dXNDb2RlID0gMjAwOyByZXMuZW5kKCdvaycpOyB9XG4gICAgICAgICAgY2F0Y2ggKGUpIHsgcmVzLnN0YXR1c0NvZGUgPSA1MDA7IHJlcy5lbmQoU3RyaW5nKGUpKTsgfVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgICAgZm9yIChjb25zdCBbbmFtZSwgZmlsZV0gb2YgT2JqZWN0LmVudHJpZXMoRklMRVMpKSB7XG4gICAgICAgIGNvbnN0IHAgPSBwYXRoLmpvaW4oQ0ZHX0RJUiwgZmlsZSk7XG4gICAgICAgIC8vIEdFVCAvYXBpL2xvYWQtPG5hbWU+IFx1NTJBMFx1OEY3RFxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGAvYXBpL2xvYWQtJHtuYW1lfWAsIChfcmVxLCByZXMpID0+IHtcbiAgICAgICAgICBpZiAoZnMuZXhpc3RzU3luYyhwKSkge1xuICAgICAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9dXRmLTgnKTtcbiAgICAgICAgICAgIHJlcy5lbmQoZnMucmVhZEZpbGVTeW5jKHAsICd1dGYtOCcpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDQ7XG4gICAgICAgICAgICByZXMuZW5kKCdudWxsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgLy8gUE9TVCAvYXBpL3NhdmUtPG5hbWU+IFx1NEZERFx1NUI1OFx1RkYwOFx1NTE5OVx1NjU3NFx1NEUyQVx1NUJGOVx1OEM2MVx1RkYwOVxuICAgICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKGAvYXBpL3NhdmUtJHtuYW1lfWAsIChyZXEsIHJlcykgPT4ge1xuICAgICAgICAgIGlmIChyZXEubWV0aG9kICE9PSAnUE9TVCcpIHsgcmVzLnN0YXR1c0NvZGUgPSA0MDU7IHJlcy5lbmQoKTsgcmV0dXJuOyB9XG4gICAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgICByZXEub24oJ2RhdGEnLCAoYykgPT4geyBib2R5ICs9IGM7IH0pO1xuICAgICAgICAgIHJlcS5vbignZW5kJywgKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgZnMud3JpdGVGaWxlU3luYyhwLCBib2R5LCAndXRmLTgnKTtcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XG4gICAgICAgICAgICAgIHJlcy5lbmQoJ29rJyk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xuICAgICAgICAgICAgICByZXMuZW5kKFN0cmluZyhlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH0sXG4gIH07XG59XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFtyZWFjdCgpLCBwZXJzaXN0UGx1Z2luKCldLFxuICBzZXJ2ZXI6IHsgaG9zdDogdHJ1ZSwgcG9ydDogNTE3MyB9LFxufSk7XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTZRLFNBQVMsb0JBQW9CO0FBQzFTLE9BQU8sV0FBVztBQUNsQixPQUFPLFFBQVE7QUFDZixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTSxVQUFVLEtBQUssUUFBUSxrQ0FBVyxhQUFhO0FBQ3JELElBQU0sUUFBUTtBQUFBLEVBQ1osV0FBVztBQUFBLEVBQ1gsbUJBQW1CO0FBQUEsRUFDbkIsZUFBZTtBQUFBLEVBQ2Ysa0JBQWtCO0FBQUEsRUFDbEIsa0JBQWtCO0FBQUEsRUFDbEIsaUJBQWlCO0FBQUEsRUFDakIscUJBQXFCO0FBQUEsRUFDckIsY0FBYztBQUNoQjtBQUVBLFNBQVMsZ0JBQWdCO0FBQ3ZCLFNBQU87QUFBQSxJQUNMLE1BQU07QUFBQSxJQUNOLGdCQUFnQixRQUFRO0FBR3RCLFlBQU0sZ0JBQWdCLG9CQUFJLElBQUk7QUFBQSxRQUM1QjtBQUFBLFFBQXVCO0FBQUEsUUFBbUI7QUFBQSxRQUFvQjtBQUFBLFFBQzlEO0FBQUEsUUFBa0I7QUFBQSxRQUFxQjtBQUFBLFFBQXdCO0FBQUEsUUFDL0Q7QUFBQTtBQUFBLFFBRUE7QUFBQSxRQUFtQjtBQUFBLFFBQXVCO0FBQUEsUUFBc0I7QUFBQSxRQUNoRTtBQUFBLFFBQXNCO0FBQUEsUUFBeUI7QUFBQSxRQUEwQjtBQUFBO0FBQUEsUUFFekU7QUFBQSxNQUNGLENBQUM7QUFDRCxhQUFPLFlBQVksSUFB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
