import type { VercelRequest, VercelResponse } from '@vercel/node'

const ZEN_ENDPOINT = 'https://opencode.ai/zen/v1/chat/completions'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const { apiKey, model, messages, maxTokens } = (req.body ?? {}) as {
    apiKey?: string
    model?: string
    messages?: { role: string; content: string }[]
    maxTokens?: number
  }

  if (!apiKey || !model || !messages?.length) {
    res.status(400).json({ error: 'Missing apiKey, model, or messages' })
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

  const data = await upstream.json().catch(() => ({}))
  res.status(upstream.status).json(data)
}
