import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

function serveMyGamePlugin() {
  const mimeTypes = {
    '.wasm': 'application/wasm',
    '.data': 'application/octet-stream',
    '.unityweb': 'application/octet-stream',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.css': 'text/css',
    '.html': 'text/html',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
  }

  return {
    name: 'serve-mygame',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const decodedUrl = decodeURIComponent(req.url || '')
        if (decodedUrl.startsWith('/mygame/')) {
          const relativePath = decodedUrl.replace(/^\/mygame\//, '').split('?')[0]
          const filePath = path.join(process.cwd(), 'mygame', relativePath)

          if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
            const ext = path.extname(filePath).toLowerCase()
            const contentType = mimeTypes[ext] || 'application/octet-stream'

            res.setHeader('Content-Type', contentType)
            res.setHeader('Access-Control-Allow-Origin', '*')
            return fs.createReadStream(filePath).pipe(res)
          }
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), serveMyGamePlugin()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
    watch: {
      ignored: ['**/mygame/**', '**/public/horror-maze-webgl/Build/**'],
    },
  },
})
