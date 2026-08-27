import { FileDown, FileText, FolderOpen, Save, FilePlus, Plus } from 'lucide-react'
import { useReportStore } from '../../store/reportStore'
import { exportDocx } from '../../export/docx'
import { exportPdf } from '../../export/pdf'
import { saveProjectFile, openProjectFile } from '../../utils/project'
import { clearAutosave } from '../../utils/storage'
import { useToast } from '../UI/Toast'
import { Button } from '../UI/Button'
import { Toggle } from '../UI/Toggle'

export function Toolbar() {
  const report = useReportStore((s) => s.report)
  const setReport = useReportStore((s) => s.setReport)
  const resetReport = useReportStore((s) => s.resetReport)
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

  const handleOpen = async () => {
    const loaded = await openProjectFile()
    if (loaded) {
      setReport(loaded)
      show('Project opened.', 'success')
    } else {
      show('Invalid project file.', 'error')
    }
  }

  const handleNew = () => {
    if (!window.confirm('Start a new report? Unsaved changes will be lost.')) return
    clearAutosave()
    resetReport()
    show('New report started.', 'success')
  }

  return (
    <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-2.5">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold tracking-wide text-primary">REPORT MAKER</span>
      </div>
      <div className="flex items-center gap-1.5">
        <div className="mr-1 flex items-center gap-2 rounded border border-border px-2 py-1">
          <Toggle checked={compact} onChange={setCompact} />
          <span className="text-xs text-text-muted">Remove empty space</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleNew}>
          <FilePlus className="h-4 w-4" /> New
        </Button>
        <Button variant="ghost" size="sm" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save
        </Button>
        <Button variant="ghost" size="sm" onClick={handleOpen}>
          <FolderOpen className="h-4 w-4" /> Open
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

export function StartScreen({
  templates,
  onChoose,
  onNew,
  onResume,
}: {
  templates: { id: string; name: string; description: string }[]
  onChoose: (id: string) => void
  onNew: () => void
  onResume?: () => void
}) {
  return (
    <div className="flex h-full flex-col items-center overflow-auto bg-surface-alt px-6 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary">REPORT MAKER</h1>
        <p className="mt-2 text-sm text-text-muted">Create a professional event report in minutes</p>
      </div>

      <button
        onClick={onNew}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-md transition-all hover:opacity-90 hover:shadow-lg"
      >
        <Plus className="h-5 w-5" /> New Report
      </button>

      {onResume && (
        <button
          onClick={onResume}
          className="mt-3 text-sm font-medium text-primary hover:underline"
        >
          Resume previous report
        </button>
      )}

      <div className="mt-12 w-full max-w-3xl">
        <h2 className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-text-muted">
          Or start from a template
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => onChoose(t.id)}
              className="group rounded-xl border border-border bg-surface p-5 text-left shadow-sm transition-all hover:border-primary hover:shadow-md"
            >
              <div className="text-base font-semibold text-text group-hover:text-primary">{t.name}</div>
              <p className="mt-2 text-sm leading-relaxed text-text-muted">{t.description}</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                Use this template <FilePlus className="h-4 w-4" />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
