import { useReportStore } from '../../store/reportStore'
import { Textarea } from '../UI/Textarea'

export function ThemeEditor() {
  const theme = useReportStore((s) => s.report.eventInfo.theme)
  const updateEventInfo = useReportStore((s) => s.updateEventInfo)
  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-text-muted">
        A single, central thematic statement shown on its own page.
      </p>
      <Textarea
        label="Theme Statement"
        value={theme}
        onChange={(e) => updateEventInfo({ theme: e.target.value })}
        placeholder="e.g. Remembering the Pain, Honouring the Resilience, Inspiring a Peaceful Tomorrow"
        rows={4}
      />
    </div>
  )
}
