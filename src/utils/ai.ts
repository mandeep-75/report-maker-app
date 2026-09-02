const ZEN_ENDPOINT = 'https://opencode.ai/zen/v1/chat/completions'

interface GenerateOptions {
  apiKey: string
  model: string
  prompt: string
  context?: string
  maxTokens?: number
}

export async function generateText({ apiKey, model, prompt, context, maxTokens = 2048 }: GenerateOptions): Promise<string> {
  if (!apiKey) throw new Error('AI API key not set. Add it in Settings.')

  const messages = [
    ...(context ? [{ role: 'system' as const, content: context }] : []),
    { role: 'user' as const, content: prompt },
  ]

  const res = await fetch(ZEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
      temperature: 0.7,
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err?.error?.message || `AI request failed (${res.status})`)
  }

  const data = await res.json()
  return data.choices?.[0]?.message?.content ?? ''
}
