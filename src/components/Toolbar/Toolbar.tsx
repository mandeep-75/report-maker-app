import { useState } from 'react'
import { FileDown, FileText, Save, Loader2, ExternalLink } from 'lucide-react'
import { useReportStore } from '../../store/reportStore'
import { saveProjectFile } from '../../utils/project'
import { exportReport, ExportFormat } from '../../export'
import { useToast } from '../UI/Toast'
import { Button } from '../UI/Button'

export function Toolbar({ onBack }: { onBack?: () => void }) {
  const report = useReportStore((s) => s.report)
  const show = useToast((s) => s.show)
  const [exporting, setExporting] = useState<ExportFormat | null>(null)

  const runExport = async (format: ExportFormat) => {
    if (exporting) return
    setExporting(format)
    try {
      const result = await exportReport(report, format)
      if ('message' in result) {
        show(`Export failed: ${result.message}`, 'error')
      } else if (!result.ok) {
        show('Nothing to export — all sections are hidden.', 'error')
      } else {
        const warnings = result.issues.filter((i) => i.level === 'warning')
        const msg = `${format.toUpperCase()} exported.${warnings.length ? ` (${warnings.length} warning${warnings.length > 1 ? 's' : ''})` : ''}`
        show(msg, warnings.length ? 'info' : 'success')
      }
    } finally {
      setExporting(null)
    }
  }

  const handleSave = () => {
    saveProjectFile(report)
    show('Project saved.', 'success')
  }

  const busy = exporting !== null

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
      <div className="flex items-center gap-2">
        {onBack && (
          <button
            onClick={onBack}
            className="mr-1 flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-alt hover:text-text cursor-pointer"
          >
            ← Back
          </button>
        )}
        <span className="text-sm font-bold tracking-wide text-primary">REPORT MAKER</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Button variant="ghost" size="sm" onClick={handleSave} disabled={busy}>
          <Save className="h-4 w-4" /> Save
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <Button variant="outline" size="sm" onClick={() => runExport('docx')} disabled={busy}>
          {exporting === 'docx' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} DOCX
        </Button>
        <Button variant="primary" size="sm" onClick={() => runExport('pdf')} disabled={busy}>
          {exporting === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />} PDF
        </Button>
        <span className="mx-1 h-5 w-px bg-border" />
        <a
          href="https://www.ilovepdf.com"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-alt hover:text-text cursor-pointer"
          title="Convert, merge or compress your exported files"
        >
          <ExternalLink className="h-4 w-4" /> iLovePDF
        </a>
      </div>
    </header>
  )
}
