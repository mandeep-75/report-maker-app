import { useState } from 'react'
import { TEMPLATES, TEMPLATE_FILTERS, TemplateCategory, ReportTemplate } from '../data/templates'
import { TemplateCard, TemplatePreviewModal } from './TemplateCard'
import { cn } from '../utils/cn'

export function TemplateBrowser({ onUse }: { onUse: (id: string) => void }) {
  const [filter, setFilter] = useState<'all' | TemplateCategory>('all')
  const [preview, setPreview] = useState<ReportTemplate | null>(null)

  const list = TEMPLATES.filter((t) => filter === 'all' || t.category === filter)

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {TEMPLATE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cn(
              'rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer',
              filter === f.value
                ? 'bg-primary text-white'
                : 'bg-surface text-text-muted hover:text-text'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {list.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            onUse={() => onUse(t.id)}
            onPreview={() => setPreview(t)}
          />
        ))}
      </div>

      {preview && (
        <TemplatePreviewModal
          template={preview}
          onClose={() => setPreview(null)}
          onUse={() => {
            onUse(preview.id)
            setPreview(null)
          }}
        />
      )}
    </div>
  )
}
