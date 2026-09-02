import { useReportStore } from '../../store/reportStore'
import { RichTextEditor } from './RichTextEditor'
import { AIStubButton } from './AIStubButton'
import { Button } from '../UI/Button'
import { Eraser } from 'lucide-react'
import { EVENT_SYSTEM, buildEventContext } from './eventContext'

export function SummaryEditor() {
  const report = useReportStore((s) => s.report)
  const summary = report.summary
  const updateSummary = useReportStore((s) => s.updateSummary)
  const context = `${EVENT_SYSTEM}\n\nEvent details:\n${buildEventContext(report.eventInfo)}`
  const event = report.eventInfo.eventName.trim() || 'this event'
  const college = report.eventInfo.collegeName.trim() || 'the institution'
  const theme = report.eventInfo.theme.trim()
  const prompt = `Write the Summary section of a college event report for "${event}" at ${college}.` +
    (theme ? ` The event's theme is "${theme}".` : '') +
    ' Give an overview of what the event was about, who organised it, its purpose, and the main activities that took place.' +
    ' Write 4-6 clear, professional sentences as a single flowing paragraph with no headings or bullets.'
  return (
    <div className="flex h-full flex-col gap-2">
      <RichTextEditor
        value={summary}
        onChange={updateSummary}
        placeholder="Write your event summary..."
        className="flex-1"
      />
      <div className="flex items-center gap-2">
        <AIStubButton label="AI Generate" context={context} prompt={prompt} onResult={updateSummary} />
        <Button variant="ghost" size="sm" onClick={() => updateSummary('')}>
          <Eraser className="h-4 w-4" /> Clear
        </Button>
      </div>
    </div>
  )
}
