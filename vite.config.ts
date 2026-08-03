// @ts-nocheck —— vite 配置文件由 esbuild 直接转译，node 类型缺失时不做严格 tsc 检查
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const SEED_FILE = path.resolve(__dirname, 'src/console/templateSeed.json')
const SAMPLE_DIR = path.resolve(__dirname, 'src/console/samples')

function persistPlugin(): Plugin {
  return {
    name: 'persist-templates',
    configureServer(server) {
      // GET：加载已保存的模板数据
      server.middlewares.use('/api/load-templates', (_req, res) => {
        try {
          if (fs.existsSync(SEED_FILE)) {
            res.setHeader('Content-Type', 'application/json')
            res.end(fs.readFileSync(SEED_FILE, 'utf-8'))
          } else {
            res.statusCode = 404; res.end('null')
          }
        } catch (e) {
          res.statusCode = 500; res.end(String(e))
        }
      })
      // POST：保存模板数据
      server.middlewares.use('/api/save-templates', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            fs.writeFileSync(SEED_FILE, body, 'utf-8')
            res.statusCode = 200; res.end('ok')
          } catch (e) {
            res.statusCode = 500; res.end(String(e))
          }
        })
      })
      // GET：读取某模板的样例数据（samples/sample-{id}.json，页面运行时添加的模板也能读到）
      server.middlewares.use('/api/load-sample', (req, res) => {
        const id = new URL(req.url ?? '', 'http://x').searchParams.get('id')
        if (!id) { res.statusCode = 400; res.end('no id'); return }
        try {
          const f = path.join(SAMPLE_DIR, `sample-${id}.json`)
          if (fs.existsSync(f)) {
            res.setHeader('Content-Type', 'application/json')
            res.end(fs.readFileSync(f, 'utf-8'))
          } else { res.statusCode = 404; res.end('null') }
        } catch (e) { res.statusCode = 500; res.end(String(e)) }
      })
      // POST：保存某模板的样例数据（页面新建/复制模板时落本地）
      server.middlewares.use('/api/save-sample', (req, res) => {
        if (req.method !== 'POST') { res.statusCode = 405; res.end(); return }
        let body = ''
        req.on('data', (chunk) => { body += chunk })
        req.on('end', () => {
          try {
            const d = JSON.parse(body)
            const id = String(d.id ?? '')
            if (!id) { res.statusCode = 400; res.end('no id'); return }
            if (!fs.existsSync(SAMPLE_DIR)) fs.mkdirSync(SAMPLE_DIR, { recursive: true })
            fs.writeFileSync(path.join(SAMPLE_DIR, `sample-${id}.json`), JSON.stringify(d.sample ?? {}, null, 2), 'utf-8')
            res.statusCode = 200; res.end('ok')
          } catch (e) { res.statusCode = 500; res.end(String(e)) }
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), persistPlugin()],
  server: {
    host: true,
    port: 5173,
  },
})
