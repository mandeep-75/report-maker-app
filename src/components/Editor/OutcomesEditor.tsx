import { useReportStore } from '../../store/reportStore'
import { Input } from '../UI/Input'
import { Button } from '../UI/Button'
import { Trash2, Plus } from 'lucide-react'
import { AIStubButton } from './AIStubButton'

export function OutcomesEditor() {
  const outcomes = useReportStore((s) => s.report.outcomes)
  const addOutcome = useReportStore((s) => s.addOutcome)
  const updateOutcome = useReportStore((s) => s.updateOutcome)
  const removeOutcome = useReportStore((s) => s.removeOutcome)

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1">
        {outcomes.length === 0 && (
          <p className="text-sm text-text-muted">No outcomes yet. Add one below.</p>
        )}
        {outcomes.map((o, i) => (
          <div key={i} className="mb-3 flex items-start gap-2">
            <span className="mt-2 text-xs font-medium text-text-muted">{i + 1}.</span>
            <Input
              value={o}
              onChange={(e) => updateOutcome(i, e.target.value)}
              placeholder={`Key outcome ${i + 1}`}
              containerClassName="flex-1 min-w-0"
            />
            <button
              onClick={() => removeOutcome(i)}
              className="mt-1 text-danger hover:text-danger-hover cursor-pointer shrink-0"
              title="Remove"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={addOutcome}>
          <Plus className="h-4 w-4" /> Add Outcome
        </Button>
        <AIStubButton label="Generate with AI" />
      </div>
    </div>
  )
}
