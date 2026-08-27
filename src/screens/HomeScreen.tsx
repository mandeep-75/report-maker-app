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
      </div>
    </div>
  )
}
