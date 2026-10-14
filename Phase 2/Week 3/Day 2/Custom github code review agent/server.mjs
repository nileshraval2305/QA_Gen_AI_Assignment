import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const directory = path.dirname(fileURLToPath(import.meta.url))
const port = Number(process.env.PORT || 8000)
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/github-code-review'
const maxBodyBytes = 1024 * 1024

async function readRequestBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > maxBodyBytes) throw new Error('Request body exceeds the 1 MB limit')
    chunks.push(chunk)
  }
  return Buffer.concat(chunks).toString('utf8')
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'x-content-type-options': 'nosniff',
    'cache-control': 'no-store',
  })
  response.end(JSON.stringify(payload))
}

function normalizeGitHubFileUrl(value) {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return null
    const parts = url.pathname.split('/').filter(Boolean)
    if (url.hostname === 'raw.githubusercontent.com' && parts.length >= 4) {
      return url.origin + url.pathname
    }
    if (url.hostname === 'github.com' && parts.length >= 5 && parts[2] === 'blob') {
      return `https://raw.githubusercontent.com/${parts[0]}/${parts[1]}/${parts.slice(3).join('/')}`
    }
    return null
  } catch {
    return null
  }
}

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`)

  if (request.method === 'GET' && (requestUrl.pathname === '/' || requestUrl.pathname === '/index.html')) {
    try {
      const html = await readFile(path.join(directory, 'index.html'))
      response.writeHead(200, {
        'content-type': 'text/html; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'referrer-policy': 'no-referrer',
        'cache-control': 'no-store',
      })
      response.end(html)
    } catch (error) {
      console.error('Could not load application HTML:', error)
      sendJson(response, 500, { error: 'Could not load the application HTML.' })
    }
    return
  }

  if (request.method === 'POST' && requestUrl.pathname === '/api/review') {
    let payload
    try {
      const body = await readRequestBody(request)
      payload = JSON.parse(body)
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Invalid JSON request body.' })
      return
    }

    const githubUrl = payload && typeof payload.githubUrl === 'string'
      ? normalizeGitHubFileUrl(payload.githubUrl)
      : null
    if (!githubUrl) {
      sendJson(response, 400, { error: 'Provide a valid HTTPS GitHub file URL.' })
      return
    }

    try {
      const upstream = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json', accept: 'application/json, text/plain' },
        body: JSON.stringify({ githubUrl }),
        signal: AbortSignal.timeout(90000),
      })
      const responseBody = await upstream.text()
      response.writeHead(upstream.status, {
        'content-type': upstream.headers.get('content-type') || 'text/plain; charset=utf-8',
        'x-content-type-options': 'nosniff',
        'cache-control': 'no-store',
      })
      response.end(responseBody)
    } catch (error) {
      console.error('Could not reach n8n webhook:', error)
      sendJson(response, 502, {
        error: error instanceof Error ? `Could not reach n8n: ${error.message}` : 'Could not reach n8n.',
      })
    }
    return
  }

  sendJson(response, 404, { error: 'Not found.' })
})

server.listen(port, '127.0.0.1', () => {
  console.log(`Code Review AI is running at http://localhost:${port}`)
  console.log(`n8n webhook proxy: ${n8nWebhookUrl}`)
})
