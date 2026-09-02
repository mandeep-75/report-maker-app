import { useReportStore } from '../../store/reportStore'
import { RichTextEditor } from './RichTextEditor'
import { AIStubButton } from './AIStubButton'
import { EVENT_SYSTEM, buildEventContext } from './eventContext'

export function ConclusionEditor() {
  const report = useReportStore((s) => s.report)
  const conclusion = report.conclusion
  const updateConclusion = useReportStore((s) => s.updateConclusion)
  const context = `${EVENT_SYSTEM}\n\nEvent details:\n${buildEventContext(report.eventInfo)}`
  const event = report.eventInfo.eventName.trim() || 'this event'
  const theme = report.eventInfo.theme.trim()
  const prompt = `Write the Conclusion section of a college event report for "${event}".` +
    (theme ? ` The event's theme was "${theme}".` : '') +
    ' Reflect on the success and impact of the event, the key takeaways for participants, and ' +
    ' a closing note of gratitude and encouragement for future initiatives. Write 3-5 professional ' +
    ' sentences as a single flowing paragraph with no headings or bullets.'
  return (
    <div className="flex h-full flex-col gap-2">
      <RichTextEditor
        value={conclusion}
        onChange={updateConclusion}
        placeholder="Write conclusion..."
        className="flex-1"
      />
      <AIStubButton label="AI Generate" context={context} prompt={prompt} onResult={updateConclusion} />
    </div>
  )
}
