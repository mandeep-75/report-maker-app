import { Sparkles } from 'lucide-react'
import { useToast } from '../UI/Toast'
import { Button } from '../UI/Button'

export function AIStubButton({
  label = 'AI Generate',
  className,
}: {
  label?: string
  className?: string
}) {
  const show = useToast((s) => s.show)
  return (
    <Button
      variant="outline"
      size="sm"
      className={className}
      onClick={() => show('AI generation is coming soon.', 'info')}
    >
      <Sparkles className="h-4 w-4" /> {label}
    </Button>
  )
}
