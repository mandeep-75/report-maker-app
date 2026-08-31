import { useReportStore } from '../../store/reportStore'
import { RichTextEditor } from './RichTextEditor'
import { AIStubButton } from './AIStubButton'
import { Button } from '../UI/Button'
import { Eraser } from 'lucide-react'

export function SummaryEditor() {
  const summary = useReportStore((s) => s.report.summary)
  const updateSummary = useReportStore((s) => s.updateSummary)
  return (
    <div className="flex h-full flex-col gap-2">
      <RichTextEditor
        value={summary}
        onChange={updateSummary}
        placeholder="Write your event summary..."
        className="flex-1"
      />
      <div className="flex items-center gap-2">
        <AIStubButton label="AI Generate" />
        <Button variant="ghost" size="sm" onClick={() => updateSummary('')}>
          <Eraser className="h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  )
}
