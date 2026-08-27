import { Trash2, FileText } from 'lucide-react'
import { RecentMeta } from '../utils/storage'

function timeAgo(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hr ago`
  const days = Math.floor(hrs / 24)
  if (days < 30) return `${days} day${days > 1 ? 's' : ''} ago`
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

export function RecentReports({
  recent,
  onOpen,
  onDelete,
}: {
  recent: RecentMeta[]
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}) {
  if (recent.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center text-sm text-text-muted">
        No reports yet. Create one from a template to see it here.
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {recent.map((r) => (
        <div
          key={r.id}
          className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3 transition-colors hover:border-primary"
        >
          <div className="accent-solid flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white">
            <FileText className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold text-text">{r.name}</div>
            <div className="text-xs text-text-muted">Edited {timeAgo(r.updatedAt)}</div>
          </div>
          <button
            onClick={() => onDelete(r.id)}
            className="rounded p-1.5 text-text-muted hover:bg-surface-alt hover:text-danger cursor-pointer"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onOpen(r.id)}
            className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium text-text hover:bg-surface-alt cursor-pointer"
          >
            Continue →
          </button>
        </div>
      ))}
    </div>
  )
}
