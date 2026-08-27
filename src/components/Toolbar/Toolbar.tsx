import { FileDown, FileText, Save } from 'lucide-react'
import { useReportStore } from '../../store/reportStore'
import { exportDocx } from '../../export/docx'
import { exportPdf } from '../../export/pdf'
import { saveProjectFile } from '../../utils/project'
import { useToast } from '../UI/Toast'
import { Button } from '../UI/Button'
import { Toggle } from '../UI/Toggle'

export function Toolbar({ onBack }: { onBack?: () => void }) {
  const report = useReportStore((s) => s.report)
  const compact = useReportStore((s) => s.compact)
  const setCompact = useReportStore((s) => s.setCompact)
  const show = useToast((s) => s.show)

  const handleDocx = async () => {
    try {
      await exportDocx(report)
      show('DOCX exported.', 'success')
    } catch {
      show('DOCX export failed.', 'error')
    }
  }

  const handlePdf = async () => {
    try {
      await exportPdf(report)
      show('PDF exported.', 'success')
    } catch {
      show('PDF export failed.', 'error')
    }
  }

  const handleSave = () => {
    saveProjectFile(report)
    show('Project saved.', 'success')
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-1 flex items-center gap-1 rounded px-2 py-1 text-sm text-text-muted hover:bg-surface-alt hover:text-text cursor-pointer"
          >
            ← Back
          </button>
        )}
        <span className="text-sm font-bold tracking-wide text-primary">REPORT MAKER</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="mr-1 flex items-center gap-2 rounded border border-border px-2 py-1">
          <Toggle checked={compact} onChange={setCompact} />
          <span className="text-xs text-text-muted">Remove empty space</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button variant="outline" size="sm" onClick={handleDocx}>
          <FileText className="h-4 w-4" /> DOCX
        </Button>
        <Button variant="primary" size="sm" onClick={handlePdf}>
          <FileDown className="h-4 w-4" /> PDF
        </Button>
      </div>
    </header>
  )
}
