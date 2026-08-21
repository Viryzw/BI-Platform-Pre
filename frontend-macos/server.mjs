import http from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = fileURLToPath(new URL('.', import.meta.url))
const port = Number(process.env.PORT || 5173)
const backend = new URL(process.env.BACKEND_URL || 'http://127.0.0.1:8000')

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  })
  response.end(JSON.stringify(payload))
}

function checkBackend(response) {
  const request = http.request(
    {
      hostname: backend.hostname,
      port: backend.port || 80,
      path: '/',
      method: 'GET',
      timeout: 2200
    },
    (backendResponse) => {
      backendResponse.resume()
      sendJson(response, 200, {
        online: Boolean(backendResponse.statusCode && backendResponse.statusCode < 500),
        status: backendResponse.statusCode,
        target: backend.origin
      })
    }
  )

  request.on('timeout', () => request.destroy(new Error('timeout')))
  request.on('error', () => {
    sendJson(response, 200, { online: false, status: null, target: backend.origin })
  })
  request.end()
}

function proxyRequest(clientRequest, clientResponse) {
  const headers = { ...clientRequest.headers, host: backend.host }
  delete headers.connection

  const proxy = http.request(
    {
      hostname: backend.hostname,
      port: backend.port || 80,
      path: clientRequest.url,
      method: clientRequest.method,
      headers,
      timeout: 190000
    },
    (backendResponse) => {
      const responseHeaders = { ...backendResponse.headers }
      delete responseHeaders['content-encoding']
      clientResponse.writeHead(backendResponse.statusCode || 502, responseHeaders)
      backendResponse.pipe(clientResponse)
    }
  )

  proxy.on('timeout', () => proxy.destroy(new Error('后端请求超时')))
  proxy.on('error', (error) => {
    if (!clientResponse.headersSent) {
      sendJson(clientResponse, 502, {
        detail: `无法连接后端 ${backend.origin}`,
        reason: error.message
      })
    } else {
      clientResponse.end()
    }
  })

  clientRequest.pipe(proxy)
}

function serveStatic(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host || 'localhost'}`)
  let pathname = decodeURIComponent(requestUrl.pathname)
  if (pathname === '/') pathname = '/index.html'

  const safePath = normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '')
  let filePath = join(rootDir, safePath)

  if (!filePath.startsWith(rootDir) || !existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = join(rootDir, 'index.html')
  }

  response.writeHead(200, {
    'Content-Type': mimeTypes[extname(filePath)] || 'application/octet-stream',
    // This server is a local development/acceptance surface. Keeping a stable
    // app.js URL cacheable made browsers show a pre-refactor UI for one hour.
    'Cache-Control': 'no-store'
  })
  createReadStream(filePath).pipe(response)
}

const server = http.createServer((request, response) => {
  if (request.url === '/__health') {
    sendJson(response, 200, { ok: true, port, backend: backend.origin })
    return
  }

  if (request.url === '/__backend_health') {
    checkBackend(response)
    return
  }

  if (request.url?.startsWith('/api/')) {
    proxyRequest(request, response)
    return
  }

  serveStatic(request, response)
})

server.listen(port, '127.0.0.1', () => {
  console.log(`BI 前端已启动：http://127.0.0.1:${port}`)
  console.log(`后端代理目标：${backend.origin}`)
})

function shutdown() {
  server.close(() => process.exit(0))
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
