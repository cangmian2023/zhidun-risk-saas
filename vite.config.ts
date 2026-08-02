import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

const SEED_FILE = path.resolve(__dirname, 'src/console/templateSeed.json')

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
