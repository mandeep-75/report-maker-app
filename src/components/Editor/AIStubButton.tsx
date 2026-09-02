import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { Button } from '../UI/Button'
import { generateText } from '../../utils/ai'
import { useSettings } from '../../store/settingsStore'

export function AIStubButton({
  label = 'AI Generate',
  prompt,
  context,
  onResult,
  className,
}: {
  label?: string
  prompt: string
  context?: string
  onResult: (text: string) => void
  className?: string
}) {
  const apiKey = useSettings((s) => s.apiKey)
  const selectedModel = useSettings((s) => s.selectedModel)
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    setLoading(true)
    try {
      const text = await generateText({ apiKey, model: selectedModel, prompt, context })
      onResult(text.trim())
    } catch (err) {
      onResult('')
      alert(err instanceof Error ? err.message : 'AI request failed.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleClick} disabled={loading}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {label}
    </Button>
  )
}
