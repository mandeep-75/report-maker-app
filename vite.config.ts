import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'
import type { ServerResponse, IncomingMessage } from 'node:http'

const ZEN_ENDPOINT = 'https://opencode.ai/zen/v1/chat/completions'

function aiDevProxy(): Plugin {
  return {
    name: 'ai-dev-proxy',
    configureServer(server) {
      server.middlewares.use(async (req: IncomingMessage, res: ServerResponse, next) => {
        if (!req.url?.startsWith('/api/ai') || req.method !== 'POST') {
          next()
          return
        }

        let body = ''
        req.on('data', (c) => (body += c))
        req.on('end', async () => {
          const { apiKey, model, messages, maxTokens } = JSON.parse(body || '{}')
          if (!apiKey || !model || !messages?.length) {
            res.statusCode = 400
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Missing apiKey, model, or messages' }))
            return
          }

          const upstream = await fetch(ZEN_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
              model,
              messages,
              max_tokens: maxTokens ?? 2048,
              temperature: 0.7,
            }),
          })

          res.statusCode = upstream.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(await upstream.json().catch(() => ({}))))
        })
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), tailwindcss(), aiDevProxy()],
})
