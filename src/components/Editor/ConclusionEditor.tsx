import { useReportStore } from '../../store/reportStore'
import { RichTextEditor } from './RichTextEditor'
import { AIStubButton } from './AIStubButton'

export function ConclusionEditor() {
  const conclusion = useReportStore((s) => s.report.conclusion)
  const updateConclusion = useReportStore((s) => s.updateConclusion)
  return (
    <div className="flex h-full flex-col gap-2">
      <RichTextEditor
        value={conclusion}
        onChange={updateConclusion}
        placeholder="Write conclusion..."
        className="flex-1"
      />
      <AIStubButton label="AI Generate" />
    </div>
  )
}
