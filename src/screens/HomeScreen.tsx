import { TemplateBrowser } from '../components/TemplateBrowser'
import { RecentReports } from '../components/RecentReports'
import { RecentMeta } from '../utils/storage'

export function HomeScreen({
  onNew,
  onUseTemplate,
  onOpenRecent,
  onDeleteRecent,
  recent,
}: {
  onNew: () => void
  onUseTemplate: (id: string) => void
  onOpenRecent: (id: string) => void
  onDeleteRecent: (id: string) => void
  recent: RecentMeta[]
}) {
  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto max-w-6xl px-8 py-10">
        <h1 className="text-2xl font-bold text-text">Create professional reports</h1>
        <p className="mt-1 text-sm text-text-muted">
          Start from a ready-made template, fill in your event, and export to PDF or DOCX.
        </p>

        <button
          onClick={onNew}
          className="accent-solid mt-6 flex w-full max-w-xl items-center gap-3 rounded-2xl p-6 text-left text-white shadow-lg transition-opacity hover:opacity-90 cursor-pointer"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-2xl font-bold">
            +
          </div>
          <div>
            <div className="text-lg font-semibold">Create New Report</div>
            <div className="text-sm opacity-90">Start from a blank, fully-structured document</div>
          </div>
        </button>

        <section className="mt-10">
          <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-text-muted">
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

        <section className="mt-14 rounded-2xl border border-border bg-surface p-6">
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
