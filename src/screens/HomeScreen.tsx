import { useRef } from 'react'
import { Upload } from 'lucide-react'
import { TemplateBrowser } from '../components/TemplateBrowser'
import { RecentReports } from '../components/RecentReports'
import { RecentMeta } from '../utils/storage'

export function HomeScreen({
  onNew,
  onUseTemplate,
  onOpenRecent,
  onDeleteRecent,
  onImportJson,
  recent,
}: {
  onNew: () => void
  onUseTemplate: (id: string) => void
  onOpenRecent: (id: string) => void
  onDeleteRecent: (id: string) => void
  onImportJson: (text: string) => void
  recent: RecentMeta[]
}) {
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (f: File | undefined | null) => {
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => onImportJson(String(reader.result ?? ''))
    reader.readAsText(f)
  }

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <h1 className="text-2xl font-bold text-text">Create professional reports</h1>
        <p className="mt-1 text-sm text-text-muted">
          Start from a ready-made template, fill in your event, and export to PDF or DOCX.
        </p>

        <div className="mt-6 flex w-full max-w-xl gap-3">
          <button
            onClick={onNew}
            className="accent-solid flex flex-1 items-center gap-3 rounded-2xl p-6 text-left text-white shadow-lg transition-opacity hover:opacity-90 cursor-pointer"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold">
              +
            </div>
            <div>
              <div className="text-lg font-semibold">Create New Report</div>
              <div className="text-sm opacity-90">Start from a blank, fully-structured document</div>
            </div>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-left shadow-lg transition-colors hover:border-primary cursor-pointer"
          >
            <div className="accent-solid flex h-12 w-12 items-center justify-center rounded-xl text-white">
              <Upload className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold text-text">Open Project</div>
              <div className="text-sm text-text-muted">Load a report from a .json file</div>
            </div>
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0])
            e.target.value = ''
          }}
        />

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Templates
          </h2>
          <TemplateBrowser onUse={onUseTemplate} />
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-text-muted">
            Recent Reports
          </h2>
          <RecentReports recent={recent} onOpen={onOpenRecent} onDelete={onDeleteRecent} />
        </section>

        <section className="mt-10 rounded-xl border border-border bg-surface p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-text-muted">
            About the Developer
          </h2>
          <p className="mt-2 text-sm text-text">
            Report Maker was built with care to help educators create polished, professional
            event reports quickly. Made by <span className="font-semibold text-text">Mandeep</span>.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://mandeep-75.github.io/Mandeep.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="accent-solid flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              Portfolio ↗
            </a>
            <a
              href="https://github.com/mandeep-75"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text hover:bg-surface-alt"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.instagram.com/mandeep.xdev/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text hover:bg-surface-alt"
            >
              Instagram ↗
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
