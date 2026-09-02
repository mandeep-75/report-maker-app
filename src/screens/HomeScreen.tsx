import { useRef } from 'react'
import { Plus, Upload, FileText, Heart } from 'lucide-react'
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
        <div className="mb-8">
          <h1 className="text-[26px] font-bold tracking-tight text-text">Create professional reports</h1>
          <p className="mt-1.5 text-sm text-text-muted">
            Start from a ready-made template, fill in your event, and export to PDF or DOCX.
          </p>
        </div>

        <div className="mt-6 flex w-full max-w-xl gap-3">
          <button
            onClick={onNew}
            className="accent-solid flex flex-1 items-center gap-3 rounded-2xl p-6 pl-7 text-left text-primary-foreground shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover hover:opacity-95 active:scale-[0.99] cursor-pointer"
          >
            <div className="flex h-12 w-24 items-center justify-center rounded-xl bg-white/20 text-primary-foreground">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <div className="text-lg font-semibold">Create New Report</div>
              <div className="text-sm opacity-90">Start from a blank, fully-structured document</div>
            </div>
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center gap-3 rounded-2xl border border-border bg-surface p-6 text-left shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-card-hover cursor-pointer"
          >
            <div className="accent-solid flex h-12 w-20 items-center justify-center rounded-xl text-primary-foreground shadow-sm">
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
          <h2 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Templates
          </h2>
          <TemplateBrowser onUse={onUseTemplate} />
        </section>

        <section className="mt-10">
          <h2 className="mb-3.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
            Recent Reports
          </h2>
          <RecentReports recent={recent} onOpen={onOpenRecent} onDelete={onDeleteRecent} />
        </section>

        <section className="mt-10 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-surface to-surface p-6 shadow-card">
          <div className="flex items-center gap-4">
            <div className="accent-solid flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-primary-foreground shadow-sm">
              <FileText className="h-7 w-7" />
            </div>
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 text-base font-semibold text-text">
                <a
                  href="https://www.ilovepdf.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  I love PDF
                </a>
                <Heart className="h-4 w-4 fill-danger text-danger" />
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Pixel-perfect PDF export, straight from your event report — paragraphs,
                tables, images and galleries, all laid out exactly as designed.
                For more PDF tools, visit
                <a
                  href="https://www.ilovepdf.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-text hover:underline"
                >
                  iLovePDF
                </a>.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-xl border border-border bg-surface p-6 shadow-card">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            About the Developer
          </h2>
          <p className="mt-2.5 text-sm leading-relaxed text-text">
            Report Maker was built with care to help educators create polished, professional
            event reports quickly. ꧁ Made by <span className="font-semibold text-text">Mandeep</span> .
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://mandeep-75.github.io/Mandeep.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="accent-solid flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:opacity-90 active:scale-[0.98]"
            >
              Portfolio ↗
            </a>
            <a
              href="https://github.com/mandeep-75"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-alt hover:border-border-dark"
            >
              GitHub ↗
            </a>
            <a
              href="https://www.instagram.com/mandeep.xdev/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-text transition-colors hover:bg-surface-alt hover:border-border-dark"
            >
              Instagram ↗
            </a>
          </div>
        </section>
      </div>
    </div>
  )
}
