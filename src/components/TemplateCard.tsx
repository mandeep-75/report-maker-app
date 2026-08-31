import { Check, Eye, Plus } from 'lucide-react'
import { ReportTemplate, TemplateCover } from '../data/templates'

export function TemplateCoverPreview({ cover, className }: { cover: TemplateCover; className?: string }) {
  return (
    <div
      className={`relative flex flex-col items-center justify-center overflow-hidden rounded-md p-4 text-center text-white ${className ?? ''}`}
      style={{ backgroundColor: cover.from }}
    >
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative flex w-full flex-1 flex-col items-center justify-center gap-3">
        <div className="text-[10px] font-semibold uppercase tracking-[0.2em] opacity-80">Report Cover</div>
        <div className="text-lg font-extrabold uppercase leading-tight tracking-wide">
          {cover.title}
        </div>
        <div className="text-xs font-medium opacity-90">{cover.subtitle}</div>
      </div>
      <div className="relative mt-2 w-full border-t border-white/30 pt-2 text-[10px] font-semibold uppercase tracking-wider">
        {cover.college}
      </div>
    </div>
  )
}

export function TemplateCard({
  template,
  onPreview,
}: {
  template: ReportTemplate
  onPreview: () => void
}) {
  return (
    <button
      onClick={onPreview}
      className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border border-border bg-surface text-left transition-all hover:border-primary"
    >
      <div className="relative aspect-[210/260] p-3">
        <TemplateCoverPreview cover={template.cover} className="h-full w-full" />
        <div className="absolute inset-3 flex items-center justify-center gap-1.5 rounded-md bg-black/55 text-sm font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
          <Eye className="h-4 w-4" /> Click to Preview
        </div>
      </div>
      <div className="flex flex-col gap-2 border-t border-border p-3">
        <div>
          <div className="text-sm font-semibold text-text">{template.name}</div>
          <div className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-text-muted">
            {template.description}
          </div>
        </div>
      </div>
    </button>
  )
}

export function TemplatePreviewModal({
  template,
  onClose,
  onUse,
}: {
  template: ReportTemplate | null
  onClose: () => void
  onUse: () => void
}) {
  if (!template) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-xl md:flex-row">
        <div className="flex items-center justify-center bg-surface-alt p-6 md:w-1/2">
          <TemplateCoverPreview cover={template.cover} className="aspect-[210/297] w-full max-w-[220px]" />
        </div>
        <div className="flex flex-col gap-4 p-6 md:w-1/2">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-primary">
              {template.category}
            </div>
            <h3 className="mt-1 text-lg font-bold text-text">{template.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-muted">{template.description}</p>
          </div>
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-muted">
              Includes
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {template.included.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-text">
                  <Check className="h-3.5 w-3.5 text-success" /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto flex items-center gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-text hover:bg-surface-alt cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={onUse}
              className="accent-solid flex flex-1 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Use Template
            </button>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute right-3 top-3 text-text-muted hover:text-text cursor-pointer"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
