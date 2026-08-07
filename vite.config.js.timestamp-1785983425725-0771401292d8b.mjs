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
        "metaAutoTrackEvents.json"
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFx5dWV4aW5cXFxccHJvamVjdFxcXFxyaXNrXFxcXHNhYXNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXHl1ZXhpblxcXFxwcm9qZWN0XFxcXHJpc2tcXFxcc2Fhc1xcXFx2aXRlLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDoveXVleGluL3Byb2plY3Qvcmlzay9zYWFzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IGZzIGZyb20gJ2ZzJztcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG4vLyBcdTY3MkNcdTU3MzAgSlNPTiBcdTYzMDFcdTRFNDVcdTUzMTZcdUZGMUFcdTYyNDBcdTY3MDlcdTkxNERcdTdGNkVcdTRFMEVcdTY4MzdcdTRGOEJcdTY1NzBcdTYzNkVcdTRGRERcdTVCNThcdTUyMzAgc3JjL2NvbnNvbGUvIFx1NEUwQlx1NzY4NCBKU09OIFx1NjU4N1x1NEVGNlxuLy8gXHU2MkE1XHU1NDRBXHU2QTIxXHU2NzdGXHU2Q0JGXHU3NTI4IHRlbXBsYXRlU2VlZC5qc29uXHVGRjFCXHU4RDM3XHU0RTJEXHU3NkQxXHU2M0E3XHU2NUIwXHU1ODlFIDQgXHU0RTJBXHU2NTg3XHU0RUY2XG5jb25zdCBDRkdfRElSID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jb25zb2xlJyk7XG5jb25zdCBGSUxFUyA9IHtcbiAgdGVtcGxhdGVzOiAndGVtcGxhdGVTZWVkLmpzb24nLFxuICAnbWlkLWRhdGFzb3VyY2VzJzogJ21pZERhdGFTb3VyY2VzLmpzb24nLFxuICAnbWlkLW1ldHJpY3MnOiAnbWlkTWV0cmljcy5qc29uJyxcbiAgJ21pZC1zdHJhdGVnaWVzJzogJ21pZFN0cmF0ZWdpZXMuanNvbicsXG4gICdtaWQtZGFzaGJvYXJkcyc6ICdtaWREYXNoYm9hcmRzLmpzb24nLFxuICAnbWlkLWN1c3RvbWVycyc6ICdtaWRDdXN0b21lcnMuanNvbicsXG4gICdtaWQtZGlzcG9zZS10YXNrcyc6ICdtaWREaXNwb3NlVGFza3MuanNvbicsXG4gICdzb3VyY2UtdGFnJzogJ3NvdXJjZVRhZy5qc29uJyxcbn07XG5cbmZ1bmN0aW9uIHBlcnNpc3RQbHVnaW4oKSB7XG4gIHJldHVybiB7XG4gICAgbmFtZTogJ3BlcnNpc3QtanNvbicsXG4gICAgY29uZmlndXJlU2VydmVyKHNlcnZlcikge1xuICAgICAgLy8gXHU5MDFBXHU3NTI4XHU3QUVGXHU3MEI5XHVGRjFBbWlkU3RvcmUgXHU0RjdGXHU3NTI4IC9hcGkvbG9hZC1taWQ/ZmlsZT0gXHU0RTBFIC9hcGkvc2F2ZS1taWQ/ZmlsZT0gXHU1RjYyXHU1RjBGXHVGRjA4P2ZpbGU9IFx1NTNDMlx1NjU3MFx1RkYwOVxuICAgICAgLy8gXHU3NjdEXHU1NDBEXHU1MzU1XHU5NjUwXHU1QjlBXHU1M0VGXHU4QkJGXHU5NUVFXHU3Njg0XHU2NzJDXHU1NzMwIEpTT04gXHU2NTg3XHU0RUY2XHVGRjFCXHU3Q0JFXHU3ODZFXHU1MzM5XHU5MTREIHBhdGhuYW1lXHVGRjBDXHU0RTBEXHU1RTcyXHU2MjcwXHU0RTBCXHU2NUI5XHU3Njg0IC9hcGkvbG9hZC08bmFtZT4gXHU1NkZBXHU1QjlBXHU4REVGXHU3NTMxXG4gICAgICBjb25zdCBBTExPV0VEX0ZJTEVTID0gbmV3IFNldChbXG4gICAgICAgICdtaWREYXRhU291cmNlcy5qc29uJywgJ21pZE1ldHJpY3MuanNvbicsICdtaWRTdHJhdGVneS5qc29uJywgJ21pZERhc2hib2FyZHMuanNvbicsXG4gICAgICAgICdtaWRBbGVydHMuanNvbicsICdtaWRDdXN0b21lcnMuanNvbicsICdtaWREaXNwb3NlVGFza3MuanNvbicsICdzb3VyY2VUYWcuanNvbicsXG4gICAgICAgICdtaWRWaXpTYW1wbGVzLmpzb24nLFxuICAgICAgICAvLyBcdTUxNDNcdTY1NzBcdTYzNkVcdTdCQTFcdTc0MDZcdUZGMDhcdTdCQTFcdTc0MDZcdTRFMkRcdTVGQzMgXHUwMEI3IDggXHU0RTJBXHU5ODc1XHU5NzYyXHVGRjA5XG4gICAgICAgICdtZXRhRXZlbnRzLmpzb24nLCAnbWV0YUV2ZW50UHJvcHMuanNvbicsICdtZXRhVXNlclByb3BzLmpzb24nLCAnbWV0YURpbVRhYmxlcy5qc29uJyxcbiAgICAgICAgJ21ldGFJdGVtUHJvcHMuanNvbicsICdtZXRhVmlydHVhbFByb3BzLmpzb24nLCAnbWV0YVZpcnR1YWxFdmVudHMuanNvbicsICdtZXRhQXV0b1RyYWNrRXZlbnRzLmpzb24nLFxuICAgICAgXSk7XG4gICAgICBzZXJ2ZXIubWlkZGxld2FyZXMudXNlKChyZXEsIHJlcywgbmV4dCkgPT4ge1xuICAgICAgICBjb25zdCB1cmwgPSBuZXcgVVJMKHJlcS51cmwgPz8gJycsICdodHRwOi8vbG9jYWxob3N0Jyk7XG4gICAgICAgIGNvbnN0IGlzTG9hZCA9IHVybC5wYXRobmFtZSA9PT0gJy9hcGkvbG9hZC1taWQnO1xuICAgICAgICBjb25zdCBpc1NhdmUgPSB1cmwucGF0aG5hbWUgPT09ICcvYXBpL3NhdmUtbWlkJztcbiAgICAgICAgaWYgKCFpc0xvYWQgJiYgIWlzU2F2ZSkgcmV0dXJuIG5leHQoKTtcbiAgICAgICAgY29uc3QgZmlsZSA9IHVybC5zZWFyY2hQYXJhbXMuZ2V0KCdmaWxlJyk7XG4gICAgICAgIGlmICghZmlsZSB8fCAhQUxMT1dFRF9GSUxFUy5oYXMoZmlsZSkpIHsgcmVzLnN0YXR1c0NvZGUgPSA0MDA7IHJlcy5lbmQoJ2ludmFsaWQgZmlsZScpOyByZXR1cm47IH1cbiAgICAgICAgY29uc3QgcCA9IHBhdGguam9pbihDRkdfRElSLCBmaWxlKTtcbiAgICAgICAgaWYgKGlzTG9hZCkge1xuICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHApKSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcpO1xuICAgICAgICAgICAgcmVzLmVuZChmcy5yZWFkRmlsZVN5bmMocCwgJ3V0Zi04JykpO1xuICAgICAgICAgIH0gZWxzZSB7IHJlcy5zdGF0dXNDb2RlID0gNDA0OyByZXMuZW5kKCdudWxsJyk7IH1cbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykgeyByZXMuc3RhdHVzQ29kZSA9IDQwNTsgcmVzLmVuZCgpOyByZXR1cm47IH1cbiAgICAgICAgbGV0IGJvZHkgPSAnJztcbiAgICAgICAgcmVxLm9uKCdkYXRhJywgKGMpID0+IHsgYm9keSArPSBjOyB9KTtcbiAgICAgICAgcmVxLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgdHJ5IHsgZnMud3JpdGVGaWxlU3luYyhwLCBib2R5LCAndXRmLTgnKTsgcmVzLnN0YXR1c0NvZGUgPSAyMDA7IHJlcy5lbmQoJ29rJyk7IH1cbiAgICAgICAgICBjYXRjaCAoZSkgeyByZXMuc3RhdHVzQ29kZSA9IDUwMDsgcmVzLmVuZChTdHJpbmcoZSkpOyB9XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lLCBmaWxlXSBvZiBPYmplY3QuZW50cmllcyhGSUxFUykpIHtcbiAgICAgICAgY29uc3QgcCA9IHBhdGguam9pbihDRkdfRElSLCBmaWxlKTtcbiAgICAgICAgLy8gR0VUIC9hcGkvbG9hZC08bmFtZT4gXHU1MkEwXHU4RjdEXG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoYC9hcGkvbG9hZC0ke25hbWV9YCwgKF9yZXEsIHJlcykgPT4ge1xuICAgICAgICAgIGlmIChmcy5leGlzdHNTeW5jKHApKSB7XG4gICAgICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD11dGYtOCcpO1xuICAgICAgICAgICAgcmVzLmVuZChmcy5yZWFkRmlsZVN5bmMocCwgJ3V0Zi04JykpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNDtcbiAgICAgICAgICAgIHJlcy5lbmQoJ251bGwnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICAvLyBQT1NUIC9hcGkvc2F2ZS08bmFtZT4gXHU0RkREXHU1QjU4XHVGRjA4XHU1MTk5XHU2NTc0XHU0RTJBXHU1QkY5XHU4QzYxXHVGRjA5XG4gICAgICAgIHNlcnZlci5taWRkbGV3YXJlcy51c2UoYC9hcGkvc2F2ZS0ke25hbWV9YCwgKHJlcSwgcmVzKSA9PiB7XG4gICAgICAgICAgaWYgKHJlcS5tZXRob2QgIT09ICdQT1NUJykgeyByZXMuc3RhdHVzQ29kZSA9IDQwNTsgcmVzLmVuZCgpOyByZXR1cm47IH1cbiAgICAgICAgICBsZXQgYm9keSA9ICcnO1xuICAgICAgICAgIHJlcS5vbignZGF0YScsIChjKSA9PiB7IGJvZHkgKz0gYzsgfSk7XG4gICAgICAgICAgcmVxLm9uKCdlbmQnLCAoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHAsIGJvZHksICd1dGYtOCcpO1xuICAgICAgICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcbiAgICAgICAgICAgICAgcmVzLmVuZCgnb2snKTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XG4gICAgICAgICAgICAgIHJlcy5lbmQoU3RyaW5nKGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW3JlYWN0KCksIHBlcnNpc3RQbHVnaW4oKV0sXG4gIHNlcnZlcjogeyBob3N0OiB0cnVlLCBwb3J0OiA1MTczIH0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBNlEsU0FBUyxvQkFBb0I7QUFDMVMsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sUUFBUTtBQUNmLE9BQU8sVUFBVTtBQUhqQixJQUFNLG1DQUFtQztBQU96QyxJQUFNLFVBQVUsS0FBSyxRQUFRLGtDQUFXLGFBQWE7QUFDckQsSUFBTSxRQUFRO0FBQUEsRUFDWixXQUFXO0FBQUEsRUFDWCxtQkFBbUI7QUFBQSxFQUNuQixlQUFlO0FBQUEsRUFDZixrQkFBa0I7QUFBQSxFQUNsQixrQkFBa0I7QUFBQSxFQUNsQixpQkFBaUI7QUFBQSxFQUNqQixxQkFBcUI7QUFBQSxFQUNyQixjQUFjO0FBQ2hCO0FBRUEsU0FBUyxnQkFBZ0I7QUFDdkIsU0FBTztBQUFBLElBQ0wsTUFBTTtBQUFBLElBQ04sZ0JBQWdCLFFBQVE7QUFHdEIsWUFBTSxnQkFBZ0Isb0JBQUksSUFBSTtBQUFBLFFBQzVCO0FBQUEsUUFBdUI7QUFBQSxRQUFtQjtBQUFBLFFBQW9CO0FBQUEsUUFDOUQ7QUFBQSxRQUFrQjtBQUFBLFFBQXFCO0FBQUEsUUFBd0I7QUFBQSxRQUMvRDtBQUFBO0FBQUEsUUFFQTtBQUFBLFFBQW1CO0FBQUEsUUFBdUI7QUFBQSxRQUFzQjtBQUFBLFFBQ2hFO0FBQUEsUUFBc0I7QUFBQSxRQUF5QjtBQUFBLFFBQTBCO0FBQUEsTUFDM0UsQ0FBQztBQUNELGFBQU8sWUFBWSxJQUFJLENBQUMsS0FBSyxLQUFLLFNBQVM7QUFDekMsY0FBTSxNQUFNLElBQUksSUFBSSxJQUFJLE9BQU8sSUFBSSxrQkFBa0I7QUFDckQsY0FBTSxTQUFTLElBQUksYUFBYTtBQUNoQyxjQUFNLFNBQVMsSUFBSSxhQUFhO0FBQ2hDLFlBQUksQ0FBQyxVQUFVLENBQUMsT0FB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
